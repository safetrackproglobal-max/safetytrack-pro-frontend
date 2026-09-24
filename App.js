// src/App.js - Complete with Full-Page Route Override + All Document Management Components

console.log('🔴 App component is rendering');

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, useLocation } from 'react-router-dom';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';
import MainLayout from './Layouts/MainLayout';
import DashboardLayout from './Layouts/DashboardLayout';
import { NotificationProvider } from './context/NotificationContext';
import NotificationBell from './components/NotificationBell';
import ToastNotifications from './components/ToastNotifications';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminProvider } from './context/AdminContext';
import ProtectedRoute from './components/ProtectedRoute';
import { syncLanguage } from './services/languageSync';
import ResponsiveWrapper from './components/ResponsiveWrapper';

// Import the HSE Industry API Service
import hseIndustryService from './services/hseIndustryService';
import AIService from './services/GeneralAIService';
import notificationService from './services/notificationService';

// ✅ ADD NEW COMPONENTS
import ApprovalActions from './pages/ApprovalActions';
import StatsOverview from './pages/StatsOverview';
import PaymentWaitingPage from './pages/PaymentWaitingPage';
import SafetyProDashboard from './pages/safetyproDashboard';
import PerformanceDashboard from './pages/PerformanceDashboard';

// ✅ ADD COMPANY SETUP AND RESUME REGISTRATION
import CompanySetup from './pages/CompanySetup';
import ResumeRegistration from './pages/ResumeRegistration';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminSignupPage from './pages/AdminSignupPage';
import EmployeeLogin from './pages/EmployeeLogin';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import TermsPolicy from './components/TermsPolicy';
import ContactBrandInfo from './components/ContactBrandInfo';
import ContactTeamPage from './pages/ContactTeamPage';

// Dashboard Pages - Role Based
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard';
import UserDashboard from './pages/Dashboard/UserDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import DashboardPage from './pages/DashboardPage';
import OccupationalHealthPage from './pages/Dashboard/OccupationalHealthPage';

// User Profile & Settings
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// ✅ ADD ENVIRONMENTAL AI SERVICE IMPORT
import environmentalAIService from './services/environmentalAIService';

// Risk Assessment
import RiskAssessmentPage from './pages/RiskAssessmentPage';
import EnvironmentalCameraMonitoringPage from './pages/EnvironmentalCameraMonitoringPage';

// AI Services
import AIServiceTab from './components/AI/AIServiceTab';
import AIServicesPage from './pages/AIServicesPage';
import MedicalNERPage from './pages/AIServices/MedicalNERPage';
import SymptomAnalysisPage from './pages/AIServices/SymptomAnalysisPage';
import DiseasePredictionPage from './pages/AIServices/DiseasePredictionPage';
import LabAnalysisPage from './pages/AIServices/LabAnalysisPage';
import RiskAssessmentAIPage from './pages/AIServices/RiskAssessmentAIPage';
import SafetyDocumentAnalysisPage from './pages/AIServices/SafetyDocumentAnalysisPage';
import VideoAnalysisPage from './pages/AIServices/VideoAnalysisPage';
import EnvironmentalAnalysisPage from './pages/AIServices/EnvironmentalAnalysisPage';
import AIMedicalAnalysisTab from './pages/AIMedicalAnalysisTab';

// Industry-specific API services
import aviationApiService from './services/aviationApiService';
import chemicalApiService from './services/chemicalApiService';
import constructionApiService from './services/constructionApiService';
import generalIndustryApiService from './services/generalIndustryApiService';
import healthcareSafetyService from './services/healthcareSafetyService';
import maritimeSafetyService from './services/maritimeSafetyService';
import miningSafetyService from './services/miningSafetyService';
import oilGasSafetyService from './services/oilGasSafetyService';

// Module Management Pages
import HospitalManagement from './pages/Modules/HospitalManagement';
import HSEManagement from './pages/Modules/HSEManagement';
import EnvironmentalManagement from './pages/Modules/EnvironmentalManagement';
import QualityManagement from './pages/Modules/QualityManagement';
import SupplyChainManagement from './pages/Modules/SupplyChainManagement';

// NEW: Industry-Specific HSE Pages
import IndustryHSEDashboard from './pages/Modules/IndustryHSEDashboard';
import OilGasSafety from './pages/Modules/Industries/OilGasSafety';
import ConstructionSafety from './pages/Modules/Industries/ConstructionSafety';
import HealthcareSafety from './pages/Modules/Industries/HealthcareSafety';
import MiningSafety from './pages/Modules/Industries/MiningSafety';
import ChemicalSafety from './pages/Modules/Industries/ChemicalSafety';
import AviationSafety from './pages/Modules/Industries/AviationSafety';
import MaritimeSafety from './pages/Modules/Industries/MaritimeSafety';
import GeneralIndustry from './pages/Modules/Industries/GeneralIndustry';
import UpgradeModal from './components/UpgradeModal';

