// Safety KPIs on the Analytics page: lagging rates from classified injury outcomes (TRIR, DART, LTIFR, severity rate) and
// leading indicators from the modules that hold the records. Every number shows how it is worked out.
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Drawer, Empty, InputNumber, Row, Select, Space, Table, Tag, Tooltip, Typography, message } from 'antd';
import { InfoCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { apiGet, apiPut, apiDelete } from '../../services/api';

const { Text } = Typography;
const n = (v, d = 0) => (v === null || v === undefined ? null : Number(v).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d }));
const err = (e) => e?.response?.data?.error || e?.data?.error || e?.message || 'Something went wrong';

const Tile = ({ label, value, suffix, sub, help, color, onClick }) => (
  <Col xs={12} md={8} xl={6}>
    <div role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onClick={onClick} onKeyDown={(e) => onClick && e.key === 'Enter' && onClick()}
      style={{ border: '1px solid #f0f0f0', borderRadius: 12, padding: '10px 12px', height: '100%', cursor: onClick ? 'pointer' : 'default', background: '#fff' }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label} {help && <Tooltip title={help}><InfoCircleOutlined /></Tooltip>}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: value === null ? '#bfbfbf' : color || '#1f1f1f' }}>
        {value === null ? '—' : value}{value !== null && suffix ? <small style={{ fontSize: 12, fontWeight: 400, marginLeft: 4 }}>{suffix}</small> : null}
      </div>
      <div style={{ fontSize: 12, color: '#8c8c8c', minHeight: 18 }}>{sub}</div>
    </div>
  </Col>
);

const ClassifyDrawer = ({ open, filters, onClose, onChanged }) => {
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState({ outcomes: [], can_manage: false });
  const [only, setOnly] = useState(true);
  const [busy, setBusy] = useState(null);
  const load = useCallback(() => {
    const params = new URLSearchParams({ start_date: filters.range[0].format('YYYY-MM-DD'), end_date: filters.range[1].format('YYYY-MM-DD') });
    if (filters.project && filters.project !== 'all') params.set('project_id', filters.project);
    apiGet(`/analytics/injury-outcomes?${params}`).then((r) => { setRows(r.data || []); setMeta({ outcomes: r.outcomes || [], can_manage: !!r.can_manage }); })
      .catch((e) => { setRows([]); message.error(err(e)); });
  }, [filters]);
  useEffect(() => { if (open) { setRows(null); load(); } }, [open, load]);
  const edit = (id, patch) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch, dirty: true } : r)));
  const save = async (r) => {
    setBusy(r.id);
    try {
      if (!r.outcome) await apiDelete(`/analytics/injury-outcomes/${r.id}`);
      else await apiPut(`/analytics/injury-outcomes/${r.id}`, { outcome: r.outcome, days_lost: r.days_lost || 0, days_restricted: r.days_restricted || 0 });
      setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, dirty: false } : x)));
      onChanged();
    } catch (e) { message.error(err(e)); } finally { setBusy(null); }
  };
  const list = (rows || []).filter((r) => !only || !r.outcome || r.dirty);
  return (
    <Drawer open={open} onClose={onClose} width={Math.min(980, typeof window !== 'undefined' ? window.innerWidth : 980)} title="Classify injuries">
      <Alert type="info" showIcon style={{ marginBottom: 12 }} message="Record what happened to the injured person in each incident."
        description="Medical treatment, restricted work, lost time and fatalities are recordable and count in TRIR. Lost time counts in LTIFR, restricted work and lost time in DART. Days are capped at 180 per case (OSHA)." />
      <Space style={{ marginBottom: 8 }}>
        <Select value={only ? 'todo' : 'all'} onChange={(v) => setOnly(v === 'todo')} style={{ width: 220 }} options={[{ value: 'todo', label: 'Not classified yet' }, { value: 'all', label: 'All incidents in the period' }]} />
      </Space>
      <Table rowKey="id" size="small" loading={!rows} dataSource={list} pagination={{ pageSize: 20, showSizeChanger: false }} scroll={{ x: 860 }}
        locale={{ emptyText: <Empty description={only ? 'Every incident in this period is classified' : 'No incidents in this period'} /> }}
        columns={[
          { title: 'Incident', render: (_, r) => <div><Text strong>{r.number}</Text> {r.near_miss && <Tag>near miss</Tag>}<div>{r.title}</div><Text type="secondary" style={{ fontSize: 12 }}>{r.date} · {r.type} · {r.severity}</Text></div> },
          { title: 'Injury outcome', width: 260, render: (_, r) => (
            <Select style={{ width: '100%' }} allowClear placeholder="Choose" disabled={!meta.can_manage} value={r.outcome || undefined}
              onChange={(v) => edit(r.id, { outcome: v || null, days_lost: v === 'lost_time' ? (r.days_lost || 1) : 0, days_restricted: ['restricted', 'lost_time'].includes(v) ? r.days_restricted : 0 })}
              options={meta.outcomes.map((o) => ({ value: o.id, label: o.name }))} />) },
          { title: 'Days lost', width: 100, render: (_, r) => <InputNumber min={r.outcome === 'lost_time' ? 1 : 0} max={180} value={r.days_lost} disabled={!meta.can_manage || r.outcome !== 'lost_time'} onChange={(v) => edit(r.id, { days_lost: v })} style={{ width: 80 }} /> },
          { title: 'Days restricted', width: 120, render: (_, r) => <InputNumber min={0} max={180} value={r.days_restricted} disabled={!meta.can_manage || !['restricted', 'lost_time'].includes(r.outcome)} onChange={(v) => edit(r.id, { days_restricted: v })} style={{ width: 80 }} /> },
          { title: '', width: 90, render: (_, r) => (meta.can_manage && r.dirty ? <Button type="primary" size="small" loading={busy === r.id} onClick={() => save(r)}>Save</Button> : null) },
        ]} />
      {!meta.can_manage && <Text type="secondary">Only supervisors and admins can classify injuries.</Text>}
    </Drawer>
  );
};

