// Daily Toolbox Talks: AI talks built from the user's own incidents / near misses / observations / permits and
// today's weather, or from a typed topic. View, read aloud, quiz the crew, print, share and record attendance.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Alert, Button, Card, Col, Empty, Form, Input, InputNumber, Modal, Popconfirm, Radio, Row, Segmented, Select, Skeleton,
  Space, Spin, Statistic, Switch, Table, Tabs, Tag, Tooltip, Typography, message,
} from 'antd';
import {
  SoundOutlined, ThunderboltOutlined, EditOutlined, PrinterOutlined, CopyOutlined, ShareAltOutlined, TeamOutlined,
  CheckCircleOutlined, FireOutlined, CloudOutlined, AlertOutlined, EnvironmentOutlined, DeleteOutlined, ReloadOutlined,
  PauseCircleOutlined, BulbOutlined, SafetyOutlined, QuestionCircleOutlined, HistoryOutlined, AimOutlined,
} from '@ant-design/icons';
import toolboxService, { TBT_LANGUAGES, errorText } from '../services/toolboxService';
import { apiGet } from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const LOC_KEY = 'tbt:prefs';

const readPrefs = () => {
  try { return JSON.parse(localStorage.getItem(LOC_KEY) || '{}') || {}; } catch (e) { return {}; }
};
const savePrefs = (p) => { try { localStorage.setItem(LOC_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ } };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Plain text version (copy / WhatsApp / read aloud)
export const talkToText = (talk, { forSpeech = false } = {}) => {
  const c = talk?.content || {};
  const L = [];
  L.push(c.title || talk?.title || 'Toolbox talk');
  if (!forSpeech && talk?.talk_date) L.push(`Date: ${talk.talk_date}`);
  if (c.opening) L.push('', c.opening);
  (c.key_points || []).forEach((k, i) => L.push('', `${i + 1}. ${k.heading ? `${k.heading}: ` : ''}${k.detail}`));
  if (c.hazards?.length) L.push('', `Hazards: ${c.hazards.join('; ')}`);
  if (c.controls?.length) L.push('', `Controls: ${c.controls.join('; ')}`);
  if (c.ppe?.length) L.push('', `PPE: ${c.ppe.join(', ')}`);
  if (c.our_records) L.push('', `Our records: ${c.our_records}`);
  if (c.case_study?.summary) L.push('', `Case study (${c.case_study.kind}): ${c.case_study.summary} Lesson: ${c.case_study.lesson}`);
  if (c.weather_note) L.push('', `Weather: ${c.weather_note}`);
  if (c.discussion_questions?.length) { L.push('', 'Discussion:'); c.discussion_questions.forEach((q) => L.push(`- ${q}`)); }
  if (c.commitments?.length) { L.push('', 'Our commitments today:'); c.commitments.forEach((q) => L.push(`- ${q}`)); }
  if (c.stop_work_reminder) L.push('', c.stop_work_reminder);
  if (c.closing) L.push('', c.closing);
  return L.join('\n');
};

const printTalk = (talk, company) => {
  const c = talk?.content || {};
  const list = (arr) => (arr?.length ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  const rows = Math.max(12, (talk?.attendees?.length || 0) + 4);
  const att = (talk?.attendees || []);
  const logo = company?.logo_src ? `<img src="${esc(company.logo_src)}" alt="" style="max-height:48px;max-width:160px;object-fit:contain" />` : '';
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(c.title || talk?.title)}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;color:#222;margin:24px;line-height:1.45}h1{font-size:22px;margin:4px 0}
h2{font-size:15px;margin:18px 0 6px;color:#1E3D58;border-bottom:1px solid #ddd;padding-bottom:3px}.meta{color:#555;font-size:12px}
.box{background:#fff7e6;border-left:4px solid #fa8c16;padding:8px 12px;margin:10px 0}table{width:100%;border-collapse:collapse;margin-top:8px}
td,th{border:1px solid #999;padding:6px;font-size:12px;text-align:left}.hdr{display:flex;align-items:center;gap:14px;border-bottom:3px solid #1E3D58;padding-bottom:8px}
@media print{.noprint{display:none}}</style></head><body>
<div class="hdr">${logo}<div><div style="font-weight:700;font-size:16px">${esc(company?.name || '')}</div><div class="meta">Toolbox Talk Record</div></div></div>
<h1>${esc(c.title || talk?.title)}</h1>
<div class="meta">Date: ${esc(talk?.talk_date)} · Duration: ${esc(talk?.duration_minutes)} min · Presenter: ${esc(talk?.presenter || '')} · Location: ${esc(talk?.location || '')}</div>
${c.why_today ? `<div class="box"><b>Why today:</b> ${esc(c.why_today)}</div>` : ''}
${c.opening ? `<h2>Opening</h2><p>${esc(c.opening)}</p>` : ''}
${(c.key_points || []).length ? `<h2>Key points</h2><ol>${c.key_points.map((k) => `<li>${k.heading ? `<b>${esc(k.heading)}:</b> ` : ''}${esc(k.detail)}</li>`).join('')}</ol>` : ''}
${c.hazards?.length ? `<h2>Hazards</h2>${list(c.hazards)}` : ''}${c.controls?.length ? `<h2>Controls</h2>${list(c.controls)}` : ''}
${c.ppe?.length ? `<h2>PPE</h2><p>${esc(c.ppe.join(', '))}</p>` : ''}
${c.our_records ? `<h2>What our records tell us</h2><p>${esc(c.our_records)}</p>` : ''}
${c.case_study?.summary ? `<h2>Case study (${esc(c.case_study.kind)}): ${esc(c.case_study.title)}</h2><p>${esc(c.case_study.summary)}</p><p><b>Lesson:</b> ${esc(c.case_study.lesson)}</p>` : ''}
${c.weather_note ? `<h2>Today's weather</h2><p>${esc(c.weather_note)}</p>` : ''}
${c.discussion_questions?.length ? `<h2>Discussion questions</h2>${list(c.discussion_questions)}` : ''}
${c.commitments?.length ? `<h2>Our commitments today</h2>${list(c.commitments)}` : ''}
${c.stop_work_reminder ? `<div class="box"><b>Stop work:</b> ${esc(c.stop_work_reminder)}</div>` : ''}
${c.closing ? `<p>${esc(c.closing)}</p>` : ''}
<h2>Attendance</h2><table><tr><th style="width:5%">#</th><th>Name</th><th style="width:30%">Signature</th></tr>
${Array.from({ length: rows }).map((_, i) => `<tr><td>${i + 1}</td><td>${esc(att[i] || '')}</td><td></td></tr>`).join('')}</table>
<p class="meta" style="margin-top:16px">Presenter signature: ____________________ &nbsp; Supervisor signature: ____________________</p>
</body></html>`;
  const w = window.open('', '_blank');
  if (!w) { message.warning('Allow pop-ups to print the talk'); return; }
  w.opener = null;
  w.document.open(); w.document.write(html); w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (e) { /* user can use the button */ } }, 400);
};

// ------------------------------------------------------------------ quiz
const Quiz = ({ quiz }) => {
  const [answers, setAnswers] = useState({});
  if (!quiz?.length) return null;
  const done = Object.keys(answers).length;
  const score = quiz.reduce((n, q, i) => n + (answers[i] === q.answer_index ? 1 : 0), 0);
  return (
    <Card size="small" title={<Space><QuestionCircleOutlined />Quick quiz</Space>}
      extra={done === quiz.length ? <Tag color={score === quiz.length ? 'green' : 'orange'}>{score}/{quiz.length} correct</Tag>
        : <Button size="small" type="link" onClick={() => setAnswers({})}>Reset</Button>}
      style={{ marginBottom: 16 }}>
      {quiz.map((q, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <Text strong>{i + 1}. {q.question}</Text>
          <Radio.Group style={{ display: 'block', marginTop: 6 }} value={answers[i]} disabled={answers[i] !== undefined}
            onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}>
            <Space direction="vertical">
              {q.options.map((o, j) => (
                <Radio key={j} value={j}>
                  <span style={answers[i] !== undefined && j === q.answer_index ? { color: '#389e0d', fontWeight: 600 } : undefined}>{o}</span>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
          {answers[i] !== undefined && (
            <Alert style={{ marginTop: 6 }} type={answers[i] === q.answer_index ? 'success' : 'warning'} showIcon
              message={answers[i] === q.answer_index ? 'Correct' : `Answer: ${q.options[q.answer_index]}`} description={q.explanation || undefined} />
          )}
        </div>
      ))}
    </Card>
  );
};

// ------------------------------------------------------------------ talk viewer
const Section = ({ icon, title, children }) => (
  <div style={{ marginBottom: 18 }}>
    <Title level={5} style={{ marginBottom: 8 }}>{icon} {title}</Title>
    {children}
  </div>
);

const TalkView = ({ talk, onDeliver, onDelete, company, speaking, onSpeak }) => {
  const c = talk.content || {};
  const ctx = talk.context || {};
  const copy = async () => {
    try { await navigator.clipboard.writeText(talkToText(talk)); message.success('Talk copied'); } catch (e) { message.error('Copy failed'); }
  };
  const share = () => {
    const text = talkToText(talk);
    const url = `https://wa.me/?text=${encodeURIComponent(text.length > 3500 ? `${text.slice(0, 3500)}…` : text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  return (
    <Card
      style={{ borderRadius: 12 }}
      title={<Space wrap><SoundOutlined style={{ color: '#fa8c16' }} /><span style={{ whiteSpace: 'normal' }}>{c.title || talk.title}</span></Space>}
    >
      <Space wrap style={{ marginBottom: 12 }}>
        <Tag>{talk.talk_date}</Tag>
        <Tag>{talk.duration_minutes} min</Tag>
        <Tag color={talk.mode === 'auto' ? 'blue' : 'purple'}>{talk.mode === 'auto' ? 'From your records' : 'Custom topic'}</Tag>
        {talk.source === 'fallback' && <Tooltip title="The AI service was busy, so a built-in talk based on your records was used. Regenerate later for a full AI talk."><Tag color="gold">Built-in talk</Tag></Tooltip>}
        {talk.status === 'delivered'
          ? <Tag color="green" icon={<CheckCircleOutlined />}>Delivered · {talk.attendee_count} attended</Tag>
          : <Tag color="orange">Not delivered yet</Tag>}
      </Space>
      <Space wrap style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<TeamOutlined />} onClick={onDeliver}>
          {talk.status === 'delivered' ? 'Edit attendance' : 'Record attendance'}
        </Button>
        <Button icon={speaking ? <PauseCircleOutlined /> : <SoundOutlined />} onClick={onSpeak}>{speaking ? 'Stop reading' : 'Read aloud'}</Button>
        <Button icon={<PrinterOutlined />} onClick={() => printTalk(talk, company)}>Print / PDF sign-in sheet</Button>
        <Button icon={<CopyOutlined />} onClick={copy}>Copy</Button>
        <Button icon={<ShareAltOutlined />} onClick={share}>WhatsApp</Button>
        {onDelete && (
          <Popconfirm title="Delete this talk?" onConfirm={onDelete} okText="Delete" okButtonProps={{ danger: true }}>
            <Button danger type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        )}
      </Space>

      {c.why_today && <Alert type="info" showIcon icon={<BulbOutlined />} message="Why this talk today" description={c.why_today} style={{ marginBottom: 16 }} />}
      {ctx.weather?.hazards?.length > 0 && (
        <Alert type="warning" showIcon icon={<CloudOutlined />} style={{ marginBottom: 16 }}
          message={`Weather at ${ctx.weather.location || 'your site'}: ${ctx.weather.condition || ''} ${ctx.weather.temp_c != null ? `${ctx.weather.temp_c}°C` : ''}`}
          description={`Watch for: ${ctx.weather.hazards.join(', ')}`} />
      )}

      {c.opening && <Section icon={<SoundOutlined />} title="Opening"><Paragraph>{c.opening}</Paragraph></Section>}
      {c.key_points?.length > 0 && (
        <Section icon={<SafetyOutlined />} title="Key points">
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            {c.key_points.map((k, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{k.heading && <Text strong>{k.heading}: </Text>}{k.detail}</li>
            ))}
          </ol>
        </Section>
      )}
      <Row gutter={16}>
        {c.hazards?.length > 0 && (
          <Col xs={24} md={12}>
            <Section icon={<AlertOutlined style={{ color: '#f5222d' }} />} title="Hazards">
              <ul style={{ paddingLeft: 20, margin: 0 }}>{c.hazards.map((h, i) => <li key={i}>{h}</li>)}</ul>
            </Section>
          </Col>
        )}
        {c.controls?.length > 0 && (
          <Col xs={24} md={12}>
            <Section icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />} title="Controls">
              <ul style={{ paddingLeft: 20, margin: 0 }}>{c.controls.map((h, i) => <li key={i}>{h}</li>)}</ul>
            </Section>
          </Col>
        )}
      </Row>
      {c.ppe?.length > 0 && <Section icon={<SafetyOutlined />} title="PPE">{c.ppe.map((p, i) => <Tag key={i} color="geekblue" style={{ marginBottom: 4 }}>{p}</Tag>)}</Section>}
      {c.our_records && <Section icon={<HistoryOutlined />} title="What our records tell us"><Paragraph>{c.our_records}</Paragraph></Section>}
      {c.case_study?.summary && (
        <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}
          title={<Space wrap><span>Case study: {c.case_study.title}</span><Tag>{c.case_study.kind}</Tag></Space>}>
          <Paragraph>{c.case_study.summary}</Paragraph>
          {c.case_study.lesson && <Text strong>Lesson: {c.case_study.lesson}</Text>}
        </Card>
      )}
      {c.weather_note && <Section icon={<CloudOutlined />} title="Today's conditions"><Paragraph>{c.weather_note}</Paragraph></Section>}
      {c.discussion_questions?.length > 0 && (
        <Section icon={<QuestionCircleOutlined />} title="Ask the crew">
          <ul style={{ paddingLeft: 20, margin: 0 }}>{c.discussion_questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
        </Section>
      )}
      <Quiz key={talk.id} quiz={c.quiz} />
      {c.commitments?.length > 0 && (
        <Section icon={<CheckCircleOutlined />} title="Our commitments today">
          <ul style={{ paddingLeft: 20, margin: 0 }}>{c.commitments.map((q, i) => <li key={i}>{q}</li>)}</ul>
        </Section>
      )}
      {c.stop_work_reminder && <Alert type="error" showIcon message="Stop-work authority" description={c.stop_work_reminder} style={{ marginBottom: 12 }} />}
      {c.closing && <Paragraph italic>{c.closing}</Paragraph>}
    </Card>
  );
};

// ------------------------------------------------------------------ today's safety picture
const SignalsCard = ({ ctx, loading, onRefresh }) => {
  if (loading) return <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}><Skeleton active paragraph={{ rows: 3 }} /></Card>;
  if (!ctx) return null;
  const w = ctx.weather;
  return (
    <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}
      title={<Space><AimOutlined />Today&apos;s safety picture</Space>}
      extra={<Button size="small" type="text" icon={<ReloadOutlined />} onClick={onRefresh} />}>
      <Row gutter={[8, 8]}>
        <Col span={12}><Statistic title="Incidents (30d)" value={ctx.incidents?.total || 0} suffix={ctx.incidents?.serious ? <Tag color="red" style={{ marginLeft: 6 }}>{ctx.incidents.serious} serious</Tag> : null} /></Col>
        <Col span={12}><Statistic title="Near misses (30d)" value={ctx.near_misses?.total || 0} /></Col>
        <Col span={12}><Statistic title="Unsafe observations" value={ctx.observations?.unsafe || 0} /></Col>
        <Col span={12}><Statistic title="Overdue actions" value={ctx.actions?.overdue || 0} valueStyle={ctx.actions?.overdue ? { color: '#cf1322' } : undefined} /></Col>
      </Row>
      {ctx.incidents?.days_since_last != null && <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>{ctx.incidents.days_since_last} day(s) since the last recorded incident</Text>}
      {ctx.themes?.length > 0 && (
        <div style={{ marginTop: 8 }}><Text type="secondary">Recurring: </Text>{ctx.themes.map((t) => <Tag key={t} color="volcano">{t}</Tag>)}</div>
      )}
      {ctx.permits?.active > 0 && <div style={{ marginTop: 6 }}><Tag icon={<FireOutlined />} color="orange">{ctx.permits.active} active permit(s)</Tag></div>}
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
        {w ? (
          <>
            <Text strong><CloudOutlined /> {w.location}</Text>
            <div><Text>{w.condition} · {w.temp_c}°C (feels {w.feels_like_c}°C) · wind {w.wind_kph} km/h{w.chance_of_rain != null ? ` · rain ${w.chance_of_rain}%` : ''}</Text></div>
            {(w.hazards || []).map((h) => <Tag key={h} color="gold" style={{ marginTop: 4 }}>{h}</Tag>)}
            {(w.alerts || []).map((a) => <Alert key={a} type="warning" message={a} showIcon style={{ marginTop: 6, padding: '2px 8px' }} />)}
          </>
        ) : <Text type="secondary"><CloudOutlined /> Weather unavailable. Set your site location below.</Text>}
      </div>
    </Card>
  );
};

