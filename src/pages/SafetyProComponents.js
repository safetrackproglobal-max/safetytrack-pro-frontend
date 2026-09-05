// src/pages/SafetyProComponents.js
import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  DatePicker,
  Modal,
  message,
  Badge,
  Progress,
  Tooltip,
  Alert,
  Form,
  Checkbox,
  Typography,
  Divider,
  Tabs,
  Avatar,
  Drawer,
  Skeleton,
  Empty,
  List,
  Timeline,
  Descriptions,
  Radio,
  Popconfirm
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  BuildOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  FilterOutlined,
  ExportOutlined,
  ReloadOutlined,
  TeamOutlined,
  DashboardOutlined,
  PlusOutlined,
  UserAddOutlined,
  SettingOutlined,
  BarChartOutlined,
  EyeOutlined,
  RocketOutlined,
  HeartOutlined,
  RiseOutlined,
  FallOutlined,
  ApiOutlined,
  CloudOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  DownloadOutlined,
  StopOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import SafetyProService from '../services/safetyproservice';
import ApprovalActions from './ApprovalActions';
import StatsOverview from './StatsOverview';
import CSVUserUpload from '../components/CSVUserUpload';
import api, { apiGet, apiPost } from '../services/api';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// ==================== CONSTANTS ====================
export const PLAN_OPTIONS = [
  { value: 'free', label: 'Free', color: 'default', price: 0, features: ['Basic access', '5 uploads/month'] },
  { value: 'basic', label: 'Basic', color: 'blue', price: 29, features: ['100 uploads/month', 'Basic analytics', 'Email support'] },
  { value: 'pro', label: 'Professional', color: 'purple', price: 79, features: ['500 uploads/month', 'Advanced analytics', 'Priority support', 'API access'] },
  { value: 'enterprise', label: 'Enterprise', color: 'gold', price: 'Custom', features: ['Unlimited everything', 'Dedicated support', 'SLA', 'Custom features'] }
];

export const BILLING_CYCLES = [
  { value: '1_month', label: 'Monthly' },
  { value: '6_month', label: '6 Months', discount: 10 },
  { value: '1_year', label: 'Yearly', discount: 20 }
];

