// src/pages/BillingPage.js
// One billing page for everybody (routes /payment, /subscription, /payment-waiting).
// Data: GET /api/billing/overview. Company admins pay the price our team agreed with them;
// individuals pay the list price of their country. The server sets every amount itself.
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Radio, Select, Spin, Tag, message } from 'antd';
import { CreditCardOutlined, DollarOutlined, BankOutlined, MobileOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link, useHistory, useLocation } from 'react-router-dom';
import api from '../services/api';
import PaymentService from '../services/paymentService';
import ManualPaymentModal from '../components/ManualPaymentModal';
import { DURATION_OPTIONS, durationLabel, durationPer, formatPrice } from '../constants/accountFlow';
import { storeStage, errText } from '../utils/billingStage';
import './BillingPage.css';

const PLAN_LABEL = { free: 'Free', basic: 'Basic', pro: 'Pro', enterprise: 'Enterprise', custom: 'Custom' };
const STATUS = {
  active: ['green', 'Active'], pending: ['orange', 'Not paid yet'], pending_payment: ['orange', 'Not paid yet'],
  pending_verification: ['blue', 'Payment being checked'], suspended: ['red', 'Suspended'], expired: ['red', 'Expired'],
  cancelled: ['default', 'Cancelled'], inactive: ['default', 'Not active'],
};
const METHODS = [
  { id: 'paystack', icon: <CreditCardOutlined />, name: 'Card or mobile money', hint: 'Paystack secure checkout. Starts as soon as the payment is confirmed.' },
  { id: 'paypal', icon: <DollarOutlined />, name: 'PayPal', hint: 'Starts as soon as the payment is confirmed.' },
  { id: 'bank_transfer', icon: <BankOutlined />, name: 'Bank transfer', hint: 'Our team checks it, usually within 24 to 48 hours.' },
  { id: 'mobile_money', icon: <MobileOutlined />, name: 'MTN Mobile Money transfer', hint: 'Our team checks it, usually within 24 to 48 hours.' },
];
const day = (iso) => (iso ? new Date(/Z$|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : null);

function BillingPage() {
  const history = useHistory();
  const query = new URLSearchParams(useLocation().search);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(['basic', 'pro'].includes(query.get('plan')) ? query.get('plan') : 'pro');
  const [cycle, setCycle] = useState(DURATION_OPTIONS.some((d) => d.value === query.get('duration')) ? query.get('duration') : '1_month');
  const [busy, setBusy] = useState('');
  const [manual, setManual] = useState(null);
  const [asking, setAsking] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api.get('/billing/overview');
      setData(res.data);
      storeStage(res.data.stage, res.data.redirect_to);
    } catch (e) {
      setError(errText(e, 'Could not load billing.'));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (error) {
    return (
      <div className="bl">
        <Alert type="error" showIcon message="Billing could not be loaded" description={error} action={<Button onClick={load} icon={<ReloadOutlined />}>Try again</Button>} />
      </div>
    );
  }
  if (!data) return <div className="bl" style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>;

  const company = data.kind === 'company';
  const quote = company ? data.quote : null;
  const row = data.kind === 'individual' ? data.plans?.[plan] : null;
  let order = null;
  if (quote) order = { plan: quote.plan, duration: quote.billing_cycle, amount: quote.amount, currency: quote.currency };
  else if (row && typeof row[cycle] === 'number') order = { plan, duration: cycle, amount: row[cycle], currency: row.currency };
  const status = STATUS[data.status] || ['default', data.status || 'Not active'];
  const active = data.stage === 'complete' && data.plan !== 'free';

  const pay = async (id) => {
    if (id === 'bank_transfer' || id === 'mobile_money') { setManual(id); return; }
    setBusy(id);
    try {
      const body = { ...order, country: data.country, payment_method: id, callback_url: `${window.location.origin}/payment-callback` };
      const res = id === 'paystack' ? await PaymentService.initializePaystackPayment(body) : await PaymentService.initializePayPalPayment(body);
      const url = res?.authorization_url || res?.approval_url;
      if (!url) throw new Error(res?.error || 'Could not start the payment. Please try again.');
      try { sessionStorage.setItem('stp:pay-ref', res.reference || res.transaction_id || ''); } catch (e) { /* private window */ }
      window.location.assign(url);
    } catch (e) {
      message.error(errText(e, 'Could not start the payment. Please try again.'));
      setBusy('');
      load();
    }
  };

  const ask = async (v) => {
    setAsking(true);
    try {
      await api.post('/billing/quote-request', v);
      message.success('Request sent. We will email you when your price is ready.');
      await load();
    } catch (e) {
      message.error(errText(e, 'Could not send your request.'));
    } finally { setAsking(false); }
  };

  return (
    <div className="bl">
      <h1>Billing</h1>
      <p className="bl-sub">{company ? data.company.name : 'Your plan and payments'}</p>

      {data.pending_manual && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="We are checking your payment"
          description={`${data.pending_manual.currency} ${Number(data.pending_manual.amount).toLocaleString()}, reference ${data.pending_manual.reference}. This usually takes 24 to 48 hours. You do not need to pay again.`}
          action={<Button size="small" onClick={load}>Check now</Button>}
        />
      )}
      {data.kind === 'employee' && <Alert type="info" showIcon message="Your company administrator manages the plan" description="Please ask your administrator if the plan needs to be renewed." />}
      {data.kind === 'no_company' && <Alert type="info" showIcon message="Set up your company first" action={<Button type="primary" onClick={() => history.push('/company-setup')}>Set up company</Button>} />}
      {data.suspended && <Alert type="error" showIcon message="This company account is suspended" description={<>Please <Link to="/contact-team">contact us</Link>. Payments are closed until it is resolved.</>} />}

      {(company || data.kind === 'individual') && (
        <div className="bl-grid">
          <section className="bl-box">
            <h2>Current plan</h2>
            <dl className="bl-rows">
              <div><dt>Plan</dt><dd>{PLAN_LABEL[data.plan] || data.plan || 'None'}</dd></div>
              <div><dt>Status</dt><dd><Tag color={data.plan === 'free' ? 'default' : status[0]} style={{ margin: 0 }}>{data.plan === 'free' ? 'Free' : status[1]}</Tag></dd></div>
              {data.ends_at && <div><dt>Paid until</dt><dd>{day(data.ends_at)}</dd></div>}
              {company && <div><dt>Employees</dt><dd>{data.company.employee_count || 'Not set'}</dd></div>}
              {company && <div><dt>Industry</dt><dd>{data.company.industry || 'Not set'}</dd></div>}
            </dl>
            {data.stage === 'complete' && <Button block style={{ marginTop: 14 }} onClick={() => { window.location.assign(data.redirect_to || '/dashboard'); }}>Go to dashboard</Button>}
          </section>

          {!data.suspended && (
            <section className="bl-box">
              {data.kind === 'individual' && (
                <>
                  <h2>{active ? 'Renew or change plan' : 'Choose a plan'}</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                    <Radio.Group
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      optionType="button"
                      buttonStyle="solid"
                      options={Object.keys(data.plans || {}).map((p) => ({ value: p, label: PLAN_LABEL[p] }))}
                    />
                    <Select value={cycle} onChange={setCycle} style={{ minWidth: 130 }} aria-label="Billing period" options={DURATION_OPTIONS.map((d) => ({ value: d.value, label: d.label }))} />
                  </div>
                </>
              )}
              {quote && <h2>{active ? 'Renew your plan' : 'Your agreed price'}</h2>}
              {order && (
                <>
                  <div className="bl-price">{formatPrice(order.amount, order.currency)} <small>per {durationPer(order.duration)}, {PLAN_LABEL[order.plan]}</small></div>
                  {quote?.note && <p className="bl-note" style={{ margin: '0 0 8px', whiteSpace: 'pre-line' }}>{quote.note}</p>}
                  {active && company && data.ends_at && <p className="bl-note" style={{ margin: '0 0 8px' }}>If you renew early, the new period starts after {day(data.ends_at)}.</p>}
                  {METHODS.filter((m) => data.methods?.[m.id]).map((m) => (
                    <button key={m.id} type="button" className="bl-method" disabled={!!busy} onClick={() => pay(m.id)}>
                      {m.icon}<span className="t">{m.name}<small>{m.hint}</small></span>{busy === m.id && <Spin size="small" />}
                    </button>
                  ))}
                  <p className="bl-note">We do not store your card details. Cards are handled by the payment provider.</p>
                </>
              )}
              {company && !quote && (
                <>
                  <h2>{data.request ? 'Price requested' : 'Request your price'}</h2>
                  {data.request
                    ? <Alert type="info" showIcon style={{ marginBottom: 14 }} message="We are preparing your price" description={`${PLAN_LABEL[data.request.plan]}, ${durationLabel(data.request.billing_cycle).toLowerCase()} billing. We will email you when it is ready to pay. You can change the request below.`} />
                    : <p className="bl-note" style={{ margin: '0 0 12px' }}>Company plans are priced for your size and needs. Tell us what you need and we will set a price you can pay here.</p>}
                  <Form
                    layout="vertical"
                    onFinish={ask}
                    initialValues={{ plan: data.request?.plan || (data.plan === 'custom' ? 'custom' : 'enterprise'), billing_cycle: data.request?.billing_cycle || '1_year', note: data.request?.request_note || '' }}
                  >
                    <Form.Item name="plan" label="Plan" rules={[{ required: true }]}><Select options={[{ value: 'enterprise', label: 'Enterprise' }, { value: 'custom', label: 'Custom' }]} /></Form.Item>
                    <Form.Item name="billing_cycle" label="Billing period" rules={[{ required: true }]}><Select options={DURATION_OPTIONS.map((d) => ({ value: d.value, label: d.label }))} /></Form.Item>
                    <Form.Item name="note" label="What do you need?"><Input.TextArea rows={3} maxLength={2000} placeholder="Number of sites and users, cameras, special requirements" /></Form.Item>
                    <Button type="primary" htmlType="submit" loading={asking} block size="large">{data.request ? 'Update request' : 'Request price'}</Button>
                  </Form>
                </>
              )}
              {data.kind === 'individual' && <p className="bl-note">Need more people or cameras? <Link to="/contact-team">Ask about a company plan</Link>.</p>}
            </section>
          )}
        </div>
      )}

      {manual && order && (
        <ManualPaymentModal
          key={manual}
          open
          method={manual}
          plan={order.plan}
          planLabel={PLAN_LABEL[order.plan]}
          duration={order.duration}
          amount={order.amount}
          currency={order.currency}
          email=""
          onClose={() => setManual(null)}
          onRecorded={() => { setManual(null); load(); }}
        />
      )}
    </div>
  );
}

export default BillingPage;
