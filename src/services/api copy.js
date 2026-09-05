import axios from 'axios';

// Create axios instance with better configuration
const isCloudflareTunnel = window.location.hostname.includes('safetrackproglobal.com') || 
                           window.location.hostname.includes('cfargotunnel.com');

const api = axios.create({
  baseURL: isCloudflareTunnel 
    ? 'https://api.safetrackproglobal.com/api' 
    : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api'),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});



/**
 * Check if user is super admin (from localStorage)
 */
export const isSuperAdmin = () => {
  try {
    const localStorageIsSuperAdmin = localStorage.getItem('is_super_admin') === 'true';
    const userPlan = localStorage.getItem('user_plan');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check multiple possible super admin indicators
    if (localStorageIsSuperAdmin) return true;
    if (userPlan === 'super_admin') return true;
    if (user?.is_super_admin === true) return true;
    if (user?.user_type === 'super_admin') return true;
    if (user?.role === 'super_admin') return true;
    if (user?.account_info?.is_super_admin === true) return true;
    if (user?.is_system_team === true) return true;
    
    return false;
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
};

/**
 * Get current user plan (with super admin override)
 */
export const getUserPlan = () => {
  // Super admin bypass - return super_admin if detected
  if (isSuperAdmin()) {
    console.log('👑 Super admin detected - bypassing all plan restrictions');
    return 'super_admin';
  }
  
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const plan = user.plan || user.subscription_plan || user.effective_plan || 'free';
    return normalizePlanName(plan);
  } catch (error) {
    return 'free';
  }
};

/**
 * Check if super admin has access (always true)
 */
export const hasSuperAdminAccess = () => {
  const isSuperAdminUser = isSuperAdmin();
  if (isSuperAdminUser) {
    console.log('👑 Super Admin Access Granted - Feature restrictions bypassed');
  }
  return isSuperAdminUser;
};

// ==================== UPGRADE MODAL HANDLER ====================

let upgradeModalCallback = null;

/**
 * Register callback to show upgrade modal
 */
export const registerUpgradeModalHandler = (callback) => {
  upgradeModalCallback = callback;
  console.log('✅ Upgrade modal handler registered');
};

/**
 * Show upgrade modal (triggers UI callback)
 */
export const showUpgradeModal = (upgradeInfo) => {
  console.log('🔼 Showing upgrade modal with info:', upgradeInfo);
  
  // Store upgrade info for later
  localStorage.setItem('pending_upgrade', JSON.stringify(upgradeInfo));
  
  // Dispatch event for UI to show modal
  window.dispatchEvent(new CustomEvent('showUpgradeModal', { 
    detail: upgradeInfo 
  }));
  
  // Call registered callback if exists
  if (upgradeModalCallback) {
    upgradeModalCallback(upgradeInfo);
  }
  
  return upgradeInfo;
};

/**
 * Get upgrade URL based on user's country and required plan
 */
export const getUpgradeUrl = (requiredPlan = null, country = null) => {
  const plan = requiredPlan || 'pro';
  const userCountry = country || getUserCountry();
  
  return `/pricing?country=${userCountry}&plan=${plan}`;
};

/**
 * Get user's country (from localStorage or default)
 */
export const getUserCountry = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.country || 'default';
  } catch (error) {
    return 'default';
  }
};

const PLAN_NAME_MAPPING = {
  // Free variations
  'free_trial': 'free', 'trial': 'free', 'free_forever': 'free',
  'basic_trial': 'free', 'trial_basic': 'free',
  
  // Basic variations  
  'starter': 'basic', 'basic_legacy': 'basic', 'basic_old': 'basic',
  'standard': 'basic', 'lite': 'basic',
  
  // Pro variations
  'professional': 'pro', 'pro_legacy': 'pro', 'pro_old': 'pro',
  'business': 'pro', 'plus': 'pro', 'premium': 'pro',
  
  // Enterprise variations
  'enterprise_legacy': 'enterprise', 'enterprise_old': 'enterprise',
  'ultimate': 'enterprise', 'elite': 'enterprise', 'corporate': 'enterprise',
  
  // Keep original names
  'free': 'free', 'basic': 'basic', 'pro': 'pro', 'enterprise': 'enterprise',
  'super_admin': 'super_admin'
};

const PLAN_HIERARCHY = {
  'free': 0,
  'basic': 1,
  'pro': 2,
  'enterprise': 3,
  'super_admin': 999  // Super admin has highest level
};

/**
 * Normalize any plan name to standard plan
 */
export const normalizePlanName = (planName) => {
  if (!planName) return 'free';
  
  // Super admin check
  if (planName === 'super_admin' || planName === 'super-admin' || planName === 'superadmin') {
    return 'super_admin';
  }
  
  const normalized = PLAN_NAME_MAPPING[
    planName.toLowerCase().trim()
  ] || 'free';
  
  console.log(`🔄 Plan Normalization: ${planName} -> ${normalized}`);
  return normalized;
};

/**
 * Check if user can access a specific feature (with super admin bypass)
 */
export const canAccessFeature = (requiredPlan, userPlan = null) => {
  // SUPER ADMIN BYPASS - Always return true for super admin
  if (isSuperAdmin()) {
    console.log(`👑 SUPER ADMIN: Access granted for feature requiring ${requiredPlan}`);
    return true;
  }
  
  const plan = userPlan ? normalizePlanName(userPlan) : getUserPlan();
  const userLevel = PLAN_HIERARCHY[plan] || 0;
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;
  
  const hasAccess = userLevel >= requiredLevel;
  
  console.log(`🔍 Feature Access Check:`);
  console.log(`   User Plan: ${plan} (Level: ${userLevel})`);
  console.log(`   Required Plan: ${requiredPlan} (Level: ${requiredLevel})`);
  console.log(`   Has Access: ${hasAccess ? '✅ Yes' : '❌ No'}`);
  console.log(`   Is Super Admin: ${isSuperAdmin()}`);
  
  return hasAccess;
};

/**
 * Check if user has specific feature
 */
export const hasFeature = (featureName, userPlan = null) => {
  // SUPER ADMIN BYPASS
  if (isSuperAdmin()) {
    console.log(`👑 SUPER ADMIN: Feature ${featureName} granted`);
    return true;
  }
  
  const plan = userPlan ? normalizePlanName(userPlan) : getUserPlan();
  const planConfig = PLANS[plan] || PLANS.free;
  const hasFeature = planConfig.features.includes(featureName);
  
  console.log(`🔍 Feature Check: ${featureName}`);
  console.log(`   User Plan: ${plan}`);
  console.log(`   Has Feature: ${hasFeature ? '✅ Yes' : '❌ No'}`);
  
  return hasFeature;
};

/**
 * Get user's plan limits
 */
export const getUserLimits = (userPlan = null) => {
  // SUPER ADMIN BYPASS - Unlimited limits
  if (isSuperAdmin()) {
    return {
      uploads_per_month: 'Unlimited',
      api_calls_per_month: 'Unlimited',
      team_members: 'Unlimited',
      monitoring_stations: 'Unlimited',
      ai_requests_per_month: 'Unlimited',
      camera_feeds: 'Unlimited',
      video_analysis_minutes: 'Unlimited'
    };
  }
  
  const plan = userPlan ? normalizePlanName(userPlan) : getUserPlan();
  const planConfig = PLANS[plan] || PLANS.free;
  return planConfig.limits;
};


export const planAwareApiCall = async (endpoint, data = {}, options = {}) => {
  const { requiredPlan = null, featureCheck = null, usageLimitCheck = null } = options;
  
  // SUPER ADMIN BYPASS - Always allow for super admin
  if (isSuperAdmin()) {
    console.log(`👑 SUPER ADMIN: Bypassing plan check for ${endpoint}`);
    try {
      const response = await apiPost(endpoint, data);
      return response;
    } catch (error) {
      // Enhance error if needed
      if (error.response?.data?.code === 'UPGRADE_REQUIRED') {
        error.isPlanError = true;
      }
      throw error;
    }
  }
  
  // Check if user has required plan
  if (requiredPlan && !canAccessFeature(requiredPlan)) {
    const userPlan = getUserPlan();
    const userCountry = getUserCountry();
    
    const upgradeError = {
      isPlanError: true,
      code: 'UPGRADE_REQUIRED',
      message: `This feature requires ${requiredPlan} plan or higher`,
      userPlan,
      requiredPlan,
      endpoint,
      upgradeUrl: getUpgradeUrl(requiredPlan, userCountry),
      showUpgradeModal: true
    };
    
    console.error('❌ Plan check failed:', upgradeError);
    
    // Show upgrade modal automatically
    showUpgradeModal(upgradeError);
    
    throw upgradeError;
  }
  
  // Check if user has specific feature
  if (featureCheck && !hasFeature(featureCheck)) {
    const upgradeError = {
      isPlanError: true,
      code: 'FEATURE_NOT_AVAILABLE',
      message: `Feature "${featureCheck}" not available in your plan`,
      feature: featureCheck,
      userPlan: getUserPlan(),
      upgradeUrl: getUpgradeUrl('pro')
    };
    
    showUpgradeModal(upgradeError);
    throw upgradeError;
  }
  
  // Make the API call
  try {
    return await apiPost(endpoint, data);
  } catch (error) {
    // Re-throw with enhanced error info
    if (error.response?.data?.code === 'UPGRADE_REQUIRED') {
      error.isPlanError = true;
      error.upgradeUrl = getUpgradeUrl(error.response?.data?.requiredPlan);
      
      // Show upgrade modal
      showUpgradeModal({
        ...error.response?.data,
        upgradeUrl: error.upgradeUrl
      });
    }
    throw error;
  }
};

/**
 * Usage-aware API call that tracks usage
 */
export const usageAwareApiCall = async (endpoint, data = {}, usageType = 'api_calls', amount = 1) => {
  // SUPER ADMIN BYPASS - No usage limits
  if (isSuperAdmin()) {
    console.log(`👑 SUPER ADMIN: Bypassing usage limit check for ${endpoint}`);
    return await apiPost(endpoint, data);
  }
  
  try {
    // Check current usage
    const userPlan = getUserPlan();
    const limits = getUserLimits(userPlan);
    const limit = limits[`${usageType}_per_month`];
    
    if (limit !== 'Unlimited' && limit !== -1) {
      // In a real app, you'd get current usage from localStorage or API
      const currentUsage = 0; // Get from localStorage or user state
      
      if (currentUsage + amount > limit) {
        throw {
          isUsageError: true,
          code: `${usageType.toUpperCase()}_LIMIT_EXCEEDED`,
          message: `Monthly ${usageType.replace('_', ' ')} limit exceeded`,
          currentUsage,
          limit,
          remaining: limit - currentUsage
        };
      }
    }
    
    // Make the API call
    const result = await apiPost(endpoint, data);
    
    // Update usage count (in a real app, you'd update localStorage)
    console.log(`📊 Tracked usage: ${usageType} (+${amount})`);
    
    return result;
  } catch (error) {
    throw error;
  }
};

