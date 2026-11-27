// Chemical safety: register identified from PubChem, GHS hazards, EPA compatibility and storage checks, peroxide and expiry
// tracking, supplier SDS, safety summary with first aid, and local + international rules. Data: /api/chem/* (company-scoped).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Alert, Button, Card, Checkbox, Col, Collapse, DatePicker, Descriptions, Drawer, Empty, Form, Input, InputNumber, List, Modal, Popconfirm,
  Row, Select, Skeleton, Space, Table, Tabs, Tag, Typography, Upload, message,
} from 'antd';
import dayjs from 'dayjs';
import {
  AlertOutlined, BookOutlined, DeleteOutlined, ExperimentOutlined, FilePdfOutlined, PlusOutlined, ReloadOutlined, SafetyOutlined,
  SearchOutlined, SwapOutlined, UploadOutlined,
} from '@ant-design/icons';
import chemicalService, { chemErr } from '../services/chemicalService';

const { Title, Text, Paragraph } = Typography;
const LEVEL = { critical: 'red', high: 'volcano', medium: 'orange' };
const PICTO = {
  GHS01: ['💥', 'Explosive'], GHS02: ['🔥', 'Flammable'], GHS03: ['⭕', 'Oxidiser'], GHS04: ['🧯', 'Gas under pressure'], GHS05: ['🧪', 'Corrosive'],
  GHS06: ['☠️', 'Acute toxicity'], GHS07: ['❗', 'Harmful / irritant'], GHS08: ['🫁', 'Serious health hazard'], GHS09: ['🐟', 'Environment'],
};
const SECTION_TITLES = [['first_aid', 'First aid'], ['fire', 'Fire fighting'], ['spill', 'Spills and leaks'], ['storage', 'Storage'],
  ['ppe', 'Protective equipment'], ['exposure', 'Exposure limits'], ['reactivity', 'Reactivity and incompatibilities']];
const day = (d) => (d ? d.format('YYYY-MM-DD') : null);

const Pictogram = ({ code }) => {
  const [icon, label] = PICTO[code] || ['⚠️', code];
  return (
    <div title={`${code} ${label}`} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: 70, marginRight: 6 }}>
      <div style={{ width: 40, height: 40, transform: 'rotate(45deg)', border: '3px solid #cf1322', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ transform: 'rotate(-45deg)', fontSize: 18 }} aria-hidden>{icon}</span>
      </div>
      <Text style={{ fontSize: 10, marginTop: 8, textAlign: 'center' }}>{code}<br />{label}</Text>
    </div>
  );
};

const GhsBlock = ({ ghs }) => {
  if (!ghs) return <Alert type="info" showIcon message="No GHS classification found in PubChem for this record. Use the supplier SDS." />;
  return (
    <div>
      <Space wrap align="start" style={{ marginBottom: 8 }}>
        {(ghs.pictograms || []).map((p) => <Pictogram key={p.code} code={p.code} />)}
        {ghs.signal && <Tag color={ghs.signal === 'Danger' ? 'red' : 'orange'} style={{ fontSize: 14, padding: '4px 10px' }}>{ghs.signal}</Tag>}
      </Space>
      <ul style={{ paddingLeft: 18, margin: 0 }}>{(ghs.h || []).slice(0, 15).map((h) => <li key={h}>{h}</li>)}</ul>
      {ghs.p?.length > 0 && <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 6 }}>Precautionary: {ghs.p.slice(0, 30).join(', ')}</Paragraph>}
      <Text type="secondary" style={{ fontSize: 12 }}>Source: {ghs.source} (via PubChem){ghs.other_sources ? `; ${ghs.other_sources} other classification(s) available` : ''}</Text>
    </div>
  );
};

