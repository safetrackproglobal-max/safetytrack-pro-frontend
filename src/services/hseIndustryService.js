// src/services/hseIndustryService.js
import axios from 'axios';
import { planAwareApiCall, canAccessFeature, getPlanFeatures } from './api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Plan-based industry access configuration
const planIndustryAccess = {
  free: ['general'], // Free plan only gets general industry
  basic: ['general', 'construction', 'manufacturing', 'healthcare'],
  pro: ['general', 'construction', 'manufacturing', 'healthcare', 'oil_gas', 'mining', 'chemical', 'aviation', 'maritime'],
  enterprise: 'all' // All industries
};

// Plan-based feature access
const planFeatures = {
  free: {
    dashboard: true,
    basicReports: true,
    generalTools: true,
    analytics: false,
    advancedReports: false,
    industrySpecificTools: false,
    customDashboards: false,
    apiAccess: false
  },
  basic: {
    dashboard: true,
    basicReports: true,
    generalTools: true,
    analytics: true,
    advancedReports: true,
    industrySpecificTools: true,
    customDashboards: false,
    apiAccess: false
  },
  pro: {
    dashboard: true,
    basicReports: true,
    generalTools: true,
    analytics: true,
    advancedReports: true,
    industrySpecificTools: true,
    customDashboards: true,
    apiAccess: true
  },
  enterprise: {
    dashboard: true,
    basicReports: true,
    generalTools: true,
    analytics: true,
    advancedReports: true,
    industrySpecificTools: true,
    customDashboards: true,
    apiAccess: true
  }
};

