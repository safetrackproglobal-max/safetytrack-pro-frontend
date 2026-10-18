import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Alert,
  Row,
  Col,
  Statistic,
  List,
  Tag,
  Space,
  Modal,
  message,
  Spin,
  Progress,
  Tooltip,
  Select,
  Tabs,
  Badge,
  Divider,
  Collapse,
  notification
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CameraOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ExportOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  MobileOutlined,
  VideoCameraOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  FireOutlined,
  RobotOutlined,
  FileTextOutlined,
  BugOutlined
} from '@ant-design/icons';
import io from 'socket.io-client';
import environmentalAIService from '../services/environmentalAIService';
import VideoAnalysisPanel from '../components/AI/VideoAi';
import './EnvironmentalCameraMonitoringPage.css';

const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// ✅ Production backend URL
const BACKEND_URL = 'https://safetrackproglobal-backend-production.up.railway.app';

// Camera Controls Component
const CameraControls = ({
  cameras,
  selectedCamera,
  onCameraChange,
  isMonitoring,
  onStartMonitoring,
  onStopMonitoring,
  loading,
  socketConnected,
  analysisType,
  onAnalysisTypeChange,
  analysisTypes,
  cameraType
}) => (
  <Row gutter={[16, 16]} align="middle">
    <Col xs={24} md={8}>
      <Select
        style={{ width: '100%' }}
        placeholder={`Select ${cameraType === 'device' ? 'Device Camera' : 'CCTV Feed'}`}
        value={selectedCamera}
        onChange={onCameraChange}
        disabled={isMonitoring}
      >
        {cameras.map(camera => (
          <Option key={camera.id} value={camera.id}>
            <Space>
              <Tag color={camera.status === 'online' || camera.status === 'available' ? 'green' : 'red'}>
                {camera.status}
              </Tag>
              {camera.name}
              {camera.supports_webrtc && <Badge dot color="blue" />}
            </Space>
          </Option>
        ))}
      </Select>
    </Col>

    <Col xs={24} md={8}>
      <Select
        style={{ width: '100%' }}
        placeholder="Analysis Type"
        value={analysisType}
        onChange={onAnalysisTypeChange}
        disabled={isMonitoring}
      >
        {analysisTypes.map(type => (
          <Option key={type.value} value={type.value}>
            <Space>
              {type.icon}
              {type.label}
            </Space>
          </Option>
        ))}
      </Select>
    </Col>

    <Col xs={24} md={8}>
      <Space>
        {!isMonitoring ? (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={onStartMonitoring}
            disabled={!selectedCamera || (cameraType === 'cctv' && !socketConnected)}
            loading={loading}
            size="large"
          >
            Start {cameraType === 'device' ? 'Device Camera' : 'CCTV'} Monitoring
          </Button>
        ) : (
          <Button
            danger
            icon={<PauseCircleOutlined />}
            onClick={onStopMonitoring}
            loading={loading}
            size="large"
          >
            Stop Monitoring
          </Button>
        )}
      </Space>
    </Col>
  </Row>
);

