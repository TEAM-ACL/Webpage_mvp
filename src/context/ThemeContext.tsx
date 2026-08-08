import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  systemMode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const THEME_STORAGE_KEY = "visiontech.theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const getSystemMode = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getInitialMode = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return getSystemMode();
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [systemMode, setSystemMode] = useState<ThemeMode>(getSystemMode);
  const canUseTheme = Boolean(user);
  const activeMode: ThemeMode = canUseTheme ? mode : "light";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", activeMode === "dark");
    root.dataset.theme = activeMode;
    root.style.colorScheme = activeMode;
  }, [activeMode]);

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemMode = (event: MediaQueryListEvent | MediaQueryList) => {
      setSystemMode(event.matches ? "dark" : "light");
    };
    updateSystemMode(preference);
    preference.addEventListener("change", updateSystemMode);
    return () => preference.removeEventListener("change", updateSystemMode);
  }, []);

  useEffect(() => {
    if (canUseTheme) {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
  }, [canUseTheme, mode]);

  const value = useMemo<ThemeContextValue>(() => {
    const setMode = (nextMode: ThemeMode) => {
      if (canUseTheme) setModeState(nextMode);
    };
    const toggleMode = () => {
      if (canUseTheme) setModeState((current) => (current === "dark" ? "light" : "dark"));
    };

    return {
      mode,
      isDark: activeMode === "dark",
      systemMode,
      setMode,
      toggleMode,
    };
  }, [activeMode, canUseTheme, mode, systemMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
