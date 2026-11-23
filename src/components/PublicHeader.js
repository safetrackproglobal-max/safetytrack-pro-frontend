// src/components/PublicHeader.js
import React, { useState } from 'react';
import { Layout, Button, Dropdown, Avatar, Drawer, Space } from 'antd';
import { 
  UserOutlined, LoginOutlined, UserAddOutlined, LogoutOutlined,
  ProfileOutlined, DashboardOutlined, MenuOutlined 
} from '@ant-design/icons';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import './PublicHeader.css';
import logoImage from '../assets/images/safetrack-logo.jpeg';

const { Header } = Layout;

function PublicHeader() {
  const location = useLocation();
  const history = useHistory();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  // ✅ State for mobile menu drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu when a link is clicked
  const handleNavClick = (path) => {
    history.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <Header className={`public-header ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="header-container">
          
          {/* 1. LOGO SECTION */}
          <div className="logo">
            <Link to="/" className="logo-link">
              <img src={logoImage} alt="SafeTrack Pro" className="logo-img" />
              <span className="logo-text">
                SafeTrack<span className="logo-pro">Pro</span>
              </span>
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION LINKS */}
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

          {/* 3. HEADER ACTIONS (Desktop & Mobile) */}
          <div className="header-actions">
            
            {/* Language Selector (Hidden on very small screens to save space) */}
            <div className="desktop-only">
              <LanguageSelector />
            </div>

            {user ? (
              <div className="auth-group desktop-only">
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
              <div className="auth-group desktop-only">
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

            {/* ✅ Mobile Hamburger Button (Only visible on mobile) */}
            <Button 
              type="text" 
              icon={<MenuOutlined style={{ fontSize: '20px' }} />} 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
            />
          </div>
          
        </div>
      </Header>

      {/* ✅ MOBILE MENU DRAWER */}
      <Drawer
        title={
          <div className="drawer-logo">
            <img src={logoImage} alt="Logo" className="logo-img" />
            <span>SafeTrack<span className="logo-pro">Pro</span></span>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        className="mobile-drawer"
      >
        <div className="mobile-nav-links">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => handleNavClick(link.path)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mobile-drawer-actions">
          <LanguageSelector />
          
          <hr className="drawer-divider" />

          {user ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block icon={<DashboardOutlined />} onClick={() => handleNavClick('/dashboard')}>
                Dashboard
              </Button>
              <Button block icon={<ProfileOutlined />} onClick={() => handleNavClick('/profile')}>
                Profile
              </Button>
              <Button danger block icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
              </Button>
            </Space>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="text" block icon={<LoginOutlined />} onClick={() => handleNavClick('/login')}>
                {t('navigation.login')}
              </Button>
              <Button type="primary" block icon={<UserAddOutlined />} onClick={() => handleNavClick('/signup')}>
                {t('navigation.signup')}
              </Button>
            </Space>
          )}
        </div>
      </Drawer>
    </>
  );
}

export default PublicHeader;
