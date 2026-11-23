// src/pages/AcceptInvitePage.js
// Public page opened from a client-reviewer invitation email: /accept-invite?token=...
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Card, Form, Input, Button, Checkbox, Result, Spin, Typography, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import submissionService from '../services/submissionService';
import { passwordValidator } from '../constants/accountFlow';
import '../components/submissions/Submissions.css';

const { Title, Paragraph } = Typography;

function AcceptInvitePage() {
  const token = new URLSearchParams(useLocation().search).get('token') || '';
  const history = useHistory();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!token) { setError('This link is incomplete. Please open the full link from the invitation email.'); return; }
    submissionService.inviteInfo(token).then(setInfo).catch((e) => setError(e.message));
  }, [token]);

  const submit = async (values) => {
    setSaving(true);
    setFormError(null);
    try {
      const res = await submissionService.acceptInvite({ token, name: values.name, password: values.password, accept_terms: values.accept_terms === true });
      setDone(res);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return <Result status="warning" title="Invitation not available" subTitle={error} extra={<Button onClick={() => history.push('/login')}>Go to login</Button>} />;
  }
  if (done) {
    return (
      <Result status="success" title="Your account is ready" subTitle={done.message}
        extra={<Button type="primary" onClick={() => history.push(`/login?email=${encodeURIComponent(done.email)}`)}>Log in now</Button>} />
    );
  }
  if (!info) return <div style={{ padding: 80, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <Card className="inv-card">
      <Title level={3} style={{ marginTop: 0 }}>Welcome, {info.name}</Title>
      <Paragraph>
        <b>{info.invited_by_company}</b> invited you to review and sign documents for <b>{info.client}</b>.
      </Paragraph>
      {info.needs_password ? (
        <Form layout="vertical" initialValues={{ name: info.name }} onFinish={submit}>
          {formError && <Alert type="error" showIcon style={{ marginBottom: 12 }} message={formError} />}
          <Form.Item label="Email"><Input value={info.email} disabled /></Form.Item>
          <Form.Item name="name" label="Your full name" rules={[{ required: true, min: 2, message: 'Enter your name' }]}><Input /></Form.Item>
          <Form.Item name="password" label="Create a password" hasFeedback
            rules={[{ required: true, message: 'Create a password' }, { validator: passwordValidator }]}
            extra="At least 12 characters, with an uppercase letter, a lowercase letter and a number.">
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item name="confirm" label="Repeat the password" dependencies={['password']} hasFeedback
            rules={[{ required: true, message: 'Repeat the password' }, ({ getFieldValue }) => ({
              validator: (_, v) => (!v || v === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('The passwords do not match'))),
            })]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item name="accept_terms" valuePropName="checked"
            rules={[{ validator: (_, v) => (v ? Promise.resolve() : Promise.reject(new Error('Please accept to continue'))) }]}>
            <Checkbox>I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a></Checkbox>
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={saving}>Create my account</Button>
          <Paragraph type="secondary" style={{ marginTop: 12, fontSize: 12 }}>
            Your account is free. You will only see the documents that are sent to you.
          </Paragraph>
        </Form>
      ) : (
        <>
          <Paragraph>You already have a SafeTrack Pro account. Log in and the documents will appear under <b>My reviews</b>.</Paragraph>
          <Button type="primary" block onClick={async () => {
            try { const r = await submissionService.acceptInvite({ token }); setDone(r); } catch (e) { setError(e.message); }
          }}>Accept and log in</Button>
        </>
      )}
    </Card>
  );
}

export default AcceptInvitePage;