// ✅ KEPT: Valid imports
import HSEManagementPage from './pages/HSEManagementPage';
import IncidentPage from './pages/IncidentPage';
import MonitoringPage from './pages/MonitoringPage';
import PredictivePage from './pages/PredictivePage';

// ============================================================
// ✅ SAFETY FEATURE COMPONENT IMPORTS
// ============================================================
import SafetyObservations from './components/compliance/SafetyObservations';
import LessonsLearned from './components/compliance/LessonsLearned';

import FishboneDiagram from './components/incident/FishboneDiagram';
import AIInvestigationAssistant from './components/incident/AIInvestigationAssistant';
import IncidentTimeline from './components/incident/IncidentTimeline';
import EditIncidentModal from './components/incident/EditIncidentModal';
import CorrectiveActionTracker from './components/incident/CorrectiveActionTracker';
import IncidentComments from './components/incident/IncidentComments';
import InvestigationAssignment from './components/incident/InvestigationAssignment';
import WitnessStatementForm from './components/incident/WitnessStatementForm';
import AuditTrailViewer from './components/incident/AuditTrailViewer';

import PredictiveAnalyticsDashboard from './components/analytics/PredictiveAnalyticsDashboard';
import SimilarIncidentDetection from './components/analytics/SimilarIncidentDetection';
import CostAnalysisModule from './components/analytics/CostAnalysisModule';

import RegulatoryReporting from './components/compliance/RegulatoryReporting';
import EscalationMatrix from './components/compliance/EscalationMatrix';

// ============================================================
// ✅ SAFETY DASHBOARD PAGES (Lazy)
// ============================================================
const SafetyDashboardPage = React.lazy(() => import('./pages/safety/SafetyDashboardPage').catch(() => ({ default: () => <div>Loading...</div> })));
const SafetyObservationsPage = React.lazy(() => import('./pages/safety/SafetyObservationsPage').catch(() => ({ default: () => <div>Loading...</div> })));
const LessonsLearnedPage = React.lazy(() => import('./pages/safety/LessonsLearnedPage').catch(() => ({ default: () => <div>Loading...</div> })));
const PredictiveAnalyticsPage = React.lazy(() => import('./pages/safety/PredictiveAnalyticsPage').catch(() => ({ default: () => <div>Loading...</div> })));
const CostAnalysisPage = React.lazy(() => import('./pages/safety/CostAnalysisPage').catch(() => ({ default: () => <div>Loading...</div> })));
const RegulatoryCompliancePage = React.lazy(() => import('./pages/safety/RegulatoryCompliancePage').catch(() => ({ default: () => <div>Loading...</div> })));
const EscalationManagementPage = React.lazy(() => import('./pages/safety/EscalationManagementPage').catch(() => ({ default: () => <div>Loading...</div> })));
const InvestigationWorkspacePage = React.lazy(() => import('./pages/safety/InvestigationWorkspacePage').catch(() => ({ default: () => <div>Loading...</div> })));

// Existing Protected Routes
import SubscriptionPage from './pages/SubscriptionPage';
import AIDocumentsPage from './pages/AIDocumentsPage';
import NotificationsPage from './pages/NotificationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TeamManagementPage from './pages/TeamManagementPage';
import IntegrationsPage from './pages/IntegrationsPage';
import AdminPage from './pages/AdminPage';
import TemplatesPage from './pages/TemplatesPage';
import EditorPage from './pages/EditorPage';
import WorkflowPage from './pages/WorkflowPage';
import ReferralPage from './pages/ReferralPage';
import ReportsPage from './pages/ReportsPage';
import ProjectUploadPage from './pages/ProjectUploadPage';
import ComplianceCenterPage from './pages/ComplianceCenterPage';
import SupplyChainPage from './pages/SupplyChainPage';
import TemplateMarketplacePage from './pages/TemplateMarketplacePage';
import CameraMonitoringPage from './pages/CameraMonitoringPage';

