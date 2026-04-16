import { useState, useRef } from 'react';
import { Upload, FileText, X, Check, Loader2 } from 'lucide-react';
import { uploadDocument } from '../api/client';
import { cn } from '../lib/utils';

const ACCEPTED = '.pdf,.txt,.md,.docx';

export default function FileUpload({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null); // { success: bool, message: string }
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const res = await uploadDocument(file);
      setResult({ success: true, message: res.message });
      if (onUploadSuccess) onUploadSuccess(res.document);
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setUploading(false);
      setTimeout(() => setResult(null), 4000);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={uploading}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
          'bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]',
          dragging
            ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
            : 'text-[var(--text-secondary)] hover:border-[var(--border-default)]',
          uploading && 'opacity-60 cursor-wait'
        )}
      >
        {uploading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Upload className="w-3.5 h-3.5" />
        )}
        <span>{uploading ? 'Uploading...' : 'Upload'}</span>
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleUpload(e.target.files?.[0])}
      />

      {/* Result Toast */}
      {result && (
        <div
          className={cn(
            'absolute bottom-full mb-2 left-0 right-0 min-w-[200px]',
            'px-3 py-2 rounded-xl text-xs animate-fade-in',
            'flex items-center gap-2 shadow-lg',
            result.success
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border border-red-500/30 text-red-300'
          )}
        >
          {result.success ? (
            <Check className="w-3.5 h-3.5 flex-shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span className="truncate">{result.message}</span>
        </div>
      )}
    </div>
  );
}
