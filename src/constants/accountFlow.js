// src/constants/accountFlow.js
// ------------------------------------------------------------------
// Single source of truth for the signup / login flow rules used by
// SignupPage, LoginPage and AccountStatusPage.
//
// Each block names its backend counterpart in safetrack-pro-backend/app.py.
// If you change one side, change the other.
// ------------------------------------------------------------------
import api from '../services/api';

// = CURRENT_TERMS_VERSION / CURRENT_PRIVACY_VERSION / CURRENT_DPA_VERSION / CURRENT_BAA_VERSION
export const POLICY_VERSIONS = {
  TERMS: '2026-01-15',
  PRIVACY: '2026-01-15',
  DPA: '2026-01-15',
  BAA: '2026-01-15',
};

// = MIN_AGE / MINOR_AGE_FLOOR
export const MIN_AGE = 18;
export const MINOR_AGE_FLOOR = 13;

// ================= PASSWORD =================
// = _password_policy_error() + register() password checks
export const PASSWORD_MIN_LEN = 12;

export const PASSWORD_RULES = [
  { id: 'length', label: `At least ${PASSWORD_MIN_LEN} characters`, test: (pw) => pw.length >= PASSWORD_MIN_LEN },
  { id: 'upper', label: 'One uppercase letter (A–Z)', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lower', label: 'One lowercase letter (a–z)', test: (pw) => /[a-z]/.test(pw) },
  { id: 'number', label: 'One number (0–9)', test: (pw) => /\d/.test(pw) },
];

const COMMON_PASSWORDS = new Set([
  'password1234', 'qwerty123456', '123456789012', 'letmein123456',
  'welcome123456', 'admin1234567', 'iloveyou1234', 'password123!',
  'qwertyuiop12', 'abc123456789', 'Password1234', 'Welcome12345',
]);

export const getPasswordProblems = (pw = '') => {
  const problems = PASSWORD_RULES.filter((r) => !r.test(pw)).map((r) => r.label);
  if (pw && COMMON_PASSWORDS.has(pw)) problems.push('Not a commonly breached password');
  return problems;
};

// antd Form validator
export const passwordValidator = (_, value) => {
  if (!value) return Promise.resolve();
  const problems = getPasswordProblems(value);
  return problems.length
    ? Promise.reject(new Error(`Password needs: ${problems.join(', ')}`))
    : Promise.resolve();
};

// ================= BILLING =================
// ================= INDUSTRIES =================
// One list for signup, company setup and admin user creation. `value` is what is stored in
// users.industry / companies.industry (VARCHAR 64/100) and what the backend _map_industry()
// understands for industry-specific safety content.
export const INDUSTRY_OPTIONS = [
  { value: 'Healthcare', label: 'Healthcare / Hospital' },
  { value: 'Oil & Gas', label: 'Oil & Gas' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Mining', label: 'Mining' },
  { value: 'Utilities / Energy', label: 'Utilities / Energy' },
  { value: 'Transportation', label: 'Transportation & Logistics' },
  { value: 'Pharmaceutical', label: 'Pharmaceutical / Biotech' },
  { value: 'Chemical', label: 'Chemical' },
  { value: 'Aviation', label: 'Aviation' },
  { value: 'Maritime', label: 'Maritime' },
  { value: 'Hospitality', label: 'Hospitality' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Financial Services', label: 'Financial Services' },
  { value: 'Government', label: 'Government / Public Sector' },
  { value: 'Education', label: 'Education / Research' },
  { value: 'Other', label: 'Other' },
];

export const DURATION_OPTIONS = [
  { value: '1_month', label: 'Monthly', per: 'month' },
  { value: '6_month', label: '6 Months', per: '6 months' },
  { value: '1_year', label: 'Annual', per: 'year' },
];

export const durationLabel = (d) => DURATION_OPTIONS.find((o) => o.value === d)?.label || d;
export const durationPer = (d) => DURATION_OPTIONS.find((o) => o.value === d)?.per || d;

// Mirror of COUNTRY_PRICING in app.py. Only used when
// GET /api/plans/country-pricing cannot be reached. The backend always
// charges its own price (see _resolve_server_price), never this one.
export const FALLBACK_COUNTRY_PRICING = {
  Ghana: {
    free: { '1_month': 0, '6_month': 0, '1_year': 0, currency: 'GHS' },
    basic: { '1_month': 100, '6_month': 500, '1_year': 900, currency: 'GHS' },
    pro: { '1_month': 200, '6_month': 1000, '1_year': 1800, currency: 'GHS' },
    enterprise: { '1_month': 'Custom', '6_month': 'Custom', '1_year': 'Custom', currency: 'GHS' },
  },
  Qatar: {
    free: { '1_month': 0, '6_month': 0, '1_year': 0, currency: 'QAR' },
    basic: { '1_month': 100, '6_month': 500, '1_year': 900, currency: 'QAR' },
    pro: { '1_month': 300, '6_month': 1500, '1_year': 2700, currency: 'QAR' },
    enterprise: { '1_month': 'Custom', '6_month': 'Custom', '1_year': 'Custom', currency: 'QAR' },
  },
  'United States': {
    free: { '1_month': 0, '6_month': 0, '1_year': 0, currency: 'USD' },
    basic: { '1_month': 50, '6_month': 250, '1_year': 370, currency: 'USD' },
    pro: { '1_month': 100, '6_month': 500, '1_year': 950, currency: 'USD' },
    enterprise: { '1_month': 'Custom', '6_month': 'Custom', '1_year': 'Custom', currency: 'USD' },
  },
  default: {
    free: { '1_month': 0, '6_month': 0, '1_year': 0, currency: 'USD' },
    basic: { '1_month': 50, '6_month': 250, '1_year': 370, currency: 'USD' },
    pro: { '1_month': 100, '6_month': 250, '1_year': 450, currency: 'USD' },
    enterprise: { '1_month': 'Custom', '6_month': 'Custom', '1_year': 'Custom', currency: 'USD' },
  },
};

/** Fetch the exact prices the backend will charge for a country. Never throws. */
export async function fetchCountryPricing(country) {
  const key = country && country !== 'default' ? country : 'default';
  try {
    const res = await api.get('/plans/country-pricing', {
      params: { country: key },
      validateStatus: () => true,
    });
    if (res.status === 200 && res.data?.pricing) return res.data.pricing;
  } catch (e) {
    // fall through to the local mirror
  }
  return FALLBACK_COUNTRY_PRICING[key] || FALLBACK_COUNTRY_PRICING.default;
}

/** { amount, currency, isCustom, isFree } for a plan + duration. */
export const getPlanPrice = (pricing, planId, duration) => {
  if (planId === 'custom') return { amount: null, currency: 'USD', isCustom: true, isFree: false };
  const p = pricing?.[planId];
  if (!p) return { amount: null, currency: 'USD', isCustom: true, isFree: false };
  const amount = p[duration] ?? p['1_month'];
  const isCustom = typeof amount !== 'number';
  return { amount: isCustom ? null : amount, currency: p.currency || 'USD', isCustom, isFree: amount === 0 };
};

const CURRENCY_SYMBOLS = { USD: '$', GHS: 'GH₵', QAR: 'QR ', INR: '₹', EUR: '€', GBP: '£' };

export const formatPrice = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'Custom pricing';
  if (amount === 0) return 'Free';
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${symbol}${Number(amount).toLocaleString()}`;
};

// ================= LEGAL ENTITY & PAYMENT ACCOUNTS =================
// SafetyTrack Pro is operated by this registered company. If you register a new
// company later, change it here AND set COMPANY_LEGAL_NAME on the backend (Railway env).
export const LEGAL_ENTITY_NAME = 'AfdalTech Solutions';

// The ONLY real accounts customers may pay into. Every page reads from here.
export const PAYMENT_ACCOUNTS = {
  bank: {
    bankName: 'GCB Bank',
    accountNumber: '4151440001070',
    accountName: LEGAL_ENTITY_NAME,
  },
  momo: {
    network: 'MTN Mobile Money',
    number: '0553841216',
    accountName: 'Aadm Fusheini', // name MTN shows the sender
    ussd: '*170#',
  },
};

export const MANUAL_PAYMENT_DETAILS = {
  bank_transfer: {
    label: 'Bank Transfer',
    rows: [
      ['Bank', PAYMENT_ACCOUNTS.bank.bankName],
      ['Account number', PAYMENT_ACCOUNTS.bank.accountNumber],
      ['Account name', PAYMENT_ACCOUNTS.bank.accountName],
    ],
  },
  mobile_money: {
    label: 'Mobile Money',
    rows: [
      ['Network', PAYMENT_ACCOUNTS.momo.network],
      ['Number', PAYMENT_ACCOUNTS.momo.number],
      ['Name', PAYMENT_ACCOUNTS.momo.accountName],
    ],
  },
};

// ================= ACCOUNT JOURNEYS (shown to users) =================
export const USER_JOURNEY = [
  'Create your account',
  'Verify your email with the 6-digit code',
  'Activate your plan (Free starts instantly; paid plans after payment)',
  'Sign in and start using SafetyTrack Pro',
];

export const ADMIN_JOURNEY = [
  'Register your organization',
  'Verify your email with the 6-digit code',
  'Our team reviews and approves your account (usually within 24 hours)',
  'Sign in and confirm your Enterprise / Custom plan with our sales team',
  'Open your admin dashboard and add your employees',
];

// Messages for login outcomes that are not plain success
export const LOGIN_NOTICES = {
  needs_approval: {
    title: 'Waiting for approval',
    text: 'Your administrator account is verified and is being reviewed by the SafetyTrack Pro team. We will email you as soon as it is approved (usually within 24 hours).',
  },
  company_inactive: {
    title: 'Company subscription inactive',
    text: "Your company's SafetyTrack Pro subscription is not active. Please ask your company administrator to renew it, then sign in again.",
  },
  guardian: {
    title: 'Waiting for parent / guardian consent',
    text: 'Your parent or guardian must approve your account before you can sign in. Ask them to check their email.',
  },
  deactivated: {
    title: 'Account deactivated',
    text: 'Your account has been deactivated. Please contact support.',
  },
};
