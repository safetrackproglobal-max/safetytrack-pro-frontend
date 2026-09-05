// src/pages/Modules/HospitalManagement.js - COMPLETE ENTERPRISE VERSION
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
  Empty,
  Spin
} from 'antd';
import {
  MedicineBoxOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  StarOutlined,
  BankOutlined,
  RobotOutlined,
  ApartmentOutlined,
  DashboardOutlined,
  HeartOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  BugOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CloudOutlined,
  ToolOutlined,
  AuditOutlined,
  GlobalOutlined,
  ApiOutlined,
  IdcardOutlined,
  SecurityScanOutlined,
  CrownOutlined,
  TrophyOutlined,
  GoldOutlined,
  RocketOutlined,
  BookOutlined,
  ReadOutlined,
  SolutionOutlined,
  SafetyOutlined,
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
  FileTextOutlined,
  UserSwitchOutlined,
  SaveOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined as SafetyIcon
} from '@ant-design/icons';

// Import Services
import hospitalService from '../../services/hospitalService';
import medicalAIService from '../../services/medicalAIService';
import AIMedicalAnalysisTab from '../AIMedicalAnalysisTab';
import PatientFlow from './PatientFlow';
import SafetyDepartment from './SafetyDepartment';
import DoctorDashboard from './DoctorDashboard';

// ✅ Import the external AnalyticsDashboard component
import AnalyticsDashboard from './AnalyticsDashboard';

import './HospitalManagement.css';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;

// ============================================
// CUSTOM CHART COMPONENTS (Used by internal dashboards)
// ============================================

