"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useStore } from "@/store/useStore";
import { cn, formatDate, uid } from "@/lib/utils";
import {
  FileText, Plus, Search, X, Trash2, Download, Eye,
  Filter, ChevronDown, FileCheck2,
} from "lucide-react";
import type { StoredDocument } from "@/types";

const TYPE_LABELS: Record<StoredDocument["type"], string> = {
  guideline: "Guideline",
  application: "Application",
  supporting: "Supporting",
};

export default function DocumentsPage() {
  const router = useRouter();
  const { documents, addDocument, deleteDocument, updateDocument } = useStore();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<StoredDocument["type"] | "all">("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "size">("recent");
  const [preview, setPreview] = useState<StoredDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let list = [...documents];
    if (typeFilter !== "all") list = list.filter((d) => d.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return b.size - a.size;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
    return list;
  }, [documents, typeFilter, search, sortBy]);

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        addDocument({
          id: uid("doc"),
          name: file.name,
          type: "supporting",
          size: file.size,
          uploadedAt: new Date().toISOString(),
          content: String(e.target?.result || ""),
          tags: [],
        });
      };
      reader.readAsText(file);
    });
    setTimeout(() => setUploading(false), 400);
  };

  const download = (doc: StoredDocument) => {
    const blob = new Blob([doc.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalSize = documents.reduce((n, d) => n + d.size, 0);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Documents"]} />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">Documents</h1>
              <p className="text-sm text-ink-mute mt-1">
                {documents.length} file{documents.length === 1 ? "" : "s"} ·{" "}
                {(totalSize / 1024).toFixed(1)} KB stored
              </p>
            </div>
            <button onClick={() => inputRef.current?.click()} className="btn-primary">
              <Plus size={16} /> Upload Document
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".txt,.md"
              hidden
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>

          {/* Toolbar */}
          <div className="card mb-4 p-3 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or tag..."
                className="input pl-9"
              />
            </div>

            <div className="relative">
              <Filter
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="input pl-9 pr-8 appearance-none cursor-pointer"
              >
                <option value="all">All types</option>
                <option value="guideline">Guideline</option>
                <option value="application">Application</option>
                <option value="supporting">Supporting</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input pr-8 appearance-none cursor-pointer"
              >
                <option value="recent">Most recent</option>
                <option value="name">Name A–Z</option>
                <option value="size">Largest first</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
              />
            </div>
          </div>

          {/* List */}
          {documents.length === 0 ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="card p-12 text-center border-dashed border-2 cursor-pointer hover:border-brand-500 hover:bg-brand-50/30 transition-colors"
            >
              <FileCheck2 size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-ink font-medium mb-1">No documents yet</p>
              <p className="text-sm text-ink-mute">
                Click to upload your first document (TXT or MD)
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <Search size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-ink font-medium">No matching documents</p>
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                }}
                className="btn-ghost mt-3"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-head">Name</th>
                      <th className="table-head w-32">Type</th>
                      <th className="table-head w-24">Size</th>
                      <th className="table-head w-40">Uploaded</th>
                      <th className="table-head w-32 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-ink truncate">
                                {doc.name}
                              </p>
                              <p className="text-xs text-ink-mute truncate">
                                {doc.content.slice(0, 60)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <select
                            value={doc.type}
                            onChange={(e) =>
                              updateDocument(doc.id, {
                                type: e.target.value as any,
                              })
                            }
                            className="chip-info cursor-pointer border-0 outline-none"
                          >
                            <option value="guideline">Guideline</option>
                            <option value="application">Application</option>
                            <option value="supporting">Supporting</option>
                          </select>
                        </td>
                        <td className="table-cell text-ink-mute text-xs">
                          {(doc.size / 1024).toFixed(1)} KB
                        </td>
                        <td className="table-cell text-ink-mute text-xs">
                          {formatDate(doc.uploadedAt)}
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setPreview(doc)}
                              className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-ink-mute"
                              title="Preview"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => download(doc)}
                              className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-ink-mute"
                              title="Download"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${doc.name}"?`))
                                  deleteDocument(doc.id);
                              }}
                              className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center text-ink-mute hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Preview modal */}
      {preview && (
        <>
          <div
            onClick={() => setPreview(null)}
            className="fixed inset-0 bg-ink/30 z-40"
          />
          <div className="fixed inset-x-4 top-20 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[700px] bg-white rounded-xl shadow-pop z-50 flex flex-col overflow-hidden">
            <div className="border-b border-line px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-ink">{preview.name}</h3>
                <p className="text-xs text-ink-mute">
                  {(preview.size / 1024).toFixed(1)} KB · {formatDate(preview.uploadedAt)}
                </p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-6 text-sm whitespace-pre-wrap font-mono text-ink-soft">
              {preview.content}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}