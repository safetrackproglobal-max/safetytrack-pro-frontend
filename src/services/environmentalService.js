// services/environmentalService.js
import api from './api';

// Use consistent variable name
const ENVIRONMENTAL_BASE = '/environmental';

// Environmental Monitoring Service - Production Ready
export const environmentalService = {
  // === CORE ENVIRONMENTAL DATA ===
  
  // In environmentalService.js

getSensors: async (timeframe = '24h') => {
  try {
    const response = await api.get(`${ENVIRONMENTAL_BASE}/air-quality/sensors`, {
      params: { timeframe }
    });
    
    console.log('📥 getSensors response:', response);
    
    // ✅ Extract the sensors array from the response
    if (response.data && response.data.sensors) {
      return response.data.sensors;  // Return array only
    }
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching sensors:', error);
    return [];
  }
},

getWaterSamples: async (timeframe = '24h') => {
  try {
    const response = await api.get(`${ENVIRONMENTAL_BASE}/water-quality/samples`, {
      params: { timeframe }
    });
    
    if (response.data && response.data.samples) {
      return response.data.samples;
    }
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching water samples:', error);
    return [];
  }
},

getEnvironmentalIncidents: async (status = null) => {
  try {
    const params = {};
    if (status) params.status = status;
    const response = await api.get(`${ENVIRONMENTAL_BASE}/incidents`, { params });
    
    console.log('📥 getEnvironmentalIncidents raw response:', response);
    
    // ✅ Extract the incidents array from the response
    if (response.data && response.data.incidents) {
      return response.data.incidents;  // Return just the array
    }
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching environmental incidents:', error);
    return [];
  }
},

getSustainabilityGoals: async () => {
  try {
    const response = await api.get(`${ENVIRONMENTAL_BASE}/sustainability/goals`);
    
    if (response.data && response.data.goals) {
      return response.data.goals;
    }
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching sustainability goals:', error);
    return [];
  }
},

getComplianceReports: async () => {
  try {
    const response = await api.get(`${ENVIRONMENTAL_BASE}/compliance/reports`);
    
    if (response.data && response.data.reports) {
      return response.data.reports;
    }
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching compliance reports:', error);
    return [];
  }
},

getSmartAlerts: async () => {
  try {
    const response = await api.get(`${ENVIRONMENTAL_BASE}/alerts/advanced-smart`);
    
    if (response.data && response.data.alerts) {
      return response.data.alerts;
    }
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching smart alerts:', error);
    return [];
  }
},

getEnvironmentalIntelligence: async () => {
  try {
    const response = await api.get(`${ENVIRONMENTAL_BASE}/intelligence/advanced-dashboard`);
    
    if (response.data && response.data.intelligence) {
      return response.data.intelligence;
    }
    
    return response.data || {};
  } catch (error) {
    console.error('Error fetching environmental intelligence:', error);
    return {};
  }
},

  getPredictiveAnalytics: async (analyticsType = 'air_quality') => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/analytics/advanced-predictive`, {
        params: { type: analyticsType }
      });
      return response.data?.analytics || response.data || {};
    } catch (error) {
      console.error('Error fetching predictive analytics:', error);
      return {
        forecast: [],
        trend: 'unknown',
        confidence: 0,
        recommendations: [],
        risk_level: 'unknown',
        impact_areas: []
      };
    }
  },

  getComplianceAutomation: async () => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/compliance/advanced-automation`);
      return response.data?.automation || response.data || {};
    } catch (error) {
      console.error('Error fetching compliance automation:', error);
      return {
        overall_compliance: 0,
        upcoming_deadlines: 0,
        active_violations: 0,
        automated_tasks: 0,
        ai_assisted_reviews: 0,
        auto_generated_reports: 0,
        scheduled_reports: [],
        automation_metrics: {
          time_saved_hours: 0,
          accuracy_rate: 0,
          compliance_improvement: 0
        }
      };
    }
  },

  updateAutomationSettings: async (settings) => {
    try {
      const response = await api.post(`${ENVIRONMENTAL_BASE}/compliance/advanced-automation`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating automation settings:', error);
      throw error;
    }
  },

  getImpactScorecard: async () => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/impact/advanced-scorecard`);
      return response.data?.scorecard || response.data || [];
    } catch (error) {
      console.error('Error fetching impact scorecard:', error);
      return [];
    }
  },

  getSmartAlerts: async () => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/alerts/advanced-smart`);
      return response.data?.alerts || response.data || [];
    } catch (error) {
      console.error('Error fetching smart alerts:', error);
      return [];
    }
  },

  acknowledgeAlert: async (alertId) => {
    try {
      const response = await api.post(`${ENVIRONMENTAL_BASE}/alerts/advanced/${alertId}/acknowledge`);
      return response.data;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  },

  // === CREATE/UPDATE OPERATIONS ===

  createSensor: async (sensorData) => {
    try {
      const response = await api.post(`${ENVIRONMENTAL_BASE}/air-quality/sensors`, sensorData);
      return response.data;
    } catch (error) {
      console.error('Error creating sensor:', error);
      throw error;
    }
  },

  updateSensor: async (sensorId, updates) => {
    try {
      const response = await api.put(`${ENVIRONMENTAL_BASE}/air-quality/sensors/${sensorId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating sensor:', error);
      throw error;
    }
  },

  deleteSensor: async (sensorId) => {
    try {
      const response = await api.delete(`${ENVIRONMENTAL_BASE}/air-quality/sensors/${sensorId}`);
      return response.data || { success: true };
    } catch (error) {
      console.error('Error deleting sensor:', error);
      throw error;
    }
  },

  createWaterSample: async (sampleData) => {
    try {
      const response = await api.post(`${ENVIRONMENTAL_BASE}/water-quality/samples`, sampleData);
      return response.data;
    } catch (error) {
      console.error('Error creating water sample:', error);
      throw error;
    }
  },

  reportIncident: async (incidentData) => {
    try {
      const response = await api.post(`${ENVIRONMENTAL_BASE}/incidents`, incidentData);
      return response.data;
    } catch (error) {
      console.error('Error reporting incident:', error);
      throw error;
    }
  },

  // === ADDED INCIDENT MANAGEMENT METHODS ===

  getIncidentTypes: async () => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/incidents/types`);
      if (response.data && response.data.types) {
        return response.data.types;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return ['Spill', 'Emission', 'Waste', 'Chemical Release', 'Air Quality', 'Water Quality', 'Noise', 'Other'];
    } catch (error) {
      console.error('Error fetching incident types:', error);
      return ['Spill', 'Emission', 'Waste', 'Chemical Release', 'Air Quality', 'Water Quality', 'Noise', 'Other'];
    }
  },

  getIncidentStatistics: async (params = {}) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/incidents/statistics`, { params });
      return response.data || { total: 0, open: 0, resolved: 0, by_type: {}, by_severity: {} };
    } catch (error) {
      console.error('Error fetching incident statistics:', error);
      return { total: 0, open: 0, resolved: 0, by_type: {}, by_severity: {} };
    }
  },

  getIncidentTrends: async (params = {}) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/incidents/trends`, { params });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching incident trends:', error);
      return [];
    }
  },

  createEnvironmentalIncident: async (incidentData) => {
    try {
      const response = await api.post(`${ENVIRONMENTAL_BASE}/incidents`, incidentData);
      return response.data || { success: true };
    } catch (error) {
      console.error('Error creating environmental incident:', error);
      throw error;
    }
  },

  updateEnvironmentalIncident: async (incidentId, incidentData) => {
    try {
      const response = await api.put(`${ENVIRONMENTAL_BASE}/incidents/${incidentId}`, incidentData);
      return response.data || { success: true };
    } catch (error) {
      console.error('Error updating environmental incident:', error);
      throw error;
    }
  },

  deleteEnvironmentalIncident: async (incidentId) => {
    try {
      const response = await api.delete(`${ENVIRONMENTAL_BASE}/incidents/${incidentId}`);
      return response.data || { success: true };
    } catch (error) {
      console.error('Error deleting environmental incident:', error);
      throw error;
    }
  },

  getIncidentReport: async (params = {}) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/incidents/report`, { params });
      return response.data || {};
    } catch (error) {
      console.error('Error fetching incident report:', error);
      return {};
    }
  },

  // === STATISTICS & ANALYTICS ===

  getEnvironmentalStats: async () => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/advanced-stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching environmental stats:', error);
      return {
        total_sensors: 0,
        total_samples: 0,
        total_incidents: 0,
        compliance_rate: 0,
        average_aqi: 0,
        water_quality_index: 0,
        carbon_emissions: 0,
        waste_reduction: 0,
        energy_efficiency: 0,
        biodiversity_score: 0,
        sustainability_index: 0,
        real_time_metrics: {
          active_sensors: 0,
          pending_samples: 0,
          open_incidents: 0,
          system_health: 0
        },
        trends: {
          aqi_trend: 'unknown',
          compliance_trend: 'unknown',
          emissions_trend: 'unknown'
        }
      };
    }
  },

  // === REAL-TIME DATA ===

  getRealTimeSensorData: async (sensorIds = []) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/advanced-realtime`, {
        params: { sensor_ids: sensorIds.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time sensor data:', error);
      return {
        timestamp: new Date().toISOString(),
        data_interval: 'unknown',
        sensors: [],
        system_status: 'unknown',
        update_frequency: 'unknown'
      };
    }
  },

  // === EXPORT FUNCTIONALITY ===

  exportEnvironmentalData: async (format = 'csv', filters = {}) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/advanced-export`, {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting environmental data:', error);
      throw error;
    }
  },

  // === BATCH OPERATIONS ===

  getBatchEnvironmentalData: async (endpoints = []) => {
    try {
      const requests = endpoints.map(endpoint => 
        api.get(`${ENVIRONMENTAL_BASE}/${endpoint}`).catch(() => ({ data: null }))
      );
      const responses = await Promise.all(requests);
      return responses.reduce((acc, response, index) => {
        acc[endpoints[index]] = response.data;
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching batch environmental data:', error);
      return {};
    }
  },

  // === HEALTH CHECK ===

  checkServiceHealth: async () => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/advanced-health`);
      return response.data;
    } catch (error) {
      console.error('Environmental service health check failed:', error);
      return { 
        status: 'unhealthy', 
        message: 'Service unavailable',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'disconnected' },
          sensors: { status: 'offline' },
          analytics: { status: 'stopped' },
          api: { status: 'unavailable' }
        },
        system_metrics: {
          cpu_usage: 0,
          memory_usage: 0,
          storage_available: 0,
          active_connections: 0
        }
      };
    }
  },

  // === UTILITY FUNCTIONS ===

  calculateAQI: (pm25) => {
    if (pm25 <= 12) return Math.round((pm25 / 12) * 50);
    else if (pm25 <= 35.4) return Math.round(((pm25 - 12.1) / (35.4 - 12.1)) * 50 + 51);
    else if (pm25 <= 55.4) return Math.round(((pm25 - 35.5) / (55.4 - 35.5)) * 50 + 101);
    else if (pm25 <= 150.4) return Math.round(((pm25 - 55.5) / (150.4 - 55.5)) * 100 + 151);
    else if (pm25 <= 250.4) return Math.round(((pm25 - 150.5) / (250.4 - 150.5)) * 100 + 201);
    else return Math.round(((pm25 - 250.5) / (350.4 - 250.5)) * 100 + 301);
  },

  getAQICategory: (aqi) => {
    if (aqi <= 50) return { level: 'Good', color: '#00E400' };
    if (aqi <= 100) return { level: 'Moderate', color: '#FFFF00' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#FF7E00' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#FF0000' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#8F3F97' };
    return { level: 'Hazardous', color: '#7E0023' };
  },

  validateSensorData: (sensorData) => {
    const errors = [];
    if (!sensorData.name?.trim()) errors.push('Sensor name is required');
    if (!sensorData.location?.trim()) errors.push('Location is required');
    if (!sensorData.type?.trim()) errors.push('Sensor type is required');
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validateWaterSample: (sampleData) => {
    const errors = [];
    if (!sampleData.location?.trim()) errors.push('Location is required');
    if (!sampleData.sampleType?.trim()) errors.push('Sample type is required');
    if (!sampleData.sampleDate) errors.push('Sample date is required');
    const params = sampleData.parameters || {};
    if (params.ph && (params.ph < 0 || params.ph > 14)) {
      errors.push('pH must be between 0 and 14');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Add these inside the environmentalService object

  // ============================================================
  // WATER QUALITY METHODS - ADD THESE
  // ============================================================

  getWaterSite: async (siteId) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/water-quality/sites/${siteId}`);
      return response.data || {};
    } catch (error) {
      console.error(`Error fetching water site ${siteId}:`, error);
      throw error;
    }
  },

  getWaterSites: async (params = {}) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/water-quality/sites`, { params });
      return response.data || { sites: [], total: 0 };
    } catch (error) {
      console.error('Error fetching water sites:', error);
      return { sites: [], total: 0 };
    }
  },

  createWaterSite: async (siteData) => {
    try {
      const response = await api.post(`${ENVIRONMENTAL_BASE}/water-quality/sites`, siteData);
      return response.data;
    } catch (error) {
      console.error('Error creating water site:', error);
      throw error;
    }
  },

  updateWaterSite: async (siteId, siteData) => {
    try {
      const response = await api.put(`${ENVIRONMENTAL_BASE}/water-quality/sites/${siteId}`, siteData);
      return response.data;
    } catch (error) {
      console.error(`Error updating water site ${siteId}:`, error);
      throw error;
    }
  },

  deleteWaterSite: async (siteId) => {
    try {
      const response = await api.delete(`${ENVIRONMENTAL_BASE}/water-quality/sites/${siteId}`);
      return response.data || { success: true };
    } catch (error) {
      console.error(`Error deleting water site ${siteId}:`, error);
      throw error;
    }
  },

  // ✅ CRITICAL: Update Water Sample
  updateWaterSample: async (sampleId, sampleData) => {
    try {
      const response = await api.put(`${ENVIRONMENTAL_BASE}/water-quality/samples/${sampleId}`, sampleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating water sample ${sampleId}:`, error);
      throw error;
    }
  },

  // ✅ CRITICAL: Delete Water Sample
  deleteWaterSample: async (sampleId) => {
    try {
      const response = await api.delete(`${ENVIRONMENTAL_BASE}/water-quality/samples/${sampleId}`);
      return response.data || { success: true };
    } catch (error) {
      console.error(`Error deleting water sample ${sampleId}:`, error);
      throw error;
    }
  },

  getWaterSample: async (sampleId) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/water-quality/samples/${sampleId}`);
      return response.data || {};
    } catch (error) {
      console.error(`Error fetching water sample ${sampleId}:`, error);
      throw error;
    }
  },

  getWaterCompliance: async (params = {}) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/water-quality/compliance`, { params });
      return response.data || { compliant: 0, non_compliant: 0, total: 0 };
    } catch (error) {
      console.error('Error fetching water compliance:', error);
      return { compliant: 0, non_compliant: 0, total: 0 };
    }
  },

  getWaterAnalytics: async (params = {}) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/water-quality/analytics`, { params });
      return response.data || { trends: [], summary: {} };
    } catch (error) {
      console.error('Error fetching water analytics:', error);
      return { trends: [], summary: {} };
    }
  },

  // ============================================================
  // AIR QUALITY METHODS - ADD THESE
  // ============================================================

  getAirReadings: async (sensorId, params = {}) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/air-quality/sensors/${sensorId}/readings`, { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error fetching air readings for sensor ${sensorId}:`, error);
      return [];
    }
  },

  createAirReading: async (sensorId, readingData) => {
    try {
      const response = await api.post(`${ENVIRONMENTAL_BASE}/air-quality/sensors/${sensorId}/readings`, readingData);
      return response.data;
    } catch (error) {
      console.error(`Error creating air reading for sensor ${sensorId}:`, error);
      throw error;
    }
  },

  getAirAnalytics: async (params = {}) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/air-quality/analytics`, { params });
      return response.data || { trends: [], summary: {} };
    } catch (error) {
      console.error('Error fetching air analytics:', error);
      return { trends: [], summary: {} };
    }
  },

  getAirForecast: async (params = {}) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/air-quality/forecast`, { params });
      return response.data || { forecast: [] };
    } catch (error) {
      console.error('Error fetching air forecast:', error);
      return { forecast: [] };
    }
  },

  getAirAlerts: async (params = {}) => {
    try {
      const response = await api.get(`${ENVIRONMENTAL_BASE}/air-quality/alerts`, { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching air alerts:', error);
      return [];
    }
  },

  acknowledgeAirAlert: async (alertId) => {
    try {
      const response = await api.put(`${ENVIRONMENTAL_BASE}/air-quality/alerts/${alertId}/acknowledge`);
      return response.data || { success: true };
    } catch (error) {
      console.error(`Error acknowledging air alert ${alertId}:`, error);
      throw error;
    }
  },

  // === UTILITY METHODS FOR ADVANCED FEATURES ===
  
  getAlertSeverityColor: (severity) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800', 
      high: '#F44336',
      critical: '#9C27B0'
    };
    return colors[severity] || '#757575';
  },

  formatComplianceScore: (score) => {
    if (score >= 90) return { level: 'Excellent', color: '#4CAF50' };
    if (score >= 80) return { level: 'Good', color: '#8BC34A' };
    if (score >= 70) return { level: 'Fair', color: '#FFC107' };
    if (score >= 60) return { level: 'Poor', color: '#FF9800' };
    return { level: 'Critical', color: '#F44336' };
  },

  calculateSustainabilityProgress: (goals) => {
    if (!goals || goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    return Math.round(totalProgress / goals.length);
  },

  generateExportFilename: (dataType = 'environmental', format = 'csv') => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `${dataType}_data_${timestamp}.${format}`;
  },

  // === DEBUG: Get list of all available methods ===
  getMethodList: () => {
    const methods = [];
    for (const key of Object.keys(environmentalService)) {
      if (typeof environmentalService[key] === 'function') {
        methods.push(key);
      }
    }
    return methods;
  }
};

// SINGLE default export
export default environmentalService;