const Sections = ({ sections }) => {
  const items = SECTION_TITLES.filter(([k]) => (sections?.[k] || []).length).map(([k, title]) => ({
    key: k, label: title,
    children: (sections[k] || []).slice(0, k === 'exposure' ? 6 : 2).map((s, i) => (
      <div key={i} style={{ marginBottom: 10 }}>
        <Paragraph style={{ marginBottom: 2, whiteSpace: 'pre-wrap' }}>{s.text}</Paragraph>
        <Text type="secondary" style={{ fontSize: 12 }}>Source: {s.source} ({s.heading})</Text>
      </div>
    )),
  }));
  if (!items.length) return <Empty description="No reference data for this chemical" />;
  return <Collapse items={items} defaultActiveKey={['first_aid']} />;
};

// ------------------------------------------------------------------ add / edit
const ItemForm = ({ form, groups, suggested }) => (
  <Form form={form} layout="vertical">
    <Row gutter={12}>
      <Col xs={24} md={12}><Form.Item name="name" label="Name" rules={[{ required: true, min: 2 }]}><Input maxLength={200} /></Form.Item></Col>
      <Col xs={24} md={12}><Form.Item name="cas" label="CAS number" rules={[{ pattern: /^\d{2,7}-\d{2}-\d$/, message: 'Like 67-64-1' }]}><Input maxLength={40} placeholder="e.g. 67-64-1" /></Form.Item></Col>
      <Col xs={24} md={12}><Form.Item name="location" label="Storage location"><Input maxLength={160} placeholder="e.g. Solvent store, cabinet 2" /></Form.Item></Col>
      <Col xs={12} md={6}><Form.Item name="quantity" label="Quantity"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
      <Col xs={12} md={6}><Form.Item name="unit" label="Unit"><Select allowClear options={['L', 'mL', 'kg', 'g', 'm³', 'cylinders', 'drums'].map((u) => ({ value: u, label: u }))} /></Form.Item></Col>
      <Col xs={12} md={6}><Form.Item name="containers" label="Containers"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
      <Col xs={24} md={18}><Form.Item name="supplier" label="Supplier"><Input maxLength={160} /></Form.Item></Col>
      <Col span={24}>
        <Form.Item name="groups" label="Reactivity groups (EPA compatibility chart)"
          extra={suggested?.length ? `Suggested from the chemical's data: ${suggested.map((g) => groups.find((x) => x.id === g)?.name || g).join('; ')}. Check them.` : 'Pick every group the chemical belongs to. The storage and mixing checks use them.'}>
          <Select mode="multiple" optionFilterProp="label" options={groups.map((g) => ({ value: g.id, label: `${g.id}. ${g.name}` }))} />
        </Form.Item>
        <Form.Item name="groups_confirmed" valuePropName="checked"><Checkbox>I have checked these groups</Checkbox></Form.Item>
      </Col>
      <Col xs={24} md={6}><Form.Item name="peroxide_class" label="Peroxide former"><Select allowClear placeholder="No" options={[{ value: 'A', label: 'Class A (test every 3 months)' }, { value: 'B', label: 'Class B (every 6 months)' }, { value: 'C', label: 'Class C (every 6 months)' }]} /></Form.Item></Col>
      <Col xs={8} md={6}><Form.Item name="received_on" label="Received"><DatePicker style={{ width: '100%' }} disabledDate={(d) => d && d > dayjs()} /></Form.Item></Col>
      <Col xs={8} md={6}><Form.Item name="opened_on" label="Opened"><DatePicker style={{ width: '100%' }} disabledDate={(d) => d && d > dayjs()} /></Form.Item></Col>
      <Col xs={8} md={6}><Form.Item name="expires_on" label="Expires"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
      <Col span={24}><Form.Item name="notes" label="Notes"><Input.TextArea maxLength={4000} autoSize={{ minRows: 2, maxRows: 5 }} /></Form.Item></Col>
    </Row>
  </Form>
);

const toPayload = (v) => ({ ...v, received_on: day(v.received_on), opened_on: day(v.opened_on), expires_on: day(v.expires_on), peroxide_class: v.peroxide_class || null, groups: v.groups || [] });
const toForm = (it) => ({ ...it, received_on: it.received_on ? dayjs(it.received_on) : null, opened_on: it.opened_on ? dayjs(it.opened_on) : null, expires_on: it.expires_on ? dayjs(it.expires_on) : null });

