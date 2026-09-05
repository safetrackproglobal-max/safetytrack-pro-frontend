// src/pages/AIDocumentsUtils.js
import { message } from 'antd';
import React from 'react';

// ============= CUSTOM ICON COMPONENTS =============
export const ExperimentFilled = ({ style }) => <span style={style}>⚗️</span>;
export const MedicineBoxFilled = ({ style }) => <span style={style}>💊</span>;
export const ToolFilled = ({ style }) => <span style={style}>🛠️</span>;
export const ApartmentOutlined = ({ style }) => <span style={style}>🏢</span>;
export const SliderOutlined = ({ style }) => <span style={style}>🎚️</span>;
export const AudioOutlined = ({ style }) => <span style={style}>🎤</span>;
export const MailOutlinedIcon = ({ style }) => <span style={style}>✉️</span>;

// ============= FEATURE PLAN REQUIREMENTS =============
export const FEATURE_PLAN_REQUIREMENTS = {
  // Document Generation
  'document_generation': {
    default: 'free',
    risk_assessment: 'free',
    checklist: 'free',
    incident_report: 'free',
    training_material: 'free',
    fire_safety_plan: 'free',
    emergency_response_plan: 'basic',
    job_safety_analysis: 'basic',
    hot_work_permit: 'pro',
    confined_space_entry: 'pro',
    audit_report: 'pro',
    work_permit: 'pro',
    sop: 'basic',
    general_inspection: 'free',
    safety_management_system: 'enterprise',
    business_continuity_plan: 'pro',
    transportation_safety_plan: 'pro',
    environmental_impact_assessment: 'enterprise'
  },
  
  // Chat Features
  'chat_basic': 'free',
  'chat_advanced': 'basic',
  'chat_technical': 'pro',
  
  // Exam Features
  'exam_basic': 'basic',      // 10 questions
  'exam_full_csp': 'pro',     // 100 questions, full exam
  
  // DeepSeek AI (Premium features)
  'deepseek_document': 'basic',
  'deepseek_chat': 'basic',
  'deepseek_exam': 'pro',
  'deepseek_enhance': 'pro'
};

// ============= PLAN PERMISSIONS =============
export const PLAN_PERMISSIONS = {
  'free': {
    allowed_documents: [
      'risk_assessment', 'checklist', 'incident_report', 'training_material', 
      'fire_safety_plan', 'general_inspection', 'toolbox_talk_record',
      'safety_committee_minutes'
    ],
    name: 'Free Plan',
    upgrade_required_message: 'Upgrade to access professional templates'
  },
  'basic': {
    allowed_documents: [
      'risk_assessment', 'checklist', 'incident_report', 'training_material', 
      'fire_safety_plan', 'sop', 'emergency_response_plan', 'general_inspection',
      'chemical_risk_assessment', 'lockout_tagout_procedure', 'safety_policy_statement',
      'equipment_inspection_checklist', 'preventive_maintenance_schedule',
      'noise_monitoring_report', 'ergonomic_assessment'
    ],
    name: 'Basic Plan',
    upgrade_required_message: 'Upgrade to Pro for advanced templates'
  },
  'pro': {
    allowed_documents: [
      'risk_assessment', 'checklist', 'incident_report', 'training_material', 
      'fire_safety_plan', 'sop', 'emergency_response_plan', 'work_permit',
      'hot_work_permit', 'confined_space_entry', 'electrical_work_permit',
      'audit_report', 'business_continuity_plan', 'general_inspection',
      'chemical_risk_assessment', 'lockout_tagout_procedure', 'safety_management_system',
      'transportation', 'job_safety_analysis', 'incident_investigation_report',
      'root_cause_analysis', 'corrective_action_plan', 'lifting_equipment_certificate',
      'excavation_permit', 'height_work_permit', 'lifting_permit',
      'waste_management_plan', 'contractor_prequalification', 'health_surveillance_program'
    ],
    name: 'Pro Plan',
    upgrade_required_message: 'Upgrade to Enterprise for specialized templates'
  },
  'enterprise': {
    allowed_documents: 'all',
    name: 'Enterprise Plan',
    upgrade_required_message: null
  },
  'super_admin': {
    allowed_documents: 'all',
    name: 'Super Admin',
    upgrade_required_message: null
  }
};

// ============= INDUSTRIES CONFIGURATION =============
export const industries = [
  { 
    value: 'oil_gas', 
    label: 'Oil & Gas', 
    icon: '🛢️',
    color: '#ff4d4f',
    risk_level: '🔴 HIGH RISK',
    standards: [
      { value: 'api_std_750', label: 'API STD 750 - Process Safety Management', level: 'high' },
      { value: 'api_rp_2d', label: 'API RP 2D - Offshore Crane Operations', level: 'high' },
    ],
  },
  { 
    value: 'mining', 
    label: 'Mining', 
    icon: '⛏️',
    color: '#8c8c8c',
    risk_level: '🔴 HIGH RISK',
    standards: [
      { value: 'msha_regulations', label: 'MSHA Regulations 30 CFR', level: 'high' },
      { value: 'mine_safety_act', label: 'Mine Safety & Health Act', level: 'high' },
    ],
  },
  { 
    value: 'healthcare', 
    label: 'Healthcare', 
    icon: '🏥',
    color: '#52c41a',
    risk_level: '🟡 MEDIUM RISK',
    standards: [
      { value: 'jci_standards', label: 'JCI Accreditation Standards', level: 'high' },
      { value: 'hipaa', label: 'HIPAA - Health Insurance Portability', level: 'high' },
    ],
  },
  { 
    value: 'construction', 
    label: 'Construction', 
    icon: '🏗️',
    color: '#faad14',
    risk_level: '🟠 HIGH RISK',
    standards: [
      { value: 'osha_1926', label: 'OSHA 1926 - Construction Safety', level: 'high' },
      { value: 'nfpa_70e', label: 'NFPA 70E - Electrical Safety', level: 'high' },
    ],
  },
  { 
    value: 'manufacturing', 
    label: 'Manufacturing', 
    icon: '🏭',
    color: '#1890ff',
    risk_level: '🟡 MEDIUM RISK',
    standards: [
      { value: 'osha_1910', label: 'OSHA 1910 - General Industry', level: 'high' },
      { value: 'ansi_b11', label: 'ANSI B11 - Machine Safety', level: 'high' },
    ],
  },
  { 
    value: 'chemical', 
    label: 'Chemical', 
    icon: '🧪',
    color: '#d48806',
    risk_level: '🔴 HIGH RISK',
    standards: [
      { value: 'osha_1910_119', label: 'OSHA 1910.119 - Process Safety', level: 'high' },
      { value: 'reach', label: 'REACH - Chemical Safety', level: 'high' },
    ],
  },
  { 
    value: 'pharmaceutical', 
    label: 'Pharmaceutical', 
    icon: '💊',
    color: '#389e0d',
    risk_level: '🟡 MEDIUM RISK',
    standards: [
      { value: 'fda_cgmp', label: 'FDA cGMP', level: 'high' },
      { value: 'eu_gmp', label: 'EU GMP', level: 'high' },
    ],
  },
  { 
    value: 'power_generation', 
    label: 'Power Generation', 
    icon: '⚡',
    color: '#722ed1',
    risk_level: '🔴 HIGH RISK',
    standards: [
      { value: 'nfpa_70e', label: 'NFPA 70E - Electrical Safety', level: 'high' },
      { value: 'osha_1910_269', label: 'OSHA 1910.269 - Electrical Power', level: 'high' },
    ],
  },
  { 
    value: 'aviation', 
    label: 'Aviation', 
    icon: '✈️',
    color: '#1890ff',
    risk_level: '🔴 HIGH RISK',
    standards: [
      { value: 'faa_regulations', label: 'FAA Regulations (CFR 14)', level: 'high' },
      { value: 'icao_annex', label: 'ICAO Annex 19 - Safety Management', level: 'medium' },
    ],
  },
  { 
    value: 'transportation', 
    label: 'Transportation', 
    icon: '🚛',
    color: '#13c2c2',
    risk_level: '🟡 MEDIUM RISK',
    standards: [
      { value: 'dot_regulations', label: 'DOT Hazardous Materials', level: 'high' },
      { value: 'fmcsa_regulations', label: 'FMCSA Safety Regulations', level: 'high' },
    ],
  },
  { 
    value: 'maritime', 
    label: 'Maritime', 
    icon: '🚢',
    color: '#13c2c2',
    risk_level: '🟡 MEDIUM RISK',
    standards: [
      { value: 'solas', label: 'SOLAS - Safety of Life at Sea', level: 'high' },
      { value: 'ism_code', label: 'ISM Code - Safety Management', level: 'high' },
    ],
  },
  { 
    value: 'education', 
    label: 'Education', 
    icon: '🎓',
    color: '#52c41a',
    risk_level: '🟢 LOW RISK',
    standards: [
      { value: 'osha_1910', label: 'OSHA General Industry', level: 'medium' },
      { value: 'fire_safety_standards', label: 'Fire Safety Standards', level: 'medium' },
    ],
  },
  { 
    value: 'general', 
    label: 'General Industry', 
    icon: '🏢',
    color: '#fa8c16',
    risk_level: '🟢 LOW-MEDIUM RISK',
    standards: [
      { value: 'osha_1910', label: 'OSHA 1910 - General Industry', level: 'high' },
      { value: 'iso_45001', label: 'ISO 45001 - Occupational Health & Safety', level: 'high' },
    ],
  }
];

