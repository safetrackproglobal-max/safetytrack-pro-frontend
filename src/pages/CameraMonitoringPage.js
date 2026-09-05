// src/pages/CameraMonitoringPage.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Select, 
  Tabs, 
  Alert, 
  Spin, 
  Progress,
  Tag,
  Modal,
  Upload,
  List,
  Badge,
  Switch,
  Statistic,
  Space,
  Tooltip,
  message
} from 'antd';
import { 
  CameraOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  FireOutlined,
  WarningOutlined,
  CloudUploadOutlined,
  EyeOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  SecurityScanOutlined,
  RobotOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import VideoAnalysisPanel from '../components/AI/VideoAi'; // Import the VideoAI component
import './CameraMonitoringPage.css';

const { Option } = Select;
const { TabPane } = Tabs;
const { Dragger } = Upload;

function CameraMonitoringPage() {
  const [activeTab, setActiveTab] = useState('live-monitoring');
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [violations, setViolations] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const videoRef = useRef(null);
  const history = useHistory();

  // Mock camera feeds
  const [cameraFeeds] = useState([
    {
      id: 1,
      name: 'Main Entrance',
      location: 'Building A - Front Gate',
      status: 'live',
      streamUrl: 'rtsp://camera1.example.com/live',
      industry: 'construction'
    },
    {
      id: 2,
      name: 'Production Floor',
      location: 'Building B - Section 1',
      status: 'live',
      streamUrl: 'rtsp://camera2.example.com/live',
      industry: 'manufacturing'
    },
    {
      id: 3,
      name: 'Chemical Storage',
      location: 'Building C - Storage Area',
      status: 'offline',
      streamUrl: 'rtsp://camera3.example.com/live',
      industry: 'chemical'
    },
    {
      id: 4,
      name: 'Emergency Exit',
      location: 'Building A - Rear Exit',
      status: 'live',
      streamUrl: 'rtsp://camera4.example.com/live',
      industry: 'general'
    }
  ]);

  // Detection types for live monitoring
  const detectionTypes = {
    'risk-assessment': {
      name: 'Risk Assessment',
      description: 'Identify missing safety posters, signages, and compliance issues',
      icon: <SafetyOutlined />,
      color: '#1890ff'
    },
    'safety-violations': {
      name: 'Safety Violations',
      description: 'Detect missing PPE, unsafe behaviors, and safety protocol violations',
      icon: <WarningOutlined />,
      color: '#ff4d4f'
    },
    'chemical-detection': {
      name: 'Chemical Detection',
      description: 'Identify chemical containers, spills, and MSDS compliance',
      icon: <ExperimentOutlined />,
      color: '#52c41a'
    },
    'fire-detection': {
      name: 'Fire Detection',
      description: 'Detect fire, smoke, and fire safety equipment issues',
      icon: <FireOutlined />,
      color: '#fa541c'
    }
  };

  const handleStartMonitoring = async () => {
    if (!selectedCamera) {
      message.error('Please select a camera first');
      return;
    }

    setIsMonitoring(true);
    
    try {
      // Simulate API call
      setTimeout(() => {
        const currentDetection = detectionTypes[activeTab === 'live-monitoring' ? 'risk-assessment' : activeTab];
        if (currentDetection) {
          message.success(`Started ${currentDetection.name} monitoring`);
        }
        simulateViolationDetection();
      }, 1000);
    } catch (error) {
      message.error('Failed to start monitoring');
      setIsMonitoring(false);
    }
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    setViolations([]);
    message.info('Monitoring stopped');
  };

  const simulateViolationDetection = () => {
    const interval = setInterval(() => {
      if (!isMonitoring) {
        clearInterval(interval);
        return;
      }

      const mockViolations = {
        'risk-assessment': [
          { 
            id: Date.now(),
            type: 'missing_safety_signage', 
            confidence: 0.85, 
            location: 'Area A', 
            timestamp: new Date(),
            severity: 'high'
          }
        ],
        'safety-violations': [
          { 
            id: Date.now(),
            type: 'no_helmet', 
            confidence: 0.91, 
            location: 'Production Line', 
            timestamp: new Date(),
            severity: 'critical'
          }
        ],
        'chemical-detection': [
          { 
            id: Date.now(),
            type: 'unlabeled_container', 
            confidence: 0.88, 
            location: 'Storage Room', 
            timestamp: new Date(),
            severity: 'high'
          }
        ],
        'fire-detection': [
          { 
            id: Date.now(),
            type: 'blocked_fire_extinguisher', 
            confidence: 0.81, 
            location: 'Hallway', 
            timestamp: new Date(),
            severity: 'medium'
          }
        ]
      };

      // Use risk-assessment as default for live-monitoring tab
      const detectionKey = activeTab === 'live-monitoring' ? 'risk-assessment' : activeTab;
      const newViolations = mockViolations[detectionKey] || [];
      if (newViolations.length > 0 && Math.random() > 0.7) { // 30% chance of detection
        setViolations(prev => [...newViolations, ...prev].slice(0, 10));
      }
    }, 5000);

    return interval;
  };

  useEffect(() => {
    let interval;
    if (isMonitoring && activeTab !== 'video-ai') {
      interval = simulateViolationDetection();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, activeTab]);

  const handleVideoUpload = async (file) => {
    setUploading(true);
    
    try {
      // Simulate API call
      setTimeout(() => {
        setAnalysisResults({
          violations: [
            {
              type: 'safety_violation_detected',
              confidence: 0.87,
              timestamp: new Date().toISOString(),
              recommendation: 'Review safety protocols in detected area'
            }
          ]
        });
        setUploading(false);
        message.success('Video analysis completed');
      }, 3000);
      
    } catch (error) {
      message.error('Video analysis failed');
      setUploading(false);
    }
    
    return false;
  };

  const uploadProps = {
    name: 'video',
    multiple: false,
    accept: 'video/*',
    beforeUpload: handleVideoUpload,
    showUploadList: false,
  };

  const getViolationColor = (confidence) => {
    if (confidence > 0.8) return 'red';
    if (confidence > 0.6) return 'orange';
    return 'yellow';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': '#ff4d4f',
      'high': '#fa541c',
      'medium': '#fa8c16',
      'low': '#52c41a'
    };
    return colors[severity] || '#d9d9d9';
  };

  // Render Live Monitoring Content
  const renderLiveMonitoring = () => (
    <div className="detection-content">
      <div className="detection-header">
        <h3 style={{ color: '#1890ff' }}>Live Camera Monitoring</h3>
        <p>Real-time safety monitoring across all connected cameras with AI-powered violation detection</p>
      </div>

      <div className="camera-controls">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Select
              placeholder="Select Camera"
              value={selectedCamera}
              onChange={setSelectedCamera}
              style={{ width: '100%' }}
              disabled={isMonitoring}
            >
              {cameraFeeds.map(camera => (
                <Option key={camera.id} value={camera.id}>
                  <div className="camera-option">
                    <span>{camera.name}</span>
                    <Tag color={camera.status === 'live' ? 'green' : 'red'}>
                      {camera.status}
                    </Tag>
                  </div>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={16}>
            <Space>
              <Button
                type="primary"
                icon={isMonitoring ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
                loading={isMonitoring}
              >
                {isMonitoring ? 'Stop Monitoring' : 'Start Live Monitoring'}
              </Button>
              
              <Switch
                checkedChildren="Auto-Save"
                unCheckedChildren="Manual Save"
                defaultChecked
              />
              
              <Button
                icon={<BarChartOutlined />}
                onClick={() => history.push('/analytics')}
              >
                Analytics
              </Button>

              <Button
                type="dashed"
                icon={<RobotOutlined />}
                onClick={() => setActiveTab('video-ai')}
              >
                Advanced AI Analysis
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Video Display Area */}
      <div className="video-display">
        {selectedCamera ? (
          <div className="video-container">
            <div className="video-placeholder">
              <VideoCameraOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              <p>Live Camera Feed: {cameraFeeds.find(cam => cam.id === selectedCamera)?.name}</p>
              {isMonitoring && (
                <div className="monitoring-status">
                  <Spin size="small" />
                  <span>AI Monitoring Active - Real-time Safety Detection</span>
                  <Tag color="green">Live</Tag>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-camera-selected">
            <CameraOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
            <p>Please select a camera to start monitoring</p>
          </div>
        )}
      </div>

      {/* Detection Type Selection for Live Monitoring */}
      <Card title="Detection Modes" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          {Object.entries(detectionTypes).map(([key, config]) => (
            <Col xs={24} sm={12} md={6} key={key}>
              <Card 
                size="small" 
                hoverable
                style={{ 
                  border: `2px solid ${config.color}20`,
                  background: isMonitoring ? `${config.color}10` : 'white'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, color: config.color, marginBottom: 8 }}>
                    {config.icon}
                  </div>
                  <h4 style={{ color: config.color, margin: 0 }}>{config.name}</h4>
                  <p style={{ fontSize: 12, color: '#666', margin: '8px 0 0 0' }}>
                    {config.description}
                  </p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );

  return (
    <div className="camera-monitoring-page">
      <div className="page-header">
        <h1>AI Camera & Video Monitoring</h1>
        <p>Comprehensive safety monitoring with live camera feeds and advanced AI video analysis</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="monitoring-card">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              className="detection-tabs"
              type="card"
            >
              {/* Live Monitoring Tab */}
              <TabPane 
                key="live-monitoring"
                tab={
                  <span>
                    <VideoCameraOutlined />
                    Live Monitoring
                    {isMonitoring && <Tag color="green" style={{ marginLeft: 8 }}>Active</Tag>}
                  </span>
                }
              >
                {renderLiveMonitoring()}
              </TabPane>

              {/* Advanced AI Analysis Tab */}
              <TabPane 
                key="video-ai"
                tab={
                  <span>
                    <RobotOutlined />
                    Advanced AI Analysis
                    <Tag color="purple" style={{ marginLeft: 8 }}>New</Tag>
                  </span>
                }
              >
                <VideoAnalysisPanel />
              </TabPane>

              {/* Legacy Detection Tabs (for backward compatibility) */}
              {Object.entries(detectionTypes).map(([key, config]) => (
                <TabPane 
                  key={key}
                  tab={
                    <span style={{ color: config.color }}>
                      {config.icon} {config.name}
                    </span>
                  }
                >
                  <div className="detection-content">
                    <div className="detection-header">
                      <h3 style={{ color: config.color }}>{config.name}</h3>
                      <p>{config.description}</p>
                    </div>

                    <div className="camera-controls">
                      <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} md={8}>
                          <Select
                            placeholder="Select Camera"
                            value={selectedCamera}
                            onChange={setSelectedCamera}
                            style={{ width: '100%' }}
                            disabled={isMonitoring}
                          >
                            {cameraFeeds.map(camera => (
                              <Option key={camera.id} value={camera.id}>
                                <div className="camera-option">
                                  <span>{camera.name}</span>
                                  <Tag color={camera.status === 'live' ? 'green' : 'red'}>
                                    {camera.status}
                                  </Tag>
                                </div>
                              </Option>
                            ))}
                          </Select>
                        </Col>
                        <Col xs={24} md={16}>
                          <Space>
                            <Button
                              type="primary"
                              icon={isMonitoring ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                              onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
                              loading={isMonitoring}
                            >
                              {isMonitoring ? 'Stop Monitoring' : `Start ${config.name}`}
                            </Button>
                            
                            <Button
                              type="dashed"
                              icon={<RobotOutlined />}
                              onClick={() => setActiveTab('video-ai')}
                            >
                              Advanced Analysis
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </div>

                    {/* Video Display Area */}
                    <div className="video-display">
                      {selectedCamera ? (
                        <div className="video-container">
                          <div className="video-placeholder">
                            <VideoCameraOutlined style={{ fontSize: 48, color: config.color }} />
                            <p>Live Camera Feed: {cameraFeeds.find(cam => cam.id === selectedCamera)?.name}</p>
                            {isMonitoring && (
                              <div className="monitoring-status">
                                <Spin size="small" />
                                <span>AI Monitoring Active - {config.name}</span>
                                <Tag color="green">Live</Tag>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="no-camera-selected">
                          <CameraOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                          <p>Please select a camera to start monitoring</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabPane>
              ))}
            </Tabs>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Real-time Violations Panel */}
          <Card 
            title="Real-time Detections" 
            className="violations-panel"
            extra={<Badge count={violations.length} showZero />}
          >
            {violations.length > 0 ? (
              <List
                dataSource={violations}
                renderItem={(violation, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Badge count={index + 1}>
                          <WarningOutlined style={{ color: getViolationColor(violation.confidence) }} />
                        </Badge>
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ textTransform: 'capitalize' }}>
                            {violation.type.replace(/_/g, ' ')}
                          </span>
                          <Tag color={getSeverityColor(violation.severity)}>
                            {violation.severity}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div>Location: {violation.location}</div>
                          <div>Confidence: {(violation.confidence * 100).toFixed(1)}%</div>
                          <div className="violation-time">
                            {violation.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="no-violations">
                <EyeOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
                <p>No violations detected</p>
                <small>Violations will appear here in real-time</small>
              </div>
            )}
          </Card>

          {/* Quick Video Upload Section */}
          <Card title="Quick Video Analysis" className="upload-card">
            <Dragger {...uploadProps} disabled={uploading}>
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">Click or drag video file to upload</p>
              <p className="ant-upload-hint">
                Supports MP4, AVI, MOV. Max 500MB. AI analysis will begin automatically.
              </p>
            </Dragger>

            {uploading && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Spin size="large" />
                <p>Analyzing video with AI...</p>
              </div>
            )}

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Button 
                type="dashed" 
                block 
                icon={<RobotOutlined />}
                onClick={() => setActiveTab('video-ai')}
              >
                Open Advanced AI Analysis
              </Button>
            </div>
          </Card>

          {/* Statistics */}
          <Card title="Monitoring Statistics" className="stats-card">
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Statistic 
                  title="Violations Today" 
                  value={violations.length} 
                  prefix={<WarningOutlined />}
                />
              </Col>
              <Col xs={12}>
                <Statistic 
                  title="Detection Accuracy" 
                  value={95.3} 
                  suffix="%" 
                  prefix={<SecurityScanOutlined />}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={12}>
                <Statistic 
                  title="Active Cameras" 
                  value={cameraFeeds.filter(cam => cam.status === 'live').length} 
                  prefix={<CameraOutlined />}
                />
              </Col>
              <Col xs={12}>
                <Statistic 
                  title="AI Services" 
                  value={4} 
                  prefix={<RobotOutlined />}
                />
              </Col>
            </Row>
            <Progress 
              percent={75} 
              status="active" 
              style={{ marginTop: 16 }}
              format={percent => `System Load: ${percent}%`}
            />
          </Card>
        </Col>
      </Row>

      {/* Analysis Results Modal */}
      <Modal
        title="Video Analysis Results"
        open={!!analysisResults}
        onCancel={() => setAnalysisResults(null)}
        footer={null}
        width={700}
      >
        {analysisResults && (
          <div className="analysis-results">
            <Alert
              message="Analysis Complete"
              description={`Found ${analysisResults.violations?.length || 0} safety concerns`}
              type="info"
              showIcon
            />
            
            {analysisResults.violations?.map((violation, index) => (
              <Card key={index} size="small" style={{ marginTop: 16 }}>
                <Card.Meta
                  avatar={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                  title={violation.type}
                  description={
                    <div>
                      <div>Confidence: {(violation.confidence * 100).toFixed(1)}%</div>
                      <div>Time: {new Date(violation.timestamp).toLocaleString()}</div>
                      {violation.recommendation && (
                        <div>Recommendation: {violation.recommendation}</div>
                      )}
                    </div>
                  }
                />
              </Card>
            ))}

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Button 
                type="primary" 
                icon={<RobotOutlined />}
                onClick={() => {
                  setAnalysisResults(null);
                  setActiveTab('video-ai');
                }}
              >
                Open Advanced Analysis for More Insights
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CameraMonitoringPage;