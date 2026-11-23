// Live module status for every dashboard: warning banner (expired / expiring / overdue items with direct links),
// headline KPIs, one card per connected module, upcoming deadlines, recent activity and account health.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Progress, Skeleton, Tag, Tooltip, Typography, Empty, Segmented, Badge } from 'antd';
import {
  AlertOutlined, WarningOutlined, InfoCircleOutlined, RightOutlined, ReloadOutlined, CloseOutlined,
  SafetyCertificateOutlined, ToolOutlined, FileProtectOutlined, AuditOutlined, FireOutlined, ReadOutlined,
  CloudOutlined, RadarChartOutlined, EyeOutlined, ProjectOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleFilled, CrownOutlined, LockOutlined, UserOutlined, DatabaseOutlined, BankOutlined,
} from '@ant-design/icons';
import dashboardService from '../../services/dashboardService';
import './DashboardOverview.css';

const { Text } = Typography;

const MODULE_META = {
  incidents: { icon: <SafetyCertificateOutlined />, color: '#f5222d' },
  actions: { icon: <ToolOutlined />, color: '#fa8c16' },
  documents: { icon: <FileProtectOutlined />, color: '#1677ff' },
  approvals: { icon: <AuditOutlined />, color: '#722ed1' },
  permits: { icon: <FireOutlined />, color: '#d4380d' },
  training: { icon: <ReadOutlined />, color: '#13c2c2' },
  environmental: { icon: <CloudOutlined />, color: '#52c41a' },
  risk: { icon: <RadarChartOutlined />, color: '#eb2f96' },
  observations: { icon: <EyeOutlined />, color: '#2f54eb' },
  projects: { icon: <ProjectOutlined />, color: '#597ef7' },
  regulatory: { icon: <BankOutlined />, color: '#a0d911' },
  plan: { icon: <CrownOutlined />, color: '#faad14' },
  storage: { icon: <DatabaseOutlined />, color: '#8c8c8c' },
  security: { icon: <LockOutlined />, color: '#cf1322' },
};
const LEVEL = {
  critical: { icon: <AlertOutlined />, label: 'Action needed' },
  warning: { icon: <WarningOutlined />, label: 'Due soon' },
  info: { icon: <InfoCircleOutlined />, label: 'For your information' },
};
const DISMISS_KEY = 'dash:dismissed';

const readDismissed = () => {
  try { return JSON.parse(sessionStorage.getItem(DISMISS_KEY) || '[]'); } catch (e) { return []; }
};
const dueText = (d) => (d.days < 0 ? `${-d.days} day${d.days === -1 ? '' : 's'} overdue` : d.days === 0 ? 'today' : d.days === 1 ? 'tomorrow' : `in ${d.days} days`);
const ago = (iso) => {
  if (!iso) return '';
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
};

const Sparkline = ({ data = [], color }) => {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="dov-spark" aria-label="incidents per month">
      {data.map((d) => (
        <Tooltip key={d.month} title={`${d.month}: ${d.count}`}>
          <span style={{ height: `${Math.max(6, (d.count / max) * 100)}%`, background: d.count ? color : '#e5e7eb' }} />
        </Tooltip>
      ))}
    </div>
  );
};

/**
 * props:
 *   title      heading shown above the module cards
 *   compact    hide recent activity / account column (for small dashboards)
 */
