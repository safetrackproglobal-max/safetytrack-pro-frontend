// src/pages/DocumentManagementPage.jsx
// Full-page Document Management with its own header + grouped sidebar

import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Layout, Menu, Button, Space, Typography, Badge, Tag,
  Row, Col, Card, Statistic, Tooltip, Input, Modal,
  Form, Upload, message, Alert, Divider, Empty, Avatar, Select, 
  Dropdown, Breadcrumb, Menu as AntMenu
} from 'antd';
import {
  FileTextOutlined, PlusOutlined, SearchOutlined, ReloadOutlined,
  DashboardOutlined, SafetyOutlined, CalendarOutlined,
  WarningOutlined, CheckCircleOutlined, ClockCircleOutlined,
  FolderOutlined, EditOutlined, LockOutlined, BellOutlined,
  CloudUploadOutlined, RobotOutlined, ScanOutlined,
  BarChartOutlined, DiffOutlined, KeyOutlined, FileProtectOutlined,
  FolderOpenOutlined, LinkOutlined, ThunderboltOutlined,
  MessageOutlined, FundOutlined, SecurityScanOutlined,
  ExperimentOutlined, CloudOutlined, ApiOutlined, TeamOutlined,
  ApartmentOutlined, AuditOutlined,
  ArrowLeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloseOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  ProfileOutlined,
  HomeOutlined,
  StarFilled,
  InboxOutlined,
  SafetyCertificateOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  ShopOutlined,
  RocketOutlined,
  BookOutlined,
  HistoryOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  BuildOutlined,
  HomeOutlined as HomeIcon,
} from '@ant-design/icons';

// ============================================================
// EXISTING COMPONENTS
// ============================================================
import DocumentControl from '../components/DocumentControl';
import DocumentReview from '../components/documents/DocumentReview';
import DocumentAudit from '../components/documents/DocumentAudit';
import DocumentDashboard from '../components/documents/DocumentDashboard';
import DocumentAnalytics from '../components/documents/DocumentAnalytics';
import ComplianceFramework from '../components/documents/ComplianceFramework';
import IncidentLinking from '../components/documents/IncidentLinking';
import SDSManagement from '../components/documents/SDSManagement';
import PTWIntegration from '../components/documents/PTWIntegration';
import AIClassification from '../components/documents/AIClassification';
import OCRProcessor from '../components/documents/OCRProcessor';
import ExpirationDashboard from '../components/documents/ExpirationDashboard';
import DocumentCompare from '../components/documents/DocumentCompare';
import ApprovalChain from '../components/documents/ApprovalChain';

// ============================================================
// NEW COMPONENTS
// ============================================================
import AccessControl from '../components/documents/AccessControl';
import RetentionPolicy from '../components/documents/RetentionPolicy';
import Watermarking from '../components/documents/Watermarking';
import WorkflowBuilder from '../components/documents/WorkflowBuilder';
import ComplianceReports from '../components/documents/ComplianceReports';
import DocumentBundles from '../components/documents/DocumentBundles';
import SharePortal from '../components/documents/SharePortal';
import SmartIntake from '../components/documents/SmartIntake';
import AdvancedSearch from '../components/documents/AdvancedSearch';
import DocumentAssistant from '../components/documents/DocumentAssistant';
import DocumentBI from '../components/documents/DocumentBI';
import AnomalyDetection from '../components/documents/AnomalyDetection';
import CustomReportBuilder from '../components/documents/CustomReportBuilder';
import PredictiveAnalytics from '../components/documents/PredictiveAnalytics';
import QualityManagementSystem from '../components/documents/QualityManagement';
import OfflineManager from '../components/documents/OfflineManager';
import IntegrationHub from '../components/documents/IntegrationHub';
import RealtimeCollaborativeEditor from '../components/editor/RealtimeCollaborativeEditor';

