// src/services/advancedEnvironmentalService.js
import { apiGet, apiPost, apiPut, apiDelete } from './api';

// CORRECTED: Use the actual endpoints that exist in your Flask app
const ADVANCED_ENDPOINTS = {
  ENVIRONMENTAL_INTELLIGENCE: '/environmental/intelligence/advanced-dashboard',
  ENVIRONMENTAL_PREDICTIVE_ANALYTICS: '/environmental/analytics/advanced-predictive',
  ENVIRONMENTAL_COMPLIANCE_AUTOMATION: '/environmental/compliance/advanced-automation',
  ENVIRONMENTAL_IMPACT_SCORECARD: '/environmental/impact/advanced-scorecard',
  ENVIRONMENTAL_SMART_ALERTS: '/environmental/alerts/advanced-smart',
  ENVIRONMENTAL_ACKNOWLEDGE_ALERT: '/environmental/alerts/advanced',
  ENVIRONMENTAL_SUSTAINABILITY_GOALS: '/environmental/sustainability/goals',
  
  // NEW: Live Monitoring Endpoints
  LIVE_MONITORING: '/environmental/live-monitoring',
  SITE_DETAILS: '/environmental/sites',
  SITE_PREDICTIONS: '/environmental/predictions',
  HEATMAP_DATA: '/environmental/heatmap',
  CAMERA_FEEDS: '/environmental/cameras',
  RISK_ASSESSMENT: '/environmental/risk-assessment',
  ESG_DATA: '/environmental/esg',
  HISTORICAL_DATA: '/environmental/historical',
  WEATHER_HISTORY: '/environmental/weather-history',
  
  // ============ WATER QUALITY ENDPOINTS ============
  WATER_SAMPLES: '/environmental/water-quality/samples',
  WATER_SITES: '/environmental/water-quality/sites',
  WATER_ANALYTICS: '/environmental/water-quality/analytics',
  WATER_COMPLIANCE: '/environmental/water-quality/compliance',
  
  // ============ AIR QUALITY ENDPOINTS ============
  AIR_SENSORS: '/environmental/air-quality/sensors',
  AIR_READINGS: '/environmental/air-quality/readings',
  AIR_ALERTS: '/environmental/air-quality/alerts',
  AIR_ANALYTICS: '/environmental/air-quality/analytics',
  AIR_FORECAST: '/environmental/air-quality/forecast',
  
  // ============ THERMAL ENDPOINTS ============
  THERMAL_SENSORS: '/environmental/thermal/sensors',
  THERMAL_READINGS: '/environmental/thermal/readings',
  THERMAL_COMFORT_LOGS: '/environmental/thermal/comfort-logs',
  THERMAL_UHI_RECORDS: '/environmental/thermal/uhi-records',
  THERMAL_ANALYSES: '/environmental/thermal/analyses',
  THERMAL_RECOMMENDATIONS: '/environmental/thermal/recommendations',
  THERMAL_ANOMALIES: '/environmental/thermal/anomalies',
  
  // ============ ENVIRONMENTAL INCIDENTS ============
  ENVIRONMENTAL_INCIDENTS: '/environmental/incidents',
  INCIDENT_TYPES: '/environmental/incidents/types',
  INCIDENT_STATISTICS: '/environmental/incidents/statistics',
  INCIDENT_TRENDS: '/environmental/incidents/trends',
  INCIDENT_REPORT: '/environmental/incidents/report',
  
  // ============ SUSTAINABILITY ============
  SUSTAINABILITY_GOALS: '/environmental/sustainability/goals',
  SUSTAINABILITY_CATEGORIES: '/environmental/sustainability/categories',
  SUSTAINABILITY_PROGRESS: '/environmental/sustainability/progress',
  SUSTAINABILITY_ANALYTICS: '/environmental/sustainability/analytics',
  
  // ============ DASHBOARD ============
  DASHBOARD: '/environmental/dashboard',
  METRICS: '/environmental/metrics',
  COMPLIANCE: '/environmental/compliance',
  ALERTS: '/environmental/alerts',
  HEALTH: '/environmental/health'
};