// ============= AVAILABLE TEMPLATES (Complete) =============
export const AVAILABLE_TEMPLATES = {
  oil_gas: {
    permits: ['hot_work_permit', 'cold_work_permit', 'confined_space_entry', 'lifting_permit', 'electrical_work_permit', 'excavation_permit', 'h2s_entry_permit'],
    risk_assessments: [
      'oilgas_drilling_operations', 'oilgas_hydrocarbon_release', 'oilgas_h2s_exposure',
      'oilgas_well_control', 'oilgas_pipeline_integrity', 'oilgas_process_safety_management',
      'oilgas_offshore_operations', 'oilgas_simultaneous_operations', 'oilgas_permit_to_work',
      'oilgas_confined_space_entry', 'oilgas_hot_work_operations', 'oilgas_lifting_operations',
      'oilgas_emergency_response', 'oilgas_environmental_protection'
    ],
    specialized: ['oilgas_simops_plan', 'oilgas_hazop_study', 'oilgas_bowtie_assessment', 'oilgas_safety_case']
  },
  construction: {
    permits: ['construction_cold_work', 'construction_hot_work', 'construction_excavation', 'construction_lifting', 'construction_height_work', 'construction_confined_space', 'construction_electrical'],
    risk_assessments: [
      'construction_structural_work', 'construction_trenching_excavation', 'construction_crane_operations',
      'construction_scaffolding', 'construction_demolition_operations', 'construction_concrete_placement',
      'construction_steel_erection', 'construction_electrical_installation', 'construction_mechanical_installation',
      'construction_roofing_operations', 'construction_piling_operations', 'construction_temporary_works',
      'construction_traffic_management', 'construction_environmental_impact'
    ],
    specialized: ['scaffold_inspection_certificate', 'crane_operation_log', 'excavation_permit', 'concrete_pouring_permit']
  },
  healthcare: {
    permits: ['healthcare_healthcare_permit'],
    risk_assessments: [
      'healthcare_infection_control', 'healthcare_medication_safety', 'healthcare_patient_handling',
      'healthcare_biohazard_exposure', 'healthcare_radiation_safety', 'healthcare_surgical_safety',
      'healthcare_laboratory_safety', 'healthcare_mental_health_risks', 'healthcare_medical_device_safety',
      'healthcare_pharmaceutical_handling', 'healthcare_emergency_department', 'healthcare_icu_critical_care',
      'healthcare_pediatric_safety', 'healthcare_elderly_care_risks'
    ],
    specialized: ['infection_control_audit', 'patient_safety_report', 'medical_device_safety', 'biohazard_waste_tracking']
  },
  manufacturing: {
    permits: ['manufacturing_manufacturing_permit'],
    risk_assessments: [
      'manufacturing_machine_guarding', 'manufacturing_chemical_exposure', 'manufacturing_ergonomic_hazards',
      'manufacturing_noise_exposure', 'manufacturing_lockout_tagout', 'manufacturing_robotics_automation',
      'manufacturing_warehouse_operations', 'manufacturing_quality_control', 'manufacturing_maintenance_operations',
      'manufacturing_material_handling', 'manufacturing_pressurized_systems', 'manufacturing_electrical_safety',
      'manufacturing_fire_safety', 'manufacturing_supply_chain_risks'
    ],
    specialized: ['lockout_tagout_procedures', 'machine_safety_certifications', 'production_line_safety_reviews', 'chemical_handling_protocols']
  },
  mining: {
    permits: ['mining_mining_permit'],
    risk_assessments: [
      'mining_ground_control', 'mining_explosives_handling', 'mining_dust_exposure',
      'mining_vehicle_interaction', 'mining_ventilation_systems', 'mining_electrical_safety',
      'mining_mine_rescue', 'mining_slope_stability', 'mining_water_management',
      'mining_equipment_maintenance', 'mining_emergency_response', 'mining_environmental_impact',
      'mining_contractor_management', 'mining_training_competency'
    ]
  },
  aviation: {
    permits: ['aviation_aviation_permit'],
    risk_assessments: [
      'aviation_aircraft_ground', 'aviation_ramp_operations', 'aviation_fuel_handling',
      'aviation_runway_safety', 'aviation_bird_strike_management', 'aviation_flight_operations',
      'aviation_maintenance_errors', 'aviation_cabin_safety', 'aviation_security_threat'
    ],
    specialized: ['flight_safety_reports', 'aircraft_maintenance_logs', 'ramp_safety_inspections', 'fuel_safety_compliance']
  },
  chemical: {
    permits: ['chemical_chemical_permit'],
    risk_assessments: [
      'chemical_chemical_release', 'chemical_reactor_safety', 'chemical_toxic_exposure',
      'chemical_process_safety', 'chemical_storage_handling', 'chemical_waste_management',
      'chemical_transportation_risks', 'chemical_emergency_response', 'chemical_corrosion_control',
      'chemical_material_compatibility', 'chemical_ventilation_systems', 'chemical_personal_protection',
      'chemical_environmental_impact', 'chemical_regulatory_compliance'
    ]
  },
  energy: {
    permits: ['energy_energy_permit'],
    risk_assessments: [
      'energy_high_voltage', 'energy_turbine_operations', 'energy_substation_safety',
      'energy_renewable_energy', 'energy_transmission_lines', 'energy_distribution_networks',
      'energy_power_generation', 'energy_energy_storage', 'energy_smart_grid_operations',
      'energy_cyber_security', 'energy_environmental_compliance', 'energy_maintenance_operations',
      'energy_emergency_shutdown', 'energy_public_safety'
    ]
  },
  maritime: {
    permits: ['maritime_maritime_permit'],
    risk_assessments: [
      'maritime_cargo_operations', 'maritime_enclosed_spaces', 'maritime_mooring_operations', 'maritime_piracy_security'
    ]
  },
  transportation: {
    permits: ['transportation_transportation_permit'],
    risk_assessments: ['transportation_safety_plan']
  },
  education: {
    permits: ['education_lab_work', 'education_field_trip', 'education_event_permit', 'education_after_hours'],
    risk_assessments: [
      'education_classroom_safety', 'education_playground_safety', 'education_laboratory_safety',
      'education_sports_activities', 'education_field_trips', 'education_fire_safety',
      'education_emergency_preparedness', 'education_child_protection', 'education_visitor_management',
      'education_transportation_safety', 'education_food_service', 'education_maintenance_activities',
      'education_special_needs', 'education_staff_training'
    ]
  }
};

// ============= AI PERSONALITY OPTIONS =============
export const personalityOptions = [
  { value: 'professional', label: 'Professional', description: 'Formal and technical responses' },
  { value: 'friendly', label: 'Friendly', description: 'Casual and approachable tone' },
  { value: 'concise', label: 'Concise', description: 'Brief and to-the-point' },
  { value: 'detailed', label: 'Detailed', description: 'Comprehensive and thorough' }
];

// ============= GENERATION MODE OPTIONS =============
export const generationModeOptions = [
  { value: 'document', label: 'Filled Document', description: 'Generate complete document with filled content and checkmarks', icon: '📝' },
  { value: 'template', label: 'Empty Template', description: 'Generate template with empty fields for manual completion', icon: '📋' }
];

// ============= HISTORY FILTER OPTIONS =============
export const historyFilterModeOptions = [
  { value: 'all', label: 'All Documents' },
  { value: 'document', label: 'Filled Documents' },
  { value: 'template', label: 'Empty Templates' }
];

// ============= EXAM TOPICS =============
export const examTopics = [
  { value: 'safety_basics', label: 'Safety Basics', icon: '📚', description: 'Fundamental safety knowledge' },
  { value: 'hazard_identification', label: 'Hazard Identification', icon: '⚠️', description: 'Recognizing workplace hazards' },
  { value: 'ppe_usage', label: 'PPE Usage', icon: '🛡️', description: 'Personal protective equipment' },
  { value: 'emergency_procedures', label: 'Emergency Procedures', icon: '🚨', description: 'Emergency response protocols' },
  { value: 'fire_safety', label: 'Fire Safety', icon: '🔥', description: 'Fire prevention and response' },
  { value: 'electrical_safety', label: 'Electrical Safety', icon: '⚡', description: 'Electrical hazard safety' },
  { value: 'chemical_safety', label: 'Chemical Safety', icon: '🧪', description: 'Chemical handling and storage' },
  { value: 'construction_safety', label: 'Construction Safety', icon: '🏗️', description: 'Construction site safety' }
];

