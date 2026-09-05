// src/components/UpgradeModal.js - Cannot close, only Back or Upgrade
import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, Tag, Typography, Alert, Divider } from 'antd';
import { CrownOutlined, RocketOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { registerUpgradeModalHandler, getUpgradeUrl } from '../services/api';
import { useHistory } from 'react-router-dom';

const { Title, Text } = Typography;

const UpgradeModal = () => {
  const [visible, setVisible] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState(null);
  const history = useHistory();

  useEffect(() => {
    registerUpgradeModalHandler((info) => {
      console.log('🎯 Upgrade modal triggered:', info);
      setUpgradeInfo(info);
      setVisible(true);
    });

    const pendingUpgrade = localStorage.getItem('pending_upgrade');
    if (pendingUpgrade) {
      try {
        const info = JSON.parse(pendingUpgrade);
        setUpgradeInfo(info);
        setVisible(true);
        localStorage.removeItem('pending_upgrade');
      } catch (e) {}
    }
  }, []);

  const handleBack = () => {
    setVisible(false);
    history.goBack();
  };

  const handleUpgrade = () => {
    const upgradeUrl = upgradeInfo?.upgradeUrl || getUpgradeUrl(upgradeInfo?.requiredPlan || 'pro');
    window.location.href = upgradeUrl;
  };

  const getRequiredPlanBadge = () => {
    const plan = upgradeInfo?.requiredPlan || 'pro';
    const colors = { free: 'default', basic: 'blue', pro: 'purple', enterprise: 'gold' };
    return (
      <Tag color={colors[plan] || 'purple'} style={{ fontSize: '14px', padding: '4px 12px' }}>
        <CrownOutlined /> {plan.toUpperCase()} PLAN REQUIRED
      </Tag>
    );
  };

  const getFeaturesForPlan = (plan) => {
    const features = {
      basic: ['100 document uploads/month', 'Basic analytics', 'Email support', 'Up to 10 team members'],
      pro: ['500 document uploads/month', 'Advanced analytics', 'Priority support', 'Up to 50 team members', 'Real-time monitoring', 'Video analysis', 'AI-powered insights'],
      enterprise: ['Unlimited uploads', 'Custom analytics', 'Dedicated support', 'Unlimited team members', 'API access', 'White-labeling', 'Custom integrations']
    };
    return features[plan] || features.pro;
  };

  const features = getFeaturesForPlan(upgradeInfo?.requiredPlan || 'pro');

  return (
    <Modal
      title={
        <Space>
          <RocketOutlined style={{ color: '#fa8c16', fontSize: '24px' }} />
          <span style={{ fontSize: '18px' }}>Upgrade Required</span>
          {getRequiredPlanBadge()}
        </Space>
      }
      open={visible}
      closable={false}      // ❌ No X button
      maskClosable={false}  // ❌ Cannot click outside
      keyboard={false}      // ❌ Cannot press ESC
      width={550}
      footer={[
        <Button 
          key="back" 
          onClick={handleBack}
          icon={<ArrowLeftOutlined />}
          size="large"
        >
          Go Back
        </Button>,
        <Button
          key="upgrade"
          type="primary"
          onClick={handleUpgrade}
          icon={<RocketOutlined />}
          size="large"
          style={{
            background: 'linear-gradient(135deg, #fa8c16, #f5222d)',
            border: 'none'
          }}
        >
          Upgrade Now
        </Button>
      ]}
    >
      <Alert
        message={
          <Space direction="vertical" size={4}>
            <Text strong style={{ fontSize: '16px' }}>
              {upgradeInfo?.message || 'This feature requires a higher plan'}
            </Text>
            <Text type="secondary">
              Your current plan: <Tag color="default">{upgradeInfo?.userPlan?.toUpperCase() || 'FREE'}</Tag>
            </Text>
          </Space>
        }
        type="error"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Divider orientation="left">Unlock with {upgradeInfo?.requiredPlan?.toUpperCase() || 'Pro'} Plan:</Divider>

      <div style={{ marginBottom: 16 }}>
        {features.map((feature, index) => (
          <div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            <Text>{feature}</Text>
          </div>
        ))}
      </div>

      <Alert
        message="Cannot access this feature with your current plan"
        description="Please upgrade to continue or go back to the previous page."
        type="warning"
        showIcon
      />
    </Modal>
  );
};

export default UpgradeModal;