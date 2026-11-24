// Shows a notice before AI, camera, health and upload features are used, and a short AI warning on AI screens.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { NOTICES, accept, ask, hasAccepted, installCallGuard, isLoggedIn, noticesFor, setAsker, showsAiWarning, syncAccepted } from '../services/consentService';
import './ConsentGate.css';

installCallGuard();

function Notice({ feature, onAccept, onDecline, declineLabel }) {
  const n = NOTICES[feature];
  const [ok, setOk] = useState(false);
  const box = useRef(null);
  useEffect(() => { setOk(false); box.current?.focus(); }, [feature]);
  return (
    <div className="cg-box" role="dialog" aria-modal="true" aria-labelledby="cg-title" tabIndex={-1} ref={box} data-testid={`cg-${feature}`}>
      <h2 id="cg-title">{n.title}</h2>
      {n.warning && <p className="cg-warn">{n.warning}</p>}
      <ul>{n.points.map((p) => <li key={p}>{p}</li>)}</ul>
      <p className="cg-links">
        {n.links.map(([label, to]) => <a key={to} href={to} target="_blank" rel="noopener noreferrer">{label}</a>)}
      </p>
      <label className="cg-check">
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} data-testid="cg-tick" />
        <span>{n.accept}</span>
      </label>
      <div className="cg-actions">
        <button type="button" className="cg-btn ghost" onClick={onDecline}>{declineLabel}</button>
        <button type="button" className="cg-btn" disabled={!ok} onClick={onAccept} data-testid="cg-accept">Accept and continue</button>
      </div>
    </div>
  );
}

const isFile = (el) => el && el.tagName === 'INPUT' && el.type === 'file';
// The public reporting page has its own notice, and free documents stay in the browser.
const ownNotice = () => /^\/(voice|free-safety-documents)(\/|$)/.test(window.location.pathname);

export default function ConsentGate({ children }) {
  const { pathname } = useLocation();
  const history = useHistory();
  const [, refresh] = useState(0);
  const [popup, setPopup] = useState(null);
  const bump = useCallback(() => refresh((x) => x + 1), []);

  useEffect(() => { if (isLoggedIn()) syncAccepted().then(bump); }, [pathname, bump]);
  useEffect(() => {
    setAsker((feature) => new Promise((resolve) => setPopup((old) => { old?.resolve(false); return { feature, resolve }; })));
    return () => setAsker(null);
  }, []);

  // Every file picker and drag-and-drop, on every screen
  useEffect(() => {
    const needs = () => isLoggedIn() && !ownNotice() && !hasAccepted('upload');
    const onClick = (e) => {
      const el = e.target;
      if (!isFile(el) || !needs()) return;
      e.preventDefault();
      e.stopPropagation();
      ask('upload', true).then((ok) => { if (ok) el.click(); });
    };
    const onDrop = (e) => {
      if (!e.dataTransfer?.files?.length || !needs()) return;
      e.preventDefault();
      e.stopPropagation();
      ask('upload', true);
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('drop', onDrop, true);
    const proto = window.HTMLInputElement.prototype;
    const nativeClick = proto.click;
    proto.click = function guardedClick() {
      if (this.type === 'file' && !this.isConnected && needs()) {
        ask('upload', true).then((ok) => { if (ok) nativeClick.call(this); });
        return;
      }
      nativeClick.call(this);
    };
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('drop', onDrop, true);
      proto.click = nativeClick;
    };
  }, []);

  const missing = isLoggedIn() ? noticesFor(pathname).find((f) => !hasAccepted(f)) : null;
  const leave = () => (missing === 'policy' ? history.push('/') : history.push('/dashboard'));

  return (
    <>
      {missing ? (
        <div className="cg-page">
          <Notice feature={missing} onAccept={() => { accept(missing); bump(); }} onDecline={leave}
            declineLabel={missing === 'policy' ? 'Not now' : 'Back to dashboard'} />
        </div>
      ) : children}
      {popup && (
        <div className="cg-overlay">
          <Notice feature={popup.feature} declineLabel="Not now"
            onAccept={() => { popup.resolve(true); setPopup(null); }}
            onDecline={() => { popup.resolve(false); setPopup(null); }} />
        </div>
      )}
    </>
  );
}

export function AiWarningBar() {
  const { pathname } = useLocation();
  if (!showsAiWarning(pathname)) return null;
  return (
    <div className="cg-bar" role="note" data-testid="ai-warning">
      AI can make mistakes. Check every AI result independently before you use it.{' '}
      <a href="/ai-transparency" target="_blank" rel="noopener noreferrer">How AI uses your data</a>
    </div>
  );
}
