// Oil & gas tools inside HSE > Oil & Gas: permits with isolations (LOTO) and gas tests, SIMOPS, management of change with
// PSSR, bypassed safety devices and zones. Built on the existing permits to work. Data: /api/og/* and /api/work-permits.
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Alert, Button, Card, Checkbox, Col, DatePicker, Descriptions, Drawer, Empty, Form, Input, InputNumber, Modal, Row, Select, Space, Table, Tag, Typography, message,
} from 'antd';
import dayjs from 'dayjs';
import { AlertOutlined, ApartmentOutlined, ExperimentOutlined, LockOutlined, PlusOutlined, ReloadOutlined, SwapOutlined, WarningOutlined } from '@ant-design/icons';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../../services/api';

const { Text, Paragraph } = Typography;
const err = (e) => e?.response?.data?.error || e?.data?.error || e?.message || 'Something went wrong';
const dt = (x) => (x ? dayjs(x).format('D MMM HH:mm') : '-');
const LIVE = ['active', 'approved', 'suspended', 'in_approval'];
const ISO_COLOR = { isolated: 'orange', verified: 'green', removed: 'default', handed_over: 'blue' };

// ------------------------------------------------------------------ gas test form (used in the permit drawer and the gas tab)
const GasForm = ({ permitId, permits, onSaved }) => {
  const [form] = Form.useForm();
  const [meta, setMeta] = useState({ defaults: {}, detectors: [] });
  const [busy, setBusy] = useState(false);
  useEffect(() => { apiGet('/og/gas-tests').then((r) => setMeta({ defaults: r.defaults || {}, detectors: r.detectors || [] })).catch(() => {}); }, []);
  const save = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try {
      const r = await apiPost('/og/gas-tests', { ...v, permit_id: permitId || v.permit_id || null, limits: { lel_max: v.lel_max } });
      if (r.data.result === 'fail') message.error(`FAILED: ${r.data.reasons.join('; ')}`); else message.success('Gas test passed and recorded');
      (r.warnings || []).forEach((w) => message.warning(w));
      form.resetFields(['o2', 'lel', 'h2s', 'co']);
      onSaved && onSaved(r.data);
    } catch (e) { message.error(err(e)); } finally { setBusy(false); }
  };
  return (
    <Form form={form} layout="vertical" initialValues={{ lel_max: 10 }}>
      <Row gutter={10}>
        {!permitId && <Col xs={24} md={12}><Form.Item name="permit_id" label="Permit (optional)"><Select allowClear showSearch optionFilterProp="label" options={(permits || []).map((p) => ({ value: p.id, label: `${p.permit_number} ${p.title}` }))} /></Form.Item></Col>}
        {!permitId && <Col xs={24} md={12}><Form.Item name="location" label="Location"><Input maxLength={200} /></Form.Item></Col>}
        <Col xs={12} md={6}><Form.Item name="o2" label="O2 %"><InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="lel" label="LEL %"><InputNumber min={0} max={100} step={1} style={{ width: '100%' }} /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="h2s" label="H2S ppm"><InputNumber min={0} step={0.5} style={{ width: '100%' }} /></Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="co" label="CO ppm"><InputNumber min={0} step={1} style={{ width: '100%' }} /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item name="instrument_id" label="Gas detector (equipment register)" extra={meta.detectors.length ? null : 'Add gas detectors in Inspections > Equipment to link them.'}>
          <Select allowClear options={meta.detectors.map((d) => ({ value: d.id, label: `${d.label}${d.state !== 'ok' ? ` (${d.state_label})` : ''}` }))} />
        </Form.Item></Col>
        <Col xs={12} md={6}><Form.Item name="lel_max" label="LEL limit %" extra="Many operators use 0-1% for hot work"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
        <Col xs={12} md={6} style={{ display: 'flex', alignItems: 'center' }}><Button type="primary" loading={busy} onClick={save} block>Record test</Button></Col>
      </Row>
      <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>Limits: O2 {meta.defaults.o2_min ?? 19.5}-{meta.defaults.o2_max ?? 23.5}%, H2S below {meta.defaults.h2s_max ?? 5} ppm, CO below {meta.defaults.co_max ?? 25} ppm (OSHA 1910.146 / ACGIH). Your permit may be stricter.</Paragraph>
    </Form>
  );
};