// ============= EXAM DIFFICULTIES =============
export const examDifficulties = [
  { value: 'beginner', label: 'Beginner', color: '#52c41a', description: 'Basic safety knowledge' },
  { value: 'intermediate', label: 'Intermediate', color: '#1890ff', description: 'Moderate safety knowledge' },
  { value: 'advanced', label: 'Advanced', color: '#722ed1', description: 'Advanced safety concepts' },
  { value: 'expert', label: 'Expert', color: '#fa8c16', description: 'Professional safety expertise' }
];

// ============= CERTIFICATE COURSES =============
export const certificateCourses = [
  'General Safety Orientation', 'Hazard Communication', 'Fire Safety Training',
  'Emergency Response', 'First Aid & CPR', 'PPE Training', 'Lockout/Tagout',
  'Confined Space Entry', 'Fall Protection', 'Electrical Safety', 'Chemical Safety',
  'Incident Investigation', 'Safety Leadership', 'Risk Assessment'
];

// ============= COMPLETE DOCUMENT TYPES =============
export const documentTypes = {
  all: [
    { value: 'risk_assessment', label: 'Risk Assessment', icon: '📊', complexity: 'high', category: 'assessments', color: '#d4380d', description: 'Comprehensive risk evaluation and control planning', estimated_time: '25-35 min', plan_required: 'free', industries: ['all'] },
    { value: 'checklist', label: 'Safety Checklist', icon: '✅', complexity: 'low', category: 'inspections', color: '#08979c', description: 'Systematic workplace inspection and verification tool', estimated_time: '10-15 min', plan_required: 'free', industries: ['all'] },
    { value: 'incident_report', label: 'Incident Report', icon: '📝', complexity: 'medium', category: 'reports', color: '#cf1322', description: 'Documentation and analysis of safety incidents', estimated_time: '15-25 min', plan_required: 'free', industries: ['all'] },
    { value: 'training_material', label: 'Training Material', icon: '🎓', complexity: 'medium', category: 'training', color: '#531dab', description: 'Safety training content and competency verification', estimated_time: '25-40 min', plan_required: 'free', industries: ['all'] },
    { value: 'fire_safety_plan', label: 'Fire Safety Plan', icon: '🧯', complexity: 'medium', category: 'plans', color: '#d4380d', description: 'Comprehensive fire prevention and response planning', estimated_time: '25-35 min', plan_required: 'free', industries: ['all'] },
    { value: 'general_inspection', label: 'General Inspection', icon: '🔍', complexity: 'low', category: 'inspections', color: '#08979c', description: 'General workplace safety inspection checklist', estimated_time: '10-15 min', plan_required: 'free', industries: ['all'] },
    { value: 'sop', label: 'Safe Operating Procedure', icon: '📋', complexity: 'high', category: 'procedures', color: '#096dd9', description: 'Step-by-step safe work instructions and precautions', estimated_time: '30-45 min', plan_required: 'basic', industries: ['all'] },
    { value: 'emergency_response_plan', label: 'Emergency Response Plan', icon: '🚨', complexity: 'high', category: 'plans', color: '#d46b08', description: 'Comprehensive emergency preparedness and response planning', estimated_time: '35-50 min', plan_required: 'basic', industries: ['all'] },
    { value: 'job_safety_analysis', label: 'Job Safety Analysis (JSA)', icon: '🔧', complexity: 'high', category: 'procedures', color: '#1890ff', description: 'Task-specific hazard analysis and control', estimated_time: '20-30 min', plan_required: 'basic', industries: ['all'] },
    { value: 'hot_work_permit', label: 'Hot Work Permit', icon: '🔥', complexity: 'high', category: 'permits', color: '#f5222d', description: 'Permit for welding, cutting, and grinding', estimated_time: '15-20 min', plan_required: 'pro', industries: ['all'] },
    { value: 'confined_space_entry', label: 'Confined Space Entry Permit', icon: '🚪', complexity: 'high', category: 'permits', color: '#722ed1', description: 'Entry permit for confined spaces', estimated_time: '20-25 min', plan_required: 'pro', industries: ['all'] },
    { value: 'work_permit', label: 'General Work Permit', icon: '📝', complexity: 'medium', category: 'permits', color: '#389e0d', description: 'General work authorization permit', estimated_time: '10-15 min', plan_required: 'pro', industries: ['all'] },
    { value: 'audit_report', label: 'Safety Audit Report', icon: '🔎', complexity: 'high', category: 'reports', color: '#eb2f96', description: 'Comprehensive safety management system audit', estimated_time: '40-60 min', plan_required: 'pro', industries: ['all'] },
    { value: 'toolbox_talk_record', label: 'Toolbox Talk Record', icon: '🛠️', complexity: 'low', category: 'training', color: '#fa8c16', description: 'Toolbox talk attendance and topic record', estimated_time: '10-15 min', plan_required: 'free', industries: ['all'] },
    { value: 'safety_policy_statement', label: 'Safety Policy Statement', icon: '📜', complexity: 'medium', category: 'policy', color: '#1890ff', description: 'Organizational safety policy and commitment', estimated_time: '15-25 min', plan_required: 'basic', industries: ['all'] },
    { value: 'safety_committee_minutes', label: 'Safety Committee Minutes', icon: '📝', complexity: 'low', category: 'meetings', color: '#52c41a', description: 'Safety committee meeting minutes template', estimated_time: '10-15 min', plan_required: 'free', industries: ['all'] },
    { value: 'equipment_inspection_checklist', label: 'Equipment Inspection Checklist', icon: '🔧', complexity: 'medium', category: 'inspections', color: '#1890ff', description: 'Comprehensive equipment inspection and verification checklist', estimated_time: '15-25 min', plan_required: 'basic', industries: ['manufacturing', 'construction', 'mining', 'oil_gas'] },
    { value: 'preventive_maintenance_schedule', label: 'Preventive Maintenance Schedule', icon: '📅', complexity: 'medium', category: 'plans', color: '#52c41a', description: 'Scheduled maintenance planning and tracking document', estimated_time: '20-30 min', plan_required: 'basic', industries: ['manufacturing', 'mining', 'power_generation'] },
    { value: 'noise_monitoring_report', label: 'Noise Monitoring Report', icon: '🎧', complexity: 'medium', category: 'monitoring', color: '#faad14', description: 'Workplace noise level assessment and monitoring', estimated_time: '20-25 min', plan_required: 'basic', industries: ['manufacturing', 'construction', 'mining'] },
    { value: 'environmental_impact_assessment', label: 'Environmental Impact Assessment', icon: '🌍', complexity: 'high', category: 'assessments', color: '#52c41a', description: 'Comprehensive environmental impact analysis', estimated_time: '40-60 min', plan_required: 'enterprise', industries: ['all'] },
    { value: 'waste_management_plan', label: 'Waste Management Plan', icon: '🗑️', complexity: 'high', category: 'plans', color: '#fa8c16', description: 'Waste handling, storage, and disposal plan', estimated_time: '30-45 min', plan_required: 'pro', industries: ['manufacturing', 'chemical', 'healthcare'] },
    { value: 'contractor_prequalification', label: 'Contractor Prequalification', icon: '📋', complexity: 'high', category: 'management', color: '#722ed1', description: 'Contractor safety and capability assessment', estimated_time: '30-40 min', plan_required: 'pro', industries: ['construction', 'oil_gas', 'manufacturing'] },
    { value: 'safety_management_system', label: 'Safety Management System', icon: '🏢', complexity: 'high', category: 'compliance', color: '#096dd9', description: 'Complete SMS documentation', estimated_time: '45-60 min', plan_required: 'enterprise', industries: ['all'] },
    { value: 'incident_investigation_report', label: 'Incident Investigation Report', icon: '🔎', complexity: 'high', category: 'incidents', color: '#d4380d', description: 'Detailed incident investigation findings', estimated_time: '30-45 min', plan_required: 'pro', industries: ['all'] },
    { value: 'root_cause_analysis', label: 'Root Cause Analysis', icon: '🔬', complexity: 'high', category: 'analysis', color: '#722ed1', description: 'Systematic root cause investigation', estimated_time: '35-50 min', plan_required: 'pro', industries: ['all'] },
    { value: 'corrective_action_plan', label: 'Corrective Action Plan', icon: '✅', complexity: 'high', category: 'plans', color: '#52c41a', description: 'Action plan for incident prevention', estimated_time: '25-35 min', plan_required: 'pro', industries: ['all'] },
    { value: 'health_surveillance_program', label: 'Health Surveillance Program', icon: '🏥', complexity: 'high', category: 'health', color: '#52c41a', description: 'Comprehensive worker health monitoring program', estimated_time: '30-45 min', plan_required: 'pro', industries: ['healthcare', 'manufacturing', 'mining', 'chemical'] },
    { value: 'ergonomic_assessment', label: 'Ergonomic Assessment', icon: '🪑', complexity: 'medium', category: 'assessments', color: '#13c2c2', description: 'Workplace ergonomic risk assessment', estimated_time: '20-30 min', plan_required: 'basic', industries: ['manufacturing', 'healthcare', 'office'] },
    { value: 'lifting_equipment_certificate', label: 'Lifting Equipment Certificate', icon: '🏗️', complexity: 'high', category: 'certificates', color: '#722ed1', description: 'Certificate of inspection for lifting equipment', estimated_time: '15-20 min', plan_required: 'pro', industries: ['construction', 'manufacturing', 'oil_gas', 'mining'] },
    { value: 'electrical_work_permit', label: 'Electrical Work Permit', icon: '⚡', complexity: 'high', category: 'permits', color: '#faad14', description: 'Permit for electrical work', estimated_time: '15-20 min', plan_required: 'pro', industries: ['all'] },
    { value: 'excavation_permit', label: 'Excavation Permit', icon: '⛏️', complexity: 'high', category: 'permits', color: '#8c8c8c', description: 'Permit for excavation and trenching', estimated_time: '15-20 min', plan_required: 'pro', industries: ['construction', 'oil_gas'] },
    { value: 'height_work_permit', label: 'Height Work Permit', icon: '🏗️', complexity: 'high', category: 'permits', color: '#d4380d', description: 'Permit for work at height', estimated_time: '15-20 min', plan_required: 'pro', industries: ['construction', 'maintenance'] },
    { value: 'lifting_permit', label: 'Lifting Operations Permit', icon: '🏋️', complexity: 'high', category: 'permits', color: '#1890ff', description: 'Permit for crane and lifting operations', estimated_time: '15-20 min', plan_required: 'pro', industries: ['construction', 'manufacturing', 'oil_gas'] }
  ],
  categories: {
    all: { label: 'All Documents', icon: '📋', color: '#1890ff' },
    permits: { label: 'Permits & Authorizations', icon: '📝', color: '#d4380d' },
    assessments: { label: 'Risk Assessments', icon: '📊', color: '#d4380d' },
    procedures: { label: 'Procedures & SWMS', icon: '📋', color: '#096dd9' },
    plans: { label: 'Safety Plans', icon: '🗺️', color: '#d46b08' },
    reports: { label: 'Reports', icon: '📄', color: '#722ed1' },
    inspections: { label: 'Inspections', icon: '✅', color: '#08979c' },
    training: { label: 'Training', icon: '🎓', color: '#389e0d' },
    compliance: { label: 'Compliance', icon: '⚖️', color: '#722ed1' },
    incidents: { label: 'Incident Management', icon: '⚠️', color: '#cf1322' },
    monitoring: { label: 'Monitoring', icon: '📏', color: '#13c2c2' },
    health: { label: 'Health & Hygiene', icon: '🏥', color: '#52c41a' },
    certificates: { label: 'Certificates', icon: '🏆', color: '#722ed1' },
    records: { label: 'Records', icon: '📚', color: '#8c8c8c' },
    agreements: { label: 'Agreements', icon: '📜', color: '#13c2c2' },
    studies: { label: 'Studies', icon: '🔬', color: '#722ed1' },
    policy: { label: 'Policy', icon: '📜', color: '#1890ff' },
    manual: { label: 'Manuals', icon: '📚', color: '#722ed1' },
    meetings: { label: 'Meetings', icon: '👥', color: '#52c41a' },
    briefings: { label: 'Briefings', icon: '🎤', color: '#13c2c2' },
    analysis: { label: 'Analysis', icon: '📊', color: '#722ed1' },
    management: { label: 'Management', icon: '👔', color: '#722ed1' }
  }
};

