// src/services/permitService.js — standard permit-to-work register
import api from './api';

const call = async (method, url, data, config = {}) => {
  const res = await api.request({ method, url, data, validateStatus: () => true, ...config });
  if (res.status >= 200 && res.status < 300 && res.data?.success !== false) return res.data;
  const err = new Error(res.data?.error || `Request failed (${res.status})`);
  err.status = res.status;
  throw err;
};

const permitService = {
  catalog: () => call('get', '/permit-types'),
  list: (params = {}) => call('get', '/work-permits', undefined, { params }),
  get: (id) => call('get', `/work-permits/${id}`),
  create: (data) => call('post', '/work-permits', data),
  update: (id, data) => call('put', `/work-permits/${id}`, data),
  preview: (id) => call('get', `/work-permits/${id}/preview`),
  generate: (id) => call('post', `/work-permits/${id}/generate`),
  setStatus: (id, action, notes) => call('post', `/work-permits/${id}/status`, { action, notes }),
  attach: (id, requirement, file) => {
    const fd = new FormData();
    fd.append('requirement', requirement);
    fd.append('file', file);
    return call('post', `/work-permits/${id}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  downloadDocument: async (documentId, filename) => {
    const res = await api.get(`/documents/${documentId}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `permit-${documentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  },
};

export default permitService;
