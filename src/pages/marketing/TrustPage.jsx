import React from 'react';
import Seo from '../../components/SEO';
import { SITE_URL, CONTACT, TRUST_STATUS, COMPLIANCE_PAGES, compliancePath } from '../../data/marketingPages';
import { PageHero, Section, CardGrid, Chips, CtaBand, buildPageJsonLd } from './shared';

const TITLE = 'Trust & Security | SafeTrack Pro Global';
const DESCRIPTION =
  'How SafeTrack Pro Global protects your safety data: role-based access, encryption, and audit trails, with security controls aligned with ISO 27001 and SOC 2.';

const CONTROLS = [
  {
    title: 'Role-based access control',
    text: 'Give each person access to the sites, modules, and records their role requires.'
  },
  {
    title: 'Complete audit trails',
    text: 'Every module keeps a record of who did what and when, ready for audits.'
  },
  {
    title: 'Encryption',
    text: 'Your safety data is protected with encryption.'
  },
  {
    title: 'Aligned with ISO 27001 and SOC 2',
    text: 'Our security controls are aligned with ISO 27001 and SOC 2. See the status table below for any certifications or attestations we hold.'
  }
];

export default function TrustPage() {
  const path = '/trust';
  const breadcrumbs = [
    { name: 'Home', to: '/' },
    { name: 'Trust & Security', to: path }
  ];

  return (
    <main className="mk-page">
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        canonical={`${SITE_URL}${path}`}
        jsonLd={buildPageJsonLd({ name: TITLE, description: DESCRIPTION, path, breadcrumbs })}
      />

      <PageHero
        breadcrumbs={breadcrumbs}
        eyebrow="Trust & Security"
        h1="Trust and Security at SafeTrack Pro Global"
        lead="Safety records are sensitive. Here is how we protect them: access control, encryption, and audit trails, with security controls aligned with ISO 27001 and SOC 2."
      />

      <Section title="Security controls">
        <CardGrid items={CONTROLS} />
      </Section>

      <Section title="Certification and attestation status" alt>
        {TRUST_STATUS.length > 0 ? (
          <div className="mk-table-wrap">
            <table className="mk-table">
              <thead>
                <tr>
                  <th>Standard</th>
                  <th>Status</th>
                  <th>Scope</th>
                  <th>Issued by</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {TRUST_STATUS.map((row) => (
                  <tr key={row.standard}>
                    <td>{row.standard}</td>
                    <td>{row.status}</td>
                    <td>{row.scope}</td>
                    <td>{row.issuer}</td>
                    <td>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mk-prose">
            &ldquo;Aligned with&rdquo; means our workflows and controls are designed around a
            standard. It does not imply certification or attestation. For our current security
            documentation and questionnaires, contact{' '}
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
          </p>
        )}
      </Section>

      <Section title="Regulatory framework guides">
        <Chips
          items={COMPLIANCE_PAGES.map((c) => ({
            label: `${c.code} compliance`,
            to: compliancePath(c.slug)
          }))}
        />
      </Section>

      <Section title="Security questions" alt>
        <p className="mk-prose">
          Send security or procurement questions to{' '}
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or call {CONTACT.phone}. We are
          based in {CONTACT.location}.
        </p>
      </Section>

      <CtaBand />
    </main>
  );
}
