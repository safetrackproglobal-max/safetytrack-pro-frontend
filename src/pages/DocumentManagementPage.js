// src/pages/DocumentManagementPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Layout, Tabs, Button, Space, Card, Row, Col, Statistic,
  Badge, Tooltip, message, Switch, Typography, Divider,
  Tag, Avatar, Progress, Alert, Spin, Empty, List,
  Skeleton, Timeline, Modal, Input, Select, DatePicker,
  Form, Upload, Drawer, Descriptions, Table, Dropdown, Menu
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DashboardOutlined,
  SafetyOutlined,
  HistoryOutlined,
  AuditOutlined,
  CalendarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  MoreOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  BellOutlined,
  InboxOutlined,
  CloudUploadOutlined,
  RobotOutlined,
  ScanOutlined,
  BarChartOutlined,
  DiffOutlined,
  BuildOutlined,
  HomeOutlined,
  ShopOutlined,
  HeartOutlined,
  RocketOutlined,
  BookOutlined,
  LockOutlined,
  BugOutlined,
  ConsoleSqlOutlined
} from '@ant-design/icons';
import DocumentControl from '../components/DocumentControl';
import DocumentReview from '../components/documents/DocumentReview';
import DocumentAudit from '../components/documents/DocumentAudit';
import DocumentDashboard from '../components/documents/DocumentDashboard';
import DocumentAnalytics from '../components/documents/DocumentAnalytics';
import documentService from '../services/documentService';
import { useAuth } from '../context/AuthContext';
import './DocumentManagementPage.css';

// ============================================================
// HSE-SPECIFIC COMPONENT IMPORTS
// ============================================================
import ComplianceFramework from '../components/documents/ComplianceFramework';
import IncidentLinking from '../components/documents/IncidentLinking';
import SDSManagement from '../components/documents/SDSManagement';
import PTWIntegration from '../components/documents/PTWIntegration';
import AIClassification from '../components/documents/AIClassification';
import OCRProcessor from '../components/documents/OCRProcessor';
import ExpirationDashboard from '../components/documents/ExpirationDashboard';
import DocumentCompare from '../components/documents/DocumentCompare';
import ApprovalChain from '../components/documents/ApprovalChain';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// ============================================================
// DOCUMENT TYPES - GENERAL
// ============================================================
const DOCUMENT_TYPES = [
  { value: 'general', label: 'General Document', icon: <FileTextOutlined /> },
  { value: 'report', label: 'Report', icon: <FileTextOutlined /> },
  { value: 'policy', label: 'Policy/Procedure', icon: <SafetyCertificateOutlined /> },
  { value: 'record', label: 'Record/Log', icon: <HistoryOutlined /> },
  { value: 'contract', label: 'Contract/Agreement', icon: <FileTextOutlined /> },
  { value: 'inspection', label: 'Inspection Report', icon: <ScanOutlined /> },
  { value: 'audit', label: 'Audit Document', icon: <AuditOutlined /> },
  { value: 'permit', label: 'Permit/License', icon: <SafetyCertificateOutlined /> },
  { value: 'certificate', label: 'Certificate', icon: <CheckCircleOutlined /> },
  { value: 'training', label: 'Training Material', icon: <BookOutlined /> },
  { value: 'presentation', label: 'Presentation', icon: <FileTextOutlined /> },
  { value: 'spreadsheet', label: 'Spreadsheet/Data', icon: <FileExcelOutlined /> },
  { value: 'image', label: 'Image/Photo', icon: <FileImageOutlined /> }
];

// ============================================================
// MODULES
// ============================================================
const MODULES = [
  { value: 'general', label: 'General', icon: <GlobalOutlined /> },
  { value: 'construction', label: 'Construction', icon: <BuildOutlined /> },
  { value: 'hospital', label: 'Hospital/Healthcare', icon: <MedicineBoxOutlined /> },
  { value: 'manufacturing', label: 'Manufacturing', icon: <ShopOutlined /> },
  { value: 'oil_gas', label: 'Oil & Gas', icon: <EnvironmentOutlined /> },
  { value: 'mining', label: 'Mining', icon: <HomeOutlined /> },
  { value: 'environmental', label: 'Environmental', icon: <EnvironmentOutlined /> },
  { value: 'quality', label: 'Quality Management', icon: <SafetyOutlined /> },
  { value: 'safety', label: 'Health & Safety', icon: <SafetyOutlined /> },
  { value: 'supply_chain', label: 'Supply Chain', icon: <ShopOutlined /> },
  { value: 'training', label: 'Training & Development', icon: <RocketOutlined /> },
  { value: 'compliance', label: 'Compliance', icon: <SafetyCertificateOutlined /> }
];

