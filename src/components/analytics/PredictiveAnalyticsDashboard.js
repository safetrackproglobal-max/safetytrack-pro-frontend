// src/components/analytics/PredictiveAnalyticsDashboard.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Row, Col, Statistic, Progress, Tag, Space, Button,
  Select, Tooltip, Alert, Divider, Table, Badge,
  Timeline, List, Avatar, Typography, Spin, Empty, Input, 
  Slider, message, Modal
} from 'antd';
import {
  RiseOutlined, FallOutlined, WarningOutlined, ThunderboltOutlined,
  LineChartOutlined, AreaChartOutlined, RadarChartOutlined,
  BulbOutlined, AimOutlined,
  SafetyCertificateOutlined, ReloadOutlined, InfoCircleOutlined,
  ArrowUpOutlined, ArrowDownOutlined, MinusOutlined,
  RobotOutlined, ExperimentOutlined, AlertOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, RadialLinearScale,
  Title, Tooltip as ChartTooltip, Legend, Filler
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';
import dayjs from 'dayjs';

import notificationService from '../../services/notificationService';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Title,
  ChartTooltip, Legend, Filler
);

const { Text } = Typography;
const { Option } = Select;

// ==================== MODEL CATALOG ====================

const PREDICTION_MODELS = {
  linear_regression: { name: 'Linear Regression', description: 'Simple trend-based prediction', icon: <LineChartOutlined /> },
  arima:             { name: 'ARIMA',             description: 'Time-series with seasonality', icon: <AreaChartOutlined /> },
  prophet:           { name: 'Prophet',           description: 'Business-metric forecasting', icon: <RiseOutlined /> },
  lstm:              { name: 'LSTM Neural Net',   description: 'Deep learning for complex patterns', icon: <ExperimentOutlined /> },
  ensemble:          { name: 'Ensemble (Recommended)', description: 'Combines multiple models', icon: <SafetyCertificateOutlined /> },
  ai_auto:           { name: 'AI Auto (Gemini)', description: 'AI picks method + reasons about data', icon: <RobotOutlined /> }
};

// ==================== COMPONENT ====================

