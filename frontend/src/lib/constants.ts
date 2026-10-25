import type { ChartPalette, Theme } from '../types/wind';

export const API = import.meta.env.VITE_API_URL || '';
export const DEFAULT_MONTH = '2026-01';
export const numberFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });
export const integerFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

export function hoursInMonth(month: string): number {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate() * 24;
}

export function monthLabel(month: string, options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
}

export const chartPalettes: Record<Theme, ChartPalette> = {
  dark: { grid: '#22313d', text: '#8ea1ae', actual: '#35cb91', forecast: '#63a5ff', tooltip: '#15222e', border: '#314451', cursor: '#476072' },
  light: { grid: '#dce5e9', text: '#71818b', actual: '#07875e', forecast: '#3478d4', tooltip: '#ffffff', border: '#d2dee3', cursor: '#9db1ba' },
};
