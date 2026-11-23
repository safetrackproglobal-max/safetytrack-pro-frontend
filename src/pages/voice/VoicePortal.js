// Workplace Voice public portal (no login, no app): find company -> language -> type -> speak / photo / video / text -> submit
// -> tracking code. Designed for workers who may not read or write: big icons, read-aloud, voice first.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { voicePublic, API_BASE, SERVER_BASE, GROUP_META, CATEGORY_META } from '../../services/workplaceVoiceService';
import { VOICE_LANGS, t } from './voiceI18n';
import './voice.css';

const LANG_KEY = 'wv:lang';
const MAX_SECONDS = 180;
const readLang = () => { try { return localStorage.getItem(LANG_KEY) || ''; } catch (e) { return ''; } };
const saveLang = (l) => { try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* ignore */ } };
const utc = (s) => new Date(/[zZ]|[+-]\d\d:\d\d$/.test(s) ? s : `${s}Z`);
const deviceId = () => {
  try {
    let d = localStorage.getItem('wv:device');
    if (!d) { d = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`; localStorage.setItem('wv:device', d); }
    return d;
  } catch (e) { return ''; }
};
const rewardKey = (slug) => `wv:reward:${slug}`;
const readReward = (slug) => { try { return JSON.parse(localStorage.getItem(rewardKey(slug)) || 'null'); } catch (e) { return null; } };
const saveReward = (slug, r) => { try { localStorage.setItem(rewardKey(slug), JSON.stringify(r)); } catch (e) { /* ignore */ } };
const allRewards = () => {
  const out = [];
  try { for (let i = 0; i < localStorage.length; i += 1) { const k = localStorage.key(i); if (k && k.startsWith('wv:reward:')) { const v = JSON.parse(localStorage.getItem(k)); if (v?.reward_code) out.push({ slug: k.slice(10), ...v }); } } } catch (e) { /* ignore */ }
  return out;
};
const logoSrc = (u) => (!u ? null : /^https:\/\//.test(u) ? u : `${SERVER_BASE}${u}`);

const speak = (lang, text) => {
  try {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = VOICE_LANGS[lang]?.speech || 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) { /* ignore */ }
};

const Listen = ({ lang, text }) => (
  <button type="button" className="wv-listen" onClick={() => speak(lang, text)} aria-label={t(lang, 'listen')}>🔊 {t(lang, 'listen')}</button>
);

const pickMime = () => {
  if (typeof MediaRecorder === 'undefined') return null;
  const opts = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];
  return opts.find((m) => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || '';
};

// Resize photos on the phone before upload (faster on weak networks; drawing to canvas also drops EXIF / GPS)
const compressImage = (file) => new Promise((resolve) => {
  try {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => resolve(b || file), 'image/jpeg', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  } catch (e) { resolve(file); }
});

const submitWithProgress = (slug, fd, onProgress) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${API_BASE}/voice/public/c/${encodeURIComponent(slug)}/report`);
  xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
  xhr.onload = () => {
    let body = null;
    try { body = JSON.parse(xhr.responseText); } catch (e) { /* ignore */ }
    if (xhr.status >= 200 && xhr.status < 300 && body?.success) resolve(body);
    else { const err = new Error(body?.error || `Could not send (${xhr.status})`); err.code = body?.code; err.status = xhr.status; reject(err); }
  };
  xhr.onerror = () => reject(new Error('No connection. Your report is still here - try again.'));
  xhr.timeout = 180000;
  xhr.ontimeout = () => reject(new Error('The upload took too long. Try again on a better connection.'));
  xhr.send(fd);
});

