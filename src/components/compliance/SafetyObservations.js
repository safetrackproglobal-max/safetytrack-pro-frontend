// src/components/safety/SafetyObservations.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card, Row, Col, Button, Table, Tag, Space, Modal, Form, Input,
  Select, DatePicker, TimePicker, message, Badge, Statistic, Progress,
  Tabs, Divider, Alert, Avatar, Tooltip, Timeline, List, Empty,
  Upload, Switch, Radio, Checkbox, InputNumber, Drawer, Descriptions,
  Popconfirm, notification, Slider, Segmented, Rate, Spin, Typography,  Collapse,
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
  CheckOutlined, CloseOutlined, InboxOutlined, SaveOutlined, FileTextOutlined
} from '@ant-design/icons';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement, RadialLinearScale,
  Title, Tooltip as ChartTooltip, Legend, Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut, Radar } from 'react-chartjs-2';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// ✅ SERVICE IMPORTS
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

dayjs.extend(relativeTime);

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
    id: 'safe_behavior', label: 'Safe Behavior', color: '#52c41a',
    icon: <CheckCircleOutlined />, description: 'Recognizing positive safety behaviors',
    category: 'positive'
  },
  at_risk_behavior: {
    id: 'at_risk_behavior', label: 'At-Risk Behavior', color: '#faad14',
    icon: <WarningOutlined />, description: 'Observing unsafe behaviors',
    category: 'negative'
  },
  unsafe_condition: {
    id: 'unsafe_condition', label: 'Unsafe Condition', color: '#fa541c',
    icon: <AlertOutlined />, description: 'Identifying hazardous conditions',
    category: 'negative'
  },
  near_miss: {
    id: 'near_miss', label: 'Near Miss', color: '#1890ff',
    icon: <ThunderboltOutlined />, description: 'Events that could have caused harm',
    category: 'negative'
  },
  good_practice: {
    id: 'good_practice', label: 'Good Practice', color: '#722ed1',
    icon: <StarOutlined />, description: 'Best practices worth sharing',
    category: 'positive'
  },
  improvement: {
    id: 'improvement', label: 'Improvement Opportunity', color: '#13c2c2',
    icon: <BulbOutlined />, description: 'Areas for safety improvement',
    category: 'neutral'
  },
  hazard: {
    id: 'hazard', label: 'Hazard Identification', color: '#f5222d',
    icon: <FireOutlined />, description: 'Identifying potential hazards',
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
  currentUser: propUser,
  readOnly = false 
}) => {
  // ✅ Get user from context
  const { user: contextUser } = useAuth();
  const currentUser = propUser || contextUser;

  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // ==================== FETCH OBSERVATIONS ====================

  const fetchObservations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationService.getSafetyObservations({
        page: 1,
        per_page: 100
      });

      const data = 
        response?.observations || 
        response?.data?.observations || 
        (Array.isArray(response) ? response : []) || 
        [];

      setObservations(data);
    } catch (error) {
      console.warn('Observations API unavailable:', error);
      if (initialObservations.length > 0) {
        setObservations(initialObservations);
      }
    } finally {
      setLoading(false);
    }
  }, [initialObservations]);

  // ==================== FETCH STATS ====================

  const fetchStats = useCallback(async () => {
    try {
      const response = await notificationService.getObservationStats();
      const statsData = response?.stats || response?.data || response;
      if (statsData) setStats(statsData);
    } catch (error) {
      console.warn('Stats API unavailable, calculating locally');
    }
  }, []);

  // ==================== FETCH LEADERBOARD ====================

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await notificationService.getObservationLeaderboard();
      const board = response?.leaderboard || response?.data || [];
      setLeaderboard(board);
    } catch (error) {
      console.warn('Leaderboard API unavailable');
    }
  }, []);

  // Load on mount
  useEffect(() => {
    fetchObservations();
    fetchStats();
    fetchLeaderboard();
  }, [fetchObservations, fetchStats, fetchLeaderboard]);

  // ==================== SAVE OBSERVATION ====================

  const handleSaveObservation = async (values) => {
    setSaving(true);

    try {
      // ✅ Map form fields to backend field names (matching SafetyObservation model)
      const dateObserved = values.date.format('YYYY-MM-DD') + 'T' + 
                          (values.time?.format('HH:mm:ss') || '00:00:00') + 'Z';

      const payload = {
        type: values.type,                    // backend uses 'type', not 'observation_type'
        category: values.category,
        title: values.title,
        description: values.description,
        location: values.location,
        department: values.department,
        observed_person: values.observedPerson,
        risk_level: values.riskLevel,
        immediate_action: values.correctiveAction,
        recommendation: values.recommendation,
        date_observed: dateObserved,
        positive_recognition: values.positiveRecognition || false,
        points_awarded: values.points || 0,
        photos: fileList.map(f => ({
          name: f.name,
          url: f.url || '',
          size: f.size,
          type: f.type
        }))
      };

      let response;
      if (editingObservation) {
        response = await notificationService.updateSafetyObservation(editingObservation.id, payload);
      } else {
        response = await notificationService.createSafetyObservation(payload);
      }

      const saved = response?.observation || response?.data?.observation || response;

      // Refresh
      await fetchObservations();
      await fetchStats();

      // Notify parent
      if (editingObservation) {
        if (onUpdateObservation) onUpdateObservation(saved);
        message.success('Observation updated');
      } else {
        if (onAddObservation) onAddObservation(saved);
        message.success('Observation recorded');

        // Recognition notification for positive observations
        if (values.type === 'safe_behavior' || values.type === 'good_practice') {
          notification.success({
            message: '🌟 Positive Observation Recorded!',
            description: `${values.observedPerson || 'Employee'} earned ${values.points || 10} safety points!`,
            duration: 5
          });
        }
      }

      setModalVisible(false);
      form.resetFields();
      setEditingObservation(null);
      setFileList([]);
    } catch (error) {
      console.error('Save failed:', error);
      message.error(error?.message || 'Failed to save observation');
    } finally {
      setSaving(false);
    }
  };

  // ==================== DELETE ====================

  const handleDelete = async (observationId) => {
    // Optimistic
    const previous = [...observations];
    setObservations(prev => prev.filter(o => o.id !== observationId));

    try {
      await notificationService.deleteSafetyObservation(observationId);
      await fetchStats();
      message.success('Observation deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      setObservations(previous);
      message.error('Failed to delete observation');
    }
  };

  // ==================== STATUS CHANGE ====================

  const handleStatusChange = async (observationId, newStatus) => {
    // Optimistic
    const previous = [...observations];
    setObservations(prev => prev.map(o => 
      o.id === observationId 
        ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
        : o
    ));

    try {
      await notificationService.updateObservationStatus(observationId, newStatus);
      message.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Status update failed:', error);
      setObservations(previous);
      message.error('Failed to update status');
    }
  };

  // ==================== FILTERS ====================

  const filteredObservations = useMemo(() => {
    return observations.filter(obs => {
      const obsType = obs.type || obs.observation_type;
      const obsRisk = obs.risk_level || obs.riskLevel;
      
      if (filterType !== 'all' && obsType !== filterType) return false;
      if (filterCategory !== 'all' && obs.category !== filterCategory) return false;
      if (filterRisk !== 'all' && obsRisk !== filterRisk) return false;
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

  // ==================== LOCAL STATS (Fallback) ====================

  const localStats = useMemo(() => {
    const total = observations.length;
    const positive = observations.filter(o => 
      (o.type || o.observation_type) === 'safe_behavior' || 
      (o.type || o.observation_type) === 'good_practice'
    ).length;
    const negative = observations.filter(o => 
      ['at_risk_behavior', 'unsafe_condition', 'near_miss', 'hazard'].includes(o.type || o.observation_type)
    ).length;
    const open = observations.filter(o => o.status === 'open').length;
    const closed = observations.filter(o => o.status === 'closed').length;
    
    const byType = {};
    observations.forEach(o => {
      const t = o.type || o.observation_type;
      if (t) byType[t] = (byType[t] || 0) + 1;
    });

    const byRisk = {};
    observations.forEach(o => {
      const r = o.risk_level || o.riskLevel;
      if (r) byRisk[r] = (byRisk[r] || 0) + 1;
    });

    const byCategory = {};
    observations.forEach(o => {
      if (o.category) byCategory[o.category] = (byCategory[o.category] || 0) + 1;
    });

    const safetyScore = total > 0 ? Math.round((positive / total) * 100) : 0;

    return { total, positive, negative, open, closed, byType, byRisk, byCategory, safetyScore };
  }, [observations]);

  // Use API stats if available, else local
  const statsData = stats || localStats;

  // ==================== CHART DATA ====================

  const typeChartData = {
    labels: Object.keys(statsData.byType || {}).map(t => OBSERVATION_TYPES[t]?.label || t),
    datasets: [{
      data: Object.values(statsData.byType || {}),
      backgroundColor: Object.keys(statsData.byType || {}).map(t => OBSERVATION_TYPES[t]?.color || '#1890ff'),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const categoryChartData = {
    labels: Object.keys(statsData.byCategory || {}).map(c => BEHAVIOR_CATEGORIES[c]?.label || c),
    datasets: [{
      data: Object.values(statsData.byCategory || {}),
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
      const obsDate = o.date_observed || o.date;
      const date = dayjs(obsDate).format('MM-DD');
      if (last30Days[date]) {
        const t = o.type || o.observation_type;
        if (t === 'safe_behavior' || t === 'good_practice') {
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

  // ==================== TABLE COLUMNS ====================

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (type, record) => {
        const t = type || record.observation_type;
        const config = OBSERVATION_TYPES[t] || {};
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      }
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
        return <Tag icon={config.icon}>{config.label || cat}</Tag>;
      }
    },
    {
      title: 'Risk',
      dataIndex: 'risk_level',
      key: 'risk_level',
      width: 100,
      render: (risk, record) => {
        const r = risk || record.riskLevel;
        const config = RISK_LEVELS[r] || {};
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: 'Observer',
      key: 'observer',
      width: 130,
      render: (_, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {record.observer?.name || record.observer_name || 'Unknown'}
        </Space>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date_observed',
      key: 'date_observed',
      width: 120,
      render: (date, record) => dayjs(date || record.date).format('MMM DD, HH:mm')
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
                    const obsDate = record.date_observed || record.date;
                    form.setFieldsValue({
                      type: record.type || record.observation_type,
                      category: record.category,
                      title: record.title,
                      description: record.description,
                      location: record.location,
                      department: record.department,
                      observedPerson: record.observed_person || record.observedPerson,
                      riskLevel: record.risk_level || record.riskLevel,
                      correctiveAction: record.immediate_action || record.correctiveAction,
                      recommendation: record.recommendation,
                      date: obsDate ? dayjs(obsDate) : dayjs(),
                      time: obsDate ? dayjs(obsDate) : dayjs(),
                      positiveRecognition: record.positive_recognition || record.positiveRecognition,
                      points: record.points_awarded || record.points
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

  // ==================== RENDER ====================

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic title="Total" value={statsData.total} prefix={<EyeOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic title="Positive" value={statsData.positive} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic title="At-Risk" value={statsData.negative} prefix={<WarningOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic title="Open" value={statsData.open} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#fa541c' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic title="Closed" value={statsData.closed} prefix={<CheckOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="Safety Score"
              value={statsData.safetyScore}
              suffix="%"
              prefix={<StarFilled style={{ color: '#faad14' }} />}
              valueStyle={{ 
                color: statsData.safetyScore >= 70 ? '#52c41a' : 
                       statsData.safetyScore >= 40 ? '#faad14' : '#f5222d'
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
              percent={statsData.safetyScore}
              strokeColor={
                statsData.safetyScore >= 70 ? '#52c41a' :
                statsData.safetyScore >= 40 ? '#faad14' : '#f5222d'
              }
              format={(p) => `${p}% (${statsData.positive} positive / ${statsData.total} total)`}
            />
          </Col>
          <Col span={4}>
            <Text type="secondary" style={{ fontSize: 11 }}>Higher is better</Text>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><EyeOutlined /> Observations</span>} key="list">
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
                <Select value={filterType} onChange={setFilterType} style={{ width: '100%' }} placeholder="Type">
                  <Option value="all">All Types</Option>
                  {Object.entries(OBSERVATION_TYPES).map(([key, config]) => (
                    <Option key={key} value={key}>{config.icon} {config.label}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select value={filterCategory} onChange={setFilterCategory} style={{ width: '100%' }} placeholder="Category">
                  <Option value="all">All Categories</Option>
                  {Object.entries(BEHAVIOR_CATEGORIES).map(([key, config]) => (
                    <Option key={key} value={key}>{config.icon} {config.label}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Select value={filterRisk} onChange={setFilterRisk} style={{ width: '100%' }} placeholder="Risk">
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
          <Card extra={
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={fetchObservations} loading={loading} size="small" />
            </Tooltip>
          }>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <Spin size="large" tip="Loading observations..." />
              </div>
            ) : filteredObservations.length > 0 ? (
              <Table
                dataSource={filteredObservations}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} observations` }}
                size="small"
                scroll={{ x: 1000 }}
                rowClassName={(record) => {
                  const risk = record.risk_level || record.riskLevel;
                  if (risk === 'critical') return 'critical-row';
                  if (risk === 'high') return 'high-row';
                  return '';
                }}
              />
            ) : (
              <Empty description="No observations found" />
            )}
          </Card>
        </TabPane>

        <TabPane tab={<span><RiseOutlined /> Analytics</span>} key="analytics">
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
                      labels: Object.keys(statsData.byRisk || {}).map(r => RISK_LEVELS[r]?.label || r),
                      datasets: [{
                        label: 'Risk Levels',
                        data: Object.values(statsData.byRisk || {}),
                        backgroundColor: 'rgba(24, 144, 255, 0.2)',
                        borderColor: '#1890ff',
                        pointBackgroundColor: '#1890ff'
                      }]
                    }}
                    options={{ ...chartOptions, scales: { r: { beginAtZero: true } } }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><StarOutlined /> Recognition</span>} key="recognition">
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
                {leaderboard.length > 0 ? (
                  <List
                    dataSource={leaderboard}
                    renderItem={(item, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar style={{ 
                              backgroundColor: index === 0 ? '#faad14' :
                                              index === 1 ? '#d9d9d9' :
                                              index === 2 ? '#cd7f32' : '#1890ff'
                            }}>
                              {index + 1}
                            </Avatar>
                          }
                          title={<Text strong>{item.user_name || item.name}</Text>}
                          description={
                            <Space>
                              <Text>{item.observation_count} observations</Text>
                              <Tag color="gold" icon={<StarFilled />}>
                                {item.total_points} points
                              </Tag>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No leaderboard data yet" />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Recent Recognition">
                <Timeline>
                  {observations
                    .filter(o => o.positive_recognition || o.positiveRecognition)
                    .slice(0, 5)
                    .map(o => (
                      <Timeline.Item 
                        key={o.id}
                        color="green"
                        dot={<StarFilled style={{ color: '#faad14' }} />}
                      >
                        <Space direction="vertical" size={0}>
                          <Text strong>{o.observed_person || o.observedPerson || 'Team'}</Text>
                          <Text type="secondary">{o.title}</Text>
                          <Space>
                            <Tag color="gold">+{o.points_awarded || o.points || 10} points</Tag>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {dayjs(o.date_observed || o.date).fromNow()}
                            </Text>
                          </Space>
                        </Space>
                      </Timeline.Item>
                    ))}
                </Timeline>
                {observations.filter(o => o.positive_recognition || o.positiveRecognition).length === 0 && (
                  <Empty description="No recognition yet" />
                )}
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
        <Form form={form} layout="vertical" onFinish={handleSaveObservation}>
          <Form.Item
            name="type"
            label="Observation Type"
            rules={[{ required: true }]}
          >
            <Radio.Group buttonStyle="solid">
              <Space wrap>
                {Object.entries(OBSERVATION_TYPES).map(([key, config]) => (
                  <Radio.Button key={key} value={key}>
                    <Space>{config.icon}{config.label}</Space>
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select category">
                  {Object.entries(BEHAVIOR_CATEGORIES).map(([key, config]) => (
                    <Option key={key} value={key}>{config.icon} {config.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="riskLevel" label="Risk Level" rules={[{ required: true }]}>
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

          <Form.Item name="title" label="Observation Title" rules={[{ required: true }]}>
            <Input placeholder="Brief summary" />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Describe what you observed..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="time" label="Time" rules={[{ required: true }]}>
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="location" label="Location" rules={[{ required: true }]}>
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

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              const isNegative = ['at_risk_behavior', 'unsafe_condition', 'near_miss', 'hazard'].includes(type);
              if (isNegative) {
                return (
                  <Form.Item
                    name="correctiveAction"
                    label="Immediate Corrective Action"
                    rules={[{ required: true }]}
                  >
                    <TextArea rows={3} placeholder="What action was taken?" />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
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
                      <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                    <Form.Item name="points" label="Recognition Points" initialValue={10}>
                      <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="points" />
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
              <p className="ant-upload-drag-icon"><CameraOutlined /></p>
              <p className="ant-upload-text">Click or drag photos to upload</p>
              <p className="ant-upload-hint">JPG, PNG (max 10MB each)</p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving}
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
              <Tag color={OBSERVATION_TYPES[selectedObservation.type || selectedObservation.observation_type]?.color}>
                {OBSERVATION_TYPES[selectedObservation.type || selectedObservation.observation_type]?.label}
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
                  color={OBSERVATION_TYPES[selectedObservation.type || selectedObservation.observation_type]?.color}
                  icon={OBSERVATION_TYPES[selectedObservation.type || selectedObservation.observation_type]?.icon}
                >
                  {OBSERVATION_TYPES[selectedObservation.type || selectedObservation.observation_type]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag icon={BEHAVIOR_CATEGORIES[selectedObservation.category]?.icon}>
                  {BEHAVIOR_CATEGORIES[selectedObservation.category]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Risk Level">
                <Tag color={RISK_LEVELS[selectedObservation.risk_level || selectedObservation.riskLevel]?.color}>
                  {RISK_LEVELS[selectedObservation.risk_level || selectedObservation.riskLevel]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Location">{selectedObservation.location}</Descriptions.Item>
              <Descriptions.Item label="Department">{selectedObservation.department}</Descriptions.Item>
              <Descriptions.Item label="Person(s) Involved">
                {selectedObservation.observed_person || selectedObservation.observedPerson || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Observer">
                {selectedObservation.observer?.name || selectedObservation.observer_name}
              </Descriptions.Item>
              <Descriptions.Item label="Date/Time">
                {dayjs(selectedObservation.date_observed || selectedObservation.date).format('MMMM DD, YYYY HH:mm')}
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

            {(selectedObservation.immediate_action || selectedObservation.correctiveAction) && (
              <>
                <Divider orientation="left">Corrective Action</Divider>
                <Alert
                  message="Action Taken"
                  description={selectedObservation.immediate_action || selectedObservation.correctiveAction}
                  type="info"
                  showIcon
                />
              </>
            )}

            {(selectedObservation.positive_recognition || selectedObservation.positiveRecognition) && (
              <>
                <Divider orientation="left">Recognition</Divider>
                <Alert
                  message={
                    <Space>
                      <StarFilled style={{ color: '#faad14' }} />
                      Positive Recognition Awarded
                    </Space>
                  }
                  description={`${selectedObservation.points_awarded || selectedObservation.points || 10} safety points awarded to ${selectedObservation.observed_person || 'employee'}`}
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
        .critical-row { background-color: #fff1f0 !important; }
        .high-row { background-color: #fff7e6 !important; }
      `}</style>
    </div>
  );
};

export default SafetyObservations;