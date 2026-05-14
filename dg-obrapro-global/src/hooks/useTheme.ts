import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/appStore';

const STORAGE_KEY = 'dg-obrapro-theme';
const DARK_CLASS = 'dark';

/**
 * Apply or remove the `dark` class on `document.documentElement` and sync
 * the preference to localStorage.
 */
function applyTheme(isDark: boolean): void {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add(DARK_CLASS);
  } else {
    root.classList.remove(DARK_CLASS);
  }
  try {
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch {
    // localStorage may be unavailable in certain contexts (e.g. private mode)
  }
}

/**
 * Read the persisted theme preference from localStorage.
 * Falls back to the OS-level preference when no stored value is found.
 */
function readStoredTheme(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
  } catch {
    // localStorage unavailable
  }
  // No stored value — honour the OS preference
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseThemeReturn {
  /** Whether dark mode is currently active. */
  isDark: boolean;
  /** Toggle between dark and light modes. */
  toggleTheme: () => void;
  /** Explicitly enable or disable dark mode. */
  setTheme: (dark: boolean) => void;
}

/**
 * `useTheme` synchronises the Zustand `darkMode` state with the DOM and
 * localStorage so the active theme persists across page reloads.
 *
 * Usage:
 * ```tsx
 * const { isDark, toggleTheme } = useTheme();
 * ```
 *
 * The hook also bootstraps the initial theme on first mount by reading
 * localStorage (or the OS preference) and hydrating the store accordingly.
 */
export function useTheme(): UseThemeReturn {
  const darkMode = useAppStore((s) => s.darkMode);
  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);

  // On first mount, reconcile the store value with the persisted/OS preference.
  useEffect(() => {
    const preferred = readStoredTheme();
    // If the store already has the right value (restored by zustand/persist),
    // just make sure the DOM reflects it; otherwise align the store too.
    setDarkMode(preferred);
    applyTheme(preferred);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever the store value changes, propagate to the DOM + localStorage.
  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  // Also listen for OS-level theme changes so the app responds automatically
  // when no explicit preference has been stored.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only follow the OS if the user hasn't pinned a preference.
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setDarkMode(e.matches);
      }
    };

    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [setDarkMode]);

  const toggleTheme = useCallback(() => {
    toggleDarkMode();
  }, [toggleDarkMode]);

  const setTheme = useCallback(
    (dark: boolean) => {
      setDarkMode(dark);
    },
    [setDarkMode],
  );

  return { isDark: darkMode, toggleTheme, setTheme };
}