// ============================================================
// CATEGORIES
// ============================================================
const CATEGORIES = [
  { value: 'administrative', label: 'Administrative' },
  { value: 'operational', label: 'Operational' },
  { value: 'technical', label: 'Technical' },
  { value: 'safety', label: 'Safety' },
  { value: 'quality', label: 'Quality' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'medical', label: 'Medical' },
  { value: 'legal', label: 'Legal' },
  { value: 'financial', label: 'Financial' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'training', label: 'Training' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'project', label: 'Project' }
];

// ============================================================
// PLAN-BASED PERMISSIONS (Fallback)
// ============================================================
const PLAN_PERMISSIONS = {
  free: {
    can_create: true,
    can_upload: true,
    can_view: true,
    can_edit: false,
    can_delete: false,
    can_share: false,
    can_version: false,
    can_approve: false,
    can_archive: false
  },
  basic: {
    can_create: true,
    can_upload: true,
    can_view: true,
    can_edit: true,
    can_delete: false,
    can_share: false,
    can_version: false,
    can_approve: false,
    can_archive: false
  },
  pro: {
    can_create: true,
    can_upload: true,
    can_view: true,
    can_edit: true,
    can_delete: true,
    can_share: true,
    can_version: true,
    can_approve: false,
    can_archive: false
  },
  business: {
    can_create: true,
    can_upload: true,
    can_view: true,
    can_edit: true,
    can_delete: true,
    can_share: true,
    can_version: true,
    can_approve: true,
    can_archive: false
  },
  enterprise: {
    can_create: true,
    can_upload: true,
    can_view: true,
    can_edit: true,
    can_delete: true,
    can_share: true,
    can_version: true,
    can_approve: true,
    can_archive: true
  },
  super_admin: {
    can_create: true,
    can_upload: true,
    can_view: true,
    can_edit: true,
    can_delete: true,
    can_share: true,
    can_version: true,
    can_approve: true,
    can_archive: true
  }
};

