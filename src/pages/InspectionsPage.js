// Inspections & checklists: run a checklist on a phone (autosave, photos, signature), automatic actions for failed items,
// company checklists, schedules with reminders and insights. Data: /api/inspections/* (company-scoped on the server).
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Alert, Badge, Button, Card, Checkbox, Col, DatePicker, Drawer, Empty, Form, Input, InputNumber, Modal, Popconfirm, Progress, Radio,
  Row, Select, Skeleton, Space, Statistic, Table, Tabs, Tag, Typography, Upload, message,
} from 'antd';
import dayjs from 'dayjs';
import {
  ArrowDownOutlined, ArrowUpOutlined, BarChartOutlined, CameraOutlined, CheckCircleOutlined, ClockCircleOutlined, CopyOutlined, DeleteOutlined,
  EditOutlined, FilePdfOutlined, PlusOutlined, QrcodeOutlined, ReloadOutlined, ScheduleOutlined, SnippetsOutlined, ToolOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import inspectionService, { inspErr } from '../services/inspectionService';
import EquipmentRegister from './inspections/EquipmentRegister';

const { Title, Text, Paragraph } = Typography;
const FREQ = [['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly'], ['quarterly', 'Every 3 months'], ['yearly', 'Yearly']];
const PRIORITY = { critical: 'red', high: 'orange', medium: 'gold' };
const ACT_STATUS = { open: 'blue', done: 'cyan', verified: 'green' };
const fmt = (d) => (d ? new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '');
const draftKey = (id) => `insp:draft:${id}`;
const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  del: (k) => { try { localStorage.removeItem(k); } catch (e) { /* private mode */ } },
};
const me = () => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch (e) { return {}; } };

const isFail = (it, a) => {
  const v = a?.value;
  if (it.type === 'check') return v === 'fail';
  if (it.type === 'number' && v !== undefined && v !== null && v !== '') {
    const x = Number(v);
    return Number.isFinite(x) && ((it.min !== null && it.min !== undefined && x < it.min) || (it.max !== null && it.max !== undefined && x > it.max));
  }
  return false;
};
const isAnswered = (it, a) => {
  const v = a?.value;
  if (it.type === 'check') return ['pass', 'fail', 'na'].includes(v);
  return v !== undefined && v !== null && String(v).trim() !== '';
};
const sections = (items) => {
  const out = [];
  (items || []).forEach((it) => {
    const last = out[out.length - 1];
    if (!last || last.name !== it.section) out.push({ name: it.section, items: [it] }); else last.items.push(it);
  });
  return out;
};

