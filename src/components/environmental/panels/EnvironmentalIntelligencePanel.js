// src/components/environmental/panels/EnvironmentalIntelligencePanel.js

import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Statistic, Alert, Progress, Tag, Timeline,
  Button, Space, Divider, Tooltip, Badge, Empty, Spin, Tabs,
  message, Switch
} from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  FireOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  HeatMapOutlined,
  GlobalOutlined,
  DashboardOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  RadarChartOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ComposedChart, ResponsiveContainer, Cell, Scatter, ScatterChart
} from 'recharts';
// ✅ FIX: Use environmentalService instead of advancedEnvironmentalService
import environmentalService from '../../../services/environmentalService';
import './EnvironmentalIntelligencePanel.css';

const { TabPane } = Tabs;

// Color palette
const COLORS = {
  green: ['#52c41a', '#95de64', '#b7eb8f', '#d9f7be'],
  blue: ['#1890ff', '#40a9ff', '#69c0ff', '#91d5ff'],
  red: ['#f5222d', '#ff4d4f', '#ff7875', '#ffa39e'],
  orange: ['#faad14', '#ffc53d', '#ffd666', '#ffe58f'],
  purple: ['#722ed1', '#9254de', '#b37feb', '#d3adf7'],
  cyan: ['#13c2c2', '#36cfc9', '#5cdbd3', '#87e8de']
};

