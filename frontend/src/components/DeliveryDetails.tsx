import { ArrowDownRight, ArrowUpRight, ChevronDown, Clock3, Gauge, Zap } from 'lucide-react';
import { numberFormat } from '../lib/constants';
import type { ChartPoint, Granularity } from '../types/wind';

export function DecisionSnapshot() {
  return (
    <section className="decision-rule" aria-label="Forecast decision rule">
      <span className="rule-marker"><Clock3 size={16} /></span>
      <div><strong>Decision snapshot</strong><span>Latest forecast published by <b>11:00 UTC, day before delivery</b></span></div>
      <span className="rule-value">OUTTURN MATCHED BY DELIVERY HOUR</span>
    </section>
  );
}

type SelectedDeliveryProps = { point?: ChartPoint; granularity: Granularity; periodText: string };

export function SelectedDelivery({ point, granularity, periodText }: SelectedDeliveryProps) {
  const error = point?.forecast != null && point.actual != null ? point.forecast - point.actual : null;

  return (
    <section className="detail-row" aria-label="Selected delivery period">
      <div className="interpretation">
        <div className="interpretation-mark"><Zap size={16} /></div>
        <div><span className="mini-label">READING THE BIAS</span><p>A positive bias means wind was over-forecast. Treat forecast error as a sizing input alongside demand and portfolio position.</p></div>
      </div>
      <div className="selected-detail" aria-live="polite">
        <div className="selected-heading"><div><span className="mini-label">{granularity === 'daily' ? 'SELECTED DAY' : 'SELECTED DELIVERY HOUR'}</span><strong>{point?.label || 'No period selected'}</strong></div><span className="selected-period">{periodText}</span></div>
        <div className="selected-values">
          <SelectedValue label="Forecast" value={point?.forecast} />
          <SelectedValue label="Actual" value={point?.actual} />
          <SelectedValue label="Error" value={error} isError />
        </div>
        {granularity === 'hourly' && point?.publishTime && <div className="publish-time">Forecast published {new Date(point.publishTime).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</div>}
      </div>
    </section>
  );
}

type SelectedValueProps = { label: string; value: number | null | undefined; isError?: boolean };

function SelectedValue({ label, value, isError = false }: SelectedValueProps) {
  const tone = isError && value != null ? value > 0 ? 'is-positive' : value < 0 ? 'is-negative' : '' : '';
  const Icon = value != null && value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className={`selected-value ${tone}`}>
      <span>{label}</span>
      <strong>{value == null ? '—' : `${isError && value > 0 ? '+' : ''}${numberFormat.format(value)} MW`}</strong>
      {isError && value != null && <Icon size={13} />}
    </div>
  );
}

export function MethodDetails() {
  return (
    <details className="method-details" id="method">
      <summary><span><Gauge size={15} />Method and limits</span><ChevronDown size={15} className="details-chevron" /></summary>
      <div className="method-content">
        <p><strong>Snapshot.</strong> For each delivery hour, the latest WINDFOR record published by 11:00 UTC on the previous day is selected.</p>
        <p><strong>Match.</strong> Hourly forecasts are matched to the mean of the :00 and :30 FUELHH WIND actuals. Incomplete pairs are excluded.</p>
        <p><strong>Metrics.</strong> Error is forecast minus actual. MAE is mean absolute error; RMSE weights larger misses; bias is mean signed error.</p>
        <p><strong>Scope.</strong> National wind only. Demand and thermal availability are not included, so this is not a full residual procurement position.</p>
      </div>
    </details>
  );
}
