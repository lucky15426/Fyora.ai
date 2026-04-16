# 🧠 Fyora.ai — RAG-Powered Conversational Chat

A production-ready ChatGPT-like application with **conversational memory**, **RAG document querying**, **web search augmentation**, and **multi-thread management**.

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![LangChain](https://img.shields.io/badge/LangChain-0.3-green)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│    React 19 + Vite + Tailwind CSS v4                        │
│    ┌───────────┐  ┌────────────┐  ┌───────────────┐        │
│    │  Sidebar   │  │   Chat     │  │  File Upload  │        │
│    │  (Threads) │  │  Window    │  │  (RAG Docs)   │        │
│    └───────────┘  └────────────┘  └───────────────┘        │
└──────────────┬───────────┬──────────────┬───────────────────┘
               │  REST     │  WebSocket   │  REST
               ▼           ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Threads  │  │   Chat   │  │ Messages │  │ Documents  │  │
│  │  CRUD    │  │  Stream  │  │  History │  │   Upload   │  │
│  └──────────┘  └────┬─────┘  └──────────┘  └─────┬──────┘  │
│                     │                              │         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              LLM Orchestration Service                   ││
│  │  Memory → RAG Retrieval → Web Search → Prompt → Stream  ││
│  └────────────┬─────────────┬────────────┬─────────────────┘│
│               │             │            │                   │
│        ┌──────▼──┐   ┌──────▼──┐  ┌──────▼──┐              │
│        │ SQLite  │   │ChromaDB │  │ Tavily  │              │
│        │  (DB)   │   │ (Vecs)  │  │  (Web)  │              │
│        └─────────┘   └─────────┘  └─────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### `threads` table
| Column     | Type | Description                    |
|------------|------|--------------------------------|
| id         | TEXT | UUID primary key               |
| title      | TEXT | Auto-generated from first msg  |
| created_at | TEXT | ISO 8601 timestamp             |
| updated_at | TEXT | Updated on each new message    |

### `messages` table
| Column       | Type | Description                           |
|--------------|------|---------------------------------------|
| id           | TEXT | UUID primary key                      |
| thread_id    | TEXT | FK → threads.id (CASCADE delete)      |
| role         | TEXT | 'user' or 'assistant'                 |
| content      | TEXT | Message content (markdown for AI)     |
| sources_json | TEXT | JSON array of sources used            |
| created_at   | TEXT | ISO 8601 timestamp                    |

**Index**: `idx_messages_thread` on `(thread_id, created_at)` for fast thread history retrieval.

**Why SQLite?** Zero-config, file-based, async via `aiosqlite`, WAL mode for concurrent reads. Perfect for local/single-server deployments. Easy to swap for PostgreSQL.

---

## 🔄 RAG Pipeline

```
                         ┌─────────────────────┐
                         │   Document Upload    │
                         │  (PDF/TXT/MD/DOCX)   │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │     Load Document     │
                         │  (PyPDF/TextLoader)   │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │   Chunk (1000/200)    │
                         │ RecursiveCharSplitter │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │   Embed (OpenAI)      │
                         │ text-embedding-3-small│
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │  Store in ChromaDB    │
                         │  (cosine similarity)  │
                         └──────────────────────┘

   ┌────────────┐    ┌──────────────┐    ┌──────────────────┐
   │ User Query │───▶│ Embed Query  │───▶│ ChromaDB Top-K   │
   └────────────┘    └──────────────┘    │ Similarity Search │
                                          └────────┬─────────┘
                                                   │
          ┌──────────────────────────────────────────┘
          │
          ▼
   ┌──────────────────────────────────────────┐
   │         Prompt Construction              │
   │  System + Context + Web + History + Q    │
   └──────────────────┬───────────────────────┘
                      │
                      ▼
   ┌──────────────────────────────────────────┐
   │     Stream Response (GPT-4o-mini)        │
   │     Token-by-token via WebSocket         │
   └──────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key ([Get it here](https://console.groq.com/))
- Tavily API key (optional, for web search)

### 1. Clone & Setup Backend

```bash
cd backend
# Your .env should contain your GROQ_API_KEY and TAVILY_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Open App

Navigate to `http://localhost:5173`

---

## 🔐 Environment Variables

| Variable          | Required | Description                    |
|-------------------|----------|--------------------------------|
| `GROQ_API_KEY`    | ✅       | Groq Cloud API key             |
| `TAVILY_API_KEY`  | ❌       | Tavily key for web search      |

---

## 📦 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 19, Vite, Tailwind CSS v4     |
| Backend     | FastAPI (async), Python 3.10+       |
| LLM         | Groq (Llama-3.3-70b-versatile)      |
| Embeddings  | HuggingFace (Local: all-MiniLM-L6-v2)|
| Vector DB   | ChromaDB (persistent, local)        |
| Database    | SQLite + aiosqlite (WAL mode)       |
| Web Search  | Tavily API                          |
| Streaming   | WebSocket (JSON frames)             |

---

## ✨ Features

- 💬 **ChatGPT-like UI** — Dark mode, streaming responses, markdown rendering
- 📄 **RAG System** — Upload PDF/TXT/DOCX/MD, automatic chunking & embedding
- 🌐 **Web Search** — Toggle Tavily web search per query
- 🧵 **Multi-thread** — Create, switch, delete conversation threads
- 🧠 **Memory** — Sliding window conversation context (last 20 messages)
- 📊 **Sources** — See which documents/web results informed each answer
- ⚡ **Streaming** — Real-time token-by-token response via WebSocket

---

## 📂 Project Structure

```
fyora.ai/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── config.py             # Environment config
│   ├── database.py           # Async SQLite layer
│   ├── models/schemas.py     # Pydantic models
│   ├── routes/
│   │   ├── chat.py           # WebSocket streaming
│   │   ├── threads.py        # Thread CRUD
│   │   ├── messages.py       # Message history
│   │   └── documents.py      # File upload + RAG ingest
│   ├── services/
│   │   ├── llm_service.py    # LLM orchestration
│   │   ├── memory_service.py # Conversation memory
│   │   └── search_service.py # Web search
│   └── rag/
│       ├── ingestion.py      # Load → chunk → embed → store
│       ├── retrieval.py      # Query → rank → return
│       └── prompts.py        # Prompt templates
└── frontend/
    └── src/
        ├── App.jsx            # Root layout
        ├── api/client.js      # REST + WebSocket client
        ├── hooks/             # useChat, useThreads
        └── components/        # Sidebar, ChatWindow, etc.
```
