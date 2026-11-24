/**
 * Single source of truth for every marketing page that HomePage.jsx links to.
 * Pure JS (no JSX) so the sitemap script can import it too.
 *
 * Content rules used here:
 *  - Only claims that already appear on the homepage / live site.
 *  - "Aligned with" wording for standards (never "certified" or "compliant").
 *  - No performance numbers, customer counts or accuracy figures.
 * Edit text freely; the page templates render whatever is here.
 */

export const SITE_URL = 'https://www.safetrackproglobal.com';
export const BRAND = 'SafeTrack Pro Global';
export const CONTACT = {
  email: 'info@safetrackproglobal.com',
  phone: '+974 3325 1705',
  location: 'Doha, Qatar'
};


/* ============================================================
   SOLUTION PAGES   ->  /<slug>
   ============================================================ */
export const SOLUTIONS = [
  {
    slug: 'hse-project-management-software',
    name: 'HSE Project Management',
    summary: 'One command center for KPIs, workforce, training, safety analytics, and compliance.',
    title: 'HSE Project Management Software | SafeTrack Pro Global',
    description:
      'Run your whole HSE operation in one command center: KPIs, manpower, training, LTI trends, observations, accidents, and overdue compliance tracking.',
    h1: 'HSE Project Management Software for Your Whole Operation',
    lead:
      'SafeTrack Pro Global replaces scattered spreadsheets, WhatsApp groups, and disconnected tools with a single platform. Every part of your HSE operation is tracked, measured, and visualized in real time.',
    benefits: [
      {
        title: 'One live view',
        text: 'See every HSE metric across all sites, departments, and projects in a single dashboard that updates in real time.'
      },
      {
        title: 'Workforce and training in sync',
        text: 'Connect manpower deployment, personnel records, and training compliance so nobody steps on site unprepared.'
      },
      {
        title: 'Safety data that drives action',
        text: 'Track LTI trends, man-hours, observations, accidents, and injuries, then act on overdue items before they become audit findings.'
      }
    ],
    capabilities: [
      'Overview Dashboard across all sites, departments, and projects',
      'KPI cards for TRIR, LTIFR, compliance rate, training coverage, and incident frequency',
      'Manpower Distribution and Workforce Management',
      'Training & Competency tracking with expiry alerts',
      'LTI Trend and Man-Hours Analysis (TRIR, LTIFR, DART)',
      'Observations, Accidents, and Injuries with case management',
      'OSHA 300 log generation',
      'Overdue & Expiry Tracking for permits, licenses, inspections, and corrective actions'
    ],
    industries: ['construction', 'oil-and-gas', 'manufacturing', 'mining'],
    related: [
      'hse-dashboard-software',
      'workforce-management-software',
      'hse-analytics-software',
      'compliance-management-software'
    ],
    faqs: [
      {
        q: 'What is HSE project management software?',
        a: 'HSE project management software brings your health, safety, and environment activities into one platform: workforce, training, incidents, observations, KPIs, and compliance deadlines, so teams manage them together instead of in separate spreadsheets and chat groups.'
      },
      {
        q: 'Can SafeTrack Pro replace our spreadsheets?',
        a: 'SafeTrack Pro is designed to replace scattered spreadsheets, WhatsApp groups, and disconnected tools with a single platform for tracking manpower, training, injuries, accidents, and overdue actions.'
      }
    ]
  },
  {
    slug: 'ai-camera-monitoring',
    name: 'AI Camera Monitoring',
    summary: 'Real-time PPE, unsafe behavior, and hazard detection on your existing IP cameras.',
    title: 'AI Camera PPE Monitoring Software | SafeTrack Pro Global',
    description:
      'AI camera monitoring that detects missing PPE, unsafe behavior, and hazards in real time, with instant alerts on your existing IP cameras.',
    h1: 'AI Camera Monitoring for PPE and Hazard Detection',
    lead:
      'Our AI-powered camera system detects PPE compliance, unsafe behavior, and hazardous conditions in real time, across every site, shift, and zone.',
    benefits: [
      {
        title: 'More eyes between inspections',
        text: 'Monitoring runs while a camera session is on, adding to your inspections. It does not replace them, and it can miss hazards.'
      },
      {
        title: 'Instant alerts',
        text: 'Detected issues raise alerts for a trained person to check and act on.'
      },
      {
        title: 'Use the cameras you have',
        text: 'AI camera monitoring works with your existing IP cameras, so there is no need to replace your current setup.'
      }
    ],
    capabilities: [
      'Automatic PPE detection (helmets, vests, goggles, gloves)',
      'Unsafe behavior recognition and instant alerts',
      'Restricted zone and hazard area enforcement',
      'Fire, smoke, and spill detection',
      'Works with your existing IP cameras',
      'Results and history for review by your team'
    ],
    industries: ['construction', 'manufacturing', 'oil-and-gas', 'mining'],
    related: ['incident-reporting-software', 'ai-risk-assessment-software', 'hse-dashboard-software'],
    faqs: [
      {
        q: 'Does AI camera monitoring work with existing cameras?',
        a: 'Yes. It works with your existing IP cameras to detect PPE compliance, unsafe behavior, and hazards, and sends instant alerts to your team.'
      },
      {
        q: 'What can the AI detect?',
        a: 'It detects PPE such as helmets, vests, goggles, and gloves, unsafe behavior, entry into restricted zones and hazard areas, and fire, smoke, and spills.'
      }
    ]
  },
  {
    slug: 'incident-reporting-software',
    name: 'Incident Reporting',
    summary: 'Report from any device, classify severity with AI, and track actions to closure.',
    title: 'Incident Reporting Software | SafeTrack Pro Global',
    description:
      'Report incidents from any device with photo capture, AI severity scoring, witness tracking, and instant manager alerts. Track actions to closure.',
    h1: 'Incident Reporting Software: From Incident to Insight',
    lead:
      'Report, analyze, and resolve incidents with no paperwork, no delays, and no missed details.',
    benefits: [
      {
        title: 'Report from any device',
        text: 'Workers can report incidents from a phone or computer, with photos captured at the scene.'
      },
      {
        title: 'AI-assisted classification',
        text: 'AI scores severity and categorizes each report, then notifies managers and responders immediately.'
      },
      {
        title: 'Closed-loop follow-up',
        text: 'Corrective actions are tracked through to closure, and reports are generated automatically.'
      }
    ],
    capabilities: [
      'Mobile reporting from any device with auto-capture',
      'AI severity scoring and categorization',
      'Witness tracking',
      'Immediate manager and responder notification',
      'Auto-generated incident reports',
      'Corrective action tracking to closure',
      'Accident logging with photos, witnesses, and root cause analysis',
      'Injury case management with OSHA 300 log generation',
      'Behavior-based safety observations'
    ],
    steps: [
      { title: 'Report', text: 'From any device' },
      { title: 'AI Classify', text: 'Severity and category' },
      { title: 'Notify', text: 'Managers and responders' },
      { title: 'Document', text: 'Auto-generated report' },
      { title: 'Resolve', text: 'Track to closure' },
      { title: 'Learn', text: 'Trends and prevention' }
    ],
    industries: ['healthcare', 'construction', 'education', 'manufacturing'],
    related: ['ai-camera-monitoring', 'hse-analytics-software', 'permit-to-work-software'],
    faqs: [
      {
        q: 'Can workers report incidents from a phone?',
        a: 'Yes. Incidents can be reported from any device, with photos captured as part of the report.'
      },
      {
        q: 'Does it generate investigation reports?',
        a: 'Yes. Reports are generated automatically, and accident records support photos, witnesses, and root cause analysis.'
      }
    ]
  },
  {
    slug: 'permit-to-work-software',
    name: 'Permit to Work',
    summary: 'Create, approve, and manage work permits with audit trails and integrated risk assessments.',
    title: 'Permit to Work Software | SafeTrack Pro Global',
    description:
      'Permit to work software to create, approve, and manage work permits with integrated risk assessments and complete audit trails.',
    h1: 'Permit to Work Software with Built-In Risk Assessment',
    lead:
      'Create, approve, and manage work permits with complete audit trails and integrated risk assessments, for oil and gas, construction, and other high-risk operations.',
    benefits: [
      {
        title: 'Risk assessed before work starts',
        text: 'Risk assessments are integrated into the permit, so hazards are reviewed as part of the request.'
      },
      {
        title: 'Clear approvals',
        text: 'Permits move through an approval workflow, so everyone knows who authorized the work.'
      },
      {
        title: 'Full audit trail',
        text: 'Every permit keeps a complete record from request to close-out, ready for audits.'
      }
    ],
    capabilities: [
      'Create and manage work permits',
      'Approval workflows',
      'Integrated risk assessments',
      'Complete audit trails',
      'Expiry tracking so permits do not lapse unnoticed'
    ],
    steps: [
      { title: 'Request', text: 'Create the work permit' },
      { title: 'Assess Risk', text: 'Integrated risk assessment' },
      { title: 'Approve', text: 'Approval workflow' },
      { title: 'Close Out', text: 'Full audit trail' }
    ],
    industries: ['oil-and-gas', 'construction', 'mining', 'chemical'],
    related: ['ai-risk-assessment-software', 'incident-reporting-software', 'compliance-management-software'],
    faqs: [
      {
        q: 'What is a permit to work system?',
        a: 'A permit to work (PTW) system is a formal process for authorizing and controlling high-risk work, such as maintenance in hazardous areas. It makes sure risks are assessed and precautions are agreed before work begins.'
      },
      {
        q: 'Which industries use permit to work?',
        a: 'PTW is widely used in oil and gas, construction, mining, chemical, and manufacturing, wherever work can expose people to serious hazards.'
      }
    ]
  },
  {
    slug: 'ai-hse-document-generator',
    name: 'AI Document Generator',
    summary: 'Generate formatted SOPs, JHAs, and reports with regulatory references filled in.',
    title: 'AI HSE Document Generator (SOPs, JHAs) | SafeTrack Pro',
    description:
      'Generate formatted HSE documents such as SOPs, JHAs, and incident reports with OSHA and ISO references, approval workflows, and PDF or Word export.',
    h1: 'AI HSE Document Generator for OSHA-Aligned SOPs',
    lead:
      'Whether you need a Chemical SOP, a Construction JHA, or a Healthcare Incident Report, our AI generates fully formatted documents that match your company branding, with regulatory references filled in.',
    benefits: [
      {
        title: 'Start from a full draft',
        text: 'Skip the blank Word template. The generator builds a structured document you can edit and approve.'
      },
      {
        title: 'References filled in',
        text: 'OSHA, ISO, and industry-specific references are filled in automatically.'
      },
      {
        title: 'Approval built in',
        text: 'Documents include Prepared by, Reviewed by, and Approved by workflows.'
      }
    ],
    capabilities: [
      'SOPs, job hazard analyses (JHAs), and incident reports',
      'Auto-filled OSHA, ISO, and industry-specific references',
      'Built-in rich text editor with tables, images, and signatures',
      'One-click export to PDF or Word, or direct archive',
      'Approval workflows (Prepared by, Reviewed by, Approved by)',
      'Formatting that matches your company branding'
    ],
    industries: ['chemical', 'construction', 'healthcare', 'manufacturing'],
    related: ['document-control-software', 'ai-risk-assessment-software', 'compliance-management-software'],
    faqs: [
      {
        q: 'What types of documents can it generate?',
        a: 'Common examples include SOPs, job hazard analyses (JHAs), and incident reports for industries such as chemical, construction, and healthcare.'
      },
      {
        q: 'Are AI-generated documents ready to use as is?',
        a: 'Treat them as a strong first draft. AI-generated safety documents should be reviewed and approved by a qualified safety professional before use.'
      }
    ]
  },
  {
    slug: 'document-control-software',
    name: 'Document Control',
    summary: 'Create, sign, version, and archive every safety document with a full audit trail.',
    title: 'HSE Document Control Software | SafeTrack Pro Global',
    description:
      'Control the complete HSE document lifecycle: auto-create, modify, submit, digitally sign, download, and archive with version control and audit trails.',
    h1: 'Document Control Software: Complete Lifecycle in One Flow',
    lead:
      'From creation to archive, every safety document is automated, traceable, and audit-ready.',
    benefits: [
      {
        title: 'One flow, six stages',
        text: 'Auto-create, modify, submit, sign, download, and archive without leaving the platform.'
      },
      {
        title: 'Always the right version',
        text: 'Version control and AI classification keep documents organized and current.'
      },
      {
        title: 'Audit-ready records',
        text: 'Expiry tracking and a full audit trail show who changed and approved what, and when.'
      }
    ],
    capabilities: [
      'Auto-create, modify, submit, digitally sign, download, and archive',
      'AI classification of documents',
      'Version control',
      'Expiry tracking',
      'Full compliance audit trails',
      'Approval workflows'
    ],
    steps: [
      { title: 'Auto-Create', text: '' },
      { title: 'Modify', text: '' },
      { title: 'Submit', text: '' },
      { title: 'Sign', text: '' },
      { title: 'Download', text: '' },
      { title: 'Archive', text: '' }
    ],
    industries: ['healthcare', 'maritime', 'aviation', 'manufacturing'],
    related: ['ai-hse-document-generator', 'compliance-management-software', 'permit-to-work-software'],
    faqs: [
      {
        q: 'What is document control in HSE?',
        a: 'Document control is how an organization creates, reviews, approves, distributes, and archives its safety documents so that people always work from the current, approved version.'
      },
      {
        q: 'Can documents be signed digitally?',
        a: 'Yes. Documents can be digitally signed as part of the lifecycle, and every step is recorded in the audit trail.'
      }
    ]
  },
  {
    slug: 'environmental-monitoring-software',
    name: 'Environmental Monitoring',
    summary: 'Track air, water, emissions, biodiversity, and carbon with AI predictions and ESG reporting.',
    title: 'Environmental Monitoring & ESG Software | SafeTrack Pro',
    description:
      'Track air quality, water quality, emissions, biodiversity, and carbon footprint in real time with AI predictions, ESG reporting, and regulatory alerts.',
    h1: 'Environmental Monitoring Software with ESG Reporting',
    lead:
      'Track air quality, water quality, emissions, biodiversity, and carbon footprint in real time, with AI predictions, ESG reporting, and instant regulatory alerts.',
    benefits: [
      {
        title: 'Live environmental data',
        text: 'Follow air, water, emissions and carbon records as your team enters or connects them, with area weather and air quality.'
      },
      {
        title: 'Predictions, not just readings',
        text: 'AI predictions help you spot environmental issues early.'
      },
      {
        title: 'ESG reporting',
        text: 'Automated ESG reporting turns environmental data into reports for stakeholders and regulators.'
      }
    ],
    capabilities: [
      'Air quality and water quality monitoring',
      'Emissions tracking',
      'Biodiversity and carbon footprint tracking',
      'Environmental health and sustainability index',
      'Readings you enter, import or connect',
      'AI predictions',
      'Automated ESG reporting',
      'Instant regulatory alerts'
    ],
    industries: ['oil-and-gas', 'mining', 'chemical', 'manufacturing'],
    related: ['compliance-management-software', 'hse-analytics-software', 'hse-dashboard-software'],
    faqs: [
      {
        q: 'What does environmental monitoring track?',
        a: 'SafeTrack Pro tracks air quality, water quality, emissions, biodiversity, and carbon footprint.'
      },
      {
        q: 'Does it support ESG reporting?',
        a: 'Yes. It includes automated ESG reporting based on your environmental data.'
      }
    ]
  },
  {
    slug: 'compliance-management-software',
    name: 'Compliance Management',
    summary: 'Track regulatory requirements, deadlines, and expiries with real-time alerts.',
    title: 'HSE Compliance Management Software | SafeTrack Pro Global',
    description:
      'HSE compliance management software with automated regulatory tracking, real-time alerts, and one-click reporting aligned with OSHA, ISO 45001, and more.',
    h1: 'Compliance Management Software for Every Framework',
    lead:
      'Automated regulatory tracking, real-time alerts, and one-click reporting, with pre-built modules aligned with the standards your industry demands.',
    benefits: [
      {
        title: 'Never miss a deadline',
        text: 'Track every expiring permit, license, inspection, and corrective action, with alerts days or weeks in advance.'
      },
      {
        title: 'Aligned with your standards',
        text: 'Modules are aligned with OSHA, ISO 45001, ISO 14001, HIPAA, MLC 2006, ICAO SMS, MSHA, REACH, TSCA, and GDPR.'
      },
      {
        title: 'Reports on demand',
        text: 'One-click reporting helps you pull records quickly when auditors ask.'
      }
    ],
    capabilities: [
      'Automated regulatory tracking',
      'Real-time compliance alerts',
      'One-click reporting',
      'Overdue and expiry tracking for permits, licenses, inspections, and corrective actions',
      'Certification and training expiry alerts',
      'Audit trails across every module'
    ],
    showFrameworks: true,
    industries: ['healthcare', 'maritime', 'aviation', 'chemical'],
    related: ['document-control-software', 'workforce-management-software', 'hse-project-management-software'],
    faqs: [
      {
        q: 'Which standards and frameworks does SafeTrack Pro align with?',
        a: 'Workflows are aligned with OSHA, ISO 45001, ISO 14001, HIPAA, MLC 2006, ICAO SMS, MSHA, REACH, TSCA, and GDPR. Alignment does not imply certification or attestation unless stated on our Trust page.'
      },
      {
        q: 'Does the software make us compliant?',
        a: 'Software supports compliance but does not replace your own processes and professional judgment. SafeTrack Pro helps you track requirements, deadlines, and records so you can demonstrate compliance.'
      }
    ]
  },
  {
    slug: 'ai-risk-assessment-software',
    name: 'AI Risk Assessment',
    summary: 'Predictive analytics that help identify hazards before they become incidents.',
    title: 'AI Risk Assessment Software | SafeTrack Pro Global',
    description:
      'AI risk assessment software with predictive analytics that help identify hazards before they become incidents, integrated with permit to work.',
    h1: 'AI Risk Assessment Software for Safer Operations',
    lead:
      'Predictive analytics that help identify hazards before they become incidents.',
    benefits: [
      {
        title: 'Look ahead, not back',
        text: 'Predictive analytics help you spot hazards early instead of reacting after an incident.'
      },
      {
        title: 'Built into permits',
        text: 'Risk assessments are integrated into the permit to work process.'
      },
      {
        title: 'Documented consistently',
        text: 'Generate risk assessment documents such as JHAs with the AI document generator.'
      }
    ],
    capabilities: [
      'Predictive hazard identification',
      'Risk assessments integrated with permit to work',
      'JHAs and risk documents through the AI document generator',
      'Incident data to inform risk reviews'
    ],
    industries: ['oil-and-gas', 'manufacturing', 'chemical', 'construction'],
    related: ['permit-to-work-software', 'ai-hse-document-generator', 'hse-analytics-software'],
    faqs: [
      {
        q: 'What is AI risk assessment?',
        a: 'AI risk assessment uses predictive analytics on your safety data to help highlight hazards before they lead to incidents. It supports, but does not replace, assessments carried out by competent people.'
      },
      {
        q: 'How does it connect to permit to work?',
        a: 'Risk assessments are integrated into the permit to work process, so hazards are reviewed as part of each permit request.'
      }
    ]
  },
  {
    slug: 'hse-dashboard-software',
    name: 'Safety Dashboard',
    summary: 'Live KPIs, incident heatmaps, and compliance status, configurable for any role.',
    title: 'Real-Time HSE Dashboard Software | SafeTrack Pro Global',
    description:
      'Real-time HSE dashboards with live KPIs, incident heatmaps, and compliance status, configurable for any industry and any role.',
    h1: 'Real-Time HSE Dashboard Software',
    lead:
      'Live KPIs, incident heatmaps, and compliance status, configurable for any industry and any role.',
    benefits: [
      {
        title: 'Live KPIs',
        text: 'Configurable KPI cards for TRIR, LTIFR, compliance rate, training coverage, and incident frequency.'
      },
      {
        title: 'See where incidents cluster',
        text: 'Incident heatmaps show where problems concentrate across your sites.'
      },
      {
        title: 'Right view for each role',
        text: 'Configure dashboards for executives, site managers, and safety officers.'
      }
    ],
    capabilities: [
      'Live KPIs and KPI cards',
      'Incident heatmaps',
      'Compliance status at a glance',
      'Configurable for any industry and any role',
      'Single overview across sites, departments, and projects'
    ],
    industries: ['construction', 'manufacturing', 'oil-and-gas', 'education'],
    related: ['hse-analytics-software', 'hse-project-management-software', 'compliance-management-software'],
    faqs: [
      {
        q: 'Which KPIs can the dashboard show?',
        a: 'KPI cards cover TRIR, LTIFR, compliance rate, training coverage, and incident frequency, and are configurable.'
      },
      {
        q: 'Can different roles see different dashboards?',
        a: 'Yes. Dashboards are configurable for any industry and any role.'
      }
    ]
  },
  {
    slug: 'hse-analytics-software',
    name: 'Advanced Analytics',
    summary: 'Trend analysis, predictive modeling, and custom reporting for safety data.',
    title: 'HSE Analytics & Reporting Software | SafeTrack Pro Global',
    description:
      'HSE analytics software with trend analysis, predictive modeling, LTI trends, TRIR and LTIFR calculation, and custom reporting for your safety data.',
    h1: 'HSE Analytics Software That Turns Safety Data into Decisions',
    lead:
      'Trend analysis, predictive modeling, and custom reporting that turn safety data into decisions.',
    benefits: [
      {
        title: 'Spot patterns',
        text: 'View Lost Time Injury trends over weeks, months, and quarters to find patterns and forecast risk.'
      },
      {
        title: 'Rates without spreadsheets',
        text: 'Track exposure hours and compute TRIR, LTIFR, and DART rates without manual calculation.'
      },
      {
        title: 'Reports your way',
        text: 'Build custom reports for monthly and annual HSE reporting and for regulators.'
      }
    ],
    capabilities: [
      'Trend analysis',
      'Predictive modeling',
      'Custom reporting',
      'LTI Trend over weeks, months, and quarters',
      'Man-Hours Analysis with TRIR, LTIFR, and DART rates'
    ],
    industries: ['manufacturing', 'aviation', 'oil-and-gas', 'construction'],
    related: ['hse-dashboard-software', 'incident-reporting-software', 'ai-risk-assessment-software'],
    faqs: [
      {
        q: 'Can I calculate TRIR and LTIFR automatically?',
        a: 'Yes. Man-Hours Analysis tracks exposure hours and computes TRIR, LTIFR, and DART rates without manual spreadsheets.'
      },
      {
        q: 'Does it support custom reports?',
        a: 'Yes. Custom reporting lets you build the views you need for internal reviews and regulators.'
      }
    ]
  },
  {
    slug: 'workforce-management-software',
    name: 'Workforce & Training',
    summary: 'Personnel records, certifications, training, and role-based collaboration across sites.',
    title: 'HSE Workforce & Training Management | SafeTrack Pro Global',
    description:
      'Manage manpower, personnel records, certifications, inductions, and training compliance with expiry alerts and role-based access across sites.',
    h1: 'Workforce and Training Management Software for HSE Teams',
    lead:
      'Know exactly who is on site, where they are deployed, and whether they are trained, certified, and compliant before they start work.',
    benefits: [
      {
        title: 'Know your headcount',
        text: 'See how your workforce is allocated across sections, shifts, and disciplines, including contractor vs. staff ratios.'
      },
      {
        title: 'Expiry dates in view',
        text: 'Automatic expiry alerts for certifications, medicals, and training keep records current.'
      },
      {
        title: 'Collaboration by role',
        text: 'Role-based access across departments, shifts, and sites, with real-time task assignment and tracking.'
      }
    ],
    capabilities: [
      'Manpower Distribution with real-time headcount',
      'Full personnel records: certifications, medicals, inductions, and site access',
      'Contractor onboarding workflows',
      'Training & Competency: mandatory training, assessments, toolbox talks, refresher cycles',
      'Automatic expiry alerts',
      'Role-based access and real-time task assignment'
    ],
    industries: ['construction', 'maritime', 'healthcare', 'mining'],
    related: ['hse-project-management-software', 'compliance-management-software', 'incident-reporting-software'],
    faqs: [
      {
        q: 'Can I track training and certification expiry?',
        a: 'Yes. Training & Competency tracks mandatory training, competency assessments, toolbox talks, and refresher cycles, with automatic alerts before certifications expire.'
      },
      {
        q: 'Does it support contractors?',
        a: 'Yes. Workforce Management includes contractor onboarding workflows and contractor vs. staff ratios in manpower views.'
      }
    ]
  },
  {
    slug: 'toolbox-talk-generator',
    name: 'AI Toolbox Talk Generator',
    summary: 'A new toolbox talk every day, written from your own incidents, near misses, permits and weather.',
    title: 'AI Toolbox Talk Generator - Daily Safety Talks | SafeTrack Pro',
    description:
      'Generate a daily toolbox talk in seconds from your incidents, near misses, open actions, permits and local weather, or type any topic. Deliver, sign off and track every talk.',
    h1: 'AI Toolbox Talk Generator for Daily Safety Talks',
    lead:
      'Stop reading the same generic talk. Every morning SafeTrack writes a toolbox talk about what is actually happening on your site: last week’s near misses, open corrective actions, today’s permits and the weather forecast.',
    benefits: [
      { title: 'Relevant every day', text: 'Talks are built from your own records and today’s weather, so crews hear about real risks on their site.' },
      { title: 'Any topic in seconds', text: 'Type a topic such as working at height or heat stress and get a ready-to-deliver talk with key points and questions.' },
      { title: 'Proof of delivery', text: 'Record who attended and when, and keep a history of every talk for audits.' }
    ],
    capabilities: [
      'Automatic daily talk from incidents, near misses, observations, CAPA and permits',
      'Weather-aware topics (heat, rain, wind, lightning)',
      'Custom topic box for any subject',
      'Key points, discussion questions and a short quiz',
      'Delivery sign-off and talk history',
      'Personal details removed from incident text before it is used'
    ],
    industries: ['construction', 'oil-and-gas', 'mining', 'manufacturing'],
    related: ['incident-reporting-software', 'anonymous-safety-reporting', 'permit-to-work-software'],
    cta: { label: 'Generate today’s toolbox talk', to: '/toolbox-talks' },
    faqs: [
      { q: 'Where does the talk content come from?', a: 'From your company’s recent incidents, near misses, observations, open corrective actions, active permits and the local weather, or from the topic you type.' },
      { q: 'Should a supervisor review the talk?', a: 'Yes. Treat the talk as a strong draft and adapt it to your site before delivering it.' }
    ]
  },
  {
    slug: 'anonymous-safety-reporting',
    name: 'Workplace Voice - Anonymous Reporting',
    summary: 'Workers report hazards by QR code or web, anonymously, by voice, photo or text, in their own language.',
    title: 'Anonymous Safety Reporting App with QR Codes | SafeTrack Pro',
    description:
      'Let every worker report hazards, near misses and concerns anonymously by QR code or website, with voice, photo or video in 11 languages. Smart routing, tracking codes and Safety Impact rewards.',
    h1: 'Anonymous Safety Reporting for Every Worker',
    lead:
      'Workplace Voice gives every worker a safe way to speak up. They scan a QR code or open your company page, choose how much to share about themselves, and report in their own language - no login, no app to install.',
    benefits: [
      { title: 'People actually report', text: 'Anonymous, protected or named reporting, voice notes for workers who prefer not to type, and 11 languages.' },
      { title: 'The right person sees it', text: 'Admins route reports by type and project to the responsible supervisor or HSE lead.' },
      { title: 'Workers see action', text: 'Every report gets a tracking code. Workers can follow "You spoke, we acted" updates and earn Safety Impact points.' }
    ],
    capabilities: [
      'QR code posters and a public company page on your own domain',
      'Voice, photo, video and text reports without login',
      'Anonymous, protected-identity or named reporting',
      'AI translation, summary and risk rating',
      'Routing per project and report type',
      'Tracking codes, two-way replies and Safety Impact rewards',
      'Repeat-report detection and abuse protection'
    ],
    industries: ['construction', 'mining', 'oil-and-gas', 'manufacturing'],
    related: ['incident-reporting-software', 'toolbox-talk-generator', 'compliance-management-software'],
    cta: { label: 'Find your company', to: '/voice' },
    faqs: [
      { q: 'Can the company see who reported?', a: 'Not for anonymous reports - no identity is collected. With protected identity, only SafeTrack holds the name and the company sees the report without it.' },
      { q: 'Do workers need an account?', a: 'No. Workers scan the QR code or open the company page and report straight away.' }
    ]
  },
  {
    slug: 'csp-practice-exam',
    name: 'CSP Practice Exam',
    summary: 'A full-length CSP-style practice exam: 100 scenario questions, 4 hours, instant explanations.',
    title: 'CSP Practice Exam (100 Questions, 4 Hours) | SafeTrack Pro',
    description:
      'Prepare for the Certified Safety Professional exam with a full-length CSP-style practice test: 100 scenario questions, a 4-hour timer, instant scoring and explanations. Practice only.',
    h1: 'CSP Practice Exam: Full-Length, Timed Practice',
    lead:
      'Check your readiness before exam day with a CSP-style practice test. Questions follow the publicly published CSP exam outline and every answer comes with an explanation. This is practice: it is not the official CSP exam.',
    benefits: [
      { title: 'Realistic pacing', text: '100 scenario questions with a 4-hour timer, so you can practise managing your time.' },
      { title: 'Know where to improve', text: 'Instant scoring by domain shows which topics need more study.' },
      { title: 'Certificate of completion', text: 'Pass the practice exam and get a certificate of completion you can verify online.' }
    ],
    capabilities: [
      '100 scenario-based practice questions',
      '4-hour timer',
      'Instant scoring with an explanation for every answer',
      'Practice result bands: Platinum (90%+), Gold (85%+), Silver (80%+), Bronze (75%+), Pass (70%+)',
      'Certificate of completion with online verification',
      'Not the official exam: no CSP credential and no CEUs'
    ],
    industries: [],
    related: ['hse-project-management-software', 'workforce-management-software'],
    note:
      'Independent practice tool. CSP® is a registered mark of the Board of Certified Safety Professionals (BCSP). SafeTrack Pro Global is not affiliated with or endorsed by BCSP. Passing this practice exam does not grant the CSP credential, a licence or continuing education units (CEUs).',
    cta: { label: 'Try 10 free questions', to: '/csp-practice-exam/free-test' },
    faqs: [
      { q: 'Is this the official CSP exam?', a: 'No. It is an independent practice exam. To earn the CSP credential you must meet BCSP’s requirements and pass the official exam through BCSP.' },
      { q: 'Does it award CEUs or a certification?', a: 'No. It gives a certificate of completion for the practice exam only. It does not award CEUs, recertification points or any professional credential.' },
      { q: 'How long is the practice exam?', a: '100 scenario-based questions with a 4-hour time limit.' }
    ]
  }
];

