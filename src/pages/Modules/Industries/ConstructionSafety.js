// src/pages/Modules/Industries/ConstructionSafety.js
import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Tabs, 
  List, 
  Button, 
  Space, 
  Tag, 
  Avatar, 
  Statistic, 
  Progress, 
  Table,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Alert,
  Badge,
  Tooltip,
  Divider,
  Timeline,
  Switch,
  Slider,
  InputNumber,
  Radio,
  Checkbox,
  Calendar,
  Popconfirm,
  message,
  Descriptions,
  Collapse,
  Empty, 
  Steps,
  Result
} from 'antd';
import {
  BuildOutlined,
  FileTextOutlined,
  ToolOutlined,
  DownloadOutlined,
  EditOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  ToolFilled,
  ContainerOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  BarChartOutlined,
  HeatMapOutlined,
  ClusterOutlined,
  RadarChartOutlined,
  ApiOutlined,
  SafetyOutlined,
  BugOutlined,
  GatewayOutlined,
  CodeSandboxOutlined,
  DashboardOutlined,
  CalculatorOutlined,
  AlertFilled,
  SettingOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  AuditOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  StarOutlined,
  NotificationOutlined,
  ProfileOutlined,
  ProjectOutlined,
  BankOutlined,
  CrownFilled,
  FlagOutlined,
  SolutionOutlined,
  UserSwitchOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  ControlOutlined,
  PartitionOutlined,
  ApartmentOutlined,
  DeploymentUnitOutlined,
  EnvironmentFilled,
  WifiOutlined,
  SignatureOutlined,
  RobotOutlined,
  SecurityScanOutlined,
  CrownOutlined,
  CloudServerOutlined,
  GroupOutlined,
  DollarOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  BellOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import constructionApiService from '../../../services/constructionApiService';

const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Panel } = Collapse;
const { Step } = Steps;

// Fallback data functions
const getFallbackTrainingModules = () => [
  {
    id: 1,
    name: 'OSHA 10-Hour Construction',
    completed: 85,
    required: 100,
    workers: 45,
    deadline: '2024-02-15'
  },
  {
    id: 2,
    name: 'Fall Protection Certification',
    completed: 72,
    required: 100,
    workers: 38,
    deadline: '2024-02-20'
  },
  {
    id: 3,
    name: 'Scaffold Competent Person',
    completed: 90,
    required: 100,
    workers: 28,
    deadline: '2024-02-10'
  },
  {
    id: 4,
    name: 'Excavation Safety',
    completed: 65,
    required: 100,
    workers: 32,
    deadline: '2024-02-25'
  }
];

const getFallbackEnvironmentalData = () => [
  {
    parameter: 'Air Quality PM2.5',
    value: 12.5,
    unit: 'μg/m³',
    status: 'Good',
    last_updated: '2024-01-15T10:30:00Z'
  },
  {
    parameter: 'Noise Level',
    value: 68,
    unit: 'dB',
    status: 'Moderate',
    last_updated: '2024-01-15T10:25:00Z'
  },
  {
    parameter: 'Water Turbidity',
    value: 5.2,
    unit: 'NTU',
    status: 'Acceptable',
    last_updated: '2024-01-15T10:20:00Z'
  },
  {
    parameter: 'Soil Erosion',
    value: 'Low',
    unit: '',
    status: 'Good',
    last_updated: '2024-01-15T10:15:00Z'
  }
];

