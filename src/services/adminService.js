// src/services/adminService.js
import api, { API_ENDPOINTS, createAPIError, UnifiedAPIError, isSuperAdmin, handleAPIError } from './api';

// Helper function to handle API responses consistently with unified error handling
const handleAdminResponse = async (apiCall, context = {}) => {
  try {
    const response = await apiCall;
    return response;
  } catch (error) {
    // If it's already a UnifiedAPIError, re-throw it
    if (error instanceof UnifiedAPIError) {
      throw error;
    }
    // Create unified error with context
    const unifiedError = createAPIError(error, {
      endpoint: context.endpoint || 'admin',
      method: context.method || 'unknown'
    });
    throw unifiedError;
  }
};

// ==================== ADMIN AUTHENTICATION ====================

export const adminRegister = async (adminData) => {
  try {
    const res = await api.post(API_ENDPOINTS.ADMIN_REGISTER, adminData);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/register', method: 'POST' });
  }
};

export const adminLogin = async (credentials) => {
  try {
    const res = await api.post(API_ENDPOINTS.ADMIN_LOGIN, credentials);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/login', method: 'POST' });
  }
};



// ==================== ADMIN DASHBOARD ====================

export const getAdminDashboardStats = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.ADMIN_DASHBOARD_STATS);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/dashboard/stats', method: 'GET' });
  }
};

// ==================== EMPLOYEE MANAGEMENT ====================

export const getEmployees = async (filters = {}) => {
  try {
    const res = await api.get('/admin/employees', { params: filters });
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/employees', method: 'GET' });
  }
};

export const addEmployee = async (employeeData) => {
  try {
    const res = await api.post('/admin/employees', employeeData);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/employees', method: 'POST' });
  }
};

export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const res = await api.put(`/admin/employees/${employeeId}`, employeeData);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: `admin/employees/${employeeId}`, method: 'PUT' });
  }
};

export const deleteEmployee = async (employeeId) => {
  try {
    const res = await api.delete(`/admin/employees/${employeeId}`);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: `admin/employees/${employeeId}`, method: 'DELETE' });
  }
};

export const exportEmployees = async (format = 'excel') => {
  try {
    const res = await api.get('/admin/employees/export', {
      params: { format },
      responseType: 'blob'
    });
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/employees/export', method: 'GET' });
  }
};

// ==================== USER MANAGEMENT ====================

export const getUsers = async (params = {}) => {
  try {
    const res = await api.get(API_ENDPOINTS.ADMIN_USERS, { params });
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/users', method: 'GET' });
  }
};

export const addUser = async (userData) => {
  try {
    const res = await api.post('/admin/users', userData);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/users', method: 'POST' });
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const res = await api.put(`/admin/users/${userId}`, userData);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: `admin/users/${userId}`, method: 'PUT' });
  }
};

export const deleteUser = async (userId) => {
  try {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: `admin/users/${userId}`, method: 'DELETE' });
  }
};

// User Role & Status Management
export const updateUserRole = async (userId, role) => {
  try {
    const res = await api.put(`/admin/users/${userId}/role`, { role });
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: `admin/users/${userId}/role`, method: 'PUT' });
  }
};

export const updateUserStatus = async (userId, isActive) => {
  try {
    const res = await api.put(`/admin/users/${userId}/status`, { is_active: isActive });
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: `admin/users/${userId}/status`, method: 'PUT' });
  }
};

// ==================== ROLE & PERMISSION MANAGEMENT ====================

export const getRoles = async () => {
  try {
    const res = await api.get('/admin/roles');
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/roles', method: 'GET' });
  }
};

export const getPermissions = async () => {
  try {
    const res = await api.get('/admin/permissions');
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/permissions', method: 'GET' });
  }
};

export const savePermissions = async (permissions) => {
  try {
    const res = await api.post('/admin/permissions', { permissions });
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/permissions', method: 'POST' });
  }
};

// ==================== AUDIT LOGS ====================

export const getAuditLogs = async (params = {}) => {
  try {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/audit-logs', method: 'GET' });
  }
};

export const exportAuditLogs = async (format = 'csv', filters = {}) => {
  try {
    const res = await api.get('/admin/audit-logs/export', { 
      params: { format, ...filters },
      responseType: 'blob'
    });
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/audit-logs/export', method: 'GET' });
  }
};

// ==================== ADMIN APPROVALS ====================

export const getPendingApprovals = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.ADMIN_PENDING_APPROVALS);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/pending-approvals', method: 'GET' });
  }
};

export const approveAdmin = async (adminId) => {
  try {
    const res = await api.post(`${API_ENDPOINTS.ADMIN_APPROVE}/${adminId}`);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: `admin/approve/${adminId}`, method: 'POST' });
  }
};

