import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Alert, Typography, Space, Progress, Row, Col, message } from 'antd';
import { 
  MailOutlined, 
  SafetyCertificateOutlined, 
  ReloadOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';
import './VerificationModal.css';

const { Title, Text } = Typography;

function VerificationModal({ email, onVerified, visible = true, onCancel }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [success, setSuccess] = useState('');
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  const { currentLanguage } = useLanguage();

  // ✅ Check if user is already verified
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        // Check localStorage for user data
        const userStr = localStorage.getItem('user');
        const pendingUserStr = localStorage.getItem('pendingUser');
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        let user = null;
        if (userStr) {
          try {
            user = JSON.parse(userStr);
          } catch (e) {}
        }
        
        if (!user && pendingUserStr) {
          try {
            user = JSON.parse(pendingUserStr);
          } catch (e) {}
        }
        
        // ✅ If user is already verified, close modal
        if (user && user.verified === true) {
          console.log('✅ User already verified, closing modal');
          setIsAlreadyVerified(true);
          
          // Clear verification flags
          localStorage.removeItem('requires_verification');
          
          // Call onVerified to proceed
          if (onVerified) {
            onVerified();
          }
          if (onCancel) {
            onCancel();
          }
          return;
        }
        
        // ✅ Check with backend if token exists
        if (token) {
          try {
            const response = await fetch('http://localhost:5000/api/user/status', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.verified === true) {
                console.log('✅ User verified on backend, closing modal');
                setIsAlreadyVerified(true);
                localStorage.setItem('user', JSON.stringify({ ...user, verified: true }));
                localStorage.removeItem('requires_verification');
                
                if (onVerified) {
                  onVerified();
                }
                if (onCancel) {
                  onCancel();
                }
                return;
              }
            }
          } catch (e) {
            console.log('⚠️ Could not check verification status with backend');
          }
        }
        
        setIsAlreadyVerified(false);
        
      } catch (e) {
        console.log('⚠️ Error checking verification status:', e);
        setIsAlreadyVerified(false);
      }
    };
    
    if (visible) {
      checkVerificationStatus();
    }
  }, [visible, email, onVerified, onCancel]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible && !isAlreadyVerified) {
      setCode('');
      setError('');
      setSuccess('');
      setVerificationAttempts(0);
      setResendCooldown(0);
    }
  }, [visible, email, isAlreadyVerified]);

  // ✅ If already verified, don't render the modal
  if (isAlreadyVerified) {
    return null;
  }

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (verificationAttempts >= 5) {
      setError('Too many attempts. Please request a new code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Email verified successfully!');
        message.success('Email verified successfully!');
        
        // ✅ Store verification status
        localStorage.setItem('verifiedEmail', email);
        localStorage.removeItem('requires_verification');
        
        // ✅ Update user in localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            user.verified = true;
            localStorage.setItem('user', JSON.stringify(user));
          } catch (e) {}
        }
        
        // Check if we got auth token for auto-login
        if (data.access_token && data.user) {
          localStorage.setItem('authToken', data.access_token);
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          message.success('Logged in successfully!');
          
          setTimeout(() => {
            if (onVerified) {
              onVerified();
            }
          }, 1500);
        } else {
          setTimeout(() => {
            if (onVerified) {
              onVerified();
            }
          }, 1500);
        }
      } else {
        setError(data.error || data.message || 'Invalid verification code');
        setVerificationAttempts(prev => prev + 1);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      setVerificationAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess('New verification code sent to your email!');
        message.success('Verification code sent!');
        setResendCooldown(60);
        setVerificationAttempts(0);
      } else {
        setError(data.error || data.message || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerify();
    }
  };

  // Localized messages
  const messages = {
    title: {
      en: 'Verify Your Email',
      es: 'Verifique su correo electrónico',
      fr: 'Vérifiez votre email',
      ar: 'تحقق من بريدك الإلكتروني',
    },
    checkEmail: {
      en: 'Check your email',
      es: 'Revise su correo electrónico',
      fr: 'Vérifiez votre email',
      ar: 'تحقق من بريدك الإلكتروني',
    },
    codeSent: {
      en: `We've sent a 6-digit verification code to`,
      es: `Hemos enviado un código de verificación de 6 dígitos a`,
      fr: `Nous avons envoyé un code de vérification à 6 chiffres à`,
      ar: `لقد أرسلنا رمز تحقق مكون من 6 أرقام إلى`,
    },
    enterCode: {
      en: 'Enter verification code',
      es: 'Ingrese el código de verificación',
      fr: 'Entrez le code de vérification',
      ar: 'أدخل رمز التحقق',
    },
    verifyEmail: {
      en: 'Verify Email',
      es: 'Verificar correo electrónico',
      fr: 'Vérifier email',
      ar: 'تحقق من البريد الإلكتروني',
    },
    resendCode: {
      en: 'Resend code',
      es: 'Reenviar código',
      fr: 'Renvoyer le code',
      ar: 'إعادة إرسال الرمز',
    },
    didntReceive: {
      en: "Didn't receive the code?",
      es: "¿No recibió el código?",
      fr: "Vous n'avez pas reçu le code ?",
      ar: "لم تستلم الرمز؟",
    }
  };

  const getMessage = (key) => messages[key]?.[currentLanguage] || messages[key]?.en;

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <SafetyCertificateOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
          {getMessage('title')}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      closable={!loading}
      className="verification-modal"
    >
      <div style={{ padding: '20px 0' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <MailOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            
            <Title level={4} style={{ marginBottom: 8 }}>
              {getMessage('checkEmail')}
            </Title>
            
            <Text type="secondary">
              {getMessage('codeSent')} <strong>{email}</strong>
            </Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          {success && (
            <Alert
              message={success}
              type="success"
              showIcon
            />
          )}

          {verificationAttempts > 0 && (
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Attempts: {verificationAttempts}/5
              </Text>
              <Progress 
                percent={(verificationAttempts / 5) * 100} 
                size="small" 
                status={verificationAttempts >= 5 ? 'exception' : 'active'}
                showInfo={false}
              />
            </div>
          )}

          <Input
            placeholder={getMessage('enterCode')}
            value={code}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            maxLength={6}
            style={{ 
              textAlign: 'center',
              fontSize: 20,
              letterSpacing: 8,
              height: 50,
              fontWeight: 'bold'
            }}
            disabled={loading || verificationAttempts >= 5}
          />

          <Button
            type="primary"
            loading={loading}
            onClick={handleVerify}
            block
            size="large"
            disabled={code.length !== 6 || verificationAttempts >= 5}
            icon={<SafetyCertificateOutlined />}
          >
            {getMessage('verifyEmail')}
          </Button>

          <Row gutter={8} align="middle">
            <Col flex="auto">
              <Button
                type="link"
                loading={resending}
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || resending}
                icon={<ReloadOutlined />}
                style={{ padding: 0 }}
              >
                {getMessage('didntReceive')} {getMessage('resendCode')}
              </Button>
            </Col>
            {resendCooldown > 0 && (
              <Col>
                <Text type="secondary">
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {resendCooldown}s
                </Text>
              </Col>
            )}
          </Row>

          {verificationAttempts >= 5 && (
            <Alert
              message="Too many failed attempts"
              description="Please request a new verification code to continue."
              type="warning"
              showIcon
            />
          )}
        </Space>
      </div>
    </Modal>
  );
}

export default VerificationModal;