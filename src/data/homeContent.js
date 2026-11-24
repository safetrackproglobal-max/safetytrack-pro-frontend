// Home page text. Pure JS: used by HomePage.js and scripts/prerender.mjs.
export const HOME_TITLE = 'SafeTrack Pro Global | HSE & Safety Management Software';
export const HOME_DESCRIPTION =
  'HSE software for incidents, permits, toolbox talks, safety documents, AI cameras and anonymous worker reporting. Free plan, free documents, clear data and AI rules.';
export const HOME_H1 = 'Safety management your workers and managers can trust';
export const HOME_LEAD =
  'Report hazards, control permits, run toolbox talks, manage documents and follow every action to closure. One platform, with plain answers about your data and AI.';

export const DOORS = [
  { title: 'I want to report a concern', text: 'Tell your company about a hazard by voice, photo or text. No account needed.', to: '/voice', cta: 'Report a concern' },
  { title: 'I manage safety', text: 'Run incidents, permits, actions and documents in one place. Start on the free plan.', to: '/signup', cta: 'Create a free account' },
  { title: 'I need a safety document', text: '164 editable templates. Add your logo and download a PDF.', to: '/free-safety-documents', cta: 'Open free documents' },
  { title: 'I am studying safety', text: 'Ten free CSP-style questions with explanations. Practice only.', to: '/csp-practice-exam/free-test', cta: 'Take the free test' }
];

export const SPOTLIGHTS = [
  { title: 'Workplace Voice', text: 'Workers scan a code, speak in their language and follow what happens next. They choose anonymous, protected or named.', to: '/anonymous-safety-reporting', guide: '/anonymous-safety-reporting/how-it-works', guideLabel: 'Is it really anonymous?' },
  { title: 'AI camera monitoring', text: 'Checks live cameras and videos for people, PPE and hazards. No face recognition. A person checks every alert.', to: '/ai-camera-monitoring', guide: '/ai-camera-monitoring/how-it-works', guideLabel: 'What happens to the picture?' },
  { title: 'Environmental monitoring', text: 'Readings, sites, trends and reports, with area weather and air quality shown separately from your own measurements.', to: '/environmental-monitoring-software', guide: '/environmental-monitoring-software/how-it-works', guideLabel: 'Where do the numbers come from?' },
  { title: 'CSP-style practice exam', text: '100 timed questions, scored on our server with explanations. Not the official exam and no CEUs.', to: '/csp-practice-exam', guide: '/csp-practice-exam/exam-guide', guideLabel: 'Exam and certificate rules' }
];

export const MODULE_GROUPS = [
  ['Act on risk', ['incident-reporting-software', 'ai-risk-assessment-software', 'permit-to-work-software', 'ai-camera-monitoring', 'environmental-monitoring-software']],
  ['Involve people', ['anonymous-safety-reporting', 'toolbox-talk-generator', 'workforce-management-software', 'csp-practice-exam']],
  ['Control and prove', ['document-control-software', 'ai-hse-document-generator', 'compliance-management-software', 'hse-project-management-software', 'hse-dashboard-software', 'hse-analytics-software']]
];

export const TRUST_POINTS = [
  { title: 'We ask first', text: 'A clear notice before AI, cameras and uploads, and your acceptance is recorded.', to: '/ai-transparency', cta: 'How AI uses your data' },
  { title: 'Every feature listed', text: 'What we collect, why, where it is kept and whether AI touches it, including photos, video and voice.', to: '/data-use', cta: 'How we use your data' },
  { title: 'AI is never the last word', text: 'AI can make mistakes. A competent person must check every result independently.', to: '/ai-transparency', cta: 'What AI gets wrong' },
  { title: 'No borrowed badges', text: 'We list the certifications we do not hold, next to the security measures that exist.', to: '/trust', cta: 'Trust centre' }
];

export const STEPS = [
  ['Create a free account', 'Add your company, sites and people.'],
  ['Switch on what you need', 'Start with incidents, permits or worker reporting.'],
  ['Act and follow up', 'Assign actions, see what is late and keep the record.']
];

export const HOME_FAQS = [
  { q: 'What is SafeTrack Pro Global?', a: 'Web-based health, safety and environment (HSE) software. It covers incident and near-miss reporting, permit to work, toolbox talks, worker reporting, documents, risk assessment, AI camera checks, environmental records and compliance tracking.' },
  { q: 'Can workers report without an account?', a: 'Yes. Workplace Voice works from a QR code or the website by voice, photo, video or text. The worker chooses anonymous, protected or named.' },
  { q: 'What happens to my photos and videos?', a: 'They are analysed on our own server, not by a chatbot. Live camera frames are not saved as images by live analysis, uploaded analysis videos are deleted after analysis, and evidence photos are kept with the record.' },
  { q: 'Which AI do you use, and can it be wrong?', a: 'Text features use a DeepSeek model through Tencent Cloud. Photo and video detection runs on our own server. AI can make mistakes, so a competent person must check every result independently.' },
  { q: 'Are you ISO 27001, SOC 2 or HIPAA certified?', a: 'No. The trust centre lists the security measures that exist and the certifications we do not hold.' },
  { q: 'Is the practice exam the official CSP exam?', a: 'No. It is an independent practice exam. It is not affiliated with BCSP and does not award the CSP credential or CEUs.' },
  { q: 'Is there a free plan?', a: 'Yes. You can start free and see current paid plans on the pricing page. The free documents and free practice test need no account.' },
  { q: 'Where are you based?', a: 'Doha, Qatar. Email info@safetrackproglobal.com or call +974 3325 1705.' }
];

export const OTHER_PAGES = [
  ['Free tools', [['Free safety documents', '/free-safety-documents'], ['Free CSP practice test', '/csp-practice-exam/free-test'], ['Report a concern', '/voice'], ['Track a report', '/voice/track']]],
  ['Company', [['Features', '/features'], ['Pricing', '/pricing'], ['About', '/about'], ['Contact', '/contact'], ['Request a demo', '/demo'], ['Terms', '/terms']]]
];
