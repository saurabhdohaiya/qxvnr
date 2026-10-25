from __future__ import annotations

import asyncio
from datetime import date, datetime, time, timedelta, timezone
from typing import Any

import httpx

from app.services.elexon import get_records


def number(value: Any) -> float | None:
    try:
        return float(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def time_key(value: Any) -> str | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed.strftime("%Y-%m-%dT%H:%M")
    except ValueError:
        return None


def month_bounds(month: str) -> tuple[date, date]:
    year, month_number = map(int, month.split("-"))
    first = date(year, month_number, 1)
    following = date(year + (month_number == 12), 1 if month_number == 12 else month_number + 1, 1)
    return first, following


def normalize_actuals(rows: list[dict[str, Any]]) -> tuple[dict[str, float], int]:
    half_hours: dict[str, float] = {}
    for row in rows:
        if row.get("fuelType") not in (None, "WIND"):
            continue
        value = number(row.get("generation"))
        key = time_key(row.get("startTime"))
        if value is not None and key:
            half_hours[key] = value

    by_hour: dict[str, list[tuple[int, float]]] = {}
    for stamp, value in half_hours.items():
        parsed = datetime.strptime(stamp, "%Y-%m-%dT%H:%M")
        hour_key = parsed.strftime("%Y-%m-%dT%H:00")
        by_hour.setdefault(hour_key, []).append((parsed.minute, value))

    hourly: dict[str, float] = {}
    for hour_key, values in by_hour.items():
        by_minute = {minute: value for minute, value in values}
        if 0 in by_minute and 30 in by_minute:
            hourly[hour_key] = (by_minute[0] + by_minute[30]) / 2
    return hourly, len(half_hours)


def select_forecasts(
    rows: list[dict[str, Any]],
    start: datetime,
    end: datetime,
    decision_hour: int,
) -> dict[str, dict[str, Any]]:
    selected: dict[str, dict[str, Any]] = {}
    for row in rows:
        target, published = row.get("startTime"), row.get("publishTime")
        if not target or not published or number(row.get("generation")) is None:
            continue
        target_dt = datetime.fromisoformat(str(target).replace("Z", "+00:00"))
        published_dt = datetime.fromisoformat(str(published).replace("Z", "+00:00"))
        cutoff = datetime.combine(target_dt.date() - timedelta(days=1), time(decision_hour), tzinfo=timezone.utc)
        if target_dt < start or target_dt >= end or published_dt > cutoff:
            continue
        key = time_key(target)
        if not key:
            continue
        current = selected.get(key)
        current_published = datetime.fromisoformat(str(current["publishTime"]).replace("Z", "+00:00")) if current else None
        if current_published is None or published_dt > current_published:
            selected[key] = row
    return selected


def accuracy_metrics(points: list[dict[str, Any]], month_days: int) -> dict[str, float | None]:
    paired = [point for point in points if point["actual"] is not None and point["forecast"] is not None]
    if not paired:
        return {"mae": None, "rmse": None, "bias": None, "coverage": None}
    errors = [point["forecast"] - point["actual"] for point in paired]
    count = len(errors)
    return {
        "mae": round(sum(abs(error) for error in errors) / count, 1),
        "rmse": round((sum(error * error for error in errors) / count) ** 0.5, 1),
        "bias": round(sum(errors) / count, 1),
        "coverage": round(count / (24 * month_days) * 100, 1),
    }


async def build_wind_response(month: str, decision_hour: int) -> dict[str, Any]:
    first, following = month_bounds(month)
    start = datetime.combine(first, time.min, tzinfo=timezone.utc)
    end = datetime.combine(following, time.min, tzinfo=timezone.utc)
    query = {"from": start.isoformat().replace("+00:00", "Z"), "to": end.isoformat().replace("+00:00", "Z")}
    forecast_from = (start - timedelta(days=2)).isoformat().replace("+00:00", "Z")
    publish_query = {"publishDateTimeFrom": forecast_from, "publishDateTimeTo": query["to"]}
    actual_query = {
        "settlementDateFrom": first.isoformat(),
        "settlementDateTo": (following - timedelta(days=1)).isoformat(),
        "fuelType": "WIND",
    }

    async with httpx.AsyncClient(headers={"Accept": "application/json"}) as client:
        actual_rows, forecast_rows = await asyncio.gather(
            get_records(client, "datasets/FUELHH/stream", actual_query),
            get_records(client, "datasets/WINDFOR/stream", publish_query),
        )

    actual_by_hour, actual_count = normalize_actuals(actual_rows)
    forecasts = select_forecasts(forecast_rows, start, end, decision_hour)
    points = []
    for key, forecast in sorted(forecasts.items()):
        actual = actual_by_hour.get(key)
        prediction = number(forecast.get("generation"))
        points.append({
            "startTime": forecast.get("startTime"),
            "actual": actual,
            "forecast": prediction,
            "publishTime": forecast.get("publishTime"),
            "error": round(prediction - actual, 2) if actual is not None and prediction is not None else None,
        })

    paired_count = sum(point["actual"] is not None and point["forecast"] is not None for point in points)
    metrics = accuracy_metrics(points, (following - first).days)
    return {
        "month": month,
        "timezone": "UTC",
        "decisionHour": decision_hour,
        "actualCount": actual_count,
        "actualHourCount": len(actual_by_hour),
        "forecastCount": len(forecasts),
        "pairedCount": paired_count,
        "metrics": metrics,
        "points": points,
        "source": "Elexon BMRS Insights API",
        "method": "Latest WINDFOR record published by 11:00 UTC on the day before delivery; matched to FUELHH WIND by half-hour startTime.",
    }