// Mock data for industries
const mockIndustries = [
  {
    id: 'oil_gas',
    name: 'Oil & Gas Safety',
    description: 'Process safety, well control, pipeline management',
    color_code: '#389e0d',
    icon_name: 'thunderbolt',
    risk_level: 'very_high',
    features: ['Process Safety', 'Hazard Analysis', 'Emergency Response', 'Well Control'],
    requiredPlan: 'pro',
    proOnly: true,
    planFeatures: {
      free: ['View basic information'],
      basic: ['View basic information', 'Access general tools'],
      pro: ['Full access to all features', 'Advanced analytics', 'Custom reports'],
      enterprise: ['Full access plus API integration', 'Custom workflows']
    }
  },
  {
    id: 'construction',
    name: 'Construction Safety',
    description: 'Fall protection, scaffold safety, excavation',
    color_code: '#fa8c16',
    icon_name: 'build',
    risk_level: 'high',
    features: ['Fall Protection', 'Scaffold Safety', 'Equipment Operations', 'Site Inspection'],
    requiredPlan: 'basic',
    proOnly: false,
    planFeatures: {
      free: ['View basic information'],
      basic: ['Access to all features', 'Basic reports', 'Safety tools'],
      pro: ['Advanced analytics', 'Custom dashboards', 'Predictive risk assessment'],
      enterprise: ['API integration', 'Custom workflows', 'White-label reports']
    }
  },
  {
    id: 'healthcare',
    name: 'Healthcare Safety',
    description: 'Infection control, patient safety, biohazards',
    color_code: '#eb2f96',
    icon_name: 'medicine-box',
    risk_level: 'high',
    features: ['Infection Control', 'Patient Safety', 'Biohazard Management', 'Medical Waste'],
    requiredPlan: 'basic',
    proOnly: false,
    planFeatures: {
      free: ['View basic information'],
      basic: ['Access to all features', 'Basic reports', 'Compliance tracking'],
      pro: ['Advanced analytics', 'Custom dashboards', 'Patient safety metrics'],
      enterprise: ['API integration', 'Custom workflows', 'Integration with EHR systems']
    }
  },
  {
    id: 'mining',
    name: 'Mining Safety',
    description: 'Ground control, ventilation, explosives safety',
    color_code: '#faad14',
    icon_name: 'gold',
    risk_level: 'very_high',
    features: ['Ground Control', 'Ventilation', 'Explosives Management', 'Mine Inspection'],
    requiredPlan: 'pro',
    proOnly: true,
    planFeatures: {
      free: ['View basic information'],
      basic: ['View basic information', 'Access general tools'],
      pro: ['Full access to all features', 'Advanced analytics', 'Real-time monitoring'],
      enterprise: ['Full access plus API integration', 'Custom workflows', 'Sensor integration']
    }
  },
  {
    id: 'chemical',
    name: 'Chemical Safety',
    description: 'Process safety, chemical handling, reactivity',
    color_code: '#722ed1',
    icon_name: 'experiment',
    risk_level: 'high',
    features: ['Process Safety', 'Chemical Management', 'Containment', 'Reactivity Analysis'],
    requiredPlan: 'pro',
    proOnly: true,
    planFeatures: {
      free: ['View basic information'],
      basic: ['View basic information', 'Access general tools'],
      pro: ['Full access to all features', 'Advanced analytics', 'Chemical risk modeling'],
      enterprise: ['Full access plus API integration', 'Custom workflows', 'ERP integration']
    }
  },
  {
    id: 'aviation',
    name: 'Aviation Safety',
    description: 'Flight safety, maintenance, ground operations',
    color_code: '#13c2c2',
    icon_name: 'rocket',
    risk_level: 'high',
    features: ['Flight Safety', 'Maintenance', 'Ground Operations', 'Safety Audits'],
    requiredPlan: 'pro',
    proOnly: true,
    planFeatures: {
      free: ['View basic information'],
      basic: ['View basic information', 'Access general tools'],
      pro: ['Full access to all features', 'Advanced analytics', 'Flight data analysis'],
      enterprise: ['Full access plus API integration', 'Custom workflows', 'FMS integration']
    }
  },
  {
    id: 'maritime',
    name: 'Maritime Safety',
    description: 'Vessel safety, cargo operations, navigation',
    color_code: '#1890ff',
    icon_name: 'ship',
    risk_level: 'high',
    features: ['Vessel Safety', 'Cargo Operations', 'Navigation', 'Port Safety'],
    requiredPlan: 'pro',
    proOnly: true,
    planFeatures: {
      free: ['View basic information'],
      basic: ['View basic information', 'Access general tools'],
      pro: ['Full access to all features', 'Advanced analytics', 'Vessel tracking'],
      enterprise: ['Full access plus API integration', 'Custom workflows', 'AIS integration']
    }
  },
  {
    id: 'general',
    name: 'General Industry',
    description: 'Manufacturing, warehousing, office safety',
    color_code: '#52c41a',
    icon_name: 'safety',
    risk_level: 'medium',
    features: ['Incident Management', 'Safety Protocols', 'Training', 'Compliance'],
    requiredPlan: 'free',
    proOnly: false,
    planFeatures: {
      free: ['Full access to all features', 'Basic reports', 'Safety tools'],
      basic: ['Enhanced features', 'Advanced reports', 'Analytics'],
      pro: ['Custom dashboards', 'Predictive analytics', 'API access'],
      enterprise: ['Full customization', 'White-label solutions', 'Enterprise integration']
    }
  }
];

