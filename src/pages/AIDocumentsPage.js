// src/pages/AIDocumentsPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Row,
  Checkbox,
  Col,
  Card,
  Input,
  Button,
  Select,
  List,
  Tag,
  Space,
  Modal,
  Upload,
  Form,
  Switch,
  Divider,
  Avatar,
  Tabs,
  message,
  Statistic,
  Tooltip,
  Badge,
  Drawer,
  Radio,
  Slider,
  Typography,
  FloatButton,
  Popconfirm,
  Alert,
  Collapse
} from 'antd';
import {
  FileTextOutlined,
  RobotOutlined,
  DownloadOutlined,
  CopyOutlined,
  HistoryOutlined,
  UploadOutlined,
  BuildOutlined,
  GlobalOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  WechatOutlined,
  SendOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  SyncOutlined,
  EditOutlined,
  FilterOutlined,
  EyeOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  LockOutlined,
  ExpandOutlined,
  CompressOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import './AIDocumentsPage.css';
import AIService from '../services/GeneralAIService';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';
import { apiPost, apiGet } from '../services/api';
import deepSeekService from '../services/DeepSeekService';
import PDFEditor from '../pages/PDFEditor';
import aiStorageService from '../services/aiStorageService';
import SendToDocumentControl, { AutoAddSwitch, getAutoAdd, importGeneratedDocument } from '../components/submissions/SendToDocumentControl';
import AIExamCertificate from './AIExamCertificate';
import {
  PLAN_PERMISSIONS,
  industries,
  personalityOptions,
  generationModeOptions,
  getPlanFeatures,
  checkDocumentPermission,
  getBackendTemplateId,
  getCustomSectionsForDocument,
  generateLocalAIResponse,
  getProfessionalHtmlTemplate
} from './AIDocumentsUtils';
import { BACKEND_TEMPLATE_IDS, DOC_BACKEND_ALIASES, BACKEND_ONLY_DOCS } from './backendTemplateRegistry';

export const documentTypes = {
  all: [
    // ========================================
    // FREE PLAN DOCUMENTS (15)
    // ========================================
    { 
      value: 'risk_assessment', 
      label: 'Risk Assessment', 
      icon: '📊', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#d4380d', 
      description: 'Comprehensive risk evaluation and control planning', 
      estimated_time: '25-35 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'construction_get_risk_assessments_structural_work'
    },
    { 
      value: 'checklist', 
      label: 'Safety Checklist', 
      icon: '✅', 
      complexity: 'low', 
      category: 'inspections', 
      color: '#08979c', 
      description: 'Systematic workplace inspection and verification tool', 
      estimated_time: '10-15 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'inspectionmonitoring_get_inspection_templates_daily_safety_inspection'
    },
    { 
      value: 'incident_report', 
      label: 'Incident Report', 
      icon: '📝', 
      complexity: 'medium', 
      category: 'reports', 
      color: '#cf1322', 
      description: 'Documentation and analysis of safety incidents', 
      estimated_time: '15-25 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'incidentmanagement_get_incident_templates_incident_report_form'
    },
    { 
      value: 'training_material', 
      label: 'Training Material', 
      icon: '🎓', 
      complexity: 'medium', 
      category: 'training', 
      color: '#531dab', 
      description: 'Safety training content and competency verification', 
      estimated_time: '25-40 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'generalsafetydocuments_get_templates_training_material'
    },
    { 
      value: 'fire_safety_plan', 
      label: 'Fire Safety Plan', 
      icon: '🧯', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#d4380d', 
      description: 'Comprehensive fire prevention and response planning', 
      estimated_time: '25-35 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'emergencyresponse_get_emergency_templates_fire_emergency_plan'
    },
    { 
      value: 'general_inspection', 
      label: 'General Inspection', 
      icon: '🔍', 
      complexity: 'low', 
      category: 'inspections', 
      color: '#08979c', 
      description: 'General workplace safety inspection checklist', 
      estimated_time: '10-15 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'inspectionmonitoring_get_inspection_templates_workplace_inspection_report'
    },
    { 
      value: 'toolbox_talk_record', 
      label: 'Toolbox Talk Record', 
      icon: '🛠️', 
      complexity: 'low', 
      category: 'training', 
      color: '#fa8c16', 
      description: 'Toolbox talk attendance and topic record', 
      estimated_time: '10-15 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'operationalsafety_get_operational_templates_toolbox_talk_record'
    },
    { 
      value: 'safety_committee_minutes', 
      label: 'Safety Committee Minutes', 
      icon: '📝', 
      complexity: 'low', 
      category: 'meetings', 
      color: '#52c41a', 
      description: 'Safety committee meeting minutes template', 
      estimated_time: '10-15 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'safetymanagement_get_management_templates_safety_committee_minutes'
    },
    { 
      value: 'safety_policy_statement', 
      label: 'Safety Policy Statement', 
      icon: '📜', 
      complexity: 'medium', 
      category: 'policy', 
      color: '#1890ff', 
      description: 'Organizational safety policy and commitment', 
      estimated_time: '15-25 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'safetymanagement_get_management_templates_safety_policy_statement'
    },
    { 
      value: 'ppe_assessment', 
      label: 'PPE Assessment', 
      icon: '🛡️', 
      complexity: 'low', 
      category: 'assessments', 
      color: '#faad14', 
      description: 'Personal Protective Equipment (PPE) needs assessment', 
      estimated_time: '15-25 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'ppe_get_ppe_templates_ppe_assessment'
    },
    { 
      value: 'emergency_contact_list', 
      label: 'Emergency Contact List', 
      icon: '📞', 
      complexity: 'low', 
      category: 'plans', 
      color: '#d46b08', 
      description: 'Emergency contact directory and response protocol', 
      estimated_time: '10-15 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'emergencyresponse_get_emergency_templates_emergency_contact_list'
    },
    { 
      value: 'safety_orientation_checklist', 
      label: 'Safety Orientation Checklist', 
      icon: '📋', 
      complexity: 'low', 
      category: 'training', 
      color: '#531dab', 
      description: 'New employee safety orientation and training checklist', 
      estimated_time: '15-20 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'training_get_training_templates_safety_orientation_checklist'
    },
    { 
      value: 'workplace_hazard_report', 
      label: 'Workplace Hazard Report', 
      icon: '⚠️', 
      complexity: 'medium', 
      category: 'reports', 
      color: '#cf1322', 
      description: 'Report and document workplace hazards and risks', 
      estimated_time: '15-25 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'incidentmanagement_get_incident_templates_hazard_report'
    },
    { 
      value: 'safety_meeting_agenda', 
      label: 'Safety Meeting Agenda', 
      icon: '📅', 
      complexity: 'low', 
      category: 'meetings', 
      color: '#52c41a', 
      description: 'Safety meeting agenda and discussion template', 
      estimated_time: '10-15 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'safetymanagement_get_management_templates_safety_meeting_agenda'
    },
    { 
      value: 'inspection_report', 
      label: 'Inspection Report', 
      icon: '📄', 
      complexity: 'medium', 
      category: 'inspections', 
      color: '#08979c', 
      description: 'Detailed inspection report and findings documentation', 
      estimated_time: '20-30 min', 
      plan_required: 'free', 
      industries: ['all'],
      template_id: 'inspectionmonitoring_get_inspection_templates_inspection_report'
    },

    // ========================================
    // BASIC PLAN DOCUMENTS (10)
    // ========================================
    { 
      value: 'sop', 
      label: 'Safe Operating Procedure', 
      icon: '📋', 
      complexity: 'high', 
      category: 'procedures', 
      color: '#096dd9', 
      description: 'Step-by-step safe work instructions and precautions', 
      estimated_time: '30-45 min', 
      plan_required: 'basic', 
      industries: ['all'],
      template_id: 'generalsafetydocuments_get_templates_sop'
    },
    { 
      value: 'emergency_response_plan', 
      label: 'Emergency Response Plan', 
      icon: '🚨', 
      complexity: 'high', 
      category: 'plans', 
      color: '#d46b08', 
      description: 'Comprehensive emergency preparedness and response planning', 
      estimated_time: '35-50 min', 
      plan_required: 'basic', 
      industries: ['all'],
      template_id: 'emergencyresponse_get_emergency_templates_emergency_response_plan'
    },
    { 
      value: 'job_safety_analysis', 
      label: 'Job Safety Analysis (JSA)', 
      icon: '🔧', 
      complexity: 'high', 
      category: 'procedures', 
      color: '#1890ff', 
      description: 'Task-specific hazard analysis and control', 
      estimated_time: '20-30 min', 
      plan_required: 'basic', 
      industries: ['all'],
      template_id: 'operationalsafety_get_operational_templates_job_safety_analysis'
    },
    { 
      value: 'environmental_assessment', 
      label: 'Environmental Assessment', 
      icon: '🌿', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#52c41a', 
      description: 'Environmental impact assessment and compliance review', 
      estimated_time: '30-45 min', 
      plan_required: 'basic', 
      industries: ['all'],
      template_id: 'environmental_get_env_templates_environmental_assessment'
    },
    { 
      value: 'quality_management_plan', 
      label: 'Quality Management Plan', 
      icon: '📊', 
      complexity: 'high', 
      category: 'plans', 
      color: '#722ed1', 
      description: 'Quality management and assurance planning', 
      estimated_time: '35-50 min', 
      plan_required: 'basic', 
      industries: ['all'],
      template_id: 'quality_get_quality_templates_quality_management_plan'
    },
    { 
      value: 'safety_training_plan', 
      label: 'Safety Training Plan', 
      icon: '📚', 
      complexity: 'medium', 
      category: 'training', 
      color: '#531dab', 
      description: 'Comprehensive safety training program and plan', 
      estimated_time: '25-40 min', 
      plan_required: 'basic', 
      industries: ['all'],
      template_id: 'training_get_training_templates_safety_training_plan'
    },
    { 
      value: 'hazard_communication_plan', 
      label: 'Hazard Communication Plan', 
      icon: '📢', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#d46b08', 
      description: 'Hazard communication and right-to-know program', 
      estimated_time: '20-30 min', 
      plan_required: 'basic', 
      industries: ['all'],
      template_id: 'compliance_get_compliance_templates_hazard_communication_plan'
    },
    { 
      value: 'workplace_safety_policy', 
      label: 'Workplace Safety Policy', 
      icon: '📜', 
      complexity: 'medium', 
      category: 'policy', 
      color: '#1890ff', 
      description: 'Comprehensive workplace safety policy and procedures', 
      estimated_time: '20-30 min', 
      plan_required: 'basic', 
      industries: ['all'],
      template_id: 'safetymanagement_get_management_templates_workplace_safety_policy'
    },
    { 
      value: 'incident_investigation', 
      label: 'Incident Investigation Report', 
      icon: '🔍', 
      complexity: 'high', 
      category: 'reports', 
      color: '#cf1322', 
      description: 'Detailed incident investigation and root cause analysis', 
      estimated_time: '30-45 min', 
      plan_required: 'basic', 
      industries: ['all'],
      template_id: 'incidentmanagement_get_incident_templates_incident_investigation'
    },
    { 
      value: 'safety_audit_checklist', 
      label: 'Safety Audit Checklist', 
      icon: '✅', 
      complexity: 'medium', 
      category: 'audits', 
      color: '#eb2f96', 
      description: 'Comprehensive safety audit and compliance checklist', 
      estimated_time: '25-35 min', 
      plan_required: 'basic', 
      industries: ['all'],
      template_id: 'audit_get_audit_templates_safety_audit_checklist'
    },

    // ========================================
    // PRO PLAN DOCUMENTS (15)
    // ========================================
    { 
      value: 'work_permit', 
      label: 'General Work Permit', 
      icon: '📝', 
      complexity: 'medium', 
      category: 'permits', 
      color: '#389e0d', 
      description: 'General work authorization permit', 
      estimated_time: '10-15 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'general_get_permit_templates_safety_hold'
    },
    { 
      value: 'hot_work_permit', 
      label: 'Hot Work Permit', 
      icon: '🔥', 
      complexity: 'high', 
      category: 'permits', 
      color: '#f5222d', 
      description: 'Permit for welding, cutting, and grinding', 
      estimated_time: '15-20 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'general_get_permit_templates_hot_work_general'
    },
    { 
      value: 'confined_space_entry', 
      label: 'Confined Space Entry Permit', 
      icon: '🚪', 
      complexity: 'high', 
      category: 'permits', 
      color: '#722ed1', 
      description: 'Entry permit for confined spaces', 
      estimated_time: '20-25 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'general_get_permit_templates_confined_space_general'
    },
    { 
      value: 'audit_report', 
      label: 'Safety Audit Report', 
      icon: '🔎', 
      complexity: 'high', 
      category: 'reports', 
      color: '#eb2f96', 
      description: 'Comprehensive safety management system audit', 
      estimated_time: '40-60 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'generalsafetydocuments_get_templates_audit_report'
    },
    { 
      value: 'business_continuity_plan', 
      label: 'Business Continuity Plan', 
      icon: '🔄', 
      complexity: 'high', 
      category: 'plans', 
      color: '#d46b08', 
      description: 'Business continuity and disaster recovery planning', 
      estimated_time: '35-50 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'generalsafetydocuments_get_templates_business_continuity_plan'
    },
    { 
      value: 'risk_management_plan', 
      label: 'Risk Management Plan', 
      icon: '📋', 
      complexity: 'high', 
      category: 'plans', 
      color: '#d46b08', 
      description: 'Comprehensive risk management and mitigation planning', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'riskmanagement_get_risk_templates_risk_management_plan'
    },
    { 
      value: 'safety_management_system', 
      label: 'Safety Management System', 
      icon: '🏛️', 
      complexity: 'high', 
      category: 'management', 
      color: '#722ed1', 
      description: 'Complete safety management system documentation', 
      estimated_time: '45-60 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'safetymanagement_get_management_templates_safety_management_system'
    },
    { 
      value: 'chemical_safety_assessment', 
      label: 'Chemical Safety Assessment', 
      icon: '🧪', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#faad14', 
      description: 'Chemical safety and hazard assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'chemicalsafety_get_chemical_templates_chemical_safety_assessment'
    },
    { 
      value: 'ergonomics_assessment', 
      label: 'Ergonomics Assessment', 
      icon: '💺', 
      complexity: 'medium', 
      category: 'assessments', 
      color: '#13c2c2', 
      description: 'Workplace ergonomics and comfort assessment', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'ergonomics_get_ergo_templates_ergonomics_assessment'
    },
    { 
      value: 'noise_exposure_assessment', 
      label: 'Noise Exposure Assessment', 
      icon: '🔊', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#faad14', 
      description: 'Workplace noise exposure monitoring and assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'noise_get_noise_templates_noise_exposure_assessment'
    },
    { 
      value: 'ventilation_assessment', 
      label: 'Ventilation Assessment', 
      icon: '🌬️', 
      complexity: 'medium', 
      category: 'assessments', 
      color: '#13c2c2', 
      description: 'Workplace ventilation and air quality assessment', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'ventilation_get_vent_templates_ventilation_assessment'
    },
    { 
      value: 'lighting_assessment', 
      label: 'Lighting Assessment', 
      icon: '💡', 
      complexity: 'low', 
      category: 'assessments', 
      color: '#faad14', 
      description: 'Workplace lighting quality and safety assessment', 
      estimated_time: '15-25 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'lighting_get_lighting_templates_lighting_assessment'
    },
    { 
      value: 'equipment_safety_checklist', 
      label: 'Equipment Safety Checklist', 
      icon: '🔧', 
      complexity: 'medium', 
      category: 'checklists', 
      color: '#08979c', 
      description: 'Equipment safety inspection and maintenance checklist', 
      estimated_time: '15-20 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'equipment_get_equipment_templates_equipment_safety_checklist'
    },
    { 
      value: 'environmental_management_plan', 
      label: 'Environmental Management Plan', 
      icon: '🌍', 
      complexity: 'high', 
      category: 'plans', 
      color: '#52c41a', 
      description: 'Environmental management and sustainability plan', 
      estimated_time: '35-50 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'environmental_get_env_templates_environmental_management_plan'
    },
    { 
      value: 'emergency_evacuation_plan', 
      label: 'Emergency Evacuation Plan', 
      icon: '🏃', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#d46b08', 
      description: 'Emergency evacuation routes and procedures', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['all'],
      template_id: 'emergencyresponse_get_emergency_templates_emergency_evacuation_plan'
    },

    // ========================================
    // CONSTRUCTION INDUSTRY DOCUMENTS (15)
    // ========================================
    { 
      value: 'construction_scaffold_inspection', 
      label: 'Scaffold Inspection Certificate', 
      icon: '🪜', 
      complexity: 'high', 
      category: 'certificates', 
      color: '#faad14', 
      description: 'Scaffold inspection and certification', 
      estimated_time: '15-25 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_construction_specialized_scaffold_inspection_certificate'
    },
    { 
      value: 'construction_trenching_excavation', 
      label: 'Trenching & Excavation Assessment', 
      icon: '⛏️', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#faad14', 
      description: 'Trenching and excavation risk assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_risk_assessments_trenching_excavation'
    },
    { 
      value: 'construction_structural_work', 
      label: 'Structural Work Risk Assessment', 
      icon: '🏗️', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#faad14', 
      description: 'Structural work risk assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_risk_assessments_structural_work'
    },
    { 
      value: 'construction_crane_operation', 
      label: 'Crane Operation Permit', 
      icon: '🏗️', 
      complexity: 'high', 
      category: 'permits', 
      color: '#f5222d', 
      description: 'Crane operation and lifting permit', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_construction_specialized_crane_operation_permit'
    },
    { 
      value: 'construction_electrical_safety', 
      label: 'Electrical Safety Assessment', 
      icon: '⚡', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#f5222d', 
      description: 'Construction site electrical safety assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_risk_assessments_electrical_safety'
    },
    { 
      value: 'construction_fall_protection', 
      label: 'Fall Protection Plan', 
      icon: '🪢', 
      complexity: 'high', 
      category: 'plans', 
      color: '#faad14', 
      description: 'Fall protection and working at height plan', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_construction_specialized_fall_protection_plan'
    },
    { 
      value: 'construction_demolition_work', 
      label: 'Demolition Work Assessment', 
      icon: '🏚️', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#cf1322', 
      description: 'Demolition work risk assessment and plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_risk_assessments_demolition_work'
    },
    { 
      value: 'construction_excavation_work', 
      label: 'Excavation Work Permit', 
      icon: '⛏️', 
      complexity: 'high', 
      category: 'permits', 
      color: '#faad14', 
      description: 'Excavation work permit and safety plan', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_construction_specialized_excavation_work_permit'
    },
    { 
      value: 'construction_roof_work', 
      label: 'Roof Work Safety Plan', 
      icon: '🏠', 
      complexity: 'high', 
      category: 'plans', 
      color: '#faad14', 
      description: 'Roof work safety and fall protection plan', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_construction_specialized_roof_work_safety_plan'
    },
    { 
      value: 'construction_concrete_work', 
      label: 'Concrete Work Assessment', 
      icon: '🧱', 
      complexity: 'medium', 
      category: 'assessments', 
      color: '#faad14', 
      description: 'Concrete work risk assessment and safety plan', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_risk_assessments_concrete_work'
    },
    { 
      value: 'construction_steel_erection', 
      label: 'Steel Erection Plan', 
      icon: '🏗️', 
      complexity: 'high', 
      category: 'plans', 
      color: '#096dd9', 
      description: 'Steel erection safety and erection plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_construction_specialized_steel_erection_plan'
    },
    { 
      value: 'construction_underground_work', 
      label: 'Underground Work Assessment', 
      icon: '🕳️', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#722ed1', 
      description: 'Underground construction risk assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_risk_assessments_underground_work'
    },
    { 
      value: 'construction_hoisting_work', 
      label: 'Hoisting Work Permit', 
      icon: '🏗️', 
      complexity: 'high', 
      category: 'permits', 
      color: '#f5222d', 
      description: 'Hoisting and rigging work permit', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_construction_specialized_hoisting_work_permit'
    },
    { 
      value: 'construction_painting_work', 
      label: 'Painting Work Safety Plan', 
      icon: '🎨', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#faad14', 
      description: 'Painting work safety and hazard control plan', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_construction_specialized_painting_work_safety_plan'
    },
    { 
      value: 'construction_welding_work', 
      label: 'Welding Work Permit', 
      icon: '⚡', 
      complexity: 'high', 
      category: 'permits', 
      color: '#f5222d', 
      description: 'Welding work permit and safety plan', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['construction'],
      template_id: 'construction_get_construction_specialized_welding_work_permit'
    },

    // ========================================
    // OIL & GAS INDUSTRY DOCUMENTS (12)
    // ========================================
    { 
      value: 'oilgas_drilling_operations', 
      label: 'Oil & Gas Drilling Operations', 
      icon: '🛢️', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#ff4d4f', 
      description: 'Drilling operations risk assessment and control', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_risk_assessments_drilling_operations'
    },
    { 
      value: 'oilgas_h2s_exposure', 
      label: 'H2S Exposure Risk Assessment', 
      icon: '☣️', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#ff4d4f', 
      description: 'Hydrogen sulfide exposure risk assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_risk_assessments_h2s_exposure'
    },
    { 
      value: 'oilgas_simops_plan', 
      label: 'SimOps Plan', 
      icon: '🔄', 
      complexity: 'high', 
      category: 'plans', 
      color: '#ff4d4f', 
      description: 'Simultaneous operations safety plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_oilgas_specialized_simops_plan'
    },
    { 
      value: 'oilgas_hazop_study', 
      label: 'HAZOP Study', 
      icon: '🔬', 
      complexity: 'high', 
      category: 'studies', 
      color: '#ff4d4f', 
      description: 'Hazard and Operability Study', 
      estimated_time: '45-60 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_oilgas_specialized_hazop_study'
    },
    { 
      value: 'oilgas_well_control', 
      label: 'Well Control Plan', 
      icon: '⛽', 
      complexity: 'high', 
      category: 'plans', 
      color: '#ff4d4f', 
      description: 'Well control and blowout prevention plan', 
      estimated_time: '35-50 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_oilgas_specialized_well_control_plan'
    },
    { 
      value: 'oilgas_pipeline_safety', 
      label: 'Pipeline Safety Assessment', 
      icon: '🔧', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#ff4d4f', 
      description: 'Pipeline safety and integrity assessment', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_risk_assessments_pipeline_safety'
    },
    { 
      value: 'oilgas_offshore_operations', 
      label: 'Offshore Operations Plan', 
      icon: '🌊', 
      complexity: 'high', 
      category: 'plans', 
      color: '#ff4d4f', 
      description: 'Offshore oil and gas operations safety plan', 
      estimated_time: '40-55 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_oilgas_specialized_offshore_operations_plan'
    },
    { 
      value: 'oilgas_refinery_safety', 
      label: 'Refinery Safety Assessment', 
      icon: '🏭', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#ff4d4f', 
      description: 'Refinery safety and hazard assessment', 
      estimated_time: '35-50 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_risk_assessments_refinery_safety'
    },
    { 
      value: 'oilgas_gas_processing', 
      label: 'Gas Processing Safety Plan', 
      icon: '💨', 
      complexity: 'high', 
      category: 'plans', 
      color: '#ff4d4f', 
      description: 'Gas processing facility safety plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_oilgas_specialized_gas_processing_safety_plan'
    },
    { 
      value: 'oilgas_well_servicing', 
      label: 'Well Servicing Permit', 
      icon: '⛽', 
      complexity: 'high', 
      category: 'permits', 
      color: '#ff4d4f', 
      description: 'Well servicing and workover permit', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_oilgas_specialized_well_servicing_permit'
    },
    { 
      value: 'oilgas_production_operations', 
      label: 'Production Operations Assessment', 
      icon: '🏗️', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#ff4d4f', 
      description: 'Production operations risk assessment', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_risk_assessments_production_operations'
    },
    { 
      value: 'oilgas_transportation_safety', 
      label: 'Transportation Safety Plan', 
      icon: '🚛', 
      complexity: 'high', 
      category: 'plans', 
      color: '#ff4d4f', 
      description: 'Oil and gas transportation safety plan', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['oil_gas'],
      template_id: 'oilgas_get_oilgas_specialized_transportation_safety_plan'
    },

    // ========================================
    // MANUFACTURING INDUSTRY DOCUMENTS (10)
    // ========================================
    { 
      value: 'manufacturing_lockout_tagout', 
      label: 'Lockout/Tagout Procedure', 
      icon: '🔒', 
      complexity: 'high', 
      category: 'procedures', 
      color: '#1890ff', 
      description: 'Lockout/tagout safety procedure', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['manufacturing'],
      template_id: 'manufacturing_get_risk_assessments_lockout_tagout'
    },
    { 
      value: 'manufacturing_machine_guarding', 
      label: 'Machine Guarding Assessment', 
      icon: '⚙️', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#1890ff', 
      description: 'Machine guarding risk assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['manufacturing'],
      template_id: 'manufacturing_get_risk_assessments_machine_guarding'
    },
    { 
      value: 'manufacturing_conveyor_safety', 
      label: 'Conveyor Safety Assessment', 
      icon: '📦', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#1890ff', 
      description: 'Conveyor system safety assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['manufacturing'],
      template_id: 'manufacturing_get_risk_assessments_conveyor_safety'
    },
    { 
      value: 'manufacturing_forklift_safety', 
      label: 'Forklift Safety Plan', 
      icon: '🏗️', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#1890ff', 
      description: 'Forklift operation safety plan', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['manufacturing'],
      template_id: 'manufacturing_get_manufacturing_specialized_forklift_safety_plan'
    },
    { 
      value: 'manufacturing_warehouse_safety', 
      label: 'Warehouse Safety Assessment', 
      icon: '🏪', 
      complexity: 'medium', 
      category: 'assessments', 
      color: '#1890ff', 
      description: 'Warehouse safety and risk assessment', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['manufacturing'],
      template_id: 'manufacturing_get_risk_assessments_warehouse_safety'
    },
    { 
      value: 'manufacturing_material_handling', 
      label: 'Material Handling Safety Plan', 
      icon: '📦', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#1890ff', 
      description: 'Material handling safety and ergonomics plan', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['manufacturing'],
      template_id: 'manufacturing_get_manufacturing_specialized_material_handling_safety_plan'
    },
    { 
      value: 'manufacturing_assembly_line', 
      label: 'Assembly Line Safety Assessment', 
      icon: '🔧', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#1890ff', 
      description: 'Assembly line safety and ergonomics assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['manufacturing'],
      template_id: 'manufacturing_get_risk_assessments_assembly_line_safety'
    },
    { 
      value: 'manufacturing_packaging_safety', 
      label: 'Packaging Safety Plan', 
      icon: '📦', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#1890ff', 
      description: 'Packaging operations safety plan', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['manufacturing'],
      template_id: 'manufacturing_get_manufacturing_specialized_packaging_safety_plan'
    },
    { 
      value: 'manufacturing_maintenance_safety', 
      label: 'Maintenance Safety Plan', 
      icon: '🔧', 
      complexity: 'high', 
      category: 'plans', 
      color: '#1890ff', 
      description: 'Maintenance operations safety plan', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['manufacturing'],
      template_id: 'manufacturing_get_manufacturing_specialized_maintenance_safety_plan'
    },
    { 
      value: 'manufacturing_quality_control', 
      label: 'Quality Control Safety Assessment', 
      icon: '✅', 
      complexity: 'medium', 
      category: 'assessments', 
      color: '#1890ff', 
      description: 'Quality control lab safety assessment', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['manufacturing'],
      template_id: 'manufacturing_get_risk_assessments_quality_control_safety'
    },

    // ========================================
    // HEALTHCARE INDUSTRY DOCUMENTS (10)
    // ========================================
    { 
      value: 'healthcare_infection_control', 
      label: 'Infection Control Audit', 
      icon: '🦠', 
      complexity: 'high', 
      category: 'audits', 
      color: '#52c41a', 
      description: 'Infection control audit and assessment', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['healthcare'],
      template_id: 'healthcare_get_healthcare_specialized_infection_control_audit'
    },
    { 
      value: 'healthcare_patient_safety', 
      label: 'Patient Safety Report', 
      icon: '🏥', 
      complexity: 'high', 
      category: 'reports', 
      color: '#52c41a', 
      description: 'Patient safety incident report', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['healthcare'],
      template_id: 'healthcare_get_healthcare_specialized_patient_safety_report'
    },
    { 
      value: 'healthcare_medical_waste', 
      label: 'Medical Waste Management Plan', 
      icon: '🗑️', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#52c41a', 
      description: 'Medical waste management and disposal plan', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['healthcare'],
      template_id: 'healthcare_get_healthcare_specialized_medical_waste_management_plan'
    },
    { 
      value: 'healthcare_lab_safety', 
      label: 'Lab Safety Assessment', 
      icon: '🔬', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#52c41a', 
      description: 'Medical laboratory safety assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['healthcare'],
      template_id: 'healthcare_get_risk_assessments_lab_safety'
    },
    { 
      value: 'healthcare_radiation_safety', 
      label: 'Radiation Safety Plan', 
      icon: '☢️', 
      complexity: 'high', 
      category: 'plans', 
      color: '#52c41a', 
      description: 'Radiation safety and protection plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['healthcare'],
      template_id: 'healthcare_get_healthcare_specialized_radiation_safety_plan'
    },
    { 
      value: 'healthcare_bloodborne_pathogens', 
      label: 'Bloodborne Pathogens Plan', 
      icon: '🩸', 
      complexity: 'high', 
      category: 'plans', 
      color: '#52c41a', 
      description: 'Bloodborne pathogens exposure control plan', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['healthcare'],
      template_id: 'healthcare_get_healthcare_specialized_bloodborne_pathogens_plan'
    },
    { 
      value: 'healthcare_surgical_safety', 
      label: 'Surgical Safety Checklist', 
      icon: '🔪', 
      complexity: 'high', 
      category: 'checklists', 
      color: '#52c41a', 
      description: 'Surgical safety and equipment checklist', 
      estimated_time: '15-25 min', 
      plan_required: 'pro', 
      industries: ['healthcare'],
      template_id: 'healthcare_get_healthcare_specialized_surgical_safety_checklist'
    },
    { 
      value: 'healthcare_emergency_services', 
      label: 'Emergency Services Plan', 
      icon: '🚑', 
      complexity: 'high', 
      category: 'plans', 
      color: '#52c41a', 
      description: 'Emergency services and response plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['healthcare'],
      template_id: 'healthcare_get_healthcare_specialized_emergency_services_plan'
    },
    { 
      value: 'healthcare_pharmacy_safety', 
      label: 'Pharmacy Safety Assessment', 
      icon: '💊', 
      complexity: 'medium', 
      category: 'assessments', 
      color: '#52c41a', 
      description: 'Pharmacy safety and risk assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['healthcare'],
      template_id: 'healthcare_get_risk_assessments_pharmacy_safety'
    },
    { 
      value: 'healthcare_patient_handling', 
      label: 'Patient Handling Safety Plan', 
      icon: '🛏️', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#52c41a', 
      description: 'Patient handling and mobility safety plan', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['healthcare'],
      template_id: 'healthcare_get_healthcare_specialized_patient_handling_safety_plan'
    },

    // ========================================
    // MINING INDUSTRY DOCUMENTS (8)
    // ========================================
    { 
      value: 'mining_underground_operations', 
      label: 'Underground Mining Operations', 
      icon: '⛏️', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#d46b08', 
      description: 'Underground mining risk assessment', 
      estimated_time: '35-50 min', 
      plan_required: 'pro', 
      industries: ['mining'],
      template_id: 'mining_get_risk_assessments_underground_operations'
    },
    { 
      value: 'mining_surface_operations', 
      label: 'Surface Mining Operations', 
      icon: '🏗️', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#d46b08', 
      description: 'Surface mining operations risk assessment', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['mining'],
      template_id: 'mining_get_risk_assessments_surface_operations'
    },
    { 
      value: 'mining_ventilation_plan', 
      label: 'Mine Ventilation Plan', 
      icon: '🌬️', 
      complexity: 'high', 
      category: 'plans', 
      color: '#d46b08', 
      description: 'Mine ventilation and air quality plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['mining'],
      template_id: 'mining_get_mining_specialized_ventilation_plan'
    },
    { 
      value: 'mining_blasting_operations', 
      label: 'Blasting Operations Plan', 
      icon: '💥', 
      complexity: 'high', 
      category: 'plans', 
      color: '#d46b08', 
      description: 'Blasting operations safety plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['mining'],
      template_id: 'mining_get_mining_specialized_blasting_operations_plan'
    },
    { 
      value: 'mining_shaft_safety', 
      label: 'Shaft Safety Assessment', 
      icon: '🕳️', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#d46b08', 
      description: 'Mine shaft safety assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['mining'],
      template_id: 'mining_get_risk_assessments_shaft_safety'
    },
    { 
      value: 'mining_tailings_management', 
      label: 'Tailings Management Plan', 
      icon: '🏗️', 
      complexity: 'high', 
      category: 'plans', 
      color: '#d46b08', 
      description: 'Tailings management and safety plan', 
      estimated_time: '35-50 min', 
      plan_required: 'pro', 
      industries: ['mining'],
      template_id: 'mining_get_mining_specialized_tailings_management_plan'
    },
    { 
      value: 'mining_emergency_response', 
      label: 'Mine Emergency Response Plan', 
      icon: '🚨', 
      complexity: 'high', 
      category: 'plans', 
      color: '#d46b08', 
      description: 'Mine emergency response and rescue plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['mining'],
      template_id: 'mining_get_mining_specialized_emergency_response_plan'
    },
    { 
      value: 'mining_equipment_safety', 
      label: 'Mining Equipment Safety', 
      icon: '🔧', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#d46b08', 
      description: 'Mining equipment safety assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['mining'],
      template_id: 'mining_get_risk_assessments_equipment_safety'
    },

    // ========================================
    // AGRICULTURE INDUSTRY DOCUMENTS (8)
    // ========================================
    { 
      value: 'agriculture_pesticide_safety', 
      label: 'Pesticide Safety Plan', 
      icon: '🧪', 
      complexity: 'high', 
      category: 'plans', 
      color: '#52c41a', 
      description: 'Pesticide handling and safety plan', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['agriculture'],
      template_id: 'agriculture_get_agriculture_specialized_pesticide_safety_plan'
    },
    { 
      value: 'agriculture_machinery_safety', 
      label: 'Machinery Safety Assessment', 
      icon: '🚜', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#52c41a', 
      description: 'Agricultural machinery safety assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['agriculture'],
      template_id: 'agriculture_get_risk_assessments_machinery_safety'
    },
    { 
      value: 'agriculture_livestock_safety', 
      label: 'Livestock Safety Plan', 
      icon: '🐄', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#52c41a', 
      description: 'Livestock handling safety plan', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['agriculture'],
      template_id: 'agriculture_get_agriculture_specialized_livestock_safety_plan'
    },
    { 
      value: 'agriculture_grain_handling', 
      label: 'Grain Handling Safety', 
      icon: '🌾', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#52c41a', 
      description: 'Grain handling and storage safety', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['agriculture'],
      template_id: 'agriculture_get_risk_assessments_grain_handling_safety'
    },
    { 
      value: 'agriculture_irrigation_safety', 
      label: 'Irrigation Safety Plan', 
      icon: '💧', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#52c41a', 
      description: 'Irrigation system safety plan', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['agriculture'],
      template_id: 'agriculture_get_agriculture_specialized_irrigation_safety_plan'
    },
    { 
      value: 'agriculture_harvesting_safety', 
      label: 'Harvesting Safety Assessment', 
      icon: '🌾', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#52c41a', 
      description: 'Harvesting operations safety assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['agriculture'],
      template_id: 'agriculture_get_risk_assessments_harvesting_safety'
    },
    { 
      value: 'agriculture_chemical_storage', 
      label: 'Chemical Storage Safety Plan', 
      icon: '🧪', 
      complexity: 'high', 
      category: 'plans', 
      color: '#52c41a', 
      description: 'Agricultural chemical storage safety plan', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['agriculture'],
      template_id: 'agriculture_get_agriculture_specialized_chemical_storage_safety_plan'
    },
    { 
      value: 'agriculture_barn_safety', 
      label: 'Barn Safety Assessment', 
      icon: '🏠', 
      complexity: 'medium', 
      category: 'assessments', 
      color: '#52c41a', 
      description: 'Barn and stable safety assessment', 
      estimated_time: '20-30 min', 
      plan_required: 'pro', 
      industries: ['agriculture'],
      template_id: 'agriculture_get_risk_assessments_barn_safety'
    },

    // ========================================
    // AVIATION INDUSTRY DOCUMENTS (6)
    // ========================================
    { 
      value: 'aviation_ground_safety', 
      label: 'Ground Safety Plan', 
      icon: '✈️', 
      complexity: 'high', 
      category: 'plans', 
      color: '#1890ff', 
      description: 'Aviation ground safety and operations plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['aviation'],
      template_id: 'aviation_get_aviation_specialized_ground_safety_plan'
    },
    { 
      value: 'aviation_fuel_safety', 
      label: 'Fuel Safety Assessment', 
      icon: '⛽', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#1890ff', 
      description: 'Aviation fuel handling safety assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['aviation'],
      template_id: 'aviation_get_risk_assessments_fuel_safety'
    },
    { 
      value: 'aviation_hangar_safety', 
      label: 'Hangar Safety Plan', 
      icon: '🏗️', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#1890ff', 
      description: 'Aircraft hangar safety plan', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['aviation'],
      template_id: 'aviation_get_aviation_specialized_hangar_safety_plan'
    },
    { 
      value: 'aviation_emergency_response', 
      label: 'Aviation Emergency Plan', 
      icon: '🚨', 
      complexity: 'high', 
      category: 'plans', 
      color: '#1890ff', 
      description: 'Aviation emergency response plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['aviation'],
      template_id: 'aviation_get_aviation_specialized_emergency_response_plan'
    },
    { 
      value: 'aviation_maintenance_safety', 
      label: 'Maintenance Safety Assessment', 
      icon: '🔧', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#1890ff', 
      description: 'Aircraft maintenance safety assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['aviation'],
      template_id: 'aviation_get_risk_assessments_maintenance_safety'
    },
    { 
      value: 'aviation_security_plan', 
      label: 'Aviation Security Plan', 
      icon: '🔒', 
      complexity: 'high', 
      category: 'plans', 
      color: '#1890ff', 
      description: 'Aviation security and access control plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['aviation'],
      template_id: 'aviation_get_aviation_specialized_security_plan'
    },

    // ========================================
    // MARITIME INDUSTRY DOCUMENTS (6)
    // ========================================
    { 
      value: 'maritime_vessel_safety', 
      label: 'Vessel Safety Assessment', 
      icon: '🚢', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#13c2c2', 
      description: 'Vessel safety and operations assessment', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['maritime'],
      template_id: 'maritime_get_risk_assessments_vessel_safety'
    },
    { 
      value: 'maritime_port_safety', 
      label: 'Port Safety Plan', 
      icon: '⚓', 
      complexity: 'high', 
      category: 'plans', 
      color: '#13c2c2', 
      description: 'Port and harbor safety plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['maritime'],
      template_id: 'maritime_get_maritime_specialized_port_safety_plan'
    },
    { 
      value: 'maritime_cargo_handling', 
      label: 'Cargo Handling Safety', 
      icon: '📦', 
      complexity: 'high', 
      category: 'assessments', 
      color: '#13c2c2', 
      description: 'Maritime cargo handling safety assessment', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['maritime'],
      template_id: 'maritime_get_risk_assessments_cargo_handling_safety'
    },
    { 
      value: 'maritime_emergency_response', 
      label: 'Maritime Emergency Plan', 
      icon: '🚨', 
      complexity: 'high', 
      category: 'plans', 
      color: '#13c2c2', 
      description: 'Maritime emergency response plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['maritime'],
      template_id: 'maritime_get_maritime_specialized_emergency_response_plan'
    },
    { 
      value: 'maritime_environmental_safety', 
      label: 'Environmental Safety Plan', 
      icon: '🌊', 
      complexity: 'high', 
      category: 'plans', 
      color: '#13c2c2', 
      description: 'Maritime environmental safety plan', 
      estimated_time: '30-45 min', 
      plan_required: 'pro', 
      industries: ['maritime'],
      template_id: 'maritime_get_maritime_specialized_environmental_safety_plan'
    },
  
    { 
      value: 'maritime_crew_safety', 
      label: 'Crew Safety Plan', 
      icon: '👨‍✈️', 
      complexity: 'medium', 
      category: 'plans', 
      color: '#13c2c2', 
      description: 'Maritime crew safety and training plan', 
      estimated_time: '25-35 min', 
      plan_required: 'pro', 
      industries: ['maritime'],
      template_id: 'maritime_get_maritime_specialized_crew_safety_plan'
    }
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
    incidents: { label: 'Incident Management', icon: '⚠️', color: '#cf1322' },
    monitoring: { label: 'Monitoring', icon: '📏', color: '#13c2c2' },
    health: { label: 'Health & Hygiene', icon: '🏥', color: '#52c41a' },
    certificates: { label: 'Certificates', icon: '🏆', color: '#722ed1' },
    records: { label: 'Records', icon: '📚', color: '#8c8c8c' },
    studies: { label: 'Studies', icon: '🔬', color: '#722ed1' },
    policy: { label: 'Policy', icon: '📜', color: '#1890ff' },
    audits: { label: 'Audits', icon: '🔍', color: '#722ed1' },
    meetings: { label: 'Meetings', icon: '👥', color: '#52c41a' },
    analysis: { label: 'Analysis', icon: '📊', color: '#722ed1' },
    management: { label: 'Management', icon: '👔', color: '#722ed1' },
    checklists: { label: 'Checklists', icon: '✅', color: '#08979c' }
  }
};

// ============= BACKEND AVAILABILITY =============
// Every document keeps its place in the list above, but it is only OFFERED to users when a matching
// template really exists on the server (see backendTemplateRegistry.js). Documents without a server
// template stay in the code (backend_available: false) until the template is created.
const verifiedTemplateId = (doc) => {
  const candidates = [DOC_BACKEND_ALIASES[doc.value], doc.template_id];
  return candidates.find(id => id && BACKEND_TEMPLATE_IDS.has(id)) || null;
};

documentTypes.all = [...documentTypes.all, ...BACKEND_ONLY_DOCS].map(doc => {
  const serverTemplateId = verifiedTemplateId(doc);
  return {
    ...doc,
    server_template_id: serverTemplateId,
    backend_available: Boolean(serverTemplateId)
  };
});


const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Panel } = Collapse;