// ------------------------------------------------------------------ photo thumbnail (photos need the login token)
const Thumb = ({ id, onRemove }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let alive = true; let made = null;
    inspectionService.photoUrl(id).then((u) => { made = u; if (alive) setUrl(u); }).catch(() => {});
    return () => { alive = false; if (made) URL.revokeObjectURL(made); };
  }, [id]);
  return (
    <div style={{ position: 'relative', width: 84, height: 84, borderRadius: 8, overflow: 'hidden', background: '#f0f0f0' }}>
      {url && <a href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt="Inspection photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></a>}
      {onRemove && (
        <Popconfirm title="Remove this photo?" onConfirm={onRemove}>
          <Button size="small" danger shape="circle" icon={<DeleteOutlined />} style={{ position: 'absolute', top: 2, right: 2 }} aria-label="Remove photo" />
        </Popconfirm>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ one question
const Question = ({ it, a, edit, photos, people, onAnswer, onPhoto, onRemovePhoto }) => {
  const fail = isFail(it, a);
  const [showNote, setShowNote] = useState(!!a?.note);
  const range = it.type === 'number' && (it.min !== null && it.min !== undefined ? `min ${it.min}` : '') +
    (it.min !== null && it.min !== undefined && it.max !== null && it.max !== undefined ? ', ' : '') + (it.max !== null && it.max !== undefined ? `max ${it.max}` : '');
  return (
    <Card size="small" style={{ marginBottom: 10, borderRadius: 12, borderColor: fail ? '#ff7875' : undefined, background: fail ? '#fff7f6' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <Text strong style={{ flex: '1 1 260px' }}>
          {it.text}{it.required && <Text type="danger"> *</Text>} {it.critical && <Tag color="red" style={{ marginLeft: 4 }}>Critical</Tag>}
        </Text>
      </div>
      <div style={{ marginTop: 8 }}>
        {it.type === 'check' && (
          <Radio.Group disabled={!edit} value={a?.value} onChange={(e) => onAnswer({ value: e.target.value })} buttonStyle="solid" size="large">
            <Radio.Button value="pass" style={a?.value === 'pass' && !edit ? { background: '#f6ffed', borderColor: '#b7eb8f', color: '#389e0d' } : undefined}>Pass</Radio.Button>
            <Radio.Button value="fail" style={a?.value === 'fail' ? { background: '#cf1322', borderColor: '#cf1322', color: '#fff' } : undefined}>Fail</Radio.Button>
            <Radio.Button value="na">N/A</Radio.Button>
          </Radio.Group>
        )}
        {it.type === 'number' && (
          <Space wrap>
            <InputNumber size="large" disabled={!edit} value={a?.value === undefined || a?.value === null || a?.value === '' ? null : Number(a.value)}
              onChange={(v) => onAnswer({ value: v === null ? null : String(v) })} style={{ width: 160 }} status={fail ? 'error' : undefined} />
            {it.unit && <Text>{it.unit}</Text>}
            {range && <Text type={fail ? 'danger' : 'secondary'}>{fail ? 'Outside the safe range: ' : 'Safe range: '}{range}</Text>}
          </Space>
        )}
        {it.type === 'text' && (
          <Input.TextArea disabled={!edit} value={a?.value || ''} maxLength={2000} autoSize={{ minRows: 2, maxRows: 6 }} onChange={(e) => onAnswer({ value: e.target.value })} />
        )}
      </div>
      {(showNote || a?.note) && (
        <Input.TextArea disabled={!edit} style={{ marginTop: 8 }} placeholder="Note (what you saw, where)" value={a?.note || ''} maxLength={1000}
          autoSize={{ minRows: 1, maxRows: 4 }} onChange={(e) => onAnswer({ note: e.target.value })} />
      )}
      {fail && edit && (
        <div style={{ marginTop: 8, padding: 8, background: '#fff1f0', borderRadius: 8 }}>
          <Text type="danger" strong>An action will be created for this item.</Text>
          <Space wrap style={{ marginTop: 6, width: '100%' }}>
            <Select allowClear showSearch optionFilterProp="label" placeholder="Who fixes it (optional)" style={{ minWidth: 200 }}
              value={a?.action?.assignee_id || undefined} options={people.map((p) => ({ value: p.id, label: p.name }))}
              onChange={(v) => onAnswer({ action: { ...(a?.action || {}), assignee_id: v || null } })} />
            <DatePicker placeholder={`Due (default ${it.critical ? 'tomorrow' : 'in 7 days'})`} style={{ minWidth: 200 }}
              disabledDate={(d) => d && d < dayjs().startOf('day')} value={a?.action?.due_date ? dayjs(a.action.due_date) : null}
              onChange={(d) => onAnswer({ action: { ...(a?.action || {}), due_date: d ? d.format('YYYY-MM-DD') : null } })} />
          </Space>
        </div>
      )}
      <Space wrap style={{ marginTop: 8 }}>
        {edit && !showNote && !a?.note && <Button size="small" onClick={() => setShowNote(true)}>Add note</Button>}
        {edit && (
          <Upload accept="image/jpeg,image/png" capture="environment" showUploadList={false} beforeUpload={(f) => { onPhoto(it.id, f); return false; }}>
            <Button size="small" icon={<CameraOutlined />}>Photo</Button>
          </Upload>
        )}
      </Space>
      {photos.length > 0 && (
        <Space wrap style={{ marginTop: 8 }}>
          {photos.map((p) => <Thumb key={p.id} id={p.id} onRemove={edit ? () => onRemovePhoto(p.id) : null} />)}
        </Space>
      )}
    </Card>
  );
};

// ------------------------------------------------------------------ run / view one inspection
const InspectionDrawer = ({ id, people, onClose, onChanged }) => {
  const [ins, setIns] = useState(null);
  const [answers, setAnswers] = useState({});
  const [save, setSave] = useState('saved');           // saved | saving | offline
  const [finishOpen, setFinishOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState([]);
  const dirty = useRef({});
  const timer = useRef(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    try {
      const d = (await inspectionService.get(id)).data;
      const local = d.can_edit ? store.get(draftKey(id)) : null;    // answers kept on the phone while offline win
      if (local && local.answers) { dirty.current = { ...local.answers }; setSave('offline'); }
      setAnswers({ ...(d.answers || {}), ...(local?.answers || {}) });
      setIns(d);
    } catch (e) { message.error(inspErr(e)); onClose(); }
  }, [id, onClose]);
  useEffect(() => { load(); }, [load]);

  const flush = useCallback(async () => {
    const batch = dirty.current;
    if (!Object.keys(batch).length) return true;
    dirty.current = {};
    setSave('saving');
    try {
      await inspectionService.save(id, { answers: batch });
      if (!Object.keys(dirty.current).length) { store.del(draftKey(id)); setSave('saved'); }
      return true;
    } catch (e) {
      dirty.current = { ...batch, ...dirty.current };
      store.set(draftKey(id), { answers: dirty.current, at: Date.now() });
      setSave('offline');
      return false;
    }
  }, [id]);
  useEffect(() => {
    const retry = () => flush();
    window.addEventListener('online', retry);
    const t = setInterval(() => { if (Object.keys(dirty.current).length) flush(); }, 20000);
    return () => { window.removeEventListener('online', retry); clearInterval(t); clearTimeout(timer.current); flush(); };
  }, [flush]);

  const answer = (itemId, patch) => {
    setAnswers((prev) => {
      const next = { ...prev, [itemId]: { ...(prev[itemId] || {}), ...patch } };
      dirty.current = { ...dirty.current, [itemId]: next[itemId] };
      store.set(draftKey(id), { answers: dirty.current, at: Date.now() });
      return next;
    });
    setSave('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 1200);
  };

  const addPhoto = async (itemId, file) => {
    if (file.size > 8 * 1024 * 1024) { message.error('The photo is larger than 8 MB.'); return; }
    const hide = message.loading('Uploading photo…', 0);
    try {
      const p = (await inspectionService.addPhoto(id, itemId, file)).data;
      setIns((s) => ({ ...s, photos: [...(s.photos || []), p] }));
    } catch (e) { message.error(inspErr(e, 'The photo could not be uploaded. Check the connection and try again.')); } finally { hide(); }
  };
  const removePhoto = async (pid) => {
    try { await inspectionService.removePhoto(pid); setIns((s) => ({ ...s, photos: s.photos.filter((p) => p.id !== pid) })); } catch (e) { message.error(inspErr(e)); }
  };

  const finish = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try {
      if (!(await flush())) { message.error('You are offline. Your answers are kept on this device; finish when you are back online.'); return; }
      const d = (await inspectionService.complete(id, { signed_name: v.signed_name, note: v.note, answers })).data;
      store.del(draftKey(id));
      setIns({ ...d, can_edit: false }); setAnswers(d.answers || {}); setFinishOpen(false); setMissing([]);
      message.success(d.failed_count ? `Finished. ${d.failed_count} action(s) created.` : 'Finished. Everything passed.');
      onChanged();
    } catch (e) {
      const miss = e?.data?.missing || e?.response?.data?.missing;
      if (miss) { setMissing(miss); setFinishOpen(false); }
      message.error(inspErr(e));
    } finally { setBusy(false); }
  };

  const items = ins?.items || [];
  const edit = !!ins?.can_edit;
  const req = items.filter((it) => it.required);
  const doneReq = req.filter((it) => isAnswered(it, answers[it.id])).length;
  const fails = items.filter((it) => isFail(it, answers[it.id]));
  const photosFor = (itemId) => (ins?.photos || []).filter((p) => (p.item_id || '') === (itemId || ''));

  return (
    <Drawer open width={Math.min(820, typeof window !== 'undefined' ? window.innerWidth : 820)} onClose={onClose} destroyOnClose
      title={ins ? ins.title : 'Inspection'}
      extra={ins && (
        <Space>
          {edit && <Tag color={save === 'saved' ? 'green' : save === 'saving' ? 'blue' : 'orange'}>{save === 'saved' ? 'Saved' : save === 'saving' ? 'Saving…' : 'Not sent yet - kept on this device'}</Tag>}
          {!edit && <Button icon={<FilePdfOutlined />} onClick={() => inspectionService.downloadPdf(ins.id, ins.title).catch((e) => message.error(inspErr(e)))}>PDF</Button>}
        </Space>
      )}>
      {!ins ? <Skeleton active /> : (
        <>
          <Space wrap style={{ marginBottom: 12 }}>
            {ins.site && <Tag>{ins.site}</Tag>}
            <Tag>{ins.inspector}</Tag>
            <Tag color={ins.status === 'completed' ? 'green' : 'blue'}>{ins.status === 'completed' ? 'Finished' : 'In progress'}</Tag>
            {ins.status === 'completed' && <Tag color={ins.failed_count ? 'red' : 'green'}>Score {ins.percent ?? '-'}%{ins.failed_count ? `, ${ins.failed_count} failed` : ''}</Tag>}
          </Space>
          {edit && <Progress percent={req.length ? Math.round((100 * doneReq) / req.length) : 100} format={() => `${doneReq}/${req.length}`} style={{ marginBottom: 12 }} />}
          {missing.length > 0 && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="Answer these before finishing" description={<ul style={{ margin: 0, paddingLeft: 18 }}>{missing.map((m) => <li key={m}>{m}</li>)}</ul>} />}
          {sections(items).map((s) => (
            <div key={s.name}>
              <Title level={5} style={{ marginTop: 12 }}>{s.name}</Title>
              {s.items.map((it) => (
                <Question key={it.id} it={it} a={answers[it.id]} edit={edit} photos={photosFor(it.id)} people={people}
                  onAnswer={(p) => answer(it.id, p)} onPhoto={addPhoto} onRemovePhoto={removePhoto} />
              ))}
            </div>
          ))}
          {!edit && ins.note && <Card size="small" title="Summary" style={{ borderRadius: 12 }}>{ins.note}</Card>}
          {!edit && (ins.actions || []).length > 0 && (
            <Card size="small" title="Actions from this inspection" style={{ borderRadius: 12, marginTop: 12 }}>
              {ins.actions.map((a) => (
                <div key={a.id} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Tag color={PRIORITY[a.priority]}>{a.priority}</Tag> {a.title}
                  <div><Text type="secondary">{a.assignee || 'Not assigned'} · due {a.due_date || '-'} · </Text><Tag color={ACT_STATUS[a.status]}>{a.status}</Tag></div>
                </div>
              ))}
            </Card>
          )}
          {!edit && ins.signed_name && <Paragraph type="secondary" style={{ marginTop: 12 }}>Signed by {ins.signed_name} on {fmt(ins.completed_at)}</Paragraph>}
          {edit && (
            <div style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '12px 0', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button type="primary" size="large" icon={<CheckCircleOutlined />} onClick={() => { form.setFieldsValue({ signed_name: me().name || '' }); setFinishOpen(true); }}>
                Finish and sign
              </Button>
              {fails.length > 0 && <Text type="danger" style={{ alignSelf: 'center' }}>{fails.length} failed item(s) will become actions</Text>}
            </div>
          )}
          <Modal open={finishOpen} title="Finish and sign" onCancel={() => setFinishOpen(false)} onOk={finish} okText="Finish" confirmLoading={busy}>
            <Form form={form} layout="vertical">
              <Form.Item name="note" label="Summary (optional)"><Input.TextArea maxLength={4000} autoSize={{ minRows: 2, maxRows: 6 }} /></Form.Item>
              <Form.Item name="signed_name" label="Your name (signature)" rules={[{ required: true, min: 2, message: 'Type your name to sign.' }]}><Input maxLength={160} /></Form.Item>
              <Text type="secondary">After you finish, the answers are locked and kept as a record.</Text>
            </Form>
          </Modal>
        </>
      )}
    </Drawer>
  );
};

// ------------------------------------------------------------------ start an inspection
const StartModal = ({ open, lib, preset, onClose, onStarted }) => {
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) form.setFieldsValue({ ref: preset || undefined, title: '', site: '' }); }, [open, preset, form]);
  const options = [
    ...(lib?.company?.length ? [{ label: 'Your company checklists', options: lib.company.map((t) => ({ value: t.ref, label: `${t.name} (${t.count})` })) }] : []),
    { label: 'SafeTrack library', options: (lib?.library || []).map((t) => ({ value: t.ref, label: `${t.name} (${t.count})` })) },
  ];
  const go = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try { const d = (await inspectionService.start(v)).data; onStarted(d.id); } catch (e) { message.error(inspErr(e)); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} title="Start an inspection" onCancel={onClose} onOk={go} okText="Start" confirmLoading={busy}>
      <Form form={form} layout="vertical">
        <Form.Item name="ref" label="Checklist" rules={[{ required: true, message: 'Choose a checklist.' }]}>
          <Select showSearch optionFilterProp="label" options={options} placeholder="Choose a checklist" />
        </Form.Item>
        <Form.Item name="title" label="Title (optional)"><Input maxLength={200} placeholder="Uses the checklist name if empty" /></Form.Item>
        <Form.Item name="site" label="Site / area / equipment (optional)"><Input maxLength={200} placeholder="e.g. Workshop, Scaffold 3, Truck GT-1234" /></Form.Item>
      </Form>
    </Modal>
  );
};

// ------------------------------------------------------------------ to do
const ToDo = ({ refreshKey, onOpen, onStart, onStartSchedule }) => {
  const [drafts, setDrafts] = useState(null);
  const [due, setDue] = useState([]);
  useEffect(() => {
    inspectionService.list({ status: 'in_progress', mine: 1 }).then((r) => setDrafts(r?.data?.items || [])).catch(() => setDrafts([]));
    inspectionService.schedules(true).then((r) => setDue((r.data || []).filter((s) => s.active && s.due_in_days <= 7))).catch(() => setDue([]));
  }, [refreshKey]);
  if (drafts === null) return <Skeleton active />;
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title={<span><ScheduleOutlined /> Due soon</span>} style={{ borderRadius: 16 }} extra={<Button type="primary" icon={<PlusOutlined />} onClick={onStart}>Start inspection</Button>}>
          {due.length === 0 ? <Empty description="Nothing due in the next 7 days" /> : due.map((s) => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
              <div>
                <Text strong>{s.title}</Text>{s.site && <Text type="secondary"> · {s.site}</Text>}
                <div>{s.overdue ? <Tag color="red">{-s.due_in_days} day(s) overdue</Tag> : s.due_in_days === 0 ? <Tag color="orange">Due today</Tag> : <Tag>Due {s.next_due}</Tag>}</div>
              </div>
              <Button onClick={() => onStartSchedule(s.id)}>Start</Button>
            </div>
          ))}
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title={<span><ClockCircleOutlined /> Unfinished</span>} style={{ borderRadius: 16 }}>
          {drafts.length === 0 ? <Empty description="No unfinished inspections" /> : drafts.map((d) => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
              <div><Text strong>{d.title}</Text>{d.site && <Text type="secondary"> · {d.site}</Text>}<div><Text type="secondary">Started {fmt(d.started_at)}</Text></div></div>
              <Button type="primary" ghost onClick={() => onOpen(d.id)}>Continue</Button>
            </div>
          ))}
        </Card>
      </Col>
    </Row>
  );
};

