// src/components/auth/EmployeeLogin.js
import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

function EmployeeLogin({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('/api/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('employeeToken', data.token);
        localStorage.setItem('userRole', 'employee');
        onSuccess();
        window.location.href = '/employee/dashboard';
      } else {
        setError('Invalid employee credentials');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login">
      <p><strong>Employee Access</strong></p>
      <p>Use credentials provided by your administrator</p>
      
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item name="employeeId" rules={[{ required: true }]}>
          <Input prefix={<UserOutlined />} placeholder="Employee ID" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true }]}>
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>
        {error && <Alert message={error} type="error" />}
        <Button type="primary" htmlType="submit" loading={loading} block>
          Employee Login
        </Button>
      </Form>
    </div>
  );
}

export default EmployeeLogin;