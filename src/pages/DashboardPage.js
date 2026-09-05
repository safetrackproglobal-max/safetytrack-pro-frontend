// src/pages/DashboardPage.js - FOR ADMIN AND USER ONLY
// Super Admin has their own separate dashboard

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Alert, 
  Spin, 
  Progress, 
  Tag,
  Tooltip,
  message,
  Modal,
  Badge,
  Grid,
  Typography,
  Tabs,
  Avatar,
  Space,
  Divider,
  Empty,
  List,
  Skeleton
} from 'antd';
import { 
  AlertOutlined, 
  MedicineBoxOutlined,
  ArrowRightOutlined,
  RobotOutlined,
  FileTextOutlined,
  UserOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  RocketOutlined,
  NotificationOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  VideoCameraOutlined,
  RiseOutlined,
  FallOutlined,
  DashboardOutlined,
  ApartmentOutlined,
  LockOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  FundOutlined,
  BellOutlined,
  CheckCircleFilled,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  CalendarOutlined,
  CrownOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import dashboardService from '../services/dashboardService';
import './Dashboard.css';

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

// ============================================
// STATS CARD COMPONENT
// ============================================
const StatsCard = ({ title, value, icon, color, trend, loading, onClick }) => (
  <Card 
    className="stats-card" 
    bordered={false}
    hoverable
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
      <div className="stats-card-content">
        <div className="stats-card-icon" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <div className="stats-card-info">
          <Text className="stats-card-title">{title}</Text>
          <div className="stats-card-value">{value}</div>
          {trend && (
            <div className={`stats-card-trend ${trend.direction}`}>
              {trend.direction === 'up' ? <RiseOutlined /> : <FallOutlined />}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
    </Skeleton>
  </Card>
);

// ============================================
// ACTIVITY ITEM COMPONENT
// ============================================
const ActivityItem = ({ activity }) => {
  const getIcon = (type) => {
    const icons = {
      'incident': <AlertOutlined />,
      'hospital': <MedicineBoxOutlined />,
      'environmental': <EnvironmentOutlined />,
      'hse': <SafetyCertificateOutlined />,
      'analysis': <ExperimentOutlined />,
      'ai': <RobotOutlined />,
      'document': <FileTextOutlined />,
      'camera': <CameraOutlined />,
      'video': <VideoCameraOutlined />,
      'default': <BellOutlined />
    };
    return icons[type] || icons.default;
  };

  const getColor = (type) => {
    const colors = {
      'incident': '#ff4d4f',
      'hospital': '#1890ff',
      'environmental': '#13c2c2',
      'hse': '#52c41a',
      'analysis': '#722ed1',
      'ai': '#eb2f96',
      'document': '#fa8c16',
      'camera': '#52c41a',
      'video': '#722ed1',
      'default': '#1890ff'
    };
    return colors[type] || colors.default;
  };

  const getStatusColor = (status) => {
    const colors = {
      'success': '#52c41a',
      'warning': '#faad14',
      'error': '#ff4d4f',
      'info': '#1890ff'
    };
    return colors[status] || colors.info;
  };

  return (
    <div className="activity-item">
      <div className="activity-avatar">
        <Avatar 
          icon={getIcon(activity.type)} 
          style={{ backgroundColor: getColor(activity.type) }}
          size={40}
        />
      </div>
      <div className="activity-content">
        <div className="activity-header">
          <span className="activity-title">{activity.title}</span>
          <span className="activity-time">
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
          </span>
        </div>
        <div className="activity-description">{activity.description}</div>
        <div className="activity-footer">
          <Tag color={getStatusColor(activity.status)} size="small">
            {activity.status || 'info'}
          </Tag>
          {activity.link && (
            <Link to={activity.link}>
              <Button type="link" size="small" className="activity-link">
                View Details <ArrowRightOutlined />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
function DashboardPage() {
  const { user, isSuperAdmin, isRegularAdmin, isEmployee, isRegularUser, hasRole } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const history = useHistory();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [dashboardData, setDashboardData] = useState(null);
  const [aiServicesModal, setAiServicesModal] = useState(false);
  const [userRole, setUserRole] = useState('user');

  // ============================================
  // CHECK IF SUPER ADMIN - REDIRECT TO THEIR DASHBOARD
  // ============================================
  useEffect(() => {
    if (isSuperAdmin()) {
      console.log('👑 Super Admin detected - redirecting to Super Admin Dashboard');
      history.push('/super-admin/dashboard');
    }
  }, [isSuperAdmin, history]);

  // ============================================
  // DETERMINE USER ROLE (ADMIN OR USER)
  // ============================================
  const getUserRole = useCallback(() => {
    if (!user) return 'user';
    
    // Super Admin should not be here, but if they are, redirect
    if (isSuperAdmin()) {
      history.push('/super-admin/dashboard');
      return 'super_admin';
    }
    
    // Check for admin
    if (isRegularAdmin() || user.user_type === 'admin' || user.user_type === 'company_admin') {
      return 'admin';
    }
    
    // Check for employee
    if (isEmployee() || user.user_type === 'employee') {
      return 'employee';
    }
    
    // Default user
    return 'user';
  }, [user, isSuperAdmin, isRegularAdmin, isEmployee, history]);

  // ============================================
  // FETCH DASHBOARD DATA BASED ON ROLE
  // ============================================
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError('');

      const role = getUserRole();
      setUserRole(role);
      
      console.log(`👤 Fetching dashboard for role: ${role}`, user);
      
      let response;
      
      // ✅ Fetch data based on role (Admin or User)
      if (role === 'admin' || role === 'company_admin') {
        // Admins get company-level data
        console.log('📊 Fetching admin dashboard...');
        response = await dashboardService.getAdminDashboard();
      } else {
        // Users and employees get personal dashboard
        console.log('📊 Fetching user dashboard...');
        response = await dashboardService.getEmployeeDashboard();
      }
      
      // If no response or error, fallback to regular dashboard
      if (!response || !response.success) {
        console.warn('Role-specific dashboard failed, falling back to regular dashboard');
        response = await dashboardService.getDashboardStats();
      }
      
      if (response && response.success) {
        // Add user role to the data
        const dataWithRole = {
          ...response.data,
          userRole: role,
          user: {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            role: role,
            user_type: user?.user_type
          }
        };
        setDashboardData(dataWithRole);
        console.log('✅ Dashboard data loaded for role:', role);
      } else {
        throw new Error(response?.message || 'Failed to load dashboard data');
      }

    } catch (error) {
      console.error('❌ Dashboard data fetch failed:', error);
      setError('Unable to load dashboard data. Please try again later.');
      
      // Set fallback data with user role
      setDashboardData({
        userRole: getUserRole(),
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          role: getUserRole(),
          user_type: user?.user_type
        },
        stats: {
          incidents: 0,
          documents: 0,
          users: 0,
          tasks: 0,
          compliance: 0,
          risks: 0,
          hospitals: 0,
          departments: 0,
          patients: 0,
          beds: 0,
          storage: { used: 0, total: 100, percentage: 0, status: 'checking' }
        },
        trends: {
          incidents: { value: 0, direction: 'stable' },
          compliance: { value: 0, direction: 'stable' },
          efficiency: { value: 0, direction: 'stable' },
          ai: { value: 0, direction: 'stable' }
        },
        recentActivity: [],
        systemStatus: {
          api: 'checking',
          database: 'checking',
          ai: 'checking',
          storage: 'checking',
          camera: 'checking',
          video: 'checking',
          security: 'checking'
        },
        performance: {
          active_users: 0,
          data_accuracy: '0%',
          response_time: '0ms',
          uptime: '0%'
        },
        moduleStats: {
          analysis: { total: 0, today: 0, week: 0 },
          environmental: { total: 0, today: 0, week: 0 },
          hospital: { total: 0, today: 0, week: 0 },
          hse: { total: 0, today: 0, week: 0 },
          documents: { total: 0, today: 0, week: 0 },
          incidents: { total: 0, today: 0, week: 0 },
          ai: { total: 0, today: 0, week: 0 }
        },
        lastUpdated: new Date().toISOString(),
        systemHealth: {}
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, getUserRole]);

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    if (user && !isSuperAdmin()) {
      fetchDashboardData();
    }
  }, [user, isSuperAdmin]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
    message.success('Dashboard refreshed');
  };

  const handleUpgradePrompt = (plan = 'pro') => {
    Modal.info({
      title: 'Upgrade Required',
      content: (
        <div>
          <p>This feature requires <strong>{plan.toUpperCase()}</strong> plan or higher.</p>
          <p>Upgrade to unlock:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li>🎥 Video Analysis & Monitoring</li>
            <li>📊 Advanced Analytics & Reports</li>
            <li>🤖 Enhanced AI Capabilities</li>
            <li>📈 Real-time Dashboards</li>
          </ul>
        </div>
      ),
      okText: 'View Plans',
      onOk: () => history.push('/pricing'),
      cancelText: 'Later',
    });
  };

  // ============================================
  // RENDER HELPERS
  // ============================================
  const renderRoleBadge = () => {
    const role = userRole || 'user';
    const roleColors = {
      'admin': '#1890ff',
      'company_admin': '#722ed1',
      'employee': '#13c2c2',
      'user': '#8c8c8c'
    };
    
    const roleLabels = {
      'admin': 'Admin',
      'company_admin': 'Company Admin',
      'employee': 'Employee',
      'user': 'User'
    };
    
    return (
      <Tag color={roleColors[role] || '#8c8c8c'} style={{ marginLeft: 8 }}>
        {roleLabels[role] || role}
      </Tag>
    );
  };

  const renderStats = () => {
    if (!dashboardData) return null;
    
    const { stats, trends } = dashboardData;
    const role = userRole || 'user';
    
    // Different stats based on role
    let statConfigs = [];
    
    if (role === 'admin' || role === 'company_admin') {
      // Admins see company stats
      statConfigs = [
        {
          title: 'Team Members',
          value: stats.users || 0,
          icon: <UserOutlined />,
          color: '#1890ff',
          onClick: () => history.push('/admin/users')
        },
        {
          title: 'Incidents',
          value: stats.incidents || 0,
          icon: <AlertOutlined />,
          color: '#ff4d4f',
          trend: trends?.incidents,
          onClick: () => history.push('/incidents')
        },
        {
          title: 'Documents',
          value: stats.documents || 0,
          icon: <FileTextOutlined />,
          color: '#fa8c16',
          onClick: () => history.push('/documents')
        },
        {
          title: 'Compliance',
          value: `${stats.compliance || 0}%`,
          icon: <SafetyCertificateOutlined />,
          color: '#52c41a',
          trend: trends?.compliance
        }
      ];
    } else {
      // Regular users see personal stats
      statConfigs = [
        {
          title: 'My Incidents',
          value: stats.incidents || 0,
          icon: <AlertOutlined />,
          color: '#ff4d4f',
          trend: trends?.incidents,
          onClick: () => history.push('/incidents')
        },
        {
          title: 'My Documents',
          value: stats.documents || 0,
          icon: <FileTextOutlined />,
          color: '#fa8c16',
          onClick: () => history.push('/documents')
        },
        {
          title: 'My Tasks',
          value: stats.tasks || 0,
          icon: <CheckCircleFilled />,
          color: '#52c41a',
          onClick: () => history.push('/tasks')
        },
        {
          title: 'Compliance',
          value: `${stats.compliance || 0}%`,
          icon: <SafetyCertificateOutlined />,
          color: '#1890ff'
        }
      ];
    }

    return (
      <Row gutter={[16, 16]}>
        {statConfigs.map((config, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <StatsCard 
              {...config} 
              loading={loading}
            />
          </Col>
        ))}
      </Row>
    );
  };

  const renderStorage = () => {
    if (!dashboardData) return null;
    const { stats } = dashboardData;
    const storage = stats.storage || { used: 0, total: 100, percentage: 0 };
    const percentage = storage.percentage || 0;
    
    return (
      <Card className="storage-card" bordered={false}>
        <div className="storage-content">
          <div className="storage-header">
            <CloudUploadOutlined />
            <Text strong>Storage</Text>
          </div>
          <Progress 
            percent={Math.round(percentage)} 
            strokeColor={percentage > 80 ? '#ff4d4f' : '#1890ff'}
            format={() => `${Math.round(percentage)}%`}
          />
          <div className="storage-details">
            <span>{storage.used}GB used</span>
            <span>{storage.total}GB total</span>
          </div>
          <div className="storage-status">
            <Tag color={percentage > 80 ? 'red' : 'green'}>
              {storage.status || 'Normal'}
            </Tag>
          </div>
        </div>
      </Card>
    );
  };

  const renderRecentActivity = () => {
    if (!dashboardData) return null;
    
    const activities = dashboardData.recentActivity || [];
    const filteredActivities = activeTab === 'all' 
      ? activities 
      : activities.filter(a => a.type === activeTab);

    if (loading) {
      return <Skeleton active paragraph={{ rows: 6 }} />;
    }

    if (filteredActivities.length === 0) {
      return (
        <Empty 
          description="No recent activity" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return filteredActivities.slice(0, 8).map((activity, index) => (
      <ActivityItem key={activity.id || index} activity={activity} />
    ));
  };

  const renderSystemStatus = () => {
    if (!dashboardData) return null;
    const status = dashboardData.systemStatus || {};
    
    const statusItems = [
      { key: 'api', label: 'API', value: status.api },
      { key: 'database', label: 'Database', value: status.database },
      { key: 'ai', label: 'AI Services', value: status.ai },
      { key: 'storage', label: 'Storage', value: status.storage },
      { key: 'camera', label: 'Camera', value: status.camera },
      { key: 'video', label: 'Video', value: status.video }
    ];

    const getStatusColor = (status) => {
      if (status === 'online' || status === 'active') return '#52c41a';
      if (status === 'warning') return '#faad14';
      return '#d9d9d9';
    };

    const getStatusText = (status) => {
      if (status === 'online' || status === 'active') return 'Operational';
      if (status === 'warning') return 'Degraded';
      return 'Checking';
    };

    return (
      <Card className="status-card" bordered={false}>
        <div className="status-grid">
          {statusItems.map(item => (
            <div key={item.key} className="status-item">
              <div className="status-dot" style={{ background: getStatusColor(item.value) }} />
              <div className="status-info">
                <div className="status-label">{item.label}</div>
                <div className="status-value">{getStatusText(item.value)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderQuickActions = () => {
    const role = userRole || 'user';
    
    // Base actions for all users
    let actions = [
      {
        title: 'Hospital',
        icon: <MedicineBoxOutlined />,
        color: '#1890ff',
        path: '/hospital-management'
      },
      {
        title: 'Environmental',
        icon: <EnvironmentOutlined />,
        color: '#13c2c2',
        path: '/environmental-management'
      },
      {
        title: 'HSE',
        icon: <SafetyCertificateOutlined />,
        color: '#52c41a',
        path: '/hse-management'
      },
      {
        title: 'Incidents',
        icon: <AlertOutlined />,
        color: '#ff4d4f',
        path: '/incidents'
      },
      {
        title: 'AI Services',
        icon: <RobotOutlined />,
        color: '#eb2f96',
        onClick: () => setAiServicesModal(true)
      }
    ];
    
    // Admin-only actions
    if (role === 'admin' || role === 'company_admin') {
      actions.push({
        title: 'User Management',
        icon: <UserOutlined />,
        color: '#722ed1',
        path: '/admin/users'
      });
      actions.push({
        title: 'Analytics',
        icon: <LineChartOutlined />,
        color: '#fa8c16',
        path: '/analytics'
      });
    }

    return (
      <Row gutter={[12, 12]}>
        {actions.map((action, index) => (
          <Col xs={12} sm={8} md={4} key={index}>
            <Card 
              className="quick-action"
              bordered={false}
              hoverable
              onClick={() => {
                if (action.onClick) {
                  action.onClick();
                } else if (action.path) {
                  history.push(action.path);
                }
              }}
            >
              <div className="quick-action-icon" style={{ color: action.color }}>
                {action.icon}
              </div>
              <div className="quick-action-title">{action.title}</div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  // If Super Admin, don't render this dashboard (redirect happens in useEffect)
  if (isSuperAdmin()) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" tip="Redirecting to Super Admin Dashboard..." />
      </div>
    );
  }

  if (loading && !refreshing) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  const moduleStats = dashboardData?.moduleStats || {};

  return (
    <div className={`dashboard-container ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <Title level={2} className="dashboard-title">
            <DashboardOutlined /> Dashboard
          </Title>
          <div className="dashboard-subtitle">
            Welcome back, <strong>{user?.name || 'User'}</strong>
            {renderRoleBadge()}
            <Tag color={
              user?.plan === 'pro' ? '#722ed1' : 
              user?.plan === 'enterprise' ? '#fa8c16' : 
              user?.plan === 'basic' ? '#1890ff' : '#8c8c8c'
            }>
              {(user?.plan || 'FREE').toUpperCase()}
            </Tag>
          </div>
        </div>
        <div className="dashboard-header-right">
          <Tooltip title="Last updated">
            <Tag icon={<ClockCircleOutlined />}>
              {dashboardData?.lastUpdated ? new Date(dashboardData.lastUpdated).toLocaleTimeString() : 'Just now'}
            </Tag>
          </Tooltip>
          <Button 
            icon={<SyncOutlined spin={refreshing} />} 
            onClick={handleRefresh}
            loading={refreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError('')}
          className="dashboard-alert"
        />
      )}

      {/* Stats Row */}
      <div className="dashboard-stats">
        {renderStats()}
      </div>

      {/* Storage & Module Stats */}
      <Row gutter={[16, 16]} className="dashboard-row">
        <Col xs={24} lg={8}>
          {renderStorage()}
        </Col>
        <Col xs={24} lg={16}>
          <Card className="module-stats-card" bordered={false}>
            <div className="module-stats-grid">
              {Object.entries(moduleStats).map(([key, value]) => (
                <div key={key} className="module-stat-item">
                  <div className="module-stat-value">{value.total || 0}</div>
                  <div className="module-stat-label">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div className="module-stat-details">
                    <span>+{value.today || 0} today</span>
                    <span>+{value.week || 0} week</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Quick Actions</h3>
          <span className="section-extra">Jump to any module</span>
        </div>
        {renderQuickActions()}
      </div>

      {/* Activity & System Status */}
      <Row gutter={[16, 16]} className="dashboard-row">
        <Col xs={24} lg={16}>
          <Card 
            className="activity-card"
            bordered={false}
            title={
              <div className="card-header">
                <BellOutlined />
                Recent Activity
                <Badge count={dashboardData?.recentActivity?.length || 0} style={{ marginLeft: 8 }} />
              </div>
            }
            extra={
              <Tabs 
                size="small" 
                activeKey={activeTab} 
                onChange={setActiveTab}
                className="activity-tabs"
              >
                <TabPane tab="All" key="all" />
                <TabPane tab="Incidents" key="incident" />
                <TabPane tab="Hospital" key="hospital" />
                <TabPane tab="HSE" key="hse" />
                <TabPane tab="AI" key="ai" />
              </Tabs>
            }
          >
            <div className="activity-list">
              {renderRecentActivity()}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          {renderSystemStatus()}
        </Col>
      </Row>

      {/* AI Services Modal */}
      <Modal
        title="AI Services Hub"
        open={aiServicesModal}
        onCancel={() => setAiServicesModal(false)}
        footer={null}
        width={700}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card className="ai-service-card" hoverable>
              <Card.Meta
                avatar={<RobotOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
                title="AI Chat Assistant"
                description="Real-time medical Q&A and patient support"
              />
              <Button type="primary" block style={{ marginTop: 12 }}>
                Launch
              </Button>
            </Card>
          </Col>
          <Col span={24}>
            <Card className="ai-service-card" hoverable>
              <Card.Meta
                avatar={<ExperimentOutlined style={{ fontSize: 32, color: '#722ed1' }} />}
                title="Symptom Analysis"
                description="Analyze symptoms and get potential conditions"
              />
              <Button type="primary" block style={{ marginTop: 12 }}>
                Launch
              </Button>
            </Card>
          </Col>
          <Col span={24}>
            <Card className="ai-service-card" hoverable>
              <Card.Meta
                avatar={<VideoCameraOutlined style={{ fontSize: 32, color: '#eb2f96' }} />}
                title="Video Analysis"
                description="Analyze video for safety compliance"
              />
              <Button 
                type="primary" 
                block 
                style={{ marginTop: 12 }}
                onClick={() => {
                  const canAccessPro = user?.plan === 'pro' || user?.plan === 'enterprise';
                  if (canAccessPro) {
                    history.push('/ai-services/video-analysis');
                  } else {
                    handleUpgradePrompt('pro');
                  }
                }}
              >
                {user?.plan === 'pro' || user?.plan === 'enterprise' ? 'Launch' : 'Upgrade to PRO'}
              </Button>
              {(user?.plan !== 'pro' && user?.plan !== 'enterprise') && (
                <Tag color="purple" style={{ marginTop: 8 }}>PRO</Tag>
              )}
            </Card>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

export default DashboardPage;