// src/services/dashboardService.js
import api from './api';

// === AUTHENTICATION ===

// Login
export const apiLogin = async ({ email, password, userType = 'user' }) => {
  const res = await api.post('/auth/login', { email, password, user_type: userType });
  return res.data;
};

// Register
export const apiSignup = async (userData) => {
  const res = await api.post('/auth/register', userData);
  return res.data;
};

export const apiResendVerification = async ({ email }) => {
  const res = await api.post('/auth/resend-verification', { email });
  return res.data;
};

export const apiAdminRegister = async (adminData) => {
  const res = await api.post('/auth/admin/register', adminData);
  return res.data;
};

export const apiAdminLogin = async (credentials) => {
  const res = await api.post('/auth/admin/login', credentials);
  return res.data;
};

export const apiGetAdminDashboardStats = async () => {
  const res = await api.get('/admin/dashboard/stats');
  return res.data;
};

// Logout (frontend only)
export const apiLogout = async () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
};

// Get user profile
export const apiGetProfile = async () => {
  const res = await api.get('/user/profile');
  return res.data;
};

// Update user profile
export const apiUpdateProfile = async (profileData) => {
  const res = await api.put('/user/profile', profileData);
  return res.data;
};

// Forgot password
export const apiForgotPassword = async ({ email }) => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};

// Reset password
export const apiResetPassword = async ({ token, new_password }) => {
  const res = await api.post('/auth/reset-password', { token, new_password });
  return res.data;
};

// Email verification
export const apiVerifyEmail = async ({ email, code }) => {
  const res = await api.post('/auth/verify', { email, code });
  return res.data;
};

// Change password
export const apiChangePassword = async ({ current_password, new_password }) => {
  const res = await api.post('/user/change-password', { current_password, new_password });
  return res.data;
};

// ===== USER PROFILE METHODS =====

/**
 * Upload profile image
 */
export const uploadProfileImage = async (file, onProgress = null) => {
  const formData = new FormData();
  formData.append('profile_image', file);

  const res = await api.post('/user/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
  return res.data;
};

/**
 * Remove profile image
 */
export const removeProfileImage = async () => {
  const res = await api.delete('/user/profile/image');
  return res.data;
};

/**
 * Get user usage statistics
 */
export const getUserUsage = async () => {
  try {
    const res = await api.get('/user/usage');
    return res.data;
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return {
      uploads: { used: 0, total: 3 },
      apiCalls: { used: 0, total: 20 },
      teamMembers: { used: 1, total: 1 },
      storage: { used: 0, total: 100 },
      videoMinutes: { used: 0, total: 0 }
    };
  }
};

/**
 * Get quick statistics for dashboard
 */
export const getUserQuickStats = async () => {
  try {
    const res = await api.get('/user/quick-stats');
    return res.data;
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return {
      incidents: 0,
      documents: 0,
      tasks: 0,
      alerts: 0,
      team: 1,
      completion: 0
    };
  }
};

/**
 * Get current usage for the authenticated user
 */
export const getCurrentUsage = async () => {
  try {
    const res = await api.get('/usage/current');
    return res.data;
  } catch (error) {
    console.error('Error fetching current usage:', error);
    return {
      plan: 'free',
      period: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        reset_date: new Date().toISOString()
      },
      uploads: { used: 0, total: 3, remaining: 3, percentage: 0 },
      apiCalls: { used: 0, total: 20, remaining: 20, percentage: 0 },
      teamMembers: { used: 1, total: 1, remaining: 0, percentage: 100 },
      videoMinutes: { used: 0, total: 0, remaining: 0, percentage: 0 },
      aiRequests: { used: 0, total: 10, remaining: 10, percentage: 0 },
      storage: { used: 0, total: 100, unit: 'MB', remaining: 100, percentage: 0 },
      cameras: { used: 0, total: 1, remaining: 1, percentage: 0 }
    };
  }
};

/**
 * Get user activity log
 */
export const getUserActivity = async (page = 1, limit = 20) => {
  const res = await api.get('/user/activity', { params: { page, limit } });
  return res.data;
};

/**
 * Get user sessions
 */
export const getUserSessions = async () => {
  const res = await api.get('/user/sessions');
  return res.data;
};