// ============================================
// RESPONSE INTERCEPTOR - WITH SUPER ADMIN BYPASS
// ============================================

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config?.url || 'unknown'}`);
    
    // Check if response contains super admin info
    if (response.data?.is_super_admin === true || response.data?.super_admin_access === true) {
      console.log('👑 Super admin access confirmed in response');
      localStorage.setItem('is_super_admin', 'true');
      localStorage.setItem('user_plan', 'super_admin');
    }
    
    // Check for plan-related data in response
    if (response.data && response.data.plan) {
      console.log(`📋 Plan data in response: ${response.data.plan}`);
      if (response.data.normalized_plan_data || response.data.is_plan_standardized) {
        console.log(`🔄 Updating user plan data from response`);
        updateUserPlanData(response.data);
      }
    }
    
    return response;
  },
  (error) => {
    // ✅ SAFE: Use optional chaining with fallbacks
    const url = error?.config?.url || 'unknown';
    const method = error?.config?.method?.toUpperCase() || 'UNKNOWN';
    const status = error?.response?.status;
    const errorCode = error?.response?.data?.code;
    const errorData = error?.response?.data;
    
    console.error(`❌ API Error [${method} ${url}]:`, status, errorCode, errorData);
    
    // ✅ SUPER ADMIN BYPASS - Always allow for super admin
    if (isSuperAdmin()) {
      console.log('👑 SUPER ADMIN: Bypassing plan/feature check for error:', errorCode);
      return Promise.resolve({
        data: {
          success: true,
          is_super_admin: true,
          message: 'Super admin access granted',
          data: errorData?.data || {}
        }
      });
    }
    
    // ✅ Handle Network Errors (no response)
    if (!error.response) {
      console.error('Network error - backend may be down or unreachable');
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        isNetworkError: true,
        originalError: error
      });
    }
    
    // ✅ Handle FEATURE_NOT_AVAILABLE (403) - Show upgrade modal
    if (errorCode === 'FEATURE_NOT_AVAILABLE' || 
        (status === 403 && errorData?.code === 'FEATURE_NOT_AVAILABLE')) {
      console.warn('🚫 Feature not available for current plan');
      
      const upgradeInfo = {
        code: 'FEATURE_NOT_AVAILABLE',
        message: errorData?.error || 'This feature is not available in your current plan',
        currentPlan: errorData?.current_plan || getUserPlan(),
        requiredPlan: errorData?.required_plan || 'pro',
        suggestion: errorData?.suggestion || 'Upgrade to access this feature',
        endpoint: url,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('upgrade_info', JSON.stringify(upgradeInfo));
      
      window.dispatchEvent(new CustomEvent('showUpgradeModal', { 
        detail: upgradeInfo 
      }));
      
      if (upgradeModalCallback) {
        upgradeModalCallback(upgradeInfo);
      }
      
      error.isPlanError = true;
      error.upgradeInfo = upgradeInfo;
      error.upgradeUrl = getUpgradeUrl(upgradeInfo.requiredPlan);
      
      return Promise.reject(error);
    }
    
    // Handle UPGRADE_REQUIRED or FEATURE_LIMIT_EXCEEDED
    if (errorCode === 'UPGRADE_REQUIRED' || errorCode === 'FEATURE_LIMIT_EXCEEDED') {
      console.warn('Plan upgrade required:', errorData);
      
      const upgradeInfo = errorData || {
        code: errorCode,
        message: errorData?.message || 'This feature requires a higher plan',
        userPlan: getUserPlan(),
        requiredPlan: errorData?.requiredPlan || 'pro'
      };
      
      localStorage.setItem('upgrade_info', JSON.stringify(upgradeInfo));
      
      showUpgradeModal(upgradeInfo);
      
      error.isPlanError = true;
      error.upgradeInfo = upgradeInfo;
      error.upgradeUrl = getUpgradeUrl(upgradeInfo.requiredPlan);
      
      return Promise.reject(error);
    }
    
    // Handle usage limit errors
    if (errorCode?.includes('_LIMIT_EXCEEDED')) {
      console.warn('Usage limit exceeded:', errorData);
      
      const limitInfo = errorData;
      if (limitInfo) {
        localStorage.setItem('limit_info', JSON.stringify(limitInfo));
      }
      
      if (limitInfo?.requires_upgrade) {
        showUpgradeModal({
          code: 'USAGE_LIMIT_EXCEEDED',
          message: limitInfo.message || 'You have reached your monthly usage limit',
          userPlan: getUserPlan(),
          requiredPlan: 'pro',
          usage: limitInfo.current_usage,
          limit: limitInfo.limit
        });
      }
      
      error.isUsageError = true;
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden (non-feature related)
    if (status === 403 && errorCode !== 'FEATURE_NOT_AVAILABLE') {
      console.warn('Access forbidden - insufficient permissions');
    }
    
    // Handle 404 Not Found
    if (status === 404) {
      console.warn('API endpoint not found:', url);
    }
    
    // Handle 422 Validation error
    if (status === 422) {
      console.warn('Validation error:', errorData);
    }
    
    // Handle 500 Server error
    if (status === 500) {
      console.error('Server error occurred:', errorData);
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout - server took too long to respond');
      return Promise.reject({
        message: 'Request timeout. Please try again.',
        isTimeoutError: true
      });
    }
    
    return Promise.reject(error);
  }
);

export const getHealthcareContext = () => {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    let hospitalId = '';
    if (user?.company_id) {
      hospitalId = user.company_id;
    } else if (user?.hospital_id) {
      hospitalId = user.hospital_id;
    } else {
      hospitalId = localStorage.getItem('hospitalId') || '';
    }
    
    return {
      hospitalId: hospitalId,
      userRole: user?.user_type || user?.role || 'user',
      user: user,
      hasHospitalModule: !!(user?.company_id || user?.hospital_id || localStorage.getItem('hospitalId'))
    };
  } catch (e) {
    return {
      hospitalId: '',
      userRole: 'user',
      user: null,
      hasHospitalModule: false
    };
  }
};

// ✅ Export hasHospitalModuleAccess
export const hasHospitalModuleAccess = () => {
  const context = getHealthcareContext();
  return context.hasHospitalModule;
};

// ✅ Export addHealthcareHeaders
export const addHealthcareHeaders = (config) => {
  const context = getHealthcareContext();
  config.headers['X-Healthcare-Facility'] = context.hospitalId || 'default';
  config.headers['X-User-Role'] = context.userRole || 'user';
  config.headers['X-HIPAA-Compliant'] = 'true';
  config.headers['X-Data-Sensitivity'] = 'high';
  config.headers['X-Healthcare-Version'] = '1.0';
  config.headers['X-Healthcare-Context'] = 'clinical';
  return config;
};

// Update the request interceptor - ADD HEALTHCARE HEADERS
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('jwtToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ============================================
    // ✅ ADD HEALTHCARE HEADERS FOR HOSPITAL/MEDICAL REQUESTS
    // ============================================
    const isHealthcareEndpoint = 
      config.url.includes('/hospital') || 
      config.url.includes('/healthcare') ||
      config.url.includes('/patient') ||
      config.url.includes('/doctor') ||
      config.url.includes('/nurse') ||
      config.url.includes('/medical') ||
      config.url.includes('/clinical') ||
      config.url.includes('/ai-services') ||
      config.url.includes('/departments') ||
      config.url.includes('/staff') ||
      config.url.includes('/equipment') ||
      config.url.includes('/beds') ||
      config.url.includes('/accreditations') ||
      config.url.includes('/safety-goals') ||
      config.url.includes('/adverse-events') ||
      config.url.includes('/risk-assessments') ||
      config.url.includes('/infection-control') ||
      config.url.includes('/disease-surveillance') ||
      config.url.includes('/emergency-preparedness') ||
      config.url.includes('/safety-incidents') ||
      config.url.includes('/lab-safety') ||
      config.url.includes('/compliance') ||
      config.url.includes('/clinical-protocols') ||
      config.url.includes('/clinical-trials') ||
      config.url.includes('/data-standards') ||
      config.url.includes('/competencies') ||
      config.url.includes('/sustainability') ||
      config.url.includes('/cybersecurity') ||
      config.url.includes('/global-health') ||
      config.url.includes('/medical-records') ||
      config.url.includes('/waste-management') ||
      config.url.includes('/clinical-notes') ||
      config.url.includes('/lab-results') ||
      config.url.includes('/imaging-studies') ||
      config.url.includes('/prescriptions') ||
      config.url.includes('/feedback') ||
      config.url.includes('/quality-indicators') ||
      config.url.includes('/notifications') ||
      config.url.includes('/audit-logs') ||
      config.url.includes('/reports');
    
    if (isHealthcareEndpoint) {
      const context = getHealthcareContext();
      
      // ✅ REQUIRED HEALTHCARE HEADERS
      config.headers['X-Healthcare-Facility'] = context.hospitalId || 'default';
      config.headers['X-User-Role'] = context.userRole || 'user';
      config.headers['X-HIPAA-Compliant'] = 'true';
      config.headers['X-Data-Sensitivity'] = 'high';
      config.headers['X-Healthcare-Version'] = '1.0';
      config.headers['X-Healthcare-Context'] = 'clinical';
      
      console.log('🏥 Healthcare headers added:', {
        'X-Healthcare-Facility': config.headers['X-Healthcare-Facility'],
        'X-User-Role': config.headers['X-User-Role'],
        'X-HIPAA-Compliant': config.headers['X-HIPAA-Compliant'],
        'X-Data-Sensitivity': config.headers['X-Data-Sensitivity'],
      });
    }
    
    // Existing logging
    if (config.url.includes('/hse/industries/')) {
      console.log('🏭 INDUSTRY API REQUEST:', {
        url: config.url,
        method: config.method,
        industry: config.url.split('/').pop(),
        hasToken: !!token,
        isSuperAdmin: isSuperAdmin()
      });
    }

    // Notification service logging
    if (config.url.includes('notifications') || config.url.includes('incidents')) {
      console.log('🔔 NOTIFICATION API REQUEST:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        isSuperAdmin: isSuperAdmin()
      });
    }

    // AI Service logging
    if (config.url.includes('/ai/') || config.url.includes('medical') || config.url.includes('hospital')) {
      console.log('🤖 AI SERVICE REQUEST:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        isSuperAdmin: isSuperAdmin()
      });
    }

    // Video Analysis logging
    if (config.url.includes('/video/') || config.url.includes('video-analysis')) {
      console.log('🎥 VIDEO ANALYSIS REQUEST:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        isSuperAdmin: isSuperAdmin()
      });
    }

    // Camera Monitoring logging
    if (config.url.includes('/monitoring/') || config.url.includes('/cameras/')) {
      console.log('📹 CAMERA MONITORING REQUEST:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        isSuperAdmin: isSuperAdmin()
      });
    }

    // Environmental Intelligence logging
    if (config.url.includes('/environmental/')) {
      console.log('🌿 ENVIRONMENTAL INTELLIGENCE REQUEST:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        isSuperAdmin: isSuperAdmin()
      });
    }

    // Hospital Management logging
    if (config.url.includes('/hospital/') || config.url.includes('/medical/')) {
      console.log('🏥 HOSPITAL/MEDICAL API REQUEST:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        isSuperAdmin: isSuperAdmin()
      });
    }
    
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);


// src/services/api.js

api.interceptors.response.use(
  (response) => {
    // ✅ Safe access with optional chaining
    const url = response?.config?.url || 'unknown';
    console.log(`✅ API Response: ${response.status} ${url}`);
    
    // Check if response contains super admin info
    if (response.data?.is_super_admin === true || response.data?.super_admin_access === true) {
      console.log('👑 Super admin access confirmed in response');
      localStorage.setItem('is_super_admin', 'true');
      localStorage.setItem('user_plan', 'super_admin');
    }
    
    // Enhanced logging for specific endpoints
    if (response?.config?.url?.includes('environmental')) {
      console.log('✅ ENVIRONMENTAL API RESPONSE:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    
    if (response?.config?.url?.includes('/hse/industries/')) {
      console.log(`🏭 Industry API Success: ${response.config.url}`);
    }

    // Notification service logging
    if (response?.config?.url?.includes('notifications') || response?.config?.url?.includes('incidents')) {
      console.log('🔔 NOTIFICATION API SUCCESS:', {
        url: response.config.url,
        status: response.status
      });
    }

    // AI Service logging
    if (response?.config?.url?.includes('/ai/') || response?.config?.url?.includes('medical') || response?.config?.url?.includes('hospital')) {
      console.log('🤖 AI SERVICE SUCCESS:', {
        url: response.config.url,
        status: response.status
      });
    }

    // Video Analysis logging
    if (response?.config?.url?.includes('/video/') || response?.config?.url?.includes('video-analysis')) {
      console.log('🎥 VIDEO ANALYSIS SUCCESS:', {
        url: response.config.url,
        status: response.status
      });
    }

    // Camera Monitoring logging
    if (response?.config?.url?.includes('/monitoring/') || response?.config?.url?.includes('/cameras/')) {
      console.log('📹 CAMERA MONITORING SUCCESS:', {
        url: response.config.url,
        status: response.status
      });
    }

    // Environmental Intelligence logging
    if (response?.config?.url?.includes('/environmental/')) {
      console.log('🌿 ENVIRONMENTAL INTELLIGENCE SUCCESS:', {
        url: response.config.url,
        status: response.status
      });
    }

    // Hospital Management logging
    if (response?.config?.url?.includes('/hospital/') || response?.config?.url?.includes('/medical/')) {
      console.log('🏥 HOSPITAL/MEDICAL API SUCCESS:', {
        url: response.config.url,
        status: response.status
      });
    }
    
    // Check for plan-related data in response
    if (response.data && response.data.plan) {
      console.log(`📋 Plan data in response: ${response.data.plan}`);
      
      if (response.data.normalized_plan_data || response.data.is_plan_standardized) {
        console.log(`🔄 Updating user plan data from response`);
        updateUserPlanData(response.data);
      }
    }
    
    return response;
  },
  (error) => {
    // ✅ SAFE: Use optional chaining with fallbacks for ALL accesses
    const url = error?.config?.url || 'unknown';
    const method = error?.config?.method?.toUpperCase() || 'UNKNOWN';
    const status = error?.response?.status;
    const errorCode = error?.response?.data?.code;
    const errorData = error?.response?.data;
    
    console.error(`❌ API Error [${method} ${url}]:`, status, errorCode, errorData || error.message);
    
    // ✅ SUPER ADMIN BYPASS - Always allow for super admin
    if (isSuperAdmin()) {
      console.log('👑 SUPER ADMIN: Bypassing plan/feature check for error:', errorCode);
      return Promise.resolve({
        data: {
          success: true,
          is_super_admin: true,
          message: 'Super admin access granted',
          data: errorData?.data || {}
        }
      });
    }
    
    // ✅ Handle Network Errors (no response)
    if (!error.response) {
      console.error('🌐 Network error - backend may be down or unreachable');
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        isNetworkError: true,
        originalError: error
      });
    }
    
    // Handle plan-related errors
    if (errorCode === 'UPGRADE_REQUIRED' || errorCode === 'FEATURE_LIMIT_EXCEEDED') {
      console.warn('Plan upgrade required:', errorData);
      
      const upgradeInfo = errorData || {
        code: errorCode,
        message: errorData?.message || 'This feature requires a higher plan',
        userPlan: getUserPlan(),
        requiredPlan: errorData?.requiredPlan || 'pro'
      };
      
      localStorage.setItem('upgrade_info', JSON.stringify(upgradeInfo));
      
      showUpgradeModal(upgradeInfo);
      
      error.isPlanError = true;
      error.upgradeInfo = upgradeInfo;
      error.upgradeUrl = getUpgradeUrl(upgradeInfo.requiredPlan);
      
      return Promise.reject(error);
    }
    
    // Handle usage limit errors
    if (errorCode?.includes('_LIMIT_EXCEEDED')) {
      console.warn('Usage limit exceeded:', errorData);
      
      const limitInfo = errorData;
      if (limitInfo) {
        localStorage.setItem('limit_info', JSON.stringify(limitInfo));
      }
      
      if (limitInfo?.requires_upgrade) {
        showUpgradeModal({
          code: 'USAGE_LIMIT_EXCEEDED',
          message: limitInfo.message || 'You have reached your monthly usage limit',
          userPlan: getUserPlan(),
          requiredPlan: 'pro',
          usage: limitInfo.current_usage,
          limit: limitInfo.limit
        });
      }
      
      error.isUsageError = true;
      return Promise.reject(error);
    }
    
    // Industry-specific error handling
    if (url?.includes('/hse/industries/')) {
      console.error(`🏭 Industry API Error [${method} ${url}]:`, status);
      
      if (status === 503) {
        console.warn('Industry service temporarily unavailable');
      }
    }
    
    // Environmental API error handling
    if (url?.includes('environmental')) {
      console.log('❌ ENVIRONMENTAL API ERROR:', {
        url: url,
        status: status,
        data: errorData,
        message: error.message
      });
    }

    // Notification service error handling
    if (url?.includes('notifications') || url?.includes('incidents')) {
      console.error('🔔 NOTIFICATION API ERROR:', {
        url: url,
        status: status,
        data: errorData,
        message: error.message
      });
    }

    // AI Service error handling
    if (url?.includes('/ai/') || url?.includes('medical') || url?.includes('hospital')) {
      console.error('🤖 AI SERVICE ERROR:', {
        url: url,
        status: status,
        data: errorData,
        message: error.message
      });
    }

    // Video Analysis error handling
    if (url?.includes('/video/') || url?.includes('video-analysis')) {
      console.error('🎥 VIDEO ANALYSIS ERROR:', {
        url: url,
        status: status,
        data: errorData,
        message: error.message
      });
    }

    // Camera Monitoring error handling
    if (url?.includes('/monitoring/') || url?.includes('/cameras/')) {
      console.error('📹 CAMERA MONITORING ERROR:', {
        url: url,
        status: status,
        data: errorData,
        message: error.message
      });
    }

    // Environmental Intelligence error handling
    if (url?.includes('/environmental/')) {
      console.error('🌿 ENVIRONMENTAL INTELLIGENCE ERROR:', {
        url: url,
        status: status,
        data: errorData,
        message: error.message
      });
    }

    // Hospital Management error handling
    if (url?.includes('/hospital/') || url?.includes('/medical/')) {
      console.error('🏥 HOSPITAL/MEDICAL API ERROR:', {
        url: url,
        status: status,
        data: errorData,
        message: error.message
      });
    }
    
    // Handle different error cases
    if (status === 401) {
      // Unauthorized - clear tokens and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      // Forbidden - insufficient permissions
      console.warn('Access forbidden - insufficient permissions');
      
      if (errorData?.code === 'INSUFFICIENT_PLAN') {
        showUpgradeModal({
          code: 'INSUFFICIENT_PLAN',
          message: errorData?.message || 'Your current plan does not have access to this feature',
          userPlan: getUserPlan(),
          requiredPlan: errorData?.requiredPlan || 'pro'
        });
      }
    } else if (status === 404) {
      console.warn('API endpoint not found:', url);
    } else if (status === 422) {
      console.warn('Validation error:', errorData);
    } else if (status === 500) {
      console.error('Server error occurred:', errorData);
    } else if (error.code === 'ECONNABORTED' || error.code === 'TIMEOUT') {
      console.warn('Request timeout - server took too long to respond');
      return Promise.reject({
        message: 'Request timeout. Please try again.',
        isTimeoutError: true
      });
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      console.error('Network error - backend may be down');
    }
    
    return Promise.reject(error);
  }
);
// ==================== UPDATE USER PLAN DATA ====================

/**
 * Update user plan data in localStorage
 */
export const updateUserPlanData = (userData) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = {
      ...currentUser,
      ...userData
    };
    
    // Always normalize plan name before storing
    if (updatedUser.plan || updatedUser.subscription_plan || updatedUser.effective_plan) {
      const plan = updatedUser.plan || updatedUser.subscription_plan || updatedUser.effective_plan;
      updatedUser.effective_plan = normalizePlanName(plan);
      updatedUser.is_plan_standardized = true;
    }
    
    // Check for super admin status
    if (updatedUser.is_super_admin === true || 
        updatedUser.user_type === 'super_admin' || 
        updatedUser.role === 'super_admin') {
      updatedUser.effective_plan = 'super_admin';
      localStorage.setItem('is_super_admin', 'true');
      localStorage.setItem('user_plan', 'super_admin');
      console.log('👑 Super admin status detected and stored');
    }
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log(`✅ Updated user plan data in localStorage`);
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('userPlanUpdated', { 
      detail: { user: updatedUser } 
    }));
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user plan data:', error);
    return null;
  }
};
// ==================== API HELPER FUNCTIONS ====================

// Helper function for making API calls with enhanced error handling
export const apiCall = async (method, endpoint, data = null, config = {}) => {
  try {
    console.log(`🔵 apiCall: ${method} ${endpoint}`, { data, config });
    
    const response = await api({
      method,
      url: endpoint,
      data,
      ...config
    });
    console.log(`🔵 apiCall response:`, response);
    console.log(`🔵 apiCall response.data:`, response.data);

    return response.data;
  } catch (error) {
    // Enhanced error logging
    const errorInfo = {
      method,
      endpoint,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      isPlanError: error.isPlanError || false,
      upgradeInfo: error.upgradeInfo || null
    };
    
    console.error(`API Call Error [${method} ${endpoint}]:`, errorInfo);
    
    // Re-throw with more context
    const enhancedError = new Error(error.response?.data?.error || error.response?.data?.message || error.message);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    enhancedError.originalError = error;
    enhancedError.isPlanError = error.isPlanError;
    enhancedError.upgradeInfo = error.upgradeInfo;
    
    throw enhancedError;
  }
};

// Convenience methods for common HTTP verbs
export const apiGet = (endpoint, config = {}) => apiCall('GET', endpoint, null, config);
export const apiPost = (endpoint, data = {}, config = {}) => apiCall('POST', endpoint, data, config);
export const apiPut = (endpoint, data = {}, config = {}) => apiCall('PUT', endpoint, data, config);
export const apiPatch = (endpoint, data = {}, config = {}) => apiCall('PATCH', endpoint, data, config);
export const apiDelete = (endpoint, config = {}) => apiCall('DELETE', endpoint, null, config);

// Enhanced file upload helper
export const apiUpload = async (endpoint, formData, onUploadProgress = null, onDownloadProgress = null) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for large files
      ...(onUploadProgress && { onUploadProgress }),
      ...(onDownloadProgress && { onDownloadProgress })
    };
    
    console.log(`📤 Uploading file to: ${endpoint}`);
    const response = await api.post(endpoint, formData, config);
    console.log(`✅ Upload successful: ${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Upload Error (${endpoint}):`, error);
    
    // Handle specific upload errors
    if (error.response?.status === 413) {
      throw new Error('File too large. Please try a smaller file.');
    } else if (error.response?.status === 415) {
      throw new Error('File type not supported.');
    } else if (error.code === 'TIMEOUT') {
      throw new Error('Upload timeout. Please try again.');
    } else if (error.response?.status === 422) {
      throw new Error(error.response?.data?.error || 'Upload validation failed');
    }
    
    throw error;
  }
};


// File download helper
export const apiDownload = async (endpoint, filename, onDownloadProgress = null) => {
  try {
    console.log(`📥 Downloading file from: ${endpoint}`);
    const response = await api.get(endpoint, {
      responseType: 'blob',
      ...(onDownloadProgress && { onDownloadProgress })
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ Download completed: ${filename}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Download Error (${endpoint}):`, error);
    throw error;
  }
};

// Batch request helper with error tolerance
export const apiBatch = async (requests, options = { continueOnError: false }) => {
  try {
    console.log(`🔄 Batch request with ${requests.length} operations`);
    const responses = await Promise.all(requests.map(req => 
      req.catch(error => {
        if (options.continueOnError) {
          return { error: error.message, status: 'failed' };
        }
        throw error;
      })
    ));
    
    const successCount = responses.filter(r => !r.error).length;
    console.log(`✅ Batch completed: ${successCount}/${requests.length} successful`);
    
    return responses.map(response => 
      response.error ? response : response.data || response
    );
  } catch (error) {
    console.error('❌ Batch Request Error:', error);
    throw error;
  }
};

// Health check function
export const checkAPIHealth = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.HEALTH);
    console.log('✅ API Health Check: Healthy');
    return {
      healthy: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ API Health Check: Unhealthy', error.message);
    return {
      healthy: false,
      error: error.message
    };
  }
};

// Retry function for unreliable operations
export const apiRetry = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Retry attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      console.log(`✅ Retry successful on attempt ${attempt}`);
      return result;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`❌ All retry attempts failed after ${maxRetries} tries`);
        throw error;
      }
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay * attempt}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt)); // Exponential backoff
    }
  }
};

// Utility to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('jwtToken');
  return !!token;
};

// Utility to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('jwtToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  // Add super admin header if applicable
  if (isSuperAdmin()) {
    headers['X-Super-Admin'] = 'true';
  }
  
  return headers;
};

// ==================== API ENDPOINTS ====================

