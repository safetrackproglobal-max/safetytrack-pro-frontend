import React, { useState } from 'react';
import Seo from '../../components/SEO';
import { SITE_URL, CONTACT, INDUSTRIES } from '../../data/marketingPages';
import { Breadcrumbs, buildPageJsonLd } from './shared';

const TITLE = 'Book a Demo | SafeTrack Pro Global';
const DESCRIPTION =
  'Book a demo of SafeTrack Pro Global: AI camera monitoring, incident reporting, permit to work, document control, and compliance tracking for your team.';

/**
 * No backend is assumed here: submitting opens the visitor's email app with the
 * request pre-filled. To post to your own API instead, replace handleSubmit.
 */
export default function DemoPage() {
  const path = '/demo';
  const breadcrumbs = [
    { name: 'Home', to: '/' },
    { name: 'Book a Demo', to: path }
  ];

  const [form, setForm] = useState({ name: '', email: '', company: '', industry: '', message: '' });
  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = `Demo request: ${form.company || form.name}`;
    const body = [
      `Name: ${form.name}`,
      `Work email: ${form.email}`,
      `Company: ${form.company}`,
      `Industry: ${form.industry || 'Not specified'}`,
      '',
      form.message
    ].join('\n');
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="mk-page">
      <Seo
        title={TITLE}
        description={DESCRIPTION}
        canonical={`${SITE_URL}${path}`}
        jsonLd={buildPageJsonLd({ name: TITLE, description: DESCRIPTION, path, breadcrumbs })}
      />

      <section className="mk-hero">
        <div className="mk-container">
          <Breadcrumbs items={breadcrumbs} />
          <span className="mk-eyebrow">Demo</span>
          <h1>Book a Demo of SafeTrack Pro Global</h1>
          <p className="mk-lead">
            Tell us about your operation and we will show you how AI camera monitoring, incident
            reporting, permit to work, and document control work together.
          </p>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-container mk-two-col">
          <form className="mk-form" onSubmit={handleSubmit}>
            <label>
              Full name
              <input type="text" required value={form.name} onChange={update('name')} autoComplete="name" />
            </label>
            <label>
              Work email
              <input type="email" required value={form.email} onChange={update('email')} autoComplete="email" />
            </label>
            <label>
              Company
              <input type="text" required value={form.company} onChange={update('company')} autoComplete="organization" />
            </label>
            <label>
              Industry
              <select value={form.industry} onChange={update('industry')}>
                <option value="">Select an industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry.slug} value={industry.name}>
                    {industry.name}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </label>
            <label>
              What would you like to see?
              <textarea rows={4} value={form.message} onChange={update('message')} />
            </label>
            <button type="submit" className="mk-btn mk-btn-primary">
              Request demo by email
            </button>
            <p className="mk-note">This opens your email app with your request filled in.</p>
          </form>

          <aside className="mk-card mk-aside">
            <h2>Prefer to talk?</h2>
            <p>
              Email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </p>
            <p>
              Call <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a>
            </p>
            <p>Based in {CONTACT.location}</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
