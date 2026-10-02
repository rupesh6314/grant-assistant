"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import {
  User, Bell, Palette, Database, Shield, Save,
  Trash2, Download, Check,
} from "lucide-react";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "data", label: "Data & Privacy", icon: Database },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const { assessments, documents, templates } = useStore();
  const [section, setSection] = useState("profile");
  const [saved, setSaved] = useState(false);

  // Profile state
  const [name, setName] = useState("Rahul Kumar");
  const [email, setEmail] = useState("rahul@example.com");
  const [org, setOrg] = useState("University of Washington");

  // Appearance state
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  // Notifications state
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyAnalysis, setNotifyAnalysis] = useState(true);
  const [notifyStale, setNotifyStale] = useState(true);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const exportData = () => {
    const data = { assessments, documents, templates, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grant-assistant-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (!confirm("This will delete ALL assessments, documents, and templates. Continue?")) return;
    if (!confirm("This action cannot be undone. Are you absolutely sure?")) return;
    localStorage.removeItem("grant-assistant-store");
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-canvas">
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
            {/* Sidebar nav */}
            <nav className="lg:col-span-1 space-y-1">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = section === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-soft hover:bg-slate-100"
                    )}
                  >
                    <Icon size={16} />
                    {s.label}
                  </button>
                );
              })}
            </nav>

            {/* Content */}
            <div className="lg:col-span-3 space-y-6">
              {section === "profile" && (
                <div className="card p-6 space-y-5">
                  <div>
                    <h2 className="text-base font-semibold text-ink mb-4">Profile</h2>
                    <p className="text-sm text-ink-mute mb-6">
                      This information appears in the top bar and on generated reports.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-bold">
                      {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
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
                      <label className="block text-sm font-medium text-ink mb-1.5">Full Name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Organization</label>
                    <input value={org} onChange={(e) => setOrg(e.target.value)} className="input" />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button onClick={showSaved} className="btn-primary">
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              )}

              {section === "appearance" && (
                <div className="card p-6 space-y-6">
                  <h2 className="text-base font-semibold text-ink">Appearance</h2>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["light", "dark", "system"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            "border rounded-lg p-4 text-left transition-colors",
                            theme === t
                              ? "border-brand-500 bg-brand-50"
                              : "border-line hover:border-brand-300"
                          )}
                        >
                          <div className="text-sm font-medium text-ink capitalize">{t}</div>
                          <div className="text-xs text-ink-mute mt-1">
                            {t === "light" ? "Bright background" : t === "dark" ? "Dark background" : "Follow OS"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-3">Density</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["comfortable", "compact"] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDensity(d)}
                          className={cn(
                            "border rounded-lg p-4 text-left transition-colors",
                            density === d
                              ? "border-brand-500 bg-brand-50"
                              : "border-line hover:border-brand-300"
                          )}
                        >
                          <div className="text-sm font-medium text-ink capitalize">{d}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button onClick={showSaved} className="btn-primary">
                      <Save size={16} /> Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {section === "notifications" && (
                <div className="card p-6 space-y-4">
                  <h2 className="text-base font-semibold text-ink">Notifications</h2>

                  <Toggle
                    label="Email notifications"
                    description="Receive assessment updates via email"
                    checked={notifyEmail}
                    onChange={setNotifyEmail}
                  />
                  <Toggle
                    label="Analysis complete"
                    description="Alert me when an assessment finishes"
                    checked={notifyAnalysis}
                    onChange={setNotifyAnalysis}
                  />
                  <Toggle
                    label="Stale document warning"
                    description="Alert me when a document changes after analysis"
                    checked={notifyStale}
                    onChange={setNotifyStale}
                  />

                  <div className="flex justify-end pt-2">
                    <button onClick={showSaved} className="btn-primary">
                      <Save size={16} /> Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {section === "data" && (
                <div className="space-y-6">
                  <div className="card p-6">
                    <h2 className="text-base font-semibold text-ink mb-4">Your Data</h2>
                    <ul className="space-y-3 text-sm">
                      <li className="flex justify-between py-2 border-b border-line">
                        <span className="text-ink-soft">Assessments</span>
                        <span className="font-medium text-ink">{assessments.length}</span>
                      </li>
                      <li className="flex justify-between py-2 border-b border-line">
                        <span className="text-ink-soft">Documents</span>
                        <span className="font-medium text-ink">{documents.length}</span>
                      </li>
                      <li className="flex justify-between py-2">
                        <span className="text-ink-soft">Templates</span>
                        <span className="font-medium text-ink">{templates.length}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="card p-6">
                    <h2 className="text-base font-semibold text-ink mb-2">Export Backup</h2>
                    <p className="text-sm text-ink-mute mb-4">
                      Download all your data as a JSON file. Use it to migrate or keep a local copy.
                    </p>
                    <button onClick={exportData} className="btn-secondary">
                      <Download size={16} /> Export Data
                    </button>
                  </div>

                  <div className="card p-6 border-red-200">
                    <h2 className="text-base font-semibold text-red-700 mb-2">Danger Zone</h2>
                    <p className="text-sm text-ink-mute mb-4">
                      Permanently delete all assessments, documents, and templates. This cannot be undone.
                    </p>
                    <button onClick={clearAll} className="btn-danger">
                      <Trash2 size={16} /> Delete All Data
                    </button>
                  </div>
                </div>
              )}

              {section === "security" && (
                <div className="card p-6 space-y-5">
                  <h2 className="text-base font-semibold text-ink">Security</h2>

                  <div className="border border-line rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={16} className="text-emerald-500" />
                      <p className="text-sm font-medium text-ink">API Key</p>
                    </div>
                    <p className="text-sm text-ink-mute mb-3">
                      Your Groq API key is stored server-side on Vercel as an
                      environment variable. It is never exposed to the browser.
                    </p>
                    <p className="text-xs text-ink-mute font-mono">
                      GROQ_API_KEY = ••••••••••••••••••••
                    </p>
                  </div>

                  <div className="border border-line rounded-lg p-4">
                    <p className="text-sm font-medium text-ink mb-1">Data Storage</p>
                    <p className="text-sm text-ink-mute">
                      Assessments and documents are stored in your browser's localStorage.
                      They never leave your device except when sent to Groq for analysis.
                    </p>
                  </div>

                  <div className="border border-line rounded-lg p-4">
                    <p className="text-sm font-medium text-ink mb-1">Session</p>
                    <p className="text-sm text-ink-mute">
                      No account or login required. Clearing your browser data will remove all local state.
                    </p>
                  </div>
                </div>
              )}

              {saved && (
                <div className="fixed bottom-6 right-6 bg-ink text-white text-sm rounded-lg px-4 py-2 shadow-pop flex items-center gap-2">
                  <Check size={16} className="text-emerald-400" />
                  Settings saved
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
    <div className="flex items-start justify-between py-3 border-b border-line last:border-0">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-mute mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "w-11 h-6 rounded-full transition-colors relative shrink-0",
          checked ? "bg-brand-600" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}