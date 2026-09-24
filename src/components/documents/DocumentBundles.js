// src/components/documents/DocumentBundles.jsx
// Case file management: bundle related documents (incident + SDS + permits + photos)
// into a single packaged case, share as portal link, and export as ZIP/PDF

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Modal, Form,
  message, Popconfirm, Drawer, Descriptions, Tabs, Timeline,
  Avatar, List, Badge, Tooltip, Progress, Switch, Empty, Spin,
  Alert, Divider, Typography, Collapse, Checkbox, Radio, Slider,
  Transfer, Tree, Cascader, DatePicker, InputNumber, Segmented,
  Statistic, Result, Steps, Tag, Upload, TreeSelect, Table
} from 'antd';
import {
  FolderOpenOutlined, FileZipOutlined, PlusOutlined,
  DeleteOutlined, EditOutlined, EyeOutlined, DownloadOutlined,
  ShareAltOutlined, LinkOutlined, CopyOutlined, PrinterOutlined,
  FilePdfOutlined, FileTextOutlined, FileExcelOutlined,
  FileImageOutlined, FileOutlined, InboxOutlined, SearchOutlined,
  ReloadOutlined, FilterOutlined, ExportOutlined, ImportOutlined,
  LockOutlined, UnlockOutlined, GlobalOutlined, TeamOutlined,
  UserOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, WarningOutlined,
  InfoCircleOutlined, SettingOutlined, SaveOutlined,
  AuditOutlined, HistoryOutlined, DragOutlined, SwapOutlined,
  FolderAddOutlined, FolderViewOutlined, PaperClipOutlined,
  CloudDownloadOutlined, CloudUploadOutlined, StarOutlined,
  StarFilled, HeartOutlined, BookOutlined, TagsOutlined, SyncOutlined, FolderOutlined,
  ApartmentOutlined, DeploymentUnitOutlined, MergeCellsOutlined, SafetyCertificateOutlined, FileProtectOutlined,
  SplitCellsOutlined, DragOutlined as DragIcon
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';
import './DocumentBundles.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Dragger } = Upload;
const { DirectoryTree } = Tree;

// ============================================================
// CONSTANTS
// ============================================================

const BUNDLE_TYPES = {
  incident: { label: 'Incident Case File', icon: <WarningOutlined />, color: '#f5222d', description: 'Complete incident documentation' },
  audit: { label: 'Audit Package', icon: <AuditOutlined />, color: '#1890ff', description: 'Audit evidence and reports' },
  project: { label: 'Project File', icon: <ApartmentOutlined />, color: '#722ed1', description: 'Project documentation' },
  compliance: { label: 'Compliance Package', icon: <SafetyCertificateOutlined />, color: '#52c41a', description: 'Regulatory compliance evidence' },
  investigation: { label: 'Investigation File', icon: <SearchOutlined />, color: '#faad14', description: 'Investigation case file' },
  legal: { label: 'Legal Case File', icon: <FileProtectOutlined />, color: '#cf1322', description: 'Legal matter documentation' },
  training: { label: 'Training Package', icon: <BookOutlined />, color: '#13c2c2', description: 'Training materials bundle' },
  handover: { label: 'Handover Package', icon: <SwapOutlined />, color: '#fa541c', description: 'Document handover' },
  custom: { label: 'Custom Bundle', icon: <FolderOpenOutlined />, color: '#8c8c8c', description: 'Custom document set' }
};

const BUNDLE_STATUS = {
  draft: { label: 'Draft', color: 'default', icon: <EditOutlined /> },
  building: { label: 'Building', color: 'processing', icon: <SyncOutlined spin /> },
  ready: { label: 'Ready', color: 'success', icon: <CheckCircleOutlined /> },
  shared: { label: 'Shared', color: 'blue', icon: <ShareAltOutlined /> },
  archived: { label: 'Archived', color: 'warning', icon: <FolderOutlined /> },
  locked: { label: 'Locked', color: 'error', icon: <LockOutlined /> }
};

const EXPORT_FORMATS = {
  zip: { label: 'ZIP Archive', icon: <FileZipOutlined />, color: '#faad14' },
  pdf: { label: 'Merged PDF', icon: <FilePdfOutlined />, color: '#f5222d' },
  folder: { label: 'Folder Structure', icon: <FolderOpenOutlined />, color: '#1890ff' }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentBundles = ({
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
  const [bundles, setBundles] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [bundleDocuments, setBundleDocuments] = useState([]);
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    ready: 0,
    shared: 0,
    total_size: 0
  });
  
  // UI State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [documentPickerVisible, setDocumentPickerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Create form state
  const [bundleName, setBundleName] = useState('');
  const [bundleType, setBundleType] = useState('custom');
  const [bundleDescription, setBundleDescription] = useState('');
  const [bundleTags, setBundleTags] = useState([]);
  const [bundleConfidential, setBundleConfidential] = useState(false);
  const [bundleExpiry, setBundleExpiry] = useState(null);
  
  // Export state
  const [exportFormat, setExportFormat] = useState('zip');
  const [includeManifest, setIncludeManifest] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  
  // Share state
  const [shareLink, setShareLink] = useState('');
  const [shareExpiry, setShareExpiry] = useState(null);
  const [sharePassword, setSharePassword] = useState('');
  const [shareRecipients, setShareRecipients] = useState([]);
  const [shareNotifications, setShareNotifications] = useState(true);
  
  // Document picker
  const [selectedDocs, setSelectedDocs] = useState([]);
  
  // Forms
  const [form] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadBundles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentService.getBundles({ 
        company_id: companyId,
        limit: 100 
      });
      
      const bundlesData = data.bundles || [];
      setBundles(bundlesData);
      
      // Calculate stats
      setStats({
        total: bundlesData.length,
        draft: bundlesData.filter(b => b.status === 'draft').length,
        ready: bundlesData.filter(b => b.status === 'ready').length,
        shared: bundlesData.filter(b => b.status === 'shared').length,
        total_size: bundlesData.reduce((sum, b) => sum + (b.total_size || 0), 0)
      });
      
    } catch (error) {
      console.error('Failed to load bundles:', error);
      message.error('Failed to load bundles');
    } finally {
      setLoading(false);
    }
  }, [companyId]);
  
  const loadBundleDetail = useCallback(async (bundleId) => {
    try {
      const [bundleData, docsData] = await Promise.all([
        documentService.getBundle(bundleId),
        documentService.getBundleDocuments(bundleId)
      ]);
      
      setSelectedBundle(bundleData);
      setBundleDocuments(docsData.documents || []);
      
    } catch (error) {
      console.error('Failed to load bundle detail:', error);
      message.error('Failed to load bundle detail');
    }
  }, []);
  
  const loadAvailableDocuments = useCallback(async () => {
    try {
      const data = await documentService.getDocuments({ 
        company_id: companyId,
        limit: 500,
        exclude_bundled: selectedBundle?.id
      });
      setAvailableDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  }, [companyId, selectedBundle]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleCreateBundle = async () => {
    if (!bundleName.trim()) {
      message.error('Please enter a bundle name');
      return;
    }
    
    setSaving(true);
    try {
      const result = await documentService.createBundle({
        name: bundleName.trim(),
        type: bundleType,
        description: bundleDescription,
        tags: bundleTags,
        is_confidential: bundleConfidential,
        expires_at: bundleExpiry,
        company_id: companyId
      });
      
      message.success('Bundle created successfully');
      setCreateModalVisible(false);
      resetCreateForm();
      
      if (result.id) {
        setSelectedBundle(result);
        setDetailDrawerVisible(true);
        loadBundleDetail(result.id);
      }
      
      loadBundles();
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to create bundle:', error);
      message.error(error.message || 'Failed to create bundle');
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddDocuments = async () => {
    if (selectedDocs.length === 0) {
      message.warning('Please select documents to add');
      return;
    }
    
    setSaving(true);
    try {
      await documentService.addDocumentsToBundle(selectedBundle.id, selectedDocs);
      message.success(`${selectedDocs.length} documents added to bundle`);
      setDocumentPickerVisible(false);
      setSelectedDocs([]);
      loadBundleDetail(selectedBundle.id);
      loadBundles();
      
    } catch (error) {
      console.error('Failed to add documents:', error);
      message.error('Failed to add documents');
    } finally {
      setSaving(false);
    }
  };
  
  const handleRemoveDocument = async (documentId) => {
    try {
      await documentService.removeDocumentFromBundle(selectedBundle.id, documentId);
      message.success('Document removed from bundle');
      loadBundleDetail(selectedBundle.id);
      loadBundles();
    } catch (error) {
      console.error('Failed to remove document:', error);
      message.error('Failed to remove document');
    }
  };
  
  const handleExportBundle = async () => {
    if (!selectedBundle) return;
    
    setSaving(true);
    try {
      const result = await documentService.exportBundle(selectedBundle.id, {
        format: exportFormat,
        include_manifest: includeManifest,
        include_metadata: includeMetadata,
        password: passwordProtected ? exportPassword : null
      });
      
      if (result.download_url) {
        const a = document.createElement('a');
        a.href = result.download_url;
        a.download = `${selectedBundle.name}.${exportFormat}`;
        a.click();
      }
      
      message.success('Bundle exported successfully');
      setExportModalVisible(false);
      
    } catch (error) {
      console.error('Failed to export bundle:', error);
      message.error(error.message || 'Failed to export bundle');
    } finally {
      setSaving(false);
    }
  };
  
  const handleShareBundle = async () => {
    if (!selectedBundle) return;
    
    setSaving(true);
    try {
      const result = await documentService.shareBundle(selectedBundle.id, {
        expires_at: shareExpiry,
        password: sharePassword || null,
        recipients: shareRecipients,
        send_notifications: shareNotifications
      });
      
      setShareLink(result.share_url);
      message.success('Share link generated');
      
      if (shareRecipients.length > 0 && shareNotifications) {
        message.success(`Notifications sent to ${shareRecipients.length} recipients`);
      }
      
      loadBundles();
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to share bundle:', error);
      message.error(error.message || 'Failed to share bundle');
    } finally {
      setSaving(false);
    }
  };
  
  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    message.success('Link copied to clipboard');
  };
  
  const handleDeleteBundle = async (bundleId) => {
    try {
      await documentService.deleteBundle(bundleId);
      message.success('Bundle deleted');
      setDetailDrawerVisible(false);
      setSelectedBundle(null);
      loadBundles();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to delete bundle:', error);
      message.error('Failed to delete bundle');
    }
  };
  
  const handleLockBundle = async () => {
    try {
      const newLockState = !selectedBundle.is_locked;
      await documentService.lockBundle(selectedBundle.id, newLockState);
      message.success(`Bundle ${newLockState ? 'locked' : 'unlocked'}`);
      loadBundleDetail(selectedBundle.id);
      loadBundles();
    } catch (error) {
      message.error('Failed to update lock state');
    }
  };
  
  const handleMarkReady = async () => {
    if (bundleDocuments.length === 0) {
      message.warning('Add documents before marking as ready');
      return;
    }
    
    try {
      await documentService.updateBundle(selectedBundle.id, { status: 'ready' });
      message.success('Bundle marked as ready');
      loadBundleDetail(selectedBundle.id);
      loadBundles();
    } catch (error) {
      message.error('Failed to update status');
    }
  };
  
  const resetCreateForm = () => {
    setBundleName('');
    setBundleType('custom');
    setBundleDescription('');
    setBundleTags([]);
    setBundleConfidential(false);
    setBundleExpiry(null);
    form.resetFields();
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadBundles();
  }, [loadBundles]);
  
  useEffect(() => {
    if (documentPickerVisible) {
      loadAvailableDocuments();
    }
  }, [documentPickerVisible, loadAvailableDocuments]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getBundleTypeConfig = (type) => {
    return BUNDLE_TYPES[type] || BUNDLE_TYPES.custom;
  };
  
  const getStatusTag = (status) => {
    const config = BUNDLE_STATUS[status];
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };
  
  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf': return <FilePdfOutlined style={{ color: '#f5222d' }} />;
      case 'doc':
      case 'docx': return <FileWordOutlined style={{ color: '#1890ff' }} />;
      case 'xls':
      case 'xlsx': return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png': return <FileImageOutlined style={{ color: '#faad14' }} />;
      default: return <FileOutlined />;
    }
  };
  
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="bundle-stat-card">
          <Statistic
            title="Total Bundles"
            value={stats.total}
            prefix={<FolderOpenOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="bundle-stat-card">
          <Statistic
            title="Ready to Share"
            value={stats.ready}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="bundle-stat-card">
          <Statistic
            title="Currently Shared"
            value={stats.shared}
            prefix={<ShareAltOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="bundle-stat-card">
          <Statistic
            title="Total Storage"
            value={formatFileSize(stats.total_size)}
            prefix={<CloudUploadOutlined />}
            valueStyle={{ color: '#13c2c2', fontSize: 16 }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderBundlesGrid = () => (
    <Row gutter={[16, 16]}>
      {bundles.map(bundle => {
        const typeConfig = getBundleTypeConfig(bundle.type);
        const statusConfig = BUNDLE_STATUS[bundle.status] || BUNDLE_STATUS.draft;
        
        return (
          <Col xs={24} sm={12} lg={8} xl={6} key={bundle.id}>
            <Card
              hoverable
              className="bundle-card"
              style={{ borderLeft: `4px solid ${typeConfig.color}` }}
              onClick={() => {
                setSelectedBundle(bundle);
                setDetailDrawerVisible(true);
                loadBundleDetail(bundle.id);
              }}
              actions={[
                <Tooltip title="Add Documents" key="add">
                  <PlusOutlined onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBundle(bundle);
                    setDocumentPickerVisible(true);
                  }} />
                </Tooltip>,
                <Tooltip title="Export" key="export">
                  <DownloadOutlined onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBundle(bundle);
                    setExportModalVisible(true);
                  }} />
                </Tooltip>,
                <Tooltip title="Share" key="share">
                  <ShareAltOutlined onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBundle(bundle);
                    setShareModalVisible(true);
                  }} />
                </Tooltip>,
                <Popconfirm
                  key="delete"
                  title="Delete this bundle?"
                  description="Documents inside will remain."
                  onConfirm={(e) => {
                    e?.stopPropagation?.();
                    handleDeleteBundle(bundle.id);
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteOutlined 
                    style={{ color: '#f5222d' }} 
                    onClick={(e) => e.stopPropagation()} 
                  />
                </Popconfirm>
              ]}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <Space>
                    <Avatar 
                      icon={typeConfig.icon} 
                      style={{ backgroundColor: typeConfig.color }}
                      size="small"
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{bundle.name}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                        {typeConfig.label}
                      </div>
                    </div>
                  </Space>
                </div>
                {bundle.is_locked && (
                  <Tooltip title="Locked">
                    <LockOutlined style={{ color: '#f5222d' }} />
                  </Tooltip>
                )}
              </div>
              
              <div style={{ marginBottom: 12 }}>
                {getStatusTag(bundle.status)}
                {bundle.is_confidential && (
                  <Tag color="red" icon={<LockOutlined />} style={{ marginLeft: 4 }}>
                    Confidential
                  </Tag>
                )}
              </div>
              
              <Paragraph 
                ellipsis={{ rows: 2 }} 
                style={{ fontSize: 12, color: '#595959', marginBottom: 12, minHeight: 40 }}
              >
                {bundle.description || 'No description'}
              </Paragraph>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: 11, 
                color: '#8c8c8c',
                paddingTop: 8,
                borderTop: '1px solid #f0f0f0'
              }}>
                <Space size={4}>
                  <PaperClipOutlined />
                  <span>{bundle.document_count || 0} docs</span>
                </Space>
                <Space size={4}>
                  <CloudUploadOutlined />
                  <span>{formatFileSize(bundle.total_size)}</span>
                </Space>
              </div>
              
              {bundle.tags?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {bundle.tags.slice(0, 3).map(tag => (
                    <Tag key={tag} style={{ fontSize: 10, marginBottom: 4 }}>{tag}</Tag>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        );
      })}
      
      {bundles.length === 0 && !loading && (
        <Col span={24}>
          <Empty
            description={
              <div>
                <Title level={5}>No Bundles Yet</Title>
                <Text type="secondary">Create a bundle to organize related documents together</Text>
              </div>
            }
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create First Bundle
            </Button>
          </Empty>
        </Col>
      )}
    </Row>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderCreateModal = () => (
    <Modal
      title={
        <Space>
          <FolderAddOutlined style={{ color: '#1890ff' }} />
          <span>Create Document Bundle</span>
        </Space>
      }
      open={createModalVisible}
      onCancel={() => {
        setCreateModalVisible(false);
        resetCreateForm();
      }}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleCreateBundle}>
        <Form.Item label="Bundle Type" required>
          <Segmented
            value={bundleType}
            onChange={setBundleType}
            options={Object.entries(BUNDLE_TYPES).map(([key, value]) => ({
              label: (
                <Tooltip title={value.description}>
                  <Space size={4}>
                    <span style={{ color: value.color }}>{value.icon}</span>
                    <span style={{ fontSize: 11 }}>{value.label}</span>
                  </Space>
                </Tooltip>
              ),
              value: key
            }))}
            block
          />
        </Form.Item>
        
        <Form.Item label="Bundle Name" required>
          <Input
            value={bundleName}
            onChange={(e) => setBundleName(e.target.value)}
            placeholder="e.g., Incident #2024-001 Case File"
            maxLength={150}
            showCount
          />
        </Form.Item>
        
        <Form.Item label="Description">
          <TextArea
            value={bundleDescription}
            onChange={(e) => setBundleDescription(e.target.value)}
            rows={3}
            placeholder="Describe the purpose of this bundle..."
            maxLength={500}
            showCount
          />
        </Form.Item>
        
        <Form.Item label="Tags">
          <Select
            mode="tags"
            value={bundleTags}
            onChange={setBundleTags}
            placeholder="Add tags for categorization"
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Confidential Bundle">
              <Switch
                checked={bundleConfidential}
                onChange={setBundleConfidential}
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Expiry Date">
              <DatePicker
                value={bundleExpiry}
                onChange={setBundleExpiry}
                style={{ width: '100%' }}
                placeholder="Optional"
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Alert
          message="Next Steps"
          description="After creating the bundle, you can add documents, configure export options, and share it with others."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setCreateModalVisible(false);
              resetCreateForm();
            }}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saving}
              icon={<FolderAddOutlined />}
            >
              Create Bundle
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderDocumentPicker = () => (
    <Modal
      title={
        <Space>
          <PaperClipOutlined />
          <span>Add Documents to Bundle</span>
          {selectedBundle && <Tag color="blue">{selectedBundle.name}</Tag>}
        </Space>
      }
      open={documentPickerVisible}
      onCancel={() => {
        setDocumentPickerVisible(false);
        setSelectedDocs([]);
      }}
      onOk={handleAddDocuments}
      okText={`Add ${selectedDocs.length} Document(s)`}
      okButtonProps={{ disabled: selectedDocs.length === 0 }}
      confirmLoading={saving}
      width={900}
    >
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search available documents..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: '100%' }}
        />
      </div>
      
      <Transfer
        dataSource={availableDocuments.map(doc => ({
          key: doc.id,
          title: doc.title,
          description: `${doc.module || 'General'} • ${formatFileSize(doc.file_size)}`,
          type: doc.document_type,
          file_name: doc.file_name
        }))}
        titles={['Available Documents', 'Selected for Bundle']}
        targetKeys={selectedDocs}
        onChange={setSelectedDocs}
        render={item => (
          <Space>
            {getFileIcon(item.file_name)}
            <div>
              <div style={{ fontSize: 12 }}>{item.title}</div>
              <div style={{ fontSize: 10, color: '#8c8c8c' }}>{item.description}</div>
            </div>
          </Space>
        )}
        listStyle={{ width: '100%', height: 400 }}
        showSearch
        filterOption={(input, item) => 
          item.title?.toLowerCase().includes(input.toLowerCase())
        }
      />
    </Modal>
  );
  
  const renderExportModal = () => (
    <Modal
      title={
        <Space>
          <DownloadOutlined />
          <span>Export Bundle</span>
          {selectedBundle && <Tag color="blue">{selectedBundle.name}</Tag>}
        </Space>
      }
      open={exportModalVisible}
      onCancel={() => setExportModalVisible(false)}
      onOk={handleExportBundle}
      confirmLoading={saving}
      okText="Export Bundle"
      width={500}
    >
      <Alert
        message="Export Options"
        description="Choose how to package the bundle. ZIP creates separate files; Merged PDF combines everything into one document."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Form layout="vertical">
        <Form.Item label="Export Format" required>
          <Radio.Group 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {Object.entries(EXPORT_FORMATS).map(([key, value]) => (
                <Radio key={key} value={key} style={{ padding: 8, width: '100%' }}>
                  <Space>
                    <span style={{ color: value.color, fontSize: 18 }}>{value.icon}</span>
                    <span>{value.label}</span>
                  </Space>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>
        
        <Divider>Include in Export</Divider>
        
        <Space direction="vertical">
          <Checkbox
            checked={includeManifest}
            onChange={(e) => setIncludeManifest(e.target.checked)}
          >
            Include manifest file (list of contents)
          </Checkbox>
          <Checkbox
            checked={includeMetadata}
            onChange={(e) => setIncludeMetadata(e.target.checked)}
          >
            Include metadata and audit trail
          </Checkbox>
        </Space>
        
        <Divider>Security</Divider>
        
        <Form.Item>
          <Checkbox
            checked={passwordProtected}
            onChange={(e) => setPasswordProtected(e.target.checked)}
          >
            Password protect the export
          </Checkbox>
          {passwordProtected && (
            <Input.Password
              value={exportPassword}
              onChange={(e) => setExportPassword(e.target.value)}
              placeholder="Enter password"
              style={{ marginTop: 8 }}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderShareModal = () => (
    <Modal
      title={
        <Space>
          <ShareAltOutlined />
          <span>Share Bundle</span>
          {selectedBundle && <Tag color="blue">{selectedBundle.name}</Tag>}
        </Space>
      }
      open={shareModalVisible}
      onCancel={() => setShareModalVisible(false)}
      footer={null}
      width={600}
    >
      {!shareLink ? (
        <Form layout="vertical" onFinish={handleShareBundle}>
          <Form.Item label="Share with Recipients">
            <Select
              mode="tags"
              value={shareRecipients}
              onChange={setShareRecipients}
              placeholder="Enter email addresses"
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
              Recipients will receive an email with the share link
            </div>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Expiry Date">
                <DatePicker
                  value={shareExpiry}
                  onChange={setShareExpiry}
                  style={{ width: '100%' }}
                  placeholder="Never expires"
                  showTime
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Password Protection">
                <Input.Password
                  value={sharePassword}
                  onChange={(e) => setSharePassword(e.target.value)}
                  placeholder="Optional"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Checkbox
              checked={shareNotifications}
              onChange={(e) => setShareNotifications(e.target.checked)}
            >
              Send email notifications to recipients
            </Checkbox>
          </Form.Item>
          
          <Divider />
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShareModalVisible(false)}>Cancel</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving}
                icon={<LinkOutlined />}
              >
                Generate Share Link
              </Button>
            </Space>
          </Form.Item>
        </Form>
      ) : (
        <div>
          <Alert
            message="Share Link Generated"
            description="Copy this link and share it with your team."
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <div style={{
            padding: 12,
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 8,
            display: 'flex',
            gap: 8,
            alignItems: 'center'
          }}>
            <LinkOutlined style={{ color: '#52c41a' }} />
            <Text copyable style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}>
              {shareLink}
            </Text>
            <Button 
              type="primary" 
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopyShareLink}
            >
              Copy
            </Button>
          </div>
          
          <Divider />
          
          <Space>
            <Button icon={<EyeOutlined />}>Preview</Button>
            <Button icon={<QrcodeOutlined />}>QR Code</Button>
            <Button icon={<MailOutlined />}>Send Email</Button>
            <Button danger onClick={() => setShareLink('')}>
              Revoke Link
            </Button>
          </Space>
        </div>
      )}
    </Modal>
  );

  // ============================================================
  // DETAIL DRAWER
  // ============================================================
  
  const renderDetailDrawer = () => {
    if (!selectedBundle) return null;
    
    const typeConfig = getBundleTypeConfig(selectedBundle.type);
    
    return (
      <Drawer
        title={
          <Space>
            <Avatar 
              icon={typeConfig.icon} 
              style={{ backgroundColor: typeConfig.color }}
              size="small"
            />
            <span>{selectedBundle.name}</span>
            {getStatusTag(selectedBundle.status)}
          </Space>
        }
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedBundle(null);
        }}
        width={900}
        extra={
          <Space>
            <Tooltip title={selectedBundle.is_locked ? 'Unlock' : 'Lock'}>
              <Button 
                icon={selectedBundle.is_locked ? <UnlockOutlined /> : <LockOutlined />}
                onClick={handleLockBundle}
                danger={selectedBundle.is_locked}
              />
            </Tooltip>
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => setExportModalVisible(true)}
            >
              Export
            </Button>
            <Button 
              type="primary"
              icon={<ShareAltOutlined />}
              onClick={() => setShareModalVisible(true)}
            >
              Share
            </Button>
          </Space>
        }
      >
        <Tabs
          defaultActiveKey="documents"
          items={[
            {
              key: 'documents',
              label: (
                <Space>
                  <PaperClipOutlined />
                  Documents
                  <Badge count={bundleDocuments.length} style={{ backgroundColor: '#1890ff' }} />
                </Space>
              ),
              children: (
                <Card
                  size="small"
                  title="Documents in Bundle"
                  extra={
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => setDocumentPickerVisible(true)}
                      disabled={selectedBundle.is_locked}
                    >
                      Add Documents
                    </Button>
                  }
                >
                  {bundleDocuments.length > 0 ? (
                    <List
                      dataSource={bundleDocuments}
                      renderItem={(doc, index) => (
                        <List.Item
                          actions={[
                            <Tooltip title="View" key="view">
                              <Button
                                type="text"
                                size="small"
                                icon={<EyeOutlined />}
                              />
                            </Tooltip>,
                            <Tooltip title="Remove" key="remove">
                              <Popconfirm
                                title="Remove from bundle?"
                                onConfirm={() => handleRemoveDocument(doc.id)}
                                okText="Yes"
                                cancelText="No"
                                disabled={selectedBundle.is_locked}
                              >
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  danger
                                  disabled={selectedBundle.is_locked}
                                />
                              </Popconfirm>
                            </Tooltip>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: '#f0f5ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 500,
                                color: '#1890ff'
                              }}>
                                {index + 1}
                              </div>
                            }
                            title={
                              <Space>
                                {getFileIcon(doc.file_name)}
                                <span>{doc.title}</span>
                              </Space>
                            }
                            description={
                              <Space split={<Divider type="vertical" />}>
                                <span style={{ fontSize: 11 }}>{doc.module || 'General'}</span>
                                <span style={{ fontSize: 11 }}>{formatFileSize(doc.file_size)}</span>
                                <span style={{ fontSize: 11 }}>
                                  Added {formatDate(doc.added_at)}
                                </span>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      description="No documents in this bundle"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => setDocumentPickerVisible(true)}
                      >
                        Add Documents
                      </Button>
                    </Empty>
                  )}
                </Card>
              )
            },
            {
              key: 'details',
              label: (
                <Space>
                  <InfoCircleOutlined />
                  Details
                </Space>
              ),
              children: (
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Name" span={2}>
                    <Text strong>{selectedBundle.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Type">
                    <Tag color={typeConfig.color} icon={typeConfig.icon}>
                      {typeConfig.label}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {getStatusTag(selectedBundle.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description" span={2}>
                    {selectedBundle.description || 'No description'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Documents">
                    {bundleDocuments.length}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Size">
                    {formatFileSize(selectedBundle.total_size)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created By">
                    {selectedBundle.created_by_name || 'Unknown'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created At">
                    {formatDate(selectedBundle.created_at)}
                  </Descriptions.Item>
                  {selectedBundle.expires_at && (
                    <Descriptions.Item label="Expires At" span={2}>
                      <Tag color="warning">
                        {formatDate(selectedBundle.expires_at)}
                      </Tag>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Confidential">
                    {selectedBundle.is_confidential ? (
                      <Tag color="red" icon={<LockOutlined />}>Yes</Tag>
                    ) : (
                      <Tag icon={<UnlockOutlined />}>No</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Locked">
                    {selectedBundle.is_locked ? (
                      <Tag color="red" icon={<LockOutlined />}>Yes</Tag>
                    ) : (
                      <Tag icon={<UnlockOutlined />}>No</Tag>
                    )}
                  </Descriptions.Item>
                  {selectedBundle.tags?.length > 0 && (
                    <Descriptions.Item label="Tags" span={2}>
                      {selectedBundle.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              )
            },
            {
              key: 'activity',
              label: (
                <Space>
                  <HistoryOutlined />
                  Activity
                </Space>
              ),
              children: (
                <Timeline
                  items={(selectedBundle.activity || []).map((item, i) => ({
                    color: item.action === 'created' ? 'green' :
                           item.action === 'shared' ? 'blue' :
                           item.action === 'deleted' ? 'red' : 'gray',
                    children: (
                      <div>
                        <Space>
                          <Text strong>{item.action?.toUpperCase()}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {item.user_name}
                          </Text>
                        </Space>
                        <div style={{ fontSize: 12, color: '#595959' }}>
                          {item.description}
                        </div>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                    )
                  }))}
                />
              )
            }
          ]}
        />
      </Drawer>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="document-bundles" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="bundles-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <FolderOpenOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Document Bundles</Title>
              <Badge status="processing" text="Case File Manager" />
            </Space>
          </Col>
          <Col>
            <Space>
              <Input.Search
                placeholder="Search bundles..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
                allowClear
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadBundles}
                loading={loading}
              >
                Refresh
              </Button>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                New Bundle
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Stats */}
      {renderStats()}
      
      {/* Bundles Grid */}
      <Spin spinning={loading}>
        {renderBundlesGrid()}
      </Spin>
      
      {/* Modals */}
      {renderCreateModal()}
      {renderDocumentPicker()}
      {renderExportModal()}
      {renderShareModal()}
      {renderDetailDrawer()}
    </div>
  );
};

export default DocumentBundles;