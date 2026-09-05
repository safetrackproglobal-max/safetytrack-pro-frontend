// src/pages/Modules/Industries/AviationSafety.js
import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
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
  Timeline,
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
  Carousel,
  Tree,
  Steps,
  Result,
  Timeline as AntTimeline,
  Rate,
  TreeSelect,
  Transfer,
  Cascader,
  DatePicker,
  TimePicker
} from 'antd';
import {
  RocketOutlined,
  FileTextOutlined,
  ToolOutlined,
  DownloadOutlined,
  EditOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  RadarChartOutlined,
  CloudOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  BarChartOutlined,
  HeatMapOutlined,
  ClusterOutlined,
  ApiOutlined,
  SafetyOutlined,
  BugOutlined,
  GatewayOutlined,
  CodeSandboxOutlined,
  DashboardOutlined,
  CalculatorOutlined,
  AlertFilled,
  ClockCircleOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  StarOutlined,
  SettingOutlined,
  DatabaseOutlined,
  LineChartOutlined,
  AuditOutlined,
  ExperimentOutlined,
  BugFilled,
  FireOutlined,
  EnvironmentOutlined,
  ControlOutlined,
  PartitionOutlined,
  ApartmentOutlined,
  DeploymentUnitOutlined,
  SafetyScanOutlined,
  NotificationOutlined,
  ProfileOutlined,
  ProjectOutlined,
  BankOutlined,
  CrownFilled,
  FlagOutlined,
  SolutionOutlined,
  UserSwitchOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import aviationApiService from '../../../services/aviationApiService';

const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Panel } = Collapse;
const { Step } = Steps;
const { TreeNode } = Tree;
const { RangePicker } = DatePicker;

