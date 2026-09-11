import axios from 'axios';

// ============================================================
// DEBUGGING - Non-intrusive
// ============================================================

// Enable debug mode - set to false in production
const pendingRequests = new Map();

// Flag to prevent duplicate interceptor registration
let interceptorsRegistered = false;

// Debug mode - set to true for development
const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Simple debug logger
const debugLog = (level, message, data = null) => {
  if (!DEBUG_MODE) return;
  const prefix = '[API-DEBUG]';
  if (level === 'error') console.error(`${prefix} ${message}`, data || '');
  else if (level === 'warn') console.warn(`${prefix} ${message}`, data || '');
  else console.log(`${prefix} ${message}`, data || '');
};

// Track duplicate requests (non-blocking)
let requestCounter = 0;
const requestMap = new Map();

const trackRequest = (key) => {
  if (!DEBUG_MODE) return;
  requestCounter++;
  if (requestMap.has(key)) {
    const count = requestMap.get(key);
    requestMap.set(key, count + 1);
    if (count > 1) {
      debugLog('warn', `Duplicate request detected: ${key} (${count + 1} times)`);
    }
  } else {
    requestMap.set(key, 1);
  }
  // Clean up after 5 seconds
  setTimeout(() => {
    if (requestMap.has(key)) {
      const count = requestMap.get(key);
      if (count <= 1) {
        requestMap.delete(key);
      }
    }
  }, 5000);
};

const generateRequestKey = (config) => {
  const { method, url, params, data } = config;
  // Don't include data for GET requests to avoid false duplicates
  const dataStr = method?.toLowerCase() === 'get' ? '' : JSON.stringify(data);
  return `${method}-${url}-${JSON.stringify(params)}-${dataStr}`;
};

const removePendingRequest = (key) => {
  if (pendingRequests.has(key)) {
    const pending = pendingRequests.get(key);
    if (pending && typeof pending.cancel === 'function') {
      pending.cancel();
    }
    pendingRequests.delete(key);
  }
};


// ============================================================
// CONFIGURATION & INITIALIZATION
// ============================================================

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

// ============================================================
// PREVENT DUPLICATE REQUESTS
// ============================================================



// ============================================================
// PLAN UTILITY FUNCTIONS
// ============================================================

/**
 * Check if user is super admin (from localStorage)
 * CACHED for performance
 */
let cachedSuperAdminStatus = null;
let cachedSuperAdminTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds

export const isSuperAdmin = () => {
  try {
    // Use cache to prevent repeated expensive checks
    const now = Date.now();
    if (cachedSuperAdminStatus !== null && (now - cachedSuperAdminTimestamp) < CACHE_DURATION) {
      return cachedSuperAdminStatus;
    }
    
    const localStorageIsSuperAdmin = localStorage.getItem('is_super_admin') === 'true';
    const userPlan = localStorage.getItem('user_plan');
    let user = null;
    
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      // If user data is corrupted, treat as not super admin
      cachedSuperAdminStatus = false;
      cachedSuperAdminTimestamp = now;
      return false;
    }
    
    // Check multiple possible super admin indicators
    const isSuperAdmin = 
      localStorageIsSuperAdmin ||
      userPlan === 'super_admin' ||
      user?.is_super_admin === true ||
      user?.user_type === 'super_admin' ||
      user?.role === 'super_admin' ||
      user?.account_info?.is_super_admin === true ||
      user?.is_system_team === true;
    
    // Update cache
    cachedSuperAdminStatus = isSuperAdmin;
    cachedSuperAdminTimestamp = now;
    
    return isSuperAdmin;
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
    return 'super_admin';
  }
  
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const plan = user.plan || user.subscription_plan || user.effective_plan || 'free';
    return normalizePlanName(plan);
  } catch (error) {
    console.error('Error getting user plan:', error);
    return 'free';
  }
};

/**
 * Check if super admin has access (always true)
 */
export const hasSuperAdminAccess = () => {
  return isSuperAdmin();
};

// ============================================================
// UPGRADE MODAL HANDLER
// ============================================================

let upgradeModalCallback = null;

/**
 * Register callback to show upgrade modal
 */
export const registerUpgradeModalHandler = (callback) => {
  upgradeModalCallback = callback;
  console.log('Upgrade modal handler registered');
};

/**
 * Show upgrade modal (triggers UI callback)
 */
