// Environmental dashboard: stat cards, colour blocks, circles, charts, lists and analysis windows.
// Every figure is calculated from the company's own records. No sample or estimated values.
import React, { useMemo, useState } from 'react';
import { Avatar, Button, Card, Col, Empty, List, Modal, Progress, Row, Space, Statistic, Table, Tag, Timeline, Tooltip } from 'antd';
import {
  CheckCircleOutlined, CloudOutlined, ExpandAltOutlined, ExperimentOutlined, RiseOutlined, TrophyOutlined, WarningOutlined
} from '@ant-design/icons';
import moment from 'moment';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar, RadarChart, ResponsiveContainer, Tooltip as ChartTip, XAxis, YAxis
} from 'recharts';

const COLORS = ['#1677ff', '#13a8a8', '#d48806', '#cf1322', '#722ed1', '#389e0d', '#c41d7f', '#595959'];
const SEVERITY = { critical: '#a8071a', high: '#f5222d', medium: '#fa8c16', low: '#52c41a' };
const CLOSED = ['resolved', 'closed', 'completed'];
const low = (v) => String(v || '').toLowerCase();
const isOpen = (i) => !CLOSED.includes(low(i.status));
const sampleOk = (s) => (typeof s.compliant === 'boolean' ? s.compliant : (s.complianceStatus || s.status) ? (s.complianceStatus || s.status) === 'compliant' : null);
const progressOf = (g) => Math.max(0, Math.min(100, Math.round(Number(g.progress_percentage ?? g.progress ?? 0) || 0)));
const cut = (t, n = 24) => { const s = String(t || 'Untitled'); return s.length > n ? `${s.slice(0, n - 1)}…` : s; };
const pct = (a, b) => (b ? Math.round((a / b) * 100) : null);
const words = (t) => { const s = String(t || 'Other').replace(/_/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1); };
const num = (v) => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Math.round(Number(v) * 100) / 100 : null);
const goalColor = (p) => (p >= 75 ? '#389e0d' : p >= 40 ? '#1677ff' : '#d48806');
const aqiColor = (a) => (a <= 50 ? '#389e0d' : a <= 100 ? '#d48806' : a <= 150 ? '#d4380d' : '#a8071a');
const count = (rows, of) => {
  const m = {};
  rows.forEach((r) => { const k = of(r); m[k] = (m[k] || 0) + 1; });
  return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};
const weeks = (rows, dateOf, sum) => {
  const out = [];
  for (let i = 7; i >= 0; i -= 1) {
    const start = moment().startOf('isoWeek').subtract(i, 'weeks');
    const end = moment(start).add(1, 'week');
    out.push({ week: start.format('D MMM'), ...sum(rows.filter((r) => { const d = dateOf(r); return d && moment(d).isValid() && moment(d).isSameOrAfter(start) && moment(d).isBefore(end); })) });
  }
  return out;
};
const some = (rows, keys) => rows.some((r) => keys.some((k) => r[k] > 0));
const Nothing = ({ text }) => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={text} />;

