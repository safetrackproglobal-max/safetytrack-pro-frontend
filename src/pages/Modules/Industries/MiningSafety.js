// src/pages/Modules/Industries/MiningSafety.js
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
  GoldOutlined,
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
  ThunderboltOutlined,
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
  ClockCircleOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FallOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import miningSafetyService from '../../../services/miningSafetyService';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const MiningSafety = () => {
  const { tab = 'tools' } = useParams();
  const history = useHistory();
  const [activeTool, setActiveTool] = useState(null);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [aiServiceModalVisible, setAiServiceModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [realTimeData, setRealTimeData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Enhanced Mining Specific Data
  const miningTools = [
    { 
      id: 1,
      name: 'Ground Stability Analyzer', 
      description: 'Advanced rock stability analysis with real-time ground control monitoring',
      category: 'Critical',
      status: 'active',
      icon: <SecurityScanOutlined />,
      features: ['Real-time Monitoring', 'Rock Fall Prediction', 'Support System Analysis'],
      usage: '189 times this month',
      rating: 4.7
    },
    { 
      id: 2,
      name: 'Ventilation System Calculator', 
      description: 'Comprehensive airflow calculation and gas dilution analysis',
      category: 'Critical',
      status: 'active',
      icon: <EnvironmentOutlined />,
      features: ['Airflow Optimization', 'Gas Dispersion Modeling', 'Ventilation Network Design'],
      usage: '156 times this month',
      rating: 4.5
    },
    { 
      id: 3,
      name: 'Explosives Safety Planner', 
      description: 'Advanced planning and monitoring for explosive operations',
      category: 'Critical',
      status: 'active',
      icon: <WarningOutlined />,
      features: ['Blast Pattern Design', 'Vibration Monitoring', 'Safety Zone Calculation'],
      usage: '134 times this month',
      rating: 4.8
    },
    { 
      id: 4,
      name: 'Dust Exposure Monitor', 
      description: 'Real-time respirable dust monitoring and control system',
      category: 'High',
      status: 'beta',
      icon: <ExperimentOutlined />,
      features: ['Real-time Monitoring', 'Exposure Alerts', 'Control Recommendations'],
      usage: '98 times this month',
      rating: 4.3
    },
    { 
      id: 5,
      name: 'Mine Rescue Simulator', 
      description: 'Virtual reality mine rescue training and scenario simulation',
      category: 'High',
      status: 'active',
      icon: <TeamOutlined />,
      features: ['VR Training', 'Scenario Simulation', 'Team Coordination'],
      usage: '67 times this month',
      rating: 4.6
    },
    { 
      id: 6,
      name: 'Geotechnical Risk Assessor', 
      description: 'Comprehensive geotechnical risk assessment and monitoring',
      category: 'Critical',
      status: 'active',
      icon: <GoldOutlined />,
      features: ['Slope Stability', 'Ground Movement', 'Risk Visualization'],
      usage: '112 times this month',
      rating: 4.4
    }
  ];

  const miningDocuments = [
    { 
      id: 1,
      name: 'Mine Safety and Health Plan', 
      type: 'Safety Plan', 
      format: '.docx', 
      size: '4.2MB',
      version: '2.1',
      lastModified: '2024-01-15',
      downloads: 189,
      category: 'Critical',
      status: 'approved',
      tags: ['MSHA', 'Compliance', 'Safety Plan']
    },
    { 
      id: 2,
      name: 'Ground Control Plan', 
      type: 'Technical Plan', 
      format: '.pdf', 
      size: '3.8MB',
      version: '3.0',
      lastModified: '2024-01-12',
      downloads: 156,
      category: 'Critical',
      status: 'approved',
      tags: ['Geotechnical', 'Rock Mechanics', 'Stability']
    },
    { 
      id: 3,
      name: 'Explosives Storage Permit', 
      type: 'Permit', 
      format: '.pdf', 
      size: '1.6MB',
      version: '1.2',
      lastModified: '2024-01-10',
      downloads: 134,
      category: 'Critical',
      status: 'approved',
      tags: ['Explosives', 'Storage', 'ATF']
    },
    { 
      id: 4,
      name: 'Ventilation System Record', 
      type: 'Record', 
      format: '.xlsx', 
      size: '2.1MB',
      version: '4.1',
      lastModified: '2024-01-08',
      downloads: 178,
      category: 'High',
      status: 'approved',
      tags: ['Ventilation', 'Air Quality', 'Monitoring']
    },
    { 
      id: 5,
      name: 'Emergency Response Procedure', 
      type: 'Procedure', 
      format: '.docx', 
      size: '3.5MB',
      version: '2.3',
      lastModified: '2024-01-05',
      downloads: 167,
      category: 'Critical',
      status: 'draft',
      tags: ['Emergency', 'Rescue', 'Response']
    }
  ];

  const miningAIServices = [
    { 
      id: 1,
      name: 'AI Rock Fall Predictor', 
      description: 'Advanced rock fall hazard prediction using geological data and machine learning',
      status: 'Active',
      features: ['Real-time Prediction', 'Geological Analysis', 'Risk Visualization'],
      usage: '234 predictions this month',
      accuracy: '96%'
    },
    { 
      id: 2,
      name: 'Gas Detection Analytics', 
      description: 'Comprehensive gas detection pattern analysis and hazardous condition prediction',
      status: 'Active',
      features: ['Pattern Recognition', 'Early Warning', 'Trend Analysis'],
      usage: '189 analyses this month',
      accuracy: '92%'
    },
    { 
      id: 3,
      name: 'Equipment Failure Predictor', 
      description: 'Predict mining equipment failures using IoT data and predictive maintenance',
      status: 'Beta',
      features: ['Predictive Maintenance', 'Equipment Monitoring', 'Failure Prevention'],
      usage: '156 predictions this month',
      accuracy: '88%'
    },
    { 
      id: 4,
      name: 'Mine Rescue Optimizer', 
      description: 'AI-powered mine rescue operation optimization and simulation',
      status: 'Active',
      features: ['Rescue Planning', 'Route Optimization', 'Resource Allocation'],
      usage: '78 optimizations this month',
      accuracy: '94%'
    }
  ];

  const safetyMonitoring = [
    { time: '08:00', parameter: 'Methane Levels', value: '0.25%', status: 'Normal', trend: 'stable' },
    { time: '08:30', parameter: 'Oxygen Levels', value: '20.8%', status: 'Normal', trend: 'stable' },
    { time: '09:15', parameter: 'Carbon Monoxide', value: '8 PPM', status: 'Normal', trend: 'stable' },
    { time: '10:00', parameter: 'Dust Levels', value: '1.2 mg/m³', status: 'Warning', trend: 'rising' },
    { time: '10:45', parameter: 'Temperature', value: '28°C', status: 'Normal', trend: 'stable' },
    { time: '11:20', parameter: 'Humidity', value: '65%', status: 'Normal', trend: 'stable' },
  ];

  const mineRescueTeams = [
    { name: 'Team Alpha', status: 'Available', members: 8, location: 'Shaft 1', lastDrill: '2024-01-10' },
    { name: 'Team Bravo', status: 'Standby', members: 7, location: 'Shaft 2', lastDrill: '2024-01-08' },
    { name: 'Team Charlie', status: 'Training', members: 6, location: 'Surface', lastDrill: '2024-01-05' },
  ];

  const emergencyEquipment = [
    { equipment: 'Self-Rescuers', status: 'Fully Stocked', quantity: 150, lastCheck: '2024-01-12' },
    { equipment: 'Communication Systems', status: 'Operational', quantity: 25, lastCheck: '2024-01-14' },
    { equipment: 'Emergency Shelters', status: 'Ready', quantity: 12, lastCheck: '2024-01-11' },
    { equipment: 'First Aid Kits', status: 'Needs Restock', quantity: 45, lastCheck: '2024-01-13' },
    { equipment: 'Breathing Apparatus', status: 'Operational', quantity: 30, lastCheck: '2024-01-10' },
  ];

  const recentActivities = [
    { action: 'Ground Stability Scan Completed', user: 'Geotech Team', time: '2 hours ago', type: 'scan' },
    { action: 'Ventilation System Maintenance', user: 'Engineering', time: '4 hours ago', type: 'maintenance' },
    { action: 'Safety Audit Conducted', user: 'Safety Officers', time: '1 day ago', type: 'audit' },
    { action: 'Emergency Drill Completed', user: 'Rescue Teams', time: '2 days ago', type: 'drill' }
  ];

  useEffect(() => {
    setDocuments(miningDocuments);
    loadRealTimeData();
  }, []);

  const loadRealTimeData = async () => {
    try {
      setLoading(true);
      const response = await miningSafetyService.monitoring.getRealTimeData();
      setRealTimeData(response.data);
    } catch (error) {
      console.error('Failed to load real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolLaunch = (tool) => {
    setActiveTool(tool);
    Modal.info({
      title: `Launching ${tool.name}`,
      content: `Initializing ${tool.name} for mining safety analysis...`,
      okText: 'Continue',
      onOk: () => console.log('Mining tool launched:', tool.name)
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

  const getTrendIcon = (trend) => {
    return trend === 'rising' ? <RiseOutlined style={{ color: '#cf1322' }} /> : 
           trend === 'falling' ? <FallOutlined style={{ color: '#52c41a' }} /> : 
           <DashboardOutlined style={{ color: '#1890ff' }} />;
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header with Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <GoldOutlined style={{ color: '#faad14', fontSize: '24px' }} />
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Mining Safety Management</span>
              </Space>
            } 
            style={{ borderLeft: '6px solid #faad14' }}
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
                  title="Active Mines" 
                  value={3} 
                  prefix={<GoldOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="Safety Compliance" 
                  value={94} 
                  suffix="%" 
                  prefix={<SafetyCertificateOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="Active Miners" 
                  value={147} 
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic 
                  title="Days Without Incident" 
                  value={127} 
                  prefix={<SafetyCertificateOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Alert
        message="Underground Operations Active"
        description="All safety systems operational in Shafts 1, 2, and 3. Ventilation systems at 95% capacity."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 24]}>
        <Col span={18}>
          <Card>
            <Tabs 
              activeKey={tab} 
              onChange={(key) => history.push(`/hse/mining/${key}`)}
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
              <TabPane tab={<span><ToolOutlined /> Safety Tools ({miningTools.length})</span>} key="tools">
                <Row gutter={[16, 16]}>
                  {miningTools.map(tool => (
                    <Col xs={24} md={12} lg={8} key={tool.id}>
                      <Card
                        hoverable
                        style={{ height: '100%' }}
                        actions={[
                          <Tooltip title="Launch Tool">
                            <PlayCircleOutlined 
                              onClick={() => handleToolLaunch(tool)}
                              style={{ color: '#faad14' }}
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
                              style={{ backgroundColor: '#faad14' }}
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
                              style={{ backgroundColor: '#faad14' }}
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
              <TabPane tab={<span><RobotOutlined /> AI Services ({miningAIServices.length})</span>} key="ai">
                <Row gutter={[16, 16]}>
                  {miningAIServices.map(service => (
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
                              style={{ backgroundColor: '#faad14' }}
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

              {/* Monitoring Tab */}
              <TabPane tab={<span><EnvironmentOutlined /> Real-time Monitoring</span>} key="monitoring">
                <Card title="Mine Atmospheric Conditions - Live Monitoring" loading={loading}>
                  <Timeline>
                    {safetyMonitoring.map((reading, index) => (
                      <Timeline.Item
                        key={index}
                        color={reading.status === 'Warning' ? 'orange' : 'green'}
                        dot={reading.status === 'Warning' ? <WarningOutlined /> : <SafetyCertificateOutlined />}
                      >
                        <Space direction="vertical" size={0}>
                          <div style={{ fontWeight: 500 }}>
                            <Space>
                              {reading.parameter}: {reading.value}
                              {getTrendIcon(reading.trend)}
                            </Space>
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Time: {reading.time} • Status: {reading.status} • Trend: {reading.trend}
                          </div>
                        </Space>
                      </Timeline.Item>
                    ))}
                  </Timeline>

                  <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic title="Active Miners" value={147} prefix={<TeamOutlined />} />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic title="Equipment Online" value={89} suffix="%" />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic title="Ventilation Efficiency" value={95} suffix="%" />
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </TabPane>

              {/* Emergency Tab */}
              <TabPane tab={<span><WarningOutlined /> Emergency Preparedness</span>} key="emergency">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card title="Mine Rescue Teams" size="small">
                      <Table
                        dataSource={mineRescueTeams}
                        pagination={false}
                        size="small"
                        columns={[
                          {
                            title: 'Team',
                            dataIndex: 'name',
                            key: 'name',
                          },
                          {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status',
                            render: (status) => (
                              <Tag color={status === 'Available' ? 'green' : 'orange'}>
                                {status}
                              </Tag>
                            )
                          },
                          {
                            title: 'Members',
                            dataIndex: 'members',
                            key: 'members',
                          },
                          {
                            title: 'Last Drill',
                            dataIndex: 'lastDrill',
                            key: 'lastDrill',
                          }
                        ]}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Emergency Equipment Status" size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {emergencyEquipment.map((item, index) => (
                          <div key={index}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span>{item.equipment}</span>
                              <Tag color={item.status === 'Fully Stocked' || item.status === 'Operational' || item.status === 'Ready' ? 'green' : 'orange'}>
                                {item.status}
                              </Tag>
                            </div>
                            <Progress 
                              percent={item.status === 'Needs Restock' ? 65 : 100} 
                              size="small" 
                              status={item.status === 'Needs Restock' ? 'exception' : 'success'}
                            />
                            <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                              Quantity: {item.quantity} • Last checked: {item.lastCheck}
                            </div>
                            <Divider style={{ margin: '8px 0' }} />
                          </div>
                        ))}
                      </Space>
                    </Card>
                  </Col>
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
                    activity.type === 'scan' || activity.type === 'audit' ? 
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
                Generate Mining Report
              </Button>
              <Button 
                icon={<SecurityScanOutlined />} 
                block
              >
                Run Ground Stability Scan
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
                  <span>Ground Stability</span>
                  <span>96%</span>
                </div>
                <Progress percent={96} size="small" status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ventilation Quality</span>
                  <span>94%</span>
                </div>
                <Progress percent={94} size="small" status="active" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Emergency Preparedness</span>
                  <span>88%</span>
                </div>
                <Progress percent={88} size="small" status="active" />
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
              message="Mining Document Preview" 
              description="This is a preview of the selected mining safety document. You can download or customize it as needed."
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
        title="Mining AI Service Access"
        visible={aiServiceModalVisible}
        onCancel={() => setAiServiceModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="Mining AI Service Integration"
          description="This feature integrates with our advanced AI services specifically designed for mining safety and operations."
          type="info"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <h4>Available Mining AI Services:</h4>
          <Collapse>
            <Panel header="Rock Fall Prediction AI" key="1">
              <p>Advanced AI for predicting rock fall hazards using geological data and real-time monitoring.</p>
            </Panel>
            <Panel header="Gas Detection Analytics" key="2">
              <p>AI-powered analysis of gas detection patterns and hazardous condition prediction.</p>
            </Panel>
            <Panel header="Equipment Failure Predictor" key="3">
              <p>Predict mining equipment failures using IoT data and predictive maintenance algorithms.</p>
            </Panel>
          </Collapse>
        </div>
      </Modal>
    </div>
  );
};

export default MiningSafety;