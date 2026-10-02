"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import {
  User,
  Bell,
  Palette,
  Database,
  Shield,
  Save,
  Trash2,
  Download,
  Check,
} from "lucide-react";
import type { Density, Theme } from "@/types";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Data & Privacy", icon: Database },
  { id: "security", label: "Security", icon: Shield },
];

/* ── Shared button styles ─────────────────── */

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

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.125rem",
  background: "var(--bg-surface)",
  color: "var(--text-strong)",
  fontSize: "0.875rem",
  fontWeight: 600,
  lineHeight: "1.25rem",
  borderRadius: "10px",
  border: "1px solid var(--border-strong)",
  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "transform 150ms ease, box-shadow 150ms ease, background 150ms ease",
};

const dangerButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.125rem",
  background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
  color: "#ffffff",
  fontSize: "0.875rem",
  fontWeight: 600,
  lineHeight: "1.25rem",
  borderRadius: "10px",
  border: "1px solid #dc2626",
  boxShadow:
    "0 4px 14px -3px rgba(220, 38, 38, 0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
  cursor: "pointer",
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "transform 150ms ease, box-shadow 150ms ease",
};

const hoverLift =
  (color: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(-1px)";
    e.currentTarget.style.boxShadow = `0 8px 20px -3px ${color}, inset 0 1px 0 rgba(255,255,255,0.2)`;
  };

const hoverFlat = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow =
    "0 4px 14px -3px rgba(37, 99, 235, 0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
};

const hoverFlatDanger = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow =
    "0 4px 14px -3px rgba(220, 38, 38, 0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
};

const hoverSecondary = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = "translateY(-1px)";
  e.currentTarget.style.boxShadow = "0 4px 12px -2px rgba(0,0,0,0.12)";
  e.currentTarget.style.background = "var(--bg-hover)";
};

const hoverSecondaryOff = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0,0,0,0.05)";
  e.currentTarget.style.background = "var(--bg-surface)";
};

