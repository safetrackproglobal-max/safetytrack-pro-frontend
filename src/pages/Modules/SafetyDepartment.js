// src/pages/Modules/SafetyDepartment.js - COMPLETE SAFETY MANAGEMENT SYSTEM
// Includes: Incidents, Inspections, Equipment, Training, Lab Safety, Compliance, Analytics

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  message,
  Space,
  Divider,
  Popconfirm,
  Tooltip,
  Avatar,
  Progress,
  Tabs,
  Badge,
  List,
  Alert,
  Timeline,
  Collapse,
  Steps,
  Descriptions,
  DatePicker,
  Rate,
  Upload,
  TreeSelect,
  Transfer,
  Slider,
  Radio,
  Checkbox,
  Calendar,
  Drawer,
  Typography
} from 'antd';
import {
  SafetyCertificateOutlined,
  SafetyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  FileTextOutlined,
  SaveOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  StarOutlined,
  BankOutlined,
  RobotOutlined,
  ApartmentOutlined,
  DashboardOutlined,
  HeartOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  BugOutlined,
  CrownOutlined,
  TrophyOutlined,
  GoldOutlined,
  RocketOutlined,
  BookOutlined,
  ReadOutlined,
  SolutionOutlined,
  WifiOutlined,
  BulbOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  CarOutlined,
  AimOutlined,
  NodeIndexOutlined,
  UsergroupAddOutlined,
  HourglassOutlined,
  LeafOutlined,
  InsuranceOutlined,
  ProfileOutlined,
  FormOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  CheckSquareOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileImageOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  VideoCameraOutlined,
  MobileOutlined,
  TabletOutlined,
  DesktopOutlined,
  GiftOutlined,
  ClusterOutlined,
  CommentOutlined,
  DollarOutlined,
  WalletOutlined,
  SettingOutlined,
  NotificationOutlined,
  AlertOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  LoginOutlined,
  LogoutOutlined,
  HomeOutlined,
  MenuOutlined,
  InboxOutlined,
  ToolOutlined,
  MedicineBoxOutlined,
  GlobalOutlined,
  AuditOutlined,
  ApiOutlined,
  IdcardOutlined,
  SecurityScanOutlined,
  SolutionOutlined as SolutionIcon,
  WifiOutlined as WifiIcon,
  BulbOutlined as BulbIcon,
  BarChartOutlined as BarChartIcon,
  LineChartOutlined as LineChartIcon,
  PieChartOutlined as PieChartIcon,
  AreaChartOutlined as AreaChartIcon
} from '@ant-design/icons';
import moment from 'moment';
import './SafetyDepartment.css';
import hospitalService from '../../services/hospitalService';
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;
const { Title, Text } = Typography;

// ============================================
// CUSTOM CHART COMPONENTS
// ============================================

