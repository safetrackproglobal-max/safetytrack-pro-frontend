// src/layouts/MainLayout.js
import React, { useState, useEffect } from 'react';
import { Spin, BackTop } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import PublicHeader from '../components/PublicHeader'; // Changed to PublicHeader
import Footer from '../components/Footer';
import './MainLayout.css';

function MainLayout({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="main-layout-loading">
        <Spin size="large" tip="Loading SafetyTrack Pro..." />
      </div>
    );
  }

  return (
    <div className="main-layout">
      <PublicHeader /> {/* Changed to PublicHeader */}
      <main className="main-content">
        {children}
      </main>
      <Footer />
      
      {/* Back to top button */}
      <BackTop>
        <div className="back-to-top">
          <ArrowUpOutlined />
        </div>
      </BackTop>
    </div>
  );
}

export default MainLayout;