export const showUpgradeModal = (upgradeInfo) => {
  console.log('Showing upgrade modal with info:', upgradeInfo);
  
  // Store upgrade info for later
  try {
    localStorage.setItem('pending_upgrade', JSON.stringify(upgradeInfo));
  } catch (e) {
    // Ignore storage errors
  }
  
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

// ============================================================
// PLAN NAME MAPPING AND HIERARCHY
// ============================================================

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

export const PLAN_HIERARCHY = {
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
  
  return normalized;
};

/**
 * Check if user can access a specific feature (with super admin bypass)
 */
export const canAccessFeature = (requiredPlan, userPlan = null) => {
  // SUPER ADMIN BYPASS - Always return true for super admin
  if (isSuperAdmin()) {
    return true;
  }
  
  const plan = userPlan ? normalizePlanName(userPlan) : getUserPlan();
  const userLevel = PLAN_HIERARCHY[plan] || 0;
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;
  
  return userLevel >= requiredLevel;
};

/**
 * Check if user has specific feature
 */
export const hasFeature = (featureName, userPlan = null) => {
  // SUPER ADMIN BYPASS
  if (isSuperAdmin()) {
    return true;
  }
  
  const plan = userPlan ? normalizePlanName(userPlan) : getUserPlan();
  const planConfig = PLANS[plan] || PLANS.free;
  return planConfig.features.includes(featureName);
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

// ============================================================
// PLAN AWARE API CALLS
// ============================================================

export const planAwareApiCall = async (endpoint, data = {}, options = {}) => {
  const { requiredPlan = null, featureCheck = null, usageLimitCheck = null } = options;
  
  // SUPER ADMIN BYPASS - Always allow for super admin
  if (isSuperAdmin()) {
    try {
      const response = await apiPost(endpoint, data);
      return response;
    } catch (error) {
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
    
    console.error('Plan check failed:', upgradeError);
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
    if (error.response?.data?.code === 'UPGRADE_REQUIRED') {
      error.isPlanError = true;
      error.upgradeUrl = getUpgradeUrl(error.response?.data?.requiredPlan);
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
    return await apiPost(endpoint, data);
  }
  
  try {
    // Check current usage
    const userPlan = getUserPlan();
    const limits = getUserLimits(userPlan);
    const limit = limits[`${usageType}_per_month`];
    
    if (limit !== 'Unlimited' && limit !== -1) {
      const currentUsage = 0;
      
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
    
    const result = await apiPost(endpoint, data);
    return result;
  } catch (error) {
    throw error;
  }
};

// ============================================================
// HEALTHCARE CONTEXT
// ============================================================

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

export const hasHospitalModuleAccess = () => {
  const context = getHealthcareContext();
  return context.hasHospitalModule;
};

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

// ============================================================
// UNIFIED ERROR HANDLER
// ============================================================

export class UnifiedAPIError extends Error {
  constructor(message, config = {}) {
    super(message);
    this.name = 'UnifiedAPIError';
    this.status = config.status || 500;
    this.code = config.code || 'UNKNOWN_ERROR';
    this.data = config.data || null;
    this.isNetworkError = config.isNetworkError || false;
    this.isTimeoutError = config.isTimeoutError || false;
    this.isPlanError = config.isPlanError || false;
    this.isUsageError = config.isUsageError || false;
    this.upgradeInfo = config.upgradeInfo || null;
    this.originalError = config.originalError || null;
    this.timestamp = new Date().toISOString();
    this.endpoint = config.endpoint || 'unknown';
    this.method = config.method || 'unknown';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      data: this.data,
      isNetworkError: this.isNetworkError,
      isTimeoutError: this.isTimeoutError,
      isPlanError: this.isPlanError,
      isUsageError: this.isUsageError,
      upgradeInfo: this.upgradeInfo,
      timestamp: this.timestamp,
      endpoint: this.endpoint,
      method: this.method
    };
  }
}

export const createAPIError = (error, config = {}) => {
  // If already a UnifiedAPIError, return it
  if (error instanceof UnifiedAPIError) {
    return error;
  }

  // Handle network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.code === 'TIMEOUT') {
      return new UnifiedAPIError(
        'Request timeout. Please try again.',
        {
          ...config,
          status: 408,
          code: 'TIMEOUT',
          isTimeoutError: true,
          originalError: error,
          endpoint: config.endpoint || error.config?.url,
          method: config.method || error.config?.method
        }
      );
    }
    return new UnifiedAPIError(
      'Network error. Please check your connection and try again.',
      {
        ...config,
        status: 0,
        code: 'NETWORK_ERROR',
        isNetworkError: true,
        originalError: error,
        endpoint: config.endpoint || error.config?.url,
        method: config.method || error.config?.method
      }
    );
  }

  const { status, data } = error.response;
  const endpoint = config.endpoint || error.config?.url || 'unknown';
  const method = config.method || error.config?.method || 'unknown';

  // Handle plan-related errors
  if (data?.code === 'UPGRADE_REQUIRED' || data?.code === 'FEATURE_LIMIT_EXCEEDED') {
    const upgradeInfo = {
      code: data.code,
      message: data.message || 'This feature requires a higher plan',
      userPlan: getUserPlan(),
      requiredPlan: data.requiredPlan || 'pro',
      endpoint,
      method
    };
    
    return new UnifiedAPIError(
      data.message || 'Plan upgrade required',
      {
        ...config,
        status,
        code: data.code,
        data,
        isPlanError: true,
        upgradeInfo,
        endpoint,
        method,
        originalError: error
      }
    );
  }

  // Handle usage limit errors
  if (data?.code?.includes('_LIMIT_EXCEEDED')) {
    return new UnifiedAPIError(
      data.message || 'Usage limit exceeded',
      {
        ...config,
        status,
        code: data.code,
        data,
        isUsageError: true,
        endpoint,
        method,
        originalError: error
      }
    );
  }

  // Handle authentication errors
  if (status === 401) {
    return new UnifiedAPIError(
      'Authentication required. Please login again.',
      {
        ...config,
        status,
        code: 'UNAUTHORIZED',
        data,
        endpoint,
        method,
        originalError: error
      }
    );
  }

  // Handle authorization errors
  if (status === 403) {
    return new UnifiedAPIError(
      data?.message || 'Access forbidden. Insufficient permissions.',
      {
        ...config,
        status,
        code: 'FORBIDDEN',
        data,
        endpoint,
        method,
        originalError: error
      }
    );
  }

  // Handle validation errors
  if (status === 422) {
    return new UnifiedAPIError(
      data?.message || 'Validation error',
      {
        ...config,
        status,
        code: 'VALIDATION_ERROR',
        data,
        endpoint,
        method,
        originalError: error
      }
    );
  }

  // Handle not found
  if (status === 404) {
    return new UnifiedAPIError(
      data?.message || 'Resource not found',
      {
        ...config,
        status,
        code: 'NOT_FOUND',
        data,
        endpoint,
        method,
        originalError: error
      }
    );
  }

  // Handle server errors
  if (status >= 500) {
    return new UnifiedAPIError(
      data?.message || 'Server error. Please try again later.',
      {
        ...config,
        status,
        code: 'SERVER_ERROR',
        data,
        endpoint,
        method,
        originalError: error
      }
    );
  }

  // Default error
  return new UnifiedAPIError(
    data?.message || error.message || 'An unexpected error occurred',
    {
      ...config,
      status,
      code: data?.code || 'UNKNOWN_ERROR',
      data,
      endpoint,
      method,
      originalError: error
    }
  );
};

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

let globalErrorHandler = null;

export const setGlobalErrorHandler = (handler) => {
  if (typeof handler === 'function') {
    globalErrorHandler = handler;
  }
};

export const handleAPIError = (error, context = {}) => {
  const unifiedError = error instanceof UnifiedAPIError ? error : createAPIError(error, context);
  
  console.error('[API Error]', {
    message: unifiedError.message,
    status: unifiedError.status,
    code: unifiedError.code,
    endpoint: unifiedError.endpoint,
    method: unifiedError.method,
    isPlanError: unifiedError.isPlanError,
    timestamp: unifiedError.timestamp
  });

  if (globalErrorHandler) {
    try {
      globalErrorHandler(unifiedError, context);
    } catch (handlerError) {
      console.error('Error in global error handler:', handlerError);
    }
  }

  return unifiedError;
};


  
  // Request interceptor - SINGLE INSTANCE
const setupInterceptors = () => {
  // Prevent duplicate registration
  if (interceptorsRegistered) {
    console.warn('Interceptors already registered, skipping duplicate registration');
    return;
  }

  // Request interceptor - WITH FIXED DUPLICATE HANDLING
  api.interceptors.request.use(
    (config) => {
      // Track duplicate requests (non-blocking)
      const requestKey = generateRequestKey(config);
      if (DEBUG_MODE) {
        trackRequest(requestKey);
      }
      
      // FIXED: Only cancel if the same request is pending AND it's been more than 500ms
      // This prevents cancelling legitimate requests that happen close together
      if (config.method?.toLowerCase() === 'get' && pendingRequests.has(requestKey)) {
        const pending = pendingRequests.get(requestKey);
        // Only cancel if the pending request is older than 500ms
        if (pending && pending.timestamp && (Date.now() - pending.timestamp > 500)) {
          if (typeof pending.cancel === 'function') {
            pending.cancel('Duplicate request cancelled');
            if (DEBUG_MODE) {
              console.log(`[API-DEBUG] Duplicate GET request cancelled: ${requestKey}`);
            }
          }
          pendingRequests.delete(requestKey);
        } else {
          // If the request is recent (< 500ms), DO NOT cancel it
          // Instead, let it proceed but mark it as a potential duplicate
          if (DEBUG_MODE) {
            console.log(`[API-DEBUG] Potential duplicate request (within 500ms): ${requestKey}`);
          }
          // Remove the old pending request and let the new one proceed
          if (pending && pending.timestamp) {
            // The old request is still pending, but we'll let the new one go through
            // and the old one will be cleaned up by the response interceptor
            pendingRequests.delete(requestKey);
          }
        }
      }

      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('jwtToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // ============================================
      // ADD HEALTHCARE HEADERS FOR HOSPITAL/MEDICAL REQUESTS
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
        
        config.headers['X-Healthcare-Facility'] = context.hospitalId || 'default';
        config.headers['X-User-Role'] = context.userRole || 'user';
        config.headers['X-HIPAA-Compliant'] = 'true';
        config.headers['X-Data-Sensitivity'] = 'high';
        config.headers['X-Healthcare-Version'] = '1.0';
        config.headers['X-Healthcare-Context'] = 'clinical';
      }
      
      // Store pending request for GET requests with timestamp
      if (config.method?.toLowerCase() === 'get') {
        const cancelToken = axios.CancelToken.source();
        config.cancelToken = cancelToken.token;
        pendingRequests.set(requestKey, {
          cancel: cancelToken.cancel,
          timestamp: Date.now()
        });
      }
      
      return config;
    },
    (error) => {
      // Check if it's a cancelled duplicate request
      if (axios.isCancel(error)) {
        // This is a cancelled duplicate, just return a resolved promise
        console.log('Request cancelled (duplicate), ignoring error');
        return Promise.resolve({ 
          data: { 
            success: true, 
            __cancelled: true,
            message: 'Duplicate request was cancelled' 
          } 
        });
      }
      
      console.error('Request interceptor error:', error);
      return Promise.reject(handleAPIError(error, { 
        endpoint: error.config?.url, 
        method: error.config?.method,
        isNetworkError: true 
      }));
    }
  );

  // Response interceptor - SINGLE INSTANCE
  api.interceptors.response.use(
    (response) => {
      // Remove from pending requests
      const requestKey = generateRequestKey(response.config);
      if (pendingRequests.has(requestKey)) {
        pendingRequests.delete(requestKey);
      }

      // Check if response is HTML instead of JSON (indicates a 404 or server error)
      if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
        console.warn('Received HTML response instead of JSON for:', response.config?.url);
        // Return empty data structure instead of failing
        return {
          ...response,
          data: {
            success: false,
            data: [],
            message: 'Endpoint returned HTML instead of JSON'
          }
        };
      }

      // Safe access with optional chaining
      const url = response?.config?.url || 'unknown';
      
      // Check if response contains super admin info
      if (response.data?.is_super_admin === true || response.data?.super_admin_access === true) {
        console.log('Super admin access confirmed in response');
        try {
          localStorage.setItem('is_super_admin', 'true');
          localStorage.setItem('user_plan', 'super_admin');
          cachedSuperAdminStatus = null;
          cachedSuperAdminTimestamp = 0;
        } catch (e) {
          // Ignore storage errors
        }
      }
      
      // Check for plan-related data in response
      if (response.data && response.data.plan) {
        if (response.data.normalized_plan_data || response.data.is_plan_standardized) {
          updateUserPlanData(response.data);
        }
      }
      
      return response;
    },
    (error) => {
      // Remove from pending requests
      if (error.config) {
        const requestKey = generateRequestKey(error.config);
        if (pendingRequests.has(requestKey)) {
          pendingRequests.delete(requestKey);
        }
      }

      // If it's a cancelled request, return a successful response instead of error
      if (axios.isCancel(error)) {
        console.log('Request was cancelled (duplicate), returning success response');
        return Promise.resolve({
          data: {
            success: true,
            __cancelled: true,
            message: 'Duplicate request was cancelled, but returning success'
          }
        });
      }

      // Safe: Use optional chaining with fallbacks for ALL accesses
      const url = error?.config?.url || 'unknown';
      const method = error?.config?.method?.toUpperCase() || 'UNKNOWN';
      const status = error?.response?.status;
      const errorCode = error?.response?.data?.code;
      const errorData = error?.response?.data;
      
      console.error(`API Error [${method} ${url}]:`, status, errorCode, errorData || error.message);
      
      // SUPER ADMIN BYPASS - Always allow for super admin
      if (isSuperAdmin()) {
        console.log('SUPER ADMIN: Bypassing plan/feature check for error:', errorCode);
        return Promise.resolve({
          data: {
            success: true,
            is_super_admin: true,
            message: 'Super admin access granted',
            data: errorData?.data || {}
          }
        });
      }
      
      // Handle Network Errors (no response)
      if (!error.response) {
        console.error('Network error - backend may be down or unreachable');
        return Promise.reject(new UnifiedAPIError(
          'Network error. Please check your connection and try again.',
          {
            isNetworkError: true,
            originalError: error,
            endpoint: url,
            method: method
          }
        ));
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
        
        try {
          localStorage.setItem('upgrade_info', JSON.stringify(upgradeInfo));
        } catch (e) {
          // Ignore storage errors
        }
        
        showUpgradeModal(upgradeInfo);
        
        const unifiedError = new UnifiedAPIError(
          upgradeInfo.message,
          {
            status: status,
            code: errorCode,
            data: errorData,
            isPlanError: true,
            upgradeInfo: upgradeInfo,
            endpoint: url,
            method: method,
            originalError: error
          }
        );
        
        return Promise.reject(unifiedError);
      }
      
      // Handle usage limit errors
      if (errorCode?.includes('_LIMIT_EXCEEDED')) {
        console.warn('Usage limit exceeded:', errorData);
        
        const limitInfo = errorData;
        if (limitInfo) {
          try {
            localStorage.setItem('limit_info', JSON.stringify(limitInfo));
          } catch (e) {
            // Ignore storage errors
          }
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
        
        const unifiedError = new UnifiedAPIError(
          limitInfo?.message || 'Usage limit exceeded',
          {
            status: status,
            code: errorCode,
            data: errorData,
            isUsageError: true,
            endpoint: url,
            method: method,
            originalError: error
          }
        );
        
        return Promise.reject(unifiedError);
      }
      
      // Handle different error cases
      if (status === 401) {
        // Unauthorized - clear tokens and redirect to login
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('user');
          cachedSuperAdminStatus = null;
          cachedSuperAdminTimestamp = 0;
        } catch (e) {
          // Ignore storage errors
        }
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else if (status === 403) {
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
      }
      
      // Create unified error
      const unifiedError = createAPIError(error, { endpoint: url, method: method });
      return Promise.reject(unifiedError);
    }
  );

  // Mark interceptors as registered
  interceptorsRegistered = true;
  console.log('API interceptors registered successfully');
};

// ============================================================
// Setup interceptors - This line MUST be at the bottom
// ============================================================
setupInterceptors()
// ============================================================
// UPDATE USER PLAN DATA
// ============================================================

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
      cachedSuperAdminStatus = null;
      cachedSuperAdminTimestamp = 0;
      console.log('Super admin status detected and stored');
    }
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
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

// ============================================================
// API HELPER FUNCTIONS
// ============================================================

// Helper function for making API calls with enhanced error handling
export const apiCall = async (method, endpoint, data = null, config = {}) => {
  try {
    const response = await api({
      method,
      url: endpoint,
      data,
      ...config
    });

    return response.data;
  } catch (error) {
    // If it's already a UnifiedAPIError, re-throw it
    if (error instanceof UnifiedAPIError) {
      throw error;
    }
    
    // Create unified error
    throw createAPIError(error, { endpoint, method });
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
      timeout: 60000,
      ...(onUploadProgress && { onUploadProgress }),
      ...(onDownloadProgress && { onDownloadProgress })
    };
    
    console.log(`Uploading file to: ${endpoint}`);
    const response = await api.post(endpoint, formData, config);
    console.log(`Upload successful: ${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Upload Error (${endpoint}):`, error);
    
    if (error.response?.status === 413) {
      throw new UnifiedAPIError('File too large. Please try a smaller file.', {
        status: 413,
        code: 'FILE_TOO_LARGE',
        endpoint,
        method: 'POST',
        originalError: error
      });
    } else if (error.response?.status === 415) {
      throw new UnifiedAPIError('File type not supported.', {
        status: 415,
        code: 'UNSUPPORTED_FILE_TYPE',
        endpoint,
        method: 'POST',
        originalError: error
      });
    } else if (error.code === 'TIMEOUT') {
      throw new UnifiedAPIError('Upload timeout. Please try again.', {
        status: 408,
        code: 'UPLOAD_TIMEOUT',
        endpoint,
        method: 'POST',
        originalError: error,
        isTimeoutError: true
      });
    } else if (error.response?.status === 422) {
      throw new UnifiedAPIError(
        error.response?.data?.error || 'Upload validation failed',
        {
          status: 422,
          code: 'VALIDATION_ERROR',
          data: error.response?.data,
          endpoint,
          method: 'POST',
          originalError: error
        }
      );
    }
    
    throw createAPIError(error, { endpoint, method: 'POST' });
  }
};

