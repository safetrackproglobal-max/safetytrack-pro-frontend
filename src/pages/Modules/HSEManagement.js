// src/pages/Modules/HSEManagement.js
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Card, Row, Col, Button, Space, Typography, Avatar, Tag, Divider, Tabs } from 'antd';
import {
  ThunderboltOutlined,
  BuildOutlined,
  MedicineBoxOutlined,
  GoldOutlined,
  ExperimentOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  CheckSquareOutlined,
  WarningOutlined,
  AimOutlined,
  EyeOutlined,
  SafetyOutlined,
  AlertOutlined,
  TeamOutlined,
  SoundOutlined
} from '@ant-design/icons';

// the real, company-scoped tools that make up daily HSE work
const HSE_TOOLS = [
  { path: '/inspections', name: 'Inspections', text: 'Checklists, photos, scores, actions', icon: <CheckSquareOutlined />, color: '#1677ff' },
  { path: '/chemicals', name: 'Chemical safety', text: 'Register, hazards, mixing checks, SDS', icon: <ExperimentOutlined />, color: '#08979c' },
  { path: '/incidents', name: 'Incidents', text: 'Report and investigate', icon: <WarningOutlined />, color: '#cf1322' },
  { path: '/risk-assessment', name: 'Risk assessment', text: 'Hazards, risk ratings, controls', icon: <AimOutlined />, color: '#d46b08' },
  { path: '/safety/observations', name: 'Observations', text: 'Safe and unsafe acts and conditions', icon: <EyeOutlined />, color: '#13c2c2' },
  { path: '/ready-check', name: 'Ready Check', text: 'Pre-task life-saving controls', icon: <SafetyOutlined />, color: '#389e0d' },
  { path: '/roll-call', name: 'Roll Call', text: 'Evacuation and drills', icon: <AlertOutlined />, color: '#eb2f96' },
  { path: '/contractors', name: 'Contractors', text: 'Approval, documents, gate check', icon: <TeamOutlined />, color: '#722ed1' },
  { path: '/toolbox-talks', name: 'Toolbox Talks', text: 'Daily talks with attendance', icon: <SoundOutlined />, color: '#faad14' },
];

// Import your industry components
import IndustryWorkspace from './Industries/IndustryWorkspace';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const industries = [
  {
    id: 'oil_gas',
    name: 'Oil & Gas Safety',
    icon: <ThunderboltOutlined />,
    color: '#389e0d',
    description: 'Process safety, well control, pipeline management',
    risk: 'Very High',
    features: ['Ready Check for permits and isolation', 'Gas test and noise calculators', 'Hazards, controls and standards'],
    component: IndustryWorkspace
  },
  {
    id: 'construction', 
    name: 'Construction Safety',
    icon: <BuildOutlined />,
    color: '#fa8c16',
    description: 'Fall protection, scaffold safety, excavation',
    risk: 'High',
    features: ['Ready Check for height, trenches and lifting', 'Risk matrix and noise calculators', 'Hazards, controls and standards'],
    component: IndustryWorkspace
  },
  {
    id: 'healthcare',
    name: 'Healthcare Safety', 
    icon: <MedicineBoxOutlined />,
    color: '#eb2f96',
    description: 'Infection control, patient safety, biohazards',
    risk: 'High',
    features: ['Hazards, controls and standards', 'Risk matrix', 'Documents and AI procedures'],
    component: IndustryWorkspace
  },
  {
    id: 'mining',
    name: 'Mining Safety',
    icon: <GoldOutlined />,
    color: '#faad14',
    description: 'Ground control, ventilation, explosives safety',
    risk: 'Very High',
    features: ['Ready Check for mobile plant and isolation', 'Noise and gas calculators', 'Hazards, controls and standards'],
    component: IndustryWorkspace
  },
  {
    id: 'chemical',
    name: 'Chemical Safety',
    icon: <ExperimentOutlined />,
    color: '#722ed1',
    description: 'Process safety, chemical handling, reactivity',
    risk: 'High',
    features: ['Chemical inventory', 'Gas test calculator', 'Ready Check for permits and isolation'],
    component: IndustryWorkspace
  },
  {
    id: 'aviation',
    name: 'Aviation Safety',
    icon: <RocketOutlined />,
    color: '#13c2c2',
    description: 'Flight safety, maintenance, ground operations',
    risk: 'High',
    features: ['Ready Check for ramp and hangar work', 'Noise dose calculator', 'Hazards, controls and standards'],
    component: IndustryWorkspace
  },
  {
    id: 'maritime',
    name: 'Maritime Safety',
    icon: <RocketOutlined />,
    color: '#1890ff',
    description: 'Vessel safety, cargo operations, navigation',
    risk: 'High',
    features: ['Ready Check for enclosed spaces and lifting', 'Gas test calculator', 'Hazards, controls and standards'],
    component: IndustryWorkspace
  },
  {
    id: 'general',
    name: 'General Industry',
    icon: <SafetyCertificateOutlined />,
    color: '#52c41a',
    description: 'Manufacturing, warehousing, office safety',
    risk: 'Medium',
    features: ['Ready Check for machinery and isolation', 'Noise dose calculator', 'Hazards, controls and standards'],
    component: IndustryWorkspace
  }
];

