import {
  Brush, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { Wind } from 'lucide-react';
import { hoursInMonth, integerFormat, numberFormat } from '../lib/constants';
import type { ChartClickEvent, ChartPalette, ChartPoint, Granularity, WindResponse } from '../types/wind';

type ForecastChartProps = {
  data: WindResponse | null;
  month: string;
  chartData: ChartPoint[];
  loading: boolean;
  granularity: Granularity;
  showActual: boolean;
  showForecast: boolean;
  palette: ChartPalette;
  unpaired: number;
  onSelectPoint: (event: ChartClickEvent) => void;
  onGranularityChange: (value: Granularity) => void;
  onToggleSeries: (series: 'actual' | 'forecast') => void;
};

export function ForecastChart({ data, month, chartData, loading, granularity, showActual, showForecast, palette, unpaired, onSelectPoint, onGranularityChange, onToggleSeries }: ForecastChartProps) {
  return (
    <section className="chart-panel overflow-hidden rounded-panel" aria-label="Forecast and actual wind generation chart">
      <div className="chart-heading">
        <div><h3>Forecast against outturn</h3><p>{granularity === 'daily' ? 'Daily mean generation · MW' : 'Hourly generation · MW'}</p></div>
        <div className="chart-tools">
          <div className="view-toggle" role="group" aria-label="Chart interval">
            <button className={granularity === 'daily' ? 'active' : ''} onClick={() => onGranularityChange('daily')}>Daily</button>
            <button className={granularity === 'hourly' ? 'active' : ''} onClick={() => onGranularityChange('hourly')}>Hourly</button>
          </div>
          <div className="series-toggle" role="group" aria-label="Chart series">
            <button className={!showActual ? 'muted-series' : ''} onClick={() => onToggleSeries('actual')} aria-pressed={showActual}><i className="series-swatch actual-swatch" />Actual</button>
            <button className={!showForecast ? 'muted-series' : ''} onClick={() => onToggleSeries('forecast')} aria-pressed={showForecast}><i className="series-swatch forecast-swatch" />Forecast</button>
          </div>
        </div>
      </div>
      {loading && !data ? (
        <div className="chart-state"><span className="spinner" />Loading Elexon observations…</div>
      ) : chartData.length ? (
        <>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: granularity === 'hourly' ? 16 : 4 }} onClick={onSelectPoint}>
                <CartesianGrid stroke={palette.grid} strokeDasharray="2 5" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: palette.text, fontSize: 11 }} axisLine={false} tickLine={false} interval={granularity === 'daily' ? 4 : 47} minTickGap={18} />
                <YAxis domain={[0, 'auto']} tick={{ fill: palette.text, fontSize: 11 }} axisLine={false} tickLine={false} width={48} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  cursor={{ stroke: palette.cursor, strokeDasharray: '3 4' }}
                  contentStyle={{ background: palette.tooltip, border: `1px solid ${palette.border}`, borderRadius: 6, color: 'var(--text)', fontSize: 12 }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: 5 }}
                  formatter={(value, name) => [typeof value === 'number' ? `${numberFormat.format(value)} MW` : '—', name === 'actual' ? 'Actual' : 'Forecast']}
                />
                <ReferenceLine y={0} stroke={palette.grid} />
                {showActual && <Line type="linear" dataKey="actual" name="actual" stroke={palette.actual} strokeWidth={2.2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls={false} />}
                {showForecast && <Line type="linear" dataKey="forecast" name="forecast" stroke={palette.forecast} strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls={false} />}
                {granularity === 'hourly' && <Brush dataKey="label" height={18} travellerWidth={8} stroke={palette.actual} fill="var(--panel)" startIndex={Math.max(0, chartData.length - 72)} endIndex={chartData.length - 1} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-foot">
            <span><i className="status-dot" />{integerFormat.format(data?.pairedCount || 0)} of {integerFormat.format(hoursInMonth(month))} hours matched</span>
            <span>{granularity === 'hourly' ? 'Drag the handles to inspect a time range' : 'Select a day on the chart to inspect it'}</span>
            {unpaired > 0 && <span>{integerFormat.format(unpaired)} forecast-only hours excluded</span>}
          </div>
        </>
      ) : (
        <div className="chart-state empty-state"><Wind size={24} /><strong>No matched delivery hours</strong><span>Elexon returned {integerFormat.format(data?.forecastCount || 0)} forecasts and {integerFormat.format(data?.actualCount || 0)} half-hour actuals.</span></div>
      )}
    </section>
  );
}
