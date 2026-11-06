// src/context/AuthContext.js - Full Compliance & Security Version
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import api, { planUtils } from '../services/api';
import { message } from 'antd';
import i18n from '../i18n';
import {
  TERMS_VERSION,
  PRIVACY_VERSION,
  DPA_VERSION,
  BAA_VERSION,
} from '../constants/versions';

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
  const tokenRef = useRef(null);

  // Keep tokenRef in sync so interceptors always see the latest token
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // ==================== HELPER: Clear ALL auth storage ====================
  const clearAuthStorage = useCallback(() => {
    const keysToClear = [
      'authToken', 'token', 'jwtToken', 'access_token',
      'user', 'sessionId', 'refreshToken',
      'user_plan', 'is_super_admin', 'rememberMe',
      'userStage', 'redirect_to',
      'requires_payment', 'requires_plan_selection',
      'requires_approval', 'requires_company_setup',
      'requires_consent',
      'token_expiry',
      // Signup flow leftovers
      'pendingUserId', 'pendingUserEmail', 'pendingUserType',
      'pendingCountry', 'pendingCompanyId', 'pendingPlan',
      'verifiedEmail',
    ];

    keysToClear.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Session-scoped signup keys
    ['signupState', 'requires_verification'].forEach((k) => sessionStorage.removeItem(k));

    delete api.defaults.headers.common['Authorization'];
  }, []);

  // ==================== API CALL HELPER (returns 4xx bodies) ====================
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await api(endpoint, options);
      return response.data;
    } catch (error) {
      // Surface the response body so callers can read { error, missing_consents, ... }
      if (error.response?.data) {
        return { ...error.response.data, _httpStatus: error.response.status };
      }
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
      const countryPricing =
        planUtils.COUNTRY_PRICING?.[userData.country] || planUtils.COUNTRY_PRICING?.default;
      const pricing = countryPricing?.[normalizedPlan] || {};

      let planFeatures = {};
      if (planConfig?.features && Array.isArray(planConfig.features)) {
        planConfig.features.forEach((feature) => {
          if (typeof feature === 'string') planFeatures[feature] = true;
        });
      }

      let planLimits = {};
      if (planConfig?.limits && typeof planConfig.limits === 'object') {
        planLimits = { ...planConfig.limits };
      }

      const planHierarchy = planUtils.PLAN_HIERARCHY || {
        free: 0,
        basic: 1,
        pro: 2,
        enterprise: 3,
        super_admin: 999,
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
        plan_label:
          planConfig?.label ||
          normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1),
        plan_currency: pricing?.currency || 'USD',
        plan_pricing: pricing,

        // ✅ Compliance fields — pass through verbatim
        terms_version_accepted:
          userData.terms_version || userData.terms_version_accepted || null,
        privacy_version_accepted:
          userData.privacy_version || userData.privacy_version_accepted || null,
        dpa_version_accepted:
          userData.dpa_version || userData.dpa_version_accepted || null,
        e_consent_given: userData.e_consent ?? userData.e_consent_given ?? null,
        marketing_consent: userData.marketing_consent ?? false,
        mfa_enabled: userData.mfa_enabled ?? userData.mfa_opt_in ?? false,
        mfa_required: userData.mfa_required ?? false,
        industry: userData.industry || null,
        date_of_birth: userData.date_of_birth || null,
        is_minor: userData.is_minor ?? false,
        needs_consent: userData.needs_consent ?? false,
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
        isStandardized: normalizedUser.is_plan_standardized || false,
      };
    } catch (error) {
      console.error('❌ Error extracting plan data:', error);
      return null;
    }
  };

  // ==================== ROLE CHECK FUNCTIONS ====================
  const isSuperAdmin = () => {
    if (!user) return false;
    // ✅ Trust only server-derived flags. No hardcoded email, no localStorage shortcuts.
    return (
      user.is_super_admin === true ||
      user.user_type === 'super_admin' ||
      user.user_type === 'platform_owner' ||
      user.user_type === 'system' ||
      user.role === 'super_admin'
    );
  };

  const isRegularAdmin = () => {
    if (!user) return false;
    return user.user_type === 'admin' && !isSuperAdmin();
  };

  const isAnyAdmin = () => isSuperAdmin() || isRegularAdmin();

  const isEmployee = () => {
    if (!user) return false;
    return user.user_type === 'employee';
  };

  const isCompanyAdmin = () => {
    if (!user) return false;
    return user.user_type === 'company_admin';
  };

  const isRegularUser = () => {
    if (!user) return false;
    return user.user_type === 'user';
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (role === 'super_admin') return isSuperAdmin();
    if (role === 'admin') return isRegularAdmin();
    if (role === 'company_admin') return isCompanyAdmin();
    if (role === 'any_admin') return isAnyAdmin();
    if (role === 'employee') return isEmployee();
    if (role === 'user') return isRegularUser();
    return user.user_type === role;
  };

  // ==================== EFFECTIVE PLAN HELPER ====================
  // ✅ Company roles inherit company plan — always resolve to the effective plan
  const effectivePlan = useCallback(() => {
    if (!user) return 'free';
    if (
      ['admin', 'company_admin', 'employee'].includes(user.user_type) &&
      user.company_id
    ) {
      return user.subscription_plan || user.plan || 'free';
    }
    return user.plan || 'free';
  }, [user]);

  // ==================== NAVIGATION HELPERS ====================
  const getDashboardPath = () => {
    if (!user) return '/login';

    if (isSuperAdmin()) return '/super-admin/dashboard';
    if (isRegularAdmin()) return '/admin/dashboard';
    if (isCompanyAdmin()) return '/company/dashboard';
    if (isEmployee()) return '/employee/dashboard';
    return '/user/dashboard';
  };

  const getDashboardComponent = () => {
    if (isSuperAdmin()) return 'SuperAdminDashboard';
    if (isRegularAdmin()) return 'AdminDashboard';
    if (isCompanyAdmin()) return 'CompanyDashboard';
    if (isEmployee()) return 'EmployeeDashboard';
    return 'UserDashboard';
  };

  // ==================== PLAN CHECK FUNCTIONS ====================
  const canAccess = (requiredPlan) => {
    if (!user) return false;
    if (isSuperAdmin()) return true; // ✅ super admin bypasses gating
    const plan = effectivePlan();
    const plans = ['free', 'basic', 'pro', 'enterprise'];
    const userPlanIndex = plans.indexOf(plan);
    const requiredPlanIndex = plans.indexOf(requiredPlan);
    if (userPlanIndex === -1 || requiredPlanIndex === -1) return false;
    return userPlanIndex >= requiredPlanIndex;
  };

  const canAccessFeature = (requiredPlan) => {
    if (!user) return false;
    if (isSuperAdmin()) return true;
    return planUtils.canAccessFeature(requiredPlan, effectivePlan());
  };

  const hasFeature = (featureName) => {
    if (!user) return false;
    if (isSuperAdmin()) return true;
    return planUtils.hasFeature(featureName, effectivePlan());
  };

  const getUserLimits = () => {
    if (!user) return {};
    return planUtils.getUserLimits(effectivePlan());
  };

  const checkUsageLimit = (limitType, usedAmount = 0) => {
    if (!user) return { withinLimit: false, remaining: 0 };
    return planUtils.checkUsageLimit(limitType, usedAmount, effectivePlan());
  };

  const getPlanPricing = () => {
    if (!user) return null;
    return planUtils.getPlanPricing(effectivePlan(), user.country);
  };

  const getCurrentPlanData = () => {
    if (!user) return null;
    return planUtils.getNormalizedPlanData(effectivePlan(), user.country);
  };

  const validateServiceAccess = (serviceName, options = {}) => {
    if (!user) return { valid: false, reason: 'Not authenticated' };
    return planUtils.planValidationService.validateServiceAccess(serviceName, {
      ...options,
      userPlan: effectivePlan(),
    });
  };

  // ==================== LOGIN FUNCTION ====================
  const login = async (credentials, rememberMe = false) => {
    setLoading(true);

    try {
      const { email, password } = credentials;

      // ✅ Single endpoint — backend derives role from DB, not payload
      const endpoint = '/auth/login';

      const response = await api.post(
        endpoint,
        { email, password },
        {
          validateStatus: () => true,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const { status, data: res } = response;

      // ---------- 5xx: server error ----------
      if (status >= 500) {
        console.error('Server error during login:', res);
        return {
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
          code: 'SERVER_ERROR',
        };
      }

      // ---------- 200: success (but check stage gates first) ----------
      if (status === 200 && res?.success) {
        const receivedToken = res.token || res.access_token;

        // ✅ MFA required — do NOT set the real token yet
        if (res.stage === 'needs_mfa' || res.mfa_required) {
          return {
            success: false,
            mfa_required: true,
            mfa_token: res.mfa_token,
            user_id: res.user_id,
            method: res.mfa_method || 'totp',
            message: res.message || 'Enter your authentication code to continue.',
          };
        }

        // ✅ Consent re-acceptance required
        if (res.stage === 'needs_consent') {
          if (!receivedToken) {
            return { success: false, error: 'Login response missing token' };
          }
          const cleanToken = receivedToken.replace(/['"]/g, '').trim();
          setToken(cleanToken);
          tokenRef.current = cleanToken;

          const normalizedUser = normalizeUserPlan(res.user);
          normalizedUser.needs_consent = true;
          normalizedUser.terms_version_accepted = res.user?.terms_version || null;
          normalizedUser.privacy_version_accepted = res.user?.privacy_version || null;
          setUser(normalizedUser);

          // Always persist to localStorage so re-consent survives a refresh
          localStorage.setItem('authToken', cleanToken);
          localStorage.setItem('token', cleanToken);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          localStorage.setItem('userStage', 'needs_consent');
          localStorage.setItem('redirect_to', '/accept-terms');
          api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;

          return {
            success: true,
            stage: 'needs_consent',
            redirect_to: '/accept-terms',
            user: normalizedUser,
            token: cleanToken,
            terms_expected: res.terms_version_expected || TERMS_VERSION,
            privacy_expected: res.privacy_version_expected || PRIVACY_VERSION,
            message: res.message || 'Please review and accept the updated policies.',
          };
        }

        // ✅ Normal success
        if (!receivedToken || !res.user) {
          return {
            success: false,
            error: res.error || 'Login failed — no token or user data returned',
          };
        }

        const cleanToken = receivedToken.replace(/['"]/g, '').trim();

        setToken(cleanToken);
        tokenRef.current = cleanToken;

        const normalizedUser = normalizeUserPlan(res.user);
        setUser(normalizedUser);
        setPlanData(getPlanDataFromUser(normalizedUser));

        // ✅ Honor rememberMe for storage target
        const storage = rememberMe ? localStorage : sessionStorage;
        const otherStorage = rememberMe ? sessionStorage : localStorage;

        // Clear the other store to avoid two copies
        ['authToken', 'token', 'jwtToken', 'access_token', 'user', 'userStage', 'redirect_to'].forEach(
          (k) => otherStorage.removeItem(k)
        );

        storage.setItem('authToken', cleanToken);
        storage.setItem('token', cleanToken);

        const stage = res.stage || 'complete';
        storage.setItem('userStage', stage);
        storage.setItem('redirect_to', res.redirect_to || '/dashboard');
        storage.setItem('requires_payment', res.requires_payment ? 'true' : 'false');
        storage.setItem(
          'requires_plan_selection',
          res.requires_plan_selection ? 'true' : 'false'
        );
        storage.setItem('requires_approval', res.requires_approval ? 'true' : 'false');
        storage.setItem(
          'requires_company_setup',
          res.requires_company_setup ? 'true' : 'false'
        );
        storage.setItem('requires_consent', res.stage === 'needs_consent' ? 'true' : 'false');

        normalizedUser.token = cleanToken;
        normalizedUser.stage = stage;
        normalizedUser.redirect_to = res.redirect_to || '/dashboard';
        normalizedUser.requires_payment = res.requires_payment || false;
        normalizedUser.requires_plan_selection = res.requires_plan_selection || false;
        normalizedUser.requires_approval = res.requires_approval || false;
        normalizedUser.requires_company_setup = res.requires_company_setup || false;
        normalizedUser.payment_status = res.payment_status || 'completed';
        normalizedUser.dashboard_config = res.dashboard_config || null;
        normalizedUser.needs_consent = false;

        storage.setItem('user', JSON.stringify(normalizedUser));
        storage.setItem('rememberMe', rememberMe ? 'true' : 'false');

        api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;

        // ✅ Use server-provided TTL, not hardcoded 7 days
        const ttlSeconds = res.expires_in || 86400; // 24h default
        const tokenExpiry = new Date(Date.now() + ttlSeconds * 1000);
        storage.setItem('token_expiry', tokenExpiry.toISOString());

        const userLanguage = normalizedUser.preferred_language || 'en';
        localStorage.setItem('preferredLanguage', userLanguage);
        try {
          await i18n.changeLanguage(userLanguage);
        } catch (languageError) {
          console.warn('Failed to change language:', languageError);
        }

        // ✅ Clear any stale signup state so we don't resume an old flow
        sessionStorage.removeItem('signupState');

        return {
          success: true,
          user: normalizedUser,
          planData: getPlanDataFromUser(normalizedUser),
          token: cleanToken,
          stage,
          redirect_to: res.redirect_to || '/dashboard',
          requires_payment: res.requires_payment || false,
          requires_plan_selection: res.requires_plan_selection || false,
          requires_approval: res.requires_approval || false,
          requires_company_setup: res.requires_company_setup || false,
          payment_status: res.payment_status || 'completed',
          dashboard_config: res.dashboard_config || null,
          message: res.message || 'Login successful',
        };
      }

      // ---------- 403: verification required ----------
      if (status === 403 && (res?.requires_verification || res?.needs_verification)) {
        return {
          success: false,
          error: res.error || 'Email not verified',
          message: res.message || 'Please verify your email before logging in.',
          requires_verification: true,
          needsVerification: true,
          email: res.email || email,
        };
      }

      // ---------- 403: guardian consent pending ----------
      if (status === 403 && res?.requires_guardian_consent) {
        return {
          success: false,
          error: res.error || 'Guardian consent pending',
          message: res.message,
          requires_guardian_consent: true,
          guardian_email: res.guardian_email,
        };
      }

      // ---------- 403: approval required ----------
      if (status === 403 && res?.requires_approval) {
        return {
          success: false,
          error: res.error || 'Account pending approval',
          message: res.message,
          requires_approval: true,
          approval_status: res.approval_status,
          user_type: res.user_type,
        };
      }

      // ---------- 403: account deactivated ----------
      if (status === 403 && res?.error === 'Account deactivated') {
        return {
          success: false,
          error: res.error,
          message: res.message || 'Your account has been deactivated.',
        };
      }

      // ---------- 403: company not found ----------
      if (status === 403 && res?.needs_company_setup) {
        return {
          success: false,
          error: res.error || 'Company not found',
          message: res.message,
          needs_company_setup: true,
          user_type: res.user_type,
        };
      }

      // ---------- 401: invalid credentials ----------
      if (status === 401) {
        return {
          success: false,
          error: res?.error || 'Invalid email or password',
          message: res?.message,
        };
      }

      // ---------- 429: rate limited ----------
      if (status === 429) {
        return {
          success: false,
          error: res?.error || 'Too many login attempts. Please wait a moment.',
          code: 'RATE_LIMITED',
        };
      }

      // ---------- anything else ----------
      return {
        success: false,
        error: res?.error || `Login failed (HTTP ${status})`,
        message: res?.message,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Login failed';

      console.error('Login network error:', error);

      return {
        success: false,
        error: errorMessage,
        requires_verification: error.response?.data?.requires_verification || false,
        needsVerification: error.response?.data?.requires_verification || false,
        message: error.response?.data?.message,
      };
    } finally {
      setLoading(false);
    }
  };

  // ==================== SIGNUP ====================
  const signup = async (userData) => {
    setLoading(true);

    try {
      const preferredLanguage = userData.preferred_language || userData.preferredLanguage || 'en';

      const res = await apiCall('/auth/register', {
        method: 'POST',
        data: userData,
        validateStatus: () => true,
      });

      // ✅ Consent rejection (400/409) — surface which consent failed
      if (
        res?.error &&
        /consent|terms|privacy|dpa|version/i.test(res.error)
      ) {
        return {
          success: false,
          error: res.error,
          code: 'CONSENT_REQUIRED',
          missing_consents: res.missing_consents || [],
          expected_terms_version: res.expected,
          received_terms_version: res.received,
        };
      }

      // ✅ Guardian consent (minor)
      if (res?.stage === 'needs_guardian_consent') {
        return {
          success: true,
          needsGuardianConsent: true,
          guardianEmail: res.guardian_email,
          email: userData.email,
          message:
            res.message ||
            'A consent email has been sent to your parent or guardian.',
        };
      }

      // ✅ MFA setup required before account is usable
      if (res?.stage === 'needs_mfa_setup' || res?.mfa_required) {
        return {
          success: true,
          needsMfaSetup: true,
          mfa_provisioning_uri: res.mfa_provisioning_uri,
          mfa_secret: res.mfa_secret,
          email: userData.email,
        };
      }

      const receivedToken = res.token || res.access_token;

      if (receivedToken && res.user) {
        setToken(receivedToken);
        tokenRef.current = receivedToken;

        const normalizedUser = normalizeUserPlan(res.user);
        normalizedUser.terms_version_accepted =
          res.user.terms_version || userData.terms_version || null;
        normalizedUser.privacy_version_accepted =
          res.user.privacy_version || userData.privacy_version || null;
        normalizedUser.dpa_version_accepted =
          res.user.dpa_version || userData.dpa_version || null;
        normalizedUser.e_consent_given =
          res.user.e_consent ?? userData.e_consent ?? null;
        normalizedUser.marketing_consent =
          res.user.marketing_consent ?? userData.marketing_consent ?? false;
        normalizedUser.mfa_enabled = res.user.mfa_enabled || false;
        normalizedUser.industry = res.user.industry || userData.industry || null;
        normalizedUser.needs_consent = false;

        setUser(normalizedUser);
        setPlanData(getPlanDataFromUser(normalizedUser));

        localStorage.setItem('authToken', receivedToken);
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('preferredLanguage', preferredLanguage);
        localStorage.setItem('rememberMe', 'true');

        api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;

        const ttlSeconds = res.expires_in || 86400;
        const tokenExpiry = new Date(Date.now() + ttlSeconds * 1000);
        localStorage.setItem('token_expiry', tokenExpiry.toISOString());

        try {
          await i18n.changeLanguage(preferredLanguage);
        } catch (languageError) {
          console.warn('Failed to apply language after signup:', languageError);
        }

        return {
          success: true,
          user: normalizedUser,
          planData: getPlanDataFromUser(normalizedUser),
          token: receivedToken,
          stage: res.stage || 'complete',
        };
      }

      // Verification-required path
      if (res.message || res.stage === 'needs_verification') {
        localStorage.setItem('preferredLanguage', preferredLanguage);
        try {
          await i18n.changeLanguage(preferredLanguage);
        } catch (languageError) {
          console.warn('Failed to apply language after signup:', languageError);
        }

        return {
          success: true,
          needsVerification: true,
          stage: res.stage || 'needs_verification',
          email: userData.email,
          message:
            res.message ||
            'Account created! Please check your email for verification.',
        };
      }

      return { success: false, error: res.error || 'Signup failed' };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Signup failed';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // ==================== ACCEPT TERMS (re-consent) ====================
  const acceptTerms = async ({
    termsAccepted,
    eConsent,
    dpaAccepted,
    marketingConsent,
  }) => {
    try {
      const res = await apiCall('/auth/accept-consent', {
        method: 'POST',
        data: {
          terms_version: TERMS_VERSION,
          terms_accepted: termsAccepted === true,
          privacy_version: PRIVACY_VERSION,
          privacy_accepted: termsAccepted === true,
          e_consent: eConsent === true,
          dpa_version: ['admin', 'company_admin'].includes(user?.user_type)
            ? DPA_VERSION
            : null,
          dpa_accepted: dpaAccepted === true,
          marketing_consent: marketingConsent === true,
          client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          client_locale: navigator.language,
        },
        validateStatus: () => true,
      });

      if (res?.success) {
        const updatedUser = {
          ...user,
          terms_version_accepted: TERMS_VERSION,
          privacy_version_accepted: PRIVACY_VERSION,
          dpa_version_accepted: dpaAccepted ? DPA_VERSION : user?.dpa_version_accepted,
          e_consent_given: eConsent === true,
          marketing_consent: marketingConsent === true,
          needs_consent: false,
        };
        setUser(updatedUser);

        const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(updatedUser));
        storage.removeItem('userStage');
        storage.removeItem('requires_consent');

        return { success: true };
      }

      return {
        success: false,
        error: res?.error || 'Failed to record consent',
        missing_consents: res?.missing_consents || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Consent request failed',
      };
    }
  };

  // ==================== MFA VERIFY ====================
  const verifyMfa = async (mfaToken, code) => {
    try {
      const response = await api.post(
        '/auth/mfa/verify',
        { mfa_token: mfaToken, code },
        { validateStatus: () => true }
      );

      const { status, data: res } = response;

      if (status === 200 && res?.success) {
        const receivedToken = res.token || res.access_token;
        if (receivedToken) {
          const cleanToken = receivedToken.replace(/['"]/g, '').trim();
          setToken(cleanToken);
          tokenRef.current = cleanToken;

          const normalizedUser = normalizeUserPlan(res.user);
          normalizedUser.mfa_enabled = true;
          normalizedUser.needs_consent = false;

          setUser(normalizedUser);
          setPlanData(getPlanDataFromUser(normalizedUser));

          localStorage.setItem('authToken', cleanToken);
          localStorage.setItem('token', cleanToken);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          localStorage.setItem('userStage', res.stage || 'complete');
          api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;

          if (res.expires_in) {
            const expiry = new Date(Date.now() + res.expires_in * 1000);
            localStorage.setItem('token_expiry', expiry.toISOString());
          }

          return {
            success: true,
            user: normalizedUser,
            token: cleanToken,
            stage: res.stage || 'complete',
            redirect_to: res.redirect_to || '/dashboard',
          };
        }
      }

      return {
        success: false,
        error: res?.error || 'Invalid authentication code',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'MFA verification failed',
      };
    }
  };

  // ==================== LOGOUT ====================
  const logout = async () => {
    const currentLanguage = localStorage.getItem('preferredLanguage') || 'en';

    // ✅ Best-effort server-side session revocation
    try {
      await api.post('/auth/logout', {}, { validateStatus: () => true });
    } catch (e) {
      console.warn('Server logout failed (ignored):', e);
    }

    clearAuthStorage();
    setUser(null);
    setToken(null);
    setPlanData(null);
    tokenRef.current = null;

    if (currentLanguage) {
      localStorage.setItem('preferredLanguage', currentLanguage);
    }

    message.success('Logged out successfully');
    window.location.href = '/';
  };

  // ==================== REFRESH USER ====================
  const refreshUser = async () => {
    try {
      const currentToken =
        token ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken');
      if (!currentToken) return;

      const profile = await apiCall('/user/profile', { method: 'GET' });

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
    } catch (error) {
      console.error('Refresh user error:', error);
      if (error.response?.status === 401 && user?.id) {
        // Only logout if we had a user to begin with (avoid race with in-flight login)
        await logout();
      }
    }
  };

  // ==================== PASSWORD MANAGEMENT ====================
  const forgotPassword = async (email) => {
    try {
      const res = await apiCall('/auth/forgot-password', {
        method: 'POST',
        data: { email },
      });

      if (res.success || res.message) {
        message.success('Password reset instructions sent to your email');
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to send reset instructions' };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Password reset failed';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      const res = await apiCall('/auth/reset-password', {
        method: 'POST',
        data: { token: resetToken, new_password: newPassword },
      });

      if (res.success || res.message) {
        message.success('Password reset successfully');
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to reset password' };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Password reset failed';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // ==================== EMAIL VERIFICATION ====================
  const verifyEmail = async (email, code) => {
    try {
      const res = await apiCall('/auth/verify', {
        method: 'POST',
        data: { email, code },
      });

      if (res.success || res.message) {
        message.success('Email verified successfully');
        return { success: true };
      }
      return { success: false, error: res.error || 'Email verification failed' };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Email verification failed';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resendVerification = async (email) => {
    try {
      const res = await apiCall('/auth/resend-verification', {
        method: 'POST',
        data: { email },
      });

      if (res.success || res.message) {
        message.success('Verification email sent');
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to send verification' };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to send verification';
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
        data: profileData,
      });

      if (res.success && res.profile) {
        const normalizedUser = normalizeUserPlan(res.profile);
        setUser(normalizedUser);
        setPlanData(getPlanDataFromUser(normalizedUser));

        const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(normalizedUser));

        if (
          normalizedUser.preferred_language &&
          normalizedUser.preferred_language !== i18n.language
        ) {
          await i18n.changeLanguage(normalizedUser.preferred_language);
          localStorage.setItem('preferredLanguage', normalizedUser.preferred_language);
        }

        message.success('Profile updated successfully');
        return {
          success: true,
          user: normalizedUser,
          planData: getPlanDataFromUser(normalizedUser),
        };
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
      }
      return { success: false, error: res.error || 'Profile update failed' };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Profile update failed';
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
            data: { language: newLanguage },
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
      userStage: localStorage.getItem('userStage'),
      tokenExpiry: localStorage.getItem('token_expiry'),
    };

    const sessionStorageData = {
      authToken: sessionStorage.getItem('authToken') ? 'PRESENT' : 'MISSING',
      token: sessionStorage.getItem('token') ? 'PRESENT' : 'MISSING',
      user: sessionStorage.getItem('user') ? 'PRESENT' : 'MISSING',
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 AUTH DEBUG:', {
        localStorage: localStorageData,
        sessionStorage: sessionStorageData,
        state: {
          token: token ? 'SET' : 'NOT SET',
          user: user ? `SET (${user.email})` : 'NOT SET',
          planData: planData ? 'SET' : 'NOT SET',
          loading,
        },
      });
    }

    return {
      localStorage: localStorageData,
      sessionStorage: sessionStorageData,
      state: { user, token, planData, loading },
    };
  };

  // ==================== AXIOS INTERCEPTORS (attaches token + 401 handling) ====================
  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use(
      (config) => {
        const t = tokenRef.current || localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (t && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${t}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const resInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry && tokenRef.current) {
          original._retry = true;
          // TODO: implement /auth/refresh with HttpOnly cookie; for now, logout
          clearAuthStorage();
          setUser(null);
          setToken(null);
          setPlanData(null);
          tokenRef.current = null;
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, [clearAuthStorage]);

  // ==================== INITIALIZATION EFFECT ====================
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeAuth = async () => {
      try {
        const savedToken =
          localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const savedUser =
          localStorage.getItem('user') || sessionStorage.getItem('user');

        const tokenExpiry =
          localStorage.getItem('token_expiry') || sessionStorage.getItem('token_expiry');
        const isExpired = tokenExpiry && new Date(tokenExpiry) < new Date();

        if (savedToken && savedUser && !isExpired) {
          setToken(savedToken);
          tokenRef.current = savedToken;

          try {
            const userData = JSON.parse(savedUser);
            const normalizedUser = normalizeUserPlan(userData);

            const savedStage =
              localStorage.getItem('userStage') ||
              sessionStorage.getItem('userStage') ||
              'complete';

            normalizedUser.stage = savedStage;
            normalizedUser.redirect_to =
              localStorage.getItem('redirect_to') ||
              sessionStorage.getItem('redirect_to') ||
              '/dashboard';
            normalizedUser.requires_payment =
              (localStorage.getItem('requires_payment') ||
                sessionStorage.getItem('requires_payment')) === 'true';
            normalizedUser.requires_plan_selection =
              (localStorage.getItem('requires_plan_selection') ||
                sessionStorage.getItem('requires_plan_selection')) === 'true';
            normalizedUser.needs_approval =
              (localStorage.getItem('requires_approval') ||
                sessionStorage.getItem('requires_approval')) === 'true';
            normalizedUser.requires_company_setup =
              (localStorage.getItem('requires_company_setup') ||
                sessionStorage.getItem('requires_company_setup')) === 'true';
            normalizedUser.needs_consent =
              (localStorage.getItem('requires_consent') ||
                sessionStorage.getItem('requires_consent')) === 'true';

            setUser(normalizedUser);
            setPlanData(getPlanDataFromUser(normalizedUser));
            api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

            if (process.env.NODE_ENV !== 'production') {
              console.log('✅ Session restored from storage');
            }
          } catch (parseError) {
            console.error('❌ Invalid saved user data, clearing storage:', parseError);
            clearAuthStorage();
            setUser(null);
            setToken(null);
            setPlanData(null);
            tokenRef.current = null;
          }
        } else {
          if (isExpired) {
            if (process.env.NODE_ENV !== 'production') {
              console.log('⏰ Token expired, clearing session');
            }
          } else if (process.env.NODE_ENV !== 'production') {
            console.log('🔐 No session found, user needs to log in');
          }
          clearAuthStorage();
          setUser(null);
          setToken(null);
          setPlanData(null);
          tokenRef.current = null;
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        clearAuthStorage();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [clearAuthStorage]);

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

    // Compliance
    acceptTerms,
    verifyMfa,

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
    isCompanyAdmin,
    isEmployee,
    isRegularUser,
    hasRole,
    getDashboardPath,
    getDashboardComponent,

    // Plan checks
    effectivePlan,
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

    // Compliance versions (expose so UI can compare)
    complianceVersions: {
      terms: TERMS_VERSION,
      privacy: PRIVACY_VERSION,
      dpa: DPA_VERSION,
      baa: BAA_VERSION,
    },

    // Plan utilities
    planUtils: {
      normalizePlanName: planUtils.normalizePlanName,
      getUserCountry: planUtils.getUserCountry,
      getUserPlan: () => effectivePlan(),
      getNormalizedPlanData: (planName, country) =>
        planUtils.getNormalizedPlanData(planName || effectivePlan(), country || user?.country),
      planAwareApiCall: planUtils.planAwareApiCall,
      usageAwareApiCall: planUtils.usageAwareApiCall,
      showUpgradeModal: planUtils.showUpgradeModal,
      getUpgradeUrl: planUtils.getUpgradeUrl,
      formatPrice: planUtils.formatPrice,
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
