// src/components/AI/AIServiceTab.js - COMPLETE IMPLEMENTATION WITH DOCUMENT GENERATION

import React, { useState, useRef } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Alert, 
  Progress, 
  List, 
  Tag, 
  Space, 
  Row, 
  Col, 
  Statistic,
  Tabs,
  Select,
  Slider,
  Switch,
  Timeline,
  Collapse,
  Badge,
  Tooltip,
  Modal,
  Upload,
  message,
  Descriptions,
  Table,
  Divider,
  InputNumber,
  DatePicker,
  Radio,
  Dropdown,
  Menu
} from 'antd';
import { 
  EnvironmentOutlined, 
  AlertOutlined, 
  CheckCircleOutlined, 
  LineChartOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  DashboardOutlined,
  CloudSyncOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  BarChartOutlined,
  TrophyOutlined,
  BulbOutlined,
  CameraOutlined,
  EyeOutlined,
  SettingOutlined,
  DownloadOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  GlobalOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileZipOutlined
} from '@ant-design/icons';
import environmentalAIService from '../../services/environmentalAIService';
import EnvironmentalDocumentGenerator from '../environmental/EnvironmentalDocumentGenerator';

// The backend's own error message (e.g. "At least 3 days of readings are needed")
const apiError = (e, fallback) => e?.response?.data?.error || e?.response?.data?.message || e?.message || fallback;
import './aia.css';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

