"""FastAPI entrypoint for Masjid Ustad Daily Food Sponsorship System."""
import logging

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers.admin_routes import router as admin_router
from app.routers.booking_routes import router as booking_router
from app.routers.sponsor_routes import router as sponsor_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

settings = get_settings()
app = FastAPI(title="Masjid Ustad Daily Food Sponsorship System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sponsor_router)
app.include_router(booking_router)
app.include_router(admin_router)

static_dir = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/", include_in_schema=False)
def serve_frontend():
    """Serve frontend application."""

    return FileResponse(static_dir / "index.html")


@app.get("/health", tags=["Health"])
def health_check():
    """Health-check endpoint."""

    return {"status": "ok"}
