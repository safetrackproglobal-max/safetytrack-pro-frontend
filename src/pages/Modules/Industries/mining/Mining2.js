// Mining part 2 inside HSE > Mining: underground tag board with emergency roll call and refuge chambers, dust & silica
// exposure (TWA, group statistics, health checks), fleet pre-start board and slope / tailings monitoring.
// Data: /api/mining/tagboard, /emergencies, /refuges, /exposure, /health-checks, /fleet, /monitoring.
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Alert, Button, Card, Col, DatePicker, Empty, Form, Input, InputNumber, List, Modal, Radio, Row, Select, Space, Statistic, Table, Tag, Typography, message,
} from 'antd';
import dayjs from 'dayjs';
import { AlertOutlined, LoginOutlined, LogoutOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { apiGet, apiPost, apiPut } from '../../../../services/api';

const { Text, Paragraph } = Typography;
const err = (e) => e?.data?.error || e?.response?.data?.error || e?.message || 'Something went wrong';
const dt = (x) => (x ? dayjs(x).format('D MMM HH:mm') : '-');
const local = (d) => d.format('YYYY-MM-DDTHH:mm:ss');
const LVL = { red: 'red', amber: 'orange', green: 'green', unknown: 'default' };

// ------------------------------------------------------------------ tag board + emergency + refuges
const RollCall = ({ em, canManage, onChanged }) => {
  const act = (body) => apiPut(`/mining/emergencies/${em.id}`, body).then(onChanged).catch((e) => message.error(err(e)));
  const account = (x) => { const where = window.prompt(`Where is ${x.person} now?`, x.refuges[0] ? x.refuges[0].split(' (')[0] : 'Surface muster point'); if (where) act({ action: 'account', presence_id: x.presence_id, where }); };
  const close = () => {
    const note = em.unaccounted ? window.prompt('Not everyone is confirmed safe. Why close now?', '') : 'All confirmed safe';
    if (note !== null) act({ action: 'close', note });
  };
  const ST = { unknown: ['red', 'NOT ACCOUNTED FOR'], safe: ['green', 'safe'], missing: ['volcano', 'MISSING'] };
  const people = [...em.people].sort((a, b) => (a.status === 'safe') - (b.status === 'safe'));
  return (
    <Card style={{ borderRadius: 16, border: '2px solid #cf1322', marginBottom: 16 }}
      title={<span style={{ color: '#cf1322' }}><AlertOutlined /> EMERGENCY: {em.kind_name}{em.area ? ` at ${em.area}` : ''} · {em.minutes} min</span>}
      extra={canManage && <Button danger onClick={close}>Close emergency</Button>}>
      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col xs={12}><Statistic title="Not accounted for" value={em.unaccounted} valueStyle={{ color: em.unaccounted ? '#cf1322' : '#389e0d' }} /></Col>
        <Col xs={12}><Statistic title="Safe" value={`${em.accounted - em.people.filter((p) => p.status === 'missing').length} / ${em.total}`} /></Col>
      </Row>
      <List size="small" dataSource={people} renderItem={(x) => (
        <List.Item key={x.presence_id} actions={x.status === 'safe' ? [<Button key="u" size="small" type="link" onClick={() => act({ action: 'reset', presence_id: x.presence_id })}>Undo</Button>]
          : [<Button key="a" size="small" type="primary" onClick={() => account(x)}>Safe</Button>, <Button key="m" size="small" danger onClick={() => act({ action: 'missing', presence_id: x.presence_id })}>Missing</Button>]}>
          <div style={{ minWidth: 0 }}>
            <Tag color={ST[x.status][0]}>{ST[x.status][1]}</Tag> <Text strong>{x.person}</Text>{x.employer ? <Text type="secondary"> ({x.employer})</Text> : null}
            <div style={{ fontSize: 12 }}>Last area: {x.area}{x.where ? ` · now: ${x.where}` : ''}{x.status !== 'safe' ? ` · refuge there: ${x.refuges.length ? x.refuges.join(', ') : 'none recorded'}` : ''}</div>
          </div>
        </List.Item>
      )} />
    </Card>
  );
};

const Refuges = ({ canManage }) => {
  const [d, setD] = useState(null);
  const [edit, setEdit] = useState(null);
  const [check, setCheck] = useState(null);
  const [ans, setAns] = useState({});
  const [form] = Form.useForm();
  const load = useCallback(() => apiGet('/mining/refuges').then(setD).catch(() => setD({ data: [], items: [] })), []);
  useEffect(() => { load(); }, [load]);
  const save = async () => {
    const v = await form.validateFields().catch(() => null); if (!v) return;
    try { if (edit.id) await apiPut(`/mining/refuges/${edit.id}`, v); else await apiPost('/mining/refuges', v); setEdit(null); load(); } catch (e) { message.error(err(e)); }
  };
  const submit = async () => {
    try { const r = await apiPost(`/mining/refuges/${check.id}/checks`, { answers: ans }); if (r.data.usable) message.success('Refuge ready'); else message.error(`Not ready: ${r.data.issues.join('; ')}`); setCheck(null); load(); } catch (e) { message.error(err(e)); }
  };
  return (
    <Card size="small" title="Refuge chambers" style={{ borderRadius: 12, marginTop: 16 }} extra={canManage && <Button size="small" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ check_every_days: 30 }); setEdit({}); }}>Refuge</Button>}>
      {(d?.data || []).length === 0 ? <Text type="secondary">No refuge chambers recorded.</Text> : (
        <List size="small" dataSource={d.data} renderItem={(r) => (
          <List.Item key={r.id} actions={[<Button key="c" size="small" onClick={() => { setAns({}); setCheck(r); }}>Check</Button>, canManage && <Button key="e" size="small" type="link" onClick={() => { form.setFieldsValue(r); setEdit(r); }}>Edit</Button>].filter(Boolean)}>
            <div style={{ minWidth: 0 }}><Text strong>{r.name}</Text> <Text type="secondary">{r.area} · {r.capacity} places{r.air_hours ? ` · ${r.air_hours} h air` : ''}</Text>
              <div>{r.usable ? <Tag color="green">ready</Tag> : <Tag color="red">{r.last_ok === false ? `not ready: ${r.issues.join('; ')}` : r.overdue ? 'check overdue' : 'not ready'}</Tag>}
                <Text type="secondary" style={{ fontSize: 12 }}>last checked {dt(r.last_checked_at)}</Text></div></div>
          </List.Item>
        )} />
      )}
      <Modal open={!!edit} title={edit?.id ? 'Edit refuge' : 'Add refuge chamber'} onCancel={() => setEdit(null)} onOk={save} okText="Save">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input maxLength={120} /></Form.Item>
          <Form.Item name="area" label="Area / level it serves (same words as the tag board)" rules={[{ required: true }]}><Input maxLength={160} /></Form.Item>
          <Row gutter={8}>
            <Col span={8}><Form.Item name="capacity" label="Places" rules={[{ required: true }]}><InputNumber min={1} max={500} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="air_hours" label="Air supply (h)"><InputNumber min={1} max={500} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="check_every_days" label="Check every (days)" rules={[{ required: true }]} extra="Set to your law and the maker"><InputNumber min={1} max={365} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
      <Modal open={!!check} title={check ? `Check ${check.name}` : ''} onCancel={() => setCheck(null)} onOk={submit} okText="Save check">
        {(d?.items || []).map((i) => (
          <div key={i.key} style={{ marginBottom: 8 }}><div>{i.text}</div>
            <Radio.Group value={ans[i.key]} onChange={(e) => setAns({ ...ans, [i.key]: e.target.value })}><Radio value="ok">OK</Radio><Radio value="fail">Not OK</Radio></Radio.Group></div>
        ))}
      </Modal>
    </Card>
  );
};

