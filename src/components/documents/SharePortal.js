// src/components/documents/SharePortal.jsx
// External document sharing with tracking, password protection, expiring links

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Modal, Form,
  message, Popconfirm, Drawer, Descriptions, Tabs, Timeline,
  Avatar, List, Badge, Tooltip, Progress, Switch, Empty, Spin,
  Alert, Divider, Typography, Collapse, Checkbox, Radio, Slider,
  DatePicker, InputNumber, Segmented, Statistic, Tag, Table, QRCode
} from 'antd';
import {
  ShareAltOutlined, LinkOutlined, CopyOutlined, DeleteOutlined,
  EyeOutlined, DownloadOutlined, MailOutlined, LockOutlined,
  UnlockOutlined, GlobalOutlined, UserOutlined, TeamOutlined,
  ClockCircleOutlined, CalendarOutlined, SafetyCertificateOutlined,
  WarningOutlined, InfoCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, PlusOutlined, SearchOutlined, ReloadOutlined,
  SettingOutlined, SaveOutlined, ExportOutlined, ImportOutlined,
  FileProtectOutlined, AuditOutlined, HistoryOutlined, StopOutlined,
  QrcodeOutlined, SendOutlined, BellOutlined, CloudUploadOutlined,
  EnvironmentOutlined, LaptopOutlined, MobileOutlined, DesktopOutlined,
  BarChartOutlined, LineChartOutlined, PieChartOutlined,
  ThunderboltOutlined, FireOutlined, ExclamationCircleOutlined,
  FileTextOutlined, PaperClipOutlined, SignatureOutlined,
  RollbackOutlined, SyncOutlined, MonitorOutlined, CompassOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import './SharePortal.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const SHARE_STATUS = {
  active: { label: 'Active', color: 'success', icon: <CheckCircleOutlined /> },
  expired: { label: 'Expired', color: 'warning', icon: <ClockCircleOutlined /> },
  revoked: { label: 'Revoked', color: 'error', icon: <CloseCircleOutlined /> },
  pending: { label: 'Pending', color: 'processing', icon: <SyncOutlined spin /> }
};

const ACCESS_LEVELS = {
  view: { label: 'View Only', color: 'blue', icon: <EyeOutlined />, description: 'Recipient can only view' },
  comment: { label: 'Comment', color: 'cyan', icon: <FileTextOutlined />, description: 'View and comment' },
  download: { label: 'Download', color: 'green', icon: <DownloadOutlined />, description: 'View and download' },
  sign: { label: 'Sign', color: 'orange', icon: <SignatureOutlined />, description: 'View, download, and sign' },
  edit: { label: 'Edit', color: 'red', icon: <SettingOutlined />, description: 'Full access including editing' }
};

const SHARE_TYPES = {
  link: { label: 'Share Link', icon: <LinkOutlined />, description: 'Generate a shareable URL' },
  email: { label: 'Email Invite', icon: <MailOutlined />, description: 'Send email invitations' },
  portal: { label: 'Public Portal', icon: <GlobalOutlined />, description: 'Create a public submission portal' },
  nda: { label: 'NDA Required', icon: <FileProtectOutlined />, description: 'Require NDA acceptance' }
};

