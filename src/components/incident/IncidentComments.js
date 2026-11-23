// src/components/incident/IncidentComments.js
// Incident discussion: threaded comments with replies, real @mentions (people are notified),
// internal notes for investigators, edit/delete, live refresh.
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Card, Avatar, Button, Space, Tag, message, Typography, Tooltip, Modal, Select, Alert, Empty, Spin,
  Popconfirm, Mentions, Switch, Badge,
} from 'antd';
import {
  UserOutlined, SendOutlined, DeleteOutlined, EditOutlined, LockOutlined, CommentOutlined, ClockCircleOutlined,
  PushpinOutlined, BellOutlined, MailOutlined, ReloadOutlined, AlertOutlined, MessageOutlined, SearchOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

dayjs.extend(relativeTime);
const { Text, Paragraph } = Typography;

export const COMMENT_TYPES = {
  comment: { label: 'Comment', color: 'blue', icon: <CommentOutlined /> },
  update: { label: 'Update', color: 'green', icon: <BellOutlined /> },
  question: { label: 'Question', color: 'orange', icon: <AlertOutlined /> },
  finding: { label: 'Finding', color: 'cyan', icon: <SearchOutlined /> },
  action: { label: 'Action', color: 'geekblue', icon: <CheckSquareOutlined /> },
  decision: { label: 'Decision', color: 'purple', icon: <PushpinOutlined /> },
  note: { label: 'Internal note', color: 'gold', icon: <LockOutlined />, staffOnly: true },
};
const MAX_LEN = 5000;
const REFRESH_MS = 30000;

const request = async (method, url, data) => {
  const res = await api.request({ method, url, data, validateStatus: () => true });
  if (res.status >= 200 && res.status < 300 && res.data?.success !== false) return res.data;
  throw new Error(res.data?.error || res.data?.message || `Request failed (${res.status})`);
};

// "@Name" tokens -> mention list of known participants
const mentionsIn = (text, people) => people
  .filter((p) => p.name && text.includes(`@${p.name}`))
  .map((p) => ({ id: p.id, name: p.name }));

function highlight(content, mentions) {
  if (!content) return null;
  const names = (mentions || []).map((m) => (typeof m === 'string' ? m : m.name)).filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (!names.length) return content;
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = content.split(new RegExp(`(@(?:${names.map(esc).join('|')}))`, 'g'));
  return parts.map((part, i) => (part.startsWith('@') && names.includes(part.slice(1))
    ? <Tag key={i} color="blue" style={{ margin: '0 2px' }}>{part}</Tag>
    : <React.Fragment key={i}>{part}</React.Fragment>));
}

function Composer({ people, canInternal, placeholder, defaultType = 'comment', compact, onSubmit, onCancel, autoFocus }) {
  const [text, setText] = useState('');
  const [type, setType] = useState(defaultType);
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const content = text.trim();
    if (!content) { message.warning('Write something first'); return; }
    setBusy(true);
    try {
      await onSubmit({ content, comment_type: type, is_internal: internal || type === 'note', mentions: mentionsIn(content, people) });
      setText(''); setInternal(false);
    } catch (e) { message.error(e.message, 5); }
    finally { setBusy(false); }
  };

  return (
    <div className="ic-composer">
      <Mentions
        autoFocus={autoFocus}
        rows={compact ? 2 : 3}
        value={text}
        onChange={setText}
        maxLength={MAX_LEN}
        placeholder={placeholder}
        prefix="@"
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
        options={people.map((p) => ({ value: p.name, key: String(p.id), label: (
          <span>{p.name} <Text type="secondary" style={{ fontSize: 11 }}>{p.role}{p.is_assignee ? ' · investigator' : p.is_reporter ? ' · reporter' : ''}</Text></span>
        ) }))}
      />
      <Space wrap style={{ marginTop: 8, width: '100%', justifyContent: 'space-between' }}>
        <Space wrap>
          {!compact && (
            <Select size="small" value={type} onChange={(v) => { setType(v); if (v === 'note') setInternal(true); }} style={{ width: 150 }}
              options={Object.entries(COMMENT_TYPES).filter(([, c]) => canInternal || !c.staffOnly).map(([k, c]) => ({ value: k, label: <span>{c.icon} {c.label}</span> }))} />
          )}
          {canInternal && !compact && (
            <Tooltip title="Internal notes are only visible to investigators and safety staff">
              <Space size={4}><Switch size="small" checked={internal || type === 'note'} disabled={type === 'note'} onChange={setInternal} /><LockOutlined /> Internal</Space>
            </Tooltip>
          )}
          <Text type="secondary" style={{ fontSize: 12 }}>Type @ to mention someone · Ctrl+Enter to send · {text.length}/{MAX_LEN}</Text>
        </Space>
        <Space>
          {onCancel && <Button size="small" onClick={onCancel}>Cancel</Button>}
          <Button type="primary" size={compact ? 'small' : 'middle'} icon={<SendOutlined />} loading={busy} onClick={submit}>
            {compact ? 'Reply' : 'Post'}
          </Button>
        </Space>
      </Space>
    </div>
  );
}

