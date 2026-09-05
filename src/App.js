// src/App.js - Fixed with proper ResponsiveWrapper + Complete Document Management

console.log('🔴 App component is rendering');

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
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
// ✅ Import ResponsiveWrapper
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
// ✅ DOCUMENT MANAGEMENT IMPORTS (ALL NEW COMPONENTS)
// ============================================================

// Main Document Control
import DocumentControl from './components/DocumentControl';

// Document Management Page (Full Integration)
import DocumentManagementPage from './pages/DocumentManagementPage';

// Individual Document Components (if needed separately)
import DocumentReview from './components/documents/DocumentReview';
import DocumentAudit from './components/documents/DocumentAudit';
import DocumentIntegration from './components/documents/DocumentIntegration';
import DocumentSearch from './components/documents/DocumentSearch';
import DocumentBulk from './components/documents/DocumentBulk';
import DocumentAnalytics from './components/documents/DocumentAnalytics';
import DocumentEditor from './components/documents/DocumentEditor';
import DocumentSignature from './components/documents/DocumentSignature';

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

// Wrapper components for different layouts
const MainLayoutWrapper = ({ children }) => (
  <MainLayout>
    {children}
  </MainLayout>
);

// ✅ UPDATED: DashboardLayoutWrapper with sidebar state support
const DashboardLayoutWrapper = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
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

// Export the API service for use in components
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
// ✅ SMART DASHBOARD REDIRECT - Handles Stage and Role
// ============================================
const SmartDashboardRedirect = () => {
  const { user } = useAuth();
  
  // Get user from localStorage for cross-checking
  const localUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userData = user || localUser;
  
  // ✅ Get stage from user data or localStorage
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
  
  // ✅ Check verification first
  if (requiresVerification || (userData && !userData.verified)) {
    console.log('📧 Requires verification → Redirect to /verify-email');
    return <Redirect to="/verify-email" />;
  }
  
  // ✅ CRITICAL: Check STAGE first - these take priority over role
  if (stage === 'needs_plan' || requiresPlanSelection) {
    console.log('📋 needs_plan → Redirect to /select-plan');
    return <Redirect to="/select-plan" />;
  }
  
  if (stage === 'needs_payment' || requiresPayment) {
    console.log('💳 needs_payment → Redirect to /payment');
    return <Redirect to="/payment" />;
  }
  
  if (stage === 'needs_approval' || needsApproval) {
    console.log('⏳ needs_approval → Redirect to /pending-approval');
    return <Redirect to="/pending-approval" />;
  }
  
  if (stage === 'needs_company_setup' || requiresCompanySetup) {
    console.log('🏢 needs_company_setup → Redirect to /company-setup');
    return <Redirect to="/company-setup" />;
  }
  
  // ✅ If stage is 'complete', check user type for role-based routing
  if (stage === 'complete') {
    const actualRole = userData?.role || localUser?.role;
    const actualUserType = userData?.user_type || localUser?.user_type;
    const email = userData?.email || localUser?.email;
    
    // ✅ Super Admin Check
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
    
    // ✅ Safety Pro Check
    if (actualUserType === 'safetypro' || actualUserType === 'safety_pro') {
      console.log('🛡️ Safety Pro → /safetypro/dashboard');
      return <Redirect to="/safetypro/dashboard" />;
    }
    
    // ✅ Admin Check
    if (actualUserType === 'admin' || actualUserType === 'company_admin') {
      console.log('👤 Admin → /admin/dashboard');
      return <Redirect to="/admin/dashboard" />;
    }
    
    // ✅ Employee Check
    if (actualUserType === 'employee' || actualUserType === 'staff') {
      console.log('👤 Employee → /employee/dashboard');
      return <Redirect to="/employee/dashboard" />;
    }
    
    // ✅ Default User
    console.log('👤 User → /user/dashboard');
    return <Redirect to="/user/dashboard" />;
  }
  
  // ✅ Fallback - user dashboard
  console.log('⚠️ Fallback → /user/dashboard');
  return <Redirect to="/user/dashboard" />;
};

