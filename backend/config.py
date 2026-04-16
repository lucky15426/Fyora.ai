"""
Application configuration — loads all settings from environment variables.
Never hardcode API keys or secrets.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env from backend directory
load_dotenv(Path(__file__).parent / ".env")


class Settings(BaseSettings):
    # --- API Keys ---
    GROQ_API_KEY: str = ""
    TAVILY_API_KEY: str = ""

    # --- Database ---
    DATABASE_PATH: str = str(Path(__file__).parent / "fyora.db")

    # --- ChromaDB ---
    CHROMA_PERSIST_DIR: str = str(Path(__file__).parent / "chroma_db")

    # --- Uploads ---
    UPLOAD_DIR: str = str(Path(__file__).parent / "uploads")

    # --- LLM (Groq) ---
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    
    # --- Embeddings (Local) ---
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    MAX_CONTEXT_MESSAGES: int = 20
    RAG_TOP_K: int = 5
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Sanitization
if settings.GROQ_API_KEY:
    settings.GROQ_API_KEY = settings.GROQ_API_KEY.strip().replace('"', '').replace("'", "")

# Ensure directories exist
os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
