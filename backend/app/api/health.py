"""Health check router for monitoring service status."""

from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.config import settings

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    """Schema for server health response."""
    status: str = Field(..., examples=["healthy"])
    service: str = Field(..., examples=["Multimodal AI Assistant Backend"])
    version: str = Field(..., examples=["1.0.0"])
    environment: str = Field(..., examples=["development"])
    timestamp: str = Field(...)
    models_configured: dict = Field(...)


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Check health status of the backend service."""
    return HealthResponse(
        status="healthy",
        service="Multimodal AI Assistant Backend",
        version="1.0.0",
        environment=settings.environment,
        timestamp=datetime.now(timezone.utc).isoformat(),
        models_configured={
            "text": settings.text_model,
            "vision": settings.vision_model,
            "embedding": settings.embedding_model,
        },
    )
