// src/services/healthcareSafetyService.js
import axios from 'axios';

// Create dedicated axios instance for healthcare
const healthcareApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 45000, // Increased timeout for healthcare data processing
  headers: {
    'Content-Type': 'application/json',
    'X-Industry-Type': 'healthcare',
    'X-Module': 'healthcare-safety',
    'X-Client-Version': '1.0.0'
  },
  withCredentials: true
});

// Request interceptor for healthcare-specific headers
healthcareApi.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add healthcare-specific headers
    config.headers['X-Healthcare-Facility'] = localStorage.getItem('currentFacility') || 'default';
    config.headers['X-User-Role'] = localStorage.getItem('userRole') || 'user';
    
    // HIPAA compliance headers
    config.headers['X-HIPAA-Compliant'] = 'true';
    config.headers['X-Data-Sensitivity'] = 'PHI'; // Protected Health Information
    
    // Log healthcare API calls for auditing
    console.log(`🏥 Healthcare API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      facility: config.headers['X-Healthcare-Facility'],
      userRole: config.headers['X-User-Role'],
      timestamp: new Date().toISOString()
    });

    return config;
  },
  (error) => {
    console.error('Healthcare API Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with healthcare-specific error handling
healthcareApi.interceptors.response.use(
  (response) => {
    console.log('🔍 Request Headers being sent:', config.headers);
    console.log(`✅ Healthcare API Response: ${response.status} ${response.config.url}`, {
      facility: response.config.headers['X-Healthcare-Facility'],
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    
    console.error(`❌ Healthcare API Error [${url}]:`, {
      status,
      message: error.response?.data?.message,
      facility: error.config?.headers['X-Healthcare-Facility'],
      timestamp: new Date().toISOString()
    });

    // Healthcare-specific error handling
    if (status === 401) {
      // Unauthorized - clear tokens and redirect
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('currentFacility');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?reason=healthcare_unauthorized';
      }
    } else if (status === 403) {
      // HIPAA compliance violation
      console.error('HIPAA Compliance Violation - Access to PHI denied');
    } else if (status === 422) {
      // Healthcare data validation error
      console.error('Healthcare Data Validation Error:', error.response?.data);
    } else if (status === 503) {
      // Healthcare service unavailable
      console.error('Healthcare Service Temporarily Unavailable');
    }

    return Promise.reject(error);
  }
);

// Generic API call method with enhanced healthcare error handling
const makeHealthcareApiCall = async (endpoint, options = {}) => {
  try {
    const response = await healthcareApi({
      url: endpoint,
      ...options
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`🏥 Healthcare API Error for ${endpoint}:`, error);

    // Enhanced healthcare-specific error classification
    if (error.code === 'NETWORK_ERROR') {
      return {
        success: false,
        error: 'Network connectivity issue - Healthcare services require stable connection',
        code: 'NETWORK_ERROR',
        severity: 'high',
        retryable: true
      };
    }

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;

      // Healthcare-specific status code handling
      if (status === 402) {
        return {
          success: false,
          error: 'Premium healthcare features require subscription upgrade',
          code: 'PREMIUM_REQUIRED',
          severity: 'medium',
          retryable: false
        };
      }

      if (status === 423) {
        return {
          success: false,
          error: 'Healthcare resource locked - Patient data is being processed',
          code: 'RESOURCE_LOCKED',
          severity: 'medium',
          retryable: true
        };
      }

      if (status === 429) {
        return {
          success: false,
          error: 'Healthcare API rate limit exceeded - Too many requests',
          code: 'RATE_LIMITED',
          severity: 'low',
          retryable: true,
          retryAfter: error.response.headers['retry-after']
        };
      }

      return {
        success: false,
        error: message,
        code: `HTTP_${status}`,
        status,
        severity: status >= 500 ? 'high' : 'medium',
        retryable: status >= 500
      };
    }

    return {
      success: false,
      error: 'Critical healthcare service error - Please contact support',
      code: 'CRITICAL_ERROR',
      severity: 'critical',
      retryable: false,
      requiresSupport: true
    };
  }
};

const healthcareSafetyService = {
  // Industry Configuration with enhanced methods
  industry: {
    // Get Healthcare industry configuration
    getIndustryConfig: () => {
      return makeHealthcareApiCall('/hse/industries/healthcare');
    },

    // Get Healthcare dashboard data with real-time metrics
    getIndustryDashboard: (facilityId = null) => {
      const params = facilityId ? { facility_id: facilityId } : {};
      return makeHealthcareApiCall('/hse/industries/healthcare/dashboard', { params });
    },

    // Get Healthcare analytics with advanced filtering
    getIndustryAnalytics: (timeframe = '30d', facilityId = null, metrics = []) => {
      const params = { timeframe };
      if (facilityId) params.facility_id = facilityId;
      if (metrics.length > 0) params.metrics = metrics.join(',');
      
      return makeHealthcareApiCall(`/hse/industries/healthcare/analytics`, { params });
    },

    // Get Healthcare compliance status with detailed breakdown
    getIndustryCompliance: (facilityId = null, standard = 'all') => {
      const params = { standard };
      if (facilityId) params.facility_id = facilityId;
      return makeHealthcareApiCall('/hse/industries/healthcare/compliance', { params });
    },

    // Get real-time healthcare metrics
    getRealTimeMetrics: (facilityId) => {
      const params = facilityId ? { facility_id: facilityId } : {};
      return makeHealthcareApiCall('/hse/industries/healthcare/metrics/realtime', { params });
    },

    // Get healthcare trends and predictions
    getPredictiveAnalytics: (period = '90d', facilityId = null) => {
      const params = { period };
      if (facilityId) params.facility_id = facilityId;
      return makeHealthcareApiCall('/hse/industries/healthcare/analytics/predictive', { params });
    }
  },

  // Enhanced Safety Tools Management
  tools: {
    // Get all Healthcare safety tools with categories
    getTools: (category = null, facilityType = null) => {
      const params = {};
      if (category) params.category = category;
      if (facilityType) params.facility_type = facilityType;
      return makeHealthcareApiCall('/hse/industries/healthcare/tools', { params });
    },

    // Execute a specific healthcare tool with enhanced parameters
    executeTool: (toolId, parameters, facilityContext = {}) => {
      return makeHealthcareApiCall(`/hse/tools/${toolId}/execute`, {
        method: 'POST',
        data: { 
          parameters,
          facility_context: facilityContext,
          execution_timestamp: new Date().toISOString()
        }
      });
    },

    // Get tool execution history with pagination
    getToolExecutionHistory: (toolId, limit = 10, offset = 0, facilityId = null) => {
      const params = { limit, offset };
      if (facilityId) params.facility_id = facilityId;
      return makeHealthcareApiCall(`/hse/tools/${toolId}/executions`, { params });
    },

    // Get healthcare tool analytics with trends
    getToolAnalytics: (toolId, timeframe = '30d') => {
      return makeHealthcareApiCall(`/hse/tools/${toolId}/analytics?timeframe=${timeframe}`);
    },

    // Save tool configuration with versioning
    saveToolConfiguration: (toolId, configuration, versionNotes = '') => {
      return makeHealthcareApiCall(`/hse/tools/${toolId}/configuration`, {
        method: 'PUT',
        data: { 
          configuration,
          version_notes: versionNotes,
          updated_at: new Date().toISOString()
        }
      });
    },

    // Healthcare-specific tool operations with enhanced parameters
    assessInfectionRisk: (facilityData, patientData, riskFactors = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/tools/infection-risk/assess', {
        method: 'POST',
        data: {
          facility_data: facilityData,
          patient_data: patientData,
          risk_factors: riskFactors,
          assessment_timestamp: new Date().toISOString()
        }
      });
    },

    monitorPatientSafety: (safetyIndicators, timeframe, facilityContext) => {
      return makeHealthcareApiCall('/hse/healthcare/tools/patient-safety/monitor', {
        method: 'POST',
        data: {
          safety_indicators: safetyIndicators,
          timeframe: timeframe,
          facility_context: facilityContext,
          monitoring_start: new Date().toISOString()
        }
      });
    },

    calculateBiohazardExposure: (biohazardData, exposureScenario, safetyMeasures = []) => {
      return makeHealthcareApiCall('/hse/healthcare/tools/biohazard/calculate-exposure', {
        method: 'POST',
        data: {
          biohazard_data: biohazardData,
          exposure_scenario: exposureScenario,
          safety_measures: safetyMeasures,
          calculation_timestamp: new Date().toISOString()
        }
      });
    },

    verifyMedicalEquipment: (equipmentData, safetyStandards, calibrationData = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/tools/medical-equipment/verify', {
        method: 'POST',
        data: {
          equipment_data: equipmentData,
          safety_standards: safetyStandards,
          calibration_data: calibrationData,
          verification_timestamp: new Date().toISOString()
        }
      });
    },

    trackPPECompliance: (complianceData, facilityInfo, compliancePeriod = 'shift') => {
      return makeHealthcareApiCall('/hse/healthcare/tools/ppe/compliance-track', {
        method: 'POST',
        data: {
          compliance_data: complianceData,
          facility_info: facilityInfo,
          compliance_period: compliancePeriod,
          tracking_start: new Date().toISOString()
        }
      });
    },

    analyzeMedicationSafety: (medicationData, patientFactors, clinicalContext = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/tools/medication-safety/analyze', {
        method: 'POST',
        data: {
          medication_data: medicationData,
          patient_factors: patientFactors,
          clinical_context: clinicalContext,
          analysis_timestamp: new Date().toISOString()
        }
      });
    }
  },

  // Enhanced Document Management with HIPAA compliance
  documents: {
    // Get all Healthcare documents with advanced filtering
    getDocuments: (filters = {}, pagination = { page: 1, limit: 20 }) => {
      const params = { ...filters, ...pagination };
      return makeHealthcareApiCall('/hse/industries/healthcare/documents', { params });
    },

    // Search healthcare documents with relevance scoring
    searchDocuments: (query, filters = {}, options = { fuzzy: true, highlight: true }) => {
      return makeHealthcareApiCall('/hse/industries/healthcare/documents/search', {
        method: 'POST',
        data: { 
          query, 
          filters,
          options,
          search_timestamp: new Date().toISOString()
        }
      });
    },

    // Get document details with version history
    getDocument: (documentId, includeVersions = false) => {
      const params = includeVersions ? { include_versions: true } : {};
      return makeHealthcareApiCall(`/hse/documents/${documentId}`, { params });
    },

    // Download healthcare document
    downloadDocument: (documentId) => {
      return makeHealthcareApiCall(`/hse/documents/${documentId}/download`, {
        method: 'GET',
        responseType: 'blob'
      });
    },

    // Upload new healthcare document with enhanced metadata
    uploadDocument: (formData, metadata = {}) => {
      return makeHealthcareApiCall('/hse/industries/healthcare/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
        timeout: 120000 // 2 minutes for large files
      });
    },

    // Create healthcare-specific document
    createDocument: (documentData, facilityContext = {}) => {
      return makeHealthcareApiCall('/hse/industries/healthcare/documents', {
        method: 'POST',
        data: {
          ...documentData,
          facility_context: facilityContext,
          created_at: new Date().toISOString()
        }
      });
    },

    // Update healthcare document with audit trail
    updateDocument: (documentId, updates, revisionNotes = '') => {
      return makeHealthcareApiCall(`/hse/documents/${documentId}`, {
        method: 'PUT',
        data: {
          ...updates,
          revision_notes: revisionNotes,
          updated_at: new Date().toISOString()
        }
      });
    },

    // Delete document with confirmation
    deleteDocument: (documentId, reason = '') => {
      return makeHealthcareApiCall(`/hse/documents/${documentId}`, {
        method: 'DELETE',
        data: { 
          deletion_reason: reason,
          deleted_at: new Date().toISOString()
        }
      });
    },

    // Get document versions with detailed history
    getDocumentVersions: (documentId, limit = 10) => {
      return makeHealthcareApiCall(`/hse/documents/${documentId}/versions?limit=${limit}`);
    },

    // Get healthcare-specific templates
    getHealthcareTemplates: (templateType = null, facilityType = null) => {
      const params = {};
      if (templateType) params.type = templateType;
      if (facilityType) params.facility_type = facilityType;
      return makeHealthcareApiCall('/hse/industries/healthcare/templates', { params });
    },

    // Get infection control documents
    getInfectionControlDocuments: (facilityId = null) => {
      const params = facilityId ? { facility_id: facilityId } : {};
      return makeHealthcareApiCall('/hse/healthcare/documents/infection-control', { params });
    },

    // Get patient safety documents
    getPatientSafetyDocuments: (facilityId = null) => {
      const params = facilityId ? { facility_id: facilityId } : {};
      return makeHealthcareApiCall('/hse/healthcare/documents/patient-safety', { params });
    },

    // Get biohazard safety documents
    getBiohazardDocuments: (facilityId = null) => {
      const params = facilityId ? { facility_id: facilityId } : {};
      return makeHealthcareApiCall('/hse/healthcare/documents/biohazard', { params });
    }
  },

  // Enhanced AI Services
  ai: {
    // Get all AI services for Healthcare
    getServices: (facilityType = null) => {
      const params = facilityType ? { facility_type: facilityType } : {};
      return makeHealthcareApiCall('/hse/industries/healthcare/ai-services', { params });
    },

    // Access healthcare AI service with enhanced context
    accessService: (serviceId, inputData, clinicalContext = {}) => {
      return makeHealthcareApiCall(`/hse/ai/services/${serviceId}/execute`, {
        method: 'POST',
        data: {
          ...inputData,
          clinical_context: clinicalContext,
          execution_timestamp: new Date().toISOString()
        }
      });
    },

    // Healthcare-specific AI services with enhanced parameters
    predictInfectionOutbreak: (patientData, facilityData, riskFactors = {}) => {
      return makeHealthcareApiCall('/hse/ai/healthcare/predict-infection-outbreak', {
        method: 'POST',
        data: {
          patient_data: patientData,
          facility_data: facilityData,
          risk_factors: riskFactors,
          prediction_timestamp: new Date().toISOString()
        }
      });
    },

    analyzePatientSafety: (incidentData, safetyMetrics, facilityContext = {}) => {
      return makeHealthcareApiCall('/hse/ai/healthcare/analyze-patient-safety', {
        method: 'POST',
        data: {
          incident_data: incidentData,
          safety_metrics: safetyMetrics,
          facility_context: facilityContext,
          analysis_timestamp: new Date().toISOString()
        }
      });
    },

    monitorPPECompliance: (complianceData, realTimeFeeds, alertThresholds = {}) => {
      return makeHealthcareApiCall('/hse/ai/healthcare/monitor-ppe-compliance', {
        method: 'POST',
        data: {
          compliance_data: complianceData,
          real_time_feeds: realTimeFeeds,
          alert_thresholds: alertThresholds,
          monitoring_start: new Date().toISOString()
        }
      });
    },

    predictMedicalErrors: (clinicalData, workflowData, riskFactors = {}) => {
      return makeHealthcareApiCall('/hse/ai/healthcare/predict-medical-errors', {
        method: 'POST',
        data: {
          clinical_data: clinicalData,
          workflow_data: workflowData,
          risk_factors: riskFactors,
          prediction_timestamp: new Date().toISOString()
        }
      });
    },

    // Generate healthcare document with AI
    generateHealthcareDocument: (templateType, documentData, facilityContext = {}) => {
      return makeHealthcareApiCall('/hse/ai/healthcare/generate-document', {
        method: 'POST',
        data: {
          template_type: templateType,
          document_data: documentData,
          facility_context: facilityContext,
          generation_timestamp: new Date().toISOString()
        }
      });
    },

    // Get AI service status with detailed metrics
    getServiceStatus: (serviceId, includeMetrics = false) => {
      const params = includeMetrics ? { include_metrics: true } : {};
      return makeHealthcareApiCall(`/hse/ai/services/${serviceId}/status`, { params });
    },

    // Validate HIPAA compliance with detailed reporting
    validateHIPAACompliance: (dataProcessingDetails, auditContext = {}) => {
      return makeHealthcareApiCall('/hse/ai/healthcare/validate-hipaa', {
        method: 'POST',
        data: {
          ...dataProcessingDetails,
          audit_context: auditContext,
          validation_timestamp: new Date().toISOString()
        }
      });
    }
  },

  // Enhanced Infection Control
  infectionControl: {
    // Get infection control data with advanced filtering
    getInfectionData: (facilityId, timeframe = '30d', metrics = []) => {
      const params = { facility_id: facilityId, timeframe };
      if (metrics.length > 0) params.metrics = metrics.join(',');
      return makeHealthcareApiCall('/hse/healthcare/infection-control/data', { params });
    },

    // Submit infection control report with detailed context
    submitInfectionReport: (reportData, facilityContext = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/infection-control/reports', {
        method: 'POST',
        data: {
          ...reportData,
          facility_context: facilityContext,
          reported_at: new Date().toISOString()
        }
      });
    },

    // Get outbreak alerts with severity levels
    getOutbreakAlerts: (facilityId, status = 'active', severity = null) => {
      const params = { facility_id: facilityId, status };
      if (severity) params.severity = severity;
      return makeHealthcareApiCall('/hse/healthcare/infection-control/alerts', { params });
    },

    // Update control measures with implementation tracking
    updateControlMeasures: (facilityId, measuresData, implementationPlan = {}) => {
      return makeHealthcareApiCall(`/hse/healthcare/infection-control/measures`, {
        method: 'PUT',
        data: {
          facility_id: facilityId,
          measures_data: measuresData,
          implementation_plan: implementationPlan,
          updated_at: new Date().toISOString()
        }
      });
    },

    // Get infection rates with trend analysis
    getInfectionRates: (facilityId, period = '90d', includeTrends = true) => {
      const params = { 
        facility_id: facilityId, 
        period,
        include_trends: includeTrends 
      };
      return makeHealthcareApiCall('/hse/healthcare/infection-control/rates', { params });
    },

    // Submit hand hygiene compliance with observation data
    submitHandHygieneCompliance: (complianceData, observationContext = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/infection-control/hand-hygiene', {
        method: 'POST',
        data: {
          ...complianceData,
          observation_context: observationContext,
          observed_at: new Date().toISOString()
        }
      });
    }
  },

  // Enhanced Patient Safety
  patientSafety: {
    // Get patient safety indicators with benchmarking
    getSafetyIndicators: (facilityId, benchmark = false) => {
      const params = { facility_id: facilityId, benchmark };
      return makeHealthcareApiCall('/hse/healthcare/patient-safety/indicators', { params });
    },

    // Report patient safety incident with detailed investigation
    reportSafetyIncident: (incidentData, immediateActions = []) => {
      return makeHealthcareApiCall('/hse/healthcare/patient-safety/incidents', {
        method: 'POST',
        data: {
          ...incidentData,
          immediate_actions: immediateActions,
          reported_at: new Date().toISOString()
        }
      });
    },

    // Get incident history with advanced filtering
    getIncidentHistory: (facilityId, filters = {}, pagination = { page: 1, limit: 20 }) => {
      const params = { facility_id: facilityId, ...filters, ...pagination };
      return makeHealthcareApiCall('/hse/healthcare/patient-safety/incidents', { params });
    },

    // Update incident investigation with root cause analysis
    updateIncidentInvestigation: (incidentId, investigationData, rootCauseAnalysis = {}) => {
      return makeHealthcareApiCall(`/hse/healthcare/patient-safety/incidents/${incidentId}/investigation`, {
        method: 'PUT',
        data: {
          ...investigationData,
          root_cause_analysis: rootCauseAnalysis,
          investigated_at: new Date().toISOString()
        }
      });
    },

    // Get fall prevention data with risk assessment
    getFallPreventionData: (facilityId, riskLevel = null) => {
      const params = { facility_id: facilityId };
      if (riskLevel) params.risk_level = riskLevel;
      return makeHealthcareApiCall('/hse/healthcare/patient-safety/fall-prevention', { params });
    },

    // Submit safety improvement plan with implementation timeline
    submitSafetyImprovementPlan: (planData, timeline = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/patient-safety/improvement-plans', {
        method: 'POST',
        data: {
          ...planData,
          implementation_timeline: timeline,
          created_at: new Date().toISOString()
        }
      });
    }
  },

  // Enhanced Biohazard Management
  biohazard: {
    // Get biohazard inventory with safety levels
    getBiohazardInventory: (facilityId, safetyLevel = null) => {
      const params = { facility_id: facilityId };
      if (safetyLevel) params.safety_level = safetyLevel;
      return makeHealthcareApiCall('/hse/healthcare/biohazard/inventory', { params });
    },

    // Submit biohazard risk assessment with containment plans
    submitRiskAssessment: (assessmentData, containmentPlan = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/biohazard/risk-assessments', {
        method: 'POST',
        data: {
          ...assessmentData,
          containment_plan: containmentPlan,
          assessed_at: new Date().toISOString()
        }
      });
    },

    // Get exposure incidents with response tracking
    getExposureIncidents: (facilityId, limit = 20, includeResponse = true) => {
      const params = { 
        facility_id: facilityId, 
        limit,
        include_response: includeResponse 
      };
      return makeHealthcareApiCall('/hse/healthcare/biohazard/exposure-incidents', { params });
    },

    // Update biosafety level with certification
    updateBiosafetyLevel: (facilityId, levelData, certification = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/biohazard/biosafety-level', {
        method: 'PUT',
        data: {
          facility_id: facilityId,
          level_data: levelData,
          certification: certification,
          updated_at: new Date().toISOString()
        }
      });
    },

    // Get waste management data with disposal tracking
    getWasteManagement: (facilityId, wasteType = null) => {
      const params = { facility_id: facilityId };
      if (wasteType) params.waste_type = wasteType;
      return makeHealthcareApiCall('/hse/healthcare/biohazard/waste-management', { params });
    }
  },

  // Enhanced Medication Safety
  medicationSafety: {
    // Get medication safety data with alert thresholds
    getMedicationData: (facilityId, includeAlerts = true) => {
      const params = { 
        facility_id: facilityId,
        include_alerts: includeAlerts 
      };
      return makeHealthcareApiCall('/hse/healthcare/medication-safety/data', { params });
    },

    // Report medication error with severity classification
    reportMedicationError: (errorData, severity = 'medium', impactAssessment = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/medication-safety/errors', {
        method: 'POST',
        data: {
          ...errorData,
          severity: severity,
          impact_assessment: impactAssessment,
          reported_at: new Date().toISOString()
        }
      });
    },

    // Get drug interaction alerts with patient context
    getDrugInteractionAlerts: (patientId, medicationList, patientFactors = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/medication-safety/drug-interactions', {
        method: 'POST',
        data: {
          patient_id: patientId,
          medication_list: medicationList,
          patient_factors: patientFactors,
          checked_at: new Date().toISOString()
        }
      });
    },

    // Update medication protocol with approval workflow
    updateMedicationProtocol: (protocolData, approval = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/medication-safety/protocols', {
        method: 'PUT',
        data: {
          ...protocolData,
          approval: approval,
          updated_at: new Date().toISOString()
        }
      });
    },

    // Get high-risk medication monitoring
    getHighRiskMedication: (facilityId, riskLevel = 'high') => {
      const params = { 
        facility_id: facilityId,
        risk_level: riskLevel 
      };
      return makeHealthcareApiCall('/hse/healthcare/medication-safety/high-risk', { params });
    }
  },

  // Enhanced PPE Management
  ppe: {
    // Get PPE inventory with stock levels
    getPPEInventory: (facilityId, lowStockAlert = false) => {
      const params = { facility_id: facilityId };
      if (lowStockAlert) params.low_stock_alert = true;
      return makeHealthcareApiCall('/hse/healthcare/ppe/inventory', { params });
    },

    // Submit PPE compliance data with observation details
    submitComplianceData: (complianceData, observationDetails = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/ppe/compliance', {
        method: 'POST',
        data: {
          ...complianceData,
          observation_details: observationDetails,
          observed_at: new Date().toISOString()
        }
      });
    },

    // Get compliance analytics with department breakdown
    getComplianceAnalytics: (facilityId, timeframe = '30d', byDepartment = false) => {
      const params = { 
        facility_id: facilityId, 
        timeframe,
        by_department: byDepartment 
      };
      return makeHealthcareApiCall('/hse/healthcare/ppe/compliance-analytics', { params });
    },

    // Update PPE usage protocol with training requirements
    updateUsageProtocol: (protocolData, trainingRequirements = []) => {
      return makeHealthcareApiCall('/hse/healthcare/ppe/usage-protocol', {
        method: 'PUT',
        data: {
          ...protocolData,
          training_requirements: trainingRequirements,
          updated_at: new Date().toISOString()
        }
      });
    },

    // Get training compliance with certification status
    getTrainingCompliance: (facilityId, includeCertifications = true) => {
      const params = { 
        facility_id: facilityId,
        include_certifications: includeCertifications 
      };
      return makeHealthcareApiCall('/hse/healthcare/ppe/training-compliance', { params });
    }
  },

  // Enhanced Training and Education
  training: {
    // Get training modules with completion tracking
    getTrainingModules: (facilityId, includeProgress = true) => {
      const params = { 
        facility_id: facilityId,
        include_progress: includeProgress 
      };
      return makeHealthcareApiCall('/hse/healthcare/training/modules', { params });
    },

    // Get staff training records with certification status
    getStaffTraining: (facilityId, filters = {}, includeCertifications = true) => {
      const params = { 
        facility_id: facilityId,
        include_certifications: includeCertifications,
        ...filters 
      };
      return makeHealthcareApiCall('/hse/healthcare/training/staff-records', { params });
    },

    // Enroll staff in training with prerequisites
    enrollStaff: (staffId, trainingData, prerequisites = []) => {
      return makeHealthcareApiCall(`/hse/healthcare/training/staff/${staffId}/enroll`, {
        method: 'POST',
        data: {
          ...trainingData,
          prerequisites: prerequisites,
          enrolled_at: new Date().toISOString()
        }
      });
    },

    // Complete training with assessment results
    completeTraining: (recordId, completionData, assessmentResults = {}) => {
      return makeHealthcareApiCall(`/hse/healthcare/training/records/${recordId}/complete`, {
        method: 'POST',
        data: {
          ...completionData,
          assessment_results: assessmentResults,
          completed_at: new Date().toISOString()
        }
      });
    },

    // Get training analytics with effectiveness metrics
    getTrainingAnalytics: (facilityId, includeEffectiveness = true) => {
      const params = { 
        facility_id: facilityId,
        include_effectiveness: includeEffectiveness 
      };
      return makeHealthcareApiCall('/hse/healthcare/training/analytics', { params });
    },

    // Schedule training session with resource allocation
    scheduleTraining: (sessionData, resources = []) => {
      return makeHealthcareApiCall('/hse/healthcare/training/sessions', {
        method: 'POST',
        data: {
          ...sessionData,
          resources: resources,
          scheduled_at: new Date().toISOString()
        }
      });
    }
  },

  // Enhanced Compliance and Regulations
  compliance: {
    // Get HIPAA compliance status with gap analysis
    getHIPAACompliance: (facilityId, includeGapAnalysis = true) => {
      const params = { 
        facility_id: facilityId,
        include_gap_analysis: includeGapAnalysis 
      };
      return makeHealthcareApiCall('/hse/healthcare/compliance/hipaa', { params });
    },

    // Submit compliance evidence with documentation
    submitComplianceEvidence: (requirementId, evidenceData, documentation = []) => {
      return makeHealthcareApiCall(`/hse/healthcare/compliance/requirements/${requirementId}/evidence`, {
        method: 'POST',
        data: {
          ...evidenceData,
          documentation: documentation,
          submitted_at: new Date().toISOString()
        }
      });
    },

    // Get regulatory standards with implementation guidance
    getRegulatoryStandards: (standardType = null, includeGuidance = true) => {
      const params = { include_guidance: includeGuidance };
      if (standardType) params.type = standardType;
      return makeHealthcareApiCall('/hse/healthcare/compliance/standards', { params });
    },

    // Schedule compliance audit with preparation checklist
    scheduleComplianceAudit: (auditData, preparationChecklist = []) => {
      return makeHealthcareApiCall('/hse/healthcare/compliance/audits', {
        method: 'POST',
        data: {
          ...auditData,
          preparation_checklist: preparationChecklist,
          scheduled_at: new Date().toISOString()
        }
      });
    },

    // Get audit history with findings tracking
    getAuditHistory: (facilityId, limit = 10, includeFindings = true) => {
      const params = { 
        facility_id: facilityId, 
        limit,
        include_findings: includeFindings 
      };
      return makeHealthcareApiCall('/hse/healthcare/compliance/audit-history', { params });
    }
  },

  // Enhanced Facility Management
  facility: {
    // Get healthcare facilities with status information
    getFacilities: (includeStatus = true) => {
      const params = { include_status: includeStatus };
      return makeHealthcareApiCall('/hse/healthcare/facilities', { params });
    },

    // Get facility details with comprehensive information
    getFacilityDetails: (facilityId, includeDepartments = true) => {
      const params = { include_departments: includeDepartments };
      return makeHealthcareApiCall(`/hse/healthcare/facilities/${facilityId}`, { params });
    },

    // Get department safety data with performance metrics
    getDepartmentSafety: (facilityId, departmentId = null, includeMetrics = true) => {
      const params = { include_metrics: includeMetrics };
      if (departmentId) params.department_id = departmentId;
      return makeHealthcareApiCall(`/hse/healthcare/facilities/${facilityId}/departments`, { params });
    },

    // Update facility safety protocols with implementation plan
    updateSafetyProtocols: (facilityId, protocolData, implementationPlan = {}) => {
      return makeHealthcareApiCall(`/hse/healthcare/facilities/${facilityId}/safety-protocols`, {
        method: 'PUT',
        data: {
          ...protocolData,
          implementation_plan: implementationPlan,
          updated_at: new Date().toISOString()
        }
      });
    },

    // Get emergency response plans with drill schedules
    getEmergencyPlans: (facilityId, includeDrills = true) => {
      const params = { include_drills: includeDrills };
      return makeHealthcareApiCall(`/hse/healthcare/facilities/${facilityId}/emergency-plans`, { params });
    }
  },

  // Enhanced Analytics and Reporting
  analytics: {
    // Get patient safety metrics with benchmarking
    getPatientSafetyMetrics: (facilityId, timeframe = '30d', benchmark = false) => {
      const params = { 
        facility_id: facilityId, 
        timeframe,
        benchmark 
      };
      return makeHealthcareApiCall('/hse/healthcare/analytics/patient-safety', { params });
    },

    // Get infection control analytics with outbreak prediction
    getInfectionControlAnalytics: (facilityId, period = '90d', includePredictions = true) => {
      const params = { 
        facility_id: facilityId, 
        period,
        include_predictions: includePredictions 
      };
      return makeHealthcareApiCall('/hse/healthcare/analytics/infection-control', { params });
    },

    // Generate healthcare safety report with custom parameters
    generateSafetyReport: (reportConfig, format = 'pdf') => {
      return makeHealthcareApiCall('/hse/healthcare/analytics/reports', {
        method: 'POST',
        data: {
          ...reportConfig,
          format: format,
          generated_at: new Date().toISOString()
        }
      });
    },

    // Get compliance analytics with regulatory requirements
    getComplianceAnalytics: (facilityId, regulations = []) => {
      const params = { facility_id: facilityId };
      if (regulations.length > 0) params.regulations = regulations.join(',');
      return makeHealthcareApiCall('/hse/healthcare/analytics/compliance', { params });
    },

    // Export healthcare data with filtering options
    exportHealthcareData: (exportConfig, format = 'csv') => {
      return makeHealthcareApiCall('/hse/healthcare/analytics/export', {
        method: 'POST',
        data: {
          ...exportConfig,
          format: format,
          exported_at: new Date().toISOString()
        },
        responseType: 'blob'
      });
    }
  },

  // Enhanced Emergency Response
  emergency: {
    // Get emergency procedures with response times
    getEmergencyProcedures: (facilityId, includeResponseTimes = true) => {
      const params = { 
        facility_id: facilityId,
        include_response_times: includeResponseTimes 
      };
      return makeHealthcareApiCall('/hse/healthcare/emergency/procedures', { params });
    },

    // Submit emergency drill with performance metrics
    submitEmergencyDrill: (facilityId, drillData, performanceMetrics = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/emergency/drills', {
        method: 'POST',
        data: {
          facility_id: facilityId,
          ...drillData,
          performance_metrics: performanceMetrics,
          conducted_at: new Date().toISOString()
        }
      });
    },

    // Get drill history with improvement tracking
    getDrillHistory: (facilityId, limit = 10, includeImprovements = true) => {
      const params = { 
        facility_id: facilityId, 
        limit,
        include_improvements: includeImprovements 
      };
      return makeHealthcareApiCall('/hse/healthcare/emergency/drill-history', { params });
    },

    // Report emergency incident with response details
    reportEmergencyIncident: (incidentData, responseDetails = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/emergency/incidents', {
        method: 'POST',
        data: {
          ...incidentData,
          response_details: responseDetails,
          reported_at: new Date().toISOString()
        }
      });
    },

    // Get emergency equipment with maintenance status
    getEmergencyEquipment: (facilityId, includeMaintenance = true) => {
      const params = { 
        facility_id: facilityId,
        include_maintenance: includeMaintenance 
      };
      return makeHealthcareApiCall('/hse/healthcare/emergency/equipment', { params });
    }
  },

  // Enhanced File Upload for Healthcare
  upload: {
    // Upload healthcare document with enhanced metadata
    uploadHealthcareDocument: (file, documentType, metadata = {}, facilityContext = {}) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('industry_code', 'healthcare');
      formData.append('facility_context', JSON.stringify(facilityContext));
      formData.append('upload_timestamp', new Date().toISOString());
      
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      return makeHealthcareApiCall('/hse/healthcare/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
        timeout: 120000
      });
    },

    // Upload patient safety data (HIPAA compliant) with enhanced security
    uploadPatientSafetyData: (file, dataType, anonymizationConfig, securityMeasures = {}) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('data_type', dataType);
      formData.append('anonymization_config', JSON.stringify(anonymizationConfig));
      formData.append('security_measures', JSON.stringify(securityMeasures));
      formData.append('upload_timestamp', new Date().toISOString());

      return makeHealthcareApiCall('/hse/healthcare/upload/patient-safety', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
        timeout: 120000
      });
    },

    // Upload multiple healthcare files in batch
    uploadMultipleHealthcareFiles: (files, documentType, metadata = {}, facilityContext = {}) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('document_type', documentType);
      formData.append('industry_code', 'healthcare');
      formData.append('facility_context', JSON.stringify(facilityContext));
      formData.append('upload_timestamp', new Date().toISOString());
      
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      return makeHealthcareApiCall('/hse/healthcare/upload/multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
        timeout: 180000
      });
    }
  },

  // Utility methods for healthcare service
  utils: {
    // Set current healthcare facility context
    setCurrentFacility: (facilityId) => {
      localStorage.setItem('currentFacility', facilityId);
    },

    // Get current facility context
    getCurrentFacility: () => {
      return localStorage.getItem('currentFacility') || 'default';
    },

    // Set user role for healthcare operations
    setUserRole: (role) => {
      localStorage.setItem('userRole', role);
    },

    // Get service status and health
    getServiceStatus: () => {
      return makeHealthcareApiCall('/health/healthcare');
    },

    // Clear healthcare-specific cache
    clearCache: () => {
      // Implementation for clearing healthcare-specific cache
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('healthcare_') || key.startsWith('hse_healthcare_')
      );
      keys.forEach(key => localStorage.removeItem(key));
      console.log('🏥 Healthcare service cache cleared');
    },

    // Get API usage statistics
    getUsageStats: (timeframe = '30d', facilityId = null) => {
      const params = { timeframe };
      if (facilityId) params.facility_id = facilityId;
      return makeHealthcareApiCall(`/hse/healthcare/usage/stats`, { params });
    },

    // Validate healthcare data before submission
    validateHealthcareData: (data, schema) => {
      // Basic validation logic - can be extended with proper schema validation
      const requiredFields = schema?.required || [];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return {
          valid: false,
          errors: [`Missing required fields: ${missingFields.join(', ')}`]
        };
      }

      return { valid: true, errors: [] };
    }
  },

  // Batch operations for healthcare data
  batch: {
    // Batch upload healthcare documents
    uploadDocuments: (documents, facilityId, metadata = {}) => {
      return makeHealthcareApiCall('/hse/healthcare/documents/batch-upload', {
        method: 'POST',
        data: {
          documents,
          facility_id: facilityId,
          metadata: metadata,
          batch_timestamp: new Date().toISOString()
        }
      });
    },

    // Batch process safety incidents
    processIncidents: (incidents, facilityId, priority = 'medium') => {
      return makeHealthcareApiCall('/hse/healthcare/incidents/batch-process', {
        method: 'POST',
        data: {
          incidents,
          facility_id: facilityId,
          priority: priority,
          process_timestamp: new Date().toISOString()
        }
      });
    },

    // Batch update patient safety data
    updatePatientSafetyData: (updates, facilityId, validation = true) => {
      return makeHealthcareApiCall('/hse/healthcare/patient-safety/batch-update', {
        method: 'PUT',
        data: {
          updates,
          facility_id: facilityId,
          validate: validation,
          updated_at: new Date().toISOString()
        }
      });
    },

    // Batch generate healthcare reports
    generateReports: (reportRequests, facilityId, format = 'pdf') => {
      return makeHealthcareApiCall('/hse/healthcare/reports/batch-generate', {
        method: 'POST',
        data: {
          report_requests: reportRequests,
          facility_id: facilityId,
          format: format,
          generated_at: new Date().toISOString()
        }
      });
    }
  }
};

// Export both the service and the axios instance for advanced usage
export { healthcareApi };
export default healthcareSafetyService;