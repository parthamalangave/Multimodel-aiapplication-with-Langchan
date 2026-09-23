"""Automated tests for chat API endpoints and LangChain pipeline."""

from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.chains.chat_chain import strip_thinking_blocks

client = TestClient(app)


def test_strip_thinking_blocks():
    """Verify that <think>...</think> reasoning blocks are stripped."""
    raw = "<think>Let me reason: 2+2=4.\nCheck if 4 is prime: no.</think>The answer is 4."
    assert strip_thinking_blocks(raw) == "The answer is 4."


def test_chat_empty_message_validation():
    """Verify that sending empty message returns HTTP 422 Unprocessable Entity."""
    response = client.post("/api/chat", json={"message": ""})
    assert response.status_code == 422


def test_chat_whitespace_message_validation():
    """Verify that whitespace-only message returns HTTP 400 Bad Request."""
    response = client.post("/api/chat", json={"message": "    "})
    assert response.status_code == 400
    assert "cannot be empty" in response.json()["detail"]


def test_chat_invalid_payload():
    """Verify that missing required message field returns 422."""
    response = client.post("/api/chat", json={"not_a_message": "Hello"})
    assert response.status_code == 422


@patch("app.chains.chat_chain.chat_chain.ainvoke", new_callable=AsyncMock)
def test_chat_success_mocked(mock_ainvoke):
    """Verify successful response format and status code."""
    mock_ainvoke.return_value = "Hello! I am your local AI assistant powered by Qwen."

    payload = {
        "message": "Hi, who are you?",
        "history": [
            {"role": "user", "content": "Previous question"},
            {"role": "assistant", "content": "Previous answer"},
        ],
        "temperature": 0.7,
    }

    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["response"] == "Hello! I am your local AI assistant powered by Qwen."
    assert "model" in data
    assert "timestamp" in data
    mock_ainvoke.assert_awaited_once()