// File download helper
export const apiDownload = async (endpoint, filename, onDownloadProgress = null) => {
  try {
    console.log(`Downloading file from: ${endpoint}`);
    const response = await api.get(endpoint, {
      responseType: 'blob',
      ...(onDownloadProgress && { onDownloadProgress })
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    console.log(`Download completed: ${filename}`);
    return { success: true };
  } catch (error) {
    console.error(`Download Error (${endpoint}):`, error);
    throw createAPIError(error, { endpoint, method: 'GET' });
  }
};

// Batch request helper with error tolerance
export const apiBatch = async (requests, options = { continueOnError: false }) => {
  try {
    console.log(`Batch request with ${requests.length} operations`);
    const responses = await Promise.all(requests.map(req => 
      req.catch(error => {
        if (options.continueOnError) {
          return { 
            error: error.message, 
            status: 'failed',
            unifiedError: error instanceof UnifiedAPIError ? error : createAPIError(error)
          };
        }
        throw error;
      })
    ));
    
    const successCount = responses.filter(r => !r.error).length;
    console.log(`Batch completed: ${successCount}/${requests.length} successful`);
    
    return responses.map(response => 
      response.error ? response : response.data || response
    );
  } catch (error) {
    console.error('Batch Request Error:', error);
    throw createAPIError(error, { method: 'BATCH' });
  }
};

// Health check function
export const checkAPIHealth = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.HEALTH);
    console.log('API Health Check: Healthy');
    return {
      healthy: true,
      data: response.data
    };
  } catch (error) {
    console.error('API Health Check: Unhealthy', error.message);
    return {
      healthy: false,
      error: error.message
    };
  }
};