// ============================================================
// DOCUMENT MANAGEMENT IMPORTS
// ============================================================
import DocumentControl from './components/DocumentControl';
import DocumentManagementPage from './pages/DocumentManagementPage';
import AccessControl from './components/documents/AccessControl';
import RetentionPolicy from './components/documents/RetentionPolicy';
import Watermarking from './components/documents/Watermarking';
import WorkflowBuilder from './components/documents/WorkflowBuilder';
import ComplianceReports from './components/documents/ComplianceReports';
import DocumentBundles from './components/documents/DocumentBundles';
import SharePortal from './components/documents/SharePortal';
import SmartIntake from './components/documents/SmartIntake';
import AdvancedSearch from './components/documents/AdvancedSearch';
import DocumentAssistant from './components/documents/DocumentAssistant';
import DocumentBI from './components/documents/DocumentBI';
import AnomalyDetection from './components/documents/AnomalyDetection';
import CustomReportBuilder from './components/documents/CustomReportBuilder';
import PredictiveAnalytics from './components/documents/PredictiveAnalytics';
import QualityManagementSystem from './components/documents/QualityManagement';
import OfflineManager from './components/documents/OfflineManager';
import IntegrationHub from './components/documents/IntegrationHub';
import RealtimeCollaborativeEditor from './components/editor/RealtimeCollaborativeEditor';
import DocumentReview from './components/documents/DocumentReview';
import DocumentAudit from './components/documents/DocumentAudit';
import DocumentIntegration from './components/documents/DocumentIntegration';
import DocumentSearch from './components/documents/DocumentSearch';
import DocumentBulk from './components/documents/DocumentBulk';
import DocumentAnalytics from './components/documents/DocumentAnalytics';
import DocumentEditor from './components/documents/DocumentEditor';
import DocumentSignature from './components/documents/DocumentSignature';
import DocumentDashboard from './components/documents/DocumentDashboard';
import DocumentCompare from './components/documents/DocumentCompare';
import TemplateLibrary from './components/documents/TemplateLibrary';
import IncidentLinking from './components/documents/IncidentLinking';
import SDSManagement from './components/documents/SDSManagement';
import PTWIntegration from './components/documents/PTWIntegration';
import AIClassification from './components/documents/AIClassification';
import OCRProcessor from './components/documents/OCRProcessor';
import ExpirationDashboard from './components/documents/ExpirationDashboard';
import ApprovalChain from './components/documents/ApprovalChain';
import ComplianceFramework from './components/documents/ComplianceFramework';

// ============================================================
// ✅ NEW: PDF EDITOR IMPORTS (Ribbon + PDF Viewer + Panels)
// ============================================================
import EditorRibbon from './components/editor/EditorRibbon';
import PDFEditor from './components/editor/PDFEditor';
import PageThumbnailPanel from './components/documents/PageThumbnailPanel';
import PDFFormPanel from './components/documents/PDFFormPanel';
import PDFSignaturePlacer from './components/documents/PDFSignaturePlacer';
import './components/editor/EditorRibbon.css';

// AI Components
import RiskAssessment from './components/AI/RiskAssessment';
import SafetyDocumentAnalyzer from './components/AI/SafetyDocumentAnalyzer';
import VideoSafetyAnalysis from './components/AI/VideoSafetyAnalysis';
import EnvironmentalDataAnalysis from './components/AI/EnvironmentalDataAnalysis';
import DiseasePrediction from './components/AI/DiseasePrediction';
import SymptomAnalyzer from './components/AI/SymptomAnalyzer';
import LabResultAnalyzer from './components/AI/LabResultAnalyzer';
import MedicalTextAnalysis from './components/AI/MedicalTextAnalysis';
import AIChatAssistant from './components/AI/AIChatAssistant';
import AIAnalysis from './components/AI/AIAnalysis';
import VideoAI from './components/AI/VideoAi';

import './styles/main.css';
import './pages/safetyproDashboard.css';
import './pages/PerformanceDashboard.css';
import './App.css';

// ============================================================
// ✅ FULL-PAGE ROUTES
// These routes bypass the global DashboardLayout
// They render their OWN header + sidebar
// ============================================================
const FULL_PAGE_ROUTES = [
  '/document-management',
  '/investigation-workspace',
  '/documents/pdf-editor',        // ✅ NEW: Standalone PDF editor
  '/documents/editor-ribbon',     // ✅ NEW: Standalone ribbon editor
  // Add more routes here as needed for future full-page workspaces
];

// ============================================================
// Wrapper components for different layouts
// ============================================================
const MainLayoutWrapper = ({ children }) => (
  <MainLayout>
    {children}
  </MainLayout>
);

// ============================================================
// ✅ SMART DashboardLayoutWrapper
// Detects full-page routes and bypasses the global layout
// ============================================================
const DashboardLayoutWrapper = ({ children }) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isFullPageRoute = FULL_PAGE_ROUTES.some(route =>
    location.pathname.startsWith(route)
  );

  console.log('🔍 [Layout] Path:', location.pathname, '| Full-page?', isFullPageRoute);

  if (isFullPageRoute) {
    return <>{children}</>;
  }

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <DashboardLayout
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={handleToggleSidebar}
    >
      {children}
    </DashboardLayout>
  );
};

