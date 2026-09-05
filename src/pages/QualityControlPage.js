import React from 'react';
import { Card, Row, Col, Statistic, Button, Empty } from 'antd';
import { ExperimentOutlined, CheckCircleOutlined, AuditOutlined } from '@ant-design/icons';

function QualityControlPage() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1><ExperimentOutlined /> Quality Control & QA</h1>
        <p>Quality assurance and control processes</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic title="Quality Checks" value={156} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic title="Compliance Rate" value={98} suffix="%" prefix={<AuditOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic title="Pending Audits" value={5} prefix={<ExperimentOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic title="Defect Rate" value={1.2} suffix="%" prefix={<AuditOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card title="Quality Control Dashboard">
        <Empty 
          description="Quality control module is under development"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary">Coming Soon</Button>
        </Empty>
      </Card>
    </div>
  );
}

export default QualityControlPage;