const AddDrawer = ({ open, groups, onClose, onSaved }) => {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sub, setSub] = useState(null);
  const [manual, setManual] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => { if (open) { setQ(''); setHits(null); setSub(null); setManual(false); form.resetFields(); } }, [open, form]);
  const search = async () => {
    if (q.trim().length < 2) return;
    setBusy(true);
    try { setHits((await chemicalService.lookup(q.trim())).data || []); } catch (e) { message.error(chemErr(e)); } finally { setBusy(false); }
  };
  const pick = async (cid) => {
    setBusy(true);
    try {
      const s = (await chemicalService.substance(cid)).data;
      setSub(s);
      form.setFieldsValue({ name: s.name, cas: s.cas || undefined, groups: s.suggested_groups, groups_confirmed: false, peroxide_class: s.peroxide_class || undefined });
    } catch (e) { message.error(chemErr(e)); } finally { setBusy(false); }
  };
  const save = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try { await chemicalService.save({ ...toPayload(v), substance_id: sub?.id || null }); message.success('Chemical added'); onSaved(); } catch (e) { message.error(chemErr(e)); } finally { setBusy(false); }
  };
  return (
    <Drawer open={open} onClose={onClose} width={Math.min(820, typeof window !== 'undefined' ? window.innerWidth : 820)} title="Add a chemical"
      extra={(sub || manual) && <Button type="primary" loading={busy} onClick={save}>Save</Button>}>
      {!sub && !manual && (
        <>
          <Paragraph>Search by name or CAS number. Hazards, first aid and reactivity come from PubChem (US National Library of Medicine). Only the name or CAS number is sent.</Paragraph>
          <Space.Compact style={{ width: '100%', maxWidth: 520 }}>
            <Input size="large" value={q} maxLength={120} onChange={(e) => setQ(e.target.value)} onPressEnter={search} placeholder="e.g. acetone or 67-64-1" />
            <Button size="large" type="primary" icon={<SearchOutlined />} loading={busy} onClick={search}>Search</Button>
          </Space.Compact>
          {hits && (
            <List style={{ marginTop: 12 }} bordered locale={{ emptyText: 'Nothing found. Check the spelling, try the CAS number, or add it by hand.' }}
              dataSource={hits} renderItem={(h) => (
                <List.Item actions={[<Button key="u" onClick={() => pick(h.cid)} loading={busy}>Use</Button>]}>
                  <List.Item.Meta title={h.name} description={`${h.formula || ''}${h.cas ? ` · CAS ${h.cas}` : ''} · PubChem ${h.cid}`} />
                </List.Item>
              )} />
          )}
          <Button type="link" style={{ marginTop: 8, padding: 0 }} onClick={() => { setManual(true); form.setFieldsValue({ name: q, groups_confirmed: true }); }}>Add by hand instead (mixtures, trade products)</Button>
        </>
      )}
      {sub && (
        <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }} title={`${sub.name}${sub.formula ? ` · ${sub.formula}` : ''}`}
          extra={<Button size="small" onClick={() => { setSub(null); form.resetFields(); }}>Change</Button>}>
          <GhsBlock ghs={sub.ghs} />
          {sub.peroxide_class && <Alert style={{ marginTop: 8 }} type="warning" showIcon message={`Listed as a class ${sub.peroxide_class} peroxide former: date it when received and when opened, and test it.`} />}
        </Card>
      )}
      {(sub || manual) && <ItemForm form={form} groups={groups} suggested={sub?.suggested_groups} />}
    </Drawer>
  );
};

