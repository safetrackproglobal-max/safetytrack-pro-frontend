// src/services/submissionService.js
// Document submission & signing cycle: clients, invitations, signatures/stamps, submissions.
import api from './api';

// Turn any non-2xx answer into an Error carrying the server's friendly message.
const call = async (method, url, data, config = {}) => {
  const res = await api.request({ method, url, data, validateStatus: () => true, ...config });
  if (res.status >= 200 && res.status < 300 && res.data?.success !== false) return res.data;
  const err = new Error(res.data?.error || res.data?.message || `Request failed (${res.status})`);
  err.status = res.status;
  err.code = res.data?.code;
  throw err;
};

const submissionService = {
  // ---------- clients ----------
  listClients: () => call('get', '/clients'),
  createClient: (data) => call('post', '/clients', data),
  updateClient: (id, data) => call('put', `/clients/${id}`, data),
  inviteMember: (orgId, data) => call('post', `/clients/${orgId}/members`, data),
  resendInvite: (orgId, memberId) => call('post', `/clients/${orgId}/members/${memberId}/resend`),
  removeMember: (orgId, memberId) => call('delete', `/clients/${orgId}/members/${memberId}`),
  inviteInfo: (token) => call('get', `/client-invites/${encodeURIComponent(token)}`),
  acceptInvite: (data) => call('post', '/client-invites/accept', data),

  // ---------- signature / initials / stamp ----------
  listAssets: () => call('get', '/signing-assets'),
  createAsset: (data) => call('post', '/signing-assets', data),
  setDefaultAsset: (id) => call('post', `/signing-assets/${id}/default`),
  deleteAsset: (id) => call('delete', `/signing-assets/${id}`),
  // images are private: fetch with the auth header and turn into an object URL
  assetImageUrl: async (id) => {
    const res = await api.get(`/signing-assets/${id}/image`, { responseType: 'blob' });
    return URL.createObjectURL(res.data);
  },

  // ---------- submissions ----------
  signerOptions: () => call('get', '/submissions/signers'),
  create: (data) => call('post', '/submissions', data),
  list: (box, params = {}) => call('get', '/submissions', undefined, { params: { box, ...params } }),
  get: (id) => call('get', `/submissions/${id}`),
  act: (id, data) => call('post', `/submissions/${id}/act`, data),
  withdraw: (id) => call('post', `/submissions/${id}/withdraw`),
  remind: (id) => call('post', `/submissions/${id}/remind`),
  setApprovedList: (id, value) => call('post', `/submissions/${id}/approved-list`, { value }),
  fileBytes: async (id) => {
    const res = await api.get(`/submissions/${id}/file`, { responseType: 'arraybuffer' });
    return res.data;
  },
  download: async (id, filename) => {
    const res = await api.get(`/submissions/${id}/file`, { params: { download: 1 }, responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `submission-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  },
};

export default submissionService;
