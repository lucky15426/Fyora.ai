"""
Document Ingestion Pipeline.
Load → Chunk → Embed → Store in ChromaDB.

Supports: PDF, TXT, DOCX, MD
"""

import os
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    Docx2txtLoader,
)
import chromadb
from config import settings

# Initialize ChromaDB persistent client
chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)

# Get or create the documents collection
collection = chroma_client.get_or_create_collection(
    name="fyora_documents",
    metadata={"hnsw:space": "cosine"},  # Use cosine similarity
)

# Text splitter configuration
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=settings.CHUNK_SIZE,
    chunk_overlap=settings.CHUNK_OVERLAP,
    length_function=len,
    separators=["\n\n", "\n", ". ", " ", ""],
)

# Embeddings model (Local - no API key needed)
embeddings = HuggingFaceEmbeddings(
    model_name=settings.EMBEDDING_MODEL,
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)


def _get_loader(file_path: str):
    """Select the appropriate document loader based on file extension."""
    ext = Path(file_path).suffix.lower()
    loaders = {
        ".pdf": PyPDFLoader,
        ".txt": TextLoader,
        ".md": TextLoader,
        ".docx": Docx2txtLoader,
    }
    loader_class = loaders.get(ext)
    if not loader_class:
        raise ValueError(f"Unsupported file type: {ext}")
    return loader_class(file_path)


async def ingest_document(file_path: str, filename: str) -> int:
    """
    Full ingestion pipeline for a single document.
    
    Steps:
    1. Load the document using the appropriate loader
    2. Split into chunks using RecursiveCharacterTextSplitter
    3. Generate embeddings via OpenAI
    4. Store chunks + embeddings in ChromaDB
    
    Returns the number of chunks created.
    """
    # Step 1: Load document
    loader = _get_loader(file_path)
    documents = loader.load()

    # Step 2: Split into chunks
    chunks = text_splitter.split_documents(documents)

    if not chunks:
        return 0

    # Step 3 & 4: Embed and store in ChromaDB
    texts = [chunk.page_content for chunk in chunks]
    metadatas = [
        {
            "source": filename,
            "chunk_index": i,
            "total_chunks": len(chunks),
        }
        for i in range(len(chunks))
    ]
    ids = [f"{filename}_chunk_{i}" for i in range(len(chunks))]

    # Generate embeddings
    embedding_vectors = embeddings.embed_documents(texts)

    # Upsert into ChromaDB (handles duplicates by ID)
    collection.upsert(
        ids=ids,
        documents=texts,
        embeddings=embedding_vectors,
        metadatas=metadatas,
    )

    return len(chunks)


def get_document_list() -> list[dict]:
    """List all unique documents stored in ChromaDB."""
    try:
        all_metadata = collection.get()["metadatas"]
        if not all_metadata:
            return []

        # Group by source filename
        docs = {}
        for meta in all_metadata:
            source = meta.get("source", "Unknown")
            total = meta.get("total_chunks", 1)
            docs[source] = {"filename": source, "chunk_count": total}

        return list(docs.values())
    except Exception:
        return []


async def delete_document(filename: str) -> bool:
    """
    Remove a document from the RAG system.
    
    Steps:
    1. Delete all chunks from ChromaDB
    2. Delete the raw file from the uploads directory
    """
    try:
        # 1. Delete from ChromaDB
        collection.delete(where={"source": filename})
        
        # 2. Delete from disk
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return True
    except Exception as e:
        print(f"Error deleting document {filename}: {e}")
        return False