// ============= INDUSTRIES =============
// Agriculture has documents in the list above but was missing from the utils industry list,
// so those documents could never be reached. It is added here only when it is not already defined.
const AGRICULTURE_INDUSTRY = {
  value: 'agriculture',
  label: 'Agriculture',
  icon: '🚜',
  color: '#52c41a',
  risk_level: '🟡 MEDIUM RISK',
  standards: [
    { value: 'osha_1928', label: 'OSHA 1928 - Agricultural Operations', level: 'high' },
    { value: 'epa_wps', label: 'EPA Worker Protection Standard', level: 'high' }
  ]
};

const industryOptions = industries.some(ind => ind.value === 'agriculture')
  ? industries
  : [
      ...industries.filter(ind => ind.value !== 'general'),
      AGRICULTURE_INDUSTRY,
      ...industries.filter(ind => ind.value === 'general')
    ];

// ============= INDUSTRY -> DOCUMENT AVAILABILITY (strict) =============
// A document is shown when:
//   - it is universal (its industries list contains 'all'), or
//   - its industries list contains the selected industry.
// With "General Industry" (or nothing) selected, only the universal documents are shown.
const isUniversalDoc = (doc) => !doc.industries || doc.industries.includes('all');

const docMatchesIndustry = (doc, industry) => {
  if (isUniversalDoc(doc)) return true;
  if (!industry || industry === 'general') return false;
  return doc.industries.includes(industry);
};

