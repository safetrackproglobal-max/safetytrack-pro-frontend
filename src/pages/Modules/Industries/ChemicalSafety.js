// src/pages/Modules/Industries/ChemicalSafety.js
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
  Steps,
  Result
} from 'antd';
import {
  ExperimentOutlined,
  FileTextOutlined,
  ToolOutlined,
  DownloadOutlined,
  EditOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
  FireOutlined,
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
  ExperimentFilled,
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
  DeploymentUnitOutlined
} from '@ant-design/icons';
import chemicalSafetyService from '../../../services/chemicalApiService';

const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Panel } = Collapse;
const { Step } = Steps;

const ChemicalSafety = () => {
  const { tab = 'dashboard' } = useParams();
  const history = useHistory();
  const [form] = Form.useForm();
  const [riskForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [chemicalModalVisible, setChemicalModalVisible] = useState(false);
  const [incidentModalVisible, setIncidentModalVisible] = useState(false);
  const [riskAssessmentModalVisible, setRiskAssessmentModalVisible] = useState(false);
  const [safetyAuditModalVisible, setSafetyAuditModalVisible] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState(null);
  
  // Enhanced state management
  const [realTimeData, setRealTimeData] = useState({
    activeProcesses: 18,
    psmCompliance: 96,
    criticalAlerts: 2,
    inventoryAccuracy: 98,
    systemHealth: 97.5,
    environmentalRisk: 'Medium'
  });

  const [complianceStatus, setComplianceStatus] = useState({
    osha: { score: 94, status: 'Compliant', lastAudit: '2024-01-15' },
    epa: { score: 89, status: 'Partially Compliant', lastAudit: '2024-01-10' },
    nfpa: { score: 92, status: 'Compliant', lastAudit: '2024-01-08' },
    reach: { score: 85, status: 'Needs Improvement', lastAudit: '2024-01-12' }
  });

  const [safetyPerformance, setSafetyPerformance] = useState({
    spis: [
      { name: 'Process Safety Incidents', current: 0.08, target: 0.10, trend: 'improving', unit: 'per 100k hours' },
      { name: 'Chemical Releases', current: 0.12, target: 0.15, trend: 'stable', unit: 'per year' },
      { name: 'Emergency Shutdowns', current: 0.05, target: 0.08, trend: 'improving', unit: 'per quarter' },
      { name: 'Near Miss Reports', current: 2.3, target: 3.0, trend: 'improving', unit: 'per month' }
    ],
    spas: [
      { name: 'PSM Training Completion', value: 95, target: 90, status: 'exceeded' },
      { name: 'Safety System Tests', value: 88, target: 85, status: 'met' },
      { name: 'Inspection Compliance', value: 96, target: 95, status: 'exceeded' },
      { name: 'Procedure Updates', value: 82, target: 85, status: 'below' }
    ]
  });

  const [riskMatrix, setRiskMatrix] = useState({
    high: [
      { id: 1, hazard: 'Runaway Reaction Risk', probability: 'Remote', severity: 'Catastrophic', riskLevel: 'High' },
      { id: 2, hazard: 'Major Chemical Release', probability: 'Occasional', severity: 'Hazardous', riskLevel: 'High' }
    ],
    medium: [
      { id: 3, hazard: 'Equipment Corrosion', probability: 'Probable', severity: 'Major', riskLevel: 'Medium' },
      { id: 4, hazard: 'Minor Spill Incidents', probability: 'Frequent', severity: 'Minor', riskLevel: 'Medium' }
    ],
    low: [
      { id: 5, hazard: 'Documentation Updates', probability: 'Frequent', severity: 'Negligible', riskLevel: 'Low' }
    ]
  });

  const [chemicalInventory, setChemicalInventory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
    loadChemicalInventory();
    loadDocuments();
    loadSystemHealth();
    loadComplianceStatus();
    loadSafetyPerformance();
  }, []);

  const loadRealTimeData = async () => {
    try {
      const response = await chemicalSafetyService.getRealTimeMetrics();
      if (response.success) {
        setRealTimeData(response.data);
      }
    } catch (error) {
      console.error('Error loading chemical data:', error);
    }
  };

  const loadComplianceStatus = async () => {
    try {
      const response = await chemicalSafetyService.getComplianceStatus();
      if (response.success) {
        setComplianceStatus(response.data);
      }
    } catch (error) {
      console.error('Error loading compliance status:', error);
    }
  };

  const loadSafetyPerformance = async () => {
    try {
      const response = await chemicalSafetyService.getSafetyPerformance();
      if (response.success) {
        setSafetyPerformance(response.data);
      }
    } catch (error) {
      console.error('Error loading safety performance:', error);
    }
  };

  const loadChemicalInventory = async () => {
    try {
      setLoading(true);
      const response = await chemicalSafetyService.getChemicalInventory();
      if (response.success) {
        setChemicalInventory(response.data);
      }
    } catch (error) {
      console.error('Error loading chemical inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await chemicalSafetyService.getChemicalDocuments();
      if (response.success) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await chemicalSafetyService.getSystemHealth();
      if (response.success) {
        setSystemHealth(response.data);
      }
    } catch (error) {
      console.error('Error loading system health:', error);
    }
  };

  // Enhanced Handlers
  const handleRunHazardAnalysis = async () => {
    try {
      const response = await chemicalSafetyService.runProcessHazardAnalysis();
      if (response.success) {
        message.success('Process Hazard Analysis Completed!');
      }
    } catch (error) {
      message.error('Error running hazard analysis');
    }
  };

  const handleRiskAssessment = async (values) => {
    try {
      const response = await chemicalSafetyService.submitRiskAssessment(values);
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
      const response = await chemicalSafetyService.submitSafetyAudit(values);
      if (response.success) {
        message.success('Safety Audit Completed Successfully!');
        setSafetyAuditModalVisible(false);
      }
    } catch (error) {
      message.error('Error completing safety audit');
    }
  };

  const handleChemicalSubmit = async (values) => {
    try {
      if (selectedChemical) {
        await chemicalSafetyService.updateChemical(selectedChemical.id, values);
        message.success('Chemical updated successfully');
      } else {
        await chemicalSafetyService.addChemical(values);
        message.success('Chemical added successfully');
      }
      setChemicalModalVisible(false);
      setSelectedChemical(null);
      form.resetFields();
      loadChemicalInventory();
    } catch (error) {
      message.error('Failed to save chemical');
    }
  };

  // Enhanced Chemical Safety Data
  const chemicalTools = [
    { 
      id: 1,
      name: 'Chemical Reactivity Matrix', 
      description: 'Analyze chemical compatibility and reactivity hazards with real-time compatibility checking',
      category: 'Critical',
      status: 'active',
      icon: <HeatMapOutlined />,
      features: ['Real-time compatibility', 'Hazard prediction', 'Safety recommendations'],
      usage: '156 analyses today',
      rating: 4.7,
      compliance: ['OSHA 1910.119', 'NFPA 704', 'EPA RMP']
    },
    { 
      id: 2,
      name: 'Ventilation System Designer', 
      description: 'Design and evaluate chemical ventilation systems with CFD simulation',
      category: 'Critical',
      status: 'active',
      icon: <GatewayOutlined />,
      features: ['CFD simulation', 'Airflow optimization', 'Contaminant dispersion'],
      usage: '89 designs this week',
      rating: 4.5,
      compliance: ['ACGIH Guidelines', 'OSHA Ventilation Standards']
    },
    { 
      id: 3,
      name: 'Exposure Limit Calculator', 
      description: 'Calculate occupational exposure limits for chemicals with AI-powered risk assessment',
      category: 'High',
      status: 'active',
      icon: <CalculatorOutlined />,
      features: ['TLV calculation', 'STEL assessment', 'Ceiling limits'],
      usage: '234 calculations',
      rating: 4.8,
      compliance: ['OSHA PEL', 'ACGIH TLV', 'NIOSH REL']
    },
    { 
      id: 4,
      name: 'Spill Response Planner', 
      description: 'Plan and simulate chemical spill response with 3D visualization',
      category: 'High',
      status: 'active',
      icon: <CodeSandboxOutlined />,
      features: ['3D simulation', 'Response optimization', 'Resource planning'],
      usage: '45 simulations run',
      rating: 4.4,
      compliance: ['EPA SPCC', 'OSHA HAZWOPER']
    }
  ];

  const emergencyScenarios = [
    {
      id: 1,
      name: 'Chemical Spill',
      severity: 'High',
      duration: '20min',
      complexity: 'Medium',
      description: 'Simulate major chemical spill response procedures',
      standard: 'OSHA HAZWOPER'
    },
    {
      id: 2,
      name: 'Runaway Reaction',
      severity: 'Critical',
      duration: '15min',
      complexity: 'High',
      description: 'Emergency response for thermal runaway scenarios',
      standard: 'EPA RMP'
    },
    {
      id: 3,
      name: 'Toxic Release',
      severity: 'Critical',
      duration: '25min',
      complexity: 'High',
      description: 'Emergency procedures for toxic chemical releases',
      standard: 'OSHA 1910.119'
    },
    {
      id: 4,
      name: 'Fire & Explosion',
      severity: 'High',
      duration: '18min',
      complexity: 'Medium',
      description: 'Fire and explosion emergency response simulation',
      standard: 'NFPA 704'
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
            <div>PSM</div>
            <Progress percent={realTimeData.psmCompliance} size="small" />
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
      
      <Steps current={1} size="small">
        <Step title="OSHA PSM" description="Process Safety Management" icon={<SafetyCertificateOutlined />} />
        <Step title="EPA RMP" description="Risk Management Program" icon={<ProfileOutlined />} />
        <Step title="NFPA Standards" description="Fire & Life Safety" icon={<SolutionOutlined />} />
        <Step title="REACH Compliance" description="Chemical Registration" icon={<BankOutlined />} />
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
      title="Process Risk Assessment Matrix" 
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
                  onClick={() => handleRunHazardAnalysis()}
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

  const ProcessSafetyPanel = () => (
    <Card title="Process Safety Management" extra={<SafetyOutlined />}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card size="small" title="PSM Compliance">
            <Statistic title="Overall Compliance" value={realTimeData.psmCompliance} suffix="%" />
            <Progress percent={realTimeData.psmCompliance} status="active" style={{ marginTop: 16 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="Process Hazards">
            <Statistic title="Identified Hazards" value={24} />
            <Tag color="green" style={{ marginTop: 16 }}>OSHA Compliant</Tag>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" title="Safety Systems">
            <Statistic title="Active Systems" value={18} />
            <Progress percent={95} size="small" style={{ marginTop: 16 }} />
          </Card>
        </Col>
      </Row>
    </Card>
  );

  // Enhanced table columns
  const inventoryColumns = [
    {
      title: 'Chemical',
      dataIndex: 'chemical',
      key: 'chemical',
      render: (text, record) => (
        <Space>
          <ExperimentOutlined />
          {text}
          {record.riskLevel === 'Critical' && <AlertFilled style={{ color: '#cf1322' }} />}
        </Space>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Hazard',
      dataIndex: 'hazard',
      key: 'hazard',
      render: (hazard) => (
        <Tag color={hazard === 'Flammable' ? 'red' : hazard === 'Toxic' ? 'orange' : 'volcano'}>
          {hazard}
        </Tag>
      ),
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level) => (
        <Tag color={level === 'Critical' ? 'red' : level === 'High' ? 'orange' : 'blue'}>
          {level}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewChemical(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEditChemical(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleViewChemical = async (chemical) => {
    try {
      const response = await chemicalSafetyService.getChemicalDetails(chemical.id);
      setSelectedChemical(response.data);
      message.info(`Viewing details for ${chemical.chemical}`);
    } catch (error) {
      message.error('Failed to load chemical details');
    }
  };

  const handleEditChemical = (chemical) => {
    setSelectedChemical(chemical);
    setChemicalModalVisible(true);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Enhanced Header */}
      <Alert
        message="🧪 OSHA-Compliant Chemical Safety Management System"
        description="Comprehensive process safety management with PSM compliance, risk assessment, and emergency response planning. Enterprise edition with full regulatory compliance."
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
            <ExperimentOutlined />
            <span>🧪 International Chemical Safety Management System</span>
            <Tag color="green" icon={<SafetyCertificateOutlined />}>ENTERPRISE EDITION</Tag>
            <Tag color="blue" icon={<GlobalOutlined />}>OSHA COMPLIANT</Tag>
          </Space>
        } 
        style={{ borderLeft: '6px solid #722ed1' }}
        extra={
          <Space size="large">
            <Statistic title="Active Processes" value={realTimeData.activeProcesses} prefix={<ExperimentOutlined />} />
            <Statistic title="PSM Compliance" value={realTimeData.psmCompliance} suffix="%" />
            <Statistic title="System Health" value={realTimeData.systemHealth} suffix="%" />
            <Statistic title="Environmental Risk" value={realTimeData.environmentalRisk} />
          </Space>
        }
      >
        <Tabs activeKey={tab} onChange={(key) => history.push(`/hse/chemical/${key}`)}>
          
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
                <ProcessSafetyPanel />
              </Col>
            </Row>
          </TabPane>

          {/* Enhanced Safety Tools */}
          <TabPane tab={<span><ToolOutlined /> Safety Tools</span>} key="tools">
            <Row gutter={[16, 16]}>
              {chemicalTools.map((tool) => (
                <Col xs={24} md={12} lg={8} key={tool.id}>
                  <Card
                    hoverable
                    actions={[
                      <Tooltip title="Launch Tool">
                        <PlayCircleOutlined 
                          onClick={() => handleRunHazardAnalysis()}
                          style={{ color: '#722ed1' }}
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
                      avatar={<Avatar icon={tool.icon} style={{ backgroundColor: '#722ed1' }} />}
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
                    <Timeline.Item color="green">New PHA completed for Reactor Unit</Timeline.Item>
                    <Timeline.Item color="orange">LOPA analysis required for Storage Tanks</Timeline.Item>
                    <Timeline.Item color="red">Critical finding: Relief valve inspection overdue</Timeline.Item>
                    <Timeline.Item color="blue">Mitigation implemented: Additional containment</Timeline.Item>
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
                      { name: 'OSHA PSM Audit', date: '2024-01-15', status: 'Completed', score: 94 },
                      { name: 'EPA RMP Inspection', date: '2024-01-20', status: 'Scheduled', score: null },
                      { name: 'Internal PHA Review', date: '2024-01-08', status: 'Completed', score: 88 },
                      { name: 'NFPA Compliance Check', date: '2024-02-01', status: 'Pending', score: null }
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
                    <Step title="Process Safety Monitoring" description="Real-time PSM tracking" />
                    <Step title="Hazard Identification" description="Proactive risk assessment" />
                    <Step title="Safety Recommendations" description="Implementation planning" />
                    <Step title="Effectiveness Measurement" description="Performance validation" />
                  </Steps>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Enhanced Inventory Tab */}
          <TabPane tab={<span><ContainerOutlined /> Chemical Inventory</span>} key="inventory">
            <Card
              title="Advanced Chemical Inventory Management"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setChemicalModalVisible(true)}>
                  Add Chemical
                </Button>
              }
            >
              <Table 
                dataSource={chemicalInventory} 
                columns={inventoryColumns}
                pagination={false}
                loading={loading}
              />
              
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="Total Chemicals" value={chemicalInventory.length} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="High Hazard" value={chemicalInventory.filter(c => c.riskLevel === 'High' || c.riskLevel === 'Critical').length} valueStyle={{ color: '#cf1322' }} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="SDS Available" value={100} suffix="%" />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="Requires Inspection" value={3} valueStyle={{ color: '#faad14' }} />
                  </Card>
                </Col>
              </Row>
            </Card>
          </TabPane>

          // Continuing from the previous ChemicalSafety.js file...

{/* Incident Management Tab */}
<TabPane tab={<span><AlertFilled /> Incident Management</span>} key="incidents">
  <Row gutter={[16, 16]}>
    <Col span={24}>
      <Card 
        title="Chemical Incident Reporting & Investigation"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIncidentModalVisible(true)}>
            Report Incident
          </Button>
        }
      >
        <Tabs>
          <TabPane tab="Open Incidents" key="open">
            <List
              dataSource={[
                { 
                  id: 1, 
                  type: 'Chemical Spill', 
                  location: 'Production Area B', 
                  severity: 'High',
                  date: '2024-01-15',
                  status: 'Under Investigation'
                },
                { 
                  id: 2, 
                  type: 'Equipment Failure', 
                  location: 'Reactor Unit 3', 
                  severity: 'Medium',
                  date: '2024-01-14',
                  status: 'Corrective Action Pending'
                }
              ]}
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
                    title={item.type}
                    description={
                      <Space direction="vertical" size={0}>
                        <div>Location: {item.location}</div>
                        <div>Date: {item.date}</div>
                        <Tag color={item.status === 'Under Investigation' ? 'orange' : 'blue'}>
                          {item.status}
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
                  name: 'Quarterly Incident Analysis Q4 2023', 
                  type: 'Analysis Report',
                  date: '2024-01-10',
                  findings: 12,
                  recommendations: 8
                },
                { 
                  name: 'Root Cause Analysis - Reactor Incident', 
                  type: 'RCA Report',
                  date: '2024-01-05',
                  findings: 5,
                  recommendations: 3
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
            <Statistic title="Total Incidents" value={18} />
          </Col>
          <Col span={8}>
            <Statistic title="Open Cases" value={4} />
          </Col>
          <Col span={8}>
            <Statistic title="Avg Resolution Time" value="16.2" suffix="days" />
          </Col>
        </Row>
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <Progress percent={75} format={() => 'Spill Incidents: 75%'} />
          <Progress percent={15} format={() => 'Equipment Failure: 15%'} />
          <Progress percent={10} format={() => 'Other: 10%'} />
        </Space>
      </Card>
    </Col>
    <Col span={12}>
      <Card title="Incident Trends" size="small">
        <Timeline>
          <Timeline.Item color="red">3 Chemical Spills this month</Timeline.Item>
          <Timeline.Item color="orange">5 Near Miss reports</Timeline.Item>
          <Timeline.Item color="green">2 Safety recommendations implemented</Timeline.Item>
          <Timeline.Item color="blue">New incident reporting procedure introduced</Timeline.Item>
        </Timeline>
      </Card>
    </Col>
  </Row>
</TabPane>

{/* Training & Competence Tab */}
<TabPane tab={<span><TeamOutlined /> Training & Competence</span>} key="training">
  <Row gutter={[16, 16]}>
    <Col span={12}>
      <Card title="Chemical Safety Training Status">
        <List
          dataSource={[
            { name: 'PSM Awareness', completed: 95, required: 100, deadline: '2024-02-15' },
            { name: 'HAZWOPER', completed: 88, required: 100, deadline: '2024-02-28' },
            { name: 'Emergency Response', completed: 92, required: 95, deadline: '2024-03-10' },
            { name: 'Chemical Handling', completed: 85, required: 90, deadline: '2024-02-20' }
          ]}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.name}
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Progress 
                      percent={(item.completed / item.required) * 100}
                      format={() => `${item.completed}% / ${item.required}%`}
                    />
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Deadline: {item.deadline}
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
            <Statistic title="Operators Certified" value={45} suffix="/50" />
          </Col>
          <Col span={12}>
            <Statistic title="Technicians" value={28} suffix="/30" />
          </Col>
          <Col span={12}>
            <Statistic title="Supervisors" value={12} suffix="/12" />
          </Col>
          <Col span={12}>
            <Statistic title="Engineers" value={8} suffix="/10" />
          </Col>
        </Row>
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Tag color="green" style={{ fontSize: '14px', padding: '8px 16px' }}>
            Overall Competence: 92%
          </Tag>
        </div>
      </Card>
    </Col>
  </Row>
  
  <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
    <Col span={24}>
      <Card title="Training Schedule & Calendar">
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
                <Button size="small">Today</Button>
                <Button size="small" type="primary">Schedule Training</Button>
              </Space>
            </div>
          )}
        />
      </Card>
    </Col>
  </Row>
</TabPane>

{/* Environmental Compliance Tab */}
<TabPane tab={<span><EnvironmentOutlined /> Environmental Compliance</span>} key="environmental">
  <Row gutter={[16, 16]}>
    <Col span={12}>
      <Card title="Environmental Monitoring">
        <List
          dataSource={[
            { parameter: 'Air Quality', value: 'Good', trend: 'stable', limit: 'Within Limits' },
            { parameter: 'Water Discharge', value: 'Normal', trend: 'improving', limit: 'Compliant' },
            { parameter: 'Waste Management', value: 'Monitor', trend: 'stable', limit: 'Action Required' },
            { parameter: 'Noise Levels', value: 'Good', trend: 'improving', limit: 'Within Limits' }
          ]}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar style={{ 
                    backgroundColor: item.value === 'Good' ? '#52c41a' : item.value === 'Normal' ? '#1890ff' : '#faad14'
                  }}>
                    {item.value.charAt(0)}
                  </Avatar>
                }
                title={item.parameter}
                description={
                  <Space>
                    <Tag color={item.trend === 'improving' ? 'green' : 'blue'}>{item.trend}</Tag>
                    <span>{item.limit}</span>
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
            <Statistic title="Clean Air Act" value={94} suffix="%" />
            <Progress percent={94} size="small" status="active" />
          </Card>
          <Card size="small">
            <Statistic title="Clean Water Act" value={91} suffix="%" />
            <Progress percent={91} size="small" status="active" />
          </Card>
          <Card size="small">
            <Statistic title="RCRA Compliance" value={86} suffix="%" />
            <Progress percent={86} size="small" status="active" />
          </Card>
        </Space>
      </Card>
    </Col>
  </Row>
  
  <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
    <Col span={24}>
      <Card title="Waste Management & Tracking">
        <Table
          columns={[
            { title: 'Waste Type', dataIndex: 'type', key: 'type' },
            { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
            { title: 'Hazard Class', dataIndex: 'hazard', key: 'hazard' },
            { title: 'Disposal Method', dataIndex: 'disposal', key: 'disposal' },
            { title: 'Status', dataIndex: 'status', key: 'status', render: status => (
              <Tag color={status === 'Disposed' ? 'green' : status === 'In Storage' ? 'orange' : 'blue'}>
                {status}
              </Tag>
            )},
            { title: 'Actions', key: 'actions', render: () => (
              <Space>
                <Button size="small">Track</Button>
                <Button size="small">Update</Button>
              </Space>
            )}
          ]}
          dataSource={[
            { key: 1, type: 'Solvent Waste', quantity: '250L', hazard: 'Flammable', disposal: 'Incineration', status: 'Scheduled' },
            { key: 2, type: 'Acid Waste', quantity: '150L', hazard: 'Corrosive', disposal: 'Neutralization', status: 'In Storage' },
            { key: 3, type: 'Heavy Metal Sludge', quantity: '500kg', hazard: 'Toxic', disposal: 'Secure Landfill', status: 'Disposed' }
          ]}
          pagination={false}
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
          dataSource={[
            { 
              title: 'Winter Chemical Storage Advisory', 
              priority: 'High', 
              date: '2024-01-15',
              status: 'Active',
              category: 'Storage'
            },
            { 
              title: 'New SDS Management Procedure', 
              priority: 'Medium', 
              date: '2024-01-12',
              status: 'Active',
              category: 'Procedure'
            },
            { 
              title: 'Emergency Shutdown Drill Schedule', 
              priority: 'High', 
              date: '2024-01-10',
              status: 'Acknowledged',
              category: 'Drill'
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
                  <Space direction="vertical" size={0}>
                    <div>
                      <span>Issued: {item.date}</span>
                      <Tag color={item.status === 'Active' ? 'red' : 'green'} style={{ marginLeft: 8 }}>
                        {item.status}
                      </Tag>
                    </div>
                    <Tag color="blue">{item.category}</Tag>
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
          <h3>Chemical Safety Culture Program</h3>
          <p>Promoting positive safety attitudes and behaviors in chemical operations</p>
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
              type: 'EPA TRI Report', 
              agency: 'EPA',
              frequency: 'Annual', 
              dueDate: '2024-07-01',
              status: 'Not Started'
            },
            { 
              key: 2, 
              type: 'OSHA 300A Summary', 
              agency: 'OSHA',
              frequency: 'Annual', 
              dueDate: '2024-02-01',
              status: 'Due Soon'
            },
            { 
              key: 3, 
              type: 'PSM Compliance Report', 
              agency: 'OSHA',
              frequency: 'Quarterly', 
              dueDate: '2024-01-31',
              status: 'In Progress'
            },
            { 
              key: 4, 
              type: 'RMP Update', 
              agency: 'EPA',
              frequency: '5 Years', 
              dueDate: '2024-12-31',
              status: 'Not Started'
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
            'Chemical Incident Report Form',
            'PSM Compliance Checklist',
            'Risk Management Plan Template',
            'Environmental Monitoring Report',
            'Safety Audit Report Template'
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
            <Statistic title="Reports This Quarter" value={8} />
          </Col>
          <Col span={12}>
            <Statistic title="On-time Submission" value={92} suffix="%" />
          </Col>
          <Col span={12}>
            <Statistic title="Regulatory Findings" value={3} />
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
              <Statistic title="Risk Prediction Accuracy" value={91.5} suffix="%" />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic title="Process Safety Confidence" value={88.7} suffix="%" />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Statistic title="Anomaly Detection Rate" value={94.2} suffix="%" />
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
            <p>18% reduction in process safety incidents</p>
            <small>Last 12 months</small>
          </Timeline.Item>
          <Timeline.Item color="orange">
            <p>Increased near-miss reporting</p>
            <small>Positive safety culture indicator</small>
          </Timeline.Item>
          <Timeline.Item color="red">
            <p>Higher spill incidents in Q4</p>
            <small>Requires investigation and corrective action</small>
          </Timeline.Item>
          <Timeline.Item color="blue">
            <p>Improved training completion rates</p>
            <small>Current: 92% vs Target: 90%</small>
          </Timeline.Item>
        </Timeline>
      </Card>
    </Col>
    <Col span={12}>
      <Card title="AI Safety Insights">
        <Alert
          message="Predictive Maintenance Alert"
          description="Reactor Unit 2 shows signs of corrosion. Schedule inspection within 30 days."
          type="warning"
          showIcon
        />
        <Divider />
        <Alert
          message="Process Optimization"
          description="Recommend temperature optimization for Batch Process C to reduce energy consumption by 12%."
          type="info"
          showIcon
        />
        <Divider />
        <Alert
          message="Safety Training Opportunity"
          description="Identify operators requiring advanced HAZOP training based on recent incident patterns."
          type="success"
          showIcon
        />
        <Divider />
        <Alert
          message="Environmental Compliance"
          description="Monitor wastewater discharge parameters more frequently during high-production periods."
          type="warning"
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
      <Card title="User Management & Permissions">
        <List
          dataSource={[
            { role: 'Safety Manager', users: 3, permissions: 'Full Access', color: 'red' },
            { role: 'Process Engineer', users: 8, permissions: 'Technical Access', color: 'blue' },
            { role: 'Operations Staff', users: 25, permissions: 'Limited Access', color: 'orange' },
            { role: 'Compliance Officer', users: 2, permissions: 'Compliance Access', color: 'green' },
            { role: 'Viewer', users: 12, permissions: 'Read Only', color: 'purple' }
          ]}
          renderItem={item => (
            <List.Item
              actions={[
                <Button size="small">Manage</Button>,
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
            <span>Real-time Monitoring</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Automatic Backup</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Compliance Alerts</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Predictive Analytics</span>
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
        </Space>
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Statistic title="Database Size" value={2.4} suffix="GB" />
          <Progress percent={65} style={{ marginTop: 8 }} />
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
            <p>Compliance data synchronized with EPA database</p>
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
        </Timeline>
        <Divider />
        <Button type="primary" block>View Detailed Logs</Button>
      </Card>
    </Col>
  </Row>
</TabPane>
          {/* Additional tabs would continue here... */}
        </Tabs>
      </Card>

      {/* Risk Assessment Modal */}
      <Modal
        title="New Process Risk Assessment"
        visible={riskAssessmentModalVisible}
        onCancel={() => setRiskAssessmentModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={riskForm} layout="vertical" onFinish={handleRiskAssessment}>
          <Form.Item name="hazard" label="Process Hazard Description" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Describe the process hazard..." />
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
              <Option value="osha_psm">OSHA PSM (1910.119)</Option>
              <Option value="epa_rmp">EPA RMP</Option>
              <Option value="nfpa_30">NFPA 30</Option>
              <Option value="api_std">API Standards</Option>
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
        title="Process Safety Audit Checklist"
        visible={safetyAuditModalVisible}
        onCancel={() => setSafetyAuditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical" onFinish={handleSafetyAudit}>
          <Form.Item name="auditType" label="Audit Type" rules={[{ required: true }]}>
            <Select placeholder="Select audit type">
              <Option value="osha_psm">OSHA PSM Audit</Option>
              <Option value="epa_rmp">EPA RMP Inspection</Option>
              <Option value="internal_psm">Internal PSM Review</Option>
              <Option value="process_hazard">Process Hazard Analysis</Option>
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

      {/* Add Chemical Modal */}
      <Modal
        title={selectedChemical ? "Edit Chemical" : "Add New Chemical"}
        visible={chemicalModalVisible}
        onCancel={() => {
          setChemicalModalVisible(false);
          setSelectedChemical(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form 
          form={form} 
          layout="vertical"
          onFinish={handleChemicalSubmit}
          initialValues={selectedChemical || {}}
        >
          <Form.Item name="chemical" label="Chemical Name" rules={[{ required: true }]}>
            <Input placeholder="Enter chemical name" />
          </Form.Item>
          <Form.Item name="location" label="Storage Location" rules={[{ required: true }]}>
            <Input placeholder="Enter storage location" />
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
            <Input placeholder="Enter quantity with units" />
          </Form.Item>
          <Form.Item name="hazard" label="Hazard Classification" rules={[{ required: true }]}>
            <Select placeholder="Select hazard classification">
              <Option value="Flammable">Flammable</Option>
              <Option value="Corrosive">Corrosive</Option>
              <Option value="Toxic">Toxic</Option>
              <Option value="Reactive">Reactive</Option>
              <Option value="Oxidizer">Oxidizer</Option>
            </Select>
          </Form.Item>
          <Form.Item name="riskLevel" label="Risk Level" rules={[{ required: true }]}>
            <Select placeholder="Select risk level">
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
              <Option value="Critical">Critical</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedChemical ? 'Update Chemical' : 'Add Chemical'}
              </Button>
              <Button onClick={() => {
                setChemicalModalVisible(false);
                setSelectedChemical(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChemicalSafety;