// src/pages/Modules/EnvironmentalManagement.js

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Alert,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tooltip,
  Tabs,
  Badge,
  message,
  List,
  Avatar,
  Divider,
  Empty,
  Timeline,
  Spin,
  Descriptions,
  DatePicker,
  Dropdown,
  Menu,
  Switch,
  InputNumber
} from 'antd';
import {
  EnvironmentOutlined,
  CloudOutlined,
  WarningOutlined,
  RiseOutlined,
  TaobaoCircleFilled,
  SafetyCertificateOutlined,
  EyeOutlined,
  PlusOutlined,
  DownloadOutlined,
  DashboardOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  LineChartOutlined,
  GlobalOutlined,
  DropboxOutlined,
  FireOutlined,
  FilePdfOutlined,
  ShareAltOutlined,
  FullscreenOutlined,
  BellOutlined,
  ArrowRightOutlined,
  HomeOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  ComposedChart, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Scatter
} from 'recharts';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

// Import services
import environmentalService from '../../services/environmentalService';
import useEnvironmentalData from '../../hooks/useEnvironmentalData';
import aiService from '../../services/aiService';
import AIServiceTab from '../../components/AI/AIServiceTab';
import AdvancedEnvironmentalDashboard from '../../components/environmental/AdvancedEnvironmentalDashboard';

// Import the enhanced components
import ImpactScorecard from '../../components/environmental/panels/ImpactScorecard';
import SustainabilityTracker from '../../components/environmental/panels/SustainabilityTracker';
import ComplianceAutomationPanel from '../../components/environmental/panels/ComplianceAutomationPanel';
import EnvironmentalIntelligencePanel from '../../components/environmental/panels/EnvironmentalIntelligencePanel';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Color palette for charts
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa541c'];

// ✅ Valid sensor types for air quality
const VALID_SENSOR_TYPES = [
  'air_quality',
  'temperature',
  'humidity',
  'gas',
  'particulate',
  'co2',
  'voc',
  'pm25',
  'pm10'
];

// ✅ Valid incident types
const INCIDENT_TYPES = [
  'Spill',
  'Emission',
  'Waste',
  'Chemical Release',
  'Air Quality',
  'Water Quality',
  'Noise',
  'Other'
];

// ✅ Valid water sample types
const WATER_SAMPLE_TYPES = [
  'water',
  'wastewater',
  'groundwater',
  'surface_water',
  'drinking_water',
  'rainwater',
  'sea_water'
];

