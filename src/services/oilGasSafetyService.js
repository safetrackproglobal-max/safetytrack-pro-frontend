// src/services/oilGasSafetyService.js
import axios from 'axios';

const healthcareApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 45000, // Increased timeout for oil & gas data processing
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for auth
healthcareApi.interceptors.request.use(
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

// Add response interceptor for error handling
healthcareApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const oilGasSafetyService = {
  // Industry Configuration
  industry: {
    // Get Oil & Gas industry configuration
    getIndustryConfig: (sector = null, region = null) => {
      return healthcareApi.get('/hse/industries/oil_gas', {
        params: { sector, region }
      });
    },

    // Get Oil & Gas dashboard data
    getIndustryDashboard: (facilityId = null, timeframe = '30d') => {
      return healthcareApi.get('/hse/industries/oil_gas/dashboard', {
        params: { facility_id: facilityId, timeframe }
      });
    },

    // Get Oil & Gas analytics
    getIndustryAnalytics: (timeframe = '30d', metrics = ['safety', 'production', 'environmental']) => {
      return healthcareApi.get('/hse/industries/oil_gas/analytics', {
        params: { timeframe, metrics: metrics.join(',') }
      });
    },

    // Get Oil & Gas compliance status
    getIndustryCompliance: (regulatoryBody = 'all', jurisdiction = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/compliance', {
        params: { regulatory_body: regulatoryBody, jurisdiction }
      });
    },

    // Get industry risk profile
    getRiskProfile: (sector = 'upstream', region = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/risk-profile', {
        params: { sector, region }
      });
    },

    // Get regulatory updates
    getRegulatoryUpdates: (jurisdiction = 'international') => {
      return healthcareApi.get('/hse/industries/oil_gas/regulatory-updates', {
        params: { jurisdiction }
      });
    },

    // Get industry benchmarks
    getIndustryBenchmarks: (sector = null, facilityType = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/benchmarks', {
        params: { sector, facility_type: facilityType }
      });
    }
  },

  // Safety Tools Management
  tools: {
    // Get all Oil & Gas safety tools
    getTools: (category = null, sector = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/tools', {
        params: { category, sector }
      });
    },

    // Execute a specific tool
    executeTool: (toolId, parameters, context = {}) => {
      return healthcareApi.post(`/hse/tools/${toolId}/execute`, {
        parameters,
        context,
        industry: 'oil_gas'
      });
    },

    // Get tool execution history
    getToolExecutionHistory: (toolId, limit = 10, offset = 0) => {
      return healthcareApi.get(`/hse/tools/${toolId}/executions`, {
        params: { limit, offset }
      });
    },

    // Get tool analytics
    getToolAnalytics: (toolId, timeframe = '30d') => {
      return healthcareApi.get(`/hse/tools/${toolId}/analytics`, {
        params: { timeframe }
      });
    },

    // Save tool configuration
    saveToolConfiguration: (toolId, configuration, metadata = {}) => {
      return healthcareApi.put(`/hse/tools/${toolId}/configuration`, {
        configuration,
        metadata
      });
    },

    // Validate tool configuration
    validateToolConfiguration: (toolId, configuration) => {
      return healthcareApi.post(`/hse/tools/${toolId}/validate`, { configuration });
    },

    // Oil & Gas specific tool operations
    calculateH2SRisk: (facilityData, operationalConditions = {}) => {
      return healthcareApi.post('/hse/oil_gas/tools/h2s-risk/calculate', {
        facility_data: facilityData,
        operational_conditions: operationalConditions,
        safety_margin: 1.5
      });
    },

    performHAZOPStudy: (processData, deviationAnalysis = {}) => {
      return healthcareApi.post('/hse/oil_gas/tools/hazop/study', {
        process_data: processData,
        deviation_analysis: deviationAnalysis,
        study_depth: 'comprehensive'
      });
    },

    calculateFlareSystem: (flareData, environmentalFactors = {}) => {
      return healthcareApi.post('/hse/oil_gas/tools/flare-system/calculate', {
        flare_data: flareData,
        environmental_factors: environmentalFactors,
        compliance_check: true
      });
    },

    simulateGasDispersion: (releaseData, atmosphericConditions) => {
      return healthcareApi.post('/hse/oil_gas/tools/gas-dispersion/simulate', {
        release_data: releaseData,
        atmospheric_conditions: atmosphericConditions,
        simulation_type: 'dynamic'
      });
    },

    // Advanced oil & gas tools
    calculatePressureVessel: (vesselData, materialProperties) => {
      return healthcareApi.post('/hse/oil_gas/tools/pressure-vessel/calculate', {
        vessel_data: vesselData,
        material_properties: materialProperties,
        design_code: 'asme'
      });
    },

    optimizePipelineRouting: (routeData, terrainData = {}) => {
      return healthcareApi.post('/hse/oil_gas/tools/pipeline-routing/optimize', {
        route_data: routeData,
        terrain_data: terrainData,
        optimization_goal: 'safety_efficiency'
      });
    },

    calculateBlowoutPreventer: (bopData, wellConditions) => {
      return healthcareApi.post('/hse/oil_gas/tools/bop/calculate', {
        bop_data: bopData,
        well_conditions: wellConditions,
        safety_factor: 2.0
      });
    }
  },

  // Document Management
  documents: {
    // Get all Oil & Gas documents
    getDocuments: (filters = {}, pagination = { page: 1, limit: 20 }) => {
      return healthcareApi.get('/hse/industries/oil_gas/documents', {
        params: { ...filters, ...pagination }
      });
    },

    // Search documents
    searchDocuments: (query, filters = {}, options = {}) => {
      return healthcareApi.get('/hse/industries/oil_gas/documents/search', {
        params: {
          q: query,
          ...filters,
          fuzzy: options.fuzzy || true,
          highlight: options.highlight || true
        }
      });
    },

    // Get document details
    getDocument: (documentId, includeMetadata = true) => {
      return healthcareApi.get(`/hse/documents/${documentId}`, {
        params: { include_metadata: includeMetadata }
      });
    },

    // Download document
    downloadDocument: (documentId, version = null) => {
      return healthcareApi.get(`/hse/documents/${documentId}/download`, {
        responseType: 'blob',
        params: { version }
      });
    },

    // Upload new document
    uploadDocument: (formData, metadata = {}) => {
      return healthcareApi.post('/hse/industries/oil_gas/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        params: { metadata: JSON.stringify(metadata) }
      });
    },

    // Create custom document
    createDocument: (documentData, templateId = null) => {
      return healthcareApi.post('/hse/industries/oil_gas/documents', {
        ...documentData,
        template_id: templateId
      });
    },

    // Update document
    updateDocument: (documentId, updates, versionComment = '') => {
      return healthcareApi.put(`/hse/documents/${documentId}`, {
        ...updates,
        version_comment: versionComment
      });
    },

    // Delete document
    deleteDocument: (documentId, permanent = false) => {
      return healthcareApi.delete(`/hse/documents/${documentId}`, {
        params: { permanent }
      });
    },

    // Get document versions
    getDocumentVersions: (documentId, limit = 10) => {
      return healthcareApi.get(`/hse/documents/${documentId}/versions`, {
        params: { limit }
      });
    },

    // Restore document version
    restoreDocumentVersion: (documentId, version) => {
      return healthcareApi.post(`/hse/documents/${documentId}/restore`, { version });
    },

    // Get document analytics
    getDocumentAnalytics: (documentId, timeframe = '30d') => {
      return healthcareApi.get(`/hse/documents/${documentId}/analytics`, {
        params: { timeframe }
      });
    },

    // Get oil & gas specific templates
    getOGGTemplates: (templateType = null, sector = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/templates', {
        params: { type: templateType, sector }
      });
    },

    // Get API compliance documents
    getAPIDocuments: (standard = null) => {
      return healthcareApi.get('/hse/oil_gas/documents/api', {
        params: { standard }
      });
    },

    // Get OSHA PSM documents
    getPSMDocuments: (facilityId = null) => {
      return healthcareApi.get('/hse/oil_gas/documents/psm', {
        params: { facility_id: facilityId }
      });
    }
  },

  // AI Services
  ai: {
    // Get all AI services for Oil & Gas
    getServices: (category = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/ai-services', {
        params: { category }
      });
    },

    // Access AI service
    accessService: (serviceId, inputData, options = {}) => {
      return healthcareApi.post(`/hse/ai/services/${serviceId}/execute`, {
        input_data: inputData,
        options: options
      });
    },

    // Generate document with AI
    generateDocument: (serviceId, templateData, customization = {}) => {
      return healthcareApi.post(`/hse/ai/services/${serviceId}/generate-document`, {
        ...templateData,
        customization: customization
      });
    },

    // Analyze risk with AI
    analyzeRisk: (riskData, historicalData = {}) => {
      return healthcareApi.post('/hse/ai/oil_gas/analyze-risk', {
        risk_data: riskData,
        historical_data: historicalData,
        risk_model: 'advanced'
      });
    },

    // Environmental analysis with AI
    analyzeEnvironmental: (environmentalData, regulatoryRequirements = {}) => {
      return healthcareApi.post('/hse/ai/oil_gas/environmental-analysis', {
        environmental_data: environmentalData,
        regulatory_requirements: regulatoryRequirements,
        analysis_depth: 'comprehensive'
      });
    },

    // Document analysis with AI
    analyzeDocument: (text, analysisType = 'safety', context = {}) => {
      return healthcareApi.post('/hse/ai/oil_gas/document-analysis', {
        text,
        analysis_type: analysisType,
        context: context
      });
    },

    // Get AI service status
    getServiceStatus: (serviceId) => {
      return healthcareApi.get(`/hse/ai/services/${serviceId}/status`);
    },

    // Get AI service analytics
    getServiceAnalytics: (serviceId, timeframe = '30d') => {
      return healthcareApi.get(`/hse/ai/services/${serviceId}/analytics`, {
        params: { timeframe }
      });
    },

    // Advanced AI services
    predictEquipmentFailure: (equipmentData, operationalHistory = {}) => {
      return healthcareApi.post('/hse/ai/oil_gas/predict-equipment-failure', {
        equipment_data: equipmentData,
        operational_history: operationalHistory,
        prediction_confidence: 0.95
      });
    },

    optimizeProductionSafety: (productionData, safetyConstraints = {}) => {
      return healthcareApi.post('/hse/ai/oil_gas/optimize-production-safety', {
        production_data: productionData,
        safety_constraints: safetyConstraints,
        optimization_target: 'balanced'
      });
    },

    analyzeCorrosionRisk: (materialData, environmentalConditions) => {
      return healthcareApi.post('/hse/ai/oil_gas/analyze-corrosion-risk', {
        material_data: materialData,
        environmental_conditions: environmentalConditions,
        risk_timeframe: '5y'
      });
    }
  },

  // Risk Assessment
  risk: {
    // Create new risk assessment
    createAssessment: (assessmentData, methodology = 'bowtie') => {
      return healthcareApi.post('/hse/industries/oil_gas/risk-assessments', {
        ...assessmentData,
        methodology: methodology
      });
    },

    // Get risk assessments
    getAssessments: (filters = {}, pagination = { page: 1, limit: 20 }) => {
      return healthcareApi.get('/hse/industries/oil_gas/risk-assessments', {
        params: { ...filters, ...pagination }
      });
    },

    // Get specific risk assessment
    getAssessment: (assessmentId, includeRecommendations = true) => {
      return healthcareApi.get(`/hse/risk-assessments/${assessmentId}`, {
        params: { include_recommendations: includeRecommendations }
      });
    },

    // Update risk assessment
    updateAssessment: (assessmentId, updates, revisionNotes = '') => {
      return healthcareApi.put(`/hse/risk-assessments/${assessmentId}`, {
        ...updates,
        revision_notes: revisionNotes
      });
    },

    // Submit risk assessment findings
    submitFindings: (assessmentId, findings, mitigationPlans = []) => {
      return healthcareApi.post(`/hse/risk-assessments/${assessmentId}/findings`, {
        findings,
        mitigation_plans: mitigationPlans
      });
    },

    // Get risk assessment templates
    getTemplates: (assessmentType = null, sector = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/risk-templates', {
        params: { assessment_type: assessmentType, sector }
      });
    },

    // Calculate risk matrix
    calculateRiskMatrix: (hazardData, consequenceData) => {
      return healthcareApi.post('/hse/oil_gas/risk/calculate-matrix', {
        hazard_data: hazardData,
        consequence_data: consequenceData
      });
    },

    // Get risk analytics
    getRiskAnalytics: (facilityId = null, timeframe = '90d') => {
      return healthcareApi.get('/hse/oil_gas/risk/analytics', {
        params: { facility_id: facilityId, timeframe }
      });
    }
  },

  // Incident Management
  incidents: {
    // Report new incident
    reportIncident: (incidentData, immediateActions = []) => {
      return healthcareApi.post('/hse/industries/oil_gas/incidents', {
        ...incidentData,
        immediate_actions: immediateActions
      });
    },

    // Get incidents
    getIncidents: (filters = {}, pagination = { page: 1, limit: 20 }) => {
      return healthcareApi.get('/hse/industries/oil_gas/incidents', {
        params: { ...filters, ...pagination }
      });
    },

    // Get incident details
    getIncident: (incidentId, includeInvestigation = true) => {
      return healthcareApi.get(`/hse/incidents/${incidentId}`, {
        params: { include_investigation: includeInvestigation }
      });
    },

    // Update incident
    updateIncident: (incidentId, updates, notificationList = []) => {
      return healthcareApi.put(`/hse/incidents/${incidentId}`, {
        ...updates,
        notification_list: notificationList
      });
    },

    // Get incident statistics
    getIncidentStats: (period = '30d', incidentType = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/incidents/stats', {
        params: { period, incident_type: incidentType }
      });
    },

    // Submit incident investigation
    submitInvestigation: (incidentId, investigationData, rootCauseAnalysis = {}) => {
      return healthcareApi.post(`/hse/incidents/${incidentId}/investigation`, {
        ...investigationData,
        root_cause_analysis: rootCauseAnalysis
      });
    },

    // Get incident trends
    getIncidentTrends: (timeframe = '90d', analysisType = 'monthly') => {
      return healthcareApi.get('/hse/oil_gas/incidents/trends', {
        params: { timeframe, analysis_type: analysisType }
      });
    }
  },

  // Training Management
  training: {
    // Get training courses
    getCourses: (category = null, certificationLevel = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/training', {
        params: { category, certification_level: certificationLevel }
      });
    },

    // Get training records
    getTrainingRecords: (filters = {}, includeCertifications = true) => {
      return healthcareApi.get('/hse/industries/oil_gas/training-records', {
        params: { ...filters, include_certifications: includeCertifications }
      });
    },

    // Enroll in training
    enrollTraining: (courseId, employeeData, enrollmentOptions = {}) => {
      return healthcareApi.post(`/hse/training/courses/${courseId}/enroll`, {
        ...employeeData,
        enrollment_options: enrollmentOptions
      });
    },

    // Complete training
    completeTraining: (recordId, completionData, assessmentResults = {}) => {
      return healthcareApi.post(`/hse/training/records/${recordId}/complete`, {
        ...completionData,
        assessment_results: assessmentResults
      });
    },

    // Get training analytics
    getTrainingAnalytics: (facilityId = null, timeframe = '365d') => {
      return healthcareApi.get('/hse/industries/oil_gas/training/analytics', {
        params: { facility_id: facilityId, timeframe }
      });
    },

    // Get competency assessments
    getCompetencyAssessments: (employeeId = null, competencyArea = null) => {
      return healthcareApi.get('/hse/oil_gas/training/competency-assessments', {
        params: { employee_id: employeeId, competency_area: competencyArea }
      });
    },

    // Renew certification
    renewCertification: (certificationId, renewalData) => {
      return healthcareApi.post(`/hse/oil_gas/training/certifications/${certificationId}/renew`, renewalData);
    }
  },

  // Compliance Management
  compliance: {
    // Get compliance requirements
    getRequirements: (regulatoryBody = null, requirementType = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/compliance', {
        params: { regulatory_body: regulatoryBody, requirement_type: requirementType }
      });
    },

    // Get compliance status
    getComplianceStatus: (facilityId = null, regulatoryFramework = 'all') => {
      return healthcareApi.get('/hse/industries/oil_gas/compliance-status', {
        params: { facility_id: facilityId, regulatory_framework: regulatoryFramework }
      });
    },

    // Submit compliance evidence
    submitEvidence: (requirementId, evidenceData, verificationData = {}) => {
      return healthcareApi.post(`/hse/compliance/${requirementId}/evidence`, {
        ...evidenceData,
        verification_data: verificationData
      });
    },

    // Schedule compliance audit
    scheduleAudit: (auditData, preparationChecklist = []) => {
      return healthcareApi.post('/hse/industries/oil_gas/compliance/audits', {
        ...auditData,
        preparation_checklist: preparationChecklist
      });
    },

    // Get compliance reports
    getComplianceReports: (reportType = null, timeframe = '30d') => {
      return healthcareApi.get('/hse/industries/oil_gas/compliance/reports', {
        params: { report_type: reportType, timeframe }
      });
    },

    // Get regulatory alerts
    getRegulatoryAlerts: (jurisdiction = null, alertLevel = null) => {
      return healthcareApi.get('/hse/oil_gas/compliance/regulatory-alerts', {
        params: { jurisdiction, alert_level: alertLevel }
      });
    },

    // Submit compliance deviation
    submitComplianceDeviation: (deviationData, correctiveActions = []) => {
      return healthcareApi.post('/hse/oil_gas/compliance/deviations', {
        ...deviationData,
        corrective_actions: correctiveActions
      });
    }
  },

  // Safety Inspections
  inspections: {
    // Get inspections
    getInspections: (filters = {}, pagination = { page: 1, limit: 20 }) => {
      return healthcareApi.get('/hse/industries/oil_gas/inspections', {
        params: { ...filters, ...pagination }
      });
    },

    // Create inspection
    createInspection: (inspectionData, inspectionTeam = []) => {
      return healthcareApi.post('/hse/industries/oil_gas/inspections', {
        ...inspectionData,
        inspection_team: inspectionTeam
      });
    },

    // Update inspection
    updateInspection: (inspectionId, updates, revisionNotes = '') => {
      return healthcareApi.put(`/hse/inspections/${inspectionId}`, {
        ...updates,
        revision_notes: revisionNotes
      });
    },

    // Submit inspection findings
    submitFindings: (inspectionId, findings, photographicEvidence = []) => {
      return healthcareApi.post(`/hse/inspections/${inspectionId}/findings`, {
        findings,
        photographic_evidence: photographicEvidence
      });
    },

    // Get inspection templates
    getInspectionTemplates: (inspectionType = null, facilityType = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/inspection-templates', {
        params: { inspection_type: inspectionType, facility_type: facilityType }
      });
    },

    // Get inspection analytics
    getInspectionAnalytics: (facilityId = null, timeframe = '90d') => {
      return healthcareApi.get('/hse/oil_gas/inspections/analytics', {
        params: { facility_id: facilityId, timeframe }
      });
    },

    // Schedule recurring inspection
    scheduleRecurringInspection: (scheduleData, notificationSettings = {}) => {
      return healthcareApi.post('/hse/oil_gas/inspections/schedule-recurring', {
        ...scheduleData,
        notification_settings: notificationSettings
      });
    }
  },

  // Permit to Work (PTW)
  ptw: {
    // Get PTW templates
    getTemplates: (workType = null, riskLevel = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/ptw-templates', {
        params: { work_type: workType, risk_level: riskLevel }
      });
    },

    // Get PTW requests
    getRequests: (filters = {}, pagination = { page: 1, limit: 20 }) => {
      return healthcareApi.get('/hse/industries/oil_gas/ptw-requests', {
        params: { ...filters, ...pagination }
      });
    },

    // Create PTW request
    createRequest: (requestData, supportingDocuments = []) => {
      return healthcareApi.post('/hse/industries/oil_gas/ptw-requests', {
        ...requestData,
        supporting_documents: supportingDocuments
      });
    },

    // Review PTW request
    reviewRequest: (requestId, reviewData, approvalConditions = []) => {
      return healthcareApi.put(`/hse/ptw-requests/${requestId}/review`, {
        ...reviewData,
        approval_conditions: approvalConditions
      });
    },

    // Get PTW analytics
    getAnalytics: (facilityId = null, timeframe = '30d') => {
      return healthcareApi.get('/hse/industries/oil_gas/ptw/analytics', {
        params: { facility_id: facilityId, timeframe }
      });
    },

    // Close PTW request
    closePTWRequest: (requestId, closeoutData, lessonsLearned = []) => {
      return healthcareApi.put(`/hse/ptw-requests/${requestId}/close`, {
        ...closeoutData,
        lessons_learned: lessonsLearned
      });
    },

    // Get PTW statistics
    getPTWStatistics: (facilityId = null, period = '30d') => {
      return healthcareApi.get('/hse/oil_gas/ptw/statistics', {
        params: { facility_id: facilityId, period }
      });
    }
  },

  // Facility Operations
  operations: {
    // Get facility information
    getFacilityInfo: (facilityId, includeOperations = true) => {
      return healthcareApi.get(`/hse/oil_gas/operations/facilities/${facilityId}`, {
        params: { include_operations: includeOperations }
      });
    },

    // Update facility operations
    updateFacilityOperations: (facilityId, operationsData, operationalConstraints = {}) => {
      return healthcareApi.put(`/hse/oil_gas/operations/facilities/${facilityId}`, {
        ...operationsData,
        operational_constraints: operationalConstraints
      });
    },

    // Get production data
    getProductionData: (facilityId, timeframe = '30d', metrics = ['volume', 'quality', 'efficiency']) => {
      return healthcareApi.get('/hse/oil_gas/operations/production', {
        params: { facility_id: facilityId, timeframe, metrics: metrics.join(',') }
      });
    },

    // Submit operational report
    submitOperationalReport: (facilityId, reportData, incidents = []) => {
      return healthcareApi.post(`/hse/oil_gas/operations/facilities/${facilityId}/report`, {
        ...reportData,
        incidents: incidents
      });
    },

    // Get maintenance schedule
    getMaintenanceSchedule: (facilityId, maintenanceType = null) => {
      return healthcareApi.get('/hse/oil_gas/operations/maintenance-schedule', {
        params: { facility_id: facilityId, maintenance_type: maintenanceType }
      });
    },

    // Update equipment status
    updateEquipmentStatus: (equipmentId, statusData, maintenanceRecord = {}) => {
      return healthcareApi.put(`/hse/oil_gas/operations/equipment/${equipmentId}/status`, {
        ...statusData,
        maintenance_record: maintenanceRecord
      });
    }
  },

  // Environmental Management
  environmental: {
    // Get environmental compliance
    getEnvironmentalCompliance: (facilityId, regulatoryFramework = null) => {
      return healthcareApi.get('/hse/oil_gas/environmental/compliance', {
        params: { facility_id: facilityId, regulatory_framework: regulatoryFramework }
      });
    },

    // Submit environmental monitoring
    submitEnvironmentalMonitoring: (monitoringData, complianceCheck = true) => {
      return healthcareApi.post('/hse/oil_gas/environmental/monitoring', {
        ...monitoringData,
        compliance_check: complianceCheck
      });
    },

    // Get emissions data
    getEmissionsData: (facilityId, timeframe = '30d', emissionType = null) => {
      return healthcareApi.get('/hse/oil_gas/environmental/emissions', {
        params: { facility_id: facilityId, timeframe, emission_type: emissionType }
      });
    },

    // Submit spill report
    submitSpillReport: (spillData, containmentMeasures = []) => {
      return healthcareApi.post('/hse/oil_gas/environmental/spill-reports', {
        ...spillData,
        containment_measures: containmentMeasures
      });
    },

    // Get environmental permits
    getEnvironmentalPermits: (facilityId = null, permitType = null) => {
      return healthcareApi.get('/hse/oil_gas/environmental/permits', {
        params: { facility_id: facilityId, permit_type: permitType }
      });
    },

    // Calculate environmental impact
    calculateEnvironmentalImpact: (operationData, environmentalFactors = {}) => {
      return healthcareApi.post('/hse/oil_gas/environmental/calculate-impact', {
        operation_data: operationData,
        environmental_factors: environmentalFactors
      });
    }
  },

  // Analytics and Reporting
  analytics: {
    // Get safety metrics
    getSafetyMetrics: (timeframe = '30d', comparisonPeriod = null) => {
      return healthcareApi.get('/hse/industries/oil_gas/metrics', {
        params: { timeframe, comparison_period: comparisonPeriod }
      });
    },

    // Get trend data
    getTrends: (metric, period = '90d', analysisGranularity = 'weekly') => {
      return healthcareApi.get('/hse/industries/oil_gas/trends', {
        params: { metric, period, analysis_granularity: analysisGranularity }
      });
    },

    // Generate report
    generateReport: (reportConfig, format = 'pdf') => {
      return healthcareApi.post('/hse/industries/oil_gas/reports', {
        ...reportConfig,
        format: format
      });
    },

    // Get predictive analytics
    getPredictiveAnalytics: (facilityId = null, predictionType = 'safety') => {
      return healthcareApi.get('/hse/industries/oil_gas/predictive-analytics', {
        params: { facility_id: facilityId, prediction_type: predictionType }
      });
    },

    // Export data
    exportData: (exportConfig, dataFormat = 'json') => {
      return healthcareApi.post('/hse/industries/oil_gas/export', {
        ...exportConfig,
        data_format: dataFormat
      });
    },

    // Get KPI dashboard
    getKPIDashboard: (facilityId = null, timeframe = '30d') => {
      return healthcareApi.get('/hse/oil_gas/analytics/kpi-dashboard', {
        params: { facility_id: facilityId, timeframe }
      });
    },

    // Get benchmarking data
    getBenchmarkingData: (sector = null, region = null) => {
      return healthcareApi.get('/hse/oil_gas/analytics/benchmarking', {
        params: { sector, region }
      });
    }
  },

  // Real-time Monitoring
  monitoring: {
    // Get real-time data
    getRealTimeData: (facilityId = null, dataTypes = ['process', 'safety', 'environmental']) => {
      return healthcareApi.get('/hse/industries/oil_gas/monitoring', {
        params: { facility_id: facilityId, data_types: dataTypes.join(',') }
      });
    },

    // Get alerts
    getAlerts: (filters = {}, pagination = { page: 1, limit: 20 }) => {
      return healthcareApi.get('/hse/industries/oil_gas/alerts', {
        params: { ...filters, ...pagination }
      });
    },

    // Acknowledge alert
    acknowledgeAlert: (alertId, acknowledgmentData, actionTaken = '') => {
      return healthcareApi.put(`/hse/alerts/${alertId}/acknowledge`, {
        ...acknowledgmentData,
        action_taken: actionTaken
      });
    },

    // Get sensor data
    getSensorData: (sensorId, timeframe = '24h', dataResolution = 'minute') => {
      return healthcareApi.get(`/hse/sensors/${sensorId}/data`, {
        params: { timeframe, data_resolution: dataResolution }
      });
    },

    // Update monitoring thresholds
    updateMonitoringThresholds: (facilityId, thresholds) => {
      return healthcareApi.put(`/hse/oil_gas/monitoring/thresholds`, {
        facility_id: facilityId,
        thresholds: thresholds
      });
    },

    // Get equipment monitoring
    getEquipmentMonitoring: (facilityId, equipmentType = null) => {
      return healthcareApi.get('/hse/oil_gas/monitoring/equipment', {
        params: { facility_id: facilityId, equipment_type: equipmentType }
      });
    }
  },

  // File Upload
  upload: {
    // Upload single file
    uploadFile: (file, category = 'documents', metadata = {}, options = {}) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('industry_code', 'oil_gas');
      formData.append('upload_options', JSON.stringify(options));
      
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      return healthcareApi.post('/hse/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      });
    },

    // Upload multiple files
    uploadMultipleFiles: (files, category = 'documents', metadata = {}, options = {}) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('category', category);
      formData.append('industry_code', 'oil_gas');
      formData.append('upload_options', JSON.stringify(options));
      
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      return healthcareApi.post('/hse/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000
      });
    },

    // Upload process safety data
    uploadProcessSafetyData: (file, facilityId, dataType, metadata = {}) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('facility_id', facilityId);
      formData.append('data_type', dataType);
      formData.append('industry_code', 'oil_gas');
      
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      return healthcareApi.post('/hse/oil_gas/upload/process-safety', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
  },

  // Emergency Response
  emergency: {
    // Get emergency procedures
    getEmergencyProcedures: (facilityId, emergencyType = null) => {
      return healthcareApi.get('/hse/oil_gas/emergency/procedures', {
        params: { facility_id: facilityId, emergency_type: emergencyType }
      });
    },

    // Submit emergency drill
    submitEmergencyDrill: (drillData, participantPerformance = {}) => {
      return healthcareApi.post('/hse/oil_gas/emergency/drills', {
        ...drillData,
        participant_performance: participantPerformance
      });
    },

    // Get emergency equipment
    getEmergencyEquipment: (facilityId, equipmentType = null) => {
      return healthcareApi.get('/hse/oil_gas/emergency/equipment', {
        params: { facility_id: facilityId, equipment_type: equipmentType }
      });
    },

    // Update emergency response plan
    updateEmergencyResponsePlan: (facilityId, planData, stakeholders = []) => {
      return healthcareApi.put(`/hse/oil_gas/emergency/facilities/${facilityId}/response-plan`, {
        ...planData,
        stakeholders: stakeholders
      });
    },

    // Simulate emergency scenario
    simulateEmergencyScenario: (scenarioData, responseTeam) => {
      return healthcareApi.post('/hse/oil_gas/emergency/simulate-scenario', {
        scenario_data: scenarioData,
        response_team: responseTeam
      });
    }
  },

  // System Operations
  system: {
    // Get system status
    getSystemStatus: (component = null) => {
      return healthcareApi.get('/hse/system/status', {
        params: { component }
      });
    },

    // Get user preferences
    getUserPreferences: (userId = null) => {
      return healthcareApi.get('/hse/user/preferences', {
        params: { user_id: userId }
      });
    },

    // Update user preferences
    updateUserPreferences: (preferences, notificationSettings = {}) => {
      return healthcareApi.put('/hse/user/preferences', {
        preferences,
        notification_settings: notificationSettings
      });
    },

    // Bulk upload data
    bulkUpload: (file, dataType, mappingConfig = {}) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('data_type', dataType);
      formData.append('industry_id', 'oil_gas');
      formData.append('mapping_config', JSON.stringify(mappingConfig));

      return healthcareApi.post('/hse/industries/oil_gas/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000
      });
    },

    // Get audit trail
    getAuditTrail: (entityType = null, entityId = null, timeframe = '30d') => {
      return healthcareApi.get('/hse/system/audit-trail', {
        params: { entity_type: entityType, entity_id: entityId, timeframe }
      });
    }
  }
};

export default oilGasSafetyService;