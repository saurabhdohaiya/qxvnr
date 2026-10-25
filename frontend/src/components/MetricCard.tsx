import { numberFormat } from '../lib/constants';

type MetricCardProps = {
  label: string;
  value: number | null | undefined;
  suffix: string;
  detail: string;
  loading: boolean;
  tone?: string;
};

export function MetricCard({ label, value, suffix, detail, loading, tone = '' }: MetricCardProps) {
  return (
    <div className={`metric ${tone}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-number">{loading ? <span className="skeleton" /> : value == null ? '—' : <>{numberFormat.format(value)}<small> {suffix}</small></>}</div>
      <div className="metric-detail">{detail}</div>
    </div>
  );
}
