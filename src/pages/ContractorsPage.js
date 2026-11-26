// Contractor management: pre-qualification, documents with expiry, workers with induction, approval rules and a gate check.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Badge, Button, Card, Col, DatePicker, Drawer, Empty, Form, Input, Modal, Radio, Row, Select, Skeleton, Space, Table, Tabs,
  Tag, Typography, Upload, message,
} from 'antd';
import dayjs from 'dayjs';
import { CheckCircleFilled, CloseCircleFilled, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { contractorService, errorText } from '../services/siteSafetyService';

const { Title, Text, Paragraph } = Typography;
const STATUS = { approved: 'green', pending: 'gold', suspended: 'red' };
const DOC = { valid: 'green', expiring: 'orange', expired: 'red' };
const day = (d) => (d ? d.format('YYYY-MM-DD') : '');

const Gate = () => {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState(null);
  const search = async () => {
    if (q.trim().length < 2) return;
    try { setRows((await contractorService.gate(q.trim())).data || []); } catch (e) { message.error(errorText(e)); }
  };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Paragraph>Type a contractor worker's name to see if they may enter today.</Paragraph>
      <Space.Compact style={{ width: '100%', maxWidth: 480 }}>
        <Input size="large" value={q} maxLength={80} onChange={(e) => setQ(e.target.value)} onPressEnter={search} placeholder="Worker name" />
        <Button size="large" type="primary" icon={<SearchOutlined />} onClick={search}>Check</Button>
      </Space.Compact>
      <div style={{ marginTop: 16 }}>
        {rows && rows.length === 0 && <Empty description="No contractor worker with that name" />}
        {(rows || []).map((r) => (
          <Card key={r.worker_id} size="small" style={{ marginBottom: 8, borderRadius: 12, background: r.allowed ? '#f6ffed' : '#fff1f0', borderColor: r.allowed ? '#52c41a' : '#ff4d4f' }}>
            <Space align="start">
              {r.allowed ? <CheckCircleFilled style={{ fontSize: 28, color: '#389e0d' }} /> : <CloseCircleFilled style={{ fontSize: 28, color: '#cf1322' }} />}
              <div>
                <Text strong style={{ fontSize: 16 }}>{r.allowed ? 'May enter' : 'Do not let in'}: {r.name}</Text>
                <div><Text type="secondary">{r.role ? `${r.role}, ` : ''}{r.firm}</Text></div>
                {r.issues.map((i) => <div key={i}>{i}</div>)}
              </div>
            </Space>
          </Card>
        ))}
      </div>
    </Card>
  );
};

