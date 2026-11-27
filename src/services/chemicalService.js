// Chemical safety (/api/chem/*): register, PubChem identification, compatibility, alerts, SDS and safety summary.
import api, { apiGet, apiPost, apiPut, apiDelete } from './api';

export const chemErr = (e, fallback = 'Something went wrong') =>
  e?.response?.data?.error || e?.data?.error || e?.details?.error || e?.message || fallback;

const saveBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};
const safe = (s) => (s || 'chemical').replace(/[^A-Za-z0-9 _-]+/g, '').trim().replace(/\s+/g, '_') || 'chemical';

const chemicalService = {
  groups: () => apiGet('/chem/groups'),
  lookup: (q) => apiGet(`/chem/lookup?q=${encodeURIComponent(q)}`),
  substance: (cid) => apiGet(`/chem/substance/${Number(cid)}`),
  items: (status) => apiGet(`/chem/items${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  save: (payload, id) => (id ? apiPut(`/chem/items/${Number(id)}`, payload) : apiPost('/chem/items', payload)),
  remove: (id) => apiDelete(`/chem/items/${Number(id)}`),
  tests: (id) => apiGet(`/chem/items/${Number(id)}/tests`),
  addTest: (id, payload) => apiPost(`/chem/items/${Number(id)}/tests`, payload),
  uploadSds: (id, file) => {
    const f = new FormData(); f.append('file', file);
    return apiPost(`/chem/items/${Number(id)}/sds`, f, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 90000 });
  },
  removeSds: (id) => apiDelete(`/chem/items/${Number(id)}/sds`),
  openSds: async (id) => {
    const b = (await api.get(`/chem/items/${Number(id)}/sds`, { responseType: 'blob' })).data;
    const url = URL.createObjectURL(b);
    const w = window.open(url, '_blank', 'noopener');
    if (!w) saveBlob(b, `sds_${id}.pdf`);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },
  summaryPdf: async (id, name) => saveBlob((await api.get(`/chem/items/${Number(id)}/summary.pdf`, { responseType: 'blob' })).data, `${safe(name)}_safety_summary.pdf`),
  compatibility: (payload) => apiPost('/chem/compatibility', payload),
  alerts: () => apiGet('/chem/alerts'),
  extract: (file, ai) => {
    const f = new FormData(); f.append('file', file); if (ai) f.append('ai', '1');
    return apiPost('/chem/extract', f, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 180000 });
  },
  waste: (status) => apiGet(`/chem/waste${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  saveWaste: (payload, id) => (id ? apiPut(`/chem/waste/${Number(id)}`, payload) : apiPost('/chem/waste', payload)),
  removeWaste: (id) => apiDelete(`/chem/waste/${Number(id)}`),
  folders: () => apiGet('/chem/folders'),
  standards: (country) => apiGet(`/chem/standards${country ? `?country=${encodeURIComponent(country)}` : ''}`),
};

export default chemicalService;
