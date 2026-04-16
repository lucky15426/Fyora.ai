"""
WebSocket Chat Route.
Handles real-time streaming chat with the LLM.
Sends structured JSON frames for status, tokens, sources, and completion.
"""

import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.llm_service import stream_chat_response
from database import get_thread

router = APIRouter(tags=["Chat"])


@router.websocket("/ws/chat/{thread_id}")
async def websocket_chat(websocket: WebSocket, thread_id: str):
    """
    WebSocket endpoint for streaming chat.
    
    Client sends: {"content": "user message", "web_search": true/false}
    Server sends structured JSON frames:
        - {"type": "status", "data": "Searching..."}
        - {"type": "sources", "data": [...]}
        - {"type": "token", "data": "word"}
        - {"type": "title_update", "data": "New Title"}
        - {"type": "done", "data": "full response"}
        - {"type": "error", "data": "error message"}
    """
    await websocket.accept()

    # Validate thread exists
    thread = await get_thread(thread_id)
    if not thread:
        await websocket.send_json({"type": "error", "data": "Thread not found"})
        await websocket.close()
        return

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_json(
                    {"type": "error", "data": "Invalid JSON"}
                )
                continue

            content = payload.get("content", "").strip()
            web_search = payload.get("web_search", False)

            # Validate input
            if not content:
                await websocket.send_json(
                    {"type": "error", "data": "Empty message"}
                )
                continue

            if len(content) > 10000:
                await websocket.send_json(
                    {"type": "error", "data": "Message too long (max 10,000 chars)"}
                )
                continue

            # Stream the response
            async for frame in stream_chat_response(
                thread_id=thread_id,
                user_message=content,
                web_search_enabled=web_search,
            ):
                await websocket.send_json(frame)

    except WebSocketDisconnect:
        pass  # Client disconnected, clean exit
    except Exception as e:
        try:
            await websocket.send_json(
                {"type": "error", "data": f"Server error: {str(e)}"}
            )
        except Exception:
            pass
