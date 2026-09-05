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
  Switch,
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
  cameraType,
  debugMode,
  onDebugModeChange
}) => (
  <Row gutter={[16, 16]} align="middle">
    <Col xs={24} md={7}>
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
    
    <Col xs={24} md={7}>
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
    
    <Col xs={24} md={7}>
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

    <Col xs={24} md={3}>
      <Tooltip title="Toggle Debug Mode">
        <Switch 
          checked={debugMode}
          onChange={onDebugModeChange}
          checkedChildren="Debug"
          unCheckedChildren="Debug"
        />
      </Tooltip>
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
        {/* PPE Safety */}
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
        
        {/* Fire Safety */}
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
        
        {/* Environmental */}
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
      
      {/* Detailed Domain Alerts */}
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
  const [debugMode, setDebugMode] = useState(false); // Set to false by default for production
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

  // Sync ref with state
  useEffect(() => {
    isMonitoringRef.current = isMonitoring;
  }, [isMonitoring]);

  // Auto-select camera when cameras become available
  useEffect(() => {
    const cameras = cameraStatus.available_cameras || [];
    if (cameras.length > 0 && !selectedCamera) {
      const firstCamera = cameras[0];
      setSelectedCamera(firstCamera.id);
      setSelectedCameraType(firstCamera.type);
    }
  }, [cameraStatus.available_cameras, selectedCamera]);

  // Stop local camera function
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

  // Initialize system
  const initializeSystem = async () => {
    try {
      setLoading(true);
      
      // Check if backend is running
      const backendHealthy = await checkBackendHealth();
      if (!backendHealthy) {
        message.error('Backend server is not running. Please start the Flask server.');
      }
      // Removed empty success message
      
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

  // Check backend health
  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:5000/');
      const result = await response.json();
      return result.status === 'healthy';
    } catch (error) {
      console.error('Backend not reachable:', error);
      return false;
    }
  };

  // Frame Analysis Function using setInterval
  const startFrameAnalysis = (sessionId) => {
    // Clear any existing interval
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    frameAnalysisActiveRef.current = true;
    
    // Set up interval for frame analysis
    analysisIntervalRef.current = setInterval(async () => {
      
      // SIMPLIFIED CHECK: Only stop if monitoring is false
      if (!isMonitoringRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
        return;
      }
      
      // If frame analysis was explicitly stopped, clear interval
      if (!frameAnalysisActiveRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
        return;
      }
      
      // Check if video ref exists (it should always exist now)
      if (!localVideoRef.current) {
        return;
      }
      
      try {
        const video = localVideoRef.current;
        
        // Check if video is actually playing (not paused or ended)
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
        
        // Create canvas for capturing frames
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, width, height);
        
        // Convert to base64
        const frameData = canvas.toDataURL('image/jpeg', 0.7);
        
        // Send to backend for YOLOv8 analysis with color system
        const analysisResponse = await environmentalAIService.analyzeCameraFrameEnhanced(
          frameData, 
          sessionId, 
          analysisType
        );
        
        // Process the response
        if (analysisResponse && analysisResponse.success) {
          // Check if still monitoring before updating state
          if (isMonitoringRef.current && frameAnalysisActiveRef.current) {
            setAnalysis(analysisResponse.analysis);
            
            if (analysisResponse.processed_image) {
              setProcessedFrame(analysisResponse.processed_image);
            } else if (analysisResponse.analysis?.processed_image) {
              setProcessedFrame(analysisResponse.analysis.processed_image);
            }
            
            // Update stats
            setDetectionStats(prev => ({
              ...prev,
              framesProcessed: prev.framesProcessed + 1,
              detections: prev.detections + (analysisResponse.analysis?.objects_detected || 0),
              violations: prev.violations + (analysisResponse.analysis?.ppe_violations || 0),
              lastDetectionTime: new Date().toISOString()
            }));
            
            // Handle violations
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
              
              // Show notification
              notification.warning({
                message: '🚨 Safety Violation Detected',
                description: `${analysisResponse.analysis.ppe_violations} PPE violations found`,
                duration: 5,
              });
            }
            
            // Update FPS
            if (analysisResponse.analysis.processing_time_ms) {
              const currentFps = Math.round(1000 / analysisResponse.analysis.processing_time_ms);
              setFps(currentFps);
            }
          }
        }
        
      } catch (error) {
        console.error('Frame analysis error:', error);
        // Don't stop on error, just continue
      }
    }, 2000); // Every 2 seconds
  };

  const checkCameraStatus = async () => {
    try {
      const response = await environmentalAIService.getCameraStatus();
      
      if (response.success) {
        setCameraStatus(response);
        const cameras = response.available_cameras || [];
        
        if (cameras.length > 0) {
          // AUTO-SELECT the first available camera
          const firstCamera = cameras[0];
          setSelectedCamera(firstCamera.id);
          setSelectedCameraType(firstCamera.type);
          
          await loadCameraConfig(firstCamera.id);
        }
      }
    } catch (error) {
      console.error('Camera status check failed:', error);
    }
  };

  const initializeWebSocket = () => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      // Silent connect - no message
    });

    newSocket.on('disconnect', () => {
      if (isMonitoringRef.current) {
        stopMonitoring();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      message.error('Failed to connect to monitoring server');
    });

    newSocket.on('video_frame', (data) => {
      // Set both raw and processed frames
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
        // Silent - no success message
      } else if (data.status === 'stopped') {
        // Only stop if we're actually monitoring
        if (isMonitoringRef.current) {
          stopMonitoring();
        }
      }
    });

    // Add frame analysis response handler
    newSocket.on('frame_analysis', (data) => {
      
      // Create analysis object from socket data
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
      
      // Update detection stats
      setDetectionStats(prev => ({
        ...prev,
        framesProcessed: prev.framesProcessed + 1,
        detections: prev.detections + (data.hazards_count || 0),
        violations: prev.violations + (data.ppe_violations || 0),
        lastDetectionTime: new Date().toISOString()
      }));
      
      // Handle violations
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
      
      // Update processed frame if available
      if (data.processed_image) {
        setProcessedFrame(data.processed_image);
      }
    });
  };

  // REAL CAMERA FUNCTIONS
  const startDeviceCamera = async () => {
    if (!selectedCamera) {
      message.warning('Please select a camera first');
      return;
    }

    try {
      setLoading(true);
      
      // Reset stop requested flag
      stopRequestedRef.current = false;
      
      // Set monitoring state IMMEDIATELY
      setIsMonitoring(true);
      isMonitoringRef.current = true;
      setProcessedFrame(''); // Clear any previous processed frames
      
      // Start backend session first
      const response = await environmentalAIService.startDeviceCamera(selectedCamera);
      
      if (response.success) {
        setCurrentSessionId(response.session_id);
        
        // Then get the camera stream
        try {
          await startRealCameraStream();
        } catch (streamError) {
          console.error('Failed to start camera stream:', streamError);
          setIsMonitoring(false);
          isMonitoringRef.current = false;
          setLoading(false);
          return;
        }
        
        // Start frame analysis immediately
        frameAnalysisActiveRef.current = true;
        
        // Wait a bit for video to initialize, then start analysis
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

  // REAL CAMERA STREAM FUNCTION
  const startRealCameraStream = async () => {
    try {
      // Get available cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      // Camera constraints
      const constraints = {
        video: { 
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          aspectRatio: { ideal: 4/3 },
          frameRate: { ideal: 15, max: 30 },
          facingMode: selectedCamera === 'device_back' ? 'environment' : 'user',
        },
        audio: false
      };

      // Get the stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Set up the video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        
        // Add event listeners
        localVideoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          
          // Start playing the video
          localVideoRef.current.play().catch(error => {
            console.error('Failed to play video:', error);
          });
        };
        
        localVideoRef.current.onplaying = () => {
          // Silent - no message
        };
        
        localVideoRef.current.onerror = (error) => {
          console.error('Video error:', error);
          message.error('Failed to load camera feed');
        };
        
        // Ensure video is visible and properly sized
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
      
      // Provide helpful error messages
      if (error.name === 'NotAllowedError') {
        message.error('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        message.error('No camera found. Please check your device.');
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
      
      // Set stop requested flag FIRST
      stopRequestedRef.current = true;
      
      // Clear frame analysis interval
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      
      // Stop frame analysis
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
          
          // Stop real camera stream for device cameras
          if (selectedCameraType === 'device') {
            stopLocalCamera();
          }
          
          // Reset detection stats
          setDetectionStats({
            framesProcessed: 0,
            detections: 0,
            violations: 0,
            lastDetectionTime: null
          });
          
          if (socket) {
            socket.emit('stop_monitoring', { session_id: currentSessionId });
          }
          
          // Silent - no success message
        } else {
          message.error('Failed to stop monitoring: ' + (response.error || 'Invalid response'));
        }
      } else {
        // Fallback if no session ID
        setIsMonitoring(false);
        isMonitoringRef.current = false;
        stopRequestedRef.current = true;
        setVideoFrame('');
        setProcessedFrame('');
        setAnalysis(null);
        setCameraReady(false);
        setFps(0);
        stopLocalCamera();
        
        // Reset detection stats
        setDetectionStats({
          framesProcessed: 0,
          detections: 0,
          violations: 0,
          lastDetectionTime: null
        });
        
        // Silent - no success message
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

  const handleDebugModeChange = (checked) => {
    setDebugMode(checked);
  };

  const analysisTypes = [
    { value: 'safety_monitoring', label: 'Safety Monitoring', icon: <SafetyOutlined /> },
    { value: 'ppe_detection', label: 'PPE Detection', icon: <SafetyCertificateOutlined /> },
    { value: 'environmental_monitoring', label: 'Environmental', icon: <ExperimentOutlined /> },
    { value: 'fire_detection', label: 'Fire Detection', icon: <FireOutlined /> }
  ];

  // Camera data
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
                    {debugMode && (
                      <Tag color="orange" icon={<BugOutlined />}>
                        DEBUG MODE
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
                    {debugMode && isMonitoring && (
                      <Button 
                        type="dashed" 
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          frameAnalysisActiveRef.current = true;
                          if (currentSessionId && isMonitoring) {
                            startFrameAnalysis(currentSessionId);
                          }
                        }}
                        size="small"
                      >
                        Restart Analysis
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Camera Type Tabs */}
          <Col span={24}>
            <Card size="small">
              
              {debugMode && (
                <Card title="Debug Info" size="small" style={{ marginBottom: 16, backgroundColor: '#f5f5f5' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <strong>Selected Camera:</strong> 
                      <Tag color={selectedCamera ? 'green' : 'red'}>
                        {selectedCamera || 'NONE SELECTED'}
                      </Tag>
                    </div>
                    <div>
                      <strong>Available Cameras:</strong> 
                      <Tag>{cameraStatus.available_cameras?.length || 0}</Tag>
                    </div>
                    <div>
                      <strong>Camera Type:</strong> 
                      <Tag>{selectedCameraType || 'NONE'}</Tag>
                    </div>
                    <div>
                      <strong>Monitoring:</strong> 
                      <Tag color={isMonitoring ? 'green' : 'red'}>
                        {isMonitoring ? 'ACTIVE' : 'INACTIVE'}
                      </Tag>
                    </div>
                    <div>
                      <strong>Session ID:</strong> 
                      <Tag>{currentSessionId || 'None'}</Tag>
                    </div>
                    <div>
                      <strong>Detection Stats:</strong> 
                      <Tag color="blue">
                        Frames: {detectionStats.framesProcessed} | Detections: {detectionStats.detections}
                      </Tag>
                    </div>
                    <div>
                      <strong>Video Ready:</strong> 
                      <Tag color={cameraReady ? 'green' : 'red'}>
                        {cameraReady ? 'READY' : 'LOADING'}
                      </Tag>
                    </div>
                    <div>
                      <strong>Frame Analysis Active:</strong> 
                      <Tag color={frameAnalysisActiveRef.current ? 'green' : 'red'}>
                        {frameAnalysisActiveRef.current ? 'RUNNING' : 'STOPPED'}
                      </Tag>
                    </div>
                    <div>
                      <strong>Stop Requested:</strong> 
                      <Tag color={stopRequestedRef.current ? 'red' : 'green'}>
                        {stopRequestedRef.current ? 'YES' : 'NO'}
                      </Tag>
                    </div>
                  </Space>
                </Card>
              )}
              
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
                    debugMode={debugMode}
                    onDebugModeChange={handleDebugModeChange}
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
                    debugMode={debugMode}
                    onDebugModeChange={handleDebugModeChange}
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
                  {frameAnalysisActiveRef.current && (
                    <Tag color="green">ANALYSIS ACTIVE</Tag>
                  )}
                  {stopRequestedRef.current && (
                    <Tag color="red">STOP REQUESTED</Tag>
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
                {/* ALWAYS keep the video element mounted but hidden when showing processed frame */}
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
                
                {/* Show processed frame overlay when available */}
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
                      // Fallback: hide processed frame, show video
                      setProcessedFrame('');
                    }}
                  />
                )}
                
                {/* Show overlay when processing but no processed frame yet */}
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
                
                {/* CCTV or simulated feed */}
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
                
                {/* Placeholder when no feed is available */}
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

              {/* Camera Status Info */}
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

              {/* Real-time Analysis Overlay */}
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
                  
                  {/* Show detailed violations */}
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

              {/* Multi-domain Risk Dashboard */}
              {analysis && (
                <div style={{ marginTop: '16px' }}>
                  <MultiDomainRiskDashboard analysis={analysis} />
                </div>
              )}

              {/* Debug Information */}
              {debugMode && (
                <Collapse style={{ marginTop: 16 }}>
                  <Panel header={<Space><BugOutlined />Debug Information</Space>} key="debug">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div><strong>Session ID:</strong> {currentSessionId}</div>
                      <div><strong>Analysis Type:</strong> {analysisType}</div>
                      <div><strong>Video Ready State:</strong> {localVideoRef.current?.readyState || 'Unknown'}</div>
                      <div><strong>Stream Active:</strong> {streamRef.current?.active ? 'Yes' : 'No'}</div>
                      <div><strong>Last Analysis:</strong> {detectionStats.lastDetectionTime ? new Date(detectionStats.lastDetectionTime).toLocaleTimeString() : 'Never'}</div>
                      <div><strong>Frames Processed:</strong> {detectionStats.framesProcessed}</div>
                      <div><strong>Total Detections:</strong> {detectionStats.detections}</div>
                      <div><strong>Total Violations:</strong> {detectionStats.violations}</div>
                      <div><strong>Frame Analysis Active:</strong> {frameAnalysisActiveRef.current ? 'YES' : 'NO'}</div>
                      <div><strong>Stop Requested:</strong> {stopRequestedRef.current ? 'YES' : 'NO'}</div>
                      <div><strong>Processed Frame Available:</strong> {processedFrame ? `Yes (${processedFrame.length} chars)` : 'No'}</div>
                      <div><strong>Color System:</strong> {analysis?.color_system_enabled ? 'ENABLED' : analysis?.color_system_enabled === false ? 'DISABLED' : 'UNKNOWN'}</div>
                      {analysis && (
                        <div>
                          <strong>Raw Analysis:</strong>
                          <pre style={{ 
                            fontSize: '10px', 
                            maxHeight: '150px', 
                            overflow: 'auto',
                            backgroundColor: '#f5f5f5',
                            padding: '8px',
                            marginTop: '8px'
                          }}>
                            {JSON.stringify(analysis, null, 2)}
                          </pre>
                        </div>
                      )}
                    </Space>
                  </Panel>
                </Collapse>
              )}
            </Card>
          </Col>

          {/* Analysis Panel */}
          <Col xs={24} lg={8}>
            {/* Risk Assessment */}
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

            {/* Quick Access to Advanced AI */}
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
                <Button 
                  block 
                  icon={<BugOutlined />}
                  onClick={() => handleDebugModeChange(!debugMode)}
                >
                  {debugMode ? 'Disable' : 'Enable'} Debug Mode
                </Button>
              </Space>
            </Card>

            {/* Active Sessions */}
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

            {/* Violation History */}
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

            {/* Detection Statistics */}
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