// Workplace Voice — company side: inbox of worker reports, insights, setup, routing to the right people per project,
// and QR codes / printable posters for sites and projects.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Alert, Button, Card, Col, DatePicker, Descriptions, Drawer, Empty, Form, Input, Modal, Popconfirm, Progress, QRCode, Row,
  Select, Space, Statistic, Switch, Table, Tabs, Tag, Timeline, Tooltip, Typography, message, Checkbox, InputNumber,
} from 'antd';
import {
  SoundOutlined, InboxOutlined, BarChartOutlined, SettingOutlined, ApartmentOutlined, QrcodeOutlined, ReloadOutlined,
  ThunderboltOutlined, ToolOutlined, PrinterOutlined, CopyOutlined, DownloadOutlined, LockOutlined, EyeInvisibleOutlined,
  UserOutlined, QuestionCircleOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined, ClockCircleOutlined, TrophyOutlined,
  BranchesOutlined, GiftOutlined,
} from '@ant-design/icons';
import voiceService, { voiceErr, GROUP_META, CATEGORY_META, SERVER_BASE, portalBase } from '../services/workplaceVoiceService';
import { apiGet } from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const RISK_COLOR = { critical: 'red', high: 'volcano', medium: 'gold', low: 'green' };
const STATUS_COLOR = { received: 'blue', under_review: 'processing', action_taken: 'cyan', shared: 'purple', closed: 'green', not_valid: 'default', duplicate: 'orange' };
const STATUS_LABEL = { received: 'Received', under_review: 'Under review', action_taken: 'Action taken', shared: 'Shared with workforce', closed: 'Closed', not_valid: 'No action needed', duplicate: 'Repeat of another report' };
const GROUP_LABEL = { safety: 'Safety', environmental: 'Environmental', welfare: 'Welfare', ethics: 'Ethics & culture', suggestions: 'Suggestions', all: 'All report types' };
const LANG_LABEL = { en: 'English', ar: 'Arabic', hi: 'Hindi', ur: 'Urdu', ne: 'Nepali', bn: 'Bengali', ta: 'Tamil', ml: 'Malayalam', tl: 'Tagalog', fr: 'French',
  sw: 'Swahili', es: 'Spanish', pt: 'Portuguese', zh: 'Chinese', ha: 'Hausa', yo: 'Yoruba', tw: 'Twi', am: 'Amharic' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const catLabel = (c) => (CATEGORY_META[c] ? `${CATEGORY_META[c][0]} ${CATEGORY_META[c][1]}` : c);

// ------------------------------------------------------------------ media (auth-protected, loaded as blobs)
const MediaItem = ({ reportId, m }) => {
  const [url, setUrl] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let alive = true; let made = null;
    voiceService.media(reportId, m.index).then((b) => { if (!alive) return; made = URL.createObjectURL(b); setUrl(made); }).catch(() => setErr(true));
    return () => { alive = false; if (made) URL.revokeObjectURL(made); };
  }, [reportId, m.index]);
  if (err) return <Tag color="red">{m.kind} unavailable</Tag>;
  if (!url) return <Tag>Loading {m.kind}…</Tag>;
  if (m.kind === 'audio') return <audio controls src={url} style={{ width: '100%' }} />;
  if (m.kind === 'video') return <video controls src={url} style={{ width: '100%', maxHeight: 320, background: '#000' }} />;
  return <a href={url} target="_blank" rel="noreferrer"><img src={url} alt="evidence" style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 8 }} /></a>;
};

