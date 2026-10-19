// src/layouts/DashboardLayout.js

import React, { useState, useEffect } from 'react';
import { Layout, Spin, Alert, Button } from 'antd';
import { useLocation, useHistory } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const { Content } = Layout;

function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const { user, loading, isSuperAdmin, isRegularAdmin, isEmployee } = useAuth();

  const getDashboardPath = () => {
    if (isSuperAdmin()) return '/safetypro/dashboard';
    if (isRegularAdmin()) return '/admin/dashboard';
    if (isEmployee()) return '/employee/dashboard';
    return '/user/dashboard';
  };

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

  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

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
          action={<Button size="small" onClick={() => history.push('/login')}>Login Now</Button>}
        />
      </div>
    );
  }

  // Determine classes based on state
  const sidebarClass = isMobile 
    ? `sidebar-mobile ${mobileOpen ? 'open' : ''}` 
    : `sidebar-desktop ${collapsed ? 'collapsed' : ''}`;

  const contentClass = isMobile 
    ? 'content-mobile' 
    : `content-desktop ${collapsed ? 'collapsed' : ''}`;

  return (
    <div className="dashboard-container">
      
      {/* 1. SIDEBAR (Using a standard div for perfect fixed positioning) */}
      <aside className={`dashboard-sidebar ${sidebarClass}`}>
        <Sidebar 
          collapsed={isMobile ? false : collapsed}
          userType={user?.role || user?.user_type || 'user'}
          userModule={user?.module || 'hse'}
          currentPath={location.pathname}
          onNavigate={closeMobileSidebar}
          onClose={closeMobileSidebar}
          mobileOpen={mobileOpen}
        />
      </aside>
      
      {/* 2. MAIN CONTENT AREA */}
      <div className={`dashboard-main-area ${contentClass}`}>
        
        <DashboardHeader 
          onMenuToggle={handleMenuToggle} 
          sidebarCollapsed={collapsed}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
        />
        
        <Content className="dashboard-content-wrapper">
          <div className="content-inner">
            {children}
          </div>
        </Content>
      </div>
      
      {/* 3. MOBILE OVERLAY */}
      {isMobile && mobileOpen && (
        <div className="mobile-overlay" onClick={closeMobileSidebar} />
      )}
    </div>
  );
}

export default DashboardLayout;
