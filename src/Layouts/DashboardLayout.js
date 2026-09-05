// src/layouts/DashboardLayout.js - Quick Nav Bar REMOVED

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

  // Check if mobile - DO NOT auto-open sidebar
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

  // Toggle sidebar - ONLY when button is clicked
  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Close mobile sidebar
  const closeMobileSidebar = () => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
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

  // Determine sidebar position
  const getSidebarLeft = () => {
    if (isMobile) {
      return mobileOpen ? 0 : -280;
    }
    return collapsed ? -80 : 0;
  };

  // Determine content margin
  const getContentMargin = () => {
    if (isMobile) {
      return 0;
    }
    return collapsed ? 80 : 280;
  };

  const sidebarLeft = getSidebarLeft();
  const contentMargin = getContentMargin();

  return (
    <Layout className="dashboard-layout">
      {/* Sidebar */}
      <Sider 
        key={sidebarKey}
        trigger={null} 
        collapsible 
        collapsed={isMobile ? false : collapsed}
        className={`dashboard-sider ${isMobile ? 'mobile-sider' : ''}`}
        width={280}
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          position: 'fixed',
          left: sidebarLeft,
          top: 0,
          height: '100vh',
          zIndex: isMobile ? 1001 : 1000,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'block',
          background: '#ffffff',
          overflow: 'hidden',
          boxShadow: isMobile ? '2px 0 12px rgba(0, 0, 0, 0.15)' : '2px 0 8px rgba(0, 0, 0, 0.06)',
          borderRight: '1px solid #e8e8e8'
        }}
      >
        <Sidebar 
          collapsed={isMobile ? false : collapsed}
          userType={user?.role || user?.user_type || 'user'}
          userModule={user?.module || 'hse'}
          currentPath={location.pathname}
          onNavigate={closeMobileSidebar}
          onClose={closeMobileSidebar}
          mobileOpen={mobileOpen}
        />
      </Sider>
      
      {/* Content Layout */}
      <Layout 
        className={`dashboard-content-layout ${collapsed ? 'collapsed' : ''}`}
        style={{
          marginLeft: isMobile ? 0 : contentMargin,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: isMobile ? '100%' : `calc(100% - ${contentMargin}px)`,
          minHeight: '100vh',
          background: '#f0f2f5'
        }}
      >
        <DashboardHeader 
          onMenuToggle={handleMenuToggle} 
          sidebarCollapsed={collapsed}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
        />
        
        {/* ✅ QUICK NAV BAR REMOVED - Nothing here now */}
        
        <Content className="dashboard-main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </Content>
      </Layout>
      
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={closeMobileSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            animation: 'fadeInOverlay 0.3s ease'
          }}
        />
      )}
    </Layout>
  );
}

export default DashboardLayout;