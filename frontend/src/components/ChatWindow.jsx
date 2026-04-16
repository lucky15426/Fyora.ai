import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Command } from 'lucide-react';
import MessageBubble from './MessageBubble';
import SearchToggle from './SearchToggle';
import FileUpload from './FileUpload';
import FloatingLines from './FloatingLines';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWindow({
  messages,
  isStreaming,
  status,
  onSendMessage,
  activeThreadId,
}) {
  const [input, setInput] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // Focus input when thread changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeThreadId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed, webSearch);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Empty state when no thread selected
  if (!activeThreadId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)] relative overflow-hidden">
        {/* Background Gradients & Effects */}
        <div className="absolute inset-0 z-0">
          <FloatingLines 
            enabledWaves={["top", "middle", "bottom"]}
            lineCount={8}
            lineDistance={8}
            bendRadius={8}
            bendStrength={-2}
            interactive
            parallax={true}
            animationSpeed={1.2}
            linesGradient={["#0ccde2", "#6f6f6f", "#6a6a6a"]}
            mixBlendMode="screen"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/80 to-[var(--bg-primary)] z-[1]" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center relative z-10 px-6"
        >
          <div className="relative w-24 h-24 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[var(--accent)] to-purple-600 opacity-20 blur-xl"
            />
            <div className="relative w-full h-full rounded-[2rem] bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center shadow-2xl border border-white/10">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Design your <span className="bg-gradient-to-r from-[var(--accent)] to-purple-400 bg-clip-text text-transparent italic">Future</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm max-w-sm mx-auto leading-relaxed mb-8">
            Fyora.ai is active and ready to assist. Toggle web search for real-time facts or upload documents for personalized RAG intelligence.
          </p>

          <div className="flex items-center justify-center gap-3">
             <div className="px-4 py-2 rounded-xl glass-card text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold flex items-center gap-2">
                <Command className="w-3 h-3" />
                <span>Select a thread</span>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)] min-h-0 relative overflow-hidden">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <FloatingLines 
            enabledWaves={["top", "middle", "bottom"]}
            lineCount={6}
            lineDistance={10}
            bendRadius={10}
            interactive={false}
            parallax={true}
            animationSpeed={0.8}
            linesGradient={["#7c5cfc", "#0ccde2", "#6f6f6f"]}
            mixBlendMode="screen"
        />
      </div>

      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--bg-primary)] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar relative z-20">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-4">
                   <Sparkles className="w-full h-full text-[var(--accent)] opacity-20 absolute inset-0 animate-pulse" />
                   <Sparkles className="w-full h-full text-[var(--accent)] scale-75" />
                </div>
                <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-[0.3em] font-bold">
                  Neural Bridge Established
                </p>
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={msg.id || i} message={msg} />
          ))}
        </AnimatePresence>

        {/* Status Indicator */}
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 max-w-4xl mx-auto pl-4"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-subtle)]">
                <Sparkles className="w-4 h-4 text-[var(--accent)] animate-spin-slow" />
              </div>
              <div className="absolute inset-0 blur-md bg-[var(--accent)] opacity-20 animate-pulse" />
            </div>
            <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-widest">
              {status}
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="px-6 pb-8 pt-2 relative z-30">
        <div className="max-w-4xl mx-auto relative">
          <div className="glass-premium rounded-[2.5rem] p-4 shadow-2xl border border-white/[0.05]">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-3">
                <SearchToggle
                  enabled={webSearch}
                  onToggle={() => setWebSearch(!webSearch)}
                />
                <FileUpload />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] text-[var(--text-secondary)] font-bold tracking-tighter uppercase">Local RAG Active</span>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Fyora..."
                disabled={isStreaming}
                rows={1}
                className={cn(
                  'flex-1 resize-none bg-transparent py-2 px-2 text-sm',
                  'text-[var(--text-primary)] placeholder-[var(--text-muted)]',
                  'focus:outline-none transition-all duration-200',
                  'max-h-48 min-h-[40px]',
                  isStreaming && 'opacity-60'
                )}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 192) + 'px';
                }}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!input.trim() || isStreaming}
                className={cn(
                  'p-3 rounded-2xl transition-all duration-300 flex-shrink-0',
                  input.trim() && !isStreaming
                    ? 'bg-[var(--accent)] text-white shadow-[0_4px_16px_rgba(124,92,252,0.4)]'
                    : 'bg-white/[0.04] text-[var(--text-muted)] cursor-not-allowed'
                )}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-4 text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
            <span>Powered by Llama 3.3</span>
            <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
            <span>Encrypted Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