/**
 * Terminate a session
 */
export const terminateSession = async (sessionId) => {
  const res = await api.delete(`/user/sessions/${sessionId}`);
  return res.data;
};

/**
 * Terminate all other sessions
 */
export const terminateOtherSessions = async () => {
  const res = await api.delete('/user/sessions/others');
  return res.data;
};

/**
 * Get user preferences
 */
export const getUserPreferences = async () => {
  const res = await api.get('/user/preferences');
  return res.data;
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (preferences) => {
  const res = await api.put('/user/preferences', preferences);
  return res.data;
};

// === USAGE & LIMITS ENDPOINTS ===

/**
 * Get usage history for charts
 */
export const getUsageHistory = async (timeframe = 'monthly') => {
  const res = await api.get('/usage/history', { params: { timeframe } });
  return res.data;
};

/**
 * Get billing information and invoice history
 */
export const getBillingInfo = async () => {
  const res = await api.get('/billing/info');
  return res.data;
};

/**
 * Get upcoming invoice
 */
export const getUpcomingInvoice = async () => {
  const res = await api.get('/billing/upcoming');
  return res.data;
};

/**
 * Get invoice history
 */
export const getInvoiceHistory = async (page = 1, limit = 10) => {
  const res = await api.get('/billing/invoices', { params: { page, limit } });
  return res.data;
};

/**
 * Download invoice PDF
 */
export const downloadInvoice = async (invoiceId) => {
  const response = await api.get(`/billing/invoices/${invoiceId}/download`, {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `invoice-${invoiceId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Update payment method
 */
export const updatePaymentMethod = async (paymentData) => {
  const res = await api.post('/billing/payment-method', paymentData);
  return res.data;
};

// === DASHBOARD ENDPOINTS ===

/**
 * Get dashboard statistics and summary data with consistent structure
 */
export const getDashboardStats = async () => {
  try {
    console.log('🔄 Fetching dashboard stats...');
    const res = await api.get('/dashboard/summary');
    console.log('✅ Dashboard stats response:', res.data);
    
    const responseData = res.data;
    
    // If API returns error
    if (!responseData.success) {
      console.warn('Dashboard API returned success: false', responseData.message);
      return getFallbackDashboardData();
    }
    
    const data = responseData.data || {};
    const stats = data.stats || {};
    const recentActivity = data.recent_activity || [];
    const systemHealth = data.system_health || {};
    const performance = data.performance || {};
    const storage = stats.storage || { used: 0, total: 100, percentage: 0 };
    
    // Map system health status
    const mapSystemStatus = (health) => {
      if (health === 'healthy' || health === 'online' || health === 'active') return 'online';
      if (health === 'degraded' || health === 'warning') return 'warning';
      if (health === 'offline' || health === 'down') return 'offline';
      return 'checking';
    };
    
    // Map storage status
    const mapStorageStatus = (status) => {
      if (status === 'normal' || status === 'healthy') return 'active';
      if (status === 'warning' || status === 'degraded') return 'warning';
      if (status === 'critical' || status === 'error') return 'offline';
      return 'checking';
    };
    
    // Map activity type
    const mapActivityType = (type) => {
      const typeMap = {
        'incident': 'incident',
        'document': 'document',
        'user': 'user',
        'task': 'task',
        'system': 'system',
        'ai': 'ai',
        'analysis': 'analysis',
        'environmental': 'environmental',
        'hospital': 'hospital',
        'hse': 'hse',
        'camera': 'camera',
        'video': 'video',
        'compliance': 'compliance'
      };
      return typeMap[type] || 'default';
    };
    
    // Map activity priority to status
    const mapActivityStatus = (priority) => {
      const statusMap = {
        'high': 'warning',
        'critical': 'error',
        'medium': 'warning',
        'low': 'success'
      };
      return statusMap[priority] || 'info';
    };
    
    // Calculate module stats
    const calculateModuleStats = (activities) => {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const modules = ['analysis', 'environmental', 'hospital', 'hse', 'documents', 'incidents', 'ai'];
      const result = {};
      modules.forEach(module => {
        const moduleActivities = activities.filter(a => mapActivityType(a.type) === module);
        result[module] = {
          total: moduleActivities.length,
          today: moduleActivities.filter(a => new Date(a.timestamp) >= today).length,
          week: moduleActivities.filter(a => new Date(a.timestamp) >= weekAgo).length
        };
      });
      return result;
    };
    
    const moduleStats = calculateModuleStats(recentActivity);
    
    // Return consistent data structure
    return {
      success: true,
      data: {
        // Core Stats
        stats: {
          incidents: stats.incidents || 0,
          documents: stats.documents || 0,
          users: stats.users || 0,
          tasks: stats.tasks?.pending || 0,
          compliance: parseFloat(performance.data_accuracy) || 92,
          risks: 0,
          hospitals: 0,
          departments: 0,
          patients: 0,
          beds: 0,
          storage: {
            used: storage.used || 0,
            total: storage.total || 100,
            percentage: storage.percentage || 0,
            status: mapStorageStatus(storage.status)
          }
        },
        
        // Trends
        trends: {
          incidents: { 
            value: recentActivity.filter(a => a.type === 'incident').length > 0 ? 5 : 0, 
            direction: recentActivity.filter(a => a.type === 'incident').length > 3 ? 'up' : 'stable' 
          },
          compliance: { value: 2, direction: 'up' },
          efficiency: { value: 8, direction: 'up' },
          ai: { value: 12, direction: 'up' }
        },
        
        // Recent Activity
        recentActivity: recentActivity.map(item => ({
          id: item.id || `activity_${Date.now()}`,
          type: mapActivityType(item.type),
          title: item.title || 'Activity',
          description: item.description || 'No description',
          timestamp: item.timestamp || new Date().toISOString(),
          status: mapActivityStatus(item.priority),
          metadata: {
            'ID': item.id,
            'Type': item.type,
            'Priority': item.priority || 'medium'
          },
          link: item.type === 'incident' ? `/incidents/${item.id}` : null
        })),
        
        // System Status
        systemStatus: {
          api: mapSystemStatus(systemHealth.api),
          database: mapSystemStatus(systemHealth.database),
          ai: mapSystemStatus(systemHealth.ai) || 'active',
          storage: mapStorageStatus(storage.status),
          camera: systemHealth.camera ? mapSystemStatus(systemHealth.camera) : 'checking',
          video: systemHealth.video ? mapSystemStatus(systemHealth.video) : 'checking',
          security: systemHealth.security ? mapSystemStatus(systemHealth.security) : 'online'
        },
        
        // Performance
        performance: {
          active_users: performance.active_users || 0,
          data_accuracy: performance.data_accuracy || '98.5%',
          response_time: performance.response_time || '125ms',
          uptime: performance.uptime || '99.8%'
        },
        
        // Module Statistics
        moduleStats: moduleStats,
        
        // Last Updated
        lastUpdated: data.last_updated || new Date().toISOString(),
        
        // System Health (raw)
        systemHealth: systemHealth
      }
    };
    
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    return getFallbackDashboardData();
  }
};

/**
 * Get fallback dashboard data when API fails
 */
const getFallbackDashboardData = () => {
  return {
    success: true,
    data: {
      stats: {
        incidents: 0,
        documents: 0,
        users: 0,
        tasks: 0,
        compliance: 0,
        risks: 0,
        hospitals: 0,
        departments: 0,
        patients: 0,
        beds: 0,
        storage: { used: 0, total: 100, percentage: 0, status: 'checking' }
      },
      trends: {
        incidents: { value: 0, direction: 'stable' },
        compliance: { value: 0, direction: 'stable' },
        efficiency: { value: 0, direction: 'stable' },
        ai: { value: 0, direction: 'stable' }
      },
      recentActivity: [],
      systemStatus: {
        api: 'checking',
        database: 'checking',
        ai: 'checking',
        storage: 'checking',
        camera: 'checking',
        video: 'checking',
        security: 'checking'
      },
      performance: {
        active_users: 0,
        data_accuracy: '0%',
        response_time: '0ms',
        uptime: '0%'
      },
      moduleStats: {
        analysis: { total: 0, today: 0, week: 0 },
        environmental: { total: 0, today: 0, week: 0 },
        hospital: { total: 0, today: 0, week: 0 },
        hse: { total: 0, today: 0, week: 0 },
        documents: { total: 0, today: 0, week: 0 },
        incidents: { total: 0, today: 0, week: 0 },
        ai: { total: 0, today: 0, week: 0 }
      },
      lastUpdated: new Date().toISOString(),
      systemHealth: {}
    }
  };
};


export const getAdminStats = async () => {
  try {
    const res = await api.get('/admin/dashboard/stats');
    return res.data;
  } catch (error) {
    throw createAPIError(error, { endpoint: 'admin/dashboard/stats', method: 'GET' });
  }
};


// Employee Dashboard
export const getEmployeeDashboard = async () => {
  const res = await api.get('/dashboard/employee');
  return res.data;
};

export const reportIncident = async (incidentData) => {
  const res = await api.post('/incidents/report', incidentData);
  return res.data;
};

export const getEmployeeTasks = async () => {
  const res = await api.get('/tasks/employee');
  return res.data;
};

// Professional User Dashboards
export const getUserDashboard = async (module) => {
  const res = await api.get(`/dashboard/${module}`);
  return res.data;
};

export const getModuleAnalytics = async (module, timeframe = 'monthly') => {
  const res = await api.get(`/analytics/${module}`, { params: { timeframe } });
  return res.data;
};

export const getModuleIncidents = async (module, filters = {}) => {
  const res = await api.get(`/incidents/${module}`, { params: filters });
  return res.data;
};

// Admin Dashboard
export const getAdminDashboard = async () => {
  const res = await api.get('/dashboard/admin');
  return res.data;
};

export const getPlatformUsers = async (filters = {}) => {
  const res = await api.get('/admin/users', { params: filters });
  return res.data;
};

export const getAllIncidents = async (filters = {}) => {
  const res = await api.get('/admin/incidents', { params: filters });
  return res.data;
};

export const getPlatformAnalytics = async () => {
  const res = await api.get('/admin/analytics');
  return res.data;
};

export const updateUserStatus = async (userId, status) => {
  const res = await api.put(`/admin/users/${userId}/status`, { status });
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/admin/users/${userId}`);
  return res.data;
};

// === AI SERVICES ===

export const generateAIDocument = async (prompt, template, module = null) => {
  const res = await api.post('/ai/documents/generate', {
    prompt,
    template,
    module
  });
  return res.data;
};

export const getAIDocumentHistory = async () => {
  const res = await api.get('/ai/documents/history');
  return res.data;
};

export const getAIInsights = async (module) => {
  const res = await api.get(`/ai/insights/${module}`);
  return res.data;
};

export const getAIServiceStatus = async () => {
  const res = await api.get('/ai/status');
  return res.data;
};

export const getAIServiceUsage = async () => {
  const res = await api.get('/ai/usage');
  return res.data;
};

export const cancelAITask = async (taskId) => {
  const res = await api.post(`/ai/tasks/${taskId}/cancel`);
  return res.data;
};

// === LIVE MONITORING ===

export const getCameraFeeds = async () => {
  const res = await api.get('/monitoring/cameras');
  return res.data;
};

export const getCameraFeed = async (cameraId) => {
  const res = await api.get(`/monitoring/cameras/${cameraId}`);
  return res.data;
};

export const startCameraFeed = async (cameraId) => {
  const res = await api.post(`/monitoring/cameras/${cameraId}/start`);
  return res.data;
};

export const stopCameraFeed = async (cameraId) => {
  const res = await api.post(`/monitoring/cameras/${cameraId}/stop`);
  return res.data;
};

export const getMonitoringAlerts = async (filters = {}) => {
  const res = await api.get('/monitoring/alerts', { params: filters });
  return res.data;
};

export const acknowledgeAlert = async (alertId) => {
  const res = await api.put(`/monitoring/alerts/${alertId}/acknowledge`);
  return res.data;
};

export const resolveAlert = async (alertId, resolution) => {
  const res = await api.put(`/monitoring/alerts/${alertId}/resolve`, { resolution });
  return res.data;
};

// === NOTIFICATIONS ===

export const getNotifications = async (unreadOnly = false) => {
  const res = await api.get('/notifications', { params: { unread_only: unreadOnly } });
  return res.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const res = await api.put(`/notifications/${notificationId}/read`);
  return res.data;
};

export const markAllNotificationsAsRead = async () => {
  const res = await api.put('/notifications/read-all');
  return res.data;
};

export const deleteNotification = async (notificationId) => {
  const res = await api.delete(`/notifications/${notificationId}`);
  return res.data;
};

export const getNotificationPreferences = async () => {
  const res = await api.get('/notifications/preferences');
  return res.data;
};

export const updateNotificationPreferences = async (preferences) => {
  const res = await api.put('/notifications/preferences', preferences);
  return res.data;
};

// === MODULE-SPECIFIC DATA ===

export const getHospitalData = async () => {
  const res = await api.get('/modules/hospital');
  return res.data;
};

export const getHSEData = async () => {
  const res = await api.get('/modules/hse');
  return res.data;
};

// Environmental Data
export const getEnvironmentalData = async () => {
  const res = await api.get('/environmental/air-quality/sensors');
  return res.data;
};

export const getAirQualityAlerts = async () => {
  const res = await api.get('/environmental/air-quality/alerts');
  return res.data;
};

export const getWaterSamples = async () => {
  const res = await api.get('/environmental/water-quality/samples');
  return res.data;
};

export const getWaterSampleDetails = async (sampleId) => {
  const res = await api.get(`/environmental/water-quality/samples/${sampleId}`);
  return res.data;
};

export const submitWaterSample = async (sampleData) => {
  const res = await api.post('/environmental/water-quality/samples', sampleData);
  return res.data;
};

export const getQualityData = async () => {
  const res = await api.get('/modules/quality');
  return res.data;
};

// Supply Chain
export const getSupplyChainData = async () => {
  const res = await api.get('/supplychain');
  return res.data;
};

export const getSupplierPerformance = async () => {
  const res = await api.get('/supplychain/suppliers/performance');
  return res.data;
};

export const getInventoryData = async () => {
  const res = await api.get('/supplychain/inventory');
  return res.data;
};

export const getPendingOrders = async () => {
  const res = await api.get('/supplychain/orders/pending');
  return res.data;
};

export const createPurchaseOrder = async (orderData) => {
  const res = await api.post('/supplychain/orders', orderData);
  return res.data;
};

export const updateInventory = async (inventoryData) => {
  const res = await api.put('/supplychain/inventory', inventoryData);
  return res.data;
};

export const getOrderHistory = async () => {
  const res = await api.get('/supplychain/orders/history');
  return res.data;
};

export const getOrderDetails = async (orderId) => {
  const res = await api.get(`/supplychain/orders/${orderId}`);
  return res.data;
};

export const cancelOrder = async (orderId) => {
  const res = await api.post(`/supplychain/orders/${orderId}/cancel`);
  return res.data;
};

// === FILE UPLOAD & STORAGE ===

export const uploadFile = async (file, folder = 'general', description = '', onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('description', description);

  const res = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
    timeout: 30000,
  });
  return res.data;
};