// ------------------------------------------------------------------ one chemical
const ItemDrawer = ({ item, groups, canManage, onClose, onChanged }) => {
  const [sub, setSub] = useState(null);
  const [tests, setTests] = useState([]);
  const [edit, setEdit] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();
  const [tform] = Form.useForm();
  const loadTests = useCallback(() => { chemicalService.tests(item.id).then((r) => setTests(r.data || [])).catch(() => setTests([])); }, [item.id]);
  useEffect(() => {
    setSub(null);
    if (item.cid) chemicalService.substance(item.cid).then((r) => setSub(r.data)).catch(() => setSub({ error: true }));
    loadTests();
  }, [item.cid, loadTests]);
  const save = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try { await chemicalService.save(toPayload(v), item.id); message.success('Saved'); setEdit(false); onChanged(); } catch (e) { message.error(chemErr(e)); } finally { setBusy(false); }
  };
  const addTest = async () => {
    const v = await tform.validateFields();
    try {
      await chemicalService.addTest(item.id, { ...v, tested_on: day(v.tested_on) });
      message.success('Test recorded'); setTestOpen(false); tform.resetFields(); loadTests(); onChanged();
    } catch (e) { message.error(chemErr(e)); }
  };
  return (
    <Drawer open onClose={onClose} width={Math.min(860, typeof window !== 'undefined' ? window.innerWidth : 860)} title={item.name}
      extra={(
        <Space wrap>
          <Button icon={<FilePdfOutlined />} onClick={() => chemicalService.summaryPdf(item.id, item.name).catch((e) => message.error(chemErr(e)))}>Safety summary</Button>
          {canManage && !edit && <Button onClick={() => { form.setFieldsValue(toForm(item)); setEdit(true); }}>Edit</Button>}
          {edit && <Button type="primary" loading={busy} onClick={save}>Save</Button>}
        </Space>
      )}>
      {edit ? <ItemForm form={form} groups={groups} /> : (
        <>
          {item.issues.map((i) => <Alert key={i.kind} type={i.level === 'medium' ? 'warning' : 'error'} showIcon message={i.text} style={{ marginBottom: 8 }} />)}
          <Descriptions size="small" bordered column={{ xs: 1, md: 2 }} style={{ marginBottom: 12 }}>
            <Descriptions.Item label="CAS">{item.cas || '-'}</Descriptions.Item>
            <Descriptions.Item label="Location">{item.location || '-'}</Descriptions.Item>
            <Descriptions.Item label="Quantity">{item.quantity !== null && item.quantity !== undefined ? `${item.quantity} ${item.unit || ''}` : '-'}{item.containers ? ` (${item.containers} containers)` : ''}</Descriptions.Item>
            <Descriptions.Item label="Supplier">{item.supplier || '-'}</Descriptions.Item>
            <Descriptions.Item label="Received / opened">{item.received_on || '-'} / {item.opened_on || 'unopened'}</Descriptions.Item>
            <Descriptions.Item label="Expires">{item.expires_on || '-'}</Descriptions.Item>
            <Descriptions.Item label="Reactivity groups" span={2}>
              {item.groups.length ? item.group_names.map((g) => <Tag key={g} style={{ whiteSpace: 'normal', height: 'auto', marginBottom: 4 }}>{g}</Tag>) : <Text type="warning">Not set: the storage and mixing checks cannot include it</Text>}
              {item.groups.length > 0 && !item.groups_confirmed && <Tag color="gold">suggested, not confirmed</Tag>}
            </Descriptions.Item>
            {item.notes && <Descriptions.Item label="Notes" span={2}>{item.notes}</Descriptions.Item>}
          </Descriptions>
          <Card size="small" title="Supplier safety data sheet (SDS)" style={{ borderRadius: 12, marginBottom: 12 }}>
            <Space wrap>
              {item.has_sds ? <Button onClick={() => chemicalService.openSds(item.id).catch((e) => message.error(chemErr(e)))}>Open SDS</Button> : <Text type="warning">No supplier SDS uploaded. Ask the supplier for it: the law requires it.</Text>}
              {canManage && (
                <Upload accept="application/pdf" showUploadList={false} beforeUpload={(f) => {
                  if (f.size > 20 * 1024 * 1024) { message.error('The file is larger than 20 MB.'); return false; }
                  chemicalService.uploadSds(item.id, f).then(() => { message.success('SDS uploaded'); onChanged(); }).catch((e) => message.error(chemErr(e)));
                  return false;
                }}><Button icon={<UploadOutlined />}>{item.has_sds ? 'Replace SDS' : 'Upload SDS (PDF)'}</Button></Upload>
              )}
            </Space>
          </Card>
          {item.peroxide_class && (
            <Card size="small" title={`Peroxide tests (class ${item.peroxide_class})`} style={{ borderRadius: 12, marginBottom: 12 }}
              extra={canManage && <Button size="small" type="primary" onClick={() => { tform.setFieldsValue({ tested_on: dayjs(), kind: 'peroxide' }); setTestOpen(true); }}>Record test</Button>}>
              <Paragraph type="secondary" style={{ fontSize: 12 }}>Opened containers: class A every 3 months, B and C every 6 months; unopened: 12 months after receipt or at expiry. Dispose of before 25 ppm. (University of Iowa EHS guidance.)</Paragraph>
              {tests.length === 0 ? <Text type="secondary">No tests recorded</Text> : tests.map((t) => (
                <div key={t.id}>{t.tested_on}: <b style={{ color: t.result_ppm >= 25 ? '#cf1322' : undefined }}>{t.result_ppm !== null ? `${t.result_ppm} ppm` : ''}</b> {t.result || ''} <Text type="secondary">({t.tested_by || ''})</Text></div>
              ))}
            </Card>
          )}
          {item.cid ? (
            <>
              <Title level={5}>Hazards (GHS)</Title>
              {!sub ? <Skeleton active /> : sub.error ? <Alert type="warning" message="The chemical database could not be reached. Try again later." /> : <GhsBlock ghs={sub.ghs} />}
              <Title level={5} style={{ marginTop: 16 }}>First aid, fire, spills, storage, PPE</Title>
              {sub && !sub.error && <Sections sections={sub.sections} />}
              {sub?.pubchem_url && <Paragraph style={{ marginTop: 8 }}><a href={sub.pubchem_url} target="_blank" rel="noopener noreferrer">Open the full PubChem record</a></Paragraph>}
            </>
          ) : <Alert type="info" showIcon message="Added by hand: no reference data linked. Use the supplier SDS." />}
          {canManage && (
            <Space style={{ marginTop: 16 }} wrap>
              {item.status === 'in_use'
                ? <Popconfirm title="Mark as disposed / used up?" onConfirm={() => chemicalService.save({ status: 'disposed' }, item.id).then(onChanged).catch((e) => message.error(chemErr(e)))}><Button>Mark disposed</Button></Popconfirm>
                : <Button onClick={() => chemicalService.save({ status: 'in_use' }, item.id).then(onChanged).catch((e) => message.error(chemErr(e)))}>Back in use</Button>}
              <Popconfirm title="Delete this chemical and its SDS?" onConfirm={() => chemicalService.remove(item.id).then(() => { onClose(); onChanged(); }).catch((e) => message.error(chemErr(e)))}>
                <Button danger icon={<DeleteOutlined />}>Delete</Button>
              </Popconfirm>
            </Space>
          )}
        </>
      )}
      <Modal open={testOpen} title="Record a test" onCancel={() => setTestOpen(false)} onOk={addTest} okText="Save">
        <Form form={tform} layout="vertical">
          <Form.Item name="kind" label="Test"><Select options={[{ value: 'peroxide', label: 'Peroxide test strip' }, { value: 'visual', label: 'Visual check' }, { value: 'other', label: 'Other' }]} /></Form.Item>
          <Form.Item name="tested_on" label="Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} disabledDate={(d) => d && d > dayjs()} /></Form.Item>
          <Form.Item name="result_ppm" label="Peroxide reading (ppm)"><InputNumber min={0} max={100000} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="result" label="Notes"><Input maxLength={300} placeholder="e.g. no crystals, clear liquid" /></Form.Item>
          <Text type="secondary">Do not open a container with crystals around the cap or in the liquid: call for specialist disposal.</Text>
        </Form>
      </Modal>
    </Drawer>
  );
};