// ------------------------------------------------------------------ voice recorder
const useRecorder = ({ lang, browserSpeech }) => {
  const [state, setState] = useState('idle');   // idle | recording | done | denied | unsupported
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const rec = useRef(null); const chunks = useRef([]); const timer = useRef(null); const sr = useRef(null); const finalText = useRef('');
  const stream = useRef(null);

  const stopAll = useCallback(() => {
    clearInterval(timer.current);
    try { if (sr.current) { sr.current.onend = null; sr.current.stop(); } } catch (e) { /* ignore */ }
    sr.current = null;
    try { if (rec.current && rec.current.state !== 'inactive') rec.current.stop(); } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => () => { stopAll(); try { stream.current?.getTracks().forEach((tr) => tr.stop()); } catch (e) { /* ignore */ } }, [stopAll]);

  const startSpeechRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!browserSpeech || !SR) return;
    try {
      const r = new SR();
      r.lang = VOICE_LANGS[lang]?.speech || 'en-US';
      r.continuous = true; r.interimResults = true;
      r.onresult = (ev) => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
          if (ev.results[i].isFinal) finalText.current += `${ev.results[i][0].transcript} `;
          else interim += ev.results[i][0].transcript;
        }
        setTranscript((finalText.current + interim).trim());
      };
      r.onerror = () => {};
      r.onend = () => { if (sr.current === r && rec.current?.state === 'recording') { try { r.start(); } catch (e) { /* ignore */ } } };
      sr.current = r;
      r.start();
    } catch (e) { /* some phones cannot run both at once: the audio is still recorded */ }
  };

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setState('unsupported'); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.current = s;
      const mime = pickMime();
      const r = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
      chunks.current = []; finalText.current = ''; setTranscript('');
      r.ondataavailable = (e) => { if (e.data && e.data.size) chunks.current.push(e.data); };
      r.onstop = () => {
        const b = new Blob(chunks.current, { type: r.mimeType || mime || 'audio/webm' });
        setBlob(b.size ? b : null);
        setState(b.size ? 'done' : 'idle');
        s.getTracks().forEach((tr) => tr.stop());
      };
      rec.current = r;
      r.start(1000);
      setSeconds(0); setState('recording');
      timer.current = setInterval(() => setSeconds((x) => {
        if (x + 1 >= MAX_SECONDS) stopAll();
        return x + 1;
      }), 1000);
      startSpeechRecognition();
    } catch (e) {
      setState('denied');
    }
  };

  const reset = () => { stopAll(); setBlob(null); setTranscript(''); setSeconds(0); setState('idle'); };
  return { state, seconds, blob, transcript, start, stop: stopAll, reset };
};

// ------------------------------------------------------------------ shell
const Shell = ({ lang, company, onLang, children }) => (
  <div className="wv-portal" dir={VOICE_LANGS[lang]?.rtl ? 'rtl' : 'ltr'} lang={lang}>
    <div className="wv-top">
      {company?.logo_url && <img src={logoSrc(company.logo_url)} alt="" />}
      <div>
        <div className="wv-co">{company?.name || 'SafeTrack Workplace Voice'}</div>
        <div className="wv-sub">{t(lang, 'tagline')}</div>
      </div>
      {onLang && <button type="button" className="wv-langbtn" onClick={onLang}>🌐 {VOICE_LANGS[lang]?.name || 'English'}</button>}
    </div>
    <div className="wv-wrap">{children}</div>
  </div>
);

// ------------------------------------------------------------------ /voice  (search + track)
export const VoiceHome = () => {
  const history = useHistory();
  const [lang] = useState(readLang() || 'en');
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [code, setCode] = useState('');
  useEffect(() => {
    if (q.trim().length < 2) { setResults(null); return undefined; }
    const h = setTimeout(() => {
      voicePublic.directory(q.trim()).then((r) => setResults(r.data || [])).catch(() => setResults([]));
    }, 350);
    return () => clearTimeout(h);
  }, [q]);
  return (
    <Shell lang={lang}>
      <div className="wv-h">🎤 {t(lang, 'findCompany')} <Listen lang={lang} text={t(lang, 'findCompany')} /></div>
      <input className="wv-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, 'searchPlaceholder')} maxLength={80} aria-label={t(lang, 'searchPlaceholder')} />
      {results && results.length === 0 && <div className="wv-hint" style={{ marginTop: 12 }}>{t(lang, 'noResults')}</div>}
      {results && results.length > 0 && (
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {results.map((c) => (
            <button key={c.slug} type="button" className="wv-tile" style={{ minHeight: 70, flexDirection: 'row', justifyContent: 'flex-start', padding: 12, textAlign: 'start' }}
              onClick={() => history.push(`/voice/${c.slug}`)}>
              {c.logo_url ? <img src={logoSrc(c.logo_url)} alt="" style={{ height: 40, width: 60, objectFit: 'contain' }} /> : <span className="wv-emoji" style={{ fontSize: 30 }}>🏢</span>}
              <span><span style={{ display: 'block' }}>{c.name}</span><span style={{ fontSize: 13, fontWeight: 400, color: '#6b7280' }}>{[c.industry, c.country].filter(Boolean).join(' · ')}</span></span>
            </button>
          ))}
        </div>
      )}
      <div className="wv-card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>🔎 {t(lang, 'followReport')}</div>
        <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) history.push(`/voice/track/${encodeURIComponent(code.trim())}`); }} className="wv-row">
          <input className="wv-input" style={{ flex: '1 1 200px' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="WV-XXXX-XXXX-XXXX" maxLength={24} aria-label={t(lang, 'enterCode')} />
          <button type="submit" className="wv-btn" style={{ flex: '0 0 auto' }}>{t(lang, 'track')}</button>
        </form>
      </div>
      <div className="wv-card"><Link to="/voice/rewards" style={{ fontWeight: 700 }}>🏆 {t(lang, 'myPoints')}</Link></div>
      <div className="wv-foot">SafeTrack Workplace Voice™</div>
    </Shell>
  );
};