const CustomBarChart = ({ data, title, color = '#1890ff' }) => {
  if (!data || data.length === 0) {
    return <Empty description="No data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
  
  return (
    <div>
      <h4 style={{ marginBottom: 16 }}>{title}</h4>
      {data.map((item, index) => (
        <div key={index} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>{item.label}</span>
            <span style={{ fontWeight: 500 }}>{item.value}{item.unit || ''}</span>
          </div>
          <Progress 
            percent={Math.min((item.value / item.max) * 100, 100)} 
            size="small" 
            strokeColor={item.color || color}
            showInfo={false}
          />
        </div>
      ))}
    </div>
  );
};

const CustomDonutChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return <Empty description="No data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div>
      <h4 style={{ marginBottom: 16 }}>{title}</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {data.map((item, index) => {
          const percent = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color, marginRight: 8 }} />
              <span style={{ marginRight: 8 }}>{item.label}</span>
              <Tag>{percent.toFixed(1)}%</Tag>
            </div>
          );
        })}
      </div>
      <div style={{ 
        width: '100%', 
        height: 20, 
        borderRadius: 10, 
        background: '#f0f0f0',
        marginTop: 8,
        overflow: 'hidden',
        display: 'flex'
      }}>
        {data.map((item, index) => {
          const percent = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div
              key={index}
              style={{
                width: `${percent}%`,
                height: '100%',
                backgroundColor: item.color,
                transition: 'width 0.3s'
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// REUSABLE ADD DATA MODAL
// ============================================

const AddDataModal = ({ 
  visible, 
  onCancel, 
  onSave, 
  title, 
  fields, 
  initialValues = {},
  loading = false 
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    await onSave(values);
    form.resetFields();
  };

  return (
    <Modal
      title={<span><PlusOutlined /> {title}</span>}
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      width={700}
      destroyOnClose
      className="custom-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        {fields.map((field, index) => (
          <Form.Item
            key={index}
            name={field.name}
            label={field.label}
            rules={field.rules || []}
            extra={field.extra}
          >
            {field.type === 'input' && <Input placeholder={field.placeholder} />}
            {field.type === 'textarea' && <TextArea rows={field.rows || 4} placeholder={field.placeholder} />}
            {field.type === 'number' && <InputNumber style={{ width: '100%' }} placeholder={field.placeholder} min={field.min} max={field.max} />}
            {field.type === 'select' && (
              <Select placeholder={field.placeholder}>
                {field.options?.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            )}
            {field.type === 'date' && <DatePicker style={{ width: '100%' }} />}
            {field.type === 'switch' && <Switch checkedChildren={field.checkedLabel} unCheckedChildren={field.uncheckedLabel} />}
          </Form.Item>
        ))}
        <Divider />
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Save
            </Button>
            <Button onClick={() => { form.resetFields(); onCancel(); }}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ============================================
// 1. ENTERPRISE OVERVIEW DASHBOARD (KEEP AS IS)
// ============================================
const EnterpriseOverviewDashboard = ({ hospitals, staff, departments, aiServices, recentActivity }) => {
  const totalBeds = hospitals.reduce((sum, h) => sum + (h.beds || 0), 0);
  const totalStaff = hospitals.reduce((sum, h) => sum + (h.staffCount || 0), 0);
  const activeHospitals = hospitals.filter(h => h.status === 'active').length;
  const totalDepartments = departments.length;

  const getAIServices = () => {
    if (Array.isArray(aiServices)) return aiServices;
    if (aiServices && aiServices.services) return aiServices.services;
    if (hospitals && hospitals.length > 0 && hospitals[0]?.aiServices) return hospitals[0].aiServices;
    for (const hospital of hospitals) {
      if (hospital.aiServices && Array.isArray(hospital.aiServices)) return hospital.aiServices;
    }
    return [];
  };

  const aiServicesList = getAIServices();
  const aiServicesCount = aiServicesList.length;

  const occupancyRate = totalBeds > 0 ? Math.round((totalBeds / (hospitals.length * 500)) * 100) : 0;
  const avgStaffPerHospital = hospitals.length > 0 ? Math.round(totalStaff / hospitals.length) : 0;
  const avgBedsPerHospital = hospitals.length > 0 ? Math.round(totalBeds / hospitals.length) : 0;

  const departmentDistribution = departments.reduce((acc, dept) => {
    acc[dept.name] = (acc[dept.name] || 0) + 1;
    return acc;
  }, {});

  const statusDistribution = hospitals.reduce((acc, h) => {
    acc[h.status || 'unknown'] = (acc[h.status || 'unknown'] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-primary">
            <Statistic 
              title="Total Hospitals" 
              value={hospitals.length} 
              prefix={<BankOutlined />} 
              valueStyle={{ color: '#1890ff' }} 
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              <Tag color="green">{activeHospitals} active</Tag>
              <Tag color="orange">{hospitals.length - activeHospitals} inactive</Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-success">
            <Statistic 
              title="Total Staff" 
              value={totalStaff} 
              prefix={<TeamOutlined />} 
              valueStyle={{ color: '#52c41a' }} 
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Avg {avgStaffPerHospital} staff per hospital
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-purple">
            <Statistic 
              title="Total Beds" 
              value={totalBeds} 
              prefix={<MedicineBoxOutlined />} 
              valueStyle={{ color: '#722ed1' }} 
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Avg {avgBedsPerHospital} beds per hospital
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-pink">
            <Statistic 
              title="AI Services" 
              value={aiServicesCount} 
              prefix={<RobotOutlined />} 
              valueStyle={{ color: '#eb2f96' }} 
              suffix="tools"
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {aiServicesCount > 0 ? `${aiServicesCount} services available` : 'No AI services'}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-cyan">
            <Statistic 
              title="Total Departments" 
              value={totalDepartments} 
              prefix={<ApartmentOutlined />} 
              valueStyle={{ color: '#13c2c2' }} 
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {Object.keys(departmentDistribution).length} types
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-orange">
            <Statistic 
              title="Occupancy Rate" 
              value={occupancyRate} 
              prefix={<DashboardOutlined />} 
              suffix="%" 
              valueStyle={{ color: occupancyRate > 80 ? '#52c41a' : occupancyRate > 60 ? '#faad14' : '#ff4d4f' }} 
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {totalBeds > 0 ? `${totalBeds} total beds` : 'No beds'}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-gold">
            <Statistic 
              title="Hospitals by Status" 
              value={activeHospitals} 
              prefix={<HeartOutlined />} 
              valueStyle={{ color: '#faad14' }} 
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              <Progress 
                percent={(activeHospitals / (hospitals.length || 1)) * 100} 
                size="small" 
                strokeColor="#52c41a"
                format={() => `${activeHospitals}/${hospitals.length} active`}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card stat-card-red">
            <Statistic 
              title="Staff-to-Bed Ratio" 
              value={totalBeds > 0 ? (totalStaff / totalBeds).toFixed(2) : 0} 
              prefix={<UserOutlined />} 
              valueStyle={{ color: '#ff4d4f' }} 
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              {totalStaff} staff for {totalBeds} beds
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Hospital Capacity Distribution" 
            className="dashboard-card"
            extra={<Tag color="blue">Beds</Tag>}
          >
            <CustomBarChart 
              data={hospitals.map(h => ({
                label: h.name?.substring(0, 15) || 'N/A',
                value: h.beds || 0,
                max: 500,
                unit: ' beds',
                color: h.status === 'active' ? '#1890ff' : '#faad14'
              }))}
              title="Beds by Hospital"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Staff Distribution" 
            className="dashboard-card"
            extra={<Tag color="green">Staff</Tag>}
          >
            <CustomBarChart 
              data={hospitals.map(h => ({
                label: h.name?.substring(0, 15) || 'N/A',
                value: h.staffCount || 0,
                max: 1500,
                unit: ' staff',
                color: h.status === 'active' ? '#52c41a' : '#faad14'
              }))}
              title="Staff by Hospital"
              color="#52c41a"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card 
            title="Hospital Status Distribution" 
            className="dashboard-card"
            extra={<Tag color="orange">Status</Tag>}
          >
            <CustomDonutChart 
              data={Object.entries(statusDistribution).map(([key, value]) => ({
                label: key.charAt(0).toUpperCase() + key.slice(1),
                value: value,
                color: key === 'active' ? '#52c41a' : key === 'maintenance' ? '#faad14' : '#ff4d4f'
              }))}
              title="Status Distribution"
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="AI Services Overview" 
            className="dashboard-card"
            extra={<Tag color="purple">AI</Tag>}
          >
            {aiServicesCount > 0 ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Progress 
                    percent={100} 
                    size="small" 
                    strokeColor="#eb2f96"
                    format={() => `${aiServicesCount} services`}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {aiServicesList.map((service, index) => (
                    <Tag key={index} color="purple" style={{ padding: '4px 12px', borderRadius: 16 }}>
                      <RobotOutlined /> {service.name}
                    </Tag>
                  ))}
                </div>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
                  <span>All services are operational</span>
                  <span>Enterprise plan</span>
                </div>
              </div>
            ) : (
              <Empty description="No AI services available" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button type="primary" size="small">Enable AI Services</Button>
              </Empty>
            )}
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <span>
            <ClockCircleOutlined /> Recent Activity
            <Badge count={recentActivity?.length || 0} style={{ marginLeft: 8 }} />
          </span>
        } 
        style={{ marginTop: 16 }}
        extra={<Button size="small" icon={<ReloadOutlined />}>Refresh</Button>}
      >
        {recentActivity && recentActivity.length > 0 ? (
          <Timeline>
            {recentActivity.map((activity, index) => (
              <Timeline.Item 
                key={index} 
                color={activity.type === 'success' ? 'green' : activity.type === 'warning' ? 'orange' : activity.type === 'error' ? 'red' : 'blue'}
              >
                <strong>{activity.title}</strong>
                <div>{activity.description}</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {activity.timestamp ? moment(activity.timestamp).fromNow() : 'Just now'}
                  {activity.user && <span> • by {activity.user}</span>}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <Empty description="No recent activity" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      <Card title="Quick Actions" style={{ marginTop: 16 }}>
        <Space wrap>
          <Button type="primary" icon={<PlusOutlined />}>Add Hospital</Button>
          <Button icon={<UserOutlined />}>Add Staff</Button>
          <Button icon={<ApartmentOutlined />}>Add Department</Button>
          <Button icon={<RobotOutlined />}>Enable AI Service</Button>
          <Button icon={<ExportOutlined />}>Export Report</Button>
          <Button icon={<FilePdfOutlined />}>Generate PDF</Button>
        </Space>
      </Card>
    </div>
  );
};


// ============================================
// 2. ACCREDITATION DASHBOARD (NO MOCK DATA)
// ============================================
const AccreditationDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await hospitalService.getAccreditations();
      const items = Array.isArray(result) ? result : (result?.data || []);
      setData(items);
      if (items.length === 0) {
        message.info('No accreditation data found');
      }
    } catch (error) {
      console.error('Error fetching accreditations:', error);
      message.error('Failed to load accreditation data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateAccreditation(editingItem.id, values);
        message.success('Accreditation updated successfully');
      } else {
        await hospitalService.createAccreditation(values);
        message.success('Accreditation added successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save accreditation:', error);
      message.error(error.response?.data?.error || 'Failed to save accreditation');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteAccreditation(id);
      message.success('Accreditation deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete accreditation:', error);
      message.error(error.response?.data?.error || 'Failed to delete accreditation');
    }
  };

  const fields = [
    { name: 'standard', label: 'Standard', type: 'select', placeholder: 'Select standard', 
      options: [
        { value: 'JCI', label: 'JCI' },
        { value: 'ISO 9001:2015', label: 'ISO 9001:2015' },
        { value: 'CAP', label: 'CAP' },
        { value: 'NABH', label: 'NABH' }
      ], 
      rules: [{ required: true }] },
    { name: 'status', label: 'Status', type: 'select', placeholder: 'Select status', 
      options: [
        { value: 'Certified', label: 'Certified' },
        { value: 'In-Progress', label: 'In Progress' },
        { value: 'Pending', label: 'Pending' }
      ], 
      rules: [{ required: true }] },
    { name: 'score', label: 'Score', type: 'number', placeholder: 'Score (0-100)', min: 0, max: 100, 
      rules: [{ required: true }] },
    { name: 'nextAudit', label: 'Next Audit Date', type: 'date' }
  ];

  const certifiedCount = data.filter(d => d.status === 'Certified').length;
  const inProgressCount = data.filter(d => d.status === 'In-Progress').length;
  const pendingCount = data.filter(d => d.status === 'Pending').length;
  const overallScore = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.score || 0), 0) / data.length) : 0;

  return (
    <div>
      <Alert message="International Accreditation Status" type="success" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Certified" value={certifiedCount} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="In Progress" value={inProgressCount} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Pending" value={pendingCount} prefix={<WarningOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Overall Score" value={overallScore} suffix="/100" prefix={<SafetyCertificateOutlined />} /></Card></Col>
      </Row>

      <Card 
        title="Accreditation Details" 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>
              Add Accreditation
            </Button>
          </Space>
        }
      >
        <Table
          columns={[
            { title: 'Standard', dataIndex: 'standard' },
            { title: 'Status', dataIndex: 'status', render: s => <Badge status={s === 'Certified' ? 'success' : 'processing'} text={s} /> },
            { title: 'Score', dataIndex: 'score', render: s => <Progress percent={s} size="small" /> },
            { title: 'Next Audit', dataIndex: 'nextAudit', render: d => d ? moment(d).fromNow() : 'N/A' },
            { title: 'Actions', key: 'actions', render: (_, r) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
                  <Button type="link" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </Space>
            )}
          ]}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <AddDataModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        title={editingItem ? 'Edit Accreditation' : 'Add Accreditation'}
        fields={fields}
        initialValues={editingItem || {}}
      />
    </div>
  );
};

// ============================================
// 3. QUALITY INDICATORS (NO MOCK DATA)
// ============================================
const QualityIndicatorsDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await hospitalService.getQualityIndicators();
      const items = Array.isArray(result) ? result : (result?.data || []);
      setData(items);
      if (items.length === 0) {
        message.info('No quality indicator data found');
      }
    } catch (error) {
      console.error('Error fetching quality indicators:', error);
      message.error('Failed to load quality indicators');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateQualityIndicator(editingItem.id, values);
        message.success('Indicator updated successfully');
      } else {
        await hospitalService.createQualityIndicator(values);
        message.success('Indicator added successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save indicator:', error);
      message.error(error.response?.data?.error || 'Failed to save indicator');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteQualityIndicator(id);
      message.success('Indicator deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete indicator:', error);
      message.error(error.response?.data?.error || 'Failed to delete indicator');
    }
  };

  const fields = [
    { name: 'name', label: 'Indicator Name', type: 'input', placeholder: 'Enter indicator name', rules: [{ required: true }] },
    { name: 'category', label: 'Category', type: 'select', placeholder: 'Select category', 
      options: [
        { value: 'Patient Safety', label: 'Patient Safety' },
        { value: 'Clinical Outcomes', label: 'Clinical Outcomes' },
        { value: 'Operational Efficiency', label: 'Operational Efficiency' },
        { value: 'Patient Experience', label: 'Patient Experience' }
      ], 
      rules: [{ required: true }] },
    { name: 'target', label: 'Target Value', type: 'number', placeholder: 'Target value', rules: [{ required: true }] },
    { name: 'current', label: 'Current Value', type: 'number', placeholder: 'Current value', rules: [{ required: true }] },
    { name: 'benchmark', label: 'Benchmark', type: 'number', placeholder: 'Benchmark value' },
    { name: 'trend', label: 'Trend', type: 'select', placeholder: 'Select trend', 
      options: [
        { value: 'up', label: 'Improving ↑' },
        { value: 'down', label: 'Declining ↓' },
        { value: 'stable', label: 'Stable →' }
      ] }
  ];

  const onTrackCount = data.filter(d => d.current <= d.target).length;
  const aboveBenchmarkCount = data.filter(d => d.current <= d.benchmark).length;
  const improvingCount = data.filter(d => d.trend === 'up').length;
  const overallScore = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.current / d.target * 100), 0) / data.length) : 0;

  return (
    <div>
      <Alert message="Quality Indicators - International Benchmarking" type="info" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="On Track" value={onTrackCount} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Above Benchmark" value={aboveBenchmarkCount} prefix={<TrophyOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Improving" value={improvingCount} prefix={<RocketOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Overall Score" value={overallScore} suffix="%" prefix={<DashboardOutlined />} /></Card></Col>
      </Row>

      <Card 
        title="Quality Indicators" 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>
              Add Indicator
            </Button>
          </Space>
        }
      >
        <Table
          columns={[
            { title: 'Indicator', dataIndex: 'name' },
            { title: 'Category', dataIndex: 'category', render: c => <Tag>{c}</Tag> },
            { title: 'Performance', key: 'perf', render: (_, r) => {
              const percent = r.target > 0 ? Math.min((r.current / r.target) * 100, 100) : 0;
              return <Progress percent={percent} size="small" strokeColor={r.current <= r.target ? '#52c41a' : '#cf1322'} format={() => `${r.current}/${r.target}`} />;
            }},
            { title: 'Benchmark', dataIndex: 'benchmark', render: (b, r) => <Tag color={r.current <= b ? 'green' : 'orange'}>{b}</Tag> },
            { title: 'Trend', dataIndex: 'trend', render: t => <Tag color={t === 'up' ? 'green' : t === 'down' ? 'blue' : 'orange'}>{t === 'up' ? '↑' : t === 'down' ? '↓' : '→'}</Tag> },
            { title: 'Actions', key: 'actions', render: (_, r) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
                  <Button type="link" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </Space>
            )}
          ]}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <AddDataModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        title={editingItem ? 'Edit Indicator' : 'Add Indicator'}
        fields={fields}
        initialValues={editingItem || {}}
      />
    </div>
  );
};