export const TagBoard = () => {
  const [d, setD] = useState(null);
  const [tagIn, setTagIn] = useState(false);
  const [emOpen, setEmOpen] = useState(false);
  const [em, setEm] = useState({ kind: 'fire', area: '' });
  const [form] = Form.useForm();
  const load = useCallback(() => apiGet('/mining/tagboard').then(setD).catch((e) => { setD({ areas: [], recent_out: [] }); message.error(err(e)); }), []);
  useEffect(() => { load(); }, [load]);
  const doIn = async () => {
    const v = await form.validateFields().catch(() => null); if (!v) return;
    try {
      const r = await apiPost('/mining/tagboard', { ...v, expected_out: v.expected_out ? local(v.expected_out) : null });
      (r.warnings || []).forEach((w) => message.warning(w)); message.success(`${r.data.person} tagged in`); setTagIn(false); form.resetFields(); load();
    } catch (e) { message.error(err(e)); }
  };
  const out = (p) => apiPut(`/mining/tagboard/${p.id}`, { action: 'out' }).then(load).catch((e) => message.error(err(e)));
  const move = (p) => { const area = window.prompt(`${p.person} moved to which area?`, ''); if (area) apiPut(`/mining/tagboard/${p.id}`, { action: 'move', area }).then(load).catch((e) => message.error(err(e))); };
  const start = async () => { try { await apiPost('/mining/emergencies', em); setEmOpen(false); load(); } catch (e) { message.error(err(e)); } };
  if (!d) return <Card loading style={{ borderRadius: 16 }} />;
  return (
    <div>
      {d.emergency && <RollCall em={d.emergency} canManage={d.can_manage} onChanged={load} />}
      <Card style={{ borderRadius: 16 }}>
        <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
          <Space size={24}><Statistic title="Underground now" value={d.total} /><Statistic title="Past expected time out" value={d.overdue} valueStyle={{ color: d.overdue ? '#cf1322' : undefined }} /></Space>
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={load} aria-label="Reload" />
            <Button type="primary" icon={<LoginOutlined />} disabled={!!d.emergency} onClick={() => setTagIn(true)}>Tag in</Button>
            {!d.emergency && <Button danger type="primary" icon={<AlertOutlined />} onClick={() => setEmOpen(true)}>Emergency</Button>}
          </Space>
        </Space>
        {d.areas.length === 0 && <Empty description="Nobody is tagged in underground" />}
        {d.areas.map((a) => (
          <Card key={a.area} size="small" style={{ borderRadius: 12, marginBottom: 12 }} title={<span>{a.area} <Tag>{a.count} {a.count === 1 ? 'person' : 'people'}</Tag>{a.refuges.length > 0 && <Tag color={a.refuge_capacity >= a.count ? 'green' : 'red'}>refuge places {a.refuge_capacity}</Tag>}</span>}>
            {a.warnings.map((w) => <Alert key={w} type="warning" showIcon style={{ marginBottom: 8 }} message={w} />)}
            <List size="small" dataSource={a.people} renderItem={(p) => (
              <List.Item key={p.id} actions={[<Button key="m" size="small" onClick={() => move(p)}>Moved</Button>, <Button key="o" size="small" icon={<LogoutOutlined />} onClick={() => out(p)}>Out</Button>]}>
                <div style={{ minWidth: 0 }}><Text strong>{p.person}</Text>{p.employer ? <Text type="secondary"> ({p.employer})</Text> : null} {p.overdue && <Tag color="red">past expected out {dt(p.expected_out)}</Tag>}
                  <div style={{ fontSize: 12 }}>In {dt(p.entered_at)} · self-rescuer {p.scsr_tag}{p.lamp_no ? ` · lamp ${p.lamp_no}` : ''}</div></div>
              </List.Item>
            )} />
          </Card>
        ))}
        <Refuges canManage={d.can_manage} />
      </Card>
      <Modal open={tagIn} title="Tag in underground" onCancel={() => setTagIn(false)} onOk={doIn} okText="Tag in">
        <Form form={form} layout="vertical">
          <Form.Item name="person" label="Name" rules={[{ required: true, min: 2 }]}><Input maxLength={120} /></Form.Item>
          <Form.Item name="employer" label="Employer (contractors)"><Input maxLength={120} /></Form.Item>
          <Form.Item name="area" label="Going to (area / level)" rules={[{ required: true, min: 2 }]}><Input maxLength={160} /></Form.Item>
          <Row gutter={8}>
            <Col span={12}><Form.Item name="scsr_tag" label="Self-rescuer number" rules={[{ required: true, message: 'No self-rescuer, no entry' }]} extra="Its equipment tag, so the service date is checked"><Input maxLength={40} /></Form.Item></Col>
            <Col span={12}><Form.Item name="lamp_no" label="Cap lamp"><Input maxLength={40} /></Form.Item></Col>
          </Row>
          <Form.Item name="expected_out" label="Expected out (default 12 h)"><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
      <Modal open={emOpen} title="Start an emergency roll call" onCancel={() => setEmOpen(false)} onOk={start} okText="START EMERGENCY" okButtonProps={{ danger: true }}>
        <Paragraph>Everyone tagged in now goes on the roll call. Supervisors are alerted and new tag-ins are stopped.</Paragraph>
        <Select value={em.kind} onChange={(v) => setEm({ ...em, kind: v })} style={{ width: '100%', marginBottom: 8 }} options={Object.entries(d.kinds || {}).map(([k, v]) => ({ value: k, label: v }))} />
        <Input placeholder="Where (optional)" value={em.area} onChange={(e) => setEm({ ...em, area: e.target.value })} maxLength={160} />
      </Modal>
    </div>
  );
};

