import httpx
from fastapi import APIRouter, HTTPException, Query

from app.services.wind import build_wind_response, month_bounds

router = APIRouter(prefix="/api")


@router.get("/health")
async def health():
    return {"status": "ok", "source": "Elexon BMRS Insights API"}


@router.get("/wind")
async def wind(
    month: str = Query("2026-01", pattern=r"^\d{4}-\d{2}$"),
    decision_hour: int = Query(11, ge=0, le=23),
):
    try:
        month_bounds(month)
    except ValueError as exc:
        raise HTTPException(400, "month must be a valid YYYY-MM value") from exc
    try:
        return await build_wind_response(month, decision_hour)
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(502, f"Elexon request failed: {exc}") from exc