/* ============================================================
   INDUSTRY PAGES   ->  /industries/<slug>
   ============================================================ */
export const INDUSTRIES = [
  {
    slug: 'healthcare',
    name: 'Healthcare',
    title: 'Healthcare HSE Software | SafeTrack Pro Global',
    description:
      'Healthcare HSE software for patient safety, infection control, device compliance, and staff safety. Templates covering HIPAA and Joint Commission topics.',
    lead:
      'Patient safety, infection control, medical equipment compliance, and healthcare workforce protection across hospitals, clinics, and care facilities.',
    tags: ['Patient Safety', 'Infection Control', 'Device Compliance', 'Staff Safety'],
    highlights: [
      'Templates covering HIPAA and Joint Commission topics',
      'Patient safety events and actions',
      'Medication tracking',
      'Clinical incident reporting'
    ],
    modules: [
      'incident-reporting-software',
      'document-control-software',
      'workforce-management-software',
      'compliance-management-software'
    ],
    compliance: ['hipaa']
  },
  {
    slug: 'oil-and-gas',
    name: 'Oil & Gas',
    title: 'Oil & Gas HSE Software | SafeTrack Pro Global',
    description:
      'Oil & gas HSE software for process safety, HAZOP studies, permit to work, and emergency response. Aligned with OSHA 1910.119 PSM.',
    lead:
      'End-to-end process safety management for upstream, midstream, and downstream operations, from HAZOP studies to permit-to-work and emergency response.',
    tags: ['Process Safety', 'HAZOP Studies', 'Permit-to-Work', 'Emergency Response'],
    highlights: [
      'Aligned with OSHA 1910.119 PSM',
      'Gas test records on permits',
      'Fire and gas risk registers',
      'Offshore & onshore coverage'
    ],
    modules: [
      'permit-to-work-software',
      'ai-risk-assessment-software',
      'ai-camera-monitoring',
      'environmental-monitoring-software'
    ],
    compliance: ['osha']
  },
  {
    slug: 'construction',
    name: 'Construction',
    title: 'Construction HSE Software | SafeTrack Pro Global',
    description:
      'Construction HSE software for site safety, fall protection, equipment inspections, and contractor management. Aligned with OSHA 1926.',
    lead:
      'Site safety management for high-rise, infrastructure, and civil projects with fall protection, equipment inspections, and contractor compliance tracking.',
    tags: ['Site Safety', 'Fall Protection', 'Equipment Inspections', 'Contractor Management'],
    highlights: [
      'Aligned with OSHA 1926',
      'Multi-site coordination',
      'Permit-to-work systems',
      'Daily safety audits',
      'Toolbox talks'
    ],
    modules: [
      'permit-to-work-software',
      'ai-camera-monitoring',
      'incident-reporting-software',
      'workforce-management-software'
    ],
    compliance: ['osha']
  },
  {
    slug: 'manufacturing',
    name: 'Manufacturing',
    title: 'Manufacturing HSE Software | SafeTrack Pro Global',
    description:
      'Manufacturing HSE software for machine safety, ergonomics, chemical handling, and industrial hygiene. Aligned with ISO 45001.',
    lead:
      'Machine safety, ergonomic risk assessments, chemical handling procedures, and industrial hygiene monitoring for factories and production facilities.',
    tags: ['Machine Safety', 'Ergonomics', 'Chemical Handling', 'Industrial Hygiene'],
    highlights: [
      'Aligned with ISO 45001',
      'Lockout/tagout systems',
      'Machine guarding',
      'Noise & vibration monitoring'
    ],
    modules: [
      'ai-risk-assessment-software',
      'ai-camera-monitoring',
      'incident-reporting-software',
      'document-control-software'
    ],
    compliance: ['iso-45001']
  },
  {
    slug: 'maritime',
    name: 'Maritime',
    title: 'Maritime HSE Software | SafeTrack Pro Global',
    description:
      'Maritime HSE software for vessel safety, crew management, navigation safety, and ISM compliance. Aligned with MLC 2006.',
    lead:
      'Vessel safety, crew welfare management, ISM Code compliance, and navigation safety for shipping, ports, and offshore marine operations.',
    tags: ['Vessel Safety', 'Crew Management', 'Navigation Safety', 'ISM Compliance'],
    highlights: [
      'Aligned with MLC 2006',
      'STCW training records',
      'Crew welfare tracking',
      'Emergency drills'
    ],
    modules: [
      'workforce-management-software',
      'compliance-management-software',
      'incident-reporting-software',
      'document-control-software'
    ],
    compliance: []
  },
  {
    slug: 'aviation',
    name: 'Aviation',
    title: 'Aviation HSE & SMS Software | SafeTrack Pro Global',
    description:
      'Aviation HSE software for flight safety, ground operations, maintenance tracking, and regulatory compliance. Aligned with ICAO SMS.',
    lead:
      'Flight safety, ground operations, SMS compliance, and maintenance tracking for airlines, airports, and MRO facilities worldwide.',
    tags: ['Flight Safety', 'Ground Operations', 'Maintenance Tracking', 'Regulatory Compliance'],
    highlights: [
      'Aligned with ICAO SMS, FAA & EASA requirements',
      'Fatigue risk management',
      'Bird strike tracking'
    ],
    modules: [
      'compliance-management-software',
      'document-control-software',
      'incident-reporting-software',
      'hse-analytics-software'
    ],
    compliance: []
  },
  {
    slug: 'mining',
    name: 'Mining',
    title: 'Mining HSE Software | SafeTrack Pro Global',
    description:
      'Mining HSE software for geotechnical safety, ventilation, equipment tracking, and emergency response. Aligned with MSHA requirements.',
    lead:
      'Underground and surface mining safety including geotechnical monitoring, ventilation control, equipment tracking, and emergency response systems.',
    tags: ['Geotechnical Safety', 'Ventilation', 'Equipment Tracking', 'Emergency Response'],
    highlights: [
      'Aligned with MSHA requirements',
      'Gas test records',
      'Ground control monitoring',
      'Blast management'
    ],
    modules: [
      'ai-camera-monitoring',
      'environmental-monitoring-software',
      'permit-to-work-software',
      'incident-reporting-software'
    ],
    compliance: []
  },
  {
    slug: 'chemical',
    name: 'Chemical',
    title: 'Chemical Industry HSE Software | SafeTrack Pro Global',
    description:
      'Chemical HSE software for HazMat management, spill prevention, process safety, and environmental compliance. Aligned with REACH and TSCA.',
    lead:
      'Hazardous material management, spill prevention, process safety, and environmental compliance for chemical plants, refineries, and pharmaceutical facilities.',
    tags: ['HazMat Management', 'Spill Prevention', 'Process Safety', 'Environmental Compliance'],
    highlights: [
      'Aligned with REACH & TSCA',
      'SDS management',
      'Chemical inventory',
      'Emergency response planning'
    ],
    modules: [
      'environmental-monitoring-software',
      'ai-hse-document-generator',
      'compliance-management-software',
      'ai-risk-assessment-software'
    ],
    compliance: ['iso-14001']
  },
  {
    slug: 'education',
    name: 'Education',
    title: 'Education & Campus Safety Software | SafeTrack Pro Global',
    description:
      'Education HSE software for student safety, campus security, emergency drills, and facility inspections. Aligned with FERPA.',
    lead:
      'Campus safety management for schools, universities, and educational institutions with student welfare, emergency preparedness, and facility safety monitoring.',
    tags: ['Student Safety', 'Campus Security', 'Emergency Drills', 'Facility Inspections'],
    highlights: [
      'Aligned with FERPA',
      'Visitor management',
      'Incident reporting',
      'Emergency response plans'
    ],
    modules: [
      'incident-reporting-software',
      'hse-dashboard-software',
      'document-control-software',
      'compliance-management-software'
    ],
    compliance: []
  }
];

