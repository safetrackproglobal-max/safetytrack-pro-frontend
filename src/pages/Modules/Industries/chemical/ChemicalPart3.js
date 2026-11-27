// Chemical part 3 inside HSE > Chemical: new-chemical approval (automatic checks before purchase), exposure monitoring,
// major-hazard thresholds (Seveso III / OSHA PSM) and the spill response guide with spill reports.
// Data: /api/chem/requests, /api/chem/exposure, /api/chem/major-hazard, /api/chem/items/:id/spill-guide, /api/chem/spills.
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Button, Card, Checkbox, Col, DatePicker, Drawer, Empty, Form, Input, InputNumber, List, Modal, Progress, Radio, Row, Select, Space, Table, Tag, Typography, message,
} from 'antd';
import dayjs from 'dayjs';
import { MinusCircleOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { apiGet, apiPost, apiPut } from '../../../../services/api';
import chemicalService from '../../../../services/chemicalService';

const { Text, Paragraph } = Typography;
const err = (e) => e?.data?.error || e?.response?.data?.error || e?.message || 'Something went wrong';
const dt = (x) => (x ? dayjs(x).format('D MMM YYYY HH:mm') : '-');
const LV = { block: ['error', 'red', 'Must fix'], warn: ['warning', 'orange', 'Check'], ok: ['success', 'green', 'OK'] };
const LVL = { red: 'red', amber: 'orange', green: 'green', unknown: 'default' };

const Checks = ({ checks }) => (
  <div>{(checks || []).map((c, i) => <Alert key={i} type={LV[c.level][0]} showIcon style={{ marginBottom: 6 }} message={<span><Tag color={LV[c.level][1]}>{LV[c.level][2]}</Tag>{c.text}</span>} />)}</div>
);

// ------------------------------------------------------------------ new-chemical approval
export const Approval = ({ groups, onAdded }) => {
  const [d, setD] = useState(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(null);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState([]);
  const [sub, setSub] = useState(null);
  const [checks, setChecks] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [form] = Form.useForm();
  const load = useCallback(() => apiGet('/chem/requests').then(setD).catch((e) => { setD({ data: [] }); message.error(err(e)); }), []);
  useEffect(() => { load(); }, [load]);
  const search = async () => { if (q.trim().length < 2) return; try { setHits((await chemicalService.lookup(q.trim())).data || []); } catch (e) { message.error(err(e)); } };
  const pick = async (cid) => {
    try { const s = (await chemicalService.substance(cid)).data; setSub(s); setHits([]); form.setFieldsValue({ name: s.name, cas: s.cas || undefined, groups: s.suggested_groups }); } catch (e) { message.error(err(e)); }
  };
  const body = (v) => ({ ...v, substance_id: sub?.id || null, sds_date: v.sds_date ? v.sds_date.format('YYYY-MM-DD') : null });
  const runChecks = async () => {
    const v = await form.validateFields().catch(() => null); if (!v) return;
    setBusy(true);
    try { setChecks((await apiPost('/chem/requests', { ...body(v), preview: true })).checks); } catch (e) { message.error(err(e)); } finally { setBusy(false); }
  };
  const submit = async () => {
    const v = await form.validateFields().catch(() => null); if (!v) return;
    setBusy(true);
    try { await apiPost('/chem/requests', body(v)); message.success('Sent for approval'); setOpen(false); setChecks(null); setSub(null); form.resetFields(); load(); } catch (e) { message.error(err(e)); } finally { setBusy(false); }
  };
  const act = async (action) => {
    try {
      const r = await apiPut(`/chem/requests/${view.id}`, { action, note });
      setView(r.data); setNote(''); load();
      if (action === 'add') { message.success('Added to the chemical register'); onAdded && onAdded(); }
    } catch (e) { if (e?.data?.checks) setView({ ...view, checks: e.data.checks }); message.error(err(e)); }
  };
  const ST = { submitted: 'gold', approved: 'blue', rejected: 'red', added: 'green' };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Text>Before a new chemical is bought: storage compatibility, stock already on site, CMR substitution, toxicity controls, SDS date and major-hazard thresholds are checked.</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setSub(null); setChecks(null); setOpen(true); }}>Request a new chemical</Button>
      </Space>
      <Table rowKey="id" size="middle" loading={!d} dataSource={d?.data || []} scroll={{ x: 760 }} pagination={{ pageSize: 15, showSizeChanger: false }}
        onRow={(r) => ({ onClick: () => { setNote(''); setView(r); }, style: { cursor: 'pointer' } })} locale={{ emptyText: <Empty description="No requests yet" /> }}
        columns={[
          { title: 'Chemical', render: (_, r) => <div><Text strong>{r.name}</Text>{r.cas ? <Text type="secondary"> {r.cas}</Text> : null}<div><Text type="secondary" style={{ fontSize: 12 }}>{r.purpose}</Text></div></div> },
          { title: 'Store at', dataIndex: 'location' }, { title: 'By', dataIndex: 'requested_by' },
          { title: 'Checks', render: (_, r) => (r.blocked ? <Tag color="red">{r.checks.filter((c) => c.level === 'block').length} to fix</Tag> : <Tag color="green">no blockers</Tag>) },
          { title: 'Status', dataIndex: 'status', render: (s) => <Tag color={ST[s]}>{s}</Tag> },
        ]} />
      <Modal open={open} title="Request a new chemical" onCancel={() => setOpen(false)} width={Math.min(760, window.innerWidth - 24)}
        footer={[<Button key="c" onClick={runChecks} loading={busy}>Run the checks</Button>, <Button key="s" type="primary" onClick={submit} loading={busy}>Send for approval</Button>]}>
        <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
          <Input placeholder="Look up by name or CAS (PubChem: only this text is sent)" value={q} onChange={(e) => setQ(e.target.value)} onPressEnter={search} />
          <Button icon={<SearchOutlined />} onClick={search}>Look up</Button>
        </Space.Compact>
        {hits.length > 0 && <List size="small" bordered style={{ marginBottom: 8 }} dataSource={hits} renderItem={(h) => <List.Item key={h.cid} onClick={() => pick(h.cid)} style={{ cursor: 'pointer' }}>{h.name} <Text type="secondary">{h.formula}</Text></List.Item>} />}
        {sub && <Alert type="info" style={{ marginBottom: 8 }} message={`PubChem: ${sub.name}${sub.cas ? ` (${sub.cas})` : ''}`} description={(sub.ghs?.h || []).slice(0, 6).join(' · ') || 'No GHS hazard statements found'} />}
        <Form form={form} layout="vertical">
          <Row gutter={8}>
            <Col xs={24} md={12}><Form.Item name="name" label="Chemical" rules={[{ required: true, min: 2 }]}><Input maxLength={200} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="cas" label="CAS"><Input maxLength={40} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="supplier" label="Supplier"><Input maxLength={160} /></Form.Item></Col>
            <Col xs={24}><Form.Item name="purpose" label="What it is needed for" rules={[{ required: true, min: 5 }]}><Input maxLength={1000} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="location" label="Where it will be stored" rules={[{ required: true, min: 2 }]}><Input maxLength={160} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="quantity" label="Quantity"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="unit" label="Unit"><Select allowClear options={['L', 'mL', 'kg', 'g', 'm³', 'cylinders', 'drums'].map((u) => ({ value: u, label: u }))} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="groups" label="Reactivity group(s) (EPA chart)"><Select mode="multiple" allowClear options={(groups || []).map((g) => ({ value: g.id, label: `${g.id} ${g.name}` }))} optionFilterProp="label" /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="sds_date" label="Supplier SDS revision date"><DatePicker style={{ width: '100%' }} disabledDate={(x) => x && x > dayjs()} /></Form.Item></Col>
            <Col xs={24}><Form.Item name="alternative" label="Safer alternatives looked at"><Input.TextArea maxLength={1000} autoSize={{ minRows: 1 }} /></Form.Item></Col>
            <Col xs={24}><Form.Item name="controls" label="Controls (ventilation, enclosure, PPE)"><Input.TextArea maxLength={1000} autoSize={{ minRows: 1 }} /></Form.Item></Col>
          </Row>
        </Form>
        {checks && <Checks checks={checks} />}
      </Modal>
      <Drawer open={!!view} onClose={() => setView(null)} width={Math.min(620, window.innerWidth)} title={view ? `${view.name}: ${view.status}` : ''}>
        {view && (
          <>
            <Paragraph><Text strong>For:</Text> {view.purpose}<br /><Text strong>Store at:</Text> {view.location}{view.quantity != null ? ` · ${view.quantity} ${view.unit || ''}` : ''}<br />
              <Text strong>Requested by</Text> {view.requested_by} {dt(view.created_at)}{view.decided_by ? <><br /><Text strong>Decided by</Text> {view.decided_by} {dt(view.decided_at)}{view.decision_note ? `: ${view.decision_note}` : ''}</> : null}</Paragraph>
            {view.alternative && <Paragraph><Text strong>Alternatives:</Text> {view.alternative}</Paragraph>}
            {view.controls && <Paragraph><Text strong>Controls:</Text> {view.controls}</Paragraph>}
            <Checks checks={view.checks} />
            {view.status === 'submitted' && d?.can_manage && view.requested_by_id !== d?.me && (
              <>
                <Input.TextArea placeholder="Conditions / reason (needed to reject, or to approve with blocking issues)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} style={{ marginTop: 8 }} />
                <Space style={{ marginTop: 8 }}><Button type="primary" onClick={() => act('approve')}>Approve</Button><Button danger onClick={() => act('reject')}>Reject</Button></Space>
              </>
            )}
            {view.status === 'approved' && <Button type="primary" style={{ marginTop: 8 }} onClick={() => act('add')}>It has arrived: add to the register</Button>}
          </>
        )}
      </Drawer>
    </Card>
  );
};

