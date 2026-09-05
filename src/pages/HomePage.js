import React from 'react';
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
  MobileOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import './HomePage.css';

const { Title, Text, Paragraph } = Typography;

function HomePage() {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();

  // Core Features - Industry Agnostic
  const features = [
    {
      icon: <SafetyCertificateOutlined />,
      title: t('home.features.safetyCompliance'),
      description: t('home.features.safetyComplianceDesc')
    },
    {
      icon: <RobotOutlined />,
      title: t('home.features.aiRiskAssessment'),
      description: t('home.features.aiRiskAssessmentDesc')
    },
    {
      icon: <DashboardOutlined />,
      title: t('home.features.realTimeDashboard'),
      description: t('home.features.realTimeDashboardDesc')
    },
    {
      icon: <FileTextOutlined />,
      title: t('home.features.smartDocumentManagement'),
      description: t('home.features.smartDocumentManagementDesc')
    },
    {
      icon: <BarChartOutlined />,
      title: t('home.features.advancedAnalytics'),
      description: t('home.features.advancedAnalyticsDesc')
    },
    {
      icon: <TeamOutlined />,
      title: t('home.features.teamCollaboration'),
      description: t('home.features.teamCollaborationDesc')
    },
    {
      icon: <MobileOutlined />,
      title: t('home.features.mobileFirst'),
      description: t('home.features.mobileFirstDesc')
    },
    {
      icon: <ApiOutlined />,
      title: t('home.features.apiIntegration'),
      description: t('home.features.apiIntegrationDesc')
    }
  ];

  // Industry-Specific Solutions
  const industries = [
    {
      icon: <MedicineBoxOutlined />,
      title: t('home.industries.healthcare'),
      description: t('home.industries.healthcareDesc'),
      features: [
        t('home.industries.healthcareFeat1'),
        t('home.industries.healthcareFeat2'),
        t('home.industries.healthcareFeat3'),
        t('home.industries.healthcareFeat4')
      ],
      color: '#1890ff'
    },
    {
      icon: <FireOutlined />,
      title: t('home.industries.oilGas'),
      description: t('home.industries.oilGasDesc'),
      features: [
        t('home.industries.oilGasFeat1'),
        t('home.industries.oilGasFeat2'),
        t('home.industries.oilGasFeat3'),
        t('home.industries.oilGasFeat4')
      ],
      color: '#fa8c16'
    },
    {
      icon: <BuildOutlined />,
      title: t('home.industries.construction'),
      description: t('home.industries.constructionDesc'),
      features: [
        t('home.industries.constructionFeat1'),
        t('home.industries.constructionFeat2'),
        t('home.industries.constructionFeat3'),
        t('home.industries.constructionFeat4')
      ],
      color: '#52c41a'
    },
    {
      icon: <BuildOutlined />,
      title: t('home.industries.manufacturing'),
      description: t('home.industries.manufacturingDesc'),
      features: [
        t('home.industries.manufacturingFeat1'),
        t('home.industries.manufacturingFeat2'),
        t('home.industries.manufacturingFeat3'),
        t('home.industries.manufacturingFeat4')
      ],
      color: '#722ed1'
    },
    {
      icon: <BlockOutlined />,
      title: t('home.industries.maritime'),
      description: t('home.industries.maritimeDesc'),
      features: [
        t('home.industries.maritimeFeat1'),
        t('home.industries.maritimeFeat2'),
        t('home.industries.maritimeFeat3'),
        t('home.industries.maritimeFeat4')
      ],
      color: '#13c2c2'
    },
    {
      icon: <CarOutlined />,
      title: t('home.industries.aviation'),
      description: t('home.industries.aviationDesc'),
      features: [
        t('home.industries.aviationFeat1'),
        t('home.industries.aviationFeat2'),
        t('home.industries.aviationFeat3'),
        t('home.industries.aviationFeat4')
      ],
      color: '#2f54eb'
    },
    {
      icon: <DatabaseOutlined />,
      title: t('home.industries.mining'),
      description: t('home.industries.miningDesc'),
      features: [
        t('home.industries.miningFeat1'),
        t('home.industries.miningFeat2'),
        t('home.industries.miningFeat3'),
        t('home.industries.miningFeat4')
      ],
      color: '#d4380d'
    },
    {
      icon: <CloudOutlined />,
      title: t('home.industries.chemical'),
      description: t('home.industries.chemicalDesc'),
      features: [
        t('home.industries.chemicalFeat1'),
        t('home.industries.chemicalFeat2'),
        t('home.industries.chemicalFeat3'),
        t('home.industries.chemicalFeat4')
      ],
      color: '#eb2f96'
    }
  ];

  // Stats with translations
  const stats = [
    { value: 99.5, suffix: '%', label: t('home.stats.complianceRate') },
    { value: 65, suffix: '%', label: t('home.stats.timeSaved') },
    { value: 24, suffix: '/7', label: t('home.stats.monitoring') },
    { value: 8, suffix: '+', label: t('home.stats.industriesServed') },
    { value: 5000, suffix: '+', label: t('home.stats.facilitiesProtected') },
    { value: 100, suffix: 'K+', label: t('home.stats.incidentsPrevented') }
  ];

  // Testimonials by Industry - Using translations
  const testimonials = [
    {
      quote: t('home.testimonials.healthcare.quote'),
      author: t('home.testimonials.healthcare.author'),
      role: t('home.testimonials.healthcare.role'),
      industry: t('home.testimonials.healthcare.industry')
    },
    {
      quote: t('home.testimonials.oilGas.quote'),
      author: t('home.testimonials.oilGas.author'),
      role: t('home.testimonials.oilGas.role'),
      industry: t('home.testimonials.oilGas.industry')
    },
    {
      quote: t('home.testimonials.construction.quote'),
      author: t('home.testimonials.construction.author'),
      role: t('home.testimonials.construction.role'),
      industry: t('home.testimonials.construction.industry')
    },
    {
      quote: t('home.testimonials.manufacturing.quote'),
      author: t('home.testimonials.manufacturing.author'),
      role: t('home.testimonials.manufacturing.role'),
      industry: t('home.testimonials.manufacturing.industry')
    },
    {
      quote: t('home.testimonials.maritime.quote'),
      author: t('home.testimonials.maritime.author'),
      role: t('home.testimonials.maritime.role'),
      industry: t('home.testimonials.maritime.industry')
    },
    {
      quote: t('home.testimonials.mining.quote'),
      author: t('home.testimonials.mining.author'),
      role: t('home.testimonials.mining.role'),
      industry: t('home.testimonials.mining.industry')
    }
  ];

  // Pricing Plans with translations
  const pricingPlans = [
    {
      id: 'starter',
      name: t('home.pricing.starter.name'),
      price: t('home.pricing.starter.price'),
      period: t('home.pricing.starter.period'),
      description: t('home.pricing.starter.description'),
      features: [
        t('home.pricing.starter.feature1'),
        t('home.pricing.starter.feature2'),
        t('home.pricing.starter.feature3'),
        t('home.pricing.starter.feature4'),
        t('home.pricing.starter.feature5'),
        t('home.pricing.starter.feature6'),
        t('home.pricing.starter.feature7')
      ],
      link: '/signup',
      buttonText: t('home.pricing.starter.buttonText')
    },
    {
      id: 'professional',
      name: t('home.pricing.professional.name'),
      price: t('home.pricing.professional.price'),
      period: t('home.pricing.professional.period'),
      description: t('home.pricing.professional.description'),
      features: [
        t('home.pricing.professional.feature1'),
        t('home.pricing.professional.feature2'),
        t('home.pricing.professional.feature3'),
        t('home.pricing.professional.feature4'),
        t('home.pricing.professional.feature5'),
        t('home.pricing.professional.feature6'),
        t('home.pricing.professional.feature7'),
        t('home.pricing.professional.feature8')
      ],
      link: '/subscription',
      buttonText: t('home.pricing.professional.buttonText'),
      popular: true
    },
    {
      id: 'enterprise',
      name: t('home.pricing.enterprise.name'),
      price: t('home.pricing.enterprise.price'),
      period: t('home.pricing.enterprise.period'),
      description: t('home.pricing.enterprise.description'),
      features: [
        t('home.pricing.enterprise.feature1'),
        t('home.pricing.enterprise.feature2'),
        t('home.pricing.enterprise.feature3'),
        t('home.pricing.enterprise.feature4'),
        t('home.pricing.enterprise.feature5'),
        t('home.pricing.enterprise.feature6'),
        t('home.pricing.enterprise.feature7'),
        t('home.pricing.enterprise.feature8'),
        t('home.pricing.enterprise.feature9'),
        t('home.pricing.enterprise.feature10')
      ],
      link: '/contact',
      buttonText: t('home.pricing.enterprise.buttonText')
    }
  ];

  // Quick Features for Overview Section - Using translations
  const quickFeatures = [
    {
      title: t('home.quickFeatures.compliance.title'),
      description: t('home.quickFeatures.compliance.desc'),
      link: '/features#compliance'
    },
    {
      title: t('home.quickFeatures.aiRisk.title'),
      description: t('home.quickFeatures.aiRisk.desc'),
      link: '/features#ai'
    },
    {
      title: t('home.quickFeatures.incident.title'),
      description: t('home.quickFeatures.incident.desc'),
      link: '/features#incident'
    },
    {
      title: t('home.quickFeatures.training.title'),
      description: t('home.quickFeatures.training.desc'),
      link: '/features#training'
    },
    {
      title: t('home.quickFeatures.audit.title'),
      description: t('home.quickFeatures.audit.desc'),
      link: '/features#audit'
    },
    {
      title: t('home.quickFeatures.equipment.title'),
      description: t('home.quickFeatures.equipment.desc'),
      link: '/features#equipment'
    },
    {
      title: t('home.quickFeatures.environmental.title'),
      description: t('home.quickFeatures.environmental.desc'),
      link: '/features#environmental'
    },
    {
      title: t('home.quickFeatures.contractor.title'),
      description: t('home.quickFeatures.contractor.desc'),
      link: '/features#contractor'
    }
  ];

  // Benefit items with translations
  const benefits = [
    {
      icon: <SafetyCertificateOutlined />,
      title: t('home.benefits.compliance.title'),
      description: t('home.benefits.compliance.desc')
    },
    {
      icon: <RobotOutlined />,
      title: t('home.benefits.ai.title'),
      description: t('home.benefits.ai.desc')
    },
    {
      icon: <TeamOutlined />,
      title: t('home.benefits.team.title'),
      description: t('home.benefits.team.desc')
    },
    {
      icon: <LineChartOutlined />,
      title: t('home.benefits.data.title'),
      description: t('home.benefits.data.desc')
    }
  ];

  return (
    <div className={`home-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="welcome-badge">
              {t('home.welcomeBadge')}
            </div>
            <Title level={1} className="hero-title">
              {t('home.hero.title')}
            </Title>
            <Title level={3} className="hero-subtitle">
              {t('home.hero.subtitle')}
            </Title>
            <Paragraph className="hero-description">
              {t('home.hero.description')}
            </Paragraph>
            
            <div className="hero-features">
              <Space size={[12, 12]} wrap>
                <div className="feature-tag">
                  <SafetyCertificateOutlined /> {t('home.hero.tags.compliance')}
                </div>
                <div className="feature-tag">
                  <RobotOutlined /> {t('home.hero.tags.ai')}
                </div>
                <div className="feature-tag">
                  <DashboardOutlined /> {t('home.hero.tags.dashboard')}
                </div>
                <div className="feature-tag">
                  <FileTextOutlined /> {t('home.hero.tags.reporting')}
                </div>
                <div className="feature-tag">
                  <MobileOutlined /> {t('home.hero.tags.mobile')}
                </div>
              </Space>
            </div>
            
            <div className="hero-actions">
              <Space size="large">
                <Button type="primary" size="large" href="/signup" className="cta-button">
                  {t('home.hero.cta')} <ArrowRightOutlined />
                </Button>
                <Button size="large" href="/subscription" className="secondary-btn">
                  {t('home.hero.viewPlans')}
                </Button>
              </Space>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="dashboard-showcase">
              <div className="showcase-header">
                <div className="showcase-dots">
                  <span className="red"></span>
                  <span className="yellow"></span>
                  <span className="green"></span>
                </div>
                <div className="showcase-title">{t('home.hero.dashboardTitle')}</div>
              </div>
              <div className="showcase-content">
                <div className="main-widget"></div>
                <div className="side-widgets">
                  <div className="widget-small"></div>
                  <div className="widget-small"></div>
                  <div className="widget-medium"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <Row gutter={[24, 24]}>
            {stats.map((stat, index) => (
              <Col xs={12} sm={8} md={4} key={index}>
                <div className="stat-card">
                  <Statistic
                    value={stat.value}
                    suffix={stat.suffix}
                    className="stat-number"
                  />
                  <Text className="stat-label">{stat.label}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Industries We Serve Section */}
      <section className="industries-section">
        <div className="container">
          <div className="section-header">
            <Title level={2}>{t('home.industries.title')}</Title>
            <Text className="section-subtitle">
              {t('home.industries.subtitle')}
            </Text>
          </div>
          
          <Row gutter={[24, 24]}>
            {industries.map((industry, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="industry-card" hoverable>
                  <div className="industry-icon" style={{ background: `linear-gradient(135deg, ${industry.color}20, ${industry.color}40)` }}>
                    {React.cloneElement(industry.icon, { style: { color: industry.color, fontSize: 32 } })}
                  </div>
                  <Title level={4}>{industry.title}</Title>
                  <Text className="industry-description">{industry.description}</Text>
                  <div className="industry-features">
                    {industry.features.map((feature, idx) => (
                      <Tag key={idx} className="industry-feature-tag">{feature}</Tag>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features-preview-section">
        <div className="container">
          <div className="section-header">
            <Title level={2}>{t('home.quickFeatures.title')}</Title>
            <Text className="section-subtitle">
              {t('home.quickFeatures.subtitle')}
            </Text>
          </div>
          
          <Row gutter={[24, 24]}>
            {quickFeatures.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  className="quick-feature-card" 
                  hoverable
                  actions={[
                    <Link to={feature.link}>{t('home.quickFeatures.learnMore')} <ArrowRightOutlined /></Link>
                  ]}
                >
                  <div className="quick-feature-icon">
                    <CheckCircleOutlined />
                  </div>
                  <Title level={4}>{feature.title}</Title>
                  <Text className="quick-feature-description">{feature.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
          
          <div className="features-preview-cta">
            <Button type="default" size="large" href="/features">
              {t('home.quickFeatures.exploreAll')} <ArrowRightOutlined />
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <Title level={2}>{t('home.features.title')}</Title>
            <Text className="section-subtitle">
              {t('home.features.subtitle')}
            </Text>
          </div>
          
          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="feature-card" hoverable>
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <Title level={4}>{feature.title}</Title>
                  <Text className="feature-description">{feature.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-preview-section">
        <div className="container">
          <div className="section-header">
            <Title level={2}>{t('home.pricing.title')}</Title>
            <Text className="section-subtitle">
              {t('home.pricing.subtitle')}
            </Text>
          </div>
          
          <Row gutter={[24, 24]} justify="center">
            {pricingPlans.map((plan) => (
              <Col xs={24} md={12} lg={8} key={plan.id}>
                <Card 
                  className={`pricing-preview-card ${plan.popular ? 'popular' : ''}`}
                  hoverable
                >
                  {plan.popular && (
                    <div className="popular-badge">
                      <Tag color="blue">{t('home.pricing.popular')}</Tag>
                    </div>
                  )}
                  
                  <div className="pricing-header">
                    <Title level={3}>{plan.name}</Title>
                    <div className="price">
                      <span className="price-amount">{plan.price}</span>
                      <span className="price-period">{plan.period}</span>
                    </div>
                    <Text className="price-description">{plan.description}</Text>
                  </div>
                  
                  <div className="pricing-features">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="pricing-feature">
                        <CheckCircleOutlined />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    type={plan.popular ? 'primary' : 'default'} 
                    size="large" 
                    href={plan.link}
                    block
                    className="pricing-cta"
                    icon={plan.id === 'enterprise' ? <RocketOutlined /> : null}
                  >
                    {plan.buttonText}
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
          
          <div className="pricing-preview-cta">
            <Button type="default" size="large" href="/subscription">
              {t('home.pricing.viewFullDetails')} <ArrowRightOutlined />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose SafeTrack Pro Section */}
      <section className="benefits-section">
        <div className="container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="benefits-content">
                <Title level={2}>{t('home.benefits.title')}</Title>
                
                {benefits.map((benefit, index) => (
                  <div className="benefit-item" key={index}>
                    <div className="benefit-icon">
                      {benefit.icon}
                    </div>
                    <div className="benefit-text">
                      <Title level={5}>{benefit.title}</Title>
                      <Text>{benefit.description}</Text>
                    </div>
                  </div>
                ))}
                
                <Button type="primary" size="large" href="/features" className="benefits-cta">
                  {t('home.benefits.exploreAll')}
                </Button>
              </div>
            </Col>
            
            <Col xs={24} lg={12}>
              <div className="benefits-visual">
                <div className="floating-cards">
                  <div className="floating-card card-1">
                    <SafetyCertificateOutlined />
                    <span>{t('home.benefits.floating.compliance')}</span>
                  </div>
                  <div className="floating-card card-2">
                    <RobotOutlined />
                    <span>{t('home.benefits.floating.ai')}</span>
                  </div>
                  <div className="floating-card card-3">
                    <BarChartOutlined />
                    <span>{t('home.benefits.floating.timeSaved')}</span>
                  </div>
                  <div className="floating-card card-4">
                    <GlobalOutlined />
                    <span>{t('home.benefits.floating.industries')}</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <Title level={2}>{t('home.testimonials.title')}</Title>
            <Text className="section-subtitle">
              {t('home.testimonials.subtitle')}
            </Text>
          </div>
          
          <Row gutter={[24, 24]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card className="testimonial-card">
                  <div className="testimonial-content">
                    <div className="quote-icon">"</div>
                    <Paragraph className="testimonial-text">
                      {testimonial.quote}
                    </Paragraph>
                    <div className="testimonial-author">
                      <Text strong>{testimonial.author}</Text>
                      <Text type="secondary">{testimonial.role}</Text>
                      <Tag className="industry-tag">{testimonial.industry}</Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <Card className="cta-card">
            <div className="cta-content">
              <Title level={2}>{t('home.cta.title')}</Title>
              <Text className="cta-text">
                {t('home.cta.description')}
              </Text>
              <div className="cta-buttons">
                <Button type="primary" size="large" href="/signup" className="cta-primary-btn">
                  {t('home.cta.startTrial')}
                </Button>
                <Button size="large" href="/subscription" className="cta-secondary-btn">
                  {t('home.cta.viewPlans')}
                </Button>
                <Button size="large" href="/contact" className="cta-secondary-btn">
                  {t('home.cta.contactSales')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon">
                  <div className="logo-symbol">STP</div>
                </div>
                <div className="logo-text">
                  <span className="logo-main">{t('home.footer.brand')}</span>
                  <span className="logo-subtitle">{t('home.footer.studio')}</span>
                </div>
              </div>
              <Text className="footer-description">
                {t('home.footer.description')}
              </Text>
              <div className="footer-social">
                <a href="#" aria-label="Twitter">Twitter</a>
                <a href="#" aria-label="LinkedIn">LinkedIn</a>
                <a href="#" aria-label="Facebook">Facebook</a>
              </div>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <Title level={5}>{t('home.footer.product')}</Title>
                <a href="#features">{t('home.footer.features')}</a>
                <a href="/subscription">{t('home.footer.pricing')}</a>
                <a href="/demo">{t('home.footer.demo')}</a>
                <a href="/ai-documents">{t('home.footer.aiDocs')}</a>
              </div>
              
              <div className="link-group">
                <Title level={5}>{t('home.footer.industries')}</Title>
                <a href="/industries/healthcare">{t('home.industries.healthcare')}</a>
                <a href="/industries/oil-gas">{t('home.industries.oilGas')}</a>
                <a href="/industries/construction">{t('home.industries.construction')}</a>
                <a href="/industries/manufacturing">{t('home.industries.manufacturing')}</a>
                <a href="/industries/aviation">{t('home.industries.aviation')}</a>
                <a href="/industries/maritime">{t('home.industries.maritime')}</a>
              </div>
              
              <div className="link-group">
                <Title level={5}>{t('home.footer.resources')}</Title>
                <a href="/docs">{t('home.footer.documentation')}</a>
                <a href="/blog">{t('home.footer.blog')}</a>
                <a href="/guides">{t('home.footer.guides')}</a>
                <a href="/support">{t('home.footer.support')}</a>
                <a href="/api">{t('home.footer.apiDocs')}</a>
              </div>
              
              <div className="link-group">
                <Title level={5}>{t('home.footer.company')}</Title>
                <a href="/about">{t('home.footer.about')}</a>
                <a href="/careers">{t('home.footer.careers')}</a>
                <a href="/contact">{t('home.footer.contact')}</a>
                <a href="/privacy">{t('home.footer.privacy')}</a>
                <a href="/terms">{t('home.footer.terms')}</a>
              </div>
            </div>
          </div>
          
          <Divider className="footer-divider" />
          
          <div className="footer-bottom">
            <Text>{t('home.footer.copyright')}</Text>
            <div className="footer-bottom-links">
              <a href="/terms">{t('home.footer.termsService')}</a>
              <a href="/privacy">{t('home.footer.privacyPolicy')}</a>
              <a href="/cookies">{t('home.footer.cookiePolicy')}</a>
              <a href="/sla">{t('home.footer.sla')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;