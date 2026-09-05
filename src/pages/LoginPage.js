// src/pages/LoginPage.js - Fixed missing functions
import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Checkbox, 
  Alert, 
  Card, 
  Typography, 
  Space, 
  Divider, 
  message,
  Select,
  Tabs,
  Modal,
  Row,
  Col,
  Tag,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  SafetyCertificateOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  LoginOutlined,
  TeamOutlined,
  CrownOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  RocketOutlined,
  BankOutlined,
  DollarOutlined,
  LoadingOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import VerificationModal from '../components/VerificationModal';
import { useLanguage } from '../context/LanguageContext';
import PaymentService from '../services/paymentService';
import './AuthPages.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [activeTab, setActiveTab] = useState('user');
  const [loginStage, setLoginStage] = useState(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageData, setStageData] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('1_month');
  const [selectedCountry, setSelectedCountry] = useState('Ghana');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { login } = useAuth();
  const { changeLanguage } = useLanguage();
  const history = useHistory();
  const [form] = Form.useForm();

  // ============================================
  // USER TYPE DETECTION FUNCTIONS
  // ============================================
  
  const isSuperAdmin = (email, userType) => {
    if (userType === 'super_admin' || userType === 'platform_owner') {
      return true;
    }
    
    const superAdminEmails = [
      'abigalisticstudious@gmail.com',
      'superadmin@safetypro.com',
      'admin@safetypro.com'
    ];
    
    const normalizedEmail = email.trim().toLowerCase();
    return superAdminEmails.includes(normalizedEmail);
  };

  const isSafetyPro = (email, userType) => {
    if (userType === 'safetypro' || userType === 'safety_pro') {
      return true;
    }
    
    const safetyProPatterns = [
      /@safetypro\.com$/i,
      /@safetypro-team\.com$/i,
      /@safetytrack\.com$/i,
      /^safetypro\./i
    ];
    
    const normalizedEmail = email.trim().toLowerCase();
    return safetyProPatterns.some(pattern => pattern.test(normalizedEmail));
  };

  const isAdminUser = (email, userType) => {
    return userType === 'admin' || userType === 'company_admin';
  };

  const isEmployee = (email, userType) => {
    return userType === 'employee' || userType === 'staff';
  };

  // ============================================
  // PLAN DEFINITIONS
  // ============================================
  const planDefinitions = {
  free: {
    id: 'free',
    name: 'Free Forever',
    icon: <UserOutlined />,
    color: '#8c8c8c',
    features: [
      'Basic AI document analysis',
      'Email notifications',
      '5 document uploads/month',
      '50 API calls/month',
      '1 team member',
      '1 monitoring station',
      'Community support'
    ],
    price: 0, // ✅ Number
    requiresPayment: false
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    icon: <SafetyCertificateOutlined />,
    color: '#1890ff',
    features: [
      'All Free features',
      'PDF/Word/Excel generation',
      'Basic analytics & reports',
      '100 document uploads/month',
      '1000 API calls/month',
      'Up to 10 team members',
      'Email support (24h response)'
    ],
    price: 20, // ✅ Number
    requiresPayment: true
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    icon: <CrownOutlined />,
    color: '#722ed1',
    features: [
      'All Basic features',
      'ML-powered image analysis',
      'Video analysis & monitoring',
      'Advanced analytics dashboard',
      '500 document uploads/month',
      '5000 API calls/month',
      'Up to 50 team members',
      'Priority email support (4h response)'
    ],
    price: 50, // ✅ Number
    requiresPayment: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    icon: <RocketOutlined />,
    color: '#fa8c16',
    features: [
      'All Pro features',
      'Unlimited document uploads',
      'Custom API limits',
      'Unlimited team members',
      'Unlimited camera feeds',
      'Custom AI model training',
      'White-label solution',
      'On-premise deployment',
      'Dedicated account manager',
      '24/7 priority support',
      'SLA 99.9% uptime'
    ],
    price: 299, // ✅ Number instead of 'Custom'
    requiresPayment: true,
    isEnterprise: true
  },
  custom: {
    id: 'custom',
    name: 'Custom Enterprise',
    icon: <TeamOutlined />,
    color: '#722ed1',
    features: [
      'Fully customized solution',
      'Tailored workflows & forms',
      'Complete API Integration',
      'Custom dashboards & reports',
      'Dedicated infrastructure',
      'On-premise or cloud deployment',
      '24/7 premium support'
    ],
    price: 0, // ✅ Number (but we'll handle this differently)
    requiresPayment: false,
    isCustom: true
  }
};

  const DURATION_OPTIONS = [
    { value: '1_month', label: 'Monthly' },
    { value: '6_month', label: '6 Months' },
    { value: '1_year', label: 'Annual' }
  ];

  const PAYMENT_METHODS = {
    instant: [
      { id: 'paystack', name: 'Paystack / Credit Card', icon: <CreditCardOutlined />, description: 'Instant activation' },
      { id: 'paypal', name: 'PayPal', icon: <DollarOutlined />, description: 'Instant activation' }
    ],
    manual: [
      { id: 'bank_transfer', name: 'Bank Transfer', icon: <BankOutlined />, description: 'Manual verification (24h)' },
      { id: 'mobile_money', name: 'Mobile Money', icon: <PhoneOutlined />, description: 'Manual verification (24h)' }
    ]
  };

  // ============================================
  // GET DASHBOARD PATH
  // ============================================
  const getDashboardPath = (userData, stage) => {
    const email = userData?.email || '';
    const userType = userData?.user_type || '';
    
    console.log('🔍 Determining dashboard for:', { email, userType, stage });
    
    if (stage === 'needs_plan' || stage === 'needs_payment') {
      return null;
    }
    
    if (stage === 'needs_approval') {
      return '/pending-approval';
    }
    
    if (stage === 'needs_company_setup') {
      return '/company-setup';
    }
    
    if (stage === 'complete') {
      if (isSuperAdmin(email, userType) || isSafetyPro(email, userType)) {
        return '/safetypro/dashboard';
      }
      if (isAdminUser(email, userType)) {
        return '/admin/dashboard';
      }
      if (isEmployee(email, userType)) {
        return '/employee/dashboard';
      }
    }
    
    return '/dashboard';
  };

  // ============================================
  // ✅ SHOW STAGE MODAL
  // ============================================
  const showStageModalWithData = (stage, userData) => {
    const stageConfigs = {
      'needs_plan': {
        title: 'Select Your Plan',
        icon: <WarningOutlined style={{ color: '#faad14', fontSize: 48 }} />,
        message: 'Please select a plan to continue using SafetyTrack Pro.',
        description: 'Choose a plan that fits your needs.',
        buttonText: 'Select Plan',
        buttonType: 'primary',
        buttonAction: () => {
          setShowStageModal(false);
          setUserData(userData);
          setIsAdmin(isAdminUser(userData?.email, userData?.user_type));
          setShowPlanModal(true);
        }
      },
      'needs_payment': {
        title: 'Complete Your Payment',
        icon: <CreditCardOutlined style={{ color: '#faad14', fontSize: 48 }} />,
        message: 'Your plan requires payment to activate.',
        description: 'Please complete your payment to access all features.',
        buttonText: 'Complete Payment',
        buttonType: 'primary',
        buttonAction: () => {
          setShowStageModal(false);
          setUserData(userData);
          setIsAdmin(isAdminUser(userData?.email, userData?.user_type));
          setShowPlanModal(true);
        }
      },
      'needs_approval': {
        title: 'Pending Approval',
        icon: <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 48 }} />,
        message: 'Your admin account is pending approval.',
        description: 'You will be notified once your account is approved.',
        buttonText: 'OK',
        buttonType: 'default',
        buttonAction: () => setShowStageModal(false)
      },
      'needs_company_setup': {
        title: 'Complete Company Setup',
        icon: <TeamOutlined style={{ color: '#1890ff', fontSize: 48 }} />,
        message: 'Please complete your company setup.',
        description: 'Set up your company profile to continue.',
        buttonText: 'Setup Company',
        buttonType: 'primary',
        buttonAction: () => {
          setShowStageModal(false);
          history.push('/company-setup');
        }
      },
      'complete': {
        title: 'Welcome Back!',
        icon: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 48 }} />,
        message: 'Your account is fully active.',
        description: 'Redirecting to your dashboard...',
        buttonText: 'Go to Dashboard',
        buttonType: 'primary',
        buttonAction: () => {
          const dashboardPath = getDashboardPath(userData, stage);
          setShowStageModal(false);
          history.push(dashboardPath);
        }
      }
    };

    const config = stageConfigs[stage] || stageConfigs['complete'];
    setStageData({ ...config, userData, stage });
    setShowStageModal(true);
  };

  // ✅ Stage Modal Action Handler
  const handleStageModalAction = () => {
    if (stageData?.buttonAction) {
      stageData.buttonAction();
    } else {
      setShowStageModal(false);
    }
  };

  // ============================================
  // LOGIN HANDLERS
  // ============================================
  const handleUserLogin = async (values) => {
    setLoading(true);
    setError('');

    try {
      const loginData = {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        user_type: activeTab === 'employee' ? 'employee' : activeTab
      };

      console.log('🔑 Login payload:', loginData);

      const result = await login(loginData);
      
      console.log('📥 Login result:', result);
      
      if (result.success) {
        const userData = result.user || {};
        const stage = result.stage || 'complete';
        const requiresPayment = result.requires_payment || false;
        const requiresPlanSelection = result.requires_plan_selection || false;
        
        console.log(`📊 User stage: ${stage}`);
        console.log(`📊 Requires plan selection: ${requiresPlanSelection}`);
        console.log(`📊 Requires payment: ${requiresPayment}`);
        
        if (userData.preferred_language) {
          await changeLanguage(userData.preferred_language);
          localStorage.setItem('preferredLanguage', userData.preferred_language);
        }
        
        // ✅ Check stage and show appropriate modal
        if (stage === 'needs_plan' || requiresPlanSelection) {
          console.log('📋 Showing plan selection modal...');
          setShowStageModal(false);
          setUserData(userData);
          setIsAdmin(isAdminUser(userData?.email, userData?.user_type));
          setShowPlanModal(true);
          setLoading(false);
          return;
        }
        
        if (stage === 'needs_payment' || requiresPayment) {
          console.log('💳 Showing payment modal...');
          setShowStageModal(false);
          setUserData(userData);
          setIsAdmin(isAdminUser(userData?.email, userData?.user_type));
          setShowPlanModal(true);
          setLoading(false);
          return;
        }
        
        if (stage === 'needs_approval') {
          console.log('⏳ Showing approval pending modal...');
          showStageModalWithData(stage, userData);
          setLoginStage(stage);
          setLoading(false);
          return;
        }
        
        if (stage === 'needs_company_setup') {
          console.log('🏢 Redirecting to company setup...');
          showStageModalWithData(stage, userData);
          setLoginStage(stage);
          setLoading(false);
          return;
        }
        
        // ✅ Stage is 'complete' - redirect to dashboard
        const dashboardPath = getDashboardPath(userData, stage);
        console.log(`🚀 Redirecting to dashboard: ${dashboardPath}`);
        message.success('Login successful!');
        history.push(dashboardPath);
        
      } else {
        if (result.needsVerification) {
          setShowVerification(true);
          setCurrentEmail(values.email);
        }
        setError(result.error || 'Login failed');
        message.error(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Login failed. Please try again.');
      message.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeLogin = async (values) => {
    setLoading(true);
    setError('');

    try {
      const loginData = {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        user_type: 'employee'
      };

      console.log('🔑 Employee login payload:', loginData);

      const result = await login(loginData);
      
      if (result.success) {
        const userData = result.user || {};
        const stage = result.stage || 'complete';
        
        if (userData.preferred_language) {
          await changeLanguage(userData.preferred_language);
          localStorage.setItem('preferredLanguage', userData.preferred_language);
        }
        
        if (stage === 'needs_plan' || stage === 'needs_payment') {
          setUserData(userData);
          setIsAdmin(false);
          setShowPlanModal(true);
          setLoading(false);
          return;
        }
        
        message.success('Employee login successful!');
        const dashboardPath = getDashboardPath(userData, stage);
        history.push(dashboardPath);
        
      } else {
        if (result.needsVerification) {
          setShowVerification(true);
          setCurrentEmail(values.email);
        }
        setError(result.error || 'Employee login failed');
        message.error(result.error || 'Employee login failed');
      }
    } catch (err) {
      console.error('❌ Employee login error:', err);
      setError('Employee login failed. Please try again.');
      message.error('Employee login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (activeTab === 'employee') {
      await handleEmployeeLogin(values);
    } else {
      await handleUserLogin(values);
    }
  };

  // ============================================
  // PLAN SELECTION HANDLERS
  // ============================================
  
  const getAvailablePlans = () => {
    if (isAdmin) {
      return ['enterprise', 'custom'];
    }
    return ['free', 'basic', 'pro', 'enterprise'];
  };

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    const plan = planDefinitions[planId];
    
    if (planId === 'free') {
      activateFreePlan();
    } else if (planId === 'custom') {
      message.info('Contact our sales team for custom enterprise pricing.');
      setShowPlanModal(false);
      history.push('/contact-sales');
    } else {
      // Paid plan - show payment methods
      setSelectedPlan(planId);
    }
  };

  const activateFreePlan = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/update-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          plan: 'free',
          activate: true
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        message.success('Free plan activated successfully!');
        setShowPlanModal(false);
        localStorage.removeItem('userStage');
        localStorage.removeItem('requires_plan_selection');
        history.push('/dashboard');
      } else {
        message.error(data.error || 'Failed to activate plan');
      }
    } catch (error) {
      console.error('Activation error:', error);
      message.error('Failed to activate plan');
    }
  };

  // ✅ Updated handlePayment function in LoginPage.js

const handlePayment = async (methodId) => {
  setPaymentProcessing(true);
  setSelectedPaymentMethod(methodId);
  
  try {
    const plan = planDefinitions[selectedPlan];
    const email = userData?.email || '';
    
    // ✅ Check if plan has custom pricing
    if (plan.price === 'Custom') {
      message.info('This plan has custom pricing. Please contact our sales team.');
      setPaymentProcessing(false);
      setShowPlanModal(false);
      history.push('/contact-sales');
      return;
    }
    
    // ✅ Ensure amount is a number
    const amount = typeof plan.price === 'number' ? plan.price : parseFloat(plan.price);
    if (isNaN(amount) || amount <= 0) {
      message.error('Invalid plan price. Please contact support.');
      setPaymentProcessing(false);
      return;
    }
    
    const paymentData = {
      plan: selectedPlan,
      country: selectedCountry || 'Ghana',
      duration: selectedDuration,
      amount: amount, // ✅ Now always a number
      currency: 'USD',
      email: email,
      name: userData?.name || '',
      user_id: userData?.id,
      user_type: userData?.user_type || 'user',
      payment_method: methodId,
      metadata: {
        plan: selectedPlan,
        duration: selectedDuration,
        isLogin: true
      },
      callback_url: `${window.location.origin}/payment-callback?method=${methodId}&login=true`
    };

    let response;
    
    if (methodId === 'paystack') {
      response = await PaymentService.initializePaystackPayment(paymentData);
      if (response?.authorization_url) {
        window.location.href = response.authorization_url;
      } else {
        throw new Error(response?.error || 'Failed to initialize Paystack payment');
      }
    } else if (methodId === 'paypal') {
      response = await PaymentService.initializePayPalPayment(paymentData);
      const approvalUrl = response?.approval_url;
      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        throw new Error(response?.error || 'Failed to initialize PayPal payment');
      }
    } else if (methodId === 'bank_transfer' || methodId === 'mobile_money') {
      showManualPaymentInstructions(methodId, plan);
    }
    
  } catch (error) {
    console.error('Payment error:', error);
    message.error(error.message || 'Payment failed. Please try again.');
    setPaymentProcessing(false);
  }
};

  // In LoginPage.js - Updated showManualPaymentInstructions