// Only documents that exist on the server are ever offered.
const availableDocs = documentTypes.all.filter(doc => doc.backend_available);

const getDocsForIndustry = (industry) =>
  availableDocs.filter(doc => docMatchesIndustry(doc, industry));

const countSpecificDocs = (industry) =>
  availableDocs.filter(doc => !isUniversalDoc(doc) && doc.industries.includes(industry)).length;

// ============= TEMPLATE ID RESOLUTION =============
// Returns a template ID that is confirmed to exist on the server, or null. There is no guessing:
// the generic "<industry>_<document>" value that getBackendTemplateId() returns for unknown
// documents never exists on the server, so it is only used when the registry confirms it.
const resolveTemplateId = (documentTypeValue, industry) => {
  const doc = documentTypes.all.find(d => d.value === documentTypeValue);
  if (doc?.server_template_id) return doc.server_template_id;
  const mapped = getBackendTemplateId(documentTypeValue, industry);
  return BACKEND_TEMPLATE_IDS.has(mapped) ? mapped : null;
};

// Local chat fallback without the exam/certificate line from the utils text
const buildFallbackAIResponse = (userPrompt, industry, personality) => {
  const response = generateLocalAIResponse(userPrompt, industry, industryOptions, personality);
  return {
    ...response,
    content: String(response.content || '').replace(/\n?•\s*Safety Exams & Certificates/g, '')
  };
};

// ============= DOWNLOAD + HISTORY HELPERS =============
// html2pdf is loaded on demand, so downloads work without a <script> tag in index.html.
const HTML2PDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
let html2pdfLoading = null;
const ensureHtml2Pdf = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.html2pdf) return Promise.resolve(true);
  if (!html2pdfLoading) {
    html2pdfLoading = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = HTML2PDF_URL;
      script.async = true;
      script.onload = () => resolve(Boolean(window.html2pdf));
      script.onerror = () => { html2pdfLoading = null; resolve(false); };
      document.head.appendChild(script);
    });
  }
  return html2pdfLoading;
};

