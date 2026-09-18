// src/components/documents/RetentionPolicy.jsx
// Legal retention policies with automated lifecycle management,
// legal hold, disposition certificates, and regulatory compliance

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Descriptions,
  Tabs, Timeline, Avatar, List, Badge, Tooltip, Progress,
  Switch, Empty, Spin, Alert, Divider, Typography, Collapse,
  Checkbox, Radio, Slider, Transfer, Tree, DatePicker,
  InputNumber, Statistic, Result, Steps, Segmented, Calendar
} from 'antd';
import {
  ClockCircleOutlined, DeleteOutlined, FileProtectOutlined,
  SafetyCertificateOutlined, CalendarOutlined, HistoryOutlined,
  LockOutlined, UnlockOutlined, WarningOutlined, CheckCircleOutlined,
  CloseCircleOutlined, InfoCircleOutlined, PlusOutlined,
  SearchOutlined, ReloadOutlined, SettingOutlined, SaveOutlined,
  ExportOutlined, DownloadOutlined, EyeOutlined, EditOutlined,
  AuditOutlined, FileTextOutlined, FolderOutlined, StopOutlined,
  ExclamationCircleOutlined, GlobalOutlined, EnvironmentOutlined,
  MedicineBoxOutlined, BankOutlined, SafetyOutlined, FilePdfOutlined,
  FileExcelOutlined, FileWordOutlined, PlayCircleOutlined,
  PauseCircleOutlined, ThunderboltOutlined, DatabaseOutlined,
  CloudDownloadOutlined, CloudUploadOutlined, CopyOutlined,
  ScheduleOutlined, BellOutlined, SendOutlined, RollbackOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import './RetentionPolicy.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const RETENTION_SCHEDULES = {
  days_30: { label: '30 Days', days: 30, color: 'default' },
  days_90: { label: '90 Days', days: 90, color: 'blue' },
  months_6: { label: '6 Months', days: 180, color: 'cyan' },
  year_1: { label: '1 Year', days: 365, color: 'green' },
  years_3: { label: '3 Years', days: 1095, color: 'orange' },
  years_5: { label: '5 Years', days: 1825, color: 'gold' },
  years_7: { label: '7 Years', days: 2555, color: 'red' },
  years_10: { label: '10 Years', days: 3650, color: 'magenta' },
  years_25: { label: '25 Years', days: 9125, color: 'purple' },
  permanent: { label: 'Permanent', days: null, color: 'red' },
  custom: { label: 'Custom', days: null, color: 'default' }
};

const REGULATORY_FRAMEWORKS = {
  hipaa: { label: 'HIPAA', years: 6, color: '#f5222d', icon: <MedicineBoxOutlined /> },
  osha: { label: 'OSHA', years: 5, color: '#faad14', icon: <SafetyOutlined /> },
  gdpr: { label: 'GDPR', years: 0, color: '#722ed1', icon: <GlobalOutlined /> },
  sox: { label: 'SOX', years: 7, color: '#1890ff', icon: <BankOutlined /> },
  epa: { label: 'EPA', years: 3, color: '#52c41a', icon: <EnvironmentOutlined /> },
  iso_9001: { label: 'ISO 9001', years: 3, color: '#13c2c2', icon: <SafetyCertificateOutlined /> },
  iso_14001: { label: 'ISO 14001', years: 3, color: '#52c41a', icon: <EnvironmentOutlined /> },
  iso_45001: { label: 'ISO 45001', years: 3, color: '#faad14', icon: <SafetyOutlined /> },
  fda_21_cfr: { label: 'FDA 21 CFR Part 11', years: 5, color: '#f5222d', icon: <SafetyCertificateOutlined /> }
};

const LIFECYCLE_STAGES = {
  active: { label: 'Active', color: 'green', icon: <CheckCircleOutlined />, description: 'Document is in active use' },
  inactive: { label: 'Inactive', color: 'default', icon: <PauseCircleOutlined />, description: 'Document no longer actively used' },
  archived: { label: 'Archived', color: 'blue', icon: <FolderOutlined />, description: 'Document archived for retention' },
  pending_disposal: { label: 'Pending Disposal', color: 'orange', icon: <ClockCircleOutlined />, description: 'Awaiting disposal approval' },
  disposed: { label: 'Disposed', color: 'red', icon: <DeleteOutlined />, description: 'Document permanently disposed' },
  legal_hold: { label: 'Legal Hold', color: 'magenta', icon: <LockOutlined />, description: 'Frozen due to legal hold' }
};