// ------------------------------------------------------------------ history
const History = ({ refreshKey, staff, onOpen }) => {
  const [filters, setFilters] = useState({});
  const [state, setState] = useState({ loading: true, items: [], total: 0, page: 1 });
  const load = useCallback(async (page = 1) => {
    setState((s) => ({ ...s, loading: true }));
    try { const d = (await inspectionService.list({ ...filters, page })).data; setState({ loading: false, items: d.items, total: d.total, page }); } catch (e) { setState((s) => ({ ...s, loading: false })); message.error(inspErr(e)); }
  }, [filters]);
  useEffect(() => { load(1); }, [load, refreshKey]);
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space wrap style={{ marginBottom: 12 }}>
        <Select style={{ width: 160 }} value={filters.status || 'all'} onChange={(v) => setFilters((f) => ({ ...f, status: v === 'all' ? undefined : v }))}
          options={[{ value: 'all', label: 'All' }, { value: 'completed', label: 'Finished' }, { value: 'in_progress', label: 'In progress' }]} />
        <Checkbox checked={filters.failed === 1} onChange={(e) => setFilters((f) => ({ ...f, failed: e.target.checked ? 1 : undefined }))}>With failures</Checkbox>
        {staff && <Checkbox checked={filters.mine === 1} onChange={(e) => setFilters((f) => ({ ...f, mine: e.target.checked ? 1 : undefined }))}>Only mine</Checkbox>}
        <Input.Search allowClear placeholder="Search title or site" style={{ width: 220 }} maxLength={80} onSearch={(q) => setFilters((f) => ({ ...f, q }))} />
        <Button icon={<ReloadOutlined />} onClick={() => load(state.page)} aria-label="Reload" />
      </Space>
      <Table rowKey="id" size="middle" loading={state.loading} dataSource={state.items} scroll={{ x: 760 }}
        onRow={(r) => ({ onClick: () => onOpen(r.id), style: { cursor: 'pointer' } })}
        pagination={{ current: state.page, total: state.total, pageSize: 20, onChange: load, showSizeChanger: false }}
        locale={{ emptyText: <Empty description="No inspections yet" /> }}
        columns={[
          { title: 'Inspection', dataIndex: 'title', render: (v, r) => <div><Text strong>{v}</Text>{r.site && <div><Text type="secondary">{r.site}</Text></div>}</div> },
          { title: 'Inspector', dataIndex: 'inspector', width: 150 },
          { title: 'Result', width: 170, render: (_, r) => (r.status !== 'completed' ? <Tag color="blue">In progress</Tag> : (
            <Space size={4} wrap><Tag color={r.failed_count ? 'red' : 'green'}>{r.percent ?? '-'}%</Tag>{r.failed_count > 0 && <Tag color={r.critical_failed ? 'red' : 'orange'}>{r.failed_count} failed</Tag>}</Space>
          )) },
          { title: 'Date', dataIndex: 'completed_at', width: 170, render: (v, r) => fmt(v || r.started_at) },
        ]} />
    </Card>
  );
};

