// src/services/aiService.js
import { 
  API_ENDPOINTS,
  apiPost,
  apiUpload 
} from './api';

export const aiService = {
  // Medical AI Services
  analyzeSymptoms: (symptoms) => apiPost(API_ENDPOINTS.AI_ANALYZE_SYMPTOMS, { symptoms }),
  
  predictDisease: (symptoms) => apiPost(API_ENDPOINTS.AI_PREDICT_DISEASE, { symptoms }),
  
  analyzeMedicalText: (text) => apiPost(API_ENDPOINTS.AI_ANALYZE_MEDICAL_TEXT, { text }),
  
  summarizeText: (text) => apiPost(API_ENDPOINTS.AI_SUMMARIZE_MEDICAL, { text }),
  
  analyzeEnvironmentalData: (envData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE_ENVIRONMENTAL, { environmental_data: envData }),
  
  predictAirQuality: (data) => apiPost(API_ENDPOINTS.AI_PREDICT_AIR_QUALITY, data),
  
  // Environmental-specific endpoints
  detectEnvironmentalAnomalies: (sensorData) => 
    apiPost('/api/ai/detect-anomalies', sensorData),
  
  analyzeWaterQuality: (waterData) => 
    apiPost('/api/ai/analyze-water', waterData),

  predictEnvironmentalTrends: (trendData) => 
    apiPost('/api/ai/predict-trends', trendData),
  
  assessEnvironmentalRisk: (riskData) => 
    apiPost(API_ENDPOINTS.AI_ASSESS_RISK, { 
      assessment_type: 'environmental', 
      data: riskData 
    }),

  analyzeLabResults: (labData) => apiPost(API_ENDPOINTS.AI_ANALYZE_LAB_RESULTS, { lab_results: labData }),
  
  analyzeMedicalImage: (imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);
    return apiUpload(API_ENDPOINTS.AI_ANALYZE_MEDICAL_IMAGE, formData);
  },

  // ✅ ADDED: AI Chat Assistant Service
  chatWithAI: (message, context = {}) => 
    apiPost('/ai/chat', { 
      message, 
      context,
      timestamp: new Date().toISOString()
    }),

  // ✅ ADDED: Hospital Data Analysis
  analyzeHospitalData: (hospitalData, analysisType = 'comprehensive') => 
    apiPost('/ai/analyze-hospital-data', {
      hospital_data: hospitalData,
      analysis_type: analysisType
    }),

  // ✅ ADDED: Patient Data Analysis
  analyzePatientData: (patientData) => 
    apiPost('/ai/analyze-patient-data', { patient_data: patientData }),

  // ✅ ADDED: Medical Equipment Analysis
  analyzeMedicalEquipment: (equipmentData) => 
    apiPost('/ai/analyze-medical-equipment', { equipment_data: equipmentData }),
  // ✅ ADDED: Staff Performance Analysis
  analyzeStaffPerformance: (staffData) => 
    apiPost('/ai/analyze-staff-performance', { staff_data: staffData }),

  // ✅ ADDED: Department Efficiency Analysis
  analyzeDepartmentEfficiency: (departmentData) => 
    apiPost('/ai/analyze-department-efficiency', { department_data: departmentData }),
  // ✅ ADDED: Hospital Resource Optimization
  optimizeHospitalResources: (resourceData) => 
    apiPost('/ai/optimize-hospital-resources', { resource_data: resourceData }),

  // ✅ ADDED: Predictive Patient Admission
  predictPatientAdmissions: (historicalData, period = 'weekly') => 
    apiPost('/  ai/predict-patient-admissions', {
      historical_data: historicalData,
      period: period
    }),

  // ✅ ADDED: Medical Research Analysis
  analyzeMedicalResearch: (researchData) => 
    apiPost('/ai/analyze-medical-research', { research_data: researchData }),

  // ✅ ADDED: Clinical Trial Analysis
  analyzeClinicalTrials: (trialData) => 
    apiPost('/ai/analyze-clinical-trials', { trial_data: trialData }),
  // ✅ ADDED: Drug Interaction Analysis
  analyzeDrugInteractions: (drugData) => 
    apiPost('/ai/analyze-drug-interactions', { drug_data: drugData }),

  // ✅ ADDED: Treatment Recommendation
  recommendTreatment: (patientCase) => 
    apiPost('/ai/recommend-treatment', { patient_case: patientCase }),
  // ✅ ADDED: Medical Protocol Analysis
  analyzeMedicalProtocols: (protocolData) => 
    apiPost('/  ai/analyze-medical-protocols', { protocol_data: protocolData }),

  // Safety & Environmental AI Services
  assessRisk: (data) => apiPost(API_ENDPOINTS.AI_ASSESS_RISK, { data }),
  
  analyzeSafetyDocument: (documentData) => {
    const formData = new FormData();
    formData.append('document', documentData);
    return apiUpload(API_ENDPOINTS.AI_ANALYZE_SAFETY_DOCUMENT, formData);
  },
  
  // VIDEO ANALYSIS SERVICES - UPDATED FOR YOLOv5 BACKEND
  analyzeSafetyVideo: (videoData, analysisConfig = {}) => {
    const formData = new FormData();
    formData.append('video', videoData);
    
    // Add analysis configuration as JSON string
    const config = {
      analysis_type: analysisConfig.analysisType || 'safety_monitoring',
      industry: analysisConfig.industry || 'construction',
      confidence_threshold: analysisConfig.confidenceThreshold || 0.6,
      include_timestamps: analysisConfig.includeTimestamps !== false,
      generate_report: analysisConfig.generateReport || false
    };
    
    // Add custom prompt if provided
    if (analysisConfig.customPrompt) {
      config.custom_prompt = analysisConfig.customPrompt;
    }
    
    // Add description if provided
    if (analysisConfig.description) {
      config.description = analysisConfig.description;
    }
    
    formData.append('analysis_config', JSON.stringify(config));
    
    return apiUpload('/ai/video/analyze', formData);
  },

  // Enhanced video analysis with custom prompts
  analyzeVideoWithPrompt: (videoData, customPrompt, options = {}) => {
    const formData = new FormData();
    formData.append('video', videoData);
    
    const config = {
      analysis_type: 'custom',
      custom_prompt: customPrompt,
      industry: options.industry || 'construction',
      confidence_threshold: options.confidenceThreshold || 0.6
    };
    
    formData.append('analysis_config', JSON.stringify(config));
    
    return apiUpload('/ai/video/analyze', formData);
  },

  // Quick analysis templates - UPDATED FOR REAL YOLOv5 ENDPOINTS
  analyzeVideoForRisks: (videoData, options = {}) => {
    const formData = new FormData();
    formData.append('video', videoData);
    
    return apiUpload('/ai/video/analyze/risks', formData);
  },

  analyzeVideoForPPE: (videoData, options = {}) => {
    const formData = new FormData();
    formData.append('video', videoData);
    
    return apiUpload('/video/analyze/ppe', formData);
  },

  analyzeVideoForEmergencyPreparedness: (videoData, options = {}) => {
    const defaultPrompt = "Assess emergency preparedness in this area. Check: clear emergency exits, accessible fire extinguishers, proper signage, evacuation routes, and emergency equipment availability.";
    return aiService.analyzeVideoWithPrompt(videoData, defaultPrompt, options);
  },

  // Report Generation - UPDATED FOR REAL ENDPOINTS
  generateVideoAnalysisReport: (analysisId, format = 'pdf', reportType = null) => {
    const payload = {
      format: format,
      type: reportType || 'detailed'
    };
    
    return apiPost(`/api/video/analysis/${analysisId}/report`, payload, {
      responseType: 'blob' // Important for file downloads
    });
  },

  // Analysis History - UPDATED FOR REAL ENDPOINTS
  getVideoAnalysisHistory: (limit = 10) => {
    return apiPost('/api/video/analysis/history', { limit });
  },

  getVideoAnalysisResult: (analysisId) => {
    return apiPost(`/api/video/analysis/${analysisId}`, {});
  },

  // DELETE analysis endpoint
  deleteVideoAnalysis: (analysisId) => {
    return apiPost(`/api/video/analysis/${analysisId}/delete`, {});
  },

  // Analytics summary
  getVideoAnalyticsSummary: () => {
    return apiPost('/api/video/analytics/summary', {});
  },

  // Real-time Camera Monitoring - KEEP EXISTING (these are separate from video analysis)
  startCameraMonitoring: (monitoringConfig) => {
    return apiPost('/api/monitoring/start', monitoringConfig);
  },

  stopCameraMonitoring: (monitorId) => {
    return apiPost('/api/monitoring/stop', { monitorId });
  },

  getMonitoringStatus: (monitorId = null) => {
    const params = monitorId ? { monitorId } : {};
    return apiPost('/api/monitoring/status', params);
  },

  getLiveViolations: (monitorId, limit = 20) => {
    return apiPost('/api/monitoring/violations', { monitorId, limit });
  },

  // Camera Management - KEEP EXISTING
  getCameraFeeds: () => {
    return apiPost('/api/cameras/list');
  },

  updateCameraStatus: (cameraId, status) => {
    return apiPost('/api/cameras/update-status', { cameraId, status });
  },

  // Environmental Analysis
  predictAirQualityAnomaly: (data) => apiPost(API_ENDPOINTS.AI_PREDICT_AIR_QUALITY, data),
  
  detectObjects: (imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);
    return apiUpload(API_ENDPOINTS.AI_DETECT_OBJECTS, formData);
  },

  // Generic AI Analysis (fallback)
  genericAnalyze: (serviceType, inputData) => 
    apiPost(API_ENDPOINTS.AI_ANALYZE, { service_type: serviceType, input_data: inputData }),

  // Document Generation
  generateDocument: (template, data) => 
    apiPost(API_ENDPOINTS.AI_DOCUMENTS_GENERATE, { template, data }),
  
  getDocumentHistory: () => apiPost(API_ENDPOINTS.AI_DOCUMENTS_HISTORY),
  
  getAIInsights: () => apiPost(API_ENDPOINTS.AI_INSIGHTS)
};

