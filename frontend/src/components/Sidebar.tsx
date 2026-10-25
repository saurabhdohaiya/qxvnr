import { Activity, CircleHelp, Wind } from 'lucide-react';
import { monthLabel } from '../lib/constants';

type SidebarProps = { loading: boolean; error: string; month: string };

export function Sidebar({ loading, error, month }: SidebarProps) {
  return (
    <aside className="sidebar shrink-0">
      <a className="brand" href="#overview" aria-label="Northstar Wind Desk home">
        <span className="brand-mark"><Wind size={18} strokeWidth={2.2} /></span>
        <span className="brand-name">NORTHSTAR<span>POWER TRADING</span></span>
      </a>
      <div className="book-context">
        <span className="context-mark">GB</span>
        <span><strong>National wind</strong><small>Day-ahead desk</small></span>
        <span className="context-period">{monthLabel(month, { month: 'short', year: '2-digit' }).toLocaleUpperCase('en-GB')}</span>
      </div>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="side-nav" aria-label="Dashboard sections">
        <a className="nav-item" href="#overview"><Wind size={16} />Overview</a>
        <a className="nav-item" href="#accuracy"><Activity size={16} />Accuracy</a>
        <a className="nav-item" href="#method"><CircleHelp size={16} />Method</a>
      </nav>
      <div className="sidebar-bottom">
        <span className={`feed-indicator ${error ? 'is-error' : loading ? 'is-loading' : ''}`} />
        <span><strong>{error ? 'Source unavailable' : loading ? 'Connecting to Elexon' : 'Elexon source'}</strong><small>{error ? 'Retry from the dashboard' : loading ? 'Loading observations' : 'BMRS Insights API'}</small></span>
      </div>
    </aside>
  );
}
