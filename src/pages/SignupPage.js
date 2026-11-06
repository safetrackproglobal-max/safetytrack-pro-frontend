// src/pages/SignupPage.js - Full Compliance Version
import React, { useState, useContext, useEffect, useRef } from 'react';
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
  Radio,
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
  IdcardOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  TeamOutlined,
  CrownOutlined,
  CreditCardOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  GlobalOutlined
} from '@ant-design/icons';

import AuthContext from '../context/AuthContext';
import VerificationModal from '../components/VerificationModal';
import { useLanguage } from '../context/LanguageContext';
import { useHistory } from 'react-router-dom';
import PaymentService from '../services/paymentService';
import './AuthPages.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

// ============================================
// COMPLIANCE CONSTANTS (bump versions on policy change)
// ============================================
const TERMS_VERSION = '2026-01-15';
const PRIVACY_VERSION = '2026-01-15';
const DPA_VERSION = '2026-01-15';
const BAA_VERSION = '2026-01-15';
const MIN_AGE = 18;
const MINOR_AGE_FLOOR = 13;
const PASSWORD_MIN_LEN = 12;

const BREACHED_PASSWORDS = new Set([
  'password1234', 'qwerty123456', '123456789012', 'letmein123456',
  'welcome123456', 'admin1234567', 'iloveyou1234', 'password123!',
  'qwertyuiop12', 'abc123456789',
]);