// Individual exports for direct usage
export const predictAirQualityAnomaly = (data) => apiPost(API_ENDPOINTS.AI_PREDICT_AIR_QUALITY, data);
export const analyzeSymptoms = (symptoms) => apiPost(API_ENDPOINTS.AI_ANALYZE_SYMPTOMS, { symptoms });
export const predictDisease = (symptoms) => apiPost(API_ENDPOINTS.AI_PREDICT_DISEASE, { symptoms });
export const analyzeMedicalText = (text) => apiPost(API_ENDPOINTS.AI_ANALYZE_MEDICAL_TEXT, { text });
export const summarizeText = (text) => apiPost(API_ENDPOINTS.AI_SUMMARIZE_MEDICAL, { text });
export const analyzeLabResults = (labData) => apiPost(API_ENDPOINTS.AI_ANALYZE_LAB_RESULTS, { lab_results: labData });
export const assessRisk = (data) => apiPost(API_ENDPOINTS.AI_ASSESS_RISK, { data });

// ✅ ADDED: New individual exports for hospital services
export const chatWithAI = (message, context) => aiService.chatWithAI(message, context);
export const analyzeHospitalData = (hospitalData, analysisType) => aiService.analyzeHospitalData(hospitalData, analysisType);
export const analyzePatientData = (patientData) => aiService.analyzePatientData(patientData);
export const analyzeMedicalEquipment = (equipmentData) => aiService.analyzeMedicalEquipment(equipmentData);
export const analyzeStaffPerformance = (staffData) => aiService.analyzeStaffPerformance(staffData);
export const analyzeDepartmentEfficiency = (departmentData) => aiService.analyzeDepartmentEfficiency(departmentData);
export const optimizeHospitalResources = (resourceData) => aiService.optimizeHospitalResources(resourceData);
export const predictPatientAdmissions = (historicalData, period) => aiService.predictPatientAdmissions(historicalData, period);
export const analyzeMedicalResearch = (researchData) => aiService.analyzeMedicalResearch(researchData);
export const analyzeClinicalTrials = (trialData) => aiService.analyzeClinicalTrials(trialData);
export const analyzeDrugInteractions = (drugData) => aiService.analyzeDrugInteractions(drugData);
export const recommendTreatment = (patientCase) => aiService.recommendTreatment(patientCase);
export const analyzeMedicalProtocols = (protocolData) => aiService.analyzeMedicalProtocols(protocolData);

