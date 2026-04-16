"""
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ─── Thread Schemas ────────────────────────────────────────────────

class ThreadCreate(BaseModel):
    title: str = Field(default="New Chat", max_length=200)


class ThreadUpdate(BaseModel):
    title: str = Field(max_length=200)


class ThreadResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str


# ─── Message Schemas ──────────────────────────────────────────────

class MessageResponse(BaseModel):
    id: str
    thread_id: str
    role: str
    content: str
    sources_json: str = "[]"
    created_at: str


# ─── Chat Schemas ─────────────────────────────────────────────────

class ChatMessage(BaseModel):
    """WebSocket incoming message format."""
    content: str = Field(min_length=1, max_length=10000)
    web_search: bool = False


# ─── Document Schemas ─────────────────────────────────────────────

class DocumentResponse(BaseModel):
    filename: str
    chunk_count: int
    status: str = "ingested"


class UploadResponse(BaseModel):
    message: str
    document: DocumentResponse