export const API_ENDPOINTS = {
  // Authentication - UPDATED TO MATCH YOUR BACKEND
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ADMIN_REGISTER: '/admin/register',
  ADMIN_LOGIN: '/admin/login',
  PROFILE: '/user/profile',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify',
  RESEND_VERIFICATION: '/auth/resend-verification',
  
  // Dashboard
  DASHBOARD_SUMMARY: '/dashboard/summary',
  EMPLOYEE_DASHBOARD: '/dashboard/employee',
  USER_DASHBOARD: '/dashboard/user',
  ADMIN_DASHBOARD: '/dashboard/admin',
  MODULE_DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD_STATS: '/admin/dashboard/stats',
  
  // ==================== HOSPITAL MANAGEMENT ENDPOINTS ====================
  HOSPITALS: '/hospital',
  HOSPITAL_BY_ID: (id) => `/hospital/${id}`,
  HOSPITAL_DEPARTMENTS: (hospitalId) => `/hospital/${hospitalId}/departments`,
  HOSPITAL_STAFF: (hospitalId) => `/hospital/${hospitalId}/staff`,
  HOSPITAL_EQUIPMENT: (hospitalId) => `/hospital/${hospitalId}/equipment`,
  HOSPITAL_ANALYTICS: (hospitalId) => `/hospital/${hospitalId}/analytics`,
  HOSPITAL_AI_ANALYTICS: (hospitalId) => `/hospital/${hospitalId}/ai-analytics`,
  HOSPITAL_AI_CAPABILITIES: (hospitalId) => `/hospital/${hospitalId}/ai-capabilities`,
  HOSPITAL_AI_SERVICES: '/hospital/ai-services',
  ENABLE_AI_SERVICE: (hospitalId) => `/hospital/${hospitalId}/ai-services/enable`,
  
  // ==================== MEDICAL AI ====================
  AI_MEDICAL_CHAT: '/ai/medical/chat',
  AI_MEDICAL_SYMPTOMS: '/ai/medical/symptoms',
  AI_MEDICAL_DISEASE_PREDICTION: '/ai/medical/predict-disease',
  AI_MEDICAL_LAB_ANALYSIS: '/ai/medical/analyze-lab',
  AI_MEDICAL_TEXT_ANALYSIS: '/ai/medical/analyze-text',
  AI_MEDICAL_SAFETY_ANALYSIS: '/ai/medical/analyze-safety',
  AI_MEDICAL_COMPREHENSIVE: '/ai/medical/comprehensive',
  AI_MEDICAL_MODELS_STATUS: '/ai/medical/models/status',
  AI_MEDICAL_MODEL_INFO: (modelName) => `/ai/medical/models/${modelName}`,
  AI_MEDICAL_HISTORY: '/ai/medical/history',
  AI_MEDICAL_BATCH: '/ai/medical/batch',
  AI_MEDICAL_USAGE: '/ai/medical/usage',
  
  // ==================== PATIENT MANAGEMENT ====================
  HOSPITAL_PATIENTS: (hospitalId) => `/hospital/${hospitalId}/patients`,
  HOSPITAL_PATIENT_BY_ID: (hospitalId, patientId) => `/hospital/${hospitalId}/patients/${patientId}`,
  HOSPITAL_PATIENT_ADMIT: (hospitalId) => `/hospital/${hospitalId}/patients/admit`,
  HOSPITAL_PATIENT_DISCHARGE: (hospitalId, patientId) => `/hospital/${hospitalId}/patients/${patientId}/discharge`,
  HOSPITAL_PATIENT_TRANSFER: (hospitalId, patientId) => `/hospital/${hospitalId}/patients/${patientId}/transfer`,
  HOSPITAL_PATIENT_TIMELINE: (hospitalId, patientId) => `/hospital/${hospitalId}/patients/${patientId}/timeline`,
  HOSPITAL_PATIENT_VITALS: (hospitalId, patientId) => `/hospital/${hospitalId}/patients/${patientId}/vitals`,
  HOSPITAL_PATIENT_RECORD_VITALS: (hospitalId) => `/hospital/${hospitalId}/patients/vitals`,
  
  // ==================== BED MANAGEMENT ====================
  HOSPITAL_BEDS: (hospitalId) => `/hospital/${hospitalId}/beds`,
  HOSPITAL_BED_BY_ID: (hospitalId, bedId) => `/hospital/${hospitalId}/beds/${bedId}`,
  
  // ==================== ACCREDITATION ====================
  HOSPITAL_ACCREDITATIONS: (hospitalId) => `/hospital/${hospitalId}/accreditations`,
  HOSPITAL_ACCREDITATION_BY_ID: (hospitalId, accreditationId) => `/hospital/${hospitalId}/accreditations/${accreditationId}`,
  HOSPITAL_QUALITY_INDICATORS: (hospitalId) => `/hospital/${hospitalId}/quality-indicators`,
  HOSPITAL_QUALITY_INDICATOR_BY_ID: (hospitalId, indicatorId) => `/hospital/${hospitalId}/quality-indicators/${indicatorId}`,
  
  // ==================== PATIENT SAFETY ====================
  HOSPITAL_SAFETY_GOALS: (hospitalId) => `/hospital/${hospitalId}/safety-goals`,
  HOSPITAL_SAFETY_GOAL_BY_ID: (hospitalId, goalId) => `/hospital/${hospitalId}/safety-goals/${goalId}`,
  
  // ==================== ADVERSE EVENTS ====================
  HOSPITAL_ADVERSE_EVENTS: (hospitalId) => `/hospital/${hospitalId}/adverse-events`,
  HOSPITAL_ADVERSE_EVENT_BY_ID: (hospitalId, eventId) => `/hospital/${hospitalId}/adverse-events/${eventId}`,
  HOSPITAL_ADVERSE_EVENT_RESOLVE: (hospitalId, eventId) => `/hospital/${hospitalId}/adverse-events/${eventId}/resolve`,
  
  // ==================== RISK ASSESSMENT ====================
  HOSPITAL_RISK_ASSESSMENTS: (hospitalId) => `/hospital/${hospitalId}/risk-assessments`,
  HOSPITAL_RISK_ASSESSMENT_BY_ID: (hospitalId, assessmentId) => `/hospital/${hospitalId}/risk-assessments/${assessmentId}`,
  
  // ==================== INFECTION CONTROL ====================
  HOSPITAL_INFECTION_CONTROL: (hospitalId) => `/hospital/${hospitalId}/infection-control`,
  HOSPITAL_INFECTION_REPORTS: (hospitalId) => `/hospital/${hospitalId}/infection-control/reports`,
  HOSPITAL_INFECTION_REPORT_BY_ID: (hospitalId, reportId) => `/hospital/${hospitalId}/infection-control/reports/${reportId}`,
  HOSPITAL_INFECTION_PROTOCOLS: (hospitalId) => `/hospital/${hospitalId}/infection-control/protocols`,
  HOSPITAL_INFECTION_PROTOCOL_BY_ID: (hospitalId, protocolId) => `/hospital/${hospitalId}/infection-control/protocols/${protocolId}`,
  
  // ==================== DISEASE SURVEILLANCE ====================
  HOSPITAL_DISEASE_SURVEILLANCE: (hospitalId) => `/hospital/${hospitalId}/disease-surveillance`,
  HOSPITAL_DISEASES: (hospitalId) => `/hospital/${hospitalId}/diseases`,
  HOSPITAL_DISEASE_BY_ID: (hospitalId, diseaseId) => `/hospital/${hospitalId}/diseases/${diseaseId}`,
  
  // ==================== EMERGENCY PREPAREDNESS ====================
  HOSPITAL_EMERGENCY_PREPAREDNESS: (hospitalId) => `/hospital/${hospitalId}/emergency-preparedness`,
  HOSPITAL_EMERGENCY_PLANS: (hospitalId) => `/hospital/${hospitalId}/emergency-plans`,
  HOSPITAL_EMERGENCY_PLAN_BY_ID: (hospitalId, planId) => `/hospital/${hospitalId}/emergency-plans/${planId}`,
  HOSPITAL_EMERGENCIES: (hospitalId) => `/hospital/${hospitalId}/emergencies`,
  HOSPITAL_EMERGENCY_BY_ID: (hospitalId, emergencyId) => `/hospital/${hospitalId}/emergencies/${emergencyId}`,
  
  // ==================== SAFETY ====================
  HOSPITAL_SAFETY_INCIDENTS: (hospitalId) => `/hospital/${hospitalId}/safety-incidents`,
  HOSPITAL_SAFETY_INCIDENT_BY_ID: (hospitalId, incidentId) => `/hospital/${hospitalId}/safety-incidents/${incidentId}`,
  HOSPITAL_SAFETY_INSPECTIONS: (hospitalId) => `/hospital/${hospitalId}/safety-inspections`,
  HOSPITAL_SAFETY_INSPECTION_BY_ID: (hospitalId, inspectionId) => `/hospital/${hospitalId}/safety-inspections/${inspectionId}`,
  HOSPITAL_SAFETY_EQUIPMENT: (hospitalId) => `/hospital/${hospitalId}/safety-equipment`,
  HOSPITAL_SAFETY_EQUIPMENT_BY_ID: (hospitalId, equipmentId) => `/hospital/${hospitalId}/safety-equipment/${equipmentId}`,
  HOSPITAL_SAFETY_TRAININGS: (hospitalId) => `/hospital/${hospitalId}/safety-trainings`,
  HOSPITAL_SAFETY_TRAINING_BY_ID: (hospitalId, trainingId) => `/hospital/${hospitalId}/safety-trainings/${trainingId}`,
  HOSPITAL_LAB_SAFETY: (hospitalId) => `/hospital/${hospitalId}/lab-safety`,
  HOSPITAL_LAB_SAFETY_BY_ID: (hospitalId, safetyId) => `/hospital/${hospitalId}/lab-safety/${safetyId}`,
  
  // ==================== COMPLIANCE ====================
  HOSPITAL_COMPLIANCE: (hospitalId) => `/hospital/${hospitalId}/compliance`,
  HOSPITAL_COMPLIANCE_BY_ID: (hospitalId, complianceId) => `/hospital/${hospitalId}/compliance/${complianceId}`,
  HOSPITAL_COMPLIANCE_REPORT: (hospitalId) => `/hospital/${hospitalId}/compliance-report`,
  
  // ==================== CLINICAL ====================
  HOSPITAL_CLINICAL_PROTOCOLS: (hospitalId) => `/hospital/${hospitalId}/clinical-protocols`,
  HOSPITAL_CLINICAL_PROTOCOL_BY_ID: (hospitalId, protocolId) => `/hospital/${hospitalId}/clinical-protocols/${protocolId}`,
  HOSPITAL_CLINICAL_TRIALS: (hospitalId) => `/hospital/${hospitalId}/clinical-trials`,
  HOSPITAL_CLINICAL_TRIAL_BY_ID: (hospitalId, trialId) => `/hospital/${hospitalId}/clinical-trials/${trialId}`,
  HOSPITAL_DATA_STANDARDS: (hospitalId) => `/hospital/${hospitalId}/data-standards`,
  HOSPITAL_DATA_STANDARD_BY_ID: (hospitalId, standardId) => `/hospital/${hospitalId}/data-standards/${standardId}`,
  
  // ==================== STAFF COMPETENCY ====================
  HOSPITAL_COMPETENCIES: (hospitalId) => `/hospital/${hospitalId}/competencies`,
  HOSPITAL_COMPETENCY_BY_ID: (hospitalId, competencyId) => `/hospital/${hospitalId}/competencies/${competencyId}`,
  
  // ==================== SUSTAINABILITY ====================
  HOSPITAL_SUSTAINABILITY: (hospitalId) => `/hospital/${hospitalId}/sustainability`,
  HOSPITAL_SUSTAINABILITY_BY_ID: (hospitalId, metricId) => `/hospital/${hospitalId}/sustainability/${metricId}`,
  
  // ==================== CYBERSECURITY ====================
  HOSPITAL_CYBERSECURITY: (hospitalId) => `/hospital/${hospitalId}/cybersecurity`,
  HOSPITAL_CYBERSECURITY_BY_ID: (hospitalId, frameworkId) => `/hospital/${hospitalId}/cybersecurity/${frameworkId}`,
  HOSPITAL_SECURITY_INCIDENTS: (hospitalId) => `/hospital/${hospitalId}/security-incidents`,
  HOSPITAL_SECURITY_INCIDENT_BY_ID: (hospitalId, incidentId) => `/hospital/${hospitalId}/security-incidents/${incidentId}`,
  
  // ==================== GLOBAL HEALTH ====================
  HOSPITAL_GLOBAL_HEALTH: (hospitalId) => `/hospital/${hospitalId}/global-health`,
  HOSPITAL_GLOBAL_HEALTH_BY_ID: (hospitalId, initiativeId) => `/hospital/${hospitalId}/global-health/${initiativeId}`,
  
  // ==================== MEDICAL RECORDS ====================
  HOSPITAL_MEDICAL_RECORDS: (hospitalId) => `/hospital/${hospitalId}/medical-records`,
  HOSPITAL_MEDICAL_RECORD_BY_ID: (hospitalId, recordId) => `/hospital/${hospitalId}/medical-records/${recordId}`,
  
  // ==================== WASTE MANAGEMENT ====================
  HOSPITAL_WASTE_MANAGEMENT: (hospitalId) => `/hospital/${hospitalId}/waste-management`,
  HOSPITAL_WASTE_REPORTS: (hospitalId) => `/hospital/${hospitalId}/waste-reports`,
  HOSPITAL_WASTE_REPORT_BY_ID: (hospitalId, reportId) => `/hospital/${hospitalId}/waste-reports/${reportId}`,
  
  // ==================== CLINICAL NOTES ====================
  HOSPITAL_CLINICAL_NOTES: (hospitalId, patientId) => `/hospital/${hospitalId}/patients/${patientId}/clinical-notes`,
  HOSPITAL_CLINICAL_NOTE_BY_ID: (hospitalId, noteId) => `/hospital/${hospitalId}/clinical-notes/${noteId}`,
  
  // ==================== LAB RESULTS ====================
  HOSPITAL_LAB_RESULTS: (hospitalId, patientId) => `/hospital/${hospitalId}/patients/${patientId}/lab-results`,
  HOSPITAL_LAB_RESULT_BY_ID: (hospitalId, resultId) => `/hospital/${hospitalId}/lab-results/${resultId}`,
  
  // ==================== IMAGING STUDIES ====================
  HOSPITAL_IMAGING_STUDIES: (hospitalId, patientId) => `/hospital/${hospitalId}/patients/${patientId}/imaging-studies`,
  HOSPITAL_IMAGING_STUDY_BY_ID: (hospitalId, studyId) => `/hospital/${hospitalId}/imaging-studies/${studyId}`,
  
  // ==================== MEDICATIONS ====================
  HOSPITAL_PRESCRIPTIONS: (hospitalId) => `/hospital/${hospitalId}/prescriptions`,
  HOSPITAL_PRESCRIPTION_BY_ID: (hospitalId, prescriptionId) => `/hospital/${hospitalId}/prescriptions/${prescriptionId}`,
  HOSPITAL_PATIENT_MEDICATIONS: (hospitalId, patientId) => `/hospital/${hospitalId}/patients/${patientId}/medications`,
  
  // ==================== PATIENT FEEDBACK ====================
  HOSPITAL_FEEDBACK: (hospitalId) => `/hospital/${hospitalId}/feedback`,
  HOSPITAL_FEEDBACK_BY_ID: (hospitalId, feedbackId) => `/hospital/${hospitalId}/feedback/${feedbackId}`,
  
  // ==================== QUALITY REPORTS ====================
  HOSPITAL_QUALITY_REPORT: (hospitalId) => `/hospital/${hospitalId}/quality-report`,
  
  // ==================== REPORTS ====================
  HOSPITAL_REPORTS: (hospitalId) => `/hospital/${hospitalId}/reports`,
  HOSPITAL_REPORT_BY_ID: (hospitalId, reportId) => `/hospital/${hospitalId}/reports/${reportId}`,
  
  // ==================== NOTIFICATIONS ====================
  HOSPITAL_NOTIFICATIONS: (hospitalId) => `/hospital/${hospitalId}/notifications`,
  HOSPITAL_NOTIFICATION_BY_ID: (hospitalId, notificationId) => `/hospital/${hospitalId}/notifications/${notificationId}`,
  HOSPITAL_NOTIFICATION_READ: (hospitalId, notificationId) => `/hospital/${hospitalId}/notifications/${notificationId}/read`,
  
  // ==================== AUDIT LOGS ====================
  HOSPITAL_AUDIT_LOGS: (hospitalId) => `/hospital/${hospitalId}/audit-logs`,
  HOSPITAL_AUDIT_LOG_BY_ID: (hospitalId, logId) => `/hospital/${hospitalId}/audit-logs/${logId}`,
  
  // ==================== DEPARTMENT STATS ====================
  HOSPITAL_DEPARTMENT_STATS: (hospitalId, departmentId) => `/hospital/${hospitalId}/departments/${departmentId}/stats`,

  
  // ==================== MEDICAL AI SERVICES ENDPOINTS ====================
  AI_MEDICAL_CHAT: '/ai/medical/chat',
  AI_MEDICAL_SYMPTOMS: '/ai/medical/symptoms',
  AI_MEDICAL_DISEASE_PREDICTION: '/ai/medical/disease-prediction',
  AI_MEDICAL_LAB_ANALYSIS: '/ai/medical/lab-analysis',
  AI_MEDICAL_TEXT_ANALYSIS: '/ai/medical/text-analysis',
  AI_MEDICAL_SAFETY_ANALYSIS: '/ai/medical/safety-analysis',
  AI_MEDICAL_COMPREHENSIVE: '/ai/medical/comprehensive',
  AI_MEDICAL_MODELS_STATUS: '/ai/medical/models/status',
  AI_MEDICAL_MODEL_INFO: (modelName) => `/ai/medical/models/${modelName}`,
  AI_MEDICAL_HISTORY: '/ai/medical/history',
  AI_MEDICAL_BATCH: '/ai/medical/batch',
  AI_MEDICAL_USAGE: '/ai/medical/usage',
  
  // Admin Management - COMPLETE ENDPOINTS
  ADMIN_USERS: '/admin/users',
  ADMIN_PENDING_APPROVALS: '/admin/pending-approvals',
  ADMIN_APPROVE: '/admin/approve',
  
  // Employee Management
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_EMPLOYEES_EXPORT: '/admin/employees/export',
  
  // System Management
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_BACKUP: '/admin/backup',
  ADMIN_RESTORE: '/admin/restore',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_EMAIL_TEMPLATES: '/admin/email-templates',
  ADMIN_NOTIFICATIONS_BULK: '/admin/notifications/bulk',
  
  // Analytics
  MODULE_ANALYTICS: '/analytics',
  PLATFORM_ANALYTICS: '/admin/analytics',
  
  // Documents
  DOCUMENTS: '/documents',
  UPLOAD_DOCUMENT: '/documents/upload',
  ANALYZE_DOCUMENT: '/documents/analyze',
  ANALYZE_MULTI: '/documents/analyze-multi',
  
  // ==================== INCIDENT & NOTIFICATION ENDPOINTS ====================
  INCIDENTS: '/incidents',
  REPORT_INCIDENT: '/incidents/report',
  MODULE_INCIDENTS: '/incidents',
  ADMIN_INCIDENTS: '/admin/incidents',
  INCIDENT_BY_ID: (id) => `/incidents/${id}`,
  INCIDENT_STATUS: (id) => `/incidents/${id}/status`,
  INCIDENT_ASSIGN: (id) => `/incidents/${id}/assign`,
  INCIDENT_INVESTIGATION_NOTES: (id) => `/incidents/${id}/investigation-notes`,
  INCIDENT_EVIDENCE: '/incidents/evidence',
  INCIDENT_STATS: '/incidents/stats',
  INCIDENT_EXPORT: '/incidents/export',

  // ==================== NOTIFICATION MANAGEMENT ====================
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_BY_ID: (id) => `/notifications/${id}`,
  MARK_NOTIFICATION_READ: (id) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/mark-read',
  NOTIFICATION_PREFERENCES: (userId) => `/notifications/preferences/${userId}`,
  NOTIFICATION_BULK: '/notifications/bulk',
  CLEAR_ALL_NOTIFICATIONS: '/notifications/clear-all',
  NOTIFICATION_STATS: '/notifications/stats',
  
  // AI Services
  AI_DOCUMENTS_GENERATE: '/ai/documents/generate',
  AI_DOCUMENTS_HISTORY: '/ai/documents/history',
  AI_INSIGHTS: '/ai/insights',
  
  // ✅ ADDED: COMPREHENSIVE AI MEDICAL SERVICES
  AI_CHAT: '/ai/chat',
  AI_ANALYZE_HOSPITAL_DATA: '/ai/analyze-hospital-data',
  AI_ANALYZE_PATIENT_DATA: '/ai/analyze-patient-data',
  AI_ANALYZE_MEDICAL_EQUIPMENT: '/ai/analyze-medical-equipment',
  AI_ANALYZE_STAFF_PERFORMANCE: '/ai/analyze-staff-performance',
  AI_ANALYZE_DEPARTMENT_EFFICIENCY: '/ai/analyze-department-efficiency',
  AI_OPTIMIZE_HOSPITAL_RESOURCES: '/ai/optimize-hospital-resources',
  AI_PREDICT_PATIENT_ADMISSIONS: '/ai/predict-patient-admissions',
  AI_ANALYZE_MEDICAL_RESEARCH: '/ai/analyze-medical-research',
  AI_ANALYZE_CLINICAL_TRIALS: '/ai/analyze-clinical-trials',
  AI_ANALYZE_DRUG_INTERACTIONS: '/ai/analyze-drug-interactions',
  AI_RECOMMEND_TREATMENT: '/ai/recommend-treatment',
  AI_ANALYZE_MEDICAL_PROTOCOLS: '/ai/analyze-medical-protocols',
  
  // ==================== VIDEO ANALYSIS ENDPOINTS - UPDATED FOR YOLOv5 ====================
  VIDEO_ANALYZE: '/video/analyze',
  VIDEO_ANALYZE_RISKS: '/video/analyze/risks',
  VIDEO_ANALYZE_PPE: '/video/analyze/ppe',
  VIDEO_ANALYSIS_REPORT: (analysisId) => `/video/analysis/${analysisId}/report`,
  VIDEO_ANALYSIS_HISTORY: '/video/analysis/history',
  VIDEO_ANALYSIS_GET: (analysisId) => `/video/analysis/${analysisId}`,
  VIDEO_ANALYSIS_DELETE: (analysisId) => `/video/analysis/${analysisId}/delete`,
  VIDEO_ANALYTICS_SUMMARY: '/video/analytics/summary',
  
  // Legacy AI video endpoints (for backward compatibility)
  AI_VIDEO_ANALYSIS_CUSTOM: '/ai/video-analysis/custom',
  AI_GENERATE_REPORT: '/ai/generate-report',
  AI_VIDEO_ANALYSIS_HISTORY: '/ai/video-analysis/history',
  AI_VIDEO_ANALYSIS_RESULT: '/ai/video-analysis/result',
  
  // ==================== CAMERA MONITORING ENDPOINTS - RESTORED ====================
  MONITORING_START: '/api/monitoring/start',
  MONITORING_STOP: '/api/monitoring/stop',
  MONITORING_STATUS: '/api/monitoring/status',
  MONITORING_VIOLATIONS: '/api/monitoring/violations',
  CAMERAS_LIST: '/api/cameras/list',
  CAMERAS_UPDATE_STATUS: '/api/cameras/update-status',
  
  // ==================== ENVIRONMENTAL INTELLIGENCE ENDPOINTS - RESTORED ====================
  ENVIRONMENTAL_INTELLIGENCE: '/api/environmental/intelligence/dashboard',
  ENVIRONMENTAL_PREDICTIVE_ANALYTICS: '/api/environmental/analytics/predictive',
  ENVIRONMENTAL_COMPLIANCE_AUTOMATION: '/api/environmental/compliance/automation',
  ENVIRONMENTAL_IMPACT_SCORECARD: '/api/environmental/impact/scorecard',
  ENVIRONMENTAL_SMART_ALERTS: '/api/environmental/alerts/smart',
  ENVIRONMENTAL_ACKNOWLEDGE_ALERT: '/api/environmental/alerts',
  ENVIRONMENTAL_SUSTAINABILITY_GOALS: '/api/environmental/sustainability/goals',
  
  // Environmental AI Services
  AI_ENVIRONMENTAL_ANALYZE_COMPREHENSIVE: '/ai/environmental/analyze-comprehensive',
  AI_ENVIRONMENTAL_PREDICT_AIR_QUALITY: '/ai/environmental/predict-air-quality',
  AI_ENVIRONMENTAL_ASSESS_RISK: '/ai/environmental/assess-risk',
  AI_ENVIRONMENTAL_DETECT_ANOMALIES: '/ai/environmental/detect-anomalies',
  AI_ENVIRONMENTAL_ADVANCED_ANALYSIS: '/ai/environmental/advanced-analysis',
  AI_ENVIRONMENTAL_POLLUTION_MAPPING: '/ai/environmental/pollution-mapping',
  AI_ENVIRONMENTAL_ESG_SCORING: '/ai/environmental/esg-scoring',
  AI_ENVIRONMENTAL_SUSTAINABILITY_REPORT: '/ai/environmental/sustainability-report',
  AI_ENVIRONMENTAL_PREDICTIVE_FORECAST: '/ai/environmental/predictive-forecast',
  AI_ENVIRONMENTAL_IMPACT_ASSESSMENT: '/ai/environmental/impact-assessment',
  AI_ENVIRONMENTAL_COMPLIANCE_PREDICTION: '/ai/environmental/compliance-prediction',
  AI_ENVIRONMENTAL_RESOURCE_OPTIMIZATION: '/ai/environmental/resource-optimization',
  
  // Industry-Specific HSE Endpoints
  HSE_INDUSTRIES: '/hse/industries',
  HSE_INDUSTRY_CONFIG: (industryId) => `/hse/industries/${industryId}`,
  HSE_INDUSTRY_DASHBOARD: (industryId) => `/hse/industries/${industryId}/dashboard`,
  HSE_INDUSTRY_PREFERENCES: (industryId) => `/hse/industries/${industryId}/preferences`,
  
  // Industry Documents & Templates
  HSE_INDUSTRY_TEMPLATES: (industryId) => `/hse/industries/${industryId}/templates`,
  HSE_TEMPLATE_DETAIL: (templateId) => `/hse/templates/${templateId}`,
  HSE_TEMPLATE_DOWNLOAD: (templateId) => `/hse/templates/${templateId}/download`,
  HSE_TEMPLATE_CREATE: (industryId) => `/hse/industries/${industryId}/templates`,
  HSE_TEMPLATE_UPDATE: (templateId) => `/hse/templates/${templateId}`,
  HSE_TEMPLATE_DELETE: (templateId) => `/hse/templates/${templateId}`,
  HSE_TEMPLATE_CATEGORIES: (industryId) => `/hse/industries/${industryId}/template-categories`,
  
  // Safety Tools
  HSE_INDUSTRY_TOOLS: (industryId) => `/hse/industries/${industryId}/tools`,
  HSE_TOOL_EXECUTE: (toolId) => `/hse/tools/${toolId}/execute`,
  HSE_TOOL_RESULTS: (executionId) => `/hse/tools/executions/${executionId}`,
  HSE_TOOL_CONFIG: (toolId) => `/hse/tools/${toolId}/config`,
  
  // AI Services
  HSE_INDUSTRY_AI_SERVICES: (industryId) => `/hse/industries/${industryId}/ai-services`,
  HSE_AI_GENERATE_DOCUMENT: (industryId) => `/hse/ai/${industryId}/generate-document`,
  HSE_AI_ANALYZE_RISK: (industryId) => `/hse/ai/${industryId}/analyze-risk`,
  HSE_AI_PREDICT_INCIDENTS: (industryId) => `/hse/ai/${industryId}/predict-incidents`,
  HSE_AI_RECOMMENDATIONS: (industryId) => `/hse/ai/${industryId}/recommendations`,
  HSE_AI_SERVICE_STATUS: (serviceId) => `/hse/ai/services/${serviceId}/status`,
  
  // Training Management
  HSE_TRAINING_COURSES: (industryId) => `/hse/industries/${industryId}/training`,
  HSE_TRAINING_RECORDS: (industryId) => `/hse/industries/${industryId}/training-records`,
  HSE_TRAINING_SCHEDULE: (industryId) => `/hse/industries/${industryId}/training/schedule`,
  HSE_TRAINING_PROGRESS: (recordId) => `/hse/training/records/${recordId}`,
  HSE_TRAINING_COMPLIANCE: (industryId) => `/hse/industries/${industryId}/training-compliance`,
  
  // Incident Management
  HSE_INDUSTRY_INCIDENTS: (industryId) => `/hse/industries/${industryId}/incidents`,
  HSE_INCIDENT_REPORT: (industryId) => `/hse/industries/${industryId}/incidents`,
  HSE_INCIDENT_UPDATE: (incidentId) => `/hse/incidents/${incidentId}`,
  HSE_INCIDENT_STATS: (industryId) => `/hse/industries/${industryId}/incidents/stats`,
  HSE_INCIDENT_ATTACHMENTS: (incidentId) => `/hse/incidents/${incidentId}/attachments`,
  
  // Risk Assessment
  HSE_RISK_ASSESSMENTS: (industryId) => `/hse/industries/${industryId}/risk-assessments`,
  HSE_RISK_ASSESSMENT_CREATE: (industryId) => `/hse/industries/${industryId}/risk-assessments`,
  HSE_RISK_ASSESSMENT_UPDATE: (assessmentId) => `/hse/risk-assessments/${assessmentId}`,
  HSE_RISK_CALCULATOR: (industryId) => `/hse/industries/${industryId}/risk-calculator`,
  HSE_RISK_MATRIX: (industryId) => `/hse/industries/${industryId}/risk-matrix`,
  
  // Compliance Management
  HSE_COMPLIANCE_REQUIREMENTS: (industryId) => `/hse/industries/${industryId}/compliance`,
  HSE_COMPLIANCE_STATUS: (industryId) => `/hse/industries/${industryId}/compliance-status`,
  HSE_COMPLIANCE_EVIDENCE: (requirementId) => `/hse/compliance/${requirementId}/evidence`,
  HSE_AUDIT_HISTORY: (industryId) => `/hse/industries/${industryId}/audits`,
  
  // Safety Inspection
  HSE_INSPECTIONS: (industryId) => `/hse/industries/${industryId}/inspections`,
  HSE_INSPECTION_CREATE: (industryId) => `/hse/industries/${industryId}/inspections`,
  HSE_INSPECTION_UPDATE: (inspectionId) => `/hse/inspections/${inspectionId}`,
  HSE_INSPECTION_FINDINGS: (inspectionId) => `/hse/inspections/${inspectionId}/findings`,
  HSE_INSPECTION_TEMPLATES: (industryId) => `/hse/industries/${industryId}/inspection-templates`,
  
  // Permit to Work (PTW)
  HSE_PTW_TEMPLATES: (industryId) => `/hse/industries/${industryId}/ptw-templates`,
  HSE_PTW_REQUEST_CREATE: (industryId) => `/hse/industries/${industryId}/ptw-requests`,
  HSE_PTW_REQUESTS: (industryId) => `/hse/industries/${industryId}/ptw-requests`,
  HSE_PTW_REVIEW: (ptwId) => `/hse/ptw-requests/${ptwId}/review`,
  HSE_PTW_CLOSE: (ptwId) => `/hse/ptw-requests/${ptwId}/close`,
  
  // Dashboard Analytics
  HSE_SAFETY_METRICS: (industryId) => `/hse/industries/${industryId}/metrics`,
  HSE_TRENDS: (industryId) => `/hse/industries/${industryId}/trends`,
  HSE_COMPARATIVE_ANALYTICS: (industryId) => `/hse/industries/${industryId}/comparative`,
  
  // Real-time Monitoring
  HSE_REAL_TIME_DATA: (industryId) => `/hse/industries/${industryId}/monitoring`,
  HSE_SUBSCRIBE_UPDATES: (industryId) => `/hse/industries/${industryId}/subscribe`,
  HSE_ALERTS: (industryId) => `/hse/industries/${industryId}/alerts`,
  HSE_ALERT_ACKNOWLEDGE: (alertId) => `/hse/alerts/${alertId}/acknowledge`,
  
  // Industry-Specific Endpoints
  OIL_GAS_PSM: (facilityId) => `/hse/oil-gas/facilities/${facilityId}/psm`,
  OIL_GAS_WELL_CONTROL: (wellId) => `/hse/oil-gas/wells/${wellId}/control-status`,
  OIL_GAS_PIPELINE_SAFETY: (pipelineId) => `/hse/oil-gas/pipelines/${pipelineId}/safety`,
  
  CONSTRUCTION_SCAFFOLD: (siteId) => `/hse/construction/sites/${siteId}/scaffolds`,
  CONSTRUCTION_FALL_PROTECTION: (siteId) => `/hse/construction/sites/${siteId}/fall-protection`,
  CONSTRUCTION_EQUIPMENT: (siteId) => `/hse/construction/sites/${siteId}/equipment`,
  
  HEALTHCARE_INFECTION: (facilityId) => `/hse/healthcare/facilities/${facilityId}/infection-control`,
  HEALTHCARE_PATIENT_SAFETY: (facilityId) => `/hse/healthcare/facilities/${facilityId}/patient-safety`,
  HEALTHCARE_BIOHAZARD: (facilityId) => `/hse/healthcare/facilities/${facilityId}/biohazards`,
  BASE: '/documents',
  GET: (id) => `/documents/${id}`,
  CREATE: '/documents',
  UPDATE: (id) => `/documents/${id}`,
  DELETE: (id) => `/documents/${id}`,
  RESTORE: (id) => `/documents/${id}/restore`,
  // File Upload
  UPLOAD_FILE: '/upload',
  UPLOAD_MULTIPLE: '/upload/multiple',
  
  // Notifications (Legacy - keep for backward compatibility)
  MARK_NOTIFICATION_READ_LEGACY: '/notifications',
  
  // Monitoring
  CAMERA_FEEDS: '/monitoring/cameras',
  MONITORING_ALERTS: '/monitoring/alerts',
  
  // User Management
  PLATFORM_USERS: '/admin/users',
  
  // File Upload
  STORAGE_STATUS: '/storage/status',
  USER_FILES: '/files',
  
  // Module Data
  MODULES: {
    HOSPITAL: '/modules/hospital',
    HSE: '/modules/hse',
    ENVIRONMENTAL: '/environmental/air-quality/sensors',
    QUALITY: '/modules/quality'
  },
  
  // Tasks
  EMPLOYEE_TASKS: '/tasks/employee',
  
  // Team Management
  TEAM: '/team',
  
  // Templates
  TEMPLATES: '/templates',
  
  // Workflow
  WORKFLOW: '/workflow',
  
  // Subscription
  SUBSCRIPTION: '/subscription',
  
  // Referral
  REFERRAL: '/referral',
  
  // Reports
  REPORTS: '/reports',
  
  // Project Upload
  PROJECT_UPLOAD: '/project-upload',
  
  // Compliance
  COMPLIANCE: '/compliance',
  
  // Supply Chain
  SUPPLY_CHAIN: '/supplychain',
  SUPPLIER_PERFORMANCE: '/supplychain/suppliers',
  INVENTORY_DATA: '/supplychain/inventory',
  PENDING_ORDERS: '/supplychain/orders/pending',
  CREATE_PURCHASE_ORDER: '/supplychain/orders',
  UPDATE_INVENTORY: '/supplychain/inventory',
  
  // Template Marketplace
  TEMPLATE_MARKETPLACE: '/template-marketplace',
  
  // AI Services - MEDICAL & HOSPITAL
  AI_ANALYZE_SYMPTOMS: '/ai/analyze-symptoms',
  AI_PREDICT_DISEASE: '/ai/predict-disease',
  AI_ANALYZE_MEDICAL_TEXT: '/ai/analyze-medical-text',
  AI_SUMMARIZE_MEDICAL: '/ai/summarize-medical',
  AI_ANALYZE_LAB_RESULTS: '/ai/analyze-lab-results',
  AI_ANALYZE_MEDICAL_IMAGE: '/ai/analyze-medical-image',
  
  // Safety AI
  AI_ASSESS_RISK: '/ai/assess-risk',
  AI_ANALYZE_SAFETY_DOCUMENT: '/ai/analyze-safety-document',
  AI_ANALYZE_SAFETY_VIDEO: '/ai/analyze-safety-video',
  AI_ANALYZE_ENVIRONMENTAL: '/ai/analyze-environmental',
  AI_PREDICT_AIR_QUALITY: '/ai/predict-air-quality',
  AI_DETECT_OBJECTS: '/ai/detect-objects',
  
  // Generic AI
  AI_ANALYZE: '/ai/analyze',
  
  DEEPSEEK_GENERATE_DOCUMENT: '/deepseek/generate-document',
  DEEPSEEK_CHAT: '/deepseek/chat',
  DEEPSEEK_GENERATE_EXAM: '/deepseek/generate-exam',
  DEEPSEEK_ENHANCE_CONTENT: '/deepseek/enhance-content',
  DEEPSEEK_USAGE_STATS: '/deepseek/usage-stats',
  SEARCH: '/documents/search',
  GLOBAL_SEARCH: '/documents/global-search',
  FILTER: '/documents/filter',
  
  // Version Control
  VERSIONS: (id) => `/documents/${id}/versions`,
  CREATE_VERSION: (id) => `/documents/${id}/version`,
  ROLLBACK: (id) => `/documents/${id}/rollback`,
  
  // Workflow
  SUBMIT: (id) => `/documents/${id}/submit`,
  REVIEW: (id) => `/documents/${id}/review`,
  APPROVE: (id) => `/documents/${id}/approve`,
  REJECT: (id) => `/documents/${id}/reject`,
  PUBLISH: (id) => `/documents/${id}/publish`,
  ARCHIVE: (id) => `/documents/${id}/archive`,
  
  // Review Management
  REVIEW_DOCUMENTS: '/documents/review',
  REVIEW_HISTORY: (id) => `/documents/${id}/review-history`,
  REVIEW_DETAIL: (id) => `/documents/${id}/review-detail`,
  UPDATE_REVIEW_DATE: (id) => `/documents/${id}/review-date`,
  COMPLETE_REVIEW: (id) => `/documents/${id}/complete-review`,
  SEND_REMINDERS: '/documents/send-reminders',
  BULK_REVIEW_STATUS: '/documents/bulk-review-status',
  EXPIRING: '/documents/expiring',
  OVERDUE: '/documents/overdue',
  
  // Audit
  AUDIT: '/documents/audit',
  AUDIT_EXPORT: '/documents/audit/export',
  COMPLIANCE: (id) => `/documents/${id}/compliance`,
  
  // Integration (Links)
  LINKS: '/documents/links',
  LINKS_AVAILABLE: '/documents/links/available',
  LINK_CREATE: '/documents/links',
  LINK_REMOVE: (id) => `/documents/links/${id}`,
  LINKS_BULK_REMOVE: '/documents/links/bulk-remove',
  
  // Bulk Operations
  BULK_STATUS: '/documents/bulk/status',
  BULK_DELETE: '/documents/bulk/delete',
  BULK_TAGS: '/documents/bulk/tags',
  BULK_ARCHIVE: '/documents/bulk/archive',
  BULK_PUBLISH: '/documents/bulk/publish',
  BULK_MARK_REVIEWED: '/documents/bulk/mark-reviewed',
  BULK_UPLOAD: '/documents/bulk/upload',
  
  // Import/Export
  IMPORT: '/documents/import',
  EXPORT: '/documents/export',
  EXPORT_CSV: '/documents/export/csv',
  EXPORT_PDF: '/documents/export/pdf',
  
  // Editor
  AUTOSAVE: (id) => `/documents/${id}/autosave`,
  UPLOAD_IMAGE: '/documents/upload-image',
  CONTENT: (id) => `/documents/${id}/content`,
  
  // Signatures
  SIGNATURES: (id) => `/documents/${id}/signatures`,
  SIGNATURE_CREATE: '/documents/signatures',
  SIGNATURE_VERIFY: (id) => `/documents/signatures/${id}/verify`,
  SIGNATURE_REVOKE: (id) => `/documents/signatures/${id}/revoke`,
  SIGNATURE_HISTORY: (id) => `/documents/signatures/${id}/history`,
  SIGNATURE_CERTIFICATE: (id) => `/documents/signatures/${id}/certificate`,
  
  // Saved Searches
  SAVED_SEARCHES: '/documents/saved-searches',
  SAVED_SEARCH_DELETE: (id) => `/documents/saved-searches/${id}`,
  
  // Search History
  SEARCH_HISTORY: '/documents/search-history',
  SEARCH_HISTORY_CLEAR: '/documents/search-history/clear',
  
  // Stats & Analytics
  STATS: '/documents/stats',
  MODULE_STATS: '/documents/stats/modules',
  ANALYTICS: '/documents/analytics',
  REVIEW_ANALYTICS: '/documents/analytics/reviews',
  COMPLIANCE_ANALYTICS: '/documents/analytics/compliance',
  
  // Recent & Tasks
  RECENT: '/documents/recent',
  PENDING_TASKS: '/documents/pending-tasks',
  
  // Download & Preview
  DOWNLOAD: (id) => `/documents/${id}/download`,
  PREVIEW: (id) => `/documents/${id}/preview`,
  BULK_DOWNLOAD: '/documents/bulk-download',
  
  // AI Features
  ANALYZE_AI: (id) => `/documents/${id}/analyze`,
  SUGGEST_TAGS: (id) => `/documents/${id}/suggest-tags`,
  EXTRACT_INFO: (id) => `/documents/${id}/extract-info`,
  CHECK_COMPLIANCE: (id) => `/documents/${id}/check-compliance`,
  
  // Sharing
  SHARE: (id) => `/documents/${id}/share`,
  SHARING_SETTINGS: (id) => `/documents/${id}/sharing`,
  REMOVE_SHARE: (id, userId) => `/documents/${id}/share/${userId}`,
  
  // Expiry
  EXTEND_EXPIRY: (id) => `/documents/${id}/extend-expiry`,


  // Health Check
  HEALTH: '/health'
};


