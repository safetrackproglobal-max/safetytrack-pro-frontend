// src/components/safety/SafetyObservations.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Row, Col, Button, Table, Tag, Space, Modal, Form, Input,
  Select, DatePicker, TimePicker, message, Badge, Statistic, Progress,
  Tabs, Divider, Alert, Avatar, Tooltip, Timeline, List, Empty,
  Upload, Switch, Radio, Checkbox, InputNumber, Drawer, Descriptions,
  Popconfirm, notification, Slider, Segmented, Rate
} from 'antd';
import {
  EyeOutlined, SafetyCertificateOutlined, CheckCircleOutlined,
  WarningOutlined, CloseCircleOutlined, PlusOutlined, CameraOutlined,
  TeamOutlined, EnvironmentOutlined, ClockCircleOutlined,
  UserOutlined, EditOutlined, DeleteOutlined, FilterOutlined,
  ExportOutlined, FileImageOutlined, BulbOutlined, ThunderboltOutlined,
  AimOutlined, FireOutlined, ToolOutlined, HeartOutlined,
  StarOutlined, StarFilled, LikeOutlined, DislikeOutlined,
  SendOutlined, ReloadOutlined, DownloadOutlined, EyeInvisibleOutlined,
  AlertOutlined, RiseOutlined, FallOutlined, InfoCircleOutlined,
  CheckOutlined, CloseOutlined, InboxOutlined
} from '@ant-design/icons';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement, RadialLinearScale,
  Title, Tooltip as ChartTooltip, Legend, Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut, Radar } from 'react-chartjs-2';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, RadialLinearScale, Title,
  ChartTooltip, Legend, Filler
);

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title: AntTitle, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Dragger } = Upload;

// ==================== OBSERVATION TYPES ====================

const OBSERVATION_TYPES = {
  safe_behavior: {
    id: 'safe_behavior',
    label: 'Safe Behavior',
    color: '#52c41a',
    icon: <CheckCircleOutlined />,
    description: 'Recognizing positive safety behaviors',
    category: 'positive'
  },
  at_risk_behavior: {
    id: 'at_risk_behavior',
    label: 'At-Risk Behavior',
    color: '#faad14',
    icon: <WarningOutlined />,
    description: 'Observing unsafe behaviors that need correction',
    category: 'negative'
  },
  unsafe_condition: {
    id: 'unsafe_condition',
    label: 'Unsafe Condition',
    color: '#fa541c',
    icon: <AlertOutlined />,
    description: 'Identifying hazardous conditions',
    category: 'negative'
  },
  near_miss: {
    id: 'near_miss',
    label: 'Near Miss',
    color: '#1890ff',
    icon: <ThunderboltOutlined />,
    description: 'Events that could have caused harm',
    category: 'negative'
  },
  good_practice: {
    id: 'good_practice',
    label: 'Good Practice',
    color: '#722ed1',
    icon: <StarOutlined />,
    description: 'Best practices worth sharing',
    category: 'positive'
  },
  improvement: {
    id: 'improvement',
    label: 'Improvement Opportunity',
    color: '#13c2c2',
    icon: <BulbOutlined />,
    description: 'Areas for safety improvement',
    category: 'neutral'
  },
  hazard: {
    id: 'hazard',
    label: 'Hazard Identification',
    color: '#f5222d',
    icon: <FireOutlined />,
    description: 'Identifying potential hazards',
    category: 'negative'
  }
};

const BEHAVIOR_CATEGORIES = {
  ppe_usage: { label: 'PPE Usage', icon: <SafetyCertificateOutlined /> },
  body_position: { label: 'Body Position', icon: <UserOutlined /> },
  tool_usage: { label: 'Tool Usage', icon: <ToolOutlined /> },
  procedures: { label: 'Procedures', icon: <FileTextOutlined /> },
  housekeeping: { label: 'Housekeeping', icon: <EnvironmentOutlined /> },
  communication: { label: 'Communication', icon: <TeamOutlined /> },
  awareness: { label: 'Awareness', icon: <EyeOutlined /> },
  equipment: { label: 'Equipment', icon: <ToolOutlined /> },
  environment: { label: 'Environment', icon: <EnvironmentOutlined /> },
  ergonomics: { label: 'Ergonomics', icon: <HeartOutlined /> }
};

