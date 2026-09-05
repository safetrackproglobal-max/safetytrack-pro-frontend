// src/components/analytics/AnalyticsExport.js
import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Select, DatePicker, Form, Space, Table, 
  Tag, Progress, Modal, message, Alert, Input, Tooltip, 
  Typography, Dropdown, Switch, Badge, Popconfirm, Tabs, 
  Empty, Divider, Row, Col, Statistic 
} from 'antd';
import {
  DownloadOutlined, DeleteOutlined, FileExcelOutlined,
  FilePdfOutlined, FileTextOutlined, FileImageOutlined,
  ReloadOutlined, ExportOutlined, EyeOutlined,
  ShareAltOutlined, CopyOutlined, CalendarOutlined,
  CloudDownloadOutlined, ClockCircleOutlined,
  InfoCircleOutlined, WarningOutlined, FilterOutlined,
  ScheduleOutlined, SettingOutlined, MailOutlined,
  AppstoreOutlined, FileZipOutlined, DatabaseOutlined,
  CheckCircleOutlined, CloseCircleOutlined, SafetyOutlined,
  BarChartOutlined, PieChartOutlined, SaveOutlined,
  LineChartOutlined, EnvironmentOutlined, GlobalOutlined,
  AuditOutlined, PlusOutlined, EditOutlined
} from '@ant-design/icons';
import { analyticsService } from '../../services/analyticsService';
import moment from 'moment';
import './AnalyticsExport.css';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const AnalyticsExport = ({ widgets = [] }) => {
  const [form] = Form.useForm();
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [advancedModalVisible, setAdvancedModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('exports');
  const [quickExportLoading, setQuickExportLoading] = useState(false);
  const [scheduledExports, setScheduledExports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exports, setExports] = useState([]);
  const [exportProgress, setExportProgress] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);

  // ==================== LOAD DATA ====================
  const loadExportHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.export_type = typeFilter;
      if (searchText) params.search = searchText;

      const response = await analyticsService.getExportHistory(1, 50, params);
      
      // Handle different response formats
      let exportData = [];
      if (response && response.data) {
        exportData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        exportData = response;
      }
      
      setExports(exportData);
      
      // Cache the data
      analyticsService.cache.set('export_history', exportData);
    } catch (error) {
      console.error('Failed to load export history:', error);
      message.error('Failed to load exports');
      
      // Try to load from cache
      const cached = analyticsService.cache.get('export_history');
      if (cached) {
        setExports(cached);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadScheduledExports = async () => {
    try {
      // Filter scheduled exports from the list
      const scheduled = exports.filter(exp => exp.status === 'scheduled');
      setScheduledExports(scheduled);
    } catch (error) {
      console.error('Failed to load scheduled exports:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      // In a real implementation, this would fetch from backend
      // For now, use default templates
      const defaultTemplates = [
        { id: 'daily', name: 'Daily Summary', format: 'excel', schedule: 'daily' },
        { id: 'weekly', name: 'Weekly Report', format: 'excel', schedule: 'weekly' },
        { id: 'monthly', name: 'Monthly Analysis', format: 'pdf', schedule: 'monthly' },
      ];
      setTemplates(defaultTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    }
  };

  // ==================== EXPORT FUNCTIONS ====================
  
  const getDateRangeByTemplate = (template) => {
    const now = new Date();
    const start = new Date();
    
    switch (template) {
      case 'daily':
        start.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(now.getMonth() - 3);
        break;
      default:
        start.setDate(now.getDate() - 1);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  };

  const handleQuickExport = async (templateId) => {
    setQuickExportLoading(true);
    try {
      const dateRange = getDateRangeByTemplate(templateId);
      
      const exportConfig = {
        format: 'excel',
        module: 'dashboard',
        date_range: dateRange,
        widgets: widgets.filter(w => w.visible).map(w => w.id),
        include_charts: true,
        include_summary: true,
        filename: `${templateId}_report_${Date.now()}`
      };

      // Use the real export function
      const result = await analyticsService.exportPowerBI(exportConfig);
      
      if (result && result.success) {
        message.success(`${templateId.charAt(0).toUpperCase() + templateId.slice(1)} report exported successfully!`);
        await loadExportHistory();
      } else {
        throw new Error(result?.error || 'Export failed');
      }
    } catch (error) {
      console.error('Quick export failed:', error);
      message.error('Quick export failed: ' + (error.message || 'Unknown error'));
    } finally {
      setQuickExportLoading(false);
    }
  };

  const handleGenerateExport = async (values) => {
    setExporting(true);
    try {
      const exportConfig = {
        format: values.export_type,
        module: values.module,
        date_range: {
          start: values.date_range[0].format('YYYY-MM-DD'),
          end: values.date_range[1].format('YYYY-MM-DD')
        },
        widgets: values.widgets || widgets.filter(w => w.visible).map(w => w.id),
        include_charts: values.include_charts !== false,
        include_summary: values.include_summary !== false,
        filename: values.filename || `export_${Date.now()}`,
        password_protected: values.password_protected || false,
        compression: values.compression || 'none'
      };

      // Validate config
      const validation = analyticsService.validateExportConfig(exportConfig);
      if (!validation.isValid) {
        message.error(`Invalid export config: ${validation.errors.join(', ')}`);
        return;
      }

      // Use the real export function
      const result = await analyticsService.exportPowerBI(exportConfig);
      
      if (result && result.success) {
        setExportModalVisible(false);
        form.resetFields();
        message.success(`Export ready: ${result.filename} (${analyticsService.formatFileSize(result.size)})`);
        await loadExportHistory();
      } else {
        throw new Error(result?.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export generation failed:', error);
      message.error('Failed to generate export: ' + (error.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = async (exportRecord) => {
    try {
      const result = await analyticsService.downloadExport(
        exportRecord.id,
        exportRecord.filename || `export-${exportRecord.id}.${exportRecord.export_type || 'xlsx'}`
      );
      
      if (result && result.success) {
        message.success('Download started!');
        await loadExportHistory();
      }
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Download failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDelete = async (exportId) => {
    Modal.confirm({
      title: 'Delete Export',
      content: (
        <div>
          <Alert 
            message="This action cannot be undone" 
            type="warning" 
            showIcon 
            style={{ marginBottom: 16 }}
          />
          <Text>Deleted exports will be permanently removed.</Text>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      icon: <DeleteOutlined />,
      onOk: async () => {
        try {
          await analyticsService.deleteExport(exportId);
          message.success('Export deleted successfully');
          await loadExportHistory();
        } catch (error) {
          console.error('Failed to delete export:', error);
          message.error('Failed to delete export');
        }
      }
    });
  };

  const handleBulkDownload = async () => {
    if (selectedRows.length === 0) {
      message.warning('Please select exports to download');
      return;
    }

    if (selectedRows.length === 1) {
      const exportRecord = exports.find(exp => exp.id === selectedRows[0]);
      if (exportRecord) {
        await handleDownload(exportRecord);
      }
    } else {
      try {
        const result = await analyticsService.batchExport(selectedRows);
        if (result && result.success) {
          message.success(`Bulk download started for ${selectedRows.length} exports`);
          await loadExportHistory();
        }
      } catch (error) {
        console.error('Bulk download failed:', error);
        message.error('Bulk download failed');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      message.warning('Please select exports to delete');
      return;
    }

    Modal.confirm({
      title: `Delete ${selectedRows.length} Exports`,
      content: 'Are you sure you want to delete all selected exports?',
      okText: 'Delete All',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await analyticsService.batchDeleteExports(selectedRows);
          message.success(`${selectedRows.length} exports deleted successfully`);
          setSelectedRows([]);
          await loadExportHistory();
        } catch (error) {
          console.error('Failed to delete exports:', error);
          message.error('Failed to delete exports');
        }
      }
    });
  };

  // ==================== UI HELPERS ====================
  
  const exportTypes = [
    { value: 'excel', label: 'Excel (.xlsx)', icon: <FileExcelOutlined />, color: '#52c41a' },
    { value: 'pdf', label: 'PDF Report', icon: <FilePdfOutlined />, color: '#ff4d4f' },
    { value: 'csv', label: 'CSV Data', icon: <FileTextOutlined />, color: '#1890ff' },
    { value: 'json', label: 'JSON Data', icon: <DatabaseOutlined />, color: '#722ed1' },
    { value: 'zip', label: 'ZIP Archive', icon: <FileZipOutlined />, color: '#fa8c16' }
  ];

  const analyticsModules = [
    { 
      category: 'Safety & Compliance',
      modules: [
        { value: 'incidents', label: 'Incident Analytics', icon: <InfoCircleOutlined /> },
        { value: 'compliance', label: 'Compliance Metrics', icon: <SafetyOutlined /> },
        { value: 'risk', label: 'Risk Assessment', icon: <WarningOutlined /> }
      ]
    },
    { 
      category: 'Performance',
      modules: [
        { value: 'dashboard', label: 'Dashboard Overview', icon: <AppstoreOutlined /> },
        { value: 'performance', label: 'Performance Metrics', icon: <BarChartOutlined /> },
        { value: 'trends', label: 'Trend Analysis', icon: <LineChartOutlined /> }
      ]
    },
    { 
      category: 'Specialized',
      modules: [
        { value: 'environmental', label: 'Environmental Data', icon: <EnvironmentOutlined /> },
        { value: 'supplychain', label: 'Supply Chain', icon: <GlobalOutlined /> },
        { value: 'audit', label: 'Audit Trail', icon: <AuditOutlined /> }
      ]
    }
  ];

  const quickTemplates = [
    { id: 'daily', label: 'Daily Summary', icon: <CalendarOutlined />, color: '#1890ff' },
    { id: 'weekly', label: 'Weekly Report', icon: <ScheduleOutlined />, color: '#52c41a' },
    { id: 'monthly', label: 'Monthly Analysis', icon: <BarChartOutlined />, color: '#fa8c16' },
    { id: 'quarterly', label: 'Quarterly Review', icon: <PieChartOutlined />, color: '#722ed1' }
  ];

  const getStatusTag = (status, progress) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Pending', icon: <ClockCircleOutlined /> },
      processing: { color: 'blue', text: `Processing ${progress || 0}%`, icon: <ReloadOutlined spin /> },
      completed: { color: 'green', text: 'Ready', icon: <CheckCircleOutlined /> },
      failed: { color: 'red', text: 'Failed', icon: <CloseCircleOutlined /> },
      scheduled: { color: 'purple', text: 'Scheduled', icon: <ScheduleOutlined /> }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status, icon: null };
    
    return (
      <Badge 
        color={config.color} 
        text={
          <Space size={4}>
            {config.icon}
            <span>{config.text}</span>
          </Space>
        }
      />
    );
  };

  const getExportTypeIcon = (type, size = 'default') => {
    const icons = {
      excel: <FileExcelOutlined style={{ color: '#52c41a' }} />,
      pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
      csv: <FileTextOutlined style={{ color: '#1890ff' }} />,
      json: <DatabaseOutlined style={{ color: '#722ed1' }} />,
      zip: <FileZipOutlined style={{ color: '#fa8c16' }} />
    };
    
    const icon = icons[type] || <FileExcelOutlined />;
    
    return React.cloneElement(icon, { 
      style: { 
        ...icon.props.style, 
        fontSize: size === 'large' ? '24px' : '16px' 
      } 
    });
  };

  // ==================== TABLE COLUMNS ====================
  
  const columns = [
    {
      title: (
        <Space>
          <DatabaseOutlined />
          <span>Export File</span>
        </Space>
      ),
      dataIndex: 'filename',
      key: 'filename',
      render: (filename, record) => (
        <Space align="start">
          {getExportTypeIcon(record.export_type, 'large')}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              {filename || `export-${record.id}.${record.export_type || 'xlsx'}`}
            </div>
            <Space size={[16, 8]} wrap>
              <Tag size="small">{record.export_type?.toUpperCase() || 'EXCEL'}</Tag>
              <Tag size="small">{record.module || 'unknown'}</Tag>
              {record.password_protected && (
                <Tag size="small" color="blue" icon={<SafetyOutlined />}>
                  Protected
                </Tag>
              )}
              <Tag size="small" color={record.status === 'completed' ? 'green' : 'orange'}>
                {record.status || 'pending'}
              </Tag>
            </Space>
          </div>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div style={{ minWidth: 120 }}>
          {getStatusTag(status, record.progress)}
          {status === 'processing' && (
            <Progress 
              percent={record.progress || 0} 
              size="small" 
              style={{ marginTop: 8 }}
              showInfo={false}
            />
          )}
        </div>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <Tooltip title={date ? new Date(date).toLocaleString() : 'Unknown'}>
          <Space size={4}>
            <ClockCircleOutlined />
            <span>{date ? analyticsService.formatDate(date, 'short') : '-'}</span>
          </Space>
        </Tooltip>
      )
    },
    {
      title: 'Size',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (size) => (
        <Text type="secondary">
          {size ? analyticsService.formatFileSize(size) : '-'}
        </Text>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
              disabled={record.status !== 'completed'}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Preview">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setPreviewModalVisible(true)}
              disabled={record.status !== 'completed'}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Share">
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={() => setShareModalVisible(true)}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Copy Link">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                const link = `${window.location.origin}/exports/${record.id}`;
                navigator.clipboard.writeText(link);
                message.success('Link copied to clipboard');
              }}
              size="small"
            />
          </Tooltip>
          
          <Popconfirm
            title="Delete this export?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // ==================== FILTERED DATA ====================
  
  const filteredExports = exports.filter(exp => {
    const matchesSearch = searchText ? 
      (exp.filename && exp.filename.toLowerCase().includes(searchText.toLowerCase())) || 
      (exp.module && exp.module.toLowerCase().includes(searchText.toLowerCase())) : true;
    
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    const matchesType = typeFilter === 'all' || exp.export_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // ==================== EFFECTS ====================
  
  useEffect(() => {
    loadExportHistory();
    loadScheduledExports();
    loadTemplates();
  }, []);

  useEffect(() => {
    loadExportHistory();
  }, [statusFilter, typeFilter]);

  // ==================== QUICK EXPORT MENU ====================
  
  const quickExportMenu = (
    <Card size="small" style={{ width: 300 }}>
      <div style={{ padding: 8 }}>
        <Text strong style={{ display: 'block', marginBottom: 12 }}>Quick Export Templates</Text>
        <Space direction="vertical" style={{ width: '100%' }}>
          {quickTemplates.map(template => (
            <Button
              key={template.id}
              type="text"
              icon={template.icon}
              style={{ 
                width: '100%', 
                textAlign: 'left',
                color: template.color
              }}
              onClick={() => handleQuickExport(template.id)}
              loading={quickExportLoading}
            >
              {template.label}
            </Button>
          ))}
        </Space>
        <Divider style={{ margin: '12px 0' }} />
        <Button 
          type="link" 
          onClick={() => setAdvancedModalVisible(true)}
          style={{ width: '100%', textAlign: 'left' }}
        >
          <SettingOutlined /> Advanced Export Options
        </Button>
        <Button 
          type="link" 
          onClick={() => setExportModalVisible(true)}
          style={{ width: '100%', textAlign: 'left' }}
        >
          <PlusOutlined /> Create Custom Export
        </Button>
      </div>
    </Card>
  );

  // ==================== RENDER ====================
  
  return (
    <div className="analytics-export">
      <Card
        title={
          <Space>
            <ExportOutlined />
            <span>Data Exports</span>
            <Badge 
              count={exports.filter(e => e.status === 'processing' || e.status === 'pending').length} 
              style={{ backgroundColor: '#1890ff' }}
            />
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Refresh exports">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadExportHistory} 
                loading={loading}
                size="small"
              />
            </Tooltip>
            <Dropdown overlay={quickExportMenu} trigger={['click']}>
              <Button type="primary" icon={<ExportOutlined />} size="small">
                Quick Export
              </Button>
            </Dropdown>
          </Space>
        }
      >
        {/* Stats Overview */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="Total Exports"
                value={exports.length}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="Ready to Download"
                value={exports.filter(e => e.status === 'completed').length}
                prefix={<CloudDownloadOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="In Progress"
                value={exports.filter(e => e.status === 'processing' || e.status === 'pending').length}
                prefix={<ReloadOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small">
              <Statistic
                title="Storage Used"
                value={exports.reduce((sum, exp) => sum + (exp.file_size || 0), 0) / 1024 / 1024}
                precision={2}
                suffix="MB"
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <div className="export-filters" style={{ marginBottom: 24 }}>
          <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space wrap>
              <Search
                placeholder="Search exports..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onPressEnter={() => loadExportHistory()}
                style={{ width: 250 }}
                allowClear
              />
              
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
                placeholder="Status"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Status</Option>
                <Option value="completed">Ready</Option>
                <Option value="processing">Processing</Option>
                <Option value="pending">Pending</Option>
                <Option value="failed">Failed</Option>
                <Option value="scheduled">Scheduled</Option>
              </Select>
              
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: 150 }}
                placeholder="File Type"
              >
                <Option value="all">All Types</Option>
                {exportTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </Option>
                ))}
              </Select>
            </Space>
            
            {selectedRows.length > 0 && (
              <Space>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleBulkDownload}
                  disabled={selectedRows.some(id => {
                    const exp = exports.find(e => e.id === id);
                    return exp?.status !== 'completed';
                  })}
                >
                  Download ({selectedRows.length})
                </Button>
                <Popconfirm
                  title={`Delete ${selectedRows.length} selected exports?`}
                  onConfirm={handleBulkDelete}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete ({selectedRows.length})
                  </Button>
                </Popconfirm>
              </Space>
            )}
          </Space>
        </div>

        {/* Main Content Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`Export History (${filteredExports.length})`} key="exports">
            {filteredExports.length > 0 ? (
              <Table
                columns={columns}
                dataSource={filteredExports}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `Total ${total} exports`
                }}
                rowSelection={{
                  selectedRowKeys: selectedRows,
                  onChange: setSelectedRows,
                  getCheckboxProps: (record) => ({
                    disabled: record.status !== 'completed'
                  })
                }}
                expandable={{
                  expandedRowRender: (record) => (
                    <div style={{ margin: 0 }}>
                      <Text strong>Export Details:</Text>
                      <pre style={{ 
                        background: '#f6f6f6', 
                        padding: 12, 
                        borderRadius: 4,
                        marginTop: 8,
                        fontSize: 12 
                      }}>
                        {JSON.stringify({
                          id: record.id,
                          type: record.export_type,
                          module: record.module,
                          status: record.status,
                          created: record.created_at,
                          size: record.file_size ? analyticsService.formatFileSize(record.file_size) : 'N/A'
                        }, null, 2)}
                      </pre>
                    </div>
                  )
                }}
              />
            ) : (
              <Empty
                description={
                  <div>
                    <Text type="secondary">No exports found</Text>
                    <div style={{ marginTop: 8 }}>
                      <Button type="primary" onClick={() => setExportModalVisible(true)}>
                        Create Your First Export
                      </Button>
                    </div>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </TabPane>
          
          <TabPane tab={`Scheduled (${scheduledExports.length})`} key="scheduled">
            <Card>
              {scheduledExports.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={scheduledExports}
                  rowKey="id"
                  pagination={false}
                />
              ) : (
                <Empty
                  description="No scheduled exports configured"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </TabPane>
          
          <TabPane tab="Templates" key="templates">
            <Card>
              {templates.length > 0 ? (
                <Table
                  dataSource={templates}
                  rowKey="id"
                  columns={[
                    { title: 'Name', dataIndex: 'name', key: 'name' },
                    { title: 'Format', dataIndex: 'format', key: 'format', render: f => f?.toUpperCase() },
                    { title: 'Schedule', dataIndex: 'schedule', key: 'schedule', render: s => s?.toUpperCase() },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_, record) => (
                        <Space>
                          <Button 
                            type="link" 
                            icon={<ExportOutlined />}
                            onClick={() => handleQuickExport(record.id)}
                            loading={quickExportLoading}
                          >
                            Run
                          </Button>
                          <Button type="link" icon={<EditOutlined />}>Edit</Button>
                          <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
                        </Space>
                      )
                    }
                  ]}
                />
              ) : (
                <Empty
                  description="No export templates saved"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* ==================== MODALS ==================== */}

      {/* Export Generation Modal */}
      <Modal
        title="Create New Export"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
        width={700}
        className="export-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerateExport}
          initialValues={{
            export_type: 'excel',
            module: 'dashboard',
            include_charts: true,
            include_summary: true,
            compression: 'none',
            password_protected: false
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="export_type"
                label="Export Format"
                rules={[{ required: true, message: 'Please select export format' }]}
              >
                <Select placeholder="Select export format">
                  {exportTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        {type.icon}
                        {type.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="module"
                label="Analytics Module"
                rules={[{ required: true, message: 'Please select analytics module' }]}
              >
                <Select placeholder="Select module to export">
                  {analyticsModules.flatMap(category => 
                    category.modules.map(module => (
                      <Option key={module.value} value={module.value}>
                        <Space>
                          {module.icon}
                          {module.label}
                        </Space>
                      </Option>
                    ))
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="date_range"
            label="Date Range"
            rules={[{ required: true, message: 'Please select date range' }]}
          >
            <RangePicker 
              style={{ width: '100%' }} 
              ranges={{
                'Today': [moment(), moment()],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
              }}
            />
          </Form.Item>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="include_charts"
                label="Include Charts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="include_summary"
                label="Include Summary"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="compression"
                label="Compression"
              >
                <Select>
                  <Option value="none">No Compression</Option>
                  <Option value="zip">ZIP Compression</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password_protected"
                label="Password Protection"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="filename"
            label="Custom Filename"
          >
            <Input placeholder="Leave blank for auto-generated name" />
          </Form.Item>

          <Form.Item style={{ marginTop: 16 }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={exporting}
                icon={<FileExcelOutlined />}
                size="large"
              >
                Generate Export
              </Button>
              <Button 
                onClick={() => setExportModalVisible(false)}
                size="large"
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Advanced Export Modal */}
      <Modal
        title="Advanced Export Options"
        open={advancedModalVisible}
        onCancel={() => setAdvancedModalVisible(false)}
        footer={null}
        width={700}
      >
        <div style={{ padding: '20px 0' }}>
          <Alert
            message="Advanced Export Features"
            description="Configure advanced export options including data filtering and automation settings."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <Form layout="vertical">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Data Filter">
                  <Select placeholder="Select data filter" defaultValue="current">
                    <Option value="current">Current View Only</Option>
                    <Option value="all">All Available Data</Option>
                    <Option value="custom">Custom Filter</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Schedule Export">
                  <Select placeholder="Select schedule" defaultValue="once">
                    <Option value="once">Run Once</Option>
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item label="Export Description">
              <Input.TextArea rows={3} placeholder="Add description for this export..." />
            </Form.Item>
            
            <Divider />
            
            <Form.Item>
              <Space>
                <Button type="primary">Save Advanced Export</Button>
                <Button onClick={() => setAdvancedModalVisible(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Export Preview"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width={900}
        footer={null}
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <FileImageOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Text type="secondary">
            Preview functionality will be available when real data is connected
          </Text>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        title="Share Export"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        width={500}
      >
        <div style={{ padding: '20px 0' }}>
          <Form layout="vertical">
            <Form.Item label="Share Link">
              <Input
                value={`${window.location.origin}/exports/share/`}
                readOnly
                suffix={
                  <Tooltip title="Copy to clipboard">
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/exports/share/`);
                        message.success('Link copied to clipboard');
                      }}
                    />
                  </Tooltip>
                }
              />
            </Form.Item>
            
            <Form.Item label="Access Permissions">
              <Select defaultValue="view">
                <Option value="view">View Only</Option>
                <Option value="download">View & Download</Option>
                <Option value="edit">Full Access</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="Expiration">
              <Select defaultValue="7days">
                <Option value="1day">1 Day</Option>
                <Option value="7days">7 Days</Option>
                <Option value="30days">30 Days</Option>
                <Option value="never">Never Expire</Option>
              </Select>
            </Form.Item>
            
            <Divider />
            
            <Form.Item>
              <Space>
                <Button type="primary" icon={<ShareAltOutlined />}>Generate Share Link</Button>
                <Button onClick={() => setShareModalVisible(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default AnalyticsExport;