export default function EnvironmentalOverview({ sensors = [], waterSamples = [], incidents = [], goals = [], onGo, onGoal }) {
  const [view, setView] = useState(null);
  const m = useMemo(() => {
    const known = waterSamples.map(sampleOk).filter((x) => x !== null);
    const ok = known.filter(Boolean).length;
    const active = sensors.filter((s) => ['active', 'operational', 'online'].includes(low(s.status))).length;
    const closed = incidents.filter((i) => !isOpen(i)).length;
    const types = count(incidents, (i) => words(i.type || i.incident_type));
    return {
      active, ok, closed,
      known: known.length,
      okRate: pct(ok, known.length),
      online: pct(active, sensors.length),
      closedRate: pct(closed, incidents.length),
      open: incidents.length - closed,
      critical: incidents.filter((i) => isOpen(i) && ['critical', 'high'].includes(low(i.severity))).length,
      goal: goals.length ? Math.round(goals.reduce((a, g) => a + progressOf(g), 0) / goals.length) : null,
      done: goals.filter((g) => progressOf(g) >= 100).length,
      aqi: sensors.map((s) => ({ name: cut(s.name || s.device_id, 16), aqi: num(s.currentMetrics?.aqi), pm25: num(s.currentMetrics?.pm25), pm10: num(s.currentMetrics?.pm10) })).filter((s) => s.aqi > 0).slice(0, 12),
      water: weeks(waterSamples, (s) => s.collection_time || s.created_at, (r) => {
        const k = r.map(sampleOk).filter((x) => x !== null);
        return { samples: r.length, compliance: pct(k.filter(Boolean).length, k.length) };
      }),
      inc: weeks(incidents, (i) => i.reported_date || i.created_at, (r) => {
        const high = r.filter((i) => ['critical', 'high'].includes(low(i.severity))).length;
        return { high, other: r.length - high };
      }),
      goals: goals.slice(0, 8).map((g) => ({ name: cut(g.goal, 18), progress: progressOf(g) })),
      types,
      severity: count(incidents, (i) => words(i.severity || 'not set')),
      records: [{ name: 'Sensors', value: sensors.length }, { name: 'Water samples', value: waterSamples.length }, { name: 'Incidents', value: incidents.length }, { name: 'Goals', value: goals.length }].filter((x) => x.value)
    };
  }, [sensors, waterSamples, incidents, goals]);

  const radar = [['Sensors online', m.online], ['Water within limits', m.okRate], ['Incidents closed', m.closedRate], ['Goal progress', m.goal]]
    .filter(([, v]) => v !== null).map(([area, value]) => ({ area, value }));
  const donut = (rows, color) => (h) => (
    <ResponsiveContainer width="100%" height={h}>
      <PieChart>
        <Pie data={rows} cx="50%" cy="46%" innerRadius={h * 0.2} outerRadius={h * 0.34} paddingAngle={4} dataKey="value" isAnimationActive={false} label={({ value }) => value}>
          {rows.map((r, i) => <Cell key={r.name} fill={color?.(r) || COLORS[i % COLORS.length]} />)}
        </Pie>
        <ChartTip /><Legend />
      </PieChart>
    </ResponsiveContainer>
  );
  const table = (pairs) => pairs.map(([title, dataIndex]) => ({ title, dataIndex, key: dataIndex, render: (v) => (v === null || v === undefined ? 'No data' : v) }));

  const CHARTS = [
    {
      key: 'aqi', title: 'Air quality index by sensor', note: 'Latest reading of each sensor.', icon: <CloudOutlined />, go: 'air-quality', data: m.aqi, has: m.aqi.length > 0, empty: 'No air readings yet',
      cols: table([['Sensor', 'name'], ['AQI', 'aqi'], ['PM2.5', 'pm25'], ['PM10', 'pm10']]),
      draw: (h) => (
        <ResponsiveContainer width="100%" height={h}>
          <AreaChart data={m.aqi} margin={{ left: -14, right: 12, top: 8 }}>
            <defs><linearGradient id="evAqi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1677ff" stopOpacity={0.75} /><stop offset="95%" stopColor="#1677ff" stopOpacity={0.08} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} interval={0} tickFormatter={(t) => cut(t, 10)} /><YAxis fontSize={12} /><ChartTip /><Legend />
            <Area type="monotone" dataKey="aqi" name="AQI" stroke="#1677ff" fill="url(#evAqi)" isAnimationActive={false} dot />
            <Area type="monotone" dataKey="pm25" name="PM2.5" stroke="#389e0d" fill="none" strokeWidth={2} isAnimationActive={false} />
            <Area type="monotone" dataKey="pm10" name="PM10" stroke="#d48806" fill="none" strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      )
    },
    {
      key: 'water', title: 'Water compliance', note: 'Last 8 weeks, from your samples.', icon: <ExperimentOutlined />, go: 'water-quality', data: m.water, has: some(m.water, ['samples']), empty: 'No samples in the last 8 weeks',
      cols: table([['Week from', 'week'], ['Samples', 'samples'], ['Within limits %', 'compliance']]),
      draw: (h) => (
        <ResponsiveContainer width="100%" height={h}>
          <ComposedChart data={m.water} margin={{ left: -14, right: -14, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" fontSize={12} /><YAxis yAxisId="l" domain={[0, 100]} fontSize={12} /><YAxis yAxisId="r" orientation="right" allowDecimals={false} fontSize={12} /><ChartTip /><Legend />
            <Bar yAxisId="l" dataKey="compliance" name="Within limits %" fill="#52c41a" barSize={26} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Line yAxisId="r" type="monotone" dataKey="samples" name="Samples" stroke="#1677ff" strokeWidth={2} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )
    },
    {
      key: 'inc', title: 'Incident trend', note: 'Last 8 weeks, from reported incidents.', icon: <WarningOutlined />, go: 'incidents', data: m.inc, has: some(m.inc, ['high', 'other']), empty: 'No incidents in the last 8 weeks',
      cols: table([['Week from', 'week'], ['High or critical', 'high'], ['Other', 'other']]),
      draw: (h) => (
        <ResponsiveContainer width="100%" height={h}>
          <BarChart data={m.inc} margin={{ left: -14, right: 12, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><ChartTip /><Legend />
            <Bar dataKey="high" stackId="a" name="High or critical" fill="#f5222d" isAnimationActive={false} /><Bar dataKey="other" stackId="a" name="Other" fill="#ffa940" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      )
    },
    {
      key: 'goals', title: 'Goal progress', note: 'Progress recorded on each goal.', icon: <RiseOutlined />, go: 'goals', data: m.goals, has: m.goals.length > 0, empty: 'No goals yet',
      cols: table([['Goal', 'name'], ['Progress %', 'progress']]),
      draw: (h) => (
        <ResponsiveContainer width="100%" height={h}>
          <BarChart data={m.goals} layout="vertical" margin={{ left: 12, right: 16, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" domain={[0, 100]} fontSize={12} /><YAxis type="category" dataKey="name" width={112} fontSize={11} /><ChartTip />
            <Bar dataKey="progress" name="Progress %" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false}>{m.goals.map((g, i) => <Cell key={i} fill={goalColor(g.progress)} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      )
    },
    { key: 'types', title: 'Incidents by type', note: 'All recorded incidents.', icon: <WarningOutlined />, go: 'incidents', data: m.types, has: m.types.length > 0, empty: 'No incidents recorded', cols: table([['Type', 'name'], ['Incidents', 'value']]), draw: donut(m.types) },
    { key: 'sev', title: 'Incidents by severity', note: 'All recorded incidents.', icon: <WarningOutlined />, go: 'incidents', data: m.severity, has: m.severity.length > 0, empty: 'No incidents recorded', cols: table([['Severity', 'name'], ['Incidents', 'value']]), draw: donut(m.severity, (r) => SEVERITY[low(r.name)]) },
    { key: 'rec', title: 'Record distribution', note: 'What your dashboard is built from.', icon: <CloudOutlined />, go: 'analytics', data: m.records, has: m.records.length > 0, empty: 'No records yet', cols: table([['Records', 'name'], ['Count', 'value']]), draw: donut(m.records) },
    {
      key: 'radar', title: 'Performance overview', note: 'Each area out of 100%.', icon: <TrophyOutlined />, go: 'impact', data: radar, has: radar.length > 2, empty: 'Needs at least three areas with records',
      cols: table([['Area', 'area'], ['Score %', 'value']]),
      draw: (h) => (
        <ResponsiveContainer width="100%" height={h}>
          <RadarChart data={radar} outerRadius="68%"><PolarGrid /><PolarAngleAxis dataKey="area" fontSize={12} /><PolarRadiusAxis domain={[0, 100]} fontSize={10} /><Radar dataKey="value" name="Score %" stroke="#722ed1" fill="#722ed1" fillOpacity={0.4} isAnimationActive={false} /><ChartTip /></RadarChart>
        </ResponsiveContainer>
      )
    }
  ];
  const openView = (key) => setView(CHARTS.find((c) => c.key === key));
  const val = (v, s = '%') => (v === null ? 'No data' : `${v}${s}`);
  const link = (text, tab) => <Button type="link" size="small" onClick={() => onGo(tab)}>{text}</Button>;

  const stats = [
    { title: 'Active sensors', value: sensors.length ? m.active : 'No data', suffix: sensors.length ? `/ ${sensors.length}` : '', icon: <CloudOutlined />, color: '#1677ff', bar: m.online, chart: 'aqi' },
    { title: 'Water samples within limits', value: m.known ? m.ok : 'No data', suffix: m.known ? `/ ${m.known}` : '', icon: <ExperimentOutlined />, color: '#389e0d', bar: m.okRate, chart: 'water' },
    { title: 'Open incidents', value: m.open, suffix: '', icon: <WarningOutlined />, color: '#d4380d', tag: m.critical ? `${m.critical} high or critical` : 'None high or critical', warn: m.critical > 0, chart: 'inc' },
    { title: 'Sustainability progress', value: val(m.goal), suffix: '', icon: <RiseOutlined />, color: '#722ed1', bar: m.goal, chart: 'goals' }
  ];
  const blocks = [
    { cls: 'b1', title: 'Total sensors', value: sensors.length, note: `${m.active} active`, icon: <CloudOutlined />, chart: 'aqi' },
    { cls: 'b2', title: 'Water quality', value: val(m.okRate), note: `${m.ok} of ${m.known} within limits`, icon: <ExperimentOutlined />, chart: 'water' },
    { cls: 'b3', title: 'Sustainability goals', value: goals.length, note: `${m.done} completed`, icon: <TrophyOutlined />, chart: 'goals' }
  ];
  const circles = [['Sensors online', m.online, '#1677ff', 'aqi'], ['Water within limits', m.okRate, '#389e0d', 'water'], ['Incidents closed', m.closedRate, '#d4380d', 'inc'], ['Goal progress', m.goal, '#722ed1', 'goals']];

  return (
    <div className="ev-over">
      <Row gutter={[16, 16]}>
        {stats.map((s) => (
          <Col xs={24} sm={12} xl={6} key={s.title}>
            <Card className="ev-stat" hoverable onClick={() => openView(s.chart)} style={{ '--c': s.color }}>
              <Statistic title={s.title} value={s.value} suffix={s.suffix} prefix={s.icon} valueStyle={{ color: s.color }} />
              {s.tag ? <Tag color={s.warn ? 'volcano' : 'green'}>{s.tag}</Tag> : <Progress percent={s.bar ?? 0} size="small" showInfo={false} strokeColor={s.color} />}
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {blocks.map((b) => (
          <Col xs={24} md={8} key={b.title}>
            <button type="button" className={`ev-block ${b.cls}`} onClick={() => openView(b.chart)}>
              <span><em>{b.title}</em><strong>{b.value}</strong><small><CheckCircleOutlined /> {b.note}</small></span>{b.icon}
            </button>
          </Col>
        ))}
      </Row>

      <Card title="Performance at a glance" className="ev-card">
        <div className="ev-circles">
          {circles.map(([title, v, color, chart]) => (
            <button type="button" key={title} onClick={() => openView(chart)}>
              <Progress type="dashboard" percent={v ?? 0} size={132} strokeColor={color} strokeWidth={9} format={() => (v === null ? <span className="ev-none">No data</span> : `${v}%`)} />
              <span>{title}</span>
            </button>
          ))}
        </div>
      </Card>

      <h2 className="ev-h2">Environmental analytics</h2>
      <Row gutter={[16, 16]}>
        {CHARTS.map((c) => (
          <Col xs={24} lg={12} key={c.key}>
            <Card
              className="ev-card"
              size="small"
              title={<Space>{c.icon}{c.title}</Space>}
              extra={<Tooltip title="Open analysis"><Button type="text" icon={<ExpandAltOutlined />} aria-label={`Open analysis: ${c.title}`} onClick={() => setView(c)} /></Tooltip>}
            >
              <p className="ev-note">{c.note}</p>
              <div className="ev-chart">{c.has ? c.draw(230) : <Nothing text={c.empty} />}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <h2 className="ev-h2">Latest records</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="ev-card" title="Air quality monitoring" extra={link('View all sensors', 'air-quality')}>
            {sensors.length ? (
              <List dataSource={sensors.slice(0, 4)} renderItem={(s) => {
                const a = num(s.currentMetrics?.aqi);
                return (
                  <List.Item extra={<Tag color={low(s.status) === 'active' ? 'green' : 'default'}>{words(s.status || 'unknown')}</Tag>}>
                    <List.Item.Meta avatar={<Avatar icon={<CloudOutlined />} style={{ background: '#1677ff' }} />} title={s.name || 'Unnamed sensor'} description={<>{s.location || 'Location not set'}{a > 0 && <div><Tag color={aqiColor(a)}>AQI {a}</Tag></div>}</>} />
                  </List.Item>
                );
              }} />
            ) : <Nothing text="No sensors yet" />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="ev-card" title="Water quality samples" extra={link('View all samples', 'water-quality')}>
            {waterSamples.length ? (
              <List dataSource={waterSamples.slice(0, 4)} renderItem={(s) => {
                const ok = sampleOk(s);
                return (
                  <List.Item extra={<Tag color={ok === true ? 'green' : ok === false ? 'red' : 'default'}>{ok === true ? 'Within limits' : ok === false ? 'Outside limits' : 'Not assessed'}</Tag>}>
                    <List.Item.Meta avatar={<Avatar icon={<ExperimentOutlined />} style={{ background: '#389e0d' }} />} title={s.location || 'Location not set'} description={[s.site_name || s.siteName, `pH ${num(s.ph_level ?? s.ph) ?? 'not measured'}`].filter(Boolean).join(', ')} />
                  </List.Item>
                );
              }} />
            ) : <Nothing text="No water samples yet" />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="ev-card" title="Sustainability goals" extra={link('View all goals', 'goals')}>
            {goals.length ? (
              <List dataSource={goals.slice(0, 4)} renderItem={(g) => (
                <List.Item extra={<Button type="link" size="small" onClick={() => onGoal(g)}>Details</Button>}>
                  <List.Item.Meta avatar={<Avatar icon={<RiseOutlined />} style={{ background: '#722ed1' }} />} title={g.goal || 'Untitled goal'} description={<>{g.target}<Progress percent={progressOf(g)} size="small" strokeColor={goalColor(progressOf(g))} /></>} />
                </List.Item>
              )} />
            ) : <Nothing text="No goals yet" />}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="ev-card" title="Recent incidents" extra={link('View all incidents', 'incidents')}>
            {incidents.length ? (
              <Timeline style={{ paddingTop: 8 }} items={incidents.slice(0, 4).map((i) => ({
                key: i.id,
                color: SEVERITY[low(i.severity)] || 'gray',
                children: (
                  <div>
                    <strong>{i.title || 'Untitled incident'}</strong>
                    <div className="ev-note">{[i.location, i.reported_date && moment(i.reported_date).fromNow()].filter(Boolean).join(', ')}</div>
                    <Tag color={['critical', 'high'].includes(low(i.severity)) ? 'red' : 'gold'}>{words(i.severity || 'not set')}</Tag><Tag>{words(i.status || 'reported')}</Tag>
                  </div>
                )
              }))} />
            ) : <Nothing text="No incidents reported" />}
          </Card>
        </Col>
      </Row>

      <Modal open={!!view} onCancel={() => setView(null)} title={view?.title} width={900} destroyOnClose
        footer={[<Button key="c" onClick={() => setView(null)}>Close</Button>, <Button key="g" type="primary" onClick={() => { const t = view.go; setView(null); onGo(t); }}>Open section</Button>]}>
        {view && (
          <>
            <p className="ev-note">{view.note}</p>
            {view.has ? view.draw(340) : <Nothing text={view.empty} />}
            {view.has && <Table size="small" style={{ marginTop: 16 }} rowKey={(r) => JSON.stringify(r)} columns={view.cols} dataSource={view.data} pagination={false} scroll={{ x: 'max-content' }} />}
          </>
        )}
      </Modal>
    </div>
  );
}
