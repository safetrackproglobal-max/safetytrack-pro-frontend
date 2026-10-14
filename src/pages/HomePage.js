import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Row, Col, Typography, Space, Divider, Statistic, Tag } from 'antd';
import {
  SafetyCertificateOutlined,
  TeamOutlined,
  DashboardOutlined,
  FileTextOutlined,
  BarChartOutlined,
  RobotOutlined,
  ArrowRightOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  RocketOutlined,
  BuildOutlined,
  CarOutlined,
  BlockOutlined,
  FireOutlined,
  MedicineBoxOutlined,
  CloudOutlined,
  DatabaseOutlined,
  SecurityScanOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  ApiOutlined,
  MobileOutlined,
  VideoCameraOutlined,
  AlertOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  VerifiedOutlined,
  ReadOutlined,
  EditOutlined,
  SaveOutlined,
  SignatureOutlined,
  DownloadOutlined,
  FileAddOutlined,
  FundOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import './HomePage.css';

const { Title, Text, Paragraph } = Typography;

function HomePage() {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const [hoveredIndustry, setHoveredIndustry] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({});
  const statsRef = useRef(null);
  const slideInterval = useRef(null);

  // Animate stats on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const value = parseFloat(target.dataset.value);
            const suffix = target.dataset.suffix || '';
            const key = target.dataset.key || '';
            let current = 0;
            const increment = value / 60;
            const timer = setInterval(() => {
              current += increment;
              if (current >= value) {
                current = value;
                clearInterval(timer);
              }
              setAnimatedStats((prev) => ({
                ...prev,
                [key]: Math.floor(current) + suffix
              }));
            }, 20);
          }
        });
      },
      { threshold: 0.5 }
    );

    const statElements = document.querySelectorAll('.stat-number-animated');
    statElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    slideInterval.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(slideInterval.current);
  }, []);

  // Hero Slides
  const heroSlides = [
    {
      id: 1,
      image: 'https://i.imgur.com/sisSwvH.png',
      title: 'Environmental Intelligence Dashboard',
      description: 'Real-time environmental monitoring with AI-powered insights',
      badge: 'Environmental Management'
    },
    {
      id: 2,
      image: 'https://i.imgur.com/8ZPHKkB.png',
      title: 'Environmental Health & Carbon Footprint',
      description: 'Track emissions, sustainability index, and live sensors',
      badge: 'Sustainability & ESG'
    },
    {
      id: 3,
      image: 'https://i.imgur.com/HGCjpo7.png',
      title: 'Live Enterprise Safety Metrics',
      description: '94% Air Quality Compliance • 88% Water Quality',
      badge: 'Live Monitoring'
    },
    {
      id: 4,
      image: 'https://i.imgur.com/tGZqMim.png',
      title: 'Healthcare Management Suite',
      description: '7 AI tools • 100 beds • Patient safety monitoring',
      badge: 'Healthcare Solutions'
    },
    {
      id: 5,
      image: 'https://i.imgur.com/wyE6j0k.png',
      title: 'Safety Compliance Dashboard',
      description: 'Manpower distribution, LTI trends, and accident rates',
      badge: 'Safety Analytics'
    }
  ];

  // Core Features
  const features = [
    {
      icon: <SafetyCertificateOutlined />,
      title: 'Compliance Management',
      description:
        'Automated regulatory tracking, real-time alerts, and one-click reporting for OSHA, ISO 45001, HIPAA, and 20+ frameworks.',
      color: '#4CAF50'
    },
    {
      icon: <RobotOutlined />,
      title: 'AI Risk Assessment',
      description:
        'Predictive analytics that identify hazards before they become incidents — with 94% AI accuracy.',
      color: '#2196F3'
    },
    {
      icon: <DashboardOutlined />,
      title: 'Real-time Safety Dashboard',
      description:
        'Live KPIs, incident heatmaps, and compliance status — configurable for any industry, any role.',
      color: '#FF9800'
    },
    {
      icon: <FileTextOutlined />,
      title: 'Smart Document Lifecycle',
      description:
        'Auto-create, modify, submit, digitally sign, download, and archive — with AI classification and version control.',
      color: '#9C27B0'
    },
    {
      icon: <BarChartOutlined />,
      title: 'Advanced Analytics',
      description:
        'Trend analysis, predictive modeling, and custom reporting that turn safety data into decisions.',
      color: '#E91E63'
    },
    {
      icon: <TeamOutlined />,
      title: 'Team Collaboration',
      description:
        'Role-based access across departments, shifts, and sites — with real-time task assignment and tracking.',
      color: '#00BCD4'
    },
    {
      icon: <VideoCameraOutlined />,
      title: 'AI Camera Monitoring',
      description:
        'Live video analysis detecting PPE compliance, unsafe behavior, and hazards — instant alerts, 24/7.',
      color: '#8BC34A'
    },
    {
      icon: <EnvironmentOutlined />,
      title: 'Live Environmental Monitoring',
      description:
        'Track air, water, emissions, and carbon in real-time — with AI prediction and ESG reporting.',
      color: '#FF5722'
    }
  ];

  // Document Lifecycle Steps
  const documentLifecycle = [
    { icon: <FileAddOutlined />, label: 'Auto-Create', color: '#2563eb' },
    { icon: <EditOutlined />, label: 'Modify', color: '#7c3aed' },
    { icon: <SaveOutlined />, label: 'Submit', color: '#0891b2' },
    { icon: <SignatureOutlined />, label: 'Sign', color: '#059669' },
    { icon: <DownloadOutlined />, label: 'Download', color: '#ca8a04' },
    { icon: <DatabaseOutlined />, label: 'Archive', color: '#dc2626' }
  ];

  // Industry Solutions
  const industries = [
    {
      icon: <MedicineBoxOutlined />,
      title: 'Healthcare',
      description:
        'Comprehensive patient safety, infection control, medical equipment compliance, and healthcare workforce protection across hospitals, clinics, and care facilities.',
      features: ['Patient Safety', 'Infection Control', 'Device Compliance', 'Staff Safety'],
      details:
        'HIPAA & Joint Commission ready • Real-time patient monitoring • Medication tracking • Clinical incident reporting',
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #1890ff15, #1890ff30)',
      image: 'https://i.imgur.com/FEfAMkR.jpeg'
    },
    {
      icon: <FireOutlined />,
      title: 'Oil & Gas',
      description:
        'End-to-end process safety management for upstream, midstream, and downstream operations, from HAZOP studies to permit-to-work and emergency response.',
      features: ['Process Safety', 'HAZOP Studies', 'Permit-to-Work', 'Emergency Response'],
      details:
        'OSHA 1910.119 PSM compliant • Real-time gas detection • Fire & gas mapping • Offshore & onshore coverage',
      color: '#fa8c16',
      gradient: 'linear-gradient(135deg, #fa8c1615, #fa8c1630)',
      image: 'https://i.imgur.com/6vkeW5t.png'
    },
    {
      icon: <BuildOutlined />,
      title: 'Construction',
      description:
        'Complete site safety management for high-rise, infrastructure, and civil projects with fall protection, equipment inspections, and contractor compliance tracking.',
      features: ['Site Safety', 'Fall Protection', 'Equipment Inspections', 'Contractor Management'],
      details:
        'OSHA 1926 compliant • Multi-site coordination • Permit-to-work systems • Daily safety audits • Toolbox talks',
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #52c41a15, #52c41a30)',
      image: 'https://i.imgur.com/LgvReqs.jpeg'
    },
    {
      icon: <BuildOutlined />,
      title: 'Manufacturing',
      description:
        'Machine safety, ergonomic risk assessments, chemical handling procedures, and industrial hygiene monitoring for factories and production facilities.',
      features: ['Machine Safety', 'Ergonomics', 'Chemical Handling', 'Industrial Hygiene'],
      details:
        'ISO 45001 compliant • Lockout/tagout systems • Machine guarding • Noise & vibration monitoring',
      color: '#722ed1',
      gradient: 'linear-gradient(135deg, #722ed115, #722ed130)',
      image: 'https://i.imgur.com/Lh45z4B.png'
    },
    {
      icon: <BlockOutlined />,
      title: 'Maritime',
      description:
        'Vessel safety, crew welfare management, ISM Code compliance, and navigation safety for shipping, ports, and offshore marine operations.',
      features: ['Vessel Safety', 'Crew Management', 'Navigation Safety', 'ISM Compliance'],
      details:
        'MLC 2006 compliant • STCW training records • Crew welfare tracking • Emergency drills',
      color: '#13c2c2',
      gradient: 'linear-gradient(135deg, #13c2c215, #13c2c230)',
      image: 'https://i.imgur.com/7OYPUbO.png'
    },
    {
      icon: <CarOutlined />,
      title: 'Aviation',
      description:
        'Flight safety, ground operations, SMS compliance, and maintenance tracking for airlines, airports, and MRO facilities worldwide.',
      features: ['Flight Safety', 'Ground Operations', 'Maintenance Tracking', 'Regulatory Compliance'],
      details:
        'ICAO SMS compliant • FAA & EASA ready • Fatigue risk management • Bird strike tracking',
      color: '#2f54eb',
      gradient: 'linear-gradient(135deg, #2f54eb15, #2f54eb30)',
      image: 'https://i.imgur.com/Ob1YCRi.png'
    },
    {
      icon: <DatabaseOutlined />,
      title: 'Mining',
      description:
        'Underground and surface mining safety including geotechnical monitoring, ventilation control, equipment tracking, and emergency response systems.',
      features: ['Geotechnical Safety', 'Ventilation', 'Equipment Tracking', 'Emergency Response'],
      details:
        'MSHA compliant • Gas detection • Ground control monitoring • Blast management',
      color: '#d4380d',
      gradient: 'linear-gradient(135deg, #d4380d15, #d4380d30)',
      image: 'https://i.imgur.com/Zv35mJ3.jpeg'
    },
    {
      icon: <CloudOutlined />,
      title: 'Chemical',
      description:
        'Hazardous material management, spill prevention, process safety, and environmental compliance for chemical plants, refineries, and pharmaceutical facilities.',
      features: ['HazMat Management', 'Spill Prevention', 'Process Safety', 'Environmental Compliance'],
      details:
        'REACH & TSCA compliant • SDS management • Chemical inventory • Emergency response planning',
      color: '#eb2f96',
      gradient: 'linear-gradient(135deg, #eb2f9615, #eb2f9630)',
      image: 'https://i.imgur.com/Ue9j403.png'
    },
    {
      icon: <ReadOutlined />,
      title: 'Education',
      description:
        'Complete campus safety management for schools, universities, and educational institutions with student welfare, emergency preparedness, and facility safety monitoring.',
      features: ['Student Safety', 'Campus Security', 'Emergency Drills', 'Facility Inspections'],
      details:
        'FERPA compliant • Visitor management • Incident reporting • Emergency response plans',
      color: '#faad14',
      gradient: 'linear-gradient(135deg, #faad1415, #faad1430)',
      image: 'https://i.imgur.com/RPQIyI9.jpeg'
    }
  ];

  // Stats
  const stats = [
    { value: 99.5, suffix: '%', label: t('home.stats.complianceRate') || 'Compliance Rate', key: 'compliance' },
    { value: 65, suffix: '%', label: t('home.stats.timeSaved') || 'Time Saved', key: 'timeSaved' },
    { value: 24, suffix: '/7', label: t('home.stats.monitoring') || '24/7 Monitoring', key: 'monitoring' },
    { value: 9, suffix: '+', label: t('home.stats.industriesServed') || 'Industries Served', key: 'industries' },
    { value: 5000, suffix: '+', label: t('home.stats.facilitiesProtected') || 'Facilities Protected', key: 'facilities' },
    { value: 100, suffix: 'K+', label: t('home.stats.incidentsPrevented') || 'Incidents Prevented', key: 'incidents' }
  ];

  // Trust badges
  const trustBadges = [
    { icon: <VerifiedOutlined />, label: 'ISO 27001 Certified', color: '#1890ff' },
    { icon: <SecurityScanOutlined />, label: 'SOC2 Compliant', color: '#52c41a' },
    { icon: <SafetyCertificateOutlined />, label: 'AI Safety Certified', color: '#fa8c16' },
    { icon: <GlobalOutlined />, label: 'Multi-Industry Ready', color: '#722ed1' }
  ];

  // Benefits
  const benefits = [
    {
      icon: <ThunderboltOutlined />,
      title: 'Instant Incident Reports & Analysis',
      description:
        'Report from any device in seconds. AI captures photos, classifies severity, notifies managers, and tracks corrective actions to closure.'
    },
    {
      icon: <VideoCameraOutlined />,
      title: 'AI Camera Monitoring That Never Blinks',
      description:
        '24/7 detection of PPE compliance, unsafe behavior, and hazards — with instant alerts to your team before incidents occur.'
    },
    {
      icon: <FileTextOutlined />,
      title: 'Complete Document Lifecycle in One Flow',
      description:
        'Auto-create, modify, submit, sign, download, and archive — with version control, expiry tracking, and full audit trails.'
    },
    {
      icon: <EnvironmentOutlined />,
      title: 'Live Environmental Intelligence',
      description:
        'Monitor air, water, emissions, biodiversity, and carbon footprint in real-time with AI predictions and automated ESG reporting.'
    }
  ];

  // Testimonials
  const testimonials = [
    {
      quote:
        t('home.testimonials.healthcare.quote') ||
        'SafeTrack Pro transformed our safety management across 12 hospitals. The AI insights helped us reduce incidents by 45%.',
      author: t('home.testimonials.healthcare.author') || 'Sarah Johnson',
      role: t('home.testimonials.healthcare.role') || 'Safety Director, Healthcare Network',
      industry: t('home.testimonials.healthcare.industry') || 'Healthcare'
    },
    {
      quote:
        t('home.testimonials.oilGas.quote') ||
        'The permit-to-work system and real-time monitoring have been game-changers for our offshore operations.',
      author: t('home.testimonials.oilGas.author') || 'Michael Chen',
      role: t('home.testimonials.oilGas.role') || 'HSE Manager, Oil & Gas Corp',
      industry: t('home.testimonials.oilGas.industry') || 'Oil & Gas'
    },
    {
      quote:
        t('home.testimonials.construction.quote') ||
        'Equipment inspection tracking and contractor management saved us countless hours and improved site safety significantly.',
      author: t('home.testimonials.construction.author') || 'David Rodriguez',
      role: t('home.testimonials.construction.role') || 'Safety Manager, Construction Co',
      industry: t('home.testimonials.construction.industry') || 'Construction'
    },
    {
      quote:
        t('home.testimonials.manufacturing.quote') ||
        'The predictive maintenance alerts prevented multiple equipment failures in our manufacturing plants.',
      author: t('home.testimonials.manufacturing.author') || 'Emily Watson',
      role: t('home.testimonials.manufacturing.role') || 'Plant Manager, Manufacturing Inc',
      industry: t('home.testimonials.manufacturing.industry') || 'Manufacturing'
    },
    {
      quote:
        t('home.testimonials.maritime.quote') ||
        'Vessel safety compliance and crew training tracking have never been easier.',
      author: t('home.testimonials.maritime.author') || 'Capt. James Wilson',
      role: t('home.testimonials.maritime.role') || 'Fleet Safety Officer, Maritime Group',
      industry: t('home.testimonials.maritime.industry') || 'Maritime'
    },
    {
      quote:
        t('home.testimonials.mining.quote') ||
        'The geotechnical monitoring and emergency response features are outstanding for our mining operations.',
      author: t('home.testimonials.mining.author') || 'Robert Thompson',
      role: t('home.testimonials.mining.role') || 'Safety Superintendent, Mining Co',
      industry: t('home.testimonials.mining.industry') || 'Mining'
    }
  ];

  // Pricing Plans
  const pricingPlans = [
    {
      id: 'starter',
      name: t('home.pricing.starter.name') || 'Starter',
      price: t('home.pricing.starter.price') || '$0',
      period: t('home.pricing.starter.period') || '/month',
      description: t('home.pricing.starter.description') || 'For small facilities and startups',
      features: [
        t('home.pricing.starter.feature1') || 'Up to 3 users',
        t('home.pricing.starter.feature2') || 'Basic incident reporting',
        t('home.pricing.starter.feature3') || 'Document management',
        t('home.pricing.starter.feature4') || 'Email notifications',
        t('home.pricing.starter.feature5') || 'Basic analytics',
        t('home.pricing.starter.feature6') || 'Mobile access',
        t('home.pricing.starter.feature7') || 'Community support'
      ],
      link: '/signup',
      buttonText: t('home.pricing.starter.buttonText') || 'Get Started'
    },
    {
      id: 'professional',
      name: t('home.pricing.professional.name') || 'Professional',
      price: t('home.pricing.professional.price') || '$99',
      period: t('home.pricing.professional.period') || '/month',
      description: t('home.pricing.professional.description') || 'For growing organizations',
      features: [
        t('home.pricing.professional.feature1') || 'Up to 20 users',
        t('home.pricing.professional.feature2') || 'All Starter features',
        t('home.pricing.professional.feature3') || 'AI risk assessment',
        t('home.pricing.professional.feature4') || 'API access',
        t('home.pricing.professional.feature5') || 'Advanced analytics',
        t('home.pricing.professional.feature6') || 'Custom workflows',
        t('home.pricing.professional.feature7') || 'Priority support',
        t('home.pricing.professional.feature8') || 'Real-time monitoring'
      ],
      link: '/subscription',
      buttonText: t('home.pricing.professional.buttonText') || 'Start Free Trial',
      popular: true
    },
    {
      id: 'enterprise',
      name: t('home.pricing.enterprise.name') || 'Enterprise',
      price: t('home.pricing.enterprise.price') || 'Custom',
      period: t('home.pricing.enterprise.period') || '',
      description:
        t('home.pricing.enterprise.description') || 'For large enterprises and multi-site operations',
      features: [
        t('home.pricing.enterprise.feature1') || 'Unlimited users',
        t('home.pricing.enterprise.feature2') || 'All Professional features',
        t('home.pricing.enterprise.feature3') || 'Multi-site management',
        t('home.pricing.enterprise.feature4') || 'Custom integrations',
        t('home.pricing.enterprise.feature5') || 'Dedicated account manager',
        t('home.pricing.enterprise.feature6') || 'SLA guarantee',
        t('home.pricing.enterprise.feature7') || 'On-premise deployment',
        t('home.pricing.enterprise.feature8') || '24/7 premium support',
        t('home.pricing.enterprise.feature9') || 'White-labeling options',
        t('home.pricing.enterprise.feature10') || 'Advanced security features'
      ],
      link: '/contact',
      buttonText: t('home.pricing.enterprise.buttonText') || 'Contact Sales'
    }
  ];

  return (
    <div className={`home-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ============================================
           HERO SECTION - ONLY ONE H1 TAG
           ============================================ */}
      <section className="hero-section">
        <div className="hero-bg-animation">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="orb orb-4"></div>
        </div>

        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="welcome-badge animate-slide-in">
                <span className="badge-pulse">●</span>
                AI-Powered Safety Platform
              </div>

              <div className="hero-trust-banner animate-fade-in-delay">
                <div className="trust-badge">
                  <ClockCircleOutlined />
                  <span>2026 • Next-Gen Safety Platform</span>
                </div>
                <div className="trust-badge">
                  <VerifiedOutlined />
                  <span>ISO 27001 & SOC2 Compliant</span>
                </div>
              </div>

              <h1 className="hero-title animate-fade-in">
                The New Standard in <br />
                <span className="gradient-text">Industrial Safety</span>
              </h1>

              <p className="hero-description animate-fade-in-delay-2">
                Complete AI-powered safety platform trusted across 9+ industries. From{' '}
                <strong>AI camera monitoring</strong> and{' '}
                <strong>instant incident analysis</strong> to{' '}
                <strong>full document lifecycle control</strong> and{' '}
                <strong>live environmental monitoring</strong> — everything your safety
                team needs in one platform. Achieve 99.5% compliance with real-time
                intelligence.
              </p>

              <div className="hero-features animate-fade-in-delay-3">
                <span className="feature-tag">
                  <VideoCameraOutlined /> AI Camera Monitoring
                </span>
                <span className="feature-tag">
                  <ThunderboltOutlined /> Instant Incident Reports
                </span>
                <span className="feature-tag">
                  <FileTextOutlined /> Document Lifecycle Control
                </span>
                <span className="feature-tag">
                  <EnvironmentOutlined /> Live Environmental Monitoring
                </span>
                <span className="feature-tag">
                  <RobotOutlined /> AI-Powered Analysis
                </span>
              </div>

              <div className="hero-actions animate-fade-in-delay-4">
                <Button type="primary" size="large" href="/signup" className="cta-button">
                  Start Free Trial <ArrowRightOutlined />
                </Button>
                <Button size="large" href="/subscription" className="secondary-btn">
                  View Plans
                </Button>
              </div>

              <div className="trust-badges animate-fade-in-delay-5">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="trust-badge-item">
                    <span className="badge-icon" style={{ color: badge.color }}>
                      {badge.icon}
                    </span>
                    <span className="badge-label">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual animate-slide-in-right">
              <div className="hero-carousel-container">
                <div
                  className="carousel-track"
                  style={{ transform: `translateX(-${activeSlide * 20}%)` }}
                >
                  {heroSlides.map((slide, index) => (
                    <div key={index} className="carousel-slide">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        loading="lazy"
                        className="carousel-image"
                      />
                      <div className="carousel-overlay">
                        <span className="carousel-badge">{slide.badge}</span>
                        <h3 className="carousel-title">{slide.title}</h3>
                        <p className="carousel-description">{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="carousel-dots">
                  {heroSlides.map((_, index) => (
                    <span
                      key={index}
                      className={`dot ${activeSlide === index ? 'active' : ''}`}
                      onClick={() => {
                        setActiveSlide(index);
                        clearInterval(slideInterval.current);
                        slideInterval.current = setInterval(() => {
                          setActiveSlide((prev) => (prev + 1) % 5);
                        }, 5000);
                      }}
                    ></span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* ============================================
     HSE PROJECT MANAGEMENT SECTION
     ============================================ */}
<section className="hse-project-section">
  <div className="container">
    <div className="section-header">
      <span className="section-tag">HSE Project Management</span>
      <h2 className="section-title">
        Run Your Entire HSE Operation From <span className="gradient-text">One Command Center</span>
      </h2>
      <p className="section-subtitle">
        SafeTrack Pro Global replaces scattered spreadsheets, WhatsApp groups, and disconnected tools with a single, intelligent platform. From manpower deployment and training compliance to LTI trends, accident analytics, and overdue actions — every part of your HSE operation is tracked, measured, and visualized in real time.
      </p>
    </div>

    {/* Dashboard Preview */}
    <div className="hse-dashboard-preview">
      <div className="hse-dash-header">
        <div className="hse-dash-title">
          <SafetyCertificateOutlined /> Safety Compliance Dashboard
          <span className="live-dot"></span> Last Updated: 15:55:02
        </div>
        <div className="hse-dash-actions">
          <Tag color="blue">2025-1C → 2026-1C</Tag>
          <Tag>All Depts</Tag>
          <Button type="primary" size="small" icon={<PlusOutlined />}>New Project</Button>
        </div>
      </div>

      <div className="hse-dash-toolbar">
        <span><FolderOutlined /> Server room</span>
        <div className="toolbar-icons">
          <ReloadOutlined /> <PlusOutlined /> <FileTextOutlined />
          <DownloadOutlined /> <SettingOutlined /> <ExpandOutlined />
          <Tag color="blue">Edit</Tag>
        </div>
      </div>

      <div className="hse-dash-grid">
        <div className="hse-card">
          <div className="hse-card-header">
            <span><TeamOutlined /> Manpower Distribution</span>
            <SettingOutlined />
          </div>
          <div className="hse-card-body">
            <div className="donut-chart"><div className="donut-center">100%</div></div>
            <div className="chart-legend">
              <span><span className="legend-dot blue"></span> Section A: 100%</span>
            </div>
          </div>
          <div className="hse-card-footer">
            <span>Total: 20</span><a>Add Data</a>
          </div>
        </div>

        <div className="hse-card">
          <div className="hse-card-header">
            <span><BarChartOutlined /> Training Statistics</span>
            <SettingOutlined />
          </div>
          <div className="hse-card-body">
            <div className="empty-chart">
              <div className="chart-grid"></div><span>No Data</span>
            </div>
          </div>
          <div className="hse-card-footer">
            <span>Total Trained: 0</span><a>Add Data</a>
          </div>
        </div>

        <div className="hse-card">
          <div className="hse-card-header">
            <span><AlertOutlined /> Lost Time Injury Trend</span>
            <SettingOutlined />
          </div>
          <div className="hse-card-body">
            <div className="empty-chart"><div className="chart-grid"></div></div>
          </div>
        </div>

        <div className="hse-card">
          <div className="hse-card-header">
            <span><ClockCircleOutlined /> Man-Hours Analysis</span>
            <SettingOutlined />
          </div>
          <div className="hse-card-body">
            <div className="bar-chart">
              <div className="bar" style={{ height: '80%' }}></div>
              <div className="bar" style={{ height: '60%' }}></div>
              <div className="bar" style={{ height: '90%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Module Groups with Rich Explanations */}
    <div className="hse-modules-rich">
      {[
        {
          group: 'Overview',
          icon: <DashboardOutlined />,
          color: '#2563eb',
          intro: 'Your entire HSE operation, distilled into live KPIs and executive dashboards.',
          modules: [
            { icon: <DashboardOutlined />, name: 'Overview Dashboard', desc: 'A single live view of every HSE metric across all sites, departments, and projects — updated in real time so you always know the state of your operation.' },
            { icon: <FundOutlined />, name: 'KPI Cards', desc: 'Configurable KPI cards for TRIR, LTIFR, compliance rate, training coverage, and incident frequency — visual, color-coded, and drillable.' }
          ]
        },
        {
          group: 'Workforce',
          icon: <TeamOutlined />,
          color: '#7c3aed',
          intro: 'Know exactly who is on site, where they are deployed, and how they are tracked.',
          modules: [
            { icon: <TeamOutlined />, name: 'Manpower Distribution', desc: 'See how your workforce is allocated across sections, shifts, and disciplines — with real-time headcount, contractor vs. staff ratios, and deployment trends.' },
            { icon: <TeamOutlined />, name: 'Workforce Management', desc: 'Full personnel records including certifications, medicals, inductions, and site access — with automatic expiry alerts and contractor onboarding workflows.' }
          ]
        },
        {
          group: 'Training',
          icon: <ReadOutlined />,
          color: '#0891b2',
          intro: 'Guarantee every worker is trained, certified, and compliant before they step on site.',
          modules: [
            { icon: <ReadOutlined />, name: 'Training & Competency', desc: 'Track mandatory training, competency assessments, toolbox talks, and refresher cycles. Get automatic alerts before certifications expire, and prove compliance in one click during audits.' }
          ]
        },
        {
          group: 'Safety',
          icon: <SafetyCertificateOutlined />,
          color: '#059669',
          intro: 'The full safety intelligence suite — from incidents and observations to injury analytics.',
          modules: [
            { icon: <LineChartOutlined />, name: 'LTI Trend', desc: 'Lost Time Injury trends visualized over weeks, months, and quarters — so you can spot patterns, forecast risk, and demonstrate improvement to regulators.' },
            { icon: <ClockCircleOutlined />, name: 'Man-Hours Analysis', desc: 'Track exposure hours automatically and compute TRIR, LTIFR, and DART rates without manual spreadsheets. Perfect for monthly and annual HSE reporting.' },
            { icon: <AlertOutlined />, name: 'Observations', desc: 'Capture behavior-based safety observations from any device, classify them by type and severity, and track corrective actions through to closure.' },
            { icon: <CarOutlined />, name: 'Accidents', desc: 'Log vehicle, equipment, and site accidents with photos, witnesses, and root cause analysis — and generate investigation reports instantly.' },
            { icon: <MedicineBoxOutlined />, name: 'Injuries', desc: 'Record first aid, medical treatment, restricted duty, and recordable injuries with full case management, follow-up tracking, and OSHA 300 log generation.' }
          ]
        },
        {
          group: 'Compliance',
          icon: <VerifiedOutlined />,
          color: '#dc2626',
          intro: 'Never miss a permit, inspection, or regulatory deadline again.',
          modules: [
            { icon: <SafetyCertificateOutlined />, name: 'Overdue & Expiry Tracking', desc: 'Automatically track every expiring permit, license, inspection, and corrective action across your operation. Receive alerts days or weeks in advance — and eliminate last-minute audit surprises.' }
          ]
        }
      ].map((group, gi) => (
        <div key={gi} className="hse-rich-group">
          <div className="hse-rich-header" style={{ borderLeftColor: group.color }}>
            <div className="hse-rich-icon" style={{ background: `${group.color}15`, color: group.color }}>
              {group.icon}
            </div>
            <div>
              <h3 style={{ color: group.color }}>{group.group}</h3>
              <p>{group.intro}</p>
            </div>
          </div>

          <div className="hse-rich-modules">
            {group.modules.map((mod, mi) => (
              <div key={mi} className="hse-rich-card">
                <div className="hse-rich-card-icon" style={{ background: `${group.color}10`, color: group.color }}>
                  {mod.icon}
                </div>
                <div className="hse-rich-card-text">
                  <strong>{mod.name}</strong>
                  <span>{mod.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ============================================
           TRUST SECTION
           ============================================ */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">
                <VideoCameraOutlined />
              </div>
              <div className="trust-content">
                <h4>AI Camera Monitoring</h4>
                <p>
                  Real-time video analysis with automatic PPE detection, hazard
                  identification, and instant safety violation alerts — 24/7 coverage across
                  every site and shift.
                </p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <ThunderboltOutlined />
              </div>
              <div className="trust-content">
                <h4>Instant Incident Reports & Analysis</h4>
                <p>
                  Report incidents in seconds from any device with auto-capture, AI severity
                  scoring, witness tracking, and immediate manager notification — no paperwork,
                  no delays.
                </p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <FileTextOutlined />
              </div>
              <div className="trust-content">
                <h4>Complete Document Lifecycle Control</h4>
                <p>
                  Auto-create, modify, submit, digitally sign, download, and archive every
                  safety document — with AI classification, version control, and full compliance
                  audit trails.
                </p>
              </div>
            </div>
          </div>

          <div className="trust-grid trust-grid-secondary">
            <div className="trust-item">
              <div className="trust-icon">
                <EnvironmentOutlined />
              </div>
              <div className="trust-content">
                <h4>Live Environmental Monitoring</h4>
                <p>
                  Track air quality, water quality, emissions, biodiversity, and carbon footprint
                  in real-time with AI predictions, ESG reporting, and instant regulatory alerts.
                </p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <SafetyCertificateOutlined />
              </div>
              <div className="trust-content">
                <h4>Enterprise-Grade Security</h4>
                <p>
                  ISO 27001 and SOC2 Type II certified. Bank-level encryption, role-based access
                  control, and complete compliance audit trails across every module.
                </p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <GlobalOutlined />
              </div>
              <div className="trust-content">
                <h4>Built for Regulated Industries</h4>
                <p>
                  Trusted across 9+ industries with compliance frameworks including OSHA, ISO
                  45001, HIPAA, MLC 2006, ICAO SMS, MSHA, and REACH — with region-specific
                  modules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
           HOW IT WORKS SECTION
           ============================================ */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">
              Get Protected in <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="section-subtitle">
              From signup to full compliance — onboard your entire team in under a day
            </p>
          </div>

          <Row gutter={[32, 32]} className="steps-row">
            {[
              {
                step: '01',
                icon: <TeamOutlined />,
                title: 'Connect Your Team',
                description:
                  'Invite users, assign roles, and set up departments, sites, and shifts in minutes. SSO and role-based access included.',
                color: '#2563eb'
              },
              {
                step: '02',
                icon: <RobotOutlined />,
                title: 'Activate AI Modules',
                description:
                  'Turn on AI camera monitoring, incident reporting, document lifecycle, and environmental sensors with one click.',
                color: '#7c3aed'
              },
              {
                step: '03',
                icon: <SafetyCertificateOutlined />,
                title: 'Achieve Compliance',
                description:
                  'Watch your compliance rate climb, incidents drop, and audits pass — with real-time dashboards and automated reports.',
                color: '#059669'
              }
            ].map((item, index) => (
              <Col xs={24} md={8} key={index}>
                <div className="step-card">
                  <div className="step-number" style={{ color: item.color }}>
                    {item.step}
                  </div>
                  <div className="step-icon" style={{ background: `${item.color}15`, color: item.color }}>
                    {item.icon}
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           DOCUMENT LIFECYCLE SECTION
           ============================================ */}
      <section className="document-lifecycle-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Document Control</span>
            <h2 className="section-title">
              Complete Document Lifecycle in <span className="gradient-text">One Flow</span>
            </h2>
            <p className="section-subtitle">
              From creation to archive — everything automated, traceable, and compliant
            </p>
          </div>

          <div className="lifecycle-flow">
            {documentLifecycle.map((step, index) => (
              <div key={index} className="lifecycle-step">
                <div className="lifecycle-icon" style={{ background: `${step.color}15`, color: step.color }}>
                  {step.icon}
                </div>
                <span className="lifecycle-label">{step.label}</span>
                {index < documentLifecycle.length - 1 && (
                  <ArrowRightOutlined className="lifecycle-arrow" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
           AI CAMERA SHOWCASE
           ============================================ */}
      <section className="ai-camera-section">
        <div className="container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="ai-camera-visual">
                <div className="camera-frame">
                  <div className="camera-scan-line"></div>
                  <div className="camera-detection-box box-1">
                    <span>PPE Detected ✓</span>
                  </div>
                  <div className="camera-detection-box box-2 alert">
                    <span>No Helmet ⚠</span>
                  </div>
                  <div className="camera-detection-box box-3">
                    <span>Safe Zone ✓</span>
                  </div>
                </div>
                <div className="camera-stats">
                  <div className="cam-stat">
                    <strong>99.2%</strong>
                    <span>Detection Accuracy</span>
                  </div>
                  <div className="cam-stat">
                    <strong>&lt;1s</strong>
                    <span>Alert Latency</span>
                  </div>
                  <div className="cam-stat">
                    <strong>24/7</strong>
                    <span>Monitoring</span>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="ai-camera-content">
                <span className="section-tag">AI Camera Monitoring</span>
                <h2>
                  Eyes That Never <span className="gradient-text">Blink</span>
                </h2>
                <p>
                  Our AI-powered camera system detects PPE compliance, unsafe behavior, and
                  hazardous conditions in real time — across every site, shift, and zone.
                </p>
                <ul className="camera-feature-list">
                  <li><CheckCircleOutlined /> Automatic PPE detection (helmets, vests, goggles, gloves)</li>
                  <li><CheckCircleOutlined /> Unsafe behavior recognition &amp; instant alerts</li>
                  <li><CheckCircleOutlined /> Restricted zone &amp; hazard area enforcement</li>
                  <li><CheckCircleOutlined /> Fire, smoke &amp; spill detection</li>
                  <li><CheckCircleOutlined /> Works with your existing IP cameras</li>
                </ul>
                <Button type="primary" size="large" href="/features" className="cta-button">
                  See It in Action <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ============================================
           INCIDENT REPORTING FLOW
           ============================================ */}
      <section className="incident-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Incident Reporting</span>
            <h2 className="section-title">
              From Incident to <span className="gradient-text">Insight in Seconds</span>
            </h2>
            <p className="section-subtitle">
              Report, analyze, and resolve incidents — no paperwork, no delays, no missed details
            </p>
          </div>

          <div className="incident-flow">
            {[
              { icon: <MobileOutlined />, label: 'Report', sub: 'Any device, 10 seconds' },
              { icon: <RobotOutlined />, label: 'AI Classify', sub: 'Severity & category' },
              { icon: <AlertOutlined />, label: 'Notify', sub: 'Managers & responders' },
              { icon: <FileTextOutlined />, label: 'Document', sub: 'Auto-generated report' },
              { icon: <CheckCircleOutlined />, label: 'Resolve', sub: 'Track to closure' },
              { icon: <FundOutlined />, label: 'Learn', sub: 'Trends & prevention' }
            ].map((step, index) => (
              <React.Fragment key={index}>
                <div className="incident-step">
                  <div className="incident-icon">{step.icon}</div>
                  <strong>{step.label}</strong>
                  <span>{step.sub}</span>
                </div>
                {index < 5 && <ArrowRightOutlined className="incident-arrow" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
           STATS SECTION
           ============================================ */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <Row gutter={[24, 24]}>
            {stats.map((stat, index) => (
              <Col xs={12} sm={8} md={4} key={index}>
                <div className="stat-card animate-on-scroll">
                  <div className="stat-number-wrapper">
                    <span
                      className="stat-number-animated"
                      data-value={stat.value}
                      data-suffix={stat.suffix}
                      data-key={stat.key}
                    >
                      {animatedStats[stat.key] || '0'}
                    </span>
                  </div>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           INDUSTRIES SECTION
           ============================================ */}
      <section className="industries-section" id="industries">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Solutions</span>
            <h2 className="section-title">
              Tailored for Every <span className="gradient-text">Industry</span>
            </h2>
            <p className="section-subtitle">
              AI-powered safety management solutions designed for diverse industrial sectors
            </p>
          </div>

          <Row gutter={[24, 24]}>
            {industries.map((industry, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <div
                  className="industry-card-wrapper"
                  onMouseEnter={() => setHoveredIndustry(index)}
                  onMouseLeave={() => setHoveredIndustry(null)}
                >
                  <div
                    className="industry-card"
                    style={{
                      borderTop: `4px solid ${industry.color}`,
                      transform: hoveredIndustry === index ? 'translateY(-8px)' : 'none',
                      boxShadow:
                        hoveredIndustry === index ? `0 20px 40px ${industry.color}25` : 'none'
                    }}
                  >
                    <div className="industry-image-wrapper">
                      <img
                        src={industry.image}
                        alt={industry.title}
                        className="industry-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div
                        className="industry-icon-overlay"
                        style={{ background: industry.gradient, color: industry.color }}
                      >
                        {React.cloneElement(industry.icon, {
                          style: { fontSize: 28, color: industry.color }
                        })}
                      </div>
                    </div>
                    <h4>{industry.title}</h4>
                    <p className="industry-description">{industry.description}</p>
                    <div className="industry-features">
                      {industry.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="industry-feature-tag"
                          style={{ background: `${industry.color}15`, color: industry.color }}
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                    {industry.details && (
                      <p className="industry-details" style={{ color: industry.color }}>
                        {industry.details}
                      </p>
                    )}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           COMPLIANCE FRAMEWORKS
           ============================================ */}
      <section className="compliance-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Compliance</span>
            <h2 className="section-title">
              Built for <span className="gradient-text">Every Framework</span>
            </h2>
            <p className="section-subtitle">
              Pre-built compliance modules for the standards your industry demands
            </p>
          </div>

          <Row gutter={[16, 16]}>
            {[
              { code: 'OSHA', label: 'Occupational Safety', color: '#2563eb' },
              { code: 'ISO 45001', label: 'OH&S Management', color: '#7c3aed' },
              { code: 'ISO 14001', label: 'Environmental', color: '#059669' },
              { code: 'ISO 27001', label: 'Information Security', color: '#0891b2' },
              { code: 'HIPAA', label: 'Healthcare Privacy', color: '#dc2626' },
              { code: 'SOC2', label: 'Service Security', color: '#ca8a04' },
              { code: 'MLC 2006', label: 'Maritime Labour', color: '#0ea5e9' },
              { code: 'ICAO SMS', label: 'Aviation Safety', color: '#6366f1' },
              { code: 'MSHA', label: 'Mining Safety', color: '#b45309' },
              { code: 'REACH', label: 'Chemical Safety', color: '#db2777' },
              { code: 'TSCA', label: 'Chemical Control', color: '#16a34a' },
              { code: 'GDPR', label: 'Data Protection', color: '#7e22ce' }
            ].map((fw, index) => (
              <Col xs={12} sm={8} md={6} lg={4} key={index}>
                <div className="compliance-badge" style={{ borderColor: `${fw.color}40` }}>
                  <strong style={{ color: fw.color }}>{fw.code}</strong>
                  <span>{fw.label}</span>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           AI DOCUMENT GENERATOR SECTION
           ============================================ */}
      <section className="ai-doc-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">AI Document Generator</span>
            <h2 className="section-title">
              Generate OSHA-Compliant SOPs in <span className="gradient-text">Seconds</span>
            </h2>
            <p className="section-subtitle">
              Stop wrestling with Word templates. Let our AI build your safety documentation.
            </p>
          </div>

          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={14}>
              <div className="doc-preview-container">
                <div className="doc-preview-header">
                  <div className="doc-icon"><FileTextOutlined /></div>
                  <div>
                    <strong>Generalsafetydocuments SOP - Chemical</strong>
                    <span>Ref: CHE-SOP-20261014 | OSHA 29 CFR 1910</span>
                  </div>
                  <Tag color="blue">PDF Generated</Tag>
                </div>
                <div className="doc-preview-body">
                  <div className="doc-line long"></div>
                  <div className="doc-line medium"></div>
                  <div className="doc-line short"></div>
                  <div className="doc-box">
                    <span>1.0 PURPOSE</span>
                    <div className="doc-line long"></div>
                  </div>
                  <div className="doc-box">
                    <span>2.0 SCOPE</span>
                    <div className="doc-line long"></div>
                  </div>
                  <div className="doc-box">
                    <span>4.0 EQUIPMENT & MATERIALS</span>
                    <div className="doc-checkbox"></div> <div className="doc-line medium"></div>
                    <div className="doc-checkbox"></div> <div className="doc-line medium"></div>
                  </div>
                  <div className="doc-box">
                    <span>5.0 PROCEDURE STEPS</span>
                    <div className="doc-line long"></div>
                    <div className="doc-line long"></div>
                  </div>
                </div>
                <div className="doc-preview-footer">
                  <span>Characters: 15,718</span>
                  <span>Words: 877</span>
                  <span>Export PDF</span>
                </div>
              </div>
            </Col>
            <Col xs={24} lg={10}>
              <div className="ai-doc-content">
                <h3>Your Entire Safety Library, Automated.</h3>
                <p>
                  Whether you need a Chemical SOP, a Construction JHA, or a Healthcare
                  Incident Report, our AI generates fully formatted, regulation-ready
                  documents that match your company's branding.
                </p>
                <ul className="ai-doc-list">
                  <li><CheckCircleOutlined /> Auto-fills OSHA, ISO, and industry-specific references</li>
                  <li><CheckCircleOutlined /> Built-in rich text editor with tables, images, and signatures</li>
                  <li><CheckCircleOutlined /> One-click export to PDF, Word, or direct archive</li>
                  <li><CheckCircleOutlined /> Includes approval workflows (Prepared by, Reviewed by, Approved by)</li>
                </ul>
                <Button type="primary" size="large" href="/features" className="cta-button">
                  Try the Document Generator <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ============================================
           FEATURES SECTION
           ============================================ */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Capabilities</span>
            <h2 className="section-title">
              Everything You Need to{' '}
              <span className="gradient-text">Protect Your Workforce</span>
            </h2>
            <p className="section-subtitle">
              From AI camera monitoring and instant incident analysis to full document
              lifecycle control and live environmental intelligence — one platform, complete
              coverage.
            </p>
          </div>

          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <div className="feature-card" style={{ borderTop: `4px solid ${feature.color}` }}>
                  <div
                    className="feature-icon"
                    style={{ background: feature.color + '25', color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h4 className="feature-title">{feature.title}</h4>
                  <p className="feature-description">{feature.description}</p>
                  <Link to="/features" className="feature-link" style={{ color: feature.color }}>
                    Learn More <ArrowRightOutlined />
                  </Link>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           BENEFITS SECTION
           ============================================ */}
      <section className="benefits-section">
        <div className="container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="benefits-content">
                <span className="section-tag">Why Choose Us</span>
                <h2>
                  Powerful Features That{' '}
                  <span className="gradient-text">Deliver Results</span>
                </h2>
                <p className="benefits-intro">
                  Everything you need to run a safer, more compliant organization — from AI
                  camera monitoring and instant incident reporting to full document control
                  and live environmental intelligence.
                </p>

                {benefits.map((benefit, index) => (
                  <div className="benefit-item" key={index}>
                    <div className="benefit-icon">{benefit.icon}</div>
                    <div className="benefit-text">
                      <h5>{benefit.title}</h5>
                      <span>{benefit.description}</span>
                    </div>
                  </div>
                ))}

                <Button type="primary" size="large" href="/features" className="benefits-cta">
                  Explore All Features <ArrowRightOutlined />
                </Button>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="benefits-visual">
                <div className="floating-cards">
                  <div className="floating-card card-1">
                    <VideoCameraOutlined />
                    <span>AI Camera 24/7</span>
                  </div>
                  <div className="floating-card card-2">
                    <ThunderboltOutlined />
                    <span>Instant Reports</span>
                  </div>
                  <div className="floating-card card-3">
                    <FileTextOutlined />
                    <span>Doc Lifecycle</span>
                  </div>
                  <div className="floating-card card-4">
                    <EnvironmentOutlined />
                    <span>Live Environmental</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ============================================
           TESTIMONIALS SECTION
           ============================================ */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">
              Trusted by <span className="gradient-text">Industry Leaders</span>
            </h2>
            <p className="section-subtitle">
              See what safety professionals are saying about SafeTrack Pro
            </p>
          </div>

          <Row gutter={[24, 24]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <div className="testimonial-card">
                  <div className="testimonial-quote">"</div>
                  <p className="testimonial-text">{testimonial.quote}</p>
                  <div className="testimonial-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="star">
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <span>{testimonial.author.charAt(0)}</span>
                    </div>
                    <div className="author-info">
                      <span className="author-name">{testimonial.author}</span>
                      <span className="author-role">{testimonial.role}</span>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           CSP EXAM SIMULATOR SECTION
           ============================================ */}
      <section className="csp-exam-section">
        <div className="container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="csp-content">
                <span className="section-tag">Career Advancement</span>
                <h2>
                  Worried About the <span className="gradient-text">CSP Exam?</span>
                </h2>
                <p>
                  Don't guess your readiness. Test your knowledge with our <strong>CSP Hard Mode</strong>{' '}
                  simulation. Experience the exact pressure, time limits, and scenario-based
                  questions of the real Certified Safety Professional (CSP) exam.
                </p>

                <div className="csp-features-grid">
                  <div className="csp-feature">
                    <CheckCircleOutlined />
                    <div>
                      <strong>100 Complex Scenario Questions</strong>
                      <span>4-hour time limit (CSP-level pacing)</span>
                    </div>
                  </div>
                  <div className="csp-feature">
                    <CheckCircleOutlined />
                    <div>
                      <strong>Instant Scoring & Analytics</strong>
                      <span>See exactly where you need to improve</span>
                    </div>
                  </div>
                  <div className="csp-feature">
                    <CheckCircleOutlined />
                    <div>
                      <strong>Verifiable Certification</strong>
                      <span>Pass and receive a blockchain-verified certificate with CEUs</span>
                    </div>
                  </div>
                </div>

                <div className="csp-credential-levels">
                  <h4>Earn Your Credential:</h4>
                  <div className="levels-row">
                    <span className="level-badge platinum">🏆 Platinum (90%+)</span>
                    <span className="level-badge gold">🥇 Gold (85%+)</span>
                    <span className="level-badge silver">🥈 Silver (80%+)</span>
                    <span className="level-badge bronze">🥉 Bronze (75%+)</span>
                  </div>
                </div>

                <Button type="primary" size="large" className="cta-button" href="/exam">
                  Start CSP Hard Mode Exam <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="csp-visual">
                <div className="csp-mockup">
                  <div className="mockup-header">
                    <SafetyCertificateOutlined /> CSP Hard Mode Exam
                  </div>
                  <div className="mockup-body">
                    <div className="question-skeleton"></div>
                    <div className="question-skeleton short"></div>
                    <div className="option-skeleton"></div>
                    <div className="option-skeleton"></div>
                  </div>
                  <div className="mockup-footer">
                    <span>Time Remaining: 03:45:12</span>
                    <span>Question 42 of 100</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ============================================
           PRICING SECTION
           ============================================ */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">
              Choose Your <span className="gradient-text">Plan</span>
            </h2>
            <p className="section-subtitle">
              Flexible plans for every organization's safety management needs
            </p>
          </div>

          <Row gutter={[24, 24]} justify="center">
            {pricingPlans.map((plan) => (
              <Col xs={24} md={12} lg={8} key={plan.id}>
                <div className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                  {plan.popular && (
                    <div className="popular-badge">
                      <span>★ Most Popular</span>
                    </div>
                  )}
                  <div className="pricing-header">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-price">
                      <span className="price-amount">{plan.price}</span>
                      <span className="price-period">{plan.period}</span>
                    </div>
                    <p className="plan-description">{plan.description}</p>
                  </div>
                  <div className="pricing-features">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="pricing-feature">
                        <CheckCircleOutlined className="feature-check" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    type={plan.popular ? 'primary' : 'default'}
                    size="large"
                    href={plan.link}
                    block
                    className={`pricing-cta ${plan.popular ? 'cta-primary' : ''}`}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           CTA SECTION
           ============================================ */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <span className="cta-tag">Get Started</span>
              <h2>
                Ready to Transform Your{' '}
                <span className="gradient-text">Safety Management</span>?
              </h2>
              <p className="cta-description">
                Join organizations across 9+ industries using AI camera monitoring, instant
                incident analysis, complete document lifecycle control, and live environmental
                intelligence — all in one platform.
              </p>
              <div className="cta-actions">
                <Button type="primary" size="large" href="/signup" className="cta-primary-btn">
                  Start Free Trial <ArrowRightOutlined />
                </Button>
                <Button size="large" href="/contact" className="cta-secondary-btn">
                  Contact Sales
                </Button>
              </div>
              <div className="cta-trust">
                <span>✓ ISO 27001 Certified</span>
                <span>✓ SOC2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
