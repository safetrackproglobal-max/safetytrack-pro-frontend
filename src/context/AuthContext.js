// src/context/AuthContext.js - FIXED FOR REFRESH
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api, { planUtils } from '../services/api';
import { message } from 'antd';
import i18n from '../i18n';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // ==================== STATE DECLARATIONS ====================
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState(null);
  
  const initializedRef = useRef(false);

  // ==================== HELPER FUNCTIONS ====================
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await api(endpoint, options);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // ==================== PLAN NORMALIZATION ====================
  const normalizeUserPlan = (userData) => {
    if (!userData) return null;
    
    try {
      const normalizedPlan = planUtils.normalizePlanName(
        userData.plan || userData.subscription_plan || userData.effective_plan || 'free'
      );
      
      const planConfig = planUtils.PLANS?.[normalizedPlan] || planUtils.PLANS?.free;
      const countryPricing = planUtils.COUNTRY_PRICING?.[userData.country] || planUtils.COUNTRY_PRICING?.default;
      const pricing = countryPricing?.[normalizedPlan] || {};
      
      let planFeatures = {};
      if (planConfig?.features && Array.isArray(planConfig.features)) {
        planConfig.features.forEach(feature => {
          if (typeof feature === 'string') {
            planFeatures[feature] = true;
          }
        });
      }
      
      let planLimits = {};
      if (planConfig?.limits && typeof planConfig.limits === 'object') {
        planLimits = { ...planConfig.limits };
      }
      
      const planHierarchy = planUtils.PLAN_HIERARCHY || {
        'free': 0,
        'basic': 1,
        'pro': 2,
        'enterprise': 3,
        'super_admin': 999
      };
      
      const planLevel = planHierarchy[normalizedPlan] || 0;
      
      const normalizedUser = {
        ...userData,
        plan: normalizedPlan,
        effective_plan: normalizedPlan,
        original_plan: userData.plan || userData.subscription_plan,
        is_plan_standardized: true,
        plan_level: planLevel,
        plan_features: planFeatures,
        plan_limits: planLimits,
        plan_label: planConfig?.label || normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1),
        plan_currency: pricing?.currency || 'USD',
        plan_pricing: pricing
      };
      
      return normalizedUser;
    } catch (error) {
      console.error('❌ Error normalizing user plan:', error);
      return userData;
    }
  };

  const getPlanDataFromUser = (normalizedUser) => {
    if (!normalizedUser) return null;
    
    try {
      return {
        plan: normalizedUser.plan,
        originalPlan: normalizedUser.original_plan,
        level: normalizedUser.plan_level,
        label: normalizedUser.plan_label,
        features: normalizedUser.plan_features || {},
        limits: normalizedUser.plan_limits || {},
        country: normalizedUser.country,
        currency: normalizedUser.plan_currency,
        pricing: normalizedUser.plan_pricing,
        isStandardized: normalizedUser.is_plan_standardized || false
      };
    } catch (error) {
      console.error('❌ Error extracting plan data:', error);
      return null;
    }
  };

  // ==================== ROLE CHECK FUNCTIONS ====================
  const isSuperAdmin = () => {
    if (!user) return false;
    if (user.email === 'abigalisticstudious@gmail.com') return true;
    if (user.is_super_admin === true) return true;
    if (user.user_type === 'super_admin') return true;
    if (user.user_type === 'platform_owner') return true;
    if (user.user_type === 'system') return true;
    if (user.user_type === 'safetypro') return true;
    if (user.role === 'super_admin') return true;
    if (localStorage.getItem('is_super_admin') === 'true') return true;
    if (localStorage.getItem('user_plan') === 'super_admin') return true;
    return false;
  };

  const isRegularAdmin = () => {
    if (!user) return false;
    return user.user_type === 'admin' && !isSuperAdmin();
  };

  const isAnyAdmin = () => {
    return isSuperAdmin() || isRegularAdmin();
  };

  const isEmployee = () => {
    if (!user) return false;
    return user.user_type === 'employee';
  };

  const isRegularUser = () => {
    if (!user) return false;
    return user.user_type === 'user';
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (role === 'super_admin') return isSuperAdmin();
    if (role === 'admin') return isRegularAdmin();
    if (role === 'any_admin') return isAnyAdmin();
    if (role === 'employee') return isEmployee();
    if (role === 'user') return isRegularUser();
    return user.user_type === role;
  };

  // ==================== NAVIGATION HELPERS ====================
  const getDashboardPath = () => {
    if (!user) return '/login';
    
    if (isSuperAdmin()) {
      return '/super-admin/dashboard';
    } else if (isRegularAdmin()) {
      return '/admin/dashboard';
    } else if (isEmployee()) {
      return '/employee/dashboard';
    } else {
      return '/user/dashboard';
    }
  };

  const getDashboardComponent = () => {
    if (isSuperAdmin()) return 'SuperAdminDashboard';
    if (isRegularAdmin()) return 'AdminDashboard';
    if (isEmployee()) return 'EmployeeDashboard';
    return 'UserDashboard';
  };

  // ==================== PLAN CHECK FUNCTIONS ====================
  const canAccess = (requiredPlan) => {
    if (!user || !user.plan) return false;
    const plans = ['free', 'basic', 'pro', 'enterprise'];
    const userPlanIndex = plans.indexOf(user.plan);
    const requiredPlanIndex = plans.indexOf(requiredPlan);
    return userPlanIndex >= requiredPlanIndex;
  };

  const canAccessFeature = (requiredPlan) => {
    if (!user || !user.plan) return false;
    return planUtils.canAccessFeature(requiredPlan, user.plan);
  };

  const hasFeature = (featureName) => {
    if (!user || !user.plan) return false;
    return planUtils.hasFeature(featureName, user.plan);
  };

  const getUserLimits = () => {
    if (!user || !user.plan) return {};
    return planUtils.getUserLimits(user.plan);
  };

  const checkUsageLimit = (limitType, usedAmount = 0) => {
    if (!user || !user.plan) return { withinLimit: false, remaining: 0 };
    return planUtils.checkUsageLimit(limitType, usedAmount, user.plan);
  };

  const getPlanPricing = () => {
    if (!user) return null;
    return planUtils.getPlanPricing(user.plan, user.country);
  };

  const getCurrentPlanData = () => {
    if (!user) return null;
    return planUtils.getNormalizedPlanData(user.plan, user.country);
  };

  const validateServiceAccess = (serviceName, options = {}) => {
    if (!user || !user.plan) return { valid: false, reason: 'Not authenticated' };
    return planUtils.planValidationService.validateServiceAccess(serviceName, { 
      ...options,
      userPlan: user.plan 
    });
  };

 // In AuthContext.js - login function