const printAlert = (r, companyName) => {
  const det = r.details || {};
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Safety Alert</title><style>
body{font-family:Arial,Helvetica,sans-serif;margin:28px;color:#222}.band{background:#c62828;color:#fff;padding:14px 18px;font-size:26px;font-weight:700}
h2{margin:18px 0 6px;font-size:16px;color:#1E3D58}.box{border:2px solid #c62828;padding:12px;margin-top:14px}.meta{color:#555;font-size:12px}</style></head><body>
<div class="band">⚠ SAFETY ALERT</div><p class="meta">${esc(companyName || '')} · ${esc(new Date().toLocaleDateString())} · Raised by a worker through Workplace Voice</p>
<h1 style="font-size:22px">${esc(r.title || 'Worker report')}</h1>
<h2>What was reported</h2><p>${esc(r.summary || '')}</p>
${det.location ? `<h2>Where</h2><p>${esc(det.location)}</p>` : ''}
${det.potential_consequence ? `<h2>What could happen</h2><p>${esc(det.potential_consequence)}</p>` : ''}
${det.recommended_action ? `<h2>What everyone must do</h2><p>${esc(det.recommended_action)}</p>` : ''}
${r.action_taken ? `<div class="box"><b>Action taken:</b> ${esc(r.action_taken)}</div>` : ''}
<p style="margin-top:24px"><b>You spoke, we acted.</b> Thank you to the worker who reported this. Scan the Workplace Voice QR code to report any concern - anonymously, in your own language.</p>
</body></html>`;
  const w = window.open('', '_blank');
  if (!w) { message.warning('Allow pop-ups to print'); return; }
  w.opener = null; w.document.open(); w.document.write(html); w.document.close();
  // no inline script in the pop-up: the site's CSP blocks it
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) { /* print from the browser menu */ } }, 500);
};

// ------------------------------------------------------------------ repeated reports
const RepeatCard = ({ r, onOpen, update, busy }) => {
  const [code, setCode] = useState('');
  const root = r.duplicate_of_report;
  if (!root && !r.repeats?.length && r.status === 'duplicate') return null;
  return (
    <Card size="small" style={{ marginBottom: 12 }} title={<Space><BranchesOutlined />Repeated reports</Space>}>
      {root && (
        <Alert type="warning" showIcon style={{ marginBottom: 8 }}
          message={<span>Looks like a repeat of <a onClick={() => onOpen(root.id)} role="button" tabIndex={0}>{root.tracking_code}</a> - {root.title}</span>}
          description="Handle the issue on the original report. Merging tells this worker it is already being handled; they still see its progress."
          action={(
            <Space direction="vertical">
              {r.status !== 'duplicate' && <Button size="small" type="primary" loading={busy === 'duplicate_of'} onClick={() => update({ duplicate_of: root.tracking_code }, 'Merged into the original report')}>Merge</Button>}
              <Button size="small" loading={busy === 'duplicate_of'} onClick={() => update({ duplicate_of: null }, 'Marked as a separate issue')}>Not a repeat</Button>
            </Space>
          )} />
      )}
      {r.repeats?.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Tag color="volcano">Reported by {r.repeats.length + 1} people</Tag>
          {r.repeats.map((x) => <Tag key={x.id} style={{ cursor: 'pointer' }} onClick={() => onOpen(x.id)}>{x.tracking_code}{x.status === 'duplicate' ? ' (merged)' : ''}</Tag>)}
        </div>
      )}
      {!root && (
        <Space.Compact style={{ width: '100%' }}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Merge into report… (tracking code WV-XXXX-XXXX-XXXX)" maxLength={24} />
          <Button disabled={code.trim().length < 12} loading={busy === 'duplicate_of'} onClick={() => update({ duplicate_of: code.trim() }, 'Merged into the original report')}>Merge</Button>
        </Space.Compact>
      )}
    </Card>
  );
};

// ------------------------------------------------------------------ rewards on a report
const REWARD_CATALOG = [
  ['valid', 10, 'Valid report'], ['verified_hazard', 25, 'Verified hazard'], ['verified_near_miss', 40, 'Verified near miss'],
  ['critical_risk', 100, 'Critical risk identified', true], ['improvement_implemented', 250, 'Improvement implemented', true],
  ['incident_prevented', 500, 'Incident prevented', true], ['environmental_improvement', 500, 'Environmental improvement', true],
];
const RewardCard = ({ r, isAdmin, onDone }) => {
  const [kinds, setKinds] = useState([]);
  const [busy, setBusy] = useState(false);
  const rw = r.rewards;
  useEffect(() => { setKinds(rw?.suggested || []); }, [r.id]); // eslint-disable-line
  if (!rw) return null;
  if (!rw.linked) {
    return <Card size="small" style={{ marginBottom: 12 }} title={<Space><TrophyOutlined />Safety Impact points</Space>}><Text type="secondary">The worker did not join rewards for this report.</Text></Card>;
  }
  const done = new Set(rw.awarded.map((a) => a.kind));
  const blocked = ['not_valid', 'duplicate'].includes(r.status);
  const award = async () => {
    setBusy(true);
    try {
      const res = await voiceService.reward(r.id, kinds.filter((k) => !done.has(k)));
      message.success(res.data.points ? `${res.data.points} points awarded - the worker sees it on their tracking page` : 'Already awarded');
      onDone(res.data.report);
    } catch (e) { message.error(voiceErr(e)); } finally { setBusy(false); }
  };
  const total = rw.awarded.reduce((n, a) => n + a.points, 0);
  return (
    <Card size="small" style={{ marginBottom: 12 }} title={<Space><TrophyOutlined style={{ color: '#faad14' }} />Safety Impact points</Space>}
      extra={<Tag color="gold">{total} awarded</Tag>}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Reward impact, not the number of reports. The worker stays anonymous: you never see who gets the points.</Text>
      {blocked ? <Text type="secondary">Repeats and reports marked not valid do not earn points.</Text> : (
        <>
          <Checkbox.Group value={kinds} onChange={setKinds} style={{ display: 'grid', gap: 4 }}>
            {REWARD_CATALOG.map(([k, pts, label, adminOnly]) => (
              <Checkbox key={k} value={k} disabled={done.has(k) || (adminOnly && !isAdmin)}>
                {label} <Tag>+{pts}</Tag>{done.has(k) && <Tag color="green">awarded</Tag>}{adminOnly && !isAdmin && <Tag>admin</Tag>}
                {rw.suggested?.includes(k) && !done.has(k) && <Tag color="blue">suggested</Tag>}
              </Checkbox>
            ))}
          </Checkbox.Group>
          <Button style={{ marginTop: 8 }} type="primary" icon={<TrophyOutlined />} loading={busy} disabled={!kinds.filter((k) => !done.has(k)).length} onClick={award}>Award points</Button>
        </>
      )}
    </Card>
  );
};

// ------------------------------------------------------------------ report drawer
const ReportDrawer = ({ id, open, onClose, onChanged, users, isAdmin, companyName }) => {
  const history = useHistory();
  const [r, setR] = useState(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [question, setQuestion] = useState('');
  const [note, setNote] = useState('');
  const [acted, setActed] = useState('');
  const [capaOpen, setCapaOpen] = useState(false);
  const [capaForm] = Form.useForm();

  const load = useCallback(() => {
    if (!id) return;
    voiceService.report(id).then((res) => { setR(res.data); setActed(res.data.action_taken || ''); }).catch((e) => message.error(voiceErr(e)));
  }, [id]);
  useEffect(() => { setR(null); if (open) load(); }, [open, load]);

  const update = async (payload, okText) => {
    setBusy(Object.keys(payload)[0]);
    try {
      const res = await voiceService.update(id, payload);
      setR(res.data); onChanged(); message.success(okText);
      return true;
    } catch (e) { message.error(voiceErr(e)); return false; } finally { setBusy(''); }
  };
  const makeTalk = async () => {
    setBusy('tbt');
    try {
      const res = await voiceService.toolboxTalk(id, { duration: 10 });
      setR(res.data.report); onChanged();
      message.success('Toolbox talk created from this report');
      history.push(`/toolbox-talks?id=${res.data.toolbox_talk_id}`);
    } catch (e) { message.error(voiceErr(e)); } finally { setBusy(''); }
  };
  const makeCapa = async () => {
    const v = await capaForm.validateFields();
    setBusy('capa');
    try {
      const res = await voiceService.correctiveAction(id, { title: v.title, assigned_to: v.assigned_to, due_date: v.due_date?.format('YYYY-MM-DD') });
      setR(res.data.report); onChanged(); setCapaOpen(false);
      message.success(`Corrective action ${res.data.action_number} created`);
    } catch (e) { message.error(voiceErr(e)); } finally { setBusy(''); }
  };

  const det = r?.details || {};
  return (
    <Drawer open={open} onClose={onClose} width={Math.min(760, window.innerWidth)} destroyOnClose
      title={r ? <Space wrap><Tag color={RISK_COLOR[r.risk_level]}>{(r.risk_level || '').toUpperCase()}</Tag><span style={{ whiteSpace: 'normal' }}>{r.title || r.tracking_code}</span></Space> : 'Loading…'}>
      {!r ? null : (
        <>
          <Space wrap style={{ marginBottom: 12 }}>
            <Tag color={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status]}</Tag>
            <Tag>{GROUP_META[r.group]?.emoji} {GROUP_LABEL[r.group]}</Tag>
            {r.category && r.category !== 'not_sure' && <Tag>{catLabel(r.category)}</Tag>}
            <Tag icon={r.anonymity === 'open' ? <UserOutlined /> : r.anonymity === 'protected' ? <LockOutlined /> : <EyeInvisibleOutlined />}>
              {r.anonymity === 'open' ? 'Named' : r.anonymity === 'protected' ? 'Protected identity' : 'Anonymous'}
            </Tag>
            {r.language_detected && <Tag color="geekblue">Spoken: {r.language_detected}</Tag>}
            {r.project && <Tag color="cyan">📍 {r.project.name}</Tag>}
            <Text type="secondary" copyable={{ text: r.tracking_code }}>{r.tracking_code}</Text>
          </Space>
          {r.overdue && <Alert type="error" showIcon style={{ marginBottom: 12 }} message="Response time passed" description={`This ${r.risk_level} report needed a reply within ${r.response_hours} hours. Send the worker an update now.`} />}
          {r.ai_status !== 'done' && (
            <Alert type={r.ai_status === 'pending' || r.ai_status === 'retrying' ? 'info' : 'warning'} showIcon style={{ marginBottom: 12 }}
              message={r.ai_status === 'pending' || r.ai_status === 'retrying' ? 'AI is still processing this report…' : 'AI processing was incomplete - listen to the recording'}
              description={r.ai_error || undefined}
              action={isAdmin ? <Button size="small" onClick={async () => { await voiceService.reprocess(r.id); message.info('Re-processing started'); setTimeout(load, 4000); }}>Re-run AI</Button> : null} />
          )}
          {r.summary && <Alert type="info" message="AI summary" description={r.summary} style={{ marginBottom: 12 }} />}
          <Descriptions size="small" column={{ xs: 1, sm: 2 }} bordered style={{ marginBottom: 12 }}>
            <Descriptions.Item label="Location">{det.location || '—'}</Descriptions.Item>
            <Descriptions.Item label="Equipment">{det.equipment || '—'}</Descriptions.Item>
            <Descriptions.Item label="Hazard">{det.hazard_type || '—'}</Descriptions.Item>
            <Descriptions.Item label="Could lead to">{det.potential_consequence || '—'}</Descriptions.Item>
            <Descriptions.Item label="People at risk">{det.people_at_risk || '—'}</Descriptions.Item>
            <Descriptions.Item label="Respond by">{r.response_due_at ? new Date(`${r.response_due_at}Z`).toLocaleString() : '—'}</Descriptions.Item>
            <Descriptions.Item label="Recommended action" span={2}>{det.recommended_action || '—'}</Descriptions.Item>
          </Descriptions>

          <Tabs size="small" items={[
            { key: 'en', label: 'English', children: <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{r.english_text || r.original_text || <Text type="secondary">No text - listen to the recording below.</Text>}</Paragraph> },
            { key: 'orig', label: `Original${r.language_detected ? ` (${r.language_detected})` : ''}`, children: <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{r.original_text || '—'}</Paragraph> },
            ...(r.translated_text && r.translated_text !== r.english_text ? [{ key: 'pref', label: 'Company language', children: <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{r.translated_text}</Paragraph> }] : []),
          ]} />

          {r.media?.length > 0 && (
            <Card size="small" title="Evidence" style={{ marginBottom: 12 }}>
              <Space wrap style={{ width: '100%' }} direction={r.media.some((m) => m.kind !== 'photo') ? 'vertical' : 'horizontal'}>
                {r.media.map((m) => <MediaItem key={m.index} reportId={r.id} m={m} />)}
              </Space>
              {r.photo_findings?.length > 0 && (
                <Alert style={{ marginTop: 10 }} type="warning" showIcon message="SafeTrack vision check"
                  description={r.photo_findings.map((f, i) => (
                    <div key={i}>{f.kind}: {Array.isArray(f.result) ? f.result.map((x) => `frame ${x.frame} ${x.risk_level}, ${x.ppe_violations} PPE issue(s)`).join('; ')
                      : `${f.result.risk_level} risk, ${f.result.ppe_violations} PPE issue(s)${f.result.hazards?.length ? `, ${f.result.hazards.join(', ')}` : ''}`}</div>
                  ))} />
              )}
            </Card>
          )}

          <Card size="small" title={<Space><UserOutlined />Reporter</Space>} style={{ marginBottom: 12 }}>
            {r.reporter ? <Text>{r.reporter.name || '—'} · {r.reporter.contact || 'no contact'}</Text> : <Text type="secondary">{r.identity_note}</Text>}
          </Card>

          <RepeatCard r={r} onOpen={(id) => history.replace({ search: `?report=${id}` })} update={update} busy={busy} />
          <RewardCard r={r} isAdmin={isAdmin} onDone={(nr) => { setR(nr); onChanged(); }} />

          <Card size="small" title="Take action" style={{ marginBottom: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Select value={r.status} style={{ width: 210 }} onChange={(s) => update({ status: s }, 'Status updated - the worker can see it')}
                  options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))} loading={busy === 'status'} />
                <Select value={r.risk_level} style={{ width: 130 }} onChange={(v) => update({ risk_level: v }, 'Risk updated')}
                  options={['low', 'medium', 'high', 'critical'].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))} />
                {isAdmin && (
                  <Select mode="multiple" style={{ minWidth: 240 }} placeholder="Assigned to" value={(r.assigned || []).map((a) => a.id)}
                    onChange={(ids) => ids.length && update({ assign_user_ids: ids }, 'Re-assigned')} optionFilterProp="label"
                    options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.user_type})` }))} />
                )}
              </Space>
              {!isAdmin && <Text type="secondary">Assigned: {(r.assigned || []).map((a) => a.name).join(', ')}</Text>}
              <Input.Group compact style={{ display: 'flex' }}>
                <Input style={{ flex: 1 }} value={acted} onChange={(e) => setActed(e.target.value)} maxLength={2000} placeholder="Action taken - shown to the worker (e.g. Guardrail replaced)" />
                <Button type="primary" loading={busy === 'action_taken'} disabled={!acted.trim() || acted === r.action_taken}
                  onClick={() => update({ action_taken: acted, status: r.status === 'received' || r.status === 'under_review' ? 'action_taken' : undefined }, 'Saved - the worker sees "You spoke, we acted"')}>Save</Button>
              </Input.Group>
              <Space wrap>
                <Button icon={<ThunderboltOutlined />} loading={busy === 'tbt'} onClick={makeTalk} disabled={!!r.tbt_id || r.status === 'not_valid'}>
                  {r.tbt_id ? 'Toolbox talk created' : 'Create toolbox talk'}
                </Button>
                {r.tbt_id && <Button type="link" onClick={() => history.push(`/toolbox-talks?id=${r.tbt_id}`)}>Open talk</Button>}
                <Button icon={<ToolOutlined />} onClick={() => { capaForm.setFieldsValue({ title: det.recommended_action || r.title }); setCapaOpen(true); }} disabled={!!r.capa_id || !users.length}>
                  {r.capa_id ? 'Corrective action created' : 'Corrective action'}
                </Button>
                <Button icon={<PrinterOutlined />} onClick={() => printAlert(r, companyName)}>Safety alert</Button>
              </Space>
            </Space>
          </Card>

          <Card size="small" title="Talk to the worker (they stay anonymous)" style={{ marginBottom: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input.Group compact style={{ display: 'flex' }}>
                <Input style={{ flex: 1 }} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={2000} placeholder="Update to the worker" />
                <Button loading={busy === 'public_message'} disabled={!msg.trim()} onClick={async () => { if (await update({ public_message: msg }, 'Update sent')) setMsg(''); }}>Send</Button>
              </Input.Group>
              <Input.Group compact style={{ display: 'flex' }}>
                <Input style={{ flex: 1 }} prefix={<QuestionCircleOutlined />} value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={2000} placeholder="Ask a follow-up question" />
                <Button loading={busy === 'question'} disabled={!question.trim()} onClick={async () => { if (await update({ question }, 'Question sent')) setQuestion(''); }}>Ask</Button>
              </Input.Group>
              <Input.Group compact style={{ display: 'flex' }}>
                <Input style={{ flex: 1 }} prefix={<LockOutlined />} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} placeholder="Internal note (never shown to the worker)" />
                <Button loading={busy === 'internal_note'} disabled={!note.trim()} onClick={async () => { if (await update({ internal_note: note }, 'Note added')) setNote(''); }}>Add</Button>
              </Input.Group>
            </Space>
          </Card>

          <Card size="small" title="Timeline">
            <Timeline items={(r.timeline || []).slice().reverse().map((e) => ({
              color: e.by === 'reporter' ? 'green' : e.public ? 'blue' : 'gray',
              children: (
                <div>
                  <Space size={4} wrap>
                    <Tag>{e.by === 'reporter' ? 'Worker' : e.by === 'system' ? 'System' : 'Team'}</Tag>
                    {!e.public && <Tag icon={<LockOutlined />}>Internal</Tag>}
                    {e.type === 'question' && <Tag color="orange">Question</Tag>}
                    <Text type="secondary" style={{ fontSize: 12 }}>{new Date(e.at.endsWith('Z') ? e.at : `${e.at}Z`).toLocaleString()}</Text>
                  </Space>
                  <div>{e.text}</div>
                </div>
              ),
            }))} />
          </Card>

          <Modal title="Create corrective action" open={capaOpen} onCancel={() => setCapaOpen(false)} onOk={makeCapa} confirmLoading={busy === 'capa'} okText="Create">
            <Form form={capaForm} layout="vertical">
              <Form.Item name="title" label="Action" rules={[{ required: true, max: 255 }]}><Input /></Form.Item>
              <Form.Item name="assigned_to" label="Who will do it" rules={[{ required: true }]}>
                <Select showSearch optionFilterProp="label" options={users.map((u) => ({ value: u.id, label: u.name }))} />
              </Form.Item>
              <Form.Item name="due_date" label="Due date"><DatePicker style={{ width: '100%' }} /></Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </Drawer>
  );
};

