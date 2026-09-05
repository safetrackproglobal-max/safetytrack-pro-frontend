// src/components/DashboardHeader.js
import React from 'react';
import { Layout, Button, Dropdown, Avatar, Tag, Tooltip, Typography } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined,
  MenuOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  ProfileOutlined,
  SafetyCertificateOutlined,
  CameraOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  SafetyOutlined,
  MedicineBoxFilled
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import './DashboardHeader.css';

const { Header } = Layout;
const { Text } = Typography;

// Import your logo
import logoImage from '../assets/images/safetrack-logo.jpeg';

function DashboardHeader({ onMenuToggle, sidebarCollapsed, isMobile, mobileOpen }) {
  const { user, logout, isSuperAdmin, isRegularAdmin, isEmployee } = useAuth();
  const history = useHistory();
  const location = useLocation();

  const getDashboardPath = () => {
    if (isSuperAdmin()) return '/safetypro/dashboard';
    if (isRegularAdmin()) return '/admin/dashboard';
    if (isEmployee()) return '/employee/dashboard';
    return '/user/dashboard';
  };

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'My Profile',
      onClick: () => history.push('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => history.push('/settings')
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Help & Support',
      onClick: () => history.push('/help')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const navigationItems = [
    {
      key: getDashboardPath(),
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      gradient: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)'
    },
    {
      key: '/hse-management',
      icon: <SafetyCertificateOutlined />,
      label: 'HSE',
      gradient: 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)'
    },
    {
      key: '/environmental-management',
      icon: <EnvironmentOutlined />,
      label: 'Environmental',
      gradient: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)'
    },
    {
      key: '/hospital-management',
      icon: <MedicineBoxFilled />,
      label: 'Hospital',
      gradient: 'linear-gradient(135deg, #1890ff 0%, #597ef7 100%)'
    },
    {
      key: '/camera-monitoring',
      icon: <CameraOutlined />,
      label: 'Camera AI',
      gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
      badge: 'PRO'
    },
  ];

  // Show/hide navigation based on mobile
  const showNavigation = !isMobile;

  return (
    <Header className="dashboard-header">
      {/* Left Section */}
      <div className="header-left">
        <div className="brand-section">
          <Button 
            type="text" 
            icon={<MenuOutlined />} 
            className="menu-toggle"
            onClick={onMenuToggle}
            aria-label={isMobile ? (mobileOpen ? "Close menu" : "Open menu") : "Toggle sidebar"}
          />
          
          <div className="brand-logo" onClick={() => history.push(getDashboardPath())}>
            <div className="logo-wrapper">
              <img 
                src={logoImage} 
                alt="SafeTrackProGlobal" 
                className="logo-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            {/* Brand text - now visible on all devices */}
            <div className="brand-text">
              <h1 className="brand-name">
                SafeTrack<span className="brand-pro">ProGlobal</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation - hidden on mobile */}
        {showNavigation && (
          <div className="dashboard-nav">
            {navigationItems.map(item => (
              <Tooltip key={item.key} title={item.label} placement="bottom">
                <Button
                  type="text"
                  className={`nav-button ${location.pathname === item.key || location.pathname.startsWith(item.key + '/') ? 'active' : ''}`}
                  onClick={() => history.push(item.key)}
                  style={{
                    background: (location.pathname === item.key || location.pathname.startsWith(item.key + '/')) ? item.gradient : 'transparent',
                    color: (location.pathname === item.key || location.pathname.startsWith(item.key + '/')) ? '#fff' : 'inherit'
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <Tag 
                      className="nav-badge" 
                      color={item.badge === 'PRO' ? 'purple' : 'orange'}
                      size="small"
                    >
                      {item.badge}
                    </Tag>
                  )}
                </Button>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
      
      {/* Right Section */}
      <div className="header-right">
        <NotificationBell />

        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomRight"
          overlayClassName="user-dropdown"
        >
          <div className="user-profile" role="button" tabIndex={0}>
            <Avatar 
              size={38}
              icon={<UserOutlined />} 
              src={user?.avatar}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '2px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                cursor: 'pointer'
              }}
            />
            <div className="user-status" />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}

export default DashboardHeader;