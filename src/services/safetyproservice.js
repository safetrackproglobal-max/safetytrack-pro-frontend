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

  /**
   * Approve a specific user
   * @param {number} userId - User ID to approve
   * @param {Object} data - Approval data (notes, admin_role, etc.)
   * @returns {Promise} Approval response
   */
  static async approveUser(userId, data = {}) {
    return apiPost(`/safetypro/approve/${userId}`, data);
  }

  /**
   * Reject a user application
   * @param {number} userId - User ID to reject
   * @param {Object} data - Rejection data (reason, notes, etc.)
   * @returns {Promise} Rejection response
   */
  static async rejectUser(userId, data = {}) {
    return apiPost(`/safetypro/reject/${userId}`, data);
  }

  /**
   * Bulk approve/reject users
   * @param {Array} userIds - Array of user IDs
   * @param {string} action - 'approve' or 'reject'
   * @param {Object} data - Additional data (notes, etc.)
   * @returns {Promise} Bulk action response
   */
  static async bulkAction(userIds, action, data = {}) {
    return apiPost('/safetypro/bulk-action', {
      user_ids: userIds,
      action: action,
      ...data
    });
  }

  // ============== BULK OPERATIONS ==============
  
  /**
   * Execute bulk operations on users
   * @param {Object} payload - Bulk operation payload
   * @returns {Promise} Bulk operation response
   */
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
  
  /**
   * Get detailed user information
   * @param {number} userId - User ID
   * @returns {Promise} User details response
   */
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
  
  /**
   * Upgrade user plan
   * @param {Object} payload - Upgrade payload
   * @returns {Promise} Upgrade response
   */
  static async upgradeUserPlan(payload) {
    try {
      const response = await apiPost('/safetypro/user/upgrade', payload);
      return response;
    } catch (error) {
      console.error('Upgrade user error:', error);
      return { error: error.message };
    }
  }

  /**
   * Downgrade user to free plan
   * @param {number} userId - User ID
   * @returns {Promise} Downgrade response
   */
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
  
  /**
   * Suspend user account
   * @param {number} userId - User ID
   * @returns {Promise} Suspend response
   */
  static async suspendUser(userId) {
    try {
      const response = await apiPost(`/safetypro/user/${userId}/suspend`);
      return response;
    } catch (error) {
      console.error('Suspend user error:', error);
      return { error: error.message };
    }
  }

  /**
   * Activate suspended user account
   * @param {number} userId - User ID
   * @returns {Promise} Activate response
   */
  static async activateUser(userId) {
    try {
      const response = await apiPost(`/safetypro/user/${userId}/activate`);
      return response;
    } catch (error) {
      console.error('Activate user error:', error);
      return { error: error.message };
    }
  }

  /**
   * Block user (IP and email ban)
   * @param {number} userId - User ID
   * @returns {Promise} Block response
   */
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
  
  /**
   * Get system health status
   * @returns {Promise} System health response
   */
  static async getSystemHealth() {
    try {
      const response = await apiGet('/admin/system/health');
      return response;
    } catch (error) {
      console.error('System health error:', error);
      return { error: error.message };
    }
  }

  // ============== TEAM NOTIFICATION ==============
  
  /**
   * Send notification to team
   * @param {string} message - Notification message
   * @returns {Promise} Notification response
   */
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
  
  /**
   * Get SafetyPro dashboard data (stats and pending approvals)
   * @returns {Promise} Dashboard data response
   */
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
  
  /**
   * Get recent activity for dashboard
   * @param {number} limit - Number of activities to fetch
   * @returns {Promise} Recent activity response
   */
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
  
  /**
   * Get plan distribution statistics
   * @returns {Promise} Plan distribution response
   */
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
  
  /**
   * Get user growth metrics over time
   * @param {string} period - Period (day, week, month, year)
   * @returns {Promise} User growth metrics response
   */
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
  
  /**
   * Get revenue metrics
   * @param {string} period - Period (day, week, month, year)
   * @returns {Promise} Revenue metrics response
   */
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

  /**
   * Create a user manually (admin only)
   * @param {Object} userData - User creation data
   * @returns {Promise} Created user response
   */
  static async createManualUser(userData) {
    try {
      const response = await apiPost('/admin/users/manual-create', userData);
      return response;
    } catch (error) {
      console.error('Create manual user error:', error);
      return { error: error.message };
    }
  }

  /**
   * Bulk create users from CSV
   * @param {File} csvFile - CSV file containing user data
   * @returns {Promise} Bulk creation response
   */
  static async bulkCreateUsersFromCSV(csvFile) {
    const formData = new FormData();
    formData.append('file', csvFile);
    return apiUpload('/admin/users/manual-create/bulk', formData);
  }

  /**
   * Get recently created users
   * @param {number} limit - Number of users to fetch (default: 50)
   * @returns {Promise} List of recently created users
   */
  static async getRecentlyCreatedUsers(limit = 50) {
    const params = new URLSearchParams({ limit }).toString();
    return apiGet(`/admin/users/recently-created?${params}`);
  }

  /**
   * Resend welcome email to user
   * @param {number} userId - User ID
   * @returns {Promise} Email resend response
   */
  static async resendWelcomeEmail(userId) {
    return apiPost(`/admin/users/${userId}/resend-welcome`);
  }

  /**
   * Reset user password (admin forced reset)
   * @param {number} userId - User ID
   * @returns {Promise} Password reset response
   */
  static async resetUserPassword(userId) {
    return apiPost(`/admin/users/${userId}/reset-password`);
  }

  /**
   * Get user creation statistics
   * @param {string} timeRange - Time range for stats (default: '30d')
   * @returns {Promise} User creation statistics
   */
  static async getUserCreationStats(timeRange = '30d') {
    const params = new URLSearchParams({ timeRange }).toString();
    return apiGet(`/admin/users/creation-stats?${params}`);
  }

  // ============== PERFORMANCE ANALYTICS ==============

  /**
   * Get performance overview statistics
   * @param {number} days - Number of days for analysis (default: 30)
   * @returns {Promise} Performance overview data
   */
  static async getPerformanceOverview(days = 30) {
    return apiGet(`/performance/overview?days=${days}`);
  }

  /**
   * Get monthly performance trends
   * @param {number} months - Number of months to analyze (default: 12)
   * @returns {Promise} Monthly performance data
   */
  static async getMonthlyPerformance(months = 12) {
    return apiGet(`/performance/monthly?months=${months}`);
  }

  /**
   * Get user engagement metrics
   * @param {number} days - Number of days for analysis (default: 30)
   * @returns {Promise} Engagement metrics
   */
  static async getEngagementMetrics(days = 30) {
    return apiGet(`/performance/engagement?days=${days}`);
  }

  /**
   * Get detailed user performance
   * @param {number} userId - User ID
   * @param {number} days - Number of days for analysis (default: 30)
   * @returns {Promise} User performance data
   */
  static async getUserPerformance(userId, days = 30) {
    return apiGet(`/user/performance/${userId}?days=${days}`);
  }

  /**
   * Get admin analytics for any user
   * @param {number} userId - User ID
   * @param {number} days - Number of days for analysis (default: 30)
   * @returns {Promise} Detailed user analytics
   */
  static async getAdminUserAnalytics(userId, days = 30) {
    return apiGet(`/admin/analytics/user/${userId}?days=${days}`);
  }

  // ============== CSV & BULK OPERATIONS ==============

  /**
   * Download CSV template for bulk user creation
   * @returns {Promise} CSV template file
   */
  static async downloadUserCSVTemplate() {
    return apiGet('/admin/users/csv-template', {
      responseType: 'blob'
    });
  }

  /**
   * Validate CSV file before import
   * @param {FormData} formData - Form data with CSV file
   * @returns {Promise} Validation results
   */
  static async validateCSVFile(formData) {
    return apiUpload('/admin/users/validate-csv', formData);
  }

  /**
   * Get bulk operation status
   * @param {string} operationId - Operation ID
   * @returns {Promise} Operation status
   */
  static async getBulkOperationStatus(operationId) {
    return apiGet(`/admin/operations/${operationId}/status`);
  }

  // ============== USER MANAGEMENT ==============

  /**
 * Get all users (admin only)
 * @param {Object} filters - Filter parameters
 * @returns {Promise} List of all users
 */