// Mock dashboard data with plan-based variations
const mockDashboardData = {
  free: {
    quick_stats: {
      active_protocols: 5,
      open_actions: 3,
      training_compliance: 70,
      safety_score: 75
    },
    safety_metrics: {
      active_protocols: 5,
      open_actions: 3,
      training_compliance: 70,
      safety_score: 75,
      incident_rate: 3.2,
      near_misses: 8,
      limited_data: true
    }
  },
  basic: {
    quick_stats: {
      active_protocols: 12,
      open_actions: 5,
      training_compliance: 85,
      safety_score: 88
    },
    safety_metrics: {
      active_protocols: 12,
      open_actions: 5,
      training_compliance: 85,
      safety_score: 88,
      incident_rate: 2.5,
      near_misses: 12,
      trend_data: true
    }
  },
  pro: {
    quick_stats: {
      active_protocols: 24,
      open_actions: 8,
      training_compliance: 92,
      safety_score: 94
    },
    safety_metrics: {
      active_protocols: 24,
      open_actions: 8,
      training_compliance: 92,
      safety_score: 94,
      incident_rate: 1.8,
      near_misses: 15,
      trend_data: true,
      predictive_analytics: true,
      real_time_data: true
    }
  },
  enterprise: {
    quick_stats: {
      active_protocols: 50,
      open_actions: 12,
      training_compliance: 96,
      safety_score: 97
    },
    safety_metrics: {
      active_protocols: 50,
      open_actions: 12,
      training_compliance: 96,
      safety_score: 97,
      incident_rate: 1.2,
      near_misses: 10,
      trend_data: true,
      predictive_analytics: true,
      real_time_data: true,
      custom_metrics: true,
      api_integrated: true
    }
  },
  // Common recent activities
  recent_activities: [
    {
      description: 'Safety inspection completed for Main Facility',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      severity: 'low',
      accessibleTo: ['free', 'basic', 'pro', 'enterprise']
    },
    {
      description: 'New risk assessment submitted',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      severity: 'medium',
      accessibleTo: ['basic', 'pro', 'enterprise']
    },
    {
      description: 'Training session completed - 45 employees',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      severity: 'low',
      accessibleTo: ['free', 'basic', 'pro', 'enterprise']
    },
    {
      description: 'Emergency drill conducted successfully',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      severity: 'low',
      accessibleTo: ['basic', 'pro', 'enterprise']
    },
    {
      description: 'Advanced analytics report generated',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      severity: 'info',
      accessibleTo: ['pro', 'enterprise']
    },
    {
      description: 'Predictive risk assessment completed',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      severity: 'info',
      accessibleTo: ['pro', 'enterprise']
    },
    {
      description: 'API integration successfully configured',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      severity: 'info',
      accessibleTo: ['enterprise']
    }
  ]
};

// Helper function to get user's plan
const getUserPlan = () => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      return parsed.plan || 'free';
    } catch (e) {
      return 'free';
    }
  }
  return 'free';
};

// Helper function to check if user can access industry
const canAccessIndustry = (industryId, userPlan = null) => {
  const plan = userPlan || getUserPlan();
  
  if (planIndustryAccess[plan] === 'all') {
    return true;
  }
  
  if (Array.isArray(planIndustryAccess[plan])) {
    return planIndustryAccess[plan].includes(industryId);
  }
  
  return false;
};

// Helper function to get filtered activities for plan
const getFilteredActivities = (plan, limit = 10) => {
  return mockDashboardData.recent_activities
    .filter(activity => activity.accessibleTo.includes(plan))
    .slice(0, limit);
};

// Helper function to get dashboard data for plan
const getDashboardDataForPlan = (plan) => {
  return mockDashboardData[plan] || mockDashboardData.free;
};

