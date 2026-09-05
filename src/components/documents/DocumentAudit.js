// src/components/documents/DocumentAudit.jsx
// Audit Trail Component - Full activity logging, compliance tracking

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Button, Space, Input, Select,
  Table, Tag, Modal, Form, message, Popconfirm, DatePicker,
  Drawer, Descriptions, Tabs, Timeline, Avatar, List,
  Badge, Tooltip, Progress, Switch, Empty, Spin, Alert,
  Divider, Collapse, Typography, Calendar, Radio, Checkbox
} from 'antd';
import {
  AuditOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  ExportOutlined,
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  HistoryOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  MailOutlined,
  TeamOutlined,
  SettingOutlined,
  GlobalOutlined,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './DocumentAudit.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const AUDIT_ACTIONS = {
  view: { label: 'Viewed', color: 'blue', icon: <EyeOutlined /> },
  create: { label: 'Created', color: 'green', icon: <PlusOutlined /> },
  edit: { label: 'Edited', color: 'orange', icon: <EditOutlined /> },
  update: { label: 'Updated', color: 'orange', icon: <EditOutlined /> },
  delete: { label: 'Deleted', color: 'red', icon: <DeleteOutlined /> },
  restore: { label: 'Restored', color: 'green', icon: <PlusOutlined /> },
  submit: { label: 'Submitted', color: 'blue', icon: <CheckCircleOutlined /> },
  approve: { label: 'Approved', color: 'green', icon: <CheckCircleOutlined /> },
  reject: { label: 'Rejected', color: 'red', icon: <CloseCircleOutlined /> },
  publish: { label: 'Published', color: 'green', icon: <SafetyCertificateOutlined /> },
  archive: { label: 'Archived', color: 'warning', icon: <MinusOutlined /> },
  review: { label: 'Reviewed', color: 'processing', icon: <EyeOutlined /> },
  download: { label: 'Downloaded', color: 'blue', icon: <DownloadOutlined /> },
  share: { label: 'Shared', color: 'purple', icon: <TeamOutlined /> },
  comment: { label: 'Commented', color: 'cyan', icon: <MailOutlined /> }
};