// ============= HELPER FUNCTIONS =============

export const getIndustryIcon = (industryValue) => {
  const iconMap = {
    'oil_gas': '🛢️', 'healthcare': '🏥', 'construction': '🏗️',
    'manufacturing': '🏭', 'aviation': '✈️', 'mining': '⛏️',
    'transportation': '🚛', 'general': '🏢', 'chemical': '🧪',
    'pharmaceutical': '💊', 'power_generation': '⚡', 'maritime': '🚢',
    'education': '🎓'
  };
  return iconMap[industryValue] || '🏢';
};

export const getPlanFeatures = (plan) => {
  const features = {
    'basic': ['Access to Basic document templates', 'Standard safety procedures', 'Basic emergency planning', 'Email support'],
    'pro': ['All Basic features plus', 'Advanced document templates', 'Transportation safety plans', 'Work permits and authorizations', 'Comprehensive audit reports', 'Priority email support'],
    'enterprise': ['All Pro features plus', 'Enterprise-grade templates', 'Custom document generation', 'API access', 'Dedicated support', 'Professional PDF generation', 'Advanced PDF editing', 'Template management']
  };
  return features[plan] || features.pro;
};

export const checkDocumentPermission = (documentType, userPlanLevel, documentTypesData) => {
  console.group(`🔐 Checking permission for ${documentType}`);
  
  const isSuperAdmin = userPlanLevel === 'super_admin';
  if (isSuperAdmin) {
    console.log('👑 SUPER ADMIN ACCESS GRANTED');
    console.groupEnd();
    return { allowed: true, message: '', isSuperAdmin: true };
  }
  
  const specialFeatures = {
    'exam': { requiredPlan: 'pro,enterprise,business,super_admin, Admin', name: 'Safety Exam', business: true },
    'certificate': { requiredPlan: 'pro,enterprise,business,super_admin, Admin', name: 'Certificate Generation', business: true }
  };
  
  if (specialFeatures[documentType]) {
    const feature = specialFeatures[documentType];
    const planHierarchy = { free: 1, basic: 2, pro: 3, business: 4, enterprise: 5, super_admin: 6 };
    const currentLevel = planHierarchy[userPlanLevel] || 1;
    const requiredLevel = planHierarchy[feature.requiredPlan] || 4;
    
    if (currentLevel >= requiredLevel) {
      console.log(`✅ ${feature.name} allowed for ${userPlanLevel}`);
      console.groupEnd();
      return { allowed: true, message: '' };
    } else {
      const result = {
        allowed: false,
        message: `${feature.name} requires ${feature.requiredPlan.toUpperCase()} plan or higher`,
        requiredPlan: feature.requiredPlan,
        currentPlan: userPlanLevel,
        featureName: feature.name
      };
      console.log('❌ Permission denied:', result);
      console.groupEnd();
      return result;
    }
  }
  
  const doc = documentTypesData?.all?.find(d => d.value === documentType);
  if (!doc) {
    console.groupEnd();
    return { allowed: false, message: 'Document type not found' };
  }
  
  const planHierarchy = { free: 1, basic: 2, pro: 3, enterprise: 4, super_admin: 5 };
  const currentLevel = planHierarchy[userPlanLevel] || 1;
  const requiredLevel = planHierarchy[doc.plan_required] || 1;
  
  if (currentLevel >= requiredLevel) {
    console.log('✅ Permission granted');
    console.groupEnd();
    return { allowed: true, message: '' };
  }
  
  const result = {
    allowed: false,
    message: `${doc.label} requires ${doc.plan_required.toUpperCase()} plan or higher`,
    requiredPlan: doc.plan_required,
    currentPlan: userPlanLevel,
    featureName: doc.label
  };
  console.log('❌ Permission denied:', result);
  console.groupEnd();
  return result;
};

