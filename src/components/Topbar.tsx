"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";

export default function Topbar({
  breadcrumb,
  user = "Rahul Kumar",
  initials = "RK",
}: {
  breadcrumb: string[];
  user?: string;
  initials?: string;
}) {
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
    <header className="h-16 bg-white border-b border-line flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 text-sm">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            <span
              className={
                i === breadcrumb.length - 1
                  ? "text-ink font-medium"
                  : "text-ink-mute"
              }
            >
              {b}
            </span>
            {i < breadcrumb.length - 1 && <span className="text-ink-mute">/</span>}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-ink-soft transition-colors relative"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-line rounded-xl shadow-pop p-3 z-50">
              <div className="text-xs font-semibold text-ink-mute uppercase tracking-wider px-2 py-1">
                Notifications
              </div>
              <ul className="space-y-1 mt-1">
                <li className="px-2 py-2 hover:bg-slate-50 rounded-lg text-sm">
                  <p className="text-ink font-medium">Assessment ready</p>
                  <p className="text-xs text-ink-mute">Community Digital Innovation Grant</p>
                </li>
                <li className="px-2 py-2 hover:bg-slate-50 rounded-lg text-sm">
                  <p className="text-ink font-medium">3 missing documents</p>
                  <p className="text-xs text-ink-mute">Rural Education Initiative</p>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Avatar menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">
              {initials}
            </div>
            <span className="text-sm font-medium text-ink">{user}</span>
            <ChevronDown size={14} className="text-ink-mute" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-line rounded-xl shadow-pop p-2 z-50">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 text-sm text-ink">
                <User size={16} /> Profile
              </button>
              <button
                onClick={() => alert("Signed out (demo)")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 text-sm text-red-600"
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