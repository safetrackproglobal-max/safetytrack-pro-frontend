// src/admin/AuditLogs.js - Using adminService
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Input, 
  Select, 
  DatePicker, 
  Space, 
  Tag, 
  Button, 
  message, 
  Spin, 
  Alert,
  Row,
  Col,
  Typography,
  Statistic,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  DownloadOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAuditLogs, getUsers } from '../services/adminService';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Action types with colors and icons
const ACTION_TYPES = {
  'user_login': { color: 'blue', icon: '🔐', label: 'User Login' },
  'user_logout': { color: 'blue', icon: '🚪', label: 'User Logout' },
  'user_created': { color: 'green', icon: '👤', label: 'User Created' },
  'user_updated': { color: 'green', icon: '✏️', label: 'User Updated' },
  'user_deleted': { color: 'red', icon: '🗑️', label: 'User Deleted' },
  'role_changed': { color: 'purple', icon: '🔄', label: 'Role Changed' },
  'permission_updated': { color: 'purple', icon: '🔒', label: 'Permission Updated' },
  'employee_created': { color: 'cyan', icon: '👥', label: 'Employee Created' },
  'employee_updated': { color: 'cyan', icon: '✏️', label: 'Employee Updated' },
  'employee_deleted': { color: 'red', icon: '🗑️', label: 'Employee Deleted' },
  'report_generated': { color: 'gold', icon: '📊', label: 'Report Generated' },
  'settings_updated': { color: 'orange', icon: '⚙️', label: 'Settings Updated' },
  'system_error': { color: 'red', icon: '⚠️', label: 'System Error' },
  'incident_reported': { color: 'volcano', icon: '🚨', label: 'Incident Reported' },
  'incident_updated': { color: 'volcano', icon: '✏️', label: 'Incident Updated' }
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchText, actionFilter, userFilter, dateRange]);

  // ✅ Fetch logs using adminService
  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAuditLogs();
      console.log('Audit logs response:', response);
      
      if (response && response.success) {
        setLogs(response.logs || response.data || []);
      } else {
        setError(response?.error || 'Failed to fetch audit logs');
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.message || 'Failed to fetch audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch users using adminService
  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      if (response && response.success) {
        setUsers(response.users || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(log =>
        (log.user || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (log.action || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (log.details || '').toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.user_id === parseInt(userFilter) || log.user === userFilter);
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter(log => {
        const logDate = dayjs(log.timestamp || log.created_at);
        return logDate.isAfter(start) && logDate.isBefore(end);
      });
    }

    setFilteredLogs(filtered);
  };

  const getActionInfo = (action) => {
    return ACTION_TYPES[action] || { color: 'default', icon: '📋', label: action || 'Unknown' };
  };

  const getActionTag = (action) => {
    const info = getActionInfo(action);
    return (
      <Tag color={info.color}>
        {info.icon} {info.label}
      </Tag>
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return dayjs(timestamp).format('MMM DD, YYYY HH:mm:ss');
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => formatTimestamp(timestamp),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: 'descend'
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 150,
      render: (user, record) => (
        <Space>
          <UserOutlined />
          <span>{user || 'Unknown'}</span>
          {record.user_email && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ({record.user_email})
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (action) => getActionTag(action)
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details) => details || '—'
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 130,
      render: (ip) => ip || '—'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Badge 
          status={status === 'success' ? 'success' : status === 'failure' ? 'error' : 'default'} 
          text={status || 'success'}
        />
      )
    }
  ];

  // Statistics
  const stats = {
    total: filteredLogs.length,
    today: filteredLogs.filter(log => dayjs(log.timestamp).isSame(dayjs(), 'day')).length,
    thisWeek: filteredLogs.filter(log => dayjs(log.timestamp).isAfter(dayjs().subtract(7, 'days'))).length,
    errors: filteredLogs.filter(log => log.status === 'failure').length
  };

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined />
          <span>Audit Logs</span>
          <Tag color="blue">{filteredLogs.length} entries</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchLogs}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            disabled={filteredLogs.length === 0}
            onClick={() => message.info('Export functionality coming soon')}
          >
            Export
          </Button>
        </Space>
      }
    >
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic 
              title="Total Entries" 
              value={stats.total} 
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic 
              title="Today" 
              value={stats.today} 
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic 
              title="This Week" 
              value={stats.thisWeek} 
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic 
              title="Errors" 
              value={stats.errors} 
              prefix={<SafetyOutlined />}
              valueStyle={{ color: stats.errors > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary" onClick={fetchLogs}>
              Retry
            </Button>
          }
        />
      )}

      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
        <Col xs={24} sm={8}>
          <Input
            placeholder="Search logs..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col xs={12} sm={4}>
          <Select
            value={actionFilter}
            onChange={setActionFilter}
            style={{ width: '100%' }}
            placeholder="Action"
          >
            <Option value="all">All Actions</Option>
            {Object.keys(ACTION_TYPES).map(action => (
              <Option key={action} value={action}>
                {ACTION_TYPES[action].icon} {ACTION_TYPES[action].label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} sm={4}>
          <Select
            value={userFilter}
            onChange={setUserFilter}
            style={{ width: '100%' }}
            placeholder="User"
            showSearch
            optionFilterProp="children"
          >
            <Option value="all">All Users</Option>
            {users.map(user => (
              <Option key={user.id} value={user.id}>
                {user.name || user.email}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <RangePicker
            style={{ width: '100%' }}
            value={dateRange}
            onChange={setDateRange}
            placeholder={['Start Date', 'End Date']}
          />
        </Col>
      </Row>

      {/* Table */}
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} logs`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
        />
      </Spin>
    </Card>
  );
};

export default AuditLogs;