// AppContent component with language sync
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
        
        {/* ✅ UPGRADE MODAL - GLOBAL - RENDERED ONCE OUTSIDE SWITCH */}
        <UpgradeModal />
        
        <Switch>
          {/* ============================================ */}
          {/* PUBLIC ROUTES WITH MAIN LAYOUT */}
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

          {/* ============================================ */}
          {/* ✅ RESUME REGISTRATION - Handles all stages */}
          {/* ============================================ */}
          <Route path="/resume-registration">
            <MainLayoutWrapper>
              <ResumeRegistration />
            </MainLayoutWrapper>
          </Route>

          {/* ============================================ */}
          {/* ✅ SMART DASHBOARD REDIRECT - Handles Stage + Role */}
          {/* ============================================ */}
          <ProtectedRoute path="/dashboard" exact>
            <SmartDashboardRedirect />
          </ProtectedRoute>

          {/* ============================================ */}
          {/* ✅ COMPANY SETUP PAGE - Combined with Plan & Payment */}
          {/* ============================================ */}
          <ProtectedRoute path="/company-setup" exact>
            <MainLayoutWrapper>
              <CompanySetup />
            </MainLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* ✅ PAYMENT WAITING PAGE ROUTE */}
          {/* ============================================ */}
          <ProtectedRoute path="/payment-waiting">
            <MainLayoutWrapper>
              <PaymentWaitingPage />
            </MainLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* ✅ PLAN SELECTION PAGE - MUST BE BEFORE DASHBOARD */}
          {/* ============================================ */}
          <ProtectedRoute path="/select-plan" exact>
            <MainLayoutWrapper>
              <PricingPage />
            </MainLayoutWrapper>
          </ProtectedRoute>

          {/* ✅ Alias for plan selection */}
          <ProtectedRoute path="/plan-selection" exact>
            <MainLayoutWrapper>
              <PricingPage />
            </MainLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* ✅ PAYMENT PAGE */}
          {/* ============================================ */}
          <ProtectedRoute path="/payment" exact>
            <MainLayoutWrapper>
              <SubscriptionPage />
            </MainLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* ✅ SAFETY PRO DASHBOARD ROUTES */}
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
          {/* ✅ DIRECT DASHBOARD ROUTES */}
          {/* ============================================ */}
          
          {/* EMPLOYEE DASHBOARD */}
          <ProtectedRoute path="/employee/dashboard">
            <DashboardLayoutWrapper>
              <EmployeeDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* USER DASHBOARD */}
          <ProtectedRoute path="/user/dashboard">
            <DashboardLayoutWrapper>
              <UserDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ADMIN DASHBOARD */}
          <ProtectedRoute path="/admin/dashboard">
            <DashboardLayoutWrapper>
              <AdminDashboard />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* USER PROFILE & SETTINGS ROUTES */}
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
          {/* RISK ASSESSMENT ROUTES */}
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
          {/* AI SERVICES ROUTES */}
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
          {/* ✅ DOCUMENT MANAGEMENT ROUTES - ALL NEW */}
          {/* ============================================================ */}
          
          {/* Main Document Management Page (Full Integration) */}
          <ProtectedRoute path="/document-management">
            <DashboardLayoutWrapper>
              <DocumentManagementPage />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* Document Control (Main component) */}
          <ProtectedRoute path="/documents">
            <DashboardLayoutWrapper>
              <DocumentControl />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* Document Review */}
          <ProtectedRoute path="/documents/review">
            <DashboardLayoutWrapper>
              <DocumentReview />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* Document Audit */}
          <ProtectedRoute path="/documents/audit">
            <DashboardLayoutWrapper>
              <DocumentAudit />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* Document Integration */}
          <ProtectedRoute path="/documents/integration">
            <DashboardLayoutWrapper>
              <DocumentIntegration />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* Document Search */}
          <ProtectedRoute path="/documents/search">
            <DashboardLayoutWrapper>
              <DocumentSearch />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* Document Bulk Operations */}
          <ProtectedRoute path="/documents/bulk">
            <DashboardLayoutWrapper>
              <DocumentBulk />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* Document Analytics */}
          <ProtectedRoute path="/documents/analytics">
            <DashboardLayoutWrapper>
              <DocumentAnalytics />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* Document Editor */}
          <ProtectedRoute path="/documents/edit/:id?">
            <DashboardLayoutWrapper>
              <DocumentEditor />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* Document Signatures */}
          <ProtectedRoute path="/documents/signatures/:id?">
            <DashboardLayoutWrapper>
              <DocumentSignature />
            </DashboardLayoutWrapper>
          </ProtectedRoute>

          {/* ============================================ */}
          {/* NEW MODULE MANAGEMENT ROUTES */}
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
          {/* LEGACY HOSPITAL ROUTES - HospitalPage REMOVED */}
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
          {/* 404 FALLBACK - MUST BE LAST */}
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

// ✅ FIXED: App component with ResponsiveWrapper properly placed
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