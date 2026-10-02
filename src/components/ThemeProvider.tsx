"use client";

import { useEffect } from "react";
import { useStore, rehydrateStore } from "@/store/useStore";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useStore((s) => s.preferences.theme);
  const density = useStore((s) => s.preferences.density);

  useEffect(() => {
    rehydrateStore();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const effective =
      theme === "system" ? (systemDark ? "dark" : "light") : theme;

    html.classList.remove("theme-light", "theme-dark");
    html.classList.add(`theme-${effective}`);

    html.classList.remove("density-comfortable", "density-compact");
    html.classList.add(`density-${density}`);
  }, [theme, density]);

  return <>{children}</>;
}