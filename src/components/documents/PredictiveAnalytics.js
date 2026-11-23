// src/components/documents/PredictiveAnalytics.jsx
// Predictive insights: forecasting, risk scoring, trend prediction,
// and proactive recommendations using ML models

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Descriptions,
  Tabs, Timeline, Avatar, List, Badge, Tooltip, Progress,
  Switch, Empty, Spin, Alert, Divider, Typography, Collapse,
  Checkbox, Radio, Slider, DatePicker, InputNumber, Segmented,
  Statistic, Result, Steps, Badge as AntBadge, Statistic as AntStat
} from 'antd';
import {
  ExperimentOutlined, ThunderboltOutlined, RocketOutlined,
  RiseOutlined, FallOutlined, LineChartOutlined, AreaChartOutlined,
  BarChartOutlined, PieChartOutlined, FundOutlined, TrophyOutlined,
  BulbOutlined, AimOutlined, RadarChartOutlined, RobotOutlined,
  DatabaseOutlined, DeploymentUnitOutlined, NodeIndexOutlined,
  ClusterOutlined, ApartmentOutlined, HeatMapOutlined,
  LineChartOutlined as TrendOutlined, CompassOutlined, FileTextOutlined, SafetyCertificateOutlined, 
  FireOutlined, WarningOutlined, CheckCircleOutlined,
  InfoCircleOutlined, ClockCircleOutlined, CalendarOutlined,
  ReloadOutlined, DownloadOutlined, ExportOutlined,
  SettingOutlined, SaveOutlined, EyeOutlined, StarOutlined,
  StarFilled, SendOutlined, MailOutlined, BellOutlined,
  EnvironmentOutlined, SafetyOutlined, AuditOutlined,
  MedicineBoxOutlined, GlobalOutlined, TeamOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, ResponsiveContainer, Cell, ReferenceLine, ReferenceArea,
  Brush, RadialBarChart, RadialBar, ErrorBar
} from 'recharts';
import documentService from '../../services/documentService';
import './PredictiveAnalytics.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// ============================================================
// CONSTANTS
// ============================================================

const PREDICTION_TYPES = {
  document_volume: { 
    label: 'Document Volume', 
    icon: <FileTextOutlined />, 
    color: '#1890ff',
    description: 'Forecast document creation'
  },
  compliance_risk: { 
    label: 'Compliance Risk', 
    icon: <SafetyCertificateOutlined />, 
    color: '#f5222d',
    description: 'Predict compliance violations'
  },
  expiry_risk: { 
    label: 'Expiry Risk', 
    icon: <ClockCircleOutlined />, 
    color: '#faad14',
    description: 'Predict upcoming expirations'
  },
  storage_growth: { 
    label: 'Storage Growth', 
    icon: <DatabaseOutlined />, 
    color: '#722ed1',
    description: 'Forecast storage needs'
  },
  user_activity: { 
    label: 'User Activity', 
    icon: <TeamOutlined />, 
    color: '#52c41a',
    description: 'Predict user engagement'
  },
  approval_bottleneck: { 
    label: 'Approval Bottleneck', 
    icon: <NodeIndexOutlined />, 
    color: '#13c2c2',
    description: 'Forecast workflow delays'
  }
};

const RISK_LEVELS = {
  critical: { label: 'Critical', color: '#cf1322', bgColor: '#fff1f0' },
  high: { label: 'High', color: '#f5222d', bgColor: '#fff1f0' },
  medium: { label: 'Medium', color: '#faad14', bgColor: '#fff7e6' },
  low: { label: 'Low', color: '#52c41a', bgColor: '#f6ffed' }
};

const MODEL_TYPES = {
  time_series: { label: 'Time Series (ARIMA)', description: 'Statistical forecasting' },
  regression: { label: 'Regression', description: 'Linear/polynomial models' },
  ml_model: { label: 'ML Model', description: 'Random Forest / XGBoost' },
  neural_network: { label: 'Neural Network', description: 'LSTM / Transformer' }
};

const CHART_COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

// ============================================================
// MAIN COMPONENT
// ============================================================

