// src/pages/AcceptTermsPage.jsx
import React, { useState } from 'react';
import {
  Card, Checkbox, Button, Typography, Alert, Space, Divider, message
} from 'antd';
import { CheckCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TERMS_VERSION,
  PRIVACY_VERSION,
  DPA_VERSION,
} from '../compliance/versions';

const { Title, Text, Paragraph } = Typography;

export default function AcceptTermsPage() {
  const { user, acceptTerms } = useAuth();
  const history = useHistory();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [eConsent, setEConsent] = useState(false);
  const [dpaAccepted, setDpaAccepted] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAdminUser = ['admin', 'company_admin'].includes(user?.user_type);
  const canSubmit = termsAccepted && eConsent && (!isAdminUser || dpaAccepted);

  const handleAccept = async () => {
    setSubmitting(true);
    setError('');

    const result = await acceptTerms({
      termsAccepted,
      eConsent,
      dpaAccepted,
      marketingConsent: marketing,
    });

    if (result.success) {
      message.success('Terms accepted — welcome back!');
      // ✅ replace so back button can't bounce the user here again
      history.replace(result.redirect_to || '/dashboard');
    } else {
      setError(result.error || 'Failed to accept terms. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <SafetyCertificateOutlined style={{ fontSize: 40, color: '#1890ff' }} />
            <Title level={2}>Updated Terms & Policies</Title>
            <Text type="secondary">
              Please review and accept the following to continue using SafetyTrack Pro.
            </Text>
          </div>

          <Alert
            type="info"
            showIcon
            message={`Version ${TERMS_VERSION}`}
            description="We've updated our policies. To keep using your account, you must accept them."
          />

          <div>
            <Paragraph strong>Terms of Service</Paragraph>
            <Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}>
              I agree to the Terms of Service ({TERMS_VERSION})
            </Checkbox>
          </div>

          <div>
            <Paragraph strong>Privacy Policy</Paragraph>
            <Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}>
              I agree to the Privacy Policy ({PRIVACY_VERSION})
            </Checkbox>
          </div>

          <div>
            <Paragraph strong>Electronic Consent</Paragraph>
            <Checkbox checked={eConsent} onChange={(e) => setEConsent(e.target.checked)}>
              I consent to conduct business electronically
            </Checkbox>
          </div>

          {isAdminUser && (
            <div>
              <Paragraph strong>Data Processing Agreement (DPA)</Paragraph>
              <Checkbox checked={dpaAccepted} onChange={(e) => setDpaAccepted(e.target.checked)}>
                I accept the Data Processing Agreement ({DPA_VERSION})
              </Checkbox>
            </div>
          )}

          <Divider />

          <div>
            <Checkbox checked={marketing} onChange={(e) => setMarketing(e.target.checked)}>
              <Text type="secondary">
                I'd like to receive product updates and marketing emails (optional)
              </Text>
            </Checkbox>
          </div>

          {error && <Alert type="error" message={error} showIcon />}

          <Button
            type="primary"
            size="large"
            block
            icon={<CheckCircleOutlined />}
            loading={submitting}
            disabled={!canSubmit}
            onClick={handleAccept}
          >
            Accept and Continue
          </Button>
        </Space>
      </Card>
    </div>
  );
}