// ------------------------------------------------------------------ actions
const Actions = ({ refreshKey, people, onOpenInspection }) => {
  const [status, setStatus] = useState('open');
  const [mine, setMine] = useState(false);
  const [data, setData] = useState({ loading: true, rows: [], manage: false });
  const [doneFor, setDoneFor] = useState(null);
  const [note, setNote] = useState('');
  const load = useCallback(async () => {
    setData((d) => ({ ...d, loading: true }));
    try { const r = await inspectionService.actions(status, mine); setData({ loading: false, rows: r.data || [], manage: !!r.can_manage }); } catch (e) { setData((d) => ({ ...d, loading: false })); message.error(inspErr(e)); }
  }, [status, mine]);
  useEffect(() => { load(); }, [load, refreshKey]);
  const act = async (id, payload, ok) => {
    try { await inspectionService.updateAction(id, payload); message.success(ok); load(); return true; } catch (e) { message.error(inspErr(e)); return false; }
  };
  return (
    <Card style={{ borderRadius: 16 }}>
      <Space wrap style={{ marginBottom: 12 }}>
        <Radio.Group value={status} onChange={(e) => setStatus(e.target.value)} optionType="button"
          options={[{ value: 'open', label: 'Open' }, { value: 'done', label: 'Done, to verify' }, { value: 'verified', label: 'Verified' }, { value: 'all', label: 'All' }]} />
        {data.manage && <Checkbox checked={mine} onChange={(e) => setMine(e.target.checked)}>Only mine</Checkbox>}
      </Space>
      <Table rowKey="id" size="middle" loading={data.loading} dataSource={data.rows} scroll={{ x: 860 }} pagination={{ pageSize: 20, showSizeChanger: false }}
        locale={{ emptyText: <Empty description={status === 'open' ? 'No open actions' : 'Nothing here'} /> }}
        columns={[
          { title: 'Action', dataIndex: 'title', render: (v, r) => (
            <div>
              <Space size={4} wrap><Tag color={PRIORITY[r.priority]}>{r.priority}</Tag><Text strong>{v}</Text></Space>
              <div><Button type="link" size="small" style={{ padding: 0 }} onClick={() => onOpenInspection(r.inspection_id)}>{r.inspection_title || `Inspection ${r.inspection_id}`}</Button></div>
              {r.done_note && <div><Text type="secondary">Done: {r.done_note}</Text></div>}
            </div>
          ) },
          { title: 'Owner', dataIndex: 'assignee', width: 190, render: (v, r) => (data.manage && r.status === 'open' ? (
            <Select size="small" allowClear showSearch optionFilterProp="label" style={{ width: 170 }} placeholder="Not assigned" value={r.assignee_id || undefined}
              options={people.map((p) => ({ value: p.id, label: p.name }))} onChange={(val) => act(r.id, { op: 'edit', assignee_id: val || null }, 'Owner changed')} />
          ) : (v || <Text type="secondary">Not assigned</Text>)) },
          { title: 'Due', dataIndex: 'due_date', width: 150, render: (v, r) => (data.manage && r.status === 'open' ? (
            <DatePicker size="small" value={v ? dayjs(v) : null} status={r.overdue ? 'error' : undefined} onChange={(d) => act(r.id, { op: 'edit', due_date: d ? d.format('YYYY-MM-DD') : null }, 'Due date changed')} />
          ) : <span>{v || '-'} {r.overdue && <Tag color="red">Late</Tag>}</span>) },
          { title: 'Status', dataIndex: 'status', width: 100, render: (s) => <Tag color={ACT_STATUS[s]}>{s}</Tag> },
          { title: '', width: 190, render: (_, r) => (
            <Space wrap>
              {r.status === 'open' && <Button size="small" type="primary" onClick={() => { setDoneFor(r); setNote(''); }}>Mark done</Button>}
              {r.status === 'done' && data.manage && <Button size="small" onClick={() => act(r.id, { op: 'verify' }, 'Verified')}>Verify</Button>}
              {r.status !== 'open' && data.manage && <Button size="small" danger onClick={() => act(r.id, { op: 'reopen', note: 'Not fixed' }, 'Reopened')}>Reopen</Button>}
            </Space>
          ) },
        ]} />
      <Modal open={!!doneFor} title="What was done?" okText="Mark done" onCancel={() => setDoneFor(null)}
        onOk={async () => { if (await act(doneFor.id, { op: 'done', note }, 'Marked done. A supervisor will verify it.')) setDoneFor(null); }}>
        <Paragraph>{doneFor?.title}</Paragraph>
        <Input.TextArea value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} autoSize={{ minRows: 3, maxRows: 6 }} placeholder="e.g. Two new boards fitted and the scaffold re-tagged" />
      </Modal>
    </Card>
  );
};

