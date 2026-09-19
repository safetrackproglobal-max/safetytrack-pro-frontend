// src/components/DocumentControl.js
// Complete Document Control Component with Plan-Based Access Control

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Card, Row, Col, Statistic, Button, Space, Input, Select,
  Table, Tag, Modal, Form, Upload, message, Popconfirm,
  Drawer, Descriptions, Tabs, Timeline, Avatar, List,
  Badge, Tooltip, Progress, Switch, Empty, Spin, Alert,
  Divider, DatePicker, Dropdown, Menu, Popover, Typography,
  Rate, Skeleton, Collapse, Checkbox, Radio, Slider,
  Transfer, Tree, Cascader, Mentions, Segmented,
  Popconfirm as PopconfirmAntd
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
  InboxOutlined,
  StarFilled,
  FileSearchOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  LockOutlined,
  RobotOutlined,
  AlertFilled,
  SignatureOutlined,
  CopyOutlined,
  ClearOutlined,
  KeyOutlined,
  FileProtectOutlined,
  MessageOutlined,
  UnorderedListOutlined,
  TableOutlined,
  AppstoreFilled,
  SortAscendingOutlined,
  SortDescendingOutlined,
  ExportOutlined,
  CloudDownloadOutlined,
  DiffOutlined,
  LinkOutlined,
  FileZipOutlined,
  ReadOutlined,
  StarOutlined
} from '@ant-design/icons';
import documentServiceAPI from '../services/documentService';
import { useAuth } from '../context/AuthContext';
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
import RealtimeCollaborativeEditor from './editor/RealtimeCollaborativeEditor';
import './DocumentControl.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Dragger } = Upload;
const { RangePicker } = DatePicker;

// ============================================================
// CONSTANTS
// ============================================================

const DOCUMENT_TYPES = {
  report: { label: 'Report', icon: <FileTextOutlined />, color: '#1890ff' },
  policy: { label: 'Policy/Procedure', icon: <FileTextOutlined />, color: '#faad14' },
  record: { label: 'Record/Log', icon: <HistoryOutlined />, color: '#722ed1' },
  hse_report: { label: 'HSE Report', icon: <SafetyCertificateOutlined />, color: '#faad14' },
  incident_report: { label: 'Incident Report', icon: <WarningOutlined />, color: '#fa541c' },
  environmental_report: { label: 'Environmental Report', icon: <EnvironmentOutlined />, color: '#52c41a' },
  permit: { label: 'Permit/License', icon: <SafetyCertificateOutlined />, color: '#1890ff' },
  hospital_record: { label: 'Hospital Record', icon: <MedicineBoxOutlined />, color: '#f5222d' },
  quality_document: { label: 'Quality Document', icon: <CheckCircleOutlined />, color: '#1890ff' },
  supply_chain: { label: 'Supply Chain Doc', icon: <GlobalOutlined />, color: '#722ed1' },
  training_material: { label: 'Training Material', icon: <TeamOutlined />, color: '#2f54eb' },
  technical: { label: 'Technical Document', icon: <FileSearchOutlined />, color: '#13c2c2' },
  compliance: { label: 'Compliance Document', icon: <AuditOutlined />, color: '#f5222d' },
  audit_document: { label: 'Audit Document', icon: <FileSearchOutlined />, color: '#13c2c2' }
};

const DOCUMENT_STATUSES = {
  draft: { label: 'Draft', color: 'default', icon: <EditOutlined /> },
  review: { label: 'In Review', color: 'processing', icon: <ClockCircleOutlined /> },
  approved: { label: 'Approved', color: 'success', icon: <CheckCircleOutlined /> },
  published: { label: 'Published', color: 'blue', icon: <SafetyCertificateOutlined /> },
  archived: { label: 'Archived', color: 'warning', icon: <FolderOutlined /> },
  superseded: { label: 'Superseded', color: 'error', icon: <CloseCircleOutlined /> },
  rejected: { label: 'Rejected', color: 'error', icon: <CloseCircleOutlined /> }
};

const CATEGORIES = [
  'Air Quality', 'Water Quality', 'Waste Management', 'Emissions',
  'Biodiversity', 'Social Impact', 'Governance', 'Safety',
  'General', 'Compliance', 'Training', 'Incident', 'Medical',
  'Quality', 'Supply Chain', 'Procurement', 'Logistics', 'Technical'
];

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

const STATUS_COLORS = {
  draft: '#d9d9d9',
  review: '#1890ff',
  approved: '#52c41a',
  published: '#1890ff',
  archived: '#faad14',
  superseded: '#f5222d',
  rejected: '#f5222d'
};

const PRIORITY_LEVELS = {
  low: { label: 'Low', color: '#52c41a', icon: <CheckCircleOutlined /> },
  medium: { label: 'Medium', color: '#faad14', icon: <InfoCircleOutlined /> },
  high: { label: 'High', color: '#f5222d', icon: <WarningOutlined /> },
  critical: { label: 'Critical', color: '#cf1322', icon: <AlertFilled /> }
};