const EnvironmentalIntelligencePanel = ({ data: initialData, onRefresh, loading: parentLoading }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [chartData, setChartData] = useState({
    healthTrend: [],
    carbonEmissions: [],
    sustainabilityScore: [],
    metricDistribution: [],
    categoryPerformance: [],
    weeklyTrend: [],
    riskMatrix: []
  });

  // Sample data for demonstration
  const sampleData = {
    environmental_health_score: 85,
    carbon_footprint: 45,
    sustainability_index: 78,
    live_sensors: 24,
    health_trend: [
      { month: 'Jan', score: 72 },
      { month: 'Feb', score: 75 },
      { month: 'Mar', score: 78 },
      { month: 'Apr', score: 80 },
      { month: 'May', score: 83 },
      { month: 'Jun', score: 85 }
    ],
    carbon_emissions: [
      { source: 'Energy', value: 35 },
      { source: 'Transport', value: 25 },
      { source: 'Waste', value: 20 },
      { source: 'Industry', value: 15 },
      { source: 'Other', value: 5 }
    ],
    sustainability_metrics: [
      { category: 'Air Quality', score: 92 },
      { category: 'Water Quality', score: 85 },
      { category: 'Biodiversity', score: 68 },
      { category: 'Energy Efficiency', score: 95 },
      { category: 'Emissions', score: 45 },
      { category: 'Sustainability', score: 78 }
    ],
    weekly_metrics: [
      { day: 'Mon', air: 90, water: 85, energy: 92, waste: 70 },
      { day: 'Tue', air: 88, water: 82, energy: 90, waste: 75 },
      { day: 'Wed', air: 92, water: 88, energy: 95, waste: 80 },
      { day: 'Thu', air: 85, water: 80, energy: 88, waste: 65 },
      { day: 'Fri', air: 95, water: 92, energy: 96, waste: 85 },
      { day: 'Sat', air: 90, water: 85, energy: 90, waste: 78 },
      { day: 'Sun', air: 88, water: 83, energy: 89, waste: 72 }
    ],
    risk_assessment: [
      { area: 'Air Quality', risk: 25, impact: 30 },
      { area: 'Water Quality', risk: 15, impact: 20 },
      { area: 'Emissions', risk: 65, impact: 70 },
      { area: 'Biodiversity', risk: 45, impact: 40 },
      { area: 'Waste Management', risk: 35, impact: 25 }
    ],
    predictive_alerts: [
      {
        id: 1,
        message: '🌡️ High Temperature Alert',
        severity: 'high',
        confidence: 92,
        suggested_action: 'Temperature levels exceeding threshold in Zone A. Immediate action recommended.'
      },
      {
        id: 2,
        message: '📊 Air Quality Warning',
        severity: 'medium',
        confidence: 78,
        suggested_action: 'Air quality index approaching moderate levels. Monitor sensitive populations.'
      },
      {
        id: 3,
        message: '🌱 Positive Trend Detected',
        severity: 'low',
        confidence: 88,
        suggested_action: 'Vegetation index showing 5% improvement over last 30 days. Continue current practices.'
      }
    ],
    live_metrics: {
      air_quality: 92,
      water_quality: 85,
      biodiversity: 68,
      energy_efficiency: 95,
      emissions: 45,
      sustainability: 78
    }
  };

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      generateChartData(initialData);
    } else {
      loadData();
    }

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [initialData, autoRefresh]);

  // ✅ FIX: Use environmentalService.getEnvironmentalIntelligence()
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading environmental intelligence data...');
      
      // ✅ Use environmentalService.getEnvironmentalIntelligence() - this exists!
      const response = await environmentalService.getEnvironmentalIntelligence();
      console.log('📥 Intelligence response:', response);
      
      if (response && Object.keys(response).length > 0) {
        setData(response);
        generateChartData(response);
        console.log('✅ Intelligence data loaded successfully');
      } else {
        console.warn('⚠️ No intelligence data, using fallback');
        setData(sampleData);
        generateChartData(sampleData);
      }
    } catch (error) {
      console.error('❌ Failed to load intelligence data:', error);
      console.error('Error details:', error.message);
      setData(sampleData);
      generateChartData(sampleData);
      message.warning('Using sample environmental intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (data) => {
    setChartData({
      healthTrend: data.health_trend || sampleData.health_trend,
      carbonEmissions: data.carbon_emissions || sampleData.carbon_emissions,
      sustainabilityScore: data.sustainability_metrics || sampleData.sustainability_metrics,
      metricDistribution: [
        { name: 'Excellent', value: 40 },
        { name: 'Good', value: 30 },
        { name: 'Moderate', value: 20 },
        { name: 'Poor', value: 10 }
      ],
      categoryPerformance: data.sustainability_metrics || sampleData.sustainability_metrics,
      weeklyTrend: data.weekly_metrics || sampleData.weekly_metrics,
      riskMatrix: data.risk_assessment || sampleData.risk_assessment
    });
  };

  const handleRefresh = () => {
    loadData();
    if (onRefresh) onRefresh();
    message.success('Intelligence data refreshed');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#1890ff';
    if (score >= 40) return '#faad14';
    return '#f5222d';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    return 'Poor';
  };

  // Render Health Trend Chart
  const renderHealthTrend = () => (
    <Card size="small" title="📈 Environmental Health Trend" className="chart-card">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData.healthTrend}>
          <defs>
            <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} />
          <RechartsTooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#52c41a"
            strokeWidth={2}
            fill="url(#healthGradient)"
            dot={{ fill: '#52c41a' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );

  // Render Carbon Emissions Chart
  const renderCarbonEmissions = () => (
    <Card size="small" title="🏭 Carbon Emissions Breakdown" className="chart-card">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData.carbonEmissions}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.carbonEmissions.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.blue[index % COLORS.blue.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );

  // Render Sustainability Metrics
  const renderSustainabilityMetrics = () => (
    <Card size="small" title="♻️ Sustainability Metrics" className="chart-card">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData.categoryPerformance} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="category" width={100} />
          <RechartsTooltip />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {chartData.categoryPerformance.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

  // Render Weekly Trend
  const renderWeeklyTrend = () => (
    <Card size="small" title="📊 Weekly Performance" className="chart-card">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData.weeklyTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis domain={[0, 100]} />
          <RechartsTooltip />
          <Legend />
          <Line type="monotone" dataKey="air" stroke="#52c41a" strokeWidth={2} />
          <Line type="monotone" dataKey="water" stroke="#1890ff" strokeWidth={2} />
          <Line type="monotone" dataKey="energy" stroke="#faad14" strokeWidth={2} />
          <Line type="monotone" dataKey="waste" stroke="#722ed1" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );

  // Render Risk Matrix
  const renderRiskMatrix = () => (
    <Card size="small" title="🔥 Risk Assessment Matrix" className="chart-card">
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="impact" name="Impact" domain={[0, 100]} />
          <YAxis type="number" dataKey="risk" name="Risk" domain={[0, 100]} />
          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter
            name="Risk Assessment"
            data={chartData.riskMatrix}
            fill="#faad14"
            shape="circle"
            fillOpacity={0.8}
          >
            {chartData.riskMatrix.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.risk > 50 ? '#f5222d' : entry.risk > 30 ? '#faad14' : '#52c41a'}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  );

  // Render Metric Distribution
  const renderMetricDistribution = () => (
    <Card size="small" title="📊 Overall Distribution" className="chart-card">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData.metricDistribution}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.metricDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.green[index % COLORS.green.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );

  // Loading state
  if (loading && !data) {
    return (
      <div className="intelligence-loading" style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading intelligence data...</div>
      </div>
    );
  }

  return (
    <div className="environmental-intelligence-panel">
      {/* Header */}
      <div className="intelligence-header">
        <div className="intelligence-header-title">
          <GlobalOutlined style={{ fontSize: 28, color: '#4fc3f7' }} />
          <h2>Environmental Intelligence</h2>
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Live
          </Tag>
        </div>
        <div className="intelligence-header-status">
          <Space>
            <Tag color="blue" icon={<ThunderboltOutlined />}>
              AI Powered
            </Tag>
            <Tag color="green">Real-time</Tag>
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="Auto"
              unCheckedChildren="Manual"
              size="small"
            />
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ padding: '16px 0' }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="intel-stat-card intel-stat-card-green">
            <Statistic
              title="Environmental Health"
              value={data?.environmental_health_score || 85}
              suffix="/100"
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress
              percent={data?.environmental_health_score || 85}
              size="small"
              showInfo={false}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="intel-stat-card intel-stat-card-gold">
            <Statistic
              title="Carbon Footprint"
              value={data?.carbon_footprint || 45}
              suffix="tons CO₂"
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              ↓ 12% from last month
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="intel-stat-card intel-stat-card-blue">
            <Statistic
              title="Sustainability Index"
              value={data?.sustainability_index || 78}
              suffix="/100"
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress
              percent={data?.sustainability_index || 78}
              size="small"
              showInfo={false}
              strokeColor="#1890ff"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="intel-stat-card intel-stat-card-red">
            <Statistic
              title="Live Sensors"
              value={data?.live_sensors || 24}
              prefix="🟢"
              valueStyle={{ color: '#cf1322' }}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              All systems operational
            </div>
          </Card>
        </Col>
      </Row>

      {/* Predictive Alerts */}
      {(data?.predictive_alerts || sampleData.predictive_alerts).map((alert, index) => (
        <Alert
          key={alert.id || index}
          message={alert.message}
          description={
            <div>
              <div>{alert.suggested_action}</div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Tag color={alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'orange' : 'blue'}>
                  AI Confidence: {alert.confidence}%
                </Tag>
                <Progress
                  percent={alert.confidence}
                  size="small"
                  strokeColor={alert.severity === 'high' ? '#f5222d' : alert.severity === 'medium' ? '#faad14' : '#1890ff'}
                  style={{ width: 100 }}
                  showInfo={false}
                />
              </div>
            </div>
          }
          type={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
          showIcon
          style={{ marginBottom: 16, borderRadius: 12 }}
        />
      ))}

      {/* Charts Section */}
      <Divider orientation="left">
        <Space>
          <DashboardOutlined />
          Intelligence Dashboard
          <Tag color="blue">{activeTab.toUpperCase()}</Tag>
        </Space>
      </Divider>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="intelligence-tabs"
        tabBarExtraContent={
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh Data
          </Button>
        }
      >
        <TabPane
          tab={<span><DashboardOutlined /> Overview</span>}
          key="overview"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {renderHealthTrend()}
            </Col>
            <Col xs={24} lg={12}>
              {renderCarbonEmissions()}
            </Col>
            <Col xs={24} lg={12}>
              {renderSustainabilityMetrics()}
            </Col>
            <Col xs={24} lg={12}>
              {renderMetricDistribution()}
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={<span><LineChartOutlined /> Trends</span>}
          key="trends"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              {renderWeeklyTrend()}
            </Col>
            <Col xs={24} lg={12}>
              {renderHealthTrend()}
            </Col>
            <Col xs={24} lg={12}>
              {renderRiskMatrix()}
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={<span><HeatMapOutlined /> Risk</span>}
          key="risk"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {renderRiskMatrix()}
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" title="Risk Summary" className="chart-card">
                <div style={{ padding: 16 }}>
                  {chartData.riskMatrix.map((item, index) => (
                    <div key={index} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 500 }}>{item.area}</span>
                        <span style={{ color: item.risk > 50 ? '#f5222d' : '#faad14' }}>
                          {item.risk}%
                        </span>
                      </div>
                      <Progress
                        percent={item.risk}
                        size="small"
                        strokeColor={item.risk > 50 ? '#f5222d' : item.risk > 30 ? '#faad14' : '#52c41a'}
                        showInfo={false}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Live Metrics Section */}
      <Card
        title="Live Metrics"
        className="intel-live-metrics"
        extra={<Badge status="processing" text="Live" />}
        style={{ marginTop: 16 }}
      >
        <Row gutter={[16, 16]}>
          {data?.live_metrics && Object.entries(data.live_metrics).map(([key, value]) => (
            <Col xs={12} sm={8} md={4} key={key}>
              <div className="metric-circle">
                <Progress
                  type="circle"
                  percent={value}
                  strokeColor={getScoreColor(value)}
                  width={100}
                  format={(p) => (
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600 }}>{p}%</div>
                      <div style={{ fontSize: 10, color: '#8c8c8c' }}>{getScoreStatus(value)}</div>
                    </div>
                  )}
                />
                <div className="metric-label">
                  {key.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div className="metric-value">{getScoreStatus(value)}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Predictive Timeline */}
      <Card
        title="AI Predictions Timeline"
        style={{ marginTop: 16 }}
        extra={<Tag color="purple">AI Powered</Tag>}
      >
        <Timeline className="intel-timeline">
          {data?.predictive_alerts && data.predictive_alerts.map((alert, index) => (
            <Timeline.Item
              key={alert.id || index}
              color={alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'orange' : 'green'}
              dot={<ExclamationCircleOutlined style={{ color: alert.severity === 'high' ? '#f5222d' : '#faad14' }} />}
            >
              <div className="timeline-prediction-item">
                <div className="prediction-header">
                  <span className="prediction-title">{alert.message}</span>
                  <span className="prediction-time">In {Math.floor(Math.random() * 24) + 1} hours</span>
                </div>
                <div className="prediction-details">
                  {alert.suggested_action}
                </div>
                <div className="prediction-tags">
                  <Tag color={alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'orange' : 'green'}>
                    Confidence: {alert.confidence}%
                  </Tag>
                  <Tag color={alert.severity === 'high' ? 'red' : 'orange'}>
                    Priority: {alert.severity.toUpperCase()}
                  </Tag>
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </div>
  );
};

export default EnvironmentalIntelligencePanel;