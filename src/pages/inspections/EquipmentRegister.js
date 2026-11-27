// Equipment register with QR safety tags (Inspections > Equipment). Each item has its checklist, inspection interval and
// certificate date; the tag status comes from its inspections. Data: /api/equipment/* (company-scoped on the server).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, Card, Col, DatePicker, Descriptions, Drawer, Empty, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Switch,
  Table, Tag, Timeline, Typography, message,
} from 'antd';
import dayjs from 'dayjs';
import { PlusOutlined, PrinterOutlined, QrcodeOutlined, ReloadOutlined, SafetyOutlined, StopOutlined } from '@ant-design/icons';
import equipmentService, { eqErr } from '../../services/equipmentRegisterService';

const { Text, Paragraph } = Typography;
const LEVEL_COLOR = { green: 'green', orange: 'orange', red: 'red', grey: 'default' };
const LEVEL_BG = { green: '#f6ffed', orange: '#fff7e6', red: '#fff1f0', grey: '#fafafa' };
const STATE_FILTERS = [['', 'All'], ['ok', 'Safe to use'], ['overdue', 'Inspection overdue'], ['not_inspected', 'Not inspected'], ['do_not_use', 'Do not use'], ['cert_expired', 'Certificate expired'], ['retired', 'Retired']];
const d = (x) => (x ? dayjs(x).format('D MMM YYYY') : '-');

