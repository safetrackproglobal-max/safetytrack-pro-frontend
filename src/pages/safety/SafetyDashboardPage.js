import React from 'react';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import { useHistory } from 'react-router-dom';
import {
  EyeOutlined, BulbOutlined, LineChartOutlined, DollarOutlined,
  AuditOutlined, ThunderboltOutlined, ToolOutlined
} from '@ant-design/icons';

const SafetyDashboardPage = () => {
  const history = useHistory();

  const features = [
    { title: 'Safety Observations', path: '/safety/observations', icon: <EyeOutlined />, color: '#1890ff' },
    { title: 'Lessons Learned', path: '/safety/lessons-learned', icon: <BulbOutlined />, color: '#722ed1' },
    { title: 'Predictive Analytics', path: '/safety/predictive-analytics', icon: <LineChartOutlined />, color: '#52c41a' },
    { title: 'Cost Analysis', path: '/safety/cost-analysis', icon: <DollarOutlined />, color: '#fa8c16' },
    { title: 'Regulatory Reporting', path: '/safety/regulatory-compliance', icon: <AuditOutlined />, color: '#13c2c2' },
    { title: 'Escalation Matrix', path: '/safety/escalation-management', icon: <ThunderboltOutlined />, color: '#f5222d' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1>Safety Management Dashboard</h1>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {features.map((feature) => (
          <Col xs={24} sm={12} md={8} key={feature.path}>
            <Card 
              hoverable 
              onClick={() => history.push(feature.path)}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 48, color: feature.color, marginBottom: 16 }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <Button type="primary">Open</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SafetyDashboardPage;