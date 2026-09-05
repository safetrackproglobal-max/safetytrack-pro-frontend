// src/components/AuthModal.js
import React from 'react';
import { Modal, Tabs } from 'antd';
import AdminLogin from './auth/AdminLogin';
import AdminSignup from './auth/AdminSignup';
import EmployeeLogin from './auth/EmployeeLogin';
import UserLogin from '../pages/LoginPage';
import UserSignup from '../pages/SignupPage';

const { TabPane } = Tabs;

function AuthModal({ type, onClose, onSuccess }) {
  const getModalTitle = () => {
    switch(type) {
      case 'admin': return 'Admin Access';
      case 'employee': return 'Employee Login';
      case 'user': return 'User Account';
      default: return 'Authentication';
    }
  };

  const renderContent = () => {
    switch(type) {
      case 'admin':
        return (
          <Tabs defaultActiveKey="login">
            <TabPane tab="Admin Login" key="login">
              <AdminLogin onSuccess={onSuccess} />
            </TabPane>
            <TabPane tab="Admin Signup" key="signup">
              <AdminSignup onSuccess={onSuccess} />
            </TabPane>
          </Tabs>
        );
      
      case 'employee':
        return <EmployeeLogin onSuccess={onSuccess} />;
      
      case 'user':
        return (
          <Tabs defaultActiveKey="login">
            <TabPane tab="User Login" key="login">
              <UserLogin onSuccess={onSuccess} />
            </TabPane>
            <TabPane tab="User Signup" key="signup">
              <UserSignup onSuccess={onSuccess} />
            </TabPane>
          </Tabs>
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal
      title={getModalTitle()}
      open={!!type}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      {renderContent()}
    </Modal>
  );
}

export default AuthModal;