// src/pages/AIServicesPage.js
import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Tabs, 
  Alert, 
  Statistic,
  Progress,
  Tag,
  Button,
  Space,
  List,
  Badge,
  Modal // ADDED: Import Modal
} from 'antd';
import { 
  RobotOutlined, 
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  AlertOutlined,
  ToolOutlined,
  BarChartOutlined,
  CloudUploadOutlined,
  PlayCircleOutlined,
  MedicineBoxOutlined,
  EyeOutlined,
  ExperimentOutlined,
  ExclamationCircleOutlined // ADDED: Warning icon
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ADDED: Import useAuth

// Import your existing AI components
import SymptomAnalyzer from '../components/AI/SymptomAnalyzer';
import DiseasePrediction from '../components/AI/DiseasePrediction';
import MedicalTextAnalysis from '../components/AI/MedicalTextAnalysis';
import LabResultAnalyzer from '../components/AI/LabResultAnalyzer';

const { TabPane } = Tabs;
const { confirm } = Modal;

const AIServicesPage = () => {
  const [activeTab, setActiveTab] = useState('medical-ner');
  const history = useHistory();
  const { canAccess } = useAuth(); // ADDED: Get canAccess from auth
  
  const [aiStatus, setAiStatus] = useState({
    'medical-ner': { status: 'active', usage: 92 },
    'symptom-analysis': { status: 'active', usage: 85 },
    'disease-prediction': { status: 'active', usage: 78 },
    'text-classifier': { status: 'active', usage: 88 },
    'sentiment-analysis': { status: 'active', usage: 76 },
    'summarization': { status: 'active', usage: 82 },
    'risk-assessment': { status: 'active', usage: 71 },
    'lab-analysis': { status: 'active', usage: 65 }
  });

  const aiServices = [
    {
      id: 'medical-ner',
      name: 'Medical NER Analysis',
      description: 'Named Entity Recognition for medical text using BERT clinical model',
      icon: <MedicineBoxOutlined />,
      color: '#1890ff',
      status: 'active',
      usage: 92,
      model: 'samrawal/bert-base-uncased_clinical-ner',
      requiredPlan: 'basic' // ADDED: Required plan
    },
    {
      id: 'symptom-analysis',
      name: 'Symptom Analysis',
      description: 'AI-powered symptom analysis and medical assessment',
      icon: <ExperimentOutlined />,
      color: '#52c41a',
      status: 'active',
      usage: 85,
      model: 'Custom Symptom Model',
      requiredPlan: 'basic' // ADDED: Required plan
    },
    {
      id: 'disease-prediction',
      name: 'Disease Prediction',
      description: 'Predict potential diseases based on symptoms and medical history',
      icon: <AlertOutlined />,
      color: '#fa541c',
      status: 'active',
      usage: 78,
      model: 'Custom Disease Model',
      requiredPlan: 'pro' // ADDED: Required plan
    },
    {
      id: 'text-classifier',
      name: 'Text Classification',
      description: 'Advanced text classification using RoBERTa model',
      icon: <FileTextOutlined />,
      color: '#722ed1',
      status: 'active',
      usage: 88,
      model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      requiredPlan: 'basic' // ADDED: Required plan
    },
    {
      id: 'sentiment-analysis',
      name: 'Sentiment Analysis',
      description: 'Analyze sentiment in medical and safety reports',
      icon: <BarChartOutlined />,
      color: '#faad14',
      status: 'active',
      usage: 76,
      model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      requiredPlan: 'basic' // ADDED: Required plan
    },
    {
      id: 'summarization',
      name: 'Text Summarization',
      description: 'Summarize medical reports and safety documents',
      icon: <FileTextOutlined />,
      color: '#13c2c2',
      status: 'active',
      usage: 82,
      model: 'facebook/bart-large-cnn',
      requiredPlan: 'pro' // ADDED: Required plan
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment',
      description: 'Assess safety and medical risks using AI analysis',
      icon: <SafetyCertificateOutlined />,
      color: '#cf1322',
      status: 'active',
      usage: 71,
      model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      requiredPlan: 'pro' // ADDED: Required plan
    },
    {
      id: 'lab-analysis',
      name: 'Lab Result Analysis',
      description: 'Analyze laboratory results and medical test data',
      icon: <ExperimentOutlined />,
      color: '#389e0d',
      status: 'active',
      usage: 65,
      model: 'Custom Lab Analysis Model',
      requiredPlan: 'enterprise' // ADDED: Required plan
    },
    // ADDED: New premium services
    {
      id: 'video-analysis',
      name: 'Video Safety Analysis',
      description: 'AI-powered video monitoring and safety detection',
      icon: <VideoCameraOutlined />,
      color: '#eb2f96',
      status: 'active',
      usage: 45,
      model: 'Custom Video Model',
      requiredPlan: 'pro'
    },
    {
      id: 'environmental-analysis',
      name: 'Environmental AI',
      description: 'Advanced environmental monitoring and analysis',
      icon: <EnvironmentOutlined />,
      color: '#389e0d',
      status: 'active',
      usage: 38,
      model: 'Custom Environmental Model',
      requiredPlan: 'enterprise'
    }
  ];

  const recentAnalyses = [
    {
      id: 1,
      service: 'Medical NER',
      input: 'Patient presented with chest pain and shortness of breath',
      result: 'Identified: chest pain, shortness of breath',
      timestamp: '2 minutes ago',
      confidence: 94
    },
    {
      id: 2,
      service: 'Symptom Analysis',
      input: 'Fever, cough, fatigue',
      result: 'Possible: Influenza, Common Cold',
      timestamp: '15 minutes ago',
      confidence: 87
    },
    {
      id: 3,
      service: 'Risk Assessment',
      input: 'Factory safety inspection report',
      result: 'Medium risk - electrical hazards identified',
      timestamp: '1 hour ago',
      confidence: 76
    },
    {
      id: 4,
      service: 'Text Summarization',
      input: 'Long medical report document',
      result: 'Summary generated (3 key points)',
      timestamp: '2 hours ago',
      confidence: 91
    }
  ];

  const handleServiceAction = (service) => {
    // ADDED: Plan-based access check
    if (service.requiredPlan && !canAccess(service.requiredPlan)) {
      history.push(`/pricing?required=${service.requiredPlan}&service=${service.id}`);
      return;
    }

    // ADDED: Show AI usage warning
    showUsageWarning(service);
  };

  // ADDED: Function to show AI usage warning
  const showUsageWarning = (service) => {
    confirm({
      title: 'AI Service Usage Warning',
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
      content: (
        <div>
          <p>You are about to use the <strong>{service.name}</strong> AI service.</p>
          <Alert
            message="Important Notice"
            description={
              <div>
                <p>• This AI service is for informational purposes only and does not constitute medical advice.</p>
                <p>• Always consult with qualified healthcare professionals for medical decisions.</p>
                <p>• AI analysis results should be verified by trained personnel.</p>
                <p>• Your usage data may be stored for service improvement.</p>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      ),
      okText: 'I Understand, Continue',
      cancelText: 'Cancel',
      onOk() {
        // Navigate to the service
        const serviceRoutes = {
          'medical-ner': '/ai-services/medical-ner',
          'symptom-analysis': '/ai-services/symptom-analysis', 
          'disease-prediction': '/ai-services/disease-prediction',
          'lab-analysis': '/ai-services/lab-analysis',
          'risk-assessment': '/ai-services/risk-assessment',
          'video-analysis': '/ai-services/video-analysis',
          'environmental-analysis': '/ai-services/environmental-analysis'
        };
        const route = serviceRoutes[service.id];
        if (route) {
          history.push(route);
        } else {
          setActiveTab(service.id);
        }
      }
    });
  };

  const renderServiceCard = (service) => {
    const hasAccess = canAccess ? canAccess(service.requiredPlan || 'basic') : true;
    
    return (
      <Col xs={24} md={12} lg={8} key={service.id}>
        <Card 
          className={`ai-service-card ${!hasAccess ? 'locked-service' : ''}`}
          hoverable={hasAccess}
          onClick={() => hasAccess ? handleServiceAction(service) : null}
          style={{ 
            borderLeft: `4px solid ${service.color}`,
            cursor: hasAccess ? 'pointer' : 'not-allowed',
            opacity: hasAccess ? 1 : 0.6,
            position: 'relative'
          }}
        >
          {!hasAccess && (
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: '#ff4d4f',
              color: 'white',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 'bold'
            }}>
              {service.requiredPlan ? service.requiredPlan.toUpperCase() : 'UPGRADE'}
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div 
              className="service-icon" 
              style={{ 
                background: `${service.color}20`, 
                color: service.color,
                padding: 8,
                borderRadius: 6
              }}
            >
              {service.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h4 style={{ margin: 0, fontSize: 14 }}>{service.name}</h4>
                <Tag color={service.status === 'active' ? 'green' : 'orange'} size="small">
                  {service.status}
                </Tag>
              </div>
              <p style={{ margin: 0, color: '#666', fontSize: 12, lineHeight: 1.4 }}>
                {service.description}
              </p>
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: '#999', marginBottom: 2 }}>
                  Model: {service.model}
                </div>
                {service.requiredPlan && (
                  <div style={{ fontSize: 10, color: hasAccess ? '#52c41a' : '#ff4d4f', marginBottom: 4 }}>
                    Plan: {service.requiredPlan.toUpperCase()}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span>Usage</span>
                  <span>{service.usage}%</span>
                </div>
                <Progress 
                  percent={service.usage} 
                  size="small" 
                  strokeColor={service.color}
                  showInfo={false}
                />
              </div>
            </div>
          </div>
        </Card>
      </Col>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'medical-ner':
        return <MedicalTextAnalysis />;
      case 'symptom-analysis':
        return <SymptomAnalyzer />;
      case 'disease-prediction':
        return <DiseasePrediction />;
      case 'lab-analysis':
        return <LabResultAnalyzer />;
      default:
        return (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <RobotOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <h3>Select an AI Service</h3>
            <p>Choose an AI service from the cards above to start analysis.</p>
            <Button type="primary" onClick={() => {
              const medicalNerService = aiServices.find(s => s.id === 'medical-ner');
              if (medicalNerService) handleServiceAction(medicalNerService);
            }}>
              Start with Medical NER
            </Button>
          </div>
        );
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>
              <RobotOutlined /> AI Services Hub
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: 16 }}>
              Advanced AI-powered medical and safety analysis services
            </p>
          </div>
          <div>
            <Space>
              <Statistic 
                title="Active Models" 
                value={aiServices.filter(s => s.status === 'active').length} 
                suffix={`/ ${aiServices.length}`}
                valueStyle={{ color: '#52c41a' }}
              />
              <Statistic 
                title="Today's Analyses" 
                value={47} 
                prefix={<BarChartOutlined />}
              />
            </Space>
          </div>
        </div>
      </div>

      <Alert
        message="AI Models Status: All Systems Operational"
        description="All pre-trained AI models are loaded and ready for analysis. Medical NER, Text Classification, Sentiment Analysis, Summarization, and Risk Assessment models are active."
        type="success"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* ADDED: AI Usage Warning Alert */}
      <Alert
        message="Important AI Usage Notice"
        description={
          <div>
            <p>• AI services are for informational purposes only and do not constitute professional medical or safety advice.</p>
            <p>• Some services require specific subscription plans. Upgrade your plan to access premium features.</p>
            <p>• All AI analysis results should be verified by qualified professionals.</p>
          </div>
        }
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      {/* AI Services Grid */}
      <Card 
        title="Available AI Services" 
        style={{ marginBottom: 24 }}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<CloudUploadOutlined />}
              onClick={() => {
                if (!canAccess('basic')) {
                  history.push('/pricing?required=basic&service=upload');
                  return;
                }
                // Handle upload functionality
              }}
            >
              Upload Data
            </Button>
            <Button 
              type="default" 
              onClick={() => history.push('/pricing')}
            >
              Upgrade Plan
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {aiServices.map(renderServiceCard)}
        </Row>
      </Card>

      {/* Main Content Area */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={(key) => {
                const service = aiServices.find(s => s.id === key);
                if (service && service.requiredPlan && !canAccess(service.requiredPlan)) {
                  history.push(`/pricing?required=${service.requiredPlan}&service=${service.id}`);
                  return;
                }
                setActiveTab(key);
              }}
              items={[
                {
                  key: 'medical-ner',
                  label: (
                    <span>
                      <MedicineBoxOutlined />
                      Medical NER
                    </span>
                  ),
                  children: renderTabContent()
                },
                {
                  key: 'symptom-analysis',
                  label: (
                    <span>
                      <ExperimentOutlined />
                      Symptom Analysis
                    </span>
                  ),
                  children: renderTabContent()
                },
                {
                  key: 'disease-prediction',
                  label: (
                    <span>
                      <AlertOutlined />
                      Disease Prediction
                    </span>
                  ),
                  children: renderTabContent()
                },
                {
                  key: 'lab-analysis',
                  label: (
                    <span>
                      <ExperimentOutlined />
                      Lab Analysis
                    </span>
                  ),
                  children: renderTabContent()
                }
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Recent Analyses */}
          <Card title="Recent Analyses" size="small" style={{ marginBottom: 16 }}>
            <List
              size="small"
              dataSource={recentAnalyses}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge count={item.confidence} style={{ backgroundColor: item.confidence > 80 ? '#52c41a' : '#faad14' }} />
                    }
                    title={item.service}
                    description={
                      <div>
                        <div style={{ fontSize: 12 }}>{item.input}</div>
                        <div style={{ fontSize: 11, color: '#666' }}>
                          {item.result} • {item.timestamp}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* System Stats */}
          <Card title="AI System Stats" size="small">
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Statistic
                  title="Medical NER"
                  value={92}
                  suffix="%"
                  valueStyle={{ color: '#1890ff', fontSize: 18 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Text Classifier"
                  value={88}
                  suffix="%"
                  valueStyle={{ color: '#722ed1', fontSize: 18 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Summarization"
                  value={82}
                  suffix="%"
                  valueStyle={{ color: '#13c2c2', fontSize: 18 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Risk Assessment"
                  value={71}
                  suffix="%"
                  valueStyle={{ color: '#cf1322', fontSize: 18 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AIServicesPage;