// Retry function for unreliable operations
export const apiRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Retry attempt ${attempt}/${maxRetries}`);
      const result = await operation();
      console.log(`Retry successful on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      
      if (error instanceof UnifiedAPIError) {
        if (error.isPlanError || error.status === 422 || error.status === 401 || error.status === 403) {
          throw error;
        }
      }
      
      if (attempt === maxRetries) {
        console.error(`All retry attempts failed after ${maxRetries} tries`);
        throw error;
      }
      
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
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
  
  if (isSuperAdmin()) {
    headers['X-Super-Admin'] = 'true';
  }
  
  return headers;
};

// ============================================================
// GET DEBUG INFO (Non-blocking)
// ============================================================

export const getDebugInfo = () => {
  return {
    pendingRequests: pendingRequests.size,
    duplicateRequests: DEBUG_MODE ? Array.from(requestMap.entries()) : 'Debug mode disabled',
    interceptorsRegistered: interceptorsRegistered,
    isSuperAdmin: isSuperAdmin(),
    isAuthenticated: isAuthenticated(),
    baseURL: api.defaults.baseURL
  };
};

// ============================================================
// API ENDPOINTS (All your existing endpoints)
// ============================================================

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
  
  // COMPREHENSIVE AI MEDICAL SERVICES
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
  
  // ==================== VIDEO ANALYSIS ENDPOINTS ====================
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
  
  // ==================== CAMERA MONITORING ENDPOINTS ====================
  MONITORING_START: '/api/monitoring/start',
  MONITORING_STOP: '/api/monitoring/stop',
  MONITORING_STATUS: '/api/monitoring/status',
  MONITORING_VIOLATIONS: '/api/monitoring/violations',
  CAMERAS_LIST: '/api/cameras/list',
  CAMERAS_UPDATE_STATUS: '/api/cameras/update-status',
  
  // ==================== ENVIRONMENTAL INTELLIGENCE ENDPOINTS ====================
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

