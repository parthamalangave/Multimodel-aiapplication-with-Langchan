"""Core text LLM configuration and initialization using LangChain and Ollama."""

import logging
from functools import lru_cache
from typing import Optional

from langchain_ollama import ChatOllama
from app.config import settings

logger = logging.getLogger("multimodal_assistant.core.llm")


def create_chat_llm(
    temperature: float = 0.7,
    model_name: Optional[str] = None,
    base_url: Optional[str] = None,
    reasoning: bool = False,
) -> ChatOllama:
    """Instantiate a ChatOllama instance with configured model, host, and reasoning/thinking disabled."""
    target_model = model_name or settings.text_model
    target_url = base_url or settings.ollama_base_url

    logger.info(
        f"Initializing ChatOllama model '{target_model}' at '{target_url}' (reasoning/thinking={reasoning})"
    )
    return ChatOllama(
        model=target_model,
        base_url=target_url,
        temperature=temperature,
        reasoning=reasoning,
        num_predict=256,
        keep_alive="10m",
    )


@lru_cache(maxsize=4)
def get_chat_llm(temperature: float = 0.7) -> ChatOllama:
    """Cached singleton provider for ChatOllama to avoid re-instantiation across requests."""
    return create_chat_llm(temperature=temperature, reasoning=False)


@lru_cache(maxsize=4)
def get_openai_llm(temperature: float = 0.7):
    """Create the optional OpenAI provider only when it is selected."""
    from langchain_openai import ChatOpenAI

    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is required when LLM_PROVIDER=openai")

    return ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        temperature=temperature,
        max_tokens=256,
    )


async def check_ollama_liveness() -> bool:
    """Verify that the Ollama service is reachable and responsive."""
    import httpx

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.ollama_base_url}/api/tags")
            return resp.status_code == 200
    except Exception as e:
        logger.warning(f"Ollama liveness check failed: {e}")
        return False
