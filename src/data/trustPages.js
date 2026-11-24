/**
 * Public guide and trust pages (exam, cameras, environment, Workplace Voice, data use, AI, privacy, facts).
 * Pure JS: imported by the React pages, scripts/prerender.mjs and scripts/generate-sitemap.mjs.
 * RULE: every statement here must match what the software really does. Change the code and this file together.
 */
export const POLICY_VERSION = '2026-11-24';
export const POLICY_DATE = 'November 24, 2026';
const EMAIL = 'info@safetrackproglobal.com';

export const AI_WARNING =
  'AI can make mistakes. It can miss hazards, invent details or misread photos. A competent person must check every AI result independently before anyone relies on it.';
export const EMERGENCY = 'SafeTrack Pro is not an emergency service. If someone is in danger, call your local emergency number and follow your site emergency plan first.';
export const CSP_NOTE =
  'Independent practice tool. CSP® is a registered mark of the Board of Certified Safety Professionals (BCSP). SafeTrack Pro Global is not affiliated with or endorsed by BCSP, and passing does not grant the CSP credential or CEUs.';

/* Who processes data for us. Shown on /data-use and /privacy. */
export const PROVIDERS = [
  ['Railway', 'Application server, database and uploaded file storage', 'Account and company records, documents, photos, videos and recordings'],
  ['Vercel', 'Delivers the website and app screens', 'Technical connection data such as IP address and browser type'],
  ['Tencent Cloud TokenHub (DeepSeek model)', 'Writes and analyses text for AI features', 'The text you type or the records the AI feature uses. Photos and videos are not sent to it'],
  ['Groq (Whisper model), when voice transcription is switched on', 'Turns Workplace Voice recordings into text', 'The voice recording'],
  ['Your own browser maker (for example Google in Chrome)', 'Optional live speech-to-text while you record a Workplace Voice report', 'Your speech, if your browser supports this feature'],
  ['Paystack and PayPal', 'Payments', 'Payment details go to them. We keep the amount, plan, reference and status, not full card numbers'],
  ['WeatherAPI, ipapi.co', 'Weather and air quality for your area', 'Coordinates or city, or the IP address to estimate a city'],
  ['OpenStreetMap, Esri and other map providers', 'Map images and place search', 'The map area you view and your IP address'],
  ['Google Fonts, cdnjs, unpkg, LaunchIgniter', 'Fonts, code libraries and one badge image on public pages', 'IP address and browser type, as with any web request'],
  ['Our email provider', 'Account, security and notification emails', 'Your email address and the message'],
  ['Error monitoring (Sentry), when switched on', 'Finding software faults', 'Technical error details']
];

export const DATA_BY_FEATURE = [
  ['Account and profile', 'Name, email, phone, country, role, company, profile photo', 'To log you in and show who did what', 'Database; photo in file storage. A profile photo can be opened by anyone who has its long random link', 'No'],
  ['Incident and near-miss reports', 'Description, people involved, location, photos, witness statements', 'To investigate and track actions', 'Your company workspace', 'Only if you use an AI helper: the text is sent'],
  ['Workplace Voice (public reporting)', 'Voice, photo, video, text, language, site. Name and contact only if the worker gives them', 'To send the concern to the right people', 'The reported company’s workspace', 'Text is translated and triaged; photos and video are checked by our own detector; voice may be transcribed'],
  ['AI camera: live camera or CCTV', 'Video frames while the camera is running', 'To detect people, PPE and hazards', 'Frames are analysed on our server and not saved as images by live analysis. Results and times may be kept', 'Yes: detector on our own server, not a text AI provider'],
  ['AI video and photo analysis', 'The video or photo you upload', 'To detect PPE and hazards', 'The uploaded video is deleted after analysis. Results are kept. Reports you create may contain still images', 'Yes: detector on our own server'],
  ['Environmental monitoring', 'Readings, sites, coordinates, map images, documents', 'Trends, weather, reports', 'Your company workspace', 'Only if you use an AI helper'],
  ['Documents, PDF editor, signatures', 'Files you upload or create, signature images', 'To edit, review, sign and store', 'Your company workspace. A signature image can be opened by anyone who has its long random link', 'Only if you use an AI helper: the text is sent'],
  ['AI documents and chat', 'What you type and the answer', 'To write the draft and show your history', 'Database, linked to your account', 'Yes: the text is sent to the AI text provider'],
  ['Health and hospital tools', 'Health text or results you choose to enter', 'To help qualified staff organise information', 'Database', 'Yes for AI tools: the text is sent. Remove names and patient numbers first'],
  ['Practice exam and certificate', 'Name, email, answers, score', 'To grade the practice exam and issue a certificate', 'Database. A certificate can be checked by anyone who has its ID', 'Questions are AI-assisted; grading is done by our server'],
  ['Free documents and free test', 'The text, company name and logo you add', 'To make your PDF', 'Your draft stays in your browser. It is sent to our server only to build the PDF', 'No'],
  ['Contact and demo forms', 'Name, email, message', 'To answer you', 'Email and database', 'No'],
  ['Security logs', 'IP address, browser, time and action', 'To stop attacks and keep an audit trail', 'Database and hosting logs', 'No']
];

