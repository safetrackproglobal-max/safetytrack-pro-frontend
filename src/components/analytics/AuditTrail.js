import React, { useEffect, useState, useCallback } from "react";
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Modal, 
  Typography, 
  Space, 
  Select, 
  Input, 
  DatePicker,
  Statistic,
  Row,
  Col,
  Alert,
  Tooltip,
  Badge,
  Divider,
  Progress,
  Switch,
  Tabs,
  Empty,
  Avatar,
  Timeline,
  Collapse,
  message,
  Spin
} from "antd";
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined, 
  DownloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SecurityScanOutlined,
  ExportOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  CalendarOutlined,
  BarChartOutlined,
  AuditOutlined,
  FileTextOutlined,
  GlobalOutlined,
  KeyOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  CloseCircleOutlined,
  LineChartOutlined,
  AreaChartOutlined
} from "@ant-design/icons";
import { analyticsService } from "../../services/analyticsService";
import "./AuditTrail.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;

export default function AuditTrail() {
  // State Management
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [exporting, setExporting] = useState(false);

  // Initialize
  useEffect(() => {
    fetchAuditLogs();
    fetchAuditStats();
    setupAutoRefresh();
  }, []);

  // Auto-refresh
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAuditLogs();
        fetchAuditStats();
      }, 30000); // 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Filter logs when filters change
  useEffect(() => {
    applyFilters();
  }, [auditLogs, searchTerm, actionFilter, userFilter, dateRange, activeTab]);

  // Service-based data fetching
  const fetchAuditLogs = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await analyticsService.fetchAuditLogs(1, 50, filters);
      setAuditLogs(data);
      
      // Cache the data
      analyticsService.cache.set('audit_logs', data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      message.error('Failed to load audit logs');
      
      // Try to load from cache
      const cached = analyticsService.cache.get('audit_logs');
      if (cached) {
        setAuditLogs(cached);
      }
      
      // Load mock data in development
      if (process.env.NODE_ENV === 'development') {
        const mockData = generateMockAuditData();
        setAuditLogs(mockData);
        calculateStats(mockData);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditStats = async () => {
    try {
      const data = await analyticsService.getAuditStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch audit stats:', error);
    }
  };

  const searchAuditLogs = async () => {
    if (!searchTerm.trim()) {
      fetchAuditLogs();
      return;
    }

    setLoading(true);
    try {
      const filters = {};
      if (actionFilter !== 'all') filters.action = actionFilter;
      if (userFilter !== 'all') filters.user = userFilter;
      if (dateRange.length === 2) {
        filters.start_date = dateRange[0].toISOString();
        filters.end_date = dateRange[1].toISOString();
      }

      const data = await analyticsService.searchAuditLogs(searchTerm, filters);
      setAuditLogs(data);
    } catch (error) {
      console.error('Search failed:', error);
      message.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const generateMockAuditData = () => {
    // Use service mock data or generate local mock
    const mockData = analyticsService.getMockData('audit') || [
      {
        id: '1',
        action: 'LOGIN',
        user_name: 'John Doe',
        user_email: 'john@example.com',
        user_role: 'Administrator',
        user_avatar: 'JD',
        resource_type: 'User',
        resource_id: 'user_123',
        resource_name: 'User Settings',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        ip_address: '192.168.1.100',
        user_agent: 'Chrome 98.0.4758.102',
        session_id: 'session_abc123',
        changes: {
          old_value: null,
          new_value: 'Logged in successfully'
        },
        severity: 'INFO',
        category: 'AUTHENTICATION',
        status: 'SUCCESS'
      },
      {
        id: '2',
        action: 'UPDATE',
        user_name: 'Jane Smith',
        user_email: 'jane@example.com',
        user_role: 'Manager',
        user_avatar: 'JS',
        resource_type: 'Patient Record',
        resource_id: 'patient_456',
        resource_name: 'Patient: John Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        ip_address: '192.168.1.101',
        user_agent: 'Firefox 97.0',
        session_id: 'session_def456',
        changes: {
          old_value: { status: 'active' },
          new_value: { status: 'inactive', reason: 'Completed treatment' }
        },
        severity: 'MEDIUM',
        category: 'DATA_MODIFICATION',
        status: 'SUCCESS'
      }
    ];
    return mockData;
  };

  const calculateStats = (logs) => {
    const stats = {
      total: logs.length,
      today: logs.filter(log => {
        const logDate = new Date(log.timestamp);
        const today = new Date();
        return logDate.toDateString() === today.toDateString();
      }).length,
      users: [...new Set(logs.map(log => log.user_email))].length,
      highSeverity: logs.filter(log => log.severity === 'HIGH').length,
      failedActions: logs.filter(log => log.status === 'FAILED').length,
      byAction: logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {}),
      byCategory: logs.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      }, {})
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...auditLogs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip_address?.includes(searchTerm) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.user_email === userFilter);
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });
    }

    // Tab filter
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'high':
          filtered = filtered.filter(log => log.severity === 'HIGH');
          break;
        case 'failed':
          filtered = filtered.filter(log => log.status === 'FAILED');
          break;
        case 'today':
          filtered = filtered.filter(log => {
            const logDate = new Date(log.timestamp);
            const today = new Date();
            return logDate.toDateString() === today.toDateString();
          });
          break;
        case 'security':
          filtered = filtered.filter(log => log.category === 'SECURITY');
          break;
      }
    }

    setFilteredLogs(filtered);
  };

  const setupAutoRefresh = () => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        fetchAuditLogs();
        fetchAuditStats();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setExportModalVisible(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  };

  // Export functionality using service
  const handleExport = async (exportType = 'csv') => {
    setExporting(true);
    try {
      const filters = {};
      
      // Determine which logs to export
      let logsToExport = filteredLogs;
      if (selectedRows.length > 0) {
        logsToExport = auditLogs.filter(log => selectedRows.includes(log.id));
      }

      message.loading({ content: 'Preparing export...', key: 'export' });
      
      // Use service export function
      const result = await analyticsService.exportAuditLogs(exportType, filters);
      
      if (result.export_id) {
        // Start polling for export status
        pollExportStatus(result.export_id);
        
        message.success({ 
          content: 'Export started successfully', 
          key: 'export', 
          duration: 3 
        });
      } else {
        message.error({ content: 'Export failed to start', key: 'export' });
      }
      
      setExportModalVisible(false);
    } catch (error) {
      console.error('Export failed:', error);
      message.error({ content: 'Export failed', key: 'export' });
    } finally {
      setExporting(false);
    }
  };

  const pollExportStatus = async (exportId, retries = 0) => {
    if (retries > 60) {
      message.error('Export timeout');
      return;
    }

    try {
      const status = await analyticsService.getExportStatus(exportId);
      
      if (status.status === 'completed') {
        // Auto-download the export
        await analyticsService.downloadExport(exportId, `audit-trail-export.${status.format || 'csv'}`);
        message.success('Export downloaded!');
      } else if (status.status === 'failed') {
        message.error(`Export failed: ${status.error || 'Unknown error'}`);
      } else {
        // Continue polling with exponential backoff
        const delay = Math.min(1000 * Math.pow(1.5, retries), 10000);
        setTimeout(() => pollExportStatus(exportId, retries + 1), delay);
      }
    } catch (error) {
      const delay = Math.min(5000 * Math.pow(1.5, retries), 30000);
      setTimeout(() => pollExportStatus(exportId, retries + 1), delay);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchAuditLogs();
    } else {
      fetchAuditLogs();
    }
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'create': return 'green';
      case 'update': return 'blue';
      case 'delete': return 'red';
      case 'login': return 'purple';
      case 'logout': return 'orange';
      case 'login_failed': return 'volcano';
      case 'export': return 'cyan';
      case 'import': return 'geekblue';
      case 'read': return 'lime';
      case 'download': return 'gold';
      default: return 'gray';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'HIGH':
        return <WarningOutlined style={{ color: '#ff4d4f' }} />;
      case 'MEDIUM':
        return <InfoCircleOutlined style={{ color: '#fa8c16' }} />;
      case 'LOW':
      case 'INFO':
        return <InfoCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getStatusBadge = (status) => {
    return (
      <Badge 
        status={status === 'SUCCESS' ? 'success' : 'error'}
        text={status}
        style={{ textTransform: 'capitalize' }}
      />
    );
  };

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={getActionColor(action)} style={{ margin: 0 }}>
            {action}
          </Tag>
          {getSeverityIcon(record.severity)}
        </Space>
      )
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user',
      width: 180,
      render: (name, record) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: getActionColor(record.action) }}>
            {record.user_avatar || name?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>{record.user_role}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Resource',
      dataIndex: 'resource_type',
      key: 'resource',
      width: 150,
      render: (type, record) => (
        <div>
          <div>{type}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.resource_name}
          </Text>
        </div>
      )
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => (
        <Tooltip title={timestamp ? new Date(timestamp).toLocaleString() : 'Unknown'}>
          <Space size={4}>
            <ClockCircleOutlined style={{ fontSize: 12 }} />
            <span>{timestamp ? analyticsService.formatDate(timestamp, 'short') : '-'}</span>
            <span style={{ color: '#8c8c8c' }}>
              {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </Space>
        </Tooltip>
      )
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip',
      width: 120,
      render: (ip) => (
        <Tag color={ip?.startsWith('192.168') ? 'green' : 'orange'}>
          {ip || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusBadge(status)
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setSelectedLog(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Export Log">
            <Button
              type="text"
              icon={<ExportOutlined />}
              onClick={() => handleSingleExport(record)}
              size="small"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const handleSingleExport = async (log) => {
    try {
      message.loading({ content: 'Exporting log...', key: 'single-export' });
      const exportData = {
        export_type: 'json',
        module: 'audit',
        data: [log],
        filename: `audit-log-${log.id}.json`
      };
      
      const result = await analyticsService.generateExport(exportData);
      
      if (result.export_id) {
        pollExportStatus(result.export_id);
        message.success({ content: 'Log export started', key: 'single-export', duration: 3 });
      }
    } catch (error) {
      message.error({ content: 'Log export failed', key: 'single-export' });
    }
  };

  // Get unique users and actions for filters
  const uniqueUsers = [...new Set(auditLogs.map(log => log.user_email))];
  const uniqueActions = [...new Set(auditLogs.map(log => log.action))];

  // Render detailed modal
  const renderLogDetails = () => {
    if (!selectedLog) return null;

    return (
      <Modal
        title={
          <Space>
            <AuditOutlined />
            <span>Audit Log Details</span>
          </Space>
        }
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        width={800}
        footer={null}
      >
        <div className="audit-details">
          <Row gutter={[24, 16]}>
            <Col span={24}>
              <div className="audit-header">
                <Space align="center">
                  <Avatar size="large" style={{ backgroundColor: getActionColor(selectedLog.action) }}>
                    {selectedLog.user_avatar}
                  </Avatar>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      {selectedLog.action}
                    </Title>
                    <Text type="secondary">
                      {selectedLog.resource_type} • {selectedLog.resource_name}
                    </Text>
                  </div>
                </Space>
              </div>
            </Col>

            <Col span={12}>
              <Card size="small" title="User Information">
                <Space direction="vertical">
                  <div>
                    <Text strong>Name:</Text> {selectedLog.user_name}
                  </div>
                  <div>
                    <Text strong>Email:</Text> {selectedLog.user_email}
                  </div>
                  <div>
                    <Text strong>Role:</Text> {selectedLog.user_role}
                  </div>
                  <div>
                    <Text strong>Timestamp:</Text> {analyticsService.formatDate(selectedLog.timestamp, 'long')}
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={12}>
              <Card size="small" title="Technical Information">
                <Space direction="vertical">
                  <div>
                    <Text strong>IP Address:</Text> {selectedLog.ip_address}
                  </div>
                  <div>
                    <Text strong>User Agent:</Text> {selectedLog.user_agent}
                  </div>
                  <div>
                    <Text strong>Session ID:</Text> {selectedLog.session_id || 'N/A'}
                  </div>
                  <div>
                    <Text strong>Severity:</Text> {selectedLog.severity}
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="Changes">
                <Collapse bordered={false}>
                  <Panel header="Show Changes" key="changes">
                    <pre className="changes-display">
                      {JSON.stringify(selectedLog.changes, null, 2)}
                    </pre>
                  </Panel>
                </Collapse>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="Additional Information">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div>
                      <Text strong>Category:</Text> {selectedLog.category}
                    </div>
                    <div>
                      <Text strong>Resource ID:</Text> {selectedLog.resource_id}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>Status:</Text> {selectedLog.status}
                    </div>
                    <div>
                      <Text strong>Log ID:</Text> {selectedLog.id}
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="Timeline">
                <Timeline>
                  <Timeline.Item color="green">
                    <Text strong>Action Performed:</Text> {selectedLog.action}
                    <br />
                    <Text type="secondary">
                      {analyticsService.formatDate(selectedLog.timestamp, 'long')}
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <Text>Log recorded in audit trail</Text>
                  </Timeline.Item>
                  <Timeline.Item>
                    <Text type="secondary">Current view</Text>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  };

  // Render export modal
  const renderExportModal = () => (
    <Modal
      title="Export Audit Logs"
      open={exportModalVisible}
      onCancel={() => setExportModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setExportModalVisible(false)}>
          Cancel
        </Button>,
        <Button 
          key="export-csv" 
          onClick={() => handleExport('csv')}
          loading={exporting}
        >
          Export as CSV
        </Button>,
        <Button 
          key="export-excel" 
          type="primary"
          onClick={() => handleExport('excel')}
          loading={exporting}
        >
          Export as Excel
        </Button>
      ]}
      width={500}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="Export Options"
          description="Select the data you want to export"
          type="info"
          showIcon
        />
        
        <div>
          <Text strong>Data Range:</Text>
          <Select style={{ width: '100%', marginTop: 8 }} defaultValue="filtered">
            <Option value="all">All Data ({auditLogs.length} logs)</Option>
            <Option value="filtered">Current Filter ({filteredLogs.length} logs)</Option>
            <Option value="selected">Selected Rows ({selectedRows.length} logs)</Option>
          </Select>
        </div>
        
        <div>
          <Text strong>Format:</Text>
          <Select style={{ width: '100%', marginTop: 8 }} defaultValue="csv">
            <Option value="csv">CSV</Option>
            <Option value="excel">Excel</Option>
            <Option value="pdf">PDF</Option>
            <Option value="json">JSON</Option>
          </Select>
        </div>
        
        <div>
          <Text strong>Include Fields:</Text>
          <div style={{ marginTop: 8 }}>
            <Space direction="vertical">
              <Switch defaultChecked>Basic Information</Switch>
              <Switch defaultChecked>User Details</Switch>
              <Switch>Full Change Details</Switch>
              <Switch defaultChecked>Technical Information</Switch>
              <Switch>Sensitive Data</Switch>
            </Space>
          </div>
        </div>
        
        <Divider />
        
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Estimated file size: ~{(filteredLogs.length * 0.5).toFixed(1)} KB
          </Text>
        </div>
      </Space>
    </Modal>
  );

  if (loading && auditLogs.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="Loading audit logs..." />
      </div>
    );
  }

  return (
    <div className="audit-trail">
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>Audit Trail</span>
            <Badge 
              count={stats.highSeverity || 0} 
              style={{ backgroundColor: '#ff4d4f' }}
              overflowCount={99}
            />
          </Space>
        }
        extra={
          <Space>
            <Switch
              checkedChildren="Auto-refresh"
              unCheckedChildren="Manual"
              checked={autoRefresh}
              onChange={setAutoRefresh}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchAuditLogs();
                fetchAuditStats();
              }}
              loading={loading}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => setExportModalVisible(true)}
              disabled={filteredLogs.length === 0}
            >
              Export
            </Button>
          </Space>
        }
      >
        {/* Stats Overview */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={4}>
            <Card size="small">
              <Statistic
                title="Total Logs"
                value={stats.total || auditLogs.length}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card size="small">
              <Statistic
                title="Today"
                value={stats.today || 0}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card size="small">
              <Statistic
                title="Unique Users"
                value={stats.users || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card size="small">
              <Statistic
                title="High Severity"
                value={stats.highSeverity || 0}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card size="small">
              <Statistic
                title="Failed Actions"
                value={stats.failedActions || 0}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card size="small">
              <Statistic
                title="Activity Rate"
                value={((auditLogs.length || 0) / 60).toFixed(1)}
                suffix="/min"
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <div className="audit-filters" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
                style={{ width: '100%' }}
                allowClear
                enterButton={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                value={actionFilter}
                onChange={setActionFilter}
                style={{ width: '100%' }}
                placeholder="Action"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Actions</Option>
                {uniqueActions.map(action => (
                  <Option key={action} value={action}>
                    {action}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                value={userFilter}
                onChange={setUserFilter}
                style={{ width: '100%' }}
                placeholder="User"
                suffixIcon={<UserOutlined />}
              >
                <Option value="all">All Users</Option>
                {uniqueUsers.map(user => (
                  <Option key={user} value={user}>
                    {user}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button
                style={{ width: '100%' }}
                onClick={() => {
                  setSearchTerm('');
                  setActionFilter('all');
                  setUserFilter('all');
                  setDateRange([]);
                  setActiveTab('all');
                  fetchAuditLogs();
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
          
          {/* Advanced Filters */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Space>
                <Switch
                  checked={showSensitiveData}
                  onChange={setShowSensitiveData}
                  checkedChildren="Show Sensitive Data"
                  unCheckedChildren="Hide Sensitive Data"
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Showing {filteredLogs.length} of {auditLogs.length} logs
                </Text>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: `All Logs (${auditLogs.length})`,
              icon: <DatabaseOutlined />
            },
            {
              key: 'high',
              label: `High Severity (${stats.highSeverity || 0})`,
              icon: <WarningOutlined />
            },
            {
              key: 'failed',
              label: `Failed (${stats.failedActions || 0})`,
              icon: <CloseCircleOutlined />
            },
            {
              key: 'today',
              label: `Today (${stats.today || 0})`,
              icon: <CalendarOutlined />
            },
            {
              key: 'security',
              label: 'Security',
              icon: <SecurityScanOutlined />
            }
          ]}
          style={{ marginBottom: 16 }}
        />

        {/* Audit Logs Table */}
        {filteredLogs.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={filteredLogs}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} audit logs`
              }}
              rowSelection={{
                selectedRowKeys: selectedRows,
                onChange: setSelectedRows
              }}
              scroll={{ x: 1000 }}
              size="middle"
            />
            
            {/* Selected Rows Actions */}
            {selectedRows.length > 0 && (
              <div className="selected-actions" style={{ marginTop: 16 }}>
                <Alert
                  message={`${selectedRows.length} logs selected`}
                  description="You can export or analyze the selected logs"
                  type="info"
                  showIcon
                  action={
                    <Space>
                      <Button 
                        size="small" 
                        onClick={() => setSelectedLog(filteredLogs.find(log => log.id === selectedRows[0]))}
                      >
                        View First Selected
                      </Button>
                      <Button 
                        size="small" 
                        type="primary" 
                        onClick={() => setExportModalVisible(true)}
                      >
                        Export Selected
                      </Button>
                      <Button 
                        size="small" 
                        danger 
                        onClick={() => setSelectedRows([])}
                      >
                        Clear Selection
                      </Button>
                    </Space>
                  }
                />
              </div>
            )}
          </>
        ) : (
          <Empty
            description={
              <div>
                <Title level={4}>No audit logs found</Title>
                <Text type="secondary">
                  {loading ? 'Loading...' : 'Try adjusting your filters or check back later'}
                </Text>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={fetchAuditLogs}>
              Refresh Data
            </Button>
          </Empty>
        )}
      </Card>

      {/* Modals */}
      {renderLogDetails()}
      {renderExportModal()}
    </div>
  );
}