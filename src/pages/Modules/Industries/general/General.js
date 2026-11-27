// Manufacturing & warehouse tools inside HSE > General Industry: machine lockout procedures and live lockouts, machine
// guarding, NIOSH lifting equation, racking damage (SEMA / EN 15635 traffic light) and forklift-pedestrian traffic by
// zone with the effect of each control. Data: /api/mfg/* and /api/wh/*; the lifting equation runs in the browser.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, DatePicker, Empty, Form, Input, InputNumber, Modal, Radio, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { BuildOutlined, CarOutlined, DeleteOutlined, InboxOutlined, LockOutlined, PlusOutlined, ToolOutlined } from '@ant-design/icons';
import api, { apiGet, apiPost, apiPut } from '../../../../services/api';

const { Text, Paragraph } = Typography;
const err = (e) => e?.response?.data?.error || e?.data?.error || e?.message || 'Something went wrong';
const dt = (x) => (x ? dayjs(x).format('D MMM YYYY HH:mm') : '-');

// ------------------------------------------------------------------ NIOSH revised lifting equation (metric)
// Waters TR et al. (1994) Applications Manual for the Revised NIOSH Lifting Equation. FM: Table 5, CM: Table 7.
const FM_TABLE = [   // [lifts/min, <=1h V<75, V>=75, <=2h V<75, V>=75, <=8h V<75, V>=75]
  [0.2, 1.00, 1.00, 0.95, 0.95, 0.85, 0.85], [0.5, 0.97, 0.97, 0.92, 0.92, 0.81, 0.81], [1, 0.94, 0.94, 0.88, 0.88, 0.75, 0.75],
  [2, 0.91, 0.91, 0.84, 0.84, 0.65, 0.65], [3, 0.88, 0.88, 0.79, 0.79, 0.55, 0.55], [4, 0.84, 0.84, 0.72, 0.72, 0.45, 0.45],
  [5, 0.80, 0.80, 0.60, 0.60, 0.35, 0.35], [6, 0.75, 0.75, 0.50, 0.50, 0.27, 0.27], [7, 0.70, 0.70, 0.42, 0.42, 0.22, 0.22],
  [8, 0.60, 0.60, 0.35, 0.35, 0.18, 0.18], [9, 0.52, 0.52, 0.30, 0.30, 0.00, 0.15], [10, 0.45, 0.45, 0.26, 0.26, 0.00, 0.13],
  [11, 0.41, 0.41, 0.00, 0.23, 0.00, 0.00], [12, 0.37, 0.37, 0.00, 0.21, 0.00, 0.00], [13, 0.00, 0.34, 0.00, 0.00, 0.00, 0.00],
  [14, 0.00, 0.31, 0.00, 0.00, 0.00, 0.00], [15, 0.00, 0.28, 0.00, 0.00, 0.00, 0.00]];
