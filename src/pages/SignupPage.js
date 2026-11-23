// src/pages/SignupPage.js
// Signup for individual users and company administrators.
//
// USER  : Type -> Basic info -> Security & consents -> Plan -> Create account
//         -> verify email -> Free: active now | Paid: checkout | Enterprise: sales team
// ADMIN : Type -> Basic info -> Security & consents (incl. DPA) -> Plan -> Submit
//         -> verify email -> /pending-approval (our team approves) -> sign in
//
// Backend: POST /api/auth/register (users)   POST /api/admin/register (admins)
//          POST /api/verify                   GET  /api/plans/country-pricing
//          POST /api/contact                  POST /api/payment/... (checkout)
import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Alert,
  Card,
  Typography,
  Space,
  Divider,
  message,
  Steps,
  Tag,
  Modal,
  Row,
  Col,
  Spin,
  Checkbox,
  ConfigProvider,
  theme
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  TeamOutlined,
  CrownOutlined,
  CreditCardOutlined,
  DollarOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';

import VerificationModal from '../components/VerificationModal';
import ManualPaymentModal from '../components/ManualPaymentModal';
import { useLanguage } from '../context/LanguageContext';
import PaymentService from '../services/paymentService';
import api from '../services/api';
import {
  POLICY_VERSIONS,
  MIN_AGE,
  MINOR_AGE_FLOOR,
  PASSWORD_RULES,
  getPasswordProblems,
  passwordValidator,
  DURATION_OPTIONS,
  durationLabel,
  durationPer,
  FALLBACK_COUNTRY_PRICING,
  fetchCountryPricing,
  getPlanPrice,
  formatPrice,
  USER_JOURNEY,
  ADMIN_JOURNEY,
  INDUSTRY_OPTIONS
} from '../constants/accountFlow';
import './AuthPages.css';

const { Title, Text } = Typography;
const { Option } = Select;

// Policy versions (shared with backend CURRENT_*_VERSION)
const TERMS_VERSION = POLICY_VERSIONS.TERMS;
const PRIVACY_VERSION = POLICY_VERSIONS.PRIVACY;
const DPA_VERSION = POLICY_VERSIONS.DPA;
const BAA_VERSION = POLICY_VERSIONS.BAA;

const scorePassword = (pw) => {
  if (!pw) return { score: 0, label: '', color: '#ff4d4f' };
  if (getPasswordProblems(pw).length) return { score: 1, label: 'Does not meet the requirements yet', color: '#ff4d4f' };
  let score = 2;
  if (pw.length >= 16) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Weak', 'Good', 'Strong', 'Very strong'];
  const colors = ['#ff4d4f', '#ff4d4f', '#faad14', '#52c41a', '#237804'];
  return { score, label: labels[score], color: colors[score] };
};

const PHONE_PATTERN = /^[+\d\s()-]{7,30}$/; // same rule as backend /api/contact
const SIGNUP_PHONE_PATTERN = /^[+\d\s()-]{7,20}$/; // same rule as backend _clean_phone (VARCHAR 20)

// INDUSTRY_OPTIONS now comes from constants/accountFlow (shared with company setup and admin user creation)

const REGION_BY_COUNTRY = (country) => {
  const EU = ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Iceland', 'Liechtenstein', 'Norway'];
  if (EU.includes(country)) return { region: 'EU', regulator: 'GDPR / EU supervisory authority', residency: 'EU (Frankfurt)' };
  if (country === 'Qatar') return { region: 'GCC-QA', regulator: 'Qatar NDPPL 2016', residency: 'Qatar / GCC' };
  if (country === 'United Arab Emirates') return { region: 'GCC-AE', regulator: 'UAE PDPL', residency: 'UAE / GCC' };
  if (country === 'Saudi Arabia') return { region: 'GCC-SA', regulator: 'Saudi PDPL', residency: 'KSA / GCC' };
  if (country === 'United States') return { region: 'US', regulator: 'HIPAA (if ePHI) / state laws', residency: 'United States' };
  if (country === 'United Kingdom') return { region: 'UK', regulator: 'UK GDPR / DPA 2018', residency: 'United Kingdom' };
  if (country === 'Ghana') return { region: 'AF-GH', regulator: 'Ghana DPA 2012 (Act 843)', residency: 'Ghana' };
  return { region: 'GLOBAL', regulator: 'Local data-protection law', residency: 'Default region' };
};

const getAge = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age;
};

// ============================================
// PLAN DEFINITIONS
// ============================================
const PLANS = {
  "free": {
    "label": "Free Forever",
    "limits": { "uploads_per_month": 5, "api_calls_per_month": 50, "team_members": 1, "monitoring_stations": 1, "ai_requests_per_month": 10, "camera_feeds": 1, "video_analysis_minutes": 10 },
    "features": [
      "Basic document analysis",
      "Email notifications",
      "5 document uploads per month",
      "50 API calls per month",
      "10 AI requests per month",
      "1 team member",
      "1 monitoring station",
      "1 camera feed",
      "10 minutes video analysis"
    ]
  },
  "basic": {
    "label": "Basic",
    "limits": { "uploads_per_month": 100, "api_calls_per_month": 1000, "team_members": 10, "monitoring_stations": 5, "ai_requests_per_month": 100, "camera_feeds": 3, "video_analysis_minutes": 120 },
    "features": [
      "All Free features",
      "PDF/Word/Excel generation",
      "Basic analytics",
      "100 document uploads per month",
      "1000 API calls per month",
      "100 AI requests per month",
      "Up to 10 team members",
      "Up to 5 monitoring stations",
      "Up to 3 camera feeds",
      "2 hours video analysis"
    ]
  },
  "pro": {
    "label": "Professional",
    "limits": { "uploads_per_month": 500, "api_calls_per_month": 5000, "team_members": 50, "monitoring_stations": 20, "ai_requests_per_month": 500, "camera_feeds": 10, "video_analysis_minutes": 600 },
    "features": [
      "All Basic features",
      "ML image analysis",
      "Advanced analytics",
      "Team management",
      "500 document uploads per month",
      "5000 API calls per month",
      "500 AI requests per month",
      "Up to 50 team members",
      "Up to 20 monitoring stations",
      "Up to 10 camera feeds",
      "10 hours video analysis",
      "Real-time monitoring alerts",
      "Priority email support",
      "Custom reporting"
    ]
  },
  "enterprise": {
    "label": "Enterprise",
    "limits": { "uploads_per_month": "Unlimited", "api_calls_per_month": "Unlimited", "team_members": "Unlimited", "monitoring_stations": "Unlimited", "ai_requests_per_month": "Unlimited", "camera_feeds": "Unlimited", "video_analysis_minutes": "Unlimited" },
    "features": [
      "All Pro features",
      "Custom workflows & forms",
      "API Integration",
      "Advanced analytics & custom dashboards",
      "Dedicated infrastructure (SLA)",
      "On-premise deployment options",
      "Dedicated account manager & support",
      "Custom training & onboarding",
      "White-labeling options",
      "Advanced AI models",
      "Predictive analytics",
      "Custom integrations"
    ]
  },
  "custom": {
    "label": "Custom Enterprise",
    "features": [
      "Fully customized solution",
      "Tailored workflows & forms",
      "Complete API Integration",
      "Custom dashboards & reports",
      "Dedicated infrastructure",
      "On-premise or cloud deployment",
      "Dedicated account manager & support team",
      "Custom training & onboarding",
      "White-labeling options",
      "Advanced AI & ML models",
      "Predictive analytics & insights",
      "Custom integrations & APIs",
      "24/7 premium support"
    ],
    "isCustom": true
  }
};