// ------------------------------------------------------------------ checklist editor
const blankItem = () => ({ id: `n${Math.random().toString(36).slice(2, 8)}`, section: 'General', text: '', type: 'check', required: true, critical: false });

const TemplateEditor = ({ value, onClose, onSaved }) => {
  const [name, setName] = useState(value?.name || '');
  const [category, setCategory] = useState(value?.category || 'General');
  const [description, setDescription] = useState(value?.description || '');
  const [items, setItems] = useState(value?.items?.length ? value.items.map((i) => ({ ...i })) : [blankItem()]);
  const [busy, setBusy] = useState(false);
  const upd = (i, patch) => setItems((xs) => xs.map((x, n) => (n === i ? { ...x, ...patch } : x)));
  const move = (i, d) => setItems((xs) => { const ys = [...xs]; const j = i + d; if (j < 0 || j >= ys.length) return ys; [ys[i], ys[j]] = [ys[j], ys[i]]; return ys; });
  const save = async () => {
    setBusy(true);
    try { await inspectionService.saveTemplate({ name, category, description, items }, value?.id); message.success('Checklist saved'); onSaved(); } catch (e) { message.error(inspErr(e)); } finally { setBusy(false); }
  };
  return (
    <Drawer open width={Math.min(900, typeof window !== 'undefined' ? window.innerWidth : 900)} onClose={onClose} title={value?.id ? 'Edit checklist' : 'New checklist'}
      extra={<Button type="primary" loading={busy} onClick={save}>Save</Button>}>
      <Row gutter={12}>
        <Col xs={24} md={12}><Form.Item label="Name" required><Input value={name} maxLength={160} onChange={(e) => setName(e.target.value)} /></Form.Item></Col>
        <Col xs={24} md={12}><Form.Item label="Category"><Input value={category} maxLength={60} onChange={(e) => setCategory(e.target.value)} /></Form.Item></Col>
        <Col span={24}><Form.Item label="When to use it"><Input value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} /></Form.Item></Col>
      </Row>
      {items.map((it, i) => (
        <Card key={it.id} size="small" style={{ marginBottom: 8, borderRadius: 10 }}>
          <Row gutter={8}>
            <Col xs={24} md={6}><Input value={it.section} maxLength={80} placeholder="Section" onChange={(e) => upd(i, { section: e.target.value })} /></Col>
            <Col xs={24} md={18}><Input value={it.text} maxLength={300} placeholder={`Question ${i + 1}`} onChange={(e) => upd(i, { text: e.target.value })} /></Col>
          </Row>
          <Space wrap style={{ marginTop: 8 }}>
            <Select value={it.type} style={{ width: 150 }} onChange={(v) => upd(i, { type: v, critical: v === 'text' ? false : it.critical })}
              options={[{ value: 'check', label: 'Pass / Fail / N/A' }, { value: 'number', label: 'Number' }, { value: 'text', label: 'Text' }]} />
            {it.type === 'number' && (
              <>
                <InputNumber placeholder="Lowest safe" value={it.min} onChange={(v) => upd(i, { min: v })} style={{ width: 120 }} />
                <InputNumber placeholder="Highest safe" value={it.max} onChange={(v) => upd(i, { max: v })} style={{ width: 120 }} />
                <Input placeholder="Unit" value={it.unit || ''} maxLength={12} onChange={(e) => upd(i, { unit: e.target.value })} style={{ width: 80 }} />
              </>
            )}
            <Checkbox checked={it.required} onChange={(e) => upd(i, { required: e.target.checked })}>Required</Checkbox>
            {it.type !== 'text' && <Checkbox checked={it.critical} onChange={(e) => upd(i, { critical: e.target.checked })}>Critical</Checkbox>}
            <Button size="small" icon={<ArrowUpOutlined />} onClick={() => move(i, -1)} aria-label="Move up" />
            <Button size="small" icon={<ArrowDownOutlined />} onClick={() => move(i, 1)} aria-label="Move down" />
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setItems((xs) => xs.filter((_, n) => n !== i))} aria-label="Delete question" />
          </Space>
        </Card>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => setItems((xs) => [...xs, { ...blankItem(), section: xs[xs.length - 1]?.section || 'General' }])}>Add question</Button>
      <Paragraph type="secondary" style={{ marginTop: 12 }}>A failed critical item tells supervisors at once and gets an action due the next day.</Paragraph>
    </Drawer>
  );
};

