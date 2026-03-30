import { useEffect, useSyncExternalStore, useCallback } from "react";
import type { ThemeMode } from "@/lib/config";

const STORAGE_KEY = "theme";

function getStoredTheme(): ThemeMode {
  return (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? "system";
}

function applyTheme(mode: ThemeMode) {
  const dark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function useTheme() {
  const mode = useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    getStoredTheme
  );

  const setMode = useCallback((newMode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, newMode);
    applyTheme(newMode);
    window.dispatchEvent(new Event("storage"));
  }, []);

  // Apply on mount and when mode changes
  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  // Listen for system changes when in "system" mode
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  return { mode, setMode };
}
