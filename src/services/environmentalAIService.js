// src/services/environmentalAIService.js
// COMPLETE COMBINED VERSION - ALL METHODS PRESERVED, NO MOCK DATA

import { apiPost, apiGet, apiPut, apiDelete, planAwareApiCall } from './api';

// Improved Superadmin bypass helper function
const checkSuperAdminAccess = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    
    // Check various superadmin indicators
    const isSuperAdmin = 
      user.is_super_admin === true ||
      user.is_super_admin === "true" ||
      user.is_system_team === true ||
      user.is_system_team === "true" ||
      user.role === 'superadmin' ||
      user.role === 'super_admin' ||
      user.role === 'admin' ||
      user.plan === 'super_admin' ||
      (user.plan === 'enterprise' && user.role === 'admin') ||
      user.email === 'abigalisticstudious@gmail.com'; // Direct email check as fallback
    
    if (isSuperAdmin) {
      console.log('👑 Superadmin detected - bypassing all plan checks', {
        email: user.email,
        role: user.role,
        plan: user.plan,
        is_super_admin: user.is_super_admin,
        is_system_team: user.is_system_team
      });
    }
    return isSuperAdmin;
  } catch (error) {
    console.error('Error checking superadmin access:', error);
    return false;
  }
};

// Enhanced API call function with superadmin bypass
const enhancedApiCall = async (endpoint, data = {}, options = {}) => {
  const { requiredPlan = null, method = 'POST', ...restOptions } = options;
  
  const isSuperAdmin = checkSuperAdminAccess();
  
  console.log(`🔍 enhancedApiCall: ${endpoint}, method: ${method}, isSuperAdmin: ${isSuperAdmin}`);
  
  if (isSuperAdmin) {
    console.log(`👑 Superadmin bypass for: ${endpoint} [${method}]`);
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...restOptions.headers
    };
    
    try {
      switch (method.toUpperCase()) {
        case 'GET':
          return await apiGet(endpoint, { ...restOptions, headers });
        case 'POST':
          return await apiPost(endpoint, data, { ...restOptions, headers });
        case 'PUT':
          return await apiPut(endpoint, data, { ...restOptions, headers });
        case 'DELETE':
          return await apiDelete(endpoint, { ...restOptions, headers });
        default:
          return await apiPost(endpoint, data, { ...restOptions, headers });
      }
    } catch (error) {
      console.error(`Superadmin API call error for ${endpoint}:`, error);
      
      if (error.response?.status === 401) {
        console.log('🔄 401 error detected, attempting token refresh...');
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const refreshResponse = await apiPost('/auth/refresh', { refresh_token: refreshToken });
            if (refreshResponse.data?.access_token) {
              localStorage.setItem('token', refreshResponse.data.access_token);
              console.log('✅ Token refreshed successfully');
              
              const newHeaders = {
                ...headers,
                'Authorization': `Bearer ${refreshResponse.data.access_token}`
              };
              
              switch (method.toUpperCase()) {
                case 'GET':
                  return await apiGet(endpoint, { ...restOptions, headers: newHeaders });
                case 'POST':
                  return await apiPost(endpoint, data, { ...restOptions, headers: newHeaders });
                case 'PUT':
                  return await apiPut(endpoint, data, { ...restOptions, headers: newHeaders });
                case 'DELETE':
                  return await apiDelete(endpoint, { ...restOptions, headers: newHeaders });
                default:
                  return await apiPost(endpoint, data, { ...restOptions, headers: newHeaders });
              }
            }
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
        }
      }
      
      throw error;
    }
  } else {
    console.log(`👤 Regular user using planAwareApiCall: ${endpoint} [${method}]`);
    return await planAwareApiCall(endpoint, data, { 
      requiredPlan, 
      method, 
      ...restOptions 
    });
  }
};

