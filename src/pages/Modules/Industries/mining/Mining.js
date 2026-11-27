// Mining tools inside HSE > Mining: critical control verification, fit for shift (fatigue), ground control TARP and
// blast clearance. They act on the result: failed controls stay open, not-fit workers are told before the shift,
// red TARP readings say withdraw, a blast cannot be fired until every post is clear. Data: /api/mining/*.
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Checkbox, Col, DatePicker, Empty, Form, Input, InputNumber, Modal, Radio, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { AimOutlined, AlertOutlined, CarOutlined, CloudOutlined, FireOutlined, LineChartOutlined, PlusOutlined, SafetyOutlined, TeamOutlined } from '@ant-design/icons';
import { apiGet, apiPost } from '../../../../services/api';
import { Exposure, Fleet, Monitoring, TagBoard } from './Mining2';

const { Text, Paragraph } = Typography;
const err = (e) => e?.response?.data?.error || e?.data?.error || e?.message || 'Something went wrong';
const dt = (x) => (x ? dayjs(x).format('D MMM HH:mm') : '-');
const local = (d) => d.format('YYYY-MM-DDTHH:mm:ss');
const ST = { effective: ['green', 'Controls effective'], failed: ['red', 'CONTROL FAILED'], unverified: ['orange', 'Not verified in 30 days'] };

// ------------------------------------------------------------------ critical controls
const Controls = () => {
  const [d, setD] = useState(null);
  const [verify, setVerify] = useState(null);
  const [answers, setAnswers] = useState({});
  const [area, setArea] = useState('');
  const [action, setAction] = useState('');
  const load = useCallback(() => { apiGet('/mining/risks').then(setD).catch((e) => { setD({ data: [] }); message.error(err(e)); }); }, []);
  useEffect(() => { load(); }, [load]);
  const open = (r) => { setVerify(r); setAnswers({}); setAction(''); };
  const submit = async () => {
    try {
      const r = await apiPost('/mining/verifications', { risk_id: verify.id, area, answers, immediate_action: action });
      if (r.data.result === 'failed') message.error('Critical control failed: supervisors have been told'); else message.success('All critical controls effective');
      setVerify(null); load();
    } catch (e) { message.error(err(e)); }
  };
  const close = (v) => {
    const note = window.prompt('How was the control restored?');
    if (note) apiPost(`/mining/verifications/${v.id}/close`, { note }).then(load).catch((e) => message.error(err(e)));
  };
  const failing = verify ? Object.values(answers).some((a) => a.value === 'no') : false;
  return (
    <div>
      <Paragraph>Verify in the field that the critical controls for each fatal risk are really in place. A failed control stays open until a supervisor restores it, and areas nobody has verified for a week show as blind spots.</Paragraph>
      <Row gutter={[12, 12]}>
        {(d?.data || []).map((r) => (
          <Col xs={24} lg={12} key={r.id}>
            <Card size="small" style={{ borderRadius: 12, borderColor: r.status === 'failed' ? '#ff4d4f' : undefined }}
              title={<Space wrap><Text strong>{r.name}</Text><Tag color={ST[r.status][0]}>{ST[r.status][1]}</Tag></Space>}
              extra={<Button size="small" type="primary" onClick={() => open(r)}>Verify</Button>}>
              <Text type="secondary">{r.verifications_30d} verification(s) in 30 days{r.effective_pct != null ? ` · ${r.effective_pct}% effective` : ''}</Text>
              {r.open_failures.map((f) => (
                <Alert key={f.id} type="error" showIcon style={{ marginTop: 8 }} message={`${f.area}: ${f.failed_controls.map((c) => r.controls.find((x) => x.id === c)?.text).join('; ')}`}
                  description={`Done now: ${f.action || '-'} (${dt(f.at)})`} action={d.can_manage && <Button size="small" onClick={() => close(f)}>Restored</Button>} />
              ))}
              {r.weakest_controls.length > 0 && <div style={{ marginTop: 6 }}><Text type="secondary">Most often failed: </Text>{r.weakest_controls.map(([c, n]) => <Tag key={c} color="volcano">{r.controls.find((x) => x.id === c)?.text.slice(0, 50)} ({n})</Tag>)}</div>}
              {r.stale_areas.length > 0 && <div style={{ marginTop: 6 }}><Text type="warning">Blind spots (not verified for 7+ days): </Text>{r.stale_areas.map((s) => <Tag key={s.area}>{s.area}</Tag>)}</div>}
            </Card>
          </Col>
        ))}
      </Row>
      <Modal open={!!verify} title={verify ? `Verify: ${verify.name}` : ''} onCancel={() => setVerify(null)} onOk={submit} okText="Submit" width={720}>
        <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area / workplace (e.g. Level 3 Stope 4)" style={{ marginBottom: 12 }} maxLength={160} />
        {verify?.controls.map((c) => (
          <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
            <Text strong>{c.text}</Text>
            {c.check && <div><Text type="secondary">{c.check}</Text></div>}
            <Radio.Group style={{ marginTop: 4 }} value={answers[c.id]?.value} onChange={(e) => setAnswers({ ...answers, [c.id]: { ...answers[c.id], value: e.target.value } })}
              options={[{ value: 'yes', label: 'In place' }, { value: 'no', label: 'Not in place' }, { value: 'na', label: 'Not applicable' }]} optionType="button" />
            {answers[c.id]?.value === 'no' && <Input style={{ marginTop: 6 }} placeholder="What is wrong?" maxLength={300} value={answers[c.id]?.note} onChange={(e) => setAnswers({ ...answers, [c.id]: { ...answers[c.id], note: e.target.value } })} />}
          </div>
        ))}
        {failing && <><Alert type="error" showIcon style={{ marginTop: 12 }} message="A critical control is not in place: stop the work it protects." />
          <Input.TextArea style={{ marginTop: 8 }} value={action} onChange={(e) => setAction(e.target.value)} maxLength={1000} placeholder="What was done now (e.g. work stopped, area barricaded)" /></>}
      </Modal>
    </div>
  );
};

