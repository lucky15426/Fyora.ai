"""
Conversation Memory Service.
Loads recent messages from the database and formats them 
as LangChain message objects for context injection.
"""

from langchain_core.messages import HumanMessage, AIMessage
from database import get_recent_messages
from config import settings


async def get_conversation_history(thread_id: str) -> list:
    """
    Load the most recent messages from a thread and convert them
    to LangChain message objects for the LLM.
    
    Uses a sliding window approach (last N messages) to prevent
    context window overflow while maintaining conversation coherence.
    """
    messages = await get_recent_messages(
        thread_id, limit=settings.MAX_CONTEXT_MESSAGES
    )

    langchain_messages = []
    for msg in messages:
        if msg["role"] == "user":
            langchain_messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            langchain_messages.append(AIMessage(content=msg["content"]))

    return langchain_messages
