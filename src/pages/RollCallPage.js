// Evacuation roll call: a supervisor starts it, everyone taps "I am safe" or "I need help", wardens mark the rest,
// the list shows who is still missing. Closed roll calls stay as drill records.
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Button, Card, Col, Empty, Input, Modal, Radio, Row, Segmented, Skeleton, Space, Statistic, Table, Tag, Typography, message,
} from 'antd';
import { AlertOutlined, CheckCircleFilled, ExclamationCircleFilled, UserAddOutlined } from '@ant-design/icons';
import { musterService, errorText } from '../services/siteSafetyService';

const { Title, Text, Paragraph } = Typography;
const COLOR = { safe: 'green', help: 'red', missing: 'orange', away: 'default' };
const LABEL = { safe: 'Safe', help: 'Needs help', missing: 'Not yet seen', away: 'Off site' };
const when = (d) => (d ? new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '');
const mins = (a, b) => Math.max(0, Math.round((new Date(b || Date.now()) - new Date(a)) / 60000));

const Me = ({ event, status, reload }) => {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const send = async (s) => {
    setBusy(true);
    try { await musterService.me(event.id, s, note); message.success(s === 'safe' ? 'Marked safe' : 'Supervisors are being told'); reload(); } catch (e) { message.error(errorText(e)); }
    setBusy(false);
  };
  return (
    <Card style={{ borderRadius: 16, background: event.kind === 'real' ? '#fff1f0' : '#fffbe6', borderColor: event.kind === 'real' ? '#ff4d4f' : '#faad14', marginBottom: 16 }}>
      <Title level={3} style={{ marginTop: 0 }}><AlertOutlined /> {event.kind === 'real' ? 'EVACUATION' : 'EVACUATION DRILL'}</Title>
      {event.reason && <Paragraph>{event.reason}</Paragraph>}
      <Paragraph><b>Go to:</b> {event.assembly_point || 'your assembly point'}{event.site ? ` (${event.site})` : ''}</Paragraph>
      {status === 'safe' ? (
        <Alert type="success" showIcon icon={<CheckCircleFilled />} message="You are marked safe." />
      ) : status === 'help' ? (
        <Alert type="error" showIcon message="Supervisors know you need help. Stay where it is safe if you can." />
      ) : null}
      <Input.TextArea rows={2} maxLength={300} placeholder="Optional: where are you, what help do you need" value={note} onChange={(e) => setNote(e.target.value)} style={{ margin: '12px 0' }} />
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12}><Button block type="primary" size="large" style={{ minHeight: 56, background: '#389e0d', borderColor: '#389e0d' }} loading={busy} onClick={() => send('safe')}>I am safe</Button></Col>
        <Col xs={24} sm={12}><Button block danger type="primary" size="large" style={{ minHeight: 56 }} loading={busy} onClick={() => send('help')}>I need help</Button></Col>
      </Row>
      <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>In immediate danger, call your local emergency number first.</Paragraph>
    </Card>
  );
};

