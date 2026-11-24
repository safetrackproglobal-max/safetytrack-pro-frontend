import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, Row, Col, Tag } from 'antd';
import {
  SafetyCertificateOutlined,
  TeamOutlined,
  DashboardOutlined,
  FileTextOutlined,
  BarChartOutlined,
  RobotOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  BuildOutlined,
  CarOutlined,
  BlockOutlined,
  FireOutlined,
  MedicineBoxOutlined,
  CloudOutlined,
  DatabaseOutlined,
  SecurityScanOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  MobileOutlined,
  VideoCameraOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  VerifiedOutlined,
  ReadOutlined,
  EditOutlined,
  SaveOutlined,
  SignatureOutlined,
  DownloadOutlined,
  FileAddOutlined,
  FileDoneOutlined,
  FundOutlined,
  PlusOutlined,
  FolderOutlined,
  ReloadOutlined,
  SettingOutlined,
  ExpandOutlined
} from '@ant-design/icons';
import { useLanguage } from '../context/LanguageContext';
import Seo from '../components/SEO';
import './HomePage.css';
import './HomePage.additions.css';

/* ============================================================
   CONFIG
   ============================================================ */
const SITE_URL = 'https://www.safetrackproglobal.com';

// Use an env var when available (CRA: REACT_APP_API_BASE_URL). Ideally point this at a
// custom domain such as https://api.safetrackproglobal.com instead of the Railway URL.
const API_BASE =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) ||
  'https://safetrackproglobal-backend-production.up.railway.app';

/**
 * Every internal link used on this page lives here.
 * Pages marked NEW still need to be created; rename a path in ONE place if you change it.
 */
const LINKS = {
  // existing
  signup: '/signup',
  pricing: '/pricing',
  contact: '/contact',
  features: '/features',
  exam: '/csp-practice-exam/free-test',
  // NEW – conversion / trust
  demo: '/demo',
  trust: '/trust',
  // NEW – solution pages
  hseProject: '/hse-project-management-software',
  camera: '/ai-camera-monitoring',
  incidents: '/incident-reporting-software',
  documents: '/ai-hse-document-generator',
  documentControl: '/document-control-software',
  ptw: '/permit-to-work-software',
  environmental: '/environmental-monitoring-software',
  compliance: '/compliance-management-software',
  risk: '/ai-risk-assessment-software',
  dashboard: '/hse-dashboard-software',
  analytics: '/hse-analytics-software',
  workforce: '/workforce-management-software',
  cspExam: '/csp-practice-exam'
  // NEW – industries: /industries/<slug>   |  NEW – compliance: /compliance/<slug>
};

/* ============================================================
   STATIC DATA (module-level so it is not rebuilt on each render)
   ============================================================ */
const HERO_SLIDES = [
  {
    image: 'https://i.imgur.com/sisSwvH.png',
    alt: 'SafeTrack Pro environmental intelligence dashboard with live air and water monitoring',
    title: 'Environmental Intelligence Dashboard',
    description: 'Real-time environmental monitoring with AI-powered insights',
    badge: 'Environmental Management'
  },
  {
    image: 'https://i.imgur.com/8ZPHKkB.png',
    alt: 'SafeTrack Pro carbon footprint and environmental health dashboard',
    title: 'Environmental Health & Carbon Footprint',
    description: 'Track emissions, sustainability index, and live sensors',
    badge: 'Sustainability & ESG'
  },
  {
    image: 'https://i.imgur.com/HGCjpo7.png',
    alt: 'SafeTrack Pro live enterprise safety metrics dashboard',
    title: 'Live Enterprise Safety Metrics',
    description: 'Live air quality and water quality compliance tracking',
    badge: 'Live Monitoring'
  },
  {
    image: 'https://i.imgur.com/tGZqMim.png',
    alt: 'SafeTrack Pro healthcare management suite for patient safety monitoring',
    title: 'Healthcare Management Suite',
    description: 'AI tools and patient safety monitoring for healthcare facilities',
    badge: 'Healthcare Solutions'
  },
  {
    image: 'https://i.imgur.com/wyE6j0k.png',
    alt: 'SafeTrack Pro safety compliance dashboard with manpower distribution and LTI trends',
    title: 'Safety Compliance Dashboard',
    description: 'Manpower distribution, LTI trends, and accident rates',
    badge: 'Safety Analytics'
  }
];

const HERO_TAGS = [
  { icon: <VideoCameraOutlined />, label: 'AI Camera Monitoring', to: LINKS.camera },
  { icon: <ThunderboltOutlined />, label: 'Instant Incident Reports', to: LINKS.incidents },
  { icon: <FileTextOutlined />, label: 'Document Lifecycle Control', to: LINKS.documentControl },
  { icon: <EnvironmentOutlined />, label: 'Live Environmental Monitoring', to: LINKS.environmental },
  { icon: <RobotOutlined />, label: 'AI-Powered Risk Analysis', to: LINKS.risk }
];

const TRUST_BADGES = [
  { icon: <VerifiedOutlined />, label: 'Aligned with ISO 27001', color: '#1890ff' },
  { icon: <SecurityScanOutlined />, label: 'Aligned with SOC 2', color: '#52c41a' },
  { icon: <SafetyCertificateOutlined />, label: 'Aligned with ISO 45001', color: '#fa8c16' },
  { icon: <GlobalOutlined />, label: 'Multi-Industry Ready', color: '#722ed1' }
];

const HSE_GROUPS = [
  {
    group: 'Overview',
    icon: <DashboardOutlined />,
    color: '#2563eb',
    intro: 'Your entire HSE operation, distilled into live KPIs and executive dashboards.',
    modules: [
      {
        icon: <DashboardOutlined />,
        name: 'Overview Dashboard',
        desc: 'A single live view of every HSE metric across all sites, departments, and projects, updated in real time so you always know the state of your operation.'
      },
      {
        icon: <FundOutlined />,
        name: 'KPI Cards',
        desc: 'Configurable KPI cards for TRIR, LTIFR, compliance rate, training coverage, and incident frequency: visual, color-coded, and drillable.'
      }
    ]
  },
  {
    group: 'Workforce',
    icon: <TeamOutlined />,
    color: '#7c3aed',
    intro: 'Know exactly who is on site, where they are deployed, and how they are tracked.',
    modules: [
      {
        icon: <TeamOutlined />,
        name: 'Manpower Distribution',
        desc: 'See how your workforce is allocated across sections, shifts, and disciplines, with real-time headcount, contractor vs. staff ratios, and deployment trends.'
      },
      {
        icon: <TeamOutlined />,
        name: 'Workforce Management',
        desc: 'Full personnel records including certifications, medicals, inductions, and site access, with automatic expiry alerts and contractor onboarding workflows.'
      }
    ]
  },
  {
    group: 'Training',
    icon: <ReadOutlined />,
    color: '#0891b2',
    intro: 'Make sure every worker is trained, certified, and compliant before they step on site.',
    modules: [
      {
        icon: <ReadOutlined />,
        name: 'Training & Competency',
        desc: 'Track mandatory training, competency assessments, toolbox talks, and refresher cycles. Get automatic alerts before certifications expire and pull compliance records quickly during audits.'
      }
    ]
  },
  {
    group: 'Safety',
    icon: <SafetyCertificateOutlined />,
    color: '#059669',
    intro: 'The full safety intelligence suite, from incidents and observations to injury analytics.',
    modules: [
      {
        icon: <LineChartOutlined />,
        name: 'LTI Trend',
        desc: 'Lost Time Injury trends visualized over weeks, months, and quarters, so you can spot patterns, forecast risk, and demonstrate improvement to regulators.'
      },
      {
        icon: <ClockCircleOutlined />,
        name: 'Man-Hours Analysis',
        desc: 'Track exposure hours and compute TRIR, LTIFR, and DART rates without manual spreadsheets. Built for monthly and annual HSE reporting.'
      },
      {
        icon: <AlertOutlined />,
        name: 'Observations',
        desc: 'Capture behavior-based safety observations from any device, classify them by type and severity, and track corrective actions through to closure.'
      },
      {
        icon: <CarOutlined />,
        name: 'Accidents',
        desc: 'Log vehicle, equipment, and site accidents with photos, witnesses, and root cause analysis, and generate investigation reports quickly.'
      },
      {
        icon: <MedicineBoxOutlined />,
        name: 'Injuries',
        desc: 'Record first aid, medical treatment, restricted duty, and recordable injuries with full case management, follow-up tracking, and OSHA 300 log generation.'
      }
    ]
  },
  {
    group: 'Compliance',
    icon: <VerifiedOutlined />,
    color: '#dc2626',
    intro: 'Stay ahead of every permit, inspection, and regulatory deadline.',
    modules: [
      {
        icon: <SafetyCertificateOutlined />,
        name: 'Overdue & Expiry Tracking',
        desc: 'Track every expiring permit, license, inspection, and corrective action across your operation. Receive alerts days or weeks in advance and avoid last-minute audit surprises.'
      }
    ]
  }
];

