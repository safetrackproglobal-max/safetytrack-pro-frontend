// src/pages/InfoPage.js
import React, { useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Space, Tag, Breadcrumb, Divider } from 'antd';
import {
  BookOutlined,
  ReadOutlined,
  FileTextOutlined,
  ApiOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  HandshakeOutlined,
  AuditOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  HomeOutlined,
  LockOutlined,
  GlobalOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// ============================================================
// SECTION DEFINITIONS
// Each section can have:
//   - title:       Page heading
//   - icon:        React component (icon)
//   - tagline:     Short subtitle for index cards
//   - description: Long-form intro paragraph
//   - bullets:     Array of "what to expect" points
//   - status:      'available' | 'coming-soon' | 'in-progress'
//   - eta:         Optional — only shown when status != 'available'
//   - contactEmail, contactPhone: Optional contact card
//   - ctaText, ctaLink: Optional primary CTA
//   - related:     Optional array of section keys to show as "Related"
//   - accent:      Optional color override
// ============================================================

const SECTIONS = {
  documentation: {
    title: 'Documentation',
    icon: <BookOutlined />,
    tagline: 'Complete product documentation is on the way.',
    description:
      'Step-by-step guides, API references, and configuration manuals for every SafeTrack Pro module. Whether you are onboarding a new team or rolling out a new site, everything you need is here.',
    bullets: [
      'Getting started guide for new teams',
      'Module-by-module configuration walkthroughs',
      'Regulatory framework mapping (OSHA, ISO, HIPAA, MSHA, REACH)',
      'Admin, security, and integration reference'
    ],
    status: 'coming-soon',
    eta: 'Q1 2026',
    related: ['guides', 'api-docs', 'support']
  },
  guides: {
    title: 'Guides & Tutorials',
    icon: <ReadOutlined />,
    tagline: 'Practical guides for HSE professionals.',
    description:
      'Industry-specific playbooks — from scaffolding inspections to HAZOP studies and incident investigations. Built by HSE practitioners, for HSE practitioners.',
    bullets: [
      'Construction: fall protection, scaffolding, excavation safety',
      'Oil & Gas: HAZOP, permit-to-work, H2S procedures',
      'Manufacturing: lockout/tagout, machine guarding',
      'Healthcare: infection control, patient handling',
      'Mining: ventilation, blasting, ground control'
    ],
    status: 'coming-soon',
    eta: 'Q1 2026',
    related: ['documentation', 'blog', 'support']
  },
  blog: {
    title: 'Insights & Blog',
    icon: <FileTextOutlined />,
    tagline: 'Safety intelligence, delivered weekly.',
    description:
      'Deep dives into regulatory changes, AI in HSE, and lessons from the field. Written by our team and guest experts across the industries we serve.',
    bullets: [
      'Regulatory updates across regions',
      'Case studies from real customers',
      'AI and automation in HSE',
      'Compliance strategy and best practices'
    ],
    status: 'coming-soon',
    eta: 'Q1 2026',
    related: ['guides', 'documentation', 'compliance']
  },
  'api-docs': {
    title: 'API Documentation',
    icon: <ApiOutlined />,
    tagline: 'Build on the SafeTrack Pro platform.',
    description:
      'REST endpoints, webhooks, and SDKs for integrating SafeTrack Pro with your existing systems. Full OpenAPI specification, interactive playground, and code samples in multiple languages.',
    bullets: [
      'REST API reference with interactive examples',
      'Authentication (OAuth 2.0 + JWT)',
      'Webhooks for incidents, documents, and compliance events',
      'Sample SDKs: Python, Node.js, cURL'
    ],
    status: 'coming-soon',
    eta: 'Q2 2026',
    related: ['documentation', 'partners', 'security']
  },
  support: {
    title: 'Support Center',
    icon: <QuestionCircleOutlined />,
    tagline: "We're here to help.",
    description:
      'Search the knowledge base or reach our team directly. Enterprise customers get 24/7 priority support with a dedicated account manager.',
    bullets: [
      'Knowledge base with 500+ articles',
      'Live chat during business hours (Sun–Thu, 9AM–6PM AST)',
      'Enterprise: 24/7 priority support',
      'Status page for uptime and incidents'
    ],
    status: 'available',
    contactEmail: 'info@safetrackproglobal.com',
    contactPhone: '+974 3325 1705',
    ctaText: 'Contact Support',
    ctaLink: '/contact',
    related: ['documentation', 'guides', 'demo']
  },
  careers: {
    title: 'Careers at SafeTrack Pro',
    icon: <TeamOutlined />,
    tagline: 'Join a global team building the future of HSE technology.',
    description:
      "We're hiring engineers, designers, and HSE domain experts across Doha, Dubai, and remote. Help us protect millions of workers worldwide.",
    bullets: [
      'Engineering (Full-stack, ML/AI, DevOps)',
      'Design (Product, UX, Brand)',
      'HSE domain experts and consultants',
      'Sales and customer success across MENA'
    ],
    status: 'available',
    contactEmail: 'careers@safetrackproglobal.com',
    ctaText: 'Send Your CV',
    ctaLink: 'mailto:careers@safetrackproglobal.com',
    related: ['about', 'partners', 'security']
  },
  security: {
    title: 'Security & Trust',
    icon: <SafetyCertificateOutlined />,
    tagline: 'Enterprise-grade security, end to end.',
    description:
      'Encryption in transit and at rest, SOC 2 aligned controls, ISO 27001 practices, and regional data residency options. Security is a feature, not an afterthought.',
    bullets: [
      'AES-256 encryption at rest, TLS 1.3 in transit',
      'SOC 2 Type II aligned controls (audit in progress)',
      'Role-based access control (RBAC) with SSO',
      'Regional data residency: MENA, EU, US',
      'Regular penetration testing and vulnerability management'
    ],
    status: 'available',
    ctaText: 'Contact Security Team',
    ctaLink: 'mailto:security@safetrackproglobal.com',
    related: ['compliance', 'partners', 'api-docs']
  },
  partners: {
    title: 'Partners & Integrations',
    icon: <HandshakeOutlined />,
    tagline: 'Grow with SafeTrack Pro.',
    description:
      'Reseller, technology, and consulting partners across the Middle East, Africa, and Asia. Join a growing ecosystem building safer workplaces.',
    bullets: [
      'Reseller program: MENA, Africa, Asia',
      'Technology partners: ERP, HRMS, IoT integrations',
      'Consulting partners: implementation and training',
      'API-first architecture for custom integrations'
    ],
    status: 'available',
    contactEmail: 'partners@safetrackproglobal.com',
    ctaText: 'Become a Partner',
    ctaLink: 'mailto:partners@safetrackproglobal.com',
    related: ['api-docs', 'security', 'careers']
  },
  compliance: {
    title: 'Compliance Frameworks',
    icon: <AuditOutlined />,
    tagline: 'Built for every regulatory standard.',
    description:
      'OSHA, ISO 45001, ISO 14001, HIPAA, MLC 2006, ICAO SMS, MSHA, REACH, TSCA, GDPR, and more — pre-configured modules that ship with the platform.',
    bullets: [
      'HSE: OSHA 1910/1926, ISO 45001, ISO 14001',
      'Healthcare: HIPAA, Joint Commission, CDC',
      'Maritime: MLC 2006, ISM Code, STCW',
      'Aviation: ICAO SMS, FAA, EASA',
      'Mining: MSHA, Mine Act',
      'Chemical: REACH, TSCA, GHS',
      'Data: GDPR, SOC 2, ISO 27001'
    ],
    status: 'available',
    ctaText: 'Explore Compliance',
    ctaLink: '/features',
    related: ['security', 'documentation', 'support']
  },
  cookies: {
    title: 'Cookie Policy',
    icon: <InfoCircleOutlined />,
    tagline: 'How we use cookies on safetrackproglobal.com.',
    description:
      'We only use strictly necessary cookies for authentication and essential functionality. Our detailed cookie policy is being finalized.',
    bullets: [
      'Strictly necessary: session, authentication',
      'Analytics: aggregate, anonymized usage data',
      'No third-party advertising or tracking cookies',
      'You can manage cookies in your browser settings'
    ],
    status: 'available',
    related: ['security', 'compliance', 'sla']
  },
  sla: {
    title: 'Service Level Agreement',
    icon: <ClockCircleOutlined />,
    tagline: 'Uptime commitments for enterprise customers.',
    description:
      'Our SLA provides a 99.9% uptime guarantee, response time targets, and incident credits. The full document is available under your enterprise contract.',
    bullets: [
      '99.9% monthly uptime guarantee',
      'Critical issues: 1-hour response, 4-hour resolution',
      'High-priority: 4-hour response, 24-hour resolution',
      'Service credits for missed targets',
      'Scheduled maintenance announced 7 days in advance'
    ],
    status: 'available',
    ctaText: 'Request SLA Copy',
    ctaLink: 'mailto:legal@safetrackproglobal.com',
    related: ['security', 'compliance', 'support']
  },
  demo: {
    title: 'Request a Live Demo',
    icon: <PlayCircleOutlined />,
    tagline: 'See SafeTrack Pro in action.',
    description:
      "Schedule a personalized 30-minute walkthrough with our team. We'll tailor the demo to your industry and use case — no obligation, no credit card required.",
    bullets: [
      'Custom demo aligned to your industry',
      'Q&A with HSE and platform experts',
      'Pricing and implementation timeline',
      'No obligation — no credit card required'
    ],
    status: 'available',
    contactEmail: 'info@safetrackproglobal.com',
    ctaText: 'Book Your Demo',
    ctaLink: '/contact',
    related: ['support', 'features', 'pricing']
  }
};

// Status pill style helper
const STATUS_META = {
  available: { color: 'green', label: 'Available Now' },
  'coming-soon': { color: 'orange', label: 'Coming Soon' },
  'in-progress': { color: 'blue', label: 'In Progress' }
};

// ============================================================
// SECTION PAGE VIEW
// ============================================================
const SectionView = ({ sectionKey }) => {
  const sec = SECTIONS[sectionKey];
  const statusMeta = STATUS_META[sec.status] || STATUS_META['coming-soon'];

  // Pick related sections — explicit if provided, otherwise fallback to next 4
  const relatedKeys = useMemo(() => {
    if (sec.related && sec.related.length > 0) {
      return sec.related.filter((k) => SECTIONS[k]);
    }
    return Object.keys(SECTIONS)
      .filter((k) => k !== sectionKey)
      .slice(0, 4);
  }, [sec.related, sectionKey]);

  return (
    <>
      {/* ---------- Breadcrumb ---------- */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '20px 24px 0'
        }}
      >
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/info">Resources</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{sec.title}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* ---------- Hero ---------- */}
      <section
        style={{
          padding: '60px 24px 50px',
          background: 'linear-gradient(135deg, #f0f2f8 0%, #e8eaf6 100%)',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #1A2A6C, #C9A84C)',
              color: '#ffffff',
              fontSize: 32,
              marginBottom: 24,
              boxShadow: '0 12px 28px rgba(26, 42, 108, 0.2)'
            }}
          >
            {sec.icon}
          </div>

          <Title
            level={1}
            style={{
              color: '#1A2A6C',
              marginBottom: 16,
              fontSize: 'clamp(28px, 4vw, 42px)',
              lineHeight: 1.15
            }}
          >
            {sec.title}
          </Title>

          <Paragraph
            style={{
              fontSize: 17,
              color: '#4a5568',
              lineHeight: 1.7,
              maxWidth: 640,
              margin: '0 auto 20px'
            }}
          >
            {sec.tagline}
          </Paragraph>

          <Tag color={statusMeta.color} style={{ padding: '4px 14px', fontWeight: 600 }}>
            {statusMeta.label}
          </Tag>
        </div>
      </section>

      {/* ---------- Content Card ---------- */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        <Card
          style={{
            borderRadius: 20,
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(26, 42, 108, 0.05)'
          }}
          styles={{ body: { padding: 'clamp(24px, 4vw, 40px)' } }}
        >
          <Paragraph style={{ fontSize: 16, color: '#4a5568', lineHeight: 1.8, marginBottom: 32 }}>
            {sec.description}
          </Paragraph>

          {sec.bullets && sec.bullets.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <Title level={5} style={{ color: '#1A2A6C', marginBottom: 16, fontSize: 15 }}>
                <RocketOutlined style={{ marginRight: 8 }} />
                What to expect
              </Title>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {sec.bullets.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      fontSize: 15,
                      color: '#4a5568',
                      lineHeight: 1.6
                    }}
                  >
                    <CheckCircleOutlined
                      style={{
                        color: '#C9A84C',
                        fontSize: 18,
                        marginTop: 2,
                        flexShrink: 0
                      }}
                    />
                    <span>{b}</span>
                  </div>
                ))}
              </Space>
            </div>
          )}

          {sec.eta && sec.status !== 'available' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: 20,
                color: '#9a3412',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 24
              }}
            >
              <ClockCircleOutlined /> Estimated launch: {sec.eta}
            </div>
          )}

          {sec.contactEmail && (
            <div
              style={{
                padding: 20,
                background: '#f8fafc',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                marginBottom: 24
              }}
            >
              <Text strong style={{ color: '#1A2A6C', display: 'block', marginBottom: 10 }}>
                Contact us directly:
              </Text>
              <Space direction="vertical" size={6}>
                <a
                  href={`mailto:${sec.contactEmail}`}
                  style={{
                    color: '#2563eb',
                    fontSize: 15,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <MailOutlined /> {sec.contactEmail}
                </a>
                {sec.contactPhone && (
                  <a
                    href={`tel:${sec.contactPhone.replace(/\s/g, '')}`}
                    style={{
                      color: '#2563eb',
                      fontSize: 15,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <PhoneOutlined /> {sec.contactPhone}
                  </a>
                )}
              </Space>
            </div>
          )}

          <Divider style={{ margin: '24px 0' }} />

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button
              type="primary"
              size="large"
              href={sec.ctaLink || '/contact'}
              style={{
                background: 'linear-gradient(135deg, #1A2A6C, #C9A84C)',
                border: 'none',
                borderRadius: 50,
                height: 48,
                padding: '0 32px',
                fontWeight: 600
              }}
            >
              {sec.ctaText || 'Contact Us'} <ArrowRightOutlined />
            </Button>
            <Button
              size="large"
              href="/info"
              style={{
                borderRadius: 50,
                height: 48,
                padding: '0 32px',
                fontWeight: 600,
                border: '2px solid #1A2A6C',
                color: '#1A2A6C'
              }}
            >
              <ArrowLeftOutlined /> All Resources
            </Button>
          </div>
        </Card>

        {/* ---------- Related Sections ---------- */}
        {relatedKeys.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <Title level={4} style={{ color: '#1A2A6C', marginBottom: 20 }}>
              Explore More
            </Title>
            <Row gutter={[16, 16]}>
              {relatedKeys.map((key) => {
                const s = SECTIONS[key];
                return (
                  <Col xs={12} md={6} key={key}>
                    <Link to={`/info/${key}`} style={{ textDecoration: 'none' }}>
                      <Card
                        hoverable
                        size="small"
                        style={{
                          borderRadius: 12,
                          textAlign: 'center',
                          height: '100%',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.3s ease'
                        }}
                        styles={{ body: { padding: 20 } }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            margin: '0 auto 12px',
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #1A2A6C15, #C9A84C15)',
                            color: '#1A2A6C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20
                          }}
                        >
                          {s.icon}
                        </div>
                        <Text strong style={{ color: '#1A2A6C', fontSize: 13 }}>
                          {s.title}
                        </Text>
                      </Card>
                    </Link>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}
      </div>
    </>
  );
};

// ============================================================
// INDEX VIEW
// ============================================================
const IndexView = () => (
  <>
    <section
      style={{
        padding: '80px 24px 60px',
        background: 'linear-gradient(135deg, #f0f2f8 0%, #e8eaf6 100%)',
        textAlign: 'center'
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Tag
          color="blue"
          style={{
            padding: '6px 16px',
            borderRadius: 20,
            marginBottom: 24,
            fontSize: 13,
            fontWeight: 600
          }}
        >
          SafeTrack Pro Global · Resources
        </Tag>
        <Title
          level={1}
          style={{
            color: '#1A2A6C',
            marginBottom: 16,
            fontSize: 'clamp(28px, 4vw, 40px)'
          }}
        >
          Everything About SafeTrack Pro
        </Title>
        <Paragraph
          style={{
            fontSize: 17,
            color: '#4a5568',
            lineHeight: 1.7,
            maxWidth: 620,
            margin: '0 auto'
          }}
        >
          Documentation, guides, compliance frameworks, security, support, and
          company information — all in one place.
        </Paragraph>
      </div>
    </section>

    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
      <Row gutter={[24, 24]}>
        {Object.entries(SECTIONS).map(([key, sec]) => {
          const statusMeta = STATUS_META[sec.status] || STATUS_META['coming-soon'];
          return (
            <Col xs={24} sm={12} lg={8} key={key}>
              <Link to={`/info/${key}`} style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    height: '100%',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease'
                  }}
                  styles={{ body: { padding: 28, display: 'flex', flexDirection: 'column', height: '100%' } }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #1A2A6C15, #C9A84C15)',
                      color: '#1A2A6C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      marginBottom: 16
                    }}
                  >
                    {sec.icon}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Title level={4} style={{ color: '#1A2A6C', margin: 0, fontSize: 17 }}>
                      {sec.title}
                    </Title>
                  </div>

                  <Tag
                    color={statusMeta.color}
                    style={{ width: 'fit-content', marginBottom: 12, fontSize: 11, fontWeight: 600 }}
                  >
                    {statusMeta.label}
                  </Tag>

                  <Paragraph
                    style={{
                      color: '#4a5568',
                      fontSize: 14,
                      lineHeight: 1.6,
                      marginBottom: 16,
                      flex: 1
                    }}
                  >
                    {sec.tagline}
                  </Paragraph>

                  <div
                    style={{
                      marginTop: 'auto',
                      color: '#C9A84C',
                      fontWeight: 600,
                      fontSize: 13
                    }}
                  >
                    Learn more <ArrowRightOutlined />
                  </div>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>

      {/* ---------- Bottom CTA ---------- */}
      <div
        style={{
          marginTop: 80,
          padding: '40px 32px',
          background: 'linear-gradient(135deg, #1A2A6C, #C9A84C)',
          borderRadius: 20,
          textAlign: 'center',
          color: '#ffffff'
        }}
      >
        <Title level={3} style={{ color: '#ffffff', marginBottom: 12 }}>
          Still have questions?
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 24 }}>
          Our team is ready to help — from pricing to implementation.
        </Paragraph>
        <Space size={12} wrap style={{ justifyContent: 'center' }}>
          <Button
            size="large"
            href="/contact"
            style={{
              background: '#ffffff',
              color: '#1A2A6C',
              border: 'none',
              borderRadius: 50,
              height: 48,
              padding: '0 32px',
              fontWeight: 600
            }}
          >
            Contact Us <ArrowRightOutlined />
          </Button>
          <Button
            size="large"
            href="/info/demo"
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: '2px solid #ffffff',
              borderRadius: 50,
              height: 48,
              padding: '0 32px',
              fontWeight: 600
            }}
          >
            Request a Demo
          </Button>
        </Space>
      </div>
    </div>
  </>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
const InfoPage = () => {
  const { section } = useParams();
  const location = useLocation();

  const isValidSection = section && SECTIONS[section];

  // Scroll to top on section change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Update document title for SEO
  useEffect(() => {
    const defaultTitle = 'Resources | SafeTrack Pro Global';
    const pageTitle = isValidSection
      ? `${SECTIONS[section].title} | SafeTrack Pro Global`
      : defaultTitle;
    document.title = pageTitle;

    // Restore previous title on unmount
    return () => {
      document.title = defaultTitle;
    };
  }, [section, isValidSection]);

  // Update meta description for SEO
  useEffect(() => {
    const metaDesc = document.querySelector('meta[name="description"]');
    const defaultDesc = 'AI-powered HSE, environmental, and compliance platform.';
    const desc = isValidSection ? SECTIONS[section].description : defaultDesc;

    if (metaDesc) {
      const original = metaDesc.getAttribute('content');
      metaDesc.setAttribute('content', desc);
      return () => {
        metaDesc.setAttribute('content', original || defaultDesc);
      };
    }
  }, [section, isValidSection]);

  return (
    <div
      className="info-page"
      style={{
        background: '#f8f9fa',
        minHeight: '70vh'
      }}
    >
      {isValidSection ? <SectionView sectionKey={section} /> : <IndexView />}
    </div>
  );
};

export default InfoPage;