const MODULES = ['HSE', 'Environmental', 'Hospital', 'Quality', 'Supply Chain', 'Training', 'General'];

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentAudit = ({ 
  documentId = null,
  companyId = null,
  onExport,
  embedded = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    views: 0,
    edits: 0,
    approvals: 0,
    downloads: 0,
    shares: 0
  });
  
  // UI State
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [complianceModalVisible, setComplianceModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    action: 'all',
    module: 'all',
    user: 'all',
    date_range: null,
    document_type: 'all'
  });
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [exportFormat, setExportFormat] = useState('csv');

  // ============================================================
  // VALIDATION FUNCTIONS
  // ============================================================
  
  const validateSearch = (value) => {
    if (!value) return true;
    if (value.length < 2) {
      message.warning('Please enter at least 2 characters to search');
      return false;
    }
    if (value.length > 100) {
      message.warning('Search text cannot exceed 100 characters');
      return false;
    }
    // Prevent SQL injection patterns
    const dangerousPatterns = /([';]+|--|\b(OR|AND)\b\s+\b\w+\b\s*=\s*\w+)/i;
    if (dangerousPatterns.test(value)) {
      message.error('Invalid search text detected');
      return false;
    }
    return true;
  };

  const sanitizeInput = (value) => {
    if (!value) return '';
    return value.trim().replace(/[<>]/g, '');
  };

  const validateDateRange = (dates) => {
    if (!dates || dates.length !== 2) return true;
    const [start, end] = dates;
    if (start && end && end < start) {
      message.error('End date cannot be before start date');
      return false;
    }
    return true;
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Sanitize search
      const sanitizedSearch = sanitizeInput(searchText);
      
      const params = {
        search: sanitizedSearch,
        ...filters,
        document_id: documentId,
        company_id: companyId
      };
      
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });
      
      // Handle date range
      if (filters.date_range && filters.date_range.length === 2) {
        if (validateDateRange(filters.date_range)) {
          params.date_from = filters.date_range[0].format('YYYY-MM-DD');
          params.date_to = filters.date_range[1].format('YYYY-MM-DD');
        }
      }
      
      const data = await documentService.getAuditLogs(params);
      
      const logs = data.logs || data.data || [];
      setAuditLogs(logs);
      
      // Update stats
      const statsData = data.stats || {};
      setStats({
        total: statsData.total || logs.length || 0,
        views: statsData.views || logs.filter(l => l.action === 'view').length,
        edits: statsData.edits || logs.filter(l => ['edit', 'update'].includes(l.action)).length,
        approvals: statsData.approvals || logs.filter(l => ['approve', 'publish'].includes(l.action)).length,
        downloads: statsData.downloads || logs.filter(l => l.action === 'download').length,
        shares: statsData.shares || logs.filter(l => l.action === 'share').length
      });
      
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      message.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [searchText, filters, documentId, companyId]);

  // ============================================================
  // SEARCH HANDLER
  // ============================================================
  
  const handleSearch = () => {
    if (!validateSearch(searchText)) {
      return;
    }
    loadAuditLogs();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value.length > 100) {
      message.warning('Search text cannot exceed 100 characters');
      return;
    }
    setSearchText(value);
  };

  // ============================================================
  // COMPLIANCE CHECK
  // ============================================================
  
  const checkCompliance = useCallback(async () => {
    if (!documentId) {
      message.warning('No document selected for compliance check');
      return;
    }
    try {
      const result = await documentService.checkDocumentCompliance(documentId);
      setSelectedLog(result);
      setComplianceModalVisible(true);
    } catch (error) {
      console.error('Compliance check failed:', error);
      message.error('Failed to check compliance');
    }
  }, [documentId]);

  // ============================================================
  // EXPORT WITH VALIDATION
  // ============================================================
  
  const handleExport = async () => {
    if (auditLogs.length === 0) {
      message.warning('No audit logs to export');
      return;
    }
    
    if (auditLogs.length > 10000) {
      message.warning('Too many logs to export. Please filter your results');
      return;
    }
    
    try {
      const params = {
        format: exportFormat,
        ...filters,
        document_id: documentId,
        company_id: companyId
      };
      
      await documentService.exportAuditLogs(params);
      message.success(`Audit logs exported as ${exportFormat.toUpperCase()}`);
      setExportModalVisible(false);
      
      if (onExport) onExport();
      
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export audit logs');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getActionTag = (action) => {
    const config = AUDIT_ACTIONS[action];
    if (!config) return <Tag>{action}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getActionColor = (action) => {
    const config = AUDIT_ACTIONS[action];
    return config?.color || 'default';
  };

  const getActionIcon = (action) => {
    const config = AUDIT_ACTIONS[action];
    return config?.icon || <InfoCircleOutlined />;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // Render Statistics
  const renderStats = () => (
    <Row gutter={[16, 16]} className="audit-stats">
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-total">
          <Statistic
            title="Total Activities"
            value={stats.total || 0}
            prefix={<HistoryOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-views">
          <Statistic
            title="Views"
            value={stats.views || 0}
            prefix={<EyeOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-edits">
          <Statistic
            title="Edits"
            value={stats.edits || 0}
            prefix={<EditOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-approvals">
          <Statistic
            title="Approvals"
            value={stats.approvals || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-downloads">
          <Statistic
            title="Downloads"
            value={stats.downloads || 0}
            prefix={<DownloadOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-shares">
          <Statistic
            title="Shares"
            value={stats.shares || 0}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#13c2c2' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Filters
  const renderFilters = () => (
    <div className="audit-filters">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={6}>
          <Input.Search
            placeholder="Search audit logs (min 2 characters)..."
            value={searchText}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            allowClear
            prefix={<SearchOutlined />}
            maxLength={100}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Select
            value={filters.action}
            onChange={(value) => setFilters({ ...filters, action: value })}
            style={{ width: '100%' }}
            allowClear
            placeholder="Action"
          >
            <Option value="all">All Actions</Option>
            {Object.entries(AUDIT_ACTIONS).map(([key, value]) => (
              <Option key={key} value={key}>
                {value.icon} {value.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Select
            value={filters.module}
            onChange={(value) => setFilters({ ...filters, module: value })}
            style={{ width: '100%' }}
            allowClear
            placeholder="Module"
          >
            <Option value="all">All Modules</Option>
            {MODULES.map(module => (
              <Option key={module} value={module}>{module}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={10}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button icon={<ReloadOutlined />} onClick={loadAuditLogs} loading={loading} size="small">
              Refresh
            </Button>
            <Button 
              icon={<ExportOutlined />} 
              onClick={() => setExportModalVisible(true)}
              size="small"
              disabled={auditLogs.length === 0}
            >
              Export
            </Button>
            {documentId && (
              <Button 
                icon={<SafetyCertificateOutlined />} 
                onClick={checkCompliance}
                size="small"
              >
                Check Compliance
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );

  // Render Audit Log Table
  const renderAuditTable = () => {
    const columns = [
      {
        title: 'Timestamp',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date) => formatDate(date)
      },
      {
        title: 'User',
        dataIndex: 'user',
        key: 'user',
        render: (user) => (
          <Space>
            <Avatar icon={<UserOutlined />} size="small" />
            <span>{user?.name || user || 'Unknown'}</span>
          </Space>
        )
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (action) => getActionTag(action)
      },
      {
        title: 'Document',
        dataIndex: 'document_title',
        key: 'document_title',
        render: (title, record) => (
          <div>
            <div>{title || record.document_title || 'N/A'}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.module || 'No module'}
            </div>
          </div>
        )
      },
      {
        title: 'IP Address',
        dataIndex: 'ip_address',
        key: 'ip_address',
        render: (ip) => ip || 'N/A'
      },
      {
        title: 'Details',
        dataIndex: 'details',
        key: 'details',
        render: (details) => (
          <Tooltip title={JSON.stringify(details, null, 2)}>
            <Button type="text" size="small" icon={<InfoCircleOutlined />}>
              View
            </Button>
          </Tooltip>
        )
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 100,
        render: (_, record) => (
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedLog(record);
              setDetailDrawerVisible(true);
            }}
          />
        )
      }
    ];

    return (
      <Table
        rowKey="id"
        columns={columns}
        dataSource={auditLogs}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} logs`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
        scroll={{ x: 1200 }}
      />
    );
  };

  // Render Detail Drawer
  const renderDetailDrawer = () => (
    <Drawer
      title={<Space><AuditOutlined /> Audit Log Details</Space>}
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={600}
    >
      {selectedLog && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Action">
              {getActionTag(selectedLog.action)}
            </Descriptions.Item>
            <Descriptions.Item label="User">
              {selectedLog.user?.name || selectedLog.user || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Document">
              {selectedLog.document_title || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Module">
              {selectedLog.module || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Timestamp">
              {formatDate(selectedLog.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="IP Address">
              {selectedLog.ip_address || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="User Agent">
              {selectedLog.user_agent || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Details">
              <pre style={{ 
                background: '#f5f5f5', 
                padding: 12, 
                borderRadius: 4,
                maxHeight: 300,
                overflow: 'auto'
              }}>
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
          
          <Divider />
          
          <Button 
            icon={<DownloadOutlined />} 
            block
            onClick={() => {
              const blob = new Blob([JSON.stringify(selectedLog, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `audit-log-${selectedLog.id}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export Log
          </Button>
        </div>
      )}
    </Drawer>
  );

  // Render Compliance Modal
  const renderComplianceModal = () => (
    <Modal
      title={<Space><SafetyCertificateOutlined /> Compliance Check</Space>}
      open={complianceModalVisible}
      onCancel={() => setComplianceModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setComplianceModalVisible(false)}>
          Close
        </Button>,
        <Button key="export" type="primary" icon={<DownloadOutlined />}>
          Export Report
        </Button>
      ]}
      width={700}
    >
      {selectedLog && (
        <div>
          <Alert
            message={selectedLog.compliant ? 'Document is Compliant' : 'Compliance Issues Found'}
            type={selectedLog.compliant ? 'success' : 'warning'}
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Document">
              {selectedLog.document_title}
            </Descriptions.Item>
            <Descriptions.Item label="Compliance Score">
              <Progress 
                percent={selectedLog.compliance_score || 0} 
                status={selectedLog.compliance_score >= 80 ? 'success' : 'exception'}
              />
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={5}>Compliance Issues</Title>
          {selectedLog.issues && selectedLog.issues.length > 0 ? (
            <List
              dataSource={selectedLog.issues}
              renderItem={(issue) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={issue.severity === 'critical' ? 
                      <Badge status="error" /> : 
                      issue.severity === 'high' ? 
                        <Badge status="warning" /> : 
                        <Badge status="default" />
                    }
                    title={issue.title}
                    description={issue.description}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No compliance issues found" />
          )}

          <Divider />

          <Title level={5}>Recommendations</Title>
          {selectedLog.recommendations && selectedLog.recommendations.length > 0 ? (
            <List
              dataSource={selectedLog.recommendations}
              renderItem={(rec) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    title={rec.title}
                    description={rec.description}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No recommendations needed" />
          )}
        </div>
      )}
    </Modal>
  );

  // Render Export Modal
  const renderExportModal = () => (
    <Modal
      title={<Space><ExportOutlined /> Export Audit Logs</Space>}
      open={exportModalVisible}
      onCancel={() => setExportModalVisible(false)}
      onOk={handleExport}
      okText="Export"
      width={500}
    >
      <Form layout="vertical">
        <Form.Item label="Format">
          <Radio.Group value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
            <Radio value="csv">
              <FileExcelOutlined /> CSV
            </Radio>
            <Radio value="pdf">
              <FilePdfOutlined /> PDF
            </Radio>
            <Radio value="json">
              <FileTextOutlined /> JSON
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Date Range">
          <RangePicker 
            style={{ width: '100%' }}
            disabledDate={(current) => current && current > new Date()}
          />
        </Form.Item>

        <Form.Item label="Include">
          <Checkbox.Group>
            <Checkbox value="details">Include Details</Checkbox>
            <Checkbox value="ip">Include IP Addresses</Checkbox>
            <Checkbox value="user_agent">Include User Agent</Checkbox>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="document-audit">
      {/* Header */}
      <div className="audit-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <AuditOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
            <Title level={4} style={{ margin: 0 }}>Document Audit Trail</Title>
            <Badge status="processing" text="Live" />
          </Space>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      {renderFilters()}

      {/* Table */}
      {renderAuditTable()}

      {/* Modals & Drawers */}
      {renderDetailDrawer()}
      {renderComplianceModal()}
      {renderExportModal()}
    </div>
  );
};

export default DocumentAudit;