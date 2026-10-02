"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useStore } from "@/store/useStore";
import { formatDate, uid } from "@/lib/utils";
import {
  LayoutTemplate,
  Plus,
  X,
  Edit3,
  Copy,
  Trash2,
  Play,
  Search,
} from "lucide-react";
import type { Template } from "@/types";

const CATEGORIES = [
  "General",
  "Research",
  "Education",
  "Health",
  "Environment",
  "Technology",
];

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

const smallPrimaryButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  padding: "0.375rem 0.75rem",
  fontSize: "0.75rem",
  borderRadius: "8px",
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

export default function TemplatesPage() {
  const router = useRouter();
  const templates = useStore((s) => s.templates);
  const addTemplate = useStore((s) => s.addTemplate);
  const updateTemplate = useStore((s) => s.updateTemplate);
  const deleteTemplate = useStore((s) => s.deleteTemplate);
  const incrementTemplateUsage = useStore((s) => s.incrementTemplateUsage);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = templates.filter((t) => {
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (search.trim() && !t.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const openCreate = () => {
    setEditing({
      id: "",
      name: "",
      description: "",
      category: "General",
      guidelineText: "",
      guidelineName: "",
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setCreating(true);
  };

  const saveTemplate = (t: Template) => {
    if (creating) addTemplate({ ...t, id: uid("tpl") });
    else updateTemplate(t.id, t);
    setEditing(null);
    setCreating(false);
  };

  const clone = (t: Template) => {
    addTemplate({
      ...t,
      id: uid("tpl"),
      name: `${t.name} (copy)`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const apply = (t: Template) => {
    incrementTemplateUsage(t.id);
    sessionStorage.setItem(
      "template-prefill",
      JSON.stringify({
        guidelineText: t.guidelineText,
        guidelineName: t.guidelineName || `${t.name}.txt`,
        title: t.name,
      })
    );
    router.push("/new");
  };

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Templates"]} />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full">
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">Templates</h1>
              <p className="text-sm text-ink-mute mt-1">
                Reusable guidelines that pre-fill your new assessments.
              </p>
            </div>
            <button
              onClick={openCreate}
              style={primaryButtonStyle}
              onMouseEnter={hoverOn}
              onMouseLeave={hoverOff}
            >
              <Plus size={16} /> New Template
            </button>
          </div>

          <div className="card mb-6 !p-3 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="input pl-9"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input max-w-[180px] cursor-pointer"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {templates.length === 0 ? (
            <div
              className="card !p-12 text-center border-dashed border-2 cursor-pointer"
              style={{ borderColor: "var(--border)" }}
              onClick={openCreate}
            >
              <LayoutTemplate
                size={40}
                className="mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-ink font-medium mb-1">No templates yet</p>
              <p className="text-sm text-ink-mute mb-6">
                Create your first template to speed up future assessments.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreate();
                  }}
                  style={primaryButtonStyle}
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
                >
                  <Plus size={16} /> New Template
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card !p-12 text-center">
              <Search
                size={40}
                className="mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="text-ink font-medium">No matching templates</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((t) => (
                <div key={t.id} className="card group flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <span className="chip chip-info">{t.category}</span>
                    <span className="text-xs text-ink-mute">
                      used {t.usageCount}×
                    </span>
                  </div>

                  <h3 className="font-semibold text-ink mb-1 line-clamp-2">
                    {t.name || "Untitled template"}
                  </h3>
                  <p className="text-xs text-ink-mute mb-3 line-clamp-2">
                    {t.description || "No description"}
                  </p>

                  <p className="text-xs text-ink-mute mb-4">
                    {t.guidelineText.length} characters ·{" "}
                    {formatDate(t.updatedAt)}
                  </p>

                  <div className="mt-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => apply(t)}
                      style={{ ...smallPrimaryButtonStyle, flex: 1 }}
                      onMouseEnter={hoverOn}
                      onMouseLeave={hoverOff}
                    >
                      <Play size={12} /> Use
                    </button>
                    <button
                      onClick={() => {
                        setEditing(t);
                        setCreating(false);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--bg-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => clone(t)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--bg-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                      title="Clone"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${t.name}"?`)) deleteTemplate(t.id);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--danger-soft)";
                        e.currentTarget.style.color = "var(--danger)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--text-muted)";
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {editing && (
        <>
          <div
            onClick={() => {
              setEditing(null);
              setCreating(false);
            }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
          <div
            className="fixed inset-x-4 top-20 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[720px] rounded-xl z-50 flex flex-col overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              boxShadow: "var(--shadow-pop)",
            }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <h3 className="font-semibold text-ink">
                {creating ? "New Template" : "Edit Template"}
              </h3>
              <button
                onClick={() => {
                  setEditing(null);
                  setCreating(false);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Template Name
                </label>
                <input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="e.g. Federal STEM Grant 2026"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    Category
                  </label>
                  <select
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                    className="input cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    Guideline filename
                  </label>
                  <input
                    value={editing.guidelineName}
                    onChange={(e) =>
                      setEditing({ ...editing, guidelineName: e.target.value })
                    }
                    placeholder="guideline.txt"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Description
                </label>
                <input
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="Short summary shown on the template card"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Guideline Text
                </label>
                <textarea
                  value={editing.guidelineText}
                  onChange={(e) =>
                    setEditing({ ...editing, guidelineText: e.target.value })
                  }
                  placeholder="Paste the grant guideline here..."
                  className="input h-64 resize-none font-mono text-xs"
                />
                <p className="text-xs text-ink-mute mt-1">
                  {editing.guidelineText.length} characters
                </p>
              </div>
            </div>

            <div
              className="px-6 py-4 flex justify-end gap-2 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <button
                onClick={() => {
                  setEditing(null);
                  setCreating(false);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => saveTemplate(editing)}
                disabled={!editing.name.trim() || !editing.guidelineText.trim()}
                style={{
                  ...primaryButtonStyle,
                  opacity:
                    !editing.name.trim() || !editing.guidelineText.trim()
                      ? 0.5
                      : 1,
                  cursor:
                    !editing.name.trim() || !editing.guidelineText.trim()
                      ? "not-allowed"
                      : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (
                    editing.name.trim() &&
                    editing.guidelineText.trim()
                  )
                    hoverOn(e);
                }}
                onMouseLeave={(e) => {
                  if (
                    editing.name.trim() &&
                    editing.guidelineText.trim()
                  )
                    hoverOff(e);
                }}
              >
                {creating ? "Create Template" : "Save Changes"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}