const PredictiveAnalytics = ({
  companyId = null,
  embedded = false,
  onUpdate = null
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [activeTab, setActiveTab] = useState('forecast');
  const [predictionType, setPredictionType] = useState('document_volume');
  const [timeHorizon, setTimeHorizon] = useState(30);
  
  // Data
  const [forecastData, setForecastData] = useState(null);
  const [riskScores, setRiskScores] = useState([]);
  const [trends, setTrends] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [models, setModels] = useState([]);
  const [modelAccuracy, setModelAccuracy] = useState({});
  const [predictions, setPredictions] = useState([]);
  
  // UI State
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  
  // Settings
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [modelType, setModelType] = useState('time_series');
  const [includeSeasonality, setIncludeSeasonality] = useState(true);
  const [autoRetrain, setAutoRetrain] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(80);
  
  // Forms
  const [form] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        forecastResponse,
        riskResponse,
        trendsResponse,
        recommendationsResponse,
        modelsResponse,
        predictionsResponse
      ] = await Promise.all([
        documentService.getPredictiveForecast({
          type: predictionType,
          horizon_days: timeHorizon,
          confidence: confidenceLevel,
          company_id: companyId
        }),
        documentService.getRiskScores({ company_id: companyId }),
        documentService.getPredictiveTrends({ company_id: companyId }),
        documentService.getPredictiveRecommendations({ company_id: companyId }),
        documentService.getPredictiveModels({ company_id: companyId }),
        documentService.getPredictions({ company_id: companyId, limit: 20 })
      ]);
      
      setForecastData(forecastResponse);
      setRiskScores(riskResponse.risks || []);
      setTrends(trendsResponse.trends || []);
      setRecommendations(recommendationsResponse.recommendations || []);
      setModels(modelsResponse.models || []);
      setModelAccuracy(modelsResponse.accuracy || {});
      setPredictions(predictionsResponse.predictions || []);
      
    } catch (error) {
      console.error('Failed to load predictive data:', error);
      message.error('Failed to load predictive data');
    } finally {
      setLoading(false);
    }
  }, [companyId, predictionType, timeHorizon, confidenceLevel]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleTrainModel = async () => {
    setTraining(true);
    try {
      const result = await documentService.trainPredictiveModel({
        model_type: modelType,
        include_seasonality: includeSeasonality,
        company_id: companyId
      });
      
      message.success(`Model trained successfully (accuracy: ${(result.accuracy * 100).toFixed(1)}%)`);
      loadData();
      
    } catch (error) {
      console.error('Training failed:', error);
      message.error('Model training failed');
    } finally {
      setTraining(false);
    }
  };
  
  const handleGenerateForecast = async () => {
    try {
      const result = await documentService.generateForecast({
        type: predictionType,
        horizon_days: timeHorizon,
        confidence: confidenceLevel,
        model: modelType,
        company_id: companyId
      });
      
      setForecastData(result);
      message.success('Forecast generated');
      
    } catch (error) {
      console.error('Forecast failed:', error);
      message.error('Failed to generate forecast');
    }
  };
  
  const handleViewDetail = (item) => {
    setSelectedPrediction(item);
    setDetailDrawerVisible(true);
  };
  
  const handleExport = async (format) => {
    try {
      const blob = await documentService.exportPredictiveReport({
        prediction_type: predictionType,
        format,
        company_id: companyId
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `predictive-report-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      message.success('Report exported');
      setExportModalVisible(false);
      
    } catch (error) {
      message.error('Failed to export');
    }
  };
  
  const handleCreateAlert = async (values) => {
    try {
      await documentService.createPredictiveAlert({
        ...values,
        prediction_type: predictionType,
        company_id: companyId
      });
      message.success('Alert created');
      setAlertModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create alert');
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      await documentService.savePredictiveSettings({
        confidence_level: confidenceLevel,
        model_type: modelType,
        include_seasonality: includeSeasonality,
        auto_retrain: autoRetrain,
        alert_threshold: alertThreshold,
        company_id: companyId
      });
      message.success('Settings saved');
      setConfigModalVisible(false);
    } catch (error) {
      message.error('Failed to save settings');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getRiskConfig = (score) => {
    if (score >= 80) return RISK_LEVELS.critical;
    if (score >= 60) return RISK_LEVELS.high;
    if (score >= 40) return RISK_LEVELS.medium;
    return RISK_LEVELS.low;
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid';
    }
  };
  
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="predictive-stat-card">
          <AntStat
            title="Prediction Accuracy"
            value={Math.round((modelAccuracy.overall || 0) * 100)}
            suffix="%"
            prefix={<AimOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="predictive-stat-card">
          <AntStat
            title="High-Risk Items"
            value={riskScores.filter(r => r.score >= 60).length}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="predictive-stat-card">
          <AntStat
            title="Recommendations"
            value={recommendations.length}
            prefix={<BulbOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="predictive-stat-card">
          <AntStat
            title="Active Models"
            value={models.filter(m => m.status === 'active').length}
            prefix={<ExperimentOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderForecastTab = () => (
    <div>
      {/* Forecast Chart */}
      <Card 
        title={
          <Space>
            <TrendOutlined />
            <span>Document Volume Forecast</span>
            <Tag color="blue">{timeHorizon} days</Tag>
            <Tag color="green">{Math.round(confidenceLevel * 100)}% confidence</Tag>
          </Space>
        }
        size="small"
        extra={
          <Space>
            <Select
              value={predictionType}
              onChange={setPredictionType}
              style={{ width: 180 }}
              size="small"
            >
              {Object.entries(PREDICTION_TYPES).map(([key, value]) => (
                <Option key={key} value={key}>
                  <Space>
                    {value.icon}
                    {value.label}
                  </Space>
                </Option>
              ))}
            </Select>
            <Select
              value={timeHorizon}
              onChange={setTimeHorizon}
              style={{ width: 120 }}
              size="small"
            >
              <Option value={7}>7 days</Option>
              <Option value={30}>30 days</Option>
              <Option value={60}>60 days</Option>
              <Option value={90}>90 days</Option>
              <Option value={180}>6 months</Option>
            </Select>
            <Button 
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={handleGenerateForecast}
            >
              Regenerate
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : forecastData ? (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={forecastData.timeline || []}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#52c41a" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <RTooltip />
              <Legend />
              <ReferenceLine 
                x={forecastData.forecast_start} 
                stroke="#faad14" 
                strokeDasharray="3 3"
                label={{ value: 'Today', position: 'top', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#1890ff"
                fill="url(#actualGradient)"
                name="Actual"
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#52c41a"
                fill="url(#forecastGradient)"
                strokeDasharray="5 5"
                name="Forecast"
              />
              <Area
                type="monotone"
                dataKey="upper_bound"
                stroke="none"
                fill="#52c41a"
                fillOpacity={0.1}
                name="Upper Bound"
              />
              <Area
                type="monotone"
                dataKey="lower_bound"
                stroke="none"
                fill="#52c41a"
                fillOpacity={0.1}
                name="Lower Bound"
              />
              <Brush dataKey="date" height={20} stroke="#1890ff" />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="No forecast data" />
        )}
      </Card>
      
      {/* Forecast Summary */}
      {forecastData?.summary && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <AntStat
                title="Predicted Total"
                value={forecastData.summary.total_predicted || 0}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <AntStat
                title="Trend"
                value={forecastData.summary.trend_percent?.toFixed(1) || 0}
                suffix="%"
                prefix={forecastData.summary.trend_percent >= 0 ? <RiseOutlined /> : <FallOutlined />}
                valueStyle={{ 
                  color: forecastData.summary.trend_percent >= 0 ? '#52c41a' : '#f5222d' 
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <AntStat
                title="Peak Day"
                value={forecastData.summary.peak_date ? formatDate(forecastData.summary.peak_date) : 'N/A'}
                prefix={<CalendarOutlined />}
                valueStyle={{ fontSize: 14 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <AntStat
                title="Avg per Day"
                value={Math.round(forecastData.summary.avg_per_day || 0)}
                prefix={<LineChartOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Predictions Table */}
      <Card title="Predictions" size="small">
        <Table
          rowKey="id"
          dataSource={predictions}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Prediction',
              dataIndex: 'title',
              key: 'title',
              render: (title, record) => (
                <Space>
                  <Avatar 
                    icon={PREDICTION_TYPES[record.type]?.icon}
                    style={{ backgroundColor: PREDICTION_TYPES[record.type]?.color }}
                    size="small"
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>{title}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      {record.description}
                    </div>
                  </div>
                </Space>
              )
            },
            {
              title: 'Predicted Value',
              dataIndex: 'value',
              key: 'value',
              render: (v, record) => (
                <div>
                  <Text strong style={{ fontSize: 15 }}>
                    {formatNumber(v)} {record.unit}
                  </Text>
                  {record.confidence && (
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      ±{(record.confidence * 100).toFixed(0)}% confidence
                    </div>
                  )}
                </div>
              )
            },
            {
              title: 'Timeframe',
              dataIndex: 'timeframe',
              key: 'timeframe',
              render: (t) => <Tag>{t}</Tag>
            },
            {
              title: 'Risk Level',
              dataIndex: 'risk_score',
              key: 'risk_score',
              render: (score) => {
                const config = getRiskConfig(score);
                return (
                  <Tag color={config.color}>
                    {config.label}
                  </Tag>
                );
              }
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(record)}
                />
              )
            }
          ]}
        />
      </Card>
    </div>
  );
  
  const renderRiskTab = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Risk Score Distribution" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" fontSize={11} />
                <YAxis fontSize={11} />
                <RTooltip />
                <Bar dataKey="score" name="Risk Score">
                  {riskScores.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={getRiskConfig(entry.score).color}
                    />
                  ))}
                </Bar>
                <ReferenceLine y={alertThreshold} stroke="#f5222d" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Risk Breakdown" size="small">
            <List
              dataSource={riskScores.slice(0, 6)}
              renderItem={(item) => {
                const config = getRiskConfig(item.score);
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: config.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: config.color,
                          fontWeight: 'bold',
                          fontSize: 13
                        }}>
                          {item.score}
                        </div>
                      }
                      title={item.category}
                      description={
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {item.description}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="Recommendations" size="small">
        {recommendations.length > 0 ? (
          <List
            dataSource={recommendations}
            renderItem={(rec) => (
              <List.Item
                actions={[
                  <Button 
                    key="apply" 
                    type="primary" 
                    size="small"
                    onClick={() => message.success(`Applied: ${rec.title}`)}
                  >
                    Apply
                  </Button>,
                  <Button 
                    key="dismiss" 
                    type="text" 
                    size="small"
                  >
                    Dismiss
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<BulbOutlined />}
                      style={{ backgroundColor: '#faad14' }}
                    />
                  }
                  title={
                    <Space>
                      <span>{rec.title}</span>
                      <Tag color={getRiskConfig(rec.impact_score).color}>
                        {getRiskConfig(rec.impact_score).label} Impact
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div>{rec.description}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                        Expected improvement: <strong>{rec.expected_improvement}</strong>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No recommendations at this time" />
        )}
      </Card>
    </div>
  );
  
  const renderModelsTab = () => (
    <Card 
      title={
        <Space>
          <ExperimentOutlined />
          <span>ML Models</span>
        </Space>
      }
      size="small"
      extra={
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleTrainModel}
            loading={training}
            size="small"
          >
            Train New Model
          </Button>
          <Button 
            icon={<SettingOutlined />}
            onClick={() => setConfigModalVisible(true)}
            size="small"
          >
            Configure
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="id"
        dataSource={models}
        pagination={false}
        columns={[
          {
            title: 'Model',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
              <Space>
                <Avatar 
                  icon={<ExperimentOutlined />}
                  style={{ 
                    backgroundColor: record.status === 'active' ? '#52c41a' : '#d9d9d9'
                  }}
                  size="small"
                />
                <div>
                  <div style={{ fontWeight: 500 }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                    {MODEL_TYPES[record.type]?.label}
                  </div>
                </div>
              </Space>
            )
          },
          {
            title: 'Accuracy',
            dataIndex: 'accuracy',
            key: 'accuracy',
            render: (acc) => (
              <Progress 
                percent={Math.round(acc * 100)} 
                size="small"
                strokeColor={acc >= 0.8 ? '#52c41a' : acc >= 0.6 ? '#faad14' : '#f5222d'}
              />
            )
          },
          {
            title: 'Trained',
            dataIndex: 'trained_at',
            key: 'trained_at',
            render: (date) => formatDate(date)
          },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
              <Tag color={status === 'active' ? 'green' : 'default'}>
                {status?.toUpperCase()}
              </Tag>
            )
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
              <Space>
                <Button type="text" size="small" icon={<EyeOutlined />} />
                <Button type="text" size="small" icon={<ReloadOutlined />} />
              </Space>
            )
          }
        ]}
      />
    </Card>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderDetailDrawer = () => (
    <Drawer
      title="Prediction Details"
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={500}
    >
      {selectedPrediction && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Prediction">
              {selectedPrediction.title}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={PREDICTION_TYPES[selectedPrediction.type]?.color}>
                {PREDICTION_TYPES[selectedPrediction.type]?.label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Predicted Value">
              {formatNumber(selectedPrediction.value)} {selectedPrediction.unit}
            </Descriptions.Item>
            <Descriptions.Item label="Confidence">
              <Progress 
                percent={Math.round((selectedPrediction.confidence || 0) * 100)}
                size="small"
              />
            </Descriptions.Item>
            <Descriptions.Item label="Risk Score">
              <Tag color={getRiskConfig(selectedPrediction.risk_score).color}>
                {selectedPrediction.risk_score}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Timeframe">
              {selectedPrediction.timeframe}
            </Descriptions.Item>
            <Descriptions.Item label="Model Used">
              {selectedPrediction.model || 'ARIMA'}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedPrediction.description}
            </Descriptions.Item>
          </Descriptions>
          
          <Divider>Supporting Data</Divider>
          
          {selectedPrediction.supporting_data && (
            <List
              size="small"
              dataSource={selectedPrediction.supporting_data}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.factor}
                    description={
                      <Space>
                        <Text>Impact: {item.impact}</Text>
                        <Progress 
                          percent={Math.abs(item.impact_value * 100)} 
                          size="small"
                          style={{ width: 100 }}
                        />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      )}
    </Drawer>
  );
  
  const renderConfigModal = () => (
    <Modal
      title="Predictive Analytics Settings"
      open={configModalVisible}
      onCancel={() => setConfigModalVisible(false)}
      onOk={handleSaveSettings}
      okText="Save Settings"
      width={600}
    >
      <Form layout="vertical">
        <Form.Item label={`Confidence Level: ${(confidenceLevel * 100).toFixed(0)}%`}>
          <Slider
            value={confidenceLevel}
            onChange={setConfidenceLevel}
            min={0.5}
            max={0.99}
            step={0.01}
            marks={{
              0.5: '50%',
              0.75: '75%',
              0.95: '95%',
              0.99: '99%'
            }}
          />
          <Text type="secondary" style={{ fontSize: 11 }}>
            Higher confidence = wider prediction intervals
          </Text>
        </Form.Item>
        
        <Form.Item label="Model Type">
          <Select value={modelType} onChange={setModelType}>
            {Object.entries(MODEL_TYPES).map(([key, value]) => (
              <Option key={key} value={key}>
                <div>
                  <div style={{ fontWeight: 500 }}>{value.label}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{value.description}</div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Divider>Advanced Options</Divider>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Switch checked={includeSeasonality} onChange={setIncludeSeasonality} />
            <Text>Include seasonal patterns</Text>
          </Space>
          <Space>
            <Switch checked={autoRetrain} onChange={setAutoRetrain} />
            <Text>Auto-retrain models weekly</Text>
          </Space>
        </Space>
        
        <Form.Item label="Alert Threshold" style={{ marginTop: 16 }}>
          <Slider
            value={alertThreshold}
            onChange={setAlertThreshold}
            min={50}
            max={100}
            marks={{ 50: 'Low', 75: 'Medium', 100: 'High' }}
          />
          <Text type="secondary" style={{ fontSize: 11 }}>
            Alert when risk score exceeds this threshold
          </Text>
        </Form.Item>
      </Form>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="predictive-analytics" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="predictive-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ExperimentOutlined style={{ fontSize: 24, color: '#722ed1' }} />
              <Title level={4} style={{ margin: 0 }}>Predictive Analytics</Title>
              <Badge status="processing" text="AI-Powered" />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<BellOutlined />}
                onClick={() => setAlertModalVisible(true)}
              >
                Create Alert
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => setExportModalVisible(true)}
              >
                Export
              </Button>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => setConfigModalVisible(true)}
              >
                Configure
              </Button>
              <Button 
                type="primary"
                icon={<RocketOutlined />}
                onClick={handleGenerateForecast}
              >
                Generate Forecast
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadData}
                loading={loading}
              />
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Stats */}
      {renderStats()}
      
      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'forecast',
            label: (
              <Space>
                <TrendOutlined />
                Forecasts
              </Space>
            ),
            children: renderForecastTab()
          },
          {
            key: 'risk',
            label: (
              <Space>
                <WarningOutlined />
                Risk Analysis
                {riskScores.filter(r => r.score >= 60).length > 0 && (
                  <Badge 
                    count={riskScores.filter(r => r.score >= 60).length} 
                    style={{ backgroundColor: '#f5222d' }} 
                  />
                )}
              </Space>
            ),
            children: renderRiskTab()
          },
          {
            key: 'models',
            label: (
              <Space>
                <ExperimentOutlined />
                ML Models
              </Space>
            ),
            children: renderModelsTab()
          }
        ]}
      />
      
      {/* Modals */}
      {renderDetailDrawer()}
      {renderConfigModal()}
    </div>
  );
};

export default PredictiveAnalytics;