import documentService from '../services/documentService';
import { useAuth } from '../context/AuthContext';
import './DocumentManagementPage.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// ============================================================
// DOCUMENT TYPES
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
  { value: 'mining', label: 'Mining', icon: <HomeIcon /> },
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
// PLAN-BASED PERMISSIONS
// ============================================================
const PLAN_PERMISSIONS = {
  free: { can_create: true, can_upload: true, can_view: true, can_edit: false, can_delete: false, can_share: false, can_version: false, can_approve: false, can_archive: false },
  basic: { can_create: true, can_upload: true, can_view: true, can_edit: true, can_delete: false, can_share: false, can_version: false, can_approve: false, can_archive: false },
  pro: { can_create: true, can_upload: true, can_view: true, can_edit: true, can_delete: true, can_share: true, can_version: true, can_approve: false, can_archive: false },
  business: { can_create: true, can_upload: true, can_view: true, can_edit: true, can_delete: true, can_share: true, can_version: true, can_approve: true, can_archive: false },
  enterprise: { can_create: true, can_upload: true, can_view: true, can_edit: true, can_delete: true, can_share: true, can_version: true, can_approve: true, can_archive: true },
  super_admin: { can_create: true, can_upload: true, can_view: true, can_edit: true, can_delete: true, can_share: true, can_version: true, can_approve: true, can_archive: true }
};