const GasTable = ({ rows }) => (
  <Table rowKey="id" size="small" dataSource={rows} pagination={{ pageSize: 10, showSizeChanger: false }} scroll={{ x: 760 }} locale={{ emptyText: <Empty description="No gas tests yet" /> }}
    columns={[
      { title: 'Time', render: (_, r) => dt(r.tested_at) }, { title: 'O2 %', dataIndex: 'o2' }, { title: 'LEL %', dataIndex: 'lel' }, { title: 'H2S', dataIndex: 'h2s' }, { title: 'CO', dataIndex: 'co' },
      { title: 'Result', render: (_, r) => (r.result === 'pass' ? <Tag color="green">pass</Tag> : <Tag color="red" style={{ whiteSpace: 'normal' }}>fail: {r.reasons.join('; ')}</Tag>) },
      { title: 'Detector', dataIndex: 'instrument', render: (v) => v || '-' }, { title: 'By', dataIndex: 'tested_by' },
    ]} />
);

// ------------------------------------------------------------------ one permit: isolations + gas tests
const PermitDrawer = ({ permit, meta, onClose, onChanged }) => {
  const [iso, setIso] = useState([]);
  const [gas, setGas] = useState([]);
  const [adding, setAdding] = useState(false);
  const [closing, setClosing] = useState(false);
  const [gate, setGate] = useState(null);
  const [override, setOverride] = useState('');
  const [form] = Form.useForm();
  const [cform] = Form.useForm();
  const load = useCallback(() => {
    apiGet(`/og/isolations?permit_id=${permit.id}`).then((r) => setIso(r.data || [])).catch((e) => message.error(err(e)));
    apiGet(`/og/gas-tests?permit_id=${permit.id}`).then((r) => setGas(r.data || [])).catch(() => {});
    apiGet(`/og/permits/${permit.id}/gate`).then((r) => setGate(r.data)).catch(() => {});
  }, [permit.id]);
  const start = async () => {
    try {
      await apiPost(`/work-permits/${permit.id}/status`, { action: 'activate', ...(override.trim() ? { override_reason: override.trim() } : {}) });
      message.success('Work started: permit active'); onChanged(); onClose();
    } catch (e) {
      const g = e?.data?.gate || e?.response?.data?.gate;
      if (g) setGate(g);
      message.error(err(e));
    }
  };
  useEffect(() => { load(); }, [load]);
  const act = async (i, action) => {
    try {
      await apiPut(`/og/isolations/${i.id}`, { action });
      load(); onChanged();
    } catch (e) {
      if (e?.data?.code === 'WORK_ACTIVE' || e?.response?.data?.code === 'WORK_ACTIVE') {
        Modal.confirm({ title: 'The permit is still active', content: 'Confirm the work has stopped and everyone is clear before removing this isolation.', okText: 'Work has stopped',
          onOk: async () => { try { await apiPut(`/og/isolations/${i.id}`, { action, work_stopped: true }); load(); onChanged(); } catch (x) { message.error(err(x)); } } });
      } else message.error(err(e));
    }
  };
  const add = async () => {
    const v = await form.validateFields();
    try { await apiPost('/og/isolations', { ...v, permit_id: permit.id }); setAdding(false); form.resetFields(); load(); onChanged(); } catch (e) { message.error(err(e)); }
  };
  const close = async () => {
    const v = await cform.validateFields();
    try { await apiPost(`/work-permits/${permit.id}/status`, { action: 'close', notes: v.notes, isolations_handover: v.handover }); message.success('Permit closed'); setClosing(false); onChanged(); onClose(); } catch (e) { message.error(err(e)); }
  };
  const open = iso.filter((i) => ['isolated', 'verified'].includes(i.status));
  const lastGas = gas[0];
  return (
    <Drawer open onClose={onClose} width={Math.min(980, window.innerWidth)} title={`${permit.permit_number} · ${permit.title}`}
      extra={['active', 'suspended', 'approved'].includes(permit.status) && <Button onClick={() => { cform.resetFields(); setClosing(true); }}>Close permit</Button>}>
      <Descriptions size="small" column={{ xs: 1, sm: 3 }} items={[
        { key: 't', label: 'Type', children: permit.permit_type.replace(/_/g, ' ') }, { key: 's', label: 'Status', children: <Tag>{permit.status}</Tag> },
        { key: 'l', label: 'Location', children: permit.location || '-' }, { key: 'f', label: 'From', children: dt(permit.start_at) }, { key: 'to', label: 'To', children: dt(permit.end_at) },
        { key: 'g', label: 'Last gas test', children: lastGas ? <Tag color={lastGas.result === 'pass' ? 'green' : 'red'}>{lastGas.result} {dt(lastGas.tested_at)}</Tag> : <Text type="secondary">none</Text> },
      ]} />
      {gate && ['approved', 'suspended'].includes(permit.status) && (
        <Card size="small" style={{ marginTop: 12, borderRadius: 12, borderColor: gate.ready ? '#52c41a' : '#ff4d4f' }}
          title={gate.ready ? 'Ready to start work' : 'Work cannot start yet'}>
          {gate.blockers.map((b) => <Alert key={b} type="error" showIcon style={{ marginBottom: 6 }} message={b} />)}
          {gate.warnings.map((w) => <Alert key={w} type="warning" showIcon style={{ marginBottom: 6 }} message={w} />)}
          {gate.passed.map((x) => <Alert key={x} type="success" showIcon style={{ marginBottom: 6 }} message={x} />)}
          {!gate.ready && (
            <Input.TextArea value={override} onChange={(e) => setOverride(e.target.value)} maxLength={500} autoSize={{ minRows: 1, maxRows: 3 }} style={{ marginBottom: 8 }}
              placeholder="Supervisors only: reason to start despite the blockers (logged and e-mailed to all supervisors)" />
          )}
          <Space><Button type="primary" danger={!gate.ready} onClick={start} disabled={!gate.ready && override.trim().length < 10}>{gate.ready ? 'Start work' : 'Start with override'}</Button>
            <Button onClick={load}>Check again</Button></Space>
        </Card>
      )}
      <Card size="small" style={{ marginTop: 12, borderRadius: 12 }} title={<span><LockOutlined /> Isolation points ({open.length} in place)</span>} extra={!['closed', 'cancelled'].includes(permit.status) && <Button size="small" icon={<PlusOutlined />} onClick={() => setAdding(true)}>Add isolation</Button>}>
        <Table rowKey="id" size="small" dataSource={iso} pagination={false} scroll={{ x: 860 }} locale={{ emptyText: <Empty description="No isolations recorded on this permit" /> }} columns={[
          { title: 'Point', render: (_, r) => <div><Text strong>{r.point_tag}</Text><div><Text type="secondary" style={{ fontSize: 12 }}>{r.equipment || ''}</Text></div></div> },
          { title: 'Energy / method', render: (_, r) => <div>{r.energy_name}<div><Text type="secondary" style={{ fontSize: 12 }}>{r.method_name}{r.lock_no ? ` · lock ${r.lock_no}` : ''}</Text></div></div> },
          { title: 'Status', render: (_, r) => <Tag color={ISO_COLOR[r.status]}>{r.status.replace('_', ' ')}</Tag> },
          { title: 'Isolated', render: (_, r) => `${r.isolated_by || ''} ${dt(r.isolated_at)}` },
          { title: 'Verified', render: (_, r) => (r.verified_at ? `${r.verified_by} ${dt(r.verified_at)}` : '-') },
          { title: '', render: (_, r) => (
            <Space>
              {r.status === 'isolated' && <Button size="small" onClick={() => act(r, 'verify')}>Verify zero energy</Button>}
              {['isolated', 'verified'].includes(r.status) && <Button size="small" danger onClick={() => act(r, 'remove')}>Remove</Button>}
            </Space>) },
        ]} />
        <Paragraph type="secondary" style={{ fontSize: 12, margin: '8px 0 0' }}>Verification must be done by a different person from the isolator (try-out / prove zero energy).</Paragraph>
      </Card>
      <Card size="small" style={{ marginTop: 12, borderRadius: 12 }} title={<span><ExperimentOutlined /> Gas tests</span>}>
        {!['closed', 'cancelled'].includes(permit.status) && <GasForm permitId={permit.id} onSaved={load} />}
        <div style={{ marginTop: 10 }}><GasTable rows={gas} /></div>
      </Card>
      <Modal open={adding} title="Add isolation point" onCancel={() => setAdding(false)} onOk={add} okText="Isolated">
        <Form form={form} layout="vertical">
          <Form.Item name="point_tag" label="Point tag (valve, breaker, blind)" rules={[{ required: true }]}><Input maxLength={80} /></Form.Item>
          <Form.Item name="equipment" label="Equipment"><Input maxLength={200} /></Form.Item>
          <Form.Item name="energy_type" label="Energy" rules={[{ required: true }]}><Select options={(meta.energy || []).map((x) => ({ value: x.id, label: x.name }))} /></Form.Item>
          <Form.Item name="method" label="Method" rules={[{ required: true }]}><Select options={(meta.methods || []).map((x) => ({ value: x.id, label: x.name }))} /></Form.Item>
          <Form.Item name="lock_no" label="Lock / tag number"><Input maxLength={40} /></Form.Item>
        </Form>
      </Modal>
      <Modal open={closing} title="Close permit" onCancel={() => setClosing(false)} onOk={close} okText="Close permit">
        <Form form={cform} layout="vertical">
          <Form.Item name="notes" label="Close-out" rules={[{ required: true, min: 3 }]}><Input.TextArea maxLength={2000} placeholder="Work complete, area left safe" /></Form.Item>
          {open.length > 0 && (
            <>
              <Alert type="warning" showIcon style={{ marginBottom: 8 }} message={`${open.length} isolation(s) still in place`} description="Remove them first, or hand them over to another permit or isolation certificate." />
              <Form.Item name="handover" label="Hand over to" rules={[{ required: true, min: 3 }]}><Input maxLength={500} placeholder="e.g. PTW-2 line breaking" /></Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </Drawer>
  );
};

const Permits = () => {
  const history = useHistory();
  const [permits, setPermits] = useState(null);
  const [isoAll, setIsoAll] = useState([]);
  const [meta, setMeta] = useState({});
  const [open, setOpen] = useState(null);
  const load = useCallback(() => {
    apiGet('/work-permits').then((r) => setPermits((r.permits || []).filter((p) => LIVE.includes(p.status) || p.status === 'expired'))).catch((e) => { setPermits([]); message.error(err(e)); });
    apiGet('/og/isolations?active=1').then((r) => { setIsoAll(r.data || []); setMeta({ energy: r.energy_types, methods: r.methods }); }).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);
  const count = (pid) => isoAll.filter((i) => i.permit_id === pid).length;
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Text>Live and approved permits. Open one to record isolations and gas tests.</Text>
        <Space><Button icon={<ReloadOutlined />} onClick={load} aria-label="Reload" /><Button type="primary" onClick={() => history.push('/document-management?tab=ptw')}>Permits to work</Button></Space>
      </Space>
      <Table rowKey="id" size="middle" loading={!permits} dataSource={permits || []} scroll={{ x: 760 }} pagination={{ pageSize: 20, showSizeChanger: false }}
        onRow={(r) => ({ onClick: () => setOpen(r), style: { cursor: 'pointer' } })} locale={{ emptyText: <Empty description="No live permits" /> }}
        columns={[
          { title: 'Permit', render: (_, r) => <div><Text strong>{r.permit_number}</Text> {r.title}<div><Text type="secondary" style={{ fontSize: 12 }}>{r.permit_type.replace(/_/g, ' ')}</Text></div></div> },
          { title: 'Location', dataIndex: 'location', render: (v) => v || '-' },
          { title: 'Status', dataIndex: 'status', render: (s) => <Tag color={s === 'active' ? 'green' : s === 'expired' ? 'red' : 'blue'}>{s}</Tag> },
          { title: 'Until', render: (_, r) => dt(r.end_at) },
          { title: 'Isolations', render: (_, r) => (count(r.id) ? <Tag color="orange" icon={<LockOutlined />}>{count(r.id)} in place</Tag> : '-') },
        ]} />
      <Card size="small" title={<span><LockOutlined /> Isolation register: points in place now</span>} style={{ marginTop: 16, borderRadius: 12 }}>
        <Table rowKey="id" size="small" dataSource={isoAll} pagination={{ pageSize: 10, showSizeChanger: false }} scroll={{ x: 700 }} locale={{ emptyText: <Empty description="No isolations in place" /> }} columns={[
          { title: 'Point', dataIndex: 'point_tag' }, { title: 'Energy', dataIndex: 'energy_name' }, { title: 'Method', dataIndex: 'method_name' },
          { title: 'Permit', render: (_, r) => r.permit?.number }, { title: 'Status', render: (_, r) => <Tag color={ISO_COLOR[r.status]}>{r.status}</Tag> }, { title: 'Since', render: (_, r) => dt(r.isolated_at) },
        ]} />
      </Card>
      {open && <PermitDrawer key={open.id} permit={open} meta={meta} onClose={() => setOpen(null)} onChanged={load} />}
    </Card>
  );
};

const GasLog = () => {
  const [rows, setRows] = useState(null);
  const [permits, setPermits] = useState([]);
  const load = useCallback(() => { apiGet('/og/gas-tests').then((r) => setRows(r.data || [])).catch((e) => { setRows([]); message.error(err(e)); }); }, []);
  useEffect(() => { load(); apiGet('/work-permits').then((r) => setPermits((r.permits || []).filter((p) => LIVE.includes(p.status)))).catch(() => {}); }, [load]);
  return (
    <Card style={{ borderRadius: 16 }}>
      <GasForm permits={permits} onSaved={load} />
      <div style={{ marginTop: 12 }}><GasTable rows={rows || []} /></div>
    </Card>
  );
};

const Simops = () => {
  const [d, setD] = useState(null);
  const [hours, setHours] = useState(48);
  useEffect(() => { setD(null); apiGet(`/og/simops?hours=${hours}`).then((r) => setD(r)).catch((e) => { setD({ data: [] }); message.error(err(e)); }); }, [hours]);
  const C = { stop: ['red', 'Do not run together'], review: ['orange', 'SIMOPS review needed'], info: ['blue', 'Same place and time'] };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space wrap style={{ marginBottom: 12 }}>
        <Text>Permits overlapping in the next</Text>
        <Select value={hours} onChange={setHours} style={{ width: 120 }} options={[24, 48, 72, 168].map((h) => ({ value: h, label: h < 72 ? `${h} hours` : `${h / 24} days` }))} />
      </Space>
      {!d ? null : d.data.length === 0 ? <Alert type="success" showIcon message={`No overlapping permits at the same location (${d.permits_checked || 0} permits checked).`} /> : d.data.map((c, i) => (
        <Alert key={i} type={c.level === 'stop' ? 'error' : c.level === 'review' ? 'warning' : 'info'} showIcon style={{ marginBottom: 8 }}
          message={<span><Tag color={C[c.level][0]}>{C[c.level][1]}</Tag>{c.a.number} {c.a.type.replace(/_/g, ' ')} + {c.b.number} {c.b.type.replace(/_/g, ' ')} at {c.location}</span>}
          description={<div>{c.reason}<div style={{ fontSize: 12 }}>Overlap {dt(c.from)} to {dt(c.to)}</div></div>} />
      ))}
      {d?.note && <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>{d.note}</Paragraph>}
    </Card>
  );
};

// ------------------------------------------------------------------ management of change
const MOC_COLOR = { draft: 'default', review: 'gold', approved: 'blue', implemented: 'cyan', closed: 'green', rejected: 'red' };
const MocDrawer = ({ moc, types, canManage, onClose, onChanged, onOpenInspection }) => {
  const [form] = Form.useForm();
  const [m, setM] = useState(moc);
  useEffect(() => { form.setFieldsValue({ ...moc, expires_on: moc?.expires_on ? dayjs(moc.expires_on) : null }); setM(moc); }, [moc, form]);
  const save = async (extra = {}) => {
    const v = await form.validateFields();
    const body = { ...v, expires_on: v.expires_on ? v.expires_on.format('YYYY-MM-DD') : null, ...extra };
    try { const r = m?.id ? await apiPut(`/og/mocs/${m.id}`, body) : await apiPost('/og/mocs', body); setM(r.data); onChanged(); message.success('Saved'); return r.data; } catch (e) { message.error(err(e)); return null; }
  };
  const act = async (action) => {
    let note;
    if (action === 'reject') { note = window.prompt('Why is the change rejected?'); if (!note) return; }
    try { const r = await apiPut(`/og/mocs/${m.id}`, { action, note }); setM(r.data); onChanged(); } catch (e) { message.error(err(e)); }
  };
  const pssr = async () => { try { const r = await apiPost(`/og/mocs/${m.id}/pssr`, {}); onOpenInspection(r.data.id); } catch (e) { message.error(err(e)); } };
  const editable = !m || ['draft', 'rejected', 'review', 'approved', 'implemented'].includes(m.status);
  return (
    <Drawer open onClose={onClose} width={Math.min(860, window.innerWidth)} title={m?.id ? `${m.number} · ${m.title}` : 'New change (MOC)'}
      extra={editable && <Button type="primary" onClick={() => save()}>Save</Button>}>
      {m?.id && (
        <Space wrap style={{ marginBottom: 12 }}>
          <Tag color={MOC_COLOR[m.status]}>{m.status}</Tag>
          {m.expired && <Tag color="red">temporary change past its end date</Tag>}
          {['draft', 'rejected'].includes(m.status) && <Button onClick={() => act('submit')}>Submit for review</Button>}
          {canManage && m.status === 'review' && <><Button type="primary" onClick={() => act('approve')}>Approve</Button><Button danger onClick={() => act('reject')}>Reject</Button></>}
          {m.status === 'approved' && <Button onClick={() => act('implement')}>Mark implemented</Button>}
          {['approved', 'implemented'].includes(m.status) && m.needs_pssr && <Button onClick={pssr}>{m.pssr_inspection_id ? 'Open PSSR' : 'Start PSSR'}</Button>}
          {canManage && m.status === 'implemented' && <Button type="primary" onClick={() => act('close')}>Close change</Button>}
        </Space>
      )}
      {m?.decision_note && <Alert type={m.status === 'rejected' ? 'error' : 'info'} showIcon style={{ marginBottom: 12 }} message={`${m.approved_by || ''}: ${m.decision_note}`} />}
      <Form form={form} layout="vertical" disabled={!editable} initialValues={{ change_type: 'equipment', needs_pssr: true }}>
        <Row gutter={12}>
          <Col xs={24} md={16}><Form.Item name="title" label="Change" rules={[{ required: true, min: 3 }]}><Input maxLength={200} /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="change_type" label="Type"><Select options={types.map((t) => ({ value: t.id, label: t.name }))} /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="location" label="Unit / location"><Input maxLength={200} /></Form.Item></Col>
          <Col xs={12} md={6}><Form.Item name="risk_level" label="Risk"><Select allowClear options={['low', 'medium', 'high'].map((x) => ({ value: x, label: x }))} /></Form.Item></Col>
          <Col xs={12} md={6}><Form.Item name="temporary" valuePropName="checked" label=" "><Checkbox>Temporary</Checkbox></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item noStyle shouldUpdate={(a, b) => a.temporary !== b.temporary}>{({ getFieldValue }) => getFieldValue('temporary') && <Form.Item name="expires_on" label="Temporary until" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>}</Form.Item></Col>
          <Col span={24}><Form.Item name="description" label="What changes"><Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={8000} /></Form.Item></Col>
          <Col span={24}><Form.Item name="technical_basis" label="Technical basis"><Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={8000} /></Form.Item></Col>
          <Col span={24}><Form.Item name="safety_impact" label="Impact on safety and health"><Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} maxLength={8000} /></Form.Item></Col>
          <Col span={24}><Form.Item name="procedures_affected" label="Operating procedures affected"><Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} maxLength={4000} /></Form.Item></Col>
          <Col xs={12} md={6}><Form.Item name="needs_pssr" valuePropName="checked"><Checkbox>Needs PSSR</Checkbox></Form.Item></Col>
          <Col xs={12} md={6}><Form.Item name="training_done" valuePropName="checked"><Checkbox>People informed and trained</Checkbox></Form.Item></Col>
          <Col xs={12} md={6}><Form.Item name="psi_updated" valuePropName="checked"><Checkbox>Process safety information updated</Checkbox></Form.Item></Col>
          <Col xs={12} md={6}><Form.Item name="procedures_updated" valuePropName="checked"><Checkbox>Procedures updated</Checkbox></Form.Item></Col>
        </Row>
      </Form>
      <Paragraph type="secondary" style={{ fontSize: 12 }}>Follows OSHA 1910.119(l): technical basis, impact on safety and health, procedure changes, time period and authorisation; people trained before start-up. The PSSR follows 1910.119(i).</Paragraph>
    </Drawer>
  );
};