const Checklists = ({ lib, onReload, onUse }) => {
  const [editing, setEditing] = useState(null);
  const copy = async (key) => {
    try { await inspectionService.saveTemplate({ copy_of: key }); message.success('Copied to your checklists. You can now change it.'); onReload(); } catch (e) { message.error(inspErr(e)); }
  };
  if (!lib) return <Skeleton active />;
  return (
    <>
      <Card title="Your company checklists" style={{ borderRadius: 16, marginBottom: 16 }} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>New checklist</Button>}>
        {lib.company.length === 0 ? <Empty description="None yet. Copy one from the library below or create your own." /> : (
          <Row gutter={[12, 12]}>
            {lib.company.map((t) => (
              <Col xs={24} md={12} xl={8} key={t.id}>
                <Card size="small" style={{ borderRadius: 12, height: '100%' }} title={t.name}
                  extra={<Space><Button size="small" icon={<EditOutlined />} onClick={() => setEditing(t)} aria-label="Edit" />
                    <Popconfirm title="Remove this checklist? Past inspections keep their copy." onConfirm={async () => { try { await inspectionService.archiveTemplate(t.id); onReload(); } catch (e) { message.error(inspErr(e)); } }}>
                      <Button size="small" danger icon={<DeleteOutlined />} aria-label="Remove" /></Popconfirm></Space>}>
                  <Text type="secondary">{t.category} · {t.count} questions</Text>
                  <div style={{ marginTop: 8 }}><Button size="small" onClick={() => onUse(t.ref)}>Use now</Button></div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
      <Card title="SafeTrack library" style={{ borderRadius: 16 }}>
        <Paragraph type="secondary">Good-practice starting points. Check them against your own procedures and local law, then copy and adapt.</Paragraph>
        <Row gutter={[12, 12]}>
          {lib.library.map((t) => (
            <Col xs={24} md={12} xl={8} key={t.key}>
              <Card size="small" style={{ borderRadius: 12, height: '100%' }} title={t.name}>
                <Paragraph type="secondary" style={{ marginBottom: 8 }}>{t.description}</Paragraph>
                <Text type="secondary">{t.category} · {t.count} questions</Text>
                <div style={{ marginTop: 8 }}><Space><Button size="small" onClick={() => onUse(t.ref)}>Use now</Button><Button size="small" icon={<CopyOutlined />} onClick={() => copy(t.key)}>Copy and edit</Button></Space></div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
      {editing && <TemplateEditor value={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onReload(); }} />}
    </>
  );
};

// ------------------------------------------------------------------ schedules
const Schedules = ({ lib, people, refreshKey }) => {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const load = useCallback(() => { inspectionService.schedules().then((r) => setRows(r.data || [])).catch((e) => { setRows([]); message.error(inspErr(e)); }); }, []);
  useEffect(() => { load(); }, [load, refreshKey]);
  const options = [
    ...(lib?.company?.length ? [{ label: 'Your company checklists', options: lib.company.map((t) => ({ value: t.ref, label: t.name })) }] : []),
    { label: 'SafeTrack library', options: (lib?.library || []).map((t) => ({ value: t.ref, label: t.name })) },
  ];
  const create = async () => {
    const v = await form.validateFields();
    try {
      await inspectionService.saveSchedule({ ...v, next_due: v.next_due.format('YYYY-MM-DD') });
      message.success('Schedule added'); setOpen(false); form.resetFields(); load();
    } catch (e) { message.error(inspErr(e)); }
  };
  return (
    <Card style={{ borderRadius: 16 }} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.setFieldsValue({ frequency: 'weekly', next_due: dayjs() }); setOpen(true); }}>New schedule</Button>}
      title="Scheduled inspections">
      <Table rowKey="id" size="middle" loading={rows === null} dataSource={rows || []} scroll={{ x: 760 }} pagination={{ pageSize: 20, showSizeChanger: false }}
        locale={{ emptyText: <Empty description="No schedules. Add one so nobody forgets a weekly or monthly check." /> }}
        columns={[
          { title: 'Inspection', dataIndex: 'title', render: (v, r) => <div><Text strong>{v}</Text>{r.site && <div><Text type="secondary">{r.site}</Text></div>}</div> },
          { title: 'How often', dataIndex: 'frequency', width: 130, render: (f) => (FREQ.find((x) => x[0] === f) || [f, f])[1] },
          { title: 'Who', dataIndex: 'assignee', width: 150, render: (v) => v || <Text type="secondary">Any supervisor</Text> },
          { title: 'Next due', dataIndex: 'next_due', width: 150, render: (v, r) => <span>{v} {r.overdue && <Tag color="red">Overdue</Tag>}{!r.active && <Tag>Paused</Tag>}</span> },
          { title: '', width: 150, render: (_, r) => (
            <Space>
              <Button size="small" onClick={async () => { try { await inspectionService.saveSchedule({ active: !r.active }, r.id); load(); } catch (e) { message.error(inspErr(e)); } }}>{r.active ? 'Pause' : 'Resume'}</Button>
              <Popconfirm title="Delete this schedule?" onConfirm={async () => { try { await inspectionService.removeSchedule(r.id); load(); } catch (e) { message.error(inspErr(e)); } }}>
                <Button size="small" danger icon={<DeleteOutlined />} aria-label="Delete schedule" />
              </Popconfirm>
            </Space>
          ) },
        ]} />
      <Modal open={open} title="New schedule" onCancel={() => setOpen(false)} onOk={create} okText="Add">
        <Form form={form} layout="vertical">
          <Form.Item name="ref" label="Checklist" rules={[{ required: true, message: 'Choose a checklist.' }]}><Select showSearch optionFilterProp="label" options={options} /></Form.Item>
          <Form.Item name="title" label="Title (optional)"><Input maxLength={200} placeholder="e.g. Extinguishers - workshop" /></Form.Item>
          <Form.Item name="site" label="Site / area (optional)"><Input maxLength={200} /></Form.Item>
          <Form.Item name="assignee_id" label="Who does it"><Select allowClear showSearch optionFilterProp="label" placeholder="Any supervisor" options={people.map((p) => ({ value: p.id, label: p.name }))} /></Form.Item>
          <Row gutter={8}>
            <Col span={12}><Form.Item name="frequency" label="How often" rules={[{ required: true }]}><Select options={FREQ.map(([value, label]) => ({ value, label }))} /></Form.Item></Col>
            <Col span={12}><Form.Item name="next_due" label="First due" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Text type="secondary">The person (or the supervisors) gets a reminder on the due day and each day it is overdue.</Text>
        </Form>
      </Modal>
    </Card>
  );
};

// ------------------------------------------------------------------ insights
const Insights = ({ refreshKey }) => {
  const [days, setDays] = useState(90);
  const [s, setS] = useState(null);
  useEffect(() => { setS(null); inspectionService.stats(days).then((r) => setS(r.data)).catch((e) => { setS({}); message.error(inspErr(e)); }); }, [days, refreshKey]);
  if (!s) return <Skeleton active />;
  const maxWeek = Math.max(1, ...(s.per_week || []).map((w) => w.count));
  return (
    <>
      <Space style={{ marginBottom: 12 }}><Select value={days} onChange={setDays} style={{ width: 160 }} options={[30, 90, 180, 365].map((d) => ({ value: d, label: `Last ${d} days` }))} /></Space>
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {[['Finished', s.completed], ['Average score', s.average_score === null || s.average_score === undefined ? '-' : `${s.average_score}%`],
          ['Critical findings', s.critical_findings, s.critical_findings ? '#cf1322' : undefined], ['Unfinished', s.in_progress],
          ['Overdue schedules', s.schedules_overdue, s.schedules_overdue ? '#cf1322' : undefined], ['Open actions', s.actions_open],
          ['Overdue actions', s.actions_overdue, s.actions_overdue ? '#cf1322' : undefined], ['To verify', s.actions_awaiting_verification],
          ['Avg days to fix', s.avg_days_to_close ?? '-']].map(([t, v, c]) => (
          <Col xs={12} sm={8} lg={6} xl={4} key={t}><Card size="small" style={{ borderRadius: 12 }}><Statistic title={t} value={v ?? 0} valueStyle={c ? { color: c } : undefined} /></Card></Col>
        ))}
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Items that fail most" size="small" style={{ borderRadius: 16 }}>
            {(s.top_failures || []).length === 0 ? <Empty description="No failed items in this period" /> : s.top_failures.map((f) => (
              <div key={f.text} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0' }}><span>{f.text}</span><Tag color="red">{f.count}</Tag></div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="By checklist" size="small" style={{ borderRadius: 16 }}>
            {(s.by_checklist || []).length === 0 ? <Empty description="No finished inspections yet" /> : s.by_checklist.map((b) => (
              <div key={b.title} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{b.title} ({b.count})</span><b>{b.percent ?? '-'}%</b></div>
                <Progress percent={b.percent || 0} showInfo={false} size="small" strokeColor={b.percent >= 90 ? '#52c41a' : b.percent >= 75 ? '#faad14' : '#ff4d4f'} />
              </div>
            ))}
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Inspections finished per week" size="small" style={{ borderRadius: 16 }}>
            {(s.per_week || []).length === 0 ? <Empty description="No data yet" /> : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, overflowX: 'auto' }}>
                {s.per_week.map((w) => (
                  <div key={w.week} title={`Week of ${w.week}: ${w.count}`} style={{ textAlign: 'center', minWidth: 28 }}>
                    <div style={{ height: Math.round((110 * w.count) / maxWeek), background: '#1677ff', borderRadius: 4 }} />
                    <div style={{ fontSize: 10, color: '#888' }}>{w.week.slice(5)}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

// ------------------------------------------------------------------ page
const InspectionsPage = () => {
  const location = useLocation();
  const history = useHistory();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [lib, setLib] = useState(null);
  const [people, setPeople] = useState([]);
  const [noCompany, setNoCompany] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [preset, setPreset] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const tab = params.get('tab') || 'todo';
  const openId = params.get('open');
  const eqParam = params.get('eq');
  const openEq = eqParam && /^\d+$/.test(eqParam) ? Number(eqParam) : null;

  const loadLib = useCallback(() => {
    inspectionService.library().then((r) => setLib(r.data)).catch((e) => {
      if (e?.status === 403) setNoCompany(true); else message.error(inspErr(e));
      setLib({ company: [], library: [], can_manage: false });
    });
  }, []);
  useEffect(() => { loadLib(); inspectionService.people().then((r) => setPeople(r.data || [])).catch(() => {}); }, [loadLib]);

  const setParam = (k, v) => {
    const p = new URLSearchParams(location.search);
    if (v) p.set(k, v); else p.delete(k);
    history.replace({ search: p.toString() });
  };
  const openInspection = (id) => setParam('open', id);
  const closeInspection = useCallback(() => {
    const p = new URLSearchParams(location.search); p.delete('open'); history.replace({ search: p.toString() }); setRefreshKey((k) => k + 1);
  }, [location.search, history]);
  const startFrom = (ref) => { setPreset(ref); setStartOpen(true); };
  const startSchedule = async (sid) => {
    try { const d = (await inspectionService.start({ schedule_id: sid })).data; openInspection(d.id); } catch (e) { message.error(inspErr(e)); }
  };

  const staff = !!lib?.can_manage;
  if (noCompany) {
    return (
      <div style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
        <Card style={{ borderRadius: 16 }}><Empty description="Inspections are set up per company, and this account does not belong to a company." /></Card>
      </div>
    );
  }
  const items = [
    { key: 'todo', label: <span><ScheduleOutlined /> To do</span>, children: <ToDo refreshKey={refreshKey} onOpen={openInspection} onStart={() => startFrom(null)} onStartSchedule={startSchedule} /> },
    { key: 'history', label: <span><UnorderedListOutlined /> Inspections</span>, children: <History refreshKey={refreshKey} staff={staff} onOpen={openInspection} /> },
    { key: 'actions', label: <span><ToolOutlined /> Actions</span>, children: <Actions refreshKey={refreshKey} people={people} onOpenInspection={openInspection} /> },
    { key: 'equipment', label: <span><QrcodeOutlined /> Equipment</span>, children: <EquipmentRegister lib={lib} openEq={openEq} setOpenEq={(id) => setParam('eq', id)} onOpenInspection={openInspection} refreshKey={refreshKey} /> },
    { key: 'checklists', label: <span><SnippetsOutlined /> Checklists</span>, children: staff ? <Checklists lib={lib} onReload={loadLib} onUse={startFrom} /> : (
      <Card style={{ borderRadius: 16 }}>
        <Row gutter={[12, 12]}>
          {[...(lib?.company || []), ...(lib?.library || [])].map((t) => (
            <Col xs={24} md={12} xl={8} key={t.ref}><Card size="small" style={{ borderRadius: 12 }} title={t.name}><Text type="secondary">{t.count} questions</Text>
              <div style={{ marginTop: 8 }}><Button size="small" onClick={() => startFrom(t.ref)}>Use now</Button></div></Card></Col>
          ))}
        </Row>
      </Card>
    ) },
    ...(staff ? [
      { key: 'schedules', label: <span><ClockCircleOutlined /> Schedules</span>, children: <Schedules lib={lib} people={people} refreshKey={refreshKey} /> },
      { key: 'insights', label: <span><BarChartOutlined /> Insights</span>, children: <Insights refreshKey={refreshKey} /> },
    ] : []),
  ];
  return (
    <div className="inspections-page" style={{ padding: 16, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Inspections & checklists</Title>
          <Text type="secondary">Check it, photograph it, sign it. Failed items become actions with an owner and a due date.</Text>
        </div>
        <Badge dot={false}><Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => startFrom(null)}>Start inspection</Button></Badge>
      </div>
      <Tabs activeKey={items.some((i) => i.key === tab) ? tab : 'todo'} onChange={(k) => setParam('tab', k)} items={items} />
      <StartModal open={startOpen} lib={lib} preset={preset} onClose={() => setStartOpen(false)} onStarted={(id) => { setStartOpen(false); openInspection(id); }} />
      {openId && /^\d+$/.test(openId) && <InspectionDrawer key={openId} id={Number(openId)} people={people} onClose={closeInspection} onChanged={() => setRefreshKey((k) => k + 1)} />}
    </div>
  );
};

export default InspectionsPage;
