import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/SEO';
import { SITE_URL, SOLUTIONS, SOLUTIONS_BY_SLUG, INDUSTRIES, COMPLIANCE_PAGES } from '../data/marketingPages';
import { TRUST_PAGES, AI_WARNING } from '../data/trustPages';
import { HOME_TITLE, HOME_DESCRIPTION, HOME_H1, HOME_LEAD, DOORS, SPOTLIGHTS, MODULE_GROUPS, TRUST_POINTS, STEPS, HOME_FAQS, OTHER_PAGES } from '../data/homeContent';
import './HomePage.css'; // shared classes (.container, design tokens) used by the footer and other public pages
import './home.css';

const API_BASE = (process.env.REACT_APP_API_BASE_URL || 'https://safetrackproglobal-backend-production.up.railway.app').replace(/\/+$/, '');
const SYMBOL = { USD: '$', GHS: 'GH₵', QAR: 'QR ', INR: '₹', EUR: '€' };
const PLANS = [
  { key: 'free', name: 'Starter', text: 'For small teams starting out', to: '/signup', cta: 'Start free', price: 'Free' },
  { key: 'pro', name: 'Professional', text: 'For growing organisations', to: '/pricing', cta: 'See what is included', price: 'See plans' },
  { key: 'enterprise', name: 'Enterprise', text: 'For multi-site operations', to: '/contact', cta: 'Talk to us', price: 'Custom' }
];
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
};
const directory = [
  ['Products', SOLUTIONS.map((s) => [s.name, `/${s.slug}`])],
  ['Industries', INDUSTRIES.map((i) => [i.name, `/industries/${i.slug}`])],
  ['Standards', COMPLIANCE_PAGES.map((c) => [c.code, `/compliance/${c.slug}`])],
  ['How it works', TRUST_PAGES.filter((p) => p.group !== 'Trust').map((p) => [p.nav, p.path])],
  ['Trust', [['Trust centre', '/trust'], ...TRUST_PAGES.filter((p) => p.group === 'Trust').map((p) => [p.nav, p.path])]],
  ...OTHER_PAGES
];