// ------------------------------------------------------------------ exposure monitoring
export const ChemExposure = ({ register }) => {
  const [d, setD] = useState(null);
  const [open, setOpen] = useState(false);
  const [periods, setPeriods] = useState([{ conc: null, minutes: 480 }]);
  const [form] = Form.useForm();
  const load = useCallback(() => apiGet('/chem/exposure').then(setD).catch((e) => { setD({ samples: [], mixtures: [], segs: [], workers: [] }); message.error(err(e)); }), []);
  useEffect(() => { load(); }, [load]);
  const kind = Form.useWatch('kind', form);
  const twa = periods.reduce((s, p) => s + (Number(p.conc) || 0) * (Number(p.minutes) || 0), 0) / 480;
  const save = async () => {
    const v = await form.validateFields().catch(() => null); if (!v) return;
    try {
      const r = await apiPost('/chem/exposure', { ...v, periods: kind === 'stel' ? [periods[0]] : periods, sampled_on: v.sampled_on ? v.sampled_on.format('YYYY-MM-DD') : null });
      (r.warnings || []).forEach((w) => message.warning(w));
      const x = r.data; (x.result === 'over' ? message.error : x.result === 'action' ? message.warning : message.success)(`${x.kind.toUpperCase()} ${x.value} ${x.unit} = ${x.pct}% of the limit`);
      setOpen(false); load();
    } catch (e) { message.error(err(e)); }
  };
  const R = { over: ['red', 'over limit'], action: ['orange', '50% or more'], below: ['green', 'below'] };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Text>Air sampling results against the exposure limit from the SDS (section 8) or your country list.</Text>
        {d?.can_manage && <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ kind: 'twa', unit: 'ppm' }); setPeriods([{ conc: null, minutes: 480 }]); setOpen(true); }}>Result</Button>}
      </Space>
      {(d?.mixtures || []).filter((m) => m.over).map((m) => <Alert key={m.person + m.date} type="error" showIcon style={{ marginBottom: 8 }} message={`${m.person} on ${m.date}: mixture index ${m.index} (over 1)`} description={`${m.parts.join(' + ')}. The sum C/OEL applies when the substances act on the same organ (ACGIH mixture rule).`} />)}
      {(d?.segs || []).length > 0 && (
        <Card size="small" title="By exposure group" style={{ borderRadius: 12, marginBottom: 12 }}>
          <List size="small" dataSource={d.segs} renderItem={(s) => <List.Item key={s.seg + s.substance}><div><Tag color={LVL[s.level]}>{s.level === 'unknown' ? 'more samples' : s.level}</Tag><Text strong>{s.seg}</Text> <Text type="secondary">{s.substance} · {s.n} result(s){s.p95 != null ? ` · P95 ${s.p95} ${s.unit}` : ''}</Text><div style={{ fontSize: 13 }}>{s.verdict}</div></div></List.Item>} />
        </Card>
      )}
      {(d?.workers || []).length > 0 && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="Workers at 50% of a limit or more in the last 12 months (consider health surveillance)" description={d.workers.map((w) => `${w.person} (${w.worst_pct}%: ${w.substances.join(', ')})`).join('; ')} />}
      <Table rowKey="id" size="small" loading={!d} dataSource={d?.samples || []} scroll={{ x: 760 }} pagination={{ pageSize: 15, showSizeChanger: false }} locale={{ emptyText: <Empty description="No results yet" /> }}
        columns={[
          { title: 'Date', dataIndex: 'sampled_on' }, { title: 'Worker', render: (_, r) => <div>{r.person}<div><Text type="secondary" style={{ fontSize: 12 }}>{r.seg}</Text></div></div> },
          { title: 'Substance', dataIndex: 'substance' }, { title: 'Result', render: (_, r) => `${r.kind.toUpperCase()} ${r.value} ${r.unit}` },
          { title: 'Limit', render: (_, r) => `${r.limit} ${r.unit}` }, { title: '', render: (_, r) => <Tag color={R[r.result][0]}>{r.pct}% {R[r.result][1]}</Tag> },
        ]} />
      <Modal open={open} title="Exposure result" onCancel={() => setOpen(false)} onOk={save} okText="Save" width={Math.min(680, window.innerWidth - 24)}>
        <Form form={form} layout="vertical">
          <Row gutter={8}>
            <Col xs={24} md={12}><Form.Item name="person" label="Worker" rules={[{ required: true, min: 2 }]}><Input maxLength={120} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="seg" label="Exposure group" rules={[{ required: true, min: 2 }]}><Input maxLength={120} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="item_id" label="Chemical from the register"><Select allowClear showSearch optionFilterProp="label" options={(register || []).map((i) => ({ value: i.id, label: i.name }))} /></Form.Item></Col>
            <Col xs={24} md={12}><Form.Item name="substance" label="Or substance name"><Input maxLength={200} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="kind" label="Type"><Radio.Group><Radio value="twa">8-h TWA</Radio><Radio value="stel">STEL</Radio></Radio.Group></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="unit" label="Unit"><Select options={[{ value: 'ppm', label: 'ppm' }, { value: 'mg/m3', label: 'mg/m3' }]} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="limit" label={kind === 'stel' ? 'STEL limit' : 'TWA limit'} rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={12} md={6}><Form.Item name="sampled_on" label="Date"><DatePicker style={{ width: '100%' }} disabledDate={(x) => x && x > dayjs()} /></Form.Item></Col>
            <Col xs={24}><Form.Item name="limit_source" label="Limit source"><Input maxLength={200} placeholder="SDS section 8 / national list" /></Form.Item></Col>
          </Row>
        </Form>
        {(kind === 'stel' ? periods.slice(0, 1) : periods).map((p, n) => (
          <Row key={n} gutter={6} style={{ marginBottom: 6 }} align="middle">
            <Col span={10}><InputNumber placeholder="Concentration" min={0} value={p.conc} onChange={(v) => setPeriods(periods.map((x, i) => (i === n ? { ...x, conc: v } : x)))} style={{ width: '100%' }} /></Col>
            <Col span={10}><InputNumber placeholder="Minutes" min={1} value={kind === 'stel' ? 15 : p.minutes} disabled={kind === 'stel'} onChange={(v) => setPeriods(periods.map((x, i) => (i === n ? { ...x, minutes: v } : x)))} style={{ width: '100%' }} /></Col>
            <Col span={4}>{kind !== 'stel' && periods.length > 1 && <Button type="text" icon={<MinusCircleOutlined />} aria-label="Remove period" onClick={() => setPeriods(periods.filter((_, i) => i !== n))} />}</Col>
          </Row>
        ))}
        {kind !== 'stel' && <Space><Button size="small" icon={<PlusOutlined />} onClick={() => setPeriods([...periods, { conc: null, minutes: 60 }])}>Period</Button><Text type="secondary">TWA = {twa.toFixed(3)} (sum of concentration x minutes / 480)</Text></Space>}
      </Modal>
    </Card>
  );
};

