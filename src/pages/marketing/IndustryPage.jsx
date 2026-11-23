import React from 'react';
import Seo from '../../components/SEO';
import {
  SITE_URL,
  INDUSTRIES_BY_SLUG,
  COMPLIANCE_BY_SLUG,
  industryPath,
  compliancePath
} from '../../data/marketingPages';
import {
  PageHero,
  Section,
  CardGrid,
  CheckList,
  Chips,
  RelatedSolutions,
  FaqList,
  CtaBand,
  buildPageJsonLd
} from './shared';

export default function IndustryPage({ slug }) {
  const page = INDUSTRIES_BY_SLUG[slug];
  if (!page) return null;

  const path = industryPath(slug);
  const h1 = `${page.name} HSE Software`;
  const breadcrumbs = [
    { name: 'Home', to: '/' },
    { name: 'Industries', to: '/#industries' },
    { name: page.name, to: path }
  ];

  // FAQs are generated from the page data so they always match the visible content.
  const faqs = [
    {
      q: `What does SafeTrack Pro include for ${page.name.toLowerCase()}?`,
      a: `For ${page.name.toLowerCase()}, SafeTrack Pro supports ${page.tags
        .join(', ')
        .toLowerCase()}, along with incident reporting, document control, and compliance tracking in one platform.`
    },
    {
      q: `Which standards does SafeTrack Pro align with for ${page.name.toLowerCase()}?`,
      a: `${page.highlights[0]}. Alignment means our workflows are designed around the standard; it does not imply certification or attestation unless stated on our Trust page.`
    }
  ];

  const standardGuides = (page.compliance || [])
    .map((s) => COMPLIANCE_BY_SLUG[s])
    .filter(Boolean)
    .map((c) => ({ label: `${c.code} compliance guide`, to: compliancePath(c.slug) }));

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

      <PageHero breadcrumbs={breadcrumbs} eyebrow="Industry solutions" h1={h1} lead={page.lead} />

      <Section title={`Built for ${page.name.toLowerCase()} teams`}>
        <CardGrid items={page.tags.map((tag) => ({ title: tag, text: '' }))} />
      </Section>

      <Section title="Standards alignment and highlights" alt>
        <CheckList items={page.highlights} />
        {standardGuides.length > 0 && <Chips items={standardGuides} />}
        <p className="mk-note">
          &ldquo;Aligned with&rdquo; means our workflows and controls are designed around these
          standards. It does not imply certification or attestation unless stated on our Trust page.
        </p>
      </Section>

      <RelatedSolutions slugs={page.modules} title={`Modules for ${page.name.toLowerCase()}`} />
      <FaqList faqs={faqs} />
      <CtaBand />
    </main>
  );
}
