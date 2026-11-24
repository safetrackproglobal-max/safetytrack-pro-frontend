import React from 'react';
import { Link } from 'react-router-dom';
import { SITE_URL, SOLUTIONS_BY_SLUG, solutionPath } from '../../data/marketingPages';
import './marketing.css';

/* ---------- JSON-LD builders ---------- */
export const buildPageJsonLd = ({ name, description, path, breadcrumbs, faqs = [] }) => {
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${path}#webpage`,
      url: `${SITE_URL}${path}`,
      name,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${SITE_URL}${item.to}`
      }))
    }
  ];

  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a }
      }))
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
};

/* ---------- Layout pieces ---------- */
export function Breadcrumbs({ items }) {
  return (
    <nav className="mk-breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.to}-${item.name}`}>
            {index < items.length - 1 ? (
              <Link to={item.to}>{item.name}</Link>
            ) : (
              <span aria-current="page">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({ breadcrumbs, eyebrow, h1, lead, primary, secondary }) {
  const main = primary || { label: 'Create Free Account', to: '/signup' };
  const alt = secondary || { label: 'Book a Demo', to: '/demo' };
  return (
    <section className="mk-hero">
      <div className="mk-container">
        <Breadcrumbs items={breadcrumbs} />
        {eyebrow && <span className="mk-eyebrow">{eyebrow}</span>}
        <h1>{h1}</h1>
        <p className="mk-lead">{lead}</p>
        <div className="mk-actions">
          <Link className="mk-btn mk-btn-primary" to={main.to}>
            {main.label}
          </Link>
          <Link className="mk-btn mk-btn-ghost" to={alt.to}>
            {alt.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Section({ title, intro, alt = false, children }) {
  return (
    <section className={`mk-section ${alt ? 'mk-section-alt' : ''}`}>
      <div className="mk-container">
        {title && <h2 className="mk-h2">{title}</h2>}
        {intro && <p className="mk-intro">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function CardGrid({ items }) {
  return (
    <div className="mk-grid">
      {items.map((item) => {
        const body = (
          <>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            {item.to && <span className="mk-card-link">Learn more →</span>}
          </>
        );
        return item.to ? (
          <Link key={item.title} to={item.to} className="mk-card mk-card-link-wrap">
            {body}
          </Link>
        ) : (
          <div key={item.title} className="mk-card">
            {body}
          </div>
        );
      })}
    </div>
  );
}

export function CheckList({ items }) {
  return (
    <ul className="mk-checklist">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function Steps({ steps }) {
  return (
    <ol className="mk-steps">
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className="mk-step-num">{index + 1}</span>
          <strong>{step.title}</strong>
          {step.text && <span>{step.text}</span>}
        </li>
      ))}
    </ol>
  );
}

export function Chips({ items }) {
  return (
    <div className="mk-chips">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className="mk-chip">
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function RelatedSolutions({ slugs, title = 'Related HSE modules' }) {
  const items = slugs
    .map((slug) => SOLUTIONS_BY_SLUG[slug])
    .filter(Boolean)
    .map((page) => ({ title: page.name, text: page.summary, to: solutionPath(page.slug) }));
  if (!items.length) return null;
  return (
    <Section title={title}>
      <CardGrid items={items} />
    </Section>
  );
}

export function FaqList({ faqs, title = 'Frequently asked questions' }) {
  if (!faqs || !faqs.length) return null;
  return (
    <Section title={title} alt>
      <div className="mk-faq">
        {faqs.map((faq) => (
          <details key={faq.q} className="mk-faq-item">
            <summary>{faq.q}</summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function CtaBand({ title = 'Ready to see SafeTrack Pro in action?', primary, secondary }) {
  const main = primary || { label: 'Create Free Account', to: '/signup' };
  const alt = secondary || { label: 'Book a Demo', to: '/demo' };
  return (
    <section className="mk-cta">
      <div className="mk-container">
        <h2>{title}</h2>
        <div className="mk-actions mk-actions-center">
          <Link className="mk-btn mk-btn-primary" to={main.to}>
            {main.label}
          </Link>
          <Link className="mk-btn mk-btn-ghost" to={alt.to}>
            {alt.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
