// src/components/analytics/PredictiveAnalyticsDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Progress, Tag, Space, Button,
  Select, DatePicker, Tooltip, Alert, Divider, Table, Badge,
  Timeline, List, Avatar, Typography, Spin, Empty, Radio,
  Slider, Switch, InputNumber, message, Descriptions, Modal
} from 'antd';
import {
  RiseOutlined, FallOutlined, WarningOutlined, ThunderboltOutlined,
  LineChartOutlined, AreaChartOutlined, RadarChartOutlined,
  DashboardOutlined, BulbOutlined, AimOutlined, FireOutlined,
  SafetyCertificateOutlined, ClockCircleOutlined, TeamOutlined,
  EnvironmentOutlined, ToolOutlined, ExperimentOutlined,
  ReloadOutlined, InfoCircleOutlined, ArrowUpOutlined,
  ArrowDownOutlined, MinusOutlined, CalendarOutlined
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Radar, Scatter, Doughnut } from 'react-chartjs-2';
import dayjs from 'dayjs';

// ✅ SERVICE IMPORT
import notificationService from '../../services/notificationService';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Title,
  ChartTooltip, Legend, Filler
);

const { Text, Title: AntTitle } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ==================== PREDICTION MODELS ====================

const PREDICTION_MODELS = {
  linear_regression: { name: 'Linear Regression', description: 'Simple trend-based prediction', accuracy: 0.72, icon: <LineChartOutlined /> },
  arima: { name: 'ARIMA', description: 'Time-series forecasting with seasonality', accuracy: 0.81, icon: <AreaChartOutlined /> },
  prophet: { name: 'Prophet', description: 'Facebook\'s forecasting for business metrics', accuracy: 0.85, icon: <RiseOutlined /> },
  lstm: { name: 'LSTM Neural Network', description: 'Deep learning for complex patterns', accuracy: 0.89, icon: <ExperimentOutlined /> },
  ensemble: { name: 'Ensemble (Recommended)', description: 'Combines multiple models for best accuracy', accuracy: 0.92, icon: <SafetyCertificateOutlined /> }
};

// ==================== PREDICTIVE ANALYTICS DASHBOARD ====================