// Video Analysis specific exports
export const analyzeVideo = (videoData, config) => aiService.analyzeSafetyVideo(videoData, config);
export const generateReport = (analysisId, format, reportType) => 
  aiService.generateVideoAnalysisReport(analysisId, format, reportType);
export const getAnalysisHistory = (limit) => aiService.getVideoAnalysisHistory(limit);
export const getAnalysisResult = (analysisId) => aiService.getVideoAnalysisResult(analysisId);
export const deleteAnalysis = (analysisId) => aiService.deleteVideoAnalysis(analysisId);
export const getAnalyticsSummary = () => aiService.getVideoAnalyticsSummary();

// Helper function for AI service with fallback
export const aiServiceWithFallback = async (serviceMethod, ...args) => {
  try {
    return await serviceMethod(...args);
  } catch (error) {
    console.warn(`Primary AI service failed, using fallback: ${error.message}`);
    
    // Determine service type for fallback
    let serviceType = 'generic';
    const methodName = serviceMethod.name || '';
    
    if (methodName.includes('analyzeSymptoms')) serviceType = 'symptom_analysis';
    else if (methodName.includes('predictDisease')) serviceType = 'disease_prediction';
    else if (methodName.includes('assessRisk')) serviceType = 'risk_assessment';
    else if (methodName.includes('analyzeSafetyDocument')) serviceType = 'safety_document';
    else if (methodName.includes('analyzeSafetyVideo') || methodName.includes('analyzeVideo')) {
      serviceType = 'video_analysis';
    }
    else if (methodName.includes('analyzeEnvironmental')) serviceType = 'environmental';
    else if (methodName.includes('chatWithAI')) serviceType = 'chat_assistant';
    else if (methodName.includes('analyzeHospital')) serviceType = 'hospital_analysis';
    else if (methodName.includes('analyzePatient')) serviceType = 'patient_analysis';
    else if (methodName.includes('analyzeMedicalEquipment')) serviceType = 'equipment_analysis';
    
    // Use generic analysis as fallback
    return await aiService.genericAnalyze(serviceType, args[0]);
  }
};

