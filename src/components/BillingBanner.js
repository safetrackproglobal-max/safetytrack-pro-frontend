// src/components/BillingBanner.js
// On-screen billing warning shown at the top of every dashboard page.
// Data: GET /api/billing/status  (levels: none | ok | info | pending | warning | due | expired)
//  - warning / info : dismissible for the rest of the browser session
//  - due / expired  : always shown until the plan is renewed
import React, { useEffect, useState } from 'react';
import { Alert, Button } from 'antd';
import { useHistory } from 'react-router-dom';
import api from '../services/api';

const TYPE_BY_LEVEL = { info: 'info', pending: 'info', warning: 'warning', due: 'error', expired: 'error' };
const DISMISSIBLE = new Set(['info', 'pending', 'warning']);
const REFRESH_MS = 30 * 60 * 1000; // re-check every 30 minutes while the dashboard is open

const dismissKey = (s) => `billingBannerDismissed:${s.level}:${s.period_key || 'none'}`;

function BillingBanner() {
  const history = useHistory();
  const [status, setStatus] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get('/billing/status', { validateStatus: () => true });
        if (cancelled || res.status !== 200 || !res.data?.success) return;
        setStatus(res.data);
        try {
          setDismissed(sessionStorage.getItem(dismissKey(res.data)) === '1');
        } catch (e) { /* storage unavailable */ }
      } catch (e) {
        // never break the dashboard because of the banner
      }
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  if (!status || !TYPE_BY_LEVEL[status.level] || !status.title || dismissed) return null;

  const canDismiss = DISMISSIBLE.has(status.level);
  const onClose = () => {
    try { sessionStorage.setItem(dismissKey(status), '1'); } catch (e) { /* ignore */ }
    setDismissed(true);
  };

  return (
    <Alert
      type={TYPE_BY_LEVEL[status.level]}
      showIcon
      banner
      style={{ marginBottom: 16 }}
      message={<strong>{status.title}</strong>}
      description={status.message}
      closable={canDismiss}
      onClose={canDismiss ? onClose : undefined}
      action={status.action ? (
        <Button
          size="small"
          type={status.level === 'warning' || status.level === 'info' ? 'default' : 'primary'}
          danger={status.level === 'due' || status.level === 'expired'}
          onClick={() => history.push(status.action.url)}
        >
          {status.action.label}
        </Button>
      ) : null}
    />
  );
}

export default BillingBanner;