export const TRUST_PAGES = [
  {
    path: '/csp-practice-exam/exam-guide', nav: 'Exam and certificate guide', group: 'Product guides', parent: ['CSP practice exam', '/csp-practice-exam'],
    title: 'CSP Practice Exam Guide: Rules, Scoring & Certificate | SafeTrack Pro',
    description: 'How the SafeTrack CSP-style practice exam works: free 10 questions, full 100-question timed mode, scoring, result bands, certificate of completion and what it is not.',
    h1: 'Practice exam and certificate: the complete guide',
    lead: 'What each exam mode is, how it is scored, what the certificate means, and what it does not mean.',
    warning: CSP_NOTE,
    sections: [
      { h: 'The two exam modes', table: { head: ['', 'Free test', 'Full practice exam'], rows: [
        ['Account needed', 'No', 'Yes, a free account is enough'],
        ['Questions', '10, with explanations', '100 scenario-based questions'],
        ['Time', 'No limit', '4 hours, then it is submitted automatically'],
        ['How often', 'Any time', 'Free account: one full exam every 24 hours. Paid plans: more, within fair-use limits'],
        ['Result', 'Score and topics to study', 'Score, result band and explanations'],
        ['Certificate', 'No', 'Certificate of completion with a paid plan, after passing']
      ] } },
      { h: 'How the full exam runs', steps: ['Log in and open AI Documents, then Exams & Verification.', 'Enter the name you want on the result and choose the exam.', 'Answer 100 questions. The timer keeps running; you can move between questions.', 'Submit, or let the timer submit for you.', 'Our server grades the answers. The correct answers are not sent to your browser before you submit.', 'Read the explanations and study the weak topics.'] },
      { h: 'Scoring and result bands', list: ['Pass: 70% or more', 'Bronze: 75% or more', 'Silver: 80% or more', 'Gold: 85% or more', 'Platinum: 90% or more'], p: ['The bands are our own labels for practice results. They are not an industry grade, and they do not predict your score on the real CSP exam.'] },
      { h: 'What the certificate of completion says', list: ['Your name, the practice exam, your score and date', 'A unique ID starting with STP- that anyone can check online', 'That it records completion of a practice exam by SafeTrack Pro Global'] },
      { h: 'What the certificate is not', list: ['Not the CSP® credential and not issued by BCSP', 'No CEUs, CPD points or licence', 'Not accredited by any accreditation body', 'Not proof that a person is competent for a job: employers must check that themselves'] },
      { h: 'Where the questions come from', p: ['Questions follow the publicly published topics of the CSP exam outline. They are our own practice questions and AI helps to write them. They are not real exam questions.', 'A question or explanation may be wrong or out of date. Check it against the current regulation or standard, and tell us so we can correct it.'] },
      { h: 'Your exam data', p: ['We keep your name, email, answers and score so we can grade the exam, show your history and verify the certificate. Verification shows certificate details to anyone who has the ID.'] }
    ],
    faqs: [
      { q: 'Is this the official CSP exam?', a: 'No. It is an independent practice exam. The official CSP exam is run only by BCSP.' },
      { q: 'Is the full exam free?', a: 'Yes. A free account can take one full 100-question exam every 24 hours. A paid plan is needed for the certificate of completion.' },
      { q: 'Does the certificate give CEUs?', a: 'No. It is a certificate of completion for a practice exam and carries no CEUs or accreditation.' }
    ],
    links: [['Take the free 10 questions', '/csp-practice-exam/free-test'], ['About the practice exam', '/csp-practice-exam'], ['How AI uses your data', '/ai-transparency']]
  },
  {
    path: '/ai-camera-monitoring/how-it-works', nav: 'AI camera guide', group: 'Product guides', parent: ['AI camera monitoring', '/ai-camera-monitoring'],
    title: 'How AI Camera Monitoring Works & What Is Stored | SafeTrack Pro',
    description: 'How SafeTrack AI camera monitoring detects PPE and hazards, what happens to each video frame, what is stored, what it cannot do, and duties for workplaces.',
    h1: 'How AI camera monitoring works',
    lead: 'What the camera tool looks for, what happens to the picture, and what your organisation must do before switching it on.',
    warning: AI_WARNING,
    sections: [
      { h: 'Three ways to use it', table: { head: ['Mode', 'What you do', 'What happens to the picture'], rows: [
        ['Device camera', 'Allow the browser to use your phone or laptop camera', 'Frames are sent to our server, analysed in memory and not saved as images by live analysis'],
        ['CCTV or IP camera', 'Enter the stream address of a camera you are allowed to use', 'The server reads frames while the session runs and shows them to you with results'],
        ['Upload a video', 'Choose a video file', 'It is saved temporarily, analysed and deleted. Results stay in your history']
      ] } },
      { h: 'What it tries to detect', list: ['People on site', 'Hard hats, vests and other PPE, or missing PPE', 'Vehicles, machinery and some visible hazards', 'A risk level calculated from what was found'] },
      { h: 'What it does not do', list: ['No face recognition and no identification of people by name', 'No voice recording', 'No decisions about discipline, pay or employment', 'No guarantee that a hazard will be found or that an alert is correct', 'Not a fire alarm, gas detector, machine guard or other safety-rated device'] },
      { h: 'Why results can be wrong', list: ['Poor light, rain, dust, glare or low resolution', 'People far away, hidden or facing away', 'Unusual PPE colours or equipment', 'Network delay: only some frames are analysed'] },
      { h: 'Before you switch it on', steps: ['Check that you have a lawful reason to film and tell workers with clear signs.', 'Complete any privacy assessment or worker consultation your law requires.', 'Do not film toilets, changing rooms, rest areas, medical areas or people who must not be filmed.', 'Limit who can see results.', 'Have a trained person check every alert before acting on it.'] },
      { h: 'Who is responsible', p: ['The company that runs the camera decides why and how people are filmed. SafeTrack Pro processes the frames for that company. If you are a worker and want to know about a camera at your site, ask your employer first, or write to us and we will pass it on.'] }
    ],
    faqs: [
      { q: 'Are my camera images stored?', a: 'Live camera frames are analysed on our server and not saved as images by live analysis. Uploaded videos are deleted after analysis. Detection results are kept in your history.' },
      { q: 'Does it use face recognition?', a: 'No. It detects objects such as people, helmets and vests. It does not identify who a person is.' },
      { q: 'Is camera video sent to a chatbot AI?', a: 'No. Detection runs with a computer-vision model on our own server.' }
    ],
    links: [['AI camera monitoring', '/ai-camera-monitoring'], ['How we use your data', '/data-use'], ['Request a demo', '/demo']]
  },
  {
    path: '/environmental-monitoring-software/how-it-works', nav: 'Environmental guide', group: 'Product guides', parent: ['Environmental monitoring', '/environmental-monitoring-software'],
    title: 'How Environmental Monitoring Works: Sources & Limits | SafeTrack Pro',
    description: 'What the SafeTrack environmental module records, where weather and air-quality data comes from, how scores and predictions are made, and their limits.',
    h1: 'How environmental monitoring works',
    lead: 'Which numbers are measured by you, which come from a public service, which are calculated, and how far to trust each one.',
    warning: AI_WARNING,
    sections: [
      { h: 'Where the numbers come from', table: { head: ['Data', 'Source', 'Use it as'], rows: [
        ['Weather and area air quality', 'A weather service (WeatherAPI) for your coordinates or city', 'General information about the area, not a site measurement'],
        ['Water, emissions, noise and waste readings', 'What your team enters, imports or connects', 'Your records, as accurate as your instruments and sampling'],
        ['Maps and satellite images', 'OpenStreetMap, Esri and other map providers', 'Background. Images may be old'],
        ['ESG and compliance scores', 'Calculated from your own records', 'A management indicator, not an audit result'],
        ['Predictions and AI text', 'Statistical models and an AI text provider', 'An estimate to check, never proof of compliance']
      ] } },
      { h: 'What you can do', list: ['Record readings per site and see trends', 'Set alerts for limits you choose', 'Map sites and observations', 'Write environmental plans and reports', 'Keep an audit trail of who entered what'] },
      { h: 'What it does not replace', list: ['Calibrated instruments and accredited laboratories', 'Permits, statutory monitoring and reporting', 'An environmental professional’s judgement', 'Emergency gas or chemical alarms'] },
      { h: 'Photos, video and location', p: ['If you use a photo, video or your device location, the browser asks first. Location is used for weather and maps. Images are used for the analysis or record you asked for. See the data use page for storage.'] }
    ],
    faqs: [
      { q: 'Is the air quality value measured at my site?', a: 'Not unless you enter or connect your own readings. The automatic value comes from a weather service for the area.' },
      { q: 'Can I use an AI prediction as compliance evidence?', a: 'No. Use measured results from suitable instruments or laboratories, checked by a competent person.' }
    ],
    links: [['Environmental monitoring', '/environmental-monitoring-software'], ['How we use your data', '/data-use'], ['ISO 14001 guide', '/compliance/iso-14001']]
  },
  {
    path: '/anonymous-safety-reporting/how-it-works', nav: 'Workplace Voice guide', group: 'Product guides', parent: ['Anonymous safety reporting', '/anonymous-safety-reporting'],
    title: 'Workplace Voice: Is It Really Anonymous? | SafeTrack Pro',
    description: 'How Workplace Voice reporting works, what your company sees for anonymous, protected and named reports, what is stored, and how to stay safe when you report.',
    h1: 'Workplace Voice: how reporting works and who sees what',
    lead: 'A plain answer for workers and companies: what happens after you press Send.',
    warning: `${EMERGENCY} ${AI_WARNING}`,
    sections: [
      { h: 'How to report', steps: ['Scan your company’s QR code or find your company on the Workplace Voice page.', 'Choose your language and the type of concern.', 'Read the notice and accept it.', 'Speak, take a photo or video, or type.', 'Choose anonymous, protected or named, and press Send.', 'Save your tracking code. It is the only way to follow an anonymous report.'] },
      { h: 'Who sees your name', table: { head: ['Your choice', 'Your company sees', 'SafeTrack sees'], rows: [
        ['Anonymous', 'The report. No name or contact is asked for', 'The report. No name or contact'],
        ['Protected', 'The report without your name', 'Your name and contact. Only platform administrators can open it, and each view is logged'],
        ['Named', 'The report with your name and contact', 'The same']
      ] } },
      { h: 'What anonymous cannot hide', list: ['Your voice, face, clothes or handwriting in a recording or photo', 'Details only you would know', 'What you write in the text yourself', 'Use on a company phone or company Wi-Fi that your employer may monitor'], p: ['If you need strong anonymity, type instead of speaking, do not film people, and use your own phone and network.'] },
      { h: 'Technical data we keep', p: ['To stop spam we store a one-way code made from your network address and a random device number, not the address itself. The company does not see it. Our hosting providers handle your IP address to deliver the page, and our security log can record an IP address when an attack or flood is detected.', 'Photos are re-saved, which removes hidden location data (EXIF and GPS). Video and voice files are stored as recorded and may contain hidden data.'] },
      { h: 'What AI does with a report', list: ['Translates and summarises the text, and suggests a category and risk level, using our AI text provider', 'May turn a voice recording into text using a speech service', 'Checks photos and video frames for PPE and hazards on our own server', 'It does not decide the outcome. People at the company do'] },
      { h: 'After you send it', p: ['The people your company chose are notified. You can follow progress and answer questions with your tracking code. SafeTrack does not investigate the report and cannot promise what the company will do.', 'Reward points, where a company offers them, use an alias and a PIN. The company sees the alias, not who you are.'] },
      { h: 'Retaliation and legal rights', p: ['Workplace Voice does not replace your right to contact a regulator, a union, the police or a lawyer. Use those routes if you are threatened or your concern is ignored.'] }
    ],
    faqs: [
      { q: 'Can my company find out who sent an anonymous report?', a: 'The report contains no name or contact unless you add one. But your voice, a photo or details in your text could still identify you.' },
      { q: 'Do I need an account?', a: 'No. You can report from a QR code or the website without an account.' },
      { q: 'Can I delete my report?', a: `Write to ${EMAIL} with your tracking code. We will pass the request to the company, which may need to keep some safety records by law.` }
    ],
    links: [['Report a concern', '/voice'], ['Track a report', '/voice/track'], ['For companies', '/anonymous-safety-reporting'], ['How we use your data', '/data-use']]
  },
  {
    path: '/data-use', nav: 'How we use your data', group: 'Trust', parent: ['Trust centre', '/trust'],
    title: 'How We Use Your Data: Photos, Video, Voice & Text | SafeTrack Pro',
    description: 'A plain list of what SafeTrack Pro collects on every feature, including photos, video, voice and location: why, where it is stored, whether AI uses it, and how to delete it.',
    h1: 'How we use your data',
    lead: 'Feature by feature: what we collect, why, where it goes, and whether AI touches it.',
    sections: [
      { h: 'The short version', list: ['We do not sell your data and we show no third-party adverts', 'We do not use your photos, videos, recordings or documents to train AI models', 'Photos and video are analysed by a detector on our own server, not by a chatbot', 'Text used in AI features is sent to an outside AI provider, after you accept a notice', 'Your company controls the records in its workspace', 'You can ask for a copy or deletion at any time'] },
      { h: 'Every feature that collects data', table: { head: ['Feature', 'What we collect', 'Why', 'Where it is kept', 'Does AI use it?'], rows: DATA_BY_FEATURE } },
      { h: 'Photos and video', list: ['The browser asks before using your camera or microphone, and we show our own notice before the first use', 'Incident, permit and document photos are kept with the record', 'Live camera frames are analysed and not saved as images by live analysis', 'Uploaded analysis videos are deleted after analysis', 'Workplace Voice photos, videos and recordings are kept with the report', 'Only upload pictures of people if you are allowed to. Avoid faces when they are not needed'] },
      { h: 'Location', p: ['Your browser asks before sharing exact location. We use it for weather, maps and the site of a record. If you refuse, weather may use an approximate city from your IP address.'] },
      { h: 'Storage in your browser', p: ['We use browser storage, not advertising cookies, to keep you logged in, remember language and settings, keep unsent drafts, and remember that you accepted a notice. Clearing your browser data removes it.'] },
      { h: 'Who processes data for us', table: { head: ['Provider', 'What for', 'What they receive'], rows: PROVIDERS }, p: ['These companies may process data in countries other than yours. We do not currently offer a choice of country for storage.'] },
      { h: 'How long we keep it', p: ['We keep your account and company records while the account is active, because safety records are often needed for years. There is no automatic deletion of this content today. When you ask us to delete data, we answer within 30 days. Some records may be kept if the law or your company’s legal duties require it, and copies in backups may take longer to disappear.'] },
      { h: 'Ask for a copy, a correction or deletion', p: [`Write to ${EMAIL} from your account email. Say what you want: copy, correction, deletion, or to stop an AI use. If your data is in your employer’s workspace, we may need to refer you to your employer.`] }
    ],
    faqs: [
      { q: 'Do you sell my data?', a: 'No.' },
      { q: 'Do you train AI on my photos or documents?', a: 'No. The AI text provider processes text under its own terms to produce the answer.' },
      { q: 'Who can see my company’s records?', a: 'People in your company with the right role. A small number of SafeTrack platform administrators can access data to run, support and secure the service.' }
    ],
    links: [['How AI is used', '/ai-transparency'], ['Privacy policy', '/privacy'], ['Trust centre', '/trust']]
  },
  {
    path: '/ai-transparency', nav: 'AI transparency', group: 'Trust', parent: ['Trust centre', '/trust'],
    title: 'AI Transparency: How AI Uses Your Data & Its Limits | SafeTrack Pro',
    description: 'Which SafeTrack Pro features use AI, what data each one sends, which AI provider receives it, what AI can get wrong, and how to check results.',
    h1: 'AI transparency: what AI does, and what it gets wrong',
    lead: 'Where AI is used, what it receives, and why a person must always check the answer.',
    warning: AI_WARNING,
    sections: [
      { h: 'Two kinds of AI', table: { head: ['', 'Text AI', 'Picture AI'], rows: [
        ['Used for', 'Documents, chat, investigations, toolbox talks, translation, exam questions, health and environmental text', 'PPE and hazard detection in photos, video and cameras'],
        ['Where it runs', 'Outside provider: a DeepSeek model through Tencent Cloud TokenHub', 'Our own server'],
        ['What it receives', 'What you type plus the records the feature needs, such as incident details', 'The picture or video frame'],
        ['Receives your photos?', 'No', 'Yes'],
        ['Kept by us', 'Prompts and answers may be kept in your history', 'Results']
      ] } },
      { h: 'We ask before you use it', p: ['Before you first open an AI tool, upload a file or use a camera, we show what will happen and ask you to accept. For logged-in users the acceptance is recorded with its date and version. If the notice changes, we ask again. A short warning stays visible on AI pages.', 'If you do not accept, that feature stays closed. The rest of the app still works.'] },
      { h: 'What AI can get wrong', list: ['Invent a regulation, clause number, limit value or quotation', 'Miss a hazard or report one that is not there', 'Use rules from the wrong country or an old edition', 'Translate a worker’s words incorrectly', 'Give a risk score that looks precise but is only an estimate', 'Reflect bias in the data it learned from'] },
      { h: 'How to check a result', steps: ['Compare regulations and limits with the official text for your country.', 'Compare with what is really on site.', 'Have a competent person review, correct and approve it.', 'Record who checked it.', 'Never use AI output alone to start, stop or approve dangerous work.'] },
      { h: 'Never rely on AI alone for', list: ['Emergency decisions', 'Gas test results, isolation or entry to confined spaces', 'Medical diagnosis or treatment', 'Structural, lifting or electrical design', 'Discipline or other decisions about a person', 'Legal or compliance sign-off'] },
      { h: 'What not to type into AI', list: ['Passwords, card or ID numbers', 'Patient names or numbers', 'Names of people when a role is enough', 'Trade secrets or classified information'] },
      { h: 'Health tools', p: ['Symptom, lab and medical text tools give general information for qualified staff. They are not medical devices, they do not diagnose, and they are not certified for HIPAA or any other health-privacy scheme. Do not enter information that identifies a patient.'] },
      { h: 'Report a bad answer', p: [`Send the answer and what is wrong to ${EMAIL}. Please remove personal data first.`] }
    ],
    faqs: [
      { q: 'Which AI does SafeTrack Pro use?', a: 'Text features use a DeepSeek model through Tencent Cloud TokenHub. Photo and video detection runs on our own server.' },
      { q: 'Can I rely on an AI-written risk assessment?', a: 'Only after a competent person has checked it against the real work, site and law and approved it.' },
      { q: 'Can I refuse AI?', a: 'Yes. Do not accept the AI notice. You can still use the features that do not need AI.' }
    ],
    links: [['How we use your data', '/data-use'], ['AI document generator', '/ai-hse-document-generator'], ['Privacy policy', '/privacy']]
  },
  {
    path: '/privacy', nav: 'Privacy policy', group: 'Trust', parent: ['Trust centre', '/trust'],
    title: 'Privacy Policy | SafeTrack Pro Global',
    description: 'SafeTrack Pro Global privacy policy: what personal data we collect, why, who receives it, how long it is kept, security measures and your rights.',
    h1: 'Privacy policy',
    lead: `Last updated ${POLICY_DATE}. This policy covers safetrackproglobal.com, the SafeTrack Pro app and the Workplace Voice reporting pages.`,
    sections: [
      { h: '1. Who we are', p: [`SafeTrack Pro Global, Doha, Qatar. Contact for privacy: ${EMAIL} or +974 3325 1705.`, 'For records inside a company workspace, the customer company decides how they are used and we process them for it. For accounts, billing, security and our own website, we decide.'] },
      { h: '2. What we collect', p: ['The data use page lists every feature. In short: account details, company details, safety records, files, photos, videos and recordings you provide, exam results, payment references, messages to us, and technical data such as IP address and browser.'] },
      { h: '3. Why we use it', list: ['To provide the service you or your company asked for', 'To keep accounts secure and prevent abuse', 'To handle payments and support', 'To meet legal duties', 'With your consent: AI, camera, microphone, uploads and marketing emails'] },
      { h: '4. Photos, video, voice and AI', p: ['We ask for acceptance before first use. Pictures are analysed on our own server. Text for AI goes to an outside provider. We do not use your content to train AI models. Details are on the AI transparency page.'] },
      { h: '5. Who receives it', table: { head: ['Provider', 'What for', 'What they receive'], rows: PROVIDERS }, p: ['We may also disclose data when the law requires it or to protect people. We do not sell personal data.'] },
      { h: '6. Countries', p: ['Our providers may process data outside your country, including outside Qatar, the EU and the UK. We do not currently offer a choice of storage country. If your law needs a specific transfer agreement, contact us before you use the service.'] },
      { h: '7. How long we keep it', p: ['While your account or your company’s account is active. There is no automatic deletion of this content today. We answer deletion requests within 30 days; some records may be kept when the law requires it.'] },
      { h: '8. Security', list: ['Encrypted connections (HTTPS)', 'Passwords stored as hashes, not readable text', 'Optional multi-factor login', 'Role-based access and separation between companies', 'Login limits, attack detection and IP blocking', 'Activity logs'], p: ['No system is perfectly secure. SafeTrack Pro Global does not hold ISO 27001, SOC 2 or HIPAA certification. Report a security problem to us and we will look into it.'] },
      { h: '9. Your rights', p: ['Depending on your law you can ask to see, correct, move, limit or delete your data, object to a use, or withdraw consent. Write to us. You may also complain to your data-protection authority. If your employer controls the data, we may refer you to them.'] },
      { h: '10. Young people', p: ['The service is for workplaces. People under 18 need a parent or guardian’s consent, and it is not for children under 13.'] },
      { h: '11. Cookies and browser storage', p: ['We use browser storage needed for login, language, settings, drafts and accepted notices. We do not use advertising cookies. Some outside providers listed above receive your IP address when the page loads their fonts, maps or images.'] },
      { h: '12. Changes', p: ['We will change the date above and ask logged-in users to accept important changes.'] }
    ],
    faqs: [],
    links: [['How we use your data', '/data-use'], ['AI transparency', '/ai-transparency'], ['Terms', '/terms']]
  },
  {
    path: '/facts', nav: 'Company facts', group: 'Trust', parent: ['About', '/about'],
    title: 'SafeTrack Pro Global: Facts & Common Questions',
    description: 'Plain facts about SafeTrack Pro Global for customers, journalists and AI assistants: what it is, what it is not, certifications, plans, data and contact details.',
    h1: 'SafeTrack Pro Global: the facts',
    lead: 'A single page with the correct answers about us, for buyers, journalists, search engines and AI assistants.',
    sections: [
      { h: 'Key facts', table: { head: ['Question', 'Answer'], rows: [
        ['Name', 'SafeTrack Pro Global (also written SafeTrack Pro)'],
        ['Website', 'https://www.safetrackproglobal.com (domain registered July 15, 2026)'],
        ['What it is', 'Web-based health, safety and environment (HSE / EHS) software'],
        ['Location', 'Doha, Qatar'],
        ['Contact', `${EMAIL}, +974 3325 1705`],
        ['Price', 'Free plan; paid plans on the pricing page'],
        ['Works on', 'Any modern web browser on computer, tablet or phone'],
        ['Certifications', 'None. SafeTrack Pro Global does not hold ISO 27001, SOC 2, ISO 45001 or HIPAA certification'],
        ['AI used', 'DeepSeek model through Tencent Cloud TokenHub for text; our own server for photo and video detection']
      ] } },
      { h: 'What it does', list: ['Incident and near-miss reporting, investigation and corrective actions', 'Permit to work', 'Daily AI toolbox talks', 'Workplace Voice: worker reporting by QR code or website, with anonymous, protected or named choices', 'AI-assisted safety documents, document control, review and signing', 'AI camera, photo and video checks for PPE and hazards', 'Environmental records and reports', 'CSP-style practice exam', '164 free editable safety documents'] },
      { h: 'What it is not', list: ['Not an emergency service', 'Not a certification or accreditation body', 'Not affiliated with BCSP, OSHA, ISO or any regulator', 'Not a medical device', 'Not a replacement for a competent safety professional', 'Not related to SafeStart SafeTrack, MaxAccel SafeTrack, Brady SafeTrak, shipping companies with similar names, or GPS tracking apps'] },
      { h: 'Words we use carefully', p: ['“Helps with” or “based on” a standard means that templates and workflows follow its topics. It does not mean that we, or a customer using our software, are certified or compliant.', 'We do not publish customer counts, accuracy percentages, ratings or testimonials that we cannot prove.'] }
    ],
    faqs: [
      { q: 'Is SafeTrack Pro Global ISO 27001 or SOC 2 certified?', a: 'No. Some older pages said so; that was wrong and was corrected on November 24, 2026.' },
      { q: 'Is SafeTrack Pro Global a delivery or tracking company?', a: 'No. It is workplace safety software and does not ship parcels.' },
      { q: 'Does it guarantee compliance or prevent all accidents?', a: 'No. It helps people do and record safety work. The employer remains responsible.' }
    ],
    links: [['Trust centre', '/trust'], ['How we use your data', '/data-use'], ['About', '/about'], ['Contact', '/contact']]
  }
];
export const TRUST_BY_PATH = Object.fromEntries(TRUST_PAGES.map((p) => [p.path, p]));

