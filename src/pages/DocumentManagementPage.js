// src/pages/DocumentManagementPage.jsx
// Full-page Document Management: two-line header with hover dropdowns (side drawer on phones)

import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Button, Space, Typography, Badge, Tag, Row, Col, Input, Modal, Form, Upload, message, Alert, Empty, Avatar, Select, Dropdown, Drawer
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
  HomeOutlined as HomeIcon
} from '@ant-design/icons';

// ============================================================
// EXISTING COMPONENTS
// ============================================================
import DocumentControl from '../components/DocumentControl';
import DocumentReview from '../components/documents/DocumentReview';
import { RequiredReading, ControlledCopies, ChangeRequests } from '../components/documents/DocControlPlus';
import DocumentAudit from '../components/documents/DocumentAudit';
import DocumentDashboard from '../components/documents/DocumentDashboard';
import DocumentAnalytics from '../components/documents/DocumentAnalytics';
import ComplianceFramework from '../components/documents/ComplianceFramework';
import IncidentLinking from '../components/documents/IncidentLinking';
import SDSManagement from '../components/documents/SDSManagement';
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

// ✅ STEP 5: Import the standalone editor + drafts panel
import DocumentEditor from '../components/documents/DocumentEditor';
import RecentDraftsPanel from '../components/documents/RecentDraftsPanel';

import documentService from '../services/documentService';
import { useAuth } from '../context/AuthContext';
import SubmissionsCenter from '../components/submissions/SubmissionsCenter';
import PermitCenter from '../components/permits/PermitCenter';
import ClientsManager from '../components/submissions/ClientsManager';
import { SigningProfile } from '../components/submissions/SigningTools';
import HoverNav, { NavList } from '../components/nav/HoverNav';
import './DocumentManagementPage.css';

const { Title, Text } = Typography;
const { Option } = Select;

