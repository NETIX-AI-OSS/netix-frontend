import * as react from 'react';
import { ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';
/** The design styles the token layer ships; the shape axis, orthogonal to light/dark. */
declare const STYLES: readonly ["nova", "rhea"];
type Style = (typeof STYLES)[number];
type ThemeProviderProps = {
    children: ReactNode;
    /** Overrides the `data-default-theme` attribute on <html>; last resort is "system". */
    defaultTheme?: Theme;
    /** Overrides the `data-default-style` attribute on <html>; last resort is the first style. */
    defaultStyle?: Style;
    /** Overrides the `data-theme-key` attribute on <html>; last resort is the fleet key. */
    storageKey?: string;
    /** Overrides the `data-style-key` attribute on <html>; last resort is the fleet key. */
    styleStorageKey?: string;
};
type ThemeProviderState = {
    /** The user's choice: an explicit theme, or "system" to follow the OS. */
    theme: Theme;
    /** The theme actually applied right now ("system" resolved against the OS). */
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    /** The applied design style — component shape, independent of light/dark. */
    style: Style;
    setStyle: (style: Style) => void;
};
/** One key across the fleet so a user's choice follows them between NETIX apps. */
declare const THEME_STORAGE_KEY = "netix-theme";
declare const STYLE_STORAGE_KEY = "netix-style";
declare function ThemeProvider({ children, defaultTheme, defaultStyle, storageKey, styleStorageKey, }: ThemeProviderProps): react.JSX.Element;
declare const useTheme: () => ThemeProviderState;

export { type ResolvedTheme, STYLES, STYLE_STORAGE_KEY, type Style, THEME_STORAGE_KEY, type Theme, ThemeProvider, type ThemeProviderProps, type ThemeProviderState, useTheme };