const ConstructionSafety = () => {
  const { tab = 'dashboard' } = useParams();
  const history = useHistory();
  const location = useLocation();
  const [form] = Form.useForm();
  const [riskForm] = Form.useForm();
  const [auditForm] = Form.useForm();
  const [incidentForm] = Form.useForm();
  const [trainingForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(tab);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [incidentModalVisible, setIncidentModalVisible] = useState(false);
  const [riskAssessmentModalVisible, setRiskAssessmentModalVisible] = useState(false);
  const [safetyAuditModalVisible, setSafetyAuditModalVisible] = useState(false);
  const [ltiModalVisible, setLtiModalVisible] = useState(false);
  const [trainingModalVisible, setTrainingModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [realTimeSocket, setRealTimeSocket] = useState(null);
  // Add to your existing state variables

const [assignTrainingModalVisible, setAssignTrainingModalVisible] = useState(false);
const [trainingCompliance, setTrainingCompliance] = useState({});

  // Enhanced state management
  const [realTimeData, setRealTimeData] = useState({
    activeWorkers: 0,
    safetyCompliance: 0,
    activeAlerts: 0,
    equipmentStatus: 0,
    systemHealth: 0,
    environmentalCompliance: 0,
    totalSites: 0,
    activeProjects: 0
  });

  const [complianceStatus, setComplianceStatus] = useState({
    osha: { score: 0, status: 'Loading', lastAudit: '' },
    ansi: { score: 0, status: 'Loading', lastAudit: '' },
    nfpa: { score: 0, status: 'Loading', lastAudit: '' },
    epa: { score: 0, status: 'Loading', lastAudit: '' }
  });

  const [safetyPerformance, setSafetyPerformance] = useState({
    spis: [],
    spas: []
  });

  const [riskMatrix, setRiskMatrix] = useState({
    high: [],
    medium: [],
    low: []
  });

  const [incidents, setIncidents] = useState({
    open: [],
    closed: [],
    statistics: {}
  });

  const [siteInventory, setSiteInventory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentTemplates, setDocumentTemplates] = useState([]);
  const [trainingModules, setTrainingModules] = useState([]);
  const [safetyBulletins, setSafetyBulletins] = useState([]);
  const [environmentalData, setEnvironmentalData] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [ltiData, setLtiData] = useState({
    totalWorkHours: 0,
    lostTimeInjuries: 0,
    calculatedLTI: 0
  });

  // Enhanced debugging function
  const debugRouting = () => {
    console.log('🔍 CONSTRUCTION ROUTING DEBUG:', {
      urlTab: tab,
      activeTab: activeTab,
      pathname: location.pathname,
      fullURL: window.location.href,
      routeMatch: location.pathname.includes('/hse/construction/')
    });
  };

  // Sync activeTab with URL parameter
  useEffect(() => {
    console.log('🔄 URL parameter changed:', tab);
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab, activeTab]);

  // FIXED: Enhanced tab change handler
  const handleTabChange = (key) => {
    console.log('🔄 Tab change requested:', key);
    
    // Update local state immediately for responsive UI
    setActiveTab(key);
    
    // Use the correct base path that matches your route configuration
    const targetPath = `/hse/construction/${key}`;
    console.log('🧭 Navigating to:', targetPath);
    
    history.push(targetPath);
  };

  // Load data when activeTab changes
  useEffect(() => {
    console.log('📊 Loading data for active tab:', activeTab);
    loadTabData(activeTab);
    debugRouting();
  }, [activeTab]);

  // Initialize real-time WebSocket connection
  useEffect(() => {
    initializeRealTimeMonitoring();
    return () => {
      if (realTimeSocket) {
        realTimeSocket.disconnect();
      }
    };
  }, []);

  const initializeRealTimeMonitoring = () => {
    const socket = constructionApiService.initializeRealTimeMonitoring({
      onConnect: () => {
        console.log('🏗️ Construction Safety WebSocket Connected');
        message.success('Real-time safety monitoring activated');
      },
      onDisconnect: (event) => {
        console.warn('🏗️ Construction Safety WebSocket Disconnected:', event);
        message.warning('Real-time monitoring disconnected');
      },
      onError: (error) => {
        console.error('🏗️ WebSocket Error:', error);
        message.error('Real-time monitoring error');
      },
      onSafetyAlert: (alert) => {
        console.log('🚨 Safety Alert:', alert);
        message.warning(`Safety Alert: ${alert.message}`);
        loadRealTimeData(); // Refresh data
      },
      onRiskUpdate: (update) => {
        console.log('⚠️ Risk Update:', update);
        loadRiskData();
      },
      onComplianceUpdate: (update) => {
        console.log('📋 Compliance Update:', update);
        loadComplianceStatus();
      },
      onIncidentReport: (incident) => {
        console.log('🚑 Incident Report:', incident);
        message.info(`New Incident: ${incident.type}`);
        loadIncidents();
      },
      onSystemHealthUpdate: (health) => {
        console.log('💻 System Health Update:', health);
        setSystemHealth(health);
      },
      onEquipmentUpdate: (equipment) => {
        console.log('🔧 Equipment Update:', equipment);
        loadSiteInventory();
      }
    });

    setRealTimeSocket(socket);
  };

  const loadTabData = async (currentTab) => {
    try {
      setLoading(true);
      
      // Always load base data
      await Promise.all([
        loadRealTimeData(),
        loadSystemHealth(),
        loadComplianceStatus()
      ]);
      
      // Load tab-specific data
      switch(currentTab) {
        case 'equipment':
          await loadSiteInventory();
          break;
        case 'documents':
          await Promise.all([loadDocuments(), loadDocumentTemplates()]);
          break;
        case 'metrics':
          await Promise.all([loadLTIData(), loadSafetyPerformance()]);
          break;
        case 'risk':
          await Promise.all([loadRiskData(), loadSafetyPerformance()]);
          break;
        case 'incidents':
          await loadIncidents();
          break;
        case 'training':
          await loadTrainingData();
          break;
        case 'environmental':
          await loadEnvironmentalData();
          break;
        case 'communication':
          await loadSafetyBulletins();
          break;
        case 'analytics':
          await loadAnalyticsData();
          break;
        case 'admin':
          await loadAdminData();
          break;
        case 'enterprise':
          await loadEnterpriseData();
          break;
        default:
          // Dashboard - load everything
          await Promise.all([
            loadSiteInventory(),
            loadDocuments(),
            loadDocumentTemplates(),
            loadLTIData(),
            loadSafetyPerformance(),
            loadRiskData()
          ]);
      }
    } catch (error) {
      console.error('❌ Error loading tab data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced API functions with proper error handling
  const loadRealTimeData = async () => {
    try {
      const response = await constructionApiService.getRealTimeMetrics();
      if (response.success) {
        setRealTimeData(response.data);
      } else {
        console.warn('⚠️ Using fallback real-time data');
        setRealTimeData(prev => ({ ...prev, activeWorkers: 247, safetyCompliance: 92 }));
      }
    } catch (error) {
      console.error('❌ Error loading real-time data:', error);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await constructionApiService.getSystemHealth();
      if (response.success) {
        setSystemHealth(response.data);
      }
    } catch (error) {
      console.error('Error loading system health:', error);
    }
  };

  const loadComplianceStatus = async () => {
    try {
      const response = await constructionApiService.getComplianceStatus();
      if (response.success) {
        setComplianceStatus(response.data);
      }
    } catch (error) {
      console.error('Error loading compliance status:', error);
    }
  };

  const loadSafetyPerformance = async () => {
    try {
      const response = await constructionApiService.getSafetyPerformance();
      if (response.success) {
        setSafetyPerformance(response.data);
      }
    } catch (error) {
      console.error('Error loading safety performance:', error);
    }
  };

  const loadRiskData = async () => {
    try {
      const [matrixResponse, hazardsResponse] = await Promise.all([
        constructionApiService.getRiskMatrix(),
        constructionApiService.getHazardLog()
      ]);

      if (matrixResponse.success) {
        setRiskMatrix(matrixResponse.data);
      }
      // Additional risk data can be processed here
    } catch (error) {
      console.error('Error loading risk data:', error);
    }
  };

  const loadSiteInventory = async () => {
    try {
      setLoading(true);
      const response = await constructionApiService.getEquipmentStatus();
      
      if (response.success && response.data) {
        let equipmentData = [];
        
        // Handle various response structures
        if (Array.isArray(response.data)) {
          equipmentData = response.data;
        } else if (Array.isArray(response.data.equipment)) {
          equipmentData = response.data.equipment;
        } else if (Array.isArray(response.data.data)) {
          equipmentData = response.data.data;
        }
        
        setSiteInventory(equipmentData);
      } else {
        // Use fallback equipment data
        setSiteInventory(getFallbackEquipment());
      }
    } catch (error) {
      console.error('❌ Error loading equipment:', error);
      setSiteInventory(getFallbackEquipment());
    } finally {
      setLoading(false);
    }
  };

  // In ConstructionSafety.js - Enhanced upload handler
// Enhanced training data loading
const loadTrainingData = async () => {
  try {
    setLoading(true);
    const [modulesResponse, complianceResponse] = await Promise.all([
      constructionApiService.getConstructionTrainingModules(),
      constructionApiService.getTrainingCompliance()
    ]);

    console.log('📚 Training Modules Response:', modulesResponse);

    let modulesData = [];
    
    // Handle various response structures safely
    if (modulesResponse.success) {
      if (Array.isArray(modulesResponse.data)) {
        modulesData = modulesResponse.data;
      } else if (modulesResponse.data && Array.isArray(modulesResponse.data.modules)) {
        modulesData = modulesResponse.data.modules;
      } else if (modulesResponse.data && Array.isArray(modulesResponse.data.data)) {
        modulesData = modulesResponse.data.data;
      } else {
        console.warn('⚠️ Unexpected training modules structure, using fallback');
        modulesData = getFallbackTrainingModules();
      }
    } else {
      console.warn('⚠️ Training API returned failure, using fallback data');
      modulesData = getFallbackTrainingModules();
    }
    
    console.log('📚 Final Training Modules:', modulesData);
    setTrainingModules(modulesData);
    
    // Handle compliance data
    if (complianceResponse.success) {
      setTrainingCompliance(complianceResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error loading training data:', error);
    setTrainingModules(getFallbackTrainingModules());
  } finally {
    setLoading(false);
  }
};
  
  const loadDocuments = async () => {
    try {
      const response = await constructionApiService.getConstructionDocuments();
      if (response.success) {
        setDocuments(response.data.documents || response.data || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadDocumentTemplates = async () => {
    try {
      const response = await constructionApiService.getReportTemplates();
      if (response.success) {
        setDocumentTemplates(response.data.templates || response.data || []);
      }
    } catch (error) {
      console.error('Error loading document templates:', error);
    }
  };

  const loadLTIData = async () => {
    try {
      const response = await constructionApiService.getSafetyMetrics();
      if (response.success) {
        setLtiData(response.data.lti || response.data);
      }
    } catch (error) {
      console.error('Error loading LTI data:', error);
    }
  };

  const loadIncidents = async () => {
    try {
      const [incidentsResponse, statsResponse] = await Promise.all([
        constructionApiService.getIncidents({ status: 'open' }),
        constructionApiService.getIncidentStatistics()
      ]);

      if (incidentsResponse.success) {
        setIncidents(prev => ({
          ...prev,
          open: incidentsResponse.data.incidents || incidentsResponse.data || []
        }));
      }

      if (statsResponse.success) {
        setIncidents(prev => ({
          ...prev,
          statistics: statsResponse.data
        }));
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  // Enhanced risk assessment handler
// Enhanced document upload handler with file support
const handleDocumentUpload = async (values) => {
  try {
    setLoading(true);
    
    const formData = new FormData();
    
    // Add file if present
    if (values.file && values.file.file) {
      formData.append('document', values.file.file);
    }
    
    // Add metadata
    formData.append('title', values.title || 'Untitled Document');
    formData.append('description', values.description || '');
    formData.append('type', values.documentType || 'general');
    formData.append('category', values.category || 'safety');
    formData.append('site_id', values.siteId || 'all');

    const response = await constructionApiService.uploadConstructionDocument(formData);
    
    if (response.success) {
      message.success('Document uploaded successfully!');
      setDocumentModalVisible(false);
      form.resetFields();
      loadDocuments();
    } else {
      message.error(response.error || 'Failed to upload document');
    }
  } catch (error) {
    console.error('Document upload error:', error);
    message.error('Failed to upload document. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Add document upload modal
const DocumentUploadModal = () => (
  <Modal
    title="Upload Construction Safety Document"
    visible={documentModalVisible}
    onCancel={() => setDocumentModalVisible(false)}
    footer={null}
    width={600}
  >
    <Form form={form} layout="vertical" onFinish={handleDocumentUpload}>
      <Form.Item name="title" label="Document Title" rules={[{ required: true }]}>
        <Input placeholder="Enter document title" />
      </Form.Item>
      
      <Form.Item name="description" label="Description">
        <TextArea rows={3} placeholder="Enter document description" />
      </Form.Item>
      
      <Form.Item name="documentType" label="Document Type" rules={[{ required: true }]}>
        <Select placeholder="Select document type">
          <Option value="safety_plan">Safety Plan</Option>
          <Option value="inspection_report">Inspection Report</Option>
          <Option value="risk_assessment">Risk Assessment</Option>
          <Option value="training_material">Training Material</Option>
          <Option value="permit">Safety Permit</Option>
          <Option value="procedure">Safety Procedure</Option>
        </Select>
      </Form.Item>
      
      <Form.Item name="file" label="Document File" rules={[{ required: true }]}>
        <Upload
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          beforeUpload={(file) => {
            // Prevent auto-upload
            return false;
          }}
          maxCount={1}
        >
          <Button icon={<CloudUploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Upload Document
          </Button>
          <Button onClick={() => setDocumentModalVisible(false)}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
);
  
  // FIXED: Enhanced training data loading with proper array handling
  // Enhanced environmental data loading
const loadEnvironmentalData = async () => {
  try {
    const [monitoringResponse, complianceResponse] = await Promise.all([
      constructionApiService.getEnvironmentalMonitoring(),
      constructionApiService.getEnvironmentalCompliance()
    ]);

    console.log('🌍 Environmental Monitoring Response:', monitoringResponse);

    if (monitoringResponse.success) {
      const data = monitoringResponse.data || {};
      let monitoringData = [];
      
      // Handle nested data structure safely
      if (data.data && data.data.monitoring_data && Array.isArray(data.data.monitoring_data)) {
        monitoringData = data.data.monitoring_data;
      } else if (Array.isArray(data.monitoring_data)) {
        monitoringData = data.monitoring_data;
      } else if (Array.isArray(data.data)) {
        monitoringData = data.data;
      } else if (Array.isArray(data)) {
        monitoringData = data;
      } else {
        console.warn('⚠️ Unexpected environmental data structure, using fallback');
        monitoringData = getFallbackEnvironmentalData();
      }
      
      console.log('🌍 Final Environmental Data:', monitoringData);
      setEnvironmentalData(monitoringData);
    } else {
      console.warn('⚠️ Environmental API returned failure, using fallback data');
      setEnvironmentalData(getFallbackEnvironmentalData());
    }
  } catch (error) {
    console.error('❌ Error loading environmental data:', error);
    setEnvironmentalData(getFallbackEnvironmentalData());
  }
};

  
  const loadSafetyBulletins = async () => {
    try {
      const response = await constructionApiService.getSafetyBulletins();
      if (response.success) {
        setSafetyBulletins(response.data.bulletins || response.data || []);
      }
    } catch (error) {
      console.error('Error loading safety bulletins:', error);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const [analyticsResponse, trendsResponse] = await Promise.all([
        constructionApiService.getPredictiveAnalytics(),
        constructionApiService.getSafetyTrendsAnalysis()
      ]);
      // Process analytics data
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const loadAdminData = async () => {
    try {
      const [usersResponse, logsResponse] = await Promise.all([
        constructionApiService.getSystemUsers(),
        constructionApiService.getSystemLogs()
      ]);
      // Process admin data
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const loadEnterpriseData = async () => {
    try {
      // Load enterprise-wide data
      await loadRealTimeData();
      await loadComplianceStatus();
    } catch (error) {
      console.error('Error loading enterprise data:', error);
    }
  };

  // Fallback data functions
  const getFallbackEquipment = () => [
    { 
      id: 1, 
      equipment: 'Tower Crane A01', 
      location: 'Site A - North Tower', 
      type: 'Crane', 
      status: 'Operational',
      lastInspection: '2024-01-10',
      nextInspection: '2024-02-10'
    },
    { 
      id: 2, 
      equipment: 'Excavator B12', 
      location: 'Site B - Foundation', 
      type: 'Excavator', 
      status: 'Maintenance',
      lastInspection: '2024-01-08',
      nextInspection: '2024-02-08'
    },
    { 
      id: 3, 
      equipment: 'Concrete Mixer C05', 
      location: 'Site C - Slab Area', 
      type: 'Mixer', 
      status: 'Operational',
      lastInspection: '2024-01-12',
      nextInspection: '2024-02-12'
    }
  ];

  // Enhanced image upload handler
const handleImageUpload = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Create a clean site data object with the image
      const siteData = {
        siteId: 'current-site',
        site_image: e.target.result, // This is base64
        timestamp: new Date().toISOString(),
        // Add other required fields
        work_at_height: 0.7,
        heavy_equipment: 0.6,
        electrical_work: 0.4,
        excavation_depth: 15,
        worker_experience: 0.8,
        weather_risk: 0.3,
        time_pressure: 0.5,
        safety_procedures: 0.9,
        site_complexity: 0.6,
        material_handling: 0.4,
        chemical_exposure: 0.2,
        supervision_quality: 0.8,
        communication: 0.7,
        equipment_maintenance: 0.85,
        emergency_preparedness: 0.75
        // ... other risk factors
      };
      
      resolve(siteData);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Enhanced risk assessment handler
const handleRiskAssessment = async (values) => {
  try {
    setLoading(true);
    
    // Prepare assessment data
    const assessmentData = {
      hazard: values.hazard,
      probability: values.probability,
      severity: values.severity,
      standard: values.standard,
      location: values.location || 'General Site',
      assessment_date: new Date().toISOString()
    };
    
    const response = await constructionApiService.submitRiskAssessment(assessmentData);
    
    if (response.success) {
      message.success('Risk Assessment Submitted Successfully!');
      setRiskAssessmentModalVisible(false);
      riskForm.resetFields();
      loadRiskData(); // Refresh risk data
    } else {
      message.error(response.error || 'Failed to submit risk assessment');
    }
  } catch (error) {
    console.error('Risk assessment error:', error);
    message.error('Error submitting risk assessment');
  } finally {
    setLoading(false);
  }
};

  const handleSafetyAudit = async (values) => {
    try {
      const response = await constructionApiService.submitSafetyAudit(values);
      if (response.success) {
        message.success('Safety Audit Completed Successfully!');
        setSafetyAuditModalVisible(false);
        auditForm.resetFields();
        loadComplianceStatus();
      }
    } catch (error) {
      message.error('Error completing safety audit');
    }
  };

  const handleIncidentReport = async (values) => {
    try {
      const response = await constructionApiService.reportIncident(values);
      if (response.success) {
        message.success('Incident Reported Successfully!');
        setIncidentModalVisible(false);
        incidentForm.resetFields();
        loadIncidents();
      }
    } catch (error) {
      message.error('Error reporting incident');
    }
  };

  // In ConstructionSafety.js - Add these handlers

// Enhanced safety tools handler
const handleSafetyToolAction = async (tool, action) => {
  switch (action) {
    case 'launch':
      await handleLaunchSafetyTool(tool);
      break;
    case 'view':
      handleViewToolDetails(tool);
      break;
    case 'compliance':
      handleViewComplianceInfo(tool);
      break;
    default:
      console.log('Unknown action:', action);
  }
};

// Launch safety tool with AI analysis
const handleLaunchSafetyTool = async (tool) => {
  try {
    setLoading(true);
    message.info(`Initializing ${tool.name}...`);

    let result;
    switch (tool.id) {
      case 1: // AI Site Safety Scanner
        result = await handleRunSiteAnalysis();
        break;
      case 2: // Predictive Risk Analytics
        result = await handlePredictiveRiskAnalysis();
        break;
      case 3: // Smart Permit System
        result = await handlePermitSystem();
        break;
      case 4: // Equipment Safety Monitor
        result = await handleEquipmentMonitoring();
        break;
      default:
        message.warning('Tool functionality coming soon');
        return;
    }

    if (result) {
      message.success(`${tool.name} analysis completed successfully`);
    }
  } catch (error) {
    console.error(`Error launching ${tool.name}:`, error);
    message.error(`Failed to launch ${tool.name}`);
  } finally {
    setLoading(false);
  }
};

// Enhanced document upload handler
// Add equipment handler
const handleAddEquipment = async (values) => {
  try {
    setLoading(true);
    
    const equipmentData = {
      equipment: values.equipmentName,
      location: values.location,
      type: values.equipmentType,
      status: 'Operational',
      lastInspection: new Date().toISOString().split('T')[0],
      nextInspection: values.nextInspection
    };
    
    const response = await constructionApiService.addEquipment(equipmentData);
    
    if (response.success) {
      message.success('Equipment added successfully!');
      setEquipmentModalVisible(false);
      loadSiteInventory();
    } else {
      message.error(response.error || 'Failed to add equipment');
    }
  } catch (error) {
    console.error('Add equipment error:', error);
    message.error('Failed to add equipment');
  } finally {
    setLoading(false);
  }
};

// Add this to your state
const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);

// Add Equipment Modal component
const AddEquipmentModal = () => (
  <Modal
    title="Add New Equipment"
    visible={equipmentModalVisible}
    onCancel={() => setEquipmentModalVisible(false)}
    footer={null}
    width={500}
  >
    <Form layout="vertical" onFinish={handleAddEquipment}>
      <Form.Item name="equipmentName" label="Equipment Name" rules={[{ required: true }]}>
        <Input placeholder="Enter equipment name" />
      </Form.Item>
      
      <Form.Item name="equipmentType" label="Equipment Type" rules={[{ required: true }]}>
        <Select placeholder="Select equipment type">
          <Option value="Crane">Crane</Option>
          <Option value="Excavator">Excavator</Option>
          <Option value="Bulldozer">Bulldozer</Option>
          <Option value="Concrete Mixer">Concrete Mixer</Option>
          <Option value="Scaffolding">Scaffolding</Option>
          <Option value="Other">Other</Option>
        </Select>
      </Form.Item>
      
      <Form.Item name="location" label="Location" rules={[{ required: true }]}>
        <Input placeholder="Enter equipment location" />
      </Form.Item>
      
      <Form.Item name="nextInspection" label="Next Inspection Date" rules={[{ required: true }]}>
        <Input type="date" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Equipment
          </Button>
          <Button onClick={() => setEquipmentModalVisible(false)}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
);

// Enhanced Run Site Analysis with file upload
const handleRunSiteAnalysis = async (imageFile = null) => {
  try {
    let siteData = {};
    
    if (imageFile) {
      siteData = await handleImageUpload(imageFile);
    } else {
      // Use default site data
      siteData = {
        siteId: 'current-site',
        work_at_height: 0.7,
        heavy_equipment: 0.6,
        electrical_work: 0.4,
        excavation_depth: 15,
        worker_experience: 0.8,
        weather_risk: 0.3,
        time_pressure: 0.5,
        safety_procedures: 0.9,
        site_complexity: 0.6,
        material_handling: 0.4,
        chemical_exposure: 0.2,
        supervision_quality: 0.8,
        communication: 0.7,
        equipment_maintenance: 0.85,
        emergency_preparedness: 0.75
        // ... other parameters
      };
    }
    
    const response = await constructionApiService.runAISiteAnalysis({
      siteData: siteData
    });
    
    if (response.success) {
      message.success('AI Site Analysis Completed!');
      
      // Show results in modal
      Modal.success({
        title: 'Site Analysis Results',
        width: 800,
        content: (
          <div>
            <Alert 
              message={`Risk Level: ${response.data.overallRisk}`}
              description={`Safety Score: ${response.data.safetyScore}`}
              type={response.data.overallRisk === 'High' ? 'warning' : 'success'}
            />
            <Divider />
            <h4>Detected Hazards:</h4>
            <List
              dataSource={response.data.hazardsDetected || []}
              renderItem={hazard => (
                <List.Item>
                  <Tag color="red">{hazard.type}</Tag>
                  {hazard.description}
                </List.Item>
              )}
            />
            <Divider />
            <h4>Recommendations:</h4>
            <List
              dataSource={response.data.recommendations || []}
              renderItem={rec => (
                <List.Item>
                  <Tag color="blue">{rec.priority}</Tag>
                  {rec.action}
                </List.Item>
              )}
            />
          </div>
        ),
      });
      
      return response.data;
    } else {
      message.error(response.error || 'Analysis failed');
      return null;
    }
  } catch (error) {
    console.error('Site analysis error:', error);
    message.error('Error running site analysis');
    return null;
  }
};

// Enhanced training assignment handler
const handleTrainingAssignment = async (values) => {
  try {
    setLoading(true);
    
    const trainingData = {
      module: values.trainingModule,
      workers: values.workers,
      deadline: values.deadline,
      assignedBy: 'current_user', // You might want to get this from auth context
      assignmentDate: new Date().toISOString()
    };
    
    const response = await constructionApiService.assignConstructionTraining(trainingData);
    
    if (response.success) {
      message.success('Training assigned successfully!');
      setAssignTrainingModalVisible(false);
      trainingForm.resetFields();
      loadTrainingData();
    } else {
      message.error(response.error || 'Failed to assign training');
    }
  } catch (error) {
    console.error('Training assignment error:', error);
    message.error('Failed to assign training');
  } finally {
    setLoading(false);
  }
};

// Predictive Risk Analysis
const handlePredictiveRiskAnalysis = async () => {
  try {
    const response = await constructionApiService.getPredictiveAnalytics();
    if (response.success) {
      Modal.info({
        title: 'Predictive Risk Analysis',
        width: 700,
        content: (
          <div>
            <Alert
              message="Risk Forecast"
              description={response.data.prediction?.risk_forecast?.next_30_days || 'Moderate'}
              type="warning"
            />
            <Divider />
            <h4>Key Risk Factors:</h4>
            <List
              dataSource={response.data.prediction?.key_risk_factors || []}
              renderItem={factor => <List.Item>{factor}</List.Item>}
            />
          </div>
        ),
      });
    }
    return response.data;
  } catch (error) {
    console.error('Predictive analysis error:', error);
    throw error;
  }
};

// Permit System Handler
const handlePermitSystem = async () => {
  message.info('Smart Permit System - Opening permit dashboard...');
  // Navigate to permits section or open permit modal
  handleTabChange('documents'); // Navigate to documents tab for permits
};

// Equipment Monitoring Handler
const handleEquipmentMonitoring = async () => {
  message.info('Equipment Safety Monitor - Loading equipment status...');
  handleTabChange('equipment'); // Navigate to equipment tab
};

// View tool details
const handleViewToolDetails = (tool) => {
  Modal.info({
    title: `${tool.name} - Details`,
    width: 600,
    content: (
      <div>
        <p><strong>Description:</strong> {tool.description}</p>
        <p><strong>Category:</strong> {tool.category}</p>
        <p><strong>Current Usage:</strong> {tool.usage}</p>
        <p><strong>Rating:</strong> {tool.rating}/5.0</p>
        
        <Divider />
        <h4>Features:</h4>
        <List
          dataSource={tool.features}
          renderItem={feature => <List.Item>{feature}</List.Item>}
        />
        
        <Divider />
        <h4>Compliance Standards:</h4>
        <Space wrap>
          {tool.compliance.map((std, index) => (
            <Tag key={index} color="green">{std}</Tag>
          ))}
        </Space>
      </div>
    ),
  });
};

// View compliance information
const handleViewComplianceInfo = (tool) => {
  Modal.info({
    title: `${tool.name} - Compliance Information`,
    width: 700,
    content: (
      <div>
        <Alert 
          message="Regulatory Compliance Status" 
          description="This tool helps maintain compliance with the following standards:"
          type="info"
        />
        <List
          dataSource={tool.compliance}
          renderItem={standard => (
            <List.Item>
              <List.Item.Meta
                avatar={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
                title={standard}
                description={`Meets ${standard} requirements through automated monitoring and reporting`}
              />
            </List.Item>
          )}
        />
      </div>
    ),
  });
};

  const handleLTICalculation = async (values) => {
    try {
      const response = await constructionApiService.calculateSafetyMetrics(values);
      if (response.success) {
        const resultData = response.data?.data || response.data;
        const ltiResult = resultData?.lti || {
          totalWorkHours: values.totalWorkHours,
          lostTimeInjuries: values.lostTimeInjuries,
          calculatedLTI: (values.lostTimeInjuries / values.totalWorkHours) * 200000
        };
        setLtiData(ltiResult);
        message.success(`LTI Rate Calculated: ${ltiResult.calculatedLTI}`);
      }
    } catch (error) {
      message.error('Error calculating LTI');
    }
  };

  // FIXED: Moved handleScheduleTraining before its usage
  // Schedule training handler
  const handleScheduleTraining = async (values) => {
    try {
      setLoading(true);
      
      const trainingData = {
        name: values.trainingName,
        type: values.trainingType,
        trainer: values.trainer,
        startDate: values.startDate,
        endDate: values.endDate,
        location: values.location,
        description: values.description,
        status: 'scheduled'
      };
      
      const response = await constructionApiService.scheduleTraining(trainingData);
      
      if (response.success) {
        message.success('Training scheduled successfully!');
        setTrainingModalVisible(false);
        loadTrainingData();
      } else {
        message.error(response.error || 'Failed to schedule training');
      }
    } catch (error) {
      console.error('Schedule training error:', error);
      message.error('Failed to schedule training');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEquipment = (equipment) => {
    Modal.info({
      title: `Equipment Details - ${equipment.equipment}`,
      content: (
        <Descriptions column={1}>
          <Descriptions.Item label="Location">{equipment.location}</Descriptions.Item>
          <Descriptions.Item label="Type">{equipment.type}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={equipment.status === 'Operational' ? 'green' : 'orange'}>
              {equipment.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Last Inspection">{equipment.lastInspection}</Descriptions.Item>
          <Descriptions.Item label="Next Inspection">{equipment.nextInspection}</Descriptions.Item>
        </Descriptions>
      ),
      width: 600,
    });
  };

  const handleEditEquipment = (equipment) => {
    message.info(`Editing ${equipment.equipment}`);
  };

  // Safety communication handlers
const handleSubmitSafetySuggestion = async (suggestion) => {
  try {
    const response = await constructionApiService.submitSafetySuggestion({
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      priority: suggestion.priority
    });
    
    if (response.success) {
      message.success('Safety suggestion submitted successfully!');
    } else {
      message.error('Failed to submit safety suggestion');
    }
  } catch (error) {
    console.error('Safety suggestion error:', error);
    message.error('Failed to submit safety suggestion');
  }
};

const handlePublishSafetyAlert = async (alertData) => {
  try {
    const response = await constructionApiService.publishSafetyAlert(alertData);
    
    if (response.success) {
      message.success('Safety alert published successfully!');
      loadSafetyBulletins();
    } else {
      message.error('Failed to publish safety alert');
    }
  } catch (error) {
    console.error('Safety alert error:', error);
    message.error('Failed to publish safety alert');
  }
};

const handleJoinSafetyCommittee = () => {
  Modal.info({
    title: 'Join Safety Committee',
    content: (
      <div>
        <p>To join the safety committee, please contact:</p>
        <p><strong>Safety Manager:</strong> John Smith</p>
        <p><strong>Email:</strong> john.smith@company.com</p>
        <p><strong>Phone:</strong> (555) 123-4567</p>
      </div>
    )
  });
};
  
 // Regulatory reporting handlers
const handleGenerateRegulatoryReport = async (reportType) => {
  try {
    setLoading(true);
    message.info(`Generating ${reportType} report...`);
    
    const response = await constructionApiService.exportConstructionReport(reportType, {
      timeframe: 'quarter',
      includeCompliance: true
    });
    
    if (response.success && response.data) {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success(`${reportType} report generated successfully!`);
    } else {
      message.error(`Failed to generate ${reportType} report`);
    }
  } catch (error) {
    console.error('Regulatory report error:', error);
    message.error(`Failed to generate ${reportType} report`);
  } finally {
    setLoading(false);
  }
};

const handleSubmitRegulatoryReport = async (reportData) => {
  try {
    const response = await constructionApiService.submitRegulatoryReport(reportData);
    
    if (response.success) {
      message.success('Regulatory report submitted successfully!');
    } else {
      message.error('Failed to submit regulatory report');
    }
  } catch (error) {
    console.error('Regulatory submission error:', error);
    message.error('Failed to submit regulatory report');
  }
};

// Enhanced Construction Safety Data
  const constructionTools = [
    { 
      id: 1,
      name: 'AI Site Safety Scanner', 
      description: 'Real-time computer vision analysis of construction sites for safety hazards',
      category: 'Critical',
      status: 'active',
      icon: <RadarChartOutlined />,
      features: ['Real-time hazard detection', 'PPE compliance monitoring', 'Automated alerts'],
      usage: '245 scans today',
      rating: 4.7,
      compliance: ['OSHA 1926', 'ANSI A10', 'NFPA 241']
    },
    { 
      id: 2,
      name: 'Predictive Risk Analytics', 
      description: 'AI-powered prediction of potential safety incidents before they occur',
      category: 'Critical',
      status: 'active',
      icon: <ThunderboltOutlined />,
      features: ['Risk forecasting', 'Incident prevention', 'Trend analysis'],
      usage: '89 predictions this week',
      rating: 4.6,
      compliance: ['OSHA 1926.20', 'ANSI/ASSE A10.1']
    },
    { 
      id: 3,
      name: 'Smart Permit System', 
      description: 'Digital permit management with automated compliance checking',
      category: 'High',
      status: 'active',
      icon: <SafetyCertificateOutlined />,
      features: ['Digital permits', 'Compliance automation', 'Real-time tracking'],
      usage: '156 permits managed',
      rating: 4.8,
      compliance: ['OSHA 1926.452', 'ANSI A92']
    },
    { 
      id: 4,
      name: 'Equipment Safety Monitor', 
      description: 'IoT-enabled equipment monitoring with predictive maintenance',
      category: 'High',
      status: 'active',
      icon: <CodeSandboxOutlined />,
      features: ['IoT sensors', 'Predictive maintenance', 'Usage analytics'],
      usage: '78 equipment monitored',
      rating: 4.5,
      compliance: ['OSHA 1926.600', 'ANSI/ASSE A10.40']
    }
  ];

  const emergencyScenarios = [
    {
      id: 1,
      name: 'Structural Collapse',
      severity: 'Critical',
      duration: '25min',
      complexity: 'High',
      description: 'Emergency response for structural collapse scenarios',
      standard: 'OSHA 1926'
    },
    {
      id: 2,
      name: 'Trench Rescue',
      severity: 'High',
      duration: '20min',
      complexity: 'High',
      description: 'Trench collapse rescue procedure simulation',
      standard: 'OSHA 1926.651'
    },
    {
      id: 3,
      name: 'Electrical Emergency',
      severity: 'Critical',
      duration: '15min',
      complexity: 'Medium',
      description: 'Electrical shock and arc flash emergency response',
      standard: 'OSHA 1926.416'
    },
    {
      id: 4,
      name: 'Fall Rescue',
      severity: 'High',
      duration: '18min',
      complexity: 'Medium',
      description: 'Fall protection rescue procedure simulation',
      standard: 'OSHA 1926.502'
    }
  ];

  // Enhanced equipment columns with safe rendering
const equipmentColumns = [
  {
    title: 'Equipment',
    dataIndex: 'equipment',
    key: 'equipment',
    render: (text, record) => (
      <Space>
        <ToolOutlined />
        {text || 'Unknown Equipment'}
        {record.status === 'Critical' && <AlertFilled style={{ color: '#cf1322' }} />}
      </Space>
    ),
  },
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
    render: (location) => location || 'Not specified'
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (type) => type || 'Unknown'
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={
        status === 'Operational' ? 'green' : 
        status === 'Maintenance' ? 'orange' : 
        status === 'Critical' ? 'red' : 'default'
      }>
        {status || 'Unknown'}
      </Tag>
    ),
  },
  {
    title: 'Last Inspection',
    dataIndex: 'lastInspection',
    key: 'lastInspection',
    render: (date) => date || 'Not inspected'
  },
  {
    title: 'Next Inspection',
    dataIndex: 'nextInspection',
    key: 'nextInspection',
    render: (date) => date || 'Not scheduled'
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Space>
        <Tooltip title="View Details">
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => handleViewEquipment(record)}
          />
        </Tooltip>
        <Tooltip title="Schedule Inspection">
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditEquipment(record)}
          />
        </Tooltip>
      </Space>
    ),
  },
];

// Training report generation handler
const handleGenerateTrainingReport = async () => {
  try {
    setLoading(true);
    message.info('Generating training report...');
    
    const response = await constructionApiService.exportConstructionReport('training', {
      timeframe: '30d',
      includeCompliance: true,
      reportFormat: 'pdf'
    });
    
    if (response.success && response.data) {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `training-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Training report generated successfully!');
    } else {
      message.error('Failed to generate training report');
    }
  } catch (error) {
    console.error('Training report generation error:', error);
    message.error('Failed to generate training report');
  } finally {
    setLoading(false);
  }
};

// Enhanced error handling in API service
const handleConstructionError = (error) => {
  // Construction-specific error handling
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return {
      success: false,
      error: 'Network connectivity issue. Please check your connection to construction safety systems.',
      code: 'NETWORK_ERROR',
      retryable: true,
      severity: 'High'
    };
  }

  // Handle file upload errors specifically
  if (error.response?.status === 413) {
    return {
      success: false,
      error: 'File too large. Please upload a smaller file.',
      code: 'FILE_TOO_LARGE',
      retryable: false,
      severity: 'Medium'
    };
  }

  if (error.response?.status === 415) {
    return {
      success: false,
      error: 'Unsupported file type. Please upload a valid document.',
      code: 'UNSUPPORTED_FILE_TYPE',
      retryable: false,
      severity: 'Medium'
    };
  }

  // ... rest of existing error handling
};
  
  // Enhanced Components
  const SystemHealthMonitor = () => (
    <Card title="System Health Monitor" size="small" extra={<SyncOutlined onClick={loadSystemHealth} />}>
      <Row gutter={[16, 16]}>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>Servers</div>
            <Progress percent={systemHealth.servers || 95} size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <DeploymentUnitOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>Network</div>
            <Progress percent={systemHealth.network || 98} size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <ClusterOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>Database</div>
            <Progress percent={systemHealth.database || 99} size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <ThunderboltOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>AI Services</div>
            <Progress percent={systemHealth.aiServices || 96} size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <AuditOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>Compliance</div>
            <Progress percent={systemHealth.complianceSystems || 94} size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <SafetyOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>Safety Systems</div>
            <Progress percent={realTimeData.safetyCompliance} size="small" />
          </div>
        </Col>
      </Row>
    </Card>
  );

  const StandardsCompliancePanel = () => (
    <Card title="Regulatory Standards Compliance" extra={<GlobalOutlined />}>
      <Row gutter={[16, 16]}>
        {Object.entries(complianceStatus).map(([standard, data]) => (
          <Col span={6} key={standard}>
            <Card 
              size="small"
              hoverable
              actions={[
                <EyeOutlined onClick={() => message.info(`View ${standard.toUpperCase()} Compliance Details`)} />,
                <FileTextOutlined onClick={() => message.info(`Download ${standard.toUpperCase()} Report`)} />
              ]}
            >
              <div style={{ textAlign: 'center' }}>
                <Statistic
                  title={standard.toUpperCase()}
                  value={data.score}
                  suffix="%"
                  valueStyle={{
                    color: data.score >= 90 ? '#3f8600' : data.score >= 80 ? '#faad14' : '#cf1322'
                  }}
                />
                <Tag 
                  color={data.status === 'Compliant' ? 'green' : data.status === 'Partially Compliant' ? 'orange' : 'red'}
                  style={{ marginTop: 8 }}
                >
                  {data.status}
                </Tag>
                <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                  Last Audit: {data.lastAudit}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Divider />
      
      <Steps current={2} size="small">
        <Step title="OSHA 1926" description="Construction Standards" icon={<SafetyCertificateOutlined />} />
        <Step title="ANSI A10" description="Safety Requirements" icon={<ProfileOutlined />} />
        <Step title="NFPA 241" description="Fire Safety" icon={<SolutionOutlined />} />
        <Step title="EPA Compliance" description="Environmental" icon={<BankOutlined />} />
      </Steps>
    </Card>
  );

  const SafetyPerformancePanel = () => (
    <Card title="Safety Performance Indicators (SPIs)" extra={<BarChartOutlined />}>
      <Tabs size="small">
        <TabPane tab="Leading Indicators" key="leading">
          <List
            dataSource={Array.isArray(safetyPerformance.spas) ? safetyPerformance.spas : []}
            renderItem={item => (
              <List.Item
                actions={[
                  <Tag color={
                    item.status === 'exceeded' ? 'green' : 
                    item.status === 'met' ? 'blue' : 'orange'
                  }>
                    {item.status?.toUpperCase() || 'UNKNOWN'}
                  </Tag>
                ]}
              >
                <List.Item.Meta
                  avatar={<Progress type="circle" percent={item.value || 0} width={50} />}
                  title={item.name || 'Unnamed Indicator'}
                  description={
                    <Space>
                      <span>Current: {item.value || 0}%</span>
                      <span>Target: {item.target || 100}%</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane tab="Lagging Indicators" key="lagging">
          <List
            dataSource={Array.isArray(safetyPerformance.spis) ? safetyPerformance.spis : []}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      {item.name || 'Unnamed Indicator'}
                      <Tag color={item.trend === 'improving' ? 'green' : 'blue'}>
                        {item.trend || 'unknown'}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Progress 
                        percent={((item.current || 0) / (item.target || 1)) * 100} 
                        size="small" 
                        status={item.trend === 'improving' ? 'success' : 'normal'}
                        format={() => `${item.current || 0} ${item.unit || ''}`}
                      />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        Target: {item.target || 0} {item.unit || ''}
                      </span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </Card>
  );

  const RiskManagementPanel = () => (
    <Card 
      title="Construction Risk Assessment Matrix" 
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setRiskAssessmentModalVisible(true)}
        >
          New Assessment
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card size="small" title="High Risk" style={{ borderLeft: '4px solid #cf1322' }}>
            <List
              size="small"
              dataSource={Array.isArray(riskMatrix.high) ? riskMatrix.high : []}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.hazard || 'Unknown Hazard'}
                    description={
                      <Space direction="vertical" size={0}>
                        <span>Probability: {item.probability || 'Unknown'}</span>
                        <span>Severity: {item.severity || 'Unknown'}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="Medium Risk" style={{ borderLeft: '4px solid #faad14' }}>
            <List
              size="small"
              dataSource={Array.isArray(riskMatrix.medium) ? riskMatrix.medium : []}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.hazard || 'Unknown Hazard'}
                    description={
                      <Space direction="vertical" size={0}>
                        <span>Probability: {item.probability || 'Unknown'}</span>
                        <span>Severity: {item.severity || 'Unknown'}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="Low Risk" style={{ borderLeft: '4px solid #52c41a' }}>
            <List
              size="small"
              dataSource={Array.isArray(riskMatrix.low) ? riskMatrix.low : []}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.hazard || 'Unknown Hazard'}
                    description={
                      <Space direction="vertical" size={0}>
                        <span>Probability: {item.probability || 'Unknown'}</span>
                        <span>Severity: {item.severity || 'Unknown'}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const EmergencySimulationPanel = () => (
    <Card title="Emergency Scenario Simulator" extra={<AlertFilled style={{ color: '#ff4d4f' }} />}>
      <Row gutter={[16, 16]}>
        {emergencyScenarios.map(scenario => (
          <Col span={12} key={scenario.id}>
            <Card 
              size="small"
              actions={[
                <Button 
                  type="primary" 
                  danger 
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleRunSiteAnalysis()}
                >
                  Run Simulation
                </Button>
              ]}
            >
              <Card.Meta
                avatar={<Avatar icon={<WarningOutlined />} style={{ backgroundColor: '#ff4d4f' }} />}
                title={
                  <Space>
                    {scenario.name}
                    <Tag color={scenario.severity === 'Critical' ? 'red' : 'orange'}>
                      {scenario.severity}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical">
                    <div>{scenario.description}</div>
                    <Space>
                      <Tag>Duration: {scenario.duration}</Tag>
                      <Tag>Standard: {scenario.standard}</Tag>
                    </Space>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );

  const SiteSafetyPanel = () => (
    <Card title="Site Safety Management" extra={<SafetyOutlined />}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card size="small" title="OSHA Compliance">
            <Statistic title="Overall Compliance" value={realTimeData.safetyCompliance} suffix="%" />
            <Progress percent={realTimeData.safetyCompliance} status="active" style={{ marginTop: 16 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="Active Projects">
            <Statistic title="Safety Score" value={92} suffix="/100" />
            <Tag color="green" style={{ marginTop: 16 }}>OSHA Compliant</Tag>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="Safety Systems">
            <Statistic title="Active Monitoring" value={18} />
            <Progress percent={95} size="small" style={{ marginTop: 16 }} />
          </Card>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* Enhanced Debug Header */}
      <Alert
        message={`🏗️ OSHA-Compliant Construction Safety Management System - ${activeTab.toUpperCase()}`}
        description={
          <Space direction="vertical" size={0}>
            <div>Route: {location.pathname} | URL Parameter: {tab} | Active Tab: {activeTab}</div>
            <div>Base Path: /hse/construction | Real-time: {realTimeSocket?.getState?.() === 1 ? '🟢 Connected' : '🔴 Disconnected'}</div>
          </Space>
        }
        type="info"
        showIcon
        action={
          <Space>
            <Button 
              size="small" 
              onClick={debugRouting}
              icon={<BugOutlined />}
            >
              Debug
            </Button>
            <Button 
              size="small" 
              icon={<SyncOutlined />} 
              onClick={() => loadTabData(activeTab)}
              loading={loading}
            >
              Refresh
            </Button>
            <Button type="primary" size="small" icon={<SettingOutlined />}>
              System Settings
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      />

      <Card 
        title={
          <Space>
            <BuildOutlined />
            <span>🏗️ International Construction Safety Management System</span>
            <Tag color="green" icon={<SafetyCertificateOutlined />}>ENTERPRISE EDITION</Tag>
            <Tag color="blue" icon={<GlobalOutlined />}>OSHA COMPLIANT</Tag>
            {loading && <Tag color="orange">Loading...</Tag>}
          </Space>
        } 
        style={{ borderLeft: '6px solid #fa8c16' }}
        extra={
          <Space size="large">
            <Statistic title="Active Workers" value={realTimeData.activeWorkers} prefix={<TeamOutlined />} />
            <Statistic title="Safety Compliance" value={realTimeData.safetyCompliance} suffix="%" />
            <Statistic title="System Health" value={realTimeData.systemHealth} suffix="%" />
            <Statistic title="Active Alerts" value={realTimeData.activeAlerts} prefix={<WarningOutlined />} />
          </Space>
        }
        loading={loading}
      >
        {/* FIXED: Use activeTab for proper tab switching */}
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          type="card"
          animated
        >
          
          {/* Enhanced Dashboard */}
          <TabPane tab={<span><DashboardOutlined /> Safety Dashboard</span>} key="dashboard">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <SystemHealthMonitor />
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <StandardsCompliancePanel />
              </Col>
              <Col span={12}>
                <SafetyPerformancePanel />
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <RiskManagementPanel />
              </Col>
              <Col span={12}>
                <SiteSafetyPanel />
              </Col>
            </Row>
          </TabPane>

          {/* Enhanced Safety Tools */}
<TabPane tab={<span><ToolOutlined /> Safety Tools</span>} key="tools">
  <Row gutter={[16, 16]}>
    {constructionTools.map((tool) => (
      <Col xs={24} md={12} lg={8} key={tool.id}>
        <Card
          hoverable
          actions={[
            <Tooltip title="Launch Tool">
              <PlayCircleOutlined 
                onClick={() => handleSafetyToolAction(tool, 'launch')}
                style={{ color: '#fa8c16' }}
              />
            </Tooltip>,
            <Tooltip title="View Details">
              <EyeOutlined onClick={() => handleSafetyToolAction(tool, 'view')} />
            </Tooltip>,
            <Tooltip title="Compliance Info">
              <AuditOutlined onClick={() => handleSafetyToolAction(tool, 'compliance')} />
            </Tooltip>
          ]}
        >
          <Card.Meta
            avatar={<Avatar icon={tool.icon} style={{ backgroundColor: '#fa8c16' }} />}
            title={
              <Space>
                {tool.name}
                <Tag color={tool.category === 'Critical' ? 'red' : 'orange'}>
                  {tool.category}
                </Tag>
              </Space>
            }
            description={
              <div>
                <p>{tool.description}</p>
                <div style={{ marginTop: 8 }}>
                  <small style={{ color: '#666' }}>
                    <TeamOutlined /> {tool.usage}
                  </small>
                  <br />
                  <small style={{ color: '#666' }}>
                    <StarOutlined /> {tool.rating}/5.0
                  </small>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <Space direction="vertical" size={2}>
                  <div><strong>Compliance:</strong></div>
                  {tool.compliance.map((std, index) => (
                    <Tag key={index} color="blue" size="small">
                      {std}
                    </Tag>
                  ))}
                </Space>
              </div>
            }
          />
        </Card>
      </Col>
    ))}
  </Row>
</TabPane>


         
          {/* Risk Management Tab */}
          <TabPane tab={<span><WarningOutlined /> Risk Management</span>} key="risk">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <RiskManagementPanel />
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <EmergencySimulationPanel />
              </Col>
              <Col span={12}>
                <Card title="Hazard Identification Log">
                  <Timeline>
                    <Timeline.Item color="green">New fall protection system installed</Timeline.Item>
                    <Timeline.Item color="orange">Trench inspection required at Site B</Timeline.Item>
                    <Timeline.Item color="red">Critical finding: Scaffold inspection overdue</Timeline.Item>
                    <Timeline.Item color="blue">Mitigation implemented: Additional guardrails</Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Safety Assurance Tab */}
          <TabPane tab={<span><AuditOutlined /> Safety Assurance</span>} key="assurance">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Safety Audits & Inspections">
                  <List
                    dataSource={[
                      { name: 'OSHA 1926 Audit', date: '2024-01-15', status: 'Completed', score: 91 },
                      { name: 'Fall Protection Inspection', date: '2024-01-20', status: 'Scheduled', score: null },
                      { name: 'Electrical Safety Review', date: '2024-01-08', status: 'Completed', score: 88 },
                      { name: 'Scaffold Compliance Check', date: '2024-02-01', status: 'Pending', score: null }
                    ]}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Tag color={
                            item.status === 'Completed' ? 'green' : 
                            item.status === 'Scheduled' ? 'blue' : 'orange'
                          }>
                            {item.status}
                          </Tag>
                        ]}
                      >
                        <List.Item.Meta
                          title={item.name}
                          description={
                            <Space>
                              <span>Date: {item.date}</span>
                              {item.score && <span>Score: {item.score}%</span>}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Continuous Improvement">
                  <Steps direction="vertical" current={1}>
                    <Step title="Safety Performance Monitoring" description="Real-time SPI tracking" />
                    <Step title="Hazard Identification" description="Proactive risk assessment" />
                    <Step title="Safety Recommendations" description="Implementation planning" />
                    <Step title="Effectiveness Measurement" description="Performance validation" />
                  </Steps>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Documents & Templates Tab */}
          <TabPane tab={<span><FileTextOutlined /> Documents & Templates</span>} key="documents">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card 
                  title="Construction Safety Documents"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setDocumentModalVisible(true)}>
                      Upload Document
                    </Button>
                  }
                >
                  {/* Safe document rendering with array check */}
                  {Array.isArray(documents) && documents.length > 0 ? (
                    <Table 
                      dataSource={documents} 
                      columns={[
                        {
                          title: 'Document',
                          dataIndex: 'name',
                          key: 'name',
                          render: (text) => (
                            <Space>
                              <FileTextOutlined />
                              {text}
                            </Space>
                          ),
                        },
                        {
                          title: 'Type',
                          dataIndex: 'type',
                          key: 'type',
                        },
                        {
                          title: 'Size',
                          dataIndex: 'size',
                          key: 'size',
                        },
                        {
                          title: 'Upload Date',
                          dataIndex: 'uploadDate',
                          key: 'uploadDate',
                        },
                        {
                          title: 'Category',
                          dataIndex: 'category',
                          key: 'category',
                          render: (category) => <Tag color="blue">{category}</Tag>,
                        },
                        {
                          title: 'Actions',
                          key: 'actions',
                          render: (_, record) => (
                            <Space>
                              <Button size="small" icon={<DownloadOutlined />}>Download</Button>
                              <Button size="small" icon={<EyeOutlined />}>View</Button>
                            </Space>
                          ),
                        },
                      ]}
                      pagination={false}
                    />
                  ) : (
                    <Empty 
                      description="No documents available"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button type="primary" icon={<CloudUploadOutlined />} onClick={() => setDocumentModalVisible(true)}>
                        Upload First Document
                      </Button>
                    </Empty>
                  )}
                  
                  <Divider />
                  
                  <Card title="Document Templates" size="small">
                    {/* Safe template rendering with array check */}
                    {Array.isArray(documentTemplates) && documentTemplates.length > 0 ? (
                      <Row gutter={[16, 16]}>
                        {documentTemplates.map((template, index) => (
                          <Col xs={24} sm={12} lg={8} key={template.id || index}>
                            <Card
                              size="small"
                              hoverable
                              actions={[
                                <Tooltip title="Download Template">
                                  <DownloadOutlined onClick={() => message.info(`Downloading ${template.name}`)} />
                                </Tooltip>,
                                <Tooltip title="Preview Template">
                                  <EyeOutlined />
                                </Tooltip>
                              ]}
                            >
                              <Card.Meta
                                avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                                title={template.name}
                                description={
                                  <Space direction="vertical" size={0}>
                                    <div>{template.description}</div>
                                    <Tag color="green" style={{ marginTop: 8 }}>
                                      {template.type}
                                    </Tag>
                                    <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                                      Last Updated: {template.lastUpdated}
                                    </div>
                                  </Space>
                                }
                              />
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <Empty 
                        description="No templates available"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      >
                        <Button type="dashed" icon={<FileTextOutlined />}>
                          Create Template
                        </Button>
                      </Empty>
                    )}
                  </Card>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Safety Metrics Tab */}
          <TabPane tab={<span><BarChartOutlined /> Safety Metrics</span>} key="metrics">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card 
                  title="Lost Time Injury (LTI) Calculator" 
                  extra={
                    <Button 
                      type="primary" 
                      icon={<CalculatorOutlined />}
                      onClick={() => setLtiModalVisible(true)}
                    >
                      Calculate LTI
                    </Button>
                  }
                >
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="Total Work Hours"
                          value={ltiData.totalWorkHours}
                          suffix="hours"
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="Lost Time Injuries"
                          value={ltiData.lostTimeInjuries}
                          valueStyle={{ color: '#cf1322' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="LTI Rate"
                          value={ltiData.calculatedLTI}
                          suffix="per 200,000 hours"
                          valueStyle={{
                            color: ltiData.calculatedLTI < 1.0 ? '#3f8600' : 
                                   ltiData.calculatedLTI < 2.0 ? '#faad14' : '#cf1322'
                          }}
                        />
                      </Card>
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Progress 
                    percent={Math.min((ltiData.calculatedLTI / 3.0) * 100, 100)}
                    status={
                      ltiData.calculatedLTI < 1.0 ? 'success' : 
                      ltiData.calculatedLTI < 2.0 ? 'active' : 'exception'
                    }
                    format={() => `Industry Benchmark: 2.0`}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Other Safety Metrics" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Statistic title="TRIR" value={2.1} suffix="" />
                    <Statistic title="DART Rate" value={1.4} suffix="" />
                    <Statistic title="EMR" value={0.72} suffix="" />
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Safety Performance Trends" size="small">
                  <Timeline>
                    <Timeline.Item color="green">
                      <p>15% reduction in fall incidents</p>
                      <small>Last 6 months</small>
                    </Timeline.Item>
                    <Timeline.Item color="orange">
                      <p>Increased near-miss reporting</p>
                      <small>Positive safety culture indicator</small>
                    </Timeline.Item>
                    <Timeline.Item color="red">
                      <p>Higher equipment incidents in Q4</p>
                      <small>Requires enhanced maintenance schedule</small>
                    </Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Equipment Safety Tab */}
          <TabPane tab={<span><ToolOutlined /> Equipment Safety</span>} key="equipment">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card
                  title="Construction Equipment Management"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setEquipmentModalVisible(true)}>
                      Add Equipment
                    </Button>
                  }
                >
                  {/* Safe equipment rendering with array check */}
                  {Array.isArray(siteInventory) && siteInventory.length > 0 ? (
                    <Table 
                      dataSource={siteInventory} 
                      columns={equipmentColumns}
                      pagination={false}
                      loading={loading}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <ToolOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                      <p style={{ color: '#999', marginBottom: '16px' }}>No equipment data available</p>
                      <Button 
  type="primary" 
  icon={<PlusOutlined />}
  onClick={() => setEquipmentModalVisible(true)}
>
  Add Equipment
</Button>
                    </div>
                  )}
                  
                  {/* Safe statistics with array check */}
                  {Array.isArray(siteInventory) && siteInventory.length > 0 && (
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                      <Col span={6}>
                        <Card size="small">
                          <Statistic title="Total Equipment" value={siteInventory.length} />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small">
                          <Statistic 
                            title="Operational" 
                            value={siteInventory.filter(e => e.status === 'Operational').length} 
                            valueStyle={{ color: '#3f8600' }} 
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small">
                          <Statistic 
                            title="Maintenance Due" 
                            value={siteInventory.filter(e => e.status === 'Maintenance').length} 
                            valueStyle={{ color: '#faad14' }} 
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card size="small">
                          <Statistic 
                            title="Critical" 
                            value={siteInventory.filter(e => e.status === 'Critical').length} 
                            valueStyle={{ color: '#cf1322' }} 
                          />
                        </Card>
                      </Col>
                    </Row>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Incident Management Tab */}
          <TabPane tab={<span><AlertFilled /> Incident Management</span>} key="incidents">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card 
                  title="Construction Incident Reporting & Investigation"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIncidentModalVisible(true)}>
                      Report Incident
                    </Button>
                  }
                >
                  <Tabs>
                    <TabPane tab="Open Incidents" key="open">
                      <List
                        dataSource={Array.isArray(incidents.open) ? incidents.open : []}
                        renderItem={item => (
                          <List.Item
                            actions={[
                              <Button size="small">View Details</Button>,
                              <Button size="small" type="primary">Update</Button>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar style={{ 
                                  backgroundColor: item.severity === 'High' ? '#ff4d4f' : '#faad14'
                                }}>
                                  {item.severity === 'High' ? 'H' : 'M'}
                                </Avatar>
                              }
                              title={item.type || 'Unknown Type'}
                              description={
                                <Space direction="vertical" size={0}>
                                  <div>Location: {item.location || 'Unknown'}</div>
                                  <div>Date: {item.date || 'Unknown'} • Workers Involved: {item.workersInvolved || 0}</div>
                                  <Tag color={
                                    item.status === 'Under Investigation' ? 'orange' : 
                                    item.status === 'Corrective Action Pending' ? 'blue' : 'green'
                                  }>
                                    {item.status || 'Unknown'}
                                  </Tag>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </TabPane>
                    <TabPane tab="Investigation Reports" key="reports">
                      <List
                        dataSource={[
                          { 
                            name: 'Quarterly Safety Analysis Q4 2023', 
                            type: 'Analysis Report',
                            date: '2024-01-10',
                            findings: 8,
                            recommendations: 12
                          },
                          { 
                            name: 'Root Cause Analysis - Fall Incident', 
                            type: 'RCA Report',
                            date: '2024-01-05',
                            findings: 5,
                            recommendations: 6
                          }
                        ]}
                        renderItem={item => (
                          <List.Item
                            actions={[
                              <Button size="small" icon={<DownloadOutlined />}>Download</Button>,
                              <Button size="small" icon={<EyeOutlined />}>View</Button>
                            ]}
                          >
                            <List.Item.Meta
                              avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                              title={item.name}
                              description={
                                <Space direction="vertical" size={0}>
                                  <div>{item.type} • {item.date}</div>
                                  <Space>
                                    <Tag>Findings: {item.findings}</Tag>
                                    <Tag>Recommendations: {item.recommendations}</Tag>
                                  </Space>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </TabPane>
                  </Tabs>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Incident Statistics" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Statistic title="Total Incidents" value={incidents.statistics.total || 24} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Open Cases" value={incidents.statistics.open || 6} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Avg Resolution Time" value={incidents.statistics.avgResolutionTime || "12.5"} suffix="days" />
                    </Col>
                  </Row>
                  <Divider />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Progress percent={45} format={() => 'Fall Incidents: 45%'} />
                    <Progress percent={25} format={() => 'Struck-by: 25%'} />
                    <Progress percent={20} format={() => 'Electrical: 20%'} />
                    <Progress percent={10} format={() => 'Other: 10%'} />
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Incident Trends" size="small">
                  <Timeline>
                    <Timeline.Item color="red">3 Fall incidents this month</Timeline.Item>
                    <Timeline.Item color="orange">8 Near Miss reports</Timeline.Item>
                    <Timeline.Item color="green">5 Safety recommendations implemented</Timeline.Item>
                    <Timeline.Item color="blue">New incident reporting procedure introduced</Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Training & Competence Tab - FIXED */}
<TabPane tab={<span><TeamOutlined /> Training & Competence</span>} key="training">
  <Row gutter={[16, 16]}>
    <Col span={12}>
      <Card title="Construction Safety Training Status">
        {/* FIXED: Safe array handling for trainingModules */}
        <List
          dataSource={Array.isArray(trainingModules) ? trainingModules : getFallbackTrainingModules()}
          renderItem={item => (
            <List.Item
              actions={[
                <Button size="small" icon={<EyeOutlined />}>View</Button>,
                <Button size="small" icon={<EditOutlined />}>Edit</Button>
              ]}
            >
              <List.Item.Meta
                title={item.name || 'Unnamed Training'}
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Progress 
                      percent={((item.completed || 0) / (item.required || 100)) * 100}
                      format={() => `${item.completed || 0}% / ${item.required || 100}%`}
                    />
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Workers: {item.workers || 0} • Deadline: {item.deadline || 'Not set'}
                    </div>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </Col>
    <Col span={12}>
      <Card title="Competence Assessment">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic title="General Laborers" value={45} suffix="/50" />
          </Col>
          <Col span={12}>
            <Statistic title="Equipment Operators" value={28} suffix="/30" />
          </Col>
          <Col span={12}>
            <Statistic title="Supervisors" value={15} suffix="/15" />
          </Col>
          <Col span={12}>
            <Statistic title="Safety Officers" value={8} suffix="/8" />
          </Col>
        </Row>
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Tag color="green" style={{ fontSize: '14px', padding: '8px 16px' }}>
            Overall Competence: 94%
          </Tag>
        </div>
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            block 
            icon={<PlusOutlined />} 
            onClick={() => setTrainingModalVisible(true)}
          >
            Schedule New Training
          </Button>
          <Button 
            block 
            icon={<TeamOutlined />}
            onClick={() => setAssignTrainingModalVisible(true)}
          >
            Assign Training
          </Button>
          <Button 
            block 
            icon={<FileTextOutlined />}
            onClick={handleGenerateTrainingReport}
            loading={loading}
          >
            Generate Training Report
          </Button>
        </Space>
      </Card>
    </Col>
  </Row>
  
  <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
    <Col span={24}>
      <Card 
        title="Training Schedule & Calendar"
        extra={
          <Button 
            type="primary" 
            size="small" 
            icon={<PlusOutlined />}
            onClick={() => setTrainingModalVisible(true)}
          >
            Schedule Training
          </Button>
        }
      >
        <Calendar
          fullscreen={false}
          headerRender={({ value, type, onChange, onTypeChange }) => (
            <div style={{ padding: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Select
                size="small"
                value={type}
                onChange={onTypeChange}
                style={{ width: 100 }}
              >
                <Option value="month">Month</Option>
                <Option value="year">Year</Option>
              </Select>
              <Space>
                <Button size="small" onClick={() => onChange(new Date())}>Today</Button>
                <Button 
                  size="small" 
                  type="primary"
                  onClick={() => setTrainingModalVisible(true)}
                >
                  Schedule Training
                </Button>
              </Space>
            </div>
          )}
        />
      </Card>
    </Col>
  </Row>
</TabPane>

          {/* Environmental Compliance Tab - FIXED */}
          <TabPane tab={<span><EnvironmentOutlined /> Environmental Compliance</span>} key="environmental">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Environmental Monitoring">
                  <List
                    dataSource={Array.isArray(environmentalData) ? environmentalData : getFallbackEnvironmentalData()}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar style={{ 
                              backgroundColor: 
                                item.status === 'Good' ? '#52c41a' : 
                                item.status === 'Moderate' ? '#faad14' : 
                                item.status === 'Acceptable' ? '#1890ff' : '#d9d9d9'
                            }}>
                              {(item.status || 'U').charAt(0)}
                            </Avatar>
                          }
                          title={item.parameter || 'Unknown Parameter'}
                          description={
                            <Space direction="vertical" size={0}>
                              <div>Value: {item.value} {item.unit}</div>
                              <div>Status: {item.status}</div>
                              <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                                Last Updated: {new Date(item.last_updated).toLocaleString()}
                              </div>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Regulatory Compliance Status">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Card size="small">
                      <Statistic title="EPA Compliance" value={89} suffix="%" />
                      <Progress percent={89} size="small" status="active" />
                    </Card>
                    <Card size="small">
                      <Statistic title="Stormwater Management" value={92} suffix="%" />
                      <Progress percent={92} size="small" status="active" />
                    </Card>
                    <Card size="small">
                      <Statistic title="Noise Control" value={85} suffix="%" />
                      <Progress percent={85} size="small" status="active" />
                    </Card>
                    <Card size="small">
                      <Statistic title="Waste Management" value={88} suffix="%" />
                      <Progress percent={88} size="small" status="active" />
                    </Card>
                  </Space>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="Environmental Management & Tracking">
                  <Table
                    columns={[
                      { title: 'Aspect', dataIndex: 'parameter', key: 'parameter' },
                      { title: 'Current Value', dataIndex: 'value', key: 'value', render: (value, record) => `${value} ${record.unit || ''}` },
                      { title: 'Status', dataIndex: 'status', key: 'status', render: status => (
                        <Tag color={
                          status === 'Good' ? 'green' : 
                          status === 'Moderate' ? 'orange' : 
                          status === 'Acceptable' ? 'blue' : 'default'
                        }>
                          {status}
                        </Tag>
                      )},
                      { title: 'Last Updated', dataIndex: 'last_updated', key: 'last_updated', render: date => new Date(date).toLocaleString() },
                      { title: 'Actions', key: 'actions', render: (_, record) => (
                        <Space>
                          <Button size="small" icon={<EyeOutlined />}>Details</Button>
                          <Button size="small" icon={<EditOutlined />}>Update</Button>
                        </Space>
                      )}
                    ]}
                    dataSource={Array.isArray(environmentalData) ? environmentalData : getFallbackEnvironmentalData()}
                    pagination={false}
                    rowKey="parameter"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Safety Communication Tab */}
          <TabPane tab={<span><NotificationOutlined /> Safety Communication</span>} key="communication">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Safety Bulletins & Alerts">
                  <List
                    dataSource={Array.isArray(safetyBulletins) ? safetyBulletins : []}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Button size="small">View</Button>,
                          <Button size="small" type="primary">Acknowledge</Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar style={{ 
                              backgroundColor: item.priority === 'High' ? '#ff4d4f' : '#faad14'
                            }}>
                              {item.priority === 'High' ? 'H' : 'M'}
                            </Avatar>
                          }
                          title={item.title || 'Untitled Bulletin'}
                          description={
                            <Space direction="vertical" size={0}>
                              <div>
                                <span>Issued: {item.date || 'Unknown'}</span>
                                <Tag color={item.status === 'Active' ? 'red' : 'green'} style={{ marginLeft: 8 }}>
                                  {item.status || 'Unknown'}
                                </Tag>
                              </div>
                              <div>
                                <Tag color="blue">{item.category || 'General'}</Tag>
                                <span style={{ marginLeft: 8, fontSize: '12px' }}>
                                  Sites: {Array.isArray(item.sites) ? item.sites.join(', ') : 'All Sites'}
                                </span>
                              </div>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Safety Promotion & Culture">
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                    <h3>Construction Safety Culture Program</h3>
                    <p>Promoting positive safety attitudes and behaviors across all construction sites</p>
                  </div>
                  <Divider />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button type="dashed" block icon={<PlusOutlined />}>
                      Submit Safety Suggestion
                    </Button>
                    <Button type="dashed" block icon={<WarningOutlined />}>
                      Report Safety Concern
                    </Button>
                    <Button type="dashed" block icon={<FileTextOutlined />}>
                      View Safety Newsletters
                    </Button>
                    <Button type="dashed" block icon={<TeamOutlined />}>
                      Join Safety Committee
                    </Button>
                  </Space>
                  <Divider />
                  <div style={{ textAlign: 'center' }}>
                    <Statistic title="Safety Suggestions This Month" value={24} />
                    <Statistic title="Safety Meetings Conducted" value={18} style={{ marginTop: 16 }} />
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="Toolbox Talks & Safety Meetings">
                  <Table
                    columns={[
                      { title: 'Topic', dataIndex: 'topic', key: 'topic' },
                      { title: 'Date', dataIndex: 'date', key: 'date' },
                      { title: 'Presenter', dataIndex: 'presenter', key: 'presenter' },
                      { title: 'Attendees', dataIndex: 'attendees', key: 'attendees' },
                      { title: 'Site', dataIndex: 'site', key: 'site' },
                      { title: 'Status', dataIndex: 'status', key: 'status', render: status => (
                        <Tag color={status === 'Completed' ? 'green' : status === 'Scheduled' ? 'blue' : 'orange'}>
                          {status}
                        </Tag>
                      )},
                      { title: 'Actions', key: 'actions', render: () => (
                        <Space>
                          <Button size="small">View Minutes</Button>
                          <Button size="small">Download</Button>
                        </Space>
                      )}
                    ]}
                    dataSource={[
                      { key: 1, topic: 'Fall Protection Systems', date: '2024-01-15', presenter: 'John Safety', attendees: 45, site: 'Site A', status: 'Completed' },
                      { key: 2, topic: 'Electrical Safety', date: '2024-01-18', presenter: 'Mike Engineer', attendees: 38, site: 'Site B', status: 'Scheduled' },
                      { key: 3, topic: 'Trenching & Excavation', date: '2024-01-10', presenter: 'Sarah Manager', attendees: 52, site: 'Site C', status: 'Completed' },
                      { key: 4, topic: 'Crane Safety Operations', date: '2024-01-22', presenter: 'David Operator', attendees: 28, site: 'Site A', status: 'Scheduled' }
                    ]}
                    pagination={false}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Safety Analytics Tab */}
          <TabPane tab={<span><BarChartOutlined /> Safety Analytics</span>} key="analytics">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Predictive Safety Analytics">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic title="Risk Prediction Accuracy" value={89.2} suffix="%" />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic title="Incident Trend Accuracy" value={85.7} suffix="%" />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic title="Safety Compliance Forecast" value={91.5} suffix="%" />
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Safety Trend Analysis">
                  <Timeline>
                    <Timeline.Item color="green">
                      <p>22% reduction in fall incidents</p>
                      <small>Last 6 months - New guardrail systems effective</small>
                    </Timeline.Item>
                    <Timeline.Item color="orange">
                      <p>Increased electrical near-misses at Site B</p>
                      <small>Requires additional training and supervision</small>
                    </Timeline.Item>
                    <Timeline.Item color="red">
                      <p>Higher equipment incidents in Q4</p>
                      <small>Implement enhanced maintenance schedule</small>
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      <p>Improved safety culture scores</p>
                      <small>Employee engagement initiatives working</small>
                    </Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="AI Safety Insights">
                  <Alert
                    message="Predictive Maintenance Alert"
                    description="Tower Crane A shows wear patterns indicating need for inspection within 14 days."
                    type="warning"
                    showIcon
                  />
                  <Divider />
                  <Alert
                    message="Training Opportunity"
                    description="Site C workers show lower fall protection compliance. Recommend refresher training."
                    type="info"
                    showIcon
                  />
                  <Divider />
                  <Alert
                    message="Weather Impact Prediction"
                    description="Upcoming cold snap may increase slip/fall risks. Prepare site accordingly."
                    type="warning"
                    showIcon
                  />
                  <Divider />
                  <Alert
                    message="Resource Optimization"
                    description="Recommend shifting safety officers to Site A during peak construction hours."
                    type="success"
                    showIcon
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="Advanced Analytics Dashboard">
                  <Row gutter={[16, 16]}>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic title="Leading Indicators" value={94} suffix="%" />
                        <Progress percent={94} size="small" status="active" />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic title="Lagging Indicators" value={88} suffix="%" />
                        <Progress percent={88} size="small" status="active" />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic title="Predictive Accuracy" value={91} suffix="%" />
                        <Progress percent={91} size="small" status="active" />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic title="System Confidence" value={96} suffix="%" />
                        <Progress percent={96} size="small" status="active" />
                      </Card>
                    </Col>
                  </Row>
                  <Divider />
                  <div style={{ textAlign: 'center' }}>
                    <Tag color="green" style={{ fontSize: '16px', padding: '8px 16px' }}>
                      Overall Safety Performance: 92.3%
                    </Tag>
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Regulatory Reporting Tab */}
          <TabPane tab={<span><FileTextOutlined /> Regulatory Reporting</span>} key="reporting">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Mandatory Regulatory Reports">
                  <Table
                    columns={[
                      { title: 'Report Type', dataIndex: 'type', key: 'type' },
                      { title: 'Agency', dataIndex: 'agency', key: 'agency' },
                      { title: 'Frequency', dataIndex: 'frequency', key: 'frequency' },
                      { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate' },
                      { title: 'Status', dataIndex: 'status', key: 'status', render: status => (
                        <Tag color={status === 'Submitted' ? 'green' : status === 'Due Soon' ? 'orange' : 'red'}>
                          {status}
                        </Tag>
                      )},
                      { title: 'Actions', key: 'actions', render: (_, record) => (
                        <Space>
                          <Button size="small">Generate</Button>
                          <Button size="small" type="primary" disabled={record.status === 'Submitted'}>
                            Submit
                          </Button>
                        </Space>
                      )}
                    ]}
                    dataSource={[
                      { 
                        key: 1, 
                        type: 'OSHA 300A Summary', 
                        agency: 'OSHA',
                        frequency: 'Annual', 
                        dueDate: '2024-02-01',
                        status: 'Due Soon'
                      },
                      { 
                        key: 2, 
                        type: 'EPA Stormwater Report', 
                        agency: 'EPA',
                        frequency: 'Quarterly', 
                        dueDate: '2024-01-31',
                        status: 'In Progress'
                      },
                      { 
                        key: 3, 
                        type: 'DOT Incident Report', 
                        agency: 'DOT',
                        frequency: 'As Needed', 
                        dueDate: 'N/A',
                        status: 'Not Started'
                      },
                      { 
                        key: 4, 
                        type: 'State Safety Compliance', 
                        agency: 'State',
                        frequency: 'Monthly', 
                        dueDate: '2024-01-25',
                        status: 'Submitted'
                      }
                    ]}
                    pagination={false}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Report Templates">
                  <List
                    dataSource={[
                      'Construction Incident Report Form',
                      'OSHA 300 Log Template',
                      'Safety Inspection Checklist',
                      'Environmental Compliance Report',
                      'Training Completion Report',
                      'Equipment Maintenance Log'
                    ]}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Button size="small" icon={<DownloadOutlined />}>Download</Button>
                        ]}
                      >
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Reporting Statistics">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic title="Reports This Quarter" value={12} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="On-time Submission" value={95} suffix="%" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Regulatory Findings" value={2} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Compliance Rate" value={96} suffix="%" />
                    </Col>
                  </Row>
                  <Divider />
                  <Alert
                    message="Upcoming Deadline"
                    description="OSHA 300A Summary due on February 1, 2024"
                    type="warning"
                    showIcon
                  />
                  <Divider />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button type="primary" block icon={<FileTextOutlined />}>
                      Generate Compliance Report
                    </Button>
                    <Button block icon={<CloudUploadOutlined />}>
                      Export All Reports
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* System Administration Tab */}
          <TabPane tab={<span><SettingOutlined /> System Administration</span>} key="admin">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="User Management & Permissions">
                  <List
                    dataSource={[
                      { role: 'Safety Manager', users: 4, permissions: 'Full System Access', color: 'red' },
                      { role: 'Site Supervisor', users: 12, permissions: 'Site-level Access', color: 'blue' },
                      { role: 'Safety Officer', users: 8, permissions: 'Safety Operations', color: 'orange' },
                      { role: 'Project Manager', users: 6, permissions: 'Project Access', color: 'green' },
                      { role: 'Viewer', users: 15, permissions: 'Read Only', color: 'purple' }
                    ]}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Button size="small">Manage Users</Button>,
                          <Button size="small" type="primary">Permissions</Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar style={{ backgroundColor: item.color }}>{item.role.charAt(0)}</Avatar>}
                          title={item.role}
                          description={
                            <Space>
                              <span>{item.users} users</span>
                              <Tag>{item.permissions}</Tag>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="System Configuration">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Real-time Site Monitoring</span>
                      <Switch defaultChecked />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Automated Compliance Alerts</span>
                      <Switch defaultChecked />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Predictive Analytics</span>
                      <Switch defaultChecked />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Mobile App Integration</span>
                      <Switch defaultChecked />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Audit Trail</span>
                      <Switch defaultChecked />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Email Notifications</span>
                      <Switch defaultChecked />
                    </div>
                  </Space>
                  <Divider />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button type="primary" block>Save Configuration</Button>
                    <Button block>Reset to Defaults</Button>
                    <Button block type="dashed">Export Configuration</Button>
                  </Space>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Data Management">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button block icon={<DownloadOutlined />}>
                      Export All Safety Data
                    </Button>
                    <Button block icon={<CloudUploadOutlined />}>
                      Backup System Data
                    </Button>
                    <Button block icon={<SyncOutlined />}>
                      Synchronize with Regulatory Databases
                    </Button>
                    <Button block icon={<DatabaseOutlined />}>
                      Database Maintenance
                    </Button>
                    <Button block icon={<FileTextOutlined />}>
                      Generate System Report
                    </Button>
                  </Space>
                  <Divider />
                  <div style={{ textAlign: 'center' }}>
                    <Statistic title="Database Size" value={3.2} suffix="GB" />
                    <Progress percent={72} style={{ marginTop: 8 }} />
                    <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
                      Last Backup: 2024-01-15 02:30 AM
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="System Health & Logs">
                  <Timeline>
                    <Timeline.Item color="green">
                      <p>System backup completed successfully</p>
                      <small>2 hours ago</small>
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      <p>Compliance data synchronized with OSHA database</p>
                      <small>4 hours ago</small>
                    </Timeline.Item>
                    <Timeline.Item color="orange">
                      <p>Warning: High memory usage detected</p>
                      <small>6 hours ago</small>
                    </Timeline.Item>
                    <Timeline.Item color="green">
                      <p>Security patch applied successfully</p>
                      <small>1 day ago</small>
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      <p>User access permissions updated</p>
                      <small>2 days ago</small>
                    </Timeline.Item>
                  </Timeline>
                  <Divider />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button type="primary" block>View Detailed Logs</Button>
                    <Button block>System Diagnostics</Button>
                    <Button block type="dashed">Performance Metrics</Button>
                  </Space>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="API Integrations & Connections">
                  <List
                    dataSource={[
                      { name: 'OSHA Compliance API', status: 'Connected', lastSync: '2024-01-15', health: 'Healthy' },
                      { name: 'Weather Service API', status: 'Connected', lastSync: '2024-01-15', health: 'Healthy' },
                      { name: 'Equipment Monitoring', status: 'Connected', lastSync: '2024-01-15', health: 'Healthy' },
                      { name: 'Timeclock System', status: 'Connected', lastSync: '2024-01-14', health: 'Healthy' },
                      { name: 'Mobile Safety App', status: 'Connected', lastSync: '2024-01-15', health: 'Healthy' }
                    ]}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Tag color={item.health === 'Healthy' ? 'green' : 'red'}>{item.health}</Tag>,
                          <Button size="small">Test</Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<ApiOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                          title={item.name}
                          description={
                            <Space>
                              <Tag color={item.status === 'Connected' ? 'green' : 'red'}>{item.status}</Tag>
                              <span>Last Sync: {item.lastSync}</span>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Enterprise Dashboard Tab */}
          <TabPane tab={<span><DashboardOutlined /> Enterprise Dashboard</span>} key="enterprise">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Multi-Site Construction Safety Overview" extra={<GroupOutlined />}>
                  <Row gutter={[16, 16]}>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic title="Active Sites" value={realTimeData.totalSites || 8} prefix={<EnvironmentFilled />} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic title="Total Workers" value={realTimeData.activeWorkers || 1247} prefix={<TeamOutlined />} />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic title="Safety Compliance" value={realTimeData.safetyCompliance || 93} suffix="%" />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small">
                        <Statistic title="Enterprise Health" value={realTimeData.systemHealth || 96} suffix="%" />
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Site Performance Comparison">
                  <Table
                    columns={[
                      { title: 'Site', dataIndex: 'site', key: 'site' },
                      { title: 'Safety Score', dataIndex: 'score', key: 'score', render: score => (
                        <Progress percent={score} size="small" />
                      )},
                      { title: 'Incidents', dataIndex: 'incidents', key: 'incidents' },
                      { title: 'Compliance', dataIndex: 'compliance', key: 'compliance', render: compliance => (
                        <Tag color={compliance >= 90 ? 'green' : compliance >= 80 ? 'orange' : 'red'}>
                          {compliance}%
                        </Tag>
                      )},
                      { title: 'Status', dataIndex: 'status', key: 'status', render: status => (
                        <Tag color={status === 'Excellent' ? 'green' : status === 'Good' ? 'blue' : 'orange'}>
                          {status}
                        </Tag>
                      )}
                    ]}
                    dataSource={[
                      { key: 1, site: 'Site A - Downtown Tower', score: 94, incidents: 2, compliance: 96, status: 'Excellent' },
                      { key: 2, site: 'Site B - Bridge Project', score: 88, incidents: 5, compliance: 89, status: 'Good' },
                      { key: 3, site: 'Site C - Residential Complex', score: 92, incidents: 3, compliance: 94, status: 'Excellent' },
                      { key: 4, site: 'Site D - Industrial Plant', score: 85, incidents: 7, compliance: 82, status: 'Needs Attention' }
                    ]}
                    pagination={false}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Enterprise Safety Metrics">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card size="small">
                        <Statistic title="Enterprise LTI Rate" value={1.2} suffix="" />
                        <Progress percent={60} format={() => 'Target: < 1.0'} />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small">
                        <Statistic title="Training Completion" value={91} suffix="%" />
                        <Progress percent={91} status="active" />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small">
                        <Statistic title="Audit Compliance" value={94} suffix="%" />
                        <Progress percent={94} status="active" />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small">
                        <Statistic title="Safety ROI" value={128} suffix="%" />
                        <Progress percent={100} format={() => '128% Return'} />
                      </Card>
                    </Col>
                  </Row>
                  <Divider />
                  <Alert
                    message="Enterprise Performance Summary"
                    description="Overall safety performance exceeds industry benchmarks by 15%. Focus on Site D improvement."
                    type="success"
                    showIcon
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="Enterprise Resource Planning">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card title="Safety Personnel" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { role: 'Safety Managers', count: 12, available: 10 },
                            { role: 'Safety Officers', count: 24, available: 22 },
                            { role: 'Site Supervisors', count: 32, available: 30 },
                            { role: 'First Aid Responders', count: 18, available: 16 }
                          ]}
                          renderItem={item => (
                            <List.Item>
                              <List.Item.Meta
                                title={item.role}
                                description={`${item.available}/${item.count} available`}
                              />
                              <Progress percent={(item.available / item.count) * 100} size="small" />
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card title="Equipment & Resources" size="small">
                        <List
                          size="small"
                          dataSource={[
                            { resource: 'Safety Equipment', utilization: 85 },
                            { resource: 'Monitoring Systems', utilization: 92 },
                            { resource: 'Training Facilities', utilization: 78 },
                            { resource: 'Emergency Kits', utilization: 95 }
                          ]}
                          renderItem={item => (
                            <List.Item>
                              <List.Item.Meta
                                title={item.resource}
                                description={`${item.utilization}% utilization`}
                              />
                              <Progress percent={item.utilization} size="small" status="active" />
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card title="Budget & Cost Management" size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Statistic title="Safety Budget" value={1250000} prefix="$" />
                          <Statistic title="Cost Savings" value={285000} prefix="$" />
                          <Statistic title="ROI" value={128} suffix="%" />
                          <Divider />
                          <Alert
                            message="Budget Status: On Track"
                            description="15% under budget with projected savings of $85,000"
                            type="success"
                            showIcon
                          />
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Risk Assessment Modal */}
      <Modal
        title="New Construction Risk Assessment"
        visible={riskAssessmentModalVisible}
        onCancel={() => setRiskAssessmentModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={riskForm} layout="vertical" onFinish={handleRiskAssessment}>
          <Form.Item name="hazard" label="Construction Hazard Description" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Describe the construction hazard..." />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="probability" label="Probability" rules={[{ required: true }]}>
                <Select placeholder="Select probability level">
                  <Option value="frequent">Frequent (Likely to occur often)</Option>
                  <Option value="probable">Probable (Will occur several times)</Option>
                  <Option value="occasional">Occasional (Likely to occur sometime)</Option>
                  <Option value="remote">Remote (Unlikely to occur)</Option>
                  <Option value="improbable">Improbable (Very unlikely to occur)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="severity" label="Severity" rules={[{ required: true }]}>
                <Select placeholder="Select severity level">
                  <Option value="catastrophic">Catastrophic (Multiple fatalities)</Option>
                  <Option value="hazardous">Hazardous (Serious injury/damage)</Option>
                  <Option value="major">Major (Injury/damage)</Option>
                  <Option value="minor">Minor (Minor injury/damage)</Option>
                  <Option value="negligible">Negligible (No significant impact)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="standard" label="Applicable Standard">
            <Select placeholder="Select applicable standard" mode="multiple">
              <Option value="osha_1926">OSHA 1926</Option>
              <Option value="ansi_a10">ANSI A10</Option>
              <Option value="nfpa_241">NFPA 241</Option>
              <Option value="epa_swppp">EPA SWPPP</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit Assessment
              </Button>
              <Button onClick={() => setRiskAssessmentModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Safety Audit Modal */}
      <Modal
        title="Construction Safety Audit Checklist"
        visible={safetyAuditModalVisible}
        onCancel={() => setSafetyAuditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={auditForm} layout="vertical" onFinish={handleSafetyAudit}>
          <Form.Item name="auditType" label="Audit Type" rules={[{ required: true }]}>
            <Select placeholder="Select audit type">
              <Option value="osha_1926">OSHA 1926 Audit</Option>
              <Option value="fall_protection">Fall Protection Inspection</Option>
              <Option value="electrical_safety">Electrical Safety Review</Option>
              <Option value="scaffold_compliance">Scaffold Compliance Check</Option>
            </Select>
          </Form.Item>

          <Form.Item name="findings" label="Audit Findings">
            <TextArea rows={4} placeholder="Document audit findings and observations..." />
          </Form.Item>

          <Form.Item name="recommendations" label="Safety Recommendations">
            <TextArea rows={4} placeholder="Provide safety recommendations and corrective actions..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Complete Audit
              </Button>
              <Button onClick={() => setSafetyAuditModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Incident Report Modal */}
      <Modal
        title="Report Construction Incident"
        visible={incidentModalVisible}
        onCancel={() => setIncidentModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={incidentForm} layout="vertical" onFinish={handleIncidentReport}>
          <Form.Item name="type" label="Incident Type" rules={[{ required: true }]}>
            <Select placeholder="Select incident type">
              <Option value="fall">Fall Incident</Option>
              <Option value="struck_by">Struck-by Object</Option>
              <Option value="electrical">Electrical Incident</Option>
              <Option value="caught_in">Caught-in/between</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item name="location" label="Incident Location" rules={[{ required: true }]}>
            <Input placeholder="Enter incident location" />
          </Form.Item>

          <Form.Item name="description" label="Incident Description">
            <TextArea rows={3} placeholder="Describe what happened..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Report Incident
              </Button>
              <Button onClick={() => setIncidentModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* LTI Calculator Modal */}
      <Modal
        title="LTI Rate Calculator"
        visible={ltiModalVisible}
        onCancel={() => setLtiModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          onFinish={handleLTICalculation}
          initialValues={{
            totalWorkHours: ltiData.totalWorkHours,
            lostTimeInjuries: ltiData.lostTimeInjuries
          }}
        >
          <Form.Item
            name="totalWorkHours"
            label="Total Work Hours"
            rules={[{ required: true, message: 'Please enter total work hours' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              placeholder="Enter total work hours"
            />
          </Form.Item>

          <Form.Item
            name="lostTimeInjuries"
            label="Number of Lost Time Injuries"
            rules={[{ required: true, message: 'Please enter number of injuries' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Enter number of lost time injuries"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<CalculatorOutlined />}>
                Calculate LTI Rate
              </Button>
              <Button onClick={() => setLtiModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {ltiData.calculatedLTI > 0 && (
          <Alert
            message={`LTI Rate: ${ltiData.calculatedLTI} per 200,000 hours`}
            description={
              ltiData.calculatedLTI < 1.0 ? 
                "Excellent safety performance!" :
              ltiData.calculatedLTI < 2.0 ?
                "Average safety performance. Consider additional safety measures." :
                "Safety performance needs improvement. Implement immediate corrective actions."
            }
            type={
              ltiData.calculatedLTI < 1.0 ? 'success' : 
              ltiData.calculatedLTI < 2.0 ? 'warning' : 'error'
            }
            showIcon
          />
        )}
      </Modal>

      {/* Training Assignment Modal */}
      <Modal
        title="Assign Safety Training"
        visible={assignTrainingModalVisible}
        onCancel={() => setAssignTrainingModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={trainingForm} layout="vertical" onFinish={handleTrainingAssignment}>
          <Form.Item name="trainingModule" label="Training Module" rules={[{ required: true }]}>
            <Select placeholder="Select training module">
              <Option value="osha_10">OSHA 10-Hour Construction</Option>
              <Option value="fall_protection">Fall Protection Certification</Option>
              <Option value="scaffold">Scaffold Competent Person</Option>
              <Option value="excavation">Excavation Safety</Option>
              <Option value="crane_rigging">Crane & Rigging Safety</Option>
            </Select>
          </Form.Item>

          <Form.Item name="workers" label="Assign to Workers" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Select workers">
              <Option value="all">All Workers</Option>
              <Option value="site_a">Site A Workers</Option>
              <Option value="site_b">Site B Workers</Option>
              <Option value="supervisors">Supervisors Only</Option>
            </Select>
          </Form.Item>

          <Form.Item name="deadline" label="Completion Deadline" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Assign Training
              </Button>
              <Button onClick={() => setAssignTrainingModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Schedule Training Modal */}
      <Modal
        title="Schedule New Training"
        visible={trainingModalVisible}
        onCancel={() => setTrainingModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical" onFinish={handleScheduleTraining}>
          <Form.Item name="trainingName" label="Training Name" rules={[{ required: true }]}>
            <Input placeholder="Enter training name" />
          </Form.Item>
          
          <Form.Item name="trainingType" label="Training Type" rules={[{ required: true }]}>
            <Select placeholder="Select training type">
              <Option value="osha_10">OSHA 10-Hour Construction</Option>
              <Option value="osha_30">OSHA 30-Hour Construction</Option>
              <Option value="fall_protection">Fall Protection</Option>
              <Option value="scaffold_safety">Scaffold Safety</Option>
              <Option value="electrical_safety">Electrical Safety</Option>
              <Option value="excavation_safety">Excavation Safety</Option>
              <Option value="crane_safety">Crane & Rigging Safety</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="trainer" label="Trainer" rules={[{ required: true }]}>
            <Input placeholder="Enter trainer name" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="location" label="Location">
            <Input placeholder="Enter training location" />
          </Form.Item>
          
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter training description" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Schedule Training
              </Button>
              <Button onClick={() => setTrainingModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Training Modal */}
      <Modal
        title="Assign Training to Workers"
        visible={assignTrainingModalVisible}
        onCancel={() => setAssignTrainingModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={trainingForm} layout="vertical" onFinish={handleTrainingAssignment}>
          <Form.Item name="trainingModule" label="Training Module" rules={[{ required: true }]}>
            <Select placeholder="Select training module">
              <Option value="osha_10">OSHA 10-Hour Construction</Option>
              <Option value="fall_protection">Fall Protection Certification</Option>
              <Option value="scaffold">Scaffold Competent Person</Option>
              <Option value="excavation">Excavation Safety</Option>
              <Option value="crane_rigging">Crane & Rigging Safety</Option>
              <Option value="electrical">Electrical Safety</Option>
              <Option value="hazard_communication">Hazard Communication</Option>
            </Select>
          </Form.Item>

          <Form.Item name="workers" label="Assign to Workers" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Select workers or groups">
              <Option value="all_workers">All Construction Workers</Option>
              <Option value="site_a">Site A Workers</Option>
              <Option value="site_b">Site B Workers</Option>
              <Option value="site_c">Site C Workers</Option>
              <Option value="supervisors">Supervisors Only</Option>
              <Option value="equipment_operators">Equipment Operators</Option>
              <Option value="electrical_crew">Electrical Crew</Option>
              <Option value="carpenters">Carpenters</Option>
              <Option value="laborers">General Laborers</Option>
            </Select>
          </Form.Item>

          <Form.Item name="deadline" label="Completion Deadline" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          
          <Form.Item name="priority" label="Priority">
            <Select placeholder="Select priority level">
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="notes" label="Additional Notes">
            <TextArea rows={3} placeholder="Enter any additional notes or instructions" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Assign Training
              </Button>
              <Button onClick={() => setAssignTrainingModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Equipment Modal */}
      <AddEquipmentModal />
      {/* Document Upload Modal */}
      <DocumentUploadModal />
    </div>
  );
};

export default ConstructionSafety;