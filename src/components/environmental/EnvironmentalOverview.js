// Environmental overview: only numbers calculated from the company's own records. No sample or estimated values.
import React, { useMemo } from 'react';
import { Empty, Progress, Tag } from 'antd';
import moment from 'moment';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CLOSED = ['resolved', 'closed', 'completed'];
const isOpen = (i) => !CLOSED.includes(String(i.status || '').toLowerCase());
const sampleOk = (s) => (typeof s.compliant === 'boolean' ? s.compliant : (s.complianceStatus || s.status) ? (s.complianceStatus || s.status) === 'compliant' : null);
const progressOf = (g) => Math.max(0, Math.min(100, Math.round(Number(g.progress_percentage ?? g.progress ?? 0) || 0)));
const cut = (t, n = 24) => { const s = String(t || 'Untitled'); return s.length > n ? `${s.slice(0, n - 1)}…` : s; };

const weeks = (rows, dateOf, count) => {
  const out = [];
  for (let i = 7; i >= 0; i -= 1) {
    const start = moment().startOf('isoWeek').subtract(i, 'weeks');
    const end = moment(start).add(1, 'week');
    const inWeek = rows.filter((r) => { const d = dateOf(r); return d && moment(d).isValid() && moment(d).isSameOrAfter(start) && moment(d).isBefore(end); });
    out.push({ week: start.format('D MMM'), ...count(inWeek) });
  }
  return out;
};
const some = (rows, keys) => rows.some((r) => keys.some((k) => r[k] > 0));

function Panel({ title, note, action, children }) {
  return (
    <section className="ev-panel">
      <header><h3>{title}</h3>{action}</header>
      {note && <p className="ev-note">{note}</p>}
      {children}
    </section>
  );
}
const Nothing = ({ text }) => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={text} />;
const More = ({ onClick, children }) => <button type="button" className="ev-link" onClick={onClick}>{children}</button>;