static async getAllUsers(filters = {}) {
  try {
    // Use the correct endpoint that returns ALL users across all companies
    // The endpoint /admin/users/all has no company filtering
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
    console.log('📊 getAllUsers response:', response);
    
    // Handle the response structure from your backend
    if (response && response.success) {
      // Extract users from the nested data structure
      const users = response.data?.users || response.users || [];
      return {
        success: true,
        users: users,
        pagination: response.data?.pagination || response.pagination,
        total: response.data?.pagination?.total || users.length
      };
    }
    
    // Fallback for other response formats
    if (response && response.users) {
      return { success: true, users: response.users };
    }
    
    if (Array.isArray(response)) {
      return { success: true, users: response };
    }
    
    return { success: true, users: [] };
  } catch (error) {
    console.error('Get all users error:', error);
    return { success: false, error: error.message, users: [] };
  }
}

  /**
   * Create a new user
   * @param {Object} userData - User creation data
   * @returns {Promise} Created user response
   */
  static async createUser(userData) {
    return apiPost('/admin/users/create', userData);
  }

  // src/services/safetyproservice.js

// Update the getAllUsers method (around line 364)
/**
 * Get all users (admin only)
 * @param {Object} filters - Filter parameters
 * @returns {Promise} List of all users
 */
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
    
    // Handle different response structures
    let users = [];
    
    // Check response.data structure (most common)
    if (response && response.data) {
      if (response.data.users && Array.isArray(response.data.users)) {
        users = response.data.users;
        console.log(`📊 Found ${users.length} users in response.data.users`);
      } else if (response.data.data && response.data.data.users) {
        users = response.data.data.users;
        console.log(`📊 Found ${users.length} users in response.data.data.users`);
      }
    }
    
    // Check response directly
    if (users.length === 0 && response && response.users && Array.isArray(response.users)) {
      users = response.users;
      console.log(`📊 Found ${users.length} users in response.users`);
    }
    
    // Check if response is an array
    if (users.length === 0 && Array.isArray(response)) {
      users = response;
      console.log(`📊 Found ${users.length} users in response array`);
    }
    
    // Check response.data as array
    if (users.length === 0 && response && Array.isArray(response.data)) {
      users = response.data;
      console.log(`📊 Found ${users.length} users in response.data array`);
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

static async deleteUser(userId) {
  try {
    // Use the safetypro endpoint instead
    const response = await apiDelete(`/safetypro/users/${userId}`);
    return response;
  } catch (error) {
    console.error('Delete user error:', error);
    return { error: error.message };
  }
}
// Also add a specific method to get company users (for company admins)
/**
 * Get users for a specific company
 * @param {string} companyName - Company name
 * @param {Object} filters - Filter parameters
 * @returns {Promise} List of company users
 */
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

  /**
   * Update user information
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Update response
   */
  static async updateUser(userId, userData) {
    return apiPut(`/admin/users/${userId}`, userData);
  }

  /**
   * Delete a user
   * @param {number} userId - User ID
   * @returns {Promise} Delete response
   */
  static async deleteUser(userId) {
    try {
      const response = await apiDelete(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Delete user error:', error);
      return { error: error.message };
    }
  }

  /**
   * Bulk import users
   * @param {Array} users - Array of user objects
   * @returns {Promise} Import results
   */
  static async bulkImportUsers(users) {
    return apiPost('/admin/users/import', { users });
  }

  // ============== ADMIN REGISTRATION & SETUP ==============

  /**
   * Register a new admin
   * @param {Object} adminData - Admin registration data
   * @returns {Promise} Registration response
   */
  static async registerAdmin(adminData) {
    return apiPost('/admin/register', adminData);
  }

  /**
   * Setup first super admin (one-time use)
   * @param {Object} adminData - Super admin data
   * @param {string} secretKey - Setup secret key
   * @returns {Promise} Setup response
   */
  static async setupSuperAdmin(adminData, secretKey) {
    const headers = {
      'X-Setup-Key': secretKey
    };
    return apiPost('/system/setup-super-admin', adminData, { headers });
  }

  // In safetyproservice.js

// Get all manual payments with filters
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

// Verify a manual payment
static async verifyManualPayment(paymentId, data = {}) {
  try {
    const response = await apiPost(`/admin/payments/${paymentId}/verify`, data);
    return response;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

// Reject a manual payment
static async rejectManualPayment(paymentId, data = {}) {
  try {
    const response = await apiPost(`/admin/payments/${paymentId}/reject`, data);
    return response;
  } catch (error) {
    console.error('Error rejecting payment:', error);
    throw error;
  }
}

// Bulk verify payments
static async bulkVerifyPayments(paymentIds) {
  try {
    const response = await apiPost('/admin/payments/bulk/verify', { payment_ids: paymentIds });
    return response;
  } catch (error) {
    console.error('Error bulk verifying payments:', error);
    throw error;
  }
}

// Bulk reject payments
static async bulkRejectPayments(paymentIds) {
  try {
    const response = await apiPost('/admin/payments/bulk/reject', { payment_ids: paymentIds });
    return response;
  } catch (error) {
    console.error('Error bulk rejecting payments:', error);
    throw error;
  }
}

// Send payment reminder
static async sendPaymentReminder(paymentId) {
  try {
    const response = await apiPost(`/admin/payments/${paymentId}/reminder`);
    return response;
  } catch (error) {
    console.error('Error sending reminder:', error);
    throw error;
  }
}

  /**
   * Send welcome email to new user
   * @param {number} userId - User ID
   * @returns {Promise} Email sending response
   */
  static async sendWelcomeEmail(userId) {
    return apiPost(`/admin/users/${userId}/send-welcome`);
  }

  /**
   * Send approval notification
   * @param {number} userId - User ID
   * @returns {Promise} Notification response
   */
  static async sendApprovalNotification(userId) {
    return apiPost(`/admin/users/${userId}/notify-approval`);
  }

  /**
   * Send rejection notification
   * @param {number} userId - User ID
   * @param {string} reason - Rejection reason
   * @returns {Promise} Notification response
   */
  static async sendRejectionNotification(userId, reason) {
    return apiPost(`/admin/users/${userId}/notify-rejection`, { reason });
  }

  // ============== REPORTS & EXPORTS ==============

  /**
   * Export users data
   * @param {Object} filters - Export filters
   * @returns {Promise} Export data or file URL
   */
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

  /**
   * Export approval statistics
   * @param {Object} filters - Export filters
   * @returns {Promise} Export data
   */
  static async exportApprovalStats(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/admin/approvals/export?${params}`);
  }

  /**
   * Generate performance report
   * @param {Object} reportConfig - Report configuration
   * @returns {Promise} Report data
   */
  static async generatePerformanceReport(reportConfig) {
    return apiPost('/admin/reports/performance', reportConfig);
  }

  // ============== SUBSCRIPTION MANAGEMENT ==============

  /**
   * Update user subscription
   * @param {number} userId - User ID
   * @param {Object} subscriptionData - Subscription data
   * @returns {Promise} Update response
   */
  static async updateUserSubscription(userId, subscriptionData) {
    return apiPut(`/admin/users/${userId}/subscription`, subscriptionData);
  }

  /**
   * Cancel user subscription
   * @param {number} userId - User ID
   * @returns {Promise} Cancellation response
   */
  static async cancelUserSubscription(userId) {
    return apiPost(`/admin/users/${userId}/cancel-subscription`);
  }

  /**
   * Get subscription statistics
   * @returns {Promise} Subscription stats
   */
  static async getSubscriptionStats() {
    return apiGet('/admin/subscriptions/stats');
  }

  // ============== UTILITIES ==============

  /**
   * Check auto-approval eligibility
   * @param {string} email - User email
   * @returns {Promise} Auto-approval check result
   */
  static async checkAutoApprove(email) {
    return apiPost('/admin/auto-approve-check', { email });
  }

  /**
   * Get user activity timeline
   * @param {number} userId - User ID
   * @param {Object} filters - Timeline filters
   * @returns {Promise} Activity timeline
   */
  static async getUserActivityTimeline(userId, filters = {}) {
    const params = new URLSearchParams({
      ...filters,
      user_id: userId
    }).toString();
    return apiGet(`/admin/activity/timeline?${params}`);
  }

  /**
   * Get feature usage analytics
   * @param {number} userId - User ID
   * @param {number} days - Number of days
   * @returns {Promise} Feature usage data
   */
  static async getFeatureUsage(userId, days = 30) {
    return apiGet(`/admin/analytics/feature-usage/${userId}?days=${days}`);
  }

  /**
   * Upload user documents/attachments
   * @param {number} userId - User ID
   * @param {File} file - File to upload
   * @param {string} documentType - Type of document
   * @returns {Promise} Upload response
   */
  static async uploadUserDocument(userId, file, documentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    return apiUpload(`/admin/users/${userId}/documents`, formData);
  }

  /**
   * Get user documents
   * @param {number} userId - User ID
   * @returns {Promise} List of documents
   */
  static async getUserDocuments(userId) {
    return apiGet(`/admin/users/${userId}/documents`);
  }

  // ============== AUDIT LOGS ==============

  /**
   * Get admin audit logs
   * @param {Object} filters - Filter parameters
   * @returns {Promise} Audit logs
   */
  static async getAuditLogs(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/admin/audit-logs?${params}`);
  }

  /**
   * Get user activity logs
   * @param {number} userId - User ID
   * @param {Object} filters - Filter parameters
   * @returns {Promise} Activity logs
   */
  static async getUserActivityLogs(userId, filters = {}) {
    const params = new URLSearchParams({
      ...filters,
      user_id: userId
    }).toString();
    return apiGet(`/admin/activity-logs?${params}`);
  }

  // ============== SYSTEM SETTINGS ==============

  /**
   * Get system settings
   * @returns {Promise} System settings
   */
  static async getSystemSettings() {
    return apiGet('/admin/settings');
  }

  /**
   * Update system settings
   * @param {Object} settings - Settings to update
   * @returns {Promise} Update response
   */
  static async updateSystemSettings(settings) {
    return apiPut('/admin/settings', settings);
  }

  /**
   * Get email templates
   * @returns {Promise} Email templates
   */
  static async getEmailTemplates() {
    return apiGet('/admin/email-templates');
  }

  /**
   * Update email template
   * @param {string} templateName - Template name
   * @param {Object} templateData - Template data
   * @returns {Promise} Update response
   */
  static async updateEmailTemplate(templateName, templateData) {
    return apiPut(`/admin/email-templates/${templateName}`, templateData);
  }

  // ============== QUICK ACTIONS ==============

  /**
   * Send follow-up email to pending users
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise} Follow-up response
   */
  static async sendFollowUpEmails(userIds) {
    try {
      const response = await apiPost('/admin/quick-actions/follow-up', { user_ids: userIds });
      return response;
    } catch (error) {
      console.error('Send follow-up emails error:', error);
      return { error: error.message };
    }
  }

  /**
   * Mass approve verified users
   * @returns {Promise} Mass approval response
   */
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

  /**
   * Search users with advanced filters
   * @param {Object} searchParams - Search parameters
   * @returns {Promise} Search results
   */
  static async searchUsers(searchParams = {}) {
    const params = new URLSearchParams(searchParams).toString();
    return apiGet(`/admin/users/search?${params}`);
  }

  /**
   * Get user filters/options
   * @returns {Promise} Available filter options
   */
  static async getUserFilterOptions() {
    return apiGet('/admin/users/filter-options');
  }

  // ============== ADVANCED USER MANAGEMENT ==============

  /**
   * Merge duplicate users
   * @param {Array} userIds - Array of user IDs to merge
   * @param {Object} mergeData - Merge configuration
   * @returns {Promise} Merge response
   */
  static async mergeUsers(userIds, mergeData = {}) {
    return apiPost('/admin/users/merge', {
      user_ids: userIds,
      ...mergeData
    });
  }

  /**
   * Deactivate user account (soft delete)
   * @param {number} userId - User ID
   * @param {string} reason - Deactivation reason
   * @returns {Promise} Deactivation response
   */
  static async deactivateUser(userId, reason = '') {
    return apiPost(`/admin/users/${userId}/deactivate`, { reason });
  }

  /**
   * Reactivate user account
   * @param {number} userId - User ID
   * @returns {Promise} Reactivation response
   */
  static async reactivateUser(userId) {
    return apiPost(`/admin/users/${userId}/reactivate`);
  }

  // ============== ERROR HANDLING WRAPPERS ==============

  /**
   * Safe API call with error handling
   * @param {Function} apiCall - API function to call
   * @param {Array} args - Arguments for the API call
   * @returns {Promise} API response or error object
   */
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

  /**
   * Enhanced safe call with retry logic
   * @param {Function} apiCall - API function to call
   * @param {Array} args - Arguments for the API call
   * @param {number} maxRetries - Maximum retry attempts (default: 3)
   * @returns {Promise} API response or error object
   */
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
        
        // Don't retry on 4xx errors (client errors)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
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