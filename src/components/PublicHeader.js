// src/components/PublicHeader.js
import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Dropdown, Avatar } from 'antd';
import { 
  UserOutlined,
  SafetyCertificateOutlined,
  LoginOutlined,
  UserAddOutlined,
  LogoutOutlined,
  ProfileOutlined,
  DashboardOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import './PublicHeader.css';

const { Header } = Layout;

function PublicHeader() {
  const [current, setCurrent] = useState('home');
  const location = useLocation();
  const history = useHistory();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();

  // Update current menu item based on location
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/') setCurrent('home');
    else if (path.includes('/features')) setCurrent('features');
    else if (path.includes('/pricing')) setCurrent('pricing');
    else if (path.includes('/contact')) setCurrent('contact');
    else if (path.includes('/dashboard')) setCurrent('dashboard');
    else if (path.includes('/profile')) setCurrent('profile');
  }, [location]);

  const handleMenuClick = (e) => {
    setCurrent(e.key);
  };

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  // User menu items with translations
  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: t('navigation.profile'),
      onClick: () => history.push('/profile')
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: t('navigation.dashboard'),
      onClick: () => history.push('/dashboard')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('navigation.logout'),
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Navigation menu items with translations
  const menuItems = [
    {
      key: 'home',
      label: <Link to="/">{t('navigation.home')}</Link>,
    },
    {
      key: 'features',
      label: <Link to="/features">{t('navigation.features')}</Link>,
    },
    {
      key: 'pricing',
      label: <Link to="/pricing">{t('navigation.pricing')}</Link>,
    },
    {
      key: 'contact',
      label: <Link to="/contact">{t('navigation.contact')}</Link>,
    }
  ];

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return t('common.user');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <Header className={`public-header ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              <SafetyCertificateOutlined />
            </div>
            <span className="logo-text">
              SafeTrack <span className="logo-pro">Pro</span>
            </span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <Menu 
          mode="horizontal" 
          selectedKeys={[current]} 
          onClick={handleMenuClick}
          className="nav-menu"
          items={menuItems}
        />

        {/* Auth Buttons / User Menu */}
        <div className="header-actions">
          <Space size="middle" wrap>
            {/* Language Selector */}
            <LanguageSelector />

            {user ? (
              <>
                <Button 
                  type="primary" 
                  icon={<DashboardOutlined />}
                  onClick={() => history.push('/dashboard')}
                  className="dashboard-btn"
                >
                  {t('navigation.dashboard')}
                </Button>
                <Dropdown
                  menu={{ items: userMenuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                  overlayClassName="user-dropdown"
                >
                  <div className="user-avatar" role="button" tabIndex={0}>
                    <Avatar 
                      size="default" 
                      icon={<UserOutlined />} 
                      src={user?.avatar}
                      alt={`${getUserDisplayName()} avatar`}
                      style={{ backgroundColor: '#1890ff' }}
                    >
                      {!user?.avatar && getUserInitials()}
                    </Avatar>
                    <span className="user-name">
                      {getUserDisplayName()}
                    </span>
                  </div>
                </Dropdown>
              </>
            ) : (
              <>
                <Button 
                  type="text" 
                  icon={<LoginOutlined />}
                  onClick={() => history.push('/login')}
                  className="login-btn"
                >
                  {t('navigation.login')}
                </Button>
                <Button 
                  type="primary" 
                  icon={<UserAddOutlined />}
                  onClick={() => history.push('/signup')}
                  className="signup-btn"
                >
                  {t('navigation.signup')}
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>
    </Header>
  );
}

export default PublicHeader;