// ==================== HOSPITAL MANAGEMENT SERVICE INTEGRATION ====================

// Hospital Management Service API methods
export const hospitalServiceAPI = {
  // Core hospital operations
  getHospitals: () => apiGet(API_ENDPOINTS.HOSPITALS),
  getHospitalById: (id) => apiGet(API_ENDPOINTS.HOSPITAL_BY_ID(id)),
  createHospital: (hospitalData) => apiPost(API_ENDPOINTS.HOSPITALS, hospitalData),
  updateHospital: (id, hospitalData) => apiPut(API_ENDPOINTS.HOSPITAL_BY_ID(id), hospitalData),
  deleteHospital: (id) => apiDelete(API_ENDPOINTS.HOSPITAL_BY_ID(id)),

  // Department management
  getDepartments: (hospitalId) => apiGet(API_ENDPOINTS.HOSPITAL_DEPARTMENTS(hospitalId)),
  createDepartment: (hospitalId, departmentData) => 
    apiPost(API_ENDPOINTS.HOSPITAL_DEPARTMENTS(hospitalId), departmentData),
  updateDepartment: (hospitalId, departmentId, departmentData) => 
    apiPut(`${API_ENDPOINTS.HOSPITAL_DEPARTMENTS(hospitalId)}/${departmentId}`, departmentData),
  deleteDepartment: (hospitalId, departmentId) => 
    apiDelete(`${API_ENDPOINTS.HOSPITAL_DEPARTMENTS(hospitalId)}/${departmentId}`),
  getDepartmentStats: (hospitalId, departmentId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_DEPARTMENT_STATS(hospitalId, departmentId)),

  // Staff management
  getStaff: (hospitalId) => apiGet(API_ENDPOINTS.HOSPITAL_STAFF(hospitalId)),
  createStaff: (hospitalId, staffData) => 
    apiPost(API_ENDPOINTS.HOSPITAL_STAFF(hospitalId), staffData),
  updateStaff: (hospitalId, staffId, staffData) => 
    apiPut(`${API_ENDPOINTS.HOSPITAL_STAFF(hospitalId)}/${staffId}`, staffData),
  deleteStaff: (hospitalId, staffId) => 
    apiDelete(`${API_ENDPOINTS.HOSPITAL_STAFF(hospitalId)}/${staffId}`),

  // Equipment management
  getEquipment: (hospitalId) => apiGet(API_ENDPOINTS.HOSPITAL_EQUIPMENT(hospitalId)),
  createEquipment: (hospitalId, equipmentData) => 
    apiPost(API_ENDPOINTS.HOSPITAL_EQUIPMENT(hospitalId), equipmentData),
  updateEquipment: (hospitalId, equipmentId, equipmentData) => 
    apiPut(`${API_ENDPOINTS.HOSPITAL_EQUIPMENT(hospitalId)}/${equipmentId}`, equipmentData),
  deleteEquipment: (hospitalId, equipmentId) => 
    apiDelete(`${API_ENDPOINTS.HOSPITAL_EQUIPMENT(hospitalId)}/${equipmentId}`),

  // Patient management
  getPatients: (hospitalId, filters = {}) => 
    apiGet(API_ENDPOINTS.HOSPITAL_PATIENTS(hospitalId), { params: filters }),
  getPatientById: (hospitalId, patientId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_PATIENT_BY_ID(hospitalId, patientId)),
  createPatient: (hospitalId, patientData) => 
    apiPost(API_ENDPOINTS.HOSPITAL_PATIENTS(hospitalId), patientData),
  updatePatient: (hospitalId, patientId, patientData) => 
    apiPut(API_ENDPOINTS.HOSPITAL_PATIENT_BY_ID(hospitalId, patientId), patientData),
  deletePatient: (hospitalId, patientId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_PATIENT_BY_ID(hospitalId, patientId)),
  admitPatient: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_PATIENT_ADMIT(hospitalId), data),
  dischargePatient: (hospitalId, patientId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_PATIENT_DISCHARGE(hospitalId, patientId), data),
  transferPatient: (hospitalId, patientId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_PATIENT_TRANSFER(hospitalId, patientId), data),
  getPatientTimeline: (hospitalId, patientId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_PATIENT_TIMELINE(hospitalId, patientId)),
  getPatientVitals: (hospitalId, patientId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_PATIENT_VITALS(hospitalId, patientId)),
  recordPatientVitals: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_PATIENT_RECORD_VITALS(hospitalId), data),

  // Bed management
  getBeds: (hospitalId, filters = {}) => 
    apiGet(API_ENDPOINTS.HOSPITAL_BEDS(hospitalId), { params: filters }),
  createBed: (hospitalId, bedData) => 
    apiPost(API_ENDPOINTS.HOSPITAL_BEDS(hospitalId), bedData),
  updateBed: (hospitalId, bedId, bedData) => 
    apiPut(API_ENDPOINTS.HOSPITAL_BED_BY_ID(hospitalId, bedId), bedData),
  deleteBed: (hospitalId, bedId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_BED_BY_ID(hospitalId, bedId)),

  // Accreditation
  getAccreditations: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_ACCREDITATIONS(hospitalId)),
  createAccreditation: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_ACCREDITATIONS(hospitalId), data),
  updateAccreditation: (hospitalId, accreditationId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_ACCREDITATION_BY_ID(hospitalId, accreditationId), data),
  deleteAccreditation: (hospitalId, accreditationId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_ACCREDITATION_BY_ID(hospitalId, accreditationId)),

  // Quality indicators
  getQualityIndicators: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_QUALITY_INDICATORS(hospitalId)),
  createQualityIndicator: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_QUALITY_INDICATORS(hospitalId), data),
  updateQualityIndicator: (hospitalId, indicatorId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_QUALITY_INDICATOR_BY_ID(hospitalId, indicatorId), data),
  deleteQualityIndicator: (hospitalId, indicatorId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_QUALITY_INDICATOR_BY_ID(hospitalId, indicatorId)),

  // Patient safety goals
  getPatientSafetyGoals: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_SAFETY_GOALS(hospitalId)),
  createPatientSafetyGoal: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_SAFETY_GOALS(hospitalId), data),
  updatePatientSafetyGoal: (hospitalId, goalId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_SAFETY_GOAL_BY_ID(hospitalId, goalId), data),
  deletePatientSafetyGoal: (hospitalId, goalId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_SAFETY_GOAL_BY_ID(hospitalId, goalId)),

  // Adverse events
  getAdverseEvents: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_ADVERSE_EVENTS(hospitalId)),
  reportAdverseEvent: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_ADVERSE_EVENTS(hospitalId), data),
  updateAdverseEvent: (hospitalId, eventId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_ADVERSE_EVENT_BY_ID(hospitalId, eventId), data),
  resolveAdverseEvent: (hospitalId, eventId) => 
    apiPatch(API_ENDPOINTS.HOSPITAL_ADVERSE_EVENT_RESOLVE(hospitalId, eventId)),
  deleteAdverseEvent: (hospitalId, eventId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_ADVERSE_EVENT_BY_ID(hospitalId, eventId)),

  // Risk assessments
  getRiskAssessments: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_RISK_ASSESSMENTS(hospitalId)),
  createRiskAssessment: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_RISK_ASSESSMENTS(hospitalId), data),
  updateRiskAssessment: (hospitalId, assessmentId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_RISK_ASSESSMENT_BY_ID(hospitalId, assessmentId), data),
  deleteRiskAssessment: (hospitalId, assessmentId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_RISK_ASSESSMENT_BY_ID(hospitalId, assessmentId)),

  // Infection control
  getInfectionControl: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_INFECTION_CONTROL(hospitalId)),
  createInfectionReport: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_INFECTION_REPORTS(hospitalId), data),
  updateInfectionProtocol: (hospitalId, protocolId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_INFECTION_PROTOCOL_BY_ID(hospitalId, protocolId), data),
  deleteInfectionReport: (hospitalId, reportId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_INFECTION_REPORT_BY_ID(hospitalId, reportId)),

  // Disease surveillance
  getDiseaseSurveillance: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_DISEASE_SURVEILLANCE(hospitalId)),
  createDisease: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_DISEASES(hospitalId), data),
  updateDisease: (hospitalId, diseaseId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_DISEASE_BY_ID(hospitalId, diseaseId), data),
  deleteDisease: (hospitalId, diseaseId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_DISEASE_BY_ID(hospitalId, diseaseId)),

  // Emergency preparedness
  getEmergencyPreparedness: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_EMERGENCY_PREPAREDNESS(hospitalId)),
  updateEmergencyPlan: (hospitalId, planId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_EMERGENCY_PLAN_BY_ID(hospitalId, planId), data),
  reportEmergency: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_EMERGENCIES(hospitalId), data),
  deleteEmergency: (hospitalId, emergencyId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_EMERGENCY_BY_ID(hospitalId, emergencyId)),

  // Safety incidents
  getSafetyIncidents: (hospitalId, filters = {}) => 
    apiGet(API_ENDPOINTS.HOSPITAL_SAFETY_INCIDENTS(hospitalId), { params: filters }),
  reportSafetyIncident: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_SAFETY_INCIDENTS(hospitalId), data),
  updateSafetyIncident: (hospitalId, incidentId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_SAFETY_INCIDENT_BY_ID(hospitalId, incidentId), data),
  deleteSafetyIncident: (hospitalId, incidentId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_SAFETY_INCIDENT_BY_ID(hospitalId, incidentId)),

  // Safety inspections
  getSafetyInspections: (hospitalId, filters = {}) => 
    apiGet(API_ENDPOINTS.HOSPITAL_SAFETY_INSPECTIONS(hospitalId), { params: filters }),
  createSafetyInspection: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_SAFETY_INSPECTIONS(hospitalId), data),
  updateSafetyInspection: (hospitalId, inspectionId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_SAFETY_INSPECTION_BY_ID(hospitalId, inspectionId), data),
  deleteSafetyInspection: (hospitalId, inspectionId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_SAFETY_INSPECTION_BY_ID(hospitalId, inspectionId)),

  // Safety equipment
  getSafetyEquipment: (hospitalId, filters = {}) => 
    apiGet(API_ENDPOINTS.HOSPITAL_SAFETY_EQUIPMENT(hospitalId), { params: filters }),
  createSafetyEquipment: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_SAFETY_EQUIPMENT(hospitalId), data),
  updateSafetyEquipment: (hospitalId, equipmentId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_SAFETY_EQUIPMENT_BY_ID(hospitalId, equipmentId), data),
  deleteSafetyEquipment: (hospitalId, equipmentId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_SAFETY_EQUIPMENT_BY_ID(hospitalId, equipmentId)),

  // Safety training
  getSafetyTrainings: (hospitalId, filters = {}) => 
    apiGet(API_ENDPOINTS.HOSPITAL_SAFETY_TRAININGS(hospitalId), { params: filters }),
  createSafetyTraining: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_SAFETY_TRAININGS(hospitalId), data),
  updateSafetyTraining: (hospitalId, trainingId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_SAFETY_TRAINING_BY_ID(hospitalId, trainingId), data),
  deleteSafetyTraining: (hospitalId, trainingId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_SAFETY_TRAINING_BY_ID(hospitalId, trainingId)),

  // Lab safety
  getLabSafety: (hospitalId, filters = {}) => 
    apiGet(API_ENDPOINTS.HOSPITAL_LAB_SAFETY(hospitalId), { params: filters }),
  createLabSafety: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_LAB_SAFETY(hospitalId), data),
  updateLabSafety: (hospitalId, safetyId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_LAB_SAFETY_BY_ID(hospitalId, safetyId), data),
  deleteLabSafety: (hospitalId, safetyId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_LAB_SAFETY_BY_ID(hospitalId, safetyId)),

  // Compliance
  getCompliance: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_COMPLIANCE(hospitalId)),
  updateCompliance: (hospitalId, complianceId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_COMPLIANCE_BY_ID(hospitalId, complianceId), data),
  getComplianceReport: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_COMPLIANCE_REPORT(hospitalId)),

  // Clinical protocols
  getClinicalProtocols: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_CLINICAL_PROTOCOLS(hospitalId)),
  createClinicalProtocol: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_CLINICAL_PROTOCOLS(hospitalId), data),
  updateClinicalProtocol: (hospitalId, protocolId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_CLINICAL_PROTOCOL_BY_ID(hospitalId, protocolId), data),
  deleteClinicalProtocol: (hospitalId, protocolId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_CLINICAL_PROTOCOL_BY_ID(hospitalId, protocolId)),

  // Clinical trials
  getClinicalTrials: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_CLINICAL_TRIALS(hospitalId)),
  createClinicalTrial: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_CLINICAL_TRIALS(hospitalId), data),
  updateClinicalTrial: (hospitalId, trialId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_CLINICAL_TRIAL_BY_ID(hospitalId, trialId), data),
  deleteClinicalTrial: (hospitalId, trialId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_CLINICAL_TRIAL_BY_ID(hospitalId, trialId)),

  // Data standards
  getDataStandards: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_DATA_STANDARDS(hospitalId)),
  createDataStandard: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_DATA_STANDARDS(hospitalId), data),
  updateDataStandard: (hospitalId, standardId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_DATA_STANDARD_BY_ID(hospitalId, standardId), data),
  deleteDataStandard: (hospitalId, standardId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_DATA_STANDARD_BY_ID(hospitalId, standardId)),

  // Staff competencies
  getStaffCompetencies: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_COMPETENCIES(hospitalId)),
  createCompetency: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_COMPETENCIES(hospitalId), data),
  updateCompetency: (hospitalId, competencyId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_COMPETENCY_BY_ID(hospitalId, competencyId), data),
  deleteCompetency: (hospitalId, competencyId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_COMPETENCY_BY_ID(hospitalId, competencyId)),

  // Sustainability
  getSustainability: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_SUSTAINABILITY(hospitalId)),
  createSustainabilityMetric: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_SUSTAINABILITY(hospitalId), data),
  updateSustainabilityMetric: (hospitalId, metricId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_SUSTAINABILITY_BY_ID(hospitalId, metricId), data),
  deleteSustainabilityMetric: (hospitalId, metricId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_SUSTAINABILITY_BY_ID(hospitalId, metricId)),

  // Cybersecurity
  getCybersecurity: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_CYBERSECURITY(hospitalId)),
  createCybersecurityFramework: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_CYBERSECURITY(hospitalId), data),
  updateCybersecurityFramework: (hospitalId, frameworkId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_CYBERSECURITY_BY_ID(hospitalId, frameworkId), data),
  deleteCybersecurityFramework: (hospitalId, frameworkId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_CYBERSECURITY_BY_ID(hospitalId, frameworkId)),
  reportSecurityIncident: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_SECURITY_INCIDENTS(hospitalId), data),

  // Global health
  getGlobalHealth: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_GLOBAL_HEALTH(hospitalId)),
  createGlobalHealthInitiative: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_GLOBAL_HEALTH(hospitalId), data),
  updateGlobalHealthInitiative: (hospitalId, initiativeId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_GLOBAL_HEALTH_BY_ID(hospitalId, initiativeId), data),
  deleteGlobalHealthInitiative: (hospitalId, initiativeId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_GLOBAL_HEALTH_BY_ID(hospitalId, initiativeId)),

  // Medical equipment
  getMedicalEquipment: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_EQUIPMENT(hospitalId)),
  createMedicalEquipment: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_EQUIPMENT(hospitalId), data),
  updateMedicalEquipment: (hospitalId, equipmentId, data) => 
    apiPut(`${API_ENDPOINTS.HOSPITAL_EQUIPMENT(hospitalId)}/${equipmentId}`, data),
  deleteMedicalEquipment: (hospitalId, equipmentId) => 
    apiDelete(`${API_ENDPOINTS.HOSPITAL_EQUIPMENT(hospitalId)}/${equipmentId}`),

  // Patient feedback
  getPatientFeedback: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_FEEDBACK(hospitalId)),
  createPatientFeedback: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_FEEDBACK(hospitalId), data),
  updatePatientFeedback: (hospitalId, feedbackId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_FEEDBACK_BY_ID(hospitalId, feedbackId), data),
  deletePatientFeedback: (hospitalId, feedbackId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_FEEDBACK_BY_ID(hospitalId, feedbackId)),

  // Medical records
  getMedicalRecords: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_MEDICAL_RECORDS(hospitalId)),
  createMedicalRecord: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_MEDICAL_RECORDS(hospitalId), data),
  updateMedicalRecord: (hospitalId, recordId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_MEDICAL_RECORD_BY_ID(hospitalId, recordId), data),
  deleteMedicalRecord: (hospitalId, recordId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_MEDICAL_RECORD_BY_ID(hospitalId, recordId)),

  // Waste management
  getWasteManagement: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_WASTE_MANAGEMENT(hospitalId)),
  createWasteReport: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_WASTE_REPORTS(hospitalId), data),
  updateWasteReport: (hospitalId, reportId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_WASTE_REPORT_BY_ID(hospitalId, reportId), data),
  deleteWasteReport: (hospitalId, reportId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_WASTE_REPORT_BY_ID(hospitalId, reportId)),

  // Clinical notes
  getClinicalNotes: (hospitalId, patientId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_CLINICAL_NOTES(hospitalId, patientId)),
  createClinicalNote: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_CLINICAL_NOTES(hospitalId, data.patientId), data),
  updateClinicalNote: (hospitalId, noteId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_CLINICAL_NOTE_BY_ID(hospitalId, noteId), data),
  deleteClinicalNote: (hospitalId, noteId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_CLINICAL_NOTE_BY_ID(hospitalId, noteId)),

  // Lab results
  getLabResults: (hospitalId, patientId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_LAB_RESULTS(hospitalId, patientId)),
  createLabResult: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_LAB_RESULTS(hospitalId, data.patientId), data),
  updateLabResult: (hospitalId, resultId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_LAB_RESULT_BY_ID(hospitalId, resultId), data),

  // Imaging studies
  getImagingStudies: (hospitalId, patientId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_IMAGING_STUDIES(hospitalId, patientId)),
  createImagingStudy: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_IMAGING_STUDIES(hospitalId, data.patientId), data),
  updateImagingStudy: (hospitalId, studyId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_IMAGING_STUDY_BY_ID(hospitalId, studyId), data),

  // Medications
  getPatientMedications: (hospitalId, patientId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_PATIENT_MEDICATIONS(hospitalId, patientId)),
  prescribeMedication: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_PRESCRIPTIONS(hospitalId), data),
  updateMedication: (hospitalId, prescriptionId, data) => 
    apiPut(API_ENDPOINTS.HOSPITAL_PRESCRIPTION_BY_ID(hospitalId, prescriptionId), data),
  deleteMedication: (hospitalId, prescriptionId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_PRESCRIPTION_BY_ID(hospitalId, prescriptionId)),

  // Reports
  generateQualityReport: (hospitalId, dateRange) => 
    apiPost(API_ENDPOINTS.HOSPITAL_QUALITY_REPORT(hospitalId), dateRange),
  getReports: (hospitalId, filters = {}) => 
    apiGet(API_ENDPOINTS.HOSPITAL_REPORTS(hospitalId), { params: filters }),
  generateReport: (hospitalId, reportType, params) => 
    apiPost(`${API_ENDPOINTS.HOSPITAL_REPORTS(hospitalId)}/${reportType}`, params),
  deleteReport: (hospitalId, reportId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_REPORT_BY_ID(hospitalId, reportId)),

  // Notifications
  getNotifications: (hospitalId, filters = {}) => 
    apiGet(API_ENDPOINTS.HOSPITAL_NOTIFICATIONS(hospitalId), { params: filters }),
  createNotification: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_NOTIFICATIONS(hospitalId), data),
  markNotificationRead: (hospitalId, notificationId) => 
    apiPatch(API_ENDPOINTS.HOSPITAL_NOTIFICATION_READ(hospitalId, notificationId)),
  deleteNotification: (hospitalId, notificationId) => 
    apiDelete(API_ENDPOINTS.HOSPITAL_NOTIFICATION_BY_ID(hospitalId, notificationId)),

  // Audit logs
  getAuditLogs: (hospitalId, filters = {}) => 
    apiGet(API_ENDPOINTS.HOSPITAL_AUDIT_LOGS(hospitalId), { params: filters }),
  createAuditLog: (hospitalId, data) => 
    apiPost(API_ENDPOINTS.HOSPITAL_AUDIT_LOGS(hospitalId), data),

  // Analytics
  getHospitalAnalytics: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_ANALYTICS(hospitalId)),
  getAIAnalytics: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_AI_ANALYTICS(hospitalId)),

  // AI Services management
  getAICapabilities: (hospitalId) => 
    apiGet(API_ENDPOINTS.HOSPITAL_AI_CAPABILITIES(hospitalId)),
  getAIServices: () => apiGet(API_ENDPOINTS.HOSPITAL_AI_SERVICES),
  enableAIService: (hospitalId, serviceName) => 
    apiPost(API_ENDPOINTS.ENABLE_AI_SERVICE(hospitalId), { serviceName }),
  updateAIServiceStatus: (serviceName, status) => 
    apiPatch(`${API_ENDPOINTS.HOSPITAL_AI_SERVICES}/${serviceName}`, { status }),

  // Biohazard incidents (legacy support)
  getIncidents: (hospitalId) => apiGet(`/hospital/${hospitalId}/incidents`),
  reportIncident: (incidentData) => apiPost('/hospital/biohazard-incidents', incidentData),
};

