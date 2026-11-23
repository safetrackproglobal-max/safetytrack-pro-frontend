// Workplace Voice: public (no login) worker reporting + company inbox / setup.
import { apiGet, apiPost, apiPut, apiDelete } from './api';

// Public calls use fetch directly: no auth header, no login redirect on 401.
const isDevelopment = process.env.NODE_ENV !== 'production';
export const API_BASE = (process.env.REACT_APP_API_URL
  || (isDevelopment ? 'http://localhost:5000/api' : 'https://safetrackproglobal-backend-production.up.railway.app/api')).replace(/\/$/, '');
export const SERVER_BASE = API_BASE.replace(/\/api$/, '');

const publicFetch = async (path, options = {}) => {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { credentials: 'omit', ...options });
  } catch (e) {
    const err = new Error('No connection. Check your internet and try again.');
    err.network = true;
    throw err;
  }
  let body = null;
  try { body = await res.json(); } catch (e) { /* empty */ }
  if (!res.ok || !body?.success) {
    const err = new Error(body?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
};

export const voicePublic = {
  directory: (q) => publicFetch(`/voice/public/directory?q=${encodeURIComponent(q)}`),
  channel: (slug, projectId) => publicFetch(`/voice/public/c/${encodeURIComponent(slug)}${projectId ? `?p=${encodeURIComponent(projectId)}` : ''}`),
  submit: (slug, formData) => publicFetch(`/voice/public/c/${encodeURIComponent(slug)}/report`, { method: 'POST', body: formData }),
  track: (code) => publicFetch(`/voice/public/track/${encodeURIComponent(code)}`),
  impact: (slug) => publicFetch(`/voice/public/c/${encodeURIComponent(slug)}/impact`),
  wallet: (rewardCode, pin) => publicFetch('/voice/public/rewards/me', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reward_code: rewardCode, pin }),
  }),
  reply: (code, text) => publicFetch(`/voice/public/track/${encodeURIComponent(code)}/reply`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
  }),
};

const qs = (params = {}) => {
  const p = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return p.length ? `?${p.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}` : '';
};

const voiceService = {
  settings: () => apiGet('/voice/settings'),
  saveSettings: (data) => apiPut('/voice/settings', data),
  addRoute: (data) => apiPost('/voice/routes', data),
  deleteRoute: (id) => apiDelete(`/voice/routes/${Number(id)}`),
  createProject: (data) => apiPost('/voice/projects', data),
  reports: (params) => apiGet(`/voice/reports${qs(params)}`),
  report: (id) => apiGet(`/voice/reports/${Number(id)}`),
  media: (id, idx) => apiGet(`/voice/reports/${Number(id)}/media/${Number(idx)}`, { responseType: 'blob' }),
  update: (id, data) => apiPost(`/voice/reports/${Number(id)}/update`, data),
  toolboxTalk: (id, data = {}) => apiPost(`/voice/reports/${Number(id)}/toolbox-talk`, data),
  correctiveAction: (id, data) => apiPost(`/voice/reports/${Number(id)}/corrective-action`, data),
  reprocess: (id) => apiPost(`/voice/reports/${Number(id)}/reprocess`, {}),
  stats: (days = 30) => apiGet(`/voice/stats?days=${Number(days)}`),
  reward: (id, kinds, note) => apiPost(`/voice/reports/${Number(id)}/reward`, { kinds, note }),
  rewards: () => apiGet('/voice/rewards'),
  redeem: (data) => apiPost('/voice/rewards/redeem', data),
};

// Our own domain: the worker portal always lives at <this site>/voice
export const portalBase = () => `${window.location.origin}/voice`;

export const voiceErr = (e, fallback = 'Something went wrong') =>
  e?.data?.error || e?.response?.data?.error || e?.message || fallback;

export const GROUP_META = {
  safety: { emoji: '⚠️', color: '#fa541c' },
  environmental: { emoji: '🌿', color: '#52c41a' },
  welfare: { emoji: '💧', color: '#1677ff' },
  ethics: { emoji: '🛡️', color: '#722ed1' },
  suggestions: { emoji: '💡', color: '#faad14' },
};

export const CATEGORY_META = {
  hazard: ['⚠️', 'Hazard'], near_miss: ['😮', 'Near miss'], unsafe_act: ['🚫', 'Unsafe act'], unsafe_condition: ['🚧', 'Unsafe condition'],
  ppe_violation: ['⛑️', 'PPE missing'], ptw_violation: ['📝', 'Permit to work'], equipment_defect: ['🔧', 'Broken equipment'],
  spill: ['🛢️', 'Spill'], waste: ['🗑️', 'Waste'], pollution: ['🏭', 'Pollution'], water_contamination: ['🚱', 'Water contamination'],
  chemical_storage: ['🧪', 'Chemical storage'], environmental_observation: ['🌿', 'Environmental observation'],
  heat_stress: ['🥵', 'Heat stress'], drinking_water: ['🚰', 'Drinking water'], accommodation: ['🛏️', 'Camp / accommodation'],
  fatigue: ['😴', 'Fatigue'], hygiene: ['🧼', 'Hygiene / toilets'],
  retaliation: ['😠', 'Retaliation'], supervisor_pressure: ['⏱️', 'Pressure to work unsafely'], safety_suppression: ['🤐', 'Told not to report'],
  harassment: ['🙅', 'Harassment'], unsafe_instructions: ['📢', 'Unsafe instructions'],
  safety_idea: ['💡', 'Safety idea'], environmental_idea: ['♻️', 'Environmental idea'], cost_saving: ['💰', 'Cost saving'], innovation: ['🚀', 'Innovation'],
  not_sure: ['❔', 'Not sure'],
};

export default voiceService;
