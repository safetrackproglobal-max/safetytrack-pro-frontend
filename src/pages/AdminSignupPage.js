// src/pages/AdminSignupPage.js
import React, { useState, useContext } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Upload, 
  message, 
  Card, 
  Typography, 
  Space, 
  Divider,
  Select,
  InputNumber,
  Alert,
  Modal,
  Tag
} from 'antd';
import { 
  UploadOutlined, 
  BankOutlined, 
  UserOutlined, 
  MailOutlined, 
  LockOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  TranslationOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './AuthPages.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const industryOptions = [
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'construction', label: 'Construction' },
  { value: 'education', label: 'Education' },
  { value: 'government', label: 'Government' },
  { value: 'retail', label: 'Retail' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' },
];

const adminRoleOptions = [
  { value: 'System Administrator', label: 'System Administrator' },
  { value: 'Hospital Administrator', label: 'Hospital Administrator' },
  { value: 'IT Manager', label: 'IT Manager' },
  { value: 'Safety Director', label: 'Safety Director' },
  { value: 'Compliance Manager', label: 'Compliance Manager' },
  { value: 'Operations Manager', label: 'Operations Manager' },
];

const countryOptions = [
  // ... (same as before, keep all countries)
];

function AdminSignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [form] = Form.useForm();
  const history = useHistory();
  const { availableLanguages } = useLanguage();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: values.adminName,
        email: values.email.toLowerCase(),
        password: values.password,
        phone: values.phone,
        company_name: values.companyName,
        company_size: values.companySize,
        industry: values.industry,
        country: values.country,
        address: values.address,
        website: values.website,
        admin_role: values.adminRole,
        preferred_language: values.preferredLanguage || 'en',
        subscription_plan: 'custom_enterprise', // Fixed custom plan for all admins
        needs_approval: true, // All admin accounts require approval
        user_type: 'admin' // Important: Mark as admin user
      };

      const response = await fetch('http://localhost:5000/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Show contact modal for custom plan details
        setShowContactModal(true);
        setContactEmail(values.email);
        setContactPhone(values.phone);
        
        // Don't reset form yet, keep data for contact modal
      } else {
        setError(data.error || data.message || 'Admin registration failed. Please try again.');
        message.error(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
      message.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = () => {
    if (!contactMessage.trim()) {
      message.warning('Please enter your message or requirements');
      return;
    }

    // Send contact request to backend
    fetch('/api/contact/admin-custom-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: contactEmail,
        contactPhone,
        message: contactMessage,
        company: form.getFieldValue('companyName') || '',
        employeeCount: form.getFieldValue('companySize') || 0,
        adminRole: form.getFieldValue('adminRole') || ''
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        message.success('Admin registration complete! Our team will contact you within 24 hours for approval and plan discussion.');
        form.resetFields();
        setShowContactModal(false);
        history.push('/login');
      } else {
        message.error(data.error || 'Failed to submit contact request');
      }
    })
    .catch(() => {
      message.success('Admin registration submitted! Our team will contact you shortly.');
      form.resetFields();
      setShowContactModal(false);
      history.push('/login');
    });
  };

  const handleLoginRedirect = () => {
    history.push('/login');
  };

  const handleUserSignupRedirect = () => {
    history.push('/signup');
  };

  // Custom Plan Contact Modal
  const CustomPlanModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TeamOutlined style={{ color: '#722ed1' }} />
          <span>Custom Enterprise Plan for Administrators</span>
        </div>
      }
      visible={showContactModal}
      onCancel={() => {
        setShowContactModal(false);
        form.resetFields();
        history.push('/login');
      }}
      footer={[
        <Button key="cancel" onClick={() => {
          setShowContactModal(false);
          form.resetFields();
          history.push('/login');
        }}>
          Skip for Now
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleContactSubmit}
          style={{ background: '#722ed1', borderColor: '#722ed1' }}
        >
          Submit Requirements
        </Button>,
      ]}
      width={600}
      closable={false}
      maskClosable={false}
    >
      <div style={{ padding: '16px 0' }}>
        <Alert
          message="🎉 Registration Successful!"
          description="Your admin account has been created and is pending approval. All administrator accounts use our Custom Enterprise Plan."
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <div style={{ 
          background: '#f9f0ff', 
          padding: '16px', 
          borderRadius: '8px',
          marginBottom: 24,
          border: '1px solid #d3adf7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <CheckCircleOutlined style={{ color: '#722ed1', marginRight: 8 }} />
            <Text strong style={{ color: '#722ed1' }}>Custom Enterprise Plan Includes:</Text>
          </div>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              <Text style={{ fontSize: '13px' }}>Full administrative control & permissions</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              <Text style={{ fontSize: '13px' }}>Unlimited user management</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              <Text style={{ fontSize: '13px' }}>Advanced analytics & reporting</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              <Text style={{ fontSize: '13px' }}>Dedicated support & onboarding</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              <Text style={{ fontSize: '13px' }}>Custom integration capabilities</Text>
            </div>
          </Space>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>Next Steps:</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: '#1890ff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <div>
                <Text strong>Manual Approval:</Text>
                <Text style={{ marginLeft: 8 }}>Our team will review your application within 24 hours</Text>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: '#1890ff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <div>
                <Text strong>Custom Plan Discussion:</Text>
                <Text style={{ marginLeft: 8 }}>We'll contact you to tailor the plan to your needs</Text>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: '#1890ff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <div>
                <Text strong>Account Activation:</Text>
                <Text style={{ marginLeft: 8 }}>Full access after approval and plan confirmation</Text>
              </div>
            </div>
          </Space>
        </div>

        <Divider />

        <Title level={5} style={{ marginBottom: 16 }}>Tell Us About Your Requirements (Optional)</Title>
        <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
          Help us prepare for our call by sharing your specific needs:
        </Text>
        
        <Form layout="vertical">
          <Form.Item label="Contact Email">
            <Input 
              placeholder="Enter contact email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              prefix={<MailOutlined />}
              disabled
            />
          </Form.Item>

          <Form.Item label="Contact Phone">
            <Input 
              placeholder="Enter contact phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              prefix={<PhoneOutlined />}
            />
          </Form.Item>

          <Form.Item label="Your Requirements">
            <Input.TextArea
              rows={4}
              placeholder="Please describe your organization's needs, number of facilities, specific administrative features required, compliance requirements, etc."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Form>

        <Alert
          message="Our Contact Details"
          description={
            <div>
              <p><strong>📞 Phone:</strong> +1 (555) 123-4567 (Admin Team)</p>
              <p><strong>📧 Email:</strong> admin-enterprise@safetytrackpro.com</p>
              <p><strong>🕐 Support Hours:</strong> Mon-Fri, 9 AM - 6 PM EST</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    </Modal>
  );

  return (
    <div className="auth-container">
      <Card className="auth-card admin-signup-card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <SafetyCertificateOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 16 }} />
            <Title level={2}>Administrator Account Registration</Title>
            <Text type="secondary">All administrator accounts use our Custom Enterprise Plan</Text>
            
            <div style={{ marginTop: 16 }}>
              <Tag color="purple" style={{ fontSize: '14px', padding: '4px 12px' }}>
                <TeamOutlined /> Custom Enterprise Plan Required
              </Tag>
            </div>
          </div>

          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />
          )}

          <Alert
            message="Administrator Account Information"
            description="All administrator accounts require manual approval and come with our Custom Enterprise Plan tailored to your organization's needs."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form
            form={form}
            name="adminSignup"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            scrollToFirstError
            initialValues={{
              preferredLanguage: 'en'
            }}
          >
            {/* Personal Information */}
            <div className="form-section">
              <Title level={4}>Personal Information</Title>
              <Form.Item
                name="adminName"
                label="Administrator Name"
                rules={[{ required: true, message: 'Please enter administrator name' }]}
              >
                <Input 
                  placeholder="Full name of the administrator" 
                  prefix={<UserOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  placeholder="Professional email address" 
                  prefix={<MailOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input 
                  placeholder="+1 (555) 123-4567" 
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="adminRole"
                label="Administrator Role"
                rules={[{ required: true, message: 'Please select your role' }]}
              >
                <Select placeholder="Select your role">
                  {adminRoleOptions.map(role => (
                    <Option key={role.value} value={role.value}>
                      {role.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            {/* Organization Information */}
            <div className="form-section">
              <Title level={4}>Organization Information</Title>
              <Form.Item
                name="companyName"
                label="Organization Name"
                rules={[{ required: true, message: 'Please enter organization name' }]}
              >
                <Input 
                  placeholder="Your organization name" 
                  prefix={<BankOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="industry"
                label="Industry"
                rules={[{ required: true, message: 'Please select industry' }]}
              >
                <Select placeholder="Select your industry">
                  {industryOptions.map(industry => (
                    <Option key={industry.value} value={industry.value}>
                      {industry.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="companySize"
                label="Organization Size"
                rules={[{ required: true, message: 'Please enter organization size' }]}
              >
                <InputNumber 
                  placeholder="Number of employees" 
                  min={1}
                  max={100000}
                  style={{ width: '100%' }}
                  addonAfter="employees"
                />
              </Form.Item>

              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Please select country' }]}
              >
                <Select
                  showSearch
                  placeholder="Select your country"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {countryOptions.map(country => (
                    <Option key={country.code} value={country.name}>
                      {country.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="address"
                label="Organization Address"
              >
                <TextArea 
                  placeholder="Full organization address" 
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                name="website"
                label="Website (Optional)"
              >
                <Input 
                  placeholder="https://your-organization.com" 
                  prefix={<GlobalOutlined />}
                />
              </Form.Item>
            </div>

            {/* Language Preference */}
            <div className="form-section">
              <Title level={4}>Language & Region</Title>
              
              <Form.Item
                name="preferredLanguage"
                label="Preferred Language"
                rules={[{ required: true, message: 'Please select your preferred language' }]}
              >
                <Select
                  placeholder="Select your preferred language"
                  suffixIcon={<TranslationOutlined />}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {availableLanguages.map(lang => (
                    <Option key={lang.code} value={lang.code}>
                      <span className="language-flag">{lang.flag}</span>
                      {lang.nativeName} ({lang.name})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            {/* Security */}
            <div className="form-section">
              <Title level={4}>Security</Title>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter your password' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                  { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase, lowercase, and numbers' }
                ]}
                hasFeedback
              >
                <Input.Password 
                  placeholder="Create a strong password" 
                  prefix={<LockOutlined />}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: 'Please confirm your password' },
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
                <Input.Password 
                  placeholder="Confirm your password" 
                  prefix={<LockOutlined />}
                />
              </Form.Item>
            </div>

            {/* Plan Information (Read-only) */}
            <div className="form-section">
              <Title level={4}>Plan Information</Title>
              <div style={{ 
                background: '#f9f0ff', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #d3adf7',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <Tag color="purple" style={{ marginRight: '8px' }}>
                    <TeamOutlined /> ENTERPRISE
                  </Tag>
                  <Text strong style={{ fontSize: '16px', color: '#722ed1' }}>
                    Custom Enterprise Plan
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '12px' }}>
                  All administrator accounts require our Custom Enterprise Plan, which includes:
                </Text>
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    <Text style={{ fontSize: '13px' }}>Full administrative control & permissions</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    <Text style={{ fontSize: '13px' }}>Unlimited user & facility management</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    <Text style={{ fontSize: '13px' }}>Advanced analytics & custom reporting</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    <Text style={{ fontSize: '13px' }}>Dedicated support & onboarding</Text>
                  </div>
                </Space>
                <Alert
                  message="Manual Approval Required"
                  description="All administrator accounts require manual approval. Our team will contact you within 24 hours to discuss your custom plan."
                  type="info"
                  showIcon
                  style={{ marginTop: '16px', fontSize: '13px' }}
                />
              </div>
            </div>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
                className="admin-submit-btn"
                style={{ background: '#722ed1', borderColor: '#722ed1' }}
              >
                {loading ? 'Submitting...' : 'Register Administrator Account'}
              </Button>
            </Form.Item>
          </Form>

          <Divider>Or</Divider>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Already have an account?{' '}
              <Button type="link" onClick={handleLoginRedirect} style={{ padding: 0, color: '#722ed1' }}>
                Sign in here
              </Button>
            </Text>
            <br />
            <Text type="secondary">
              Looking for standard user account?{' '}
              <Button type="link" onClick={handleUserSignupRedirect} style={{ padding: 0, color: '#722ed1' }}>
                Create user account instead
              </Button>
            </Text>
          </div>
        </Space>
      </Card>

      <CustomPlanModal />
    </div>
  );
}

export default AdminSignupPage;