export const getBackendTemplateId = (documentType, industry) => {
  console.log('🔍 getBackendTemplateId called with:', { documentType, industry });
  
  // ============================================================
  // COMPLETE TEMPLATE ID MAPPING - Based on Backend Discovery
  // ============================================================
  
  // Industry-specific template mappings
  const industryMappings = {
    // ========================================
    // OIL & GAS
    // ========================================
    oil_gas: {
      // Risk Assessments
      'oilgas_drilling_operations': 'oilgas_get_risk_assessments_drilling_operations',
      'oilgas_hydrocarbon_release': 'oilgas_get_risk_assessments_hydrocarbon_release',
      'oilgas_h2s_exposure': 'oilgas_get_risk_assessments_h2s_exposure',
      'oilgas_well_control': 'oilgas_get_risk_assessments_well_control',
      'oilgas_pipeline_integrity': 'oilgas_get_risk_assessments_pipeline_integrity',
      'oilgas_process_safety_management': 'oilgas_get_risk_assessments_process_safety_management',
      'oilgas_offshore_operations': 'oilgas_get_risk_assessments_offshore_operations',
      'oilgas_simultaneous_operations': 'oilgas_get_risk_assessments_simultaneous_operations',
      'oilgas_permit_to_work': 'oilgas_get_risk_assessments_permit_to_work',
      'oilgas_confined_space_entry': 'oilgas_get_risk_assessments_confined_space_entry',
      'oilgas_hot_work_operations': 'oilgas_get_risk_assessments_hot_work_operations',
      'oilgas_lifting_operations': 'oilgas_get_risk_assessments_lifting_operations',
      'oilgas_emergency_response': 'oilgas_get_risk_assessments_emergency_response',
      'oilgas_environmental_protection': 'oilgas_get_risk_assessments_environmental_protection',
      
      // Permits
      'oilgas_hot_work': 'oilgas_get_permit_templates_hot_work',
      'oilgas_confined_space': 'oilgas_get_permit_templates_confined_space',
      'oilgas_lifting': 'oilgas_get_permit_templates_lifting',
      'oilgas_electrical': 'oilgas_get_permit_templates_electrical',
      'oilgas_excavation': 'oilgas_get_permit_templates_excavation',
      'oilgas_h2s_entry': 'oilgas_get_permit_templates_h2s_entry',
      
      // Specialized
      'oilgas_simops_plan': 'oilgas_get_oilgas_specialized_simops_plan',
      'oilgas_hazop_study': 'oilgas_get_oilgas_specialized_hazop_study',
      'oilgas_bowtie_assessment': 'oilgas_get_oilgas_specialized_bowtie_assessment',
      'oilgas_safety_case': 'oilgas_get_oilgas_specialized_safety_case',
      
      // Method Statements
      'oilgas_drilling_procedure': 'oilgas_get_method_statements_drilling_procedure',
      'oilgas_well_control_method': 'oilgas_get_method_statements_well_control_method',
      'oilgas_rig_inspection_method': 'oilgas_get_method_statements_rig_inspection_method',
      'oilgas_pipe_inspection_method': 'oilgas_get_method_statements_pipe_inspection_method',
      'oilgas_safety_case_method': 'oilgas_get_method_statements_safety_case_method',
      'oilgas_simops_procedure': 'oilgas_get_method_statements_simops_procedure',
      'oilgas_emergency_response_method': 'oilgas_get_method_statements_emergency_response_method',
      'oilgas_environmental_protection_method': 'oilgas_get_method_statements_environmental_protection_method',
      
      // Generic fallbacks
      'risk_assessment': 'oilgas_risk_assessment_general',
      'checklist': 'general_checklist',
    },
    
    // ========================================
    // CONSTRUCTION
    // ========================================
    construction: {
      // Risk Assessments
      'construction_structural_work': 'construction_get_risk_assessments_structural_work',
      'construction_trenching_excavation': 'construction_get_risk_assessments_trenching_excavation',
      'construction_crane_operations': 'construction_get_risk_assessments_crane_operations',
      'construction_scaffolding': 'construction_get_risk_assessments_scaffolding',
      'construction_demolition_operations': 'construction_get_risk_assessments_demolition_operations',
      'construction_concrete_placement': 'construction_get_risk_assessments_concrete_placement',
      'construction_steel_erection': 'construction_get_risk_assessments_steel_erection',
      'construction_electrical_installation': 'construction_get_risk_assessments_electrical_installation',
      'construction_mechanical_installation': 'construction_get_risk_assessments_mechanical_installation',
      'construction_roofing_operations': 'construction_get_risk_assessments_roofing_operations',
      'construction_piling_operations': 'construction_get_risk_assessments_piling_operations',
      'construction_temporary_works': 'construction_get_risk_assessments_temporary_works',
      'construction_traffic_management': 'construction_get_risk_assessments_traffic_management',
      'construction_environmental_impact': 'construction_get_risk_assessments_environmental_impact',
      
      // JSAs
      'construction_scaffold_erection_jsa': 'construction_get_jsa_templates_scaffold_erection_jsa',
      'construction_excavation_jsa': 'construction_get_jsa_templates_excavation_jsa',
      'construction_crane_lift_jsa': 'construction_get_jsa_templates_crane_lift_jsa',
      'construction_concrete_pour_jsa': 'construction_get_jsa_templates_concrete_pour_jsa',
      'construction_steel_erection_jsa': 'construction_get_jsa_templates_steel_erection_jsa',
      'construction_demolition_jsa': 'construction_get_jsa_templates_demolition_jsa',
      'construction_roofing_jsa': 'construction_get_jsa_templates_roofing_jsa',
      'construction_confined_space_jsa': 'construction_get_jsa_templates_confined_space_jsa',
      'construction_hot_work_jsa': 'construction_get_jsa_templates_hot_work_jsa',
      'construction_electrical_jsa': 'construction_get_jsa_templates_electrical_jsa',
      
      // MSDS
      'construction_cement_msds': 'construction_get_msds_documents_cement_msds',
      'construction_asphalt_msds': 'construction_get_msds_documents_asphalt_msds',
      'construction_paint_msds': 'construction_get_msds_documents_paint_msds',
      'construction_epoxy_msds': 'construction_get_msds_documents_epoxy_msds',
      'construction_solvents_msds': 'construction_get_msds_documents_solvents_msds',
      'construction_adhesives_msds': 'construction_get_msds_documents_adhesives_msds',
      'construction_concrete_additives_msds': 'construction_get_msds_documents_concrete_additives_msds',
      'construction_fuel_msds': 'construction_get_msds_documents_fuel_msds',
      'construction_oils_greases_msds': 'construction_get_msds_documents_oils_greases_msds',
      'construction_cleaning_chemicals_msds': 'construction_get_msds_documents_cleaning_chemicals_msds',
      
      // Permits
      'construction_cold_work': 'construction_get_permit_templates_cold_work',
      'construction_hot_work': 'construction_get_permit_templates_hot_work',
      'construction_excavation': 'construction_get_permit_templates_excavation',
      'construction_lifting': 'construction_get_permit_templates_lifting',
      'construction_height_work': 'construction_get_permit_templates_height_work',
      'construction_confined_space': 'construction_get_permit_templates_confined_space',
      'construction_electrical': 'construction_get_permit_templates_electrical',
      
      // Specialized
      'construction_scaffold_inspection': 'construction_get_construction_specialized_scaffold_inspection_certificate',
      'construction_crane_operation_log': 'construction_get_construction_specialized_crane_operation_log',
      'construction_excavation_permit': 'construction_get_construction_specialized_excavation_permit',
      'construction_concrete_pouring_permit': 'construction_get_construction_specialized_concrete_pouring_permit',
      
      // Generic fallbacks
      'risk_assessment': 'construction_risk_assessment_general',
      'checklist': 'general_checklist',
    },
    
    // ========================================
    // MINING
    // ========================================
    mining: {
      // Risk Assessments
      'mining_ground_control': 'mining_get_risk_assessments_ground_control',
      'mining_explosives_handling': 'mining_get_risk_assessments_explosives_handling',
      'mining_dust_exposure': 'mining_get_risk_assessments_dust_exposure',
      'mining_vehicle_interaction': 'mining_get_risk_assessments_vehicle_interaction',
      'mining_ventilation_systems': 'mining_get_risk_assessments_ventilation_systems',
      'mining_electrical_safety': 'mining_get_risk_assessments_electrical_safety',
      'mining_mine_rescue': 'mining_get_risk_assessments_mine_rescue',
      'mining_slope_stability': 'mining_get_risk_assessments_slope_stability',
      'mining_water_management': 'mining_get_risk_assessments_water_management',
      'mining_equipment_maintenance': 'mining_get_risk_assessments_equipment_maintenance',
      'mining_emergency_response': 'mining_get_risk_assessments_emergency_response',
      'mining_environmental_impact': 'mining_get_risk_assessments_environmental_impact',
      'mining_contractor_management': 'mining_get_risk_assessments_contractor_management',
      'mining_training_competency': 'mining_get_risk_assessments_training_competency',
      
      // JSAs
      'mining_drilling_blasting_jsa': 'mining_get_jsa_templates_drilling_blasting_jsa',
      'mining_ground_control_jsa': 'mining_get_jsa_templates_ground_control_jsa',
      'mining_haul_truck_operation_jsa': 'mining_get_jsa_templates_haul_truck_operation_jsa',
      'mining_conveyor_maintenance_jsa': 'mining_get_jsa_templates_conveyor_maintenance_jsa',
      'mining_crusher_operation_jsa': 'mining_get_jsa_templates_crusher_operation_jsa',
      'mining_shaft_sinking_jsa': 'mining_get_jsa_templates_shaft_sinking_jsa',
      'mining_ventilation_installation_jsa': 'mining_get_jsa_templates_ventilation_installation_jsa',
      'mining_electrical_maintenance_jsa': 'mining_get_jsa_templates_electrical_maintenance_jsa',
      'mining_confined_space_jsa': 'mining_get_jsa_templates_confined_space_jsa',
      'mining_emergency_rescue_jsa': 'mining_get_jsa_templates_emergency_rescue_jsa',
      
      // Method Statements
      'mining_blasting_procedure': 'mining_get_method_statements_blasting_procedure',
      'mining_ground_support_method': 'mining_get_method_statements_ground_support_method',
      'mining_ventilation_method': 'mining_get_method_statements_ventilation_method',
      'mining_dewatering_method': 'mining_get_method_statements_dewatering_method',
      'mining_rehabilitation_method': 'mining_get_method_statements_rehabilitation_method',
      'mining_exploration_method': 'mining_get_method_statements_exploration_method',
      'mining_extraction_method': 'mining_get_method_statements_extraction_method',
      'mining_processing_method': 'mining_get_method_statements_processing_method',
      
      // Permits
      'mining_blast_zone_entry': 'mining_get_permit_templates_blast_zone_entry',
      'mining_confined_space': 'mining_get_permit_templates_confined_space_mining',
      'mining_hot_work': 'mining_get_permit_templates_hot_work_mining',
      'mining_ground_control_permit': 'mining_get_permit_templates_ground_control',
      'mining_high_voltage': 'mining_get_permit_templates_high_voltage_mining',
      'mining_vehicle_entry': 'mining_get_permit_templates_vehicle_entry',
      'mining_shaft_work': 'mining_get_permit_templates_shaft_work',
      'mining_ventilation_work': 'mining_get_permit_templates_ventilation_work',
      'mining_water_management': 'mining_get_permit_templates_water_management',
      'mining_emergency_response_mining': 'mining_get_permit_templates_emergency_response_mining',
      
      // Generic fallbacks
      'risk_assessment': 'mining_risk_assessment_general',
      'checklist': 'general_checklist',
    },
    
    // ========================================
    // MANUFACTURING
    // ========================================
    manufacturing: {
      // Risk Assessments
      'manufacturing_machine_guarding': 'manufacturing_get_risk_assessments_machine_guarding',
      'manufacturing_chemical_exposure': 'manufacturing_get_risk_assessments_chemical_exposure',
      'manufacturing_ergonomic_hazards': 'manufacturing_get_risk_assessments_ergonomic_hazards',
      'manufacturing_noise_exposure': 'manufacturing_get_risk_assessments_noise_exposure',
      'manufacturing_lockout_tagout': 'manufacturing_get_risk_assessments_lockout_tagout',
      'manufacturing_robotics_automation': 'manufacturing_get_risk_assessments_robotics_automation',
      'manufacturing_warehouse_operations': 'manufacturing_get_risk_assessments_warehouse_operations',
      'manufacturing_quality_control': 'manufacturing_get_risk_assessments_quality_control',
      'manufacturing_maintenance_operations': 'manufacturing_get_risk_assessments_maintenance_operations',
      'manufacturing_material_handling': 'manufacturing_get_risk_assessments_material_handling',
      'manufacturing_pressurized_systems': 'manufacturing_get_risk_assessments_pressurized_systems',
      'manufacturing_electrical_safety': 'manufacturing_get_risk_assessments_electrical_safety',
      'manufacturing_fire_safety': 'manufacturing_get_risk_assessments_fire_safety',
      'manufacturing_supply_chain_risks': 'manufacturing_get_risk_assessments_supply_chain_risks',
      
      // JSAs
      'manufacturing_machine_operation_jsa': 'manufacturing_get_jsa_templates_machine_operation_jsa',
      'manufacturing_lockout_tagout_jsa': 'manufacturing_get_jsa_templates_lockout_tagout_jsa',
      'manufacturing_press_operation_jsa': 'manufacturing_get_jsa_templates_press_operation_jsa',
      'manufacturing_conveyor_maintenance_jsa': 'manufacturing_get_jsa_templates_conveyor_maintenance_jsa',
      'manufacturing_robotic_cell_jsa': 'manufacturing_get_jsa_templates_robotic_cell_jsa',
      'manufacturing_welding_jsa': 'manufacturing_get_jsa_templates_welding_jsa',
      'manufacturing_grinding_jsa': 'manufacturing_get_jsa_templates_grinding_jsa',
      'manufacturing_forklift_operation_jsa': 'manufacturing_get_jsa_templates_forklift_operation_jsa',
      'manufacturing_chemical_mixing_jsa': 'manufacturing_get_jsa_templates_chemical_mixing_jsa',
      'manufacturing_assembly_line_jsa': 'manufacturing_get_jsa_templates_assembly_line_jsa',
      
      // Method Statements
      'manufacturing_machine_setup_method': 'manufacturing_get_method_statements_machine_setup_method',
      'manufacturing_maintenance_procedure': 'manufacturing_get_method_statements_maintenance_procedure',
      'manufacturing_quality_control_method': 'manufacturing_get_method_statements_quality_control_method',
      'manufacturing_material_handling_method': 'manufacturing_get_method_statements_material_handling_method',
      'manufacturing_production_line_method': 'manufacturing_get_method_statements_production_line_method',
      'manufacturing_packaging_method': 'manufacturing_get_method_statements_packaging_method',
      'manufacturing_cleaning_procedure': 'manufacturing_get_method_statements_cleaning_procedure',
      'manufacturing_changeover_procedure': 'manufacturing_get_method_statements_changeover_procedure',
      
      // Permits
      'manufacturing_lockout_tagout_permit': 'manufacturing_get_permit_templates_lockout_tagout',
      'manufacturing_confined_space': 'manufacturing_get_permit_templates_confined_space_manufacturing',
      'manufacturing_hot_work': 'manufacturing_get_permit_templates_hot_work_manufacturing',
      'manufacturing_machine_maintenance': 'manufacturing_get_permit_templates_machine_maintenance',
      'manufacturing_chemical_handling': 'manufacturing_get_permit_templates_chemical_handling',
      'manufacturing_forklift_operation': 'manufacturing_get_permit_templates_forklift_operation',
      'manufacturing_electrical': 'manufacturing_get_permit_templates_electrical_manufacturing',
      'manufacturing_press_operation': 'manufacturing_get_permit_templates_press_operation',
      'manufacturing_robotic_cell': 'manufacturing_get_permit_templates_robotic_cell',
      'manufacturing_line_maintenance': 'manufacturing_get_permit_templates_line_maintenance',
      
      // Specialized
      'manufacturing_lockout_tagout_procedures': 'manufacturing_get_manufacturing_specialized_lockout_tagout_procedures',
      'manufacturing_machine_safety_certifications': 'manufacturing_get_manufacturing_specialized_machine_safety_certifications',
      'manufacturing_production_line_safety_reviews': 'manufacturing_get_manufacturing_specialized_production_line_safety_reviews',
      'manufacturing_chemical_handling_protocols': 'manufacturing_get_manufacturing_specialized_chemical_handling_protocols',
      
      // Generic fallbacks
      'risk_assessment': 'manufacturing_risk_assessment_general',
      'checklist': 'general_checklist',
    },
    
    // ========================================
    // HEALTHCARE
    // ========================================
    healthcare: {
      // Risk Assessments
      'healthcare_infection_control': 'healthcare_get_risk_assessments_infection_control',
      'healthcare_medication_safety': 'healthcare_get_risk_assessments_medication_safety',
      'healthcare_patient_handling': 'healthcare_get_risk_assessments_patient_handling',
      'healthcare_biohazard_exposure': 'healthcare_get_risk_assessments_biohazard_exposure',
      'healthcare_radiation_safety': 'healthcare_get_risk_assessments_radiation_safety',
      'healthcare_surgical_safety': 'healthcare_get_risk_assessments_surgical_safety',
      'healthcare_laboratory_safety': 'healthcare_get_risk_assessments_laboratory_safety',
      'healthcare_mental_health_risks': 'healthcare_get_risk_assessments_mental_health_risks',
      'healthcare_medical_device_safety': 'healthcare_get_risk_assessments_medical_device_safety',
      'healthcare_pharmaceutical_handling': 'healthcare_get_risk_assessments_pharmaceutical_handling',
      'healthcare_emergency_department': 'healthcare_get_risk_assessments_emergency_department',
      'healthcare_icu_critical_care': 'healthcare_get_risk_assessments_icu_critical_care',
      'healthcare_pediatric_safety': 'healthcare_get_risk_assessments_pediatric_safety',
      'healthcare_elderly_care_risks': 'healthcare_get_risk_assessments_elderly_care_risks',
      
      // Permits
      'healthcare_permit': 'healthcare_get_permit_templates_healthcare_permit',
      
      // Specialized
      'healthcare_infection_control_audit': 'healthcare_get_healthcare_specialized_infection_control_audit',
      'healthcare_patient_safety_report': 'healthcare_get_healthcare_specialized_patient_safety_report',
      'healthcare_medical_device_safety': 'healthcare_get_healthcare_specialized_medical_device_safety',
      'healthcare_biohazard_waste_tracking': 'healthcare_get_healthcare_specialized_biohazard_waste_tracking',
      
      // Generic fallbacks
      'risk_assessment': 'healthcare_risk_assessment_general',
      'checklist': 'general_checklist',
    },
    
    // ========================================
    // AVIATION
    // ========================================
    aviation: {
      // Risk Assessments
      'aviation_aircraft_ground': 'aviation_get_risk_assessments_aircraft_ground',
      'aviation_ramp_operations': 'aviation_get_risk_assessments_ramp_operations',
      'aviation_ground_handling': 'aviation_get_risk_assessments_ground_handling_comprehensive',
      'aviation_maintenance_errors': 'aviation_get_risk_assessments_maintenance_errors',
      'aviation_fuel_handling': 'aviation_get_risk_assessments_fuel_handling',
      'aviation_dangerous_goods': 'aviation_get_risk_assessments_dangerous_goods_comprehensive',
      'aviation_flight_operations': 'aviation_get_risk_assessments_flight_operations',
      'aviation_weather_operations': 'aviation_get_risk_assessments_weather_operations',
      'aviation_fatigue_management': 'aviation_get_risk_assessments_fatigue_management',
      'aviation_air_traffic_control': 'aviation_get_risk_assessments_air_traffic_control',
      'aviation_bird_strike': 'aviation_get_risk_assessments_bird_strike_management',
      'aviation_cabin_safety': 'aviation_get_risk_assessments_cabin_safety',
      'aviation_emergency_evacuation': 'aviation_get_risk_assessments_emergency_evacuation',
      'aviation_security_screening': 'aviation_get_risk_assessments_security_screening',
      'aviation_security_threat': 'aviation_get_risk_assessments_security_threat',
      'aviation_human_remains': 'aviation_get_risk_assessments_human_remains',
      'aviation_engine_run': 'aviation_get_risk_assessments_engine_run',
      
      // Permits
      'aviation_aircraft_refueling': 'aviation_get_permit_templates_aircraft_refueling',
      'aviation_confined_space': 'aviation_get_permit_templates_confined_space_aviation',
      'aviation_hot_work': 'aviation_get_permit_templates_hot_work_aviation',
      'aviation_ground_power': 'aviation_get_permit_templates_ground_power',
      'aviation_deicing': 'aviation_get_permit_templates_deicing',
      'aviation_cargo_loading': 'aviation_get_permit_templates_cargo_loading_aviation',
      'aviation_apu_operation': 'aviation_get_permit_templates_apu_operation',
      'aviation_engine_run_permit': 'aviation_get_permit_templates_engine_run',
      'aviation_fuel_tank_entry': 'aviation_get_permit_templates_fuel_tank_entry',
      'aviation_ramp_entry': 'aviation_get_permit_templates_ramp_entry',
      
      // Specialized
      'aviation_flight_safety_reports': 'aviation_get_aviation_specialized_flight_safety_reports',
      'aviation_aircraft_maintenance_logs': 'aviation_get_aviation_specialized_aircraft_maintenance_logs',
      'aviation_ramp_safety_inspections': 'aviation_get_aviation_specialized_ramp_safety_inspections',
      'aviation_fuel_safety_compliance': 'aviation_get_aviation_specialized_fuel_safety_compliance',
      
      // Generic fallbacks
      'risk_assessment': 'aviation_risk_assessment_general',
      'checklist': 'general_checklist',
    },
    
    // ========================================
    // CHEMICAL
    // ========================================
    chemical: {
      // Risk Assessments
      'chemical_release': 'chemical_get_risk_assessments_chemical_release',
      'chemical_reactor_safety': 'chemical_get_risk_assessments_reactor_safety',
      'chemical_toxic_exposure': 'chemical_get_risk_assessments_toxic_exposure',
      'chemical_process_safety': 'chemical_get_risk_assessments_process_safety',
      'chemical_storage_handling': 'chemical_get_risk_assessments_storage_handling',
      'chemical_waste_management': 'chemical_get_risk_assessments_waste_management',
      'chemical_transportation_risks': 'chemical_get_risk_assessments_transportation_risks',
      'chemical_emergency_response': 'chemical_get_risk_assessments_emergency_response',
      'chemical_corrosion_control': 'chemical_get_risk_assessments_corrosion_control',
      'chemical_material_compatibility': 'chemical_get_risk_assessments_material_compatibility',
      'chemical_ventilation_systems': 'chemical_get_risk_assessments_ventilation_systems',
      'chemical_personal_protection': 'chemical_get_risk_assessments_personal_protection',
      'chemical_environmental_impact': 'chemical_get_risk_assessments_environmental_impact',
      'chemical_regulatory_compliance': 'chemical_get_risk_assessments_regulatory_compliance',
      
      // Permits
      'chemical_reactor_entry': 'chemical_get_permit_templates_reactor_entry',
      'chemical_confined_space': 'chemical_get_permit_templates_confined_space_chemical',
      'chemical_hot_work': 'chemical_get_permit_templates_hot_work_chemical',
      'chemical_chemical_transfer': 'chemical_get_permit_templates_chemical_transfer',
      'chemical_tank_entry': 'chemical_get_permit_templates_tank_entry_chemical',
      'chemical_line_breaking': 'chemical_get_permit_templates_line_breaking',
      'chemical_high_pressure': 'chemical_get_permit_templates_high_pressure',
      'chemical_exothermic_reaction': 'chemical_get_permit_templates_exothermic_reaction',
      'chemical_sampling_permit': 'chemical_get_permit_templates_sampling_permit',
      'chemical_maintenance': 'chemical_get_permit_templates_maintenance_chemical',
      
      // Generic fallbacks
      'risk_assessment': 'chemical_risk_assessment_general',
      'checklist': 'general_checklist',
    },
    
    general: {
  // From GeneralSafetyDocuments
  'sop': 'generalsafetydocuments_get_templates_sop',
  'emergency_response_plan': 'emergencyresponse_get_emergency_templates_emergency_response_plan',
  'business_continuity_plan': 'generalsafetydocuments_get_templates_business_continuity_plan',
  'safety_management_system': 'generalsafetydocuments_get_templates_safety_management_system',
  'transportation_safety_plan': 'generalsafetydocuments_get_templates_transportation_safety_plan',
  'audit_report': 'generalsafetydocuments_get_templates_audit_report',
  'training_material': 'generalsafetydocuments_get_templates_training_material',
  'fire_safety_plan': 'emergencyresponse_get_emergency_templates_fire_emergency_plan',
  'general_inspection': 'inspectionmonitoring_get_inspection_templates_workplace_inspection_report',
  
  // From EnhancedGeneralPermitGenerator
  'hot_work_permit': 'general_get_permit_templates_hot_work_general',
  'cold_work_permit': 'general_get_permit_templates_cold_work',
  'confined_space_entry': 'general_get_permit_templates_confined_space_general',
  'electrical_work_permit': 'general_get_permit_templates_electrical_general',
  'lifting_permit': 'general_get_permit_templates_lifting_operations',
  'excavation_permit': 'general_get_permit_templates_excavation_general',
  'height_work_permit': 'general_get_permit_templates_working_at_height',
  'chemical_handling_permit': 'general_get_permit_templates_chemical_handling_general',
  'maintenance_permit': 'general_get_permit_templates_maintenance_general',
  'contractor_permit': 'general_get_permit_templates_contractor_general',
  'safety_hold_permit': 'general_get_permit_templates_safety_hold',
  
  // From IncidentManagementTemplates
  'incident_report': 'incidentmanagement_get_incident_templates_incident_report_form',
  'incident_investigation': 'incidentmanagement_get_incident_templates_incident_investigation_report',
  'near_miss_report': 'incidentmanagement_get_incident_templates_near_miss_report',
  'root_cause_analysis': 'incidentmanagement_get_incident_templates_root_cause_analysis',
  'corrective_action_plan': 'incidentmanagement_get_incident_templates_corrective_action_plan',
  
  // From OperationalSafetyTemplates
  'job_safety_analysis': 'operationalsafety_get_operational_templates_job_safety_analysis',
  'safe_work_method_statement': 'operationalsafety_get_operational_templates_safe_work_method_statement',
  'pre_task_briefing': 'operationalsafety_get_operational_templates_pre_task_briefing',
  'toolbox_talk_record': 'operationalsafety_get_operational_templates_toolbox_talk_record',
  
  // From SafetyManagementTemplates
  'safety_policy_statement': 'safetymanagement_get_management_templates_safety_policy_statement',
  'safety_committee_minutes': 'safetymanagement_get_management_templates_safety_committee_minutes',
  
  // From InspectionMonitoringTemplates
  'daily_safety_inspection': 'inspectionmonitoring_get_inspection_templates_daily_safety_inspection',
  'safety_walkthrough': 'inspectionmonitoring_get_inspection_templates_safety_walkthrough_checklist',
  'hazard_observation': 'inspectionmonitoring_get_inspection_templates_hazard_observation_report',
  
  // Risk Assessment - Use a real existing template
  'risk_assessment': 'construction_get_risk_assessments_structural_work',  // ← Changed from 'risk_assessment_general'
  'checklist': 'general_checklist',
  'work_permit': 'general_work_permit',
}
  };

  // ============================================================
  // LOOKUP LOGIC
  // ============================================================
  
  // 1. Check industry-specific mapping
  const industryMapping = industryMappings[industry];
  if (industryMapping && industryMapping[documentType]) {
    const templateId = industryMapping[documentType];
    console.log(`✅ Found industry-specific mapping: ${documentType} → ${templateId}`);
    return templateId;
  }
  
  // 2. Check general mapping (fallback for all industries)
  const generalMapping = industryMappings.general;
  if (generalMapping && generalMapping[documentType]) {
    const templateId = generalMapping[documentType];
    console.log(`✅ Found general mapping: ${documentType} → ${templateId}`);
    return templateId;
  }
  
  // 3. Check if it's a risk assessment
  if (documentType === 'risk_assessment' || documentType.includes('risk_assessment')) {
    const templateId = `${industry}_risk_assessment_general`;
    console.log(`⚠️ Using fallback risk assessment: ${templateId}`);
    return templateId;
  }
  
  // 4. Check if it's a checklist
  if (documentType === 'checklist' || documentType.includes('checklist')) {
    console.log(`✅ Using general checklist`);
    return 'general_checklist';
  }
  
  // 5. Default fallback
  console.log(`⚠️ No mapping found for ${documentType} in ${industry}, using generic fallback`);
  return `${industry}_${documentType}`;
};

