// src/components/PaymentVerification.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Badge,
  Modal,
  message,
  Tooltip,
  Row,
  Col,
  Statistic,
  DatePicker,
  Descriptions,
  Divider,
  Typography,
  Alert,
  Popconfirm,
  Tabs,
  Timeline,
  Upload,
  Image
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  UploadOutlined,
  FileTextOutlined,
  MailOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  BankOutlined,
  MobileOutlined,
  WhatsAppOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import SafetyProService from '../services/safetyproservice';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// ==================== PAYMENT DETAILS MODAL ====================
const PaymentDetailsModal = ({ visible, payment, onClose, onVerify, onReject }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending');

  if (!payment) return null;

  const handleVerify = async () => {
    setLoading(true);
    try {
      await onVerify(payment.id, { notes, status: 'verified' });
      message.success('Payment verified successfully!');
      onClose();
    } catch (error) {
      message.error('Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(payment.id, { notes, status: 'rejected' });
      message.warning('Payment rejected');
      onClose();
    } catch (error) {
      message.error('Failed to reject payment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      verified: 'green',
      rejected: 'red',
      processing: 'blue'
    };
    return colors[status] || 'default';
  };

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>Payment Details</span>
          <Tag color={getStatusColor(payment.status)}>{payment.status?.toUpperCase()}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>Close</Button>,
        payment.status === 'pending' && (
          <>
            <Button key="reject" danger onClick={handleReject} loading={loading}>
              <CloseCircleOutlined /> Reject Payment
            </Button>
            <Button key="verify" type="primary" onClick={handleVerify} loading={loading}>
              <CheckCircleOutlined /> Verify Payment
            </Button>
          </>
        )
      ]}
    >
      <Tabs defaultActiveKey="details">
        <TabPane tab="Payment Details" key="details">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Payment ID">{payment.id}</Descriptions.Item>
            <Descriptions.Item label="Reference">
              <Text code>{payment.payment_reference}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="User">
              <Space>
                <UserOutlined />
                {payment.user?.name || 'Unknown'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <MailOutlined /> {payment.user?.email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                {payment.currency} {payment.amount}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Plan">
              <Tag color="blue">{payment.plan?.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              <Tag color="green">{payment.payment_method?.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Transaction ID">
              <Text code>{payment.transaction_id || 'N/A'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Submitted Date">
              <CalendarOutlined /> {moment(payment.created_at).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge status={getStatusColor(payment.status)} text={payment.status?.toUpperCase()} />
            </Descriptions.Item>
          </Descriptions>

          {payment.user_notes && (
            <>
              <Divider orientation="left">User Notes</Divider>
              <Card size="small" style={{ background: '#f9f9f9' }}>
                <Paragraph>{payment.user_notes}</Paragraph>
              </Card>
            </>
          )}

          {payment.admin_notes && (
            <>
              <Divider orientation="left">Admin Notes</Divider>
              <Card size="small" style={{ background: '#fff7e6' }}>
                <Paragraph>{payment.admin_notes}</Paragraph>
              </Card>
            </>
          )}

          {payment.receipt_url && (
            <>
              <Divider orientation="left">Payment Receipt</Divider>
              <Card>
                <Space>
                  <Image src={payment.receipt_url} alt="Receipt" width={200} />
                  <Button icon={<DownloadOutlined />}>Download</Button>
                </Space>
              </Card>
            </>
          )}
        </TabPane>

        <TabPane tab="User Details" key="user">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="User ID">{payment.user?.id}</Descriptions.Item>
            <Descriptions.Item label="Name">{payment.user?.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{payment.user?.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{payment.user?.phone || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Company">{payment.user?.company_name || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Current Plan">
              <Tag color="blue">{payment.user?.subscription_plan?.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Registered">
              {moment(payment.user?.created_at).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge status={payment.user?.is_active ? 'success' : 'default'} text={payment.user?.is_active ? 'Active' : 'Inactive'} />
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab="Actions & Notes" key="actions">
          <Card title="Verification Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input.TextArea
                rows={4}
                placeholder="Add admin notes about this payment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Space>
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleVerify} loading={loading}>
                  Verify Payment
                </Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={handleReject} loading={loading}>
                  Reject Payment
                </Button>
                <Button icon={<MailOutlined />} onClick={() => {
                  window.location.href = `mailto:${payment.user?.email}?subject=Payment Verification - ${payment.payment_reference}`;
                }}>
                  Email User
                </Button>
              </Space>
            </Space>
          </Card>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

// ==================== MAIN PAYMENT VERIFICATION COMPONENT ====================
const PaymentVerification = () => {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    method: 'all',
    plan: 'all',
    search: '',
    dateRange: null
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    totalAmount: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.method !== 'all') params.payment_method = filters.method;
      if (filters.plan !== 'all') params.plan = filters.plan;
      if (filters.search) params.search = filters.search;
      if (filters.dateRange) {
        params.from = filters.dateRange[0].format('YYYY-MM-DD');
        params.to = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await SafetyProService.getManualPayments(params);
      
      if (response.success) {
        const paymentList = response.payments || response.data?.payments || [];
        setPayments(paymentList);
        setFilteredPayments(paymentList);
        
        // Calculate stats
        const total = paymentList.length;
        const pending = paymentList.filter(p => p.status === 'pending').length;
        const verified = paymentList.filter(p => p.status === 'verified').length;
        const rejected = paymentList.filter(p => p.status === 'rejected').length;
        const totalAmount = paymentList.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        setStats({ total, pending, verified, rejected, totalAmount });
      } else {
        message.error('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      message.error('Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [refreshKey, filters.status, filters.method, filters.plan, filters.dateRange]);

  // Handle payment verification
  const handleVerifyPayment = async (paymentId, data) => {
    try {
      const response = await SafetyProService.verifyManualPayment(paymentId, data);
      if (response.success) {
        message.success('Payment verified successfully!');
        setRefreshKey(prev => prev + 1);
        return true;
      }
      throw new Error(response.error || 'Verification failed');
    } catch (error) {
      throw error;
    }
  };

  // Handle payment rejection
  const handleRejectPayment = async (paymentId, data) => {
    try {
      const response = await SafetyProService.rejectManualPayment(paymentId, data);
      if (response.success) {
        message.warning('Payment rejected');
        setRefreshKey(prev => prev + 1);
        return true;
      }
      throw new Error(response.error || 'Rejection failed');
    } catch (error) {
      throw error;
    }
  };

  // Handle bulk verification
  const handleBulkVerify = async (paymentIds) => {
    Modal.confirm({
      title: `Verify ${paymentIds.length} payments?`,
      content: 'This will mark all selected payments as verified.',
      onOk: async () => {
        try {
          const response = await SafetyProService.bulkVerifyPayments(paymentIds);
          if (response.success) {
            message.success(`${paymentIds.length} payments verified successfully!`);
            setRefreshKey(prev => prev + 1);
          } else {
            message.error('Bulk verification failed');
          }
        } catch (error) {
          message.error('Error during bulk verification');
        }
      }
    });
  };

  // Handle bulk rejection
  const handleBulkReject = async (paymentIds) => {
    Modal.confirm({
      title: `Reject ${paymentIds.length} payments?`,
      content: 'This will mark all selected payments as rejected.',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await SafetyProService.bulkRejectPayments(paymentIds);
          if (response.success) {
            message.warning(`${paymentIds.length} payments rejected`);
            setRefreshKey(prev => prev + 1);
          } else {
            message.error('Bulk rejection failed');
          }
        } catch (error) {
          message.error('Error during bulk rejection');
        }
      }
    });
  };

  // Handle sending reminder email
  const handleSendReminder = async (payment) => {
    try {
      const response = await SafetyProService.sendPaymentReminder(payment.id);
      if (response.success) {
        message.success(`Reminder sent to ${payment.user?.email}`);
      } else {
        message.error('Failed to send reminder');
      }
    } catch (error) {
      message.error('Error sending reminder');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Reference',
      dataIndex: 'payment_reference',
      key: 'reference',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.user?.name || 'Unknown'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.user?.email}</Text>
        </Space>
      )
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (_, record) => (
        <Text strong style={{ color: '#1890ff' }}>
          {record.currency} {record.amount}
        </Text>
      ),
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0)
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan) => <Tag color="blue">{plan?.toUpperCase()}</Tag>
    },
    {
      title: 'Method',
      dataIndex: 'payment_method',
      key: 'method',
      render: (method) => {
        const icons = {
          bank_transfer: <BankOutlined />,
          mobile_money: <MobileOutlined />
        };
        return (
          <Space>
            {icons[method] || <CreditCardOutlined />}
            {method?.toUpperCase().replace('_', ' ')}
          </Space>
        );
      }
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', icon: <ClockCircleOutlined /> },
          verified: { color: 'green', icon: <CheckCircleOutlined /> },
          rejected: { color: 'red', icon: <CloseCircleOutlined /> }
        };
        const config = statusConfig[status] || { color: 'default', icon: null };
        return (
          <Badge 
            status={status === 'pending' ? 'warning' : status === 'verified' ? 'success' : 'error'}
            text={status?.toUpperCase()}
          />
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => {
                setSelectedPayment(record);
                setDetailsModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Send Reminder">
                <Button 
                  icon={<MailOutlined />} 
                  size="small" 
                  onClick={() => handleSendReminder(record)}
                />
              </Tooltip>
              <Tooltip title="Verify">
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />} 
                  size="small" 
                  onClick={() => {
                    Modal.confirm({
                      title: 'Verify Payment?',
                      content: `This will mark payment ${record.payment_reference} as verified.`,
                      onOk: async () => {
                        await handleVerifyPayment(record.id, {});
                        setRefreshKey(prev => prev + 1);
                      }
                    });
                  }}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button 
                  danger 
                  icon={<CloseCircleOutlined />} 
                  size="small" 
                  onClick={() => {
                    Modal.confirm({
                      title: 'Reject Payment?',
                      content: `This will mark payment ${record.payment_reference} as rejected.`,
                      okButtonProps: { danger: true },
                      onOk: async () => {
                        await handleRejectPayment(record.id, {});
                        setRefreshKey(prev => prev + 1);
                      }
                    });
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ];

  // Row selection for bulk actions
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    getCheckboxProps: (record) => ({
      disabled: record.status !== 'pending'
    })
  };

  // Filter and search
  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (value) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const handleMethodFilter = (value) => {
    setFilters(prev => ({ ...prev, method: value }));
  };

  const handlePlanFilter = (value) => {
    setFilters(prev => ({ ...prev, plan: value }));
  };

  const handleDateRangeFilter = (dates) => {
    setFilters(prev => ({ ...prev, dateRange: dates }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'pending',
      method: 'all',
      plan: 'all',
      search: '',
      dateRange: null
    });
    setSelectedRowKeys([]);
  };

  return (
    <div className="payment-verification">
      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Payments"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Verified"
              value={stats.verified}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={stats.totalAmount}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search by reference, user, email..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={3}>
            <Select
              placeholder="Status"
              value={filters.status}
              onChange={handleStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="verified">Verified</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Col>
          <Col xs={12} md={3}>
            <Select
              placeholder="Method"
              value={filters.method}
              onChange={handleMethodFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Methods</Option>
              <Option value="bank_transfer">Bank Transfer</Option>
              <Option value="mobile_money">Mobile Money</Option>
              <Option value="paystack">Paystack</Option>
              <Option value="paypal">PayPal</Option>
            </Select>
          </Col>
          <Col xs={12} md={3}>
            <Select
              placeholder="Plan"
              value={filters.plan}
              onChange={handlePlanFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Plans</Option>
              <Option value="free">Free</Option>
              <Option value="basic">Basic</Option>
              <Option value="pro">Pro</Option>
              <Option value="enterprise">Enterprise</Option>
            </Select>
          </Col>
          <Col xs={12} md={6}>
            <Space>
              <RangePicker
                onChange={handleDateRangeFilter}
                value={filters.dateRange}
                style={{ width: '100%' }}
              />
              <Button icon={<FilterOutlined />} onClick={clearFilters}>
                Clear
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Bulk Actions */}
      {selectedRowKeys.length > 0 && (
        <Alert
          message={
            <Space>
              <span>{selectedRowKeys.length} payments selected</span>
              <Button 
                size="small" 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleBulkVerify(selectedRowKeys)}
              >
                Verify All
              </Button>
              <Button 
                size="small" 
                danger 
                icon={<CloseCircleOutlined />}
                onClick={() => handleBulkReject(selectedRowKeys)}
              >
                Reject All
              </Button>
              <Button size="small" onClick={() => setSelectedRowKeys([])}>
                Clear Selection
              </Button>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Payments Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} payments`
          }}
          scroll={{ x: 1300 }}
          size="middle"
        />
      </Card>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        visible={detailsModalVisible}
        payment={selectedPayment}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedPayment(null);
        }}
        onVerify={handleVerifyPayment}
        onReject={handleRejectPayment}
      />
    </div>
  );
};

export default PaymentVerification;