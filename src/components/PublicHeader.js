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
import HoverNav, { NavList } from './nav/HoverNav';
import { SOLUTIONS_BY_SLUG, INDUSTRIES, COMPLIANCE_PAGES } from '../data/marketingPages';
import { MODULE_GROUPS } from '../data/homeContent';
import { TRUST_PAGES } from '../data/trustPages';
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

  const tr = (key, fallback) => t(`navigation.${key}`) || fallback;
  const page = (label, to, hint) => ({ key: to, label, to, hint });
  const guide = (path) => TRUST_PAGES.find((p) => p.path === path);
  const groups = [
    { key: 'products', label: tr('products', 'Products'), items: [
      ...MODULE_GROUPS.flatMap(([, slugs]) => slugs).map((slug) => SOLUTIONS_BY_SLUG[slug]).filter(Boolean).map((m) => page(m.name, `/${m.slug}`)),
      page(tr('features', 'Features'), '/features'),
    ] },
    { key: 'industries', label: tr('industries', 'Industries'), items: [
      ...INDUSTRIES.map((i) => page(i.name, `/industries/${i.slug}`)),
      ...COMPLIANCE_PAGES.map((c) => page(`${c.code} guide`, `/compliance/${c.slug}`)),
    ] },
    { key: 'free', label: tr('freeTools', 'Free tools'), items: [
      page('Free safety documents', '/free-safety-documents', '164 templates to edit and download'),
      page('Free CSP practice test', '/csp-practice-exam/free-test', '10 questions with explanations'),
      page('Exam and certificate guide', '/csp-practice-exam/exam-guide', guide('/csp-practice-exam/exam-guide') && 'Rules, scoring and limits'),
    ] },
    { key: 'voice', label: tr('reportConcern', 'Report a Concern'), accent: true, items: [
      page('Report now', '/voice', 'Find your company. No account needed'),
      page('Track a report', '/voice/track', 'Use your tracking code'),
      page('My reward points', '/voice/rewards', 'Open with your Reward ID'),
      page('Who sees my report?', '/anonymous-safety-reporting/how-it-works', 'Anonymous, protected or named'),
    ] },
    { key: 'trust', label: tr('trust', 'Trust'), items: [
      page('Trust centre', '/trust', 'Security and what we do not claim'),
      page('How we use your data', '/data-use', 'Photos, video, voice and text'),
      page('AI transparency', '/ai-transparency', 'What AI does and gets wrong'),
      page('Company facts', '/facts', 'Plain answers about us'),
      page('Privacy policy', '/privacy'), page('Terms', '/terms'),
    ] },
    { key: '/pricing', label: t('navigation.pricing'), to: '/pricing' },
    { key: 'company', label: tr('company', 'Company'), items: [
      page('About', '/about'), page(t('navigation.contact'), '/contact'), page('Request a demo', '/demo'), page('Support', '/info/support'),
    ] },
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
          <HoverNav className="nav-menu" groups={groups} active={location.pathname} label="Main" />

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
              aria-label="Open menu"
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
          <NavList groups={groups} active={location.pathname} onSelect={() => setMobileMenuOpen(false)} label="Main" />
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
