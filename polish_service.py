import os
import shutil
from tempfile import NamedTemporaryFile
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, HTMLResponse
import base64

# Import the pipeline from the local script
from tattoo_polish import TattooPolishPipeline, PolishConfig
import cv2

app = FastAPI(title="Tattoo Polish Service")

# Instantiate the pipeline ONCE at startup to avoid reloading models per request
pipeline = TattooPolishPipeline(PolishConfig())

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

    finally:
        # Cleanup temp files
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)
        if 'out_png' in locals() and os.path.exists(out_png):
            os.remove(out_png)
        if 'out_svg' in locals() and os.path.exists(out_svg):
            os.remove(out_svg)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("polish_service:app", host="0.0.0.0", port=8000, reload=True)