// ==================== LOGIN FUNCTION - FIXED ====================
const login = async (credentials, rememberMe = false) => {
  setLoading(true);
  
  try {
    const { email, password, user_type } = credentials;
    const endpoint = user_type === 'admin' ? '/admin/login' : '/auth/login';
    
    const res = await apiCall(endpoint, {
      method: 'POST',
      data: { email, password, user_type }
    });

    const receivedToken = res.token || res.access_token;
    
    if (receivedToken && res.user) {
      const cleanToken = receivedToken.replace(/['"]/g, '').trim();
      
      setToken(cleanToken);
      
      const normalizedUser = normalizeUserPlan(res.user);
      setUser(normalizedUser);
      setPlanData(getPlanDataFromUser(normalizedUser));
      
      // ✅ Store token in ALL possible locations
      localStorage.setItem('authToken', cleanToken);
      localStorage.setItem('token', cleanToken);
      localStorage.setItem('jwtToken', cleanToken);
      localStorage.setItem('access_token', cleanToken);
      
      // ✅ Store stage information
      const stage = res.stage || 'complete';
      localStorage.setItem('userStage', stage);
      localStorage.setItem('redirect_to', res.redirect_to || '/dashboard');
      localStorage.setItem('requires_payment', res.requires_payment ? 'true' : 'false');
      localStorage.setItem('requires_plan_selection', res.requires_plan_selection ? 'true' : 'false');
      localStorage.setItem('requires_approval', res.needs_approval ? 'true' : 'false');
      localStorage.setItem('requires_company_setup', res.requires_company_setup ? 'true' : 'false');
      
      // Store user with token and stage
      normalizedUser.token = cleanToken;
      normalizedUser.stage = stage;
      normalizedUser.redirect_to = res.redirect_to || '/dashboard';
      normalizedUser.requires_payment = res.requires_payment || false;
      normalizedUser.requires_plan_selection = res.requires_plan_selection || false;
      normalizedUser.needs_approval = res.needs_approval || false;
      normalizedUser.requires_company_setup = res.requires_company_setup || false;
      normalizedUser.payment_status = res.payment_status || 'completed';
      normalizedUser.dashboard_config = res.dashboard_config || null;
      
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      // Set remember me
      localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
      
      // ✅ Set token in axios defaults immediately
      api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
      
      // Also store in sessionStorage for redundancy
      sessionStorage.setItem('authToken', cleanToken);
      sessionStorage.setItem('token', cleanToken);
      sessionStorage.setItem('user', JSON.stringify(normalizedUser));
      sessionStorage.setItem('userStage', stage);
      
      const userLanguage = normalizedUser.preferred_language || 'en';
      localStorage.setItem('preferredLanguage', userLanguage);
      
      try {
        await i18n.changeLanguage(userLanguage);
      } catch (languageError) {
        console.error('Failed to change language:', languageError);
      }
      
      // ✅ Set token expiry (7 days from now)
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 7);
      localStorage.setItem('token_expiry', tokenExpiry.toISOString());
      
      // ✅ Return ALL necessary data including stage
      return { 
        success: true, 
        user: normalizedUser, 
        planData: getPlanDataFromUser(normalizedUser),
        // ✅ CRITICAL: Return stage and redirect info
        stage: stage,
        redirect_to: res.redirect_to || '/dashboard',
        requires_payment: res.requires_payment || false,
        requires_plan_selection: res.requires_plan_selection || false,
        needs_approval: res.needs_approval || false,
        requires_company_setup: res.requires_company_setup || false,
        payment_status: res.payment_status || 'completed',
        dashboard_config: res.dashboard_config || null,
        message: res.message || 'Login successful'
      };
    } else {
      return { 
        success: false, 
        error: res.error || 'Login failed - no token or user data received',
        needsVerification: res.requires_verification || false,
        message: res.message
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Login failed';
    message.error(errorMessage);
    return { 
      success: false, 
      error: errorMessage,
      needsVerification: error.response?.data?.requires_verification || false
    };
  } finally {
    setLoading(false);
  }
};

  const signup = async (userData) => {
    setLoading(true);
    
    try {
      const preferredLanguage = userData.preferred_language || userData.preferredLanguage || 'en';
      
      const res = await apiCall('/auth/register', {
        method: 'POST',
        data: userData
      });

      const receivedToken = res.token || res.access_token;
      
      if (receivedToken && res.user) {
        setToken(receivedToken);
        
        const normalizedUser = normalizeUserPlan(res.user);
        setUser(normalizedUser);
        setPlanData(getPlanDataFromUser(normalizedUser));
        
        localStorage.setItem('authToken', receivedToken);
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('preferredLanguage', preferredLanguage);
        
        try {
          await i18n.changeLanguage(preferredLanguage);
        } catch (languageError) {
          console.error('Failed to apply language after signup:', languageError);
        }
        
        message.success('Account created successfully!');
        return { success: true, user: normalizedUser, planData: getPlanDataFromUser(normalizedUser) };
      } else if (res.message) {
        localStorage.setItem('preferredLanguage', preferredLanguage);
        await i18n.changeLanguage(preferredLanguage);
        
        message.success(res.message || 'Account created! Please check your email for verification.');
        return { success: true, needsVerification: true };
      } else {
        return { success: false, error: res.error || 'Signup failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Signup failed';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
    
    setUser(null);
    setToken(null);
    setPlanData(null);
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user_plan');
    localStorage.removeItem('is_super_admin');
    localStorage.removeItem('rememberMe');
    
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    if (currentLanguage) {
      localStorage.setItem('preferredLanguage', currentLanguage);
    }
    
    delete api.defaults.headers.common['Authorization'];
    
    message.success('Logged out successfully');
    
    // Redirect to home page on logout
    window.location.href = '/';
  };

  const refreshUser = async () => {
    try {
      const currentToken = token || localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (currentToken) {
        const profile = await apiCall('/user/profile', {
          method: 'GET'
        });
        
        if (profile && (profile.profile || profile.user)) {
          const userData = profile.profile || profile.user;
          const normalizedUser = normalizeUserPlan(userData);
          setUser(normalizedUser);
          setPlanData(getPlanDataFromUser(normalizedUser));
          
          const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
          storage.setItem('user', JSON.stringify(normalizedUser));
          
          const userLanguage = normalizedUser.preferred_language || 'en';
          if (userLanguage !== i18n.language) {
            await i18n.changeLanguage(userLanguage);
            localStorage.setItem('preferredLanguage', userLanguage);
          }
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      if (error.response?.status === 401) {
        // Token expired, logout
        logout();
      }
    }
  };

  // ==================== PASSWORD MANAGEMENT ====================
  const forgotPassword = async (email) => {
    try {
      const res = await apiCall('/auth/forgot-password', {
        method: 'POST',
        data: { email }
      });

      if (res.success || res.message) {
        message.success('Password reset instructions sent to your email');
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Failed to send reset instructions' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Password reset failed';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      const res = await apiCall('/auth/reset-password', {
        method: 'POST',
        data: { token: resetToken, new_password: newPassword }
      });

      if (res.success || res.message) {
        message.success('Password reset successfully');
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Failed to reset password' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Password reset failed';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ==================== EMAIL VERIFICATION ====================
  const verifyEmail = async (email, code) => {
    try {
      const res = await apiCall('/auth/verify', {
        method: 'POST',
        data: { email, code }
      });

      if (res.success || res.message) {
        message.success('Email verified successfully');
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Email verification failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Email verification failed';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resendVerification = async (email) => {
    try {
      const res = await apiCall('/auth/resend-verification', {
        method: 'POST',
        data: { email }
      });

      if (res.success || res.message) {
        message.success('Verification email sent');
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Failed to send verification' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send verification';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ==================== PROFILE MANAGEMENT ====================
  const updateProfile = async (profileData) => {
    setLoading(true);
    
    try {
      const res = await apiCall('/user/profile', {
        method: 'PUT',
        data: profileData
      });
      
      if (res.success && res.profile) {
        const normalizedUser = normalizeUserPlan(res.profile);
        setUser(normalizedUser);
        setPlanData(getPlanDataFromUser(normalizedUser));
        
        const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(normalizedUser));
        
        if (normalizedUser.preferred_language && normalizedUser.preferred_language !== i18n.language) {
          await i18n.changeLanguage(normalizedUser.preferred_language);
          localStorage.setItem('preferredLanguage', normalizedUser.preferred_language);
        }
        
        message.success('Profile updated successfully');
        return { success: true, user: normalizedUser, planData: getPlanDataFromUser(normalizedUser) };
      } else if (res.user) {
        const normalizedUser = normalizeUserPlan(res.user);
        setUser(normalizedUser);
        setPlanData(getPlanDataFromUser(normalizedUser));
        
        const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(normalizedUser));
        
        message.success('Profile updated successfully');
        return { success: true, user: normalizedUser };
      } else if (res.message) {
        message.success(res.message);
        await refreshUser();
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Profile update failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Profile update failed';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // ==================== LANGUAGE MANAGEMENT ====================
  const updateUserLanguage = async (newLanguage) => {
    try {
      await i18n.changeLanguage(newLanguage);
      localStorage.setItem('preferredLanguage', newLanguage);
      
      if (user) {
        const updatedUser = { ...user, preferred_language: newLanguage };
        setUser(updatedUser);
        
        const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(updatedUser));
      }
      
      if (token) {
        try {
          await apiCall('/user/update-language', {
            method: 'POST',
            data: { language: newLanguage }
          });
        } catch (serverError) {
          console.warn('Failed to update language on server:', serverError);
        }
      }
      
      message.success('Language preference updated');
      return true;
    } catch (error) {
      console.error('Language update error:', error);
      message.error('Failed to update language');
      return false;
    }
  };

  // ==================== DEBUG UTILITIES ====================
  const debugAuth = () => {
    const localStorageData = {
      authToken: localStorage.getItem('authToken') ? 'PRESENT' : 'MISSING',
      token: localStorage.getItem('token') ? 'PRESENT' : 'MISSING',
      user: localStorage.getItem('user') ? 'PRESENT' : 'MISSING',
      rememberMe: localStorage.getItem('rememberMe'),
      userPlan: localStorage.getItem('user_plan'),
      isSuperAdmin: localStorage.getItem('is_super_admin')
    };
    
    const sessionStorageData = {
      authToken: sessionStorage.getItem('authToken') ? 'PRESENT' : 'MISSING',
      token: sessionStorage.getItem('token') ? 'PRESENT' : 'MISSING',
      user: sessionStorage.getItem('user') ? 'PRESENT' : 'MISSING'
    };
    
    console.log('🔐 AUTH DEBUG:', {
      localStorage: localStorageData,
      sessionStorage: sessionStorageData,
      state: {
        token: token ? 'SET' : 'NOT SET',
        user: user ? `SET (${user.email})` : 'NOT SET',
        planData: planData ? 'SET' : 'NOT SET',
        loading
      }
    });
    
    return {
      localStorage: localStorageData,
      sessionStorage: sessionStorageData,
      state: { user, token, planData, loading }
    };
  };

  // ==================== INITIALIZATION EFFECT ====================
useEffect(() => {
  // Prevent double initialization
  if (initializedRef.current) {
    return;
  }
  
  initializedRef.current = true;
  
  const initializeAuth = async () => {
    try {
      // Check for saved auth data - ONLY from localStorage (persistent)
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      
      // Only restore session if rememberMe is true AND we have valid data
      if (rememberMe && savedToken && savedUser) {
        setToken(savedToken);
        
        try {
          const userData = JSON.parse(savedUser);
          const normalizedUser = normalizeUserPlan(userData);
          
          // ✅ Restore stage from localStorage
          const savedStage = localStorage.getItem('userStage') || 'complete';
          if (savedStage) {
            normalizedUser.stage = savedStage;
            normalizedUser.redirect_to = localStorage.getItem('redirect_to') || '/dashboard';
            normalizedUser.requires_payment = localStorage.getItem('requires_payment') === 'true';
            normalizedUser.requires_plan_selection = localStorage.getItem('requires_plan_selection') === 'true';
            normalizedUser.needs_approval = localStorage.getItem('requires_approval') === 'true';
            normalizedUser.requires_company_setup = localStorage.getItem('requires_company_setup') === 'true';
          }
          
          setUser(normalizedUser);
          setPlanData(getPlanDataFromUser(normalizedUser));
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        } catch (parseError) {
          // Invalid data, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('userStage');
          localStorage.removeItem('redirect_to');
        }
      } else {
        // Clear any existing data to ensure clean state
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user_plan');
        localStorage.removeItem('is_super_admin');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userStage');
        localStorage.removeItem('redirect_to');
        localStorage.removeItem('requires_payment');
        localStorage.removeItem('requires_plan_selection');
        localStorage.removeItem('requires_approval');
        localStorage.removeItem('requires_company_setup');
        
        // Clear sessionStorage on refresh
        sessionStorage.clear();
        
        // Ensure logged out state
        setUser(null);
        setToken(null);
        setPlanData(null);
        delete api.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  initializeAuth();
}, []);

  // ==================== CONTEXT VALUE ====================
  const value = {
    // State
    user,
    token,
    loading,
    planData,
    isAuthenticated: !!user && !!token,
    
    // Auth functions
    login,
    signup,
    logout,
    refreshUser,
    debugAuth,
    
    // Profile & Language
    updateProfile,
    updateUserLanguage,
    
    // Password & Verification
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    
    // Role checks
    isSuperAdmin,
    isRegularAdmin,
    isAnyAdmin,
    isEmployee,
    isRegularUser,
    hasRole,
    getDashboardPath,
    getDashboardComponent,
    
    // Plan checks
    canAccess,
    canAccessFeature,
    hasFeature,
    getUserLimits,
    checkUsageLimit,
    getPlanPricing,
    getCurrentPlanData,
    validateServiceAccess,
    
    // API utilities
    apiCall,
    
    // Plan utilities
    planUtils: {
      normalizePlanName: planUtils.normalizePlanName,
      getUserCountry: planUtils.getUserCountry,
      getUserPlan: () => user?.plan || 'free',
      getNormalizedPlanData: (planName, country) => 
        planUtils.getNormalizedPlanData(planName || user?.plan, country || user?.country),
      planAwareApiCall: planUtils.planAwareApiCall,
      usageAwareApiCall: planUtils.usageAwareApiCall,
      showUpgradeModal: planUtils.showUpgradeModal,
      getUpgradeUrl: planUtils.getUpgradeUrl,
      formatPrice: planUtils.formatPrice
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;