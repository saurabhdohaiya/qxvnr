import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { monthLabel } from '../lib/constants';

type MonthPickerProps = { value: string; onChange: (month: string) => void };

const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = new Date(`${value}-01T00:00:00Z`);
  const selectedYear = selectedDate.getUTCFullYear();
  const selectedMonth = selectedDate.getUTCMonth() + 1;
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const [displayYear, setDisplayYear] = useState(selectedYear);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismissOutside);
    return () => document.removeEventListener('pointerdown', dismissOutside);
  }, [open]);

  const toggleOpen = () => {
    if (!open) setDisplayYear(selectedYear);
    setOpen((current) => !current);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className="month-picker" ref={rootRef} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className="month-picker-trigger"
        aria-label={`Reporting month: ${monthLabel(value)}. Change month`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggleOpen}
      >
        <CalendarDays size={15} aria-hidden="true" />
        <span>{monthLabel(value)}</span>
        <ChevronDown size={14} className={open ? 'month-picker-chevron is-open' : 'month-picker-chevron'} aria-hidden="true" />
      </button>

      {open && (
        <div className="month-picker-popover" role="dialog" aria-label="Choose reporting month">
          <div className="month-picker-header">
            <button type="button" className="month-picker-nav" aria-label="Previous year" onClick={() => setDisplayYear((year) => year - 1)}>
              <ChevronLeft size={16} />
            </button>
            <span aria-live="polite">{displayYear}</span>
            <button type="button" className="month-picker-nav" aria-label="Next year" disabled={displayYear >= currentYear} onClick={() => setDisplayYear((year) => year + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="month-picker-grid" role="group" aria-label={`Months in ${displayYear}`}>
            {monthOptions.map((monthNumber) => {
              const monthValue = `${displayYear}-${String(monthNumber).padStart(2, '0')}`;
              const isSelected = selectedYear === displayYear && selectedMonth === monthNumber;
              const isFuture = displayYear > currentYear || (displayYear === currentYear && monthNumber > currentMonth);
              const label = new Date(Date.UTC(displayYear, monthNumber - 1, 1)).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
              return (
                <button
                  key={monthValue}
                  type="button"
                  className={isSelected ? 'month-picker-option is-selected' : 'month-picker-option'}
                  aria-pressed={isSelected}
                  disabled={isFuture}
                  onClick={() => { onChange(monthValue); setOpen(false); }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