// ------------------------------------------------------------------ inbox
const Inbox = ({ projects, users, isAdmin, companyName, openId, onOpen, refreshKey }) => {
  const [filters, setFilters] = useState({ status: 'open' });
  const [state, setState] = useState({ loading: true, items: [], total: 0, page: 1 });
  const load = useCallback(async (page = 1) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await voiceService.reports({ ...filters, page, per_page: 20 });
      setState({ loading: false, items: res.data.items, total: res.data.total, page });
    } catch (e) { setState((s) => ({ ...s, loading: false })); message.error(voiceErr(e)); }
  }, [filters]);
  useEffect(() => { load(1); }, [load, refreshKey]);
  const pname = (id) => projects.find((p) => p.id === id)?.name;

  return (
    <Card style={{ borderRadius: 12 }}>
      <Space wrap style={{ marginBottom: 12 }}>
        <Select style={{ width: 170 }} value={filters.status || 'all'} onChange={(v) => setFilters((f) => ({ ...f, status: v === 'all' ? undefined : v }))}
          options={[{ value: 'open', label: 'Open reports' }, { value: 'all', label: 'All statuses' }, ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))]} />
        <Select allowClear placeholder="Type" style={{ width: 170 }} value={filters.group} onChange={(v) => setFilters((f) => ({ ...f, group: v }))}
          options={Object.keys(GROUP_META).map((g) => ({ value: g, label: `${GROUP_META[g].emoji} ${GROUP_LABEL[g]}` }))} />
        <Select allowClear placeholder="Risk" style={{ width: 130 }} value={filters.risk} onChange={(v) => setFilters((f) => ({ ...f, risk: v }))}
          options={['critical', 'high', 'medium', 'low'].map((v) => ({ value: v, label: v }))} />
        {projects.length > 0 && (
          <Select allowClear placeholder="Project" style={{ width: 190 }} value={filters.project_id} onChange={(v) => setFilters((f) => ({ ...f, project_id: v }))}
            options={projects.map((p) => ({ value: p.id, label: p.name }))} />
        )}
        <Input.Search allowClear placeholder="Search or tracking code" style={{ width: 230 }} onSearch={(q) => setFilters((f) => ({ ...f, q }))} maxLength={100} />
        <Button icon={<ReloadOutlined />} onClick={() => load(state.page)} />
      </Space>
      <Table rowKey="id" size="middle" loading={state.loading} dataSource={state.items} scroll={{ x: 820 }}
        onRow={(r) => ({ onClick: () => onOpen(r.id), style: { cursor: 'pointer' } })}
        pagination={{ current: state.page, total: state.total, pageSize: 20, onChange: load, showSizeChanger: false }}
        locale={{ emptyText: <Empty description="No worker reports yet. Share your QR code from the 'QR & posters' tab." /> }}
        columns={[
          { title: 'Risk', dataIndex: 'risk_level', width: 95, render: (v) => <Tag color={RISK_COLOR[v]}>{(v || '').toUpperCase()}</Tag> },
          { title: 'Report', dataIndex: 'title', render: (v, r) => (
            <div>
              <Text strong>{v || (r.ai_status === 'pending' ? 'Processing…' : r.tracking_code)}</Text>
              <div><Text type="secondary" style={{ fontSize: 12 }}>{(r.summary || '').slice(0, 110)}</Text></div>
            </div>
          ) },
          { title: 'Type', dataIndex: 'group', width: 140, render: (g) => <span>{GROUP_META[g]?.emoji} {GROUP_LABEL[g]}</span> },
          { title: 'Project', dataIndex: 'project_id', width: 140, render: (p) => pname(p) || <Text type="secondary">—</Text> },
          { title: 'Status', dataIndex: 'status', width: 150, render: (s, r) => (
            <Space size={2} wrap>
              <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>
              {r.overdue && <Tooltip title="No reply within the response time"><Tag color="red" icon={<ClockCircleOutlined />}>Late</Tag></Tooltip>}
              {r.duplicate_count > 0 && <Tooltip title="Other workers reported the same issue"><Tag color="volcano">×{r.duplicate_count + 1} people</Tag></Tooltip>}
              {r.duplicate_of && r.status !== 'duplicate' && <Tag color="orange">Possible repeat</Tag>}
            </Space>
          ) },
          { title: 'Received', dataIndex: 'created_at', width: 150, render: (d, r) => (
            <span>{d ? new Date(`${d}Z`).toLocaleString() : ''} {r.anonymity !== 'open' && <EyeInvisibleOutlined title="Anonymous / protected" />} {r.media_count > 0 && <SoundOutlined title="Has media" />}</span>
          ) },
        ]} />
      <ReportDrawer id={openId} open={!!openId} onClose={() => onOpen(null)} onChanged={() => load(state.page)} users={users} isAdmin={isAdmin} companyName={companyName} />
    </Card>
  );
};

