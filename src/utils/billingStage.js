// Keep the saved sign-in stage equal to what the server says (after a payment or company setup).
export function storeStage(stage, redirectTo) {
  if (!stage || stage === 'blocked') return;
  [() => window.localStorage, () => window.sessionStorage].forEach((get) => {
    try {
      const s = get();
      if (!s.getItem('user')) return;
      const u = JSON.parse(s.getItem('user'));
      const flags = {
        requires_payment: stage === 'needs_payment',
        requires_plan_selection: stage === 'needs_plan',
        requires_company_setup: stage === 'needs_company_setup',
      };
      s.setItem('user', JSON.stringify({ ...u, stage, redirect_to: redirectTo || u.redirect_to, ...flags }));
      s.setItem('userStage', stage);
      if (redirectTo) s.setItem('redirect_to', redirectTo);
      Object.keys(flags).forEach((k) => s.setItem(k, String(flags[k])));
    } catch (e) { /* storage blocked or damaged: the server still decides */ }
  });
}

/** The server's own words for a failed request, else a plain fallback. */
export const errText = (e, fallback) => e?.originalError?.response?.data?.error || e?.response?.data?.error || e?.data?.error || e?.message || fallback;