const AviationSafety = () => {
  const { tab = 'dashboard' } = useParams();
  const history = useHistory();
  const [form] = Form.useForm();
  const [riskForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [flightModalVisible, setFlightModalVisible] = useState(false);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [simulationModalVisible, setSimulationModalVisible] = useState(false);
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
  const [riskAssessmentModalVisible, setRiskAssessmentModalVisible] = useState(false);
  const [safetyAuditModalVisible, setSafetyAuditModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Enhanced state management
  const [realTimeData, setRealTimeData] = useState({
    activeFlights: 24,
    safetyRating: 99.7,
    criticalAlerts: 1,
    maintenanceCompliance: 98.5,
    systemHealth: 99.2,
    weatherRisk: 'Low',
    smsCompliance: 95.8
  });

  const [complianceStatus, setComplianceStatus] = useState({
    icao: { score: 92, status: 'Compliant', lastAudit: '2024-01-15' },
    faa: { score: 88, status: 'Partially Compliant', lastAudit: '2024-01-10' },
    easa: { score: 85, status: 'Needs Improvement', lastAudit: '2024-01-08' },
    iata: { score: 95, status: 'Compliant', lastAudit: '2024-01-12' }
  });

  const [safetyPerformance, setSafetyPerformance] = useState({
    spis: [
      { name: 'Runway Excursions', current: 0.12, target: 0.15, trend: 'improving', unit: 'per 10k movements' },
      { name: 'Loss of Control', current: 0.08, target: 0.10, trend: 'stable', unit: 'per 10k flights' },
      { name: 'CFIT', current: 0.05, target: 0.06, trend: 'improving', unit: 'per 10k flights' },
      { name: 'Mid-Air Collisions', current: 0.02, target: 0.03, trend: 'improving', unit: 'per 100k hours' }
    ],
    spas: [
      { name: 'Safety Training Completion', value: 95, target: 90, status: 'exceeded' },
      { name: 'Reported Hazards', value: 87, target: 85, status: 'met' },
      { name: 'Safety Recommendations', value: 92, target: 88, status: 'exceeded' },
      { name: 'Audit Findings Closed', value: 78, target: 80, status: 'below' }
    ]
  });

  const [riskMatrix, setRiskMatrix] = useState({
    high: [
      { id: 1, hazard: 'Engine Failure during Takeoff', probability: 'Remote', severity: 'Catastrophic', riskLevel: 'High' },
      { id: 2, hazard: 'Runway Incursion', probability: 'Occasional', severity: 'Hazardous', riskLevel: 'High' }
    ],
    medium: [
      { id: 3, hazard: 'Cabin Crew Fatigue', probability: 'Probable', severity: 'Major', riskLevel: 'Medium' },
      { id: 4, hazard: 'Weather Diversion', probability: 'Frequent', severity: 'Minor', riskLevel: 'Medium' }
    ],
    low: [
      { id: 5, hazard: 'Minor Technical Delays', probability: 'Frequent', severity: 'Negligible', riskLevel: 'Low' }
    ]
  });

  const [documents, setDocuments] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [systemHealth, setSystemHealth] = useState({
    servers: 95,
    network: 98,
    database: 99,
    aiServices: 96,
    complianceSystems: 94
  });

  // Load enhanced data
  useEffect(() => {
    loadRealTimeData();
    loadDocuments();
    loadSystemHealth();
    loadComplianceStatus();
    loadSafetyPerformance();
  }, []);

  const loadRealTimeData = async () => {
    try {
      const response = await aviationApiService.getRealTimeMetrics();
      if (response.success) {
        setRealTimeData(response.data);
      }
    } catch (error) {
      console.error('Error loading aviation data:', error);
    }
  };

  const loadComplianceStatus = async () => {
    try {
      const response = await aviationApiService.getComplianceStatus();
      if (response.success) {
        setComplianceStatus(response.data);
      }
    } catch (error) {
      console.error('Error loading compliance status:', error);
    }
  };

  const loadSafetyPerformance = async () => {
    try {
      const response = await aviationApiService.getSafetyPerformance();
      if (response.success) {
        setSafetyPerformance(response.data);
      }
    } catch (error) {
      console.error('Error loading safety performance:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await aviationApiService.getDocuments();
      if (response.success) {
        setDocuments(response.data);
      } else {
        setDocuments(aviationDocuments);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments(aviationDocuments);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await aviationApiService.getSystemHealth();
      if (response.success) {
        setSystemHealth(response.data);
      }
    } catch (error) {
      console.error('Error loading system health:', error);
    }
  };

  // Enhanced Handlers
  const handleRunSafetyAnalysis = async () => {
    try {
      const response = await aviationApiService.runComprehensiveSafetyAnalysis();
      if (response.success) {
        message.success('Comprehensive Safety Analysis Completed!');
      }
    } catch (error) {
      message.error('Error running safety analysis');
    }
  };

  const handleRiskAssessment = async (values) => {
    try {
      const response = await aviationApiService.submitRiskAssessment(values);
      if (response.success) {
        message.success('Risk Assessment Submitted Successfully!');
        setRiskAssessmentModalVisible(false);
        riskForm.resetFields();
      }
    } catch (error) {
      message.error('Error submitting risk assessment');
    }
  };

  const handleSafetyAudit = async (values) => {
    try {
      const response = await aviationApiService.submitSafetyAudit(values);
      if (response.success) {
        message.success('Safety Audit Completed Successfully!');
        setSafetyAuditModalVisible(false);
      }
    } catch (error) {
      message.error('Error completing safety audit');
    }
  };

  // Enhanced Aviation Data
  const aviationTools = [
    { 
      id: 1,
      name: 'FOD Detection System', 
      description: 'Advanced Foreign Object Debris detection with AI-powered object recognition',
      category: 'Critical',
      status: 'active',
      icon: <RadarChartOutlined />,
      features: ['AI object recognition', 'Real-time alerts', 'Automated reporting'],
      usage: '245 scans today',
      rating: 4.8,
      compliance: ['ICAO Annex 14', 'FAA AC 150/5220-24']
    },
    { 
      id: 2,
      name: 'Runway Safety Analyzer', 
      description: 'Comprehensive runway condition analysis with predictive risk assessment',
      category: 'Critical',
      status: 'active',
      icon: <SecurityScanOutlined />,
      features: ['Surface condition analysis', 'Weather integration', 'Risk prediction'],
      usage: '89 analyses this week',
      rating: 4.6,
      compliance: ['ICAO Annex 14', 'EASA CS-ADR-DSN']
    },
    { 
      id: 3,
      name: 'Aircraft Maintenance Scheduler', 
      description: 'Intelligent maintenance scheduling with predictive analytics',
      category: 'High',
      status: 'active',
      icon: <ToolOutlined />,
      features: ['Predictive scheduling', 'Compliance tracking', 'Resource optimization'],
      usage: '156 schedules managed',
      rating: 4.7,
      compliance: ['FAA Part 43', 'EASA Part M']
    },
    { 
      id: 4,
      name: 'Emergency Response Simulator', 
      description: 'Advanced emergency scenario simulation with 3D visualization',
      category: 'High',
      status: 'active',
      icon: <CodeSandboxOutlined />,
      features: ['3D simulation', 'Scenario modeling', 'Response optimization'],
      usage: '23 simulations run',
      rating: 4.4,
      compliance: ['ICAO Annex 19', 'IATA AHM']
    }
  ];

  const emergencyScenarios = [
    {
      id: 1,
      name: 'Engine Failure',
      severity: 'High',
      duration: '15min',
      complexity: 'Medium',
      description: 'Simulate single engine failure during takeoff',
      standard: 'ICAO Annex 6'
    },
    {
      id: 2,
      name: 'Emergency Landing',
      severity: 'Critical',
      duration: '25min',
      complexity: 'High',
      description: 'Full emergency landing procedure simulation',
      standard: 'FAA Part 121'
    },
    {
      id: 3,
      name: 'Cabin Pressure Loss',
      severity: 'High',
      duration: '12min',
      complexity: 'Medium',
      description: 'Rapid decompression scenario',
      standard: 'EASA CS-25'
    },
    {
      id: 4,
      name: 'Security Threat',
      severity: 'Critical',
      duration: '30min',
      complexity: 'High',
      description: 'In-flight security incident response',
      standard: 'ICAO Annex 17'
    }
  ];

  // Enhanced Components
  const SystemHealthMonitor = () => (
    <Card title="System Health Monitor" size="small" extra={<SyncOutlined onClick={loadSystemHealth} />}>
      <Row gutter={[16, 16]}>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>Servers</div>
            <Progress percent={systemHealth.servers} size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <DeploymentUnitOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>Network</div>
            <Progress percent={systemHealth.network} size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <ClusterOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>Database</div>
            <Progress percent={systemHealth.database} size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <ThunderboltOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>AI Services</div>
            <Progress percent={systemHealth.aiServices} size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <AuditOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>Compliance</div>
            <Progress percent={systemHealth.complianceSystems} size="small" />
          </div>
        </Col>
        <Col span={4}>
          <div style={{ textAlign: 'center' }}>
            <SafetyOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            <div>SMS</div>
            <Progress percent={realTimeData.smsCompliance} size="small" />
          </div>
        </Col>
      </Row>
    </Card>
  );

  const StandardsCompliancePanel = () => (
    <Card title="International Standards Compliance" extra={<GlobalOutlined />}>
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
        <Step title="ICAO Annex 19" description="SMS Implementation" icon={<SafetyCertificateOutlined />} />
        <Step title="FAA Part 5" description="Safety Management" icon={<ProfileOutlined />} />
        <Step title="EASA ORO" description="Operator Requirements" icon={<SolutionOutlined />} />
        <Step title="IATA ISARP" description="Ground Operations" icon={<BankOutlined />} />
      </Steps>
    </Card>
  );

  const SafetyPerformancePanel = () => (
    <Card title="Safety Performance Indicators (SPIs)" extra={<BarChartOutlined />}>
      <Tabs size="small">
        <TabPane tab="Leading Indicators" key="leading">
          <List
            dataSource={safetyPerformance.spas}
            renderItem={item => (
              <List.Item
                actions={[
                  <Tag color={
                    item.status === 'exceeded' ? 'green' : 
                    item.status === 'met' ? 'blue' : 'orange'
                  }>
                    {item.status.toUpperCase()}
                  </Tag>
                ]}
              >
                <List.Item.Meta
                  avatar={<Progress type="circle" percent={item.value} width={50} />}
                  title={item.name}
                  description={
                    <Space>
                      <span>Current: {item.value}%</span>
                      <span>Target: {item.target}%</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane tab="Lagging Indicators" key="lagging">
          <List
            dataSource={safetyPerformance.spis}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      {item.name}
                      <Tag color={item.trend === 'improving' ? 'green' : 'blue'}>
                        {item.trend}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Progress 
                        percent={(item.current / item.target) * 100} 
                        size="small" 
                        status={item.trend === 'improving' ? 'success' : 'normal'}
                        format={() => `${item.current} ${item.unit}`}
                      />
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        Target: {item.target} {item.unit}
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
      title="Risk Assessment Matrix" 
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
              dataSource={riskMatrix.high}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.hazard}
                    description={
                      <Space direction="vertical" size={0}>
                        <span>Probability: {item.probability}</span>
                        <span>Severity: {item.severity}</span>
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
              dataSource={riskMatrix.medium}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.hazard}
                    description={
                      <Space direction="vertical" size={0}>
                        <span>Probability: {item.probability}</span>
                        <span>Severity: {item.severity}</span>
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
              dataSource={riskMatrix.low}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.hazard}
                    description={
                      <Space direction="vertical" size={0}>
                        <span>Probability: {item.probability}</span>
                        <span>Severity: {item.severity}</span>
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
    <Card title="Emergency Scenario Simulator" extra={<BugFilled style={{ color: '#ff4d4f' }} />}>
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
                  onClick={() => handleRunEmergencySimulation(scenario)}
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
      {simulationProgress > 0 && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={simulationProgress} status="active" />
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            Running emergency simulation...
          </div>
        </div>
      )}
    </Card>
  );

  const CrewResourceManagementPanel = () => (
    <Card title="Crew Resource Management (CRM)" extra={<TeamOutlined />}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card size="small" title="CRM Training Status">
            <Statistic title="Completion Rate" value={87} suffix="%" />
            <Progress percent={87} status="active" style={{ marginTop: 16 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="Fatigue Risk Management">
            <Statistic title="FRMS Compliance" value={92} suffix="%" />
            <Tag color="green" style={{ marginTop: 16 }}>ICAO Compliant</Tag>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="Competency Assessment">
            <Statistic title="Average Score" value={4.2} suffix="/5.0" />
            <Rate disabled defaultValue={4} style={{ marginTop: 16 }} />
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const handleRunEmergencySimulation = (scenario) => {
    message.info(`Starting ${scenario.name} simulation...`);
  };

  const IncidentList = ({ status }) => (
    <List
      dataSource={[
        { id: 1, type: 'Runway Incursion', date: '2024-01-15', severity: 'High', status: 'open' },
        { id: 2, type: 'Ground Handling', date: '2024-01-14', severity: 'Medium', status: 'investigation' },
        { id: 3, type: 'Technical Delay', date: '2024-01-13', severity: 'Low', status: 'closed' }
      ].filter(item => item.status === status)}
      renderItem={item => (
        <List.Item
          actions={[
            <Button size="small">View Details</Button>,
            <Button size="small" type="primary">Update</Button>
          ]}
        >
          <List.Item.Meta
            avatar={<Avatar style={{ backgroundColor: item.severity === 'High' ? '#ff4d4f' : '#faad14' }}>
              {item.severity.charAt(0)}
            </Avatar>}
            title={item.type}
            description={`Date: ${item.date} | Status: ${item.status}`}
          />
        </List.Item>
      )}
    />
  );

  const SafetyRecommendationsPanel = () => (
    <Card title="Safety Recommendations" size="small">
      <List
        dataSource={[
          { id: 1, description: 'Implement additional runway lighting', priority: 'High', status: 'Pending' },
          { id: 2, description: 'Update emergency response procedures', priority: 'Medium', status: 'In Progress' },
          { id: 3, description: 'Enhance crew resource management training', priority: 'High', status: 'Completed' }
        ]}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={item.description}
              description={
                <Space>
                  <Tag color={item.priority === 'High' ? 'red' : 'orange'}>{item.priority}</Tag>
                  <Tag color={item.status === 'Completed' ? 'green' : 'blue'}>{item.status}</Tag>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  return (
    <div style={{ padding: '24px' }}>
      {/* Enhanced Header */}
      <Alert
        message="✈️ ICAO-Compliant Aviation Safety Management System"
        description="Fully aligned with international standards including ICAO Annex 19, FAA Part 5, EASA ORO, and IATA ISARP. Enterprise edition with comprehensive safety management capabilities."
        type="success"
        showIcon
        action={
          <Space>
            <Button type="primary" size="small" icon={<SettingOutlined />}>
              System Settings
            </Button>
            <Button size="small" icon={<SyncOutlined />} onClick={loadRealTimeData}>
              Refresh Data
            </Button>
            <Button size="small" icon={<AuditOutlined />} onClick={() => setSafetyAuditModalVisible(true)}>
              Safety Audit
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      />

      <Card
        title={
          <Space>
            <RocketOutlined />
            <span>✈️ International Aviation Safety Management System</span>
            <Tag color="green" icon={<SafetyCertificateOutlined />}>ENTERPRISE EDITION</Tag>
            <Tag color="blue" icon={<GlobalOutlined />}>ICAO COMPLIANT</Tag>
          </Space>
        } 
        style={{ borderLeft: '6px solid #13c2c2' }}
        extra={
          <Space size="large">
            <Statistic title="Active Flights" value={realTimeData.activeFlights} prefix={<CloudOutlined />} />
            <Statistic title="Safety Rating" value={realTimeData.safetyRating} suffix="%" />
            <Statistic title="SMS Compliance" value={realTimeData.smsCompliance} suffix="%" />
            <Statistic title="Weather Risk" value={realTimeData.weatherRisk} />
          </Space>
        }
      >
        <Tabs activeKey={tab} onChange={(key) => history.push(`/hse/aviation/${key}`)}>
          
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
                <CrewResourceManagementPanel />
              </Col>
            </Row>
          </TabPane>

          {/* Enhanced Safety Tools */}
          <TabPane tab={<span><ToolOutlined /> Safety Tools</span>} key="tools">
            <Row gutter={[16, 16]}>
              {aviationTools.map((tool) => (
                <Col xs={24} md={12} lg={8} key={tool.id}>
                  <Card
                    hoverable
                    actions={[
                      <Tooltip title="Launch Tool">
                        <PlayCircleOutlined 
                          onClick={() => handleRunSafetyAnalysis()}
                          style={{ color: '#13c2c2' }}
                        />
                      </Tooltip>,
                      <Tooltip title="View Details">
                        <EyeOutlined />
                      </Tooltip>,
                      <Tooltip title="Compliance Info">
                        <AuditOutlined />
                      </Tooltip>
                    ]}
                  >
                    <Card.Meta
                      avatar={<Avatar icon={tool.icon} style={{ backgroundColor: '#13c2c2' }} />}
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
                    <Timeline.Item color="green">New hazard identified: Wet runway conditions</Timeline.Item>
                    <Timeline.Item color="orange">Risk assessment required: Crew scheduling</Timeline.Item>
                    <Timeline.Item color="red">Critical finding: Emergency equipment inspection overdue</Timeline.Item>
                    <Timeline.Item color="blue">Mitigation implemented: Additional runway lighting</Timeline.Item>
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
                      { name: 'ICAO SMS Audit', date: '2024-01-15', status: 'Completed', score: 92 },
                      { name: 'FAA Part 121 Inspection', date: '2024-01-20', status: 'Scheduled', score: null },
                      { name: 'Internal Safety Audit', date: '2024-01-08', status: 'Completed', score: 88 },
                      { name: 'EASA ORO Assessment', date: '2024-02-01', status: 'Pending', score: null }
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

          {/* Incident Management Tab */}
          <TabPane tab={<span><AlertFilled /> Incident Management</span>} key="incidents">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card 
                  title="Incident Reporting & Investigation"
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIncidentModalVisible(true)}>
                      Report Incident
                    </Button>
                  }
                >
                  <Tabs>
                    <TabPane tab="Open Incidents" key="open">
                      <IncidentList status="open" />
                    </TabPane>
                    <TabPane tab="Under Investigation" key="investigation">
                      <IncidentList status="investigation" />
                    </TabPane>
                    <TabPane tab="Closed Incidents" key="closed">
                      <IncidentList status="closed" />
                    </TabPane>
                    <TabPane tab="Safety Recommendations" key="recommendations">
                      <SafetyRecommendationsPanel />
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
                      <Statistic title="Total Incidents" value={24} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Open Cases" value={8} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Avg Resolution Time" value="14.5" suffix="days" />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Incident Trends" size="small">
                  <Timeline>
                    <Timeline.Item color="red">3 Runway Incursions this month</Timeline.Item>
                    <Timeline.Item color="orange">5 Ground Handling incidents</Timeline.Item>
                    <Timeline.Item color="green">2 Safety recommendations implemented</Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Safety Training & Competence Tab */}
          <TabPane tab={<span><TeamOutlined /> Training & Competence</span>} key="training">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Crew Training Status">
                  <List
                    dataSource={[
                      { name: 'CRM Initial', completed: 95, required: 100 },
                      { name: 'Emergency Procedures', completed: 88, required: 90 },
                      { name: 'Safety Management', completed: 92, required: 95 },
                      { name: 'Human Factors', completed: 85, required: 85 }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.name}
                          description={
                            <Progress 
                              percent={(item.completed / item.required) * 100}
                              format={() => `${item.completed}% / ${item.required}%`}
                            />
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
                      <Statistic title="Pilots Certified" value={156} suffix="/160" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Cabin Crew" value={289} suffix="/300" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Maintenance Staff" value={78} suffix="/80" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Ground Staff" value={124} suffix="/130" />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="Training Schedule & Calendar">
                  <Calendar
                    fullscreen={false}
                    headerRender={({ value, type, onChange, onTypeChange }) => (
                      <div style={{ padding: 8 }}>
                        <Select
                          size="small"
                          value={type}
                          onChange={onTypeChange}
                          style={{ width: 100 }}
                        >
                          <Option value="month">Month</Option>
                          <Option value="year">Year</Option>
                        </Select>
                      </div>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Maintenance Safety Tab */}
          <TabPane tab={<span><ToolOutlined /> Maintenance Safety</span>} key="maintenance">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Aircraft Maintenance Status">
                  <List
                    dataSource={[
                      { aircraft: 'B737-800', tail: 'N123AA', status: 'In Service', nextCheck: '2024-02-15' },
                      { aircraft: 'A320', tail: 'N456BB', status: 'Maintenance', nextCheck: '2024-02-12' },
                      { aircraft: 'B767', tail: 'N789CC', status: 'In Service', nextCheck: '2024-02-20' },
                      { aircraft: 'B737', tail: 'N321DD', status: 'Check Due', nextCheck: '2024-01-30' }
                    ]}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Tag color={
                            item.status === 'In Service' ? 'green' : 
                            item.status === 'Maintenance' ? 'orange' : 'red'
                          }>
                            {item.status}
                          </Tag>
                        ]}
                      >
                        <List.Item.Meta
                          title={`${item.aircraft} (${item.tail})`}
                          description={`Next Check: ${item.nextCheck}`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Maintenance Compliance">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Progress type="circle" percent={96} format={() => 'EASA\nPart M'} />
                    </Col>
                    <Col span={12}>
                      <Progress type="circle" percent={94} format={() => 'FAA\nPart 43'} />
                    </Col>
                  </Row>
                  <Divider />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Progress percent={98} size="small" format={() => 'Scheduled Maintenance'} />
                    <Progress percent={95} size="small" format={() => 'Unscheduled Maintenance'} />
                    <Progress percent={92} size="small" format={() => 'Component Overhaul'} />
                  </Space>
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
                    dataSource={[
                      { 
                        title: 'Winter Operations Advisory', 
                        priority: 'High', 
                        date: '2024-01-15',
                        status: 'Active'
                      },
                      { 
                        title: 'Runway Condition Reporting Update', 
                        priority: 'Medium', 
                        date: '2024-01-12',
                        status: 'Active'
                      },
                      { 
                        title: 'New Security Procedures', 
                        priority: 'High', 
                        date: '2024-01-10',
                        status: 'Acknowledged'
                      }
                    ]}
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
                          title={item.title}
                          description={
                            <Space>
                              <span>Issued: {item.date}</span>
                              <Tag color={item.status === 'Active' ? 'red' : 'green'}>{item.status}</Tag>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Safety Promotion">
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                    <h3>Safety Culture Program</h3>
                    <p>Promoting positive safety attitudes and behaviors</p>
                  </div>
                  <Divider />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button type="dashed" block>Submit Safety Suggestion</Button>
                    <Button type="dashed" block>Report Safety Concern</Button>
                    <Button type="dashed" block>View Safety Newsletters</Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Regulatory Reporting Tab */}
          <TabPane tab={<span><FileTextOutlined /> Regulatory Reporting</span>} key="reporting">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Mandatory Safety Reports">
                  <Table
                    columns={[
                      { title: 'Report Type', dataIndex: 'type', key: 'type' },
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
                          <Button size="small" type="primary">Submit</Button>
                        </Space>
                      )}
                    ]}
                    dataSource={[
                      { 
                        key: 1, 
                        type: 'ICAO ADRE Report', 
                        frequency: 'Monthly', 
                        dueDate: '2024-02-05',
                        status: 'Due Soon'
                      },
                      { 
                        key: 2, 
                        type: 'FAA ASAP Report', 
                        frequency: 'Quarterly', 
                        dueDate: '2024-03-15',
                        status: 'Not Started'
                      },
                      { 
                        key: 3, 
                        type: 'EASA Annual Safety Report', 
                        frequency: 'Annual', 
                        dueDate: '2024-12-31',
                        status: 'In Progress'
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
                      'Incident Report Form',
                      'Safety Performance Report',
                      'Risk Assessment Template',
                      'Audit Report Template'
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
                      <Statistic title="Reports This Month" value={12} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="On-time Submission" value={95} suffix="%" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Regulatory Findings" value={2} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Compliance Rate" value={98} suffix="%" />
                    </Col>
                  </Row>
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
                        <Statistic title="Risk Prediction Accuracy" value={94.2} suffix="%" />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic title="Trend Analysis Confidence" value={89.7} suffix="%" />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic title="Anomaly Detection Rate" value={96.5} suffix="%" />
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
                      <p>15% reduction in runway incidents</p>
                      <small>Last 6 months</small>
                    </Timeline.Item>
                    <Timeline.Item color="orange">
                      <p>Increased ground handling events</p>
                      <small>Requires investigation</small>
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      <p>Improved safety reporting culture</p>
                      <small>25% more reports submitted</small>
                    </Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="AI Safety Insights">
                  <Alert
                    message="Predictive Alert"
                    description="Increased probability of weather-related delays in Northeast region next week."
                    type="warning"
                    showIcon
                  />
                  <Divider />
                  <Alert
                    message="Maintenance Recommendation"
                    description="Schedule additional checks for B737 fleet based on usage patterns."
                    type="info"
                    showIcon
                  />
                  <Divider />
                  <Alert
                    message="Training Opportunity"
                    description="Identify crew members requiring recurrent emergency procedure training."
                    type="success"
                    showIcon
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* System Administration Tab */}
          <TabPane tab={<span><SettingOutlined /> System Administration</span>} key="admin">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="User Management">
                  <List
                    dataSource={[
                      { role: 'Safety Manager', users: 5, permissions: 'Full Access' },
                      { role: 'Operations Staff', users: 12, permissions: 'Limited Access' },
                      { role: 'Crew Members', users: 45, permissions: 'Reporting Only' },
                      { role: 'Auditors', users: 3, permissions: 'Read Only' }
                    ]}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Button size="small">Manage</Button>
                        ]}
                      >
                        <List.Item.Meta
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
                    <div>
                      <strong>Data Retention Policy</strong>
                      <Switch defaultChecked style={{ marginLeft: 8 }} />
                    </div>
                    <div>
                      <strong>Automatic Backup</strong>
                      <Switch defaultChecked style={{ marginLeft: 8 }} />
                    </div>
                    <div>
                      <strong>Real-time Alerts</strong>
                      <Switch defaultChecked style={{ marginLeft: 8 }} />
                    </div>
                    <div>
                      <strong>Compliance Monitoring</strong>
                      <Switch defaultChecked style={{ marginLeft: 8 }} />
                    </div>
                  </Space>
                  <Divider />
                  <Button type="primary" block>Save Configuration</Button>
                </Card>
              </Col>
            </Row>
          </TabPane>

        </Tabs>
      </Card>

      {/* Risk Assessment Modal */}
      <Modal
        title="New Risk Assessment"
        visible={riskAssessmentModalVisible}
        onCancel={() => setRiskAssessmentModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={riskForm} layout="vertical" onFinish={handleRiskAssessment}>
          <Form.Item name="hazard" label="Hazard Description" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Describe the potential hazard..." />
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
              <Option value="icao_annex19">ICAO Annex 19</Option>
              <Option value="faa_part5">FAA Part 5</Option>
              <Option value="easa_oro">EASA ORO</Option>
              <Option value="iata_ahm">IATA AHM</Option>
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
        title="Safety Audit Checklist"
        visible={safetyAuditModalVisible}
        onCancel={() => setSafetyAuditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical" onFinish={handleSafetyAudit}>
          <Form.Item name="auditType" label="Audit Type" rules={[{ required: true }]}>
            <Select placeholder="Select audit type">
              <Option value="icao_sms">ICAO SMS Audit</Option>
              <Option value="faa_part121">FAA Part 121 Inspection</Option>
              <Option value="easa_oro">EASA ORO Assessment</Option>
              <Option value="internal">Internal Safety Audit</Option>
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
    </div>
  );
};

// Sample data (in real implementation, this would come from API)
const aviationDocuments = [
  { 
    id: 1,
    name: 'Safety Management System Manual', 
    type: 'Manual', 
    format: '.docx', 
    size: '5.2MB',
    category: 'Critical',
    lastUpdated: '2024-01-15',
    downloads: 234,
    description: 'Complete safety management system manual for aviation operations',
    tags: ['SMS', 'Manual', 'Safety'],
    standard: 'ICAO Annex 19'
  },
  { 
    id: 2,
    name: 'Emergency Response Plan', 
    type: 'Plan', 
    format: '.pdf', 
    size: '3.8MB',
    category: 'Critical',
    lastUpdated: '2024-01-10',
    downloads: 189,
    description: 'Comprehensive emergency response and evacuation procedures',
    tags: ['Emergency', 'Response', 'Procedures'],
    standard: 'FAA Part 139'
  }
];

export default AviationSafety;