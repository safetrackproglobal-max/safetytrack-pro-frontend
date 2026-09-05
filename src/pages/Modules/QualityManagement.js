// src/pages/Modules/QualityManagement.js
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
  InputNumber,
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
  Upload,
  Steps,
  Rate
} from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  AuditOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  LineChartOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Step } = Steps;

// Enhanced mock data with real quality management features
const mockQualityChecks = [
  {
    id: 1,
    product: 'Product Line A - Model X100',
    batch: 'BATCH-001-2024',
    checks: 45,
    passed: 43,
    failed: 2,
    status: 'approved',
    inspector: 'John Smith',
    inspectionDate: '2024-01-15',
    standards: ['ISO 9001', 'ISO 14001'],
    defects: ['Minor cosmetic issue', 'Packaging misalignment'],
    correctiveActions: ['Retrain packaging team', 'Update quality checklist'],
    priority: 'medium'
  },
  {
    id: 2,
    product: 'Product Line B - Model Y200',
    batch: 'BATCH-002-2024',
    checks: 38,
    passed: 36,
    failed: 2,
    status: 'approved',
    inspector: 'Maria Garcia',
    inspectionDate: '2024-01-14',
    standards: ['ISO 9001', 'OSHA'],
    defects: ['Documentation error', 'Label mismatch'],
    correctiveActions: ['Update labeling procedure', 'Verify documentation'],
    priority: 'low'
  },
  {
    id: 3,
    product: 'Product Line C - Model Z300',
    batch: 'BATCH-003-2024',
    checks: 52,
    passed: 48,
    failed: 4,
    status: 'under_review',
    inspector: 'Robert Chen',
    inspectionDate: '2024-01-16',
    standards: ['ISO 9001', 'ISO 45001'],
    defects: ['Functional failure', 'Material defect', 'Calibration issue'],
    correctiveActions: ['Halt production', 'Engineering review required'],
    priority: 'high'
  },
  {
    id: 4,
    product: 'Product Line D - Medical Device',
    batch: 'BATCH-004-2024',
    checks: 41,
    passed: 39,
    failed: 2,
    status: 'rejected',
    inspector: 'Lisa Wang',
    inspectionDate: '2024-01-13',
    standards: ['FDA', 'ISO 13485'],
    defects: ['Sterilization failure', 'Regulatory compliance'],
    correctiveActions: ['Full batch quarantine', 'Regulatory audit'],
    priority: 'critical'
  }
];

const mockQualityAudits = [
  {
    id: 'QA-001',
    standard: 'ISO 9001:2015',
    type: 'internal',
    auditor: 'Internal Quality Team',
    score: 92,
    status: 'compliant',
    date: '2024-01-15',
    findings: 3,
    nonConformances: 1,
    nextAudit: '2024-07-15',
    scope: 'Full Quality Management System'
  },
  {
    id: 'QA-002',
    standard: 'ISO 14001',
    type: 'external',
    auditor: 'ABC Certification Body',
    score: 88,
    status: 'minor_nc',
    date: '2024-01-12',
    findings: 5,
    nonConformances: 2,
    nextAudit: '2024-04-12',
    scope: 'Environmental Management System'
  },
  {
    id: 'QA-003',
    standard: 'OSHA Compliance',
    type: 'internal',
    auditor: 'Safety & Quality Team',
    score: 95,
    status: 'compliant',
    date: '2024-01-10',
    findings: 2,
    nonConformances: 0,
    nextAudit: '2024-07-10',
    scope: 'Workplace Safety Standards'
  },
  {
    id: 'QA-004',
    standard: 'ISO 45001',
    type: 'external',
    auditor: 'Global Cert Inc.',
    score: 85,
    status: 'major_nc',
    date: '2024-01-08',
    findings: 8,
    nonConformances: 3,
    nextAudit: '2024-03-08',
    scope: 'Occupational Health & Safety'
  }
];