const DashboardOverview = ({ title = 'Safety status', compact = false }) => {
  const history = useHistory();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dismissed, setDismissed] = useState(readDismissed);
  const [showAll, setShowAll] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState('all');

  const load = useCallback(async (quiet) => {
    if (!quiet) setLoading(true);
    try {
      const res = await dashboardService.getDashboardOverview();
      if (res?.success === false) throw new Error(res.error);
      setData(res?.data || null);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.error || 'Could not load the live status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => { if (!document.hidden) load(true); }, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [load]);

  const go = (link) => { if (link) history.push(link); };
  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try { sessionStorage.setItem(DISMISS_KEY, JSON.stringify(next)); } catch (e) { /* private mode */ }
  };

  const alerts = useMemo(() => (data?.alerts || []).filter((a) => a.level === 'critical' || !dismissed.includes(a.id)), [data, dismissed]);
  const visibleAlerts = showAll ? alerts : alerts.slice(0, 4);
  const worst = alerts[0]?.level;
  const modules = Object.entries(data?.modules || {});
  const deadlines = (data?.deadlines || []).filter((d) => deadlineFilter === 'all' || (deadlineFilter === 'overdue' ? d.overdue : !d.overdue));
  const h = data?.headline || {};
  const acct = data?.account || {};

  if (loading && !data) {
    return <div className="dov"><Skeleton active paragraph={{ rows: 6 }} /></div>;
  }

  return (
    <div className="dov">
      {/* --------------------------------------------- warning banner */}
      {error && (
        <div className="dov-banner dov-error" role="alert">
          <WarningOutlined /> <span>{error}</span>
          <Button size="small" onClick={() => load()}>Retry</Button>
        </div>
      )}
      {alerts.length > 0 ? (
        <section className={`dov-banner dov-${worst}`} role="alert" aria-live="polite">
          <div className="dov-banner-head">
            <span className="dov-banner-icon">{LEVEL[worst]?.icon}</span>
            <strong>{alerts.length} item{alerts.length > 1 ? 's' : ''} need{alerts.length === 1 ? 's' : ''} your attention</strong>
            <Button type="text" size="small" icon={<ReloadOutlined spin={loading} />} onClick={() => load(true)} aria-label="Refresh status" />
          </div>
          <ul className="dov-alerts">
            {visibleAlerts.map((a) => (
              <li key={a.id} className={`dov-alert dov-${a.level}`}>
                <span className="dov-alert-icon" style={{ color: MODULE_META[a.module]?.color }}>{MODULE_META[a.module]?.icon || LEVEL[a.level].icon}</span>
                <span className="dov-alert-text">
                  <strong>{a.title}</strong>
                  <Text type="secondary">{a.detail}</Text>
                </span>
                {a.link && <Button size="small" type={a.level === 'critical' ? 'primary' : 'default'} danger={a.level === 'critical'} onClick={() => go(a.link)}>
                  Check now <RightOutlined />
                </Button>}
                {a.level !== 'critical' && (
                  <Tooltip title="Hide until next sign-in">
                    <Button size="small" type="text" icon={<CloseOutlined />} onClick={() => dismiss(a.id)} aria-label="Dismiss" />
                  </Tooltip>
                )}
              </li>
            ))}
          </ul>
          {alerts.length > 4 && (
            <Button type="link" size="small" onClick={() => setShowAll((v) => !v)}>
              {showAll ? 'Show fewer' : `Show all ${alerts.length}`}
            </Button>
          )}
        </section>
      ) : data && !error && (
        <section className="dov-banner dov-ok"><CheckCircleFilled /> <span>All clear — nothing is expired, overdue or waiting for you.</span></section>
      )}

      {/* --------------------------------------------- headline */}
      {data && (
        <div className="dov-headline">
          <div className="dov-kpi">
            <span className="dov-kpi-label">Days without incident</span>
            <span className="dov-kpi-value" style={{ color: '#52c41a' }}>{h.days_safe ?? '—'}</span>
          </div>
          <div className="dov-kpi dov-click" role="button" tabIndex={0} onClick={() => go('/incidents')} onKeyDown={(e) => e.key === 'Enter' && go('/incidents')}>
            <span className="dov-kpi-label">Open incidents</span>
            <span className="dov-kpi-value" style={{ color: h.open_incidents ? '#fa541c' : undefined }}>{h.open_incidents ?? 0}</span>
          </div>
          <div className="dov-kpi">
            <span className="dov-kpi-label">Overdue deadlines</span>
            <span className="dov-kpi-value" style={{ color: h.overdue_deadlines ? '#cf1322' : undefined }}>{h.overdue_deadlines ?? 0}</span>
          </div>
          <div className="dov-kpi">
            <span className="dov-kpi-label">Safety health <Tooltip title="Starts at 100; each critical item costs 15 points and each warning 5."><InfoCircleOutlined /></Tooltip></span>
            <Progress type="circle" size={54} percent={h.health_score ?? 100}
                      strokeColor={(h.health_score ?? 100) >= 80 ? '#52c41a' : (h.health_score ?? 100) >= 50 ? '#faad14' : '#f5222d'} />
          </div>
          <Tag className="dov-scope" color={data.scope === 'company' ? 'blue' : 'default'}>
            {data.scope === 'company' ? 'Whole company' : 'My items'}
          </Tag>
        </div>
      )}

      {/* --------------------------------------------- module cards */}
      <div className="dov-title"><Text strong>{title}</Text><Text type="secondary"> · click a card to open the module</Text></div>
      <div className="dov-modules">
        {modules.map(([key, m]) => {
          const meta = MODULE_META[key] || {};
          const warn = (m.attention || 0) > 0;
          return (
            <button type="button" key={key} className={`dov-module ${warn ? 'warn' : ''}`} onClick={() => go(m.link)} style={{ '--mod': meta.color }}>
              <span className="dov-module-head">
                <span className="dov-module-icon">{meta.icon}</span>
                <span className="dov-module-label">{m.label}</span>
                {warn && <Badge count={m.attention} overflowCount={99} />}
              </span>
              <span className="dov-module-value">
                {m.open ?? m.total ?? 0}
                <small> {m.open_label || (m.open !== undefined ? 'open' : m.total_label || 'total')}</small>
              </span>
              <span className={`dov-module-sub ${warn ? 'warn' : ''}`}>
                {warn ? `${m.attention} ${m.attention_label}` : `${m.total ?? 0} ${m.total_label || 'in total'}`}
              </span>
              {key === 'incidents' && m.trend && <Sparkline data={m.trend} color={meta.color} />}
              {key === 'documents' && m.review_due > 0 && <span className="dov-module-sub warn">{m.review_due} reviews overdue</span>}
              {key === 'permits' && m.pending > 0 && <span className="dov-module-sub">{m.pending} waiting for approval</span>}
              {key === 'environmental' && (m.reports_due > 0 || m.calibration_overdue > 0) && (
                <span className="dov-module-sub warn">{[m.reports_due && `${m.reports_due} reports due`, m.calibration_overdue && `${m.calibration_overdue} calibrations overdue`].filter(Boolean).join(' · ')}</span>
              )}
            </button>
          );
        })}
        {!modules.length && !loading && <Empty description="No module data yet" />}
      </div>

      {/* --------------------------------------------- deadlines + activity + account */}
      <div className={`dov-columns ${compact ? 'compact' : ''}`}>
        <section className="dov-panel">
          <div className="dov-panel-head">
            <Text strong><CalendarOutlined /> Upcoming & overdue (30 days)</Text>
            <Segmented size="small" value={deadlineFilter} onChange={setDeadlineFilter}
                       options={[{ value: 'all', label: 'All' }, { value: 'overdue', label: 'Overdue' }, { value: 'upcoming', label: 'Upcoming' }]} />
          </div>
          {deadlines.length ? (
            <ul className="dov-deadlines">
              {deadlines.map((d, i) => (
                <li key={`${d.module}-${i}`}>
                  <button type="button" onClick={() => go(d.link)} className={d.overdue ? 'overdue' : d.days <= 7 ? 'soon' : ''}>
                    <span className="dov-dl-icon" style={{ color: MODULE_META[d.module]?.color }}>{MODULE_META[d.module]?.icon || <ClockCircleOutlined />}</span>
                    <span className="dov-dl-title" title={d.title}>{d.title}</span>
                    <span className="dov-dl-when">{d.kind === 'expires' ? 'expires ' : ''}{dueText(d)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing due in the next 30 days" />}
        </section>

        {!compact && (
          <section className="dov-panel">
            <div className="dov-panel-head"><Text strong><ClockCircleOutlined /> Recent activity</Text></div>
            {(data?.recent || []).length ? (
              <ul className="dov-recent">
                {data.recent.map((r, i) => (
                  <li key={i}>
                    <button type="button" onClick={() => go(r.link)}>
                      <span className="dov-dl-icon" style={{ color: MODULE_META[r.module]?.color }}>{MODULE_META[r.module]?.icon}</span>
                      <span className="dov-dl-title" title={r.title}>{r.title}</span>
                      {r.severity && <Tag bordered={false} color={['critical', 'high'].includes(String(r.severity).toLowerCase()) ? 'red' : 'default'}>{r.severity}</Tag>}
                      <span className="dov-dl-when">{ago(r.at)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No activity yet" />}
          </section>
        )}

        {!compact && (
          <section className="dov-panel">
            <div className="dov-panel-head"><Text strong><UserOutlined /> My account</Text></div>
            {acct.plan && (
              <div className="dov-acct-row">
                <Text>Plan</Text>
                <span>
                  <Tag color="gold">{String(acct.plan.plan || 'free').toUpperCase()}</Tag>
                  {acct.plan.trial && <Tag color="orange">trial</Tag>}
                  {acct.plan.days_left !== null && acct.plan.days_left !== undefined && (
                    <Text type={acct.plan.days_left <= 14 ? 'danger' : 'secondary'}>{acct.plan.days_left <= 0 ? 'ends today' : `${acct.plan.days_left} days left`}</Text>
                  )}
                </span>
              </div>
            )}
            {acct.storage && (
              <div className="dov-acct-row dov-acct-col">
                <Text>Storage <Text type="secondary">({acct.storage.used_mb} MB of {acct.storage.limit_mb} MB)</Text></Text>
                <Progress percent={acct.storage.percent} size="small" status={acct.storage.percent >= 90 ? 'exception' : 'normal'} />
              </div>
            )}
            {acct.profile && (
              <div className="dov-acct-row dov-acct-col">
                <Text>Profile complete</Text>
                <Progress percent={acct.profile.completeness} size="small" />
                {acct.profile.missing?.length > 0 && (
                  <div className="dov-missing">
                    {acct.profile.missing.map((m) => (
                      <Tag key={m.field} className="dov-click" color={m.field === 'mfa' ? 'red' : 'default'}
                           onClick={() => go(m.field === 'mfa' ? '/settings/security' : '/profile?tab=edit')}>+ {m.label}</Tag>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="dov-acct-links">
              <Button size="small" onClick={() => go('/profile')}>Profile</Button>
              <Button size="small" onClick={() => go('/settings/security')}>Security</Button>
              <Button size="small" onClick={() => go('/subscription')}>Subscription</Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