export const getCustomSectionsForDocument = (docType, industry) => {
  const sections = [];
  
  if (industry === 'mining') sections.push('GROUND CONTROL', 'VENTILATION');
  else if (industry === 'oil_gas') sections.push('PROCESS SAFETY', 'H2S MONITORING');
  else if (industry === 'healthcare') sections.push('INFECTION CONTROL', 'PATIENT SAFETY');
  else if (industry === 'chemical') sections.push('CHEMICAL STORAGE', 'SPILL RESPONSE');
  else if (industry === 'power_generation') sections.push('ELECTRICAL SAFETY', 'ENERGY ISOLATION');
  else if (industry === 'aviation') sections.push('RAMP SAFETY', 'AIRCRAFT GROUND HANDLING');
  else if (industry === 'construction') sections.push('FALL PROTECTION', 'HEAVY EQUIPMENT');
  else if (industry === 'manufacturing') sections.push('MACHINE SAFETY', 'LOTO PROCEDURES');
  
  if (docType.includes('permit')) sections.push('AUTHORIZATION WORKFLOW', 'SAFETY PRECAUTIONS');
  else if (docType.includes('assessment')) sections.push('RISK MATRIX', 'CONTROL EFFECTIVENESS');
  else if (docType.includes('emergency')) sections.push('EVACUATION PROCEDURES', 'EMERGENCY CONTACTS');
  else if (docType.includes('inspection')) sections.push('INSPECTION ITEMS', 'CORRECTIVE ACTIONS');
  else if (docType.includes('training')) sections.push('TRAINING OBJECTIVES', 'COMPETENCY VERIFICATION');
  
  return sections;
};

