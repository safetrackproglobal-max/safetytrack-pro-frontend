// src/components/submissions/SubmitForApproval.js
// "Send for approval": choose people in signing order (colleagues or client reviewers),
// what each must do (sign / stamp / both / review), a message and an optional due date.
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal, Form, Input, Select, Button, Space, DatePicker, Alert, Typography, Tag, Empty, message, Tooltip, Steps,
} from 'antd';
import {
  PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, TeamOutlined, UserOutlined, SendOutlined,
} from '@ant-design/icons';
import submissionService from '../../services/submissionService';
import documentService from '../../services/documentService';
import './Submissions.css';

const { Text } = Typography;
export const ACTION_OPTIONS = [
  { value: 'sign', label: 'Sign' },
  { value: 'stamp', label: 'Stamp' },
  { value: 'sign_and_stamp', label: 'Sign and stamp' },
  { value: 'review', label: 'Review only (no signature)' },
];

function SubmitForApproval({ open, document: presetDocument, onClose, onSubmitted }) {
  const [options, setOptions] = useState({ internal: [], clients: [] });
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [docs, setDocs] = useState([]);
  const [docSearch, setDocSearch] = useState('');
  const [documentId, setDocumentId] = useState(presetDocument?.id || null);
  const [signers, setSigners] = useState([{ user_id: null, action: 'sign' }]);
  const [title, setTitle] = useState(presetDocument?.title || '');
  const [note, setNote] = useState('');
  const [due, setDue] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDocumentId(presetDocument?.id || null);
    setTitle(presetDocument?.title || '');
    setSigners([{ user_id: null, action: 'sign' }]);
    setNote(''); setDue(null);
    setLoadingPeople(true);
    submissionService.signerOptions()
      .then((d) => setOptions({ internal: d.internal || [], clients: d.clients || [] }))
      .catch((e) => message.error(e.message))
      .finally(() => setLoadingPeople(false));
    // reset only when the window opens or the document changes (not on every parent render)
    // eslint-disable-next-line
  }, [open, presetDocument?.id]);

  useEffect(() => {
    if (!open || presetDocument) return undefined;
    const t = setTimeout(async () => {
      try {
        const res = await documentService.getDocuments({ search: docSearch, per_page: 30 });
        setDocs(res.documents || res.data?.documents || []);
      } catch (e) { setDocs([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [open, presetDocument, docSearch]); // eslint-disable-line

  const people = useMemo(() => {
    const map = {};
    options.internal.forEach((p) => { map[p.user_id] = { ...p, group: 'My company' }; });
    options.clients.forEach((c) => c.members.forEach((m) => { map[m.user_id] = { ...m, group: c.name, client: true }; }));
    return map;
  }, [options]);

  const personOptions = useMemo(() => {
    const groups = [{
      label: <span><UserOutlined /> My colleagues</span>,
      options: options.internal.map((p) => ({ value: p.user_id, label: `${p.name}${p.is_me ? ' (me)' : ''} — ${p.email}` })),
    }];
    options.clients.forEach((c) => {
      if (!c.members.length) return;
      groups.push({
        label: <span><TeamOutlined /> Client: {c.name}{c.project_name ? ` · ${c.project_name}` : ''}</span>,
        options: c.members.map((m) => ({
          value: m.user_id,
          label: `${m.name}${m.job_title ? `, ${m.job_title}` : ''} — ${m.email}${m.status === 'invited' ? ' (invitation not accepted yet)' : ''}`,
        })),
      });
    });
    return groups;
  }, [options]);

  const update = (i, patch) => setSigners((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i, d) => setSigners((s) => {
    const n = [...s]; const j = i + d;
    if (j < 0 || j >= n.length) return s;
    [n[i], n[j]] = [n[j], n[i]];
    return n;
  });

  const submit = async () => {
    if (!documentId) { message.warning('Choose the document to send.'); return; }
    const chosen = signers.filter((s) => s.user_id);
    if (!chosen.length) { message.warning('Choose at least one person to sign or review.'); return; }
    if (new Set(chosen.map((s) => s.user_id)).size !== chosen.length) { message.warning('The same person is listed twice.'); return; }
    setSending(true);
    try {
      const res = await submissionService.create({
        document_id: documentId,
        title: title.trim() || undefined,
        message: note.trim() || undefined,
        due_date: due ? due.endOf('day').toISOString() : undefined,
        signers: chosen.map((s) => ({ user_id: s.user_id, action: s.action })),
      });
      message.success(res.message || 'Sent for approval');
      onSubmitted?.(res.submission);
      onClose?.();
    } catch (e) {
      message.error(e.code === 'FEATURE_NOT_AVAILABLE' ? 'Approval workflows are available on the Professional plan and above.' : e.message, 6);
    } finally {
      setSending(false);
    }
  };

  const noClients = !options.clients.some((c) => c.members.length);

  return (
    <Modal open={open} onCancel={onClose} width={760} title={<Space><SendOutlined /> Send for approval</Space>}
      okText="Send now" onOk={submit} confirmLoading={sending} destroyOnClose>
      <Steps size="small" className="sb-howto" items={[
        { title: 'Choose document', description: 'PDF, image or editor document' },
        { title: 'Add people in order', description: 'They are emailed one after another' },
        { title: 'Get notified', description: 'Email when approved or rejected' },
      ]} />
      <Form layout="vertical">
        {!presetDocument ? (
          <Form.Item label="Document" required>
            <Select showSearch value={documentId} placeholder="Search your documents…" filterOption={false}
              onSearch={setDocSearch} onChange={(v) => { setDocumentId(v); const d = docs.find((x) => x.id === v); if (d && !title) setTitle(d.title); }}
              options={docs.map((d) => ({ value: d.id, label: `${d.title}${d.version ? ` (v${d.version})` : ''}` }))}
              notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No documents found" />} />
          </Form.Item>
        ) : (
          <Alert type="info" showIcon style={{ marginBottom: 12 }} message={<span>Document: <b>{presetDocument.title}</b></span>} />
        )}
        <Form.Item label="Title shown to signers" extra="For example: “Hot Work Permit — Area 3 — for approval”">
          <Input value={title} maxLength={255} onChange={(e) => setTitle(e.target.value)} placeholder="Uses the document title if empty" />
        </Form.Item>

        <Form.Item label="Who must approve (in this order)" required
          extra="The first person gets an email straight away. Each next person is emailed only after the previous one approves.">
          <Space direction="vertical" style={{ width: '100%' }}>
            {signers.map((s, i) => (
              <Space key={i} wrap style={{ width: '100%' }} align="start">
                <Tag color="blue" style={{ marginTop: 5 }}>{i + 1}</Tag>
                <Select showSearch style={{ width: 340, maxWidth: '78vw' }} loading={loadingPeople} value={s.user_id}
                  placeholder="Choose a person" optionFilterProp="label" options={personOptions}
                  onChange={(v) => update(i, { user_id: v })} />
                <Select style={{ width: 190 }} value={s.action} options={ACTION_OPTIONS} onChange={(v) => update(i, { action: v })} />
                <Tooltip title="Move up"><Button icon={<ArrowUpOutlined />} disabled={i === 0} onClick={() => move(i, -1)} /></Tooltip>
                <Tooltip title="Move down"><Button icon={<ArrowDownOutlined />} disabled={i === signers.length - 1} onClick={() => move(i, 1)} /></Tooltip>
                <Tooltip title="Remove"><Button danger icon={<DeleteOutlined />} disabled={signers.length === 1}
                  onClick={() => setSigners((x) => x.filter((_, j) => j !== i))} /></Tooltip>
                {s.user_id && people[s.user_id]?.client && <Tag color="purple">Client</Tag>}
              </Space>
            ))}
            {signers.length < 10 && (
              <Button icon={<PlusOutlined />} onClick={() => setSigners((x) => [...x, { user_id: null, action: 'sign' }])}>Add another person</Button>
            )}
          </Space>
        </Form.Item>
        {noClients && !loadingPeople && (
          <Alert type="warning" showIcon style={{ marginBottom: 12 }}
            message="No client reviewers yet"
            description="To send documents to a client (for example the project owner), a company administrator first adds the client under Submissions & Signing → Clients and invites their reviewers." />
        )}
        <Form.Item label="Message (optional)">
          <Input.TextArea rows={3} maxLength={4000} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Please review and approve before Thursday's start of work." />
        </Form.Item>
        <Form.Item label="Respond by (optional)">
          <DatePicker value={due} onChange={setDue} disabledDate={(d) => d && d.isBefore(new Date(), 'day')} />
        </Form.Item>
        <Text type="secondary">Non-PDF documents (images and documents written in the editor) are turned into a PDF automatically so they can be signed. The original stays in the version history.</Text>
      </Form>
    </Modal>
  );
}

export default SubmitForApproval;