// ==================== MEDICAL AI SERVICE INTEGRATION ====================

// Medical AI Service API methods
export const medicalAIServiceAPI = {
  // Chat Assistant
  chatWithAI: (messages, context = {}) => 
    apiPost(API_ENDPOINTS.AI_MEDICAL_CHAT, { messages, context }),

  // Symptom Analysis
  analyzeSymptoms: (symptoms, patientInfo = {}) => 
    apiPost(API_ENDPOINTS.AI_MEDICAL_SYMPTOMS, { symptoms, patientInfo }),

  // Disease Prediction
  predictDisease: (medicalData) => 
    apiPost(API_ENDPOINTS.AI_MEDICAL_DISEASE_PREDICTION, medicalData),

  // Lab Analysis
  analyzeLabResults: (labData, referenceRanges = {}) => 
    apiPost(API_ENDPOINTS.AI_MEDICAL_LAB_ANALYSIS, { labData, referenceRanges }),

  // Medical Text Analysis
  analyzeMedicalText: (text, analysisType = 'general') => 
    apiPost(API_ENDPOINTS.AI_MEDICAL_TEXT_ANALYSIS, { text, analysisType }),

  // Safety Document Analysis
  analyzeSafetyDocument: (document, documentType) => 
    apiPost(API_ENDPOINTS.AI_MEDICAL_SAFETY_ANALYSIS, { document, documentType }),

  // Comprehensive Analysis
  getComprehensiveAnalysis: (patientData) => 
    apiPost(API_ENDPOINTS.AI_MEDICAL_COMPREHENSIVE, { patientData }),

  // AI Models Management
  getAIModelsStatus: () => apiGet(API_ENDPOINTS.AI_MEDICAL_MODELS_STATUS),
  getModelInfo: (modelName) => apiGet(API_ENDPOINTS.AI_MEDICAL_MODEL_INFO(modelName)),

  // Analysis History
  getAnalysisHistory: (limit = 50) => 
    apiGet(API_ENDPOINTS.AI_MEDICAL_HISTORY, { params: { limit } }),

  // Batch Processing
  batchAnalyze: (analyses) => apiPost(API_ENDPOINTS.AI_MEDICAL_BATCH, { analyses }),

  // Usage Analytics
  getUsageStats: (period = '30d') => 
    apiGet(API_ENDPOINTS.AI_MEDICAL_USAGE, { params: { period } }),

  // File upload for document analysis
  uploadAndAnalyzeDocument: (file, analysisType) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('analysisType', analysisType);
    return apiUpload(API_ENDPOINTS.AI_MEDICAL_TEXT_ANALYSIS, formData);
  },

  // File upload for safety document analysis
  uploadAndAnalyzeSafetyDocument: (file, documentType) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    return apiUpload(API_ENDPOINTS.AI_MEDICAL_SAFETY_ANALYSIS, formData);
  }
};

// ==================== ENVIRONMENTAL INTELLIGENCE SERVICE INTEGRATION ====================