// Industry Configuration API with plan-aware fallback
export const industryConfigAPI = {
  // Get all available industries for user's plan
  getIndustries: async (userPlan = null) => {
    const plan = userPlan || getUserPlan();
    
    try {
      const response = await apiClient.get('/hse/industries');
      // Filter industries based on plan if needed
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        // Return mock data filtered by plan
        const filteredIndustries = mockIndustries.filter(industry => 
          canAccessIndustry(industry.id, plan)
        );
        return { data: filteredIndustries };
      }
      throw error;
    }
  },

  // Get specific industry configuration with plan check
  getIndustryConfig: async (industryId, userPlan = null) => {
    const plan = userPlan || getUserPlan();
    
    // Check if user can access this industry
    if (!canAccessIndustry(industryId, plan)) {
      throw {
        code: 'INDUSTRY_ACCESS_DENIED',
        message: `Access to ${industryId} requires ${planIndustryAccess.basic ? 'Basic+' : 'Pro+'} plan`,
        upgradeRequired: true,
        requiredPlan: 'pro',
        availableIndustries: planIndustryAccess[plan]
      };
    }

    try {
      const response = await apiClient.get(`/hse/industries/${industryId}`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        // Return mock data if endpoint doesn't exist
        const industry = mockIndustries.find(ind => ind.id === industryId) || mockIndustries[0];
        return { data: industry };
      }
      throw error;
    }
  },

  // Update industry preferences with plan check
  updateIndustryPreferences: async (industryId, preferences, userPlan = null) => {
    const plan = userPlan || getUserPlan();
    
    // Check if user can access this industry
    if (!canAccessIndustry(industryId, plan)) {
      throw {
        code: 'INDUSTRY_ACCESS_DENIED',
        message: `Cannot update preferences for ${industryId} with current plan`,
        upgradeRequired: true,
        requiredPlan: 'basic'
      };
    }

    try {
      return await apiClient.put(`/hse/industries/${industryId}/preferences`, preferences);
    } catch (error) {
      throw error;
    }
  },

  // Get industry tools with plan-aware API call
  getIndustryTools: async (industryId, userPlan = null) => {
    const plan = userPlan || getUserPlan();
    
    return await planAwareApiCall(`/hse/industries/${industryId}/tools`, {}, {
      requiredPlan: 'basic',
      fallbackPlan: 'free',
      userPlan: plan,
      fallbackMessage: 'Industry tools require Basic plan or higher. Please upgrade.'
    });
  },

  // Get industry analytics with plan check
  getIndustryAnalytics: async (industryId, timeframe = '30d', userPlan = null) => {
    const plan = userPlan || getUserPlan();
    
    // Check for analytics feature access
    if (!planFeatures[plan]?.analytics) {
      throw {
        code: 'FEATURE_UNAVAILABLE',
        message: 'Advanced analytics require Pro plan or higher',
        upgradeRequired: true,
        requiredPlan: 'pro'
      };
    }

    try {
      const response = await apiClient.get(`/hse/industries/${industryId}/analytics`, {
        params: { timeframe }
      });
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        // Return mock analytics data based on plan
        const baseData = getDashboardDataForPlan(plan);
        return { 
          data: {
            ...baseData.safety_metrics,
            timeframe: timeframe,
            plan_limited: plan === 'free' || plan === 'basic'
          }
        };
      }
      throw error;
    }
  },
};

