import { useState, useEffect, useCallback, useRef } from 'react';
import { createChatSocket } from '../api/client';

/**
 * Custom hook for WebSocket chat connection.
 * Manages connection lifecycle, message streaming, and source aggregation.
 */
export function useChat(threadId) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState('');
  const [sources, setSources] = useState([]);
  const socketRef = useRef(null);
  const streamBufferRef = useRef('');

  // Connect/reconnect when thread changes
  useEffect(() => {
    if (!threadId) return;

    const handlers = {
      onOpen: () => setStatus(''),
      onFrame: (frame) => {
        switch (frame.type) {
          case 'status':
            setStatus(frame.data);
            break;

          case 'sources':
            setSources(frame.data || []);
            break;

          case 'token':
            streamBufferRef.current += frame.data;
            // Update the last assistant message with streaming content
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant' && last.isStreaming) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: streamBufferRef.current },
                ];
              }
              return prev;
            });
            break;

          case 'title_update':
            // Emit custom event for sidebar to pick up
            window.dispatchEvent(
              new CustomEvent('thread-title-update', {
                detail: { threadId, title: frame.data },
              })
            );
            break;

          case 'done':
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === 'assistant' && last.isStreaming) {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...last,
                    content: frame.data,
                    isStreaming: false,
                    sources: [...(sources || [])],
                  },
                ];
              }
              return prev;
            });
            setIsStreaming(false);
            setStatus('');
            streamBufferRef.current = '';
            break;

          case 'error':
            setMessages(prev => [
              ...prev,
              {
                role: 'assistant',
                content: `⚠️ Error: ${frame.data}`,
                isError: true,
                created_at: new Date().toISOString(),
              },
            ]);
            setIsStreaming(false);
            setStatus('');
            streamBufferRef.current = '';
            break;

          default:
            break;
        }
      },
      onError: () => {
        setStatus('Connection error');
        setIsStreaming(false);
      },
      onClose: () => {
        setStatus('');
      },
    };

    socketRef.current = createChatSocket(threadId, handlers);

    return () => {
      socketRef.current?.close();
    };
  }, [threadId]);

  const sendMessage = useCallback(
    (content, webSearch = false) => {
      if (!socketRef.current || isStreaming) return;

      // Add user message
      const userMsg = {
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };

      // Add placeholder assistant message for streaming
      const assistantMsg = {
        role: 'assistant',
        content: '',
        isStreaming: true,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      setSources([]);
      streamBufferRef.current = '';

      socketRef.current.send(content, webSearch);
    },
    [isStreaming]
  );

  const setInitialMessages = useCallback((msgs) => {
    setMessages(
      msgs.map(m => ({
        ...m,
        sources: m.sources_json ? JSON.parse(m.sources_json) : [],
      }))
    );
  }, []);

  return {
    messages,
    isStreaming,
    status,
    sources,
    sendMessage,
    setInitialMessages,
  };
}