export const environmentalAIService = {
  // ===== SUPERADMIN UTILITIES =====
  isSuperAdmin: () => checkSuperAdminAccess(),
  refreshSuperadminStatus: () => checkSuperAdminAccess(),

  // ===== ENVIRONMENTAL AI SERVICES =====
  analyzeEnvironmentalData: async (environmentalData) => {
    const response = await enhancedApiCall('/ai/environmental/analyze-comprehensive', environmentalData, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  predictAirQuality: async (predictionData) => {
    const response = await enhancedApiCall('/ai/environmental/predict-air-quality', predictionData, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  assessEnvironmentalRisk: async (riskData) => {
    const response = await enhancedApiCall('/ai/environmental/assess-risk', riskData, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  detectAnomalies: async (sensorData) => {
    const response = await enhancedApiCall('/ai/environmental/detect-anomalies', sensorData, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  advancedEnvironmentalAnalysis: async (analysisData) => {
    const response = await enhancedApiCall('/ai/environmental/advanced-analysis', analysisData, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  pollutionMapping: async (spatialData) => {
    const response = await enhancedApiCall('/ai/environmental/pollution-mapping', spatialData, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  calculateESGScore: async (esgData) => {
    const response = await enhancedApiCall('/ai/environmental/esg-scoring', esgData, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  generateSustainabilityReport: async (reportData) => {
    const response = await enhancedApiCall('/ai/environmental/sustainability-report', reportData, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  predictiveEnvironmentalForecast: async (forecastData) => {
    const response = await enhancedApiCall('/ai/environmental/predictive-forecast', forecastData, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  environmentalImpactAssessment: async (impactData) => {
    const response = await enhancedApiCall('/ai/environmental/impact-assessment', impactData, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  predictCompliance: async (complianceData) => {
    const response = await enhancedApiCall('/ai/environmental/compliance-prediction', complianceData, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  optimizeResources: async (optimizationData) => {
    const response = await enhancedApiCall('/ai/environmental/resource-optimization', optimizationData, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  // ===== THERMAL MONITORING SERVICES (COMPLETE) =====
  
  getThermalSensors: async () => {
    const response = await enhancedApiCall('/thermal/sensors', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getThermalSensorById: async (sensorId) => {
    const response = await enhancedApiCall(`/thermal/sensors/${sensorId}`, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getThermalAnalyses: async (locationId = null) => {
    const endpoint = locationId 
      ? `/thermal/analyses?location_id=${locationId}`
      : '/thermal/analyses';
    const response = await enhancedApiCall(endpoint, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getThermalAnalysisById: async (analysisId) => {
    const response = await enhancedApiCall(`/thermal/analyses/${analysisId}`, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getThermalAnomalies: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.location_id) queryParams.append('location_id', filters.location_id);
    if (filters.severity) queryParams.append('severity', filters.severity);
    if (filters.status) queryParams.append('status', filters.status);
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/thermal/anomalies?${queryString}` : '/thermal/anomalies';
    const response = await enhancedApiCall(endpoint, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  resolveThermalAnomaly: async (anomalyId, resolutionNotes) => {
    const response = await enhancedApiCall(`/thermal/anomalies/${anomalyId}/resolve`, {
      resolution_notes: resolutionNotes
    }, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  getThermalRecommendations: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.location_id) queryParams.append('location_id', filters.location_id);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.status) queryParams.append('status', filters.status);
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/thermal/recommendations?${queryString}` : '/thermal/recommendations';
    const response = await enhancedApiCall(endpoint, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  implementThermalRecommendation: async (recId, implementationData) => {
    const response = await enhancedApiCall(`/thermal/recommendations/${recId}/implement`, implementationData, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  getThermalComfortLogs: async (locationId = null, limit = 20) => {
    const endpoint = locationId 
      ? `/thermal/comfort-logs?location_id=${locationId}&limit=${limit}`
      : `/thermal/comfort-logs?limit=${limit}`;
    const response = await enhancedApiCall(endpoint, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getUhiRecords: async (locationId = null, limit = 10) => {
    const endpoint = locationId 
      ? `/thermal/uhi-records?location_id=${locationId}&limit=${limit}`
      : `/thermal/uhi-records?limit=${limit}`;
    const response = await enhancedApiCall(endpoint, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getThermalReadings: async (sensorId = null, limit = 100) => {
    const endpoint = sensorId 
      ? `/thermal/readings?sensor_id=${sensorId}&limit=${limit}`
      : `/thermal/readings?limit=${limit}`;
    const response = await enhancedApiCall(endpoint, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  submitThermalReading: async (readingData) => {
    const response = await enhancedApiCall('/thermal/sensor-reading', readingData, {
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getBuildingThermalProfile: async (buildingId) => {
    const response = await enhancedApiCall(`/thermal/building/${buildingId}`, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  requestThermalAnalysis: async (analysisData) => {
    const response = await enhancedApiCall('/thermal/analyze', analysisData, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  getThermalDashboard: async (locationId = null) => {
    const endpoint = locationId 
      ? `/thermal/dashboard?location_id=${locationId}`
      : '/thermal/dashboard';
    const response = await enhancedApiCall(endpoint, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  addThermalSensor: async (sensorData) => {
    const response = await enhancedApiCall('/thermal/sensors', sensorData, {
      method: 'POST',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  deleteThermalSensor: async (sensorId) => {
    const response = await enhancedApiCall(`/thermal/sensors/${sensorId}`, null, {
      method: 'DELETE',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getThermalDashboardData: async () => {
    const response = await enhancedApiCall('/ai/environmental/thermal-dashboard', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getThermalAnomaliesData: async () => {
    const response = await enhancedApiCall('/ai/environmental/thermal-anomalies', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getThermalRecommendationsData: async () => {
    const response = await enhancedApiCall('/ai/environmental/thermal-recommendations', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getThermalComfortData: async () => {
    const response = await enhancedApiCall('/ai/environmental/thermal-comfort', {
      fetch_logs: true
    }, {
      method: 'POST',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getUhiRecordsData: async () => {
    const response = await enhancedApiCall('/ai/environmental/uhi-records', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  generateSampleThermalData: async () => {
    const response = await enhancedApiCall('/ai/environmental/thermal/generate-sample', {}, {
      method: 'POST',
      requiredPlan: 'admin'
    });
    return response.data || response;
  },

  // ===== DOCUMENT GENERATION SERVICES =====
  
  generateComplianceReport: async (reportData) => {
    const response = await enhancedApiCall('/ai/documents/generate-compliance-report', reportData, {
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  generateSafetyReport: async (safetyData) => {
    const response = await enhancedApiCall('/ai/documents/generate-safety-report', safetyData, {
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  generateImpactAssessment: async (assessmentData) => {
    const response = await enhancedApiCall('/ai/documents/generate-impact-assessment', assessmentData, {
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  generateAllReports: async (data) => {
    const response = await enhancedApiCall('/ai/documents/generate-all-reports', data, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  getDocumentTemplates: async () => {
    const response = await enhancedApiCall('/ai/documents/templates', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  downloadDocument: async (filename) => {
    const response = await enhancedApiCall(`/ai/documents/download/${filename}`, null, {
      method: 'GET',
      requiredPlan: 'basic',
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { 
      success: true, 
      filename: filename,
      message: 'Document downloaded successfully' 
    };
  },

  // ===== ENVIRONMENTAL ADVANCED ENDPOINTS =====
  
  getAdvancedSmartAlerts: async () => {
    const response = await enhancedApiCall('/environmental/alerts/advanced-smart', null, {
      method: 'GET',
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  getEnvironmentalIntelligence: async () => {
    const response = await enhancedApiCall('/environmental/intelligence/advanced-dashboard', null, {
      method: 'GET',
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },
 
  getSustainabilityGoals: async () => {
  try {
    console.log('🎯 Fetching sustainability goals from backend');
    const response = await enhancedApiCall('/environmental/sustainability/goals', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    
    console.log('📊 Sustainability goals response:', response);
    
    // Your backend returns: {'access_level': 'super_admin', 'goals': [], 'success': True}
    // Handle the response format correctly
    if (response && typeof response === 'object') {
      // If response has goals array directly
      if (response.goals !== undefined) {
        return response;
      }
      // If response has data wrapper
      if (response.data && response.data.goals !== undefined) {
        return response.data;
      }
    }
    
    return { goals: [], success: true, access_level: 'user' };
  } catch (error) {
    console.error('❌ Failed to fetch sustainability goals:', error);
    return { goals: [], success: false, error: error.message };
  }
},
  

  getPredictiveAnalytics: async (analyticsType = 'air_quality') => {
    const response = await enhancedApiCall('/environmental/analytics/advanced-predictive', {
      params: { type: analyticsType }
    }, {
      method: 'GET',
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  getComplianceAutomation: async () => {
    const response = await enhancedApiCall('/environmental/compliance/advanced-automation', null, {
      method: 'GET',
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  updateAutomationSettings: async (settings) => {
    const response = await enhancedApiCall('/environmental/compliance/advanced-automation', settings, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  getImpactScorecard: async () => {
    const response = await enhancedApiCall('/environmental/impact/advanced-scorecard', null, {
      method: 'GET',
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  // ===== CAMERA MONITORING SERVICES (COMPLETE) =====
  
  getSystemHealth: async () => {
    console.log('🏥 GETTING SYSTEM HEALTH');
    const response = await enhancedApiCall('/camera/system/health', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getActiveSessions: async () => {
    console.log('🔄 GETTING ACTIVE SESSIONS');
    const response = await enhancedApiCall('/camera/sessions/active', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getCameraConfig: async (cameraId) => {
    console.log('⚙️ GETTING CAMERA CONFIG:', cameraId);
    const response = await enhancedApiCall(`/camera/config/${cameraId}`, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getCameraStatus: async () => {
    console.log('📊 GETTING CAMERA STATUS');
    const response = await enhancedApiCall('/camera/status', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getViolationHistory: async (filters = {}) => {
    console.log('📋 GETTING VIOLATION HISTORY:', filters);
    const response = await enhancedApiCall('/camera/violations/history', filters, {
      method: 'POST',
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  startDeviceCamera: async (cameraId = 'device_front') => {
    console.log('🚀 STARTING DEVICE CAMERA:', cameraId);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Camera access confirmed');
    } catch (cameraError) {
      console.warn('⚠️ Camera access not available:', cameraError.message);
    }

    const response = await enhancedApiCall('/camera/device/start', { 
      camera_id: cameraId,
      timestamp: new Date().toISOString()
    }, {
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  startCCTVFeed: async (cameraId) => {
    console.log('🚀 STARTING CCTV FEED:', cameraId);
    const response = await enhancedApiCall('/camera/cctv/start', { 
      camera_id: cameraId,
      timestamp: new Date().toISOString()
    }, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  stopCameraSession: async (sessionId) => {
    console.log('🛑 STOPPING CAMERA SESSION:', sessionId);
    const response = await enhancedApiCall(`/camera/${sessionId}/stop`, {
      timestamp: new Date().toISOString()
    }, {
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  analyzeCameraFrame: async (frameData, sessionId, analysisType = 'safety_monitoring') => {
    console.log('📸 ANALYZING CAMERA FRAME:', { sessionId, analysisType });
    
    let framePayload;
    if (frameData.startsWith('data:image')) {
      framePayload = { frame_data: frameData };
    } else {
      framePayload = { frame_data: `data:image/jpeg;base64,${frameData}` };
    }
    
    const response = await enhancedApiCall('/camera/analyze/frame', {
      ...framePayload,
      session_id: sessionId,
      analysis_type: analysisType,
      enable_ppe_detection: analysisType === 'safety_monitoring',
      confidence_threshold: 0.15,
      enable_debug: true,
      timestamp: new Date().toISOString()
    }, {
      requiredPlan: 'pro'
    });
    
    return response.data || response;
  },

  analyzeCameraFrameEnhanced: async (frameData, sessionId, analysisType = 'safety_monitoring') => {
    console.log('📸 [ENHANCED] Starting frame analysis:', { sessionId, analysisType });
    
    const framePayload = {
      frame_data: frameData.startsWith('data:image') ? frameData : `data:image/jpeg;base64,${frameData}`,
    };
    
    const response = await enhancedApiCall('/camera/analyze/frame', {
      ...framePayload,
      session_id: sessionId,
      analysis_type: analysisType,
      enable_ppe_detection: analysisType === 'safety_monitoring' || analysisType === 'ppe_detection',
      confidence_threshold: 0.15,
      enable_debug: true,
      enable_color_system: true,
      return_processed_image: true,
      timestamp: new Date().toISOString()
    }, {
      requiredPlan: 'pro'
    });
    
    return response.data || response;
  },

  testYOLOv8Connection: async () => {
    console.log('🔌 Testing YOLOv8 connection...');
    
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#404040';
    ctx.fillRect(200, 150, 240, 180);
    
    const testImage = canvas.toDataURL('image/jpeg', 0.7);
    
    const response = await enhancedApiCall('/camera/analyze/frame', {
      frame_data: testImage,
      session_id: `test_connection_${Date.now()}`,
      analysis_type: 'safety_monitoring',
      test_mode: true
    }, {
      requiredPlan: 'basic'
    });
    
    return response.data || response;
  },

  analyzeWebRTCFrame: async (frameData, sessionId, analysisType = 'safety_monitoring') => {
    console.log('📸 ANALYZING WEBRTC FRAME:', { sessionId, analysisType });
    
    const response = await enhancedApiCall('/camera/analyze/frame', {
      frame_data: frameData,
      session_id: sessionId,
      analysis_type: analysisType,
      timestamp: new Date().toISOString()
    }, {
      requiredPlan: 'pro'
    });
    
    return response.data || response;
  },

  startWebRTCDetection: (videoElement, sessionId, onDetectionResults, intervalMs = 1000) => {
    console.log('🎬 Starting WebRTC frame capture for detection...');
    
    if (!videoElement) {
      console.error('❌ Video element not found');
      return null;
    }
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    let isCapturing = true;
    let frameCount = 0;
    let intervalId = null;
    
    const captureAndAnalyzeFrame = async () => {
      if (!isCapturing || !videoElement || videoElement.readyState !== 4) {
        return;
      }
      
      try {
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        frameCount++;
        
        console.log(`📸 Captured frame ${frameCount}: ${canvas.width}x${canvas.height}`);
        
        const analysis = await environmentalAIService.analyzeCameraFrameEnhanced(
          imageData,
          sessionId,
          'safety_monitoring'
        );
        
        if (onDetectionResults && analysis && analysis.analysis) {
          onDetectionResults(analysis.analysis);
        }
        
      } catch (error) {
        console.error('❌ Frame capture/analysis error:', error);
      }
    };
    
    intervalId = setInterval(captureAndAnalyzeFrame, intervalMs);
    
    return {
      stop: () => {
        console.log('⏹️ Stopping WebRTC frame capture');
        isCapturing = false;
        if (intervalId) clearInterval(intervalId);
      },
      getFrameCount: () => frameCount,
      getStatus: () => isCapturing ? 'capturing' : 'stopped'
    };
  },

  testCameraDetectionQuick: async () => {
    console.log('🎯 Quick camera detection test...');
    
    const status = await environmentalAIService.getCameraStatus();
    console.log('📊 Camera status:', status);
    
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#808080';
    ctx.fillRect(200, 150, 100, 200);
    ctx.fillStyle = '#606060';
    ctx.arc(250, 120, 40, 0, Math.PI * 2);
    
    const testImage = canvas.toDataURL('image/jpeg', 0.7);
    
    const analysis = await environmentalAIService.analyzeCameraFrameEnhanced(
      testImage,
      `test_${Date.now()}`,
      'safety_monitoring'
    );
    
    return {
      cameraStatus: status,
      analysis: analysis
    };
  },

  // ===== ADDITIONAL AI SERVICES =====
  
  getAIRecommendations: async (data) => {
    const response = await enhancedApiCall('/ai/recommendations', data, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  getAIPredictions: async (data) => {
    const response = await enhancedApiCall('/ai/predictions', data, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  getAIAnalytics: async (data) => {
    const response = await enhancedApiCall('/ai/analytics', data, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  getAIModelStatus: async () => {
    const response = await enhancedApiCall('/ai/models/status', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  trainAIModel: async (trainingData) => {
    const response = await enhancedApiCall('/ai/models/train', trainingData, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  getAIModelMetrics: async (modelId) => {
    const response = await enhancedApiCall(`/ai/models/${modelId}/metrics`, null, {
      method: 'GET',
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  // ===== REPORTING SERVICES =====
  
  generateCustomReport: async (reportConfig) => {
    const response = await enhancedApiCall('/reports/custom/generate', reportConfig, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  getReportTemplates: async () => {
    const response = await enhancedApiCall('/reports/templates', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  scheduleReport: async (scheduleConfig) => {
    const response = await enhancedApiCall('/reports/schedule', scheduleConfig, {
      requiredPlan: 'enterprise'
    });
    return response.data || response;
  },

  getScheduledReports: async () => {
    const response = await enhancedApiCall('/reports/scheduled', null, {
      method: 'GET',
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  deleteScheduledReport: async (reportId) => {
    const response = await enhancedApiCall(`/reports/scheduled/${reportId}`, null, {
      method: 'DELETE',
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  

  
  getNotifications: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.read) queryParams.append('read', filters.read);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.limit) queryParams.append('limit', filters.limit);
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
    const response = await enhancedApiCall(endpoint, null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  markNotificationRead: async (notificationId) => {
    const response = await enhancedApiCall(`/notifications/${notificationId}/read`, {}, {
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  markAllNotificationsRead: async () => {
    const response = await enhancedApiCall('/notifications/read-all', {}, {
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  deleteNotification: async (notificationId) => {
    const response = await enhancedApiCall(`/notifications/${notificationId}`, null, {
      method: 'DELETE',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getNotificationSettings: async () => {
    const response = await enhancedApiCall('/notifications/settings', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  updateNotificationSettings: async (settings) => {
    const response = await enhancedApiCall('/notifications/settings', settings, {
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  // ===== AUDIT SERVICES =====
  
  getAuditLogs: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.start_date) queryParams.append('start_date', filters.start_date);
    if (filters.end_date) queryParams.append('end_date', filters.end_date);
    if (filters.user_id) queryParams.append('user_id', filters.user_id);
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.limit) queryParams.append('limit', filters.limit);
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/audit/logs?${queryString}` : '/audit/logs';
    const response = await enhancedApiCall(endpoint, null, {
      method: 'GET',
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  getAuditSummary: async () => {
    const response = await enhancedApiCall('/audit/summary', null, {
      method: 'GET',
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  exportAuditLogs: async (filters = {}) => {
    const response = await enhancedApiCall('/audit/export', filters, {
      requiredPlan: 'enterprise',
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Audit logs exported successfully' };
  },

  // ===== USER MANAGEMENT SERVICES =====
  
  getUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    const response = await enhancedApiCall(endpoint, null, {
      method: 'GET',
      requiredPlan: 'admin'
    });
    return response.data || response;
  },

  getUserById: async (userId) => {
    const response = await enhancedApiCall(`/users/${userId}`, null, {
      method: 'GET',
      requiredPlan: 'admin'
    });
    return response.data || response;
  },

  updateUser: async (userId, userData) => {
    const response = await enhancedApiCall(`/users/${userId}`, userData, {
      method: 'PUT',
      requiredPlan: 'admin'
    });
    return response.data || response;
  },

  deleteUser: async (userId) => {
    const response = await enhancedApiCall(`/users/${userId}`, null, {
      method: 'DELETE',
      requiredPlan: 'admin'
    });
    return response.data || response;
  },

  getUserPermissions: async (userId) => {
    const response = await enhancedApiCall(`/users/${userId}/permissions`, null, {
      method: 'GET',
      requiredPlan: 'admin'
    });
    return response.data || response;
  },

  updateUserPermissions: async (userId, permissions) => {
    const response = await enhancedApiCall(`/users/${userId}/permissions`, permissions, {
      requiredPlan: 'admin'
    });
    return response.data || response;
  },

  // ===== SYSTEM CONFIGURATION SERVICES =====
  
  getSystemConfig: async () => {
    const response = await enhancedApiCall('/system/config', null, {
      method: 'GET',
      requiredPlan: 'admin'
    });
    return response.data || response;
  },

  updateSystemConfig: async (config) => {
    const response = await enhancedApiCall('/system/config', config, {
      requiredPlan: 'admin'
    });
    return response.data || response;
  },

  getSystemMetrics: async () => {
    const response = await enhancedApiCall('/system/metrics', null, {
      method: 'GET',
      requiredPlan: 'admin'
    });
    return response.data || response;
  },

  getSystemHealthCheck: async () => {
    const response = await enhancedApiCall('/system/health', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  // ===== DATA EXPORT SERVICES =====
  
  exportData: async (exportConfig) => {
    const response = await enhancedApiCall('/data/export', exportConfig, {
      requiredPlan: 'pro',
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_${Date.now()}.${exportConfig.format || 'csv'}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'Data exported successfully' };
  },

  importData: async (file, importConfig) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(importConfig).forEach(key => {
      formData.append(key, importConfig[key]);
    });
    
    const response = await enhancedApiCall('/data/import', formData, {
      requiredPlan: 'enterprise',
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data || response;
  },

  getExportTemplates: async () => {
    const response = await enhancedApiCall('/data/export/templates', null, {
      method: 'GET',
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  // ===== DASHBOARD SERVICES =====
  
  getDashboardStats: async () => {
    const response = await enhancedApiCall('/dashboard/stats', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getDashboardCharts: async (chartConfig) => {
    const response = await enhancedApiCall('/dashboard/charts', chartConfig, {
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  getDashboardKPI: async () => {
    const response = await enhancedApiCall('/dashboard/kpi', null, {
      method: 'GET',
      requiredPlan: 'basic'
    });
    return response.data || response;
  },

  customizeDashboard: async (layout) => {
    const response = await enhancedApiCall('/dashboard/customize', layout, {
      requiredPlan: 'pro'
    });
    return response.data || response;
  },

  getCustomDashboard: async () => {
    const response = await enhancedApiCall('/dashboard/custom', null, {
      method: 'GET',
      requiredPlan: 'pro'
    });
    return response.data || response;
  }
};

export default environmentalAIService;