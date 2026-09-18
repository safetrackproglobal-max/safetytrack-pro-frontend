// src/components/documents/AccessControl.jsx
// Fine-grained document access control with RBAC, document-level permissions,
// field-level masking, and IP restrictions

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Descriptions,
  Tabs, Timeline, Avatar, List, Badge, Tooltip, Progress,
  Switch, Empty, Spin, Alert, Divider, Typography, Collapse,
  Checkbox, Radio, Slider, Transfer, Tree, Cascader, DatePicker,
  InputNumber, Segmented, Statistic, Result, Steps
} from 'antd';
import {
  LockOutlined, UnlockOutlined, UserOutlined, TeamOutlined,
  SafetyCertificateOutlined, EyeOutlined, EditOutlined,
  DeleteOutlined, DownloadOutlined, ShareAltOutlined,
  PlusOutlined, SearchOutlined, ReloadOutlined, SettingOutlined,
  GlobalOutlined, EnvironmentOutlined, ClockCircleOutlined,
  WarningOutlined, CheckCircleOutlined, CloseCircleOutlined,
  InfoCircleOutlined, KeyOutlined, SafetyOutlined, AuditOutlined,
  FileProtectOutlined, SecurityScanOutlined, StopOutlined,
  ExclamationCircleOutlined, SaveOutlined, CopyOutlined,
  ApartmentOutlined, BankOutlined, UsergroupAddOutlined,
  EyeInvisibleOutlined, BlockOutlined ,
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import './AccessControl.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const PERMISSION_TYPES = {
  view: { label: 'View', color: 'blue', icon: <EyeOutlined />, description: 'View document metadata and preview' },
  download: { label: 'Download', color: 'cyan', icon: <DownloadOutlined />, description: 'Download original file' },
  print: { label: 'Print', color: 'geekblue', icon: <FileProtectOutlined />, description: 'Print document' },
  edit: { label: 'Edit', color: 'orange', icon: <EditOutlined />, description: 'Edit document content' },
  delete: { label: 'Delete', color: 'red', icon: <DeleteOutlined />, description: 'Delete document' },
  share: { label: 'Share', color: 'purple', icon: <ShareAltOutlined />, description: 'Share with others' },
  approve: { label: 'Approve', color: 'green', icon: <CheckCircleOutlined />, description: 'Approve document' },
  sign: { label: 'Sign', color: 'gold', icon: <SecurityScanOutlined />, description: 'Apply digital signature' },
  admin: { label: 'Admin', color: 'magenta', icon: <SettingOutlined />, description: 'Full administrative control' }
};

const ACCESS_LEVELS = {
  none: { label: 'No Access', color: 'default', icon: <BlockOutlined /> },
  view: { label: 'View Only', color: 'blue', icon: <EyeOutlined /> },
  comment: { label: 'Comment', color: 'cyan', icon: <EditOutlined /> },
  edit: { label: 'Edit', color: 'orange', icon: <EditOutlined /> },
  full: { label: 'Full Control', color: 'red', icon: <LockOutlined /> }
};

const PRINCIPAL_TYPES = {
  user: { label: 'User', icon: <UserOutlined />, color: 'blue' },
  group: { label: 'Group', icon: <TeamOutlined />, color: 'green' },
  department: { label: 'Department', icon: <ApartmentOutlined />, color: 'purple' },
  role: { label: 'Role', icon: <SafetyCertificateOutlined />, color: 'orange' },
  organization: { label: 'Organization', icon: <BankOutlined />, color: 'red' },
  public: { label: 'Public', icon: <GlobalOutlined />, color: 'default' }
};

const SENSITIVITY_LEVELS = {
  public: { label: 'Public', color: 'green', level: 0 },
  internal: { label: 'Internal', color: 'blue', level: 1 },
  confidential: { label: 'Confidential', color: 'orange', level: 2 },
  restricted: { label: 'Restricted', color: 'red', level: 3 },
  top_secret: { label: 'Top Secret', color: 'magenta', level: 4 }
};

