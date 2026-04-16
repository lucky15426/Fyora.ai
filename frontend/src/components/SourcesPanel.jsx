import { useState } from 'react';
import { FileText, Globe, ChevronDown, ChevronUp, ExternalLink, Link2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SourcesPanel({ sources }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const docSources = sources.filter(s => s.type === 'document');
  const webSources = sources.filter(s => s.type === 'web');

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-[10px] font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-all uppercase tracking-widest group"
      >
        <div className="p-1 rounded bg-[var(--accent)]/10 group-hover:bg-[var(--accent)]/20 transition-colors">
          <Link2 className="w-3 h-3" />
        </div>
        <span>
          {sources.length} Neural Source{sources.length !== 1 ? 's' : ''}
        </span>
        <motion.div
           animate={{ rotate: expanded ? 180 : 0 }}
           transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-3 h-3" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 pt-1">
              {/* Document Sources */}
              {docSources.length > 0 && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-[1px] flex-1 bg-white/5" />
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">
                      Local Intelligence
                    </p>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {docSources.map((s, i) => (
                      <div
                        key={i}
                        className="glass-card flex flex-col gap-2 p-3 rounded-xl border border-white/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <p className="font-bold text-[var(--text-primary)] text-[11px] truncate uppercase tracking-tight">
                            {s.source}
                          </p>
                        </div>
                        <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed line-clamp-2 italic">
                          "{s.text}"
                        </p>
                        {s.score && (
                          <div className="mt-1 flex items-center justify-between">
                            <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden mr-3">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${s.score * 100}%` }}
                                 className="h-full bg-emerald-500/50"
                               />
                            </div>
                            <span className="text-[9px] font-bold text-emerald-400/80">
                              {Math.round(s.score * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Web Sources */}
              {webSources.length > 0 && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-[1px] flex-1 bg-white/5" />
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">
                      Global Search
                    </p>
                    <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <div className="space-y-2">
                    {webSources.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card flex flex-col gap-2 p-3 rounded-xl block group/link border border-white/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Globe className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
                            <p className="font-bold text-[var(--text-primary)] text-[11px] truncate uppercase tracking-tight group-hover/link:text-[var(--accent)] transition-colors">
                              {s.title}
                            </p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover/link:text-white transition-all flex-shrink-0" />
                        </div>
                        <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed line-clamp-2">
                          {s.content}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