// Environmental Intelligence Service API methods
export const environmentalIntelligenceAPI = {
  // Dashboard data
  getEnvironmentalIntelligence: () => 
    apiGet(API_ENDPOINTS.ENVIRONMENTAL_INTELLIGENCE),

  // Predictive analytics
  getPredictiveAnalytics: (timeRange = '7d') => 
    apiGet(API_ENDPOINTS.ENVIRONMENTAL_PREDICTIVE_ANALYTICS, { params: { timeRange } }),

  // Compliance automation
  getComplianceAutomation: () => 
    apiGet(API_ENDPOINTS.ENVIRONMENTAL_COMPLIANCE_AUTOMATION),

  // Impact scorecard
  getImpactScorecard: () => 
    apiGet(API_ENDPOINTS.ENVIRONMENTAL_IMPACT_SCORECARD),

  // Smart alerts
  getSmartAlerts: () => 
    apiGet(API_ENDPOINTS.ENVIRONMENTAL_SMART_ALERTS),

  // Acknowledge alert
  acknowledgeAlert: (alertId) => 
    apiPost(API_ENDPOINTS.ENVIRONMENTAL_ACKNOWLEDGE_ALERT, { alertId }),

  // Sustainability goals
  getSustainabilityGoals: () => 
    apiGet(API_ENDPOINTS.ENVIRONMENTAL_SUSTAINABILITY_GOALS),

  // Environmental AI analysis
  analyzeEnvironmentalData: (environmentalData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE_ENVIRONMENTAL, { environmental_data: environmentalData }),

  // Air quality prediction
  predictAirQuality: (airQualityData) => 
    apiPost(API_ENDPOINTS.AI_PREDICT_AIR_QUALITY, airQualityData),

  // Comprehensive environmental analysis
  analyzeComprehensive: (comprehensiveData) => 
    apiPost(API_ENDPOINTS.AI_ENVIRONMENTAL_ANALYZE_COMPREHENSIVE, comprehensiveData),

  // Risk assessment
  assessEnvironmentalRisk: (riskData) => 
    apiPost(API_ENDPOINTS.AI_ENVIRONMENTAL_ASSESS_RISK, riskData),

  // Anomaly detection
  detectEnvironmentalAnomalies: (sensorData) => 
    apiPost(API_ENDPOINTS.AI_ENVIRONMENTAL_DETECT_ANOMALIES, sensorData)
};

// ==================== HSE INDUSTRY SERVICE INTEGRATION ====================

// HSE Industry Service - Complete integration
export const hseIndustryService = {
  // Industry Configuration API
  industryConfig: {
    getIndustries: () => apiGet(API_ENDPOINTS.HSE_INDUSTRIES),
    getIndustryConfig: (industryId) => apiGet(API_ENDPOINTS.HSE_INDUSTRY_CONFIG(industryId)),
    updateIndustryPreferences: (industryId, preferences) => 
      apiPut(API_ENDPOINTS.HSE_INDUSTRY_PREFERENCES(industryId), preferences),
  },

  // Document Templates API
  documents: {
    getTemplates: (industryId, category = null) => {
      const params = category ? { category } : {};
      return apiGet(API_ENDPOINTS.HSE_INDUSTRY_TEMPLATES(industryId), { params });
    },
    getTemplate: (templateId) => apiGet(API_ENDPOINTS.HSE_TEMPLATE_DETAIL(templateId)),
    downloadTemplate: (templateId) => api.get(API_ENDPOINTS.HSE_TEMPLATE_DOWNLOAD(templateId), { responseType: 'blob' }),
    createCustomTemplate: (industryId, templateData) => 
      apiPost(API_ENDPOINTS.HSE_TEMPLATE_CREATE(industryId), templateData),
    updateTemplate: (templateId, updates) => 
      apiPut(API_ENDPOINTS.HSE_TEMPLATE_UPDATE(templateId), updates),
    deleteTemplate: (templateId) => apiDelete(API_ENDPOINTS.HSE_TEMPLATE_DELETE(templateId)),
    getCategories: (industryId) => apiGet(API_ENDPOINTS.HSE_TEMPLATE_CATEGORIES(industryId)),
  },

  // Safety Tools API
  tools: {
    getTools: (industryId) => apiGet(API_ENDPOINTS.HSE_INDUSTRY_TOOLS(industryId)),
    executeTool: (toolId, parameters) => apiPost(API_ENDPOINTS.HSE_TOOL_EXECUTE(toolId), parameters),
    getToolResults: (executionId) => apiGet(API_ENDPOINTS.HSE_TOOL_RESULTS(executionId)),
    saveToolConfig: (toolId, config) => apiPost(API_ENDPOINTS.HSE_TOOL_CONFIG(toolId), config),
  },

  // AI Services API
  ai: {
    getAIServices: (industryId) => apiGet(API_ENDPOINTS.HSE_INDUSTRY_AI_SERVICES(industryId)),
    generateDocument: (industryId, serviceType, parameters) => 
      apiPost(API_ENDPOINTS.HSE_AI_GENERATE_DOCUMENT(industryId), { service_type: serviceType, ...parameters }),
    analyzeRisk: (industryId, riskData) => 
      apiPost(API_ENDPOINTS.HSE_AI_ANALYZE_RISK(industryId), riskData),
    predictIncidents: (industryId, historicalData) => 
      apiPost(API_ENDPOINTS.HSE_AI_PREDICT_INCIDENTS(industryId), historicalData),
    generateRecommendations: (industryId, context) => 
      apiPost(API_ENDPOINTS.HSE_AI_RECOMMENDATIONS(industryId), context),
    getServiceStatus: (serviceId) => apiGet(API_ENDPOINTS.HSE_AI_SERVICE_STATUS(serviceId)),
  },

  // Training Management API
  training: {
    getCourses: (industryId) => apiGet(API_ENDPOINTS.HSE_TRAINING_COURSES(industryId)),
    getTrainingRecords: (industryId, employeeId = null) => {
      const params = employeeId ? { employee_id: employeeId } : {};
      return apiGet(API_ENDPOINTS.HSE_TRAINING_RECORDS(industryId), { params });
    },
    scheduleTraining: (industryId, trainingData) => 
      apiPost(API_ENDPOINTS.HSE_TRAINING_SCHEDULE(industryId), trainingData),
    updateTrainingProgress: (recordId, progress) => 
      apiPut(API_ENDPOINTS.HSE_TRAINING_PROGRESS(recordId), { progress }),
    getCompliance: (industryId) => apiGet(API_ENDPOINTS.HSE_TRAINING_COMPLIANCE(industryId)),
  },

  // Incident Management API
  incidents: {
    getIncidents: (industryId, filters = {}) => 
      apiGet(API_ENDPOINTS.HSE_INDUSTRY_INCIDENTS(industryId), { params: filters }),
    reportIncident: (industryId, incidentData) => 
      apiPost(API_ENDPOINTS.HSE_INCIDENT_REPORT(industryId), incidentData),
    updateIncident: (incidentId, updates) => 
      apiPut(API_ENDPOINTS.HSE_INCIDENT_UPDATE(incidentId), updates),
    getIncidentStats: (industryId, period = '30d') => 
      apiGet(API_ENDPOINTS.HSE_INCIDENT_STATS(industryId), { params: { period } }),
    uploadAttachments: (incidentId, files) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('attachments', file);
      });
      return api.post(API_ENDPOINTS.HSE_INCIDENT_ATTACHMENTS(incidentId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
  },

  // Risk Assessment API
  risk: {
    getAssessments: (industryId) => apiGet(API_ENDPOINTS.HSE_RISK_ASSESSMENTS(industryId)),
    createAssessment: (industryId, assessmentData) => 
      apiPost(API_ENDPOINTS.HSE_RISK_ASSESSMENT_CREATE(industryId), assessmentData),
    updateAssessment: (assessmentId, updates) => 
      apiPut(API_ENDPOINTS.HSE_RISK_ASSESSMENT_UPDATE(assessmentId), updates),
    calculateRiskScore: (industryId, riskFactors) => 
      apiPost(API_ENDPOINTS.HSE_RISK_CALCULATOR(industryId), riskFactors),
    getRiskMatrix: (industryId) => apiGet(API_ENDPOINTS.HSE_RISK_MATRIX(industryId)),
  },

  // Compliance Management API
  compliance: {
    getRequirements: (industryId) => apiGet(API_ENDPOINTS.HSE_COMPLIANCE_REQUIREMENTS(industryId)),
    getComplianceStatus: (industryId) => apiGet(API_ENDPOINTS.HSE_COMPLIANCE_STATUS(industryId)),
    submitEvidence: (requirementId, evidence) => 
      apiPost(API_ENDPOINTS.HSE_COMPLIANCE_EVIDENCE(requirementId), evidence),
    getAuditHistory: (industryId) => apiGet(API_ENDPOINTS.HSE_AUDIT_HISTORY(industryId)),
  },

  // Safety Inspection API
  inspections: {
    getInspections: (industryId, status = null) => {
      const params = status ? { status } : {};
      return apiGet(API_ENDPOINTS.HSE_INSPECTIONS(industryId), { params });
    },
    createInspection: (industryId, inspectionData) => 
      apiPost(API_ENDPOINTS.HSE_INSPECTION_CREATE(industryId), inspectionData),
    updateInspection: (inspectionId, updates) => 
      apiPut(API_ENDPOINTS.HSE_INSPECTION_UPDATE(inspectionId), updates),
    submitFindings: (inspectionId, findings) => 
      apiPost(API_ENDPOINTS.HSE_INSPECTION_FINDINGS(inspectionId), findings),
    getInspectionTemplates: (industryId) => apiGet(API_ENDPOINTS.HSE_INSPECTION_TEMPLATES(industryId)),
  },

  // Permit to Work (PTW) API
  ptw: {
    getPTWTemplates: (industryId) => apiGet(API_ENDPOINTS.HSE_PTW_TEMPLATES(industryId)),
    createPTWRequest: (industryId, ptwData) => 
      apiPost(API_ENDPOINTS.HSE_PTW_REQUEST_CREATE(industryId), ptwData),
    getPTWRequests: (industryId, status = null) => {
      const params = status ? { status } : {};
      return apiGet(API_ENDPOINTS.HSE_PTW_REQUESTS(industryId), { params });
    },
    reviewPTWRequest: (ptwId, decision, comments = '') => 
      apiPut(API_ENDPOINTS.HSE_PTW_REVIEW(ptwId), { decision, comments }),
    closePTW: (ptwId, closureData) => 
      apiPut(API_ENDPOINTS.HSE_PTW_CLOSE(ptwId), closureData),
  },

  // Dashboard Analytics API
  analytics: {
    getDashboardData: (industryId) => apiGet(API_ENDPOINTS.HSE_INDUSTRY_DASHBOARD(industryId)),
    getSafetyMetrics: (industryId, timeframe = '30d') => 
      apiGet(API_ENDPOINTS.HSE_SAFETY_METRICS(industryId), { params: { timeframe } }),
    getTrends: (industryId, metric, period = '90d') => 
      apiGet(API_ENDPOINTS.HSE_TRENDS(industryId), { params: { metric, period } }),
    getComparativeAnalytics: (industryId, compareWith = []) => 
      apiGet(API_ENDPOINTS.HSE_COMPARATIVE_ANALYTICS(industryId), { 
        params: { compare_with: compareWith.join(',') } 
      }),
  },

  // Real-time Monitoring API
  monitoring: {
    getRealTimeData: (industryId) => apiGet(API_ENDPOINTS.HSE_REAL_TIME_DATA(industryId)),
    subscribeToUpdates: (industryId, channels) => 
      apiPost(API_ENDPOINTS.HSE_SUBSCRIBE_UPDATES(industryId), { channels }),
    getAlerts: (industryId, severity = null) => {
      const params = severity ? { severity } : {};
      return apiGet(API_ENDPOINTS.HSE_ALERTS(industryId), { params });
    },
    acknowledgeAlert: (alertId) => apiPut(API_ENDPOINTS.HSE_ALERT_ACKNOWLEDGE(alertId)),
  },

  // Industry-Specific APIs
  oilGas: {
    getPSMData: (facilityId) => apiGet(API_ENDPOINTS.OIL_GAS_PSM(facilityId)),
    getWellControlStatus: (wellId) => apiGet(API_ENDPOINTS.OIL_GAS_WELL_CONTROL(wellId)),
    getPipelineSafety: (pipelineId) => apiGet(API_ENDPOINTS.OIL_GAS_PIPELINE_SAFETY(pipelineId)),
  },

  construction: {
    getScaffoldInspections: (siteId) => apiGet(API_ENDPOINTS.CONSTRUCTION_SCAFFOLD(siteId)),
    getFallProtectionData: (siteId) => apiGet(API_ENDPOINTS.CONSTRUCTION_FALL_PROTECTION(siteId)),
    getEquipmentSafety: (siteId) => apiGet(API_ENDPOINTS.CONSTRUCTION_EQUIPMENT(siteId)),
  },

  healthcare: {
    getInfectionData: (facilityId) => apiGet(API_ENDPOINTS.HEALTHCARE_INFECTION(facilityId)),
    getPatientSafety: (facilityId) => apiGet(API_ENDPOINTS.HEALTHCARE_PATIENT_SAFETY(facilityId)),
    getBiohazardData: (facilityId) => apiGet(API_ENDPOINTS.HEALTHCARE_BIOHAZARD(facilityId)),
  },

  // File Upload Utility
  upload: {
    uploadFile: (file, options = {}) => {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options.category) {
        formData.append('category', options.category);
      }
      if (options.industryId) {
        formData.append('industry_id', options.industryId);
      }

      return api.post(API_ENDPOINTS.UPLOAD_FILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: options.onProgress,
      });
    },

    uploadMultiple: (files, options = {}) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      if (options.category) {
        formData.append('category', options.category);
      }
      if (options.industryId) {
        formData.append('industry_id', options.industryId);
      }

      return api.post(API_ENDPOINTS.UPLOAD_MULTIPLE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },
};

// ==================== CAMERA MONITORING SERVICE INTEGRATION ====================

// Camera Monitoring Service API methods
export const cameraMonitoringAPI = {
  // Start camera monitoring
  startCameraMonitoring: (monitoringConfig) => 
    apiPost(API_ENDPOINTS.MONITORING_START, monitoringConfig),

  // Stop camera monitoring
  stopCameraMonitoring: (monitorId) => 
    apiPost(API_ENDPOINTS.MONITORING_STOP, { monitorId }),

  // Get monitoring status
  getMonitoringStatus: (monitorId = null) => {
    const params = monitorId ? { monitorId } : {};
    return apiPost(API_ENDPOINTS.MONITORING_STATUS, params);
  },

  // Get live violations
  getLiveViolations: (monitorId, limit = 20) => 
    apiPost(API_ENDPOINTS.MONITORING_VIOLATIONS, { monitorId, limit }),

  // Get camera feeds
  getCameraFeeds: () => apiPost(API_ENDPOINTS.CAMERAS_LIST),

  // Update camera status
  updateCameraStatus: (cameraId, status) => 
    apiPost(API_ENDPOINTS.CAMERAS_UPDATE_STATUS, { cameraId, status }),

  // Get camera health status
  getCameraHealth: (cameraId) => 
    apiPost('/api/cameras/health', { cameraId }),

  // Get monitoring analytics
  getMonitoringAnalytics: (timeRange = '24h') => 
    apiPost('/api/monitoring/analytics', { timeRange }),

  // Get real-time feed (WebSocket connection helper)
  getRealTimeFeed: (monitorId) => {
    // This would typically set up a WebSocket connection
    console.log(`📹 Setting up real-time feed for monitor: ${monitorId}`);
    return {
      monitorId,
      connected: true,
      timestamp: new Date().toISOString()
    };
  }
};

// ==================== VIDEO ANALYSIS SERVICE INTEGRATION ====================

// Video Analysis Service API methods
export const videoAnalysisAPI = {
  // Main video analysis endpoint
  analyzeVideo: (videoData, analysisConfig = {}) => {
    const formData = new FormData();
    formData.append('video', videoData);
    
    if (analysisConfig.analysis_config) {
      formData.append('analysis_config', JSON.stringify(analysisConfig.analysis_config));
    }
    
    return apiUpload(API_ENDPOINTS.VIDEO_ANALYZE, formData);
  },

  // Quick analysis endpoints
  analyzeVideoRisks: (videoData) => {
    const formData = new FormData();
    formData.append('video', videoData);
    return apiUpload(API_ENDPOINTS.VIDEO_ANALYZE_RISKS, formData);
  },

  analyzeVideoPPE: (videoData) => {
    const formData = new FormData();
    formData.append('video', videoData);
    return apiUpload(API_ENDPOINTS.VIDEO_ANALYZE_PPE, formData);
  },

  // Report generation
  generateVideoAnalysisReport: (analysisId, format = 'pdf', reportType = null) => {
    const payload = {
      format,
      type: reportType || 'detailed'
    };
    return apiPost(API_ENDPOINTS.VIDEO_ANALYSIS_REPORT(analysisId), payload, {
      responseType: 'blob'
    });
  },

  // History and management
  getVideoAnalysisHistory: (limit = 10) => {
    return apiPost(API_ENDPOINTS.VIDEO_ANALYSIS_HISTORY, { limit });
  },

  getVideoAnalysis: (analysisId) => {
    return apiGet(API_ENDPOINTS.VIDEO_ANALYSIS_GET(analysisId));
  },

  deleteVideoAnalysis: (analysisId) => {
    return apiDelete(API_ENDPOINTS.VIDEO_ANALYSIS_DELETE(analysisId));
  },

  getVideoAnalyticsSummary: () => {
    return apiGet(API_ENDPOINTS.VIDEO_ANALYTICS_SUMMARY);
  }
};

// ==================== AI SERVICE INTEGRATION ====================

// AI Service API methods
export const aiServiceAPI = {
  // Chat Assistant
  chatWithAI: (message, context = {}) => 
    apiPost(API_ENDPOINTS.AI_CHAT, { message, context }),
  
  // Hospital Management AI
  analyzeHospitalData: (hospitalData, analysisType = 'comprehensive') => 
    apiPost(API_ENDPOINTS.AI_ANALYZE_HOSPITAL_DATA, { hospital_data: hospitalData, analysis_type: analysisType }),
  
  analyzePatientData: (patientData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE_PATIENT_DATA, { patient_data: patientData }),
  
  analyzeMedicalEquipment: (equipmentData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE_MEDICAL_EQUIPMENT, { equipment_data: equipmentData }),
  
  analyzeStaffPerformance: (staffData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE_STAFF_PERFORMANCE, { staff_data: staffData }),
  
  analyzeDepartmentEfficiency: (departmentData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE_DEPARTMENT_EFFICIENCY, { department_data: departmentData }),
  
  optimizeHospitalResources: (resourceData) => 
    apiPost(API_ENDPOINTS.AI_OPTIMIZE_HOSPITAL_RESOURCES, { resource_data: resourceData }),
  
  predictPatientAdmissions: (historicalData, period = 'weekly') => 
    apiPost(API_ENDPOINTS.AI_PREDICT_PATIENT_ADMISSIONS, { historical_data: historicalData, period }),
  
  // Medical Research AI
  analyzeMedicalResearch: (researchData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE_MEDICAL_RESEARCH, { research_data: researchData }),
  
  analyzeClinicalTrials: (trialData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE_CLINICAL_TRIALS, { trial_data: trialData }),
  
  analyzeDrugInteractions: (drugData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE_DRUG_INTERACTIONS, { drug_data: drugData }),
  
  recommendTreatment: (patientCase) => 
    apiPost(API_ENDPOINTS.AI_RECOMMEND_TREATMENT, { patient_case: patientCase }),
  
  analyzeMedicalProtocols: (protocolData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE_MEDICAL_PROTOCOLS, { protocol_data: protocolData }),
  
  // Medical AI Services
  analyzeSymptoms: (symptoms) => apiPost(API_ENDPOINTS.AI_ANALYZE_SYMPTOMS, { symptoms }),
  
  predictDisease: (symptoms) => apiPost(API_ENDPOINTS.AI_PREDICT_DISEASE, { symptoms }),
  
  analyzeMedicalText: (text) => apiPost(API_ENDPOINTS.AI_ANALYZE_MEDICAL_TEXT, { text }),
  
  summarizeText: (text) => apiPost(API_ENDPOINTS.AI_SUMMARIZE_MEDICAL, { text }),
  
  analyzeLabResults: (labData) => apiPost(API_ENDPOINTS.AI_ANALYZE_LAB_RESULTS, { lab_results: labData }),
  
  analyzeMedicalImage: (imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);
    return apiUpload(API_ENDPOINTS.AI_ANALYZE_MEDICAL_IMAGE, formData);
  },
  
  // Safety AI Services
  assessRisk: (data) => apiPost(API_ENDPOINTS.AI_ASSESS_RISK, { data }),
  
  analyzeSafetyDocument: (documentData) => {
    const formData = new FormData();
    formData.append('document', documentData);
    return apiUpload(API_ENDPOINTS.AI_ANALYZE_SAFETY_DOCUMENT, formData);
  },
  
  detectObjects: (imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);
    return apiUpload(API_ENDPOINTS.AI_DETECT_OBJECTS, formData);
  },
  
  // Generic AI Analysis
  genericAnalyze: (serviceType, inputData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE, { service_type: serviceType, input_data: inputData }),
  
  // Document Generation
  generateDocument: (template, data) => 
    apiPost(API_ENDPOINTS.AI_DOCUMENTS_GENERATE, { template, data }),
  
  getDocumentHistory: () => apiPost(API_ENDPOINTS.AI_DOCUMENTS_HISTORY),
  
  getAIInsights: () => apiPost(API_ENDPOINTS.AI_INSIGHTS),
  
  // Legacy video analysis (for backward compatibility)
  analyzeVideoWithPrompt: (videoData, customPrompt, options = {}) => {
    const formData = new FormData();
    formData.append('video', videoData);
    formData.append('customPrompt', customPrompt);
    formData.append('analysisType', 'custom');
    
    Object.keys(options).forEach(key => {
      if (options[key] !== undefined) {
        formData.append(key, options[key]);
      }
    });
    
    return apiUpload(API_ENDPOINTS.AI_VIDEO_ANALYSIS_CUSTOM, formData);
  },
  
  generateVideoAnalysisReport: (analysisId, format = 'pdf', reportType = null) => 
    apiPost(API_ENDPOINTS.AI_GENERATE_REPORT, { analysisId, format, type: reportType }, {
      responseType: 'blob'
    }),
  
  getVideoAnalysisHistory: (limit = 10) => 
    apiPost(API_ENDPOINTS.AI_VIDEO_ANALYSIS_HISTORY, { limit }),
  
  getVideoAnalysisResult: (analysisId) => 
    apiPost(API_ENDPOINTS.AI_VIDEO_ANALYSIS_RESULT, { analysisId }),
};

