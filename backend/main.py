"""
Fyora.ai — FastAPI Backend Entry Point.

Main application setup with CORS, lifespan management, 
and router registration.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db
from config import settings
from routes import threads, messages, documents, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: initialize database
    await init_db()
    print("✅ Database initialized")
    print(f"📁 Upload dir: {settings.UPLOAD_DIR}")
    print(f"🧠 ChromaDB dir: {settings.CHROMA_PERSIST_DIR}")
    yield
    # Shutdown: cleanup if needed
    print("👋 Shutting down Fyora.ai")


app = FastAPI(
    title="Fyora.ai",
    description="RAG-powered conversational AI with web search",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static Files (Uploads) ───────────────────────────────────────
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ─── Routes ────────────────────────────────────────────────────────
app.include_router(threads.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(chat.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": "Fyora.ai",
        "version": "1.0.0",
    }
