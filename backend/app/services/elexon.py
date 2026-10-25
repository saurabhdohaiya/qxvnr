from typing import Any

import httpx

ELEXON_API = "https://data.elexon.co.uk/bmrs/api/v1"


async def get_records(
    client: httpx.AsyncClient,
    dataset: str,
    params: dict[str, str],
) -> list[dict[str, Any]]:
    response = await client.get(f"{ELEXON_API}/{dataset}", params=params, timeout=45)
    response.raise_for_status()
    body = response.json()
    if isinstance(body, dict):
        records = body.get("data", [])
        return records if isinstance(records, list) else []
    return body if isinstance(body, list) else []
