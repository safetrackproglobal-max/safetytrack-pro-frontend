// src/services/GeneralAIService.js
import api from './api';


export class GeneralAIService {
  constructor() {
    this.api = api;
    this.baseURL = api.defaults.baseURL;
    // ==================== PLAN CONFIGURATIONS ====================
    this.planFeatures = {
      free: {
        maxDocumentLength: 1000,
        maxRequestsPerDay: 20,
        availableFormats: ['text'],
        availableDocumentTypes: [
          'risk_assessment', 'incident_report', 'work_permit', 'sop', 'jsa',
          'emergency_plan', 'training_material', 'inspection_checklist'
        ],
        availableIndustries: ['general']
      },
      basic: {
        maxDocumentLength: 5000,
        maxRequestsPerDay: 100,
        availableFormats: ['text', 'html'],
        availableDocumentTypes: [
          'risk_assessment', 'incident_report', 'work_permit', 'sop', 'jsa',
          'emergency_plan', 'training_material', 'inspection_checklist',
          'chemical_risk_assessment', 'fire_risk_assessment', 'audit_report'
        ],
        availableIndustries: ['general', 'construction', 'manufacturing']
      },
      pro: {
        maxDocumentLength: 15000,
        maxRequestsPerDay: 500,
        availableFormats: ['text', 'html'],
        availableDocumentTypes: 'all',
        availableIndustries: 'all',
        videoAnalysis: true,
        advancedAnalytics: true,
        customWorkflows: true,
        examGeneration: true,
        certificateGeneration: true
      },
      enterprise: {
        maxDocumentLength: 50000,
        maxRequestsPerDay: 5000,
        availableFormats: ['text', 'html', 'pdf'],
        availableDocumentTypes: 'all',
        availableIndustries: 'all',
        videoAnalysis: true,
        advancedAnalytics: true,
        customWorkflows: true,
        apiIntegration: true,
        customTraining: true,
        examGeneration: true,
        certificateGeneration: true,
        pdfExport: true
      },
      super_admin: {
        maxDocumentLength: 100000,
        maxRequestsPerDay: 10000,
        availableFormats: ['text', 'html', 'pdf'],
        availableDocumentTypes: 'all',
        availableIndustries: 'all',
        videoAnalysis: true,
        advancedAnalytics: true,
        customWorkflows: true,
        apiIntegration: true,
        customTraining: true,
        examGeneration: true,
        certificateGeneration: true,
        pdfExport: true
      }
    };

    // ==================== AVAILABLE INDUSTRIES ====================
    this.availableIndustries = [
      { id: 'oil_gas', name: 'Oil & Gas', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'healthcare', name: 'Healthcare', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'construction', name: 'Construction', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'manufacturing', name: 'Manufacturing', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'aviation', name: 'Aviation', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'mining', name: 'Mining', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'transportation', name: 'Transportation', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'general', name: 'General Industry', plans: ['free', 'basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'chemical', name: 'Chemical', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'pharmaceutical', name: 'Pharmaceutical', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'power_generation', name: 'Power Generation', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'maritime', name: 'Maritime', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'education', name: 'Education', plans: ['basic', 'pro', 'enterprise', 'super_admin'] }
    ];

    // ==================== DOCUMENT TYPES ====================
    this.availableDocumentTypes = [
      // Free plan document types
      { id: 'risk_assessment', name: 'Risk Assessment', plans: ['free', 'basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'checklist', name: 'Safety Checklist', plans: ['free', 'basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'incident_report', name: 'Incident Report', plans: ['free', 'basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'work_permit', name: 'Work Permit', plans: ['free', 'basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'sop', name: 'Safe Operating Procedure', plans: ['free', 'basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'jsa', name: 'Job Safety Analysis', plans: ['free', 'basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'emergency_plan', name: 'Emergency Plan', plans: ['free', 'basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'training_material', name: 'Training Material', plans: ['free', 'basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'inspection_checklist', name: 'Inspection Checklist', plans: ['free', 'basic', 'pro', 'enterprise', 'super_admin'] },
      
      // Basic plan document types
      { id: 'safety_manual', name: 'Safety Manual', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'audit_report', name: 'Audit Report', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'chemical_risk_assessment', name: 'Chemical Risk Assessment', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'fire_risk_assessment', name: 'Fire Risk Assessment', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'fire_safety_plan', name: 'Fire Safety Plan', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'general_inspection', name: 'General Inspection', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'emergency_response_plan', name: 'Emergency Response Plan', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { id: 'lockout_tagout_procedure', name: 'Lockout/Tagout Procedure', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      
      // Pro plan document types
      { id: 'hot_work_permit', name: 'Hot Work Permit', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'confined_space_entry', name: 'Confined Space Entry', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'electrical_work_permit', name: 'Electrical Work Permit', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'transportation', name: 'Transportation Safety Plan', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'business_continuity_plan', name: 'Business Continuity Plan', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'safety_management_system', name: 'Safety Management System', plans: ['pro', 'enterprise', 'super_admin'] },
      { id: 'compliance_register', name: 'Compliance Register', plans: ['pro', 'enterprise', 'super_admin'] },
      
      // Enterprise plan document types
      { id: 'custom_workflow', name: 'Custom Workflow', plans: ['enterprise', 'super_admin'] },
      { id: 'api_integration_plan', name: 'API Integration Plan', plans: ['enterprise', 'super_admin'] },
      { id: 'white_label_document', name: 'White Label Document', plans: ['enterprise', 'super_admin'] }
    ];

    // ==================== OUTPUT FORMATS ====================
    this.availableOutputFormats = [
      { value: 'text', label: '📝 Plain Text', plans: ['free', 'basic', 'pro', 'enterprise', 'super_admin'] },
      { value: 'html', label: '🎨 HTML Document', plans: ['basic', 'pro', 'enterprise', 'super_admin'] },
      { value: 'pdf', label: '📄 PDF Export', plans: ['enterprise', 'super_admin'] }
    ];

    // ==================== INDUSTRY PERMITS ====================
    this.industryPermits = {
      oil_gas: [
        'hot_work_permit', 'cold_work_permit', 'confined_space_entry', 
        'electrical_work_permit', 'excavation_permit', 'radiography_permit',
        'line_break_permit', 'simultaneous_operations'
      ],
      mining: [
        'blasting_permit', 'confined_space_entry', 'ground_control_permit',
        'heavy_equipment_permit', 'electrical_work_permit', 'hot_work_permit',
        'explosives_storage_permit'
      ],
      construction: [
        'hot_work_permit', 'excavation_permit', 'crane_operation_permit',
        'scaffold_erection_permit', 'confined_space_entry', 'demolition_permit'
      ],
      manufacturing: [
        'lockout_tagout_permit', 'confined_space_entry', 'hot_work_permit',
        'chemical_work_permit', 'machine_guarding_permit'
      ],
      transportation: [
        'vehicle_maintenance_permit', 'hazmat_loading_permit', 
        'yard_movement_permit', 'tire_repair_permit'
      ],
      healthcare: [
        'biohazard_work_permit', 'radiation_work_permit', 
        'chemical_decontamination', 'construction_in_healthcare'
      ],
      general: [
        'hot_work_permit', 'electrical_work_permit', 
        'height_work_permit', 'confined_space_entry'
      ]
    };

    // ==================== INDUSTRY EXPERT PROFILES ====================
    this.industryExpertProfiles = {
      general: {
        name: 'General Safety Expert',
        expertise: 'OSHA compliance, general safety protocols',
        years_experience: 10,
        certifications: ['CSP', 'OSHA 30'],
        specialties: ['risk assessment', 'safety training', 'compliance']
      },
      construction: {
        name: 'Construction Safety Specialist',
        expertise: 'Fall protection, excavation safety, crane operations',
        years_experience: 15,
        certifications: ['CHST', 'OSHA 500', 'Crane Inspector'],
        specialties: ['heavy equipment', 'scaffolding', 'trenching']
      },
      manufacturing: {
        name: 'Manufacturing Safety Engineer',
        expertise: 'Machine guarding, lockout/tagout, chemical safety',
        years_experience: 12,
        certifications: ['CSP', 'PE', 'Six Sigma'],
        specialties: ['process safety', 'ergonomics', 'industrial hygiene']
      },
      oil_gas: {
        name: 'Oil & Gas HSE Manager',
        expertise: 'Process safety management, H2S safety, drilling operations',
        years_experience: 20,
        certifications: ['CSP', 'NEBOSH', 'Well Control'],
        specialties: ['well safety', 'pipeline integrity', 'offshore operations']
      },
      healthcare: {
        name: 'Healthcare Safety Director',
        expertise: 'Infection control, radiation safety, emergency preparedness',
        years_experience: 18,
        certifications: ['CHSP', 'CIC', 'Emergency Manager'],
        specialties: ['biohazards', 'patient safety', 'medical equipment']
      },
      mining: {
        name: 'Mining Safety Superintendent',
        expertise: 'Ground control, explosives, ventilation systems',
        years_experience: 22,
        certifications: ['MSHA Instructor', 'Blasting License', 'Mine Rescue'],
        specialties: ['underground safety', 'haulage systems', 'mineral processing']
      },
      chemical: {
        name: 'Chemical Safety Specialist',
        expertise: 'Process safety, chemical storage, spill response',
        years_experience: 15,
        certifications: ['CSP', 'CHMM', 'Process Safety Professional'],
        specialties: ['chemical hazards', 'process safety', 'hazard communication']
      }
    };

    // ==================== DOCUMENT CATEGORIES ====================
    this.documentCategories = {
      assessments: ['risk_assessment', 'chemical_risk_assessment', 'fire_risk_assessment'],
      permits: ['work_permit', 'hot_work_permit', 'confined_space_entry', 'electrical_work_permit'],
      procedures: ['sop', 'jsa', 'emergency_plan'],
      reports: ['incident_report', 'audit_report', 'inspection_checklist'],
      training: ['training_material', 'safety_manual']
    };

    // ==================== DOCUMENT TEMPLATES ====================
    this.documentTypeTemplates = {
      risk_assessment: {
        title: 'Comprehensive Risk Assessment',
        sections: ['Introduction', 'Scope', 'Methodology', 'Hazard Identification', 'Risk Analysis', 'Control Measures', 'Action Plan'],
        required_fields: ['location', 'activities', 'hazards', 'persons_at_risk'],
        standards: ['ISO 31000', 'OSHA Guidelines']
      },
      checklist: {
        title: 'Safety Checklist',
        sections: ['Checklist Items', 'Verification', 'Comments', 'Follow-up Actions'],
        required_fields: ['items', 'inspector', 'date'],
        standards: ['General Safety Standards']
      },
      incident_report: {
        title: 'Incident Investigation Report',
        sections: ['Executive Summary', 'Incident Details', 'Investigation Findings', 'Root Causes', 'Corrective Actions', 'Prevention Plan'],
        required_fields: ['incident_date', 'location', 'persons_involved', 'description'],
        standards: ['OSHA 301', 'ISO 45001']
      },
      work_permit: {
        title: 'Work Permit System',
        sections: ['Permit Details', 'Work Description', 'Hazard Analysis', 'Safety Precautions', 'Authorization', 'Monitoring'],
        required_fields: ['work_type', 'location', 'duration', 'responsible_person'],
        standards: ['Company Procedures', 'Industry Best Practices']
      },
      sop: {
        title: 'Safe Operating Procedure',
        sections: ['Purpose', 'Scope', 'Responsibilities', 'Procedure Steps', 'Safety Precautions', 'Emergency Procedures'],
        required_fields: ['equipment', 'procedure_steps', 'hazards', 'ppe_requirements'],
        standards: ['ISO 9001', 'OSHA 1910']
      },
      emergency_response_plan: {
        title: 'Emergency Response Plan',
        sections: ['Emergency Contacts', 'Evacuation Routes', 'Response Procedures', 'Training Requirements', 'Drill Schedule'],
        required_fields: ['emergency_contacts', 'evacuation_routes', 'response_teams'],
        standards: ['OSHA 1910.38', 'NFPA 1600']
      }
    };

    // ==================== FALLBACK TEMPLATES ====================
    this.fallbackHTMLTemplates = {
      basic: {
        name: 'Basic Safety Template',
        description: 'Simple and clean template for general safety documents',
        features: ['Responsive design', 'Print-friendly', 'Basic styling']
      },
      professional: {
        name: 'Professional Report Template',
        description: 'Formal template for official reports and documentation',
        features: ['Company branding', 'Table of contents', 'Footer/Header']
      },
      checklist: {
        name: 'Interactive Checklist Template',
        description: 'Template with interactive checkboxes and progress tracking',
        features: ['Interactive elements', 'Progress bars', 'Completion tracking']
      }
    };
  }

  // ==================== HELPER METHODS ====================

  getHeaders() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  isSuperAdmin() {
    const localStorageIsSuperAdmin = localStorage.getItem('is_super_admin') === 'true';
    const userPlanFromStorage = localStorage.getItem('user_plan');
    return localStorageIsSuperAdmin || userPlanFromStorage === 'super_admin';
  }

  getUserId() {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) return storedUserId;
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatUpgradeError(feature, userPlan) {
    return {
      success: false,
      error: `${feature} requires higher plan`,
      upgradeRequired: true,
      requiredPlan: 'pro',
      currentPlan: userPlan,
      message: `Please upgrade to access ${feature}`
    };
  }

  getDocumentTypeDisplayName(docTypeId) {
    const docType = this.availableDocumentTypes.find(dt => dt.id === docTypeId);
    return docType ? docType.name : docTypeId;
  }

  getIndustryDisplayName(industryId) {
    const industry = this.availableIndustries.find(ind => ind.id === industryId);
    return industry ? industry.name : industryId;
  }

  getOutputFormatDisplayName(format) {
    const formatObj = this.availableOutputFormats.find(f => f.value === format);
    return formatObj ? formatObj.label : format;
  }

  getOutputFormatDescription(format) {
    const descriptions = {
      'text': 'Plain text format suitable for quick editing and basic documentation',
      'html': 'Styled HTML document with professional formatting and layout',
      'pdf': 'Print-ready PDF document with embedded fonts and vector graphics'
    };
    return descriptions[format] || 'Document format';
  }

  getPermitsForIndustry(industryId) {
    return this.industryPermits[industryId] || this.industryPermits.general;
  }

  isPermitType(docTypeId) {
    const permitTypes = [
      'work_permit', 'hot_work_permit', 'cold_work_permit', 'confined_space_entry',
      'electrical_work_permit', 'excavation_permit', 'radiography_permit',
      'line_break_permit', 'blasting_permit', 'ground_control_permit',
      'heavy_equipment_permit', 'explosives_storage_permit', 'crane_operation_permit',
      'scaffold_erection_permit', 'demolition_permit', 'lockout_tagout_permit',
      'chemical_work_permit', 'machine_guarding_permit'
    ];
    return permitTypes.includes(docTypeId);
  }

  getDocumentCategories() {
    return this.documentCategories;
  }

  getIndustryExpertProfiles() {
    return this.industryExpertProfiles;
  }

  getDocumentTypeTemplates() {
    return this.documentTypeTemplates;
  }

  getExpertProfile(industry) {
    return this.industryExpertProfiles[industry] || this.industryExpertProfiles.general;
  }

  // ==================== CONTEXT FORMATTING METHODS ====================

  formatContext(chatHistory, industry = 'general', maxLength = 500) {
    if (!chatHistory || chatHistory.length === 0) {
      return `Industry: ${industry || 'general'}. No previous conversation.`;
    }

    let context = `Industry: ${industry || 'general'}. Previous conversation:\n`;
    const recentMessages = chatHistory.slice(-4);
    
    recentMessages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      const content = msg.content || msg.message || '';
      context += `${role}: ${content}\n`;
    });
    
    if (context.length > maxLength) {
      context = context.substring(0, maxLength - 3) + '...';
    }
    
    return context;
  }

  formatChatHistoryForBackend(chatHistory, industry = 'general') {
    if (!chatHistory || chatHistory.length === 0) {
      return [];
    }
    
    return chatHistory.map(msg => ({
      role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
      message: msg.content || msg.message || '',
      timestamp: msg.timestamp || new Date().toISOString()
    }));
  }

  // ==================== PLAN-BASED FILTERING METHODS ====================

  getAvailableDocumentTypesForPlan(plan = 'free') {
    return this.availableDocumentTypes
      .filter(docType => {
        if (docType.plans === 'all') return true;
        if (Array.isArray(docType.plans)) {
          return docType.plans.includes(plan) || plan === 'super_admin' || this.isSuperAdmin();
        }
        return docType.plans === plan || plan === 'super_admin' || this.isSuperAdmin();
      })
      .map(docType => docType.id);
  }

  getAvailableIndustriesForPlan(plan = 'free') {
    return this.availableIndustries
      .filter(industry => {
        if (industry.plans === 'all') return true;
        if (Array.isArray(industry.plans)) {
          return industry.plans.includes(plan) || plan === 'super_admin' || this.isSuperAdmin();
        }
        return industry.plans === plan || plan === 'super_admin' || this.isSuperAdmin();
      })
      .map(industry => industry.id);
  }

  
  getAvailableOutputFormatsForPlan(plan = 'free') {
    return this.availableOutputFormats
      .filter(format => {
        if (format.plans === 'all') return true;
        if (Array.isArray(format.plans)) {
          return format.plans.includes(plan) || plan === 'super_admin' || this.isSuperAdmin();
        }
        return format.plans === plan || plan === 'super_admin' || this.isSuperAdmin();
      })
      .map(format => format.value);
  }

  isFeatureAvailable(feature, plan = 'free') {
    const isSuperAdmin = this.isSuperAdmin() || plan === 'super_admin';
    if (isSuperAdmin) return true;
    
    const planConfig = this.planFeatures[plan] || this.planFeatures.free;
    
    switch (feature) {
      case 'video_analysis':
        return planConfig.videoAnalysis || false;
      case 'advanced_analytics':
        return planConfig.advancedAnalytics || false;
      case 'custom_workflows':
        return planConfig.customWorkflows || false;
      case 'api_integration':
        return planConfig.apiIntegration || false;
      case 'html_output':
        return planConfig.availableFormats.includes('html');
      case 'pdf_output':
        return planConfig.availableFormats.includes('pdf');
      case 'exam_generation':
        return planConfig.examGeneration || false;
      case 'certificate_generation':
        return planConfig.certificateGeneration || false;
      default:
        return false;
    }
  }

  isDocumentTypeAvailable(docTypeId, plan = 'free') {
    console.log(`🔍 Checking if document type ${docTypeId} is available for plan: ${plan}`);
    
    const isSuperAdmin = this.isSuperAdmin() || plan === 'super_admin';
    if (isSuperAdmin) {
      console.log(`👑 Super admin access granted for ${docTypeId}`);
      return true;
    }
    
    const docType = this.availableDocumentTypes.find(dt => dt.id === docTypeId);
    
    if (!docType) {
      console.warn(`⚠️ Document type ${docTypeId} not found in available list, allowing for compatibility`);
      return true;
    }
    
    if (docType.plans === 'all') return true;
    if (Array.isArray(docType.plans)) {
      const isAvailable = docType.plans.includes(plan);
      console.log(`📊 Document ${docTypeId} available for ${plan}: ${isAvailable}`);
      return isAvailable;
    }
    
    const isAvailable = docType.plans === plan;
    console.log(`📊 Document ${docTypeId} available for ${plan}: ${isAvailable}`);
    return isAvailable;
  }

  isIndustryAvailable(industryId, plan = 'free') {
    const isSuperAdmin = this.isSuperAdmin() || plan === 'super_admin';
    if (isSuperAdmin) return true;
    
    const industry = this.availableIndustries.find(ind => ind.id === industryId);
    
    if (!industry) {
      console.warn(`Industry ${industryId} not found in available list, allowing for compatibility`);
      return true;
    }
    
    if (industry.plans === 'all') return true;
    if (Array.isArray(industry.plans)) {
      return industry.plans.includes(plan);
    }
    return industry.plans === plan;
  }

  getPlanLimitations(plan = 'free') {
    const isSuperAdmin = this.isSuperAdmin() || plan === 'super_admin';
    if (isSuperAdmin) {
      return {
        maxDocumentLength: 100000,
        maxRequestsPerDay: 10000,
        availableFormats: ['text', 'html', 'pdf'],
        availableDocumentTypes: 'All document types',
        availableIndustries: 'All industries',
        videoAnalysis: true,
        advancedAnalytics: true,
        customWorkflows: true,
        apiIntegration: true,
        customTraining: true,
        examGeneration: true,
        certificateGeneration: true,
        pdfExport: true,
        isSuperAdmin: true
      };
    }
    
    const planConfig = this.planFeatures[plan] || this.planFeatures.free;
    
    return {
      maxDocumentLength: planConfig.maxDocumentLength,
      maxRequestsPerDay: planConfig.maxRequestsPerDay,
      availableFormats: planConfig.availableFormats,
      availableDocumentTypes: planConfig.availableDocumentTypes === 'all' ? 
        'All document types' : `${planConfig.availableDocumentTypes?.length || 0} document types`,
      availableIndustries: planConfig.availableIndustries === 'all' ? 
        'All industries' : `${planConfig.availableIndustries?.length || 0} industries`,
      videoAnalysis: planConfig.videoAnalysis || false,
      advancedAnalytics: planConfig.advancedAnalytics || false,
      customWorkflows: planConfig.customWorkflows || false,
      apiIntegration: planConfig.apiIntegration || false,
      customTraining: planConfig.customTraining || false,
      examGeneration: planConfig.examGeneration || false,
      certificateGeneration: planConfig.certificateGeneration || false,
      pdfExport: planConfig.pdfExport || false
    };
  }

  // ==================== CORE AI METHODS ====================

  async chat(message, options = {}, userPlan = 'free') {
  const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
  
  try {
    const response = await this.api.post('/ai/safety/chat', {
      message: message,
      industry: options.industry || 'general',
      context: options.context || [],
      temperature: options.temperature || 0.7,
      user_plan: userPlan,
      is_super_admin: isSuperAdmin
    });

    console.log('💬 Chat Response:', response.data);

    if (response.data && response.data.success) {
      return {
        success: true,
        response: response.data.response || response.data.answer || 'No response content',
        model: response.data.model_used,
        timestamp: new Date().toISOString(),
        user_plan: userPlan,
        super_admin_access: isSuperAdmin
      };
    } else {
      return {
        success: false,
        error: response.data?.error || 'No response from AI',
        fallback: this.getFallbackResponse(message, options.industry, userPlan)
      };
    }
  } catch (error) {
    console.error('AI Chat Error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'AI service unavailable',
      fallback: this.getFallbackResponse(message, options.industry, userPlan)
    };
  }
}

  async analyzeRisk(scenario, options = {}, userPlan = 'free') {
    const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
    
    try {
      const response = await this.api.post('/ai/analyze-risk', {
        scenario,
        industry: options.industry || 'general',
        context: options.context || {},
        severity_scale: options.severity_scale || 'standard',
        user_plan: userPlan,
        is_super_admin: isSuperAdmin
      });

      return {
        success: true,
        analysis: response.data.analysis,
        risk_level: response.data.risk_level,
        recommendations: response.data.recommendations,
        timestamp: response.data.timestamp,
        user_plan: userPlan,
        super_admin_access: isSuperAdmin
      };
    } catch (error) {
      console.error('Risk Analysis Error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Risk analysis service unavailable',
        analysis: this.generateFallbackRiskAnalysis(scenario, options.industry, userPlan)
      };
    }
  }



async generateUniversalDocument(options = {}, userPlan = 'free') {
  try {
    console.log('🔍 UNIVERSAL AIService: Generating document with plan:', userPlan);
    
    let isSystemTeam = false;
    let userProfile = null;
    const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        const profileResponse = await fetch(`${this.baseURL}/user/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (profileResponse.ok) {
          userProfile = await profileResponse.json();
          isSystemTeam = userProfile?.user?.is_system_team || false;
        }
      }
    } catch (profileError) {
      console.warn('Could not fetch user profile:', profileError.message);
    }
    
    // Build request data - EXACTLY what backend expects
    const requestData = {
      doc_type: options.document_type || options.doc_type || 'safety_report',
      template_name: options.template_name || options.document_type || 'safety_report',
      requirements: options.requirements || options.context || 'Professional safety document requirements',
      industry: options.industry || 'general',
      standard: options.standard || 'osha',
      style: options.style || 'professional',
      output_format: options.output_format || 'html',
      company_info: options.company_info || options.companyInfo || {},
      // ⭐ FIX: Explicitly set to false - ALWAYS use knowledge base
      generate_ai_content: false,
      title: options.title,
      location: options.location,
      contractor: options.contractor,
      supervisor: options.supervisor,
      worker_count: options.worker_count,
      hazards: options.hazards,
      controls: options.controls,
      ppe: options.ppe,
      risk_level: options.risk_level,
      custom_data: options.custom_data || {}
    };
    
    console.log('🚀 Calling template-generate endpoint (AI disabled):', requestData);
    
    // Use the correct endpoint
    const response = await fetch(`${this.baseURL}/ai/documents/template-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
      },
      body: JSON.stringify(requestData)
    });
    
    const result = await response.json();
    console.log('📥 Template generate response:', result);
    
    if (result.success) {
      // Extract content from response
      let documentContent = '';
      
      if (result.content) {
        documentContent = result.content;
      } else if (result.document && result.document.content) {
        documentContent = result.document.content;
      } else if (result.preview) {
        documentContent = result.preview;
      } else if (result.export_content_base64) {
        // Decode base64 content
        documentContent = atob(result.export_content_base64);
      }
      
      return {
        success: true,
        document: {
          id: result.document?.id || result.document_id,
          content: documentContent,
          type: requestData.doc_type,
          industry: requestData.industry
        },
        content: documentContent,
        doc_type: requestData.doc_type,
        industry: requestData.industry,
        output_format: requestData.output_format,
        metadata: result.metadata || result.style_info || {},
        system_team_access: isSystemTeam,
        super_admin_access: isSuperAdmin
      };
    } else {
      // Fallback to local generation if backend fails
      console.warn('Backend generation failed, using fallback:', result.error);
      const fallbackDocument = this.generateEnhancedFallbackDocument(
        options.document_type,
        options.requirements || '',
        options.industry || 'general',
        options.company_info || {},
        options.generation_mode || 'document',
        options.output_format || 'html',
        userPlan
      );
      
      return {
        success: false,
        document: fallbackDocument,
        content: fallbackDocument,
        error: result.error,
        fallback_used: true
      };
    }
  } catch (error) {
    console.error('❌ Document generation error:', error);
    
    const fallbackDocument = this.generateEnhancedFallbackDocument(
      options.document_type,
      options.requirements || '',
      options.industry || 'general',
      options.company_info || {},
      options.generation_mode || 'document',
      options.output_format || 'html',
      userPlan
    );
    
    return {
      success: false,
      document: fallbackDocument,
      content: fallbackDocument,
      error: error.message,
      fallback_used: true
    };
  }
}
  // ==================== SMART QUERY METHOD ====================

  async smartQuery(query, options = {}, userPlan = 'free') {
  const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
  
  try {
    const response = await this.api.post('/safety/search', {
      query: query,
      industry: options.industry || 'general',
      jurisdiction: options.jurisdiction || null,
      session_id: options.session_id || null,
      user_plan: userPlan,
      is_super_admin: isSuperAdmin
    });

    console.log('🔍 Smart Query Response:', response.data);

    // Check if the response has the expected structure
    if (response.data && response.data.success) {
      // Extract the answer from the results array
      let answer = '';
      let fullResponse = '';
      
      if (response.data.results && response.data.results.length > 0) {
        // Use the full_text from the first result
        fullResponse = response.data.results[0].full_text || '';
        answer = fullResponse;
      }
      
      // If no answer found, use fallback
      if (!answer) {
        answer = this.getFallbackResponse(query, options.industry, userPlan);
      }
      
      return {
        success: true,
        response: answer,  // This is what the chat UI expects
        full_response: fullResponse,
        query: response.data.query,
        session_id: response.data.session_id,
        total_results: response.data.total_results,
        sources_used: response.data.sources_used,
        metadata: {
          industry: response.data.industry,
          timestamp: response.data.timestamp,
          results: response.data.results
        },
        timestamp: new Date().toISOString(),
        super_admin_access: isSuperAdmin
      };
    } else {
      return {
        success: false,
        error: response.data?.error || 'No response from AI',
        fallback: this.getFallbackResponse(query, options.industry, userPlan)
      };
    }
  } catch (error) {
    console.error('Smart Query Error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Query service unavailable',
      fallback: this.getFallbackResponse(query, options.industry, userPlan)
    };
  }
}

  // ==================== EXAM FLOW METHODS ====================

  async startExamFlow(options = {}, userPlan = 'free') {
    try {
      console.log('🎯 Starting exam flow with options:', options);
      const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
      console.log('👑 Is Super Admin:', isSuperAdmin);
      
      if (!options.user_name) {
        return {
          success: false,
          error: 'User name is required'
        };
      }
      
      // Super admins bypass plan checks
      if (!isSuperAdmin && userPlan !== 'super_admin') {
        if (!this.isFeatureAvailable('exam_generation', userPlan)) {
          return {
            success: false,
            error: 'Exam generation requires Pro plan or higher',
            upgradeRequired: true,
            requiredPlan: 'pro'
          };
        }
      }
      
      const response = await this.api.post('/ai/exam/flow/start', {
        user_name: options.user_name,
        user_id: options.user_id || this.getUserId(),
        user_email: options.user_email || '',
        course: options.course || 'CSP Professional Certification Preparation',
        topic: options.topic || 'safety_management',
        difficulty: options.difficulty || 'advanced',
        num_questions: options.num_questions || 100,
        industry: options.industry || 'general',
        user_plan: userPlan,
        is_super_admin: isSuperAdmin
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          session_id: response.data.session_id,
          current_step: response.data.current_step,
          message: response.data.message,
          session_data: response.data.session_data,
          next_action: response.data.next_action,
          super_admin_access: isSuperAdmin
        };
      } else {
        return {
          success: false,
          error: response.data?.error || 'Failed to start exam flow'
        };
      }
      
    } catch (error) {
      console.error('Start exam flow error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  async generateExamForFlow(sessionId, userPlan = 'free') {
    try {
      console.log('📝 Generating exam for session:', sessionId);
      const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
      
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required'
        };
      }
      
      const response = await this.api.post('/ai/exam/flow/generate', {
        session_id: sessionId,
        user_plan: userPlan,
        is_super_admin: isSuperAdmin
      });
      
      if (response.data && response.data.success) {
        const examData = response.data.exam_data;
        
        // Transform questions to frontend format
        const questions = (examData.questions || []).map((q, index) => {
          let options = q.options || [];
          
          // Convert options object to array if needed
          if (options && typeof options === 'object' && !Array.isArray(options)) {
            options = Object.values(options);
          }
          
          // Ensure options are strings
          options = options.map(opt => {
            if (typeof opt === 'object') {
              return opt.text || opt.value || 'Option';
            }
            return String(opt);
          });
          
          return {
            id: q.id || `q_${index}`,
            question: q.question_text || q.question || `Question ${index + 1}`,
            type: q.question_type || 'application',
            options: options,
            correct_answer: this.getCorrectAnswerIndex(q),
            explanation: q.explanation || 'Based on CSP-level professional judgment.',
            points: q.points || 2,
            difficulty: q.difficulty || 'advanced',
            cognitive_level: q.cognitive_level || 'application',
            domain: q.domain || examData.domain || 'Domain 2',
            scenario_context: q.scenario_context || ''
          };
        });
        
        return {
          success: true,
          exam_data: {
            exam_id: examData.exam_id,
            exam_type: examData.exam_type || 'CSP_FULL_EXAM',
            questions: questions,
            total_questions: questions.length,
            total_points: examData.total_points || questions.length * 2,
            time_limit_minutes: examData.time_limit_minutes || 240,
            passing_score: examData.passing_score || 75,
            course: examData.course,
            domain: examData.domain,
            difficulty: examData.difficulty || 'CSP Full Exam'
          },
          exam_instructions: response.data.exam_instructions,
          time_details: response.data.time_details,
          progress: response.data.progress,
          super_admin_access: isSuperAdmin
        };
      } else {
        return {
          success: false,
          error: response.data?.error || 'Failed to generate exam'
        };
      }
      
    } catch (error) {
      console.error('Generate exam error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  getCorrectAnswerIndex(question) {
    // Helper method to extract correct answer index from various formats
    const correctAnswer = question.correct_answer;
    const options = question.options || [];
    
    if (typeof correctAnswer === 'number') {
      return correctAnswer;
    }
    
    if (typeof correctAnswer === 'string') {
      // Check if it's a letter (A, B, C, D)
      const letterIndex = correctAnswer.toUpperCase().charCodeAt(0) - 65;
      if (letterIndex >= 0 && letterIndex < options.length) {
        return letterIndex;
      }
      
      // Try to find matching text
      const textIndex = options.findIndex(opt => {
        const optText = typeof opt === 'object' ? opt.text : String(opt);
        return optText.toLowerCase() === correctAnswer.toLowerCase();
      });
      if (textIndex >= 0) return textIndex;
    }
    
    // Default to first option
    return 0;
  }

  async submitExamForGrading(sessionId, answers, userPlan = 'free') {
    try {
      console.log('📊 Submitting exam for grading:', sessionId);
      console.log('📝 Answers:', answers);
      const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
      
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required'
        };
      }
      
      // Format answers for backend
      const formattedAnswers = {};
      Object.entries(answers).forEach(([qIndex, answerIndex]) => {
        const letter = String.fromCharCode(65 + parseInt(answerIndex));
        formattedAnswers[qIndex] = {
          index: parseInt(answerIndex),
          letter: letter,
          value: letter
        };
      });
      
      const response = await this.api.post('/ai/exam/flow/submit', {
        session_id: sessionId,
        answers: formattedAnswers,
        user_plan: userPlan,
        is_super_admin: isSuperAdmin
      });
      
      if (response.data && response.data.success) {
        const gradingResult = response.data.grading_result;
        
        // Transform grading results to frontend format
        const detailedResults = (gradingResult.detailed_results || []).map(result => ({
          question: result.question_text || `Question ${result.question_number}`,
          userAnswer: result.user_answer || 'Not answered',
          correctAnswer: result.correct_answer || 'Not available',
          isCorrect: result.is_correct || false,
          explanation: result.explanation || 'No explanation provided',
          points: result.points || 1,
          points_earned: result.points_earned || 0,
          domain: result.domain || 'Unknown'
        }));
        
        return {
          success: true,
          grading_result: {
            score: gradingResult.percentage || 0,
            correct: gradingResult.correct_answers || 0,
            total: gradingResult.total_questions || 0,
            percentage: gradingResult.percentage || 0,
            passed: gradingResult.passed || false,
            results: detailedResults,
            domain_scores: gradingResult.domain_scores || {}
          },
          professional_analysis: response.data.professional_analysis || {},
          credential: response.data.credential || {},
          certificate_eligible: response.data.certificate_eligible || false,
          super_admin_access: isSuperAdmin
        };
      } else {
        return {
          success: false,
          error: response.data?.error || 'Failed to grade exam'
        };
      }
      
    } catch (error) {
      console.error('Submit exam error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  async generateExamCertificate(sessionId, userPlan = 'free') {
    try {
      console.log('📜 Generating exam certificate for session:', sessionId);
      const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
      
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required'
        };
      }
      
      // Super admins bypass certificate generation checks
      if (!isSuperAdmin && userPlan !== 'super_admin') {
        if (!this.isFeatureAvailable('certificate_generation', userPlan)) {
          return {
            success: false,
            error: 'Certificate generation requires Pro plan or higher',
            upgradeRequired: true,
            requiredPlan: 'pro'
          };
        }
      }
      
      const response = await this.api.post('/ai/exam/flow/certificate', {
        session_id: sessionId,
        user_plan: userPlan,
        is_super_admin: isSuperAdmin
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          certificate: response.data.certificate,
          certificate_id: response.data.certificate_id,
          download_url: response.data.download_url,
          certificate_html: response.data.certificate_html,
          message: response.data.message || 'Certificate generated successfully',
          super_admin_access: isSuperAdmin
        };
      } else {
        return {
          success: false,
          error: response.data?.error || 'Failed to generate certificate'
        };
      }
      
    } catch (error) {
      console.error('Certificate generation error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  async getExamResults(sessionId, userPlan = 'free') {
    try {
      console.log('📊 Getting exam results for session:', sessionId);
      const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
      
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required'
        };
      }
      
      const response = await this.api.get('/ai/exam/flow/results', {
        params: {
          session_id: sessionId,
          is_super_admin: isSuperAdmin
        }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          results: response.data.results,
          certificate_available: response.data.certificate_available,
          professional_analysis: response.data.professional_analysis,
          exam_type: response.data.exam_type,
          credential_level: response.data.credential_level,
          ceus_awarded: response.data.ceus_awarded,
          domain_scores: response.data.domain_scores,
          super_admin_access: isSuperAdmin
        };
      } else {
        return {
          success: false,
          error: response.data?.error || 'Failed to get exam results'
        };
      }
      
    } catch (error) {
      console.error('Get exam results error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  async getExamSessionStatus(sessionId, userPlan = 'free') {
    try {
      console.log('🔍 Getting exam session status:', sessionId);
      const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
      
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required'
        };
      }
      
      const response = await this.api.get('/ai/exam/flow/status', {
        params: {
          session_id: sessionId,
          is_super_admin: isSuperAdmin
        }
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          session_id: response.data.session_id,
          current_step: response.data.current_step,
          status: response.data.status,
          user_name: response.data.user_name,
          course: response.data.course,
          exam_mode: response.data.exam_mode,
          progress: response.data.progress,
          exam_generated: response.data.exam_generated,
          exam_submitted: response.data.exam_submitted,
          certificate_generated: response.data.certificate_generated,
          certificate_available: response.data.certificate_available,
          time_remaining_minutes: response.data.time_remaining_minutes,
          time_warning: response.data.time_warning,
          exam_type: response.data.exam_type,
          difficulty: response.data.difficulty,
          credential_level: response.data.credential_level,
          ceus_awarded: response.data.ceus_awarded,
          score: response.data.score,
          super_admin_access: isSuperAdmin
        };
      } else {
        return {
          success: false,
          error: response.data?.error || 'Failed to get exam status'
        };
      }
      
    } catch (error) {
      console.error('Get exam status error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  async resetExamSession(sessionId, userPlan = 'free') {
    try {
      console.log('🔄 Resetting exam session:', sessionId);
      const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
      
      if (!sessionId) {
        return {
          success: false,
          error: 'Session ID is required'
        };
      }
      
      const response = await this.api.post('/ai/exam/flow/reset', {
        session_id: sessionId,
        user_plan: userPlan,
        is_super_admin: isSuperAdmin
      });
      
      if (response.data && response.data.success) {
        return {
          success: true,
          session_id: response.data.session_id,
          message: response.data.message,
          current_step: response.data.current_step,
          exam_mode: response.data.exam_mode,
          domain: response.data.domain,
          super_admin_access: isSuperAdmin
        };
      } else {
        return {
          success: false,
          error: response.data?.error || 'Failed to reset exam session'
        };
      }
      
    } catch (error) {
      console.error('Reset exam session error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // ==================== CERTIFICATE VERIFICATION METHODS ====================

  async verifyCertificate(certificateId, userPlan = 'free') {
    try {
      console.log('🔍 Verifying certificate:', certificateId);
      const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
      
      if (!certificateId || certificateId.trim() === '') {
        return {
          success: false,
          valid: false,
          error: 'Certificate ID is required',
          message: 'Please enter a valid certificate ID'
        };
      }
      
      const cleanId = certificateId.trim().toUpperCase();
      
      const response = await fetch(`${this.baseURL}/ai/certificates/verify/${encodeURIComponent(cleanId)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return {
          success: true,
          valid: true,
          certificate: data.certificate,
          message: data.message || 'Certificate is valid',
          timestamp: data.timestamp,
          super_admin_access: isSuperAdmin
        };
      } else {
        return {
          success: false,
          valid: false,
          error: data.error || 'Certificate not found',
          message: data.message || 'No certificate found with this ID',
          certificate_id: cleanId
        };
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      return {
        success: false,
        valid: false,
        error: error.message,
        message: 'Unable to verify certificate. Please check your connection.',
        is_offline: true
      };
    }
  }

  async verifyCertificatesBulk(certificateIds, userPlan = 'free') {
    try {
      console.log('🔍 Verifying multiple certificates:', certificateIds.length);
      const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
      
      if (!certificateIds || !Array.isArray(certificateIds) || certificateIds.length === 0) {
        return {
          success: false,
          error: 'certificate_ids array is required',
          results: []
        };
      }
      
      const cleanIds = certificateIds.map(id => id.trim().toUpperCase());
      
      const response = await fetch(`${this.baseURL}/ai/certificates/verify/bulk`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ certificate_ids: cleanIds })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        return {
          success: true,
          results: data.results,
          total_verified: data.total_verified,
          total_not_found: data.total_not_found,
          timestamp: data.timestamp,
          super_admin_access: isSuperAdmin
        };
      } else {
        return {
          success: false,
          error: data.error || 'Bulk verification failed',
          results: []
        };
      }
      
    } catch (error) {
      console.error('Bulk verification error:', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  // ==================== PDF DOWNLOAD METHODS ====================

  async downloadPdfDocument(documentId, options = {}, userPlan = 'free') {
    try {
      console.log('📥 AIService: Downloading PDF document:', documentId);
      const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
      
      if (!documentId) {
        return {
          success: false,
          error: 'Document ID is required'
        };
      }
      
      if (!isSuperAdmin && !this.isFeatureAvailable('pdf_output', userPlan)) {
        return {
          success: false,
          error: 'PDF download requires Enterprise plan or higher',
          upgradeRequired: true,
          requiredPlan: 'enterprise'
        };
      }
      
      const filename = options.filename || `document_${documentId}.pdf`;
      
      const response = await this.api.get(`/documents/download/${documentId}`, {
        responseType: 'blob',
        params: {
          format: options.format || 'pdf'
        }
      });
      
      if (response.status === 200) {
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
          message: 'Download started successfully',
          filename: filename,
          super_admin_access: isSuperAdmin
        };
      } else {
        return {
          success: false,
          error: 'Failed to download document'
        };
      }
      
    } catch (error) {
      console.error('❌ Download error:', error);
      
      // Try alternative endpoint
      try {
        const altResponse = await this.api.get(`/documents/${documentId}/download`, {
          responseType: 'blob'
        });
        
        if (altResponse.status === 200) {
          const url = window.URL.createObjectURL(new Blob([altResponse.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', options.filename || `document_${documentId}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          
          return {
            success: true,
            message: 'Download started successfully (alternative endpoint)'
          };
        }
      } catch (altError) {
        console.error('Alternative download also failed:', altError);
      }
      
      return {
        success: false,
        error: error.message || 'Failed to download PDF'
      };
    }
  }

  async downloadTranscriptAsPdf(transcriptData, userPlan = 'free') {
    try {
      console.log('📥 AIService: Downloading transcript as PDF');
      const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
      
      if (!isSuperAdmin && !this.isFeatureAvailable('pdf_output', userPlan)) {
        return {
          success: false,
          error: 'PDF download requires Enterprise plan or higher',
          upgradeRequired: true,
          requiredPlan: 'enterprise'
        };
      }
      
      const response = await this.api.post('/ai/exam/transcript/download', transcriptData, {
        responseType: 'blob'
      });
      
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `transcript_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return {
          success: true,
          message: 'Transcript downloaded successfully',
          super_admin_access: isSuperAdmin
        };
      } else {
        return {
          success: false,
          error: 'Failed to download transcript'
        };
      }
      
    } catch (error) {
      console.error('Transcript download error:', error);
      return {
        success: false,
        error: error.message || 'Failed to download transcript'
      };
    }
  }

  // ==================== FALLBACK METHODS ====================

  generateEnhancedFallbackDocument(docType, requirements, industry, companyInfo, generationMode = 'document', outputFormat = 'text', userPlan = 'free') {
    const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
    
    if (outputFormat === 'html' && !isSuperAdmin && !this.isFeatureAvailable('html_output', userPlan)) {
      outputFormat = 'text';
    }
    
    if (outputFormat === 'html') {
      return this.generateFallbackHTMLDocument(docType, industry, requirements, companyInfo, generationMode, userPlan);
    }

    const docConfig = this.documentTypeTemplates[docType] || this.documentTypeTemplates.risk_assessment;
    const industryConfig = this.industryExpertProfiles[industry] || this.industryExpertProfiles.general;
    const companyName = companyInfo.companyName || 'Professional Safety Systems';
    const timestamp = new Date().toLocaleString();
    
    const modeLabel = generationMode === 'template' ? 'EMPTY TEMPLATE' : 'FILLED DOCUMENT';
    const modeDescription = generationMode === 'template' ? 
      'Empty fields for manual completion' : 
      'Complete with filled content and checkmarks';

    const planInfo = userPlan ? `\nUSER PLAN: ${userPlan.toUpperCase()}` : '';
    const superAdminInfo = isSuperAdmin ? '\n👑 SUPER ADMIN ACCESS: All restrictions bypassed' : '';

    const simpleTable = (headers, rows) => {
      const headerRow = `| ${headers.join(' | ')} |`;
      const separator = `|${headers.map(() => '---').join('|')}|`;
      const bodyRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
      return `${headerRow}\n${separator}\n${bodyRows}`;
    };

    const riskMatrix = `
| Probability \\ Severity | Minor | Moderate | Major | Severe | Catastrophic |
|---------------------|--------|-----------|--------|---------|---------------|
| Rare (1)            | 🟢 LOW | 🟢 LOW    | 🟡 MEDIUM | 🟠 HIGH | 🔴 EXTREME |
| Unlikely (2)        | 🟢 LOW | 🟡 MEDIUM | 🟡 MEDIUM | 🟠 HIGH | 🔴 EXTREME |
| Possible (3)        | 🟡 MEDIUM | 🟡 MEDIUM | 🟠 HIGH | 🔴 EXTREME | 🔴 EXTREME |
| Likely (4)          | 🟡 MEDIUM | 🟠 HIGH | 🔴 EXTREME | 🔴 EXTREME | 🔴 EXTREME |
| Certain (5)         | 🟠 HIGH | 🔴 EXTREME | 🔴 EXTREME | 🔴 EXTREME | 🔴 EXTREME |
    `.trim();

    const controlMeasures = generationMode === 'template' ? 
      simpleTable(
        ['Control Level', 'Specific Measures', 'Responsible', 'Timeline'],
        [
          ['Engineering Controls', '[__________________]', '[__________________]', '[__________________]'],
          ['Administrative Controls', '[__________________]', '[__________________]', '[__________________]'],
          ['Personal Protective Equipment', '[__________________]', '[__________________]', '[__________________]']
        ]
      ) : 
      simpleTable(
        ['Control Level', 'Specific Measures', 'Responsible', 'Timeline'],
        [
          ['Engineering Controls', '✓ Machine guards, Ventilation systems', 'Maintenance Team', 'Immediate'],
          ['Administrative Controls', '✓ Safe procedures, Training programs', 'Supervisors', '15 days'],
          ['Personal Protective Equipment', '✓ Appropriate PPE, Issue & training', 'Safety Officer', 'Ongoing']
        ]
      );

    const hazardAssessment = generationMode === 'template' ?
      simpleTable(
        ['Hazard Type', 'Specific Hazards', 'Risk Level', 'Control Status'],
        [
          ['Physical Hazards', '[__________________]', '[__________________]', '[ ] Controls Needed'],
          ['Chemical Hazards', '[__________________]', '[__________________]', '[ ] Critical Control'],
          ['Biological Hazards', '[__________________]', '[__________________]', '[ ] Controlled']
        ]
      ) :
      simpleTable(
        ['Hazard Type', 'Specific Hazards', 'Risk Level', 'Control Status'],
        [
          ['Physical Hazards', '✓ Falls from height, Equipment contact', '🟠 HIGH', '✓ Controls Needed'],
          ['Chemical Hazards', '✓ Toxic exposure, Fire/Explosion', '🔴 VERY HIGH', '✓ Critical Control'],
          ['Biological Hazards', '✓ Pathogen exposure, Allergens', '🟡 MEDIUM', '✓ Controlled']
        ]
      );

    const planLimits = this.getPlanLimitations(userPlan);
    const planFeatures = `\nPLAN FEATURES: ${planLimits.maxDocumentLength} chars • ${planLimits.maxRequestsPerDay} requests/day • ${planLimits.availableFormats.join(',')} formats`;

    return `ENHANCED SAFETY DOCUMENT - ${modeLabel}${planInfo}${superAdminInfo}

DOCUMENT: ${this.getDocumentTypeDisplayName(docType)}
INDUSTRY: ${this.getIndustryDisplayName(industry)}
COMPANY: ${companyName}
OUTPUT FORMAT: ${outputFormat.toUpperCase()}
GENERATED: ${timestamp}
MODE: ${modeDescription}

DOCUMENT PURPOSE & SCOPE
${'='.repeat(80)}
${requirements || 'Professional safety documentation and compliance management'}

TABLE OF CONTENTS
${'-'.repeat(80)}
1.0 EXECUTIVE SUMMARY
2.0 INTRODUCTION AND SCOPE  
3.0 HAZARD IDENTIFICATION
4.0 RISK ASSESSMENT MATRIX
5.0 CONTROL MEASURES
6.0 IMPLEMENTATION PLAN
7.0 MONITORING AND REVIEW
8.0 EMERGENCY PROCEDURES
9.0 TRAINING REQUIREMENTS
10.0 DOCUMENTATION AND RECORDS

${'='.repeat(80)}
1.0 EXECUTIVE SUMMARY
${'='.repeat(80)}
This document provides comprehensive safety guidance for ${this.getIndustryDisplayName(industry)} operations. 
It addresses key hazards and implements control measures in accordance with international safety standards.

${'='.repeat(80)}
2.0 HAZARD IDENTIFICATION
${'='.repeat(80)}
${hazardAssessment}

${'='.repeat(80)}
3.0 RISK ASSESSMENT MATRIX
${'='.repeat(80)}
${riskMatrix}

${'='.repeat(80)}
4.0 CONTROL MEASURES IMPLEMENTATION
${'='.repeat(80)}
${controlMeasures}

${generationMode === 'document' ? `
${'='.repeat(80)}
COMPLETION STATUS:
${'='.repeat(80)}
• Risk Assessment: ✓ COMPLETED
• Control Implementation: 🔄 IN PROGRESS  
• Training: □ SCHEDULED
• Audit: □ PLANNED
` : ''}

${'='.repeat(80)}
DOCUMENT COMPLIANCE & APPROVALS
${'='.repeat(80)}
PREPARED BY: ___________________   DATE: ___________   SIGNATURE: ___________________
REVIEWED BY: ___________________   DATE: ___________   SIGNATURE: ___________________
APPROVED BY: ___________________   DATE: ___________   SIGNATURE: ___________________

${'='.repeat(80)}
*Generated by SafetyTrack Pro Enhanced Template System | ${timestamp}*
*Generation Mode: ${generationMode.toUpperCase()} | Fields: ${generationMode === 'template' ? 'EMPTY' : 'FILLED'}*
*User Plan: ${userPlan.toUpperCase()} | Length Limit: ${planLimits.maxDocumentLength} chars*`;
  }

  generateFallbackHTMLDocument(docType, industry, requirements, companyInfo, generationMode, userPlan = 'free') {
    const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
    const companyName = companyInfo.companyName || 'Professional Safety Systems';
    const timestamp = new Date().toLocaleString();
    const planLimits = this.getPlanLimitations(userPlan);
    
    const planColor = userPlan === 'pro' ? '#722ed1' : 
                      userPlan === 'enterprise' ? '#fa8c16' : 
                      userPlan === 'basic' ? '#1890ff' : 
                      userPlan === 'super_admin' ? '#eb2f96' : '#8c8c8c';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${this.getDocumentTypeDisplayName(docType)} - ${this.getIndustryDisplayName(industry)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
            padding: 20px;
        }
        
        .document {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.2em;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .plan-badge {
            display: inline-block;
            background: ${planColor};
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-left: 10px;
            font-weight: 600;
        }
        
        .super-admin-badge {
            display: inline-block;
            background: #eb2f96;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-left: 10px;
            font-weight: 600;
        }
        
        .document-info {
            background: #f8f9fa;
            padding: 25px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #667eea;
        }
        
        .info-item label {
            font-weight: 600;
            color: #495057;
        }
        
        .content-section {
            padding: 25px;
        }
        
        h2 {
            color: #2c3e50;
            margin: 25px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="header">
            <h1>🎨 ${this.getDocumentTypeDisplayName(docType)} 
                <span class="plan-badge">${userPlan.toUpperCase()} PLAN</span>
                ${isSuperAdmin ? '<span class="super-admin-badge">👑 SUPER ADMIN</span>' : ''}
            </h1>
            <p>${this.getIndustryDisplayName(industry)} • HTML Format • ${timestamp}</p>
        </div>
        
        <div class="document-info">
            <div class="info-grid">
                <div class="info-item">
                    <label>Company:</label>
                    <span>${companyName}</span>
                </div>
                <div class="info-item">
                    <label>Industry:</label>
                    <span>${this.getIndustryDisplayName(industry)}</span>
                </div>
                <div class="info-item">
                    <label>Generation Mode:</label>
                    <span>${generationMode === 'template' ? 'Empty Template' : 'Filled Document'}</span>
                </div>
                <div class="info-item">
                    <label>Output Format:</label>
                    <span>HTML</span>
                </div>
                ${isSuperAdmin ? `
                <div class="info-item">
                    <label>Access Level:</label>
                    <span>👑 Super Admin (All restrictions bypassed)</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="content-section">
            <h2>📋 Document Overview</h2>
            <p>${requirements || 'Professional safety documentation with beautiful HTML styling.'}</p>
            
            <h2>✅ Features of HTML Format</h2>
            <ul>
                <li>🎨 Professional styling with gradients</li>
                <li>📱 Responsive design for all devices</li>
                <li>🎯 Color-coded risk levels</li>
                <li>📊 Beautiful table designs</li>
                <li>🖨️ Print-friendly layout</li>
                ${isSuperAdmin ? '<li>👑 Super Admin: Full access to all features</li>' : ''}
            </ul>
        </div>

        <div class="footer">
            <p>🎨 HTML Document Generated by SafetyTrack Pro | ${userPlan.toUpperCase()} Plan</p>
            ${isSuperAdmin ? '<p>👑 Super Admin Access - All plan restrictions bypassed</p>' : ''}
        </div>
    </div>
</body>
</html>`;
  }

  generateFallbackRiskAnalysis(scenario, industry, userPlan = 'free') {
    const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
    const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'VERY HIGH', 'EXTREME'];
    const randomRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    
    return {
      scenario: scenario,
      risk_level: randomRisk,
      probability: Math.floor(Math.random() * 100) + '%',
      severity: ['Minor', 'Moderate', 'Major', 'Severe', 'Catastrophic'][Math.floor(Math.random() * 5)],
      controls_needed: Math.floor(Math.random() * 10) + 1,
      immediate_actions: [
        'Isolate the hazard area',
        'Notify relevant personnel',
        'Implement temporary controls',
        'Assess further risks'
      ],
      recommendations: [
        'Conduct detailed risk assessment',
        'Implement engineering controls',
        'Provide specific training',
        'Establish monitoring procedures'
      ],
      user_plan: userPlan,
      super_admin_access: isSuperAdmin,
      fallback: true
    };
  }

  getFallbackResponse(message, industry, userPlan = 'free') {
    const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
    const lowerMessage = message.toLowerCase();
    const planLimitations = this.getPlanLimitations(userPlan);
    
    const planInfo = `\n\n**Your Plan: ${userPlan.toUpperCase()}**\n- Max Document Length: ${planLimitations.maxDocumentLength} characters\n- Available Formats: ${planLimitations.availableFormats.join(', ')}\n- ${planLimitations.availableDocumentTypes}\n- ${planLimitations.availableIndustries}`;
    const superAdminInfo = isSuperAdmin ? '\n👑 **SUPER ADMIN ACCESS:** All features and restrictions bypassed' : '';
    
    if (lowerMessage.includes('risk') && lowerMessage.includes('assessment')) {
      return `🎯 **COMPREHENSIVE RISK ASSESSMENT FRAMEWORK - ${this.getIndustryDisplayName(industry).toUpperCase()}** 🎯\n\nThis fallback response provides guidance on conducting risk assessments in your industry.${planInfo}${superAdminInfo}`;
    } else if (lowerMessage.includes('safety') && lowerMessage.includes('training')) {
      return `📚 **SAFETY TRAINING PROGRAM - ${this.getIndustryDisplayName(industry).toUpperCase()}** 📚\n\nKey training topics for your industry include hazard identification, emergency procedures, and PPE usage.${planInfo}${superAdminInfo}`;
    } else if (lowerMessage.includes('emergency') && lowerMessage.includes('plan')) {
      return `🚨 **EMERGENCY RESPONSE PLAN TEMPLATE - ${this.getIndustryDisplayName(industry).toUpperCase()}** 🚨\n\nEssential components include evacuation procedures, emergency contacts, and first aid protocols.${planInfo}${superAdminInfo}`;
    } else {
      return `💡 **SAFETY GUIDANCE - ${this.getIndustryDisplayName(industry).toUpperCase()}** 💡\n\nI can help you with safety documentation, risk assessments, compliance guidance, and more. Please try again when the AI service is available.${planInfo}${superAdminInfo}`;
    }
  }

  // ==================== ADDITIONAL METHODS ====================

  async sendEnhancedChatMessage(message, options = {}) {
    const isSuperAdmin = this.isSuperAdmin();
    
    try {
      const {
        sessionId = `session_${Date.now()}`,
        industry = 'general',
        personality = 'professional',
        chatHistory = [],
        useUniversalKnowledge = true,
        temperature = 0.7
      } = options;

      const context = this.formatChatHistoryForBackend(chatHistory, industry);
      
      const response = await this.api.post('/ai/safety/chat', {
        message,
        industry,
        personality,
        session_id: sessionId,
        use_universal_knowledge: useUniversalKnowledge,
        context: context,
        temperature,
        is_super_admin: isSuperAdmin
      });

      return {
        success: true,
        response: response.data.response,
        model: response.data.model_used,
        timestamp: new Date().toISOString(),
        super_admin_access: isSuperAdmin
      };
    } catch (error) {
      console.error('Enhanced chat error:', error);
      
      return {
        success: false,
        response: "I apologize, but I'm having trouble processing your request. Please try again.",
        error: error.message,
        fallback: true
      };
    }
  }

  async generateDocumentWithContext(docType, requirements, options = {}, userPlan = 'free') {
    try {
      const {
        industry = 'general',
        companyInfo = {},
        standards = [],
        chatHistory = [],
        outputFormat = 'text',
        generationMode = 'document',
        sessionId
      } = options;

      let enhancedRequirements = requirements;
      if (chatHistory && chatHistory.length > 0) {
        const contextSummary = this.extractKeyPointsFromChat(chatHistory, industry);
        enhancedRequirements = `${requirements}\n\nContext from conversation: ${contextSummary}`;
      }

      return await this.generateUniversalDocument({
        document_type: docType,
        requirements: enhancedRequirements,
        industry,
        company_info: companyInfo,
        standards,
        output_format: outputFormat,
        generation_mode: generationMode,
        session_id: sessionId
      }, userPlan);
    } catch (error) {
      console.error('Document generation with context error:', error);
      throw error;
    }
  }

  extractKeyPointsFromChat(chatHistory, industry = 'general', maxPoints = 5) {
    if (!chatHistory || chatHistory.length === 0) {
      return 'No specific context from conversation';
    }

    const keyPoints = [];
    const userMessages = chatHistory.filter(msg => 
      msg.role === 'user' || msg.sender === 'user'
    );

    const recentUserMessages = userMessages.slice(-3);
    
    recentUserMessages.forEach((msg, index) => {
      const content = msg.content || msg.message || '';
      if (content.length > 20) {
        keyPoints.push(`${index + 1}. ${content.substring(0, 100)}...`);
      }
    });

    if (keyPoints.length === 0) {
      return `General conversation about ${this.getIndustryDisplayName(industry)} safety`;
    }

    return keyPoints.slice(0, maxPoints).join(' | ');
  }

  assessPlanRequirements(query, industry, userPlan) {
    const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
    
    const requirements = {
      requiredPlan: 'free',
      upgradeRequired: false,
      upgradeReason: null,
      availableFeatures: this.getPlanLimitations(userPlan)
    };

    if (isSuperAdmin) {
      requirements.upgradeRequired = false;
      return requirements;
    }

    const queryLower = query.toLowerCase();

    if (queryLower.includes('video') || queryLower.includes('camera') || queryLower.includes('surveillance')) {
      if (!this.isFeatureAvailable('video_analysis', userPlan)) {
        requirements.requiredPlan = 'pro';
        requirements.upgradeRequired = true;
        requirements.upgradeReason = 'Video analysis requires Pro plan';
      }
    }

    if (queryLower.includes('custom workflow') || queryLower.includes('workflow automation') || queryLower.includes('api integration')) {
      if (!this.isFeatureAvailable('custom_workflows', userPlan)) {
        requirements.requiredPlan = 'enterprise';
        requirements.upgradeRequired = true;
        requirements.upgradeReason = 'Custom workflows require Enterprise plan';
      }
    }

    if (queryLower.includes('predictive') || queryLower.includes('analytics') || queryLower.includes('machine learning')) {
      if (!this.isFeatureAvailable('advanced_analytics', userPlan)) {
        requirements.requiredPlan = 'pro';
        requirements.upgradeRequired = true;
        requirements.upgradeReason = 'Advanced analytics requires Pro plan';
      }
    }

    if (queryLower.includes('pdf') || queryLower.includes('export') || queryLower.includes('download')) {
      if (!this.isFeatureAvailable('pdf_output', userPlan)) {
        requirements.requiredPlan = 'enterprise';
        requirements.upgradeRequired = true;
        requirements.upgradeReason = 'PDF export requires Enterprise plan';
      }
    }

    const industryData = this.availableIndustries.find(ind => ind.id === industry);
    if (industryData && Array.isArray(industryData.plans)) {
      if (!industryData.plans.includes(userPlan)) {
        requirements.requiredPlan = industryData.plans[0];
        requirements.upgradeRequired = true;
        requirements.upgradeReason = `${this.getIndustryDisplayName(industry)} industry requires ${industryData.plans[0].toUpperCase()} plan`;
      }
    }

    return requirements;
  }

  // ==================== UTILITY METHODS ====================

  async getModelsStatus() {
    try {
      const response = await this.api.get('/ai/models/status');
      return {
        success: true,
        models: response.data.models,
        status: response.data.status,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('Models Status Error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Models status service unavailable',
        models: {
          universal_ai: { status: 'unknown', capabilities: ['document_generation', 'risk_analysis'] },
          safety_expert: { status: 'unknown', capabilities: ['industry_specific', 'compliance'] },
          html_generator: { status: 'unknown', capabilities: ['html_templates', 'styling'] }
        },
        fallback: true
      };
    }
  }

  async getAdvancedSystemStatus() {
    try {
      const response = await this.api.get('/ai/system/status');
      return {
        success: true,
        status: response.data.status,
        components: response.data.components,
        performance: response.data.performance,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('System Status Error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'System status service unavailable',
        status: 'degraded',
        components: {
          ai_engine: 'fallback_mode',
          document_generator: 'fallback_mode',
          html_renderer: 'fallback_mode'
        },
        fallback: true
      };
    }
  }

  async healthCheck() {
    try {
      const response = await this.api.get('/health');
      return {
        success: true,
        status: response.data.status,
        version: response.data.version,
        timestamp: response.data.timestamp,
        services: response.data.services
      };
    } catch (error) {
      console.error('Health Check Error:', error);
      return {
        success: false,
        status: 'unhealthy',
        error: error.response?.data?.error || 'Backend service unavailable',
        fallback: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ==================== HOOK METHODS ====================

  createHookMethods(userPlan = 'free') {
    const isSuperAdmin = this.isSuperAdmin() || userPlan === 'super_admin';
    
    return {
      chat: (message, options = {}) => this.chat(message, options, userPlan),
      generateDocument: (options = {}) => this.generateDocument(options, userPlan),
      analyzeRisk: (scenario, options = {}) => this.analyzeRisk(scenario, options, userPlan),
      generateUniversalDocument: (options = {}) => this.generateUniversalDocument(options, userPlan),
      smartQuery: (query, options = {}) => this.smartQuery(query, options, userPlan),
      sendEnhancedChatMessage: (message, options = {}) => this.sendEnhancedChatMessage(message, options),
      generateDocumentWithContext: (docType, requirements, options = {}) => 
        this.generateDocumentWithContext(docType, requirements, options, userPlan),
      extractKeyPointsFromChat: (chatHistory, industry) => this.extractKeyPointsFromChat(chatHistory, industry),
      getExpertProfile: this.getExpertProfile.bind(this),
      getIndustryDisplayName: this.getIndustryDisplayName.bind(this),
      getDocumentTypeDisplayName: this.getDocumentTypeDisplayName.bind(this),
      getOutputFormatDisplayName: this.getOutputFormatDisplayName.bind(this),
      getPermitsForIndustry: this.getPermitsForIndustry.bind(this),
      isPermitType: this.isPermitType.bind(this),
      getDocumentCategories: this.getDocumentCategories.bind(this),
      getIndustryExpertProfiles: this.getIndustryExpertProfiles.bind(this),
      getDocumentTypeTemplates: this.getDocumentTypeTemplates.bind(this),
      availableIndustries: this.getAvailableIndustriesForPlan(userPlan),
      availableDocumentTypes: this.getAvailableDocumentTypesForPlan(userPlan),
      availableOutputFormats: this.getAvailableOutputFormatsForPlan(userPlan),
      isFeatureAvailable: (feature) => this.isFeatureAvailable(feature, userPlan),
      isDocumentTypeAvailable: (docTypeId) => this.isDocumentTypeAvailable(docTypeId, userPlan),
      isIndustryAvailable: (industryId) => this.isIndustryAvailable(industryId, userPlan),
      getPlanLimitations: () => this.getPlanLimitations(userPlan),
      downloadPdfDocument: (documentId, options = {}) => this.downloadPdfDocument(documentId, options, userPlan),
      downloadTranscriptAsPdf: (transcriptData) => this.downloadTranscriptAsPdf(transcriptData, userPlan),
      startExamFlow: (options = {}) => this.startExamFlow(options, userPlan),
      generateExamForFlow: (sessionId) => this.generateExamForFlow(sessionId, userPlan),
      submitExamForGrading: (sessionId, answers) => this.submitExamForGrading(sessionId, answers, userPlan),
      generateExamCertificate: (sessionId) => this.generateExamCertificate(sessionId, userPlan),
      getExamResults: (sessionId) => this.getExamResults(sessionId, userPlan),
      getExamSessionStatus: (sessionId) => this.getExamSessionStatus(sessionId, userPlan),
      resetExamSession: (sessionId) => this.resetExamSession(sessionId, userPlan),
      verifyCertificate: (certificateId) => this.verifyCertificate(certificateId, userPlan),
      verifyCertificatesBulk: (certificateIds) => this.verifyCertificatesBulk(certificateIds, userPlan),
      getModelsStatus: () => this.getModelsStatus(),
      getAdvancedSystemStatus: () => this.getAdvancedSystemStatus(),
      healthCheck: () => this.healthCheck(),
      isSuperAdmin: () => isSuperAdmin
    };
  }
}

// Export singleton instance
const AIService = new GeneralAIService();
export default AIService;

// Export the hook methods for easy component usage
export const createAIServiceMethods = (userPlan = 'free') => AIService.createHookMethods(userPlan);

// Export enhanced classes for direct usage
export class PlanAwareAIService extends GeneralAIService {
  constructor(userPlan = 'free') {
    super();
    this.userPlan = userPlan;
  }

  static async planAwareCall(endpoint, data, options = {}) {
    return await planAwareApiCall(endpoint, data, {
      requiredPlan: options.requiredPlan || 'free',
      fallbackPlan: options.fallbackPlan || 'free',
      userPlan: options.userPlan || 'free',
      fallbackMessage: options.fallbackMessage || 'This feature requires a higher plan'
    });
  }

  static getFeaturesForPlan(plan = 'free') {
    const service = new GeneralAIService();
    return service.getPlanLimitations(plan);
  }
}

// Helper function for plan-based feature checks
export function checkPlanAccess(feature, userPlan = 'free', requiredPlan = 'free') {
  const planHierarchy = {
    'free': 0,
    'basic': 1,
    'pro': 2,
    'enterprise': 3,
    'super_admin': 4
  };

  const userPlanLevel = planHierarchy[userPlan] || 0;
  const requiredPlanLevel = planHierarchy[requiredPlan] || 0;

  return {
    hasAccess: userPlanLevel >= requiredPlanLevel,
    requiredPlan: requiredPlan,
    currentPlan: userPlan,
    upgradeRequired: userPlanLevel < requiredPlanLevel
  };
}