const Mocs = ({ onOpenInspection }) => {
  const [d, setD] = useState(null);
  const [open, setOpen] = useState(undefined);
  const load = useCallback(() => { apiGet('/og/mocs').then(setD).catch((e) => { setD({ data: [], change_types: [] }); message.error(err(e)); }); }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }} wrap>
        <Text>Management of change: equipment, process, procedure and organisation changes.</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(null)}>New change</Button>
      </Space>
      <Table rowKey="id" size="middle" loading={!d} dataSource={d?.data || []} scroll={{ x: 760 }} pagination={{ pageSize: 20, showSizeChanger: false }}
        onRow={(r) => ({ onClick: () => setOpen(r), style: { cursor: 'pointer' } })} locale={{ emptyText: <Empty description="No changes yet" /> }}
        columns={[
          { title: 'MOC', render: (_, r) => <div><Text strong>{r.number}</Text> {r.title}<div><Text type="secondary" style={{ fontSize: 12 }}>{r.change_type_name}{r.location ? ` · ${r.location}` : ''}</Text></div></div> },
          { title: 'Status', render: (_, r) => <Space size={4}><Tag color={MOC_COLOR[r.status]}>{r.status}</Tag>{r.expired && <Tag color="red">expired</Tag>}{r.temporary && <Tag>temporary</Tag>}</Space> },
          { title: 'Owner', dataIndex: 'owner' }, { title: 'Raised', render: (_, r) => dt(r.created_at) },
        ]} />
      {open !== undefined && <MocDrawer moc={open} types={d?.change_types || []} canManage={!!d?.can_manage} onClose={() => setOpen(undefined)} onChanged={load} onOpenInspection={onOpenInspection} />}
    </Card>
  );
};