// Export the API services for use in components
export {
  aviationApiService,
  chemicalApiService,
  constructionApiService,
  generalIndustryApiService,
  healthcareSafetyService,
  maritimeSafetyService,
  miningSafetyService,
  oilGasSafetyService,
  environmentalAIService,
  hseIndustryService,
  AIService,
  notificationService
};

// ============================================
// ✅ SMART DASHBOARD REDIRECT
// ============================================
const SmartDashboardRedirect = () => {
  const { user } = useAuth();

  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userData = user || localUser;

  const stage = userData?.stage || localStorage.getItem('userStage') || 'complete';
  const requiresPayment = userData?.requires_payment || localStorage.getItem('requires_payment') === 'true';
  const requiresPlanSelection = userData?.requires_plan_selection || localStorage.getItem('requires_plan_selection') === 'true';
  const needsApproval = userData?.needs_approval || localStorage.getItem('requires_approval') === 'true';
  const requiresCompanySetup = userData?.requires_company_setup || localStorage.getItem('requires_company_setup') === 'true';
  const requiresVerification = userData?.requires_verification || localStorage.getItem('requires_verification') === 'true';

  console.log('🔍 SmartDashboardRedirect:', {
    stage,
    requiresPayment,
    requiresPlanSelection,
    needsApproval,
    requiresCompanySetup,
    requiresVerification,
    userType: userData?.user_type,
    email: userData?.email
  });

  if (requiresVerification || (userData && !userData.verified)) {
    console.log('📧 Requires verification → /verify-email');
    return <Redirect to="/verify-email" />;
  }

  if (stage === 'needs_plan' || requiresPlanSelection) {
    console.log('📋 needs_plan → /select-plan');
    return <Redirect to="/select-plan" />;
  }

  if (stage === 'needs_payment' || requiresPayment) {
    console.log('💳 needs_payment → /payment');
    return <Redirect to="/payment" />;
  }

  if (stage === 'needs_approval' || needsApproval) {
    console.log('⏳ needs_approval → /pending-approval');
    return <Redirect to="/pending-approval" />;
  }

  if (stage === 'needs_company_setup' || requiresCompanySetup) {
    console.log('🏢 needs_company_setup → /company-setup');
    return <Redirect to="/company-setup" />;
  }

  if (stage === 'complete') {
    const actualRole = userData?.role || localUser?.role;
    const actualUserType = userData?.user_type || localUser?.user_type;
    const email = userData?.email || localUser?.email;

    const isSuperAdmin =
      email === 'abigalisticstudious@gmail.com' ||
      actualUserType === 'super_admin' ||
      actualUserType === 'platform_owner' ||
      actualRole === 'super_admin' ||
      actualRole === 'Super Admin' ||
      actualRole === 'Platform Admin' ||
      localStorage.getItem('is_super_admin') === 'true';

    if (isSuperAdmin) {
      console.log('👑 Super Admin → /safetypro/dashboard');
      return <Redirect to="/safetypro/dashboard" />;
    }

    if (actualUserType === 'safetypro' || actualUserType === 'safety_pro') {
      console.log('🛡️ Safety Pro → /safetypro/dashboard');
      return <Redirect to="/safetypro/dashboard" />;
    }

    if (actualUserType === 'admin' || actualUserType === 'company_admin') {
      console.log('👤 Admin → /admin/dashboard');
      return <Redirect to="/admin/dashboard" />;
    }

    if (actualUserType === 'employee' || actualUserType === 'staff') {
      console.log('👤 Employee → /employee/dashboard');
      return <Redirect to="/employee/dashboard" />;
    }

    console.log('👤 User → /user/dashboard');
    return <Redirect to="/user/dashboard" />;
  }

  console.log('⚠️ Fallback → /user/dashboard');
  return <Redirect to="/user/dashboard" />;
};