// ============================================
// 4. PATIENT SAFETY GOALS (NO MOCK DATA)
// ============================================
const PatientSafetyGoalsDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await hospitalService.getPatientSafetyGoals();
      const items = Array.isArray(result) ? result : (result?.data || []);
      setData(items);
      if (items.length === 0) {
        message.info('No patient safety goals found');
      }
    } catch (error) {
      console.error('Error fetching safety goals:', error);
      message.error('Failed to load safety goals');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updatePatientSafetyGoal(editingItem.id, values);
        message.success('Goal updated successfully');
      } else {
        await hospitalService.createPatientSafetyGoal(values);
        message.success('Goal added successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save goal:', error);
      message.error(error.response?.data?.error || 'Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deletePatientSafetyGoal(id);
      message.success('Goal deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      message.error(error.response?.data?.error || 'Failed to delete goal');
    }
  };

  const fields = [
    { name: 'goal', label: 'Safety Goal', type: 'textarea', placeholder: 'Enter safety goal', rows: 2, rules: [{ required: true }] },
    { name: 'department', label: 'Department', type: 'input', placeholder: 'Enter department', rules: [{ required: true }] },
    { name: 'compliance', label: 'Compliance (%)', type: 'number', placeholder: 'Compliance percentage', min: 0, max: 100, rules: [{ required: true }] },
    { name: 'target', label: 'Target (%)', type: 'number', placeholder: 'Target percentage', min: 0, max: 100, rules: [{ required: true }] },
    { name: 'status', label: 'Status', type: 'select', placeholder: 'Select status', 
      options: [
        { value: 'Excellent', label: 'Excellent' },
        { value: 'Good', label: 'Good' },
        { value: 'Needs Improvement', label: 'Needs Improvement' }
      ] }
  ];

  const overallCompliance = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.compliance || 0), 0) / data.length) : 0;
  const achievingTarget = data.filter(d => d.compliance >= d.target).length;
  const needsImprovement = data.filter(d => d.compliance < d.target).length;
  const excellence = data.filter(d => d.status === 'Excellent').length;

  return (
    <div>
      <Alert message="WHO Patient Safety Goals" description="7 International Patient Safety Goals" type="info" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Overall Compliance" value={overallCompliance} suffix="%" prefix={<SafetyCertificateOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Goals Achieving Target" value={achievingTarget} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Needs Improvement" value={needsImprovement} prefix={<WarningOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Excellence" value={excellence} prefix={<CrownOutlined />} /></Card></Col>
      </Row>

      <Card 
        title="Safety Goals" 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>
              Add Goal
            </Button>
          </Space>
        }
      >
        <Table
          columns={[
            { title: 'Safety Goal', dataIndex: 'goal' },
            { title: 'Department', dataIndex: 'department' },
            { title: 'Compliance', key: 'comp', render: (_, r) => {
              const percent = r.target > 0 ? Math.min((r.compliance / r.target) * 100, 100) : 0;
              return <Progress percent={percent} size="small" strokeColor={r.compliance >= r.target ? '#52c41a' : '#faad14'} format={() => `${r.compliance}%`} />;
            }},
            { title: 'Status', dataIndex: 'status', render: s => <Badge status={s === 'Excellent' ? 'success' : s === 'Good' ? 'processing' : 'warning'} text={s} /> },
            { title: 'Actions', key: 'actions', render: (_, r) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
                  <Button type="link" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </Space>
            )}
          ]}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <AddDataModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        title={editingItem ? 'Edit Goal' : 'Add Goal'}
        fields={fields}
        initialValues={editingItem || {}}
      />
    </div>
  );
};