export const niosh = ({ load, H, V, D, A, F, dur, coupling }) => {
  const HM = H <= 25 ? 1 : H > 63 ? 0 : 25 / H;
  const VM = V > 175 ? 0 : 1 - 0.003 * Math.abs(V - 75);
  const DM = D <= 25 ? 1 : D > 175 ? 0 : 0.82 + 4.5 / D;
  const AM = A > 135 ? 0 : 1 - 0.0032 * A;
  const row = F > 15 ? null : FM_TABLE.find((r) => F <= r[0]) || null;
  const col = { 1: 1, 2: 3, 8: 5 }[dur] + (V >= 75 ? 1 : 0);
  const FM = row ? row[col] : 0;
  const CM = coupling === 'good' ? 1 : coupling === 'fair' ? (V < 75 ? 0.95 : 1) : 0.9;
  const RWL = 23 * HM * VM * DM * AM * FM * CM;
  const LI = RWL > 0 ? load / RWL : Infinity;
  return { HM, VM, DM, AM, FM, CM, RWL, LI };
};
const FIX = {
  HM: 'Bring the load closer to the body (reduce H): remove obstacles, use a turntable or smaller containers.',
  VM: 'Lift from about knuckle height (75 cm): raise low loads on a pallet stand or lift table, lower high shelves.',
  DM: 'Reduce how far the load travels up or down: store it at the height where it is used.',
  AM: 'Stop the twisting: rearrange the layout so the person turns their feet, not the back.',
  FM: 'Lift less often or for shorter periods: job rotation, breaks, or mechanical handling.',
  CM: 'Give the load good handles or hand-hold cut-outs.',
};
const Lifting = () => {
  const [v, setV] = useState({ load: 18, H: 40, V: 30, D: 80, A: 45, F: 2, dur: 8, coupling: 'fair' });
  const r = useMemo(() => niosh(v), [v]);
  const set = (k) => (x) => setV((cur) => ({ ...cur, [k]: x ?? 0 }));
  const worst = Object.entries({ HM: r.HM, VM: r.VM, DM: r.DM, AM: r.AM, FM: r.FM, CM: r.CM }).sort((a, b) => a[1] - b[1]).slice(0, 2).filter(([, m]) => m < 0.95);
  const level = r.LI <= 1 ? ['success', 'Acceptable for nearly all workers'] : r.LI <= 3 ? ['warning', 'Increased risk of back injury: redesign the task'] : ['error', 'High risk: redesign the task now'];
  const N = (k, label, unit, max, step = 1) => <Col xs={12} md={6} key={k}><div style={{ fontSize: 12, color: '#666' }}>{label}</div><InputNumber value={v[k]} onChange={set(k)} min={0} max={max} step={step} addonAfter={unit} style={{ width: '100%' }} /></Col>;
  return (
    <Card style={{ borderRadius: 12 }}>
      <Paragraph>How heavy is too heavy for this lift? The NIOSH lifting equation works out the recommended weight limit and shows which part of the task to change.</Paragraph>
      <Row gutter={[12, 12]}>
        {N('load', 'Load weight', 'kg', 200)}
        {N('H', 'Hands from ankles, horizontal (H)', 'cm', 100)}
        {N('V', 'Hand height at start (V)', 'cm', 200)}
        {N('D', 'Vertical travel (D)', 'cm', 200)}
        {N('A', 'Twisting angle (A)', '°', 180)}
        {N('F', 'Lifts per minute (F)', '/min', 20, 0.1)}
        <Col xs={12} md={6}><div style={{ fontSize: 12, color: '#666' }}>Work duration</div><Select value={v.dur} onChange={set('dur')} style={{ width: '100%' }} options={[{ value: 1, label: 'Up to 1 h' }, { value: 2, label: '1-2 h' }, { value: 8, label: '2-8 h' }]} /></Col>
        <Col xs={12} md={6}><div style={{ fontSize: 12, color: '#666' }}>Hand-hold (coupling)</div><Select value={v.coupling} onChange={set('coupling')} style={{ width: '100%' }} options={[{ value: 'good', label: 'Good (handles)' }, { value: 'fair', label: 'Fair' }, { value: 'poor', label: 'Poor' }]} /></Col>
      </Row>
      <Alert style={{ marginTop: 16 }} type={level[0]} showIcon message={`Recommended weight limit ${r.RWL.toFixed(1)} kg · Lifting index ${Number.isFinite(r.LI) ? r.LI.toFixed(2) : '∞'} · ${level[1]}`}
        description={<div>
          <div style={{ fontSize: 12 }}>Multipliers: H {r.HM.toFixed(2)} · V {r.VM.toFixed(2)} · D {r.DM.toFixed(2)} · A {r.AM.toFixed(2)} · F {r.FM.toFixed(2)} · C {r.CM.toFixed(2)}</div>
          {r.LI > 1 && worst.length > 0 && <><div style={{ marginTop: 6 }}><b>Fix first:</b></div><ul style={{ margin: 0, paddingLeft: 18 }}>{worst.map(([k]) => <li key={k}>{FIX[k]}</li>)}</ul></>}
        </div>} />
      <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>RWL = 23 kg × HM × VM × DM × AM × FM × CM (Waters et al., 1994, NIOSH). For two-handed lifts in front of the body; not for one-handed, seated or very fast lifts.</Paragraph>
    </Card>
  );
};

