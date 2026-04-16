import { useState, useEffect, useCallback } from 'react';
import { fetchThreads, createThread, deleteThread } from '../api/client';

/**
 * Custom hook for thread CRUD operations with optimistic updates.
 */
export function useThreads() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadThreads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchThreads();
      setThreads(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Listen for title updates from WebSocket
  useEffect(() => {
    const handler = (e) => {
      const { threadId, title } = e.detail;
      setThreads(prev =>
        prev.map(t => (t.id === threadId ? { ...t, title } : t))
      );
    };
    window.addEventListener('thread-title-update', handler);
    return () => window.removeEventListener('thread-title-update', handler);
  }, []);

  const addThread = useCallback(async () => {
    try {
      const newThread = await createThread();
      setThreads(prev => [newThread, ...prev]);
      return newThread;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const removeThread = useCallback(async (id) => {
    // Optimistic removal
    setThreads(prev => prev.filter(t => t.id !== id));
    try {
      await deleteThread(id);
    } catch (err) {
      // Revert on failure
      loadThreads();
      setError(err.message);
    }
  }, [loadThreads]);

  return { threads, loading, error, addThread, removeThread, refresh: loadThreads };
}
