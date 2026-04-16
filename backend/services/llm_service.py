"""
LLM Service.
Orchestrates the full chat pipeline:
1. Load conversation history
2. Retrieve RAG context (if documents exist)
3. Perform web search (if enabled)
4. Build prompt and stream response from OpenAI
"""

import json
from typing import AsyncGenerator
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from config import settings
from services.memory_service import get_conversation_history
from services.search_service import search_web
from rag.retrieval import retrieve_relevant_chunks
from rag.prompts import build_system_prompt
from database import add_message, update_thread


# Initialize the LLM with streaming enabled
llm = ChatGroq(
    model=settings.LLM_MODEL,
    groq_api_key=settings.GROQ_API_KEY,
    streaming=True,
    temperature=0.7,
)


async def generate_title(content: str) -> str:
    """Generate a short title for a thread based on the first message."""
    try:
        title_llm = ChatGroq(
            model=settings.LLM_MODEL,
            groq_api_key=settings.GROQ_API_KEY,
            temperature=0.3,
            max_tokens=30,
        )
        response = await title_llm.ainvoke([
            SystemMessage(content="Generate a concise 3-6 word title for a conversation that starts with this message. Return ONLY the title, no quotes or punctuation."),
            HumanMessage(content=content),
        ])
        return response.content.strip()[:60]
    except Exception:
        return content[:40] + "..." if len(content) > 40 else content


async def stream_chat_response(
    thread_id: str,
    user_message: str,
    web_search_enabled: bool = False,
) -> AsyncGenerator[dict, None]:
    """
    Full chat pipeline with streaming response.
    
    Yields JSON-serializable dicts with structure:
    - {type: "status", data: "searching..."} — status updates
    - {type: "sources", data: [...]}          — document/web sources
    - {type: "token", data: "word"}           — streaming tokens
    - {type: "done", data: "...full text..."}  — final complete message
    - {type: "error", data: "error message"}  — errors
    """
    try:
        # Save user message to DB
        await add_message(thread_id, "user", user_message)

        # Auto-generate title from first message if thread is new
        from database import get_messages
        all_msgs = await get_messages(thread_id)
        if len(all_msgs) == 1:  # This is the first message
            title = await generate_title(user_message)
            await update_thread(thread_id, title)
            yield {"type": "title_update", "data": title}

        # Step 1: Retrieve conversation history for memory
        yield {"type": "status", "data": "Recalling conversation..."}
        history = await get_conversation_history(thread_id)

        # Step 2: RAG retrieval
        yield {"type": "status", "data": "Searching documents..."}
        rag_chunks = await retrieve_relevant_chunks(user_message)

        # Step 3: Optional web search
        web_results = []
        if web_search_enabled:
            yield {"type": "status", "data": "Searching the web..."}
            web_results = await search_web(user_message)

        # Collect and send sources
        sources = []
        if rag_chunks:
            for chunk in rag_chunks:
                sources.append({
                    "type": "document",
                    "source": chunk["source"],
                    "text": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
                    "score": chunk["score"],
                })
        if web_results:
            for result in web_results:
                sources.append({
                    "type": "web",
                    "title": result["title"],
                    "url": result["url"],
                    "content": result["content"][:200],
                })

        if sources:
            yield {"type": "sources", "data": sources}

        # Step 4: Build prompt
        system_prompt = build_system_prompt(
            context_chunks=rag_chunks if rag_chunks else None,
            web_results=web_results if web_results else None,
        )

        # Compose messages: system + history + current query
        messages = [SystemMessage(content=system_prompt)]
        messages.extend(history)
        messages.append(HumanMessage(content=user_message))

        # Step 5: Stream LLM response
        yield {"type": "status", "data": "Thinking..."}
        full_response = ""

        async for chunk in llm.astream(messages):
            token = chunk.content
            if token:
                full_response += token
                yield {"type": "token", "data": token}

        # Step 6: Save assistant response to DB
        sources_json = json.dumps(sources) if sources else "[]"
        await add_message(thread_id, "assistant", full_response, sources_json)

        yield {"type": "done", "data": full_response}

    except Exception as e:
        yield {"type": "error", "data": str(e)}