// ------------------------------------------------------------------ exposure
export const Exposure = () => {
  const [d, setD] = useState(null);
  const [adding, setAdding] = useState(false);
  const [hc, setHc] = useState(null);
  const [form] = Form.useForm();
  const [hform] = Form.useForm();
  const load = useCallback(() => apiGet('/mining/exposure').then(setD).catch((e) => { setD({ samples: [], segs: [], workers: [], agents: [] }); message.error(err(e)); }), []);
  useEffect(() => { load(); }, [load]);
  const save = async () => {
    const v = await form.validateFields().catch(() => null); if (!v) return;
    try {
      const r = await apiPost('/mining/exposure', { ...v, sampled_on: v.sampled_on ? v.sampled_on.format('YYYY-MM-DD') : null });
      const x = r.data; (r.warnings || []).forEach((w) => message.warning(w));
      (x.result === 'over' ? message.error : x.result === 'action' ? message.warning : message.success)(`TWA ${x.twa8} mg/m3: ${x.result === 'over' ? 'OVER the limit' : x.result === 'action' ? 'at or above the action level' : 'below the action level'}`);
      setAdding(false); form.resetFields(['conc', 'lab_ref', 'note']); load();
    } catch (e) { message.error(err(e)); }
  };
  const saveHc = async () => {
    const v = await hform.validateFields().catch(() => null); if (!v) return;
    try { await apiPost('/mining/health-checks', { ...v, user_id: hc.user_id, person: hc.person, done_on: v.done_on.format('YYYY-MM-DD') }); setHc(null); load(); } catch (e) { message.error(err(e)); }
  };
  const agent = Form.useWatch('agent', form);
  const a = (d?.agents || []).find((x) => x.id === agent);
  const R = { over: ['red', 'over limit'], action: ['orange', 'action level'], below: ['green', 'below'] };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Text>Personal dust, silica and diesel samples turned into 8-hour averages against the published limits.</Text>
        {d?.can_manage && <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.setFieldsValue({ agent: 'rcs', duration_min: 480, shift_h: 8 }); setAdding(true); }}>Sample result</Button>}
      </Space>
      {(d?.segs || []).length > 0 && (
        <Card size="small" title="By exposure group" style={{ borderRadius: 12, marginBottom: 12 }}>
          <List size="small" dataSource={d.segs} renderItem={(s) => (
            <List.Item key={`${s.seg}${s.agent}`}><div style={{ minWidth: 0 }}><Tag color={LVL[s.level]}>{s.level === 'unknown' ? 'more samples' : s.level}</Tag><Text strong>{s.seg}</Text> <Text type="secondary">{s.agent_name} · {s.n} sample(s){s.p95 != null ? ` · GM ${s.gm} · GSD ${s.gsd} · P95 ${s.p95} · ${s.exceedance_pct}% above` : ''}</Text>
              <div style={{ fontSize: 13 }}>{s.verdict}</div></div></List.Item>
          )} />
        </Card>
      )}
      {d?.can_manage && (d?.workers || []).length > 0 && (
        <Card size="small" title="Workers: health checks" style={{ borderRadius: 12, marginBottom: 12 }}>
          <List size="small" dataSource={d.workers} renderItem={(w) => (
            <List.Item key={`${w.user_id}${w.person}`} actions={[<Button key="h" size="small" onClick={() => { hform.resetFields(); hform.setFieldsValue({ outcome: 'fit', done_on: dayjs() }); setHc(w); }}>Record check</Button>]}>
              <div style={{ minWidth: 0 }}>{w.needs_check && <Tag color="red">health check needed</Tag>}{w.restricted && <Tag color="orange">restricted / referred</Tag>}<Text strong>{w.person}</Text>
                <div style={{ fontSize: 12 }}>Highest {w.max_ratio}% of the limit{w.worst ? ` (${w.worst.agent} ${w.worst.twa8} on ${w.worst.on})` : ''} · last check {w.last_check ? `${w.last_check.on} (${w.last_check.outcome}), next ${w.last_check.next_due}` : 'none'}</div></div>
            </List.Item>
          )} />
        </Card>
      )}
      <Table rowKey="id" size="small" loading={!d} dataSource={d?.samples || []} scroll={{ x: 820 }} pagination={{ pageSize: 15, showSizeChanger: false }} locale={{ emptyText: <Empty description="No samples yet" /> }}
        columns={[
          { title: 'Date', dataIndex: 'sampled_on' }, { title: 'Worker', render: (_, r) => <div>{r.person}<div><Text type="secondary" style={{ fontSize: 12 }}>{r.seg}</Text></div></div> },
          { title: 'Agent', dataIndex: 'agent_name' }, { title: '8-h TWA', render: (_, r) => `${r.twa8} mg/m3` }, { title: 'Limit', render: (_, r) => `${r.limit}${r.adjusted_limit ? ` (${r.adjusted_limit} for ${r.shift_h} h)` : ''}` },
          { title: 'Result', render: (_, r) => <Tag color={R[r.result][0]}>{R[r.result][1]}</Tag> },
        ]} />
      <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>TWA = concentration x minutes sampled / 480. Group decision: lognormal 95th percentile below the limit (AIHA approach, at least 6 samples). Health checks every {d?.health_every_years || 3} years (OSHA silica rule) unless your law says otherwise. Only supervisors see other workers' results.</Paragraph>
      <Modal open={adding} title="Personal sample result" onCancel={() => setAdding(false)} onOk={save} okText="Save" width={Math.min(640, window.innerWidth - 24)}>
        <Form form={form} layout="vertical">
          <Row gutter={8}>
            <Col xs={24} md={12}><Form.Item name="person" label="Worker" rules={[{ required: true, min: 2 }]}><Input maxLength={120} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="seg" label="Exposure group" rules={[{ required: true, min: 2 }]}><Input maxLength={120} placeholder="Jumbo operators" /></Form.Item></Col>
            <Col xs={24}><Form.Item name="agent" label="Sampled for" extra={a ? a.source : null}><Select options={(d?.agents || []).map((x) => ({ value: x.id, label: x.name }))} /></Form.Item></Col>
            <Col xs={12} md={8}><Form.Item name="conc" label="Result mg/m3" rules={[{ required: true }]}><InputNumber min={0} step={0.001} style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={8}><Form.Item name="duration_min" label="Minutes sampled" rules={[{ required: true }]}><InputNumber min={1} max={1440} style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={8}><Form.Item name="shift_h" label="Shift length (h)"><InputNumber min={1} max={24} style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={8}><Form.Item name="sampled_on" label="Date"><DatePicker style={{ width: '100%' }} disabledDate={(x) => x && x > dayjs()} /></Form.Item></Col>
            <Col xs={12} md={8}><Form.Item name="limit" label="Your country limit" extra={a ? `blank = ${a.limit}` : null}><InputNumber min={0} step={0.001} style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={8}><Form.Item name="respirator" label="Respirator worn"><Input maxLength={60} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="task" label="Task"><Input maxLength={200} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="lab_ref" label="Lab reference"><Input maxLength={80} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
      <Modal open={!!hc} title={hc ? `Health check: ${hc.person}` : ''} onCancel={() => setHc(null)} onOk={saveHc} okText="Save">
        <Form form={hform} layout="vertical">
          <Form.Item name="done_on" label="Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} disabledDate={(x) => x && x > dayjs()} /></Form.Item>
          <Form.Item name="outcome" label="Outcome"><Radio.Group><Radio value="fit">Fit</Radio><Radio value="restricted">Restricted</Radio><Radio value="refer">Referred</Radio></Radio.Group></Form.Item>
          <Form.Item name="note" label="Note (no medical details)"><Input maxLength={500} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

