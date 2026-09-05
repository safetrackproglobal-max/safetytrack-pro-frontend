// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import MainLayout from './Layouts/MainLayout';
import DashboardLayout from './Layouts/DashboardLayout';
import { NotificationProvider } from './context/NotificationContext';
import NotificationBell from './components/NotificationBell';
import ToastNotifications from './components/ToastNotifications';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminProvider } from './context/AdminContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import the HSE Industry API Service
import hseIndustryService from './services/hseIndustryService';

// ADD GENERAL AI SERVICE IMPORT
import AIService from './services/GeneralAIService';

// ✅ ADD NOTIFICATION SERVICE IMPORT
import notificationService from './services/notificationService';

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

// ✅ ADD AIMEDICALANALYSISTAB IMPORT
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

// Simple Module Routes
import EnvironmentalDashboard from './pages/EnvironmentalDashboard';
import HospitalManagementPage from './pages/HospitalManagementPage';
import QualityControlPage from './pages/QualityControlPage';
import SupplyChainPageNew from './pages/SupplyChainPage';
import HSEManagementPage from './pages/HSEManagementPage';

// Legacy Hospital Routes
import HospitalPage from './pages/HospitalPage';
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

// AI Components
import RiskAssessment from './components/AI/RiskAssessment';
import SafetyDocumentAnalyzer from './components/AI/SafetyDocumentAnalyzer';
import VideoSafetyAnalysis from './components/AI/VideoSafetyAnalysis';
import EnvironmentalDataAnalysis from './components/AI/EnvironmentalDataAnalysis';

// ✅ ADD MISSING AI COMPONENT IMPORTS
import DiseasePrediction from './components/AI/DiseasePrediction';
import SymptomAnalyzer from './components/AI/SymptomAnalyzer';
import LabResultAnalyzer from './components/AI/LabResultAnalyzer';
import MedicalTextAnalysis from './components/AI/MedicalTextAnalysis';
import AIChatAssistant from './components/AI/AIChatAssistant';
import AIAnalysis from './components/AI/AIAnalysis';

// ✅ ADD VIDEOAI IMPORT
import VideoAI from './components/AI/VideoAi';

import './styles/main.css';

// Wrapper components for different layouts
const MainLayoutWrapper = ({ children }) => (
  <MainLayout>
    {children}
  </MainLayout>
);

const DashboardLayoutWrapper = ({ children }) => (
  <DashboardLayout>
    {children}
  </DashboardLayout>
);

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
  AIService, // ADD GENERAL AI SERVICE TO EXPORTS
  notificationService // ✅ ADD NOTIFICATION SERVICE TO EXPORTS
};