const Bypasses = () => {
  const [d, setD] = useState(null);
  const [adding, setAdding] = useState(false);
  const [all, setAll] = useState(false);
  const [form] = Form.useForm();
  const load = useCallback(() => { apiGet(`/og/bypasses${all ? '' : '?active=1'}`).then(setD).catch((e) => { setD({ data: [], types: [] }); message.error(err(e)); }); }, [all]);
  useEffect(() => { load(); }, [load]);
  const add = async () => {
    const v = await form.validateFields();
    try { await apiPost('/og/bypasses', { ...v, planned_end: v.planned_end.toISOString() }); setAdding(false); form.resetFields(); load(); } catch (e) { message.error(err(e)); }
  };
  const remove = (b) => { const note = window.prompt('Device back in service: how was it tested?', 'Device reinstated and function tested'); if (note) apiPut(`/og/bypasses/${b.id}`, { action: 'remove', note }).then(load).catch((e) => message.error(err(e))); };
  const active = (d?.data || []).filter((b) => b.status === 'active');
  return (
    <Card style={{ borderRadius: 16 }}>
      {active.some((b) => b.overdue) && <Alert type="error" showIcon style={{ marginBottom: 12 }} message={`${active.filter((b) => b.overdue).length} bypass(es) past their planned end`} />}
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }} wrap>
        <Checkbox checked={all} onChange={(e) => setAll(e.target.checked)}>Show removed</Checkbox>
        {d?.can_manage && <Button type="primary" danger icon={<WarningOutlined />} onClick={() => setAdding(true)}>Authorise a bypass</Button>}
      </Space>
      <Table rowKey="id" size="middle" loading={!d} dataSource={d?.data || []} scroll={{ x: 900 }} pagination={{ pageSize: 20, showSizeChanger: false }} locale={{ emptyText: <Empty description="No safety devices bypassed" /> }}
        columns={[
          { title: 'Device', render: (_, r) => <div><Text strong>{r.device_tag}</Text><div><Text type="secondary" style={{ fontSize: 12 }}>{r.device_type_name}{r.location ? ` · ${r.location}` : ''}</Text></div></div> },
          { title: 'Why / meanwhile', render: (_, r) => <div>{r.reason}<div><Text type="secondary" style={{ fontSize: 12 }}>{r.mitigation}</Text></div></div> },
          { title: 'Planned end', render: (_, r) => <span>{dt(r.planned_end)} {r.overdue && <Tag color="red">overdue</Tag>}</span> },
          { title: 'By', dataIndex: 'authorised_by' },
          { title: '', render: (_, r) => (r.status === 'active' ? <Button size="small" onClick={() => remove(r)}>Back in service</Button> : <Tag>removed {dt(r.removed_at)}</Tag>) },
        ]} />
      <Modal open={adding} title="Authorise a safety device bypass" onCancel={() => setAdding(false)} onOk={add} okText="Authorise">
        <Form form={form} layout="vertical">
          <Form.Item name="device_tag" label="Device tag" rules={[{ required: true }]}><Input maxLength={80} /></Form.Item>
          <Form.Item name="device_type" label="Device type" rules={[{ required: true }]}><Select options={(d?.types || []).map((t) => ({ value: t.id, label: t.name }))} /></Form.Item>
          <Form.Item name="location" label="Location"><Input maxLength={200} /></Form.Item>
          <Form.Item name="reason" label="Why it is bypassed" rules={[{ required: true, min: 5 }]}><Input.TextArea maxLength={1000} /></Form.Item>
          <Form.Item name="mitigation" label="Compensating measures meanwhile" rules={[{ required: true, min: 5 }]}><Input.TextArea maxLength={1000} /></Form.Item>
          <Form.Item name="planned_end" label="Planned end" rules={[{ required: true }]}><DatePicker showTime style={{ width: '100%' }} disabledDate={(x) => x && x < dayjs().startOf('day')} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