export const StateBanner = ({ e }) => (
  <div style={{ background: LEVEL_BG[e.state_level], border: `2px solid ${{ green: '#52c41a', orange: '#fa8c16', red: '#cf1322', grey: '#bfbfbf' }[e.state_level]}`, borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
    <div style={{ fontSize: 22, fontWeight: 700, color: { green: '#237804', orange: '#ad4e00', red: '#a8071a', grey: '#595959' }[e.state_level] }}>{e.state_label}</div>
    {e.status_reason && e.status !== 'in_service' && <div>{e.status_reason}</div>}
    <div style={{ fontSize: 13, marginTop: 4 }}>
      Last inspected: {e.last_inspected_at ? d(e.last_inspected_at) : 'never'}{e.last_result ? ` (${e.last_result})` : ''} · Next inspection: {d(e.next_due)}
      {e.cert_due ? ` · ${e.cert_name || 'Certificate'}: ${d(e.cert_due)}` : ''}
    </div>
  </div>
);

const EditDrawer = ({ open, item, meta, lib, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const checklists = useMemo(() => [...(lib?.company || []), ...(lib?.library || [])].map((t) => ({ value: t.ref, label: `${t.name}${t.built_in ? '' : ' (company)'}` })), [lib]);
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (item) form.setFieldsValue({ ...item, arrived_on: item.arrived_on ? dayjs(item.arrived_on) : null, next_due: item.next_due ? dayjs(item.next_due) : null, cert_due: item.cert_due ? dayjs(item.cert_due) : null });
    else form.setFieldsValue({ category: 'forklift', ownership: 'owned', arrived_on: dayjs(), ...pick('forklift') });
  }, [open, item]); // eslint-disable-line
  function pick(cat) {
    const c = (meta?.categories || []).find((x) => x.id === cat);
    if (!c) return {};
    return { checklist_ref: c.checklist_ref || undefined, inspect_every_days: c.every_days, cert_name: c.cert_name || undefined,
      cert_due: c.cert_months ? null : undefined };
  }
  const save = async () => {
    const v = await form.validateFields();
    const day = (x) => (x ? x.format('YYYY-MM-DD') : null);
    const payload = { ...v, arrived_on: day(v.arrived_on), next_due: day(v.next_due), cert_due: day(v.cert_due), checklist_ref: v.checklist_ref || null };
    if (!item) delete payload.next_due;
    setBusy(true);
    try { const r = await equipmentService.save(payload, item?.id); message.success(item ? 'Saved' : `Added as ${r.data.tag_no}. Print its tag.`); onSaved(r.data); } catch (e) { message.error(eqErr(e)); } finally { setBusy(false); }
  };
  const cat = Form.useWatch('category', form);
  const catMeta = (meta?.categories || []).find((x) => x.id === cat);
  return (
    <Drawer open={open} onClose={onClose} width={Math.min(760, typeof window !== 'undefined' ? window.innerWidth : 760)} title={item ? `${item.tag_no} ${item.name}` : 'Add equipment'}
      extra={<Button type="primary" loading={busy} onClick={save}>Save</Button>}>
      <Form form={form} layout="vertical">
        <Row gutter={12}>
          <Col xs={24} md={14}><Form.Item name="name" label="Name" rules={[{ required: true, min: 2 }]}><Input maxLength={200} placeholder='e.g. "Toyota forklift 2.5 t"' /></Form.Item></Col>
          <Col xs={24} md={10}><Form.Item name="category" label="Type" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={(meta?.categories || []).map((c) => ({ value: c.id, label: c.name }))} onChange={(c) => !item && form.setFieldsValue(pick(c))} />
          </Form.Item></Col>
          <Col xs={12} md={8}><Form.Item name="make" label="Make"><Input maxLength={120} /></Form.Item></Col>
          <Col xs={12} md={8}><Form.Item name="model" label="Model"><Input maxLength={120} /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="serial_no" label="Serial / plant number"><Input maxLength={120} /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="location" label="Site / location"><Input maxLength={160} /></Form.Item></Col>
          <Col xs={12} md={6}><Form.Item name="ownership" label="Ownership"><Select options={[{ value: 'owned', label: 'Owned' }, { value: 'hired', label: 'Hired' }, { value: 'contractor', label: "Contractor's" }]} /></Form.Item></Col>
          <Col xs={12} md={6}><Form.Item name="arrived_on" label="Arrived on site"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="supplier" label="Supplier / hire company"><Input maxLength={160} /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="checklist_ref" label="Inspection checklist" extra="From Inspections: the built-in list or your own checklists."><Select allowClear showSearch optionFilterProp="label" options={checklists} /></Form.Item></Col>
          <Col xs={12} md={8}><Form.Item name="inspect_every_days" label="Inspect every (days)"><InputNumber min={1} max={1825} style={{ width: '100%' }} /></Form.Item></Col>
          {item && <Col xs={12} md={8}><Form.Item name="next_due" label="Next inspection"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>}
          <Col xs={24} md={item ? 8 : 16}><Form.Item name="cert_name" label="Certificate / statutory examination"><Input maxLength={120} placeholder="e.g. Thorough examination" /></Form.Item></Col>
          <Col xs={12} md={8}><Form.Item name="cert_due" label="Certificate due"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={24}><Form.Item name="notes" label="Notes"><Input.TextArea maxLength={4000} autoSize={{ minRows: 2, maxRows: 4 }} /></Form.Item></Col>
        </Row>
      </Form>
      {!item && <Alert type="info" showIcon message="New equipment is due for inspection today: inspect it before first use." />}
      {catMeta?.cert_months ? <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
        Common practice for this type: {catMeta.cert_name.toLowerCase()} every {catMeta.cert_months} months. Use the interval your law, insurer and the maker require.
      </Paragraph> : null}
    </Drawer>
  );
};

const ItemDrawer = ({ id, canManage, onClose, onChanged, onEdit, onOpenInspection }) => {
  const [e, setE] = useState(null);
  const [stop, setStop] = useState(null);       // {status, title}
  const [reason, setReason] = useState('');
  const load = useCallback(() => { equipmentService.get(id).then((r) => setE(r.data)).catch((x) => { message.error(eqErr(x)); onClose(); }); }, [id]); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  if (!e) return <Drawer open onClose={onClose} title="Equipment" width={Math.min(760, window.innerWidth)} loading />;
  const inspect = async () => {
    try { const r = await equipmentService.inspect(e.id); onOpenInspection(r.data.id); } catch (x) { message.error(eqErr(x)); }
  };
  const doStatus = async () => {
    try { await equipmentService.setStatus(e.id, stop.status, reason); message.success('Saved'); setStop(null); setReason(''); load(); onChanged(); } catch (x) { message.error(eqErr(x)); }
  };
  return (
    <Drawer open onClose={onClose} width={Math.min(760, window.innerWidth)} title={`${e.tag_no} · ${e.name}`}
      extra={canManage && <Button onClick={() => onEdit(e)}>Edit</Button>}>
      <StateBanner e={e} />
      <Space wrap style={{ marginBottom: 12 }}>
        {e.status !== 'retired' && <Button type="primary" icon={<SafetyOutlined />} onClick={inspect}>Inspect now</Button>}
        {e.status === 'in_service' && <Button danger icon={<StopOutlined />} onClick={() => setStop({ status: 'out_of_service', title: 'Take out of service' })}>Take out of service</Button>}
        {canManage && e.status === 'out_of_service' && <Button onClick={() => setStop({ status: 'in_service', title: 'Return to service' })}>Return to service</Button>}
        {canManage && e.status !== 'retired' && <Button onClick={() => setStop({ status: 'retired', title: 'Retire' })}>Retire</Button>}
        <Button icon={<PrinterOutlined />} onClick={() => equipmentService.tagsPdf([e.id]).catch((x) => message.error(eqErr(x)))}>Print tag</Button>
      </Space>
      <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }} items={[
        { key: 't', label: 'Type', children: e.category_name }, { key: 'l', label: 'Location', children: e.location || '-' },
        { key: 'm', label: 'Make / model', children: [e.make, e.model].filter(Boolean).join(' ') || '-' }, { key: 's', label: 'Serial', children: e.serial_no || '-' },
        { key: 'o', label: 'Ownership', children: `${e.ownership}${e.supplier ? ` (${e.supplier})` : ''}` }, { key: 'a', label: 'Arrived', children: d(e.arrived_on) },
        { key: 'i', label: 'Inspect every', children: e.inspect_every_days ? `${e.inspect_every_days} day(s)` : '-' },
        { key: 'q', label: 'Tag link', children: <Text copyable={{ text: e.qr_url }} style={{ fontSize: 12 }}><QrcodeOutlined /> scan link</Text> },
      ]} />
      {e.notes && <Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{e.notes}</Paragraph>}
      <Card size="small" title="Inspections" style={{ marginTop: 12, borderRadius: 12 }}>
        {e.inspections.length === 0 ? <Empty description="No inspections yet" /> : (
          <Table rowKey="id" size="small" pagination={false} dataSource={e.inspections} scroll={{ x: 480 }} onRow={(r) => ({ onClick: () => onOpenInspection(r.id), style: { cursor: 'pointer' } })} columns={[
            { title: 'Date', render: (_, r) => d(r.completed_at || r.started_at) }, { title: 'By', dataIndex: 'inspector' },
            { title: 'Result', render: (_, r) => (r.status !== 'completed' ? <Tag>in progress</Tag> : r.critical_failed ? <Tag color="red">critical fail</Tag> : r.failed_count ? <Tag color="orange">{r.failed_count} failed</Tag> : <Tag color="green">pass</Tag>) },
            { title: 'Score', render: (_, r) => (r.max_score ? `${r.score}/${r.max_score}` : '-') },
          ]} />
        )}
      </Card>
      <Card size="small" title="History" style={{ marginTop: 12, borderRadius: 12 }}>
        <Timeline items={e.log.map((l) => ({ color: l.kind === 'status' ? 'red' : l.kind === 'inspection' ? 'blue' : 'gray',
          children: <div><div>{l.text}</div><Text type="secondary" style={{ fontSize: 12 }}>{d(l.at)}{l.by ? ` · ${l.by}` : ''}</Text></div> }))} />
      </Card>
      <Modal open={!!stop} title={stop?.title} onCancel={() => setStop(null)} onOk={doStatus} okText="Save" okButtonProps={{ danger: stop?.status === 'out_of_service', disabled: reason.trim().length < 3 }}>
        <Paragraph>{stop?.status === 'out_of_service' ? 'The tag will show DO NOT USE until a supervisor returns it to service. Supervisors are told.' : 'Say why.'}</Paragraph>
        <Input.TextArea value={reason} onChange={(x) => setReason(x.target.value)} maxLength={500} autoSize={{ minRows: 2, maxRows: 4 }} placeholder="Reason" />
      </Modal>
    </Drawer>
  );
};

