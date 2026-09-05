// src/pages/Modules/Industries/HealthcareSafety.js
import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Tabs, 
  List, 
  Button, 
  Space, 
  Tag, 
  Avatar, 
  Statistic, 
  Progress, 
  Timeline, 
  Alert, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Upload, 
  Badge, 
  Tooltip,
  Popconfirm,
  Divider,
  Collapse,
  Empty,
  Table
} from 'antd';
import {
  MedicineBoxOutlined,
  FileTextOutlined,
  RobotOutlined,
  ToolOutlined,
  DownloadOutlined,
  EditOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  BugOutlined,
  ExperimentOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  UploadOutlined,
  EyeOutlined,
  ShareAltOutlined,
  StarOutlined,
  HistoryOutlined,
  BarChartOutlined,
  CalculatorOutlined,
  FileSyncOutlined,
  CloudDownloadOutlined,
  SecurityScanOutlined,
  AuditOutlined,
  HeartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  DashboardOutlined,
  AlertOutlined
} from '@ant-design/icons';
import healthcareSafetyService from '../../../services/healthcareSafetyService';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const HealthcareSafety = () => {
  const { tab = 'tools' } = useParams();
  const history = useHistory();
  const [activeTool, setActiveTool] = useState(null);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [aiServiceModalVisible, setAiServiceModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [patientSafetyData, setPatientSafetyData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Enhanced Healthcare Specific Data
  const healthcareTools = [
    { 
      id: 1,
      name: 'Infection Risk Assessor', 
      description: 'Comprehensive infection control risk assessment with real-time monitoring',
      category: 'Critical',
      status: 'active',
      icon: <BugOutlined />,
      features: ['Real-time Monitoring', 'Outbreak Prediction', 'Control Measures'],
      usage: '189 assessments this month',
      rating: 4.7
    },
    { 
      id: 2,
      name: 'Patient Safety Monitor', 
      description: 'Advanced patient safety indicator tracking and analysis system',
      category: 'Critical',
      status: 'active',
      icon: <HeartOutlined />,
      features: ['Safety Indicators', 'Incident Tracking', 'Performance Analytics'],
      usage: '234 monitors active',
      rating: 4.8
    },
    { 
      id: 3,
      name: 'Biohazard Exposure Calculator', 
      description: 'Comprehensive biological agent exposure risk calculation and management',
      category: 'High',
      status: 'active',
      icon: <ExperimentOutlined />,
      features: ['Exposure Assessment', 'Risk Mitigation', 'Compliance Tracking'],
      usage: '156 calculations this month',
      rating: 4.6
    },
    { 
      id: 4,
      name: 'Medical Equipment Safety Check', 
      description: 'Automated medical device safety compliance verification system',
      category: 'High',
      status: 'beta',
      icon: <MedicineBoxOutlined />,
      features: ['Device Verification', 'Maintenance Tracking', 'Safety Alerts'],
      usage: '89 devices checked',
      rating: 4.3
    },
    { 
      id: 5,
      name: 'PPE Compliance Tracker', 
      description: 'Real-time personal protective equipment usage monitoring and compliance',
      category: 'Critical',
      status: 'active',
      icon: <SafetyCertificateOutlined />,
      features: ['Usage Monitoring', 'Compliance Alerts', 'Training Integration'],
      usage: '1.2K compliance checks',
      rating: 4.5
    },
    { 
      id: 6,
      name: 'Medication Safety Analyzer', 
      description: 'Advanced medication error prediction and prevention system',
      category: 'Critical',
      status: 'active',
      icon: <AlertOutlined />,
      features: ['Error Prediction', 'Drug Interaction', 'Dosage Verification'],
      usage: '567 analyses this month',
      rating: 4.9
    }
  ];

  const healthcareDocuments = [
    { 
      id: 1,
      name: 'Infection Control Protocol', 
      type: 'Procedure', 
      format: '.docx', 
      size: '2.8MB',
      version: '3.2',
      lastModified: '2024-01-15',
      downloads: 245,
      category: 'Critical',
      status: 'approved',
      tags: ['CDC', 'Infection Control', 'Protocol']
    },
    { 
      id: 2,
      name: 'Patient Incident Report Form', 
      type: 'Form', 
      format: '.pdf', 
      size: '1.2MB',
      version: '2.1',
      lastModified: '2024-01-12',
      downloads: 189,
      category: 'Critical',
      status: 'approved',
      tags: ['Incident', 'Reporting', 'Patient Safety']
    },
    { 
      id: 3,
      name: 'Biohazard Risk Assessment', 
      type: 'Assessment', 
      format: '.docx', 
      size: '2.1MB',
      version: '1.8',
      lastModified: '2024-01-10',
      downloads: 167,
      category: 'High',
      status: 'approved',
      tags: ['Biohazard', 'Risk', 'Assessment']
    },
    { 
      id: 4,
      name: 'Sharps Safety Procedure', 
      type: 'Procedure', 
      format: '.pdf', 
      size: '1.5MB',
      version: '4.0',
      lastModified: '2024-01-08',
      downloads: 134,
      category: 'High',
      status: 'approved',
      tags: ['Sharps', 'Safety', 'Procedure']
    },
    { 
      id: 5,
      name: 'Radiation Safety Protocol', 
      type: 'Procedure', 
      format: '.docx', 
      size: '3.2MB',
      version: '2.3',
      lastModified: '2024-01-05',
      downloads: 178,
      category: 'Critical',
      status: 'draft',
      tags: ['Radiation', 'Safety', 'Protocol']
    }
  ];

  const healthcareAIServices = [
    { 
      id: 1,
      name: 'AI Infection Predictor', 
      description: 'Advanced infection outbreak prediction using patient data and machine learning',
      status: 'Active',
      features: ['Outbreak Prediction', 'Risk Stratification', 'Prevention Strategies'],
      usage: '234 predictions this month',
      accuracy: '94%'
    },
    { 
      id: 2,
      name: 'Patient Safety Analytics', 
      description: 'Comprehensive patient safety incident analysis and trend prediction',
      status: 'Active',
      features: ['Incident Analysis', 'Trend Prediction', 'Safety Improvement'],
      usage: '189 analyses this month',
      accuracy: '89%'
    },
    { 
      id: 3,
      name: 'Smart PPE Compliance', 
      description: 'Real-time personal protective equipment usage monitoring with AI',
      status: 'Beta',
      features: ['Real-time Monitoring', 'Compliance Alerts', 'Behavior Analysis'],
      usage: '1.5K compliance checks',
      accuracy: '92%'
    },
    { 
      id: 4,
      name: 'Medical Error Predictor', 
      description: 'AI-powered medical error identification and prevention system',
      status: 'Active',
      features: ['Error Prediction', 'Risk Mitigation', 'Quality Improvement'],
      usage: '567 predictions this month',
      accuracy: '87%'
    }
  ];

  const trainingModules = [
    { 
      name: 'Infection Control Training', 
      progress: 88,
      completed: 125,
      pending: 15,
      dueDate: '2024-02-15',
      category: 'Mandatory'
    },
    { 
      name: 'Patient Safety Training', 
      progress: 92,
      completed: 142,
      pending: 8,
      dueDate: '2024-02-20',
      category: 'Mandatory'
    },
    { 
      name: 'Emergency Response Training', 
      progress: 76,
      completed: 98,
      pending: 22,
      dueDate: '2024-02-10',
      category: 'Required'
    },
    { 
      name: 'Biohazard Safety Training', 
      progress: 95,
      completed: 135,
      pending: 5,
      dueDate: '2024-02-25',
      category: 'Mandatory'
    },
    { 
      name: 'Medication Safety Training', 
      progress: 84,
      completed: 112,
      pending: 18,
      dueDate: '2024-02-18',
      category: 'Required'
    },
    { 
      name: 'Radiation Safety Training', 
      progress: 91,
      completed: 78,
      pending: 7,
      dueDate: '2024-02-22',
      category: 'Specialized'
    }
  ];

  const complianceStandards = [
    { 
      standard: 'Infection Control Standards',
      organization: 'CDC, WHO, Joint Commission',
      status: 'Fully Compliant',
      lastAudit: '2024-01-10',
      nextAudit: '2024-07-10',
      progress: 100
    },
    { 
      standard: 'Biohazard Safety',
      organization: 'Biosafety Levels 1-4',
      status: 'Fully Compliant',
      lastAudit: '2024-01-08',
      nextAudit: '2024-07-08',
      progress: 100
    },
    { 
      standard: 'Patient Safety Goals',
      organization: '2024 National Patient Safety Goals',
      status: 'Review Required',
      lastAudit: '2024-01-12',
      nextAudit: '2024-04-12',
      progress: 85
    },
    { 
      standard: 'HIPAA Compliance',
      organization: 'Health Insurance Portability and Accountability Act',
      status: 'Fully Compliant',
      lastAudit: '2024-01-05',
      nextAudit: '2024-07-05',
      progress: 100
    },
    { 
      standard: 'Medical Device Safety',
      organization: 'FDA, ISO 13485',
      status: 'Partially Compliant',
      lastAudit: '2024-01-15',
      nextAudit: '2024-04-15',
      progress: 92
    }
  ];

  const recentActivities = [
    { action: 'Infection Control Audit Completed', user: 'Infection Control Team', time: '2 hours ago', type: 'audit' },
    { action: 'New Safety Protocol Uploaded', user: 'Quality Manager', time: '4 hours ago', type: 'upload' },
    { action: 'Patient Safety Training Conducted', user: 'Training Department', time: '1 day ago', type: 'training' },
    { action: 'Biohazard Risk Assessment Updated', user: 'Safety Officer', time: '2 days ago', type: 'assessment' }
  ];

  useEffect(() => {
    setDocuments(healthcareDocuments);
    loadPatientSafetyData();
  }, []);

  const loadPatientSafetyData = async () => {
    try {
      setLoading(true);
      const response = await healthcareSafetyService.analytics.getPatientSafetyMetrics();
      setPatientSafetyData(response.data);
    } catch (error) {
      console.error('Failed to load patient safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolLaunch = (tool) => {
    setActiveTool(tool);
    Modal.info({
      title: `Launching ${tool.name}`,
      content: `Initializing ${tool.name} for healthcare safety analysis...`,
      okText: 'Continue',
      onOk: () => console.log('Healthcare tool launched:', tool.name)
    });
  };

  const handleDocumentAction = (action, document) => {
    switch (action) {
      case 'preview':
        setSelectedDocument(document);
        setDocumentModalVisible(true);
        break;
      case 'download':
        Modal.success({
          title: 'Download Started',
          content: `Downloading ${document.name}...`,
        });
        break;
      case 'customize':
        history.push(`/documents/edit/${document.id}`);
        break;
      default:
        break;
    }
  };

  const handleAIServiceAccess = (service) => {
    setAiServiceModalVisible(true);
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || doc.category === filterCategory)
  );

  const getStatusColor = (status) => {
    const colors = {
      'approved': 'green',
      'draft': 'orange',
      'pending': 'blue',
      'rejected': 'red'
    };
    return colors[status] || 'default';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Critical': 'red',
      'High': 'orange',
      'Medium': 'gold',
      'Low': 'green'
    };
    return colors[category] || 'default';
  };

  const getComplianceColor = (status) => {
    const colors = {
      'Fully Compliant': 'green',
      'Partially Compliant': 'blue',
      'Review Required': 'orange',
      'Non-Compliant': 'red'
    };
    return colors[status] || 'default';
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header with Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <MedicineBoxOutlined style={{ color: '#eb2f96', fontSize: '24px' }} />
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Healthcare Safety Management</span>
              </Space>
            } 
            style={{ borderLeft: '6px solid #eb2f96' }}
            extra={
              <Space>
                <Button icon={<PlusOutlined />} type="primary">
                  New Safety Protocol
                </Button>
                <Button icon={<UploadOutlined />}>
                  Upload Documents
                </Button>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="Patient Safety Score" 
                  value={95} 
                  suffix="%" 
                  prefix={<HeartOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="Infection Rate" 
                  value={2.3} 
                  suffix="%" 
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<BugOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="Staff Trained" 
                  value={87} 
                  suffix="%" 
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="Compliance Score" 
                  value={96} 
                  suffix="%" 
                  prefix={<SafetyCertificateOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Alert
        message="High Priority Alert - Enhanced Infection Control Required"
        description="ICU Unit A showing elevated infection rates. Additional control measures and monitoring required."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
        action={
          <Button size="small" type="primary">
            View Details
          </Button>
        }
      />

      <Row gutter={[24, 24]}>
        <Col span={18}>
          <Card>
            <Tabs 
              activeKey={tab} 
              onChange={(key) => history.push(`/hse/healthcare/${key}`)}
              tabBarExtraContent={
                <Space>
                  {tab === 'documents' && (
                    <>
                      <Input 
                        placeholder="Search documents..." 
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 200 }}
                      />
                      <Select 
                        value={filterCategory} 
                        onChange={setFilterCategory}
                        style={{ width: 120 }}
                        prefix={<FilterOutlined />}
                      >
                        <Option value="all">All Categories</Option>
                        <Option value="Critical">Critical</Option>
                        <Option value="High">High</Option>
                      </Select>
                    </>
                  )}
                </Space>
              }
            >
              {/* Safety Tools Tab */}
              <TabPane tab={<span><ToolOutlined /> Safety Tools ({healthcareTools.length})</span>} key="tools">
                <Row gutter={[16, 16]}>
                  {healthcareTools.map(tool => (
                    <Col xs={24} md={12} lg={8} key={tool.id}>
                      <Card
                        hoverable
                        style={{ height: '100%' }}
                        actions={[
                          <Tooltip title="Launch Tool">
                            <PlayCircleOutlined 
                              onClick={() => handleToolLaunch(tool)}
                              style={{ color: '#eb2f96' }}
                            />
                          </Tooltip>,
                          <Tooltip title="View Details">
                            <EyeOutlined />
                          </Tooltip>,
                          <Tooltip title="Add to Favorites">
                            <StarOutlined />
                          </Tooltip>
                        ]}
                      >
                        <Card.Meta
                          avatar={
                            <Avatar 
                              icon={tool.icon} 
                              style={{ backgroundColor: '#eb2f96' }}
                              size="large"
                            />
                          }
                          title={
                            <Space>
                              {tool.name}
                              <Badge 
                                count={tool.category} 
                                style={{ 
                                  backgroundColor: getCategoryColor(tool.category) 
                                }} 
                              />
                              {tool.status === 'beta' && <Tag color="blue">BETA</Tag>}
                            </Space>
                          }
                          description={
                            <div>
                              <p>{tool.description}</p>
                              <div style={{ marginTop: 8 }}>
                                <small style={{ color: '#666' }}>
                                  <TeamOutlined /> {tool.usage}
                                </small>
                                <br />
                                <small style={{ color: '#666' }}>
                                  <StarOutlined /> {tool.rating}/5.0
                                </small>
                              </div>
                              <Divider style={{ margin: '12px 0' }} />
                              <Space wrap size={[4, 4]}>
                                {tool.features.map((feature, index) => (
                                  <Tag key={index} color="blue" size="small">
                                    {feature}
                                  </Tag>
                                ))}
                              </Space>
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </TabPane>

              {/* Documents Tab */}
              <TabPane tab={<span><FileTextOutlined /> Documents ({filteredDocuments.length})</span>} key="documents">
                {filteredDocuments.length === 0 ? (
                  <Empty 
                    description="No documents found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" icon={<PlusOutlined />}>
                      Create New Document
                    </Button>
                  </Empty>
                ) : (
                  <List
                    dataSource={filteredDocuments}
                    renderItem={doc => (
                      <List.Item
                        actions={[
                          <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => handleDocumentAction('preview', doc)}
                          >
                            Preview
                          </Button>,
                          <Button 
                            icon={<DownloadOutlined />} 
                            type="primary"
                            onClick={() => handleDocumentAction('download', doc)}
                          >
                            Download
                          </Button>,
                          <Button 
                            icon={<EditOutlined />}
                            onClick={() => handleDocumentAction('customize', doc)}
                          >
                            Customize
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={<FileTextOutlined />} 
                              style={{ backgroundColor: '#eb2f96' }}
                              size="large"
                            />
                          }
                          title={
                            <Space>
                              {doc.name}
                              <Tag color={getStatusColor(doc.status)}>
                                {doc.status.toUpperCase()}
                              </Tag>
                              <Tag color={getCategoryColor(doc.category)}>
                                {doc.category}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={0}>
                              <Space>
                                <Tag>{doc.type}</Tag>
                                <Tag>{doc.format}</Tag>
                                <Tag>v{doc.version}</Tag>
                                <Tag>Size: {doc.size}</Tag>
                              </Space>
                              <div>
                                <small style={{ color: '#666' }}>
                                  <HistoryOutlined /> Last modified: {doc.lastModified}
                                </small>
                                <br />
                                <small style={{ color: '#666' }}>
                                  <CloudDownloadOutlined /> {doc.downloads} downloads
                                </small>
                              </div>
                              <Space wrap size={[4, 4]} style={{ marginTop: 8 }}>
                                {doc.tags.map((tag, index) => (
                                  <Tag key={index} color="blue" size="small">
                                    {tag}
                                  </Tag>
                                ))}
                              </Space>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </TabPane>

              {/* AI Services Tab */}
              <TabPane tab={<span><RobotOutlined /> AI Services ({healthcareAIServices.length})</span>} key="ai">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Alert
                      message="HIPAA Compliant AI Services"
                      description="All patient data is anonymized, encrypted, and processed in compliance with healthcare privacy regulations."
                      type="info"
                      showIcon
                    />
                  </Col>
                  
                  {healthcareAIServices.map(service => (
                    <Col xs={24} md={12} key={service.id}>
                      <Card
                        hoverable
                        actions={[
                          <Button 
                            type="primary" 
                            onClick={() => handleAIServiceAccess(service)}
                          >
                            Access Service
                          </Button>,
                          <Button icon={<BarChartOutlined />}>
                            Analytics
                          </Button>
                        ]}
                      >
                        <Card.Meta
                          avatar={
                            <Avatar 
                              icon={<RobotOutlined />} 
                              style={{ backgroundColor: '#eb2f96' }}
                              size="large"
                            />
                          }
                          title={
                            <Space>
                              {service.name}
                              <Tag color={service.status === 'Active' ? 'green' : 'orange'}>
                                {service.status}
                              </Tag>
                            </Space>
                          }
                          description={
                            <div>
                              <p>{service.description}</p>
                              <Progress 
                                percent={parseInt(service.accuracy)} 
                                size="small" 
                                style={{ margin: '8px 0' }}
                              />
                              <Space direction="vertical" size={0}>
                                <small style={{ color: '#666' }}>
                                  <FileSyncOutlined /> {service.usage}
                                </small>
                                <small style={{ color: '#666' }}>
                                  Accuracy: {service.accuracy}
                                </small>
                              </Space>
                              <Divider style={{ margin: '12px 0' }} />
                              <Space wrap size={[4, 4]}>
                                {service.features.map((feature, index) => (
                                  <Tag key={index} color="purple" size="small">
                                    {feature}
                                  </Tag>
                                ))}
                              </Space>
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </TabPane>

              {/* Training Tab */}
              <TabPane tab={<span><TeamOutlined /> Training & Education</span>} key="training">
                <Row gutter={[16, 16]}>
                  {trainingModules.map((module, index) => (
                    <Col xs={24} md={12} lg={8} key={index}>
                      <Card 
                        title={module.name}
                        size="small"
                        extra={<Tag color={module.category === 'Mandatory' ? 'red' : 'blue'}>{module.category}</Tag>}
                      >
                        <Progress percent={module.progress} status="active" />
                        <div style={{ marginTop: 12 }}>
                          <Space>
                            <Tag color="green">{module.completed} Completed</Tag>
                            <Tag color="orange">{module.pending} Pending</Tag>
                          </Space>
                          <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                            Due: {module.dueDate}
                          </div>
                        </div>
                        <Button type="link" size="small" style={{ marginTop: 8 }}>
                          View Details
                        </Button>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </TabPane>

              {/* Compliance Tab */}
              <TabPane tab={<span><SafetyCertificateOutlined /> Compliance & Standards</span>} key="compliance">
                <Card title="Healthcare Compliance Status" loading={loading}>
                  <List
                    dataSource={complianceStandards}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Progress 
                            percent={item.progress} 
                            size="small" 
                            status={item.progress === 100 ? 'success' : item.progress >= 80 ? 'active' : 'exception'}
                            style={{ width: 100 }}
                          />
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={<SafetyCertificateOutlined />} 
                              style={{ 
                                backgroundColor: item.status === 'Fully Compliant' ? '#52c41a' : 
                                              item.status === 'Partially Compliant' ? '#1890ff' : 
                                              item.status === 'Review Required' ? '#faad14' : '#f5222d'
                              }}
                            />
                          }
                          title={item.standard}
                          description={
                            <Space direction="vertical" size={0}>
                              <div>{item.organization}</div>
                              <Space>
                                <Tag color={getComplianceColor(item.status)}>
                                  {item.status}
                                </Tag>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                  Last audit: {item.lastAudit} • Next audit: {item.nextAudit}
                                </div>
                              </Space>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* Sidebar with Recent Activity and Quick Actions */}
        <Col span={6}>
          <Card title="📈 Recent Activity" style={{ marginBottom: 16 }}>
            <Timeline>
              {recentActivities.map((activity, index) => (
                <Timeline.Item
                  key={index}
                  dot={
                    activity.type === 'audit' || activity.type === 'training' ? 
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  }
                >
                  <Space direction="vertical" size={0}>
                    <div style={{ fontWeight: 500 }}>{activity.action}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      by {activity.user}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {activity.time}
                    </div>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>

          <Card title="⚡ Quick Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                icon={<PlusOutlined />} 
                block 
                type="primary"
                onClick={() => setDocumentModalVisible(true)}
              >
                New Risk Assessment
              </Button>
              <Button 
                icon={<BarChartOutlined />} 
                block
              >
                Generate Safety Report
              </Button>
              <Button 
                icon={<SecurityScanOutlined />} 
                block
              >
                Run Infection Control Check
              </Button>
              <Button 
                icon={<TeamOutlined />} 
                block
              >
                Schedule Staff Training
              </Button>
            </Space>
          </Card>

          <Card title="🏥 Patient Safety Metrics" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Medication Safety</span>
                  <span>96%</span>
                </div>
                <Progress percent={96} size="small" status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Infection Control</span>
                  <span>94%</span>
                </div>
                <Progress percent={94} size="small" status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Patient Fall Prevention</span>
                  <span>89%</span>
                </div>
                <Progress percent={89} size="small" status="active" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Document Preview Modal */}
      <Modal
        title={`Preview: ${selectedDocument?.name}`}
        visible={documentModalVisible}
        onCancel={() => setDocumentModalVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} type="primary">
            Download
          </Button>,
          <Button key="customize" icon={<EditOutlined />}>
            Customize
          </Button>,
          <Button key="close" onClick={() => setDocumentModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedDocument && (
          <div>
            <Alert 
              message="Healthcare Document Preview" 
              description="This is a preview of the selected healthcare safety document. All documents comply with healthcare regulations and standards."
              type="info"
              showIcon
            />
            <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
              <h3>Document Details</h3>
              <p><strong>Name:</strong> {selectedDocument.name}</p>
              <p><strong>Type:</strong> {selectedDocument.type}</p>
              <p><strong>Version:</strong> {selectedDocument.version}</p>
              <p><strong>Size:</strong> {selectedDocument.size}</p>
              <p><strong>Last Modified:</strong> {selectedDocument.lastModified}</p>
              <p><strong>Category:</strong> <Tag color={getCategoryColor(selectedDocument.category)}>{selectedDocument.category}</Tag></p>
            </div>
          </div>
        )}
      </Modal>

      {/* AI Service Modal */}
      <Modal
        title="Healthcare AI Service Access"
        visible={aiServiceModalVisible}
        onCancel={() => setAiServiceModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="HIPAA Compliant AI Services"
          description="All AI services are designed to comply with healthcare privacy regulations. Patient data is anonymized and encrypted throughout processing."
          type="info"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <h4>Available Healthcare AI Services:</h4>
          <Collapse>
            <Panel header="Infection Prediction AI" key="1">
              <p>Advanced machine learning for predicting infection outbreaks and identifying high-risk areas in healthcare facilities.</p>
            </Panel>
            <Panel header="Patient Safety Analytics" key="2">
              <p>AI-powered analysis of patient safety incidents to identify patterns and prevent future occurrences.</p>
            </Panel>
            <Panel header="Medical Error Prevention" key="3">
              <p>AI systems designed to identify potential medical errors and provide real-time alerts to healthcare providers.</p>
            </Panel>
          </Collapse>
        </div>
      </Modal>
    </div>
  );
};

export default HealthcareSafety;