function Plans() {
  const [prices, setPrices] = useState({});
  useEffect(() => {
    const c = new AbortController();
    fetch(`${API_BASE}/api/plans/pricing?country=default`, { signal: c.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        const out = {};
        PLANS.forEach(({ key }) => {
          const v = d[key] && d[key]['1_month'];
          if (v === undefined || v === null) return;
          if (v === 'Custom') out[key] = 'Custom';
          else out[key] = Number(v) === 0 ? 'Free' : `${SYMBOL[d[key].currency] || '$'}${v} / month`;
        });
        setPrices(out);
      })
      .catch(() => { /* the fixed labels stay */ });
    return () => c.abort();
  }, []);
  return (
    <div className="hm-grid hm-3">
      {PLANS.map((p) => (
        <div className="hm-card hm-plan" key={p.key}>
          <h3>{p.name}</h3>
          <div className="hm-price">{prices[p.key] || p.price}</div>
          <p>{p.text}</p>
          <Link className="hm-btn ghost" to={p.to}>{p.cta}</Link>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { isRTL } = useLanguage();
  return (
    <div className="hm" dir={isRTL ? 'rtl' : 'ltr'}>
      <Seo title={HOME_TITLE} description={HOME_DESCRIPTION} canonical={`${SITE_URL}/`} image={`${SITE_URL}/android-chrome-512x512.png`} jsonLd={JSON_LD} />

      <section className="hm-hero">
        <div className="hm-wrap hm-hero-grid">
          <div>
            <h1>{HOME_H1}</h1>
            <p className="hm-lead">{HOME_LEAD}</p>
            <div className="hm-actions">
              <Link className="hm-btn" to="/signup">Create a free account</Link>
              <Link className="hm-btn light" to="/voice">Report a concern</Link>
              <Link className="hm-textlink" to="/demo">Book a demo</Link>
            </div>
            <p className="hm-small">No card needed for the free plan. <Link to="/data-use">See how we use your data</Link>.</p>
          </div>
          <figure className="hm-shot">
            <img src="/img/workplace-voice-dashboard.webp" width="1600" height="900" alt="Workplace Voice inbox in SafeTrack Pro: worker reports sorted by risk, project and status" />
            <figcaption>Workplace Voice inbox. Sample data.</figcaption>
          </figure>
        </div>
      </section>

      <section className="hm-sec hm-doors" aria-label="Start here">
        <div className="hm-wrap hm-grid hm-4">
          {DOORS.map((d) => (
            <Link className="hm-door" to={d.to} key={d.to}>
              <h2>{d.title}</h2>
              <p>{d.text}</p>
              <span>{d.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="hm-sec alt" id="trust">
        <div className="hm-wrap">
          <h2 className="hm-h2">Know what happens to your data</h2>
          <p className="hm-intro">{AI_WARNING}</p>
          <div className="hm-grid hm-4">
            {TRUST_POINTS.map((t) => (
              <div className="hm-trust" key={t.title}>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
                <Link to={t.to}>{t.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hm-sec" id="tools">
        <div className="hm-wrap">
          <h2 className="hm-h2">Four tools, fully explained</h2>
          <p className="hm-intro">Each one has a public guide: what it does, what it stores, and where it can be wrong.</p>
          <div className="hm-grid hm-2">
            {SPOTLIGHTS.map((s) => (
              <div className="hm-card" key={s.to}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className="hm-links"><Link to={s.guide}>{s.guideLabel}</Link><Link to={s.to}>About this tool</Link></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hm-sec alt" id="features">
        <div className="hm-wrap">
          <h2 className="hm-h2">The whole platform</h2>
          <div className="hm-grid hm-3">
            {MODULE_GROUPS.map(([name, slugs]) => (
              <div key={name}>
                <h3 className="hm-group">{name}</h3>
                <ul className="hm-modules">
                  {slugs.map((slug) => SOLUTIONS_BY_SLUG[slug]).filter(Boolean).map((m) => (
                    <li key={m.slug}><Link to={`/${m.slug}`}><strong>{m.name}</strong><span>{m.summary}</span></Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hm-sec">
        <div className="hm-wrap hm-split">
          <div>
            <h2 className="hm-h2">Made for your industry</h2>
            <div className="hm-chips">{INDUSTRIES.map((i) => <Link key={i.slug} to={`/industries/${i.slug}`}>{i.name}</Link>)}</div>
          </div>
          <div>
            <h2 className="hm-h2">Guides to the standards</h2>
            <div className="hm-chips">{COMPLIANCE_PAGES.map((c) => <Link key={c.slug} to={`/compliance/${c.slug}`}>{c.code}</Link>)}</div>
            <p className="hm-small dark">Templates and workflows cover these topics. Using them does not certify an organisation.</p>
          </div>
        </div>
      </section>

      <section className="hm-sec alt">
        <div className="hm-wrap">
          <h2 className="hm-h2">How to start</h2>
          <ol className="hm-steps">{STEPS.map(([t, x]) => <li key={t}><strong>{t}</strong><span>{x}</span></li>)}</ol>
        </div>
      </section>

      <section className="hm-sec" id="pricing">
        <div className="hm-wrap">
          <h2 className="hm-h2">Plans</h2>
          <Plans />
          <p className="hm-small dark"><Link to="/pricing">Compare plans and see prices for your country</Link></p>
        </div>
      </section>

      <section className="hm-sec alt" id="faq">
        <div className="hm-wrap hm-narrow">
          <h2 className="hm-h2">Common questions</h2>
          {HOME_FAQS.map((f) => <details className="hm-faq" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
        </div>
      </section>

      <section className="hm-sec" id="all-pages">
        <div className="hm-wrap">
          <h2 className="hm-h2">Find any page</h2>
          <nav className="hm-dir" aria-label="All pages">
            {directory.map(([name, links]) => (
              <div key={name}>
                <h3>{name}</h3>
                <ul>{links.map(([label, to]) => <li key={to}><Link to={to}>{label}</Link></li>)}</ul>
              </div>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}
