import * as React from 'react';
import { ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';
type ThemeProviderProps = {
    children: ReactNode;
    defaultTheme?: Theme;
    /** One key across the fleet so a user's choice follows them between NETIX apps. */
    storageKey?: string;
};
type ThemeProviderState = {
    /** The user's choice: an explicit theme, or "system" to follow the OS. */
    theme: Theme;
    /** The theme actually applied right now ("system" resolved against the OS). */
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
};
declare const THEME_STORAGE_KEY = "netix-theme";
declare function ThemeProvider({ children, defaultTheme, storageKey, }: ThemeProviderProps): React.JSX.Element;
declare const useTheme: () => ThemeProviderState;

export { type ResolvedTheme, THEME_STORAGE_KEY, type Theme, ThemeProvider, type ThemeProviderProps, type ThemeProviderState, useTheme };
