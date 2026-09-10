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
  VerifiedOutlined
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

  // Hero Slides - Your Dashboard Screenshots
  const heroSlides = [
    {
      id: 1,
      image: "https://i.imgur.com/sisSwvH.png",
      title: "Environmental Intelligence Dashboard",
      description: "Real-time environmental monitoring with AI-powered insights",
      badge: "Environmental Management"
    },
    {
      id: 2,
      image: "https://i.imgur.com/8ZPHKkB.png",
      title: "Environmental Health & Carbon Footprint",
      description: "Track emissions, sustainability index, and live sensors",
      badge: "Sustainability & ESG"
    },
    {
      id: 3,
      image: "https://i.imgur.com/HGCjpo7.png",
      title: "Live Enterprise Safety Metrics",
      description: "94% Air Quality Compliance • 88% Water Quality",
      badge: "Live Monitoring"
    },
    {
      id: 4,
      image: "https://i.imgur.com/tGZqMim.png",
      title: "Healthcare Management Suite",
      description: "7 AI tools • 100 beds • Patient safety monitoring",
      badge: "Healthcare Solutions"
    },
    {
      id: 5,
      image: "https://i.imgur.com/wyE6j0k.png",
      title: "Safety Compliance Dashboard",
      description: "Manpower distribution, LTI trends, and accident rates",
      badge: "Safety Analytics"
    }
  ];

  // Core Features
  const features = [
    {
      icon: <SafetyCertificateOutlined />,
      title: t('home.features.safetyCompliance') || 'Compliance Management',
      description: t('home.features.safetyComplianceDesc') || 'Automated tracking and reporting for all safety regulations across industries',
      color: '#4CAF50'
    },
    {
      icon: <RobotOutlined />,
      title: t('home.features.aiRiskAssessment') || 'AI Risk Assessment',
      description: t('home.features.aiRiskAssessmentDesc') || 'Predictive analytics for proactive risk management in any environment',
      color: '#2196F3'
    },
    {
      icon: <DashboardOutlined />,
      title: t('home.features.realTimeDashboard') || 'Real-time Dashboard',
      description: t('home.features.realTimeDashboardDesc') || 'Monitor safety metrics, incidents, and compliance status with customizable dashboards',
      color: '#FF9800'
    },
    {
      icon: <FileTextOutlined />,
      title: t('home.features.smartDocumentManagement') || 'Smart Document Management',
      description: t('home.features.smartDocumentManagementDesc') || 'Create, manage, and share safety documents with intelligent version control',
      color: '#9C27B0'
    },
    {
      icon: <BarChartOutlined />,
      title: t('home.features.advancedAnalytics') || 'Advanced Analytics',
      description: t('home.features.advancedAnalyticsDesc') || 'Gain actionable insights from safety data with predictive analytics and trend analysis',
      color: '#E91E63'
    },
    {
      icon: <TeamOutlined />,
      title: t('home.features.teamCollaboration') || 'Team Collaboration',
      description: t('home.features.teamCollaborationDesc') || 'Seamless coordination across departments, shifts, and locations',
      color: '#00BCD4'
    },
    {
      icon: <VideoCameraOutlined />,
      title: 'AI Camera Monitoring',
      description: 'Real-time video analysis with PPE compliance detection and hazard identification',
      color: '#8BC34A'
    },
    {
      icon: <EnvironmentOutlined />,
      title: 'Environmental Monitoring',
      description: 'Monitor air quality, emissions, waste management, and environmental compliance',
      color: '#FF5722'
    }
  ];

  // Industry Solutions with Your Screenshots
  const industries = [
    {
      icon: <MedicineBoxOutlined />,
      title: t('home.industries.healthcare') || 'Healthcare',
      description: t('home.industries.healthcareDesc') || 'Patient safety, infection control, medical equipment compliance, and staff safety management',
      features: [
        t('home.industries.healthcareFeat1') || 'Patient Safety',
        t('home.industries.healthcareFeat2') || 'Infection Control',
        t('home.industries.healthcareFeat3') || 'Device Compliance',
        t('home.industries.healthcareFeat4') || 'Staff Safety'
      ],
      color: '#1890ff',
      gradient: 'linear-gradient(135deg, #1890ff15, #1890ff30)',
      image: 'https://i.imgur.com/tGZqMim.png'
    },
    {
      icon: <FireOutlined />,
      title: t('home.industries.oilGas') || 'Oil & Gas',
      description: t('home.industries.oilGasDesc') || 'Process safety management, HAZOP studies, permit-to-work systems, and emergency response',
      features: [
        t('home.industries.oilGasFeat1') || 'Process Safety',
        t('home.industries.oilGasFeat2') || 'HAZOP Studies',
        t('home.industries.oilGasFeat3') || 'Permit-to-Work',
        t('home.industries.oilGasFeat4') || 'Emergency Response'
      ],
      color: '#fa8c16',
      gradient: 'linear-gradient(135deg, #fa8c1615, #fa8c1630)',
      image: 'https://i.imgur.com/wyE6j0k.png'
    },
    {
      icon: <BuildOutlined />,
      title: t('home.industries.construction') || 'Construction',
      description: t('home.industries.constructionDesc') || 'Site safety, fall protection, equipment inspections, and contractor management',
      features: [
        t('home.industries.constructionFeat1') || 'Site Safety',
        t('home.industries.constructionFeat2') || 'Fall Protection',
        t('home.industries.constructionFeat3') || 'Equipment Inspections',
        t('home.industries.constructionFeat4') || 'Contractor Management'
      ],
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #52c41a15, #52c41a30)',
      image: 'https://i.imgur.com/0kUXbFl.png'
    },
    {
      icon: <BuildOutlined />,
      title: t('home.industries.manufacturing') || 'Manufacturing',
      description: t('home.industries.manufacturingDesc') || 'Machine safety, ergonomics, chemical handling, and industrial hygiene',
      features: [
        t('home.industries.manufacturingFeat1') || 'Machine Safety',
        t('home.industries.manufacturingFeat2') || 'Ergonomics',
        t('home.industries.manufacturingFeat3') || 'Chemical Handling',
        t('home.industries.manufacturingFeat4') || 'Industrial Hygiene'
      ],
      color: '#722ed1',
      gradient: 'linear-gradient(135deg, #722ed115, #722ed130)',
      image: 'https://i.imgur.com/3tTRi3B.png'
    },
    {
      icon: <BlockOutlined />,
      title: t('home.industries.maritime') || 'Maritime',
      description: t('home.industries.maritimeDesc') || 'Vessel safety, crew management, navigation safety, and ISM compliance',
      features: [
        t('home.industries.maritimeFeat1') || 'Vessel Safety',
        t('home.industries.maritimeFeat2') || 'Crew Management',
        t('home.industries.maritimeFeat3') || 'Navigation Safety',
        t('home.industries.maritimeFeat4') || 'ISM Compliance'
      ],
      color: '#13c2c2',
      gradient: 'linear-gradient(135deg, #13c2c215, #13c2c230)',
      image: 'https://i.imgur.com/PUPzRJA.png'
    },
    {
      icon: <CarOutlined />,
      title: t('home.industries.aviation') || 'Aviation',
      description: t('home.industries.aviationDesc') || 'Flight safety, ground operations, maintenance tracking, and regulatory compliance',
      features: [
        t('home.industries.aviationFeat1') || 'Flight Safety',
        t('home.industries.aviationFeat2') || 'Ground Operations',
        t('home.industries.aviationFeat3') || 'Maintenance Tracking',
        t('home.industries.aviationFeat4') || 'Regulatory Compliance'
      ],
      color: '#2f54eb',
      gradient: 'linear-gradient(135deg, #2f54eb15, #2f54eb30)',
      image: 'https://i.imgur.com/3BKnvMF.png'
    },
    {
      icon: <DatabaseOutlined />,
      title: t('home.industries.mining') || 'Mining',
      description: t('home.industries.miningDesc') || 'Geotechnical safety, ventilation monitoring, equipment tracking, and emergency response',
      features: [
        t('home.industries.miningFeat1') || 'Geotechnical Safety',
        t('home.industries.miningFeat2') || 'Ventilation',
        t('home.industries.miningFeat3') || 'Equipment Tracking',
        t('home.industries.miningFeat4') || 'Emergency Response'
      ],
      color: '#d4380d',
      gradient: 'linear-gradient(135deg, #d4380d15, #d4380d30)',
      image: 'https://i.imgur.com/JHlw888.png'
    },
    {
      icon: <CloudOutlined />,
      title: t('home.industries.chemical') || 'Chemical',
      description: t('home.industries.chemicalDesc') || 'Hazardous material management, spill prevention, process safety, and environmental compliance',
      features: [
        t('home.industries.chemicalFeat1') || 'HazMat Management',
        t('home.industries.chemicalFeat2') || 'Spill Prevention',
        t('home.industries.chemicalFeat3') || 'Process Safety',
        t('home.industries.chemicalFeat4') || 'Environmental Compliance'
      ],
      color: '#eb2f96',
      gradient: 'linear-gradient(135deg, #eb2f9615, #eb2f9630)',
      image: 'https://i.imgur.com/YLbcePe.png'
    }
  ];

  // Stats
  const stats = [
    { value: 99.5, suffix: '%', label: t('home.stats.complianceRate') || 'Compliance Rate', key: 'compliance' },
    { value: 65, suffix: '%', label: t('home.stats.timeSaved') || 'Time Saved', key: 'timeSaved' },
    { value: 24, suffix: '/7', label: t('home.stats.monitoring') || '24/7 Monitoring', key: 'monitoring' },
    { value: 8, suffix: '+', label: t('home.stats.industriesServed') || 'Industries Served', key: 'industries' },
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
      icon: <SafetyCertificateOutlined />,
      title: t('home.benefits.compliance.title') || 'Reduce Compliance Risks by 99%',
      description: t('home.benefits.compliance.desc') || 'Stay ahead of regulatory changes with automated compliance tracking and real-time alerts'
    },
    {
      icon: <RobotOutlined />,
      title: t('home.benefits.ai.title') || 'AI-Powered Risk Prediction',
      description: t('home.benefits.ai.desc') || 'Predict and prevent incidents before they happen with advanced machine learning algorithms'
    },
    {
      icon: <TeamOutlined />,
      title: t('home.benefits.team.title') || 'Improve Team Coordination',
      description: t('home.benefits.team.desc') || 'Assign tasks, track progress, and ensure accountability across your entire safety team'
    },
    {
      icon: <LineChartOutlined />,
      title: t('home.benefits.data.title') || 'Data-Driven Decisions',
      description: t('home.benefits.data.desc') || 'Make informed decisions with comprehensive analytics, predictive modeling, and detailed reporting'
    }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: t('home.testimonials.healthcare.quote') || "SafeTrack Pro transformed our safety management across 12 hospitals. The AI insights helped us reduce incidents by 45%.",
      author: t('home.testimonials.healthcare.author') || "Sarah Johnson",
      role: t('home.testimonials.healthcare.role') || "Safety Director, Healthcare Network",
      industry: t('home.testimonials.healthcare.industry') || "Healthcare"
    },
    {
      quote: t('home.testimonials.oilGas.quote') || "The permit-to-work system and real-time monitoring have been game-changers for our offshore operations.",
      author: t('home.testimonials.oilGas.author') || "Michael Chen",
      role: t('home.testimonials.oilGas.role') || "HSE Manager, Oil & Gas Corp",
      industry: t('home.testimonials.oilGas.industry') || "Oil & Gas"
    },
    {
      quote: t('home.testimonials.construction.quote') || "Equipment inspection tracking and contractor management saved us countless hours and improved site safety significantly.",
      author: t('home.testimonials.construction.author') || "David Rodriguez",
      role: t('home.testimonials.construction.role') || "Safety Manager, Construction Co",
      industry: t('home.testimonials.construction.industry') || "Construction"
    },
    {
      quote: t('home.testimonials.manufacturing.quote') || "The predictive maintenance alerts prevented multiple equipment failures in our manufacturing plants.",
      author: t('home.testimonials.manufacturing.author') || "Emily Watson",
      role: t('home.testimonials.manufacturing.role') || "Plant Manager, Manufacturing Inc",
      industry: t('home.testimonials.manufacturing.industry') || "Manufacturing"
    },
    {
      quote: t('home.testimonials.maritime.quote') || "Vessel safety compliance and crew training tracking have never been easier.",
      author: t('home.testimonials.maritime.author') || "Capt. James Wilson",
      role: t('home.testimonials.maritime.role') || "Fleet Safety Officer, Maritime Group",
      industry: t('home.testimonials.maritime.industry') || "Maritime"
    },
    {
      quote: t('home.testimonials.mining.quote') || "The geotechnical monitoring and emergency response features are outstanding for our mining operations.",
      author: t('home.testimonials.mining.author') || "Robert Thompson",
      role: t('home.testimonials.mining.role') || "Safety Superintendent, Mining Co",
      industry: t('home.testimonials.mining.industry') || "Mining"
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
      description: t('home.pricing.enterprise.description') || 'For large enterprises and multi-site operations',
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
              
              {/* ✅ THIS IS THE ONLY H1 ON THE PAGE */}
              <h1 className="hero-title animate-fade-in">
                The New Standard in <br />
                <span className="gradient-text">Industrial Safety</span>
              </h1>
              
              <p className="hero-description animate-fade-in-delay-2">
                AI-powered safety management platform for healthcare, oil & gas, construction, 
                manufacturing, and more. Achieve 99.5% compliance with real-time monitoring.
              </p>
              
              <div className="hero-features animate-fade-in-delay-3">
                <span className="feature-tag"><SafetyCertificateOutlined /> Compliance</span>
                <span className="feature-tag"><RobotOutlined /> AI Analysis</span>
                <span className="feature-tag"><DashboardOutlined /> Real-time</span>
                <span className="feature-tag"><FileTextOutlined /> Reporting</span>
                <span className="feature-tag"><VideoCameraOutlined /> Camera AI</span>
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
                    <span className="badge-icon" style={{ color: badge.color }}>{badge.icon}</span>
                    <span className="badge-label">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hero-visual animate-slide-in-right">
              <div className="hero-carousel-container">
                <div className="carousel-track" style={{ transform: `translateX(-${activeSlide * 20}%)` }}>
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
           TRUST SECTION
           ============================================ */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon"><VerifiedOutlined /></div>
              <div className="trust-content">
                <h4>Transparent Development</h4>
                <p>We believe in open communication. Track our progress, see our roadmap, and help shape the future of SafeTrack Pro.</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><SecurityScanOutlined /></div>
              <div className="trust-content">
                <h4>Enterprise-Grade Security</h4>
                <p>ISO 27001 and SOC2 compliant. We take your data security and privacy seriously from day one.</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><TeamOutlined /></div>
              <div className="trust-content">
                <h4>Built for Your Industry</h4>
                <p>8+ industries supported with specialized modules. We understand your safety challenges.</p>
              </div>
            </div>
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
           INDUSTRIES SECTION - USING H2
           ============================================ */}
      <section className="industries-section" id="industries">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Solutions</span>
            <h2 className="section-title">Tailored for Every <span className="gradient-text">Industry</span></h2>
            <p className="section-subtitle">
              AI-powered safety management solutions designed for diverse industrial sectors
            </p>
          </div>
          
          <Row gutter={[24, 24]}>
            {industries.map((industry, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
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
                      boxShadow: hoveredIndustry === index ? `0 20px 40px ${industry.color}25` : 'none'
                    }}
                  >
                    <div className="industry-image-wrapper">
                      <img 
                        src={industry.image} 
                        alt={industry.title}
                        className="industry-image"
                        loading="lazy"
                      />
                      <div className="industry-icon-overlay" style={{ background: industry.gradient, color: industry.color }}>
                        {React.cloneElement(industry.icon, { style: { fontSize: 28, color: industry.color } })}
                      </div>
                    </div>
                    <h4>{industry.title}</h4>
                    <p className="industry-description">{industry.description}</p>
                    <div className="industry-features">
                      {industry.features.map((feat, idx) => (
                        <span key={idx} className="industry-feature-tag" style={{ background: `${industry.color}15`, color: industry.color }}>
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           FEATURES SECTION - USING H2
           ============================================ */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Capabilities</span>
            <h2 className="section-title">Enterprise-Grade <span className="gradient-text">Features</span></h2>
            <p className="section-subtitle">
              Everything you need for comprehensive safety management across all industries
            </p>
          </div>
          
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <div className="feature-card" style={{ borderTop: `4px solid ${feature.color}` }}>
                  <div className="feature-icon" style={{ background: feature.color + '25', color: feature.color }}>
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
           BENEFITS SECTION - USING H2
           ============================================ */}
      <section className="benefits-section">
        <div className="container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="benefits-content">
                <span className="section-tag">Why Choose Us</span>
                <h2>Built for the <span className="gradient-text">Future of Safety</span></h2>
                
                {benefits.map((benefit, index) => (
                  <div className="benefit-item" key={index}>
                    <div className="benefit-icon">
                      {benefit.icon}
                    </div>
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
                    <SafetyCertificateOutlined />
                    <span>99% Compliance</span>
                  </div>
                  <div className="floating-card card-2">
                    <RobotOutlined />
                    <span>AI Risk Prediction</span>
                  </div>
                  <div className="floating-card card-3">
                    <BarChartOutlined />
                    <span>65% Time Saved</span>
                  </div>
                  <div className="floating-card card-4">
                    <GlobalOutlined />
                    <span>8+ Industries</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ============================================
           TESTIMONIALS SECTION - USING H2
           ============================================ */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Trusted by <span className="gradient-text">Industry Leaders</span></h2>
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
                      <span key={i} className="star">★</span>
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
           PRICING SECTION - USING H2
           ============================================ */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">Choose Your <span className="gradient-text">Plan</span></h2>
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
           CTA SECTION - USING H2
           ============================================ */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <span className="cta-tag">Get Started</span>
              <h2>Ready to Transform Your <span className="gradient-text">Safety Management</span>?</h2>
              <p className="cta-description">
                Join thousands of organizations across 8+ industries that trust SafeTrack Pro for their safety compliance needs.
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
                <span>✓ No credit card required</span>
                <span>✓ Free 14-day trial</span>
                <span>✓ 24/7 support</span>
                <span>✓ ISO 27001 Certified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePage;