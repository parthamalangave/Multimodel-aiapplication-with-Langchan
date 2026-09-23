"""Chat API router handling text conversations with local models."""

from datetime import datetime, timezone
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.chains.chat_chain import chat_chain, ChatChain
from app.config import settings

logger = logging.getLogger("multimodal_assistant.api.chat")

router = APIRouter(prefix="/api", tags=["Chat"])


class ChatMessage(BaseModel):
    """Schema for individual message in conversation history."""
    role: str = Field(..., examples=["user", "assistant", "system"])
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    """Payload schema for chat completion requests."""
    message: str = Field(..., min_length=1, examples=["What are the principles of multimodal AI?"])
    history: Optional[List[ChatMessage]] = Field(default=[], examples=[[]])
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)


class ChatResponse(BaseModel):
    """Schema for text AI completions."""
    response: str
    model: str
    timestamp: str
    status: str = "success"


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def generate_chat_response(request: ChatRequest) -> ChatResponse:
    """Generate conversational AI response using local Qwen model via LangChain."""
    user_prompt = request.message.strip()
    if not user_prompt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty or whitespace only.",
        )

    try:
        # Convert history to dictionary format expected by ChatChain
        history_dicts = [
            {"role": msg.role, "content": msg.content}
            for msg in (request.history or [])
        ]

        # Use customized temperature chain if requested, otherwise default singleton
        chain_to_use = (
            ChatChain(temperature=request.temperature)
            if request.temperature != 0.7
            else chat_chain
        )

        ai_response = await chain_to_use.ainvoke(
            user_input=user_prompt,
            history=history_dicts,
        )

        return ChatResponse(
            response=ai_response,
            model=settings.text_model,
            timestamp=datetime.now(timezone.utc).isoformat(),
            status="success",
        )

    except Exception as exc:
        logger.error(f"Error during chat generation: {exc}", exc_info=True)
        # Avoid leaking internal error details while providing meaningful guidance
        err_message = str(exc)
        if "connection" in err_message.lower() or "connect" in err_message.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Local AI model service (Ollama) is temporarily unavailable. Please verify Ollama is running.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating the AI response.",
        )
