// src/pages/Modules/Industries/OilGasSafety.js
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
  message,
  Spin
} from 'antd';
import {
  ThunderboltOutlined,
  FileTextOutlined,
  RobotOutlined,
  ToolOutlined,
  DownloadOutlined,
  EditOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
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
  ExperimentOutlined,
  FireOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import oilGasSafetyService from '../../../services/oilGasSafetyService';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const OilGasSafety = () => {
  const { tab = 'tools' } = useParams();
  const history = useHistory();
  const [activeTool, setActiveTool] = useState(null);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [aiServiceModalVisible, setAiServiceModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [tools, setTools] = useState([]);
  const [aiServices, setAiServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [industryData, setIndustryData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  // Enhanced Oil & Gas Specific Data
  const oilGasTools = [
    { 
      id: 1,
      name: 'Process Hazard Analysis (PHA) Tool', 
      description: 'Comprehensive PHA for process units with AI-assisted hazard identification',
      category: 'Critical', 
      status: 'active',
      icon: <SecurityScanOutlined />,
      features: ['AI Hazard Detection', 'Automated Report Generation', 'Risk Matrix Integration'],
      usage: '245 times this month',
      rating: 4.8
    },
    { 
      id: 2,
      name: 'Bowtie Risk Assessment', 
      description: 'Visual risk assessment methodology with dynamic threat and consequence mapping',
      category: 'Critical', 
      status: 'active',
      icon: <AuditOutlined />,
      features: ['Interactive Diagrams', 'Real-time Risk Updates', 'Compliance Tracking'],
      usage: '189 times this month',
      rating: 4.6
    },
    { 
      id: 3,
      name: 'Emergency Shutdown Calculator', 
      description: 'Advanced ESD system response calculations with scenario modeling',
      category: 'High', 
      status: 'active',
      icon: <CalculatorOutlined />,
      features: ['Scenario Simulation', 'Response Time Analysis', 'Safety Integrity Level (SIL) Verification'],
      usage: '156 times this month',
      rating: 4.7
    },
    { 
      id: 4,
      name: 'Flare System Sizing Tool', 
      description: 'Calculate flare system requirements for emergency relief scenarios',
      category: 'High', 
      status: 'beta',
      icon: <FireOutlined />,
      features: ['Relief Load Calculation', 'Flare Stack Sizing', 'Environmental Impact Assessment'],
      usage: '89 times this month',
      rating: 4.4
    },
    { 
      id: 5,
      name: 'H2S Risk Assessment', 
      description: 'Comprehensive hydrogen sulfide risk evaluation and monitoring',
      category: 'Critical', 
      status: 'active',
      icon: <ExperimentOutlined />,
      features: ['Gas Dispersion Modeling', 'Exposure Limit Monitoring', 'Emergency Response Planning'],
      usage: '134 times this month',
      rating: 4.9
    },
    { 
      id: 6,
      name: 'Pipeline Integrity Manager', 
      description: 'Pipeline safety and integrity management with predictive maintenance',
      category: 'High', 
      status: 'active',
      icon: <EnvironmentOutlined />,
      features: ['Corrosion Monitoring', 'Inspection Scheduling', 'Risk-Based Inspection Planning'],
      usage: '178 times this month',
      rating: 4.5
    }
  ];

  const oilGasDocuments = [
    { 
      id: 1,
      name: 'HAZOP Study Template', 
      type: 'Risk Assessment', 
      format: '.docx', 
      size: '2.4MB',
      version: '3.2',
      lastModified: '2024-01-15',
      downloads: 245,
      category: 'Critical',
      status: 'approved',
      tags: ['PHA', 'Process Safety', 'OSHA']
    },
    { 
      id: 2,
      name: 'Hot Work Permit - Offshore', 
      type: 'PTW', 
      format: '.pdf', 
      size: '1.1MB',
      version: '4.0',
      lastModified: '2024-01-10',
      downloads: 189,
      category: 'Critical',
      status: 'approved',
      tags: ['Permit to Work', 'Offshore', 'Fire Safety']
    },
    { 
      id: 3,
      name: 'Well Control Procedure', 
      type: 'Procedure', 
      format: '.docx', 
      size: '3.2MB',
      version: '2.1',
      lastModified: '2024-01-08',
      downloads: 167,
      category: 'Critical',
      status: 'approved',
      tags: ['Well Control', 'BOP', 'Drilling']
    },
    { 
      id: 4,
      name: 'Process Safety Management Manual', 
      type: 'Manual', 
      format: '.pdf', 
      size: '5.7MB',
      version: '1.5',
      lastModified: '2024-01-05',
      downloads: 198,
      category: 'High',
      status: 'approved',
      tags: ['PSM', 'Compliance', 'Management System']
    },
    { 
      id: 5,
      name: 'Emergency Response Plan - Refinery', 
      type: 'Emergency Plan', 
      format: '.docx', 
      size: '4.2MB',
      version: '3.0',
      lastModified: '2024-01-12',
      downloads: 156,
      category: 'Critical',
      status: 'draft',
      tags: ['ERP', 'Refinery', 'Emergency']
    }
  ];

  const oilGasAIServices = [
    { 
      id: 1,
      name: 'AI Document Generator', 
      description: 'Generate comprehensive safety documents using advanced AI with industry-specific templates',
      status: 'Active',
      features: ['Smart Template Selection', 'Regulatory Compliance Check', 'Multi-format Export'],
      usage: '1.2K documents generated',
      accuracy: '94%'
    },
    { 
      id: 2,
      name: 'Risk Prediction Engine', 
      description: 'Predict incident probability using machine learning and historical data analysis',
      status: 'Beta',
      features: ['Real-time Risk Scoring', 'Predictive Analytics', 'Trend Analysis'],
      usage: '456 risk assessments',
      accuracy: '89%'
    },
    { 
      id: 3,
      name: 'Compliance Checker Pro', 
      description: 'AI-powered regulatory compliance verification with automatic updates',
      status: 'Active',
      features: ['Regulation Monitoring', 'Compliance Gap Analysis', 'Audit Preparation'],
      usage: '789 compliance checks',
      accuracy: '96%'
    },
    { 
      id: 4,
      name: 'Incident Analysis AI', 
      description: 'Advanced incident root cause analysis with pattern recognition',
      status: 'Active',
      features: ['Root Cause Identification', 'Trend Pattern Detection', 'Preventive Action Suggestions'],
      usage: '234 incident analyses',
      accuracy: '91%'
    }
  ];

  useEffect(() => {
    loadIndustryData();
    setDocuments(oilGasDocuments);
    setTools(oilGasTools);
    setAiServices(oilGasAIServices);
  }, []);

  const loadIndustryData = async () => {
    try {
      setLoading(true);
      
      // Load industry configuration
      const configResponse = await oilGasSafetyService.industry.getIndustryConfig();
      setIndustryData(configResponse.data);

      // Load dashboard data
      const dashboardResponse = await oilGasSafetyService.industry.getIndustryDashboard();
      
      // Load recent activities
      const incidentsResponse = await oilGasSafetyService.incidents.getIncidents({ limit: 5 });
      const activities = incidentsResponse.data.map(incident => ({
        action: `Incident Reported: ${incident.title}`,
        user: incident.reportedBy,
        time: new Date(incident.reportedAt).toLocaleDateString(),
        type: 'incident'
      }));
      setRecentActivities(activities);

    } catch (error) {
      console.error('Error loading industry data:', error);
      message.error('Failed to load industry data');
    } finally {
      setLoading(false);
    }
  };

  const handleToolLaunch = async (tool) => {
    try {
      setActiveTool(tool);
      
      // Example tool execution with parameters
      const toolParameters = {
        facility_type: 'refinery',
        process_unit: 'crude_distillation',
        analysis_depth: 'comprehensive'
      };

      let response;
      
      // Execute specific tool based on tool ID or name
      switch(tool.id) {
        case 1: // PHA Tool
          response = await oilGasSafetyService.tools.performHAZOPStudy(
            { process_unit: 'crude_distillation' },
            { analysis_type: 'comprehensive' }
          );
          break;
        case 2: // Bowtie Risk Assessment
          response = await oilGasSafetyService.risk.calculateRiskMatrix(
            { hazards: ['fire', 'explosion'] },
            { consequences: ['personnel', 'environment', 'equipment'] }
          );
          break;
        case 5: // H2S Risk Assessment
          response = await oilGasSafetyService.tools.calculateH2SRisk(
            { facility_data: { type: 'production_platform' } },
            { operational_conditions: { wind_speed: 5, temperature: 25 } }
          );
          break;
        default:
          // Generic tool execution
          response = await oilGasSafetyService.tools.executeTool(
            tool.id,
            toolParameters,
            { industry: 'oil_gas' }
          );
      }

      Modal.info({
        title: `Launching ${tool.name}`,
        content: (
          <div>
            <p>Tool initialized successfully with advanced safety calculations.</p>
            <Alert 
              message="Analysis Complete" 
              description={`Risk level: ${response.data?.risk_level || 'Medium'}`}
              type="info"
              showIcon
            />
          </div>
        ),
        okText: 'View Results',
        onOk: () => {
          // Navigate to tool results or open results modal
          console.log('Tool results:', response.data);
        }
      });

    } catch (error) {
      console.error('Error launching tool:', error);
      message.error(`Failed to launch ${tool.name}`);
    }
  };

  const handleDocumentAction = async (action, document) => {
    try {
      switch (action) {
        case 'preview':
          setSelectedDocument(document);
          setDocumentModalVisible(true);
          break;
        case 'download':
          const downloadResponse = await oilGasSafetyService.documents.downloadDocument(document.id);
          
          // Create blob and download
          const blob = new Blob([downloadResponse.data]);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${document.name}${document.format}`;
          link.click();
          window.URL.revokeObjectURL(url);
          
          message.success(`Downloading ${document.name}...`);
          break;
        case 'customize':
          // Navigate to document editor or open customization modal
          history.push(`/documents/edit/${document.id}`);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling document action:', error);
      message.error('Failed to perform document action');
    }
  };

  const handleAIServiceAccess = async (service) => {
    try {
      setAiServiceModalVisible(true);
      
      // Get AI service status
      const statusResponse = await oilGasSafetyService.ai.getServiceStatus(service.id);
      
      if (statusResponse.data.status === 'active') {
        message.info(`Accessing ${service.name}...`);
        
        // Example AI service usage
        const aiResponse = await oilGasSafetyService.ai.accessService(
          service.id,
          { 
            query: 'Generate safety procedure for hot work',
            context: { industry: 'oil_gas', facility_type: 'refinery' }
          }
        );
        
        console.log('AI Service Response:', aiResponse.data);
      } else {
        message.warning(`${service.name} is currently unavailable`);
      }
    } catch (error) {
      console.error('Error accessing AI service:', error);
      message.error('Failed to access AI service');
    }
  };

  const handleNewRiskAssessment = async () => {
    try {
      const assessmentData = {
        title: 'New Process Hazard Analysis',
        facility: 'Main Refinery Unit',
        assessment_type: 'pha',
        priority: 'high'
      };

      const response = await oilGasSafetyService.risk.createAssessment(assessmentData);
      
      message.success('New risk assessment created successfully');
      setDocumentModalVisible(false);
      
      // Refresh documents list
      const docsResponse = await oilGasSafetyService.documents.getDocuments();
      setDocuments(docsResponse.data);

    } catch (error) {
      console.error('Error creating risk assessment:', error);
      message.error('Failed to create risk assessment');
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'safety_procedure');
      formData.append('industry_code', 'oil_gas');

      const response = await oilGasSafetyService.upload.uploadFile(
        file,
        'documents',
        { 
          facility: 'refinery',
          document_type: 'safety_procedure'
        }
      );

      message.success('File uploaded successfully');
      
      // Refresh documents list
      const docsResponse = await oilGasSafetyService.documents.getDocuments();
      setDocuments(docsResponse.data);

    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file');
    }
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Loading Oil & Gas Safety Data..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header with Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#389e0d', fontSize: '24px' }} />
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Oil & Gas Safety Management</span>
              </Space>
            } 
            style={{ borderLeft: '6px solid #389e0d' }}
            extra={
              <Space>
                <Button 
                  icon={<PlusOutlined />} 
                  type="primary"
                  onClick={handleNewRiskAssessment}
                >
                  New Risk Assessment
                </Button>
                <Upload 
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>
                    Upload
                  </Button>
                </Upload>
              </Space>
            }
          >
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="Active Tools" 
                  value={tools.length} 
                  prefix={<ToolOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="Documents" 
                  value={documents.length} 
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="AI Services" 
                  value={aiServices.length} 
                  prefix={<RobotOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="Compliance Score" 
                  value={industryData?.compliance_score || 96} 
                  suffix="%" 
                  prefix={<SafetyCertificateOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={18}>
          <Card>
            <Tabs 
              activeKey={tab} 
              onChange={(key) => history.push(`/hse/oil_gas/${key}`)}
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
                        <Option value="Medium">Medium</Option>
                      </Select>
                    </>
                  )}
                </Space>
              }
            >
              {/* Safety Tools Tab */}
              <TabPane tab={<span><ToolOutlined /> Safety Tools ({tools.length})</span>} key="tools">
                <Row gutter={[16, 16]}>
                  {tools.map(tool => (
                    <Col xs={24} md={12} lg={8} key={tool.id}>
                      <Card
                        hoverable
                        style={{ height: '100%' }}
                        actions={[
                          <Tooltip title="Launch Tool">
                            <PlayCircleOutlined 
                              onClick={() => handleToolLaunch(tool)}
                              style={{ color: '#389e0d' }}
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
                              style={{ backgroundColor: '#389e0d' }}
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleNewRiskAssessment}>
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
                              style={{ backgroundColor: '#389e0d' }}
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
              <TabPane tab={<span><RobotOutlined /> AI Services ({aiServices.length})</span>} key="ai">
                <Row gutter={[16, 16]}>
                  {aiServices.map(service => (
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
                              style={{ backgroundColor: '#389e0d' }}
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
                    activity.type === 'success' ? 
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
                onClick={handleNewRiskAssessment}
              >
                New Risk Assessment
              </Button>
              <Button 
                icon={<BarChartOutlined />} 
                block
                onClick={async () => {
                  try {
                    const response = await oilGasSafetyService.analytics.generateReport({
                      report_type: 'safety_metrics',
                      timeframe: '30d'
                    });
                    message.success('Safety report generated successfully');
                  } catch (error) {
                    message.error('Failed to generate report');
                  }
                }}
              >
                Generate Safety Report
              </Button>
              <Button 
                icon={<SecurityScanOutlined />} 
                block
                onClick={async () => {
                  try {
                    const response = await oilGasSafetyService.compliance.getComplianceStatus();
                    message.info(`Compliance Status: ${response.data.status}`);
                  } catch (error) {
                    message.error('Failed to check compliance');
                  }
                }}
              >
                Run Compliance Check
              </Button>
              <Button 
                icon={<TeamOutlined />} 
                block
              >
                Schedule Safety Audit
              </Button>
            </Space>
          </Card>

          <Card title="🏆 Safety Metrics" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Process Safety</span>
                  <span>94%</span>
                </div>
                <Progress percent={94} size="small" status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Training Compliance</span>
                  <span>88%</span>
                </div>
                <Progress percent={88} size="small" status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Incident Response</span>
                  <span>96%</span>
                </div>
                <Progress percent={96} size="small" status="active" />
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
          <Button 
            key="download" 
            icon={<DownloadOutlined />} 
            type="primary"
            onClick={() => selectedDocument && handleDocumentAction('download', selectedDocument)}
          >
            Download
          </Button>,
          <Button 
            key="customize" 
            icon={<EditOutlined />}
            onClick={() => selectedDocument && handleDocumentAction('customize', selectedDocument)}
          >
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
              message="Document Preview" 
              description="This is a preview of the selected document. You can download or customize it as needed."
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
            </div>
          </div>
        )}
      </Modal>

      {/* AI Service Modal */}
      <Modal
        title="AI Service Access"
        visible={aiServiceModalVisible}
        onCancel={() => setAiServiceModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="AI Service Integration"
          description="This feature integrates with our advanced AI services to provide intelligent safety analysis and document generation."
          type="info"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <h4>Available AI Services:</h4>
          <Collapse>
            <Panel header="Document Generation AI" key="1">
              <p>Generate comprehensive safety documents with AI-powered content creation.</p>
            </Panel>
            <Panel header="Risk Prediction Engine" key="2">
              <p>Predict potential safety incidents using machine learning algorithms.</p>
            </Panel>
            <Panel header="Compliance Checker" key="3">
              <p>Automatically verify regulatory compliance across all safety documents.</p>
            </Panel>
          </Collapse>
        </div>
      </Modal>
    </div>
  );
};

export default OilGasSafety;