const SORT_OPTIONS = [
  { value: 'updated_desc', label: 'Newest First', icon: <SortDescendingOutlined /> },
  { value: 'updated_asc', label: 'Oldest First', icon: <SortAscendingOutlined /> },
  { value: 'title_asc', label: 'Title A→Z', icon: <SortAscendingOutlined /> },
  { value: 'title_desc', label: 'Title Z→A', icon: <SortDescendingOutlined /> },
  { value: 'status', label: 'By Status', icon: <FilterOutlined /> }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentControl = ({
  siteId = null,
  moduleFilter = null,
  onDocumentChange,
  onDocumentSelect = null,
  onNavigateToFeature = null,
  showStats = true,
  showHeader = true,
  userPlan: propUserPlan = null,
  isSuperAdmin: propIsSuperAdmin = null,
  permissions: propPermissions = null,
  canCreate: propCanCreate = null,
  canUpload: propCanUpload = null
}) => {
  // ============================================================
  // AUTH
  // ============================================================
  const { user } = useAuth();

  // ============================================================
  // STATE
  // ============================================================
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0, draft: 0, review: 0, approved: 0,
    published: 0, archived: 0, rejected: 0, shared: 0
  });

  // UI
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
    priority: 'all',
    tag: 'all'
  });
  const [sortBy, setSortBy] = useState('updated_desc');
  const [viewMode, setViewMode] = useState('table');  // table | card
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
  const [canShare, setCanShare] = useState(false);
  const [canCollaborate, setCanCollaborate] = useState(false);

  // Upload
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Comments & Versions
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [versions, setVersions] = useState([]);

  // Editor / Signature
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [signatureDocumentId, setSignatureDocumentId] = useState(null);

  // Collaboration
  const [collaborationModalVisible, setCollaborationModalVisible] = useState(false);
  const [collaboratingDocument, setCollaboratingDocument] = useState(null);
  const [activeCollaborators, setActiveCollaborators] = useState({});

  // Bulk actions
  const [bulkTagModalVisible, setBulkTagModalVisible] = useState(false);
  const [bulkStatusModalVisible, setBulkStatusModalVisible] = useState(false);
  const [bulkTags, setBulkTags] = useState('');
  const [bulkStatus, setBulkStatus] = useState('approved');

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshInterval = useRef(null);

  // ============================================================
  // PERMISSIONS
  // ============================================================
  const checkPermissions = useCallback(() => {
    const isSuper = propIsSuperAdmin !== null ? propIsSuperAdmin : (window.isSuperAdmin ? window.isSuperAdmin() : false);
    const plan = propUserPlan || (window.getUserPlan ? window.getUserPlan() : 'free');

    setIsSuperAdminUser(isSuper);
    setUserPlan(plan);

    const limits = window.getDocumentLimits ? window.getDocumentLimits() : {};
    setDocumentLimits(limits);

    setCanCreate(propCanCreate !== null ? propCanCreate : (isSuper || (limits?.allow_basic_create === true)));
    setCanEdit(isSuper || (limits?.allow_basic_edit === true));
    setCanDelete(isSuper || (plan === 'pro' || plan === 'enterprise'));
    setCanSign(isSuper || (limits?.allow_signatures === true));
    setCanAudit(isSuper || (limits?.allow_audit === true));
    setCanBulk(isSuper || (limits?.allow_bulk === true));
    setCanAI(isSuper || (limits?.allow_ai === true));
    setCanShare(isSuper || ['pro', 'business', 'enterprise'].includes(plan));
    setCanCollaborate(isSuper || ['pro', 'business', 'enterprise'].includes(plan));
  }, [propIsSuperAdmin, propUserPlan, propCanCreate]);

  // ============================================================
  // DATA FETCHING
  // ============================================================
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search: searchText, ...filters, site_id: siteId };
      Object.keys(params).forEach((key) => {
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
        draft: statsData.draft || docs.filter((d) => d.status === 'draft').length,
        review: statsData.review || docs.filter((d) => d.status === 'review').length,
        approved: statsData.approved || docs.filter((d) => d.status === 'approved').length,
        published: statsData.published || docs.filter((d) => d.status === 'published').length,
        archived: statsData.archived || docs.filter((d) => d.status === 'archived').length,
        rejected: statsData.rejected || docs.filter((d) => d.status === 'rejected').length,
        shared: statsData.shared || docs.filter((d) => d.is_shared).length
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
          data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
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
      if (data) setStats((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  // ============================================================
  // SORTED + FILTERED LIST
  // ============================================================
  const displayedDocuments = useMemo(() => {
    const arr = [...documents];
    switch (sortBy) {
      case 'updated_desc':
        return arr.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
      case 'updated_asc':
        return arr.sort((a, b) => new Date(a.updated_at || 0) - new Date(b.updated_at || 0));
      case 'title_asc':
        return arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'title_desc':
        return arr.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case 'status':
        return arr.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
      default:
        return arr;
    }
  }, [documents, sortBy]);

  // Unique tag list for filter
  const allTags = useMemo(() => {
    const set = new Set();
    documents.forEach((d) => {
      const tags = getTagsArray(d.tags);
      tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [documents]);

  // ============================================================
  // HELPERS
  // ============================================================
  function getTagsArray(tags) {
    if (!tags) return [];
    try {
      if (typeof tags === 'string') {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      }
      if (Array.isArray(tags)) return tags;
      return [];
    } catch (e) {
      if (typeof tags === 'string') {
        return tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
      return [];
    }
  }

  const handleSelectDocument = useCallback((doc) => {
    setSelectedDocument(doc);
    if (onDocumentSelect && doc?.id) onDocumentSelect(doc.id);
  }, [onDocumentSelect]);

  const handleNavigateToFeature = useCallback((featureKey, doc) => {
    if (doc) handleSelectDocument(doc);
    if (onNavigateToFeature) {
      onNavigateToFeature(featureKey, doc?.id);
    } else {
      message.info(`Opening ${featureKey}...`);
    }
  }, [handleSelectDocument, onNavigateToFeature]);

  // ============================================================
  // UPLOAD
  // ============================================================
  const handleUpload = async (values) => {
    if (!canCreate) {
      message.error('Your plan does not allow creating documents. Please upgrade.');
      showUpgradeModal({ requiredPlan: 'basic', message: 'Document creation requires at least Basic plan' });
      return;
    }

    const maxDocs = window.getMaxDocuments ? window.getMaxDocuments() : 'Unlimited';
    if (maxDocs !== 'Unlimited' && documents.length >= maxDocs) {
      message.error(`You have reached the maximum of ${maxDocs} documents for your plan.`);
      showUpgradeModal({ requiredPlan: 'pro', message: `Upgrade to create more than ${maxDocs} documents` });
      return;
    }

    if (fileList.length === 0) {
      message.warning('Please select a file to upload');
      return;
    }

    const fileItem = fileList[0];
    const file = fileItem?.originFileObj || (fileItem instanceof File ? fileItem : null);
    if (!file || !(file instanceof File)) {
      message.error('Please select a valid file');
      return;
    }

    const maxSizeMB = window.getMaxFileSizeMB ? window.getMaxFileSizeMB() : 5;
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
      formData.append('tags', JSON.stringify(values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : []));
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

  // ============================================================
  // DELETE
  // ============================================================
  const handleDelete = async (id) => {
    if (!canDelete) {
      message.error('Your plan does not allow deleting documents.');
      showUpgradeModal({ requiredPlan: 'pro', message: 'Document deletion requires Pro plan' });
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
      showUpgradeModal({ requiredPlan: 'enterprise', message: 'Bulk operations require Enterprise plan' });
      return;
    }
    try {
      await documentServiceAPI.bulkDelete(selectedRowKeys);
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

  const handleBulkArchive = async () => {
    if (!canBulk) return message.error('Bulk operations require Enterprise plan.');
    try {
      await documentServiceAPI.bulkArchive(selectedRowKeys);
      message.success(`${selectedRowKeys.length} documents archived`);
      setSelectedRowKeys([]);
      loadDocuments();
      if (onDocumentChange) onDocumentChange();
    } catch (error) {
      message.error('Failed to archive some documents');
    }
  };

  const handleBulkPublish = async () => {
    if (!canBulk) return message.error('Bulk operations require Enterprise plan.');
    try {
      await documentServiceAPI.bulkPublish(selectedRowKeys);
      message.success(`${selectedRowKeys.length} documents published`);
      setSelectedRowKeys([]);
      loadDocuments();
      if (onDocumentChange) onDocumentChange();
    } catch (error) {
      message.error('Failed to publish some documents');
    }
  };

  const handleBulkAssignTags = async () => {
    if (!bulkTags.trim()) return message.warning('Please enter at least one tag');
    const tags = bulkTags.split(',').map((t) => t.trim()).filter(Boolean);
    if (tags.length === 0) return message.warning('Please enter valid tags');

    try {
      await documentServiceAPI.bulkAssignTags(selectedRowKeys, tags);
      message.success(`Tags applied to ${selectedRowKeys.length} documents`);
      setBulkTags('');
      setBulkTagModalVisible(false);
      setSelectedRowKeys([]);
      loadDocuments();
      if (onDocumentChange) onDocumentChange();
    } catch (error) {
      message.error('Failed to assign tags');
    }
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus) return message.warning('Please select a status');
    try {
      await documentServiceAPI.bulkUpdateStatus(selectedRowKeys, bulkStatus);
      message.success(`${selectedRowKeys.length} documents updated to ${bulkStatus}`);
      setBulkStatusModalVisible(false);
      setSelectedRowKeys([]);
      loadDocuments();
      if (onDocumentChange) onDocumentChange();
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  // ============================================================
  // WORKFLOW
  // ============================================================
  const handleSubmitForReview = async (id) => {
    try {
      await documentServiceAPI.submitForReview(id);
      message.success('Document submitted for review');
      loadDocuments();
      if (selectedDocument?.id === id) loadDocumentDetail(id);
    } catch (error) {
      message.error(error.message || 'Failed to submit document');
    }
  };

  const handleApprove = async (id) => {
    try {
      await documentServiceAPI.approveDocument(id);
      message.success('Document approved');
      loadDocuments();
      if (selectedDocument?.id === id) loadDocumentDetail(id);
    } catch (error) {
      message.error(error.message || 'Failed to approve document');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await documentServiceAPI.rejectDocument(id, reason);
      message.success('Document rejected');
      loadDocuments();
      if (selectedDocument?.id === id) loadDocumentDetail(id);
    } catch (error) {
      message.error(error.message || 'Failed to reject document');
    }
  };

  const handlePublish = async (id) => {
    try {
      await documentServiceAPI.publishDocument(id);
      message.success('Document published');
      loadDocuments();
      if (selectedDocument?.id === id) loadDocumentDetail(id);
    } catch (error) {
      message.error(error.message || 'Failed to publish document');
    }
  };

  const handleArchive = async (id) => {
    try {
      await documentServiceAPI.archiveDocument(id);
      message.success('Document archived');
      loadDocuments();
      if (selectedDocument?.id === id) loadDocumentDetail(id);
    } catch (error) {
      message.error(error.message || 'Failed to archive document');
    }
  };

  // ============================================================
  // DUPLICATE
  // ============================================================
  const handleDuplicate = async (record) => {
    try {
      await documentServiceAPI.createDocument({
        title: `${record.title} (Copy)`,
        description: record.description,
        document_type: record.document_type,
        module: record.module,
        category: record.category,
        tags: getTagsArray(record.tags),
        priority: record.priority,
        company_id: siteId
      });
      message.success('Document duplicated');
      loadDocuments();
      if (onDocumentChange) onDocumentChange();
    } catch (error) {
      message.error('Failed to duplicate document');
    }
  };

  // ============================================================
  // EXPORT
  // ============================================================
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Type', 'Module', 'Status', 'Priority', 'Updated'];
    const rows = displayedDocuments.map((d) => [
      d.id,
      `"${(d.title || '').replace(/"/g, '""')}"`,
      d.document_type || '',
      d.module || '',
      d.status || '',
      d.priority || '',
      d.updated_at || ''
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Exported CSV');
  };

  const handleExportJSON = () => {
    const data = JSON.stringify(displayedDocuments, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Exported JSON');
  };

  // ============================================================
  // COLLABORATION
  // ============================================================
  const handleStartCollaboration = (doc) => {
    if (!canEdit) {
      message.error('Your plan does not allow editing documents. Please upgrade.');
      showUpgradeModal({ requiredPlan: 'pro', message: 'Real-time collaboration requires at least Pro plan' });
      return;
    }
    setCollaboratingDocument(doc);
    setCollaborationModalVisible(true);
  };

  const handleCollaborationClose = () => {
    setCollaborationModalVisible(false);
    setCollaboratingDocument(null);
  };

  const handleCollaborationSave = () => {
    message.success('Document saved from collaboration session');
    loadDocuments();
    loadStats();
    if (onDocumentChange) onDocumentChange();
  };

  const handleCollaboratorsUpdate = (docId, collaborators) => {
    setActiveCollaborators((prev) => ({ ...prev, [docId]: collaborators || [] }));
  };

  // ============================================================
  // COMMENTS
  // ============================================================
  const handleAddComment = async () => {
    if (!commentInput.trim() || !selectedDocument) return;
    setCommentLoading(true);
    try {
      await documentServiceAPI.addComment(selectedDocument.id, commentInput);
      message.success('Comment added');
      setCommentInput('');
      loadDocumentDetail(selectedDocument.id);
    } catch (error) {
      message.error(error.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

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
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [autoRefresh, loadDocuments]);

  // ============================================================
  // SMALL HELPERS
  // ============================================================
  const getStatusTag = (status) => {
    const config = DOCUMENT_STATUSES[status];
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getDocumentTypeTag = (type) => {
    const config = DOCUMENT_TYPES[type];
    if (!config) return <Tag>{type}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getModuleTag = (module) => {
    const config = MODULES.find((m) => m.value === module);
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

  const isSuperAdminUserCheck = () => isSuperAdminUser || window.isSuperAdmin?.() || false;

  // ============================================================
  // RENDER — STATS
  // ============================================================
  const renderStats = () => (
    <Row gutter={[16, 16]} className="document-stats">
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-total">
          <Statistic title="Total Documents" value={stats.total || 0} prefix={<FileTextOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-draft">
          <Statistic title="Drafts" value={stats.draft || 0} prefix={<EditOutlined />} valueStyle={{ color: '#d9d9d9' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-review">
          <Statistic title="In Review" value={stats.review || 0} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#1890ff' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-approved">
          <Statistic title="Approved" value={stats.approved || 0} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-published">
          <Statistic title="Published" value={stats.published || 0} prefix={<SafetyCertificateOutlined />} valueStyle={{ color: '#1890ff' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-archived">
          <Statistic title="Archived" value={stats.archived || 0} prefix={<FolderOutlined />} valueStyle={{ color: '#faad14' }} />
        </Card>
      </Col>
    </Row>
  );

  // ============================================================
  // RENDER — FILTERS
  // ============================================================
  const renderFilters = () => (
    <div className="document-filters">
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} md={5}>
          <Input.Search
            placeholder="Search documents..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={() => loadDocuments()}
            allowClear
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col xs={12} sm={8} md={2}>
          <Select value={filters.module} onChange={(v) => setFilters({ ...filters, module: v })} style={{ width: '100%' }} allowClear placeholder="Module">
            {MODULES.map((mod) => (<Option key={mod.value} value={mod.value}>{mod.icon} {mod.label}</Option>))}
          </Select>
        </Col>
        <Col xs={12} sm={8} md={2}>
          <Select value={filters.document_type} onChange={(v) => setFilters({ ...filters, document_type: v })} style={{ width: '100%' }} allowClear placeholder="Type">
            <Option value="all">All Types</Option>
            {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (<Option key={key} value={key}>{value.icon} {value.label}</Option>))}
          </Select>
        </Col>
        <Col xs={12} sm={8} md={2}>
          <Select value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} style={{ width: '100%' }} allowClear placeholder="Status">
            <Option value="all">All Statuses</Option>
            {Object.entries(DOCUMENT_STATUSES).map(([key, value]) => (<Option key={key} value={key}>{value.icon} {value.label}</Option>))}
          </Select>
        </Col>
        <Col xs={12} sm={8} md={2}>
          <Select value={filters.priority} onChange={(v) => setFilters({ ...filters, priority: v })} style={{ width: '100%' }} allowClear placeholder="Priority">
            <Option value="all">All Priorities</Option>
            {Object.entries(PRIORITY_LEVELS).map(([key, value]) => (<Option key={key} value={key}>{value.icon} {value.label}</Option>))}
          </Select>
        </Col>
        <Col xs={12} sm={8} md={2}>
          <Select value={filters.tag} onChange={(v) => setFilters({ ...filters, tag: v })} style={{ width: '100%' }} allowClear placeholder="Tag">
            <Option value="all">All Tags</Option>
            {allTags.map((t) => (<Option key={t} value={t}>{t}</Option>))}
          </Select>
        </Col>
        <Col xs={12} sm={8} md={2}>
          <Select value={sortBy} onChange={setSortBy} style={{ width: '100%' }} placeholder="Sort">
            {SORT_OPTIONS.map((o) => (<Option key={o.value} value={o.value}>{o.icon} {o.label}</Option>))}
          </Select>
        </Col>
        <Col xs={24} md={5}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Tooltip title="Table view">
              <Button size="small" type={viewMode === 'table' ? 'primary' : 'default'} icon={<TableOutlined />} onClick={() => setViewMode('table')} />
            </Tooltip>
            <Tooltip title="Card view">
              <Button size="small" type={viewMode === 'card' ? 'primary' : 'default'} icon={<AppstoreFilled />} onClick={() => setViewMode('card')} />
            </Tooltip>

            <Dropdown
              menu={{
                items: [
                  { key: 'csv', label: 'Export CSV', icon: <ExportOutlined />, onClick: handleExportCSV },
                  { key: 'json', label: 'Export JSON', icon: <ExportOutlined />, onClick: handleExportJSON }
                ]
              }}
            >
              <Button size="small" icon={<CloudDownloadOutlined />}>Export</Button>
            </Dropdown>

            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="Auto"
              unCheckedChildren="Manual"
              size="small"
            />
            <Button icon={<ReloadOutlined />} onClick={loadDocuments} loading={loading} size="small" />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                if (!canCreate) {
                  message.error('Your plan does not allow creating documents. Please upgrade.');
                  showUpgradeModal({ requiredPlan: 'basic', message: 'Document creation requires at least Basic plan' });
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

  // ============================================================
  // RENDER — TABLE
  // ============================================================
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
      { title: 'Module', dataIndex: 'module', key: 'module', render: (m) => getModuleTag(m) },
      { title: 'Type', dataIndex: 'document_type', key: 'document_type', render: (t) => getDocumentTypeTag(t) },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status, record) => (
          <Space wrap>
            {getStatusTag(status)}
            {record.priority && getPriorityTag(record.priority)}
          </Space>
        )
      },
      {
        title: 'Changes',
        key: 'changes',
        width: 90,
        render: (_, record) => (
          record.pending_changes > 0
            ? <Badge count={record.pending_changes} style={{ backgroundColor: '#faad14' }} />
            : <Text type="secondary">—</Text>
        )
      },
      { title: 'Updated', dataIndex: 'updated_at', key: 'updated_at', render: (d) => formatDate(d) },
      {
        title: 'Actions',
        key: 'actions',
        width: 240,
        render: (_, record) => (
          <Space>
            <Tooltip title="Edit Document">
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditingDocument(record); setEditorVisible(true); }} />
            </Tooltip>
            <Tooltip title="View Details">
              <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedDocument(record); setDetailDrawerVisible(true); loadDocumentDetail(record.id); }} />
            </Tooltip>
            <Tooltip title="Sign Document">
              <Button type="text" size="small" icon={<SignatureOutlined />} onClick={() => { setSignatureDocumentId(record.id); setSignatureModalVisible(true); }} />
            </Tooltip>
            <Tooltip title="Download">
              <Button type="text" size="small" icon={<DownloadOutlined />} onClick={() => documentServiceAPI.downloadDocument(record.id)} />
            </Tooltip>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'adv',
                    type: 'group',
                    label: 'Advanced Features',
                    children: [
                      { key: 'access-control', label: 'Access Control', icon: <KeyOutlined />, onClick: () => handleNavigateToFeature('access-control', record) },
                      { key: 'retention', label: 'Retention', icon: <ClockCircleOutlined />, onClick: () => handleNavigateToFeature('retention', record) },
                      { key: 'watermarking', label: 'Watermark', icon: <FileProtectOutlined />, onClick: () => handleNavigateToFeature('watermarking', record) },
                      { key: 'compliance-reports', label: 'Compliance Report', icon: <AuditOutlined />, onClick: () => handleNavigateToFeature('compliance-reports', record) }
                    ]
                  },
                  {
                    key: 'collab',
                    type: 'group',
                    label: 'Collaboration',
                    children: [
                      { key: 'collaborate', label: 'Real-Time Collaborate', icon: <TeamOutlined />, onClick: () => handleNavigateToFeature('collaborate', record) },
                      { key: 'share', label: 'Share Portal', icon: <ShareAltOutlined />, onClick: () => handleNavigateToFeature('share', record) },
                      { key: 'assistant', label: 'Ask AI', icon: <MessageOutlined />, onClick: () => handleNavigateToFeature('assistant', record) },
                      { key: 'diff', label: 'Compare Version', icon: <DiffOutlined />, onClick: () => handleNavigateToFeature('compare', record) }
                    ]
                  },
                  {
                    key: 'workflow',
                    type: 'group',
                    label: 'Workflow',
                    children: [
                      ...(record.status === 'draft' ? [{ key: 'submit', label: 'Submit for Review', icon: <SendOutlined />, onClick: () => handleSubmitForReview(record.id) }] : []),
                      ...(record.status === 'review' ? [
                        { key: 'approve', label: 'Approve', icon: <CheckOutlined />, onClick: () => handleApprove(record.id) },
                        { key: 'reject', label: 'Reject', icon: <CloseOutlined />, onClick: () => {
                          Modal.confirm({
                            title: 'Reject Document',
                            content: <Input.TextArea placeholder="Reason for rejection..." id="reject-reason" rows={3} />,
                            onOk: () => {
                              const reason = document.getElementById('reject-reason')?.value || '';
                              handleReject(record.id, reason);
                            }
                          });
                        } }
                      ] : []),
                      ...(record.status === 'approved' ? [{ key: 'publish', label: 'Publish', icon: <SafetyCertificateOutlined />, onClick: () => handlePublish(record.id) }] : []),
                      ...((record.status === 'published' || record.status === 'approved') ? [{ key: 'archive', label: 'Archive', icon: <FolderOutlined />, onClick: () => handleArchive(record.id) }] : [])
                    ]
                  },
                  { type: 'divider' },
                  ...(canSign ? [{ key: 'sign', label: 'Sign Document', icon: <SignatureOutlined />, onClick: () => { setSignatureDocumentId(record.id); setSignatureModalVisible(true); } }] : []),
                  { key: 'duplicate', label: 'Duplicate', icon: <CopyOutlined />, onClick: () => handleDuplicate(record) },
                  ...(canDelete ? [{ key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true, onClick: () => {
                    Modal.confirm({
                      title: 'Delete Document?',
                      content: `"${record.title}" will be permanently deleted.`,
                      okText: 'Delete',
                      okType: 'danger',
                      onOk: () => handleDelete(record.id)
                    });
                  } }] : [])
                ]
              }}
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
        dataSource={displayedDocuments}
        loading={loading}
        locale={{
          emptyText: (
            <Empty
              description={
                <Space direction="vertical">
                  <Text type="secondary">No documents yet</Text>
                  {canCreate && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadModalVisible(true)}>
                      Upload Your First Document
                    </Button>
                  )}
                </Space>
              }
            />
          )
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} documents`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        scroll={{ x: 1200 }}
      />
    );
  };

  // ============================================================
  // RENDER — CARD VIEW
  // ============================================================
  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {displayedDocuments.map((doc) => (
        <Col xs={24} sm={12} md={8} lg={6} key={doc.id}>
          <Card
            hoverable
            size="small"
            onClick={() => { setSelectedDocument(doc); setDetailDrawerVisible(true); loadDocumentDetail(doc.id); }}
            actions={[
              <Tooltip key="edit" title="Edit"><EditOutlined onClick={(e) => { e.stopPropagation(); setEditingDocument(doc); setEditorVisible(true); }} /></Tooltip>,
              <Tooltip key="sign" title="Sign"><SignatureOutlined onClick={(e) => { e.stopPropagation(); setSignatureDocumentId(doc.id); setSignatureModalVisible(true); }} /></Tooltip>,
              <Tooltip key="download" title="Download"><DownloadOutlined onClick={(e) => { e.stopPropagation(); documentServiceAPI.downloadDocument(doc.id); }} /></Tooltip>
            ]}
          >
            <Card.Meta
              avatar={getFileIcon(doc.file_name)}
              title={<span style={{ fontSize: 14 }}>{doc.title}</span>}
              description={
                <Space direction="vertical" size={2} style={{ fontSize: 12 }}>
                  <div>{getDocumentTypeTag(doc.document_type)}</div>
                  <div>{getStatusTag(doc.status)}</div>
                  <div style={{ color: '#8c8c8c' }}>{formatDate(doc.updated_at)}</div>
                </Space>
              }
            />
          </Card>
        </Col>
      ))}
      {displayedDocuments.length === 0 && (
        <Col span={24}>
          <Empty
            description={
              <Space direction="vertical">
                <Text type="secondary">No documents yet</Text>
                {canCreate && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadModalVisible(true)}>
                    Upload Your First Document
                  </Button>
                )}
              </Space>
            }
          />
        </Col>
      )}
    </Row>
  );

  // ============================================================
  // UPLOAD MODAL
  // ============================================================
  const renderUploadModal = () => {
    const maxSizeMB = window.getMaxFileSizeMB ? window.getMaxFileSizeMB() : 5;
    const maxDocs = window.getMaxDocuments ? window.getMaxDocuments() : 'Unlimited';

    return (
      <Modal
        title={<Space><CloudUploadOutlined /> Upload Document</Space>}
        open={uploadModalVisible}
        onCancel={() => { setUploadModalVisible(false); form.resetFields(); setFileList([]); }}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Alert
            message="Plan Limits"
            description={
              <div>
                <div>Max documents: <strong>{maxDocs}</strong></div>
                <div>Max file size: <strong>{maxSizeMB === 'Unlimited' ? 'Unlimited' : `${maxSizeMB} MB`}</strong></div>
              </div>
            }
            type="info"
            showIcon
          />
        </div>

        <Form form={form} layout="vertical" onFinish={handleUpload} initialValues={{ document_type: 'report', module: 'general', priority: 'medium' }}>
          <Form.Item name="title" label="Document Title" rules={[{ required: true, message: 'Please enter a title' }]}>
            <Input placeholder="Enter document title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter description" />
          </Form.Item>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="module" label="Module" rules={[{ required: true, message: 'Please select a module' }]}>
                <Select placeholder="Select module">
                  {MODULES.filter((m) => m.value !== 'all').map((mod) => (<Option key={mod.value} value={mod.value}>{mod.icon} {mod.label}</Option>))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="document_type" label="Document Type" rules={[{ required: true, message: 'Please select type' }]}>
                <Select placeholder="Select type" showSearch>
                  {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (<Option key={key} value={key}>{value.icon} {value.label}</Option>))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="category" label="Category">
                <Select placeholder="Select category" allowClear>
                  {CATEGORIES.map((cat) => (<Option key={cat} value={cat}>{cat}</Option>))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority">
                <Select placeholder="Select priority">
                  {Object.entries(PRIORITY_LEVELS).map(([key, value]) => (<Option key={key} value={key}>{value.icon} {value.label}</Option>))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tags" label="Tags" extra="Separate with commas">
            <Input placeholder="e.g. compliance, 2024, q1" />
          </Form.Item>
          <Form.Item label="File" required>
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
              <p className="ant-upload-hint">PDF, Word, Excel, Images, Text</p>
            </Dragger>
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => { setUploadModalVisible(false); form.resetFields(); setFileList([]); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={uploading}>Upload</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // ============================================================
  // DETAIL DRAWER
  // ============================================================
  const renderDetailDrawer = () => (
    <Drawer
      title={<Space>{selectedDocument && getFileIcon(selectedDocument.file_name)}<span style={{ fontWeight: 500 }}>{selectedDocument?.title}</span>{selectedDocument && getStatusTag(selectedDocument.status)}</Space>}
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={900}
      extra={
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setDetailDrawerVisible(false); setEditingDocument(selectedDocument); setEditorVisible(true); }}>Edit</Button>
          <Button icon={<SignatureOutlined />} onClick={() => { setDetailDrawerVisible(false); setSignatureDocumentId(selectedDocument?.id); setSignatureModalVisible(true); }}>Sign</Button>
          <Button icon={<DownloadOutlined />} onClick={() => documentServiceAPI.downloadDocument(selectedDocument?.id)}>Download</Button>
          <Button icon={<CommentOutlined />} onClick={() => setCommentDrawerVisible(true)}>Comments ({comments.length})</Button>
          <Button icon={<HistoryOutlined />} onClick={() => setVersionDrawerVisible(true)}>Versions ({versions.length})</Button>
          <Button type="primary" onClick={() => setDetailDrawerVisible(false)}>Close</Button>
        </Space>
      }
    >
      {selectedDocument ? (
        <Tabs defaultActiveKey="details">
          <TabPane tab={<span><FileTextOutlined /> Details</span>} key="details">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Title" span={2}><Text strong>{selectedDocument.title}</Text></Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>{selectedDocument.description || 'No description'}</Descriptions.Item>
              <Descriptions.Item label="Module">{getModuleTag(selectedDocument.module)}</Descriptions.Item>
              <Descriptions.Item label="Type">{getDocumentTypeTag(selectedDocument.document_type)}</Descriptions.Item>
              <Descriptions.Item label="Category"><Tag>{selectedDocument.category || 'Uncategorized'}</Tag></Descriptions.Item>
              <Descriptions.Item label="Priority">{getPriorityTag(selectedDocument.priority)}</Descriptions.Item>
              <Descriptions.Item label="Status">{getStatusTag(selectedDocument.status)}</Descriptions.Item>
              <Descriptions.Item label="Version">v{selectedDocument.version || 1}</Descriptions.Item>
              <Descriptions.Item label="File">{selectedDocument.file_name || 'No file'}</Descriptions.Item>
              <Descriptions.Item label="Size">{formatFileSize(selectedDocument.file_size)}</Descriptions.Item>
              <Descriptions.Item label="Created By">{selectedDocument.created_by?.name || selectedDocument.created_by || 'Unknown'}</Descriptions.Item>
              <Descriptions.Item label="Created At">{formatDate(selectedDocument.created_at)}</Descriptions.Item>
              <Descriptions.Item label="Updated At" span={2}>{formatDate(selectedDocument.updated_at)}</Descriptions.Item>
              {(() => {
                const tagsArray = getTagsArray(selectedDocument.tags);
                return tagsArray.length > 0 && (
                  <Descriptions.Item label="Tags" span={2}>
                    {tagsArray.map((tag) => (<Tag key={tag}>{tag}</Tag>))}
                  </Descriptions.Item>
                );
              })()}
            </Descriptions>

            {/* PDF preview if applicable */}
            {selectedDocument.file_url && selectedDocument.mime_type === 'application/pdf' && (
              <>
                <Divider />
                <Title level={5}>Preview</Title>
                <iframe
                  title="Document preview"
                  src={selectedDocument.file_url}
                  style={{ width: '100%', height: 500, border: '1px solid #f0f0f0', borderRadius: 6 }}
                />
              </>
            )}

            <Divider />

            {/* Advanced Features */}
            <Title level={5}>Advanced Features</Title>
            <Space wrap>
              <Button icon={<KeyOutlined />} onClick={() => { setDetailDrawerVisible(false); handleNavigateToFeature('access-control', selectedDocument); }}>Access Control</Button>
              <Button icon={<ClockCircleOutlined />} onClick={() => { setDetailDrawerVisible(false); handleNavigateToFeature('retention', selectedDocument); }}>Retention</Button>
              <Button icon={<FileProtectOutlined />} onClick={() => { setDetailDrawerVisible(false); handleNavigateToFeature('watermarking', selectedDocument); }}>Watermark</Button>
              <Button icon={<TeamOutlined />} onClick={() => { setDetailDrawerVisible(false); handleNavigateToFeature('collaborate', selectedDocument); }}>Collaborate</Button>
              <Button icon={<ShareAltOutlined />} onClick={() => { setDetailDrawerVisible(false); handleNavigateToFeature('share', selectedDocument); }}>Share</Button>
              <Button icon={<MessageOutlined />} onClick={() => { setDetailDrawerVisible(false); handleNavigateToFeature('assistant', selectedDocument); }}>Ask AI</Button>
              <Button icon={<AuditOutlined />} onClick={() => { setDetailDrawerVisible(false); handleNavigateToFeature('compliance-reports', selectedDocument); }}>Compliance Report</Button>
            </Space>

            <Divider />

            {/* Workflow Actions */}
            <Title level={5}>Workflow Actions</Title>
            <Space wrap>
              <Button type="primary" icon={<TeamOutlined />} onClick={() => { setDetailDrawerVisible(false); handleStartCollaboration(selectedDocument); }} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                Start Collaboration
              </Button>

              {selectedDocument.status === 'draft' && (
                <Button type="primary" icon={<SendOutlined />} onClick={() => handleSubmitForReview(selectedDocument.id)}>Submit for Review</Button>
              )}
              {selectedDocument.status === 'review' && (
                <>
                  <Button type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(selectedDocument.id)}>Approve</Button>
                  <Button danger icon={<CloseOutlined />} onClick={() => {
                    Modal.confirm({
                      title: 'Reject Document',
                      content: <Input.TextArea placeholder="Reason..." id="reject-reason-detail" rows={3} />,
                      onOk: () => {
                        const reason = document.getElementById('reject-reason-detail')?.value || '';
                        handleReject(selectedDocument.id, reason);
                      }
                    });
                  }}>Reject</Button>
                </>
              )}
              {selectedDocument.status === 'approved' && (
                <Button type="primary" icon={<SafetyCertificateOutlined />} onClick={() => handlePublish(selectedDocument.id)}>Publish</Button>
              )}
              {(selectedDocument.status === 'published' || selectedDocument.status === 'approved') && (
                <Button icon={<FolderOutlined />} onClick={() => handleArchive(selectedDocument.id)}>Archive</Button>
              )}
              <Button icon={<EditOutlined />} onClick={() => { setDetailDrawerVisible(false); setEditingDocument(selectedDocument); setEditorVisible(true); }}>Edit Document</Button>
              <Button icon={<SignatureOutlined />} onClick={() => { setDetailDrawerVisible(false); setSignatureDocumentId(selectedDocument.id); setSignatureModalVisible(true); }}>Sign Document</Button>
              <Button icon={<CopyOutlined />} onClick={() => { handleDuplicate(selectedDocument); setDetailDrawerVisible(false); }}>Duplicate</Button>
              {canDelete && (
                <Button danger icon={<DeleteOutlined />} onClick={() => {
                  Modal.confirm({
                    title: 'Delete Document?',
                    content: `"${selectedDocument.title}" will be permanently deleted.`,
                    okText: 'Delete',
                    okType: 'danger',
                    onOk: () => { handleDelete(selectedDocument.id); setDetailDrawerVisible(false); }
                  });
                }}>Delete</Button>
              )}
            </Space>
          </TabPane>

          <TabPane tab={<span><HistoryOutlined /> Versions</span>} key="versions">
            {versions.length > 0 ? (
              <Timeline>
                {versions.map((v, i) => (
                  <Timeline.Item key={i} color={v.is_current ? 'green' : 'gray'}>
                    <div>
                      <Space>
                        <strong>Version {v.version}</strong>
                        {v.is_current && <Tag color="green">Current</Tag>}
                      </Space>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{v.changes || 'No changes recorded'}</div>
                      <div style={{ fontSize: 12, color: '#bfbfbf' }}>{formatDate(v.created_at)}{v.created_by && ` • By ${v.created_by}`}</div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (<Empty description="No versions available" />)}
          </TabPane>
        </Tabs>
      ) : (<Empty description="No document selected" />)}
    </Drawer>
  );

  // ============================================================
  // VERSION / COMMENT DRAWERS
  // ============================================================
  const renderVersionDrawer = () => (
    <Drawer title={<Space><HistoryOutlined /> Version History</Space>} open={versionDrawerVisible} onClose={() => setVersionDrawerVisible(false)} width={500}>
      {versions.length > 0 ? (
        <Timeline>
          {versions.map((v, i) => (
            <Timeline.Item key={i} color={v.is_current ? 'green' : 'gray'}>
              <Space>
                <strong>v{v.version}</strong>
                {v.is_current && <Tag color="green">Current</Tag>}
              </Space>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{v.changes || 'No changes'}</div>
              <div style={{ fontSize: 12, color: '#bfbfbf' }}>{formatDate(v.created_at)}</div>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (<Empty description="No versions" />)}
    </Drawer>
  );

  const renderCommentDrawer = () => (
    <Drawer title={<Space><CommentOutlined /> Comments ({comments.length})</Space>} open={commentDrawerVisible} onClose={() => setCommentDrawerVisible(false)} width={500}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
          {comments.length > 0 ? (
            <List
              dataSource={comments}
              renderItem={(c) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={c.user?.name || c.created_by?.name || 'User'}
                    description={
                      <div>
                        <div>{c.content}</div>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>{formatDate(c.created_at)}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (<Empty description="No comments yet" />)}
        </div>
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <TextArea rows={3} value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Add a comment..." />
          <Button type="primary" style={{ marginTop: 8 }} onClick={handleAddComment} loading={commentLoading} block>Post Comment</Button>
        </div>
      </div>
    </Drawer>
  );

  // ============================================================
  // BULK MODALS
  // ============================================================
  const renderBulkTagModal = () => (
    <Modal
      title="Add Tags to Selected Documents"
      open={bulkTagModalVisible}
      onCancel={() => { setBulkTagModalVisible(false); setBulkTags(''); }}
      onOk={handleBulkAssignTags}
      okText={`Apply to ${selectedRowKeys.length} document(s)`}
      okButtonProps={{ disabled: !bulkTags.trim() }}
    >
      <Alert message={`Applying tags to ${selectedRowKeys.length} document(s)`} type="info" showIcon style={{ marginBottom: 16 }} />
      <Input placeholder="Enter tags separated by commas" value={bulkTags} onChange={(e) => setBulkTags(e.target.value)} onPressEnter={handleBulkAssignTags} autoFocus />
      <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>Example: compliance, 2024, q1, urgent</div>
    </Modal>
  );

  const renderBulkStatusModal = () => (
    <Modal
      title="Change Status for Selected Documents"
      open={bulkStatusModalVisible}
      onCancel={() => setBulkStatusModalVisible(false)}
      onOk={handleBulkStatusChange}
      okText={`Update ${selectedRowKeys.length} document(s)`}
    >
      <Alert message={`Changing status for ${selectedRowKeys.length} document(s)`} type="warning" showIcon style={{ marginBottom: 16 }} />
      <Select value={bulkStatus} onChange={setBulkStatus} style={{ width: '100%' }} size="large">
        {Object.entries(DOCUMENT_STATUSES).map(([key, value]) => (<Option key={key} value={key}>{value.icon} {value.label}</Option>))}
      </Select>
    </Modal>
  );

  // ============================================================
  // EDITOR / SIGNATURE MODALS
  // ============================================================
  const renderEditorModal = () => (
    <Modal
      title="Edit Document"
      open={editorVisible}
      onCancel={() => { setEditorVisible(false); setEditingDocument(null); }}
      footer={null}
      width="95%"
      style={{ top: 20 }}
      styles={{ body: { padding: '16px', maxHeight: 'calc(100vh - 120px)', overflow: 'auto' } }}
      destroyOnClose
    >
      <DocumentEditor
        documentId={editingDocument?.id}
        initialContent={editingDocument?.content || ''}
        initialPdfUrl={editingDocument?.file_url}
        onSave={() => { setEditorVisible(false); setEditingDocument(null); loadDocuments(); loadStats(); if (onDocumentChange) onDocumentChange(); }}
        onCancel={() => { setEditorVisible(false); setEditingDocument(null); }}
        onDocumentUpdate={() => { loadDocuments(); if (onDocumentChange) onDocumentChange(); }}
        companyId={siteId}
        currentUser={user}
        userRole={userPlan}
        isPdf={editingDocument?.file_url?.endsWith('.pdf')}
      />
    </Modal>
  );

  const renderSignatureModal = () => (
    <Modal
      title="Document Signatures"
      open={signatureModalVisible}
      onCancel={() => { setSignatureModalVisible(false); setSignatureDocumentId(null); }}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      styles={{ body: { padding: '16px', maxHeight: 'calc(100vh - 200px)', overflow: 'auto' } }}
      destroyOnClose
    >
      <DocumentSignature
        documentId={signatureDocumentId}
        documentTitle={documents.find((d) => d.id === signatureDocumentId)?.title || ''}
        onSignatureComplete={() => { setSignatureModalVisible(false); setSignatureDocumentId(null); loadDocuments(); if (onDocumentChange) onDocumentChange(); }}
        companyId={siteId}
        currentUser={user}
        userRole={userPlan}
      />
    </Modal>
  );

  // ============================================================
  // COLLABORATION MODAL
  // ============================================================
  const renderCollaborationModal = () => {
    if (!collaboratingDocument) return null;
    return (
      <Modal
        title={<Space><TeamOutlined style={{ color: '#52c41a' }} /><span>Real-Time Collaboration</span><Tag color="blue">{collaboratingDocument.title}</Tag><Badge status="processing" text="Live" /></Space>}
        open={collaborationModalVisible}
        onCancel={handleCollaborationClose}
        footer={null}
        width="95%"
        style={{ top: 20 }}
        styles={{ body: { padding: '16px', maxHeight: 'calc(100vh - 120px)', overflow: 'auto' } }}
        destroyOnClose
        maskClosable={false}
      >
        <Alert
          message="Real-Time Collaboration Session"
          description="You are now editing this document in real-time with other users. Changes sync instantly; autosave is enabled."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          closable
        />
        <RealtimeCollaborativeEditor
          documentId={collaboratingDocument.id}
          documentTitle={collaboratingDocument.title}
          currentUser={{
            id: user?.id || 'current_user',
            name: user?.name || user?.email || 'You',
            email: user?.email
          }}
          onSave={handleCollaborationSave}
          onContentChange={() => {}}
          onCollaboratorsChange={(collaborators) => handleCollaboratorsUpdate(collaboratingDocument.id, collaborators)}
          readOnly={false}
          embedded={true}
        />
      </Modal>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="document-control">
      {showHeader && (
        <div className="document-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Space>
              <FileTextOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Document Control</Title>
              <Badge status="processing" text="Live" />
              <Tag color="blue">{documents.length} loaded</Tag>
              {isSuperAdminUserCheck() && (<Tag color="gold" icon={<StarFilled />}>Super Admin</Tag>)}
              {!isSuperAdminUserCheck() && (<Tag color="blue">{(userPlan || 'free').toUpperCase()} Plan</Tag>)}
            </Space>
          </div>
        </div>
      )}

      {showStats && renderStats()}
      {renderFilters()}

      {/* Bulk Actions Bar */}
      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '8px 16px', background: '#f6f8fa', borderRadius: 8 }}>
          <Space wrap>
            <span><strong>{selectedRowKeys.length}</strong> selected</span>
            {canBulk && (<Button size="small" icon={<FolderOutlined />} onClick={handleBulkArchive}>Archive</Button>)}
            {canBulk && (<Button size="small" icon={<SafetyCertificateOutlined />} onClick={handleBulkPublish}>Publish</Button>)}
            {canBulk && (<Button size="small" icon={<TagsOutlined />} onClick={() => setBulkTagModalVisible(true)}>Add Tags</Button>)}
            {canBulk && (<Button size="small" icon={<EditOutlined />} onClick={() => setBulkStatusModalVisible(true)}>Change Status</Button>)}
            {canBulk && (
              <PopconfirmAntd title={`Delete ${selectedRowKeys.length} documents?`} onConfirm={handleBulkDelete} okText="Yes" cancelText="No">
                <Button danger size="small" icon={<DeleteOutlined />}>Delete</Button>
              </PopconfirmAntd>
            )}
            {!canBulk && (
              <Tooltip title="Bulk operations require Enterprise plan">
                <Button danger size="small" icon={<LockOutlined />} disabled>Bulk Actions (Upgrade Required)</Button>
              </Tooltip>
            )}
            <Button size="small" icon={<ClearOutlined />} onClick={() => setSelectedRowKeys([])}>Clear</Button>
          </Space>
        </div>
      )}

      {/* Document List */}
      {viewMode === 'table' ? renderDocumentTable() : renderCardView()}

      {/* Modals */}
      {renderUploadModal()}
      {renderBulkTagModal()}
      {renderBulkStatusModal()}
      {renderEditorModal()}
      {renderSignatureModal()}
      {renderCollaborationModal()}

      {/* Drawers */}
      {renderDetailDrawer()}
      {renderVersionDrawer()}
      {renderCommentDrawer()}
    </div>
  );
};

export default DocumentControl;
