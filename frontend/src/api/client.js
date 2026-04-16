/**
 * API Client — REST + WebSocket helpers for Fyora.ai backend.
 */

const API_BASE = '/api';

// ─── REST Helpers ─────────────────────────────────────────────────

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

// Threads
export const fetchThreads = () => request('/threads/');
export const createThread = (title = 'New Chat') =>
  request('/threads/', { method: 'POST', body: JSON.stringify({ title }) });
export const deleteThread = (id) =>
  request(`/threads/${id}`, { method: 'DELETE' });
export const updateThread = (id, title) =>
  request(`/threads/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) });

// Messages
export const fetchMessages = (threadId) =>
  request(`/threads/${threadId}/messages`);

// Documents
export const fetchDocuments = () => request('/documents');
export const deleteDocument = (filename) =>
  request(`/documents/${filename}`, { method: 'DELETE' });

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload-doc`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

// ─── WebSocket Chat ───────────────────────────────────────────────

export function createChatSocket(threadId, handlers) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${window.location.host}/ws/chat/${threadId}`);

  ws.onopen = () => handlers.onOpen?.();

  ws.onmessage = (event) => {
    try {
      const frame = JSON.parse(event.data);
      handlers.onFrame?.(frame);
    } catch {
      console.error('Failed to parse WS message:', event.data);
    }
  };

  ws.onerror = (err) => handlers.onError?.(err);
  ws.onclose = () => handlers.onClose?.();

  return {
    send: (content, webSearch = false) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ content, web_search: webSearch }));
      }
    },
    close: () => ws.close(),
    get readyState() { return ws.readyState; },
  };
}
