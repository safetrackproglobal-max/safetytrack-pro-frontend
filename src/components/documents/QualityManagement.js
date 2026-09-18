// src/components/documents/QualityManagement.jsx
// Complete Quality Management System: CAPA, NCR, Change Control,
// Deviation management, Root Cause Analysis, and Quality metrics

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Descriptions,
  Tabs, Timeline, Avatar, List, Badge, Tooltip, Progress,
  Switch, Empty, Spin, Alert, Divider, Typography, Collapse,
  Checkbox, Radio, Slider, DatePicker, InputNumber, Segmented,
  Statistic, Result, Steps, Upload, Tree, Transfer, Cascader,
  Statistic as AntStat, FloatButton
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, WarningOutlined,
  InfoCircleOutlined, SafetyCertificateOutlined, AuditOutlined,
  FileProtectOutlined, FileSearchOutlined, BugOutlined,
  ExperimentOutlined, ThunderboltOutlined, FireOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  DownloadOutlined, UploadOutlined, ExportOutlined, ImportOutlined,
  ReloadOutlined, SearchOutlined, FilterOutlined, SettingOutlined,
  SaveOutlined, SendOutlined, CheckOutlined, CloseOutlined,
  ClockCircleOutlined, CalendarOutlined, UserOutlined, TeamOutlined,
  ApartmentOutlined, GlobalOutlined, EnvironmentOutlined,
  SafetyOutlined, MedicineBoxOutlined, LineChartOutlined,
  BarChartOutlined, PieChartOutlined, FundOutlined, RiseOutlined,
  FallOutlined, TrophyOutlined, StarOutlined, StarFilled,
  HistoryOutlined, LinkOutlined, PaperClipOutlined,
  DeploymentUnitOutlined, NodeIndexOutlined, ClusterOutlined,
  MergeCellsOutlined, SplitCellsOutlined, ThunderboltFilled,
  AlertFilled, BulbOutlined, RocketOutlined, AimOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend,
  ResponsiveContainer, Cell, Treemap
} from 'recharts';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import './QualityManagement.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Dragger } = Upload;

// ============================================================
// CONSTANTS
// ============================================================

const RECORD_TYPES = {
  capa: {
    label: 'CAPA',
    fullName: 'Corrective and Preventive Action',
    icon: <SafetyCertificateOutlined />,
    color: '#1890ff',
    prefix: 'CAPA'
  },
  ncr: {
    label: 'NCR',
    fullName: 'Non-Conformance Report',
    icon: <CloseCircleOutlined />,
    color: '#f5222d',
    prefix: 'NCR'
  },
  deviation: {
    label: 'Deviation',
    fullName: 'Process Deviation',
    icon: <WarningOutlined />,
    color: '#faad14',
    prefix: 'DEV'
  },
  change_request: {
    label: 'Change Request',
    fullName: 'Change Control Request',
    icon: <EditOutlined />,
    color: '#722ed1',
    prefix: 'CR'
  },
  observation: {
    label: 'Observation',
    fullName: 'Quality Observation',
    icon: <EyeOutlined />,
    color: '#13c2c2',
    prefix: 'OBS'
  }
};

const STATUS_FLOW = {
  draft: { label: 'Draft', color: 'default', icon: <EditOutlined />, step: 0 },
  submitted: { label: 'Submitted', color: 'processing', icon: <SendOutlined />, step: 1 },
  under_review: { label: 'Under Review', color: 'processing', icon: <EyeOutlined />, step: 2 },
  approved: { label: 'Approved', color: 'blue', icon: <CheckCircleOutlined />, step: 3 },
  in_progress: { label: 'In Progress', color: 'processing', icon: <ClockCircleOutlined />, step: 4 },
  pending_verification: { label: 'Pending Verification', color: 'warning', icon: <FileSearchOutlined />, step: 5 },
  closed: { label: 'Closed', color: 'success', icon: <CheckCircleOutlined />, step: 6 },
  rejected: { label: 'Rejected', color: 'error', icon: <CloseCircleOutlined />, step: -1 },
  cancelled: { label: 'Cancelled', color: 'default', icon: <CloseOutlined />, step: -1 }
};

const SEVERITY_LEVELS = {
  critical: { label: 'Critical', color: '#cf1322', bg: '#fff1f0', responseDays: 1 },
  major: { label: 'Major', color: '#f5222d', bg: '#fff1f0', responseDays: 3 },
  minor: { label: 'Minor', color: '#faad14', bg: '#fff7e6', responseDays: 7 },
  observation: { label: 'Observation', color: '#52c41a', bg: '#f6ffed', responseDays: 30 }
};

