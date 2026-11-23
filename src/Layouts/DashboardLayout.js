// src/layouts/DashboardLayout.js - Quick Nav Bar REMOVED

import React, { useState, useEffect } from 'react';
import { Layout, Spin, Alert, Button } from 'antd';
import { useLocation, useHistory } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const { Sider, Content } = Layout;

const MOBILE_BREAKPOINT = 992;
const SIDEBAR_PREF_KEY = 'sidebarClosed';

const readSidebarPref = () => {
  try { return localStorage.getItem(SIDEBAR_PREF_KEY) === '1'; } catch (e) { return false; }
};

function DashboardLayout({ children }) {
  // Desktop: "collapsed" = sidebar fully hidden and content uses the full width (remembered).
  // Mobile: sidebar is an overlay drawer, closed by default.
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const [collapsed, setCollapsed] = useState(readSidebarPref);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarKey, setSidebarKey] = useState(0);
  const location = useLocation();
  const history = useHistory();
  const { user, loading } = useAuth();

  // Only react when crossing the breakpoint (phone rotation, window resize) —
  // ordinary resizes no longer reopen a sidebar the user closed.
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile((prev) => {
        if (prev !== mobile) setMobileOpen(false);
        return mobile;
      });
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close the mobile drawer after navigating
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setSidebarKey(prev => prev + 1);
  }, [user]);

  // Toggle sidebar - ONLY when button is clicked
  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      const next = !collapsed;
      setCollapsed(next);
      try { localStorage.setItem(SIDEBAR_PREF_KEY, next ? '1' : '0'); } catch (e) { /* ignore */ }
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

  // One source of truth: is the sidebar visible right now?
  const sidebarOpen = isMobile ? mobileOpen : !collapsed;

  return (
    <Layout className="dashboard-layout">
      {/* Sidebar — always full width (280px); it slides out completely when closed */}
      <Sider
        key={sidebarKey}
        trigger={null}
        width={280}
        className={`dashboard-sider ${sidebarOpen ? 'is-open' : 'is-closed'} ${isMobile ? 'mobile-sider' : ''}`}
        aria-hidden={!sidebarOpen}
      >
        <Sidebar
          collapsed={false}
          userType={user?.role || user?.user_type || 'user'}
          userModule={user?.module || 'hse'}
          currentPath={location.pathname}
          onNavigate={closeMobileSidebar}
          onClose={closeMobileSidebar}
          mobileOpen={mobileOpen}
        />
      </Sider>
      
      {/* Content Layout */}
      {/* Content takes the full width whenever the sidebar is closed (and always on mobile) */}
      <Layout className={`dashboard-content-layout ${!isMobile && sidebarOpen ? 'with-sider' : 'full-width'}`}>
        <DashboardHeader
          onMenuToggle={handleMenuToggle}
          sidebarCollapsed={!sidebarOpen}
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
        <div className="mobile-sidebar-overlay" onClick={closeMobileSidebar} />
      )}
    </Layout>
  );
}

export default DashboardLayout;