// ============================================================
// DOCUMENT TYPES
// ============================================================
// roles that may assign reading and see everyone's progress (mirrors INC_STAFF_ROLES / OV_COMPANY_TYPES on the server)
const DOC_STAFF = new Set(['admin', 'administrator', 'company_admin', 'super_admin', 'platform_owner', 'safety_officer', 'safety_manager', 'hse_manager',
  'manager', 'investigator', 'safety_director', 'compliance_manager', 'operations_manager', 'supervisor', 'safetypro', 'safety_pro']);

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
// SECTIONS (header dropdowns on desktop, side drawer on phones)
// ============================================================
const NAV_GROUPS = [
  {
    key: 'g-docs', label: 'Documents', icon: <FolderOpenOutlined />, items: [
      { key: 'documents', label: 'All documents', hint: 'Find, open and manage files', icon: <FileTextOutlined /> },
      { key: 'dashboard', label: 'Dashboard', hint: 'Status and activity', icon: <DashboardOutlined /> },
      { key: 'editor-new', label: 'New document', hint: 'Write in the editor', icon: <EditOutlined /> },
      { key: 'editor-recent', label: 'Recent drafts', hint: 'Continue where you stopped', icon: <HistoryOutlined /> },
      { key: 'search-advanced', label: 'Advanced search', hint: 'Search with filters', icon: <SearchOutlined /> },
      { key: 'compare', label: 'Compare', hint: 'See what changed', icon: <DiffOutlined /> },
      { key: 'bundles', label: 'Bundles', hint: 'Group files together', icon: <FolderOpenOutlined /> },
      { key: 'expiry', label: 'Expiry tracking', hint: 'What needs renewal', icon: <CalendarOutlined /> }
    ]
  },
  {
    key: 'g-sign', label: 'Review & sign', icon: <EditOutlined />, items: [
      { key: 'submissions', label: 'Approvals inbox', hint: 'Waiting for you, and tracking', icon: <InboxOutlined /> },
      { key: 'approved-docs', label: 'Approved documents', hint: 'Signed and stamped files', icon: <CheckCircleOutlined /> },
      { key: 'reading', label: 'Required reading', hint: 'Read, quiz and acknowledge', icon: <BookOutlined /> },
      { key: 'change-requests', label: 'Change requests', hint: 'Ask for a document to change', icon: <DiffOutlined /> },
      { key: 'controlled-copies', label: 'Controlled copies & QR', hint: 'Numbered prints, QR labels', icon: <FileProtectOutlined /> },
      { key: 'approvals', label: 'Approval chain', hint: 'Steps and approvers', icon: <SafetyCertificateOutlined /> },
      { key: 'review', label: 'Periodic review', hint: 'Review dates', icon: <CalendarOutlined /> },
      { key: 'workflow-builder', label: 'Workflow builder', hint: 'Design approval steps', icon: <ApartmentOutlined /> },
      { key: 'clients', label: 'Clients', hint: 'Reviewers outside the company', icon: <TeamOutlined /> },
      { key: 'signing-profile', label: 'My signature & stamp', hint: 'Set up once, use anywhere', icon: <ProfileOutlined /> }
    ]
  },
  {
    key: 'g-hse', label: 'Safety', icon: <SafetyOutlined />, items: [
      { key: 'ptw', label: 'Permits to work', hint: 'Create, approve and close', icon: <FileProtectOutlined /> },
      { key: 'incidents', label: 'Incident links', hint: 'Connect documents to incidents', icon: <WarningOutlined /> },
      { key: 'sds', label: 'Safety data sheets', hint: 'Chemicals on site', icon: <ExperimentOutlined /> }
    ]
  },
  {
    key: 'g-comp', label: 'Compliance', icon: <AuditOutlined />, items: [
      { key: 'compliance', label: 'Frameworks', hint: 'Standards and gaps', icon: <SafetyCertificateOutlined /> },
      { key: 'compliance-reports', label: 'Compliance reports', hint: 'Build and export', icon: <FileTextOutlined /> },
      { key: 'quality-management', label: 'Quality management', hint: 'QMS records', icon: <CheckCircleOutlined /> },
      { key: 'retention', label: 'Retention', hint: 'How long to keep files', icon: <ClockCircleOutlined /> },
      { key: 'audit', label: 'Audit trail', hint: 'Who did what, and when', icon: <AuditOutlined /> }
    ]
  },
  {
    key: 'g-sec', label: 'Security', icon: <LockOutlined />, items: [
      { key: 'access-control', label: 'Access control', hint: 'Who can open a document', icon: <KeyOutlined /> },
      { key: 'watermarking', label: 'Watermarks', hint: 'Mark copies', icon: <FileProtectOutlined /> },
      { key: 'anomaly', label: 'Unusual activity', hint: 'Check odd access', icon: <SecurityScanOutlined /> }
    ]
  },
  {
    key: 'g-ai', label: 'AI tools', icon: <RobotOutlined />, items: [
      { key: 'assistant', label: 'AI assistant', hint: 'Ask about a document', icon: <MessageOutlined /> },
      { key: 'ai', label: 'Classify', hint: 'Suggest type and tags', icon: <RobotOutlined /> },
      { key: 'ocr', label: 'Read scans (OCR)', hint: 'Turn images into text', icon: <ScanOutlined /> },
      { key: 'smart-intake', label: 'Smart intake', hint: 'Sort many files', icon: <ThunderboltOutlined /> }
    ]
  },
  {
    key: 'g-rep', label: 'Reports', icon: <BarChartOutlined />, items: [
      { key: 'analytics', label: 'Analytics', hint: 'Use and activity', icon: <BarChartOutlined /> },
      { key: 'bi', label: 'Business intelligence', hint: 'Deeper charts', icon: <FundOutlined /> },
      { key: 'predictive', label: 'Forecasts', hint: 'Trends from your records', icon: <ExperimentOutlined /> },
      { key: 'report-builder', label: 'Report builder', hint: 'Choose fields and layout', icon: <EditOutlined /> }
    ]
  },
  {
    key: 'g-share', label: 'Share', icon: <LinkOutlined />, items: [
      { key: 'collaborate', label: 'Edit together', hint: 'Work on one file at once', icon: <TeamOutlined /> },
      { key: 'share', label: 'Share portal', hint: 'Send a controlled link', icon: <LinkOutlined /> },
      { key: 'offline', label: 'Offline files', hint: 'Use without internet', icon: <CloudOutlined /> },
      { key: 'integrations', label: 'Integrations', hint: 'Connect other systems', icon: <ApiOutlined /> }
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [find, setFind] = useState('');
  const [findOpen, setFindOpen] = useState(false);
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
  // ✅ STEP 5: URL sync — tab + doc (deep link support)
  // ============================================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    const docFromUrl = params.get('doc');

    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    if (docFromUrl) {
      const parsed = Number(docFromUrl);
      setSelectedDocumentId(isNaN(parsed) ? docFromUrl : parsed);
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
    setMenuOpen(false);
    setActiveTab(key);
    history.push(`/document-management?tab=${key}`);
  };

  // ✅ STEP 5: Include doc id in URL when navigating to features
  const handleNavigateToFeature = useCallback((featureKey, docId) => {
    if (docId) setSelectedDocumentId(docId);
    setActiveTab(featureKey);
    const qs = docId
      ? `/document-management?tab=${featureKey}&doc=${docId}`
      : `/document-management?tab=${featureKey}`;
    history.push(qs);
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
      file: fileToUpload,
      editing_source: 'regular'      // ✅ STEP 6: uploads are regular docs
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
  // RENDER: HEADER (line 1: page and actions, line 2: sections)
  // ============================================================
  const activeGroup = NAV_GROUPS.find((g) => g.items.some((t) => t.key === activeTab));
  const activeItem = activeGroup?.items.find((t) => t.key === activeTab);

  const term = find.trim().toLowerCase();
  const found = term.length < 2 ? [] : [
    ...NAV_GROUPS.flatMap((g) => g.items.map((t) => ({ ...t, group: g.label }))).filter((t) => `${t.label} ${t.hint}`.toLowerCase().includes(term))
      .map((t) => ({ key: `t-${t.key}`, icon: t.icon, label: t.label, hint: t.group, open: () => handleMenuClick({ key: t.key }) })).slice(0, 4),
    ...documents.filter((d) => `${d.title || ''} ${d.document_number || ''}`.toLowerCase().includes(term))
      .map((d) => ({ key: `d-${d.id}`, icon: <FileTextOutlined />, label: d.title, hint: [d.document_number, d.status].filter(Boolean).join(', ') || 'Document', open: () => handleNavigateToFeature('editor-new', d.id) })).slice(0, 6)
  ];

  const renderHeader = () => (
    <header className="dm-head">
      <div className="dm-line1">
        <button type="button" className="dm-icon dm-burger" aria-label="Open document menu" onClick={() => setMenuOpen(true)}><MenuUnfoldOutlined /></button>
        <button type="button" className="dm-icon dm-back" aria-label="Back to main dashboard" title="Back to main dashboard" onClick={handleBackToMain}><ArrowLeftOutlined /></button>
        <span className="dm-logo" aria-hidden="true">{activeItem?.icon || <FolderOpenOutlined />}</span>
        <div className="dm-title">
          <span>Document management{activeGroup ? ` / ${activeGroup.label}` : ''}</span>
          <h1>{activeItem?.label || 'Documents'}</h1>
        </div>
        <form
          className="dm-find"
          role="search"
          onSubmit={(e) => { e.preventDefault(); setFindOpen(true); }}
          onFocus={() => setFindOpen(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFindOpen(false); }}
        >
          <SearchOutlined />
          <input value={find} onChange={(e) => { setFind(e.target.value); setFindOpen(true); }} onKeyDown={(e) => { if (e.key === 'Escape') setFindOpen(false); }} placeholder="Find a document or a tool" aria-label="Find a document or a tool" />
          {findOpen && find.trim().length > 1 && (
            <div className="dm-found">
              {found.map((f) => <button key={f.key} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setFindOpen(false); setFind(''); f.open(); }}>{f.icon}<span>{f.label}<small>{f.hint}</small></span></button>)}
              {!found.length && <p>Nothing found. <button type="button" className="dm-more" onMouseDown={(e) => e.preventDefault()} onClick={() => { setFindOpen(false); handleMenuClick({ key: 'search-advanced' }); }}>Use advanced search</button></p>}
            </div>
          )}
        </form>
        <div className="dm-actions">
          <span className="dm-plan">{isUserSuperAdmin() ? 'Super admin' : (userPlan || 'free')}</span>
          <button type="button" className="dm-icon" aria-label={`Approvals waiting: ${pendingTasks.length}`} title="Approvals inbox" onClick={() => handleMenuClick({ key: 'submissions' })}>
            <Badge count={pendingTasks.length} size="small"><BellOutlined style={{ fontSize: 18 }} /></Badge>
          </button>
          <button type="button" className="dm-icon" aria-label="Refresh" title="Refresh" disabled={loading} onClick={loadDashboardData}><ReloadOutlined spin={loading} /></button>
          {canCreate && canUpload && activeTab !== 'documents' && (
            <button type="button" className="dm-new" onClick={() => setUploadModalVisible(true)}><PlusOutlined /><span>Upload</span></button>
          )}
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
            placement="bottomRight"
          >
            <button type="button" className="dm-icon" aria-label="Account menu"><Avatar size={32} icon={<UserOutlined />} src={user?.avatar} /></button>
          </Dropdown>
        </div>
      </div>
      <div className="dm-line2">
        <HoverNav groups={NAV_GROUPS} active={activeTab} onSelect={handleMenuClick} label="Document sections" />
      </div>
    </header>
  );

  const renderPhoneMenu = () => (
    <Drawer title="Documents" placement="left" open={menuOpen} onClose={() => setMenuOpen(false)} width={300} rootClassName="hn-drawer">
      <NavList groups={NAV_GROUPS} active={activeTab} onSelect={handleMenuClick} label="Document sections" />
      <Button block icon={<ArrowLeftOutlined />} onClick={handleBackToMain} style={{ marginTop: 14, height: 44 }}>Back to main app</Button>
    </Drawer>
  );

  // ============================================================
  // RENDER: SELECTED DOCUMENT BANNER
  // ✅ STEP 5: includes 'editor-new' so the sidebar editor shows which doc is loaded
  // ============================================================
  const renderSelectedDocumentBanner = () => {
    const documentSpecificTabs = [
      'access-control', 'retention', 'watermarking',
      'compliance-reports', 'incidents', 'collaborate',
      'share', 'assistant',
      'editor-new'                       // ✅ STEP 5
    ];

    if (!documentSpecificTabs.includes(activeTab) || !selectedDocument) return null;

    return (
      <Alert
        message={
          <Space wrap>
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
                history.replace(`/document-management?tab=${activeTab}`);
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
  // ✅ STEP 5: added 'editor-new' and 'editor-recent' cases
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

      // ========================================================
      // ✅ STEP 5: EDITING — standalone sidebar editor
      // ========================================================
      case 'editor-new':
        return (
          <DocumentEditor
            key={selectedDocumentId || 'new'}
            documentId={selectedDocumentId || null}
            initialContent="<p></p>"
            editingSource="sidebar"
            onSave={(result) => {
              const newId = result?.document?.id || result?.id;
              message.success(
                selectedDocumentId ? 'Draft saved' : 'Draft created'
              );
              if (!selectedDocumentId && newId) {
                setSelectedDocumentId(newId);
                history.replace(
                  `/document-management?tab=editor-new&doc=${newId}`
                );
              }
              loadDashboardData();
            }}
            onDocumentUpdate={() => loadDashboardData()}
            onCancel={() => {
              setSelectedDocumentId(null);
              setActiveTab('editor-recent');
              history.push('/document-management?tab=editor-recent');
            }}
            companyId={companyId}
            currentUser={user}
            userRole={userPlan}
            embedded={true}
          />
        );

      case 'editor-recent':
        return (
          <RecentDraftsPanel
            companyId={companyId}
            onOpenDocument={(doc) => {
              setSelectedDocumentId(doc.id);
              setActiveTab('editor-new');
              history.push(
                `/document-management?tab=editor-new&doc=${doc.id}`
              );
            }}
            onCreateNew={() => {
              setSelectedDocumentId(null);
              setActiveTab('editor-new');
              history.push('/document-management?tab=editor-new');
            }}
          />
        );

      // WORKFLOW
      case 'submissions':
        return <SubmissionsCenter key="sub-inbox" defaultTab="inbox" />;
      case 'approved-docs':
        return <SubmissionsCenter key="sub-approved" defaultTab="approved" />;
      case 'clients':
        return <ClientsManager />;
      case 'signing-profile':
        return <SigningProfile user={user} />;
      case 'review':
        return <DocumentReview companyId={companyId} onReviewUpdate={loadDashboardData} />;
      case 'reading':
        return <RequiredReading documents={documents} canManage={DOC_STAFF.has(String(user?.user_type || '').toLowerCase()) || DOC_STAFF.has(String(user?.role || '').toLowerCase().replace(/ /g, '_'))}
          onOpenDocument={(id) => handleNavigateToFeature('editor-new', id)} />;
      case 'change-requests':
        return <ChangeRequests documents={documents} />;
      case 'controlled-copies':
        return <ControlledCopies documents={documents} />;
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
        // Standard international permit types, risk assessments and approval cycle
        return <PermitCenter />;

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
    <dl className="dm-stats">
      {[['Total', stats.total], ['Drafts', stats.draft], ['In review', stats.review], ['Approved', stats.approved], ['Published', stats.published], ['Archived', stats.archived]].map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{value || 0}</dd></div>
      ))}
    </dl>
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
  // MAIN RENDER
  // ============================================================
  return (
  <div className="dm">
    {renderHeader()}
    {renderPhoneMenu()}
    <main className="dm-body">
      {['documents', 'dashboard'].includes(activeTab) && renderStats()}
      {renderSelectedDocumentBanner()}
      <div className="dm-panel">
        {renderTabContent(activeTab)}
      </div>
      {renderUploadModal()}
    </main>
  </div>
);
};

export default DocumentManagementPage;
