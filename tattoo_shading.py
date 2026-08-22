from __future__ import annotations
import cv2
import numpy as np
from scipy.spatial import cKDTree
from PIL import Image

class TattooShadingEngine:
    def __init__(self, target_dpi=300):
        self.target_dpi = target_dpi
        # 0.75 mm in pixels: 0.75 * (DPI / 25.4)
        self.collision_radius_px = int(np.ceil(0.75 * (target_dpi / 25.4)))
        # Target dot size: 0.4 mm in diameter (radius ~0.2 mm)
        self.dot_radius_px = max(1, int(0.2 * (target_dpi / 25.4)))
        self.dot_area = np.pi * (self.dot_radius_px ** 2)

    def compute_edt_mask(self, linework_gray: np.ndarray) -> np.ndarray:
        """
        Computes exact Euclidean Distance Transform (EDT) and returns a binary mask
        where pixels closer than 0.75mm to the linework are 0, and others are 1.
        Assumes linework has black lines (0) on white background (255).
        """
        # Invert: lines become 255, background becomes 0
        inverted = 255 - linework_gray
        # cv2.distanceTransform computes distance from zero pixels to the closest non-zero pixel.
        # We want distance from the lines (which are now 255), so we compute distance on the inverted image
        dist_img = cv2.distanceTransform(255 - inverted, cv2.DIST_L2, 5)
        
        # Create mask: 1 where distance > collision_radius_px, 0 otherwise
        mask = (dist_img > self.collision_radius_px).astype(np.float32)
        return mask

    def apply_density_cap(self, density: np.ndarray, protected_mask: np.ndarray = None) -> np.ndarray:
        """
        Ensures no area exceeds 60% density in protected regions.
        If protected_mask is not provided, it auto-caps density globally at 80% to maintain negative space.
        """
        # Size of 3mm window in pixels: 3.0 * (DPI / 25.4)
        window_size = int(3.0 * (self.target_dpi / 25.4))
        if window_size % 2 == 0:
            window_size += 1

        capped = density.copy()
        
        if protected_mask is not None:
            # Normalize mask to 0..1
            p_mask = (protected_mask > 127).astype(np.float32)
            # Find local density using a box filter
            local_sum = cv2.boxFilter(capped, -1, (window_size, window_size), normalize=True)
            # Where local density > 0.6 and is in a protected region, scale down
            scale = np.ones_like(capped)
            over_limit = (local_sum > 0.6) & (p_mask > 0.5)
            scale[over_limit] = 0.6 / local_sum[over_limit]
            capped = capped * scale
        else:
            # Global soft cap of 80% for normal stippling regions to keep breathing room
            capped = np.minimum(capped, 0.8)

        return np.clip(capped, 0.0, 1.0)

    def quantize_tonal_steps(self, density: np.ndarray) -> np.ndarray:
        """
        Quantizes the continuous density map into 5 discrete steps:
        0% (Pure White), 20% (Highlight), 50% (Mid-tone), 80% (Deep Shadow), 100% (Solid Black)
        """
        quantized = np.zeros_like(density)
        quantized[density >= 0.95] = 1.0
        quantized[(density >= 0.80) & (density < 0.95)] = 0.80
        quantized[(density >= 0.50) & (density < 0.80)] = 0.50
        quantized[(density >= 0.20) & (density < 0.50)] = 0.20
        # Under 20% becomes 0 (Pure White)
        return quantized

    def generate_stipple_points(self, density_quantized: np.ndarray, max_iterations=30) -> np.ndarray:
        """
        Performs Centroidal Voronoi Tessellation (Lloyd's relaxation) to distribute
        stipple points according to the quantized density map.
        Returns an array of point coordinates (y, x).
        """
        # Stipple only in regions with density 20%, 50%, or 80%
        stipple_mask = (density_quantized > 0.0) & (density_quantized < 1.0)
        P = density_quantized * stipple_mask
        
        if not np.any(P):
            return np.empty((0, 2), dtype=np.float32)

        # To speed up KDTree queries, work at a downsampled resolution if image is large
        h, w = P.shape
        scale_factor = 1
        if h > 800 or w > 800:
            scale_factor = 2
            P_lloyd = cv2.resize(P, (w // 2, h // 2), interpolation=cv2.INTER_AREA)
        else:
            P_lloyd = P

        lh, lw = P_lloyd.shape
        
        # Calculate total number of points N based on total density integrated
        # N = Sum(Density) / Area of one dot
        total_density = np.sum(P_lloyd)
        # Scale dot area to downsampled coordinates
        lloyd_dot_area = self.dot_area / (scale_factor ** 2)
        N = int(np.ceil(total_density / lloyd_dot_area))
        
        if N <= 0:
            return np.empty((0, 2), dtype=np.float32)
        
        # Cap N to prevent excessive memory/CPU load
        N = min(N, 25000)

        # Initial point placement using rejection sampling
        coords_y, coords_x = np.where(P_lloyd > 0)
        if len(coords_y) == 0:
            return np.empty((0, 2), dtype=np.float32)
            
        probs = P_lloyd[coords_y, coords_x]
        probs = probs / np.sum(probs)
        
        initial_indices = np.random.choice(len(coords_y), size=min(N, len(coords_y)), replace=False, p=probs)
        pts = np.column_stack((coords_y[initial_indices], coords_x[initial_indices])).astype(np.float32)

        # Pixels with positive density (our domain for relaxation integration)
        domain_y, domain_x = np.where(P_lloyd > 0)
        domain_weights = P_lloyd[domain_y, domain_x]
        domain_coords = np.column_stack((domain_y, domain_x))

        # Run Lloyd's relaxation
        for _ in range(max_iterations):
            if len(pts) == 0:
                break
            # Build KDTree of current points
            tree = cKDTree(pts)
            # Find nearest point index for every pixel in the domain
            _, idxs = tree.query(domain_coords)
            
            # Compute new centroids: weighted mean of pixel coordinates in each Voronoi cell
            w_sum_y = np.bincount(idxs, weights=domain_coords[:, 0] * domain_weights, minlength=len(pts))
            w_sum_x = np.bincount(idxs, weights=domain_coords[:, 1] * domain_weights, minlength=len(pts))
            total_w = np.bincount(idxs, weights=domain_weights, minlength=len(pts))
            
            # Avoid divide by zero
            valid = total_w > 0
            pts[valid, 0] = w_sum_y[valid] / total_w[valid]
            pts[valid, 1] = w_sum_x[valid] / total_w[valid]

        # Rescale points back to original resolution
        pts *= scale_factor
        return pts

    def compile_shading(self, gemini_gray: np.ndarray, linework_gray: np.ndarray, protected_mask: np.ndarray = None) -> tuple[np.ndarray, str]:
        """
        Executes the entire hybrid shading compilation pipeline.
        Returns:
            - 1-bit shaded image (0=Black, 255=White)
            - SVG string containing coordinates of stipple circles and solid black boundaries
        """
        # Ensure correct shape and type
        if len(gemini_gray.shape) == 3:
            gemini_gray = cv2.cvtColor(gemini_gray, cv2.COLOR_BGR2GRAY)
        if len(linework_gray.shape) == 3:
            linework_gray = cv2.cvtColor(linework_gray, cv2.COLOR_BGR2GRAY)

        # Resize gemini_gray to match linework_gray dimensions exactly
        h_line, w_line = linework_gray.shape
        h_gem, w_gem = gemini_gray.shape
        if h_gem != h_line or w_gem != w_line:
            gemini_gray = cv2.resize(gemini_gray, (w_line, h_line), interpolation=cv2.INTER_LINEAR)

        # Normalize Gemini greyscale map to [0.0, 1.0] (0 = White, 1 = Black)
        density = (255.0 - gemini_gray) / 255.0

        # Step 1: EDT Collision Mask
        collision_mask = self.compute_edt_mask(linework_gray)
        density_masked = density * collision_mask

        # Step 2: Protected Regions Cap
        density_capped = self.apply_density_cap(density_masked, protected_mask)

        # Step 3: Quantize Tonal Steps
        density_quant = self.quantize_tonal_steps(density_capped)

        # Step 4: Solid Black and Stipple Mask extraction
        solid_black_mask = (density_quant >= 0.95).astype(np.uint8) * 255
        # Exclude solid black from stippler
        density_quant_stipple = density_quant.copy()
        density_quant_stipple[density_quant >= 0.95] = 0.0

        # Step 5: Lloyd's Voronoi relaxation
        pts = self.generate_stipple_points(density_quant_stipple, max_iterations=25)

        # Step 6: 1-Bit Rasterization
        # Start with a pure white background (255)
        shaded_1bit = np.full_like(linework_gray, 255, dtype=np.uint8)
        
        # Draw solid black regions
        shaded_1bit[solid_black_mask > 0] = 0

        # Draw stipple dots (no anti-aliasing)
        for pt in pts:
            y, x = int(round(pt[0])), int(round(pt[1]))
            # cv2.circle drawing with thickness=-1 draws a filled circle (pure black)
            cv2.circle(shaded_1bit, (x, y), self.dot_radius_px, 0, thickness=-1)

        # Re-apply master linework over everything to preserve the lines absolutely
        # Wherever the master linework is black (0), force output to black (0)
        shaded_1bit[linework_gray < 128] = 0

        # Step 7: SVG Generation
        h, w = linework_gray.shape
        svg_lines = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">',
            '  <!-- Solid Black Regions -->',
        ]
        
        # Extract solid black boundaries as paths
        contours, _ = cv2.findContours(solid_black_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for i, contour in enumerate(contours):
            path_data = []
            for pt in contour:
                x_c, y_c = pt[0][0], pt[0][1]
                if len(path_data) == 0:
                    path_data.append(f"M {x_c} {y_c}")
                else:
                    path_data.append(f"L {x_c} {y_c}")
            if path_data:
                path_data.append("Z")
                svg_lines.append(f'  <path d="{" ".join(path_data)}" fill="#000000" stroke="none" />')

        # Add stipple circles
        svg_lines.append('  <!-- Stipple Points -->')
        for pt in pts:
            y, x = pt[0], pt[1]
            svg_lines.append(f'  <circle cx="{x:.2f}" cy="{y:.2f}" r="{self.dot_radius_px}" fill="#000000" />')
            
        svg_lines.append('</svg>')
        svg_string = "\n".join(svg_lines)

        return shaded_1bit, svg_string

if __name__ == "__main__":
    import argparse
    import os

    parser = argparse.ArgumentParser(description="Tattoo Shading Engine CLI")
    parser.add_argument("shade", help="Path to Gemini greyscale shade image")
    parser.add_argument("linework", help="Path to master linework image")
    parser.add_argument("out_png", help="Path to save 1-bit monochrome PNG")
    parser.add_argument("out_svg", help="Path to save SVG output")
    parser.add_argument("--protected", help="Path to optional protected mask image", default=None)
    parser.add_argument("--dpi", type=int, help="Target DPI", default=300)
    args = parser.parse_args()

    # Load images
    gemini_gray = cv2.imread(args.shade, cv2.IMREAD_GRAYSCALE)
    linework_gray = cv2.imread(args.linework, cv2.IMREAD_GRAYSCALE)
    
    if gemini_gray is None:
        print(f"Error: Could not read shade image from {args.shade}")
        exit(1)
    if linework_gray is None:
        print(f"Error: Could not read linework image from {args.linework}")
        exit(1)

    protected_mask = None
    if args.protected:
        protected_mask = cv2.imread(args.protected, cv2.IMREAD_GRAYSCALE)
        if protected_mask is None:
            print(f"Warning: Could not read protected mask from {args.protected}")

    engine = TattooShadingEngine(target_dpi=args.dpi)
    shaded_1bit, svg_content = engine.compile_shading(gemini_gray, linework_gray, protected_mask)

    # Save outputs
    cv2.imwrite(args.out_png, shaded_1bit)
    with open(args.out_svg, "w") as f:
        f.write(svg_content)
    print("Success")
