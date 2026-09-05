// src/services/maritimeSafetyService.js
import axios from 'axios';

const healthcareApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 45000, // Increased timeout for healthcare data processing
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

const maritimeSafetyService = {
  // Industry Configuration
  industry: {
    // Get Maritime industry configuration
    getIndustryConfig: () => {
      return healthcareApi.get('/hse/industries/maritime');
    },

    // Get Maritime dashboard data
    getIndustryDashboard: () => {
      return healthcareApi.get('/hse/industries/maritime/dashboard');
    },

    // Get Maritime analytics
    getIndustryAnalytics: (timeframe = '30d', filters = {}) => {
      return healthcareApi.get('/hse/industries/maritime/analytics', {
        params: { timeframe, ...filters }
      });
    },

    // Get Maritime compliance status
    getIndustryCompliance: (regulatoryFramework = 'all') => {
      return healthcareApi.get('/hse/industries/maritime/compliance', {
        params: { framework: regulatoryFramework }
      });
    },

    // Get regulatory updates
    getRegulatoryUpdates: (jurisdiction = 'international') => {
      return healthcareApi.get('/hse/industries/maritime/regulatory-updates', {
        params: { jurisdiction }
      });
    },

    // Get industry benchmarks
    getIndustryBenchmarks: (vesselType = null, region = null) => {
      return healthcareApi.get('/hse/industries/maritime/benchmarks', {
        params: { vessel_type: vesselType, region }
      });
    },

    // Get risk assessment overview
    getRiskAssessmentOverview: (vesselCategory = null) => {
      return healthcareApi.get('/hse/industries/maritime/risk-assessment', {
        params: { vessel_category: vesselCategory }
      });
    }
  },

  // Safety Tools Management
  tools: {
    // Get all Maritime safety tools
    getTools: (category = null, vesselType = null) => {
      return healthcareApi.get('/hse/industries/maritime/tools', {
        params: { category, vessel_type: vesselType }
      });
    },

    // Execute a specific maritime tool
    executeTool: (toolId, parameters, context = {}) => {
      return healthcareApi.post(`/hse/tools/${toolId}/execute`, { 
        parameters,
        context,
        industry: 'maritime'
      });
    },

    // Get tool execution history
    getToolExecutionHistory: (toolId, limit = 10, offset = 0) => {
      return healthcareApi.get(`/hse/tools/${toolId}/executions`, {
        params: { limit, offset }
      });
    },

    // Get maritime tool analytics
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

    // Maritime-specific tool operations
    calculateVesselStability: (vesselData, conditions, loadCondition = 'departure') => {
      return healthcareApi.post('/hse/maritime/tools/stability/calculate', {
        vessel_data: vesselData,
        conditions: conditions,
        load_condition: loadCondition,
        timestamp: new Date().toISOString()
      });
    },

    planCargoSecuring: (cargoData, vesselInfo, voyageConditions = {}) => {
      return healthcareApi.post('/hse/maritime/tools/cargo/securing-plan', {
        cargo_data: cargoData,
        vessel_info: vesselInfo,
        voyage_conditions: voyageConditions,
        compliance_check: true
      });
    },

    assessNavigationRisk: (routeData, weatherInfo, vesselCharacteristics = {}) => {
      return healthcareApi.post('/hse/maritime/tools/navigation/risk-assessment', {
        route_data: routeData,
        weather_info: weatherInfo,
        vessel_characteristics: vesselCharacteristics,
        risk_categories: ['collision', 'grounding', 'weather', 'piracy']
      });
    },

    inspectPortSafety: (portData, inspectionCriteria, complianceFramework = 'ism') => {
      return healthcareApi.post('/hse/maritime/tools/port/inspection', {
        port_data: portData,
        inspection_criteria: inspectionCriteria,
        compliance_framework: complianceFramework,
        inspection_date: new Date().toISOString()
      });
    },

    simulateEmergencyResponse: (scenarioData, responseTeam = null) => {
      return healthcareApi.post('/hse/maritime/tools/emergency/simulation', {
        ...scenarioData,
        response_team: responseTeam,
        simulation_timestamp: new Date().toISOString()
      });
    },

    // Advanced tool operations
    calculatePassagePlanning: (voyageData, constraints = {}) => {
      return healthcareApi.post('/hse/maritime/tools/passage-planning', {
        voyage_data: voyageData,
        constraints: constraints,
        optimize_for: 'safety'
      });
    },

    performDynamicPositioning: (vesselData, environmentalConditions) => {
      return healthcareApi.post('/hse/maritime/tools/dynamic-positioning', {
        vessel_data: vesselData,
        environmental_conditions: environmentalConditions,
        control_mode: 'auto'
      });
    }
  },

  // Document Management
  documents: {
    // Get all Maritime documents
    getDocuments: (filters = {}, pagination = { page: 1, limit: 20 }) => {
      return healthcareApi.get('/hse/industries/maritime/documents', {
        params: { ...filters, ...pagination }
      });
    },

    // Search maritime documents
    searchDocuments: (query, filters = {}, options = {}) => {
      return healthcareApi.get('/hse/industries/maritime/documents/search', {
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

    // Download maritime document
    downloadDocument: (documentId, version = null) => {
      return healthcareApi.get(`/hse/documents/${documentId}/download`, {
        responseType: 'blob',
        params: { version }
      });
    },

    // Upload new maritime document
    uploadDocument: (formData, metadata = {}) => {
      return healthcareApi.post('/hse/industries/maritime/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        params: { metadata: JSON.stringify(metadata) }
      });
    },

    // Create maritime-specific document
    createDocument: (documentData, templateId = null) => {
      return healthcareApi.post('/hse/industries/maritime/documents', {
        ...documentData,
        template_id: templateId
      });
    },

    // Update maritime document
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

    // Get maritime-specific templates
    getMaritimeTemplates: (templateType = null, vesselType = null) => {
      return healthcareApi.get('/hse/industries/maritime/templates', {
        params: { type: templateType, vessel_type: vesselType }
      });
    },

    // Get ISM Code documents
    getISMDocuments: (vesselId = null) => {
      return healthcareApi.get('/hse/maritime/documents/ism', {
        params: { vessel_id: vesselId }
      });
    },

    // Get SOLAS compliance documents
    getSOLASDocuments: (chapter = null) => {
      return healthcareApi.get('/hse/maritime/documents/solas', {
        params: { chapter }
      });
    },

    // Get MARPOL documents
    getMARPOLDocuments: (annex = null) => {
      return healthcareApi.get('/hse/maritime/documents/marpol', {
        params: { annex }
      });
    },

    // Document analytics
    getDocumentAnalytics: (timeframe = '30d') => {
      return healthcareApi.get('/hse/maritime/documents/analytics', {
        params: { timeframe }
      });
    }
  },

  // AI Services
  ai: {
    // Get all AI services for Maritime
    getServices: (category = null) => {
      return healthcareApi.get('/hse/industries/maritime/ai-services', {
        params: { category }
      });
    },

    // Access maritime AI service
    accessService: (serviceId, inputData, options = {}) => {
      return healthcareApi.post(`/hse/ai/services/${serviceId}/execute`, {
        input_data: inputData,
        options: options
      });
    },

    // Maritime-specific AI services
    optimizeWeatherRouting: (routeData, weatherForecast, vesselPerformance) => {
      return healthcareApi.post('/hse/ai/maritime/optimize-weather-routing', {
        route_data: routeData,
        weather_forecast: weatherForecast,
        vessel_performance: vesselPerformance,
        optimization_goal: 'safety_first'
      });
    },

    monitorVesselPerformance: (vesselData, performanceMetrics, baseline = null) => {
      return healthcareApi.post('/hse/ai/maritime/monitor-vessel-performance', {
        vessel_data: vesselData,
        performance_metrics: performanceMetrics,
        performance_baseline: baseline,
        real_time_analysis: true
      });
    },

    predictCargoRisks: (cargoData, voyageInfo, historicalData = {}) => {
      return healthcareApi.post('/hse/ai/maritime/predict-cargo-risks', {
        cargo_data: cargoData,
        voyage_info: voyageInfo,
        historical_data: historicalData,
        risk_threshold: 'medium'
      });
    },

    analyzePortSafety: (portData, incidentHistory, complianceData = {}) => {
      return healthcareApi.post('/hse/ai/maritime/analyze-port-safety', {
        port_data: portData,
        incident_history: incidentHistory,
        compliance_data: complianceData,
        safety_score_components: ['infrastructure', 'procedures', 'incidents']
      });
    },

    // Generate maritime document with AI
    generateMaritimeDocument: (templateType, documentData, customization = {}) => {
      return healthcareApi.post('/hse/ai/maritime/generate-document', {
        template_type: templateType,
        document_data: documentData,
        customization: customization,
        compliance_check: true
      });
    },

    // Get AI service status
    getServiceStatus: (serviceId) => {
      return healthcareApi.get(`/hse/ai/services/${serviceId}/status`);
    },

    // AI-powered predictive maintenance
    predictMaintenance: (vesselData, equipmentData, usagePatterns) => {
      return healthcareApi.post('/hse/ai/maritime/predict-maintenance', {
        vessel_data: vesselData,
        equipment_data: equipmentData,
        usage_patterns: usagePatterns,
        prediction_horizon: '30d'
      });
    },

    // Crew performance AI analysis
    analyzeCrewPerformance: (crewData, voyageData, performanceMetrics) => {
      return healthcareApi.post('/hse/ai/maritime/analyze-crew-performance', {
        crew_data: crewData,
        voyage_data: voyageData,
        performance_metrics: performanceMetrics,
        analysis_depth: 'comprehensive'
      });
    }
  },

  // Fleet Management
  fleet: {
    // Get fleet status
    getFleetStatus: (includeDetails = false) => {
      return healthcareApi.get('/hse/maritime/fleet/status', {
        params: { include_details: includeDetails }
      });
    },

    // Get vessel details
    getVesselDetails: (vesselId, includeSensors = false) => {
      return healthcareApi.get(`/hse/maritime/fleet/vessels/${vesselId}`, {
        params: { include_sensors: includeSensors }
      });
    },

    // Update vessel status
    updateVesselStatus: (vesselId, statusData, reason = '') => {
      return healthcareApi.put(`/hse/maritime/fleet/vessels/${vesselId}/status`, {
        ...statusData,
        reason: reason,
        updated_by: 'system'
      });
    },

    // Get vessel position
    getVesselPosition: (vesselId, historical = false) => {
      return healthcareApi.get(`/hse/maritime/fleet/vessels/${vesselId}/position`, {
        params: { historical }
      });
    },

    // Get voyage information
    getVoyageInfo: (vesselId, includeWaypoints = true) => {
      return healthcareApi.get(`/hse/maritime/fleet/vessels/${vesselId}/voyage`, {
        params: { include_waypoints: includeWaypoints }
      });
    },

    // Submit voyage report
    submitVoyageReport: (vesselId, reportData, attachments = []) => {
      return healthcareApi.post(`/hse/maritime/fleet/vessels/${vesselId}/voyage-report`, {
        ...reportData,
        attachments: attachments
      });
    },

    // Get fleet analytics
    getFleetAnalytics: (timeframe = '30d', metrics = ['fuel', 'emissions', 'incidents']) => {
      return healthcareApi.get(`/hse/maritime/fleet/analytics`, {
        params: { timeframe, metrics: metrics.join(',') }
      });
    },

    // Get fleet compliance status
    getFleetCompliance: (regulatoryFramework = 'all') => {
      return healthcareApi.get('/hse/maritime/fleet/compliance', {
        params: { framework: regulatoryFramework }
      });
    }
  },

  // Vessel Operations
  vessel: {
    // Get vessel certificates
    getVesselCertificates: (vesselId, status = 'active') => {
      return healthcareApi.get(`/hse/maritime/vessels/${vesselId}/certificates`, {
        params: { status }
      });
    },

    // Update vessel certificate
    updateVesselCertificate: (vesselId, certificateData, notifyParties = true) => {
      return healthcareApi.put(`/hse/maritime/vessels/${vesselId}/certificates`, {
        ...certificateData,
        notify_parties: notifyParties
      });
    },

    // Get vessel inspections
    getVesselInspections: (vesselId, limit = 20, inspectionType = null) => {
      return healthcareApi.get(`/hse/maritime/vessels/${vesselId}/inspections`, {
        params: { limit, inspection_type: inspectionType }
      });
    },

    // Submit vessel inspection
    submitVesselInspection: (vesselId, inspectionData, attachments = []) => {
      return healthcareApi.post(`/hse/maritime/vessels/${vesselId}/inspections`, {
        ...inspectionData,
        attachments: attachments
      });
    },

    // Get maintenance records
    getMaintenanceRecords: (vesselId, status = 'all', equipmentType = null) => {
      return healthcareApi.get(`/hse/maritime/vessels/${vesselId}/maintenance`, {
        params: { status, equipment_type: equipmentType }
      });
    },

    // Schedule maintenance
    scheduleMaintenance: (vesselId, maintenanceData, notifyCrew = true) => {
      return healthcareApi.post(`/hse/maritime/vessels/${vesselId}/maintenance`, {
        ...maintenanceData,
        notify_crew: notifyCrew
      });
    },

    // Get vessel performance
    getVesselPerformance: (vesselId, timeframe = '30d') => {
      return healthcareApi.get(`/hse/maritime/vessels/${vesselId}/performance`, {
        params: { timeframe }
      });
    },

    // Update vessel specifications
    updateVesselSpecifications: (vesselId, specifications) => {
      return healthcareApi.put(`/hse/maritime/vessels/${vesselId}/specifications`, specifications);
    }
  },

  // Cargo Operations
  cargo: {
    // Get cargo operations
    getCargoOperations: (vesselId, voyageId = null, status = null) => {
      return healthcareApi.get(`/hse/maritime/cargo/operations`, {
        params: { vessel_id: vesselId, voyage_id: voyageId, status }
      });
    },

    // Submit cargo plan
    submitCargoPlan: (cargoPlan, validationRules = 'strict') => {
      return healthcareApi.post('/hse/maritime/cargo/plans', {
        ...cargoPlan,
        validation_rules: validationRules
      });
    },

    // Get cargo manifest
    getCargoManifest: (voyageId, includeDetails = true) => {
      return healthcareApi.get(`/hse/maritime/cargo/manifest`, {
        params: { voyage_id: voyageId, include_details: includeDetails }
      });
    },

    // Update cargo status
    updateCargoStatus: (cargoId, statusData, location = null) => {
      return healthcareApi.put(`/hse/maritime/cargo/${cargoId}/status`, {
        ...statusData,
        current_location: location
      });
    },

    // Get dangerous goods
    getDangerousGoods: (voyageId, imdgClass = null) => {
      return healthcareApi.get(`/hse/maritime/cargo/dangerous-goods`, {
        params: { voyage_id: voyageId, imdg_class: imdgClass }
      });
    },

    // Submit dangerous goods declaration
    submitDGD: (dgdData, emergencyProcedures = {}) => {
      return healthcareApi.post('/hse/maritime/cargo/dangerous-goods/declaration', {
        ...dgdData,
        emergency_procedures: emergencyProcedures
      });
    },

    // Calculate cargo stability
    calculateCargoStability: (cargoData, vesselCondition) => {
      return healthcareApi.post('/hse/maritime/cargo/stability-calculation', {
        cargo_data: cargoData,
        vessel_condition: vesselCondition
      });
    }
  },

  // Navigation and Routing
  navigation: {
    // Get voyage plan
    getVoyagePlan: (voyageId, includeAlternatives = false) => {
      return healthcareApi.get(`/hse/maritime/navigation/voyage-plan`, {
        params: { voyage_id: voyageId, include_alternatives: includeAlternatives }
      });
    },

    // Submit voyage plan
    submitVoyagePlan: (voyagePlan, approvalRequired = true) => {
      return healthcareApi.post('/hse/maritime/navigation/voyage-plan', {
        ...voyagePlan,
        approval_required: approvalRequired
      });
    },

    // Get weather routing
    getWeatherRouting: (routeData, optimizationCriteria = 'safety') => {
      return healthcareApi.post('/hse/maritime/navigation/weather-routing', {
        ...routeData,
        optimization_criteria: optimizationCriteria
      });
    },

    // Get ETA calculation
    calculateETA: (routeData, vesselPerformance, weatherFactors = {}) => {
      return healthcareApi.post('/hse/maritime/navigation/calculate-eta', {
        route_data: routeData,
        vessel_performance: vesselPerformance,
        weather_factors: weatherFactors,
        calculation_method: 'advanced'
      });
    },

    // Get collision avoidance data
    getCollisionAvoidance: (vesselId, range = 50) => {
      return healthcareApi.get(`/hse/maritime/navigation/collision-avoidance`, {
        params: { vessel_id: vesselId, range }
      });
    },

    // Update vessel position
    updateVesselPosition: (vesselId, positionData, source = 'gps') => {
      return healthcareApi.post(`/hse/maritime/navigation/vessels/${vesselId}/position`, {
        ...positionData,
        source: source
      });
    }
  },

  // Environmental Compliance
  environmental: {
    // Get MARPOL compliance status
    getMARPOLCompliance: (vesselId, annex = null) => {
      return healthcareApi.get(`/hse/maritime/environmental/marpol`, {
        params: { vessel_id: vesselId, annex }
      });
    },

    // Submit environmental record
    submitEnvironmentalRecord: (vesselId, recordData, complianceCheck = true) => {
      return healthcareApi.post(`/hse/maritime/environmental/records`, {
        vessel_id: vesselId,
        ...recordData,
        compliance_check: complianceCheck
      });
    },

    // Get ballast water management
    getBallastWaterManagement: (vesselId, includeHistory = false) => {
      return healthcareApi.get(`/hse/maritime/environmental/ballast-water`, {
        params: { vessel_id: vesselId, include_history: includeHistory }
      });
    },

    // Update ballast water record
    updateBallastWaterRecord: (vesselId, recordData, treatmentMethod = null) => {
      return healthcareApi.put(`/hse/maritime/environmental/ballast-water`, {
        vessel_id: vesselId,
        ...recordData,
        treatment_method: treatmentMethod
      });
    },

    // Get air emissions data
    getAirEmissions: (vesselId, timeframe = '30d', emissionType = null) => {
      return healthcareApi.get(`/hse/maritime/environmental/air-emissions`, {
        params: { vessel_id: vesselId, timeframe, emission_type: emissionType }
      });
    },

    // Submit emissions report
    submitEmissionsReport: (vesselId, reportData, verification = {}) => {
      return healthcareApi.post(`/hse/maritime/environmental/emissions-report`, {
        vessel_id: vesselId,
        ...reportData,
        verification: verification
      });
    },

    // Calculate carbon footprint
    calculateCarbonFootprint: (vesselId, voyageData, calculationMethod = 'imo') => {
      return healthcareApi.post(`/hse/maritime/environmental/carbon-footprint`, {
        vessel_id: vesselId,
        voyage_data: voyageData,
        calculation_method: calculationMethod
      });
    }
  },

  // Port Operations
  port: {
    // Get port information
    getPortInfo: (portCode, includeServices = true) => {
      return healthcareApi.get(`/hse/maritime/ports/${portCode}`, {
        params: { include_services: includeServices }
      });
    },

    // Submit port call
    submitPortCall: (portCallData, preArrivalDocs = []) => {
      return healthcareApi.post('/hse/maritime/ports/port-calls', {
        ...portCallData,
        pre_arrival_documents: preArrivalDocs
      });
    },

    // Get port state control
    getPortStateControl: (vesselId, limit = 10, inspectionType = null) => {
      return healthcareApi.get(`/hse/maritime/ports/port-state-control`, {
        params: { vessel_id: vesselId, limit, inspection_type: inspectionType }
      });
    },

    // Submit PSC inspection
    submitPSCInspection: (inspectionData, deficiencies = []) => {
      return healthcareApi.post('/hse/maritime/ports/psc-inspections', {
        ...inspectionData,
        deficiencies: deficiencies
      });
    },

    // Get port security
    getPortSecurity: (portCode, securityLevel = null) => {
      return healthcareApi.get(`/hse/maritime/ports/${portCode}/security`, {
        params: { security_level: securityLevel }
      });
    },

    // Get port facilities
    getPortFacilities: (portCode, facilityType = null) => {
      return healthcareApi.get(`/hse/maritime/ports/${portCode}/facilities`, {
        params: { facility_type: facilityType }
      });
    }
  },

  // Emergency Response
  emergency: {
    // Get emergency procedures
    getEmergencyProcedures: (vesselId, emergencyType = null) => {
      return healthcareApi.get(`/hse/maritime/emergency/procedures`, {
        params: { vessel_id: vesselId, emergency_type: emergencyType }
      });
    },

    // Submit emergency drill
    submitEmergencyDrill: (vesselId, drillData, participantFeedback = []) => {
      return healthcareApi.post(`/hse/maritime/emergency/drills`, {
        vessel_id: vesselId,
        ...drillData,
        participant_feedback: participantFeedback
      });
    },

    // Get drill history
    getDrillHistory: (vesselId, limit = 10, drillType = null) => {
      return healthcareApi.get(`/hse/maritime/emergency/drill-history`, {
        params: { vessel_id: vesselId, limit, drill_type: drillType }
      });
    },

    // Report emergency incident
    reportEmergencyIncident: (incidentData, immediateActions = []) => {
      return healthcareApi.post('/hse/maritime/emergency/incidents', {
        ...incidentData,
        immediate_actions: immediateActions
      });
    },

    // Get emergency equipment
    getEmergencyEquipment: (vesselId, equipmentType = null) => {
      return healthcareApi.get(`/hse/maritime/emergency/equipment`, {
        params: { vessel_id: vesselId, equipment_type: equipmentType }
      });
    },

    // Update emergency equipment status
    updateEmergencyEquipment: (vesselId, equipmentData, inspectionDate) => {
      return healthcareApi.put(`/hse/maritime/emergency/equipment`, {
        vessel_id: vesselId,
        ...equipmentData,
        last_inspection: inspectionDate
      });
    }
  },

  // Incident Management
  incidents: {
    // Report maritime incident
    reportIncident: (incidentData, immediateResponse = {}) => {
      return healthcareApi.post('/hse/maritime/incidents', {
        ...incidentData,
        immediate_response: immediateResponse
      });
    },

    // Get maritime incidents
    getIncidents: (filters = {}, pagination = { page: 1, limit: 20 }) => {
      return healthcareApi.get('/hse/maritime/incidents', {
        params: { ...filters, ...pagination }
      });
    },

    // Get incident details
    getIncident: (incidentId, includeInvestigation = true) => {
      return healthcareApi.get(`/hse/maritime/incidents/${incidentId}`, {
        params: { include_investigation: includeInvestigation }
      });
    },

    // Update incident investigation
    updateInvestigation: (incidentId, investigationData, recommendations = []) => {
      return healthcareApi.put(`/hse/maritime/incidents/${incidentId}/investigation`, {
        ...investigationData,
        recommendations: recommendations
      });
    },

    // Get incident statistics
    getIncidentStats: (timeframe = '30d', incidentType = null) => {
      return healthcareApi.get(`/hse/maritime/incidents/stats`, {
        params: { timeframe, incident_type: incidentType }
      });
    },

    // Get incident trends
    getIncidentTrends: (timeframe = '90d', analysisType = 'monthly') => {
      return healthcareApi.get(`/hse/maritime/incidents/trends`, {
        params: { timeframe, analysis_type: analysisType }
      });
    }
  },

  // Training and Certification
  training: {
    // Get maritime training courses
    getCourses: (category = null, certificationLevel = null) => {
      return healthcareApi.get('/hse/maritime/training/courses', {
        params: { category, certification_level: certificationLevel }
      });
    },

    // Get crew training records
    getCrewTraining: (vesselId, crewId = null, status = null) => {
      return healthcareApi.get(`/hse/maritime/training/crew`, {
        params: { vessel_id: vesselId, crew_id: crewId, status }
      });
    },

    // Enroll crew in training
    enrollCrew: (crewId, courseData, enrollmentOptions = {}) => {
      return healthcareApi.post(`/hse/maritime/training/crew/${crewId}/enroll`, {
        ...courseData,
        enrollment_options: enrollmentOptions
      });
    },

    // Complete training
    completeTraining: (recordId, completionData, assessmentResults = {}) => {
      return healthcareApi.post(`/hse/maritime/training/records/${recordId}/complete`, {
        ...completionData,
        assessment_results: assessmentResults
      });
    },

    // Get certifications
    getCertifications: (crewId, validityStatus = 'valid') => {
      return healthcareApi.get(`/hse/maritime/training/certifications`, {
        params: { crew_id: crewId, validity_status: validityStatus }
      });
    },

    // Renew certification
    renewCertification: (certificationId, renewalData) => {
      return healthcareApi.post(`/hse/maritime/training/certifications/${certificationId}/renew`, renewalData);
    },

    // Get training analytics
    getTrainingAnalytics: (vesselId = null, timeframe = '365d') => {
      return healthcareApi.get(`/hse/maritime/training/analytics`, {
        params: { vessel_id: vesselId, timeframe }
      });
    }
  },

  // Analytics and Reporting
  analytics: {
    // Get maritime safety metrics
    getSafetyMetrics: (timeframe = '30d', vesselType = null) => {
      return healthcareApi.get(`/hse/maritime/analytics/safety-metrics`, {
        params: { timeframe, vessel_type: vesselType }
      });
    },

    // Get voyage performance
    getVoyagePerformance: (voyageId, includeComparative = false) => {
      return healthcareApi.get(`/hse/maritime/analytics/voyage-performance`, {
        params: { voyage_id: voyageId, include_comparative: includeComparative }
      });
    },

    // Generate maritime report
    generateMaritimeReport: (reportConfig, format = 'pdf') => {
      return healthcareApi.post('/hse/maritime/analytics/reports', {
        ...reportConfig,
        format: format
      });
    },

    // Get compliance analytics
    getComplianceAnalytics: (regulatoryFramework = 'all') => {
      return healthcareApi.get('/hse/maritime/analytics/compliance', {
        params: { framework: regulatoryFramework }
      });
    },

    // Export maritime data
    exportMaritimeData: (exportConfig, dataFormat = 'json') => {
      return healthcareApi.post('/hse/maritime/analytics/export', {
        ...exportConfig,
        data_format: dataFormat
      });
    },

    // Get predictive analytics
    getPredictiveAnalytics: (vesselId, predictionType = 'maintenance') => {
      return healthcareApi.get(`/hse/maritime/analytics/predictive`, {
        params: { vessel_id: vesselId, prediction_type: predictionType }
      });
    },

    // Get risk heatmap
    getRiskHeatmap: (region = 'global', riskType = 'all') => {
      return healthcareApi.get(`/hse/maritime/analytics/risk-heatmap`, {
        params: { region, risk_type: riskType }
      });
    }
  },

  // File Upload for Maritime
  upload: {
    // Upload maritime document
    uploadMaritimeDocument: (file, documentType, metadata = {}, options = {}) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      formData.append('industry_code', 'maritime');
      formData.append('upload_options', JSON.stringify(options));
      
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      return healthcareApi.post('/hse/maritime/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // Longer timeout for large files
      });
    },

    // Upload vessel certificate
    uploadVesselCertificate: (vesselId, file, certificateType, validityInfo = {}) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('certificate_type', certificateType);
      formData.append('vessel_id', vesselId);
      formData.append('validity_info', JSON.stringify(validityInfo));

      return healthcareApi.post('/hse/maritime/upload/certificate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },

    // Upload bulk maritime data
    uploadBulkData: (files, dataType, mappingConfig = {}) => {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      formData.append('data_type', dataType);
      formData.append('mapping_config', JSON.stringify(mappingConfig));

      return healthcareApi.post('/hse/maritime/upload/bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // Even longer timeout for bulk uploads
      });
    }
  },

  // Real-time Monitoring
  monitoring: {
    // Subscribe to vessel tracking
    subscribeVesselTracking: (vesselIds, callback) => {
      return healthcareApi.post('/hse/maritime/monitoring/tracking/subscribe', {
        vessel_ids: vesselIds
      });
    },

    // Get real-time alerts
    getRealTimeAlerts: (alertTypes = ['safety', 'compliance', 'operational']) => {
      return healthcareApi.get('/hse/maritime/monitoring/alerts', {
        params: { alert_types: alertTypes.join(',') }
      });
    },

    // Update monitoring configuration
    updateMonitoringConfig: (vesselId, config) => {
      return healthcareApi.put(`/hse/maritime/monitoring/vessels/${vesselId}/config`, config);
    }
  }
};

export default maritimeSafetyService;