// ------------------------------------------------------------------ insights
const Bars = ({ data, color = '#1677ff', label = (k) => k }) => {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  if (!entries.length) return <Text type="secondary">No data yet</Text>;
  return entries.map(([k, v]) => (
    <div key={k} style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>{label(k)}</span><b>{v}</b></div>
      <Progress percent={Math.round((v / max) * 100)} showInfo={false} strokeColor={color} size="small" />
    </div>
  ));
};

const Insights = ({ stats, days, setDays, projects }) => {
  if (!stats) return <Card loading style={{ borderRadius: 12 }} />;
  const pname = (id) => projects.find((p) => String(p.id) === String(id))?.name || (id === 'unknown' ? 'No project' : `Project ${id}`);
  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Select value={days} onChange={setDays} style={{ width: 150 }} options={[7, 30, 90, 365].map((d) => ({ value: d, label: `Last ${d} days` }))} />
      </Space>
      {stats.insights?.length > 0 && stats.insights.map((i, n) => (
        <Alert key={n} type={n === 0 && stats.overdue ? 'error' : 'warning'} showIcon style={{ marginBottom: 10 }} message={i.text}
          description={<ul style={{ margin: 0, paddingLeft: 18 }}>{i.recommendations.map((x) => <li key={x}>{x}</li>)}</ul>} />
      ))}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}><Card size="small" title="By type"><Bars data={stats.by_group} label={(k) => `${GROUP_META[k]?.emoji || ''} ${GROUP_LABEL[k] || k}`} /></Card></Col>
        <Col xs={24} md={12}><Card size="small" title="By risk"><Bars data={stats.by_risk} color="#fa541c" /></Card></Col>
        <Col xs={24} md={12}><Card size="small" title="Top concerns"><Bars data={stats.top_categories} color="#722ed1" label={catLabel} /></Card></Col>
        <Col xs={24} md={12}><Card size="small" title="Recurring hazards"><Bars data={stats.recurring_hazards} color="#13c2c2" /></Card></Col>
        <Col xs={24} md={12}><Card size="small" title="By project"><Bars data={stats.by_project} color="#2f54eb" label={pname} /></Card></Col>
        <Col xs={24} md={12}>
          <Card size="small" title="Reports per day">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 90 }}>
              {(stats.trend || []).map((d) => {
                const mx = Math.max(1, ...stats.trend.map((x) => x.count));
                return <Tooltip key={d.date} title={`${d.date}: ${d.count}`}><div style={{ flex: 1, minWidth: 2, height: `${(d.count / mx) * 100}%`, minHeight: d.count ? 4 : 1, background: '#1677ff', borderRadius: 2 }} /></Tooltip>;
              })}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

