import api from './api';  // Changed from { api } to api

export const supplyChainService = {
  // Inventory
  getInventory: () => api.get('/supply-chain/inventory'),
  addInventoryItem: (data) => api.post('/supply-chain/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/supply-chain/inventory/${id}`, data),
  deleteInventoryItem: (id) => api.delete(`/supply-chain/inventory/${id}`),

  // Suppliers
  getSuppliers: () => api.get('/supply-chain/suppliers'),
  createSupplier: (data) => api.post('/supply-chain/suppliers', data),
  updateSupplier: (id, data) => api.put(`/supply-chain/suppliers/${id}`, data),

  // Transactions
  recordTransaction: (itemId, data) => api.post(`/supply-chain/inventory/${itemId}/transaction`, data),
  getTransactions: (params) => api.get('/supply-chain/transactions', { params }),

  // Alerts
  getAlerts: () => api.get('/supply-chain/inventory/alerts'),
  resolveAlert: (id) => api.patch(`/supply-chain/alerts/${id}/resolve`),

  // Reports
  getInventoryReport: (params) => api.get('/supply-chain/reports/inventory', { params })
};