// ============================================================
// COUNTRY PRICING CONFIGURATION
// ============================================================

export const COUNTRY_PRICING = {
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

// ============================================================
// PLANS CONFIGURATION
// ============================================================

export const PLANS = {
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


// ============================================================
// HOSPITAL MANAGEMENT SERVICE INTEGRATION
// ============================================================

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

// ============================================================
// MEDICAL AI SERVICE INTEGRATION
// ============================================================

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

// ============================================================
// ENVIRONMENTAL INTELLIGENCE SERVICE INTEGRATION
// ============================================================

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

// ============================================================
// HSE INDUSTRY SERVICE INTEGRATION (Full)
// ============================================================

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

// ============================================================
// CAMERA MONITORING SERVICE INTEGRATION
// ============================================================

export const cameraMonitoringAPI = {
  startCameraMonitoring: (monitoringConfig) => 
    apiPost(API_ENDPOINTS.MONITORING_START, monitoringConfig),
  stopCameraMonitoring: (monitorId) => 
    apiPost(API_ENDPOINTS.MONITORING_STOP, { monitorId }),
  getMonitoringStatus: (monitorId = null) => {
    const params = monitorId ? { monitorId } : {};
    return apiPost(API_ENDPOINTS.MONITORING_STATUS, params);
  },
  getLiveViolations: (monitorId, limit = 20) => 
    apiPost(API_ENDPOINTS.MONITORING_VIOLATIONS, { monitorId, limit }),
  getCameraFeeds: () => apiPost(API_ENDPOINTS.CAMERAS_LIST),
  updateCameraStatus: (cameraId, status) => 
    apiPost(API_ENDPOINTS.CAMERAS_UPDATE_STATUS, { cameraId, status }),
  getCameraHealth: (cameraId) => 
    apiPost('/api/cameras/health', { cameraId }),
  getMonitoringAnalytics: (timeRange = '24h') => 
    apiPost('/api/monitoring/analytics', { timeRange }),
  getRealTimeFeed: (monitorId) => {
    console.log(`Setting up real-time feed for monitor: ${monitorId}`);
    return {
      monitorId,
      connected: true,
      timestamp: new Date().toISOString()
    };
  }
};

// ============================================================
// VIDEO ANALYSIS SERVICE INTEGRATION
// ============================================================

export const videoAnalysisAPI = {
  analyzeVideo: (videoData, analysisConfig = {}) => {
    const formData = new FormData();
    formData.append('video', videoData);
    
    if (analysisConfig.analysis_config) {
      formData.append('analysis_config', JSON.stringify(analysisConfig.analysis_config));
    }
    
    return apiUpload(API_ENDPOINTS.VIDEO_ANALYZE, formData);
  },
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
  generateVideoAnalysisReport: (analysisId, format = 'pdf', reportType = null) => {
    const payload = {
      format,
      type: reportType || 'detailed'
    };
    return apiPost(API_ENDPOINTS.VIDEO_ANALYSIS_REPORT(analysisId), payload, {
      responseType: 'blob'
    });
  },
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

// ============================================================
// AI SERVICE INTEGRATION
// ============================================================

export const aiServiceAPI = {
  chatWithAI: (message, context = {}) => 
    apiPost(API_ENDPOINTS.AI_CHAT, { message, context }),
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
  genericAnalyze: (serviceType, inputData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE, { service_type: serviceType, input_data: inputData }),
  generateDocument: (template, data) => 
    apiPost(API_ENDPOINTS.AI_DOCUMENTS_GENERATE, { template, data }),
  getDocumentHistory: () => apiPost(API_ENDPOINTS.AI_DOCUMENTS_HISTORY),
  getAIInsights: () => apiPost(API_ENDPOINTS.AI_INSIGHTS),
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

// ============================================================
// NOTIFICATION SERVICE INTEGRATION
// ============================================================

export const notificationServiceAPI = {
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

// ============================================================
// PLAN MANAGEMENT API SERVICE
// ============================================================

export const planManagementAPI = {
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
  getAllPlanPricing: (country = null) => {
    const userCountry = country || getUserCountry();
    return apiGet('/plans/pricing', { 
      params: { country: userCountry } 
    });
  },
  getPlanFeatures: (planName = null) => {
    const plan = planName || getUserPlan();
    return apiGet('/plans/features', { 
      params: { plan } 
    });
  },
  checkUsageLimits: () => {
    return apiGet('/user/usage-limits');
  },
  upgradePlan: (newPlan, billingInfo = {}) => {
    return apiPost('/subscription/upgrade', {
      new_plan: newPlan,
      billing_info: billingInfo
    });
  },
  validateFeatureAccess: (featureName) => {
    return apiPost('/plans/validate-feature', {
      feature_name: featureName
    });
  },
  getAvailableFeatures: () => {
    return apiGet('/plans/available-features');
  },
  getInvoices: () => apiGet('/billing/invoices'),
  getBillingHistory: () => apiGet('/billing/history'),
  updateBillingInfo: (billingInfo) => 
    apiPost('/billing/update', billingInfo)
};

// ============================================================
// SAFETYPRO SERVICE API
// ============================================================

export const safetyProServiceAPI = {
  getDashboard: () => apiGet('/safetypro/dashboard'),
  getPendingApprovals: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/safetypro/pending?${params}`);
  },
  getApprovalStats: () => apiGet('/safetypro/stats'),
  approveUser: (userId, data = {}) => 
    apiPost(`/safetypro/approve/${userId}`, data),
  rejectUser: (userId, data = {}) => 
    apiPost(`/safetypro/reject/${userId}`, data),
  bulkAction: (userIds, action, data = {}) => 
    apiPost('/safetypro/bulk-action', {
      user_ids: userIds,
      action: action,
      ...data
    }),
  bulkOperation: (payload) => 
    apiPost('/safetypro/bulk-operation', payload),
  getUserDetails: (userId) => 
    apiGet(`/safetypro/user/${userId}`),
  upgradeUserPlan: (payload) => 
    apiPost('/safetypro/user/upgrade', payload),
  downgradeUserPlan: (userId) => 
    apiPost(`/safetypro/user/${userId}/downgrade`),
  suspendUser: (userId) => 
    apiPost(`/safetypro/user/${userId}/suspend`),
  activateUser: (userId) => 
    apiPost(`/safetypro/user/${userId}/activate`),
  blockUser: (userId) => 
    apiPost(`/safetypro/user/${userId}/block`),
  getSystemHealth: () => 
    apiGet('/admin/system/health'),
  notifyTeam: (message) => 
    apiPost('/safetypro/notify-team', { message }),
  getSafetyProDashboardData: () => 
    apiGet('/safetypro/dashboard-data'),
  getRecentActivity: (limit = 10) => 
    apiGet(`/safetypro/recent-activity?limit=${limit}`),
  getPlanDistribution: () => 
    apiGet('/safetypro/plan-distribution'),
  getUserGrowthMetrics: (period = 'month') => 
    apiGet(`/safetypro/user-growth?period=${period}`),
  getRevenueMetrics: (period = 'month') => 
    apiGet(`/safetypro/revenue?period=${period}`),
  getActivityLogs: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiGet(`/safetypro/activity-logs?${params}`);
  },
  getAnalytics: (timeRange = '30d') => 
    apiGet(`/safetypro/analytics?timeRange=${timeRange}`),
  generateReport: (reportConfig) => 
    apiPost('/safetypro/reports', reportConfig),
  massApproveVerified: () => 
    apiPost('/safetypro/mass-approve-verified'),
  sendFollowUpEmails: (userIds) => 
    apiPost('/safetypro/send-follow-ups', { userIds }),
  getTeamMembers: () => 
    apiGet('/safetypro/team-members'),
  getUserAnalytics: (userId) => 
    apiGet(`/safetypro/users/${userId}/analytics`),
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
  sendWelcomeEmail: (userId) => 
    apiPost(`/admin/users/${userId}/send-welcome`),
  sendApprovalNotification: (userId) => 
    apiPost(`/admin/users/${userId}/notify-approval`),
  sendRejectionNotification: (userId, reason) => 
    apiPost(`/admin/users/${userId}/notify-rejection`, { reason }),
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
  updateUserSubscription: (userId, subscriptionData) => 
    apiPut(`/admin/users/${userId}/subscription`, subscriptionData),
  cancelUserSubscription: (userId) => 
    apiPost(`/admin/users/${userId}/cancel-subscription`),
  getSubscriptionStats: () => 
    apiGet('/admin/subscriptions/stats'),
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
  getSystemSettings: () => 
    apiGet('/admin/settings'),
  updateSystemSettings: (settings) => 
    apiPut('/admin/settings', settings),
  getEmailTemplates: () => 
    apiGet('/admin/email-templates'),
  updateEmailTemplate: (templateName, templateData) => 
    apiPut(`/admin/email-templates/${templateName}`, templateData),
  searchUsers: (searchParams = {}) => {
    const params = new URLSearchParams(searchParams).toString();
    return apiGet(`/admin/users/search?${params}`);
  },
  getUserFilterOptions: () => 
    apiGet('/admin/users/filter-options'),
  mergeUsers: (userIds, mergeData = {}) => 
    apiPost('/admin/users/merge', {
      user_ids: userIds,
      ...mergeData
    }),
  deactivateUser: (userId, reason = '') => 
    apiPost(`/admin/users/${userId}/deactivate`, { reason }),
  reactivateUser: (userId) => 
    apiPost(`/admin/users/${userId}/reactivate`),
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
  downloadUserCSVTemplate: () => 
    apiGet('/admin/users/csv-template', { responseType: 'blob' }),
  validateCSVFile: (formData) => 
    apiUpload('/admin/users/validate-csv', formData),
  getBulkOperationStatus: (operationId) => 
    apiGet(`/admin/operations/${operationId}/status`),
  registerAdmin: (adminData) => 
    apiPost('/admin/register', adminData),
  setupSuperAdmin: (adminData, secretKey) => {
    const headers = {
      'X-Setup-Key': secretKey
    };
    return apiPost('/system/setup-super-admin', adminData, { headers });
  },
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
};

// ============================================================
// DOCUMENT SERVICE API
// ============================================================

export const documentServiceAPI = {
  getDocuments: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.BASE}?${params.toString()}`);
  },
  getDocument: (id) => apiGet(API_ENDPOINTS.DOCUMENTS.GET(id)),
  createDocument: (formData) => {
    return apiUpload(API_ENDPOINTS.DOCUMENTS.CREATE, formData);
  },
  updateDocument: (id, data) => apiPut(API_ENDPOINTS.DOCUMENTS.UPDATE(id), data),
  deleteDocument: (id) => apiDelete(API_ENDPOINTS.DOCUMENTS.DELETE(id)),
  restoreDocument: (id) => apiPost(API_ENDPOINTS.DOCUMENTS.RESTORE(id)),
  searchDocuments: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.SEARCH}?${params.toString()}`);
  },
  globalSearch: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.GLOBAL_SEARCH}?${params.toString()}`);
  },
  getVersions: (documentId) => apiGet(API_ENDPOINTS.DOCUMENTS.VERSIONS(documentId)),
  createVersion: (documentId, formData) => {
    return apiUpload(API_ENDPOINTS.DOCUMENTS.CREATE_VERSION(documentId), formData);
  },
  rollbackVersion: (documentId, versionNumber) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.ROLLBACK(documentId), { version: versionNumber }),
  submitForReview: (id, reviewerId = null) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SUBMIT(id), { reviewer_id: reviewerId }),
  reviewDocument: (id, data) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.REVIEW(id), data),
  approveDocument: (id, comment = '') => 
    apiPost(API_ENDPOINTS.DOCUMENTS.APPROVE(id), { comment }),
  rejectDocument: (id, reason = '') => 
    apiPost(API_ENDPOINTS.DOCUMENTS.REJECT(id), { reason }),
  publishDocument: (id) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.PUBLISH(id)),
  archiveDocument: (id, reason = '') => 
    apiPost(API_ENDPOINTS.DOCUMENTS.ARCHIVE(id), { reason }),
  getReviewDocuments: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.REVIEW_DOCUMENTS}?${params.toString()}`);
  },
  getReviewHistory: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.REVIEW_HISTORY(documentId)),
  getDocumentReviewDetail: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.REVIEW_DETAIL(documentId)),
  updateReviewDate: (documentId, reviewDate, frequency, notes = '') => 
    apiPut(API_ENDPOINTS.DOCUMENTS.UPDATE_REVIEW_DATE(documentId), {
      review_date: reviewDate,
      review_frequency: frequency,
      notes: notes
    }),
  completeReview: (documentId, notes = '') => 
    apiPost(API_ENDPOINTS.DOCUMENTS.COMPLETE_REVIEW(documentId), { notes }),
  sendReviewReminders: (documentIds) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SEND_REMINDERS, { document_ids: documentIds }),
  bulkUpdateReviewStatus: (documentIds, status) => 
    apiPut(API_ENDPOINTS.DOCUMENTS.BULK_REVIEW_STATUS, { document_ids: documentIds, status }),
  getExpiringDocuments: (days = 30, filters = {}) => {
    const params = new URLSearchParams({ days, ...filters });
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.EXPIRING}?${params.toString()}`);
  },
  getOverdueDocuments: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.OVERDUE}?${params.toString()}`);
  },
  getAuditLogs: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.AUDIT}?${params.toString()}`);
  },
  exportAuditLogs: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.AUDIT_EXPORT}?${params.toString()}`, {
      responseType: 'blob'
    });
  },
  checkDocumentCompliance: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.COMPLIANCE(documentId)),
  getDocumentLinks: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.LINKS}?${params.toString()}`);
  },
  getAvailableLinkItems: (type, filters = {}) => {
    const params = new URLSearchParams({ type, ...filters });
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.LINKS_AVAILABLE}?${params.toString()}`);
  },
  createDocumentLink: (data) => apiPost(API_ENDPOINTS.DOCUMENTS.LINK_CREATE, data),
  removeDocumentLink: (linkId) => apiDelete(API_ENDPOINTS.DOCUMENTS.LINK_REMOVE(linkId)),
  bulkRemoveLinks: (linkIds) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.LINKS_BULK_REMOVE, { ids: linkIds }),
  bulkUpdateStatus: (ids, status) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_STATUS, { ids, status }),
  bulkDelete: (ids) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_DELETE, { ids }),
  bulkAssignTags: (ids, tags) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_TAGS, { ids, tags }),
  bulkArchive: (ids) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_ARCHIVE, { ids }),
  bulkPublish: (ids) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_PUBLISH, { ids }),
  bulkMarkReviewed: (ids) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_MARK_REVIEWED, { ids }),
  bulkUpload: (formData) => {
    return apiUpload(API_ENDPOINTS.DOCUMENTS.BULK_UPLOAD, formData);
  },
  importDocuments: (formData) => {
    return apiUpload(API_ENDPOINTS.DOCUMENTS.IMPORT, formData);
  },
  exportDocuments: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.EXPORT}?${params.toString()}`, {
      responseType: 'blob'
    });
  },
  exportToCSV: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.EXPORT_CSV}?${params.toString()}`, {
      responseType: 'blob'
    });
  },
  exportToPDF: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.EXPORT_PDF}?${params.toString()}`, {
      responseType: 'blob'
    });
  },
  autoSaveDocument: (documentId, data) => 
    apiPut(API_ENDPOINTS.DOCUMENTS.AUTOSAVE(documentId), data),
  uploadImage: (formData) => {
    return apiUpload(API_ENDPOINTS.DOCUMENTS.UPLOAD_IMAGE, formData);
  },
  getDocumentContent: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.CONTENT(documentId)),
  getDocumentSignatures: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SIGNATURES(documentId)),
  createSignature: (data) => apiPost(API_ENDPOINTS.DOCUMENTS.SIGNATURE_CREATE, data),
  verifySignature: (signatureId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SIGNATURE_VERIFY(signatureId)),
  revokeSignature: (signatureId, data) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SIGNATURE_REVOKE(signatureId), data),
  getSignatureHistory: (signatureId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SIGNATURE_HISTORY(signatureId)),
  downloadSignatureCertificate: (signatureId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SIGNATURE_CERTIFICATE(signatureId), {
      responseType: 'blob'
    }),
  saveSearch: (name, filters) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SAVED_SEARCHES, { name, filters }),
  getSavedSearches: () => apiGet(API_ENDPOINTS.DOCUMENTS.SAVED_SEARCHES),
  deleteSavedSearch: (searchId) => 
    apiDelete(API_ENDPOINTS.DOCUMENTS.SAVED_SEARCH_DELETE(searchId)),
  getSearchHistory: () => apiGet(API_ENDPOINTS.DOCUMENTS.SEARCH_HISTORY),
  addSearchHistory: (term) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SEARCH_HISTORY, { term }),
  clearSearchHistory: () => 
    apiDelete(API_ENDPOINTS.DOCUMENTS.SEARCH_HISTORY_CLEAR),
  getStats: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.STATS}?${params.toString()}`);
  },
  getModuleStats: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.MODULE_STATS}?${params.toString()}`);
  },
  getDocumentAnalytics: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.ANALYTICS}?${params.toString()}`);
  },
  getReviewAnalytics: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.REVIEW_ANALYTICS}?${params.toString()}`);
  },
  getComplianceAnalytics: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.COMPLIANCE_ANALYTICS}?${params.toString()}`);
  },
  getRecentDocuments: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.RECENT}?${params.toString()}`);
  },
  getPendingTasks: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`${API_ENDPOINTS.DOCUMENTS.PENDING_TASKS}?${params.toString()}`);
  },
  downloadDocument: (id) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id), { responseType: 'blob' }),
  getPreviewUrl: (id) => apiGet(API_ENDPOINTS.DOCUMENTS.PREVIEW(id)),
  bulkDownloadDocuments: (ids) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.BULK_DOWNLOAD, { ids }, { responseType: 'blob' }),
  analyzeDocument: (documentId) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.ANALYZE_AI(documentId)),
  suggestTags: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SUGGEST_TAGS(documentId)),
  extractKeyInfo: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.EXTRACT_INFO(documentId)),
  checkCompliance: (documentId) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.CHECK_COMPLIANCE(documentId)),
  shareDocument: (documentId, data) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.SHARE(documentId), data),
  getSharingSettings: (documentId) => 
    apiGet(API_ENDPOINTS.DOCUMENTS.SHARING_SETTINGS(documentId)),
  removeShare: (documentId, userId) => 
    apiDelete(API_ENDPOINTS.DOCUMENTS.REMOVE_SHARE(documentId, userId)),
  extendExpiry: (documentId, newExpiryDate) => 
    apiPost(API_ENDPOINTS.DOCUMENTS.EXTEND_EXPIRY(documentId), { new_expiry_date: newExpiryDate }),
};