const HSEManagement = () => {
  const history = useHistory();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('selector');

  // Get industry ID from URL or default to selector
  const getCurrentIndustry = () => {
    const pathParts = location.pathname.split('/');
    const industryIndex = pathParts.indexOf('industry');
    if (industryIndex !== -1 && pathParts[industryIndex + 1]) {
      return pathParts[industryIndex + 1];
    }
    return 'selector';
  };

  // stay on /hse-management/... so the tabs remain (the old /modules/hse/... links still open the industry workspace)
  const handleTabChange = (key) => {
    if (key === 'selector') {
      history.push('/hse-management');
    } else {
      history.push(`/hse-management/industry/${key}`);
    }
    setActiveTab(key);
  };

  const handleIndustrySelect = (industryId) => {
    history.push(`/hse-management/industry/${industryId}`);
    setActiveTab(industryId);
  };

  const renderIndustrySelector = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={1}>🏭 HSE Management System</Title>
        <Paragraph type="secondary" style={{ fontSize: '18px' }}>
          Daily HSE tools for every site, plus industry workspaces with hazards, calculators and documents
        </Paragraph>
      </div>

      <Card title="Daily HSE tools" style={{ marginBottom: 32, borderRadius: 16 }}>
        <Row gutter={[12, 12]}>
          {HSE_TOOLS.map((t) => (
            <Col xs={12} sm={8} lg={6} key={t.path}>
              <Card size="small" hoverable onClick={() => history.push(t.path)} style={{ borderRadius: 12, height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Avatar style={{ backgroundColor: t.color, flex: '0 0 32px' }} icon={t.icon} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{t.text}</div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Title level={3} style={{ marginBottom: 16 }}>Industry workspaces</Title>

      <Row gutter={[24, 24]}>
        {industries.map(industry => (
          <Col xs={24} sm={12} lg={8} xl={6} key={industry.id}>
            <Card 
              hoverable
              style={{ 
                height: '100%',
                border: `2px solid ${industry.color}20`,
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleIndustrySelect(industry.id)}
            >
              <div style={{ textAlign: 'center' }}>
                <Avatar 
                  size={64} 
                  icon={industry.icon}
                  style={{ 
                    backgroundColor: industry.color,
                    marginBottom: 16
                  }}
                />
                <Title level={3} style={{ color: industry.color, marginBottom: 8 }}>
                  {industry.name}
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                  {industry.description}
                </Paragraph>
                
                <Tag color={
                  industry.risk === 'Very High' ? 'red' : 
                  industry.risk === 'High' ? 'orange' : 'green'
                }>
                  Risk: {industry.risk}
                </Tag>
                
                <Divider />
                
                <Space direction="vertical" size="small" style={{ textAlign: 'left', width: '100%' }}>
                  {industry.features.map((feature, index) => (
                    <div key={index} style={{ fontSize: '12px', color: '#666' }}>
                      ✓ {feature}
                    </div>
                  ))}
                </Space>
                
                <Button 
                  type="primary" 
                  style={{ 
                    backgroundColor: industry.color,
                    borderColor: industry.color,
                    marginTop: 16,
                    width: '100%'
                  }}
                  icon={<ArrowRightOutlined />}
                >
                  Select Industry
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  const renderIndustryContent = (industryId) => {
    const industry = industries.find(ind => ind.id === industryId);
    const IndustryComponent = industry ? industry.component : IndustryWorkspace;
    
    return (
      <div style={{ padding: '0' }}>
        <IndustryComponent industryId={industryId} />
      </div>
    );
  };

  return (
    <div>
      <Tabs
        activeKey={getCurrentIndustry()}
        onChange={handleTabChange}
        type="card"
        size="large"
        style={{ margin: '0' }}
        tabBarStyle={{ padding: '0 24px', margin: '0' }}
        destroyInactiveTabPane={false}
      >
        <TabPane 
          tab={
            <Space>
              <SafetyCertificateOutlined />
              Industry Selector
            </Space>
          } 
          key="selector"
        >
          {renderIndustrySelector()}
        </TabPane>

        {industries.map(industry => (
          <TabPane 
            tab={
              <Space>
                {industry.icon}
                {industry.name}
                <Tag color={
                  industry.risk === 'Very High' ? 'red' : 
                  industry.risk === 'High' ? 'orange' : 'green'
                }>
                  {industry.risk}
                </Tag>
              </Space>
            } 
            key={industry.id}
          >
            {renderIndustryContent(industry.id)}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default HSEManagement;