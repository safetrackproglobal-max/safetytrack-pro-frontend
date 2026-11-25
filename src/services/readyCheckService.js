// Ready Check: pre-task life-saving controls, stop work, lone-worker timer (backend: /api/ready-check/*).
// Checks made without signal are kept on the phone and sent when the connection returns.
import { apiGet, apiPost } from './api';

const uid = () => {
  try { return String(JSON.parse(localStorage.getItem('user') || '{}').id || '0'); } catch (e) { return '0'; }
};
const qKey = () => `rc:queue:${uid()}`;
const TASKS_KEY = 'rc:tasks';
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

export const isOffline = (e) => Boolean(e?.isNetworkError || e?.isTimeoutError || (typeof navigator !== 'undefined' && navigator.onLine === false));
export const errorText = (e, fallback = 'Something went wrong') =>
  e?.response?.data?.error || e?.data?.error || e?.details?.error || e?.message || fallback;
export const newId = () => `rc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
export const queued = () => read(qKey(), []);

let flushing = null;

const readyCheckService = {
  tasks: async () => {
    try {
      const res = await apiGet('/ready-check/tasks');
      write(TASKS_KEY, res.data);
      return { data: res.data, cached: false };
    } catch (e) {
      const c = read(TASKS_KEY, null);
      if (c && isOffline(e)) return { data: c, cached: true };
      throw e;
    }
  },
  lessons: (key) => apiGet(`/ready-check/lessons/${encodeURIComponent(key)}`),
  submit: (payload) => apiPost('/ready-check', payload, { timeout: 20000 }),
  queue: (payload) => {
    const q = queued();
    if (q.some((x) => x.client_id === payload.client_id)) return true;
    return write(qKey(), [...q, payload]);
  },
  // sends every saved check once; the server ignores one it already has
  flush: () => {
    if (flushing) return flushing;
    flushing = (async () => {
      const out = { sent: 0, rejected: [] };
      for (const p of queued()) {
        try {
          await apiPost('/ready-check', p, { timeout: 20000 });
          out.sent += 1;
        } catch (e) {
          if (![400, 409, 422].includes(e?.status)) break;       // keep it and try again later
          out.rejected.push(errorText(e));
        }
        write(qKey(), queued().filter((x) => x.client_id !== p.client_id));
      }
      return out;
    })().finally(() => { flushing = null; });
    return flushing;
  },
  mine: () => apiGet('/ready-check/mine'),
  board: () => apiGet('/ready-check/board'),
  extend: (id, minutes) => apiPost(`/ready-check/${Number(id)}/extend`, { minutes }),
  finish: (id, note) => apiPost(`/ready-check/${Number(id)}/finish`, note ? { note } : {}),
  release: (id, note) => apiPost(`/ready-check/${Number(id)}/release`, { note }),
};

export default readyCheckService;