// ------------------------------------------------------------------ rewards programme
const LEVEL_COLOR = { Bronze: '#cd7f32', Silver: '#8c8c8c', Gold: '#d4b106', Platinum: '#13c2c2', Diamond: '#722ed1' };
const RewardsTab = ({ isAdmin }) => {
  const [data, setData] = useState(null);
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => { voiceService.rewards().then((r) => setData(r.data)).catch((e) => message.error(voiceErr(e))); }, []);
  useEffect(() => { load(); }, [load]);
  if (!data) return <Card loading />;
  const redeem = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try {
      const res = await voiceService.redeem(v);
      message.success(`${res.data.redeemed} points redeemed for ${res.data.alias}. ${res.data.available} left.`);
      form.resetFields(); load();
    } catch (e) { message.error(voiceErr(e)); } finally { setBusy(false); }
  };
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={15}>
        <Card style={{ borderRadius: 12 }} title={<Space><TrophyOutlined style={{ color: '#faad14' }} />Safety Impact leaderboard</Space>}
          extra={<Space><Tag>{data.participants} workers</Tag><Tag color="gold">{data.points_this_month} pts this month</Tag></Space>}>
          <Alert type="info" showIcon style={{ marginBottom: 12 }} message="Workers appear by alias only (e.g. Brave Falcon 27). Nobody - including you - can see which reports belong to which alias." />
          <Table size="small" rowKey="id" dataSource={data.leaderboard} pagination={{ pageSize: 20 }} scroll={{ x: 520 }}
            locale={{ emptyText: 'No reward points yet. Points are given when you verify reports.' }}
            columns={[
              { title: '#', key: 'rank', width: 50, render: (_, __, i) => i + 1 },
              { title: 'Alias', dataIndex: 'alias' },
              { title: 'Level', dataIndex: 'level', width: 110, render: (l) => <Tag color={LEVEL_COLOR[l]}>{l}</Tag> },
              { title: 'Points', dataIndex: 'points', width: 90 },
              { title: 'Available', dataIndex: 'available', width: 100 },
              { title: 'Reports', dataIndex: 'reports', width: 90 },
            ]} />
        </Card>
      </Col>
      <Col xs={24} lg={9}>
        {isAdmin && (
          <Card style={{ borderRadius: 12, marginBottom: 16 }} title={<Space><GiftOutlined />Redeem a reward</Space>}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>The worker shows their Reward ID and types their own PIN. Five wrong PINs lock the ID for 15 minutes.</Text>
            <Form form={form} layout="vertical">
              <Form.Item name="reward_code" label="Reward ID" rules={[{ required: true }]}><Input placeholder="RW-XXXX-XXXX" maxLength={14} /></Form.Item>
              <Form.Item name="pin" label="Worker's PIN" rules={[{ required: true }]}><Input.Password maxLength={12} autoComplete="off" /></Form.Item>
              <Form.Item name="points" label="Points to redeem" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
              <Form.Item name="note" label="Reward given"><Input placeholder="e.g. Gold voucher, safety boots" maxLength={255} /></Form.Item>
              <Button type="primary" onClick={redeem} loading={busy} icon={<GiftOutlined />}>Redeem</Button>
            </Form>
          </Card>
        )}
        <Card style={{ borderRadius: 12 }} title="How points are earned">
          {data.catalog.map((c) => <div key={c.kind} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>{c.label}{c.admin_only ? ' *' : ''}</span><b>+{c.points}</b></div>)}
          <Text type="secondary" style={{ fontSize: 12 }}>* company admins only. Levels: {data.levels.map((l) => `${l.name} ${l.min}+`).join(' · ')}</Text>
        </Card>
      </Col>
    </Row>
  );
};

