// src/components/ManualUserCreation.js
import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Divider,
  Alert,
  Row,
  Col,
  Checkbox,
  message,
  Typography
} from 'antd';
import {
  UserAddOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  LockOutlined,
  ReloadOutlined,
  SendOutlined
} from '@ant-design/icons';
import SafetyProService from '../services/safetyproservice';

const { Text } = Typography;
const { Option } = Select;

const ManualUserCreation = ({ onUserCreated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  // Options
  const userTypes = [
    { value: 'user', label: 'Regular User' },
    { value: 'employee', label: 'Employee' },
    { value: 'admin', label: 'Administrator' },
    { value: 'safetypro', label: 'SafetyPro Admin' },
    { value: 'system', label: 'System User' },
    { value: 'platform_owner', label: 'Platform Owner' }
  ];

  const planOptions = [
    { value: 'free', label: 'Free' },
    { value: 'basic', label: 'Basic' },
    { value: 'pro', label: 'Professional' },
    { value: 'enterprise', label: 'Enterprise' }
  ];

  const billingCycles = [
    { value: '1_month', label: 'Monthly' },
    { value: '6_month', label: '6 Months' },
    { value: '1_year', label: 'Yearly' }
  ];

  const countryOptions = [
    { value: 'Ghana', label: 'Ghana' },
    { value: 'Qatar', label: 'Qatar' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
    { value: 'default', label: 'Other/Default' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'GHS', label: 'Ghanaian Cedi (GHS)' },
    { value: 'QAR', label: 'Qatari Riyal (QAR)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' }
  ];

  const industryOptions = [
    'Healthcare',
    'Construction',
    'Oil & Gas',
    'Manufacturing',
    'Technology',
    'Education',
    'Transportation',
    'Hospitality',
    'Retail',
    'Financial Services',
    'Mining',
    'Aviation',
    'Maritime',
    'Chemical'
  ];

  const timezoneOptions = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ password, password_confirm: password });
    message.info('Secure password generated');
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setSuccess(false);

    try {
      // Prepare payload
      const payload = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        user_type: values.user_type,
        subscription_plan: values.subscription_plan,
        billing_cycle: values.billing_cycle || '1_month',
        country: values.country || 'default',
        currency: values.currency || 'USD',
        company_name: values.company_name?.trim() || '',
        phone: values.phone?.trim() || '',
        role: values.role || 'user',
        industry: values.industry || 'Healthcare',
        timezone: values.timezone || 'UTC',
        preferred_language: values.preferred_language || 'en',
        department: values.department?.trim() || '',
        send_welcome_email: values.send_welcome_email !== false,
        created_by: 'safetypro_dashboard'
      };

      // Add password if provided
      if (values.password) {
        payload.password = values.password;
      }

      // Add admin fields if applicable
      if (values.user_type === 'admin' || values.user_type === 'safetypro' || values.user_type === 'platform_owner') {
        payload.admin_role = values.admin_role || '';
        payload.admin_level = values.admin_level || 'standard';
        payload.admin_tier = values.admin_tier || 'company';
      }

      console.log('📤 Creating user with payload:', payload);

      const response = await SafetyProService.createManualUser(payload);

      if (response.success || response.data?.success) {
        const userData = response.data?.user || response.user;
        setCreatedUser(userData);
        setSuccess(true);
        
        // Reset form
        form.resetFields();
        form.setFieldsValue({
          user_type: 'user',
          subscription_plan: 'free',
          billing_cycle: '1_month',
          country: 'default',
          currency: 'USD',
          role: 'user',
          industry: 'Healthcare',
          timezone: 'UTC',
          preferred_language: 'en',
          send_welcome_email: true,
          admin_level: 'standard',
          admin_tier: 'company'
        });
        
        message.success('User created successfully!');
        
        // Callback if provided
        if (onUserCreated) {
          onUserCreated(userData);
        }
        
        // Auto-clear success after 10 seconds
        setTimeout(() => setSuccess(false), 10000);
      } else {
        const errorMsg = response.error || response.data?.error || 'Failed to create user';
        message.error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      message.error(error.response?.data?.error || 'An error occurred while creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <UserAddOutlined style={{ color: '#1890ff' }} />
          <span>📝 Manual User Creation</span>
        </Space>
      }
      style={{ height: '100%' }}
    >
      {success && createdUser && (
        <Alert
          type="success"
          message="✅ User Created Successfully!"
          description={
            <div>
              <p><strong>User ID:</strong> {createdUser.id}</p>
              <p><strong>Name:</strong> {createdUser.name}</p>
              <p><strong>Email:</strong> {createdUser.email}</p>
              <p><strong>Plan:</strong> {createdUser.subscription_plan} ({createdUser.subscription_status || 'active'})</p>
              <p><strong>User Type:</strong> {createdUser.user_type}</p>
              {createdUser.temporary_password && (
                <p><strong>Temporary Password:</strong> <code>{createdUser.temporary_password}</code></p>
              )}
              <p><strong>Login URL:</strong> <a href="/login">/login</a></p>
              <Text type="secondary">
                {createdUser.email_sent ? 
                  '✅ Welcome email sent to user' : 
                  '⚠️ Email not sent - password available above'}
              </Text>
            </div>
          }
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setSuccess(false)}
        />
      )}

      <Alert
        type="info"
        message="Create new users with full control over all fields"
        description="Users created here are automatically verified and can log in immediately."
        style={{ marginBottom: 16 }}
        showIcon
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          user_type: 'user',
          subscription_plan: 'free',
          billing_cycle: '1_month',
          country: 'default',
          currency: 'USD',
          role: 'user',
          industry: 'Healthcare',
          timezone: 'UTC',
          preferred_language: 'en',
          send_welcome_email: true,
          admin_level: 'standard',
          admin_tier: 'company'
        }}
      >
        {/* Basic Information */}
        <Divider orientation="left">📋 Basic Information</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter full name' }]}
            >
              <Input placeholder="John Doe" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="john.doe@example.com" size="large" prefix={<MailOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="phone" label="Phone Number">
              <Input placeholder="+1234567890" size="large" prefix={<PhoneOutlined />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="department" label="Department">
              <Input placeholder="e.g., IT, HR, Operations" size="large" />
            </Form.Item>
          </Col>
        </Row>

        {/* User Type & Subscription */}
        <Divider orientation="left">👥 User Type & Subscription</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="user_type"
              label="User Type"
              rules={[{ required: true, message: 'Please select user type' }]}
            >
              <Select size="large">
                {userTypes.map(type => (
                  <Option key={type.value} value={type.value}>{type.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="subscription_plan"
              label="Subscription Plan"
              rules={[{ required: true, message: 'Please select plan' }]}
            >
              <Select size="large">
                {planOptions.map(plan => (
                  <Option key={plan.value} value={plan.value}>{plan.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="billing_cycle" label="Billing Cycle">
              <Select size="large">
                {billingCycles.map(cycle => (
                  <Option key={cycle.value} value={cycle.value}>{cycle.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Location & Company */}
        <Divider orientation="left">🌍 Location & Company</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="country" label="Country">
              <Select size="large" showSearch>
                {countryOptions.map(country => (
                  <Option key={country.value} value={country.value}>{country.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="currency" label="Currency">
              <Select size="large">
                {currencyOptions.map(currency => (
                  <Option key={currency.value} value={currency.value}>{currency.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="company_name" label="Company Name">
              <Input placeholder="Optional" size="large" prefix={<BankOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        {/* Additional Information */}
        <Divider orientation="left">📝 Additional Information</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="industry" label="Industry">
              <Select size="large" showSearch>
                {industryOptions.map(industry => (
                  <Option key={industry} value={industry}>{industry}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="role" label="Role">
              <Input placeholder="User role" size="large" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="timezone" label="Timezone">
              <Select size="large" showSearch>
                {timezoneOptions.map(tz => (
                  <Option key={tz} value={tz}>{tz}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="preferred_language" label="Preferred Language">
              <Select size="large">
                <Option value="en">English</Option>
                <Option value="es">Spanish</Option>
                <Option value="fr">French</Option>
                <Option value="de">German</Option>
                <Option value="zh">Chinese</Option>
                <Option value="ar">Arabic</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Password Settings */}
        <Divider orientation="left">🔐 Password Settings</Divider>
        <Alert
          type="info"
          message={
            <Space>
              <span>Set a password or let the system generate one</span>
              <Button
                type="dashed"
                size="small"
                onClick={generatePassword}
                icon={<ReloadOutlined />}
              >
                Generate Secure Password
              </Button>
            </Space>
          }
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="password"
              label="Password"
              tooltip="Minimum 8 characters. Leave empty for auto-generated password."
            >
              <Input.Password placeholder="Leave empty to auto-generate" size="large" prefix={<LockOutlined />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="password_confirm"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm password" size="large" />
            </Form.Item>
          </Col>
        </Row>

        {/* Admin Settings (conditional) */}
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const userType = getFieldValue('user_type');
            if (userType === 'admin' || userType === 'safetypro' || userType === 'platform_owner') {
              return (
                <>
                  <Divider orientation="left">⚙️ Admin Settings</Divider>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="admin_role" label="Admin Role">
                        <Input placeholder="safetypro, hospital_admin, etc." size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="admin_level" label="Admin Level">
                        <Select size="large">
                          <Option value="standard">Standard</Option>
                          <Option value="super">Super</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="admin_tier" label="Admin Tier">
                        <Select size="large">
                          <Option value="company">Company</Option>
                          <Option value="platform">Platform</Option>
                          <Option value="system">System</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              );
            }
            return null;
          }}
        </Form.Item>

        {/* Email Settings */}
        <Divider orientation="left">📧 Email Settings</Divider>
        <Form.Item name="send_welcome_email" valuePropName="checked">
          <Checkbox defaultChecked>
            Send welcome email with login details
          </Checkbox>
        </Form.Item>
        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
          User will receive an email with their login credentials and account details.
        </Text>

        <Divider />
        
        {/* Form Actions */}
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => form.resetFields()} disabled={loading}>
              Clear Form
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              size="large"
            >
              {loading ? 'Creating User...' : 'Create User Account'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ManualUserCreation;