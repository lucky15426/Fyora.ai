import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { useThreads } from './hooks/useThreads';
import { useChat } from './hooks/useChat';
import { useDocuments } from './hooks/useDocuments';
import { fetchMessages } from './api/client';
import LoadingScreen from './components/LoadingScreen';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { threads, loading: threadsLoading, addThread, removeThread } = useThreads();
  const {
    documents,
    loading: docsLoading,
    removeDocument,
  } = useDocuments();

  // Handle initial loading completion
  useEffect(() => {
    if (!threadsLoading && !docsLoading) {
      // Small delay for cinematic effect
      const timer = setTimeout(() => setInitialLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [threadsLoading, docsLoading]);
  const {
    messages,
    isStreaming,
    status,
    sendMessage,
    setInitialMessages,
  } = useChat(activeThreadId);

  // Load messages when switching threads
  useEffect(() => {
    if (!activeThreadId) return;
    (async () => {
      try {
        const msgs = await fetchMessages(activeThreadId);
        setInitialMessages(msgs);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    })();
  }, [activeThreadId, setInitialMessages]);

  // Auto-select the first thread if none is active
  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);

  const handleNewThread = async () => {
    const thread = await addThread();
    if (thread) {
      setActiveThreadId(thread.id);
    }
  };

  const handleDeleteThread = async (id) => {
    await removeThread(id);
    if (activeThreadId === id) {
      const remaining = threads.filter(t => t.id !== id);
      setActiveThreadId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <AnimatePresence>
        {initialLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="flex w-full h-full"
      >
        <Sidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
          onNewThread={handleNewThread}
          onDeleteThread={handleDeleteThread}
          loading={threadsLoading || docsLoading}
          documents={documents}
          onDeleteDocument={removeDocument}
        />
        <ChatWindow
          messages={messages}
          isStreaming={isStreaming}
          status={status}
          onSendMessage={sendMessage}
          activeThreadId={activeThreadId}
        />
      </motion.div>
    </div>
  );
}
