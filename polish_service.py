import os
import shutil
from tempfile import NamedTemporaryFile
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, HTMLResponse
import base64

# Import the pipeline and shading engine
from tattoo_polish import TattooPolishPipeline, PolishConfig
from tattoo_shading import TattooShadingEngine
import cv2

app = FastAPI(title="Tattoo Polish Service")

# Instantiate engines ONCE at startup
pipeline = TattooPolishPipeline(PolishConfig())
shading_engine = TattooShadingEngine(target_dpi=300)

HTML_FORM = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tattoo Polish Pipeline (Stage 1)</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 2rem; max-width: 800px; margin: auto; background: #0a0a0a; color: #fff; }
        .upload-area { border: 2px dashed #444; border-radius: 12px; padding: 3rem; text-align: center; cursor: pointer; transition: all 0.2s; background: #1a1a1a; }
        .upload-area:hover { border-color: #666; background: #222; }
        img, svg { max-width: 100%; height: auto; border-radius: 8px; margin-top: 1rem; border: 1px solid #333; background: #ffffff; }
        .hidden { display: none; }
        .results { display: flex; gap: 2rem; margin-top: 2rem; }
        .column { flex: 1; }
        pre { background: #111; padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.9em; border: 1px solid #333; }
        #loader { text-align: center; margin: 2rem 0; font-size: 1.2rem; color: #aaa; }
    </style>
</head>
<body>
    <h1>Tattoo Polish Pipeline</h1>
    <p>Upload a design to see Stage 1 processing (pure black line-art extraction).</p>
    
    <form id="uploadForm" class="upload-area" onclick="document.getElementById('fileInput').click()">
        <p>Click to select an image or drag and drop</p>
        <input type="file" id="fileInput" name="image" class="hidden" accept="image/*" onchange="submitForm()">
    </form>

    <div id="loader" class="hidden">Processing image... Please wait.</div>

    <div id="results" class="results hidden">
        <div class="column">
            <h2>Result (SVG)</h2>
            <div id="svgContainer"></div>
        </div>
        <div class="column">
            <h2>Stats Report</h2>
            <pre id="jsonContainer"></pre>
        </div>
    </div>

    <script>
        async function submitForm() {
            const input = document.getElementById('fileInput');
            if (!input.files.length) return;

            document.getElementById('loader').classList.remove('hidden');
            document.getElementById('results').classList.add('hidden');

            const formData = new FormData();
            formData.append('image', input.files[0]);

            try {
                const response = await fetch('/polish', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                if (data.status === 'success') {
                    document.getElementById('svgContainer').innerHTML = data.svg_content;
                    document.getElementById('jsonContainer').textContent = JSON.stringify(data.report, null, 2);
                    document.getElementById('results').classList.remove('hidden');
                } else {
                    alert('Error processing image');
                }
            } catch (err) {
                console.error(err);
                alert('Server error occurred');
            } finally {
                document.getElementById('loader').classList.add('hidden');
            }
        }
    </script>
</body>
</html>
"""

@app.get("/")
@app.get("/polish")
async def get_form():
    return HTMLResponse(content=HTML_FORM)

@app.post("/polish")
async def polish_endpoint(image: UploadFile = File(...)):
    """
    Accepts an uploaded image, processes it through Stage 1,
    and returns the 1-bit PNG and handoff JSON as a base64/JSON response.
    """
    print("Received upload request")
    # Use safe temp-file handling
    try:
        with NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            shutil.copyfileobj(image.file, tmp)
            tmp_path = tmp.name

        print("Saved to temp file", tmp_path)
        # Read the image via OpenCV
        bgr = cv2.imread(tmp_path, cv2.IMREAD_COLOR)
        if bgr is None:
            print("Invalid image format")
            return JSONResponse({"error": "Invalid image format"}, status_code=400)

        print("Read image, running pipeline...")
        # Run the polish pipeline
        calibrated, report, extras = pipeline.polish(bgr)
        print("Pipeline finished, generating outputs...")

        # Generate outputs in memory (or via temp files if needed, but temp files are easier for existing methods)
        out_png = f"{tmp_path}_polished.png"
        out_svg = f"{tmp_path}_polished.svg"
        
        # Export to temp files
        pipeline.export_png(calibrated, out_png)
        pipeline.export_svg(calibrated, out_svg, report.geometry_flag)
        handoff = pipeline.build_handoff(calibrated, extras, report)

        print("Reading outputs...")
        # Read the PNG back to return as base64
        with open(out_png, "rb") as f:
            png_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        with open(out_svg, "r") as f:
            svg_content = f.read()

        print("Sending response...")
        return {
            "status": "success",
            "report": report.to_dict(),
            "handoff_json": handoff,
            "png_base64": png_b64,
            "svg_content": svg_content
        }

@app.post("/shade-compile")
async def shade_compile_endpoint(
    gemini_shade: UploadFile = File(...),
    master_linework: UploadFile = File(...),
    protected_mask: UploadFile = None
):
    """
    Accepts Gemini greyscale shade image, master linework, and optional protected mask.
    Enforces EDT collision mask, 60% regional density cap, 4-step tonal quantization,
    and runs Lloyd's Voronoi relaxation stippling.
    Returns:
        - png_base64: 1-bit monochome stencil image
        - svg_content: stipple dots and solid black paths
    """
    print("Received shade compilation request")
    tmp_shade_path = None
    tmp_line_path = None
    tmp_prot_path = None
    
    try:
        # Save uploaded images to temp files
        with NamedTemporaryFile(delete=False, suffix=".png") as tmp_shade:
            shutil.copyfileobj(gemini_shade.file, tmp_shade)
            tmp_shade_path = tmp.name = tmp_shade.name

        with NamedTemporaryFile(delete=False, suffix=".png") as tmp_line:
            shutil.copyfileobj(master_linework.file, tmp_line)
            tmp_line_path = tmp_line.name

        # Read images via OpenCV
        gemini_gray = cv2.imread(tmp_shade_path, cv2.IMREAD_GRAYSCALE)
        linework_gray = cv2.imread(tmp_line_path, cv2.IMREAD_GRAYSCALE)

        if gemini_gray is None or linework_gray is None:
            return JSONResponse({"error": "Invalid image inputs"}, status_code=400)

        protected_mask_gray = None
        if protected_mask is not None:
            with NamedTemporaryFile(delete=False, suffix=".png") as tmp_prot:
                shutil.copyfileobj(protected_mask.file, tmp_prot)
                tmp_prot_path = tmp_prot.name
            protected_mask_gray = cv2.imread(tmp_prot_path, cv2.IMREAD_GRAYSCALE)

        # Run pipeline
        shaded_1bit, svg_content = shading_engine.compile_shading(
            gemini_gray, 
            linework_gray, 
            protected_mask_gray
        )

        # Encode 1-bit image to PNG in memory
        _, buffer = cv2.imencode('.png', shaded_1bit)
        png_b64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "status": "success",
            "png_base64": png_b64,
            "svg_content": svg_content
        }

    except Exception as e:
        import traceback
        print("Shading compilation failed:")
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)

    finally:
        # Cleanup temp files
        if tmp_shade_path and os.path.exists(tmp_shade_path):
            os.remove(tmp_shade_path)
        if tmp_line_path and os.path.exists(tmp_line_path):
            os.remove(tmp_line_path)
        if tmp_prot_path and os.path.exists(tmp_prot_path):
            os.remove(tmp_prot_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("polish_service:app", host="0.0.0.0", port=8000, reload=True)
