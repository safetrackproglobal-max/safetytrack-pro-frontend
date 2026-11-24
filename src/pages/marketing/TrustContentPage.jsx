import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/SEO';
import { SITE_URL } from '../../data/marketingPages';
import { TRUST_BY_PATH } from '../../data/trustPages';
import { Breadcrumbs, Section, CheckList, FaqList, buildPageJsonLd } from './shared';

export function DataTable({ table }) {
  return (
    <div className="mk-table-wrap" tabIndex={0} role="region" aria-label="Table, scroll sideways on small screens">
      <table className="mk-table">
        <thead><tr>{table.head.map((h, i) => <th key={`${h}${i}`} scope="col">{h}</th>)}</tr></thead>
        <tbody>
          {table.rows.map((r) => (
            <tr key={r[0]}>{r.map((c, i) => (i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i}>{c}</td>))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TrustContentPage({ path }) {
  const page = TRUST_BY_PATH[path];
  if (!page) return null;
  const crumbs = [{ name: 'Home', to: '/' }, { name: page.parent[0], to: page.parent[1] }, { name: page.nav, to: path }];
  return (
    <div className="mk-page">
      <Seo
        title={page.title}
        description={page.description}
        canonical={`${SITE_URL}${path}`}
        jsonLd={buildPageJsonLd({ name: page.title, description: page.description, path, breadcrumbs: crumbs, faqs: page.faqs })}
      />
      <section className="mk-hero mk-hero-sm">
        <div className="mk-container">
          <Breadcrumbs items={crumbs} />
          <h1>{page.h1}</h1>
          <p className="mk-lead" style={{ marginBottom: 0 }}>{page.lead}</p>
        </div>
      </section>
      {page.warning && (
        <div className="mk-container"><p className="mk-warning" role="note">{page.warning}</p></div>
      )}
      {page.sections.map((s, i) => (
        <Section key={s.h} title={s.h} alt={i % 2 === 1}>
          {s.table && <DataTable table={s.table} />}
          {s.list && <CheckList items={s.list} />}
          {s.steps && <ol className="mk-olist">{s.steps.map((x) => <li key={x}>{x}</li>)}</ol>}
          {(s.p || []).map((x) => <p key={x} className="mk-prose" style={{ marginTop: 14 }}>{x}</p>)}
        </Section>
      ))}
      <FaqList faqs={page.faqs} />
      <Section title="Read next">
        <div className="mk-chips">
          {[...page.links, ['Home', '/']].map(([label, to]) => <Link key={to} to={to} className="mk-chip">{label}</Link>)}
        </div>
      </Section>
    </div>
  );
}
