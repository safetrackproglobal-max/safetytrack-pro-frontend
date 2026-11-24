// src/pages/LoginPage.js
// One sign-in page for users, employees and administrators.
//
// The BACKEND decides where everyone goes (POST /api/auth/login -> stage + redirect_to).
// This page only follows it:
//   complete            -> redirect_to (role dashboard)
//   needs_consent       -> /accept-terms
//   needs_mfa           -> 6-digit authenticator code step (on this page)
//   needs_plan/payment  -> plan & payment dialog (on this page)
//   payment pending     -> /payment-waiting
//   needs_company_setup -> /company-setup
//   not verified        -> email code dialog
//   admin not approved  -> /pending-approval
//   guardian pending    -> /pending-approval?status=guardian
//   company inactive    -> /pending-approval?status=company-inactive (employees)
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Alert,
  Card,
  Typography,
  Space,
  Divider,
  message,
  Select,
  Modal,
  Row,
  Col,
  Tag,
  Spin
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  LoginOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  BankOutlined,
  PhoneOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import VerificationModal from '../components/VerificationModal';
import ManualPaymentModal from '../components/ManualPaymentModal';
import PaymentService from '../services/paymentService';
import {
  DURATION_OPTIONS,
  durationLabel,
  durationPer,
  FALLBACK_COUNTRY_PRICING,
  fetchCountryPricing,
  getPlanPrice,
  formatPrice
} from '../constants/accountFlow';
import './AuthPages.css';

const { Title, Text } = Typography;
const { Option } = Select;

const PLAN_INFO = {
  basic: { label: 'Basic', highlights: ['PDF/Word/Excel generation', 'Basic analytics', '100 uploads / month', 'Up to 10 team members'] },
  pro: { label: 'Professional', highlights: ['ML image & video analysis', 'Advanced analytics', '500 uploads / month', 'Up to 50 team members'] },
  enterprise: { label: 'Enterprise', highlights: ['Unlimited usage & team', 'Dedicated account manager', 'Custom integrations', 'SLA & priority support'] },
  custom: { label: 'Custom Enterprise', highlights: ['Tailored workflows', 'Dedicated infrastructure', 'On-premise option', 'Premium support'] }
};

const PAYMENT_METHODS = [
  { id: 'paystack', name: 'Paystack — Card / Mobile Money', icon: <CreditCardOutlined />, instant: true },
  { id: 'paypal', name: 'PayPal', icon: <DollarOutlined />, instant: true },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: <BankOutlined />, instant: false },
  { id: 'mobile_money', name: 'Mobile Money (manual transfer)', icon: <PhoneOutlined />, instant: false }
];

const isCompanyAdmin = (u) => ['admin', 'company_admin'].includes(u?.user_type);