const MASKING_RULES = {
  none: { label: 'No Masking', description: 'Show all fields' },
  partial: { label: 'Partial Masking', description: 'Mask sensitive fields (e.g., SSN, salary)' },
  full: { label: 'Full Masking', description: 'Show only document title' },
  custom: { label: 'Custom Rules', description: 'Define custom masking rules' }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const AccessControl = ({
  documentId = null,
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
  const [permissions, setPermissions] = useState([]);
  const [inheritedPermissions, setInheritedPermissions] = useState([]);
  const [document, setDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('permissions');
  
  // UI State
  const [addPrincipalVisible, setAddPrincipalVisible] = useState(false);
  const [editPermissionVisible, setEditPermissionVisible] = useState(false);
  const [auditDrawerVisible, setAuditDrawerVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [auditLog, setAuditLog] = useState([]);
  
  // Settings
  const [sensitivity, setSensitivity] = useState('internal');
  const [maskingRule, setMaskingRule] = useState('none');
  const [inheritFromParent, setInheritFromParent] = useState(true);
  const [downloadRestricted, setDownloadRestricted] = useState(false);
  const [printRestricted, setPrintRestricted] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [ipRestrictions, setIpRestrictions] = useState([]);
  const [timeRestrictions, setTimeRestrictions] = useState(null);
  
  // Forms
  const [principalForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadPermissions = useCallback(async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const [permData, docData, auditData] = await Promise.all([
        documentService.getDocumentPermissions(documentId),
        documentService.getDocument(documentId),
        documentService.getAccessAuditLog(documentId, { limit: 50 })
      ]);
      
      setPermissions(permData.permissions || []);
      setInheritedPermissions(permData.inherited || []);
      setDocument(docData);
      setAuditLog(auditData.logs || []);
      
      // Load security settings
      if (docData.security) {
        setSensitivity(docData.security.sensitivity || 'internal');
        setMaskingRule(docData.security.masking_rule || 'none');
        setInheritFromParent(docData.security.inherit_from_parent ?? true);
        setDownloadRestricted(docData.security.download_restricted || false);
        setPrintRestricted(docData.security.print_restricted || false);
        setWatermarkEnabled(docData.security.watermark_enabled || false);
        setExpiryEnabled(docData.security.expiry_enabled || false);
        setExpiryDate(docData.security.expiry_date || null);
        setIpRestrictions(docData.security.ip_restrictions || []);
        setTimeRestrictions(docData.security.time_restrictions || null);
      }
      
    } catch (error) {
      console.error('Failed to load permissions:', error);
      message.error('Failed to load access control data');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const loadAuditLog = useCallback(async () => {
    if (!documentId) return;
    try {
      const data = await documentService.getAccessAuditLog(documentId, { limit: 100 });
      setAuditLog(data.logs || []);
    } catch (error) {
      console.error('Failed to load audit log:', error);
    }
  }, [documentId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleAddPrincipal = async (values) => {
    setSaving(true);
    try {
      const newPermission = {
        document_id: documentId,
        principal_type: values.principal_type,
        principal_id: values.principal_id,
        principal_name: values.principal_name,
        access_level: values.access_level,
        permissions: values.permissions || [],
        expires_at: values.expires_at || null,
        notes: values.notes || '',
        ip_whitelist: values.ip_whitelist || []
      };
      
      await documentService.addDocumentPermission(newPermission);
      message.success('Access granted successfully');
      setAddPrincipalVisible(false);
      principalForm.resetFields();
      loadPermissions();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to add permission:', error);
      message.error(error.message || 'Failed to add permission');
    } finally {
      setSaving(false);
    }
  };
  
  const handleUpdatePermission = async (values) => {
    setSaving(true);
    try {
      await documentService.updateDocumentPermission(selectedPermission.id, {
        access_level: values.access_level,
        permissions: values.permissions || [],
        expires_at: values.expires_at || null,
        notes: values.notes || ''
      });
      
      message.success('Permission updated');
      setEditPermissionVisible(false);
      setSelectedPermission(null);
      editForm.resetFields();
      loadPermissions();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to update permission:', error);
      message.error(error.message || 'Failed to update permission');
    } finally {
      setSaving(false);
    }
  };
  
  const handleRemovePermission = async (permissionId) => {
    try {
      await documentService.removeDocumentPermission(permissionId);
      message.success('Access revoked');
      loadPermissions();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to remove permission:', error);
      message.error(error.message || 'Failed to revoke access');
    }
  };
  
  const handleBulkRemove = async () => {
    try {
      await Promise.all(
        selectedRowKeys.map(id => documentService.removeDocumentPermission(id))
      );
      message.success(`${selectedRowKeys.length} permissions revoked`);
      setSelectedRowKeys([]);
      loadPermissions();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to bulk remove:', error);
      message.error('Failed to revoke some permissions');
    }
  };
  
  const handleSaveSecuritySettings = async () => {
    setSaving(true);
    try {
      await documentService.updateDocumentSecurity(documentId, {
        sensitivity,
        masking_rule: maskingRule,
        inherit_from_parent: inheritFromParent,
        download_restricted: downloadRestricted,
        print_restricted: printRestricted,
        watermark_enabled: watermarkEnabled,
        expiry_enabled: expiryEnabled,
        expiry_date: expiryDate,
        ip_restrictions: ipRestrictions,
        time_restrictions: timeRestrictions
      });
      
      message.success('Security settings saved');
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      message.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  const handleRevokeAll = async () => {
    Modal.confirm({
      title: 'Revoke All Access',
      content: 'This will remove all explicitly granted permissions. Are you sure?',
      okText: 'Revoke All',
      okType: 'danger',
      onOk: async () => {
        try {
          await documentService.revokeAllDocumentPermissions(documentId);
          message.success('All permissions revoked');
          loadPermissions();
          if (onUpdate) onUpdate();
        } catch (error) {
          message.error('Failed to revoke permissions');
        }
      }
    });
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getSensitivityTag = (level) => {
    const config = SENSITIVITY_LEVELS[level] || SENSITIVITY_LEVELS.internal;
    return <Tag color={config.color}>{config.label}</Tag>;
  };
  
  const getAccessLevelTag = (level) => {
    const config = ACCESS_LEVELS[level];
    if (!config) return <Tag>{level}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };
  
  const getPrincipalTypeTag = (type) => {
    const config = PRINCIPAL_TYPES[type];
    if (!config) return <Tag>{type}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };
  
  const formatDate = (date) => {
    if (!date) return 'Never';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };
  
  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderSecurityOverview = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="security-stat-card">
          <Statistic
            title="Sensitivity Level"
            value={SENSITIVITY_LEVELS[sensitivity]?.label || 'Unknown'}
            prefix={<SafetyOutlined />}
            valueStyle={{ 
              color: sensitivity === 'public' ? '#52c41a' :
                     sensitivity === 'internal' ? '#1890ff' :
                     sensitivity === 'confidential' ? '#faad14' :
                     sensitivity === 'restricted' ? '#f5222d' : '#cf1322',
              fontSize: 16
            }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="security-stat-card">
          <Statistic
            title="Explicit Permissions"
            value={permissions.length}
            prefix={<KeyOutlined />}
            valueStyle={{ color: '#1890ff', fontSize: 20 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="security-stat-card">
          <Statistic
            title="Inherited Permissions"
            value={inheritedPermissions.length}
            prefix={<ApartmentOutlined />}
            valueStyle={{ color: '#722ed1', fontSize: 20 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="security-stat-card">
          <Statistic
            title="Restrictions Active"
            value={[
              downloadRestricted,
              printRestricted,
              watermarkEnabled,
              expiryEnabled,
              ipRestrictions.length > 0
            ].filter(Boolean).length}
            prefix={<LockOutlined />}
            valueStyle={{ color: '#faad14', fontSize: 20 }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderPermissionsTab = () => {
    const columns = [
      {
        title: 'Principal',
        dataIndex: 'principal_name',
        key: 'principal_name',
        render: (name, record) => (
          <Space>
            <Avatar 
              size="small"
              icon={PRINCIPAL_TYPES[record.principal_type]?.icon || <UserOutlined />}
              style={{ 
                backgroundColor: record.principal_type === 'user' ? '#1890ff' :
                                record.principal_type === 'group' ? '#52c41a' :
                                record.principal_type === 'role' ? '#faad14' : '#722ed1'
              }}
            />
            <div>
              <div style={{ fontWeight: 500 }}>{name || record.principal_id}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                {getPrincipalTypeTag(record.principal_type)}
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
        title: 'Permissions',
        dataIndex: 'permissions',
        key: 'permissions',
        render: (perms) => (
          <Space wrap size={[4, 4]}>
            {(perms || []).slice(0, 3).map(p => {
              const config = PERMISSION_TYPES[p];
              return (
                <Tooltip key={p} title={config?.description}>
                  <Tag color={config?.color} icon={config?.icon}>
                    {config?.label || p}
                  </Tag>
                </Tooltip>
              );
            })}
            {(perms || []).length > 3 && (
              <Tooltip title={(perms || []).slice(3).map(p => PERMISSION_TYPES[p]?.label).join(', ')}>
                <Tag>+{perms.length - 3}</Tag>
              </Tooltip>
            )}
          </Space>
        )
      },
      {
        title: 'Expires',
        dataIndex: 'expires_at',
        key: 'expires_at',
        render: (date) => {
          if (!date) return <Text type="secondary">Never</Text>;
          const expired = isExpired(date);
          return (
            <Tag color={expired ? 'red' : 'green'}>
              {expired ? 'Expired' : formatDate(date)}
            </Tag>
          );
        }
      },
      {
        title: 'Granted By',
        dataIndex: 'created_by_name',
        key: 'created_by_name',
        render: (name) => name || 'System'
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        render: (_, record) => (
          <Space>
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedPermission(record);
                  editForm.setFieldsValue({
                    access_level: record.access_level,
                    permissions: record.permissions,
                    expires_at: record.expires_at ? new Date(record.expires_at) : null,
                    notes: record.notes
                  });
                  setEditPermissionVisible(true);
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Revoke this permission?"
              onConfirm={() => handleRemovePermission(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Revoke">
                <Button type="text" size="small" icon={<DeleteOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          </Space>
        )
      }
    ];
    
    return (
      <Card
        title={
          <Space>
            <KeyOutlined />
            <span>Explicit Permissions ({permissions.length})</span>
          </Space>
        }
        size="small"
        extra={
          <Space>
            <Input
              placeholder="Search permissions..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="small"
              style={{ width: 200 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddPrincipalVisible(true)}
              size="small"
            >
              Add Principal
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadPermissions}
              loading={loading}
              size="small"
            />
            <Button
              danger
              icon={<StopOutlined />}
              onClick={handleRevokeAll}
              size="small"
              disabled={permissions.length === 0}
            >
              Revoke All
            </Button>
          </Space>
        }
      >
        {selectedRowKeys.length > 0 && (
          <div style={{ 
            marginBottom: 12, 
            padding: '8px 12px', 
            background: '#f6f8fa', 
            borderRadius: 8 
          }}>
            <Space>
              <span>{selectedRowKeys.length} selected</span>
              <Popconfirm
                title={`Revoke ${selectedRowKeys.length} permissions?`}
                onConfirm={handleBulkRemove}
                okText="Yes"
                cancelText="No"
              >
                <Button danger size="small" icon={<DeleteOutlined />}>
                  Revoke Selected
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )}
        
        <Table
          rowKey="id"
          columns={columns}
          dataSource={permissions.filter(p => 
            !searchText || 
            p.principal_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            p.principal_id?.toLowerCase().includes(searchText.toLowerCase())
          )}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} permissions`
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
          scroll={{ x: 900 }}
          locale={{
            emptyText: <Empty description="No explicit permissions. All access is inherited." />
          }}
        />
      </Card>
    );
  };
  
  const renderInheritedPermissions = () => (
    <Card
      title={
        <Space>
          <ApartmentOutlined />
          <span>Inherited Permissions ({inheritedPermissions.length})</span>
        </Space>
      }
      size="small"
      extra={
        <Space>
          <Switch
            checked={inheritFromParent}
            onChange={setInheritFromParent}
            checkedChildren="Inherit"
            unCheckedChildren="Override"
            size="small"
          />
          <Tooltip title="When enabled, this document inherits permissions from its parent folder">
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </Space>
      }
    >
      {inheritedPermissions.length > 0 ? (
        <List
          dataSource={inheritedPermissions}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    size="small"
                    style={{ backgroundColor: '#722ed1' }}
                  >
                    <ApartmentOutlined />
                  </Avatar>
                }
                title={
                  <Space>
                    <span>{item.principal_name || item.principal_id}</span>
                    {getAccessLevelTag(item.access_level)}
                  </Space>
                }
                description={
                  <div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      Inherited from: <Tag color="purple">{item.source || 'Parent Folder'}</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      Effective: {formatDate(item.effective_from)}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty 
          description="No inherited permissions" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
  
  const renderSecuritySettings = () => (
    <Card title="Security Settings" size="small">
      <Form layout="vertical">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Sensitivity Level">
              <Select value={sensitivity} onChange={setSensitivity} style={{ width: '100%' }}>
                {Object.entries(SENSITIVITY_LEVELS).map(([key, value]) => (
                  <Option key={key} value={key}>
                    <Tag color={value.color}>{value.label}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Field Masking">
              <Select value={maskingRule} onChange={setMaskingRule} style={{ width: '100%' }}>
                {Object.entries(MASKING_RULES).map(([key, value]) => (
                  <Option key={key} value={key}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{value.label}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>{value.description}</div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Divider>Access Restrictions</Divider>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Download Restriction">
              <Switch
                checked={downloadRestricted}
                onChange={setDownloadRestricted}
                checkedChildren="Restricted"
                unCheckedChildren="Allowed"
              />
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                Prevent users from downloading the original file
              </div>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Print Restriction">
              <Switch
                checked={printRestricted}
                onChange={setPrintRestricted}
                checkedChildren="Restricted"
                unCheckedChildren="Allowed"
              />
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                Prevent users from printing
              </div>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Watermark">
              <Switch
                checked={watermarkEnabled}
                onChange={setWatermarkEnabled}
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
              />
              <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                Apply dynamic watermark with user info
              </div>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Access Expiration">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Switch
                  checked={expiryEnabled}
                  onChange={setExpiryEnabled}
                  checkedChildren="Enabled"
                  unCheckedChildren="Disabled"
                />
                {expiryEnabled && (
                  <DatePicker
                    value={expiryDate ? new Date(expiryDate) : null}
                    onChange={setExpiryDate}
                    showTime
                    style={{ width: '100%' }}
                    placeholder="Access expires on"
                  />
                )}
              </Space>
            </Form.Item>
          </Col>
        </Row>
        
        <Divider>IP Restrictions</Divider>
        
        <Form.Item label="IP Whitelist" extra="Only these IPs can access the document (leave empty for all)">
          <Select
            mode="tags"
            value={ipRestrictions}
            onChange={setIpRestrictions}
            placeholder="Enter IP addresses or CIDR ranges (e.g., 192.168.1.0/24)"
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <Divider>Time Restrictions</Divider>
        
        <Form.Item label="Access Hours" extra="Restrict access to specific times">
          <Space>
            <Select
              value={timeRestrictions?.start || null}
              onChange={(val) => setTimeRestrictions({ ...timeRestrictions, start: val })}
              placeholder="Start time"
              style={{ width: 120 }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <Option key={i} value={`${String(i).padStart(2, '0')}:00`}>
                  {String(i).padStart(2, '0')}:00
                </Option>
              ))}
            </Select>
            <Text>to</Text>
            <Select
              value={timeRestrictions?.end || null}
              onChange={(val) => setTimeRestrictions({ ...timeRestrictions, end: val })}
              placeholder="End time"
              style={{ width: 120 }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <Option key={i} value={`${String(i).padStart(2, '0')}:00`}>
                  {String(i).padStart(2, '0')}:00
                </Option>
              ))}
            </Select>
            <Select
              mode="multiple"
              value={timeRestrictions?.days || []}
              onChange={(val) => setTimeRestrictions({ ...timeRestrictions, days: val })}
              placeholder="Days"
              style={{ width: 200 }}
            >
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <Option key={d} value={d}>{d}</Option>
              ))}
            </Select>
          </Space>
        </Form.Item>
        
        <Divider />
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button icon={<ReloadOutlined />} onClick={loadPermissions}>
              Reset
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSaveSecuritySettings}
              loading={saving}
            >
              Save Settings
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
  
  const renderAuditLog = () => (
    <Card
      title={
        <Space>
          <AuditOutlined />
          <span>Access Audit Log</span>
        </Space>
      }
      size="small"
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadAuditLog}
          size="small"
        >
          Refresh
        </Button>
      }
    >
      {auditLog.length > 0 ? (
        <Timeline mode="left">
          {auditLog.slice(0, 30).map((log, index) => (
            <Timeline.Item
              key={index}
              color={
                log.action === 'grant' ? 'green' :
                log.action === 'revoke' ? 'red' :
                log.action === 'view' ? 'blue' :
                log.action === 'download' ? 'cyan' :
                log.action === 'denied' ? 'red' : 'gray'
              }
              label={formatDate(log.created_at)}
            >
              <Card size="small" style={{ background: '#fafafa' }}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Space>
                    <Tag 
                      color={
                        log.action === 'grant' ? 'green' :
                        log.action === 'revoke' ? 'red' :
                        log.action === 'denied' ? 'red' : 'blue'
                      }
                    >
                      {log.action?.toUpperCase()}
                    </Tag>
                    <Text strong>{log.user_name || log.user_id || 'System'}</Text>
                    {log.actor_name && log.actor_name !== log.user_name && (
                      <Text type="secondary">(by {log.actor_name})</Text>
                    )}
                  </Space>
                  <Text>{log.description || `Action: ${log.action}`}</Text>
                  {log.ip_address && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      IP: {log.ip_address}
                      {log.user_agent && ` • ${log.user_agent.substring(0, 50)}...`}
                    </Text>
                  )}
                </Space>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Empty description="No audit log entries" />
      )}
    </Card>
  );
  
  // ============================================================
  // MODALS
  // ============================================================
  
  const renderAddPrincipalModal = () => (
    <Modal
      title={
        <Space>
          <UsergroupAddOutlined style={{ color: '#1890ff' }} />
          <span>Grant Document Access</span>
        </Space>
      }
      open={addPrincipalVisible}
      onCancel={() => {
        setAddPrincipalVisible(false);
        principalForm.resetFields();
      }}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={principalForm}
        layout="vertical"
        onFinish={handleAddPrincipal}
        initialValues={{
          principal_type: 'user',
          access_level: 'view',
          permissions: ['view']
        }}
      >
        <Form.Item
          name="principal_type"
          label="Principal Type"
          rules={[{ required: true }]}
        >
          <Segmented
            options={Object.entries(PRINCIPAL_TYPES).map(([key, value]) => ({
              label: (
                <Space>
                  {value.icon}
                  {value.label}
                </Space>
              ),
              value: key
            }))}
          />
        </Form.Item>
        
        <Form.Item
          name="principal_id"
          label="Select Principal"
          rules={[{ required: true, message: 'Please select a principal' }]}
        >
          <Select
            placeholder="Search and select..."
            showSearch
            optionFilterProp="children"
            style={{ width: '100%' }}
          >
            {/* These would be populated from API based on principal_type */}
            <Option value="user_1">John Smith (john@company.com)</Option>
            <Option value="user_2">Jane Doe (jane@company.com)</Option>
            <Option value="group_1">HSE Team</Option>
            <Option value="group_2">Safety Committee</Option>
            <Option value="dept_1">Operations Department</Option>
            <Option value="role_1">Approvers</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="access_level"
          label="Access Level"
          rules={[{ required: true }]}
        >
          <Radio.Group buttonStyle="solid">
            {Object.entries(ACCESS_LEVELS).map(([key, value]) => (
              <Radio.Button key={key} value={key}>
                <Space>
                  {value.icon}
                  {value.label}
                </Space>
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
        
        <Form.Item
          name="permissions"
          label="Specific Permissions"
          extra="Select which actions are allowed"
        >
          <Checkbox.Group style={{ width: '100%' }}>
            <Row gutter={[8, 8]}>
              {Object.entries(PERMISSION_TYPES).map(([key, value]) => (
                <Col xs={12} sm={8} key={key}>
                  <Checkbox value={key}>
                    <Tooltip title={value.description}>
                      <Space>
                        {value.icon}
                        {value.label}
                      </Space>
                    </Tooltip>
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
        
        <Form.Item
          name="expires_at"
          label="Expiration Date"
          extra="Leave empty for permanent access"
        >
          <DatePicker 
            showTime 
            style={{ width: '100%' }}
            placeholder="Select expiration date"
            disabledDate={(current) => current && current < new Date()}
          />
        </Form.Item>
        
        <Form.Item
          name="ip_whitelist"
          label="IP Whitelist (Optional)"
          extra="Restrict access to specific IPs"
        >
          <Select
            mode="tags"
            placeholder="e.g., 192.168.1.100"
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <Form.Item name="notes" label="Notes">
          <TextArea rows={2} placeholder="Reason for granting access..." />
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setAddPrincipalVisible(false);
              principalForm.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Grant Access
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderEditPermissionModal = () => (
    <Modal
      title="Edit Permission"
      open={editPermissionVisible}
      onCancel={() => {
        setEditPermissionVisible(false);
        setSelectedPermission(null);
        editForm.resetFields();
      }}
      footer={null}
      width={500}
      destroyOnClose
    >
      {selectedPermission && (
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdatePermission}
        >
          <Alert
            message={
              <Space>
                <UserOutlined />
                <span>{selectedPermission.principal_name || selectedPermission.principal_id}</span>
                {getPrincipalTypeTag(selectedPermission.principal_type)}
              </Space>
            }
            type="info"
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item
            name="access_level"
            label="Access Level"
            rules={[{ required: true }]}
          >
            <Radio.Group buttonStyle="solid">
              {Object.entries(ACCESS_LEVELS).map(([key, value]) => (
                <Radio.Button key={key} value={key}>
                  {value.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
          
          <Form.Item name="permissions" label="Permissions">
            <Checkbox.Group style={{ width: '100%' }}>
              <Row gutter={[8, 8]}>
                {Object.entries(PERMISSION_TYPES).map(([key, value]) => (
                  <Col xs={12} key={key}>
                    <Checkbox value={key}>
                      <Space>
                        {value.icon}
                        {value.label}
                      </Space>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          
          <Form.Item name="expires_at" label="Expiration Date">
            <DatePicker 
              showTime 
              style={{ width: '100%' }}
              placeholder="Leave empty for permanent"
            />
          </Form.Item>
          
          <Form.Item name="notes" label="Notes">
            <TextArea rows={2} />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setEditPermissionVisible(false);
                setSelectedPermission(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                Update Permission
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  if (!documentId) {
    return (
      <div className="access-control" style={{ padding: embedded ? 0 : 24 }}>
        <Result
          icon={<LockOutlined style={{ color: '#8c8c8c' }} />}
          title="Select a Document"
          subTitle="Choose a document to manage its access control settings"
        />
      </div>
    );
  }

  return (
    <div className="access-control" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="access-control-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <LockOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Access Control</Title>
              {document && (
                <>
                  <Tag color="blue">{document.title}</Tag>
                  {getSensitivityTag(sensitivity)}
                </>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<AuditOutlined />}
                onClick={() => setAuditDrawerVisible(true)}
              >
                Audit Log ({auditLog.length})
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadPermissions}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Security Overview */}
      {renderSecurityOverview()}
      
      {/* Warning if inheriting */}
      {inheritFromParent && inheritedPermissions.length > 0 && (
        <Alert
          message="Inheriting Permissions"
          description={
            <span>
              This document inherits {inheritedPermissions.length} permissions from its parent folder. 
              Explicit permissions below override inherited ones.
            </span>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
          closable
        />
      )}
      
      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'permissions',
            label: (
              <Space>
                <KeyOutlined />
                Permissions
                <Badge count={permissions.length} style={{ backgroundColor: '#1890ff' }} />
              </Space>
            ),
            children: renderPermissionsTab()
          },
          {
            key: 'inherited',
            label: (
              <Space>
                <ApartmentOutlined />
                Inherited
                <Badge count={inheritedPermissions.length} style={{ backgroundColor: '#722ed1' }} />
              </Space>
            ),
            children: renderInheritedPermissions()
          },
          {
            key: 'settings',
            label: (
              <Space>
                <SettingOutlined />
                Security Settings
              </Space>
            ),
            children: renderSecuritySettings()
          },
          {
            key: 'audit',
            label: (
              <Space>
                <AuditOutlined />
                Audit Log
              </Space>
            ),
            children: renderAuditLog()
          }
        ]}
      />
      
      {/* Modals */}
      {renderAddPrincipalModal()}
      {renderEditPermissionModal()}
      
      {/* Audit Drawer */}
      <Drawer
        title={
          <Space>
            <AuditOutlined />
            <span>Access Audit Log</span>
          </Space>
        }
        open={auditDrawerVisible}
        onClose={() => setAuditDrawerVisible(false)}
        width={700}
      >
        {renderAuditLog()}
      </Drawer>
    </div>
  );
};

export default AccessControl;