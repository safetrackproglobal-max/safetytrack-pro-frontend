// src/components/documents/DocumentBI.jsx
// Business Intelligence dashboard: KPIs, cost analysis, bottleneck identification,
// user productivity, custom widgets, and dashboard sharing

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Statistic, Table,
  Tag, Modal, Form, message, Popconfirm, Drawer, Descriptions,
  Tabs, Timeline, Avatar, List, Badge, Tooltip, Progress, Switch,
  Empty, Spin, Alert, Divider, Typography, Collapse, Checkbox,
  Radio, Slider, DatePicker, InputNumber, Segmented, Result,
  Steps, Transfer, Tree, Statistic as AntStatistic, FloatButton,
  Segmented as AntSegmented
} from 'antd';
import {
  DashboardOutlined, LineChartOutlined, BarChartOutlined, TableOutlined, FunnelPlotOutlined, 
  PieChartOutlined, AreaChartOutlined, FundOutlined,
  RiseOutlined, FallOutlined, DollarOutlined, ClockCircleOutlined, ProductOutlined, 
  UserOutlined, TeamOutlined, FileTextOutlined, ThunderboltOutlined,
  FireOutlined, StarOutlined, StarFilled, TrophyOutlined,
  RocketOutlined, ExperimentOutlined, BulbOutlined, FilterOutlined,
  CalendarOutlined, DownloadOutlined, ExportOutlined, ReloadOutlined,
  SettingOutlined, SaveOutlined, ShareAltOutlined, EyeOutlined,
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined,
  FullscreenOutlined, FullscreenExitOutlined, SyncOutlined,
  CheckCircleOutlined, CloseCircleOutlined, WarningOutlined,
  InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined,
  DatabaseOutlined, CloudServerOutlined, ApiOutlined,
  DeploymentUnitOutlined, ClusterOutlined, NodeIndexOutlined,
  CaretUpOutlined, CaretDownOutlined, DotChartOutlined,
  HeatMapOutlined, RadarChartOutlined, CompassOutlined,
  AuditOutlined, SafetyCertificateOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, ResponsiveContainer, Cell, Treemap, Sankey, Funnel,
  FunnelChart, RadialBarChart, RadialBar
} from 'recharts';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import './DocumentBI.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const { Statistic: AntStat } = AntStatistic;

// ============================================================
// CONSTANTS
// ============================================================

const CHART_COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#fa541c', '#eb2f96'];

const TIME_RANGES = {
  '7d': { label: 'Last 7 Days', days: 7 },
  '30d': { label: 'Last 30 Days', days: 30 },
  '90d': { label: 'Last 90 Days', days: 90 },
  '6m': { label: 'Last 6 Months', days: 180 },
  '1y': { label: 'Last Year', days: 365 },
  'custom': { label: 'Custom Range', days: null }
};

const KPI_TYPES = {
  total_documents: { label: 'Total Documents', icon: <FileTextOutlined />, color: '#1890ff', format: 'number' },
  active_users: { label: 'Active Users', icon: <UserOutlined />, color: '#52c41a', format: 'number' },
  avg_processing_time: { label: 'Avg Processing Time', icon: <ClockCircleOutlined />, color: '#faad14', format: 'hours' },
  storage_used: { label: 'Storage Used', icon: <DatabaseOutlined />, color: '#722ed1', format: 'bytes' },
  compliance_score: { label: 'Compliance Score', icon: <SafetyCertificateOutlined />, color: '#52c41a', format: 'percent' },
  approval_rate: { label: 'Approval Rate', icon: <CheckCircleOutlined />, color: '#13c2c2', format: 'percent' },
  cost_per_document: { label: 'Cost per Document', icon: <DollarOutlined />, color: '#fa541c', format: 'currency' },
  documents_per_user: { label: 'Docs per User', icon: <TeamOutlined />, color: '#eb2f96', format: 'number' }
};