export const generateLocalAIResponse = (userPrompt, industry, industriesList, aiPersonality) => {
  const industryObj = industriesList.find(ind => ind.value === industry);
  return {
    id: Date.now() + 1,
    type: 'ai',
    content: `I've analyzed your request about "${userPrompt}" for the ${industryObj?.label} industry.

I can help you create:
• Risk Assessments & Safety Plans
• Work Permits & Procedures
• Training Materials & Checklists
• Emergency Response Documents

Available Features:
• Filled Documents (complete with content)
• Empty Templates (fields for manual completion)
• Professional PDF Generation
• Safety Exams & Certificates

Would you like me to generate a specific document or provide more guidance?`,
    timestamp: new Date(),
    personality: aiPersonality,
    industry: industry,
    likes: 0,
    saved: 0
  };
};

export const getCredentialLevel = (score) => {
  if (score >= 90) return { level: 'Platinum', color: '#722ed1', ceus: 4.0, validity: '24 months' };
  if (score >= 85) return { level: 'Gold', color: '#fa8c16', ceus: 3.5, validity: '18 months' };
  if (score >= 80) return { level: 'Silver', color: '#8c8c8c', ceus: 3.0, validity: '12 months' };
  if (score >= 75) return { level: 'Bronze', color: '#d48806', ceus: 2.5, validity: '12 months' };
  if (score >= 70) return { level: 'Competent', color: '#389e0d', ceus: 2.0, validity: '12 months' };
  return { level: 'Certified', color: '#1890ff', ceus: 0, validity: 'N/A' };
};

