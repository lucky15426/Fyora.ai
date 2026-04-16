import { cn } from '../lib/utils';
import { Globe } from 'lucide-react';

export default function SearchToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={enabled ? 'Web search enabled' : 'Web search disabled'}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
        enabled
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.15)]'
          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)]'
      )}
    >
      <Globe className={cn('w-3.5 h-3.5', enabled && 'animate-pulse')} />
      <span>Web</span>
    </button>
  );
}
