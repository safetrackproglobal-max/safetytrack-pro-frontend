// src/pages/EmployeeDashboard.js
import React from 'react';
import { Row, Col, Card, Statistic, Timeline, Button } from 'antd';
import { 
  FileTextOutlined, 
  SafetyCertificateOutlined, 
  AlertOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';

function EmployeeDashboard() {
  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <h1>Employee Safety Dashboard</h1>
        <p>Your safety tasks and compliance overview</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Pending Tasks" value={5} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Completed" value={12} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Incidents" value={2} prefix={<AlertOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Compliance" value={95} suffix="%" prefix={<SafetyCertificateOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" className="quick-actions-card">
            <Button type="primary" block style={{ marginBottom: 8 }}>
              Report Incident
            </Button>
            <Button block style={{ marginBottom: 8 }}>
              Submit Safety Checklist
            </Button>
            <Button block>
              View Training Materials
            </Button>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Recent Activity">
            <Timeline>
              <Timeline.Item color="green">Completed safety training</Timeline.Item>
              <Timeline.Item color="blue">Submitted monthly checklist</Timeline.Item>
              <Timeline.Item color="red">Reported equipment issue</Timeline.Item>
              <Timeline.Item>New safety protocol assigned</Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default EmployeeDashboard;