// ============================================
// COUNTRY OPTIONS
// ============================================
const countryOptions = [
  { code: 'AF', name: 'Afghanistan' }, { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' }, { code: 'AO', name: 'Angola' }, { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' }, { code: 'AM', name: 'Armenia' }, { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' }, { code: 'AZ', name: 'Azerbaijan' }, { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' }, { code: 'BD', name: 'Bangladesh' }, { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' }, { code: 'BE', name: 'Belgium' }, { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' }, { code: 'BT', name: 'Bhutan' }, { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' }, { code: 'BW', name: 'Botswana' }, { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' }, { code: 'BG', name: 'Bulgaria' }, { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' }, { code: 'CV', name: 'Cabo Verde' }, { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' }, { code: 'CA', name: 'Canada' }, { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' }, { code: 'CL', name: 'Chile' }, { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' }, { code: 'KM', name: 'Comoros' }, { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'Congo (Democratic Republic)' }, { code: 'CR', name: 'Costa Rica' }, { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'HR', name: 'Croatia' }, { code: 'CU', name: 'Cuba' }, { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' }, { code: 'DK', name: 'Denmark' }, { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' }, { code: 'DO', name: 'Dominican Republic' }, { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' }, { code: 'SV', name: 'El Salvador' }, { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' }, { code: 'EE', name: 'Estonia' }, { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' }, { code: 'FJ', name: 'Fiji' }, { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' }, { code: 'GA', name: 'Gabon' }, { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' }, { code: 'DE', name: 'Germany' }, { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' }, { code: 'GD', name: 'Grenada' }, { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' }, { code: 'GW', name: 'Guinea-Bissau' }, { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' }, { code: 'HN', name: 'Honduras' }, { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' }, { code: 'IN', name: 'India' }, { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' }, { code: 'IQ', name: 'Iraq' }, { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' }, { code: 'IT', name: 'Italy' }, { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' }, { code: 'JO', name: 'Jordan' }, { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' }, { code: 'KI', name: 'Kiribati' }, { code: 'KP', name: 'Korea (North)' },
  { code: 'KR', name: 'Korea (South)' }, { code: 'KW', name: 'Kuwait' }, { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' }, { code: 'LV', name: 'Latvia' }, { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' }, { code: 'LR', name: 'Liberia' }, { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' }, { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' }, { code: 'MW', name: 'Malawi' }, { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' }, { code: 'ML', name: 'Mali' }, { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' }, { code: 'MR', name: 'Mauritania' }, { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' }, { code: 'FM', name: 'Micronesia' }, { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' }, { code: 'MN', name: 'Mongolia' }, { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' }, { code: 'MZ', name: 'Mozambique' }, { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' }, { code: 'NR', name: 'Nauru' }, { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' }, { code: 'NZ', name: 'New Zealand' }, { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' }, { code: 'NG', name: 'Nigeria' }, { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' }, { code: 'OM', name: 'Oman' }, { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' }, { code: 'PS', name: 'Palestine' }, { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' }, { code: 'PY', name: 'Paraguay' }, { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' }, { code: 'PL', name: 'Poland' }, { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' }, { code: 'RO', name: 'Romania' }, { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' }, { code: 'KN', name: 'Saint Kitts and Nevis' }, { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' }, { code: 'WS', name: 'Samoa' }, { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' }, { code: 'SA', name: 'Saudi Arabia' }, { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' }, { code: 'SC', name: 'Seychelles' }, { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' }, { code: 'SK', name: 'Slovakia' }, { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' }, { code: 'SO', name: 'Somalia' }, { code: 'ZA', name: 'South Africa' },
  { code: 'SS', name: 'South Sudan' }, { code: 'ES', name: 'Spain' }, { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' }, { code: 'SR', name: 'Suriname' }, { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' }, { code: 'SY', name: 'Syria' }, { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' }, { code: 'TZ', name: 'Tanzania' }, { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' }, { code: 'TG', name: 'Togo' }, { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' }, { code: 'TN', name: 'Tunisia' }, { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' }, { code: 'TV', name: 'Tuvalu' }, { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' }, { code: 'AE', name: 'United Arab Emirates' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' }, { code: 'UY', name: 'Uruguay' }, { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' }, { code: 'VA', name: 'Vatican City' }, { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' }, { code: 'YE', name: 'Yemen' }, { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
];

// ============================================
// ROLE OPTIONS
// ============================================
const userRoleOptions = [
  { value: 'Safety Officer', label: 'Safety Officer' },
  { value: 'Environmental Officer', label: 'Environmental Officer' },
  { value: 'QA/QC Officer', label: 'QA/QC Officer' },
  { value: 'Infection Control Officer', label: 'Infection Control Officer' },
  { value: 'BioSafety Officer', label: 'BioSafety Officer' },
  { value: 'Radiation Safety Officer', label: 'Radiation Safety Officer' },
  { value: 'Hospital Administrator', label: 'Hospital Administrator' },
  { value: 'Chief Medical Officer', label: 'Chief Medical Officer' },
  { value: 'Head Nurse', label: 'Head Nurse' },
  { value: 'Healthcare Professional', label: 'Healthcare Professional' },
  { value: 'Other', label: 'Other' },
];

const adminRoleOptions = [
  { value: 'Hospital Administrator', label: 'Hospital Administrator' },
  { value: 'IT Manager', label: 'IT Manager' },
  { value: 'Safety Director', label: 'Safety Director' },
  { value: 'Compliance Manager', label: 'Compliance Manager' },
  { value: 'Operations Manager', label: 'Operations Manager' },
];

// ============================================
// PAYMENT METHODS
// ============================================
const PAYMENT_METHODS = [
  { id: 'paystack', name: 'Paystack — Card / Mobile Money', icon: <CreditCardOutlined />, description: 'Pay online. Your plan activates immediately.', instant: true, color: '#1890ff' },
  { id: 'paypal', name: 'PayPal', icon: <DollarOutlined />, description: 'Pay online. Your plan activates immediately.', instant: true, color: '#003087' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: <BankOutlined />, description: 'Activates after our team confirms the transfer (24–48h).', instant: false, color: '#faad14' },
  { id: 'mobile_money', name: 'Mobile Money (manual transfer)', icon: <PhoneOutlined />, description: 'Activates after our team confirms the transfer (24–48h).', instant: false, color: '#faad14' }
];

// ============================================
// MAIN COMPONENT
// ============================================
function SignupPage() {
  const history = useHistory();
  const location = useLocation();
  const initialType = new URLSearchParams(location.search).get('type') === 'admin' ? 'admin' : 'user';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState(initialType);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('default');
  const [selectedDuration, setSelectedDuration] = useState('1_month');
  const [pricing, setPricing] = useState(FALLBACK_COUNTRY_PRICING.default);
  const [formData, setFormData] = useState({});
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [userId, setUserId] = useState(null);

  // payment / contact
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [manualMethod, setManualMethod] = useState(null);
  const [showCustomPlanModal, setShowCustomPlanModal] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSending, setContactSending] = useState(false);

  // compliance / security
  const [isMinor, setIsMinor] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [residency, setResidency] = useState(REGION_BY_COUNTRY('default'));
  const [honeypot, setHoneypot] = useState('');

  const passwordRef = useRef(null);   // password lives only in memory, never in storage
  const restoredRef = useRef(false);
  const finishedRef = useRef(false);

  const { availableLanguages } = useLanguage();
  const [form] = Form.useForm();

  const isAdmin = userType === 'admin';

  // ============================================
  // PLAN HELPERS
  // ============================================
  const getAvailablePlans = () => (isAdmin ? ['enterprise', 'custom'] : ['free', 'basic', 'pro', 'enterprise']);
  const activePlan = getAvailablePlans().includes(selectedPlan) ? selectedPlan : (isAdmin ? 'enterprise' : 'free');
  const priceOf = (planId) => getPlanPrice(pricing, planId, selectedDuration);

  // ============================================
  // RESTORE SAVED PROGRESS (never includes the password)
  // ============================================
  useEffect(() => {
    const saved = sessionStorage.getItem('signupState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setUserId(state.userId || null);
        setUserType(state.userType === 'admin' ? 'admin' : 'user');
        setCurrentEmail(state.email || '');
        setContactEmail(state.email || '');
        setSelectedCountry(state.country || 'default');
        setResidency(REGION_BY_COUNTRY(state.country || 'default'));
        setRegistrationComplete(!!state.registrationComplete);
        setSelectedPlan(state.selectedPlan || null);
        setSelectedDuration(state.selectedDuration || '1_month');
        setCurrentStep(state.currentStep || 0);
        setVerificationCompleted(!!state.verified);

        if (state.formData) {
          const restored = { ...state.formData };
          // Force re-consent if policy versions changed since the user ticked them
          if (state.termsVersion !== TERMS_VERSION || state.privacyVersion !== PRIVACY_VERSION) {
            restored.termsAccepted = false;
            restored.eConsent = false;
            restored.dpaAccepted = false;
          }
          delete restored.password;
          delete restored.confirmPassword;
          setFormData(restored);
          form.setFieldsValue(restored);
          const age = getAge(restored.dateOfBirth);
          setIsMinor(age !== null && age < MIN_AGE);
        }
        if (state.showVerification) setShowVerification(true);
        message.info('Welcome back — we restored your signup progress.');
      } catch (e) {
        sessionStorage.removeItem('signupState');
      }
    }
    restoredRef.current = true;
  }, []); // run once on mount

  // ============================================
  // AUTO-SAVE PROGRESS (runs after state is committed, so it is never stale)
  // ============================================
  useEffect(() => {
    if (!restoredRef.current || finishedRef.current) return;
    if (currentStep === 0 && !registrationComplete && Object.keys(formData).length === 0) return;
    const safeFormData = { ...formData };
    delete safeFormData.password;
    delete safeFormData.confirmPassword;
    sessionStorage.setItem('signupState', JSON.stringify({
      userId,
      userType,
      email: currentEmail || safeFormData.email,
      country: selectedCountry,
      registrationComplete,
      selectedPlan,
      selectedDuration,
      currentStep,
      verified: verificationCompleted,
      formData: safeFormData,
      showVerification,
      termsVersion: TERMS_VERSION,
      privacyVersion: PRIVACY_VERSION,
      timestamp: new Date().toISOString()
    }));
  }, [userId, userType, currentEmail, selectedCountry, registrationComplete, selectedPlan,
      selectedDuration, currentStep, verificationCompleted, formData, showVerification]);

  // ============================================
  // PRICES — exactly what the backend will charge for this country
  // ============================================
  useEffect(() => {
    let cancelled = false;
    fetchCountryPricing(selectedCountry).then((p) => { if (!cancelled) setPricing(p); });
    return () => { cancelled = true; };
  }, [selectedCountry]);

  const clearSignupState = () => {
    finishedRef.current = true;
    sessionStorage.removeItem('signupState');
  };

  // ============================================
  // STEP 1: Account type
  // ============================================
  const renderUserTypeStep = () => (
    <div className="step-content">
      <div className="user-type-selection">
        <Title level={4}>Choose Account Type</Title>
        <Text type="secondary">Select the type of account that best fits your needs</Text>

        <div className="user-type-cards" role="radiogroup" aria-label="Account type">
          <div
            role="radio"
            aria-checked={userType === 'user'}
            tabIndex={0}
            className={`user-type-card ${userType === 'user' ? 'selected' : ''}`}
            onClick={() => setUserType('user')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setUserType('user'); } }}
          >
            <div className="card-icon"><UserOutlined /></div>
            <div className="card-content">
              <Title level={5}>Standard User</Title>
              <Text>For safety, health and quality professionals</Text>
              <ul>
                <li>Safety modules</li>
                <li>Incident reporting</li>
                <li>Document management</li>
              </ul>
            </div>
          </div>

          <div
            role="radio"
            aria-checked={userType === 'admin'}
            tabIndex={0}
            className={`user-type-card ${userType === 'admin' ? 'selected' : ''}`}
            onClick={() => setUserType('admin')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setUserType('admin'); } }}
          >
            <div className="card-icon admin"><BankOutlined /></div>
            <div className="card-content">
              <Title level={5}>Company Administrator</Title>
              <Text>Register your organization and manage its team</Text>
              <ul>
                <li>User & employee management</li>
                <li>Company-wide configuration</li>
                <li>Advanced analytics</li>
              </ul>
            </div>
          </div>
        </div>

        <Alert
          type="info"
          showIcon
          style={{ marginTop: 16 }}
          message={isAdmin ? 'How company registration works' : 'How signup works'}
          description={
            <ol style={{ margin: '8px 0 0', paddingLeft: 20 }}>
              {(isAdmin ? ADMIN_JOURNEY : USER_JOURNEY).map((s) => <li key={s}>{s}</li>)}
            </ol>
          }
        />
        {!isAdmin && (
          <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
            Employees don't sign up here — your company administrator creates your account and sends you the sign-in details.
          </Text>
        )}
      </div>
    </div>
  );

  // ============================================
  // STEP 2: Basic info
  // ============================================
  const renderBasicInfoStep = () => (
    <div className="step-content">
      {/* Honeypot (bots fill it, people never see it) */}
      <div style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="hp_company_url">Website</label>
        <input
          id="hp_company_url"
          name="company_url"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <Form.Item name="name" label="Full Name" rules={[{ required: true, whitespace: true, message: 'Please enter your full name' }]}>
        <Input placeholder="Enter your full name" prefix={<UserOutlined />} size="large" autoComplete="name" />
      </Form.Item>

      <Form.Item
        name="email"
        label={isAdmin ? 'Work Email Address' : 'Email Address'}
        extra="We'll send a 6-digit verification code to this address."
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input placeholder="you@example.com" prefix={<MailOutlined />} size="large" autoComplete="email" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone Number"
        rules={[
          { required: isAdmin, message: 'Phone number is required for administrators' },
          // Account phone is stored in a 20-character column (users.phone / companies.phone)
          { pattern: SIGNUP_PHONE_PATTERN, message: 'Use digits, spaces, + ( ) - only (7–20 characters)' }
        ]}
      >
        <Input placeholder="+233 55 123 4567" prefix={<PhoneOutlined />} size="large" autoComplete="tel" />
      </Form.Item>

      <Form.Item
        name="dateOfBirth"
        label="Date of Birth"
        extra={isAdmin ? `Company administrators must be at least ${MIN_AGE}.` : undefined}
        rules={[
          { required: true, message: 'Please enter your date of birth' },
          {
            validator: (_, v) => {
              if (!v) return Promise.resolve();
              const age = getAge(v);
              if (age === null) return Promise.reject(new Error('Invalid date'));
              if (age > 120) return Promise.reject(new Error('Please enter a valid date of birth'));
              if (age < MINOR_AGE_FLOOR) return Promise.reject(new Error(`You must be at least ${MINOR_AGE_FLOOR} to use this service.`));
              if (isAdmin && age < MIN_AGE) return Promise.reject(new Error(`Company administrators must be at least ${MIN_AGE}.`));
              return Promise.resolve();
            }
          }
        ]}
      >
        <Input
          type="date"
          size="large"
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => {
            const age = getAge(e.target.value);
            setIsMinor(age !== null && age < MIN_AGE);
          }}
        />
      </Form.Item>

      {isMinor && !isAdmin && (
        <>
          <Alert
            type="warning"
            showIcon
            message="Parent / Guardian Consent Required"
            description={`Because you are under ${MIN_AGE}, a parent or guardian must approve your account before you can sign in.`}
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name="guardianEmail"
            label="Parent / Guardian Email"
            rules={[
              { required: true, message: 'Guardian email is required for users under 18' },
              { type: 'email', message: 'Enter a valid guardian email' },
              {
                validator: (_, v) => {
                  const selfEmail = form.getFieldValue('email');
                  if (v && selfEmail && v.toLowerCase() === selfEmail.toLowerCase()) {
                    return Promise.reject(new Error('Guardian email must be different from your own'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input placeholder="guardian@example.com" prefix={<MailOutlined />} size="large" />
          </Form.Item>
        </>
      )}

      <Form.Item name="industry" label="Organization Industry" rules={[{ required: true, message: 'Please select your industry' }]}>
        <Select placeholder="Select industry" size="large">
          {INDUSTRY_OPTIONS.map((o) => (
            <Option key={o.value} value={o.value}>{o.label}</Option>
          ))}
        </Select>
      </Form.Item>

      {isAdmin && (
        <>
          <Form.Item name="companyName" label="Organization Name" rules={[{ required: true, whitespace: true, message: 'Please enter organization name' }]}>
            <Input placeholder="Organization name" prefix={<BankOutlined />} size="large" />
          </Form.Item>
          <Form.Item name="employeeCount" label="Number of Employees" rules={[{ required: true, message: 'Please enter employee count' }]}>
            <Input type="number" placeholder="e.g. 120" size="large" min={1} max={1000000} />
          </Form.Item>
        </>
      )}
    </div>
  );

  // ============================================
  // STEP 3: Security & consents
  // ============================================
  const renderSecurityStep = () => {
    const currentCountry = form.getFieldValue('country');
    const score = scorePassword(passwordValue);
    return (
      <div className="step-content">
        <Form.Item
          name="password"
          label="Create Password"
          rules={[{ required: true, message: 'Please enter a password' }, { validator: passwordValidator }]}
          hasFeedback
        >
          <Input.Password
            placeholder="Create a strong password"
            prefix={<LockOutlined />}
            size="large"
            autoComplete="new-password"
            onChange={(e) => setPasswordValue(e.target.value)}
          />
        </Form.Item>

        <div style={{ marginTop: -8, marginBottom: 16 }}>
          {PASSWORD_RULES.map((r) => {
            const ok = r.test(passwordValue);
            return (
              <div key={r.id} style={{ fontSize: 12, color: ok ? '#52c41a' : '#8c8c8c' }}>
                <CheckCircleOutlined style={{ marginRight: 6 }} />{r.label}
              </div>
            );
          })}
          {score.label && (
            <>
              <div style={{ height: 6, borderRadius: 3, background: '#f0f0f0', overflow: 'hidden', marginTop: 6 }}>
                <div style={{ width: `${(score.score / 4) * 100}%`, height: '100%', background: score.color, transition: 'width 0.2s' }} />
              </div>
              <Text style={{ color: score.color, fontSize: 12 }}>{score.label}</Text>
            </>
          )}
        </div>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('Passwords do not match'));
              }
            })
          ]}
        >
          <Input.Password placeholder="Confirm password" prefix={<LockOutlined />} size="large" autoComplete="new-password" />
        </Form.Item>

        <Form.Item name="country" label="Country" extra="Used for your local prices and data-protection rules." rules={[{ required: true, message: 'Please select your country' }]}>
          <Select
            showSearch
            placeholder="Select country"
            optionFilterProp="children"
            size="large"
            onChange={(val) => {
              setSelectedCountry(val);
              setResidency(REGION_BY_COUNTRY(val));
            }}
            filterOption={(input, option) => String(option.children).toLowerCase().includes(input.toLowerCase())}
          >
            {countryOptions.map((c) => (
              <Option key={c.code} value={c.name}>{c.name}</Option>
            ))}
          </Select>
        </Form.Item>

        {currentCountry && (
          <Alert
            type="info"
            showIcon
            icon={<GlobalOutlined />}
            message={`Data protection: ${residency.regulator}`}
            description={`Your data is processed under ${residency.regulator}.`}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          name="role"
          label={isAdmin ? 'Your Role' : 'Professional Role'}
          rules={[{ required: true, message: 'Please select your role' }]}
        >
          <Select placeholder="Select your role" size="large">
            {(isAdmin ? adminRoleOptions : userRoleOptions).map((r) => (
              <Option key={r.value} value={r.value}>{r.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="preferredLanguage" label="Language" initialValue="en" rules={[{ required: true, message: 'Please select language' }]}>
          <Select placeholder="Select language" size="large" data-testid="language-select">
            {availableLanguages.map((lang) => (
              <Option key={lang.code} value={lang.code}>
                <span className="language-flag">{lang.flag}</span>
                {lang.nativeName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Divider orientation="left">Consents & Agreements</Divider>

        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="What we collect and why"
          description={
            <>
              We collect your name, email, phone, date of birth, country, role and organization to create and secure your
              account and to provide our HSE services. We do not sell your data. See our{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> for your rights and retention periods.
            </>
          }
        />

        {/* Required — never pre-ticked */}
        <Form.Item
          name="termsAccepted"
          valuePropName="checked"
          rules={[{ validator: (_, v) => (v === true ? Promise.resolve() : Promise.reject(new Error('You must accept the Terms and Privacy Policy'))) }]}
        >
          <Checkbox>
            I have read and agree to the{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> (v{TERMS_VERSION}) and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> (v{PRIVACY_VERSION}).
            <span style={{ fontSize: 11, color: '#888', display: 'block' }}>
              Your acceptance, IP address, timestamp and policy version will be recorded.
            </span>
          </Checkbox>
        </Form.Item>

        <Form.Item
          name="eConsent"
          valuePropName="checked"
          rules={[{ validator: (_, v) => (v === true ? Promise.resolve() : Promise.reject(new Error('Consent to electronic records is required'))) }]}
        >
          <Checkbox>
            I consent to receive account notices, invoices, security alerts and legal communications electronically.
          </Checkbox>
        </Form.Item>

        {isAdmin && (
          <Form.Item
            name="dpaAccepted"
            valuePropName="checked"
            rules={[{ validator: (_, v) => (v === true ? Promise.resolve() : Promise.reject(new Error('You must accept the Data Processing Agreement to register a company'))) }]}
          >
            <Checkbox>
              On behalf of my organization, I accept the{' '}
              <a href="/dpa" target="_blank" rel="noopener noreferrer">Data Processing Agreement</a> (v{DPA_VERSION}) and, where applicable, the{' '}
              <a href="/baa" target="_blank" rel="noopener noreferrer">Business Associate Agreement</a> (v{BAA_VERSION}).
            </Checkbox>
          </Form.Item>
        )}

        <Form.Item name="marketingConsent" valuePropName="checked">
          <Checkbox>Send me product updates, HSE compliance news and training invitations (optional).</Checkbox>
        </Form.Item>
      </div>
    );
  };

  // ============================================
  // STEP 4: Plan
  // ============================================
  const renderPlanInstructions = () => {
    if (registrationComplete && !verificationCompleted) {
      return (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
          message="Verify your email to continue"
          description={`Enter the 6-digit code we sent to ${currentEmail || formData.email || 'your email'}.`}
          action={<Button size="small" type="primary" onClick={() => setShowVerification(true)}>Enter code</Button>}
        />
      );
    }
    if (registrationComplete && verificationCompleted) {
      return (
        <Alert type="success" showIcon style={{ marginBottom: 24 }} message="Email verified"
          description="Confirm your plan below to finish." />
      );
    }
    return (
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message={isAdmin ? 'Choose your organization plan' : 'Choose your plan'}
        description={isAdmin
          ? 'Enterprise and Custom prices are agreed with our sales team after your account is approved. Nothing is charged now.'
          : 'Free starts right after you verify your email. Paid plans go to secure checkout after verification. Enterprise connects you with our sales team.'}
      />
    );
  };

  const renderPlanStep = () => {
    const availablePlans = getAvailablePlans();
    const showBilling = !isAdmin && !priceOf(activePlan).isCustom;

    return (
      <div className="step-content">
        {renderPlanInstructions()}

        {showBilling && (
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <Text strong>Billing cycle: </Text>
            <Select value={selectedDuration} onChange={setSelectedDuration} style={{ width: 150 }}>
              {DURATION_OPTIONS.map((d) => <Option key={d.value} value={d.value}>{d.label}</Option>)}
            </Select>
          </div>
        )}

        <Row gutter={[16, 16]}>
          {availablePlans.map((planId) => {
            const plan = PLANS[planId];
            const price = priceOf(planId);
            const isSelected = activePlan === planId;
            const select = () => { if (!registrationComplete || !isAdmin) setSelectedPlan(planId); };

            return (
              <Col xs={24} md={isAdmin ? 12 : 12} lg={isAdmin ? 12 : 6} key={planId}>
                <Card
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  className={`plan-card ${isSelected ? 'selected' : ''}`}
                  style={{ border: isSelected ? '2px solid #1890ff' : undefined, height: '100%', cursor: 'pointer' }}
                  onClick={select}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } }}
                  hoverable
                >
                  {planId === 'pro' && <Tag color="purple" style={{ marginBottom: 8 }}>Most Popular</Tag>}
                  {planId === 'free' && <Tag color="green" style={{ marginBottom: 8 }}>Free</Tag>}
                  {price.isCustom && <Tag color="gold" style={{ marginBottom: 8 }}><CrownOutlined /> Contact sales</Tag>}

                  <Title level={4} style={{ marginBottom: 4 }}>{plan.label}</Title>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 22, color: price.isCustom ? '#fa8c16' : '#1890ff' }}>
                      {formatPrice(price.amount, price.currency)}
                    </Text>
                    {!price.isCustom && !price.isFree && (
                      <Text type="secondary" style={{ fontSize: 12 }}> / {durationPer(selectedDuration)}</Text>
                    )}
                  </div>

                  <Divider style={{ margin: '12px 0' }} />
                  {plan.features.slice(0, 6).map((feature) => (
                    <div key={feature} style={{ padding: '3px 0', fontSize: 13 }}>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {feature}
                    </div>
                  ))}
                  {isSelected && <Tag color="blue" style={{ marginTop: 8 }}><CheckCircleOutlined /> Selected</Tag>}
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  // ============================================
  // ACCOUNT CREATION
  // ============================================
  const handleCreateAccount = async () => {
    setError('');
    const live = form.getFieldsValue(true);

    if (live.termsAccepted !== true || live.eConsent !== true || (isAdmin && live.dpaAccepted !== true)) {
      setError('Please accept the required agreements in the Security step.');
      setCurrentStep(2);
      return;
    }
    if (!passwordRef.current) {
      setError('For your security we never store your password between steps. Please re-enter it in the Security step.');
      setCurrentStep(2);
      return;
    }
    const all = { ...formData, ...live };
    if (!all.email || !all.name || !all.dateOfBirth || (isAdmin && !all.companyName)) {
      setError('Some details are missing. Please complete the Basic Info step.');
      setCurrentStep(1);
      return;
    }
    if (honeypot) {
      setError('Registration failed. Please try again.');
      return;
    }

    // Individuals always start on Free; paid plans are bought right after email verification.
    const plan = isAdmin ? activePlan : 'free';
    const email = all.email.toLowerCase().trim();
    const payload = {
      name: all.name.trim(),
      email,
      password: passwordRef.current,
      phone: all.phone || '',
      country: all.country || '',
      role: all.role || '',
      preferred_language: all.preferredLanguage || 'en',
      user_type: userType,
      company_name: (all.companyName || '').trim(),
      employee_count: parseInt(all.employeeCount, 10) || 0,
      industry: all.industry || 'Other',
      date_of_birth: all.dateOfBirth,
      guardian_email: isMinor && !isAdmin ? all.guardianEmail : null,
      terms_version: TERMS_VERSION,
      terms_accepted: true,
      privacy_version: PRIVACY_VERSION,
      privacy_accepted: true,
      e_consent: true,
      marketing_consent: live.marketingConsent === true,
      dpa_version: isAdmin ? DPA_VERSION : null,
      dpa_accepted: isAdmin ? true : null,
      baa_version: isAdmin ? BAA_VERSION : null,
      baa_accepted: isAdmin ? true : null,
      honeypot,
      plan,
      subscription_plan: plan
    };

    setLoading(true);
    try {
      const res = await api.post(isAdmin ? '/admin/register' : '/auth/register', payload, { validateStatus: () => true });
      const data = res.data || {};

      if (res.status === 201 || (res.status === 200 && data.success)) {
        passwordRef.current = null;
        form.setFieldsValue({ password: undefined, confirmPassword: undefined });
        setPasswordValue('');
        setUserId(data.user_id || null);
        setCurrentEmail(email);
        setContactEmail(email);
        setRegistrationComplete(true);

        if (data.stage === 'needs_guardian_consent') {
          clearSignupState();
          message.info("Account created. Your parent or guardian must approve it before you can sign in.");
          history.push('/pending-approval?status=guardian');
          return;
        }

        setShowVerification(true);
        message.success('Account created! Enter the 6-digit code we emailed you.');
        return;
      }

      if (Array.isArray(data.missing_consents)) {
        setCurrentStep(2);
      }
      setError(data.error || data.message || 'Registration failed. Please try again.');
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // AFTER VERIFICATION
  // ============================================
  const finishFreePlan = () => {
    clearSignupState();
    message.success('Your Free plan is active. Sign in to open your dashboard.');
    history.push('/login');
  };

  const continueWithPlan = (planId) => {
    const price = priceOf(planId);
    if (price.isFree) { finishFreePlan(); return; }
    if (price.isCustom) { setShowCustomPlanModal(true); return; }
    setShowPaymentModal(true);
  };

  const handleVerificationComplete = (data = {}) => {
    setShowVerification(false);
    setVerificationCompleted(true);

    if (isAdmin || data.stage === 'needs_approval') {
      clearSignupState();
      history.push('/pending-approval');
      return;
    }
    if (data.stage === 'needs_guardian_consent') {
      clearSignupState();
      history.push('/pending-approval?status=guardian');
      return;
    }
    setCurrentStep(3);
    continueWithPlan(activePlan);
  };

  const handlePlanSelection = () => {
    if (!verificationCompleted) {
      setShowVerification(true);
      return;
    }
    continueWithPlan(activePlan);
  };

  // ============================================
  // PAYMENT
  // ============================================
  const handlePayment = async (method) => {
    const price = priceOf(activePlan);
    if (price.isCustom || price.isFree) return;
    setSelectedPaymentMethod(method);

    if (method === 'bank_transfer' || method === 'mobile_money') {
      setShowPaymentModal(false);
      setManualMethod(method);
      return;
    }

    setPaymentProcessing(true);
    try {
      const paymentData = {
        plan: activePlan,
        duration: selectedDuration,
        country: selectedCountry,
        amount: price.amount,       // display only — the server charges its own price
        currency: price.currency,
        email: currentEmail || formData.email,
        name: formData.name || '',
        payment_method: method,
        metadata: { plan: activePlan, duration: selectedDuration, country: selectedCountry, isSignup: true },
        callback_url: `${window.location.origin}/payment-callback?method=${method}&signup=true`
      };
      const response = method === 'paystack'
        ? await PaymentService.initializePaystackPayment(paymentData)
        : await PaymentService.initializePayPalPayment(paymentData);
      const redirectUrl = response?.authorization_url || response?.approval_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }
      throw new Error(response?.error || 'Could not start the payment. Please try again.');
    } catch (err) {
      const unauthorized = err?.status === 401 || /401|unauthori/i.test(err?.message || '');
      message.error(unauthorized
        ? 'Your session expired. Sign in — your account is on the Free plan — then upgrade from your dashboard.'
        : (err?.message || 'Payment failed. Please try again.'));
    } finally {
      setPaymentProcessing(false);
    }
  };

  const renderPaymentModal = () => {
    const price = priceOf(activePlan);
    if (price.isCustom || price.isFree) return null;
    return (
      <Modal
        title="Complete your payment"
        open={showPaymentModal}
        onCancel={() => { if (!paymentProcessing) { setShowPaymentModal(false); setSelectedPaymentMethod(null); } }}
        footer={null}
        width={650}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Order summary"
          description={
            <Row gutter={[16, 8]} style={{ marginTop: 8 }}>
              <Col span={12}><Text type="secondary">Plan</Text><div><Text strong>{PLANS[activePlan]?.label}</Text></div></Col>
              <Col span={12}><Text type="secondary">Billing</Text><div><Text strong>{durationLabel(selectedDuration)}</Text></div></Col>
              <Col span={24}><Text type="secondary">Amount</Text><div><Text strong style={{ fontSize: 20, color: '#1890ff' }}>{formatPrice(price.amount, price.currency)}</Text></div></Col>
            </Row>
          }
        />

        <Divider orientation="left">Choose how to pay</Divider>
        {PAYMENT_METHODS.map((method) => (
          <Card
            key={method.id}
            hoverable
            onClick={() => !paymentProcessing && handlePayment(method.id)}
            style={{
              marginBottom: 12,
              cursor: paymentProcessing ? 'not-allowed' : 'pointer',
              border: selectedPaymentMethod === method.id ? '2px solid #1890ff' : undefined,
              opacity: paymentProcessing ? 0.6 : 1
            }}
            styles={{ body: { padding: 16 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 28, color: method.color }}>{method.icon}</div>
                <div>
                  <Text strong>{method.name}</Text><br />
                  <Text type="secondary" style={{ fontSize: 13 }}>{method.description}</Text>
                </div>
              </div>
              {method.instant ? <Tag color="green">Instant</Tag> : <Tag color="orange">24–48h</Tag>}
            </div>
          </Card>
        ))}

        {paymentProcessing && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Spin /><div style={{ marginTop: 8 }}>Redirecting to secure checkout…</div>
          </div>
        )}

        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 12 }}>
          Not ready to pay? Close this window — your account stays on the Free plan and you can upgrade any time after signing in.
        </Text>
      </Modal>
    );
  };

  // ============================================
  // ENTERPRISE / CUSTOM — SALES CONTACT
  // ============================================
  const handleCustomPlanContact = async () => {
    const msg = contactMessage.trim();
    if (msg.length < 10) {
      message.warning('Please describe your needs in at least 10 characters.');
      return;
    }
    const phone = (contactPhone || formData.phone || '').trim();
    setContactSending(true);
    try {
      const res = await api.post('/contact', {
        name: formData.name || 'SafetyTrack Pro signup',
        email: contactEmail || currentEmail || formData.email,
        subject: 'Enterprise plan enquiry (new signup)',
        inquiryType: 'enterprise',
        message: msg,
        companyName: formData.companyName || '',
        phone: PHONE_PATTERN.test(phone) ? phone : '',
        industry: formData.industry || '',
        companySize: formData.employeeCount ? String(formData.employeeCount) : '',
        consent: true
      }, { validateStatus: () => true });

      if (res.status === 200 && res.data?.success) {
        setShowCustomPlanModal(false);
        clearSignupState();
        message.success('Thanks! Our sales team will contact you within 1 business day. Meanwhile your Free plan is active — you can sign in now.');
        history.push('/login');
      } else {
        const fieldErrors = res.data?.fields ? Object.values(res.data.fields).join(' ') : '';
        message.error(fieldErrors || res.data?.error || 'Could not send your request. Please try again.');
      }
    } catch (err) {
      message.error('Network error. Please try again, or use the Contact page.');
    } finally {
      setContactSending(false);
    }
  };

  // Rendered as a function (not <Component/>) so inputs keep focus while typing
  const renderCustomPlanModal = () => (
    <Modal
      title={<span><TeamOutlined style={{ color: '#722ed1' }} /> Enterprise plan enquiry</span>}
      open={showCustomPlanModal}
      onCancel={() => !contactSending && setShowCustomPlanModal(false)}
      footer={[
        <Button key="cancel" onClick={() => setShowCustomPlanModal(false)} disabled={contactSending}>Cancel</Button>,
        <Button key="submit" type="primary" loading={contactSending} onClick={handleCustomPlanContact}
          style={{ background: '#722ed1', borderColor: '#722ed1' }}>
          Send to sales team
        </Button>
      ]}
      width={600}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="What happens next"
        description="Your account is already active on the Free plan. Our sales team will contact you within 1 business day to agree Enterprise pricing and set it up."
      />
      <Form layout="vertical">
        <Form.Item label="Contact email">
          <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} prefix={<MailOutlined />} />
        </Form.Item>
        <Form.Item label="Contact phone (optional)">
          <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} prefix={<PhoneOutlined />} />
        </Form.Item>
        <Form.Item label="Your requirements" required>
          <Input.TextArea
            rows={4}
            placeholder="Number of users and sites, features you need, compliance requirements…"
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            showCount
            maxLength={2000}
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  // ============================================
  // NAVIGATION
  // ============================================
  const nextStep = async () => {
    try {
      if (currentStep === 0) {
        setFormData((prev) => ({ ...prev, userType }));
        setCurrentStep(1);
        return;
      }

      if (currentStep === 1) {
        const fields = ['name', 'email', 'phone', 'dateOfBirth', 'industry'];
        if (isAdmin) fields.push('companyName', 'employeeCount');
        if (isMinor && !isAdmin) fields.push('guardianEmail');
        const values = await form.validateFields(fields);
        setFormData((prev) => ({ ...prev, ...values }));
        setCurrentStep(2);
        return;
      }

      if (currentStep === 2) {
        const fields = ['password', 'confirmPassword', 'country', 'role', 'preferredLanguage', 'termsAccepted', 'eConsent', 'marketingConsent'];
        if (isAdmin) fields.push('dpaAccepted');
        const values = await form.validateFields(fields);

        const { password, confirmPassword, ...safeValues } = values;
        passwordRef.current = password; // memory only
        setFormData((prev) => ({ ...prev, ...safeValues }));
        setSelectedCountry(values.country || 'default');
        setResidency(REGION_BY_COUNTRY(values.country));
        setCurrentStep(3);
      }
    } catch (err) {
      message.error('Please fix the highlighted fields to continue.');
    }
  };

  const prevStep = () => {
    if (registrationComplete) return;
    setError('');
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const steps = [
    { title: 'Type', content: renderUserTypeStep() },
    { title: 'Basic Info', content: renderBasicInfoStep() },
    { title: 'Security', content: renderSecurityStep() },
    { title: 'Plan', content: renderPlanStep() }
  ];

  const lastStep = steps.length - 1;
  const planPrice = priceOf(activePlan);
  const planButtonText = !verificationCompleted
    ? 'Verify Email'
    : planPrice.isFree ? 'Start Free Plan'
    : planPrice.isCustom ? 'Contact Sales'
    : `Continue to Payment — ${formatPrice(planPrice.amount, planPrice.currency)}`;

  // ============================================
  // RENDER
  // ============================================
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorText: '#000000d9',
          colorTextSecondary: '#00000073',
          colorBgContainer: '#ffffff',
          colorBgElevated: '#ffffff'
        }
      }}
    >
      <div className="auth-container">
        <Card className="auth-card signup-card" style={{ maxWidth: 820, margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <SafetyCertificateOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 16 }} />
              <Title level={2}>{isAdmin ? 'Register Your Organization' : 'Create Account'}</Title>
              <Text type="secondary">Join SafetyTrack Pro</Text>
            </div>

            <Steps
              current={currentStep}
              className="signup-steps"
              size="small"
              items={steps.map((s) => ({ title: s.title }))}
            />

            <Form form={form} name="signup" layout="vertical" size="large" scrollToFirstError>
              <div className="steps-content">{steps[currentStep]?.content}</div>

              {error && <Alert message={error} type="error" showIcon closable onClose={() => setError('')} style={{ marginBottom: 16 }} />}

              <div className="steps-action">
                <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
                  {currentStep > 0 && !registrationComplete && (
                    <Button onClick={prevStep} size="large" icon={<ArrowLeftOutlined />} disabled={loading}>Back</Button>
                  )}
                  <div style={{ flex: 1 }} />

                  {currentStep < lastStep && (
                    <Button type="primary" onClick={nextStep} size="large" icon={<ArrowRightOutlined />}>Next</Button>
                  )}

                  {currentStep === lastStep && !registrationComplete && (
                    <Button type="primary" onClick={handleCreateAccount} loading={loading} size="large" icon={<SafetyCertificateOutlined />}>
                      {isAdmin ? 'Submit for Approval' : 'Create Account'}
                    </Button>
                  )}

                  {currentStep === lastStep && registrationComplete && !isAdmin && (
                    <Button type="primary" onClick={handlePlanSelection} size="large" icon={<CheckCircleOutlined />}>
                      {planButtonText}
                    </Button>
                  )}
                </Space>
              </div>
            </Form>

            <Divider>Or</Divider>

            <div style={{ textAlign: 'center' }}>
              <Text>
                Already have an account?{' '}
                <Button type="link" onClick={() => history.push('/login')} style={{ padding: 0 }}>Sign in</Button>
              </Text>
            </div>
          </Space>
        </Card>

        {showVerification && (
          <VerificationModal
            email={currentEmail || formData.email}
            onVerified={handleVerificationComplete}
            onClose={() => setShowVerification(false)}
          />
        )}

        {renderPaymentModal()}
        {renderCustomPlanModal()}

        {manualMethod && (
          <ManualPaymentModal
            key={manualMethod}
            open
            method={manualMethod}
            plan={activePlan}
            planLabel={PLANS[activePlan]?.label}
            duration={selectedDuration}
            amount={planPrice.amount}
            currency={planPrice.currency}
            email={currentEmail || formData.email}
            onClose={() => setManualMethod(null)}
            onRecorded={() => {
              setManualMethod(null);
              clearSignupState();
              message.info('Sign in any time to check your payment status. Your Free plan is active meanwhile.');
              history.push('/login');
            }}
          />
        )}
      </div>
    </ConfigProvider>
  );
}

export default SignupPage;
