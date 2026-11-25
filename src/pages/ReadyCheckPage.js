// Ready Check: before a dangerous job the worker confirms each life-saving control. Any control missing = STOP and
// the supervisors are told. The company's own past events for that job are shown first. Optional lone-worker timer.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Alert, Button, Card, Checkbox, Col, Empty, Input, InputNumber, Modal, Progress, Row, Select, Skeleton, Space, Statistic, Table, Tabs, Tag,
  Typography, message,
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled, ReloadOutlined, SoundOutlined, StopOutlined, WarningOutlined,
} from '@ant-design/icons';
import readyCheckService, { errorText, isOffline, newId, queued } from '../services/readyCheckService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const PICTURE = {
  height: '🪜', excavation: '⛏️', confined: '🕳️', energy: '⚡', lifting: '🏗️', vehicle: '🚜', hotwork: '🔥', chemical: '🧪',
  pressure: '💨', machinery: '⚙️', heat: '🌡️', general: '🦺',
};
const STATUS = {
  working: ['blue', 'Working'], stopped: ['red', 'Stopped'], released: ['green', 'Released'], finished: ['default', 'Finished'],
};
const when = (d) => (d ? new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '');
const clock = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const speak = (text) => {
  try {
    if (!window.speechSynthesis) { message.info('This phone cannot read aloud.'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en';
    window.speechSynthesis.speak(u);
  } catch (e) { /* reading aloud is optional */ }
};

const left = (end, now) => {
  const m = Math.round((new Date(end).getTime() - now) / 60000);
  if (m < 0) return `${-m} min overdue`;
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min left` : `${m} min left`;
};

// ------------------------------------------------------------------ what happened here before
const Before = ({ data }) => {
  if (!data) return null;
  const { lessons = [], events = [], weak_controls: weak = [], incident_count: inc = 0, near_miss_count: near = 0 } = data;
  if (!lessons.length && !weak.length && !inc && !near) return null;
  return (
    <Alert type="warning" showIcon icon={<WarningOutlined />} style={{ marginBottom: 16 }} message="This happened here before"
      description={(
        <div>
          {(inc > 0 || near > 0) && (
            <Paragraph style={{ marginBottom: 6 }}>
              Past 3 years, records that mention this kind of work: <b>{inc}</b> incident{inc === 1 ? '' : 's'}, <b>{near}</b> near miss{near === 1 ? '' : 'es'}.
            </Paragraph>
          )}
          {weak.map((w) => <div key={w.control}>Missing {w.times} time{w.times === 1 ? '' : 's'} in 90 days: <b>{w.control}</b></div>)}
          {events.map((e, i) => <div key={i}>{e.date}: {e.title} {e.severity && <Tag>{e.severity}</Tag>}</div>)}
          {lessons.map((l, i) => <div key={i} style={{ marginTop: 6 }}><b>Lesson: {l.title}</b><div>{l.summary}</div></div>)}
        </div>
      )} />
  );
};

// ------------------------------------------------------------------ the worker's check
const Check = ({ meta, cached, onSaved }) => {
  const [task, setTask] = useState(null);
  const [before, setBefore] = useState(null);
  const [answers, setAnswers] = useState({});
  const [place, setPlace] = useState('');
  const [crew, setCrew] = useState(1);
  const [lone, setLone] = useState(false);
  const [minutes, setMinutes] = useState(60);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const ref = useRef(newId());

  const pick = (t) => {
    ref.current = newId();
    setTask(t); setAnswers({}); setDone(null); setBefore(null);
    const id = ref.current;
    readyCheckService.lessons(t.key).then((r) => { if (ref.current === id) setBefore(r.data); }).catch(() => {});
    window.scrollTo(0, 0);
  };
  const reset = () => { ref.current = newId(); setTask(null); setDone(null); setAnswers({}); setLone(false); };
  // a changed answer is a new check: never let the server match it to an earlier attempt
  const set = (id, v) => { ref.current = newId(); setAnswers((a) => ({ ...a, [id]: v })); };
  const open = task ? task.controls.filter((c) => !answers[c.id]).length : 0;
  const missing = task ? task.controls.filter((c) => answers[c.id] === 'no') : [];

  const send = async () => {
    setBusy(true);
    const payload = {
      client_id: ref.current, task_key: task.key, answers, location: place, crew_size: crew || 1, done_at: new Date().toISOString(),
      ...(lone && !missing.length ? { is_lone: true, minutes: minutes || 60 } : {}),
    };
    try {
      const res = await readyCheckService.submit(payload);
      setDone({ ...res.data, sent: true });
      onSaved();
    } catch (e) {
      if (isOffline(e)) {
        const kept = readyCheckService.queue(payload);
        setDone({ result: missing.length ? 'stop' : 'go', task_name: task.name, sent: false, kept, is_lone: Boolean(payload.is_lone) });
        onSaved();
      } else message.error(errorText(e, 'Could not save the check'));
    } finally { setBusy(false); }
  };

  if (done) {
    const stop = done.result === 'stop';
    return (
      <Card style={{ borderRadius: 16, textAlign: 'center', background: stop ? '#fff1f0' : '#f6ffed', borderColor: stop ? '#ff4d4f' : '#52c41a' }}>
        <div role="status">
          {stop ? <CloseCircleFilled style={{ fontSize: 72, color: '#cf1322' }} /> : <CheckCircleFilled style={{ fontSize: 72, color: '#389e0d' }} />}
          <Title level={2} style={{ margin: '8px 0', color: stop ? '#a8071a' : '#237804' }}>{stop ? 'STOP. Do not start.' : 'Controls confirmed'}</Title>
          {stop && missing.length > 0 && <div style={{ marginBottom: 12 }}>{missing.map((c) => <div key={c.id}><b>Missing:</b> {c.text}</div>)}</div>}
          {done.sent && stop && (
            <Paragraph>{done.alerted > 0 ? `${done.alerted} supervisor${done.alerted === 1 ? ' is' : 's are'} being told now.` : 'No supervisor is set up to be told. Tell your supervisor yourself.'}</Paragraph>
          )}
          {done.sent && !stop && done.expected_end && (
            <Paragraph>Timer running until {clock(done.expected_end)}. Press <b>I am OK</b> or <b>Finished</b> before then.</Paragraph>
          )}
          {!done.sent && (
            <Alert type="error" showIcon style={{ textAlign: 'left', marginBottom: 12 }}
              message={done.kept ? 'No signal: saved on this phone, not sent yet' : 'No signal and this phone could not save the check'}
              description={`Nobody has been told${done.is_lone ? ' and no lone-worker timer is running' : ''}. ${stop || done.is_lone ? 'Tell your supervisor now. ' : ''}${done.kept ? 'It will be sent when this page is open with signal.' : 'Do it again when you have signal.'}`} />
          )}
          {!stop && <Paragraph type="secondary">Stop and check again if anything changes: people, weather, equipment or the plan.</Paragraph>}
          <Button type="primary" size="large" onClick={reset}>{stop ? 'Check again after it is fixed' : 'Done'}</Button>
        </div>
      </Card>
    );
  }

  if (!task) {
    return (
      <div>
        <Title level={4} style={{ marginTop: 0 }}>What are you about to do?</Title>
        {cached && <Alert type="info" showIcon style={{ marginBottom: 12 }} message="No signal. You can still do the check; it will be sent later." />}
        <Row gutter={[12, 12]}>
          {meta.tasks.map((t) => (
            <Col xs={12} sm={8} lg={6} key={t.key}>
              <button type="button" onClick={() => pick(t)} style={{ width: '100%', minHeight: 116, padding: 12, borderRadius: 14, border: '1px solid #d9d9d9', background: '#fff', color: '#1f1f1f', cursor: 'pointer', font: 'inherit' }}>
                <span aria-hidden="true" style={{ fontSize: 34, display: 'block' }}>{PICTURE[t.key] || '🦺'}</span>
                <b>{t.name}</b>
              </button>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div>
      <Button type="text" icon={<ArrowLeftOutlined />} onClick={reset} style={{ paddingLeft: 0 }}>Choose other work</Button>
      <Title level={3} style={{ marginTop: 4 }}><span aria-hidden="true">{PICTURE[task.key]}</span> {task.name}</Title>
      <Before data={before} />
      <Paragraph type="secondary">Answer only what you can see right now. Not sure means No.</Paragraph>
      {task.controls.map((c, i) => (
        <Card key={c.id} size="small" style={{ marginBottom: 10, borderRadius: 12, borderLeft: `5px solid ${{ yes: '#52c41a', no: '#ff4d4f', na: '#8c8c8c' }[answers[c.id]] || '#d9d9d9'}` }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
            <Text strong style={{ flex: 1, fontSize: 16 }} id={`rc-${c.id}`}>{i + 1}. {c.text}</Text>
            <Button aria-label="Read aloud" icon={<SoundOutlined />} onClick={() => speak(c.text)} />
          </div>
          <div role="group" aria-labelledby={`rc-${c.id}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[['yes', 'Yes, I see it', '#389e0d'], ['no', 'No', '#cf1322'], ...(c.optional ? [['na', 'Not needed', '#595959']] : [])].map(([v, label, color]) => (
              <button key={v} type="button" aria-pressed={answers[c.id] === v} onClick={() => set(c.id, v)}
                style={{ flex: '1 1 90px', minHeight: 48, borderRadius: 10, border: `2px solid ${color}`, background: answers[c.id] === v ? color : '#fff', color: answers[c.id] === v ? '#fff' : color, fontWeight: 600, cursor: 'pointer', font: 'inherit' }}>
                {label}
              </button>
            ))}
          </div>
        </Card>
      ))}
      <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={16}><label htmlFor="rc-place"><Text>Where</Text></label><Input id="rc-place" value={place} maxLength={200} placeholder="Example: Tank 4, north side" onChange={(e) => setPlace(e.target.value)} /></Col>
          <Col xs={24} sm={8}><label htmlFor="rc-crew"><Text>People in the crew</Text></label><InputNumber id="rc-crew" min={1} max={200} value={crew} onChange={setCrew} style={{ width: '100%' }} /></Col>
          <Col xs={24}>
            <Checkbox checked={lone} disabled={!meta.supervisors} onChange={(e) => setLone(e.target.checked)}>I am working alone: alert my supervisors if I do not check in</Checkbox>
            {!meta.supervisors && <div><Text type="secondary">Nobody in your company can receive this alert yet.</Text></div>}
            {lone && (
              <div style={{ marginTop: 8 }}>
                <Space wrap><Text>Finished in</Text>
                  <Select value={minutes} onChange={setMinutes} style={{ width: 130 }} options={[15, 30, 60, 90, 120, 180, 240, 480].map((m) => ({ value: m, label: m < 60 ? `${m} min` : `${m / 60} h` }))} />
                </Space>
                <div><Text type="secondary">The alert is an app notice and an e-mail to your supervisors, sent about 5 minutes after the time ends. It is not an emergency service.</Text></div>
              </div>
            )}
          </Col>
        </Row>
      </Card>
      <Button type="primary" size="large" block danger={missing.length > 0} loading={busy} disabled={open > 0} onClick={send} style={{ minHeight: 52 }}>
        {open > 0 ? `${open} question${open === 1 ? '' : 's'} left` : missing.length ? 'Stop work and tell supervisors' : 'Confirm controls'}
      </Button>
    </div>
  );
};

