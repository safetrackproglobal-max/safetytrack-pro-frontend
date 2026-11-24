// src/components/Footer/TermsPolicy.js
import React from 'react';
import { Link } from 'react-router-dom';
import {
  SafetyCertificateOutlined,
  FileProtectOutlined,
  LockOutlined,
  GlobalOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import './TermsPolicy.css';

export default function TermsPolicy() {
  const lastUpdated = 'November 24, 2026';
  const companyName = 'SafeTrack Pro Global';
  const productName = 'SafeTrack Pro Global';
  const contactEmail = 'info@safetrackproglobal.com';
  const contactPhone = '+974 3325 1705';

  return (
    <section className="terms-section" aria-labelledby="terms-heading">
      {/* ============================================
           PAGE HEADER
           ============================================ */}
      <header className="terms-page-header">
        <div className="terms-header-icon">
          <FileProtectOutlined />
        </div>
        <h1 id="terms-heading" className="terms-page-title">
          Terms &amp; Conditions
        </h1>
        <p className="terms-page-subtitle">
          Legal terms governing your use of {productName}
        </p>
        <div className="terms-meta">
          <span className="terms-meta-item">
            <CheckCircleOutlined /> Last Updated: {lastUpdated}
          </span>
        </div>
      </header>

      {/* ============================================
           QUICK NAVIGATION
           ============================================ */}
      <nav className="terms-nav" aria-label="Terms navigation">
        <a href="#acceptance">1. Acceptance</a>
        <a href="#service">2. Service</a>
        <a href="#responsibilities">3. Responsibilities</a>
        <a href="#ip">4. IP Rights</a>
        <a href="#liability">5. Liability</a>
        <a href="#privacy">6. Privacy</a>
        <a href="#modifications">7. Modifications</a>
        <a href="#law">8. Governing Law</a>
      </nav>

      {/* ============================================
           TERMS AND CONDITIONS
           ============================================ */}
      <div className="terms-content">
        {/* Section 1 */}
        <article id="acceptance" className="terms-article">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using <strong>{productName}</strong> (the "Service", "we," "us," or "our"), you agree to be bound by
            these Terms and Conditions ("Terms"). If you do not agree to all of these Terms,
            you must not access or use the Service.
          </p>
          <p>
            These Terms apply to all visitors, users, and others who access or use the Service,
            including organizations, their employees, contractors, and authorized agents.
          </p>
        </article>

        {/* Section 2 */}
        <article id="service" className="terms-article">
          <h2>2. Service Description</h2>
          <p>
            {productName} is an AI-powered HSE (Health, Safety, and Environment) software
            platform that provides:
          </p>
          <ul className="terms-list">
            <li>AI-powered risk assessment and predictive analytics</li>
            <li>Real-time safety dashboards and compliance monitoring</li>
            <li>Incident reporting with instant analysis and severity scoring</li>
            <li>Complete document lifecycle management (create, modify, submit, sign, download, archive)</li>
            <li>AI camera monitoring with PPE detection and hazard identification</li>
            <li>Live environmental monitoring (air, water, emissions, carbon footprint)</li>
            <li>Permit to Work (PTW) system with audit trails</li>
            <li>Practice exams and training and certification tracking</li>
          </ul>
          <p className="terms-note">
            <WarningOutlined /> <strong>Professional Review Required:</strong> All
            AI-generated content, risk assessments, and automated reports should be reviewed
            by qualified safety professionals before being relied upon for compliance,
            regulatory, or operational decisions.
          </p>
        </article>

        {/* Section 3 */}
        <article id="responsibilities" className="terms-article">
          <h2>3. User Responsibilities</h2>
          <p>As a user of {productName}, you agree to:</p>
          <ul className="terms-list">
            <li>
              <strong>Verify accuracy:</strong> Review and verify the accuracy, completeness,
              and suitability of all generated documents before use
            </li>
            <li>
              <strong>Ensure compliance:</strong> Confirm that your use of the Service and any
              generated documents complies with applicable laws, regulations, and industry
              standards
            </li>
            <li>
              <strong>Provide accurate information:</strong> Submit accurate, truthful, and
              complete information for document generation and incident reporting
            </li>
            <li>
              <strong>Maintain security:</strong> Keep your account credentials confidential
              and notify us immediately of any unauthorized access
            </li>
            <li>
              <strong>Authorized use:</strong> Use the Service only for lawful purposes and in
              accordance with these Terms
            </li>
            <li>
              <strong>Data accuracy:</strong> Ensure that any data you input (employee records,
              incident details, environmental readings) is accurate and lawfully obtained
            </li>
          </ul>
        </article>

        {/* Section 4 */}
        <article id="ip" className="terms-article">
          <h2>4. Intellectual Property Rights</h2>
          <p>
            <strong>Your Content:</strong> You retain all rights, title, and interest in the
            data, documents, and information you provide or generate through the Service. You
            are solely responsible for ensuring you have the rights to any content you upload.
          </p>
          <p>
            <strong>Our Technology:</strong> {companyName} retains all rights, title, and
            interest in the Service itself, including but not limited to:
          </p>
          <ul className="terms-list">
            <li>The SafeTrack Pro platform, software, and source code</li>
            <li>AI algorithms, machine learning models, and predictive analytics</li>
            <li>Document templates, forms, and compliance frameworks</li>
            <li>Trademarks, logos, and brand assets</li>
            <li>User interface designs and dashboards</li>
          </ul>
          <p>
            No license to use our intellectual property is granted except as expressly
            permitted in these Terms.
          </p>
        </article>

        {/* Section 5 */}
        <article id="liability" className="terms-article">
          <h2>5. Limitations of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, {companyName} shall not be
            liable for any direct, indirect, incidental, special, consequential, or punitive
            damages, including but not limited to:
          </p>
          <ul className="terms-list">
            <li>Loss of profits, revenue, or business opportunities</li>
            <li>Loss of data, information, or goodwill</li>
            <li>Regulatory fines or penalties resulting from user actions</li>
            <li>Workplace incidents occurring despite use of the Service</li>
            <li>Errors or omissions in AI-generated content</li>
          </ul>
          <p>
            The Service is provided <strong>"AS IS"</strong> and{' '}
            <strong>"AS AVAILABLE"</strong> without warranties of any kind, whether express,
            implied, or statutory, including warranties of merchantability, fitness for a
            particular purpose, or non-infringement.
          </p>
          <p className="terms-note">
            <WarningOutlined /> <strong>Safety Disclaimer:</strong> SafeTrack Pro is a
            software tool designed to assist safety professionals. It does not replace
            professional judgment, on-site inspections, or regulatory compliance obligations.
            Users remain fully responsible for workplace safety outcomes.
          </p>
        </article>

        {/* Section 6 */}
        <article id="privacy" className="terms-article">
          <h2>6. Data Privacy &amp; Security</h2>
          <p>
            We take data privacy and security seriously. Our handling of your data is
            governed by the following principles:
          </p>
          <ul className="terms-list">
            <li>
              <strong>Encryption:</strong> Connections to the Service use HTTPS
            </li>
            <li>
              <strong>Certifications:</strong> We do not hold ISO 27001, SOC 2 or HIPAA
              certification. See the <Link to="/trust">Trust centre</Link>
            </li>
            <li>
              <strong>Access control:</strong> Role-based access ensures only authorized users
              can view sensitive data
            </li>
            <li>
              <strong>Providers:</strong> We do not sell your data. Providers that process it for
              us, including AI providers, are listed on the <Link to="/data-use">data use page</Link>
            </li>
            <li>
              <strong>Data retention:</strong> Data is kept while the account is active and
              deleted on request, unless the law requires us to keep it
            </li>
            <li>
              <strong>Your rights:</strong> You may request access, correction, or deletion of
              your data at any time
            </li>
            <li>
              <strong>AI and media:</strong> Before you first use AI, a camera or file upload we
              show a notice for you to accept. AI can make mistakes: verify every result
              independently. See <Link to="/ai-transparency">AI transparency</Link>
            </li>
          </ul>
          <p>
            For full details, please review our{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </article>

        {/* Section 7 */}
        <article id="modifications" className="terms-article">
          <h2>7. Modifications to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. Material
            changes will be communicated via:
          </p>
          <ul className="terms-list">
            <li>Email notification to registered users</li>
            <li>In-app notification upon next login</li>
            <li>Update of the "Last Updated" date at the top of this page</li>
          </ul>
          <p>
            Your continued use of the Service after any modifications constitutes acceptance
            of the revised Terms. If you do not agree to the changes, you must stop using
            the Service.
          </p>
        </article>

        {/* Section 8 */}
        <article id="law" className="terms-article">
          <h2>8. Governing Law &amp; Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of{' '}
            <strong>Qatar</strong>, without regard to its conflict of law provisions.
          </p>
          <p>
            Any dispute arising from or relating to these Terms or the Service shall be
            subject to the exclusive jurisdiction of the courts of <strong>Doha, Qatar</strong>.
          </p>
          <p>
            Before initiating formal legal proceedings, both parties agree to attempt to
            resolve any dispute through good-faith negotiation for a period of at least
            thirty (30) days.
          </p>
        </article>

        {/* Section 9 - Contact */}
        <article className="terms-article">
          <h2>9. Contact Information</h2>
          <p>
            For questions about these Terms and Conditions, please contact us:
          </p>
          <div className="terms-contact-grid">
            <a href={`mailto:${contactEmail}`} className="terms-contact-item">
              <MailOutlined />
              <div>
                <span className="contact-label">Email</span>
                <span className="contact-value">{contactEmail}</span>
              </div>
            </a>
            <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="terms-contact-item">
              <PhoneOutlined />
              <div>
                <span className="contact-label">Phone</span>
                <span className="contact-value">{contactPhone}</span>
              </div>
            </a>
            <div className="terms-contact-item">
              <EnvironmentOutlined />
              <div>
                <span className="contact-label">Headquarters</span>
                <span className="contact-value">Doha, Qatar</span>
              </div>
            </div>
            <div className="terms-contact-item">
              <GlobalOutlined />
              <div>
                <span className="contact-label">Company</span>
                <span className="contact-value">{companyName}</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* ============================================
           PRIVACY POLICY SUMMARY
           ============================================ */}
      <div className="privacy-section">
        <div className="privacy-header">
          <div className="privacy-header-icon">
            <LockOutlined />
          </div>
          <h2>Privacy Policy Summary</h2>
          <p className="privacy-subtitle">
            How we protect and handle your data at {productName}
          </p>
        </div>

        <div className="privacy-content">
          <p>
            Your privacy is fundamental to how we operate {productName}. We are committed to
            protecting your personal and organizational data and to saying clearly how it is used.
          </p>

          <div className="privacy-highlights">
            <div className="privacy-highlight">
              <div className="privacy-icon"><LockOutlined /></div>
              <h3>Encrypted Connections</h3>
              <p>The site and app use HTTPS. Passwords are stored as hashes</p>
            </div>
            <div className="privacy-highlight">
              <div className="privacy-icon"><UserOutlined /></div>
              <h3>Access Control</h3>
              <p>Role-based permissions ensure only authorized users see sensitive data</p>
            </div>
            <div className="privacy-highlight">
              <div className="privacy-icon"><SafetyCertificateOutlined /></div>
              <h3>Honest Status</h3>
              <p>No security certification is held today. The Trust centre lists what protects your data</p>
            </div>
            <div className="privacy-highlight">
              <div className="privacy-icon"><CheckCircleOutlined /></div>
              <h3>No Data Selling</h3>
              <p>We never sell your data or share it with third parties for marketing</p>
            </div>
          </div>

          <p className="privacy-footer">
            For detailed information about how we collect, use, and protect your data, please
            read our full <Link to="/privacy">Privacy Policy</Link> or contact us at{' '}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
        </div>
      </div>

      {/* ============================================
           FOOTER NOTE
           ============================================ */}
      <div className="terms-footer-note">
        <p>
          By using {productName}, you acknowledge that you have read, understood, and agree
          to be bound by these Terms and Conditions.
        </p>
        <p className="terms-copyright">
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </p>
      </div>
    </section>
  );
}