const IncidentComments = ({ incident, currentUser: propUser, onAddComment, readOnly = false }) => {
  const { user: contextUser } = useAuth();
  const currentUser = propUser || contextUser;
  const [comments, setComments] = useState([]);
  const [people, setPeople] = useState([]);
  const [staff, setStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all');
  const lastCount = useRef(0);
  const incidentId = incident?.id;

  const load = useCallback(async (quiet = false) => {
    if (!incidentId) return;
    if (!quiet) setLoading(true);
    try {
      const data = await request('get', `/incidents/${incidentId}/comments`);
      setComments(data.comments || []);
      setStaff(!!data.is_staff);
      setLoadError(null);
      if (quiet && (data.comments || []).length > lastCount.current) message.info('New messages in the discussion');
      lastCount.current = (data.comments || []).length;
    } catch (e) {
      if (!quiet) setLoadError(e.message);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!incidentId) return undefined;
    request('get', `/incidents/${incidentId}/participants`).then((d) => setPeople(d.participants || [])).catch(() => setPeople([]));
    const t = setInterval(() => { if (!document.hidden) load(true); }, REFRESH_MS);
    return () => clearInterval(t);
  }, [incidentId, load]);

  const post = async (payload, parentId) => {
    const data = await request('post', `/incidents/${incidentId}/comments`, { ...payload, parent_id: parentId || undefined });
    setComments((prev) => {
      const next = [...prev, data.comment];
      if (parentId) return next.map((c) => (c.id === parentId ? { ...c, replies_count: (c.replies_count || 0) + 1 } : c));
      return next;
    });
    lastCount.current += 1;
    setReplyTo(null);
    onAddComment?.(data.comment);
    const n = (payload.mentions || []).length;
    message.success(n ? `Posted — ${n} ${n === 1 ? 'person was' : 'people were'} notified` : 'Posted');
  };

  const saveEdit = async () => {
    const content = editText.trim();
    if (!content) { message.warning('The comment cannot be empty'); return; }
    try {
      const data = await request('put', `/incidents/${incidentId}/comments/${editing.id}`, { content, mentions: mentionsIn(content, people) });
      setComments((prev) => prev.map((c) => (c.id === editing.id ? data.comment : c)));
      setEditing(null);
      message.success('Comment updated');
    } catch (e) { message.error(e.message); }
  };

  const remove = async (c) => {
    try {
      await request('delete', `/incidents/${incidentId}/comments/${c.id}`);
      setComments((prev) => prev
        .filter((x) => x.id !== c.id && x.parent_id !== c.id)
        .map((x) => (x.id === c.parent_id ? { ...x, replies_count: Math.max(0, (x.replies_count || 1) - 1) } : x)));
      message.success(c.parent_id ? 'Reply deleted' : 'Comment and its replies deleted');
    } catch (e) { message.error(e.message); }
  };

  const isMine = (c) => (c.author?.id || c.author_id) === currentUser?.id;
  const canDelete = (c) => isMine(c) || ['admin', 'company_admin', 'super_admin'].includes(currentUser?.user_type);

  const threads = useMemo(() => {
    const roots = comments.filter((c) => !c.parent_id && (filter === 'all' || (filter === 'internal' ? c.is_internal : c.comment_type === filter)));
    return roots
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((r) => ({ root: r, replies: comments.filter((c) => c.parent_id === r.id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) }));
  }, [comments, filter]);

  const renderComment = (c, isReply) => {
    const t = COMMENT_TYPES[c.comment_type] || COMMENT_TYPES.comment;
    return (
      <div key={c.id} className={`ic-item ${c.is_internal ? 'ic-internal' : ''} ${isReply ? 'ic-reply' : ''}`}>
        <Avatar size={isReply ? 28 : 34} icon={<UserOutlined />} style={{ backgroundColor: isMine(c) ? '#1677ff' : '#8c8c8c', flexShrink: 0 }}>
          {(c.author?.name || '?').slice(0, 1).toUpperCase()}
        </Avatar>
        <div className="ic-body">
          <Space wrap size={4}>
            <Text strong>{c.author?.name || 'Unknown'}</Text>
            {c.author?.role && <Text type="secondary" style={{ fontSize: 12 }}>{c.author.role}</Text>}
            {!isReply && <Tag color={t.color} icon={t.icon}>{t.label}</Tag>}
            {c.is_internal && c.comment_type !== 'note' && <Tag color="gold" icon={<LockOutlined />}>Internal</Tag>}
            <Tooltip title={dayjs(c.created_at).format('DD MMM YYYY HH:mm')}>
              <Text type="secondary" style={{ fontSize: 12 }}><ClockCircleOutlined /> {dayjs(c.created_at).fromNow()}</Text>
            </Tooltip>
            {c.is_edited && <Text type="secondary" style={{ fontSize: 11 }}>(edited)</Text>}
          </Space>
          <Paragraph style={{ margin: '4px 0', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{highlight(c.content, c.mentions)}</Paragraph>
          {(c.mentions || []).length > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}><MailOutlined /> {(c.mentions || []).map((m) => (typeof m === 'string' ? m : m.name)).join(', ')}</Text>
          )}
          {!readOnly && (
            <Space size={2} className="ic-actions">
              {!isReply && <Button type="link" size="small" icon={<MessageOutlined />} onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>Reply</Button>}
              {isMine(c) && <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditing(c); setEditText(c.content); }}>Edit</Button>}
              {canDelete(c) && (
                <Popconfirm title={c.parent_id ? 'Delete this reply?' : 'Delete this comment and its replies?'} okText="Delete" onConfirm={() => remove(c)}>
                  <Button type="link" size="small" danger icon={<DeleteOutlined />}>Delete</Button>
                </Popconfirm>
              )}
            </Space>
          )}
        </div>
      </div>
    );
  };

  if (!incidentId) return <Empty description="No incident selected" />;

  return (
    <Card
      title={<Space><CommentOutlined /> Discussion <Badge count={comments.length} showZero={false} style={{ backgroundColor: '#8c8c8c' }} /></Space>}
      extra={(
        <Space wrap>
          <Select size="small" value={filter} onChange={setFilter} style={{ width: 150 }}
            options={[{ value: 'all', label: 'All messages' },
              ...Object.entries(COMMENT_TYPES).filter(([k, c]) => (staff || !c.staffOnly) && k !== 'note').map(([k, c]) => ({ value: k, label: `${c.label}s` })),
              ...(staff ? [{ value: 'internal', label: 'Internal notes' }] : [])]} />
          <Tooltip title="Refresh"><Button size="small" icon={<ReloadOutlined />} onClick={() => load()} /></Tooltip>
        </Space>
      )}
    >
      <style>{`
        .ic-item { display: flex; gap: 10px; padding: 10px; border-radius: 8px; }
        .ic-item + .ic-item { margin-top: 4px; }
        .ic-internal { background: #fffbe6; }
        .ic-reply { margin-left: 44px; border-left: 2px solid #e6f4ff; border-radius: 0 8px 8px 0; }
        .ic-body { flex: 1; min-width: 0; }
        .ic-actions .ant-btn-link { padding: 0 6px; height: 22px; }
        .ic-thread { border-bottom: 1px solid #f0f0f0; padding: 4px 0 8px; }
        .ic-composer { background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; padding: 10px; }
        @media (max-width: 600px) { .ic-reply { margin-left: 16px; } }
      `}</style>

      {!readOnly && (
        <>
          <Composer people={people} canInternal={staff} placeholder="Share an update, ask a question or record a finding… Type @ to notify a colleague."
            onSubmit={(p) => post(p)} />
          {staff && <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 6 }}>
            <LockOutlined /> You can see and write internal notes (yellow). They are hidden from people outside the investigation team.
          </Text>}
        </>
      )}

      <div style={{ marginTop: 16 }}>
        {loading ? <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
          : loadError ? <Alert type="error" showIcon message="The discussion could not be loaded" description={loadError} action={<Button size="small" onClick={() => load()}>Try again</Button>} />
            : !threads.length ? <Empty description={filter === 'all' ? 'No messages yet — start the discussion' : 'Nothing matches this filter'} />
              : threads.map(({ root, replies }) => (
                <div key={root.id} className="ic-thread">
                  {renderComment(root, false)}
                  {replies.map((r) => renderComment(r, true))}
                  {replyTo === root.id && (
                    <div style={{ marginLeft: 44, marginTop: 6 }}>
                      <Composer compact autoFocus people={people} canInternal={staff} placeholder={`Reply to ${root.author?.name || 'this comment'}…`}
                        onSubmit={(p) => post(p, root.id)} onCancel={() => setReplyTo(null)} />
                    </div>
                  )}
                </div>
              ))}
      </div>

      <Modal open={!!editing} title="Edit comment" okText="Save" onOk={saveEdit} onCancel={() => setEditing(null)} destroyOnClose>
        <Mentions rows={5} value={editText} onChange={setEditText} maxLength={MAX_LEN} prefix="@"
          options={people.map((p) => ({ value: p.name, key: String(p.id), label: p.name }))} />
        <Text type="secondary" style={{ fontSize: 12 }}>{editText.length}/{MAX_LEN}</Text>
      </Modal>
    </Card>
  );
};

export default IncidentComments;
