// src/pages/PaymentWaitingPage.js
import React, { useEffect, useState } from 'react';
import { Card, Typography, Alert, Button, Space, Steps, Result, Upload, message } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, MailOutlined, UploadOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import PaymentService from '../services/paymentService';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

function PaymentWaitingPage() {
  const [paymentData, setPaymentData] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const history = useHistory();

  useEffect(() => {
    // ✅ Retrieve payment data from sessionStorage - CHECK BOTH KEY NAMES
    const storedData = sessionStorage.getItem('pendingPayment');
    const paymentRef = sessionStorage.getItem('paymentReference');
    const paymentStatus = sessionStorage.getItem('paymentStatus');
    const plan = sessionStorage.getItem('selectedPlan');
    const method = sessionStorage.getItem('paymentMethod');
    const amount = sessionStorage.getItem('paymentAmount');
    const currency = sessionStorage.getItem('paymentCurrency');
    
    // ✅ Also check for old key names
    const oldData = sessionStorage.getItem('paymentData');
    const oldRef = sessionStorage.getItem('paymentReference');
    
    console.log('🔍 PaymentWaitingPage: Reading sessionStorage data');
    console.log('  pendingPayment:', storedData);
    console.log('  paymentReference:', paymentRef);
    console.log('  paymentStatus:', paymentStatus);
    console.log('  selectedPlan:', plan);
    console.log('  paymentMethod:', method);
    console.log('  paymentAmount:', amount);
    console.log('  paymentCurrency:', currency);
    console.log('  oldData:', oldData);
    console.log('  oldRef:', oldRef);
    
    let data = null;
    let reference = null;
    
    // ✅ Try to get data from new keys first
    if (storedData) {
      try {
        data = JSON.parse(storedData);
        reference = data.payment_reference || paymentRef;
        console.log('✅ Parsed pendingPayment data:', data);
      } catch (e) {
        console.error('Error parsing pendingPayment:', e);
      }
    }
    
    // ✅ If no data from new keys, try old keys
    if (!data && oldData) {
      try {
        data = JSON.parse(oldData);
        reference = data.reference || oldRef;
        console.log('✅ Parsed old paymentData:', data);
      } catch (e) {
        console.error('Error parsing old paymentData:', e);
      }
    }
    
    // ✅ If still no data, build from individual items
    if (!data && paymentRef) {
      data = {
        payment_reference: paymentRef,
        status: paymentStatus || 'pending_verification',
        plan: plan || 'Unknown',
        payment_method: method || 'Unknown',
        amount: parseFloat(amount) || 0,
        currency: currency || 'USD'
      };
      reference = paymentRef;
      console.log('✅ Built data from individual items:', data);
    }
    
    // ✅ If still no data, use the old reference
    if (!data && oldRef) {
      data = {
        payment_reference: oldRef,
        status: 'pending_verification',
        plan: 'Unknown',
        payment_method: 'Unknown',
        amount: 0,
        currency: 'USD'
      };
      reference = oldRef;
      console.log('✅ Built data from old reference:', data);
    }
    
    if (data) {
      setPaymentData({ ...data, reference });
      
      // Start checking payment status
      if (reference) {
        checkPaymentStatus(reference);
      }
    } else {
      console.warn('⚠️ No payment data found in sessionStorage');
    }

    // Timer for elapsed time
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Periodically check payment status
    const statusInterval = setInterval(() => {
      if (reference && paymentStatus === 'pending') {
        checkPaymentStatus(reference);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(timer);
      clearInterval(statusInterval);
    };
  }, []);

  const checkPaymentStatus = async (reference) => {
    if (!reference || checkingStatus) return;
    
    setCheckingStatus(true);
    try {
      const statusData = await PaymentService.verifyPayment(reference);
      setPaymentStatus(statusData.status);
      
      if (statusData.status === 'verified') {
        message.success('Payment verified! Account will be activated shortly.');
      } else if (statusData.status === 'failed') {
        message.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
    setCheckingStatus(false);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUploadReceipt = async (file) => {
    try {
      const reference = sessionStorage.getItem('paymentReference');
      if (!reference) {
        message.error('No payment reference found');
        return false;
      }

      const result = await PaymentService.uploadReceipt(reference, file);
      message.success('Receipt uploaded successfully!');
      
      // Update payment record
      await PaymentService.submitPaymentConfirmation(reference, {
        receiptUploaded: true,
        fileName: file.name,
        uploadedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      message.error('Failed to upload receipt');
      console.error('Upload error:', error);
      return false;
    }
  };

  const handleResendEmail = async () => {
    try {
      const reference = sessionStorage.getItem('paymentReference');
      if (!reference) throw new Error('No payment reference');
      
      const emailData = {
        to: paymentData?.email || 'payments@safetypro.com',
        subject: `Payment Confirmation Reminder - ${reference}`,
        type: 'reminder'
      };
      
      await PaymentService.sendPaymentNotification(emailData);
      message.success('Reminder email sent successfully!');
    } catch (error) {
      message.error('Failed to send reminder email');
    }
  };

  const handleContactSupport = () => {
    const reference = sessionStorage.getItem('paymentReference') || 'No reference';
    const subject = `Payment Support Needed - ${reference}`;
    window.location.href = `mailto:support@safetypro.com?subject=${encodeURIComponent(subject)}`;
  };

  // ✅ If no payment data, show error with redirect option
  if (!paymentData) {
    return (
      <div style={{ padding: '50px 20px', textAlign: 'center' }}>
        <Alert
          message="No Payment Found"
          description="Please select a plan and payment method first."
          type="warning"
          showIcon
        />
        <div style={{ marginTop: 20 }}>
          <Button 
            type="primary" 
            onClick={() => history.push('/pricing')}
          >
            Go to Pricing
          </Button>
          <Button 
            style={{ marginLeft: 12 }}
            onClick={() => history.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getCurrentStep = () => {
    switch (paymentStatus) {
      case 'verified': return 3;
      case 'processing': return 2;
      case 'pending': return 1;
      default: return 1;
    }
  };

  // ✅ Extract data for display
  const displayData = {
    plan: paymentData.plan || paymentData.selectedPlan || 'Unknown',
    amount: paymentData.amount || 0,
    currency: paymentData.currency || 'USD',
    country: paymentData.country || 'Ghana',
    paymentMethod: paymentData.payment_method || paymentData.paymentMethod || 'Unknown',
    timestamp: paymentData.timestamp || paymentData.created_at || new Date().toISOString(),
    reference: paymentData.reference || paymentData.payment_reference || 'N/A'
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Card>
        <Result
          icon={
            paymentStatus === 'verified' ? 
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '64px' }} /> :
            <LoadingOutlined style={{ color: '#1890ff', fontSize: '64px' }} />
          }
          title={
            paymentStatus === 'verified' ? 
            'Payment Verified!' : 
            'Payment Verification in Progress'
          }
          subTitle={
            <div>
              <Text>{paymentStatus === 'verified' ? 
                'Your payment has been verified. Account activation in progress.' : 
                'Your payment is being verified by our team.'
              }</Text>
              <br />
              <Text type="secondary">Time elapsed: {formatTime(timeElapsed)}</Text>
              {displayData.reference && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Reference: <Text strong>{displayData.reference}</Text></Text>
                </div>
              )}
            </div>
          }
          extra={[
            <Button 
              type="primary" 
              key="contact" 
              onClick={handleContactSupport}
              icon={<MailOutlined />}
            >
              Contact Support
            </Button>,
            <Button key="home" onClick={() => history.push('/')}>
              Back to Home
            </Button>
          ]}
        />

        <div style={{ marginTop: 40 }}>
          <Steps current={getCurrentStep()} style={{ marginBottom: 40 }}>
            <Step title="Payment Initiated" description="Completed" />
            <Step title="Verification" description={
              paymentStatus === 'pending' ? 'In Progress' : 
              paymentStatus === 'processing' ? 'Processing' : 'Completed'
            } />
            <Step title="Account Activation" description={
              paymentStatus === 'verified' ? 'In Progress' : 'Pending'
            } />
            <Step title="Complete" description="Pending" />
          </Steps>

          <Alert
            message="Payment Details"
            description={
              <div>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Plan:</Text> {displayData.plan.toUpperCase()}
                  </div>
                  <div>
                    <Text strong>Amount:</Text> {displayData.currency} {displayData.amount}
                  </div>
                  <div>
                    <Text strong>Country:</Text> {displayData.country}
                  </div>
                  <div>
                    <Text strong>Payment Method:</Text> {displayData.paymentMethod.toUpperCase()}
                  </div>
                  <div>
                    <Text strong>Date:</Text> {new Date(displayData.timestamp).toLocaleString()}
                  </div>
                  <div>
                    <Text strong>Reference:</Text> <Text code>{displayData.reference}</Text>
                  </div>
                </Space>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Card title="Upload Payment Receipt" size="small" style={{ marginBottom: 24 }}>
            <Upload
              accept=".jpg,.jpeg,.png,.pdf"
              beforeUpload={handleUploadReceipt}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>
                Upload Receipt
              </Button>
            </Upload>
            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              Upload a screenshot or photo of your payment confirmation. 
              This helps us verify your payment faster.
            </Paragraph>
          </Card>

          <Card title="What Happens Next?" size="small">
            <Space direction="vertical" size="middle">
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text strong>Payment Received:</Text> Your payment has been initiated
              </div>
              <div>
                {paymentStatus === 'verified' ? 
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} /> :
                  <LoadingOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                }
                <Text strong>Manual Verification:</Text> {paymentStatus === 'verified' ? 
                  'Verified' : 'Our team is verifying your payment'}
              </div>
              <div>
                <LoadingOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                <Text strong>Account Activation:</Text> Once verified, your account will be activated
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text strong>Notification:</Text> You'll receive an activation email
              </div>
            </Space>
          </Card>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Title level={5}>Need Help?</Title>
            <Paragraph>
              <Text type="secondary">
                If you haven't received a confirmation within 24 hours, please:
              </Text>
            </Paragraph>
            <Space>
              <Button onClick={handleResendEmail}>
                Resend Confirmation Email
              </Button>
              <Button type="primary" onClick={handleContactSupport}>
                Contact Support Team
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PaymentWaitingPage;