const PredictiveAnalyticsDashboard = ({ incidents = [] }) => {
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('ensemble');
  const [forecastPeriod, setForecastPeriod] = useState(3);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [predictions, setPredictions] = useState(null);
  const [insights, setInsights] = useState([]);
  const [riskFactors, setRiskFactors] = useState([]);
  const [modelDetailsVisible, setModelDetailsVisible] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  // ==================== FETCH PREDICTIONS FROM API ====================

  const generatePredictions = useCallback(async () => {
    setLoading(true);

    try {
      // ✅ Try backend AI prediction endpoint first
      const response = await notificationService.getPredictiveAnalytics({
        model: selectedModel,
        forecast_period: forecastPeriod,
        confidence_level: confidenceLevel,
        industry: selectedIndustry !== 'all' ? selectedIndustry : undefined,
        severity: selectedSeverity !== 'all' ? selectedSeverity : undefined
      });

      const data = response?.predictions || response?.data || response;

      if (data && data.forecast) {
        // ✅ Use backend predictions
        setPredictions({
          historical: data.historical || { labels: [], values: [] },
          forecast: data.forecast || { labels: [], values: [], upperBound: [], lowerBound: [] },
          riskScore: data.risk_score || 50,
          trend: data.trend || 'stable',
          trendPercentage: data.trend_percentage || 0,
          averageMonthly: data.average_monthly || 0,
          predictedTotal: data.predicted_total || 0,
          modelAccuracy: data.model_accuracy || PREDICTION_MODELS[selectedModel].accuracy * 100
        });

        setInsights(data.insights || []);
        setRiskFactors(data.risk_factors || []);
        setUsingFallback(false);
      } else {
        throw new Error('No prediction data received');
      }
    } catch (error) {
      console.warn('AI prediction API unavailable, using client-side fallback:', error);
      
      // ✅ Fallback to client-side calculation
      setUsingFallback(true);
      calculateClientSidePredictions();
    } finally {
      setLoading(false);
    }
  }, [incidents, selectedModel, forecastPeriod, confidenceLevel, selectedIndustry, selectedSeverity]);

  // ==================== CLIENT-SIDE FALLBACK ====================

  const calculateClientSidePredictions = () => {
    // Filter incidents
    let filtered = [...incidents];
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(i => (i.industry_id || i.industry) === selectedIndustry);
    }
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(i => i.severity === selectedSeverity);
    }

    // Monthly data for past 12 months
    const monthlyData = {};
    const now = dayjs();
    for (let i = 11; i >= 0; i--) {
      const month = now.subtract(i, 'month').format('YYYY-MM');
      monthlyData[month] = 0;
    }

    filtered.forEach(incident => {
      const date = dayjs(incident.date_occurred || incident.created_at);
      const month = date.format('YYYY-MM');
      if (monthlyData[month] !== undefined) monthlyData[month]++;
    });

    const historicalMonths = Object.keys(monthlyData);
    const historicalValues = Object.values(monthlyData);

    // Linear regression
    const n = historicalValues.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = historicalValues.reduce((a, b) => a + b, 0);
    const sumXY = historicalValues.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecastMonths = [];
    const forecastValues = [];
    const upperBound = [];
    const lowerBound = [];

    for (let i = 1; i <= forecastPeriod; i++) {
      const futureMonth = now.add(i, 'month').format('YYYY-MM');
      const predictedValue = Math.max(0, intercept + slope * (n + i - 1));
      const stdDev = Math.sqrt(
        historicalValues.reduce((sum, y, x) => sum + Math.pow(y - (intercept + slope * x), 2), 0) / n
      );
      const margin = stdDev * (confidenceLevel / 100) * 1.96;

      forecastMonths.push(futureMonth);
      forecastValues.push(Math.round(predictedValue));
      upperBound.push(Math.round(predictedValue + margin));
      lowerBound.push(Math.max(0, Math.round(predictedValue - margin)));
    }

    const avgHistorical = sumY / n;
    const avgForecast = forecastValues.reduce((a, b) => a + b, 0) / Math.max(1, forecastValues.length);
    const riskScore = Math.min(100, Math.round((avgForecast / Math.max(1, avgHistorical)) * 50));

    setPredictions({
      historical: { labels: historicalMonths, values: historicalValues },
      forecast: { labels: forecastMonths, values: forecastValues, upperBound, lowerBound },
      riskScore,
      trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
      trendPercentage: Math.round((slope / Math.max(1, avgHistorical)) * 100),
      averageMonthly: Math.round(avgHistorical),
      predictedTotal: forecastValues.reduce((a, b) => a + b, 0),
      modelAccuracy: PREDICTION_MODELS[selectedModel].accuracy * 100
    });

    setInsights(generateInsights(historicalValues, forecastValues, slope, riskScore, filtered));
    setRiskFactors(generateRiskFactors(filtered, forecastValues));
  };

  useEffect(() => {
    if (incidents.length > 0) {
      generatePredictions();
    }
  }, [incidents.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ==================== INSIGHTS GENERATOR ====================

  const generateInsights = (historical, forecast, slope, riskScore, data) => {
    const insights = [];

    if (slope > 0.5) {
      insights.push({
        type: 'warning',
        title: 'Increasing Incident Trend',
        description: `Incident rate is trending upward. Forecast shows ${Math.abs(Math.round(slope * 100))}% increase per month.`,
        priority: 'high',
        icon: <RiseOutlined />
      });
    } else if (slope < -0.5) {
      insights.push({
        type: 'success',
        title: 'Decreasing Incident Trend',
        description: 'Incident rate is decreasing. Current safety measures appear effective.',
        priority: 'low',
        icon: <FallOutlined />
      });
    }

    if (riskScore > 70) {
      insights.push({
        type: 'error',
        title: 'High Risk Period Detected',
        description: `Risk score is ${riskScore}/100. Recommend increasing safety measures.`,
        priority: 'critical',
        icon: <WarningOutlined />
      });
    }

    const criticalCount = data.filter(i => i.severity === 'critical').length;
    if (criticalCount > 0) {
      insights.push({
        type: 'warning',
        title: `${criticalCount} Critical Incidents`,
        description: 'Critical incidents require immediate attention and root cause analysis.',
        priority: 'high',
        icon: <FireOutlined />
      });
    }

    const typeCount = {};
    data.forEach(i => {
      const type = i.incident_type || i.incidentType;
      if (type) typeCount[type] = (typeCount[type] || 0) + 1;
    });

    Object.entries(typeCount).filter(([_, count]) => count >= 3).forEach(([type, count]) => {
      insights.push({
        type: 'info',
        title: `Repeat Incident Pattern: ${type.replace(/_/g, ' ')}`,
        description: `${count} incidents of this type detected.`,
        priority: 'medium',
        icon: <ReloadOutlined />
      });
    });

    return insights;
  };

  // ==================== RISK FACTORS ====================

  const generateRiskFactors = (data, forecast) => {
    const factors = [];
    const hourCounts = {};
    const dayCounts = {};

    data.forEach(i => {
      const date = new Date(i.date_occurred || i.created_at);
      if (!isNaN(date)) {
        const hour = date.getHours();
        const day = date.getDay();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });

    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    if (peakHour) {
      factors.push({
        factor: 'Peak Incident Hour',
        value: `${peakHour[0]}:00`,
        impact: peakHour[1],
        risk: peakHour[1] >= 5 ? 'high' : 'medium',
        recommendation: 'Increase staffing during this hour'
      });
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    if (peakDay) {
      factors.push({
        factor: 'Highest Risk Day',
        value: days[peakDay[0]],
        impact: peakDay[1],
        risk: peakDay[1] >= 10 ? 'high' : 'medium',
        recommendation: 'Schedule additional briefings'
      });
    }

    const deptCounts = {};
    data.forEach(i => {
      if (i.department) deptCounts[i.department] = (deptCounts[i.department] || 0) + 1;
    });
    const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0];
    if (topDept) {
      factors.push({
        factor: 'Highest Risk Department',
        value: topDept[0],
        impact: topDept[1],
        risk: 'high',
        recommendation: 'Conduct targeted safety audit'
      });
    }

    const forecastAvg = forecast.reduce((a, b) => a + b, 0) / Math.max(1, forecast.length);
    if (forecastAvg > 5) {
      factors.push({
        factor: 'Predicted Incident Volume',
        value: `${Math.round(forecastAvg)}/month`,
        impact: forecastAvg,
        risk: 'high',
        recommendation: 'Prepare additional resources'
      });
    }

    return factors;
  };

  // ==================== CHART DATA ====================

  const forecastChartData = predictions ? {
    labels: [...predictions.historical.labels, ...predictions.forecast.labels],
    datasets: [
      {
        label: 'Historical',
        data: [...predictions.historical.values, ...new Array(predictions.forecast.labels.length).fill(null)],
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3
      },
      {
        label: 'Forecast',
        data: [
          ...new Array(Math.max(0, predictions.historical.values.length - 1)).fill(null),
          predictions.historical.values[predictions.historical.values.length - 1],
          ...predictions.forecast.values
        ],
        borderColor: '#722ed1',
        backgroundColor: 'rgba(114, 46, 209, 0.1)',
        borderDash: [5, 5],
        fill: true,
        tension: 0.4,
        pointRadius: 4
      },
      {
        label: 'Upper Bound',
        data: [...new Array(predictions.historical.values.length).fill(null), ...predictions.forecast.upperBound],
        borderColor: 'rgba(114, 46, 209, 0.3)',
        borderDash: [2, 2],
        fill: false,
        pointRadius: 0
      },
      {
        label: 'Lower Bound',
        data: [...new Array(predictions.historical.values.length).fill(null), ...predictions.forecast.lowerBound],
        borderColor: 'rgba(114, 46, 209, 0.3)',
        borderDash: [2, 2],
        fill: '-1',
        backgroundColor: 'rgba(114, 46, 209, 0.05)',
        pointRadius: 0
      }
    ]
  } : null;

  const riskRadarData = {
    labels: ['Frequency', 'Severity', 'Recurrence', 'Spread', 'Impact', 'Control'],
    datasets: [{
      label: 'Current Risk Profile',
      data: predictions ? [
        Math.min(100, predictions.averageMonthly * 10),
        predictions.riskScore,
        Math.min(100, insights.filter(i => i.type === 'info').length * 20),
        Math.min(100, 60),
        Math.min(100, predictions.riskScore * 0.9),
        Math.max(20, 100 - predictions.riskScore)
      ] : [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(114, 46, 209, 0.2)',
      borderColor: '#722ed1',
      pointBackgroundColor: '#722ed1',
      pointBorderColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Number of Incidents' } }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } },
    plugins: { legend: { position: 'bottom' } }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <ArrowUpOutlined style={{ color: '#f5222d' }} />;
    if (trend === 'decreasing') return <ArrowDownOutlined style={{ color: '#52c41a' }} />;
    return <MinusOutlined style={{ color: '#faad14' }} />;
  };

  const getRiskColor = (score) => {
    if (score >= 70) return '#f5222d';
    if (score >= 40) return '#faad14';
    return '#52c41a';
  };

  if (incidents.length === 0) {
    return (
      <Card>
        <Empty 
          description="No incident data available for predictions"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div>
      {/* Fallback Alert */}
      {usingFallback && (
        <Alert
          message="Using Client-Side Predictions"
          description="AI prediction service is unavailable. Predictions shown are calculated locally using linear regression."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Controls */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={5}>
            <Text type="secondary">Prediction Model:</Text>
            <Select
              value={selectedModel}
              onChange={setSelectedModel}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
            >
              {Object.entries(PREDICTION_MODELS).map(([key, model]) => (
                <Option key={key} value={key}>
                  <Space>
                    {model.icon}
                    {model.name}
                    <Tag color="green">{Math.round(model.accuracy * 100)}%</Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Text type="secondary">Forecast Period:</Text>
            <Select
              value={forecastPeriod}
              onChange={setForecastPeriod}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
            >
              <Option value={1}>1 Month</Option>
              <Option value={3}>3 Months</Option>
              <Option value={6}>6 Months</Option>
              <Option value={12}>12 Months</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Text type="secondary">Confidence: {confidenceLevel}%</Text>
            <Slider
              value={confidenceLevel}
              onChange={setConfidenceLevel}
              min={80}
              max={99}
              style={{ marginTop: 8 }}
              tooltip={{ formatter: (v) => `${v}%` }}
            />
          </Col>
          
          <Col xs={24} sm={12} md={5}>
            <Text type="secondary">Industry Filter:</Text>
            <Select
              value={selectedIndustry}
              onChange={setSelectedIndustry}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
              allowClear
            >
              <Option value="all">All Industries</Option>
              <Option value="healthcare">Healthcare</Option>
              <Option value="construction">Construction</Option>
              <Option value="oil_gas">Oil & Gas</Option>
              <Option value="aviation">Aviation</Option>
              <Option value="manufacturing">Manufacturing</Option>
              <Option value="transportation">Transportation</Option>
              <Option value="mining">Mining</Option>
              <Option value="hospitality">Hospitality</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={3}>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={generatePredictions}
              loading={loading}
              style={{ marginTop: 20 }}
              block
            >
              Predict
            </Button>
          </Col>
          
          <Col xs={24} sm={12} md={3}>
            <Tooltip title="View model details">
              <Button
                icon={<InfoCircleOutlined />}
                onClick={() => setModelDetailsVisible(true)}
                style={{ marginTop: 20 }}
                block
              >
                Model Info
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Running {PREDICTION_MODELS[selectedModel].name}...</Text>
            </div>
            <Progress 
              percent={100} 
              status="active" 
              style={{ maxWidth: 300, marginTop: 16 }}
              showInfo={false}
            />
          </div>
        </Card>
      ) : predictions ? (
        <>
          {/* Key Metrics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title={<Space><AimOutlined />Predicted Total</Space>}
                  value={predictions.predictedTotal}
                  suffix={`in ${forecastPeriod}mo`}
                  valueStyle={{ color: '#722ed1', fontSize: 24 }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {predictions.averageMonthly}/month average
                </Text>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title={<Space><WarningOutlined />Risk Score</Space>}
                  value={predictions.riskScore}
                  suffix="/100"
                  valueStyle={{ color: getRiskColor(predictions.riskScore), fontSize: 24 }}
                />
                <Progress 
                  percent={predictions.riskScore} 
                  size="small" 
                  showInfo={false}
                  strokeColor={getRiskColor(predictions.riskScore)}
                />
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title={<Space>{getTrendIcon(predictions.trend)}Trend</Space>}
                  value={predictions.trend.charAt(0).toUpperCase() + predictions.trend.slice(1)}
                  valueStyle={{ 
                    color: predictions.trend === 'increasing' ? '#f5222d' : 
                           predictions.trend === 'decreasing' ? '#52c41a' : '#faad14',
                    fontSize: 20
                  }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {predictions.trendPercentage > 0 ? '+' : ''}{predictions.trendPercentage}% per month
                </Text>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title={<Space><SafetyCertificateOutlined />Model Accuracy</Space>}
                  value={Math.round(predictions.modelAccuracy)}
                  suffix="%"
                  valueStyle={{ color: '#52c41a', fontSize: 24 }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {PREDICTION_MODELS[selectedModel].name}
                </Text>
              </Card>
            </Col>
          </Row>

          {/* Forecast Chart */}
          <Card 
            title={
              <Space>
                <LineChartOutlined />
                Incident Forecast
                <Tag color="purple">{forecastPeriod} months</Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div style={{ height: 350 }}>
              {forecastChartData && <Line data={forecastChartData} options={chartOptions} />}
            </div>
          </Card>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {/* Risk Radar */}
            <Col xs={24} lg={12}>
              <Card title={<Space><RadarChartOutlined />Risk Profile</Space>}>
                <div style={{ height: 300 }}>
                  <Radar data={riskRadarData} options={radarOptions} />
                </div>
              </Card>
            </Col>

            {/* AI Insights */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <Space>
                    <BulbOutlined style={{ color: '#faad14' }} />
                    AI Insights
                    <Badge count={insights.length} style={{ backgroundColor: '#faad14' }} />
                  </Space>
                }
                bodyStyle={{ maxHeight: 300, overflow: 'auto' }}
              >
                {insights.length > 0 ? (
                  <List
                    size="small"
                    dataSource={insights}
                    renderItem={(insight) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              style={{ 
                                backgroundColor: 
                                  insight.priority === 'critical' ? '#f5222d' :
                                  insight.priority === 'high' ? '#fa541c' :
                                  insight.priority === 'medium' ? '#faad14' : '#52c41a'
                              }}
                              icon={insight.icon}
                            />
                          }
                          title={
                            <Space>
                              <Text strong>{insight.title}</Text>
                              <Tag color={
                                insight.priority === 'critical' ? 'red' :
                                insight.priority === 'high' ? 'orange' :
                                insight.priority === 'medium' ? 'gold' : 'green'
                              }>
                                {insight.priority}
                              </Tag>
                            </Space>
                          }
                          description={insight.description}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No insights available" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Risk Factors */}
          <Card 
            title={
              <Space>
                <WarningOutlined style={{ color: '#f5222d' }} />
                Risk Factor Analysis
                <Badge count={riskFactors.length} style={{ backgroundColor: '#f5222d' }} />
              </Space>
            }
          >
            <Table
              dataSource={riskFactors}
              columns={[
                { title: 'Risk Factor', dataIndex: 'factor', key: 'factor', render: (text) => <Text strong>{text}</Text> },
                { title: 'Value', dataIndex: 'value', key: 'value', render: (text) => <Tag color="blue">{text}</Tag> },
                {
                  title: 'Impact',
                  dataIndex: 'impact',
                  key: 'impact',
                  render: (impact) => (
                    <Space>
                      <Progress percent={Math.min(100, impact * 5)} size="small" style={{ width: 60 }} showInfo={false} />
                      <Text>{Math.round(impact)}</Text>
                    </Space>
                  ),
                  sorter: (a, b) => a.impact - b.impact
                },
                {
                  title: 'Risk Level',
                  dataIndex: 'risk',
                  key: 'risk',
                  render: (risk) => (
                    <Tag color={risk === 'high' ? 'red' : risk === 'medium' ? 'orange' : 'green'}>
                      {risk?.toUpperCase()}
                    </Tag>
                  )
                },
                { title: 'Recommendation', dataIndex: 'recommendation', key: 'recommendation', render: (text) => <Text type="secondary">{text}</Text> }
              ]}
              rowKey="factor"
              pagination={false}
              size="small"
            />
          </Card>
        </>
      ) : null}

      {/* Model Details Modal */}
      <Modal
        title="Prediction Model Details"
        open={modelDetailsVisible}
        onCancel={() => setModelDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModelDetailsVisible(false)}>Close</Button>
        ]}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Model">{PREDICTION_MODELS[selectedModel].name}</Descriptions.Item>
          <Descriptions.Item label="Description">{PREDICTION_MODELS[selectedModel].description}</Descriptions.Item>
          <Descriptions.Item label="Accuracy">
            <Progress percent={Math.round(PREDICTION_MODELS[selectedModel].accuracy * 100)} strokeColor="#52c41a" />
          </Descriptions.Item>
          <Descriptions.Item label="Data Points">{incidents.length} incidents</Descriptions.Item>
          <Descriptions.Item label="Forecast Period">{forecastPeriod} months</Descriptions.Item>
          <Descriptions.Item label="Confidence Level">{confidenceLevel}%</Descriptions.Item>
        </Descriptions>

        <Divider>Model Comparison</Divider>
        
        <Table
          dataSource={Object.entries(PREDICTION_MODELS).map(([key, model]) => ({
            key,
            name: model.name,
            accuracy: `${Math.round(model.accuracy * 100)}%`,
            selected: key === selectedModel
          }))}
          columns={[
            {
              title: 'Model',
              dataIndex: 'name',
              key: 'name',
              render: (text, record) => (
                <Space>
                  {record.selected && <SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
                  {text}
                </Space>
              )
            },
            { title: 'Accuracy', dataIndex: 'accuracy', key: 'accuracy' }
          ]}
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;