// ------------------------------------------------------------------ tabs
const Register = ({ data, groups, onReload, onOpen }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [q, setQ] = useState('');
  const [showDisposed, setShowDisposed] = useState(false);
  const rows = (data?.items || []).filter((r) => (showDisposed || r.status === 'in_use') && (!q || `${r.name} ${r.cas || ''} ${r.location || ''}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Space wrap>
          <Input.Search allowClear placeholder="Search name, CAS, location" style={{ width: 240 }} onSearch={setQ} onChange={(e) => !e.target.value && setQ('')} />
          <Checkbox checked={showDisposed} onChange={(e) => setShowDisposed(e.target.checked)}>Show disposed</Checkbox>
          <Button icon={<ReloadOutlined />} onClick={onReload} aria-label="Reload" />
        </Space>
        {data?.can_manage && <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>Add chemical</Button>}
      </Space>
      <Table rowKey="id" size="middle" loading={!data} dataSource={rows} scroll={{ x: 900 }} pagination={{ pageSize: 25, showSizeChanger: false }}
        onRow={(r) => ({ onClick: () => onOpen(r), style: { cursor: 'pointer' } })}
        locale={{ emptyText: <Empty description={data?.can_manage ? 'No chemicals yet. Add the first one.' : 'No chemicals in the register yet.'} /> }}
        columns={[
          { title: 'Chemical', dataIndex: 'name', render: (v, r) => <div><Text strong>{v}</Text>{r.status !== 'in_use' && <Tag style={{ marginLeft: 6 }}>disposed</Tag>}<div><Text type="secondary">{r.cas ? `CAS ${r.cas}` : 'no CAS'}</Text></div></div> },
          { title: 'Location', dataIndex: 'location', width: 170, render: (v) => v || <Text type="secondary">-</Text> },
          { title: 'Quantity', width: 110, render: (_, r) => (r.quantity !== null && r.quantity !== undefined ? `${r.quantity} ${r.unit || ''}` : '-') },
          { title: 'Groups', dataIndex: 'groups', width: 160, render: (g, r) => (g.length ? <span>{g.join(', ')} {!r.groups_confirmed && <Tag color="gold">check</Tag>}</span> : <Tag color="orange">not set</Tag>) },
          { title: 'SDS', dataIndex: 'has_sds', width: 70, render: (v) => (v ? <Tag color="green">yes</Tag> : <Tag color="red">no</Tag>) },
          { title: 'Attention', dataIndex: 'issues', width: 220, render: (iss) => (iss.length ? iss.map((i) => <Tag key={i.kind} color={LEVEL[i.level]} style={{ marginBottom: 2 }}>{i.text.split('.')[0]}</Tag>) : <Text type="secondary">-</Text>) },
        ]} />
      <AddDrawer open={addOpen} groups={groups} onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); onReload(); }} />
    </Card>
  );
};

const Compatibility = ({ data, groups }) => {
  const [items, setItems] = useState([]);
  const [gsel, setGsel] = useState([]);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { setRes((await chemicalService.compatibility({ items, groups: gsel })).data); } catch (e) { message.error(chemErr(e)); } finally { setBusy(false); }
  };
  const color = (s) => (s >= 3 ? '#fff1f0' : s >= 1 ? '#fff7e6' : '#f6ffed');
  return (
    <Card style={{ borderRadius: 16 }}>
      <Paragraph>Choose chemicals from your register (and/or reactivity groups) to see what can happen if they mix: in storage, in a spill, or in a waste container.</Paragraph>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={14}><Select mode="multiple" style={{ width: '100%' }} placeholder="Chemicals from the register" optionFilterProp="label" value={items} onChange={setItems}
          options={(data?.items || []).filter((r) => r.status === 'in_use').map((r) => ({ value: r.id, label: `${r.name}${r.location ? ` (${r.location})` : ''}` }))} /></Col>
        <Col xs={24} md={10}><Select mode="multiple" style={{ width: '100%' }} placeholder="or groups (e.g. a waste stream)" optionFilterProp="label" value={gsel} onChange={setGsel}
          options={groups.map((g) => ({ value: g.id, label: `${g.id}. ${g.name}` }))} /></Col>
      </Row>
      <Button type="primary" icon={<SwapOutlined />} style={{ marginTop: 12 }} loading={busy} disabled={items.length + gsel.length < 2} onClick={run}>Check</Button>
      {res && (
        <div style={{ marginTop: 16 }}>
          {res.missing_groups.length > 0 && <Alert type="warning" showIcon style={{ marginBottom: 8 }} message={`No reactivity group set for: ${res.missing_groups.join(', ')}. Set it in the register to include it.`} />}
          {res.pairs.map((p, i) => (
            <Card key={i} size="small" style={{ marginBottom: 8, borderRadius: 12, background: color(p.severity) }}>
              <Text strong>{p.a} + {p.b}</Text> <Tag color={p.severity >= 3 ? 'red' : p.severity >= 1 ? 'orange' : 'green'}>{p.verdict}</Tag>
              {p.unconfirmed && <Tag color="gold">groups not confirmed</Tag>}
              {p.reactions.map((r, j) => <div key={j} style={{ fontSize: 13 }}>{r.a_group_name} × {r.b_group_name}: <b>{r.meaning}</b></div>)}
            </Card>
          ))}
          <Paragraph type="secondary" style={{ fontSize: 12 }}>{res.caution}</Paragraph>
        </div>
      )}
    </Card>
  );
};

const Alerts = ({ onOpenId, refreshKey }) => {
  const [a, setA] = useState(null);
  useEffect(() => { setA(null); chemicalService.alerts().then((r) => setA(r.data)).catch((e) => { setA({ items: [], storage_conflicts: [], without_groups: [] }); message.error(chemErr(e)); }); }, [refreshKey]);
  if (!a) return <Skeleton active />;
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title={<span><AlertOutlined /> Containers needing action</span>} style={{ borderRadius: 16 }}>
          {a.items.length === 0 ? <Empty description="Nothing expired, expiring or due for a test" /> : a.items.map((i, n) => (
            <div key={n} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }} onClick={() => onOpenId(i.item_id)}>
              <Tag color={LEVEL[i.level]}>{i.level}</Tag><Text strong>{i.name}</Text>{i.location && <Text type="secondary"> · {i.location}</Text>}
              <div style={{ fontSize: 13 }}>{i.text}</div>
            </div>
          ))}
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title={<span><ExperimentOutlined /> Stored together but should not be</span>} style={{ borderRadius: 16 }}>
          {a.storage_conflicts.length === 0 ? <Empty description="No incompatible chemicals found in the same location" /> : a.storage_conflicts.map((c, n) => (
            <div key={n} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              <Tag color={c.severity >= 3 ? 'red' : 'orange'}>{c.location}</Tag><Text strong>{c.a.name} + {c.b.name}</Text>
              <div style={{ fontSize: 13 }}>{[...new Set(c.reactions.map((r) => r.meaning))].join('; ')}</div>
            </div>
          ))}
          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>The check matches location names exactly (ignoring capitals and spaces). Use the same name for the same store.</Paragraph>
        </Card>
      </Col>
      <Col span={24}>
        <Space wrap>
          {a.without_groups.length > 0 && <Alert type="warning" showIcon message={`${a.without_groups.length} chemical(s) have no reactivity group, so the checks cannot include them.`} />}
          {a.unconfirmed_groups > 0 && <Alert type="info" showIcon message={`${a.unconfirmed_groups} chemical(s) have suggested groups that nobody has confirmed yet.`} />}
          {a.without_sds > 0 && <Alert type="warning" showIcon message={`${a.without_sds} chemical(s) have no supplier SDS uploaded.`} />}
        </Space>
      </Col>
    </Row>
  );
};

const Rules = () => {
  const [s, setS] = useState(null);
  const [country, setCountry] = useState('');
  const load = useCallback((c) => { setS(null); chemicalService.standards(c).then((r) => setS(r.data)).catch((e) => { setS({ local: [], international: [], note: chemErr(e) }); }); }, []);
  useEffect(() => { load(''); }, [load]);
  const Ref = ({ x }) => (
    <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
      <Text strong>{x.url ? <a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a> : x.title}</Text>
      <div><Text type="secondary">{x.body}</Text></div>
      <div style={{ fontSize: 13 }}>{x.what}</div>
    </div>
  );
  return (
    <>
      <Space wrap style={{ marginBottom: 12 }}>
        <Text>Country:</Text>
        <Select style={{ width: 220 }} value={country} onChange={(v) => { setCountry(v); load(v); }}
          options={[{ value: '', label: `My company${s?.country ? ` (${s.country})` : ''}` }, ...['Ghana', 'Qatar', 'Nigeria', 'Kenya', 'South Africa', 'United States', 'United Kingdom', 'Germany', 'France', 'Other'].map((c) => ({ value: c, label: c }))]} />
      </Space>
      {!s ? <Skeleton active /> : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}><Card title={`Local${s.country ? `: ${s.country}` : ''}`} style={{ borderRadius: 16 }}>{s.local.length ? s.local.map((x) => <Ref key={x.title} x={x} />) : <Empty description="No local references built in for this country yet" />}</Card></Col>
          <Col xs={24} lg={12}><Card title="International" style={{ borderRadius: 16 }}>{s.international.map((x) => <Ref key={x.title} x={x} />)}</Card></Col>
          <Col span={24}><Alert type="info" showIcon message={s.note} description="References help you find the rules; they are not legal advice. Always check the current text with the authority." /></Col>
        </Row>
      )}
    </>
  );
};

// ------------------------------------------------------------------ page
const ChemicalSafetyPage = () => {
  const location = useLocation();
  const history = useHistory();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [data, setData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [openItem, setOpenItem] = useState(null);
  const [noCompany, setNoCompany] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const tab = params.get('tab') || 'register';
  const load = useCallback(() => {
    chemicalService.items().then((r) => setData({ items: r.data || [], can_manage: !!r.can_manage })).catch((e) => {
      if (e?.status === 403) setNoCompany(true); else message.error(chemErr(e));
      setData({ items: [], can_manage: false });
    });
    setRefreshKey((k) => k + 1);
  }, []);
  useEffect(() => { load(); chemicalService.groups().then((r) => setGroups(r.data.groups || [])).catch(() => {}); }, [load]);
  useEffect(() => { if (openItem && data) { const fresh = data.items.find((i) => i.id === openItem.id); if (fresh && fresh !== openItem) setOpenItem(fresh); } }, [data]); // eslint-disable-line
  const openId = (id) => { const it = data?.items.find((i) => i.id === id); if (it) setOpenItem(it); };
  if (noCompany) return <div style={{ padding: 16 }}><Card><Empty description="The chemical register is set up per company, and this account does not belong to a company." /></Card></div>;
  const counts = { alerts: (data?.items || []).reduce((n, r) => n + r.issues.length, 0) };
  return (
    <div className="chemical-page" style={{ padding: 16, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <Title level={3} style={{ margin: 0 }}><ExperimentOutlined /> Chemical safety</Title>
        <Text type="secondary">Know what you store, what it does, what must never meet, and what to do when something goes wrong.</Text>
      </div>
      <Tabs activeKey={tab} onChange={(k) => history.replace({ search: `?tab=${k}` })} items={[
        { key: 'register', label: <span><SafetyOutlined /> Register</span>, children: <Register data={data} groups={groups} onReload={load} onOpen={setOpenItem} /> },
        { key: 'compatibility', label: <span><SwapOutlined /> Mixing and storage check</span>, children: <Compatibility data={data} groups={groups} /> },
        { key: 'alerts', label: <span><AlertOutlined /> Alerts{counts.alerts ? ` (${counts.alerts})` : ''}</span>, children: <Alerts onOpenId={openId} refreshKey={refreshKey} /> },
        { key: 'rules', label: <span><BookOutlined /> Rules</span>, children: <Rules /> },
      ]} />
      {openItem && <ItemDrawer key={openItem.id} item={openItem} groups={groups} canManage={!!data?.can_manage} onClose={() => setOpenItem(null)} onChanged={load} />}
    </div>
  );
};

export default ChemicalSafetyPage;
