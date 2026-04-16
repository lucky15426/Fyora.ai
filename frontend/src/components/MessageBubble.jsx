import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { cn, formatTime } from '../lib/utils';
import SourcesPanel from './SourcesPanel';
import { motion } from 'framer-motion';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        'flex gap-4 max-w-4xl mx-auto w-full group transition-all duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar Container */}
      <div className="flex-shrink-0 mt-1">
        <div className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg",
          isUser 
            ? "bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30" 
            : "bg-gradient-to-br from-[var(--accent)] to-purple-600 border border-white/10"
        )}>
           {!isUser && <div className="absolute inset-0 blur-md bg-white/20 animate-pulse" />}
           {isUser ? (
             <User className="w-5 h-5 text-emerald-400 relative z-10" />
           ) : (
             <div className="relative z-10">
               <Bot className="w-5 h-5 text-white" />
               <motion.div 
                 animate={{ opacity: [0.4, 1, 0.4] }} 
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute -top-1 -right-1"
               >
                 <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
               </motion.div>
             </div>
           )}
        </div>
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'relative max-w-[85%] flex flex-col',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-[2rem] px-6 py-4 shadow-xl transition-all duration-300',
            isUser
              ? 'bg-[var(--user-bubble)] text-white shadow-[0_4px_20px_rgba(124,92,252,0.25)] rounded-tr-sm'
              : isError
              ? 'bg-red-500/10 border border-red-500/20 text-red-300 shadow-lg shadow-red-500/5 rounded-tl-sm'
              : 'glass border border-white/5 text-[var(--text-primary)] shadow-lg rounded-tl-sm'
          )}
        >
          {/* Header Info (Role/Error) — AI Only */}
          {!isUser && (
            <div className="flex items-center gap-2 mb-2">
               <span className={cn(
                 "text-[9px] font-bold uppercase tracking-[0.2em]",
                 isError ? "text-red-400" : "text-[var(--accent)]"
               )}>
                 {isError ? "Neural Breach" : "Neural Response"}
               </span>
               {isError && <AlertCircle className="w-3 h-3 text-red-400" />}
            </div>
          )}

          {/* Streaming indicator */}
          {message.isStreaming && !message.content && (
            <div className="flex items-center gap-2 py-2">
              <motion.span animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <motion.span animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <motion.span animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            </div>
          )}

          {/* Content */}
          {message.content && (
            <div className={cn(isUser ? 'text-[15px] leading-relaxed' : 'markdown-body text-[15px]')}>
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          )}

          {/* Streaming cursor */}
          {message.isStreaming && message.content && (
            <motion.span 
              animate={{ opacity: [0, 1] }} 
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="inline-block w-2.5 h-4 bg-[var(--accent)] ml-1 align-middle rounded-[2px]" 
            />
          )}

          {/* Sources — AI messages with sources only */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
               <SourcesPanel sources={message.sources} />
            </div>
          )}
        </div>

        {/* Timestamp */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 0.4 }}
           className={cn(
             'text-[10px] mt-2 font-medium tracking-tight px-2',
             isUser ? 'text-right' : 'text-left font-bold uppercase tracking-widest text-[var(--text-muted)]'
           )}
        >
          {isUser ? formatTime(message.created_at) : `Sync Ready • ${formatTime(message.created_at)}`}
        </motion.div>
      </div>
    </motion.div>
  );
}
