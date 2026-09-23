"""Application configuration module using Pydantic Settings."""

from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration management for the Multimodal AI Assistant backend."""

    # Server settings
    backend_host: str = Field(default="0.0.0.0", alias="BACKEND_HOST")
    backend_port: int = Field(default=8000, alias="BACKEND_PORT")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=True, alias="DEBUG")

    # Ollama models
    ollama_base_url: str = Field(default="http://localhost:11434", alias="OLLAMA_BASE_URL")
    text_model: str = Field(default="qwen3.5:4b", alias="TEXT_MODEL")
    vision_model: str = Field(default="qwen3-vl:8b", alias="VISION_MODEL")
    embedding_model: str = Field(default="nomic-embed-text", alias="EMBEDDING_MODEL")

    # Optional cloud provider for presentations or higher-quality responses
    llm_provider: str = Field(default="ollama", alias="LLM_PROVIDER")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", alias="OPENAI_MODEL")

    # Security & CORS
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        alias="CORS_ORIGINS",
    )
    max_upload_size_mb: int = Field(default=25, alias="MAX_UPLOAD_SIZE_MB")

    # Storage paths
    upload_dir: str = Field(default="../data/uploads", alias="UPLOAD_DIR")
    document_dir: str = Field(default="../data/documents", alias="DOCUMENT_DIR")
    vectorstore_dir: str = Field(default="../vectorstore", alias="VECTORSTORE_DIR")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


# Instantiate cached settings singleton
settings = Settings()
