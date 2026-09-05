// src/pages/HSEManagementPage.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Timeline,
  Alert,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  List,
  Avatar,
  Badge,
  Tabs,
  Space,
  Tooltip,
  Popconfirm,
  message,
  Divider,
  Upload
} from 'antd';
import {
  SafetyCertificateOutlined,
  WarningOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  LineChartOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined
} from '@ant-design/icons';
import './HSEManagementPage.css';
import moment from 'moment';


const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Mock data for HSE management
const mockIncidents = [
  {
    id: 1,
    title: 'Slip and Fall Accident',
    type: 'safety',
    severity: 'high',
    status: 'under_investigation',
    location: 'Main Production Floor - Area B',
    reportedBy: 'John Smith',
    reportedDate: '2024-01-15T10:30:00Z',
    description: 'Employee slipped on wet floor near cooling system',
    injuries: 'Minor sprain - first aid administered',
    actionRequired: 'Install anti-slip mats and warning signs',
    estimatedCompletion: '2024-01-20'
  },
  {
    id: 2,
    title: 'Chemical Spill',
    type: 'environmental',
    severity: 'medium',
    status: 'in_progress',
    location: 'Chemical Storage Room',
    reportedBy: 'Maria Garcia',
    reportedDate: '2024-01-14T14:20:00Z',
    description: 'Small spill of cleaning solvent during transfer',
    injuries: 'None',
    actionRequired: 'Containment and proper disposal',
    estimatedCompletion: '2024-01-16'
  },
  {
    id: 3,
    title: 'Noise Exposure Concern',
    type: 'health',
    severity: 'low',
    status: 'resolved',
    location: 'Assembly Line 3',
    reportedBy: 'Robert Chen',
    reportedDate: '2024-01-12T09:15:00Z',
    description: 'Employee reported inadequate hearing protection',
    injuries: 'None',
    actionRequired: 'Provide additional ear protection',
    estimatedCompletion: '2024-01-13'
  }
];

const mockSafetyProtocols = [
  {
    id: 1,
    name: 'Emergency Evacuation Procedure',
    category: 'emergency',
    status: 'active',
    lastReview: '2024-01-10',
    nextReview: '2024-07-10',
    compliance: 95
  },
  {
    id: 2,
    name: 'Chemical Handling Guidelines',
    category: 'chemical',
    status: 'active',
    lastReview: '2024-01-05',
    nextReview: '2024-04-05',
    compliance: 88
  },
  {
    id: 3,
    name: 'Machine Safety Operations',
    category: 'equipment',
    status: 'under_revision',
    lastReview: '2023-12-15',
    nextReview: '2024-03-15',
    compliance: 92
  }
];

const mockTrainingRecords = [
  {
    id: 1,
    employee: 'Sarah Johnson',
    course: 'Fire Safety Training',
    completionDate: '2024-01-10',
    expiryDate: '2025-01-10',
    status: 'valid',
    score: 94
  },
  {
    id: 2,
    employee: 'Michael Brown',
    course: 'Hazardous Materials',
    completionDate: '2024-01-08',
    expiryDate: '2024-07-08',
    status: 'valid',
    score: 87
  },
  {
    id: 3,
    employee: 'Lisa Wang',
    course: 'First Aid Certification',
    completionDate: '2023-12-20',
    expiryDate: '2024-06-20',
    status: 'expiring_soon',
    score: 96
  }
];

const mockEnvironmentalMetrics = [
  {
    parameter: 'Air Quality Index',
    current: 45,
    target: 50,
    unit: 'AQI',
    status: 'good',
    trend: 'improving'
  },
  {
    parameter: 'Water Consumption',
    current: 1250,
    target: 1200,
    unit: 'm³/month',
    status: 'warning',
    trend: 'increasing'
  },
  {
    parameter: 'Waste Recycling Rate',
    current: 78,
    target: 75,
    unit: '%',
    status: 'good',
    trend: 'stable'
  },
  {
    parameter: 'Carbon Emissions',
    current: 450,
    target: 400,
    unit: 'tons CO₂',
    status: 'critical',
    trend: 'increasing'
  }
];