// ==================== NOTIFICATION SERVICE INTEGRATION ====================

// Notification Service API methods
export const notificationServiceAPI = {
  // Incident Reporting
  reportIncident: (incidentData) => apiPost(API_ENDPOINTS.REPORT_INCIDENT, incidentData),
  getIncidents: (filters = {}) => apiGet(API_ENDPOINTS.INCIDENTS, { params: filters }),
  getIncidentById: (id) => apiGet(API_ENDPOINTS.INCIDENT_BY_ID(id)),
  updateIncidentStatus: (id, status, notes = '') => 
    apiPut(API_ENDPOINTS.INCIDENT_STATUS(id), { status, notes }),
  assignInvestigator: (id, investigatorId) => 
    apiPut(API_ENDPOINTS.INCIDENT_ASSIGN(id), { investigatorId }),
  addInvestigationNotes: (id, notes) => 
    apiPost(API_ENDPOINTS.INCIDENT_INVESTIGATION_NOTES(id), { notes }),
  uploadEvidence: (incidentId, file) => {
    const formData = new FormData();
    formData.append('evidence', file);
    formData.append('incidentId', incidentId);
    return api.post(API_ENDPOINTS.INCIDENT_EVIDENCE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getIncidentStats: (timeRange = 'month') => 
    apiGet(API_ENDPOINTS.INCIDENT_STATS, { params: { timeRange } }),
  exportIncidents: (filters = {}) => 
    apiPost(API_ENDPOINTS.INCIDENT_EXPORT, filters, { responseType: 'blob' }),

  // Notification Management
  getNotifications: () => apiGet(API_ENDPOINTS.NOTIFICATIONS),
  markAsRead: (notificationId) => apiPost(API_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId)),
  markAllRead: () => apiPost(API_ENDPOINTS.MARK_ALL_READ),
  createNotification: (notificationData) => apiPost(API_ENDPOINTS.NOTIFICATIONS, notificationData),
  getNotificationPreferences: (userId) => apiGet(API_ENDPOINTS.NOTIFICATION_PREFERENCES(userId)),
  updateNotificationPreferences: (userId, preferences) => 
    apiPut(API_ENDPOINTS.NOTIFICATION_PREFERENCES(userId), preferences),
  sendBulkNotification: (notificationData, userGroups = []) => 
    apiPost(API_ENDPOINTS.NOTIFICATION_BULK, { ...notificationData, userGroups }),
  clearAllNotifications: () => apiDelete(API_ENDPOINTS.CLEAR_ALL_NOTIFICATIONS),
  getNotificationStats: () => apiGet(API_ENDPOINTS.NOTIFICATION_STATS),
};

// ==================== PLAN NORMALIZATION UTILITIES ====================

// Country pricing configuration (must match backend)
const COUNTRY_PRICING = {
  "Ghana": {
    "free": {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "GHS"},
    "basic": {"1_month": 100, "6_month": 500, "1_year": 900, "currency": "GHS"},
    "pro": {"1_month": 200, "6_month": 1000, "1_year": 1800, "currency": "GHS"},
    "enterprise": {"1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "GHS"}
  },
  "Qatar": {
    "free": {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "QAR"},
    "basic": {"1_month": 100, "6_month": 500, "1_year": 900, "currency": "QAR"},
    "pro": {"1_month": 300, "6_month": 1500, "1_year": 2700, "currency": "QAR"},
    "enterprise": {"1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "QAR"}
  },
  "United States": {
    "free": {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "USD"},
    "basic": {"1_month": 29, "6_month": 150, "1_year": 270, "currency": "USD"},
    "pro": {"1_month": 79, "6_month": 420, "1_year": 756, "currency": "USD"},
    "enterprise": {"1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "USD"}
  },
  "default": {
    "free": {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "USD"},
    "basic": {"1_month": 20, "6_month": 100, "1_year": 180, "currency": "USD"},
    "pro": {"1_month": 50, "6_month": 250, "1_year": 450, "currency": "USD"},
    "enterprise": {"1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "USD"}
  }
};

// Plan features and limits (must match backend)
const PLANS = {
  "free": {
    "label": "Free Forever",
    "limits": {
      "uploads_per_month": 5,
      "api_calls_per_month": 50,
      "team_members": 1,
      "monitoring_stations": 1,
      "ai_requests_per_month": 10,
      "camera_feeds": 1,
      "video_analysis_minutes": 10
    },
    "features": [
      "Basic document analysis",
      "Email notifications",
      "5 document uploads per month",
      "50 API calls per month",
      "10 AI requests per month",
      "1 team member",
      "1 monitoring station",
      "1 camera feed",
      "10 minutes video analysis"
    ]
  },
  "basic": {
    "label": "Basic",
    "limits": {
      "uploads_per_month": 100,
      "api_calls_per_month": 1000,
      "team_members": 10,
      "monitoring_stations": 5,
      "ai_requests_per_month": 100,
      "camera_feeds": 3,
      "video_analysis_minutes": 120
    },
    "features": [
      "All Free features",
      "PDF/Word/Excel generation",
      "Basic analytics",
      "100 document uploads per month",
      "1000 API calls per month",
      "100 AI requests per month",
      "Up to 10 team members",
      "Up to 5 monitoring stations",
      "Up to 3 camera feeds",
      "2 hours video analysis"
    ]
  },
  "pro": {
    "label": "Professional",
    "limits": {
      "uploads_per_month": 500,
      "api_calls_per_month": 5000,
      "team_members": 50,
      "monitoring_stations": 20,
      "ai_requests_per_month": 500,
      "camera_feeds": 10,
      "video_analysis_minutes": 600
    },
    "features": [
      "All Basic features",
      "ML image analysis",
      "Advanced analytics",
      "Team management",
      "500 document uploads per month",
      "5000 API calls per month",
      "500 AI requests per month",
      "Up to 50 team members",
      "Up to 20 monitoring stations",
      "Up to 10 camera feeds",
      "10 hours video analysis",
      "Real-time monitoring alerts",
      "Priority email support",
      "Custom reporting"
    ]
  },
  "enterprise": {
    "label": "Enterprise",
    "limits": {
      "uploads_per_month": "Unlimited",
      "api_calls_per_month": "Unlimited",
      "team_members": "Unlimited",
      "monitoring_stations": "Unlimited",
      "ai_requests_per_month": "Unlimited",
      "camera_feeds": "Unlimited",
      "video_analysis_minutes": "Unlimited"
    },
    "features": [
      "All Pro features",
      "Custom workflows & forms",
      "API Integration",
      "Advanced analytics & custom dashboards",
      "Dedicated infrastructure (SLA)",
      "On-premise deployment options",
      "Dedicated account manager & support",
      "Custom training & onboarding",
      "White-labeling options",
      "Advanced AI models",
      "Predictive analytics",
      "Custom integrations"
    ]
  }
};

// ==================== PLAN MANAGEMENT API SERVICE ====================

export const planManagementAPI = {
  // Get current user plan details
  getUserPlanDetails: async () => {
    try {
      const response = await apiGet('/user/plan');
      if (response.success && response.plan) {
        updateUserPlanData(response.plan);
      }
      return response;
    } catch (error) {
      console.error('Error getting user plan:', error);
      return null;
    }
  },
  
  // Get plan pricing for all plans
  getAllPlanPricing: (country = null) => {
    const userCountry = country || getUserCountry();
    return apiGet('/plans/pricing', { 
      params: { country: userCountry } 
    });
  },
  
  // Get features for specific plan
  getPlanFeatures: (planName = null) => {
    const plan = planName || getUserPlan();
    return apiGet('/plans/features', { 
      params: { plan } 
    });
  },
  
  // Check usage limits
  checkUsageLimits: () => {
    return apiGet('/user/usage-limits');
  },
  
  // Upgrade plan
  upgradePlan: (newPlan, billingInfo = {}) => {
    return apiPost('/subscription/upgrade', {
      new_plan: newPlan,
      billing_info: billingInfo
    });
  },
  
  // Validate feature access
  validateFeatureAccess: (featureName) => {
    return apiPost('/plans/validate-feature', {
      feature_name: featureName
    });
  },
  
  // Get available features
  getAvailableFeatures: () => {
    return apiGet('/plans/available-features');
  },
  
  // Billing management
  getInvoices: () => apiGet('/billing/invoices'),
  getBillingHistory: () => apiGet('/billing/history'),
  updateBillingInfo: (billingInfo) => 
    apiPost('/billing/update', billingInfo)
};

// ==================== INITIALIZATION ====================

// Initialize plan system on import
const initializePlanSystem = () => {
  console.log('🔄 Initializing Plan Normalization System');
  
  // Check for super admin status on initialization
  if (isSuperAdmin()) {
    console.log('👑 Super admin detected on initialization');
    localStorage.setItem('is_super_admin', 'true');
    localStorage.setItem('user_plan', 'super_admin');
  }
  
  // Check if user data exists and normalize it
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && (user.plan || user.subscription_plan || user.is_super_admin)) {
      const normalizedUser = updateUserPlanData(user);
      console.log('✅ User plan data normalized:', normalizedUser.effective_plan);
    }
  } catch (error) {
    console.error('Error initializing plan system:', error);
  }
  
  return true;
};

// Run initialization
initializePlanSystem();

// ==================== SAFETYPRO SERVICE API ====================

// SafetyPro Service API methods
export const safetyProServiceAPI = {
  // Dashboard
  getDashboard: () => apiGet('/safetypro/dashboard'),
  
  // Pending Approvals
  getPendingApprovals: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/safetypro/pending?${params}`);
  },
  
  // Stats
  getApprovalStats: () => apiGet('/safetypro/stats'),
  
  // Single Actions
  approveUser: (userId, data = {}) => 
    apiPost(`/safetypro/approve/${userId}`, data),
  
  rejectUser: (userId, data = {}) => 
    apiPost(`/safetypro/reject/${userId}`, data),
  
  // Bulk Actions
  bulkAction: (userIds, action, data = {}) => 
    apiPost('/safetypro/bulk-action', {
      user_ids: userIds,
      action: action,
      ...data
    }),
  
  // Bulk Operations
  bulkOperation: (payload) => 
    apiPost('/safetypro/bulk-operation', payload),
  
  // User Details
  getUserDetails: (userId) => 
    apiGet(`/safetypro/user/${userId}`),
  
  // User Upgrade/Downgrade
  upgradeUserPlan: (payload) => 
    apiPost('/safetypro/user/upgrade', payload),
  
  downgradeUserPlan: (userId) => 
    apiPost(`/safetypro/user/${userId}/downgrade`),
  
  // User Suspension/Activation
  suspendUser: (userId) => 
    apiPost(`/safetypro/user/${userId}/suspend`),
  
  activateUser: (userId) => 
    apiPost(`/safetypro/user/${userId}/activate`),
  
  blockUser: (userId) => 
    apiPost(`/safetypro/user/${userId}/block`),
  
  // System Health
  getSystemHealth: () => 
    apiGet('/admin/system/health'),
  
  // Team Notification
  notifyTeam: (message) => 
    apiPost('/safetypro/notify-team', { message }),
  
  // Dashboard Data
  getSafetyProDashboardData: () => 
    apiGet('/safetypro/dashboard-data'),
  
  // Recent Activity
  getRecentActivity: (limit = 10) => 
    apiGet(`/safetypro/recent-activity?limit=${limit}`),
  
  // Plan Distribution
  getPlanDistribution: () => 
    apiGet('/safetypro/plan-distribution'),
  
  // User Growth Metrics
  getUserGrowthMetrics: (period = 'month') => 
    apiGet(`/safetypro/user-growth?period=${period}`),
  
  // Revenue Metrics
  getRevenueMetrics: (period = 'month') => 
    apiGet(`/safetypro/revenue?period=${period}`),
  
  // Activity Logs
  getActivityLogs: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/safetypro/activity-logs?${params}`);
  },
  
  // Analytics
  getAnalytics: (timeRange = '30d') => 
    apiGet(`/safetypro/analytics?timeRange=${timeRange}`),
  
  // Reports
  generateReport: (reportConfig) => 
    apiPost('/safetypro/reports', reportConfig),
  
  // Quick Actions
  massApproveVerified: () => 
    apiPost('/safetypro/mass-approve-verified'),
  
  sendFollowUpEmails: (userIds) => 
    apiPost('/safetypro/send-follow-ups', { userIds }),
  
  // Utility
  getTeamMembers: () => 
    apiGet('/safetypro/team-members'),
  
  getUserAnalytics: (userId) => 
    apiGet(`/safetypro/users/${userId}/analytics`),
  
  // Manual User Creation
  createManualUser: (userData) => 
    apiPost('/admin/users/manual-create', userData),
  
  bulkCreateUsersFromCSV: (csvFile) => {
    const formData = new FormData();
    formData.append('file', csvFile);
    return apiUpload('/admin/users/manual-create/bulk', formData);
  },
  
  getRecentlyCreatedUsers: (limit = 50) => 
    apiGet(`/admin/users/recently-created?limit=${limit}`),
  
  resendWelcomeEmail: (userId) => 
    apiPost(`/admin/users/${userId}/resend-welcome`),
  
  resetUserPassword: (userId) => 
    apiPost(`/admin/users/${userId}/reset-password`),
  
  getUserCreationStats: (timeRange = '30d') => 
    apiGet(`/admin/users/creation-stats?timeRange=${timeRange}`),
  
  // User Management
  getAllUsers: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/admin/users?${params}`);
  },
  
  createUser: (userData) => 
    apiPost('/admin/users/create', userData),
  
  updateUser: (userId, userData) => 
    apiPut(`/admin/users/${userId}`, userData),
  
  deleteUser: (userId) => 
    apiDelete(`/admin/users/${userId}`),
  
  bulkImportUsers: (users) => 
    apiPost('/admin/users/import', { users }),
  
  // Notifications
  sendWelcomeEmail: (userId) => 
    apiPost(`/admin/users/${userId}/send-welcome`),
  
  sendApprovalNotification: (userId) => 
    apiPost(`/admin/users/${userId}/notify-approval`),
  
  sendRejectionNotification: (userId, reason) => 
    apiPost(`/admin/users/${userId}/notify-rejection`, { reason }),
  
  // Exports
  exportUsers: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/admin/users/export?${params}`);
  },
  
  exportApprovalStats: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/admin/approvals/export?${params}`);
  },
  
  generatePerformanceReport: (reportConfig) => 
    apiPost('/admin/reports/performance', reportConfig),
  
  // Subscription Management
  updateUserSubscription: (userId, subscriptionData) => 
    apiPut(`/admin/users/${userId}/subscription`, subscriptionData),
  
  cancelUserSubscription: (userId) => 
    apiPost(`/admin/users/${userId}/cancel-subscription`),
  
  getSubscriptionStats: () => 
    apiGet('/admin/subscriptions/stats'),
  
  // Utilities
  checkAutoApprove: (email) => 
    apiPost('/admin/auto-approve-check', { email }),
  
  getUserActivityTimeline: (userId, filters = {}) => {
    const params = new URLSearchParams({
      ...filters,
      user_id: userId
    }).toString();
    return apiGet(`/admin/activity/timeline?${params}`);
  },
  
  getFeatureUsage: (userId, days = 30) => 
    apiGet(`/admin/analytics/feature-usage/${userId}?days=${days}`),
  
  uploadUserDocument: (userId, file, documentType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    return apiUpload(`/admin/users/${userId}/documents`, formData);
  },
  
  getUserDocuments: (userId) => 
    apiGet(`/admin/users/${userId}/documents`),
  
  // Audit Logs
  getAuditLogs: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/admin/audit-logs?${params}`);
  },
  
  getUserActivityLogs: (userId, filters = {}) => {
    const params = new URLSearchParams({
      ...filters,
      user_id: userId
    }).toString();
    return apiGet(`/admin/activity-logs?${params}`);
  },
  
  // System Settings
  getSystemSettings: () => 
    apiGet('/admin/settings'),
  
  updateSystemSettings: (settings) => 
    apiPut('/admin/settings', settings),
  
  getEmailTemplates: () => 
    apiGet('/admin/email-templates'),
  
  updateEmailTemplate: (templateName, templateData) => 
    apiPut(`/admin/email-templates/${templateName}`, templateData),
  
  // Search & Filters
  searchUsers: (searchParams = {}) => {
    const params = new URLSearchParams(searchParams).toString();
    return apiGet(`/admin/users/search?${params}`);
  },
  
  getUserFilterOptions: () => 
    apiGet('/admin/users/filter-options'),
  
  // Advanced User Management
  mergeUsers: (userIds, mergeData = {}) => 
    apiPost('/admin/users/merge', {
      user_ids: userIds,
      ...mergeData
    }),
  
  deactivateUser: (userId, reason = '') => 
    apiPost(`/admin/users/${userId}/deactivate`, { reason }),
  
  reactivateUser: (userId) => 
    apiPost(`/admin/users/${userId}/reactivate`),
  
  // Performance Analytics
  getPerformanceOverview: (days = 30) => 
    apiGet(`/performance/overview?days=${days}`),
  
  getMonthlyPerformance: (months = 12) => 
    apiGet(`/performance/monthly?months=${months}`),
  
  getEngagementMetrics: (days = 30) => 
    apiGet(`/performance/engagement?days=${days}`),
  
  getUserPerformance: (userId, days = 30) => 
    apiGet(`/user/performance/${userId}?days=${days}`),
  
  getAdminUserAnalytics: (userId, days = 30) => 
    apiGet(`/admin/analytics/user/${userId}?days=${days}`),
  
  // CSV Operations
  downloadUserCSVTemplate: () => 
    apiGet('/admin/users/csv-template', { responseType: 'blob' }),
  
  validateCSVFile: (formData) => 
    apiUpload('/admin/users/validate-csv', formData),
  
  getBulkOperationStatus: (operationId) => 
    apiGet(`/admin/operations/${operationId}/status`),
  
  // Admin Registration
  registerAdmin: (adminData) => 
    apiPost('/admin/register', adminData),
  
  setupSuperAdmin: (adminData, secretKey) => {
    const headers = {
      'X-Setup-Key': secretKey
    };
    return apiPost('/system/setup-super-admin', adminData, { headers });
  },


  
  // Error Handling Wrappers
  safeCall: async (apiCall, ...args) => {
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
  },
  
  safeCallWithRetry: async (apiCall, args, maxRetries = 3) => {
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
};



