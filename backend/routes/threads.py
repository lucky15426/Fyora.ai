"""
Thread management routes.
CRUD operations for conversation threads.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import ThreadCreate, ThreadUpdate, ThreadResponse
from database import (
    create_thread,
    get_threads,
    get_thread,
    update_thread,
    delete_thread,
)

router = APIRouter(prefix="/threads", tags=["Threads"])


@router.get("/", response_model=list[ThreadResponse])
async def list_threads():
    """Get all threads, ordered by most recent."""
    threads = await get_threads()
    return threads


@router.post("/", response_model=ThreadResponse, status_code=201)
async def create_new_thread(body: ThreadCreate = ThreadCreate()):
    """Create a new conversation thread."""
    thread = await create_thread(title=body.title)
    return thread


@router.get("/{thread_id}", response_model=ThreadResponse)
async def get_single_thread(thread_id: str):
    """Get a specific thread by ID."""
    thread = await get_thread(thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread


@router.patch("/{thread_id}", response_model=ThreadResponse)
async def rename_thread(thread_id: str, body: ThreadUpdate):
    """Update a thread's title."""
    thread = await get_thread(thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    updated = await update_thread(thread_id, body.title)
    return updated


@router.delete("/{thread_id}", status_code=204)
async def remove_thread(thread_id: str):
    """Delete a thread and all its messages."""
    deleted = await delete_thread(thread_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Thread not found")