function HSEManagementPage() {
  const [incidents, setIncidents] = useState([]);
  const [safetyProtocols, setSafetyProtocols] = useState([]);
  const [trainingRecords, setTrainingRecords] = useState([]);
  const [environmentalMetrics, setEnvironmentalMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIncidents(mockIncidents);
      setSafetyProtocols(mockSafetyProtocols);
      setTrainingRecords(mockTrainingRecords);
      setEnvironmentalMetrics(mockEnvironmentalMetrics);
      setLoading(false);
    }, 1000);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return '#52c41a';
      case 'in_progress': return '#1890ff';
      case 'under_investigation': return '#faad14';
      case 'reported': return '#722ed1';
      default: return '#d9d9d9';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'safety': return '#ff4d4f';
      case 'health': return '#1890ff';
      case 'environmental': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getMetricStatusColor = (status) => {
    switch (status) {
      case 'good': return '#52c41a';
      case 'warning': return '#faad14';
      case 'critical': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  const handleAddIncident = () => {
    setSelectedIncident(null);
    setModalVisible(true);
  };

  const handleEditIncident = (incident) => {
    setSelectedIncident(incident);
    setModalVisible(true);
  };

  const handleDeleteIncident = (incidentId) => {
    setIncidents(incidents.filter(i => i.id !== incidentId));
    message.success('Incident deleted successfully');
  };

  const handleModalOk = (values) => {
    if (selectedIncident) {
      // Update existing incident
      setIncidents(incidents.map(i => 
        i.id === selectedIncident.id ? { ...i, ...values } : i
      ));
      message.success('Incident updated successfully');
    } else {
      // Add new incident
      const newIncident = {
        id: Math.max(...incidents.map(i => i.id)) + 1,
        ...values,
        reportedDate: new Date().toISOString(),
        status: 'reported'
      };
      setIncidents([...incidents, newIncident]);
      message.success('Incident reported successfully');
    }
    setModalVisible(false);
    setSelectedIncident(null);
  };

  const incidentColumns = [
    {
      title: 'Incident',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <EnvironmentOutlined /> {record.location}
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Reported',
      dataIndex: 'reportedDate',
      key: 'reportedDate',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => setSelectedIncident(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => handleEditIncident(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Incident"
            description="Are you sure you want to delete this incident?"
            onConfirm={() => handleDeleteIncident(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="link" 
                icon={<DeleteOutlined />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <h1 style={{ margin: 0, fontSize: 28 }}>
              <SafetyCertificateOutlined /> HSE Management
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: 16 }}>
              Health, Safety, and Environment Monitoring & Compliance
            </p>
          </Col>
          <Col>
            <Space>
              <Button icon={<DownloadOutlined />}>Export Reports</Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddIncident}
              >
                Report Incident
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Incidents"
              value={incidents.filter(i => i.status !== 'resolved').length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Safety Protocols"
              value={safetyProtocols.length}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Training Compliance"
              value={92}
              suffix="%"
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Days Since Last Incident"
              value={15}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Environmental Metrics */}
      <Card style={{ marginBottom: 24 }} title="Environmental Performance">
        <Row gutter={[16, 16]}>
          {environmentalMetrics.map(metric => (
            <Col xs={24} sm={12} md={6} key={metric.parameter}>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: getMetricStatusColor(metric.status) }}>
                    {metric.current} {metric.unit}
                  </div>
                  <div style={{ color: '#666', marginBottom: 8 }}>{metric.parameter}</div>
                  <Progress 
                    percent={(metric.current / metric.target) * 100} 
                    size="small"
                    strokeColor={getMetricStatusColor(metric.status)}
                    format={percent => `${Math.round(percent)}%`}
                  />
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    Target: {metric.target} {metric.unit}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: 'HSE Overview',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card 
                    title="Recent Incidents"
                    extra={
                      <Button 
                        type="link" 
                        icon={<PlusOutlined />}
                        onClick={handleAddIncident}
                      >
                        Report New
                      </Button>
                    }
                  >
                    <Table
                      columns={incidentColumns}
                      dataSource={incidents}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                  <Card title="Safety Protocol Compliance">
                    <List
                      dataSource={safetyProtocols}
                      renderItem={protocol => (
                        <List.Item
                          actions={[
                            <Button type="link">Review</Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                icon={<SafetyCertificateOutlined />}
                                style={{ backgroundColor: protocol.status === 'active' ? '#52c41a' : '#faad14' }}
                              />
                            }
                            title={protocol.name}
                            description={
                              <Space direction="vertical" size={0}>
                                <div>
                                  <Tag color="blue">{protocol.category}</Tag>
                                  <Tag color={protocol.status === 'active' ? 'green' : 'orange'}>
                                    {protocol.status.replace('_', ' ')}
                                  </Tag>
                                </div>
                                <div style={{ fontSize: 12, color: '#666' }}>
                                  Next review: {moment(protocol.nextReview).format('MMM DD, YYYY')}
                                </div>
                              </Space>
                            }
                          />
                          <Progress 
                            percent={protocol.compliance} 
                            size="small" 
                            style={{ width: 100 }}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="Training Alerts">
                    <Timeline>
                      {trainingRecords.map(record => (
                        <Timeline.Item
                          key={record.id}
                          color={record.status === 'expiring_soon' ? 'orange' : 'green'}
                          dot={record.status === 'expiring_soon' ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                        >
                          <Space direction="vertical" size={0}>
                            <div style={{ fontWeight: 500 }}>{record.employee}</div>
                            <div>{record.course}</div>
                            <div style={{ fontSize: 12, color: '#666' }}>
                              Expires: {moment(record.expiryDate).format('MMM DD, YYYY')}
                            </div>
                          </Space>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="Quick Actions">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        type="primary" 
                        icon={<FileTextOutlined />}
                        block
                        style={{ textAlign: 'left' }}
                      >
                        Generate Safety Report
                      </Button>
                      <Button 
                        icon={<TeamOutlined />}
                        block
                        style={{ textAlign: 'left' }}
                      >
                        Schedule Safety Training
                      </Button>
                      <Button 
                        icon={<EnvironmentOutlined />}
                        block
                        style={{ textAlign: 'left' }}
                      >
                        Environmental Audit
                      </Button>
                      <Button 
                        icon={<LineChartOutlined />}
                        block
                        style={{ textAlign: 'left' }}
                      >
                        View Compliance Analytics
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'incidents',
            label: 'Incident Management',
            children: (
              <Card
                title="All Incidents"
                extra={
                  <Space>
                    <Input
                      placeholder="Search incidents..."
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: 200 }}
                    />
                    <Button icon={<FilterOutlined />}>Filters</Button>
                  </Space>
                }
              >
                <Table
                  columns={incidentColumns}
                  dataSource={incidents.filter(incident => 
                    incident.title.toLowerCase().includes(searchText.toLowerCase()) ||
                    incident.location.toLowerCase().includes(searchText.toLowerCase())
                  )}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                />
              </Card>
            )
          },
          {
            key: 'training',
            label: 'Training Records',
            children: (
              <Card title="Training & Certification">
                <Table
                  columns={[
                    {
                      title: 'Employee',
                      dataIndex: 'employee',
                      key: 'employee',
                    },
                    {
                      title: 'Course',
                      dataIndex: 'course',
                      key: 'course',
                    },
                    {
                      title: 'Completion Date',
                      dataIndex: 'completionDate',
                      key: 'completionDate',
                      render: (date) => moment(date).format('MMM DD, YYYY'),
                    },
                    {
                      title: 'Expiry Date',
                      dataIndex: 'expiryDate',
                      key: 'expiryDate',
                      render: (date) => moment(date).format('MMM DD, YYYY'),
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => (
                        <Tag color={status === 'valid' ? 'green' : status === 'expiring_soon' ? 'orange' : 'red'}>
                          {status.replace('_', ' ').toUpperCase()}
                        </Tag>
                      ),
                    },
                    {
                      title: 'Score',
                      dataIndex: 'score',
                      key: 'score',
                      render: (score) => `${score}%`,
                    },
                  ]}
                  dataSource={trainingRecords}
                  rowKey="id"
                />
              </Card>
            )
          },
          {
            key: 'audits',
            label: 'Compliance Audits',
            children: (
              <Card title="Audit Schedule">
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <FileTextOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                  <h3>Audit Management</h3>
                  <p>Schedule and manage compliance audits</p>
                  <Button type="primary">Schedule New Audit</Button>
                </div>
              </Card>
            )
          }
        ]}
      />

      {/* Incident Detail Modal */}
      <Modal
        title={selectedIncident ? 'Incident Details' : 'Report New Incident'}
        open={!!selectedIncident || modalVisible}
        onCancel={() => {
          setSelectedIncident(null);
          setModalVisible(false);
        }}
        footer={null}
        width={700}
      >
        {selectedIncident ? (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Type:</strong> 
                <Tag color={getTypeColor(selectedIncident.type)} style={{ marginLeft: 8 }}>
                  {selectedIncident.type.toUpperCase()}
                </Tag>
              </Col>
              <Col span={12}>
                <strong>Severity:</strong>
                <Tag color={getSeverityColor(selectedIncident.severity)} style={{ marginLeft: 8 }}>
                  {selectedIncident.severity.toUpperCase()}
                </Tag>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Status:</strong>
                <Tag color={getStatusColor(selectedIncident.status)} style={{ marginLeft: 8 }}>
                  {selectedIncident.status.replace('_', ' ').toUpperCase()}
                </Tag>
              </Col>
              <Col span={12}>
                <strong>Reported By:</strong> {selectedIncident.reportedBy}
              </Col>
            </Row>
            <div style={{ marginBottom: 16 }}>
              <strong>Location:</strong> {selectedIncident.location}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Description:</strong> 
              <p>{selectedIncident.description}</p>
            </div>
            {selectedIncident.injuries && (
              <div style={{ marginBottom: 16 }}>
                <strong>Injuries:</strong> 
                <p>{selectedIncident.injuries}</p>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <strong>Action Required:</strong> 
              <p>{selectedIncident.actionRequired}</p>
            </div>
            {selectedIncident.estimatedCompletion && (
              <div>
                <strong>Estimated Completion:</strong> 
                {moment(selectedIncident.estimatedCompletion).format('MMM DD, YYYY')}
              </div>
            )}
          </div>
        ) : (
          <Form
            layout="vertical"
            onFinish={handleModalOk}
            initialValues={{
              type: 'safety',
              severity: 'medium'
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Incident Title"
                  rules={[{ required: true, message: 'Please enter incident title' }]}
                >
                  <Input placeholder="Enter incident title" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Incident Type"
                  rules={[{ required: true, message: 'Please select incident type' }]}
                >
                  <Select>
                    <Option value="safety">Safety</Option>
                    <Option value="health">Health</Option>
                    <Option value="environmental">Environmental</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="severity"
                  label="Severity Level"
                  rules={[{ required: true, message: 'Please select severity' }]}
                >
                  <Select>
                    <Option value="low">Low</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="high">High</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, message: 'Please enter location' }]}
                >
                  <Input placeholder="Enter incident location" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea rows={3} placeholder="Describe the incident in detail" />
            </Form.Item>

            <Form.Item
              name="injuries"
              label="Injuries/Damages"
            >
              <TextArea rows={2} placeholder="Describe any injuries or damages" />
            </Form.Item>

            <Form.Item
              name="actionRequired"
              label="Immediate Actions Required"
            >
              <TextArea rows={2} placeholder="Describe immediate actions needed" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {selectedIncident ? 'Update Incident' : 'Report Incident'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}

export default HSEManagementPage;