// ============================================================
// ✅ SIDEBAR MENU STRUCTURE — 10 GROUPS, 32 TABS
// ============================================================
const SIDEBAR_GROUPS = [
  {
    key: 'core',
    label: 'Core',
    emoji: '📊',
    color: '#1890ff',
    tabs: [
      { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
      { key: 'documents', label: 'Documents', icon: <FileTextOutlined /> }
    ]
  },
  {
    key: 'editing',
    label: 'Editing',
    emoji: '✍️',
    color: '#13c2c2',
    tabs: [
      { key: 'editor-new', label: 'New Document', icon: <EditOutlined /> },
      { key: 'editor-recent', label: 'Recent Drafts', icon: <HistoryOutlined /> }
    ]
  },
  {
    key: 'workflow',
    label: 'Workflow',
    emoji: '⚙️',
    color: '#722ed1',
    tabs: [
      { key: 'review', label: 'Review', icon: <CalendarOutlined /> },
      { key: 'approvals', label: 'Approvals', icon: <SafetyCertificateOutlined /> },
      { key: 'workflow-builder', label: 'Workflow Builder', icon: <ApartmentOutlined /> }
    ]
  },
  {
    key: 'security',
    label: 'Security',
    emoji: '🔒',
    color: '#f5222d',
    tabs: [
      { key: 'access-control', label: 'Access Control', icon: <KeyOutlined /> },
      { key: 'retention', label: 'Retention', icon: <ClockCircleOutlined /> },
      { key: 'watermarking', label: 'Watermarking', icon: <FileProtectOutlined /> },
      { key: 'anomaly', label: 'Anomaly Detection', icon: <SecurityScanOutlined /> }
    ]
  },
  {
    key: 'compliance',
    label: 'Compliance',
    emoji: '✅',
    color: '#52c41a',
    tabs: [
      { key: 'compliance', label: 'Compliance', icon: <SafetyCertificateOutlined /> },
      { key: 'compliance-reports', label: 'Compliance Reports', icon: <AuditOutlined /> },
      { key: 'quality-management', label: 'Quality Mgmt', icon: <CheckCircleOutlined /> },
      { key: 'audit', label: 'Audit Trail', icon: <AuditOutlined /> }
    ]
  },
  {
    key: 'hse',
    label: 'HSE',
    emoji: '🦺',
    color: '#faad14',
    tabs: [
      { key: 'incidents', label: 'Incidents', icon: <WarningOutlined /> },
      { key: 'sds', label: 'SDS Management', icon: <SafetyOutlined /> },
      { key: 'ptw', label: 'Permits to Work', icon: <FileTextOutlined /> }
    ]
  },
  {
    key: 'ai',
    label: 'AI & Automation',
    emoji: '🤖',
    color: '#13c2c2',
    tabs: [
      { key: 'ai', label: 'AI Classify', icon: <RobotOutlined /> },
      { key: 'ocr', label: 'OCR Processor', icon: <ScanOutlined /> },
      { key: 'assistant', label: 'AI Assistant', icon: <MessageOutlined /> },
      { key: 'smart-intake', label: 'Smart Intake', icon: <ThunderboltOutlined /> },
      { key: 'predictive', label: 'Predictive Analytics', icon: <ExperimentOutlined /> }
    ]
  },
  {
    key: 'analytics',
    label: 'Analytics',
    emoji: '📈',
    color: '#eb2f96',
    tabs: [
      { key: 'analytics', label: 'Analytics', icon: <BarChartOutlined /> },
      { key: 'bi', label: 'Business Intelligence', icon: <FundOutlined /> },
      { key: 'report-builder', label: 'Report Builder', icon: <EditOutlined /> }
    ]
  },
  {
    key: 'collaboration',
    label: 'Collaboration',
    emoji: '👥',
    color: '#2f54eb',
    tabs: [
      { key: 'collaborate', label: 'Real-Time Collaborate', icon: <TeamOutlined /> },
      { key: 'share', label: 'Share Portal', icon: <LinkOutlined /> }
    ]
  },
  {
    key: 'management',
    label: 'Management',
    emoji: '📁',
    color: '#fa8c16',
    tabs: [
      { key: 'bundles', label: 'Document Bundles', icon: <FolderOpenOutlined /> },
      { key: 'expiry', label: 'Expiry Tracking', icon: <CalendarOutlined /> },
      { key: 'compare', label: 'Document Compare', icon: <DiffOutlined /> },
      { key: 'search-advanced', label: 'Advanced Search', icon: <SearchOutlined /> }
    ]
  },
  {
    key: 'system',
    label: 'System',
    emoji: '🖥️',
    color: '#8c8c8c',
    tabs: [
      { key: 'offline', label: 'Offline Manager', icon: <CloudOutlined /> },
      { key: 'integrations', label: 'Integrations', icon: <ApiOutlined /> }
    ]
  }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentManagementPage = ({ 
  companyId = null,
  initialTab = 'documents'
}) => {
  const history = useHistory();
  const location = useLocation();
  const { user, planData, logout } = useAuth();

  // ============================================================
  // STATE
  // ============================================================
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState(['core']);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [form] = Form.useForm();
  
  const [stats, setStats] = useState({
    total: 0, draft: 0, review: 0, approved: 0,
    published: 0, archived: 0, overdue: 0
  });
  const [pendingTasks, setPendingTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [permissions, setPermissions] = useState({
    can_create: false, can_upload: false, can_view: false,
    can_edit: false, can_delete: false, can_share: false,
    can_version: false, can_approve: false, can_archive: false
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userPlan, setUserPlan] = useState('free');

  // ============================================================
  // PERMISSIONS
  // ============================================================
  const getUserPlan = useCallback(() => {
    const isSuperAdminCheck = user?.is_super_admin || user?.user_type === 'super_admin' || user?.role === 'super_admin';
    setIsSuperAdmin(isSuperAdminCheck);
    
    if (isSuperAdminCheck) return 'super_admin';
    
    let plan = 'free';
    if (planData?.effective_plan) plan = planData.effective_plan;
    else if (user?.subscription_plan) plan = user.subscription_plan;
    else if (user?.plan) plan = user.plan;
    
    const normalizedPlan = plan?.toLowerCase() || 'free';
    setUserPlan(normalizedPlan);
    return normalizedPlan;
  }, [user, planData]);

  const isUserSuperAdmin = useCallback(() => {
    return isSuperAdmin || user?.is_super_admin || user?.user_type === 'super_admin';
  }, [isSuperAdmin, user]);

  const getPermissionsForPlan = useCallback((plan) => {
    const planKey = plan?.toLowerCase() || 'free';
    if (planKey === 'super_admin') return PLAN_PERMISSIONS.super_admin;
    return PLAN_PERMISSIONS[planKey] || PLAN_PERMISSIONS.free;
  }, []);

  const canCreate = permissions.can_create || isUserSuperAdmin();
  const canUpload = permissions.can_upload || isUserSuperAdmin();

  // ============================================================
  // EFFECTS — Auto-open sidebar group for active tab + URL sync
  // ============================================================
  useEffect(() => {
    // Auto-expand the group containing the active tab
    const activeGroup = SIDEBAR_GROUPS.find(group =>
      group.tabs.some(tab => tab.key === activeTab)
    );
    if (activeGroup && !openKeys.includes(activeGroup.key)) {
      setOpenKeys(prev => [...prev, activeGroup.key]);
    }
  }, [activeTab]);

  useEffect(() => {
    // Restore active tab from URL on mount
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  // ============================================================
  // LOAD SELECTED DOCUMENT DETAILS
  // ============================================================
  const loadSelectedDocument = useCallback(async (docId) => {
    if (!docId) {
      setSelectedDocument(null);
      return;
    }
    try {
      const data = await documentService.getDocument(docId);
      setSelectedDocument(data);
    } catch (error) {
      console.error('Failed to load selected document:', error);
    }
  }, []);

  useEffect(() => {
    if (selectedDocumentId) loadSelectedDocument(selectedDocumentId);
  }, [selectedDocumentId, loadSelectedDocument]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleBackToMain = () => {
    const role = user?.user_type || user?.role || 'user';
    if (role === 'super_admin') history.push('/safetypro/dashboard');
    else if (role === 'admin' || role === 'company_admin') history.push('/admin/dashboard');
    else if (role === 'employee') history.push('/employee/dashboard');
    else history.push('/user/dashboard');
  };

  const handleMenuClick = ({ key }) => {
    setActiveTab(key);
    // Persist to URL for refresh safety
    history.push(`/document-management?tab=${key}`);
  };

  const handleNavigateToFeature = useCallback((featureKey, docId) => {
    if (docId) setSelectedDocumentId(docId);
    setActiveTab(featureKey);
    history.push(`/document-management?tab=${featureKey}`);
    message.success(`Opened ${featureKey}`);
  }, [history]);

  // ============================================================
  // DATA LOADING
  // ============================================================
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const plan = getUserPlan();
      
      let perms = null;
      try {
        const permsResponse = await documentService.getPermissions({ company_id: companyId });
        if (permsResponse && permsResponse.success) {
          perms = permsResponse.permissions || permsResponse;
        }
      } catch (err) {
        console.error('Permissions fetch error:', err);
      }
      
      if (perms) {
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
        setPermissions(getPermissionsForPlan(plan));
      }
      
      const [statsData, tasksData, docsData] = await Promise.all([
        documentService.getStats({ company_id: companyId }),
        documentService.getPendingTasks({ company_id: companyId }),
        documentService.getDocuments({ company_id: companyId, limit: 100 })
      ]);
      
      setStats(statsData || {});
      setPendingTasks(tasksData?.tasks || []);
      setDocuments(docsData?.documents || []);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [companyId, getUserPlan, getPermissionsForPlan]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ============================================================
  // SEARCH
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
  // UPLOAD HANDLER
  // ============================================================
  const handleUpload = useCallback(async (values) => {
    let fileToUpload = selectedFile;
    if (!fileToUpload && fileList.length > 0) {
      const f = fileList[0];
      fileToUpload = f?.originFileObj || (f instanceof File ? f : null);
    }
    
    if (!fileToUpload || !(fileToUpload instanceof File)) {
      message.warning('Please select a valid file');
      return;
    }
    
    const documentData = {
      title: values.title?.trim(),
      document_type: values.document_type,
      description: values.description?.trim() || '',
      category: values.category || '',
      module: values.module || 'general',
      priority: values.priority || 'medium',
      tags: values.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
      company_id: companyId || '',
      file: fileToUpload
    };
    
    setUploading(true);
    try {
      const response = await documentService.createDocument(documentData);
      if (response?.success) {
        message.success('Document uploaded successfully');
        setUploadModalVisible(false);
        form.resetFields();
        setSelectedFile(null);
        setFileList([]);
        loadDashboardData();
      } else {
        message.error(response?.error || 'Failed to upload');
      }
    } catch (error) {
      message.error(error.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  }, [selectedFile, fileList, companyId, form, loadDashboardData]);

  // ============================================================
  // RENDER: CUSTOM HEADER
  // ============================================================
  const renderCustomHeader = () => (
  <Header
    className="docmgmt-header"
    style={{
      background: 'white',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #f0f0f0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      overflow: 'hidden',
      gap: 16
    }}
  >
    {/* ============================================ */}
    {/* LEFT SIDE — Flex Grow + Prevent Wrap */}
    {/* ============================================ */}
    <Space 
      size="middle" 
      align="center" 
      style={{ 
        flex: '1 1 auto', 
        minWidth: 0,           // ✅ Critical for text ellipsis
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}
    >
      {/* Back Button */}
      <Tooltip title="Back to Main Dashboard">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToMain}
          style={{ fontSize: 16, flexShrink: 0 }}
        >
          Back
        </Button>
      </Tooltip>
      
      <Divider type="vertical" style={{ height: 24, margin: 0 }} />
      
      {/* Sidebar Toggle */}
      <Button
        type="text"
        icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{ fontSize: 16, flexShrink: 0 }}
      />

      <Divider type="vertical" style={{ height: 24, margin: 0 }} />

      {/* Title Section — Nowrap */}
      <Space 
        style={{ 
          whiteSpace: 'nowrap',
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        <FileTextOutlined 
          style={{ fontSize: 22, color: '#4fc3f7', flexShrink: 0 }} 
        />
        <Title 
          level={4} 
          style={{ 
            margin: 0,
            whiteSpace: 'nowrap',      // ✅ Prevents vertical wrap
            overflow: 'hidden',         // ✅ Clips if too long
            textOverflow: 'ellipsis',   // ✅ Shows "..." if too long
            maxWidth: 400               // ✅ Caps width
          }}
        >
          Document Management
        </Title>
        <Badge 
          status="processing" 
          text="Live" 
          style={{ flexShrink: 0 }} 
        />
      </Space>
    </Space>

    {/* ============================================ */}
    {/* RIGHT SIDE — Fixed Width */}
    {/* ============================================ */}
    <Space 
      size="middle" 
      style={{ 
        flexShrink: 0,        // ✅ Never shrinks
        whiteSpace: 'nowrap'
      }}
    >
      {/* Plan Badge */}
      <Tag 
        color={isUserSuperAdmin() ? 'gold' : 'blue'}
        style={{ margin: 0, flexShrink: 0 }}
      >
        {isUserSuperAdmin() ? '👑 Super Admin' : userPlan.toUpperCase()}
      </Tag>

      {/* Notifications */}
      <Tooltip title="Notifications">
        <Badge count={pendingTasks.length} offset={[-5, 5]}>
          <Button 
            type="text" 
            icon={<BellOutlined />} 
            style={{ flexShrink: 0 }}
          />
        </Badge>
      </Tooltip>

      {/* Refresh */}
      <Tooltip title="Refresh">
        <Button 
          type="text" 
          icon={<ReloadOutlined />} 
          onClick={loadDashboardData}
          loading={loading}
          style={{ flexShrink: 0 }}
        />
      </Tooltip>

      {/* New Document */}
      {canCreate && canUpload && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setUploadModalVisible(true)}
          style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          New Document
        </Button>
      )}

      <Divider type="vertical" style={{ height: 24, margin: 0 }} />

      {/* User Menu */}
      <Dropdown
        menu={{
          items: [
            { key: 'profile', icon: <ProfileOutlined />, label: 'My Profile', onClick: () => history.push('/profile') },
            { key: 'settings', icon: <SettingOutlined />, label: 'Settings', onClick: () => history.push('/settings') },
            { type: 'divider' },
            { key: 'back', icon: <HomeOutlined />, label: 'Back to Dashboard', onClick: handleBackToMain },
            { type: 'divider' },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: () => { logout(); history.push('/login'); } }
          ]
        }}
        trigger={['click']}
      >
        <Button 
          type="text" 
          style={{ flexShrink: 0, padding: 0 }}
        >
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            src={user?.avatar} 
          />
        </Button>
      </Dropdown>
    </Space>
  </Header>
);

  // ============================================================
  // RENDER: SIDEBAR
  // ============================================================
  const renderSidebar = () => (
  <Sider
    className="docmgmt-sider"
    width={280}
    collapsedWidth={64}
    collapsed={sidebarCollapsed}
    theme="light"
  >
    {/* Sidebar Header */}
    {!sidebarCollapsed && (
      <div className="sidebar-brand">
        <Space>
          <FolderOpenOutlined style={{ fontSize: 18 }} />
          <Text strong>WORKSPACE</Text>
        </Space>
      </div>
    )}

    {/* Grouped Menu */}
    <Menu
      className="docmgmt-menu"
      mode="inline"
      selectedKeys={[activeTab]}
      openKeys={sidebarCollapsed ? [] : openKeys}
      onOpenChange={setOpenKeys}
      onClick={handleMenuClick}
      items={SIDEBAR_GROUPS.map(group => ({
        key: group.key,
        label: (
          <span className="group-label">
            <span className="group-emoji">{group.emoji}</span>
            <span className="group-text">{group.label}</span>
            <Badge
              className="group-badge"
              count={group.tabs.length}
              style={{
                backgroundColor: `${group.color}22`,
                color: group.color
              }}
            />
          </span>
        ),
        children: group.tabs.map(tab => ({
          key: tab.key,
          icon: tab.icon,
          label: tab.label
        }))
      }))}
    />

    {/* Bottom Back Button */}
    {!sidebarCollapsed && (
      <div className="sidebar-footer">
        <Button
          block
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToMain}
        >
          Back to Main App
        </Button>
      </div>
    )}
  </Sider>
);
  // ============================================================
  // RENDER: BREADCRUMB
  // ============================================================
  const renderBreadcrumb = () => {
    const activeGroup = SIDEBAR_GROUPS.find(g =>
      g.tabs.some(t => t.key === activeTab)
    );
    const activeChild = activeGroup?.tabs.find(t => t.key === activeTab);

    return (
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: (
              <span style={{ cursor: 'pointer' }} onClick={handleBackToMain}>
                <HomeOutlined /> Dashboard
              </span>
            )
          },
          {
            title: (
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
                Document Management
              </span>
            )
          },
          {
            title: activeGroup ? `${activeGroup.emoji} ${activeGroup.label}` : ''
          },
          {
            title: activeChild?.label || activeTab
          }
        ]}
      />
    );
  };

  // ============================================================
  // RENDER: SELECTED DOCUMENT BANNER
  // ============================================================
  const renderSelectedDocumentBanner = () => {
    const documentSpecificTabs = [
      'access-control', 'retention', 'watermarking',
      'compliance-reports', 'incidents', 'collaborate',
      'share', 'assistant'
    ];
    
    if (!documentSpecificTabs.includes(activeTab) || !selectedDocument) return null;
    
    return (
      <Alert
        message={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>Working with document:</span>
            <Text strong>{selectedDocument.title}</Text>
            <Tag color="blue">{selectedDocument.module || 'General'}</Tag>
            <Button
              type="link"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => {
                setSelectedDocumentId(null);
                setSelectedDocument(null);
              }}
            >
              Clear
            </Button>
          </Space>
        }
        type="info"
        showIcon={false}
        style={{ marginBottom: 16 }}
      />
    );
  };

  // ============================================================
  // RENDER: TAB CONTENT
  // ============================================================
  const renderTabContent = (tabKey) => {
    switch (tabKey) {
      // CORE
      case 'dashboard':
        return <DocumentDashboard companyId={companyId} />;
      case 'documents':
        return (
          <DocumentControl 
            companyId={companyId}
            onDocumentChange={loadDashboardData}
            onDocumentSelect={(docId) => setSelectedDocumentId(docId)}
            onNavigateToFeature={handleNavigateToFeature}
            showStats={false}
            showHeader={false}
            userPlan={userPlan}
            isSuperAdmin={isSuperAdmin}
            permissions={permissions}
            canCreate={canCreate}
            canUpload={canUpload}
          />
        );

      // WORKFLOW
      case 'review':
        return <DocumentReview companyId={companyId} onReviewUpdate={loadDashboardData} />;
      case 'approvals':
        return <ApprovalChain companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;
      case 'workflow-builder':
        return <WorkflowBuilder companyId={companyId} embedded={true} onSave={() => { message.success('Workflow saved'); loadDashboardData(); }} />;

      // SECURITY
      case 'access-control':
        return <AccessControl documentId={selectedDocumentId} companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;
      case 'retention':
        return <RetentionPolicy documentId={selectedDocumentId} companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;
      case 'watermarking':
        return <Watermarking documentId={selectedDocumentId} companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;
      case 'anomaly':
        return <AnomalyDetection companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;

      // COMPLIANCE
      case 'compliance':
        return <ComplianceFramework companyId={companyId} onUpdate={loadDashboardData} />;
      case 'compliance-reports':
        return <ComplianceReports documentId={selectedDocumentId} companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;
      case 'quality-management':
        return <QualityManagementSystem companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;
      case 'audit':
        return <DocumentAudit companyId={companyId} onExport={() => message.success('Export started')} />;

      // HSE
      case 'incidents':
        return <IncidentLinking documentId={selectedDocumentId} companyId={companyId} onUpdate={loadDashboardData} />;
      case 'sds':
        return <SDSManagement companyId={companyId} onUpdate={loadDashboardData} />;
      case 'ptw':
        return <PTWIntegration companyId={companyId} onUpdate={loadDashboardData} />;

      // AI
      case 'ai':
        return <AIClassification embedded={true} onApply={() => { message.success('Classification applied'); loadDashboardData(); }} />;
      case 'ocr':
        return <OCRProcessor embedded={true} onComplete={(r) => { message.success(`OCR: ${r?.word_count || 0} words`); loadDashboardData(); }} />;
      case 'assistant':
        return <DocumentAssistant documentId={selectedDocumentId} companyId={companyId} embedded={true} onDocumentSelect={(docId) => setSelectedDocumentId(docId)} />;
      case 'smart-intake':
        return <SmartIntake companyId={companyId} embedded={true} onComplete={() => { message.success('Intake complete'); loadDashboardData(); }} />;
      case 'predictive':
        return <PredictiveAnalytics companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;

      // ANALYTICS
      case 'analytics':
        return <DocumentAnalytics companyId={companyId} embedded={true} timeRange="30d" />;
      case 'bi':
        return <DocumentBI companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;
      case 'report-builder':
        return <CustomReportBuilder companyId={companyId} embedded={true} onSave={() => message.success('Report saved')} />;

      // COLLABORATION
      case 'collaborate':
        return <RealtimeCollaborativeEditor documentId={selectedDocumentId} companyId={companyId} embedded={true} onSave={() => { message.success('Saved'); loadDashboardData(); }} />;
      case 'share':
        return <SharePortal documentId={selectedDocumentId} companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;

      // MANAGEMENT
      case 'bundles':
        return <DocumentBundles companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;
      case 'expiry':
        return <ExpirationDashboard companyId={companyId} embedded={true} />;
      case 'compare':
        return <DocumentCompare documents={documents} embedded={true} />;
      case 'search-advanced':
        return <AdvancedSearch companyId={companyId} embedded={true} onResultSelect={(doc) => { setSelectedDocumentId(doc.id); setActiveTab('documents'); }} />;

      // SYSTEM
      case 'offline':
        return <OfflineManager companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;
      case 'integrations':
        return <IntegrationHub companyId={companyId} embedded={true} onUpdate={loadDashboardData} />;

      default:
        return <Empty description={`Tab "${tabKey}" not configured`} />;
    }
  };

  // ============================================================
  // RENDER: STATS
  // ============================================================
  const renderStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card">
          <Statistic title="Total" value={stats.total || 0} prefix={<FileTextOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card">
          <Statistic title="Drafts" value={stats.draft || 0} prefix={<EditOutlined />} valueStyle={{ color: '#d9d9d9' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card">
          <Statistic title="In Review" value={stats.review || 0} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#1890ff' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card">
          <Statistic title="Approved" value={stats.approved || 0} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card">
          <Statistic title="Published" value={stats.published || 0} prefix={<SafetyCertificateOutlined />} valueStyle={{ color: '#1890ff' }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card">
          <Statistic title="Archived" value={stats.archived || 0} prefix={<FolderOutlined />} valueStyle={{ color: '#faad14' }} />
        </Card>
      </Col>
    </Row>
  );

  // ============================================================
  // RENDER: UPLOAD MODAL
  // ============================================================
  const renderUploadModal = () => (
    <Modal
      title={<Space><CloudUploadOutlined style={{ color: '#722ed1' }} /><Text strong>Upload Document</Text></Space>}
      open={uploadModalVisible}
      onCancel={() => {
        setUploadModalVisible(false);
        form.resetFields();
        setSelectedFile(null);
        setFileList([]);
      }}
      footer={null}
      width={650}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleUpload} initialValues={{ document_type: 'general', module: 'general', priority: 'medium' }}>
        <Form.Item name="title" label="Title *" rules={[{ required: true, message: 'Please enter a title' }]}>
          <Input placeholder="Enter document title" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Enter description" maxLength={2000} />
        </Form.Item>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name="document_type" label="Type *" rules={[{ required: true }]}>
              <Select placeholder="Select type">
                {DOCUMENT_TYPES.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="module" label="Module *" rules={[{ required: true }]}>
              <Select placeholder="Select module">
                {MODULES.map(m => <Option key={m.value} value={m.value}>{m.label}</Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name="category" label="Category">
              <Select placeholder="Select category" allowClear>
                {CATEGORIES.map(c => <Option key={c.value} value={c.value}>{c.label}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="priority" label="Priority">
              <Select placeholder="Select priority">
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
                <Option value="critical">Critical</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="tags" label="Tags" extra="Separate with commas">
          <Input placeholder="e.g. compliance, 2024, q1" />
        </Form.Item>
        <Form.Item label="File *" required>
          <Upload.Dragger
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt,.ppt,.pptx"
            fileList={fileList}
            onChange={({ fileList: newList, file }) => {
              setFileList(newList);
              let actualFile = file?.originFileObj || (file instanceof File ? file : null);
              if (!actualFile && newList.length > 0) {
                const last = newList[newList.length - 1];
                actualFile = last?.originFileObj || (last instanceof File ? last : null);
              }
              if (actualFile) setSelectedFile(actualFile);
              else if (newList.length === 0) setSelectedFile(null);
              return false;
            }}
            beforeUpload={(file) => {
              if (file instanceof File) {
                setSelectedFile(file);
                setFileList([{
                  uid: Date.now().toString(),
                  name: file.name,
                  status: 'done',
                  size: file.size,
                  type: file.type,
                  originFileObj: file
                }]);
              }
              return false;
            }}
            onRemove={() => { setSelectedFile(null); setFileList([]); }}
            multiple={false}
            maxCount={1}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Click or drag file to upload</p>
            <p className="ant-upload-hint">PDF, Word, Excel, PowerPoint, Images, Text</p>
          </Upload.Dragger>
          {selectedFile && (
            <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
              <Space>
                <FileTextOutlined style={{ color: '#52c41a' }} />
                <Text strong>{selectedFile.name}</Text>
                <Tag color="green">{(selectedFile.size / 1024).toFixed(1)} KB</Tag>
              </Space>
            </div>
          )}
        </Form.Item>
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => { setUploadModalVisible(false); form.resetFields(); setSelectedFile(null); setFileList([]); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={uploading} disabled={!selectedFile} icon={<CloudUploadOutlined />}>Upload</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER — FULL PAGE LAYOUT
  // ============================================================
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Custom Header */}
      {renderCustomHeader()}

      <Layout>
        {/* Custom Sidebar */}
        {renderSidebar()}

        {/* Main Content */}
        <Content style={{
          padding: 24,
          overflow: 'auto',
          height: 'calc(100vh - 64px)',
          background: '#f0f2f5'
        }}>
          {/* Breadcrumb */}
          {renderBreadcrumb()}

          {/* Stats — only on documents/dashboard */}
          {['documents', 'dashboard'].includes(activeTab) && renderStats()}

          {/* Selected Document Banner */}
          {renderSelectedDocumentBanner()}

          {/* Tab Content */}
          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 8,
            minHeight: 'calc(100vh - 280px)'
          }}>
            {renderTabContent(activeTab)}
          </div>

          {/* Upload Modal */}
          {renderUploadModal()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DocumentManagementPage;
