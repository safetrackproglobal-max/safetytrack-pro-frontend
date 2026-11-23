// src/components/submissions/SubmissionsCenter.js
// Tabs: Waiting for me · Sent by my company · Approved documents. Plus a detail drawer (timeline).
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Tabs, Table, Tag, Button, Space, Badge, Drawer, Timeline, Descriptions, Alert, Typography, message, Popconfirm,
  Tooltip, Switch, Empty, Input,
} from 'antd';
import {
  SendOutlined, EditOutlined, DownloadOutlined, BellOutlined, RollbackOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, StopOutlined, ReloadOutlined, EyeOutlined,
} from '@ant-design/icons';
import submissionService from '../../services/submissionService';
import SubmitForApproval from './SubmitForApproval';
import './Submissions.css';

const { Text, Paragraph } = Typography;

export const STATUS = {
  in_review: { color: 'processing', label: 'In review', icon: <ClockCircleOutlined /> },
  approved: { color: 'success', label: 'Approved', icon: <CheckCircleOutlined /> },
  rejected: { color: 'error', label: 'Rejected', icon: <CloseCircleOutlined /> },
  withdrawn: { color: 'default', label: 'Withdrawn', icon: <StopOutlined /> },
};
const SIGNER_STATUS = {
  waiting: { color: 'default', label: 'Waiting' },
  pending: { color: 'processing', label: 'Their turn' },
  approved: { color: 'success', label: 'Approved' },
  rejected: { color: 'error', label: 'Rejected' },
  cancelled: { color: 'default', label: 'Cancelled' },
};
const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : '—');

export function SignerChain({ signers = [] }) {
  return (
    <div className="sb-signer-chain">
      {signers.map((s) => (
        <Tooltip key={s.id} title={`${s.order}. ${s.name}${s.organization ? ` (${s.organization})` : ''} — ${s.action_label}: ${SIGNER_STATUS[s.status]?.label || s.status}`}>
          <Tag color={SIGNER_STATUS[s.status]?.color}>{s.order}. {s.name.split(' ')[0]}</Tag>
        </Tooltip>
      ))}
    </div>
  );
}

