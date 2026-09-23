"""Automated test suite for backend health and root endpoints."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Verify that GET /health returns 200 OK and expected structure."""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Multimodal AI Assistant Backend"
    assert "version" in data
    assert "environment" in data
    assert "timestamp" in data
    assert "models_configured" in data

    models = data["models_configured"]
    assert "text" in models
    assert "vision" in models
    assert "embedding" in models


def test_root_endpoint():
    """Verify that GET / returns 200 OK and valid links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["docs"] == "/docs"
    assert data["health"] == "/health"


def test_not_found_endpoint():
    """Verify that unknown routes return 404."""
    response = client.get("/api/unknown_endpoint")
    assert response.status_code == 404
