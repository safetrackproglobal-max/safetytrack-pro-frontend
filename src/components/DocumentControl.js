// src/components/DocumentControl.js
// Complete Document Control Component with Plan-Based Access Control

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Statistic, Button, Space, Input, Select,
  Table, Tag, Modal, Form, Upload, message, Popconfirm,
  Drawer, Descriptions, Tabs, Timeline, Avatar, List,
  Badge, Tooltip, Progress, Switch, Empty, Spin, Alert,
  Divider, DatePicker, Dropdown, Menu, Popover, Typography,
  Rate, Skeleton, Collapse, Checkbox, Radio, Slider,
  Transfer, Tree, Cascader, Mentions, Popconfirm as PopconfirmAntd
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined,
  FolderOutlined,
  TagsOutlined,
  CommentOutlined,
  HistoryOutlined,
  ShareAltOutlined,
  MoreOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  StopOutlined,
  InboxOutlined,
  StarOutlined,
  StarFilled,
  FileSearchOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ProfileOutlined,
  LinkOutlined,
  UnlockOutlined,
  LockOutlined,
  ExperimentOutlined,
  RobotOutlined,
  ThunderboltFilled,
  FireOutlined,
  BugOutlined,
  AlertFilled,
  QuestionCircleOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  PrinterOutlined,
  MailFilled,
  PhoneOutlined,
  SignatureOutlined,
  VerifyOutlined,
  SaveOutlined,
  CopyOutlined,
  ScissorOutlined,
  BlockOutlined,
  MenuOutlined,
  ExpandOutlined,
  CompressOutlined,
  ClearOutlined,
  UndoOutlined,
  RedoOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  HighlightOutlined,
  FontColorsOutlined,
  BgColorsOutlined,
  CodeOutlined,
  TableOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  ImportOutlined,
  ExportOutlined,
  QrcodeOutlined,
  ScanOutlined,
  FingerprintOutlined
} from '@ant-design/icons';
import documentServiceAPI from '../services/documentService';
import { 
  isSuperAdmin, 
  getUserPlan, 
  canAccessFeature,
  canPerformDocumentAction,
  getDocumentLimits,
  getMaxDocuments,
  getMaxFileSizeMB,
  showUpgradeModal,
  PLAN_HIERARCHY
} from '../services/api';
import DocumentEditor from './documents/DocumentEditor';
import DocumentSignature from './documents/DocumentSignature';
import './DocumentControl.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Dragger } = Upload;
const { RangePicker } = DatePicker;

// ============================================================
// CONSTANTS & CONFIGURATION
// ============================================================

// Document types
const DOCUMENT_TYPES = {
  report: { label: 'Report', icon: <FileTextOutlined />, color: '#1890ff', module: 'general' },
  policy: { label: 'Policy/Procedure', icon: <FileTextOutlined />, color: '#faad14', module: 'general' },
  record: { label: 'Record/Log', icon: <HistoryOutlined />, color: '#722ed1', module: 'general' },
  hse_report: { label: 'HSE Report', icon: <SafetyCertificateOutlined />, color: '#faad14', module: 'hse' },
  incident_report: { label: 'Incident Report', icon: <WarningOutlined />, color: '#fa541c', module: 'hse' },
  environmental_report: { label: 'Environmental Report', icon: <EnvironmentOutlined />, color: '#52c41a', module: 'environmental' },
  permit: { label: 'Permit/License', icon: <SafetyCertificateOutlined />, color: '#1890ff', module: 'environmental' },
  hospital_record: { label: 'Hospital Record', icon: <MedicineBoxOutlined />, color: '#f5222d', module: 'hospital' },
  quality_document: { label: 'Quality Document', icon: <CheckCircleOutlined />, color: '#1890ff', module: 'quality' },
  supply_chain: { label: 'Supply Chain Doc', icon: <GlobalOutlined />, color: '#722ed1', module: 'supply_chain' },
  training_material: { label: 'Training Material', icon: <TeamOutlined />, color: '#2f54eb', module: 'training' },
  technical: { label: 'Technical Document', icon: <FileSearchOutlined />, color: '#13c2c2', module: 'general' },
  compliance: { label: 'Compliance Document', icon: <AuditOutlined />, color: '#f5222d', module: 'general' },
  audit_document: { label: 'Audit Document', icon: <FileSearchOutlined />, color: '#13c2c2', module: 'quality' }
};

// Document statuses
const DOCUMENT_STATUSES = {
  draft: { label: 'Draft', color: 'default', icon: <EditOutlined /> },
  review: { label: 'In Review', color: 'processing', icon: <ClockCircleOutlined /> },
  approved: { label: 'Approved', color: 'success', icon: <CheckCircleOutlined /> },
  published: { label: 'Published', color: 'blue', icon: <SafetyCertificateOutlined /> },
  archived: { label: 'Archived', color: 'warning', icon: <FolderOutlined /> },
  superseded: { label: 'Superseded', color: 'error', icon: <CloseCircleOutlined /> },
  rejected: { label: 'Rejected', color: 'error', icon: <CloseCircleOutlined /> }
};

// Document categories
const CATEGORIES = [
  'Air Quality', 'Water Quality', 'Waste Management', 'Emissions',
  'Biodiversity', 'Social Impact', 'Governance', 'Safety',
  'General', 'Compliance', 'Training', 'Incident', 'Medical',
  'Quality', 'Supply Chain', 'Procurement', 'Logistics', 'Technical'
];