const TRUST_ITEMS = [
  {
    icon: <SecurityScanOutlined />,
    title: 'Enterprise-Grade Security',
    text: 'Security controls aligned with ISO 27001 and SOC 2: encryption, role-based access control, and complete audit trails across every module.',
    to: LINKS.trust,
    cta: 'Read about our security'
  },
  {
    icon: <GlobalOutlined />,
    title: 'Built for Regulated Industries',
    text: 'Workflows aligned with OSHA, ISO 45001, HIPAA, MLC 2006, ICAO SMS, MSHA, and REACH, with region-specific modules.',
    to: LINKS.compliance,
    cta: 'Explore compliance management'
  },
  {
    icon: <FileDoneOutlined />,
    title: 'Audit-Ready Records',
    text: 'Version control, expiry tracking, and a full audit trail on every document, permit, and corrective action.',
    to: LINKS.documentControl,
    cta: 'See document control'
  }
];

const STEPS = [
  {
    step: '01',
    icon: <TeamOutlined />,
    title: 'Connect Your Team',
    description:
      'Invite users, assign roles, and set up departments, sites, and shifts. SSO and role-based access included.',
    color: '#2563eb'
  },
  {
    step: '02',
    icon: <RobotOutlined />,
    title: 'Activate AI Modules',
    description:
      'Turn on AI camera monitoring, incident reporting, the document lifecycle, and environmental sensors.',
    color: '#7c3aed'
  },
  {
    step: '03',
    icon: <SafetyCertificateOutlined />,
    title: 'Track Compliance',
    description:
      'Follow compliance status in real time with live dashboards and automated reports.',
    color: '#059669'
  }
];

const DOCUMENT_LIFECYCLE = [
  { icon: <FileAddOutlined />, label: 'Auto-Create', color: '#2563eb' },
  { icon: <EditOutlined />, label: 'Modify', color: '#7c3aed' },
  { icon: <SaveOutlined />, label: 'Submit', color: '#0891b2' },
  { icon: <SignatureOutlined />, label: 'Sign', color: '#059669' },
  { icon: <DownloadOutlined />, label: 'Download', color: '#ca8a04' },
  { icon: <DatabaseOutlined />, label: 'Archive', color: '#dc2626' }
];

const INCIDENT_STEPS = [
  { icon: <MobileOutlined />, label: 'Report', sub: 'From any device' },
  { icon: <RobotOutlined />, label: 'AI Classify', sub: 'Severity & category' },
  { icon: <AlertOutlined />, label: 'Notify', sub: 'Managers & responders' },
  { icon: <FileTextOutlined />, label: 'Document', sub: 'Auto-generated report' },
  { icon: <CheckCircleOutlined />, label: 'Resolve', sub: 'Track to closure' },
  { icon: <FundOutlined />, label: 'Learn', sub: 'Trends & prevention' }
];

const PTW_STEPS = [
  { icon: <FileAddOutlined />, label: 'Request', sub: 'Create the work permit' },
  { icon: <SafetyCertificateOutlined />, label: 'Assess Risk', sub: 'Integrated risk assessment' },
  { icon: <VerifiedOutlined />, label: 'Approve', sub: 'Approval workflow' },
  { icon: <DatabaseOutlined />, label: 'Close Out', sub: 'Full audit trail' }
];

// Static summary strip (replaces the animated counters).
const STATS = [
  { value: '9', label: 'Industries Supported' },
  { value: '12', label: 'Compliance Frameworks' },
  { value: '24/7', label: 'AI Camera Monitoring' },
  { value: '6', label: 'Document Lifecycle Stages' }
];

