import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import Seo from '../../components/SEO';
import INDEX from '../../data/docLibraryIndex.json';
import { SITE_URL } from '../../data/marketingPages';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { importGeneratedDocument } from '../../components/submissions/SendToDocumentControl';
import { PageHero, Section, buildPageJsonLd } from '../marketing/shared';
import { LIB_PATH } from './LibraryPage';
import './library.css';

const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage not available */ } },
  del: (k) => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
};
const save = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
const esc = (v) => String(v || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const apiBase = () => String(api.defaults.baseURL || '').replace(/\/$/, '');

export default function LibraryDocPage() {
  const { slug } = useParams();
  const history = useHistory();
  const { user, token } = useAuth();
  const meta = INDEX.find((d) => d.slug === slug);
  const key = `lib:draft:${slug}`;
  const ed = useRef(null);
  const timer = useRef(null);
  const [doc, setDoc] = useState(null);
  const [failed, setFailed] = useState(false);
  const [company, setCompany] = useState(store.get('lib:company') || '');
  const [project, setProject] = useState('');
  const [logo, setLogo] = useState(null);
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState(null);
  const loggedIn = !!user;

  useEffect(() => {
    let off = false;
    setDoc(null); setFailed(false); setNote(null);
    if (!meta) return undefined;
    fetch(`/doc-library/${slug}.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error('missing'))))
      .then((d) => { if (!off) setDoc(d); }).catch(() => { if (!off) setFailed(true); });
    return () => { off = true; clearTimeout(timer.current); };
  }, [slug, meta]);
  useEffect(() => {
    if (doc && ed.current) ed.current.innerHTML = sanitizeHtml(store.get(key) || doc.html);
  }, [doc, key]);

  const changed = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { if (ed.current) store.set(key, sanitizeHtml(ed.current.innerHTML)); }, 800);
  }, [key]);
  const cmd = (c, v) => { ed.current.focus(); document.execCommand(c, false, v); changed(); };
  const onPaste = (e) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); };
  // clicking a box ticks it
  const onClick = () => {
    const s = window.getSelection();
    const n = s && s.isCollapsed ? s.anchorNode : null;
    if (!n || n.nodeType !== 3 || !ed.current.contains(n)) return;
    const t = n.nodeValue;
    const at = [s.anchorOffset, s.anchorOffset - 1].find((i) => t[i] === '☐' || t[i] === '☑');
    if (at === undefined) return;
    n.nodeValue = t.slice(0, at) + (t[at] === '☐' ? '☑' : '☐') + t.slice(at + 1);
    changed();
  };
  const pickLogo = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!/^image\/(png|jpeg)$/.test(f.type) || f.size > 280000) { setNote({ text: 'Use a PNG or JPG logo under 280 KB.' }); return; }
    const r = new FileReader(); r.onload = () => setLogo(r.result); r.readAsDataURL(f);
  };
  const html = () => sanitizeHtml(ed.current.innerHTML);

  const pdf = async () => {
    setBusy('pdf'); setNote(null); store.set('lib:company', company);
    try {
      const res = await fetch(`${apiBase()}${loggedIn ? '/doc-library/pdf' : '/public/doc-pdf'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(loggedIn && token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ slug, title: doc.title, html: html(), company, project, logo }),
      });
      if (res.status === 429) { setNote({ text: loggedIn ? 'You have downloaded a lot in the last hour. Please try again later.' : 'You have used today\'s 5 free downloads. Create a free account to keep downloading - your edits are saved on this device.', signup: !loggedIn }); return; }
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Download failed');
      save(await res.blob(), `${slug}.pdf`);
      setNote({ text: loggedIn ? 'Downloaded.' : 'Downloaded. Want it as a Word file, or filled in by AI for your own job? That needs a free account.', signup: !loggedIn });
    } catch (e) { setNote({ text: e.message || 'Download failed. Please try again.' }); } finally { setBusy(''); }
  };
  const word = () => {
    if (!loggedIn) { setNote({ text: 'Word downloads are free with an account. Your edits are saved on this device.', signup: true }); return; }
    const body = `<html><head><meta charset="utf-8"><style>body{font-family:Calibri,Arial;font-size:11pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #888;padding:4px;font-size:9pt}h1,h2{color:#1E3D58}</style></head><body><h1>${esc(doc.title)}</h1><p><b>${esc([company, project].filter(Boolean).join(' | '))}</b></p>${html()}</body></html>`;
    save(new Blob(['﻿', body], { type: 'application/msword' }), `${slug}.doc`);
  };
  const advanced = async () => {
    if (!loggedIn) { setNote({ text: 'The advanced editor (comments, approval, signatures, version history) needs a free account. Your edits are saved on this device.', signup: true }); return; }
    setBusy('adv');
    try {
      await importGeneratedDocument({ title: doc.title, html: html(), documentType: 'template', module: 'hse' });
      history.push('/document-management');
    } catch (e) { setNote({ text: e.response?.data?.error || e.data?.error || e.message || 'Could not save to Document Management.' }); } finally { setBusy(''); }
  };
  const related = useMemo(() => (meta ? INDEX.filter((d) => d.slug !== slug && d.industry === meta.industry)
    .sort((a, b) => (b.type === meta.type) - (a.type === meta.type)).slice(0, 6) : []), [meta, slug]);

  if (!meta || failed) {
    return <main className="mk-page"><Section title="Document not found"><p><Link to={LIB_PATH}>See all free safety documents</Link></p></Section></main>;
  }
  const path = `${LIB_PATH}/${slug}`;
  const crumbs = [{ name: 'Home', to: '/' }, { name: 'Free safety documents', to: LIB_PATH }, { name: meta.title, to: path }];
  const seoTitle = `${meta.title} Template - Free PDF${meta.industry === 'All Industries' ? '' : ` | ${meta.industry}`} | SafeTrack Pro`;
  return (
    <main className="mk-page">
      <Seo title={seoTitle} description={meta.description} canonical={`${SITE_URL}${path}`} jsonLd={buildPageJsonLd({ name: seoTitle, description: meta.description, path, breadcrumbs: crumbs })} />
      <PageHero breadcrumbs={crumbs} eyebrow={`${meta.industry} · ${meta.type}`} h1={`${meta.title} template`} lead={meta.description}
        primary={{ label: 'All free documents', to: LIB_PATH }} secondary={{ label: 'Write one with AI', to: '/ai-hse-document-generator' }} />
      <Section>
        <div className="lib-layout">
          <div>
            <div className="lib-tools" role="toolbar" aria-label="Editor">
              <button type="button" title="Undo" onClick={() => cmd('undo')}>↶</button>
              <button type="button" title="Redo" onClick={() => cmd('redo')}>↷</button>
              <button type="button" title="Bold" onClick={() => cmd('bold')}><b>B</b></button>
              <button type="button" title="Italic" onClick={() => cmd('italic')}><i>I</i></button>
              <button type="button" title="Heading" onClick={() => cmd('formatBlock', 'h2')}>H</button>
              <button type="button" title="Normal text" onClick={() => cmd('formatBlock', 'p')}>¶</button>
              <button type="button" title="Bullet list" onClick={() => cmd('insertUnorderedList')}>• List</button>
              <button type="button" title="Tick box" onClick={() => cmd('insertText', '☐ ')}>☐</button>
              <button type="button" title="Start again" onClick={() => { store.del(key); ed.current.innerHTML = sanitizeHtml(doc.html); }}>Reset</button>
              <button type="button" onClick={advanced} disabled={!!busy || !doc}>⭐ Advanced editor</button>
            </div>
            <div ref={ed} className="lib-paper" data-testid="lib-editor" contentEditable={!!doc} suppressContentEditableWarning onInput={changed} onPaste={onPaste} onClick={onClick}
              role="textbox" aria-multiline="true" aria-label={`${meta.title} editor`} tabIndex={0}>{doc ? null : 'Loading document...'}</div>
          </div>
          <aside className="lib-side">
            <div className="lib-box lib-form">
              <h3>Make it yours</h3>
              <label htmlFor="lib-co">Company name</label><input id="lib-co" value={company} maxLength={100} onChange={(e) => setCompany(e.target.value)} />
              <label htmlFor="lib-pr">Project or site</label><input id="lib-pr" value={project} maxLength={100} onChange={(e) => setProject(e.target.value)} />
              <label htmlFor="lib-lo">Logo (PNG or JPG)</label><input id="lib-lo" type="file" accept="image/png,image/jpeg" onChange={pickLogo} />
              <button type="button" className="lib-btn" data-testid="lib-pdf" disabled={!doc || !!busy} onClick={pdf}>{busy === 'pdf' ? 'Preparing...' : 'Download PDF (free)'}</button>
              <button type="button" className="lib-btn ghost" disabled={!doc || !!busy} onClick={word}>Download Word</button>
              {note && <div className="lib-msg" role="status" data-testid="lib-note">{note.text}{note.signup && <div style={{ marginTop: 8 }}><Link className="lib-btn" to="/signup">Create free account</Link><p style={{ margin: '8px 0 0' }}>Have one? <Link to="/login">Log in</Link></p></div>}</div>}
            </div>
            {!loggedIn && (
              <div className="lib-box"><h3>Free account adds</h3><ul><li>Word downloads</li><li>Advanced editor, approval and signatures</li><li>AI that writes the document for your job</li><li>Daily toolbox talks from your own records</li></ul>
                <p style={{ margin: '10px 0 0' }}><Link className="lib-btn ghost" to="/signup">Start free</Link></p></div>
            )}
            <div className="lib-box"><p style={{ margin: 0 }}>Templates are a starting point. Have a competent person review this document against your task, site and local law before use.</p></div>
          </aside>
        </div>
      </Section>
      {related.length > 0 && (
        <Section title={`More ${meta.industry === 'All Industries' ? '' : `${meta.industry.toLowerCase()} `}templates`} alt>
          <div className="mk-grid">{related.map((d) => <Link key={d.slug} to={`${LIB_PATH}/${d.slug}`} className="mk-card mk-card-link-wrap"><h3>{d.title}</h3><p>{d.type}</p><span className="mk-card-link">Open →</span></Link>)}</div>
        </Section>
      )}
    </main>
  );
}
