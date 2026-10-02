"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";

export default function UploadDropzone({
  label,
  help,
  required,
  onFile,
  fileName,
  onClear,
}: {
  label: string;
  help: string;
  required?: boolean;
  onFile: (text: string, name: string) => void;
  fileName?: string;
  onClear?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onFile(String(e.target?.result || ""), file.name);
    reader.readAsText(file);
  };

  /* ── FILE ALREADY SELECTED ── */
  if (fileName) {
    return (
      <div
        className="rounded-xl p-4 flex items-center justify-between gap-3 border"
        style={{
          background: "var(--bg-surface-2)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "var(--info-soft)",
              color: "var(--info)",
            }}
          >
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{fileName}</p>
            <p className="text-xs text-ink-mute">Ready to analyze</p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--danger-soft)";
            e.currentTarget.style.color = "var(--danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
          title="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  /* ── EMPTY DROPZONE ── */
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) readFile(f);
      }}
      className="rounded-xl p-6 text-center border-2 border-dashed transition-colors"
      style={{
        background: dragging ? "var(--brand-soft)" : "var(--bg-surface-2)",
        borderColor: dragging ? "var(--brand)" : "var(--border-strong)",
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
        style={{
          background: "var(--brand-soft)",
          color: "var(--brand)",
        }}
      >
        <Upload size={22} />
      </div>

      <p className="text-sm text-ink font-medium mb-1">
        {label}{" "}
        {required && <span style={{ color: "var(--danger)" }}>*</span>}
      </p>
      <p className="text-xs text-ink-mute mb-4">{help}</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn-secondary"
      >
        Browse Files
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) readFile(f);
        }}
      />
    </div>
  );
}