const toFileName = (title, fallback) =>
  `${String(title || fallback).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;

// Last-resort download (a real file, no print dialog) if the PDF engine cannot be loaded.
const downloadHtmlFile = (html, baseName) => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${baseName}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

const getDocHtml = (doc) => doc?.htmlContent || doc?.html_content || doc?.content || '';

// Documents are always backed up on this device, so the history survives even when the server save fails.
const LOCAL_DOCS_KEY = 'ai_docs_history_v2';
const readLocalDocs = () => {
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_DOCS_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
};
const writeLocalDocs = (docs) => {
  let list = docs.slice(0, 30).map(({ _savedToDb, _saveFailed, ...rest }) => rest);
  while (list.length > 0) {
    try {
      localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      list = list.slice(0, -1); // storage full: drop the oldest and retry
    }
  }
  try { localStorage.removeItem(LOCAL_DOCS_KEY); } catch (e) { /* ignore */ }
  return false;
};
// Merge lists of documents by id. The first list sets the order; missing content is filled from the others.
const mergeDocs = (...lists) => {
  const byId = new Map();
  lists.flat().forEach((doc) => {
    if (!doc || !doc.id) return;
    const prev = byId.get(doc.id);
    if (!prev) { byId.set(doc.id, doc); return; }
    byId.set(doc.id, { ...doc, ...prev, htmlContent: getDocHtml(prev) || getDocHtml(doc) || undefined });
  });
  return [...byId.values()];
};

const prettyIndustry = (value) => String(value || 'general').replace(/_/g, ' ');

// Hints shown under "Additional Context" depending on the selected document category
const CONTEXT_HINTS = {
  permits: 'Example: work location, description of the task, start/end time, number of workers, isolations or gas tests needed...',
  assessments: 'Example: the task or area being assessed, who could be harmed, hazards you already know about, existing controls...',
  procedures: 'Example: the task, equipment used, steps that worry you, competence or training required...',
  plans: 'Example: site or facility name, scope, key risks, responsible persons, local regulations to follow...',
  reports: 'Example: what happened, when and where, who was involved, immediate actions taken...',
  inspections: 'Example: area or equipment to inspect, how often, standards the inspection must follow...',
  checklists: 'Example: equipment or area, inspection frequency, standards to follow...',
  training: 'Example: audience, job roles, topics that must be covered, duration...',
  audits: 'Example: audit scope, standard to audit against (ISO 45001, OSHA...), site or department...',
  default: 'Describe your site, task or hazards. The more detail you add, the more specific the document will be (optional).'
};

function AIDocumentsPage() {
  const { user, planData } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const tab = new URLSearchParams(window.location.search).get('tab');
      return ['chat', 'generator', 'tools', 'history'].includes(tab) ? tab : 'chat';
    } catch (e) {
      return 'chat';
    }
  });
  const [prompt, setPrompt] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('general');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setGeneratedContent] = useState('');
  const [conversation, setConversation] = useState([]);
  const [documentHistory, setDocumentHistory] = useState([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [isSettingsDrawerVisible, setIsSettingsDrawerVisible] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  
  // PDF Editing States
  const [chatSessions, setChatSessions] = useState([]);
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false);

  const [, setSaveStatus] = useState('saved');
  const [aiPersonality, setAiPersonality] = useState('professional');
  const [responseDetail, setResponseDetail] = useState(3);
  const [, setSavedResponses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateIndustry, setTemplateIndustry] = useState('general');
  const [templateDocType, setTemplateDocType] = useState('custom');
  const [templateVisibility, setTemplateVisibility] = useState('private');
  const [aiSystemStatus, setAiSystemStatus] = useState({
    status: 'operational',
    models_loaded: true,
    available_models: ['google_flan-t5-base', 'safety_templates'],
    response_time: '1.2s',
    uptime: '99.8%'
  });
  const [usageStats, setUsageStats] = useState({
    documentsGenerated: 0,
    questionsAsked: 0,
    timeSaved: 0,
    complianceScore: 95,
    riskLevel: 'medium',
    industryExpertise: {}
  });
  const [companyProfile, setCompanyProfile] = useState(null);   // the user's company record (auto-fill source)
  const [companyInfo, setCompanyInfo] = useState({
    useCompanyInfo: false,
    useCompanyProfile: false,
    companyName: '',
    logo: null,
    industry: 'general',
    complianceOfficer: '',
    safetyStandards: [],
    address: '',
    phone: '',
    email: ''
  });
  // Auto-fill: load the company record once for users that belong to a company; remember the user's choice
  useEffect(() => {
    if (!user?.company_id) return undefined;
    let alive = true;
    apiGet('/ai/documents/company-profile')
      .then((res) => {
        if (!alive || !res?.data?.available) return;
        setCompanyProfile(res.data);
        let saved = null;
        try { saved = localStorage.getItem(`docgen:autofill:${user.id}`); } catch (e) { /* private mode */ }
        if (saved !== 'off') {
          setCompanyInfo((ci) => ({ ...ci, useCompanyInfo: true, useCompanyProfile: true }));
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [user?.company_id, user?.id]);

  const [, setDocumentStats] = useState({
    totalDocuments: 0,
    recentActivity: [],
    popularTemplates: [],
    complianceRate: 0
  });
  const [isTemplateLibraryVisible, setIsTemplateLibraryVisible] = useState(false);
  const [libraryShowAll, setLibraryShowAll] = useState(false);
  const [chatSuggestions, setChatSuggestions] = useState([]);
  const [generationMode, setGenerationMode] = useState('document');
  const [userPlan, setUserPlan] = useState('super_admin');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState({
    requiredPlan: '',
    currentPlan: '',
    documentName: '',
    features: []
  });

  // Add state for DeepSeek usage
  const [, setDeepSeekUsage] = useState({
    available: false,
    callsToday: 0,
    limit: 0,
    remaining: 0
  });

  // PDF State Variables
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [, setPdfEditMode] = useState(false);
  const [pdfContent, setPdfContent] = useState('');
  const [pdfMetadata, setPdfMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    companyInfo: {},
    watermark: false,
    pageNumbers: true,
    header: '',
    footer: ''
  });
  const [pdfStyles, setPdfStyles] = useState({
    fontFamily: 'Arial',
    fontSize: 12,
    lineHeight: 1.5,
    margins: {
      top: 72,
      bottom: 72,
      left: 72,
      right: 72
    },
    colors: {
      primary: '#1890ff',
      secondary: '#722ed1',
      accent: '#52c41a'
    }
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfTemplates, setPdfTemplates] = useState([]);
  const [pdfTemplateModalVisible, setPdfTemplateModalVisible] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);

  // ============= PDF EDITOR STATE VARIABLES =============
  const [, setPdfHistory] = useState({ past: [], future: [] });
  const [isPDFEditorExpanded, setIsPDFEditorExpanded] = useState(false); // NEW: Track editor expansion state
  const [sessionId, setSessionId] = useState(() => {
    try {
      return localStorage.getItem('ai_session_id') || `session_${Date.now()}`;
    } catch (e) {
      return `session_${Date.now()}`;
    }
  });
  const [, setIsSyncing] = useState(false);
  const [, setSyncStatus] = useState(null);   
  // Help / quick-start guide
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [showQuickGuide, setShowQuickGuide] = useState(() => {
    try {
      return localStorage.getItem('ai_docs_quick_guide_dismissed') !== 'true';
    } catch (e) {
      return true;
    }
  });

  const dismissQuickGuide = () => {
    setShowQuickGuide(false);
    try {
      localStorage.setItem('ai_docs_quick_guide_dismissed', 'true');
    } catch (e) {
      // storage not available - the guide simply comes back next visit
    }
  };

  // ============= INITIALIZATION =============

  const messagesEndRef = useRef(null);
  // Ref to the exam/certificate component (used by the floating Exam button)
  const examRef = useRef(null);

  // Add useEffect to check DeepSeek availability
  useEffect(() => {
    checkDeepSeekAvailability();
  }, [userPlan]);

  const checkDeepSeekAvailability = async () => {
    const isPremium = userPlan !== 'free';
    if (!isPremium) return;
    try {
      const stats = await deepSeekService.getUsageStats();
      const usage = stats?.usage || {};
      setDeepSeekUsage({
        available: Boolean(stats?.success && usage.remaining > 0),
        callsToday: usage.callsToday || 0,
        limit: usage.limit || 0,
        remaining: usage.remaining || 0,
        ...usage
      });
    } catch (error) {
      console.error('Failed to check DeepSeek availability:', error);
    }
  };

  useEffect(() => {
  const initializeAIStorage = async () => {
    setIsSyncing(true);
    try {
      // 1. Try to load from database
      const dbChat = await aiStorageService.getChatHistory(50);
      const dbDocs = await aiStorageService.getDocuments();
      
      if (dbChat?.success && dbChat.sessions?.length > 0) {
        // Use database data
        const latestSession = dbChat.sessions[0];
        if (latestSession && latestSession.messages) {
          setConversation(latestSession.messages);
          setSessionId(latestSession.sessionId);
          localStorage.setItem('ai_session_id', latestSession.sessionId);
        }
      } else {
        // 2. Fallback to localStorage
        const localSession = aiStorageService.getCurrentSessionLocal();
        if (localSession && localSession.messages) {
          setConversation(localSession.messages);
          setSessionId(localSession.sessionId);
          localStorage.setItem('ai_session_id', localSession.sessionId);
        }
      }
      
      // Load documents: server copy + this device's backup (the backup holds the full document content)
      const serverDocs = dbDocs?.success ? (dbDocs.documents || []) : [];
      const localServiceDocs = aiStorageService.getDocumentsLocal?.();
      const merged = mergeDocs(
        serverDocs,
        localServiceDocs?.success ? (localServiceDocs.documents || []) : [],
        readLocalDocs()
      );
      if (merged.length > 0) {
        setDocumentHistory(merged.map(d => ({ ...d, _savedToDb: serverDocs.some(x => x.id === d.id) })));
      }
      
      // Load saved responses
      const savedLocal = aiStorageService.getSavedResponsesLocal();
      if (savedLocal?.success) {
        setSavedResponses(savedLocal.responses || []);
      }
      
      setSyncStatus({ success: true, message: 'Data loaded successfully' });
    } catch (error) {
      console.error('Failed to initialize AI storage:', error);
      setSyncStatus({ success: false, message: error.message });
    } finally {
      setIsSyncing(false);
      setHistoryReady(true);
    }
  };
  
  initializeAIStorage();
}, []);

  useEffect(() => {
  if (conversation && conversation.length > 1) {
    const saveConversation = async () => {
      try {
        await aiStorageService.saveChatHistory(conversation, {
          sessionId: sessionId,
          industry: selectedIndustry,
          personality: aiPersonality,
          userPlan: userPlan
        });
      } catch (error) {
        console.error('Failed to save conversation:', error);
        // Fallback to localStorage
        aiStorageService.saveChatHistoryLocal(conversation, {
          sessionId: sessionId,
          industry: selectedIndustry,
          personality: aiPersonality
        });
      }
    };
    
    // Debounce saves to avoid too many requests
    const timeoutId = setTimeout(saveConversation, 2000);
    return () => clearTimeout(timeoutId);
  }
}, [conversation, sessionId]);

// Keep the document history saved: always back it up on this device, and send new/edited documents to the server
useEffect(() => {
  if (!historyReady) return undefined;
  writeLocalDocs(documentHistory);

  const pending = documentHistory.filter(d => d && !d._savedToDb && !d._saveFailed).slice(0, 5);
  if (pending.length === 0) return undefined;

  const timeoutId = setTimeout(async () => {
    const outcome = {};
    for (const doc of pending) {
      try {
        const result = await aiStorageService.saveDocument(doc);
        outcome[doc.id] = result?.success ? 'saved' : 'failed';
      } catch (error) {
        console.error('Failed to save document:', error);
        outcome[doc.id] = 'failed';
      }
      if (outcome[doc.id] === 'failed') {
        try { aiStorageService.saveDocumentLocal(doc); } catch (e) { /* ignore */ }
      }
    }
    setDocumentHistory(prev => prev.map(d => outcome[d.id]
      ? { ...d, _savedToDb: outcome[d.id] === 'saved', _saveFailed: outcome[d.id] === 'failed' }
      : d));
  }, 1500);
  return () => clearTimeout(timeoutId);
}, [documentHistory, historyReady]);

  useEffect(() => {
    checkAISystemStatus();
    initializeComponent();
    loadDocumentStats();
    loadChatSuggestions();
    fetchUserPlan();
    loadPdfTemplates();
  }, [user, planData]);

  const loadPdfTemplates = () => {
    const savedTemplates = JSON.parse(localStorage.getItem('pdf_templates') || '[]');
    setPdfTemplates(savedTemplates);
  };

  const fetchUserPlan = () => {
    try {
      console.log('🔄 fetchUserPlan: Checking user permissions...');

      if (user?.is_super_admin === true) {
        console.log('👑 SUPER ADMIN DETECTED: is_super_admin = true');
        setUserPlan('super_admin');
        localStorage.setItem('user_plan', 'super_admin');
        localStorage.setItem('is_super_admin', 'true');
        return;
      }

      if (user?.is_system_team === true) {
        console.log('👑 SYSTEM TEAM DETECTED: is_system_team = true');
        setUserPlan('super_admin');
        localStorage.setItem('user_plan', 'super_admin');
        localStorage.setItem('is_super_admin', 'true');
        return;
      }

      if (user?.user_type === 'super_admin' || user?.user_type === 'admin') {
        console.log(`👑 ADMIN DETECTED: user_type = ${user.user_type}`);
        setUserPlan('super_admin');
        localStorage.setItem('user_plan', 'super_admin');
        localStorage.setItem('is_super_admin', 'true');
        return;
      }

      if (user?.role === 'super_admin' || user?.role === 'admin') {
        console.log(`👑 ADMIN DETECTED: role = ${user.role}`);
        setUserPlan('super_admin');
        localStorage.setItem('user_plan', 'super_admin');
        localStorage.setItem('is_super_admin', 'true');
        return;
      }

      if (user?.account_info?.is_super_admin === true) {
        console.log('👑 SUPER ADMIN DETECTED: account_info.is_super_admin = true');
        setUserPlan('super_admin');
        localStorage.setItem('user_plan', 'super_admin');
        localStorage.setItem('is_super_admin', 'true');
        return;
      }

      const debugOverride = localStorage.getItem('debug_super_admin');
      if (debugOverride === 'true') {
        console.log('🔧 DEBUG OVERRIDE: Forcing super admin');
        setUserPlan('super_admin');
        localStorage.setItem('user_plan', 'super_admin');
        localStorage.setItem('is_super_admin', 'true');
        return;
      }

      let plan = 'free';
      let planSource = 'default';

      if (planData?.effective_plan) {
        plan = planData.effective_plan;
        planSource = 'planData.effective_plan';
      } else if (user?.effective_plan) {
        plan = user.effective_plan;
        planSource = 'user.effective_plan';
      } else if (user?.plan) {
        plan = user.plan;
        planSource = 'user.plan';
      } else if (user?.subscription_plan) {
        plan = user.subscription_plan;
        planSource = 'user.subscription_plan';
      } else if (user?.subscription?.effective_plan) {
        plan = user.subscription.effective_plan;
        planSource = 'user.subscription.effective_plan';
      }

      const normalizedPlan = plan.toLowerCase();
      console.log(`📋 Setting regular plan: ${normalizedPlan} (from: ${planSource})`);

      setUserPlan(normalizedPlan);
      localStorage.setItem('user_plan', normalizedPlan);
      localStorage.removeItem('is_super_admin');
    } catch (error) {
      console.error('❌ Error in fetchUserPlan:', error);
      const localStoragePlan = localStorage.getItem('user_plan');
      if (localStoragePlan) {
        setUserPlan(localStoragePlan);
      } else {
        setUserPlan('free');
      }
    }
  };

  const checkAISystemStatus = async () => {
    try {
      const response = await AIService.getAdvancedSystemStatus();
      if (response.success) {
        setAiSystemStatus({
          status: response.system_status || 'operational',
          models_loaded: response.model_loaded || false,
          available_models: ['google_flan-t5-base', 'safety_templates'],
          response_time: '1.2s',
          uptime: '99.8%'
        });
      }
    } catch (error) {
      console.error('Failed to check AI system status:', error);
    }
  };

  const initializeComponent = useCallback(() => {
  // Only add the welcome message when the chat is empty, so a restored chat is never wiped
  // when the user / plan data finishes loading.
  setConversation(prev => (prev && prev.length > 0 ? prev : [{
    id: 1,
    type: 'ai',
    content: `👋 I'm your Safety AI Assistant. I can help with risk assessments, document generation, compliance guidance, safety procedures, emergency planning and training materials.

💡 To create a document: open the "PDF Generator" tab, choose your industry, then pick a document type. Only documents available for your industry are listed. Not sure where to start? Ask me, or click "Help" at the top right.

