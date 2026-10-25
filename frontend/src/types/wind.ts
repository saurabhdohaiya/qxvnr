export type WindPoint = {
  startTime: string;
  actual: number | null;
  forecast: number | null;
  error: number | null;
  publishTime: string | null;
};

export type WindResponse = {
  month: string;
  actualCount: number;
  actualHourCount: number;
  forecastCount: number;
  pairedCount: number;
  metrics: { mae: number | null; rmse: number | null; bias: number | null; coverage: number | null };
  points: WindPoint[];
};

export type DailyPoint = {
  key: string;
  label: string;
  actual: number | null;
  forecast: number | null;
  publishTime?: string | null;
  periodCount: number;
};

export type HourlyPoint = WindPoint & { key: string; label: string };
export type ChartPoint = DailyPoint | HourlyPoint;
export type Granularity = 'daily' | 'hourly';
export type Theme = 'light' | 'dark';

export type ChartPalette = {
  grid: string;
  text: string;
  actual: string;
  forecast: string;
  tooltip: string;
  border: string;
  cursor: string;
};

export type ChartClickEvent = { activePayload?: Array<{ payload?: ChartPoint }> } | null;