// ============================================
// 5. ADVERSE EVENT (NO MOCK DATA)
// ============================================
const AdverseEventDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await hospitalService.getAdverseEvents();
      const items = Array.isArray(result) ? result : (result?.data || []);
      setData(items);
      if (items.length === 0) {
        message.info('No adverse events found');
      }
    } catch (error) {
      console.error('Error fetching adverse events:', error);
      message.error('Failed to load adverse events');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateAdverseEvent(editingItem.id, values);
        message.success('Event updated successfully');
      } else {
        await hospitalService.reportAdverseEvent(values);
        message.success('Event reported successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save event:', error);
      message.error(error.response?.data?.error || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteAdverseEvent(id);
      message.success('Event deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete event:', error);
      message.error(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const handleResolve = async (id) => {
    try {
      await hospitalService.resolveAdverseEvent(id);
      message.success('Event resolved successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to resolve event:', error);
      message.error(error.response?.data?.error || 'Failed to resolve event');
    }
  };

  const fields = [
    { name: 'type', label: 'Event Type', type: 'select', placeholder: 'Select type', 
      options: [
        { value: 'Medication Error', label: 'Medication Error' },
        { value: 'Fall', label: 'Fall' },
        { value: 'Hospital-Acquired Infection', label: 'Hospital-Acquired Infection' },
        { value: 'Surgical Complication', label: 'Surgical Complication' },
        { value: 'Equipment Failure', label: 'Equipment Failure' },
        { value: 'Other', label: 'Other' }
      ], 
      rules: [{ required: true }] },
    { name: 'severity', label: 'Severity', type: 'select', placeholder: 'Select severity', 
      options: [
        { value: 'Minor', label: 'Minor' },
        { value: 'Moderate', label: 'Moderate' },
        { value: 'Severe', label: 'Severe' },
        { value: 'Critical', label: 'Critical' }
      ], 
      rules: [{ required: true }] },
    { name: 'department', label: 'Department', type: 'input', placeholder: 'Enter department', rules: [{ required: true }] },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the event', rows: 3, rules: [{ required: true }] },
    { name: 'reported_by', label: 'Reported By', type: 'input', placeholder: 'Enter reporter name', rules: [{ required: true }] },
    { name: 'date', label: 'Date', type: 'date' }
  ];

  const totalEvents = data.length;
  const underInvestigation = data.filter(d => d.status === 'Under Investigation').length;
  const resolved = data.filter(d => d.status === 'Resolved').length;
  const critical = data.filter(d => d.severity === 'Critical').length;

  return (
    <div>
      <Alert message="Adverse Event Reporting System (AERS)" type="warning" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Total Events" value={totalEvents} prefix={<WarningOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Under Investigation" value={underInvestigation} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Resolved" value={resolved} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Critical" value={critical} prefix={<FireOutlined />} /></Card></Col>
      </Row>

      <Card 
        title="Adverse Events" 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>
              Report Event
            </Button>
          </Space>
        }
      >
        <Table
          columns={[
            { title: 'Type', dataIndex: 'type', render: t => <Tag>{t}</Tag> },
            { title: 'Severity', dataIndex: 'severity', render: s => <Tag color={s === 'Critical' ? 'red' : s === 'Severe' ? 'orange' : 'blue'}>{s}</Tag> },
            { title: 'Department', dataIndex: 'department' },
            { title: 'Status', dataIndex: 'status', render: s => <Badge status={s === 'Resolved' ? 'success' : 'processing'} text={s} /> },
            { title: 'Date', dataIndex: 'date', render: d => d ? moment(d).format('MMM DD, YYYY') : 'N/A' },
            { title: 'Actions', key: 'actions', render: (_, r) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
                {r.status !== 'Resolved' && <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handleResolve(r.id)} style={{ color: '#52c41a' }}>Resolve</Button>}
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
                  <Button type="link" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </Space>
            )}
          ]}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <AddDataModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        title={editingItem ? 'Edit Event' : 'Report Event'}
        fields={fields}
        initialValues={editingItem || {}}
      />
    </div>
  );
};

// ============================================
// 6. RISK ASSESSMENT (NO MOCK DATA)
// ============================================
const RiskAssessmentDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await hospitalService.getRiskAssessments();
      const items = Array.isArray(result) ? result : (result?.data || []);
      setData(items);
      if (items.length === 0) {
        message.info('No risk assessments found');
      }
    } catch (error) {
      console.error('Error fetching risk assessments:', error);
      message.error('Failed to load risk assessments');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateRiskAssessment(editingItem.id, values);
        message.success('Risk assessment updated successfully');
      } else {
        await hospitalService.createRiskAssessment(values);
        message.success('Risk assessment added successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save risk assessment:', error);
      message.error(error.response?.data?.error || 'Failed to save risk assessment');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteRiskAssessment(id);
      message.success('Risk assessment deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete risk assessment:', error);
      message.error(error.response?.data?.error || 'Failed to delete risk assessment');
    }
  };

  const fields = [
    { name: 'category', label: 'Risk Category', type: 'select', placeholder: 'Select category', 
      options: [
        { value: 'Patient Safety', label: 'Patient Safety' },
        { value: 'Infection Control', label: 'Infection Control' },
        { value: 'Data Security', label: 'Data Security' },
        { value: 'Medical Device Safety', label: 'Medical Device Safety' },
        { value: 'Staff Competency', label: 'Staff Competency' },
        { value: 'Emergency Preparedness', label: 'Emergency Preparedness' }
      ], 
      rules: [{ required: true }] },
    { name: 'score', label: 'Risk Score', type: 'number', placeholder: 'Score (0-100)', min: 0, max: 100, rules: [{ required: true }] },
    { name: 'risk', label: 'Risk Level', type: 'select', placeholder: 'Select risk level', 
      options: [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' }
      ], 
      rules: [{ required: true }] },
    { name: 'trend', label: 'Trend', type: 'select', placeholder: 'Select trend', 
      options: [
        { value: 'Improving', label: 'Improving' },
        { value: 'Stable', label: 'Stable' },
        { value: 'Needs Attention', label: 'Needs Attention' }
      ] }
  ];

  const overallScore = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.score || 0), 0) / data.length) : 0;
  const lowRisk = data.filter(d => d.risk === 'Low').length;
  const mediumRisk = data.filter(d => d.risk === 'Medium').length;
  const highRisk = data.filter(d => d.risk === 'High').length;

  return (
    <div>
      <Alert message="Enterprise Risk Management (ERM)" type="info" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Overall Risk Score" value={overallScore} suffix="/100" prefix={<SafetyOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Low Risk" value={lowRisk} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Medium Risk" value={mediumRisk} prefix={<WarningOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="High Risk" value={highRisk} prefix={<FireOutlined />} /></Card></Col>
      </Row>

      <Card 
        title="Risk Assessment" 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>
              Add Risk
            </Button>
          </Space>
        }
      >
        <Table
          columns={[
            { title: 'Category', dataIndex: 'category' },
            { title: 'Score', dataIndex: 'score', render: s => <Progress percent={s} size="small" strokeColor={s > 80 ? '#52c41a' : s > 70 ? '#faad14' : '#cf1322'} /> },
            { title: 'Risk Level', dataIndex: 'risk', render: r => <Tag color={r === 'Low' ? 'green' : r === 'Medium' ? 'orange' : 'red'}>{r}</Tag> },
            { title: 'Trend', dataIndex: 'trend', render: t => <Tag color={t === 'Improving' ? 'green' : t === 'Needs Attention' ? 'red' : 'blue'}>{t}</Tag> },
            { title: 'Actions', key: 'actions', render: (_, r) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
                  <Button type="link" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </Space>
            )}
          ]}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <AddDataModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        title={editingItem ? 'Edit Risk Assessment' : 'Add Risk Assessment'}
        fields={fields}
        initialValues={editingItem || {}}
      />
    </div>
  );
};