// ------------------------------------------------------------------ major-hazard thresholds
const Sum = ({ label, s }) => (
  <Col xs={24} md={8}>
    <Card size="small" style={{ borderRadius: 12 }} title={label}>
      <div>Lower tier <Progress percent={Math.min(100, Math.round(s.lower * 100))} status={s.lower >= 1 ? 'exception' : 'normal'} format={() => `${Math.round(s.lower * 100)}%`} /></div>
      <div>Upper tier <Progress percent={Math.min(100, Math.round(s.upper * 100))} status={s.upper >= 1 ? 'exception' : 'normal'} format={() => `${Math.round(s.upper * 100)}%`} /></div>
      {s.parts.slice(0, 4).map((p) => <div key={p.name + p.cat} style={{ fontSize: 12 }}>{p.name} ({p.cat}) {p.tonnes} t</div>)}
    </Card>
  </Col>
);

export const MajorHazard = () => {
  const [d, setD] = useState(null);
  const [edit, setEdit] = useState(null);
  const [form] = Form.useForm();
  const load = useCallback(() => apiGet('/chem/major-hazard').then(setD).catch((e) => { setD(null); message.error(err(e)); }), []);
  useEffect(() => { load(); }, [load]);
  const open = (it) => {
    const s = it.classified ? it : { ...it, ...it.suggested };
    form.setFieldsValue({ seveso_cats: s.seveso_cats, seveso_named: s.seveso_named || undefined, psm_key: s.psm_key || undefined, conv_kg: it.conv_kg });
    setEdit(it);
  };
  const save = async () => {
    const v = form.getFieldsValue();
    try { const r = await apiPut(`/chem/major-hazard/${edit.id}`, v); if (r.problem) message.warning(r.problem); setEdit(null); load(); } catch (e) { message.error(err(e)); }
  };
  if (!d) return <Card loading style={{ borderRadius: 16 }} />;
  const m = d.data;
  const TIER = { none: ['green', 'Below the Seveso thresholds'], lower: ['orange', 'Seveso LOWER-tier establishment'], upper: ['red', 'Seveso UPPER-tier establishment'] };
  const unitNeed = edit && ['L', 'mL', 'm³', 'cylinders', 'drums'].includes(edit.unit);
  return (
    <Card style={{ borderRadius: 16 }}>
      <Alert type={m.tier === 'none' ? 'success' : m.tier === 'lower' ? 'warning' : 'error'} showIcon style={{ marginBottom: 12 }} message={<span><Tag color={TIER[m.tier][0]}>{TIER[m.tier][1]}</Tag> from {m.classified} classified chemical(s)</span>}
        description="Seveso III note 4: health, physical and environmental hazards are summed separately (sum q/Q). A single named substance at or above its own quantity also counts." />
      {m.single.map((s) => <Alert key={s.name + s.basis} type="error" style={{ marginBottom: 8 }} message={`${s.name}: ${s.tonnes} t on site, its qualifying quantity is ${s.lower} t (lower) / ${s.upper} t (upper)`} description={s.basis} />)}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Sum label="Health hazards" s={m.sums.health} /><Sum label="Physical hazards" s={m.sums.physical} /><Sum label="Environmental hazards" s={m.sums.environment} />
      </Row>
      {m.psm.length > 0 && (
        <Card size="small" title="OSHA process safety management (PSM) thresholds" style={{ borderRadius: 12, marginBottom: 12 }}>
          {m.psm.map((p) => <div key={p.key + (p.location || '')} style={{ marginBottom: 6 }}><Text strong>{p.name}</Text>{p.location ? ` at ${p.location}` : ''}: {p.lb} lb of {p.tq_lb} lb <Progress percent={Math.min(100, p.pct)} size="small" status={p.over ? 'exception' : 'normal'} format={() => `${p.pct}%`} /></div>)}
          <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>{d.psm_note} PSM applies per process; this is a site screen.</Paragraph>
        </Card>
      )}
      {m.problems.length > 0 && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="Cannot convert to tonnes" description={m.problems.map((p) => `${p.name}: ${p.problem}`).join(' ')} />}
      <Table rowKey="id" size="small" dataSource={d.items} scroll={{ x: 760 }} pagination={{ pageSize: 15, showSizeChanger: false }} locale={{ emptyText: <Empty description="No chemicals in the register" /> }}
        columns={[
          { title: 'Chemical', render: (_, r) => <div><Text strong>{r.name}</Text>{r.cas ? <Text type="secondary"> {r.cas}</Text> : null}<div><Text type="secondary" style={{ fontSize: 12 }}>{r.location || ''} · {r.quantity ?? '?'} {r.unit || ''}</Text></div></div> },
          { title: 'Classification', render: (_, r) => (r.classified ? <Space wrap size={2}>{r.seveso_cats.map((c) => <Tag key={c}>{c}</Tag>)}{r.seveso_named && <Tag color="purple">named</Tag>}{r.psm_key && <Tag color="blue">PSM</Tag>}</Space>
            : (r.suggested.seveso_cats.length || r.suggested.seveso_named || r.suggested.psm_key) ? <Text type="secondary">suggested: {[...r.suggested.seveso_cats, r.suggested.seveso_named && 'named', r.suggested.psm_key && 'PSM'].filter(Boolean).join(', ')}</Text> : <Text type="secondary">-</Text>) },
          { title: '', render: (_, r) => d.can_manage && <Button size="small" onClick={() => open(r)}>{r.classified ? 'Edit' : 'Classify'}</Button> },
        ]} />
      <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>Sources: {d.sources.join('; ')}. Suggestions come from the GHS hazard statements and CAS number; acute toxicity statements do not say Category 1 or 2, so confirm each one.</Paragraph>
      <Modal open={!!edit} title={edit ? `Classify ${edit.name}` : ''} onCancel={() => setEdit(null)} onOk={save} okText="Save" width={Math.min(640, window.innerWidth - 24)}
        footer={(_, { OkBtn, CancelBtn }) => <>{edit?.classified && <Button danger onClick={async () => { await apiPut(`/chem/major-hazard/${edit.id}`, { clear: true }); setEdit(null); load(); }}>Remove</Button>}<CancelBtn /><OkBtn /></>}>
        <Form form={form} layout="vertical">
          <Form.Item name="seveso_cats" label="Seveso III Part 1 categories"><Select mode="multiple" allowClear optionFilterProp="label" options={d.seveso_p1.map((c) => ({ value: c.id, label: `${c.id} ${c.name} (${c.lower}/${c.upper} t)` }))} /></Form.Item>
          <Form.Item name="seveso_named" label="Seveso III Part 2 named substance"><Select allowClear optionFilterProp="label" showSearch options={d.seveso_p2.map((c) => ({ value: c.id, label: `${c.name} (${c.lower}/${c.upper} t)` }))} /></Form.Item>
          <Form.Item name="psm_key" label="OSHA PSM Appendix A / flammable"><Select allowClear optionFilterProp="label" showSearch options={d.psm_list.map((c) => ({ value: c.id, label: `${c.name} (${c.tq_lb} lb)` }))} /></Form.Item>
          {unitNeed && <Form.Item name="conv_kg" label={['L', 'mL', 'm³'].includes(edit.unit) ? 'Density (kg per litre)' : `kg per ${edit.unit.slice(0, -1)}`} rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>}
        </Form>
      </Modal>
    </Card>
  );
};

