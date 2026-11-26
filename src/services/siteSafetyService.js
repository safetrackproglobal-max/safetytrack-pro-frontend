// Evacuation roll call (/api/muster/*) and contractor management (/api/contractors/*).
import api, { apiGet, apiPost, apiPut, apiDelete } from './api';

export const errorText = (e, fallback = 'Something went wrong') =>
  e?.response?.data?.error || e?.data?.error || e?.details?.error || e?.message || fallback;

export const musterService = {
  current: () => apiGet('/muster/current'),
  start: (payload) => apiPost('/muster', payload),
  me: (id, status, note) => apiPost(`/muster/${Number(id)}/me`, { status, note }),
  mark: (id, payload) => apiPost(`/muster/${Number(id)}/mark`, payload),
  get: (id) => apiGet(`/muster/${Number(id)}`),
  close: (id, note) => apiPost(`/muster/${Number(id)}/close`, { note }),
  history: () => apiGet('/muster/history'),
};

export const contractorService = {
  list: () => apiGet('/contractors'),
  create: (payload) => apiPost('/contractors', payload),
  get: (id) => apiGet(`/contractors/${Number(id)}`),
  update: (id, payload) => apiPut(`/contractors/${Number(id)}`, payload),
  setStatus: (id, status) => apiPost(`/contractors/${Number(id)}/status`, { status }),
  addWorker: (id, payload) => apiPost(`/contractors/${Number(id)}/workers`, payload),
  updateWorker: (id, wid, payload) => apiPut(`/contractors/${Number(id)}/workers/${Number(wid)}`, payload),
  addDoc: (id, form) => apiPost(`/contractors/${Number(id)}/docs`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  removeDoc: (did) => apiDelete(`/contractors/docs/${Number(did)}`),
  openDoc: async (did) => {
    const res = await api.get(`/contractors/docs/${Number(did)}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const w = window.open(url, '_blank', 'noopener');
    if (!w) {
      const a = document.createElement('a');
      a.href = url; a.download = `document-${did}`; a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },
  gate: (q) => apiGet(`/contractors/gate?q=${encodeURIComponent(q)}`),
};
