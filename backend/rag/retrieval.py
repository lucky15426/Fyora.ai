"""
RAG Retrieval Module.
Queries ChromaDB for relevant document chunks based on user query.
"""

from typing import Optional
from langchain_huggingface import HuggingFaceEmbeddings
from rag.ingestion import collection
from config import settings

# Reuse the same local embeddings model
embeddings = HuggingFaceEmbeddings(
    model_name=settings.EMBEDDING_MODEL,
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)


async def retrieve_relevant_chunks(
    query: str, top_k: Optional[int] = None
) -> list[dict]:
    """
    Retrieve the top-k most relevant document chunks for a given query.
    
    Steps:
    1. Embed the user query using OpenAI embeddings
    2. Query ChromaDB for nearest neighbors (cosine similarity)
    3. Return chunks with metadata and relevance scores
    
    Returns a list of dicts: {text, source, chunk_index, score}
    """
    if top_k is None:
        top_k = settings.RAG_TOP_K

    # Check if collection has any documents
    if collection.count() == 0:
        return []

    # Step 1: Embed the query
    query_embedding = embeddings.embed_query(query)

    # Step 2: Query ChromaDB
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    # Step 3: Format results
    chunks = []
    if results and results["documents"] and results["documents"][0]:
        for i, doc in enumerate(results["documents"][0]):
            metadata = results["metadatas"][0][i] if results["metadatas"] else {}
            distance = results["distances"][0][i] if results["distances"] else 0

            # Convert cosine distance to similarity score (1 - distance)
            similarity = 1 - distance

            chunks.append({
                "text": doc,
                "source": metadata.get("source", "Unknown"),
                "chunk_index": metadata.get("chunk_index", 0),
                "score": round(similarity, 4),
            })

    return chunks