How can I assist you today?`,
    timestamp: new Date()
  }]));
}, []);

    
  const loadDocumentStats = useCallback(() => {
    setDocumentStats({
      totalDocuments: documentHistory.length,
      recentActivity: documentHistory.slice(0, 3).map(doc => ({
        type: 'document_created',
        title: doc.title,
        time: 'Recently'
      })),
      popularTemplates: [],
      complianceRate: documentHistory.length > 0 ? 95 : 0
    });
  }, [documentHistory]);

  const loadChatSuggestions = useCallback(() => {
    const suggestions = [
      "Generate a risk assessment for a construction site",
      "Create a work permit template for electrical work",
      "Help me with emergency response planning",
      "Which documents do I need for confined space entry?",
      "What is the difference between a filled document and an empty template?",
      "Write a toolbox talk about working at height"
    ];
    setChatSuggestions(suggestions);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // ============= DOCUMENT GENERATION =============
  const handleGenerateDocument = async () => {
    console.log('='.repeat(80));
    console.log('🚀 HANDLE GENERATE DOCUMENT STARTED');
    console.log('='.repeat(80));

    if (!selectedDocumentType) {
      console.log('❌ ERROR: No document type selected');
      message.error('Please select a document type first');
      return;
    }

    if (userPlan !== 'super_admin') {
      const permission = checkDocumentPermission(selectedDocumentType, userPlan, documentTypes);
      if (!permission.allowed) {
        console.log('⛔ Permission denied:', permission);
        setUpgradeInfo({
          requiredPlan: permission.requiredPlan,
          currentPlan: permission.currentPlan,
          documentName: permission.featureName,
          features: getPlanFeatures(permission.requiredPlan)
        });
        setShowUpgradeModal(true);
        return;
      }
    }

    setLoading(true);
    try {
      const documentType = documentTypes.all.find(doc => doc.value === selectedDocumentType);
      const industry = industryOptions.find(ind => ind.value === selectedIndustry);
      
      const templateId = resolveTemplateId(selectedDocumentType, selectedIndustry);

      if (!templateId) {
        message.warning(
          `"${documentType?.label || selectedDocumentType}" is not available yet. Please choose another document type.`
        );
        return;
      }
      
      console.log('📋 Document Type:', selectedDocumentType);
      console.log('📋 Industry:', selectedIndustry);
      console.log('📋 Template ID:', templateId);
      console.log('📋 Generation Mode:', generationMode);
      
      const requestData = {
        doc_type: selectedDocumentType,
        template_name: templateId,
        requirements: prompt || `Generate professional ${documentType?.label} for ${industry?.label}`,
        industry: selectedIndustry,
        standard: 'osha',
        style: 'professional',
        output_format: 'html',
        company_info: companyInfo.useCompanyInfo ? companyInfo : {},
        generate_ai_content: false,
        fill_mode: generationMode,
        custom_data: {
          title: `${documentType?.label} - ${industry?.label}`,
          date: new Date().toISOString().split('T')[0],
          site: companyInfo.siteName || '',
          location: companyInfo.location || '',
          contractor: companyInfo.contractor || '',
          supervisor: companyInfo.supervisor || '',
          work_description: prompt || '',
          ...companyInfo
        }
      };

      console.log('📤 Sending request:', requestData);

      const result = await AIService.generateUniversalDocument({
        document_type: selectedDocumentType,
        template_name: templateId,
        industry: selectedIndustry,
        requirements: prompt || `Generate professional ${documentType?.label} for ${industry?.label}`,
        company_info: (companyInfo.useCompanyInfo || companyInfo.useCompanyProfile) ? { ...companyInfo, useCompanyInfo: true } : {},
        custom_sections: getCustomSectionsForDocument(selectedDocumentType, selectedIndustry),
        generation_mode: generationMode,
        output_format: 'html',
        is_super_admin: userPlan === 'super_admin',
        generate_ai_content: false
      }, userPlan);

      console.log('📥 Response received:', result);

      let generatedDocument = '';

      if (result.success) {
        if (result.content) {
          generatedDocument = result.content;
        } else if (result.export_content_base64) {
          try {
            generatedDocument = atob(result.export_content_base64);
          } catch (e) {
            generatedDocument = result.export_content_base64;
          }
        } else if (result.document) {
          generatedDocument = result.document.content || result.document;
        } else {
          throw new Error('Empty content - no content field found in response');
        }
      } else if (result.document) {
        generatedDocument = result.document;
      } else {
        throw new Error(result.error || 'Generation failed');
      }

      if (!generatedDocument || generatedDocument.length < 50) {
        throw new Error('The server returned an empty document');
      }

      console.log(`✅ Generated document length: ${generatedDocument.length}`);

      setGeneratedContent(generatedDocument);

      const isFullHtml = generatedDocument.trim().startsWith('<!DOCTYPE html>') ||
                         generatedDocument.trim().startsWith('<html');

      let htmlDocument;
      if (isFullHtml) {
        htmlDocument = generatedDocument;
      } else {
        htmlDocument = getProfessionalHtmlTemplate(
          generatedDocument,
          documentType?.label || selectedDocumentType,
          selectedIndustry,
          result.company_branding?.applied ? { ...companyInfo, logo: null, useCompanyInfo: false } : companyInfo,
          generationMode,
          industryOptions
        );
      }

      setPdfContent(htmlDocument);
      setPdfMetadata(prev => ({
        ...prev,
        title: documentType?.label || 'Safety Document',
        subject: `Safety document for ${industry?.label} industry`,
        author: companyInfo.complianceOfficer || 'Safety Officer',
        generated_by: 'knowledge_base',
        generation_mode: generationMode,
        template_id: templateId
      }));
      setPdfPreviewVisible(true);
      setPdfEditMode(true);
      // Reset editor expanded state when opening
      setIsPDFEditorExpanded(false);

      const newDoc = {
        id: result.document?.id || `DOC-${Date.now()}`,
        title: `${documentType?.label} - ${industry?.label}`,
        type: documentType?.label,
        industry: industry?.label,
        date: new Date().toISOString().split('T')[0],
        status: generationMode === 'template' ? 'template' : 'completed',
        size: result.document?.file_size || `${Math.round(generatedDocument.length / 1024)} KB`,
        preview: generatedDocument.substring(0, 100) + '...',
        htmlContent: htmlDocument,
        metadata: result.metadata || result.document || {},
        color: documentType?.color,
        tags: [
          documentType?.category, 
          industry?.value, 
          generationMode, 
          'pdf', 
          'new',
          'knowledge_base'
        ],
        generationMode: generationMode,
        outputFormat: 'pdf',
        generatedBy: userPlan === 'super_admin' ? 'super-admin' : 'user',
        source: 'knowledge_base',
        downloadUrl: result.download_url,
        templateId: templateId
      };

      setCurrentDocument(newDoc);
      setDocumentHistory(prev => [newDoc, ...prev]);
      // Linked modules: optionally file every generated document in Document Management
      if (getAutoAdd('ai') && htmlDocument) {
        importGeneratedDocument({
          title: newDoc.title, html: htmlDocument,
          documentType: String(documentType?.value || documentType?.label || 'report').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          module: 'hse', meta: { industry: industry?.label, ai_document_id: newDoc.id },
        }).then(() => message.info('Also saved to Document Management')).catch((e) => message.warning(`Not added to Document Management: ${e.message}`));
      }
      setUsageStats(prev => ({
        ...prev,
        documentsGenerated: prev.documentsGenerated + 1
      }));

      if (userPlan === 'super_admin') {
        message.success(`👑 Super Admin: ${documentType?.label} generated successfully from knowledge base (Template: ${templateId})`);
      } else {
        message.success(`✅ ${documentType?.label} generated successfully from knowledge base`);
      }

    } catch (error) {
      console.error('❌ HANDLE GENERATE DOCUMENT ERROR:', error);

      const failedDoc = documentTypes.all.find(doc => doc.value === selectedDocumentType);
      message.error(
        `Could not generate "${failedDoc?.label || selectedDocumentType}": ${error?.message || 'the service is not available'}. ` +
        'No document was created. Please try again in a moment.',
        6
      );
    } finally {
      setLoading(false);
    }
  };


  // ============= DOWNLOAD FUNCTIONS =============
  const handleDownloadDocument = async (doc) => {
    try {
      console.log('📥 Downloading document:', doc);
      
      const htmlContent = getDocHtml(doc);
      
      if (!htmlContent) {
        console.error('❌ No HTML content found in document');
        message.error('Cannot download: No document content available');
        return;
      }
      
      setIsGeneratingPdf(true);
      
      const element = document.createElement('div');
      element.setAttribute('data-pdf-temp', '1');
      element.innerHTML = htmlContent;
      element.style.padding = '20px';
      element.style.backgroundColor = 'white';
      element.style.fontFamily = 'Arial, sans-serif';
      
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          body { margin: 0; padding: 20px; }
          .no-print { display: none; }
          table { border-collapse: collapse; width: 100%; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        }
        .permit-table, .risk-table, .hazard-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .permit-table th, .permit-table td,
        .risk-table th, .risk-table td,
        .hazard-table th, .hazard-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        .signature-line {
          margin-top: 30px;
          border-top: 1px solid #000;
          width: 200px;
          padding-top: 5px;
        }
      `;
      element.appendChild(style);
      
      document.body.appendChild(element);
      
      if (await ensureHtml2Pdf()) {
        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `${toFileName(doc.title, 'document')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        await window.html2pdf().set(opt).from(element).save();
        message.success('PDF downloaded successfully!');
      } else {
        downloadHtmlFile(htmlContent, toFileName(doc.title, 'document'));
        message.info('The PDF engine could not be loaded, so the document was downloaded as an HTML file (open it in any browser).');
      }
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      message.error(error.message || 'Failed to download PDF');
    } finally {
      document.querySelectorAll('[data-pdf-temp]').forEach(n => n.remove());
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async (contentOverride) => {
    const source = typeof contentOverride === 'string' && contentOverride.length > 50 ? contentOverride : pdfContent;
    if (!source) {
      message.error('No content to download');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const element = document.createElement('div');
      element.setAttribute('data-pdf-temp', '1');
      element.innerHTML = source;
      element.style.padding = '20px';
      element.style.backgroundColor = 'white';
      element.style.width = '100%';
      element.style.maxWidth = '100%';
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = source;
      let maxColumns = 0;
      const tables = tempDiv.querySelectorAll('table');
      tables.forEach(table => {
        let cols = 0;
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('th, td');
          cols = Math.max(cols, cells.length);
        });
        maxColumns = Math.max(maxColumns, cols);
      });
      
      const isWideTable = maxColumns > 6;
      const orientation = isWideTable ? 'landscape' : 'portrait';
      const pageSize = isWideTable ? 'a3' : 'a4';
      
      console.log(`📊 Table detected: ${maxColumns} columns, using ${orientation} orientation on ${pageSize}`);
      
      const style = document.createElement('style');
      style.textContent = `
        * {
          color-adjust: exact !important;
          print-color-adjust: exact !important;
          -webkit-print-color-adjust: exact !important;
        }
        
        body {
          margin: 0;
          padding: 20px;
          font-size: 12px;
        }
        
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
          table-layout: auto;
          word-wrap: break-word;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          vertical-align: top;
          word-break: break-word;
        }
        
        .permit-table, .risk-table, .hazard-table {
          width: 100%;
          overflow-x: auto;
        }
        
        th {
          background-color: #1E3D58 !important;
          color: white !important;
        }
        
        .risk-high, .risk-3, .risk-red, [class*="risk-high"], [class*="risk-3"] {
          background-color: #dc3545 !important;
          color: white !important;
        }
        
        .risk-medium, .risk-2, .risk-yellow, [class*="risk-medium"], [class*="risk-2"] {
          background-color: #ffc107 !important;
          color: #333 !important;
        }
        
        .risk-low, .risk-1, .risk-green, [class*="risk-low"], [class*="risk-1"] {
          background-color: #28a745 !important;
          color: white !important;
        }
        
        [style*="color"], [style*="background"] {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .signature-line {
          margin-top: 30px;
          border-top: 1px solid #000;
          width: 200px;
          padding-top: 5px;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .section {
          margin-bottom: 20px;
        }
        
        h1, h2, h3 {
          page-break-after: avoid;
        }
        
        table, tr, td, th {
          page-break-inside: avoid;
        }
      `;
      element.appendChild(style);
      
      document.body.appendChild(element);
      
      if (await ensureHtml2Pdf()) {
        const opt = {
          margin: isWideTable ? [0.3, 0.3, 0.3, 0.3] : [0.5, 0.5, 0.5, 0.5],
          filename: `${toFileName(currentDocument?.title, 'safety_document')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: isWideTable ? 1.5 : 2,
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff',
            letterRendering: true
          },
          jsPDF: { 
            unit: 'in', 
            format: pageSize, 
            orientation: orientation,
            compress: true
          },
          pagebreak: { mode: ['css', 'legacy'] }
        };
        
        await window.html2pdf().set(opt).from(element).save();
        message.success(`PDF downloaded successfully! (${orientation} orientation)`);
      } else {
        downloadHtmlFile(source, toFileName(currentDocument?.title, 'safety_document'));
        message.info('The PDF engine could not be loaded, so the document was downloaded as an HTML file (open it in any browser).');
      }
      
    } catch (error) {
      console.error('PDF download error:', error);
      message.error('Failed to generate PDF: ' + error.message);
    } finally {
      document.querySelectorAll('[data-pdf-temp]').forEach(n => n.remove());
      setIsGeneratingPdf(false);
    }
  };

  // ============= PDF EDITOR HANDLERS =============
  
  // Handler for saving content from the new PDF Editor
  const handlePDFEditorSave = (newContent, { silent = false } = {}) => {
    setPdfContent(newContent);
    // Save to history for undo/redo
    setPdfHistory(prev => ({
      past: [...prev.past, { content: pdfContent }],
      future: []
    }));

    // Keep the saved copy in Document History in sync with what the user edited
    if (currentDocument?.id && typeof newContent === 'string') {
      setCurrentDocument(prev => (prev ? { ...prev, htmlContent: newContent } : prev));
      setDocumentHistory(prev => prev.map(d => d.id === currentDocument.id
        ? { ...d, htmlContent: newContent, preview: newContent.substring(0, 100) + '...', _savedToDb: false, _saveFailed: false }
        : d));
    }
    if (!silent) message.success('Document saved successfully');
  };

  // Handler for exporting PDF from the editor: downloads what the user sees (including unsaved edits)
  const handlePDFEditorExport = async (content) => {
    if (typeof content === 'string' && content.length > 50 && content !== pdfContent) {
      handlePDFEditorSave(content, { silent: true });
    }
    await handleDownloadPdf(content);
  };

  // Update handleSendMessage function - around line 700