export default function SettingsPage() {
  const assessments = useStore((s) => s.assessments);
  const documents = useStore((s) => s.documents);
  const templates = useStore((s) => s.templates);
  const preferences = useStore((s) => s.preferences);
  const updatePreferences = useStore((s) => s.updatePreferences);

  const [section, setSection] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(preferences.name);
  const [email, setEmail] = useState(preferences.email);
  const [org, setOrg] = useState(preferences.organization);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("section");
    if (s && SECTIONS.some((x) => x.id === s)) setSection(s);
  }, []);

  useEffect(() => {
    setName(preferences.name);
    setEmail(preferences.email);
    setOrg(preferences.organization);
  }, [preferences.name, preferences.email, preferences.organization]);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const saveProfile = () => {
    updatePreferences({ name, email, organization: org });
    showSaved();
  };

  const setTheme = (theme: Theme) => {
    updatePreferences({ theme });
    showSaved();
  };

  const setDensity = (density: Density) => {
    updatePreferences({ density });
    showSaved();
  };

  const toggleNotif = (
    key: "notifyEmail" | "notifyAnalysis" | "notifyStale",
    v: boolean
  ) => {
    updatePreferences({ [key]: v });
    showSaved();
  };

  const exportData = () => {
    const data = {
      assessments,
      documents,
      templates,
      preferences,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grant-assistant-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (
      !confirm(
        "This will delete ALL assessments, documents, and templates. Continue?"
      )
    )
      return;
    if (!confirm("This action cannot be undone. Are you absolutely sure?"))
      return;
    localStorage.removeItem("grant-assistant-store");
    window.location.reload();
  };

  const initials = preferences.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar breadcrumb={["Settings"]} />

        <main className="flex-1 p-6 lg:p-8 max-w-[1200px] w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink">Settings</h1>
            <p className="text-sm text-ink-mute mt-1">
              Manage your profile, preferences, and data.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <nav className="lg:col-span-1 space-y-1">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = section === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    className={active ? "nav-item-active" : "nav-item"}
                  >
                    <Icon size={16} />
                    {s.label}
                  </button>
                );
              })}
            </nav>

            <div className="lg:col-span-3 space-y-6">
              {section === "profile" && (
                <div className="card space-y-5">
                  <div>
                    <h2 className="text-base font-semibold text-ink mb-1">
                      Profile
                    </h2>
                    <p className="text-sm text-ink-mute">
                      This name appears in the top bar and on reports.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                      style={{ background: "var(--brand)" }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">Avatar</p>
                      <p className="text-xs text-ink-mute">
                        Auto-generated from your name initials.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1.5">
                        Full Name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1.5">
                        Email
                      </label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">
                      Organization
                    </label>
                    <input
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={saveProfile}
                      style={primaryButtonStyle}
                      onMouseEnter={hoverLift("rgba(37, 99, 235, 0.55)")}
                      onMouseLeave={hoverFlat}
                    >
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              )}

              {section === "appearance" && (
                <div className="card space-y-6">
                  <h2 className="text-base font-semibold text-ink">
                    Appearance
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["light", "dark", "system"] as const).map((t) => {
                        const active = preferences.theme === t;
                        return (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className="border rounded-lg p-4 text-left transition-all"
                            style={{
                              borderColor: active
                                ? "var(--brand)"
                                : "var(--border)",
                              background: active
                                ? "var(--brand-soft)"
                                : "var(--bg-surface-2)",
                            }}
                          >
                            <div className="text-sm font-medium text-ink capitalize">
                              {t}
                            </div>
                            <div className="text-xs text-ink-mute mt-1">
                              {t === "light"
                                ? "Bright background"
                                : t === "dark"
                                ? "Dark background"
                                : "Follow OS"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-3">
                      Density
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["comfortable", "compact"] as const).map((d) => {
                        const active = preferences.density === d;
                        return (
                          <button
                            key={d}
                            onClick={() => setDensity(d)}
                            className="border rounded-lg p-4 text-left transition-all"
                            style={{
                              borderColor: active
                                ? "var(--brand)"
                                : "var(--border)",
                              background: active
                                ? "var(--brand-soft)"
                                : "var(--bg-surface-2)",
                            }}
                          >
                            <div className="text-sm font-medium text-ink capitalize">
                              {d}
                            </div>
                            <div className="text-xs text-ink-mute mt-1">
                              {d === "comfortable"
                                ? "More breathing room"
                                : "Tighter rows and padding"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {section === "notifications" && (
                <div className="card space-y-4">
                  <h2 className="text-base font-semibold text-ink">
                    Notifications
                  </h2>

                  <Toggle
                    label="Email notifications"
                    description="Receive assessment updates via email"
                    checked={preferences.notifyEmail}
                    onChange={(v) => toggleNotif("notifyEmail", v)}
                  />
                  <Toggle
                    label="Analysis complete"
                    description="Alert me when an assessment finishes"
                    checked={preferences.notifyAnalysis}
                    onChange={(v) => toggleNotif("notifyAnalysis", v)}
                  />
                  <Toggle
                    label="Stale document warning"
                    description="Alert me when a document changes after analysis"
                    checked={preferences.notifyStale}
                    onChange={(v) => toggleNotif("notifyStale", v)}
                  />
                </div>
              )}

              {section === "data" && (
                <div className="space-y-6">
                  <div className="card">
                    <h2 className="text-base font-semibold text-ink mb-4">
                      Your Data
                    </h2>
                    <ul className="space-y-3 text-sm">
                      <li
                        className="flex justify-between py-2 border-b"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span className="text-ink-soft">Assessments</span>
                        <span className="font-medium text-ink">
                          {assessments.length}
                        </span>
                      </li>
                      <li
                        className="flex justify-between py-2 border-b"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <span className="text-ink-soft">Documents</span>
                        <span className="font-medium text-ink">
                          {documents.length}
                        </span>
                      </li>
                      <li className="flex justify-between py-2">
                        <span className="text-ink-soft">Templates</span>
                        <span className="font-medium text-ink">
                          {templates.length}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="card">
                    <h2 className="text-base font-semibold text-ink mb-2">
                      Export Backup
                    </h2>
                    <p className="text-sm text-ink-mute mb-4">
                      Download all your data as a JSON file.
                    </p>
                    <button
                      onClick={exportData}
                      style={secondaryButtonStyle}
                      onMouseEnter={hoverSecondary}
                      onMouseLeave={hoverSecondaryOff}
                    >
                      <Download size={16} /> Export Data
                    </button>
                  </div>

                  <div
                    className="card"
                    style={{ borderColor: "var(--danger)" }}
                  >
                    <h2
                      className="text-base font-semibold mb-2"
                      style={{ color: "var(--danger)" }}
                    >
                      Danger Zone
                    </h2>
                    <p className="text-sm text-ink-mute mb-4">
                      Permanently delete all assessments, documents, and
                      templates.
                    </p>
                    <button
                      onClick={clearAll}
                      style={dangerButtonStyle}
                      onMouseEnter={hoverLift("rgba(220, 38, 38, 0.55)")}
                      onMouseLeave={hoverFlatDanger}
                    >
                      <Trash2 size={16} /> Delete All Data
                    </button>
                  </div>
                </div>
              )}

              {section === "security" && (
                <div className="card space-y-5">
                  <h2 className="text-base font-semibold text-ink">Security</h2>

                  <div
                    className="border rounded-lg p-4"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={16} style={{ color: "var(--success)" }} />
                      <p className="text-sm font-medium text-ink">API Key</p>
                    </div>
                    <p className="text-sm text-ink-mute mb-3">
                      Your Groq API key is stored server-side as an environment
                      variable. It is never exposed to the browser.
                    </p>
                    <p className="text-xs text-ink-mute font-mono">
                      GROQ_API_KEY = ••••••••••••••••••••
                    </p>
                  </div>

                  <div
                    className="border rounded-lg p-4"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <p className="text-sm font-medium text-ink mb-1">
                      Data Storage
                    </p>
                    <p className="text-sm text-ink-mute">
                      Assessments and documents are stored in your browser's
                      localStorage.
                    </p>
                  </div>
                </div>
              )}

              {saved && (
                <div
                  className="fixed bottom-6 right-6 text-sm rounded-lg px-4 py-2 flex items-center gap-2 z-50"
                  style={{
                    background: "var(--brand)",
                    color: "#ffffff",
                    boxShadow: "var(--shadow-pop)",
                  }}
                >
                  <Check size={16} />
                  Saved
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-start justify-between py-3 border-b last:border-0"
      style={{ borderColor: "var(--border)" }}
    >
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-mute mt-0.5">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          position: "relative",
          width: 44,
          height: 24,
          borderRadius: 9999,
          border: "none",
          padding: 0,
          cursor: "pointer",
          flexShrink: 0,
          background: checked ? "var(--brand)" : "var(--border-strong)",
          transition: "background-color 200ms ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 23 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            transition: "left 200ms ease",
          }}
        />
      </button>
    </div>
  );
}