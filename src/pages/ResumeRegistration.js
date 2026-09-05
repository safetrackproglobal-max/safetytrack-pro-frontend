// src/pages/ResumeRegistration.js
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Spin, Result, Button, Alert, Card, Typography, Space, message } from 'antd';
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  LoadingOutlined,
  ArrowRightOutlined,
  BankOutlined,
  CreditCardOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

function ResumeRegistration() {
  const { user, refreshUser } = useAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [userStage, setUserStage] = useState(null);
  const [redirectPath, setRedirectPath] = useState('/');
  const [stageInfo, setStageInfo] = useState(null);

  useEffect(() => {
    const determineStage = async () => {
      try {
        // ✅ Check if user is authenticated
        const token = localStorage.getItem('token');
        const userData = user || JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!token || !userData) {
          // No user, go to login
          setRedirectPath('/login');
          setLoading(false);
          return;
        }

        // ✅ Get stage from localStorage or user data
        const stage = localStorage.getItem('userStage') || userData?.stage || 'complete';
        const requiresPayment = localStorage.getItem('requires_payment') === 'true' || userData?.requires_payment;
        const requiresPlanSelection = localStorage.getItem('requires_plan_selection') === 'true' || userData?.requires_plan_selection;
        const requiresCompanySetup = localStorage.getItem('requires_company_setup') === 'true' || userData?.requires_company_setup;
        const needsApproval = localStorage.getItem('requires_approval') === 'true' || userData?.needs_approval;
        const requiresVerification = localStorage.getItem('requires_verification') === 'true' || !userData?.verified;
        
        setUserStage(stage);

        // ✅ Determine the appropriate redirect
        let path = '/dashboard';
        let info = {};

        if (requiresVerification && !userData?.verified) {
          path = '/verify-email';
          info = {
            title: 'Email Verification Required',
            icon: <WarningOutlined style={{ color: '#faad14', fontSize: 48 }} />,
            message: 'Please verify your email address to continue.',
            description: 'We sent a verification code to your email. Please check your inbox.',
            buttonText: 'Verify Email',
            buttonAction: () => history.push('/verify-email')
          };
        } else if (stage === 'needs_plan' || requiresPlanSelection) {
          path = '/select-plan';
          info = {
            title: 'Complete Plan Selection',
            icon: <SafetyCertificateOutlined style={{ color: '#1890ff', fontSize: 48 }} />,
            message: 'Select a plan to activate your account.',
            description: 'Choose a plan that fits your needs and complete your registration.',
            buttonText: 'Select Plan',
            buttonAction: () => history.push('/select-plan')
          };
        } else if (stage === 'needs_payment' || requiresPayment) {
          path = '/payment';
          info = {
            title: 'Complete Payment',
            icon: <CreditCardOutlined style={{ color: '#faad14', fontSize: 48 }} />,
            message: 'Payment required to activate your plan.',
            description: 'Complete your payment to access all features of your selected plan.',
            buttonText: 'Complete Payment',
            buttonAction: () => history.push('/payment')
          };
        } else if (stage === 'needs_company_setup' || requiresCompanySetup) {
          path = '/company-setup';
          info = {
            title: 'Complete Company Setup',
            icon: <BankOutlined style={{ color: '#1890ff', fontSize: 48 }} />,
            message: 'Set up your company profile.',
            description: 'Complete your company details to get the most out of SafetyTrack Pro.',
            buttonText: 'Setup Company',
            buttonAction: () => history.push('/company-setup')
          };
        } else if (stage === 'needs_approval' || needsApproval) {
          path = '/pending-approval';
          info = {
            title: 'Pending Approval',
            icon: <LoadingOutlined style={{ color: '#1890ff', fontSize: 48 }} />,
            message: 'Your account is pending approval.',
            description: 'Our team is reviewing your application. You will be notified once approved.',
            buttonText: 'OK',
            buttonAction: () => history.push('/dashboard')
          };
        } else {
          // Complete - go to dashboard
          path = '/dashboard';
          info = {
            title: 'Welcome Back!',
            icon: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 48 }} />,
            message: 'Your account is fully set up.',
            description: 'Redirecting to your dashboard...',
            buttonText: 'Go to Dashboard',
            buttonAction: () => history.push('/dashboard')
          };
        }

        setRedirectPath(path);
        setStageInfo(info);

        // ✅ Auto-redirect after 3 seconds
        setTimeout(() => {
          history.push(path);
        }, 3000);

      } catch (error) {
        console.error('Error determining stage:', error);
        setRedirectPath('/login');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    determineStage();
  }, [user, history]);

  // If loading, show spinner
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Resuming your registration...</p>
      </div>
    );
  }

  // Show stage information
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
      <Card>
        <Result
          icon={stageInfo?.icon || <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 48 }} />}
          title={stageInfo?.title || 'Resuming Registration'}
          subTitle={
            <div>
              <Text>{stageInfo?.message}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 14 }}>
                {stageInfo?.description}
              </Text>
            </div>
          }
          extra={[
            <Button 
              key="continue" 
              type="primary" 
              size="large"
              onClick={() => {
                if (stageInfo?.buttonAction) {
                  stageInfo.buttonAction();
                } else {
                  history.push(redirectPath);
                }
              }}
              icon={<ArrowRightOutlined />}
            >
              {stageInfo?.buttonText || 'Continue'}
            </Button>
          ]}
        />

        <Alert
          message="You will be redirected automatically in a few seconds."
          type="info"
          showIcon
          style={{ marginTop: 24 }}
        />
      </Card>
    </div>
  );
}

export default ResumeRegistration;