// ------------------------------------------------------------------ spill response
export const Spill = ({ register }) => {
  const [itemId, setItemId] = useState(null);
  const [size, setSize] = useState('small');
  const [place, setPlace] = useState('indoor');
  const [g, setG] = useState(null);
  const [spills, setSpills] = useState(null);
  const [report, setReport] = useState(false);
  const [rep, setRep] = useState({ amount: '', description: '', injuries: false, reached_drain: false });
  const loadSpills = useCallback(() => apiGet('/chem/spills').then(setSpills).catch(() => setSpills({ data: [] })), []);
  useEffect(() => { loadSpills(); }, [loadSpills]);
  useEffect(() => { if (itemId) apiGet(`/chem/items/${itemId}/spill-guide?size=${size}&place=${place}`).then((r) => setG(r.data)).catch((e) => message.error(err(e))); else setG(null); }, [itemId, size, place]);
  const send = async () => {
    try { await apiPost('/chem/spills', { item_id: itemId, size, ...rep }); message.success('Spill reported: supervisors notified'); setReport(false); loadSpills(); } catch (e) { message.error(err(e)); }
  };
  const close = (s) => { const note = window.prompt('How was it cleaned up, and what will stop it happening again?', ''); if (note) apiPut(`/chem/spills/${s.id}`, { note }).then(loadSpills).catch((e) => message.error(err(e))); };
  const PH = { now: 'Right now', ppe: 'Protect yourself', contain: 'Contain', clean: 'Clean up', after: 'After' };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Row gutter={8} style={{ marginBottom: 12 }}>
        <Col xs={24} md={12}><Select showSearch allowClear placeholder="Which chemical spilled?" optionFilterProp="label" value={itemId} onChange={setItemId} style={{ width: '100%' }} options={(register || []).map((i) => ({ value: i.id, label: `${i.name}${i.location ? ` (${i.location})` : ''}` }))} /></Col>
        <Col xs={12} md={6}><Radio.Group value={size} onChange={(e) => setSize(e.target.value)} optionType="button" options={[{ value: 'small', label: 'Small' }, { value: 'large', label: 'Large' }]} /></Col>
        <Col xs={12} md={6}><Radio.Group value={place} onChange={(e) => setPlace(e.target.value)} optionType="button" options={[{ value: 'indoor', label: 'Indoors' }, { value: 'outdoor', label: 'Outdoors' }]} /></Col>
      </Row>
      {!g && <Empty description="Choose the chemical to get the response steps" />}
      {g && (
        <>
          <Space wrap style={{ marginBottom: 8 }}>{g.hazards.map((h) => <Tag key={h} color="red">{h}</Tag>)}{g.groups.map((x) => <Tag key={x}>{x}</Tag>)}</Space>
          {Object.keys(PH).map((ph) => {
            const st = g.steps.filter((s) => s.phase === ph);
            return st.length ? (
              <Card key={ph} size="small" title={PH[ph]} style={{ borderRadius: 12, marginBottom: 8 }}>
                <ol style={{ paddingLeft: 20, margin: 0 }}>{st.map((s) => <li key={s.text}>{s.text}{s.why ? <Text type="secondary" style={{ fontSize: 12 }}> ({s.why})</Text> : null}</li>)}</ol>
              </Card>
            ) : null;
          })}
          {g.sds_spill.map((s) => <Alert key={s.text.slice(0, 30)} type="info" style={{ marginBottom: 8 }} message={`From the safety data (${s.source})`} description={s.text} />)}
          {g.notes.map((n) => <Alert key={n} type="warning" message={n} style={{ marginBottom: 8 }} />)}
          <Button type="primary" danger onClick={() => setReport(true)}>Report this spill</Button>
        </>
      )}
      <Card size="small" title="Spill reports" style={{ borderRadius: 12, marginTop: 16 }}>
        <List size="small" dataSource={spills?.data || []} locale={{ emptyText: 'No spills reported' }} renderItem={(s) => (
          <List.Item key={s.id} actions={s.status === 'open' && spills.can_manage ? [<Button key="c" size="small" onClick={() => close(s)}>Close</Button>] : []}>
            <div><Tag color={s.status === 'open' ? 'red' : 'green'}>{s.status}</Tag><Text strong>{s.chemical}</Text> <Text type="secondary">{s.location || ''} · {s.size}{s.amount ? ` · ${s.amount}` : ''} · {dt(s.reported_at)} by {s.reported_by}</Text>
              {(s.injuries || s.reached_drain) && <div>{s.injuries && <Tag color="volcano">people hurt</Tag>}{s.reached_drain && <Tag color="orange">reached a drain</Tag>}</div>}
              {s.close_note && <div style={{ fontSize: 12 }}>{s.close_note}</div>}</div>
          </List.Item>
        )} />
      </Card>
      <Modal open={report} title="Report a chemical spill" onCancel={() => setReport(false)} onOk={send} okText="Report">
        <Input placeholder="How much (for example 2 L)" value={rep.amount} onChange={(e) => setRep({ ...rep, amount: e.target.value })} maxLength={60} style={{ marginBottom: 8 }} />
        <Input.TextArea placeholder="What happened" value={rep.description} onChange={(e) => setRep({ ...rep, description: e.target.value })} maxLength={1000} style={{ marginBottom: 8 }} />
        <Checkbox checked={rep.injuries} onChange={(e) => setRep({ ...rep, injuries: e.target.checked })}>Someone was hurt or exposed</Checkbox><br />
        <Checkbox checked={rep.reached_drain} onChange={(e) => setRep({ ...rep, reached_drain: e.target.checked })}>It reached a drain, soil or water</Checkbox>
      </Modal>
    </Card>
  );
};
