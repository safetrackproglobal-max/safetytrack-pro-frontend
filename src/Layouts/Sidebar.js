// src/layouts/Sidebar.js - COMPLETE FIXED VERSION

import React from 'react';
import { Menu, Divider, Typography, Button } from 'antd';
import { 
  DashboardOutlined,
  BarChartOutlined,
  FileTextOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  CloseOutlined,
  SettingOutlined,
  ProfileOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const { Text } = Typography;

function Sidebar({ collapsed, userType, userModule, currentPath, onNavigate, onClose, mobileOpen = false }) {
  const history = useHistory();
  const location = useLocation();
  const { logout, isSuperAdmin, isRegularAdmin, isEmployee, user } = useAuth();

  // Get the correct dashboard path based on role
  const getDashboardPath = () => {
    const actualUserType = userType || user?.user_type || user?.role || 'user';
    const actualUserTypeLower = actualUserType.toLowerCase();
    
    const isSuperAdminUser = 
      isSuperAdmin() || 
      actualUserTypeLower === 'super_admin' || 
      actualUserTypeLower === 'safetypro' || 
      actualUserTypeLower === 'safety_pro' || 
      actualUserTypeLower === 'platform_owner' ||
      user?.is_super_admin === true;

    if (isSuperAdminUser) {
      return '/safetypro/dashboard';
    }
    if (isRegularAdmin() || actualUserTypeLower === 'admin' || actualUserTypeLower === 'company_admin') {
      return '/admin/dashboard';
    }
    if (isEmployee() || actualUserTypeLower === 'employee' || actualUserTypeLower === 'staff') {
      return '/employee/dashboard';
    }
    return '/user/dashboard';
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      history.push('/login');
      return;
    }
    
    // Ensure single slash
    const targetPath = key.startsWith('/') ? key : `/${key}`;
    history.push(targetPath);
    
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const dashboardPath = getDashboardPath();

  // Define menu items with paths WITHOUT leading slashes (relative to basename)
  // If you remove basename, use leading slashes instead
  const adminMenuItems = [
    { key: dashboardPath, icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '/ai-documents', icon: <FileTextOutlined />, label: 'AI Documents' },
    { key: '/camera-monitoring', icon: <CameraOutlined />, label: 'Camera Monitoring' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
    { key: '/document-management', icon: <FolderOpenOutlined />, label: 'Document Management' },
    { type: 'divider' },
    { key: '/admin', icon: <TeamOutlined />, label: 'User Management' },
    { key: '/subscription', icon: <AppstoreOutlined />, label: 'Subscriptions' },
    { key: '/settings', icon: <SettingOutlined />, label: 'System Settings' }
  ];

  const employeeMenuItems = [
    { key: dashboardPath, icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/incidents', icon: <SafetyCertificateOutlined />, label: 'Report Incident' },
    { key: '/tasks', icon: <AppstoreOutlined />, label: 'My Tasks' },
    { key: '/training', icon: <ProfileOutlined />, label: 'Training' },
    { key: '/camera-monitoring', icon: <CameraOutlined />, label: 'Safety Monitoring' },
    { key: '/document-management', icon: <FolderOpenOutlined />, label: 'Document Management' }
  ];

  const superAdminMenuItems = [
    { key: dashboardPath, icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '/ai-documents', icon: <FileTextOutlined />, label: 'AI Documents' },
    { key: '/camera-monitoring', icon: <CameraOutlined />, label: 'Camera Monitoring' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
    { key: '/document-management', icon: <FolderOpenOutlined />, label: 'Document Management' },
    { type: 'divider' },
    { key: '/hse-management', icon: <SafetyCertificateOutlined />, label: 'HSE Management' },
    { key: '/environmental-management', icon: <EnvironmentOutlined />, label: 'Environmental' },
    { key: '/hospital-management', icon: <MedicineBoxOutlined />, label: 'Hospital' },
    { type: 'divider' },
    { key: '/admin', icon: <TeamOutlined />, label: 'User Management' },
    { key: '/subscription', icon: <AppstoreOutlined />, label: 'Subscriptions' },
    { key: '/settings', icon: <SettingOutlined />, label: 'System Settings' }
  ];

  // ✅ FIXED: Proper role detection
  const getMenuItems = () => {
    const actualUserType = userType || user?.user_type || user?.role || 'user';
    const actualUserTypeLower = actualUserType.toLowerCase();
    
    // Check Super Admin FIRST
    const isSuperAdminUser = 
      isSuperAdmin() || 
      actualUserTypeLower === 'super_admin' || 
      actualUserTypeLower === 'safetypro' || 
      actualUserTypeLower === 'safety_pro' || 
      actualUserTypeLower === 'platform_owner' ||
      user?.is_super_admin === true ||
      user?.is_platform_owner === true;

    // Then Admin
    const isRegularAdminUser = 
      isRegularAdmin() || 
      actualUserTypeLower === 'admin' || 
      actualUserTypeLower === 'company_admin' || 
      actualUserTypeLower === 'administrator';

    // Then Employee
    const isEmployeeUser = 
      isEmployee() || 
      actualUserTypeLower === 'employee' || 
      actualUserTypeLower === 'staff';

    if (isSuperAdminUser) {
      return superAdminMenuItems;
    }
    if (isRegularAdminUser) {
      return adminMenuItems;
    }
    if (isEmployeeUser) {
      return employeeMenuItems;
    }
    
    return [
      { key: dashboardPath, icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
      { key: '/ai-documents', icon: <FileTextOutlined />, label: 'AI Documents' },
      { key: '/camera-monitoring', icon: <CameraOutlined />, label: 'Camera Monitoring' },
      { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
      { key: '/document-management', icon: <FolderOpenOutlined />, label: 'Document Management' }
    ];
  };

  const menuItems = getMenuItems();

  // ✅ FIXED: Proper header title based on role
  const getHeaderTitle = () => {
    const actualUserType = userType || user?.user_type || user?.role || 'user';
    const actualUserTypeLower = actualUserType.toLowerCase();
    
    const isSuperAdminUser = 
      isSuperAdmin() || 
      actualUserTypeLower === 'super_admin' || 
      actualUserTypeLower === 'safetypro' || 
      actualUserTypeLower === 'safety_pro' || 
      actualUserTypeLower === 'platform_owner' ||
      user?.is_super_admin === true;

    const isRegularAdminUser = 
      isRegularAdmin() || 
      actualUserTypeLower === 'admin' || 
      actualUserTypeLower === 'company_admin' || 
      actualUserTypeLower === 'administrator';

    const isEmployeeUser = 
      isEmployee() || 
      actualUserTypeLower === 'employee' || 
      actualUserTypeLower === 'staff';

    if (isSuperAdminUser) {
      return 'Super Admin Panel';
    }
    if (isRegularAdminUser) {
      return 'Admin Panel';
    }
    if (isEmployeeUser) {
      return 'Employee Portal';
    }
    return 'Dashboard';
  };

  // Determine the selected key
  const getSelectedKey = () => {
    if (!menuItems || menuItems.length === 0) {
      return dashboardPath;
    }
    
    for (const item of menuItems) {
      if (item.key && (currentPath === item.key || currentPath.startsWith(item.key + '/'))) {
        return item.key;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.key && (currentPath === child.key || currentPath.startsWith(child.key + '/'))) {
            return child.key;
          }
        }
      }
    }
    return dashboardPath;
  };

  const selectedKey = getSelectedKey();

  return (
    <div className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: '#ffffff',
      color: '#1a1a1a',
      width: '100%',
      position: 'relative'
    }}>
      {/* Close Button */}
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={handleClose}
        className="sidebar-close-btn"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          color: '#ffffff',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'all 0.3s ease'
        }}
      />
      
      {/* Sidebar Header */}
      <div className="sidebar-header" style={{
        padding: collapsed ? '12px 8px' : '16px 20px',
        borderBottom: '1px solid #f0f0f0',
        background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
        flexShrink: 0,
        minHeight: collapsed ? '60px' : '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div className="module-title" style={{ textAlign: 'center', width: '100%' }}>
          <Text strong style={{ 
            color: '#ffffff', 
            fontSize: collapsed ? '14px' : '16px',
            fontWeight: 600,
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            {collapsed ? 'STP' : getHeaderTitle()}
          </Text>
        </div>
      </div>
      
      <Divider style={{ margin: '8px 0', borderColor: '#f0f0f0' }} />
      
      {/* Main Menu */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        className="sidebar-menu"
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          padding: '8px 0',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      />
      
      {/* Footer Menu */}
      <div className="sidebar-footer" style={{
        borderTop: '1px solid #f0f0f0',
        background: '#fafafa',
        padding: '8px 0',
        flexShrink: 0
      }}>
        <Menu
          mode="inline"
          items={[
            { key: '/profile', icon: <UserOutlined />, label: 'Profile' },
            { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true }
          ]}
          onClick={handleMenuClick}
          className="sidebar-footer-menu"
          style={{
            border: 'none',
            background: 'transparent'
          }}
        />
      </div>
    </div>
  );
}

export default Sidebar;