// In LoginPage.js - showManualPaymentInstructions with DEBUG

const showManualPaymentInstructions = (methodId, plan) => {
  const amount = plan.price;
  const currency = 'USD';
  const paymentReference = `MANUAL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
  // ✅ Get the API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // ✅ DEBUG: Log everything
  console.log('🔵 ===== MANUAL PAYMENT DEBUG START =====');
  console.log('🔵 Method ID:', methodId);
  console.log('🔵 Plan:', plan);
  console.log('🔵 Amount:', amount);
  console.log('🔵 Currency:', currency);
  console.log('🔵 Payment Reference:', paymentReference);
  console.log('🔵 User Data:', userData);
  console.log('🔵 Selected Plan:', selectedPlan);
  console.log('🔵 Token in localStorage:', localStorage.getItem('token') ? 'PRESENT' : 'MISSING');
  console.log('🔵 API Base URL:', API_BASE_URL);
  console.log('🔵 =========================================');
  
  Modal.info({
    title: `${methodId === 'bank_transfer' ? 'Bank Transfer' : 'Mobile Money'} Instructions`,
    width: 650,
    icon: <InfoCircleOutlined style={{ color: '#faad14' }} />,
    content: (
      <div>
        <Alert
          message={`${plan.name} Plan Payment`}
          description={`Amount: ${PaymentService.formatCurrency(amount, currency)}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <div style={{ marginBottom: 16 }}>
          <Text strong>Your Payment Reference:</Text>
          <div>
            <Text code copyable style={{ fontSize: 16, padding: 4 }}>
              {paymentReference}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Please use this reference when making payment
          </Text>
        </div>
        
        <Card size="small" style={{ marginBottom: 12 }}>
          {methodId === 'bank_transfer' ? (
            <>
              <div><Text strong>Bank:</Text> GCB Bank</div>
              <div><Text strong>Account:</Text> <Text copyable>4151440001070</Text></div>
              <div><Text strong>Name:</Text> SafetyTrack Pro Ltd</div>
              <div><Text strong>Reference:</Text> <Text code>{paymentReference}</Text></div>
            </>
          ) : (
            <>
              <div><Text strong>Network:</Text> MTN Mobile Money</div>
              <div><Text strong>Number:</Text> <Text copyable>0553841216</Text></div>
              <div><Text strong>Name:</Text> SafetyTrack Pro Ltd</div>
              <div><Text strong>Reference:</Text> <Text code>{paymentReference}</Text></div>
            </>
          )}
        </Card>
        
        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text strong>Instructions:</Text>
          <ol style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>Make payment to the account above</li>
            <li>Use your email <Text code>{userData?.email}</Text> as reference</li>
            <li>Save the transaction ID/receipt</li>
            <li>Click "I Have Sent Payment" below</li>
          </ol>
        </div>
        
        <Alert
          message="⏳ Verification Process"
          description="Our team will verify your payment within 24-48 hours. You will receive a confirmation email once verified."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Button 
          type="primary" 
          size="large" 
          block
          onClick={async () => {
            console.log('🔵 ===== CONFIRM PAYMENT BUTTON CLICKED =====');
            
            try {
              const token = localStorage.getItem('token');
              
              // ✅ Define url and requestBody FIRST
              const url = `${API_BASE_URL}/payment/manual/confirm`;
              const requestBody = {
                payment_reference: paymentReference,
                transaction_id: `TX-${Date.now()}`,
                payment_method: methodId,
                amount: amount,
                currency: currency,
                plan: selectedPlan
              };
              
              // ✅ DEBUG: Log request details
              console.log('🔵 Request Details:');
              console.log('  URL:', url);
              console.log('  Method: POST');
              console.log('  Token present?', token ? 'YES' : 'NO');
              console.log('  Token:', token ? `${token.substring(0, 20)}...` : 'null');
              console.log('  Request Body:', JSON.stringify(requestBody, null, 2));
              
              // ✅ DEBUG: Log before fetch
              console.log('🔵 Sending fetch request...');
              console.time('fetch-time');
              
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
              });
              
              console.timeEnd('fetch-time');
              
              // ✅ DEBUG: Log response details
              console.log('🔵 Response Details:');
              console.log('  Status:', response.status);
              console.log('  Status Text:', response.statusText);
              console.log('  OK:', response.ok);
              console.log('  Headers:', Object.fromEntries(response.headers.entries()));
              
              // ✅ DEBUG: Read response as text first
              const responseText = await response.text();
              console.log('🔵 Raw Response Text:', responseText);
              
              // ✅ DEBUG: Try to parse JSON
              let data;
              try {
                data = JSON.parse(responseText);
                console.log('✅ Parsed JSON response:', data);
              } catch (parseError) {
                console.error('❌ Failed to parse JSON:', parseError);
                console.error('❌ Raw response was:', responseText);
                message.error(`Server error: ${responseText.substring(0, 100)}`);
                return;
              }
              
              if (response.ok) {
                console.log('✅ Manual payment confirmed successfully!');
                console.log('✅ Response data:', data);
                
                // ✅ STORE PAYMENT DATA IN SESSION STORAGE BEFORE REDIRECT
                const paymentData = {
                  payment_reference: data.payment_reference || paymentReference,
                  payment_id: data.payment_id,
                  status: data.status || 'pending_verification',
                  amount: amount,
                  currency: currency,
                  plan: selectedPlan,
                  payment_method: methodId,
                  expires_at: data.expires_at
                };
                
                console.log('🔵 Storing payment data in sessionStorage:', paymentData);
                sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
                sessionStorage.setItem('paymentReference', paymentData.payment_reference);
                sessionStorage.setItem('paymentStatus', paymentData.status);
                sessionStorage.setItem('selectedPlan', selectedPlan);
                sessionStorage.setItem('paymentMethod', methodId);
                sessionStorage.setItem('paymentAmount', amount);
                sessionStorage.setItem('paymentCurrency', currency);
                
                Modal.destroyAll();
                setShowPlanModal(false);
                message.success('Payment recorded successfully! Our team will verify within 24-48 hours.');
                
                // ✅ Clear stage flags
                localStorage.removeItem('userStage');
                localStorage.removeItem('requires_plan_selection');
                localStorage.removeItem('requires_payment');
                
                console.log('🔵 Redirecting to /payment-waiting');
                history.push('/payment-waiting');
              } else {
                console.error('❌ Server returned error:', data);
                message.error(data.error || 'Failed to record payment');
              }
            } catch (error) {
              console.error('❌ MANUAL PAYMENT ERROR:', error);
              console.error('❌ Error name:', error.name);
              console.error('❌ Error message:', error.message);
              console.error('❌ Error stack:', error.stack);
              message.error(`Failed to confirm payment: ${error.message}`);
            }
            
            console.log('🔵 ===== CONFIRM PAYMENT END =====');
          }}
        >
          I Have Sent Payment ✓
        </Button>
      </div>
    )
  });
};
  const handleForgotPassword = () => {
    history.push('/forgot-password');
  };

  const handleSignup = () => {
    history.push('/signup');
  };

  // ============================================
  // RENDER PLAN SELECTION MODAL
  // ============================================
  const renderPlanModal = () => {
    const availablePlans = getAvailablePlans();
    
    return (
      <Modal
        title={isAdmin ? 'Select Enterprise Plan' : 'Select Your Plan'}
        open={showPlanModal}
        onCancel={() => {
          setShowPlanModal(false);
          if (loginStage !== 'needs_plan' && loginStage !== 'needs_payment') {
            history.push('/dashboard');
          }
        }}
        footer={null}
        width={700}
        closable={true}
      >
        <div>
          {!selectedPlan ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Text type="secondary">
                  {isAdmin 
                    ? 'Select an enterprise plan for your organization' 
                    : 'Choose a plan that fits your needs'}
                </Text>
              </div>

              {!isAdmin && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Text strong>Billing Cycle: </Text>
                  <Select
                    value={selectedDuration}
                    onChange={setSelectedDuration}
                    style={{ width: 150 }}
                  >
                    {DURATION_OPTIONS.map(opt => (
                      <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                    ))}
                  </Select>
                </div>
              )}

              <Row gutter={[16, 16]}>
                {availablePlans.map((planId) => {
                  const plan = planDefinitions[planId];
                  const isEnterprise = planId === 'enterprise';
                  const isCustom = planId === 'custom';
                  
                  return (
                    <Col xs={24} md={isAdmin ? 12 : 8} key={planId}>
                      <Card
                        hoverable
                        onClick={() => handlePlanSelect(planId)}
                        style={{
                          height: '100%',
                          cursor: 'pointer',
                          border: planId === 'pro' ? '2px solid #722ed1' : undefined
                        }}
                      >
                        {isEnterprise && (
                          <Tag color="gold" style={{ marginBottom: 8 }}>
                            <RocketOutlined /> Enterprise
                          </Tag>
                        )}
                        {isCustom && (
                          <Tag color="purple" style={{ marginBottom: 8 }}>
                            <TeamOutlined /> Custom
                          </Tag>
                        )}
                        {planId === 'pro' && !isEnterprise && !isCustom && (
                          <Tag color="blue" style={{ marginBottom: 8 }}>
                            <CrownOutlined /> Most Popular
                          </Tag>
                        )}
                        
                        <div style={{ fontSize: 28, color: plan.color, marginBottom: 8 }}>
                          {plan.icon}
                        </div>
                        <Title level={4}>{plan.name}</Title>
                        
                        <div style={{ marginBottom: 8 }}>
                          <Text strong style={{ fontSize: 20, color: plan.color }}>
                            {typeof plan.price === 'number' 
                              ? `$${plan.price}` 
                              : 'Custom Pricing'}
                          </Text>
                          {typeof plan.price === 'number' && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              /{selectedDuration === '1_month' ? 'month' : selectedDuration === '6_month' ? '6 months' : 'year'}
                            </Text>
                          )}
                        </div>

                        <Divider style={{ margin: '8px 0' }} />

                        <div>
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} style={{ padding: '2px 0', fontSize: 12 }}>
                              <CheckCircleOutlined style={{ color: plan.color, marginRight: 6 }} />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ) : (
            <div>
              <Alert
                message="Order Summary"
                description={
                  <div style={{ marginTop: 8 }}>
                    <Row gutter={[16, 8]}>
                      <Col span={12}>
                        <Text type="secondary">Plan:</Text>
                        <div><Text strong>{planDefinitions[selectedPlan]?.name}</Text></div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">Billing:</Text>
                        <div><Text strong>{DURATION_OPTIONS.find(d => d.value === selectedDuration)?.label}</Text></div>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">Amount:</Text>
                        <div>
                          <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                            {typeof planDefinitions[selectedPlan]?.price === 'number'
                              ? `$${planDefinitions[selectedPlan]?.price}`
                              : 'Custom Pricing'}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Divider orientation="left">Select Payment Method</Divider>

              <div>
                {PAYMENT_METHODS.instant.map((method) => (
                  <Card
                    key={method.id}
                    hoverable
                    onClick={() => handlePayment(method.id)}
                    style={{ marginBottom: 8, cursor: 'pointer' }}
                    bodyStyle={{ padding: 12 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ fontSize: 24, color: '#1890ff' }}>
                        {method.icon}
                      </div>
                      <div>
                        <Text strong>{method.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{method.description}</Text>
                      </div>
                      <Tag color="green" style={{ marginLeft: 'auto' }}>✓ Instant</Tag>
                    </div>
                  </Card>
                ))}

                {PAYMENT_METHODS.manual.map((method) => (
                  <Card
                    key={method.id}
                    hoverable
                    onClick={() => handlePayment(method.id)}
                    style={{ marginBottom: 8, cursor: 'pointer' }}
                    bodyStyle={{ padding: 12 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ fontSize: 24, color: '#faad14' }}>
                        {method.icon}
                      </div>
                      <div>
                        <Text strong>{method.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{method.description}</Text>
                      </div>
                      <Tag color="orange" style={{ marginLeft: 'auto' }}>⏱ 24-48h</Tag>
                    </div>
                  </Card>
                ))}
              </div>

              {paymentProcessing && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Spin indicator={<LoadingOutlined />} /> Processing payment...
                </div>
              )}

              <Button 
                type="link" 
                onClick={() => {
                  setSelectedPlan(null);
                  setSelectedPaymentMethod(null);
                }}
                style={{ marginTop: 8 }}
              >
                ← Back to Plans
              </Button>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="auth-container">
      <Card className="auth-card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <SafetyCertificateOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 16 }} />
            <Title level={2}>Welcome Back</Title>
            <Text type="secondary">Sign in to your SafetyTrack Pro account</Text>
          </div>

          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
            centered
            style={{ marginBottom: 0 }}
          >
            <TabPane tab={<span><UserOutlined /> User</span>} key="user" />
            <TabPane tab={<span><IdcardOutlined /> Employee</span>} key="employee" />
            <TabPane tab={<span><CrownOutlined /> Admin</span>} key="admin" />
          </Tabs>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            initialValues={{ rememberMe: true }}
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                placeholder="Enter your email" 
                prefix={<MailOutlined />}
                disabled={loading}
                autoComplete="email"
              />
            </Form.Item>

            {activeTab === 'employee' ? (
              <>
                <Form.Item
                  name="employeeId"
                  label="Employee ID"
                  rules={[{ required: true, message: 'Please enter your Employee ID!' }]}
                >
                  <Input 
                    placeholder="Your Employee ID (e.g., EM003)" 
                    prefix={<IdcardOutlined />}
                    disabled={loading}
                    autoComplete="off"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: 'Please enter your password' }]}
                >
                  <Input.Password 
                    placeholder="Enter your password" 
                    prefix={<LockOutlined />}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: 'Please enter your password' }]}
                >
                  <Input.Password 
                    placeholder="Enter your password" 
                    prefix={<LockOutlined />}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </Form.Item>
                <Form.Item name="rememberMe" valuePropName="checked">
                  <Checkbox disabled={loading}>Remember me</Checkbox>
                </Form.Item>
              </>
            )}

            {error && (
              <Alert 
                message={error} 
                type="error" 
                showIcon 
                style={{ marginBottom: 16 }} 
                closable
                onClose={() => setError('')}
              />
            )}

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
                icon={<LoginOutlined />}
              >
                {loading ? 'Logging in...' : `Login as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </Button>
            </Form.Item>
          </Form>

          <Divider>Or</Divider>
          
          <div style={{ textAlign: 'center' }}>
            {activeTab !== 'employee' && (
              <Button 
                type="link" 
                onClick={handleForgotPassword}
                disabled={loading}
                style={{ padding: 0, marginBottom: 16, display: 'block' }}
              >
                Forgot your password?
              </Button>
            )}
            
            <Text>
              Don't have an account?{' '}
              <Button 
                type="link" 
                onClick={handleSignup}
                disabled={loading}
                style={{ padding: 0 }}
              >
                Sign up here
              </Button>
            </Text>
          </div>
        </Space>
      </Card>

      {/* Stage Modal */}
      <Modal
        title={stageData?.title || 'Information'}
        open={showStageModal}
        onCancel={() => setShowStageModal(false)}
        footer={[
          <Button 
            key="action" 
            type={stageData?.buttonType || 'primary'} 
            onClick={handleStageModalAction}
            size="large"
          >
            {stageData?.buttonText || 'Continue'}
          </Button>
        ]}
        centered
        width={450}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          {stageData?.icon}
          <Title level={4} style={{ marginTop: 16 }}>
            {stageData?.message || 'Please complete the required action.'}
          </Title>
          {stageData?.description && (
            <Text type="secondary">{stageData.description}</Text>
          )}
        </div>
      </Modal>

      {/* Verification Modal */}
      {showVerification && (
        <VerificationModal 
          email={currentEmail} 
          onVerified={() => {
            setShowVerification(false);
            message.success('Email verified successfully! You can now login.');
            form.resetFields();
          }}
          onClose={() => setShowVerification(false)}
        />
      )}

      {/* Plan Selection Modal */}
      {renderPlanModal()}
    </div>
  );
}

export default LoginPage;