export const uploadMultipleFiles = async (files, folder = 'general', onProgress = null) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('folder', folder);

  const res = await api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
  return res.data;
};

export const getStorageStatus = async () => {
  const res = await api.get('/storage/status');
  return res.data;
};

export const getFileUrl = (filename) => {
  return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/files/${filename}`;
};

export const downloadFile = async (filename, originalFilename = null) => {
  const response = await api.get(`/files/${filename}`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', originalFilename || filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getUserFiles = async (filters = {}) => {
  const res = await api.get('/files', { params: filters });
  return res.data;
};

export const deleteFile = async (fileId) => {
  const res = await api.delete(`/files/${fileId}`);
  return res.data;
};

export const updateFileInfo = async (fileId, updates) => {
  const res = await api.put(`/files/${fileId}`, updates);
  return res.data;
};

export const getFileDetails = async (fileId) => {
  const res = await api.get(`/files/${fileId}`);
  return res.data;
};

export const createFolder = async (folderName, parentFolder = null) => {
  const res = await api.post('/files/folders', { name: folderName, parent: parentFolder });
  return res.data;
};

export const getFolders = async () => {
  const res = await api.get('/files/folders');
  return res.data;
};

// File validation utilities
export const fileUtils = {
  allowedFileTypes: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv', 'application/zip', 'application/x-rar-compressed',
    'video/mp4', 'video/mpeg', 'video/quicktime'
  ],

  allowedExtensions: [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf',
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.csv', '.zip', '.rar', '.mp4', '.mpg', '.mov'
  ],

  maxFileSize: 100 * 1024 * 1024, // 100MB

  validateFileType: (file) => {
    return fileUtils.allowedFileTypes.includes(file.type) || 
           fileUtils.allowedExtensions.some(ext => 
             file.name.toLowerCase().endsWith(ext)
           );
  },

  validateFileSize: (file, maxSizeMB = 100) => {
    const maxSize = maxSizeMB * 1024 * 1024;
    return file.size <= maxSize;
  },

  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  getFileIcon: (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const iconMap = {
      'pdf': 'file-pdf',
      'doc': 'file-word', 'docx': 'file-word',
      'xls': 'file-excel', 'xlsx': 'file-excel',
      'ppt': 'file-ppt', 'pptx': 'file-ppt',
      'jpg': 'file-image', 'jpeg': 'file-image', 'png': 'file-image', 'gif': 'file-image', 'webp': 'file-image',
      'txt': 'file-text',
      'csv': 'file-csv',
      'zip': 'file-zip', 'rar': 'file-zip',
      'mp4': 'file-video', 'mpg': 'file-video', 'mov': 'file-video'
    };
    return iconMap[extension] || 'file-unknown';
  },

  getFileTypeCategory: (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'document';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheet';
    if (['ppt', 'pptx'].includes(extension)) return 'presentation';
    if (['mp4', 'mpg', 'mov'].includes(extension)) return 'video';
    if (['zip', 'rar'].includes(extension)) return 'archive';
    if (['txt'].includes(extension)) return 'text';
    return 'other';
  }
};

// === ANALYTICS ===

export const getAnalyticsData = async (timeframe = 'monthly') => {
  const res = await api.get('/analytics', { params: { timeframe } });
  return res.data;
};

export const getAnalyticsExport = async (format = 'csv', timeframe = 'monthly') => {
  const response = await api.get('/analytics/export', {
    params: { format, timeframe },
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `analytics-export.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};


