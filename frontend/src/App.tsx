import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { AccuracySection } from './components/AccuracySection';
import { DecisionSnapshot, MethodDetails, SelectedDelivery } from './components/DeliveryDetails';
import { MonthPicker } from './components/MonthPicker';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DEFAULT_MONTH, chartPalettes, monthLabel } from './lib/constants';
import { downloadWindCsv, toDailyPoints, toHourlyPoints } from './lib/windData';
import { useTheme } from './hooks/useTheme';
import { useWindData } from './hooks/useWindData';
import type { ChartClickEvent, ChartPoint, Granularity } from './types/wind';

export default function App() {
  const [reload, setReload] = useState(0);
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [granularity, setGranularity] = useState<Granularity>('daily');
  const [showActual, setShowActual] = useState(true);
  const [showForecast, setShowForecast] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [exported, setExported] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data, loading, error } = useWindData(reload, month);

  const dailyData = useMemo(() => toDailyPoints(data), [data]);
  const hourlyData = useMemo(() => toHourlyPoints(data), [data]);
  const chartData: ChartPoint[] = granularity === 'daily' ? dailyData : hourlyData;
  const selectedPoint = chartData.find((point) => point.key === selectedKey)
    || [...chartData].reverse().find((point) => point.actual != null && point.forecast != null)
    || chartData.at(-1);
  const unpaired = Math.max(0, (data?.forecastCount || 0) - (data?.pairedCount || 0));
  const bias = data?.metrics?.bias ?? null;
  const selectedPeriodText = selectedPoint
    ? 'periodCount' in selectedPoint && selectedPoint.periodCount
      ? `${selectedPoint.periodCount} matched hours`
      : 'startTime' in selectedPoint ? 'UTC' : '—'
    : '—';

  const selectPoint = (event: ChartClickEvent) => {
    const point = event?.activePayload?.[0]?.payload;
    if (point?.key) setSelectedKey(point.key);
  };

  const changeGranularity = (next: Granularity) => {
    setGranularity(next);
    setSelectedKey(null);
  };

  const toggleSeries = (series: 'actual' | 'forecast') => {
    if (series === 'actual') setShowActual((visible) => !visible);
    else setShowForecast((visible) => !visible);
  };

  const exportCsv = () => {
    if (!data?.points?.length) return;
    downloadWindCsv(data.points, month);
    setExported(true);
    window.setTimeout(() => setExported(false), 2200);
  };

  return (
    <div className="app-shell flex min-h-screen bg-canvas text-ink">
      <Sidebar loading={loading} error={error} month={month} />
      <main className="main-area min-w-0 flex-1">
        <TopBar theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
        <div className="content" id="overview">
          <section className="page-heading">
            <div>
              <div className="eyebrow">{monthLabel(month).toLocaleUpperCase('en-GB')} <span>·</span> DAY-AHEAD</div>
              <h1>Wind forecast</h1>
              <p className="page-deck">A decision-time view of forecast error against national wind outturn.</p>
            </div>
            <div className="heading-actions">
              <MonthPicker value={month} onChange={(nextMonth) => { setMonth(nextMonth); setSelectedKey(null); }} />
              <button className="quiet-button inline-flex items-center justify-center rounded-control transition-colors" type="button" onClick={() => setReload((count) => count + 1)} disabled={loading}>
                <RefreshCw size={15} className={loading ? 'spin' : ''} />
                <span>{loading ? 'Updating' : 'Refresh'}</span>
              </button>
            </div>
          </section>

          <DecisionSnapshot />
          {error && <div className="error-banner" role="alert"><strong>Couldn’t load wind data.</strong><span>{error}</span><button onClick={() => setReload((count) => count + 1)}>Try again</button></div>}

          <AccuracySection
            data={data} month={month} loading={loading} bias={bias} exported={exported} granularity={granularity}
            chartData={chartData} showActual={showActual} showForecast={showForecast} palette={chartPalettes[theme]}
            unpaired={unpaired} onExport={exportCsv} onSelectPoint={selectPoint}
            onGranularityChange={changeGranularity} onToggleSeries={toggleSeries}
          />
          <SelectedDelivery point={selectedPoint} granularity={granularity} periodText={selectedPeriodText} />
          <MethodDetails />
          <footer className="page-footer"><span>Northstar <i>·</i> Wind Desk</span><span>Source: Elexon BMRS <i>·</i> All times UTC</span></footer>
        </div>
      </main>
    </div>
  );
}
