import * as react from 'react';
import { ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';
type ThemeProviderProps = {
    children: ReactNode;
    /** Overrides the `data-default-theme` attribute on <html>; last resort is "system". */
    defaultTheme?: Theme;
    /** Overrides the `data-theme-key` attribute on <html>; last resort is the fleet key. */
    storageKey?: string;
};
type ThemeProviderState = {
    /** The user's choice: an explicit theme, or "system" to follow the OS. */
    theme: Theme;
    /** The theme actually applied right now ("system" resolved against the OS). */
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
};
/** One key across the fleet so a user's choice follows them between NETIX apps. */
declare const THEME_STORAGE_KEY = "netix-theme";
declare function ThemeProvider({ children, defaultTheme, storageKey }: ThemeProviderProps): react.JSX.Element;
declare const useTheme: () => ThemeProviderState;

export { type ResolvedTheme, THEME_STORAGE_KEY, type Theme, ThemeProvider, type ThemeProviderProps, type ThemeProviderState, useTheme };