// Document Control Service API methods
export const documentServiceAPI = {
  // ============================================================
  // CORE CRUD OPERATIONS
  // ============================================================
  
  // Get documents with filters
  getDocuments: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.BASE}?${params.toString()}`);
  },
  
  // Get single document
  getDocument: (id) => apiGet(API_ENDPOINTS.DOCUMENTS.GET(id)),
  
  // Create document
  createDocument: (formData) => {
    // FormData expected with file and metadata
    return apiUpload(API_ENDPOINTS.DOCUMENTS.CREATE, formData);
  },
  
  // Update document
  updateDocument: (id, data) => apiPut(API_ENDPOINTS.DOCUMENTS.UPDATE(id), data),
  
  // Delete document (soft delete)
  deleteDocument: (id) => apiDelete(API_ENDPOINTS.DOCUMENTS.DELETE(id)),
  
  // Restore deleted document
  restoreDocument: (id) => apiPost(API_ENDPOINTS.DOCUMENTS.RESTORE(id)),
  
  // ============================================================
  // SEARCH & FILTER
  // ============================================================
  
  // Search documents
  searchDocuments: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.SEARCH}?${params.toString()}`);
  },
  
  // Global search across all documents
  globalSearch: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.GLOBAL_SEARCH}?${params.toString()}`);
  },
  
  // ============================================================
  // VERSION CONTROL
  // ============================================================
  
  // Get version history
  getVersions: (documentId) => apiGet(API_ENDPOINTS.DOCUMENTS.VERSIONS(documentId)),
  
  // Create new version
  createVersion: (documentId, formData) => {
    return apiUpload(API_ENDPOINTS.DOCUMENTS.CREATE_VERSION(documentId), formData);
  },
  
  // Rollback to version
  rollbackVersion: (documentId, versionNumber) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.ROLLBACK(documentId), { version: versionNumber }),
  
  // ============================================================
  // WORKFLOW ACTIONS
  // ============================================================
  
  // Submit for review
  submitForReview: (id, reviewerId = null) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SUBMIT(id), { reviewer_id: reviewerId }),
  
  // Review document
  reviewDocument: (id, data) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.REVIEW(id), data),
  
  // Approve document
  approveDocument: (id, comment = '') => 
    apiPost(API_ENDPOINTS.DOCUMENTS.APPROVE(id), { comment }),
  
  // Reject document
  rejectDocument: (id, reason = '') => 
    apiPost(API_ENDPOINTS.DOCUMENTS.REJECT(id), { reason }),
  
  // Publish document
  publishDocument: (id) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.PUBLISH(id)),
  
  // Archive document
  archiveDocument: (id, reason = '') => 
    apiPost(API_ENDPOINTS.DOCUMENTS.ARCHIVE(id), { reason }),
  
  // ============================================================
  // REVIEW MANAGEMENT
  // ============================================================
  
  // Get documents requiring review
  getReviewDocuments: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.REVIEW_DOCUMENTS}?${params.toString()}`);
  },
  
  // Get review history
  getReviewHistory: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.REVIEW_HISTORY(documentId)),
  
  // Get review detail
  getDocumentReviewDetail: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.REVIEW_DETAIL(documentId)),
  
  // Update review date
  updateReviewDate: (documentId, reviewDate, frequency, notes = '') => 
    apiPut(API_ENDPOINTS.DOCUMENTS.UPDATE_REVIEW_DATE(documentId), {
      review_date: reviewDate,
      review_frequency: frequency,
      notes: notes
    }),
  
  // Complete review
  completeReview: (documentId, notes = '') => 
    apiPost(API_ENDPOINTS.DOCUMENTS.COMPLETE_REVIEW(documentId), { notes }),
  
  // Send review reminders
  sendReviewReminders: (documentIds) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SEND_REMINDERS, { document_ids: documentIds }),
  
  // Bulk update review status
  bulkUpdateReviewStatus: (documentIds, status) => 
    apiPut(API_ENDPOINTS.DOCUMENTS.BULK_REVIEW_STATUS, { document_ids: documentIds, status }),
  
  // Get expiring documents
  getExpiringDocuments: (days = 30, filters = {}) => {
    const params = new URLSearchParams({ days, ...filters });
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.EXPIRING}?${params.toString()}`);
  },
  
  // Get overdue documents
  getOverdueDocuments: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.OVERDUE}?${params.toString()}`);
  },
  
  // ============================================================
  // AUDIT
  // ============================================================
  
  // Get audit logs
  getAuditLogs: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.AUDIT}?${params.toString()}`);
  },
  
  // Export audit logs
  exportAuditLogs: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.AUDIT_EXPORT}?${params.toString()}`, {
      responseType: 'blob'
    });
  },
  
  // Check document compliance
  checkDocumentCompliance: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.COMPLIANCE(documentId)),
  
  // ============================================================
  // INTEGRATION (LINKS)
  // ============================================================
  
  // Get document links
  getDocumentLinks: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.LINKS}?${params.toString()}`);
  },
  
  // Get available items for linking
  getAvailableLinkItems: (type, filters = {}) => {
    const params = new URLSearchParams({ type, ...filters });
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.LINKS_AVAILABLE}?${params.toString()}`);
  },
  
  // Create document link
  createDocumentLink: (data) => apiPost(API_ENDPOINTS.DOCUMENTS.LINK_CREATE, data),
  
  // Remove link
  removeDocumentLink: (linkId) => apiDelete(API_ENDPOINTS.DOCUMENTS.LINK_REMOVE(linkId)),
  
  // Bulk remove links
  bulkRemoveLinks: (linkIds) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.LINKS_BULK_REMOVE, { ids: linkIds }),
  
  // ============================================================
  // BULK OPERATIONS
  // ============================================================
  
  // Bulk update status
  bulkUpdateStatus: (ids, status) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_STATUS, { ids, status }),
  
  // Bulk delete
  bulkDelete: (ids) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_DELETE, { ids }),
  
  // Bulk assign tags
  bulkAssignTags: (ids, tags) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_TAGS, { ids, tags }),
  
  // Bulk archive
  bulkArchive: (ids) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_ARCHIVE, { ids }),
  
  // Bulk publish
  bulkPublish: (ids) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_PUBLISH, { ids }),
  
  // Bulk mark reviewed
  bulkMarkReviewed: (ids) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_MARK_REVIEWED, { ids }),
  
  // Bulk upload
  bulkUpload: (formData) => {
    return apiUpload(API_ENDPOINTS.DOCUMENTS.BULK_UPLOAD, formData);
  },
  
  // ============================================================
  // IMPORT / EXPORT
  // ============================================================
  
  // Import documents
  importDocuments: (formData) => {
    return apiUpload(API_ENDPOINTS.DOCUMENTS.IMPORT, formData);
  },
  
  // Export documents
  exportDocuments: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.EXPORT}?${params.toString()}`, {
      responseType: 'blob'
    });
  },
  
  // Export to CSV
  exportToCSV: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.EXPORT_CSV}?${params.toString()}`, {
      responseType: 'blob'
    });
  },
  
  // Export to PDF
  exportToPDF: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.EXPORT_PDF}?${params.toString()}`, {
      responseType: 'blob'
    });
  },
  
  // ============================================================
  // EDITOR
  // ============================================================
  
  // Auto-save document
  autoSaveDocument: (documentId, data) => 
    apiPut(API_ENDPOINTS.DOCUMENTS.AUTOSAVE(documentId), data),
  
  // Upload image for document
  uploadImage: (formData) => {
    return apiUpload(API_ENDPOINTS.DOCUMENTS.UPLOAD_IMAGE, formData);
  },
  
  // Get document content
  getDocumentContent: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.CONTENT(documentId)),
  
  // ============================================================
  // DIGITAL SIGNATURES
  // ============================================================
  
  // Get document signatures
  getDocumentSignatures: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SIGNATURES(documentId)),
  
  // Create signature
  createSignature: (data) => apiPost(API_ENDPOINTS.DOCUMENTS.SIGNATURE_CREATE, data),
  
  // Verify signature
  verifySignature: (signatureId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SIGNATURE_VERIFY(signatureId)),
  
  // Revoke signature
  revokeSignature: (signatureId, data) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SIGNATURE_REVOKE(signatureId), data),
  
  // Get signature history
  getSignatureHistory: (signatureId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SIGNATURE_HISTORY(signatureId)),
  
  // Download signature certificate
  downloadSignatureCertificate: (signatureId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SIGNATURE_CERTIFICATE(signatureId), {
      responseType: 'blob'
    }),
  
  // ============================================================
  // SAVED SEARCHES
  // ============================================================
  
  // Save search
  saveSearch: (name, filters) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SAVED_SEARCHES, { name, filters }),
  
  // Get saved searches
  getSavedSearches: () => apiGet(API_ENDPOINTS.DOCUMENTS.SAVED_SEARCHES),
  
  // Delete saved search
  deleteSavedSearch: (searchId) => 
    apiDelete(API_ENDPOINTS.DOCUMENTS.SAVED_SEARCH_DELETE(searchId)),
  
  // ============================================================
  // SEARCH HISTORY
  // ============================================================
  
  // Get search history
  getSearchHistory: () => apiGet(API_ENDPOINTS.DOCUMENTS.SEARCH_HISTORY),
  
  // Add to search history
  addSearchHistory: (term) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SEARCH_HISTORY, { term }),
  
  // Clear search history
  clearSearchHistory: () => 
    apiDelete(API_ENDPOINTS.DOCUMENTS.SEARCH_HISTORY_CLEAR),
  
  // ============================================================
  // STATS & ANALYTICS
  // ============================================================
  
  // Get document stats
  getStats: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.STATS}?${params.toString()}`);
  },
  
  // Get module stats
  getModuleStats: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.MODULE_STATS}?${params.toString()}`);
  },
  
  // Get document analytics
  getDocumentAnalytics: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.ANALYTICS}?${params.toString()}`);
  },
  
  // Get review analytics
  getReviewAnalytics: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.REVIEW_ANALYTICS}?${params.toString()}`);
  },
  
  // Get compliance analytics
  getComplianceAnalytics: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.COMPLIANCE_ANALYTICS}?${params.toString()}`);
  },
  
  // ============================================================
  // RECENT & TASKS
  // ============================================================
  
  // Get recent documents
  getRecentDocuments: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.RECENT}?${params.toString()}`);
  },
  
  // Get pending tasks
  getPendingTasks: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.PENDING_TASKS}?${params.toString()}`);
  },
  
  // ============================================================
  // DOWNLOAD & PREVIEW
  // ============================================================
  
  // Download document
  downloadDocument: (id) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id), { responseType: 'blob' }),
  
  // Get preview URL
  getPreviewUrl: (id) => apiGet(API_ENDPOINTS.DOCUMENTS.PREVIEW(id)),
  
  // Bulk download
  bulkDownloadDocuments: (ids) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_DOWNLOAD, { ids }, { responseType: 'blob' }),
  
  // ============================================================
  // AI FEATURES
  // ============================================================
  
  // AI document analysis
  analyzeDocument: (documentId) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.ANALYZE_AI(documentId)),
  
  // Suggest tags
  suggestTags: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SUGGEST_TAGS(documentId)),
  
  // Extract key information
  extractKeyInfo: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.EXTRACT_INFO(documentId)),
  
  // Check compliance
  checkCompliance: (documentId) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.CHECK_COMPLIANCE(documentId)),
  
  // ============================================================
  // SHARING
  // ============================================================
  
  // Share document
  shareDocument: (documentId, data) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SHARE(documentId), data),
  
  // Get sharing settings
  getSharingSettings: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SHARING_SETTINGS(documentId)),
  
  // Remove share
  removeShare: (documentId, userId) => 
    apiDelete(API_ENDPOINTS.DOCUMENTS.REMOVE_SHARE(documentId, userId)),
  
  // ============================================================
  // EXPIRY MANAGEMENT
  // ============================================================
  
  // Extend expiry date
  extendExpiry: (documentId, newExpiryDate) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.EXTEND_EXPIRY(documentId), { new_expiry_date: newExpiryDate }),
};




// ============================================================
// PLAN-BASED ACCESS CONTROL FOR DOCUMENTS
// ============================================================

/**
 * Document Control Plan Requirements
 * Documents is a premium feature - requires at least 'pro' plan
 */
export const DOCUMENT_PLAN_REQUIREMENTS = {
  // Feature → Required Plan mapping
  features: {
    'documents.view': 'basic',
    'documents.create': 'basic',
    'documents.edit': 'basic',
    'documents.delete': 'pro',
    'documents.version': 'pro',
    'documents.signature': 'pro',
    'documents.audit': 'pro',
    'documents.analytics': 'pro',
    'documents.bulk': 'enterprise',
    'documents.ai_analysis': 'pro',
    'documents.share': 'pro',
    'documents.export': 'pro',
    'documents.import': 'enterprise',
    'documents.integration': 'pro',
    'documents.review': 'pro',
    'documents.publish': 'pro'
  },
  
  // Default plan if not specified
  defaultPlan: 'basic'
};

/**
 * Check if user can access document feature
 */
export const canAccessDocumentFeature = (feature) => {
  // SUPER ADMIN BYPASS
  if (isSuperAdmin()) {
    console.log(`👑 SUPER ADMIN: Document feature ${feature} granted`);
    return true;
  }
  
  const requiredPlan = DOCUMENT_PLAN_REQUIREMENTS.features[feature] || DOCUMENT_PLAN_REQUIREMENTS.defaultPlan;
  const userPlan = getUserPlan();
  const userLevel = PLAN_HIERARCHY[userPlan] || 0;
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;
  
  const hasAccess = userLevel >= requiredLevel;
  
  console.log(`📄 Document Feature Access: ${feature}`);
  console.log(`   User Plan: ${userPlan} (Level: ${userLevel})`);
  console.log(`   Required Plan: ${requiredPlan} (Level: ${requiredLevel})`);
  console.log(`   Has Access: ${hasAccess ? '✅ Yes' : '❌ No'}`);
  
  return hasAccess;
};

/**
 * Document-aware API call with plan checking
 */
export const documentApiCall = async (feature, endpoint, data = {}, options = {}) => {
  // Check if user has access to this document feature
  if (!canAccessDocumentFeature(feature)) {
    const userPlan = getUserPlan();
    const requiredPlan = DOCUMENT_PLAN_REQUIREMENTS.features[feature] || DOCUMENT_PLAN_REQUIREMENTS.defaultPlan;
    
    const upgradeError = {
      isPlanError: true,
      code: 'DOCUMENT_FEATURE_REQUIRES_UPGRADE',
      message: `Document feature "${feature}" requires ${requiredPlan} plan or higher`,
      userPlan,
      requiredPlan,
      feature,
      upgradeUrl: getUpgradeUrl(requiredPlan),
      showUpgradeModal: true
    };
    
    console.error('❌ Document feature access denied:', upgradeError);
    showUpgradeModal(upgradeError);
    throw upgradeError;
  }
  
  // Make the API call
  try {
    const response = await apiCall(endpoint.method || 'GET', endpoint.url, data, options);
    return response;
  } catch (error) {
    // Check if it's a document-specific error
    if (error.isPlanError) {
      showUpgradeModal(error);
    }
    throw error;
  }
};

// ============================================================
// UPDATE PLAN LIMITS WITH DOCUMENT FEATURES
// ============================================================

// Update PLANS configuration with document features
// Add to the existing PLANS object

const DOCUMENT_FEATURES = {
  free: {
    document_limits: {
      max_documents: 5,
      max_versions: 3,
      max_file_size_mb: 5,
      allow_basic_view: true,
      allow_basic_create: false,
      allow_basic_edit: false,
      allow_versions: false,
      allow_signatures: false,
      allow_audit: false,
      allow_analytics: false,
      allow_bulk: false,
      allow_ai: false,
      allow_sharing: false,
      allow_export: false,
      allow_import: false,
      allow_integration: false,
      allow_review: false,
      allow_publish: false
    }
  },
  basic: {
    document_limits: {
      max_documents: 50,
      max_versions: 10,
      max_file_size_mb: 10,
      allow_basic_view: true,
      allow_basic_create: true,
      allow_basic_edit: true,
      allow_versions: true,
      allow_signatures: false,
      allow_audit: false,
      allow_analytics: false,
      allow_bulk: false,
      allow_ai: false,
      allow_sharing: false,
      allow_export: false,
      allow_import: false,
      allow_integration: false,
      allow_review: false,
      allow_publish: false
    }
  },
  pro: {
    document_limits: {
      max_documents: 500,
      max_versions: 50,
      max_file_size_mb: 25,
      allow_basic_view: true,
      allow_basic_create: true,
      allow_basic_edit: true,
      allow_versions: true,
      allow_signatures: true,
      allow_audit: true,
      allow_analytics: true,
      allow_bulk: false,
      allow_ai: true,
      allow_sharing: true,
      allow_export: true,
      allow_import: false,
      allow_integration: true,
      allow_review: true,
      allow_publish: true
    }
  },
  enterprise: {
    document_limits: {
      max_documents: 'Unlimited',
      max_versions: 'Unlimited',
      max_file_size_mb: 100,
      allow_basic_view: true,
      allow_basic_create: true,
      allow_basic_edit: true,
      allow_versions: true,
      allow_signatures: true,
      allow_audit: true,
      allow_analytics: true,
      allow_bulk: true,
      allow_ai: true,
      allow_sharing: true,
      allow_export: true,
      allow_import: true,
      allow_integration: true,
      allow_review: true,
      allow_publish: true
    }
  },
  super_admin: {
    document_limits: {
      max_documents: 'Unlimited',
      max_versions: 'Unlimited',
      max_file_size_mb: 'Unlimited',
      allow_basic_view: true,
      allow_basic_create: true,
      allow_basic_edit: true,
      allow_versions: true,
      allow_signatures: true,
      allow_audit: true,
      allow_analytics: true,
      allow_bulk: true,
      allow_ai: true,
      allow_sharing: true,
      allow_export: true,
      allow_import: true,
      allow_integration: true,
      allow_review: true,
      allow_publish: true
    }
  }
};

// ============================================================
// DOCUMENT-SPECIFIC UTILITY FUNCTIONS
// ============================================================

/**
 * Get document limits for current user's plan
 */
export const getDocumentLimits = () => {
  if (isSuperAdmin()) {
    return DOCUMENT_FEATURES.super_admin.document_limits;
  }
  
  const userPlan = getUserPlan();
  const planLimits = DOCUMENT_FEATURES[userPlan] || DOCUMENT_FEATURES.free;
  return planLimits.document_limits;
};

/**
 * Check if user can perform document action
 */
export const canPerformDocumentAction = (action) => {
  if (isSuperAdmin()) return true;
  
  const limits = getDocumentLimits();
  const actionMap = {
    view: 'allow_basic_view',
    create: 'allow_basic_create',
    edit: 'allow_basic_edit',
    version: 'allow_versions',
    signature: 'allow_signatures',
    audit: 'allow_audit',
    analytics: 'allow_analytics',
    bulk: 'allow_bulk',
    ai: 'allow_ai',
    share: 'allow_sharing',
    export: 'allow_export',
    import: 'allow_import',
    integration: 'allow_integration',
    review: 'allow_review',
    publish: 'allow_publish'
  };
  
  const permissionKey = actionMap[action];
  if (!permissionKey) return false;
  
  return limits[permissionKey] === true;
};

/**
 * Get max documents allowed for current plan
 */
export const getMaxDocuments = () => {
  if (isSuperAdmin()) return 'Unlimited';
  
  const limits = getDocumentLimits();
  return limits.max_documents;
};

/**
 * Get max file size allowed (in MB)
 */
export const getMaxFileSizeMB = () => {
  if (isSuperAdmin()) return 'Unlimited';
  
  const limits = getDocumentLimits();
  return limits.max_file_size_mb;
};



// ==================== EXPORTS ====================

// ✅ SINGLE declaration of serviceAPIs (only one)
export const serviceAPIs = {
  hospital: hospitalServiceAPI,
  medicalAI: medicalAIServiceAPI,
  environmental: environmentalIntelligenceAPI,
  hse: hseIndustryService,
  camera: cameraMonitoringAPI,
  video: videoAnalysisAPI,
  ai: aiServiceAPI,
  notification: notificationServiceAPI,
  safetyPro: safetyProServiceAPI,
  plan: planManagementAPI,
  document: documentServiceAPI,  // ✅ ADD THIS
};

// Export all utilities
export const planUtils = {
  isSuperAdmin,
  getUserPlan,
  hasSuperAdminAccess,
  normalizePlanName,
  canAccessFeature,
  hasFeature,
  getUserLimits,
  getUserCountry,
  getUpgradeUrl,
  showUpgradeModal,
  registerUpgradeModalHandler,
  planAwareApiCall,
  usageAwareApiCall,
  updateUserPlanData,
  PLAN_HIERARCHY,
  PLAN_NAME_MAPPING,
  COUNTRY_PRICING,  
  PLANS,
  canAccessDocumentFeature,
  getDocumentLimits,
  canPerformDocumentAction,
  getMaxDocuments,
  getMaxFileSizeMB,
  DOCUMENT_PLAN_REQUIREMENTS,
  DOCUMENT_FEATURES,
  documentApiCall             
};

// ==================== FIX: Add missing exports at the end of the file ====================

// Make sure COUNTRY_PRICING and PLANS are properly exported
export { 
  COUNTRY_PRICING, 
  PLANS,
  PLAN_HIERARCHY,
  PLAN_NAME_MAPPING
};

// Export the API instance as default
export default api;

// Make sure all individual exports are properly defined