// Modules for filtering
const MODULES = [
  { value: 'all', label: 'All Modules', icon: <AppstoreOutlined /> },
  { value: 'hse', label: 'HSE', icon: <SafetyCertificateOutlined /> },
  { value: 'environmental', label: 'Environmental', icon: <EnvironmentOutlined /> },
  { value: 'hospital', label: 'Hospital', icon: <MedicineBoxOutlined /> },
  { value: 'quality', label: 'Quality', icon: <CheckCircleOutlined /> },
  { value: 'supply_chain', label: 'Supply Chain', icon: <GlobalOutlined /> },
  { value: 'training', label: 'Training', icon: <TeamOutlined /> },
  { value: 'general', label: 'General', icon: <FileTextOutlined /> }
];

// Status colors mapping
const STATUS_COLORS = {
  draft: '#d9d9d9',
  review: '#1890ff',
  approved: '#52c41a',
  published: '#1890ff',
  archived: '#faad14',
  superseded: '#f5222d',
  rejected: '#f5222d'
};

// Priority levels
const PRIORITY_LEVELS = {
  low: { label: 'Low', color: '#52c41a', icon: <CheckCircleOutlined /> },
  medium: { label: 'Medium', color: '#faad14', icon: <InfoCircleOutlined /> },
  high: { label: 'High', color: '#f5222d', icon: <WarningOutlined /> },
  critical: { label: 'Critical', color: '#cf1322', icon: <AlertFilled /> }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentControl = ({ 
  siteId = null, 
  moduleFilter = null, 
  onDocumentChange,
  showStats = true,
  showHeader = true,
  userPlan: propUserPlan = null,
  isSuperAdmin: propIsSuperAdmin = null,
  permissions: propPermissions = null,
  canCreate: propCanCreate = null,
  canUpload: propCanUpload = null
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    review: 0,
    approved: 0,
    published: 0,
    archived: 0,
    rejected: 0
  });
  
  // UI State
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [commentDrawerVisible, setCommentDrawerVisible] = useState(false);
  const [versionDrawerVisible, setVersionDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    document_type: 'all',
    status: 'all',
    category: 'all',
    module: moduleFilter || 'all',
    priority: 'all'
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [userPlan, setUserPlan] = useState(propUserPlan || 'free');
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(propIsSuperAdmin || false);
  const [documentLimits, setDocumentLimits] = useState({});
  const [canCreate, setCanCreate] = useState(propCanCreate || false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [canSign, setCanSign] = useState(false);
  const [canAudit, setCanAudit] = useState(false);
  const [canBulk, setCanBulk] = useState(false);
  const [canAI, setCanAI] = useState(false);

  // Upload form
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Comments
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  
  // Versions
  const [versions, setVersions] = useState([]);
  
  // ✅ NEW: Editor & Signature State
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [signatureDocumentId, setSignatureDocumentId] = useState(null);
  
  // Auto refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshInterval = useRef(null);

  // ============================================================
  // PERMISSION CHECKS
  // ============================================================
  
  const checkPermissions = useCallback(() => {
    const isSuperAdmin = propIsSuperAdmin !== null ? propIsSuperAdmin : (window.isSuperAdmin ? window.isSuperAdmin() : false);
    const plan = propUserPlan || (window.getUserPlan ? window.getUserPlan() : 'free');
    
    setIsSuperAdminUser(isSuperAdmin);
    setUserPlan(plan);
    
    const limits = window.getDocumentLimits ? window.getDocumentLimits() : {};
    setDocumentLimits(limits);
    
    setCanCreate(propCanCreate !== null ? propCanCreate : (isSuperAdmin || (limits?.allow_basic_create === true)));
    setCanEdit(isSuperAdmin || (limits?.allow_basic_edit === true));
    setCanDelete(isSuperAdmin || (plan === 'pro' || plan === 'enterprise'));
    setCanSign(isSuperAdmin || (limits?.allow_signatures === true));
    setCanAudit(isSuperAdmin || (limits?.allow_audit === true));
    setCanBulk(isSuperAdmin || (limits?.allow_bulk === true));
    setCanAI(isSuperAdmin || (limits?.allow_ai === true));
    
  }, [propIsSuperAdmin, propUserPlan, propCanCreate]);

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchText,
        ...filters,
        site_id: siteId
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });
      
      const data = await documentServiceAPI.getDocuments(params);
      
      const docs = data.documents || data.data || [];
      setDocuments(docs);
      
      const statsData = data.stats || {};
      setStats({
        total: statsData.total || docs.length || 0,
        draft: statsData.draft || docs.filter(d => d.status === 'draft').length,
        review: statsData.review || docs.filter(d => d.status === 'review').length,
        approved: statsData.approved || docs.filter(d => d.status === 'approved').length,
        published: statsData.published || docs.filter(d => d.status === 'published').length,
        archived: statsData.archived || docs.filter(d => d.status === 'archived').length,
        rejected: statsData.rejected || docs.filter(d => d.status === 'rejected').length
      });
    } catch (error) {
      console.error('Failed to load documents:', error);
      message.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [searchText, filters, siteId]);

  const loadDocumentDetail = useCallback(async (id) => {
    try {
      const data = await documentServiceAPI.getDocument(id);
      
      if (data.tags && typeof data.tags === 'string') {
        try {
          data.tags = JSON.parse(data.tags);
        } catch (e) {
          data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
      }
      
      setSelectedDocument(data);
      
      const commentsData = await documentServiceAPI.getComments(id);
      setComments(commentsData.comments || commentsData.data || []);
      
      const versionsData = await documentServiceAPI.getVersions(id);
      setVersions(versionsData.versions || versionsData.data || []);
      
    } catch (error) {
      console.error('Failed to load document details:', error);
      message.error('Failed to load document details');
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await documentServiceAPI.getStats();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  // ============================================================
  // DOCUMENT OPERATIONS
  // ============================================================
  
  const handleUpload = async (values) => {
    if (!canCreate) {
      message.error('Your plan does not allow creating documents. Please upgrade.');
      showUpgradeModal({
        requiredPlan: 'basic',
        message: 'Document creation requires at least Basic plan'
      });
      return;
    }
    
    const maxDocs = window.getMaxDocuments ? window.getMaxDocuments() : 'Unlimited';
    if (maxDocs !== 'Unlimited' && documents.length >= maxDocs) {
      message.error(`You have reached the maximum of ${maxDocs} documents for your plan.`);
      showUpgradeModal({
        requiredPlan: 'pro',
        message: `Upgrade to create more than ${maxDocs} documents`
      });
      return;
    }
    
    if (fileList.length === 0) {
      message.warning('Please select a file to upload');
      return;
    }
    
    const maxSizeMB = window.getMaxFileSizeMB ? window.getMaxFileSizeMB() : 5;
    const file = fileList[0].originFileObj;
    const fileSizeMB = file.size / (1024 * 1024);
    if (maxSizeMB !== 'Unlimited' && fileSizeMB > maxSizeMB) {
      message.error(`File size exceeds the maximum of ${maxSizeMB}MB for your plan.`);
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title.trim());
      formData.append('description', values.description ? values.description.trim() : '');
      formData.append('document_type', values.document_type);
      formData.append('category', values.category || '');
      formData.append('module', values.module || 'general');
      formData.append('priority', values.priority || 'medium');
      formData.append('tags', JSON.stringify(values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : []));
      formData.append('site_id', siteId || '');
      formData.append('file', file);
      
      await documentServiceAPI.createDocument(formData);
      message.success('Document uploaded successfully');
      setUploadModalVisible(false);
      setFileList([]);
      form.resetFields();
      loadDocuments();
      loadStats();
      
      if (onDocumentChange) onDocumentChange();
    } catch (error) {
      console.error('Upload failed:', error);
      message.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      message.error('Your plan does not allow deleting documents.');
      showUpgradeModal({
        requiredPlan: 'pro',
        message: 'Document deletion requires Pro plan'
      });
      return;
    }
    
    try {
      await documentServiceAPI.deleteDocument(id);
      message.success('Document deleted');
      loadDocuments();
      loadStats();
      if (onDocumentChange) onDocumentChange();
    } catch (error) {
      console.error('Delete failed:', error);
      message.error(error.message || 'Failed to delete document');
    }
  };

  const handleBulkDelete = async () => {
    if (!canBulk) {
      message.error('Bulk operations require Enterprise plan.');
      showUpgradeModal({
        requiredPlan: 'enterprise',
        message: 'Bulk operations require Enterprise plan'
      });
      return;
    }
    
    try {
      await Promise.all(selectedRowKeys.map(id => documentServiceAPI.deleteDocument(id)));
      message.success(`${selectedRowKeys.length} documents deleted`);
      setSelectedRowKeys([]);
      loadDocuments();
      loadStats();
      if (onDocumentChange) onDocumentChange();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      message.error('Failed to delete some documents');
    }
  };

  // ============================================================
  // WORKFLOW ACTIONS
  // ============================================================
  
  const handleSubmitForReview = async (id) => {
    try {
      await documentServiceAPI.submitForReview(id);
      message.success('Document submitted for review');
      loadDocuments();
      if (selectedDocument?.id === id) {
        loadDocumentDetail(id);
      }
    } catch (error) {
      console.error('Submit failed:', error);
      message.error(error.message || 'Failed to submit document');
    }
  };

  const handleApprove = async (id) => {
    try {
      await documentServiceAPI.approveDocument(id);
      message.success('Document approved');
      loadDocuments();
      if (selectedDocument?.id === id) {
        loadDocumentDetail(id);
      }
    } catch (error) {
      console.error('Approve failed:', error);
      message.error(error.message || 'Failed to approve document');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await documentServiceAPI.rejectDocument(id, reason);
      message.success('Document rejected');
      loadDocuments();
      if (selectedDocument?.id === id) {
        loadDocumentDetail(id);
      }
    } catch (error) {
      console.error('Reject failed:', error);
      message.error(error.message || 'Failed to reject document');
    }
  };

  const handlePublish = async (id) => {
    try {
      await documentServiceAPI.publishDocument(id);
      message.success('Document published');
      loadDocuments();
      if (selectedDocument?.id === id) {
        loadDocumentDetail(id);
      }
    } catch (error) {
      console.error('Publish failed:', error);
      message.error(error.message || 'Failed to publish document');
    }
  };

  const handleArchive = async (id) => {
    try {
      await documentServiceAPI.archiveDocument(id);
      message.success('Document archived');
      loadDocuments();
      if (selectedDocument?.id === id) {
        loadDocumentDetail(id);
      }
    } catch (error) {
      console.error('Archive failed:', error);
      message.error(error.message || 'Failed to archive document');
    }
  };

  // ============================================================
  // COMMENTS
  // ============================================================
  
  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    
    setCommentLoading(true);
    try {
      await documentServiceAPI.addComment(selectedDocument.id, commentInput);
      message.success('Comment added');
      setCommentInput('');
      loadDocumentDetail(selectedDocument.id);
    } catch (error) {
      console.error('Failed to add comment:', error);
      message.error(error.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    if (propUserPlan) {
      setUserPlan(propUserPlan);
    }
    if (propIsSuperAdmin !== null) {
      setIsSuperAdminUser(propIsSuperAdmin);
    }
    
    const plan = propUserPlan || 'free';
    const isSuperAdmin = propIsSuperAdmin || false;
    
    setCanCreate(propCanCreate !== null ? propCanCreate : (isSuperAdmin || ['basic', 'pro', 'business', 'enterprise'].includes(plan)));
    setCanEdit(isSuperAdmin || ['pro', 'business', 'enterprise'].includes(plan));
    setCanDelete(isSuperAdmin || ['pro', 'business', 'enterprise'].includes(plan));
    setCanSign(isSuperAdmin || ['business', 'enterprise'].includes(plan));
    setCanAudit(isSuperAdmin || ['business', 'enterprise'].includes(plan));
    setCanBulk(isSuperAdmin || ['enterprise'].includes(plan));
    setCanAI(isSuperAdmin || ['pro', 'business', 'enterprise'].includes(plan));
    
  }, [propUserPlan, propIsSuperAdmin, propCanCreate]);

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, [loadDocuments, loadStats]);

  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => {
        loadDocuments();
      }, 60000);
    }
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh, loadDocuments]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getStatusColor = (status) => STATUS_COLORS[status] || '#d9d9d9';
  
  const getStatusTag = (status) => {
    const config = DOCUMENT_STATUSES[status];
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };
  
  const getDocumentTypeIcon = (type) => {
    const config = DOCUMENT_TYPES[type];
    return config?.icon || <FileOutlined />;
  };
  
  const getDocumentTypeTag = (type) => {
    const config = DOCUMENT_TYPES[type];
    if (!config) return <Tag>{type}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getModuleTag = (module) => {
    const config = MODULES.find(m => m.value === module);
    if (!config) return <Tag>{module}</Tag>;
    return <Tag icon={config.icon}>{config.label}</Tag>;
  };

  const getPriorityTag = (priority) => {
    const config = PRIORITY_LEVELS[priority];
    if (!config) return <Tag>Unknown</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf': return <FilePdfOutlined style={{ color: '#f5222d', fontSize: 24 }} />;
      case 'doc':
      case 'docx': return <FileWordOutlined style={{ color: '#1890ff', fontSize: 24 }} />;
      case 'xls':
      case 'xlsx': return <FileExcelOutlined style={{ color: '#52c41a', fontSize: 24 }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <FileImageOutlined style={{ color: '#faad14', fontSize: 24 }} />;
      default: return <FileOutlined style={{ fontSize: 24 }} />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const isSuperAdminUserCheck = () => {
    return isSuperAdminUser || window.isSuperAdmin?.() || false;
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  const renderPlanBanner = () => {
    if (isSuperAdminUser) return null;
    
    const plan = userPlan;
    const isFreePlan = plan === 'free';
    const isBasicPlan = plan === 'basic';
    
    if (!isFreePlan && !isBasicPlan) return null;
    
    return (
      <Alert
        message={
          <Space>
            <InfoCircleOutlined />
            <span>
              {isFreePlan ? 'You are on the Free plan. ' : 'You are on the Basic plan. '}
              <Button 
                type="link" 
                size="small" 
                onClick={() => {
                  if (window.showUpgradeModal) {
                    window.showUpgradeModal({ 
                      requiredPlan: isFreePlan ? 'basic' : 'pro',
                      currentPlan: plan
                    });
                  } else {
                    message.info(`Upgrade from ${plan} to ${isFreePlan ? 'basic' : 'pro'} plan`);
                  }
                }}
                style={{ padding: 0 }}
              >
                Upgrade to get more features →
              </Button>
            </span>
          </Space>
        }
        type="info"
        showIcon={false}
        style={{ marginBottom: 16 }}
        closable
      />
    );
  };

  const renderStats = () => (
    <Row gutter={[16, 16]} className="document-stats">
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
        <Card size="small" className="stat-card stat-draft">
          <Statistic
            title="Drafts"
            value={stats.draft || 0}
            prefix={<EditOutlined />}
            valueStyle={{ color: '#d9d9d9' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-review">
          <Statistic
            title="In Review"
            value={stats.review || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-approved">
          <Statistic
            title="Approved"
            value={stats.approved || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-published">
          <Statistic
            title="Published"
            value={stats.published || 0}
            prefix={<SafetyCertificateOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-archived">
          <Statistic
            title="Archived"
            value={stats.archived || 0}
            prefix={<FolderOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderFilters = () => (
    <div className="document-filters">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={6}>
          <Input.Search
            placeholder="Search documents..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={() => loadDocuments()}
            allowClear
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col xs={24} sm={8} md={3}>
          <Select
            value={filters.module}
            onChange={(value) => setFilters({ ...filters, module: value })}
            style={{ width: '100%' }}
            allowClear
            placeholder="Module"
          >
            {MODULES.map(mod => (
              <Option key={mod.value} value={mod.value}>
                {mod.icon} {mod.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={3}>
          <Select
            value={filters.document_type}
            onChange={(value) => setFilters({ ...filters, document_type: value })}
            style={{ width: '100%' }}
            allowClear
            placeholder="Type"
          >
            <Option value="all">All Types</Option>
            {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
              <Option key={key} value={key}>
                {value.icon} {value.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={3}>
          <Select
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: '100%' }}
            allowClear
            placeholder="Status"
          >
            <Option value="all">All Statuses</Option>
            {Object.entries(DOCUMENT_STATUSES).map(([key, value]) => (
              <Option key={key} value={key}>
                {value.icon} {value.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={3}>
          <Select
            value={filters.priority}
            onChange={(value) => setFilters({ ...filters, priority: value })}
            style={{ width: '100%' }}
            allowClear
            placeholder="Priority"
          >
            <Option value="all">All Priorities</Option>
            {Object.entries(PRIORITY_LEVELS).map(([key, value]) => (
              <Option key={key} value={key}>
                {value.icon} {value.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={6}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="Auto"
              unCheckedChildren="Manual"
              size="small"
            />
            <Button icon={<ReloadOutlined />} onClick={loadDocuments} loading={loading} size="small">
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                if (!canCreate) {
                  message.error('Your plan does not allow creating documents. Please upgrade.');
                  showUpgradeModal({
                    requiredPlan: 'basic',
                    message: 'Document creation requires at least Basic plan'
                  });
                  return;
                }
                setUploadModalVisible(true);
              }}
              size="small"
            >
              Upload
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );

  // ✅ UPDATED: Render Document Table with Edit and Sign buttons
  const renderDocumentTable = () => {
    const columns = [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (title, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {getFileIcon(record.file_name)}
            <div>
              <div style={{ fontWeight: 500 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                {record.file_name || 'No file'} 
                {record.version ? ` • v${record.version}` : ''}
                {record.file_size ? ` • ${formatFileSize(record.file_size)}` : ''}
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'Module',
        dataIndex: 'module',
        key: 'module',
        render: (module) => getModuleTag(module)
      },
      {
        title: 'Type',
        dataIndex: 'document_type',
        key: 'document_type',
        render: (type) => getDocumentTypeTag(type)
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status, record) => (
          <Space>
            {getStatusTag(status)}
            {record.priority && getPriorityTag(record.priority)}
          </Space>
        )
      },
      {
        title: 'Updated',
        dataIndex: 'updated_at',
        key: 'updated_at',
        render: (date) => formatDate(date)
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 240,
        render: (_, record) => (
          <Space>
            <Tooltip title="Edit Document">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingDocument(record);
                  setEditorVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedDocument(record);
                  setDetailDrawerVisible(true);
                  loadDocumentDetail(record.id);
                }}
              />
            </Tooltip>
            <Tooltip title="Sign Document">
              <Button
                type="text"
                size="small"
                icon={<SignatureOutlined />}
                onClick={() => {
                  setSignatureDocumentId(record.id);
                  setSignatureModalVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Download">
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => documentServiceAPI.downloadDocument(record.id)}
              />
            </Tooltip>
            <Dropdown
              overlay={
                <Menu>
                  {record.status === 'draft' && (
                    <Menu.Item key="submit" icon={<SendOutlined />} onClick={() => handleSubmitForReview(record.id)}>
                      Submit for Review
                    </Menu.Item>
                  )}
                  {record.status === 'review' && (
                    <>
                      <Menu.Item key="approve" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)}>
                        Approve
                      </Menu.Item>
                      <Menu.Item key="reject" icon={<CloseOutlined />} onClick={() => {
                        Modal.confirm({
                          title: 'Reject Document',
                          content: (
                            <Input.TextArea
                              placeholder="Reason for rejection..."
                              id="reject-reason"
                              rows={3}
                            />
                          ),
                          onOk: () => {
                            const reason = document.getElementById('reject-reason')?.value || '';
                            handleReject(record.id, reason);
                          }
                        });
                      }}>
                        Reject
                      </Menu.Item>
                    </>
                  )}
                  {record.status === 'approved' && (
                    <Menu.Item key="publish" icon={<SafetyCertificateOutlined />} onClick={() => handlePublish(record.id)}>
                      Publish
                    </Menu.Item>
                  )}
                  {(record.status === 'published' || record.status === 'approved') && (
                    <Menu.Item key="archive" icon={<FolderOutlined />} onClick={() => handleArchive(record.id)}>
                      Archive
                    </Menu.Item>
                  )}
                  <Menu.Divider />
                  {canSign && (
                    <Menu.Item key="sign" icon={<SignatureOutlined />} onClick={() => {
                      setSignatureDocumentId(record.id);
                      setSignatureModalVisible(true);
                    }}>
                      Sign Document
                    </Menu.Item>
                  )}
                  {canAI && (
                    <Menu.Item key="ai" icon={<RobotOutlined />} onClick={() => {
                      message.info('AI analysis feature coming soon');
                    }}>
                      AI Analyze
                    </Menu.Item>
                  )}
                  <Menu.Divider />
                  {canDelete && (
                    <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>
                      Delete
                    </Menu.Item>
                  )}
                </Menu>
              }
              trigger={['click']}
            >
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        )
      }
    ];

    return (
      <Table
        rowKey="id"
        columns={columns}
        dataSource={documents}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} documents`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
        scroll={{ x: 1200 }}
      />
    );
  };

  const renderUploadModal = () => {
    const maxSizeMB = window.getMaxFileSizeMB ? window.getMaxFileSizeMB() : 5;
    const maxDocs = window.getMaxDocuments ? window.getMaxDocuments() : 'Unlimited';
    
    return (
      <Modal
        title={<Space><CloudUploadOutlined /> Upload Document</Space>}
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Alert
            message="Plan Limits"
            description={
              <div>
                <div>Maximum documents: <strong>{maxDocs}</strong></div>
                <div>Maximum file size: <strong>{maxSizeMB === 'Unlimited' ? 'Unlimited' : `${maxSizeMB} MB`}</strong></div>
                {maxDocs !== 'Unlimited' && documents.length >= maxDocs && (
                  <div style={{ color: '#f5222d' }}>
                    <WarningOutlined /> You have reached your document limit.
                    <Button type="link" size="small" onClick={() => window.showUpgradeModal?.({ requiredPlan: 'pro' })}>
                      Upgrade
                    </Button>
                  </div>
                )}
              </div>
            }
            type="info"
            showIcon
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpload}
          initialValues={{ document_type: 'report', module: 'general', priority: 'medium' }}
        >
          <Form.Item
            name="title"
            label="Document Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter document title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="module" label="Module" rules={[{ required: true, message: 'Please select a module' }]}>
                <Select placeholder="Select module">
                  {MODULES.filter(m => m.value !== 'all').map(mod => (
                    <Option key={mod.value} value={mod.value}>
                      {mod.icon} {mod.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="document_type" label="Document Type" rules={[{ required: true, message: 'Please select type' }]}>
                <Select placeholder="Select type" showSearch>
                  {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.icon} {value.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="category" label="Category">
                <Select placeholder="Select category" allowClear>
                  {CATEGORIES.map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority">
                <Select placeholder="Select priority">
                  {Object.entries(PRIORITY_LEVELS).map(([key, value]) => (
                    <Option key={key} value={key}>
                      {value.icon} {value.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="tags" label="Tags" extra="Separate tags with commas">
            <Input placeholder="e.g. compliance, 2024, q1" />
          </Form.Item>

          <Form.Item 
            label="File" 
            required
            extra={`Max file size: ${maxSizeMB === 'Unlimited' ? 'Unlimited' : `${maxSizeMB} MB`}`}
          >
            <Dragger
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              multiple={false}
              maxCount={1}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Click or drag file to upload</p>
              <p className="ant-upload-hint">Support: PDF, Word, Excel, Images, Text</p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setUploadModalVisible(false);
                form.resetFields();
                setFileList([]);
              }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={uploading}>
                Upload
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const getTagsArray = (tags) => {
    if (!tags) return [];
    try {
      if (typeof tags === 'string') {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      }
      if (Array.isArray(tags)) {
        return tags;
      }
      return [];
    } catch (e) {
      if (typeof tags === 'string') {
        return tags.split(',').map(t => t.trim()).filter(Boolean);
      }
      return [];
    }
  };

  // ✅ UPDATED: Detail Drawer with Edit and Sign buttons
  const renderDetailDrawer = () => (
    <Drawer
      title={
        <Space>
          {selectedDocument && getFileIcon(selectedDocument.file_name)}
          <span style={{ fontWeight: 500 }}>{selectedDocument?.title}</span>
          {selectedDocument && getStatusTag(selectedDocument.status)}
        </Space>
      }
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={800}
      extra={
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setDetailDrawerVisible(false);
              setEditingDocument(selectedDocument);
              setEditorVisible(true);
            }}
          >
            Edit
          </Button>
          <Button 
            icon={<SignatureOutlined />} 
            onClick={() => {
              setDetailDrawerVisible(false);
              setSignatureDocumentId(selectedDocument?.id);
              setSignatureModalVisible(true);
            }}
          >
            Sign
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => documentServiceAPI.downloadDocument(selectedDocument?.id)}>
            Download
          </Button>
          <Button icon={<CommentOutlined />} onClick={() => setCommentDrawerVisible(true)}>
            Comments ({comments.length})
          </Button>
          <Button icon={<HistoryOutlined />} onClick={() => setVersionDrawerVisible(true)}>
            Versions ({versions.length})
          </Button>
          <Button type="primary" onClick={() => setDetailDrawerVisible(false)}>
            Close
          </Button>
        </Space>
      }
    >
      {selectedDocument ? (
        <Tabs defaultActiveKey="details">
          <TabPane tab={<span><FileTextOutlined /> Details</span>} key="details">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Title" span={2}>
                <Text strong>{selectedDocument.title}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedDocument.description || 'No description'}
              </Descriptions.Item>
              <Descriptions.Item label="Module">
                {getModuleTag(selectedDocument.module)}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {getDocumentTypeTag(selectedDocument.document_type)}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag>{selectedDocument.category || 'Uncategorized'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                {getPriorityTag(selectedDocument.priority)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedDocument.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Version">
                v{selectedDocument.version || 1}
              </Descriptions.Item>
              <Descriptions.Item label="File">
                {selectedDocument.file_name || 'No file'}
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                {formatFileSize(selectedDocument.file_size)}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {selectedDocument.created_by?.name || selectedDocument.created_by || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {formatDate(selectedDocument.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Updated By" span={2}>
                {selectedDocument.updated_by?.name || selectedDocument.updated_by || 'Unknown'}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At" span={2}>
                {formatDate(selectedDocument.updated_at)}
              </Descriptions.Item>
              {(() => {
                const tagsArray = getTagsArray(selectedDocument.tags);
                return tagsArray.length > 0 && (
                  <Descriptions.Item label="Tags" span={2}>
                    {tagsArray.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Descriptions.Item>
                );
              })()}
            </Descriptions>

            <Divider />

            <div style={{ marginTop: 16 }}>
              <Title level={5}>Workflow Actions</Title>
              <Space wrap>
                {selectedDocument.status === 'draft' && (
                  <Button type="primary" icon={<SendOutlined />} onClick={() => handleSubmitForReview(selectedDocument.id)}>
                    Submit for Review
                  </Button>
                )}
                {selectedDocument.status === 'review' && (
                  <>
                    <Button type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(selectedDocument.id)}>
                      Approve
                    </Button>
                    <Button danger icon={<CloseOutlined />} onClick={() => {
                      Modal.confirm({
                        title: 'Reject Document',
                        content: (
                          <Input.TextArea
                            placeholder="Reason for rejection..."
                            id="reject-reason-detail"
                            rows={3}
                          />
                        ),
                        onOk: () => {
                          const reason = document.getElementById('reject-reason-detail')?.value || '';
                          handleReject(selectedDocument.id, reason);
                        }
                      });
                    }}>
                      Reject
                    </Button>
                  </>
                )}
                {selectedDocument.status === 'approved' && (
                  <Button type="primary" icon={<SafetyCertificateOutlined />} onClick={() => handlePublish(selectedDocument.id)}>
                    Publish
                  </Button>
                )}
                {(selectedDocument.status === 'published' || selectedDocument.status === 'approved') && (
                  <Button icon={<FolderOutlined />} onClick={() => handleArchive(selectedDocument.id)}>
                    Archive
                  </Button>
                )}
                <Button icon={<EditOutlined />} onClick={() => {
                  setDetailDrawerVisible(false);
                  setEditingDocument(selectedDocument);
                  setEditorVisible(true);
                }}>
                  Edit Document
                </Button>
                <Button icon={<SignatureOutlined />} onClick={() => {
                  setDetailDrawerVisible(false);
                  setSignatureDocumentId(selectedDocument.id);
                  setSignatureModalVisible(true);
                }}>
                  Sign Document
                </Button>
                {canDelete && selectedDocument.status !== 'deleted' && (
                  <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(selectedDocument.id)}>
                    Delete
                  </Button>
                )}
              </Space>
            </div>
          </TabPane>

          <TabPane tab={<span><HistoryOutlined /> Versions</span>} key="versions">
            {versions.length > 0 ? (
              <Timeline>
                {versions.map((version, index) => (
                  <Timeline.Item key={index} color={version.is_current ? 'green' : 'gray'}>
                    <div>
                      <Space>
                        <strong>Version {version.version}</strong>
                        {version.is_current && <Tag color="green">Current</Tag>}
                      </Space>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                        {version.changes || 'No changes recorded'}
                      </div>
                      <div style={{ fontSize: 12, color: '#bfbfbf' }}>
                        {formatDate(version.created_at)}
                        {version.created_by && ` • By ${version.created_by}`}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="No versions available" />
            )}
          </TabPane>
        </Tabs>
      ) : (
        <Empty description="No document selected" />
      )}
    </Drawer>
  );

  const renderVersionDrawer = () => (
    <Drawer
      title={<Space><HistoryOutlined /> Version History</Space>}
      open={versionDrawerVisible}
      onClose={() => setVersionDrawerVisible(false)}
      width={500}
    >
      {versions.length > 0 ? (
        <Timeline>
          {versions.map((version, index) => (
            <Timeline.Item key={index} color={version.is_current ? 'green' : 'gray'}>
              <div>
                <Space>
                  <strong>Version {version.version}</strong>
                  {version.is_current && <Tag color="green">Current</Tag>}
                </Space>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                  {version.changes || 'No changes recorded'}
                </div>
                <div style={{ fontSize: 12, color: '#bfbfbf' }}>
                  {formatDate(version.created_at)}
                  {version.created_by && ` • By ${version.created_by}`}
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Empty description="No versions available" />
      )}
    </Drawer>
  );

  const renderCommentDrawer = () => (
    <Drawer
      title={<Space><CommentOutlined /> Comments ({comments.length})</Space>}
      open={commentDrawerVisible}
      onClose={() => setCommentDrawerVisible(false)}
      width={500}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
          {comments.length > 0 ? (
            <List
              dataSource={comments}
              renderItem={(comment) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={comment.user?.name || comment.created_by?.name || 'Unknown User'}
                    description={
                      <div>
                        <div>{comment.content}</div>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                          {formatDate(comment.created_at)}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No comments yet" />
          )}
        </div>
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <Input.TextArea
            rows={3}
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment..."
          />
          <Button
            type="primary"
            style={{ marginTop: 8 }}
            onClick={handleAddComment}
            loading={commentLoading}
            block
          >
            Post Comment
          </Button>
        </div>
      </div>
    </Drawer>
  );

  // ✅ NEW: Render Editor Modal
  const renderEditorModal = () => (
    <Modal
      title="Edit Document"
      open={editorVisible}
      onCancel={() => {
        setEditorVisible(false);
        setEditingDocument(null);
      }}
      footer={null}
      width="95%"
      style={{ top: 20 }}
      bodyStyle={{ padding: '16px', maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}
      destroyOnClose
    >
      <DocumentEditor
        documentId={editingDocument?.id}
        initialContent={editingDocument?.content || ''}
        initialPdfUrl={editingDocument?.file_url}
        onSave={() => {
          setEditorVisible(false);
          setEditingDocument(null);
          loadDocuments();
          loadStats();
          if (onDocumentChange) onDocumentChange();
        }}
        onCancel={() => {
          setEditorVisible(false);
          setEditingDocument(null);
        }}
        onDocumentUpdate={() => {
          loadDocuments();
          if (onDocumentChange) onDocumentChange();
        }}
        companyId={siteId}
        currentUser={userPlan}
        isPdf={editingDocument?.file_url?.endsWith('.pdf')}
      />
    </Modal>
  );

  // ✅ NEW: Render Signature Modal
  const renderSignatureModal = () => (
    <Modal
      title="Document Signatures"
      open={signatureModalVisible}
      onCancel={() => {
        setSignatureModalVisible(false);
        setSignatureDocumentId(null);
      }}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      bodyStyle={{ padding: '16px', maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
      destroyOnClose
    >
      <DocumentSignature
        documentId={signatureDocumentId}
        documentTitle={documents.find(d => d.id === signatureDocumentId)?.title || ''}
        onSignatureComplete={() => {
          setSignatureModalVisible(false);
          setSignatureDocumentId(null);
          loadDocuments();
          if (onDocumentChange) onDocumentChange();
        }}
        companyId={siteId}
        currentUser={userPlan}
      />
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="document-control">
      {/* Header */}
      {showHeader && (
        <div className="document-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Space>
              <FileTextOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Document Control</Title>
              <Badge status="processing" text="Live" />
              {isSuperAdminUserCheck() && (
                <Tag color="gold" icon={<StarFilled />}>Super Admin</Tag>
              )}
              {!isSuperAdminUserCheck() && (
                <Tag color="blue">{userPlan?.toUpperCase()} Plan</Tag>
              )}
            </Space>
          </div>
        </div>
      )}

      {/* Plan Banner */}
      {!isSuperAdminUserCheck() && (userPlan === 'free' || userPlan === 'basic') && (
        <Alert
          message={
            <Space>
              <InfoCircleOutlined />
              <span>
                You are on the {userPlan === 'free' ? 'Free' : 'Basic'} plan.
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => {
                    if (window.showUpgradeModal) {
                      window.showUpgradeModal({ 
                        requiredPlan: userPlan === 'free' ? 'basic' : 'pro',
                        currentPlan: userPlan
                      });
                    } else {
                      message.info(`Upgrade from ${userPlan} to ${userPlan === 'free' ? 'basic' : 'pro'} plan`);
                    }
                  }}
                  style={{ padding: 0 }}
                >
                  Upgrade to get more features →
                </Button>
              </span>
            </Space>
          }
          type="info"
          showIcon={false}
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      {/* Stats */}
      {showStats && renderStats()}

      {/* Filters */}
      {renderFilters()}

      {/* Bulk Actions */}
      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 16px', background: '#f6f8fa', borderRadius: 8 }}>
          <Space>
            <span>{selectedRowKeys.length} selected</span>
            {canBulk && (
              <PopconfirmAntd
                title={`Delete ${selectedRowKeys.length} documents?`}
                onConfirm={handleBulkDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button danger size="small" icon={<DeleteOutlined />}>
                  Delete Selected
                </Button>
              </PopconfirmAntd>
            )}
            {!canBulk && (
              <Tooltip title="Bulk operations require Enterprise plan">
                <Button danger size="small" icon={<DeleteOutlined />} disabled>
                  Delete Selected
                </Button>
              </Tooltip>
            )}
          </Space>
        </div>
      )}

      {/* Document List */}
      {renderDocumentTable()}

      {/* Upload Modal */}
      {renderUploadModal()}

      {/* Detail Drawer */}
      {renderDetailDrawer()}

      {/* Version Drawer */}
      {renderVersionDrawer()}

      {/* Comment Drawer */}
      {renderCommentDrawer()}

      {/* Editor Modal */}
      {renderEditorModal()}

      {/* Signature Modal */}
      {renderSignatureModal()}
    </div>
  );
};

export default DocumentControl;