import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../types/wind';

type TopBarProps = { theme: Theme; onToggleTheme: () => void };

export function TopBar({ theme, onToggleTheme }: TopBarProps) {
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <header className="topbar">
      <div className="breadcrumb"><span>GB POWER</span><span className="slash">/</span> WIND FORECAST</div>
      <div className="top-actions">
        <button type="button" className="theme-toggle grid place-items-center rounded-control transition-colors" aria-label={label} aria-pressed={isDark} title={label} onClick={onToggleTheme}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
