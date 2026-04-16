"""
Async SQLite database layer.
Uses raw aiosqlite for lightweight async operations.
Tables: threads, messages.
"""

import aiosqlite
import uuid
from datetime import datetime, timezone
from config import settings

DB_PATH = settings.DATABASE_PATH


def _now() -> str:
    """Return current UTC timestamp as ISO string."""
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid.uuid4())


async def init_db():
    """Create tables if they don't exist."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS threads (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT 'New Chat',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                thread_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                content TEXT NOT NULL,
                sources_json TEXT DEFAULT '[]',
                created_at TEXT NOT NULL,
                FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
            )
        """)
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_messages_thread 
            ON messages(thread_id, created_at)
        """)
        await db.execute("PRAGMA foreign_keys = ON")
        await db.execute("PRAGMA journal_mode = WAL")
        await db.commit()


# ─── Thread Operations ────────────────────────────────────────────

async def create_thread(title: str = "New Chat") -> dict:
    now = _now()
    thread_id = _uuid()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO threads (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (thread_id, title, now, now),
        )
        await db.commit()
    return {"id": thread_id, "title": title, "created_at": now, "updated_at": now}


async def get_threads() -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM threads ORDER BY updated_at DESC"
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def get_thread(thread_id: str) -> dict | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM threads WHERE id = ?", (thread_id,)
        ) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None


async def update_thread(thread_id: str, title: str) -> dict | None:
    now = _now()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE threads SET title = ?, updated_at = ? WHERE id = ?",
            (title, now, thread_id),
        )
        await db.commit()
    return await get_thread(thread_id)


async def delete_thread(thread_id: str) -> bool:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA foreign_keys = ON")
        cursor = await db.execute(
            "DELETE FROM threads WHERE id = ?", (thread_id,)
        )
        await db.commit()
        return cursor.rowcount > 0


async def touch_thread(thread_id: str):
    """Update the updated_at timestamp of a thread."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE threads SET updated_at = ? WHERE id = ?",
            (_now(), thread_id),
        )
        await db.commit()


# ─── Message Operations ───────────────────────────────────────────

async def add_message(
    thread_id: str, role: str, content: str, sources_json: str = "[]"
) -> dict:
    msg_id = _uuid()
    now = _now()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO messages (id, thread_id, role, content, sources_json, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (msg_id, thread_id, role, content, sources_json, now),
        )
        await db.commit()
    # Also touch the parent thread
    await touch_thread(thread_id)
    return {
        "id": msg_id,
        "thread_id": thread_id,
        "role": role,
        "content": content,
        "sources_json": sources_json,
        "created_at": now,
    }


async def get_messages(thread_id: str, limit: int = 100) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT * FROM messages 
               WHERE thread_id = ? 
               ORDER BY created_at ASC 
               LIMIT ?""",
            (thread_id, limit),
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]


async def get_recent_messages(thread_id: str, limit: int = 20) -> list[dict]:
    """Get most recent N messages for conversation memory."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT * FROM (
                   SELECT * FROM messages 
                   WHERE thread_id = ? 
                   ORDER BY created_at DESC 
                   LIMIT ?
               ) sub ORDER BY created_at ASC""",
            (thread_id, limit),
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]