export default function EnvironmentalOverview({ sensors = [], waterSamples = [], incidents = [], goals = [], onGo, onGoal }) {
  const m = useMemo(() => {
    const known = waterSamples.map(sampleOk).filter((x) => x !== null);
    const active = sensors.filter((s) => ['active', 'operational', 'online'].includes(String(s.status || '').toLowerCase())).length;
    return {
      active,
      okRate: known.length ? Math.round((known.filter(Boolean).length / known.length) * 100) : null,
      known: known.length,
      open: incidents.filter(isOpen).length,
      critical: incidents.filter((i) => isOpen(i) && ['critical', 'high'].includes(String(i.severity || '').toLowerCase())).length,
      goal: goals.length ? Math.round(goals.reduce((a, g) => a + progressOf(g), 0) / goals.length) : null,
      aqi: sensors.map((s) => ({ name: cut(s.name || s.device_id, 18), aqi: Number(s.currentMetrics?.aqi) })).filter((s) => s.aqi > 0).slice(0, 10),
      water: weeks(waterSamples, (s) => s.collection_time || s.created_at, (r) => ({ within: r.filter((s) => sampleOk(s) === true).length, outside: r.filter((s) => sampleOk(s) === false).length })),
      inc: weeks(incidents, (i) => i.reported_date || i.created_at, (r) => ({ high: r.filter((i) => ['critical', 'high'].includes(String(i.severity || '').toLowerCase())).length, other: r.filter((i) => !['critical', 'high'].includes(String(i.severity || '').toLowerCase())).length }))
    };
  }, [sensors, waterSamples, incidents, goals]);
  const dash = (v, s = '') => (v === null || v === undefined ? 'No data' : `${v}${s}`);

  return (
    <div className="ev-over">
      <dl className="ev-kpis">
        <div><dt>Sensors active</dt><dd>{sensors.length ? `${m.active} of ${sensors.length}` : 'No data'}</dd></div>
        <div><dt>Water samples within limits</dt><dd>{dash(m.okRate, '%')}</dd><small>{m.known ? `${m.known} assessed` : 'Add a sample to start'}</small></div>
        <div className={m.critical ? 'warn' : ''}><dt>Open incidents</dt><dd>{m.open}</dd><small>{m.critical ? `${m.critical} high or critical` : 'None high or critical'}</small></div>
        <div><dt>Average goal progress</dt><dd>{dash(m.goal, '%')}</dd><small>{goals.length} goals</small></div>
      </dl>

      <div className="ev-grid">
        <Panel title="Incidents per week" note="Last 8 weeks, from reported incidents." action={<More onClick={() => onGo('incidents')}>Open incidents</More>}>
          {some(m.inc, ['high', 'other']) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={m.inc} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="week" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Legend />
                <Bar dataKey="high" stackId="a" name="High or critical" fill="#c2410c" /><Bar dataKey="other" stackId="a" name="Other" fill="#f3b562" />
              </BarChart>
            </ResponsiveContainer>
          ) : <Nothing text="No incidents in the last 8 weeks" />}
        </Panel>

        <Panel title="Water samples per week" note="Last 8 weeks, from your samples." action={<More onClick={() => onGo('water-quality')}>Open water quality</More>}>
          {some(m.water, ['within', 'outside']) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={m.water} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="week" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Legend />
                <Bar dataKey="within" stackId="a" name="Within limits" fill="#1d7f5f" /><Bar dataKey="outside" stackId="a" name="Outside limits" fill="#c2410c" />
              </BarChart>
            </ResponsiveContainer>
          ) : <Nothing text="No samples in the last 8 weeks" />}
        </Panel>

        <Panel title="Air quality index by sensor" note="Latest reading of each sensor." action={<More onClick={() => onGo('air-quality')}>Open air quality</More>}>
          {m.aqi.length ? (
            <ResponsiveContainer width="100%" height={Math.max(180, m.aqi.length * 34 + 40)}>
              <BarChart data={m.aqi} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" fontSize={12} /><YAxis type="category" dataKey="name" width={130} fontSize={12} /><Tooltip />
                <Bar dataKey="aqi" name="AQI" fill="#1561c9" barSize={16} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Nothing text="No air readings yet" />}
        </Panel>

        <Panel title="Sustainability goals" action={<More onClick={() => onGo('goals')}>Open goals</More>}>
          {goals.length ? goals.slice(0, 5).map((g) => (
            <button type="button" className="ev-row" key={g.id} onClick={() => onGoal(g)}>
              <span className="ev-row-t">{g.goal || 'Untitled goal'}</span>
              <Progress percent={progressOf(g)} size="small" strokeColor="#1561c9" />
            </button>
          )) : <Nothing text="No goals yet" />}
        </Panel>

        <Panel title="Latest incidents" action={<More onClick={() => onGo('incidents')}>View all</More>}>
          {incidents.length ? incidents.slice(0, 5).map((i) => (
            <div className="ev-row" key={i.id}>
              <span className="ev-row-t">{i.title || 'Untitled incident'}<small>{[i.location, i.reported_date && moment(i.reported_date).fromNow()].filter(Boolean).join(', ')}</small></span>
              <span className="ev-tags"><Tag color={['critical', 'high'].includes(String(i.severity).toLowerCase()) ? 'red' : 'gold'}>{i.severity || 'not set'}</Tag><Tag>{String(i.status || 'reported').replace(/_/g, ' ')}</Tag></span>
            </div>
          )) : <Nothing text="No incidents reported" />}
        </Panel>

        <Panel title="Latest water samples" action={<More onClick={() => onGo('water-quality')}>View all</More>}>
          {waterSamples.length ? waterSamples.slice(0, 5).map((s) => {
            const ok = sampleOk(s);
            return (
              <div className="ev-row" key={s.id}>
                <span className="ev-row-t">{s.location || 'Location not set'}<small>{[s.site_name || s.siteName, `pH ${s.ph_level ?? s.ph ?? 'not measured'}`].filter(Boolean).join(', ')}</small></span>
                <span className="ev-tags"><Tag color={ok === true ? 'green' : ok === false ? 'red' : 'default'}>{ok === true ? 'Within limits' : ok === false ? 'Outside limits' : 'Not assessed'}</Tag></span>
              </div>
            );
          }) : <Nothing text="No water samples yet" />}
        </Panel>
      </div>
    </div>
  );
}
