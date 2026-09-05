// src/layouts/DashboardLayout.js
import React, { useState, useEffect } from 'react';
import { Layout, Spin, Alert, Button, Tooltip } from 'antd';
import { useLocation, useHistory } from 'react-router-dom';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined,
  HomeOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const { Sider, Content } = Layout;

function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarKey, setSidebarKey] = useState(0);
  const location = useLocation();
  const history = useHistory();
  const { user, loading, isSuperAdmin, isRegularAdmin, isEmployee } = useAuth();

  const getDashboardPath = () => {
    if (isSuperAdmin()) return '/safetypro/dashboard';
    if (isRegularAdmin()) return '/admin/dashboard';
    if (isEmployee()) return '/employee/dashboard';
    return '/user/dashboard';
  };

  // ✅ Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) {
        setMobileOpen(false);
        setCollapsed(true);
      } else {
        setMobileOpen(true);
        setCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setSidebarKey(prev => prev + 1);
  }, [user]);

  // ✅ Toggle sidebar - different behavior for mobile vs desktop
  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // ✅ Close mobile sidebar
  const closeMobileSidebar = () => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  };

  const handleGoToDashboard = () => {
    history.push(getDashboardPath());
    closeMobileSidebar();
  };

  const handleGoToHome = () => {
    history.push('/');
    closeMobileSidebar();
  };

  if (loading) {
    return (
      <div className="dashboard-loading-container">
        <Spin size="large" tip="Loading your dashboard..." />
        <p>Preparing your workspace</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-auth-error">
        <Alert
          message="Authentication Required"
          description="Please log in to access the dashboard."
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => history.push('/login')}>
              Login Now
            </Button>
          }
        />
      </div>
    );
  }

  const dashboardPath = getDashboardPath();
  const isDashboardHome = location.pathname === dashboardPath || location.pathname === '/';

  // ✅ Determine sidebar visibility
  const showSidebar = isMobile ? mobileOpen : true;

  return (
    <Layout className="dashboard-layout">
      {/* ✅ Sidebar - visible on mobile only when toggled */}
      <Sider 
        key={sidebarKey}
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className={`dashboard-sider ${isMobile ? 'mobile-sider' : ''} ${showSidebar ? 'mobile-sider-open' : ''}`}
        width={280}
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          position: isMobile ? 'fixed' : 'fixed',
          left: isMobile ? (showSidebar ? 0 : -280) : 0,
          height: '100vh',
          zIndex: isMobile ? 1001 : 1000,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Sidebar 
          collapsed={collapsed}
          userType={user?.role || user?.user_type || 'user'}
          userModule={user?.module || 'hse'}
          currentPath={location.pathname}
          onNavigate={closeMobileSidebar}
        />
      </Sider>
      
      <Layout className={`dashboard-content-layout ${collapsed ? 'collapsed' : ''}`}>
        <DashboardHeader 
          onMenuToggle={handleMenuToggle} 
          sidebarCollapsed={collapsed}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
        />
        
        {/* Quick Navigation Bar */}
        {!isDashboardHome && (
          <div className="quick-nav-bar">
            <div className="quick-nav-content">
              <Tooltip title="Go to Home">
                <Button 
                  type="text" 
                  icon={<HomeOutlined />} 
                  onClick={handleGoToHome}
                  className="quick-nav-btn"
                >
                  Home
                </Button>
              </Tooltip>
              
              <span className="nav-separator">/</span>
              
              <Tooltip title="Back to Dashboard">
                <Button 
                  type="text" 
                  icon={<DashboardOutlined />} 
                  onClick={handleGoToDashboard}
                  className="quick-nav-btn"
                >
                  Dashboard
                </Button>
              </Tooltip>
              
              <span className="nav-separator">/</span>
              
              <span className="current-page">
                {location.pathname.split('/').pop() || 'Current Page'}
              </span>
            </div>
          </div>
        )}
        
        <Content className="dashboard-main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </Content>
      </Layout>
      
      {/* ✅ Mobile overlay */}
      {isMobile && mobileOpen && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={closeMobileSidebar}
        />
      )}
    </Layout>
  );
}

export default DashboardLayout;