const Warden = ({ event, reload }) => {
  const [filter, setFilter] = useState('open');
  const [visitor, setVisitor] = useState('');
  const [closing, setClosing] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const mark = async (payload) => {
    try { await musterService.mark(event.id, payload); reload(); } catch (e) { message.error(errorText(e)); }
  };
  const close = async () => {
    setBusy(true);
    try { await musterService.close(event.id, note); message.success('Roll call closed'); setClosing(false); reload(); } catch (e) { message.error(errorText(e)); }
    setBusy(false);
  };
  const people = (event.people || []).filter((p) => filter === 'all' || p.status === 'missing' || p.status === 'help');
  const c = event.counts || {};
  return (
    <div>
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Accounted for" value={`${event.accounted} / ${event.total}`} valueStyle={{ color: event.accounted === event.total ? '#389e0d' : undefined }} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Not yet seen" value={c.missing} valueStyle={{ color: c.missing ? '#d46b08' : undefined }} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Need help" value={c.help} valueStyle={{ color: c.help ? '#cf1322' : undefined }} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Minutes running" value={mins(event.started_at)} /></Card></Col>
      </Row>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', marginBottom: 8 }}>
        <Segmented value={filter} onChange={setFilter} options={[{ label: 'Still to find', value: 'open' }, { label: 'Everyone', value: 'all' }]} />
        <Space.Compact style={{ maxWidth: 360, width: '100%' }}>
          <Input placeholder="Visitor or contractor name" maxLength={160} value={visitor} onChange={(e) => setVisitor(e.target.value)} />
          <Button icon={<UserAddOutlined />} disabled={visitor.trim().length < 2} onClick={() => { mark({ name: visitor, status: 'safe' }); setVisitor(''); }}>Add safe</Button>
        </Space.Compact>
      </div>
      {people.length === 0 ? <Empty description={filter === 'open' ? 'Everyone is accounted for' : 'Nobody in this company'} /> : people.map((p) => (
        <Card key={p.user_id || `v${p.mark_id}`} size="small" style={{ marginBottom: 8, borderRadius: 12, borderLeft: `5px solid ${{ safe: '#52c41a', help: '#ff4d4f', missing: '#fa8c16', away: '#bfbfbf' }[p.status]}` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ minWidth: 0, flex: '1 1 200px' }}>
              <Text strong>{p.name}</Text> <Tag color={COLOR[p.status]}>{LABEL[p.status]}</Tag>{p.visitor && <Tag>Visitor</Tag>}
              {p.note && <div><Text type="secondary">{p.note}</Text></div>}
              {p.marked_at && <div><Text type="secondary">{p.self_marked ? 'Marked by themself' : 'Marked by a warden'} at {new Date(p.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></div>}
            </div>
            <Space wrap>
              {p.status !== 'safe' && <Button size="small" onClick={() => mark({ ...(p.user_id ? { user_id: p.user_id } : { mark_id: p.mark_id }), status: 'safe' })}>Seen safe</Button>}
              {p.user_id && p.status !== 'away' && <Button size="small" onClick={() => mark({ user_id: p.user_id, status: 'away' })}>Off site</Button>}
              {p.status !== 'missing' && <Button size="small" type="text" onClick={() => mark({ ...(p.user_id ? { user_id: p.user_id } : { mark_id: p.mark_id }), status: 'missing' })}>Undo</Button>}
            </Space>
          </div>
        </Card>
      ))}
      <Button danger block style={{ marginTop: 12 }} onClick={() => setClosing(true)}>Close roll call</Button>
      <Modal open={closing} title="Close roll call" okText="Close" confirmLoading={busy} onOk={close} onCancel={() => setClosing(false)}>
        {(c.missing + c.help) > 0 && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message={`${c.missing + c.help} people are not accounted for. Write what was done about them.`} />}
        <Input.TextArea rows={4} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Example: all clear given by the fire brigade at 10:42" />
      </Modal>
    </div>
  );
};

const Start = ({ reload }) => {
  const [form, setForm] = useState({ kind: 'drill', reason: '', site: '', assembly_point: '' });
  const [busy, setBusy] = useState(false);
  const go = () => Modal.confirm({
    title: form.kind === 'real' ? 'Start a REAL evacuation roll call?' : 'Start an evacuation drill?',
    content: form.kind === 'real' ? 'Everyone in your company gets an app alert and an e-mail now.' : 'Everyone in your company gets an app alert now.',
    okText: 'Start', okButtonProps: { danger: form.kind === 'real' },
    onOk: async () => {
      setBusy(true);
      try { const r = await musterService.start(form); message.success(`Started. ${r.data?.notified || 0} people alerted.`); reload(); } catch (e) { message.error(errorText(e)); }
      setBusy(false);
    },
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Card style={{ borderRadius: 16, marginBottom: 16 }} title="Start a roll call">
      <Radio.Group value={form.kind} onChange={set('kind')} optionType="button" buttonStyle="solid" options={[{ label: 'Drill', value: 'drill' }, { label: 'Real evacuation', value: 'real' }]} />
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} md={8}><Input placeholder="Assembly point (e.g. Gate B)" maxLength={200} value={form.assembly_point} onChange={set('assembly_point')} /></Col>
        <Col xs={24} md={8}><Input placeholder="Site" maxLength={200} value={form.site} onChange={set('site')} /></Col>
        <Col xs={24} md={8}><Input placeholder="Reason (e.g. gas alarm)" maxLength={300} value={form.reason} onChange={set('reason')} /></Col>
      </Row>
      <Button type="primary" danger={form.kind === 'real'} size="large" style={{ marginTop: 12 }} loading={busy} onClick={go}>Start roll call</Button>
      <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>The alert is an app notice (and an e-mail for a real evacuation). Keep using your alarm and emergency plan.</Paragraph>
    </Card>
  );
};

const RollCallPage = () => {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [history, setHistory] = useState([]);
  const [open, setOpen] = useState(null);
  const load = useCallback(async () => {
    try {
      const r = await musterService.current();
      setD(r.data); setErr('');
      if (r.data?.is_staff) musterService.history().then((h) => setHistory(h.data || [])).catch(() => {});
    } catch (e) { setErr(errorText(e, 'Could not load the roll call')); }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);
  const show = async (id) => { try { setOpen((await musterService.get(id)).data); } catch (e) { message.error(errorText(e)); } };
  const ev = d?.event;
  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
      <Title level={2} style={{ marginTop: 0 }}>Evacuation roll call</Title>
      {err && <Alert type="error" showIcon message={err} action={<Button onClick={load}>Try again</Button>} style={{ marginBottom: 12 }} />}
      {!d && !err && <Skeleton active />}
      {ev && <Me event={ev} status={d.my_status} reload={load} />}
      {ev && d.is_staff && ev.people && <Warden event={ev} reload={load} />}
      {d && !ev && d.is_staff && <Start reload={load} />}
      {d && !ev && !d.is_staff && <Empty description="No roll call is running. When one starts you will get an alert." />}
      {d?.is_staff && history.length > 0 && (
        <Card title="Past roll calls and drills" style={{ marginTop: 16, borderRadius: 16 }}>
          <Table size="small" rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 560 }} dataSource={history.filter((h) => h.status === 'closed')} columns={[
            { title: 'Date', dataIndex: 'started_at', render: when },
            { title: 'Type', dataIndex: 'kind', render: (k) => <Tag color={k === 'real' ? 'red' : 'gold'}>{k === 'real' ? 'Real' : 'Drill'}</Tag> },
            { title: 'Accounted', render: (_, r) => (r.summary ? `${r.summary.accounted} / ${r.summary.total}` : '') },
            { title: 'Last person safe', render: (_, r) => (r.summary?.minutes_to_last_safe != null ? `${r.summary.minutes_to_last_safe} min` : '') },
            { title: '', render: (_, r) => <Button size="small" onClick={() => show(r.id)}>Open</Button> },
          ]} />
        </Card>
      )}
      <Modal open={Boolean(open)} footer={null} onCancel={() => setOpen(null)} title={open ? `${open.kind === 'real' ? 'Evacuation' : 'Drill'} on ${when(open.started_at)}` : ''} width={640}>
        {open && (
          <div>
            {open.close_note && <Alert type="info" showIcon message={open.close_note} style={{ marginBottom: 12 }} />}
            {(open.people || []).map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', padding: '4px 0' }}>
                <span>{p.name}{p.visitor ? ' (visitor)' : ''}</span><Tag color={COLOR[p.status]}>{p.status === 'help' ? <ExclamationCircleFilled /> : null} {LABEL[p.status]}</Tag>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RollCallPage;