// ============================================================
// DOCUMENT PLAN REQUIREMENTS
// ============================================================

export const DOCUMENT_PLAN_REQUIREMENTS = {
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
  defaultPlan: 'basic'
};

export const DOCUMENT_FEATURES = {
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

export const canAccessDocumentFeature = (feature) => {
  if (isSuperAdmin()) {
    console.log(`SUPER ADMIN: Document feature ${feature} granted`);
    return true;
  }
  
  const requiredPlan = DOCUMENT_PLAN_REQUIREMENTS.features[feature] || DOCUMENT_PLAN_REQUIREMENTS.defaultPlan;
  const userPlan = getUserPlan();
  const userLevel = PLAN_HIERARCHY[userPlan] || 0;
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0;
  
  const hasAccess = userLevel >= requiredLevel;
  
  console.log(`Document Feature Access: ${feature}`);
  console.log(`   User Plan: ${userPlan} (Level: ${userLevel})`);
  console.log(`   Required Plan: ${requiredPlan} (Level: ${requiredLevel})`);
  console.log(`   Has Access: ${hasAccess ? 'Yes' : 'No'}`);
  
  return hasAccess;
};

export const getDocumentLimits = () => {
  if (isSuperAdmin()) {
    return DOCUMENT_FEATURES.super_admin.document_limits;
  }
  
  const userPlan = getUserPlan();
  const planLimits = DOCUMENT_FEATURES[userPlan] || DOCUMENT_FEATURES.free;
  return planLimits.document_limits;
};

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

export const getMaxDocuments = () => {
  if (isSuperAdmin()) return 'Unlimited';
  const limits = getDocumentLimits();
  return limits.max_documents;
};

export const getMaxFileSizeMB = () => {
  if (isSuperAdmin()) return 'Unlimited';
  const limits = getDocumentLimits();
  return limits.max_file_size_mb;
};

export const documentApiCall = async (feature, endpoint, data = {}, options = {}) => {
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
    
    console.error('Document feature access denied:', upgradeError);
    showUpgradeModal(upgradeError);
    throw upgradeError;
  }
  
  try {
    const response = await apiCall(endpoint.method || 'GET', endpoint.url, data, options);
    return response;
  } catch (error) {
    if (error.isPlanError) {
      showUpgradeModal(error);
    }
    throw error;
  }
};

// ============================================================
// SERVICE APIS EXPORT
// ============================================================

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
  document: documentServiceAPI,
};

// ============================================================
// PLAN UTILITIES EXPORT
// ============================================================

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

// ============================================================
// INITIALIZATION
// ============================================================

const initializePlanSystem = () => {
  console.log('Initializing Plan Normalization System');
  
  if (isSuperAdmin()) {
    console.log('Super admin detected on initialization');
    try {
      localStorage.setItem('is_super_admin', 'true');
      localStorage.setItem('user_plan', 'super_admin');
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && (user.plan || user.subscription_plan || user.is_super_admin)) {
      const normalizedUser = updateUserPlanData(user);
      console.log('User plan data normalized:', normalizedUser?.effective_plan);
    }
  } catch (error) {
    console.error('Error initializing plan system:', error);
  }
  
  return true;
};

// Run initialization
initializePlanSystem();

// ============================================================
// EXPORT API INSTANCE AS DEFAULT
// ============================================================

export default api;