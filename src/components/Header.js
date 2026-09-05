// src/components/DashboardHeader/DashboardHeader.js
import React from 'react';
import { Layout, Button, Dropdown, Avatar, Badge, Space, Menu } from 'antd';
import { 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined,
  MenuOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  ProfileOutlined,
  SafetyCertificateOutlined,
  ExperimentOutlined,
  TruckOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext'; // Fixed import - use the named export
import { useHistory, useLocation } from 'react-router-dom';
import './DashboardHeader.css';

const { Header } = Layout;

function DashboardHeader({ onMenuToggle, userType = 'user', userModule = 'hse' }) {
  const { user, logout } = useAuth(); // Fixed - use the useAuth hook
  const history = useHistory();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Profile',
      onClick: () => history.push('/profile')
    },
    {
      key: 'settings',
      icon: <UserOutlined />,
      label: 'Settings',
      onClick: () => history.push('/settings')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Enhanced navigation with all modules
  const navigationItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/hse-management',
      icon: <SafetyCertificateOutlined />,
      label: 'HSE Management',
    },
    {
      key: '/environmental-management',
      icon: <EnvironmentOutlined />,
      label: 'Environmental',
    },
    {
      key: '/hospital-management',
      icon: <MedicineBoxOutlined />,
      label: 'Hospital',
    }
  ];

  return (
    <Header className="dashboard-header" role="banner">
      <div className="header-left">
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          className="menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        />
        
        {/* Enhanced Navigation Tabs */}
        <Space className="dashboard-nav">
          {navigationItems.map(item => (
            <Button
              key={item.key}
              type={location.pathname.startsWith(item.key) ? 'primary' : 'text'}
              icon={item.icon}
              onClick={() => history.push(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </Space>
      </div>
      
      <div className="header-right">
        <Badge count={5} size="small" className="notification-badge">
          <Button 
            type="text" 
            icon={<BellOutlined />} 
            className="notification-bell"
            onClick={() => history.push('/notifications')}
            aria-label="View notifications"
          />
        </Badge>
        
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <div className="user-profile" role="button" tabIndex={0}>
            <Avatar 
              size="default" 
              icon={<UserOutlined />} 
              src={user?.avatar}
              alt={`${user?.name || 'User'} avatar`}
            />
            <span className="user-name">
              {user?.name || user?.email || 'User'}
            </span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}

export default DashboardHeader;