const Zones = () => {
  const [d, setD] = useState(null);
  const [edit, setEdit] = useState(undefined);
  const [form] = Form.useForm();
  const load = useCallback(() => { apiGet('/og/zones').then(setD).catch((e) => { setD({ data: [], types: [] }); message.error(err(e)); }); }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (edit !== undefined) { form.resetFields(); form.setFieldsValue(edit ? { ...edit, requirements: (edit.requirements || []).join('\n') } : { zone_type: 'h2s' }); } }, [edit, form]);
  const save = async () => {
    const v = await form.validateFields();
    const body = { ...v, requirements: (v.requirements || '').split('\n') };
    try { if (edit?.id) await apiPut(`/og/zones/${edit.id}`, body); else await apiPost('/og/zones', body); setEdit(undefined); load(); } catch (e) { message.error(err(e)); }
  };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }} wrap>
        <Text>H2S areas, flare zones, hazardous areas and exclusion zones with their entry rules.</Text>
        {d?.can_manage && <Button type="primary" icon={<PlusOutlined />} onClick={() => setEdit(null)}>Add zone</Button>}
      </Space>
      <Row gutter={[12, 12]}>
        {(d?.data || []).length === 0 && <Col span={24}><Empty description="No zones defined" /></Col>}
        {(d?.data || []).map((z) => (
          <Col xs={24} md={12} xl={8} key={z.id}>
            <Card size="small" style={{ borderRadius: 12, opacity: z.active ? 1 : 0.55 }} title={<span>{z.name} <Tag color={z.zone_type === 'h2s' || z.zone_type === 'zone0' ? 'red' : 'orange'}>{z.zone_type_name}</Tag></span>}
              extra={d.can_manage && <Button size="small" onClick={() => setEdit(z)}>Edit</Button>}>
              {z.description && <Paragraph style={{ marginBottom: 6 }}>{z.description}</Paragraph>}
              {z.requirements.length ? <ul style={{ paddingLeft: 18, margin: 0 }}>{z.requirements.map((r) => <li key={r}>{r}</li>)}</ul> : <Text type="secondary">No entry rules</Text>}
              {!z.active && <div><Tag>inactive</Tag></div>}
            </Card>
          </Col>
        ))}
      </Row>
      <Modal open={edit !== undefined} title={edit?.id ? 'Edit zone' : 'Add zone'} onCancel={() => setEdit(undefined)} onOk={save} okText="Save"
        footer={(_, { OkBtn, CancelBtn }) => <>{edit?.id && <Button danger onClick={async () => { await apiDelete(`/og/zones/${edit.id}`).catch((e) => message.error(err(e))); setEdit(undefined); load(); }}>Delete</Button>}<CancelBtn /><OkBtn /></>}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, min: 2 }]}><Input maxLength={160} /></Form.Item>
          <Form.Item name="zone_type" label="Type" rules={[{ required: true }]}><Select options={(d?.types || []).map((t) => ({ value: t.id, label: t.name }))} /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea maxLength={1000} /></Form.Item>
          <Form.Item name="requirements" label="Entry rules (one per line)"><Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} placeholder={'Personal H2S monitor\nEscape breathing set\nWind sock visible'} /></Form.Item>
          {edit?.id && <Form.Item name="active" valuePropName="checked"><Checkbox>Active</Checkbox></Form.Item>}
        </Form>
      </Modal>
    </Card>
  );
};

export const useOilGasTabs = (enabled) => {
  const history = useHistory();
  if (!enabled) return [];
  const openInspection = (id) => history.push(`/inspections?open=${id}`);
  return [
    { key: 'permits', label: <span><LockOutlined /> Permits and isolations</span>, children: <Permits /> },
    { key: 'gas', label: <span><ExperimentOutlined /> Gas tests</span>, children: <GasLog /> },
    { key: 'simops', label: <span><SwapOutlined /> SIMOPS</span>, children: <Simops /> },
    { key: 'moc', label: <span><ApartmentOutlined /> Change (MOC)</span>, children: <Mocs onOpenInspection={openInspection} /> },
    { key: 'bypass', label: <span><WarningOutlined /> Bypassed devices</span>, children: <Bypasses /> },
    { key: 'zones', label: <span><AlertOutlined /> Zones</span>, children: <Zones /> },
  ];
};