function LoginPage() {
  const history = useHistory();
  const { login, verifyMfa, forgotPassword } = useAuth();
  const { changeLanguage } = useLanguage();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // email verification
  const [showVerification, setShowVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');

  // MFA
  const [mfaToken, setMfaToken] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  // forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSending, setForgotSending] = useState(false);

  // plan / payment
  const [planCtx, setPlanCtx] = useState(null); // { user, stage, redirect_to }
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('1_month');
  const [pricing, setPricing] = useState(FALLBACK_COUNTRY_PRICING.default);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [manualMethod, setManualMethod] = useState(null);

  // ============================================
  // ROUTING — follow the backend's decision
  // ============================================
  const openPlanDialog = async (result) => {
    const user = result.user || {};
    const admin = isCompanyAdmin(user);
    const currentPlan = String(user.plan || '').toLowerCase();
    const allowed = admin ? ['enterprise', 'custom'] : ['basic', 'pro', 'enterprise'];
    setSelectedPlan(allowed.includes(currentPlan) ? currentPlan : null);
    setSelectedDuration('1_month');
    setPlanCtx({ user, stage: result.stage, redirect_to: result.redirect_to });
    setPricing(await fetchCountryPricing(user.country));
  };

  const routeAfterLogin = async (result) => {
    const stage = result.stage || 'complete';
    const redirectTo = result.redirect_to || '/dashboard';

    if (stage === 'needs_consent') {
      message.info('Please review and accept our updated terms to continue.');
      history.push('/accept-terms');
      return;
    }
    if (result.payment_status === 'pending_verification' || redirectTo === '/payment-waiting') {
      message.info('Your payment is being verified by our team (24–48h).');
      history.push('/payment-waiting');
      return;
    }
    if (stage === 'needs_plan' || stage === 'needs_payment') {
      if (isCompanyAdmin(result.user)) {
        // company plans: agreed price, request and payment live on the billing page
        history.push('/payment');
        return;
      }
      await openPlanDialog(result);
      return;
    }
    if (stage === 'needs_company_setup') {
      message.info('Finish setting up your company to continue.');
      history.push('/company-setup');
      return;
    }
    if (stage === 'needs_approval') {
      history.push('/pending-approval');
      return;
    }
    message.success('Welcome back!');
    history.push(redirectTo);
  };

  // ============================================
  // SIGN IN
  // ============================================
  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    const email = values.email.trim().toLowerCase();

    try {
      const result = await login({ email, password: values.password }, !!values.rememberMe);

      if (result.mfa_required) {
        setMfaToken(result.mfa_token);
        setMfaCode('');
        return;
      }

      if (!result.success) {
        if (result.needsVerification || result.requires_verification) {
          setVerifyEmail(result.email || email);
          setShowVerification(true);
          message.info('Please verify your email first — enter the 6-digit code we sent you.');
          return;
        }
        if (result.requires_approval) {
          history.push('/pending-approval');
          return;
        }
        if (result.requires_guardian_consent) {
          history.push('/pending-approval?status=guardian');
          return;
        }
        if (result.company_inactive) {
          history.push('/pending-approval?status=company-inactive');
          return;
        }
        setError(result.message || result.error || 'Sign in failed. Please try again.');
        return;
      }

      const lang = result.user?.preferred_language;
      if (lang) {
        try { await changeLanguage(lang); } catch (e) { /* non-fatal */ }
      }
      await routeAfterLogin(result);
    } catch (err) {
      setError('Sign in failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async () => {
    if (!/^\d{6}$/.test(mfaCode)) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setMfaLoading(true);
    setError('');
    try {
      const result = await verifyMfa(mfaToken, mfaCode);
      if (result.success) {
        setMfaToken(null);
        await routeAfterLogin(result);
      } else {
        setError(result.error || 'Invalid authentication code.');
      }
    } finally {
      setMfaLoading(false);
    }
  };

  const handleForgot = async () => {
    const email = forgotEmail.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      message.warning('Enter the email address you signed up with.');
      return;
    }
    setForgotSending(true);
    try {
      const res = await forgotPassword(email);
      if (res.success) setShowForgot(false);
    } finally {
      setForgotSending(false);
    }
  };

  // ============================================
  // PAYMENT (prices come from the server; the server re-prices anyway)
  // ============================================
  const priceOf = (planId) => getPlanPrice(pricing, planId, selectedDuration);

  const handlePayment = async (methodId) => {
    const price = priceOf(selectedPlan);
    if (price.isCustom || price.isFree) return;

    if (methodId === 'bank_transfer' || methodId === 'mobile_money') {
      setManualMethod(methodId);
      return;
    }

    setPaymentProcessing(true);
    try {
      const paymentData = {
        plan: selectedPlan,
        duration: selectedDuration,
        country: planCtx?.user?.country || 'default',
        amount: price.amount,
        currency: price.currency,
        email: planCtx?.user?.email || '',
        name: planCtx?.user?.name || '',
        user_id: planCtx?.user?.id,
        payment_method: methodId,
        metadata: { plan: selectedPlan, duration: selectedDuration, isLogin: true },
        callback_url: `${window.location.origin}/payment-callback?method=${methodId}&login=true`
      };
      const response = methodId === 'paystack'
        ? await PaymentService.initializePaystackPayment(paymentData)
        : await PaymentService.initializePayPalPayment(paymentData);
      const redirectUrl = response?.authorization_url || response?.approval_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
      throw new Error(response?.error || 'Could not start the payment. Please try again.');
    } catch (err) {
      message.error(err?.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const closePlanDialog = () => {
    const target = planCtx?.redirect_to;
    setPlanCtx(null);
    setSelectedPlan(null);
    if (target) history.push(target);
  };

  // ============================================
  // RENDER: plan & payment dialog
  // ============================================
  const renderPlanDialog = () => {
    if (!planCtx) return null;
    const admin = isCompanyAdmin(planCtx.user);
    const plans = admin ? ['enterprise', 'custom'] : ['basic', 'pro', 'enterprise'];
    const price = selectedPlan ? priceOf(selectedPlan) : null;
    const expired = planCtx.stage === 'needs_payment';

    return (
      <Modal
        open
        title={admin ? 'Activate your company plan' : expired ? 'Renew or complete your plan' : 'Choose your plan'}
        onCancel={paymentProcessing ? undefined : closePlanDialog}
        footer={null}
        width={720}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={admin
            ? 'Your administrator account is approved.'
            : expired ? 'Your paid plan is not active (unpaid or expired).' : 'Pick a plan to continue.'}
          description={admin
            ? 'Enterprise and Custom pricing is agreed with our sales team. Once terms are agreed we activate your company and you can sign in to your admin dashboard.'
            : 'Choose a plan and billing cycle, then a payment method. Card and PayPal activate instantly; transfers within 24–48h.'}
        />

        {!admin && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Text strong>Billing cycle: </Text>
            <Select value={selectedDuration} onChange={setSelectedDuration} style={{ width: 150 }}>
              {DURATION_OPTIONS.map((d) => <Option key={d.value} value={d.value}>{d.label}</Option>)}
            </Select>
          </div>
        )}

        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {plans.map((planId) => {
            const p = priceOf(planId);
            const isSelected = selectedPlan === planId;
            return (
              <Col xs={24} md={admin ? 12 : 8} key={planId}>
                <Card
                  hoverable
                  onClick={() => setSelectedPlan(planId)}
                  style={{ height: '100%', border: isSelected ? '2px solid #1890ff' : undefined }}
                >
                  {planId === 'pro' && <Tag color="purple">Most Popular</Tag>}
                  {p.isCustom && <Tag color="gold"><CrownOutlined /> Contact sales</Tag>}
                  <Title level={5} style={{ margin: '8px 0 4px' }}>{PLAN_INFO[planId].label}</Title>
                  <Text strong style={{ fontSize: 18, color: p.isCustom ? '#fa8c16' : '#1890ff' }}>
                    {formatPrice(p.amount, p.currency)}
                  </Text>
                  {!p.isCustom && <Text type="secondary" style={{ fontSize: 12 }}> / {durationPer(selectedDuration)}</Text>}
                  <Divider style={{ margin: '8px 0' }} />
                  {PLAN_INFO[planId].highlights.map((h) => (
                    <div key={h} style={{ fontSize: 12, padding: '2px 0' }}>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />{h}
                    </div>
                  ))}
                </Card>
              </Col>
            );
          })}
        </Row>

        {selectedPlan && price?.isCustom && (
          <Alert
            type="warning"
            showIcon
            message="This plan is priced by our sales team"
            description="Send us your requirements and we'll get back to you within 1 business day."
            action={<Button type="primary" onClick={() => { setPlanCtx(null); history.push('/contact-team'); }}>Contact sales</Button>}
          />
        )}

        {selectedPlan && price && !price.isCustom && (
          <>
            <Divider orientation="left">
              Pay {formatPrice(price.amount, price.currency)} for {PLAN_INFO[selectedPlan].label} ({durationLabel(selectedDuration)})
            </Divider>
            {PAYMENT_METHODS.map((m) => (
              <Card
                key={m.id}
                hoverable
                onClick={() => !paymentProcessing && handlePayment(m.id)}
                style={{ marginBottom: 8, opacity: paymentProcessing ? 0.6 : 1 }}
                styles={{ body: { padding: 12 } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 22, color: m.instant ? '#1890ff' : '#faad14' }}>{m.icon}</div>
                  <Text strong>{m.name}</Text>
                  <Tag color={m.instant ? 'green' : 'orange'} style={{ marginLeft: 'auto' }}>
                    {m.instant ? 'Instant' : '24–48h'}
                  </Tag>
                </div>
              </Card>
            ))}
            {paymentProcessing && (
              <div style={{ textAlign: 'center', marginTop: 12 }}><Spin /> Redirecting to secure checkout…</div>
            )}
          </>
        )}
      </Modal>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="auth-container">
      <Card className="auth-card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <SafetyCertificateOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 16 }} />
            <Title level={2}>{mfaToken ? 'Two-Step Verification' : 'Welcome Back'}</Title>
            <Text type="secondary">
              {mfaToken
                ? 'Enter the 6-digit code from your authenticator app.'
                : 'Users, employees and administrators all sign in here.'}
            </Text>
          </div>

          {error && <Alert message={error} type="error" showIcon closable onClose={() => setError('')} />}

          {mfaToken ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                size="large"
                prefix={<KeyOutlined />}
                placeholder="123456"
                value={mfaCode}
                maxLength={6}
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                onPressEnter={handleMfaSubmit}
                style={{ textAlign: 'center', letterSpacing: 6, fontSize: 20 }}
              />
              <Button type="primary" size="large" block loading={mfaLoading} onClick={handleMfaSubmit}>
                Verify & Sign In
              </Button>
              <Button type="link" block onClick={() => { setMfaToken(null); setError(''); }}>
                ← Use a different account
              </Button>
              <Text type="secondary" style={{ fontSize: 12 }}>The code expires 5 minutes after you entered your password.</Text>
            </Space>
          ) : (
            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
              initialValues={{ rememberMe: true }}
            >
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="you@example.com" prefix={<MailOutlined />} disabled={loading} autoComplete="email" />
              </Form.Item>

              <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter your password' }]}>
                <Input.Password placeholder="Enter your password" prefix={<LockOutlined />} disabled={loading} autoComplete="current-password" />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                  <Checkbox disabled={loading}>Keep me signed in</Checkbox>
                </Form.Item>
                <Button
                  type="link"
                  style={{ padding: 0 }}
                  disabled={loading}
                  onClick={() => { setForgotEmail(form.getFieldValue('email') || ''); setShowForgot(true); }}
                >
                  Forgot password?
                </Button>
              </div>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block icon={<LoginOutlined />}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>
          )}

          {!mfaToken && (
            <>
              <Divider plain>New here?</Divider>
              <div style={{ textAlign: 'center' }}>
                <Space direction="vertical" size={4}>
                  <Button type="link" style={{ padding: 0 }} onClick={() => history.push('/signup')}>
                    Create a personal account
                  </Button>
                  <Button type="link" style={{ padding: 0 }} onClick={() => history.push('/signup?type=admin')}>
                    Register your organization
                  </Button>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Employees: your company administrator creates your account.
                  </Text>
                </Space>
              </div>
            </>
          )}
        </Space>
      </Card>

      {showVerification && (
        <VerificationModal
          email={verifyEmail}
          onVerified={(data) => {
            setShowVerification(false);
            if (data?.stage === 'needs_approval') {
              history.push('/pending-approval');
              return;
            }
            message.success('Email verified! Please sign in again.');
            form.setFieldsValue({ password: '' });
          }}
          onClose={() => setShowVerification(false)}
        />
      )}

      <Modal
        title="Reset your password"
        open={showForgot}
        onCancel={() => !forgotSending && setShowForgot(false)}
        onOk={handleForgot}
        okText="Send reset link"
        confirmLoading={forgotSending}
      >
        <Text type="secondary">Enter the email you signed up with. We'll email you a link to set a new password.</Text>
        <Input
          style={{ marginTop: 12 }}
          prefix={<MailOutlined />}
          placeholder="you@example.com"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          onPressEnter={handleForgot}
        />
      </Modal>

      {renderPlanDialog()}

      {manualMethod && planCtx && selectedPlan && (
        <ManualPaymentModal
          key={`${manualMethod}-${selectedPlan}-${selectedDuration}`}
          open
          method={manualMethod}
          plan={selectedPlan}
          planLabel={PLAN_INFO[selectedPlan].label}
          duration={selectedDuration}
          amount={priceOf(selectedPlan).amount}
          currency={priceOf(selectedPlan).currency}
          email={planCtx.user?.email}
          onClose={() => setManualMethod(null)}
          onRecorded={() => {
            setManualMethod(null);
            setPlanCtx(null);
            history.push('/payment-waiting');
          }}
        />
      )}
    </div>
  );
}

export default LoginPage;
