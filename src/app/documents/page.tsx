"use client";

import { useMemo, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useStore } from "@/store/useStore";
import { cn, formatDate, uid } from "@/lib/utils";
import {
  FileText,
  Plus,
  Search,
  X,
  Trash2,
  Download,
  Eye,
  Filter,
  ChevronDown,
  FileCheck2,
  Pencil,
} from "lucide-react";
import type { StoredDocument } from "@/types";

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.125rem",
  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  color: "#ffffff",
  fontSize: "0.875rem",
  fontWeight: 600,
  lineHeight: "1.25rem",
  borderRadius: "10px",
  border: "1px solid #2563eb",
  boxShadow:
    "0 4px 14px -3px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "transform 150ms ease, box-shadow 150ms ease",
};

const hoverOn = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = "translateY(-1px)";
  e.currentTarget.style.boxShadow =
    "0 8px 20px -3px rgba(37, 99, 235, 0.55), inset 0 1px 0 rgba(255,255,255,0.2)";
};

const hoverOff = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow =
    "0 4px 14px -3px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
};

export default function DocumentsPage() {
  const documents = useStore((s) => s.documents);
  const addDocument = useStore((s) => s.addDocument);
  const deleteDocument = useStore((s) => s.deleteDocument);
  const updateDocument = useStore((s) => s.updateDocument);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<StoredDocument["type"] | "all">("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "size">("recent");
  const [preview, setPreview] = useState<StoredDocument | null>(null);
  const [editing, setEditing] = useState<StoredDocument | null>(null);
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
    <div className="flex min-h-screen app-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Documents"]} />

        <main className="app-content flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">Documents</h1>
              <p className="text-sm text-ink-mute mt-1">
                {documents.length} file{documents.length === 1 ? "" : "s"} ·{" "}
                {(totalSize / 1024).toFixed(1)} KB stored
              </p>
            </div>
            <button
              onClick={() => inputRef.current?.click()}
              style={primaryButtonStyle}
              onMouseEnter={hoverOn}
              onMouseLeave={hoverOff}
            >
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

          <div className="card mb-4 !p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 min-w-0">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or tag..."
                className="input pl-9"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Filter
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
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

              <div className="relative flex-1">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
            </div>
          </div>

          {documents.length === 0 ? (
            <div
              onClick={() => inputRef.current?.click()}
              className="card !p-8 sm:!p-12 text-center border-dashed border-2 cursor-pointer"
              style={{ borderColor: "var(--border)" }}
            >
              <FileCheck2
                size={40}
                className="mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-ink font-medium mb-1">No documents yet</p>
              <p className="text-sm text-ink-mute mb-6">
                Click to upload your first document (TXT or MD)
              </p>
              <div className="flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  style={primaryButtonStyle}
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
                >
                  <Plus size={16} /> Upload Document
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card !p-8 sm:!p-12 text-center">
              <Search
                size={40}
                className="mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
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
            <div className="card !p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full mobile-cards">
                  <thead>
                    <tr>
                      <th className="table-head">Name</th>
                      <th className="table-head w-32">Type</th>
                      <th className="table-head w-24">Size</th>
                      <th className="table-head w-40">Uploaded</th>
                      <th className="table-head w-40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doc) => (
                      <tr key={doc.id}>
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{
                                background: "var(--info-soft)",
                                color: "var(--info)",
                              }}
                            >
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
                        <td className="table-cell" data-label="Type">
                          <span className="chip chip-info capitalize">
                            {doc.type}
                          </span>
                        </td>
                        <td className="table-cell text-xs text-ink-mute" data-label="Size">
                          {(doc.size / 1024).toFixed(1)} KB
                        </td>
                        <td className="table-cell text-xs text-ink-mute" data-label="Uploaded">
                          {formatDate(doc.uploadedAt)}
                        </td>
                        <td className="table-cell text-right" data-label="Actions">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setPreview(doc)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ color: "var(--text-muted)" }}
                              title="Preview"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setEditing(doc)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ color: "var(--text-muted)" }}
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => download(doc)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ color: "var(--text-muted)" }}
                              title="Download"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${doc.name}"?`))
                                  deleteDocument(doc.id);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ color: "var(--text-muted)" }}
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

      {preview && (
        <>
          <div
            onClick={() => setPreview(null)}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
          <div
            className="modal-mobile-full fixed inset-x-4 top-20 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[700px] rounded-xl z-50 flex flex-col overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              boxShadow: "var(--shadow-pop)",
            }}
          >
            <div
              className="px-4 sm:px-6 py-4 flex items-center justify-between border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-ink truncate">{preview.name}</h3>
                <p className="text-xs text-ink-mute">
                  {(preview.size / 1024).toFixed(1)} KB ·{" "}
                  {formatDate(preview.uploadedAt)}
                </p>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>
            <pre
              className="flex-1 overflow-auto p-4 sm:p-6 text-sm whitespace-pre-wrap font-mono"
              style={{ color: "var(--text-soft)" }}
            >
              {preview.content}
            </pre>
          </div>
        </>
      )}

      {editing && (
        <>
          <div
            onClick={() => setEditing(null)}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
          <div
            className="modal-mobile-full fixed inset-x-4 top-24 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] rounded-xl z-50 overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              boxShadow: "var(--shadow-pop)",
            }}
          >
            <div
              className="px-4 sm:px-6 py-4 flex items-center justify-between border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="font-semibold text-ink">Edit Document</h3>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Name
                </label>
                <input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Type
                </label>
                <select
                  value={editing.type}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      type: e.target.value as StoredDocument["type"],
                    })
                  }
                  className="input cursor-pointer"
                >
                  <option value="guideline">Guideline</option>
                  <option value="application">Application</option>
                  <option value="supporting">Supporting</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Tags (comma-separated)
                </label>
                <input
                  value={editing.tags.join(", ")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="e.g. 2026, federal, stem"
                  className="input"
                />
              </div>
            </div>
            <div
              className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-2 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <button onClick={() => setEditing(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => {
                  updateDocument(editing.id, {
                    name: editing.name,
                    type: editing.type,
                    tags: editing.tags,
                  });
                  setEditing(null);
                }}
                style={primaryButtonStyle}
                onMouseEnter={hoverOn}
                onMouseLeave={hoverOff}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}