// src/components/documents/ExpirationDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Button, Space, Input, Select,
  Table, Tag, Modal, Form, message, Popconfirm, Drawer,
  Descriptions, Tabs, Timeline, Avatar, List, Badge,
  Tooltip, Progress, Switch, Empty, Spin, Alert, Divider,
  Typography, Collapse, Checkbox, Radio, DatePicker, Result
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  MailOutlined,
  BellOutlined,
  SettingOutlined,
  DashboardOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  AlertFilled,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './ExpirationDashboard.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// ============================================================
// MAIN COMPONENT
// ============================================================

const ExpirationDashboard = ({ companyId = null, embedded = false }) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiring_soon: 0,
    expired: 0,
    completed: 0
  });
  const [overdueDocs, setOverdueDocs] = useState([]);
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    assigned_to: 'all'
  });
  
  // Form
  const [form] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, overdueData] = await Promise.all([
        documentService.getExpirationStats(),
        documentService.getOverdueDocuments()
      ]);
      
      if (statsData.success) {
        setStats(statsData.stats);
      }
      
      if (overdueData.success) {
        setOverdueDocs(overdueData.overdue || []);
        setExpiringDocs(overdueData.expiring_soon || []);
      }
      
    } catch (error) {
      console.error('Failed to load expiration data:', error);
      message.error('Failed to load expiration data');
    } finally {
      setLoading(false);
    }
  };

  const handleExtendExpiry = async (values) => {
    try {
      const result = await documentService.extendDocumentExpiration(
        selectedDocument.document_id,
        values.new_expiry_date.toISOString(),
        values.reason
      );
      
      if (result.success) {
        message.success('Document expiration extended successfully');
        setExtendModalVisible(false);
        form.resetFields();
        loadData();
      }
      
    } catch (error) {
      console.error('Failed to extend expiry:', error);
      message.error(error.message || 'Failed to extend expiry');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getStatusColor = (status) => {
    const colors = {
      active: '#52c41a',
      expiring_soon: '#faad14',
      expired: '#f5222d',
      completed: '#1890ff',
      extended: '#722ed1',
      renewed: '#13c2c2'
    };
    return colors[status] || '#d9d9d9';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircleOutlined />,
      expiring_soon: <WarningOutlined />,
      expired: <CloseCircleOutlined />,
      completed: <CheckCircleOutlined />,
      extended: <CalendarOutlined />,
      renewed: <CheckCircleOutlined />
    };
    return icons[status] || <InfoCircleOutlined />;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getDaysColor = (days) => {
    if (days < 0) return '#f5222d';
    if (days <= 7) return '#faad14';
    if (days <= 30) return '#faad14';
    return '#52c41a';
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // Render Stats
  const renderStats = () => (
    <Row gutter={[16, 16]} className="expiration-stats">
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-total">
          <Statistic
            title="Total Documents"
            value={stats.total || 0}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-active">
          <Statistic
            title="Active"
            value={stats.active || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-expiring">
          <Statistic
            title="Expiring Soon"
            value={stats.expiring_soon || 0}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-expired">
          <Statistic
            title="Expired"
            value={stats.expired || 0}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-completed">
          <Statistic
            title="Completed"
            value={stats.completed || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Expiring Soon List
  const renderExpiringSoon = () => (
    <Card 
      title={
        <Space>
          <WarningOutlined style={{ color: '#faad14' }} />
          <span>Expiring Soon</span>
          <Badge count={expiringDocs.length} style={{ backgroundColor: '#faad14' }} />
        </Space>
      }
      size="small"
      extra={
        <Button 
          type="link" 
          onClick={() => setExtendModalVisible(true)}
          disabled={expiringDocs.length === 0}
        >
          Extend All
        </Button>
      }
      style={{ marginBottom: 16 }}
    >
      {expiringDocs.length > 0 ? (
        <List
          dataSource={expiringDocs}
          renderItem={(item) => {
            const days = item.days_until_expiry || 0;
            return (
              <List.Item
                actions={[
                  <Tooltip title="View Details">
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setSelectedDocument(item);
                        setDetailDrawerVisible(true);
                      }}
                    />
                  </Tooltip>,
                  <Tooltip title="Extend">
                    <Button
                      type="text"
                      size="small"
                      icon={<CalendarOutlined />}
                      onClick={() => {
                        setSelectedDocument(item);
                        setExtendModalVisible(true);
                        form.setFieldsValue({
                          new_expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        });
                      }}
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: days <= 7 ? '#fff1f0' : '#fff7e6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {days <= 7 ? 
                        <AlertFilled style={{ color: '#f5222d' }} /> : 
                        <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      }
                    </div>
                  }
                  title={
                    <Space>
                      <span>{item.document_title || `Document ${item.document_id}`}</span>
                      <Tag color={days <= 7 ? 'red' : 'orange'}>
                        {days} days left
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div>Expires: {formatDate(item.expires_at)}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        Assigned to: {item.assignee_name || 'Unassigned'}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty description="No documents expiring soon" />
      )}
    </Card>
  );

  // Render Overdue Documents
  const renderOverdue = () => (
    <Card 
      title={
        <Space>
          <CloseCircleOutlined style={{ color: '#f5222d' }} />
          <span>Overdue</span>
          <Badge count={overdueDocs.length} style={{ backgroundColor: '#f5222d' }} />
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      {overdueDocs.length > 0 ? (
        <List
          dataSource={overdueDocs}
          renderItem={(item) => {
            const days = Math.abs(item.days_until_expiry || 0);
            return (
              <List.Item
                actions={[
                  <Tooltip title="View Details">
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setSelectedDocument(item);
                        setDetailDrawerVisible(true);
                      }}
                    />
                  </Tooltip>,
                  <Tooltip title="Extend">
                    <Button
                      type="text"
                      size="small"
                      icon={<CalendarOutlined />}
                      onClick={() => {
                        setSelectedDocument(item);
                        setExtendModalVisible(true);
                        form.setFieldsValue({
                          new_expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        });
                      }}
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: '#fff1f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AlertFilled style={{ color: '#f5222d', fontSize: 20 }} />
                    </div>
                  }
                  title={
                    <Space>
                      <span style={{ color: '#f5222d' }}>{item.document_title || `Document ${item.document_id}`}</span>
                      <Tag color="red">{days} days overdue</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div>Expired: {formatDate(item.expires_at)}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        Assigned to: {item.assignee_name || 'Unassigned'}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty description="No overdue documents" />
      )}
    </Card>
  );

  // Render Extend Modal
  const renderExtendModal = () => (
    <Modal
      title={<Space><CalendarOutlined /> Extend Document Expiry</Space>}
      open={extendModalVisible}
      onCancel={() => {
        setExtendModalVisible(false);
        form.resetFields();
      }}
      footer={null}
      width={500}
    >
      {selectedDocument && (
        <div>
          <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Document">
              {selectedDocument.document_title || `Document ${selectedDocument.document_id}`}
            </Descriptions.Item>
            <Descriptions.Item label="Current Expiry">
              {formatDate(selectedDocument.expires_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedDocument.is_expired ? 'red' : 'orange'}>
                {selectedDocument.is_expired ? 'Expired' : 'Expiring Soon'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleExtendExpiry}
            initialValues={{
              new_expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }}
          >
            <Form.Item
              name="new_expiry_date"
              label="New Expiry Date"
              rules={[{ required: true, message: 'Please select new expiry date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                showTime
                disabledDate={(current) => current && current < new Date()}
              />
            </Form.Item>

            <Form.Item
              name="reason"
              label="Reason for Extension"
            >
              <Input.TextArea rows={3} placeholder="Enter reason for extension..." />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setExtendModalVisible(false);
                  form.resetFields();
                }}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Extend Expiry
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );

  // Render Detail Drawer
  const renderDetailDrawer = () => (
    <Drawer
      title={<Space><FileTextOutlined /> Document Expiration Details</Space>}
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={600}
    >
      {selectedDocument && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Document ID">
              {selectedDocument.document_id}
            </Descriptions.Item>
            <Descriptions.Item label="Title">
              {selectedDocument.document_title || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedDocument.status)}>
                {getStatusIcon(selectedDocument.status)} {selectedDocument.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Expiry Date">
              {formatDate(selectedDocument.expires_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Days Until Expiry">
              {selectedDocument.days_until_expiry !== null ? 
                <span style={{ color: getDaysColor(selectedDocument.days_until_expiry) }}>
                  {selectedDocument.days_until_expiry} days
                </span> : 
                'N/A'
              }
            </Descriptions.Item>
            <Descriptions.Item label="Assigned To">
              {selectedDocument.assignee_name || 'Unassigned'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Notification">
              {formatDate(selectedDocument.last_notification_sent)}
            </Descriptions.Item>
            <Descriptions.Item label="Notifications Sent">
              {selectedDocument.notifications_sent?.length || 0}
            </Descriptions.Item>
            {selectedDocument.extension_reason && (
              <Descriptions.Item label="Extension Reason">
                {selectedDocument.extension_reason}
              </Descriptions.Item>
            )}
            {selectedDocument.review_notes && (
              <Descriptions.Item label="Review Notes">
                {selectedDocument.review_notes}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider />

          <Space style={{ width: '100%' }}>
            <Button 
              type="primary" 
              icon={<CalendarOutlined />}
              onClick={() => {
                setDetailDrawerVisible(false);
                setExtendModalVisible(true);
                form.setFieldsValue({
                  new_expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                });
              }}
            >
              Extend Expiry
            </Button>
            <Button icon={<BellOutlined />} onClick={() => message.info('Notification sent')}>
              Send Reminder
            </Button>
          </Space>
        </div>
      )}
    </Drawer>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="expiration-dashboard" style={{ padding: embedded ? '0' : '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <CalendarOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
          <Title level={4} style={{ margin: 0 }}>Document Expiration Management</Title>
          <Badge status="processing" text="Live" />
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            Refresh
          </Button>
          <Button icon={<ExportOutlined />} onClick={() => message.info('Exporting data...')}>
            Export
          </Button>
        </Space>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      <div style={{ 
        background: 'white', 
        padding: '16px 20px', 
        borderRadius: '8px', 
        marginBottom: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input.Search
              placeholder="Search documents..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={loadData}
              allowClear
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: '100%' }}
              allowClear
              placeholder="Status"
            >
              <Option value="all">All Statuses</Option>
              <Option value="active">Active</Option>
              <Option value="expiring_soon">Expiring Soon</Option>
              <Option value="expired">Expired</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.assigned_to}
              onChange={(value) => setFilters({ ...filters, assigned_to: value })}
              style={{ width: '100%' }}
              allowClear
              placeholder="Assigned To"
            >
              <Option value="all">All Users</Option>
              <Option value="unassigned">Unassigned</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                icon={<SettingOutlined />} 
                onClick={() => message.info('Settings coming soon')}
              >
                Auto-Reminders
              </Button>
              <Badge count={overdueDocs.length} style={{ backgroundColor: '#f5222d' }}>
                <Button danger onClick={() => {
                  message.info('Showing overdue documents');
                }}>
                  Overdue
                </Button>
              </Badge>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Expiring Soon & Overdue */}
      {renderExpiringSoon()}
      {renderOverdue()}

      {/* Modals & Drawers */}
      {renderExtendModal()}
      {renderDetailDrawer()}
    </div>
  );
};

export default ExpirationDashboard;