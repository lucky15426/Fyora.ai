"""
RAG Prompt Templates.
Carefully designed to combine retrieved context, web results, 
chat history, and user query into a structured prompt.
"""

SYSTEM_PROMPT = """You are Fyora, an intelligent AI assistant. You provide helpful, accurate, and well-structured answers.

## Instructions:
- Answer the user's question thoroughly and concisely.
- If context from documents is provided, use it to ground your answer and cite the relevant sources.
- If web search results are provided, incorporate them and cite the URLs.
- If you don't know something and no context is provided, say so honestly.
- Format your responses using Markdown for readability (headers, lists, code blocks, etc.).
- Be conversational and helpful.

{context_block}

{web_block}
"""

CONTEXT_TEMPLATE = """## Retrieved Document Context:
The following excerpts were retrieved from the user's uploaded documents. Use them to answer the question.

{context}
"""

WEB_TEMPLATE = """## Web Search Results:
The following results were found via web search. Use them if relevant.

{web_results}
"""


def build_system_prompt(
    context_chunks: list[dict] | None = None,
    web_results: list[dict] | None = None,
) -> str:
    """
    Build the final system prompt by injecting retrieved context 
    and web search results into the template.
    """
    # Build document context block
    context_block = ""
    if context_chunks:
        formatted_chunks = []
        for i, chunk in enumerate(context_chunks, 1):
            source = chunk.get("source", "Unknown")
            text = chunk.get("text", "")
            formatted_chunks.append(
                f"**[Source {i}: {source}]**\n{text}"
            )
        context_block = CONTEXT_TEMPLATE.format(
            context="\n\n---\n\n".join(formatted_chunks)
        )

    # Build web results block
    web_block = ""
    if web_results:
        formatted_web = []
        for i, result in enumerate(web_results, 1):
            title = result.get("title", "")
            url = result.get("url", "")
            snippet = result.get("content", "")
            formatted_web.append(
                f"**[{i}. {title}]({url})**\n{snippet}"
            )
        web_block = WEB_TEMPLATE.format(
            web_results="\n\n".join(formatted_web)
        )

    return SYSTEM_PROMPT.format(
        context_block=context_block,
        web_block=web_block,
    ).strip()
