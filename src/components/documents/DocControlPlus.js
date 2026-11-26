// Document control plus: required reading (read & acknowledge with an optional quiz), numbered controlled copies with
// point-of-use QR codes, and change requests. Backend: /api/doc-control/* (app.py "DOCUMENT CONTROL PLUS").
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Button, Card, Checkbox, DatePicker, Empty, Form, Input, InputNumber, Modal, Progress, Radio, Select, Space, Table, Tabs, Tag,
  Typography, message,
} from 'antd';
import { CheckCircleOutlined, DownloadOutlined, PlusOutlined, PrinterOutlined, QrcodeOutlined, ReloadOutlined } from '@ant-design/icons';
import docControlService, { errorText } from '../../services/docControlService';

const { Text, Paragraph } = Typography;
const day = (s) => (s ? new Date(/[zZ]|[+-]\d\d:\d\d$/.test(s) ? s : `${s}Z`).toLocaleDateString() : '');

const DocPicker = ({ documents, value, onChange, style }) => (
  <Select showSearch allowClear placeholder="Choose a document" value={value} onChange={onChange} style={{ minWidth: 260, ...style }}
    optionFilterProp="label" aria-label="Document"
    options={(documents || []).map((d) => ({ value: d.id, label: `${d.title}${d.version ? ` (v${d.version})` : ''}` }))} />
);

// ============================================================ REQUIRED READING
const QuizEditor = ({ value = [], onChange }) => {
  const set = (i, patch) => onChange(value.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  return (
    <div>
      {value.map((q, i) => (
        <Card key={i} size="small" style={{ marginBottom: 8 }} title={`Question ${i + 1}`}
          extra={<Button size="small" danger type="link" onClick={() => onChange(value.filter((_, j) => j !== i))}>Remove</Button>}>
          <Input placeholder="Question" value={q.question} onChange={(e) => set(i, { question: e.target.value })} style={{ marginBottom: 6 }} />
          <Radio.Group value={q.answer} onChange={(e) => set(i, { answer: e.target.value })} style={{ width: '100%' }}>
            {(q.options || []).map((o, k) => (
              <div key={k} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                <Radio value={k} aria-label={`Correct answer ${k + 1}`} />
                <Input size="small" placeholder={`Answer ${k + 1}`} value={o}
                  onChange={(e) => set(i, { options: q.options.map((x, m) => (m === k ? e.target.value : x)) })} />
              </div>
            ))}
          </Radio.Group>
          {(q.options || []).length < 5 && (
            <Button size="small" type="link" onClick={() => set(i, { options: [...(q.options || []), ''] })}>Add an answer</Button>
          )}
          <Text type="secondary" style={{ fontSize: 12 }}> Select the circle next to the correct answer.</Text>
        </Card>
      ))}
      {value.length < 10 && (
        <Button size="small" icon={<PlusOutlined />} onClick={() => onChange([...value, { question: '', options: ['', ''], answer: 0 }])}>Add a question</Button>
      )}
    </div>
  );
};

const MyReading = ({ onOpenDocument }) => {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => docControlService.myReading().then((r) => setRows(r.data || [])).catch((e) => { setRows([]); message.error(errorText(e)); }), []);
  useEffect(() => { load(); }, [load]);
  const submit = async () => {
    setBusy(true);
    try {
      const r = await docControlService.acknowledge(open.assignment_id, answers);
      if (r.passed === false) { message.warning(r.error); } else { message.success('Thank you. Your acknowledgement is recorded.'); setOpen(null); load(); }
    } catch (e) { message.error(errorText(e)); } finally { setBusy(false); }
  };
  if (rows === null) return <Card loading />;
  return (
    <>
      {!rows.length && <Empty description="Nothing to read right now" />}
      {rows.map((r) => (
        <Card key={r.assignment_id} size="small" style={{ marginBottom: 8 }}>
          <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Text strong>{r.document_title}</Text> <Tag>version {r.document_version}</Tag>
              {r.status === 'acknowledged' ? <Tag color="green" icon={<CheckCircleOutlined />}>Read {day(r.acknowledged_at)}</Tag>
                : r.due_date && <Tag color={new Date(r.due_date) < new Date() ? 'red' : 'orange'}>Due {day(r.due_date)}</Tag>}
              {r.message && <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>{r.message}</Paragraph>}
            </div>
            <Space>
              <Button onClick={() => onOpenDocument && onOpenDocument(r.document_id)}>Open document</Button>
              {r.status !== 'acknowledged' && (
                <Button type="primary" onClick={() => { setOpen(r); setAnswers(r.quiz.map(() => null)); setConfirm(false); }}>
                  {r.quiz.length ? 'Answer and confirm' : 'Confirm I have read it'}
                </Button>
              )}
            </Space>
          </Space>
        </Card>
      ))}
      <Modal open={!!open} title={open?.document_title} onCancel={() => setOpen(null)} okText="Submit" confirmLoading={busy}
        okButtonProps={{ disabled: !confirm || answers.some((a) => a === null) }} onOk={submit}>
        {open?.quiz.map((q, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <Text strong>{i + 1}. {q.question}</Text>
            <Radio.Group value={answers[i]} onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))}
              style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
              {q.options.map((o, k) => <Radio key={k} value={k}>{o}</Radio>)}
            </Radio.Group>
          </div>
        ))}
        {open?.quiz.length > 0 && <Text type="secondary">Pass mark: {open.pass_mark}%. {open.attempts ? `Attempts so far: ${open.attempts}.` : ''}</Text>}
        <div style={{ marginTop: 12 }}>
          <Checkbox checked={confirm} onChange={(e) => setConfirm(e.target.checked)}>I have read and understood this document</Checkbox>
        </div>
      </Modal>
    </>
  );
};