// ------------------------------------------------------------------ /voice/rewards  (worker wallet)
export const VoiceRewards = () => {
  const [lang] = useState(readLang() || 'en');
  const saved = useMemo(allRewards, []);
  const [code, setCode] = useState(saved[0]?.reward_code || '');
  const [pin, setPin] = useState(saved[0]?.pin || '');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const open = async (c = code, p = pin) => {
    setBusy(true); setError('');
    try { const r = await voicePublic.wallet(c.trim(), p.trim()); setData(r.data); } catch (e) { setData(null); setError(e.message); } finally { setBusy(false); }
  };
  useEffect(() => { if (saved[0]?.reward_code && saved[0]?.pin) open(saved[0].reward_code, saved[0].pin); }, []); // eslint-disable-line
  const lv = data?.level;
  const pct = lv && lv.next_at ? Math.min(100, Math.round(((data.points - lv.min) / (lv.next_at - lv.min)) * 100)) : 100;
  return (
    <Shell lang={lang}>
      <div className="wv-h">🏆 {t(lang, 'myPoints')}</div>
      {saved.length > 1 && (
        <div className="wv-chips" style={{ marginBottom: 10 }}>
          {saved.map((s) => <button key={s.reward_code} type="button" className={`wv-chip ${s.reward_code === code ? 'on' : ''}`}
            onClick={() => { setCode(s.reward_code); setPin(s.pin || ''); open(s.reward_code, s.pin || ''); }}>{s.alias}</button>)}
        </div>
      )}
      <form className="wv-row" onSubmit={(e) => { e.preventDefault(); open(); }}>
        <input className="wv-input" style={{ flex: '2 1 160px' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="RW-XXXX-XXXX" maxLength={14} aria-label={t(lang, 'yourRewardId')} />
        <input className="wv-input" style={{ flex: '1 1 90px' }} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" type="password" inputMode="numeric" maxLength={12} aria-label={t(lang, 'yourPin')} />
        <button type="submit" className="wv-btn" style={{ flex: '0 0 auto' }} disabled={busy}>{t(lang, 'openWallet')}</button>
      </form>
      {error && <div className="wv-err">{error}</div>}
      {data && (
        <>
          <div className="wv-card wv-center">
            <div style={{ fontSize: 18, fontWeight: 700 }}>{data.alias}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{data.company}</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: '#d48806' }} data-testid="wv-points">{data.points}</div>
            <div>{t(lang, 'points')} · {t(lang, 'level')}: <b>{lv.name}</b>{data.redeemed ? ` · ${data.available} available` : ''}</div>
            {lv.next && <><div className="wv-progress"><div style={{ width: `${pct}%`, background: '#faad14' }} /></div><div className="wv-hint">{lv.to_next} {t(lang, 'points')} {t(lang, 'nextLevel')} {lv.next}</div></>}
            {data.rewards_note && <div style={{ marginTop: 6 }}>🎁 {data.rewards_note}</div>}
          </div>
          <div className="wv-acted">
            <b>🙌 {t(lang, 'impactTitle')}:</b>
            <ul style={{ margin: '6px 0 0', paddingInlineStart: 20 }}>
              <li>{data.impact.acted_on} {t(lang, 'acted')}</li>
              {data.impact.toolbox_talks > 0 && <li>{data.impact.toolbox_talks} {t(lang, 'talks')}</li>}
              {data.impact.incidents_prevented > 0 && <li>{data.impact.incidents_prevented} {t(lang, 'prevented')}</li>}
              {data.impact.hazards_verified > 0 && <li>{data.impact.hazards_verified} hazards verified</li>}
              {data.impact.near_misses_verified > 0 && <li>{data.impact.near_misses_verified} near misses verified</li>}
              {data.impact.improvements > 0 && <li>{data.impact.improvements} improvements implemented</li>}
            </ul>
          </div>
          {data.history.length > 0 && (
            <div className="wv-card">
              {data.history.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span>{h.label}{h.tracking_code && <> · <Link to={`/voice/track/${h.tracking_code}`}>{h.tracking_code}</Link></>}<div style={{ fontSize: 11, color: '#6b7280' }}>{utc(h.at).toLocaleDateString()}</div></span>
                  <b style={{ color: h.points < 0 ? '#b91c1c' : '#16a34a' }}>{h.points > 0 ? '+' : ''}{h.points}</b>
                </div>
              ))}
            </div>
          )}
          {data.company_slug && <p className="wv-hint"><Link to={`/voice/${data.company_slug}`}>📨 {t(lang, 'another')}</Link></p>}
        </>
      )}
      <p className="wv-hint" style={{ marginTop: 20 }}><Link to="/voice">← {t(lang, 'findCompany')}</Link></p>
    </Shell>
  );
};

