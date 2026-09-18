// src/components/documents/IntegrationHub.jsx
// External system connectors: SharePoint, Google Drive, Slack, DocuSign,
// Salesforce, SAP, Okta, and custom webhooks

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Descriptions,
  Tabs, Timeline, Avatar, List, Badge, Tooltip, Progress,
  Switch, Empty, Spin, Alert, Divider, Typography, Collapse,
  Checkbox, Radio, Slider, DatePicker, InputNumber, Segmented,
  Statistic, Result, Steps, Upload, Tree, Transfer, Cascader,
  Statistic as AntStat, FloatButton, QRCode
} from 'antd';
import {
  ApiOutlined, LinkOutlined, DisconnectOutlined, SyncOutlined, FileProtectOutlined, 
  CloudServerOutlined, DatabaseOutlined, FileTextOutlined,
  CheckCircleOutlined, CloseCircleOutlined, WarningOutlined,
  InfoCircleOutlined, ClockCircleOutlined, ThunderboltOutlined,
  RocketOutlined, SettingOutlined, SaveOutlined, PlayCircleOutlined,
  DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined,
  ReloadOutlined, DownloadOutlined, UploadOutlined, ExportOutlined, FundOutlined, 
  ImportOutlined, SafetyCertificateOutlined, LockOutlined,
  UnlockOutlined, MailOutlined, BellOutlined, MessageOutlined,
  TeamOutlined, UserOutlined, GlobalOutlined, AppstoreOutlined,
  FolderOutlined, FilePdfOutlined, FileWordOutlined,
  FileExcelOutlined, ApiOutlined as ApiIcon, CloudOutlined,
  DeploymentUnitOutlined, ClusterOutlined, NodeIndexOutlined,
  ApartmentOutlined, SwapOutlined, HistoryOutlined,
  FilterOutlined, SearchOutlined, BugOutlined, CodeOutlined,
  KeyOutlined, SafetyOutlined, BankOutlined, MedicineBoxOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import './IntegrationHub.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const INTEGRATION_CATEGORIES = {
  storage: { label: 'Storage & Files', icon: <CloudServerOutlined />, color: '#1890ff' },
  communication: { label: 'Communication', icon: <MessageOutlined />, color: '#52c41a' },
  productivity: { label: 'Productivity', icon: <AppstoreOutlined />, color: '#722ed1' },
  crm: { label: 'CRM & Sales', icon: <TeamOutlined />, color: '#faad14' },
  erp: { label: 'ERP & Finance', icon: <BankOutlined />, color: '#13c2c2' },
  identity: { label: 'Identity & SSO', icon: <KeyOutlined />, color: '#eb2f96' },
  esignature: { label: 'E-Signature', icon: <FileProtectOutlined />, color: '#fa541c' },
  custom: { label: 'Custom & API', icon: <CodeOutlined />, color: '#8c8c8c' }
};

