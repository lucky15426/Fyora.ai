"""
Document upload and management routes.
Handles file upload, RAG ingestion, and document listing.
"""

import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import UploadResponse, DocumentResponse
from rag.ingestion import ingest_document, get_document_list, delete_document
from config import settings

router = APIRouter(tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}


def _validate_file(filename: str) -> str:
    """Validate file extension and return it."""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )
    return ext


@router.post("/upload-doc", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document for RAG ingestion.
    Supports: PDF, TXT, DOCX, MD
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    _validate_file(file.filename)

    # Save uploaded file to disk
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # Run ingestion pipeline
    try:
        chunk_count = await ingest_document(file_path, file.filename)
    except ValueError as e:
        # Clean up file on ingestion error
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {e}")

    return UploadResponse(
        message=f"Successfully ingested '{file.filename}' ({chunk_count} chunks)",
        document=DocumentResponse(
            filename=file.filename,
            chunk_count=chunk_count,
        ),
    )


@router.get("/documents", response_model=list[DocumentResponse])
async def list_documents():
    """List all ingested documents."""
    docs = get_document_list()
    return [DocumentResponse(**doc) for doc in docs]


@router.delete("/documents/{filename}")
async def delete_document_route(filename: str):
    """Delete a document from RAG context and disk."""
    success = await delete_document(filename)
    if not success:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {filename}")
    return {"message": f"Successfully deleted '{filename}'"}