const DISPOSAL_METHODS = {
  secure_delete: { label: 'Secure Delete', description: 'Cryptographically secure deletion' },
  shred: { label: 'Shred', description: 'Physical destruction (paper)' },
  anonymize: { label: 'Anonymize', description: 'Remove PII, keep data for analytics' },
  transfer: { label: 'Transfer', description: 'Transfer to external archive' }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const RetentionPolicy = ({
  documentId = null,
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
  const [document, setDocument] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [upcomingDisposals, setUpcomingDisposals] = useState([]);
  const [legalHolds, setLegalHolds] = useState([]);
  const [dispositionCertificates, setDispositionCertificates] = useState([]);
  const [activeTab, setActiveTab] = useState('policy');
  
  // UI State
  const [createPolicyModal, setCreatePolicyModal] = useState(false);
  const [legalHoldModal, setLegalHoldModal] = useState(false);
  const [disposeModal, setDisposeModal] = useState(false);
  const [certificateDrawer, setCertificateDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  // Policy form state
  const [retentionSchedule, setRetentionSchedule] = useState('years_7');
  const [customDays, setCustomDays] = useState(365);
  const [regulatoryFramework, setRegulatoryFramework] = useState(null);
  const [retentionStartEvent, setRetentionStartEvent] = useState('created_at');
  const [autoArchive, setAutoArchive] = useState(true);
  const [autoDispose, setAutoDispose] = useState(false);
  const [disposalMethod, setDisposalMethod] = useState('secure_delete');
  const [notifyBeforeDays, setNotifyBeforeDays] = useState(30);
  const [notificationEmails, setNotificationEmails] = useState([]);
  const [requireApprovalForDisposal, setRequireApprovalForDisposal] = useState(true);
  const [enableLegalHold, setEnableLegalHold] = useState(true);
  const [retentionNotes, setRetentionNotes] = useState('');
  
  // Forms
  const [policyForm] = Form.useForm();
  const [legalHoldForm] = Form.useForm();
  const [disposeForm] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadRetentionData = useCallback(async () => {
    setLoading(true);
    try {
      const promises = [
        documentService.getRetentionPolicies({ company_id: companyId })
      ];
      
      if (documentId) {
        promises.push(documentService.getDocument(documentId));
        promises.push(documentService.getDocumentRetention(documentId));
      }
      
      const results = await Promise.all(promises);
      
      setPolicies(results[0].policies || []);
      
      if (documentId && results[1]) {
        setDocument(results[1]);
        setPolicy(results[2]);
        
        if (results[2]) {
          setRetentionSchedule(results[2].schedule || 'years_7');
          setCustomDays(results[2].custom_days || 365);
          setRegulatoryFramework(results[2].regulatory_framework);
          setRetentionStartEvent(results[2].retention_start_event || 'created_at');
          setAutoArchive(results[2].auto_archive ?? true);
          setAutoDispose(results[2].auto_dispose ?? false);
          setDisposalMethod(results[2].disposal_method || 'secure_delete');
          setNotifyBeforeDays(results[2].notify_before_days || 30);
          setNotificationEmails(results[2].notification_emails || []);
          setRequireApprovalForDisposal(results[2].require_approval ?? true);
          setEnableLegalHold(results[2].enable_legal_hold ?? true);
          setRetentionNotes(results[2].notes || '');
        }
      }
      
      // Load related data
      try {
        const [disposals, holds, certs] = await Promise.all([
          documentService.getUpcomingDisposals({ company_id: companyId, days: 90 }),
          documentService.getLegalHolds({ company_id: companyId }),
          documentService.getDispositionCertificates({ company_id: companyId, limit: 20 })
        ]);
        
        setUpcomingDisposals(disposals.items || []);
        setLegalHolds(holds.holds || []);
        setDispositionCertificates(certs.certificates || []);
      } catch (e) {
        console.warn('Could not load secondary retention data:', e);
      }
      
    } catch (error) {
      console.error('Failed to load retention data:', error);
      message.error('Failed to load retention data');
    } finally {
      setLoading(false);
    }
  }, [documentId, companyId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleSavePolicy = async () => {
    if (!documentId) {
      message.warning('No document selected');
      return;
    }
    
    setSaving(true);
    try {
      const policyData = {
        document_id: documentId,
        schedule: retentionSchedule,
        custom_days: retentionSchedule === 'custom' ? customDays : null,
        regulatory_framework: regulatoryFramework,
        retention_start_event: retentionStartEvent,
        auto_archive: autoArchive,
        auto_dispose: autoDispose,
        disposal_method: disposalMethod,
        notify_before_days: notifyBeforeDays,
        notification_emails: notificationEmails,
        require_approval: requireApprovalForDisposal,
        enable_legal_hold: enableLegalHold,
        notes: retentionNotes,
        company_id: companyId
      };
      
      await documentService.setDocumentRetention(documentId, policyData);
      message.success('Retention policy saved successfully');
      loadRetentionData();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to save policy:', error);
      message.error(error.message || 'Failed to save retention policy');
    } finally {
      setSaving(false);
    }
  };
  
  const handleCreateLegalHold = async (values) => {
    setSaving(true);
    try {
      await documentService.createLegalHold({
        document_ids: values.document_ids,
        reason: values.reason,
        case_number: values.case_number,
        custodian: values.custodian,
        expected_duration: values.expected_duration,
        company_id: companyId
      });
      
      message.success('Legal hold applied successfully');
      setLegalHoldModal(false);
      legalHoldForm.resetFields();
      loadRetentionData();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to create legal hold:', error);
      message.error(error.message || 'Failed to apply legal hold');
    } finally {
      setSaving(false);
    }
  };
  
  const handleReleaseLegalHold = async (holdId) => {
    Modal.confirm({
      title: 'Release Legal Hold',
      content: 'This will allow the document to proceed with normal retention. Continue?',
      onOk: async () => {
        try {
          await documentService.releaseLegalHold(holdId);
          message.success('Legal hold released');
          loadRetentionData();
          if (onUpdate) onUpdate();
        } catch (error) {
          message.error('Failed to release legal hold');
        }
      }
    });
  };
  
  const handleDispose = async (values) => {
    setSaving(true);
    try {
      await documentService.disposeDocument(selectedItem.id, {
        method: values.disposal_method,
        reason: values.reason,
        approved_by: values.approved_by,
        witnessed_by: values.witnessed_by
      });
      
      message.success('Document disposed successfully');
      setDisposeModal(false);
      setSelectedItem(null);
      disposeForm.resetFields();
      loadRetentionData();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to dispose document:', error);
      message.error(error.message || 'Failed to dispose document');
    } finally {
      setSaving(false);
    }
  };
  
  const handleExtendRetention = async (documentId, additionalDays) => {
    try {
      await documentService.extendRetention(documentId, { additional_days: additionalDays });
      message.success(`Retention extended by ${additionalDays} days`);
      loadRetentionData();
      if (onUpdate) onUpdate();
    } catch (error) {
      message.error('Failed to extend retention');
    }
  };
  
  const handleDownloadCertificate = async (certificateId) => {
    try {
      const blob = await documentService.downloadDispositionCertificate(certificateId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `disposition-certificate-${certificateId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Certificate downloaded');
    } catch (error) {
      message.error('Failed to download certificate');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadRetentionData();
  }, [loadRetentionData]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getScheduleTag = (schedule) => {
    const config = RETENTION_SCHEDULES[schedule];
    if (!config) return <Tag>{schedule}</Tag>;
    return <Tag color={config.color}>{config.label}</Tag>;
  };
  
  const getFrameworkTag = (framework) => {
    const config = REGULATORY_FRAMEWORKS[framework];
    if (!config) return <Tag>{framework}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };
  
  const getStageTag = (stage) => {
    const config = LIFECYCLE_STAGES[stage];
    if (!config) return <Tag>{stage}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };
  
  const calculateDisposalDate = () => {
    if (!document) return null;
    
    const startDate = retentionStartEvent === 'created_at' 
      ? new Date(document.created_at)
      : retentionStartEvent === 'last_accessed'
        ? new Date(document.last_accessed_at || document.created_at)
        : retentionStartEvent === 'last_modified'
          ? new Date(document.updated_at)
          : new Date(document.created_at);
    
    let days;
    if (retentionSchedule === 'permanent') {
      return null; // Never disposed
    } else if (retentionSchedule === 'custom') {
      days = customDays;
    } else {
      days = RETENTION_SCHEDULES[retentionSchedule]?.days || 365;
    }
    
    const disposalDate = new Date(startDate);
    disposalDate.setDate(disposalDate.getDate() + days);
    return disposalDate;
  };
  
  const getDaysRemaining = () => {
    const disposalDate = calculateDisposalDate();
    if (!disposalDate) return null;
    
    const now = new Date();
    const diff = disposalDate - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderPolicyOverview = () => {
    const disposalDate = calculateDisposalDate();
    const daysRemaining = getDaysRemaining();
    
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="retention-stat-card">
            <Statistic
              title="Retention Period"
              value={RETENTION_SCHEDULES[retentionSchedule]?.label || 'Not Set'}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="retention-stat-card">
            <Statistic
              title="Disposal Date"
              value={disposalDate ? disposalDate.toLocaleDateString() : 'Never'}
              prefix={<CalendarOutlined />}
              valueStyle={{ 
                color: daysRemaining !== null && daysRemaining < 30 ? '#f5222d' : 
                       daysRemaining !== null && daysRemaining < 90 ? '#faad14' : '#52c41a',
                fontSize: 16
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="retention-stat-card">
            <Statistic
              title="Days Remaining"
              value={daysRemaining !== null ? daysRemaining : '∞'}
              prefix={<HistoryOutlined />}
              valueStyle={{ 
                color: daysRemaining !== null && daysRemaining < 30 ? '#f5222d' : '#52c41a',
                fontSize: 20
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="retention-stat-card">
            <Statistic
              title="Lifecycle Stage"
              value={LIFECYCLE_STAGES[policy?.lifecycle_stage || 'active']?.label || 'Active'}
              prefix={LIFECYCLE_STAGES[policy?.lifecycle_stage || 'active']?.icon}
              valueStyle={{ color: '#722ed1', fontSize: 16 }}
            />
          </Card>
        </Col>
      </Row>
    );
  };
  
  const renderPolicyTab = () => (
    <Card title="Retention Policy Configuration" size="small">
      <Form layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Retention Schedule" required>
              <Select 
                value={retentionSchedule} 
                onChange={setRetentionSchedule}
                style={{ width: '100%' }}
              >
                {Object.entries(RETENTION_SCHEDULES).map(([key, value]) => (
                  <Option key={key} value={key}>
                    <Tag color={value.color}>{value.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            {retentionSchedule === 'custom' && (
              <Form.Item label="Custom Days" required>
                <InputNumber
                  value={customDays}
                  onChange={setCustomDays}
                  min={1}
                  max={36500}
                  style={{ width: '100%' }}
                  addonAfter="days"
                />
              </Form.Item>
            )}
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Regulatory Framework">
              <Select 
                value={regulatoryFramework} 
                onChange={setRegulatoryFramework}
                style={{ width: '100%' }}
                allowClear
                placeholder="Select regulatory framework"
              >
                {Object.entries(REGULATORY_FRAMEWORKS).map(([key, value]) => (
                  <Option key={key} value={key}>
                    <Space>
                      {value.icon}
                      {value.label}
                      <Text type="secondary">({value.years} years)</Text>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Retention Start Event">
              <Select 
                value={retentionStartEvent} 
                onChange={setRetentionStartEvent}
                style={{ width: '100%' }}
              >
                <Option value="created_at">Document Creation</Option>
                <Option value="last_accessed">Last Access</Option>
                <Option value="last_modified">Last Modified</Option>
                <Option value="custom_date">Custom Date</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Divider>Lifecycle Automation</Divider>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Auto-Archive">
              <Switch
                checked={autoArchive}
                onChange={setAutoArchive}
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
              />
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                Automatically archive when inactive
              </div>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Auto-Dispose">
              <Switch
                checked={autoDispose}
                onChange={setAutoDispose}
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
              />
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                Automatically dispose when retention expires
              </div>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Disposal Method">
              <Select 
                value={disposalMethod} 
                onChange={setDisposalMethod}
                style={{ width: '100%' }}
              >
                {Object.entries(DISPOSAL_METHODS).map(([key, value]) => (
                  <Option key={key} value={key}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{value.label}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>{value.description}</div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Notify Before Disposal">
              <InputNumber
                value={notifyBeforeDays}
                onChange={setNotifyBeforeDays}
                min={1}
                max={365}
                style={{ width: '100%' }}
                addonAfter="days before"
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Require Approval for Disposal">
              <Switch
                checked={requireApprovalForDisposal}
                onChange={setRequireApprovalForDisposal}
                checkedChildren="Required"
                unCheckedChildren="Automatic"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Enable Legal Hold">
              <Switch
                checked={enableLegalHold}
                onChange={setEnableLegalHold}
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item label="Notification Recipients">
          <Select
            mode="tags"
            value={notificationEmails}
            onChange={setNotificationEmails}
            placeholder="Enter email addresses"
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <Form.Item label="Retention Notes">
          <TextArea
            value={retentionNotes}
            onChange={(e) => setRetentionNotes(e.target.value)}
            rows={3}
            placeholder="Document any special retention instructions..."
            maxLength={500}
            showCount
          />
        </Form.Item>
        
        <Divider />
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button icon={<ReloadOutlined />} onClick={loadRetentionData}>
              Reset
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSavePolicy}
              loading={saving}
            >
              Save Policy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
  
  const renderUpcomingDisposals = () => {
    const columns = [
      {
        title: 'Document',
        dataIndex: 'document_title',
        key: 'document_title',
        render: (title, record) => (
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <div>
              <div style={{ fontWeight: 500 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                {record.document_type || 'Document'}
              </div>
            </div>
          </Space>
        )
      },
      {
        title: 'Retention',
        dataIndex: 'retention_schedule',
        key: 'retention_schedule',
        render: (schedule) => getScheduleTag(schedule)
      },
      {
        title: 'Disposal Date',
        dataIndex: 'disposal_date',
        key: 'disposal_date',
        render: (date, record) => {
          const days = record.days_remaining || 0;
          return (
            <div>
              <div>{new Date(date).toLocaleDateString()}</div>
              <Tag color={days < 7 ? 'red' : days < 30 ? 'orange' : 'blue'}>
                {days} days
              </Tag>
            </div>
          );
        }
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Tooltip title="Extend Retention">
              <Button
                type="text"
                size="small"
                icon={<ClockCircleOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Extend Retention',
                    content: (
                      <div>
                        <p>Extend retention for "{record.document_title}"</p>
                        <InputNumber
                          id="extend-days"
                          placeholder="Additional days"
                          min={1}
                          max={3650}
                          defaultValue={365}
                          style={{ width: '100%' }}
                        />
                      </div>
                    ),
                    onOk: () => {
                      const days = parseInt(document.getElementById('extend-days')?.value || 365);
                      handleExtendRetention(record.document_id, days);
                    }
                  });
                }}
              />
            </Tooltip>
            <Tooltip title="Dispose Now">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  setSelectedItem(record);
                  setDisposeModal(true);
                }}
              />
            </Tooltip>
          </Space>
        )
      }
    ];
    
    return (
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Upcoming Disposals (Next 90 Days)</span>
            <Badge count={upcomingDisposals.length} style={{ backgroundColor: '#faad14' }} />
          </Space>
        }
        size="small"
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={upcomingDisposals}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="No upcoming disposals" /> }}
        />
      </Card>
    );
  };
  
  const renderLegalHolds = () => (
    <Card
      title={
        <Space>
          <LockOutlined />
          <span>Active Legal Holds</span>
          <Badge count={legalHolds.length} style={{ backgroundColor: '#722ed1' }} />
        </Space>
      }
      size="small"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setLegalHoldModal(true)}
          size="small"
        >
          Apply Legal Hold
        </Button>
      }
    >
      {legalHolds.length > 0 ? (
        <List
          dataSource={legalHolds}
          renderItem={(hold) => (
            <List.Item
              actions={[
                <Tooltip title="Release Hold">
                  <Popconfirm
                    title="Release this legal hold?"
                    onConfirm={() => handleReleaseLegalHold(hold.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" size="small" icon={<UnlockOutlined />} danger />
                  </Popconfirm>
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: '#722ed1' }}>
                    <LockOutlined />
                  </Avatar>
                }
                title={
                  <Space>
                    <span>{hold.case_number || 'Legal Hold'}</span>
                    <Tag color="magenta">Active</Tag>
                  </Space>
                }
                description={
                  <div>
                    <div>{hold.reason}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                      Custodian: {hold.custodian || 'N/A'} • 
                      Applied: {formatDate(hold.created_at)} • 
                      Documents: {hold.document_count || 1}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty 
          description="No active legal holds" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
  
  const renderDispositionCertificates = () => (
    <Card
      title={
        <Space>
          <FileProtectOutlined />
          <span>Disposition Certificates</span>
        </Space>
      }
      size="small"
    >
      {dispositionCertificates.length > 0 ? (
        <List
          dataSource={dispositionCertificates}
          renderItem={(cert) => (
            <List.Item
              actions={[
                <Tooltip title="Download">
                  <Button
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadCertificate(cert.id)}
                  />
                </Tooltip>,
                <Tooltip title="View Details">
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedItem(cert);
                      setCertificateDrawer(true);
                    }}
                  />
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: '#52c41a' }}>
                    <CheckCircleOutlined />
                  </Avatar>
                }
                title={
                  <Space>
                    <span>Certificate #{cert.certificate_number}</span>
                    <Tag color="green">Verified</Tag>
                  </Space>
                }
                description={
                  <div>
                    <div>{cert.document_title}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      Disposed: {formatDate(cert.disposed_at)} • 
                      Method: {DISPOSAL_METHODS[cert.disposal_method]?.label} • 
                      By: {cert.disposed_by_name}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No disposition certificates yet" />
      )}
    </Card>
  );
  
  const renderPolicyComparison = () => (
    <Card title="Active Retention Policies" size="small">
      <Table
        rowKey="id"
        dataSource={policies}
        pagination={{ pageSize: 10 }}
        columns={[
          {
            title: 'Policy Name',
            dataIndex: 'name',
            key: 'name'
          },
          {
            title: 'Schedule',
            dataIndex: 'schedule',
            key: 'schedule',
            render: (s) => getScheduleTag(s)
          },
          {
            title: 'Framework',
            dataIndex: 'regulatory_framework',
            key: 'regulatory_framework',
            render: (f) => f ? getFrameworkTag(f) : '-'
          },
          {
            title: 'Documents',
            dataIndex: 'document_count',
            key: 'document_count',
            render: (count) => <Badge count={count || 0} style={{ backgroundColor: '#1890ff' }} />
          },
          {
            title: 'Auto-Dispose',
            dataIndex: 'auto_dispose',
            key: 'auto_dispose',
            render: (v) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>
          }
        ]}
      />
    </Card>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderLegalHoldModal = () => (
    <Modal
      title={
        <Space>
          <LockOutlined style={{ color: '#722ed1' }} />
          <span>Apply Legal Hold</span>
        </Space>
      }
      open={legalHoldModal}
      onCancel={() => {
        setLegalHoldModal(false);
        legalHoldForm.resetFields();
      }}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Alert
        message="Legal Hold"
        description="Applying a legal hold will freeze the document and prevent any disposal or modification. Only authorized personnel can release a legal hold."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Form
        form={legalHoldForm}
        layout="vertical"
        onFinish={handleCreateLegalHold}
      >
        <Form.Item
          name="document_ids"
          label="Documents"
          rules={[{ required: true, message: 'Select documents to hold' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select documents"
            style={{ width: '100%' }}
            defaultValue={documentId ? [documentId] : []}
          >
            {document && (
              <Option value={document.id}>{document.title}</Option>
            )}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="case_number"
          label="Case Number / Matter ID"
          rules={[{ required: true, message: 'Case number is required' }]}
        >
          <Input placeholder="e.g., CASE-2024-001" />
        </Form.Item>
        
        <Form.Item
          name="reason"
          label="Reason for Hold"
          rules={[{ required: true, message: 'Please provide a reason' }]}
        >
          <TextArea
            rows={3}
            placeholder="Describe the legal matter requiring this hold..."
            maxLength={500}
            showCount
          />
        </Form.Item>
        
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="custodian"
              label="Custodian"
            >
              <Input placeholder="Person responsible" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expected_duration"
              label="Expected Duration"
            >
              <Select placeholder="How long?">
                <Option value="30_days">30 Days</Option>
                <Option value="90_days">90 Days</Option>
                <Option value="6_months">6 Months</Option>
                <Option value="1_year">1 Year</Option>
                <Option value="indefinite">Indefinite</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setLegalHoldModal(false);
              legalHoldForm.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={saving} danger>
              Apply Legal Hold
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderDisposeModal = () => (
    <Modal
      title={
        <Space>
          <DeleteOutlined style={{ color: '#f5222d' }} />
          <span>Dispose Document</span>
        </Space>
      }
      open={disposeModal}
      onCancel={() => {
        setDisposeModal(false);
        setSelectedItem(null);
        disposeForm.resetFields();
      }}
      footer={null}
      width={500}
      destroyOnClose
    >
      {selectedItem && (
        <>
          <Alert
            message="Permanent Disposal"
            description="This action cannot be undone. The document will be permanently disposed according to the selected method."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Document">
              {selectedItem.document_title}
            </Descriptions.Item>
            <Descriptions.Item label="Scheduled Disposal">
              {selectedItem.disposal_date ? new Date(selectedItem.disposal_date).toLocaleDateString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Retention">
              {getScheduleTag(selectedItem.retention_schedule)}
            </Descriptions.Item>
          </Descriptions>
          
          <Form
            form={disposeForm}
            layout="vertical"
            onFinish={handleDispose}
            initialValues={{ disposal_method: 'secure_delete' }}
          >
            <Form.Item
              name="disposal_method"
              label="Disposal Method"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                {Object.entries(DISPOSAL_METHODS).map(([key, value]) => (
                  <Radio key={key} value={key} style={{ display: 'block', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{value.label}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>{value.description}</div>
                    </div>
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              name="reason"
              label="Reason for Disposal"
              rules={[{ required: true, message: 'Please provide a reason' }]}
            >
              <TextArea rows={2} placeholder="Reason for disposal..." />
            </Form.Item>
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="approved_by"
                  label="Approved By"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Approver name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="witnessed_by"
                  label="Witnessed By"
                >
                  <Input placeholder="Witness name" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setDisposeModal(false);
                  setSelectedItem(null);
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={saving} danger>
                  Dispose Document
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  if (!documentId) {
    return (
      <div className="retention-policy" style={{ padding: embedded ? 0 : 24 }}>
        <Result
          icon={<ClockCircleOutlined style={{ color: '#8c8c8c' }} />}
          title="Select a Document"
          subTitle="Choose a document to manage its retention policy"
        />
      </div>
    );
  }

  return (
    <div className="retention-policy" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="retention-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ClockCircleOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Retention Policy</Title>
              {document && <Tag color="blue">{document.title}</Tag>}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadRetentionData}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Policy Overview */}
      {renderPolicyOverview()}
      
      {/* Legal Hold Warning */}
      {policy?.lifecycle_stage === 'legal_hold' && (
        <Alert
          message="Legal Hold Active"
          description="This document is under legal hold. Retention and disposal actions are suspended."
          type="warning"
          showIcon
          icon={<LockOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'policy',
            label: (
              <Space>
                <SettingOutlined />
                Policy Configuration
              </Space>
            ),
            children: renderPolicyTab()
          },
          {
            key: 'disposals',
            label: (
              <Space>
                <ClockCircleOutlined />
                Upcoming Disposals
                <Badge count={upcomingDisposals.length} style={{ backgroundColor: '#faad14' }} />
              </Space>
            ),
            children: renderUpcomingDisposals()
          },
          {
            key: 'holds',
            label: (
              <Space>
                <LockOutlined />
                Legal Holds
                <Badge count={legalHolds.length} style={{ backgroundColor: '#722ed1' }} />
              </Space>
            ),
            children: renderLegalHolds()
          },
          {
            key: 'certificates',
            label: (
              <Space>
                <FileProtectOutlined />
                Disposition Certificates
              </Space>
            ),
            children: renderDispositionCertificates()
          },
          {
            key: 'all_policies',
            label: (
              <Space>
                <FileTextOutlined />
                All Policies
              </Space>
            ),
            children: renderPolicyComparison()
          }
        ]}
      />
      
      {/* Modals */}
      {renderLegalHoldModal()}
      {renderDisposeModal()}
    </div>
  );
};

export default RetentionPolicy;