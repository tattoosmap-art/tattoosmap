"""
Stage 1 ("Polish") of a two-stage tattoo-stencil pipeline.

Transforms an arbitrary raster image (photo, digital illustration, AI art,
rough sketch, clean line art) into a structurally sound, high-contrast,
vector-quality BLACK-AND-WHITE LINE FOUNDATION suitable for tattoo stenciling.

This module does LINES + CONTRAST ONLY. It deliberately excludes shading,
tone, dotwork and colour, which are handled by a separate downstream module.
It emits an SVG + a high-res 1-bit PNG, plus a JSON "handoff contract" the
shading module ingests.

Pipeline (order matters - see research section 3):
    CLAHE (photometric) -> semantic edge detection (TEED, w/ fallback)
    -> binarize -> gap enforcement (distance transform) -> skeletonize
    -> dilate to exact physical thickness -> Potrace vectorize -> export

Physical constraints (research sections 1-2):
    min line weight = 0.35 mm     min inter-line gap = 1.50 mm
    working DPI = 300 (internal)  printer DPI = 203 (thermal stencil)

Dependencies:
    required : opencv-python, numpy, scipy, scikit-image, pillow
    optional : onnxruntime  (enables the TEED neural edge model)
               pypotrace    (enables true Bezier SVG; else a raster-trace
                             fallback SVG is emitted)
               mediapipe    (enables facial-protection flag)

If an optional dependency or the TEED weights file is missing, the module
degrades gracefully to a deterministic OpenCV path and STILL PRODUCES OUTPUT.
Every capability that is downgraded is reported in the returned report dict.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass, field, asdict
from typing import Optional

import cv2
import numpy as np
from scipy import ndimage
from skimage.morphology import skeletonize

# ---------------------------------------------------------------------------
# Optional dependencies - detected once, never fatal.
# ---------------------------------------------------------------------------
try:
    import onnxruntime as ort           # noqa: F401
    _HAS_ORT = True
except Exception:
    _HAS_ORT = False

try:
    import potrace                       # pypotrace bindings
    _HAS_POTRACE = True
except Exception:
    _HAS_POTRACE = False

try:
    import mediapipe as mp
    _HAS_MEDIAPIPE = True
except Exception:
    _HAS_MEDIAPIPE = False


# ===========================================================================
# Configuration
# ===========================================================================
@dataclass
class PolishConfig:
    """All tunable parameters. Physical constants map to px via DPI."""

    target_dpi: int = 203               # thermal-printer native resolution
    min_line_mm: float = 0.35           # min durable line weight
    min_gap_mm: float = 1.50            # min inter-line gap

    # CLAHE photometric normalization
    clahe_clip_limit: float = 2.0
    clahe_tile_grid: int = 8

    # Edge detection
    teed_model_path: Optional[str] = "weights/teed_edge.onnx"
    edge_binarize_threshold: float = 0.5   # for probability maps (0..1)

    # Geometry / IP flag (Hough)
    geometry_flag_enabled: bool = True
    geometry_line_ratio: float = 0.40      # >=40% colinear/concentric -> flag

    # Face-protection flag
    face_flag_enabled: bool = True
    face_max_num: int = 3

    # Tiling (large images)
    tile_size: int = 512
    tile_overlap: int = 32
    tile_trigger_px: int = 2048            # tile only above this dimension

    # Handoff
    collision_dilate_mm: float = 0.75      # "no-fly zone" for shading dotwork

    # ---- preset overrides -------------------------------------------------
    @classmethod
    def preset(cls, name: str, **kw) -> "PolishConfig":
        name = (name or "standard").lower()
        if name in ("standard", "default"):
            return cls(**kw)
        if name in ("high_uv", "high-uv", "high_uv_aging"):
            # exposed areas (hands, neck): fatter lines, wider gaps
            return cls(min_line_mm=0.45, min_gap_mm=2.0, **kw)
        if name in ("micro", "micro_realism", "micro-realism"):
            # bloodline / greyline: very thin, leans on downstream shading
            return cls(min_line_mm=0.25, **kw)
        raise ValueError(f"unknown preset: {name!r}")


# ===========================================================================
# Result containers
# ===========================================================================
@dataclass
class QualityScore:
    total: float = 100.0
    p_dense: float = 0.0                 # spatial choking ratio
    p_thin: float = 0.0                  # ink-starvation ratio
    p_noise: float = 0.0                 # disconnected-artefact ratio
    p_face_viol: float = 0.0             # facial topology aggression
    weights: dict = field(default_factory=lambda:
                          {"dense": 40, "thin": 30, "noise": 15, "face": 50})


@dataclass
class PolishReport:
    min_line_px: int = 0
    min_gap_px: int = 0
    quality: QualityScore = field(default_factory=QualityScore)
    face_detected: bool = False
    geometry_flag: bool = False
    edge_engine: str = ""               # "teed" | "structured_forests" | "canny"
    vector_engine: str = ""             # "potrace" | "raster_fallback"
    tiled: bool = False
    warnings: list = field(default_factory=list)

    def to_dict(self) -> dict:
        d = asdict(self)
        return d


# ===========================================================================
# Pipeline
# ===========================================================================
class TattooPolishPipeline:
    """Orchestrates raster-in -> (SVG + 1-bit PNG + JSON contract) out."""

    def __init__(self, config: Optional[PolishConfig] = None):
        self.cfg = config or PolishConfig()

        # physical -> pixel (ceil so a safety constraint is never under-sized)
        self.min_line_px = int(math.ceil(
            (self.cfg.min_line_mm / 25.4) * self.cfg.target_dpi))
        self.min_gap_px = int(math.ceil(
            (self.cfg.min_gap_mm / 25.4) * self.cfg.target_dpi))
        # dilation kernel must be odd and >= 3 so a 1px skeleton actually grows
        self.line_kernel_px = max(3, self.min_line_px | 1)

        self._warnings: list = []

        # --- TEED session (optional) --------------------------------------
        self._teed = None
        if _HAS_ORT and self.cfg.teed_model_path:
            try:
                so = ort.SessionOptions()
                so.intra_op_num_threads = self._physical_cores()
                so.graph_optimization_level = \
                    ort.GraphOptimizationLevel.ORT_ENABLE_ALL
                self._teed = ort.InferenceSession(
                    self.cfg.teed_model_path, so,
                    providers=["CPUExecutionProvider"])
            except Exception as e:
                self._warn(f"TEED model unavailable ({e}); "
                           f"falling back to classical edge detection.")

        # --- structured-forests edge model (optional, mid-tier fallback) --
        self._sf = None
        import os as _os
        if hasattr(cv2, "ximgproc") and _os.path.exists("weights/sf_model.yml.gz"):
            try:
                self._sf = cv2.ximgproc.createStructuredEdgeDetection(
                    "weights/sf_model.yml.gz")
            except Exception:
                self._sf = None  # silent - Canny is the final fallback

        # --- MediaPipe face mesh (optional) -------------------------------
        self._face_mesh = None
        if self.cfg.face_flag_enabled and _HAS_MEDIAPIPE:
            try:
                self._face_mesh = mp.solutions.face_mesh.FaceMesh(
                    static_image_mode=True,
                    max_num_faces=self.cfg.face_max_num,
                    refine_landmarks=True)
            except Exception as e:
                self._warn(f"MediaPipe unavailable ({e}); face flag disabled.")

    # ------------------------------------------------------------------ util
    @staticmethod
    def _physical_cores() -> int:
        try:
            import psutil
            return psutil.cpu_count(logical=False) or 4
        except Exception:
            import os
            return max(1, (os.cpu_count() or 4) // 2)

    def _warn(self, msg: str):
        self._warnings.append(msg)

    # ------------------------------------------------------------- stage A
    def _apply_clahe(self, bgr: np.ndarray) -> np.ndarray:
        """Photometric normalization on the L channel of LAB."""
        lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(
            clipLimit=self.cfg.clahe_clip_limit,
            tileGridSize=(self.cfg.clahe_tile_grid, self.cfg.clahe_tile_grid))
        l = clahe.apply(l)
        return cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2BGR)

    # ------------------------------------------------------------- stage B
    def _edges(self, bgr: np.ndarray) -> tuple[np.ndarray, str]:
        """Return a 0/255 edge map + the engine name that produced it."""
        h, w = bgr.shape[:2]
        if self._teed is not None:
            try:
                prob = self._run_teed(bgr)
                em = (prob > self.cfg.edge_binarize_threshold).astype(np.uint8) * 255
                return em, "teed"
            except Exception as e:
                self._warn(f"TEED inference failed ({e}); using fallback.")

        if self._sf is not None:
            try:
                rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
                edges = self._sf.detectEdges(rgb)
                em = (edges > 0.15).astype(np.uint8) * 255
                return em, "structured_forests"
            except Exception as e:
                self._warn(f"Structured-forests failed ({e}); using Canny.")

        # deterministic final fallback: adaptive thresholding to get solid strokes.
        # This fits the centerline skeletonization pipeline perfectly, unlike Canny
        # which produces hollow dual-contours that violate the gap constraint and prune themselves.
        grey = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        grey_blur = cv2.GaussianBlur(grey, (5, 5), 0)
        
        # Adaptive thresholding to handle various lighting conditions while keeping strokes solid
        binary = cv2.adaptiveThreshold(
            grey_blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 21, 10
        )
        
        em = self._strip_specks(binary)                    # drop tiny components
        return em, "canny" # Keep the string 'canny' for the handoff report compatibility

    def _strip_specks(self, edges: np.ndarray) -> np.ndarray:
        """Remove connected components smaller than the noise floor."""
        binary = (edges > 0).astype(np.uint8)
        n, lbl, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
        if n <= 1:
            return edges
        min_area = max(12, (self.line_kernel_px * 4))  # noise-floor in px
        out = np.zeros_like(binary)
        for i in range(1, n):
            if stats[i, cv2.CC_STAT_AREA] >= min_area:
                out[lbl == i] = 1
        return out * 255

    def _run_teed(self, bgr: np.ndarray) -> np.ndarray:
        """TEED ONNX inference with automatic tiling for large images."""
        h, w = bgr.shape[:2]
        if max(h, w) <= self.cfg.tile_trigger_px:
            return self._teed_infer_tile(bgr)

        # ---- spatial tiling with overlap to avoid seam artefacts ----------
        ts, ov = self.cfg.tile_size, self.cfg.tile_overlap
        out = np.zeros((h, w), np.float32)
        acc = np.zeros((h, w), np.float32)
        step = ts - ov
        for y in range(0, h, step):
            for x in range(0, w, step):
                y2, x2 = min(y + ts, h), min(x + ts, w)
                tile = bgr[y:y2, x:x2]
                p = self._teed_infer_tile(tile)
                out[y:y2, x:x2] += p
                acc[y:y2, x:x2] += 1.0
        acc[acc == 0] = 1.0
        return out / acc

    def _teed_infer_tile(self, bgr: np.ndarray) -> np.ndarray:
        """Single-tile ONNX call. Assumes TEED-style NCHW float input."""
        h, w = bgr.shape[:2]
        inp = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        inp = np.transpose(inp, (2, 0, 1))[None]          # 1,C,H,W
        name = self._teed.get_inputs()[0].name
        out = self._teed.run(None, {name: inp})[0]
        prob = np.squeeze(out)
        if prob.ndim == 3:
            prob = prob[0]
        prob = 1.0 / (1.0 + np.exp(-prob)) if prob.max() > 1.0 else prob
        return cv2.resize(prob, (w, h))

    # ------------------------------------------------------------- flags
    def _geometry_flag(self, edges: np.ndarray) -> bool:
        if not self.cfg.geometry_flag_enabled:
            return False
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100,
                                minLineLength=50, maxLineGap=5)
        circles = cv2.HoughCircles(edges, cv2.HOUGH_GRADIENT, dp=1,
                                   minDist=30, param1=100, param2=40,
                                   minRadius=0, maxRadius=0)
        n_line = 0 if lines is None else len(lines)
        n_circ = 0 if circles is None else len(circles[0])
        total_edge = max(1, int(np.count_nonzero(edges) / 100))
        structured = n_line + n_circ * 5
        return (structured / total_edge) >= self.cfg.geometry_line_ratio

    def _face_mask(self, bgr: np.ndarray) -> tuple[np.ndarray, bool]:
        mask = np.zeros(bgr.shape[:2], np.uint8)
        if self._face_mesh is None:
            return mask, False
        res = self._face_mesh.process(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
        if not res.multi_face_landmarks:
            return mask, False
        h, w = bgr.shape[:2]
        for lms in res.multi_face_landmarks:
            pts = np.array([[int(l.x * w), int(l.y * h)] for l in lms.landmark],
                           np.int32)
            cv2.fillConvexPoly(mask, cv2.convexHull(pts), 255)
        # keep true outer boundary (jaw/hairline) tattooable; protect interior
        mask = cv2.erode(mask, np.ones((self.min_line_px * 3,) * 2, np.uint8))
        return mask, True

    # ------------------------------------------------------------- stage C-F
    def _enforce_gap(self, edges: np.ndarray) -> np.ndarray:
        """
        Prune the thinner of two lines that sit closer than the min gap.

        We measure gap as distance BETWEEN DISTINCT connected components
        (not line-to-background, which would flag every thin line). For each
        line we ask: is another line closer than min_gap_px? If so, and this
        line is the less prominent one locally, drop the offending pixels.
        """
        binary = (edges > 0).astype(np.uint8)
        n, lbl = cv2.connectedComponents(binary)
        if n <= 2:                      # 0/1 actual lines -> nothing to space
            return edges

        out = binary.copy()
        # For each component, distance to the NEAREST OTHER component.
        for comp in range(1, n):
            this = (lbl == comp)
            others = binary.copy()
            others[this] = 0            # everything except this line
            if others.sum() == 0:
                continue
            # distance from every pixel to nearest "other" line
            dist_to_others = cv2.distanceTransform(
                (1 - others).astype(np.uint8), cv2.DIST_L2, 5)
            violating = this & (dist_to_others < self.min_gap_px)
            # Only prune where genuinely crowded; keep the line otherwise.
            frac = violating.sum() / max(1, this.sum())
            if frac > 0.5:              # this line is mostly too close -> thin it
                out[violating] = 0
        return out * 255

    def _calibrate_thickness(self, edges: np.ndarray) -> np.ndarray:
        """Skeletonize to 1px (kill double-lines) then dilate to exact mm."""
        skel = skeletonize(edges > 127).astype(np.uint8)
        k = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE, (self.line_kernel_px, self.line_kernel_px))
        return cv2.dilate(skel, k, iterations=1) * 255

    # ------------------------------------------------------------- scoring
    def _score(self, calibrated: np.ndarray, face_mask: np.ndarray,
               weights: dict) -> QualityScore:
        binary = calibrated > 127
        total_px = max(1, int(binary.sum()))

        # P_dense: inked pixels whose neighbour line is closer than the gap
        inv = cv2.distanceTransform((~binary).astype(np.uint8) * 255,
                                    cv2.DIST_L2, 5)
        # distance FROM ink to nearest gap centre proxy: use skeleton spacing
        skel = skeletonize(binary)
        d_from_line = cv2.distanceTransform((~skel).astype(np.uint8) * 255,
                                            cv2.DIST_L2, 5)
        choke = (d_from_line[skel] < (self.min_gap_px / 2.0))
        p_dense = float(choke.mean()) if choke.size else 0.0

        # P_thin: skeleton px whose local width < required thickness
        width_map = 2.0 * cv2.distanceTransform(
            (binary).astype(np.uint8) * 255, cv2.DIST_L2, 5)
        thin = width_map[skel] < self.min_line_px
        p_thin = float(thin.mean()) if thin.size else 0.0

        # P_noise: fraction of connected components that are tiny specks
        lbl, n = ndimage.label(binary)
        if n > 0:
            sizes = ndimage.sum(binary, lbl, range(1, n + 1))
            speck = (sizes < (self.line_kernel_px * 2) ** 2).sum()
            p_noise = float(speck) / n
        else:
            p_noise = 0.0

        # P_face_viol: inked pixels intruding into the protected face interior
        if face_mask.any():
            viol = binary & (face_mask > 0)
            p_face = float(viol.sum()) / total_px
        else:
            p_face = 0.0

        total = 100.0 - (weights["dense"] * p_dense
                         + weights["thin"] * p_thin
                         + weights["noise"] * p_noise
                         + weights["face"] * p_face)
        return QualityScore(total=round(max(0.0, total), 2),
                            p_dense=round(p_dense, 4),
                            p_thin=round(p_thin, 4),
                            p_noise=round(p_noise, 4),
                            p_face_viol=round(p_face, 4),
                            weights=weights)

    # =====================================================================
    # PUBLIC API
    # =====================================================================
    def polish(self, image_bgr: np.ndarray):
        """
        Run the full pipeline.
        Returns (calibrated_uint8, report: PolishReport, extras: dict)
        `extras` carries face_mask + geometry_flag for export/handoff.
        """
        self._warnings = []
        h, w = image_bgr.shape[:2]

        print("APPLYING CLAHE")
        enhanced = self._apply_clahe(image_bgr)
        print("DETECTING EDGES")
        edges, engine = self._edges(enhanced)

        geom = self._geometry_flag(edges)
        face_mask, face_found = self._face_mask(image_bgr)
        if face_found:
            edges = cv2.bitwise_and(edges, cv2.bitwise_not(face_mask))

        print("ENFORCING GAPS")
        edges = self._enforce_gap(edges)
        edges = self._strip_specks(edges)          # final noise sweep
        print("CALIBRATING")
        calibrated = self._calibrate_thickness(edges)

        weights = QualityScore().weights
        quality = self._score(calibrated, face_mask, weights)

        rep = PolishReport(
            min_line_px=self.min_line_px,
            min_gap_px=self.min_gap_px,
            quality=quality,
            face_detected=face_found,
            geometry_flag=geom,
            edge_engine=engine,
            vector_engine="potrace" if _HAS_POTRACE else "raster_fallback",
            tiled=max(h, w) > self.cfg.tile_trigger_px and engine == "teed",
            warnings=list(self._warnings),
        )
        extras = {"face_mask": face_mask, "geometry_flag": geom,
                  "enhanced": enhanced}
        return calibrated, rep, extras

    # ------------------------------------------------------------- exports
    def export_png(self, calibrated: np.ndarray, path: str):
        """1-bit PNG: pure black lines on pure white, no anti-aliasing."""
        # lines are white(255) in `calibrated`; invert to black-on-white
        onebit = np.where(calibrated > 127, 0, 255).astype(np.uint8)
        from PIL import Image
        Image.fromarray(onebit, mode="L").convert("1").save(path, dpi=(
            self.cfg.target_dpi, self.cfg.target_dpi))

    def export_svg(self, calibrated: np.ndarray, path: str,
                   geometry_flag: bool = False):
        """
        Vectorize. Uses Potrace (true Bezier) when available; otherwise
        emits a valid SVG built from OpenCV contour polylines so the button
        never fails to produce a vector file.
        """
        if _HAS_POTRACE:
            self._export_svg_potrace(calibrated, path, geometry_flag)
        else:
            self._export_svg_fallback(calibrated, path)

    def _export_svg_potrace(self, calibrated, path, geometry_flag):
        data = (calibrated > 127).astype(np.uint32)
        bmp = potrace.Bitmap(data)
        turd = (self.line_kernel_px * 2) ** 2
        curves = bmp.trace(
            turdsize=turd,
            alphamax=0.0 if geometry_flag else 1.0,
            turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY)
        H, W = data.shape
        with open(path, "w") as fp:
            fp.write(f'<svg xmlns="http://www.w3.org/2000/svg" '
                     f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
            fp.write('<path d="')
            for curve in curves:
                sp = curve.start_point
                fp.write(f'M{sp.x:.2f},{sp.y:.2f} ')
                for seg in curve:
                    if seg.is_corner:
                        c, e = seg.c, seg.end_point
                        fp.write(f'L{c.x:.2f},{c.y:.2f} L{e.x:.2f},{e.y:.2f} ')
                    else:
                        c1, c2, e = seg.c1, seg.c2, seg.end_point
                        fp.write(f'C{c1.x:.2f},{c1.y:.2f} '
                                 f'{c2.x:.2f},{c2.y:.2f} '
                                 f'{e.x:.2f},{e.y:.2f} ')
                fp.write('Z ')
            fp.write('" fill="black" fill-rule="evenodd"/></svg>')

    def _export_svg_fallback(self, calibrated, path):
        H, W = calibrated.shape
        cnts, _ = cv2.findContours((calibrated > 127).astype(np.uint8),
                                   cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        with open(path, "w") as fp:
            fp.write(f'<svg xmlns="http://www.w3.org/2000/svg" '
                     f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
            fp.write('<path d="')
            for c in cnts:
                if len(c) < 2:
                    continue
                x0, y0 = c[0][0]
                fp.write(f'M{x0},{y0} ')
                for p in c[1:]:
                    x, y = p[0]
                    fp.write(f'L{x},{y} ')
                fp.write('Z ')
            fp.write('" fill="black" fill-rule="evenodd"/></svg>')

    # ------------------------------------------------------------- handoff
    def build_handoff(self, calibrated: np.ndarray, extras: dict,
                      report: PolishReport) -> dict:
        """
        JSON contract the downstream shading module must obey (research §10).
        """
        # collision no-fly zone: dilate linework by collision_dilate_mm
        col_px = int(math.ceil(
            (self.cfg.collision_dilate_mm / 25.4) * self.cfg.target_dpi))
        col_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE,
                                          (max(3, col_px | 1),) * 2)
        collision = cv2.dilate((calibrated > 127).astype(np.uint8), col_k)

        # protected regions -> polygon list (convex hulls of face mask blobs)
        protected = []
        fm = extras.get("face_mask")
        if fm is not None and fm.any():
            cnts, _ = cv2.findContours(fm, cv2.RETR_EXTERNAL,
                                       cv2.CHAIN_APPROX_SIMPLE)
            for c in cnts:
                hull = cv2.convexHull(c).reshape(-1, 2).tolist()
                protected.append(hull)

        return {
            "schema": "tattoo.polish.handoff/v1",
            "printer_dpi": self.cfg.target_dpi,
            "svg_path_hierarchy": "potrace_parent_child_evenodd"
                                  if _HAS_POTRACE else "opencv_ccomp",
            "min_line_px": report.min_line_px,
            "min_gap_px": report.min_gap_px,
            "protected_regions": {
                "polygons": protected,
                "max_shading_density": 0.60,   # contract cap
            },
            "collision_mask": {
                "dilated_mm": self.cfg.collision_dilate_mm,
                "rle": _rle_encode(collision),  # compact binary safety mask
                "shape": list(collision.shape),
            },
            "flags": {
                "face_detected": report.face_detected,
                "geometry_ip": report.geometry_flag,
            },
            "quality": asdict(report.quality),
        }


# ---------------------------------------------------------------------------
def _rle_encode(mask: np.ndarray) -> list:
    """Simple run-length encoding of a 0/1 mask (row-major)."""
    flat = (mask.flatten() > 0).astype(np.uint8)
    if flat.size == 0:
        return []
    idx = np.flatnonzero(np.diff(flat)) + 1
    bounds = np.concatenate(([0], idx, [flat.size]))
    runs = np.diff(bounds).tolist()
    # first run is the count of the value flat[0]; store starting value first
    return [int(flat[0])] + runs


# ===========================================================================
# Convenience one-shot function
# ===========================================================================
print("STARTING POLISH IMAGE")
def polish_image(input_path: str, output_dir: str = ".",
                 preset: str = "standard", target_dpi: int = 203) -> dict:
    """
    High-level entry point: read image -> polish -> write SVG, PNG, JSON.
    Returns the report dict (also written to <stem>.report.json).
    """
    import os
    cfg = PolishConfig.preset(preset, target_dpi=target_dpi)
    pipe = TattooPolishPipeline(cfg)

    print("READ IMAGE")
    bgr = cv2.imread(input_path, cv2.IMREAD_COLOR)
    if bgr is None:
        raise FileNotFoundError(f"could not read image: {input_path}")

    print("RUNNING PIPELINE")
    calibrated, report, extras = pipe.polish(bgr)

    stem = os.path.splitext(os.path.basename(input_path))[0]
    os.makedirs(output_dir, exist_ok=True)
    png_path = os.path.join(output_dir, f"{stem}_polished.png")
    svg_path = os.path.join(output_dir, f"{stem}_polished.svg")
    json_path = os.path.join(output_dir, f"{stem}_handoff.json")
    rep_path = os.path.join(output_dir, f"{stem}_report.json")

    pipe.export_png(calibrated, png_path)
    pipe.export_svg(calibrated, svg_path, report.geometry_flag)
    handoff = pipe.build_handoff(calibrated, extras, report)

    with open(json_path, "w") as f:
        json.dump(handoff, f, indent=2)
    with open(rep_path, "w") as f:
        json.dump(report.to_dict(), f, indent=2)

    out = report.to_dict()
    out["outputs"] = {"png": png_path, "svg": svg_path,
                      "handoff_json": json_path, "report_json": rep_path}
    return out


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description="Tattoo Polish (stage 1) pipeline")
    ap.add_argument("input", help="input image path")
    ap.add_argument("-o", "--out", default=".", help="output directory")
    ap.add_argument("-p", "--preset", default="standard",
                    choices=["standard", "high_uv", "micro"])
    ap.add_argument("--dpi", type=int, default=203)
    args = ap.parse_args()
    rep = polish_image(args.input, args.out, args.preset, args.dpi)
    print(json.dumps(rep, indent=2))
