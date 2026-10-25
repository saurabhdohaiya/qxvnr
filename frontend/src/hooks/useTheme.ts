import { useEffect, useState } from 'react';
import type { Theme } from '../types/wind';

const STORAGE_KEY = 'winddesk-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
}