// ------------------------------------------------------------------ fit for shift
const RES = { fit: ['success', 'Fit for work'], at_risk: ['warning', 'At risk: take the precautions below'], not_fit: ['error', 'Not fit for safety-critical work'] };
const Fatigue = () => {
  const [form] = Form.useForm();
  const [res, setRes] = useState(null);
  const [d, setD] = useState(null);
  const load = useCallback(() => { apiGet('/mining/fatigue').then(setD).catch(() => setD({ data: [] })); }, []);
  useEffect(() => { load(); }, [load]);
  const submit = async () => {
    const v = await form.validateFields();
    const start = v.shift[0]; const end = v.shift[1];
    try {
      const r = await apiPost('/mining/fatigue', { shift_start: local(start), shift_end: local(end), woke_at: local(v.woke_at), sleep_24: v.sleep_24, sleep_48: v.sleep_48, safety_critical: v.safety_critical });
      setRes(r.data); load();
    } catch (e) { message.error(err(e)); }
  };
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={10}>
        <Card size="small" title="Before your shift" style={{ borderRadius: 12 }}>
          <Form form={form} layout="vertical" initialValues={{ safety_critical: true, shift: [dayjs().hour(6).minute(0).second(0).add(1, 'day'), dayjs().hour(18).minute(0).second(0).add(1, 'day')] }}>
            <Form.Item name="shift" label="Shift start and end" rules={[{ required: true }]}><DatePicker.RangePicker showTime={{ format: 'HH:mm' }} format="D MMM HH:mm" style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="woke_at" label="When did you wake up (or will you)?" rules={[{ required: true }]}><DatePicker showTime={{ format: 'HH:mm' }} format="D MMM HH:mm" style={{ width: '100%' }} /></Form.Item>
            <Row gutter={8}>
              <Col span={12}><Form.Item name="sleep_24" label="Sleep in last 24 h" rules={[{ required: true }]}><InputNumber min={0} max={24} step={0.5} addonAfter="h" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="sleep_48" label="Sleep in last 48 h" rules={[{ required: true }]}><InputNumber min={0} max={48} step={0.5} addonAfter="h" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Form.Item name="safety_critical" valuePropName="checked"><Checkbox>I will drive, operate plant, isolate, blast or work at height</Checkbox></Form.Item>
            <Button type="primary" onClick={submit} block>Check</Button>
          </Form>
          {res && <Alert style={{ marginTop: 12 }} type={RES[res.result][0]} showIcon message={RES[res.result][1]}
            description={<div>{res.reasons.map((r) => <div key={r}>{r}</div>)}{res.controls.length > 0 && <ul style={{ paddingLeft: 18, margin: '6px 0 0' }}>{res.controls.map((c) => <li key={c}>{c}</li>)}</ul>}</div>} />}
          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>Rule used: at least 5 h sleep in the last 24 h and 12 h in the last 48 h, and no more hours awake at the end of the shift than hours slept in 48 h (Dawson &amp; McCulloch prior sleep-wake model). Roster: shifts up to 12 h, at least 10 h rest between shifts.</Paragraph>
        </Card>
      </Col>
      <Col xs={24} lg={14}>
        <Card size="small" title={d?.can_manage ? 'Crew checks this week' : 'My checks this week'} style={{ borderRadius: 12 }}>
          <Table rowKey="id" size="small" dataSource={d?.data || []} pagination={{ pageSize: 10, showSizeChanger: false }} scroll={{ x: 560 }} locale={{ emptyText: <Empty description="No checks yet" /> }} columns={[
            ...(d?.can_manage ? [{ title: 'Person', dataIndex: 'person' }] : []),
            { title: 'Shift', render: (_, r) => `${dt(r.shift_start)} - ${dayjs(r.shift_end).format('HH:mm')}` },
            { title: 'Sleep 24 / 48 h', render: (_, r) => `${r.sleep_24} / ${r.sleep_48}` },
            { title: 'Result', render: (_, r) => <Tag color={{ fit: 'green', at_risk: 'orange', not_fit: 'red' }[r.result]}>{r.result.replace('_', ' ')}</Tag> },
          ]} />
        </Card>
      </Col>
    </Row>
  );
};

