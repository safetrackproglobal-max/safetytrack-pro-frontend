// src/components/auth/AdminLogin.js
import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

function AdminLogin({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // API call for admin login
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userRole', 'admin');
        onSuccess();
        window.location.href = '/admin/dashboard';
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onFinish={handleSubmit} layout="vertical">
      <Form.Item name="adminEmail" rules={[{ required: true }]}>
        <Input prefix={<UserOutlined />} placeholder="Admin Email" />
      </Form.Item>
      <Form.Item name="adminPassword" rules={[{ required: true }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="Admin Password" />
      </Form.Item>
      {error && <Alert message={error} type="error" />}
      <Button type="primary" htmlType="submit" loading={loading} block>
        Admin Login
      </Button>
    </Form>
  );
}

export default AdminLogin;