function App() {
  return (
    <>
      <I18nextProvider i18n={i18n}>
        {/* ✅ FIXED: AuthProvider must be FIRST because LanguageProvider depends on it */}
        <AuthProvider>
          <LanguageProvider>
            <AdminProvider>
              <Router>
                <NotificationProvider>
                  <NotificationBell />
                  <ToastNotifications />
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
                    {/* NEW DASHBOARD ROUTES - ROLE BASED */}
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

                    {/* ✅ ADD AIMEDICALANALYSISTAB ROUTE */}
                    <ProtectedRoute path="/ai-services/medical-analysis">
                      <DashboardLayoutWrapper>
                        <AIMedicalAnalysisTab />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    {/* ✅ ADD VIDEOAI ROUTE */}
                    <ProtectedRoute path="/ai-services/video-ai">
                      <DashboardLayoutWrapper>
                        <VideoAI />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    {/* Individual AI Service Routes */}
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
                    
                    {/* ✅ ENVIRONMENTAL AI SERVICE ROUTE */}
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

                    {/* Main HSE Management - Industry Selector */}
                    <ProtectedRoute path="/hse-management" exact>
                      <DashboardLayoutWrapper>
                        <HSEManagement />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    {/* Single Route for ALL Industries (main dashboard) */}
                    <ProtectedRoute path="/modules/hse/industry/:industryId">
                      <DashboardLayoutWrapper>
                        <IndustryHSEDashboard />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    {/* Individual Industry Routes with Tabs */}
                    <ProtectedRoute path="/hse/industry/:industryId/:tab?">
                      <DashboardLayoutWrapper>
                        <IndustryHSEDashboard />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    {/* Legacy Routes for Backward Compatibility */}
                    <ProtectedRoute path="/hse/oil_gas/:tab?">
                      <DashboardLayoutWrapper>
                        <OilGasSafety />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    {/* Construction Safety Route */}
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

                    {/* Simple HSE route (for dashboard navigation) */}
                    <ProtectedRoute path="/hse" exact>
                      <DashboardLayoutWrapper>
                        <HSEManagementPage />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    {/* ============================================ */}
                    {/* SIMPLE MODULE ROUTES (For Dashboard Navigation) */}
                    {/* ============================================ */}
                    <ProtectedRoute path="/environmental" exact>
                      <DashboardLayoutWrapper>
                        <EnvironmentalDashboard />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    <ProtectedRoute path="/hospital" exact>
                      <DashboardLayoutWrapper>
                        <HospitalManagementPage />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    <ProtectedRoute path="/hse" exact>
                      <DashboardLayoutWrapper>
                        <HSEManagementPage />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    <ProtectedRoute path="/quality" exact>
                      <DashboardLayoutWrapper>
                        <QualityControlPage />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    <ProtectedRoute path="/supplychain" exact>
                      <DashboardLayoutWrapper>
                        <SupplyChainPageNew />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    {/* ============================================ */}
                    {/* LEGACY HOSPITAL ROUTES (Backward Compatibility) */}
                    {/* ============================================ */}
                    <ProtectedRoute path="/hospitals">
                      <DashboardLayoutWrapper>
                        <HospitalPage />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>
                    
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
                    <ProtectedRoute path="/dashboard" exact>
                      <DashboardLayoutWrapper>
                        <DashboardPage />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>
                    
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

                    {/* ============================================ */}
                    {/* DETAILED MODULE SUB-ROUTES */}
                    {/* ============================================ */}
                    {/* Environmental sub-routes */}
                    <ProtectedRoute path="/environmental/air-quality/sensors/:id">
                      <DashboardLayoutWrapper>
                        <EnvironmentalDashboard />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>
                    
                    <ProtectedRoute path="/environmental/water-quality/samples/:id">
                      <DashboardLayoutWrapper>
                        <EnvironmentalDashboard />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>
                    
                    <ProtectedRoute path="/environmental/alerts">
                      <DashboardLayoutWrapper>
                        <EnvironmentalDashboard />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    {/* Hospital sub-routes */}
                    <ProtectedRoute path="/hospital/departments">
                      <DashboardLayoutWrapper>
                        <HospitalManagementPage />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>
                    
                    <ProtectedRoute path="/hospital/staff">
                      <DashboardLayoutWrapper>
                        <HospitalManagementPage />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    {/* HSE sub-routes */}
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

                    {/* Quality sub-routes */}
                    <ProtectedRoute path="/quality/audits">
                      <DashboardLayoutWrapper>
                        <QualityControlPage />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>
                    
                    <ProtectedRoute path="/quality/standards">
                      <DashboardLayoutWrapper>
                        <QualityControlPage />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>

                    {/* Supply Chain sub-routes */}
                    <ProtectedRoute path="/supplychain/inventory">
                      <DashboardLayoutWrapper>
                        <SupplyChainPageNew />
                      </DashboardLayoutWrapper>
                    </ProtectedRoute>
                    
                    <ProtectedRoute path="/supplychain/suppliers">
                      <DashboardLayoutWrapper>
                        <SupplyChainPageNew />
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
                      </MainLayoutWrapper>
                    </Route>
                  </Switch>
                </NotificationProvider>
              </Router>
            </AdminProvider>
          </LanguageProvider>
        </AuthProvider>
      </I18nextProvider>
    </>
  );
}

export default App;