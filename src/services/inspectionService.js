// Inspections & checklists (/api/inspections/*).
import api, { apiGet, apiPost, apiPut, apiDelete } from './api';

export const inspErr = (e, fallback = 'Something went wrong') =>
  e?.response?.data?.error || e?.data?.error || e?.details?.error || e?.message || fallback;

const blob = async (path) => (await api.get(path, { responseType: 'blob' })).data;

const inspectionService = {
  library: () => apiGet('/inspections/library'),
  saveTemplate: (payload, id) => (id ? apiPut(`/inspections/templates/${Number(id)}`, payload) : apiPost('/inspections/templates', payload)),
  archiveTemplate: (id) => apiDelete(`/inspections/templates/${Number(id)}`),
  list: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.set(k, v); });
    return apiGet(`/inspections${q.toString() ? `?${q}` : ''}`);
  },
  start: (payload) => apiPost('/inspections', payload),
  get: (id) => apiGet(`/inspections/${Number(id)}`),
  save: (id, payload) => apiPut(`/inspections/${Number(id)}`, payload),
  remove: (id) => apiDelete(`/inspections/${Number(id)}`),
  complete: (id, payload) => apiPost(`/inspections/${Number(id)}/complete`, payload),
  addPhoto: (id, itemId, file) => {
    const f = new FormData();
    if (itemId) f.append('item_id', itemId);
    f.append('file', file);
    return apiPost(`/inspections/${Number(id)}/photos`, f, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
  },
  removePhoto: (pid) => apiDelete(`/inspections/photos/${Number(pid)}`),
  photoUrl: async (pid) => URL.createObjectURL(await blob(`/inspections/photos/${Number(pid)}`)),
  downloadPdf: async (id, title) => {
    const b = await blob(`/inspections/${Number(id)}/pdf`);
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'inspection').replace(/[^A-Za-z0-9 _-]+/g, '').trim().replace(/\s+/g, '_') || 'inspection'}_${id}.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },
  schedules: (mine) => apiGet(`/inspections/schedules${mine ? '?mine=1' : ''}`),
  saveSchedule: (payload, id) => (id ? apiPut(`/inspections/schedules/${Number(id)}`, payload) : apiPost('/inspections/schedules', payload)),
  removeSchedule: (id) => apiDelete(`/inspections/schedules/${Number(id)}`),
  actions: (status = 'open', mine = false) => apiGet(`/inspections/actions?status=${encodeURIComponent(status)}${mine ? '&mine=1' : ''}`),
  updateAction: (id, payload) => apiPut(`/inspections/actions/${Number(id)}`, payload),
  stats: (days = 90) => apiGet(`/inspections/stats?days=${Number(days)}`),
  people: () => apiGet('/inspections/people'),
};

export default inspectionService;
