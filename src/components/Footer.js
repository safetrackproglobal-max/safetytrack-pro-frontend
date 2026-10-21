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

// ✅ Import the real logo
import logoImage from '../assets/images/safetrack-logo.jpeg';
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="footer main-footer">
      <div className="container">
        
        {/* TOP SECTION */}
        <div className="footer-top">
          
          {/* Brand Column */}
          <div className="footer-brand-column">
            <Link to="/" className="footer-logo-link">
              <div className="footer-logo">
                {/* ✅ Replaced the text block with the actual logo image */}
                <img 
                  src={logoImage} 
                  alt="SafeTrack Pro Global" 
                  className="footer-logo-image" 
                />
                <div className="footer-logo-text">
                  <span className="footer-logo-main">SafeTrack</span>
                  <span className="footer-logo-highlight">Pro</span>
                  <span className="footer-logo-sub">GLOBAL</span>
                </div>
              </div>
            </Link>

            <p className="footer-brand-description">
              AI-powered HSE, environmental, and compliance platform for
              construction, oil &amp; gas, manufacturing, mining, maritime, aviation,
              chemical, agriculture, healthcare, and education — one platform,
              trusted worldwide.
            </p>

            {/* Trust badges */}
            <div className="footer-trust-badges">
              <span className="footer-trust-badge">
                <SafetyCertificateOutlined /> ISO 27001 Ready
              </span>
              <span className="footer-trust-badge">
                <CheckCircleOutlined /> SOC2 Practices
              </span>
            </div>

            {/* Social */}
            <div className="footer-social">
              <a href="https://twitter.com/safetrackproglobal" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <TwitterOutlined />
              </a>
              <a href="https://linkedin.com/company/safetrackproglobal" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <LinkedinOutlined />
              </a>
              <a href="https://facebook.com/safetrackproglobal" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookOutlined />
              </a>
              <a href="https://youtube.com/@safetrackproglobal" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <YoutubeOutlined />
              </a>
            </div>
          </div>

          {/* Contact Column */}
          <div className="footer-contact-column">
            <h4 className="footer-heading">Contact</h4>
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
                <a href="https://maps.google.com/?q=Doha,Qatar" target="_blank" rel="noopener noreferrer" className="footer-contact-item">
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
                    <span className="contact-value">Talk to our team →</span>
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
              <Link to="/ai-documents">AI Document Generator</Link>
              <Link to="/camera-monitoring">AI Camera Monitoring</Link>
              <Link to="/info/demo">Request a Demo</Link>
            </div>

            <div className="link-group">
              <h4>Industries</h4>
              <Link to="/hse/construction">Construction</Link>
              <Link to="/hse/oil_gas">Oil &amp; Gas</Link>
              <Link to="/hse/manufacturing">Manufacturing</Link>
              <Link to="/hse/mining">Mining</Link>
              <Link to="/hse/aviation">Aviation</Link>
              <Link to="/hse/maritime">Maritime</Link>
              <Link to="/hse/chemical">Chemical</Link>
              <Link to="/hse/healthcare">Healthcare</Link>
              <Link to="/hse/general">General Industry</Link>
            </div>

            <div className="link-group">
              <h4>Resources</h4>
              <Link to="/info/documentation">Documentation</Link>
              <Link to="/info/guides">Guides</Link>
              <Link to="/info/blog">Blog</Link>
              <Link to="/info/api-docs">API Docs</Link>
              <Link to="/info/support">Support</Link>
            </div>

            <div className="link-group">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/info/careers">Careers</Link>
              <Link to="/info/security">Security</Link>
              <Link to="/info/partners">Partners</Link>
            </div>

            <div className="link-group">
              <h4>Legal</h4>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/info/cookies">Cookie Policy</Link>
              <Link to="/info/compliance">Compliance</Link>
              <Link to="/info/sla">SLA</Link>
            </div>
          </div>
        </div>

        <ContactBrandInfo />

        {/* BOTTOM SECTION */}
        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} <strong>AfdalTech Solutions</strong>. All rights reserved.
            <span className="footer-separator">•</span>
            SafeTrack Pro Global™
            <span className="footer-separator">•</span>
            Headquartered in Doha, Qatar
          </p>

          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy</Link>
            <span className="footer-separator">•</span>
            <Link to="/terms">Terms</Link>
            <span className="footer-separator">•</span>
            <Link to="/info/cookies">Cookies</Link>
            <span className="footer-separator">•</span>
            <Link to="/info/sla">SLA</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
