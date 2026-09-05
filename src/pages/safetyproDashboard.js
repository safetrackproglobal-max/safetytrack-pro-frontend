// src/pages/SafetyProDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Modal,
  message,
  Badge,
  Tooltip,
  Alert,
  Tag,
  Table,
  Tabs,
  Statistic
} from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  ExportOutlined,
  ReloadOutlined,
  FilterOutlined,
  DollarOutlined,
  RocketOutlined,
  SettingOutlined,
  BarChartOutlined,
  EyeOutlined,
  RiseOutlined,
  UserOutlined
} from '@ant-design/icons';
import SafetyProService from '../services/safetyproservice';
import ApprovalActions from './ApprovalActions';
import StatsOverview from './StatsOverview';
import './safetyproDashboard.css';
import PaymentVerification from '../components/PaymentVerification';

import {
  PLAN_OPTIONS,
  BILLING_CYCLES,
  UserUpgradeModal,
  UserDetailsDrawer,
  BulkOperationsModal,
  SystemHealthCard,
  ManualUserCreation
} from './SafetyProComponents';
import CSVUserUpload from '../components/CSVUserUpload';
import api, { apiGet, apiPost } from '../services/api';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// ==================== MAIN SAFETYPRO DASHBOARD COMPONENT ====================
const SafetyProDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    user_type: 'all',
    plan: 'all',
    search: ''
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  
  // New state variables
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsDrawerVisible, setUserDetailsDrawerVisible] = useState(false);
  
  // User management state
  const [allUsers, setAllUsers] = useState([]);
  const [filteredAllUsers, setFilteredAllUsers] = useState([]);
  const [userSearchText, setUserSearchText] = useState('');
  const [userFilterType, setUserFilterType] = useState('all');
  const [userFilterPlan, setUserFilterPlan] = useState('all');
  const [selectedUserRows, setSelectedUserRows] = useState([]);
  
  const [manualUserModalVisible, setManualUserModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Debug function
  const testUserEndpoint = async () => {
    try {
      console.log('🔍 Testing /admin/users/all endpoint...');
      const response = await apiGet('/admin/users/all?per_page=100');
      console.log('🔍 Full response:', response);
      console.log('🔍 Response structure:', {
        success: response?.success,
        dataExists: !!response?.data,
        usersInData: response?.data?.users?.length,
        usersDirect: response?.users?.length,
        dataKeys: response?.data ? Object.keys(response.data) : []
      });
      
      if (response?.data?.users) {
        console.log('🔍 Users found in data.users:', response.data.users.length);
        console.log('🔍 First few users:', response.data.users.slice(0, 3));
      }
    } catch (error) {
      console.error('🔍 Error testing endpoint:', error);
    }
  };

  const debugUserAPI = async () => {
    console.log('🔍 === DEBUGGING USER API ===');
    
    const token = localStorage.getItem('access_token');
    console.log('🔍 Token exists:', !!token);
    
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/admin/users/all?per_page=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        console.log('🔍 Direct fetch response:', data);
        console.log('🔍 Users count from direct fetch:', data?.data?.users?.length || data?.users?.length || 0);
        
        if (data?.data?.users) {
          console.log('🔍 First 3 users from data.data.users:', data.data.users.slice(0, 3));
        } else if (data?.users) {
          console.log('🔍 First 3 users from data.users:', data.users.slice(0, 3));
        }
      } catch (error) {
        console.error('🔍 Direct fetch error:', error);
      }
    }
    
    console.log('🔍 Testing through SafetyProService...');
    const response = await SafetyProService.getAllUsers({ per_page: 100 });
    console.log('🔍 Service response:', response);
    console.log('🔍 Users from service:', response?.users?.length || 0);
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await SafetyProService.getAllUsers({
        page: 1,
        per_page: 100,
        user_type: userFilterType !== 'all' ? userFilterType : 'all',
        plan: userFilterPlan !== 'all' ? userFilterPlan : 'all',
        search: userSearchText || '',
        status: 'all'
      });
      
      console.log('📊 fetchAllUsers response:', response);
      
      let userList = [];
      
      if (response && response.success) {
        userList = response.users || [];
      } else if (response && response.users) {
        userList = response.users;
      } else if (Array.isArray(response)) {
        userList = response;
      }
      
      console.log(`📊 Found ${userList.length} users in the system`);
      
      if (userList.length === 0) {
        message.info('No users found in the system');
      } else {
        message.success(`Loaded ${userList.length} users`);
      }
      
      setAllUsers(userList);
      setFilteredAllUsers(userList);
      
    } catch (error) {
      console.error('❌ Error fetching all users:', error);
      message.error('Failed to load users: ' + (error.response?.data?.error || error.message));
      setAllUsers([]);
      setFilteredAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // User action handlers
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserDetailsDrawerVisible(true);
  };

  const handleUpgradeUserPlan = (user) => {
    setSelectedUser(user);
    setUpgradeModalVisible(true);
  };

  const handleDowngradeUser = async (user) => {
    Modal.confirm({
      title: `Downgrade ${user.name}?`,
      content: `Are you sure you want to downgrade ${user.name} to Free plan?`,
      onOk: async () => {
        try {
          const response = await SafetyProService.downgradeUserPlan(user.id);
          if (response.success) {
            message.success(`User downgraded successfully`);
            fetchAllUsers();
          } else {
            message.error('Failed to downgrade user');
          }
        } catch (error) {
          message.error('Error downgrading user');
        }
      }
    });
  };

  const handleSuspendUser = async (user) => {
    Modal.confirm({
      title: `Suspend ${user.name}?`,
      content: `This will suspend the user's account. They won't be able to log in.`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await SafetyProService.suspendUser(user.id);
          if (response.success) {
            message.success(`User suspended successfully`);
            fetchAllUsers();
          } else {
            message.error('Failed to suspend user');
          }
        } catch (error) {
          message.error('Error suspending user');
        }
      }
    });
  };

  const handleActivateUser = async (user) => {
    try {
      const response = await SafetyProService.activateUser(user.id);
      if (response.success) {
        message.success(`User activated successfully`);
        fetchAllUsers();
      } else {
        message.error('Failed to activate user');
      }
    } catch (error) {
      message.error('Error activating user');
    }
  };

  const handleDeleteUser = async (user) => {
    Modal.confirm({
      title: `Delete ${user.name}?`,
      content: 'This action cannot be undone. All user data will be permanently deleted.',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await SafetyProService.deleteUser(user.id);
          if (response.success) {
            message.success(`User deleted successfully`);
            fetchAllUsers();
          } else {
            message.error('Failed to delete user');
          }
        } catch (error) {
          message.error('Error deleting user');
        }
      }
    });
  };

  const handleBlockUser = async (user) => {
    Modal.confirm({
      title: `Block ${user.name}?`,
      content: `This will block the user's IP and email from accessing the platform.`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await SafetyProService.blockUser(user.id);
          if (response.success) {
            message.success(`User blocked successfully`);
            fetchAllUsers();
          } else {
            message.error('Failed to block user');
          }
        } catch (error) {
          message.error('Error blocking user');
        }
      }
    });
  };

  // User management columns
  const userManagementColumns = [
    {
      title: 'User',
      key: 'user',
      width: 280,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <UserOutlined /> <strong>{record.name}</strong>
            {record.is_verified && <Tag color="green" style={{ fontSize: 10 }}>Verified</Tag>}
          </Space>
          <div style={{ fontSize: 12, color: '#666', marginLeft: 20 }}>
            <MailOutlined style={{ marginRight: 4 }} /> {record.email}
          </div>
        </Space>
      ),
      sorter: (a, b) => (a.name || '').localeCompare(b.name || '')
    },
    {
      title: 'Plan',
      key: 'plan',
      width: 100,
      render: (_, record) => (
        <Tag color={record.subscription_plan === 'free' ? 'blue' : record.subscription_plan === 'pro' ? 'purple' : 'gold'}>
          {record.subscription_plan?.toUpperCase() || 'FREE'}
        </Tag>
      )
    },
    {
      title: 'Type',
      key: 'type',
      width: 100,
      render: (_, record) => (
        <Tag color={record.user_type === 'admin' ? 'red' : record.user_type === 'employee' ? 'green' : 'default'}>
          {record.user_type?.toUpperCase() || 'USER'}
        </Tag>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Badge status={record.is_active ? 'success' : 'default'} text={record.is_active ? 'Active' : 'Inactive'} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <Space wrap size="small">
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewUser(record)} />
          </Tooltip>
          <Tooltip title="Upgrade Plan">
            <Button icon={<RocketOutlined />} size="small" type="primary" onClick={() => handleUpgradeUserPlan(record)} />
          </Tooltip>
          {record.is_active ? (
            <Tooltip title="Suspend Account">
              <Button icon={<CloseCircleOutlined />} size="small" danger onClick={() => handleSuspendUser(record)} />
            </Tooltip>
          ) : (
            <Tooltip title="Activate Account">
              <Button icon={<CheckCircleOutlined />} size="small" type="primary" onClick={() => handleActivateUser(record)} />
            </Tooltip>
          )}
          <Tooltip title="Block User">
            <Button icon={<CloseCircleOutlined />} size="small" danger onClick={() => handleBlockUser(record)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.user_type !== 'all') filterParams.user_type = filters.user_type;
      if (filters.plan !== 'all') filterParams.plan = filters.plan;
      if (filters.search) filterParams.search = filters.search;
      if (selectedDateRange) {
        filterParams.from = selectedDateRange[0].format('YYYY-MM-DD');
        filterParams.to = selectedDateRange[1].format('YYYY-MM-DD');
      }

      const [approvalsRes, statsRes] = await Promise.all([
        SafetyProService.getPendingApprovals(filterParams),
        SafetyProService.getApprovalStats()
      ]);

      if (approvalsRes) {
        if (approvalsRes.approvals) {
          setApprovals(approvalsRes.approvals || []);
        } else if (approvalsRes.data && approvalsRes.data.approvals) {
          setApprovals(approvalsRes.data.approvals || []);
        } else if (Array.isArray(approvalsRes)) {
          setApprovals(approvalsRes);
        } else {
          setApprovals([]);
        }
      } else {
        setApprovals([]);
      }

      if (statsRes) {
        if (statsRes.stats) {
          setStats(statsRes.stats);
        } else if (statsRes.data && statsRes.data.stats) {
          setStats(statsRes.data.stats);
        } else if (statsRes.data) {
          setStats(statsRes.data);
        } else {
          setStats(statsRes);
        }
      } else {
        setStats(null);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data. Please try again.');
      setApprovals([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await SafetyProService.getSafetyProDashboard();
      if (response && response.success) {
        console.log('Dashboard data:', response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    debugUserAPI();
    fetchData();
    fetchDashboardData();
    fetchAllUsers();
  }, [refreshKey]);

  useEffect(() => {
    fetchAllUsers();
  }, [userFilterType, userFilterPlan, userSearchText]);

  useEffect(() => {
    let intervalId;
    if (autoRefreshEnabled) {
      intervalId = setInterval(() => {
        fetchData();
      }, 300000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefreshEnabled]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBulkAction = async (action) => {
    if (selectedRows.length === 0) {
      message.warning('Please select users first');
      return;
    }

    Modal.confirm({
      title: `${action === 'approve' ? 'Approve' : 'Reject'} ${selectedRows.length} users?`,
      content: 'This action cannot be undone.',
      okText: 'Confirm',
      cancelText: 'Cancel',
      okButtonProps: { danger: action === 'reject' },
      onOk: async () => {
        try {
          const response = await SafetyProService.bulkAction(
            selectedRows.map(row => row.id),
            action,
            { 
              notes: `${action === 'approve' ? 'Bulk approved' : 'Bulk rejected'} by SafetyPro team`,
              admin_notes: `Batch action performed at ${new Date().toLocaleString()}`
            }
          );

          if (response.success) {
            message.success(`Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${selectedRows.length} users`);
            setSelectedRows([]);
            setRefreshKey(prev => prev + 1);
          } else {
            message.error(`Failed to ${action} users: ${response.error}`);
          }
        } catch (error) {
          console.error('Bulk action error:', error);
          message.error('Failed to perform bulk action');
        }
      }
    });
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const exportParams = {};
      if (filters.user_type !== 'all') exportParams.user_type = filters.user_type;
      if (filters.plan !== 'all') exportParams.plan = filters.plan;
      if (selectedDateRange) {
        exportParams.from = selectedDateRange[0].format('YYYY-MM-DD');
        exportParams.to = selectedDateRange[1].format('YYYY-MM-DD');
      }

      const response = await SafetyProService.exportUsers(exportParams);
      
      if (response.success) {
        if (response.data.file_url) {
          window.open(response.data.file_url, '_blank');
          message.success('Export completed successfully');
        } else if (response.data.data) {
          const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          message.success('Export completed successfully');
        }
      } else {
        message.error('Export failed: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setUserDetailsDrawerVisible(true);
  };

  const handleUpgradeUser = (user) => {
    setSelectedUser(user);
    setUpgradeModalVisible(true);
  };

  const handleMassApproveVerified = async () => {
    Modal.confirm({
      title: 'Mass Approve Verified Users',
      content: 'This will approve all users who have completed verification. Continue?',
      onOk: async () => {
        try {
          const response = await SafetyProService.massApproveVerified();
          if (response.success) {
            message.success('Mass approval completed successfully');
            setRefreshKey(prev => prev + 1);
          } else {
            message.error('Mass approval failed: ' + (response.error || 'Unknown error'));
          }
        } catch (error) {
          console.error('Mass approval error:', error);
          message.error('Failed to perform mass approval');
        }
      }
    });
  };

  const handleSendFollowUps = async () => {
    const pendingUserIds = approvals.map(user => user.id);
    if (pendingUserIds.length === 0) {
      message.warning('No pending users to follow up with');
      return;
    }

    Modal.confirm({
      title: `Send Follow-up Emails to ${pendingUserIds.length} Users`,
      content: 'This will send reminder emails to all pending users. Continue?',
      onOk: async () => {
        try {
          const response = await SafetyProService.sendFollowUpEmails(pendingUserIds);
          if (response.success) {
            message.success(`Follow-up emails sent to ${pendingUserIds.length} users`);
          } else {
            message.error('Failed to send follow-up emails');
          }
        } catch (error) {
          console.error('Follow-up error:', error);
          message.error('Failed to send follow-up emails');
        }
      }
    });
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'user',
      render: (text, record) => (
        <div className="user-info" style={{ cursor: 'pointer' }} onClick={() => handleViewUserDetails(record)}>
          <div className="user-name">
            <UserOutlined style={{ marginRight: 8 }} />
            <strong>{text}</strong>
            {record.is_verified && (
              <Tag color="green" style={{ marginLeft: 8, fontSize: 10 }}>
                Verified
              </Tag>
            )}
          </div>
          <div className="user-email">
            <MailOutlined style={{ marginRight: 8 }} />
            {record.email}
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Plan',
      dataIndex: 'subscription_plan',
      key: 'plan',
      render: (plan) => {
        const planColors = { free: 'blue', professional: 'green', pro: 'orange', custom: 'red' };
        return <Tag color={planColors[plan] || 'default'}>{plan?.toUpperCase() || 'N/A'}</Tag>;
      }
    },
    {
      title: 'Type',
      dataIndex: 'user_type',
      key: 'type',
      render: (type) => <Tag color={type === 'admin' ? 'red' : type === 'employee' ? 'green' : 'blue'}>{type?.toUpperCase() || 'USER'}</Tag>
    },
    {
      title: 'Days Waiting',
      dataIndex: 'days_waiting',
      key: 'waiting',
      render: (days) => {
        const daysValue = days || 0;
        let color = '#52c41a';
        if (daysValue > 7) color = '#f5222d';
        else if (daysValue > 3) color = '#fa8c16';
        return (
          <div>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            <span style={{ color, fontWeight: daysValue > 7 ? 'bold' : 'normal' }}>{daysValue} days</span>
          </div>
        );
      },
      sorter: (a, b) => (a.days_waiting || 0) - (b.days_waiting || 0)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewUserDetails(record)} />
          </Tooltip>
          <Tooltip title="Upgrade Plan">
            <Button icon={<RocketOutlined />} size="small" type="primary" onClick={() => handleUpgradeUser(record)} />
          </Tooltip>
          <ApprovalActions
            user={record}
            onActionComplete={() => {
              setRefreshKey(prev => prev + 1);
              SafetyProService.getApprovalStats()
                .then(response => {
                  if (response.success) {
                    setStats(response.data.stats);
                  }
                })
                .catch(err => console.error('Error refreshing stats:', err));
            }}
          />
        </Space>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys: selectedRows.map(row => row.id),
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.is_processed
    })
  };

  return (
    <div className="safetypro-dashboard">
      <div className="dashboard-header">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>
              <DashboardOutlined style={{ marginRight: 16, color: '#1890ff' }} />
              SafetyPro Team Dashboard
            </h1>
            <Space>
              <Button icon={<RocketOutlined />} onClick={() => setBulkModalVisible(true)} type="primary">Bulk Operations</Button>
              <Button icon={<ExportOutlined />} onClick={handleExport} loading={exportLoading}>Export</Button>
              <Button icon={<ReloadOutlined />} onClick={() => setRefreshKey(prev => prev + 1)} loading={loading}>Refresh</Button>
            </Space>
          </div>
          
          <Alert
            message={
              <Space>
                <TeamOutlined />
                <span><strong>{approvals.length}</strong> pending approvals • <strong>{stats?.total?.pending || 0}</strong> total pending • Auto-refresh: {autoRefreshEnabled ? 'ON' : 'OFF'}</span>
              </Space>
            }
            type="info"
            showIcon
            action={
              <Button size="small" onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}>
                {autoRefreshEnabled ? 'Pause Auto-refresh' : 'Resume Auto-refresh'}
              </Button>
            }
          />
        </Space>
      </div>

      {/* Stats Row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="Total Users" value={stats?.total?.all || 0} prefix={<TeamOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Active Today" value={stats?.active_today || 0} valueStyle={{ color: '#3f8600' }} prefix={<RiseOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="New This Month" value={stats?.new_this_month || 0} valueStyle={{ color: '#1890ff' }} prefix={<UserAddOutlined />} /></Card></Col>
        <Col span={6}><SystemHealthCard /></Col>
      </Row>

      {/* Tabs Navigation */}
      <Card style={{ marginBottom: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><DashboardOutlined /> Dashboard</span>} key="dashboard">
            {/* Quick Actions */}
            <Card style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={24}>
                  <Space wrap>
                    <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleMassApproveVerified} disabled={loading}>
                      Mass Approve Verified
                    </Button>
                    <Button icon={<MailOutlined />} onClick={handleSendFollowUps} disabled={loading || approvals.length === 0}>
                      Send Follow-up Emails
                    </Button>
                    <Button onClick={() => {
                      SafetyProService.notifyTeam('Manual notification sent from dashboard')
                        .then(response => {
                          if (response.success) message.success('Notification sent to team');
                        })
                        .catch(err => {
                          console.error('Notification error:', err);
                          message.error('Failed to send notification');
                        });
                    }}>
                      Notify Team
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Stats Overview */}
            {stats && (
              <div style={{ marginBottom: 24 }}>
                <StatsOverview stats={stats} refreshTrigger={refreshKey} />
              </div>
            )}

            {/* Filters */}
            <Card className="filters-card" style={{ marginBottom: 24 }}>
              <Row gutter={16} align="middle">
                <Col xs={24} md={6} lg={6}>
                  <Search placeholder="Search..." onSearch={(value) => handleFilterChange('search', value)} onChange={(e) => handleFilterChange('search', e.target.value)} allowClear enterButton loading={loading} />
                </Col>
                <Col xs={12} md={4} lg={4}>
                  <Select style={{ width: '100%' }} placeholder="User Type" value={filters.user_type} onChange={(value) => handleFilterChange('user_type', value)} disabled={loading}>
                    <Option value="all">All Types</Option>
                    <Option value="user">User</Option>
                    <Option value="employee">Employee</Option>
                    <Option value="admin">Admin</Option>
                    <Option value="enterprise">Enterprise</Option>
                  </Select>
                </Col>
                <Col xs={12} md={4} lg={4}>
                  <Select style={{ width: '100%' }} placeholder="Plan" value={filters.plan} onChange={(value) => handleFilterChange('plan', value)} disabled={loading}>
                    <Option value="all">All Plans</Option>
                    <Option value="free">Free</Option>
                    <Option value="professional">Professional</Option>
                    <Option value="pro">Pro</Option>
                    <Option value="custom">Custom</Option>
                  </Select>
                </Col>
                <Col xs={24} md={6} lg={6}>
                  <RangePicker style={{ width: '100%' }} placeholder={['Start Date', 'End Date']} onChange={(dates) => setSelectedDateRange(dates)} disabled={loading} />
                </Col>
                <Col xs={24} md={4} lg={4}>
                  <Button type="default" icon={<FilterOutlined />} onClick={() => { setFilters({ user_type: 'all', plan: 'all', search: '' }); setSelectedDateRange(null); setSelectedRows([]); }} block disabled={loading}>
                    Clear Filters
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Bulk Actions Bar */}
            {selectedRows.length > 0 && (
              <div className="bulk-actions-bar" style={{ background: '#f0f5ff', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #d6e4ff' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Badge count={selectedRows.length} showZero style={{ backgroundColor: '#1890ff' }} />
                      <span style={{ fontWeight: 'bold' }}>{selectedRows.length} user{selectedRows.length > 1 ? 's' : ''} selected</span>
                    </Space>
                    <Space>
                      <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleBulkAction('approve')} loading={loading}>Approve Selected</Button>
                      <Button danger icon={<CloseCircleOutlined />} onClick={() => handleBulkAction('reject')} loading={loading}>Reject Selected</Button>
                      <Button onClick={() => setSelectedRows([])}>Clear Selection</Button>
                    </Space>
                  </div>
                </Space>
              </div>
            )}

            {/* Main Table */}
            <Card title={<Space><ClockCircleOutlined /><span>Pending Approvals</span><Badge count={approvals.length} showZero style={{ backgroundColor: '#1890ff' }} /></Space>} extra={<Tag color={autoRefreshEnabled ? 'green' : 'orange'}>Auto-refresh: {autoRefreshEnabled ? 'ON' : 'OFF'}</Tag>}>
              {approvals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                  <h3>No Pending Approvals</h3>
                  <p>All applications have been processed. Great job! 🎉</p>
                </div>
              ) : (
                <Table columns={columns} dataSource={approvals} rowKey="id" loading={loading} rowSelection={rowSelection} pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} pending approvals` }} scroll={{ x: 1300 }} size="middle" />
              )}
            </Card>
          </TabPane>

         <TabPane 
  tab={
    <span>
      <DollarOutlined />
      Payment Verification
    </span>
  } 
  key="payments"
>
  <PaymentVerification />
</TabPane>

          {/* User Management Tab */}
          <TabPane tab={<span><TeamOutlined /> User Management</span>} key="user-management">
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}><Search placeholder="Search users..." onSearch={setUserSearchText} onChange={(e) => setUserSearchText(e.target.value)} allowClear enterButton /></Col>
                <Col span={4}><Select placeholder="User Type" value={userFilterType} onChange={setUserFilterType} style={{ width: '100%' }} allowClear><Option value="all">All Types</Option><Option value="user">User</Option><Option value="employee">Employee</Option><Option value="admin">Admin</Option><Option value="safetypro">SafetyPro</Option><Option value="platform_owner">Platform Owner</Option></Select></Col>
                <Col span={4}><Select placeholder="Plan" value={userFilterPlan} onChange={setUserFilterPlan} style={{ width: '100%' }} allowClear><Option value="all">All Plans</Option><Option value="free">Free</Option><Option value="basic">Basic</Option><Option value="pro">Pro</Option><Option value="enterprise">Enterprise</Option></Select></Col>
                <Col span={8}>
                  <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => { setUserSearchText(''); setUserFilterType('all'); setUserFilterPlan('all'); fetchAllUsers(); }}>Reset</Button>
                    <Button type="primary" icon={<UserAddOutlined />} onClick={() => setManualUserModalVisible(true)}>Add User</Button>
                  </Space>
                </Col>
              </Row>
            </Card>
            <Table columns={userManagementColumns} dataSource={filteredAllUsers} rowKey="id" loading={loading} pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `${total} users` }} scroll={{ x: 1300 }} size="middle" />
          </TabPane>

          {/* Create User Tab */}
          <TabPane tab={<span><UserAddOutlined /> Create User</span>} key="create-user">
            <div style={{ marginBottom: 24 }}><ManualUserCreation /></div>
            <CSVUserUpload />
          </TabPane>

          {/* Analytics Tab */}
          <TabPane tab={<span><BarChartOutlined /> Analytics</span>} key="analytics">
            <Card title="Analytics Dashboard"><Text>Analytics content will be displayed here.</Text></Card>
          </TabPane>

          {/* Settings Tab */}
          <TabPane tab={<span><SettingOutlined /> Settings</span>} key="settings">
            <Card title="System Settings"><Text>System settings will be displayed here.</Text></Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Manual User Creation Modal */}
      <Modal title="📝 Manual User Creation" open={manualUserModalVisible} onCancel={() => setManualUserModalVisible(false)} width={800} footer={null}>
        <ManualUserCreation onUserCreated={() => { fetchAllUsers(); setManualUserModalVisible(false); }} />
      </Modal>

      {/* Modals and Drawers */}
      <UserUpgradeModal visible={upgradeModalVisible} user={selectedUser} onClose={() => { setUpgradeModalVisible(false); setSelectedUser(null); }} onSuccess={() => { setRefreshKey(prev => prev + 1); fetchAllUsers(); }} />
      <UserDetailsDrawer visible={userDetailsDrawerVisible} user={selectedUser} onClose={() => { setUserDetailsDrawerVisible(false); setSelectedUser(null); }} onAction={() => setRefreshKey(prev => prev + 1)} />
      <BulkOperationsModal visible={bulkModalVisible} onClose={() => setBulkModalVisible(false)} onSuccess={() => setRefreshKey(prev => prev + 1)} />
    </div>
  );
};

export default SafetyProDashboard;