const EquipmentRegister = ({ lib, openEq, setOpenEq, onOpenInspection, refreshKey }) => {
  const [rows, setRows] = useState(null);
  const [meta, setMeta] = useState(null);
  const [counts, setCounts] = useState({});
  const [q, setQ] = useState('');
  const [state, setState] = useState('');
  const [sel, setSel] = useState([]);
  const [edit, setEdit] = useState(undefined);
  const load = useCallback(() => {
    equipmentService.list().then((r) => { setRows(r.data || []); setCounts(r.counts || {}); }).catch((e) => { setRows([]); message.error(eqErr(e)); });
  }, []);
  useEffect(() => { load(); }, [load, refreshKey]);
  useEffect(() => { equipmentService.meta().then((r) => setMeta(r.data)).catch(() => setMeta({ categories: [], settings: {}, can_manage: false })); }, []);
  const canManage = !!meta?.can_manage;
  const list = (rows || []).filter((e) => (state ? e.state === state : e.state !== 'retired')
    && (!q || `${e.tag_no} ${e.name} ${e.serial_no || ''} ${e.location || ''} ${e.category_name}`.toLowerCase().includes(q.toLowerCase())));
  const togglePublic = async (v) => {
    try { const r = await equipmentService.saveSettings({ public_status: v }); setMeta({ ...meta, settings: r.data }); message.success(v ? 'Anyone who scans a tag now sees its status' : 'Scanning now needs a company sign-in'); } catch (e) { message.error(eqErr(e)); }
  };
  const stat = (k, title, color) => <Col xs={12} md={6}><Card size="small" hoverable style={{ borderRadius: 12 }} onClick={() => setState(k)}><Statistic title={title} value={counts[k] || 0} valueStyle={{ color }} /></Card></Col>;
  return (
    <div>
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {stat('ok', 'Safe to use', '#389e0d')}
        {stat('overdue', 'Inspection overdue', '#d46b08')}
        {stat('do_not_use', 'Do not use', '#cf1322')}
        {stat('not_inspected', 'Not inspected yet', '#d46b08')}
      </Row>
      {(counts.cert_expired || 0) > 0 && <Alert type="error" showIcon style={{ marginBottom: 12 }} message={`${counts.cert_expired} item(s) with an expired certificate or examination`} action={<Button size="small" onClick={() => setState('cert_expired')}>Show</Button>} />}
      <Card style={{ borderRadius: 16 }}>
        <Space wrap style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
          <Space wrap>
            <Input.Search allowClear placeholder="Tag, name, serial, location" style={{ width: 240 }} onSearch={setQ} onChange={(e) => !e.target.value && setQ('')} />
            <Select value={state} onChange={setState} style={{ width: 190 }} options={STATE_FILTERS.map(([v, l]) => ({ value: v, label: l }))} />
            <Button icon={<ReloadOutlined />} onClick={load} aria-label="Reload" />
          </Space>
          <Space wrap>
            <Button icon={<PrinterOutlined />} onClick={() => equipmentService.tagsPdf(sel).catch((e) => message.error(eqErr(e)))}>{sel.length ? `Print ${sel.length} tag(s)` : 'Print all tags'}</Button>
            {canManage && <Button type="primary" icon={<PlusOutlined />} onClick={() => setEdit(null)}>Add equipment</Button>}
          </Space>
        </Space>
        <Table rowKey="id" size="middle" loading={!rows} dataSource={list} scroll={{ x: 900 }} pagination={{ pageSize: 25, showSizeChanger: false }}
          rowSelection={{ selectedRowKeys: sel, onChange: setSel }}
          onRow={(r) => ({ onClick: () => setOpenEq(r.id), style: { cursor: 'pointer' } })}
          locale={{ emptyText: <Empty description={canManage ? 'No equipment yet. Add the first item and print its QR tag.' : 'No equipment in the register yet.'} /> }}
          columns={[
            { title: 'Tag', dataIndex: 'tag_no', width: 95, render: (v) => <Text strong>{v}</Text> },
            { title: 'Equipment', dataIndex: 'name', render: (v, r) => <div>{v}<div><Text type="secondary" style={{ fontSize: 12 }}>{r.category_name}{r.serial_no ? ` · ${r.serial_no}` : ''}</Text></div></div> },
            { title: 'Location', dataIndex: 'location', width: 150, render: (v) => v || '-' },
            { title: 'Status', width: 210, render: (_, r) => <Tag color={LEVEL_COLOR[r.state_level]} style={{ whiteSpace: 'normal' }}>{r.state_label}</Tag> },
            { title: 'Next inspection', width: 130, render: (_, r) => (r.next_due ? <Text type={r.days_to_due < 0 ? 'danger' : undefined}>{d(r.next_due)}</Text> : '-') },
            { title: 'Certificate', width: 130, render: (_, r) => (r.cert_due ? d(r.cert_due) : '-') },
          ]} />
        {canManage && meta && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Switch checked={!!meta.settings?.public_status} onChange={togglePublic} aria-label="Public tag status" />
            <Text type="secondary" style={{ fontSize: 13 }}>Let anyone who scans a tag see its status (no sign-in). They see only the name, tag number, status and dates: no names, location or company details. Off: scanning needs a company account.</Text>
          </div>
        )}
      </Card>
      <EditDrawer open={edit !== undefined} item={edit} meta={meta} lib={lib} onClose={() => setEdit(undefined)}
        onSaved={(x) => { setEdit(undefined); load(); setOpenEq(x.id); }} />
      {openEq && <ItemDrawer key={`${openEq}-${refreshKey}`} id={openEq} canManage={canManage} onClose={() => setOpenEq(null)} onChanged={load}
        onEdit={(x) => { setOpenEq(null); setEdit(x); }} onOpenInspection={onOpenInspection} />}
    </div>
  );
};

export default EquipmentRegister;