// ------------------------------------------------------------------ setup + routing
const Setup = ({ settings, onSaved }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (settings) form.setFieldsValue(settings.channel); }, [settings, form]);
  if (!settings) return <Card loading />;
  const save = async () => {
    const v = await form.validateFields();
    setSaving(true);
    try { await voiceService.saveSettings(v); message.success('Settings saved'); onSaved(); } catch (e) { message.error(voiceErr(e)); } finally { setSaving(false); }
  };
  return (
    <Card style={{ borderRadius: 12 }}>
      {!settings.server_speech_to_text && (
        <Alert type="info" showIcon style={{ marginBottom: 16 }} message="Server speech-to-text is not switched on yet"
          description="Voice notes are saved and playable, and Chrome / Android phones transcribe on the device. For reliable transcription of every language, add STT_API_KEY on the server (see the setup notes)." />
      )}
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={12}><Form.Item name="enabled" label="Workplace Voice is on" valuePropName="checked"><Switch /></Form.Item></Col>
          <Col xs={24} md={12}><Form.Item name="listed" label="Workers can find us by searching the company name" valuePropName="checked"><Switch /></Form.Item></Col>
        </Row>
        <Form.Item name="slug" label="Public link name" extra={`${portalBase()}/<link name>`}
          rules={[{ required: true }, { pattern: /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/, message: '3-60 lowercase letters, numbers or dashes' }]}>
          <Input addonBefore="/voice/" maxLength={60} />
        </Form.Item>
        <Form.Item name="welcome_message" label="Welcome message (optional)"><TextArea rows={2} maxLength={500} placeholder="e.g. Your report goes straight to the HSE Manager. No blame." /></Form.Item>
        <Row gutter={16}>
          <Col xs={24} md={14}>
            <Form.Item name="languages" label="Languages on the reporting page" extra="Workers can speak in ANY language - the AI understands it. This only changes the on-screen words.">
              <Select mode="multiple" options={settings.languages.map((l) => ({ value: l, label: LANG_LABEL[l] || l }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={10}>
            <Form.Item name="preferred_language" label="Translate reports into">
              <Select options={settings.languages.map((l) => ({ value: l, label: LANG_LABEL[l] || l }))} />
            </Form.Item>
          </Col>
        </Row>
        <Text strong>Identity options for workers</Text>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col xs={24} md={8}><Form.Item name="allow_anonymous" valuePropName="checked" extra="No identity collected"><Switch checkedChildren="Anonymous" unCheckedChildren="Anonymous" /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="allow_protected" valuePropName="checked" extra="SafeTrack holds the name; you never see it"><Switch checkedChildren="Protected" unCheckedChildren="Protected" /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="allow_open" valuePropName="checked" extra="Worker shares name and contact"><Switch checkedChildren="Named" unCheckedChildren="Named" /></Form.Item></Col>
        </Row>
        <Form.Item name="show_projects" label="Let workers pick the project on the page (otherwise use project QR codes)" valuePropName="checked"><Switch /></Form.Item>
        <Text strong>Safety Impact rewards</Text>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col xs={24} md={8}><Form.Item name="rewards_enabled" label="Workers can collect points" valuePropName="checked"><Switch /></Form.Item></Col>
          <Col xs={24} md={8}><Form.Item name="show_leaderboard" label="Show the alias leaderboard to workers" valuePropName="checked"><Switch /></Form.Item></Col>
        </Row>
        <Form.Item name="rewards_note" label="What can points be exchanged for? (shown to workers)">
          <TextArea rows={2} maxLength={500} placeholder="e.g. Silver = canteen voucher, Gold = 200 GHS, Diamond = Safety Champion award" />
        </Form.Item>
        <Button type="primary" onClick={save} loading={saving}>Save settings</Button>
      </Form>
    </Card>
  );
};

const Routing = ({ settings, onSaved }) => {
  const [form] = Form.useForm();
  const [pname, setPname] = useState('');
  const [busy, setBusy] = useState(false);
  if (!settings) return <Card loading />;
  const userName = (id) => settings.users.find((u) => u.id === id)?.name || `#${id}`;
  const projName = (id) => (id ? settings.projects.find((p) => p.id === id)?.name || `Project ${id}` : 'All projects / company-wide');
  const addRule = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try {
      await voiceService.addRoute({ group: v.group, project_id: v.project_id || null, user_ids: v.user_ids });
      message.success('Routing rule saved'); form.resetFields(['user_ids']); onSaved();
    } catch (e) { message.error(voiceErr(e)); } finally { setBusy(false); }
  };
  const addProject = async () => {
    if (pname.trim().length < 2) return;
    setBusy(true);
    try { await voiceService.createProject({ name: pname.trim() }); setPname(''); message.success('Project created'); onSaved(); } catch (e) { message.error(voiceErr(e)); } finally { setBusy(false); }
  };
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={15}>
        <Card style={{ borderRadius: 12 }} title={<Space><ApartmentOutlined />Who receives which reports</Space>}>
          <Alert type="info" showIcon style={{ marginBottom: 12 }} message="How routing works"
            description="The most specific rule wins: a project + type rule, then a project 'all types' rule, then a company-wide type rule, then company-wide 'all types'. With no rule, company admins receive the report. Critical reports always also go to company admins." />
          <Form form={form} layout="vertical" initialValues={{ group: 'safety', project_id: 0 }}>
            <Row gutter={8}>
              <Col xs={24} sm={8}><Form.Item name="project_id" label="Project">
                <Select options={[{ value: 0, label: 'All projects / company-wide' }, ...settings.projects.map((p) => ({ value: p.id, label: p.name }))]} />
              </Form.Item></Col>
              <Col xs={24} sm={7}><Form.Item name="group" label="Report type">
                <Select options={[...Object.keys(GROUP_META), 'all'].map((g) => ({ value: g, label: `${GROUP_META[g]?.emoji || '📋'} ${GROUP_LABEL[g]}` }))} />
              </Form.Item></Col>
              <Col xs={24} sm={9}><Form.Item name="user_ids" label="Send to" rules={[{ required: true, message: 'Choose at least one person' }]}>
                <Select mode="multiple" optionFilterProp="label" placeholder="People" options={settings.users.map((u) => ({ value: u.id, label: `${u.name} (${u.user_type})` }))} />
              </Form.Item></Col>
            </Row>
            <Button type="primary" icon={<PlusOutlined />} onClick={addRule} loading={busy}>Save rule</Button>
          </Form>
          <Table style={{ marginTop: 16 }} size="small" rowKey="id" dataSource={settings.routes} pagination={false} scroll={{ x: 520 }}
            locale={{ emptyText: 'No rules yet - company admins receive everything' }}
            columns={[
              { title: 'Project', dataIndex: 'project_id', render: projName },
              { title: 'Type', dataIndex: 'group', render: (g) => `${GROUP_META[g]?.emoji || '📋'} ${GROUP_LABEL[g]}` },
              { title: 'Send to', dataIndex: 'user_ids', render: (ids) => ids.map((i) => <Tag key={i}>{userName(i)}</Tag>) },
              { title: '', key: 'x', width: 50, render: (_, r) => (
                <Popconfirm title="Delete this rule?" onConfirm={async () => { await voiceService.deleteRoute(r.id); onSaved(); }}>
                  <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ) },
            ]} />
        </Card>
      </Col>
      <Col xs={24} lg={9}>
        <Card style={{ borderRadius: 12 }} title="Projects / sites">
          <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
            <Input value={pname} onChange={(e) => setPname(e.target.value)} placeholder="New project or site name" maxLength={255} onPressEnter={addProject} />
            <Button type="primary" onClick={addProject} loading={busy} icon={<PlusOutlined />}>Add</Button>
          </Space.Compact>
          {settings.projects.length === 0 ? <Text type="secondary">No projects yet. Each project gets its own QR code and routing.</Text>
            : settings.projects.map((p) => <Tag key={p.id} style={{ marginBottom: 6 }}>{p.name}</Tag>)}
        </Card>
      </Col>
    </Row>
  );
};