// ------------------------------------------------------------------ fleet pre-start
export const Fleet = () => {
  const history = useHistory();
  const [d, setD] = useState(null);
  const load = useCallback(() => apiGet('/mining/fleet').then(setD).catch((e) => { setD({ data: [], counts: {}, repeat: [] }); message.error(err(e)); }), []);
  useEffect(() => { load(); }, [load]);
  const prestart = async (m) => {
    try { const r = await apiPost(`/equipment/${m.id}/inspect`, m.checklist_ref === 'lib:mobile_plant' ? { ref: 'lib:mobile_plant' } : {}); history.push(`/inspections?open=${r.data.id}`); } catch (e) { message.error(err(e)); }
  };
  const B = { down: ['red', 'DO NOT USE'], not_checked: ['orange', 'no pre-start'], defect: ['gold', 'defects'], ready: ['green', 'ready'] };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col xs={6}><Statistic title="Ready" value={d?.counts?.ready ?? 0} valueStyle={{ color: '#389e0d' }} /></Col>
        <Col xs={6}><Statistic title="No pre-start" value={d?.counts?.not_checked ?? 0} valueStyle={{ color: d?.counts?.not_checked ? '#d46b08' : undefined }} /></Col>
        <Col xs={6}><Statistic title="Defects" value={d?.counts?.defect ?? 0} /></Col>
        <Col xs={6}><Statistic title="Down" value={d?.counts?.down ?? 0} valueStyle={{ color: d?.counts?.down ? '#cf1322' : undefined }} /></Col>
      </Row>
      {(d?.repeat || []).length > 0 && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message={`Repeat critical defects in 30 days: ${d.repeat.map((x) => `${x.tag_no} (${x.repeat_defects_30d}x)`).join(', ')}`} description="Find the root cause instead of repairing the same fault again." />}
      <Table rowKey="id" size="middle" loading={!d} dataSource={d?.data || []} scroll={{ x: 720 }} pagination={false}
        locale={{ emptyText: <Empty description="No mobile plant. Add vehicles in Inspections > Equipment." /> }}
        columns={[
          { title: 'Machine', render: (_, r) => <div><Text strong>{r.tag_no}</Text> {r.name}<div><Text type="secondary" style={{ fontSize: 12 }}>{r.location || ''}</Text></div></div> },
          { title: 'This shift', render: (_, r) => <div><Tag color={B[r.board][0]}>{B[r.board][1]}</Tag><div style={{ fontSize: 12 }}>{r.text}</div></div> },
          { title: 'Last pre-start', render: (_, r) => dt(r.last_prestart) },
          { title: '', render: (_, r) => <Button size="small" type="primary" onClick={() => prestart(r)}>Pre-start</Button> },
        ]} />
      <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>Pre-starts run as equipment inspections: a failed critical item takes the machine out of service automatically. Machines without their own checklist use the mining mobile plant pre-start. "This shift" means the last {d?.shift_hours || 12} hours.</Paragraph>
    </Card>
  );
};