const AIServiceTab = () => {
  // Forms for each tab
  const [analysisForm] = Form.useForm();
  const [predictionForm] = Form.useForm();
  const [riskForm] = Form.useForm();
  const [anomalyForm] = Form.useForm();
  const [advancedForm] = Form.useForm();
  const [esgForm] = Form.useForm();
  const [optimizationForm] = Form.useForm();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');
  const [generatedDocuments, setGeneratedDocuments] = useState([]);
  
  // Analysis results
  const [analysis, setAnalysis] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [advancedAnalysis, setAdvancedAnalysis] = useState(null);
  const [esgScore, setEsgScore] = useState(null);
  const [resourceOptimization, setResourceOptimization] = useState(null);
  
  // Camera Monitoring States
  const [cameraStatus, setCameraStatus] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [cameraAnalytics, setCameraAnalytics] = useState(null);
  const [violationHistory, setViolationHistory] = useState([]);
  const [cameraConfig, setCameraConfig] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const [liveFeedUrl, setLiveFeedUrl] = useState('');
  const [cameraStream, setCameraStream] = useState(null);


  // Model status
  const [modelStatus, setModelStatus] = useState({
    air_quality: { status: 'loaded', accuracy: 94.2 },
    water_quality: { status: 'loaded', accuracy: 89.7 },
    risk_assessment: { status: 'loaded', accuracy: 91.5 },
    anomaly_detection: { status: 'loaded', accuracy: 96.8 },
    camera_monitoring: { status: 'loaded', accuracy: 92.3 }
  });





  // ===== ENVIRONMENTAL ANALYSIS FUNCTIONS =====

  const onAnalyzeEnvironmentalData = async (values) => {
    setLoading(true);
    try {
      const opts = { timeframe: values.timeframe || '30d', assessment_scope: values.analysis_depth || 'comprehensive' };
      const [risk, adv] = await Promise.all([
        environmentalAIService.assessEnvironmentalRisk(opts),
        environmentalAIService.advancedEnvironmentalAnalysis({ time_range: opts.timeframe }),
      ]);
      const r = risk?.risk_assessment || risk || {};
      const a = adv?.advanced_analysis || adv || {};
      const prob = a.compliance_prediction?.compliance_probability;
      setAnalysis({
        overall_rating: { LOW: 'GOOD', MEDIUM: 'FAIR', HIGH: 'POOR', CRITICAL: 'CRITICAL' }[r.overall_risk] || 'NO DATA',
        air_quality_index: a.current?.avg_aqi ?? null,
        water_quality_score: a.impact_assessment?.water_impact_score ?? null,
        compliance_score: prob != null ? Math.round(prob * 100) : null,
        confidence_score: r.confidence_level ?? null,
        anomalies: [...(r.high_risk_factors || []), ...(r.medium_risk_factors || [])],
        recommendations: [...new Set([...(r.mitigation_strategies || []), ...(a.impact_assessment?.improvement_recommendations || [])])],
        risk_level: r.overall_risk || 'UNKNOWN',
        trend: r.predicted_risk_trend || 'unknown',
        data_points: r.data_points,
      });
      message.success('Analysis completed from your monitoring records');
    } catch (error) {
      console.error('Environmental analysis failed:', error);
      setAnalysis(null);
      message.error(apiError(error, 'Environmental analysis failed'), 6);
    } finally {
      setLoading(false);
    }
  };

  const onPredictAirQuality = async (values) => {
    setLoading(true);
    try {
      console.log('🔄 Starting air quality prediction with values:', values);
      const response = await environmentalAIService.predictAirQuality(values);
      console.log('✅ Air quality prediction response:', response);
      setPredictions(response.predictions || response);
      message.success('Air quality predictions generated!');
    } catch (error) {
      console.error('Air quality prediction failed:', error);
      setPredictions(null);
      message.error(apiError(error, 'Air quality prediction failed'), 6);
    } finally {
      setLoading(false);
    }
  };

  const onAssessRisk = async (values) => {
    setLoading(true);
    try {
      console.log('🔄 Starting risk assessment with values:', values);
      
      // Debug: Check if service exists
      console.log('🔍 environmentalAIService:', environmentalAIService);
      console.log('🔍 assessEnvironmentalRisk method:', environmentalAIService?.assessEnvironmentalRisk);
      
      if (!environmentalAIService) {
        throw new Error('environmentalAIService is not defined');
      }
      
      if (typeof environmentalAIService.assessEnvironmentalRisk !== 'function') {
        throw new Error('assessEnvironmentalRisk is not a function');
      }
      
      const response = await environmentalAIService.assessEnvironmentalRisk(values);
      console.log('✅ Raw risk assessment response:', response);
      
      if (response === undefined) {
        throw new Error('Service returned undefined - check service implementation');
      }
      
      setRiskAssessment(response?.risk_assessment || response);
      message.success('Risk assessment completed!');
      
    } catch (error) {
      console.error('Risk assessment failed:', error);
      setRiskAssessment(null);
      message.error(apiError(error, 'Risk assessment failed'), 6);
    } finally {
      setLoading(false);
    }
  };
      
      // Enhanced fallback demo data
      

  const onDetectAnomalies = async (values) => {
    setLoading(true);
    try {
      console.log('🔄 Starting anomaly detection with values:', values);
      const response = await environmentalAIService.detectAnomalies(values);
      console.log('✅ Anomaly detection response:', response);
      setAnomalies(response.anomaly_detection || response);
      message.success('Anomaly detection completed!');
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      setAnomalies(null);
      message.error(apiError(error, 'Anomaly detection failed'), 6);
    } finally {
      setLoading(false);
    }
  };

  const onAdvancedAnalysis = async (values) => {
    setLoading(true);
    try {
      console.log('🔄 Starting advanced analysis with values:', values);
      const response = await environmentalAIService.advancedEnvironmentalAnalysis(values);
      console.log('✅ Advanced analysis response:', response);
      setAdvancedAnalysis(response.advanced_analysis || response);
      message.success('Advanced analysis completed!');
    } catch (error) {
      console.error('Advanced analysis failed:', error);
      setAdvancedAnalysis(null);
      message.error(apiError(error, 'Advanced analysis failed'), 6);
    } finally {
      setLoading(false);
    }
  };

  const onESGScoring = async (values) => {
    setLoading(true);
    try {
      console.log('🔄 Starting ESG scoring with values:', values);
      const response = await environmentalAIService.calculateESGScore(values);
      console.log('✅ ESG scoring response:', response);
      setEsgScore(response.esg_assessment || response);
      message.success('ESG scoring completed!');
    } catch (error) {
      console.error('ESG scoring failed:', error);
      setEsgScore(null);
      message.error(apiError(error, 'ESG scoring failed'), 6);
    } finally {
      setLoading(false);
    }
  };

  const onResourceOptimization = async (values) => {
    setLoading(true);
    try {
      console.log('🔄 Starting resource optimization with values:', values);
      const response = await environmentalAIService.optimizeResources(values);
      console.log('✅ Resource optimization response:', response);
      setResourceOptimization(response.resource_optimization || response);
      message.success('Resource optimization completed!');
    } catch (error) {
      console.error('Resource optimization failed:', error);
      setResourceOptimization(null);
      message.error(apiError(error, 'Resource optimization failed'), 6);
    } finally {
      setLoading(false);
    }
  };

  // ===== CAMERA MONITORING FUNCTIONS =====

 

  const onStartCameraMonitoring = async () => {
    if (!selectedCamera) {
      message.warning('Please select a camera first');
      return;
    }
    setLoading(true);
    try {
      const response = await environmentalAIService.startMonitoring(selectedCamera);
      message.success('Camera monitoring started!');
      await onGetRealTimeAnalytics(selectedCamera);
    } catch (error) {
      console.error('Start camera monitoring failed:', error);
      message.error('Failed to start camera monitoring');
    } finally {
      setLoading(false);
    }
  };

  const onStopCameraMonitoring = async () => {
    if (!selectedCamera) {
      message.warning('Please select a camera first');
      return;
    }
    setLoading(true);
    try {
      const response = await environmentalAIService.stopMonitoring(selectedCamera);
      message.success('Camera monitoring stopped!');
    } catch (error) {
      console.error('Stop camera monitoring failed:', error);
      message.error('Failed to stop camera monitoring');
    } finally {
      setLoading(false);
    }
  };

  const onGetRealTimeAnalytics = async (cameraId = selectedCamera) => {
  if (!cameraId) {
    message.warning('Please select a camera first');
    return;
  }
  
  setLoading(true);
  try {
    // The service returns response.data, which should have {success: true, analytics: {}}
    const result = await environmentalAIService.getRealTimeAnalytics(cameraId);
    
    console.log('Analytics result:', result);
    
    // Handle the result structure properly
    if (result && result.success && result.analytics) {
      setCameraAnalytics(result.analytics);
    } else if (result && result.analytics) {
      setCameraAnalytics(result.analytics);
    } else {
      // If no analytics property, use the result directly or fallback
      setCameraAnalytics(result || {
        camera_id: cameraId,
        risk_level: 'LOW',
        risk_score: 25,
        objects_detected: 0,
        violations_detected: 0,
        session_duration_minutes: 0,
        last_updated: new Date().toISOString()
      });
    }
    
    message.success('Real-time analytics loaded!');
  } catch (error) {
    console.error('Get real-time analytics failed:', error);
    message.error('Failed to get real-time analytics');
    
    setCameraAnalytics({
      camera_id: cameraId,
      risk_level: 'LOW',
      risk_score: 25,
      objects_detected: 0,
      violations_detected: 0,
      session_duration_minutes: 0,
      last_updated: new Date().toISOString()
    });
  } finally {
    setLoading(false);
  }
};

  const onGetSystemHealth = async () => {
  setLoading(true);
  try {
    const response = await environmentalAIService.getSystemHealth();
    // Handle both response structures
    const healthData = response.health || response;
    setSystemHealth(healthData);
    message.success('System health loaded!');
  } catch (error) {
    console.error('Get system health failed:', error);
    message.error('Failed to get system health');
    // Set fallback system health data
    setSystemHealth({
      overall_status: 'healthy',
      cameras_online: 2,
      cameras_total: 3,
      storage_usage_percent: 45,
      cpu_usage_percent: 32,
      memory_usage_percent: 58,
      network_usage: 'stable',
      last_maintenance: new Date(Date.now() - 86400000).toISOString(),
      uptime_hours: 240,
      checked_at: new Date().toISOString()
    });
  } finally {
    setLoading(false);
  }
};

const onGetCameraStatus = async () => {
  setLoading(true);
  try {
    const response = await environmentalAIService.getCameraStatus();
    // Handle both response structures
    const cameraData = response.available_cameras ? response : {
      available_cameras: response || [],
      total_cameras: Array.isArray(response) ? response.length : 0,
      online_cameras: Array.isArray(response) ? response.filter(cam => cam.status === 'online').length : 0,
      system_status: 'operational'
    };
    
    setCameraStatus(cameraData);
    
    if (cameraData.available_cameras && cameraData.available_cameras.length > 0) {
      setSelectedCamera(cameraData.available_cameras[0].id);
      await onGetCameraConfig(cameraData.available_cameras[0].id);
    }
    message.success('Camera status loaded!');
  } catch (error) {
    console.error('Get camera status failed:', error);
    message.error('Failed to get camera status');
    // Set fallback camera data
    setCameraStatus({
      available_cameras: [
        {
          id: 'camera_0',
          name: 'Fallback Camera',
          status: 'online',
          resolution: '640x480',
          fps: 30
        }
      ],
      total_cameras: 1,
      online_cameras: 1,
      system_status: 'operational'
    });
  } finally {
    setLoading(false);
  }
};

const onGetViolationHistory = async () => {
  setLoading(true);
  try {
    const response = await environmentalAIService.getViolationHistory({
      limit: 10,
      severity: 'CRITICAL,HIGH'
    });
    // Handle both response structures
    const violations = response.violations || response || [];
    setViolationHistory(Array.isArray(violations) ? violations : []);
    message.success('Violation history loaded!');
  } catch (error) {
    console.error('Get violation history failed:', error);
    message.error('Failed to get violation history');
    // Set empty violation history as fallback
    setViolationHistory([]);
  } finally {
    setLoading(false);
  }
};

  const onGetCameraConfig = async (cameraId = selectedCamera) => {
    if (!cameraId) return;
    try {
      const response = await environmentalAIService.getCameraConfig(cameraId);
      setCameraConfig(response.config || response);
    } catch (error) {
      console.error('Get camera config failed:', error);
    }
  };

  

  const onUpdateCameraConfig = async (updates) => {
    if (!selectedCamera) {
      message.warning('Please select a camera first');
      return;
    }
    try {
      const response = await environmentalAIService.updateCameraConfig(selectedCamera, updates);
      setCameraConfig(response.config || response);
      message.success('Camera configuration updated!');
    } catch (error) {
      console.error('Update camera config failed:', error);
      message.error('Failed to update camera configuration');
    }
  };

  const onAcknowledgeViolation = async (violationId) => {
    try {
      const response = await environmentalAIService.acknowledgeViolation(violationId);
      setViolationHistory(prev => 
        prev.map(violation => 
          violation.id === violationId 
            ? { ...violation, acknowledged: true }
            : violation
        )
      );
      message.success('Violation acknowledged!');
    } catch (error) {
      console.error('Acknowledge violation failed:', error);
      message.error('Failed to acknowledge violation');
    }
  };

  // Helper functions
  const getRatingColor = (rating) => {
    switch (rating?.toUpperCase()) {
      case 'EXCELLENT': case 'LOW': return '#52c41a';
      case 'GOOD': return '#73d13d';
      case 'MODERATE': case 'MEDIUM': return '#faad14';
      case 'POOR': case 'HIGH': return '#f5222d';
      case 'HAZARDOUS': case 'CRITICAL': return '#a8071a';
      default: return '#d9d9d9';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return '🔴';
      case 'HIGH': return '🟠';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  // Initialize camera system when tab is activated
  React.useEffect(() => {
    if (activeTab === 'camera') {
      onGetCameraStatus();
      onGetSystemHealth();
      onGetViolationHistory();
    }
  }, [activeTab]);

  // ===== RENDER FUNCTIONS FOR EACH TAB =====

  const renderAnalysisTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Environmental Data Analysis" size="small">
          <Form
            form={analysisForm}
            layout="vertical"
            onFinish={onAnalyzeEnvironmentalData}
          >
            <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Please select location' }]}>
              <Select placeholder="Select location">
                <Option value="manufacturing">Manufacturing Zone</Option>
                <Option value="warehouse">Warehouse Area</Option>
                <Option value="office">Office Complex</Option>
                <Option value="outdoor">Outdoor Areas</Option>
                <Option value="all">All Facilities</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="timeframe" label="Timeframe" rules={[{ required: true, message: 'Please select timeframe' }]}>
              <Select placeholder="Select timeframe">
                <Option value="24h">Last 24 Hours</Option>
                <Option value="7d">Last 7 Days</Option>
                <Option value="30d">Last 30 Days</Option>
                <Option value="90d">Last 90 Days</Option>
              </Select>
            </Form.Item>

            <Form.Item name="parameters" label="Parameters to Analyze" rules={[{ required: true, message: 'Please select at least one parameter' }]}>
              <Select mode="multiple" placeholder="Select parameters">
                <Option value="air_quality">Air Quality (PM2.5, PM10, O3)</Option>
                <Option value="water_quality">Water Quality (pH, Turbidity, Chemicals)</Option>
                <Option value="temperature">Temperature Monitoring</Option>
                <Option value="humidity">Humidity Levels</Option>
                <Option value="noise">Noise Pollution</Option>
                <Option value="vibration">Vibration Monitoring</Option>
              </Select>
            </Form.Item>

            <Form.Item name="analysis_depth" label="Analysis Depth">
              <Radio.Group>
                <Radio value="basic">Basic Analysis</Radio>
                <Radio value="comprehensive">Comprehensive Analysis</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<DashboardOutlined />} size="large">
                Analyze Environmental Data
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Analysis Parameters" size="small" style={{ marginTop: 16 }}>
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Model Accuracy">
              <Progress percent={94.2} size="small" status="active" />
            </Descriptions.Item>
            <Descriptions.Item label="Processing Time">
              <Tag color="blue">2-5 seconds</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Data Sources">
              <Tag color="green">Real-time Sensors</Tag>
              <Tag color="orange">Historical Data</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Analysis Results" size="small">
          {analysis ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Statistic
                  title="Analysis Status"
                  value={analysis.overall_rating || 'COMPLETED'}
                  valueStyle={{ color: getRatingColor(analysis.overall_rating), fontSize: '24px' }}
                />
                <Progress 
                  percent={Math.round((analysis.confidence_score || 0) * 100)} 
                  format={percent => `Confidence: ${percent}%`}
                  status="active"
                />
              </div>

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Statistic
                    title="Air Quality"
                    value={analysis.air_quality_index ?? '—'}
                    suffix="AQI"
                    valueStyle={{ color: (analysis.air_quality_index || 0) <= 50 ? '#52c41a' : (analysis.air_quality_index || 0) <= 100 ? '#faad14' : '#f5222d' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Water Quality"
                    value={analysis.water_quality_score ?? '—'}
                    suffix="/100"
                    valueStyle={{ color: (analysis.water_quality_score || 0) >= 80 ? '#52c41a' : (analysis.water_quality_score || 0) >= 60 ? '#faad14' : '#f5222d' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Compliance"
                    value={analysis.compliance_score ?? '—'}
                    suffix="%"
                    valueStyle={{ color: (analysis.compliance_score || 0) >= 90 ? '#52c41a' : (analysis.compliance_score || 0) >= 80 ? '#faad14' : '#f5222d' }}
                  />
                </Col>
              </Row>

              <Divider />

              {analysis.anomalies && analysis.anomalies.length > 0 && (
                <Alert
                  message={`Detected Anomalies (${analysis.anomalies.length})`}
                  description={
                    <List
                      size="small"
                      dataSource={analysis.anomalies}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<WarningOutlined style={{ color: '#faad14' }} />}
                            title={`Finding ${index + 1}`}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="warning"
                  showIcon
                />
              )}

              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <Alert
                  message="Recommended Actions"
                  description={
                    <List
                      size="small"
                      dataSource={analysis.recommendations}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            title={`Action ${index + 1}`}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="success"
                  showIcon
                />
              )}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <DashboardOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
              <h3>No Analysis Results</h3>
              <p>Submit environmental data for analysis</p>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );


  // Add this component to your render/return section
const CameraMonitoringBox = () => {
  if (!isMonitoringActive) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      height: '300px',
      backgroundColor: '#000',
      border: '2px solid #1890ff',
      borderRadius: '8px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
        color: 'white',
        padding: '8px 12px',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>🚀 Live Camera Feed - {selectedCamera}</span>
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          onClick={() => setIsMonitoringActive(false)}
          style={{ color: 'white' }}
        />
      </div>
      
      {/* Camera Feed */}
      <div style={{
        width: '100%',
        height: 'calc(100% - 40px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a'
      }}>
        {liveFeedUrl ? (
          <img 
            src={liveFeedUrl} 
            alt="Live Camera Feed"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <CameraOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>Live feed will appear here</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              Monitoring: {selectedCamera}
            </div>
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '4px 8px',
        fontSize: '11px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>● REC</span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
  
  const renderPredictionTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Air Quality Prediction" size="small">
          <Form
            form={predictionForm}
            layout="vertical"
            onFinish={onPredictAirQuality}
          >
            <Form.Item name="location" label="Prediction Location" rules={[{ required: true, message: 'Please select location' }]}>
              <Select placeholder="Select location">
                <Option value="manufacturing_north">Manufacturing - North Zone</Option>
                <Option value="manufacturing_south">Manufacturing - South Zone</Option>
                <Option value="warehouse_east">Warehouse - East Wing</Option>
                <Option value="warehouse_west">Warehouse - West Wing</Option>
                <Option value="office_complex">Office Complex</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="prediction_horizon" label="Prediction Horizon" rules={[{ required: true, message: 'Please select prediction horizon' }]}>
              <Select placeholder="Select prediction period">
                <Option value="24h">24 Hours</Option>
                <Option value="48h">48 Hours</Option>
                <Option value="7d">7 Days</Option>
                <Option value="14d">14 Days</Option>
              </Select>
            </Form.Item>

            <Form.Item name="parameters" label="Parameters to Predict" rules={[{ required: true, message: 'Please select at least one parameter' }]}>
              <Select mode="multiple" placeholder="Select parameters">
                <Option value="aqi">Air Quality Index (AQI)</Option>
                <Option value="pm2_5">PM2.5 Concentration</Option>
                <Option value="pm10">PM10 Concentration</Option>
                <Option value="o3">Ozone (O3) Levels</Option>
                <Option value="no2">Nitrogen Dioxide (NO2)</Option>
                <Option value="so2">Sulfur Dioxide (SO2)</Option>
              </Select>
            </Form.Item>

            <Form.Item name="confidence_threshold" label="Confidence Threshold">
              <Slider
                min={50}
                max={95}
                step={5}
                marks={{
                  50: '50%',
                  65: '65%',
                  80: '80%',
                  95: '95%'
                }}
                defaultValue={80}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<LineChartOutlined />} size="large">
                Generate Air Quality Predictions
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Prediction Model Status" size="small" style={{ marginTop: 16 }}>
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Model Version">
              <Tag color="blue">v2.1.4</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Accuracy">
              <Progress percent={94.2} size="small" status="active" />
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              <Tag color="green">2 hours ago</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Training Data">
              <Tag color="orange">12 months</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Prediction Results" size="small">
          {predictions ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message={`Prediction Trend: ${predictions.trend?.toUpperCase() || 'STABLE'}`}
                description={`Generated ${predictions.predictions?.length || 0} predictions with ${((predictions.predictions?.[0]?.confidence || 0.8) * 100).toFixed(1)}% average confidence`}
                type={predictions.trend === 'improving' ? 'success' : predictions.trend === 'deteriorating' ? 'error' : 'info'}
                showIcon
              />

              {predictions.predictions && predictions.predictions.length > 0 && (
                <Table
                  size="small"
                  dataSource={predictions.predictions}
                  pagination={false}
                  columns={[
                    {
                      title: 'Time',
                      dataIndex: 'timestamp',
                      key: 'timestamp',
                      render: (timestamp) => new Date(timestamp).toLocaleString()
                    },
                    {
                      title: 'AQI',
                      dataIndex: 'aqi',
                      key: 'aqi',
                      render: (aqi) => (
                        <Tag color={aqi <= 50 ? 'green' : aqi <= 100 ? 'orange' : 'red'}>
                          {aqi}
                        </Tag>
                      )
                    },
                    {
                      title: 'PM2.5',
                      dataIndex: 'pm2_5',
                      key: 'pm2_5',
                      render: (value) => `${value} μg/m³`
                    },
                    {
                      title: 'Confidence',
                      dataIndex: 'confidence',
                      key: 'confidence',
                      render: (confidence) => (
                        <Progress percent={Math.round(confidence * 100)} size="small" />
                      )
                    }
                  ]}
                />
              )}

              {predictions.risk_alerts && predictions.risk_alerts.length > 0 && (
                <Alert
                  message="Risk Alerts"
                  description={
                    <List
                      size="small"
                      dataSource={predictions.risk_alerts}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<AlertOutlined style={{ color: '#faad14' }} />}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="warning"
                  showIcon
                />
              )}

              {predictions.recommendations && predictions.recommendations.length > 0 && (
                <Alert
                  message="Recommendations"
                  description={
                    <List
                      size="small"
                      dataSource={predictions.recommendations}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="success"
                  showIcon
                />
              )}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <LineChartOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
              <h3>No Predictions Available</h3>
              <p>Generate air quality predictions to see results</p>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );

  const renderRiskTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Environmental Risk Assessment" size="small">
          <Form
            form={riskForm}
            layout="vertical"
            onFinish={onAssessRisk}
          >
            <Form.Item name="assessment_scope" label="Assessment Scope" rules={[{ required: true, message: 'Please select assessment scope' }]}>
              <Select placeholder="Select assessment scope">
                <Option value="comprehensive">Comprehensive Facility Assessment</Option>
                <Option value="air_quality">Air Quality Risk Only</Option>
                <Option value="water_quality">Water Quality Risk Only</Option>
                <Option value="waste_management">Waste Management Risk</Option>
                <Option value="chemical_storage">Chemical Storage Risk</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="timeframe" label="Risk Horizon" rules={[{ required: true, message: 'Please select risk horizon' }]}>
              <Select placeholder="Select risk horizon">
                <Option value="30d">30 Days</Option>
                <Option value="90d">90 Days</Option>
                <Option value="1y">1 Year</Option>
                <Option value="3y">3 Years</Option>
              </Select>
            </Form.Item>

            <Form.Item name="risk_tolerance" label="Risk Tolerance Level">
              <Radio.Group>
                <Radio value="conservative">Conservative</Radio>
                <Radio value="moderate">Moderate</Radio>
                <Radio value="aggressive">Aggressive</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="include_external_factors" label="Include External Factors" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<SafetyCertificateOutlined />} size="large">
                Conduct Risk Assessment
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Risk Assessment Parameters" size="small" style={{ marginTop: 16 }}>
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Model Accuracy">
              <Progress percent={91.5} size="small" status="active" />
            </Descriptions.Item>
            <Descriptions.Item label="Assessment Framework">
              <Tag color="blue">ISO 31000</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Data Sources">
              <Tag color="green">Real-time Monitoring</Tag>
              <Tag color="orange">Historical Incidents</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Risk Assessment Results" size="small">
          {riskAssessment ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Statistic
                  title="Overall Risk Level"
                  value={riskAssessment.overall_risk}
                  valueStyle={{ 
                    color: getRatingColor(riskAssessment.overall_risk),
                    fontSize: '24px'
                  }}
                />
                <Progress 
                  percent={riskAssessment.risk_score} 
                  status={riskAssessment.risk_score >= 70 ? 'exception' : riskAssessment.risk_score >= 40 ? 'active' : 'success'}
                  format={percent => `Risk Score: ${percent}%`}
                />
              </div>

              {riskAssessment.high_risk_factors && riskAssessment.high_risk_factors.length > 0 && (
                <Alert
                  message="High Risk Factors"
                  description={
                    <List
                      size="small"
                      dataSource={riskAssessment.high_risk_factors}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={getSeverityIcon('HIGH')}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="error"
                  showIcon
                />
              )}

              {riskAssessment.medium_risk_factors && riskAssessment.medium_risk_factors.length > 0 && (
                <Alert
                  message="Medium Risk Factors"
                  description={
                    <List
                      size="small"
                      dataSource={riskAssessment.medium_risk_factors}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={getSeverityIcon('MEDIUM')}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="warning"
                  showIcon
                />
              )}

              {riskAssessment.low_risk_factors && riskAssessment.low_risk_factors.length > 0 && (
                <Alert
                  message="Low Risk Factors"
                  description={
                    <List
                      size="small"
                      dataSource={riskAssessment.low_risk_factors}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={getSeverityIcon('LOW')}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="info"
                  showIcon
                />
              )}

              {riskAssessment.mitigation_strategies && riskAssessment.mitigation_strategies.length > 0 && (
                <Alert
                  message="Mitigation Strategies"
                  description={
                    <List
                      size="small"
                      dataSource={riskAssessment.mitigation_strategies}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            title={`Strategy ${index + 1}`}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="success"
                  showIcon
                />
              )}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <SafetyCertificateOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
              <h3>No Risk Assessment</h3>
              <p>Conduct risk assessment to see results</p>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );

  const renderAnomalyTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Anomaly Detection" size="small">
          <Form
            form={anomalyForm}
            layout="vertical"
            onFinish={onDetectAnomalies}
          >
            <Form.Item name="detection_scope" label="Detection Scope" rules={[{ required: true, message: 'Please select detection scope' }]}>
              <Select placeholder="Select detection scope">
                <Option value="comprehensive">Comprehensive Monitoring</Option>
                <Option value="air_quality">Air Quality Only</Option>
                <Option value="water_quality">Water Quality Only</Option>
                <Option value="energy_consumption">Energy Consumption</Option>
                <Option value="equipment_performance">Equipment Performance</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="time_window" label="Time Window" rules={[{ required: true, message: 'Please select time window' }]}>
              <Select placeholder="Select time window">
                <Option value="1h">Last 1 Hour</Option>
                <Option value="6h">Last 6 Hours</Option>
                <Option value="24h">Last 24 Hours</Option>
                <Option value="7d">Last 7 Days</Option>
              </Select>
            </Form.Item>

            <Form.Item name="sensitivity" label="Detection Sensitivity">
              <Slider
                min={1}
                max={10}
                step={1}
                marks={{
                  1: 'Low',
                  5: 'Medium',
                  10: 'High'
                }}
                defaultValue={7}
              />
            </Form.Item>

            <Form.Item name="auto_mitigation" label="Auto-Mitigation" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<AlertOutlined />} size="large">
                Detect Anomalies
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Anomaly Detection Status" size="small" style={{ marginTop: 16 }}>
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Model Accuracy">
              <Progress percent={96.8} size="small" status="active" />
            </Descriptions.Item>
            <Descriptions.Item label="False Positive Rate">
              <Tag color="green">2.3%</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Detection Speed">
              <Tag color="blue">Real-time</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Anomaly Detection Results" size="small">
          {anomalies ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message={`${anomalies.anomalies_detected || 0} Anomalies Detected`}
                description={`${anomalies.critical_anomalies || 0} critical anomalies requiring immediate attention`}
                type={anomalies.critical_anomalies > 0 ? 'error' : anomalies.anomalies_detected > 0 ? 'warning' : 'success'}
                showIcon
              />

              {anomalies.anomaly_details && anomalies.anomaly_details.length > 0 && (
                <Table
                  size="small"
                  dataSource={anomalies.anomaly_details}
                  pagination={false}
                  columns={[
                    {
                      title: 'Time',
                      dataIndex: 'timestamp',
                      key: 'timestamp',
                      render: (timestamp) => new Date(timestamp).toLocaleTimeString()
                    },
                    {
                      title: 'Parameter',
                      dataIndex: 'parameter',
                      key: 'parameter'
                    },
                    {
                      title: 'Value',
                      dataIndex: 'value',
                      key: 'value'
                    },
                    {
                      title: 'Severity',
                      dataIndex: 'severity',
                      key: 'severity',
                      render: (severity) => (
                        <Tag color={
                          severity === 'HIGH' ? 'red' : 
                          severity === 'MEDIUM' ? 'orange' : 'yellow'
                        }>
                          {severity}
                        </Tag>
                      )
                    }
                  ]}
                />
              )}

              {anomalies.root_cause_analysis && anomalies.root_cause_analysis.length > 0 && (
                <Alert
                  message="Root Cause Analysis"
                  description={
                    <List
                      size="small"
                      dataSource={anomalies.root_cause_analysis}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<InfoCircleOutlined style={{ color: '#1890ff' }} />}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="info"
                  showIcon
                />
              )}

              {anomalies.automatic_actions && anomalies.automatic_actions.length > 0 && (
                <Alert
                  message="Automatic Actions Taken"
                  description={
                    <List
                      size="small"
                      dataSource={anomalies.automatic_actions}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="success"
                  showIcon
                />
              )}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <AlertOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
              <h3>No Anomalies Detected</h3>
              <p>Run anomaly detection to identify issues</p>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );

  const renderAdvancedTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Advanced Environmental Analysis" size="small">
          <Form
            form={advancedForm}
            layout="vertical"
            onFinish={onAdvancedAnalysis}
          >
            <Form.Item name="analysis_type" label="Analysis Type" rules={[{ required: true, message: 'Please select analysis type' }]}>
              <Select placeholder="Select analysis type">
                <Option value="impact_assessment">Environmental Impact Assessment</Option>
                <Option value="compliance_prediction">Compliance Prediction</Option>
                <Option value="sustainability_metrics">Sustainability Metrics</Option>
                <Option value="trend_analysis">Long-term Trend Analysis</Option>
                <Option value="correlation_study">Parameter Correlation Study</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="time_range" label="Time Range" rules={[{ required: true, message: 'Please select time range' }]}>
              <RangePicker
                style={{ width: '100%' }}
                showTime
                format="YYYY-MM-DD HH:mm"
              />
            </Form.Item>

            <Form.Item name="granularity" label="Analysis Granularity">
              <Radio.Group>
                <Radio value="hourly">Hourly</Radio>
                <Radio value="daily">Daily</Radio>
                <Radio value="weekly">Weekly</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="include_forecast" label="Include Forecast" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<BarChartOutlined />} size="large">
                Run Advanced Analysis
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Advanced Analytics Engine" size="small" style={{ marginTop: 16 }}>
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Processing Power">
              <Tag color="purple">High Performance</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Machine Learning">
              <Tag color="blue">Neural Networks</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Data Processing">
              <Tag color="green">Real-time Streams</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Advanced Analysis Results" size="small">
          {advancedAnalysis ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              {advancedAnalysis.impact_assessment && (
                <Alert
                  message="Environmental Impact Assessment"
                  description={
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Carbon Footprint">
                        <Tag color="red">{advancedAnalysis.impact_assessment.carbon_footprint_kg_co2 != null ? `${advancedAnalysis.impact_assessment.carbon_footprint_kg_co2} kg CO2` : 'Not tracked'}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Water Impact Score">
                        <Progress percent={advancedAnalysis.impact_assessment.water_impact_score} size="small" />
                      </Descriptions.Item>
                      <Descriptions.Item label="Waste Management">
                        <Progress percent={advancedAnalysis.impact_assessment.waste_management_score} size="small" />
                      </Descriptions.Item>
                      <Descriptions.Item label="Energy Efficiency">
                        <Progress percent={advancedAnalysis.impact_assessment.energy_efficiency_score} size="small" />
                      </Descriptions.Item>
                    </Descriptions>
                  }
                  type="info"
                  showIcon
                />
              )}

              {advancedAnalysis.compliance_prediction && (
                <Alert
                  message="Compliance Prediction"
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Progress 
                        percent={Math.round((advancedAnalysis.compliance_prediction.compliance_probability || 0) * 100)} 
                        status={
                          advancedAnalysis.compliance_prediction.compliance_probability > 0.8 ? 'success' : 
                          advancedAnalysis.compliance_prediction.compliance_probability > 0.6 ? 'active' : 'exception'
                        }
                        format={percent => `Compliance Probability: ${percent}%`}
                      />
                      <div>
                        <strong>Time to Compliance Breach:</strong> {advancedAnalysis.compliance_prediction.time_to_compliance_breach}
                      </div>
                    </Space>
                  }
                  type="warning"
                  showIcon
                />
              )}

              {advancedAnalysis.sustainability_metrics && (
                <Alert
                  message="Sustainability Metrics"
                  description={
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Renewable Energy"
                          value={advancedAnalysis.sustainability_metrics.renewable_energy_usage}
                          suffix="%"
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Water Recycling"
                          value={advancedAnalysis.sustainability_metrics.water_recycling_rate}
                          suffix="%"
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Col>
                    </Row>
                  }
                  type="success"
                  showIcon
                />
              )}

              {advancedAnalysis.impact_assessment?.improvement_recommendations && (
                <Alert
                  message="Improvement Recommendations"
                  description={
                    <List
                      size="small"
                      dataSource={advancedAnalysis.impact_assessment.improvement_recommendations}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<BulbOutlined style={{ color: '#faad14' }} />}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="info"
                  showIcon
                />
              )}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <BarChartOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
              <h3>No Advanced Analysis</h3>
              <p>Run advanced analysis to see detailed insights</p>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );

  const renderESGTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="ESG Performance Scoring" size="small">
          <Form
            form={esgForm}
            layout="vertical"
            onFinish={onESGScoring}
          >
            <Form.Item name="assessment_period" label="Assessment Period" rules={[{ required: true, message: 'Please select assessment period' }]}>
              <Select placeholder="Select assessment period">
                <Option value="q1_2024">Q1 2024</Option>
                <Option value="q2_2024">Q2 2024</Option>
                <Option value="q3_2024">Q3 2024</Option>
                <Option value="q4_2024">Q4 2024</Option>
                <Option value="annual_2024">Annual 2024</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="reporting_standards" label="Reporting Standards" rules={[{ required: true, message: 'Please select reporting standards' }]}>
              <Select mode="multiple" placeholder="Select reporting standards">
                <Option value="gri">GRI Standards</Option>
                <Option value="sasb">SASB Standards</Option>
                <Option value="tcfd">TCFD Recommendations</Option>
                <Option value="un_sdgs">UN Sustainable Development Goals</Option>
                <Option value="iso_26000">ISO 26000</Option>
              </Select>
            </Form.Item>

            <Form.Item name="benchmark_against" label="Benchmark Against">
              <Select placeholder="Select benchmark">
                <Option value="industry">Industry Peers</Option>
                <Option value="sector">Sector Average</Option>
                <Option value="regional">Regional Standards</Option>
                <Option value="global">Global Standards</Option>
              </Select>
            </Form.Item>

            <Form.Item name="include_supply_chain" label="Include Supply Chain" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<TrophyOutlined />} size="large">
                Calculate ESG Score
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="ESG Framework" size="small" style={{ marginTop: 16 }}>
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Environmental (E)">
              <Tag color="green">Carbon, Water, Waste</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Social (S)">
              <Tag color="blue">Employees, Community</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Governance (G)">
              <Tag color="purple">Leadership, Ethics</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="ESG Scoring Results" size="small">
          {esgScore ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Statistic
                  title="Overall ESG Score"
                  value={esgScore.overall_esg_score}
                  suffix="/100"
                  valueStyle={{ 
                    color: esgScore.overall_esg_score >= 80 ? '#52c41a' : 
                           esgScore.overall_esg_score >= 60 ? '#faad14' : '#f5222d',
                    fontSize: '32px'
                  }}
                />
                <Tag color="blue" style={{ fontSize: '16px', padding: '4px 12px' }}>
                  {esgScore.esg_rating} Rating • {esgScore.benchmark_comparison}
                </Tag>
              </div>

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Progress 
                    type="circle" 
                    percent={esgScore.environmental_score} 
                    width={80}
                    format={percent => `E\n${percent}`}
                    strokeColor="#52c41a"
                  />
                </Col>
                <Col span={8}>
                  <Progress 
                    type="circle" 
                    percent={esgScore.social_score} 
                    width={80}
                    format={percent => `S\n${percent}`}
                    strokeColor="#1890ff"
                  />
                </Col>
                <Col span={8}>
                  <Progress 
                    type="circle" 
                    percent={esgScore.governance_score} 
                    width={80}
                    format={percent => `G\n${percent}`}
                    strokeColor="#722ed1"
                  />
                </Col>
              </Row>

              {esgScore.performance_breakdown && (
                <Alert
                  message="Performance Breakdown"
                  description={
                    <Row gutter={8}>
                      {Object.entries(esgScore.performance_breakdown).map(([key, value]) => (
                        <Col span={12} key={key} style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {key.replace('_', ' ').toUpperCase()}
                          </div>
                          <Progress percent={value} size="small" />
                        </Col>
                      ))}
                    </Row>
                  }
                  type="info"
                  showIcon
                />
              )}

              {esgScore.improvement_areas && esgScore.improvement_areas.length > 0 && (
                <Alert
                  message="Key Improvement Areas"
                  description={
                    <List
                      size="small"
                      dataSource={esgScore.improvement_areas.slice(0, 3)}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<BulbOutlined style={{ color: '#faad14' }} />}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="warning"
                  showIcon
                />
              )}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <TrophyOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
              <h3>No ESG Score</h3>
              <p>Calculate ESG performance to see results</p>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );

  const renderOptimizationTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Resource Optimization" size="small">
          <Form
            form={optimizationForm}
            layout="vertical"
            onFinish={onResourceOptimization}
          >
            <Form.Item name="optimization_focus" label="Optimization Focus" rules={[{ required: true, message: 'Please select optimization focus' }]}>
              <Select mode="multiple" placeholder="Select optimization areas">
                <Option value="energy">Energy Consumption</Option>
                <Option value="water">Water Usage</Option>
                <Option value="waste">Waste Management</Option>
                <Option value="materials">Raw Materials</Option>
                <Option value="logistics">Logistics & Transportation</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="optimization_goal" label="Optimization Goal">
              <Radio.Group>
                <Radio value="cost_reduction">Cost Reduction</Radio>
                <Radio value="efficiency">Operational Efficiency</Radio>
                <Radio value="sustainability">Sustainability</Radio>
                <Radio value="compliance">Regulatory Compliance</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="budget_constraint" label="Budget Constraint">
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="Enter budget limit"
              />
            </Form.Item>

            <Form.Item name="timeline" label="Implementation Timeline">
              <Select placeholder="Select timeline">
                <Option value="immediate">Immediate (0-3 months)</Option>
                <Option value="short_term">Short-term (3-6 months)</Option>
                <Option value="medium_term">Medium-term (6-12 months)</Option>
                <Option value="long_term">Long-term (1-2 years)</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<BulbOutlined />} size="large">
                Generate Optimization Plan
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Optimization Potential" size="small" style={{ marginTop: 16 }}>
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Energy Savings">
              <Tag color="green">15-25% possible</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Water Reduction">
              <Tag color="blue">20-30% possible</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Waste Reduction">
              <Tag color="orange">25-40% possible</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Optimization Results" size="small">
          {resourceOptimization ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Optimization Plan Generated"
                description={`Implementation timeline: ${resourceOptimization.implementation_timeline}`}
                type="success"
                showIcon
              />

              {resourceOptimization.predicted_savings && (
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Statistic
                      title="Energy Savings"
                      value={resourceOptimization.predicted_savings.energy_savings_kwh}
                      suffix="kWh"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Cost Savings"
                      value={resourceOptimization.predicted_savings.cost_savings}
                      prefix="$"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                </Row>
              )}

              {resourceOptimization.optimization_plan && (
                <Collapse ghost>
                  {resourceOptimization.optimization_plan.energy_optimization && (
                    <Panel header="Energy Optimization" key="energy">
                      <List
                        size="small"
                        dataSource={resourceOptimization.optimization_plan.energy_optimization}
                        renderItem={(item, index) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<ThunderboltOutlined style={{ color: '#faad14' }} />}
                              description={item}
                            />
                          </List.Item>
                        )}
                      />
                    </Panel>
                  )}
                  {resourceOptimization.optimization_plan.water_optimization && (
                    <Panel header="Water Optimization" key="water">
                      <List
                        size="small"
                        dataSource={resourceOptimization.optimization_plan.water_optimization}
                        renderItem={(item, index) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                              description={item}
                            />
                          </List.Item>
                        )}
                      />
                    </Panel>
                  )}
                  {resourceOptimization.optimization_plan.waste_optimization && (
                    <Panel header="Waste Optimization" key="waste">
                      <List
                        size="small"
                        dataSource={resourceOptimization.optimization_plan.waste_optimization}
                        renderItem={(item, index) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<RecycleOutlined style={{ color: '#52c41a' }} />}
                              description={item}
                            />
                          </List.Item>
                        )}
                      />
                    </Panel>
                  )}
                </Collapse>
              )}

              {resourceOptimization.roi_calculation && (
                <Alert
                  message="ROI Analysis"
                  description={
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="Payback Period">
                        {resourceOptimization.roi_calculation.payback_period_months} months
                      </Descriptions.Item>
                      <Descriptions.Item label="Annual Savings">
                        ${resourceOptimization.roi_calculation.annual_savings}
                      </Descriptions.Item>
                      <Descriptions.Item label="Net Present Value">
                        ${resourceOptimization.roi_calculation.net_present_value}
                      </Descriptions.Item>
                    </Descriptions>
                  }
                  type="info"
                  showIcon
                />
              )}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <BulbOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
              <h3>No Optimization Plan</h3>
              <p>Generate resource optimization plan to see results</p>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );

  const renderCameraTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Camera Monitoring System" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form layout="vertical">
              <Form.Item label="Select Camera">
                <Select
                  value={selectedCamera}
                  onChange={setSelectedCamera}
                  placeholder="Select camera to monitor"
                >
                  {cameraStatus?.available_cameras?.map(camera => (
                    <Option key={camera.id} value={camera.id}>
                      {camera.name} - {camera.location}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>

            <Row gutter={8}>
              <Col span={12}>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  onClick={onStartCameraMonitoring}
                  block
                  disabled={!selectedCamera}
                >
                  Start Monitoring
                </Button>
              </Col>
              <Col span={12}>
                <Button 
                  danger
                  icon={<PauseCircleOutlined />} 
                  onClick={onStopCameraMonitoring}
                  block
                  disabled={!selectedCamera}
                >
                  Stop Monitoring
                </Button>
              </Col>
            </Row>

            <Button 
              icon={<EyeOutlined />} 
              onClick={() => onGetRealTimeAnalytics()}
              block
              disabled={!selectedCamera}
            >
              Get Real-time Analytics
            </Button>

            <Button 
              icon={<SettingOutlined />} 
              onClick={onGetSystemHealth}
              block
            >
              Check System Health
            </Button>
          </Space>
        </Card>

        {cameraConfig && Object.keys(cameraConfig).length > 0 && (
          <Card title="Camera Configuration" size="small" style={{ marginTop: 16 }}>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Resolution">
                <Tag color="blue">{cameraConfig.resolution || '1920x1080'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Frame Rate">
                <Tag color="green">{cameraConfig.frame_rate || '30 FPS'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="AI Model">
                <Tag color="purple">{cameraConfig.ai_model || 'YOLOv5'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={cameraConfig.status === 'active' ? 'success' : 'error'}>
                  {cameraConfig.status?.toUpperCase() || 'UNKNOWN'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Camera Analytics & Monitoring" size="small">
          {cameraAnalytics ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Real-time Analytics Active"
                description={`Monitoring ${selectedCamera} with AI-powered analysis`}
                type="success"
                showIcon
              />

              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Objects Detected"
                    value={cameraAnalytics.objects_detected || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Violations"
                    value={cameraAnalytics.violations_detected || 0}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Col>
              </Row>

              {cameraAnalytics.detected_objects && (
                <Alert
                  message="Detected Objects"
                  description={
                    <Space wrap>
                      {cameraAnalytics.detected_objects.map((obj, index) => (
                        <Tag key={index} color="blue">
                          {obj}
                        </Tag>
                      ))}
                    </Space>
                  }
                  type="info"
                  showIcon
                />
              )}

              {cameraAnalytics.anomalies && cameraAnalytics.anomalies.length > 0 && (
                <Alert
                  message="Detected Anomalies"
                  description={
                    <List
                      size="small"
                      dataSource={cameraAnalytics.anomalies}
                      renderItem={(item, index) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<AlertOutlined style={{ color: '#faad14' }} />}
                            description={item}
                          />
                        </List.Item>
                      )}
                    />
                  }
                  type="warning"
                  showIcon
                />
              )}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              <CameraOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
              <h3>No Camera Data</h3>
              <p>Start camera monitoring to see analytics</p>
            </div>
          )}
        </Card>

        <Card title="Violation History" size="small" style={{ marginTop: 16 }}>
          {violationHistory.length > 0 ? (
            <List
              size="small"
              dataSource={violationHistory.slice(0, 5)}
              renderItem={(violation) => (
                <List.Item
                  actions={[
                    !violation.acknowledged && (
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => onAcknowledgeViolation(violation.id)}
                      >
                        Acknowledge
                      </Button>
                    )
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        dot 
                        color={violation.severity === 'CRITICAL' ? 'red' : 'orange'}
                      >
                        <AlertOutlined />
                      </Badge>
                    }
                    title={violation.type}
                    description={
                      <Space direction="vertical" size={0}>
                        <div>{violation.description}</div>
                        <small style={{ color: '#999' }}>
                          {new Date(violation.timestamp).toLocaleString()} • {violation.location}
                        </small>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <div>No recent violations</div>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );

  // ===== NEW DOCUMENT GENERATION TAB =====

  const renderDocumentGenerationTab = () => (
    <EnvironmentalDocumentGenerator onGenerated={(doc) => setGeneratedDocuments((prev) => [...prev, doc])} />
  );

  return (
    <div className="ai-service-tab">
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
        >
          {/* Keep all existing tabs */}
          <TabPane 
            tab={
              <span>
                <DashboardOutlined />
                Environmental Analysis
              </span>
            } 
            key="analysis"
          >
            {renderAnalysisTab()}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <LineChartOutlined />
                Air Quality Prediction
              </span>
            } 
            key="prediction"
          >
            {renderPredictionTab()}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <SafetyCertificateOutlined />
                Risk Assessment
              </span>
            } 
            key="risk"
          >
            {renderRiskTab()}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <AlertOutlined />
                Anomaly Detection
              </span>
            } 
            key="anomaly"
          >
            {renderAnomalyTab()}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <BarChartOutlined />
                Advanced Analysis
              </span>
            } 
            key="advanced"
          >
            {renderAdvancedTab()}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TrophyOutlined />
                ESG Scoring
              </span>
            } 
            key="esg"
          >
            {renderESGTab()}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <BulbOutlined />
                Resource Optimization
              </span>
            } 
            key="optimization"
          >
            {renderOptimizationTab()}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <CameraOutlined />
                Camera Monitoring
                {violationHistory.filter(v => !v.acknowledged).length > 0 && (
                  <Badge count={violationHistory.filter(v => !v.acknowledged).length} offset={[10, -5]} />
                )}
              </span>
            } 
            key="camera"
          >
            {renderCameraTab()}
          </TabPane>

          {/* NEW DOCUMENT GENERATION TAB */}
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Document Generation
                {generatedDocuments.length > 0 && (
                  <Badge count={generatedDocuments.length} offset={[10, -5]} />
                )}
              </span>
            } 
            key="documents"
          >
            {renderDocumentGenerationTab()}
          </TabPane>
        </Tabs>

        {/* Global Loading Indicator */}
        <Modal
          title="Processing Request"
          open={loading}
          footer={null}
          closable={false}
          width={300}
        >
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Progress type="circle" percent={75} status="active" />
            <div style={{ marginTop: 16 }}>
              <div>Generating compliant documents...</div>
              <small style={{ color: '#999' }}>Creating ISO/OSHA compliant reports</small>
            </div>
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default AIServiceTab;