const ManageReading = ({ documents }) => {
  const [rows, setRows] = useState([]);
  const [people, setPeople] = useState([]);
  const [show, setShow] = useState(false);
  const [detail, setDetail] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [form] = Form.useForm();
  const load = useCallback(() => docControlService.readRequests().then((r) => setRows(r.data || [])).catch(() => setRows([])), []);
  useEffect(() => { load(); docControlService.people().then((r) => setPeople(r.data || [])).catch(() => {}); }, [load]);
  const create = async (v) => {
    try {
      const r = await docControlService.assignReading({ document_id: v.document_id, user_ids: v.everyone ? [] : v.user_ids, everyone: !!v.everyone,
        due_date: v.due_date ? v.due_date.format('YYYY-MM-DD') : null, message: v.message, quiz, pass_mark: v.pass_mark ?? 80 });
      message.success(`Sent to ${r.assigned} people${r.quiz_questions ? ` with ${r.quiz_questions} quiz questions` : ''}`);
      setShow(false); form.resetFields(); setQuiz([]); load();
    } catch (e) { message.error(errorText(e)); }
  };
  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>Assign reading</Button>
        <Button icon={<ReloadOutlined />} onClick={load} aria-label="Refresh" />
      </Space>
      <Table rowKey="id" size="small" dataSource={rows} scroll={{ x: 700 }} pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No reading assigned yet' }}
        columns={[
          { title: 'Document', dataIndex: 'document_title', render: (t, r) => <>{t} <Tag>v{r.document_version}</Tag>{r.current_version > r.document_version && <Tag color="orange">newer version exists</Tag>}</> },
          { title: 'Progress', render: (_, r) => <div style={{ minWidth: 140 }}><Progress percent={r.percent} size="small" />{r.acknowledged} of {r.assigned}</div> },
          { title: 'Due', render: (_, r) => (r.due_date ? <>{day(r.due_date)} {r.overdue > 0 && <Tag color="red">{r.overdue} late</Tag>}</> : '') },
          { title: 'Quiz', dataIndex: 'quiz_questions', render: (n, r) => (n ? `${n} questions, pass ${r.pass_mark}%` : 'No') },
          { title: '', render: (_, r) => <Space>
            <Button size="small" onClick={() => docControlService.readRequest(r.id).then((d) => setDetail(d.data))}>Who has read it</Button>
            <Button size="small" onClick={() => docControlService.remind(r.id).then((x) => message.success(`Reminded ${x.reminded} people`)).catch((e) => message.error(errorText(e)))}>Remind</Button>
          </Space> },
        ]} />
      <Modal open={show} title="Assign required reading" onCancel={() => setShow(false)} onOk={() => form.submit()} okText="Send" width={640}>
        <Form form={form} layout="vertical" onFinish={create} initialValues={{ pass_mark: 80 }}>
          <Form.Item name="document_id" label="Document" rules={[{ required: true, message: 'Choose a document' }]}><DocPicker documents={documents} /></Form.Item>
          <Form.Item name="everyone" valuePropName="checked"><Checkbox>Everyone in the company</Checkbox></Form.Item>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => !getFieldValue('everyone') && (
              <Form.Item name="user_ids" label="People" rules={[{ required: true, message: 'Choose people or tick Everyone' }]}>
                <Select mode="multiple" optionFilterProp="label" placeholder="Choose people" options={people.map((p) => ({ value: p.id, label: `${p.name}${p.role ? ` (${p.role})` : ''}` }))} />
              </Form.Item>
            )}
          </Form.Item>
          <Space wrap>
            <Form.Item name="due_date" label="Read by"><DatePicker /></Form.Item>
            <Form.Item name="pass_mark" label="Quiz pass mark (%)"><InputNumber min={0} max={100} /></Form.Item>
          </Space>
          <Form.Item name="message" label="Message (optional)"><Input.TextArea rows={2} maxLength={2000} /></Form.Item>
          <Form.Item label="Short quiz (optional)"><QuizEditor value={quiz} onChange={setQuiz} /></Form.Item>
        </Form>
      </Modal>
      <Modal open={!!detail} title={detail?.document_title} footer={null} onCancel={() => setDetail(null)} width={640}>
        <Table rowKey="user_id" size="small" pagination={false} dataSource={detail?.people || []} scroll={{ x: 480 }}
          columns={[{ title: 'Person', dataIndex: 'name' },
            { title: 'Status', render: (_, p) => (p.status === 'acknowledged' ? <Tag color="green">Read {day(p.acknowledged_at)}</Tag> : <Tag>Not yet</Tag>) },
            { title: 'Quiz', render: (_, p) => (p.quiz_score != null ? `${p.quiz_score}% (${p.attempts} tries)` : '') }]} />
      </Modal>
    </>
  );
};