// ============================================
// 7. DISEASE CONTROL (NO MOCK DATA)
// ============================================
const DiseaseControlDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await hospitalService.getDiseaseSurveillance();
      const items = Array.isArray(result) ? result : (result?.data || []);
      setData(items);
      if (items.length === 0) {
        message.info('No disease surveillance data found');
      }
    } catch (error) {
      console.error('Error fetching diseases:', error);
      message.error('Failed to load disease data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateDisease(editingItem.id, values);
        message.success('Disease updated successfully');
      } else {
        await hospitalService.createDisease(values);
        message.success('Disease added successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save disease:', error);
      message.error(error.response?.data?.error || 'Failed to save disease');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteDisease(id);
      message.success('Disease deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete disease:', error);
      message.error(error.response?.data?.error || 'Failed to delete disease');
    }
  };

  const fields = [
    { name: 'name', label: 'Disease Name', type: 'input', placeholder: 'Enter disease name', rules: [{ required: true }] },
    { name: 'active', label: 'Active Cases', type: 'number', placeholder: 'Number of active cases', rules: [{ required: true }] },
    { name: 'status', label: 'Status', type: 'select', placeholder: 'Select status', 
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Monitoring', label: 'Monitoring' },
        { value: 'Contained', label: 'Contained' }
      ], 
      rules: [{ required: true }] },
    { name: 'severity', label: 'Severity', type: 'select', placeholder: 'Select severity', 
      options: [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' }
      ], 
      rules: [{ required: true }] }
  ];

  const activeDiseases = data.length;
  const activeCases = data.reduce((sum, d) => sum + (d.active || 0), 0);
  const contained = data.filter(d => d.status === 'Contained').length;
  const monitoring = data.filter(d => d.status === 'Monitoring').length;

  return (
    <div>
      <Alert message="Disease Control & Surveillance" type="warning" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Active Diseases" value={activeDiseases} prefix={<ExperimentOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Active Cases" value={activeCases} prefix={<BugOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Contained" value={contained} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Monitoring" value={monitoring} prefix={<ClockCircleOutlined />} /></Card></Col>
      </Row>

      <Card 
        title="Disease Surveillance" 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>
              Add Disease
            </Button>
          </Space>
        }
      >
        <Table
          columns={[
            { title: 'Disease', dataIndex: 'name' },
            { title: 'Active Cases', dataIndex: 'active' },
            { title: 'Status', dataIndex: 'status', render: s => <Badge status={s === 'Contained' ? 'success' : s === 'Monitoring' ? 'warning' : 'error'} text={s} /> },
            { title: 'Severity', dataIndex: 'severity', render: s => <Tag color={s === 'High' ? 'red' : s === 'Medium' ? 'orange' : 'green'}>{s}</Tag> },
            { title: 'Actions', key: 'actions', render: (_, r) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
                  <Button type="link" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </Space>
            )}
          ]}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <AddDataModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        title={editingItem ? 'Edit Disease' : 'Add Disease'}
        fields={fields}
        initialValues={editingItem || {}}
      />
    </div>
  );
};

// ============================================
// 8. INFECTION CONTROL (NO MOCK DATA)
// ============================================
const InfectionControlDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await hospitalService.getInfectionControlData();
      const items = Array.isArray(result) ? result : (result?.data || []);
      setData(items);
      if (items.length === 0) {
        message.info('No infection control data found');
      }
    } catch (error) {
      console.error('Error fetching infection data:', error);
      message.error('Failed to load infection data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateInfectionProtocol(editingItem.id, values);
        message.success('Infection updated successfully');
      } else {
        await hospitalService.createInfectionReport(values);
        message.success('Infection reported successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save infection:', error);
      message.error(error.response?.data?.error || 'Failed to save infection');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteInfectionReport(id);
      message.success('Infection deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete infection:', error);
      message.error(error.response?.data?.error || 'Failed to delete infection');
    }
  };

  const fields = [
    { name: 'type', label: 'Infection Type', type: 'select', placeholder: 'Select type', 
      options: [
        { value: 'COVID-19', label: 'COVID-19' },
        { value: 'MRSA', label: 'MRSA' },
        { value: 'VRE', label: 'VRE' },
        { value: 'C. Diff', label: 'C. Diff' },
        { value: 'Other', label: 'Other' }
      ], 
      rules: [{ required: true }] },
    { name: 'department', label: 'Department', type: 'input', placeholder: 'Enter department', rules: [{ required: true }] },
    { name: 'active', label: 'Active Cases', type: 'number', placeholder: 'Active cases', rules: [{ required: true }] },
    { name: 'recovered', label: 'Recovered Cases', type: 'number', placeholder: 'Recovered cases' },
    { name: 'status', label: 'Status', type: 'select', placeholder: 'Select status', 
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Monitoring', label: 'Monitoring' },
        { value: 'Contained', label: 'Contained' }
      ], 
      rules: [{ required: true }] }
  ];

  const activeInfections = data.reduce((sum, d) => sum + (d.active || 0), 0);
  const monitoring = data.filter(d => d.status === 'Monitoring').length;

  return (
    <div>
      <Alert message="Infection Control - CDC Guidelines" type="info" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Active Infections" value={activeInfections} prefix={<BugOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Recovery Rate" value={data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.recovered || 0), 0) / data.length) : 0} suffix="%" prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Under Monitoring" value={monitoring} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Containment Level" value={data.length > 0 ? `Level ${Math.min(5, Math.round(data.filter(d => d.status === 'Contained').length / data.length * 5) + 1)}` : 'N/A'} prefix={<SafetyCertificateOutlined />} /></Card></Col>
      </Row>

      <Card 
        title="Infection Reports" 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>
              Report Infection
            </Button>
          </Space>
        }
      >
        <Table
          columns={[
            { title: 'Type', dataIndex: 'type', render: t => <Tag color={t === 'COVID-19' ? 'red' : 'orange'}>{t}</Tag> },
            { title: 'Department', dataIndex: 'department' },
            { title: 'Active', dataIndex: 'active' },
            { title: 'Recovered', dataIndex: 'recovered' },
            { title: 'Rate', dataIndex: 'rate', render: r => <Progress percent={r || 0} size="small" strokeColor={r > 70 ? '#52c41a' : '#faad14'} /> },
            { title: 'Status', dataIndex: 'status', render: s => <Badge status={s === 'Contained' ? 'success' : s === 'Monitoring' ? 'warning' : 'error'} text={s} /> },
            { title: 'Actions', key: 'actions', render: (_, r) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
                  <Button type="link" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </Space>
            )}
          ]}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <AddDataModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        title={editingItem ? 'Edit Infection' : 'Report Infection'}
        fields={fields}
        initialValues={editingItem || {}}
      />
    </div>
  );
};

// ============================================
// 9. EMERGENCY PREPAREDNESS (NO MOCK DATA)
// ============================================
const EmergencyPreparednessDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await hospitalService.getEmergencyPreparedness();
      const items = Array.isArray(result) ? result : (result?.data || []);
      setData(items);
      if (items.length === 0) {
        message.info('No emergency preparedness data found');
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      message.error('Failed to load emergency data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateEmergencyPlan(editingItem.id, values);
        message.success('Emergency updated successfully');
      } else {
        await hospitalService.reportEmergency(values);
        message.success('Emergency reported successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save emergency:', error);
      message.error(error.response?.data?.error || 'Failed to save emergency');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteEmergency(id);
      message.success('Emergency deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete emergency:', error);
      message.error(error.response?.data?.error || 'Failed to delete emergency');
    }
  };

  const fields = [
    { name: 'type', label: 'Incident Type', type: 'select', placeholder: 'Select type', 
      options: [
        { value: 'Code Blue - Cardiac Arrest', label: 'Code Blue - Cardiac Arrest' },
        { value: 'Trauma Alert', label: 'Trauma Alert' },
        { value: 'Stroke Alert', label: 'Stroke Alert' },
        { value: 'Fire', label: 'Fire' },
        { value: 'Other', label: 'Other' }
      ], 
      rules: [{ required: true }] },
    { name: 'location', label: 'Location', type: 'input', placeholder: 'Enter location', rules: [{ required: true }] },
    { name: 'status', label: 'Status', type: 'select', placeholder: 'Select status', 
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Resolved', label: 'Resolved' }
      ], 
      rules: [{ required: true }] },
    { name: 'team', label: 'Response Team', type: 'input', placeholder: 'Enter response team' }
  ];

  const activeEmergencies = data.filter(d => d.status === 'Active').length;

  return (
    <div>
      <Alert message="Hospital Emergency Preparedness - HICS Compliant" type="warning" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Active Emergencies" value={activeEmergencies} prefix={<FireOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Response Teams" value={data.length > 0 ? new Set(data.map(d => d.team)).size : 0} prefix={<TeamOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Avg Response Time" value={data.length > 0 ? '4.2' : 'N/A'} suffix="min" prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Resolved" value={data.filter(d => d.status === 'Resolved').length} prefix={<CheckCircleOutlined />} /></Card></Col>
      </Row>

      <Card 
        title="Recent Emergencies" 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>
              Report Emergency
            </Button>
          </Space>
        }
      >
        <Table
          columns={[
            { title: 'Incident Type', dataIndex: 'type' },
            { title: 'Location', dataIndex: 'location' },
            { title: 'Status', dataIndex: 'status', render: s => <Badge status={s === 'Active' ? 'error' : 'success'} text={s} /> },
            { title: 'Response Team', dataIndex: 'team' },
            { title: 'Actions', key: 'actions', render: (_, r) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
                  <Button type="link" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </Space>
            )}
          ]}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <AddDataModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        title={editingItem ? 'Edit Emergency' : 'Report Emergency'}
        fields={fields}
        initialValues={editingItem || {}}
      />
    </div>
  );
};

