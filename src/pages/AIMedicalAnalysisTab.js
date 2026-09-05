// AIMedicalAnalysisTab.js
import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Tabs,
  Space,
  Typography,
  Alert,
  Button
} from 'antd';
import {
  RobotOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  MessageOutlined,
  BarChartOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

// Import your AI components
import DiseasePrediction from '../components/AI/DiseasePrediction';
import SymptomAnalyzer from '../components/AI/SymptomAnalyzer';
import LabResultAnalyzer from '../components/AI/LabResultAnalyzer';
import MedicalTextAnalysis from '../components/AI/MedicalTextAnalysis';
import SafetyDocumentAnalyzer from '../components/AI/SafetyDocumentAnalyzer';
import AIChatAssistant from '../components/AI/AIChatAssistant';
import AIAnalysis from '../components/AI/AIAnalysis';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

const AIMedicalAnalysisTab = () => {
  const [activeAITab, setActiveAITab] = useState('chat');

  const aiTools = [
    {
      key: 'chat',
      label: 'AI Assistant',
      icon: <MessageOutlined />,
      component: <AIChatAssistant />,
      description: 'Get instant answers about medical cases and hospital procedures'
    },
    {
      key: 'symptoms',
      label: 'Symptom Analysis',
      icon: <MedicineBoxOutlined />,
      component: <SymptomAnalyzer />,
      description: 'Analyze patient symptoms and get potential condition insights'
    },
    {
      key: 'disease',
      label: 'Disease Prediction',
      icon: <ExperimentOutlined />,
      component: <DiseasePrediction />,
      description: 'Predict potential diseases based on medical data and symptoms'
    },
    {
      key: 'lab',
      label: 'Lab Analysis',
      icon: <BarChartOutlined />,
      component: <LabResultAnalyzer />,
      description: 'Interpret laboratory results and identify anomalies'
    },
    {
      key: 'medical-text',
      label: 'Text Analysis',
      icon: <FileTextOutlined />,
      component: <MedicalTextAnalysis />,
      description: 'Analyze medical documents, notes, and research papers'
    },
    {
      key: 'safety',
      label: 'Safety Analysis',
      icon: <SafetyCertificateOutlined />,
      component: <SafetyDocumentAnalyzer />,
      description: 'Review safety protocols and compliance documents'
    },
    {
      key: 'overview',
      label: 'AI Overview',
      icon: <ThunderboltOutlined />,
      component: <AIAnalysis />,
      description: 'Comprehensive AI analysis dashboard and insights'
    }
  ];

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Row align="middle" gutter={[16, 16]}>
          <Col flex="auto">
            <Space direction="vertical" size={2}>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                <RobotOutlined /> AI Medical Analysis Suite
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                Advanced AI tools for medical diagnosis, analysis, and patient care
              </Text>
            </Space>
          </Col>
          <Col>
            <Button type="primary" ghost icon={<ThunderboltOutlined />}>
              Quick Analysis
            </Button>
          </Col>
        </Row>
      </Card>

      {/* AI Tools Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Space>
              <div style={{ 
                background: '#1890ff', 
                borderRadius: '50%', 
                width: 40, 
                height: 40, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <ExperimentOutlined style={{ color: 'white', fontSize: 18 }} />
              </div>
              <div>
                <Text strong>7 Tools</Text>
                <br />
                <Text type="secondary">Available</Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Space>
              <div style={{ 
                background: '#52c41a', 
                borderRadius: '50%', 
                width: 40, 
                height: 40, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <MedicineBoxOutlined style={{ color: 'white', fontSize: 18 }} />
              </div>
              <div>
                <Text strong>Real-time</Text>
                <br />
                <Text type="secondary">Analysis</Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Space>
              <div style={{ 
                background: '#faad14', 
                borderRadius: '50%', 
                width: 40, 
                height: 40, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <BarChartOutlined style={{ color: 'white', fontSize: 18 }} />
              </div>
              <div>
                <Text strong>98%</Text>
                <br />
                <Text type="secondary">Accuracy</Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Space>
              <div style={{ 
                background: '#722ed1', 
                borderRadius: '50%', 
                width: 40, 
                height: 40, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <SafetyCertificateOutlined style={{ color: 'white', fontSize: 18 }} />
              </div>
              <div>
                <Text strong>HIPAA</Text>
                <br />
                <Text type="secondary">Compliant</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Disclaimer Alert */}
      <Alert
        message="Medical AI Assistant"
        description="These AI tools are designed to assist healthcare professionals and should not replace professional medical judgment. All diagnoses and treatment decisions should be made by qualified medical personnel."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* AI Tools Tabs */}
      <Card>
        <Tabs
          activeKey={activeAITab}
          onChange={setActiveAITab}
          type="card"
          size="large"
          items={aiTools.map(tool => ({
            key: tool.key,
            label: (
              <span>
                {tool.icon}
                {tool.label}
              </span>
            ),
            children: (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">{tool.description}</Text>
                </div>
                {tool.component}
              </div>
            )
          }))}
        />
      </Card>

      {/* Quick Access Cards for Mobile */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {aiTools.slice(0, 4).map(tool => (
          <Col xs={12} md={6} key={tool.key}>
            <Card 
              hoverable
              size="small"
              onClick={() => setActiveAITab(tool.key)}
              style={{ 
                textAlign: 'center',
                border: activeAITab === tool.key ? '2px solid #1890ff' : '1px solid #d9d9d9'
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>
                {tool.icon}
              </div>
              <Text strong>{tool.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AIMedicalAnalysisTab;