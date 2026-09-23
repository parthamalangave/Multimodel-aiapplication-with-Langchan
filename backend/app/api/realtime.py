"""Small real-time data endpoints for demonstrations."""

from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter(prefix="/api/realtime", tags=["Real-time data"])


@router.get("/time")
async def current_time() -> dict[str, str]:
    """Return the current UTC time at request time."""
    return {
        "source": "server clock",
        "utc": datetime.now(timezone.utc).isoformat(),
    }