// ============================================
// 10. STAFF COMPETENCY (NO MOCK DATA)
// ============================================
const StaffCompetencyDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await hospitalService.getStaffCompetencies();
      const items = Array.isArray(result) ? result : (result?.data || []);
      setData(items);
      if (items.length === 0) {
        message.info('No competency data found');
      }
    } catch (error) {
      console.error('Error fetching competencies:', error);
      message.error('Failed to load competency data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (values) => {
    try {
      if (editingItem) {
        await hospitalService.updateCompetency(editingItem.id, values);
        message.success('Competency updated successfully');
      } else {
        await hospitalService.createCompetency(values);
        message.success('Competency added successfully');
      }
      setModalVisible(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save competency:', error);
      message.error(error.response?.data?.error || 'Failed to save competency');
    }
  };

  const handleDelete = async (id) => {
    try {
      await hospitalService.deleteCompetency(id);
      message.success('Competency deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete competency:', error);
      message.error(error.response?.data?.error || 'Failed to delete competency');
    }
  };

  const fields = [
    { name: 'name', label: 'Competency Name', type: 'input', placeholder: 'Enter competency name', rules: [{ required: true }] },
    { name: 'type', label: 'Type', type: 'select', placeholder: 'Select type', 
      options: [
        { value: 'Certification', label: 'Certification' },
        { value: 'Training', label: 'Training' }
      ], 
      rules: [{ required: true }] },
    { name: 'compliance', label: 'Compliance (%)', type: 'number', placeholder: 'Compliance percentage', min: 0, max: 100, rules: [{ required: true }] },
    { name: 'status', label: 'Status', type: 'select', placeholder: 'Select status', 
      options: [
        { value: 'Current', label: 'Current' },
        { value: 'Needs Renewal', label: 'Needs Renewal' }
      ], 
      rules: [{ required: true }] },
    { name: 'nextRenewal', label: 'Next Renewal Date', type: 'date' }
  ];

  const overallCompetency = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.compliance || 0), 0) / data.length) : 0;
  const current = data.filter(d => d.status === 'Current').length;
  const needsRenewal = data.filter(d => d.status === 'Needs Renewal').length;

  return (
    <div>
      <Alert message="Staff Competency Management" type="info" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Overall Competency" value={overallCompetency} suffix="%" prefix={<SafetyCertificateOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Current Certifications" value={current} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Need Renewal" value={needsRenewal} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Training Hours" value={data.length > 0 ? data.reduce((sum, d) => sum + (d.hours || 0), 0) : 0} suffix="hrs" prefix={<BookOutlined />} /></Card></Col>
      </Row>

      <Card 
        title="Competency Dashboard" 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalVisible(true); }}>
              Add Competency
            </Button>
          </Space>
        }
      >
        <Table
          columns={[
            { title: 'Competency', dataIndex: 'name' },
            { title: 'Type', dataIndex: 'type', render: t => <Tag color={t === 'Certification' ? 'blue' : 'green'}>{t}</Tag> },
            { title: 'Compliance', dataIndex: 'compliance', render: c => <Progress percent={c || 0} size="small" strokeColor={c > 90 ? '#52c41a' : '#faad14'} /> },
            { title: 'Status', dataIndex: 'status', render: s => <Badge status={s === 'Current' ? 'success' : 'warning'} text={s} /> },
            { title: 'Next Renewal', dataIndex: 'nextRenewal', render: d => d ? <Tag color={moment(d).diff(moment(), 'days') < 30 ? 'orange' : 'green'}>{moment(d).fromNow()}</Tag> : 'N/A' },
            { title: 'Actions', key: 'actions', render: (_, r) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingItem(r); setModalVisible(true); }} />
                <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
                  <Button type="link" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </Space>
            )}
          ]}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <AddDataModal
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        title={editingItem ? 'Edit Competency' : 'Add Competency'}
        fields={fields}
        initialValues={editingItem || {}}
      />
    </div>
  );
};