export function SubmissionDrawer({ id, open, onClose, onChanged }) {
  const history = useHistory();
  const [sub, setSub] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!id) return;
    try { setSub((await submissionService.get(id)).submission); } catch (e) { message.error(e.message); }
  }, [id]);
  useEffect(() => { if (open) load(); }, [open, load]);

  const run = async (fn, ok) => {
    setBusy(true);
    try { const r = await fn(); message.success(r?.message || ok); await load(); onChanged?.(); }
    catch (e) { message.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Drawer open={open} onClose={onClose} width={560} title={sub ? sub.title : 'Submission'} destroyOnClose>
      {!sub ? null : (
        <>
          <Descriptions size="small" column={1} bordered>
            <Descriptions.Item label="Reference">{sub.reference}</Descriptions.Item>
            <Descriptions.Item label="Status"><Tag color={STATUS[sub.status]?.color} icon={STATUS[sub.status]?.icon}>{STATUS[sub.status]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="Document">{sub.document_title} (v{sub.document_version})</Descriptions.Item>
            <Descriptions.Item label="Sent by">{sub.submitted_by?.name} · {fmt(sub.submitted_at)}</Descriptions.Item>
            {sub.client_org && <Descriptions.Item label="Client">{sub.client_org.name}{sub.client_org.project_name ? ` · ${sub.client_org.project_name}` : ''}</Descriptions.Item>}
            {sub.due_date && <Descriptions.Item label="Respond by">{new Date(sub.due_date).toLocaleDateString()}</Descriptions.Item>}
            {sub.message && <Descriptions.Item label="Message">{sub.message}</Descriptions.Item>}
          </Descriptions>

          <Space wrap style={{ margin: '16px 0' }}>
            {sub.my_role?.can_act && (
              <Button type="primary" icon={<EditOutlined />} onClick={() => history.push(`/reviews/${sub.id}`)}>Review and sign</Button>
            )}
            <Button icon={<EyeOutlined />} onClick={() => history.push(`/reviews/${sub.id}`)}>Open document</Button>
            <Button icon={<DownloadOutlined />} onClick={() => submissionService.download(sub.id, `${sub.title} - ${sub.reference}.pdf`)}>
              {sub.status === 'approved' ? 'Download signed PDF' : 'Download current PDF'}
            </Button>
            {sub.can_manage && sub.status === 'in_review' && (
              <>
                <Button icon={<BellOutlined />} loading={busy} onClick={() => run(() => submissionService.remind(sub.id), 'Reminder sent')}>Send reminder</Button>
                <Popconfirm title="Withdraw this submission?" description="Nobody will be able to sign it any more." okText="Withdraw"
                  onConfirm={() => run(() => submissionService.withdraw(sub.id), 'Withdrawn')}>
                  <Button danger icon={<RollbackOutlined />}>Withdraw</Button>
                </Popconfirm>
              </>
            )}
          </Space>
          {sub.status === 'approved' && sub.can_manage && (
            <Alert type="success" showIcon style={{ marginBottom: 16 }}
              message="Approved by everyone"
              description={(
                <Space>
                  <Switch checked={sub.in_approved_list} loading={busy}
                    onChange={(v) => run(() => submissionService.setApprovedList(sub.id, v), v ? 'Added to approved documents' : 'Removed from approved documents')} />
                  <span>Show in my company's <b>Approved documents</b> (everyone in the company can download it)</span>
                </Space>
              )} />
          )}

          <Text strong>Signing order</Text>
          <Timeline style={{ marginTop: 12 }} items={(sub.signers || []).map((s) => ({
            color: s.status === 'approved' ? 'green' : s.status === 'rejected' ? 'red' : s.status === 'pending' ? 'blue' : 'gray',
            children: (
              <div>
                <b>{s.order}. {s.name}</b>{s.organization ? ` · ${s.organization}` : ''} <Tag>{s.action_label}</Tag>
                <Tag color={SIGNER_STATUS[s.status]?.color}>{SIGNER_STATUS[s.status]?.label}</Tag>
                <div className="sb-ref">
                  {s.notified_at && <>Emailed {fmt(s.notified_at)}. </>}
                  {s.viewed_at && <>Opened {fmt(s.viewed_at)}. </>}
                  {s.acted_at && <>Decided {fmt(s.acted_at)}.</>}
                  {s.reminder_count > 0 && <> Reminders: {s.reminder_count}.</>}
                </div>
                {s.comment && <Paragraph italic style={{ margin: '4px 0 0' }}>“{s.comment}”</Paragraph>}
              </div>
            ),
          }))} />
        </>
      )}
    </Drawer>
  );
}

function SubmissionsCenter({ defaultTab = 'inbox', reviewerOnly = false }) {
  const history = useHistory();
  const [tab, setTab] = useState(defaultTab);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [drawerId, setDrawerId] = useState(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = tab === 'approved' ? { listed: '0' } : {};
      const res = await submissionService.list(tab === 'approved' ? 'approved' : tab, params);
      setRows(res.submissions || []);
      const pend = await submissionService.list('inbox', { pending: '1' });
      setPendingCount((pend.submissions || []).length);
    } catch (e) { message.error(e.message); }
    finally { setLoading(false); }
  }, [tab]);
  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((r) => !search || `${r.title} ${r.reference} ${r.document_title}`.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    {
      title: 'Document', key: 'title',
      render: (_, r) => (
        <div className="sb-title-cell">
          <b>{r.title}</b>
          <span className="sb-ref">{r.reference}{r.client_org ? ` · ${r.client_org.name}` : ''}</span>
        </div>
      ),
    },
    { title: 'Status', key: 'status', width: 130, render: (_, r) => <Tag color={STATUS[r.status]?.color} icon={STATUS[r.status]?.icon}>{STATUS[r.status]?.label}</Tag> },
    { title: 'Signers', key: 'signers', render: (_, r) => <SignerChain signers={r.signers} /> },
    { title: tab === 'inbox' ? 'From' : 'Sent by', key: 'by', responsive: ['md'], render: (_, r) => r.submitted_by?.name },
    { title: 'Date', key: 'date', width: 120, responsive: ['lg'], render: (_, r) => new Date(r.submitted_at).toLocaleDateString() },
    {
      title: '', key: 'actions', width: 210,
      render: (_, r) => (
        <Space wrap>
          {r.my_role?.can_act && <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => history.push(`/reviews/${r.id}`)}>Sign now</Button>}
          <Button size="small" onClick={() => setDrawerId(r.id)}>Details</Button>
          {r.status === 'approved' && <Button size="small" icon={<DownloadOutlined />} onClick={() => submissionService.download(r.id, `${r.title} - ${r.reference}.pdf`)} />}
        </Space>
      ),
    },
  ];

  const howTo = {
    inbox: 'Documents other people sent you. Click “Sign now”, read the document, check where your signature/stamp goes, then Approve or Reject.',
    sent: 'Documents your company sent for approval. Each person is emailed in turn; you are emailed when it is approved or rejected. Open Details to send a reminder or withdraw.',
    approved: 'Fully approved documents with their signed PDF and approval certificate. Switch on “Approved documents” in Details to share a document with everyone in your company.',
  };

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }} wrap>
        <Input.Search allowClear placeholder="Search by title or reference" style={{ width: 280 }} onChange={(e) => setSearch(e.target.value)} />
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
          {!reviewerOnly && <Button type="primary" icon={<SendOutlined />} onClick={() => setSubmitOpen(true)}>Send a document for approval</Button>}
        </Space>
      </Space>
      <Tabs activeKey={tab} onChange={setTab} items={[
        { key: 'inbox', label: <Badge count={pendingCount} offset={[12, 0]} size="small">{reviewerOnly ? 'Documents sent to me' : 'Waiting for me'}</Badge> },
        ...(reviewerOnly ? [] : [
          { key: 'sent', label: 'Sent' },
          { key: 'approved', label: 'Approved documents' },
        ]),
      ]} />
      <Alert type="info" showIcon style={{ marginBottom: 12 }} message={howTo[tab]} />
      <Table rowKey="id" loading={loading} dataSource={filtered} columns={columns} pagination={{ pageSize: 15 }}
        scroll={{ x: 760 }}
        locale={{ emptyText: <Empty description={tab === 'inbox' ? 'Nothing is waiting for you' : 'No submissions yet'} /> }} />
      <SubmissionDrawer id={drawerId} open={!!drawerId} onClose={() => setDrawerId(null)} onChanged={load} />
      <SubmitForApproval open={submitOpen} onClose={() => setSubmitOpen(false)} onSubmitted={() => { setTab('sent'); load(); }} />
    </div>
  );
}

export default SubmissionsCenter;
