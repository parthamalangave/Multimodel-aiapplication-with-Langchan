"""Main FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import health, chat, multimodal, upload, realtime
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("multimodal_assistant")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context for startup and shutdown procedures."""
    logger.info("Starting Multimodal AI Assistant Backend...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Ollama Target URL: {settings.ollama_base_url}")
    yield
    logger.info("Shutting down Multimodal AI Assistant Backend...")


# Initialize FastAPI application
app = FastAPI(
    title="Multimodal AI Assistant API",
    description="A local, free-to-run multimodal AI assistant backend powered by Ollama and local models.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global safe exception handler - prevents leaking internal stack traces (Rule 9)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Capture unexpected internal exceptions and return safe, sanitized error response."""
    logger.error(f"Unhandled error processing request {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your request.",
            "status_code": 500,
        },
    )


# Mount routers
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(multimodal.router)
app.include_router(upload.router)
app.include_router(realtime.router)


@app.get("/", tags=["Root"])
async def root() -> dict:
    """Root endpoint welcoming clients and directing to documentation."""
    return {
        "message": "Welcome to Multimodal AI Assistant API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0",
    }