// ==================== USER UPGRADE MODAL ====================
export const UserUpgradeModal = ({ visible, user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(user?.subscription_plan || 'free');
  const [billingCycle, setBillingCycle] = useState('1_month');
  const [customPrice, setCustomPrice] = useState(null);
  const [prorate, setProrate] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const payload = {
        user_id: user.id,
        new_plan: selectedPlan,
        billing_cycle: billingCycle,
        prorate: prorate,
        send_notification: sendNotification,
        admin_notes: adminNotes,
        custom_price: customPrice || undefined
      };

      const response = await SafetyProService.upgradeUserPlan(payload);
      
      if (response.success) {
        message.success(`✅ User ${user.name} upgraded to ${selectedPlan} plan successfully`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        message.error('Failed to upgrade user: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      message.error('Failed to process upgrade');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanDetails = PLAN_OPTIONS.find(p => p.value === selectedPlan);
  const selectedCycle = BILLING_CYCLES.find(c => c.value === billingCycle);

  return (
    <Modal
      title={
        <Space>
          <RocketOutlined style={{ color: '#1890ff' }} />
          <span>Upgrade User Plan: {user?.name}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleUpgrade} icon={<RocketOutlined />}>
          Process Upgrade
        </Button>
      ]}
    >
      <Descriptions bordered size="small" style={{ marginBottom: 24 }}>
        <Descriptions.Item label="User" span={3}>{user?.name}</Descriptions.Item>
        <Descriptions.Item label="Email" span={3}>{user?.email}</Descriptions.Item>
        <Descriptions.Item label="Current Plan" span={3}>
          <Tag color="blue">{user?.subscription_plan?.toUpperCase()}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Current Status" span={3}>
          <Badge status={user?.is_active ? 'success' : 'default'} text={user?.is_active ? 'Active' : 'Inactive'} />
        </Descriptions.Item>
      </Descriptions>

      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Select New Plan" required>
              <Select value={selectedPlan} onChange={setSelectedPlan}>
                {PLAN_OPTIONS.map(plan => (
                  <Option key={plan.value} value={plan.value}>
                    {plan.label} {typeof plan.price === 'number' ? `- $${plan.price}/mo` : '- Custom'}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Billing Cycle" required>
              <Select value={billingCycle} onChange={setBillingCycle}>
                {BILLING_CYCLES.map(cycle => (
                  <Option key={cycle.value} value={cycle.value}>
                    {cycle.label} {cycle.discount ? `(${cycle.discount}% off)` : ''}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {selectedPlan === 'enterprise' && (
          <Form.Item label="Custom Price (Optional)">
            <Input
              type="number"
              prefix="$"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="Enter custom monthly price"
            />
            <Text type="secondary">Leave empty for standard enterprise pricing</Text>
          </Form.Item>
        )}

        <Card size="small" style={{ marginBottom: 16, background: '#f5f5f5' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Plan Price"
                value={typeof selectedPlanDetails?.price === 'number' ? selectedPlanDetails.price : 'Custom'}
                prefix="$"
                suffix={selectedCycle?.discount ? `/mo (${selectedCycle.discount}% off)` : '/mo'}
              />
            </Col>
            <Col span={12}>
              <Statistic title="Features Included" value={selectedPlanDetails?.features?.length || 0} suffix="features" />
            </Col>
          </Row>
          <div style={{ marginTop: 12 }}>
            <Text strong>Features:</Text>
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              {selectedPlanDetails?.features?.map((feature, idx) => (
                <li key={idx}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item>
              <Checkbox checked={prorate} onChange={(e) => setProrate(e.target.checked)}>
                Apply prorated charges
              </Checkbox>
              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                Calculate remaining value from current plan
              </Text>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item>
              <Checkbox checked={sendNotification} onChange={(e) => setSendNotification(e.target.checked)}>
                Send upgrade notification email
              </Checkbox>
              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                User will receive email about plan upgrade
              </Text>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Admin Notes (Optional)">
          <TextArea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Add notes about this upgrade..." />
        </Form.Item>

        <Alert
          type="info"
          message="Upgrade Effects"
          description={
            <ul style={{ marginBottom: 0 }}>
              <li>User will immediately get access to new plan features</li>
              <li>Billing will be adjusted based on the selected cycle</li>
              <li>Previous plan limitations will be removed</li>
              <li>Usage limits will reset to new plan maximums</li>
            </ul>
          }
        />
      </Form>
    </Modal>
  );
};

// ==================== USER DETAILS DRAWER ====================
export const UserDetailsDrawer = ({ visible, user, onClose, onAction }) => {
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (visible && user?.id) {
      fetchUserDetails();
    }
  }, [visible, user]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await SafetyProService.getUserDetails(user.id);
      if (response.success) {
        setUserDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan) => {
    const colors = { free: '#8c8c8c', basic: '#1890ff', pro: '#722ed1', enterprise: '#fa8c16' };
    return colors[plan?.toLowerCase()] || '#8c8c8c';
  };

  return (
    <Drawer
      title={
        <Space>
          <Avatar icon={<UserOutlined />} src={user?.avatar} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{user?.email}</div>
          </div>
        </Space>
      }
      placement="right"
      width={800}
      onClose={onClose}
      open={visible}
      footer={<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}><Button onClick={onClose}>Close</Button></div>}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Overview" key="overview">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="User ID">{user?.id}</Descriptions.Item>
              <Descriptions.Item label="Status"><Badge status={user?.is_active ? 'success' : 'default'} text={user?.is_active ? 'Active' : 'Inactive'} /></Descriptions.Item>
              <Descriptions.Item label="User Type"><Tag color={user?.user_type === 'admin' ? 'red' : 'blue'}>{user?.user_type?.toUpperCase()}</Tag></Descriptions.Item>
              <Descriptions.Item label="Verification"><Badge status={user?.email_verified ? 'success' : 'warning'} text={user?.email_verified ? 'Verified' : 'Unverified'} /></Descriptions.Item>
              <Descriptions.Item label="Plan"><Tag color={getPlanColor(user?.subscription_plan)}>{user?.subscription_plan?.toUpperCase()}</Tag></Descriptions.Item>
              <Descriptions.Item label="Billing Cycle">{user?.billing_cycle || 'Monthly'}</Descriptions.Item>
              <Descriptions.Item label="Company">{user?.company_name || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Country"><GlobalOutlined /> {user?.country || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Phone"><PhoneOutlined /> {user?.phone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Created">{new Date(user?.created_at).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="Last Active">{user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Usage Statistics</Divider>
            <Row gutter={16}>
              <Col span={8}><Statistic title="Documents" value={userDetails?.documents_count || 0} suffix="files" /></Col>
              <Col span={8}><Statistic title="API Calls" value={userDetails?.api_calls_count || 0} /></Col>
              <Col span={8}><Statistic title="Team Members" value={userDetails?.team_members_count || 0} /></Col>
            </Row>

            <Divider orientation="left">Storage Usage</Divider>
            <Progress percent={Math.min(userDetails?.storage_percentage || 0, 100)} status={userDetails?.storage_percentage > 90 ? 'exception' : 'active'} format={() => `${userDetails?.storage_used || 0}MB / ${userDetails?.storage_total || 100}MB`} />
          </TabPane>

          <TabPane tab="Activity Log" key="activity">
            <Timeline mode="left">
              {userDetails?.activity_log?.map((log, idx) => (
                <Timeline.Item key={idx} color={log.type === 'error' ? 'red' : 'blue'}>
                  <p><strong>{log.action}</strong></p>
                  <p>{log.description}</p>
                  <p style={{ fontSize: 12, color: '#999' }}>{new Date(log.timestamp).toLocaleString()}</p>
                </Timeline.Item>
              )) || <Empty description="No activity logs" />}
            </Timeline>
          </TabPane>

          <TabPane tab="Billing History" key="billing">
            <Table dataSource={userDetails?.billing_history || []} columns={[
              { title: 'Date', dataIndex: 'date', key: 'date' },
              { title: 'Amount', dataIndex: 'amount', key: 'amount' },
              { title: 'Plan', dataIndex: 'plan', key: 'plan' },
              { title: 'Status', dataIndex: 'status', key: 'status' }
            ]} size="small" pagination={false} />
          </TabPane>

          <TabPane tab="Documents" key="documents">
            <List
              dataSource={userDetails?.documents || []}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta avatar={<FileTextOutlined />} title={item.name} description={`Uploaded: ${new Date(item.uploaded_at).toLocaleDateString()}`} />
                  <Button type="link" icon={<DownloadOutlined />} size="small" />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      )}
    </Drawer>
  );
};

// ==================== BULK OPERATIONS MODAL ====================
export const BulkOperationsModal = ({ visible, onClose, onSuccess }) => {
  const [operation, setOperation] = useState('approve');
  const [plan, setPlan] = useState('basic');
  const [billingCycle, setBillingCycle] = useState('1_month');
  const [applyToAll, setApplyToAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState({
    userTypes: [],
    plans: [],
    verifiedOnly: false,
    inactiveOnly: false,
    dateRange: null
  });

  const handleExecute = async () => {
    setLoading(true);
    try {
      const payload = {
        operation,
        criteria,
        ...(operation === 'upgrade' && { targetPlan: plan, billingCycle }),
        applyToAll
      };
      const response = await SafetyProService.bulkOperation(payload);
      if (response.success) {
        message.success(`✅ Bulk operation completed: ${response.affected_count} users affected`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        message.error('Bulk operation failed: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Bulk operation error:', error);
      message.error('Failed to execute bulk operation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Bulk Operations" open={visible} onCancel={onClose} width={600} footer={[
      <Button key="cancel" onClick={onClose}>Cancel</Button>,
      <Button key="submit" type="primary" loading={loading} onClick={handleExecute} danger={operation === 'deactivate'}>Execute Operation</Button>
    ]}>
      <Form layout="vertical">
        <Form.Item label="Select Operation">
          <Radio.Group value={operation} onChange={(e) => setOperation(e.target.value)}>
            <Radio value="approve">Approve Users</Radio>
            <Radio value="activate">Activate Accounts</Radio>
            <Radio value="deactivate">Deactivate Accounts</Radio>
            <Radio value="upgrade">Upgrade Plan</Radio>
            <Radio value="downgrade">Downgrade Plan</Radio>
            <Radio value="sendEmail">Send Email</Radio>
          </Radio.Group>
        </Form.Item>

        {(operation === 'upgrade' || operation === 'downgrade') && (
          <>
            <Form.Item label="Target Plan"><Select value={plan} onChange={setPlan}>{PLAN_OPTIONS.map(p => <Option key={p.value} value={p.value}>{p.label}</Option>)}</Select></Form.Item>
            <Form.Item label="Billing Cycle"><Select value={billingCycle} onChange={setBillingCycle}>{BILLING_CYCLES.map(c => <Option key={c.value} value={c.value}>{c.label} {c.discount ? `(${c.discount}% off)` : ''}</Option>)}</Select></Form.Item>
          </>
        )}

        <Divider orientation="left">Selection Criteria</Divider>
        <Form.Item label="User Types"><Select mode="multiple" placeholder="Select user types" value={criteria.userTypes} onChange={(value) => setCriteria({ ...criteria, userTypes: value })}><Option value="user">User</Option><Option value="employee">Employee</Option><Option value="admin">Admin</Option><Option value="safetypro">SafetyPro</Option><Option value="platform_owner">Platform Owner</Option></Select></Form.Item>
        <Form.Item label="Current Plans"><Select mode="multiple" placeholder="Select current plans" value={criteria.plans} onChange={(value) => setCriteria({ ...criteria, plans: value })}>{PLAN_OPTIONS.map(p => <Option key={p.value} value={p.value}>{p.label}</Option>)}</Select></Form.Item>
        
        <Row gutter={16}>
          <Col span={12}><Form.Item><Checkbox checked={criteria.verifiedOnly} onChange={(e) => setCriteria({ ...criteria, verifiedOnly: e.target.checked })}>Verified users only</Checkbox></Form.Item></Col>
          <Col span={12}><Form.Item><Checkbox checked={criteria.inactiveOnly} onChange={(e) => setCriteria({ ...criteria, inactiveOnly: e.target.checked })}>Inactive users only</Checkbox></Form.Item></Col>
        </Row>

        <Form.Item label="Registration Date Range"><RangePicker style={{ width: '100%' }} onChange={(dates) => setCriteria({ ...criteria, dateRange: dates })} /></Form.Item>
        <Form.Item><Checkbox checked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)}>Apply to all users (ignores criteria)</Checkbox></Form.Item>
        <Alert type="warning" message="⚠️ This action will affect multiple users" description="Please review the selection criteria carefully before proceeding." />
      </Form>
    </Modal>
  );
};

// ==================== SYSTEM HEALTH CARD ====================
export const SystemHealthCard = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchHealth(); }, []);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await SafetyProService.getSystemHealth();
      if (response.success) setHealth(response.data);
    } catch (error) { console.error('Error fetching health:', error); }
    finally { setLoading(false); }
  };

  return (
    <Card title={<Space><HeartOutlined style={{ color: '#ff4d4f' }} /><span>System Health</span></Space>} extra={<Button size="small" onClick={fetchHealth} icon={<ReloadOutlined />} />} loading={loading}>
      <Row gutter={[16, 16]}>
        <Col span={12}><Statistic title="API Status" value={health?.api?.status || 'Checking'} valueStyle={{ color: health?.api?.healthy ? '#52c41a' : '#ff4d4f' }} prefix={<ApiOutlined />} /></Col>
        <Col span={12}><Statistic title="Database" value={health?.database?.status || 'Checking'} valueStyle={{ color: health?.database?.healthy ? '#52c41a' : '#ff4d4f' }} prefix={<DatabaseOutlined />} /></Col>
        <Col span={12}><Statistic title="Storage" value={`${health?.storage?.used || 0}%`} valueStyle={{ color: health?.storage?.healthy ? '#52c41a' : '#faad14' }} prefix={<CloudOutlined />} /></Col>
        <Col span={12}><Statistic title="Active Users" value={health?.active_users || 0} prefix={<TeamOutlined />} /></Col>
      </Row>
    </Card>
  );
};

// ==================== MANUAL USER CREATION COMPONENT ====================
export const ManualUserCreation = ({ onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    user_type: 'user',
    subscription_plan: 'free',
    billing_cycle: '1_month',
    country: 'default',
    currency: 'USD',
    company_name: '',
    phone: '',
    role: 'user',
    industry: 'Healthcare',
    timezone: 'UTC',
    preferred_language: 'en',
    department: '',
    password: '',
    password_confirm: '',
    send_welcome_email: true,
    admin_role: '',
    admin_level: 'standard',
    admin_tier: 'company'
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

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
    { value: 'default', label: 'Other/Default' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'GHS', label: 'Ghanaian Cedi (GHS)' },
    { value: 'QAR', label: 'Qatari Riyal (QAR)' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ 
      ...prev, 
      password, 
      password_confirm: password 
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Full name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Valid email is required');
    }
    if (!formData.user_type) errors.push('User type is required');
    if (!formData.subscription_plan) errors.push('Subscription plan is required');
    
    if (formData.password && formData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (formData.password && formData.password !== formData.password_confirm) {
      errors.push('Passwords do not match');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      message.error(errors.join(', '));
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        user_type: formData.user_type,
        subscription_plan: formData.subscription_plan,
        billing_cycle: formData.billing_cycle,
        country: formData.country,
        currency: formData.currency,
        company_name: formData.company_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        industry: formData.industry,
        timezone: formData.timezone,
        preferred_language: formData.preferred_language,
        department: formData.department.trim(),
        admin_role: formData.admin_role.trim(),
        admin_level: formData.admin_level,
        admin_tier: formData.admin_tier,
        send_welcome_email: formData.send_welcome_email,
        created_by: 'safetypro_dashboard'
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      console.log('📤 Creating user with payload:', payload);

      const response = await SafetyProService.createManualUser(payload);
      
      if (response.success || response.data?.success) {
        const userData = response.data?.user || response.user;
        setCreatedUser(userData);
        setSuccess(true);
        
        setFormData({
          name: '',
          email: '',
          user_type: 'user',
          subscription_plan: 'free',
          billing_cycle: '1_month',
          country: 'default',
          currency: 'USD',
          company_name: '',
          phone: '',
          role: 'user',
          industry: 'Healthcare',
          timezone: 'UTC',
          preferred_language: 'en',
          department: '',
          password: '',
          password_confirm: '',
          send_welcome_email: true,
          admin_role: '',
          admin_level: 'standard',
          admin_tier: 'company'
        });
        
        message.success('User created successfully!');
        if (onUserCreated) onUserCreated(userData);
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
          <UserAddOutlined />
          <span>📝 Manual User Creation</span>
        </Space>
      }
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
              <p><strong>Temporary Password:</strong> {createdUser.temporary_password ? 'Sent via email' : 'Available in response'}</p>
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
        style={{ marginBottom: 16 }}
      />

      <Form layout="vertical" onFinish={handleSubmit}>
        <Divider orientation="left">📋 Basic Information</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Full Name *" required>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Email Address *" required>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                required
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">👥 User Type & Subscription</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="User Type *" required>
              <Select
                name="user_type"
                value={formData.user_type}
                onChange={(value) => setFormData(prev => ({ ...prev, user_type: value }))}
                required
              >
                {userTypes.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Subscription Plan *" required>
              <Select
                name="subscription_plan"
                value={formData.subscription_plan}
                onChange={(value) => setFormData(prev => ({ ...prev, subscription_plan: value }))}
                required
              >
                {planOptions.map(plan => (
                  <Option key={plan.value} value={plan.value}>
                    {plan.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Billing Cycle">
              <Select
                name="billing_cycle"
                value={formData.billing_cycle}
                onChange={(value) => setFormData(prev => ({ ...prev, billing_cycle: value }))}
              >
                {billingCycles.map(cycle => (
                  <Option key={cycle.value} value={cycle.value}>
                    {cycle.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">🌍 Location & Company</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Country">
              <Select
                name="country"
                value={formData.country}
                onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
              >
                {countryOptions.map(country => (
                  <Option key={country.value} value={country.value}>
                    {country.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Currency">
              <Select
                name="currency"
                value={formData.currency}
                onChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                {currencyOptions.map(currency => (
                  <Option key={currency.value} value={currency.value}>
                    {currency.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Company Name">
              <Input
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Optional"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">📝 Additional Information</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Phone Number">
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Department">
              <Input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Optional"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Industry">
              <Select
                name="industry"
                value={formData.industry}
                onChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              >
                <Option value="Healthcare">Healthcare</Option>
                <Option value="Construction">Construction</Option>
                <Option value="Oil & Gas">Oil & Gas</Option>
                <Option value="Manufacturing">Manufacturing</Option>
                <Option value="Technology">Technology</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Role">
              <Input
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="User role"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Timezone">
              <Select
                name="timezone"
                value={formData.timezone}
                onChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
              >
                <Option value="UTC">UTC</Option>
                <Option value="America/New_York">Eastern Time</Option>
                <Option value="Europe/London">London</Option>
                <Option value="Asia/Dubai">Dubai</Option>
                <Option value="Asia/Kolkata">India</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

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
            <Form.Item label="Password">
              <Input.Password
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave empty to auto-generate"
              />
              <Text type="secondary">
                Minimum 8 characters. Leave empty for auto-generated password.
              </Text>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Confirm Password">
              <Input.Password
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Confirm password"
              />
            </Form.Item>
          </Col>
        </Row>

        {(formData.user_type === 'admin' || formData.user_type === 'safetypro' || formData.user_type === 'platform_owner') && (
          <>
            <Divider orientation="left">⚙️ Admin Settings</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Admin Role">
                  <Input
                    name="admin_role"
                    value={formData.admin_role}
                    onChange={handleChange}
                    placeholder="safetypro, hospital_admin, etc."
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Admin Level">
                  <Select
                    name="admin_level"
                    value={formData.admin_level}
                    onChange={(value) => setFormData(prev => ({ ...prev, admin_level: value }))}
                  >
                    <Option value="standard">Standard</Option>
                    <Option value="super">Super</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Admin Tier">
                  <Select
                    name="admin_tier"
                    value={formData.admin_tier}
                    onChange={(value) => setFormData(prev => ({ ...prev, admin_tier: value }))}
                  >
                    <Option value="company">Company</Option>
                    <Option value="platform">Platform</Option>
                    <Option value="system">System</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Divider orientation="left">📧 Email Settings</Divider>
        <Form.Item>
          <Checkbox
            name="send_welcome_email"
            checked={formData.send_welcome_email}
            onChange={handleChange}
          >
            Send welcome email with login details
          </Checkbox>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            User will receive an email with their login credentials and account details.
          </Text>
        </Form.Item>

        <Divider />
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              onClick={() => setFormData({
                name: '',
                email: '',
                user_type: 'user',
                subscription_plan: 'free',
                billing_cycle: '1_month',
                country: 'default',
                currency: 'USD',
                company_name: '',
                phone: '',
                role: 'user',
                industry: 'Healthcare',
                timezone: 'UTC',
                preferred_language: 'en',
                department: '',
                password: '',
                password_confirm: '',
                send_welcome_email: true,
                admin_role: '',
                admin_level: 'standard',
                admin_tier: 'company'
              })}
              disabled={loading}
            >
              Clear Form
            </Button>
            
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {loading ? 'Creating User...' : 'Create User Account'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};