// ------------------------------------------------------------------ my running jobs
const Mine = ({ rows, now, reload }) => {
  const [busy, setBusy] = useState(null);
  const act = async (fn, id) => {
    setBusy(id);
    try { await fn(); message.success('Saved'); } catch (e) { message.error(isOffline(e) ? 'No signal. This was not sent.' : errorText(e)); }
    setBusy(null);
    reload();
  };
  const running = rows.filter((r) => r.status === 'working' && r.expected_end);
  return running.map((r) => {
    const late = new Date(r.expected_end).getTime() < now;
    return (
      <Alert key={r.id} type={late ? 'error' : 'info'} showIcon style={{ marginBottom: 12 }} message={`${r.task_name}: ${left(r.expected_end, now)}`}
        description={(
          <Space wrap>
            <Button type="primary" loading={busy === r.id} onClick={() => act(() => readyCheckService.extend(r.id, 30), r.id)}>I am OK, 30 more minutes</Button>
            <Button loading={busy === r.id} onClick={() => act(() => readyCheckService.finish(r.id), r.id)}>Finished</Button>
          </Space>
        )} />
    );
  });
};

const History = ({ rows }) => (rows.length ? rows.map((r) => (
  <Card key={r.id} size="small" style={{ marginBottom: 8, borderRadius: 12 }}>
    <Space wrap><Text strong>{r.task_name}</Text><Tag color={STATUS[r.status]?.[0]}>{STATUS[r.status]?.[1] || r.status}</Tag>{r.location && <Text type="secondary">{r.location}</Text>}</Space>
    <div><Text type="secondary">{when(r.done_at)}{r.controls_total ? ` · ${r.controls_ok} of ${r.controls_total} controls in place` : ''}</Text></div>
    {r.kind === 'stop' && r.note && <div>{r.note}</div>}
    {r.resolution_note && <div>Supervisor: {r.resolution_note}</div>}
  </Card>
)) : <Empty description="No checks yet" />);