const PredictiveAnalyticsDashboard = ({ incidents = [] }) => {
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('ai_auto');
  const [modelPreference, setModelPreference] = useState('auto');
  const [forecastPeriod, setForecastPeriod] = useState(3);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [predictions, setPredictions] = useState(null);
  const [insights, setInsights] = useState([]);
  const [riskFactors, setRiskFactors] = useState([]);
  const [narrative, setNarrative] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [modelRecommendation, setModelRecommendation] = useState(null);
  const [scenarioVisible, setScenarioVisible] = useState(false);
  const [scenarioInput, setScenarioInput] = useState('');
  const [scenarioResult, setScenarioResult] = useState(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [aiStatus, setAiStatus] = useState({ available: false });

  // ==================== FILTER / AI OPTIONS ====================

  const filters = useMemo(() => ({
    model: selectedModel,
    forecast_period: forecastPeriod,
    confidence_level: confidenceLevel,
    industry: selectedIndustry !== 'all' ? selectedIndustry : undefined,
    severity: selectedSeverity !== 'all' ? selectedSeverity : undefined
  }), [selectedModel, forecastPeriod, confidenceLevel, selectedIndustry, selectedSeverity]);

  const aiOptions = useMemo(() => ({
    model_preference: modelPreference,
    language: 'English',
    depth: 'comprehensive',
    temperature: 0.6
  }), [modelPreference]);

  // ==================== AI STATUS ====================

  useEffect(() => {
    (async () => {
      try {
        const s = await notificationService.getAIStatus();
        setAiStatus(s || { available: false });
      } catch {
        setAiStatus({ available: false });
      }
    })();
  }, []);

  // ==================== FALLBACK HELPERS ====================

  const generateFallbackInsights = (values, futureValues, slope, riskScore) => {
    const out = [{
      type: 'warning',
      title: 'Local Estimate (No AI)',
      description: 'The AI prediction service was unavailable. Insights below are rule-based heuristics.',
      priority: 'medium',
      icon: <InfoCircleOutlined />
    }];
    if (slope > 0.5) {
      out.push({
        type: 'warning',
        title: 'Rising Trend (heuristic)',
        description: `Average slope +${slope.toFixed(2)} incidents/month.`,
        priority: 'high',
        icon: <RiseOutlined />
      });
    }
    if (riskScore > 70) {
      out.push({
        type: 'error',
        title: 'High Risk (heuristic)',
        description: `Risk score ${riskScore}/100.`,
        priority: 'critical',
        icon: <WarningOutlined />
      });
    }
    return out;
  };

  const generateFallbackRiskFactors = (data) => {
    const hourCounts = {};
    const dayCounts = {};
    const deptCounts = {};
    data.forEach(i => {
      const d = new Date(i.date_occurred || i.created_at);
      if (!isNaN(d)) {
        hourCounts[d.getHours()] = (hourCounts[d.getHours()] || 0) + 1;
        dayCounts[d.getDay()] = (dayCounts[d.getDay()] || 0) + 1;
      }
      if (i.department) deptCounts[i.department] = (deptCounts[i.department] || 0) + 1;
    });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const out = [];
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    if (peakHour) {
      out.push({
        factor: 'Peak Hour',
        value: `${peakHour[0]}:00`,
        impact: peakHour[1],
        risk: peakHour[1] >= 5 ? 'high' : 'medium',
        recommendation: 'Increase staffing'
      });
    }
    const peakDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    if (peakDay) {
      out.push({
        factor: 'Peak Day',
        value: days[peakDay[0]],
        impact: peakDay[1],
        risk: peakDay[1] >= 10 ? 'high' : 'medium',
        recommendation: 'Schedule briefings'
      });
    }
    const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0];
    if (topDept) {
      out.push({
        factor: 'Top Department',
        value: topDept[0],
        impact: topDept[1],
        risk: 'high',
        recommendation: 'Targeted audit'
      });
    }
    return out;
  };

  // ==================== CLIENT-SIDE FALLBACK ====================

  const calculateClientSidePredictions = useCallback(() => {
    let filtered = [...incidents];
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(i => (i.industry_id || i.industry) === selectedIndustry);
    }
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(i => i.severity === selectedSeverity);
    }

    const monthlyData = {};
    const now = dayjs();
    for (let i = 11; i >= 0; i--) {
      const month = now.subtract(i, 'month').format('YYYY-MM');
      monthlyData[month] = 0;
    }

    filtered.forEach(incident => {
      const d = dayjs(incident.date_occurred || incident.created_at);
      const month = d.format('YYYY-MM');
      if (monthlyData[month] !== undefined) monthlyData[month]++;
    });

    const labels = Object.keys(monthlyData);
    const values = Object.values(monthlyData);
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    const denominator = n * sumX2 - sumX * sumX;
    const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
    const intercept = (sumY - slope * sumX) / n;

    const futureLabels = [];
    const futureValues = [];
    const upper = [];
    const lower = [];
    for (let i = 1; i <= forecastPeriod; i++) {
      const m = now.add(i, 'month').format('YYYY-MM');
      const predicted = Math.max(0, intercept + slope * (n + i - 1));
      const stdDev = Math.sqrt(
        values.reduce((sum, y, x) => sum + Math.pow(y - (intercept + slope * x), 2), 0) / n
      );
      const margin = stdDev * (confidenceLevel / 100) * 1.96;
      futureLabels.push(m);
      futureValues.push(Math.round(predicted));
      upper.push(Math.round(predicted + margin));
      lower.push(Math.max(0, Math.round(predicted - margin)));
    }

    const avgHist = sumY / n;
    const avgFc = futureValues.reduce((a, b) => a + b, 0) / Math.max(1, futureValues.length);
    const riskScore = Math.min(100, Math.round((avgFc / Math.max(1, avgHist)) * 50));

    setPredictions({
      historical: { labels, values },
      forecast: { labels: futureLabels, values: futureValues, upperBound: upper, lowerBound: lower },
      riskScore,
      trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
      trendPercentage: Math.round((slope / Math.max(1, avgHist)) * 100),
      averageMonthly: Math.round(avgHist),
      predictedTotal: futureValues.reduce((a, b) => a + b, 0),
      modelAccuracy: null,
      modelUsed: 'Local Estimate (linear regression)',
      methodology: { frameworksApplied: ['Linear Regression'] }
    });

    setInsights(generateFallbackInsights(values, futureValues, slope, riskScore));
    setRiskFactors(generateFallbackRiskFactors(filtered));
    setNarrative({
      summary: 'Local fallback estimate — no AI model available. Numbers are rough.',
      keyRisks: [],
      recommendations: []
    });
  }, [incidents, selectedIndustry, selectedSeverity, forecastPeriod, confidenceLevel]);

  // ==================== MAIN: FETCH PREDICTIONS ====================

  const generatePredictions = useCallback(async () => {
    setLoading(true);
    setUsingFallback(false);
    setNarrative(null);
    setAnomalies([]);

    try {
      const aiResp = await notificationService.getAIPrediction(filters, aiOptions);
      const aiData = aiResp?.analysis || aiResp?.predictions || aiResp?.data || aiResp;

      if (!aiData?.forecast) throw new Error('AI response missing forecast');

      setPredictions({
        historical: aiData.historical || { labels: [], values: [] },
        forecast: aiData.forecast,
        riskScore: aiData.risk_score ?? 50,
        trend: aiData.trend || 'stable',
        trendPercentage: aiData.trend_percentage ?? 0,
        averageMonthly: aiData.average_monthly ?? 0,
        predictedTotal: aiData.predicted_total ?? 0,
        modelAccuracy: aiData.model_accuracy,
        modelUsed: aiResp.model_info?.name || aiData.model_used || 'AI',
        methodology: aiData.methodology || null
      });

      setInsights(aiData.insights || []);
      setRiskFactors(aiData.risk_factors || []);
      setNarrative(aiData.narrative || null);
      setModelRecommendation(aiData.model_recommendation || null);

      // Fire-and-forget parallel calls
      notificationService
        .getAIAnomalies(filters, aiOptions)
        .then(r => setAnomalies(r?.analysis?.anomalies || r?.anomalies || []))
        .catch(() => setAnomalies([]));

      notificationService
        .getAIRiskNarrative(filters, aiOptions)
        .then(r => {
          const n = r?.analysis?.narrative || r?.narrative;
          if (n && !aiData.narrative) setNarrative(n);
        })
        .catch(() => {});
    } catch (error) {
      console.warn('AI prediction failed, using client fallback:', error);
      message.warning('AI service unavailable — using local estimate');
      setUsingFallback(true);
      calculateClientSidePredictions();
    } finally {
      setLoading(false);
    }
  }, [filters, aiOptions, calculateClientSidePredictions]);

  useEffect(() => {
    if (incidents.length > 0) generatePredictions();
  }, [incidents.length]); // eslint-disable-line

  // ==================== SCENARIO ====================

  const runScenario = async () => {
    if (!scenarioInput.trim()) return;
    setScenarioLoading(true);
    try {
      const resp = await notificationService.getAIScenario(
        incidents[0]?.id,
        scenarioInput,
        aiOptions
      );
      const result = resp?.analysis || resp;
      setScenarioResult(result);
    } catch (e) {
      message.error(e.message || 'Scenario analysis failed');
    } finally {
      setScenarioLoading(false);
    }
  };

  // ==================== CHART DATA ====================

  const forecastChartData = predictions ? {
    labels: [...predictions.historical.labels, ...predictions.forecast.labels],
    datasets: [
      {
        label: 'Historical',
        data: [...predictions.historical.values, ...Array(predictions.forecast.labels.length).fill(null)],
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24,144,255,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3
      },
      {
        label: 'Forecast',
        data: [
          ...Array(Math.max(0, predictions.historical.values.length - 1)).fill(null),
          predictions.historical.values[predictions.historical.values.length - 1],
          ...predictions.forecast.values
        ],
        borderColor: '#722ed1',
        backgroundColor: 'rgba(114,46,209,0.1)',
        borderDash: [5, 5],
        fill: true,
        tension: 0.4,
        pointRadius: 4
      },
      {
        label: 'Upper',
        data: [...Array(predictions.historical.values.length).fill(null), ...predictions.forecast.upperBound],
        borderColor: 'rgba(114,46,209,0.3)',
        borderDash: [2, 2],
        fill: false,
        pointRadius: 0
      },
      {
        label: 'Lower',
        data: [...Array(predictions.historical.values.length).fill(null), ...predictions.forecast.lowerBound],
        borderColor: 'rgba(114,46,209,0.3)',
        borderDash: [2, 2],
        fill: '-1',
        backgroundColor: 'rgba(114,46,209,0.05)',
        pointRadius: 0
      }
    ]
  } : null;

  const riskRadarData = {
    labels: ['Frequency', 'Severity', 'Recurrence', 'Spread', 'Impact', 'Control'],
    datasets: [{
      label: 'Risk Profile',
      data: predictions ? [
        Math.min(100, predictions.averageMonthly * 10),
        predictions.riskScore,
        Math.min(100, insights.filter(i => i.type === 'info').length * 20),
        60,
        Math.min(100, predictions.riskScore * 0.9),
        Math.max(20, 100 - predictions.riskScore)
      ] : [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(114,46,209,0.2)',
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
      y: { beginAtZero: true, title: { display: true, text: 'Incidents' } }
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

  const getRiskColor = (s) => s >= 70 ? '#f5222d' : s >= 40 ? '#faad14' : '#52c41a';

  // ==================== EMPTY STATE ====================

  if (incidents.length === 0) {
    return (
      <Card>
        <Empty description="No incident data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  // ==================== RENDER ====================

  return (
    <div>
      {usingFallback && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Local Estimate Mode (No AI)"
          description="The AI service didn't respond. Numbers below are a rough linear-regression guess — do not treat them as model-grade predictions."
        />
      )}

      {!usingFallback && predictions?.modelUsed && (
        <Alert
          type="success"
          showIcon
          icon={<RobotOutlined />}
          style={{ marginBottom: 16 }}
          message={
            <Space wrap>
              <span>AI prediction ready</span>
              <Tag color="purple">{predictions.modelUsed}</Tag>
              {predictions.modelAccuracy != null && (
                <Tag color="green">{Math.round(predictions.modelAccuracy)}% accuracy</Tag>
              )}
            </Space>
          }
          description={
            predictions.methodology?.frameworksApplied?.length ? (
              <Space wrap>
                {predictions.methodology.frameworksApplied.map(f => (
                  <Tag key={f} color="purple">{f}</Tag>
                ))}
              </Space>
            ) : null
          }
        />
      )}

      {/* Controls */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={5}>
            <Text type="secondary">Prediction Method:</Text>
            <Select
              value={selectedModel}
              onChange={setSelectedModel}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
            >
              {Object.entries(PREDICTION_MODELS).map(([k, m]) => (
                <Option key={k} value={k}>
                  <Space>{m.icon}{m.name}</Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Text type="secondary">AI Model:</Text>
            <Select
              value={modelPreference}
              onChange={setModelPreference}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
            >
              <Option value="auto">Auto</Option>
              <Option value="gemini-1.5-flash">Gemini Flash</Option>
              <Option value="gemini-1.5-pro">Gemini Pro</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={3}>
            <Text type="secondary">Horizon:</Text>
            <Select
              value={forecastPeriod}
              onChange={setForecastPeriod}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
            >
              <Option value={1}>1 mo</Option>
              <Option value={3}>3 mo</Option>
              <Option value={6}>6 mo</Option>
              <Option value={12}>12 mo</Option>
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
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Text type="secondary">Industry:</Text>
            <Select
              value={selectedIndustry}
              onChange={setSelectedIndustry}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
            >
              <Option value="all">All</Option>
              <Option value="healthcare">Healthcare</Option>
              <Option value="construction">Construction</Option>
              <Option value="oil_gas">Oil & Gas</Option>
              <Option value="aviation">Aviation</Option>
              <Option value="manufacturing">Manufacturing</Option>
              <Option value="mining">Mining</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={2}>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={generatePredictions}
              loading={loading}
              disabled={!aiStatus.available && !incidents.length}
              style={{ marginTop: 20 }}
              block
            >
              Run
            </Button>
          </Col>
          <Col xs={24} sm={12} md={2}>
            <Tooltip title="What-if scenario">
              <Button
                icon={<QuestionCircleOutlined />}
                onClick={() => setScenarioVisible(true)}
                style={{ marginTop: 20 }}
                block
              >
                What-If
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Card>

      {loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Running AI prediction ({modelPreference})...</Text>
            </div>
          </div>
        </Card>
      ) : predictions ? (
        <>
          {/* KPI Row */}
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
                  {predictions.averageMonthly}/month avg
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
                    color: predictions.trend === 'increasing' ? '#f5222d'
                      : predictions.trend === 'decreasing' ? '#52c41a'
                      : '#faad14',
                    fontSize: 20
                  }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {predictions.trendPercentage > 0 ? '+' : ''}{predictions.trendPercentage}% /mo
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title={<Space><SafetyCertificateOutlined />Accuracy</Space>}
                  value={predictions.modelAccuracy != null ? Math.round(predictions.modelAccuracy) : '—'}
                  suffix={predictions.modelAccuracy != null ? '%' : ''}
                  valueStyle={{ color: '#52c41a', fontSize: 24 }}
                />
                <Text type="secondary" style={{ fontSize: 11 }}>{predictions.modelUsed}</Text>
              </Card>
            </Col>
          </Row>

          {/* AI Narrative + Model Recommendation */}
          {(narrative || modelRecommendation) && (
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              {narrative && (
                <Col xs={24} lg={16}>
                  <Card
                    size="small"
                    title={<Space><RobotOutlined style={{ color: '#722ed1' }} />AI Analysis</Space>}
                  >
                    {narrative.summary && (
                      <Typography.Paragraph>{narrative.summary}</Typography.Paragraph>
                    )}
                    {narrative.keyRisks?.length > 0 && (
                      <>
                        <Divider orientation="left" plain>Key Risks</Divider>
                        <List
                          size="small"
                          dataSource={narrative.keyRisks}
                          renderItem={(r, i) => (
                            <List.Item><Tag color="red">{i + 1}</Tag>{r}</List.Item>
                          )}
                        />
                      </>
                    )}
                    {narrative.recommendations?.length > 0 && (
                      <>
                        <Divider orientation="left" plain>Recommendations</Divider>
                        <List
                          size="small"
                          dataSource={narrative.recommendations}
                          renderItem={(r, i) => (
                            <List.Item><Tag color="green">{i + 1}</Tag>{r}</List.Item>
                          )}
                        />
                      </>
                    )}
                  </Card>
                </Col>
              )}
              {modelRecommendation && (
                <Col xs={24} lg={8}>
                  <Card size="small" title={<Space><BulbOutlined />AI Model Recommendation</Space>}>
                    <Typography.Paragraph>{modelRecommendation.reasoning}</Typography.Paragraph>
                    <Space wrap>
                      <Tag color="purple">Recommended: {modelRecommendation.recommended_model}</Tag>
                      {modelRecommendation.confidence && (
                        <Tag color="green">{modelRecommendation.confidence} confidence</Tag>
                      )}
                    </Space>
                  </Card>
                </Col>
              )}
            </Row>
          )}

          {/* Forecast chart */}
          <Card
            title={
              <Space>
                <LineChartOutlined />
                Forecast
                <Tag color="purple">{forecastPeriod} mo</Tag>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <div style={{ height: 350 }}>
              {forecastChartData && <Line data={forecastChartData} options={chartOptions} />}
            </div>
          </Card>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={12}>
              <Card title={<Space><RadarChartOutlined />Risk Profile</Space>}>
                <div style={{ height: 300 }}>
                  <Radar data={riskRadarData} options={radarOptions} />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <BulbOutlined style={{ color: '#faad14' }} />
                    Insights
                    <Badge count={insights.length} style={{ backgroundColor: '#faad14' }} />
                  </Space>
                }
                bodyStyle={{ maxHeight: 300, overflow: 'auto' }}
              >
                {insights.length ? (
                  <List
                    size="small"
                    dataSource={insights}
                    renderItem={(i) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              style={{
                                backgroundColor:
                                  i.priority === 'critical' ? '#f5222d'
                                  : i.priority === 'high' ? '#fa541c'
                                  : i.priority === 'medium' ? '#faad14'
                                  : '#52c41a'
                              }}
                              icon={i.icon || <InfoCircleOutlined />}
                            />
                          }
                          title={
                            <Space>
                              <Text strong>{i.title}</Text>
                              <Tag
                                color={
                                  i.priority === 'critical' ? 'red'
                                  : i.priority === 'high' ? 'orange'
                                  : i.priority === 'medium' ? 'gold'
                                  : 'green'
                                }
                              >
                                {i.priority}
                              </Tag>
                            </Space>
                          }
                          description={i.description}
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No insights" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Anomalies */}
          {anomalies.length > 0 && (
            <Card
              style={{ marginBottom: 16 }}
              title={
                <Space>
                  <AlertOutlined style={{ color: '#f5222d' }} />
                  Anomalies Detected by AI
                  <Badge count={anomalies.length} style={{ backgroundColor: '#f5222d' }} />
                </Space>
              }
            >
              <Timeline>
                {anomalies.map((a, i) => (
                  <Timeline.Item key={i} color={a.severity === 'high' ? 'red' : 'orange'}>
                    <Text strong>{a.title || a.description}</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{a.explanation}</Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          )}

          {/* Risk factors table */}
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#f5222d' }} />
                Risk Factors
                <Badge count={riskFactors.length} style={{ backgroundColor: '#f5222d' }} />
              </Space>
            }
          >
            <Table
              dataSource={riskFactors}
              columns={[
                {
                  title: 'Factor',
                  dataIndex: 'factor',
                  render: (t) => <Text strong>{t}</Text>
                },
                {
                  title: 'Value',
                  dataIndex: 'value',
                  render: (t) => <Tag color="blue">{t}</Tag>
                },
                {
                  title: 'Impact',
                  dataIndex: 'impact',
                  render: (imp) => (
                    <Space>
                      <Progress
                        percent={Math.min(100, imp * 5)}
                        size="small"
                        style={{ width: 60 }}
                        showInfo={false}
                      />
                      <Text>{Math.round(imp)}</Text>
                    </Space>
                  ),
                  sorter: (a, b) => a.impact - b.impact
                },
                {
                  title: 'Risk',
                  dataIndex: 'risk',
                  render: (r) => (
                    <Tag color={r === 'high' ? 'red' : r === 'medium' ? 'orange' : 'green'}>
                      {r?.toUpperCase()}
                    </Tag>
                  )
                },
                {
                  title: 'Recommendation',
                  dataIndex: 'recommendation',
                  render: (t) => <Text type="secondary">{t}</Text>
                }
              ]}
              rowKey="factor"
              pagination={false}
              size="small"
            />
          </Card>
        </>
      ) : null}

      {/* What-If Scenario Modal */}
      <Modal
        title={<Space><QuestionCircleOutlined />What-If Scenario (AI)</Space>}
        open={scenarioVisible}
        onCancel={() => {
          setScenarioVisible(false);
          setScenarioResult(null);
          setScenarioInput('');
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setScenarioVisible(false);
              setScenarioResult(null);
              setScenarioInput('');
            }}
          >
            Close
          </Button>,
          <Button
            key="run"
            type="primary"
            loading={scenarioLoading}
            onClick={runScenario}
          >
            Run Scenario
          </Button>
        ]}
        width={640}
      >
        <Text type="secondary">
          Describe a change — e.g. "If we cut night-shift staffing by 30% for Q2" — and the AI will forecast the impact.
        </Text>
        <Input.TextArea
          rows={3}
          value={scenarioInput}
          onChange={(e) => setScenarioInput(e.target.value)}
          placeholder="If we implement corrective action X..."
          style={{ marginTop: 12 }}
        />
        {scenarioResult && (
          <Card size="small" style={{ marginTop: 16 }}>
            <Typography.Paragraph>
              {scenarioResult.summary || scenarioResult.narrative}
            </Typography.Paragraph>
            {scenarioResult.predicted_change != null && (
              <Statistic
                title="Predicted Change"
                value={scenarioResult.predicted_change}
                suffix="%"
              />
            )}
            {scenarioResult.risks?.length > 0 && (
              <>
                <Divider orientation="left" plain>Risks</Divider>
                <List
                  size="small"
                  dataSource={scenarioResult.risks}
                  renderItem={(r) => <List.Item>{r}</List.Item>}
                />
              </>
            )}
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;