const AVAILABLE_INTEGRATIONS = {
  sharepoint: {
    id: 'sharepoint',
    name: 'SharePoint',
    category: 'storage',
    description: 'Microsoft SharePoint document sync',
    icon: <FileWordOutlined />,
    color: '#0078d4',
    popularity: 95
  },
  google_drive: {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'storage',
    description: 'Google Drive file synchronization',
    icon: <CloudServerOutlined />,
    color: '#4285f4',
    popularity: 90
  },
  dropbox: {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'storage',
    description: 'Dropbox file storage integration',
    icon: <FolderOutlined />,
    color: '#0061ff',
    popularity: 75
  },
  onedrive: {
    id: 'onedrive',
    name: 'OneDrive',
    category: 'storage',
    description: 'Microsoft OneDrive sync',
    icon: <CloudOutlined />,
    color: '#0078d4',
    popularity: 85
  },
  slack: {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    description: 'Slack notifications and commands',
    icon: <MessageOutlined />,
    color: '#4a154b',
    popularity: 88
  },
  teams: {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'communication',
    description: 'Teams notifications and tabs',
    icon: <TeamOutlined />,
    color: '#6264a7',
    popularity: 82
  },
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    category: 'communication',
    description: 'Gmail add-in for document access',
    icon: <MailOutlined />,
    color: '#ea4335',
    popularity: 70
  },
  outlook: {
    id: 'outlook',
    name: 'Outlook',
    category: 'communication',
    description: 'Outlook add-in integration',
    icon: <MailOutlined />,
    color: '#0078d4',
    popularity: 80
  },
  docusign: {
    id: 'docusign',
    name: 'DocuSign',
    category: 'esignature',
    description: 'Electronic signature platform',
    icon: <FileProtectOutlined />,
    color: '#ffc82e',
    popularity: 92
  },
  adobe_sign: {
    id: 'adobe_sign',
    name: 'Adobe Sign',
    category: 'esignature',
    description: 'Adobe document signing',
    icon: <FileProtectOutlined />,
    color: '#ff0000',
    popularity: 78
  },
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    description: 'CRM document integration',
    icon: <TeamOutlined />,
    color: '#00a1e0',
    popularity: 85
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    description: 'Marketing and sales platform',
    icon: <TeamOutlined />,
    color: '#ff7a59',
    popularity: 72
  },
  sap: {
    id: 'sap',
    name: 'SAP',
    category: 'erp',
    description: 'SAP ERP integration',
    icon: <BankOutlined />,
    color: '#0faaff',
    popularity: 88
  },
  oracle: {
    id: 'oracle',
    name: 'Oracle',
    category: 'erp',
    description: 'Oracle NetSuite integration',
    icon: <DatabaseOutlined />,
    color: '#f80000',
    popularity: 75
  },
  okta: {
    id: 'okta',
    name: 'Okta',
    category: 'identity',
    description: 'Single sign-on and MFA',
    icon: <KeyOutlined />,
    color: '#007dc1',
    popularity: 90
  },
  azure_ad: {
    id: 'azure_ad',
    name: 'Azure AD',
    category: 'identity',
    description: 'Microsoft identity platform',
    icon: <SafetyOutlined />,
    color: '#0078d4',
    popularity: 92
  },
  auth0: {
    id: 'auth0',
    name: 'Auth0',
    category: 'identity',
    description: 'Authentication platform',
    icon: <KeyOutlined />,
    color: '#eb5424',
    popularity: 78
  },
  zapier: {
    id: 'zapier',
    name: 'Zapier',
    category: 'productivity',
    description: 'Automation with 5000+ apps',
    icon: <ThunderboltOutlined />,
    color: '#ff4f00',
    popularity: 82
  },
  make: {
    id: 'make',
    name: 'Make (Integromat)',
    category: 'productivity',
    description: 'Visual automation platform',
    icon: <RocketOutlined />,
    color: '#6d00cc',
    popularity: 70
  },
  tableau: {
    id: 'tableau',
    name: 'Tableau',
    category: 'productivity',
    description: 'Business intelligence & analytics',
    icon: <FundOutlined />,
    color: '#e97627',
    popularity: 75
  },
  power_bi: {
    id: 'power_bi',
    name: 'Power BI',
    category: 'productivity',
    description: 'Microsoft BI platform',
    icon: <FundOutlined />,
    color: '#f2c811',
    popularity: 80
  },
  webhook: {
    id: 'webhook',
    name: 'Custom Webhook',
    category: 'custom',
    description: 'Custom HTTP webhooks',
    icon: <ApiOutlined />,
    color: '#8c8c8c',
    popularity: 65
  },
  rest_api: {
    id: 'rest_api',
    name: 'REST API',
    category: 'custom',
    description: 'REST API integration',
    icon: <ApiIcon />,
    color: '#8c8c8c',
    popularity: 88
  }
};

