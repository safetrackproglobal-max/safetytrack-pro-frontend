// src/pages/AccountStatusPage.js
// Public page that explains where an account is in its journey and what happens next.
//   /pending-approval                     -> admin waiting for approval (default)
//   /pending-approval?status=guardian     -> minor waiting for parent/guardian consent
//   /pending-approval?status=company-inactive -> employee whose company plan is inactive
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Card, Result, Steps, Button, Space, Typography } from 'antd';
import { ClockCircleOutlined, TeamOutlined, StopOutlined } from '@ant-design/icons';
import { ADMIN_JOURNEY, LOGIN_NOTICES } from '../constants/accountFlow';
import './AuthPages.css';

const { Text } = Typography;

const CONFIG = {
  approval: {
    icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
    notice: LOGIN_NOTICES.needs_approval,
    steps: ADMIN_JOURNEY,
    current: 2,
  },
  guardian: {
    icon: <TeamOutlined style={{ color: '#faad14' }} />,
    notice: LOGIN_NOTICES.guardian,
    steps: ['Create your account', 'Parent / guardian approves by email', 'Verify your email and sign in'],
    current: 1,
  },
  'company-inactive': {
    icon: <StopOutlined style={{ color: '#ff4d4f' }} />,
    notice: LOGIN_NOTICES.company_inactive,
    steps: null,
    current: 0,
  },
};

function AccountStatusPage() {
  const history = useHistory();
  const params = new URLSearchParams(useLocation().search);
  const cfg = CONFIG[params.get('status')] || CONFIG.approval;

  return (
    <div className="auth-container">
      <Card className="auth-card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <Result
          icon={cfg.icon}
          title={cfg.notice.title}
          subTitle={cfg.notice.text}
          extra={
            <Space wrap>
              <Button type="primary" onClick={() => history.push('/login')}>Back to sign in</Button>
              <Button onClick={() => history.push('/contact-team')}>Contact our team</Button>
            </Space>
          }
        />
        {cfg.steps && (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>Where you are:</Text>
            <Steps
              direction="vertical"
              size="small"
              current={cfg.current}
              items={cfg.steps.map((title) => ({ title }))}
            />
          </>
        )}
      </Card>
    </div>
  );
}

export default AccountStatusPage;