const CustomBarChart = ({ data, title, color = '#faad14', height = 300 }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div style={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {data.map((item, index) => {
          const percent = (item.value / maxValue) * 100;
          return (
            <div key={index} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{item.label}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{item.value}</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: 20, 
                background: '#f0f0f0', 
                borderRadius: 10,
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${Math.min(percent, 100)}%`, 
                  height: '100%', 
                  background: `linear-gradient(90deg, ${item.color || color}, ${item.color || color}cc)`,
                  borderRadius: 10,
                  transition: 'width 1s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CustomDonutChart = ({ data, title, size = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="chart-container" style={{ textAlign: 'center' }}>
      <div className="chart-title">{title}</div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {data.map((item, index) => {
              const percent = (item.value / total) * 100;
              const startAngle = cumulativePercent * 3.6;
              cumulativePercent += percent;
              const endAngle = cumulativePercent * 3.6;
              
              const x1 = size/2 + (size/2 - 10) * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = size/2 + (size/2 - 10) * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = size/2 + (size/2 - 10) * Math.cos((endAngle - 90) * Math.PI / 180);
              const y2 = size/2 + (size/2 - 10) * Math.sin((endAngle - 90) * Math.PI / 180);
              
              const largeArc = percent > 50 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M ${size/2} ${size/2} L ${x1} ${y1} A ${size/2 - 10} ${size/2 - 10} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={item.color}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            })}
            <circle cx={size/2} cy={size/2} r={size/3} fill="white" />
            <text x={size/2} y={size/2 - 5} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#262626">
              {total}
            </text>
            <text x={size/2} y={size/2 + 20} textAnchor="middle" fontSize="12" fill="#8c8c8c">
              Total
            </text>
          </svg>
        </div>
        <div style={{ textAlign: 'left' }}>
          {data.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color, marginRight: 8 }} />
              <span style={{ marginRight: 8 }}>{item.label}</span>
              <Tag>{((item.value / total) * 100).toFixed(1)}%</Tag>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CustomLineChart = ({ data, title, height = 200 }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  const points = data.map((item, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - (item.value / maxValue) * 80
  }));

  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y + 10}`
  ).join(' ');

  return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div style={{ height, position: 'relative' }}>
        <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
          {[0, 25, 50, 75, 100].map(val => (
            <line
              key={val}
              x1="0"
              y1={val * (height / 100)}
              x2="100"
              y2={val * (height / 100)}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}
          
          <polygon
            points={`${pathD} L 100 ${height} L 0 ${height}`}
            fill="url(#gradient)"
            opacity="0.3"
          />
          
          <polyline
            points={pathD}
            fill="none"
            stroke="#faad14"
            strokeWidth="2"
          />
          
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y + 10}
              r="3"
              fill="#faad14"
            />
          ))}
          
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#faad14" />
              <stop offset="100%" stopColor="#faad14" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {data.map((item, index) => (
            <div key={index} style={{ fontSize: 11, color: '#8c8c8c', textAlign: 'center' }}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// REUSABLE ADD DATA MODAL
// ============================================

const AddDataModal = ({ visible, onCancel, onSave, title, fields, initialValues = {}, loading = false }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    await onSave(values);
    form.resetFields();
  };

  return (
    <Modal
      title={<span><PlusOutlined /> {title}</span>}
      open={visible}
      onCancel={() => { form.resetFields(); onCancel(); }}
      footer={null}
      width={700}
      className="custom-modal"
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={initialValues}>
        {fields.map((field, index) => (
          <Form.Item key={index} name={field.name} label={field.label} rules={field.rules || []} extra={field.extra}>
            {field.type === 'input' && <Input placeholder={field.placeholder} />}
            {field.type === 'textarea' && <TextArea rows={field.rows || 4} placeholder={field.placeholder} />}
            {field.type === 'number' && <InputNumber style={{ width: '100%' }} placeholder={field.placeholder} min={field.min} max={field.max} />}
            {field.type === 'select' && (
              <Select placeholder={field.placeholder}>
                {field.options?.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
              </Select>
            )}
            {field.type === 'date' && <DatePicker style={{ width: '100%' }} />}
            {field.type === 'switch' && <Switch checkedChildren={field.checkedLabel} unCheckedChildren={field.uncheckedLabel} />}
          </Form.Item>
        ))}
        <Divider />
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>Save</Button>
            <Button onClick={() => { form.resetFields(); onCancel(); }}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ============================================
// SAFETY DATA CONSTANTS
// ============================================

const INCIDENT_TYPES = [
  'Workplace Injury', 'Chemical Spill', 'Fire Hazard', 'Electrical Incident',
  'Equipment Malfunction', 'Slip/Trip/Fall', 'Exposure to Hazardous Material',
  'Security Breach', 'Other'
];

const INCIDENT_SEVERITY = [
  { value: 'Critical', color: '#ff4d4f' },
  { value: 'High', color: '#faad14' },
  { value: 'Medium', color: '#1890ff' },
  { value: 'Low', color: '#52c41a' }
];

const INCIDENT_STATUS = ['Reported', 'Under Investigation', 'In Progress', 'Resolved', 'Closed'];

const EQUIPMENT_TYPES = ['Fire Safety', 'PPE', 'Medical', 'Emergency', 'Lab Equipment', 'Other'];
const EQUIPMENT_STATUS = ['Good', 'Needs Maintenance', 'Needs Restock', 'Out of Service'];

const TRAINING_TYPES = ['Fire Safety', 'Medical', 'Chemical', 'Ergonomics', 'Emergency', 'Lab Safety', 'Other'];
const TRAINING_STATUS = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

const LAB_SAFETY_CATEGORIES = ['Chemical Safety', 'Biological Safety', 'Radiation Safety', 'Equipment Safety', 'Waste Management'];
const LAB_SAFETY_STATUS = ['Compliant', 'Needs Review', 'Non-Compliant', 'In Progress'];

// ============================================
// SAFETY STATUS CARD
// ============================================

const SafetyStatusCard = ({ title, count, icon, color, onClick }) => (
  <Card className="safety-status-card" onClick={onClick} style={{ borderLeftColor: color, cursor: 'pointer' }}>
    <div className="status-number" style={{ color }}>{count}</div>
    <div className="status-label">{icon} {title}</div>
  </Card>
);

// ============================================
// 1. INCIDENT MANAGEMENT
// ============================================

const IncidentManagement = ({ incidents, loading, fetchData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchText, setSearchText] = useState('');

  const filteredIncidents = incidents.filter(inc => 
    inc.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    inc.type?.toLowerCase().includes(searchText.toLowerCase()) ||
    inc.department?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateSafetyIncident(editingItem.id, values);
        message.success('Incident updated successfully');
      } else {
        await hospitalService.reportSafetyIncident(values);
        message.success('Incident reported successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      message.error('Failed to save incident');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteSafetyIncident(id);
      message.success('Incident deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete incident');
    }
  };

  const incidentFields = [
    { name: 'title', label: 'Incident Title', type: 'input', placeholder: 'Enter incident title', rules: [{ required: true }] },
    { name: 'type', label: 'Incident Type', type: 'select', placeholder: 'Select type', options: INCIDENT_TYPES.map(t => ({ value: t, label: t })), rules: [{ required: true }] },
    { name: 'severity', label: 'Severity', type: 'select', placeholder: 'Select severity', options: INCIDENT_SEVERITY.map(s => ({ value: s.value, label: s.value })), rules: [{ required: true }] },
    { name: 'department', label: 'Department', type: 'input', placeholder: 'Enter department', rules: [{ required: true }] },
    { name: 'location', label: 'Location', type: 'input', placeholder: 'Enter location', rules: [{ required: true }] },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the incident', rows: 4, rules: [{ required: true }] },
    { name: 'investigator', label: 'Investigator', type: 'input', placeholder: 'Enter investigator name' },
    { name: 'date', label: 'Incident Date', type: 'date', rules: [{ required: true }] },
    { name: 'rootCause', label: 'Root Cause Analysis', type: 'textarea', placeholder: 'Enter root cause analysis', rows: 3 },
    { name: 'correctiveActions', label: 'Corrective Actions', type: 'textarea', placeholder: 'Enter corrective actions', rows: 3 },
    { name: 'preventiveMeasures', label: 'Preventive Measures', type: 'textarea', placeholder: 'Enter preventive measures', rows: 3 }
  ];

  const columns = [
    { title: 'Incident', key: 'incident', render: (_, r) => <div><div style={{ fontWeight: 500 }}>{r.title}</div><div style={{ fontSize: 12, color: '#666' }}>{r.type}</div></div> },
    { title: 'Severity', dataIndex: 'severity', render: (s) => <Tag color={INCIDENT_SEVERITY.find(sev => sev.value === s)?.color}>{s}</Tag> },
    { title: 'Department', dataIndex: 'department', render: (d) => <Tag>{d}</Tag> },
    { title: 'Status', dataIndex: 'status', render: (s) => <Badge status={s === 'Resolved' || s === 'Closed' ? 'success' : 'processing'} text={s} /> },
    { title: 'Date', dataIndex: 'date', render: (d) => moment(d).format('MMM DD, YYYY') },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button type="link" icon={<EyeOutlined />} onClick={() => setSelectedItem(r)} />
        <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" icon={<DeleteOutlined />} danger />
        </Popconfirm>
      </Space>
    )}
  ];

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'Critical').length,
    underInvestigation: incidents.filter(i => i.status === 'Under Investigation').length,
    resolved: incidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Total Incidents" value={stats.total} prefix={<WarningOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Critical" value={stats.critical} prefix={<FireOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Under Investigation" value={stats.underInvestigation} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Resolved" value={stats.resolved} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Card style={{ marginTop: 16 }} extra={
        <Space>
          <Input placeholder="Search incidents..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200 }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>Report Incident</Button>
        </Space>
      }>
        <Table columns={columns} dataSource={filteredIncidents} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <AddDataModal visible={modalVisible} onCancel={() => { setModalVisible(false); setEditingItem(null); }} onSave={handleSave} title={editingItem ? 'Edit Incident' : 'Report Incident'} fields={incidentFields} initialValues={editingItem || {}} />

      <Drawer title="Incident Details" placement="right" onClose={() => setSelectedItem(null)} open={!!selectedItem} width={600}>
        {selectedItem && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Title">{selectedItem.title}</Descriptions.Item>
              <Descriptions.Item label="Type"><Tag>{selectedItem.type}</Tag></Descriptions.Item>
              <Descriptions.Item label="Severity"><Tag color={INCIDENT_SEVERITY.find(s => s.value === selectedItem.severity)?.color}>{selectedItem.severity}</Tag></Descriptions.Item>
              <Descriptions.Item label="Department">{selectedItem.department}</Descriptions.Item>
              <Descriptions.Item label="Location">{selectedItem.location}</Descriptions.Item>
              <Descriptions.Item label="Status"><Badge status={selectedItem.status === 'Resolved' || selectedItem.status === 'Closed' ? 'success' : 'processing'} text={selectedItem.status} /></Descriptions.Item>
              <Descriptions.Item label="Date">{moment(selectedItem.date).format('MMM DD, YYYY HH:mm')}</Descriptions.Item>
              <Descriptions.Item label="Investigator">{selectedItem.investigator || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Root Cause">{selectedItem.rootCause || 'Under investigation'}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Card title="Description" size="small"><Text>{selectedItem.description || 'No description'}</Text></Card>
            {selectedItem.correctiveActions && <Card title="Corrective Actions" size="small" style={{ marginTop: 8 }}><Text>{selectedItem.correctiveActions}</Text></Card>}
          </div>
        )}
      </Drawer>
    </div>
  );
};

// ============================================
// 2. INSPECTION MANAGEMENT
// ============================================

const InspectionManagement = ({ inspections, loading, fetchData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');

  const filteredInspections = inspections.filter(inc => 
    inc.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    inc.type?.toLowerCase().includes(searchText.toLowerCase()) ||
    inc.department?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateSafetyInspection(editingItem.id, values);
        message.success('Inspection updated successfully');
      } else {
        await hospitalService.createSafetyInspection(values);
        message.success('Inspection scheduled successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      message.error('Failed to save inspection');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteSafetyInspection(id);
      message.success('Inspection deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete inspection');
    }
  };

  const inspectionFields = [
    { name: 'title', label: 'Inspection Title', type: 'input', placeholder: 'Enter inspection title', rules: [{ required: true }] },
    { name: 'type', label: 'Inspection Type', type: 'select', placeholder: 'Select type', options: ['Fire Safety', 'Electrical Safety', 'Chemical Safety', 'General Safety', 'Machine Safety', 'Ergonomics', 'Lab Safety'].map(t => ({ value: t, label: t })), rules: [{ required: true }] },
    { name: 'department', label: 'Department', type: 'input', placeholder: 'Enter department', rules: [{ required: true }] },
    { name: 'inspector', label: 'Inspector', type: 'input', placeholder: 'Enter inspector name', rules: [{ required: true }] },
    { name: 'date', label: 'Inspection Date', type: 'date', rules: [{ required: true }] },
    { name: 'status', label: 'Status', type: 'select', placeholder: 'Select status', options: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'].map(s => ({ value: s, label: s })), rules: [{ required: true }] },
    { name: 'findings', label: 'Findings', type: 'textarea', placeholder: 'Enter inspection findings', rows: 3 },
    { name: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'Enter recommendations', rows: 3 }
  ];

  const columns = [
    { title: 'Inspection', key: 'inspection', render: (_, r) => <div><div style={{ fontWeight: 500 }}>{r.title}</div><div style={{ fontSize: 12, color: '#666' }}>{r.type}</div></div> },
    { title: 'Department', dataIndex: 'department', render: (d) => <Tag>{d}</Tag> },
    { title: 'Inspector', dataIndex: 'inspector' },
    { title: 'Status', dataIndex: 'status', render: (s) => <Badge status={s === 'Completed' ? 'success' : s === 'In Progress' ? 'processing' : 'default'} text={s} /> },
    { title: 'Date', dataIndex: 'date', render: (d) => moment(d).format('MMM DD, YYYY') },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" icon={<DeleteOutlined />} danger />
        </Popconfirm>
      </Space>
    )}
  ];

  const stats = {
    total: inspections.length,
    scheduled: inspections.filter(i => i.status === 'Scheduled').length,
    inProgress: inspections.filter(i => i.status === 'In Progress').length,
    completed: inspections.filter(i => i.status === 'Completed').length
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Total Inspections" value={stats.total} prefix={<SafetyOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Scheduled" value={stats.scheduled} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="In Progress" value={stats.inProgress} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Completed" value={stats.completed} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Card style={{ marginTop: 16 }} extra={
        <Space>
          <Input placeholder="Search inspections..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200 }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>Schedule Inspection</Button>
        </Space>
      }>
        <Table columns={columns} dataSource={filteredInspections} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <AddDataModal visible={modalVisible} onCancel={() => { setModalVisible(false); setEditingItem(null); }} onSave={handleSave} title={editingItem ? 'Edit Inspection' : 'Schedule Inspection'} fields={inspectionFields} initialValues={editingItem || { status: 'Scheduled' }} />
    </div>
  );
};

// ============================================
// 3. EQUIPMENT MANAGEMENT
// ============================================

const EquipmentManagement = ({ equipment, loading, fetchData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');

  const filteredEquipment = equipment.filter(e => 
    e.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    e.type?.toLowerCase().includes(searchText.toLowerCase()) ||
    e.location?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateSafetyEquipment(editingItem.id, values);
        message.success('Equipment updated successfully');
      } else {
        await hospitalService.createSafetyEquipment(values);
        message.success('Equipment added successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      message.error('Failed to save equipment');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteSafetyEquipment(id);
      message.success('Equipment deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete equipment');
    }
  };

  const equipmentFields = [
    { name: 'name', label: 'Equipment Name', type: 'input', placeholder: 'Enter equipment name', rules: [{ required: true }] },
    { name: 'type', label: 'Type', type: 'select', placeholder: 'Select type', options: EQUIPMENT_TYPES.map(t => ({ value: t, label: t })), rules: [{ required: true }] },
    { name: 'location', label: 'Location', type: 'input', placeholder: 'Enter location', rules: [{ required: true }] },
    { name: 'quantity', label: 'Quantity', type: 'number', placeholder: 'Enter quantity', rules: [{ required: true }] },
    { name: 'status', label: 'Status', type: 'select', placeholder: 'Select status', options: EQUIPMENT_STATUS.map(s => ({ value: s, label: s })), rules: [{ required: true }] },
    { name: 'lastInspection', label: 'Last Inspection Date', type: 'date' },
    { name: 'nextInspection', label: 'Next Inspection Date', type: 'date' }
  ];

  const columns = [
    { title: 'Equipment', dataIndex: 'name' },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Location', dataIndex: 'location' },
    { title: 'Quantity', dataIndex: 'quantity' },
    { title: 'Status', dataIndex: 'status', render: (s) => <Tag color={s === 'Good' ? 'green' : s === 'Needs Maintenance' ? 'orange' : 'red'}>{s}</Tag> },
    { title: 'Last Inspection', dataIndex: 'lastInspection', render: (d) => moment(d).fromNow() },
    { title: 'Next Inspection', dataIndex: 'nextInspection', render: (d) => <Tag color={moment(d).diff(moment(), 'days') < 30 ? 'orange' : 'green'}>{moment(d).fromNow()}</Tag> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" icon={<DeleteOutlined />} danger />
        </Popconfirm>
      </Space>
    )}
  ];

  const stats = {
    total: equipment.length,
    good: equipment.filter(e => e.status === 'Good').length,
    needsMaintenance: equipment.filter(e => e.status === 'Needs Maintenance').length,
    expiringSoon: equipment.filter(e => moment(e.nextInspection).diff(moment(), 'days') < 30).length
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Total Equipment" value={stats.total} prefix={<ToolOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Good Condition" value={stats.good} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Needs Maintenance" value={stats.needsMaintenance} prefix={<WarningOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Expiring Soon" value={stats.expiringSoon} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>

      <Card style={{ marginTop: 16 }} extra={
        <Space>
          <Input placeholder="Search equipment..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200 }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>Add Equipment</Button>
        </Space>
      }>
        <Table columns={columns} dataSource={filteredEquipment} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <AddDataModal visible={modalVisible} onCancel={() => { setModalVisible(false); setEditingItem(null); }} onSave={handleSave} title={editingItem ? 'Edit Equipment' : 'Add Equipment'} fields={equipmentFields} initialValues={editingItem || {}} />
    </div>
  );
};

// ============================================
// 4. TRAINING MANAGEMENT
// ============================================

const TrainingManagement = ({ trainings, loading, fetchData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');

  const filteredTrainings = trainings.filter(t => 
    t.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    t.type?.toLowerCase().includes(searchText.toLowerCase()) ||
    t.department?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateSafetyTraining(editingItem.id, values);
        message.success('Training updated successfully');
      } else {
        await hospitalService.createSafetyTraining(values);
        message.success('Training added successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      message.error('Failed to save training');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteSafetyTraining(id);
      message.success('Training deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete training');
    }
  };

  const trainingFields = [
    { name: 'name', label: 'Training Name', type: 'input', placeholder: 'Enter training name', rules: [{ required: true }] },
    { name: 'type', label: 'Training Type', type: 'select', placeholder: 'Select type', options: TRAINING_TYPES.map(t => ({ value: t, label: t })), rules: [{ required: true }] },
    { name: 'department', label: 'Department', type: 'input', placeholder: 'Enter department', rules: [{ required: true }] },
    { name: 'date', label: 'Training Date', type: 'date', rules: [{ required: true }] },
    { name: 'duration', label: 'Duration', type: 'input', placeholder: 'e.g., 4 hours', rules: [{ required: true }] },
    { name: 'instructor', label: 'Instructor', type: 'input', placeholder: 'Enter instructor name', rules: [{ required: true }] },
    { name: 'attendees', label: 'Attendees', type: 'number', placeholder: 'Number of attendees' },
    { name: 'status', label: 'Status', type: 'select', placeholder: 'Select status', options: TRAINING_STATUS.map(s => ({ value: s, label: s })), rules: [{ required: true }] }
  ];

  const columns = [
    { title: 'Training', dataIndex: 'name' },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Department', dataIndex: 'department' },
    { title: 'Date', dataIndex: 'date', render: (d) => moment(d).format('MMM DD, YYYY') },
    { title: 'Duration', dataIndex: 'duration' },
    { title: 'Instructor', dataIndex: 'instructor' },
    { title: 'Attendees', dataIndex: 'attendees' },
    { title: 'Status', dataIndex: 'status', render: (s) => <Badge status={s === 'Completed' ? 'success' : s === 'In Progress' ? 'processing' : 'default'} text={s} /> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" icon={<DeleteOutlined />} danger />
        </Popconfirm>
      </Space>
    )}
  ];

  const stats = {
    total: trainings.length,
    scheduled: trainings.filter(t => t.status === 'Scheduled').length,
    completed: trainings.filter(t => t.status === 'Completed').length,
    totalAttendees: trainings.reduce((sum, t) => sum + (t.attendees || 0), 0)
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Total Trainings" value={stats.total} prefix={<BookOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Scheduled" value={stats.scheduled} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Completed" value={stats.completed} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Total Attendees" value={stats.totalAttendees} prefix={<TeamOutlined />} valueStyle={{ color: '#722ed1' }} /></Card></Col>
      </Row>

      <Card style={{ marginTop: 16 }} extra={
        <Space>
          <Input placeholder="Search trainings..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200 }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>Add Training</Button>
        </Space>
      }>
        <Table columns={columns} dataSource={filteredTrainings} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <AddDataModal visible={modalVisible} onCancel={() => { setModalVisible(false); setEditingItem(null); }} onSave={handleSave} title={editingItem ? 'Edit Training' : 'Add Training'} fields={trainingFields} initialValues={editingItem || { status: 'Scheduled' }} />
    </div>
  );
};

// ============================================
// 5. LAB SAFETY MANAGEMENT
// ============================================

const LabSafetyManagement = ({ labSafety, loading, fetchData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');

  const filteredLabSafety = labSafety.filter(l => 
    l.category?.toLowerCase().includes(searchText.toLowerCase()) ||
    l.location?.toLowerCase().includes(searchText.toLowerCase()) ||
    l.status?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateLabSafety(editingItem.id, values);
        message.success('Lab safety record updated successfully');
      } else {
        await hospitalService.createLabSafety(values);
        message.success('Lab safety record added successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      message.error('Failed to save lab safety record');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteLabSafety(id);
      message.success('Lab safety record deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete lab safety record');
    }
  };

  const labSafetyFields = [
    { name: 'category', label: 'Safety Category', type: 'select', placeholder: 'Select category', options: LAB_SAFETY_CATEGORIES.map(c => ({ value: c, label: c })), rules: [{ required: true }] },
    { name: 'location', label: 'Lab Location', type: 'input', placeholder: 'Enter lab location', rules: [{ required: true }] },
    { name: 'department', label: 'Department', type: 'input', placeholder: 'Enter department', rules: [{ required: true }] },
    { name: 'status', label: 'Compliance Status', type: 'select', placeholder: 'Select status', options: LAB_SAFETY_STATUS.map(s => ({ value: s, label: s })), rules: [{ required: true }] },
    { name: 'inspectionDate', label: 'Last Inspection Date', type: 'date', rules: [{ required: true }] },
    { name: 'nextInspection', label: 'Next Inspection Date', type: 'date' },
    { name: 'findings', label: 'Findings', type: 'textarea', placeholder: 'Enter findings', rows: 3 },
    { name: 'correctiveActions', label: 'Corrective Actions', type: 'textarea', placeholder: 'Enter corrective actions', rows: 3 },
    { name: 'chemicals', label: 'Chemicals Used', type: 'textarea', placeholder: 'List chemicals used in lab', rows: 2 },
    { name: 'safetyEquipment', label: 'Safety Equipment', type: 'input', placeholder: 'e.g., Fume hood, Eye wash, PPE' }
  ];

  const columns = [
    { title: 'Category', dataIndex: 'category' },
    { title: 'Location', dataIndex: 'location' },
    { title: 'Department', dataIndex: 'department' },
    { title: 'Status', dataIndex: 'status', render: (s) => <Badge status={s === 'Compliant' ? 'success' : s === 'Needs Review' ? 'warning' : s === 'Non-Compliant' ? 'error' : 'processing'} text={s} /> },
    { title: 'Last Inspection', dataIndex: 'inspectionDate', render: (d) => moment(d).fromNow() },
    { title: 'Next Inspection', dataIndex: 'nextInspection', render: (d) => <Tag color={moment(d).diff(moment(), 'days') < 30 ? 'orange' : 'green'}>{moment(d).fromNow()}</Tag> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
        <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" icon={<DeleteOutlined />} danger />
        </Popconfirm>
      </Space>
    )}
  ];

  const stats = {
    total: labSafety.length,
    compliant: labSafety.filter(l => l.status === 'Compliant').length,
    needsReview: labSafety.filter(l => l.status === 'Needs Review').length,
    nonCompliant: labSafety.filter(l => l.status === 'Non-Compliant').length
  };

  return (
    <div>
      <Alert message="Lab Safety Management" description="Track laboratory safety compliance, inspections, and chemical safety" type="info" showIcon style={{ marginBottom: 16 }} />

      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Total Labs" value={stats.total} prefix={<ExperimentOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Compliant" value={stats.compliant} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Needs Review" value={stats.needsReview} prefix={<WarningOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Non-Compliant" value={stats.nonCompliant} prefix={<FireOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>

      <Card style={{ marginTop: 16 }} extra={
        <Space>
          <Input placeholder="Search lab safety..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200 }} />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>Add Lab Safety Record</Button>
        </Space>
      }>
        <Table columns={columns} dataSource={filteredLabSafety} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <AddDataModal visible={modalVisible} onCancel={() => { setModalVisible(false); setEditingItem(null); }} onSave={handleSave} title={editingItem ? 'Edit Lab Safety' : 'Add Lab Safety Record'} fields={labSafetyFields} initialValues={editingItem || { status: 'Needs Review' }} />
    </div>
  );
};

// ============================================
// 6. COMPLIANCE DASHBOARD
// ============================================

const ComplianceDashboard = () => {
  const [complianceData] = useState([
    { standard: 'OSHA 1910', compliance: 85, status: 'Partial', lastAudit: '2025-01-10' },
    { standard: 'ISO 45001', compliance: 78, status: 'In Progress', lastAudit: '2025-01-15' },
    { standard: 'NFPA 70E', compliance: 92, status: 'Compliant', lastAudit: '2024-12-20' },
    { standard: 'EPA Regulations', compliance: 70, status: 'Needs Improvement', lastAudit: '2025-01-05' },
    { standard: 'HIPAA Security', compliance: 95, status: 'Compliant', lastAudit: '2025-01-08' },
    { standard: 'FDA Regulations', compliance: 88, status: 'Partial', lastAudit: '2025-01-12' }
  ]);

  const statusData = [
    { label: 'Compliant', value: complianceData.filter(c => c.status === 'Compliant').length, color: '#52c41a' },
    { label: 'Partial', value: complianceData.filter(c => c.status === 'Partial').length, color: '#faad14' },
    { label: 'In Progress', value: complianceData.filter(c => c.status === 'In Progress').length, color: '#1890ff' },
    { label: 'Needs Improvement', value: complianceData.filter(c => c.status === 'Needs Improvement').length, color: '#ff4d4f' }
  ];

  return (
    <div>
      <Alert message="Safety Compliance Dashboard" description="Real-time compliance status against international safety standards" type="info" showIcon style={{ marginBottom: 16 }} />

      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Overall Compliance" value={84} suffix="%" prefix={<SafetyCertificateOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Fully Compliant" value={2} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="In Progress" value={2} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Needs Improvement" value={1} prefix={<WarningOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <CustomBarChart 
            data={complianceData.map(c => ({
              label: c.standard,
              value: c.compliance,
              color: c.compliance >= 90 ? '#52c41a' : c.compliance >= 80 ? '#faad14' : '#ff4d4f'
            }))}
            title="Compliance Scores by Standard"
            color="#faad14"
          />
        </Col>
        <Col span={12}>
          <CustomDonutChart 
            data={statusData}
            title="Compliance Status Distribution"
          />
        </Col>
      </Row>

      <Card title="Compliance Details" style={{ marginTop: 16 }}>
        <Table
          columns={[
            { title: 'Standard', dataIndex: 'standard' },
            { title: 'Compliance', dataIndex: 'compliance', render: (val) => <Progress percent={val} size="small" strokeColor={val >= 90 ? '#52c41a' : val >= 80 ? '#faad14' : '#ff4d4f'} /> },
            { title: 'Status', dataIndex: 'status', render: (status) => <Badge status={status === 'Compliant' ? 'success' : status === 'In Progress' ? 'processing' : 'warning'} text={status} /> },
            { title: 'Last Audit', dataIndex: 'lastAudit', render: (date) => moment(date).format('MMM DD, YYYY') }
          ]}
          dataSource={complianceData}
          rowKey="standard"
          pagination={false}
        />
      </Card>
    </div>
  );
};

// ============================================
// MAIN SAFETY DEPARTMENT COMPONENT
// ============================================

const SafetyDepartment = () => {
  const [incidents, setIncidents] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [labSafety, setLabSafety] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [incidentsData, inspectionsData, equipmentData, trainingsData, labSafetyData] = await Promise.all([
        hospitalService.getSafetyIncidents(),
        hospitalService.getSafetyInspections(),
        hospitalService.getSafetyEquipment(),
        hospitalService.getSafetyTrainings(),
        hospitalService.getLabSafety()
      ]);

      setIncidents(Array.isArray(incidentsData) ? incidentsData : [
        { id: 1, title: 'Chemical Spill in Lab', type: 'Chemical Spill', severity: 'High', department: 'Laboratory', location: 'Lab B-12', status: 'Under Investigation', date: '2025-01-10 09:30', investigator: 'Dr. Smith' },
        { id: 2, title: 'Slip and Fall Incident', type: 'Slip/Trip/Fall', severity: 'Medium', department: 'Kitchen', location: 'Main Kitchen', status: 'In Progress', date: '2025-01-12 14:15', investigator: 'Ms. Johnson' }
      ]);

      setInspections(Array.isArray(inspectionsData) ? inspectionsData : [
        { id: 1, title: 'Fire Safety Check', type: 'Fire Safety', department: 'All Departments', inspector: 'Fire Marshal', date: '2025-01-15', status: 'Completed' },
        { id: 2, title: 'Electrical Safety Audit', type: 'Electrical Safety', department: 'Engineering', inspector: 'Chief Electrician', date: '2025-01-20', status: 'Scheduled' }
      ]);

      setEquipment(Array.isArray(equipmentData) ? equipmentData : [
        { id: 1, name: 'Fire Extinguisher', type: 'Fire Safety', location: 'Floor 1', quantity: 5, status: 'Good', lastInspection: '2025-01-01', nextInspection: '2025-07-01' },
        { id: 2, name: 'First Aid Kit', type: 'Medical', location: 'All Floors', quantity: 12, status: 'Needs Restock', lastInspection: '2025-01-05', nextInspection: '2025-04-05' }
      ]);

      setTrainings(Array.isArray(trainingsData) ? trainingsData : [
        { id: 1, name: 'Fire Safety Training', type: 'Fire Safety', department: 'All', date: '2025-02-15', duration: '4 hours', instructor: 'Fire Marshal', attendees: 25, status: 'Scheduled' },
        { id: 2, name: 'First Aid Training', type: 'Medical', department: 'All', date: '2025-01-20', duration: '8 hours', instructor: 'Red Cross', attendees: 30, status: 'Completed' }
      ]);

      setLabSafety(Array.isArray(labSafetyData) ? labSafetyData : [
        { id: 1, category: 'Chemical Safety', location: 'Lab A', department: 'Chemistry', status: 'Compliant', inspectionDate: '2025-01-10', nextInspection: '2025-07-10' },
        { id: 2, category: 'Biological Safety', location: 'Lab B', department: 'Biology', status: 'Needs Review', inspectionDate: '2025-01-05', nextInspection: '2025-02-05' }
      ]);

    } catch (error) {
      console.error('Error fetching safety data:', error);
      message.error('Failed to load safety data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Chart Data
  const incidentTypeData = incidents.reduce((acc, inc) => {
    const existing = acc.find(item => item.label === inc.type);
    if (existing) { existing.value += 1; } 
    else { acc.push({ label: inc.type, value: 1, color: '#faad14' }); }
    return acc;
  }, []).slice(0, 6);

  const severityData = [
    { label: 'Critical', value: incidents.filter(i => i.severity === 'Critical').length, color: '#ff4d4f' },
    { label: 'High', value: incidents.filter(i => i.severity === 'High').length, color: '#faad14' },
    { label: 'Medium', value: incidents.filter(i => i.severity === 'Medium').length, color: '#1890ff' },
    { label: 'Low', value: incidents.filter(i => i.severity === 'Low').length, color: '#52c41a' }
  ];

  const monthlyTrendData = [
    { label: 'Jan', value: 5 }, { label: 'Feb', value: 3 }, { label: 'Mar', value: 7 },
    { label: 'Apr', value: 4 }, { label: 'May', value: 6 }, { label: 'Jun', value: 2 }
  ];

  const departmentIncidentData = incidents.reduce((acc, inc) => {
    const existing = acc.find(item => item.label === inc.department);
    if (existing) { existing.value += 1; } 
    else { acc.push({ label: inc.department, value: 1, color: '#faad14' }); }
    return acc;
  }, []).slice(0, 6);

  const stats = {
    totalIncidents: incidents.length,
    critical: incidents.filter(i => i.severity === 'Critical').length,
    underInvestigation: incidents.filter(i => i.status === 'Under Investigation').length,
    resolved: incidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length,
    totalEquipment: equipment.length,
    totalTrainings: trainings.length,
    labCompliance: labSafety.filter(l => l.status === 'Compliant').length,
    complianceRate: 84
  };

  return (
    <div className="safety-container">
      {/* Header */}
      <div className="safety-header">
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <h1><SafetyCertificateOutlined /> Hospital Safety Department</h1>
            <p>Complete workplace safety management with real-time monitoring and analytics</p>
          </Col>
          <Col>
            <Space>
              <Button icon={<ExportOutlined />}>Export</Button>
              <Button icon={<ImportOutlined />}>Import</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setActiveTab('incidents')}>
                Report Incident
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={4}>
          <SafetyStatusCard title="Total Incidents" count={stats.totalIncidents} icon={<WarningOutlined />} color="#1890ff" onClick={() => setActiveTab('incidents')} />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <SafetyStatusCard title="Critical" count={stats.critical} icon={<FireOutlined />} color="#ff4d4f" onClick={() => setActiveTab('incidents')} />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <SafetyStatusCard title="Under Investigation" count={stats.underInvestigation} icon={<ClockCircleOutlined />} color="#faad14" onClick={() => setActiveTab('incidents')} />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <SafetyStatusCard title="Resolved" count={stats.resolved} icon={<CheckCircleOutlined />} color="#52c41a" onClick={() => setActiveTab('incidents')} />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <SafetyStatusCard title="Compliance Rate" count={`${stats.complianceRate}%`} icon={<SafetyCertificateOutlined />} color="#faad14" onClick={() => setActiveTab('compliance')} />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <SafetyStatusCard title="Lab Compliance" count={`${stats.labCompliance}/${labSafety.length}`} icon={<ExperimentOutlined />} color="#722ed1" onClick={() => setActiveTab('lab-safety')} />
        </Col>
      </Row>

      {/* Main Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large">
        {/* Overview Tab with Charts */}
        <TabPane tab={<span><DashboardOutlined /> Overview</span>} key="overview">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <CustomBarChart data={incidentTypeData} title="Incidents by Type" color="#faad14" />
            </Col>
            <Col span={12}>
              <CustomDonutChart data={severityData} title="Incidents by Severity" />
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={12}>
              <CustomLineChart data={monthlyTrendData} title="Monthly Incident Trend" />
            </Col>
            <Col span={12}>
              <CustomBarChart data={departmentIncidentData} title="Incidents by Department" color="#1890ff" />
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Card>
                <Statistic title="Equipment" value={stats.totalEquipment} prefix={<ToolOutlined />} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Trainings" value={stats.totalTrainings} prefix={<BookOutlined />} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Lab Safety" value={`${stats.labCompliance}/${labSafety.length}`} prefix={<ExperimentOutlined />} valueStyle={{ color: '#722ed1' }} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><WarningOutlined /> Incidents <Badge count={incidents.length} /></span>} key="incidents">
          <IncidentManagement incidents={incidents} loading={loading} fetchData={fetchAllData} />
        </TabPane>

        <TabPane tab={<span><SafetyOutlined /> Inspections <Badge count={inspections.length} /></span>} key="inspections">
          <InspectionManagement inspections={inspections} loading={loading} fetchData={fetchAllData} />
        </TabPane>

        <TabPane tab={<span><ToolOutlined /> Equipment <Badge count={equipment.length} /></span>} key="equipment">
          <EquipmentManagement equipment={equipment} loading={loading} fetchData={fetchAllData} />
        </TabPane>

        <TabPane tab={<span><BookOutlined /> Training <Badge count={trainings.length} /></span>} key="training">
          <TrainingManagement trainings={trainings} loading={loading} fetchData={fetchAllData} />
        </TabPane>

        <TabPane tab={<span><ExperimentOutlined /> Lab Safety <Badge count={labSafety.length} /></span>} key="lab-safety">
          <LabSafetyManagement labSafety={labSafety} loading={loading} fetchData={fetchAllData} />
        </TabPane>

        <TabPane tab={<span><SafetyCertificateOutlined /> Compliance</span>} key="compliance">
          <ComplianceDashboard />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SafetyDepartment;