const WIDGET_TYPES = {
  kpi_card: { label: 'KPI Card', icon: <RiseOutlined /> },
  bar_chart: { label: 'Bar Chart', icon: <BarChartOutlined /> },
  line_chart: { label: 'Line Chart', icon: <LineChartOutlined /> },
  pie_chart: { label: 'Pie Chart', icon: <PieChartOutlined /> },
  area_chart: { label: 'Area Chart', icon: <AreaChartOutlined /> },
  table: { label: 'Data Table', icon: <TableOutlined /> },
  funnel: { label: 'Funnel', icon: <FunnelPlotOutlined /> },
  radar: { label: 'Radar', icon: <RadarChartOutlined /> },
  heatmap: { label: 'Heat Map', icon: <HeatMapOutlined /> },
  progress: { label: 'Progress Bar', icon: < ProductOutlined /> }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentBI = ({
  companyId = null,
  embedded = false,
  onUpdate = null
}) => {
  const { user } = useAuth();

  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [customRange, setCustomRange] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Data
  const [kpis, setKpis] = useState({});
  const [trendData, setTrendData] = useState([]);
  const [distributionData, setDistributionData] = useState({});
  const [userMetrics, setUserMetrics] = useState([]);
  const [costMetrics, setCostMetrics] = useState({});
  const [bottlenecks, setBottlenecks] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [widgets, setWidgets] = useState([]);
  
  // UI State
  const [widgetLibraryVisible, setWidgetLibraryVisible] = useState(false);
  const [saveDashboardModal, setSaveDashboardModal] = useState(false);
  const [shareDashboardModal, setShareDashboardModal] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [drilldownVisible, setDrilldownVisible] = useState(false);
  const [drilldownData, setDrilldownData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  
  // Custom dashboard form
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  
  // Forms
  const [form] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const dateParams = timeRange === 'custom' && customRange ? {
        date_from: customRange[0]?.format('YYYY-MM-DD'),
        date_to: customRange[1]?.format('YYYY-MM-DD')
      } : {
        time_range: timeRange
      };
      
      const [
        kpiData,
        trendResponse,
        distributionResponse,
        userResponse,
        costResponse,
        bottleneckResponse,
        contributorResponse,
        dashboardResponse
      ] = await Promise.all([
        documentService.getBIKpis({ company_id: companyId, ...dateParams }),
        documentService.getBITrends({ company_id: companyId, ...dateParams }),
        documentService.getBIDistributions({ company_id: companyId, ...dateParams }),
        documentService.getBIUserMetrics({ company_id: companyId, ...dateParams }),
        documentService.getBICostMetrics({ company_id: companyId, ...dateParams }),
        documentService.getBIBottlenecks({ company_id: companyId, ...dateParams }),
        documentService.getBITopContributors({ company_id: companyId, ...dateParams, limit: 10 }),
        documentService.getBIDashboards({ company_id: companyId })
      ]);
      
      setKpis(kpiData.kpis || {});
      setTrendData(trendResponse.data || []);
      setDistributionData(distributionResponse.distributions || {});
      setUserMetrics(userResponse.metrics || []);
      setCostMetrics(costResponse.metrics || {});
      setBottlenecks(bottleneckResponse.bottlenecks || []);
      setTopContributors(contributorResponse.contributors || []);
      setDashboards(dashboardResponse.dashboards || []);
      
      // Load widgets for current dashboard
      if (dashboardResponse.dashboards?.length > 0) {
        const defaultDashboard = dashboardResponse.dashboards[0];
        setWidgets(defaultDashboard.widgets || []);
      }
      
    } catch (error) {
      console.error('Failed to load BI data:', error);
      message.error('Failed to load BI data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId, timeRange, customRange]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    if (value !== 'custom') {
      setCustomRange(null);
    }
  };
  
  const handleAddWidget = (widgetType) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: WIDGET_TYPES[widgetType]?.label || 'New Widget',
      size: 'medium',
      config: getDefaultWidgetConfig(widgetType)
    };
    
    setWidgets([...widgets, newWidget]);
    setWidgetLibraryVisible(false);
    message.success('Widget added');
  };
  
  const getDefaultWidgetConfig = (type) => {
    switch (type) {
      case 'kpi_card':
        return { metric: 'total_documents' };
      case 'bar_chart':
      case 'line_chart':
      case 'area_chart':
        return { data_source: 'trend', metric: 'document_count' };
      case 'pie_chart':
        return { data_source: 'distribution', dimension: 'status' };
      default:
        return {};
    }
  };
  
  const handleRemoveWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    message.success('Widget removed');
  };
  
  const handleSaveDashboard = async (values) => {
    try {
      await documentService.saveBIDashboard({
        name: values.name,
        description: values.description,
        widgets,
        is_public: values.is_public || false,
        company_id: companyId
      });
      
      message.success('Dashboard saved');
      setSaveDashboardModal(false);
      loadData();
      
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      message.error('Failed to save dashboard');
    }
  };
  
  const handleShareDashboard = async () => {
    try {
      await documentService.shareBIDashboard({
        dashboard_id: dashboards[0]?.id,
        recipients: selectedRecipients,
        company_id: companyId
      });
      
      message.success('Dashboard shared');
      setShareDashboardModal(false);
      setSelectedRecipients([]);
      
    } catch (error) {
      console.error('Failed to share dashboard:', error);
      message.error('Failed to share dashboard');
    }
  };
  
  const handleDrilldown = (metric, value) => {
    setSelectedMetric(metric);
    setDrilldownData({ metric, value, data: [] });
    setDrilldownVisible(true);
    
    // Load drilldown data
    documentService.getBIDrilldown({ 
      metric, 
      value, 
      company_id: companyId 
    }).then(data => {
      setDrilldownData(prev => ({ ...prev, data: data.items || [] }));
    }).catch(console.error);
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const formatMetric = (value, format) => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'bytes':
        if (value < 1024) return `${value} B`;
        if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
        if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
        return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'hours':
        return `${value.toFixed(1)}h`;
      default:
        return value.toLocaleString();
    }
  };
  
  const getTrendIcon = (change) => {
    if (change > 0) return <CaretUpOutlined style={{ color: '#52c41a' }} />;
    if (change < 0) return <CaretDownOutlined style={{ color: '#f5222d' }} />;
    return null;
  };
  
  const getTrendColor = (change) => {
    if (change > 0) return '#52c41a';
    if (change < 0) return '#f5222d';
    return '#8c8c8c';
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderKpiCard = (kpiKey) => {
    const config = KPI_TYPES[kpiKey];
    const value = kpis[kpiKey];
    const change = kpis[`${kpiKey}_change`] || 0;
    
    if (!config || value === undefined) return null;
    
    return (
      <Card 
        size="small" 
        className="bi-kpi-card"
        hoverable
        onClick={() => handleDrilldown(kpiKey, value)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {config.label}
            </Text>
            <div style={{ fontSize: 22, fontWeight: 600, margin: '4px 0', color: config.color }}>
              {formatMetric(value, config.format)}
            </div>
            {change !== 0 && (
              <Space size={2}>
                {getTrendIcon(change)}
                <Text style={{ fontSize: 11, color: getTrendColor(change) }}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </Text>
                <Text type="secondary" style={{ fontSize: 10 }}>vs prev period</Text>
              </Space>
            )}
          </div>
          <Avatar 
            icon={config.icon} 
            style={{ backgroundColor: config.color }}
            size="large"
          />
        </div>
      </Card>
    );
  };
  
  const renderOverviewTab = () => (
    <div>
      {/* KPI Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {Object.keys(KPI_TYPES).map(kpiKey => (
          <Col xs={24} sm={12} lg={6} key={kpiKey}>
            {renderKpiCard(kpiKey)}
          </Col>
        ))}
      </Row>
      
      {/* Main Trend Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Document Trends" 
            size="small"
            extra={
              <Space>
                <AntSegmented
                  size="small"
                  value="line"
                  options={[
                    { value: 'line', icon: <LineChartOutlined /> },
                    { value: 'bar', icon: <BarChartOutlined /> },
                    { value: 'area', icon: <AreaChartOutlined /> }
                  ]}
                />
                <Button 
                  size="small" 
                  icon={<FullscreenOutlined />}
                  onClick={() => setFullscreen(true)}
                />
              </Space>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <RTooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#1890ff" 
                  fill="url(#colorCount)" 
                  name="Created"
                />
                <Area 
                  type="monotone" 
                  dataKey="processed" 
                  stroke="#52c41a" 
                  fill="#52c41a" 
                  fillOpacity={0.3}
                  name="Processed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Status Distribution" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData.status || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={(data) => handleDrilldown('status', data.name)}
                >
                  {(distributionData.status || []).map((entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
      {/* Secondary charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="User Productivity" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={userMetrics.slice(0, 8)}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" fontSize={11} />
                <YAxis dataKey="name" type="category" fontSize={11} width={90} />
                <RTooltip />
                <Bar dataKey="documents_created" fill="#1890ff" name="Created">
                  {userMetrics.slice(0, 8).map((entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Module Distribution" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={distributionData.module || []}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" fontSize={11} />
                <PolarRadiusAxis fontSize={11} />
                <Radar 
                  name="Documents" 
                  dataKey="value" 
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  fillOpacity={0.6} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
  
  const renderProductivityTab = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Top Contributors" size="small">
            <List
              dataSource={topContributors}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: CHART_COLORS[index % CHART_COLORS.length],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 12
                      }}>
                        {index + 1}
                      </div>
                    }
                    title={
                      <Space>
                        <span>{item.name}</span>
                        {index === 0 && <TrophyOutlined style={{ color: '#faad14' }} />}
                      </Space>
                    }
                    description={
                      <div style={{ fontSize: 12 }}>
                        <span>{item.documents_created} created • </span>
                        <span>{item.documents_approved} approved • </span>
                        <span>{item.avg_time_to_approve?.toFixed(1)}h avg</span>
                      </div>
                    }
                  />
                  <Progress 
                    type="circle" 
                    percent={item.productivity_score || 0} 
                    size={40}
                    strokeColor={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Processing Bottlenecks" size="small">
            {bottlenecks.length > 0 ? (
              <List
                dataSource={bottlenecks}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: item.severity === 'high' ? '#f5222d' :
                                            item.severity === 'medium' ? '#faad14' : '#52c41a'
                          }}
                          icon={<WarningOutlined />}
                        />
                      }
                      title={item.stage}
                      description={
                        <div>
                          <div style={{ fontSize: 12 }}>{item.description}</div>
                          <Space size={[4, 4]} style={{ marginTop: 4 }}>
                            <Tag color={item.severity === 'high' ? 'red' : 'orange'}>
                              {item.avg_duration}h avg
                            </Tag>
                            <Tag>{item.affected_documents} affected</Tag>
                          </Space>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No bottlenecks detected" />
            )}
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Team Performance" size="small">
            <Table
              rowKey="id"
              dataSource={userMetrics}
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: 'User',
                  dataIndex: 'name',
                  key: 'name',
                  render: (name, record) => (
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <span>{name}</span>
                    </Space>
                  )
                },
                {
                  title: 'Documents Created',
                  dataIndex: 'documents_created',
                  key: 'documents_created',
                  sorter: (a, b) => a.documents_created - b.documents_created,
                  render: (v) => <Badge count={v} style={{ backgroundColor: '#1890ff' }} />
                },
                {
                  title: 'Approved',
                  dataIndex: 'documents_approved',
                  key: 'documents_approved',
                  render: (v) => <Badge count={v} style={{ backgroundColor: '#52c41a' }} />
                },
                {
                  title: 'Avg Processing Time',
                  dataIndex: 'avg_time_to_approve',
                  key: 'avg_time_to_approve',
                  render: (v) => v ? `${v.toFixed(1)}h` : 'N/A',
                  sorter: (a, b) => (a.avg_time_to_approve || 0) - (b.avg_time_to_approve || 0)
                },
                {
                  title: 'Productivity Score',
                  dataIndex: 'productivity_score',
                  key: 'productivity_score',
                  render: (v) => (
                    <Progress 
                      percent={v} 
                      size="small"
                      strokeColor={v >= 80 ? '#52c41a' : v >= 60 ? '#faad14' : '#f5222d'}
                    />
                  ),
                  sorter: (a, b) => a.productivity_score - b.productivity_score
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
  
  const renderCostTab = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="cost-card">
            <AntStat
              title="Total Cost"
              value={costMetrics.total_cost || 0}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="cost-card">
            <AntStat
              title="Storage Cost"
              value={costMetrics.storage_cost || 0}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="cost-card">
            <AntStat
              title="Processing Cost"
              value={costMetrics.processing_cost || 0}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="cost-card">
            <AntStat
              title="Cost per Document"
              value={costMetrics.cost_per_document || 0}
              prefix="$"
              precision={4}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Cost Trends" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costMetrics.trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <RTooltip />
                <Legend />
                <Line type="monotone" dataKey="storage" stroke="#1890ff" name="Storage" />
                <Line type="monotone" dataKey="processing" stroke="#faad14" name="Processing" />
                <Line type="monotone" dataKey="total" stroke="#f5222d" name="Total" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Cost Breakdown" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costMetrics.breakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {(costMetrics.breakdown || []).map((entry, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
  
  const renderCustomDashboardTab = () => (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Text type="secondary">
              {widgets.length} widget{widgets.length !== 1 ? 's' : ''} on dashboard
            </Text>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<PlusOutlined />}
              onClick={() => setWidgetLibraryVisible(true)}
            >
              Add Widget
            </Button>
            <Button 
              icon={<SaveOutlined />}
              onClick={() => setSaveDashboardModal(true)}
            >
              Save
            </Button>
            <Button 
              icon={<ShareAltOutlined />}
              onClick={() => setShareDashboardModal(true)}
            >
              Share
            </Button>
          </Space>
        </Col>
      </Row>
      
      {widgets.length === 0 ? (
        <Card>
          <Empty
            description={
              <div>
                <Title level={5}>Custom Dashboard</Title>
                <Text type="secondary">
                  Build your own dashboard by adding widgets
                </Text>
              </div>
            }
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setWidgetLibraryVisible(true)}
            >
              Add First Widget
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {widgets.map(widget => (
            <Col xs={24} lg={widget.size === 'large' ? 24 : widget.size === 'small' ? 8 : 12} key={widget.id}>
              <Card
                title={widget.title}
                size="small"
                extra={
                  <Space>
                    <Tooltip title="Settings">
                      <Button type="text" size="small" icon={<SettingOutlined />} />
                    </Tooltip>
                    <Popconfirm
                      title="Remove this widget?"
                      onConfirm={() => handleRemoveWidget(widget.id)}
                    >
                      <Button type="text" size="small" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </Space>
                }
              >
                {widget.type === 'kpi_card' && (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <AntStat
                      value={kpis[widget.config?.metric] || 0}
                      title={KPI_TYPES[widget.config?.metric]?.label}
                      valueStyle={{ color: KPI_TYPES[widget.config?.metric]?.color }}
                    />
                  </div>
                )}
                {widget.type === 'line_chart' && (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis fontSize={10} />
                      <RTooltip />
                      <Line type="monotone" dataKey="created" stroke="#1890ff" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {widget.type === 'bar_chart' && (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis fontSize={10} />
                      <RTooltip />
                      <Bar dataKey="created" fill="#1890ff" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderWidgetLibrary = () => (
    <Modal
      title="Widget Library"
      open={widgetLibraryVisible}
      onCancel={() => setWidgetLibraryVisible(false)}
      footer={null}
      width={800}
    >
      <Row gutter={[16, 16]}>
        {Object.entries(WIDGET_TYPES).map(([key, config]) => (
          <Col xs={12} sm={8} md={6} key={key}>
            <Card
              hoverable
              size="small"
              onClick={() => handleAddWidget(key)}
              style={{ textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }}>
                {config.icon}
              </div>
              <div style={{ fontSize: 13 }}>{config.label}</div>
            </Card>
          </Col>
        ))}
      </Row>
    </Modal>
  );
  
  const renderSaveDashboardModal = () => (
    <Modal
      title="Save Dashboard"
      open={saveDashboardModal}
      onCancel={() => setSaveDashboardModal(false)}
      footer={null}
    >
      <Form layout="vertical" onFinish={handleSaveDashboard}>
        <Form.Item 
          name="name" 
          label="Dashboard Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input placeholder="e.g., Executive Dashboard" />
        </Form.Item>
        
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Describe the purpose of this dashboard" />
        </Form.Item>
        
        <Form.Item name="is_public" valuePropName="checked">
          <Checkbox>Make available to all team members</Checkbox>
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setSaveDashboardModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save Dashboard
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderShareDashboardModal = () => (
    <Modal
      title="Share Dashboard"
      open={shareDashboardModal}
      onCancel={() => setShareDashboardModal(false)}
      onOk={handleShareDashboard}
      okText="Share"
    >
      <Form layout="vertical">
        <Form.Item label="Share with">
          <Select
            mode="multiple"
            value={selectedRecipients}
            onChange={setSelectedRecipients}
            placeholder="Enter email addresses"
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <Alert
          message="Recipients will receive a link to view this dashboard"
          type="info"
          showIcon
        />
      </Form>
    </Modal>
  );
  
  const renderDrilldownDrawer = () => (
    <Drawer
      title={`Drilldown: ${selectedMetric}`}
      open={drilldownVisible}
      onClose={() => setDrilldownVisible(false)}
      width={600}
    >
      {drilldownData ? (
        <div>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Metric">
              {KPI_TYPES[selectedMetric]?.label || selectedMetric}
            </Descriptions.Item>
            <Descriptions.Item label="Value">
              <Text strong>{formatMetric(drilldownData.value, KPI_TYPES[selectedMetric]?.format)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Records">
              {drilldownData.data?.length || 0} documents
            </Descriptions.Item>
          </Descriptions>
          
          <Divider />
          
          <List
            dataSource={drilldownData.data || []}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<FileTextOutlined />}
                  title={item.title}
                  description={`${item.status} • ${item.created_at}`}
                />
              </List.Item>
            )}
          />
        </div>
      ) : (
        <Spin />
      )}
    </Drawer>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  if (loading && !kpis.total_documents) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className={`document-bi ${fullscreen ? 'fullscreen' : ''}`} style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="bi-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <DashboardOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Business Intelligence</Title>
              <Badge status="processing" text="Live" />
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                value={timeRange}
                onChange={handleTimeRangeChange}
                style={{ width: 160 }}
              >
                {Object.entries(TIME_RANGES).map(([key, value]) => (
                  <Option key={key} value={key}>{value.label}</Option>
                ))}
              </Select>
              
              {timeRange === 'custom' && (
                <RangePicker
                  value={customRange}
                  onChange={setCustomRange}
                  size="small"
                />
              )}
              
              <Tooltip title="Auto-refresh every minute">
                <Switch
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                  checkedChildren={<SyncOutlined />}
                  unCheckedChildren={<SyncOutlined />}
                  size="small"
                />
              </Tooltip>
              
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                loading={refreshing}
              >
                Refresh
              </Button>
              
              <Button 
                icon={<ExportOutlined />}
                onClick={() => message.info('Export coming soon')}
              >
                Export
              </Button>
              
              <Tooltip title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                <Button 
                  icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={() => setFullscreen(!fullscreen)}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: (
              <Space>
                <DashboardOutlined />
                Overview
              </Space>
            ),
            children: renderOverviewTab()
          },
          {
            key: 'productivity',
            label: (
              <Space>
                <TeamOutlined />
                Productivity
              </Space>
            ),
            children: renderProductivityTab()
          },
          {
            key: 'costs',
            label: (
              <Space>
                <DollarOutlined />
                Costs
              </Space>
            ),
            children: renderCostTab()
          },
          {
            key: 'custom',
            label: (
              <Space>
                <ExperimentOutlined />
                Custom Dashboard
              </Space>
            ),
            children: renderCustomDashboardTab()
          }
        ]}
      />
      
      {/* Modals */}
      {renderWidgetLibrary()}
      {renderSaveDashboardModal()}
      {renderShareDashboardModal()}
      {renderDrilldownDrawer()}
    </div>
  );
};

export default DocumentBI;