const INDUSTRIES = [
  {
    slug: 'healthcare',
    icon: <MedicineBoxOutlined />,
    title: 'Healthcare',
    description:
      'Patient safety, infection control, medical equipment compliance, and healthcare workforce protection across hospitals, clinics, and care facilities.',
    features: ['Patient Safety', 'Infection Control', 'Device Compliance', 'Staff Safety'],
    details:
      'Aligned with HIPAA & Joint Commission requirements • Real-time patient monitoring • Medication tracking • Clinical incident reporting',
    color: '#1890ff',
    gradient: 'linear-gradient(135deg, #1890ff15, #1890ff30)',
    image: 'https://i.imgur.com/FEfAMkR.jpeg'
  },
  {
    slug: 'oil-and-gas',
    icon: <FireOutlined />,
    title: 'Oil & Gas',
    description:
      'End-to-end process safety management for upstream, midstream, and downstream operations, from HAZOP studies to permit-to-work and emergency response.',
    features: ['Process Safety', 'HAZOP Studies', 'Permit-to-Work', 'Emergency Response'],
    details:
      'Aligned with OSHA 1910.119 PSM • Real-time gas detection • Fire & gas mapping • Offshore & onshore coverage',
    color: '#fa8c16',
    gradient: 'linear-gradient(135deg, #fa8c1615, #fa8c1630)',
    image: 'https://i.imgur.com/6vkeW5t.png'
  },
  {
    slug: 'construction',
    icon: <BuildOutlined />,
    title: 'Construction',
    description:
      'Site safety management for high-rise, infrastructure, and civil projects with fall protection, equipment inspections, and contractor compliance tracking.',
    features: ['Site Safety', 'Fall Protection', 'Equipment Inspections', 'Contractor Management'],
    details:
      'Aligned with OSHA 1926 • Multi-site coordination • Permit-to-work systems • Daily safety audits • Toolbox talks',
    color: '#52c41a',
    gradient: 'linear-gradient(135deg, #52c41a15, #52c41a30)',
    image: 'https://i.imgur.com/LgvReqs.jpeg'
  },
  {
    slug: 'manufacturing',
    icon: <BuildOutlined />,
    title: 'Manufacturing',
    description:
      'Machine safety, ergonomic risk assessments, chemical handling procedures, and industrial hygiene monitoring for factories and production facilities.',
    features: ['Machine Safety', 'Ergonomics', 'Chemical Handling', 'Industrial Hygiene'],
    details:
      'Aligned with ISO 45001 • Lockout/tagout systems • Machine guarding • Noise & vibration monitoring',
    color: '#722ed1',
    gradient: 'linear-gradient(135deg, #722ed115, #722ed130)',
    image: 'https://i.imgur.com/Lh45z4B.png'
  },
  {
    slug: 'maritime',
    icon: <BlockOutlined />,
    title: 'Maritime',
    description:
      'Vessel safety, crew welfare management, ISM Code compliance, and navigation safety for shipping, ports, and offshore marine operations.',
    features: ['Vessel Safety', 'Crew Management', 'Navigation Safety', 'ISM Compliance'],
    details:
      'Aligned with MLC 2006 • STCW training records • Crew welfare tracking • Emergency drills',
    color: '#13c2c2',
    gradient: 'linear-gradient(135deg, #13c2c215, #13c2c230)',
    image: 'https://i.imgur.com/7OYPUbO.png'
  },
  {
    slug: 'aviation',
    icon: <CarOutlined />,
    title: 'Aviation',
    description:
      'Flight safety, ground operations, SMS compliance, and maintenance tracking for airlines, airports, and MRO facilities worldwide.',
    features: ['Flight Safety', 'Ground Operations', 'Maintenance Tracking', 'Regulatory Compliance'],
    details:
      'Aligned with ICAO SMS, FAA & EASA requirements • Fatigue risk management • Bird strike tracking',
    color: '#2f54eb',
    gradient: 'linear-gradient(135deg, #2f54eb15, #2f54eb30)',
    image: 'https://i.imgur.com/Ob1YCRi.png'
  },
  {
    slug: 'mining',
    icon: <DatabaseOutlined />,
    title: 'Mining',
    description:
      'Underground and surface mining safety including geotechnical monitoring, ventilation control, equipment tracking, and emergency response systems.',
    features: ['Geotechnical Safety', 'Ventilation', 'Equipment Tracking', 'Emergency Response'],
    details:
      'Aligned with MSHA requirements • Gas detection • Ground control monitoring • Blast management',
    color: '#d4380d',
    gradient: 'linear-gradient(135deg, #d4380d15, #d4380d30)',
    image: 'https://i.imgur.com/Zv35mJ3.jpeg'
  },
  {
    slug: 'chemical',
    icon: <CloudOutlined />,
    title: 'Chemical',
    description:
      'Hazardous material management, spill prevention, process safety, and environmental compliance for chemical plants, refineries, and pharmaceutical facilities.',
    features: ['HazMat Management', 'Spill Prevention', 'Process Safety', 'Environmental Compliance'],
    details:
      'Aligned with REACH & TSCA • SDS management • Chemical inventory • Emergency response planning',
    color: '#eb2f96',
    gradient: 'linear-gradient(135deg, #eb2f9615, #eb2f9630)',
    image: 'https://i.imgur.com/Ue9j403.png'
  },
  {
    slug: 'education',
    icon: <ReadOutlined />,
    title: 'Education',
    description:
      'Campus safety management for schools, universities, and educational institutions with student welfare, emergency preparedness, and facility safety monitoring.',
    features: ['Student Safety', 'Campus Security', 'Emergency Drills', 'Facility Inspections'],
    details:
      'Aligned with FERPA • Visitor management • Incident reporting • Emergency response plans',
    color: '#faad14',
    gradient: 'linear-gradient(135deg, #faad1415, #faad1430)',
    image: 'https://i.imgur.com/RPQIyI9.jpeg'
  }
];

// `to` decides where each framework badge links. Only 4 new compliance pages are needed;
// the rest reuse industry pages or the Trust page.
const FRAMEWORKS = [
  { code: 'OSHA', label: 'Occupational Safety', color: '#2563eb', to: '/compliance/osha' },
  { code: 'ISO 45001', label: 'OH&S Management', color: '#7c3aed', to: '/compliance/iso-45001' },
  { code: 'ISO 14001', label: 'Environmental', color: '#059669', to: '/compliance/iso-14001' },
  { code: 'ISO 27001', label: 'Information Security', color: '#0891b2', to: LINKS.trust },
  { code: 'HIPAA', label: 'Healthcare Privacy', color: '#dc2626', to: '/compliance/hipaa' },
  { code: 'SOC 2', label: 'Service Security', color: '#ca8a04', to: LINKS.trust },
  { code: 'MLC 2006', label: 'Maritime Labour', color: '#0ea5e9', to: '/industries/maritime' },
  { code: 'ICAO SMS', label: 'Aviation Safety', color: '#6366f1', to: '/industries/aviation' },
  { code: 'MSHA', label: 'Mining Safety', color: '#b45309', to: '/industries/mining' },
  { code: 'REACH', label: 'Chemical Safety', color: '#db2777', to: '/industries/chemical' },
  { code: 'TSCA', label: 'Chemical Control', color: '#16a34a', to: '/industries/chemical' },
  { code: 'GDPR', label: 'Data Protection', color: '#7e22ce', to: LINKS.trust }
];

const FEATURES = [
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Compliance Management',
    description:
      'Automated regulatory tracking, real-time alerts, and one-click reporting aligned with OSHA, ISO 45001, HIPAA, and more.',
    color: '#4CAF50',
    to: LINKS.compliance,
    linkLabel: 'compliance management'
  },
  {
    icon: <RobotOutlined />,
    title: 'AI Risk Assessment',
    description:
      'Predictive analytics that help identify hazards before they become incidents.',
    color: '#2196F3',
    to: LINKS.risk,
    linkLabel: 'AI risk assessment'
  },
  {
    icon: <DashboardOutlined />,
    title: 'Real-time Safety Dashboard',
    description:
      'Live KPIs, incident heatmaps, and compliance status, configurable for any industry and any role.',
    color: '#FF9800',
    to: LINKS.dashboard,
    linkLabel: 'the safety dashboard'
  },
  {
    icon: <FileTextOutlined />,
    title: 'Smart Document Lifecycle',
    description:
      'Auto-create, modify, submit, digitally sign, download, and archive, with AI classification and version control.',
    color: '#9C27B0',
    to: LINKS.documentControl,
    linkLabel: 'document control'
  },
  {
    icon: <BarChartOutlined />,
    title: 'Advanced Analytics',
    description:
      'Trend analysis, predictive modeling, and custom reporting that turn safety data into decisions.',
    color: '#E91E63',
    to: LINKS.analytics,
    linkLabel: 'HSE analytics'
  },
  {
    icon: <TeamOutlined />,
    title: 'Team Collaboration',
    description:
      'Role-based access across departments, shifts, and sites, with real-time task assignment and tracking.',
    color: '#00BCD4',
    to: LINKS.workforce,
    linkLabel: 'workforce management'
  },
  {
    icon: <VideoCameraOutlined />,
    title: 'AI Camera Monitoring',
    description:
      'Live video analysis detecting PPE compliance, unsafe behavior, and hazards, with instant alerts 24/7.',
    color: '#8BC34A',
    to: LINKS.camera,
    linkLabel: 'AI camera monitoring'
  },
  {
    icon: <EnvironmentOutlined />,
    title: 'Live Environmental Monitoring',
    description:
      'Track air, water, emissions, and carbon in real time, with AI prediction and ESG reporting.',
    color: '#FF5722',
    to: LINKS.environmental,
    linkLabel: 'environmental monitoring'
  }
];

