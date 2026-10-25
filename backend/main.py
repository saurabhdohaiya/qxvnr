"""Uvicorn entry point retained for local and container commands."""

from app.main import app

__all__ = ["app"]