const CONNECTION_STATUS = {
  connected: { label: 'Connected', color: 'success', icon: <CheckCircleOutlined /> },
  disconnected: { label: 'Not Connected', color: 'default', icon: <DisconnectOutlined /> },
  error: { label: 'Error', color: 'error', icon: <CloseCircleOutlined /> },
  connecting: { label: 'Connecting...', color: 'processing', icon: <SyncOutlined spin /> },
  expired: { label: 'Token Expired', color: 'warning', icon: <WarningOutlined /> }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const IntegrationHub = ({
  companyId = null,
  embedded = false,
  onUpdate = null
}) => {
  const { user } = useAuth();

  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState('integrations');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [integrations, setIntegrations] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({});
  
  // UI State
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [webhookModalVisible, setWebhookModalVisible] = useState(false);
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [newApiKey, setNewApiKey] = useState(null);
  
  // Config form state
  const [configValues, setConfigValues] = useState({});
  
  // Forms
  const [configForm] = Form.useForm();
  const [webhookForm] = Form.useForm();
  const [apiKeyForm] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        integrationsData,
        webhooksData,
        apiKeysData,
        activityData,
        statsData
      ] = await Promise.all([
        documentService.getIntegrations({ company_id: companyId }),
        documentService.getWebhooks({ company_id: companyId }),
        documentService.getApiKeys({ company_id: companyId }),
        documentService.getIntegrationActivity({ company_id: companyId, limit: 50 }),
        documentService.getIntegrationStats({ company_id: companyId })
      ]);
      
      setIntegrations(integrationsData.integrations || []);
      setWebhooks(webhooksData.webhooks || []);
      setApiKeys(apiKeysData.api_keys || []);
      setActivity(activityData.activities || []);
      setStats(statsData);
      
    } catch (error) {
      console.error('Failed to load integration data:', error);
      message.error('Failed to load integration data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleConnect = async (integrationId) => {
    const integration = AVAILABLE_INTEGRATIONS[integrationId];
    setSelectedIntegration(integration);
    setConfigModalVisible(true);
    
    // Load existing config
    const existing = integrations.find(i => i.integration_id === integrationId);
    if (existing) {
      configForm.setFieldsValue(existing.config || {});
    }
  };
  
  const handleSaveConfig = async (values) => {
    setConnecting(true);
    try {
      const result = await documentService.connectIntegration({
        integration_id: selectedIntegration.id,
        config: values,
        company_id: companyId
      });
      
      if (result.requires_oauth) {
        // Open OAuth flow
        const oauthUrl = result.oauth_url;
        const popup = window.open(oauthUrl, 'oauth', 'width=600,height=700');
        
        // Listen for OAuth completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            loadData();
          }
        }, 1000);
        
        message.info('Complete authorization in the popup window');
      } else {
        message.success(`${selectedIntegration.name} connected successfully`);
        setConfigModalVisible(false);
        configForm.resetFields();
        loadData();
      }
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to connect:', error);
      message.error(error.message || 'Failed to connect integration');
    } finally {
      setConnecting(false);
    }
  };
  
  const handleDisconnect = async (integrationId) => {
    Modal.confirm({
      title: 'Disconnect Integration',
      content: 'Are you sure you want to disconnect this integration? Sync will stop.',
      okText: 'Disconnect',
      okType: 'danger',
      onOk: async () => {
        try {
          await documentService.disconnectIntegration(integrationId, { 
            company_id: companyId 
          });
          message.success('Integration disconnected');
          loadData();
          if (onUpdate) onUpdate();
        } catch (error) {
          message.error('Failed to disconnect');
        }
      }
    });
  };
  
  const handleTestConnection = async (integrationId) => {
    try {
      const result = await documentService.testIntegration(integrationId, { 
        company_id: companyId 
      });
      
      if (result.success) {
        message.success('Connection test successful');
      } else {
        message.error(`Connection test failed: ${result.error}`);
      }
      
    } catch (error) {
      message.error('Connection test failed');
    }
  };
  
  const handleSyncNow = async (integrationId) => {
    try {
      await documentService.triggerIntegrationSync(integrationId, { 
        company_id: companyId 
      });
      message.success('Sync triggered');
      loadData();
    } catch (error) {
      message.error('Failed to trigger sync');
    }
  };
  
  const handleCreateWebhook = async (values) => {
    try {
      await documentService.createWebhook({
        ...values,
        company_id: companyId
      });
      message.success('Webhook created');
      setWebhookModalVisible(false);
      webhookForm.resetFields();
      loadData();
    } catch (error) {
      message.error('Failed to create webhook');
    }
  };
  
  const handleDeleteWebhook = async (webhookId) => {
    try {
      await documentService.deleteWebhook(webhookId);
      message.success('Webhook deleted');
      loadData();
    } catch (error) {
      message.error('Failed to delete webhook');
    }
  };
  
  const handleTestWebhook = async (webhookId) => {
    try {
      await documentService.testWebhook(webhookId);
      message.success('Test payload sent successfully');
    } catch (error) {
      message.error('Webhook test failed');
    }
  };
  
  const handleCreateApiKey = async (values) => {
    try {
      const result = await documentService.createApiKey({
        name: values.name,
        scopes: values.scopes,
        expires_in_days: values.expires_in_days,
        company_id: companyId
      });
      
      setNewApiKey(result);
      message.success('API key created - copy it now, it won\'t be shown again');
      loadData();
      
    } catch (error) {
      message.error('Failed to create API key');
    }
  };
  
  const handleRevokeApiKey = async (keyId) => {
    Modal.confirm({
      title: 'Revoke API Key',
      content: 'This key will immediately stop working. Continue?',
      okText: 'Revoke',
      okType: 'danger',
      onOk: async () => {
        try {
          await documentService.revokeApiKey(keyId);
          message.success('API key revoked');
          loadData();
        } catch (error) {
          message.error('Failed to revoke API key');
        }
      }
    });
  };
  
  const handleCopyApiKey = () => {
    if (newApiKey?.key) {
      navigator.clipboard.writeText(newApiKey.key);
      message.success('API key copied to clipboard');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getIntegrationStatus = (integrationId) => {
    const connected = integrations.find(i => i.integration_id === integrationId);
    return connected?.status || 'disconnected';
  };
  
  const getStatusConfig = (status) => CONNECTION_STATUS[status] || CONNECTION_STATUS.disconnected;
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid';
    }
  };
  
  const getFilteredIntegrations = () => {
    return Object.entries(AVAILABLE_INTEGRATIONS).filter(([key, value]) => {
      // Category filter
      if (activeCategory !== 'all' && value.category !== activeCategory) return false;
      
      // Search filter
      if (searchText) {
        const search = searchText.toLowerCase();
        return (
          value.name.toLowerCase().includes(search) ||
          value.description.toLowerCase().includes(search)
        );
      }
      
      return true;
    }).sort((a, b) => b[1].popularity - a[1].popularity);
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="integration-stat-card">
          <AntStat
            title="Connected"
            value={integrations.filter(i => i.status === 'connected').length}
            prefix={<LinkOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="integration-stat-card">
          <AntStat
            title="Available"
            value={Object.keys(AVAILABLE_INTEGRATIONS).length}
            prefix={<AppstoreOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="integration-stat-card">
          <AntStat
            title="Active Webhooks"
            value={webhooks.filter(w => w.enabled).length}
            prefix={<ApiOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="integration-stat-card">
          <AntStat
            title="API Calls Today"
            value={stats.api_calls_today || 0}
            prefix={<ThunderboltOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderIntegrationsTab = () => (
    <div>
      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Input.Search
              placeholder="Search integrations..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} md={12}>
            <Space wrap>
              <Button
                size="small"
                type={activeCategory === 'all' ? 'primary' : 'default'}
                onClick={() => setActiveCategory('all')}
              >
                All
              </Button>
              {Object.entries(INTEGRATION_CATEGORIES).map(([key, value]) => (
                <Button
                  key={key}
                  size="small"
                  type={activeCategory === key ? 'primary' : 'default'}
                  icon={value.icon}
                  onClick={() => setActiveCategory(key)}
                >
                  {value.label}
                </Button>
              ))}
            </Space>
          </Col>
        </Row>
      </Card>
      
      {/* Integrations Grid */}
      <Row gutter={[16, 16]}>
        {getFilteredIntegrations().map(([key, integration]) => {
          const status = getIntegrationStatus(key);
          const statusConfig = getStatusConfig(status);
          const connected = status === 'connected';
          
          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={key}>
              <Card
                hoverable
                size="small"
                className={`integration-card ${connected ? 'connected' : ''}`}
                onClick={() => {
                  setSelectedIntegration(integration);
                  setDetailDrawerVisible(true);
                }}
              >
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div 
                    className="integration-icon"
                    style={{ 
                      backgroundColor: integration.color + '20',
                      color: integration.color
                    }}
                  >
                    {integration.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{integration.name}</div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {INTEGRATION_CATEGORIES[integration.category]?.label}
                    </Text>
                  </div>
                  {connected && (
                    <Tooltip title="Connected">
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                    </Tooltip>
                  )}
                </div>
                
                <Text 
                  type="secondary" 
                  style={{ fontSize: 12, display: 'block', marginBottom: 12, minHeight: 32 }}
                  ellipsis={{ rows: 2 }}
                >
                  {integration.description}
                </Text>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color={statusConfig.color} icon={statusConfig.icon}>
                    {statusConfig.label}
                  </Tag>
                  <Button
                    size="small"
                    type={connected ? 'default' : 'primary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connected) {
                        handleDisconnect(key);
                      } else {
                        handleConnect(key);
                      }
                    }}
                  >
                    {connected ? 'Manage' : 'Connect'}
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      
      {getFilteredIntegrations().length === 0 && (
        <Empty description="No integrations found" />
      )}
    </div>
  );
  
  const renderWebhooksTab = () => (
    <Card
      title={
        <Space>
          <ApiOutlined />
          <span>Webhooks</span>
          <Badge count={webhooks.length} style={{ backgroundColor: '#722ed1' }} />
        </Space>
      }
      size="small"
      extra={
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setWebhookModalVisible(true)}
        >
          Create Webhook
        </Button>
      }
    >
      {webhooks.length > 0 ? (
        <List
          dataSource={webhooks}
          renderItem={(webhook) => (
            <List.Item
              actions={[
                <Tooltip key="test" title="Test">
                  <Button
                    type="text"
                    size="small"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleTestWebhook(webhook.id)}
                  />
                </Tooltip>,
                <Tooltip key="logs" title="Logs">
                  <Button
                    type="text"
                    size="small"
                    icon={<HistoryOutlined />}
                  />
                </Tooltip>,
                <Popconfirm
                  key="delete"
                  title="Delete this webhook?"
                  onConfirm={() => handleDeleteWebhook(webhook.id)}
                >
                  <Button type="text" size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<ApiOutlined />}
                    style={{ backgroundColor: webhook.enabled ? '#722ed1' : '#d9d9d9' }}
                  />
                }
                title={
                  <Space>
                    <span>{webhook.name}</span>
                    <Tag color={webhook.enabled ? 'green' : 'default'}>
                      {webhook.enabled ? 'Active' : 'Disabled'}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <Text code style={{ fontSize: 11 }}>
                      {webhook.url}
                    </Text>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                      Events: {(webhook.events || []).join(', ')}
                    </div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      Last triggered: {formatDate(webhook.last_triggered_at)}
                    </div>
                  </div>
                }
              />
              <Switch 
                checked={webhook.enabled} 
                size="small"
                onChange={async (checked) => {
                  try {
                    await documentService.toggleWebhook(webhook.id, checked);
                    loadData();
                  } catch (error) {
                    message.error('Failed to toggle webhook');
                  }
                }}
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No webhooks configured">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setWebhookModalVisible(true)}
          >
            Create First Webhook
          </Button>
        </Empty>
      )}
    </Card>
  );
  
  const renderApiKeysTab = () => (
    <Card
      title={
        <Space>
          <KeyOutlined />
          <span>API Keys</span>
          <Badge count={apiKeys.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      size="small"
      extra={
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setApiKeyModalVisible(true)}
        >
          Create API Key
        </Button>
      }
    >
      {newApiKey && (
        <Alert
          message="API Key Created - Save It Now!"
          description={
            <div>
              <Text>This key will only be shown once:</Text>
              <div style={{
                marginTop: 8,
                padding: 8,
                background: '#f5f5f5',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: 12,
                wordBreak: 'break-all'
              }}>
                {newApiKey.key}
              </div>
              <Space style={{ marginTop: 8 }}>
                <Button 
                  size="small" 
                  type="primary"
                  icon={<CopyOutlined />}
                  onClick={handleCopyApiKey}
                >
                  Copy Key
                </Button>
                <Button 
                  size="small" 
                  onClick={() => setNewApiKey(null)}
                >
                  I've Saved It
                </Button>
              </Space>
            </div>
          }
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {apiKeys.length > 0 ? (
        <Table
          rowKey="id"
          dataSource={apiKeys}
          pagination={false}
          columns={[
            {
              title: 'Name',
              dataIndex: 'name',
              key: 'name',
              render: (name, record) => (
                <Space>
                  <KeyOutlined />
                  <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {record.prefix}...
                    </Text>
                  </div>
                </Space>
              )
            },
            {
              title: 'Scopes',
              dataIndex: 'scopes',
              key: 'scopes',
              render: (scopes) => (
                <Space size={[4, 4]} wrap>
                  {(scopes || []).slice(0, 3).map(scope => (
                    <Tag key={scope} style={{ fontSize: 10 }}>{scope}</Tag>
                  ))}
                  {(scopes || []).length > 3 && (
                    <Tag>+{scopes.length - 3}</Tag>
                  )}
                </Space>
              )
            },
            {
              title: 'Created',
              dataIndex: 'created_at',
              key: 'created_at',
              render: (date) => formatDate(date)
            },
            {
              title: 'Last Used',
              dataIndex: 'last_used_at',
              key: 'last_used_at',
              render: (date) => date ? formatDate(date) : 'Never'
            },
            {
              title: 'Expires',
              dataIndex: 'expires_at',
              key: 'expires_at',
              render: (date) => date ? (
                <Tag color={new Date(date) < new Date() ? 'red' : 'green'}>
                  {formatDate(date)}
                </Tag>
              ) : <Tag>Never</Tag>
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Popconfirm
                  title="Revoke this API key?"
                  onConfirm={() => handleRevokeApiKey(record.id)}
                >
                  <Button type="text" size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              )
            }
          ]}
        />
      ) : (
        <Empty description="No API keys created" />
      )}
    </Card>
  );
  
  const renderActivityTab = () => (
    <Card title="Integration Activity" size="small">
      {activity.length > 0 ? (
        <Timeline
          items={activity.map((item) => ({
            color: 
              item.status === 'success' ? 'green' :
              item.status === 'error' ? 'red' : 'blue',
            children: (
              <div>
                <Space>
                  <Avatar 
                    size="small"
                    icon={AVAILABLE_INTEGRATIONS[item.integration_id]?.icon}
                    style={{ 
                      backgroundColor: AVAILABLE_INTEGRATIONS[item.integration_id]?.color 
                    }}
                  />
                  <Text strong>{item.integration_name || item.integration_id}</Text>
                  <Tag color={
                    item.status === 'success' ? 'green' :
                    item.status === 'error' ? 'red' : 'blue'
                  }>
                    {item.action}
                  </Tag>
                </Space>
                <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
                  {item.description}
                </div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  {formatDate(item.created_at)}
                  {item.duration && ` • ${item.duration}ms`}
                </div>
              </div>
            )
          }))}
        />
      ) : (
        <Empty description="No integration activity yet" />
      )}
    </Card>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderConfigModal = () => (
    <Modal
      title={
        <Space>
          {selectedIntegration?.icon}
          <span>Configure {selectedIntegration?.name}</span>
        </Space>
      }
      open={configModalVisible}
      onCancel={() => {
        setConfigModalVisible(false);
        configForm.resetFields();
      }}
      footer={null}
      width={600}
    >
      {selectedIntegration && (
        <>
          <Alert
            message={selectedIntegration.description}
            description="Enter the required credentials to connect this integration."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form
            form={configForm}
            layout="vertical"
            onFinish={handleSaveConfig}
          >
            {/* Generic fields - would be customized per integration */}
            <Form.Item
              name="api_key"
              label="API Key"
              rules={[{ required: true, message: 'API Key is required' }]}
            >
              <Input.Password placeholder="Enter API Key" />
            </Form.Item>
            
            <Form.Item
              name="api_secret"
              label="API Secret"
            >
              <Input.Password placeholder="Enter API Secret (if required)" />
            </Form.Item>
            
            <Form.Item
              name="base_url"
              label="Base URL"
            >
              <Input placeholder="https://api.example.com" />
            </Form.Item>
            
            <Form.Item
              name="sync_enabled"
              valuePropName="checked"
              initialValue={true}
            >
              <Checkbox>Enable automatic sync</Checkbox>
            </Form.Item>
            
            <Form.Item
              name="sync_frequency"
              label="Sync Frequency"
              initialValue="hourly"
            >
              <Select>
                <Option value="realtime">Real-time</Option>
                <Option value="15min">Every 15 minutes</Option>
                <Option value="hourly">Hourly</Option>
                <Option value="daily">Daily</Option>
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setConfigModalVisible(false)}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={connecting}
                  icon={<LinkOutlined />}
                >
                  Connect
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
  
  const renderWebhookModal = () => (
    <Modal
      title="Create Webhook"
      open={webhookModalVisible}
      onCancel={() => setWebhookModalVisible(false)}
      footer={null}
      width={600}
    >
      <Form
        form={webhookForm}
        layout="vertical"
        onFinish={handleCreateWebhook}
      >
        <Form.Item
          name="name"
          label="Webhook Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g., Document Created Notification" />
        </Form.Item>
        
        <Form.Item
          name="url"
          label="Webhook URL"
          rules={[
            { required: true },
            { type: 'url', message: 'Must be a valid URL' }
          ]}
        >
          <Input placeholder="https://your-app.com/webhook" />
        </Form.Item>
        
        <Form.Item
          name="events"
          label="Events"
          rules={[{ required: true, message: 'Select at least one event' }]}
        >
          <Checkbox.Group>
            <Row gutter={[8, 8]}>
              {[
                'document.created',
                'document.updated',
                'document.deleted',
                'document.approved',
                'document.shared',
                'signature.completed',
                'workflow.completed',
                'user.created'
              ].map(event => (
                <Col xs={12} key={event}>
                  <Checkbox value={event}>
                    <Text code style={{ fontSize: 11 }}>{event}</Text>
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
        
        <Form.Item
          name="secret"
          label="Signing Secret (Optional)"
          extra="Used to verify webhook authenticity"
        >
          <Input.Password placeholder="Enter signing secret" />
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setWebhookModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Create Webhook
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderApiKeyModal = () => (
    <Modal
      title="Create API Key"
      open={apiKeyModalVisible}
      onCancel={() => setApiKeyModalVisible(false)}
      footer={null}
    >
      <Form
        form={apiKeyForm}
        layout="vertical"
        onFinish={handleCreateApiKey}
      >
        <Form.Item
          name="name"
          label="Key Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g., Production API Key" />
        </Form.Item>
        
        <Form.Item
          name="scopes"
          label="Permissions"
          rules={[{ required: true, message: 'Select at least one scope' }]}
        >
          <Checkbox.Group>
            <Space direction="vertical">
              <Checkbox value="documents:read">Read documents</Checkbox>
              <Checkbox value="documents:write">Create/update documents</Checkbox>
              <Checkbox value="documents:delete">Delete documents</Checkbox>
              <Checkbox value="signatures:read">Read signatures</Checkbox>
              <Checkbox value="signatures:write">Create signatures</Checkbox>
              <Checkbox value="webhooks:manage">Manage webhooks</Checkbox>
              <Checkbox value="users:read">Read users</Checkbox>
              <Checkbox value="admin">Full admin access</Checkbox>
            </Space>
          </Checkbox.Group>
        </Form.Item>
        
        <Form.Item
          name="expires_in_days"
          label="Expires In (days)"
          initialValue={365}
        >
          <InputNumber min={1} max={3650} style={{ width: '100%' }} addonAfter="days" />
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setApiKeyModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<KeyOutlined />}>
              Create API Key
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderDetailDrawer = () => {
    if (!selectedIntegration) return null;
    
    const status = getIntegrationStatus(selectedIntegration.id);
    const statusConfig = getStatusConfig(status);
    const connected = status === 'connected';
    const existing = integrations.find(i => i.integration_id === selectedIntegration.id);
    
    return (
      <Drawer
        title={
          <Space>
            <span style={{ color: selectedIntegration.color }}>
              {selectedIntegration.icon}
            </span>
            <span>{selectedIntegration.name}</span>
          </Space>
        }
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        width={600}
        extra={
          <Space>
            {connected ? (
              <>
                <Button 
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleSyncNow(selectedIntegration.id)}
                >
                  Sync Now
                </Button>
                <Button 
                  size="small"
                  danger
                  onClick={() => handleDisconnect(selectedIntegration.id)}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button 
                type="primary"
                size="small"
                onClick={() => {
                  setDetailDrawerVisible(false);
                  handleConnect(selectedIntegration.id);
                }}
              >
                Connect
              </Button>
            )}
          </Space>
        }
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Category">
            <Tag color={INTEGRATION_CATEGORIES[selectedIntegration.category]?.color}>
              {INTEGRATION_CATEGORIES[selectedIntegration.category]?.label}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {selectedIntegration.description}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusConfig.color} icon={statusConfig.icon}>
              {statusConfig.label}
            </Tag>
          </Descriptions.Item>
          {connected && (
            <>
              <Descriptions.Item label="Connected At">
                {formatDate(existing?.connected_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Last Sync">
                {formatDate(existing?.last_sync_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Documents Synced">
                {existing?.documents_synced || 0}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
        
        {connected && (
          <>
            <Divider>Actions</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                icon={<PlayCircleOutlined />}
                onClick={() => handleTestConnection(selectedIntegration.id)}
              >
                Test Connection
              </Button>
              <Button 
                block 
                icon={<SyncOutlined />}
                onClick={() => handleSyncNow(selectedIntegration.id)}
              >
                Force Sync
              </Button>
              <Button 
                block 
                icon={<SettingOutlined />}
                onClick={() => {
                  setDetailDrawerVisible(false);
                  handleConnect(selectedIntegration.id);
                }}
              >
                Edit Configuration
              </Button>
            </Space>
            
            <Divider>Recent Activity</Divider>
            <Timeline
              items={activity
                .filter(a => a.integration_id === selectedIntegration.id)
                .slice(0, 5)
                .map((item) => ({
                  color: item.status === 'success' ? 'green' : 'red',
                  children: (
                    <div>
                      <div>{item.description}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  )
                }))}
            />
          </>
        )}
      </Drawer>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="integration-hub" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="integration-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <ApiOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Integration Hub</Title>
              <Badge status="processing" text="Live" />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => message.info('Global settings coming soon')}
              >
                Settings
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadData}
                loading={loading}
              >
                Refresh
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
            key: 'integrations',
            label: (
              <Space>
                <AppstoreOutlined />
                Integrations
                <Badge 
                  count={integrations.filter(i => i.status === 'connected').length} 
                  style={{ backgroundColor: '#52c41a' }} 
                />
              </Space>
            ),
            children: renderIntegrationsTab()
          },
          {
            key: 'webhooks',
            label: (
              <Space>
                <ApiOutlined />
                Webhooks
                {webhooks.length > 0 && (
                  <Badge count={webhooks.length} style={{ backgroundColor: '#722ed1' }} />
                )}
              </Space>
            ),
            children: renderWebhooksTab()
          },
          {
            key: 'api_keys',
            label: (
              <Space>
                <KeyOutlined />
                API Keys
                {apiKeys.length > 0 && (
                  <Badge count={apiKeys.length} style={{ backgroundColor: '#1890ff' }} />
                )}
              </Space>
            ),
            children: renderApiKeysTab()
          },
          {
            key: 'activity',
            label: (
              <Space>
                <HistoryOutlined />
                Activity
              </Space>
            ),
            children: renderActivityTab()
          }
        ]}
      />
      
      {/* Modals */}
      {renderConfigModal()}
      {renderWebhookModal()}
      {renderApiKeyModal()}
      {renderDetailDrawer()}
    </div>
  );
};

export default IntegrationHub;