// ------------------------------------------------------------------ machine lockout
const ENERGIES = ['electrical', 'pneumatic', 'hydraulic', 'mechanical', 'gravity', 'thermal', 'chemical', 'spring / stored', 'other'];
const Lockout = () => {
  const [d, setD] = useState(null);
  const [locks, setLocks] = useState([]);
  const [edit, setEdit] = useState(undefined);
  const [pts, setPts] = useState([]);
  const [form] = Form.useForm();
  const load = useCallback(() => {
    apiGet('/mfg/procedures').then(setD).catch((e) => { setD({ data: [] }); message.error(err(e)); });
    apiGet('/mfg/lockouts').then((r) => setLocks(r.data || [])).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);
  const openEdit = (p) => { setEdit(p); form.resetFields(); form.setFieldsValue(p || {}); setPts(p ? p.energy_points : [{ tag: '', energy: 'electrical' }]); };
  const save = async () => {
    const v = await form.validateFields();
    try { if (edit?.id) await apiPut(`/mfg/procedures/${edit.id}`, { ...v, energy_points: pts }); else await apiPost('/mfg/procedures', { ...v, energy_points: pts }); setEdit(undefined); load(); } catch (e) { message.error(err(e)); }
  };
  const act = (p, action, body = {}) => apiPost(`/mfg/procedures/${p.id}/${action}`, body).then(load).catch((e) => message.error(err(e)));
  const start = (p) => { const reason = window.prompt(`Lock out ${p.machine}: what work?`); if (reason) apiPost('/mfg/lockouts', { procedure_id: p.id, reason }).then((r) => { (r.warnings || []).forEach((w) => message.warning(w)); load(); }).catch((e) => message.error(err(e))); };
  const lact = (l, action, body = {}) => apiPost(`/mfg/lockouts/${l.id}`, { action, ...body }).then(load).catch((e) => message.error(err(e)));
  const pdf = async (p) => { const b = (await api.get(`/mfg/procedures/${p.id}/pdf`, { responseType: 'blob' })).data; const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `${p.machine}_lockout.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); };
  const active = locks.filter((l) => l.status !== 'released');
  return (
    <div>
      {active.map((l) => (
        <Card key={l.id} size="small" style={{ borderRadius: 12, marginBottom: 10, borderColor: '#fa8c16' }} title={<Space wrap><LockOutlined /><Text strong>{l.machine}</Text><Tag color={l.status === 'locked_out' ? 'red' : 'orange'}>{l.status === 'locked_out' ? 'LOCKED OUT: safe to work' : 'locking: not safe yet'}</Tag><Text type="secondary">{l.reason}</Text></Space>}>
          {l.points.map((p, i) => <div key={p.tag} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>{p.tag}</span>{p.locked_at ? <Tag color="green">locked · {p.locked_by}</Tag> : <Button size="small" onClick={() => lact(l, 'lock', { point: i })}>My lock is on</Button>}</div>)}
          <Space style={{ marginTop: 8 }}>
            {l.status === 'locking' && <Button type="primary" disabled={!l.all_locked} onClick={() => { const note = window.prompt('How was zero energy proved?'); if (note) lact(l, 'verify', { note }); }}>Verify zero energy</Button>}
            {l.status === 'locked_out' && <Button onClick={() => { const note = window.prompt('Tools removed, guards on, everyone clear? Add a note'); if (note) lact(l, 'release', { note, people_clear: true }); }}>Release</Button>}
          </Space>
        </Card>
      ))}
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }} wrap>
        <Text>Machine-specific lockout procedures (OSHA 1910.147). A machine can only be locked out with an approved procedure.</Text>
        {d?.can_manage && <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit(null)}>New procedure</Button>}
      </Space>
      <Table rowKey="id" size="middle" loading={!d} dataSource={d?.data || []} scroll={{ x: 820 }} pagination={false} locale={{ emptyText: <Empty description="No lockout procedures yet" /> }} columns={[
        { title: 'Machine', render: (_, p) => <div><Text strong>{p.machine}</Text><div><Text type="secondary" style={{ fontSize: 12 }}>{p.energy_points.length} energy point(s){p.location ? ` · ${p.location}` : ''} · v{p.version}</Text></div></div> },
        { title: 'Status', render: (_, p) => <Space size={4} wrap>{p.approved ? <Tag color="green">approved</Tag> : <Tag color="red">not approved</Tag>}{p.periodic_overdue && <Tag color="orange">yearly check overdue</Tag>}</Space> },
        { title: '', render: (_, p) => (
          <Space wrap>
            {p.approved && <Button size="small" type="primary" danger icon={<LockOutlined />} onClick={() => start(p)}>Lock out</Button>}
            {d.can_manage && !p.approved && <Button size="small" onClick={() => act(p, 'approve')}>Approve</Button>}
            {d.can_manage && p.approved && <Button size="small" onClick={() => { const note = window.prompt('Yearly check: who did you watch, was every step followed?'); if (note) act(p, 'periodic', { note }); }}>Yearly check</Button>}
            <Button size="small" onClick={() => pdf(p)}>Placard</Button>
            {d.can_manage && <Button size="small" onClick={() => openEdit(p)}>Edit</Button>}
          </Space>) },
      ]} />
      <Modal open={edit !== undefined} title={edit?.id ? `Edit ${edit.machine}` : 'New lockout procedure'} onCancel={() => setEdit(undefined)} onOk={save} okText="Save" width={820}>
        <Form form={form} layout="vertical">
          <Row gutter={8}><Col span={12}><Form.Item name="machine" label="Machine" rules={[{ required: true }]}><Input maxLength={160} /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="Location"><Input maxLength={160} /></Form.Item></Col></Row>
        </Form>
        <Text strong>Energy sources (every one must be isolated)</Text>
        {pts.map((p, i) => (
          <Row gutter={6} key={i} style={{ marginTop: 6 }}>
            <Col xs={12} md={5}><Input placeholder="Tag (E-1 isolator)" value={p.tag} onChange={(e) => setPts(pts.map((x, j) => (j === i ? { ...x, tag: e.target.value } : x)))} /></Col>
            <Col xs={12} md={4}><Select value={p.energy} style={{ width: '100%' }} onChange={(val) => setPts(pts.map((x, j) => (j === i ? { ...x, energy: val } : x)))} options={ENERGIES.map((e) => ({ value: e, label: e }))} /></Col>
            <Col xs={12} md={3}><Input placeholder="415 V / 6 bar" value={p.magnitude} onChange={(e) => setPts(pts.map((x, j) => (j === i ? { ...x, magnitude: e.target.value } : x)))} /></Col>
            <Col xs={12} md={5}><Input placeholder="How to isolate" value={p.method} onChange={(e) => setPts(pts.map((x, j) => (j === i ? { ...x, method: e.target.value } : x)))} /></Col>
            <Col xs={20} md={6}><Input placeholder="How to verify" value={p.verify} onChange={(e) => setPts(pts.map((x, j) => (j === i ? { ...x, verify: e.target.value } : x)))} /></Col>
            <Col xs={4} md={1}><Button icon={<DeleteOutlined />} aria-label="Remove" onClick={() => setPts(pts.filter((_, j) => j !== i))} /></Col>
          </Row>
        ))}
        <Button size="small" style={{ marginTop: 8 }} icon={<PlusOutlined />} onClick={() => setPts([...pts, { tag: '', energy: 'electrical' }])}>Add energy source</Button>
        <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>Changing the energy sources creates a new version that must be approved again.</Paragraph>
      </Modal>
    </div>
  );
};

// ------------------------------------------------------------------ guarding
const Guarding = () => {
  const [d, setD] = useState(null);
  const [adding, setAdding] = useState(false);
  const [machine, setMachine] = useState('');
  const [pts, setPts] = useState([]);
  const load = useCallback(() => { apiGet('/mfg/guarding').then(setD).catch((e) => { setD({ data: [], hazards: [] }); message.error(err(e)); }); }, []);
  useEffect(() => { load(); }, [load]);
  const save = async () => { try { await apiPost('/mfg/guarding', { machine, points: pts }); setAdding(false); load(); } catch (e) { message.error(err(e)); } };
  const C = { adequate: 'green', missing: 'red', damaged: 'orange', bypassed: 'red', not_applicable: 'default' };
  return (
    <div>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }} wrap>
        <Text>Check every hazard point on each machine. Missing, damaged or bypassed guards are sent to supervisors.</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setMachine(''); setPts((d?.hazards || []).slice(0, 3).map((h) => ({ hazard: h, status: 'adequate' }))); setAdding(true); }}>Assess a machine</Button>
      </Space>
      <Row gutter={[12, 12]}>
        {(d?.data || []).length === 0 && <Col span={24}><Empty description="No machines assessed yet" /></Col>}
        {(d?.data || []).map((g) => (
          <Col xs={24} md={12} xl={8} key={g.id}>
            <Card size="small" style={{ borderRadius: 12, borderColor: g.result === 'deficient' ? '#ff4d4f' : undefined }} title={<Space><Text strong>{g.machine}</Text><Tag color={g.result === 'ok' ? 'green' : 'red'}>{g.result}</Tag></Space>}>
              {g.points.map((p) => <div key={p.hazard}><Tag color={C[p.status]}>{p.status.replace('_', ' ')}</Tag>{p.hazard}{p.note ? `: ${p.note}` : ''}</div>)}
              <Text type="secondary" style={{ fontSize: 12 }}>{g.assessed_by} · {dt(g.at)}</Text>
            </Card>
          </Col>
        ))}
      </Row>
      <Modal open={adding} title="Guarding assessment" onCancel={() => setAdding(false)} onOk={save} okText="Save" width={760}>
        <Input placeholder="Machine" value={machine} onChange={(e) => setMachine(e.target.value)} maxLength={160} style={{ marginBottom: 10 }} />
        {pts.map((p, i) => (
          <div key={i} style={{ borderBottom: '1px solid #f0f0f0', padding: '6px 0' }}>
            <Select value={p.hazard} style={{ width: 300, maxWidth: '100%' }} onChange={(v) => setPts(pts.map((x, j) => (j === i ? { ...x, hazard: v } : x)))} options={(d?.hazards || []).map((h) => ({ value: h, label: h }))} />
            <Radio.Group style={{ marginLeft: 8 }} value={p.status} onChange={(e) => setPts(pts.map((x, j) => (j === i ? { ...x, status: e.target.value } : x)))}
              options={['adequate', 'missing', 'damaged', 'bypassed', 'not_applicable'].map((s) => ({ value: s, label: s.replace('_', ' ') }))} />
            {['missing', 'damaged', 'bypassed'].includes(p.status) && <Input style={{ marginTop: 4 }} placeholder="What is wrong?" value={p.note} onChange={(e) => setPts(pts.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} />}
          </div>
        ))}
        <Button size="small" style={{ marginTop: 8 }} icon={<PlusOutlined />} onClick={() => setPts([...pts, { hazard: 'Other', status: 'adequate' }])}>Add hazard point</Button>
      </Modal>
    </div>
  );
};

// ------------------------------------------------------------------ racking
const RC = { red: 'red', amber: 'orange', green: 'green' };
const Racking = () => {
  const [d, setD] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form] = Form.useForm();
  const load = useCallback(() => { apiGet('/wh/racking').then(setD).catch((e) => { setD({ data: [], counts: {} }); message.error(err(e)); }); }, []);
  useEffect(() => { load(); }, [load]);
  const add = async () => { const v = await form.validateFields(); try { await apiPost('/wh/racking', v); setAdding(false); form.resetFields(); load(); } catch (e) { message.error(err(e)); } };
  const act = (r, action, body = {}) => apiPost(`/wh/racking/${r.id}`, { action, ...body }).then(load).catch((e) => message.error(err(e)));
  const comp = Form.useWatch('component', form);
  return (
    <div>
      <Row gutter={12} style={{ marginBottom: 12 }}>
        {['red', 'amber', 'green'].map((k) => <Col xs={8} key={k}><Card size="small" style={{ borderRadius: 12, borderColor: RC[k] }}><Text strong style={{ color: k === 'amber' ? '#d46b08' : k === 'red' ? '#cf1322' : '#389e0d', fontSize: 20 }}>{d?.counts?.[k] ?? 0}</Text> <Text>{k} open</Text></Card></Col>)}
      </Row>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }} wrap>
        <Text>Red: offload now and isolate. Amber: offload, repair within 4 weeks or it turns red. Uprights: measure the bend over a 1 m straight edge.</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAdding(true)}>Report damage</Button>
      </Space>
      <Table rowKey="id" size="middle" loading={!d} dataSource={d?.data || []} scroll={{ x: 900 }} pagination={{ pageSize: 20, showSizeChanger: false }} locale={{ emptyText: <Empty description="No damage reported" /> }} columns={[
        { title: 'Bay', dataIndex: 'location' }, { title: 'Part', render: (_, r) => `${r.component}${r.measured_mm != null ? ` · ${r.measured_mm} mm ${r.direction}` : ''}` },
        { title: 'Level', render: (_, r) => (r.status === 'repaired' ? <Tag>repaired</Tag> : <Space size={4}><Tag color={RC[r.level]}>{r.level.toUpperCase()}</Tag>{r.escalated && <Tag color="red">amber overdue</Tag>}</Space>) },
        { title: 'What to do', dataIndex: 'action' },
        { title: '', render: (_, r) => r.status !== 'repaired' && <Space>{r.status === 'open' && r.level !== 'green' && <Button size="small" onClick={() => act(r, 'offload')}>Offloaded</Button>}
          {d.can_manage && <Button size="small" onClick={() => { const note = window.prompt('What was replaced or repaired?'); if (note) act(r, 'repair', { note }); }}>Repaired</Button>}</Space> },
      ]} />
      <Modal open={adding} title="Report racking damage" onCancel={() => setAdding(false)} onOk={add} okText="Save">
        <Form form={form} layout="vertical" initialValues={{ component: 'upright', direction: 'front' }}>
          <Form.Item name="location" label="Bay (aisle / bay / level)" rules={[{ required: true }]}><Input maxLength={120} placeholder="A12-3" /></Form.Item>
          <Form.Item name="component" label="Part"><Select options={['upright', 'beam', 'bracing', 'baseplate', 'beam_connector', 'other'].map((x) => ({ value: x, label: x.replace('_', ' ') }))} /></Form.Item>
          {comp === 'upright' ? (
            <Row gutter={8}>
              <Col span={12}><Form.Item name="direction" label="Bend direction"><Radio.Group options={[{ value: 'front', label: 'Front (along beams), limit 5 mm' }, { value: 'side', label: 'Side, limit 3 mm' }]} /></Form.Item></Col>
              <Col span={12}><Form.Item name="measured_mm" label="Bend over 1 m" rules={[{ required: true }]}><InputNumber min={0} max={500} addonAfter="mm" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
          ) : <Form.Item name="level" label="Level" rules={[{ required: true }]}><Radio.Group options={[{ value: 'green', label: 'Green' }, { value: 'amber', label: 'Amber' }, { value: 'red', label: 'Red' }]} /></Form.Item>}
          <Form.Item name="description" label="Description"><Input.TextArea maxLength={1000} /></Form.Item>
          <Paragraph type="secondary" style={{ fontSize: 12 }}>Limits from EN 15635 for uprights; use your rack maker's limits if they differ. Amber = over the limit, red = twice the limit or more.</Paragraph>
        </Form>
      </Modal>
    </div>
  );
};

// ------------------------------------------------------------------ forklift / pedestrian traffic
const Traffic = () => {
  const [d, setD] = useState(null);
  const [ev, setEv] = useState(false);
  const [ctl, setCtl] = useState(null);
  const [f1] = Form.useForm();
  const [f2] = Form.useForm();
  const load = useCallback(() => { apiGet('/wh/traffic').then(setD).catch((e) => { setD({ data: [], kinds: {}, control_kinds: {} }); message.error(err(e)); }); }, []);
  useEffect(() => { load(); }, [load]);
  const addEv = async () => { const v = await f1.validateFields(); try { await apiPost('/wh/traffic', v); setEv(false); f1.resetFields(); load(); } catch (e) { message.error(err(e)); } };
  const addCtl = async () => { const v = await f2.validateFields(); try { await apiPost('/wh/traffic/controls', { ...v, zone: ctl, implemented_on: v.implemented_on ? v.implemented_on.format('YYYY-MM-DD') : null }); setCtl(null); f2.resetFields(); load(); } catch (e) { message.error(err(e)); } };
  const V = { working: 'green', 'no clear change': 'orange', worse: 'red', 'too early to tell': 'default' };
  return (
    <div>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }} wrap>
        <Text>Where do forklifts and people meet? Zones are ranked by events in 90 days; each control shows whether events dropped after it.</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setEv(true)}>Report an event</Button>
      </Space>
      {(d?.data || []).length === 0 && <Empty description="No events reported" />}
      {(d?.data || []).map((z, i) => (
        <Card key={z.zone} size="small" style={{ borderRadius: 12, marginBottom: 10, borderColor: i === 0 && z.score ? '#ff4d4f' : undefined }}
          title={<Space wrap><Text strong>{i + 1}. {z.zone}</Text><Tag color={z.score >= 8 ? 'red' : z.score >= 3 ? 'orange' : 'default'}>{z.events_90d} event(s) in 90 days</Tag></Space>}
          extra={d.can_manage && <Button size="small" onClick={() => setCtl(z.zone)}>Add control</Button>}>
          <Space wrap>{Object.entries(z.kinds).map(([k, n]) => <Tag key={k}>{k}: {n}</Tag>)}</Space>
          {z.advice.map((a) => <Alert key={a} type="warning" showIcon style={{ marginTop: 6 }} message={a} />)}
          {z.controls.map((c) => <div key={c.control + c.implemented_on} style={{ marginTop: 6 }}><Tag color={V[c.verdict]}>{c.verdict}</Tag>{c.control} ({c.implemented_on}): {c.before_per_week}/week before, {c.after_per_week}/week after</div>)}
        </Card>
      ))}
      <Modal open={ev} title="Forklift / pedestrian event" onCancel={() => setEv(false)} onOk={addEv} okText="Save">
        <Form form={f1} layout="vertical" initialValues={{ kind: 'near_miss' }}>
          <Form.Item name="zone" label="Zone" rules={[{ required: true }]}><Input maxLength={120} placeholder="e.g. Aisle 4 crossing" /></Form.Item>
          <Form.Item name="kind" label="What happened"><Select options={Object.entries(d?.kinds || {}).map(([k, l]) => ({ value: k, label: l }))} /></Form.Item>
          <Form.Item name="note" label="Note"><Input.TextArea maxLength={1000} /></Form.Item>
        </Form>
      </Modal>
      <Modal open={!!ctl} title={`Control for ${ctl}`} onCancel={() => setCtl(null)} onOk={addCtl} okText="Save">
        <Form form={f2} layout="vertical" initialValues={{ kind: 'separation' }}>
          <Form.Item name="control" label="Control" rules={[{ required: true }]}><Input maxLength={300} placeholder="Fixed barriers and a marked crossing" /></Form.Item>
          <Form.Item name="kind" label="Type"><Select options={Object.entries(d?.control_kinds || {}).map(([k, l]) => ({ value: k, label: l }))} /></Form.Item>
          <Form.Item name="implemented_on" label="In place since"><DatePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export const useGeneralTabs = (enabled) => (enabled ? [
  { key: 'lockout', label: <span><LockOutlined /> Machine lockout</span>, children: <Lockout /> },
  { key: 'guarding', label: <span><ToolOutlined /> Guarding</span>, children: <Guarding /> },
  { key: 'lifting', label: <span><InboxOutlined /> Manual handling</span>, children: <Lifting /> },
  { key: 'racking', label: <span><BuildOutlined /> Racking</span>, children: <Racking /> },
  { key: 'traffic', label: <span><CarOutlined /> Forklift traffic</span>, children: <Traffic /> },
] : []);

