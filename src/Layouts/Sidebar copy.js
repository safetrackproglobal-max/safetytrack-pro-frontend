// src/layouts/Sidebar.js
import React from 'react';
import { Menu, Divider, Typography } from 'antd';
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
  TruckOutlined,
  ShoppingOutlined,
  ProfileOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const { Text } = Typography;

function Sidebar({ collapsed, userType, userModule, currentPath }) {
  const history = useHistory();
  const location = useLocation();
  const { logout, isSuperAdmin, isRegularAdmin, isEmployee, user } = useAuth();

  // Get the correct dashboard path based on role
  const getDashboardPath = () => {
    if (isSuperAdmin()) {
      return '/safetypro/dashboard';  // Match your existing route
    }
    if (isRegularAdmin()) {
      return '/admin/dashboard';
    }
    if (isEmployee()) {
      return '/employee/dashboard';
    }
    return '/user/dashboard';
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      history.push('/login');
    } else {
      history.push(key);
    }
  };

  // Get the dashboard path once
  const dashboardPath = getDashboardPath();

  // Common menu items for all users - using dynamic dashboard path
  const commonMenuItems = [
    {
      key: dashboardPath,
      icon: <DashboardOutlined />,
      label: 'Overview',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/ai-documents',
      icon: <FileTextOutlined />,
      label: 'AI Documents',
    },
    {
      key: '/camera-monitoring',
      icon: <CameraOutlined />,
      label: 'Camera Monitoring',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    }
  ];

  // Employee-specific menu
  const employeeMenuItems = [
    {
      key: dashboardPath,
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/incidents',
      icon: <SafetyCertificateOutlined />,
      label: 'Report Incident',
    },
    {
      key: '/tasks',
      icon: <AppstoreOutlined />,
      label: 'My Tasks',
    },
    {
      key: '/training',
      icon: <ProfileOutlined />,
      label: 'Training',
    },
    {
      key: '/camera-monitoring',
      icon: <CameraOutlined />,
      label: 'Safety Monitoring',
    }
  ];

  // Module-specific menu items
  const getModuleMenuItems = () => {
    const moduleItems = {
      hospital: [
        {
          key: '/hospital-management',
          icon: <MedicineBoxOutlined />,
          label: 'Hospital Management',
        },
        {
          key: '/medical-ai',
          icon: <AppstoreOutlined />,
          label: 'Medical AI',
        }
      ],
      hse: [
        {
          key: '/hse-management',
          icon: <SafetyCertificateOutlined />,
          label: 'HSE Management',
        },
        {
          key: '/risk-assessment',
          icon: <BarChartOutlined />,
          label: 'Risk Assessment',
        }
      ],
      environmental: [
        {
          key: '/environmental-management',
          icon: <EnvironmentOutlined />,
          label: 'Environmental',
        },
        {
          key: '/water-quality',
          icon: <AppstoreOutlined />,
          label: 'Water Quality',
        },
        {
          key: '/air-quality',
          icon: <AppstoreOutlined />,
          label: 'Air Quality',
        }
      ],
      quality: [
        {
          key: '/quality-management',
          icon: <ExperimentOutlined />,
          label: 'Quality Control',
        },
        {
          key: '/audits',
          icon: <BarChartOutlined />,
          label: 'Audits',
        }
      ],
      supplychain: [
        {
          key: '/supplychain-management',
          icon: <TruckOutlined />,
          label: 'Supply Chain Management',
        },
        {
          key: '/supplychain/suppliers',
          icon: <TeamOutlined />,
          label: 'Supplier Management',
        },
        {
          key: '/supplychain/inventory',
          icon: <ShoppingOutlined />,
          label: 'Inventory Control',
        }
      ]
    };
    return moduleItems[userModule] || [];
  };

  // Admin menu items - REMOVED User Management
  const adminMenuItems = [
    {
      key: dashboardPath,
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    ...commonMenuItems.slice(1),
    {
      type: 'divider',
    },
    // REMOVED: '/admin' User Management
    {
      key: '/subscription',
      icon: <AppstoreOutlined />,
      label: 'Subscriptions',
    },
    {
      key: '/system-settings',
      icon: <AppstoreOutlined />,
      label: 'System Settings',
    }
  ];

  const getMenuItems = () => {
    if (userType === 'employee') {
      return employeeMenuItems;
    } else if (userType === 'admin' || isRegularAdmin()) {
      return adminMenuItems;
    } else {
      // Professional users
      return [
        {
          key: dashboardPath,
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        ...commonMenuItems.slice(1),
        {
          type: 'divider',
        },
        ...getModuleMenuItems()
      ];
    }
  };

  const menuItems = getMenuItems();

  const getModuleTitle = () => {
    const titles = {
      hospital: 'Hospital Management',
      hse: 'HSE Management',
      environmental: 'Environmental Management',
      quality: 'QA/QC Management',
      supplychain: 'Supply Chain Management'
    };
    return titles[userModule] || 'Professional Tools';
  };

  // Get header title based on role
  const getHeaderTitle = () => {
    if (isSuperAdmin()) return 'Super Admin Panel';
    if (isRegularAdmin()) return 'Admin Panel';
    if (isEmployee()) return 'Employee Portal';
    if (userType === 'admin') return 'Admin Panel';
    return getModuleTitle();
  };

  return (
    <div className="sidebar">
      {!collapsed && (
        <div className="sidebar-header">
          <div className="module-title">
            <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
              {getHeaderTitle()}
            </Text>
          </div>
        </div>
      )}
      
      <Divider style={{ margin: '12px 0' }} />
      
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        items={menuItems}
        onClick={handleMenuClick}
        className="sidebar-menu"
      />
      
      <div className="sidebar-footer">
        <Menu
          mode="inline"
          items={[
            {
              key: '/profile',
              icon: <UserOutlined />,
              label: 'Profile',
            },
            {
              key: '/settings',
              icon: <AppstoreOutlined />,
              label: 'Settings',
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              danger: true,
            }
          ]}
          onClick={handleMenuClick}
          className="sidebar-footer-menu"
        />
      </div>
    </div>
  );
}

export default Sidebar;