// ==================== ANALYTICS ====================

export const getPlatformAnalytics = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.PLATFORM_ANALYTICS);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/analytics', method: 'GET' });
  }
};

export const getAdminUsers = async (params = {}) => {
  try {
    const res = await api.get(API_ENDPOINTS.ADMIN_USERS, { params });
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/users', method: 'GET' });
  }
};

export const updateAdminUser = async (userId, userData) => {
  try {
    const res = await api.put(`${API_ENDPOINTS.ADMIN_USERS}/${userId}`, userData);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: `admin/users/${userId}`, method: 'PUT' });
  }
};

export const getAdminAnalytics = async () => {
  try {
    const res = await api.get(API_ENDPOINTS.PLATFORM_ANALYTICS);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/analytics', method: 'GET' });
  }
};

// ==================== INCIDENTS MANAGEMENT ====================

export const getAdminIncidents = async (params = {}) => {
  try {
    const res = await api.get(API_ENDPOINTS.ADMIN_INCIDENTS, { params });
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/incidents', method: 'GET' });
  }
};

// ==================== SYSTEM SETTINGS ====================

export const getSystemSettings = async () => {
  try {
    const res = await api.get('/admin/settings');
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/settings', method: 'GET' });
  }
};

export const updateSystemSettings = async (settings) => {
  try {
    const res = await api.put('/admin/settings', settings);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/settings', method: 'PUT' });
  }
};

// ==================== BACKUP & RESTORE ====================

export const createBackup = async () => {
  try {
    const res = await api.post('/admin/backup');
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/backup', method: 'POST' });
  }
};

export const restoreBackup = async (backupFile) => {
  try {
    const formData = new FormData();
    formData.append('backup', backupFile);
    
    const res = await api.post('/admin/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/restore', method: 'POST' });
  }
};

// ==================== EMAIL TEMPLATES ====================

export const getEmailTemplates = async () => {
  try {
    const res = await api.get('/admin/email-templates');
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/email-templates', method: 'GET' });
  }
};

export const updateEmailTemplate = async (templateId, templateData) => {
  try {
    const res = await api.put(`/admin/email-templates/${templateId}`, templateData);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: `admin/email-templates/${templateId}`, method: 'PUT' });
  }
};

// ==================== NOTIFICATIONS ====================

export const sendBulkNotification = async (notificationData) => {
  try {
    const res = await api.post('/admin/notifications/bulk', notificationData);
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/notifications/bulk', method: 'POST' });
  }
};

// ==================== UTILITY: SAFE ADMIN CALL ====================

export const safeAdminCall = async (apiCall, ...args) => {
  try {
    const result = await apiCall(...args);
    return {
      success: true,
      data: result,
      error: null
    };
  } catch (error) {
    const unifiedError = error instanceof UnifiedAPIError ? error : createAPIError(error);
    return {
      success: false,
      data: null,
      error: unifiedError
    };
  }
};

// ==================== UTILITY: ADMIN CALL WITH RETRY ====================

export const adminCallWithRetry = async (apiCall, args, maxRetries = 3, delay = 1000) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall(...args);
      if (attempt > 1) {
        console.log(`Admin call retry successful on attempt ${attempt}`);
      }
      return {
        success: true,
        data: result,
        attempts: attempt,
        error: null
      };
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except for rate limiting
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        break;
      }
      
      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(2, attempt - 1);
        console.warn(`Admin call attempt ${attempt} failed, retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  const unifiedError = lastError instanceof UnifiedAPIError ? lastError : createAPIError(lastError);
  return {
    success: false,
    data: null,
    attempts: maxRetries,
    error: unifiedError
  };
};

// ==================== SUMMARY OF ALL EXPORTS ====================

export default {
  // Auth
  adminRegister,
  adminLogin,
  getAdminDashboardStats,
  
  // Employee Management
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  exportEmployees,
  
  // User Management
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  updateUserRole,
  updateUserStatus,
  
  // Role & Permissions
  getRoles,
  getPermissions,
  savePermissions,
  
  // Audit Logs
  getAuditLogs,
  exportAuditLogs,
  
  // Admin Approvals
  getPendingApprovals,
  approveAdmin,
  
  // Analytics
  getPlatformAnalytics,
  getAdminUsers,
  updateAdminUser,
  getAdminAnalytics,
  
  // Incidents
  getAdminIncidents,
  
  // System Settings
  getSystemSettings,
  updateSystemSettings,
  
  // Backup
  createBackup,
  restoreBackup,
  
  // Email
  getEmailTemplates,
  updateEmailTemplate,
  
  // Notifications
  sendBulkNotification,
  
  // Utilities
  safeAdminCall,
  adminCallWithRetry
};