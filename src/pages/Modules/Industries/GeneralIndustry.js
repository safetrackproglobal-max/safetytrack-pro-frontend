// src/pages/Modules/Industries/GeneralIndustry.js
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
  Table,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  message,
  Badge,
  Tooltip,
  Popconfirm,
  Divider,
  Timeline,
  Alert,
  Switch,
  InputNumber,
  Radio,
  Checkbox
} from 'antd';
import {
  SafetyOutlined,
  FileTextOutlined,
  ToolOutlined,
  DownloadOutlined,
  EditOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  DashboardOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ShareAltOutlined,
  StarOutlined,
  DeleteOutlined,
  FolderOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  HistoryOutlined,
  LockOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  BarChartOutlined,
  CalculatorOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  RocketOutlined
} from '@ant-design/icons';
import generalIndustryService from '../../../services/generalIndustryApiService';

const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;
const { Dragger } = Upload;

const GeneralIndustry = () => {
  const { tab = 'dashboard' } = useParams();
  const history = useHistory();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [realTimeData, setRealTimeData] = useState({
    totalEmployees: 1247,
    safetyScore: 92,
    activeInspections: 8,
    openActions: 12,
    trainingCompliance: 94,
    safetyObservations: 47
  });

  // Initialize with sample data
  useEffect(() => {
    loadIndustryData();
    loadDocuments();
    loadFavorites();
  }, []);

  // Filter documents when search or category changes
  useEffect(() => {
    filterDocuments();
  }, [searchText, selectedCategory, selectedType, documents]);

  const loadIndustryData = async () => {
    try {
      const response = await generalIndustryService.industry.getIndustryDashboard();
      if (response.data) {
        setRealTimeData(response.data);
      }
    } catch (error) {
      console.error('Error loading industry data:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await generalIndustryService.documents.getDocuments();
      if (response.data) {
        setDocuments(response.data);
      } else {
        // Fallback to sample data if API fails
        setDocuments(sampleDocuments);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments(sampleDocuments);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await generalIndustryService.documents.getFavorites();
      if (response.data) {
        setFavorites(response.data);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;
    
    if (searchText) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchText.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }
    
    setFilteredDocuments(filtered);
  };

  const handleDocumentUpload = async (file) => {
    try {
      const response = await generalIndustryService.upload.uploadFile(
        file,
        'documents',
        { industry: 'general' }
      );
      message.success('Document uploaded successfully');
      loadDocuments();
      setDocumentModalVisible(false);
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Upload failed');
    }
    return false;
  };

  const handleDownload = async (document) => {
    try {
      const response = await generalIndustryService.documents.downloadDocument(document.id);
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      message.error('Download failed');
    }
  };

  const handleFavorite = async (documentId) => {
    try {
      const response = await generalIndustryService.documents.toggleFavorite(documentId);
      if (response.data) {
        setFavorites(response.data);
        message.success('Favorite updated');
      }
    } catch (error) {
      console.error('Favorite error:', error);
      message.error('Failed to update favorite');
    }
  };

  const handleShare = async (document) => {
    try {
      const response = await generalIndustryService.documents.shareDocument(document.id);
      if (response.data) {
        await navigator.clipboard.writeText(response.data.shareUrl);
        message.success('Shareable link copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      message.error('Failed to share document');
    }
  };

  const handleDelete = async (documentId) => {
    try {
      await generalIndustryService.documents.deleteDocument(documentId);
      message.success('Document deleted successfully');
      loadDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete document');
    }
  };

  const handleToolLaunch = async (tool) => {
    try {
      const response = await generalIndustryService.tools.executeTool(
        tool.id,
        { industry: 'general' }
      );
      message.success(`Launching ${tool.name}`);
    } catch (error) {
      message.error(`Failed to launch ${tool.name}`);
    }
  };

  const handleAIServiceAccess = async (service) => {
    try {
      const response = await generalIndustryService.ai.accessService(
        service.id,
        { service_type: service.name.toLowerCase().replace(/\s+/g, '-') }
      );
      message.success(`Accessing ${service.name}`);
    } catch (error) {
      message.error(`Failed to access ${service.name}`);
    }
  };

  // Enhanced Document Management Data
  const sampleDocuments = [
    { 
      id: 1,
      name: 'General Risk Assessment Template', 
      type: 'Template', 
      format: '.docx', 
      size: '1.8MB',
      category: 'High',
      description: 'Comprehensive risk assessment template for general industry operations',
      tags: ['risk', 'assessment', 'template'],
      version: '2.1',
      lastModified: '2024-01-15',
      createdBy: 'Safety Manager',
      downloadCount: 147,
      isPublic: true,
      status: 'approved'
    },
    { 
      id: 2,
      name: 'Safety Policy Manual', 
      type: 'Manual', 
      format: '.docx', 
      size: '3.2MB',
      category: 'High',
      description: 'Complete safety policy manual for industrial facilities',
      tags: ['policy', 'manual', 'safety'],
      version: '1.4',
      lastModified: '2024-01-10',
      createdBy: 'Compliance Officer',
      downloadCount: 89,
      isPublic: true,
      status: 'approved'
    },
    { 
      id: 3,
      name: 'Incident Report Form', 
      type: 'Form', 
      format: '.pdf', 
      size: '0.9MB',
      category: 'Medium',
      description: 'Standardized incident reporting form with investigation guidelines',
      tags: ['incident', 'report', 'form'],
      version: '3.2',
      lastModified: '2024-01-08',
      createdBy: 'Safety Team',
      downloadCount: 203,
      isPublic: true,
      status: 'approved'
    },
    { 
      id: 4,
      name: 'Emergency Response Plan', 
      type: 'Plan', 
      format: '.docx', 
      size: '2.4MB',
      category: 'High',
      description: 'Comprehensive emergency response and evacuation plan',
      tags: ['emergency', 'response', 'plan'],
      version: '4.0',
      lastModified: '2024-01-12',
      createdBy: 'Emergency Coordinator',
      downloadCount: 67,
      isPublic: false,
      status: 'approved'
    },
    { 
      id: 5,
      name: 'Safety Training Program', 
      type: 'Program', 
      format: '.pptx', 
      size: '4.1MB',
      category: 'Medium',
      description: 'Complete safety training program with presentation materials',
      tags: ['training', 'program', 'presentation'],
      version: '2.3',
      lastModified: '2024-01-05',
      createdBy: 'Training Manager',
      downloadCount: 134,
      isPublic: true,
      status: 'approved'
    }
  ];

  const generalTools = [
    { 
      id: 1,
      name: 'Risk Assessment Generator', 
      description: 'Generate comprehensive risk assessments for various operations with AI-powered hazard identification',
      category: 'High',
      status: 'active',
      icon: <CalculatorOutlined />,
      features: ['AI Hazard Detection', 'Automated Report Generation', 'Custom Templates'],
      usage: '156 times this month',
      rating: 4.7
    },
    { 
      id: 2,
      name: 'Safety Inspection Planner', 
      description: 'Plan and schedule safety inspections across facilities with smart scheduling',
      category: 'High',
      status: 'active',
      icon: <BarChartOutlined />,
      features: ['Smart Scheduling', 'Checklist Management', 'Real-time Updates'],
      usage: '89 times this month',
      rating: 4.5
    },
    { 
      id: 3,
      name: 'Incident Investigation Tool', 
      description: 'Conduct thorough incident investigations and analysis with root cause analysis',
      category: 'High',
      status: 'active',
      icon: <WarningOutlined />,
      features: ['Root Cause Analysis', 'Trend Identification', 'Preventive Actions'],
      usage: '67 times this month',
      rating: 4.8
    },
    { 
      id: 4,
      name: 'Compliance Tracker', 
      description: 'Track regulatory compliance across multiple standards with automated alerts',
      category: 'Medium',
      status: 'beta',
      icon: <SafetyCertificateOutlined />,
      features: ['Multi-standard Tracking', 'Automated Alerts', 'Audit Preparation'],
      usage: '45 times this month',
      rating: 4.3
    }
  ];

  const generalAIServices = [
    { 
      id: 1,
      name: 'AI Safety Advisor', 
      description: 'Get AI-powered safety recommendations and risk assessments for your operations',
      status: 'Active',
      usage: 'High',
      accuracy: '94%',
      premium: false,
      capabilities: ['Risk Assessment', 'Safety Recommendations', 'Compliance Guidance']
    },
    { 
      id: 2,
      name: 'Document Generation AI', 
      description: 'Automatically generate safety documents, reports, and compliance documentation',
      status: 'Active',
      usage: 'Medium',
      accuracy: '91%',
      premium: true,
      capabilities: ['Document Creation', 'Template Customization', 'Regulatory Compliance']
    },
    { 
      id: 3,
      name: 'Risk Prediction Engine', 
      description: 'Predict safety risks and incidents based on operational data and trends',
      status: 'Beta',
      usage: 'Low',
      accuracy: '87%',
      premium: true,
      capabilities: ['Risk Forecasting', 'Pattern Recognition', 'Early Warnings']
    },
    { 
      id: 4,
      name: 'Compliance Assistant', 
      description: 'AI-powered regulatory compliance guidance and audit preparation',
      status: 'Active',
      usage: 'High',
      accuracy: '96%',
      premium: false,
      capabilities: ['Regulation Monitoring', 'Compliance Checking', 'Audit Support']
    }
  ];

  const departmentSafety = [
    { department: 'Production', incidents: 2, compliance: 94, trend: 'improving', workers: 456 },
    { department: 'Maintenance', incidents: 1, compliance: 88, trend: 'stable', workers: 123 },
    { department: 'Warehouse', incidents: 3, compliance: 91, trend: 'improving', workers: 89 },
    { department: 'Office', incidents: 0, compliance: 98, trend: 'excellent', workers: 45 },
    { department: 'Quality Control', incidents: 1, compliance: 95, trend: 'improving', workers: 67 },
  ];

  const recentActivities = [
    { action: 'Safety Inspection Completed', user: 'John Smith', time: '2 hours ago', type: 'success' },
    { action: 'New Risk Assessment Created', user: 'Sarah Chen', time: '4 hours ago', type: 'info' },
    { action: 'Training Session Conducted', user: 'Mike Johnson', time: '1 day ago', type: 'success' },
    { action: 'Incident Report Submitted', user: 'Emma Davis', time: '2 days ago', type: 'warning' }
  ];

  const departmentColumns = [
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text) => (
        <Space>
          <ApartmentOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Workers',
      dataIndex: 'workers',
      key: 'workers',
    },
    {
      title: 'Incidents (30 days)',
      dataIndex: 'incidents',
      key: 'incidents',
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: count === 0 ? '#52c41a' : count > 2 ? '#cf1322' : '#faad14' }} />
      ),
    },
    {
      title: 'Compliance',
      dataIndex: 'compliance',
      key: 'compliance',
      render: (percent) => <Progress percent={percent} size="small" />,
    },
    {
      title: 'Trend',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend) => (
        <Tag color={trend === 'excellent' ? 'green' : trend === 'improving' ? 'blue' : trend === 'stable' ? 'orange' : 'red'}>
          {trend}
        </Tag>
      ),
    },
  ];

  const documentCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'High', label: 'High Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'Low', label: 'Low Priority' }
  ];

  const documentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'Template', label: 'Templates' },
    { value: 'Manual', label: 'Manuals' },
    { value: 'Form', label: 'Forms' },
    { value: 'Plan', label: 'Plans' },
    { value: 'Program', label: 'Programs' }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Enhanced Header with Premium Features */}
      <Alert
        message="🏭 General Industry Safety Platform"
        description="Comprehensive safety management for manufacturing, warehousing, and industrial operations."
        type="info"
        showIcon
        action={
          <Space>
            <Button type="primary" size="small" icon={<CrownOutlined />}>
              Upgrade to Pro
            </Button>
            <Button size="small" icon={<RocketOutlined />}>
              Explore Features
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      />

      <Card 
        title={
          <Space>
            <SafetyOutlined />
            <span>Advanced General Industry Safety Management</span>
            <Tag color="green" icon={<CrownOutlined />}>PRO VERSION</Tag>
          </Space>
        } 
        style={{ borderLeft: '6px solid #52c41a' }}
        extra={
          <Space size="large">
            <Statistic title="Total Employees" value={realTimeData.totalEmployees} prefix={<TeamOutlined />} />
            <Statistic title="Overall Safety Score" value={realTimeData.safetyScore} suffix="%" />
            <Statistic title="Active Inspections" value={realTimeData.activeInspections} prefix={<EyeOutlined />} />
            <Statistic title="Training Compliance" value={realTimeData.trainingCompliance} suffix="%" />
          </Space>
        }
      >
        <Tabs activeKey={tab} onChange={(key) => history.push(`/hse/general/${key}`)}>
          
          {/* Enhanced Dashboard Tab */}
          <TabPane tab={<span><DashboardOutlined /> Smart Dashboard</span>} key="dashboard">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card 
                  title="Safety Performance Overview" 
                  extra={<Tag color="blue">LIVE</Tag>}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Statistic title="Days Since Last Incident" value={18} prefix={<ClockCircleOutlined />} />
                    <Statistic title="Safety Observations" value={realTimeData.safetyObservations} prefix={<EyeOutlined />} />
                    <Progress 
                      percent={realTimeData.safetyScore} 
                      status="active" 
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                  </Space>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Quick Actions">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button type="primary" icon={<PlusOutlined />} block>
                      New Risk Assessment
                    </Button>
                    <Button icon={<BarChartOutlined />} block>
                      Generate Report
                    </Button>
                    <Button icon={<TeamOutlined />} block>
                      Schedule Inspection
                    </Button>
                    <Button icon={<SafetyCertificateOutlined />} block>
                      Compliance Check
                    </Button>
                  </Space>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Recent Activity">
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
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Department Safety Performance">
                  <Table 
                    dataSource={departmentSafety} 
                    columns={departmentColumns}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Safety Metrics">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Progress type="circle" percent={92} title="Overall Safety" />
                    </Col>
                    <Col span={12}>
                      <Progress type="circle" percent={88} status="active" title="Compliance" />
                    </Col>
                    <Col span={12}>
                      <Progress type="circle" percent={95} status="success" title="Training" />
                    </Col>
                    <Col span={12}>
                      <Progress type="circle" percent={85} status="exception" title="Equipment" />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Enhanced Safety Tools Tab */}
          <TabPane tab={<span><ToolOutlined /> Advanced Safety Tools</span>} key="tools">
            <Row gutter={[16, 16]}>
              {generalTools.map(tool => (
                <Col xs={24} md={12} key={tool.id}>
                  <Card
                    hoverable
                    actions={[
                      <Tooltip title="Launch Tool">
                        <PlayCircleOutlined onClick={() => handleToolLaunch(tool)} />
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
                      avatar={<Avatar icon={tool.icon} style={{ backgroundColor: '#52c41a' }} />}
                      title={
                        <Space>
                          {tool.name}
                          <Tag color={tool.category === 'High' ? 'red' : 'orange'}>
                            {tool.category}
                          </Tag>
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

          {/* Enhanced Documents Tab */}
          <TabPane tab={<span><FileTextOutlined /> Smart Document Management</span>} key="documents">
            <Card
              title="AI-Powered Document Management System"
              extra={
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setDocumentModalVisible(true)}
                  >
                    Upload Document
                  </Button>
                  <Button 
                    icon={<SyncOutlined />}
                    onClick={loadDocuments}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                </Space>
              }
            >
              {/* Enhanced Search and Filter Section */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={6}>
                  <Search
                    placeholder="Search documents..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Category"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    suffixIcon={<FilterOutlined />}
                  >
                    {documentCategories.map(cat => (
                      <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={4}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Type"
                    value={selectedType}
                    onChange={setSelectedType}
                    suffixIcon={<FilterOutlined />}
                  >
                    {documentTypes.map(type => (
                      <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={10}>
                  <Space>
                    <Tag icon={<FolderOutlined />} color="blue">
                      Total: {documents.length}
                    </Tag>
                    <Tag icon={<StarOutlined />} color="gold">
                      Favorites: {favorites.length}
                    </Tag>
                    <Tag icon={<DownloadOutlined />} color="green">
                      Downloads: {documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0)}
                    </Tag>
                  </Space>
                </Col>
              </Row>

              {/* Enhanced Documents List */}
              <List
                loading={loading}
                dataSource={filteredDocuments}
                renderItem={doc => (
                  <List.Item
                    actions={[
                      <Tooltip title="Download">
                        <Button 
                          icon={<DownloadOutlined />} 
                          onClick={() => handleDownload(doc)}
                        >
                          {doc.downloadCount || 0}
                        </Button>
                      </Tooltip>,
                      <Tooltip title={favorites.includes(doc.id) ? "Remove from favorites" : "Add to favorites"}>
                        <Button 
                          icon={<StarOutlined />} 
                          type={favorites.includes(doc.id) ? "primary" : "default"}
                          onClick={() => handleFavorite(doc.id)}
                        />
                      </Tooltip>,
                      <Tooltip title="Share document">
                        <Button 
                          icon={<ShareAltOutlined />}
                          onClick={() => handleShare(doc)}
                        />
                      </Tooltip>,
                      <Tooltip title="Preview and details">
                        <Button 
                          icon={<EyeOutlined />}
                          onClick={() => {
                            setSelectedDocument(doc);
                            setDocumentModalVisible(true);
                          }}
                        />
                      </Tooltip>,
                      <Popconfirm
                        title="Are you sure to delete this document?"
                        onConfirm={() => handleDelete(doc.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Tooltip title="Delete document">
                          <Button 
                            icon={<DeleteOutlined />} 
                            danger
                          />
                        </Tooltip>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge 
                          count={doc.category === 'High' ? '!' : null} 
                          offset={[-5, 5]}
                          style={{ backgroundColor: doc.category === 'High' ? '#ff4d4f' : '#52c41a' }}
                        >
                          <Avatar 
                            icon={<FileTextOutlined />} 
                            style={{ 
                              backgroundColor: doc.category === 'High' ? '#fff2f0' : 
                                            doc.category === 'Medium' ? '#fffbe6' : '#f6ffed',
                              color: doc.category === 'High' ? '#ff4d4f' : 
                                   doc.category === 'Medium' ? '#faad14' : '#52c41a'
                            }} 
                          />
                        </Badge>
                      }
                      title={
                        <Space>
                          {doc.name}
                          {doc.isPublic && <Tag icon={<GlobalOutlined />} color="blue">Public</Tag>}
                          {!doc.isPublic && <Tag icon={<LockOutlined />} color="default">Private</Tag>}
                          <Tag color={doc.category === 'High' ? 'red' : doc.category === 'Medium' ? 'orange' : 'green'}>
                            {doc.category}
                          </Tag>
                          {favorites.includes(doc.id) && <StarOutlined style={{ color: '#faad14' }} />}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <div>{doc.description}</div>
                          <Space size={[0, 8]} wrap>
                            <Tag>{doc.type}</Tag>
                            <Tag>{doc.format}</Tag>
                            <Tag>Size: {doc.size}</Tag>
                            <Tag>v{doc.version}</Tag>
                            {doc.tags?.map(tag => (
                              <Tag key={tag} color="blue">{tag}</Tag>
                            ))}
                          </Space>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            <HistoryOutlined /> Last modified: {doc.lastModified} • By: {doc.createdBy}
                          </div>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>

          {/* Enhanced AI Services Tab */}
          <TabPane tab={<span><RobotOutlined /> AI Safety Services</span>} key="ai">
            <Row gutter={[16, 16]}>
              {generalAIServices.map(service => (
                <Col span={12} key={service.id}>
                  <Card
                    title={
                      <Space>
                        <ThunderboltOutlined />
                        {service.name}
                        <Tag color={service.premium ? "gold" : "green"}>{service.status}</Tag>
                        {service.premium && <CrownOutlined style={{ color: '#faad14' }} />}
                      </Space>
                    }
                    extra={
                      <Button 
                        type="primary" 
                        disabled={service.premium}
                        onClick={() => handleAIServiceAccess(service)}
                      >
                        {service.premium ? 'Upgrade to Access' : 'Access Service'}
                      </Button>
                    }
                  >
                    <p>{service.description}</p>
                    <Divider />
                    <Space direction="vertical">
                      <strong>Capabilities:</strong>
                      {service.capabilities.map((capability, idx) => (
                        <Tag key={idx} color="blue">{capability}</Tag>
                      ))}
                    </Space>
                    <div style={{ marginTop: 16 }}>
                      <Tag color="cyan">Accuracy: {service.accuracy}</Tag>
                      <Tag color={service.usage === 'High' ? 'red' : service.usage === 'Medium' ? 'orange' : 'blue'}>
                        {service.usage} Usage
                      </Tag>
                    </div>
                    {service.premium && (
                      <Alert
                        message="Premium AI Service"
                        description="Access advanced AI capabilities with our premium plan"
                        type="warning"
                        showIcon
                        style={{ marginTop: 16 }}
                      />
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Document Upload/Preview Modal */}
      <Modal
        title={selectedDocument ? "Document Details" : "Upload New Document"}
        visible={documentModalVisible}
        onCancel={() => {
          setDocumentModalVisible(false);
          setSelectedDocument(null);
        }}
        footer={null}
        width={720}
      >
        {selectedDocument ? (
          <div>
            <Card>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <strong>Document Name:</strong>
                </Col>
                <Col span={16}>{selectedDocument.name}</Col>
                
                <Col span={8}>
                  <strong>Description:</strong>
                </Col>
                <Col span={16}>{selectedDocument.description}</Col>
                
                <Col span={8}>
                  <strong>Category:</strong>
                </Col>
                <Col span={16}>
                  <Tag color={selectedDocument.category === 'High' ? 'red' : 'orange'}>
                    {selectedDocument.category}
                  </Tag>
                </Col>
                
                <Col span={8}>
                  <strong>Version:</strong>
                </Col>
                <Col span={16}>v{selectedDocument.version}</Col>
                
                <Col span={8}>
                  <strong>Last Modified:</strong>
                </Col>
                <Col span={16}>{selectedDocument.lastModified}</Col>
                
                <Col span={8}>
                  <strong>Created By:</strong>
                </Col>
                <Col span={16}>{selectedDocument.createdBy}</Col>
                
                <Col span={8}>
                  <strong>Downloads:</strong>
                </Col>
                <Col span={16}>{selectedDocument.downloadCount || 0}</Col>
              </Row>
            </Card>
            <Divider />
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setDocumentModalVisible(false)}>Close</Button>
              <Button type="primary" onClick={() => handleDownload(selectedDocument)}>
                Download Document
              </Button>
            </Space>
          </div>
        ) : (
          <Dragger
            name="file"
            multiple={false}
            beforeUpload={handleDocumentUpload}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <CloudUploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for single document upload. Maximum file size: 10MB
            </p>
          </Dragger>
        )}
      </Modal>
    </div>
  );
};

export default GeneralIndustry;