function EnvironmentalManagement() {
  const history = useHistory();
  const {
    sensors,
    waterSamples,
    environmentalIncidents,
    sustainabilityGoals,
    complianceReports,
    loading,
    error,
    statistics,
    refetch
  } = useEnvironmentalData();

  const [modalVisible, setModalVisible] = useState(false);
  const [waterSampleModalVisible, setWaterSampleModalVisible] = useState(false);
  const [incidentModalVisible, setIncidentModalVisible] = useState(false);
  const [complianceModalVisible, setComplianceModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [submitting, setSubmitting] = useState(false);
  const [goalDetailVisible, setGoalDetailVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeRange, setTimeRange] = useState('7d');
  const [chartData, setChartData] = useState({
    aqiTrend: [],
    complianceTrend: [],
    incidentTrend: [],
    goalProgress: [],
    categoryDistribution: []
  });

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Generate chart data
  useEffect(() => {
    if (sensors.length > 0 || waterSamples.length > 0) {
      generateChartData();
    }
  }, [sensors, waterSamples, environmentalIncidents, sustainabilityGoals]);

  const generateChartData = () => {
    // AQI Trend (last 7 days - simulated)
    const aqiTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      aqiTrend.push({
        date: date.format('MMM DD'),
        aqi: Math.round(50 + Math.random() * 80),
        pm25: Math.round(10 + Math.random() * 40),
        pm10: Math.round(20 + Math.random() * 60)
      });
    }

    // Compliance Trend (last 7 days)
    const complianceTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = moment().subtract(i, 'days');
      complianceTrend.push({
        date: date.format('MMM DD'),
        compliance: Math.round(70 + Math.random() * 25),
        samples: Math.round(5 + Math.random() * 10)
      });
    }

    // Incident Trend (last 7 days)
    const incidentTrend = [];
    for (let i = 6; i >= 0; i--) {
      incidentTrend.push({
        date: moment().subtract(i, 'days').format('MMM DD'),
        count: Math.floor(Math.random() * 4)
      });
    }

    // Goal Progress
    const goalProgress = sustainabilityGoals.slice(0, 5).map(goal => ({
      name: goal.goal?.length > 20 ? goal.goal.substring(0, 20) + '...' : goal.goal,
      progress: goal.progress_percentage || goal.progress || 0,
      target: goal.target_value || 100
    }));

    // Category Distribution
    const categoryDistribution = [
      { name: 'Air Quality', value: sensors.filter(s => s.sensor_type === 'air_quality' || s.type === 'air_quality').length || 12 },
      { name: 'Water Quality', value: waterSamples.length || 8 },
      { name: 'Emissions', value: sensors.filter(s => s.sensor_type === 'emissions' || s.type === 'emissions').length || 5 },
      { name: 'Waste', value: 3 },
      { name: 'Biodiversity', value: 2 }
    ];

    setChartData({
      aqiTrend,
      complianceTrend,
      incidentTrend,
      goalProgress,
      categoryDistribution
    });
  };

  // Show error alert if any
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        refetch();
        message.success('Data refreshed');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [refetch]);

  // ✅ FIXED: Handle Add Sensor with correct field mapping
  const handleAddSensor = async (values) => {
    setSubmitting(true);
    try {
      const sensorData = {
        name: values.name,
        device_id: values.device_id,
        sensor_type: values.sensor_type,
        location: values.location || '',
        status: values.status || 'active',
        min_range: values.min_range || 0,
        max_range: values.max_range || 500,
        unit: values.unit || 'AQI',
        compliance_score: values.compliance_score || 100
      };

      const response = await environmentalService.createSensor(sensorData);
      if (response && response.success) {
        message.success('Sensor added successfully');
        setModalVisible(false);
        refetch();
      } else {
        message.error(response?.error || 'Failed to add sensor');
      }
    } catch (err) {
      console.error('Add sensor error:', err);
      message.error('Failed to add sensor: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ FIXED: Handle Add Water Sample with correct field mapping
  const handleAddWaterSample = async (values) => {
    setSubmitting(true);
    try {
      const sampleData = {
        // Required fields
        sample_type: values.sample_type || 'water',
        sample_date: values.collection_time?.toISOString?.() || new Date().toISOString(),
        location: values.location,
        site_name: values.site_name,
        ph_level: values.ph_level,
        
        // Optional fields
        site_id: values.site_id || '',
        temperature: values.temperature,
        turbidity: values.turbidity,
        tds: values.tds,
        dissolved_oxygen: values.dissolved_oxygen,
        coliform_count: values.coliform_count,
        compliant: values.compliant !== undefined ? values.compliant : true,
        violations: values.violations || '',
        notes: values.notes || '',
        collection_time: values.collection_time?.toISOString?.() || new Date().toISOString()
      };

      // Validate required fields
      if (!sampleData.location) {
        message.error('Location is required');
        return;
      }
      if (!sampleData.site_name) {
        message.error('Site name is required');
        return;
      }
      if (sampleData.ph_level === undefined || sampleData.ph_level === null) {
        message.error('pH level is required');
        return;
      }

      const response = await environmentalService.createWaterSample(sampleData);
      if (response && response.success) {
        message.success('Water sample recorded successfully');
        setWaterSampleModalVisible(false);
        refetch();
      } else {
        message.error(response?.error || 'Failed to add water sample');
      }
    } catch (err) {
      console.error('Add water sample error:', err);
      message.error('Failed to add water sample: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ FIXED: Handle Report Incident with correct field mapping
  const handleReportIncident = async (values) => {
    setSubmitting(true);
    try {
      const incidentData = {
        title: values.title,
        type: values.type || 'Other',
        severity: values.severity,
        status: values.status || 'reported',
        location: values.location,
        description: values.description || '',
        impact: values.impact || '',
        action_required: values.action_required || '',
        department: values.department || '',
        cost_estimate: values.cost_estimate || 0,
        reported_by: values.reported_by || 'System User',
        reported_date: new Date().toISOString()
      };

      // Validate required fields
      if (!incidentData.title) {
        message.error('Incident title is required');
        return;
      }
      if (!incidentData.location) {
        message.error('Location is required');
        return;
      }
      if (!incidentData.severity) {
        message.error('Severity is required');
        return;
      }

      const response = await environmentalService.reportIncident(incidentData);
      if (response && response.success) {
        message.success('Environmental incident reported successfully');
        setIncidentModalVisible(false);
        refetch();
      } else {
        message.error(response?.error || 'Failed to report incident');
      }
    } catch (err) {
      console.error('Report incident error:', err);
      message.error('Failed to report incident: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateComplianceReport = async () => {
    setSubmitting(true);
    try {
      const automationData = await environmentalService.getComplianceAutomation();
      message.success(`Compliance report generated with ${automationData.overall_compliance || 85}% score`);
      setComplianceModalVisible(false);
      refetch();
    } catch (err) {
      message.error('Failed to generate compliance report: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportData = async () => {
    try {
      const filters = {
        timeframe: timeRange,
        include_sensors: true,
        include_samples: true,
        include_incidents: true
      };
      
      const blob = await environmentalService.exportEnvironmentalData('csv', filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = environmentalService.generateExportFilename('environmental', 'csv');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('Data exported successfully');
    } catch (err) {
      message.error('Failed to export data: ' + (err.message || 'Unknown error'));
    }
  };

  const navigateToDashboard = () => {
    history.push('/environmental/dashboard');
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      online: 'green',
      maintenance: 'orange',
      inactive: 'red',
      offline: 'gray',
      compliant: 'green',
      warning: 'orange',
      non_compliant: 'red',
      in_progress: 'blue',
      under_investigation: 'orange',
      resolved: 'green',
      submitted: 'blue',
      approved: 'green',
      under_review: 'orange',
      reported: 'blue',
      investigating: 'orange',
      closed: 'default'
    };
    return colors[status?.toLowerCase()] || 'blue';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'red',
      high: 'volcano', 
      medium: 'orange',
      low: 'green'
    };
    return colors[severity?.toLowerCase()] || 'blue';
  };

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { color: '#52c41a', level: 'Good', icon: <CheckCircleOutlined /> };
    if (aqi <= 100) return { color: '#faad14', level: 'Moderate', icon: <ExclamationCircleOutlined /> };
    if (aqi <= 150) return { color: '#ff4d4f', level: 'Unhealthy', icon: <WarningOutlined /> };
    return { color: '#cf1322', level: 'Hazardous', icon: <FireOutlined /> };
  };

  const getGoalProgressColor = (progress) => {
    if (progress >= 80) return '#52c41a';
    if (progress >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const handleViewGoalDetails = (goal) => {
    setSelectedGoal(goal);
    setGoalDetailVisible(true);
  };

  // Table columns
  const sensorColumns = [
    {
      title: 'Sensor',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: 500 }}>{text || 'Unnamed'}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <EnvironmentOutlined /> {record.location || 'N/A'}
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'sensor_type',
      key: 'sensor_type',
      render: (type) => (
        <Tag color="blue">{type?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase() || 'UNKNOWN'}</Tag>
      ),
    },
    {
      title: 'Device ID',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (id) => <Tag color="default">{id || 'N/A'}</Tag>
    },
    {
      title: 'Compliance',
      dataIndex: 'compliance_score',
      key: 'compliance_score',
      render: (score) => {
        if (score === null || score === undefined) return '--';
        const color = score >= 90 ? 'green' : score >= 70 ? 'orange' : 'red';
        return <Tag color={color}>{score}%</Tag>;
      }
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => date ? moment(date).format('MMM DD, HH:mm') : '-',
    }
  ];

  const waterSampleColumns = [
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: 500 }}>{text || 'N/A'}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.site_name || record.siteName || 'No site name'}</div>
        </Space>
      ),
    },
    {
      title: 'Sample Type',
      dataIndex: 'sample_type',
      key: 'sample_type',
      render: (type) => <Tag color="blue">{type || 'water'}</Tag>,
    },
    {
      title: 'pH Level',
      key: 'ph_level',
      render: (_, record) => {
        const ph = record.ph_level || record.ph;
        if (ph === undefined || ph === null) return '--';
        let color = 'green';
        if (ph < 6.5 || ph > 8.5) color = 'red';
        else if (ph < 6.8 || ph > 8.2) color = 'orange';
        return <Tag color={color}>{ph} pH</Tag>;
      },
    },
    {
      title: 'Compliance',
      key: 'compliant',
      render: (_, record) => {
        const compliant = record.compliant !== undefined ? record.compliant : true;
        return compliant ? 
          <Tag color="success" icon={<CheckCircleOutlined />}>Compliant</Tag> :
          <Tag color="error" icon={<CloseCircleOutlined />}>Non-Compliant</Tag>;
      },
    },
    {
      title: 'Collected',
      dataIndex: 'collection_time',
      key: 'collection_time',
      render: (date) => date ? moment(date).format('MMM DD, YYYY HH:mm') : '-',
    }
  ];

  const incidentColumns = [
    {
      title: 'Incident',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <strong>{text || 'Untitled'}</strong>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type || 'Other'}</Tag>,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>{severity?.toUpperCase() || 'UNKNOWN'}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}</Tag>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => location || '--'
    },
    {
      title: 'Reported',
      dataIndex: 'reported_date',
      key: 'reported_date',
      render: (date) => date ? moment(date).format('MMM DD, YYYY') : '-',
    }
  ];

  // Calculate overall sustainability progress
  const overallSustainabilityProgress = sustainabilityGoals.length > 0
    ? Math.round(sustainabilityGoals.reduce((sum, goal) => sum + (goal.progress_percentage || goal.progress || 0), 0) / sustainabilityGoals.length)
    : 0;

  const completedGoals = sustainabilityGoals.filter(g => (g.progress_percentage || g.progress || 0) >= 100).length;
  const activeGoals = sustainabilityGoals.filter(g => (g.progress_percentage || g.progress || 0) < 100 && g.status === 'active').length;

  // Chart render functions
  const renderAQITrend = () => (
    <Card size="small" title="🌡️ AQI Trend" className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData.aqiTrend}>
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 200]} />
          <RechartsTooltip />
          <Legend />
          <Area type="monotone" dataKey="aqi" stroke="#1890ff" fill="url(#aqiGradient)" />
          <Line type="monotone" dataKey="pm25" stroke="#52c41a" strokeWidth={2} />
          <Line type="monotone" dataKey="pm10" stroke="#faad14" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderComplianceTrend = () => (
    <Card size="small" title="📊 Compliance Trend" className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData.complianceTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" domain={[0, 100]} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 20]} />
          <RechartsTooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="compliance" fill="#52c41a" barSize={30} name="Compliance %" />
          <Line yAxisId="right" type="monotone" dataKey="samples" stroke="#1890ff" strokeWidth={2} name="Samples" />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderIncidentTrend = () => (
    <Card size="small" title="⚠️ Incident Trend" className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData.incidentTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 5]} />
          <RechartsTooltip />
          <Bar dataKey="count" fill="#f5222d" barSize={30} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderGoalProgressChart = () => (
    <Card size="small" title="🎯 Goal Progress" className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData.goalProgress} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="name" width={80} fontSize={10} />
          <RechartsTooltip />
          <Bar dataKey="progress" fill="#722ed1" radius={[0, 4, 4, 0]}>
            {chartData.goalProgress.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getGoalProgressColor(entry.progress)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderCategoryDistribution = () => (
    <Card size="small" title="📊 Category Distribution" className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData.categoryDistribution}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.categoryDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );

  if (loading && sensors.length === 0 && waterSamples.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading environmental data..." />
      </div>
    );
  }

  return (
    <div className="environmental-management-page">
      {/* Enhanced Header with Dashboard Link */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">
              <EnvironmentOutlined />
            </div>
            <div>
              <h1>Environmental Management System</h1>
              <p>Real-time monitoring, compliance tracking, and sustainability goals</p>
            </div>
          </div>
          <div className="header-actions">
            <Space>
              <Tooltip title="Go to Dashboard">
                <Button 
                  icon={<HomeOutlined />} 
                  onClick={navigateToDashboard}
                  type="primary"
                  ghost
                >
                  Dashboard
                </Button>
              </Tooltip>
              <Tooltip title="Last updated">
                <Badge color="green" text={lastUpdated.toLocaleTimeString()} />
              </Tooltip>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={refetch}
                loading={loading}
                size="small"
              >
                Refresh
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleExportData}
                loading={loading}
                size="small"
              >
                Export
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                loading={loading}
                size="small"
              >
                Add Sensor
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Dashboard Quick Link Banner */}
      <Alert
        message={
          <Space>
            <DashboardOutlined />
            <span>Access the full Environmental Dashboard for comprehensive analytics and visualizations</span>
          </Space>
        }
        description={
          <div style={{ marginTop: 4 }}>
            <Button type="primary" size="small" onClick={navigateToDashboard}>
              Go to Dashboard <ArrowRightOutlined />
            </Button>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16, borderRadius: 8 }}
        closable
      />

      {/* Statistics Row - Enhanced */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="Active Sensors"
              value={statistics.activeSensors || 0}
              prefix={<CloudOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={loading}
            />
            <Progress 
              percent={statistics.totalSensors > 0 ? (statistics.activeSensors / statistics.totalSensors) * 100 : 0} 
              size="small" 
              showInfo={false}
              strokeColor="#1890ff"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="Water Compliance"
              value={statistics.compliantSamples || 0}
              suffix={`/ ${statistics.totalWaterSamples || 0}`}
              prefix={<TaobaoCircleFilled />}
              valueStyle={{ color: '#52c41a' }}
              loading={loading}
            />
            <Progress 
              percent={statistics.complianceRate || 0} 
              size="small" 
              showInfo={false}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="Active Incidents"
              value={statistics.activeIncidents || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa541c' }}
              loading={loading}
            />
            {statistics.activeIncidents > 0 && (
              <Tag color="orange" style={{ marginTop: 8 }}>{statistics.activeIncidents} Need Attention</Tag>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="Sustainability Progress"
              value={overallSustainabilityProgress}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
              loading={loading}
            />
            <Progress 
              percent={overallSustainabilityProgress} 
              size="small" 
              showInfo={false}
              strokeColor="#722ed1"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section - Overview */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>📈 Environmental Analytics</h3>
          <Button 
            type="link" 
            icon={<LineChartOutlined />}
            onClick={() => setActiveTab('advanced')}
          >
            View Advanced Analytics →
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            {renderAQITrend()}
          </Col>
          <Col xs={24} lg={12}>
            {renderComplianceTrend()}
          </Col>
          <Col xs={24} lg={12}>
            {renderIncidentTrend()}
          </Col>
          <Col xs={24} lg={12}>
            {renderGoalProgressChart()}
          </Col>
        </Row>
      </div>

      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        className="management-tabs"
      >
        {/* Overview Tab - Enhanced with Charts */}
        <TabPane 
          tab={
            <span>
              <DashboardOutlined />
              Overview
            </span>
          } 
          key="overview"
        >
          {/* Quick Stats Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={8}>
              <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, opacity: 0.8 }}>Total Sensors</div>
                    <div style={{ fontSize: 32, fontWeight: 'bold' }}>{statistics.totalSensors || 0}</div>
                    <div style={{ fontSize: 12, marginTop: 8 }}>
                      <CheckCircleOutlined /> {statistics.activeSensors || 0} Active
                    </div>
                  </div>
                  <CloudOutlined style={{ fontSize: 48, opacity: 0.5 }} />
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, opacity: 0.8 }}>Water Quality</div>
                    <div style={{ fontSize: 32, fontWeight: 'bold' }}>{statistics.complianceRate || 0}%</div>
                    <div style={{ fontSize: 12, marginTop: 8 }}>
                      <CheckCircleOutlined /> {statistics.compliantSamples || 0}/{statistics.totalWaterSamples || 0} Compliant
                    </div>
                  </div>
                  <DropboxOutlined style={{ fontSize: 48, opacity: 0.5 }} />
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, opacity: 0.8 }}>Sustainability Goals</div>
                    <div style={{ fontSize: 32, fontWeight: 'bold' }}>{sustainabilityGoals.length}</div>
                    <div style={{ fontSize: 12, marginTop: 8 }}>
                      <CheckCircleOutlined /> {completedGoals} Completed
                    </div>
                  </div>
                  <TrophyOutlined style={{ fontSize: 48, opacity: 0.5 }} />
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {/* Air Quality Section */}
            <Col xs={24} lg={12}>
              <Card 
                title="🌬️ Air Quality Monitoring"
                loading={loading}
                extra={
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => setActiveTab('air-quality')}
                  >
                    View All Sensors →
                  </Button>
                }
              >
                {sensors.length > 0 ? (
                  <List
                    dataSource={sensors.slice(0, 3)}
                    renderItem={sensor => {
                      const aqi = sensor.currentMetrics?.aqi;
                      const aqiInfo = aqi ? getAQIStatus(aqi) : null;
                      return (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<CloudOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                            title={<strong>{sensor.name || 'Unnamed Sensor'}</strong>}
                            description={
                              <div>
                                <div>{sensor.location || 'N/A'}</div>
                                {aqiInfo && (
                                  <Tag color={aqiInfo.color} icon={aqiInfo.icon} style={{ marginTop: 4 }}>
                                    {aqi} AQI - {aqiInfo.level}
                                  </Tag>
                                )}
                              </div>
                            }
                          />
                          <div>
                            <Tag color={getStatusColor(sensor.status)}>{sensor.status?.toUpperCase() || 'UNKNOWN'}</Tag>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <Empty description="No sensors configured" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>

            {/* Water Quality Section */}
            <Col xs={24} lg={12}>
              <Card 
                title="💧 Water Quality Samples"
                loading={loading}
                extra={
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => setActiveTab('water-quality')}
                  >
                    View All Samples →
                  </Button>
                }
              >
                {waterSamples.length > 0 ? (
                  <List
                    dataSource={waterSamples.slice(0, 3)}
                    renderItem={sample => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<TaobaoCircleFilled />} style={{ backgroundColor: '#52c41a' }} />}
                          title={<strong>{sample.location || 'Unknown Location'}</strong>}
                          description={
                            <div>
                              <div>{sample.site_name || sample.siteName || 'No site name'}</div>
                              <div>pH: {sample.ph_level || sample.ph || '--'}</div>
                            </div>
                          }
                        />
                        <Tag color={sample.compliant ? 'green' : 'red'}>
                          {sample.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                        </Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No water samples recorded" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>

            {/* Sustainability Goals Section */}
            <Col xs={24} lg={12}>
              <Card 
                title="🎯 Sustainability Goals"
                loading={loading}
                extra={
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => setActiveTab('sustainability')}
                  >
                    View All Goals →
                  </Button>
                }
              >
                {sustainabilityGoals.length > 0 ? (
                  <List
                    dataSource={sustainabilityGoals.slice(0, 3)}
                    renderItem={goal => {
                      const progress = goal.progress_percentage || goal.progress || 0;
                      return (
                        <List.Item
                          actions={[
                            <Tooltip title="View Details">
                              <Button 
                                type="link" 
                                size="small"
                                onClick={() => handleViewGoalDetails(goal)}
                              >
                                Details
                              </Button>
                            </Tooltip>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<RiseOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                            title={<strong>{goal.goal || 'Untitled Goal'}</strong>}
                            description={
                              <div>
                                <div>{goal.target || 'No target specified'}</div>
                                <div style={{ marginTop: 8 }}>
                                  <Progress 
                                    percent={progress} 
                                    size="small" 
                                    strokeColor={getGoalProgressColor(progress)}
                                  />
                                </div>
                                <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                                  Current: {goal.current_value || 0} {goal.unit || '%'} | Target: {goal.target_value || 100} {goal.unit || '%'}
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <Empty 
                    description="No sustainability goals found" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" size="small" onClick={() => setActiveTab('sustainability')}>
                      Add Your First Goal
                    </Button>
                  </Empty>
                )}
              </Card>
            </Col>

            {/* Recent Incidents Section */}
            <Col xs={24} lg={12}>
              <Card 
                title="⚠️ Recent Incidents"
                loading={loading}
                extra={
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => setActiveTab('incidents')}
                  >
                    View All Incidents →
                  </Button>
                }
              >
                {environmentalIncidents.length > 0 ? (
                  <Timeline
                    items={environmentalIncidents.slice(0, 3).map(incident => ({
                      color: getSeverityColor(incident.severity),
                      children: (
                        <div>
                          <strong>{incident.title || 'Untitled Incident'}</strong>
                          <div style={{ fontSize: 12, color: '#666' }}>{incident.location || 'N/A'}</div>
                          <div style={{ marginTop: 4 }}>
                            <Tag color={getSeverityColor(incident.severity)}>{incident.severity?.toUpperCase() || 'UNKNOWN'}</Tag>
                            <Tag color={getStatusColor(incident.status)}>{incident.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}</Tag>
                          </div>
                          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                            {incident.reported_date ? moment(incident.reported_date).fromNow() : 'N/A'}
                          </div>
                        </div>
                      )
                    }))}
                  />
                ) : (
                  <Empty description="No incidents reported" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Air Quality Tab */}
        <TabPane 
          tab={
            <span>
              <CloudOutlined />
              Air Quality
              <Badge count={statistics.totalSensors || 0} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="air-quality"
        >
          <Card
            title="🌬️ Air Quality Monitoring"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Add Sensor
              </Button>
            }
            loading={loading}
          >
            <Table
              columns={sensorColumns}
              dataSource={sensors}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Water Quality Tab */}
        <TabPane 
          tab={
            <span>
              <TaobaoCircleFilled />
              Water Quality
              <Badge count={statistics.totalWaterSamples || 0} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="water-quality"
        >
          <Card
            title="💧 Water Quality Management"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setWaterSampleModalVisible(true)}
              >
                Add Water Sample
              </Button>
            }
            loading={loading}
          >
            <Table
              columns={waterSampleColumns}
              dataSource={waterSamples}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Incidents Tab */}
        <TabPane 
          tab={
            <span>
              <WarningOutlined />
              Incidents
              <Badge count={statistics.activeIncidents || 0} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="incidents"
        >
          <Card
            title="⚠️ Environmental Incidents"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setIncidentModalVisible(true)}
              >
                Report Incident
              </Button>
            }
            loading={loading}
          >
            <Table
              columns={incidentColumns}
              dataSource={environmentalIncidents}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        {/* Sustainability Tab */}
        <TabPane 
          tab={
            <span>
              <RiseOutlined />
              Sustainability
              <Badge count={sustainabilityGoals.length} style={{ marginLeft: 8 }} />
            </span>
          } 
          key="sustainability"
        >
          <SustainabilityTracker />
        </TabPane>

        {/* Compliance Tab */}
        <TabPane 
          tab={
            <span>
              <SafetyCertificateOutlined />
              Compliance
              <Badge count="AUTO" style={{ marginLeft: 8, backgroundColor: '#1890ff' }} />
            </span>
          } 
          key="compliance"
        >
          <ComplianceAutomationPanel />
        </TabPane>

        {/* Impact Tab */}
        <TabPane 
          tab={
            <span>
              <LineChartOutlined />
              Impact
            </span>
          } 
          key="impact"
        >
          <ImpactScorecard data={sustainabilityGoals} />
        </TabPane>

        {/* Intelligence Tab */}
        <TabPane 
          tab={
            <span>
              <GlobalOutlined />
              Intelligence
              <Badge count="AI" style={{ marginLeft: 8, backgroundColor: '#722ed1' }} />
            </span>
          } 
          key="intelligence"
        >
          <EnvironmentalIntelligencePanel 
            data={{
              environmental_health_score: overallSustainabilityProgress,
              carbon_footprint: 45,
              sustainability_index: overallSustainabilityProgress,
              predictive_alerts: environmentalIncidents.map(inc => ({
                id: inc.id,
                message: inc.title || 'Untitled Incident',
                severity: inc.severity === 'critical' ? 'high' : inc.severity === 'high' ? 'medium' : 'low',
                confidence: 85,
                suggested_action: inc.description || 'Investigate incident'
              })),
              live_metrics: {
                air_quality: statistics.activeSensors > 0 ? 75 : 0,
                water_quality: statistics.complianceRate || 0,
                biodiversity: 68,
                energy_efficiency: 82,
                emissions: 45,
                sustainability: overallSustainabilityProgress
              }
            }}
          />
        </TabPane>

        {/* AI Services Tab */}
        <TabPane 
          tab={
            <span>
              <RobotOutlined />
              AI Services
            </span>
          } 
          key="ai-services"
        >
          <AIServiceTab 
            environmentalData={{
              sensors,
              waterSamples,
              incidents: environmentalIncidents,
              goals: sustainabilityGoals,
              reports: complianceReports
            }}
            aiServices={aiService}
          />
        </TabPane>

        {/* Advanced Dashboard Tab */}
        <TabPane 
          tab={
            <span>
              <ThunderboltOutlined />
              Advanced
              <Badge count="NEW" style={{ marginLeft: 8, backgroundColor: '#52c41a' }} />
            </span>
          } 
          key="advanced"
        >
          <AdvancedEnvironmentalDashboard 
            environmentalData={{
              sensors,
              waterSamples,
              incidents: environmentalIncidents,
              goals: sustainabilityGoals,
              reports: complianceReports
            }}
          />
        </TabPane>
      </Tabs>

      {/* Goal Details Modal */}
      <Modal
        title={selectedGoal?.goal || 'Goal Details'}
        open={goalDetailVisible}
        onCancel={() => setGoalDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setGoalDetailVisible(false)}>
            Close
          </Button>
        ]}
        width={500}
      >
        {selectedGoal && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Description">{selectedGoal.target || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Current Progress">
                <Progress 
                  percent={selectedGoal.progress_percentage || selectedGoal.progress || 0}
                  strokeColor={getGoalProgressColor(selectedGoal.progress_percentage || selectedGoal.progress || 0)}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Current Value">
                {selectedGoal.current_value || 0} {selectedGoal.unit || '%'}
              </Descriptions.Item>
              <Descriptions.Item label="Target Value">
                {selectedGoal.target_value || 100} {selectedGoal.unit || '%'}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="blue">{selectedGoal.category || 'General'}</Tag>
              </Descriptions.Item>
              {selectedGoal.deadline && (
                <Descriptions.Item label="Deadline">
                  {moment(selectedGoal.deadline).format('MMMM DD, YYYY')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedGoal.status)}>
                  {selectedGoal.status?.toUpperCase() || 'ACTIVE'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* ✅ FIXED: Add Sensor Modal */}
      <Modal
        title="Add New Sensor"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={550}
        destroyOnClose
      >
        <Alert
          message="Sensor Information"
          description="Fill in the sensor details below. All fields marked with * are required."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form 
          layout="vertical" 
          onFinish={handleAddSensor}
          initialValues={{
            status: 'active',
            sensor_type: 'air_quality',
            min_range: 0,
            max_range: 500,
            unit: 'AQI',
            compliance_score: 100
          }}
        >
          <Form.Item
            name="name"
            label="Sensor Name *"
            rules={[{ required: true, message: 'Please enter sensor name' }]}
          >
            <Input placeholder="e.g., Main Building Sensor" />
          </Form.Item>

          <Form.Item
            name="device_id"
            label="Device ID *"
            rules={[
              { required: true, message: 'Please enter device ID' },
              { pattern: /^[a-zA-Z0-9\-_]+$/, message: 'Only letters, numbers, hyphens, and underscores allowed' }
            ]}
          >
            <Input placeholder="e.g., AQ-001" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location *"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input placeholder="e.g., Building A - Floor 3" />
          </Form.Item>

          <Form.Item
            name="sensor_type"
            label="Sensor Type *"
            rules={[{ required: true, message: 'Please select sensor type' }]}
            tooltip="Only air quality related sensor types are allowed"
          >
            <Select placeholder="Select sensor type">
              {VALID_SENSOR_TYPES.map(type => (
                <Option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="offline">Offline</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="min_range" label="Min Range">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_range" label="Max Range">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="unit" label="Unit">
            <Input placeholder="e.g., AQI, ppm, µg/m³" />
          </Form.Item>

          <Form.Item name="compliance_score" label="Compliance Score">
            <InputNumber 
              style={{ width: '100%' }} 
              min={0} 
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Add Sensor
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ✅ FIXED: Add Water Sample Modal */}
      <Modal
        title="Add Water Sample"
        open={waterSampleModalVisible}
        onCancel={() => setWaterSampleModalVisible(false)}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Alert
          message="Required Fields"
          description="Sample Type, Location, Site Name, pH Level, and Collection Time are required."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form 
          layout="vertical" 
          onFinish={handleAddWaterSample}
          initialValues={{
            compliant: true,
            sample_type: 'water',
            collection_time: moment()
          }}
        >
          <Form.Item
            name="sample_type"
            label="Sample Type *"
            rules={[{ required: true, message: 'Please select sample type' }]}
          >
            <Select placeholder="Select sample type">
              {WATER_SAMPLE_TYPES.map(type => (
                <Option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location *"
                rules={[{ required: true, message: 'Please enter location' }]}
              >
                <Input placeholder="e.g., Industrial Zone A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="site_name"
                label="Site Name *"
                rules={[{ required: true, message: 'Please enter site name' }]}
              >
                <Input placeholder="e.g., abigalistic" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ph_level"
                label="pH Level *"
                rules={[{ required: true, message: 'Please enter pH level' }]}
              >
                <InputNumber 
                  min={0} 
                  max={14} 
                  step={0.1} 
                  style={{ width: '100%' }}
                  placeholder="0.0 - 14.0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="collection_time"
                label="Collection Time *"
                rules={[{ required: true, message: 'Please select collection time' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD HH:mm:ss" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="temperature" label="Temperature (°C)">
                <InputNumber min={-10} max={50} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="turbidity" label="Turbidity (NTU)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tds" label="TDS (mg/L)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dissolved_oxygen" label="DO (mg/L)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="coliform_count" label="Coliform Count">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="compliant" label="Compliant" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="violations" label="Violations">
            <TextArea rows={2} placeholder="Any violations found" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} placeholder="Additional notes" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setWaterSampleModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Add Sample
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ✅ FIXED: Report Incident Modal */}
      <Modal
        title="Report Environmental Incident"
        open={incidentModalVisible}
        onCancel={() => setIncidentModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Alert
          message="Incident Report"
          description="Please provide details about the environmental incident. All fields marked with * are required."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form layout="vertical" onFinish={handleReportIncident} initialValues={{ severity: 'medium', status: 'reported' }}>
          <Form.Item
            name="title"
            label="Incident Title *"
            rules={[{ required: true, message: 'Please enter incident title' }]}
          >
            <Input placeholder="Enter incident title" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Incident Type *"
            rules={[{ required: true, message: 'Please select incident type' }]}
          >
            <Select placeholder="Select incident type">
              {INCIDENT_TYPES.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="Location *"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input placeholder="Enter incident location" />
          </Form.Item>

          <Form.Item
            name="severity"
            label="Severity *"
            rules={[{ required: true, message: 'Please select severity' }]}
          >
            <Select placeholder="Select severity">
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="critical">Critical</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
          >
            <Select>
              <Option value="reported">Reported</Option>
              <Option value="investigating">Investigating</Option>
              <Option value="resolved">Resolved</Option>
              <Option value="closed">Closed</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description *"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} placeholder="Detailed description of the incident" />
          </Form.Item>

          <Form.Item name="impact" label="Impact">
            <TextArea rows={2} placeholder="Environmental impact assessment" />
          </Form.Item>

          <Form.Item name="action_required" label="Action Required">
            <TextArea rows={2} placeholder="Required actions to resolve the incident" />
          </Form.Item>

          <Form.Item name="department" label="Department">
            <Input placeholder="Responsible department" />
          </Form.Item>

          <Form.Item name="cost_estimate" label="Cost Estimate">
            <InputNumber 
              style={{ width: '100%' }}
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Estimated cost"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIncidentModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Report Incident
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Compliance Report Modal */}
      <Modal
        title="Generate Compliance Report"
        open={complianceModalVisible}
        onCancel={() => setComplianceModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setComplianceModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="generate" 
            type="primary" 
            onClick={handleGenerateComplianceReport}
            loading={submitting}
          >
            Generate Report
          </Button>
        ]}
      >
        <div>
          <p>This will generate a comprehensive compliance report including:</p>
          <ul>
            <li>Current compliance status</li>
            <li>Pending violations</li>
            <li>Upcoming deadlines</li>
            <li>AI-powered recommendations</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}

export default EnvironmentalManagement;