// Dashboard API with plan-aware fallback
export const dashboardAPI = {
  // Get industry dashboard overview with plan-specific data
  getDashboardData: async (industryId, userPlan = null) => {
    const plan = userPlan || getUserPlan();
    
    // Check if user can access this industry
    if (!canAccessIndustry(industryId, plan)) {
      throw {
        code: 'INDUSTRY_ACCESS_DENIED',
        message: `Access to ${industryId} dashboard requires ${planIndustryAccess.basic ? 'Basic+' : 'Pro+'} plan`,
        upgradeRequired: true,
        requiredPlan: planIndustryAccess.basic ? 'basic' : 'pro'
      };
    }

    try {
      const response = await apiClient.get(`/hse/industries/${industryId}/dashboard`);
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        // Return mock data if endpoint doesn't exist
        const dashboardData = getDashboardDataForPlan(plan);
        return { 
          data: {
            ...dashboardData,
            industryId: industryId,
            userPlan: plan,
            planFeatures: planFeatures[plan]
          }
        };
      }
      throw error;
    }
  },

  // Get basic safety metrics with plan limits
  getSafetyMetrics: async (industryId, timeframe = '30d', userPlan = null) => {
    const plan = userPlan || getUserPlan();
    
    try {
      const response = await apiClient.get(`/hse/industries/${industryId}/metrics`, {
        params: { timeframe }
      });
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        // Return mock data if endpoint doesn't exist
        const dashboardData = getDashboardDataForPlan(plan);
        return { 
          data: {
            ...dashboardData.safety_metrics,
            timeframe: timeframe,
            plan_limited: !planFeatures[plan]?.analytics,
            upgrade_message: planFeatures[plan]?.analytics ? null : 'Upgrade to Pro for full analytics'
          }
        };
      }
      throw error;
    }
  },

  // Get recent activities filtered by plan
  getRecentActivities: async (industryId, limit = 10, userPlan = null) => {
    const plan = userPlan || getUserPlan();
    
    try {
      const response = await apiClient.get(`/hse/industries/${industryId}/recent-activities`, {
        params: { limit }
      });
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        // Return mock data filtered by plan
        const filteredActivities = getFilteredActivities(plan, limit);
        return { 
          data: filteredActivities.map(activity => ({
            ...activity,
            plan_restricted: plan === 'free' && activity.accessibleTo.length > 0 && !activity.accessibleTo.includes('free')
          }))
        };
      }
      throw error;
    }
  },

  // Get advanced analytics (Pro+ only)
  getAdvancedAnalytics: async (industryId, options = {}, userPlan = null) => {
    const plan = userPlan || getUserPlan();
    
    return await planAwareApiCall(`/hse/industries/${industryId}/advanced-analytics`, options, {
      requiredPlan: 'pro',
      fallbackPlan: 'basic',
      userPlan: plan,
      fallbackMessage: 'Advanced analytics require Pro plan. Please upgrade to access predictive analytics and custom reports.'
    });
  },

  // Get custom dashboards (Pro+ only)
  getCustomDashboards: async (industryId, userPlan = null) => {
    const plan = userPlan || getUserPlan();
    
    return await planAwareApiCall(`/hse/industries/${industryId}/custom-dashboards`, {}, {
      requiredPlan: 'pro',
      fallbackPlan: 'basic',
      userPlan: plan,
      fallbackMessage: 'Custom dashboards require Pro plan. Please upgrade to create and save custom dashboard views.'
    });
  },
};

// Main HSE Industry Service class with plan awareness
class HSEIndustryService {
  constructor(userPlan = null) {
    this.userPlan = userPlan || getUserPlan();
  }

  /**
   * Get industry tools with plan access check
   */
  async getIndustryTools(industryId) {
    // Check plan access
    if (!canAccessFeature('basic', this.userPlan)) {
      throw { 
        code: 'UPGRADE_REQUIRED', 
        message: 'Basic plan required for industry tools',
        upgradeRequired: true,
        requiredPlan: 'basic',
        availableFeatures: planFeatures[this.userPlan]
      };
    }
    
    try {
      const response = await apiClient.get(`/hse/industries/${industryId}/tools`);
      return response.data;
    } catch (error) {
      // Fallback to mock data
      const industry = mockIndustries.find(ind => ind.id === industryId);
      return {
        tools: industry?.features || [],
        plan: this.userPlan,
        limited: this.userPlan === 'basic',
        upgradeAvailable: this.userPlan !== 'enterprise'
      };
    }
  }

  /**
   * Check if user can access specific industry feature
   */
  canAccessIndustryFeature(industryId, feature) {
    const industry = mockIndustries.find(ind => ind.id === industryId);
    if (!industry) return false;
    
    const featureAccess = industry.planFeatures[this.userPlan];
    return featureAccess && featureAccess.includes(feature);
  }

  /**
   * Get available industries for current plan
   */
  async getAvailableIndustries() {
    return await industryConfigAPI.getIndustries(this.userPlan);
  }

  /**
   * Get industry configuration with plan check
   */
  async getIndustryConfig(industryId) {
    return await industryConfigAPI.getIndustryConfig(industryId, this.userPlan);
  }

