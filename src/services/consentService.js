// Notices the user must accept before AI, camera, health tools or file uploads are used.
// Stored per user + version in the browser and logged on the server (consent_records).
// When a notice text changes, raise its version here AND in app.py (_FEATURE_NOTICES).
import { AI_WARNING, POLICY_VERSION } from '../data/trustPages';

export const NOTICES = {
  policy: {
    version: POLICY_VERSION, title: 'Our privacy and AI notices have been updated',
    points: ['We rewrote our privacy policy, terms and data pages in plain language.', 'They list every place where we collect data, photos, video or voice, and who processes it.', 'We will ask you before you first use AI, a camera or file upload.'],
    accept: 'I have read and accept the privacy policy and terms.', links: [['Privacy policy', '/privacy'], ['Terms', '/terms'], ['How we use your data', '/data-use']]
  },
  ai: {
    version: POLICY_VERSION, title: 'Before you use AI', warning: AI_WARNING,
    points: ['What you type, and the records this tool needs, are sent to an outside AI provider (DeepSeek model through Tencent Cloud). It may process them in another country.', 'We do not use your content to train AI. Your questions and answers may be kept in your history.', 'Do not enter passwords, ID numbers, patient details or names that are not needed.', 'Check every regulation, number and instruction yourself before use.'],
    accept: 'I understand. I accept this use of my data, and I will check AI results independently.', links: [['How AI uses your data', '/ai-transparency'], ['How we use your data', '/data-use']]
  },
  camera: {
    version: POLICY_VERSION, title: 'Before you use a camera or video', warning: AI_WARNING,
    points: ['Pictures and video frames are sent to our server and analysed there. Live analysis does not save them as images. Uploaded videos are deleted after analysis. Results are kept.', 'There is no face recognition.', 'Only film people and places you are allowed to film. Tell people they are being filmed. Never film toilets, changing, rest or medical areas.', 'Results can be wrong and are not a safety-rated alarm.'],
    accept: 'I am allowed to use this camera or video, I accept this use, and I will check the results.', links: [['How AI cameras work', '/ai-camera-monitoring/how-it-works'], ['How we use your data', '/data-use']]
  },
  health: {
    version: POLICY_VERSION, title: 'Before you use health tools', warning: AI_WARNING,
    points: ['These are general information tools for qualified staff. They are not medical devices and do not diagnose or treat.', 'AI tools send the text to an outside AI provider. Remove patient names, numbers and anything that identifies a person.', 'We are not certified for HIPAA or other health-privacy schemes.', 'In an emergency call your local emergency number.'],
    accept: 'I understand. I will not enter identifying patient data into AI, and a qualified person will check the results.', links: [['How AI uses your data', '/ai-transparency'], ['How we use your data', '/data-use']]
  },
  upload: {
    version: POLICY_VERSION, title: 'Before you add a file, photo or video',
    points: ['The file is stored with the record or document you are working on, in your company workspace, or used for the analysis you asked for.', 'People in your company with access to that record can see it. Photos may contain hidden location data.', 'Only upload files you are allowed to share. Avoid faces and personal details that are not needed.', 'There is no automatic deletion. You can ask us to delete your data.'],
    accept: 'I am allowed to share these files and I accept this use.', links: [['How we use your data', '/data-use'], ['Privacy policy', '/privacy']]
  }
};

const AI_PATHS = ['/ai-documents', '/ai-services', '/toolbox-talks', '/risk-assessment', '/investigation-workspace', '/predictive',
  '/safety/predictive-analytics', '/documents/assistant', '/documents/smart-intake', '/documents/ai-classification', '/documents/ocr',
  '/documents/anomaly-detection', '/documents/predictive-analytics'];
const CAMERA_PATHS = ['/camera-monitoring', '/ai-services/video-ai', '/ai-services/video-analysis', '/ai-services/environmental-analysis', '/ai-services/environmental-ai'];
const HEALTH_PATHS = ['/hse/healthcare', '/hospital-management', '/occupational-health', '/ai-services/medical-analysis', '/ai-services/medical-ner',
  '/ai-services/symptom-analysis', '/ai-services/disease-prediction', '/ai-services/lab-analysis'];
const HOME_PATHS = ['/user/dashboard', '/admin/dashboard', '/employee/dashboard', '/safetypro/dashboard'];
const under = (list, path) => list.some((p) => path === p || path.startsWith(`${p}/`));

/** Notices needed before this screen may load. */
export const noticesFor = (path) => {
  if (under(CAMERA_PATHS, path)) return ['camera'];
  if (under(HEALTH_PATHS, path)) return ['health'];
  if (under(AI_PATHS, path)) return ['ai'];
  if (under(HOME_PATHS, path)) return ['policy'];
  return [];
};
export const showsAiWarning = (path) => under(AI_PATHS, path) || under(CAMERA_PATHS, path) || under(HEALTH_PATHS, path)
  || under(['/environmental-management', '/incidents', '/compliance'], path);
/** Accepting a stricter notice also covers text AI. */
const COVERS = { ai: ['ai', 'health'] };

/** Calls that make an AI provider work (POST only). */
const AI_CALL = /\/api\/(v\d+\/)?(ai|deepseek)\/|\/ai[-/]|[-/]ai(\/|$)|\/ai[-_]?(analy|assist|generat|suggest|insight|chat|summar)|toolbox-talks\/generate|\/voice\/reports\/\d+\/(reprocess|toolbox-talk)|\/similar\/|predictive\/scenario|model-recommendation|fishbone|\/(generate-document|generate-exam)/i;
const NOT_AI_CALL = /\/(certificates|history|usage|feedback|settings|permissions?|camera|video)(\/|$|\?)|\/api\/consent\//i;
const CAMERA_CALL = /\/api\/(ai\/)?(video|camera)\//i;
export const noticeForCall = (method, url) => {
  if (String(method || 'GET').toUpperCase() !== 'POST') return null;
  const u = String(url || '').split('?')[0];
  if (/\/(history|report|bulk-delete)(\/|$)/.test(u)) return null;
  if (CAMERA_CALL.test(u)) return /analy[sz]e|start|offer/i.test(u) ? 'camera' : null;
  return AI_CALL.test(u) && !NOT_AI_CALL.test(u) ? 'ai' : null;
};