const BENEFITS = [
  {
    icon: <DatabaseOutlined />,
    title: 'Replace Scattered Tools',
    description:
      'Bring spreadsheets, chat groups, and disconnected tools into a single HSE platform for every site.'
  },
  {
    icon: <FileDoneOutlined />,
    title: 'Audit-Ready Records',
    description:
      'Version control, expiry tracking, and complete audit trails across documents, permits, and corrective actions.'
  },
  {
    icon: <GlobalOutlined />,
    title: 'Built for Your Industry',
    description:
      'Industry-specific modules and framework alignment for 9 industries, with region-specific modules.'
  },
  {
    icon: <RobotOutlined />,
    title: 'AI Where It Matters',
    description:
      'AI camera monitoring, severity scoring, and document generation that reduce manual work for safety teams.'
  }
];

const BENEFIT_CARDS = [
  { icon: <VideoCameraOutlined />, label: 'AI Camera 24/7', to: LINKS.camera, cls: 'card-1' },
  { icon: <ThunderboltOutlined />, label: 'Instant Reports', to: LINKS.incidents, cls: 'card-2' },
  { icon: <FileTextOutlined />, label: 'Doc Lifecycle', to: LINKS.documentControl, cls: 'card-3' },
  { icon: <EnvironmentOutlined />, label: 'Live Environmental', to: LINKS.environmental, cls: 'card-4' }
];

/* ---- Pricing: static defaults render immediately; backend prices replace them when loaded ---- */
const PLAN_META = {
  free: {
    name: 'Starter',
    description: 'For small facilities and startups',
    features: [
      'Up to 3 users',
      'Basic incident reporting',
      'Document management',
      'Email notifications',
      'Basic analytics',
      'Mobile access',
      'Community support'
    ],
    link: LINKS.signup,
    buttonText: 'Get Started'
  },
  pro: {
    name: 'Professional',
    description: 'For growing organizations',
    features: [
      'Up to 50 users',
      'All Basic features',
      'ML image analysis',
      'Advanced analytics',
      'Team management',
      'Real-time monitoring alerts',
      'Priority email support',
      'Custom reporting'
    ],
    link: LINKS.signup,
    buttonText: 'Start Free Trial',
    popular: true
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large enterprises and multi-site operations',
    features: [
      'Unlimited users',
      'All Pro features',
      'Custom workflows & forms',
      'API Integration',
      'Dedicated infrastructure (SLA)',
      'On-premise deployment',
      'Dedicated account manager',
      'White-labeling options'
    ],
    link: LINKS.contact,
    buttonText: 'Contact Sales'
  }
};

const buildPlan = (key, price, period) => ({ id: key, ...PLAN_META[key], price, period });

const DEFAULT_PLANS = [
  buildPlan('free', 'Free', ''),
  buildPlan('pro', 'See plans', ''),
  buildPlan('enterprise', 'Custom', '')
];

const CURRENCY_SYMBOLS = { USD: '$', GHS: 'GH₵', QAR: 'QR', INR: '₹', EUR: '€' };

const FAQS = [
  {
    q: 'What is HSE software?',
    a: 'HSE (Health, Safety and Environment) software brings incident reporting, risk assessments, permits, training, documents, and compliance tracking into one platform, so safety teams can manage their operation without spreadsheets and scattered chat groups.'
  },
  {
    q: 'What does SafeTrack Pro Global include?',
    a: 'SafeTrack Pro Global includes HSE project management dashboards, AI camera monitoring, instant incident reporting, a complete document lifecycle, permit to work, AI risk assessment, live environmental monitoring, compliance management, an AI document generator, and a CSP exam simulator.'
  },
  {
    q: 'Which standards and frameworks does SafeTrack Pro align with?',
    a: 'Our workflows are aligned with OSHA, ISO 45001, ISO 14001, HIPAA, MLC 2006, ICAO SMS, MSHA, REACH, TSCA, and GDPR, and our security controls are aligned with ISO 27001 and SOC 2. Alignment does not imply certification or attestation unless stated on our Trust page.'
  },
  {
    q: 'Does AI camera monitoring work with existing cameras?',
    a: 'Yes. AI camera monitoring works with your existing IP cameras to detect PPE compliance, unsafe behavior, and hazards, and sends instant alerts to your team.'
  },
  {
    q: 'Can SafeTrack Pro generate safety documents such as SOPs and JHAs?',
    a: 'Yes. The AI document generator creates formatted SOPs, job hazard analyses (JHAs), and incident reports with OSHA and ISO references, an approval workflow (prepared, reviewed, approved), and export to PDF or Word.'
  },
  {
    q: 'Is there a free plan?',
    a: 'The Starter plan is designed for small facilities and startups with up to 3 users. See the pricing section for current plans and prices, or contact us for an enterprise quote.'
  },
  {
    q: 'Where is SafeTrack Pro Global based?',
    a: 'SafeTrack Pro Global is headquartered in Doha, Qatar. You can reach us at info@safetrackproglobal.com or +974 3325 1705.'
  }
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'SafeTrack Pro Global',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/android-chrome-512x512.png`,
      email: 'info@safetrackproglobal.com',
      telephone: '+974 3325 1705',
      address: { '@type': 'PostalAddress', addressLocality: 'Doha', addressCountry: 'QA' },
      sameAs: ['https://x.com/safetrackpro']
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'SafeTrack Pro Global',
      publisher: { '@id': `${SITE_URL}/#organization` }
    },
    {
      '@type': 'SoftwareApplication',
      name: 'SafeTrack Pro Global',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: `${SITE_URL}/`,
      description:
        'AI-powered HSE software for incident reporting, permit to work, AI camera PPE monitoring, document control, and compliance management.',
      publisher: { '@id': `${SITE_URL}/#organization` }
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    }
  ]
};

/* ============================================================
   SMALL HELPERS
   ============================================================ */
// Renders a real <a href> (crawlable) but navigates client-side.
function NavButton({ to, children, ...rest }) {
  const history = useHistory(); // React Router v5
  const handleClick = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    history.push(to);
  };
  return (
    <Button href={to} onClick={handleClick} {...rest}>
      {children}
    </Button>
  );
}

/* ============================================================
   PAGE
   ============================================================ */
