"""
Message history routes.
Retrieve messages for a given thread.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import MessageResponse
from database import get_messages, get_thread

router = APIRouter(tags=["Messages"])


@router.get(
    "/threads/{thread_id}/messages",
    response_model=list[MessageResponse],
)
async def list_messages(thread_id: str, limit: int = 100):
    """Get all messages in a thread, ordered chronologically."""
    thread = await get_thread(thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    messages = await get_messages(thread_id, limit=limit)
    return messages