// Multi-domain risk dashboard
const MultiDomainRiskDashboard = ({ analysis }) => {
  const calculatePPECompliance = (analysis) => {
    if (!analysis || !analysis.objects_detected) return 100;
    const totalObjects = analysis.objects_detected;
    const violations = analysis.ppe_violations || 0;
    return Math.max(0, Math.round(((totalObjects - violations) / totalObjects) * 100));
  };

  const getComplianceColor = (compliance) => {
    if (compliance >= 90) return '#52c41a';
    if (compliance >= 70) return '#faad14';
    return '#f5222d';
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return '#f5222d';
      case 'high': return '#fa8c16';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const DomainAnalysis = ({ breakdown }) => (
    <div>
      {breakdown ? (
        <Row gutter={[16, 16]}>
          {Object.entries(breakdown).map(([domain, data]) => (
            <Col span={8} key={domain}>
              <Card size="small" title={domain.toUpperCase()}>
                <Statistic
                  title="Risk Score"
                  value={data.risk_score || 0}
                  suffix="/100"
                  valueStyle={{ color: getRiskColor(data.risk_level) }}
                />
                <div style={{ marginTop: 8 }}>
                  <Tag color={data.violations > 0 ? 'red' : 'green'}>
                    {data.violations || 0} Violations
                  </Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          No detailed domain analysis available
        </div>
      )}
    </div>
  );

  return (
    <Card title="Comprehensive Safety Dashboard">
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card size="small" title="👷 PPE Safety">
            <Statistic
              title="PPE Compliance"
              value={calculatePPECompliance(analysis)}
              suffix="%"
              valueStyle={{ color: getComplianceColor(calculatePPECompliance(analysis)) }}
            />
            {analysis.ppe_violations > 0 && (
              <Alert message={`${analysis.ppe_violations} PPE violations`} type="warning" />
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card size="small" title="🔥 Fire Safety">
            <Statistic
              title="Fire Risk"
              value={analysis.fire_risk_score || 0}
              suffix="/100"
              valueStyle={{ color: getRiskColor(analysis.fire_risk_level) }}
            />
            {analysis.fire_detections > 0 && (
              <Alert message="Fire hazards detected!" type="error" />
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card size="small" title="🌿 Environmental">
            <Statistic
              title="Environmental Risk"
              value={analysis.environmental_risk_score || 0}
              suffix="/100"
              valueStyle={{ color: getRiskColor(analysis.environmental_risk_level) }}
            />
            {analysis.environmental_violations > 0 && (
              <Alert message="Environmental issues detected" type="warning" />
            )}
          </Card>
        </Col>
      </Row>

      <Collapse style={{ marginTop: 16 }}>
        <Panel header="🔍 Detailed Domain Analysis" key="1">
          <DomainAnalysis breakdown={analysis.domain_breakdown} />
        </Panel>
      </Collapse>
    </Card>
  );
};

const EnvironmentalCameraMonitoringPage = () => {
  const [socket, setSocket] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [videoFrame, setVideoFrame] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [cameraStatus, setCameraStatus] = useState({});
  const [violationHistory, setViolationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedCameraType, setSelectedCameraType] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [cameraConfig, setCameraConfig] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [activeTab, setActiveTab] = useState('device');
  const [analysisType, setAnalysisType] = useState('safety_monitoring');
  const [activeSessions, setActiveSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [fps, setFps] = useState(0);
  const [detectionStats, setDetectionStats] = useState({
    framesProcessed: 0,
    detections: 0,
    violations: 0,
    lastDetectionTime: null
  });
  const [processedFrame, setProcessedFrame] = useState('');

  const videoRef = useRef(null);
  const localVideoRef = useRef(null);
  const processedVideoRef = useRef(null);
  const streamRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const frameAnalysisActiveRef = useRef(false);
  const isMonitoringRef = useRef(false);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    isMonitoringRef.current = isMonitoring;
  }, [isMonitoring]);

  useEffect(() => {
    const cameras = cameraStatus.available_cameras || [];
    if (cameras.length > 0 && !selectedCamera) {
      const firstCamera = cameras[0];
      setSelectedCamera(firstCamera.id);
      setSelectedCameraType(firstCamera.type);
    }
  }, [cameraStatus.available_cameras, selectedCamera]);

  const stopLocalCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setLocalStream(null);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    initializeSystem();
    return () => {
      if (socket) {
        socket.close();
      }
      stopLocalCamera();
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      frameAnalysisActiveRef.current = false;
      isMonitoringRef.current = false;
      stopRequestedRef.current = false;
    };
  }, []);

  const initializeSystem = async () => {
    try {
      setLoading(true);
      await checkCameraStatus();
      await checkSystemHealth();
      await loadViolationHistory();
      await loadActiveSessions();
      initializeWebSocket();
    } catch (error) {
      console.error('System initialization failed:', error);
      message.error('Failed to initialize camera monitoring system');
    } finally {
      setLoading(false);
    }
  };

  // Frame Analysis Function using setInterval
  const startFrameAnalysis = (sessionId) => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    frameAnalysisActiveRef.current = true;

    analysisIntervalRef.current = setInterval(async () => {
      if (!isMonitoringRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
        return;
      }

      if (!frameAnalysisActiveRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
        return;
      }

      if (!localVideoRef.current) {
        return;
      }

      try {
        const video = localVideoRef.current;

        if (video.paused || video.ended) {
          return;
        }

        if (video.readyState < 2) {
          return;
        }

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        if (width === 0 || height === 0) {
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(video, 0, 0, width, height);

        const frameData = canvas.toDataURL('image/jpeg', 0.7);

        const analysisResponse = await environmentalAIService.analyzeCameraFrameEnhanced(
          frameData,
          sessionId,
          analysisType
        );

        if (analysisResponse && analysisResponse.success) {
          if (isMonitoringRef.current && frameAnalysisActiveRef.current) {
            setAnalysis(analysisResponse.analysis);

            if (analysisResponse.processed_image) {
              setProcessedFrame(analysisResponse.processed_image);
            } else if (analysisResponse.analysis?.processed_image) {
              setProcessedFrame(analysisResponse.analysis.processed_image);
            }

            setDetectionStats(prev => ({
              ...prev,
              framesProcessed: prev.framesProcessed + 1,
              detections: prev.detections + (analysisResponse.analysis?.objects_detected || 0),
              violations: prev.violations + (analysisResponse.analysis?.ppe_violations || 0),
              lastDetectionTime: new Date().toISOString()
            }));

            if (analysisResponse.analysis.ppe_violations > 0) {
              addToViolationHistory({
                id: `violation_${Date.now()}`,
                timestamp: analysisResponse.timestamp || new Date().toISOString(),
                violations: analysisResponse.analysis.violations || [],
                risk_level: analysisResponse.analysis.risk_level,
                risk_score: analysisResponse.analysis.risk_score,
                camera_id: selectedCamera,
                analysis_type: analysisType,
                ai_model: analysisResponse.analysis.analysis_method || 'yolov8_19class_safety',
                acknowledged: false
              });

              notification.warning({
                message: '🚨 Safety Violation Detected',
                description: `${analysisResponse.analysis.ppe_violations} PPE violations found`,
                duration: 5,
              });
            }

            if (analysisResponse.analysis.processing_time_ms) {
              const currentFps = Math.round(1000 / analysisResponse.analysis.processing_time_ms);
              setFps(currentFps);
            }
          }
        }

      } catch (error) {
        console.error('Frame analysis error:', error);
      }
    }, 2000);
  };

    // 1. ✅ UPDATED: Discover cameras natively from the browser
  const checkCameraStatus = async () => {
    try {
      // Request permission first (required to see camera labels like "Logitech C920")
      // We immediately stop the stream so the webcam light doesn't stay on.
      const initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
      initialStream.getTracks().forEach(track => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      const formattedCameras = videoDevices.map((device, index) => ({
        id: device.deviceId,
        name: device.label || `Camera ${index + 1}`,
        type: 'device',
        status: 'available'
      }));

      setCameraStatus({
        success: true,
        available_cameras: formattedCameras
      });

      if (formattedCameras.length > 0) {
        const firstCamera = formattedCameras[0];
        setSelectedCamera(firstCamera.id);
        setSelectedCameraType(firstCamera.type);
        // Optional: You can still call loadCameraConfig if your backend needs to know
        // await loadCameraConfig(firstCamera.id); 
      } else {
        message.warning('No physical cameras found on this device.');
      }

    } catch (error) {
      console.error('Browser camera discovery failed:', error);
      if (error.name === 'NotAllowedError') {
        message.error('Camera permission denied. Please allow access in your browser.');
      } else {
        message.error('Could not detect cameras on this device.');
      }
      
      // Fallback so the UI doesn't break completely
      setCameraStatus({
        success: true,
        available_cameras: [{ id: 'default', name: 'Default Camera', type: 'device', status: 'available' }]
      });
    }
  };

  const initializeWebSocket = () => {
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      // Silent connect
    });

    newSocket.on('disconnect', () => {
      if (isMonitoringRef.current) {
        stopMonitoring();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      message.error('Unable to connect to the monitoring service. Please try again.');
    });

    newSocket.on('video_frame', (data) => {
      setVideoFrame(data.frame);
      if (data.processed_image) {
        setProcessedFrame(data.processed_image);
      }
      setAnalysis(data.analysis);

      if (data.analysis.violations && data.analysis.violations.length > 0) {
        addToViolationHistory({
          timestamp: data.timestamp,
          violations: data.analysis.violations,
          risk_level: data.analysis.risk_level,
          risk_score: data.analysis.risk_score,
          camera_id: data.camera_id
        });
      }
    });

    newSocket.on('monitoring_status', (data) => {
      if (data.status === 'started') {
        setIsMonitoring(true);
      } else if (data.status === 'stopped') {
        if (isMonitoringRef.current) {
          stopMonitoring();
        }
      }
    });

    newSocket.on('frame_analysis', (data) => {
      const socketAnalysis = {
        risk_level: data.ppe_violations > 0 ? 'HIGH' : 'LOW',
        risk_score: data.ppe_violations > 0 ? 65 : 25,
        objects_detected: data.hazards_count || 0,
        ppe_violations: data.ppe_violations || 0,
        detected_classes: data.detected_classes || [],
        analysis_method: 'yolov8_19class_safety',
        processing_time_ms: 150,
        ai_detections: data.hazards_count || 0,
        color_system_enabled: data.color_system || true
      };

      setAnalysis(socketAnalysis);

      setDetectionStats(prev => ({
        ...prev,
        framesProcessed: prev.framesProcessed + 1,
        detections: prev.detections + (data.hazards_count || 0),
        violations: prev.violations + (data.ppe_violations || 0),
        lastDetectionTime: new Date().toISOString()
      }));

      if (data.ppe_violations > 0) {
        addToViolationHistory({
          id: `violation_${Date.now()}`,
          timestamp: data.timestamp || new Date().toISOString(),
          violations: [{
            type: 'ppe_violation',
            severity: 'high',
            confidence: 0.85,
            description: 'PPE violation detected via YOLOv8'
          }],
          risk_level: 'high',
          risk_score: 65,
          camera_id: selectedCamera,
          analysis_type: analysisType,
          ai_model: 'yolov8_19class_safety',
          acknowledged: false
        });

        notification.warning({
          message: '🚨 Safety Violation Detected',
          description: `${data.ppe_violations} PPE violations found`,
          duration: 5,
        });
      }

      if (data.processed_image) {
        setProcessedFrame(data.processed_image);
      }
    });
  };

  const startDeviceCamera = async () => {
    if (!selectedCamera) {
      message.warning('Please select a camera first');
      return;
    }

    try {
      setLoading(true);
      stopRequestedRef.current = false;
      setIsMonitoring(true);
      isMonitoringRef.current = true;
      setProcessedFrame('');

      const response = await environmentalAIService.startDeviceCamera(selectedCamera);

      if (response.success) {
        setCurrentSessionId(response.session_id);

        try {
          await startRealCameraStream();
        } catch (streamError) {
          console.error('Failed to start camera stream:', streamError);
          setIsMonitoring(false);
          isMonitoringRef.current = false;
          setLoading(false);
          return;
        }

        frameAnalysisActiveRef.current = true;

        setTimeout(() => {
          if (isMonitoringRef.current && frameAnalysisActiveRef.current && !stopRequestedRef.current) {
            startFrameAnalysis(response.session_id);
          }
        }, 1000);

      } else {
        message.error('Failed to start device camera: ' + (response.error || 'Unknown error'));
        stopLocalCamera();
        setIsMonitoring(false);
        isMonitoringRef.current = false;
      }
    } catch (error) {
      console.error('Start device camera failed:', error);
      message.error('Failed to start device camera: ' + error.message);
      stopLocalCamera();
      setIsMonitoring(false);
      isMonitoringRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // 2. ✅ UPDATED: Use the specific deviceId from the dropdown
  const startRealCameraStream = async () => {
    try {
      // If selectedCamera contains a real deviceId from the browser, use it explicitly
      const constraints = {
        video: {
          deviceId: selectedCamera && selectedCamera !== 'default' 
            ? { exact: selectedCamera } 
            : undefined,
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          aspectRatio: { ideal: 4 / 3 },
          frameRate: { ideal: 15, max: 30 },
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;

        localVideoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          localVideoRef.current.play().catch(error => {
            console.error('Failed to play video:', error);
          });
        };

        localVideoRef.current.onplaying = () => {
          // Silent
        };

        localVideoRef.current.onerror = (error) => {
          console.error('Video error:', error);
          message.error('Failed to load camera feed');
        };

        localVideoRef.current.style.width = '100%';
        localVideoRef.current.style.height = 'auto';
        localVideoRef.current.style.objectFit = 'contain';
        localVideoRef.current.style.backgroundColor = '#000';
        localVideoRef.current.style.display = processedFrame ? 'none' : 'block';
      }

      streamRef.current = stream;
      setLocalStream(stream);

      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);

      if (error.name === 'NotAllowedError') {
        message.error('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        message.error('Camera not found on your device. Please connect a camera and try again.');
      } else if (error.name === 'NotReadableError') {
        message.error('Camera is already in use by another application.');
      } else {
        message.error(`Camera error: ${error.message}`);
      }

      throw error;
    }
  };

  const startCCTVFeed = async () => {
    if (!selectedCamera) {
      message.warning('Please select a CCTV camera first');
      return;
    }

    try {
      setLoading(true);

      const response = await environmentalAIService.startCCTVFeed(selectedCamera);

      if (response.success) {
        setCurrentSessionId(response.session_id);
        setIsMonitoring(true);
        isMonitoringRef.current = true;
        stopRequestedRef.current = false;

        if (socket && socket.connected) {
          socket.emit('start_monitoring', {
            camera_id: selectedCamera,
            session_id: response.session_id
          });
        }
      } else {
        message.error('Failed to start CCTV: ' + (response.error || 'Invalid response'));
      }
    } catch (error) {
      console.error('Start CCTV failed:', error);
      message.error('Failed to start CCTV monitoring');
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    try {
      setLoading(true);
      stopRequestedRef.current = true;

      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }

      frameAnalysisActiveRef.current = false;

      if (currentSessionId) {
        const response = await environmentalAIService.stopCameraSession(currentSessionId);

        if (response.success) {
          setIsMonitoring(false);
          isMonitoringRef.current = false;
          setVideoFrame('');
          setProcessedFrame('');
          setAnalysis(null);
          setCurrentSessionId('');
          setCameraReady(false);
          setFps(0);

          if (selectedCameraType === 'device') {
            stopLocalCamera();
          }

          setDetectionStats({
            framesProcessed: 0,
            detections: 0,
            violations: 0,
            lastDetectionTime: null
          });

          if (socket) {
            socket.emit('stop_monitoring', { session_id: currentSessionId });
          }
        } else {
          message.error('Failed to stop monitoring: ' + (response.error || 'Invalid response'));
        }
      } else {
        setIsMonitoring(false);
        isMonitoringRef.current = false;
        stopRequestedRef.current = true;
        setVideoFrame('');
        setProcessedFrame('');
        setAnalysis(null);
        setCameraReady(false);
        setFps(0);
        stopLocalCamera();

        setDetectionStats({
          framesProcessed: 0,
          detections: 0,
          violations: 0,
          lastDetectionTime: null
        });
      }
    } catch (error) {
      console.error('Stop monitoring failed:', error);
      message.error('Failed to stop monitoring');
    } finally {
      setLoading(false);
    }
  };

  const checkSystemHealth = async () => {
    try {
      const response = await environmentalAIService.getSystemHealth();

      if (response.success) {
        setSystemHealth(response.health || response);
      }
    } catch (error) {
      console.error('System health check failed:', error);
    }
  };

  const loadViolationHistory = async () => {
    try {
      const response = await environmentalAIService.getViolationHistory({
        limit: 10,
        severity: 'critical,high'
      });

      if (response.success) {
        setViolationHistory(response.violations || []);
      }
    } catch (error) {
      console.error('Failed to load violation history:', error);
      setViolationHistory([]);
    }
  };

  const loadActiveSessions = async () => {
    try {
      const response = await environmentalAIService.getActiveSessions();

      if (response.success) {
        setActiveSessions(response.active_sessions || []);
      }
    } catch (error) {
      console.error('Failed to load active sessions:', error);
      setActiveSessions([]);
    }
  };

  const loadCameraConfig = async (cameraId) => {
    try {
      const response = await environmentalAIService.getCameraConfig(cameraId);

      if (response.success) {
        setCameraConfig(response.config || {});
      }
    } catch (error) {
      console.error('Failed to load camera config:', error);
      setCameraConfig({});
    }
  };

  const addToViolationHistory = (violation) => {
    setViolationHistory(prev => [violation, ...prev.slice(0, 49)]);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return '#f5222d';
      case 'high': return '#fa8c16';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getRiskLevelFromScore = (score) => {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const handleCameraChange = (cameraId) => {
    const allCameras = cameraStatus.available_cameras || cameraStatus.cameras || [];
    const camera = allCameras.find(cam => cam.id === cameraId);
    if (camera) {
      setSelectedCamera(cameraId);
      setSelectedCameraType(camera.type);
      loadCameraConfig(cameraId);

      if (isMonitoring) {
        stopMonitoring();
      }
    }
  };

  const handleAnalysisTypeChange = (type) => {
    setAnalysisType(type);
    if (isMonitoring) {
      stopMonitoring().then(() => {
        if (selectedCameraType === 'device') {
          startDeviceCamera();
        } else {
          startCCTVFeed();
        }
      });
    }
  };

  const refreshSystem = async () => {
    await initializeSystem();
    message.success('System refreshed');
  };

  const analysisTypes = [
    { value: 'safety_monitoring', label: 'Safety Monitoring', icon: <SafetyOutlined /> },
    { value: 'ppe_detection', label: 'PPE Detection', icon: <SafetyCertificateOutlined /> },
    { value: 'environmental_monitoring', label: 'Environmental', icon: <ExperimentOutlined /> },
    { value: 'fire_detection', label: 'Fire Detection', icon: <FireOutlined /> }
  ];

  const allCameras = cameraStatus.available_cameras || cameraStatus.cameras || [];
  const deviceCameras = allCameras.filter(cam => cam.type === 'device');
  const cctvCameras = allCameras.filter(cam => cam.type === 'cctv');

  return (
    <div className="camera-monitoring-page">
      <Spin spinning={loading} tip="Initializing system...">
        <Row gutter={[16, 16]}>
          {/* Header Section */}
          <Col span={24}>
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <CameraOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <h2 style={{ margin: 0 }}>AI Camera Monitoring System</h2>
                    <Tag color={socket && socket.connected ? 'green' : 'red'}>
                      {socket && socket.connected ? 'CONNECTED' : 'DISCONNECTED'}
                    </Tag>
                    {isMonitoring && (
                      <Tag color="green" icon={<EyeOutlined />}>
                        LIVE {selectedCameraType?.toUpperCase()} MONITORING
                      </Tag>
                    )}
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Tooltip title="Refresh System">
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={refreshSystem}
                        disabled={isMonitoring}
                      >
                        Refresh
                      </Button>
                    </Tooltip>
                    <Tooltip title="Camera Settings">
                      <Button
                        icon={<SettingOutlined />}
                        onClick={() => setShowSettings(true)}
                      >
                        Settings
                      </Button>
                    </Tooltip>
                    <Button
                      icon={<ExportOutlined />}
                      onClick={() => {/* export function */}}
                    >
                      Export Report
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Camera Type Tabs */}
          <Col span={24}>
            <Card size="small">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                type="card"
              >
                {/* Device Cameras Tab */}
                <TabPane
                  tab={
                    <span>
                      <MobileOutlined />
                      Device Cameras
                      <Badge count={deviceCameras.length} style={{ marginLeft: 8 }} />
                    </span>
                  }
                  key="device"
                >
                  <CameraControls
                    cameras={deviceCameras}
                    selectedCamera={selectedCamera}
                    onCameraChange={handleCameraChange}
                    isMonitoring={isMonitoring}
                    onStartMonitoring={startDeviceCamera}
                    onStopMonitoring={stopMonitoring}
                    loading={loading}
                    socketConnected={socket?.connected}
                    analysisType={analysisType}
                    onAnalysisTypeChange={handleAnalysisTypeChange}
                    analysisTypes={analysisTypes}
                    cameraType="device"
                  />
                </TabPane>

                {/* CCTV Feeds Tab */}
                <TabPane
                  tab={
                    <span>
                      <VideoCameraOutlined />
                      CCTV Feeds
                      <Badge count={cctvCameras.length} style={{ marginLeft: 8 }} />
                    </span>
                  }
                  key="cctv"
                >
                  <CameraControls
                    cameras={cctvCameras}
                    selectedCamera={selectedCamera}
                    onCameraChange={handleCameraChange}
                    isMonitoring={isMonitoring}
                    onStartMonitoring={startCCTVFeed}
                    onStopMonitoring={stopMonitoring}
                    loading={loading}
                    socketConnected={socket?.connected}
                    analysisType={analysisType}
                    onAnalysisTypeChange={handleAnalysisTypeChange}
                    analysisTypes={analysisTypes}
                    cameraType="cctv"
                  />
                </TabPane>

                {/* Advanced AI Analysis Tab */}
                <TabPane
                  tab={
                    <span>
                      <RobotOutlined />
                      Advanced AI Analysis
                      <Tag color="purple" style={{ marginLeft: 8 }}>New</Tag>
                    </span>
                  }
                  key="video-ai"
                >
                  <div style={{ padding: '16px 0' }}>
                    <Alert
                      message="Advanced Video AI Analysis"
                      description="Upload videos for comprehensive AI analysis with custom prompts and detailed reporting"
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                    <VideoAnalysisPanel />
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </Col>

          {/* Live Camera Feed */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  {selectedCameraType === 'device' ? <MobileOutlined /> : <VideoCameraOutlined />}
                  Live {selectedCameraType === 'device' ? 'Device Camera' : 'CCTV'} Feed
                  {selectedCamera && (
                    <Tag color="blue">
                      {allCameras.find(cam => cam.id === selectedCamera)?.name}
                    </Tag>
                  )}
                  {fps > 0 && (
                    <Tag color="cyan">FPS: {fps}</Tag>
                  )}
                  {analysis?.color_system_enabled && (
                    <Tag color="green" icon={<BugOutlined />}>
                      COLOR SYSTEM ACTIVE
                    </Tag>
                  )}
                </Space>
              }
              extra={
                <Space>
                  {analysis && (
                    <Tag color={getRiskColor(analysis.risk_level)}>
                      {getRiskIcon(analysis.risk_level)} {analysis.risk_level?.toUpperCase()} RISK
                    </Tag>
                  )}
                  {localStream && (
                    <Tag color="green">LIVE STREAM ACTIVE</Tag>
                  )}
                  {detectionStats.framesProcessed > 0 && (
                    <Tag color="blue">Frames: {detectionStats.framesProcessed}</Tag>
                  )}
                </Space>
              }
            >
              <div className="video-container" style={{
                position: 'relative',
                backgroundColor: '#000',
                borderRadius: '8px',
                overflow: 'hidden',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '600px',
                    objectFit: 'contain',
                    backgroundColor: '#000',
                    display: processedFrame ? 'none' : 'block'
                  }}
                  onError={(e) => {
                    console.error('Video error:', e);
                    message.error('Failed to load camera feed');
                  }}
                  onLoadedData={() => {
                    setCameraReady(true);
                  }}
                />

                {processedFrame && (
                  <img
                    ref={processedVideoRef}
                    src={processedFrame}
                    alt="AI Processed Camera Feed with Bounding Boxes"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: 'auto',
                      maxHeight: '600px',
                      objectFit: 'contain',
                      backgroundColor: '#000',
                      display: 'block'
                    }}
                    onError={(e) => {
                      console.error('Processed frame error:', e);
                      setProcessedFrame('');
                    }}
                  />
                )}

                {isMonitoring && frameAnalysisActiveRef.current && !processedFrame && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    <Space>
                      <Spin size="large" />
                      <span>AI Analysis in Progress...</span>
                    </Space>
                  </div>
                )}

                {!processedFrame && videoFrame && activeTab !== 'device' && (
                  <img
                    src={videoFrame}
                    alt="Live Camera Feed"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '600px',
                      objectFit: 'contain',
                      backgroundColor: '#000'
                    }}
                  />
                )}

                {!processedFrame && !videoFrame && (!isMonitoring || activeTab !== 'device') && (
                  <div className="video-placeholder" style={{
                    textAlign: 'center',
                    color: '#fff',
                    padding: '40px',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {activeTab === 'device' ? (
                      <MobileOutlined style={{ fontSize: '64px', color: '#666', marginBottom: '16px' }} />
                    ) : (
                      <VideoCameraOutlined style={{ fontSize: '64px', color: '#666', marginBottom: '16px' }} />
                    )}
                    <p style={{ color: '#999', fontSize: '16px' }}>
                      {!selectedCamera
                        ? `Please select a ${activeTab === 'device' ? 'device camera' : 'CCTV feed'} to start monitoring`
                        : 'Camera feed will appear here when monitoring starts'
                      }
                    </p>
                    {activeTab === 'device' && !isMonitoring && selectedCamera && (
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={startDeviceCamera}
                        size="large"
                      >
                        Start Camera to See Live Feed
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {localStream && (
                <Alert
                  message="Camera Status"
                  description={
                    <Space>
                      <Tag color="green">Stream Active</Tag>
                      <span>Resolution: {localVideoRef.current?.videoWidth || 'Unknown'}x{localVideoRef.current?.videoHeight || 'Unknown'}</span>
                      <span>FPS: {fps || 'Calculating...'}</span>
                      <span>Frames Processed: {detectionStats.framesProcessed}</span>
                      <span>Frame Analysis: {frameAnalysisActiveRef.current ? 'ACTIVE' : 'INACTIVE'}</span>
                      <span>Color System: {analysis?.color_system_enabled ? 'ENABLED' : 'DISABLED'}</span>
                    </Space>
                  }
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}

              {analysis && (
                <div className="analysis-overlay" style={{ marginTop: '16px' }}>
                  <Alert
                    message={`AI ${analysisType.replace('_', ' ').toUpperCase()} Analysis`}
                    description={
                      <Space direction="vertical">
                        <div>Risk Level: {analysis.risk_level} | Score: {analysis.risk_score}</div>
                        <div>Objects: {analysis.objects_detected} | Violations: {analysis.violations_detected}</div>
                        {analysis.ai_detections > 0 && (
                          <div style={{ color: '#ff4d4f' }}>
                            🚨 AI Detections: {analysis.ai_detections} | PPE Violations: {analysis.ppe_violations}
                          </div>
                        )}
                        {analysis.detected_classes && analysis.detected_classes.length > 0 && (
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            <strong>Detected Classes:</strong> {analysis.detected_classes.map((cls, idx) => (
                              <Tag key={idx} color={cls.color ? `rgb(${cls.color[0]},${cls.color[1]},${cls.color[2]})` : 'blue'} style={{ margin: '2px' }}>
                                {cls.class} ({cls.count || 1})
                              </Tag>
                            ))}
                          </div>
                        )}
                        {analysis.color_system_enabled && (
                          <div style={{ fontSize: '12px', color: '#52c41a' }}>
                            🎨 Color System: Active - Objects highlighted with class-specific colors
                          </div>
                        )}
                      </Space>
                    }
                    type={
                      analysis.risk_level === 'CRITICAL' ? 'error' :
                      analysis.risk_level === 'HIGH' ? 'warning' : 'info'
                    }
                    showIcon
                  />

                  {analysis.violations && analysis.violations.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <Alert
                        message="PPE Violations Detected"
                        description={
                          <List
                            size="small"
                            dataSource={analysis.violations.slice(0, 3)}
                            renderItem={(violation, index) => (
                              <List.Item>
                                <Space>
                                  <Tag color="red">VIOLATION</Tag>
                                  <span>{violation.recommendation}</span>
                                  <span>(Confidence: {(violation.confidence * 100).toFixed(1)}%)</span>
                                  {violation.color && (
                                    <div style={{
                                      width: '12px',
                                      height: '12px',
                                      backgroundColor: `rgb(${violation.color[0]},${violation.color[1]},${violation.color[2]})`,
                                      borderRadius: '2px',
                                      marginLeft: '8px'
                                    }} />
                                  )}
                                </Space>
                              </List.Item>
                            )}
                          />
                        }
                        type="error"
                        showIcon
                      />
                    </div>
                  )}
                </div>
              )}

              {analysis && (
                <div style={{ marginTop: '16px' }}>
                  <MultiDomainRiskDashboard analysis={analysis} />
                </div>
              )}
            </Card>
          </Col>

          {/* Analysis Panel */}
          <Col xs={24} lg={8}>
            <Card title="Risk Assessment" size="small" style={{ marginBottom: 16 }}>
              {analysis ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic
                    title="Current Risk Score"
                    value={analysis.risk_score || analysis.confidence_score * 100}
                    suffix="/100"
                    valueStyle={{ color: getRiskColor(analysis.risk_level) }}
                  />
                  <Progress
                    percent={analysis.risk_score || analysis.confidence_score * 100}
                    strokeColor={getRiskColor(analysis.risk_level)}
                    showInfo={false}
                  />
                  <Row gutter={8}>
                    <Col span={12}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                          {analysis.objects_detected}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Objects</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: getRiskColor(analysis.risk_level) }}>
                          {analysis.violations_detected || analysis.violations?.length || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Violations</div>
                      </div>
                    </Col>
                  </Row>
                </Space>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  <SafetyCertificateOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                  <p>Waiting for analysis data...</p>
                </div>
              )}
            </Card>

            <Card title="Quick Actions" size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="dashed"
                  block
                  icon={<RobotOutlined />}
                  onClick={() => setActiveTab('video-ai')}
                >
                  Open Advanced AI Analysis
                </Button>
                <Button
                  block
                  icon={<FileTextOutlined />}
                  onClick={() => {/* export function */}}
                >
                  Generate Report
                </Button>
              </Space>
            </Card>

            <Card title="Active Sessions" size="small" style={{ marginBottom: 16 }}>
              {activeSessions.length > 0 ? (
                <List
                  size="small"
                  dataSource={activeSessions.slice(0, 3)}
                  renderItem={(session) => (
                    <List.Item>
                      <List.Item.Meta
                        title={session.camera_id}
                        description={`${session.type} - ${session.duration_minutes}m`}
                      />
                      <Tag color="green">{session.violations_detected} violations</Tag>
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '10px' }}>
                  No active sessions
                </div>
              )}
            </Card>

            <Card
              title={
                <Space>
                  Recent Violations
                  {violationHistory.length > 0 && (
                    <Tag color="red">{violationHistory.filter(v => !v.acknowledged).length} Unacknowledged</Tag>
                  )}
                </Space>
              }
              size="small"
            >
              {violationHistory.length > 0 ? (
                <List
                  size="small"
                  dataSource={violationHistory.slice(0, 5)}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<AlertOutlined style={{ color: getRiskColor(item.severity) }} />}
                        title={
                          <Space>
                            <span>{item.violations?.[0]?.type || item.analysis_type}</span>
                            <Tag color={getRiskColor(item.severity)} size="small">
                              {item.severity}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <div>{new Date(item.timestamp).toLocaleString()}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {item.violations?.[0]?.description || 'Safety violation detected'}
                            </div>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  No violations detected
                </div>
              )}
            </Card>

            <Card title="Detection Statistics" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="Frames Processed"
                  value={detectionStats.framesProcessed}
                />
                <Statistic
                  title="Total Detections"
                  value={detectionStats.detections}
                />
                <Statistic
                  title="Total Violations"
                  value={detectionStats.violations}
                />
                {detectionStats.lastDetectionTime && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Last: {new Date(detectionStats.lastDetectionTime).toLocaleTimeString()}
                  </div>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default EnvironmentalCameraMonitoringPage;