const FirmDrawer = ({ id, meta, onClose, onChanged }) => {
  const [f, setF] = useState(null);
  const [docOpen, setDocOpen] = useState(null);
  const [workerOpen, setWorkerOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [docForm] = Form.useForm();
  const [workerForm] = Form.useForm();
  const [firmForm] = Form.useForm();
  const load = useCallback(async () => {
    try { setF((await contractorService.get(id)).data); } catch (e) { message.error(errorText(e)); onClose(); }
  }, [id, onClose]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (f) firmForm.setFieldsValue({ ...f, prequal: f.prequal }); }, [f, firmForm]);
  const run = async (fn, ok) => {
    setBusy(true);
    try { const r = await fn(); if (r?.data) setF(r.data); if (ok) message.success(ok); onChanged(); return true; } catch (e) { message.error(errorText(e)); return false; } finally { setBusy(false); }
  };
  const saveFirm = async () => run(() => contractorService.update(id, firmForm.getFieldsValue()), 'Saved');
  const saveDoc = async () => {
    const v = await docForm.validateFields();
    const fd = new FormData();
    fd.append('doc_type', v.doc_type);
    if (v.title) fd.append('title', v.title);
    if (v.number) fd.append('number', v.number);
    if (v.expires_on) fd.append('expires_on', day(v.expires_on));
    if (docOpen.worker_id) fd.append('worker_id', String(docOpen.worker_id));
    const file = v.file?.[0]?.originFileObj;
    if (file) fd.append('file', file);
    if (await run(() => contractorService.addDoc(id, fd), 'Document added')) { setDocOpen(null); docForm.resetFields(); }
  };
  const saveWorker = async () => {
    const v = await workerForm.validateFields();
    const body = { name: v.name, role: v.role, phone: v.phone, inducted_on: v.inducted_on ? day(v.inducted_on) : null, induction_valid_until: v.induction_valid_until ? day(v.induction_valid_until) : null };
    const ok = await run(() => (workerOpen.id ? contractorService.updateWorker(id, workerOpen.id, body) : contractorService.addWorker(id, body)), 'Saved');
    if (ok) { setWorkerOpen(null); workerForm.resetFields(); }
  };
  const docs = (wid) => (f?.docs || []).filter((d) => (d.worker_id || null) === (wid || null));
  const DocList = ({ wid, types }) => (
    <div>
      {docs(wid).map((d) => (
        <div key={d.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
          <Tag color={DOC[d.state]}>{d.state}</Tag>
          <span style={{ flex: '1 1 160px', minWidth: 0 }}>{d.title || types[d.doc_type]}{d.number ? ` (${d.number})` : ''}{d.expires_on ? `, expires ${d.expires_on}` : ''}</span>
          {d.has_file && <Button size="small" onClick={() => contractorService.openDoc(d.id).catch((e) => message.error(errorText(e)))}>View</Button>}
          <Button size="small" type="text" danger onClick={() => Modal.confirm({ title: 'Delete this document?', onOk: () => run(() => contractorService.removeDoc(d.id), 'Deleted') })}>Delete</Button>
        </div>
      ))}
      <Button size="small" icon={<PlusOutlined />} style={{ marginTop: 6 }} onClick={() => { docForm.resetFields(); setDocOpen({ worker_id: wid || null, types }); }}>Add document</Button>
    </div>
  );
  return (
    <Drawer open width={Math.min(720, window.innerWidth)} onClose={onClose} title={f ? f.name : 'Contractor'} destroyOnClose>
      {!f ? <Skeleton active /> : (
        <div>
          <Space wrap style={{ marginBottom: 12 }}>
            <Tag color={STATUS[f.status]}>{f.status}</Tag>
            {f.status !== 'approved' && <Button type="primary" loading={busy} onClick={() => run(() => contractorService.setStatus(id, 'approved'), 'Approved')}>Approve</Button>}
            {f.status !== 'suspended' && <Button danger loading={busy} onClick={() => run(() => contractorService.setStatus(id, 'suspended'), 'Suspended')}>Suspend</Button>}
          </Space>
          {f.issues.length > 0 && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="Before approval" description={f.issues.map((i) => <div key={i}>{i}</div>)} />}
          <Tabs items={[
            { key: 'pq', label: 'Pre-qualification', children: (
              <Form form={firmForm} layout="vertical" onFinish={saveFirm}>
                {meta.prequal_questions.map((q) => (
                  <Form.Item key={q.id} name={['prequal', q.id]} label={q.text} style={{ marginBottom: 10 }}>
                    <Radio.Group options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]} optionType="button" />
                  </Form.Item>
                ))}
                <Row gutter={12}>
                  <Col xs={24} sm={12}><Form.Item name="trade" label="Trade"><Input maxLength={120} /></Form.Item></Col>
                  <Col xs={24} sm={12}><Form.Item name="contact_name" label="Contact"><Input maxLength={120} /></Form.Item></Col>
                  <Col xs={24} sm={12}><Form.Item name="contact_email" label="E-mail"><Input maxLength={200} /></Form.Item></Col>
                  <Col xs={24} sm={12}><Form.Item name="contact_phone" label="Phone"><Input maxLength={40} /></Form.Item></Col>
                </Row>
                <Form.Item name="notes" label="Notes"><Input.TextArea rows={3} maxLength={2000} /></Form.Item>
                <Button type="primary" htmlType="submit" loading={busy}>Save</Button>
              </Form>
            ) },
            { key: 'docs', label: <Badge count={f.docs_expired} size="small" offset={[8, 0]}>Company documents</Badge>, children: <DocList types={meta.firm_doc_types} /> },
            { key: 'workers', label: `Workers (${f.workers})`, children: (
              <div>
                <Button icon={<PlusOutlined />} style={{ marginBottom: 12 }} onClick={() => { workerForm.resetFields(); setWorkerOpen({}); }}>Add worker</Button>
                {f.worker_list.length === 0 && <Empty description="No workers yet" />}
                {f.worker_list.map((w) => (
                  <Card key={w.id} size="small" style={{ marginBottom: 8, borderRadius: 12, opacity: w.status === 'removed' ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
                      <div style={{ minWidth: 0 }}>
                        <Text strong>{w.name}</Text> {w.role && <Text type="secondary">{w.role}</Text>} {w.issues.length ? <Tag color="red">Cannot enter</Tag> : <Tag color="green">May enter</Tag>}
                        <div><Text type="secondary">{w.inducted_on ? `Inducted ${w.inducted_on}${w.induction_valid_until ? `, valid to ${w.induction_valid_until}` : ''}` : 'Not inducted'}</Text></div>
                        {w.issues.map((i) => <div key={i} style={{ color: '#cf1322' }}>{i}</div>)}
                      </div>
                      <Space wrap>
                        <Button size="small" onClick={() => { setWorkerOpen(w); workerForm.setFieldsValue({ ...w, inducted_on: w.inducted_on ? dayjs(w.inducted_on) : null, induction_valid_until: w.induction_valid_until ? dayjs(w.induction_valid_until) : null }); }}>Edit</Button>
                        <Button size="small" onClick={() => run(() => contractorService.updateWorker(id, w.id, { status: w.status === 'removed' ? 'active' : 'removed' }), 'Saved')}>{w.status === 'removed' ? 'Restore' : 'Remove'}</Button>
                      </Space>
                    </div>
                    <div style={{ marginTop: 8 }}><DocList wid={w.id} types={meta.worker_doc_types} /></div>
                  </Card>
                ))}
              </div>
            ) },
          ]} />
        </div>
      )}
      <Modal open={Boolean(docOpen)} title="Add document" okText="Add" confirmLoading={busy} onOk={saveDoc} onCancel={() => setDocOpen(null)}>
        <Form form={docForm} layout="vertical">
          <Form.Item name="doc_type" label="Type" rules={[{ required: true, message: 'Choose the type' }]}>
            <Select options={Object.entries(docOpen?.types || {}).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item name="title" label="Title"><Input maxLength={200} /></Form.Item>
          <Form.Item name="number" label="Number"><Input maxLength={100} /></Form.Item>
          <Form.Item name="expires_on" label="Expires on"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="file" label="File (PDF, PNG or JPG, up to 10 MB)" valuePropName="fileList" getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}>
            <Upload beforeUpload={() => false} maxCount={1} accept=".pdf,.png,.jpg,.jpeg"><Button icon={<UploadOutlined />}>Choose file</Button></Upload>
          </Form.Item>
        </Form>
      </Modal>
      <Modal open={Boolean(workerOpen)} title={workerOpen?.id ? 'Edit worker' : 'Add worker'} okText="Save" confirmLoading={busy} onOk={saveWorker} onCancel={() => setWorkerOpen(null)}>
        <Form form={workerForm} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, min: 2, message: 'Type the name' }]}><Input maxLength={160} /></Form.Item>
          <Form.Item name="role" label="Role"><Input maxLength={120} /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input maxLength={40} /></Form.Item>
          <Form.Item name="inducted_on" label="Site induction given on"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="induction_valid_until" label="Induction valid until"><DatePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
};