export const RequiredReading = ({ documents, canManage, onOpenDocument }) => (
  <Card title="Required reading" size="small">
    <Paragraph type="secondary">People confirm they have read and understood a document, with an optional short quiz. Each confirmation is recorded with the version and time.</Paragraph>
    <Tabs items={[
      { key: 'mine', label: 'My reading', children: <MyReading onOpenDocument={onOpenDocument} /> },
      ...(canManage ? [{ key: 'manage', label: 'Assign and track', children: <ManageReading documents={documents} /> }] : []),
    ]} />
  </Card>
);

// ============================================================ CONTROLLED COPIES + QR
export const ControlledCopies = ({ documents }) => {
  const [docId, setDocId] = useState(null);
  const [rows, setRows] = useState([]);
  const [register, setRegister] = useState(null);
  const [qr, setQr] = useState(null);
  const [form] = Form.useForm();
  const loadRegister = useCallback(() => docControlService.copyRegister().then(setRegister).catch(() => setRegister({ data: [] })), []);
  const loadDoc = useCallback((id) => (id ? docControlService.copies(id).then((r) => setRows(r.data || [])).catch(() => setRows([])) : setRows([])), []);
  useEffect(() => { loadRegister(); }, [loadRegister]);
  useEffect(() => { loadDoc(docId); }, [docId, loadDoc]);
  const issue = async (v) => {
    try {
      await docControlService.issueCopy(docId, v);
      message.success('Copy issued. Download it to print.');
      form.resetFields(); loadDoc(docId); loadRegister();
    } catch (e) { message.error(errorText(e)); }
  };
  const showQr = async () => {
    try {
      const [info, img] = await Promise.all([docControlService.qr(docId), docControlService.qrImage(docId)]);
      setQr({ ...info, img });
    } catch (e) { message.error(errorText(e)); }
  };
  const copyCols = (withDoc) => [
    ...(withDoc ? [{ title: 'Document', dataIndex: 'document_title' }] : []),
    { title: 'Copy', dataIndex: 'copy_number', width: 70, render: (n) => `No. ${n}` },
    { title: 'Holder', render: (_, c) => <>{c.holder}{c.location && <Text type="secondary"> · {c.location}</Text>}</> },
    { title: 'Version', render: (_, c) => `v${c.document_version}` },
    { title: 'Status', render: (_, c) => (c.needs_withdrawal ? <Tag color="red">Superseded: collect and withdraw</Tag>
      : c.status === 'withdrawn' ? <Tag>Withdrawn {day(c.withdrawn_at)}</Tag> : <Tag color="green">Issued {day(c.issued_at)}</Tag>) },
    { title: '', render: (_, c) => <Space>
      {c.status === 'issued' && !c.needs_withdrawal && <Button size="small" icon={<DownloadOutlined />} onClick={() => docControlService.downloadCopy(c.id).catch((e) => message.error(errorText(e)))}>PDF</Button>}
      {c.status !== 'withdrawn' && <Button size="small" onClick={() => docControlService.withdrawCopy(c.id).then(() => { message.success('Withdrawn'); loadDoc(docId); loadRegister(); })}>Withdraw</Button>}
    </Space> },
  ];
  return (
    <Card title="Controlled copies and QR codes" size="small">
      <Paragraph type="secondary">Issue numbered printed copies. Each page is stamped with the copy number, holder, version and a QR code that opens the current version. When a new version is published, old copies are flagged for withdrawal.</Paragraph>
      {register?.needs_withdrawal > 0 && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message={`${register.needs_withdrawal} printed cop${register.needs_withdrawal === 1 ? 'y is' : 'ies are'} out of date and should be collected`} />}
      <Space wrap style={{ marginBottom: 12 }}>
        <DocPicker documents={documents} value={docId} onChange={setDocId} />
        <Button icon={<QrcodeOutlined />} disabled={!docId} onClick={showQr}>QR label for this document</Button>
      </Space>
      {docId && (
        <>
          <Form form={form} layout="inline" onFinish={issue} style={{ marginBottom: 12, rowGap: 8 }}>
            <Form.Item name="holder" rules={[{ required: true, message: 'Who holds the copy?' }]}><Input placeholder="Holder (person, team or board)" /></Form.Item>
            <Form.Item name="location"><Input placeholder="Location (optional)" /></Form.Item>
            <Button type="primary" htmlType="submit" icon={<PrinterOutlined />}>Issue copy</Button>
          </Form>
          <Table rowKey="id" size="small" dataSource={rows} columns={copyCols(false)} pagination={false} scroll={{ x: 620 }} locale={{ emptyText: 'No copies issued for this document' }} />
        </>
      )}
      <Typography.Title level={5} style={{ marginTop: 16 }}>All copies in the company</Typography.Title>
      <Table rowKey="id" size="small" dataSource={register?.data || []} columns={copyCols(true)} pagination={{ pageSize: 10 }} scroll={{ x: 760 }} locale={{ emptyText: 'No controlled copies yet' }} />
      <Modal open={!!qr} title="Point-of-use QR label" footer={null} onCancel={() => { if (qr?.img) URL.revokeObjectURL(qr.img); setQr(null); }}>
        {qr && (
          <div style={{ textAlign: 'center' }}>
            <img src={qr.img} alt={`QR code for ${qr.title}`} style={{ width: 220, height: 220 }} />
            <Paragraph strong style={{ marginTop: 8 }}>{qr.title}</Paragraph>
            <Paragraph type="secondary" copyable={{ text: qr.url }}>Scanning opens the current version after sign-in. Scanned {qr.scans} times.</Paragraph>
            <a href={qr.img} download={`qr-${qr.title}.png`}><Button icon={<DownloadOutlined />}>Download label</Button></a>
          </div>
        )}
      </Modal>
    </Card>
  );
};

