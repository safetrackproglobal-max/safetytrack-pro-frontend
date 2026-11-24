// src/pages/CompanySetup.js
// A company admin without a company creates it here, then continues to the billing page (/payment).
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Select, Spin, Typography, message } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { storeStage, errText } from '../utils/billingStage';
import { INDUSTRY_OPTIONS } from '../constants/accountFlow';

const { Title, Text } = Typography;
const PHONE_PATTERN = /^[+\d\s()-]{7,20}$/; // same rule as backend _clean_phone
const COUNTRIES = ['Ghana', 'Qatar', 'India', 'United States', 'United Kingdom', 'Nigeria', 'South Africa', 'Kenya', 'Other'];

function CompanySetup() {
  const history = useHistory();
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [denied, setDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let on = true;
    api.get('/billing/overview').then(({ data }) => {
      if (!on) return;
      storeStage(data.stage, data.redirect_to);
      if (data.kind === 'company') history.replace('/payment');
      else if (data.kind !== 'no_company') setDenied(true);
      else setReady(true);
    }).catch(() => { if (on) setReady(true); });
    return () => { on = false; };
  }, [history]);

  const save = async (v) => {
    setSaving(true);
    setError('');
    try {
      await api.post('/company/setup', v);
      storeStage('needs_payment', '/payment');
      message.success('Company saved');
      history.push('/payment');
    } catch (e) {
      setError(errText(e, 'Could not save your company. Please try again.'));
      setSaving(false);
    }
  };

  if (denied) {
    return (
      <div style={{ maxWidth: 620, margin: '40px auto', padding: '0 16px' }}>
        <Alert type="warning" showIcon message="Only a company administrator can set up a company." action={<Button onClick={() => history.push('/dashboard')}>Dashboard</Button>} />
      </div>
    );
  }
  if (!ready) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px' }}>
      <Card>
        <Title level={2} style={{ marginTop: 0 }}>Set up your company</Title>
        <Text type="secondary">Next you request your price and pay on the billing page.</Text>
        {error && <Alert type="error" showIcon message={error} style={{ marginTop: 16 }} />}
        <Form
          layout="vertical"
          size="large"
          onFinish={save}
          style={{ marginTop: 20 }}
          initialValues={{ company_name: user?.company_name || '', industry: 'Other', employee_count: 1, country: COUNTRIES.includes(user?.country) ? user.country : 'Ghana', phone: user?.phone || '' }}
        >
          <Form.Item name="company_name" label="Company name" rules={[{ required: true, whitespace: true, message: 'Enter the company name' }]}><Input maxLength={255} /></Form.Item>
          <Form.Item name="industry" label="Industry" rules={[{ required: true }]}><Select options={INDUSTRY_OPTIONS} /></Form.Item>
          <Form.Item name="employee_count" label="Number of employees" rules={[{ required: true, message: 'Enter the number of employees' }]}><InputNumber min={1} max={1000000} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="country" label="Country" rules={[{ required: true }]}><Select options={COUNTRIES.map((c) => ({ value: c, label: c }))} /></Form.Item>
          <Form.Item name="phone" label="Phone (optional)" rules={[{ pattern: PHONE_PATTERN, message: 'Enter a valid phone number' }]}><Input maxLength={20} /></Form.Item>
          <Form.Item name="website" label="Website (optional)" rules={[{ pattern: /^https?:\/\/\S+$/, message: 'Start with http:// or https://' }]}><Input placeholder="https://" maxLength={230} /></Form.Item>
          <Form.Item name="address" label="Address (optional)"><Input.TextArea rows={2} maxLength={500} /></Form.Item>
          <Button type="primary" htmlType="submit" block loading={saving} icon={<ArrowRightOutlined />}>Save and continue to billing</Button>
        </Form>
      </Card>
    </div>
  );
}

export default CompanySetup;