// ------------------------------------------------------------------ supervisor board
const Board = ({ meta, now, onChange }) => {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [ask, setAsk] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try { const r = await readyCheckService.board(); setD(r.data); setErr(''); } catch (e) { setErr(errorText(e, 'Could not load the board')); }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  const label = useMemo(() => Object.fromEntries(meta.tasks.flatMap((t) => t.controls.map((c) => [`${t.key}:${c.id}`, c.text]))), [meta]);
  const save = async () => {
    setBusy(true);
    try {
      await (ask.mode === 'release' ? readyCheckService.release(ask.rec.id, note) : readyCheckService.finish(ask.rec.id, note));
      message.success('Saved'); setAsk(null); setNote(''); load(); onChange();
    } catch (e) { message.error(errorText(e)); }
    setBusy(false);
  };
  if (!d) return err ? <Alert type="error" showIcon message={err} action={<Button onClick={load}>Try again</Button>} /> : <Skeleton active />;
  const color = (s) => (s >= 95 ? '#389e0d' : s >= 80 ? '#d48806' : '#cf1322');
  return (
    <div>
      {err && <Alert type="warning" showIcon style={{ marginBottom: 12 }} message="Showing older data: the board could not refresh." />}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Stopped now" value={d.stopped.length} valueStyle={{ color: d.stopped.length ? '#cf1322' : undefined }} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Lone workers out" value={d.out.length} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Checks, 30 days" value={d.checks_30d} /></Card></Col>
        <Col xs={12} md={6}><Card size="small"><Statistic title="Controls in place" value={d.score === null ? 'No data' : d.score} suffix={d.score === null ? '' : '%'} valueStyle={{ color: d.score === null ? undefined : color(d.score) }} /></Card></Col>
      </Row>
      <Title level={5}>Stopped work</Title>
      {d.stopped.length === 0 && <Paragraph type="secondary">No work is stopped.</Paragraph>}
      {d.stopped.map((r) => (
        <Card key={r.id} size="small" style={{ marginBottom: 8, borderLeft: '5px solid #ff4d4f', borderRadius: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <Text strong>{r.task_name}</Text> <Text type="secondary">{r.worker_name}{r.location ? `, ${r.location}` : ''} · {when(r.done_at)}</Text>
              {r.missing.map((m) => <div key={m}>Missing: {label[`${r.task_key}:${m}`] || m}</div>)}
              {r.note && <div>{r.note}</div>}
            </div>
            <Button type="primary" onClick={() => { setNote(''); setAsk({ mode: 'release', rec: r }); }}>It is fixed</Button>
          </div>
        </Card>
      ))}
      <Title level={5} style={{ marginTop: 16 }}>Lone workers</Title>
      {d.out.length === 0 && <Paragraph type="secondary">Nobody has a timer running.</Paragraph>}
      {d.out.map((r) => (
        <Card key={r.id} size="small" style={{ marginBottom: 8, borderRadius: 12, borderLeft: `5px solid ${r.overdue ? '#ff4d4f' : '#1677ff'}` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' }}>
            <div><Text strong>{r.worker_name}</Text> <Tag color={r.overdue ? 'red' : 'blue'}>{left(r.expected_end, now)}</Tag><div><Text type="secondary">{r.task_name}{r.location ? `, ${r.location}` : ''}</Text></div></div>
            <Button onClick={() => { setNote(''); setAsk({ mode: 'finish', rec: r }); }}>Confirmed safe</Button>
          </div>
        </Card>
      ))}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Title level={5}>Controls in place by work type, 30 days</Title>
          {d.tasks.length ? (
            <Table size="small" rowKey="task" pagination={false} scroll={{ x: 420 }} dataSource={d.tasks} columns={[
              { title: 'Work', dataIndex: 'task' }, { title: 'Checks', dataIndex: 'checks', width: 80 }, { title: 'Stops', dataIndex: 'stops', width: 70 },
              { title: 'In place', dataIndex: 'score', width: 130, render: (s) => (s === null ? 'No data' : <Progress percent={s} size="small" strokeColor={color(s)} format={(p) => `${p}%`} />) },
            ]} />
          ) : <Empty description="No checks in the last 30 days" />}
        </Col>
        <Col xs={24} lg={12}>
          <Title level={5}>Controls most often missing</Title>
          {d.missing.length ? d.missing.map((m) => (
            <div key={m.task + m.control} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}><Tag color="red">{m.times}</Tag><div style={{ minWidth: 0 }}>{m.control}<div><Text type="secondary">{m.task}</Text></div></div></div>
          )) : <Empty description="Nothing missing" />}
        </Col>
      </Row>
      <Paragraph type="secondary" style={{ marginTop: 16 }}>Scores come from what workers reported. Check them against site inspections.</Paragraph>
      <Modal open={Boolean(ask)} title={ask?.mode === 'release' ? 'What was fixed?' : 'How did you confirm they are safe?'} okText={ask?.mode === 'release' ? 'Release work' : 'Close timer'} confirmLoading={busy}
        okButtonProps={{ disabled: note.trim().length < (ask?.mode === 'release' ? 10 : 5) }} onOk={save} onCancel={() => setAsk(null)}>
        <TextArea rows={4} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder={ask?.mode === 'release' ? 'Example: guardrail fitted on the east edge, I checked it myself' : 'Example: spoke to them by phone at 14:20'} />
      </Modal>
    </div>
  );
};

// ------------------------------------------------------------------ page
const ReadyCheckPage = () => {
  const history = useHistory();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [meta, setMeta] = useState(null);
  const [cached, setCached] = useState(false);
  const [err, setErr] = useState('');
  const [mine, setMine] = useState([]);
  const [waiting, setWaiting] = useState(queued().length);
  const [now, setNow] = useState(Date.now());
  const [stop, setStop] = useState(params.get('stop') === '1');
  const [why, setWhy] = useState('');
  const [where, setWhere] = useState('');
  const [busy, setBusy] = useState(false);
  const stopId = useRef(newId());

  const loadMine = useCallback(() => readyCheckService.mine().then((r) => setMine(Array.isArray(r.data) ? r.data : [])).catch(() => {}), []);
  const load = useCallback(async () => {
    try {
      const r = await readyCheckService.tasks();
      if (!Array.isArray(r.data?.tasks)) throw new Error('Ready Check is not available yet.');
      setMeta(r.data); setCached(r.cached); setErr('');
    } catch (e) { setErr(isOffline(e) ? 'No signal. Open this page once with signal so it also works without it.' : errorText(e)); }
  }, []);
  const flush = useCallback(async () => {
    if (queued().length) {
      const r = await readyCheckService.flush();
      if (r.sent) message.success(`${r.sent} saved check${r.sent === 1 ? '' : 's'} sent`);
      r.rejected.forEach((x) => message.error(`A saved check was refused: ${x}`));
    }
    setWaiting(queued().length);
    loadMine();
  }, [loadMine]);

  useEffect(() => {
    load(); flush();
    const online = () => { load(); flush(); };
    window.addEventListener('online', online);
    const a = setInterval(() => setNow(Date.now()), 15000);
    const b = setInterval(flush, 60000);
    return () => { window.removeEventListener('online', online); clearInterval(a); clearInterval(b); };
  }, [load, flush]);
  useEffect(() => { if (params.get('stop') === '1') setStop(true); }, [params]);

  const closeStop = () => { setStop(false); if (params.get('stop')) history.replace('/ready-check'); };
  const sendStop = async () => {
    setBusy(true);
    const payload = { client_id: stopId.current, kind: 'stop', note: why, location: where, done_at: new Date().toISOString() };
    try {
      const r = await readyCheckService.submit(payload);
      Modal.warning({ title: 'Work stopped', content: r.data?.alerted ? `${r.data.alerted} supervisor(s) are being told now.` : 'No supervisor is set up to be told. Tell your supervisor yourself.' });
      closeStop(); setWhy(''); setWhere(''); stopId.current = newId();
    } catch (e) {
      if (isOffline(e)) {
        const kept = readyCheckService.queue(payload);
        Modal.error({ title: 'No signal: nobody has been told', content: `Stop the work and tell your supervisor yourself now.${kept ? ' This report will be sent when this page is open with signal.' : ''}` });
        if (kept) { closeStop(); setWhy(''); setWhere(''); stopId.current = newId(); }
      } else message.error(errorText(e));
    }
    setBusy(false); setWaiting(queued().length); loadMine();
  };

  const tab = ['check', 'mine', 'board'].includes(params.get('tab')) ? params.get('tab') : 'check';
  const afterSave = () => { setWaiting(queued().length); loadMine(); };
  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <Title level={2} style={{ margin: 0 }}>Ready Check</Title>
          <Text type="secondary">One minute before the job. One missing control means stop.</Text>
        </div>
        <Button danger type="primary" size="large" icon={<StopOutlined />} onClick={() => setStop(true)}>Stop work</Button>
      </div>
      {waiting > 0 && (
        <Alert type="warning" showIcon style={{ marginBottom: 12 }} message={`${waiting} check${waiting === 1 ? '' : 's'} on this phone not sent yet`} action={<Button icon={<ReloadOutlined />} onClick={flush}>Send now</Button>} />
      )}
      <Mine rows={mine} now={now} reload={loadMine} />
      {err && <Alert type="error" showIcon message={err} action={<Button onClick={load}>Try again</Button>} />}
      {!meta && !err && <Skeleton active />}
      {meta && (
        <Tabs activeKey={tab === 'board' && !meta.is_staff ? 'check' : tab} onChange={(k) => history.replace(`/ready-check?tab=${k}`)} items={[
          { key: 'check', label: 'Check', children: <Check meta={meta} cached={cached} onSaved={afterSave} /> },
          { key: 'mine', label: 'My checks', children: <History rows={mine} /> },
          ...(meta.is_staff ? [{ key: 'board', label: 'Board', children: <Board meta={meta} now={now} onChange={loadMine} /> }] : []),
        ]} />
      )}
      <Modal open={stop} title="Stop work" okText="Stop work now" okButtonProps={{ danger: true, disabled: why.trim().length < 5 }} confirmLoading={busy} onOk={sendStop} onCancel={closeStop}>
        <label htmlFor="rc-why"><Text strong>What is unsafe?</Text></label>
        <TextArea id="rc-why" rows={3} maxLength={1000} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Example: cracked sling on the crane" />
        <label htmlFor="rc-where" style={{ display: 'block', marginTop: 12 }}><Text strong>Where?</Text></label>
        <Input id="rc-where" maxLength={200} value={where} onChange={(e) => setWhere(e.target.value)} />
        <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>Your name and this report go to your company's supervisors. For an anonymous report use Workplace Voice.</Paragraph>
      </Modal>
    </div>
  );
};

export default ReadyCheckPage;
