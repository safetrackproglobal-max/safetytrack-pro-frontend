// src/pages/About.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RocketOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  RobotOutlined,
  BulbOutlined,
  SmileOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CrownOutlined,
  ToolOutlined,
  FireOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  DatabaseOutlined,
  CloudOutlined,
  BuildOutlined,
  CarOutlined,
  ReadOutlined,
  StarOutlined
} from '@ant-design/icons';
import './About.css';

// ============================================================
// AFDALTECH SOLUTIONS / SAFETRACK PRO GLOBAL
// About Us Page — International Edition
// No external animation library required
// ============================================================

const COMPANY = {
  name: 'SafeTrack Pro Global',
  parent: 'AfdalTech Solutions',
  tagline: 'The Future of Technology',
  email: 'info@safetrackproglobal.com',
  phone: '+974 3325 1705',
  address: 'Doha, Qatar',
  region: 'Global Operations',
  website: 'www.safetrackproglobal.com',
};

// Simple hook: adds .is-visible class to elements with .reveal class
// when they scroll into view.
const useScrollReveal = () => {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

const About = () => {
  useScrollReveal();

  return (
    <div className="about-page">
      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="about-hero">
        <div className="about-container about-hero-inner">
          <div className="about-hero-badge">
            <StarOutlined style={{ color: '#C9A84C' }} /> About Us
          </div>

          <h1 className="about-hero-title">
            One Platform for<br />Global HSE Excellence
          </h1>

          <p className="about-hero-subtitle">
            We are {COMPANY.parent} — creators of {COMPANY.name}, an AI-powered
            HSE, environmental, and compliance platform serving{' '}
            <strong>9+ industries</strong> across{' '}
            <strong>Qatar, the Middle East, Africa, and beyond</strong>.
          </p>
        </div>
      </section>

      {/* ============================================================
          OUR STORY
      ============================================================ */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-story-grid">
            <div className="reveal">
              <h2 className="about-h2">Our Story</h2>
              <p className="about-paragraph">
                SafeTrack Pro was born from a simple observation: <strong>HSE professionals,
                safety officers, and compliance teams across every industry were drowning in
                spreadsheets</strong>, manual reports, and disconnected tools that could not
                keep up with modern regulatory demands.
              </p>
              <p className="about-paragraph">
                We saw incidents go unanalyzed, permits expire unnoticed, compliance gaps slip
                through the cracks, and environmental metrics tracked by hand. Meanwhile, safety
                teams in <strong>construction, oil &amp; gas, manufacturing, mining, healthcare,
                aviation, maritime, agriculture, and education</strong> all deserved intelligent
                tools designed for their industries — not generic templates.
              </p>
              <p className="about-paragraph">
                So we built it. SafeTrack Pro is a complete platform that combines{' '}
                <strong>AI-powered risk analysis, real-time camera monitoring, compliance
                automation, document lifecycle control, and environmental intelligence</strong>{' '}
                into one seamless experience — configurable for any industry.
              </p>
            </div>

            <div className="about-mission-card reveal">
              <div className="about-mission-emoji">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To empower every HSE professional, safety officer, and compliance team —
                in every industry, in every region — with technology that saves lives,
                ensures compliance, and protects the environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          WHAT WE DO
      ============================================================ */}
      <section className="about-section about-section-alt">
        <div className="about-container">
          <div className="about-section-header reveal">
            <h2 className="about-h2">What We Do</h2>
            <p className="about-section-desc">
              Four core modules, one intelligent platform — built for every industry
            </p>
          </div>

          <div className="about-cards-grid">
            {[
              {
                icon: <SafetyCertificateOutlined />,
                title: 'HSE Management',
                desc: 'Incident reporting, root cause analysis with AI-powered Fishbone diagrams, permit-to-work systems, safety observations, and predictive risk assessment — configurable for every industry.'
              },
              {
                icon: <GlobalOutlined />,
                title: 'Environmental Intelligence',
                desc: 'Real-time air, water, and emissions monitoring, carbon footprint tracking, ESG scoring, biodiversity monitoring, and sustainability goal management.'
              },
              {
                icon: <ReadOutlined />,
                title: 'Compliance & Documentation',
                desc: 'AI-generated SOPs, JHAs, and permits. Automated regulatory tracking across OSHA, ISO 45001, ISO 14001, EPA, HIPAA, MLC 2006, ICAO SMS, MSHA, REACH, and more.'
              },
              {
                icon: <RobotOutlined />,
                title: 'AI & Camera Monitoring',
                desc: 'Real-time AI camera monitoring for PPE compliance, unsafe behavior, and hazard detection. Predictive analytics, document classification, and automated reporting.'
              }
            ].map((item, i) => (
              <div className="about-card reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="about-card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          INDUSTRIES WE SERVE
      ============================================================ */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-section-header reveal">
            <h2 className="about-h2">Industries We Serve</h2>
            <p className="about-section-desc">
              Purpose-built safety solutions for every major industrial sector — worldwide
            </p>
          </div>

          <div className="about-industries-grid">
            {[
              { icon: <BuildOutlined />, label: 'Construction' },
              { icon: <FireOutlined />, label: 'Oil & Gas' },
              { icon: <ToolOutlined />, label: 'Manufacturing' },
              { icon: <MedicineBoxOutlined />, label: 'Healthcare' },
              { icon: <CrownOutlined />, label: 'Mining' },
              { icon: <ExperimentOutlined />, label: 'Chemical' },
              { icon: <RocketOutlined />, label: 'Aviation' },
              { icon: <CloudOutlined />, label: 'Maritime' },
              { icon: <CarOutlined />, label: 'Logistics' },
              { icon: <DatabaseOutlined />, label: 'Agriculture' },
              { icon: <TeamOutlined />, label: 'Education' },
              { icon: <LineChartOutlined />, label: 'Energy & Utilities' }
            ].map((item, i) => (
              <div
                className="about-industry-tile reveal"
                key={i}
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <div className="about-industry-icon">{item.icon}</div>
                <span className="about-industry-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          OUR VALUES
      ============================================================ */}
      <section className="about-section about-section-alt">
        <div className="about-container">
          <div className="about-section-header reveal">
            <h2 className="about-h2">Our Values</h2>
            <p className="about-section-desc">
              The principles that guide everything we build
            </p>
          </div>

          <div className="about-values-grid">
            {[
              { icon: <BulbOutlined />, title: 'Innovation First', desc: 'We embrace AI, automation, and modern technology to solve real-world safety challenges across every industry.' },
              { icon: <SmileOutlined />, title: 'Trust & Integrity', desc: 'We build tools that professionals can rely on when lives and livelihoods are at stake.' },
              { icon: <TeamOutlined />, title: 'Customer Obsessed', desc: 'Every feature, every fix, every improvement starts with listening to our users.' },
              { icon: <TrophyOutlined />, title: 'Excellence', desc: 'We deliver enterprise-grade quality — from the code we write to the support we provide.' },
              { icon: <ClockCircleOutlined />, title: 'Reliability', desc: 'When professionals depend on us, we must be available, accurate, and fast.' },
              { icon: <CrownOutlined />, title: 'Global Accessibility', desc: 'We make world-class safety technology affordable and accessible across the Middle East, Africa, Asia, and beyond.' }
            ].map((value, i) => (
              <div
                className="about-value-card reveal"
                key={i}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="about-value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHY CHOOSE US
      ============================================================ */}
      <section className="about-why-section">
        <div className="about-container">
          <div className="about-section-header about-section-header-light reveal">
            <h2 className="about-h2">Why Choose {COMPANY.name}?</h2>
            <p className="about-section-desc">
              Built for professionals in every industry who cannot afford to get it wrong
            </p>
          </div>

          <div className="about-why-grid">
            {[
              'AI-powered incident investigation and root cause analysis',
              'Real-time AI camera monitoring for PPE and hazard detection',
              'Multi-industry compliance: OSHA, ISO 45001, ISO 14001, HIPAA, MLC, ICAO SMS, MSHA, REACH',
              'Live environmental monitoring with ESG and sustainability reporting',
              'Full document lifecycle: auto-generate, sign, approve, archive',
              'Configurable for 9+ industries — from construction to healthcare',
              'Cloud-based with regional data residency options',
              'Enterprise-grade security, SOC2, and ISO 27001 practices'
            ].map((point, i) => (
              <div
                className="about-why-item reveal"
                key={i}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <CheckCircleOutlined className="about-why-check" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          OUR REACH
      ============================================================ */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-reach reveal">
            <h2 className="about-h2">
              Headquartered in Doha.<br />Built for the World.
            </h2>
            <p className="about-reach-desc">
              {COMPANY.parent} is a global technology company with headquarters in{' '}
              <strong>Doha, Qatar</strong> and operations across the Middle East, Africa,
              and Asia. Our mission: bring enterprise-grade HSE, environmental, and
              compliance technology to organizations of every size — from single-site
              operations to multi-national enterprises.
            </p>

            <div className="about-reach-card">
              <div className="about-reach-emoji">🌍</div>
              <h3>{COMPANY.name}</h3>
              <p className="about-reach-tagline">{COMPANY.tagline}</p>
              <p className="about-reach-sub">
                A product of {COMPANY.parent} · {COMPANY.address}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA
      ============================================================ */}
      <section className="about-section about-section-alt">
        <div className="about-container">
          <div className="about-cta reveal">
            <h2 className="about-cta-title">Ready to Transform Your HSE Program?</h2>
            <p className="about-cta-desc">
              Join safety, environmental, and compliance teams across 9+ industries worldwide
              who trust {COMPANY.name} to keep their people safe and their operations compliant.
            </p>

            <div className="about-cta-actions">
              <Link to="/signup" className="about-cta-btn about-cta-btn-primary">
                Start Free Trial <RocketOutlined />
              </Link>
              <Link to="/contact" className="about-cta-btn about-cta-btn-secondary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CONTACT
      ============================================================ */}
      <section className="about-section about-contact-section">
        <div className="about-container">
          <div className="about-contact-grid">
            <div className="about-contact-item">
              <MailOutlined className="about-contact-icon" />
              <h4>Email</h4>
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </div>
            <div className="about-contact-item">
              <PhoneOutlined className="about-contact-icon" />
              <h4>Phone</h4>
              <span>{COMPANY.phone}</span>
            </div>
            <div className="about-contact-item">
              <EnvironmentOutlined className="about-contact-icon" />
              <h4>Headquarters</h4>
              <span>{COMPANY.address}</span>
              <span className="about-contact-sub">{COMPANY.region}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
