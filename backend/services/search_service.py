"""
Web Search Service using Tavily API.
Provides augmented search results for query enrichment.
"""

from tavily import TavilyClient
from config import settings


def get_tavily_client() -> TavilyClient | None:
    """Get Tavily client, returns None if API key not configured."""
    if not settings.TAVILY_API_KEY:
        return None
    return TavilyClient(api_key=settings.TAVILY_API_KEY)


async def search_web(query: str, max_results: int = 5) -> list[dict]:
    """
    Perform a web search using Tavily API.
    
    Returns a list of results: [{title, url, content}]
    Returns empty list if Tavily is not configured or search fails.
    """
    client = get_tavily_client()
    if not client:
        return []

    try:
        response = client.search(
            query=query,
            max_results=max_results,
            search_depth="basic",
            include_answer=False,
        )

        results = []
        for item in response.get("results", []):
            results.append({
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "content": item.get("content", "")[:500],  # Truncate for token limits
            })

        return results
    except Exception as e:
        print(f"[Tavily Search Error] {e}")
        return []
