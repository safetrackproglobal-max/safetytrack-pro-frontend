// src/components/Footer/Footer.js
import React from "react";
import { Link } from 'react-router-dom';
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  LinkedinOutlined,
  FacebookOutlined
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
              chemical, healthcare, and education — one platform.
            </p>

            {/* ✅ LaunchIgniter Badge */}
            <div className="footer-launch-badge" style={{ marginBottom: '20px' }}>
              <a 
                href="https://launchigniter.com/product/safetrack-pro-global?ref=badge-safetrack-pro-global" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img 
                  src="https://launchigniter.com/api/badge/safetrack-pro-global?theme=light" 
                  alt="Featured on LaunchIgniter" 
                  width="212" 
                  height="55" 
                  style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                />
              </a>
            </div>

            {/* Social */}
            <div className="footer-social">
              <a href="https://linkedin.com/company/safetrackproglobal" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <LinkedinOutlined />
              </a>
              <a href="https://facebook.com/safetrackproglobal" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookOutlined />
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
              <Link to="/ai-hse-document-generator">AI Document Generator</Link>
              <Link to="/ai-camera-monitoring">AI Camera Monitoring</Link>
              <Link to="/toolbox-talk-generator">AI Toolbox Talks</Link>
              <Link to="/anonymous-safety-reporting">Anonymous Reporting</Link>
              <Link to="/csp-practice-exam">CSP Practice Exam</Link>
              <Link to="/csp-practice-exam/free-test">Free Practice Test</Link>
              <Link to="/free-safety-documents">Free Safety Documents</Link>
              <Link to="/demo">Request a Demo</Link>
            </div>

            <div className="link-group">
              <h4>Solutions</h4>
              <Link to="/hse-project-management-software">HSE Project Management</Link>
              <Link to="/incident-reporting-software">Incident Reporting</Link>
              <Link to="/permit-to-work-software">Permit to Work</Link>
              <Link to="/document-control-software">Document Control</Link>
              <Link to="/compliance-management-software">Compliance Management</Link>
              <Link to="/environmental-monitoring-software">Environmental Monitoring</Link>
              <Link to="/ai-risk-assessment-software">AI Risk Assessment</Link>
              <Link to="/hse-analytics-software">HSE Analytics</Link>
            </div>

            <div className="link-group">
              <h4>Industries</h4>
              <Link to="/industries/construction">Construction</Link>
              <Link to="/industries/oil-and-gas">Oil &amp; Gas</Link>
              <Link to="/industries/manufacturing">Manufacturing</Link>
              <Link to="/industries/mining">Mining</Link>
              <Link to="/industries/aviation">Aviation</Link>
              <Link to="/industries/maritime">Maritime</Link>
              <Link to="/industries/chemical">Chemical</Link>
              <Link to="/industries/healthcare">Healthcare</Link>
              <Link to="/industries/education">Education</Link>
            </div>

            <div className="link-group">
              <h4>How It Works</h4>
              <Link to="/csp-practice-exam/exam-guide">Exam &amp; Certificate Guide</Link>
              <Link to="/ai-camera-monitoring/how-it-works">AI Camera Guide</Link>
              <Link to="/environmental-monitoring-software/how-it-works">Environmental Guide</Link>
              <Link to="/anonymous-safety-reporting/how-it-works">Workplace Voice Guide</Link>
              <Link to="/voice">Report a Concern</Link>
              <Link to="/info/support">Support</Link>
            </div>

            <div className="link-group">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/info/careers">Careers</Link>
              <Link to="/facts">Company Facts</Link>
              <Link to="/trust">Trust Centre</Link>
              <Link to="/info/partners">Partners</Link>
            </div>

            <div className="link-group">
              <h4>Trust &amp; Legal</h4>
              <Link to="/data-use">How We Use Your Data</Link>
              <Link to="/ai-transparency">AI Transparency</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/compliance/osha">OSHA</Link>
              <Link to="/compliance/iso-45001">ISO 45001</Link>
              <Link to="/compliance/iso-14001">ISO 14001</Link>
              <Link to="/compliance/hipaa">HIPAA</Link>
            </div>
          </div>
        </div>

        <ContactBrandInfo />

        {/* BOTTOM SECTION */}
        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} <strong>SafeTrack Pro Global</strong>. All rights reserved.
            <span className="footer-separator">•</span>
            Doha, Qatar
          </p>

          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy</Link>
            <span className="footer-separator">•</span>
            <Link to="/terms">Terms</Link>
            <span className="footer-separator">•</span>
            <Link to="/data-use">Data use</Link>
            <span className="footer-separator">•</span>
            <Link to="/ai-transparency">AI can make mistakes: verify results</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
