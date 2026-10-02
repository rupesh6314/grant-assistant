"use client";

import { useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UploadDropzone({
  label, help, required, onFile, fileName, onClear,
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

  if (fileName) {
    return (
      <div className="border border-line rounded-xl p-4 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">{fileName}</p>
            <p className="text-xs text-ink-mute">Ready to analyze</p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-ink-mute hover:text-red-500 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) readFile(f);
      }}
      className={cn(
        "border-2 border-dashed rounded-xl p-6 text-center transition-colors",
        dragging ? "border-brand-500 bg-brand-50" : "border-line bg-slate-50/50 hover:border-brand-500/50"
      )}
    >
      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
        <Upload size={22} />
      </div>
      <p className="text-sm text-ink font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <p className="text-xs text-ink-mute mb-4">{help}</p>
      <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary">
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