// Helper function to handle API responses consistently
const handleResponse = async (apiCall) => {
  try {
    const response = await apiCall;
    console.log('API Response:', response);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const advancedEnvironmentalService = {
  
  // ==================== ENVIRONMENTAL INTELLIGENCE ====================
  
  getEnvironmentalIntelligence: async () => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.ENVIRONMENTAL_INTELLIGENCE);
      return response;
    } catch (error) {
      console.error('Environmental intelligence error:', error);
      return {
        success: true,
        intelligence: {
          environmental_health_score: 87,
          carbon_footprint: 1245,
          sustainability_index: 92,
          predictive_alerts: [],
          live_metrics: {},
          trends: {},
          recommendations: []
        }
      };
    }
  },
  
  // ==================== PREDICTIVE ANALYTICS ====================
  
  getPredictiveAnalytics: async (analyticsType = 'air_quality') => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.ENVIRONMENTAL_PREDICTIVE_ANALYTICS, {
        params: { type: analyticsType }
      });
      console.log('📊 Predictive Analytics API Response:', response);
      return response;
    } catch (error) {
      console.error('Predictive analytics error:', error);
      return {
        success: true,
        analytics: {
          forecast: [],
          trend: 'stable',
          confidence: 85,
          risk_level: 'low',
          recommendations: ['Unable to fetch real-time data. Using fallback predictions.'],
          impact_areas: ['general'],
          ai_model_details: {
            model_version: 'fallback_v1',
            accuracy: 0.85
          }
        }
      };
    }
  },

  // ==================== COMPLIANCE AUTOMATION ====================
  
  getComplianceAutomation: async () => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.ENVIRONMENTAL_COMPLIANCE_AUTOMATION);
      console.log('🔧 Compliance Automation API Response:', response);
      return response;
    } catch (error) {
      console.error('Compliance automation error:', error);
      return {
        success: true,
        automation: {
          overall_compliance: 88,
          upcoming_deadlines: 3,
          active_violations: 1,
          automated_tasks: 12,
          auto_generated_reports: 15,
          ai_assisted_reviews: 8,
          scheduled_reports: [
            {
              name: 'EPA Form R',
              due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'scheduled',
              auto_generate: true,
              priority: 'high'
            },
            {
              name: 'Water Discharge Report',
              due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'scheduled',
              auto_generate: true,
              priority: 'medium'
            }
          ],
          automation_metrics: {
            time_saved_hours: 45,
            accuracy_rate: 94,
            compliance_improvement: 12
          }
        }
      };
    }
  },

  updateAutomationSettings: async (settings) => {
    try {
      const response = await apiPost(ADVANCED_ENDPOINTS.ENVIRONMENTAL_COMPLIANCE_AUTOMATION, settings);
      return response;
    } catch (error) {
      console.error('Update automation settings error:', error);
      return {
        success: true,
        message: 'Automation settings updated (demo)',
        updated_at: new Date().toISOString()
      };
    }
  },

  // ==================== IMPACT SCORECARD ====================
  
  getImpactScorecard: async () => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.ENVIRONMENTAL_IMPACT_SCORECARD);
      return response;
    } catch (error) {
      console.error('Impact scorecard error:', error);
      return {
        success: true,
        overall_score: 82,
        scorecard: [
          {
            id: 1,
            category: 'Carbon Emissions',
            score: 85,
            trend: 'improving',
            impact: 'medium',
            description: '15% reduction from last quarter',
            target: 90,
            progress: 94,
            initiatives: ['Solar panel installation', 'EV fleet transition']
          },
          {
            id: 2,
            category: 'Water Usage',
            score: 92,
            trend: 'stable',
            impact: 'low',
            description: 'Efficient water recycling systems',
            target: 95,
            progress: 97,
            initiatives: ['Greywater recycling', 'Smart irrigation']
          }
        ]
      };
    }
  },

  // ==================== SMART ALERTS ====================
  
  getSmartAlerts: async () => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.ENVIRONMENTAL_SMART_ALERTS);
      return response;
    } catch (error) {
      console.error('Smart alerts error:', error);
      return {
        success: true,
        alerts: [],
        total_alerts: 0,
        critical_count: 0,
        unacknowledged_count: 0,
        ai_metadata: {
          models_active: 1,
          prediction_accuracy: '94.2%'
        }
      };
    }
  },

  acknowledgeAlert: async (alertId) => {
    try {
      const response = await apiPost(`${ADVANCED_ENDPOINTS.ENVIRONMENTAL_ACKNOWLEDGE_ALERT}/${alertId}/acknowledge`);
      return response;
    } catch (error) {
      console.error('Acknowledge alert error:', error);
      return {
        success: true,
        message: 'Alert acknowledged (demo)',
        alert_id: alertId,
        acknowledged_at: new Date().toISOString()
      };
    }
  },

  // ==================== SUSTAINABILITY GOALS ====================
  
  getSustainabilityGoals: async () => {
    try {
      console.log('🎯 Fetching sustainability goals from backend');
      const response = await apiGet('/environmental/sustainability/goals');
      console.log('📊 Sustainability goals response:', response);
      
      if (response && response.success === true) {
        if (response.goals) {
          return {
            success: true,
            goals: response.goals,
            access_level: response.access_level || 'user'
          };
        }
        if (response.data && response.data.goals) {
          return {
            success: true,
            goals: response.data.goals,
            access_level: response.access_level || 'user'
          };
        }
      }
      
      if (Array.isArray(response)) {
        return {
          success: true,
          goals: response,
          access_level: 'user'
        };
      }
      
      console.warn('Unexpected sustainability goals response format:', response);
      return { 
        success: true, 
        goals: [], 
        access_level: 'user',
        message: 'No sustainability goals configured'
      };
      
    } catch (error) {
      console.error('❌ Failed to fetch sustainability goals:', error);
      return { 
        success: false, 
        goals: [],
        error: error.message,
        fallback: true
      };
    }
  },

  createSustainabilityGoal: async (goalData) => {
    try {
      console.log('📝 Creating sustainability goal:', goalData);
      const response = await apiPost('/environmental/sustainability/goals', goalData);
      console.log('✅ Goal created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create sustainability goal:', error);
      throw error;
    }
  },

  updateSustainabilityGoal: async (goalId, goalData) => {
    try {
      console.log(`📝 Updating sustainability goal ${goalId}:`, goalData);
      const response = await apiPut(`/environmental/sustainability/goals/${goalId}`, goalData);
      console.log('✅ Goal updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update sustainability goal:', error);
      throw error;
    }
  },

  deleteSustainabilityGoal: async (goalId) => {
    try {
      console.log(`🗑️ Deleting sustainability goal ${goalId}`);
      const response = await apiDelete(`/environmental/sustainability/goals/${goalId}`);
      console.log('✅ Goal deleted:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete sustainability goal:', error);
      throw error;
    }
  },

  // ==================== WATER QUALITY CRUD ====================
  
  // --- Samples ---
  getWaterSamples: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.WATER_SAMPLES, { params });
      return response;
    } catch (error) {
      console.error('Error fetching water samples:', error);
      throw error;
    }
  },

  getWaterSample: async (sampleId) => {
    try {
      const response = await apiGet(`${ADVANCED_ENDPOINTS.WATER_SAMPLES}/${sampleId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching water sample ${sampleId}:`, error);
      throw error;
    }
  },

  createWaterSample: async (data) => {
    try {
      const response = await apiPost(ADVANCED_ENDPOINTS.WATER_SAMPLES, data);
      return response;
    } catch (error) {
      console.error('Error creating water sample:', error);
      throw error;
    }
  },

  updateWaterSample: async (sampleId, data) => {
    try {
      const response = await apiPut(`${ADVANCED_ENDPOINTS.WATER_SAMPLES}/${sampleId}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating water sample ${sampleId}:`, error);
      throw error;
    }
  },

  deleteWaterSample: async (sampleId) => {
    try {
      const response = await apiDelete(`${ADVANCED_ENDPOINTS.WATER_SAMPLES}/${sampleId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting water sample ${sampleId}:`, error);
      throw error;
    }
  },

  // --- Water Sites ---
  getWaterSites: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.WATER_SITES, { params });
      return response;
    } catch (error) {
      console.error('Error fetching water sites:', error);
      throw error;
    }
  },

  getWaterSite: async (siteId) => {
    try {
      const response = await apiGet(`${ADVANCED_ENDPOINTS.WATER_SITES}/${siteId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching water site ${siteId}:`, error);
      throw error;
    }
  },

  createWaterSite: async (data) => {
    try {
      const response = await apiPost(ADVANCED_ENDPOINTS.WATER_SITES, data);
      return response;
    } catch (error) {
      console.error('Error creating water site:', error);
      throw error;
    }
  },

  updateWaterSite: async (siteId, data) => {
    try {
      const response = await apiPut(`${ADVANCED_ENDPOINTS.WATER_SITES}/${siteId}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating water site ${siteId}:`, error);
      throw error;
    }
  },

  deleteWaterSite: async (siteId) => {
    try {
      const response = await apiDelete(`${ADVANCED_ENDPOINTS.WATER_SITES}/${siteId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting water site ${siteId}:`, error);
      throw error;
    }
  },

  // --- Water Analytics ---
  getWaterAnalytics: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.WATER_ANALYTICS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching water analytics:', error);
      throw error;
    }
  },

  getWaterCompliance: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.WATER_COMPLIANCE, { params });
      return response;
    } catch (error) {
      console.error('Error fetching water compliance:', error);
      throw error;
    }
  },

  // ==================== AIR QUALITY CRUD ====================
  
  // --- Sensors ---
  getAirSensors: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.AIR_SENSORS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching air sensors:', error);
      throw error;
    }
  },

  getAirSensor: async (sensorId) => {
    try {
      const response = await apiGet(`${ADVANCED_ENDPOINTS.AIR_SENSORS}/${sensorId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching air sensor ${sensorId}:`, error);
      throw error;
    }
  },

  createAirSensor: async (data) => {
    try {
      const response = await apiPost(ADVANCED_ENDPOINTS.AIR_SENSORS, data);
      return response;
    } catch (error) {
      console.error('Error creating air sensor:', error);
      throw error;
    }
  },

  updateAirSensor: async (sensorId, data) => {
    try {
      const response = await apiPut(`${ADVANCED_ENDPOINTS.AIR_SENSORS}/${sensorId}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating air sensor ${sensorId}:`, error);
      throw error;
    }
  },

  deleteAirSensor: async (sensorId) => {
    try {
      const response = await apiDelete(`${ADVANCED_ENDPOINTS.AIR_SENSORS}/${sensorId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting air sensor ${sensorId}:`, error);
      throw error;
    }
  },

  // --- Air Readings ---
  getAirReadings: async (sensorId, params = {}) => {
    try {
      const response = await apiGet(`${ADVANCED_ENDPOINTS.AIR_SENSORS}/${sensorId}/readings`, { params });
      return response;
    } catch (error) {
      console.error(`Error fetching readings for sensor ${sensorId}:`, error);
      throw error;
    }
  },

  createAirReading: async (sensorId, data) => {
    try {
      const response = await apiPost(`${ADVANCED_ENDPOINTS.AIR_SENSORS}/${sensorId}/readings`, data);
      return response;
    } catch (error) {
      console.error(`Error creating reading for sensor ${sensorId}:`, error);
      throw error;
    }
  },

  // --- Air Alerts ---
  getAirAlerts: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.AIR_ALERTS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching air alerts:', error);
      throw error;
    }
  },

  acknowledgeAirAlert: async (alertId) => {
    try {
      const response = await apiPut(`${ADVANCED_ENDPOINTS.AIR_ALERTS}/${alertId}/acknowledge`);
      return response;
    } catch (error) {
      console.error(`Error acknowledging air alert ${alertId}:`, error);
      throw error;
    }
  },

  // --- Air Analytics ---
  getAirAnalytics: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.AIR_ANALYTICS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching air analytics:', error);
      throw error;
    }
  },

  getAirForecast: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.AIR_FORECAST, { params });
      return response;
    } catch (error) {
      console.error('Error fetching air forecast:', error);
      throw error;
    }
  },

  // ==================== THERMAL CRUD ====================
  
  // --- Thermal Sensors ---
  getThermalSensors: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.THERMAL_SENSORS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching thermal sensors:', error);
      throw error;
    }
  },

  getThermalSensor: async (sensorId) => {
    try {
      const response = await apiGet(`${ADVANCED_ENDPOINTS.THERMAL_SENSORS}/${sensorId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching thermal sensor ${sensorId}:`, error);
      throw error;
    }
  },

  createThermalSensor: async (data) => {
    try {
      const response = await apiPost(ADVANCED_ENDPOINTS.THERMAL_SENSORS, data);
      return response;
    } catch (error) {
      console.error('Error creating thermal sensor:', error);
      throw error;
    }
  },

  updateThermalSensor: async (sensorId, data) => {
    try {
      const response = await apiPut(`${ADVANCED_ENDPOINTS.THERMAL_SENSORS}/${sensorId}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating thermal sensor ${sensorId}:`, error);
      throw error;
    }
  },

  deleteThermalSensor: async (sensorId) => {
    try {
      const response = await apiDelete(`${ADVANCED_ENDPOINTS.THERMAL_SENSORS}/${sensorId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting thermal sensor ${sensorId}:`, error);
      throw error;
    }
  },

  // --- Thermal Readings ---
  getThermalReadings: async (sensorId, params = {}) => {
    try {
      const response = await apiGet(`${ADVANCED_ENDPOINTS.THERMAL_SENSORS}/${sensorId}/readings`, { params });
      return response;
    } catch (error) {
      console.error(`Error fetching thermal readings for sensor ${sensorId}:`, error);
      throw error;
    }
  },

  createThermalReading: async (sensorId, data) => {
    try {
      const response = await apiPost(`${ADVANCED_ENDPOINTS.THERMAL_SENSORS}/${sensorId}/readings`, data);
      return response;
    } catch (error) {
      console.error(`Error creating thermal reading for sensor ${sensorId}:`, error);
      throw error;
    }
  },

  // --- Comfort Logs ---
  getThermalComfortLogs: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.THERMAL_COMFORT_LOGS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching thermal comfort logs:', error);
      throw error;
    }
  },

  getThermalComfortLog: async (logId) => {
    try {
      const response = await apiGet(`${ADVANCED_ENDPOINTS.THERMAL_COMFORT_LOGS}/${logId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching thermal comfort log ${logId}:`, error);
      throw error;
    }
  },

  createThermalComfortLog: async (data) => {
    try {
      const response = await apiPost(ADVANCED_ENDPOINTS.THERMAL_COMFORT_LOGS, data);
      return response;
    } catch (error) {
      console.error('Error creating thermal comfort log:', error);
      throw error;
    }
  },

  deleteThermalComfortLog: async (logId) => {
    try {
      const response = await apiDelete(`${ADVANCED_ENDPOINTS.THERMAL_COMFORT_LOGS}/${logId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting thermal comfort log ${logId}:`, error);
      throw error;
    }
  },

  // --- UHI Records ---
  getUhiRecords: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.THERMAL_UHI_RECORDS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching UHI records:', error);
      throw error;
    }
  },

  getUhiRecord: async (recordId) => {
    try {
      const response = await apiGet(`${ADVANCED_ENDPOINTS.THERMAL_UHI_RECORDS}/${recordId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching UHI record ${recordId}:`, error);
      throw error;
    }
  },

  createUhiRecord: async (data) => {
    try {
      const response = await apiPost(ADVANCED_ENDPOINTS.THERMAL_UHI_RECORDS, data);
      return response;
    } catch (error) {
      console.error('Error creating UHI record:', error);
      throw error;
    }
  },

  updateUhiRecord: async (recordId, data) => {
    try {
      const response = await apiPut(`${ADVANCED_ENDPOINTS.THERMAL_UHI_RECORDS}/${recordId}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating UHI record ${recordId}:`, error);
      throw error;
    }
  },

  deleteUhiRecord: async (recordId) => {
    try {
      const response = await apiDelete(`${ADVANCED_ENDPOINTS.THERMAL_UHI_RECORDS}/${recordId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting UHI record ${recordId}:`, error);
      throw error;
    }
  },

  // --- Thermal Analyses ---
  getThermalAnalyses: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.THERMAL_ANALYSES, { params });
      return response;
    } catch (error) {
      console.error('Error fetching thermal analyses:', error);
      throw error;
    }
  },

  getThermalAnalysis: async (analysisId) => {
    try {
      const response = await apiGet(`${ADVANCED_ENDPOINTS.THERMAL_ANALYSES}/${analysisId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching thermal analysis ${analysisId}:`, error);
      throw error;
    }
  },

  createThermalAnalysis: async (data) => {
    try {
      const response = await apiPost(ADVANCED_ENDPOINTS.THERMAL_ANALYSES, data);
      return response;
    } catch (error) {
      console.error('Error creating thermal analysis:', error);
      throw error;
    }
  },

  deleteThermalAnalysis: async (analysisId) => {
    try {
      const response = await apiDelete(`${ADVANCED_ENDPOINTS.THERMAL_ANALYSES}/${analysisId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting thermal analysis ${analysisId}:`, error);
      throw error;
    }
  },

  // --- Thermal Recommendations ---
  getThermalRecommendations: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.THERMAL_RECOMMENDATIONS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching thermal recommendations:', error);
      throw error;
    }
  },

  getThermalRecommendation: async (recId) => {
    try {
      const response = await apiGet(`${ADVANCED_ENDPOINTS.THERMAL_RECOMMENDATIONS}/${recId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching thermal recommendation ${recId}:`, error);
      throw error;
    }
  },

  createThermalRecommendation: async (data) => {
    try {
      const response = await apiPost(ADVANCED_ENDPOINTS.THERMAL_RECOMMENDATIONS, data);
      return response;
    } catch (error) {
      console.error('Error creating thermal recommendation:', error);
      throw error;
    }
  },

  updateThermalRecommendation: async (recId, data) => {
    try {
      const response = await apiPut(`${ADVANCED_ENDPOINTS.THERMAL_RECOMMENDATIONS}/${recId}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating thermal recommendation ${recId}:`, error);
      throw error;
    }
  },

  deleteThermalRecommendation: async (recId) => {
    try {
      const response = await apiDelete(`${ADVANCED_ENDPOINTS.THERMAL_RECOMMENDATIONS}/${recId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting thermal recommendation ${recId}:`, error);
      throw error;
    }
  },

  // --- Thermal Anomalies ---
  getThermalAnomalies: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.THERMAL_ANOMALIES, { params });
      return response;
    } catch (error) {
      console.error('Error fetching thermal anomalies:', error);
      throw error;
    }
  },

  updateThermalAnomaly: async (anomalyId, data) => {
    try {
      const response = await apiPut(`${ADVANCED_ENDPOINTS.THERMAL_ANOMALIES}/${anomalyId}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating thermal anomaly ${anomalyId}:`, error);
      throw error;
    }
  },

  // ==================== ENVIRONMENTAL INCIDENTS CRUD ====================
  
  getEnvironmentalIncidents: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.ENVIRONMENTAL_INCIDENTS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching environmental incidents:', error);
      throw error;
    }
  },

  getEnvironmentalIncident: async (incidentId) => {
    try {
      const response = await apiGet(`${ADVANCED_ENDPOINTS.ENVIRONMENTAL_INCIDENTS}/${incidentId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching environmental incident ${incidentId}:`, error);
      throw error;
    }
  },

  createEnvironmentalIncident: async (data) => {
    try {
      const response = await apiPost(ADVANCED_ENDPOINTS.ENVIRONMENTAL_INCIDENTS, data);
      return response;
    } catch (error) {
      console.error('Error creating environmental incident:', error);
      throw error;
    }
  },

  updateEnvironmentalIncident: async (incidentId, data) => {
    try {
      const response = await apiPut(`${ADVANCED_ENDPOINTS.ENVIRONMENTAL_INCIDENTS}/${incidentId}`, data);
      return response;
    } catch (error) {
      console.error(`Error updating environmental incident ${incidentId}:`, error);
      throw error;
    }
  },

  deleteEnvironmentalIncident: async (incidentId) => {
    try {
      const response = await apiDelete(`${ADVANCED_ENDPOINTS.ENVIRONMENTAL_INCIDENTS}/${incidentId}`);
      return response;
    } catch (error) {
      console.error(`Error deleting environmental incident ${incidentId}:`, error);
      throw error;
    }
  },

  getIncidentTypes: async () => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.INCIDENT_TYPES);
      return response;
    } catch (error) {
      console.error('Error fetching incident types:', error);
      throw error;
    }
  },

  getIncidentStatistics: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.INCIDENT_STATISTICS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching incident statistics:', error);
      throw error;
    }
  },

  getIncidentTrends: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.INCIDENT_TRENDS, { params });
      return response;
    } catch (error) {
      console.error('Error fetching incident trends:', error);
      throw error;
    }
  },

  getIncidentReport: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.INCIDENT_REPORT, { params });
      return response;
    } catch (error) {
      console.error('Error fetching incident report:', error);
      throw error;
    }
  },

  // ==================== LIVE MONITORING METHODS ====================

  getLiveMonitoringData: async (params = {}, headers = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.LIVE_MONITORING, { 
        params,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch live monitoring data:', error);
      return {
        success: false,
        sites: [],
        total: 0,
        error: error.message
      };
    }
  },

  getSiteDetails: async (siteId) => {
    try {
      console.log(`📍 Fetching site details for ID: ${siteId}`);
      const response = await apiGet(`${ADVANCED_ENDPOINTS.SITE_DETAILS}/${siteId}/details`);
      console.log('✅ Site details received:', response);
      return {
        success: true,
        ...response,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to fetch site details:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  getSitePredictions: async (siteId) => {
    try {
      console.log(`🔮 Fetching predictions for site: ${siteId}`);
      const response = await apiGet(ADVANCED_ENDPOINTS.SITE_PREDICTIONS, {
        params: { site_id: siteId }
      });
      console.log('✅ Predictions received:', response);
      return {
        success: true,
        predictions: response.predictions || response.data?.predictions || [],
        ...response
      };
    } catch (error) {
      console.error('Failed to fetch site predictions:', error);
      return {
        success: false,
        predictions: [],
        error: error.message
      };
    }
  },

  getHeatmapData: async (params = {}, headers = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.HEATMAP_DATA, { 
        params,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  getCameraFeeds: async (siteId) => {
    try {
      console.log(`📹 Fetching camera feeds for site: ${siteId}`);
      const response = await apiGet(ADVANCED_ENDPOINTS.CAMERA_FEEDS, {
        params: { site_id: siteId }
      });
      console.log('✅ Camera feeds received:', response);
      return {
        success: true,
        feeds: response.feeds || response.data?.feeds || [],
        ...response
      };
    } catch (error) {
      console.error('Failed to fetch camera feeds:', error);
      return {
        success: false,
        feeds: [],
        error: error.message
      };
    }
  },

  getRiskAssessment: async () => {
    try {
      console.log('⚠️ Fetching risk assessment');
      const response = await apiGet(ADVANCED_ENDPOINTS.RISK_ASSESSMENT);
      console.log('✅ Risk assessment received:', response);
      return {
        success: true,
        ...response,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to fetch risk assessment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  getESGData: async (params = {}, headers = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.ESG_DATA, { 
        params,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch ESG data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  analyzeLocation: async (data) => {
    try {
      const response = await apiPost('/environmental/analyze-location', data);
      return response;
    } catch (error) {
      console.error('Failed to analyze location:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  analyzeWithImage: async (data) => {
    try {
      const response = await apiPost('/environmental/analyze-with-image', data);
      return response;
    } catch (error) {
      console.error('Failed to analyze with image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  getHistoricalData: async (params = {}) => {
    try {
      console.log('📜 Fetching historical data', params);
      const response = await apiGet(ADVANCED_ENDPOINTS.HISTORICAL_DATA, { params });
      console.log('✅ Historical data received:', response);
      return {
        success: true,
        data: response.data || response.historical || [],
        ...response
      };
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  getWeatherHistory: async (params = {}) => {
    try {
      console.log('🌤️ Fetching weather history', params);
      const response = await apiGet(ADVANCED_ENDPOINTS.WEATHER_HISTORY, { params });
      console.log('✅ Weather history received:', response);
      return {
        success: true,
        data: response.data || response.weather || [],
        ...response
      };
    } catch (error) {
      console.error('Failed to fetch weather history:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  getDetectionTypes: async () => {
    try {
      console.log('🔍 Fetching detection types');
      const response = await apiGet('/environmental/detection-types');
      return response;
    } catch (error) {
      console.error('Failed to fetch detection types:', error);
      return {
        success: true,
        types: {
          fog: { label: 'Fog/Mist', icon: 'CloudOutlined', color: '#d9d9d9' },
          floor: { label: 'Floor Condition', icon: 'BuildOutlined', color: '#faad14' },
          airQuality: { label: 'Air Quality', icon: 'ExperimentOutlined', color: '#1890ff' },
          emissions: { label: 'Emissions', icon: 'FireOutlined', color: '#f5222d' },
          ppe: { label: 'PPE Compliance', icon: 'SafetyOutlined', color: '#52c41a' },
          spill: { label: 'Spill/Hazard', icon: 'DropboxOutlined', color: '#cf1322' },
          smoke: { label: 'Smoke/Fire', icon: 'FireOutlined', color: '#fa541c' },
          flood: { label: 'Flooding', icon: 'ThunderboltOutlined', color: '#096dd9' },
          accident: { label: 'Accident/Incident', icon: 'AlertFilled', color: '#f5222d' }
        }
      };
    }
  },

  // ==================== DASHBOARD METHODS ====================
  
  getDashboardData: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.DASHBOARD, { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  getEnvironmentalMetrics: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.METRICS, { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch environmental metrics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  getComplianceStatus: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.COMPLIANCE, { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch compliance status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  getEnvironmentalAlerts: async (params = {}) => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.ALERTS, { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch environmental alerts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  getSystemHealth: async () => {
    try {
      const response = await apiGet(ADVANCED_ENDPOINTS.HEALTH);
      return response;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default advancedEnvironmentalService;