/* Controls that really exist in the code. Shown on /trust. */
export const CONTROLS = [
  { title: 'Company separation', text: 'Records are tied to a company, and requests are checked so one company cannot open another company’s records.' },
  { title: 'Role-based access', text: 'Admins choose what each person can see and do.' },
  { title: 'Login protection', text: 'Hashed passwords, optional multi-factor login, attempt limits and token checks.' },
  { title: 'Attack detection', text: 'Suspicious requests are counted, logged and can block an address automatically.' },
  { title: 'Encrypted connections', text: 'The site and app use HTTPS with strict browser security rules.' },
  { title: 'Activity records', text: 'Important actions and consent choices are recorded with time and user.' }
];
export const STATUS_ROWS = [
  ['ISO/IEC 27001', 'Not certified'],
  ['SOC 2', 'No report'],
  ['HIPAA', 'Not certified; do not enter identifiable patient data'],
  ['ISO 45001 / ISO 14001', 'Not certified; templates cover their topics'],
  ['Uptime guarantee', 'No public guarantee'],
  ['Choice of storage country', 'Not offered'],
  ['Independent penetration test', 'None published. We test an isolated copy ourselves']
];
export const TRUST_META = {
  title: 'Trust Centre: Security, Privacy & AI | SafeTrack Pro Global',
  description: 'How SafeTrack Pro Global protects safety data, how photos, video and AI are handled, and an honest list of the certifications we do and do not hold.'
};
