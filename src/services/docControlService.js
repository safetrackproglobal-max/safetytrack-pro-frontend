// Document control plus (/api/doc-control/*): required reading, controlled copies, QR codes, change requests.
import api, { apiGet, apiPost } from './api';

export const errorText = (e, fallback = 'Something went wrong') =>
  e?.response?.data?.error || e?.data?.error || e?.details?.error || e?.message || fallback;

const saveBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

const docControlService = {
  people: () => apiGet('/doc-control/people'),
  // required reading
  assignReading: (payload) => apiPost('/doc-control/read-requests', payload),
  readRequests: (documentId) => apiGet(`/doc-control/read-requests${documentId ? `?document_id=${Number(documentId)}` : ''}`),
  readRequest: (id) => apiGet(`/doc-control/read-requests/${Number(id)}`),
  remind: (id) => apiPost(`/doc-control/read-requests/${Number(id)}/remind`, {}),
  myReading: () => apiGet('/doc-control/my-reading'),
  acknowledge: (assignmentId, answers) => apiPost(`/doc-control/my-reading/${Number(assignmentId)}/acknowledge`, { confirm: true, answers }),
  // controlled copies
  copies: (documentId) => apiGet(`/doc-control/documents/${Number(documentId)}/controlled-copies`),
  copyRegister: () => apiGet('/doc-control/controlled-copies'),
  issueCopy: (documentId, payload) => apiPost(`/doc-control/documents/${Number(documentId)}/controlled-copies`, payload),
  withdrawCopy: (copyId, note) => apiPost(`/doc-control/controlled-copies/${Number(copyId)}/withdraw`, { note }),
  downloadCopy: async (copyId, name) => {
    const res = await api.get(`/doc-control/controlled-copies/${Number(copyId)}/pdf`, { responseType: 'blob', timeout: 180000 });
    saveBlob(res.data, name || `controlled-copy-${copyId}.pdf`);
  },
  // QR codes
  qr: (documentId) => apiGet(`/doc-control/documents/${Number(documentId)}/qr`),
  qrImage: async (documentId) => {
    const res = await api.get(`/doc-control/documents/${Number(documentId)}/qr?format=png`, { responseType: 'blob' });
    return URL.createObjectURL(res.data);
  },
  resolveQr: (token) => apiGet(`/doc-control/qr/${encodeURIComponent(token)}`),
  // change requests
  changeRequests: (params = {}) => apiGet(`/doc-control/change-requests?${new URLSearchParams(params).toString()}`),
  createChangeRequest: (payload) => apiPost('/doc-control/change-requests', payload),
  decide: (id, decision, note) => apiPost(`/doc-control/change-requests/${Number(id)}/decide`, { decision, note }),
};

export default docControlService;