// Mock data generators for development
export const aiMockService = {
  analyzeSymptoms: () => Promise.resolve({
    success: true,
    analysis: {
      possible_conditions: ['Common Cold', 'Influenza', 'Allergic Rhinitis'],
      severity: 'Mild',
      recommendations: ['Rest and hydration', 'Over-the-counter medication', 'Consult doctor if symptoms worsen'],
      confidence: 87
    }
  }),
  
  assessRisk: () => Promise.resolve({
    success: true,
    risk_score: 65,
    risk_level: 'MEDIUM',
    factors: ['Inadequate safety protocols', 'Potential electrical hazards', 'Emergency procedures need review'],
    recommendations: ['Implement safety signage', 'Schedule training', 'Conduct equipment inspection'],
    confidence: 85
  }),
  
  analyzeSafetyDocument: () => Promise.resolve({
    success: true,
    compliance_score: 78,
    risks: ['Missing emergency contacts', 'Outdated procedures', 'Inadequate PPE requirements'],
    recommendations: ['Update contacts', 'Review procedures', 'Specify PPE requirements'],
    analyzed_sections: 15
  }),

  // ✅ ADDED: AI Chat Assistant Mock
  chatWithAI: (message, context) => Promise.resolve({
    success: true,
    message: "I've analyzed your query about hospital management. Based on the information provided, I recommend reviewing the patient admission protocols and staff scheduling system for optimal efficiency.",
    suggestions: [
      "Show me patient admission statistics",
      "Analyze staff performance metrics",
      "Generate department efficiency report"
    ],
    timestamp: new Date().toISOString()
  }),

  // ✅ ADDED: Hospital Data Analysis Mock
  analyzeHospitalData: (hospitalData) => Promise.resolve({
    success: true,
    analysis: {
      efficiency_score: 82,
      recommendations: [
        'Optimize staff scheduling in emergency department',
        'Reduce patient wait times by 15%',
        'Improve resource allocation in ICU'
      ],
      key_metrics: {
        patient_satisfaction: 4.2,
        staff_efficiency: 78,
        resource_utilization: 85
      }
    }
  }),

  // ✅ ADDED: Patient Data Analysis Mock
  analyzePatientData: (patientData) => Promise.resolve({
    success: true,
    analysis: {
      risk_assessment: 'Low risk',
      recommended_tests: ['Blood work', 'ECG', 'Chest X-ray'],
      potential_conditions: ['Hypertension', 'Type 2 Diabetes'],
      follow_up_required: true
    }
  }),

  // Video Analysis Mock - UPDATED TO MATCH YOLOv5 RESPONSE FORMAT
  analyzeSafetyVideo: (videoData, config = {}) => Promise.resolve({
    success: true,
    analysis_id: `video_analysis_${Date.now()}`,
    analysis: {
      risk_level: 'MEDIUM',
      risk_score: 45,
      compliance_score: 78,
      violations_detected: 2,
      violations: [
        {
          type: 'no_helmet',
          severity: 'high',
          confidence: 0.91,
          description: 'Worker without safety helmet',
          timestamp: 45.2,
          timestamp_formatted: '00:00:45',
          frame_number: 15,
          location: 'Construction area',
          bbox: [120, 80, 180, 220]
        },
        {
          type: 'no_safety_vest',
          severity: 'medium',
          confidence: 0.68,
          description: 'Worker without high-visibility vest',
          timestamp: 90.5,
          timestamp_formatted: '00:01:30',
          frame_number: 30,
          location: 'Vehicle pathway',
          bbox: [200, 90, 260, 230]
        }
      ],
      detections: [
        { class: 'person', confidence: 0.95, timestamp: 45.2, frame_number: 15, bbox: [120, 80, 180, 220] },
        { class: 'hard_hat', confidence: 0.87, timestamp: 45.2, frame_number: 15, bbox: [125, 75, 155, 105] },
        { class: 'safety_vest', confidence: 0.92, timestamp: 45.2, frame_number: 15, bbox: [120, 110, 180, 180] },
        { class: 'fire_extinguisher', confidence: 0.78, timestamp: 150.8, frame_number: 50, bbox: [400, 200, 450, 280] }
      ],
      frames_analyzed: 60,
      total_frames: 60,
      duration_seconds: 187,
      analysis_type: config.analysis_type || 'safety_monitoring',
      industry: config.industry || 'construction',
      insights: [
        {
          title: 'PPE Compliance Issues',
          description: '2 PPE violations detected involving helmet and safety vest usage',
          recommendation: 'Enforce PPE policies and conduct safety training'
        },
        {
          title: 'Work Area Safety',
          description: 'Good overall safety compliance except for PPE issues',
          recommendation: 'Focus on PPE enforcement and regular safety audits'
        }
      ]
    },
    filename: videoData.name || 'uploaded-video.mp4',
    timestamp: new Date().toISOString()
  }),

  // Quick analysis mocks - UPDATED FOR YOLOv5 FORMAT
  analyzeVideoForRisks: (videoData) => Promise.resolve({
    success: true,
    analysis_id: `risk_analysis_${Date.now()}`,
    analysis_type: 'risk_assessment',
    results: {
      risk_level: 'HIGH',
      risk_score: 75,
      critical_risks: 2,
      high_risks: 1,
      total_hazards: 5,
      recommendations: [
        'Install edge protection on scaffolding',
        'Secure electrical panels',
        'Improve housekeeping in work area'
      ],
      analysis_details: {
        frames_analyzed: 45,
        duration_seconds: 156
      }
    },
    timestamp: new Date().toISOString()
  }),

  analyzeVideoForPPE: (videoData) => Promise.resolve({
    success: true,
    analysis_id: `ppe_analysis_${Date.now()}`,
    analysis_type: 'ppe_compliance',
    results: {
      compliance_rate: 67,
      violations: 2,
      ppe_items_checked: ['helmet', 'vest', 'gloves', 'boots'],
      non_compliant_workers: 2,
      recommendations: [
        'Enforce helmet policy in construction areas',
        'Provide high-visibility vests for all workers'
      ],
      detailed_violations: [
        {
          type: 'no_helmet',
          confidence: 0.91,
          timestamp: 45.2,
          description: 'Worker without safety helmet in construction zone'
        }
      ]
    },
    timestamp: new Date().toISOString()
  }),

  generateVideoAnalysisReport: (analysisId, format, reportType) => Promise.resolve({
    success: true,
    report: {
      analysis_id: analysisId,
      filename: 'construction-site.mp4',
      timestamp: new Date().toISOString(),
      analysis_type: 'risk_assessment',
      industry: 'construction',
      results: {
        risk_level: 'MEDIUM',
        risk_score: 45,
        compliance_score: 78,
        violations_detected: 2
      },
      generated_at: new Date().toISOString(),
      report_type: reportType || 'detailed',
      format: format,
      summary: {
        risk_level: 'MEDIUM',
        risk_score: 45,
        compliance_score: 78,
        total_violations: 2,
        total_detections: 15,
        frames_analyzed: 60,
        duration_seconds: 187
      },
      recommendations: [
        'Enforce hard hat policy in construction areas',
        'Improve high-visibility vest compliance',
        'Conduct regular safety training sessions'
      ],
      statistics: {
        violation_types: {
          'no_helmet': 1,
          'no_safety_vest': 1
        },
        detection_classes: {
          'person': 8,
          'hard_hat': 6,
          'safety_vest': 7,
          'fire_extinguisher': 1
        },
        severity_breakdown: {
          'critical': 0,
          'high': 1,
          'medium': 1,
          'low': 0
        }
      }
    },
    download_url: `/reports/video/${analysisId}.${format}`,
    message: `${format.toUpperCase()} report generated successfully`
  }),

  getVideoAnalysisHistory: (limit = 10) => Promise.resolve({
    success: true,
    history: [
      {
        id: 'video_analysis_20231201_143025',
        filename: 'construction-site.mp4',
        analysis_type: 'risk_assessment',
        industry: 'construction',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        file_size: 45678901,
        duration_seconds: 187,
        violations_detected: 2,
        risk_score: 45,
        compliance_score: 78,
        risk_level: 'MEDIUM',
        frames_analyzed: 60,
        total_detections: 15,
        critical_violations: 0
      },
      {
        id: 'video_analysis_20231130_092315',
        filename: 'factory-floor.mp4',
        analysis_type: 'ppe_compliance',
        industry: 'manufacturing',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        file_size: 23456789,
        duration_seconds: 123,
        violations_detected: 1,
        risk_score: 25,
        compliance_score: 85,
        risk_level: 'LOW',
        frames_analyzed: 45,
        total_detections: 22,
        critical_violations: 0
      }
    ],
    total_count: 2,
    summary: {
      total_analyses: 2,
      average_risk_score: 35,
      average_compliance_score: 81.5,
      total_violations_detected: 3,
      time_period: "Last 2 analyses"
    }
  }),

  getVideoAnalysisResult: (analysisId) => Promise.resolve({
    success: true,
    analysis: {
      id: analysisId,
      filename: 'construction-site.mp4',
      analysis_config: {
        analysis_type: 'risk_assessment',
        industry: 'construction',
        confidence_threshold: 0.6
      },
      results: {
        risk_level: 'MEDIUM',
        risk_score: 45,
        compliance_score: 78,
        violations_detected: 2,
        violations: [
          {
            type: 'no_helmet',
            severity: 'high',
            confidence: 0.91,
            description: 'Worker without safety helmet',
            timestamp: 45.2,
            timestamp_formatted: '00:00:45',
            frame_number: 15,
            location: 'Construction area'
          }
        ],
        detections: [
          { class: 'person', confidence: 0.95, timestamp: 45.2, frame_number: 15 },
          { class: 'hard_hat', confidence: 0.87, timestamp: 45.2, frame_number: 15 }
        ],
        frames_analyzed: 60,
        duration_seconds: 187
      },
      timestamp: new Date().toISOString(),
      file_size: 45678901,
      duration_seconds: 187
    }
  }),

  getVideoAnalyticsSummary: () => Promise.resolve({
    success: true,
    analytics: {
      total_analyses: 15,
      total_violations_detected: 28,
      total_objects_detected: 345,
      total_video_duration_hours: 2.5,
      risk_level_distribution: {
        'LOW': 8,
        'MEDIUM': 5,
        'HIGH': 2,
        'CRITICAL': 0
      },
      industry_distribution: {
        'construction': 9,
        'manufacturing': 4,
        'healthcare': 2
      },
      recent_activity: {
        last_7_days_analyses: 5,
        last_7_days_violations: 12,
        average_daily_analyses: 0.7
      },
      performance_metrics: {
        average_risk_score: 32.5,
        average_compliance_score: 76.8,
        violations_per_analysis: 1.87,
        detections_per_analysis: 23.0
      }
    }
  }),

  // Camera Monitoring Mocks
  startCameraMonitoring: () => Promise.resolve({
    success: true,
    monitorId: 'monitor-' + Date.now(),
    status: 'active',
    startedAt: new Date().toISOString()
  }),

  getMonitoringStatus: () => Promise.resolve({
    success: true,
    activeMonitors: 2,
    violationsToday: 5,
    systemStatus: 'operational'
  })
};