  /**
   * Load complete industry dashboard with plan-aware data
   */
  async loadIndustryDashboard(industryId) {
    try {
      const [industryConfig, dashboardData, recentActivities] = await Promise.all([
        industryConfigAPI.getIndustryConfig(industryId, this.userPlan),
        dashboardAPI.getDashboardData(industryId, this.userPlan),
        dashboardAPI.getRecentActivities(industryId, 5, this.userPlan)
      ]);

      return {
        industry: industryConfig.data,
        dashboardData: dashboardData.data,
        recentActivities: recentActivities.data,
        userPlan: this.userPlan,
        planFeatures: planFeatures[this.userPlan]
      };
    } catch (error) {
      // Fallback to mock data if all API calls fail
      const industry = mockIndustries.find(ind => ind.id === industryId) || mockIndustries[0];
      const dashboardData = getDashboardDataForPlan(this.userPlan);
      const filteredActivities = getFilteredActivities(this.userPlan, 5);
      
      return {
        industry: industry,
        dashboardData: dashboardData,
        recentActivities: filteredActivities,
        userPlan: this.userPlan,
        planFeatures: planFeatures[this.userPlan],
        fallbackUsed: true
      };
    }
  }

  /**
   * Get plan-specific limitations
   */
  getPlanLimitations() {
    return {
      currentPlan: this.userPlan,
      industriesAvailable: planIndustryAccess[this.userPlan],
      features: planFeatures[this.userPlan],
      upgradePath: this.getUpgradePath()
    };
  }

  /**
   * Get upgrade path information
   */
  getUpgradePath() {
    const plans = ['free', 'basic', 'pro', 'enterprise'];
    const currentIndex = plans.indexOf(this.userPlan);
    
    if (currentIndex < plans.length - 1) {
      const nextPlan = plans[currentIndex + 1];
      return {
        nextPlan: nextPlan,
        benefits: this.getPlanBenefits(nextPlan),
        price: this.getPlanPrice(nextPlan)
      };
    }
    
    return null;
  }

  /**
   * Get benefits of a specific plan
   */
  getPlanBenefits(plan) {
    const benefits = {
      basic: [
        'Access to construction, manufacturing, and healthcare industries',
        'Basic analytics and reporting',
        'Industry-specific tools',
        'Up to 5 custom dashboards'
      ],
      pro: [
        'Access to all industries including oil & gas, mining, etc.',
        'Advanced analytics and predictive modeling',
        'Custom dashboards and reports',
        'API access for integration',
        'Priority support'
      ],
      enterprise: [
        'All Pro features plus',
        'Unlimited custom workflows',
        'White-label solutions',
        'Dedicated account manager',
        'Custom integration support',
        'SLA guarantees'
      ]
    };
    
    return benefits[plan] || [];
  }

  /**
   * Get plan price (mock data)
   */
  getPlanPrice(plan) {
    const prices = {
      basic: '$49/month',
      pro: '$149/month',
      enterprise: 'Custom pricing'
    };
    
    return prices[plan] || 'Free';
  }

  /**
   * Check if feature is available in current plan
   */
  isFeatureAvailable(feature) {
    return planFeatures[this.userPlan]?.[feature] || false;
  }

  /**
   * Get industries that require upgrade
   */
  getLockedIndustries() {
    return mockIndustries.filter(industry => 
      !canAccessIndustry(industry.id, this.userPlan)
    );
  }

  /**
   * Get accessible industries
   */
  getAccessibleIndustries() {
    return mockIndustries.filter(industry => 
      canAccessIndustry(industry.id, this.userPlan)
    );
  }

  /**
   * Set user plan (for testing or dynamic plan changes)
   */
  setUserPlan(plan) {
    if (['free', 'basic', 'pro', 'enterprise'].includes(plan)) {
      this.userPlan = plan;
    }
  }
}

// Export singleton instance
const hseIndustryService = new HSEIndustryService();

// Also export the class for custom instances
export { HSEIndustryService };

// Export individual APIs for backward compatibility


// Export helper functions
export { canAccessIndustry, getUserPlan };

// Export main service object with additional methods
export default {
  ...hseIndustryService,
  
  // Industry configuration
  industry: industryConfigAPI,
  
  // Dashboard data
  analytics: dashboardAPI,
  
  // Create new instance with specific plan
  createWithPlan: (plan) => new HSEIndustryService(plan)
};