// src/pages/EmployeeLogin.js
import React from 'react';
import { Form, Input, Button, Card, Row, Col, Typography } from 'antd';
import { MailOutlined, IdcardOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useHistory, Link } from 'react-router-dom';
import './AuthPages.css';

const { Title, Text } = Typography;

function EmployeeLogin() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const history = useHistory();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Employee login uses email + employee ID
      const result = await login({
        email: values.email,
        password: values.employeeId, // Employee ID is the password
        userType: 'employee'
      });

      if (result.success) {
        message.success('Login successful!');
        history.push('/employee/dashboard');
      } else {
        message.error(result.error || 'Login failed');
      }
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={22} sm={16} md={12} lg={8}>
          <Card className="auth-card">
            <div className="auth-header">
              <div className="auth-icon employee">
                <SafetyCertificateOutlined />
              </div>
              <Title level={2}>Employee Login</Title>
              <Text type="secondary">Access your safety dashboard</Text>
            </div>

            <Form
              form={form}
              name="employeeLogin"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />}
                  placeholder="your.email@company.com" 
                />
              </Form.Item>

              <Form.Item
                name="employeeId"
                label="Employee ID"
                rules={[{ required: true, message: 'Please input your Employee ID!' }]}
              >
                <Input 
                  prefix={<IdcardOutlined />}
                  placeholder="EMP001" 
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  size="large"
                >
                  Sign In as Employee
                </Button>
              </Form.Item>
            </Form>

            <div className="auth-footer">
              <Text>
                Having trouble logging in? Contact your administrator.
              </Text>
              <div style={{ marginTop: '16px' }}>
                <Link to="/login">Back to Main Login</Link>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default EmployeeLogin;