// ------------------------------------------------------------------ /voice/:slug  (report)
export const VoiceReport = () => {
  const { slug } = useParams();
  const location = useLocation();
  const projectParam = useMemo(() => new URLSearchParams(location.search).get('p'), [location.search]);
  const [info, setInfo] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [lang, setLang] = useState(readLang());
  const [step, setStep] = useState('lang');
  const [group, setGroup] = useState(null);
  const [category, setCategory] = useState('not_sure');
  const [projectId, setProjectId] = useState(projectParam || '');
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [showText, setShowText] = useState(false);
  const [text, setText] = useState('');
  const [anonymity, setAnonymity] = useState('anonymous');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [honey, setHoney] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [joinRewards, setJoinRewards] = useState(true);
  const [savedReward, setSavedReward] = useState(() => readReward(slug));
  const [impact, setImpact] = useState(null);
  const photoInput = useRef(null); const videoInput = useRef(null);

  useEffect(() => {
    voicePublic.channel(slug, projectParam).then((r) => {
      const d = r.data;
      setInfo(d);
      const langs = d.channel.languages || ['en'];
      const saved = readLang();
      if (saved && langs.includes(saved)) { setLang(saved); setStep('type'); } else if (langs.length === 1) { setLang(langs[0]); setStep('type'); }
      const allowed = ['anonymous', 'protected', 'open'].filter((a) => d.channel[`allow_${a}`]);
      setAnonymity(allowed[0] || 'anonymous');
    }).catch((e) => setLoadError(e.message || 'Not available'));
    voicePublic.impact(slug).then((r) => setImpact(r.data)).catch(() => {});
  }, [slug, projectParam]);

  const rec = useRecorder({ lang: lang || 'en', browserSpeech: info && !info.server_speech_to_text });
  const L = lang || 'en';

  const photoUrls = useMemo(() => photos.map((p) => URL.createObjectURL(p)), [photos]);
  useEffect(() => () => photoUrls.forEach((u) => URL.revokeObjectURL(u)), [photoUrls]);
  const audioUrl = useMemo(() => (rec.blob ? URL.createObjectURL(rec.blob) : null), [rec.blob]);
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  if (loadError) {
    return (
      <Shell lang={L}>
        <div className="wv-err">{loadError}</div>
        <p className="wv-hint"><Link to="/voice">{t(L, 'findCompany')}</Link></p>
      </Shell>
    );
  }
  if (!info) return <Shell lang={L}><div className="wv-hint" style={{ marginTop: 40 }}>…</div></Shell>;

  const chooseLang = (l) => { setLang(l); saveLang(l); setStep('type'); speak(l, t(l, 'whatAbout')); };
  const addPhotos = async (files) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/')).slice(0, 5 - photos.length);
    const out = [];
    for (const f of list) out.push(await compressImage(f));   // eslint-disable-line no-await-in-loop
    setPhotos((p) => [...p, ...out].slice(0, 5));
  };
  const addVideo = (files) => {
    const f = files && files[0];
    if (!f) return;
    if (f.size > 40 * 1024 * 1024) { setError('Video is larger than 40 MB. Record a shorter clip (about 30 seconds).'); return; }
    setError(''); setVideo(f);
  };

  const submit = async () => {
    setError('');
    if (rec.state === 'recording') rec.stop();
    const typed = text.trim();
    if (!rec.blob && !photos.length && !video && !typed && !rec.transcript) { setError(t(L, 'needSomething')); return; }
    const build = (token) => {
    const fd = new FormData();
    fd.append('form_token', token || '');
    fd.append('device', deviceId());
    if (info.rewards?.enabled) {
      if (savedReward?.reward_code) { fd.append('reward_code', savedReward.reward_code); fd.append('reward_pin', savedReward.pin || ''); }
      else if (joinRewards) fd.append('want_rewards', '1');
    }
    fd.append('group', group || 'safety'); fd.append('category', category); fd.append('language', L);
    fd.append('anonymity', anonymity); fd.append('website', honey);
    if (typed) fd.append('text', typed);
    if (rec.transcript) fd.append('transcript', rec.transcript);
    if (projectId) fd.append('project_id', projectId);
    if (anonymity !== 'anonymous') { fd.append('name', name.trim()); fd.append('contact', contact.trim()); }
    if (rec.blob) fd.append('audio', rec.blob, `voice.${(rec.blob.type || '').includes('mp4') ? 'm4a' : (rec.blob.type || '').includes('ogg') ? 'ogg' : 'webm'}`);
    photos.forEach((p, i) => fd.append('photos', p, `photo_${i + 1}.jpg`));
    if (video) fd.append('video', video, video.name || 'video.mp4');
    return fd;
    };
    setSending(true); setProgress(0);
    try {
      let res;
      try {
        res = await submitWithProgress(slug, build(info.form_token), setProgress);
      } catch (e) {
        if (e.code !== 'FORM_EXPIRED') throw e;
        const fresh = await voicePublic.channel(slug, projectParam);   // page was open for hours: refresh and resend once
        setInfo(fresh.data);
        res = await submitWithProgress(slug, build(fresh.data.form_token), setProgress);
      }
      if (res.data.reward?.new) { saveReward(slug, res.data.reward); setSavedReward(res.data.reward); }
      setResult(res.data);
      setStep('done');
      speak(L, `${t(L, 'thanks')}. ${t(L, 'saveCode')}`);
    } catch (e) {
      setError(e.code === 'REPEATED_REPORT' ? t(L, 'repeated') : e.message);
    } finally {
      setSending(false);
    }
  };

  const restart = () => {
    rec.reset(); setPhotos([]); setVideo(null); setText(''); setShowText(false); setCategory('not_sure'); setGroup(null);
    setResult(null); setError(''); setStep('type'); setCopied(false);
  };

  const langs = (info.channel.languages || ['en']).filter((l) => VOICE_LANGS[l]);
  const shell = (children) => <Shell lang={L} company={info.company} onLang={langs.length > 1 ? () => setStep('lang') : null}>{children}</Shell>;

  if (step === 'lang') {
    return shell(
      <>
        <div className="wv-h">🌐 {t(L, 'chooseLanguage')}</div>
        <div className="wv-grid">
          {langs.map((l) => (
            <button key={l} type="button" className={`wv-tile wv-lang ${l === lang ? 'on' : ''}`} onClick={() => chooseLang(l)} lang={l}>{VOICE_LANGS[l].name}</button>
          ))}
        </div>
      </>,
    );
  }

  if (step === 'type') {
    return shell(
      <>
        {info.channel.welcome_message && <div className="wv-card" style={{ marginTop: 0, marginBottom: 12 }}>{info.channel.welcome_message}</div>}
        {info.project && <div className="wv-hint">📍 {info.project.name}</div>}
        {impact && impact.impact.acted_on > 0 && (
          <div className="wv-acted" style={{ marginTop: 0, marginBottom: 12 }}>
            <b>🙌 {t(L, 'monthImpact')}:</b> {impact.impact.acted_on} {t(L, 'acted')} · {impact.impact.toolbox_talks} {t(L, 'talks')}
            {impact.impact.incidents_prevented > 0 && <> · {impact.impact.incidents_prevented} {t(L, 'prevented')}</>}
          </div>
        )}
        <div className="wv-h">{t(L, 'whatAbout')} <Listen lang={L} text={`${t(L, 'whatAbout')} ${['safety', 'environmental', 'welfare', 'ethics', 'suggestions'].map((g) => t(L, g)).join(', ')}`} /></div>
        <div className="wv-grid">
          {Object.keys(info.groups).map((g) => (
            <button key={g} type="button" className="wv-tile" onClick={() => { setGroup(g); setCategory('not_sure'); setStep('report'); speak(L, t(L, 'tapToSpeak')); }}
              style={{ borderColor: GROUP_META[g]?.color }}>
              <span className="wv-emoji">{GROUP_META[g]?.emoji}</span>{t(L, g)}
            </button>
          ))}
        </div>
      </>,
    );
  }

  if (step === 'done' && result) {
    const code = result.tracking_code;
    return shell(
      <div className="wv-center">
        <div style={{ fontSize: 64 }}>✅</div>
        <div className="wv-h" style={{ justifyContent: 'center' }}>{t(L, 'thanks')}</div>
        <div>{t(L, 'yourCode')}</div>
        <div className="wv-code" data-testid="wv-code">{code}</div>
        <div className="wv-hint">{t(L, 'saveCode')}</div>
        <div className="wv-row" style={{ marginTop: 10 }}>
          <button type="button" className="wv-btn" onClick={() => { try { navigator.clipboard.writeText(code); setCopied(true); } catch (e) { /* ignore */ } }}>📋 {copied ? t(L, 'copied') : t(L, 'copy')}</button>
          <Link className="wv-btn" to={`/voice/track/${code}`} style={{ textDecoration: 'none' }}>🔎 {t(L, 'track')}</Link>
        </div>
        {result.reward?.new && (
          <div className="wv-card" style={{ background: '#fffbe6', borderColor: '#faad14', textAlign: 'start' }}>
            <div style={{ fontWeight: 700 }}>🏆 {result.reward.alias}</div>
            <div>{t(L, 'yourRewardId')}: <b className="wv-mono" data-testid="wv-reward-code">{result.reward.reward_code}</b></div>
            <div>{t(L, 'yourPin')}: <b className="wv-mono" data-testid="wv-reward-pin">{result.reward.pin}</b></div>
            <div style={{ fontSize: 13, color: '#92400e', marginTop: 6 }}>{t(L, 'writeDown')}</div>
          </div>
        )}
        {result.reward && !result.reward.new && <div className="wv-hint">🏆 {t(L, 'rewardsLinked')}: {result.reward.alias}</div>}
        {result.reward_error && <div className="wv-err">{result.reward_error}</div>}
        {result.media_errors?.length > 0 && <div className="wv-err">{result.media_errors.join('. ')}</div>}
        {savedReward?.reward_code && <Link className="wv-btn" style={{ textDecoration: 'none', marginTop: 10 }} to="/voice/rewards">🏆 {t(L, 'myPoints')}</Link>}
        <button type="button" className="wv-primary" onClick={restart}>➕ {t(L, 'another')}</button>
      </div>,
    );
  }

  // step === 'report'
  const allowed = ['anonymous', 'protected', 'open'].filter((a) => info.channel[`allow_${a}`]);
  const cats = info.groups[group] || [];
  const mm = String(Math.floor(rec.seconds / 60)).padStart(1, '0');
  const ss = String(rec.seconds % 60).padStart(2, '0');
  return shell(
    <>
      <button type="button" className="wv-back" onClick={() => { rec.reset(); setStep('type'); }}>← {t(L, 'back')}</button>
      <div className="wv-h"><span className="wv-emoji" style={{ fontSize: 28 }}>{GROUP_META[group]?.emoji}</span> {t(L, group)}</div>

      {!info.project && info.projects?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>📍 {t(L, 'project')}</div>
          <select className="wv-input" value={projectId} onChange={(e) => setProjectId(e.target.value)} aria-label={t(L, 'project')}>
            <option value="">{t(L, 'allSites')}</option>
            {info.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      <div className="wv-center">
        <button type="button" data-testid="wv-mic"
          className={`wv-mic ${rec.state === 'recording' ? 'rec' : ''} ${rec.state === 'done' ? 'done' : ''}`}
          onClick={() => (rec.state === 'recording' ? rec.stop() : rec.state === 'done' ? null : rec.start())}
          aria-label={rec.state === 'recording' ? t(L, 'recording') : t(L, 'tapToSpeak')}>
          {rec.state === 'recording' ? '⏹' : rec.state === 'done' ? '✔' : '🎤'}
          <small>{rec.state === 'recording' ? `${mm}:${ss}` : rec.state === 'done' ? t(L, 'recorded') : t(L, 'tapToSpeak')}</small>
        </button>
        <div className="wv-hint">{rec.state === 'recording' ? t(L, 'recording') : t(L, 'speakHint')} <Listen lang={L} text={t(L, 'speakHint')} /></div>
        {rec.state === 'done' && audioUrl && (
          <div>
            <audio controls src={audioUrl} style={{ width: '100%' }} />
            <button type="button" className="wv-back" onClick={rec.reset}>🔁 {t(L, 'again')}</button>
          </div>
        )}
        {rec.transcript && <div className="wv-card" style={{ textAlign: 'start', fontSize: 15 }}>“{rec.transcript}”</div>}
        {(rec.state === 'denied' || rec.state === 'unsupported') && <div className="wv-err">{t(L, 'micDenied')}</div>}
      </div>

      <div className="wv-row" style={{ marginTop: 12 }}>
        <button type="button" className={`wv-btn ${photos.length ? 'on' : ''}`} onClick={() => photoInput.current?.click()}>📷 {t(L, 'addPhoto')}{photos.length ? ` (${photos.length})` : ''}</button>
        <button type="button" className={`wv-btn ${video ? 'on' : ''}`} onClick={() => videoInput.current?.click()}>🎥 {t(L, 'addVideo')}</button>
        <button type="button" className={`wv-btn ${showText ? 'on' : ''}`} onClick={() => setShowText((x) => !x)}>⌨️ {t(L, 'typeInstead')}</button>
      </div>
      <input ref={photoInput} type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }} />
      <input ref={videoInput} type="file" accept="video/*" capture="environment" hidden onChange={(e) => { addVideo(e.target.files); e.target.value = ''; }} />
      {(photos.length > 0 || video) && (
        <div className="wv-thumbs">
          {photoUrls.map((u, i) => (
            <div className="wv-thumb" key={u}><img src={u} alt="" /><button type="button" aria-label="Remove" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}>×</button></div>
          ))}
          {video && <div className="wv-chip on">🎥 {(video.size / 1024 / 1024).toFixed(1)} MB <button type="button" className="wv-back" style={{ color: '#fff' }} onClick={() => setVideo(null)}>×</button></div>}
        </div>
      )}
      {showText && <textarea className="wv-textarea" style={{ marginTop: 10 }} value={text} onChange={(e) => setText(e.target.value)} maxLength={4000} placeholder={t(L, 'typeHere')} />}

      {cats.length > 0 && (
        <div className="wv-card">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{t(L, 'typeOptional')}</div>
          <div className="wv-chips">
            {['not_sure', ...cats].map((c) => (
              <button key={c} type="button" className={`wv-chip ${category === c ? 'on' : ''}`} onClick={() => setCategory(c)}>
                {CATEGORY_META[c]?.[0]} {c === 'not_sure' ? t(L, 'notSure') : CATEGORY_META[c]?.[1] || c}
              </button>
            ))}
          </div>
        </div>
      )}

      {info.rewards?.enabled && (
        <div className="wv-card" style={{ background: '#fffbe6', borderColor: '#ffe58f' }}>
          {savedReward?.reward_code ? (
            <div>🏆 <b>{t(L, 'rewardsLinked')}</b>: {savedReward.alias} <span style={{ color: '#6b7280' }}>({savedReward.reward_code})</span></div>
          ) : (
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="checkbox" checked={joinRewards} onChange={(e) => setJoinRewards(e.target.checked)} style={{ transform: 'scale(1.4)', marginTop: 4 }} />
              <span><b>🏆 {t(L, 'rewardsJoin')}</b><div style={{ fontSize: 13, color: '#4b5563' }}>{t(L, 'rewardsHint')}</div></span>
            </label>
          )}
          {info.rewards.note && <div style={{ fontSize: 13, marginTop: 6 }}>🎁 {info.rewards.note}</div>}
        </div>
      )}

      {allowed.length > 0 && (
        <div className="wv-card">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{t(L, 'identity')}</div>
          <div className="wv-anon">
            {allowed.map((a) => (
              <label key={a} className={anonymity === a ? 'on' : ''}>
                <input type="radio" name="anon" checked={anonymity === a} onChange={() => setAnonymity(a)} />
                <span><b>{a === 'anonymous' ? '🙈 ' : a === 'protected' ? '🔒 ' : '🙋 '}{t(L, a)}</b><span>{t(L, `${a}Hint`)}</span></span>
              </label>
            ))}
          </div>
          {anonymity !== 'anonymous' && (
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              <input className="wv-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t(L, 'name')} maxLength={120} />
              <input className="wv-input" value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t(L, 'contact')} maxLength={160} />
            </div>
          )}
        </div>
      )}
      <input type="text" value={honey} onChange={(e) => setHoney(e.target.value)} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

      {error && <div className="wv-err" role="alert">{error}</div>}
      {sending && <div className="wv-progress"><div style={{ width: `${progress}%` }} /></div>}
      <button type="button" className="wv-primary" disabled={sending} onClick={submit}>{sending ? t(L, 'sending') : `📨 ${t(L, 'submit')}`}</button>
      <div className="wv-foot">SafeTrack Workplace Voice™</div>
    </>,
  );
};

