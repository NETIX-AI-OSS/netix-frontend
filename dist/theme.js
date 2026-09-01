import { createContext, useMemo, useState, useEffect, useContext } from 'react';
import { jsx } from 'react/jsx-runtime';

// src/theme/theme-provider.tsx
var MEDIA_QUERY = "(prefers-color-scheme: dark)";
var THEME_STORAGE_KEY = "netix-theme";
function datasetDefaults() {
  const root = typeof document !== "undefined" ? document.documentElement : void 0;
  return {
    storageKey: root?.dataset.themeKey || THEME_STORAGE_KEY,
    defaultTheme: root?.dataset.defaultTheme || "system"
  };
}
var canMatchMedia = () => typeof window !== "undefined" && typeof window.matchMedia === "function";
var prefersDark = () => canMatchMedia() && window.matchMedia(MEDIA_QUERY).matches;
var ThemeProviderContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null
});
function ThemeProvider({ children, defaultTheme, storageKey }) {
  const defaults = useMemo(() => datasetDefaults(), []);
  const resolvedStorageKey = storageKey ?? defaults.storageKey;
  const resolvedDefaultTheme = defaultTheme ?? defaults.defaultTheme;
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(resolvedStorageKey) || resolvedDefaultTheme;
    } catch {
      return resolvedDefaultTheme;
    }
  });
  const [osTheme, setOsTheme] = useState(() => prefersDark() ? "dark" : "light");
  useEffect(() => {
    if (!canMatchMedia()) return;
    const media = window.matchMedia(MEDIA_QUERY);
    const onChange = (event) => setOsTheme(event.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  const resolvedTheme = theme === "system" ? osTheme : theme;
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);
  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next) => {
        try {
          localStorage.setItem(resolvedStorageKey, next);
        } catch {
        }
        setThemeState(next);
      }
    }),
    [theme, resolvedTheme, resolvedStorageKey]
  );
  return /* @__PURE__ */ jsx(ThemeProviderContext.Provider, { value, children });
}
var useTheme = () => useContext(ThemeProviderContext);

export { THEME_STORAGE_KEY, ThemeProvider, useTheme };
