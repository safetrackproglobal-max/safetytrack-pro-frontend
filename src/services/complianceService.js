import api from './api';  // Changed from { api } to api

export const complianceService = {
  // Policies
  getPolicies: () => api.get('/compliance/policies'),
  createPolicy: (data) => api.post('/compliance/policies', data),
  updatePolicy: (id, data) => api.put(`/compliance/policies/${id}`, data),
  deletePolicy: (id) => api.delete(`/compliance/policies/${id}`),

  // Checklists
  getChecklists: () => api.get('/compliance/checklists'),
  createChecklist: (data) => api.post('/compliance/checklists', data),
  submitChecklistResponse: (checklistId, data) => api.post(`/compliance/checklists/${checklistId}/response`, data),

  // Audit Findings
  getFindings: () => api.get('/compliance/audit-findings'),
  createFinding: (data) => api.post('/compliance/audit-findings', data),
  updateFinding: (id, data) => api.put(`/compliance/audit-findings/${id}`, data),
  resolveFinding: (id, data) => api.patch(`/compliance/audit-findings/${id}/resolve`, data),

  // Analytics
  getComplianceScore: (departmentId) => api.get(`/compliance/department/${departmentId}/score`),
  getUpcomingReviews: () => api.get('/compliance/upcoming-reviews')
};