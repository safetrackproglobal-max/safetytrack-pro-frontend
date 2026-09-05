import React, { useState } from 'react';
import { Tabs, Card, Row, Col, Alert, Spin } from 'antd';
import {
  RobotOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  UserOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import AIChatAssistant from '../components/AI/AIChatAssistant';
import DiseasePrediction from '../components/AI/DiseasePrediction';
import SymptomAnalyzer from '../components/AI/SymptomAnalyzer';
import LabResultAnalyzer from '../components/AI/LabResultAnalyzer';
import MedicalTextAnalysis from '../components/AI/MedicalTextAnalysis';
import AIAnalysis from '../components/AI/AIAnalysis';
import '../components/AI/ai.css';

const { TabPane } = Tabs;

const TemplatesPage = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);

  const tabItems = [
    {
      key: 'chat',
      label: (
        <span>
          <RobotOutlined />
          AI Assistant
        </span>
      ),
      children: <AIChatAssistant />
    },
    {
      key: 'symptoms',
      label: (
        <span>
          <UserOutlined />
          Symptom Analysis
        </span>
      ),
      children: <SymptomAnalyzer />
    },
    {
      key: 'disease',
      label: (
        <span>
          <MedicineBoxOutlined />
          Disease Prediction
        </span>
      ),
      children: <DiseasePrediction />
    },
    {
      key: 'lab',
      label: (
        <span>
          <ExperimentOutlined />
          Lab Analysis
        </span>
      ),
      children: <LabResultAnalyzer />
    },
    {
      key: 'text',
      label: (
        <span>
          <FileTextOutlined />
          Text Analysis
        </span>
      ),
      children: <MedicalTextAnalysis />
    },
    {
      key: 'safety',
      label: (
        <span>
          <DashboardOutlined />
          Safety Analysis
        </span>
      ),
      children: <AIAnalysis />
    }
  ];

  return (
    <div className="ai-analysis-page">
      <div className="page-header">
        <h1>
          <RobotOutlined /> AI-Powered Healthcare Analysis
        </h1>
        <p>Leverage artificial intelligence for enhanced medical insights and decision support</p>
      </div>

      <Alert
        message="AI Assistance Notice"
        description="These tools are designed to assist healthcare professionals and should not replace clinical judgment. Always verify AI-generated insights with standard medical protocols."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card className="stats-card">
            <div className="stat-icon">
              <MedicineBoxOutlined />
            </div>
            <div className="stat-content">
              <h3>98%</h3>
              <p>Diagnostic Accuracy</p>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stats-card">
            <div className="stat-icon">
              <ExperimentOutlined />
            </div>
            <div className="stat-content">
              <h3>2.4M+</h3>
              <p>Medical Cases Analyzed</p>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="stats-card">
            <div className="stat-icon">
              <UserOutlined />
            </div>
            <div className="stat-content">
              <h3>24/7</h3>
              <p>AI Assistance Available</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          tabPosition="top"
          animated
        >
          {tabItems.map(item => (
            <TabPane key={item.key} tab={item.label}>
              {loading ? (
                <div className="loading-container">
                  <Spin size="large" />
                  <p>Loading AI capabilities...</p>
                </div>
              ) : (
                item.children
              )}
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <div className="disclaimer-section">
        <Alert
          message="Important Disclaimer"
          description="All AI-generated content should be reviewed by qualified healthcare professionals. This system is intended to support, not replace, professional medical judgment. Emergency situations require immediate contact with emergency services."
          type="warning"
          showIcon
        />
      </div>
    </div>
  );
};

export default TemplatesPage;