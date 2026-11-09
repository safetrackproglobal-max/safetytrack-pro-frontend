// src/services/safetyproservice.js
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './api.js';

class SafetyProService {
  // ============== SAFETYPRO DASHBOARD ==============

  static async getSafetyProDashboard() {
    try {
      const response = await apiGet('/safetypro/dashboard');
      return response;
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      return { error: error.message };
    }
  }

  static async getPendingApprovals(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await apiGet(`/safetypro/pending?${params}`);
      return response;
    } catch (error) {
      console.error('Pending approvals fetch error:', error);
      return { error: error.message };
    }
  }

  static async getApprovalStats() {
    try {
      const response = await apiGet('/safetypro/stats');
      return response;
    } catch (error) {
      console.error('Stats fetch error:', error);
      return { error: error.message };
    }
  }

  static async approveUser(userId, data = {}) {
    return apiPost(`/safetypro/approve/${userId}`, data);
  }

  static async rejectUser(userId, data = {}) {
    return apiPost(`/safetypro/reject/${userId}`, data);
  }

  static async bulkAction(userIds, action, data = {}) {
    return apiPost('/safetypro/bulk-action', {
      user_ids: userIds,
      action: action,
      ...data
    });
  }

  // ============== BULK OPERATIONS ==============
  
  static async bulkOperation(payload) {
    try {
      const response = await apiPost('/safetypro/bulk-operation', payload);
      return response;
    } catch (error) {
      console.error('Bulk operation error:', error);
      return { error: error.message };
    }
  }

  // ============== USER DETAILS ==============
  
  static async getUserDetails(userId) {
    try {
      const response = await apiGet(`/safetypro/user/${userId}`);
      return response;
    } catch (error) {
      console.error('User details fetch error:', error);
      return { error: error.message };
    }
  }

  // ============== USER UPGRADE & DOWNGRADE ==============
  
  static async upgradeUserPlan(payload) {
    try {
      const response = await apiPost('/safetypro/user/upgrade', payload);
      return response;
    } catch (error) {
      console.error('Upgrade user error:', error);
      return { error: error.message };
    }
  }

  static async downgradeUserPlan(userId) {
    try {
      const response = await apiPost(`/safetypro/user/${userId}/downgrade`);
      return response;
    } catch (error) {
      console.error('Downgrade user error:', error);
      return { error: error.message };
    }
  }

  // ============== USER SUSPENSION & ACTIVATION ==============
  
  static async suspendUser(userId) {
    try {
      const response = await apiPost(`/safetypro/user/${userId}/suspend`);
      return response;
    } catch (error) {
      console.error('Suspend user error:', error);
      return { error: error.message };
    }
  }

  static async activateUser(userId) {
    try {
      const response = await apiPost(`/safetypro/user/${userId}/activate`);
      return response;
    } catch (error) {
      console.error('Activate user error:', error);
      return { error: error.message };
    }
  }

  static async blockUser(userId) {
    try {
      const response = await apiPost(`/safetypro/user/${userId}/block`);
      return response;
    } catch (error) {
      console.error('Block user error:', error);
      return { error: error.message };
    }
  }

  // ============== SYSTEM HEALTH ==============
  
  static async getSystemHealth() {
    try {
      const response = await apiGet('/admin/system/health');
      console.log('🔍 [Service] Raw Health Response:', response);
      return response;
    } catch (error) {
      console.error('System health error:', error);
      return { error: error.message };
    }
  }

  // ============== TEAM NOTIFICATION ==============
  
  static async notifyTeam(message) {
    try {
      const response = await apiPost('/safetypro/notify-team', { message });
      return response;
    } catch (error) {
      console.error('Notify team error:', error);
      return { error: error.message };
    }
  }

  // ============== GET SAFETYPRO DASHBOARD DATA ==============
  
  static async getSafetyProDashboardData() {
    try {
      const response = await apiGet('/safetypro/dashboard-data');
      return response;
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      return { error: error.message };
    }
  }

  // ============== GET RECENT ACTIVITY ==============
  
  static async getRecentActivity(limit = 10) {
    try {
      const response = await apiGet(`/safetypro/recent-activity?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Recent activity fetch error:', error);
      return { error: error.message };
    }
  }

  // ============== GET PLAN DISTRIBUTION ==============
  
  static async getPlanDistribution() {
    try {
      const response = await apiGet('/safetypro/plan-distribution');
      return response;
    } catch (error) {
      console.error('Plan distribution fetch error:', error);
      return { error: error.message, data: { plan_distribution: {} } };
    }
  }

  // ============== GET USER GROWTH METRICS ==============
  
  static async getUserGrowthMetrics(period = 'month') {
    try {
      const response = await apiGet(`/safetypro/user-growth?period=${period}`);
      return response;
    } catch (error) {
      console.error('User growth metrics fetch error:', error);
      return { error: error.message };
    }
  }

  // ============== GET REVENUE METRICS ==============
  
  static async getRevenueMetrics(period = 'month') {
    try {
      const response = await apiGet(`/safetypro/revenue?period=${period}`);
      return response;
    } catch (error) {
      console.error('Revenue metrics fetch error:', error);
      return { error: error.message };
    }
  }

  // ============== MANUAL USER CREATION ==============

  static async createManualUser(userData) {
    try {
      const response = await apiPost('/admin/users/manual-create', userData);
      return response;
    } catch (error) {
      console.error('Create manual user error:', error);
      return { error: error.message };
    }
  }

  static async bulkCreateUsersFromCSV(csvFile) {
    const formData = new FormData();
    formData.append('file', csvFile);
    return apiUpload('/admin/users/manual-create/bulk', formData);
  }

  static async getRecentlyCreatedUsers(limit = 50) {
    const params = new URLSearchParams({ limit }).toString();
    return apiGet(`/admin/users/recently-created?${params}`);
  }

  static async resendWelcomeEmail(userId) {
    return apiPost(`/admin/users/${userId}/resend-welcome`);
  }

  static async resetUserPassword(userId) {
    return apiPost(`/admin/users/${userId}/reset-password`);
  }

  static async getUserCreationStats(timeRange = '30d') {
    const params = new URLSearchParams({ timeRange }).toString();
    return apiGet(`/admin/users/creation-stats?${params}`);
  }

  // ============== PERFORMANCE ANALYTICS ==============

  static async getPerformanceOverview(days = 30) {
    return apiGet(`/performance/overview?days=${days}`);
  }

  static async getMonthlyPerformance(months = 12) {
    return apiGet(`/performance/monthly?months=${months}`);
  }

  static async getEngagementMetrics(days = 30) {
    return apiGet(`/performance/engagement?days=${days}`);
  }

  static async getUserPerformance(userId, days = 30) {
    return apiGet(`/user/performance/${userId}?days=${days}`);
  }

  static async getAdminUserAnalytics(userId, days = 30) {
    return apiGet(`/admin/analytics/user/${userId}?days=${days}`);
  }

  // ============== CSV & BULK OPERATIONS ==============

  static async downloadUserCSVTemplate() {
    return apiGet('/admin/users/csv-template', {
      responseType: 'blob'
    });
  }

  static async validateCSVFile(formData) {
    return apiUpload('/admin/users/validate-csv', formData);
  }

  static async getBulkOperationStatus(operationId) {
    return apiGet(`/admin/operations/${operationId}/status`);
  }

  // ============== COMMAND CENTER ==============

  static async getPlatformActivity(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await apiGet(`/admin/activity?${params}`);
      console.log('🔍 [Service] Raw Activity Response:', response);
      return response;
    } catch (error) {
      console.error('Platform activity error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  static async logPlatformActivity(data) {
    try {
      return await apiPost('/admin/activity', data);
    } catch (error) {
      console.error('Log activity error:', error);
      return { success: false, error: error.message };
    }
  }

  static async getSecurityEvents() {
    try {
      return await apiGet('/admin/activity/security-events');
    } catch (error) {
      console.error('Security events error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  static async getActivityChart(days = 7) {
    try {
      const response = await apiGet(`/admin/activity/chart?days=${days}`);
      console.log('🔍 [Service] Raw Chart Response:', response);
      return response;
    } catch (error) {
      console.error('Activity chart error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  static async getActiveSessions() {
    try {
      const response = await apiGet('/admin/activity/sessions');
      console.log('🔍 [Service] Raw Sessions Response:', response);
      return response;
    } catch (error) {
      console.error('Active sessions error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  static async getTopActiveUsers(days = 7) {
    try {
      const response = await apiGet(`/admin/activity/top-users?days=${days}`);
      console.log('🔍 [Service] Raw Top Users Response:', response);
      return response;
    } catch (error) {
      console.error('Top users error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  static async getRecentErrors() {
    try {
      const response = await apiGet('/admin/activity/errors');
      console.log('🔍 [Service] Raw Errors Response:', response);
      return response;
    } catch (error) {
      console.error('Recent errors error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  static async getGeographicDistribution(days = 30) {
    try {
      return await apiGet(`/admin/activity/geographic?days=${days}`);
    } catch (error) {
      console.error('Geographic error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // ============== USER MANAGEMENT ==============

  static async getAllUsers(filters = {}) {
    try {
      console.log('📊 Calling /admin/users/all with filters:', filters);
      
      const params = new URLSearchParams({
        page: filters.page || 1,
        per_page: filters.per_page || 100,
        user_type: filters.user_type || 'all',
        plan: filters.plan || 'all',
        status: filters.status || 'all',
        search: filters.search || '',
        company: filters.company || '',
        country: filters.country || '',
        sort_by: filters.sort_by || 'created_at',
        sort_order: filters.sort_order || 'desc'
      }).toString();
      
      const response = await apiGet(`/admin/users/all?${params}`);
      console.log('📊 getAllUsers raw response:', response);
      
      let users = [];
      
      if (response && response.data) {
        if (response.data.users && Array.isArray(response.data.users)) {
          users = response.data.users;
        } else if (response.data.data && response.data.data.users) {
          users = response.data.data.users;
        }
      }
      
      if (users.length === 0 && response && response.users && Array.isArray(response.users)) {
        users = response.users;
      }
      
      if (users.length === 0 && Array.isArray(response)) {
        users = response;
      }
      
      if (users.length === 0 && response && Array.isArray(response.data)) {
        users = response.data;
      }
      
      console.log(`📊 Total users extracted: ${users.length}`);
      
      return {
        success: true,
        users: users,
        total: users.length,
        pagination: response?.data?.pagination || response?.pagination || null
      };
      
    } catch (error) {
      console.error('❌ Get all users error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch users', 
        users: [] 
      };
    }
  }

  static async createUser(userData) {
    return apiPost('/admin/users/create', userData);
  }

  static async deleteUser(userId) {
    try {
      const response = await apiDelete(`/safetypro/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Delete user error:', error);
      return { error: error.message };
    }
  }

  static async getCompanyUsers(companyName, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: filters.page || 1,
        per_page: filters.per_page || 50,
        status: filters.status || 'all'
      }).toString();
      
      const response = await apiGet(`/admin/users/company/${encodeURIComponent(companyName)}?${params}`);
      console.log('📊 getCompanyUsers response:', response);
      
      if (response && response.success) {
        return {
          success: true,
          users: response.data?.users || [],
          company: response.data?.company,
          pagination: response.data?.pagination
        };
      }
      
      return { success: true, users: [] };
    } catch (error) {
      console.error('Get company users error:', error);
      return { success: false, error: error.message, users: [] };
    }
  }

  static async updateUser(userId, userData) {
    return apiPut(`/admin/users/${userId}`, userData);
  }

  static async bulkImportUsers(users) {
    return apiPost('/admin/users/import', { users });
  }

  // ============== ADMIN REGISTRATION & SETUP ==============

  static async registerAdmin(adminData) {
    return apiPost('/admin/register', adminData);
  }

  static async setupSuperAdmin(adminData, secretKey) {
    const headers = {
      'X-Setup-Key': secretKey
    };
    return apiPost('/system/setup-super-admin', adminData, { headers });
  }

  // ============== PAYMENTS ==============

  static async getManualPayments(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/admin/payments/manual${queryString ? '?' + queryString : ''}`;
      const response = await apiGet(url);
      return response;
    } catch (error) {
      console.error('Error fetching manual payments:', error);
      throw error;
    }
  }

  static async verifyManualPayment(paymentId, data = {}) {
    try {
      const response = await apiPost(`/admin/payments/${paymentId}/verify`, data);
      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  static async rejectManualPayment(paymentId, data = {}) {
    try {
      const response = await apiPost(`/admin/payments/${paymentId}/reject`, data);
      return response;
    } catch (error) {
      console.error('Error rejecting payment:', error);
      throw error;
    }
  }

  static async bulkVerifyPayments(paymentIds) {
    try {
      const response = await apiPost('/admin/payments/bulk/verify', { payment_ids: paymentIds });
      return response;
    } catch (error) {
      console.error('Error bulk verifying payments:', error);
      throw error;
    }
  }

  static async bulkRejectPayments(paymentIds) {
    try {
      const response = await apiPost('/admin/payments/bulk/reject', { payment_ids: paymentIds });
      return response;
    } catch (error) {
      console.error('Error bulk rejecting payments:', error);
      throw error;
    }
  }

  static async sendPaymentReminder(paymentId) {
    try {
      const response = await apiPost(`/admin/payments/${paymentId}/reminder`);
      return response;
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }

  // ============== NOTIFICATIONS ==============

  static async sendWelcomeEmail(userId) {
    return apiPost(`/admin/users/${userId}/send-welcome`);
  }

  static async sendApprovalNotification(userId) {
    return apiPost(`/admin/users/${userId}/notify-approval`);
  }

  static async sendRejectionNotification(userId, reason) {
    return apiPost(`/admin/users/${userId}/notify-rejection`, { reason });
  }

  // ============== REPORTS & EXPORTS ==============

  static async exportUsers(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await apiGet(`/admin/users/export?${params}`);
      return response;
    } catch (error) {
      console.error('Export users error:', error);
      return { error: error.message };
    }
  }

  static async exportApprovalStats(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/admin/approvals/export?${params}`);
  }

  static async generatePerformanceReport(reportConfig) {
    return apiPost('/admin/reports/performance', reportConfig);
  }

  // ============== SUBSCRIPTION MANAGEMENT ==============

  static async updateUserSubscription(userId, subscriptionData) {
    return apiPut(`/admin/users/${userId}/subscription`, subscriptionData);
  }

  static async cancelUserSubscription(userId) {
    return apiPost(`/admin/users/${userId}/cancel-subscription`);
  }

  static async getSubscriptionStats() {
    return apiGet('/admin/subscriptions/stats');
  }

  // ============== UTILITIES ==============

  static async checkAutoApprove(email) {
    return apiPost('/admin/auto-approve-check', { email });
  }

  static async getUserActivityTimeline(userId, filters = {}) {
    const params = new URLSearchParams({
      ...filters,
      user_id: userId
    }).toString();
    return apiGet(`/admin/activity/timeline?${params}`);
  }

  static async getFeatureUsage(userId, days = 30) {
    return apiGet(`/admin/analytics/feature-usage/${userId}?days=${days}`);
  }

  static async uploadUserDocument(userId, file, documentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    return apiUpload(`/admin/users/${userId}/documents`, formData);
  }

  static async getUserDocuments(userId) {
    return apiGet(`/admin/users/${userId}/documents`);
  }

  // ============== AUDIT LOGS ==============

  static async getAuditLogs(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/admin/audit-logs?${params}`);
  }

  static async getUserActivityLogs(userId, filters = {}) {
    const params = new URLSearchParams({
      ...filters,
      user_id: userId
    }).toString();
    return apiGet(`/admin/activity-logs?${params}`);
  }

  // ============== SYSTEM SETTINGS ==============

  static async getSystemSettings() {
    return apiGet('/admin/settings');
  }

  static async updateSystemSettings(settings) {
    return apiPut('/admin/settings', settings);
  }

  static async getEmailTemplates() {
    return apiGet('/admin/email-templates');
  }

  static async updateEmailTemplate(templateName, templateData) {
    return apiPut(`/admin/email-templates/${templateName}`, templateData);
  }

  // ============== QUICK ACTIONS ==============

  static async sendFollowUpEmails(userIds) {
    try {
      const response = await apiPost('/admin/quick-actions/follow-up', { user_ids: userIds });
      return response;
    } catch (error) {
      console.error('Send follow-up emails error:', error);
      return { error: error.message };
    }
  }

  static async massApproveVerified() {
    try {
      const response = await apiPost('/admin/quick-actions/mass-approve');
      return response;
    } catch (error) {
      console.error('Mass approve verified error:', error);
      return { error: error.message };
    }
  }

  // ============== USER SEARCH & FILTERS ==============

  static async searchUsers(searchParams = {}) {
    const params = new URLSearchParams(searchParams).toString();
    return apiGet(`/admin/users/search?${params}`);
  }

  static async getUserFilterOptions() {
    return apiGet('/admin/users/filter-options');
  }

  // ============== ADVANCED USER MANAGEMENT ==============

  static async mergeUsers(userIds, mergeData = {}) {
    return apiPost('/admin/users/merge', {
      user_ids: userIds,
      ...mergeData
    });
  }

  static async deactivateUser(userId, reason = '') {
    return apiPost(`/admin/users/${userId}/deactivate`, { reason });
  }

  static async reactivateUser(userId) {
    return apiPost(`/admin/users/${userId}/reactivate`);
  }

  // ============== ERROR HANDLING WRAPPERS ==============

  static async safeCall(apiCall, ...args) {
    try {
      const response = await apiCall(...args);
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error',
        status: error.response?.status || 500
      };
    }
  }

  static async safeCallWithRetry(apiCall, args, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await apiCall(...args);
        return {
          success: true,
          data: response.data,
          status: response.status,
          attempts: attempt
        };
      } catch (error) {
        lastError = error;
        
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    return {
      success: false,
      error: lastError?.response?.data?.error || lastError?.message || 'Max retries exceeded',
      status: lastError?.response?.status || 500,
      attempts: maxRetries
    };
  }
}

export default SafetyProService;