// ============================================================
// DEBUG UTILITY - Console Only (No UI)
// ============================================================
const DEBUG = {
  enabled: true,
  log: (label, data, type = 'info') => {
    if (!DEBUG.enabled) return;
    const styles = {
      info: 'color: #1890ff; font-weight: bold;',
      success: 'color: #52c41a; font-weight: bold;',
      warning: 'color: #faad14; font-weight: bold;',
      error: 'color: #ff4d4f; font-weight: bold;',
      critical: 'color: #ff4d4f; font-weight: bold; font-size: 14px; background: #fff1f0; padding: 4px 8px; border-radius: 4px;',
      upload: 'color: #722ed1; font-weight: bold; font-size: 14px;',
      file: 'color: #13c2c2; font-weight: bold;',
      state: 'color: #fa8c16; font-weight: bold;'
    };
    const style = styles[type] || styles.info;
    console.log(`%c🔍 [${type.toUpperCase()}] ${label}`, style, data);
  },
  table: (label, data) => {
    if (!DEBUG.enabled) return;
    console.group(`%c📊 [TABLE] ${label}`, 'color: #1890ff; font-weight: bold;');
    console.table(data);
    console.groupEnd();
  },
  group: (label, fn) => {
    if (!DEBUG.enabled) return;
    console.group(`%c📁 [GROUP] ${label}`, 'color: #722ed1; font-weight: bold;');
    fn();
    console.groupEnd();
  },
  trace: (label) => {
    if (!DEBUG.enabled) return;
    console.trace(`%c🔬 [TRACE] ${label}`, 'color: #13c2c2;');
  },
  separator: () => {
    if (!DEBUG.enabled) return;
    console.log('%c' + '='.repeat(80), 'color: #d9d9d9;');
  },
  header: (text) => {
    if (!DEBUG.enabled) return;
    console.log(`%c${text}`, 'color: #1890ff; font-weight: bold; font-size: 16px; background: #e6f7ff; padding: 8px 16px; border-radius: 4px;');
  },
  inspect: (obj) => {
    if (!DEBUG.enabled) return;
    try {
      return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (value instanceof File) {
          return `[File: ${value.name}, ${value.size} bytes, ${value.type}]`;
        }
        if (value instanceof Blob) {
          return `[Blob: ${value.size} bytes]`;
        }
        if (value instanceof FormData) {
          return '[FormData]';
        }
        return value;
      }));
    } catch (e) {
      return obj;
    }
  }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentManagementPage = ({ 
  companyId = null,
  initialTab = 'documents'
}) => {
  // ============================================================
  // STATE
  // ============================================================
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploadDebugInfo, setUploadDebugInfo] = useState({});
  const { user, planData } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    review: 0,
    approved: 0,
    published: 0,
    archived: 0,
    overdue: 0
  });
  const [pendingTasks, setPendingTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [permissions, setPermissions] = useState({
    can_create: false,
    can_upload: false,
    can_view: false,
    can_edit: false,
    can_delete: false,
    can_share: false,
    can_version: false,
    can_approve: false,
    can_archive: false
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [debugInfo, setDebugInfo] = useState({});
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  
  // Refs for debugging
  const uploadRef = useRef(null);
  const fileInputRef = useRef(null);

  // ============================================================
  // ADVANCED DEBUG LOGGING
  // ============================================================
  const logDebug = (label, data, type = 'info') => {
    DEBUG.log(label, data, type);
    setDebugInfo(prev => ({ ...prev, [label]: data }));
  };

  // ============================================================
  // GET USER PLAN AND PERMISSIONS
  // ============================================================
  const getUserPlan = useCallback(() => {
    DEBUG.header('📋 GETTING USER PLAN');
    DEBUG.trace('getUserPlan called');
    
    const isSuperAdmin = user?.is_super_admin || user?.user_type === 'super_admin' || user?.role === 'super_admin';
    setIsSuperAdmin(isSuperAdmin);
    
    if (isSuperAdmin) {
      DEBUG.log('User Plan', 'super_admin', 'success');
      return 'super_admin';
    }
    
    let plan = 'free';
    
    if (planData?.effective_plan) {
      plan = planData.effective_plan;
    } else if (user?.subscription_plan) {
      plan = user.subscription_plan;
    } else if (user?.plan) {
      plan = user.plan;
    } else if (user?.effective_plan) {
      plan = user.effective_plan;
    }
    
    const normalizedPlan = plan?.toLowerCase() || 'free';
    DEBUG.log('User Plan', normalizedPlan, 'success');
    setUserPlan(normalizedPlan);
    return normalizedPlan;
  }, [user, planData]);

  // ============================================================
  // CHECK IF USER IS SUPER ADMIN - DEFINED BEFORE USE!
  // ============================================================
  const isUserSuperAdmin = useCallback(() => {
    const result = isSuperAdmin || user?.is_super_admin || user?.user_type === 'super_admin';
    DEBUG.log('Is Super Admin', result, 'info');
    return result;
  }, [isSuperAdmin, user]);

  // ============================================================
  // GET PERMISSIONS BASED ON PLAN (Fallback)
  // ============================================================
  const getPermissionsForPlan = useCallback((plan) => {
    const planKey = plan?.toLowerCase() || 'free';
    
    if (planKey === 'super_admin') {
      return PLAN_PERMISSIONS.super_admin;
    }
    
    if (PLAN_PERMISSIONS[planKey]) {
      DEBUG.log('Plan Permissions', PLAN_PERMISSIONS[planKey], 'success');
      return PLAN_PERMISSIONS[planKey];
    }
    
    DEBUG.log('Plan Permissions (Default)', PLAN_PERMISSIONS.free, 'warning');
    return PLAN_PERMISSIONS.free;
  }, []);

  // ============================================================
  // ✅ COMPUTED PERMISSIONS - AFTER isUserSuperAdmin IS DEFINED
  // ============================================================
  const canCreate = permissions.can_create || isUserSuperAdmin();
  const canUpload = permissions.can_upload || isUserSuperAdmin();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadDashboardData = useCallback(async () => {
    DEBUG.header('📊 LOADING DASHBOARD DATA');
    DEBUG.separator();
    DEBUG.trace('loadDashboardData called');
    
    setLoading(true);
    try {
      const plan = getUserPlan();
      DEBUG.log('Step 1 - Plan', plan, 'success');
      
      DEBUG.log('Step 2 - Fetching permissions from backend...', null, 'info');
      let perms = null;
      
      try {
        const permsResponse = await documentService.getPermissions({ company_id: companyId });
        DEBUG.log('Step 2 - Permissions Response', DEBUG.inspect(permsResponse), 'info');
        
        if (permsResponse && permsResponse.success) {
          perms = permsResponse.permissions || permsResponse;
          DEBUG.log('Step 3 - Extracted Permissions', perms, 'success');
        } else {
          DEBUG.log('Step 3 - No success flag in response', permsResponse, 'warning');
        }
      } catch (permError) {
        DEBUG.log('Step 2 - Permissions Error', permError.message, 'error');
      }
      
      if (perms) {
        DEBUG.log('Step 4 - Using permissions from backend', perms, 'success');
        setPermissions({
          can_create: perms.can_create || false,
          can_upload: perms.can_upload || false,
          can_view: perms.can_view || false,
          can_edit: perms.can_edit || false,
          can_delete: perms.can_delete || false,
          can_share: perms.can_share || false,
          can_version: perms.can_version || false,
          can_approve: perms.can_approve || false,
          can_archive: perms.can_archive || false
        });
      } else {
        const fallbackPerms = getPermissionsForPlan(plan);
        DEBUG.log('Step 4 - Using fallback permissions', fallbackPerms, 'warning');
        setPermissions(fallbackPerms);
      }
      
      DEBUG.log('Step 5 - Fetching stats, tasks, and documents...', null, 'info');
      const [statsData, tasksData, docsData] = await Promise.all([
        documentService.getStats({ company_id: companyId }),
        documentService.getPendingTasks({ company_id: companyId }),
        documentService.getDocuments({ company_id: companyId, limit: 100 })
      ]);
      
      DEBUG.log('Step 6 - Stats', statsData, 'info');
      DEBUG.log('Step 6 - Tasks', tasksData, 'info');
      DEBUG.log('Step 6 - Documents', docsData, 'info');
      
      setStats(statsData || {});
      setPendingTasks(tasksData?.tasks || []);
      setDocuments(docsData?.documents || []);
      
      DEBUG.log('Step 7 - All data loaded successfully', null, 'success');
      
    } catch (error) {
      DEBUG.log('Failed to load dashboard data', error, 'error');
      message.error('Failed to load dashboard data: ' + (error.message || 'Unknown error'));
      
      const plan = getUserPlan();
      const perms = getPermissionsForPlan(plan);
      DEBUG.log('Using fallback permissions on error', perms, 'warning');
      setPermissions(perms);
    } finally {
      setLoading(false);
      DEBUG.separator();
      DEBUG.log('LOADING COMPLETE', null, 'success');
    }
  }, [companyId, getUserPlan, getPermissionsForPlan]);

  // ============================================================
  // HANDLE SEARCH
  // ============================================================
  const handleQuickSearch = async (value) => {
    if (!value || value.length < 2) {
      setSearchResults([]);
      setQuickSearchVisible(false);
      return;
    }
    
    try {
      const results = await documentService.globalSearch(value, { 
        company_id: companyId,
        limit: 10
      });
      setSearchResults(results?.documents || []);
      setQuickSearchVisible(true);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // ============================================================
  // 🔥🔥🔥 HANDLE UPLOAD - FIXED VERSION 🔥🔥🔥
  // ============================================================
  
  const handleUpload = useCallback(async (values) => {
    DEBUG.header('📤 UPLOADING DOCUMENT');
    DEBUG.separator();
    DEBUG.trace('handleUpload called');
    
    // STEP 1: Log all form values
    DEBUG.log('STEP 1 - Form Values', DEBUG.inspect(values), 'info');
    
    // STEP 2: Determine which file to use
    let fileToUpload = selectedFile;
    let fileSource = 'selectedFile';
    
    DEBUG.log('STEP 2 - Checking selectedFile', {
      exists: !!selectedFile,
      isFile: selectedFile instanceof File,
      name: selectedFile?.name,
      size: selectedFile?.size
    }, 'info');
    
    if (!fileToUpload && fileList.length > 0) {
      const fileFromList = fileList[0];
      DEBUG.log('STEP 2a - Checking fileList[0]', {
        exists: !!fileFromList,
        hasOriginFileObj: !!fileFromList?.originFileObj,
        isFile: fileFromList instanceof File,
        name: fileFromList?.name || fileFromList?.originFileObj?.name
      }, 'info');
      
      if (fileFromList?.originFileObj instanceof File) {
        fileToUpload = fileFromList.originFileObj;
        fileSource = 'fileList.originFileObj';
        DEBUG.log('  - Got file from originFileObj', fileToUpload.name, 'success');
      } else if (fileFromList instanceof File) {
        fileToUpload = fileFromList;
        fileSource = 'fileList[0]';
        DEBUG.log('  - Got file from fileList[0]', fileToUpload.name, 'success');
      }
    }
    
    if (!fileToUpload) {
      DEBUG.log('❌ No file to upload', null, 'error');
      message.warning('Please select a file to upload');
      return;
    }
    
    if (!(fileToUpload instanceof File)) {
      DEBUG.log('❌ Not a File instance', typeof fileToUpload, 'error');
      message.warning('Invalid file selected');
      return;
    }
    
    DEBUG.log('✅ File to upload', {
      name: fileToUpload.name,
      size: fileToUpload.size,
      type: fileToUpload.type,
      source: fileSource,
      isFile: fileToUpload instanceof File
    }, 'success');
    
    // STEP 3: Permission check
    const canUpload = permissions.can_upload || isUserSuperAdmin();
    DEBUG.log('STEP 3 - Permission check', {
      canUpload,
      permissionsCanUpload: permissions.can_upload,
      isSuperAdmin: isUserSuperAdmin()
    }, 'info');
    
    if (!canUpload) {
      DEBUG.log('❌ Upload denied - insufficient permissions', null, 'error');
      message.error('Your plan does not support document uploads. Please upgrade.');
      return;
    }
    
    // STEP 4: Validate form fields
    const title = values.title?.trim();
    const documentType = values.document_type?.trim();
    
    DEBUG.log('STEP 4 - Form field validation', { title, documentType }, 'info');
    
    if (!title) {
      DEBUG.log('❌ Title missing', null, 'error');
      message.error('Title is required');
      return;
    }
    if (!documentType) {
      DEBUG.log('❌ Document type missing', null, 'error');
      message.error('Document type is required');
      return;
    }
    
    // STEP 5: Build data object
    const documentData = {
      title: title,
      document_type: documentType,
      description: values.description?.trim() || '',
      category: values.category || '',
      module: values.module || 'general',
      priority: values.priority || 'medium',
      tags: values.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
      company_id: companyId || '',
      file: fileToUpload  // ✅ The File object
    };
    
    DEBUG.log('STEP 5 - Document data object', {
      ...documentData,
      file: documentData.file ? {
        name: documentData.file.name,
        size: documentData.file.size,
        type: documentData.file.type,
        isFile: documentData.file instanceof File
      } : null
    }, 'info');
    
    setUploading(true);
    try {
      DEBUG.log('STEP 6 - Calling documentService.createDocument...', null, 'info');
      
      // ✅ Pass the object, NOT FormData
      const response = await documentService.createDocument(documentData);
      
      DEBUG.log('STEP 7 - Upload response received', DEBUG.inspect(response), 'info');
      
      if (response?.success) {
        DEBUG.log('✅ Upload successful!', null, 'success');
        message.success('Document uploaded successfully');
        setUploadModalVisible(false);
        form.resetFields();
        setSelectedFile(null);
        setFileList([]);
        loadDashboardData();
      } else {
        DEBUG.log('❌ Upload failed', response?.error, 'error');
        message.error(response?.error || 'Failed to upload document');
      }
    } catch (error) {
      DEBUG.log('❌ Upload error', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      }, 'critical');
      
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Failed to upload document');
      }
    } finally {
      setUploading(false);
      DEBUG.separator();
      DEBUG.log('📤 UPLOAD PROCESS COMPLETE', null, 'success');
    }
  }, [selectedFile, fileList, permissions, isUserSuperAdmin, companyId, form, loadDashboardData]);

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    DEBUG.header('📄 DocumentManagementPage Mounted');
    DEBUG.log('User', DEBUG.inspect(user), 'info');
    DEBUG.log('Plan Data', DEBUG.inspect(planData), 'info');
    DEBUG.log('Company ID', companyId, 'info');
    loadDashboardData();
  }, []);

  // Monitor selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      DEBUG.log('🔍 selectedFile state changed:', selectedFile.name, 'file');
      DEBUG.log('  - name:', selectedFile.name, 'file');
      DEBUG.log('  - size:', selectedFile.size, 'file');
      DEBUG.log('  - type:', selectedFile.type, 'file');
      DEBUG.log('  - is File?:', selectedFile instanceof File, 'info');
      DEBUG.log('  - lastModified:', new Date(selectedFile.lastModified).toISOString(), 'info');
    } else {
      DEBUG.log('🔍 selectedFile state changed: null', null, 'info');
    }
  }, [selectedFile]);

  // Monitor fileList changes
  useEffect(() => {
    DEBUG.log('🔍 fileList state changed:', fileList.length, 'info');
    if (fileList.length > 0) {
      const file = fileList[0];
      DEBUG.log('  - fileList[0]:', file.name || file, 'file');
      DEBUG.log('  - has originFileObj?', !!file.originFileObj, 'info');
      if (file.originFileObj) {
        DEBUG.log('  - originFileObj is File?', file.originFileObj instanceof File, 'info');
      }
    }
  }, [fileList]);

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // Render Stats Cards
  const renderStats = () => (
    <Row gutter={[16, 16]} className="doc-stats">
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

  // Render Quick Actions
  const renderQuickActions = () => {
    return (
      <Card size="small" className="quick-actions">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <div className="search-wrapper">
              <Search
                placeholder="Quick search documents..."
                onSearch={handleQuickSearch}
                onChange={(e) => {
                  if (!e.target.value) {
                    setSearchResults([]);
                    setQuickSearchVisible(false);
                    return;
                  }
                  if (e.target.value.length >= 2) {
                    handleQuickSearch(e.target.value);
                  }
                }}
                style={{ width: '100%' }}
                prefix={<SearchOutlined />}
                maxLength={100}
                enterButton="Search"
              />
              {quickSearchVisible && searchResults.length > 0 && (
                <div className="search-results">
                  <List
                    size="small"
                    dataSource={searchResults.slice(0, 10)}
                    renderItem={(item) => (
                      <List.Item 
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setActiveTab('documents');
                          setQuickSearchVisible(false);
                        }}
                      >
                        <List.Item.Meta
                          avatar={<FileTextOutlined style={{ color: '#1890ff' }} />}
                          title={item.title}
                          description={
                            <Space>
                              <Tag color={item.status === 'published' ? 'green' : 'blue'}>
                                {item.status}
                              </Tag>
                              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                                {item.module || 'General'}
                              </span>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Badge count={pendingTasks.length} offset={[-10, 10]}>
                <Button icon={<BellOutlined />}>Notifications</Button>
              </Badge>
              <Button icon={<ReloadOutlined />} onClick={loadDashboardData} loading={loading}>
                Refresh
              </Button>
              {canCreate && canUpload && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setUploadModalVisible(true)}
                >
                  New Document
                </Button>
              )}
              {(!canCreate || !canUpload) && (
                <Tooltip title="Upgrade your plan to create documents">
                  <Button disabled icon={<LockOutlined />}>
                    Upgrade Required
                  </Button>
                </Tooltip>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  // ============================================================
  // 🔥🔥🔥 RENDER UPLOAD MODAL 🔥🔥🔥
  // ============================================================
  const renderUploadModal = () => {
    if (!canUpload) {
      return null;
    }
    
    return (
      <Modal
        title={
          <Space>
            <CloudUploadOutlined style={{ color: '#722ed1' }} />
            <Text strong>Upload Document</Text>
          </Space>
        }
        open={uploadModalVisible}
        onCancel={() => {
          DEBUG.log('Upload modal cancelled', null, 'info');
          setUploadModalVisible(false);
          form.resetFields();
          setSelectedFile(null);
          setFileList([]);
        }}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpload}
          initialValues={{ 
            document_type: 'general', 
            module: 'general', 
            priority: 'medium',
            title: '',
            description: ''
          }}
        >
          <Form.Item
            name="title"
            label="Document Title *"
            rules={[
              { required: true, message: 'Please enter a title' },
              { min: 3, message: 'Title must be at least 3 characters' },
              { max: 255, message: 'Title must be less than 255 characters' }
            ]}
          >
            <Input 
              placeholder="Enter document title" 
              onChange={() => DEBUG.log('Title changed', form.getFieldValue('title'), 'info')}
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea 
              rows={3} 
              placeholder="Enter description" 
              maxLength={2000}
              onChange={() => DEBUG.log('Description changed', form.getFieldValue('description'), 'info')}
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="document_type"
                label="Document Type *"
                rules={[{ required: true, message: 'Please select a document type' }]}
              >
                <Select 
                  placeholder="Select document type" 
                  showSearch 
                  optionFilterProp="children"
                  onChange={(value) => DEBUG.log('Document type selected', value, 'info')}
                >
                  {DOCUMENT_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        {type.icon}
                        {type.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="module"
                label="Module *"
                rules={[{ required: true, message: 'Please select a module' }]}
              >
                <Select 
                  placeholder="Select module" 
                  showSearch 
                  optionFilterProp="children"
                  onChange={(value) => DEBUG.log('Module selected', value, 'info')}
                >
                  {MODULES.map(module => (
                    <Option key={module.value} value={module.value}>
                      <Space>
                        {module.icon}
                        {module.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item name="category" label="Category">
                <Select 
                  placeholder="Select category" 
                  allowClear 
                  showSearch 
                  optionFilterProp="children"
                  onChange={(value) => DEBUG.log('Category selected', value, 'info')}
                >
                  {CATEGORIES.map(cat => (
                    <Option key={cat.value} value={cat.value}>
                      {cat.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority">
                <Select 
                  placeholder="Select priority"
                  onChange={(value) => DEBUG.log('Priority selected', value, 'info')}
                >
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="tags" 
            label="Tags" 
            extra="Separate tags with commas"
          >
            <Input 
              placeholder="e.g. compliance, 2024, q1"
              onChange={() => DEBUG.log('Tags changed', form.getFieldValue('tags'), 'info')}
            />
          </Form.Item>

          <Form.Item 
            label="File *" 
            required
            rules={[{ required: true, message: 'Please select a file' }]}
          >
            <Upload.Dragger
              ref={uploadRef}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.ppt,.pptx"
              fileList={fileList}
              onChange={({ fileList: newFileList, file }) => {
                DEBUG.log('📎 Upload onChange triggered', { 
                  newFileListLength: newFileList.length,
                  file: file ? {
                    name: file.name,
                    status: file.status,
                    size: file.size,
                    type: file.type,
                    isFile: file instanceof File,
                    originFileObj: file.originFileObj ? {
                      name: file.originFileObj.name,
                      isFile: file.originFileObj instanceof File
                    } : null
                  } : null
                }, 'file');
                
                setFileList(newFileList);
                
                let actualFile = null;
                
                if (file?.originFileObj instanceof File) {
                  actualFile = file.originFileObj;
                  DEBUG.log('  - Got file from originFileObj', actualFile.name, 'success');
                } else if (file instanceof File) {
                  actualFile = file;
                  DEBUG.log('  - Got file directly', actualFile.name, 'success');
                } else if (newFileList.length > 0) {
                  const lastFile = newFileList[newFileList.length - 1];
                  if (lastFile?.originFileObj instanceof File) {
                    actualFile = lastFile.originFileObj;
                    DEBUG.log('  - Got file from lastFile.originFileObj', actualFile.name, 'success');
                  } else if (lastFile instanceof File) {
                    actualFile = lastFile;
                    DEBUG.log('  - Got file from lastFile directly', actualFile.name, 'success');
                  }
                }
                
                if (actualFile) {
                  DEBUG.log('  - Setting selectedFile to', actualFile.name, 'success');
                  setSelectedFile(actualFile);
                  setUploadDebugInfo(prev => ({
                    ...prev,
                    lastFileSelected: {
                      name: actualFile.name,
                      size: actualFile.size,
                      type: actualFile.type,
                      isFile: actualFile instanceof File,
                      timestamp: new Date().toISOString(),
                      source: 'onChange'
                    }
                  }));
                } else {
                  if (newFileList.length === 0) {
                    DEBUG.log('  - Clearing selectedFile (no files left)', null, 'info');
                    setSelectedFile(null);
                  } else {
                    DEBUG.log('  - ⚠️ Could not extract file from upload event', null, 'warning');
                  }
                }
                
                return false;
              }}
              beforeUpload={(file) => {
                DEBUG.log('📎 Upload beforeUpload triggered', {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  isFile: file instanceof File
                }, 'file');
                
                if (file instanceof File) {
                  DEBUG.log('  - Setting selectedFile from beforeUpload', file.name, 'success');
                  setSelectedFile(file);
                  const newFileList = [{
                    uid: Date.now().toString(),
                    name: file.name,
                    status: 'done',
                    size: file.size,
                    type: file.type,
                    originFileObj: file,
                    lastModified: file.lastModified
                  }];
                  setFileList(newFileList);
                  setUploadDebugInfo(prev => ({
                    ...prev,
                    lastFileSelected: {
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      isFile: file instanceof File,
                      timestamp: new Date().toISOString(),
                      source: 'beforeUpload'
                    }
                  }));
                } else {
                  DEBUG.log('  - ⚠️ beforeUpload did not receive a File object', typeof file, 'warning');
                }
                
                return false;
              }}
              onRemove={() => {
                DEBUG.log('📎 Upload onRemove triggered', null, 'info');
                setSelectedFile(null);
                setFileList([]);
                setUploadDebugInfo(prev => ({
                  ...prev,
                  lastFileRemoved: {
                    timestamp: new Date().toISOString()
                  }
                }));
              }}
              multiple={false}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Click or drag file to upload</p>
              <p className="ant-upload-hint">Support: PDF, Word, Excel, PowerPoint, Images, Text</p>
            </Upload.Dragger>
            
            {selectedFile && (
              <div style={{ 
                marginTop: 8, 
                padding: 8, 
                background: '#f6ffed', 
                border: '1px solid #b7eb8f',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Space>
                  <FileTextOutlined style={{ color: '#52c41a' }} />
                  <Text strong>{selectedFile.name}</Text>
                  <Tag color="green">{(selectedFile.size / 1024).toFixed(1)} KB</Tag>
                  {selectedFile.type && <Tag>{selectedFile.type}</Tag>}
                  <Tag color={selectedFile instanceof File ? 'success' : 'warning'}>
                    {selectedFile instanceof File ? '✅ File Object' : '⚠️ Not a File'}
                  </Tag>
                </Space>
                <Button 
                  type="text" 
                  danger 
                  size="small"
                  onClick={() => {
                    DEBUG.log('📎 Manual file removal', null, 'info');
                    setSelectedFile(null);
                    setFileList([]);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => {
                  setUploadModalVisible(false);
                  form.resetFields();
                  setSelectedFile(null);
                  setFileList([]);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={uploading}
                disabled={!selectedFile}
                icon={<CloudUploadOutlined />}
              >
                Upload
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  console.log('%c📄 RENDERING DocumentManagementPage', 'color: purple; font-weight: bold; font-size: 14px');
  console.log('  - canCreate:', canCreate);
  console.log('  - canUpload:', canUpload);
  console.log('  - permissions:', permissions);
  console.log('  - isSuperAdmin:', isSuperAdmin);
  console.log('  - userPlan:', userPlan);
  
  return (
    <Layout className="document-management-page">
      <Content style={{ padding: '24px', minHeight: '100vh' }}>
        
        {/* ============================================================
            HEADER
            ============================================================ */}
        <div className="page-header">
          <div className="header-left">
            <FileTextOutlined style={{ fontSize: 28, color: '#4fc3f7' }} />
            <Title level={2} style={{ margin: 0 }}>Document Management</Title>
            <Badge status="processing" text="Live" />
            <Tag color={isUserSuperAdmin() ? 'gold' : 'blue'}>
              {isUserSuperAdmin() ? 'Super Admin' : userPlan.toUpperCase()}
            </Tag>
            {!canCreate && (
              <Tag color="orange" icon={<WarningOutlined />}>
                Upgrade Required
              </Tag>
            )}
          </div>
          <div className="header-right">
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadDashboardData}
                loading={loading}
              >
                Refresh
              </Button>
              {canCreate && canUpload && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setUploadModalVisible(true)}
                >
                  New Document
                </Button>
              )}
              {(!canCreate || !canUpload) && (
                <Tooltip title="Upgrade your plan to create documents">
                  <Button disabled icon={<LockOutlined />}>
                    Upgrade Required
                  </Button>
                </Tooltip>
              )}
            </Space>
          </div>
        </div>

        {/* ============================================================
            STATS
            ============================================================ */}
        {renderStats()}

        {/* ============================================================
            QUICK ACTIONS
            ============================================================ */}
        {renderQuickActions()}

        {/* ============================================================
            TABS
            ============================================================ */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="document-tabs"
          tabBarExtraContent={
            <Space>
              <Badge count={pendingTasks.length} offset={[-10, 10]}>
                <Button icon={<BellOutlined />} />
              </Badge>
              <Button icon={<FilterOutlined />} />
            </Space>
          }
        >
          <TabPane 
            tab={<span><DashboardOutlined /> Dashboard</span>} 
            key="dashboard"
          >
            <DocumentDashboard companyId={companyId} />
          </TabPane>

          <TabPane 
            tab={<span><FileTextOutlined /> Documents</span>} 
            key="documents"
          >
            <DocumentControl 
              companyId={companyId}
              onDocumentChange={loadDashboardData}
              showStats={false}
              showHeader={false}
              userPlan={userPlan}
              isSuperAdmin={isSuperAdmin}
              permissions={permissions}
              canCreate={canCreate}
              canUpload={canUpload}
            />
          </TabPane>

          <TabPane 
            tab={<span><CalendarOutlined /> Review</span>} 
            key="review"
          >
            <DocumentReview 
              companyId={companyId}
              onReviewUpdate={loadDashboardData}
            />
          </TabPane>

          <TabPane 
            tab={<span><AuditOutlined /> Audit Trail</span>} 
            key="audit"
          >
            <DocumentAudit 
              companyId={companyId}
              onExport={() => message.success('Export started')}
            />
          </TabPane>

          <TabPane 
            tab={<span><SafetyCertificateOutlined /> Compliance</span>} 
            key="compliance"
          >
            <ComplianceFramework 
              companyId={companyId}
              onUpdate={loadDashboardData}
            />
          </TabPane>

          <TabPane 
            tab={<span><WarningOutlined /> Incidents</span>} 
            key="incidents"
          >
            <IncidentLinking 
              companyId={companyId}
              onUpdate={loadDashboardData}
            />
          </TabPane>

          <TabPane 
            tab={<span><SafetyOutlined /> SDS</span>} 
            key="sds"
          >
            <SDSManagement 
              companyId={companyId}
              onUpdate={loadDashboardData}
            />
          </TabPane>

          <TabPane 
            tab={<span><FileTextOutlined /> PTW</span>} 
            key="ptw"
          >
            <PTWIntegration 
              companyId={companyId}
              onUpdate={loadDashboardData}
            />
          </TabPane>

          <TabPane 
            tab={<span><RobotOutlined /> AI Classify</span>} 
            key="ai"
          >
            <AIClassification 
              embedded={true}
              onApply={(result) => {
                message.success('Classification applied to document');
                loadDashboardData();
              }}
            />
          </TabPane>

          <TabPane 
            tab={<span><ScanOutlined /> OCR</span>} 
            key="ocr"
          >
            <OCRProcessor 
              embedded={true}
              onComplete={(result) => {
                message.success(`OCR complete: ${result?.word_count || 0} words extracted`);
                loadDashboardData();
              }}
            />
          </TabPane>

          <TabPane 
            tab={<span><CalendarOutlined /> Expiry</span>} 
            key="expiry"
          >
            <ExpirationDashboard 
              companyId={companyId}
              embedded={true}
            />
          </TabPane>

          <TabPane 
            tab={<span><DiffOutlined /> Compare</span>} 
            key="compare"
          >
            <DocumentCompare 
              documents={documents}
              embedded={true}
            />
          </TabPane>

          <TabPane 
            tab={<span><BarChartOutlined /> Analytics</span>} 
            key="analytics"
          >
            <DocumentAnalytics 
              companyId={companyId}
              embedded={true}
              timeRange="30d"
            />
          </TabPane>

          <TabPane 
            tab={<span><SafetyCertificateOutlined /> Approvals</span>} 
            key="approvals"
          >
            <ApprovalChain 
              companyId={companyId}
              embedded={true}
              onUpdate={loadDashboardData}
            />
          </TabPane>

        </Tabs>

        {/* ============================================================
            UPLOAD MODAL
            ============================================================ */}
        {renderUploadModal()}
        
      </Content>
    </Layout>
  );
};

export default DocumentManagementPage;