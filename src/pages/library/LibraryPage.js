import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Seo from '../../components/SEO';
import INDEX from '../../data/docLibraryIndex.json';
import { SITE_URL } from '../../data/marketingPages';
import { PageHero, Section, FaqList, CtaBand, buildPageJsonLd } from '../marketing/shared';
import './library.css';

export const LIB_PATH = '/free-safety-documents';
export const LIB_FAQS = [
  { q: 'Are the documents really free?', a: 'Yes. You can read, edit and download them as PDF without an account, up to five PDFs per day. A free account adds Word downloads and more PDFs.' },
  { q: 'Can I add my company name and logo?', a: 'Yes. Type your company and project name, add a logo, edit any text and tick the checkboxes before downloading.' },
  { q: 'Can I use a template without changing it?', a: 'No template fits every site. Have a competent person review it against your work, your risk assessment and your local law before use.' },
];
const uniq = (k) => [...new Set(INDEX.map((d) => d[k]))].sort();
const INDUSTRIES = uniq('industry');
const TYPES = uniq('type');

export default function LibraryPage() {
  const { search } = useLocation();
  const asked = new URLSearchParams(search).get('industry');
  const [industry, setIndustry] = useState(INDUSTRIES.includes(asked) ? asked : '');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(48);
  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return INDEX.filter((d) => (!industry || d.industry === industry) && (!type || d.type === type)
      && words.every((w) => `${d.title} ${d.industry} ${d.type} ${d.description}`.toLowerCase().includes(w)));
  }, [industry, type, q]);
  const title = `${INDEX.length} Free Safety Documents & Templates (PDF) | SafeTrack Pro`;
  const description = 'Free editable HSE templates: risk assessments, JSAs, permits to work, safety plans and forms for construction, oil and gas, mining and more. Add your logo, download PDF.';
  return (
    <main className="mk-page">
      <Seo title={title} description={description} canonical={`${SITE_URL}${LIB_PATH}`}
        jsonLd={buildPageJsonLd({ name: title, description, path: LIB_PATH, breadcrumbs: [{ name: 'Home', to: '/' }, { name: 'Free safety documents', to: LIB_PATH }], faqs: LIB_FAQS })} />
      <PageHero breadcrumbs={[{ name: 'Home', to: '/' }, { name: 'Free safety documents', to: LIB_PATH }]} eyebrow="Free library"
        h1={`${INDEX.length} free safety documents you can edit and download`}
        lead="Risk assessments, job safety analyses, permits, method statements and plans. Add your company name and logo, change any text, and download a PDF. No account needed."
        primary={{ label: 'Create a free account', to: '/signup' }} secondary={{ label: 'Free CSP practice test', to: '/csp-practice-exam/free-test' }} />
      <Section>
        <div className="lib-bar">
          <input aria-label="Search documents" placeholder="Search: scaffold, hot work, confined space..." value={q} maxLength={80} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)}><option value="">All categories</option>{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</select>
          <select aria-label="Document type" value={type} onChange={(e) => setType(e.target.value)}><option value="">All document types</option>{TYPES.map((i) => <option key={i}>{i}</option>)}</select>
        </div>
        <p data-testid="lib-count">{list.length} document{list.length === 1 ? '' : 's'}</p>
        <div className="mk-grid">
          {list.slice(0, limit).map((d) => (
            <Link key={d.slug} to={`${LIB_PATH}/${d.slug}`} className="mk-card mk-card-link-wrap">
              <div><span className="lib-tag">{d.industry}</span><span className="lib-tag">{d.type}</span></div>
              <h3>{d.title}</h3><p>{d.topics.length ? d.topics.slice(0, 3).join(' · ') : 'Editable template'}</p>
              <span className="mk-card-link">Open and edit →</span>
            </Link>
          ))}
        </div>
        {!list.length && <p>No template matches. Our <Link to="/ai-hse-document-generator">AI document generator</Link> can write it for you.</p>}
        {list.length > limit && <p style={{ textAlign: 'center', marginTop: 20 }}><button type="button" className="lib-btn ghost" style={{ maxWidth: 260, margin: '0 auto' }} onClick={() => setLimit(limit + 48)}>Show more</button></p>}
      </Section>
      <FaqList faqs={LIB_FAQS} />
      <CtaBand title="Need a document written for your exact job?" primary={{ label: 'Start free', to: '/signup' }} secondary={{ label: 'See the AI generator', to: '/ai-hse-document-generator' }} />
    </main>
  );
}
