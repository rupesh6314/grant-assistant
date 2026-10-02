"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  LayoutTemplate,
  BarChart3,
} from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard, href: "/" },
  { id: "assessments", label: "Assess", icon: ClipboardList, href: "/assessments" },
  { id: "documents", label: "Docs", icon: FileText, href: "/documents" },
  { id: "templates", label: "Templates", icon: LayoutTemplate, href: "/templates" },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/reports" },
];

export default function MobileTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="app-tabbar">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.href);
        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            className={
              active
                ? "app-tabbar-item app-tabbar-item-active"
                : "app-tabbar-item"
            }
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}