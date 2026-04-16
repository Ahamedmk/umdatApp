import { useEffect, useState } from "react";

const THEME_KEY = "theme";
const THEME_EVENT = "umdat:theme-change";

function getPreferredTheme() {
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

export function getTheme() {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  return storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : getPreferredTheme();
}

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setAppTheme(theme) {
  if (typeof window === "undefined") return;

  const nextTheme = theme === "dark" ? "dark" : "light";
  window.localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: nextTheme }));
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => getTheme());

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const nextTheme = getTheme();
      applyTheme(nextTheme);
      setThemeState(nextTheme);
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === THEME_KEY) {
        syncTheme();
      }
    };

    const handleThemeChange = () => {
      syncTheme();
    };

    const handleSystemThemeChange = () => {
      if (!window.localStorage.getItem(THEME_KEY)) {
        syncTheme();
      }
    };

    syncTheme();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(THEME_EVENT, handleThemeChange);
    mediaQuery?.addEventListener?.("change", handleSystemThemeChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(THEME_EVENT, handleThemeChange);
      mediaQuery?.removeEventListener?.("change", handleSystemThemeChange);
    };
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    setTheme: setAppTheme,
    toggleTheme: () => setAppTheme(theme === "dark" ? "light" : "dark"),
  };
}