const RCA_METHODS = {
  five_whys: { label: '5 Whys', description: 'Iterative questioning technique' },
  fishbone: { label: 'Fishbone (Ishikawa)', description: 'Cause and effect diagram' },
  fault_tree: { label: 'Fault Tree Analysis', description: 'Top-down deductive analysis' },
  pareto: { label: 'Pareto Analysis', description: '80/20 rule analysis' },
  fmea: { label: 'FMEA', description: 'Failure Mode and Effects Analysis' }
};

const CAPA_STAGES = {
  identification: { label: 'Identification', icon: <SearchOutlined />, order: 1 },
  investigation: { label: 'Investigation', icon: <FileSearchOutlined />, order: 2 },
  root_cause: { label: 'Root Cause Analysis', icon: <NodeIndexOutlined />, order: 3 },
  action_plan: { label: 'Action Plan', icon: <DeploymentUnitOutlined />, order: 4 },
  implementation: { label: 'Implementation', icon: <RocketOutlined />, order: 5 },
  verification: { label: 'Verification', icon: <CheckCircleOutlined />, order: 6 },
  closure: { label: 'Closure', icon: <TrophyOutlined />, order: 7 }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const QualityManagement = ({
  companyId = null,
  embedded = false,
  onUpdate = null
}) => {
  const { user } = useAuth();

  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recordType, setRecordType] = useState('all');
  const [records, setRecords] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [metrics, setMetrics] = useState({});
  const [trends, setTrends] = useState([]);
  const [distribution, setDistribution] = useState({});
  
  // UI State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [rcaModalVisible, setRcaModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  
  // Form state
  const [recordTitle, setRecordTitle] = useState('');
  const [recordDescription, setRecordDescription] = useState('');
  const [recordSeverity, setRecordSeverity] = useState('minor');
  const [recordDepartment, setRecordDepartment] = useState('');
  const [recordAssignedTo, setRecordAssignedTo] = useState('');
  const [recordDueDate, setRecordDueDate] = useState(null);
  const [recordSource, setRecordSource] = useState('');
  const [recordAttachments, setRecordAttachments] = useState([]);
  
  // RCA state
  const [rcaMethod, setRcaMethod] = useState('five_whys');
  const [rcaData, setRcaData] = useState({});
  
  // Forms
  const [form] = Form.useForm();
  const [rcaForm] = Form.useForm();
  const [actionForm] = Form.useForm();
  const [verifyForm] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        recordsData,
        dashboardData,
        metricsData,
        trendsData,
        distributionData
      ] = await Promise.all([
        documentService.getQualityRecords({ 
          company_id: companyId,
          type: recordType === 'all' ? null : recordType
        }),
        documentService.getQualityDashboard({ company_id: companyId }),
        documentService.getQualityMetrics({ company_id: companyId }),
        documentService.getQualityTrends({ company_id: companyId, months: 12 }),
        documentService.getQualityDistribution({ company_id: companyId })
      ]);
      
      setRecords(recordsData.records || []);
      setDashboard(dashboardData);
      setMetrics(metricsData.metrics || {});
      setTrends(trendsData.trends || []);
      setDistribution(distributionData.distributions || {});
      
    } catch (error) {
      console.error('Failed to load QMS data:', error);
      message.error('Failed to load quality data');
    } finally {
      setLoading(false);
    }
  }, [companyId, recordType]);

  const loadRecordDetail = useCallback(async (recordId) => {
    try {
      const data = await documentService.getQualityRecord(recordId);
      setSelectedRecord(data);
    } catch (error) {
      console.error('Failed to load record:', error);
      message.error('Failed to load record details');
    }
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleCreateRecord = async (values) => {
    if (!values.title?.trim()) {
      message.error('Title is required');
      return;
    }
    
    setSaving(true);
    try {
      const recordData = {
        type: values.type,
        title: values.title.trim(),
        description: values.description,
        severity: values.severity,
        department: values.department,
        assigned_to: values.assigned_to,
        due_date: values.due_date,
        source: values.source,
        attachments: values.attachments || [],
        company_id: companyId,
        status: 'draft'
      };
      
      const result = await documentService.createQualityRecord(recordData);
      
      // Auto-generate record number
      const prefix = RECORD_TYPES[values.type]?.prefix || 'QMS';
      const recordNumber = `${prefix}-${new Date().getFullYear()}-${String(result.id).padStart(4, '0')}`;
      
      await documentService.updateQualityRecord(result.id, { 
        record_number: recordNumber 
      });
      
      message.success(`${RECORD_TYPES[values.type].label} ${recordNumber} created`);
      setCreateModalVisible(false);
      form.resetFields();
      resetForm();
      loadData();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to create record:', error);
      message.error(error.message || 'Failed to create record');
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdateStatus = async (recordId, newStatus, comment = '') => {
    try {
      await documentService.updateQualityRecordStatus(recordId, {
        status: newStatus,
        comment
      });
      
      message.success(`Status updated to ${STATUS_FLOW[newStatus]?.label}`);
      loadData();
      if (selectedRecord?.id === recordId) {
        loadRecordDetail(recordId);
      }
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to update status:', error);
      message.error(error.message || 'Failed to update status');
    }
  };
  
  const handleSaveRCA = async (values) => {
    setSaving(true);
    try {
      const rcaPayload = {
        method: rcaMethod,
        data: values,
        analyzed_by: user?.id,
        analyzed_at: new Date().toISOString()
      };
      
      await documentService.saveRCA(selectedRecord.id, rcaPayload);
      
      message.success('Root cause analysis saved');
      setRcaModalVisible(false);
      rcaForm.resetFields();
      loadRecordDetail(selectedRecord.id);
      
    } catch (error) {
      console.error('Failed to save RCA:', error);
      message.error('Failed to save RCA');
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddAction = async (values) => {
    setSaving(true);
    try {
      await documentService.addQualityAction(selectedRecord.id, {
        action_type: values.action_type,
        description: values.description,
        assigned_to: values.assigned_to,
        due_date: values.due_date,
        priority: values.priority
      });
      
      message.success('Action added');
      setActionModalVisible(false);
      actionForm.resetFields();
      loadRecordDetail(selectedRecord.id);
      
    } catch (error) {
      console.error('Failed to add action:', error);
      message.error('Failed to add action');
    } finally {
      setSaving(false);
    }
  };
  
  const handleVerify = async (values) => {
    setSaving(true);
    try {
      await documentService.verifyQualityAction(selectedRecord.id, {
        verified: values.verified,
        effectiveness: values.effectiveness,
        notes: values.notes
      });
      
      message.success('Verification recorded');
      setVerifyModalVisible(false);
      verifyForm.resetFields();
      loadRecordDetail(selectedRecord.id);
      loadData();
      
    } catch (error) {
      console.error('Failed to verify:', error);
      message.error('Failed to record verification');
    } finally {
      setSaving(false);
    }
  };
  
  const handleBulkAction = async (action) => {
    if (selectedRows.length === 0) return;
    
    try {
      await documentService.bulkQualityAction(selectedRows, action);
      message.success(`${selectedRows.length} records updated`);
      setSelectedRows([]);
      loadData();
    } catch (error) {
      message.error('Bulk action failed');
    }
  };
  
  const resetForm = () => {
    setRecordTitle('');
    setRecordDescription('');
    setRecordSeverity('minor');
    setRecordDepartment('');
    setRecordAssignedTo('');
    setRecordDueDate(null);
    setRecordSource('');
    setRecordAttachments([]);
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getTypeConfig = (type) => RECORD_TYPES[type] || {
    label: type,
    icon: <FileProtectOutlined />,
    color: '#8c8c8c'
  };
  
  const getStatusConfig = (status) => STATUS_FLOW[status] || STATUS_FLOW.draft;
  
  const getSeverityConfig = (severity) => SEVERITY_LEVELS[severity] || SEVERITY_LEVELS.minor;
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid';
    }
  };
  
  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderDashboardStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="qms-stat-card open">
          <AntStat
            title="Open Records"
            value={dashboard.open_count || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="qms-stat-card overdue">
          <AntStat
            title="Overdue"
            value={dashboard.overdue_count || 0}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="qms-stat-card critical">
          <AntStat
            title="Critical Items"
            value={dashboard.critical_count || 0}
            prefix={<AlertFilled />}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="qms-stat-card closed">
          <AntStat
            title="Closed This Month"
            value={dashboard.closed_this_month || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderMetrics = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <AntStat
            title="Avg Resolution Time"
            value={metrics.avg_resolution_days || 0}
            suffix="days"
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <AntStat
            title="Closure Rate"
            value={Math.round((metrics.closure_rate || 0) * 100)}
            suffix="%"
            prefix={<TrophyOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <AntStat
            title="On-Time Completion"
            value={Math.round((metrics.on_time_rate || 0) * 100)}
            suffix="%"
            prefix={<AimOutlined />}
            valueStyle={{ 
              color: (metrics.on_time_rate || 0) >= 0.8 ? '#52c41a' : '#faad14'
            }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <AntStat
            title="Recurrence Rate"
            value={Math.round((metrics.recurrence_rate || 0) * 100)}
            suffix="%"
            prefix={<ReloadOutlined />}
            valueStyle={{ 
              color: (metrics.recurrence_rate || 0) < 0.1 ? '#52c41a' : '#f5222d'
            }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderDashboardTab = () => (
    <div>
      {renderDashboardStats()}
      {renderMetrics()}
      
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Quality Trends" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <RTooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="opened" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="Opened"
                />
                <Line 
                  type="monotone" 
                  dataKey="closed" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  name="Closed"
                />
                <Line 
                  type="monotone" 
                  dataKey="overdue" 
                  stroke="#f5222d" 
                  strokeWidth={2}
                  name="Overdue"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="By Type" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(distribution.by_type || {}).map(([name, value]) => ({
                    name: RECORD_TYPES[name]?.label || name,
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {Object.entries(distribution.by_type || {}).map(([name], index) => (
                    <Cell 
                      key={index} 
                      fill={RECORD_TYPES[name]?.color || CHART_COLORS[index % CHART_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <RTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="By Severity" size="small">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={
                Object.entries(distribution.by_severity || {}).map(([key, value]) => ({
                  name: SEVERITY_LEVELS[key]?.label || key,
                  value,
                  color: SEVERITY_LEVELS[key]?.color
                }))
              }>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <RTooltip />
                <Bar dataKey="value">
                  {Object.entries(distribution.by_severity || {}).map(([key], index) => (
                    <Cell key={index} fill={SEVERITY_LEVELS[key]?.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Aging Analysis" size="small">
            <List
              dataSource={[
                { label: '0-7 days', value: dashboard.aging_0_7 || 0, color: '#52c41a' },
                { label: '8-30 days', value: dashboard.aging_8_30 || 0, color: '#1890ff' },
                { label: '31-60 days', value: dashboard.aging_31_60 || 0, color: '#faad14' },
                { label: '61-90 days', value: dashboard.aging_61_90 || 0, color: '#fa541c' },
                { label: '90+ days', value: dashboard.aging_90_plus || 0, color: '#f5222d' }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text style={{ minWidth: 80, fontSize: 12 }}>{item.label}</Text>
                    <div style={{ flex: 1 }}>
                      <Progress 
                        percent={(item.value / Math.max(1, dashboard.total_open || 1)) * 100} 
                        strokeColor={item.color}
                        showInfo={false}
                        size="small"
                      />
                    </div>
                    <Text strong style={{ minWidth: 40, textAlign: 'right' }}>
                      {item.value}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
  
  const renderRecordsTab = () => {
    const columns = [
      {
        title: 'Record #',
        dataIndex: 'record_number',
        key: 'record_number',
        width: 140,
        render: (num, record) => (
          <Space>
            <Avatar 
              icon={getTypeConfig(record.type).icon}
              size="small"
              style={{ backgroundColor: getTypeConfig(record.type).color }}
            />
            <div>
              <div style={{ fontWeight: 500 }}>{num || 'Pending'}</div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                {getTypeConfig(record.type).label}
              </div>
            </div>
          </Space>
        )
      },
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (title, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              {record.department}
            </div>
          </div>
        )
      },
      {
        title: 'Severity',
        dataIndex: 'severity',
        key: 'severity',
        width: 110,
        render: (severity) => {
          const config = getSeverityConfig(severity);
          return <Tag color={config.color}>{config.label}</Tag>;
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 150,
        render: (status) => {
          const config = getStatusConfig(status);
          return (
            <Tag color={config.color} icon={config.icon}>
              {config.label}
            </Tag>
          );
        }
      },
      {
        title: 'Assigned To',
        dataIndex: 'assigned_to_name',
        key: 'assigned_to_name',
        width: 130,
        render: (name) => name ? (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <span style={{ fontSize: 12 }}>{name}</span>
          </Space>
        ) : <Text type="secondary">Unassigned</Text>
      },
      {
        title: 'Due Date',
        dataIndex: 'due_date',
        key: 'due_date',
        width: 120,
        render: (date, record) => {
          const overdue = getDaysOverdue(date);
          return (
            <div>
              <div>{formatDate(date)}</div>
              {overdue > 0 && (
                <Tag color="red" style={{ fontSize: 10 }}>
                  {overdue}d overdue
                </Tag>
              )}
            </div>
          );
        }
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 150,
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedRecord(record);
                  loadRecordDetail(record.id);
                  setDetailDrawerVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
              />
            </Tooltip>
            <Popconfirm
              title="Delete this record?"
              onConfirm={async () => {
                await documentService.deleteQualityRecord(record.id);
                message.success('Record deleted');
                loadData();
              }}
            >
              <Tooltip title="Delete">
                <Button type="text" size="small" icon={<DeleteOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          </Space>
        )
      }
    ];
    
    return (
      <Card
        title={
          <Space>
            <FileProtectOutlined />
            <span>Quality Records</span>
            <Badge count={records.length} style={{ backgroundColor: '#1890ff' }} />
          </Space>
        }
        size="small"
        extra={
          <Space>
            <Input
              placeholder="Search records..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="small"
              style={{ width: 200 }}
              allowClear
            />
            <Select
              value={recordType}
              onChange={setRecordType}
              size="small"
              style={{ width: 130 }}
            >
              <Option value="all">All Types</Option>
              {Object.entries(RECORD_TYPES).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
            
            {selectedRows.length > 0 && (
              <>
                <Button 
                  size="small"
                  onClick={() => handleBulkAction('close')}
                >
                  Close ({selectedRows.length})
                </Button>
                <Button 
                  size="small"
                  danger
                  onClick={() => handleBulkAction('cancel')}
                >
                  Cancel
                </Button>
              </>
            )}
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              size="small"
            >
              New Record
            </Button>
            
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              loading={loading}
              size="small"
            />
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={records.filter(r => 
            !searchText || 
            r.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            r.record_number?.toLowerCase().includes(searchText.toLowerCase())
          )}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`
          }}
          rowSelection={{
            selectedRowKeys: selectedRows,
            onChange: setSelectedRows
          }}
          scroll={{ x: 1100 }}
          rowClassName={(record) => {
            const overdue = getDaysOverdue(record.due_date);
            return overdue > 0 ? 'overdue-row' : '';
          }}
        />
      </Card>
    );
  };
  
  const renderMetricsTab = () => (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Quality Trends" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <RTooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="opened" 
                  stackId="1"
                  stroke="#1890ff" 
                  fill="#1890ff"
                  fillOpacity={0.6}
                  name="Opened"
                />
                <Area 
                  type="monotone" 
                  dataKey="closed" 
                  stackId="2"
                  stroke="#52c41a" 
                  fill="#52c41a"
                  fillOpacity={0.6}
                  name="Closed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="By Department" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={Object.entries(distribution.by_department || {}).map(([name, value]) => ({
                  name,
                  value
                }))}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={11} />
                <YAxis dataKey="name" type="category" fontSize={11} width={90} />
                <RTooltip />
                <Bar dataKey="value" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
      <Card title="Key Performance Indicators" size="small">
        <Row gutter={[16, 16]}>
          {[
            { label: 'CAPA Effectiveness', value: metrics.capa_effectiveness, target: 0.9 },
            { label: 'First-Time-Right', value: metrics.first_time_right, target: 0.95 },
            { label: 'Response Time SLA', value: metrics.response_sla, target: 0.9 },
            { label: 'Documentation Accuracy', value: metrics.doc_accuracy, target: 0.98 }
          ].map((kpi) => (
            <Col xs={24} sm={12} md={6} key={kpi.label}>
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="dashboard"
                  percent={Math.round((kpi.value || 0) * 100)}
                  strokeColor={
                    (kpi.value || 0) >= kpi.target ? '#52c41a' :
                    (kpi.value || 0) >= kpi.target * 0.8 ? '#faad14' : '#f5222d'
                  }
                  format={(p) => (
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>{p}%</div>
                      <div style={{ fontSize: 10, color: '#8c8c8c' }}>
                        Target: {Math.round(kpi.target * 100)}%
                      </div>
                    </div>
                  )}
                />
                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 500 }}>
                  {kpi.label}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderCreateModal = () => (
    <Modal
      title="Create Quality Record"
      open={createModalVisible}
      onCancel={() => {
        setCreateModalVisible(false);
        form.resetFields();
        resetForm();
      }}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateRecord}
        initialValues={{
          type: 'capa',
          severity: 'minor'
        }}
      >
        <Form.Item
          name="type"
          label="Record Type"
          rules={[{ required: true }]}
        >
          <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
            <Row gutter={[8, 8]}>
              {Object.entries(RECORD_TYPES).map(([key, value]) => (
                <Col xs={12} sm={8} key={key}>
                  <Radio.Button 
                    value={key} 
                    style={{ width: '100%', textAlign: 'center', height: 'auto', padding: '8px' }}
                  >
                    <Space>
                      {value.icon}
                      <span style={{ fontSize: 12 }}>{value.label}</span>
                    </Space>
                  </Radio.Button>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: 'Title is required' },
            { min: 5, message: 'Title must be at least 5 characters' },
            { max: 200, message: 'Title cannot exceed 200 characters' }
          ]}
        >
          <Input placeholder="Brief summary of the issue" maxLength={200} showCount />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Description is required' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="Detailed description of the issue, including context and impact"
            maxLength={2000}
            showCount
          />
        </Form.Item>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="severity"
              label="Severity"
              rules={[{ required: true }]}
            >
              <Select>
                {Object.entries(SEVERITY_LEVELS).map(([key, value]) => (
                  <Option key={key} value={key}>
                    <Space>
                      <Tag color={value.color}>{value.label}</Tag>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        (Respond within {value.responseDays}d)
                      </Text>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="department"
              label="Department"
            >
              <Select placeholder="Select department">
                <Option value="operations">Operations</Option>
                <Option value="hse">HSE</Option>
                <Option value="quality">Quality</Option>
                <Option value="engineering">Engineering</Option>
                <Option value="maintenance">Maintenance</Option>
                <Option value="admin">Administration</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="assigned_to"
              label="Assign To"
            >
              <Select 
                placeholder="Select assignee"
                showSearch
              >
                <Option value="user_1">John Smith</Option>
                <Option value="user_2">Jane Doe</Option>
                <Option value="user_3">Bob Johnson</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="due_date"
              label="Due Date"
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={(current) => current && current < new Date()}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="source"
          label="Source"
        >
          <Input placeholder="e.g., Internal Audit, Customer Complaint" />
        </Form.Item>
        
        <Form.Item label="Attachments">
          <Dragger
            beforeUpload={() => false}
            multiple
            maxCount={5}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag files to attach</p>
            <p className="ant-upload-hint">
              Max 5 files, up to 10MB each
            </p>
          </Dragger>
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setCreateModalVisible(false);
              form.resetFields();
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saving}
              icon={<PlusOutlined />}
            >
              Create Record
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderDetailDrawer = () => (
    <Drawer
      title={
        <Space>
          {selectedRecord && getTypeConfig(selectedRecord.type).icon}
          <span>{selectedRecord?.record_number || 'Record'}</span>
          {selectedRecord && (
            <Tag color={getStatusConfig(selectedRecord.status).color}>
              {getStatusConfig(selectedRecord.status).label}
            </Tag>
          )}
        </Space>
      }
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={900}
      extra={
        <Space>
          <Button 
            icon={<EditOutlined />}
            onClick={() => message.info('Edit coming soon')}
          >
            Edit
          </Button>
          <Button 
            type="primary"
            icon={<SendOutlined />}
            onClick={() => {
              const nextStatus = selectedRecord.status === 'draft' ? 'submitted' :
                                selectedRecord.status === 'submitted' ? 'under_review' :
                                selectedRecord.status === 'under_review' ? 'approved' : 'in_progress';
              handleUpdateStatus(selectedRecord.id, nextStatus);
            }}
          >
            Advance Status
          </Button>
        </Space>
      }
    >
      {selectedRecord && (
        <Tabs
          defaultActiveKey="details"
          items={[
            {
              key: 'details',
              label: 'Details',
              children: (
                <div>
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Title" span={2}>
                      <Text strong>{selectedRecord.title}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Type">
                      <Tag color={getTypeConfig(selectedRecord.type).color}>
                        {getTypeConfig(selectedRecord.type).label}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Severity">
                      <Tag color={getSeverityConfig(selectedRecord.severity).color}>
                        {getSeverityConfig(selectedRecord.severity).label}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={getStatusConfig(selectedRecord.status).color}>
                        {getStatusConfig(selectedRecord.status).label}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Department">
                      {selectedRecord.department || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Assigned To">
                      {selectedRecord.assigned_to_name || 'Unassigned'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Due Date">
                      {formatDate(selectedRecord.due_date)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created">
                      {formatDate(selectedRecord.created_at)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created By">
                      {selectedRecord.created_by_name || 'System'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Description" span={2}>
                      {selectedRecord.description}
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <Divider>Workflow Progress</Divider>
                  
                  <Steps
                    size="small"
                    current={getStatusConfig(selectedRecord.status).step}
                    items={[
                      { title: 'Draft', icon: <EditOutlined /> },
                      { title: 'Submitted', icon: <SendOutlined /> },
                      { title: 'Review', icon: <EyeOutlined /> },
                      { title: 'Approved', icon: <CheckCircleOutlined /> },
                      { title: 'In Progress', icon: <ClockCircleOutlined /> },
                      { title: 'Verification', icon: <FileSearchOutlined /> },
                      { title: 'Closed', icon: <TrophyOutlined /> }
                    ]}
                  />
                </div>
              )
            },
            {
              key: 'rca',
              label: (
                <Space>
                  <NodeIndexOutlined />
                  Root Cause Analysis
                </Space>
              ),
              children: (
                <div>
                  {selectedRecord.rca ? (
                    <div>
                      <Alert
                        message={`Method: ${RCA_METHODS[selectedRecord.rca.method]?.label || selectedRecord.rca.method}`}
                        description={`Analyzed on ${formatDate(selectedRecord.rca.analyzed_at)}`}
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                      
                      <Descriptions bordered column={1} size="small">
                        {Object.entries(selectedRecord.rca.data || {}).map(([key, value]) => (
                          <Descriptions.Item key={key} label={key.replace(/_/g, ' ')}>
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </Descriptions.Item>
                        ))}
                      </Descriptions>
                      
                      <Button 
                        style={{ marginTop: 16 }}
                        icon={<EditOutlined />}
                        onClick={() => {
                          setRcaMethod(selectedRecord.rca.method);
                          rcaForm.setFieldsValue(selectedRecord.rca.data);
                          setRcaModalVisible(true);
                        }}
                      >
                        Update RCA
                      </Button>
                    </div>
                  ) : (
                    <Empty
                      description="No root cause analysis performed"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button 
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setRcaModalVisible(true)}
                      >
                        Perform RCA
                      </Button>
                    </Empty>
                  )}
                </div>
              )
            },
            {
              key: 'actions',
              label: (
                <Space>
                  <DeploymentUnitOutlined />
                  Actions
                  <Badge 
                    count={selectedRecord.actions?.length || 0} 
                    style={{ backgroundColor: '#1890ff' }} 
                  />
                </Space>
              ),
              children: (
                <div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setActionModalVisible(true)}
                    style={{ marginBottom: 16 }}
                  >
                    Add Action
                  </Button>
                  
                  {selectedRecord.actions?.length > 0 ? (
                    <List
                      dataSource={selectedRecord.actions}
                      renderItem={(action) => (
                        <List.Item
                          actions={[
                            action.status === 'completed' && (
                              <Button
                                key="verify"
                                type="link"
                                size="small"
                                onClick={() => {
                                  setVerifyModalVisible(true);
                                }}
                              >
                                Verify
                              </Button>
                            )
                          ].filter(Boolean)}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                icon={
                                  action.status === 'completed' ? <CheckCircleOutlined /> :
                                  action.status === 'overdue' ? <WarningOutlined /> :
                                  <ClockCircleOutlined />
                                }
                                style={{
                                  backgroundColor: 
                                    action.status === 'completed' ? '#52c41a' :
                                    action.status === 'overdue' ? '#f5222d' : '#1890ff'
                                }}
                              />
                            }
                            title={
                              <Space>
                                <span>{action.description}</span>
                                <Tag color={
                                  action.priority === 'high' ? 'red' :
                                  action.priority === 'medium' ? 'orange' : 'blue'
                                }>
                                  {action.priority}
                                </Tag>
                              </Space>
                            }
                            description={
                              <div>
                                <div style={{ fontSize: 12 }}>
                                  Assigned: {action.assigned_to_name || 'Unassigned'}
                                </div>
                                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                                  Due: {formatDate(action.due_date)}
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="No actions defined" />
                  )}
                </div>
              )
            },
            {
              key: 'timeline',
              label: (
                <Space>
                  <HistoryOutlined />
                  Timeline
                </Space>
              ),
              children: (
                <Timeline
                  items={(selectedRecord.timeline || []).map((item) => ({
                    color: item.type === 'status_change' ? 'blue' :
                           item.type === 'comment' ? 'gray' :
                           item.type === 'action' ? 'green' : 'gray',
                    children: (
                      <div>
                        <Space>
                          <Text strong>{item.action}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {formatDate(item.created_at)}
                          </Text>
                        </Space>
                        <div style={{ fontSize: 12, color: '#595959' }}>
                          {item.description}
                        </div>
                        {item.user_name && (
                          <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                            by {item.user_name}
                          </div>
                        )}
                      </div>
                    )
                  }))}
                />
              )
            }
          ]}
        />
      )}
    </Drawer>
  );
  
  const renderRCAModal = () => (
    <Modal
      title="Root Cause Analysis"
      open={rcaModalVisible}
      onCancel={() => setRcaModalVisible(false)}
      footer={null}
      width={700}
    >
      <Form
        form={rcaForm}
        layout="vertical"
        onFinish={handleSaveRCA}
      >
        <Form.Item label="Analysis Method">
          <Select value={rcaMethod} onChange={setRcaMethod}>
            {Object.entries(RCA_METHODS).map(([key, value]) => (
              <Option key={key} value={key}>
                <div>
                  <div style={{ fontWeight: 500 }}>{value.label}</div>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                    {value.description}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        {rcaMethod === 'five_whys' && (
          <>
            {[1, 2, 3, 4, 5].map(num => (
              <Form.Item
                key={num}
                name={`why_${num}`}
                label={`Why ${num}`}
              >
                <Input placeholder={`Why did this happen? (Level ${num})`} />
              </Form.Item>
            ))}
            
            <Form.Item name="root_cause" label="Identified Root Cause">
              <TextArea rows={3} placeholder="Summarize the root cause" />
            </Form.Item>
          </>
        )}
        
        {rcaMethod === 'fishbone' && (
          <>
            {['Man', 'Machine', 'Material', 'Method', 'Measurement', 'Environment'].map(category => (
              <Form.Item
                key={category}
                name={`${category.toLowerCase()}_factors`}
                label={`${category} Factors`}
              >
                <Select mode="tags" placeholder={`Add ${category.toLowerCase()} related factors`} />
              </Form.Item>
            ))}
          </>
        )}
        
        <Form.Item name="corrective_action" label="Recommended Corrective Action">
          <TextArea rows={3} placeholder="What should be done to fix the root cause?" />
        </Form.Item>
        
        <Form.Item name="preventive_action" label="Preventive Action">
          <TextArea rows={3} placeholder="How can this be prevented in the future?" />
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setRcaModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Save RCA
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderActionModal = () => (
    <Modal
      title="Add Action Item"
      open={actionModalVisible}
      onCancel={() => setActionModalVisible(false)}
      footer={null}
    >
      <Form
        form={actionForm}
        layout="vertical"
        onFinish={handleAddAction}
        initialValues={{ priority: 'medium', action_type: 'corrective' }}
      >
        <Form.Item
          name="action_type"
          label="Action Type"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value="corrective">Corrective</Radio>
            <Radio value="preventive">Preventive</Radio>
            <Radio value="containment">Containment</Radio>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true }]}
        >
          <TextArea rows={3} placeholder="Describe the action to be taken" />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="assigned_to" label="Assign To">
              <Select placeholder="Select assignee">
                <Option value="user_1">John Smith</Option>
                <Option value="user_2">Jane Doe</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="due_date" label="Due Date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="priority" label="Priority">
          <Select>
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
          </Select>
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setActionModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Add Action
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderVerifyModal = () => (
    <Modal
      title="Verify Action Effectiveness"
      open={verifyModalVisible}
      onCancel={() => setVerifyModalVisible(false)}
      footer={null}
    >
      <Form
        form={verifyForm}
        layout="vertical"
        onFinish={handleVerify}
      >
        <Form.Item
          name="verified"
          label="Verification Result"
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value={true}>
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                Effective - Issue Resolved
              </Space>
            </Radio>
            <Radio value={false}>
              <Space>
                <CloseCircleOutlined style={{ color: '#f5222d' }} />
                Not Effective - Requires Follow-up
              </Space>
            </Radio>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item
          name="effectiveness"
          label="Effectiveness Rating"
        >
          <Slider
            min={1}
            max={5}
            marks={{ 1: 'Poor', 3: 'OK', 5: 'Excellent' }}
          />
        </Form.Item>
        
        <Form.Item name="notes" label="Verification Notes">
          <TextArea rows={3} placeholder="Add notes about verification" />
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setVerifyModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Submit Verification
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="quality-management" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="qms-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <SafetyCertificateOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Quality Management System</Title>
              <Badge status="processing" text="ISO 9001 Compliant" />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ExportOutlined />}
                onClick={() => message.info('Export coming soon')}
              >
                Export
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadData}
                loading={loading}
              >
                Refresh
              </Button>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                New Record
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'dashboard',
            label: (
              <Space>
                <FundOutlined />
                Dashboard
              </Space>
            ),
            children: renderDashboardTab()
          },
          {
            key: 'records',
            label: (
              <Space>
                <FileProtectOutlined />
                Records
                {dashboard.open_count > 0 && (
                  <Badge count={dashboard.open_count} style={{ backgroundColor: '#1890ff' }} />
                )}
              </Space>
            ),
            children: renderRecordsTab()
          },
          {
            key: 'metrics',
            label: (
              <Space>
                <LineChartOutlined />
                Metrics
              </Space>
            ),
            children: renderMetricsTab()
          }
        ]}
      />
      
      {/* Modals */}
      {renderCreateModal()}
      {renderDetailDrawer()}
      {renderRCAModal()}
      {renderActionModal()}
      {renderVerifyModal()}
    </div>
  );
};

export default QualityManagement;