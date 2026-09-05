// src/pages/Modules/Industries/MaritimeSafety.js
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
  Table,
  
} from 'antd';
import {
  RocketOutlined,
  FileTextOutlined,
  RobotOutlined,
  ToolOutlined,
  DownloadOutlined,
  EditOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
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
  CompassOutlined,
  RadarOutlined,
  ContainerOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import maritimeSafetyService from '../../../services/maritimeSafetyService';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const MaritimeSafety = () => {
  const { tab = 'tools' } = useParams();
  const history = useHistory();
  const [activeTool, setActiveTool] = useState(null);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [aiServiceModalVisible, setAiServiceModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [fleetData, setFleetData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Enhanced Maritime Specific Data
  const maritimeTools = [
    { 
      id: 1,
      name: 'Vessel Stability Calculator', 
      description: 'Advanced vessel stability analysis under various loading and weather conditions',
      category: 'Critical',
      status: 'active',
      icon: <CalculatorOutlined />,
      features: ['Load Condition Analysis', 'Stability Criteria', 'Damage Stability'],
      usage: '156 times this month',
      rating: 4.8
    },
    { 
      id: 2,
      name: 'Cargo Securing Planner', 
      description: 'Comprehensive cargo securing arrangement planning and verification',
      category: 'Critical',
      status: 'active',
      icon: <ContainerOutlined />,
      features: ['Lashing Calculation', 'Cargo Distribution', 'Safety Factor Analysis'],
      usage: '189 times this month',
      rating: 4.6
    },
    { 
      id: 3,
      name: 'Navigation Risk Assessor', 
      description: 'Advanced navigation risk assessment and route safety optimization',
      category: 'High',
      status: 'active',
      icon: <CompassOutlined />,
      features: ['Route Planning', 'Weather Routing', 'Collision Avoidance'],
      usage: '134 times this month',
      rating: 4.7
    },
    { 
      id: 4,
      name: 'Port Safety Inspector', 
      description: 'Comprehensive port facility and operations safety inspection system',
      category: 'High',
      status: 'beta',
      icon: <SecurityScanOutlined />,
      features: ['Facility Assessment', 'Operation Safety', 'ISPS Compliance'],
      usage: '89 times this month',
      rating: 4.3
    },
    { 
      id: 5,
      name: 'Emergency Response Simulator', 
      description: 'Virtual reality emergency response training for maritime incidents',
      category: 'Critical',
      status: 'active',
      icon: <WarningOutlined />,
      features: ['Incident Simulation', 'Team Coordination', 'Procedure Validation'],
      usage: '67 times this month',
      rating: 4.5
    },
    { 
      id: 6,
      name: 'Environmental Compliance Manager', 
      description: 'Comprehensive environmental compliance tracking and reporting',
      category: 'High',
      status: 'active',
      icon: <EnvironmentOutlined />,
      features: ['MARPOL Compliance', 'Emission Tracking', 'Waste Management'],
      usage: '112 times this month',
      rating: 4.4
    }
  ];

  const maritimeDocuments = [
    { 
      id: 1,
      name: 'Safety Management System (SMS)', 
      type: 'Manual', 
      format: '.docx', 
      size: '4.8MB',
      version: '3.2',
      lastModified: '2024-01-15',
      downloads: 245,
      category: 'Critical',
      status: 'approved',
      tags: ['ISM Code', 'Safety Manual', 'Compliance']
    },
    { 
      id: 2,
      name: 'Emergency Procedures Manual', 
      type: 'Manual', 
      format: '.pdf', 
      size: '3.5MB',
      version: '2.1',
      lastModified: '2024-01-12',
      downloads: 189,
      category: 'Critical',
      status: 'approved',
      tags: ['Emergency', 'Procedures', 'Response']
    },
    { 
      id: 3,
      name: 'Cargo Operations Plan', 
      type: 'Plan', 
      format: '.docx', 
      size: '2.9MB',
      version: '1.8',
      lastModified: '2024-01-10',
      downloads: 167,
      category: 'High',
      status: 'approved',
      tags: ['Cargo', 'Operations', 'Safety']
    },
    { 
      id: 4,
      name: 'Port Security Assessment', 
      type: 'Assessment', 
      format: '.pdf', 
      size: '2.1MB',
      version: '4.0',
      lastModified: '2024-01-08',
      downloads: 134,
      category: 'High',
      status: 'approved',
      tags: ['ISPS', 'Security', 'Assessment']
    },
    { 
      id: 5,
      name: 'Pollution Prevention Plan', 
      type: 'Plan', 
      format: '.docx', 
      size: '3.2MB',
      version: '2.3',
      lastModified: '2024-01-05',
      downloads: 178,
      category: 'Critical',
      status: 'draft',
      tags: ['MARPOL', 'Pollution', 'Environment']
    }
  ];

  const maritimeAIServices = [
    { 
      id: 1,
      name: 'AI Weather Route Optimizer', 
      description: 'Advanced vessel route optimization based on weather patterns and safety considerations',
      status: 'Active',
      features: ['Weather Analysis', 'Route Optimization', 'Fuel Efficiency'],
      usage: '234 optimizations this month',
      accuracy: '96%'
    },
    { 
      id: 2,
      name: 'Vessel Performance Monitor', 
      description: 'Comprehensive vessel performance monitoring and safety parameter analysis',
      status: 'Active',
      features: ['Performance Tracking', 'Safety Parameters', 'Predictive Maintenance'],
      usage: '189 vessels monitored',
      accuracy: '94%'
    },
    { 
      id: 3,
      name: 'Cargo Risk Predictor', 
      description: 'AI-powered prediction of cargo-related risks during transport and handling',
      status: 'Beta',
      features: ['Risk Assessment', 'Cargo Stability', 'Handling Safety'],
      usage: '156 predictions this month',
      accuracy: '89%'
    },
    { 
      id: 4,
      name: 'Port Safety Analytics', 
      description: 'Comprehensive analysis of port safety incidents and trend prediction',
      status: 'Active',
      features: ['Incident Analysis', 'Trend Prediction', 'Safety Improvement'],
      usage: '78 analyses this month',
      accuracy: '92%'
    }
  ];

  const vesselFleet = [
    { 
      id: 1,
      vessel: 'MV Ocean Star', 
      type: 'Container', 
      status: 'At Sea', 
      safety: 'Excellent',
      location: 'Pacific Ocean',
      nextPort: 'Shanghai',
      eta: '2024-01-20'
    },
    { 
      id: 2,
      vessel: 'MV Sea Breeze', 
      type: 'Tanker', 
      status: 'In Port', 
      safety: 'Good',
      location: 'Rotterdam',
      nextPort: 'Singapore',
      eta: '2024-01-25'
    },
    { 
      id: 3,
      vessel: 'MV Wave Rider', 
      type: 'Bulk Carrier', 
      status: 'At Sea', 
      safety: 'Excellent',
      location: 'Indian Ocean',
      nextPort: 'Durban',
      eta: '2024-01-18'
    },
    { 
      id: 4,
      vessel: 'MV Harbor Master', 
      type: 'Tug', 
      status: 'In Port', 
      safety: 'Good',
      location: 'Singapore',
      nextPort: 'Local Operations',
      eta: 'N/A'
    },
    { 
      id: 5,
      vessel: 'MV Pacific Queen', 
      type: 'Passenger', 
      status: 'At Sea', 
      safety: 'Excellent',
      location: 'Caribbean Sea',
      nextPort: 'Miami',
      eta: '2024-01-22'
    }
  ];

  const environmentalCompliance = [
    { 
      requirement: 'MARPOL Annex I - Oil Pollution',
      status: 'Compliant',
      progress: 100,
      lastAudit: '2024-01-10',
      nextAudit: '2024-07-10'
    },
    { 
      requirement: 'MARPOL Annex V - Garbage',
      status: 'Compliant',
      progress: 100,
      lastAudit: '2024-01-08',
      nextAudit: '2024-07-08'
    },
    { 
      requirement: 'Ballast Water Management',
      status: 'Compliant',
      progress: 92,
      lastAudit: '2024-01-12',
      nextAudit: '2024-07-12'
    },
    { 
      requirement: 'Air Emissions (SOx, NOx)',
      status: 'Partial',
      progress: 85,
      lastAudit: '2024-01-05',
      nextAudit: '2024-07-05'
    },
    { 
      requirement: 'Sewage Treatment',
      status: 'Compliant',
      progress: 100,
      lastAudit: '2024-01-15',
      nextAudit: '2024-07-15'
    }
  ];

  const recentActivities = [
    { action: 'Vessel Safety Inspection Completed', user: 'Safety Officer', time: '2 hours ago', type: 'inspection' },
    { action: 'New SMS Document Uploaded', user: 'Quality Manager', time: '4 hours ago', type: 'upload' },
    { action: 'Emergency Drill Conducted', user: 'Crew Training', time: '1 day ago', type: 'drill' },
    { action: 'Port State Control Inspection', user: 'Port Authorities', time: '2 days ago', type: 'inspection' }
  ];

  const fleetColumns = [
    {
      title: 'Vessel',
      dataIndex: 'vessel',
      key: 'vessel',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'At Sea' ? 'blue' : 'green'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Safety Rating',
      dataIndex: 'safety',
      key: 'safety',
      render: (safety) => (
        <Tag color={safety === 'Excellent' ? 'green' : safety === 'Good' ? 'blue' : 'orange'}>
          {safety}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />}>View</Button>
          <Button size="small" icon={<BarChartOutlined />}>Stats</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    setDocuments(maritimeDocuments);
    setFleetData(vesselFleet);
    loadFleetData();
  }, []);

  const loadFleetData = async () => {
    try {
      setLoading(true);
      const response = await maritimeSafetyService.fleet.getFleetStatus();
      setFleetData(response.data);
    } catch (error) {
      console.error('Failed to load fleet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolLaunch = (tool) => {
    setActiveTool(tool);
    Modal.info({
      title: `Launching ${tool.name}`,
      content: `Initializing ${tool.name} for maritime safety analysis...`,
      okText: 'Continue',
      onOk: () => console.log('Maritime tool launched:', tool.name)
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

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header with Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <RocketOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Maritime Safety Management</span>
              </Space>
            } 
            style={{ borderLeft: '6px solid #1890ff' }}
            extra={
              <Space>
                <Button icon={<PlusOutlined />} type="primary">
                  New Safety Plan
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
                  title="Active Vessels" 
                  value={12} 
                  prefix={<RocketOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="Safety Compliance" 
                  value={98} 
                  suffix="%" 
                  prefix={<SafetyCertificateOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="At Sea" 
                  value={8} 
                  prefix={<CompassOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="In Port" 
                  value={4} 
                  prefix={<GlobalOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Alert
        message="Global Operations Active"
        description="All vessels operating within safety parameters. Weather routing systems active for at-sea vessels."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 24]}>
        <Col span={18}>
          <Card>
            <Tabs 
              activeKey={tab} 
              onChange={(key) => history.push(`/hse/maritime/${key}`)}
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
              <TabPane tab={<span><ToolOutlined /> Safety Tools ({maritimeTools.length})</span>} key="tools">
                <Row gutter={[16, 16]}>
                  {maritimeTools.map(tool => (
                    <Col xs={24} md={12} lg={8} key={tool.id}>
                      <Card
                        hoverable
                        style={{ height: '100%' }}
                        actions={[
                          <Tooltip title="Launch Tool">
                            <PlayCircleOutlined 
                              onClick={() => handleToolLaunch(tool)}
                              style={{ color: '#1890ff' }}
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
                              style={{ backgroundColor: '#1890ff' }}
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
                              style={{ backgroundColor: '#1890ff' }}
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
              <TabPane tab={<span><RobotOutlined /> AI Services ({maritimeAIServices.length})</span>} key="ai">
                <Row gutter={[16, 16]}>
                  {maritimeAIServices.map(service => (
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
                              style={{ backgroundColor: '#1890ff' }}
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

              {/* Fleet Management Tab */}
              <TabPane tab={<span><RocketOutlined /> Fleet Management ({fleetData.length})</span>} key="fleet">
                <Card title="Vessel Fleet Status" loading={loading}>
                  <Table 
                    dataSource={fleetData} 
                    columns={fleetColumns}
                    pagination={false}
                    rowKey="id"
                  />
                  
                  <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col xs={12} sm={6}>
                      <Card size="small">
                        <Statistic title="Total Vessels" value={fleetData.length} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small">
                        <Statistic title="At Sea" value={fleetData.filter(v => v.status === 'At Sea').length} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small">
                        <Statistic title="In Port" value={fleetData.filter(v => v.status === 'In Port').length} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Card size="small">
                        <Statistic title="Excellent Safety" value={fleetData.filter(v => v.safety === 'Excellent').length} />
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </TabPane>

              {/* Environmental Tab */}
              <TabPane tab={<span><EnvironmentOutlined /> Environmental Compliance</span>} key="environmental">
                <Card title="Environmental Compliance Status">
                  <List
                    dataSource={environmentalCompliance}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Progress 
                            percent={item.progress} 
                            size="small" 
                            status={item.progress === 100 ? 'success' : item.progress >= 80 ? 'active' : 'exception'}
                          />
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              icon={<EnvironmentOutlined />} 
                              style={{ 
                                backgroundColor: item.status === 'Compliant' ? '#52c41a' : 
                                              item.status === 'Partial' ? '#faad14' : '#f5222d'
                              }}
                            />
                          }
                          title={item.requirement}
                          description={
                            <Space direction="vertical" size={0}>
                              <Tag color={item.status === 'Compliant' ? 'green' : 'orange'}>
                                {item.status}
                              </Tag>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                Last audit: {item.lastAudit} • Next audit: {item.nextAudit}
                              </div>
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
                    activity.type === 'inspection' || activity.type === 'drill' ? 
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
                New Safety Inspection
              </Button>
              <Button 
                icon={<BarChartOutlined />} 
                block
              >
                Generate Voyage Report
              </Button>
              <Button 
                icon={<SecurityScanOutlined />} 
                block
              >
                Run Stability Check
              </Button>
              <Button 
                icon={<TeamOutlined />} 
                block
              >
                Schedule Emergency Drill
              </Button>
            </Space>
          </Card>

          <Card title="🏆 Safety Metrics" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Vessel Safety</span>
                  <span>98%</span>
                </div>
                <Progress percent={98} size="small" status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cargo Safety</span>
                  <span>96%</span>
                </div>
                <Progress percent={96} size="small" status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Environmental Compliance</span>
                  <span>94%</span>
                </div>
                <Progress percent={94} size="small" status="active" />
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
              message="Maritime Document Preview" 
              description="This is a preview of the selected maritime safety document. You can download or customize it as needed."
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
        title="Maritime AI Service Access"
        visible={aiServiceModalVisible}
        onCancel={() => setAiServiceModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="Maritime AI Service Integration"
          description="This feature integrates with our advanced AI services specifically designed for maritime safety and operations."
          type="info"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <h4>Available Maritime AI Services:</h4>
          <Collapse>
            <Panel header="Weather Route Optimization" key="1">
              <p>AI-powered vessel route optimization based on weather patterns, safety considerations, and fuel efficiency.</p>
            </Panel>
            <Panel header="Vessel Performance Monitoring" key="2">
              <p>Comprehensive monitoring of vessel performance parameters and safety indicators using AI analytics.</p>
            </Panel>
            <Panel header="Cargo Risk Prediction" key="3">
              <p>AI-driven prediction of cargo-related risks during transport, handling, and storage operations.</p>
            </Panel>
          </Collapse>
        </div>
      </Modal>
    </div>
  );
};

export default MaritimeSafety;