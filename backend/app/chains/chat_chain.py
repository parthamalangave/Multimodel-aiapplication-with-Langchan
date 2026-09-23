import re
import logging
from typing import List, Dict, Any, Optional

from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
    AIMessage,
    SystemMessage,
)
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.output_parsers import StrOutputParser

from app.core.llm import get_chat_llm, get_openai_llm
from app.config import settings

logger = logging.getLogger("multimodal_assistant.chains.chat")


def strip_thinking_blocks(text: str) -> str:
    """Remove any <think>...</think> reasoning traces from output text."""
    if not text:
        return ""
    cleaned = re.sub(r"<think>[\s\S]*?</think>", "", text, flags=re.DOTALL)
    return cleaned.strip()

DEFAULT_SYSTEM_PROMPT = (
    "You are an intelligent, helpful, and versatile AI assistant. "
    "Provide clear, accurate, and thoughtful responses. Format your output using clean Markdown "
    "with code blocks where appropriate."
)


class ChatChain:
    """Manages conversational flow between users and local Ollama text models."""

    def __init__(
        self,
        system_prompt: str = DEFAULT_SYSTEM_PROMPT,
        temperature: float = 0.7,
    ):
        self.system_prompt = system_prompt
        self.llm = (
            get_openai_llm(temperature=temperature)
            if settings.llm_provider.lower() == "openai"
            else get_chat_llm(temperature=temperature)
        )
        self.output_parser = StrOutputParser()

        # Build prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}"),
        ])

        # Modern LCEL runnable pipeline
        self.chain = self.prompt | self.llm | self.output_parser

    @staticmethod
    def format_history(raw_history: Optional[List[Dict[str, str]]]) -> List[BaseMessage]:
        """Convert list of {role, content} dicts to typed LangChain messages."""
        if not raw_history:
            return []

        formatted: List[BaseMessage] = []
        for msg in raw_history:
            role = msg.get("role", "").lower()
            content = msg.get("content", "")
            if role == "user":
                formatted.append(HumanMessage(content=content))
            elif role == "assistant":
                formatted.append(AIMessage(content=content))
            elif role == "system":
                formatted.append(SystemMessage(content=content))

        return formatted

    async def ainvoke(
        self,
        user_input: str,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """Execute chat chain asynchronously with history context."""
        formatted_history = self.format_history(history)
        logger.info(f"Invoking chat chain with {len(formatted_history)} history messages.")

        result = await self.chain.ainvoke({
            "input": user_input,
            "history": formatted_history,
        })
        return strip_thinking_blocks(result)


# Singleton chat chain instance
chat_chain = ChatChain()
