// Equipment register and QR safety tags (/api/equipment/*).
import api, { apiGet, apiPost, apiPut, apiDelete } from './api';
import { API_BASE } from './workplaceVoiceService';

export const eqErr = (e, fallback = 'Something went wrong') =>
  e?.response?.data?.error || e?.data?.error || e?.details?.error || e?.message || fallback;

const equipmentService = {
  meta: () => apiGet('/equipment/meta'),
  list: () => apiGet('/equipment'),
  get: (id) => apiGet(`/equipment/${Number(id)}`),
  save: (payload, id) => (id ? apiPut(`/equipment/${Number(id)}`, payload) : apiPost('/equipment', payload)),
  remove: (id) => apiDelete(`/equipment/${Number(id)}`),
  setStatus: (id, status, reason) => apiPost(`/equipment/${Number(id)}/status`, { status, reason }),
  inspect: (id, ref) => apiPost(`/equipment/${Number(id)}/inspect`, ref ? { ref } : {}),
  saveSettings: (payload) => apiPut('/equipment/settings', payload),
  scan: (token) => apiGet(`/equipment/scan/${encodeURIComponent(token)}`),
  // no login: plain fetch so a 401 does not send the visitor to the login page
  publicStatus: async (token) => {
    let res;
    try { res = await fetch(`${API_BASE}/equipment/public/${encodeURIComponent(token)}`, { credentials: 'omit' }); } catch (e) {
      const err = new Error('No connection. Check your internet and try again.'); err.network = true; throw err;
    }
    let body = null;
    try { body = await res.json(); } catch (e) { /* empty */ }
    if (!res.ok || !body?.success) { const err = new Error(body?.error || `Request failed (${res.status})`); err.status = res.status; err.login = !!body?.login_required; throw err; }
    return body;
  },
  tagsPdf: async (ids) => {
    const b = (await api.get(`/equipment/tags.pdf${ids?.length ? `?ids=${ids.map(Number).join(',')}` : ''}`, { responseType: 'blob' })).data;
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url; a.download = 'equipment_safety_tags.pdf';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },
};

export default equipmentService;