const handleSendMessage = async () => {
  console.log('🔵 [CHAT] handleSendMessage STARTED');
  console.log('🔵 [CHAT] Prompt:', prompt);
  console.log('🔵 [CHAT] User Plan:', userPlan);
  
  if (!prompt.trim()) {
    console.warn('⚠️ [CHAT] Empty prompt');
    message.warning('Please enter a message');
    return;
  }

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: prompt,
    timestamp: new Date(),
    industry: selectedIndustry
  };

  // Add user message to conversation
  setConversation(prev => [...prev, userMessage]);
  setLoading(true);

  const currentPrompt = prompt;
  setPrompt('');

  try {
    const useDeepSeekChat = (userPlan === 'super_admin' || userPlan === 'pro' || userPlan === 'enterprise');
    console.log(`🤖 [CHAT] Using DeepSeek: ${useDeepSeekChat}`);
    
    let result;
    let aiResponse;

    if (useDeepSeekChat) {
      console.log('🤖 [CHAT] Calling DeepSeek API...');
      
      try {
        const deepSeekResult = await apiPost('/deepseek/chat', {
          message: currentPrompt,
          industry: selectedIndustry,
          conversation_history: conversation.slice(-5).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          personality: aiPersonality,
          detail_level: responseDetail,
          is_super_admin: userPlan === 'super_admin'
        });
        
        console.log('📥 [CHAT] DeepSeek raw response:', JSON.stringify(deepSeekResult, null, 2));
        
        // Extract response from the correct field
        let responseText = null;
        
        if (deepSeekResult && typeof deepSeekResult === 'object') {
          // Try various field names
          if (deepSeekResult.response) {
            responseText = deepSeekResult.response;
            console.log('✅ Found response in .response field');
          } else if (deepSeekResult.content) {
            responseText = deepSeekResult.content;
            console.log('✅ Found response in .content field');
          } else if (deepSeekResult.message) {
            responseText = deepSeekResult.message;
            console.log('✅ Found response in .message field');
          } else if (deepSeekResult.data && deepSeekResult.data.response) {
            responseText = deepSeekResult.data.response;
            console.log('✅ Found response in .data.response field');
          } else if (deepSeekResult.data && deepSeekResult.data.content) {
            responseText = deepSeekResult.data.content;
            console.log('✅ Found response in .data.content field');
          } else if (deepSeekResult.result) {
            responseText = deepSeekResult.result;
            console.log('✅ Found response in .result field');
          } else if (deepSeekResult.success && deepSeekResult.data) {
            responseText = deepSeekResult.data.response || deepSeekResult.data.content || JSON.stringify(deepSeekResult.data);
            console.log('✅ Found response in .data field');
          } else if (deepSeekResult.text) {
            responseText = deepSeekResult.text;
            console.log('✅ Found response in .text field');
          } else if (deepSeekResult.output) {
            responseText = deepSeekResult.output;
            console.log('✅ Found response in .output field');
          } else if (deepSeekResult.answer) {
            responseText = deepSeekResult.answer;
            console.log('✅ Found response in .answer field');
          } else if (deepSeekResult.reply) {
            responseText = deepSeekResult.reply;
            console.log('✅ Found response in .reply field');
          }
          
          // If still no response, try to stringify the whole object
          if (!responseText) {
            try {
              responseText = JSON.stringify(deepSeekResult, null, 2);
              console.log('✅ Response stringified from object');
            } catch (e) {
              console.error('❌ Could not stringify response:', e);
            }
          }
        } else if (typeof deepSeekResult === 'string') {
          responseText = deepSeekResult;
          console.log('✅ Response is a string');
        }
        
        console.log('📝 [CHAT] Extracted response text length:', responseText?.length || 0);
        
        // Check if we have a valid response
        if (responseText && responseText.length > 10) {
          result = {
            success: true,
            response: responseText,
            source: 'deepseek'
          };
          console.log('✅ [CHAT] DeepSeek response extracted successfully');
        } else {
          console.warn('⚠️ [CHAT] No valid response extracted, using fallback');
          const errorMsg = deepSeekResult?.error || deepSeekResult?.message || 'No response from AI';
          result = {
            success: true,
            response: `⚠️ Error: ${errorMsg}`,
            source: 'deepseek_error'
          };
        }
      } catch (deepSeekError) {
        console.error('❌ [CHAT] DeepSeek error:', deepSeekError);
        console.error('❌ [CHAT] Error stack:', deepSeekError.stack);
        
        // Use fallback
        const fallbackResponse = buildFallbackAIResponse(currentPrompt, selectedIndustry, aiPersonality);
        result = {
          success: true,
          response: fallbackResponse.content,
          source: 'local_fallback'
        };
      }
    } else {
      console.log('📚 [CHAT] Using knowledge base');
      result = await AIService.smartQuery(currentPrompt, {
        industry: selectedIndustry,
        context: AIService.formatContext(conversation.slice(-5)),
        personality: aiPersonality,
        detail_level: responseDetail
      });
      console.log('📥 [CHAT] Knowledge base result:', result);
    }

    console.log('📥 [CHAT] Final result:', {
      success: result?.success,
      source: result?.source,
      responseLength: result?.response?.length || 0
    });

    // Add AI response to conversation
    if (result?.success && result?.response) {
      aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: result.response,
        timestamp: new Date(),
        personality: aiPersonality,
        industry: selectedIndustry,
        source: result.source || 'unknown',
        likes: 0,
        saved: false
      };
      
      console.log('✅ [CHAT] Adding AI response to conversation');
      
      // Update conversation and save to database
      setConversation(prev => {
        const updated = [...prev, aiResponse];
        
        // Auto-save to database after state update
        console.log('💾 [CHAT] Auto-saving conversation to database...');
        aiStorageService.saveChatHistory(updated, {
          sessionId: sessionId,
          industry: selectedIndustry,
          personality: aiPersonality,
          userPlan: userPlan
        }).then(() => {
          console.log('✅ [CHAT] Conversation saved to database');
          setSaveStatus('saved');
        }).catch(err => {
          console.error('❌ [CHAT] Failed to save chat history:', err);
          // Fallback to localStorage
          console.log('💾 [CHAT] Saving to localStorage as fallback...');
          aiStorageService.saveChatHistoryLocal(updated, {
            sessionId: sessionId,
            industry: selectedIndustry,
            personality: aiPersonality
          });
          setSaveStatus('local');
        });
        
        // Also update chat sessions list
        setChatSessions(prev => {
          const existing = prev.find(s => s.sessionId === sessionId);
          if (existing) {
            return prev.map(s => 
              s.sessionId === sessionId 
                ? { 
                    ...s, 
                    messages: updated, 
                    metadata: { 
                      ...s.metadata, 
                      lastUpdated: new Date().toISOString() 
                    } 
                  }
                : s
            );
          } else {
            return [{
              sessionId: sessionId,
              messages: updated,
              metadata: {
                industry: selectedIndustry,
                personality: aiPersonality,
                lastUpdated: new Date().toISOString()
              }
            }, ...prev];
          }
        });
        
        return updated;
      });
      
      setUsageStats(prev => ({ ...prev, questionsAsked: prev.questionsAsked + 1 }));
    } else {
      console.error('❌ [CHAT] No valid result from AI');
      const fallbackResponse = buildFallbackAIResponse(currentPrompt, selectedIndustry, aiPersonality);
      
      setConversation(prev => {
        const updated = [...prev, fallbackResponse];
        
        // Save fallback response
        aiStorageService.saveChatHistory(updated, {
          sessionId: sessionId,
          industry: selectedIndustry,
          personality: aiPersonality,
          userPlan: userPlan
        }).catch(() => {
          aiStorageService.saveChatHistoryLocal(updated, {
            sessionId: sessionId,
            industry: selectedIndustry,
            personality: aiPersonality
          });
        });
        
        return updated;
      });
    }
  } catch (error) {
    console.error('❌ [CHAT] Fatal error:', error);
    console.error('❌ [CHAT] Error stack:', error.stack);
    
    // Fallback response
    const fallbackResponse = buildFallbackAIResponse(currentPrompt, selectedIndustry, aiPersonality);
    
    setConversation(prev => {
      const updated = [...prev, fallbackResponse];
      
      // Save fallback response
      aiStorageService.saveChatHistory(updated, {
        sessionId: sessionId,
        industry: selectedIndustry,
        personality: aiPersonality,
        userPlan: userPlan
      }).catch(() => {
        aiStorageService.saveChatHistoryLocal(updated, {
          sessionId: sessionId,
          industry: selectedIndustry,
          personality: aiPersonality
        });
      });
      
      return updated;
    });
    
    message.error('Failed to get AI response. Please try again.');
  } finally {
    setLoading(false);
    console.log('🔵 [CHAT] handleSendMessage COMPLETED');
  }
};

  const handleLikeResponse = (responseId) => {
    setConversation(prev => prev.map(msg =>
      msg.id === responseId ? { ...msg, likes: (msg.likes || 0) + 1 } : msg
    ));
    message.success('Thanks for your feedback!');
  };

  const handleSaveResponse = (responseId) => {
    const response = conversation.find(msg => msg.id === responseId);
    if (response) {
      const savedResponse = {
        id: `SAVED-${Date.now()}`,
        content: response.content,
        timestamp: new Date(),
        industry: response.industry,
        personality: response.personality,
        tags: ['saved', response.industry]
      };
      setSavedResponses(prev => [...prev, savedResponse]);
      message.success('Response saved to library');
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  // ============= PDF EDITOR LEGACY FUNCTIONS (kept for compatibility) =============


























  const handleSavePdfTemplate = () => {
    if (!templateName.trim()) {
      message.error('Please enter a template name');
      return;
    }

    const newTemplate = {
      id: `TEMPLATE-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      industry: templateIndustry,
      documentType: templateDocType,
      visibility: templateVisibility,
      content: pdfContent,
      metadata: pdfMetadata,
      styles: pdfStyles,
      createdAt: new Date().toISOString()
    };

    const updatedTemplates = [...pdfTemplates, newTemplate];
    setPdfTemplates(updatedTemplates);
    localStorage.setItem('pdf_templates', JSON.stringify(updatedTemplates));

    setTemplateName('');
    setTemplateDescription('');
    setPdfTemplateModalVisible(false);
    message.success('PDF template saved!');
  };

  const handleUsePdfTemplate = (template) => {
    setPdfContent(template.content);
    setPdfMetadata(template.metadata || {});
    setPdfStyles(template.styles || pdfStyles);
    setPdfTemplateModalVisible(false);
    setPdfPreviewVisible(true);
    setPdfEditMode(true);
    setIsPDFEditorExpanded(false);
    message.success(`Loaded template: ${template.name}`);
  };

  const handleDeletePdfTemplate = (templateId) => {
    const updatedTemplates = pdfTemplates.filter(t => t.id !== templateId);
    setPdfTemplates(updatedTemplates);
    localStorage.setItem('pdf_templates', JSON.stringify(updatedTemplates));
    message.success('Template deleted');
  };




  // ============= DOCUMENT HISTORY FUNCTIONS =============

   

  // ============= CHAT HISTORY FUNCTIONS =============

const loadChatSessions = async () => {
  setChatHistoryLoading(true);
  try {
    const result = await aiStorageService.getChatHistory(50);
    if (result.success) {
      setChatSessions(result.sessions);
    } else {
      // Fallback to local
      const localSessions = aiStorageService.getChatHistoryLocal(50);
      if (localSessions.success) {
        setChatSessions(localSessions.sessions);
      }
    }
  } catch (error) {
    console.error('Failed to load chat sessions:', error);
  } finally {
    setChatHistoryLoading(false);
  }
};

const loadSavedDocuments = async () => {
  try {
    const result = await aiStorageService.getDocuments();
    const serverDocs = result?.success ? (result.documents || []) : [];
    setDocumentHistory(prev => mergeDocs(
      serverDocs.map(d => ({ ...d, _savedToDb: true })),
      prev,
      readLocalDocs()
    ));
  } catch (error) {
    console.error('Failed to load documents:', error);
  }
};

const restoreChatSession = (session) => {
  if (session && session.messages) {
    setConversation(session.messages);
    setSessionId(session.sessionId);
    localStorage.setItem('ai_session_id', session.sessionId);
    message.success('Chat session restored');
    // Switch back to chat tab
    setActiveTab('chat');
  }
};

const deleteChatSession = async (sessionId) => {
  Modal.confirm({
    title: 'Delete Chat Session?',
    content: 'This action cannot be undone.',
    okText: 'Delete',
    cancelText: 'Cancel',
    okButtonProps: { danger: true },
    onOk: async () => {
      try {
        await aiStorageService.deleteChatSession(sessionId);
        setChatSessions(prev => prev.filter(s => s.sessionId !== sessionId));
        message.success('Chat session deleted');
      } catch (error) {
        message.error('Failed to delete session');
      }
    }
  });
};

  // ============= RENDER FUNCTIONS =============
  const getFilteredDocumentTypes = useCallback(() => {
    // Only documents available for the selected industry
    let filtered = getDocsForIndustry(selectedIndustry);

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    return filtered;
  }, [selectedCategory, selectedIndustry]);

  // When the industry changes: clear a document that is not available there, and reset an empty category
  const handleIndustryChange = (value) => {
    setSelectedIndustry(value);

    const nextDocs = getDocsForIndustry(value);

    if (selectedCategory !== 'all' && !nextDocs.some(doc => doc.category === selectedCategory)) {
      setSelectedCategory('all');
    }

    if (selectedDocumentType) {
      const currentDoc = documentTypes.all.find(d => d.value === selectedDocumentType);
      if (currentDoc && !docMatchesIndustry(currentDoc, value)) {
        setSelectedDocumentType('');
        message.info('Document type was cleared because it is not available for this industry. Please choose another one.');
      }
    }
  };

  const renderIndustrySelector = () => (
  <Form.Item
    label={
      <Space>
        <GlobalOutlined />
        <span>Step 1 · Industry</span>
        <Tooltip title="Choose your industry first. The Document Type list below only shows documents available for it.">
          <QuestionCircleOutlined style={{ color: '#666' }} />
        </Tooltip>
      </Space>
    }
    extra="The document list below changes to match the industry you pick."
  >
    <Select
      value={selectedIndustry}
      onChange={handleIndustryChange}
      style={{ width: '100%' }}
      placeholder="Select industry"
      size="large"
      showSearch
      optionLabelProp="label"
      optionFilterProp="searchText"
    >
      {industryOptions.map(industry => {
        const docCount = getDocsForIndustry(industry.value).length;
        return (
          <Option
            key={industry.value}
            value={industry.value}
            searchText={industry.label}
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{industry.icon}</span>
                <span>{industry.label}</span>
              </div>
            }
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '4px 0'
            }}>
              <span style={{ fontSize: '20px', color: industry.color }}>{industry.icon}</span>
              <div style={{ flex: 1 }}>
                <Text strong style={{ color: industry.color }}>{industry.label}</Text>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  <Tag
                    color={
                      String(industry.risk_level).includes('HIGH') ? 'red' :
                      String(industry.risk_level).includes('MEDIUM') ? 'orange' :
                      'green'
                    }
                  >
                    {industry.risk_level}
                  </Tag>
                  <Tag color="blue">{docCount} documents</Tag>
                </div>
              </div>
            </div>
          </Option>
        );
      })}
    </Select>
  </Form.Item>
);

  const renderDocumentTypeSelector = () => {
  const availableDocuments = getFilteredDocumentTypes();
  const industryDocs = getDocsForIndustry(selectedIndustry);
  const industryInfo = industryOptions.find(ind => ind.value === selectedIndustry);
  const industryLabel = industryInfo?.label || prettyIndustry(selectedIndustry);
  const specificCount = countSpecificDocs(selectedIndustry);
  const universalCount = industryDocs.length - specificCount;
  const selectedDoc = documentTypes.all.find(d => d.value === selectedDocumentType);

  // How many documents each category has for the chosen industry
  const categoryCounts = industryDocs.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {});

  let helpText;
  if (selectedIndustry === 'general') {
    helpText = `Showing ${industryDocs.length} general documents that work in any industry. Pick an industry above to also see its specialised documents.`;
  } else if (specificCount > 0) {
    helpText = `Showing ${industryDocs.length} documents for ${industryLabel}: ${specificCount} specialised + ${universalCount} general.`;
  } else {
    helpText = `${industryLabel} has no specialised documents yet - showing the ${universalCount} general documents that apply to every industry.`;
  }

  const renderDocOption = (doc) => {
          const permission = checkDocumentPermission(doc.value, userPlan, documentTypes);
          const isDisabled = !permission.allowed;

          return (
            <Select.Option
              key={doc.value}
              value={doc.value}
              disabled={isDisabled}
              label={doc.label}
              description={doc.description}
            >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', color: doc.color }}>{doc.icon}</span>
                  <Text strong style={{ color: isDisabled ? '#d9d9d9' : doc.color }}>
                    {doc.label}
                  </Text>
                  {isDisabled && <LockOutlined style={{ color: '#faad14', fontSize: '14px' }} />}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  <Tag color={String(doc.estimated_time).includes('10') ? 'green' : String(doc.estimated_time).includes('15') ? 'cyan' : 'blue'}>
                    {doc.estimated_time}
                  </Tag>
                  <Tag
                    color={
                      doc.category === 'permits' ? 'red' :
                      doc.category === 'assessments' ? 'orange' :
                      doc.category === 'plans' ? 'purple' :
                      doc.category === 'inspections' ? 'green' : 'blue'
                    }
                  >
                    {doc.category}
                  </Tag>
                  <Tag
                    color={
                      doc.plan_required === 'free' ? 'green' :
                      doc.plan_required === 'basic' ? 'blue' :
                      'gold'
                    }
                  >
                    {doc.plan_required}
                  </Tag>
                  {!isUniversalDoc(doc) && <Tag color="geekblue">{industryLabel}</Tag>}
                  {isDisabled && (
                    <Tag color="orange">
                      Requires {permission.requiredPlan}
                    </Tag>
                  )}
                </div>

                <div style={{ fontSize: '11px', color: '#666', width: '100%' }}>
                  {doc.description}
                </div>
              </div>
            </Select.Option>
          );
  };
  const specificDocs = availableDocuments.filter(doc => !isUniversalDoc(doc));
  const generalDocs = availableDocuments.filter(doc => isUniversalDoc(doc));

  return (
    <Form.Item
      label={
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
          <FileTextOutlined style={{ marginRight: '4px' }} />
          <span>Step 2 · Document Type</span>
          <Tag color="purple" style={{ marginLeft: '4px' }}>
            {PLAN_PERMISSIONS[userPlan]?.name || userPlan}
          </Tag>
        </div>
      }
      required
      extra={helpText}
    >
      <Select
        value={selectedDocumentType || undefined}
        onChange={setSelectedDocumentType}
        style={{ width: '100%' }}
        placeholder={`Choose a document type (${availableDocuments.length} available)...`}
        size="large"
        showSearch
        allowClear
        onClear={() => setSelectedDocumentType('')}
        notFoundContent="No documents match. Try another category or search word."
        filterOption={(input, option) => {
          const query = String(input || '').toLowerCase();
          const label = String(option?.label || '').toLowerCase();
          const description = String(option?.description || '').toLowerCase();
          return label.includes(query) || description.includes(query);
        }}
        dropdownRender={menu => (
          <div>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
              <Space size="small">
                <FilterOutlined />
                <Text type="secondary">Filter by category:</Text>
                <Select
                  size="small"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: 200 }}
                  dropdownMatchSelectWidth={false}
                >
                  {Object.entries(documentTypes.categories)
                    .filter(([key]) => key === 'all' || categoryCounts[key])
                    .map(([key, category]) => (
                      <Option key={key} value={key}>
                        {category.icon} {category.label}{key === 'all' ? ` (${industryDocs.length})` : ` (${categoryCounts[key]})`}
                      </Option>
                    ))}
                </Select>
              </Space>
            </div>
            {menu}
          </div>
        )}
        optionLabelProp="label"
      >
        {specificDocs.length > 0 && (
          <Select.OptGroup key="specific" label={`${industryLabel} documents (${specificDocs.length})`}>
            {specificDocs.map(renderDocOption)}
          </Select.OptGroup>
        )}
        {generalDocs.length > 0 && (
          <Select.OptGroup key="general" label={`General HSE documents – every industry (${generalDocs.length})`}>
            {generalDocs.map(renderDocOption)}
          </Select.OptGroup>
        )}
      </Select>

      {selectedDoc && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
          <Text strong>{selectedDoc.icon} {selectedDoc.label}</Text>
          {' - '}{selectedDoc.description}
          {' · '}<ClockCircleOutlined /> about {selectedDoc.estimated_time}
        </div>
      )}
    </Form.Item>
  );
};
  const renderGenerationModeSelector = () => (
    <Form.Item label={
      <Space>
        <BuildOutlined />
        <span>Generation Mode</span>
        <Tooltip title="Choose between filled documents with complete content or empty templates for manual completion">
          <QuestionCircleOutlined style={{ color: '#666' }} />
        </Tooltip>
      </Space>
    }>
      <Radio.Group
        value={generationMode}
        onChange={(e) => setGenerationMode(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        size="large"
        style={{ width: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {generationModeOptions.map(mode => (
            <Radio.Button
              key={mode.value}
              value={mode.value}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '8px',
                height: 'auto',
                border: generationMode === mode.value ? '2px solid #1890ff' : '1px solid #d9d9d9'
              }}
            >
              <Space>
                <span style={{ fontSize: '20px' }}>{mode.icon}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{mode.label}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{mode.description}</div>
                </div>
              </Space>
            </Radio.Button>
          ))}
        </Space>
      </Radio.Group>
    </Form.Item>
  );

  const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  const setAutoFill = (checked) => {
    setCompanyInfo((ci) => ({ ...ci, useCompanyProfile: checked, useCompanyInfo: checked ? true : ci.useCompanyInfo }));
    try { localStorage.setItem(`docgen:autofill:${user?.id}`, checked ? 'on' : 'off'); } catch (e) { /* ignore */ }
  };
  const profileLogoUrl = (() => {
    const u = companyProfile?.logo_url;
    if (!u) return null;
    if (/^https?:\/\//.test(u)) return u;
    const base = (process.env.REACT_APP_API_URL || '').replace(/\/api\/?$/, '');
    return `${base}${u}`;
  })();

  const renderCompanyInfoSection = () => (
    <Card
      title={
        <Space wrap>
          <TeamOutlined />
          <span>Company Information</span>
          <Switch
            size="small"
            checked={companyInfo.useCompanyInfo}
            onChange={(checked) => setCompanyInfo({ ...companyInfo, useCompanyInfo: checked, useCompanyProfile: checked ? companyInfo.useCompanyProfile : false })}
          />
          <Tag color={companyInfo.useCompanyInfo ? 'green' : 'default'}>
            {companyInfo.useCompanyInfo ? 'Enabled' : 'Disabled'}
          </Tag>
        </Space>
      }
      size="small"
    >
      {companyProfile && (
        <div className="docgen-autofill" style={{ marginBottom: 12, padding: '8px 10px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}>
          <Checkbox checked={!!companyInfo.useCompanyProfile} onChange={(e) => setAutoFill(e.target.checked)}>
            <Text strong>Auto-fill from my company profile</Text>
          </Checkbox>
          <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
            Adds your company name, contact details and uploaded logo to every generated document.
          </div>
          {companyInfo.useCompanyProfile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              {profileLogoUrl
                ? <img src={profileLogoUrl} alt="Company logo" style={{ maxHeight: 44, maxWidth: 120, objectFit: 'contain', background: '#fff', borderRadius: 4 }} />
                : <Tag color="orange">No logo uploaded</Tag>}
              <div style={{ minWidth: 0 }}>
                <Text strong>{companyProfile.name}</Text>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {[companyProfile.address, companyProfile.phone, companyProfile.email].filter(Boolean).join(' · ') || 'Add address and phone in Profile › Company'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {companyInfo.useCompanyInfo ? (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Row gutter={8}>
            <Col xs={24} sm={12}>
              <Input
                placeholder="Company Name"
                value={companyInfo.useCompanyProfile ? (companyProfile?.name || '') : companyInfo.companyName}
                disabled={!!companyInfo.useCompanyProfile}
                onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                prefix={<TeamOutlined />}
                maxLength={200}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Input
                placeholder="Compliance Officer"
                value={companyInfo.complianceOfficer}
                onChange={(e) => setCompanyInfo({ ...companyInfo, complianceOfficer: e.target.value })}
                prefix={<UserOutlined />}
                maxLength={120}
              />
            </Col>
          </Row>
          {!companyInfo.useCompanyProfile && (
            <>
              <Upload
                beforeUpload={(file) => {
                  if (!LOGO_TYPES.includes(file.type)) {
                    message.error('Logo must be a PNG, JPG, WEBP or GIF image');
                    return Upload.LIST_IGNORE;
                  }
                  if (file.size > 1024 * 1024) {
                    message.error('Logo must be smaller than 1 MB');
                    return Upload.LIST_IGNORE;
                  }
                  const reader = new FileReader();
                  reader.onload = (e) => setCompanyInfo((ci) => ({ ...ci, logo: e.target.result }));
                  reader.readAsDataURL(file);
                  return false;
                }}
                showUploadList={false}
                accept="image/png,image/jpeg,image/webp,image/gif"
              >
                <Button icon={<UploadOutlined />} block>
                  {companyInfo.logo ? 'Change Logo' : 'Upload Logo'}
                </Button>
              </Upload>
              {companyInfo.logo && (
                <div style={{ textAlign: 'center' }}>
                  <img src={companyInfo.logo} alt="Company Logo" style={{ maxHeight: 60 }} />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setCompanyInfo({ ...companyInfo, logo: null })}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </>
          )}
        </Space>
      ) : (
        <div style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
          <TeamOutlined style={{ fontSize: '32px', color: '#d9d9d9' }} />
          <div>Enable to include company information in documents</div>
        </div>
      )}
    </Card>
  );

  const renderDocumentGenerator = () => (
    <div className="document-generator-tab">
      <Card
        title="Document Configuration"
        className="config-card"
        extra={
          <Space>
            <Tag color="blue" style={{ fontSize: '12px' }}>
              {PLAN_PERMISSIONS[userPlan]?.name || userPlan}
            </Tag>
            <Button
              icon={<AppstoreOutlined />}
              onClick={() => setIsTemplateLibraryVisible(true)}
              size="middle"
            >
              Template Library
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => setPdfTemplateModalVisible(true)}
              size="middle"
            >
              PDF Templates
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {showQuickGuide && (
            <Alert
              type="info"
              showIcon
              closable
              onClose={dismissQuickGuide}
              message="Quick start - create a document in 4 steps"
              description={
                <ol style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                  <li><strong>Choose your industry</strong> - the document list is filtered to match it.</li>
                  <li><strong>Choose a document type</strong> - use the search box or the category filter to find it quickly.</li>
                  <li><strong>Pick a mode</strong> - "Filled Document" writes the content for you, "Empty Template" leaves blank fields.</li>
                  <li><strong>Click Generate</strong> - then review, edit, sign and download the PDF in the editor.</li>
                </ol>
              }
              style={{ marginBottom: 4 }}
            />
          )}

          {renderIndustrySelector()}
          {renderDocumentTypeSelector()}
          {renderGenerationModeSelector()}

          <Form.Item label={
            <Space>
              <EditOutlined />
              <span>Step 4 · Additional Context (optional)</span>
            </Space>
          }>
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                CONTEXT_HINTS[documentTypes.all.find(d => d.value === selectedDocumentType)?.category] ||
                CONTEXT_HINTS.default
              }
              rows={4}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={handleGenerateDocument}
            loading={loading || isGeneratingPdf}
            disabled={!selectedDocumentType}
            size="large"
            block
            style={{ height: '50px', fontSize: '16px' }}
          >
            {loading ? 'Generating...' : `Generate Professional ${generationMode === 'document' ? 'Filled' : 'Template'} PDF`}
          </Button>
          {!selectedDocumentType && (
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: -8 }}>
              Choose an industry and a document type above to enable this button.
            </Text>
          )}

          <Alert
            message="Professional PDF Generation"
            description="Documents are generated as professionally styled PDFs with industry-specific formatting and company branding."
            type="info"
            showIcon
            icon={<FilePdfOutlined />}
          />
        </Space>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          {renderCompanyInfoSection()}
        </Col>
        <Col xs={24} md={12}>
          <Card title="Usage Statistics" size="small">
            <Statistic
              title="Documents Generated"
              value={usageStats.documentsGenerated}
              prefix={<FilePdfOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Divider style={{ margin: '12px 0' }} />
            <Statistic
              title="Questions Asked"
              value={usageStats.questionsAsked}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderChatInterface = () => (
    <div className="professional-chat-interface">
      <div className="chat-header" style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Avatar size="large" icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>Safety AI Assistant</Title>
            <Text type="secondary">
              {aiSystemStatus.status === 'operational' ? '🟢 Online' : '🟡 Optimizing'}
              • Plan: {PLAN_PERMISSIONS[userPlan]?.name || userPlan}
            </Text>
          </div>
        </Space>
        <Button icon={<SettingOutlined />} onClick={() => setIsSettingsDrawerVisible(true)}>
          Settings
        </Button>
      </div>

      <div className="chat-suggestions" style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong>Quick suggestions:</Text>
        <Space wrap style={{ marginTop: '8px' }}>
          {chatSuggestions.map((suggestion, index) => (
            <Tag key={index} color="blue" onClick={() => setPrompt(suggestion)} style={{ cursor: 'pointer' }}>
              {suggestion}
            </Tag>
          ))}
        </Space>
      </div>

      <div className="chat-messages-container" style={{ height: '400px', overflow: 'auto', padding: '16px' }}>
        {conversation.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.type}-message`} style={{ marginBottom: '16px' }}>
            <div className="message-header">
              <Space>
                <Avatar size="small" icon={msg.type === 'ai' ? <RobotOutlined /> : <UserOutlined />} />
                <strong>{msg.type === 'ai' ? 'Safety AI' : 'You'}</strong>
                {msg.type === 'ai' && msg.personality && (
                  <Tag size="small" color="purple">{msg.personality}</Tag>
                )}
                <Text type="secondary">{moment(msg.timestamp).format('HH:mm')}</Text>
              </Space>
            </div>
            <div className="message-content" style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
            {msg.type === 'ai' && (
              <div className="message-actions" style={{ marginTop: '8px' }}>
                <Space size="small">
                  <Button size="small" icon={<LikeOutlined />} onClick={() => handleLikeResponse(msg.id)}>
                    {msg.likes || 0}
                  </Button>
                  <Button size="small" icon={<CopyOutlined />} onClick={() => handleCopyToClipboard(msg.content)}>
                    Copy
                  </Button>
                  <Button size="small" icon={<SaveOutlined />} onClick={() => handleSaveResponse(msg.id)}>
                    Save
                  </Button>
                </Space>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container" style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <TextArea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your question... (Ctrl+Enter to send)"
            rows={3}
            style={{ flex: 1 }}
            onPressEnter={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={loading}
            size="large"
            style={{ height: 'auto' }}
          />
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          <Tag icon={<GlobalOutlined />} color="blue">
            {industryOptions.find(ind => ind.value === selectedIndustry)?.label}
          </Tag>
          <Tag icon={<UserOutlined />} color="green">
            {aiPersonality}
          </Tag>
          <span style={{ marginLeft: '8px' }}>Press Ctrl+Enter to send</span>
        </div>
      </div>
    </div>
  );

 // ============= HISTORY TAB RENDER FUNCTION =============
const renderHistoryTab = () => (
  <div className="history-tab">
    <Tabs defaultActiveKey="chat" type="card">
      <TabPane 
        tab={
          <span>
            <MessageOutlined /> 
            Chat History 
            <Badge count={chatSessions.length} showZero={false} style={{ marginLeft: 8 }} />
          </span>
        } 
        key="chat"
      >
        <Card>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Your Chat Sessions</Text>
            <Space>
              <Button 
                size="small" 
                icon={<SyncOutlined />} 
                onClick={loadChatSessions}
                loading={chatHistoryLoading}
              >
                Refresh
              </Button>
              <Button 
                size="small" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => {
                  Modal.confirm({
                    title: 'Clear All Chat History?',
                    content: 'This will delete all chat sessions. This action cannot be undone.',
                    okText: 'Clear All',
                    cancelText: 'Cancel',
                    okButtonProps: { danger: true },
                    onOk: async () => {
                      await aiStorageService.clearChatHistory();
                      setChatSessions([]);
                      message.success('All chat history cleared');
                    }
                  });
                }}
              >
                Clear All
              </Button>
            </Space>
          </div>
          
          {chatSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <MessageOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">No chat sessions found</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>Start a new chat to save your conversation</Text>
              </div>
            </div>
          ) : (
            <List
              loading={chatHistoryLoading}
              dataSource={chatSessions}
              renderItem={session => {
                const firstMessage = session.messages?.[0]?.content || '';
                const preview = firstMessage.length > 60 ? firstMessage.substring(0, 60) + '...' : firstMessage;
                const messageCount = session.messages?.length || 0;
                const isCurrentSession = session.sessionId === sessionId;
                
                return (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      backgroundColor: isCurrentSession ? '#e6f7ff' : 'transparent',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: isCurrentSession ? '1px solid #1890ff' : '1px solid #f0f0f0',
                      marginBottom: '8px',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => restoreChatSession(session)}
                    actions={[
                      <Button 
                        key="delete" 
                        type="text" 
                        size="small" 
                        icon={<DeleteOutlined />} 
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatSession(session.sessionId);
                        }}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<MessageOutlined />} 
                          style={{ 
                            backgroundColor: isCurrentSession ? '#1890ff' : '#8c8c8c',
                            color: 'white'
                          }} 
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{preview || 'New Chat'}</Text>
                          {isCurrentSession && <Tag color="blue">Current</Tag>}
                          <Tag color="green">{session.metadata?.industry || 'General'}</Tag>
                        </Space>
                      }
                      description={
                        <Space size="middle">
                          <span>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {new Date(session.metadata?.lastUpdated || session.timestamp).toLocaleString()}
                          </span>
                          <span>
                            <MessageOutlined style={{ marginRight: 4 }} />
                            {messageCount} messages
                          </span>
                          {session.metadata?.personality && (
                            <Tag size="small" color="purple">{session.metadata.personality}</Tag>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
              pagination={{ 
                pageSize: 10, 
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} sessions`
              }}
            />
          )}
        </Card>
      </TabPane>
      
      <TabPane 
        tab={
          <span>
            <FolderOpenOutlined /> 
            Saved Documents 
            <Badge count={documentHistory.length} showZero={false} style={{ marginLeft: 8 }} />
          </span>
        } 
        key="documents"
      >
        <Card>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Your Saved Documents</Text>
            <Space wrap>
              <AutoAddSwitch kind="ai" label="Always add new documents to Document Management" />
              <Button 
                size="small" 
                icon={<SyncOutlined />} 
                onClick={loadSavedDocuments}
              >
                Refresh
              </Button>
            </Space>
          </div>
          
          {documentHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FolderOpenOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">No saved documents</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>Generate and save documents to see them here</Text>
              </div>
            </div>
          ) : (
            <List
              dataSource={documentHistory}
              renderItem={doc => (
                <List.Item
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    marginBottom: '8px'
                  }}
                  actions={[
                    <Button 
                      key="view" 
                      size="small" 
                      icon={<EyeOutlined />} 
                      onClick={() => {
                        setCurrentDocument(doc);
                        setPdfContent(getDocHtml(doc) || doc.preview);
                        setPdfPreviewVisible(true);
                        setIsPDFEditorExpanded(false);
                      }}
                    >
                      View
                    </Button>,
                    <Button 
                      key="download" 
                      size="small" 
                      icon={<DownloadOutlined />} 
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      Download
                    </Button>,
                    <SendToDocumentControl
                      key="to-dm"
                      title={doc.title}
                      html={getDocHtml(doc) || doc.preview || ''}
                      documentType={String(doc.type || 'report').toLowerCase().replace(/[^a-z0-9]+/g, '_')}
                      meta={{ industry: doc.industry, ai_document_id: doc.id }}
                    />,
                    <Popconfirm
                      key="delete"
                      title="Delete this document?"
                      onConfirm={async () => {
                        await aiStorageService.deleteDocument(doc.id);
                        setDocumentHistory(prev => prev.filter(d => d.id !== doc.id));
                        message.success('Document deleted');
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button size="small" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: doc.color || '#fa8c16',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FilePdfOutlined style={{ fontSize: '20px', color: 'white' }} />
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{doc.title}</Text>
                        <Tag color={doc.generationMode === 'document' ? 'blue' : 'orange'}>
                          {doc.generationMode === 'document' ? 'Filled' : 'Template'}
                        </Tag>
                        {doc._savedToDb && <Tag color="green">Saved</Tag>}
                      </Space>
                    }
                    description={
                      <Space size="middle">
                        <span><Tag color="blue">{doc.type}</Tag></span>
                        <span><Tag color="green">{doc.industry}</Tag></span>
                        <span><ClockCircleOutlined /> {doc.date}</span>
                        <span><FileTextOutlined /> {doc.size}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              pagination={{ 
                pageSize: 10,
                showTotal: (total) => `Total ${total} documents`
              }}
            />
          )}
        </Card>
      </TabPane>
    </Tabs>
  </div>
);


  // ============= MAIN PDF EDITOR MODAL (UPDATED WITH NEW PDF EDITOR) =============
  const renderAdvancedPdfEditor = () => (
    <Modal
      title={
        <Space>
          <FilePdfOutlined />
          <span>PDF Document Editor</span>
          <Tag color={isPDFEditorExpanded ? 'blue' : 'green'}>
            {isPDFEditorExpanded ? '✏️ Edit Mode' : '📄 View Mode'}
          </Tag>
          <Tooltip title={isPDFEditorExpanded ? 'Click toggle to collapse tools' : 'Click toggle to expand tools'}>
            <Button 
              size="small" 
              icon={isPDFEditorExpanded ? <CompressOutlined /> : <ExpandOutlined />} 
              onClick={() => setIsPDFEditorExpanded(!isPDFEditorExpanded)}
              type={isPDFEditorExpanded ? 'primary' : 'default'}
            />
          </Tooltip>
        </Space>
      }
      open={pdfPreviewVisible}
      onCancel={() => {
        if (isEditingText) {
          Modal.confirm({
            title: 'Exit without saving?',
            content: 'You have unsaved changes. Do you want to exit?',
            onOk: () => {
              setIsEditingText(false);
              setPdfPreviewVisible(false);
              setIsPDFEditorExpanded(false);
            }
          });
        } else {
          setPdfPreviewVisible(false);
          setIsPDFEditorExpanded(false);
        }
      }}
      width="95%"
      style={{ maxWidth: 1400, top: 20 }}
      footer={null}
      bodyStyle={{ padding: 0, height: '88vh' }}
    >
      <div style={{ height: '100%', padding: '8px' }}>
        <PDFEditor
          initialContent={pdfContent}
          onSave={handlePDFEditorSave}
          onExport={handlePDFEditorExport}
          readOnly={false}
          defaultExpanded={isPDFEditorExpanded}
        />
      </div>
    </Modal>
  );

  // PDF Template Manager Modal
  const renderPdfTemplateManagerModal = () => (
    <Modal
      title="PDF Templates"
      open={pdfTemplateModalVisible}
      onCancel={() => setPdfTemplateModalVisible(false)}
      width={600}
      footer={[
        <Button key="cancel" onClick={() => setPdfTemplateModalVisible(false)}>Cancel</Button>,
        <Button key="save" type="primary" onClick={handleSavePdfTemplate} disabled={!templateName}>Save Template</Button>
      ]}
    >   

      <Tabs>
        <TabPane tab="Saved Templates" key="saved">
          {pdfTemplates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <FilePdfOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <p>No templates saved</p>
              <Text type="secondary">Generate a document and save it as a template</Text>
            </div>
          ) : (
            <List
              dataSource={pdfTemplates}
              renderItem={template => (
                <List.Item
                  actions={[
                    <Button key="use" size="small" onClick={() => handleUsePdfTemplate(template)}>Use</Button>,
                    <Button key="delete" size="small" danger onClick={() => handleDeletePdfTemplate(template.id)}>Delete</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FilePdfOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />}
                    title={template.name}
                    description={<Space direction="vertical" size={2}>
                      <Text type="secondary">{template.description}</Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>Created: {new Date(template.createdAt).toLocaleDateString()}</Text>
                    </Space>}
                  />
                </List.Item>
              )}
            />
          )}
        </TabPane>
        <TabPane tab="Save Current" key="save">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input placeholder="Template name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} prefix={<FilePdfOutlined />} />
            <TextArea placeholder="Description" value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} rows={3} />
            <Row gutter={8}>
              <Col span={12}>
                <Select value={templateIndustry} onChange={setTemplateIndustry} style={{ width: '100%' }} placeholder="Industry">
                  {industryOptions.map(ind => (<Option key={ind.value} value={ind.value}>{ind.label}</Option>))}
                </Select>
              </Col>
              <Col span={12}>
                <Select value={templateDocType} onChange={setTemplateDocType} style={{ width: '100%' }} placeholder="Document Type">
                  {availableDocs.map(doc => (<Option key={doc.value} value={doc.value}>{doc.label}</Option>))}
                </Select>
              </Col>
            </Row>
            <Radio.Group value={templateVisibility} onChange={(e) => setTemplateVisibility(e.target.value)}>
              <Radio value="private">Private</Radio>
              <Radio value="team">Team</Radio>
              <Radio value="public">Public</Radio>
            </Radio.Group>
          </Space>
        </TabPane>
      </Tabs>
    </Modal>
  );

  // Template Library Modal
  const renderTemplateLibraryModal = () => {
    const libraryDocs = libraryShowAll ? availableDocs : getDocsForIndustry(selectedIndustry);
    const industryLabel = industryOptions.find(ind => ind.value === selectedIndustry)?.label || prettyIndustry(selectedIndustry);

    return (
    <Modal
      title="Template Library"
      open={isTemplateLibraryVisible}
      onCancel={() => setIsTemplateLibraryVisible(false)}
      width={800}
      footer={null}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <Text type="secondary">
          {libraryShowAll
            ? `Showing all ${libraryDocs.length} documents from every industry.`
            : `Showing ${libraryDocs.length} documents available for ${industryLabel}.`}
        </Text>
        <Space>
          <Text>Show all industries</Text>
          <Switch size="small" checked={libraryShowAll} onChange={setLibraryShowAll} />
        </Space>
      </div>
      <Row gutter={[16, 16]}>
        {libraryDocs.map(template => {
          const permission = checkDocumentPermission(template.value, userPlan, documentTypes);
          return (
            <Col xs={24} sm={12} md={8} key={template.value}>
              <Card
                size="small"
                hoverable
                onClick={() => {
                  if (permission.allowed) {
                    // Picking an industry-specific document from "all industries" switches the industry to match
                    if (!docMatchesIndustry(template, selectedIndustry) && template.industries?.length) {
                      setSelectedIndustry(template.industries[0]);
                    }
                    setSelectedDocumentType(template.value);
                    setIsTemplateLibraryVisible(false);
                    message.success(`Selected: ${template.label}`);
                  } else {
                    setUpgradeInfo({
                      requiredPlan: permission.requiredPlan,
                      currentPlan: permission.currentPlan,
                      documentName: template.label,
                      features: getPlanFeatures(permission.requiredPlan)
                    });
                    setShowUpgradeModal(true);
                  }
                }}
                style={{ borderColor: template.color, opacity: permission.allowed ? 1 : 0.6 }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: template.color }}>{template.icon}</div>
                  <Text strong>{template.label}</Text>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{template.description}</div>
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="blue">{template.estimated_time}</Tag>
                    {template.plan_required !== 'free' && <Tag color={template.plan_required === 'pro' ? 'gold' : 'cyan'}>{template.plan_required.toUpperCase()}</Tag>}
                  </div>
                  {!permission.allowed && <LockOutlined style={{ color: '#faad14', marginTop: '8px' }} />}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Modal>
    );
  };

  // Upgrade Modal
  const renderUpgradeModal = () => (
    <Modal
      title={<Space><LockOutlined /><span>Upgrade Required</span><Tag color="orange">{upgradeInfo.requiredPlan?.toUpperCase()}</Tag></Space>}
      open={showUpgradeModal}
      onCancel={() => setShowUpgradeModal(false)}
      width={500}
      footer={[
        <Button key="cancel" onClick={() => setShowUpgradeModal(false)}>Maybe Later</Button>,
        <Button key="upgrade" type="primary" onClick={() => window.location.href = '/billing'}>Upgrade Now</Button>
      ]}
    >
      <Alert message={`${upgradeInfo.documentName} requires ${upgradeInfo.requiredPlan?.toUpperCase()} plan`} description={`Your current plan: ${upgradeInfo.currentPlan?.toUpperCase() || 'FREE'}`} type="warning" showIcon style={{ marginBottom: 16 }} />
      <Title level={5}>Features included:</Title>
      <ul>{upgradeInfo.features?.map((feature, index) => (<li key={index}><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />{feature}</li>))}</ul>
    </Modal>
  );

  // Help / instructions modal
  const renderHelpModal = () => (
    <Modal
      title={<Space><QuestionCircleOutlined /><span>How to use this page</span></Space>}
      open={isHelpVisible}
      onCancel={() => setIsHelpVisible(false)}
      footer={[
        <Button key="generator" onClick={() => { setIsHelpVisible(false); setActiveTab('generator'); }}>
          Go to PDF Generator
        </Button>,
        <Button key="close" type="primary" onClick={() => setIsHelpVisible(false)}>
          Got it
        </Button>
      ]}
      width={680}
    >
      <Collapse defaultActiveKey={['1']} ghost>
        <Panel header="Create a document" key="1">
          <ol style={{ paddingLeft: 18, margin: 0 }}>
            <li>Open the <strong>PDF Generator</strong> tab.</li>
            <li>Choose your <strong>industry</strong>. The document list only shows documents available for that industry (plus the general ones that suit every industry).</li>
            <li>Choose a <strong>document type</strong>. Type in the box to search, or use the category filter inside the list.</li>
            <li>Pick <strong>Filled Document</strong> (content written for you) or <strong>Empty Template</strong> (blank fields to complete by hand).</li>
            <li>Optionally add <strong>context</strong> - site, task, hazards - to make the result more specific.</li>
            <li>Click <strong>Generate</strong>. The editor opens so you can edit, sign and download the PDF.</li>
          </ol>
        </Panel>
        <Panel header="Why can't I see a document?" key="2">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>Documents are filtered by industry. Change the industry to see its specialised documents.</li>
            <li>With <em>General Industry</em> selected, only the general documents are shown.</li>
            <li>A lock icon means the document needs a higher plan. Click it in the Template Library to see the upgrade options.</li>
            <li>The category filter can hide documents - set it back to "All Documents".</li>
          </ul>
        </Panel>
        <Panel header="Tips for better documents" key="3">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>Turn on <strong>Company Information</strong> to add your name, logo and compliance officer to every document.</li>
            <li>The more detail you add in Additional Context, the more specific the document will be.</li>
            <li>If no ready-made template exists for a document, a basic editable template is created for you to complete.</li>
            <li>Save a finished layout as a <strong>PDF Template</strong> to reuse it later.</li>
          </ul>
        </Panel>
        <Panel header="Chat assistant" key="4">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>Ask about hazards, regulations, permits or which document you need.</li>
            <li>Use the Settings button in the chat to change the assistant's style and level of detail.</li>
            <li>Chats and generated documents are kept in the <strong>History</strong> tab.</li>
          </ul>
        </Panel>
      </Collapse>
    </Modal>
  );

  // Settings Drawer
  const renderSettingsDrawer = () => (
    <Drawer title="AI Assistant Settings" placement="right" onClose={() => setIsSettingsDrawerVisible(false)} open={isSettingsDrawerVisible} width={400}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <h4><SettingOutlined /> Account Information</h4>
          <div><Text strong>Plan: </Text><Tag color="purple">{PLAN_PERMISSIONS[userPlan]?.name || userPlan}</Tag></div>
        </div>
        <Divider />
        <div>
          <h4><RobotOutlined /> AI Personality</h4>
          <Radio.Group value={aiPersonality} onChange={(e) => setAiPersonality(e.target.value)}>
            <Space direction="vertical">
              {personalityOptions.map(opt => (
                <Radio key={opt.value} value={opt.value}>
                  <div><strong>{opt.label}</strong><div style={{ fontSize: '12px', color: '#666' }}>{opt.description}</div></div>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>
        <Divider />
        <div>
          <h4><DashboardOutlined /> Response Detail</h4>
          <Slider min={1} max={4} value={responseDetail} onChange={setResponseDetail} marks={{ 1: 'Brief', 2: 'Standard', 3: 'Detailed', 4: 'Technical' }} />
        </div>
        <Divider />
        <div>
          <h4><InfoCircleOutlined /> System Status</h4>
          <div><div><Text strong>Status:</Text> <Tag color={aiSystemStatus.status === 'operational' ? 'green' : 'orange'}>{aiSystemStatus.status}</Tag></div>
          <div><Text strong>Response Time:</Text> {aiSystemStatus.response_time}</div>
          <div><Text strong>Uptime:</Text> {aiSystemStatus.uptime}</div>
          <div><Text strong>Models:</Text> {aiSystemStatus.models_loaded ? 'Loaded' : 'Not loaded'}</div></div>
        </div>
      </Space>
    </Drawer>
  );

  // ============= MAIN RENDER =============

  return (
  <div className="ai-documents-page">
    <Card>
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" tabBarExtraContent={
        <Space>
         
          <Button icon={<QuestionCircleOutlined />} onClick={() => setIsHelpVisible(true)} size="small">Help</Button>
          <Button icon={<SyncOutlined />} onClick={checkAISystemStatus} size="small">Refresh</Button>
        </Space>
      }>
        <TabPane tab={<span><WechatOutlined /> Chat</span>} key="chat">
          {renderChatInterface()}
        </TabPane>
        <TabPane tab={<span><FilePdfOutlined /> PDF Generator</span>} key="generator">
          {renderDocumentGenerator()}
        </TabPane>
        {/* Exams, certificates & verification live in AIExamCertificate.js.
            forceRender keeps it mounted so the floating Exam button always works. */}
        <TabPane tab={<span><ExperimentOutlined /> Exams & Verification</span>} key="tools" forceRender>
          <AIExamCertificate
            ref={examRef}
            userPlan={userPlan}
            selectedIndustry={selectedIndustry}
            companyInfo={companyInfo}
            documentTypes={documentTypes}
            setUpgradeInfo={setUpgradeInfo}
            setShowUpgradeModal={setShowUpgradeModal}
          />
        </TabPane>

        <TabPane 
          tab={
            <span>
              <HistoryOutlined /> 
              History 
              <Badge 
                count={chatSessions.length + documentHistory.length} 
                showZero={false} 
                style={{ marginLeft: 8 }}
              />
            </span>
          } 
          key="history"
        >
          {renderHistoryTab()}
        </TabPane>
      </Tabs>
    </Card>


      {/* Modals */}
      {renderAdvancedPdfEditor()}
      {renderPdfTemplateManagerModal()}
      {renderTemplateLibraryModal()}
      {renderUpgradeModal()}
      {renderSettingsDrawer()}
      {renderHelpModal()}

      {/* Floating Action Button */}
      <FloatButton.Group shape="square" style={{ right: 24 }}>
        <FloatButton icon={<FilePdfOutlined />} tooltip="PDF Generator" onClick={() => setActiveTab('generator')} />
        <FloatButton icon={<MessageOutlined />} tooltip="Chat" onClick={() => setActiveTab('chat')} />
        <FloatButton icon={<SafetyCertificateOutlined />} tooltip="Exam" onClick={() => examRef.current?.startExam()} />
        <FloatButton icon={<QuestionCircleOutlined />} tooltip="Help" onClick={() => setIsHelpVisible(true)} />
        <FloatButton.BackTop visibilityHeight={0} />
      </FloatButton.Group>
    </div>
  );
}

export default AIDocumentsPage;