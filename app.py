from pathlib import Path
import tempfile

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi import Body
from pydantic import BaseModel
import subprocess

from markitdown import MarkItDown

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")
converter = MarkItDown()

class SaveRequest(BaseModel):
    filename: str
    markdown: str


class OpenRequest(BaseModel):
    path: str

DOWNLOAD_DIR = Path.home() / "Downloads"


@app.post("/save")
async def save(req: SaveRequest):

    DOWNLOAD_DIR.mkdir(exist_ok=True)

    path = DOWNLOAD_DIR / req.filename

    path.write_text(
        req.markdown,
        encoding="utf-8"
    )

    return {
        "path": str(path)
    }

@app.post("/open-file")
async def open_file(req: OpenRequest):

    subprocess.Popen([
        "xdg-open",
        req.path
    ])

    return {"success": True}

@app.post("/open-folder")
async def open_folder(req: OpenRequest):

    subprocess.Popen([
        "xdg-open",
        str(Path(req.path).parent)
    ])

    return {"success": True}

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "markdown": "",
            "filename": "output"
        },
    )

@app.post("/convert")
async def convert(file: UploadFile = File(...)):

    suffix = Path(file.filename).suffix

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:

        tmp.write(await file.read())

        tmp_path = tmp.name

    try:

        result = converter.convert(tmp_path)

    finally:

        Path(tmp_path).unlink(missing_ok=True)

    return JSONResponse({

        "filename": Path(file.filename).stem + ".md",

        "markdown": result.text_content

    })