// ------------------------------------------------------------------ ground control TARP
const LV = { green: 'green', amber: 'orange', red: 'red' };
const Tarps = () => {
  const [d, setD] = useState(null);
  const [reading, setReading] = useState(null);
  const [val, setVal] = useState(null);
  const [signs, setSigns] = useState([]);
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(false);
  const [form] = Form.useForm();
  const load = useCallback(() => { apiGet('/mining/tarps').then(setD).catch((e) => { setD({ data: [], signs: { red: [], amber: [] } }); message.error(err(e)); }); }, []);
  useEffect(() => { load(); }, [load]);
  const record = async () => {
    try {
      const r = await apiPost(`/mining/tarps/${reading.id}/readings`, { value: val, signs, note });
      Modal[r.data.level === 'red' ? 'error' : r.data.level === 'amber' ? 'warning' : 'success']({ title: `TARP level ${r.data.level.toUpperCase()}`, content: <ul>{r.data.actions.map((a) => <li key={a}>{a}</li>)}</ul> });
      setReading(null); load();
    } catch (e) { message.error(err(e)); }
  };
  const add = async () => {
    const v = await form.validateFields();
    try { await apiPost('/mining/tarps', v); setAdding(false); form.resetFields(); load(); } catch (e) { message.error(err(e)); }
  };
  return (
    <div>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }} wrap>
        <Text>Trigger action response plans: each reading or sign sets the level and tells people what to do.</Text>
        {d?.can_manage && <Button type="primary" icon={<PlusOutlined />} onClick={() => setAdding(true)}>New TARP</Button>}
      </Space>
      <Row gutter={[12, 12]}>
        {(d?.data || []).length === 0 && <Col span={24}><Empty description="No TARPs set up yet" /></Col>}
        {(d?.data || []).map((t) => (
          <Col xs={24} md={12} xl={8} key={t.id}>
            <Card size="small" style={{ borderRadius: 12, borderColor: t.level === 'red' ? '#ff4d4f' : t.level === 'amber' ? '#faad14' : undefined }}
              title={<Space><Text strong>{t.name}</Text><Tag color={LV[t.level]}>{t.level.toUpperCase()}</Tag></Space>}
              extra={<Button size="small" onClick={() => { setReading(t); setVal(null); setSigns([]); setNote(''); }}>Record</Button>}>
              <div>{t.parameter}: amber at {t.amber_at}, red at {t.red_at} {t.unit || ''}{t.location ? ` · ${t.location}` : ''}</div>
              {t.last && <Text type="secondary">Last: {t.last.value ?? '-'} {t.unit || ''} {t.last.signs.join(', ')} ({dt(t.last.at)})</Text>}
              {t.level !== 'green' && <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{t.actions[t.level].map((a) => <li key={a}>{a}</li>)}</ul>}
            </Card>
          </Col>
        ))}
      </Row>
      <Modal open={!!reading} title={reading ? `Record: ${reading.name}` : ''} onCancel={() => setReading(null)} onOk={record} okText="Record">
        <InputNumber value={val} onChange={setVal} style={{ width: '100%' }} addonBefore={reading?.parameter} addonAfter={reading?.unit} />
        <div style={{ marginTop: 10 }}><Text strong>What you see</Text></div>
        <Checkbox.Group value={signs} onChange={setSigns} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
          options={[...(d?.signs?.amber || []), ...(d?.signs?.red || [])].map((s) => ({ value: s, label: s }))} />
        <Input.TextArea style={{ marginTop: 8 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" maxLength={1000} />
      </Modal>
      <Modal open={adding} title="New TARP" onCancel={() => setAdding(false)} onOk={add} okText="Save">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="e.g. Stope 4 hangingwall" maxLength={160} /></Form.Item>
          <Form.Item name="location" label="Location"><Input maxLength={160} /></Form.Item>
          <Row gutter={8}>
            <Col span={12}><Form.Item name="parameter" label="What is measured" rules={[{ required: true }]}><Input placeholder="Convergence" maxLength={120} /></Form.Item></Col>
            <Col span={12}><Form.Item name="unit" label="Unit"><Input placeholder="mm/day" maxLength={20} /></Form.Item></Col>
            <Col span={12}><Form.Item name="amber_at" label="Amber at" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="red_at" label="Red at" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Paragraph type="secondary" style={{ fontSize: 12 }}>Trigger values come from your geotechnical engineer. Default actions (monitor / inspect / withdraw) are added and can be changed.</Paragraph>
        </Form>
      </Modal>
    </div>
  );
};