/**
 * Upload company logo
 */
export const uploadCompanyLogo = async (formData) => {
  try {
    const res = await api.post('/company/logo/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error uploading company logo:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to upload logo'
    };
  }
};

/**
 * Remove company logo
 */
export const removeCompanyLogo = async (companyId) => {
  try {
    const res = await api.delete(`/company/logo/${companyId}`);
    return res.data;
  } catch (error) {
    console.error('Error removing company logo:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to remove logo'
    };
  }
};

/**
 * Get company logo
 */
export const getCompanyLogo = async (companyId) => {
  try {
    const res = await api.get(`/company/logo/${companyId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching company logo:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch logo'
    };
  }
};


// === SEARCH ===

export const globalSearch = async (query, filters = {}) => {
  const res = await api.get('/search', { params: { q: query, ...filters } });
  return res.data;
};

export const getSearchSuggestions = async (query) => {
  const res = await api.get('/search/suggestions', { params: { q: query } });
  return res.data;
};

// === SETTINGS ===

export const getUserSettings = async () => {
  const res = await api.get('/user/settings');
  return res.data;
};

export const updateUserSettings = async (settings) => {
  const res = await api.put('/user/settings', settings);
  return res.data;
};

export const getCompanySettings = async () => {
  const res = await api.get('/company/settings');
  return res.data;
};

export const updateCompanySettings = async (settings) => {
  const res = await api.put('/company/settings', settings);
  return res.data;
};

/**
 * Get personal dashboard data
 * @returns {Promise} Personal dashboard data
 */
export const getMyDashboard = async () => {
  try {
    const res = await api.get('/dashboard/my');
    return res.data;
  } catch (error) {
    console.error('Error fetching personal dashboard:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch personal dashboard'
    };
  }
};

/**
 * Get team dashboard data
 * @returns {Promise} Team dashboard data
 */
export const getTeamDashboard = async () => {
  try {
    const res = await api.get('/dashboard/team');
    return res.data;
  } catch (error) {
    console.error('Error fetching team dashboard:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch team dashboard'
    };
  }
};



/**
 * Get user's recent activity
 * @param {Object} filters - Filter options
 * @returns {Promise} Recent activity data
 */
export const getRecentActivity = async (filters = {}) => {
  try {
    const res = await api.get('/dashboard/activity', { params: filters });
    return res.data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch recent activity'
    };
  }
};

/**
 * Get user's usage statistics
 * @returns {Promise} Usage statistics
 */
export const getUsageStats = async () => {
  try {
    const res = await api.get('/dashboard/usage-stats');
    return res.data;
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch usage stats'
    };
  }
};

/**
 * Get company overview (limited for employees)
 * @returns {Promise} Company overview data
 */
export const getCompanyOverview = async () => {
  try {
    const res = await api.get('/company/overview');
    return res.data;
  } catch (error) {
    console.error('Error fetching company overview:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to fetch company overview'
    };
  }
};

// === API STATUS ===

export const checkApiHealth = async () => {
  try {
    const res = await api.get('/health');
    return { status: 'online', data: res.data };
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
};

// === DASHBOARD SERVICE OBJECT ===

const dashboardService = {
  // Authentication
  apiLogin,
  apiSignup,
  apiLogout,
  apiGetProfile,
  apiUpdateProfile,
  apiForgotPassword,
  apiResetPassword,
  apiVerifyEmail,
  apiResendVerification,
  apiChangePassword,
  apiAdminRegister,
  apiAdminLogin,
  apiGetAdminDashboardStats,
  getMyDashboard,
  getTeamDashboard,
  getRecentActivity,
  getUsageStats,
  // User Profile
  uploadProfileImage,
  removeProfileImage,
  getUserUsage,
  getUserQuickStats,
  getCurrentUsage,
  getUserActivity,
  getUserSessions,
  terminateSession,
  terminateOtherSessions,
  getUserPreferences,
  updateUserPreferences,
  getCompanyOverview,
  
  // Usage & Limits
  getUsageHistory,
  getBillingInfo,
  getUpcomingInvoice,
  getInvoiceHistory,
  downloadInvoice,
  updatePaymentMethod,
  
  // Dashboard Features
  getDashboardStats,
  getEmployeeDashboard,
  reportIncident,
  getEmployeeTasks,
  getUserDashboard,
  getModuleAnalytics,
  getModuleIncidents,
  getAdminDashboard,
  getPlatformUsers,
  getAllIncidents,
  getPlatformAnalytics,
  updateUserStatus,
  deleteUser,
  
  // AI Services
  generateAIDocument,
  getAIDocumentHistory,
  getAIInsights,
  getAIServiceStatus,
  getAIServiceUsage,
  cancelAITask,
  
  // Monitoring
  getCameraFeeds,
  getCameraFeed,
  startCameraFeed,
  stopCameraFeed,
  getMonitoringAlerts,
  acknowledgeAlert,
  resolveAlert,
  
  // Notifications
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  
  // Module Data
  getHospitalData,
  getHSEData,
  getEnvironmentalData,
  getAirQualityAlerts,
  getWaterSamples,
  getWaterSampleDetails,
  submitWaterSample,
  getQualityData,
  
  // Supply Chain
  getSupplyChainData,
  getSupplierPerformance,
  getInventoryData,
  getPendingOrders,
  createPurchaseOrder,
  updateInventory,
  getOrderHistory,
  getOrderDetails,
  cancelOrder,
  
  // File Upload & Storage
  uploadFile,
 uploadMultipleFiles,
  getStorageStatus,
  getFileUrl,
  downloadFile,
  getUserFiles,
  deleteFile,
  updateFileInfo,
  getFileDetails,
  createFolder,
  getFolders,
  fileUtils,
  
  // Analytics
  getAnalyticsData,
  getAnalyticsExport,
  
  // Search
  globalSearch,
  getSearchSuggestions,
  
  // Settings
  getUserSettings,
  updateUserSettings,
  getCompanySettings,
  updateCompanySettings,
  
  // API Status
  checkApiHealth,
   uploadCompanyLogo,
  removeCompanyLogo,
  getCompanyLogo,
};

export default dashboardService;