// src/pages/PaymentCallbackPage.js
import React, { useEffect, useState } from 'react';
import { Result, Button, Alert, Card, Typography, Space, Steps } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, PayPalOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import PaymentService from '../services/paymentService';

const { Title, Text } = Typography;
const { Step } = Steps;

function PaymentCallbackPage() {
  const [status, setStatus] = useState('processing');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    processPaymentCallback();
  }, []);

  const processPaymentCallback = async () => {
    const queryParams = new URLSearchParams(location.search);
    const reference = queryParams.get('reference') || queryParams.get('trxref') || queryParams.get('paymentId');
    const method = queryParams.get('method') || 'paystack';
    const token = queryParams.get('token');
    const payerId = queryParams.get('PayerID');
    
    setPaymentMethod(method);

    try {
      let verification;
      
      if (method === 'paypal' && token && payerId) {
        // PayPal callback with token and PayerID
        verification = await PaymentService.verifyPayPalPayment(token);
      } else if (reference) {
        // Paystack or other payment methods
        if (method === 'paystack') {
          verification = await PaymentService.verifyPaystackPayment(reference);
        } else {
          // Generic verification
          verification = { status: 'success', data: { reference } };
        }
      } else {
        throw new Error('No payment reference found');
      }
      
      if (verification.status === 'success') {
        setStatus('success');
        setPaymentData(verification.data);
        
        // Create payment record
        const paymentRecord = {
          amount: verification.data.amount ? verification.data.amount / 100 : 0,
          currency: verification.data.currency || 'USD',
          plan: verification.data.metadata?.plan || 'basic',
          duration: verification.data.metadata?.duration || '1_month',
          payment_method: method,
          status: 'completed',
          transaction_id: verification.data.id || reference,
          paystack_reference: method === 'paystack' ? reference : null,
          paypal_payment_id: method === 'paypal' ? verification.data.id : null,
          payment_details: JSON.stringify(verification.data),
          user_id: localStorage.getItem('userId') || verification.data.metadata?.userId
        };

        await PaymentService.createPaymentRecord(paymentRecord);
        
        // Create subscription if payment successful
        if (verification.data.metadata?.plan !== 'free') {
          await PaymentService.createSubscription({
            user_id: localStorage.getItem('userId') || verification.data.metadata?.userId,
            plan: verification.data.metadata?.plan || 'basic',
            status: 'active',
            payment_method: method,
            start_date: new Date().toISOString(),
            auto_renew: true
          });
        }
        
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case 'paypal':
        return <PayPalOutlined style={{ color: '#003087', fontSize: '24px', marginRight: '8px' }} />;
      case 'paystack':
        return <CreditCardOutlined style={{ color: '#1890ff', fontSize: '24px', marginRight: '8px' }} />;
      default:
        return null;
    }
  };

  const getResultConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '64px' }} />,
          title: 'Payment Successful!',
          subTitle: 'Your payment has been processed successfully.',
          extra: [
            <Button type="primary" key="dashboard" onClick={() => history.push('/dashboard')}>
              Go to Dashboard
            </Button>,
            <Button key="home" onClick={() => history.push('/')}>
              Back to Home
            </Button>
          ]
        };
      case 'failed':
        return {
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '64px' }} />,
          title: 'Payment Failed',
          subTitle: 'Your payment could not be processed. Please try again.',
          extra: [
            <Button type="primary" key="retry" onClick={() => history.push('/pricing')}>
              Try Again
            </Button>,
            <Button key="support" onClick={() => window.open('mailto:support@safetytrack.com')}>
              Contact Support
            </Button>
          ]
        };
      case 'error':
        return {
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '64px' }} />,
          title: 'Error Processing Payment',
          subTitle: 'There was an error processing your payment. Please contact support.',
          extra: [
            <Button key="home" onClick={() => history.push('/')}>
              Back to Home
            </Button>
          ]
        };
      default:
        return {
          icon: <LoadingOutlined style={{ color: '#1890ff', fontSize: '64px' }} />,
          title: 'Processing Payment...',
          subTitle: 'Please wait while we verify your payment.',
          extra: []
        };
    }
  };

  const resultConfig = getResultConfig();

  return (
    <div style={{ maxWidth: 700, margin: '50px auto', padding: '20px' }}>
      <Card>
        <Result {...resultConfig} />
        
        <div style={{ marginTop: 24 }}>
          <Steps current={status === 'success' ? 2 : status === 'failed' ? 1 : 0} size="small">
            <Step title="Payment Initiated" />
            <Step title="Processing" />
            <Step title="Completed" />
          </Steps>
        </div>
        
        {paymentData && status === 'success' && (
          <Alert
            message={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {getPaymentMethodIcon()}
                <span>Payment Details</span>
              </div>
            }
            description={
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text strong>Reference:</Text> {paymentData.reference || paymentData.id}
                </div>
                {paymentData.amount && (
                  <div>
                    <Text strong>Amount:</Text> {paymentData.currency || 'USD'} {(paymentData.amount / 100).toLocaleString()}
                  </div>
                )}
                {paymentData.metadata?.plan && (
                  <div>
                    <Text strong>Plan:</Text> {paymentData.metadata.plan.toUpperCase()}
                  </div>
                )}
                {paymentData.paid_at && (
                  <div>
                    <Text strong>Date:</Text> {new Date(paymentData.paid_at).toLocaleString()}
                  </div>
                )}
                <div>
                  <Text strong>Method:</Text> {paymentMethod?.toUpperCase()}
                </div>
              </Space>
            }
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          />
        )}
        
        {loading && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <LoadingOutlined style={{ fontSize: 24 }} />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Verifying payment...</Text>
            </div>
          </div>
        )}
        
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Text type="secondary">
            {status === 'success' 
              ? 'You will receive a payment confirmation email shortly.' 
              : 'If you have any issues, please contact our support team.'}
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default PaymentCallbackPage;