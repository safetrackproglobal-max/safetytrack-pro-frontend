// src/pages/PricingPage.js
import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Button, Typography, Tag, Select, Space, List, Alert, 
  Divider, Modal, message, Tabs, Descriptions, Badge, Progress, Spin
} from 'antd';
import { 
  CheckCircleOutlined, CrownOutlined, RocketOutlined, LoadingOutlined, 
  CreditCardOutlined, BankOutlined, PayCircleOutlined, QqOutlined,
  UserOutlined, SafetyOutlined, TeamOutlined, DashboardOutlined,
  VideoCameraOutlined, ApiOutlined, FileTextOutlined, BellOutlined,
  CloudOutlined, GlobalOutlined, DollarOutlined, CalendarOutlined,
  MobileOutlined, PhoneOutlined
} from '@ant-design/icons';
import { useHistory, withRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { normalizePlanName } from '../services/api';
import PaymentService from '../services/paymentService';
import './PricingPage.css';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

function PricingPage(props) {
  const { user, planData, canAccess, updateUserPlan } = useAuth();
  const [selectedDuration, setSelectedDuration] = useState('1_month');
  const [selectedCountry, setSelectedCountry] = useState(user?.country || 'default');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [currentPlanName, setCurrentPlanName] = useState('free');
  const [usageData, setUsageData] = useState(null);
  const [userStage, setUserStage] = useState('complete');
  
  const history = useHistory();
  
  // Debug: Check if history is available
  console.log('📋 PricingPage history available:', !!history);
  console.log('📍 Current path:', window.location.pathname);

  // ✅ Check if user is already on select-plan page
  const isOnSelectPlan = window.location.pathname.includes('/select-plan');

  // ✅ Check if user is admin
  const isAdmin = user?.user_type === 'admin' || user?.role === 'admin';

  const countryPricing = pricingData || PaymentService.getStaticPricing(selectedCountry);

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
      limits: {
        uploads: 5,
        apiCalls: 50,
        teamMembers: 1,
        cameras: 1,
        videoMinutes: 10,
        aiRequests: 10
      },
      requiresPayment: false
    },
    basic: {
      id: 'basic',
      name: 'Basic',
      icon: <SafetyOutlined />,
      color: '#1890ff',
      features: [
        'All Free features',
        'PDF/Word/Excel generation',
        'Basic analytics & reports',
        '100 document uploads/month',
        '1000 API calls/month',
        '100 AI requests/month',
        'Up to 10 team members',
        'Up to 5 monitoring stations',
        'Up to 3 camera feeds',
        '2 hours video analysis',
        'Email support (24h response)'
      ],
      limits: {
        uploads: 100,
        apiCalls: 1000,
        teamMembers: 10,
        cameras: 3,
        videoMinutes: 120,
        aiRequests: 100
      },
      requiresPayment: true
    },
    pro: {
      id: 'pro',
      name: isAdmin ? 'Enterprise' : 'Professional',
      icon: <CrownOutlined />,
      color: '#722ed1',
      features: isAdmin ? [
        'All Professional features',
        'Unlimited document uploads',
        'Custom API limits',
        'Unlimited team members',
        'Unlimited camera feeds',
        'Custom AI model training',
        'White-label solution',
        'On-premise deployment',
        'Dedicated infrastructure',
        'Custom integrations (API)',
        'Dedicated account manager',
        '24/7 priority support',
        'SLA 99.9% uptime',
        'Custom training sessions'
      ] : [
        'All Basic features',
        'ML-powered image analysis',
        'Video analysis & monitoring',
        'Advanced analytics dashboard',
        '500 document uploads/month',
        '5000 API calls/month',
        '500 AI requests/month',
        'Up to 50 team members',
        'Up to 20 monitoring stations',
        'Up to 10 camera feeds',
        '10 hours video analysis',
        'Real-time safety alerts',
        'Custom workflows',
        'Priority email support (4h response)',
        'Phone support'
      ],
      limits: {
        uploads: isAdmin ? 'Unlimited' : 500,
        apiCalls: isAdmin ? 'Custom' : 5000,
        teamMembers: isAdmin ? 'Unlimited' : 50,
        cameras: isAdmin ? 'Unlimited' : 10,
        videoMinutes: isAdmin ? 'Custom' : 600,
        aiRequests: isAdmin ? 'Custom' : 500
      },
      requiresPayment: true
    },
    enterprise: {
      id: 'enterprise',
      name: isAdmin ? 'Enterprise Plus' : 'Enterprise',
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
        'Dedicated infrastructure',
        'Custom integrations (API)',
        'Dedicated account manager',
        '24/7 priority support',
        'SLA 99.9% uptime',
        'Custom training sessions'
      ],
      limits: {
        uploads: 'Unlimited',
        apiCalls: 'Custom',
        teamMembers: 'Unlimited',
        cameras: 'Unlimited',
        videoMinutes: 'Custom',
        aiRequests: 'Custom'
      },
      requiresPayment: true
    }
  };

  // ✅ Custom Enterprise plan for admin users
  const customEnterprisePlan = {
    id: 'custom',
    name: 'Custom Enterprise',
    icon: <CrownOutlined />,
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
    requiresPayment: true
  };

  const currentPlanInfo = planDefinitions[currentPlanName.toLowerCase()] || planDefinitions.free;

  // ============================================
  // ✅ UNIVERSAL NAVIGATION FUNCTION
  // ============================================
  const navigateTo = (path) => {
    console.log(`🔄 Navigating to: ${path}`);
    console.log(`📍 Current path: ${window.location.pathname}`);
    
    if (window.location.pathname === path) {
      console.log('✅ Already on target page');
      return;
    }
    
    try {
      if (history && typeof history.push === 'function') {
        history.push(path);
        console.log('✅ Navigated using history.push');
        
        setTimeout(() => {
          if (!window.location.pathname.includes(path)) {
            console.log('⚠️ history.push didn\'t navigate, using fallback');
            window.location.href = path;
          }
        }, 300);
        return;
      }
    } catch (e) {
      console.warn('⚠️ history.push failed:', e);
    }
    
    console.log('🔄 Using window.location fallback');
    window.location.href = path;
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleGoToPlanSelection = () => {
    navigateTo('/select-plan');
  };

  const handleGetStarted = (planId) => {
    if (planId === currentPlanName.toLowerCase()) {
      message.info(`You are already on the ${planId.toUpperCase()} plan`);
      return;
    }

    if (userStage === 'needs_plan') {
      message.info('Please complete your registration first.');
      handleGoToPlanSelection();
      return;
    }

    if (planId === 'free') {
      updateToPlan('free');
    } else if (planId === 'custom') {
      // ✅ Custom Enterprise - contact sales
      message.info('Please contact our sales team for custom enterprise pricing.');
      navigateTo('/contact-sales');
    } else {
      setSelectedPlan(planId);
      setShowPaymentModal(true);
    }
  };

  const updateToPlan = async (planId) => {
    try {
      const response = await api.post('/user/update-plan', { plan: planId });
      if (response.data.success) {
        updateUserPlan(planId);
        message.success(`Plan updated to ${planId.toUpperCase()} successfully!`);
        if (planId !== 'free') {
          localStorage.removeItem('userStage');
          localStorage.removeItem('requires_plan_selection');
        }
        navigateTo('/dashboard');
      }
    } catch (error) {
      message.error('Failed to update plan. Please try again.');
    }
  };

  // ============================================
  // PAYMENT HANDLERS
  // ============================================
  const initializePaystackPayment = async () => {
    if (!selectedPlan || !pricingData) return;
    
    setInitializingPayment(true);
    try {
      const pricing = pricingData[selectedPlan];
      const amount = pricing[selectedDuration];
      
      if (amount === "Custom") {
        message.info('Please contact sales for custom pricing');
        setShowPaymentModal(false);
        return;
      }

      const paymentData = {
        plan: selectedPlan,
        country: selectedCountry,
        duration: selectedDuration,
        amount: amount,
        currency: pricing.currency,
        email: user?.email || '',
        user_id: user?.id,
        user_type: user?.user_type || 'user',
        company_name: user?.company_name || '',
        callback_url: `${window.location.origin}/payment-callback?method=paystack&signup=true`,
        metadata: {
          plan: selectedPlan,
          duration: selectedDuration,
          country: selectedCountry,
          userId: user?.id,
          currentPlan: currentPlanName,
          payment_method: 'paystack',
          isSignup: false
        }
      };
      
      console.log('🔵 Initializing Paystack payment:', paymentData);
      
      const response = await PaymentService.initializePaystackPayment(paymentData);
      
      const authUrl = response?.authorization_url || 
                     response?.data?.authorization_url || 
                     response?.result?.authorization_url;
      
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        console.error('❌ No authorization_url:', response);
        message.error('Failed to initialize Paystack payment');
      }
      
    } catch (error) {
      console.error('❌ Paystack payment error:', error);
      message.error(error.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setInitializingPayment(false);
      setShowPaymentModal(false);
    }
  };

  const initializePayPalPayment = async () => {
    if (!selectedPlan || !pricingData) return;
    
    setInitializingPayment(true);
    try {
      const pricing = pricingData[selectedPlan];
      const amount = pricing[selectedDuration];
      
      if (amount === "Custom") {
        message.info('Please contact sales for custom pricing');
        setShowPaymentModal(false);
        return;
      }

      const paymentData = {
        plan: selectedPlan,
        country: selectedCountry,
        duration: selectedDuration,
        amount: amount,
        currency: pricing.currency,
        email: user?.email || '',
        user_id: user?.id,
        user_type: user?.user_type || 'user',
        company_name: user?.company_name || '',
        callback_url: `${window.location.origin}/payment-callback?method=paypal&signup=true`,
        metadata: {
          plan: selectedPlan,
          duration: selectedDuration,
          country: selectedCountry,
          userId: user?.id,
          currentPlan: currentPlanName,
          payment_method: 'paypal',
          isSignup: false
        }
      };

      console.log('🔵 Initializing PayPal payment:', paymentData);
      
      const response = await PaymentService.initializePayPalPayment(paymentData);
      
      let approvalUrl = response?.approval_url || 
                       response?.data?.approval_url || 
                       response?.result?.approval_url ||
                       (Array.isArray(response?.links) && response.links.find(l => l.rel === 'approval_url')?.href);
      
      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        console.error('❌ No approval URL:', response);
        message.error('Failed to initialize PayPal payment');
      }
      
    } catch (error) {
      console.error('❌ PayPal payment error:', error);
      message.error(error.message || 'Failed to initialize payment. Please try again.');
    } finally {
      setInitializingPayment(false);
      setShowPaymentModal(false);
    }
  };

  const initializeRazorpayPayment = async () => {
    if (!selectedPlan || !pricingData) return;
    
    setInitializingPayment(true);
    try {
      const pricing = pricingData[selectedPlan];
      const amount = pricing[selectedDuration];
      
      if (amount === "Custom") {
        message.info('Please contact sales for custom pricing');
        setShowPaymentModal(false);
        return;
      }

      const paymentData = {
        plan: selectedPlan,
        country: selectedCountry,
        duration: selectedDuration,
        amount: amount,
        currency: pricing.currency,
        email: user?.email || '',
        user_id: user?.id,
        callback_url: `${window.location.origin}/payment-callback?method=razorpay`,
        metadata: {
          plan: selectedPlan,
          duration: selectedDuration,
          country: selectedCountry,
          userId: user?.id,
          currentPlan: currentPlanName,
          payment_method: 'razorpay'
        }
      };

      const response = await PaymentService.initializeRazorpayPayment(paymentData);
      
      if (response.order_id) {
        const options = {
          key: response.key_id,
          amount: response.amount,
          currency: response.currency,
          name: 'SafetyTrack Pro',
          description: `${selectedPlan.toUpperCase()} Plan Subscription`,
          order_id: response.order_id,
          handler: function(response) {
            verifyRazorpayPayment(response);
          },
          prefill: {
            email: user?.email,
            contact: user?.phone
          },
          theme: {
            color: '#1890ff'
          }
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        message.error('Failed to initialize Razorpay payment');
      }
      
    } catch (error) {
      console.error('Razorpay payment error:', error);
      message.error('Failed to initialize payment. Please try again.');
    } finally {
      setInitializingPayment(false);
      setShowPaymentModal(false);
    }
  };

  const verifyRazorpayPayment = async (paymentResponse) => {
    try {
      const verificationData = {
        order_id: paymentResponse.razorpay_order_id,
        payment_id: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature,
        plan: selectedPlan,
        duration: selectedDuration,
        amount: pricingData[selectedPlan][selectedDuration],
        currency: pricingData[selectedPlan].currency
      };
      
      const response = await PaymentService.verifyRazorpayPayment(verificationData);
      
      if (response.success) {
        message.success('Payment successful! Your plan has been upgraded.');
        updateToPlan(selectedPlan);
        navigateTo('/dashboard');
      } else {
        message.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Razorpay verification error:', error);
      message.error('Payment verification failed');
    }
  };

  const showMobileMoneyInstructions = async (method) => {
    try {
      const pricing = pricingData[selectedPlan];
      const amount = pricing[selectedDuration];
      
      let networkName = '';
      let phoneNumber = '';
      let ussdCode = '';
      
      if (method.id === 'mtn_momo_manual') {
        networkName = 'MTN Mobile Money';
        phoneNumber = '0553841216';
        ussdCode = '*170#';
      } else if (method.id === 'telecel_cash_manual') {
        networkName = 'Telecel Cash';
        phoneNumber = '020XXXXXXX';
        ussdCode = '*110#';
      } else {
        networkName = 'AT Money';
        phoneNumber = '027XXXXXXX';
        ussdCode = '*555#';
      }
      
      Modal.info({
        title: `${networkName} Payment Instructions`,
        width: 650,
        content: (
          <div>
            <Alert
              message="Manual Mobile Money Payment"
              description={`For ${selectedPlan.toUpperCase()} Plan (${selectedDuration.replace('_', ' ')})`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Amount">
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {PaymentService.formatCurrency(amount, pricing.currency)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Plan">{selectedPlan.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="Duration">{selectedDuration.replace('_', ' ')}</Descriptions.Item>
              <Descriptions.Item label="Network">{networkName}</Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                <Text strong copyable>{phoneNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Account Name">
                <Text strong>Aadm Fusheini</Text>
              </Descriptions.Item>
            </Descriptions>

            <Card title="Payment Instructions" size="small" style={{ marginBottom: 16 }}>
              <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Dial <Text code strong>{ussdCode}</Text> on your phone</li>
                <li>Select "Send Money" or "Transfer to MoMo user"</li>
                <li>Enter the number: <Text strong>{phoneNumber}</Text></li>
                <li>Enter the exact amount: <Text strong>{PaymentService.formatCurrency(amount, pricing.currency)}</Text></li>
                <li>Enter your PIN to confirm</li>
                <li>Use your email (<Text code>{user?.email}</Text>) as reference</li>
                <li>Save the transaction ID/reference number</li>
              </ol>
            </Card>

            <Alert
              message="Important Instructions"
              description={
                <div>
                  <p>✓ Save your transaction ID after payment</p>
                  <p>✓ Use your email address as payment reference</p>
                  <p>✓ Click "I Have Sent Payment" after completing the transfer</p>
                  <p>✓ Our team will verify within 24 hours</p>
                  <p>✓ You'll receive activation email once verified</p>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Space>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => createManualPaymentRecord(method.id)}
                >
                  I Have Sent Payment
                </Button>
                <Button 
                  size="large"
                  onClick={() => {
                    navigator.clipboard.writeText(phoneNumber);
                    message.success('Phone number copied!');
                  }}
                >
                  Copy Number
                </Button>
              </Space>
            </div>
          </div>
        )
      });
    } catch (error) {
      console.error('Error showing mobile money instructions:', error);
      message.error('Failed to load payment details');
    }
  };

  const showManualPaymentInstructions = async (method) => {
    try {
      const pricing = pricingData[selectedPlan];
      const amount = pricing[selectedDuration];
      
      let bankName = '';
      let accountNumber = '';
      let swiftCode = '';
      
      if (method.id === 'qnb') {
        bankName = 'QNB (Qatar National Bank)';
        accountNumber = 'QA12 3456 7890 1234 5678 90';
        swiftCode = 'QNBAQAQA';
      } else if (method.id === 'gc_bank_manual') {
        bankName = 'GCB Bank (Ghana)';
        accountNumber = '1234567890123';
        swiftCode = 'GCBGGHAC';
      } else if (method.id === 'cal_bank_manual') {
        bankName = 'CalBank (Ghana)';
        accountNumber = '2345678901234';
        swiftCode = 'CALBGHAC';
      } else {
        bankName = 'International Bank Transfer';
        accountNumber = 'Contact Support';
        swiftCode = 'Contact Support';
      }
      
      Modal.info({
        title: `${bankName} Transfer Instructions`,
        width: 650,
        content: (
          <div>
            <Alert
              message="Manual Bank Transfer"
              description={`For ${selectedPlan.toUpperCase()} Plan (${selectedDuration.replace('_', ' ')})`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Amount">
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {PaymentService.formatCurrency(amount, pricing.currency)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Plan">{selectedPlan.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="Duration">{selectedDuration.replace('_', ' ')}</Descriptions.Item>
              <Descriptions.Item label="Bank">{bankName}</Descriptions.Item>
              <Descriptions.Item label="Account Number">
                <Text strong copyable>{accountNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="SWIFT Code" hidden={!swiftCode}>
                <Text strong copyable>{swiftCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Account Name">
                <Text strong>SafetyTrack Pro Ltd</Text>
              </Descriptions.Item>
            </Descriptions>

            <Card title="Transfer Instructions" size="small" style={{ marginBottom: 16 }}>
              <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Log into your internet banking or mobile app</li>
                <li>Add "{bankName}" as a new payee</li>
                <li>Enter account number: <Text strong>{accountNumber}</Text></li>
                <li>Account name: <Text strong>SafetyTrack Pro Ltd</Text></li>
                <li>Enter amount: <Text strong>{PaymentService.formatCurrency(amount, pricing.currency)}</Text></li>
                <li>Use your email (<Text code>{user?.email}</Text>) as reference</li>
                <li>Save the transaction receipt/screenshot</li>
              </ol>
            </Card>

            <Alert
              message="Important Instructions"
              description={
                <div>
                  <p>✓ Save your transaction receipt after transfer</p>
                  <p>✓ Use your email address as payment reference</p>
                  <p>✓ Click "I Have Sent Payment" after completing the transfer</p>
                  <p>✓ Email receipt to: payments@safetytrack.com</p>
                  <p>✓ Our team will verify within 24 hours</p>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Space>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => createManualPaymentRecord(method.id)}
                >
                  I Have Sent Payment
                </Button>
                <Button 
                  size="large"
                  onClick={() => {
                    window.location.href = `mailto:payments@safetytrack.com?subject=Manual Payment - ${selectedPlan.toUpperCase()}&body=Please find attached my payment receipt for ${selectedPlan} plan (${selectedDuration.replace('_', ' ')}). Amount: ${PaymentService.formatCurrency(amount, pricing.currency)}`;
                  }}
                >
                  Email Receipt
                </Button>
              </Space>
            </div>
          </div>
        )
      });
    } catch (error) {
      console.error('Error showing manual payment instructions:', error);
      message.error('Failed to load payment details');
    }
  };

  const createManualPaymentRecord = async (methodId) => {
    try {
      const pricing = pricingData[selectedPlan];
      const paymentData = {
        user_id: user?.id || null,
        amount: pricing[selectedDuration],
        currency: pricing.currency,
        plan: selectedPlan,
        duration: selectedDuration,
        payment_method: methodId,
        status: 'pending_verification',
        current_plan: currentPlanName,
        payment_details: JSON.stringify({
          country: selectedCountry,
          plan: selectedPlan,
          duration: selectedDuration,
          timestamp: new Date().toISOString(),
          method: methodId
        })
      };

      await PaymentService.createPaymentRecord(paymentData);
      
      sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
      sessionStorage.setItem('paymentMethod', methodId);
      sessionStorage.setItem('selectedPlan', selectedPlan);
      sessionStorage.setItem('selectedCountry', selectedCountry);
      sessionStorage.setItem('currentPlan', currentPlanName);
      
      message.success('Payment record created! Our team will verify within 24 hours.');
      navigateTo('/payment-waiting');
      
    } catch (error) {
      console.error('Error creating manual payment record:', error);
      message.error('Failed to create payment record');
      navigateTo('/payment-waiting?error=record_failed');
    }
  };

  const getDurationLabel = (duration) => {
    const labels = {
      '1_month': 'Monthly',
      '6_month': '6 Months',
      '1_year': 'Annual'
    };
    return labels[duration] || duration;
  };

  const getMethodIcon = (methodId) => {
    switch (methodId) {
      case 'paypal':
        return <PayCircleOutlined style={{ color: '#003087', fontSize: '28px' }} />;
      case 'paystack':
        return <CreditCardOutlined style={{ color: '#1890ff', fontSize: '28px' }} />;
      case 'razorpay':
        return <QqOutlined style={{ color: '#0B5FFF', fontSize: '28px' }} />;
      case 'mtn_momo_manual':
      case 'telecel_cash_manual':
      case 'at_money_manual':
        return <MobileOutlined style={{ color: '#52c41a', fontSize: '28px' }} />;
      case 'bank_transfer':
      case 'qnb':
      case 'gc_bank_manual':
      case 'cal_bank_manual':
        return <BankOutlined style={{ color: '#666', fontSize: '28px' }} />;
      default:
        return <BankOutlined style={{ color: '#666', fontSize: '28px' }} />;
    }
  };

  const getPaymentMethodsForCountry = () => {
    const baseMethods = {
      onlineMethods: [
        { id: 'paystack', name: 'Paystack / Credit Card', type: 'online', description: 'Pay with Credit/Debit Card - Instant activation', icon: 'paystack' },
        { id: 'paypal', name: 'PayPal', type: 'online', description: 'Secure PayPal payment - Instant activation', icon: 'paypal' }
      ],
      bankMethods: [
        { id: 'bank_transfer', name: 'International Bank Transfer', type: 'bank', description: 'SWIFT wire transfer - Manual verification', icon: 'bank' }
      ]
    };

    if (selectedCountry === 'India') {
      baseMethods.onlineMethods.push({ id: 'razorpay', name: 'Razorpay', type: 'online', description: 'UPI, Cards, Net Banking - Instant activation', icon: 'razorpay' });
      baseMethods.bankMethods = [
        { id: 'bank_transfer', name: 'Bank Transfer (NEFT/RTGS)', type: 'bank', description: 'Indian bank transfer - Manual verification', icon: 'bank' }
      ];
    }

    if (selectedCountry === 'Qatar') {
      baseMethods.bankMethods.push({ id: 'qnb', name: 'QNB Bank Transfer', type: 'bank', description: 'Direct transfer to QNB account - Manual verification', icon: 'bank' });
    }

    if (selectedCountry === 'Ghana') {
      baseMethods.mobileMoneyMethods = [
        { id: 'mtn_momo_manual', name: 'MTN Mobile Money', type: 'mobile_money', network: 'MTN', description: 'Send payment to MTN MoMo number - Manual verification', icon: 'mtn' },
        { id: 'telecel_cash_manual', name: 'Telecel Cash', type: 'mobile_money', network: 'Telecel', description: 'Send payment to Telecel Cash number - Manual verification', icon: 'telecel' },
        { id: 'at_money_manual', name: 'AT Money', type: 'mobile_money', network: 'AT', description: 'Send payment to AT Money number - Manual verification', icon: 'at' }
      ];
      baseMethods.bankMethods = [
        { id: 'gc_bank_manual', name: 'GCB Bank Transfer', type: 'bank', description: 'Manual bank transfer to GCB - 24h verification', icon: 'bank' },
        { id: 'cal_bank_manual', name: 'CalBank Transfer', type: 'bank', description: 'Manual bank transfer to CalBank - 24h verification', icon: 'bank' }
      ];
    }

    return baseMethods;
  };

  const countryMethods = getPaymentMethodsForCountry();
  const displayOnlineMethods = countryMethods.onlineMethods;
  const displayMobileMoneyMethods = countryMethods.mobileMoneyMethods || [];
  const displayBankMethods = countryMethods.bankMethods;

  const handlePaymentMethodSelect = async (method) => {
    if (method.id === 'paystack') {
      await initializePaystackPayment();
    } else if (method.id === 'paypal') {
      await initializePayPalPayment();
    } else if (method.id === 'razorpay') {
      await initializeRazorpayPayment();
    } else if (method.id === 'mtn_momo_manual' || method.id === 'telecel_cash_manual' || method.id === 'at_money_manual') {
      showMobileMoneyInstructions(method);
    } else if (method.id === 'bank_transfer' || method.id === 'qnb' || method.id === 'gc_bank_manual' || method.id === 'cal_bank_manual') {
      showManualPaymentInstructions(method);
    }
  };

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    if (user?.plan) {
      const normalizedPlan = normalizePlanName(user.plan);
      setCurrentPlanName(normalizedPlan);
    }
    
    const stage = localStorage.getItem('userStage') || 'complete';
    setUserStage(stage);
    
    loadPricingData();
    loadUsageData();
  }, [user, selectedCountry]);

  const loadPricingData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/plans/pricing?country=${selectedCountry}`);
      if (response.data) {
        setPricingData(response.data);
      } else {
        const staticData = PaymentService.getStaticPricing(selectedCountry);
        setPricingData(staticData);
      }
    } catch (error) {
      console.error('Failed to load pricing:', error);
      const staticData = PaymentService.getStaticPricing(selectedCountry);
      setPricingData(staticData);
    }

    try {
      const methods = await PaymentService.getPaymentMethods(selectedCountry);
      if (Array.isArray(methods) && methods.length > 0) {
        setPaymentMethods(methods);
      } else {
        const defaultMethods = PaymentService.getDefaultPaymentMethods(selectedCountry);
        setPaymentMethods(defaultMethods);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      const defaultMethods = PaymentService.getDefaultPaymentMethods(selectedCountry);
      setPaymentMethods(defaultMethods);
    }
    setLoading(false);
  };

  const loadUsageData = async () => {
    if (!user) return;
    
    try {
      const response = await api.get('/usage/current');
      if (response.data) {
        setUsageData(response.data);
      }
    } catch (error) {
      console.error('Error loading usage data:', error);
      const limits = planData?.limits || planDefinitions[currentPlanName]?.limits || {};
      setUsageData({
        uploads: { used: 0, total: limits.uploads || 5 },
        apiCalls: { used: 0, total: limits.apiCalls || 50 },
        teamMembers: { used: 1, total: limits.teamMembers || 1 },
        videoMinutes: { used: 0, total: limits.videoMinutes || 10 },
        aiRequests: { used: 0, total: limits.aiRequests || 10 }
      });
    }
  };

  // ============================================
  // RENDER
  // ============================================
  
  // Show loading state
  if (loading && !pricingData) {
    return (
      <div className="pricing-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <Paragraph style={{ marginTop: 16 }}>Loading pricing information...</Paragraph>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ONLY show the alert if:
  // 1. User needs to select a plan
  // 2. User is logged in
  // 3. NOT already on select-plan page (prevents loop)
  if (userStage === 'needs_plan' && user && !isOnSelectPlan) {
    console.log('⚠️ Showing registration alert (not on select-plan)');
    return (
      <div className="pricing-page">
        <div className="container">
          <Alert
            message="Complete Your Registration"
            description="Please complete your registration and verify your email before selecting a plan."
            type="warning"
            showIcon
            style={{ maxWidth: 600, margin: '40px auto' }}
            action={
              <Button 
                type="primary" 
                onClick={handleGoToPlanSelection}
                size="large"
              >
                Go to Plan Selection
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  // ✅ If on select-plan or stage is complete, render the pricing page normally
  console.log('📊 Rendering normal pricing page');
  
  // ============================================
  // MAIN RENDER - Shows pricing plans
  // ============================================
  return (
    <div className="pricing-page">
      <div className="container">
        <div className="page-header">
          <Title level={1}>{isAdmin ? 'Enterprise Plans' : 'Pricing & Plans'}</Title>
          <Paragraph>
            {isAdmin 
              ? 'Choose the perfect enterprise plan for your organization' 
              : 'Choose the perfect plan for your organization with transparent pricing'}
          </Paragraph>
          
          {user && (
            <Alert
              message={
                <Space>
                  <span>Your Current Plan:</span>
                  <Badge 
                    color={currentPlanInfo.color}
                    text={<strong>{currentPlanInfo.name}</strong>}
                  />
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => navigateTo('/profile?tab=subscription')}
                  >
                    View Details
                  </Button>
                </Space>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16, maxWidth: '500px', margin: '0 auto' }}
            />
          )}
        </div>

        {/* ✅ Country and Duration Selection - Only show for non-admin users */}
        {!isAdmin && (
          <div className="selection-section">
            <Space size="large" style={{ marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className="selection-group">
                <Text strong>Country: </Text>
                <Select
                  value={selectedCountry}
                  onChange={setSelectedCountry}
                  style={{ width: 200, marginLeft: 8 }}
                  disabled={loading}
                >
                  <Option value="Ghana">Ghana 🇬🇭</Option>
                  <Option value="Qatar">Qatar 🇶🇦</Option>
                  <Option value="India">India 🇮🇳</Option>
                  <Option value="United States">United States 🇺🇸</Option>
                  <Option value="default">Other Countries 🌍</Option>
                </Select>
              </div>
              
              <div className="selection-group">
                <Text strong>Billing Cycle: </Text>
                <Select
                  value={selectedDuration}
                  onChange={setSelectedDuration}
                  style={{ width: 140, marginLeft: 8 }}
                  disabled={loading}
                >
                  <Option value="1_month">Monthly</Option>
                  <Option value="6_month">6 Months</Option>
                  <Option value="1_year">Annual</Option>
                </Select>
              </div>
            </Space>
          </div>
        )}

        {/* ✅ Pricing Cards - Admin View */}
        {isAdmin ? (
          <Row gutter={[32, 32]} justify="center">
            {/* Enterprise Plan */}
            <Col xs={24} md={8}>
              <Card 
                className="pricing-card featured"
                style={{
                  border: '2px solid #722ed1'
                }}
                actions={[
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => handleGetStarted('pro')}
                    loading={loading}
                    block
                    style={{ background: '#722ed1', borderColor: '#722ed1' }}
                  >
                    {currentPlanName === 'pro' ? 'Current Plan' : 'Select Enterprise'}
                  </Button>
                ]}
              >
                <div className="recommended-badge">
                  <Tag color="blue" style={{ fontSize: '12px', padding: '2px 8px' }}>
                    <CrownOutlined /> Recommended
                  </Tag>
                </div>
                
                <div className="plan-header" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }}>
                    <CrownOutlined />
                  </div>
                  <Title level={3}>Enterprise</Title>
                  <div className="price" style={{ fontSize: '36px', fontWeight: 'bold', color: '#722ed1' }}>
                    Custom Pricing
                  </div>
                  <Text type="secondary">Tailored to your organization</Text>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div className="features">
                  <Title level={5} style={{ marginBottom: '12px' }}>Key Features:</Title>
                  <List
                    size="small"
                    dataSource={planDefinitions.pro.features}
                    renderItem={(item) => (
                      <List.Item style={{ padding: '4px 0', border: 'none' }}>
                        <CheckCircleOutlined style={{ color: '#722ed1', marginRight: '8px' }} />
                        <Text>{item}</Text>
                      </List.Item>
                    )}
                  />
                </div>

                {currentPlanName === 'pro' && (
                  <Alert
                    message="This is your current plan"
                    type="info"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </Card>
            </Col>

            {/* Custom Enterprise Plan */}
            <Col xs={24} md={8}>
              <Card 
                className="pricing-card custom-plan"
                style={{
                  border: '2px solid #fa8c16'
                }}
                actions={[
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={() => handleGetStarted('custom')}
                    loading={loading}
                    block
                    style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
                  >
                    Contact Sales
                  </Button>
                ]}
              >
                <div className="recommended-badge">
                  <Tag color="orange" style={{ fontSize: '12px', padding: '2px 8px' }}>
                    <RocketOutlined /> Premium
                  </Tag>
                </div>
                
                <div className="plan-header" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, color: '#fa8c16', marginBottom: 8 }}>
                    <RocketOutlined />
                  </div>
                  <Title level={3}>Custom Enterprise</Title>
                  <div className="price" style={{ fontSize: '36px', fontWeight: 'bold', color: '#fa8c16' }}>
                    Custom Pricing
                  </div>
                  <Text type="secondary">Fully tailored to your needs</Text>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div className="features">
                  <Title level={5} style={{ marginBottom: '12px' }}>Features:</Title>
                  <List
                    size="small"
                    dataSource={customEnterprisePlan.features}
                    renderItem={(item) => (
                      <List.Item style={{ padding: '4px 0', border: 'none' }}>
                        <CheckCircleOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                        <Text>{item}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          /* ✅ Pricing Cards - Regular User View */
          <Row gutter={[32, 32]} justify="center">
            {['free', 'basic', 'pro'].map((planId) => {
              const pricing = countryPricing?.[planId];
              const planInfo = planDefinitions[planId];
              const isCurrentPlan = planId === currentPlanName.toLowerCase();

              if (!pricing) return null;

              return (
                <Col xs={24} md={8} key={planId}>
                  <Card 
                    className={`pricing-card ${planId === 'pro' ? 'featured' : ''} ${isCurrentPlan ? 'current-plan' : ''}`}
                    style={{
                      border: isCurrentPlan ? `2px solid ${planInfo.color}` : 
                             planId === 'pro' ? '2px solid #1890ff' : undefined
                    }}
                    actions={[
                      <Button 
                        type={isCurrentPlan ? 'default' : planId === 'pro' ? 'primary' : 'default'}
                        size="large"
                        onClick={() => handleGetStarted(planId)}
                        loading={loading}
                        block
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? 'Current Plan' : 
                         planId === 'free' ? 'Get Started Free' : 'Select Plan'}
                      </Button>
                    ]}
                  >
                    {isCurrentPlan && (
                      <div className="current-plan-badge">
                        <Tag color={planInfo.color} style={{ fontSize: '12px', padding: '2px 8px' }}>
                          Your Plan
                        </Tag>
                      </div>
                    )}
                    
                    {planId === 'pro' && !isCurrentPlan && (
                      <div className="recommended-badge">
                        <Tag color="blue" style={{ fontSize: '12px', padding: '2px 8px' }}>
                          <CrownOutlined /> Most Popular
                        </Tag>
                      </div>
                    )}
                    
                    <div className="plan-header" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 32, color: planInfo.color, marginBottom: 8 }}>
                        {planInfo.icon}
                      </div>
                      <Title level={3} style={{ marginBottom: '8px' }}>
                        {planInfo.name} Plan
                      </Title>
                      <div className="price" style={{ fontSize: '36px', fontWeight: 'bold', color: '#1890ff' }}>
                        {typeof pricing[selectedDuration] === 'number' 
                          ? PaymentService.formatCurrency(pricing[selectedDuration], pricing.currency)
                          : 'Custom Pricing'}
                      </div>
                      <Text type="secondary">
                        per {getDurationLabel(selectedDuration).toLowerCase()}
                      </Text>
                      {selectedDuration !== '1_month' && typeof pricing[selectedDuration] === 'number' && pricing['1_month'] && (
                        <div style={{ marginTop: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Equivalent to {PaymentService.formatCurrency(pricing['1_month'], pricing.currency)}/month
                          </Text>
                        </div>
                      )}
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <div className="features">
                      <Title level={5} style={{ marginBottom: '12px' }}>Key Features:</Title>
                      <List
                        size="small"
                        dataSource={planInfo.features.slice(0, 6)}
                        renderItem={(item) => (
                          <List.Item style={{ padding: '4px 0', border: 'none' }}>
                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                            <Text>{item}</Text>
                          </List.Item>
                        )}
                      />
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <Text strong>Plan Limits:</Text>
                      <Row gutter={[8, 8]} style={{ marginTop: '8px' }}>
                        {Object.entries(planInfo.limits).slice(0, 4).map(([key, value]) => (
                          <Col span={12} key={key}>
                            <div style={{ fontSize: '11px', color: '#666' }}>
                              {key.replace(/([A-Z])/g, ' $1').toUpperCase()}:{' '}
                              <strong>{value}</strong>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>

                    {isCurrentPlan && (
                      <Alert
                        message="This is your current plan"
                        type="info"
                        showIcon
                        style={{ marginTop: 16 }}
                      />
                    )}
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* ✅ Enterprise Section - Hide for admin users (already shown above) */}
        {!isAdmin && (
          <div className="enterprise-section" style={{ marginTop: 48 }}>
            <Card className="enterprise-card">
              <Row gutter={[48, 24]} align="middle">
                <Col xs={24} md={14}>
                  <Title level={2}>Enterprise Solution</Title>
                  <Paragraph>
                    For large organizations with specific requirements, we offer fully customized 
                    enterprise solutions with dedicated support, custom integrations, and tailored pricing.
                  </Paragraph>
                  <div style={{ marginBottom: 16 }}>
                    <Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
                      Custom Pricing
                    </Title>
                    <Text type="secondary">Contact us for volume discounts and custom requirements</Text>
                  </div>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<RocketOutlined />}
                    onClick={() => handleGetStarted('enterprise')}
                    style={{ background: '#fa8c16', borderColor: '#fa8c16' }}
                  >
                    Contact Sales for Custom Quote
                  </Button>
                </Col>
                <Col xs={24} md={10}>
                  <div className="enterprise-features">
                    <Title level={5}>Enterprise Features:</Title>
                    {planDefinitions.enterprise.features.slice(0, 8).map((feature, index) => (
                      <div key={index} className="enterprise-feature" style={{ padding: '4px 0' }}>
                        <CheckCircleOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}

        {/* ✅ Current Plan Usage Summary - Only for non-admin users */}
        {!isAdmin && user && usageData && (
          <Card title="Your Current Usage" style={{ marginTop: 32 }}>
            <Row gutter={[16, 16]}>
              {Object.entries(usageData).map(([key, data]) => {
                if (data.total === 0 || data.total === 'Custom' || data.total === 'Unlimited') return null;
                
                const percentage = data.total === 'Unlimited' ? 0 : Math.min((data.used / data.total) * 100, 100);
                return (
                  <Col xs={24} sm={12} md={6} key={key}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: currentPlanInfo.color }}>
                          {data.used}/{data.total}
                        </div>
                        <Text style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Text>
                        {percentage > 0 && (
                          <Progress 
                            percent={percentage} 
                            size="small" 
                            strokeColor={currentPlanInfo.color}
                            style={{ marginTop: 8 }}
                          />
                        )}
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>
        )}

        {/* ✅ Payment Method Selection Modal - Only for non-admin users */}
        {!isAdmin && (
          <Modal
            title={`Complete Your ${selectedPlan ? selectedPlan.toUpperCase() : ''} Plan Upgrade`}
            open={showPaymentModal}
            onCancel={() => setShowPaymentModal(false)}
            footer={null}
            width={750}
            closable={true}
            className="payment-modal"
          >
            {selectedPlan && countryPricing && countryPricing[selectedPlan] && (
              <div>
                <Alert
                  message="Order Summary"
                  description={
                    <div style={{ marginTop: 8 }}>
                      <Row gutter={[16, 8]}>
                        <Col span={12}>
                          <Text type="secondary">Selected Plan:</Text>
                          <div><Text strong style={{ fontSize: '16px' }}>{selectedPlan.toUpperCase()}</Text></div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Billing Cycle:</Text>
                          <div><Text strong>{getDurationLabel(selectedDuration)}</Text></div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Amount to Pay:</Text>
                          <div><Text strong style={{ fontSize: '24px', color: '#1890ff' }}>
                            {typeof countryPricing[selectedPlan][selectedDuration] === 'number'
                              ? PaymentService.formatCurrency(
                                  countryPricing[selectedPlan][selectedDuration], 
                                  countryPricing[selectedPlan].currency
                                )
                              : 'Custom Pricing'}
                          </Text></div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Current Plan:</Text>
                          <div><Tag color="default">{currentPlanName.toUpperCase()}</Tag> → <Tag color="blue">{selectedPlan.toUpperCase()}</Tag></div>
                        </Col>
                      </Row>
                    </div>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Divider orientation="left">Select Payment Method</Divider>

                {/* Online Payment Methods */}
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ fontSize: '16px' }}>💳 Instant Payment</Text>
                  <div style={{ marginTop: 12 }}>
                    {displayOnlineMethods.map((method) => (
                      <Card
                        key={method.id}
                        hoverable
                        onClick={() => handlePaymentMethodSelect(method)}
                        style={{ marginBottom: 12, cursor: 'pointer', borderRadius: '8px' }}
                        bodyStyle={{ padding: '16px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '32px' }}>
                              {getMethodIcon(method.id)}
                            </div>
                            <div>
                              <Text strong style={{ fontSize: '16px' }}>{method.name}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: '13px' }}>{method.description}</Text>
                            </div>
                          </div>
                          <div>
                            <Tag color="green" style={{ fontSize: '12px', padding: '4px 12px' }}>✓ INSTANT</Tag>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Mobile Money Payment Methods */}
                {displayMobileMoneyMethods.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <Text strong style={{ fontSize: '16px' }}>📱 Mobile Money (Manual)</Text>
                    <div style={{ marginTop: 12 }}>
                      {displayMobileMoneyMethods.map((method) => (
                        <Card
                          key={method.id}
                          hoverable
                          onClick={() => handlePaymentMethodSelect(method)}
                          style={{ marginBottom: 12, cursor: 'pointer', borderRadius: '8px' }}
                          bodyStyle={{ padding: '16px' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ fontSize: '32px' }}>
                                <MobileOutlined style={{ color: '#52c41a', fontSize: '28px' }} />
                              </div>
                              <div>
                                <Text strong style={{ fontSize: '16px' }}>{method.name}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '13px' }}>{method.description}</Text>
                              </div>
                            </div>
                            <div>
                              <Tag color="orange" style={{ fontSize: '12px', padding: '4px 12px' }}>⏱ MANUAL (24h)</Tag>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bank Transfer Payment Methods */}
                {displayBankMethods.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: '16px' }}>🏦 Bank Transfer</Text>
                    <div style={{ marginTop: 12 }}>
                      {displayBankMethods.map((method) => (
                        <Card
                          key={method.id}
                          hoverable
                          onClick={() => handlePaymentMethodSelect(method)}
                          style={{ marginBottom: 12, cursor: 'pointer', borderRadius: '8px' }}
                          bodyStyle={{ padding: '16px' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ fontSize: '32px' }}>
                                <BankOutlined style={{ color: '#666', fontSize: '28px' }} />
                              </div>
                              <div>
                                <Text strong style={{ fontSize: '16px' }}>{method.name}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '13px' }}>{method.description}</Text>
                              </div>
                            </div>
                            <div>
                              <Tag color="orange" style={{ fontSize: '12px', padding: '4px 12px' }}>⏱ MANUAL (24h)</Tag>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {initializingPayment && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Spin indicator={<LoadingOutlined />} /> Initializing payment...
                  </div>
                )}

                <div style={{ marginTop: 24, padding: '16px', background: '#f0f7ff', borderRadius: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>💡 Payment Information:</div>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>Online payments (Paystack/PayPal/Razorpay) are processed instantly</li>
                      <li>Mobile Money and Bank transfers require manual verification (1-24 hours)</li>
                      <li>All payments are secure and encrypted</li>
                      <li>Your new plan will be activated after payment confirmation</li>
                      <li>You will receive an email confirmation once payment is complete</li>
                    </ul>
                  </Text>
                </div>
              </div>
            )}
          </Modal>
        )}

        <Divider />

        {/* ✅ FAQ Section - Always visible */}
        <div className="faq-section">
          <Title level={3}>Frequently Asked Questions</Title>
          <Row gutter={[32, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <div>
                <Text strong>Can I switch plans anytime?</Text>
                <br />
                <Text type="secondary">
                  Yes! You can upgrade or downgrade your plan at any time. Downgrades will take effect at your next billing cycle.
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div>
                <Text strong>What happens to my data if I downgrade?</Text>
                <br />
                <Text type="secondary">
                  Your data is preserved. You'll have view-only access to features beyond your new plan's limits.
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div>
                <Text strong>Do you offer discounts for annual payments?</Text>
                <br />
                <Text type="secondary">
                  Yes! Annual plans offer significant savings compared to monthly billing.
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div>
                <Text strong>Is there a free trial for paid plans?</Text>
                <br />
                <Text type="secondary">
                  All paid plans come with a 14-day free trial. No credit card required.
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div>
                <Text strong>Can I cancel anytime?</Text>
                <br />
                <Text type="secondary">
                  Yes, you can cancel your subscription at any time. No long-term contracts.
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div>
                <Text strong>What payment methods are available?</Text>
                <br />
                <Text type="secondary">
                  We support Paystack (Cards), PayPal, and Bank Transfers worldwide. Additional local methods are available for India (Razorpay), Qatar (QNB), and Ghana (Mobile Money).
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

// ✅ Export with withRouter to ensure router context
export default withRouter(PricingPage);