// ------------------------------------------------------------------ /voice/track/:code
export const VoiceTrack = () => {
  const { code: param } = useParams();
  const history = useHistory();
  const [lang] = useState(readLang() || 'en');
  const [code, setCode] = useState(param ? decodeURIComponent(param) : '');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback((c) => {
    setError('');
    voicePublic.track(c).then((r) => setData(r.data)).catch((e) => { setData(null); setError(e.message); });
  }, []);
  useEffect(() => { if (param) load(decodeURIComponent(param)); }, [param, load]);

  const send = async () => {
    if (reply.trim().length < 2) return;
    setBusy(true);
    try { const r = await voicePublic.reply(data.tracking_code, reply.trim()); setData(r.data); setReply(''); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <Shell lang={lang}>
      <div className="wv-h">🔎 {t(lang, 'followReport')}</div>
      <form className="wv-row" onSubmit={(e) => { e.preventDefault(); if (code.trim()) history.push(`/voice/track/${encodeURIComponent(code.trim())}`); }}>
        <input className="wv-input" style={{ flex: '1 1 200px' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="WV-XXXX-XXXX-XXXX" maxLength={24} aria-label={t(lang, 'enterCode')} />
        <button type="submit" className="wv-btn" style={{ flex: '0 0 auto' }}>{t(lang, 'track')}</button>
      </form>
      {error && <div className="wv-err">{error}</div>}
      {data && (
        <>
          <div className="wv-card">
            <div style={{ fontWeight: 700, fontSize: 17 }}>{GROUP_META[data.group]?.emoji} {data.title || data.tracking_code}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{data.submitted_at ? utc(data.submitted_at).toLocaleString() : ''}</div>
            <ul className="wv-steps" style={{ marginTop: 10 }}>
              {data.steps.map((s) => (
                <li key={s.key} className={s.done ? 'done' : ''}>
                  <span className="dot">{s.done ? '✓' : ''}</span>
                  <span><b>{s.label}</b>{s.at && <div style={{ fontSize: 12, color: '#6b7280' }}>{utc(s.at).toLocaleDateString()}</div>}</span>
                </li>
              ))}
            </ul>
          </div>
          {data.same_issue && <div className="wv-acted">🔁 {t(lang, 'alreadyReported')}</div>}
          {data.reported_by_others > 0 && !data.same_issue && <div className="wv-hint">👥 {data.reported_by_others} {t(lang, 'othersToo')}</div>}
          {(data.action_taken || data.toolbox_talk) && (
            <div className="wv-acted">
              <div style={{ fontWeight: 700, marginBottom: 4 }}>🙌 You spoke, we acted</div>
              {data.action_taken && <div>{data.action_taken}</div>}
              {data.toolbox_talk && <div style={{ marginTop: 6 }}>📣 {data.toolbox_talk.delivered ? 'Shared with the workforce in a toolbox talk' : 'A toolbox talk is being prepared'}: <i>{data.toolbox_talk.title}</i></div>}
            </div>
          )}
          {data.updates.length > 0 && (
            <div className="wv-card">
              {data.updates.map((u, i) => (
                <div key={i} className={`wv-msg ${u.by}`}>
                  {u.type === 'question' && <b>❓ </b>}{u.text}
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{utc(u.at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
          {data.can_reply && (
            <div className="wv-card">
              <textarea className="wv-textarea" value={reply} onChange={(e) => setReply(e.target.value)} maxLength={2000} placeholder={t(lang, 'replyPlaceholder')} />
              <button type="button" className="wv-primary" style={{ minHeight: 48, fontSize: 17 }} disabled={busy || reply.trim().length < 2} onClick={send}>{t(lang, 'reply')}</button>
            </div>
          )}
        </>
      )}
      <p className="wv-hint" style={{ marginTop: 20 }}><Link to="/voice">← {t(lang, 'findCompany')}</Link></p>
    </Shell>
  );
};
