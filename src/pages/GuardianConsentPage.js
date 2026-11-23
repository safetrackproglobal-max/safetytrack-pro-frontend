// src/pages/GuardianConsentPage.js
// Opened from the parental-consent email: /guardian-consent?token=...
// The parent/guardian approves or declines the minor's account. The decision is sent with a
// POST, so email link scanners that open the URL can never approve anything on their own.
import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Card, Result, Button, Space, Typography, Alert } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../services/api';
import './AuthPages.css';

const { Title, Paragraph } = Typography;

function GuardianConsentPage() {
  const token = new URLSearchParams(useLocation().search).get('token');
  const history = useHistory();
  const [submitting, setSubmitting] = useState(null); // 'approve' | 'decline' | null
  const [result, setResult] = useState(null); // { ok, decision, message }

  const decide = async (decision) => {
    setSubmitting(decision);
    try {
      const res = await api.post('/auth/guardian/consent', { token, decision }, { validateStatus: () => true });
      const ok = res.status === 200 && res.data?.success;
      setResult({
        ok,
        decision,
        message: res.data?.message || res.data?.error || 'Something went wrong. Please try again.',
      });
    } catch (err) {
      setResult({ ok: false, decision, message: 'Could not reach the server. Please try again.' });
    } finally {
      setSubmitting(null);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <Result
            status="warning"
            title="This link is incomplete"
            subTitle="Please open the full link from the consent email, or ask your child to sign up again."
          />
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <Result
            status={result.ok ? (result.decision === 'approve' ? 'success' : 'info') : 'error'}
            title={result.ok ? (result.decision === 'approve' ? 'Account approved' : 'Request declined') : 'We could not record your decision'}
            subTitle={result.message}
            extra={<Button onClick={() => history.push('/')}>Go to homepage</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <SafetyCertificateOutlined style={{ fontSize: 40, color: '#1890ff' }} />
            <Title level={3} style={{ marginTop: 12 }}>Parental consent</Title>
          </div>
          <Paragraph>
            Your child asked to create a SafeTrack Pro Global account and listed you as their parent or guardian.
            Because they are under 18, the account stays locked until you decide.
          </Paragraph>
          <Alert
            type="info"
            showIcon
            message="What happens next"
            description="If you approve, we email your child a code to verify their email address, and then they can log in. If you decline, the account stays locked."
          />
          <Space style={{ width: '100%', justifyContent: 'center' }} wrap>
            <Button type="primary" size="large" loading={submitting === 'approve'} disabled={!!submitting} onClick={() => decide('approve')}>
              Approve account
            </Button>
            <Button danger size="large" loading={submitting === 'decline'} disabled={!!submitting} onClick={() => decide('decline')}>
              Decline
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}

export default GuardianConsentPage;