// Professional HTML template for documents
export const getProfessionalHtmlTemplate = (content, documentType, industry, companyInfo, generationMode, industriesList) => {
  const industryColors = {
    oil_gas: '#ff4d4f', mining: '#8c8c8c', healthcare: '#52c41a',
    construction: '#faad14', manufacturing: '#1890ff', chemical: '#d48806',
    pharmaceutical: '#389e0d', power_generation: '#722ed1', aviation: '#1890ff',
    transportation: '#13c2c2', general: '#fa8c16', maritime: '#13c2c2',
    education: '#52c41a'
  };
  
  const primaryColor = industryColors[industry] || '#1890ff';
  const isTemplate = generationMode === 'template';
  const industryObj = industriesList?.find(i => i.value === industry);
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${documentType} - ${industry}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f8f9fa;
      padding: 30px;
    }
    .document-container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
      color: white;
      padding: 30px 40px;
      position: relative;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .header .subtitle {
      font-size: 14px;
      opacity: 0.9;
    }
    .company-badge {
      position: absolute;
      top: 30px;
      right: 40px;
      text-align: right;
    }
    .company-badge img {
      max-height: 60px;
      max-width: 200px;
    }
    .content {
      padding: 40px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-item .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-item .value {
      font-size: 16px;
      font-weight: 600;
      color: ${primaryColor};
      margin-top: 4px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: ${primaryColor};
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid ${primaryColor}30;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background: ${primaryColor};
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .risk-high { background: #ffebee; color: #c62828; padding: 4px 8px; border-radius: 4px; font-weight: 600; }
    .risk-medium { background: #fff3e0; color: #f57c00; padding: 4px 8px; border-radius: 4px; font-weight: 600; }
    .risk-low { background: #e8f5e9; color: #388e3c; padding: 4px 8px; border-radius: 4px; font-weight: 600; }
    .checkbox-item {
      display: flex;
      align-items: center;
      margin: 8px 0;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .checkbox-item .check {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      border: 2px solid ${primaryColor};
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: ${primaryColor};
      font-weight: bold;
    }
    .checkbox-item.filled .check {
      background: ${primaryColor};
      color: white;
    }
    .signature-section {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
    }
    .signature-line {
      border-top: 1px solid #666;
      width: 200px;
      margin-top: 40px;
      padding-top: 8px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer {
      margin-top: 40px;
      padding: 20px 40px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    ${isTemplate ? `
      .field-placeholder {
        background: #f0f0f0;
        border: 2px dashed #ccc;
        padding: 8px 12px;
        border-radius: 4px;
        color: #999;
        font-style: italic;
        display: inline-block;
        min-width: 200px;
      }
    ` : ''}
  </style>
</head>
<body>
  <div class="document-container">
    <div class="header">
      <h1>${documentType}</h1>
      <div class="subtitle">${industry.toUpperCase().replace('_', ' ')} • ${isTemplate ? 'EMPTY TEMPLATE' : 'FILLED DOCUMENT'}</div>
      ${companyInfo?.logo ? `<div class="company-badge"><img src="${companyInfo.logo}" alt="${companyInfo.companyName}"></div>` : ''}
    </div>
    
    <div class="content">
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Document ID</span>
          <span class="value">${documentType.toUpperCase().replace(' ', '_')}-${Date.now()}</span>
        </div>
        <div class="info-item">
          <span class="label">Generated</span>
          <span class="value">${new Date().toLocaleDateString()}</span>
        </div>
        <div class="info-item">
          <span class="label">Industry</span>
          <span class="value">${industry.replace('_', ' ').toUpperCase()}</span>
        </div>
        <div class="info-item">
          <span class="label">Risk Level</span>
          <span class="value">${industryObj?.risk_level || 'MEDIUM'}</span>
        </div>
      </div>
      
      ${content}
      
      <div class="signature-section">
        <div class="signature-line">Prepared By</div>
        <div class="signature-line">Reviewed By</div>
        <div class="signature-line">Approved By</div>
      </div>
    </div>
    
    <div class="footer">
      <p>Generated by SafetyTrack Pro • ${new Date().toLocaleString()}</p>
      <p style="font-size: 10px; margin-top: 8px;">This document is electronically generated and valid without signature</p>
    </div>
  </div>
</body>
</html>`;
};

// ============= EXPORT ALL =============
export default {
  FEATURE_PLAN_REQUIREMENTS,
  PLAN_PERMISSIONS,
  industries,
  AVAILABLE_TEMPLATES,
  personalityOptions,
  generationModeOptions,
  historyFilterModeOptions,
  examTopics,
  examDifficulties,
  certificateCourses,
  documentTypes,
  getIndustryIcon,
  getPlanFeatures,
  checkDocumentPermission,
  getBackendTemplateId,
  getCustomSectionsForDocument,
  generateLocalAIResponse,
  getCredentialLevel,
  getProfessionalHtmlTemplate,
  ExperimentFilled,
  MedicineBoxFilled,
  ToolFilled,
  ApartmentOutlined,
  SliderOutlined,
  AudioOutlined,
  MailOutlinedIcon
};