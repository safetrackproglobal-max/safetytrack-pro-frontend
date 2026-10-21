// src/components/PublicHeader.js
import React from 'react';
import { Layout, Button, Dropdown, Avatar } from 'antd';
import { 
  UserOutlined, LoginOutlined, UserAddOutlined, LogoutOutlined,
  ProfileOutlined, DashboardOutlined 
} from '@ant-design/icons';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import './PublicHeader.css';

// ✅ Correct path (2 dots)
import logoImage from '../assets/images/safetrack-logo.jpeg';

const { Header } = Layout;

function PublicHeader() {
  const location = useLocation();
  const history = useHistory();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const handleLogout = () => {
    logout();
    history.push('/');
  };

  const userMenuItems = [
    { key: 'profile', icon: <ProfileOutlined />, label: t('navigation.profile'), onClick: () => history.push('/profile') },
    { key: 'dashboard', icon: <DashboardOutlined />, label: t('navigation.dashboard'), onClick: () => history.push('/dashboard') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: t('navigation.logout'), danger: true, onClick: handleLogout },
  ];

  const navLinks = [
    { path: '/', label: t('navigation.home') },
    { path: '/features', label: t('navigation.features') },
    { path: '/pricing', label: t('navigation.pricing') },
    { path: '/contact', label: t('navigation.contact') },
  ];

  return (
    <Header className={`public-header ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="header-container">
        
        {/* 1. LOGO SECTION */}
        <div className="logo">
          <Link to="/" className="logo-link">
            {/* ✅ Added className="logo-img" to control the size */}
            <img src={logoImage} alt="SafeTrack Pro" className="logo-img" />
            <span className="logo-text">
              SafeTrack<span className="logo-pro">Pro</span>
            </span>
          </Link>
        </div>

        {/* 2. NAVIGATION LINKS */}
        <nav className="nav-menu">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 3. AUTH BUTTONS */}
        <div className="header-actions">
          <LanguageSelector />

          {user ? (
            <div className="auth-group">
              <Button 
                type="primary" 
                icon={<DashboardOutlined />}
                onClick={() => history.push('/dashboard')}
                className="dashboard-btn"
              >
                {t('navigation.dashboard')}
              </Button>
              
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                <div className="user-avatar">
                  <Avatar size="default" icon={<UserOutlined />} src={user?.avatar} style={{ backgroundColor: '#1890ff' }} />
                  <span className="user-name">{user?.name || user?.email?.split('@')[0]}</span>
                </div>
              </Dropdown>
            </div>
          ) : (
            <div className="auth-group">
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
            </div>
          )}
        </div>
        
      </div>
    </Header>
  );
}

export default PublicHeader;