// ============================================================
// AppContent
// ============================================================
const AppContent = () => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLanguage = async () => {
      try {
        await syncLanguage();
      } catch (error) {
        console.error('Failed to sync language:', error);
      } finally {
        setLoading(false);
      }
    };
    initLanguage();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router basename="/safetrack-pro-web">
      <NotificationProvider>

        <ToastNotifications />

        <UpgradeModal />

        <Switch>
          {/* ============================================ */}
          {/* PUBLIC ROUTES */}
          {/* ============================================ */}
          <Route path="/" exact>
            <MainLayoutWrapper>
              <HomePage />
            </MainLayoutWrapper>
          </Route>

          <Route path="/home" exact>
            <Redirect to="/" />
          </Route>

          <Route path="/features">
            <MainLayoutWrapper>
              <FeaturesPage />
            </MainLayoutWrapper>
          </Route>

          <Route path="/pricing">
            <MainLayoutWrapper>
              <PricingPage />
            </MainLayoutWrapper>
          </Route>

          <Route path="/login">
            <MainLayoutWrapper>
              <LoginPage />
            </MainLayoutWrapper>
          </Route>

          <Route path="/signup">
            <MainLayoutWrapper>
              <SignupPage />
            </MainLayoutWrapper>
          </Route>

          <Route path="/admin-signup">
            <MainLayoutWrapper>
              <AdminSignupPage />
            </MainLayoutWrapper>
          </Route>

          <Route path="/employee-login">
            <MainLayoutWrapper>
              <EmployeeLogin />
            </MainLayoutWrapper>
          </Route>

          <Route path="/reset-password">
            <MainLayoutWrapper>
              <ResetPasswordPage />
            </MainLayoutWrapper>
          </Route>

          <Route path="/terms">
            <MainLayoutWrapper>
              <TermsPolicy />
            </MainLayoutWrapper>
          </Route>

          <Route path="/privacy">
            <MainLayoutWrapper>
              <TermsPolicy />
            </MainLayoutWrapper>
          </Route>

          <Route path="/contact">
            <MainLayoutWrapper>
              <ContactBrandInfo />
            </MainLayoutWrapper>
          </Route>

          <Route path="/contact-team">
            <MainLayoutWrapper>
              <ContactTeamPage />
            </MainLayoutWrapper>
          </Route>

          <Route path="/resume-registration">
            <MainLayoutWrapper>
              <ResumeRegistration />
            </MainLayoutWrapper>
          </Route>

          {/* ============================================ */}
          {/* DASHBOARD REDIRECT */}
          {/* ============================================ */}
          <ProtectedRoute path="/dashboard" exact>
            <SmartDashboardRedirect />
          </ProtectedRoute>

          <ProtectedRoute path="/company-setup" exact>
            <MainLayoutWrapper>
              <CompanySetup />
            </MainLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/payment-waiting">
            <MainLayoutWrapper>
              <PaymentWaitingPage />
            </MainLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/select-plan" exact>
            <MainLayoutWrapper>
              <PricingPage />
            </MainLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/plan-selection" exact>
            <MainLayoutWrapper>
              <PricingPage />
            </MainLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/payment" exact>
            <MainLayoutWrapper>
              <SubscriptionPage />
            </MainLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* SAFETY PRO DASHBOARD */}
          {/* ============================================ */}
          <ProtectedRoute path="/safetypro/dashboard">
            <DashboardLayoutWrapper>
              <SafetyProDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/safetypro/performance">
            <DashboardLayoutWrapper>
              <PerformanceDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* DIRECT DASHBOARDS */}
          {/* ============================================ */}
          <ProtectedRoute path="/employee/dashboard">
            <DashboardLayoutWrapper>
              <EmployeeDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/user/dashboard">
            <DashboardLayoutWrapper>
              <UserDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/dashboard">
            <DashboardLayoutWrapper>
              <AdminDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* PROFILE & SETTINGS */}
          {/* ============================================ */}
          <ProtectedRoute path="/profile" exact>
            <DashboardLayoutWrapper>
              <ProfilePage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/settings" exact>
            <DashboardLayoutWrapper>
              <SettingsPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/settings/:tab" exact>
            <DashboardLayoutWrapper>
              <SettingsPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* SAFETY FEATURES */}
          {/* ============================================ */}
          <ProtectedRoute path="/safety" exact>
            <DashboardLayoutWrapper>
              <SafetyDashboardPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/safety/observations" exact>
            <DashboardLayoutWrapper>
              <SafetyObservationsPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/safety/lessons-learned" exact>
            <DashboardLayoutWrapper>
              <LessonsLearnedPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/safety/predictive-analytics" exact>
            <DashboardLayoutWrapper>
              <PredictiveAnalyticsPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/safety/cost-analysis" exact>
            <DashboardLayoutWrapper>
              <CostAnalysisPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/safety/regulatory-compliance" exact>
            <DashboardLayoutWrapper>
              <RegulatoryCompliancePage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/safety/escalation-management" exact>
            <DashboardLayoutWrapper>
              <EscalationManagementPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/investigation-workspace/:incidentId?">
            <DashboardLayoutWrapper>
              <InvestigationWorkspacePage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* RISK ASSESSMENT */}
          {/* ============================================ */}
          <ProtectedRoute path="/risk-assessment" exact>
            <DashboardLayoutWrapper>
              <RiskAssessmentPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/risk-assessment/:id">
            <DashboardLayoutWrapper>
              <RiskAssessmentPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* AI SERVICES */}
          {/* ============================================ */}
          <ProtectedRoute path="/ai-services" exact>
            <DashboardLayoutWrapper>
              <AIServicesPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-services/medical-analysis">
            <DashboardLayoutWrapper>
              <AIMedicalAnalysisTab />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-services/video-ai">
            <DashboardLayoutWrapper>
              <VideoAI />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-services/medical-ner">
            <DashboardLayoutWrapper>
              <MedicalNERPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-services/symptom-analysis">
            <DashboardLayoutWrapper>
              <SymptomAnalysisPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-services/disease-prediction">
            <DashboardLayoutWrapper>
              <DiseasePredictionPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-services/lab-analysis">
            <DashboardLayoutWrapper>
              <LabAnalysisPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-services/risk-assessment">
            <DashboardLayoutWrapper>
              <RiskAssessmentAIPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-services/safety-documents">
            <DashboardLayoutWrapper>
              <SafetyDocumentAnalysisPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-services/video-analysis">
            <DashboardLayoutWrapper>
              <VideoAnalysisPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-services/environmental-analysis">
            <DashboardLayoutWrapper>
              <EnvironmentalAnalysisPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/camera-monitoring">
            <DashboardLayoutWrapper>
              <EnvironmentalCameraMonitoringPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-services/environmental-ai">
            <DashboardLayoutWrapper>
              <AIServiceTab />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/camera-monitoring">
            <DashboardLayoutWrapper>
              <CameraMonitoringPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================================ */}
          {/* DOCUMENT MANAGEMENT ROUTES */}
          {/* ============================================================ */}

          {/* Main Document Management Page */}
          <ProtectedRoute path="/document-management">
            <DashboardLayoutWrapper>
              <DocumentManagementPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ✅ NEW: Standalone PDF Editor (full-page, bypasses global layout) */}
          <ProtectedRoute path="/documents/pdf-editor/:documentId">
            <DashboardLayoutWrapper>
              <PDFEditor
                documentId={Number(window.location.pathname.split('/').filter(Boolean).pop())}
              />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ✅ NEW: Standalone Ribbon Editor (full-page) */}
          <ProtectedRoute path="/documents/editor-ribbon">
            <DashboardLayoutWrapper>
              <DocumentEditor />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ✅ NEW: Standalone Page Thumbnails (full-page) */}
          <ProtectedRoute path="/documents/page-thumbnails/:documentId">
            <DashboardLayoutWrapper>
              <PageThumbnailPanel
                documentId={Number(window.location.pathname.split('/').filter(Boolean).pop())}
              />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ✅ NEW: Standalone Form Filler (full-page) */}
          <ProtectedRoute path="/documents/form-filler/:documentId">
            <DashboardLayoutWrapper>
              <PDFFormPanel
                documentId={Number(window.location.pathname.split('/').filter(Boolean).pop())}
              />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ✅ NEW: Standalone Signature Placer (full-page) */}
          <ProtectedRoute path="/documents/signature-placer/:documentId">
            <DashboardLayoutWrapper>
              <PDFSignaturePlacer
                documentId={Number(window.location.pathname.split('/').filter(Boolean).pop())}
              />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* Document Control (Main component) */}
          <ProtectedRoute path="/documents" exact>
            <DashboardLayoutWrapper>
              <DocumentControl />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* ACCESS CONTROL */}
          {/* ============================================ */}
          <ProtectedRoute path="/documents/access-control/:documentId?">
            <DashboardLayoutWrapper>
              <AccessControl />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* RETENTION POLICY */}
          <ProtectedRoute path="/documents/retention/:documentId?">
            <DashboardLayoutWrapper>
              <RetentionPolicy />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* WATERMARKING */}
          <ProtectedRoute path="/documents/watermarking/:documentId?">
            <DashboardLayoutWrapper>
              <Watermarking />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* WORKFLOW BUILDER */}
          <ProtectedRoute path="/documents/workflow-builder/:workflowId?">
            <DashboardLayoutWrapper>
              <WorkflowBuilder />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* COMPLIANCE REPORTS */}
          <ProtectedRoute path="/documents/compliance-reports/:documentId?">
            <DashboardLayoutWrapper>
              <ComplianceReports />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT BUNDLES */}
          <ProtectedRoute path="/documents/bundles/:bundleId?">
            <DashboardLayoutWrapper>
              <DocumentBundles />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* SHARE PORTAL */}
          <ProtectedRoute path="/documents/share/:documentId?">
            <DashboardLayoutWrapper>
              <SharePortal />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* SMART INTAKE */}
          <ProtectedRoute path="/documents/smart-intake">
            <DashboardLayoutWrapper>
              <SmartIntake />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ADVANCED SEARCH */}
          <ProtectedRoute path="/documents/advanced-search">
            <DashboardLayoutWrapper>
              <AdvancedSearch />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT ASSISTANT */}
          <ProtectedRoute path="/documents/assistant/:documentId?">
            <DashboardLayoutWrapper>
              <DocumentAssistant />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* BUSINESS INTELLIGENCE */}
          <ProtectedRoute path="/documents/bi">
            <DashboardLayoutWrapper>
              <DocumentBI />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ANOMALY DETECTION */}
          <ProtectedRoute path="/documents/anomaly-detection">
            <DashboardLayoutWrapper>
              <AnomalyDetection />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* CUSTOM REPORT BUILDER */}
          <ProtectedRoute path="/documents/report-builder">
            <DashboardLayoutWrapper>
              <CustomReportBuilder />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* PREDICTIVE ANALYTICS */}
          <ProtectedRoute path="/documents/predictive-analytics">
            <DashboardLayoutWrapper>
              <PredictiveAnalytics />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* QUALITY MANAGEMENT */}
          <ProtectedRoute path="/documents/quality-management">
            <DashboardLayoutWrapper>
              <QualityManagementSystem />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* OFFLINE MANAGER */}
          <ProtectedRoute path="/documents/offline">
            <DashboardLayoutWrapper>
              <OfflineManager />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* INTEGRATION HUB */}
          <ProtectedRoute path="/documents/integrations">
            <DashboardLayoutWrapper>
              <IntegrationHub />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* REALTIME COLLABORATIVE EDITOR */}
          <ProtectedRoute path="/documents/collaborate/:documentId?">
            <DashboardLayoutWrapper>
              <RealtimeCollaborativeEditor />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT REVIEW */}
          <ProtectedRoute path="/documents/review">
            <DashboardLayoutWrapper>
              <DocumentReview />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT AUDIT */}
          <ProtectedRoute path="/documents/audit">
            <DashboardLayoutWrapper>
              <DocumentAudit />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT INTEGRATION */}
          <ProtectedRoute path="/documents/integration">
            <DashboardLayoutWrapper>
              <DocumentIntegration />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT SEARCH */}
          <ProtectedRoute path="/documents/search">
            <DashboardLayoutWrapper>
              <DocumentSearch />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT BULK */}
          <ProtectedRoute path="/documents/bulk">
            <DashboardLayoutWrapper>
              <DocumentBulk />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT ANALYTICS */}
          <ProtectedRoute path="/documents/analytics">
            <DashboardLayoutWrapper>
              <DocumentAnalytics />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT DASHBOARD */}
          <ProtectedRoute path="/documents/dashboard">
            <DashboardLayoutWrapper>
              <DocumentDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT COMPARE */}
          <ProtectedRoute path="/documents/compare">
            <DashboardLayoutWrapper>
              <DocumentCompare />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* TEMPLATE LIBRARY */}
          <ProtectedRoute path="/documents/templates">
            <DashboardLayoutWrapper>
              <TemplateLibrary />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT EDITOR (with :id) */}
          <ProtectedRoute path="/documents/edit/:id?">
            <DashboardLayoutWrapper>
              <DocumentEditor />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* DOCUMENT SIGNATURES */}
          <ProtectedRoute path="/documents/signatures/:id?">
            <DashboardLayoutWrapper>
              <DocumentSignature />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* INCIDENT LINKING */}
          <ProtectedRoute path="/documents/incidents/:documentId?">
            <DashboardLayoutWrapper>
              <IncidentLinking />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* SDS MANAGEMENT */}
          <ProtectedRoute path="/documents/sds">
            <DashboardLayoutWrapper>
              <SDSManagement />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* PTW INTEGRATION */}
          <ProtectedRoute path="/documents/ptw">
            <DashboardLayoutWrapper>
              <PTWIntegration />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* AI CLASSIFICATION */}
          <ProtectedRoute path="/documents/ai-classification">
            <DashboardLayoutWrapper>
              <AIClassification />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* OCR PROCESSOR */}
          <ProtectedRoute path="/documents/ocr">
            <DashboardLayoutWrapper>
              <OCRProcessor />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* EXPIRATION DASHBOARD */}
          <ProtectedRoute path="/documents/expiration">
            <DashboardLayoutWrapper>
              <ExpirationDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* APPROVAL CHAIN */}
          <ProtectedRoute path="/documents/approvals/:documentId?">
            <DashboardLayoutWrapper>
              <ApprovalChain />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* COMPLIANCE FRAMEWORK */}
          <ProtectedRoute path="/documents/compliance-framework/:documentId?">
            <DashboardLayoutWrapper>
              <ComplianceFramework />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* MODULE MANAGEMENT */}
          {/* ============================================ */}
          <ProtectedRoute path="/hospital-management">
            <DashboardLayoutWrapper>
              <HospitalManagement />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/hse-management">
            <DashboardLayoutWrapper>
              <HSEManagement />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/environmental-management">
            <DashboardLayoutWrapper>
              <EnvironmentalManagement />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/quality-management">
            <DashboardLayoutWrapper>
              <QualityManagement />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/supplychain-management">
            <DashboardLayoutWrapper>
              <SupplyChainManagement />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* HSE INDUSTRY TAB ROUTES */}
          {/* ============================================ */}
          <ProtectedRoute path="/hse-management" exact>
            <DashboardLayoutWrapper>
              <HSEManagement />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/modules/hse/industry/:industryId">
            <DashboardLayoutWrapper>
              <IndustryHSEDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/hse/industry/:industryId/:tab?">
            <DashboardLayoutWrapper>
              <IndustryHSEDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/hse/oil_gas/:tab?">
            <DashboardLayoutWrapper>
              <OilGasSafety />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <Route
            path="/hse/construction/:tab?"
            render={(props) => (
              <ProtectedRoute>
                <DashboardLayoutWrapper>
                  <ConstructionSafety {...props} />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            )}
          />

          <ProtectedRoute path="/hse/healthcare/:tab?">
            <DashboardLayoutWrapper>
              <HealthcareSafety />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/hse/mining/:tab?">
            <DashboardLayoutWrapper>
              <MiningSafety />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/hse/chemical/:tab?">
            <DashboardLayoutWrapper>
              <ChemicalSafety />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/hse/aviation/:tab?">
            <DashboardLayoutWrapper>
              <AviationSafety />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/hse/maritime/:tab?">
            <DashboardLayoutWrapper>
              <MaritimeSafety />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/hse/general/:tab?">
            <DashboardLayoutWrapper>
              <GeneralIndustry />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/hse" exact>
            <DashboardLayoutWrapper>
              <HSEManagementPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* LEGACY ROUTES */}
          {/* ============================================ */}
          <ProtectedRoute path="/incidents">
            <DashboardLayoutWrapper>
              <IncidentPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/monitoring">
            <DashboardLayoutWrapper>
              <MonitoringPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/predictive">
            <DashboardLayoutWrapper>
              <PredictivePage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* EXISTING PROTECTED ROUTES */}
          {/* ============================================ */}
          <ProtectedRoute path="/occupational-health">
            <DashboardLayoutWrapper>
              <OccupationalHealthPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/subscription">
            <DashboardLayoutWrapper>
              <SubscriptionPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/ai-documents">
            <DashboardLayoutWrapper>
              <AIDocumentsPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/notifications">
            <DashboardLayoutWrapper>
              <NotificationsPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/analytics">
            <DashboardLayoutWrapper>
              <AnalyticsPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/team">
            <DashboardLayoutWrapper>
              <TeamManagementPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/integrations">
            <DashboardLayoutWrapper>
              <IntegrationsPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/admin">
            <DashboardLayoutWrapper>
              <AdminPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/templates">
            <DashboardLayoutWrapper>
              <TemplatesPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/editor">
            <DashboardLayoutWrapper>
              <EditorPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/workflow">
            <DashboardLayoutWrapper>
              <WorkflowPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/referral">
            <DashboardLayoutWrapper>
              <ReferralPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/reports">
            <DashboardLayoutWrapper>
              <ReportsPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/project-upload">
            <DashboardLayoutWrapper>
              <ProjectUploadPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/compliance">
            <DashboardLayoutWrapper>
              <ComplianceCenterPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/supply-chain">
            <DashboardLayoutWrapper>
              <SupplyChainPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/template-marketplace">
            <DashboardLayoutWrapper>
              <TemplateMarketplacePage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/hse/incidents">
            <DashboardLayoutWrapper>
              <HSEManagementPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          <ProtectedRoute path="/hse/compliance">
            <DashboardLayoutWrapper>
              <HSEManagementPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* 404 FALLBACK */}
          {/* ============================================ */}
          <Route path="*">
            <MainLayoutWrapper>
              <div style={{ padding: '50px', textAlign: 'center' }}>
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <p>
                  <a href="/" style={{ color: '#1890ff', marginRight: '20px' }}>
                    Return to Home
                  </a>
                  <a href="/dashboard" style={{ color: '#1890ff' }}>
                    Go to Dashboard
                  </a>
                </p>
              </div>
              <UpgradeModal />
            </MainLayoutWrapper>
          </Route>
        </Switch>
      </NotificationProvider>
    </Router>
  );
};

// ============================================================
// App (root component)
// ============================================================
function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <LanguageProvider>
          <AdminProvider>
            <ResponsiveWrapper>
              <AppContent />
            </ResponsiveWrapper>
          </AdminProvider>
        </LanguageProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;