import type { DailyPoint, HourlyPoint, WindPoint, WindResponse } from '../types/wind';

export function average(points: WindPoint[], key: 'actual' | 'forecast'): number | null {
  const values = points.map((point) => point[key]).filter((value): value is number => value != null);
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
}

export function toDailyPoints(data: WindResponse | null): DailyPoint[] {
  if (!data?.points) return [];
  const grouped = new Map<string, WindPoint[]>();
  data.points.forEach((point) => {
    if (!point.startTime) return;
    const day = point.startTime.slice(0, 10);
    if (!grouped.has(day)) grouped.set(day, []);
    grouped.get(day)?.push(point);
  });

  return [...grouped.entries()].map(([day, points]) => ({
    key: day,
    label: new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }),
    actual: average(points, 'actual'),
    forecast: average(points, 'forecast'),
    publishTime: points.at(-1)?.publishTime,
    periodCount: points.filter((point) => point.actual != null && point.forecast != null).length,
  }));
}

export function toHourlyPoints(data: WindResponse | null): HourlyPoint[] {
  return (data?.points || []).map((point) => ({
    ...point,
    key: point.startTime,
    label: point.startTime ? new Date(point.startTime).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC',
    }) : '',
  }));
}

export function downloadWindCsv(points: WindPoint[], month: string): void {
  const rows = [
    'Delivery start UTC,Forecast MW,Actual MW,Error MW,Forecast published UTC',
    ...points.map((point) => [point.startTime, point.forecast ?? '', point.actual ?? '', point.error ?? '', point.publishTime ?? ''].join(',')),
  ];
  const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `wind-desk-${month}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
