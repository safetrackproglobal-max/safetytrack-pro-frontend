// src/components/Footer/Footer.js
import React from "react";
import { Link } from 'react-router-dom';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import ContactBrandInfo from "./ContactBrandInfo";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="footer main-footer">
      <div className="container">
        {/* ============================================
             TOP SECTION - BRAND + CONTACT
             ============================================ */}
        <div className="footer-top">
          {/* Brand Column */}
          <div className="footer-brand-column">
            <Link to="/" className="footer-logo-link">
              <div className="footer-logo">
                <span className="footer-logo-symbol">STP</span>
                <div className="footer-logo-text">
                  <span className="footer-logo-main">SafeTrack</span>
                  <span className="footer-logo-highlight">Pro</span>
                  <span className="footer-logo-sub">GLOBAL</span>
                </div>
              </div>
            </Link>

            <p className="footer-brand-description">
              AI-powered HSE and safety management platform for healthcare, oil & gas,
              construction, manufacturing, maritime, aviation, mining, chemical, and
              education — trusted across 9+ industries.
            </p>

            {/* Trust badges */}
            <div className="footer-trust-badges">
              <span className="footer-trust-badge">
                <SafetyCertificateOutlined /> ISO 27001
              </span>
              <span className="footer-trust-badge">
                <CheckCircleOutlined /> SOC2 Compliant
              </span>
            </div>

            {/* Social */}
            <div className="footer-social">
              <a
                href="https://twitter.com/safetrackproglobal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <TwitterOutlined />
              </a>
              <a
                href="https://linkedin.com/company/safetrackproglobal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedinOutlined />
              </a>
              <a
                href="https://facebook.com/safetrackproglobal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FacebookOutlined />
              </a>
              <a
                href="https://youtube.com/@safetrackproglobal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <YoutubeOutlined />
              </a>
            </div>
          </div>

          {/* Contact Column */}
          <div className="footer-contact-column">
            <h4 className="footer-heading">Contact Us</h4>

            <ul className="footer-contact-list">
              <li>
                <a href="mailto:info@safetrackproglobal.com" className="footer-contact-item">
                  <span className="contact-icon"><MailOutlined /></span>
                  <span className="contact-text">
                    <span className="contact-label">Email</span>
                    <span className="contact-value">info@safetrackproglobal.com</span>
                  </span>
                </a>
              </li>

              <li>
                <a href="tel:+97433251705" className="footer-contact-item">
                  <span className="contact-icon"><PhoneOutlined /></span>
                  <span className="contact-text">
                    <span className="contact-label">Phone</span>
                    <span className="contact-value">+974 3325 1705</span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  href="https://maps.google.com/?q=Doha,Qatar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-item"
                >
                  <span className="contact-icon"><EnvironmentOutlined /></span>
                  <span className="contact-text">
                    <span className="contact-label">Headquarters</span>
                    <span className="contact-value">Doha, Qatar</span>
                  </span>
                </a>
              </li>

              <li>
                <Link to="/contact" className="footer-contact-item">
                  <span className="contact-icon"><GlobalOutlined /></span>
                  <span className="contact-text">
                    <span className="contact-label">Enterprise Sales</span>
                    <span className="contact-value">Contact our team →</span>
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Columns */}
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/subscription">Subscription</Link>
              <Link to="/demo">Request Demo</Link>
              <Link to="/ai-documents">AI Documents</Link>
            </div>

            <div className="link-group">
              <h4>Industries</h4>
              <Link to="/industries/healthcare">Healthcare</Link>
              <Link to="/industries/oil-gas">Oil & Gas</Link>
              <Link to="/industries/construction">Construction</Link>
              <Link to="/industries/manufacturing">Manufacturing</Link>
              <Link to="/industries/maritime">Maritime</Link>
            </div>

            <div className="link-group">
              <h4>Resources</h4>
              <Link to="/documentation">Documentation</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/support">Support</Link>
              <Link to="/api-docs">API Docs</Link>
              <Link to="/guides">Guides</Link>
            </div>

            <div className="link-group">
              <h4>Company</h4>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/security">Security</Link>
              <Link to="/partners">Partners</Link>
            </div>

            <div className="link-group">
              <h4>Legal</h4>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/cookies">Cookie Policy</Link>
              <Link to="/compliance">Compliance</Link>
              <Link to="/sla">SLA</Link>
            </div>
          </div>
        </div>

        {/* ============================================
             LEGACY CONTACT BRAND INFO (if still used)
             ============================================ */}
        <ContactBrandInfo />

        {/* ============================================
             BOTTOM SECTION
             ============================================ */}
        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} <strong>Abigalistic Studios</strong>. All rights reserved.
            <span className="footer-separator">•</span>
            SafeTrack Pro Global™
          </p>

          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span className="footer-separator">•</span>
            <Link to="/terms">Terms of Service</Link>
            <span className="footer-separator">•</span>
            <Link to="/cookies">Cookie Policy</Link>
            <span className="footer-separator">•</span>
            <Link to="/sla">SLA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
