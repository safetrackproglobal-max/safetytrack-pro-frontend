// src/pages/FeaturesPage.js
import React from 'react';
import { Row, Col, Card, Typography, Tag, Space, Button, Tabs } from 'antd';
import { 
  SafetyCertificateOutlined, 
  TeamOutlined, 
  DashboardOutlined, 
  FileTextOutlined,
  BarChartOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  FireOutlined,
  BuildOutlined,
  CarOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ApiOutlined,
  MobileOutlined,
  SecurityScanOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  LockOutlined,
  WarningOutlined,
  LineChartOutlined,
  AuditOutlined,
  CalendarOutlined,
  MailOutlined,
  BellOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  UserOutlined,
  ProfileOutlined,
  TableOutlined,
  AreaChartOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  HeatMapOutlined
} from '@ant-design/icons';
import './FeaturesPage.css';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

function FeaturesPage() {
  // Core Features
  const coreFeatures = [
    {
      icon: <RobotOutlined />,
      title: "AI-Powered Document Analysis",
      description: "Automated analysis of safety documents with entity recognition and compliance scoring",
      details: "Upload PDF, DOCX, or images. Our AI extracts entities, assesses risks, and checks regulatory compliance across all industries.",
      benefits: ["95% accuracy in entity extraction", "Real-time compliance scoring", "Multi-language support"]
    },
    {
      icon: <WarningOutlined />,
      title: "Incident Management",
      description: "Track and manage safety incidents with real-time reporting",
      details: "Report incidents, track investigations, manage corrective actions, and analyze trends across your organization.",
      benefits: ["Real-time incident reporting", "Automated investigation workflows", "Root cause analysis tools", "Corrective action tracking"]
    },
    {
      icon: <DashboardOutlined />,
      title: "Real-Time Dashboard",
      description: "Customizable dashboards with real-time safety metrics",
      details: "Monitor key safety indicators, incident trends, compliance status, and risk levels at a glance.",
      benefits: ["Customizable widgets", "Real-time data updates", "Export capabilities", "Mobile responsive"]
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: "Compliance Management",
      description: "Automated compliance tracking across all regulations",
      details: "Stay compliant with OSHA, ISO, FDA, EPA, and industry-specific regulations with automated tracking and alerts.",
      benefits: ["Regulatory update alerts", "Compliance calendar", "Documentation management", "Audit trails"]
    },
    {
      icon: <BarChartOutlined />,
      title: "Advanced Analytics",
      description: "Predictive analytics and trend analysis",
      details: "Gain actionable insights with predictive modeling, trend analysis, and custom reporting.",
      benefits: ["Predictive risk modeling", "Trend analysis", "Custom report builder", "Data visualization"]
    },
    {
      icon: <TeamOutlined />,
      title: "Team Collaboration",
      description: "Seamless collaboration across departments",
      details: "Assign tasks, track progress, and ensure accountability across your entire safety team.",
      benefits: ["Role-based access", "Task assignment", "Progress tracking", "Real-time notifications"]
    },
    {
      icon: <MobileOutlined />,
      title: "Mobile-First Platform",
      description: "Access safety data from anywhere",
      details: "Report incidents, conduct audits, and access safety data from any device with our responsive mobile interface.",
      benefits: ["Offline mode", "Mobile reporting", "Push notifications", "Cross-platform support"]
    },
    {
      icon: <ApiOutlined />,
      title: "API Integration",
      description: "Connect with existing systems",
      details: "Integrate with ERP, CMMS, IoT sensors, and other systems through our comprehensive REST API.",
      benefits: ["RESTful API", "Webhook support", "Custom integrations", "Real-time sync"]
    }
  ];

  // Industry-Specific Features
  const industryFeatures = {
    healthcare: [
      {
        title: "Patient Safety Monitoring",
        description: "Track patient falls, medication errors, and hospital-acquired conditions",
        icon: <MedicineBoxOutlined />
      },
      {
        title: "Infection Control",
        description: "Monitor infection rates, hand hygiene compliance, and outbreak management",
        icon: <SafetyCertificateOutlined />
      },
      {
        title: "Medical Equipment Safety",
        description: "Track equipment inspections, maintenance, and recalls",
        icon: <DatabaseOutlined />
      },
      {
        title: "Staff Safety",
        description: "Monitor workplace violence, needlestick injuries, and ergonomic risks",
        icon: <TeamOutlined />
      },
      {
        title: "Biohazard Management",
        description: "Track sharps disposal, waste management, and exposure incidents",
        icon: <WarningOutlined />
      },
      {
        title: "Emergency Preparedness",
        description: "Plan and track emergency drills, response times, and resource allocation",
        icon: <SecurityScanOutlined />
      }
    ],
    oilgas: [
      {
        title: "Process Safety Management",
        description: "HAZOP studies, PHA tracking, and mechanical integrity",
        icon: <FireOutlined />
      },
      {
        title: "Permit to Work",
        description: "Digital work permits, isolation management, and gas testing",
        icon: <SafetyCertificateOutlined />
      },
      {
        title: "Asset Integrity",
        description: "Corrosion monitoring, inspection tracking, and maintenance scheduling",
        icon: <DatabaseOutlined />
      },
      {
        title: "Emergency Response",
        description: "Oil spill response, fire drill management, and evacuation planning",
        icon: <ThunderboltOutlined />
      },
      {
        title: "Contractor Management",
        description: "Vendor qualification, safety training tracking, and site access control",
        icon: <TeamOutlined />
      },
      {
        title: "Environmental Monitoring",
        description: "Emissions tracking, water quality, and waste management",
        icon: <CloudOutlined />
      }
    ],
    construction: [
      {
        title: "Site Safety Inspections",
        description: "Daily safety checks, hazard identification, and risk assessments",
        icon: <BuildOutlined />
      },
      {
        title: "Fall Protection",
        description: "Harness inspections, guardrail checks, and safety net monitoring",
        icon: <SafetyCertificateOutlined />
      },
      {
        title: "Equipment Safety",
        description: "Crane inspections, heavy equipment checks, and operator certifications",
        icon: <DatabaseOutlined />
      },
      {
        title: "Toolbox Talks",
        description: "Daily safety meetings, topic libraries, and attendance tracking",
        icon: <TeamOutlined />
      },
      {
        title: "Subcontractor Management",
        description: "Safety pre-qualification, training verification, and performance monitoring",
        icon: <UserOutlined />
      },
      {
        title: "Site Access Control",
        description: "Badge management, visitor tracking, and induction training",
        icon: <LockOutlined />
      }
    ],
    manufacturing: [
      {
        title: "Machine Safety",
        description: "Guard inspections, LOTO procedures, and safety device checks",
        icon: <BuildOutlined />
      },
      {
        title: "Industrial Hygiene",
        description: "Air quality monitoring, noise exposure, and chemical tracking",
        icon: <CloudOutlined />
      },
      {
        title: "Ergonomics",
        description: "Workstation assessments, lifting safety, and repetitive motion analysis",
        icon: <UserOutlined />
      },
      {
        title: "Quality & Safety Integration",
        description: "ISO compliance, quality incident tracking, and CAPA management",
        icon: <CheckCircleOutlined />
      },
      {
        title: "Fleet Safety",
        description: "Vehicle inspections, driver training, and accident tracking",
        icon: <CarOutlined />
      },
      {
        title: "PPE Management",
        description: "Inventory tracking, expiration monitoring, and distribution logs",
        icon: <SafetyCertificateOutlined />
      }
    ],
    maritime: [
      {
        title: "Vessel Safety Management",
        description: "ISM code compliance, vessel inspections, and crew safety",
        icon: <BuildOutlined />
      },
      {
        title: "Navigation Safety",
        description: "Chart updates, equipment checks, and passage planning",
        icon: <GlobalOutlined />
      },
      {
        title: "Crew Training",
        description: "STCW compliance, drill management, and certification tracking",
        icon: <TeamOutlined />
      },
      {
        title: "Cargo Safety",
        description: "Loading plans, stability calculations, and hazardous cargo management",
        icon: <DatabaseOutlined />
      },
      {
        title: "Port State Control",
        description: "Inspection preparation, deficiency tracking, and corrective actions",
        icon: <SecurityScanOutlined />
      },
      {
        title: "Environmental Compliance",
        description: "Ballast water management, emissions monitoring, and waste disposal",
        icon: <CloudOutlined />
      }
    ],
    aviation: [
      {
        title: "Flight Safety",
        description: "Incident reporting, risk assessment, and safety management systems",
        icon: <CarOutlined />
      },
      {
        title: "Ground Operations",
        description: "Ramp safety, vehicle operations, and ground handling inspections",
        icon: <BuildOutlined />
      },
      {
        title: "Maintenance Safety",
        description: "Aircraft inspections, tool control, and maintenance error prevention",
        icon: <DatabaseOutlined />
      },
      {
        title: "Regulatory Compliance",
        description: "FAA/EASA compliance, audit management, and documentation control",
        icon: <SafetyCertificateOutlined />
      },
      {
        title: "Training Management",
        description: "Pilot records, simulator training, and currency tracking",
        icon: <TeamOutlined />
      },
      {
        title: "Emergency Response",
        description: "Emergency procedures, evacuation drills, and crisis management",
        icon: <ThunderboltOutlined />
      }
    ]
  };

  // Additional Features
  const additionalFeatures = [
    {
      icon: <AuditOutlined />,
      title: "Audit Management",
      description: "Schedule, conduct, and track safety audits with mobile capabilities"
    },
    {
      icon: <CalendarOutlined />,
      title: "Training Management",
      description: "Track certifications, manage training programs, and ensure competency"
    },
    {
      icon: <BellOutlined />,
      title: "Real-time Alerts",
      description: "Instant notifications for incidents, compliance deadlines, and risk changes"
    },
    {
      icon: <FileTextOutlined />,
      title: "Document Control",
      description: "Version control, approval workflows, and secure document storage"
    },
    {
      icon: <DownloadOutlined />,
      title: "Automated Reporting",
      description: "Schedule and generate custom reports for stakeholders and regulators"
    },
    {
      icon: <UploadOutlined />,
      title: "Bulk Data Import",
      description: "Import historical data, assets, and records from existing systems"
    },
    {
      icon: <EyeOutlined />,
      title: "Real-time Monitoring",
      description: "IoT sensor integration for environmental and equipment monitoring"
    },
    {
      icon: <SettingOutlined />,
      title: "Custom Workflows",
      description: "Design custom approval workflows and business processes"
    },
    {
      icon: <ProfileOutlined />,
      title: "Risk Assessment",
      description: "Conduct risk assessments with built-in risk matrices and scoring"
    },
    {
      icon: <TableOutlined />,
      title: "Data Visualization",
      description: "Interactive charts, graphs, and heat maps for safety data"
    },
    {
      icon: <AreaChartOutlined />,
      title: "Trend Analysis",
      description: "Identify patterns and predict future incidents with analytics"
    },
    {
      icon: <PieChartOutlined />,
      title: "Dashboard Widgets",
      description: "Customizable widgets for personalized safety dashboards"
    }
  ];

  // Integration Features
  const integrations = [
    {
      name: "ERP Systems",
      description: "SAP, Oracle, Microsoft Dynamics",
      icon: <DatabaseOutlined />
    },
    {
      name: "CMMS",
      description: "Maintenance connection, asset tracking",
      icon: <SettingOutlined />
    },
    {
      name: "IoT Sensors",
      description: "Environmental monitoring, equipment sensors",
      icon: <CloudOutlined />
    },
    {
      name: "HR Systems",
      description: "Employee records, training data sync",
      icon: <TeamOutlined />
    },
    {
      name: "Access Control",
      description: "Badge systems, visitor management",
      icon: <LockOutlined />
    },
    {
      name: "Communication Tools",
      description: "Slack, Teams, email integration",
      icon: <MailOutlined />
    }
  ];

  return (
    <div className="features-page">
      <div className="container">
        {/* Hero Section */}
        <div className="features-hero">
          <Title level={1}>Complete Safety Management Platform</Title>
          <Paragraph className="hero-subtitle">
            Enterprise-grade features for every industry. AI-powered, fully customizable, and built for scale.
          </Paragraph>
        </div>

        {/* Core Features Section */}
        <section className="features-section">
          <div className="section-header">
            <Title level={2}>Core Platform Features</Title>
            <Paragraph>
              Powerful capabilities that power safety management across all industries
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {coreFeatures.map((feature, index) => (
              <Col xs={24} md={12} lg={6} key={index}>
                <Card className="feature-card-core" hoverable>
                  <div className="feature-icon-core">
                    {feature.icon}
                  </div>
                  <Title level={4}>{feature.title}</Title>
                  <Paragraph className="feature-description">{feature.description}</Paragraph>
                  <Paragraph className="feature-details">{feature.details}</Paragraph>
                  <div className="feature-benefits">
                    {feature.benefits.map((benefit, idx) => (
                      <Tag key={idx} className="benefit-tag">
                        <CheckCircleOutlined /> {benefit}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Industry Solutions Section */}
        <section className="industry-solutions-section">
          <div className="section-header">
            <Title level={2}>Industry-Specific Solutions</Title>
            <Paragraph>
              Tailored features for your industry's unique safety challenges
            </Paragraph>
          </div>

          <Tabs defaultActiveKey="healthcare" className="industry-tabs">
            <TabPane tab="Healthcare" key="healthcare">
              <Row gutter={[24, 24]}>
                {industryFeatures.healthcare.map((feature, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card className="industry-feature-card" hoverable>
                      <div className="industry-feature-icon healthcare-icon">
                        {feature.icon}
                      </div>
                      <Title level={4}>{feature.title}</Title>
                      <Text>{feature.description}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tab="Oil & Gas" key="oilgas">
              <Row gutter={[24, 24]}>
                {industryFeatures.oilgas.map((feature, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card className="industry-feature-card" hoverable>
                      <div className="industry-feature-icon oilgas-icon">
                        {feature.icon}
                      </div>
                      <Title level={4}>{feature.title}</Title>
                      <Text>{feature.description}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tab="Construction" key="construction">
              <Row gutter={[24, 24]}>
                {industryFeatures.construction.map((feature, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card className="industry-feature-card" hoverable>
                      <div className="industry-feature-icon construction-icon">
                        {feature.icon}
                      </div>
                      <Title level={4}>{feature.title}</Title>
                      <Text>{feature.description}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tab="Manufacturing" key="manufacturing">
              <Row gutter={[24, 24]}>
                {industryFeatures.manufacturing.map((feature, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card className="industry-feature-card" hoverable>
                      <div className="industry-feature-icon manufacturing-icon">
                        {feature.icon}
                      </div>
                      <Title level={4}>{feature.title}</Title>
                      <Text>{feature.description}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tab="Maritime" key="maritime">
              <Row gutter={[24, 24]}>
                {industryFeatures.maritime.map((feature, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card className="industry-feature-card" hoverable>
                      <div className="industry-feature-icon maritime-icon">
                        {feature.icon}
                      </div>
                      <Title level={4}>{feature.title}</Title>
                      <Text>{feature.description}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>

            <TabPane tab="Aviation" key="aviation">
              <Row gutter={[24, 24]}>
                {industryFeatures.aviation.map((feature, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card className="industry-feature-card" hoverable>
                      <div className="industry-feature-icon aviation-icon">
                        {feature.icon}
                      </div>
                      <Title level={4}>{feature.title}</Title>
                      <Text>{feature.description}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </TabPane>
          </Tabs>
        </section>

        {/* Additional Features Grid */}
        <section className="additional-features-section">
          <div className="section-header">
            <Title level={2}>Additional Capabilities</Title>
            <Paragraph>
              Everything you need for comprehensive safety management
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {additionalFeatures.map((feature, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Card className="additional-feature-card" hoverable>
                  <div className="additional-feature-icon">
                    {feature.icon}
                  </div>
                  <Title level={5}>{feature.title}</Title>
                  <Text type="secondary">{feature.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Integrations Section */}
        <section className="integrations-section">
          <div className="section-header">
            <Title level={2}>Seamless Integrations</Title>
            <Paragraph>
              Connect SafeTrack Pro with your existing systems
            </Paragraph>
          </div>

          <Row gutter={[24, 24]} justify="center">
            {integrations.map((integration, index) => (
              <Col xs={12} sm={8} md={6} lg={4} key={index}>
                <Card className="integration-card" hoverable>
                  <div className="integration-icon">
                    {integration.icon}
                  </div>
                  <Title level={5}>{integration.name}</Title>
                  <Text type="secondary">{integration.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* CTA Section */}
        <section className="features-cta-section">
          <Card className="features-cta-card">
            <div className="features-cta-content">
              <Title level={2}>Ready to Transform Your Safety Management?</Title>
              <Paragraph>
                Join thousands of organizations using SafeTrack Pro to protect their workforce
              </Paragraph>
              <Space size="large">
                <Button type="primary" size="large" href="/signup" className="cta-primary">
                  Start Free Trial
                </Button>
                <Button size="large" href="/subscription" className="cta-secondary">
                  View Pricing
                </Button>
                <Button size="large" href="/contact" className="cta-secondary">
                  Contact Sales
                </Button>
              </Space>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default FeaturesPage;