// src/pages/Modules/Industries/ChemicalSafety.js
import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { 
  Card, Row, Col, Tabs, List, Button, Space, Tag, Avatar, Statistic, 
  Progress, Table, Modal, Form, Input, Select, Upload, Alert, Badge, 
  Tooltip, Divider, Timeline, Switch, Slider, InputNumber, Radio, 
  Checkbox, Calendar, Popconfirm, message, Descriptions, Collapse, 
  Steps, Result
} from 'antd';
import {
  ExperimentOutlined, FileTextOutlined, ToolOutlined, DownloadOutlined,
  EditOutlined, PlayCircleOutlined, TeamOutlined, WarningOutlined,
  SafetyCertificateOutlined, FireOutlined, ContainerOutlined, PlusOutlined,
  SearchOutlined, FilterOutlined, CloudUploadOutlined, SyncOutlined,
  EyeOutlined, ThunderboltOutlined, RocketOutlined, BarChartOutlined,
  HeatMapOutlined, ClusterOutlined, RadarChartOutlined, ApiOutlined,
  SafetyOutlined, BugOutlined, GatewayOutlined, CodeSandboxOutlined,
  DashboardOutlined, CalculatorOutlined, ExperimentFilled, AlertFilled,
  SettingOutlined, DatabaseOutlined, LineChartOutlined, AuditOutlined,
  GlobalOutlined, CheckCircleOutlined, StarOutlined, NotificationOutlined,
  ProfileOutlined, ProjectOutlined, BankOutlined, CrownFilled, FlagOutlined,
  SolutionOutlined, UserSwitchOutlined, MedicineBoxOutlined,
  EnvironmentOutlined, ControlOutlined, PartitionOutlined,
  ApartmentOutlined, DeploymentUnitOutlined
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
  
  // State management
  const [realTimeData, setRealTimeData] = useState({
    activeProcesses: 0,
    psmCompliance: 0,
    criticalAlerts: 0,
    inventoryAccuracy: 100,
    systemHealth: 100,
    environmentalRisk: 'Low'
  });

  const [complianceStatus, setComplianceStatus] = useState({
    osha: { score: 0, status: 'Loading...', lastAudit: '' },
    epa: { score: 0, status: 'Loading...', lastAudit: '' },
    nfpa: { score: 0, status: 'Loading...', lastAudit: '' },
    reach: { score: 0, status: 'Loading...', lastAudit: '' }
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

  const [chemicalInventory, setChemicalInventory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    servers: 100, network: 100, database: 100, aiServices: 100, complianceSystems: 100
  });

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadRealTimeData(),
      loadChemicalInventory(),
      loadDocuments(),
      loadSystemHealth(),
      loadComplianceStatus(),
      loadSafetyPerformance()
    ]);
  };

  const loadRealTimeData = async () => {
    try {
      const response = await chemicalSafetyService.getRealTimeMetrics();
      if (response.success) setRealTimeData(response.data);
    } catch (error) { console.error('Error loading chemical data:', error); }
  };

  const loadComplianceStatus = async () => {
    try {
      const response = await chemicalSafetyService.getComplianceStatus();
      if (response.success) setComplianceStatus(response.data);
    } catch (error) { console.error('Error loading compliance status:', error); }
  };

  const loadSafetyPerformance = async () => {
    try {
      const response = await chemicalSafetyService.getSafetyPerformance();
      if (response.success) setSafetyPerformance(response.data);
    } catch (error) { console.error('Error loading safety performance:', error); }
  };

  const loadChemicalInventory = async () => {
    try {
      setLoading(true);
      const response = await chemicalSafetyService.getChemicalInventory();
      if (response.success) setChemicalInventory(response.data);
    } catch (error) { console.error('Error loading chemical inventory:', error); } 
    finally { setLoading(false); }
  };

  const loadDocuments = async () => {
    try {
      const response = await chemicalSafetyService.getChemicalDocuments();
      if (response.success) setDocuments(response.data);
    } catch (error) { console.error('Error loading documents:', error); }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await chemicalSafetyService.getSystemHealth();
      if (response.success) setSystemHealth(response.data);
    } catch (error) { console.error('Error loading system health:', error); }
  };

  // Handlers
  const handleRunHazardAnalysis = async () => {
    try {
      const response = await chemicalSafetyService.runProcessHazardAnalysis();
      if (response.success) message.success('Process Hazard Analysis Completed!');
    } catch (error) { message.error('Error running hazard analysis'); }
  };

  const handleRiskAssessment = async (values) => {
    try {
      const response = await chemicalSafetyService.submitRiskAssessment(values);
      if (response.success) {
        message.success('Risk Assessment Submitted Successfully!');
        setRiskAssessmentModalVisible(false);
        riskForm.resetFields();
      }
    } catch (error) { message.error('Error submitting risk assessment'); }
  };

  const handleSafetyAudit = async (values) => {
    try {
      const response = await chemicalSafetyService.submitSafetyAudit(values);
      if (response.success) {
        message.success('Safety Audit Completed Successfully!');
        setSafetyAuditModalVisible(false);
      }
    } catch (error) { message.error('Error completing safety audit'); }
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
    } catch (error) { message.error('Failed to save chemical'); }
  };

  const handleEditChemical = (chemical) => {
    setSelectedChemical(chemical);
    setChemicalModalVisible(true);
  };

  // Static UI Data (Tools & Scenarios)
  const chemicalTools = [
    { id: 1, name: 'Chemical Reactivity Matrix', description: 'Analyze chemical compatibility and reactivity hazards', category: 'Critical', icon: <HeatMapOutlined />, features: ['Real-time compatibility', 'Hazard prediction'], usage: '156 analyses today', rating: 4.7, compliance: ['OSHA 1910.119', 'NFPA 704'] },
    { id: 2, name: 'Ventilation System Designer', description: 'Design and evaluate chemical ventilation systems', category: 'Critical', icon: <GatewayOutlined />, features: ['CFD simulation', 'Airflow optimization'], usage: '89 designs this week', rating: 4.5, compliance: ['ACGIH Guidelines'] },
    { id: 3, name: 'Exposure Limit Calculator', description: 'Calculate occupational exposure limits for chemicals', category: 'High', icon: <CalculatorOutlined />, features: ['TLV calculation', 'STEL assessment'], usage: '234 calculations', rating: 4.8, compliance: ['OSHA PEL', 'NIOSH REL'] },
    { id: 4, name: 'Spill Response Planner', description: 'Plan and simulate chemical spill response', category: 'High', icon: <CodeSandboxOutlined />, features: ['3D simulation', 'Response optimization'], usage: '45 simulations run', rating: 4.4, compliance: ['EPA SPCC', 'OSHA HAZWOPER'] }
  ];

  const emergencyScenarios = [
    { id: 1, name: 'Chemical Spill', severity: 'High', duration: '20min', description: 'Simulate major chemical spill response procedures', standard: 'OSHA HAZWOPER' },
    { id: 2, name: 'Runaway Reaction', severity: 'Critical', duration: '15min', description: 'Emergency response for thermal runaway scenarios', standard: 'EPA RMP' },
    { id: 3, name: 'Toxic Release', severity: 'Critical', duration: '25min', description: 'Emergency procedures for toxic chemical releases', standard: 'OSHA 1910.119' },
    { id: 4, name: 'Fire & Explosion', severity: 'High', duration: '18min', description: 'Fire and explosion emergency response simulation', standard: 'NFPA 704' }
  ];

  // Components
  const SystemHealthMonitor = () => (
    <Card title="System Health Monitor" size="small" extra={<SyncOutlined onClick={loadSystemHealth} />}>
      <Row gutter={[16, 16]}>
        <Col span={4}><div style={{ textAlign: 'center' }}><DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a' }} /><div>Servers</div><Progress percent={systemHealth.servers} size="small" /></div></Col>
        <Col span={4}><div style={{ textAlign: 'center' }}><DeploymentUnitOutlined style={{ fontSize: '24px', color: '#52c41a' }} /><div>Network</div><Progress percent={systemHealth.network} size="small" /></div></Col>
        <Col span={4}><div style={{ textAlign: 'center' }}><ClusterOutlined style={{ fontSize: '24px', color: '#52c41a' }} /><div>Database</div><Progress percent={systemHealth.database} size="small" /></div></Col>
        <Col span={4}><div style={{ textAlign: 'center' }}><ThunderboltOutlined style={{ fontSize: '24px', color: '#52c41a' }} /><div>AI Services</div><Progress percent={systemHealth.aiServices} size="small" /></div></Col>
        <Col span={4}><div style={{ textAlign: 'center' }}><AuditOutlined style={{ fontSize: '24px', color: '#52c41a' }} /><div>Compliance</div><Progress percent={systemHealth.complianceSystems} size="small" /></div></Col>
        <Col span={4}><div style={{ textAlign: 'center' }}><SafetyOutlined style={{ fontSize: '24px', color: '#52c41a' }} /><div>PSM</div><Progress percent={realTimeData.psmCompliance} size="small" /></div></Col>
      </Row>
    </Card>
  );

  const StandardsCompliancePanel = () => (
    <Card title="Regulatory Standards Compliance" extra={<GlobalOutlined />}>
      <Row gutter={[16, 16]}>
        {Object.entries(complianceStatus).map(([standard, data]) => (
          <Col span={6} key={standard}>
            <Card size="small" hoverable>
              <div style={{ textAlign: 'center' }}>
                <Statistic title={standard.toUpperCase()} value={data.score} suffix="%" valueStyle={{ color: data.score >= 90 ? '#3f8600' : data.score >= 80 ? '#faad14' : '#cf1322' }} />
                <Tag color={data.status === 'Compliant' ? 'green' : data.status === 'Partially Compliant' ? 'orange' : 'red'} style={{ marginTop: 8 }}>{data.status}</Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Divider />
      <Steps current={1} size="small">
        <Step title="OSHA PSM" icon={<SafetyCertificateOutlined />} />
        <Step title="EPA RMP" icon={<ProfileOutlined />} />
        <Step title="NFPA" icon={<SolutionOutlined />} />
        <Step title="REACH" icon={<BankOutlined />} />
      </Steps>
    </Card>
  );

  const SafetyPerformancePanel = () => (
    <Card title="Safety Performance Indicators" extra={<BarChartOutlined />}>
      <Tabs size="small">
        <TabPane tab="Leading Indicators" key="leading">
          <List dataSource={safetyPerformance.spas} renderItem={item => (
            <List.Item actions={[<Tag color={item.status === 'exceeded' ? 'green' : item.status === 'met' ? 'blue' : 'orange'}>{item.status?.toUpperCase()}</Tag>]}>
              <List.Item.Meta avatar={<Progress type="circle" percent={item.value} width={50} />} title={item.name} description={<Space><span>Current: {item.value}%</span><span>Target: {item.target}%</span></Space>} />
            </List.Item>
          )} />
        </TabPane>
        <TabPane tab="Lagging Indicators" key="lagging">
          <List dataSource={safetyPerformance.spis} renderItem={item => (
            <List.Item>
              <List.Item.Meta title={<Space>{item.name}<Tag color={item.trend === 'improving' ? 'green' : 'blue'}>{item.trend}</Tag></Space>} description={<Space direction="vertical" size={0}><Progress percent={(item.current / item.target) * 100} size="small" format={() => `${item.current} ${item.unit}`} /><span style={{ fontSize: '12px', color: '#666' }}>Target: {item.target} {item.unit}</span></Space>} />
            </List.Item>
          )} />
        </TabPane>
      </Tabs>
    </Card>
  );

  const RiskManagementPanel = () => (
    <Card title="Process Risk Assessment Matrix" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setRiskAssessmentModalVisible(true)}>New Assessment</Button>}>
      <Row gutter={[16, 16]}>
        <Col span={8}><Card size="small" title="High Risk" style={{ borderLeft: '4px solid #cf1322' }}><div style={{ textAlign: 'center', color: '#999' }}>No high risks currently</div></Card></Col>
        <Col span={8}><Card size="small" title="Medium Risk" style={{ borderLeft: '4px solid #faad14' }}><div style={{ textAlign: 'center', color: '#999' }}>No medium risks currently</div></Card></Col>
        <Col span={8}><Card size="small" title="Low Risk" style={{ borderLeft: '4px solid #52c41a' }}><div style={{ textAlign: 'center', color: '#999' }}>No low risks currently</div></Card></Col>
      </Row>
    </Card>
  );

  const inventoryColumns = [
    { title: 'Chemical', dataIndex: 'chemical', key: 'chemical', render: (text, record) => (<Space><ExperimentOutlined />{text}{record.riskLevel === 'Critical' && <AlertFilled style={{ color: '#cf1322' }} />}</Space>) },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Hazard', dataIndex: 'hazard', key: 'hazard', render: (hazard) => (<Tag color={hazard === 'Flammable' ? 'red' : hazard === 'Toxic' ? 'orange' : 'volcano'}>{hazard}</Tag>) },
    { title: 'Risk Level', dataIndex: 'riskLevel', key: 'riskLevel', render: (level) => (<Tag color={level === 'Critical' ? 'red' : level === 'High' ? 'orange' : 'blue'}>{level}</Tag>) },
    { title: 'Actions', key: 'actions', render: (_, record) => (<Space><Button icon={<EditOutlined />} size="small" onClick={() => handleEditChemical(record)} /></Space>) },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Alert
        message="🧪 OSHA-Compliant Chemical Safety Management System"
        description="Comprehensive process safety management with PSM compliance, risk assessment, and emergency response planning."
        type="success"
        showIcon
        action={
          <Space>
            <Button size="small" icon={<SyncOutlined />} onClick={loadAllData}>Refresh Data</Button>
            <Button size="small" icon={<AuditOutlined />} onClick={() => setSafetyAuditModalVisible(true)}>Safety Audit</Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      />

      <Card 
        title={<Space><ExperimentOutlined /><span>🧪 International Chemical Safety Management System</span><Tag color="green">ENTERPRISE</Tag></Space>} 
        style={{ borderLeft: '6px solid #722ed1' }}
        extra={
          <Space size="large">
            <Statistic title="Active Processes" value={realTimeData.activeProcesses} prefix={<ExperimentOutlined />} />
            <Statistic title="PSM Compliance" value={realTimeData.psmCompliance} suffix="%" />
            <Statistic title="Environmental Risk" value={realTimeData.environmentalRisk} />
          </Space>
        }
      >
        <Tabs activeKey={tab} onChange={(key) => history.push(`/hse/chemical/${key}`)}>
          
          <TabPane tab={<span><DashboardOutlined /> Dashboard</span>} key="dashboard">
            <Row gutter={[16, 16]}><Col span={24}><SystemHealthMonitor /></Col></Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}><StandardsCompliancePanel /></Col>
              <Col span={12}><SafetyPerformancePanel /></Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}><RiskManagementPanel /></Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><ToolOutlined /> Tools</span>} key="tools">
            <Row gutter={[16, 16]}>
              {chemicalTools.map((tool) => (
                <Col xs={24} md={12} lg={8} key={tool.id}>
                  <Card hoverable actions={[<PlayCircleOutlined onClick={handleRunHazardAnalysis} style={{ color: '#722ed1' }} />]}>
                    <Card.Meta avatar={<Avatar icon={tool.icon} style={{ backgroundColor: '#722ed1' }} />} title={<Space>{tool.name}<Tag color={tool.category === 'Critical' ? 'red' : 'orange'}>{tool.category}</Tag></Space>} description={<div><p>{tool.description}</p><small><StarOutlined /> {tool.rating}/5.0</small></div>} />
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab={<span><ContainerOutlined /> Inventory</span>} key="inventory">
            <Card title="Chemical Inventory" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setChemicalModalVisible(true)}>Add Chemical</Button>}>
              <Table dataSource={chemicalInventory} columns={inventoryColumns} pagination={false} loading={loading} rowKey="id" />
            </Card>
          </TabPane>

          <TabPane tab={<span><AlertFilled /> Incidents</span>} key="incidents">
             <Card title="Incident Management" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIncidentModalVisible(true)}>Report Incident</Button>}>
               <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No incidents reported yet.</div>
             </Card>
          </TabPane>

          <TabPane tab={<span><TeamOutlined /> Training</span>} key="training">
             <Card title="Training & Competence"><div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Training module integrated soon.</div></Card>
          </TabPane>

          <TabPane tab={<span><EnvironmentOutlined /> Environmental</span>} key="environmental">
             <Card title="Environmental Compliance"><div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Environmental metrics loading...</div></Card>
          </TabPane>

          <TabPane tab={<span><NotificationOutlined /> Communication</span>} key="communication">
             <Card title="Safety Communication"><div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Bulletin board coming soon.</div></Card>
          </TabPane>

          <TabPane tab={<span><FileTextOutlined /> Reporting</span>} key="reporting">
             <Card title="Regulatory Reporting"><div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Generate OSHA/EPA reports here.</div></Card>
          </TabPane>

          <TabPane tab={<span><BarChartOutlined /> Analytics</span>} key="analytics">
             <Card title="Safety Analytics"><div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Analytics dashboard loading...</div></Card>
          </TabPane>

          <TabPane tab={<span><SettingOutlined /> Admin</span>} key="admin">
             <Card title="System Administration"><div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Admin settings.</div></Card>
          </TabPane>
          
        </Tabs>
      </Card>

      {/* Modals */}
      <Modal title="New Process Risk Assessment" visible={riskAssessmentModalVisible} onCancel={() => setRiskAssessmentModalVisible(false)} footer={null} width={700}>
        <Form form={riskForm} layout="vertical" onFinish={handleRiskAssessment}>
          <Form.Item name="hazard" label="Process Hazard Description" rules={[{ required: true }]}><TextArea rows={3} placeholder="Describe the process hazard..." /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="probability" label="Probability" rules={[{ required: true }]}><Select placeholder="Select probability level"><Option value="frequent">Frequent</Option><Option value="probable">Probable</Option><Option value="occasional">Occasional</Option><Option value="remote">Remote</Option><Option value="improbable">Improbable</Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item name="severity" label="Severity" rules={[{ required: true }]}><Select placeholder="Select severity level"><Option value="catastrophic">Catastrophic</Option><Option value="hazardous">Hazardous</Option><Option value="major">Major</Option><Option value="minor">Minor</Option><Option value="negligible">Negligible</Option></Select></Form.Item></Col>
          </Row>
          <Form.Item><Space><Button type="primary" htmlType="submit">Submit Assessment</Button><Button onClick={() => setRiskAssessmentModalVisible(false)}>Cancel</Button></Space></Form.Item>
        </Form>
      </Modal>

      <Modal title="Process Safety Audit Checklist" visible={safetyAuditModalVisible} onCancel={() => setSafetyAuditModalVisible(false)} footer={null} width={800}>
        <Form layout="vertical" onFinish={handleSafetyAudit}>
          <Form.Item name="auditType" label="Audit Type" rules={[{ required: true }]}><Select placeholder="Select audit type"><Option value="osha_psm">OSHA PSM Audit</Option><Option value="epa_rmp">EPA RMP Inspection</Option><Option value="internal_psm">Internal PSM Review</Option></Select></Form.Item>
          <Form.Item name="findings" label="Audit Findings"><TextArea rows={4} placeholder="Document audit findings..." /></Form.Item>
          <Form.Item name="recommendations" label="Safety Recommendations"><TextArea rows={4} placeholder="Provide safety recommendations..." /></Form.Item>
          <Form.Item><Space><Button type="primary" htmlType="submit">Complete Audit</Button><Button onClick={() => setSafetyAuditModalVisible(false)}>Cancel</Button></Space></Form.Item>
        </Form>
      </Modal>

      <Modal title={selectedChemical ? "Edit Chemical" : "Add New Chemical"} visible={chemicalModalVisible} onCancel={() => { setChemicalModalVisible(false); setSelectedChemical(null); form.resetFields(); }} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleChemicalSubmit} initialValues={selectedChemical || {}}>
          <Form.Item name="chemical" label="Chemical Name" rules={[{ required: true }]}><Input placeholder="Enter chemical name" /></Form.Item>
          <Form.Item name="location" label="Storage Location" rules={[{ required: true }]}><Input placeholder="Enter storage location" /></Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}><Input placeholder="Enter quantity with units" /></Form.Item>
          <Form.Item name="hazard" label="Hazard Classification" rules={[{ required: true }]}><Select placeholder="Select hazard classification"><Option value="Flammable">Flammable</Option><Option value="Corrosive">Corrosive</Option><Option value="Toxic">Toxic</Option><Option value="Reactive">Reactive</Option><Option value="Oxidizer">Oxidizer</Option></Select></Form.Item>
          <Form.Item name="riskLevel" label="Risk Level" rules={[{ required: true }]}><Select placeholder="Select risk level"><Option value="Low">Low</Option><Option value="Medium">Medium</Option><Option value="High">High</Option><Option value="Critical">Critical</Option></Select></Form.Item>
          <Form.Item><Space><Button type="primary" htmlType="submit">{selectedChemical ? 'Update Chemical' : 'Add Chemical'}</Button><Button onClick={() => { setChemicalModalVisible(false); setSelectedChemical(null); form.resetFields(); }}>Cancel</Button></Space></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChemicalSafety;