const ContractorsPage = () => {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();
  const load = useCallback(async () => {
    try { setD((await contractorService.list()).data); setErr(''); } catch (e) { setErr(errorText(e, 'Could not load contractors')); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const add = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try { const r = await contractorService.create(v); setAdding(false); form.resetFields(); load(); setOpen(r.data.id); } catch (e) { message.error(errorText(e)); }
    setBusy(false);
  };
  const closeDrawer = useCallback(() => setOpen(null), []);
  const counts = useMemo(() => ({
    approved: (d?.firms || []).filter((f) => f.status === 'approved').length,
    expired: (d?.firms || []).reduce((n, f) => n + f.docs_expired, 0),
    expiring: (d?.firms || []).reduce((n, f) => n + f.docs_expiring, 0),
  }), [d]);
  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Title level={2} style={{ margin: 0 }}>Contractors</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAdding(true)} disabled={!d}>Add contractor</Button>
      </div>
      {err && <Alert type="error" showIcon message={err} action={<Button onClick={load}>Try again</Button>} />}
      {!d && !err && <Skeleton active />}
      {d && (
        <Tabs items={[
          { key: 'list', label: 'Companies', children: (
            <div>
              {(counts.expired > 0 || counts.expiring > 0) && <Alert type={counts.expired ? 'error' : 'warning'} showIcon style={{ marginBottom: 12 }} message={`${counts.expired} documents expired, ${counts.expiring} expire within 30 days`} />}
              <Table rowKey="id" dataSource={d.firms} scroll={{ x: 640 }} pagination={{ pageSize: 20 }} locale={{ emptyText: <Empty description="No contractors yet" /> }}
                onRow={(r) => ({ onClick: () => setOpen(r.id), style: { cursor: 'pointer' } })}
                columns={[
                  { title: 'Company', dataIndex: 'name', render: (n, r) => <div><Text strong>{n}</Text>{r.trade && <div><Text type="secondary">{r.trade}</Text></div>}</div> },
                  { title: 'Status', dataIndex: 'status', width: 110, render: (s) => <Tag color={STATUS[s]}>{s}</Tag> },
                  { title: 'Workers', dataIndex: 'workers', width: 90 },
                  { title: 'Documents', width: 170, render: (_, r) => <Space size={4} wrap>{r.docs_expired > 0 && <Tag color="red">{r.docs_expired} expired</Tag>}{r.docs_expiring > 0 && <Tag color="orange">{r.docs_expiring} expiring</Tag>}{!r.docs_expired && !r.docs_expiring && <Tag color="green">OK</Tag>}</Space> },
                  { title: 'To do', render: (_, r) => (r.issues.length ? r.issues.join('; ') : '') },
                ]} />
            </div>
          ) },
          { key: 'gate', label: 'Gate check', children: <Gate /> },
        ]} />
      )}
      {open && d && <FirmDrawer id={open} meta={d} onClose={closeDrawer} onChanged={load} />}
      <Modal open={adding} title="Add contractor" okText="Add" confirmLoading={busy} onOk={add} onCancel={() => setAdding(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Company name" rules={[{ required: true, min: 2, message: 'Type the name' }]}><Input maxLength={200} /></Form.Item>
          <Form.Item name="trade" label="Trade"><Input maxLength={120} placeholder="Example: scaffolding" /></Form.Item>
          <Form.Item name="contact_name" label="Contact"><Input maxLength={120} /></Form.Item>
          <Form.Item name="contact_email" label="E-mail"><Input maxLength={200} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractorsPage;