const RISK_LEVELS = {
  low: { label: 'Low', color: '#52c41a', value: 1 },
  medium: { label: 'Medium', color: '#faad14', value: 2 },
  high: { label: 'High', color: '#fa541c', value: 3 },
  critical: { label: 'Critical', color: '#f5222d', value: 4 }
};

// ==================== SAFETY OBSERVATIONS COMPONENT ====================

const SafetyObservations = ({ 
  observations: initialObservations = [],
  onAddObservation,
  onUpdateObservation,
  currentUser,
  readOnly = false 
}) => {
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [editingObservation, setEditingObservation] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchText, setSearchText] = useState('');

  // Load observations
  useEffect(() => {
    setObservations(initialObservations.length > 0 ? initialObservations : getMockObservations());
  }, [initialObservations]);

  // Mock data for demonstration
  const getMockObservations = () => {
    const mockData = [
      {
        id: '1',
        type: 'safe_behavior',
        category: 'ppe_usage',
        title: 'Proper PPE usage observed',
        description: 'Worker was observed wearing all required PPE including hard hat, safety glasses, and steel-toed boots.',
        location: 'Building A - Floor 3',
        department: 'Construction',
        observer: { id: '1', name: 'John Smith' },
        observedPerson: 'Mike Johnson',
        riskLevel: 'low',
        date: dayjs().subtract(2, 'day').toISOString(),
        status: 'closed',
        photos: [],
        positiveRecognition: true,
        points: 10
      },
      {
        id: '2',
        type: 'at_risk_behavior',
        category: 'body_position',
        title: 'Improper lifting technique',
        description: 'Worker was observed lifting heavy box with incorrect posture. Risk of back injury.',
        location: 'Warehouse - Bay 5',
        department: 'Logistics',
        observer: { id: '1', name: 'John Smith' },
        observedPerson: 'Sarah Williams',
        riskLevel: 'medium',
        date: dayjs().subtract(1, 'day').toISOString(),
        status: 'open',
        correctiveAction: 'Provide manual handling training',
        photos: []
      },
      {
        id: '3',
        type: 'unsafe_condition',
        category: 'housekeeping',
        title: 'Blocked emergency exit',
        description: 'Emergency exit blocked by stored materials. Immediate hazard in case of evacuation.',
        location: 'Building B - East Wing',
        department: 'Maintenance',
        observer: { id: '2', name: 'Emily Davis' },
        riskLevel: 'high',
        date: dayjs().subtract(5, 'hour').toISOString(),
        status: 'in_progress',
        correctiveAction: 'Remove obstruction immediately, review storage procedures',
        photos: []
      },
      {
        id: '4',
        type: 'near_miss',
        category: 'equipment',
        title: 'Forklift near miss',
        description: 'Forklift operator almost struck pedestrian in blind corner. No injuries.',
        location: 'Loading Dock 2',
        department: 'Warehouse',
        observer: { id: '3', name: 'Robert Chen' },
        observedPerson: 'Multiple',
        riskLevel: 'critical',
        date: dayjs().subtract(3, 'day').toISOString(),
        status: 'investigating',
        photos: []
      },
      {
        id: '5',
        type: 'good_practice',
        category: 'communication',
        title: 'Excellent safety briefing',
        description: 'Team lead conducted thorough pre-shift safety briefing with hazard identification.',
        location: 'Building C - Meeting Room',
        department: 'Production',
        observer: { id: '1', name: 'John Smith' },
        riskLevel: 'low',
        date: dayjs().subtract(1, 'week').toISOString(),
        status: 'closed',
        positiveRecognition: true,
        points: 15
      }
    ];
    return mockData;
  };

  // Handle save observation
  const handleSaveObservation = (values) => {
    setLoading(true);
    
    setTimeout(() => {
      const observationData = {
        id: editingObservation?.id || Date.now().toString(),
        ...values,
        date: values.date.format('YYYY-MM-DD') + 'T' + (values.time?.format('HH:mm:ss') || '00:00:00'),
        observer: currentUser || { id: '1', name: 'Current User' },
        photos: fileList.map(f => ({
          name: f.name,
          url: f.url || URL.createObjectURL(f)
        })),
        status: 'open',
        createdAt: editingObservation?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingObservation) {
        setObservations(prev => prev.map(o => 
          o.id === editingObservation.id ? observationData : o
        ));
        if (onUpdateObservation) onUpdateObservation(observationData);
        message.success('Observation updated');
      } else {
        setObservations(prev => [observationData, ...prev]);
        if (onAddObservation) onAddObservation(observationData);
        message.success('Observation recorded');
        
        // Show recognition notification for positive observations
        if (observationData.type === 'safe_behavior' || observationData.type === 'good_practice') {
          notification.success({
            message: '🌟 Positive Observation Recorded!',
            description: `${observationData.observedPerson || 'Employee'} earned ${observationData.points || 10} safety points!`,
            duration: 5
          });
        }
      }

      setModalVisible(false);
      form.resetFields();
      setEditingObservation(null);
      setFileList([]);
      setLoading(false);
    }, 800);
  };

  // Handle delete
  const handleDelete = (observationId) => {
    setObservations(prev => prev.filter(o => o.id !== observationId));
    message.success('Observation deleted');
  };

  // Handle status change
  const handleStatusChange = (observationId, newStatus) => {
    setObservations(prev => prev.map(o => 
      o.id === observationId 
        ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
        : o
    ));
    message.success(`Status updated to ${newStatus}`);
  };

  // Filtered observations
  const filteredObservations = useMemo(() => {
    return observations.filter(obs => {
      if (filterType !== 'all' && obs.type !== filterType) return false;
      if (filterCategory !== 'all' && obs.category !== filterCategory) return false;
      if (filterRisk !== 'all' && obs.riskLevel !== filterRisk) return false;
      if (searchText) {
        const search = searchText.toLowerCase();
        return (
          obs.title?.toLowerCase().includes(search) ||
          obs.description?.toLowerCase().includes(search) ||
          obs.location?.toLowerCase().includes(search) ||
          obs.department?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [observations, filterType, filterCategory, filterRisk, searchText]);

  // Statistics
  const stats = useMemo(() => {
    const total = observations.length;
    const positive = observations.filter(o => 
      o.type === 'safe_behavior' || o.type === 'good_practice'
    ).length;
    const negative = observations.filter(o => 
      o.type === 'at_risk_behavior' || o.type === 'unsafe_condition' || 
      o.type === 'near_miss' || o.type === 'hazard'
    ).length;
    const open = observations.filter(o => o.status === 'open').length;
    const closed = observations.filter(o => o.status === 'closed').length;
    
    const byType = {};
    observations.forEach(o => {
      byType[o.type] = (byType[o.type] || 0) + 1;
    });

    const byRisk = {};
    observations.forEach(o => {
      byRisk[o.riskLevel] = (byRisk[o.riskLevel] || 0) + 1;
    });

    const byCategory = {};
    observations.forEach(o => {
      byCategory[o.category] = (byCategory[o.category] || 0) + 1;
    });

    // Calculate safety score (positive / total * 100)
    const safetyScore = total > 0 ? Math.round((positive / total) * 100) : 0;

    return { total, positive, negative, open, closed, byType, byRisk, byCategory, safetyScore };
  }, [observations]);

  // Chart data
  const typeChartData = {
    labels: Object.keys(stats.byType).map(t => OBSERVATION_TYPES[t]?.label || t),
    datasets: [{
      data: Object.values(stats.byType),
      backgroundColor: Object.keys(stats.byType).map(t => OBSERVATION_TYPES[t]?.color || '#1890ff'),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const categoryChartData = {
    labels: Object.keys(stats.byCategory).map(c => BEHAVIOR_CATEGORIES[c]?.label || c),
    datasets: [{
      data: Object.values(stats.byCategory),
      backgroundColor: '#722ed1',
      borderColor: '#531dab',
      borderWidth: 1
    }]
  };

  const trendData = useMemo(() => {
    const last30Days = {};
    for (let i = 29; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('MM-DD');
      last30Days[date] = { positive: 0, negative: 0 };
    }

    observations.forEach(o => {
      const date = dayjs(o.date).format('MM-DD');
      if (last30Days[date]) {
        if (o.type === 'safe_behavior' || o.type === 'good_practice') {
          last30Days[date].positive++;
        } else {
          last30Days[date].negative++;
        }
      }
    });

    return {
      labels: Object.keys(last30Days),
      datasets: [
        {
          label: 'Positive',
          data: Object.values(last30Days).map(d => d.positive),
          borderColor: '#52c41a',
          backgroundColor: 'rgba(82, 196, 26, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Negative',
          data: Object.values(last30Days).map(d => d.negative),
          borderColor: '#f5222d',
          backgroundColor: 'rgba(245, 34, 45, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [observations]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  // Table columns
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (type) => {
        const config = OBSERVATION_TYPES[type] || {};
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
      filters: Object.entries(OBSERVATION_TYPES).map(([key, config]) => ({
        text: config.label,
        value: key
      })),
      onFilter: (value, record) => record.type === value
    },
    {
      title: 'Observation',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.location} • {record.department}
          </Text>
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      render: (cat) => {
        const config = BEHAVIOR_CATEGORIES[cat] || {};
        return (
          <Tag icon={config.icon}>{config.label || cat}</Tag>
        );
      }
    },
    {
      title: 'Risk',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (risk) => {
        const config = RISK_LEVELS[risk] || {};
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      filters: Object.entries(RISK_LEVELS).map(([key, config]) => ({
        text: config.label,
        value: key
      })),
      onFilter: (value, record) => record.riskLevel === value
    },
    {
      title: 'Observer',
      dataIndex: 'observer',
      key: 'observer',
      width: 130,
      render: (observer) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {observer?.name || 'Unknown'}
        </Space>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => dayjs(date).format('MMM DD, HH:mm'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => {
        const config = {
          open: { color: 'blue', label: 'Open' },
          in_progress: { color: 'orange', label: 'In Progress' },
          closed: { color: 'green', label: 'Closed' }
        };
        const c = config[status] || config.open;
        return <Tag color={c.color}>{c.label}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="link" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedObservation(record);
                setDetailsVisible(true);
              }}
            />
          </Tooltip>
          {!readOnly && (
            <>
              <Tooltip title="Edit">
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingObservation(record);
                    form.setFieldsValue({
                      ...record,
                      date: dayjs(record.date),
                      time: dayjs(record.date)
                    });
                    setModalVisible(true);
                  }}
                />
              </Tooltip>
              <Popconfirm
                title="Delete this observation?"
                onConfirm={() => handleDelete(record.id)}
              >
                <Button 
                  type="link" 
                  size="small" 
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="Total"
              value={stats.total}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="Positive"
              value={stats.positive}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="At-Risk"
              value={stats.negative}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="Open"
              value={stats.open}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="Closed"
              value={stats.closed}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="Safety Score"
              value={stats.safetyScore}
              suffix="%"
              prefix={<StarFilled style={{ color: '#faad14' }} />}
              valueStyle={{ 
                color: stats.safetyScore >= 70 ? '#52c41a' : 
                       stats.safetyScore >= 40 ? '#faad14' : '#f5222d'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Safety Score Progress */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Space>
              <StarFilled style={{ color: '#faad14', fontSize: 20 }} />
              <Text strong>Safety Culture Score</Text>
            </Space>
          </Col>
          <Col span={14}>
            <Progress
              percent={stats.safetyScore}
              strokeColor={
                stats.safetyScore >= 70 ? '#52c41a' :
                stats.safetyScore >= 40 ? '#faad14' : '#f5222d'
              }
              format={(p) => `${p}% (${stats.positive} positive / ${stats.total} total)`}
            />
          </Col>
          <Col span={4}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Higher is better
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={<span><EyeOutlined /> Observations</span>} 
          key="list"
        >
          {/* Filters */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Input.Search
                  placeholder="Search observations..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select
                  value={filterType}
                  onChange={setFilterType}
                  style={{ width: '100%' }}
                  placeholder="Type"
                >
                  <Option value="all">All Types</Option>
                  {Object.entries(OBSERVATION_TYPES).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.icon} {config.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select
                  value={filterCategory}
                  onChange={setFilterCategory}
                  style={{ width: '100%' }}
                  placeholder="Category"
                >
                  <Option value="all">All Categories</Option>
                  {Object.entries(BEHAVIOR_CATEGORIES).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.icon} {config.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select
                  value={filterRisk}
                  onChange={setFilterRisk}
                  style={{ width: '100%' }}
                  placeholder="Risk"
                >
                  <Option value="all">All Risks</Option>
                  {Object.entries(RISK_LEVELS).map(([key, config]) => (
                    <Option key={key} value={key}>{config.label}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                {!readOnly && (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingObservation(null);
                      form.resetFields();
                      form.setFieldsValue({
                        date: dayjs(),
                        time: dayjs(),
                        riskLevel: 'low',
                        type: 'safe_behavior'
                      });
                      setFileList([]);
                      setModalVisible(true);
                    }}
                    block
                  >
                    New Observation
                  </Button>
                )}
              </Col>
            </Row>
          </Card>

          {/* Observations Table */}
          <Card>
            {filteredObservations.length > 0 ? (
              <Table
                dataSource={filteredObservations}
                columns={columns}
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  showTotal: (total) => `Total ${total} observations`
                }}
                size="small"
                scroll={{ x: 1000 }}
                rowClassName={(record) => {
                  if (record.riskLevel === 'critical') return 'critical-row';
                  if (record.riskLevel === 'high') return 'high-row';
                  return '';
                }}
              />
            ) : (
              <Empty description="No observations found" />
            )}
          </Card>
        </TabPane>

        <TabPane 
          tab={<span><RiseOutlined /> Analytics</span>} 
          key="analytics"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card title="Observation Types">
                <div style={{ height: 280 }}>
                  <Doughnut data={typeChartData} options={chartOptions} />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={16}>
              <Card title="30-Day Trend">
                <div style={{ height: 280 }}>
                  <Line data={trendData} options={chartOptions} />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="By Category">
                <div style={{ height: 280 }}>
                  <Bar 
                    data={categoryChartData} 
                    options={{
                      ...chartOptions,
                      plugins: { ...chartOptions.plugins, legend: { display: false } }
                    }} 
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Risk Distribution">
                <div style={{ height: 280 }}>
                  <Radar 
                    data={{
                      labels: Object.keys(stats.byRisk).map(r => RISK_LEVELS[r]?.label || r),
                      datasets: [{
                        label: 'Risk Levels',
                        data: Object.values(stats.byRisk),
                        backgroundColor: 'rgba(24, 144, 255, 0.2)',
                        borderColor: '#1890ff',
                        pointBackgroundColor: '#1890ff'
                      }]
                    }}
                    options={{
                      ...chartOptions,
                      scales: { r: { beginAtZero: true } }
                    }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane 
          tab={<span><StarOutlined /> Recognition</span>} 
          key="recognition"
        >
          <Alert
            message="Safety Recognition Program"
            description="Employees earn points for positive safety observations. Top performers are recognized monthly."
            type="success"
            showIcon
            icon={<StarFilled style={{ color: '#faad14' }} />}
            style={{ marginBottom: 16 }}
          />

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Top Performers This Month">
                <List
                  dataSource={[
                    { name: 'Mike Johnson', points: 45, observations: 8, department: 'Construction' },
                    { name: 'Sarah Williams', points: 35, observations: 7, department: 'Logistics' },
                    { name: 'Robert Chen', points: 30, observations: 6, department: 'Warehouse' },
                    { name: 'Emily Davis', points: 25, observations: 5, department: 'Maintenance' },
                    { name: 'James Wilson', points: 20, observations: 4, department: 'Production' }
                  ]}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            style={{ 
                              backgroundColor: index === 0 ? '#faad14' :
                                              index === 1 ? '#d9d9d9' :
                                              index === 2 ? '#cd7f32' : '#1890ff'
                            }}
                          >
                            {index + 1}
                          </Avatar>
                        }
                        title={
                          <Space>
                            <Text strong>{item.name}</Text>
                            <Tag color="blue">{item.department}</Tag>
                          </Space>
                        }
                        description={
                          <Space>
                            <Text>{item.observations} observations</Text>
                            <Tag color="gold" icon={<StarFilled />}>
                              {item.points} points
                            </Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Recent Recognition">
                <Timeline>
                  {observations
                    .filter(o => o.positiveRecognition)
                    .slice(0, 5)
                    .map(o => (
                      <Timeline.Item 
                        key={o.id}
                        color="green"
                        dot={<StarFilled style={{ color: '#faad14' }} />}
                      >
                        <Space direction="vertical" size={0}>
                          <Text strong>{o.observedPerson || 'Team'}</Text>
                          <Text type="secondary">{o.title}</Text>
                          <Space>
                            <Tag color="gold">+{o.points || 10} points</Tag>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {dayjs(o.date).fromNow()}
                            </Text>
                          </Space>
                        </Space>
                      </Timeline.Item>
                    ))}
                </Timeline>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Add/Edit Observation Modal */}
      <Modal
        title={
          <Space>
            {editingObservation ? <EditOutlined /> : <PlusOutlined />}
            {editingObservation ? 'Edit Observation' : 'New Safety Observation'}
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingObservation(null);
          setFileList([]);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveObservation}
        >
          {/* Quick Type Selection */}
          <Form.Item
            name="type"
            label="Observation Type"
            rules={[{ required: true }]}
          >
            <Radio.Group buttonStyle="solid">
              <Space wrap>
                {Object.entries(OBSERVATION_TYPES).map(([key, config]) => (
                  <Radio.Button key={key} value={key}>
                    <Space>
                      {config.icon}
                      {config.label}
                    </Space>
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select category">
                  {Object.entries(BEHAVIOR_CATEGORIES).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.icon} {config.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="riskLevel"
                label="Risk Level"
                rules={[{ required: true }]}
              >
                <Select>
                  {Object.entries(RISK_LEVELS).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Tag color={config.color}>{config.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Observation Title"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input placeholder="Brief summary of the observation" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Description is required' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Describe what you observed in detail..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="time"
                label="Time"
                rules={[{ required: true }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true }]}
              >
                <Input prefix={<EnvironmentOutlined />} placeholder="Where observed" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Department">
                <Input placeholder="Department" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="observedPerson" label="Person(s) Involved">
                <Input prefix={<UserOutlined />} placeholder="Name(s)" />
              </Form.Item>
            </Col>
          </Row>

          {/* Corrective Action (for negative observations) */}
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.type !== curr.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              const isNegative = ['at_risk_behavior', 'unsafe_condition', 'near_miss', 'hazard'].includes(type);
              
              if (isNegative) {
                return (
                  <Form.Item
                    name="correctiveAction"
                    label="Immediate Corrective Action"
                    rules={[{ required: true, message: 'Please describe corrective action' }]}
                  >
                    <TextArea 
                      rows={3} 
                      placeholder="What action was taken to address this observation?"
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          {/* Positive Recognition (for positive observations) */}
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.type !== curr.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              const isPositive = ['safe_behavior', 'good_practice'].includes(type);
              
              if (isPositive) {
                return (
                  <>
                    <Form.Item
                      name="positiveRecognition"
                      label="Recognize Employee"
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch 
                        checkedChildren="Yes" 
                        unCheckedChildren="No"
                      />
                    </Form.Item>
                    
                    <Form.Item
                      name="points"
                      label="Recognition Points"
                      initialValue={10}
                    >
                      <InputNumber 
                        min={0} 
                        max={100} 
                        style={{ width: '100%' }}
                        addonAfter="points"
                      />
                    </Form.Item>
                  </>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item label="Photos / Evidence">
            <Dragger
              multiple
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              listType="picture"
            >
              <p className="ant-upload-drag-icon">
                <CameraOutlined />
              </p>
              <p className="ant-upload-text">Click or drag photos to upload</p>
              <p className="ant-upload-hint">Support for JPG, PNG (max 10MB each)</p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
              >
                {editingObservation ? 'Update' : 'Save'} Observation
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingObservation(null);
                setFileList([]);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title={
          <Space>
            <EyeOutlined />
            Observation Details
            {selectedObservation && (
              <Tag color={OBSERVATION_TYPES[selectedObservation.type]?.color}>
                {OBSERVATION_TYPES[selectedObservation.type]?.label}
              </Tag>
            )}
          </Space>
        }
        placement="right"
        width={600}
        open={detailsVisible}
        onClose={() => {
          setDetailsVisible(false);
          setSelectedObservation(null);
        }}
      >
        {selectedObservation && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Title">
                <Text strong>{selectedObservation.title}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                <Paragraph>{selectedObservation.description}</Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag 
                  color={OBSERVATION_TYPES[selectedObservation.type]?.color}
                  icon={OBSERVATION_TYPES[selectedObservation.type]?.icon}
                >
                  {OBSERVATION_TYPES[selectedObservation.type]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag icon={BEHAVIOR_CATEGORIES[selectedObservation.category]?.icon}>
                  {BEHAVIOR_CATEGORIES[selectedObservation.category]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Risk Level">
                <Tag color={RISK_LEVELS[selectedObservation.riskLevel]?.color}>
                  {RISK_LEVELS[selectedObservation.riskLevel]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedObservation.location}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedObservation.department}
              </Descriptions.Item>
              <Descriptions.Item label="Person(s) Involved">
                {selectedObservation.observedPerson || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Observer">
                {selectedObservation.observer?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Date/Time">
                {dayjs(selectedObservation.date).format('MMMM DD, YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={
                  selectedObservation.status === 'closed' ? 'green' :
                  selectedObservation.status === 'in_progress' ? 'orange' : 'blue'
                }>
                  {selectedObservation.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedObservation.correctiveAction && (
              <>
                <Divider orientation="left">Corrective Action</Divider>
                <Alert
                  message="Action Taken"
                  description={selectedObservation.correctiveAction}
                  type="info"
                  showIcon
                />
              </>
            )}

            {selectedObservation.positiveRecognition && (
              <>
                <Divider orientation="left">Recognition</Divider>
                <Alert
                  message={
                    <Space>
                      <StarFilled style={{ color: '#faad14' }} />
                      Positive Recognition Awarded
                    </Space>
                  }
                  description={`${selectedObservation.points || 10} safety points awarded to ${selectedObservation.observedPerson || 'employee'}`}
                  type="success"
                  showIcon
                />
              </>
            )}

            {selectedObservation.photos?.length > 0 && (
              <>
                <Divider orientation="left">Photos</Divider>
                <Row gutter={[8, 8]}>
                  {selectedObservation.photos.map((photo, i) => (
                    <Col span={8} key={i}>
                      <img 
                        src={photo.url} 
                        alt={photo.name}
                        style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                      />
                    </Col>
                  ))}
                </Row>
              </>
            )}

            {!readOnly && selectedObservation.status !== 'closed' && (
              <>
                <Divider />
                <Space>
                  <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      handleStatusChange(selectedObservation.id, 'closed');
                      setDetailsVisible(false);
                    }}
                  >
                    Mark as Closed
                  </Button>
                  {selectedObservation.status === 'open' && (
                    <Button 
                      icon={<ClockCircleOutlined />}
                      onClick={() => handleStatusChange(selectedObservation.id, 'in_progress')}
                    >
                      Start Action
                    </Button>
                  )}
                </Space>
              </>
            )}
          </div>
        )}
      </Drawer>

      <style jsx>{`
        .critical-row {
          background-color: #fff1f0 !important;
        }
        .high-row {
          background-color: #fff7e6 !important;
        }
      `}</style>
    </div>
  );
};

export default SafetyObservations;