const mockNonConformances = [
  {
    id: 'NC-001',
    type: 'Material Defect',
    severity: 'high',
    product: 'Product Line C - Model Z300',
    status: 'in_progress',
    assigned: 'Quality Team A',
    reportedDate: '2024-01-16',
    dueDate: '2024-01-23',
    description: 'Critical material defect detected in batch Z300-004',
    rootCause: 'Supplier quality issue',
    impact: 'Production delay, potential customer returns',
    cost: 15000
  },
  {
    id: 'NC-002',
    type: 'Documentation Error',
    severity: 'medium',
    product: 'Product Line A - Model X100',
    status: 'resolved',
    assigned: 'Quality Team B',
    reportedDate: '2024-01-14',
    dueDate: '2024-01-18',
    description: 'Incorrect labeling and documentation in shipping',
    rootCause: 'Human error in documentation process',
    impact: 'Minor shipping delays',
    cost: 2500
  },
  {
    id: 'NC-003',
    type: 'Process Deviation',
    severity: 'low',
    product: 'All Production Lines',
    status: 'pending',
    assigned: 'Process Engineering',
    reportedDate: '2024-01-17',
    dueDate: '2024-01-31',
    description: 'Minor deviation from standard operating procedure',
    rootCause: 'Training gap',
    impact: 'Potential quality variability',
    cost: 800
  },
  {
    id: 'NC-004',
    type: 'Equipment Calibration',
    severity: 'high',
    product: 'Quality Lab Equipment',
    status: 'in_progress',
    assigned: 'Maintenance Team',
    reportedDate: '2024-01-15',
    dueDate: '2024-01-19',
    description: 'Testing equipment out of calibration tolerance',
    rootCause: 'Scheduled maintenance missed',
    impact: 'All test results potentially invalid',
    cost: 5000
  }
];

const mockQualityStandards = [
  {
    id: 1,
    name: 'ISO 9001:2015',
    category: 'quality_management',
    status: 'certified',
    lastReview: '2024-01-10',
    nextReview: '2024-07-10',
    compliance: 95,
    version: '2015',
    certBody: 'Global Quality Cert',
    expiryDate: '2025-01-10'
  },
  {
    id: 2,
    name: 'ISO 14001',
    category: 'environmental',
    status: 'certified',
    lastReview: '2024-01-05',
    nextReview: '2024-04-05',
    compliance: 88,
    version: '2015',
    certBody: 'Environmental Standards Inc.',
    expiryDate: '2025-01-05'
  },
  {
    id: 3,
    name: 'ISO 45001',
    category: 'health_safety',
    status: 'under_review',
    lastReview: '2023-12-15',
    nextReview: '2024-03-15',
    compliance: 82,
    version: '2018',
    certBody: 'Safety Standards Board',
    expiryDate: '2024-06-15'
  },
  {
    id: 4,
    name: 'FDA 21 CFR Part 820',
    category: 'medical_devices',
    status: 'compliant',
    lastReview: '2024-01-08',
    nextReview: '2024-07-08',
    compliance: 96,
    version: 'Current',
    certBody: 'FDA',
    expiryDate: 'Ongoing'
  }
];

