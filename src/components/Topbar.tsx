"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function Topbar({
  breadcrumb,
  user: userProp,
  initials: initialsProp,
}: {
  breadcrumb: string[];
  user?: string;
  initials?: string;
}) {
  const router = useRouter();
  const prefs = useStore((s) => s.preferences);

  const user = userProp ?? prefs.name;
  const initials =
    initialsProp ??
    user
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="app-topbar h-16 flex items-center justify-between px-6 sticky top-0 z-30 border-b divider">
      <div className="flex items-center gap-2 text-sm">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            <span
              className={i === breadcrumb.length - 1 ? "text-ink font-medium" : "text-ink-mute"}
            >
              {b}
            </span>
            {i < breadcrumb.length - 1 && (
              <span className="text-ink-mute">/</span>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ color: "var(--text-soft)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Bell size={18} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: "var(--danger)" }}
            />
          </button>
          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-xl p-3 z-50 border"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-pop)",
              }}
            >
              <div className="text-xs font-semibold text-ink-mute uppercase tracking-wider px-2 py-1">
                Notifications
              </div>
              <ul className="space-y-1 mt-1">
                <li
                  className="px-2 py-2 rounded-lg text-sm cursor-pointer"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <p className="text-ink font-medium">Assessment ready</p>
                  <p className="text-xs text-ink-mute">
                    Community Digital Innovation Grant
                  </p>
                </li>
                <li
                  className="px-2 py-2 rounded-lg text-sm cursor-pointer"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <p className="text-ink font-medium">3 missing documents</p>
                  <p className="text-xs text-ink-mute">
                    Rural Education Initiative
                  </p>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full transition-colors"
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div
              className="w-8 h-8 rounded-full text-white text-xs font-semibold flex items-center justify-center"
              style={{ background: "var(--brand)" }}
            >
              {initials}
            </div>
            <span className="text-sm font-medium text-ink">{user}</span>
            <ChevronDown size={14} className="text-ink-mute" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl p-2 z-50 border"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-pop)",
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/settings?section=profile");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <User size={16} /> Profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
                style={{ color: "var(--danger)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--danger-soft)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}