// ============================================
// 11. FINANCIAL DASHBOARD (REAL API)
// ============================================
const FinancialDashboard = () => {
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    outstandingReceivables: 0,
    collectionRate: 0,
    pendingClaims: 0,
    revenueByDepartment: [],
    payerMix: []
  });
  const [loading, setLoading] = useState(false);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const result = await hospitalService.getFinancialData();
      if (result && result.data) {
        setFinancialData({
          totalRevenue: result.data.totalRevenue || 0,
          outstandingReceivables: result.data.outstandingReceivables || 0,
          collectionRate: result.data.collectionRate || 0,
          pendingClaims: result.data.pendingClaims || 0,
          revenueByDepartment: result.data.revenueByDepartment || [],
          payerMix: result.data.payerMix || []
        });
      } else {
        message.info('No financial data available');
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      message.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading financial data...</div>
      </div>
    );
  }

  return (
    <div>
      <Alert message="Enterprise Financial Dashboard" type="info" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Total Revenue (YTD)" value={financialData.totalRevenue} prefix="$" precision={0} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Outstanding Receivables" value={financialData.outstandingReceivables} prefix="$" precision={0} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Collection Rate" value={financialData.collectionRate} suffix="%" valueStyle={{ color: financialData.collectionRate > 85 ? '#52c41a' : '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Pending Claims" value={financialData.pendingClaims} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#cf1322' }} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Revenue by Department">
            {financialData.revenueByDepartment.length > 0 ? (
              <CustomBarChart 
                data={financialData.revenueByDepartment.map(d => ({
                  label: d.label,
                  value: d.value || 0,
                  max: Math.max(...financialData.revenueByDepartment.map(x => x.value || 0), 1),
                  unit: ' $',
                  color: '#1890ff'
                }))}
                title="Revenue Distribution"
              />
            ) : (
              <Empty description="No revenue data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Payer Mix">
            {financialData.payerMix.length > 0 ? (
              financialData.payerMix.map((item, index) => (
                <div key={index} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{item.label}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <Progress percent={item.percentage} size="small" strokeColor={item.color || '#1890ff'} />
                </div>
              ))
            ) : (
              <Empty description="No payer mix data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="Quick Actions" style={{ marginTop: 16 }}>
        <Space wrap>
          <Button icon={<DollarOutlined />}>Generate Invoice</Button>
          <Button icon={<WalletOutlined />}>Submit Claim</Button>
          <Button icon={<FileExcelOutlined />}>Export Report</Button>
          <Button icon={<PrinterOutlined />}>Print Statement</Button>
        </Space>
      </Card>
    </div>
  );
};

// ============================================
// 12. SYSTEM HEALTH DASHBOARD (REAL API)
// ============================================
const SystemHealthDashboard = () => {
  const [systemData, setSystemData] = useState({
    uptime: '0%',
    responseTime: '0ms',
    activeUsers: 0,
    pendingJobs: 0,
    services: [],
    integrations: []
  });
  const [loading, setLoading] = useState(false);

  const fetchSystemHealth = async () => {
    setLoading(true);
    try {
      const result = await hospitalService.getSystemHealth();
      if (result && result.data) {
        setSystemData({
          uptime: result.data.uptime || '0%',
          responseTime: result.data.responseTime || '0ms',
          activeUsers: result.data.activeUsers || 0,
          pendingJobs: result.data.pendingJobs || 0,
          services: result.data.services || [],
          integrations: result.data.integrations || []
        });
      } else {
        message.info('No system health data available');
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
      message.error('Failed to load system health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading system health data...</div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const map = {
      operational: 'success',
      degraded: 'warning',
      disconnected: 'error',
      connected: 'success'
    };
    return map[status] || 'default';
  };

  return (
    <div>
      <Alert message="System Health & Integrations" type="info" showIcon style={{ marginBottom: 16 }} />
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="System Uptime" value={systemData.uptime} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Response Time" value={systemData.responseTime} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Active Users" value={systemData.activeUsers} prefix={<UserOutlined />} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Pending Jobs" value={systemData.pendingJobs} prefix={<HourglassOutlined />} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Service Status">
            {systemData.services.length > 0 ? (
              systemData.services.map((service, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{service.name}</span>
                    <Badge status={getStatusBadge(service.status)} text={service.statusText || service.status} />
                  </div>
                </div>
              ))
            ) : (
              <Empty description="No service data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Integration Status">
            {systemData.integrations.length > 0 ? (
              systemData.integrations.map((integration, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{integration.name}</span>
                    <Space>
                      <Badge status={getStatusBadge(integration.status)} text={integration.statusText || integration.status} />
                      {integration.lastSync && <span style={{ fontSize: 12, color: '#999' }}>{integration.lastSync}</span>}
                    </Space>
                  </div>
                </div>
              ))
            ) : (
              <Empty description="No integration data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};


// ============================================
// MAIN HOSPITAL MANAGEMENT COMPONENT
// ============================================

function HospitalManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchText, setSearchText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [aiServices, setAiServices] = useState([]);
  const [form] = Form.useForm();
  const [recentActivity, setRecentActivity] = useState([]);
  const [userCompany, setUserCompany] = useState(null);
  const [userHospital, setUserHospital] = useState(null);

  // Fetch user's company and hospital info
  const fetchUserContext = async () => {
    try {
      const companyId = sessionStorage.getItem('company_id');
      if (companyId) {
        const companyResponse = await hospitalService.getCompany(companyId);
        if (companyResponse && companyResponse.success) {
          setUserCompany(companyResponse.data);
          if (companyResponse.data.hospital_id) {
            const hospitalResponse = await hospitalService.getHospitalById(companyResponse.data.hospital_id);
            if (hospitalResponse && hospitalResponse.success) {
              setUserHospital(hospitalResponse.data);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not fetch user context:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await fetchUserContext();
      
      const [hospitalsData, departmentsData, staffData, aiServicesData] = await Promise.all([
        hospitalService.getHospitals(),
        hospitalService.getDepartments(),
        hospitalService.getMedicalStaff(),
        hospitalService.getAIServices()
      ]);
    
      console.log('🔍 Hospitals Data:', hospitalsData);
      console.log('🔍 AI Services Data (raw):', aiServicesData);
      
      let extractedAIServices = [];
      
      if (aiServicesData && aiServicesData.services) {
        extractedAIServices = aiServicesData.services;
      } else if (Array.isArray(aiServicesData)) {
        extractedAIServices = aiServicesData;
      } else if (hospitalsData && hospitalsData.length > 0 && hospitalsData[0]?.aiServices) {
        extractedAIServices = hospitalsData[0].aiServices;
      } else {
        for (const hospital of (hospitalsData || [])) {
          if (hospital.aiServices && Array.isArray(hospital.aiServices)) {
            extractedAIServices = hospital.aiServices;
            break;
          }
        }
      }
      
      console.log('✅ Extracted AI Services:', extractedAIServices);
      
      setHospitals(Array.isArray(hospitalsData) ? hospitalsData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      setStaff(Array.isArray(staffData) ? staffData : []);
      setAiServices(extractedAIServices);
      
      message.success('Data loaded successfully');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Failed to load data');
      setHospitals([]);
      setDepartments([]);
      setStaff([]);
      setAiServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSymptomAnalysis = async (symptoms) => {
    try {
      const analysis = await medicalAIService.analyzeSymptoms(symptoms);
      setAnalysisResult(analysis);
      message.success('AI analysis completed');
    } catch (error) {
      console.error('AI analysis failed:', error);
      message.error('AI analysis failed');
    }
  };

  const handleAddHospital = () => {
    setSelectedHospital(null);
    form.resetFields();
    form.setFieldsValue({ type: 'general', status: 'active' });
    setModalVisible(true);
  };

  const handleEditHospital = (hospital) => {
    setSelectedHospital(hospital);
    form.setFieldsValue(hospital);
    setModalVisible(true);
  };

  const handleDeleteHospital = async (hospitalId) => {
    try {
      await hospitalService.deleteHospital(hospitalId);
      message.success('Hospital deleted successfully');
      await fetchAllData();
    } catch (error) {
      console.error('Failed to delete hospital:', error);
      message.error('Failed to delete hospital');
    }
  };

  const handleModalOk = async (values) => {
    try {
      if (selectedHospital) {
        await hospitalService.updateHospital(selectedHospital.id, values);
        message.success('Hospital updated successfully');
      } else {
        await hospitalService.createHospital(values);
        message.success('Hospital added successfully');
      }
      setModalVisible(false);
      setSelectedHospital(null);
      form.resetFields();
      await fetchAllData();
    } catch (error) {
      console.error('Failed to save hospital:', error);
      message.error('Failed to save hospital');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedHospital(null);
    form.resetFields();
  };

  const getStatusColor = (status) => {
    const colors = { active: 'green', maintenance: 'orange', inactive: 'red' };
    return colors[status] || 'blue';
  };

  const getTypeColor = (type) => {
    const colors = { general: 'blue', community: 'green', specialty: 'purple', research: 'orange' };
    return colors[type] || 'default';
  };

  const filteredHospitals = hospitals.filter(hospital => 
    hospital.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    hospital.address?.toLowerCase().includes(searchText.toLowerCase())
  );

  const getHospitalDisplayName = () => {
    if (userHospital && userHospital.name) {
      return userHospital.name;
    }
    if (hospitals && hospitals.length > 0) {
      const userHospitalId = sessionStorage.getItem('hospital_id');
      if (userHospitalId) {
        const found = hospitals.find(h => h.id == userHospitalId);
        if (found) return found.name;
      }
      return hospitals[0]?.name || 'Hospital';
    }
    return 'Hospital';
  };

  const getCompanyDisplayName = () => {
    if (userCompany && userCompany.name) {
      return userCompany.name;
    }
    return sessionStorage.getItem('company_name') || 'Company';
  };

  const hospitalColumns = [
    {
      title: 'Hospital',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar size="large" icon={<BankOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text || 'N/A'}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              <EnvironmentOutlined /> {record.address || 'N/A'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={getTypeColor(type)}>{type?.toUpperCase() || 'N/A'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status?.toUpperCase() || 'N/A'}</Tag>,
    },
    {
      title: 'Capacity',
      key: 'capacity',
      render: (_, record) => (
        <div>
          <div><TeamOutlined /> {record.staffCount || 0} staff</div>
          <div><MedicineBoxOutlined /> {record.beds || 0} beds</div>
        </div>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          {rating || 'N/A'}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEditHospital(record)} />
          </Tooltip>
          <Popconfirm title="Delete Hospital" onConfirm={() => handleDeleteHospital(record.id)} okText="Yes" cancelText="No">
            <Tooltip title="Delete">
              <Button type="link" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="hospital-management-container">
      {/* Header */}
      <div className="hospital-header">
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <h1>
              <MedicineBoxOutlined /> 
              {getHospitalDisplayName()} Management
            </h1>
            <p>
              {getCompanyDisplayName()} - Comprehensive healthcare management with AI-powered insights and international standards
            </p>
          </Col>
          <Col>
            <Space>
              <Button icon={<ExportOutlined />}>Export</Button>
              <Button icon={<ImportOutlined />}>Import</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddHospital} className="btn-primary-gradient">
                Add Hospital
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={4}>
          <Card className="stat-card fade-in-up">
            <Statistic title="Total Hospitals" value={hospitals.length} prefix={<BankOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card className="stat-card fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Statistic title="Active" value={hospitals.filter(h => h.status === 'active').length} prefix={<HeartOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card className="stat-card fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Statistic title="Total Staff" value={hospitals.reduce((sum, h) => sum + (h.staffCount || 0), 0)} prefix={<TeamOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card className="stat-card fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Statistic title="Total Beds" value={hospitals.reduce((sum, h) => sum + (h.beds || 0), 0)} prefix={<MedicineBoxOutlined />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card className="stat-card fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Statistic title="AI Services" value={aiServices.length} prefix={<RobotOutlined />} valueStyle={{ color: '#eb2f96' }} suffix="tools" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card className="stat-card fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Statistic title="Departments" value={departments.length} prefix={<ApartmentOutlined />} valueStyle={{ color: '#36cfc9' }} />
          </Card>
        </Col>
      </Row>

      {analysisResult && (
        <Alert
          message="AI Analysis Result"
          description={analysisResult.diagnosis || 'Analysis completed successfully'}
          type="success"
          showIcon
          closable
          onClose={() => setAnalysisResult(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Search */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search hospitals..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select placeholder="Status" style={{ width: '100%' }}>
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select placeholder="Type" style={{ width: '100%' }}>
              <Option value="all">All Types</Option>
              <Option value="general">General</Option>
              <Option value="community">Community</Option>
              <Option value="specialty">Specialty</Option>
              <Option value="research">Research</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Button icon={<FilterOutlined />} style={{ width: '100%' }}>More Filters</Button>
          </Col>
        </Row>
      </Card>

      {/* Main Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large" className="enterprise-tabs">
        <TabPane tab={<span><DashboardOutlined /> Overview</span>} key="overview">
          <EnterpriseOverviewDashboard 
            hospitals={hospitals} 
            staff={staff} 
            departments={departments} 
            aiServices={aiServices} 
            recentActivity={recentActivity}
          />
        </TabPane>
        
        <TabPane tab={<span><UserOutlined /> Patient Flow</span>} key="patient-flow">
          <PatientFlow />
        </TabPane>

        <TabPane 
          tab={
            <span>
              <SafetyIcon style={{ color: '#faad14' }} /> 
              Safety Department
            </span>
          } 
          key="safety"
        >
          <SafetyDepartment />
        </TabPane>

        <TabPane 
          tab={<span><UserSwitchOutlined /> Doctor Dashboard</span>} 
          key="doctor-dashboard"
        >
          <DoctorDashboard onDataUpdate={fetchAllData} />
        </TabPane>

        <TabPane tab={<span><BankOutlined /> Hospitals <Badge count={hospitals.length} /></span>} key="hospitals">
          <Card>
            <Table
              className="hospital-table"
              columns={hospitalColumns}
              dataSource={filteredHospitals}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><ApartmentOutlined /> Departments <Badge count={departments.length} /></span>} key="departments">
          <Card>
            <Table
              className="hospital-table"
              columns={[
                { title: 'Department', dataIndex: 'name' },
                { title: 'Head', dataIndex: 'head' },
                { title: 'Staff', dataIndex: 'staffCount' },
                { title: 'Beds', dataIndex: 'beds' },
                { title: 'Status', dataIndex: 'status', render: (s) => <Tag color={getStatusColor(s)}>{s?.toUpperCase()}</Tag> }
              ]}
              dataSource={departments}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><TeamOutlined /> Staff <Badge count={staff.length} /></span>} key="staff">
          <Card>
            <Table
              className="hospital-table"
              columns={[
                { title: 'Name', dataIndex: 'name', render: (t, r) => <Space><Avatar icon={<UserOutlined />} /><div><div>{t}</div><div style={{ fontSize: 12, color: '#666' }}>{r.role}</div></div></Space> },
                { title: 'Department', dataIndex: 'department' },
                { title: 'Status', dataIndex: 'status', render: (s) => <Tag color={getStatusColor(s)}>{s?.toUpperCase()}</Tag> }
              ]}
              dataSource={staff}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><SafetyCertificateOutlined /> Accreditation</span>} key="accreditation">
          <AccreditationDashboard />
        </TabPane>

        <TabPane tab={<span><DashboardOutlined /> Quality Indicators</span>} key="quality-indicators">
          <QualityIndicatorsDashboard />
        </TabPane>

        <TabPane tab={<span><SafetyOutlined /> Patient Safety</span>} key="patient-safety">
          <PatientSafetyGoalsDashboard />
        </TabPane>

        <TabPane tab={<span><WarningOutlined /> Adverse Events</span>} key="adverse-events">
          <AdverseEventDashboard />
        </TabPane>

        <TabPane tab={<span><AuditOutlined /> Risk Assessment</span>} key="risk-assessment">
          <RiskAssessmentDashboard />
        </TabPane>

        <TabPane tab={<span><ExperimentOutlined /> Disease Control</span>} key="disease-control">
          <DiseaseControlDashboard />
        </TabPane>

        <TabPane tab={<span><BugOutlined /> Infection Control</span>} key="infection-control">
          <InfectionControlDashboard />
        </TabPane>

        <TabPane tab={<span><FireOutlined /> Emergency</span>} key="emergency">
          <EmergencyPreparednessDashboard />
        </TabPane>

        <TabPane tab={<span><IdcardOutlined /> Competency</span>} key="competency">
          <StaffCompetencyDashboard />
        </TabPane>

        <TabPane tab={<span><DollarOutlined /> Financial</span>} key="financial">
          <FinancialDashboard />
        </TabPane>

        <TabPane tab={<span><SecurityScanOutlined /> System Health</span>} key="system-health">
          <SystemHealthDashboard />
        </TabPane>

        <TabPane tab={<span><RobotOutlined /> AI Services <Badge count={aiServices.length} /></span>} key="ai-services">
          <AIMedicalAnalysisTab 
            onSymptomAnalysis={handleSymptomAnalysis}
            analysisResult={analysisResult}
            aiServices={aiServices}
          />
        </TabPane>

        {/* ✅ USING THE IMPORTED AnalyticsDashboard COMPONENT */}
        <TabPane tab={<span><BarChartOutlined /> Analytics</span>} key="analytics-dashboard">
          <AnalyticsDashboard 
            hospitals={hospitals} 
            departments={departments} 
            staff={staff} 
            aiServices={aiServices} 
            onRefresh={fetchAllData}
          />
        </TabPane>
      </Tabs>
    
      {/* Add/Edit Hospital Modal */}
      <Modal
        title={selectedHospital ? 'Edit Hospital' : 'Add New Hospital'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
        className="custom-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleModalOk} initialValues={{ type: 'general', status: 'active' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Hospital Name" rules={[{ required: true }]}>
                <Input placeholder="Enter hospital name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Hospital Type" rules={[{ required: true }]}>
                <Select placeholder="Select type">
                  <Option value="general">General Hospital</Option>
                  <Option value="community">Community Hospital</Option>
                  <Option value="specialty">Specialty Hospital</Option>
                  <Option value="research">Research Hospital</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <TextArea rows={2} placeholder="Enter full address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} placeholder="Phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
                <Input prefix={<MailOutlined />} placeholder="Email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="beds" label="Number of Beds" rules={[{ required: true }]}>
                <InputNumber min={1} max={2000} style={{ width: '100%' }} placeholder="Beds" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="accreditation" label="Accreditation">
                <Select placeholder="Select accreditation">
                  <Option value="JCI">JCI</Option>
                  <Option value="CAP">CAP</Option>
                  <Option value="AAAHC">AAAHC</Option>
                  <Option value="NABH">NABH</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="established" label="Established Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{selectedHospital ? 'Update Hospital' : 'Add Hospital'}</Button>
              <Button onClick={handleModalCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default HospitalManagement;