// ------------------------------------------------------------------ slope / tailings monitoring
const Spark = ({ series, color }) => {
  if (!series || series.length < 2) return null;
  const xs = series.map((p) => dayjs(p.at).valueOf()); const ys = series.map((p) => p.value);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const W = 260, H = 60;
  const pts = series.map((p, i) => `${((xs[i] - x0) / (x1 - x0 || 1)) * W},${H - ((ys[i] - y0) / (y1 - y0 || 1)) * H}`).join(' ');
  return <svg viewBox={`-2 -2 ${W + 4} ${H + 4}`} style={{ width: '100%', maxWidth: 260, height: 64 }} role="img" aria-label="Readings over time"><polyline fill="none" stroke={color} strokeWidth="2" points={pts} /></svg>;
};

export const Monitoring = () => {
  const [d, setD] = useState(null);
  const [adding, setAdding] = useState(false);
  const [reading, setReading] = useState(null);
  const [val, setVal] = useState(null);
  const [rows, setRows] = useState('');
  const [form] = Form.useForm();
  const load = useCallback(() => apiGet('/mining/monitoring').then(setD).catch((e) => { setD({ data: [], kinds: [] }); message.error(err(e)); }), []);
  useEffect(() => { load(); }, [load]);
  const kind = Form.useWatch('kind', form);
  const measure = (d?.kinds || []).find((k) => k.id === kind)?.measure;
  const add = async () => { const v = await form.validateFields().catch(() => null); if (!v) return; try { await apiPost('/mining/monitoring', v); setAdding(false); form.resetFields(); load(); } catch (e) { message.error(err(e)); } };
  const record = async () => {
    try {
      const r = await apiPost(`/mining/monitoring/${reading.id}/readings`, rows.trim() ? { rows } : { value: val });
      const a = r.data.analysis; (a.level === 'red' ? message.error : a.level === 'amber' ? message.warning : message.success)(`${r.added} reading(s): ${a.level.toUpperCase()}${a.reasons.length ? ` · ${a.reasons[0]}` : ''}`);
      setReading(null); setVal(null); setRows(''); load();
    } catch (e) { message.error(err(e)); }
  };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Text>Prisms, extensometers, radar points and piezometers against your trigger levels. Accelerating movement gets an inverse-velocity estimate.</Text>
        {d?.can_manage && <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.setFieldsValue({ kind: 'prism', unit: 'mm' }); setAdding(true); }}>Monitoring point</Button>}
      </Space>
      {(d?.data || []).length === 0 && <Empty description="No monitoring points" />}
      <Row gutter={[12, 12]}>
        {(d?.data || []).map((p) => {
          const a = p.analysis;
          return (
            <Col xs={24} md={12} xl={8} key={p.id}>
              <Card size="small" style={{ borderRadius: 12, borderTop: `4px solid ${a.level === 'red' ? '#cf1322' : a.level === 'amber' ? '#d46b08' : '#389e0d'}` }}
                title={<span>{p.structure}: {p.name} <Tag color={LVL[a.level]}>{a.level.toUpperCase()}</Tag></span>} extra={<Button size="small" onClick={() => setReading(p)}>Reading</Button>}>
                <Text type="secondary" style={{ fontSize: 12 }}>{p.kind_name} · last {p.last ? `${p.last.value} ${p.unit} at ${dt(p.last.at)}` : 'none'}{a.velocity != null ? ` · ${a.velocity} ${p.unit}/day` : ''}</Text>
                <Spark series={p.series} color={a.level === 'red' ? '#cf1322' : a.level === 'amber' ? '#d46b08' : '#1677ff'} />
                {a.predicted_failure && <Alert type="error" showIcon style={{ margin: '6px 0' }} message={`Inverse-velocity estimate: ${dt(a.predicted_failure)}`} />}
                {a.reasons.map((r) => <div key={r} style={{ fontSize: 12 }}>{r}</div>)}
                <Text type="secondary" style={{ fontSize: 11 }}>Triggers: {p.amber_rate != null ? `amber ${p.amber_rate}, red ${p.red_rate} ${p.unit}/day` : `amber ${p.amber_level}, red ${p.red_level} ${p.unit}`}</Text>
              </Card>
            </Col>
          );
        })}
      </Row>
      <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>Trigger levels come from your ground control plan or dam design; nothing is assumed. The inverse-velocity method (Fukuzono 1985) extrapolates 1/velocity to zero: it supports the geotechnical engineer's judgement and is not a forecast.</Paragraph>
      <Modal open={adding} title="Monitoring point" onCancel={() => setAdding(false)} onOk={add} okText="Save">
        <Form form={form} layout="vertical">
          <Row gutter={8}>
            <Col span={12}><Form.Item name="name" label="Point" rules={[{ required: true }]}><Input maxLength={120} placeholder="P-12" /></Form.Item></Col>
            <Col span={12}><Form.Item name="kind" label="Instrument"><Select options={(d?.kinds || []).map((k) => ({ value: k.id, label: k.name }))} /></Form.Item></Col>
            <Col span={16}><Form.Item name="structure" label="Wall, slope or dam" rules={[{ required: true }]}><Input maxLength={160} placeholder="North wall" /></Form.Item></Col>
            <Col span={8}><Form.Item name="unit" label="Unit"><Input maxLength={10} /></Form.Item></Col>
            {measure === 'level' ? (<>
              <Col span={12}><Form.Item name="amber_level" label="Amber level" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="red_level" label="Red level" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </>) : (<>
              <Col span={12}><Form.Item name="amber_rate" label="Amber rate per day" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="red_rate" label="Red rate per day" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            </>)}
          </Row>
        </Form>
      </Modal>
      <Modal open={!!reading} title={reading ? `Reading: ${reading.structure} ${reading.name}` : ''} onCancel={() => setReading(null)} onOk={record} okText="Save">
        <InputNumber placeholder={`Value (${reading?.unit || ''})`} value={val} onChange={setVal} style={{ width: '100%', marginBottom: 8 }} disabled={!!rows.trim()} />
        <Input.TextArea placeholder={'Or paste from the survey / radar export:\n2026-11-27 06:00, 12.4\n2026-11-27 18:00, 13.1'} value={rows} onChange={(e) => setRows(e.target.value)} autoSize={{ minRows: 3, maxRows: 10 }} />
      </Modal>
    </Card>
  );
};
