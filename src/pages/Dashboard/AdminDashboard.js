// src/pages/Dashboard/AdminDashboard.js - Fixed logo section
import React, { useState, useEffect } from 'react';
import { Tabs, Card, Row, Col, Button, Spin, Alert, Typography, Tag, Space, Statistic, Modal, message, Avatar } from 'antd';
import { 
  TeamOutlined, 
  SafetyCertificateOutlined, 
  AuditOutlined,
  UserAddOutlined,
  SettingOutlined,
  UserOutlined,
  FileTextOutlined,
  ReloadOutlined,
  PlusOutlined,
  DashboardOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  BookOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import UserManagement from '../../admin/UserManagement';
import EmployeeManagement from '../../admin/EmployeeManagement';
import PermissionManager from '../../admin/PermissionManager';
import AuditLogs from '../../admin/AuditLogs';
import CompanyLogoUpload from '../../components/CompanyLogoUpload';
import adminService from '../../services/adminService';
import dashboardService from '../../services/dashboardService';
import './AdminDashboard.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_documents: 0,
    total_admins: 0,
    total_incidents: 0,
    new_users_week: 0,
    new_incidents_week: 0
  });

  const getFullLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const baseUrl = apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
    
    if (logoPath.startsWith('/static')) {
      return `${baseUrl}${logoPath}`;
    }
    
    if (!logoPath.startsWith('/')) {
      return `${baseUrl}/static/logos/${logoPath}`;
    }
    
    return `${baseUrl}${logoPath}`;
  };

  const fetchCompanyLogo = async (companyId) => {
    if (!companyId) return null;
    try {
      const response = await dashboardService.getCompanyLogo(companyId);
      if (response && response.success) {
        const logo = response.data?.logo_url || response.logo_url || null;
        if (logo) {
          return getFullLogoUrl(logo);
        }
      }
      return null;
    } catch (error) {
      console.warn('Could not fetch company logo:', error);
      return null;
    }
  };

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let statsData = null;
      
      try {
        const response = await dashboardService.getAdminStats();
        if (response && response.success) {
          statsData = response.data || response.stats || response;
          console.log('✅ Stats from getAdminStats:', statsData);
        }
      } catch (apiError) {
        console.warn('getAdminStats failed:', apiError);
      }
      
      if (!statsData) {
        try {
          const response = await dashboardService.apiGetAdminDashboardStats();
          if (response && response.success) {
            statsData = response.data || response.stats || response;
            console.log('✅ Stats from apiGetAdminDashboardStats:', statsData);
          }
        } catch (apiError2) {
          console.warn('apiGetAdminDashboardStats failed:', apiError2);
        }
      }
      
      if (!statsData && user) {
        statsData = {
          total_users: user.total_users || user.stats?.total_users || 0,
          active_users: user.active_users || user.stats?.active_users || 0,
          total_documents: user.total_documents || user.stats?.total_documents || 0,
          total_admins: user.total_admins || user.stats?.total_admins || 0,
          total_incidents: user.total_incidents || user.stats?.total_incidents || 0,
          new_users_week: user.new_users_week || user.stats?.new_users_week || 0,
          new_incidents_week: user.new_incidents_week || user.stats?.new_incidents_week || 0
        };
        console.log('✅ Stats from user object:', statsData);
      }
      
      if (!statsData) {
        const cachedStats = localStorage.getItem('admin_dashboard_stats');
        if (cachedStats) {
          try {
            statsData = JSON.parse(cachedStats);
            console.log('✅ Stats from localStorage:', statsData);
          } catch (e) {
            statsData = null;
          }
        }
      }
      
      try {
        const employeesResponse = await adminService.getEmployees();
        if (employeesResponse && employeesResponse.success) {
          const employees = employeesResponse.data || employeesResponse.employees || [];
          if (Array.isArray(employees) && employees.length > 0) {
            const activeEmployees = employees.filter(emp => emp.is_active !== false).length;
            
            if (statsData) {
              statsData.total_users = Math.max(statsData.total_users || 0, employees.length);
              statsData.active_users = Math.max(statsData.active_users || 0, activeEmployees);
            } else {
              statsData = {
                total_users: employees.length,
                active_users: activeEmployees,
                total_documents: 0,
                total_admins: 0,
                total_incidents: 0,
                new_users_week: 0,
                new_incidents_week: 0
              };
            }
            console.log('✅ Stats from employees API:', { total: employees.length, active: activeEmployees });
          }
        }
      } catch (empError) {
        console.warn('Could not fetch employee count:', empError);
      }
      
      if (statsData) {
        setStats({
          total_users: statsData.total_users || statsData.totalUsers || 0,
          active_users: statsData.active_users || statsData.activeUsers || 0,
          total_documents: statsData.total_documents || statsData.totalDocuments || 0,
          total_admins: statsData.total_admins || statsData.totalAdmins || 0,
          total_incidents: statsData.total_incidents || statsData.totalIncidents || 0,
          new_users_week: statsData.new_users_week || statsData.newUsersWeek || 0,
          new_incidents_week: statsData.new_incidents_week || statsData.newIncidentsWeek || 0
        });
        
        localStorage.setItem('admin_dashboard_stats', JSON.stringify(statsData));
      } else {
        const employeesResponse = await adminService.getEmployees();
        if (employeesResponse && employeesResponse.success) {
          const employees = employeesResponse.data || employeesResponse.employees || [];
          if (Array.isArray(employees)) {
            const activeEmployees = employees.filter(emp => emp.is_active !== false).length;
            setStats({
              total_users: employees.length,
              active_users: activeEmployees,
              total_documents: 0,
              total_admins: 0,
              total_incidents: 0,
              new_users_week: 0,
              new_incidents_week: 0
            });
            console.log('✅ Default stats from employees:', { total: employees.length, active: activeEmployees });
          } else {
            setStats({
              total_users: 0,
              active_users: 0,
              total_documents: 0,
              total_admins: 0,
              total_incidents: 0,
              new_users_week: 0,
              new_incidents_week: 0
            });
          }
        } else {
          setStats({
            total_users: 0,
            active_users: 0,
            total_documents: 0,
            total_admins: 0,
            total_incidents: 0,
            new_users_week: 0,
            new_incidents_week: 0
          });
        }
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load statistics');
      
      try {
        const employeesResponse = await adminService.getEmployees();
        if (employeesResponse && employeesResponse.success) {
          const employees = employeesResponse.data || employeesResponse.employees || [];
          if (Array.isArray(employees)) {
            const activeEmployees = employees.filter(emp => emp.is_active !== false).length;
            setStats({
              total_users: employees.length,
              active_users: activeEmployees,
              total_documents: 0,
              total_admins: 0,
              total_incidents: 0,
              new_users_week: 0,
              new_incidents_week: 0
            });
          }
        }
      } catch (fallbackErr) {
        console.warn('Fallback employee fetch failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCompanyInfo = async () => {
      await loadStats();
      
      if (user) {
        const company = user.company_name || 
                        user.companyName || 
                        user.company?.name ||
                        user.company?.company_name ||
                        null;
        
        if (company) {
          setCompanyName(company);
        } else {
          setCompanyName('Admin Dashboard');
        }

        const companyId = user.company_id || user.company?.id || null;
        
        if (companyId) {
          const logo = await fetchCompanyLogo(companyId);
          if (logo) {
            setCompanyLogo(logo);
          } else {
            const userLogo = user.company_logo || 
                           user.companyLogo || 
                           user.company?.logo ||
                           user.company?.logo_url ||
                           user.logo ||
                           null;
            if (userLogo) {
              setCompanyLogo(getFullLogoUrl(userLogo));
            }
          }
        } else {
          const logo = user.company_logo || 
                      user.companyLogo || 
                      user.company?.logo ||
                      user.company?.logo_url ||
                      user.logo ||
                      null;
          if (logo) {
            setCompanyLogo(getFullLogoUrl(logo));
          }
        }
      } else {
        setCompanyName('Admin Dashboard');
      }
    };

    loadCompanyInfo();
  }, [user]);

  const handleLogoUpdate = (newLogo) => {
    if (newLogo) {
      const fullLogoUrl = getFullLogoUrl(newLogo);
      setCompanyLogo(fullLogoUrl);
    } else {
      setCompanyLogo(null);
    }
    setShowLogoModal(false);
    message.success('Company logo updated successfully!');
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.total_users || 0,
      icon: <UserOutlined />,
      color: '#1890ff',
      bgColor: '#e6f7ff'
    },
    {
      title: 'Active Users',
      value: stats.active_users || 0,
      icon: <TeamOutlined />,
      color: '#52c41a',
      bgColor: '#f6ffed'
    },
    {
      title: 'Documents',
      value: stats.total_documents || 0,
      icon: <FileTextOutlined />,
      color: '#faad14',
      bgColor: '#fffbe6'
    }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <Spin size="large" />
          <Text type="secondary">Loading dashboard...</Text>
        </div>
      </div>
    );
  }

   return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          {/* ✅ LOGO SECTION - NO EDIT BUTTON */}
          <div className="header-logo">
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt={companyName} 
                className="logo-image" 
              />
            ) : (
              <div className="logo-placeholder">
                <BookOutlined />
              </div>
            )}
          </div>
          
          <div>
            <h1 style={{ margin: 0 }}>
              {companyName || 'Admin Dashboard'}
            </h1>
            <p style={{ margin: 0, color: '#666' }}>
              <BookOutlined style={{ marginRight: 4 }} />
              Manage your organization's safety platform
              {user?.user_type === 'admin' && <Tag color="blue" style={{ marginLeft: 8 }}>Admin</Tag>}
            </p>
          </div>
        </div>
        <div className="header-right">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadStats}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Logo Upload Modal */}
      <Modal
        title="Update Company Logo"
        open={showLogoModal}
        onCancel={() => setShowLogoModal(false)}
        footer={null}
        width={600}
      >
        <CompanyLogoUpload
          currentLogo={companyLogo}
          companyName={companyName}
          companyId={user?.company_id}
          onLogoUpdate={handleLogoUpdate}
        />
      </Modal>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          className="dashboard-alert"
          action={
            <Button size="small" type="primary" onClick={loadStats}>
              Retry
            </Button>
          }
        />
      )}

      {/* Stats */}
      <Row gutter={[16, 16]} className="stats-row">
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card className="stat-card" style={{ background: stat.bgColor }}>
              <div className="stat-content">
                <div className="stat-icon" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <div className="stat-title">{stat.title}</div>
                  <div className="stat-value" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Card className="quick-actions-card" title="Quick Actions">
        <Row gutter={[16, 16]}>
          {[
            { key: 'employees', icon: <TeamOutlined />, label: 'Employees' },
            { key: 'users', icon: <UserAddOutlined />, label: 'Users' },
            { key: 'permissions', icon: <SafetyCertificateOutlined />, label: 'Permissions' },
            { key: 'logs', icon: <AuditOutlined />, label: 'Audit Logs' }
          ].map(action => (
            <Col xs={6} sm={6} md={6} key={action.key}>
              <div 
                className={`quick-action-btn ${activeTab === action.key ? 'active' : ''}`}
                onClick={() => setActiveTab(action.key)}
                style={{ cursor: 'pointer', textAlign: 'center', padding: '12px' }}
              >
                {action.icon}
                <span style={{ display: 'block', marginTop: 4 }}>{action.label}</span>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Main Content */}
      <Card className="main-content-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="middle"
          className="dashboard-tabs"
        >
          <TabPane 
            tab={<span><TeamOutlined /> Employees</span>} 
            key="employees"
          >
            <EmployeeManagement />
          </TabPane>

          <TabPane 
            tab={<span><UserAddOutlined /> Users</span>} 
            key="users"
          >
            <UserManagement />
          </TabPane>

          <TabPane 
            tab={<span><SettingOutlined /> Permissions</span>} 
            key="permissions"
          >
            <PermissionManager />
          </TabPane>

          <TabPane 
            tab={<span><AuditOutlined /> Audit Logs</span>} 
            key="logs"
          >
            <AuditLogs />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminDashboard;