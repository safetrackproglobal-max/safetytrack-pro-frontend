// src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { apiResetPassword } from '../services/dashboardService';
import { Form, Input, Button, Alert, Card, Typography, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import './AuthPages.css';

const { Title, Text } = Typography;

function ResetPasswordPage() {
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const history = useHistory();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await apiResetPassword(token, values.newPassword);
      if (res.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => history.push('/login'), 2000);
      } else {
        setError(res.message || 'Password reset failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <Alert
            message="Invalid Reset Link"
            description="The password reset link is invalid or has expired. Please request a new reset link."
            type="error"
            showIcon
          />
          <Button 
            type="primary" 
            onClick={() => history.push('/login')}
            style={{ marginTop: 16 }}
          >
            Return to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <LockOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 16 }} />
            <Title level={2}>Reset Password</Title>
            <Text type="secondary">Enter your new password below</Text>
          </div>

          <Form
            form={form}
            name="reset-password"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter your new password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
              hasFeedback
            >
              <Input.Password 
                placeholder="Enter new password" 
                prefix={<LockOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password 
                placeholder="Confirm new password" 
                prefix={<LockOutlined />}
              />
            </Form.Item>

            {error && (
              <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
            )}

            {success && (
              <Alert message={success} type="success" showIcon style={{ marginBottom: 16 }} />
            )}

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
              >
                Reset Password
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Remember your password?{' '}
              <Button type="link" onClick={() => history.push('/login')} style={{ padding: 0 }}>
                Sign in
              </Button>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default ResetPasswordPage;