const SafetyKpiPanel = ({ summary, filters, onOpen, onChanged }) => {
  const [open, setOpen] = useState(false);
  const k = summary?.kpis || {};
  const L = summary?.leading || {};
  const hasHours = !!k.total_man_hours;
  const rate = (v) => (v === null || v === undefined ? null : n(v, 2));
  const noRate = !hasHours ? 'needs man-hours' : !k.classified_incidents && k.total_incidents ? 'classify injuries' : '';
  return (
    <Card style={{ borderRadius: 16, marginBottom: 16 }}
      title={<span><MedicineBoxOutlined /> Safety KPIs</span>}
      extra={<Button onClick={() => setOpen(true)}>Classify injuries{k.unclassified_incidents ? ` (${k.unclassified_incidents})` : ''}</Button>}>
      <Text strong>Lagging (what went wrong)</Text>
      <Row gutter={[10, 10]} style={{ margin: '6px 0 14px' }}>
        <Tile label="TRIR" value={rate(k.trir)} suffix="/200k h" sub={k.trir === null || k.trir === undefined ? noRate : `${k.recordables ?? 0} recordable`} color={k.trir > 3 ? '#cf1322' : '#389e0d'}
          help="Total recordable incident rate: (medical treatment + restricted work + lost time + fatalities) × 200,000 ÷ hours worked." />
        <Tile label="LTIFR" value={rate(k.ltifr)} suffix="/1M h" sub={k.ltifr === null || k.ltifr === undefined ? noRate : `${k.lti_cases ?? 0} from ${k.lti_source || ''}`} color={k.ltifr > 1 ? '#cf1322' : '#389e0d'}
          help="Lost-time injury frequency rate: lost-time cases × 1,000,000 ÷ hours worked. LTI records you entered are used first." />
        <Tile label="DART" value={rate(k.dart)} suffix="/200k h" sub={k.dart === null || k.dart === undefined ? noRate : `${k.dart_cases ?? 0} cases`} help="Days away, restricted or transferred: (restricted + lost-time cases) × 200,000 ÷ hours." />
        <Tile label="Severity rate" value={rate(k.severity_rate)} suffix="days/200k h" sub={k.severity_rate === null || k.severity_rate === undefined ? noRate : `${k.days_lost ?? 0} days lost`} help="Days lost × 200,000 ÷ hours worked." />
        <Tile label="Near misses" value={n(k.near_misses)} sub={k.near_miss_ratio != null ? `${n(k.near_miss_ratio, 1)} per recordable` : 'reported near misses'} color="#1677ff"
          help="Incidents typed as near miss or classified as no injury. A high ratio to recordables usually means a good reporting culture." onClick={() => onOpen('/incidents')} />
        <Tile label="Fatalities" value={k.classified_incidents ? n(k.fatalities) : null} sub="classified" color={k.fatalities ? '#a8071a' : '#389e0d'} />
      </Row>
      <Text strong>Leading (what we do to prevent it)</Text>
      <Row gutter={[10, 10]} style={{ marginTop: 6 }}>
        <Tile label="Inspections done" value={L.inspections ? n(L.inspections.completed) : null} sub={L.inspections ? `${L.inspections.critical_findings} critical findings` : ''} color="#1677ff" onClick={() => onOpen('/inspections?tab=history')} />
        <Tile label="Actions closed on time" value={L.inspections?.actions_on_time_pct != null ? n(L.inspections.actions_on_time_pct, 1) : null} suffix="%"
          sub={L.inspections ? `${L.inspections.actions_closed}/${L.inspections.actions} closed · ${L.inspections.actions_overdue_now} overdue now` : ''}
          color={L.inspections?.actions_on_time_pct < 80 ? '#d46b08' : '#389e0d'} help="Inspection actions closed by their due date ÷ actions closed." onClick={() => onOpen('/inspections?tab=actions')} />
        <Tile label="Ready Checks" value={L.ready_check ? n(L.ready_check.checks) : null} sub={L.ready_check ? `${L.ready_check.stops} times work was stopped` : ''} color="#389e0d"
          help="Pre-task checks done. Stops show people using their stop-work authority." onClick={() => onOpen('/ready-check')} />
        <Tile label="Toolbox talks" value={L.toolbox ? n(L.toolbox.talks) : null} sub={L.toolbox ? `${n(L.toolbox.attendance)} attendances` : ''} color="#faad14" onClick={() => onOpen('/toolbox-talks')} />
        <Tile label="Equipment safe to use" value={L.equipment?.safe_pct != null ? n(L.equipment.safe_pct, 1) : null} suffix="%"
          sub={L.equipment ? `${L.equipment.do_not_use} do not use · ${L.equipment.overdue} due` : ''} color={L.equipment?.safe_pct < 90 ? '#d46b08' : '#389e0d'} onClick={() => onOpen('/inspections?tab=equipment')} />
        <Tile label="Chemical alerts" value={L.chemicals ? n(L.chemicals.alerts) : null} sub={L.chemicals ? `${L.chemicals.critical} critical · ${L.chemicals.without_sds} without SDS` : ''}
          color={L.chemicals?.critical ? '#cf1322' : '#389e0d'} onClick={() => onOpen('/hse-management/industry/chemical?tab=alerts')} />
        <Tile label="Worker reports" value={L.voice ? n(L.voice.reports) : null} sub={L.voice ? `${L.voice.closed} closed` : ''} color="#722ed1" onClick={() => onOpen('/workplace-voice')} />
      </Row>
      <ClassifyDrawer open={open} filters={filters} onClose={() => setOpen(false)} onChanged={onChanged} />
    </Card>
  );
};

export default SafetyKpiPanel;