// Check if AI services are available
export const checkAIServiceHealth = async () => {
  try {
    const response = await apiPost(API_ENDPOINTS.AI_INSIGHTS);
    return {
      available: true,
      models: response.data?.models || [
        'Medical NER', 
        'Text Classification', 
        'Risk Assessment',
        'Video Analysis',
        'Object Detection',
        'PPE Compliance',
        'Hospital Analytics',
        'Patient Analysis',
        'Drug Interaction',
        'Clinical Trial Analysis'
      ],
      status: 'operational'
    };
  } catch (error) {
    return {
      available: false,
      status: 'unavailable',
      error: error.message
    };
  }
};

// Utility function for video file validation
export const validateVideoFile = (file) => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = [
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'video/x-matroska',
    'video/webm',
    'video/mpeg'
  ];
  const allowedExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.mpeg', '.mpg'];

  // Check file size
  if (file.size > maxSize) {
    throw new Error('Video file must be smaller than 100MB');
  }

  // Check file type
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    throw new Error('Please upload a valid video file (MP4, AVI, MOV, MKV, WebM)');
  }

  return true;
};

// Progress tracking wrapper for long-running operations
export const withProgressTracking = async (apiCall, onProgress) => {
  try {
    // Simulate progress for demo (replace with actual progress tracking)
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 90) {
        clearInterval(progressInterval);
      }
      onProgress(Math.min(progress, 90));
    }, 500);

    const result = await apiCall;
    
    clearInterval(progressInterval);
    onProgress(100);
    
    return result;
  } catch (error) {
    onProgress(0);
    throw error;
  }
};

export default aiService;