// ------------------------------------------------------------------ blasting
const Blasts = () => {
  const [d, setD] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form] = Form.useForm();
  const load = useCallback(() => { apiGet('/mining/blasts').then(setD).catch((e) => { setD({ data: [] }); message.error(err(e)); }); }, []);
  useEffect(() => { load(); }, [load]);
  const act = async (b, action, extra = {}) => {
    try { await apiPost(`/mining/blasts/${b.id}`, { action, ...extra }); load(); } catch (e) { message.error(err(e)); }
  };
  const add = async () => {
    const v = await form.validateFields();
    const posts = (v.posts || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [name, guard] = l.split(':'); return { name: name.trim(), guard: (guard || '').trim() }; });
    try { await apiPost('/mining/blasts', { ...v, planned_at: local(v.planned_at), posts }); setAdding(false); form.resetFields(); load(); } catch (e) { message.error(err(e)); }
  };
  return (
    <div>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }} wrap>
        <Text>Firing is blocked until every guard post confirms its area clear; re-entry waits for the set time.</Text>
        {d?.can_manage && <Button type="primary" icon={<PlusOutlined />} onClick={() => setAdding(true)}>Plan a blast</Button>}
      </Space>
      {(d?.data || []).length === 0 && <Empty description="No blasts planned" />}
      {(d?.data || []).map((b) => (
        <Card key={b.id} size="small" style={{ borderRadius: 12, marginBottom: 10 }} title={<Space wrap><Text strong>{b.ref}</Text>{b.location}<Tag color={b.status === 'planned' ? (b.all_clear ? 'green' : 'orange') : b.status === 'fired' ? 'red' : 'default'}>{b.status === 'planned' ? (b.all_clear ? 'all clear: ready to fire' : 'clearing') : b.status}</Tag>{b.misfire && <Tag color="red">misfire</Tag>}</Space>}
          extra={<Text type="secondary">{dt(b.planned_at)} · {b.exclusion_m} m</Text>}>
          {b.status === 'planned' && b.posts.map((p, i) => (
            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span>{p.name}{p.guard ? ` (${p.guard})` : ''}</span>
              {p.cleared_at ? <Tag color="green">clear · {p.cleared_by} {dayjs(p.cleared_at).format('HH:mm')}</Tag> : <Button size="small" onClick={() => act(b, 'clear', { post: i })}>Confirm clear</Button>}
            </div>
          ))}
          <Space wrap style={{ marginTop: 8 }}>
            {b.status === 'planned' && d.can_manage && <><Button type="primary" danger disabled={!b.all_clear} onClick={() => act(b, 'fire')}>Fired</Button><Button disabled={!b.all_clear} onClick={() => act(b, 'misfire', { note: window.prompt('Misfire details') || '' })}>Fired with misfire</Button><Button onClick={() => act(b, 'cancel')}>Cancel</Button></>}
            {b.status === 'fired' && (b.reentry_wait_min > 0 ? <Tag color="red">Re-entry in {b.reentry_wait_min} min</Tag>
              : d.can_manage && <Button type="primary" onClick={() => { const note = window.prompt(b.misfire ? 'Re-entry check, including how the misfire was dealt with' : 'Re-entry check (fumes cleared, ground examined)'); if (note) act(b, 'reentry', { note }); }}>Allow re-entry</Button>)}
            {b.status === 'reentry' && <Text type="secondary">Re-entry {dt(b.reentry_at)} by {b.reentry_by}: {b.note}</Text>}
          </Space>
        </Card>
      ))}
      <Modal open={adding} title="Plan a blast" onCancel={() => setAdding(false)} onOk={add} okText="Save">
        <Form form={form} layout="vertical" initialValues={{ reentry_min: 30 }}>
          <Form.Item name="location" label="Location" rules={[{ required: true }]}><Input maxLength={160} /></Form.Item>
          <Form.Item name="planned_at" label="Time" rules={[{ required: true }]}><DatePicker showTime={{ format: 'HH:mm' }} style={{ width: '100%' }} /></Form.Item>
          <Row gutter={8}>
            <Col span={12}><Form.Item name="exclusion_m" label="Exclusion radius (m)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="reentry_min" label="Re-entry wait (min)" rules={[{ required: true }]}><InputNumber min={5} max={1440} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="shotfirer" label="Shotfirer"><Input maxLength={120} /></Form.Item>
          <Form.Item name="posts" label="Guard posts (one per line, 'post: guard name')" rules={[{ required: true }]}><Input.TextArea autoSize={{ minRows: 3 }} placeholder={'North ramp gate: Yaw\nHaul road east: Esi'} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export const useMiningTabs = (enabled) => (enabled ? [
  { key: 'controls', label: <span><SafetyOutlined /> Critical controls</span>, children: <Controls /> },
  { key: 'fatigue', label: <span><AlertOutlined /> Fit for shift</span>, children: <Fatigue /> },
  { key: 'tarp', label: <span><AimOutlined /> Ground TARP</span>, children: <Tarps /> },
  { key: 'blast', label: <span><FireOutlined /> Blasting</span>, children: <Blasts /> },
  { key: 'tagboard', label: <span><TeamOutlined /> Underground tag board</span>, children: <TagBoard /> },
  { key: 'exposure', label: <span><CloudOutlined /> Dust & silica</span>, children: <Exposure /> },
  { key: 'fleet', label: <span><CarOutlined /> Fleet pre-start</span>, children: <Fleet /> },
  { key: 'monitoring', label: <span><LineChartOutlined /> Slope & tailings</span>, children: <Monitoring /> },
] : []);

