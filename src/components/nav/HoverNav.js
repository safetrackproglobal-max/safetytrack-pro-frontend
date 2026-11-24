// Header navigation with see-through dropdowns. Opens on mouse hover, click, tap or keyboard.
// groups: [{ key, label, icon, accent, to?, items?: [{ key, label, icon, hint, badge, to? }] }]
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';
import './HoverNav.css';

const OPEN_MS = 70;
const CLOSE_MS = 180;
const has = (group, active) => group.key === active || (group.items || []).some((i) => i.key === active || i.to === active);

function Entry({ item, active, onPick }) {
  const body = (
    <>
      {item.icon && <span className="hn-ico" aria-hidden="true">{item.icon}</span>}
      <span className="hn-text">
        <span className="hn-label">{item.label}{item.badge ? <em className="hn-badge">{item.badge}</em> : null}</span>
        {item.hint && <span className="hn-hint">{item.hint}</span>}
      </span>
    </>
  );
  const cls = `hn-item${active ? ' on' : ''}`;
  return item.to
    ? <Link className={cls} to={item.to} onClick={() => onPick(item)} aria-current={active ? 'page' : undefined}>{body}</Link>
    : <button type="button" className={cls} onClick={() => onPick(item)} aria-current={active ? 'page' : undefined}>{body}</button>;
}

export default function HoverNav({ groups, active, onSelect, label = 'Sections', className = '' }) {
  const [open, setOpen] = useState(null);
  const [shift, setShift] = useState(0);
  const root = useRef(null);
  const panel = useRef(null);
  const timer = useRef(null);
  const openedBy = useRef('');

  const later = useCallback((fn, ms) => { clearTimeout(timer.current); timer.current = setTimeout(fn, ms); }, []);
  const close = useCallback(() => { clearTimeout(timer.current); setOpen(null); }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  // keep the panel inside the window
  useEffect(() => {
    setShift(0);
    if (!open || !panel.current) return undefined;
    const fit = () => {
      const el = panel.current;
      if (!el) return;
      el.style.setProperty('--hn-shift', '0px');
      const r = el.getBoundingClientRect();
      const w = document.documentElement.clientWidth;
      let d = 0;
      if (r.right > w - 12) d = w - 12 - r.right;
      if (r.left + d < 12) d = 12 - r.left;
      setShift(Math.round(d));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (root.current && !root.current.contains(e.target)) close(); };
    const esc = (e) => {
      if (e.key !== 'Escape') return;
      const btn = root.current?.querySelector(`[data-hn="${open}"]`);
      close();
      btn?.focus();
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [open, close]);

  const enter = (key, e) => {
    if (e.pointerType !== 'mouse') return;                 // touch uses tap
    later(() => { openedBy.current = 'hover'; setOpen(key); }, open ? 0 : OPEN_MS);
  };
  const leave = (e) => { if (e.pointerType === 'mouse') later(() => setOpen(null), CLOSE_MS); };
  const toggle = (key) => {
    clearTimeout(timer.current);
    // the first click on a menu that hover just opened keeps it open
    if (open === key && openedBy.current === 'click') { setOpen(null); return; }
    openedBy.current = 'click';
    setOpen(key);
  };
  const focusItem = (dir) => {
    const list = [...(panel.current?.querySelectorAll('.hn-item') || [])];
    if (!list.length) return;
    const i = list.indexOf(document.activeElement);
    list[(i + dir + list.length) % list.length].focus();
  };
  const onKey = (e, key) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (open !== key) { openedBy.current = 'click'; setOpen(key); setTimeout(() => focusItem(1), 30); } else focusItem(1);
    } else if (e.key === 'ArrowUp' && open === key) { e.preventDefault(); focusItem(-1); } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const tops = [...root.current.querySelectorAll('.hn-top')];
      const i = tops.indexOf(document.activeElement);
      if (i >= 0) { e.preventDefault(); tops[(i + (e.key === 'ArrowRight' ? 1 : -1) + tops.length) % tops.length].focus(); }
    }
  };
  const pick = (item) => { close(); if (onSelect) onSelect(item); };

  return (
    <nav className={`hn ${className}`} aria-label={label} ref={root}
      onBlur={(e) => { if (e.relatedTarget && !root.current.contains(e.relatedTarget)) close(); }}>
      <ul className="hn-bar">
        {groups.map((g) => {
          const on = has(g, active);
          if (!g.items || !g.items.length) {
            return (
              <li key={g.key} onPointerEnter={(e) => { if (e.pointerType === 'mouse') later(() => setOpen(null), OPEN_MS); }}>
                {g.to
                  ? <Link className={`hn-top${on ? ' on' : ''}${g.accent ? ' accent' : ''}`} to={g.to} onClick={() => pick(g)}>{g.icon}<span>{g.label}</span></Link>
                  : <button type="button" className={`hn-top${on ? ' on' : ''}`} onClick={() => pick(g)}>{g.icon}<span>{g.label}</span></button>}
              </li>
            );
          }
          const isOpen = open === g.key;
          const cols = g.items.length > 8 ? 3 : g.items.length > 4 ? 2 : 1;
          return (
            <li key={g.key} onPointerEnter={(e) => enter(g.key, e)} onPointerLeave={leave} onKeyDown={(e) => onKey(e, g.key)}>
              <button type="button" data-hn={g.key} className={`hn-top${on ? ' on' : ''}${isOpen ? ' open' : ''}${g.accent ? ' accent' : ''}`}
                aria-expanded={isOpen} aria-haspopup="true" onClick={() => toggle(g.key)}>
                {g.icon}<span>{g.label}</span><DownOutlined className="hn-caret" />
              </button>
              {isOpen && (
                <div className={`hn-panel c${cols}`} ref={panel} style={{ '--hn-shift': `${shift}px` }} data-testid={`hn-panel-${g.key}`}>
                  <div className="hn-grid">
                    {g.items.map((i) => <Entry key={i.key || i.to} item={i} active={i.key === active || i.to === active} onPick={pick} />)}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Phone version of the same groups: an accordion list for a side drawer. */
export function NavList({ groups, active, onSelect, label = 'Sections' }) {
  const [open, setOpen] = useState(() => groups.find((g) => g.items?.length && has(g, active))?.key || null);
  return (
    <nav className="hn-list" aria-label={label}>
      {groups.map((g) => {
        const on = has(g, active);
        if (!g.items || !g.items.length) {
          return g.to
            ? <Link key={g.key} className={`hn-row${on ? ' on' : ''}`} to={g.to} onClick={() => onSelect && onSelect(g)}>{g.icon}<span>{g.label}</span></Link>
            : <button key={g.key} type="button" className={`hn-row${on ? ' on' : ''}`} onClick={() => onSelect && onSelect(g)}>{g.icon}<span>{g.label}</span></button>;
        }
        const isOpen = open === g.key;
        return (
          <div key={g.key}>
            <button type="button" className={`hn-row${on ? ' on' : ''}`} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : g.key)}>
              {g.icon}<span>{g.label}</span><DownOutlined className={`hn-caret${isOpen ? ' up' : ''}`} />
            </button>
            {isOpen && <div className="hn-sub">{g.items.map((i) => <Entry key={i.key || i.to} item={{ ...i, hint: undefined }} active={i.key === active || i.to === active} onPick={(x) => onSelect && onSelect(x)} />)}</div>}
          </div>
        );
      })}
    </nav>
  );
}