function QualityManagement() {
  const [qualityChecks, setQualityChecks] = useState([]);
  const [qualityAudits, setQualityAudits] = useState([]);
  const [nonConformances, setNonConformances] = useState([]);
  const [qualityStandards, setQualityStandards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setQualityChecks(mockQualityChecks);
      setQualityAudits(mockQualityAudits);
      setNonConformances(mockNonConformances);
      setQualityStandards(mockQualityStandards);
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'green';
      case 'under_review': return 'orange';
      case 'rejected': return 'red';
      case 'compliant': return 'green';
      case 'minor_nc': return 'orange';
      case 'major_nc': return 'red';
      case 'in_progress': return 'blue';
      case 'resolved': return 'green';
      case 'pending': return 'orange';
      case 'certified': return 'green';
      default: return 'blue';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#cf1322';
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#cf1322';
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getAuditTypeColor = (type) => {
    switch (type) {
      case 'internal': return 'blue';
      case 'external': return 'purple';
      case 'regulatory': return 'red';
      default: return 'default';
    }
  };

  const handleAddQualityCheck = () => {
    setSelectedItem(null);
    setModalVisible(true);
  };

  const handleAddNonConformance = () => {
    setSelectedItem(null);
    setModalVisible(true);
  };

  // Quality Checks Columns
  const qualityCheckColumns = [
    {
      title: 'Product / Batch',
      dataIndex: 'product',
      key: 'product',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            Batch: {record.batch}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            Inspector: {record.inspector}
          </div>
        </Space>
      ),
    },
    {
      title: 'Results',
      key: 'results',
      render: (_, record) => (
        <div>
          <div>Passed: {record.passed}/{record.checks}</div>
          <Progress 
            percent={Math.round((record.passed / record.checks) * 100)} 
            size="small"
            strokeColor={
              (record.passed / record.checks) >= 0.95 ? '#52c41a' : 
              (record.passed / record.checks) >= 0.90 ? '#faad14' : '#ff4d4f'
            }
          />
        </div>
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
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Standards',
      dataIndex: 'standards',
      key: 'standards',
      render: (standards) => (
        <span>
          {standards?.map(standard => (
            <Tag key={standard} color="blue" size="small">
              {standard}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
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
              onClick={() => setSelectedItem(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => setSelectedItem(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Non-Conformance Columns
  const nonConformanceColumns = [
    {
      title: 'NC ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
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
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
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
      title: 'Assigned To',
      dataIndex: 'assigned',
      key: 'assigned',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Cost Impact',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => `$${cost.toLocaleString()}`,
    },
  ];

  // Audit Columns
  const auditColumns = [
    {
      title: 'Audit ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Standard',
      dataIndex: 'standard',
      key: 'standard',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getAuditTypeColor(type)}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score) => (
        <div>
          {score}/100
          <Progress 
            percent={score} 
            size="small" 
            strokeColor={score >= 90 ? '#52c41a' : score >= 80 ? '#faad14' : '#ff4d4f'}
          />
        </div>
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
      title: 'Findings',
      key: 'findings',
      render: (_, record) => (
        <div>
          <div>Findings: {record.findings}</div>
          <div>NCs: {record.nonConformances}</div>
        </div>
      ),
    },
    {
      title: 'Next Audit',
      dataIndex: 'nextAudit',
      key: 'nextAudit',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
  ];

  // Standards Columns
  const standardsColumns = [
    {
      title: 'Standard',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="blue">
          {category.replace('_', ' ').toUpperCase()}
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
      title: 'Compliance',
      dataIndex: 'compliance',
      key: 'compliance',
      render: (compliance) => (
        <Progress 
          percent={compliance} 
          size="small"
          strokeColor={compliance >= 90 ? '#52c41a' : compliance >= 80 ? '#faad14' : '#ff4d4f'}
        />
      ),
    },
    {
      title: 'Certification Body',
      dataIndex: 'certBody',
      key: 'certBody',
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => date === 'Ongoing' ? 'Ongoing' : moment(date).format('MMM DD, YYYY'),
    },
  ];

  return (
    <div className="quality-management-page">
      {/* Header */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">
              <CheckCircleOutlined />
            </div>
            <div>
              <h1>Quality Management System</h1>
              <p>Quality assurance, control checks, audits, and standards compliance management</p>
            </div>
          </div>
          <div className="header-actions">
            <Space>
              <Button icon={<DownloadOutlined />}>Export Reports</Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddQualityCheck}
              >
                New Quality Check
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Quality Score"
              value={94}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Active NCs"
              value={nonConformances.filter(nc => nc.status !== 'resolved').length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Audit Compliance"
              value={96}
              suffix="%"
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Standards Certified"
              value={qualityStandards.length}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabs with Real Quality Management Features */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        className="management-tabs"
      >
        {/* Overview Tab */}
        <TabPane 
          tab={
            <span>
              <CheckCircleOutlined />
              Quality Overview
            </span>
          } 
          key="overview"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title="🔍 Recent Quality Checks"
                extra={
                  <Button 
                    type="link" 
                    icon={<PlusOutlined />}
                    onClick={handleAddQualityCheck}
                  >
                    New Check
                  </Button>
                }
              >
                <Table
                  columns={qualityCheckColumns}
                  dataSource={qualityChecks.slice(0, 5)}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title="⚠️ Active Non-Conformances">
                <List
                  dataSource={nonConformances.filter(nc => nc.status !== 'resolved')}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button type="link">View</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={<WarningOutlined />}
                            style={{ backgroundColor: getSeverityColor(item.severity) }}
                          />
                        }
                        title={item.id}
                        description={
                          <Space direction="vertical" size={0}>
                            <div>{item.type} - {item.product}</div>
                            <div>
                              <Tag color={getSeverityColor(item.severity)}>
                                {item.severity.toUpperCase()}
                              </Tag>
                              <Tag color={getStatusColor(item.status)}>
                                {item.status.replace('_', ' ')}
                              </Tag>
                            </div>
                            <div style={{ fontSize: 12, color: '#666' }}>
                              Due: {moment(item.dueDate).format('MMM DD')} • Assigned: {item.assigned}
                            </div>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="📊 Quality Standards Compliance">
                <List
                  dataSource={qualityStandards}
                  renderItem={standard => (
                    <List.Item
                      actions={[
                        <Progress 
                          percent={standard.compliance} 
                          size="small" 
                          style={{ width: 100 }}
                          strokeColor={standard.compliance >= 90 ? '#52c41a' : standard.compliance >= 80 ? '#faad14' : '#ff4d4f'}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<SafetyCertificateOutlined />} />}
                        title={standard.name}
                        description={
                          <Space direction="vertical" size={0}>
                            <div>
                              <Tag color="blue">{standard.category.replace('_', ' ')}</Tag>
                              <Tag color={getStatusColor(standard.status)}>
                                {standard.status.replace('_', ' ')}
                              </Tag>
                            </div>
                            <div style={{ fontSize: 12, color: '#666' }}>
                              Cert: {standard.certBody} • Expires: {standard.expiryDate}
                            </div>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="⚡ Quick Actions">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    icon={<FileTextOutlined />}
                    block
                    style={{ textAlign: 'left' }}
                  >
                    Generate Quality Report
                  </Button>
                  <Button 
                    icon={<AuditOutlined />}
                    block
                    style={{ textAlign: 'left' }}
                  >
                    Schedule Internal Audit
                  </Button>
                  <Button 
                    icon={<TeamOutlined />}
                    block
                    style={{ textAlign: 'left' }}
                    onClick={handleAddNonConformance}
                  >
                    Report Non-Conformance
                  </Button>
                  <Button 
                    icon={<LineChartOutlined />}
                    block
                    style={{ textAlign: 'left' }}
                  >
                    View Quality Analytics
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Quality Checks Tab */}
        <TabPane 
          tab={
            <span>
              <ExperimentOutlined />
              Quality Checks
              <Badge count={qualityChecks.length} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="checks"
        >
          <Card
            title="🔬 Quality Control Checks"
            extra={
              <Space>
                <Input
                  placeholder="Search quality checks..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                />
                <Button icon={<FilterOutlined />}>Filters</Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddQualityCheck}
                >
                  New Quality Check
                </Button>
              </Space>
            }
          >
            <Table
              columns={qualityCheckColumns}
              dataSource={qualityChecks.filter(check => 
                check.product.toLowerCase().includes(searchText.toLowerCase()) ||
                check.batch.toLowerCase().includes(searchText.toLowerCase())
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
        </TabPane>

        {/* Non-Conformances Tab */}
        <TabPane 
          tab={
            <span>
              <WarningOutlined />
              Non-Conformances
              <Badge count={nonConformances.filter(nc => nc.status !== 'resolved').length} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="nonconformances"
        >
          <Card 
            title="⚠️ Non-Conformance Tracking"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNonConformance}>
                Report NC
              </Button>
            }
          >
            <Table
              columns={nonConformanceColumns}
              dataSource={nonConformances}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Audits Tab */}
        <TabPane 
          tab={
            <span>
              <AuditOutlined />
              Quality Audits
              <Badge count={qualityAudits.length} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="audits"
        >
          <Card 
            title="📋 Quality Audits & Compliance"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Schedule Audit
              </Button>
            }
          >
            <Table
              columns={auditColumns}
              dataSource={qualityAudits}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Standards Tab */}
        <TabPane 
          tab={
            <span>
              <SafetyCertificateOutlined />
              Quality Standards
              <Badge count={qualityStandards.length} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="standards"
        >
          <Card 
            title="🏆 Quality Standards & Certifications"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                Add Standard
              </Button>
            }
          >
            <Table
              columns={standardsColumns}
              dataSource={qualityStandards}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Quality Check Detail Modal */}
      <Modal
        title={selectedItem ? 'Quality Check Details' : 'New Quality Check'}
        open={!!selectedItem || modalVisible}
        onCancel={() => {
          setSelectedItem(null);
          setModalVisible(false);
        }}
        footer={null}
        width={800}
      >
        {selectedItem ? (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Product:</strong> {selectedItem.product}
              </Col>
              <Col span={12}>
                <strong>Batch:</strong> {selectedItem.batch}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Status:</strong>
                <Tag color={getStatusColor(selectedItem.status)} style={{ marginLeft: 8 }}>
                  {selectedItem.status.replace('_', ' ').toUpperCase()}
                </Tag>
              </Col>
              <Col span={12}>
                <strong>Priority:</strong>
                <Tag color={getPriorityColor(selectedItem.priority)} style={{ marginLeft: 8 }}>
                  {selectedItem.priority.toUpperCase()}
                </Tag>
              </Col>
            </Row>
            <div style={{ marginBottom: 16 }}>
              <strong>Results:</strong> 
              <div style={{ marginTop: 8 }}>
                <Progress 
                  percent={Math.round((selectedItem.passed / selectedItem.checks) * 100)} 
                  strokeColor={
                    (selectedItem.passed / selectedItem.checks) >= 0.95 ? '#52c41a' : 
                    (selectedItem.passed / selectedItem.checks) >= 0.90 ? '#faad14' : '#ff4d4f'
                  }
                />
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  {selectedItem.passed} passed / {selectedItem.checks} total checks
                </div>
              </div>
            </div>
            {selectedItem.defects && selectedItem.defects.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong>Defects Found:</strong>
                <ul style={{ background: '#fff2f0', padding: '8px 8px 8px 24px', borderRadius: 4, marginTop: 8 }}>
                  {selectedItem.defects.map((defect, index) => (
                    <li key={index}>{defect}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedItem.correctiveActions && selectedItem.correctiveActions.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong>Corrective Actions:</strong>
                <ul style={{ background: '#f6ffed', padding: '8px 8px 8px 24px', borderRadius: 4, marginTop: 8 }}>
                  {selectedItem.correctiveActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <strong>Standards:</strong>
              <div style={{ marginTop: 8 }}>
                {selectedItem.standards?.map(standard => (
                  <Tag key={standard} color="blue" style={{ margin: '2px' }}>
                    {standard}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Form
            layout="vertical"
            onFinish={(values) => {
              message.success('Quality check created successfully');
              setModalVisible(false);
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="product"
                  label="Product Line"
                  rules={[{ required: true, message: 'Please select product line' }]}
                >
                  <Select placeholder="Select product line">
                    <Option value="Product Line A">Product Line A</Option>
                    <Option value="Product Line B">Product Line B</Option>
                    <Option value="Product Line C">Product Line C</Option>
                    <Option value="Product Line D">Product Line D</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="batch"
                  label="Batch Number"
                  rules={[{ required: true, message: 'Please enter batch number' }]}
                >
                  <Input placeholder="Enter batch number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="totalChecks"
                  label="Total Checks"
                  rules={[{ required: true, message: 'Please enter number of checks' }]}
                >
                  <InputNumber 
                    min={1} 
                    max={1000} 
                    style={{ width: '100%' }} 
                    placeholder="Number of checks" 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="passedChecks"
                  label="Passed Checks"
                  rules={[{ required: true, message: 'Please enter passed checks' }]}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }} 
                    placeholder="Passed checks" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="standards"
              label="Applicable Standards"
            >
              <Select mode="multiple" placeholder="Select standards">
                <Option value="ISO 9001">ISO 9001</Option>
                <Option value="ISO 14001">ISO 14001</Option>
                <Option value="ISO 45001">ISO 45001</Option>
                <Option value="FDA">FDA</Option>
                <Option value="OSHA">OSHA</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Create Quality Check
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

export default QualityManagement;