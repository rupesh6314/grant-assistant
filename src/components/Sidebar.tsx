"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  LayoutTemplate,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  {
    id: "assessments",
    label: "Assessments",
    icon: ClipboardList,
    href: "/assessments",
  },
  { id: "documents", label: "Documents", icon: FileText, href: "/documents" },
  {
    id: "templates",
    label: "Templates",
    icon: LayoutTemplate,
    href: "/templates",
  },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/reports" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className="app-sidebar w-64 shrink-0 flex flex-col h-screen sticky top-0 border-r"
    >
      <div className="px-6 py-5 border-b divider">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "var(--brand)" }}
          >
            A
          </div>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={active ? "nav-item-active" : "nav-item"}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t divider space-y-1">
        <button
          onClick={() => router.push("/settings")}
          className={isActive("/settings") ? "nav-item-active" : "nav-item"}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button
          onClick={() => router.push("/help")}
          className={isActive("/help") ? "nav-item-active" : "nav-item"}
        >
          <HelpCircle size={18} />
          <span>Help</span>
        </button>
      </div>
    </aside>
  );
}