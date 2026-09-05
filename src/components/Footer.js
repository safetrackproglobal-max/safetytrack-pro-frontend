// src/components/Footer/Footer.js
import React from "react";
import { Link } from 'react-router-dom';
import ContactBrandInfo from "./ContactBrandInfo";
import "./Footer.css";

function Footer() {
  return (
    <footer role="contentinfo" className="footer main-footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h3>About Abigalistic Studios</h3>
          <p>Comprehensive safety management solution for high-risk industries. Streamline documentation, risk assessments, and incident tracking.</p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/subscription">Subscription</Link>
            <Link to="/demo">Demo</Link>
          </div>
          
          <div className="link-group">
            <h4>Resources</h4>
            <Link to="/documentation">Documentation</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/support">Support</Link>
            <Link to="/api-docs">API</Link>
          </div>
          
          <div className="link-group">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
          
          <div className="link-group">
            <h4>Legal</h4>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookies">Cookie Policy</Link>
            <Link to="/compliance">Compliance</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <p><Link to="/dashboard">Dashboard</Link></p>
          <p><Link to="/ai-documents">AI Documents</Link></p>
          <p><Link to="/features">Features</Link></p>
          <p><Link to="/pricing">Pricing</Link></p>
        </div>
        
        <ContactBrandInfo />
      </div>
      
      <div className="footer-bottom">
        <p>
          &copy; 2024 Abigalistic Studios. All rights reserved. | 
          <Link to="/privacy">Privacy Policy</Link> | 
          <Link to="/terms">Terms of Service</Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;