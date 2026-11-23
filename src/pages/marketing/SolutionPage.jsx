import React from 'react';
import Seo from '../../components/SEO';
import {
  SITE_URL,
  SOLUTIONS_BY_SLUG,
  INDUSTRIES_BY_SLUG,
  COMPLIANCE_PAGES,
  solutionPath,
  industryPath,
  compliancePath
} from '../../data/marketingPages';
import {
  PageHero,
  Section,
  CardGrid,
  CheckList,
  Steps,
  Chips,
  RelatedSolutions,
  FaqList,
  CtaBand,
  buildPageJsonLd
} from './shared';

export default function SolutionPage({ slug }) {
  const page = SOLUTIONS_BY_SLUG[slug];
  if (!page) return null;

  const path = solutionPath(slug);
  const breadcrumbs = [
    { name: 'Home', to: '/' },
    { name: 'Solutions', to: '/#features' },
    { name: page.name, to: path }
  ];

  const industryChips = (page.industries || [])
    .map((s) => INDUSTRIES_BY_SLUG[s])
    .filter(Boolean)
    .map((i) => ({ label: `${i.name} HSE software`, to: industryPath(i.slug) }));

  const frameworkChips = page.showFrameworks
    ? COMPLIANCE_PAGES.map((c) => ({ label: `${c.code} compliance`, to: compliancePath(c.slug) }))
    : [];

  return (
    <main className="mk-page">
      <Seo
        title={page.title}
        description={page.description}
        canonical={`${SITE_URL}${path}`}
        jsonLd={buildPageJsonLd({
          name: page.title,
          description: page.description,
          path,
          breadcrumbs,
          faqs: page.faqs
        })}
      />

      <PageHero
        breadcrumbs={breadcrumbs}
        eyebrow={page.name}
        h1={page.h1}
        lead={page.lead}
        primary={page.cta}
      />

      <Section title={`Why teams choose ${page.name}`}>
        <CardGrid items={page.benefits} />
      </Section>

      <Section title={`${page.name} capabilities`} alt>
        <CheckList items={page.capabilities} />
      </Section>

      {page.steps && page.steps.length > 0 && (
        <Section title="How it works">
          <Steps steps={page.steps} />
        </Section>
      )}

      {industryChips.length > 0 && (
        <Section title="Used across industries">
          <Chips items={industryChips} />
        </Section>
      )}

      {frameworkChips.length > 0 && (
        <Section title="Framework guides" alt>
          <Chips items={frameworkChips} />
        </Section>
      )}

      {page.note && (
        <section className="mk-section">
          <div className="mk-container">
            <p className="mk-note">{page.note}</p>
          </div>
        </section>
      )}

      <RelatedSolutions slugs={page.related || []} />
      <FaqList faqs={page.faqs} />
      <CtaBand primary={page.cta} />
    </main>
  );
}
