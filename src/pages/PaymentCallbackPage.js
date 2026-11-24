// src/pages/PaymentCallbackPage.js
// Where Paystack and PayPal return to. The address never decides the result: the server is asked.
// Routes: /payment-callback, /payment/callback, /payment-success, /payment-failed, /payment-cancel
import React, { useEffect, useRef, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import api from '../services/api';
import { storeStage } from '../utils/billingStage';
import './BillingPage.css';

const TRIES = 8;
const REASON = {
  amount_mismatch: 'The amount received does not match the price.',
  payment_not_found: 'We could not find this payment.',
  execution_failed: 'PayPal did not complete the payment.',
};
const pause = () => new Promise((r) => { setTimeout(r, 3000); });
const hasToken = () => {
  try { return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken')); } catch (e) { return false; }
};
const savedRef = () => {
  try { return sessionStorage.getItem('stp:pay-ref') || ''; } catch (e) { return ''; }
};

function PaymentCallbackPage() {
  const history = useHistory();
  const { pathname, search } = useLocation();
  const q = new URLSearchParams(search);
  const [reference] = useState(() => (q.get('reference') || q.get('trxref') || savedRef()).slice(0, 128));
  const [state, setState] = useState('checking');
  const [info, setInfo] = useState(null);
  const [round, setRound] = useState(0);
  const error = q.get('error');
  const checked = q.get('checked') === '1';
  const visit = useRef({ pathname, checked });

  useEffect(() => {
    let on = true;
    const at = visit.current;
    const put = (s) => { if (on) setState(s); };
    const check = async () => {
      if (at.pathname === '/payment-cancel') { put('cancelled'); return; }
      if (!hasToken()) {
        // not signed in: the server confirms with Paystack, then sends the browser back here
        const fresh = !at.checked && (at.pathname === '/payment-callback' || at.pathname === '/payment/callback');
        if (fresh && reference) window.location.replace(`${api.defaults.baseURL}/payment/paystack/public-callback?reference=${encodeURIComponent(reference)}`);
        else put(at.pathname === '/payment-failed' ? 'failed' : 'signin');
        return;
      }
      if (!reference) { put(at.pathname === '/payment-failed' ? 'failed' : 'unknown'); return; }
      put('checking');
      for (let i = 0; i < TRIES && on; i += 1) {
        try {
          const { data } = await api.get(`/payment/paystack/verify/${encodeURIComponent(reference)}`);
          if (!on) return;
          setInfo(data);
          if (data.status === 'failed') { put('failed'); return; }
          if (data.status === 'completed') {
            try { sessionStorage.removeItem('stp:pay-ref'); } catch (e) { /* private window */ }
            try {
              const o = await api.get('/billing/overview');
              storeStage(o.data.stage, o.data.redirect_to);
            } catch (e) { /* the plan is active; the next sign-in reads it */ }
            put('done');
            return;
          }
        } catch (e) {
          const code = e?.status || e?.response?.status;
          if (code === 404) { put('unknown'); return; }
          if (code === 401) { put('signin'); return; }
        }
        await pause();
      }
      put('pending');
    };
    check();
    return () => { on = false; };
  }, [reference, round]);

  const billing = <Button key="b" onClick={() => history.push('/payment')}>Back to billing</Button>;
  const contact = <Button key="c" onClick={() => history.push('/contact-team')}>Contact us</Button>;
  const reason = REASON[info?.failure_reason || error];
  const ref = reference ? ` Reference: ${reference}` : '';
  const paid = info?.payment ? `${info.payment.currency} ${Number(info.payment.amount).toLocaleString()} received. ` : '';
  const view = {
    checking: <Result icon={<Spin size="large" />} title="Checking your payment" subTitle="Please keep this page open." />,
    done: <Result status="success" title="Payment confirmed" subTitle={`${paid}Your plan is active.${ref}`} extra={<Button type="primary" onClick={() => window.location.assign('/dashboard')}>Go to dashboard</Button>} />,
    pending: <Result status="info" title="Payment not confirmed yet" subTitle={`The provider has not confirmed it. If you paid, it can take a few minutes.${ref}`} extra={[<Button key="a" type="primary" onClick={() => setRound(round + 1)}>Check again</Button>, billing, contact]} />,
    failed: <Result status="error" title="Payment not completed" subTitle={`${reason || 'The provider did not complete this payment.'} Your plan was not changed.${ref}`} extra={[billing, contact]} />,
    cancelled: <Result status="warning" title="Payment cancelled" subTitle="Your plan was not changed." extra={[billing]} />,
    signin: <Result status="info" title="Sign in to see your plan" subTitle={`Your payment status is shown after you sign in.${ref}`} extra={<Button type="primary" onClick={() => history.push('/login')}>Sign in</Button>} />,
    unknown: <Result status="warning" title="We could not find this payment" subTitle={`If you were charged, send us the reference.${ref}`} extra={[billing, contact]} />,
  }[state];
  return <div className="bl-result" data-state={state}>{view}</div>;
}

export default PaymentCallbackPage;