/* ============================================================
   COMPLIANCE PAGES   ->  /compliance/<slug>
   ============================================================ */
export const COMPLIANCE_PAGES = [
  {
    slug: 'osha',
    code: 'OSHA',
    name: 'OSHA',
    title: 'OSHA Compliance Software | SafeTrack Pro Global',
    description:
      'OSHA compliance software: injury recordkeeping with OSHA 300 log generation, OSHA-aligned SOPs and JHAs, training tracking, and expiry alerts.',
    h1: 'OSHA Compliance Software',
    about:
      'The Occupational Safety and Health Administration (OSHA) is the US federal agency that sets and enforces workplace safety and health standards. Employers in covered industries must meet requirements for hazard communication, injury and illness recordkeeping, training, and industry-specific rules such as 29 CFR 1910 for general industry and 29 CFR 1926 for construction.',
    keyAreas: [
      'Injury and illness recordkeeping, including the OSHA 300 log',
      'Hazard communication and chemical safety',
      'Process safety management (29 CFR 1910.119)',
      'Construction site safety (29 CFR 1926)',
      'Training records and documented procedures'
    ],
    supports: [
      {
        title: 'Injury recording and OSHA 300 log',
        text: 'Record first aid, medical treatment, restricted duty, and recordable injuries with case management and OSHA 300 log generation.',
        to: '/incident-reporting-software'
      },
      {
        title: 'OSHA-aligned documents',
        text: 'Generate SOPs and JHAs with OSHA references filled in, then route them through approval.',
        to: '/ai-hse-document-generator'
      },
      {
        title: 'Training and competency',
        text: 'Track mandatory training, toolbox talks, and refresher cycles with expiry alerts.',
        to: '/workforce-management-software'
      },
      {
        title: 'Deadlines and inspections',
        text: 'Track expiring permits, inspections, and corrective actions so nothing goes overdue.',
        to: '/compliance-management-software'
      }
    ],
    industries: ['oil-and-gas', 'construction', 'manufacturing']
  },
  {
    slug: 'iso-45001',
    code: 'ISO 45001',
    name: 'ISO 45001',
    title: 'ISO 45001 Software for OH&S Management | SafeTrack Pro',
    description:
      'ISO 45001 software to support your OH&S management system: risk assessment, incident investigation, document control, and performance tracking.',
    h1: 'ISO 45001 Software for OH&S Management Systems',
    about:
      'ISO 45001 is the international standard for occupational health and safety (OH&S) management systems. It provides a framework for reducing workplace risk, improving worker safety, and continually improving OH&S performance, and it replaces OHSAS 18001.',
    keyAreas: [
      'Leadership and worker participation',
      'Hazard identification and risk assessment',
      'Operational controls and emergency preparedness',
      'Incident investigation and corrective action',
      'Performance evaluation and internal audits',
      'Continual improvement'
    ],
    supports: [
      {
        title: 'Risk assessment',
        text: 'Predictive analytics and integrated risk assessments help identify hazards earlier.',
        to: '/ai-risk-assessment-software'
      },
      {
        title: 'Incidents and corrective actions',
        text: 'Report, investigate, and track corrective actions to closure.',
        to: '/incident-reporting-software'
      },
      {
        title: 'Controlled documents',
        text: 'Version control, approvals, and audit trails for procedures and records.',
        to: '/document-control-software'
      },
      {
        title: 'Performance monitoring',
        text: 'Live KPIs, LTI trends, and custom reports to evaluate OH&S performance.',
        to: '/hse-dashboard-software'
      }
    ],
    industries: ['manufacturing', 'construction', 'oil-and-gas']
  },
  {
    slug: 'iso-14001',
    code: 'ISO 14001',
    name: 'ISO 14001',
    title: 'ISO 14001 Software for Environmental Management | SafeTrack',
    description:
      'ISO 14001 software to support your environmental management system with live monitoring, regulatory alerts, document control, and ESG reporting.',
    h1: 'ISO 14001 Software for Environmental Management Systems',
    about:
      'ISO 14001 is the international standard for environmental management systems (EMS). It helps organizations manage environmental responsibilities, meet compliance obligations, reduce environmental impact, and improve performance over time.',
    keyAreas: [
      'Environmental aspects and impacts',
      'Compliance obligations',
      'Operational control',
      'Monitoring and measurement',
      'Internal audit and management review',
      'Continual improvement'
    ],
    supports: [
      {
        title: 'Monitoring and measurement',
        text: 'Track air quality, water quality, emissions, biodiversity, and carbon footprint in real time.',
        to: '/environmental-monitoring-software'
      },
      {
        title: 'Regulatory tracking',
        text: 'Automated regulatory tracking and instant alerts help you stay on top of obligations.',
        to: '/compliance-management-software'
      },
      {
        title: 'Controlled records',
        text: 'Keep procedures and records under version control with full audit trails.',
        to: '/document-control-software'
      },
      {
        title: 'Reporting',
        text: 'Turn environmental data into ESG reports and trend analysis.',
        to: '/hse-analytics-software'
      }
    ],
    industries: ['chemical', 'oil-and-gas', 'mining']
  },
  {
    slug: 'hipaa',
    code: 'HIPAA',
    name: 'HIPAA',
    title: 'HIPAA-Aligned Healthcare Safety Software | SafeTrack Pro',
    description:
      'Healthcare safety software aligned with HIPAA requirements: role-based access, audit trails, clinical incident reporting, and controlled documents.',
    h1: 'HIPAA-Aligned Safety Software for Healthcare',
    about:
      'The Health Insurance Portability and Accountability Act (HIPAA) is a US law that sets standards for protecting sensitive patient health information. Its Privacy Rule and Security Rule apply to covered entities and their business associates. Requirements depend on your organization and how you handle protected health information, so confirm your obligations with your compliance advisor.',
    keyAreas: [
      'Privacy Rule: permitted uses and disclosures of patient information',
      'Security Rule: administrative, physical, and technical safeguards',
      'Breach Notification Rule',
      'Access controls and audit trails',
      'Workforce training'
    ],
    supports: [
      {
        title: 'Access control and audit trails',
        text: 'Role-based access control and complete audit trails across every module.',
        to: '/trust'
      },
      {
        title: 'Clinical incident reporting',
        text: 'Report and track clinical and workplace incidents with managed follow-up.',
        to: '/incident-reporting-software'
      },
      {
        title: 'Workforce training',
        text: 'Track mandatory training and competency, with expiry alerts.',
        to: '/workforce-management-software'
      },
      {
        title: 'Controlled documents',
        text: 'Keep policies and procedures under version control with approvals.',
        to: '/document-control-software'
      }
    ],
    industries: ['healthcare']
  }
];

/* ============================================================
   Lookups and path helpers
   ============================================================ */
export const SOLUTIONS_BY_SLUG = Object.fromEntries(SOLUTIONS.map((p) => [p.slug, p]));
export const INDUSTRIES_BY_SLUG = Object.fromEntries(INDUSTRIES.map((p) => [p.slug, p]));
export const COMPLIANCE_BY_SLUG = Object.fromEntries(COMPLIANCE_PAGES.map((p) => [p.slug, p]));

export const solutionPath = (slug) => `/${slug}`;
export const industryPath = (slug) => `/industries/${slug}`;
export const compliancePath = (slug) => `/compliance/${slug}`;

/** Every path these files create (used by the sitemap script). */
export const ALL_MARKETING_PATHS = [
  ...SOLUTIONS.map((p) => solutionPath(p.slug)),
  ...INDUSTRIES.map((p) => industryPath(p.slug)),
  ...COMPLIANCE_PAGES.map((p) => compliancePath(p.slug)),
  '/trust',
  '/demo'
];
