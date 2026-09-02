import { createContext, useMemo, useState, useEffect, useContext } from 'react';
import { jsx } from 'react/jsx-runtime';

// src/theme/theme-provider.tsx

// src/tokens/style-names.ts
var STYLE_NAMES = ["nova", "rhea"];
var STYLES = STYLE_NAMES;
var MEDIA_QUERY = "(prefers-color-scheme: dark)";
var THEME_STORAGE_KEY = "netix-theme";
var STYLE_STORAGE_KEY = "netix-style";
var DEFAULT_STYLE = STYLES[0];
var asStyle = (value) => STYLES.includes(value) ? value : void 0;
function datasetDefaults() {
  const root = typeof document !== "undefined" ? document.documentElement : void 0;
  return {
    storageKey: root?.dataset.themeKey || THEME_STORAGE_KEY,
    defaultTheme: root?.dataset.defaultTheme || "system",
    styleStorageKey: root?.dataset.styleKey || STYLE_STORAGE_KEY,
    defaultStyle: asStyle(root?.dataset.defaultStyle) || DEFAULT_STYLE
  };
}
var canMatchMedia = () => typeof window !== "undefined" && typeof window.matchMedia === "function";
var prefersDark = () => canMatchMedia() && window.matchMedia(MEDIA_QUERY).matches;
var read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
var persist = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
  }
};
var ThemeProviderContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
  style: DEFAULT_STYLE,
  setStyle: () => null
});
function ThemeProvider({
  children,
  defaultTheme,
  defaultStyle,
  storageKey,
  styleStorageKey
}) {
  const defaults = useMemo(() => datasetDefaults(), []);
  const resolvedStorageKey = storageKey ?? defaults.storageKey;
  const resolvedDefaultTheme = defaultTheme ?? defaults.defaultTheme;
  const resolvedStyleKey = styleStorageKey ?? defaults.styleStorageKey;
  const resolvedDefaultStyle = defaultStyle ?? defaults.defaultStyle;
  const [theme, setThemeState] = useState(
    () => read(resolvedStorageKey) || resolvedDefaultTheme
  );
  const [style, setStyleState] = useState(
    () => asStyle(read(resolvedStyleKey)) || resolvedDefaultStyle
  );
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
  useEffect(() => {
    window.document.documentElement.setAttribute("data-style", style);
  }, [style]);
  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next) => {
        persist(resolvedStorageKey, next);
        setThemeState(next);
      },
      style,
      setStyle: (next) => {
        persist(resolvedStyleKey, next);
        setStyleState(next);
      }
    }),
    [theme, resolvedTheme, resolvedStorageKey, style, resolvedStyleKey]
  );
  return /* @__PURE__ */ jsx(ThemeProviderContext.Provider, { value, children });
}
var useTheme = () => useContext(ThemeProviderContext);

export { STYLES, STYLE_STORAGE_KEY, THEME_STORAGE_KEY, ThemeProvider, useTheme };
