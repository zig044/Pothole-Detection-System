from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import init_db
from .routers import router


app = FastAPI(
    title="Pothole Detection System"
)


# Upload folder
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"


# Make uploaded images accessible from the browser
app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def read_root():
    return {
        "message": "Pothole Detection System is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


app.include_router(router)