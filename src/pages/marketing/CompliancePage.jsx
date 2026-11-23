import React from 'react';
import Seo from '../../components/SEO';
import {
  SITE_URL,
  COMPLIANCE_BY_SLUG,
  INDUSTRIES_BY_SLUG,
  compliancePath,
  industryPath
} from '../../data/marketingPages';
import {
  PageHero,
  Section,
  CardGrid,
  CheckList,
  Chips,
  FaqList,
  CtaBand,
  buildPageJsonLd
} from './shared';

export default function CompliancePage({ slug }) {
  const page = COMPLIANCE_BY_SLUG[slug];
  if (!page) return null;

  const path = compliancePath(slug);
  const breadcrumbs = [
    { name: 'Home', to: '/' },
    { name: 'Compliance', to: '/#compliance' },
    { name: page.code, to: path }
  ];

  const faqs = [
    {
      q: `Is SafeTrack Pro ${page.code} certified?`,
      a: `SafeTrack Pro's workflows are aligned with ${page.code}. Alignment means they are designed around the standard; it does not imply certification or attestation unless stated on our Trust page.`
    },
    {
      q: `How does SafeTrack Pro help with ${page.code}?`,
      a: `${page.supports.map((s) => s.title).join(', ')}.`
    }
  ];

  const industryChips = (page.industries || [])
    .map((s) => INDUSTRIES_BY_SLUG[s])
    .filter(Boolean)
    .map((i) => ({ label: `${i.name} HSE software`, to: industryPath(i.slug) }));

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
          faqs
        })}
      />

      <PageHero
        breadcrumbs={breadcrumbs}
        eyebrow={`${page.code} compliance`}
        h1={page.h1}
        lead={`Pre-built workflows aligned with ${page.code}, so your team can track requirements, records, and deadlines in one platform.`}
      />

      <Section title={`What is ${page.code}?`}>
        <p className="mk-prose">{page.about}</p>
      </Section>

      <Section title={`Key ${page.code} focus areas`} alt>
        <CheckList items={page.keyAreas} />
      </Section>

      <Section title={`How SafeTrack Pro supports ${page.code}`}>
        <CardGrid items={page.supports} />
        <p className="mk-note">
          &ldquo;Aligned with&rdquo; means our workflows and controls are designed around this
          standard. It does not imply certification or attestation unless stated on our{' '}
          <a href="/trust">Trust page</a>. This page is general information, not legal advice.
        </p>
      </Section>

      {industryChips.length > 0 && (
        <Section title="Industries that rely on it" alt>
          <Chips items={industryChips} />
        </Section>
      )}

      <FaqList faqs={faqs} />
      <CtaBand />
    </main>
  );
}