function HomePage() {
  const { isRTL } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [pricingPlans, setPricingPlans] = useState(DEFAULT_PLANS);

  // Pricing: defaults are already rendered; replace with backend prices if the call succeeds.
  useEffect(() => {
    const controller = new AbortController();

    const loadPricing = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/plans/pricing?country=default`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`Pricing request failed (${res.status})`);
        const data = await res.json();

        const formatted = ['free', 'pro', 'enterprise']
          .filter((key) => data && data[key])
          .map((key) => {
            const priceData = data[key];
            const amount = priceData['1_month'];
            const symbol = CURRENCY_SYMBOLS[priceData.currency] || '$';

            if (amount === 'Custom') return buildPlan(key, 'Custom', '');
            if (amount === 0 || amount === '0') return buildPlan(key, 'Free', '');
            return buildPlan(key, `${symbol}${amount}`, '/month');
          });

        if (formatted.length) setPricingPlans(formatted);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load pricing, showing default plans:', error);
        }
      }
    };

    loadPricing();
    return () => controller.abort();
  }, []);

  // Carousel autoplay: pauses on hover/focus and is disabled for reduced-motion users.
  useEffect(() => {
    if (carouselPaused) return undefined;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [carouselPaused]);

  return (
    <div className={`home-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Seo
        title="HSE Software with AI Camera Monitoring | SafeTrack Pro Global"
        description="AI-powered HSE software for incident reporting, permit to work, AI camera PPE monitoring and OSHA/ISO 45001 compliance. Book a demo."
        canonical={`${SITE_URL}/`}
        image={`${SITE_URL}/android-chrome-512x512.png`}
        jsonLd={JSON_LD}
      />

      {/* ============================================
           HERO  (the ONLY <h1> on the page)
           ============================================ */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="hero-bg-animation" aria-hidden="true">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="orb orb-4"></div>
        </div>

        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="welcome-badge animate-slide-in">
                <span className="badge-pulse" aria-hidden="true">●</span>
                AI-Powered Safety Platform
              </div>

              <div className="hero-trust-banner animate-fade-in-delay">
                <div className="trust-badge">
                  <VerifiedOutlined />
                  <span>Security aligned with ISO 27001 &amp; SOC 2</span>
                </div>
              </div>

              <h1 id="hero-heading" className="hero-title animate-fade-in">
                AI-Powered HSE Software <br />
                <span className="gradient-text">for Safer, Compliant Sites</span>
              </h1>

              <p className="hero-description animate-fade-in-delay-2">
                One platform for HSE teams across 9 industries. Combine{' '}
                <strong>AI camera monitoring</strong>, <strong>instant incident reporting</strong>,{' '}
                <strong>permit to work</strong>, <strong>full document lifecycle control</strong>, and{' '}
                <strong>live environmental monitoring</strong> in one place.
              </p>

              <div className="hero-features animate-fade-in-delay-3">
                {HERO_TAGS.map((tag) => (
                  <Link key={tag.label} to={tag.to} className="feature-tag">
                    {tag.icon} {tag.label}
                  </Link>
                ))}
              </div>

              <div className="hero-actions animate-fade-in-delay-4">
                <NavButton to={LINKS.signup} type="primary" size="large" className="cta-button">
                  Start Free Trial <ArrowRightOutlined />
                </NavButton>
                <NavButton to={LINKS.demo} size="large" className="secondary-btn">
                  Book a Demo
                </NavButton>
              </div>

              <div className="trust-badges animate-fade-in-delay-5">
                {TRUST_BADGES.map((badge) => (
                  <div key={badge.label} className="trust-badge-item">
                    <span className="badge-icon" style={{ color: badge.color }}>
                      {badge.icon}
                    </span>
                    <span className="badge-label">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual animate-slide-in-right">
              <div
                className="hero-carousel-container"
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
                onFocus={() => setCarouselPaused(true)}
                onBlur={() => setCarouselPaused(false)}
                role="region"
                aria-roledescription="carousel"
                aria-label="SafeTrack Pro product screenshots"
              >
                <div
                  className="carousel-track"
                  style={{ transform: `translateX(-${activeSlide * 20}%)` }}
                >
                  {HERO_SLIDES.map((slide, index) => (
                    <div
                      key={slide.title}
                      className="carousel-slide"
                      aria-hidden={activeSlide !== index}
                    >
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        width="1160"
                        height="725"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="carousel-image"
                      />
                      <div className="carousel-overlay">
                        <span className="carousel-badge">{slide.badge}</span>
                        <p className="carousel-title">{slide.title}</p>
                        <p className="carousel-description">{slide.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="carousel-dots">
                  {HERO_SLIDES.map((slide, index) => (
                    <button
                      type="button"
                      key={slide.title}
                      className={`dot ${activeSlide === index ? 'active' : ''}`}
                      aria-label={`Show slide ${index + 1}: ${slide.title}`}
                      aria-current={activeSlide === index}
                      onClick={() => setActiveSlide(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
           HSE PROJECT MANAGEMENT
           ============================================ */}
      <section className="hse-project-section" id="hse-project-management">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">HSE Project Management</span>
            <h2 className="section-title">
              HSE Project Management Software in{' '}
              <span className="gradient-text">One Command Center</span>
            </h2>
            <p className="section-subtitle">
              SafeTrack Pro Global replaces scattered spreadsheets, WhatsApp groups, and
              disconnected tools with a single, intelligent platform. From manpower deployment and
              training compliance to LTI trends, accident analytics, and overdue actions, every
              part of your HSE operation is tracked, measured, and visualized in real time.
            </p>
          </div>

          {/* Illustrative dashboard preview (sample data) */}
          <div className="hse-dashboard-preview" aria-hidden="true">
            <div className="hse-dash-header">
              <div className="hse-dash-title">
                <SafetyCertificateOutlined /> Safety Compliance Dashboard
                <span className="live-dot"></span>
              </div>
              <div className="hse-dash-actions">
                <Tag color="blue">Sample data</Tag>
                <Tag>All Depts</Tag>
                <Button type="primary" size="small" icon={<PlusOutlined />} tabIndex={-1}>
                  New Project
                </Button>
              </div>
            </div>

            <div className="hse-dash-toolbar">
              <span>
                <FolderOutlined /> Sample project
              </span>
              <div className="toolbar-icons">
                <ReloadOutlined /> <PlusOutlined /> <FileTextOutlined />
                <DownloadOutlined /> <SettingOutlined /> <ExpandOutlined />
                <Tag color="blue">Edit</Tag>
              </div>
            </div>

            <div className="hse-dash-grid">
              <div className="hse-card">
                <div className="hse-card-header">
                  <span>
                    <TeamOutlined /> Manpower Distribution
                  </span>
                  <SettingOutlined />
                </div>
                <div className="hse-card-body">
                  <div className="donut-chart">
                    <div className="donut-center">100%</div>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <span className="legend-dot blue"></span> Section A: 100%
                    </span>
                  </div>
                </div>
                <div className="hse-card-footer">
                  <span>Total: 20</span>
                </div>
              </div>

              <div className="hse-card">
                <div className="hse-card-header">
                  <span>
                    <BarChartOutlined /> Training Statistics
                  </span>
                  <SettingOutlined />
                </div>
                <div className="hse-card-body">
                  <div className="bar-chart">
                    <div className="bar" style={{ height: '55%' }}></div>
                    <div className="bar" style={{ height: '75%' }}></div>
                    <div className="bar" style={{ height: '65%' }}></div>
                    <div className="bar" style={{ height: '90%' }}></div>
                  </div>
                </div>
                <div className="hse-card-footer">
                  <span>Sample chart</span>
                </div>
              </div>

              <div className="hse-card">
                <div className="hse-card-header">
                  <span>
                    <AlertOutlined /> Lost Time Injury Trend
                  </span>
                  <SettingOutlined />
                </div>
                <div className="hse-card-body">
                  <div className="bar-chart">
                    <div className="bar" style={{ height: '85%' }}></div>
                    <div className="bar" style={{ height: '65%' }}></div>
                    <div className="bar" style={{ height: '45%' }}></div>
                  </div>
                </div>
              </div>

              <div className="hse-card">
                <div className="hse-card-header">
                  <span>
                    <ClockCircleOutlined /> Man-Hours Analysis
                  </span>
                  <SettingOutlined />
                </div>
                <div className="hse-card-body">
                  <div className="bar-chart">
                    <div className="bar" style={{ height: '80%' }}></div>
                    <div className="bar" style={{ height: '60%' }}></div>
                    <div className="bar" style={{ height: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hse-modules-rich">
            {HSE_GROUPS.map((group) => (
              <div key={group.group} className="hse-rich-group">
                <div className="hse-rich-header" style={{ borderLeftColor: group.color }}>
                  <div
                    className="hse-rich-icon"
                    style={{ background: `${group.color}15`, color: group.color }}
                  >
                    {group.icon}
                  </div>
                  <div>
                    <h3 style={{ color: group.color }}>{group.group}</h3>
                    <p>{group.intro}</p>
                  </div>
                </div>

                <div className="hse-rich-modules">
                  {group.modules.map((mod) => (
                    <div key={mod.name} className="hse-rich-card">
                      <div
                        className="hse-rich-card-icon"
                        style={{ background: `${group.color}10`, color: group.color }}
                      >
                        {mod.icon}
                      </div>
                      <div className="hse-rich-card-text">
                        <strong>{mod.name}</strong>
                        <span>{mod.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="section-cta">
            <Link to={LINKS.hseProject} className="section-cta-link">
              Explore HSE project management software <ArrowRightOutlined />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
           TRUST & SECURITY
           ============================================ */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="trust-item">
                <div className="trust-icon">{item.icon}</div>
                <div className="trust-content">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <Link to={item.to} className="trust-link">
                    {item.cta} <ArrowRightOutlined />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
           HOW IT WORKS
           ============================================ */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">
              Get Started With SafeTrack Pro in{' '}
              <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="section-subtitle">
              From signup to compliance tracking: set up your team, modules, and dashboards quickly
            </p>
          </div>

          <Row gutter={[32, 32]} className="steps-row">
            {STEPS.map((item) => (
              <Col xs={24} md={8} key={item.step}>
                <div className="step-card">
                  <div className="step-number" style={{ color: item.color }}>
                    {item.step}
                  </div>
                  <div
                    className="step-icon"
                    style={{ background: `${item.color}15`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           DOCUMENT CONTROL
           ============================================ */}
      <section className="document-lifecycle-section" id="document-control">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Document Control</span>
            <h2 className="section-title">
              Document Control Software: Complete Lifecycle in{' '}
              <span className="gradient-text">One Flow</span>
            </h2>
            <p className="section-subtitle">
              From creation to archive, everything automated, traceable, and audit-ready
            </p>
          </div>

          <ol className="lifecycle-flow">
            {DOCUMENT_LIFECYCLE.map((step, index) => (
              <li key={step.label} className="lifecycle-step">
                <div
                  className="lifecycle-icon"
                  style={{ background: `${step.color}15`, color: step.color }}
                >
                  {step.icon}
                </div>
                <span className="lifecycle-label">{step.label}</span>
                {index < DOCUMENT_LIFECYCLE.length - 1 && (
                  <ArrowRightOutlined className="lifecycle-arrow" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>

          <div className="section-cta">
            <Link to={LINKS.documentControl} className="section-cta-link">
              Learn about document control <ArrowRightOutlined />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
           AI CAMERA MONITORING
           ============================================ */}
      <section className="ai-camera-section" id="ai-camera-monitoring">
        <div className="container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="ai-camera-visual">
                <div className="camera-frame" aria-hidden="true">
                  <div className="camera-scan-line"></div>
                  <div className="camera-detection-box box-1">
                    <span>PPE Detected ✓</span>
                  </div>
                  <div className="camera-detection-box box-2 alert">
                    <span>No Helmet ⚠</span>
                  </div>
                  <div className="camera-detection-box box-3">
                    <span>Safe Zone ✓</span>
                  </div>
                </div>
                <p className="sample-note">Illustrative example</p>
                <div className="camera-stats">
                  <div className="cam-stat">
                    <strong>24/7</strong>
                    <span>Continuous monitoring</span>
                  </div>
                  <div className="cam-stat">
                    <strong>Real-time</strong>
                    <span>Instant violation alerts</span>
                  </div>
                  <div className="cam-stat">
                    <strong>IP cameras</strong>
                    <span>Works with your existing setup</span>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="ai-camera-content">
                <span className="section-tag">AI Camera Monitoring</span>
                <h2>
                  AI Camera Monitoring for{' '}
                  <span className="gradient-text">PPE &amp; Hazard Detection</span>
                </h2>
                <p>
                  Our AI-powered camera system detects PPE compliance, unsafe behavior, and
                  hazardous conditions in real time, across every site, shift, and zone.
                </p>
                <ul className="camera-feature-list">
                  <li>
                    <CheckCircleOutlined /> Automatic PPE detection (helmets, vests, goggles, gloves)
                  </li>
                  <li>
                    <CheckCircleOutlined /> Unsafe behavior recognition &amp; instant alerts
                  </li>
                  <li>
                    <CheckCircleOutlined /> Restricted zone &amp; hazard area enforcement
                  </li>
                  <li>
                    <CheckCircleOutlined /> Fire, smoke &amp; spill detection
                  </li>
                  <li>
                    <CheckCircleOutlined /> Works with your existing IP cameras
                  </li>
                </ul>
                <NavButton to={LINKS.camera} type="primary" size="large" className="cta-button">
                  Explore AI Camera Monitoring <ArrowRightOutlined />
                </NavButton>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ============================================
           PERMIT TO WORK
           ============================================ */}
      <section className="ptw-section" id="permit-to-work">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Permit to Work</span>
            <h2 className="section-title">
              Permit to Work Software with{' '}
              <span className="gradient-text">Built-In Risk Assessment</span>
            </h2>
            <p className="section-subtitle">
              Create, approve, and manage work permits with complete audit trails and integrated
              risk assessments, for oil &amp; gas, construction, and other high-risk operations.
            </p>
          </div>

          <ol className="incident-flow">
            {PTW_STEPS.map((step, index) => (
              <React.Fragment key={step.label}>
                <li className="incident-step">
                  <div className="incident-icon">{step.icon}</div>
                  <strong>{step.label}</strong>
                  <span>{step.sub}</span>
                </li>
                {index < PTW_STEPS.length - 1 && (
                  <ArrowRightOutlined className="incident-arrow" aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </ol>

          <div className="section-cta">
            <Link to={LINKS.ptw} className="section-cta-link">
              Explore permit to work software <ArrowRightOutlined />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
           INCIDENT REPORTING
           ============================================ */}
      <section className="incident-section" id="incident-reporting">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Incident Reporting</span>
            <h2 className="section-title">
              Incident Reporting Software: From Incident to{' '}
              <span className="gradient-text">Insight</span>
            </h2>
            <p className="section-subtitle">
              Report, analyze, and resolve incidents with no paperwork, no delays, and no missed
              details
            </p>
          </div>

          <ol className="incident-flow">
            {INCIDENT_STEPS.map((step, index) => (
              <React.Fragment key={step.label}>
                <li className="incident-step">
                  <div className="incident-icon">{step.icon}</div>
                  <strong>{step.label}</strong>
                  <span>{step.sub}</span>
                </li>
                {index < INCIDENT_STEPS.length - 1 && (
                  <ArrowRightOutlined className="incident-arrow" aria-hidden="true" />
                )}
              </React.Fragment>
            ))}
          </ol>

          <div className="section-cta">
            <Link to={LINKS.incidents} className="section-cta-link">
              Explore incident reporting software <ArrowRightOutlined />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
           AT A GLANCE (static, replaces animated counters)
           ============================================ */}
      <section className="stats-section" aria-label="SafeTrack Pro at a glance">
        <div className="container">
          <Row gutter={[24, 24]}>
            {STATS.map((stat) => (
              <Col xs={12} md={6} key={stat.label}>
                <div className="stat-card">
                  <div className="stat-number-wrapper">
                    <span className="stat-number-animated">{stat.value}</span>
                  </div>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           INDUSTRIES
           ============================================ */}
      <section className="industries-section" id="industries">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Solutions</span>
            <h2 className="section-title">
              HSE Software for <span className="gradient-text">Every Industry</span>
            </h2>
            <p className="section-subtitle">
              AI-powered safety management solutions designed for diverse industrial sectors
            </p>
          </div>

          <Row gutter={[24, 24]}>
            {INDUSTRIES.map((industry) => (
              <Col xs={24} sm={12} lg={8} key={industry.slug}>
                <div className="industry-card-wrapper">
                  <Link
                    to={`/industries/${industry.slug}`}
                    className="industry-card"
                    style={{ borderTop: `4px solid ${industry.color}` }}
                  >
                    <div className="industry-image-wrapper">
                      <img
                        src={industry.image}
                        alt={`${industry.title} HSE software use case`}
                        className="industry-image"
                        width="400"
                        height="140"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div
                        className="industry-icon-overlay"
                        style={{ background: industry.gradient, color: industry.color }}
                      >
                        {React.cloneElement(industry.icon, {
                          style: { fontSize: 28, color: industry.color }
                        })}
                      </div>
                    </div>
                    <h3>{industry.title} HSE Software</h3>
                    <p className="industry-description">{industry.description}</p>
                    <div className="industry-features">
                      {industry.features.map((feat) => (
                        <span
                          key={feat}
                          className="industry-feature-tag"
                          style={{ background: `${industry.color}15`, color: industry.color }}
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                    <p className="industry-details" style={{ color: industry.color }}>
                      {industry.details}
                    </p>
                  </Link>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           COMPLIANCE FRAMEWORKS
           ============================================ */}
      <section className="compliance-section" id="compliance">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Compliance</span>
            <h2 className="section-title">
              Compliance Management Software for{' '}
              <span className="gradient-text">Every Framework</span>
            </h2>
            <p className="section-subtitle">
              Pre-built modules aligned with the standards your industry demands
            </p>
          </div>

          <Row gutter={[16, 16]}>
            {FRAMEWORKS.map((fw) => (
              <Col xs={12} sm={8} md={6} lg={4} key={fw.code}>
                <Link
                  to={fw.to}
                  className="compliance-badge"
                  style={{ borderColor: `${fw.color}40` }}
                >
                  <strong style={{ color: fw.color }}>{fw.code}</strong>
                  <span>{fw.label}</span>
                </Link>
              </Col>
            ))}
          </Row>

          <p className="compliance-note">
            &ldquo;Aligned with&rdquo; means our workflows and controls are designed around these
            standards. It does not imply certification or attestation unless stated on our{' '}
            <Link to={LINKS.trust}>Trust page</Link>.
          </p>
        </div>
      </section>

      {/* ============================================
           AI DOCUMENT GENERATOR
           ============================================ */}
      <section className="ai-doc-section" id="ai-document-generator">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">AI Document Generator</span>
            <h2 className="section-title">
              AI HSE Document Generator for{' '}
              <span className="gradient-text">OSHA-Aligned SOPs</span>
            </h2>
            <p className="section-subtitle">
              Stop wrestling with Word templates. Let our AI build your safety documentation.
            </p>
          </div>

          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={14}>
              <div className="doc-preview-container" aria-hidden="true">
                <div className="doc-preview-header">
                  <div className="doc-icon">
                    <FileTextOutlined />
                  </div>
                  <div>
                    <strong>Chemical Handling SOP</strong>
                    <span>Ref: CHE-SOP-0001 | OSHA 29 CFR 1910</span>
                  </div>
                  <Tag color="blue">PDF Generated</Tag>
                </div>
                <div className="doc-preview-body">
                  <div className="doc-line long"></div>
                  <div className="doc-line medium"></div>
                  <div className="doc-line short"></div>
                  <div className="doc-box">
                    <span>1.0 PURPOSE</span>
                    <div className="doc-line long"></div>
                  </div>
                  <div className="doc-box">
                    <span>2.0 SCOPE</span>
                    <div className="doc-line long"></div>
                  </div>
                  <div className="doc-box">
                    <span>4.0 EQUIPMENT &amp; MATERIALS</span>
                    <div className="doc-checkbox"></div> <div className="doc-line medium"></div>
                    <div className="doc-checkbox"></div> <div className="doc-line medium"></div>
                  </div>
                  <div className="doc-box">
                    <span>5.0 PROCEDURE STEPS</span>
                    <div className="doc-line long"></div>
                    <div className="doc-line long"></div>
                  </div>
                </div>
                <div className="doc-preview-footer">
                  <span>Illustrative example</span>
                  <span>Export PDF</span>
                </div>
              </div>
            </Col>
            <Col xs={24} lg={10}>
              <div className="ai-doc-content">
                <h3>Your Entire Safety Library, Automated.</h3>
                <p>
                  Whether you need a Chemical SOP, a Construction JHA, or a Healthcare Incident
                  Report, our AI generates fully formatted documents that match your
                  company&apos;s branding, with regulatory references filled in for you.
                </p>
                <ul className="ai-doc-list">
                  <li>
                    <CheckCircleOutlined /> Auto-fills OSHA, ISO, and industry-specific references
                  </li>
                  <li>
                    <CheckCircleOutlined /> Built-in rich text editor with tables, images, and
                    signatures
                  </li>
                  <li>
                    <CheckCircleOutlined /> One-click export to PDF, Word, or direct archive
                  </li>
                  <li>
                    <CheckCircleOutlined /> Includes approval workflows (Prepared by, Reviewed by,
                    Approved by)
                  </li>
                </ul>
                <NavButton to={LINKS.documents} type="primary" size="large" className="cta-button">
                  Explore the Document Generator <ArrowRightOutlined />
                </NavButton>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ============================================
           FEATURES
           ============================================ */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Capabilities</span>
            <h2 className="section-title">
              All-in-One HSE Software to{' '}
              <span className="gradient-text">Protect Your Workforce</span>
            </h2>
            <p className="section-subtitle">
              From AI camera monitoring and instant incident analysis to full document lifecycle
              control and live environmental intelligence: one platform, complete coverage.
            </p>
          </div>

          <Row gutter={[24, 24]}>
            {FEATURES.map((feature) => (
              <Col xs={24} sm={12} lg={6} key={feature.title}>
                <div className="feature-card" style={{ borderTop: `4px solid ${feature.color}` }}>
                  <div
                    className="feature-icon"
                    style={{ background: `${feature.color}25`, color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <Link to={feature.to} className="feature-link" style={{ color: feature.color }}>
                    Explore {feature.linkLabel} <ArrowRightOutlined />
                  </Link>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* ============================================
           WHY CHOOSE US
           ============================================ */}
      <section className="benefits-section">
        <div className="container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="benefits-content">
                <span className="section-tag">Why Choose Us</span>
                <h2>
                  Why Safety Teams Choose{' '}
                  <span className="gradient-text">SafeTrack Pro</span>
                </h2>
                <p className="benefits-intro">
                  Everything you need to run a safer, more organized operation, without juggling
                  separate tools for every task.
                </p>

                {BENEFITS.map((benefit) => (
                  <div className="benefit-item" key={benefit.title}>
                    <div className="benefit-icon">{benefit.icon}</div>
                    <div className="benefit-text">
                      <h3>{benefit.title}</h3>
                      <span>{benefit.description}</span>
                    </div>
                  </div>
                ))}

                <NavButton to={LINKS.features} type="primary" size="large" className="benefits-cta">
                  Explore All Features <ArrowRightOutlined />
                </NavButton>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="benefits-visual">
                <div className="floating-cards">
                  {BENEFIT_CARDS.map((card) => (
                    <Link key={card.label} to={card.to} className={`floating-card ${card.cls}`}>
                      {card.icon}
                      <span>{card.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* TODO: customer reviews section. Add real G2 reviews here (with permission) and
          link to /reviews once that page exists. Testimonials were removed on purpose. */}

      {/* ============================================
           CSP PRACTICE EXAM
           ============================================ */}
      <section className="csp-exam-section" id="csp-practice-exam">
        <div className="container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="csp-content">
                <span className="section-tag">Career Advancement</span>
                <h2>
                  CSP Practice Exam: <span className="gradient-text">Full-Length &amp; Timed</span>
                </h2>
                <p>
                  Check your readiness before exam day with our <strong>CSP-style practice
                  exam</strong>: realistic time limits and scenario-based questions that follow the
                  published Certified Safety Professional exam outline. Practice only - not the
                  official exam.
                </p>

                <div className="csp-features-grid">
                  <div className="csp-feature">
                    <CheckCircleOutlined />
                    <div>
                      <strong>100 Complex Scenario Questions</strong>
                      <span>4-hour time limit for realistic pacing</span>
                    </div>
                  </div>
                  <div className="csp-feature">
                    <CheckCircleOutlined />
                    <div>
                      <strong>Instant Scoring &amp; Analytics</strong>
                      <span>See exactly where you need to improve</span>
                    </div>
                  </div>
                  <div className="csp-feature">
                    <CheckCircleOutlined />
                    <div>
                      <strong>Certificate of Completion</strong>
                      <span>Pass the practice exam and get a certificate you can verify online</span>
                    </div>
                  </div>
                </div>

                <div className="csp-credential-levels">
                  <h3>Practice result bands:</h3>
                  <div className="levels-row">
                    <span className="level-badge platinum">🏆 Platinum (90%+)</span>
                    <span className="level-badge gold">🥇 Gold (85%+)</span>
                    <span className="level-badge silver">🥈 Silver (80%+)</span>
                    <span className="level-badge bronze">🥉 Bronze (75%+)</span>
                  </div>
                </div>

                <div className="hero-actions">
                  <NavButton to={LINKS.exam} type="primary" size="large" className="cta-button">
                    Try 10 Free Questions <ArrowRightOutlined />
                  </NavButton>
                  <Link to={LINKS.cspExam} className="section-cta-link">
                    About the CSP Practice Exam
                  </Link>
                </div>

                <p className="compliance-note csp-disclaimer">
                  Independent practice tool. CSP&reg; is a registered mark of the Board of Certified
                  Safety Professionals (BCSP). SafeTrack Pro Global is not affiliated with or endorsed
                  by BCSP, and passing does not grant the CSP credential or CEUs.
                </p>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="csp-visual">
                <div className="csp-mockup" aria-hidden="true">
                  <div className="mockup-header">
                    <SafetyCertificateOutlined /> CSP Practice Exam
                  </div>
                  <div className="mockup-body">
                    <div className="question-skeleton"></div>
                    <div className="question-skeleton short"></div>
                    <div className="option-skeleton"></div>
                    <div className="option-skeleton"></div>
                  </div>
                  <div className="mockup-footer">
                    <span>Time Remaining: 03:45:12</span>
                    <span>Question 42 of 100</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* ============================================
           PRICING
           ============================================ */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">
              HSE Software Pricing: Choose Your <span className="gradient-text">Plan</span>
            </h2>
            <p className="section-subtitle">
              Flexible plans for every organization&apos;s safety management needs
            </p>
          </div>

          <Row gutter={[24, 24]} justify="center">
            {pricingPlans.map((plan) => (
              <Col xs={24} md={12} lg={8} key={plan.id}>
                <div className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                  {plan.popular && (
                    <div className="popular-badge">
                      <span>★ Most Popular</span>
                    </div>
                  )}
                  <div className="pricing-header">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-price">
                      <span className="price-amount">{plan.price}</span>
                      <span className="price-period">{plan.period}</span>
                    </div>
                    <p className="plan-description">{plan.description}</p>
                  </div>
                  <div className="pricing-features">
                    {plan.features.slice(0, 7).map((feature) => (
                      <div key={feature} className="pricing-feature">
                        <CheckCircleOutlined className="feature-check" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <NavButton
                    to={plan.link}
                    type={plan.popular ? 'primary' : 'default'}
                    size="large"
                    block
                    className={`pricing-cta ${plan.popular ? 'cta-primary' : ''}`}
                  >
                    {plan.buttonText}
                  </NavButton>
                </div>
              </Col>
            ))}
          </Row>

          <div className="section-cta">
            <Link to={LINKS.pricing} className="section-cta-link">
              Compare all plans and features <ArrowRightOutlined />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
           FAQ  (native <details>: content stays in the HTML for crawlers)
           ============================================ */}
      <section className="faq-section" id="faq">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">
              HSE Software <span className="gradient-text">Frequently Asked Questions</span>
            </h2>
          </div>

          <div className="faq-list">
            {FAQS.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
           CTA
           ============================================ */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <span className="cta-tag">Get Started</span>
              <h2>
                Ready to Transform Your <span className="gradient-text">Safety Management</span>?
              </h2>
              <p className="cta-description">
                Built for organizations across 9 industries: AI camera monitoring, instant incident
                analysis, complete document lifecycle control, and live environmental intelligence
                in one platform.
              </p>
              <div className="cta-actions">
                <NavButton to={LINKS.signup} type="primary" size="large" className="cta-primary-btn">
                  Start Free Trial <ArrowRightOutlined />
                </NavButton>
                <NavButton to={LINKS.demo} size="large" className="cta-secondary-btn">
                  Book a Demo
                </NavButton>
              </div>
              <div className="cta-trust">
                <span>✓ Security aligned with ISO 27001</span>
                <span>✓ Security aligned with SOC 2</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