const INDUSTRY_OPTIONS = [
  { value: 'Healthcare', label: 'Healthcare / Hospital' },
  { value: 'Oil & Gas', label: 'Oil & Gas' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Mining', label: 'Mining' },
  { value: 'Utilities / Energy', label: 'Utilities / Energy' },
  { value: 'Transportation', label: 'Transportation & Logistics' },
  { value: 'Pharmaceutical', label: 'Pharmaceutical / Biotech' },
  { value: 'Government', label: 'Government / Public Sector' },
  { value: 'Education', label: 'Education / Research' },
  { value: 'Other', label: 'Other' },
];

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

const scorePassword = (pw) => {
  if (!pw) return { score: 0, label: 'Too short', color: '#ff4d4f' };
  if (pw.length < PASSWORD_MIN_LEN) return { score: 1, label: `Need ${PASSWORD_MIN_LEN}+ chars`, color: '#ff4d4f' };
  if (BREACHED_PASSWORDS.has(pw.toLowerCase())) return { score: 1, label: 'This password is commonly breached', color: '#ff4d4f' };
  let score = 1;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const colors = ['#ff4d4f', '#fa8c16', '#faad14', '#52c41a', '#237804'];
  return { score, label: labels[score], color: colors[score] };
};

// ============================================
// PRICING DATA
// ============================================
const COUNTRY_PRICING = {
  "Ghana": {
    "free": { "1_month": 0, "6_month": 0, "1_year": 0, "currency": "GHS" },
    "basic": { "1_month": 100, "6_month": 500, "1_year": 900, "currency": "GHS", "payment_method": "Paystack (MTN MoMo & Cards)" },
    "pro": { "1_month": 200, "6_month": 1000, "1_year": 1800, "currency": "GHS", "payment_method": "Paystack (MTN MoMo & Cards)" },
    "enterprise": { "1_month": 299, "6_month": 1499, "1_year": 2699, "currency": "GHS", "payment_method": "Paystack (MTN MoMo & Cards)" }
  },
  "Qatar": {
    "free": { "1_month": 0, "6_month": 0, "1_year": 0, "currency": "QAR" },
    "basic": { "1_month": 100, "6_month": 500, "1_year": 900, "currency": "QAR", "payment_method": "Paystack (Cards)" },
    "pro": { "1_month": 300, "6_month": 1500, "1_year": 2700, "currency": "QAR", "payment_method": "Paystack (Cards)" },
    "enterprise": { "1_month": 299, "6_month": 1499, "1_year": 2699, "currency": "QAR", "payment_method": "Paystack (Cards)" }
  },
  "United States": {
    "free": { "1_month": 0, "6_month": 0, "1_year": 0, "currency": "USD" },
    "basic": { "1_month": 20, "6_month": 150, "1_year": 270, "currency": "USD", "payment_method": "Paystack (Cards)" },
    "pro": { "1_month": 50, "6_month": 250, "1_year": 450, "currency": "USD", "payment_method": "Paystack (Cards)" },
    "enterprise": { "1_month": 299, "6_month": 1499, "1_year": 2699, "currency": "USD", "payment_method": "Paystack (Cards)" }
  },
  "default": {
    "free": { "1_month": 0, "6_month": 0, "1_year": 0, "currency": "USD" },
    "basic": { "1_month": 20, "6_month": 100, "1_year": 180, "currency": "USD", "payment_method": "Paystack (Cards)" },
    "pro": { "1_month": 50, "6_month": 250, "1_year": 450, "currency": "USD", "payment_method": "Paystack (Cards)" },
    "enterprise": { "1_month": 299, "6_month": 1499, "1_year": 2699, "currency": "USD", "payment_method": "Paystack (Cards)" }
  }
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
  { id: 'paystack', name: 'Paystack / Credit Card', icon: <CreditCardOutlined />, description: 'Pay with Credit/Debit Card - Instant activation', color: '#1890ff' },
  { id: 'paypal', name: 'PayPal', icon: <DollarOutlined />, description: 'Secure PayPal payment - Instant activation', color: '#003087' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: <BankOutlined />, description: 'Manual verification (24-48h)', color: '#faad14' }
];

// ============================================
// MAIN COMPONENT
// ============================================
function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState('user');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('default');
  const [selectedDuration, setSelectedDuration] = useState('1_month');
  const [formData, setFormData] = useState({});
  const [showCustomPlanModal, setShowCustomPlanModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [userId, setUserId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [planActivationLoading, setPlanActivationLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [verificationCompleted, setVerificationCompleted] = useState(false);

  // Compliance / new state
  const [isMinor, setIsMinor] = useState(false);
  const [guardianEmail, setGuardianEmail] = useState('');
  const [passwordScore, setPasswordScore] = useState({ score: 0, label: '', color: '#ff4d4f' });
  const [residency, setResidency] = useState(REGION_BY_COUNTRY('default'));
  const [mfaOptIn, setMfaOptIn] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const passwordRef = useRef(null);

  const { signup } = useContext(AuthContext);
  const { availableLanguages } = useLanguage();
  const [form] = Form.useForm();
  const history = useHistory();

  // ============================================
  // CHECK FOR SAVED STATE ON LOAD
  // ============================================
  useEffect(() => {
    const savedState = sessionStorage.getItem('signupState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        console.log('🔵 Restoring signup state:', state);

        setUserId(state.userId);
        setUserType(state.userType || 'user');
        setCurrentEmail(state.email || '');
        setSelectedCountry(state.country || 'default');
        setResidency(REGION_BY_COUNTRY(state.country || 'default'));
        setRegistrationComplete(state.registrationComplete || false);
        setSelectedPlan(state.selectedPlan || null);
        setCurrentStep(state.currentStep || 0);

        if (state.verified) setVerificationCompleted(true);
        if (state.currentStep === 3 && state.registrationComplete) setRegistrationComplete(true);

        if (state.formData) {
          // 🔴 Force re-consent if versions changed
          const restoredForm = { ...state.formData };
          if (state.termsVersion !== TERMS_VERSION || state.privacyVersion !== PRIVACY_VERSION) {
            restoredForm.termsAccepted = false;
            restoredForm.eConsent = false;
            restoredForm.dpaAccepted = false;
          }
          // Never restore passwords
          delete restoredForm.password;
          delete restoredForm.confirmPassword;
          setFormData(restoredForm);
          form.setFieldsValue(restoredForm);
        }

        if (state.showVerification) setShowVerification(true);
        message.info('Resuming your signup process...');
      } catch (e) {
        console.error('Error restoring signup state:', e);
      }
    }

    const verifiedEmail = localStorage.getItem('verifiedEmail');
    if (verifiedEmail) {
      setCurrentEmail(verifiedEmail);
      setVerificationCompleted(true);
      localStorage.removeItem('verifiedEmail');
      message.success('Email verified successfully! Continue with plan selection.');
    }
  }, []);

  // ============================================
  // SAVE STATE FUNCTION (never includes password)
  // ============================================
  const saveSignupState = () => {
    const safeFormData = { ...formData };
    delete safeFormData.password;
    delete safeFormData.confirmPassword;

    const state = {
      userId,
      userType,
      email: currentEmail || safeFormData.email,
      country: selectedCountry,
      registrationComplete,
      selectedPlan,
      currentStep,
      verified: verificationCompleted || false,
      formData: safeFormData,
      showVerification,
      termsVersion: TERMS_VERSION,
      privacyVersion: PRIVACY_VERSION,
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem('signupState', JSON.stringify(state));
  };

  // ============================================
  // HELPERS
  // ============================================
  const getCountryPricing = () => COUNTRY_PRICING[selectedCountry] || COUNTRY_PRICING.default;

  const getPlanPrice = (planId) => {
    if (planId === 'custom') return { amount: 'Custom', currency: 'USD' };
    const pricing = getCountryPricing();
    const planPricing = pricing[planId];
    if (!planPricing) return { amount: 0, currency: 'USD' };
    const amount = planPricing[selectedDuration] || planPricing['1_month'] || 0;
    const currency = planPricing.currency || 'USD';
    return { amount, currency };
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === 'Custom' || amount === 'Custom Pricing') return 'Custom Pricing';
    const symbols = { USD: '$', GHS: 'GH₵', QAR: 'QR', INR: '₹', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || currency;
    return `${symbol}${typeof amount === 'number' ? amount.toLocaleString() : amount}`;
  };

  const getDurationLabel = (duration) => {
    const labels = { '1_month': 'Monthly', '6_month': '6 Months', '1_year': 'Annual' };
    return labels[duration] || duration;
  };

  const getAvailablePlans = () => (userType === 'admin' ? ['enterprise', 'custom'] : ['free', 'basic', 'pro', 'enterprise', 'custom']);

  // ============================================
  // STEP 1: User Type
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
              <Text>For healthcare professionals and staff</Text>
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
              <Title level={5}>Administrator</Title>
              <Text>For system administrators</Text>
              <ul>
                <li>User management</li>
                <li>System configuration</li>
                <li>Advanced analytics</li>
              </ul>
            </div>
          </div>
        </div>

        {userType === 'admin' && (
          <Alert
            message="Company Registration"
            description="Administrators register their company. Enterprise and Custom plans available. You will need to accept a Data Processing Agreement."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </div>
    </div>
  );

  // ============================================
  // STEP 2: Basic Info
  // ============================================
  const renderBasicInfoStep = () => (
    <div className="step-content">
      {/* Honeypot */}
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

      <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter your full name' }]}>
        <Input placeholder="Enter your full name" prefix={<UserOutlined />} size="large" autoComplete="name" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email Address"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input placeholder="Enter your email" prefix={<MailOutlined />} size="large" autoComplete="email" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone Number"
        rules={[{ required: userType === 'admin', message: 'Phone required for admin' }]}
      >
        <Input placeholder="Enter your phone number (with country code)" prefix={<IdcardOutlined />} size="large" autoComplete="tel" />
      </Form.Item>

      <Form.Item
        name="dateOfBirth"
        label="Date of Birth"
        rules={[
          { required: true, message: 'Please enter your date of birth' },
          {
            validator: (_, v) => {
              if (!v) return Promise.resolve();
              const age = getAge(v);
              if (age === null) return Promise.reject(new Error('Invalid date'));
              if (age > 120) return Promise.reject(new Error('Please enter a valid date of birth'));
              if (age < MINOR_AGE_FLOOR) {
                return Promise.reject(new Error(`You must be at least ${MINOR_AGE_FLOOR} to use this service.`));
              }
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

      {isMinor && (
        <>
          <Alert
            type="warning"
            showIcon
            message="Parental / Guardian Consent Required"
            description={`Because you are under ${MIN_AGE}, we need verifiable parental or guardian consent before creating your account (GDPR Art. 8). We will email your guardian a consent link.`}
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name="guardianEmail"
            label="Parent / Guardian Email"
            rules={[
              { required: true, message: 'Guardian email is required for minors' },
              { type: 'email', message: 'Enter a valid guardian email' },
              {
                validator: (_, v) => {
                  if (!v) return Promise.resolve();
                  const selfEmail = form.getFieldValue('email');
                  if (selfEmail && v.toLowerCase() === selfEmail.toLowerCase()) {
                    return Promise.reject(new Error('Guardian email must be different from your own'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              placeholder="guardian@example.com"
              prefix={<MailOutlined />}
              size="large"
              value={guardianEmail}
              onChange={(e) => setGuardianEmail(e.target.value)}
            />
          </Form.Item>
        </>
      )}

      <Form.Item
        name="industry"
        label="Organization Industry"
        rules={[{ required: true, message: 'Please select your industry' }]}
      >
        <Select placeholder="Select industry" size="large">
          {INDUSTRY_OPTIONS.map((o) => (
            <Option key={o.value} value={o.value}>{o.label}</Option>
          ))}
        </Select>
      </Form.Item>

      {userType === 'admin' && (
        <>
          <Form.Item name="companyName" label="Organization" rules={[{ required: true, message: 'Please enter organization name' }]}>
            <Input placeholder="Organization name" prefix={<BankOutlined />} size="large" />
          </Form.Item>
          <Form.Item name="employeeCount" label="Employees" rules={[{ required: true, message: 'Please enter employee count' }]}>
            <Input type="number" placeholder="Number of employees" size="large" min={1} max={1000000} />
          </Form.Item>
        </>
      )}
    </div>
  );

  // ============================================
  // STEP 3: Security & Consents
  // ============================================
  const renderSecurityStep = () => {
    const currentCountry = form.getFieldValue('country');
    return (
      <div className="step-content">
        <Form.Item
          name="password"
          label="Create Password"
          extra={`At least ${PASSWORD_MIN_LEN} characters. A passphrase of 3–4 random words is recommended.`}
          rules={[
            { required: true, message: 'Please enter password' },
            { min: PASSWORD_MIN_LEN, message: `Password must be at least ${PASSWORD_MIN_LEN} characters` },
            {
              validator: (_, v) => {
                if (!v) return Promise.resolve();
                if (BREACHED_PASSWORDS.has(v.toLowerCase())) {
                  return Promise.reject(new Error('This password appears in known breach lists. Choose another.'));
                }
                return Promise.resolve();
              }
            }
          ]}
          hasFeedback
        >
          <Input.Password
            placeholder="Create strong password"
            prefix={<LockOutlined />}
            size="large"
            autoComplete="new-password"
            onChange={(e) => setPasswordScore(scorePassword(e.target.value))}
          />
        </Form.Item>

        {passwordScore.label && (
          <div style={{ marginTop: -8, marginBottom: 16 }}>
            <div style={{ height: 6, borderRadius: 3, background: '#f0f0f0', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(passwordScore.score / 4) * 100}%`,
                  height: '100%',
                  background: passwordScore.color,
                  transition: 'width 0.2s, background 0.2s'
                }}
              />
            </div>
            <Text style={{ color: passwordScore.color, fontSize: 12 }}>{passwordScore.label}</Text>
          </div>
        )}

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm password' },
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

        <Form.Item name="country" label="Country" rules={[{ required: true, message: 'Please select country' }]}>
          <Select
            showSearch
            placeholder="Select country"
            optionFilterProp="children"
            size="large"
            onChange={(val) => {
              setSelectedCountry(val);
              setResidency(REGION_BY_COUNTRY(val));
            }}
            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
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
            message={`Data residency: ${residency.residency}`}
            description={`Your data will be stored in the ${residency.residency} region and processed under ${residency.regulator}.`}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          name="role"
          label={userType === 'admin' ? 'Admin Role' : 'Professional Role'}
          rules={[{ required: true, message: 'Please select role' }]}
        >
          <Select placeholder={`Select ${userType === 'admin' ? 'admin' : 'professional'} role`} size="large">
            {(userType === 'admin' ? adminRoleOptions : userRoleOptions).map((r) => (
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

        <Divider orientation="left">Security Options</Divider>

        {(userType === 'admin' || userType === 'company_admin') && (
          <Form.Item name="mfaOptIn" valuePropName="checked">
            <Checkbox onChange={(e) => setMfaOptIn(e.target.checked)}>
              Enable two-factor authentication (recommended for administrators)
            </Checkbox>
          </Form.Item>
        )}

        <Divider orientation="left">Consents & Agreements</Divider>

        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="What we collect and why"
          description={
            <>
              We collect your name, email, phone, date of birth, country, role, and organization to create and secure your account and to provide HSE / hospital services. We do not sell your data. See our{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> for your rights and our retention periods.
            </>
          }
        />

        {/* 1. Terms + Privacy — REQUIRED, no initialValue (never pre-ticked) */}
        <Form.Item
          name="termsAccepted"
          valuePropName="checked"
          rules={[
            {
              validator: (_, v) =>
                v === true ? Promise.resolve() : Promise.reject(new Error('You must accept the Terms and Privacy Policy'))
            }
          ]}
        >
          <Checkbox>
            I have read and agree to the{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> (v{TERMS_VERSION}) and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> (v{PRIVACY_VERSION}).
            <span style={{ fontSize: 11, color: '#888', display: 'block' }}>
              Your acceptance, IP address, timestamp, and policy version will be recorded.
            </span>
          </Checkbox>
        </Form.Item>

        {/* 2. Electronic records — REQUIRED */}
        <Form.Item
          name="eConsent"
          valuePropName="checked"
          rules={[
            {
              validator: (_, v) =>
                v === true ? Promise.resolve() : Promise.reject(new Error('Consent to electronic records is required'))
            }
          ]}
        >
          <Checkbox>
            I consent to receive account notices, invoices, security alerts, and legal communications electronically. I understand I can withdraw this consent at any time by contacting support.
          </Checkbox>
        </Form.Item>

        {/* 3. DPA / BAA — REQUIRED for admins */}
        {userType === 'admin' && (
          <Form.Item
            name="dpaAccepted"
            valuePropName="checked"
            rules={[
              {
                validator: (_, v) =>
                  v === true ? Promise.resolve() : Promise.reject(new Error('You must accept the Data Processing Agreement to register a company'))
              }
            ]}
          >
            <Checkbox>
              On behalf of my organization, I accept the{' '}
              <a href="/dpa" target="_blank" rel="noopener noreferrer">Data Processing Agreement</a> (v{DPA_VERSION}) and, where applicable, the{' '}
              <a href="/baa" target="_blank" rel="noopener noreferrer">Business Associate Agreement</a> (v{BAA_VERSION}) for the handling of protected health information.
            </Checkbox>
          </Form.Item>
        )}

        {/* 4. Marketing — optional, never pre-ticked */}
        <Form.Item name="marketingConsent" valuePropName="checked">
          <Checkbox>
            Send me product updates, HSE compliance news, and training invitations (optional).
          </Checkbox>
        </Form.Item>
      </div>
    );
  };

  // ============================================
  // STEP 4: Plan Selection
  // ============================================
  const renderPlanStep = () => {
    const availablePlans = getAvailablePlans();
    const isVerified = verificationCompleted || localStorage.getItem('verifiedEmail');

    return (
      <div className="step-content">
        {isVerified && (
          <Alert
            message="✅ Email Verified"
            description="Your email has been verified. Select a plan to activate your account."
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {!isVerified && registrationComplete && (
          <Alert
            message="⚠️ Email Verification Required"
            description="Please verify your email before selecting a plan. Check your inbox for the verification code."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
            action={
              <Button size="small" type="primary" onClick={() => setShowVerification(true)}>
                Verify Now
              </Button>
            }
          />
        )}

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={4}>Choose Your Plan</Title>
          <Text type="secondary">Select a plan that fits your needs</Text>
        </div>

        {selectedPlan !== 'custom' && (
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <Text strong>Billing Cycle: </Text>
            <Select value={selectedDuration} onChange={setSelectedDuration} style={{ width: 150 }}>
              <Option value="1_month">Monthly</Option>
              <Option value="6_month">6 Months</Option>
              <Option value="1_year">Annual</Option>
            </Select>
          </div>
        )}

        <Row gutter={[16, 16]}>
          {availablePlans.map((planId) => {
            const plan = PLANS[planId];
            const price = getPlanPrice(planId);
            const isCustom = planId === 'custom';
            const isEnterprise = planId === 'enterprise';
            const isSelected = selectedPlan === planId;

            return (
              <Col xs={24} md={userType === 'admin' ? 12 : 8} key={planId}>
                <Card
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  className={`plan-card ${isSelected ? 'selected' : ''}`}
                  style={{
                    border: isSelected ? '2px solid #1890ff' : undefined,
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onClick={() => { setSelectedPlan(planId); if (planId === 'custom') setSelectedDuration('1_month'); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPlan(planId);
                      if (planId === 'custom') setSelectedDuration('1_month');
                    }
                  }}
                  hoverable
                >
                  {isCustom && <Tag color="orange" style={{ marginBottom: 8 }}><CrownOutlined /> Custom</Tag>}
                  {isEnterprise && !isCustom && <Tag color="gold" style={{ marginBottom: 8 }}><CrownOutlined /> Enterprise</Tag>}
                  {planId === 'pro' && <Tag color="purple" style={{ marginBottom: 8 }}>Most Popular</Tag>}
                  {planId === 'free' && <Tag color="green" style={{ marginBottom: 8 }}>Free</Tag>}

                  <Title level={4} style={{ marginBottom: 4 }}>{plan.label}</Title>

                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 24, color: isCustom ? '#fa8c16' : (isEnterprise ? '#faad14' : '#1890ff') }}>
                      {isCustom ? 'Custom Pricing' : price.amount === 0 ? 'Free' : formatCurrency(price.amount, price.currency)}
                    </Text>
                    {!isCustom && price.amount !== 0 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        /{getDurationLabel(selectedDuration).toLowerCase()}
                      </Text>
                    )}
                  </div>

                  {isCustom && <Text type="secondary" style={{ fontSize: 12 }}>Contact us for custom pricing</Text>}

                  <Divider style={{ margin: '12px 0' }} />

                  <div style={{ marginBottom: 12 }}>
                    {(isCustom ? plan.features : plan.features.slice(0, 6)).map((feature, idx) => (
                      <div key={idx} style={{ padding: '4px 0', fontSize: 13 }}>
                        <CheckCircleOutlined style={{ color: isCustom ? '#fa8c16' : '#52c41a', marginRight: 8 }} />
                        {feature}
                      </div>
                    ))}
                  </div>

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
  // PAYMENT MODAL
  // ============================================
  const renderPaymentModal = () => {
    const plan = selectedPlan ? PLANS[selectedPlan] : null;
    const price = selectedPlan ? getPlanPrice(selectedPlan) : { amount: 0, currency: 'USD' };
    const isCustom = selectedPlan === 'custom';
    const isFree = selectedPlan === 'free';
    if (isCustom || isFree) return null;

    return (
      <Modal
        title="Complete Your Payment"
        open={showPaymentModal}
        onCancel={() => {
          setShowPaymentModal(false);
          setSelectedPaymentMethod(null);
          setPaymentProcessing(false);
          saveSignupState();
        }}
        footer={null}
        width={650}
      >
        <div>
          <Alert
            message="Order Summary"
            description={
              <div style={{ marginTop: 8 }}>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Text type="secondary">Plan:</Text>
                    <div><Text strong>{plan?.label || selectedPlan?.toUpperCase()}</Text></div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Billing:</Text>
                    <div><Text strong>{getDurationLabel(selectedDuration)}</Text></div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Amount:</Text>
                    <div><Text strong style={{ fontSize: 20, color: '#1890ff' }}>{formatCurrency(price.amount, price.currency)}</Text></div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Trial:</Text>
                    <div><Tag color="green">14 Days Free Trial</Tag></div>
                  </Col>
                </Row>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Divider orientation="left">Select Payment Method</Divider>

          <div style={{ marginBottom: 12 }}>
            {PAYMENT_METHODS.map((method) => (
              <Card
                key={method.id}
                hoverable
                onClick={() => !paymentProcessing && handlePayment(method.id)}
                style={{
                  marginBottom: 12,
                  cursor: paymentProcessing ? 'not-allowed' : 'pointer',
                  border: selectedPaymentMethod === method.id ? '2px solid #1890ff' : undefined,
                  borderRadius: 8,
                  opacity: paymentProcessing ? 0.6 : 1
                }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 28, color: method.color }}>{method.icon}</div>
                    <div>
                      <Text strong style={{ fontSize: 16 }}>{method.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 13 }}>{method.description}</Text>
                    </div>
                  </div>
                  <div>
                    {method.id === 'paystack' || method.id === 'paypal'
                      ? <Tag color="green">✓ Instant</Tag>
                      : <Tag color="orange">⏱ 24-48h</Tag>}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {paymentProcessing && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Spin />
              <div style={{ marginTop: 8 }}>Processing payment...</div>
            </div>
          )}

          <div style={{ marginTop: 16, padding: 12, background: '#f0f7ff', borderRadius: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              💡 All payments are secure and encrypted. Your account will be activated immediately after payment confirmation.
            </Text>
          </div>
        </div>
      </Modal>
    );
  };

  // ============================================
  // PAYMENT HANDLERS
  // ============================================
  const handlePayment = async (method) => {
    setPaymentProcessing(true);
    setSelectedPaymentMethod(method);

    try {
      const price = getPlanPrice(selectedPlan);
      const userEmail = currentEmail || formData.email;

      if (method === 'bank_transfer') {
        showBankTransferInstructions();
        setPaymentProcessing(false);
        return;
      }

      const paymentData = {
        plan: selectedPlan,
        country: selectedCountry || 'default',
        duration: selectedDuration,
        amount: price.amount,
        currency: price.currency,
        email: userEmail,
        name: formData.name || '',
        phone: formData.phone || '',
        user_id: userId,
        user_type: userType,
        company_name: formData.companyName || '',
        payment_method: method,
        metadata: { plan: selectedPlan, duration: selectedDuration, country: selectedCountry, userType, isSignup: true, currentStep: 'signup_payment' },
        callback_url: `${window.location.origin}/payment-callback?method=${method}&signup=true`
      };

      if (method === 'paystack') {
        const response = await PaymentService.initializePaystackPayment(paymentData);
        if (response?.authorization_url) {
          saveSignupState();
          window.location.href = response.authorization_url;
          return;
        }
        throw new Error(response?.error || 'Failed to initialize Paystack payment');
      }
      if (method === 'paypal') {
        const response = await PaymentService.initializePayPalPayment(paymentData);
        if (response?.approval_url) {
          saveSignupState();
          window.location.href = response.approval_url;
          return;
        }
        throw new Error(response?.error || 'Failed to initialize PayPal payment');
      }
    } catch (err) {
      console.error('Payment error:', err);
      message.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const showBankTransferInstructions = () => {
    const price = getPlanPrice(selectedPlan);
    const plan = PLANS[selectedPlan];

    Modal.info({
      title: 'Bank Transfer Instructions',
      width: 600,
      icon: <BankOutlined style={{ color: '#faad14' }} />,
      content: (
        <div style={{ padding: '8px 0' }}>
          <Alert
            message={`${plan?.label || selectedPlan?.toUpperCase()} Plan Payment`}
            description={`Amount: ${formatCurrency(price.amount, price.currency)}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card size="small" style={{ marginBottom: 12 }}>
            <div><Text strong>Bank:</Text> GCB Bank</div>
            <div><Text strong>Account:</Text> <Text copyable>4151440001070</Text></div>
            <div><Text strong>Name:</Text> AfdalTech Solutions</div>
            <div><Text strong>Reference:</Text> <Text code>{formData.email || 'your-email'}</Text></div>
          </Card>

          <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
            <Text strong>Instructions:</Text>
            <ol style={{ margin: '8px 0', paddingLeft: 20 }}>
              <li>Log into your internet banking</li>
              <li>Add "GCB Bank" as payee</li>
              <li>Enter account number: <Text strong>4151440001070</Text></li>
              <li>Amount: <Text strong>{formatCurrency(price.amount, price.currency)}</Text></li>
              <li>Reference: Use your email <Text code>{formData.email || 'your-email'}</Text></li>
              <li>Save the transaction receipt</li>
            </ol>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                Modal.destroyAll();
                setShowPaymentModal(false);
                message.success('Payment record created! Our team will verify within 24-48 hours.');
                saveSignupState();
                setShowVerification(true);
              }}
            >
              I Have Sent Payment ✓
            </Button>
          </div>
        </div>
      )
    });
  };

  // ============================================
  // ACCOUNT CREATION
  // ============================================
  const handleCreateAccount = async () => {
    setLoading(true);
    setError('');

    try {
      // 🔴 Re-validate consent at submission time (covers resume, role change, version bump)
      const liveValues = form.getFieldsValue(true);

      if (liveValues.termsAccepted !== true) {
        setError('You must accept the Terms of Service and Privacy Policy.');
        setCurrentStep(2);
        setLoading(false);
        return;
      }
      if (liveValues.eConsent !== true) {
        setError('You must consent to electronic records and communications.');
        setCurrentStep(2);
        setLoading(false);
        return;
      }
      if (userType === 'admin' && liveValues.dpaAccepted !== true) {
        setError('You must accept the Data Processing Agreement to register a company.');
        setCurrentStep(2);
        setLoading(false);
        return;
      }
      if (honeypot) {
        // silently reject bots
        setError('Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      const allFormData = {
        ...formData,
        ...liveValues,
        password: passwordRef.current
      };

      if (!allFormData.email || !allFormData.name || !allFormData.password) {
        setError('Missing required fields. Please go back and complete all steps.');
        setLoading(false);
        return;
      }

      if (userType === 'admin' && !allFormData.companyName) {
        setError('Company name is required for admin registration.');
        setLoading(false);
        return;
      }

      let plan = 'free';
      let subscriptionStatus = 'inactive';
      let approvalStatus = 'approved';
      let isActive = true;
      let verified = true;

      if (userType === 'admin') {
        plan = allFormData.plan || 'enterprise';
        const companyPlans = ['enterprise', 'custom'];
        if (!companyPlans.includes(plan)) {
          setError(`Invalid company plan. Companies can only have: ${companyPlans.join(', ')}`);
          setLoading(false);
          return;
        }
        subscriptionStatus = 'active';
        approvalStatus = 'approved';
        isActive = true;
        verified = true;
      } else if (userType === 'employee') {
        setError('Employees cannot register themselves. Please contact your company admin to create your account.');
        setLoading(false);
        return;
      } else {
        plan = 'free';
        subscriptionStatus = 'inactive';
        approvalStatus = 'approved';
        isActive = false;
        verified = false;
      }

      const age = getAge(allFormData.dateOfBirth);
      const payload = {
        // identity
        name: allFormData.name,
        email: allFormData.email.toLowerCase().trim(),
        password: passwordRef.current,
        country: allFormData.country || '',
        role: allFormData.role || '',
        preferred_language: allFormData.preferredLanguage || 'en',

        // organization
        user_type: userType,
        company_name: allFormData.companyName || '',
        employee_count: parseInt(allFormData.employeeCount, 10) || 0,
        industry: allFormData.industry || 'Other',

        // compliance — age
        date_of_birth: allFormData.dateOfBirth || null,
        age_at_signup: age,
        is_minor: isMinor,
        guardian_email: isMinor ? guardianEmail : null,

        // compliance — consents
        terms_version: TERMS_VERSION,
        terms_accepted: liveValues.termsAccepted === true,
        privacy_version: PRIVACY_VERSION,
        privacy_accepted: liveValues.termsAccepted === true, // bundled with TOS for UI simplicity; backend can split
        e_consent: liveValues.eConsent === true,
        marketing_consent: liveValues.marketingConsent === true,
        dpa_version: userType === 'admin' ? DPA_VERSION : null,
        dpa_accepted: userType === 'admin' ? liveValues.dpaAccepted === true : null,
        baa_version: userType === 'admin' ? BAA_VERSION : null,
        baa_accepted: userType === 'admin' ? liveValues.dpaAccepted === true : null,

        // security
        mfa_opt_in: !!mfaOptIn,

        // audit context
        client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        client_locale: navigator.language,
        client_screen: `${window.screen.width}x${window.screen.height}`,
        honeypot,

        // plan
        plan,
        subscription_plan: plan,
        subscription_status: subscriptionStatus,
        is_active: isActive,
        verified,
        approval_status: approvalStatus
      };

      console.log('📤 Sending registration payload:', payload);

      const API_BASE = process.env.REACT_APP_API_BASE || 'https://safetrackproglobal-backend-production.up.railway.app';
      const endpoint = userType === 'admin'
        ? `${API_BASE}/api/admin/register`
        : `${API_BASE}/api/auth/register`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📥 Registration response:', data);

      if (response.ok) {
        const userIdLocal = data.user_id || data.id;
        setUserId(userIdLocal);
        setCompanyId(data.company_id || data.user?.company_id || data.company?.id);
        setCurrentEmail(allFormData.email);

        localStorage.setItem('userId', userIdLocal);
        localStorage.setItem('pendingUserId', userIdLocal);
        localStorage.setItem('pendingUserEmail', allFormData.email);
        localStorage.setItem('pendingUserType', userType);
        localStorage.setItem('pendingCountry', selectedCountry);
        localStorage.setItem('pendingCompanyId', data.company_id || data.company?.id || '');
        localStorage.setItem('pendingPlan', data.user?.plan || data.company?.plan || plan);

        const token = data.access_token || data.token;
        if (token) localStorage.setItem('token', token);

        // Clear secret from memory
        passwordRef.current = null;

        if (userType === 'admin') {
          if (data.stage === 'needs_plan' || data.requires_plan_selection) {
            message.success(`Company created with ${plan} plan!`);
            message.info('Please select your plan to continue.');
            setTimeout(() => history.push('/select-plan'), 500);
            setLoading(false);
            return;
          }
          if (data.requires_approval) {
            message.success(`Company created with ${plan} plan!`);
            message.info('Your account is pending approval. We will notify you once reviewed.');
            setTimeout(() => history.push('/pending-approval'), 500);
            setLoading(false);
            return;
          }
          message.success(`Company created with ${plan} plan!`);
          localStorage.removeItem('requires_verification');
          setTimeout(() => history.push('/admin/dashboard'), 500);
          setLoading(false);
          return;
        }

        const isVerified = data.verified === true || data.user?.verified === true;
        const stage = data.stage || 'needs_plan';
        saveSignupState();
        setRegistrationComplete(true);

        if (isVerified) {
          localStorage.removeItem('requires_verification');
          if (stage === 'needs_plan' || data.requires_plan_selection) {
            message.info('Account verified! Please select a plan to continue.');
            setTimeout(() => history.push('/select-plan'), 500);
            setLoading(false);
            return;
          }
          message.success('Welcome! Redirecting to dashboard...');
          setTimeout(() => history.push('/dashboard'), 500);
          setLoading(false);
          return;
        }

        setShowVerification(true);
        message.info('Account created! Please verify your email to continue.');
        setLoading(false);
      } else {
        const errorMsg = data.error || data.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        message.error(errorMsg);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
      message.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PLAN SELECTION
  // ============================================
  const handlePlanSelection = async () => {
    if (!selectedPlan) {
      message.warning('Please select a plan');
      return;
    }
    if (!verificationCompleted) {
      message.warning('Please verify your email first before selecting a plan.');
      setShowVerification(true);
      return;
    }

    if (selectedPlan === 'custom') {
      setShowCustomPlanModal(true);
      return;
    }
    if (selectedPlan === 'free') {
      await activateFreePlan();
      return;
    }
    setShowPaymentModal(true);
  };

  const activateFreePlan = async () => {
    setPlanActivationLoading(true);
    try {
      const userIdLocal = userId || localStorage.getItem('pendingUserId');
      const API_BASE = process.env.REACT_APP_API_BASE || 'https://safetrackproglobal-backend-production.up.railway.app';
      const response = await fetch(`${API_BASE}/api/user/activate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ user_id: userIdLocal, plan: 'free', activate: true })
      });
      const data = await response.json();
      if (response.ok) {
        message.success('Free plan activated successfully!');
        sessionStorage.removeItem('signupState');
        history.push('/login');
      } else {
        message.error(data.error || 'Failed to activate plan');
      }
    } catch (err) {
      console.error('Activation error:', err);
      message.error('Failed to activate plan');
    } finally {
      setPlanActivationLoading(false);
    }
  };

  // ============================================
  // NAVIGATION
  // ============================================
  const nextStep = async () => {
    try {
      if (currentStep === 0) {
        const values = form.getFieldsValue();
        setFormData((prev) => ({ ...prev, ...values }));
        setCurrentStep(1);
        saveSignupState();
        return;
      }

      if (currentStep === 1) {
        const fields = ['name', 'email', 'dateOfBirth', 'industry'];
        if (userType === 'admin') fields.push('phone', 'companyName', 'employeeCount');
        if (isMinor) fields.push('guardianEmail');
        const values = await form.validateFields(fields);
        setFormData((prev) => ({ ...prev, ...values }));
        setCurrentStep(2);
        saveSignupState();
        return;
      }

      if (currentStep === 2) {
        const fields = [
          'password', 'confirmPassword', 'country', 'role', 'preferredLanguage',
          'termsAccepted', 'eConsent', 'marketingConsent'
        ];
        if (userType === 'admin') fields.push('dpaAccepted');

        const values = await form.validateFields(fields);

        // 🔴 Hard gate — every user must actively tick required consents
        const missingConsents = [];
        if (values.termsAccepted !== true) missingConsents.push('Terms & Privacy');
        if (values.eConsent !== true) missingConsents.push('Electronic records');
        if (userType === 'admin' && values.dpaAccepted !== true) missingConsents.push('DPA / BAA');

        if (missingConsents.length > 0) {
          message.error(`Please tick the required consents: ${missingConsents.join(', ')}`);
          return;
        }

        // Strip secrets before persisting
        const { password, confirmPassword, ...safeValues } = values;
        setFormData((prev) => ({ ...prev, ...safeValues }));
        setSelectedCountry(values.country || 'default');
        setResidency(REGION_BY_COUNTRY(values.country));
        passwordRef.current = password;

        setCurrentStep(3);
        saveSignupState();
        return;
      }

      if (currentStep === 3) {
        if (!registrationComplete) {
          await handleCreateAccount();
        }
        return;
      }
    } catch (err) {
      console.log('Validation failed:', err);
    }
  };

  const prevStep = () => {
    if (currentStep === 3 && registrationComplete) {
      message.info('Complete your plan selection first');
      return;
    }
    setCurrentStep(currentStep - 1);
    saveSignupState();
  };

  // ============================================
  // VERIFICATION
  // ============================================
  const handleVerificationComplete = () => {
    setShowVerification(false);
    setVerificationCompleted(true);
    localStorage.setItem('verifiedEmail', currentEmail || formData.email);
    saveSignupState();
    message.success('Email verified successfully! You can now select a plan.');
    if (currentStep !== 3) setCurrentStep(3);
  };

  // ============================================
  // CUSTOM PLAN MODAL
  // ============================================
  const CustomPlanModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TeamOutlined style={{ color: '#722ed1' }} />
          <span>Custom Enterprise Plan Inquiry</span>
        </div>
      }
      open={showCustomPlanModal}
      onCancel={() => setShowCustomPlanModal(false)}
      footer={[
        <Button key="cancel" onClick={() => setShowCustomPlanModal(false)}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleCustomPlanContact} style={{ background: '#722ed1', borderColor: '#722ed1' }}>
          Send Inquiry
        </Button>
      ]}
      width={600}
    >
      <div style={{ padding: '16px 0' }}>
        <Alert
          message="Contact Our Sales Team"
          description="We'll create a custom enterprise plan tailored to your organization's specific needs."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <div style={{ marginBottom: 24 }}>
          <Title level={5}>Contact Details</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <PhoneOutlined style={{ color: '#52c41a' }} />
              <div><Text strong>Phone:</Text> <Text>+1 (555) 123-4567</Text></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MailOutlined style={{ color: '#1890ff' }} />
              <div><Text strong>Email:</Text> <Text>enterprise@safetytrackpro.com</Text></div>
            </div>
          </Space>
        </div>

        <Divider />

        <Title level={5}>Tell Us About Your Needs</Title>

        <Form layout="vertical">
          <Form.Item label="Contact Email">
            <Input placeholder="Enter contact email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} prefix={<MailOutlined />} />
          </Form.Item>
          <Form.Item label="Contact Phone">
            <Input placeholder="Enter contact phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} prefix={<PhoneOutlined />} />
          </Form.Item>
          <Form.Item label="Your Requirements">
            <Input.TextArea
              rows={4}
              placeholder="Please describe your organization's needs, number of users, specific features required..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Form>

        <Alert
          message="What to Expect"
          description="Our team will contact you within 24 hours to discuss pricing, custom features, and implementation."
          type="success"
          showIcon
        />
      </div>
    </Modal>
  );

  const handleCustomPlanContact = async () => {
    if (!contactMessage.trim()) {
      message.warning('Please enter your message');
      return;
    }
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || 'https://safetrackproglobal-backend-production.up.railway.app';
      const response = await fetch(`${API_BASE}/api/contact/custom-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentEmail || formData.email,
          contactEmail: contactEmail || formData.email,
          contactPhone: contactPhone || formData.phone,
          message: contactMessage,
          userType,
          company: formData.companyName || '',
          employeeCount: formData.employeeCount || 0,
          plan: selectedPlan,
          user_id: userId || localStorage.getItem('pendingUserId'),
          company_id: companyId
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        message.success('Contact request sent! Our team will contact you within 24 hours.');
        setShowCustomPlanModal(false);
        sessionStorage.removeItem('signupState');
        history.push('/login');
      } else {
        message.error(data.error || 'Failed to send contact request');
      }
    } catch (err) {
      console.error('Contact error:', err);
      message.error('Could not send request. Please email enterprise@safetytrackpro.com directly.');
    }
  };

  // ============================================
  // STEPS
  // ============================================
  const steps = [
    { title: 'Type', content: renderUserTypeStep() },
    { title: 'Basic Info', content: renderBasicInfoStep() },
    { title: 'Security', content: renderSecurityStep() },
    { title: 'Plan', content: renderPlanStep() }
  ];

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
        <Card className="auth-card signup-card" style={{ maxWidth: 750, margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <SafetyCertificateOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 16 }} />
              <Title level={2}>Create Account</Title>
              <Text type="secondary">Join SafetyTrack Pro</Text>
            </div>

            <Steps current={currentStep} className="signup-steps" size="small">
              {steps.map((item) => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>

            <Form
              form={form}
              name="signup"
              layout="vertical"
              size="large"
              scrollToFirstError
            >
              <div className="steps-content">{steps[currentStep]?.content}</div>

              {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

              <div className="steps-action">
                <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
                  {currentStep > 0 && currentStep < 3 && (
                    <Button onClick={prevStep} size="large" icon={<ArrowLeftOutlined />}>Back</Button>
                  )}
                  <div style={{ flex: 1 }} />

                  {currentStep < steps.length - 1 && (
                    <Button type="primary" onClick={nextStep} size="large" icon={<ArrowRightOutlined />}>
                      Next
                    </Button>
                  )}

                  {currentStep === steps.length - 1 && !registrationComplete && (
                    <Button
                      type="primary"
                      onClick={handleCreateAccount}
                      loading={loading}
                      size="large"
                      icon={<SafetyCertificateOutlined />}
                    >
                      Create Account
                    </Button>
                  )}

                  {currentStep === steps.length - 1 && registrationComplete && (
                    <Button
                      type="primary"
                      onClick={handlePlanSelection}
                      loading={planActivationLoading}
                      size="large"
                      icon={<CheckCircleOutlined />}
                      disabled={!selectedPlan || !verificationCompleted}
                    >
                      {!verificationCompleted ? 'Verify Email First'
                        : selectedPlan === 'custom' ? 'Contact Sales'
                        : selectedPlan === 'free' ? 'Activate Free Plan'
                        : `Activate ${selectedPlan.toUpperCase()} Plan`}
                    </Button>
                  )}
                </Space>
              </div>
            </Form>

            <Divider>Or</Divider>

            <div style={{ textAlign: 'center' }}>
              <Text>
                Already have an account?{' '}
                <Button type="link" onClick={() => history.push('/login')} style={{ padding: 0 }}>
                  Sign in
                </Button>
              </Text>
            </div>
          </Space>
        </Card>

        {showVerification && (
          <VerificationModal
            email={currentEmail || formData.email}
            onVerified={handleVerificationComplete}
            onClose={() => {
              setShowVerification(false);
              saveSignupState();
            }}
            onResend={() => message.success('New verification code sent to your email.')}
          />
        )}

        {renderPaymentModal()}
        <CustomPlanModal />
      </div>
    </ConfigProvider>
  );
}

export default SignupPage;