const currentUser = () => {
  for (const s of ['localStorage', 'sessionStorage']) {
    try {
      const u = JSON.parse(window[s].getItem('user') || 'null');
      if (u && (u.id || u.email)) return u;
    } catch (e) { /* storage blocked */ }
  }
  return null;
};
const token = () => {
  for (const s of ['localStorage', 'sessionStorage']) {
    try {
      const t = window[s].getItem('authToken') || window[s].getItem('token');
      if (t) return t.replace(/['"]/g, '').trim();
    } catch (e) { /* storage blocked */ }
  }
  return '';
};
export const isLoggedIn = () => Boolean(token() && currentUser());

const memory = {};   // works even when browser storage is blocked
const keyOf = (f) => `stp:notice:${currentUser()?.id || currentUser()?.email || 'guest'}:${f}`;
const hasOne = (f) => {
  const k = keyOf(f);
  if (memory[k] === NOTICES[f].version) return true;
  try { return localStorage.getItem(k) === NOTICES[f].version; } catch (e) { return false; }
};
export const hasAccepted = (f) => (COVERS[f] || [f]).some(hasOne);

const remember = (f) => {
  const k = keyOf(f);
  memory[k] = NOTICES[f].version;
  try { localStorage.setItem(k, NOTICES[f].version); } catch (e) { /* kept in memory */ }
};
const apiBase = () => (process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL
  || 'https://safetrackproglobal-backend-production.up.railway.app').replace(/\/+$/, '').replace(/\/api$/, '');
let nativeFetch = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : null;

const post = (feature) => nativeFetch(`${apiBase()}/api/consent/feature`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
  body: JSON.stringify({ feature, version: NOTICES[feature].version })
});
/** Records the acceptance. The browser record opens the feature; the server log is retried on the next visit if it failed. */
export const accept = async (feature) => {
  remember(feature);
  if (!isLoggedIn() || !nativeFetch) return;
  const pk = `${keyOf(feature)}:unsent`;
  try {
    const r = await post(feature);
    if (!r.ok) throw new Error(String(r.status));
    try { localStorage.removeItem(pk); } catch (e) { /* ignore */ }
  } catch (e) {
    try { localStorage.setItem(pk, '1'); } catch (x) { /* ignore */ }
  }
};
/** On a new device: read what was accepted before, and resend what could not be saved. */
let synced = '';
export const syncAccepted = async () => {
  const id = String(currentUser()?.id || '');
  if (!id || synced === id || !isLoggedIn() || !nativeFetch) return;
  synced = id;
  try {
    const r = await nativeFetch(`${apiBase()}/api/consent/feature`, { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) {
      const d = await r.json();
      Object.entries(d.accepted || {}).forEach(([f, v]) => { if (NOTICES[f] && NOTICES[f].version === v) remember(f); });
    }
  } catch (e) { /* offline: the notice is simply shown again */ }
  Object.keys(NOTICES).forEach((f) => {
    try { if (localStorage.getItem(`${keyOf(f)}:unsent`)) accept(f); } catch (e) { /* ignore */ }
  });
};

/* ---- asking (the ConsentGate component listens) ---- */
let asker = null;
const declined = new Set();
const pending = {};
export const setAsker = (fn) => { asker = fn; };
export const ask = (feature, force) => {
  if (hasAccepted(feature)) return Promise.resolve(true);
  if (!asker || (declined.has(feature) && !force)) return Promise.resolve(false);
  if (!pending[feature]) {
    pending[feature] = asker(feature).then((ok) => {
      delete pending[feature];
      if (ok) { declined.delete(feature); return accept(feature).then(() => true); }
      declined.add(feature);
      setTimeout(() => declined.delete(feature), 60000);   // background calls do not reopen the notice for a minute
      return false;
    });
  }
  return pending[feature];
};

/** AI calls made from any screen wait for the notice. Installed once. */
let installed = false;
export const installCallGuard = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  if (window.fetch) {
    const orig = window.fetch.bind(window);
    nativeFetch = orig;
    window.fetch = (input, init) => {
      const url = typeof input === 'string' ? input : input?.url;
      const need = noticeForCall(init?.method || input?.method, url);
      if (!need || !isLoggedIn() || hasAccepted(need)) return orig(input, init);
      return ask(need).then((ok) => {
        if (ok) return orig(input, init);
        throw new Error('You did not accept the notice for this feature.');
      });
    };
  }
  const X = window.XMLHttpRequest && window.XMLHttpRequest.prototype;
  if (X) {
    const open = X.open;
    const send = X.send;
    X.open = function guardedOpen(method, url, ...rest) {
      this.stpNotice = noticeForCall(method, url);
      return open.call(this, method, url, ...rest);
    };
    X.send = function guardedSend(body) {
      const need = this.stpNotice;
      if (!need || !isLoggedIn() || hasAccepted(need)) return send.call(this, body);
      const { timeout } = this;
      ask(need).then((ok) => {
        if (this.readyState !== 1) return;   // the page already cancelled it
        if (ok) { try { if (timeout) this.timeout = timeout; send.call(this, body); } catch (e) { this.dispatchEvent(new ProgressEvent('error')); } }
        else this.dispatchEvent(new ProgressEvent('error'));
      });
      return undefined;
    };
  }
};