// ============================================================ CHANGE REQUESTS
const STATUS_COLOR = { open: 'blue', approved: 'gold', rejected: 'red', implemented: 'green' };

export const ChangeRequests = ({ documents }) => {
  const [data, setData] = useState({ data: [], can_decide: false });
  const [status, setStatus] = useState('');
  const [show, setShow] = useState(false);
  const [decide, setDecide] = useState(null);
  const [note, setNote] = useState('');
  const [form] = Form.useForm();
  const load = useCallback(() => docControlService.changeRequests(status ? { status } : {}).then(setData).catch(() => setData({ data: [] })), [status]);
  useEffect(() => { load(); }, [load]);
  const create = async (v) => {
    try {
      const r = await docControlService.createChangeRequest(v);
      message.success(`${r.data.number} sent to the document owners`);
      setShow(false); form.resetFields(); load();
    } catch (e) { message.error(errorText(e)); }
  };
  const act = async (decision) => {
    try {
      await docControlService.decide(decide.id, decision, note);
      message.success(`Marked ${decision}`); setDecide(null); setNote(''); load();
    } catch (e) { message.error(errorText(e)); }
  };
  return (
    <Card title="Change requests" size="small">
      <Paragraph type="secondary">Anyone can ask for a document to be changed and say why. The document owners approve or reject, and mark it done when the new version is published.</Paragraph>
      <Space wrap style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShow(true)}>Request a change</Button>
        <Select value={status} onChange={setStatus} style={{ width: 160 }} aria-label="Status"
          options={[{ value: '', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'implemented', label: 'Done' }]} />
      </Space>
      <Table rowKey="id" size="small" dataSource={data.data} scroll={{ x: 760 }} pagination={{ pageSize: 10 }} locale={{ emptyText: 'No change requests' }}
        expandable={{ expandedRowRender: (r) => <div><Paragraph><b>Why:</b> {r.reason}</Paragraph>{r.proposed_change && <Paragraph><b>Proposed change:</b> {r.proposed_change}</Paragraph>}{r.decision_note && <Paragraph><b>Decision note:</b> {r.decision_note}</Paragraph>}</div> }}
        columns={[
          { title: 'No.', dataIndex: 'number', width: 120 },
          { title: 'Request', render: (_, r) => <><Text strong>{r.title}</Text><br /><Text type="secondary">{r.document_title}</Text></> },
          { title: 'Priority', dataIndex: 'priority', render: (p) => <Tag color={p === 'urgent' ? 'red' : p === 'high' ? 'orange' : undefined}>{p}</Tag> },
          { title: 'By', render: (_, r) => <>{r.requested_by}<br /><Text type="secondary">{day(r.requested_at)}</Text></> },
          { title: 'Status', render: (_, r) => <Tag color={STATUS_COLOR[r.status]}>{r.status === 'implemented' ? `done in v${r.implemented_version}` : r.status}</Tag> },
          ...(data.can_decide ? [{ title: '', render: (_, r) => ((r.status === 'open' || r.status === 'approved')
            ? <Button size="small" onClick={() => { setDecide(r); setNote(''); }}>{r.status === 'open' ? 'Decide' : 'Mark done'}</Button> : null) }] : []),
        ]} />
      <Modal open={show} title="Request a change" onCancel={() => setShow(false)} onOk={() => form.submit()} okText="Send">
        <Form form={form} layout="vertical" onFinish={create} initialValues={{ priority: 'normal' }}>
          <Form.Item name="document_id" label="Document" rules={[{ required: true, message: 'Choose a document' }]}><DocPicker documents={documents} /></Form.Item>
          <Form.Item name="title" label="What should change?" rules={[{ required: true, message: 'Required' }]}><Input maxLength={255} /></Form.Item>
          <Form.Item name="reason" label="Why?" rules={[{ required: true, message: 'Required' }]}><Input.TextArea rows={3} maxLength={5000} /></Form.Item>
          <Form.Item name="proposed_change" label="Proposed wording (optional)"><Input.TextArea rows={3} maxLength={10000} /></Form.Item>
          <Form.Item name="priority" label="Priority"><Radio.Group options={['low', 'normal', 'high', 'urgent'].map((p) => ({ value: p, label: p }))} /></Form.Item>
        </Form>
      </Modal>
      <Modal open={!!decide} title={decide ? `${decide.number}: ${decide.title}` : ''} onCancel={() => setDecide(null)}
        footer={decide?.status === 'open'
          ? [<Button key="r" danger onClick={() => act('rejected')}>Reject</Button>, <Button key="a" type="primary" onClick={() => act('approved')}>Approve</Button>]
          : [<Button key="d" type="primary" onClick={() => act('implemented')}>The new version is published</Button>]}>
        {decide && <Paragraph>{decide.reason}</Paragraph>}
        {decide?.status === 'open' && <Input.TextArea rows={3} placeholder="Note to the requester (required to reject)" value={note} onChange={(e) => setNote(e.target.value)} />}
      </Modal>
    </Card>
  );
};