// ------------------------------------------------------------------ QR + posters
const POSTERS = {
  safety: { title: 'See something unsafe?', color: '#c62828', emoji: '⚠️', line: 'Hazards · Near misses · Unsafe acts · Broken equipment' },
  welfare: { title: 'Is something wrong with your welfare?', color: '#1565c0', emoji: '💧', line: 'Heat · Drinking water · Accommodation · Fatigue · Hygiene' },
  environmental: { title: 'Protect our environment', color: '#2e7d32', emoji: '🌿', line: 'Spills · Waste · Pollution · Chemical storage' },
};
const QrCard = ({ title, url, companyName, logo }) => {
  const ref = useRef(null);
  const dataUrl = () => ref.current?.querySelector('canvas')?.toDataURL('image/png');
  const download = () => {
    const d = dataUrl(); if (!d) return;
    const a = document.createElement('a'); a.href = d; a.download = `workplace-voice-${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`; a.click();
  };
  const poster = (kind) => {
    const p = POSTERS[kind]; const qr = dataUrl(); if (!qr) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Workplace Voice poster</title><style>
@page{size:A4;margin:0}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#111}.pg{width:210mm;min-height:297mm;display:flex;flex-direction:column}
.top{background:${p.color};color:#fff;padding:18mm 14mm 10mm;text-align:center}.top h1{font-size:40px;margin:6px 0}.top div{font-size:18px;opacity:.95}
.mid{flex:1;text-align:center;padding:10mm}.qr{width:105mm;height:105mm;border:6px solid ${p.color};border-radius:10px;padding:4mm;background:#fff}
.steps{display:flex;justify-content:center;gap:12mm;font-size:22px;font-weight:700;margin:8mm 0}.langs{font-size:15px;color:#444;line-height:1.6}
.foot{display:flex;align-items:center;justify-content:space-between;padding:8mm 14mm;border-top:4px solid ${p.color};font-size:14px}.foot img{max-height:18mm;max-width:50mm}</style></head><body><div class="pg">
<div class="top"><div style="font-size:54px">${p.emoji}</div><h1>${esc(p.title)}</h1><div>${esc(p.line)}</div></div>
<div class="mid"><div class="steps"><span>📷 Scan</span><span>🎤 Speak</span><span>📨 Submit</span></div><img class="qr" src="${qr}" alt="QR code" />
<p style="font-size:20px;font-weight:700;margin:6mm 0 2mm">Speak in your own language. You can stay anonymous.</p>
<p class="langs">Scan · Speak · Submit — امسح · تحدث · أرسل — स्कैन करें · बोलें · भेजें — اسکین کریں · بولیں · بھیجیں — স্ক্যান করুন · বলুন · পাঠান — I-scan · Magsalita · Ipadala — Scannez · Parlez · Envoyez — Skani · Ongea · Tuma</p>
<p style="font-size:13px;color:#555">${esc(url)}</p>${title ? `<p style="font-size:16px"><b>${esc(title)}</b></p>` : ''}</div>
<div class="foot">${logo ? `<img src="${esc(logo)}" alt="" />` : '<span></span>'}<span><b>${esc(companyName || '')}</b><br/>SafeTrack Workplace Voice™</span></div></div>
</body></html>`;
    const w = window.open('', '_blank');
    if (!w) { message.warning('Allow pop-ups to print the poster'); return; }
    w.opener = null; w.document.open(); w.document.write(html); w.document.close();
  // no inline script in the pop-up: the site's CSP blocks it
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) { /* print from the browser menu */ } }, 500);
  };
  return (
    <Card size="small" style={{ borderRadius: 12, height: '100%' }} title={title}>
      <div ref={ref} style={{ display: 'flex', justifyContent: 'center' }}><QRCode value={url} size={180} type="canvas" errorLevel="M" /></div>
      <Paragraph copyable={{ text: url }} style={{ fontSize: 12, textAlign: 'center', marginTop: 8, wordBreak: 'break-all' }}>{url}</Paragraph>
      <Space wrap style={{ justifyContent: 'center', width: '100%' }}>
        <Button size="small" icon={<DownloadOutlined />} onClick={download}>PNG</Button>
        <Button size="small" icon={<PrinterOutlined />} onClick={() => poster('safety')}>Safety poster</Button>
        <Button size="small" onClick={() => poster('welfare')}>Welfare</Button>
        <Button size="small" onClick={() => poster('environmental')}>Environmental</Button>
      </Space>
    </Card>
  );
};

const QrTab = ({ settings, companyName, logo }) => {
  if (!settings) return <Card loading />;
  const base = `${portalBase()}/${settings.channel.slug}`;
  return (
    <>
      {!settings.channel.enabled && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="Workplace Voice is switched off - QR codes will show 'not available' until you switch it on in Setup." />}
      <Alert type="info" showIcon style={{ marginBottom: 12 }} message="Put posters where workers gather: gates, canteens, rest areas, toilets, buses and camps. Workers can also open the website and search your company name." />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}><QrCard title="Whole company" url={base} companyName={companyName} logo={logo} /></Col>
        {settings.projects.map((p) => (
          <Col xs={24} sm={12} lg={8} key={p.id}><QrCard title={p.name} url={`${base}?p=${p.id}`} companyName={companyName} logo={logo} /></Col>
        ))}
      </Row>
    </>
  );
};

// ------------------------------------------------------------------ page
const WorkplaceVoicePage = () => {
  const location = useLocation();
  const history = useHistory();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [settings, setSettings] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState('inbox');
  const [refreshKey, setRefreshKey] = useState(0);
  const [company, setCompany] = useState({});
  const openId = params.get('report');

  const [noCompany, setNoCompany] = useState(false);
  const loadSettings = useCallback(() => {
    voiceService.settings().then((r) => {
      const d = r?.data;
      // admin tabs only with real settings (a channel plus the lists they show)
      if (d?.channel) {
        setSettings({ ...d, users: d.users || [], projects: d.projects || [], routes: d.routes || [], languages: d.languages || [], groups: d.groups || [] });
        setIsAdmin(true);
      } else { setIsAdmin(false); }
    }).catch((e) => {
      setIsAdmin(false);
      const msg = `${e?.message || ''} ${e?.data?.error || ''}`;
      if (e?.status === 403 && /company accounts/i.test(msg)) setNoCompany(true);
    });
  }, []);
  useEffect(() => { loadSettings(); }, [loadSettings]);
  useEffect(() => { voiceService.stats(days).then((r) => setStats(r?.data && typeof r.data.total === 'number' ? r.data : null)).catch(() => {}); }, [days, refreshKey]);
  useEffect(() => {
    apiGet('/ai/documents/company-profile').then((res) => {
      const d = res?.data; if (!d?.available) return;
      setCompany({ name: d.name, logo: d.logo_url ? (/^https?:/.test(d.logo_url) ? d.logo_url : `${SERVER_BASE}${d.logo_url}`) : null });
    }).catch(() => {});
  }, []);

  const setOpen = (id) => {
    const p = new URLSearchParams(location.search);
    if (id) p.set('report', id); else p.delete('report');
    history.replace({ search: p.toString() });
    if (!id) setRefreshKey((k) => k + 1);
  };

  const projects = settings?.projects || [];
  const users = settings?.users || [];
  const items = [
    { key: 'inbox', label: <span><InboxOutlined /> Reports</span>, children: <Inbox projects={projects} users={users} isAdmin={isAdmin} companyName={company.name} openId={openId} onOpen={setOpen} refreshKey={refreshKey} /> },
    { key: 'insights', label: <span><BarChartOutlined /> Insights</span>, children: <Insights stats={stats} days={days} setDays={setDays} projects={projects} /> },
    ...(isAdmin ? [
      { key: 'routing', label: <span><ApartmentOutlined /> Routing & projects</span>, children: <Routing settings={settings} onSaved={loadSettings} /> },
      { key: 'rewards', label: <span><TrophyOutlined /> Rewards</span>, children: <RewardsTab isAdmin={isAdmin} /> },
      { key: 'qr', label: <span><QrcodeOutlined /> QR & posters</span>, children: <QrTab settings={settings} companyName={company.name} logo={company.logo} /> },
      { key: 'setup', label: <span><SettingOutlined /> Setup</span>, children: <Setup settings={settings} onSaved={loadSettings} /> },
    ] : []),
  ];

  return (
    <div className="workplace-voice-page" style={{ padding: 16, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>🎤 Workplace Voice</Title>
          <Text type="secondary">Scan. Speak. Submit. Anonymous worker reporting in any language, routed to the right people.</Text>
        </div>
        {settings?.channel && (
          <Space wrap>
            <Tag color={settings.channel.enabled ? 'green' : 'default'}>{settings.channel.enabled ? 'Live' : 'Off'}</Tag>
            <Button icon={<CopyOutlined />} onClick={() => { navigator.clipboard?.writeText(`${portalBase()}/${settings.channel.slug}`); message.success('Link copied'); }}>Copy worker link</Button>
          </Space>
        )}
      </div>
      {noCompany && (
        <Card style={{ borderRadius: 12 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={(
              <span>
                Workplace Voice is set up per company, and this account does not belong to a company.
                <br />SafeTrack staff see the reports of every company in the Command Center.
              </span>
            )}
          >
            <Button type="primary" onClick={() => history.push('/admin/command-center?tab=voice')}>Open Workplace Voice reports (all companies)</Button>
          </Empty>
        </Card>
      )}
      {!noCompany && stats && (
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          {[
            ['Reports', stats.total], ['Open', stats.open], ['Critical open', stats.critical_open, stats.critical_open ? '#cf1322' : undefined],
            ['Late replies', stats.overdue, stats.overdue ? '#cf1322' : undefined], ['Avg first reply (h)', stats.avg_response_hours ?? '—'],
            ['Anonymous', `${stats.anonymous_pct}%`], ['Closed', `${stats.closure_rate}%`], ['Acted on', stats.acted_on, '#389e0d'],
            ['Repeated issues', stats.repeated_issues ?? 0, stats.repeated_issues ? '#d46b08' : undefined], ['Impact points', stats.points_awarded ?? 0, '#d4b106'],
          ].map(([t, v, color]) => (
            <Col xs={12} sm={8} md={6} xl={3} key={t}><Card size="small" style={{ borderRadius: 10 }}><Statistic title={t} value={v} valueStyle={color ? { color } : undefined} /></Card></Col>
          ))}
        </Row>
      )}
      {!noCompany && <Tabs activeKey={tab} onChange={setTab} items={items} />}
      {!noCompany && !isAdmin && settings === null && (
        <Text type="secondary"><CheckCircleOutlined /> You see the reports routed to you. Company admins manage setup, routing and QR codes.</Text>
      )}
    </div>
  );
};

export default WorkplaceVoicePage;
