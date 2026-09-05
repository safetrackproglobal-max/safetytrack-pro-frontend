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
  ArrowRightOutlined
} from '@ant-design/icons';

// Import your industry components
import OilGasSafety from './Industries/OilGasSafety';
import ConstructionSafety from './Industries/ConstructionSafety';
import HealthcareSafety from './Industries/HealthcareSafety';
import MiningSafety from './Industries/MiningSafety';
import ChemicalSafety from './Industries/ChemicalSafety';
import AviationSafety from './Industries/AviationSafety';
import MaritimeSafety from './Industries/MaritimeSafety';
import GeneralIndustry from './Industries/GeneralIndustry';

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
    features: ['Process Safety', 'Hazard Analysis', 'Emergency Response'],
    component: OilGasSafety
  },
  {
    id: 'construction', 
    name: 'Construction Safety',
    icon: <BuildOutlined />,
    color: '#fa8c16',
    description: 'Fall protection, scaffold safety, excavation',
    risk: 'High',
    features: ['Fall Protection', 'Scaffold Safety', 'Equipment Operations'],
    component: ConstructionSafety
  },
  {
    id: 'healthcare',
    name: 'Healthcare Safety', 
    icon: <MedicineBoxOutlined />,
    color: '#eb2f96',
    description: 'Infection control, patient safety, biohazards',
    risk: 'High',
    features: ['Infection Control', 'Patient Safety', 'Biohazard Management'],
    component: HealthcareSafety
  },
  {
    id: 'mining',
    name: 'Mining Safety',
    icon: <GoldOutlined />,
    color: '#faad14',
    description: 'Ground control, ventilation, explosives safety',
    risk: 'Very High',
    features: ['Ground Control', 'Ventilation', 'Explosives Management'],
    component: MiningSafety
  },
  {
    id: 'chemical',
    name: 'Chemical Safety',
    icon: <ExperimentOutlined />,
    color: '#722ed1',
    description: 'Process safety, chemical handling, reactivity',
    risk: 'High',
    features: ['Process Safety', 'Chemical Management', 'Containment'],
    component: ChemicalSafety
  },
  {
    id: 'aviation',
    name: 'Aviation Safety',
    icon: <RocketOutlined />,
    color: '#13c2c2',
    description: 'Flight safety, maintenance, ground operations',
    risk: 'High',
    features: ['Flight Safety', 'Maintenance', 'Ground Operations'],
    component: AviationSafety
  },
  {
    id: 'maritime',
    name: 'Maritime Safety',
    icon: <RocketOutlined />,
    color: '#1890ff',
    description: 'Vessel safety, cargo operations, navigation',
    risk: 'High',
    features: ['Vessel Safety', 'Cargo Operations', 'Navigation'],
    component: MaritimeSafety
  },
  {
    id: 'general',
    name: 'General Industry',
    icon: <SafetyCertificateOutlined />,
    color: '#52c41a',
    description: 'Manufacturing, warehousing, office safety',
    risk: 'Medium',
    features: ['Incident Management', 'Safety Protocols', 'Training'],
    component: GeneralIndustry
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

  const handleTabChange = (key) => {
    if (key === 'selector') {
      history.push('/modules/hse');
    } else {
      history.push(`/modules/hse/industry/${key}`);
    }
    setActiveTab(key);
  };

  const handleIndustrySelect = (industryId) => {
    history.push(`/modules/hse/industry/${industryId}`);
    setActiveTab(industryId);
  };

  const renderIndustrySelector = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={1}>🏭 HSE Management System</Title>
        <Paragraph type="secondary" style={{ fontSize: '18px' }}>
          Select your industry to access specialized safety management tools, documents, and AI services
        </Paragraph>
      </div>

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
    const IndustryComponent = industry ? industry.component : GeneralIndustry;
    
    return (
      <div style={{ padding: '0' }}>
        <IndustryComponent />
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