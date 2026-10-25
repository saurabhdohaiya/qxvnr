import { Check, Download } from 'lucide-react';
import { hoursInMonth, integerFormat } from '../lib/constants';
import type { ChartClickEvent, ChartPalette, ChartPoint, Granularity, WindResponse } from '../types/wind';
import { ForecastChart } from './ForecastChart';
import { MetricCard } from './MetricCard';

type AccuracySectionProps = {
  data: WindResponse | null;
  month: string;
  loading: boolean;
  bias: number | null;
  exported: boolean;
  granularity: Granularity;
  chartData: ChartPoint[];
  showActual: boolean;
  showForecast: boolean;
  palette: ChartPalette;
  unpaired: number;
  onExport: () => void;
  onSelectPoint: (event: ChartClickEvent) => void;
  onGranularityChange: (value: Granularity) => void;
  onToggleSeries: (series: 'actual' | 'forecast') => void;
};

export function AccuracySection(props: AccuracySectionProps) {
  const { data, month, loading, bias, exported, granularity, chartData, showActual, showForecast, palette, unpaired,
    onExport, onSelectPoint, onGranularityChange, onToggleSeries } = props;

  return (
    <section className="accuracy-section" id="accuracy">
      <div className="section-heading">
        <div><h2>Forecast accuracy</h2><p>National wind · hourly forecasts matched to two half-hour actuals</p></div>
        <button className="quiet-button export-button inline-flex items-center justify-center rounded-control transition-colors" type="button" onClick={onExport} disabled={!data?.points?.length}>
          {exported ? <Check size={15} /> : <Download size={15} />}
          <span>{exported ? 'Downloaded' : 'Export CSV'}</span>
        </button>
      </div>
      <div className="metrics grid grid-cols-2 xl:grid-cols-4" aria-label="Forecast accuracy metrics">
        <MetricCard label="Mean absolute error" value={data?.metrics?.mae} suffix="MW" detail="Typical miss" loading={loading} />
        <MetricCard label="Root mean square error" value={data?.metrics?.rmse} suffix="MW" detail="Weights large misses" loading={loading} />
        <MetricCard label="Mean bias" value={bias} suffix="MW" detail={bias != null && bias > 0 ? 'Wind over-forecast' : bias != null && bias < 0 ? 'Wind under-forecast' : 'Forecast minus actual'} loading={loading} tone={bias != null && bias > 0 ? 'positive' : bias != null && bias < 0 ? 'negative' : ''} />
        <MetricCard label="Matched coverage" value={data?.metrics?.coverage} suffix="%" detail={`${integerFormat.format(data?.pairedCount || 0)} / ${integerFormat.format(hoursInMonth(month))} hours`} loading={loading} />
      </div>
      <ForecastChart
        data={data} month={month} chartData={chartData} loading={loading} granularity={granularity}
        showActual={showActual} showForecast={showForecast} palette={palette} unpaired={unpaired}
        onSelectPoint={onSelectPoint} onGranularityChange={onGranularityChange} onToggleSeries={onToggleSeries}
      />
    </section>
  );
}