// ------------------------------------------------------------------ attendance modal
const DeliverModal = ({ talk, open, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open && talk) {
      form.setFieldsValue({ presenter: talk.presenter || '', location: talk.location || '', attendee_count: talk.attendee_count || undefined,
        names: (talk.attendees || []).join('\n'), notes: talk.notes || '' });
    }
  }, [open, talk, form]);
  const save = async () => {
    const v = await form.validateFields();
    const names = String(v.names || '').split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean);
    setSaving(true);
    try {
      const res = await toolboxService.deliver(talk.id, { presenter: v.presenter, location: v.location, notes: v.notes,
        attendees: names, attendee_count: v.attendee_count || names.length });
      const streak = res?.streak_days;
      message.success(streak > 1 ? `Talk recorded. ${streak}-day streak, keep it going!` : 'Talk recorded');
      onSaved(res.data);
    } catch (e) {
      message.error(errorText(e, 'Could not save attendance'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal title="Record toolbox talk attendance" open={open} onCancel={onClose} onOk={save} confirmLoading={saving} okText="Save" destroyOnClose>
      <Form form={form} layout="vertical">
        <Row gutter={12}>
          <Col xs={24} sm={12}><Form.Item name="presenter" label="Presenter" rules={[{ max: 120 }]}><Input /></Form.Item></Col>
          <Col xs={24} sm={12}><Form.Item name="location" label="Location / crew" rules={[{ max: 255 }]}><Input placeholder="e.g. Gate 3, night shift" /></Form.Item></Col>
        </Row>
        <Form.Item name="names" label="Attendees (one per line)"><TextArea rows={6} placeholder={'Kwame Mensah\nAisha Bello'} /></Form.Item>
        <Form.Item name="attendee_count" label="Headcount (if you don't list names)"><InputNumber min={0} max={2000} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="notes" label="Notes / issues raised by the crew" rules={[{ max: 2000 }]}><TextArea rows={3} /></Form.Item>
      </Form>
    </Modal>
  );
};

// ------------------------------------------------------------------ page
const ToolboxTalksPage = () => {
  const history = useHistory();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const prefs = useMemo(readPrefs, []);

  const [mode, setMode] = useState(params.get('topic') ? 'topic' : 'auto');
  const [topic, setTopic] = useState(params.get('topic') || '');
  const [duration, setDuration] = useState(prefs.duration || 10);
  const [language, setLanguage] = useState(prefs.language || 'en');
  const [audience, setAudience] = useState(prefs.audience || '');
  const [useGps, setUseGps] = useState(!!prefs.useGps);
  const [city, setCity] = useState(prefs.city || '');
  const [coords, setCoords] = useState(null);

  const [ctxState, setCtxState] = useState({ loading: true, data: null });
  const [generating, setGenerating] = useState(false);
  const [talk, setTalk] = useState(null);
  const [loadingTalk, setLoadingTalk] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [tab, setTab] = useState('today');
  const [history_, setHistory] = useState({ loading: false, items: [], total: 0, page: 1, q: '', status: undefined });
  const [company, setCompany] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const genRef = useRef(false);
  const openIdRef = useRef(null);
  useEffect(() => { openIdRef.current = talk?.id ?? null; }, [talk?.id]);
  const talkColRef = useRef(null);
  useEffect(() => {   // on phones the talk sits below the generator: bring it into view
    if (talk?.id && window.innerWidth < 992 && talkColRef.current?.scrollIntoView) {
      talkColRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [talk?.id]);

  useEffect(() => savePrefs({ duration, language, audience, useGps, city }), [duration, language, audience, useGps, city]);

  // Site location for weather: browser GPS (if allowed) or a typed city
  useEffect(() => {
    if (!useGps || !navigator.geolocation) { setCoords(null); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => { message.info('Location blocked; using your city instead'); setUseGps(false); },
      { timeout: 8000, maximumAge: 30 * 60 * 1000 },
    );
  }, [useGps]);

  const loc = useMemo(() => (coords ? { ...coords } : (city.trim() ? { city: city.trim() } : {})), [coords, city]);

  const loadContext = useCallback(async () => {
    setCtxState((s) => ({ ...s, loading: true }));
    try {
      const res = await toolboxService.context(loc);
      setCtxState({ loading: false, data: res?.data || null });
    } catch (e) {
      setCtxState({ loading: false, data: null });
    }
  }, [loc]);

  useEffect(() => {
    const t = setTimeout(loadContext, 400);   // debounce typing a city
    return () => clearTimeout(t);
  }, [loadContext]);

  useEffect(() => {
    apiGet('/ai/documents/company-profile').then((res) => {
      const d = res?.data;
      if (!d?.available) return;
      let logo = d.logo_url || null;
      if (logo && !/^https?:\/\//.test(logo)) logo = `${(process.env.REACT_APP_API_URL || '').replace(/\/api\/?$/, '')}${logo}`;
      setCompany({ name: d.name, logo_src: logo });
    }).catch(() => {});
  }, []);

  // Open a talk from ?id= (dashboard widget links)
  const openTalk = useCallback(async (id, { deliver = false } = {}) => {
    setLoadingTalk(true);
    try {
      const res = await toolboxService.get(id);
      setTalk(res.data);
      setTab('today');
      if (deliver) setDeliverOpen(true);
    } catch (e) {
      message.error(errorText(e, 'Toolbox talk not found'));
    } finally {
      setLoadingTalk(false);
    }
  }, []);

  useEffect(() => {
    const id = params.get('id');
    if (id && /^\d+$/.test(id)) {
      if (String(openIdRef.current) === id && params.get('deliver') !== '1') return;   // already showing it
      openTalk(id, { deliver: params.get('deliver') === '1' });
    }
    else if (!id) {
      toolboxService.today().then((res) => {
        const t = res?.data?.talk;
        if (t && !params.get('topic')) openTalk(t.id);
      }).catch(() => {});
    }
  }, [params, openTalk]);

  const stopSpeaking = () => { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } setSpeaking(false); };
  useEffect(() => stopSpeaking, []);
  useEffect(() => { stopSpeaking(); }, [talk?.id]);

  const speak = () => {
    if (speaking) { stopSpeaking(); return; }
    if (!('speechSynthesis' in window)) { message.info('Read-aloud is not supported in this browser'); return; }
    const u = new SpeechSynthesisUtterance(talkToText(talk, { forSpeech: true }));
    u.lang = talk?.language || 'en';
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const generate = async (regenerate = false) => {
    if (genRef.current) return;
    if (mode === 'topic' && topic.trim().length < 3) { message.warning('Type a topic first (at least 3 characters)'); return; }
    genRef.current = true;
    setGenerating(true);
    try {
      const res = await toolboxService.generate({ mode, topic: mode === 'topic' ? topic.trim() : undefined, duration, language,
        audience: audience.trim() || undefined, location: loc, regenerate: regenerate || undefined });
      openIdRef.current = res.data.id;
      setTalk(res.data);
      if (res.reused) message.info("Today's talk for your team was already generated, opening it. Use 'New version' for a different one.");
      else message.success('Toolbox talk ready');
      history.replace(`/toolbox-talks?id=${res.data.id}`);
      loadContext();
    } catch (e) {
      message.error(errorText(e, 'Could not generate the toolbox talk'));
    } finally {
      genRef.current = false;
      setGenerating(false);
    }
  };

  const loadHistory = useCallback(async (page = 1, q = history_.q, status = history_.status) => {
    setHistory((h) => ({ ...h, loading: true, page, q, status }));
    try {
      const res = await toolboxService.list({ page, per_page: 15, q, status });
      setHistory((h) => ({ ...h, loading: false, items: res?.data?.items || [], total: res?.data?.total || 0 }));
    } catch (e) {
      setHistory((h) => ({ ...h, loading: false }));
      message.error(errorText(e, 'Could not load past talks'));
    }
  }, [history_.q, history_.status]);

  useEffect(() => { if (tab === 'history') loadHistory(1); }, [tab]); // eslint-disable-line

  const removeTalk = async (id) => {
    try {
      await toolboxService.remove(id);
      message.success('Talk deleted');
      if (talk?.id === id) { setTalk(null); history.replace('/toolbox-talks'); }
      if (tab === 'history') loadHistory(history_.page);
    } catch (e) {
      message.error(errorText(e, 'Could not delete the talk'));
    }
  };

  const ctx = ctxState.data?.context;
  const usage = ctxState.data?.usage;
  const suggestions = ctxState.data?.suggestions || [];

  const generator = (
    <Card style={{ marginBottom: 16, borderRadius: 12 }} title={<Space><ThunderboltOutlined style={{ color: '#fa8c16' }} />Create a talk</Space>}
      extra={usage && usage.daily_limit != null ? <Tag color={usage.remaining ? 'blue' : 'red'}>{usage.remaining} left today</Tag> : null}>
      <Segmented block value={mode} onChange={setMode} style={{ marginBottom: 12 }}
        options={[{ value: 'auto', label: <span><ThunderboltOutlined /> Auto from my records</span> },
          { value: 'topic', label: <span><EditOutlined /> My topic</span> }]} />
      {mode === 'auto' ? (
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Picks the most useful topic for today from your incidents, near misses, observations, overdue actions, active permits and the
          weather at your site.
        </Text>
      ) : (
        <TextArea rows={2} maxLength={200} showCount value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Working near overhead power lines" style={{ marginBottom: 12 }} />
      )}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Suggested for today:</Text>
          <div style={{ marginTop: 4 }}>
            {suggestions.map((s) => (
              <Tooltip key={s.topic} title={s.reason}>
                <Tag color="orange" style={{ cursor: 'pointer', marginBottom: 6, whiteSpace: 'normal' }}
                  onClick={() => { setMode('topic'); setTopic(s.topic); }}>{s.topic}</Tag>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
      <Row gutter={8}>
        <Col xs={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>Length</Text>
          <Select value={duration} onChange={setDuration} style={{ width: '100%' }}
            options={[5, 10, 15, 20].map((d) => ({ value: d, label: `${d} minutes` }))} />
        </Col>
        <Col xs={12}>
          <Text type="secondary" style={{ fontSize: 12 }}>Language</Text>
          <Select value={language} onChange={setLanguage} style={{ width: '100%' }} options={TBT_LANGUAGES} showSearch optionFilterProp="label" />
        </Col>
      </Row>
      <Input style={{ marginTop: 8 }} maxLength={100} value={audience} onChange={(e) => setAudience(e.target.value)}
        placeholder="Crew / audience (optional), e.g. scaffolders, night shift" prefix={<TeamOutlined />} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Switch size="small" checked={useGps} onChange={setUseGps} />
        <Text style={{ fontSize: 12 }}>Use my location for weather</Text>
        {!useGps && (
          <Input size="small" style={{ flex: 1, minWidth: 140 }} maxLength={80} value={city} onChange={(e) => setCity(e.target.value)}
            placeholder="or site city, e.g. Tema" prefix={<EnvironmentOutlined />} />
        )}
      </div>
      <Space style={{ marginTop: 14 }} wrap>
        <Button type="primary" size="large" icon={<ThunderboltOutlined />} loading={generating} onClick={() => generate(false)}>
          {generating ? 'Writing your talk…' : 'Generate talk'}
        </Button>
        {talk && mode === 'auto' && (
          <Button onClick={() => generate(true)} disabled={generating} icon={<ReloadOutlined />}>New version</Button>
        )}
      </Space>
      {generating && <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>Reading your records and today&apos;s weather. This usually takes 10–40 seconds.</Text>}
    </Card>
  );

  const historyTab = (
    <Card style={{ borderRadius: 12 }}>
      <Space wrap style={{ marginBottom: 12 }}>
        <Input.Search allowClear placeholder="Search talks" onSearch={(q) => loadHistory(1, q, history_.status)} style={{ width: 240 }} maxLength={100} />
        <Select allowClear placeholder="Status" style={{ width: 160 }} value={history_.status} onChange={(s) => loadHistory(1, history_.q, s)}
          options={[{ value: 'delivered', label: 'Delivered' }, { value: 'generated', label: 'Not delivered' }]} />
      </Space>
      <Table rowKey="id" size="small" loading={history_.loading} dataSource={history_.items} scroll={{ x: 640 }}
        pagination={{ current: history_.page, pageSize: 15, total: history_.total, onChange: (p) => loadHistory(p), showSizeChanger: false }}
        onRow={(r) => ({ onClick: () => openTalk(r.id), style: { cursor: 'pointer' } })}
        columns={[
          { title: 'Date', dataIndex: 'talk_date', width: 110 },
          { title: 'Talk', dataIndex: 'title', render: (t, r) => <span><Text strong>{t}</Text>{r.source === 'fallback' && <Tag color="gold" style={{ marginLeft: 6 }}>Built-in</Tag>}</span> },
          { title: 'Type', dataIndex: 'mode', width: 120, render: (m) => <Tag color={m === 'auto' ? 'blue' : 'purple'}>{m === 'auto' ? 'Records' : 'Topic'}</Tag> },
          { title: 'Status', dataIndex: 'status', width: 150, render: (s, r) => (s === 'delivered' ? <Tag color="green">Delivered · {r.attendee_count}</Tag> : <Tag>Not delivered</Tag>) },
          { title: '', key: 'x', width: 50, render: (_, r) => (
            <span onClick={(e) => e.stopPropagation()} role="presentation">
              <Popconfirm title="Delete this talk?" onConfirm={() => removeTalk(r.id)} okButtonProps={{ danger: true }}>
                <Button size="small" type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </span>
          ) },
        ]}
        locale={{ emptyText: <Empty description="No toolbox talks yet" /> }} />
    </Card>
  );

  return (
    <div className="toolbox-talks-page" style={{ padding: 16, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}><SoundOutlined style={{ color: '#fa8c16' }} /> Daily Toolbox Talks</Title>
          <Text type="secondary">A fresh talk every day, built from what is actually happening on your sites.</Text>
        </div>
      </div>
      <Tabs activeKey={tab} onChange={setTab} items={[
        { key: 'today', label: <span><SoundOutlined /> Today</span>, children: (
          <Row gutter={16}>
            <Col xs={24} lg={9}>
              {generator}
              <SignalsCard ctx={ctx} loading={ctxState.loading} onRefresh={loadContext} />
            </Col>
            <Col xs={24} lg={15} ref={talkColRef}>
              {loadingTalk || generating ? (
                <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 12 }}><Text type="secondary">{generating ? 'Writing your toolbox talk…' : 'Loading…'}</Text></div>
                </Card>
              ) : talk ? (
                <TalkView talk={talk} company={company} speaking={speaking} onSpeak={speak}
                  onDeliver={() => setDeliverOpen(true)} onDelete={() => removeTalk(talk.id)} />
              ) : (
                <Card style={{ borderRadius: 12 }}>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span>No talk open. Click <b>Generate talk</b> for today&apos;s talk from your records, or type your own topic.</span>} />
                </Card>
              )}
            </Col>
          </Row>
        ) },
        { key: 'history', label: <span><HistoryOutlined /> Past talks</span>, children: historyTab },
      ]} />
      {talk && <DeliverModal talk={talk} open={deliverOpen} onClose={() => setDeliverOpen(false)}
        onSaved={(t) => { setTalk(t); setDeliverOpen(false); }} />}
    </div>
  );
};

export default ToolboxTalksPage;
