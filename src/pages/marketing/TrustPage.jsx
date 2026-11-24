import React from 'react';
import Seo from '../../components/SEO';
import { SITE_URL, CONTACT } from '../../data/marketingPages';
import { TRUST_PAGES, CONTROLS, STATUS_ROWS, AI_WARNING, TRUST_META } from '../../data/trustPages';
import { PageHero, Section, CardGrid, CtaBand, buildPageJsonLd } from './shared';
import { DataTable } from './TrustContentPage';

export default function TrustPage() {
  const path = '/trust';
  const breadcrumbs = [{ name: 'Home', to: '/' }, { name: 'Trust centre', to: path }];
  const cards = TRUST_PAGES.map((p) => ({ title: p.nav, text: p.lead, to: p.path, group: p.group }));
  return (
    <div className="mk-page">
      <Seo
        title={TRUST_META.title}
        description={TRUST_META.description}
        canonical={`${SITE_URL}${path}`}
        jsonLd={buildPageJsonLd({ name: TRUST_META.title, description: TRUST_META.description, path, breadcrumbs })}
      />
      <PageHero
        breadcrumbs={breadcrumbs}
        eyebrow="Trust centre"
        h1="Clear answers about your data, AI and security"
        lead="What we do with your information, what AI does with it, what protects it, and what we cannot claim."
        primary={{ label: 'How we use your data', to: '/data-use' }}
        secondary={{ label: 'AI transparency', to: '/ai-transparency' }}
      />
      <div className="mk-container"><p className="mk-warning" role="note">{AI_WARNING}</p></div>
      <Section title="Data, AI and company facts"><CardGrid items={cards.filter((c) => c.group === 'Trust')} /></Section>
      <Section title="How each tool works" alt><CardGrid items={cards.filter((c) => c.group !== 'Trust')} /></Section>
      <Section title="Security measures in the software"><CardGrid items={CONTROLS} /></Section>
      <Section title="What we do not claim" alt intro="We would rather tell you now than have you find out later.">
        <DataTable table={{ head: ['Standard or promise', 'Status'], rows: STATUS_ROWS }} />
      </Section>
      <Section title="Report a security or privacy problem">
        <p className="mk-prose">
          Write to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or call {CONTACT.phone}. Please do not test
          with other people&rsquo;s data.
        </p>
      </Section>
      <CtaBand title="See it before you decide" primary={{ label: 'Create a free account', to: '/signup' }} />
    </div>
  );
}
