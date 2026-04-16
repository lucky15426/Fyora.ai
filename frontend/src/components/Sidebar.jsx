import { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  loading,
  documents = [],
  onDeleteDocument,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 288 }}
      className={cn(
        'h-screen flex flex-col border-r transition-colors duration-300 relative z-20',
        'bg-[var(--bg-secondary)] border-[var(--border-subtle)] overflow-hidden'
      )}
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[rgba(124,92,252,0.03)] to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-[var(--border-subtle)] relative z-10">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2.5"
            >
              <div className="relative">
                <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                <div className="absolute inset-0 blur-md bg-[var(--accent)] opacity-20" />
              </div>
              <span className="font-bold text-sm tracking-[0.15em] uppercase italic">
                Fyora<span className="text-[var(--accent)]">.ai</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-2 rounded-xl transition-all duration-200',
            'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-white',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4 relative z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewThread}
          className={cn(
            'w-full flex items-center gap-3 py-3 rounded-2xl transition-all duration-300',
            'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm',
            'shadow-[0_8px_24px_rgba(124,92,252,0.2)] hover:shadow-[0_12px_32px_rgba(124,92,252,0.4)]',
            collapsed ? 'justify-center px-0' : 'px-5'
          )}
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                New Thread
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 relative z-10">
        {!collapsed && (
          <h3 className="px-3 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">
            Recent Activity
          </h3>
        )}
        
        {threads.map((thread) => (
          <motion.div
            layout
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            onMouseEnter={() => setHoveredId(thread.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              'group flex items-center gap-3 py-3 rounded-xl cursor-pointer transition-all duration-200',
              collapsed ? 'justify-center px-0' : 'px-4',
              thread.id === activeThreadId
                ? 'bg-[var(--bg-active)] border border-[var(--border-active)] shadow-lg'
                : 'hover:bg-[var(--bg-hover)] border border-transparent'
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              thread.id === activeThreadId ? "bg-[var(--accent)] scale-100" : "bg-transparent scale-0",
              "transition-all duration-300 mr-[-4px]"
            )} />
            
            <MessageSquare className={cn(
              "w-4 h-4 flex-shrink-0 transition-colors duration-200",
              thread.id === activeThreadId ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
            )} />

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs truncate font-medium",
                    thread.id === activeThreadId ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                  )}>
                    {thread.title}
                  </p>
                </div>
                {hoveredId === thread.id && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteThread(thread.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Documents List */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-t border-[var(--border-subtle)] mt-2 bg-black/20 relative z-10"
          >
            <div className="px-5 py-4 flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                Neural Context
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--accent)] font-bold border border-[var(--border-subtle)]">
                {documents.length}
              </span>
            </div>
            <div className="px-3 space-y-1 pb-4 max-h-[180px] overflow-y-auto custom-scrollbar">
              {documents.length === 0 ? (
                <p className="px-4 py-3 text-[10px] text-[var(--text-muted)] italic leading-relaxed">
                  No documents in active memory.
                </p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.filename}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200 border border-transparent hover:border-[var(--border-subtle)]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500/30 group-hover:text-emerald-400 transition-colors" />
                    <span className="text-[11px] truncate flex-1 font-medium">{doc.filename}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.filename);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-all duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-black/40 relative z-10">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
            Project Fyora
          </p>
          <div className="flex items-center gap-1.5 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[8px] text-[var(--text-secondary)] font-bold tracking-tighter uppercase">
              Core v1.0.4 Online
            </span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