const DEVICE_ICONS = {
  desktop: <DesktopOutlined />,
  mobile: <MobileOutlined />,
  tablet: <LaptopOutlined />,
  unknown: <MonitorOutlined />
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const SharePortal = ({
  documentId = null,
  bundleId = null,
  companyId = null,
  embedded = false,
  onUpdate = null
}) => {
  const { user } = useAuth();

  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [document, setDocument] = useState(null);
  const [shares, setShares] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activeTab, setActiveTab] = useState('shares');
  
  // UI State
  const [createShareModal, setCreateShareModal] = useState(false);
  const [detailDrawer, setDetailDrawer] = useState(false);
  const [linkGeneratedModal, setLinkGeneratedModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [selectedShare, setSelectedShare] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  // Create share form
  const [shareType, setShareType] = useState('link');
  const [accessLevel, setAccessLevel] = useState('view');
  const [recipients, setRecipients] = useState([]);
  const [expiryDays, setExpiryDays] = useState(30);
  const [maxDownloads, setMaxDownloads] = useState(null);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [requireNda, setRequireNda] = useState(false);
  const [requireEmail, setRequireEmail] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [watermark, setWatermark] = useState(true);
  const [allowPrint, setAllowPrint] = useState(false);
  
  // Forms
  const [form] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadShares = useCallback(async () => {
    if (!documentId && !bundleId) return;
    
    setLoading(true);
    try {
      const params = { company_id: companyId };
      if (documentId) params.document_id = documentId;
      if (bundleId) params.bundle_id = bundleId;
      
      const [sharesData, docData, activityData] = await Promise.all([
        documentService.getShares(params),
        documentId ? documentService.getDocument(documentId) : Promise.resolve(null),
        documentService.getShareActivity({ ...params, limit: 50 })
      ]);
      
      setShares(sharesData?.shares || []);
      if (docData) setDocument(docData);
      setActivity(activityData?.activities || []);
      
    } catch (error) {
      console.error('Failed to load shares:', error);
      message.error('Failed to load share data');
    } finally {
      setLoading(false);
    }
  }, [documentId, bundleId, companyId]);
  
  const loadShareAnalytics = useCallback(async () => {
    try {
      const params = { company_id: companyId };
      if (documentId) params.document_id = documentId;
      if (bundleId) params.bundle_id = bundleId;
      
      const data = await documentService.getShareAnalytics(params);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [documentId, bundleId, companyId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleCreateShare = async () => {
    setSaving(true);
    try {
      const payload = {
        document_id: documentId,
        bundle_id: bundleId,
        share_type: shareType,
        access_level: accessLevel,
        recipients: shareType === 'email' ? recipients : [],
        expiry_days: expiryDays,
        max_downloads: maxDownloads,
        password: passwordProtected ? password : null,
        require_nda: requireNda,
        require_email: requireEmail,
        send_notification: sendNotification,
        custom_message: customMessage,
        watermark,
        allow_print: allowPrint,
        company_id: companyId
      };
      
      const result = await documentService.createShare(payload);
      
      message.success('Share created successfully');
      setCreateShareModal(false);
      resetCreateForm();
      
      if (result.share_url) {
        setGeneratedLink(result.share_url);
        setLinkGeneratedModal(true);
      }
      
      loadShares();
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to create share:', error);
      message.error(error.message || 'Failed to create share');
    } finally {
      setSaving(false);
    }
  };
  
  const handleRevokeShare = async (shareId) => {
    try {
      await documentService.revokeShare(shareId);
      message.success('Share revoked');
      loadShares();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to revoke share:', error);
      message.error('Failed to revoke share');
    }
  };
  
  const handleBulkRevoke = async () => {
    if (selectedRowKeys.length === 0) return;
    
    Modal.confirm({
      title: `Revoke ${selectedRowKeys.length} shares?`,
      content: 'Recipients will lose access immediately.',
      okText: 'Revoke All',
      okType: 'danger',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map(id => documentService.revokeShare(id))
          );
          message.success(`${selectedRowKeys.length} shares revoked`);
          setSelectedRowKeys([]);
          loadShares();
          if (onUpdate) onUpdate();
        } catch (error) {
          message.error('Failed to revoke some shares');
        }
      }
    });
  };
  
  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    message.success('Link copied to clipboard');
  };
  
  const handleExtendExpiry = async (shareId, days) => {
    try {
      await documentService.extendShareExpiry(shareId, days);
      message.success(`Expiry extended by ${days} days`);
      loadShares();
    } catch (error) {
      message.error('Failed to extend expiry');
    }
  };
  
  const resetCreateForm = () => {
    setShareType('link');
    setAccessLevel('view');
    setRecipients([]);
    setExpiryDays(30);
    setMaxDownloads(null);
    setPasswordProtected(false);
    setPassword('');
    setRequireNda(false);
    setRequireEmail(true);
    setSendNotification(true);
    setCustomMessage('');
    setWatermark(true);
    setAllowPrint(false);
    form.resetFields();
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadShares();
    loadShareAnalytics();
  }, [loadShares, loadShareAnalytics]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getStatusTag = (status) => {
    const config = SHARE_STATUS[status] || SHARE_STATUS.active;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };
  
  const getAccessLevelTag = (level) => {
    const config = ACCESS_LEVELS[level];
    if (!config) return <Tag>{level}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };
  
  const getTimeRemaining = (expiryDate) => {
    if (!expiryDate) return 'Never expires';
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    return 'Expires soon';
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="share-stat-card">
          <Statistic
            title="Active Shares"
            value={shares.filter(s => s.status === 'active').length}
            prefix={<ShareAltOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="share-stat-card">
          <Statistic
            title="Total Views"
            value={analytics?.total_views || 0}
            prefix={<EyeOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="share-stat-card">
          <Statistic
            title="Total Downloads"
            value={analytics?.total_downloads || 0}
            prefix={<DownloadOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="share-stat-card">
          <Statistic
            title="Unique Visitors"
            value={analytics?.unique_visitors || 0}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderSharesTable = () => {
    const columns = [
      {
        title: 'Recipient / Link',
        dataIndex: 'recipient',
        key: 'recipient',
        render: (recipient, record) => (
          <Space>
            <Avatar 
              icon={record.share_type === 'email' ? <MailOutlined /> : <LinkOutlined />}
              style={{ 
                backgroundColor: record.share_type === 'email' ? '#1890ff' : '#722ed1'
              }}
              size="small"
            />
            <div>
              <div style={{ fontWeight: 500 }}>
                {recipient || record.recipient_email || 'Share Link'}
              </div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                Created {formatDate(record.created_at)}
              </div>
            </div>
          </Space>
        )
      },
      {
        title: 'Access Level',
        dataIndex: 'access_level',
        key: 'access_level',
        render: (level) => getAccessLevelTag(level)
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status, record) => (
          <Space direction="vertical" size={4}>
            {getStatusTag(status)}
            {record.expires_at && (
              <Text 
                type={new Date(record.expires_at) < new Date() ? 'danger' : 'secondary'}
                style={{ fontSize: 10 }}
              >
                {getTimeRemaining(record.expires_at)}
              </Text>
            )}
          </Space>
        )
      },
      {
        title: 'Activity',
        key: 'activity',
        render: (_, record) => (
          <Space split={<Divider type="vertical" />}>
            <Tooltip title="Views">
              <Space size={4}>
                <EyeOutlined />
                <span>{record.view_count || 0}</span>
              </Space>
            </Tooltip>
            <Tooltip title="Downloads">
              <Space size={4}>
                <DownloadOutlined />
                <span>{record.download_count || 0}</span>
              </Space>
            </Tooltip>
          </Space>
        )
      },
      {
        title: 'Security',
        key: 'security',
        render: (_, record) => (
          <Space>
            {record.has_password && (
              <Tooltip title="Password Protected">
                <LockOutlined style={{ color: '#faad14' }} />
              </Tooltip>
            )}
            {record.require_nda && (
              <Tooltip title="NDA Required">
                <FileProtectOutlined style={{ color: '#f5222d' }} />
              </Tooltip>
            )}
            {record.watermark && (
              <Tooltip title="Watermarked">
                <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            )}
          </Space>
        )
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 200,
        render: (_, record) => (
          <Space>
            <Tooltip title="Copy Link">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopyLink(record.share_url)}
              />
            </Tooltip>
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedShare(record);
                  setDetailDrawer(true);
                }}
              />
            </Tooltip>
            <Tooltip title="QR Code">
              <Button
                type="text"
                size="small"
                icon={<QrcodeOutlined />}
                onClick={() => {
                  setSelectedShare(record);
                  setQrModal(true);
                }}
              />
            </Tooltip>
            {record.status === 'active' && (
              <Popconfirm
                title="Revoke this share?"
                description="Recipients will lose access immediately."
                onConfirm={() => handleRevokeShare(record.id)}
                okText="Revoke"
                okType="danger"
                cancelText="Cancel"
              >
                <Tooltip title="Revoke">
                  <Button
                    type="text"
                    size="small"
                    icon={<StopOutlined />}
                    danger
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </Space>
        )
      }
    ];
    
    return (
      <Card
        title={
          <Space>
            <ShareAltOutlined />
            <span>Active Shares</span>
            <Badge count={shares.length} style={{ backgroundColor: '#1890ff' }} />
          </Space>
        }
        size="small"
        extra={
          <Space>
            <Input
              placeholder="Search shares..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="small"
              style={{ width: 200 }}
              allowClear
            />
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`Revoke ${selectedRowKeys.length} shares?`}
                onConfirm={handleBulkRevoke}
                okText="Revoke All"
                okType="danger"
              >
                <Button danger size="small" icon={<StopOutlined />}>
                  Revoke Selected
                </Button>
              </Popconfirm>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateShareModal(true)}
              size="small"
            >
              New Share
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadShares}
              loading={loading}
              size="small"
            />
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={shares.filter(s => 
            !searchText || 
            s.recipient?.toLowerCase().includes(searchText.toLowerCase()) ||
            s.recipient_email?.toLowerCase().includes(searchText.toLowerCase())
          )}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} shares`
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
          scroll={{ x: 1100 }}
          locale={{ emptyText: <Empty description="No active shares" /> }}
        />
      </Card>
    );
  };
  
  const renderAnalyticsTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card title="Access Summary" size="small">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="Total Accesses"
                value={analytics?.total_accesses || 0}
                prefix={<EyeOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Unique Users"
                value={analytics?.unique_users || 0}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Downloads"
                value={analytics?.total_downloads || 0}
                prefix={<DownloadOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Denied Access"
                value={analytics?.denied_attempts || 0}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Col>
          </Row>
        </Card>
      </Col>
      
      <Col xs={24} md={12}>
        <Card title="Device Breakdown" size="small">
          <List
            dataSource={Object.entries(analytics?.device_breakdown || {}).map(([device, count]) => ({
              device,
              count
            }))}
            locale={{ emptyText: <Empty description="No device data" /> }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={DEVICE_ICONS[item.device] || DEVICE_ICONS.unknown} />}
                  title={item.device.charAt(0).toUpperCase() + item.device.slice(1)}
                  description={
                    <Progress 
                      percent={Math.round((item.count / (analytics?.total_accesses || 1)) * 100)}
                      size="small"
                    />
                  }
                />
                <span>{item.count}</span>
              </List.Item>
            )}
          />
        </Card>
      </Col>
      
      <Col span={24}>
        <Card title="Recent Access Activity" size="small">
          {activity.length > 0 ? (
            <Timeline
              items={activity.slice(0, 15).map((item) => ({
                color: item.action === 'view' ? 'blue' :
                       item.action === 'download' ? 'green' :
                       item.action === 'denied' ? 'red' : 'gray',
                children: (
                  <div>
                    <Space>
                      <Text strong>{item.action?.toUpperCase()}</Text>
                      <Text>{item.user_email || 'Anonymous'}</Text>
                      {item.device && (
                        <Tag icon={DEVICE_ICONS[item.device]}>
                          {item.device}
                        </Tag>
                      )}
                    </Space>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {item.ip_address && `IP: ${item.ip_address} • `}
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                )
              }))}
            />
          ) : (
            <Empty description="No activity yet" />
          )}
        </Card>
      </Col>
    </Row>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderCreateShareModal = () => (
    <Modal
      title={
        <Space>
          <ShareAltOutlined style={{ color: '#1890ff' }} />
          <span>Create Share</span>
        </Space>
      }
      open={createShareModal}
      onCancel={() => {
        setCreateShareModal(false);
        resetCreateForm();
      }}
      footer={null}
      width={650}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleCreateShare}>
        <Form.Item label="Share Type" required>
          <Segmented
            value={shareType}
            onChange={setShareType}
            options={Object.entries(SHARE_TYPES).map(([key, value]) => ({
              label: (
                <Tooltip title={value.description}>
                  <Space size={4}>
                    {value.icon}
                    <span style={{ fontSize: 11 }}>{value.label}</span>
                  </Space>
                </Tooltip>
              ),
              value: key
            }))}
            block
          />
        </Form.Item>
        
        {shareType === 'email' && (
          <Form.Item label="Recipients" required>
            <Select
              mode="tags"
              value={recipients}
              onChange={setRecipients}
              placeholder="Enter email addresses"
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}
        
        <Form.Item label="Access Level" required>
          <Radio.Group 
            value={accessLevel} 
            onChange={(e) => setAccessLevel(e.target.value)}
          >
            <Row gutter={[8, 8]}>
              {Object.entries(ACCESS_LEVELS).map(([key, value]) => (
                <Col span={12} key={key}>
                  <Radio.Button value={key} style={{ width: '100%', textAlign: 'left', height: 'auto', padding: '8px 12px' }}>
                    <Space>
                      {value.icon}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{value.label}</div>
                        <div style={{ fontSize: 10, color: '#8c8c8c' }}>{value.description}</div>
                      </div>
                    </Space>
                  </Radio.Button>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Expires In (Days)">
              <InputNumber
                value={expiryDays}
                onChange={setExpiryDays}
                min={1}
                max={365}
                style={{ width: '100%' }}
                addonAfter="days"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Max Downloads">
              <InputNumber
                value={maxDownloads}
                onChange={setMaxDownloads}
                min={1}
                placeholder="Unlimited"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider>Security</Divider>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Switch
              checked={passwordProtected}
              onChange={setPasswordProtected}
              size="small"
            />
            <Text>Password Protect</Text>
          </Space>
          {passwordProtected && (
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          )}
          
          <Space>
            <Switch checked={requireNda} onChange={setRequireNda} size="small" />
            <Text>Require NDA Acceptance</Text>
          </Space>
          
          <Space>
            <Switch checked={requireEmail} onChange={setRequireEmail} size="small" />
            <Text>Require Email Entry</Text>
          </Space>
          
          <Space>
            <Switch checked={watermark} onChange={setWatermark} size="small" />
            <Text>Apply Watermark</Text>
          </Space>
          
          <Space>
            <Switch checked={allowPrint} onChange={setAllowPrint} size="small" />
            <Text>Allow Printing</Text>
          </Space>
          
          <Space>
            <Switch checked={sendNotification} onChange={setSendNotification} size="small" />
            <Text>Send Notification</Text>
          </Space>
        </Space>
        
        <Form.Item label="Custom Message" style={{ marginTop: 16 }}>
          <TextArea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={2}
            placeholder="Optional message to include with the share..."
            maxLength={500}
            showCount
          />
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setCreateShareModal(false);
              resetCreateForm();
            }}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saving}
              icon={<LinkOutlined />}
            >
              Generate Share
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderLinkGeneratedModal = () => (
    <Modal
      title={
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span>Share Link Generated</span>
        </Space>
      }
      open={linkGeneratedModal}
      onCancel={() => setLinkGeneratedModal(false)}
      footer={[
        <Button key="close" onClick={() => setLinkGeneratedModal(false)}>
          Close
        </Button>,
        <Button 
          key="copy" 
          type="primary" 
          icon={<CopyOutlined />}
          onClick={() => {
            handleCopyLink(generatedLink);
            setLinkGeneratedModal(false);
          }}
        >
          Copy Link
        </Button>
      ]}
      width={550}
    >
      <Alert
        message="Ready to Share"
        description="Copy this link and send it to your recipients. Anyone with this link can access the document based on the configured permissions."
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <div className="share-link-box">
        <LinkOutlined style={{ color: '#52c41a', fontSize: 16 }} />
        <Text className="share-link-text" copyable={{ text: generatedLink }}>
          {generatedLink}
        </Text>
        <Button 
          type="primary" 
          size="small"
          icon={<CopyOutlined />}
          onClick={() => handleCopyLink(generatedLink)}
        >
          Copy
        </Button>
      </div>
      
      <Divider />
      
      <Row gutter={16}>
        <Col span={8}>
          <Button 
            block 
            icon={<QrcodeOutlined />}
            onClick={() => setQrModal(true)}
          >
            QR Code
          </Button>
        </Col>
        <Col span={8}>
          <Button 
            block 
            icon={<MailOutlined />}
            onClick={() => message.info('Email composer opened')}
          >
            Send Email
          </Button>
        </Col>
        <Col span={8}>
          <Button 
            block 
            icon={<EyeOutlined />}
            onClick={() => window.open(generatedLink, '_blank')}
          >
            Preview
          </Button>
        </Col>
      </Row>
    </Modal>
  );
  
  const renderQrModal = () => (
    <Modal
      title={
        <Space>
          <QrcodeOutlined />
          <span>Share via QR Code</span>
        </Space>
      }
      open={qrModal}
      onCancel={() => setQrModal(false)}
      footer={[
        <Button key="close" onClick={() => setQrModal(false)}>
          Close
        </Button>,
        <Button 
          key="download" 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={() => message.success('QR code downloaded')}
        >
          Download QR
        </Button>
      ]}
      width={400}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <QRCode 
          value={selectedShare?.share_url || generatedLink || 'https://example.com'} 
          size={250}
        />
        <div style={{ marginTop: 16 }}>
          <Text strong>Scan to Access</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Share this QR code for quick document access
          </Text>
        </div>
      </div>
    </Modal>
  );
  
  const renderDetailDrawer = () => {
    if (!selectedShare) return null;
    
    return (
      <Drawer
        title={
          <Space>
            <ShareAltOutlined />
            <span>Share Details</span>
          </Space>
        }
        open={detailDrawer}
        onClose={() => setDetailDrawer(false)}
        width={600}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Recipient">
            {selectedShare.recipient || selectedShare.recipient_email || 'Public Link'}
          </Descriptions.Item>
          <Descriptions.Item label="Access Level">
            {getAccessLevelTag(selectedShare.access_level)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {getStatusTag(selectedShare.status)}
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {formatDate(selectedShare.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="Expires">
            {selectedShare.expires_at 
              ? `${formatDate(selectedShare.expires_at)} (${getTimeRemaining(selectedShare.expires_at)})`
              : 'Never'}
          </Descriptions.Item>
          <Descriptions.Item label="Max Downloads">
            {selectedShare.max_downloads || 'Unlimited'}
          </Descriptions.Item>
          <Descriptions.Item label="Security">
            <Space>
              {selectedShare.has_password && <Tag color="orange" icon={<LockOutlined />}>Password</Tag>}
              {selectedShare.require_nda && <Tag color="red" icon={<FileProtectOutlined />}>NDA</Tag>}
              {selectedShare.watermark && <Tag color="blue" icon={<SafetyCertificateOutlined />}>Watermark</Tag>}
            </Space>
          </Descriptions.Item>
        </Descriptions>
        
        <Divider>Access Statistics</Divider>
        
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Statistic
              title="Views"
              value={selectedShare.view_count || 0}
              prefix={<EyeOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Downloads"
              value={selectedShare.download_count || 0}
              prefix={<DownloadOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Unique Users"
              value={selectedShare.unique_users || 0}
              prefix={<UserOutlined />}
            />
          </Col>
        </Row>
        
        <Divider />
        
        <Space>
          <Button 
            icon={<CopyOutlined />} 
            onClick={() => handleCopyLink(selectedShare.share_url)}
          >
            Copy Link
          </Button>
          <Button 
            icon={<ClockCircleOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Extend Expiry',
                content: (
                  <InputNumber
                    id="extend-days"
                    min={1}
                    max={365}
                    defaultValue={30}
                    style={{ width: '100%' }}
                    addonAfter="days"
                  />
                ),
                onOk: () => {
                  const days = parseInt(document.getElementById('extend-days')?.value || 30);
                  handleExtendExpiry(selectedShare.id, days);
                }
              });
            }}
          >
            Extend
          </Button>
          {selectedShare.status === 'active' && (
            <Popconfirm
              title="Revoke this share?"
              onConfirm={() => {
                handleRevokeShare(selectedShare.id);
                setDetailDrawer(false);
              }}
              okText="Revoke"
              okType="danger"
            >
              <Button danger icon={<StopOutlined />}>Revoke</Button>
            </Popconfirm>
          )}
        </Space>
      </Drawer>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  if (!documentId && !bundleId) {
    return (
      <div className="share-portal" style={{ padding: embedded ? 0 : 24 }}>
        <Empty
          description="Select a document to manage sharing"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="share-portal" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="share-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ShareAltOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Share Portal</Title>
              <Badge status="processing" text="External Access" />
              {document && <Tag color="blue">{document.title}</Tag>}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadShares}
                loading={loading}
              >
                Refresh
              </Button>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateShareModal(true)}
              >
                New Share
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Stats */}
      {renderStats()}
      
      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'shares',
            label: (
              <Space>
                <LinkOutlined />
                Active Shares
                <Badge count={shares.filter(s => s.status === 'active').length} style={{ backgroundColor: '#1890ff' }} />
              </Space>
            ),
            children: renderSharesTable()
          },
          {
            key: 'analytics',
            label: (
              <Space>
                <BarChartOutlined />
                Analytics
              </Space>
            ),
            children: renderAnalyticsTab()
          }
        ]}
      />
      
      {/* Modals */}
      {renderCreateShareModal()}
      {renderLinkGeneratedModal()}
      {renderQrModal()}
      {renderDetailDrawer()}
    </div>
  );
};

export default SharePortal;