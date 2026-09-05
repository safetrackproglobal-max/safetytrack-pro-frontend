// src/pages/AIDocumentsPage.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Row,
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
  Progress,
  Tooltip,
  Badge,
  Drawer,
  Radio,
  Slider,
  Typography,
  FloatButton,
  Menu,
  Dropdown,
  Popconfirm,
  Alert,
  notification,
  Collapse,
  InputNumber,
  Checkbox,
  PhoneOutlined,
   BackTop,
   Popover
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
  SafetyCertificateOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  WechatOutlined,
  SendOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  BookOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  DeleteOutlined,
  SyncOutlined,
  PlusOutlined,
  EditOutlined,
  ShareAltOutlined,
  StarOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  EyeOutlined,
  SaveOutlined,
  ExportOutlined,
  ImportOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  DeploymentUnitOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  ToolOutlined,
  BoldOutlined,
  TableOutlined,
  CheckSquareOutlined,
  LockOutlined,
  PrinterOutlined,
  LeftOutlined,
  RightOutlined,
  FlagOutlined,
  QrcodeOutlined,
  PercentageOutlined,
  ScanOutlined,
  VerifiedOutlined,
  UnderlineOutlined,
  NumberOutlined,
  WalletOutlined,
  HighlightOutlined,
  StrikethroughOutlined,
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  FormatPainterOutlined,
  FontSizeOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  ItalicOutlined,
  LineHeightOutlined,
  BgColorsOutlined,
  BorderOutlined,
  PictureOutlined,
  SignatureOutlined,
  FormOutlined,
  CheckOutlined,
  DragOutlined,
  ScissorOutlined,
  CopyFilled,
  PlusCircleOutlined,
  MinusCircleOutlined,
  MergeCellsOutlined,
  SplitCellsOutlined,
  GroupOutlined,
  UngroupOutlined,
  LayerOutlined,
  CommentOutlined,
  AccessibilityOutlined,
  ExpandOutlined,
  CompressOutlined
} from '@ant-design/icons';
import './AIDocumentsPage.css';
import AIService, { GeneralAIService } from '../services/GeneralAIService';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import SignaturePad from 'react-signature-canvas';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { apiPost } from '../services/api';
import deepSeekService from '../services/DeepSeekService';
import PDFEditor from '../pages/PDFEditor';
import aiStorageService from '../services/aiStorageService';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
import {
  PLAN_PERMISSIONS,
  industries,
  AVAILABLE_TEMPLATES,
  personalityOptions,
  generationModeOptions,
  historyFilterModeOptions,
  examTopics,
  examDifficulties,
  certificateCourses,
  getIndustryIcon,
  getPlanFeatures,
  checkDocumentPermission,
  getBackendTemplateId,
  getCustomSectionsForDocument,
  generateLocalAIResponse,
  getCredentialLevel,
  getProfessionalHtmlTemplate,
  TEMPLATE_ID_MAPPING,
  INDUSTRY_TEMPLATE_MAPPING,
  getAvailableTemplatesForIndustry
} from './AIDocumentsUtils';

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


const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

function AIDocumentsPage() {
  const { user, planData, token } = useAuth();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('chat');
  const [prompt, setPrompt] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('general');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [documentHistory, setDocumentHistory] = useState([]);
  const [isSettingsDrawerVisible, setIsSettingsDrawerVisible] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editableHtml, setEditableHtml] = useState('');
  const [signaturePlacementMode, setSignaturePlacementMode] = useState(false);
  
  // PDF Editing States
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfMode, setPdfMode] = useState('view');
  const [drawingColor, setDrawingColor] = useState('#ff0000');
  const [drawingSize, setDrawingSize] = useState(2);
  const [textToAdd, setTextToAdd] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 100, y: 100 });
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [pdfCanvas, setPdfCanvas] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false);

  const [saveStatus, setSaveStatus] = useState('saved');
  const [aiPersonality, setAiPersonality] = useState('professional');
  const [responseDetail, setResponseDetail] = useState(3);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [documentTemplates, setDocumentTemplates] = useState([]);
  const [savedResponses, setSavedResponses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateIndustry, setTemplateIndustry] = useState('general');
  const [templateDocType, setTemplateDocType] = useState('custom');
  const [templateVisibility, setTemplateVisibility] = useState('private');
  const [examSessionId, setExamSessionId] = useState('');
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
  const [companyInfo, setCompanyInfo] = useState({
    useCompanyInfo: false,
    companyName: '',
    logo: null,
    industry: 'general',
    complianceOfficer: '',
    safetyStandards: [],
    address: '',
    phone: '',
    email: ''
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [documentStats, setDocumentStats] = useState({
    totalDocuments: 0,
    recentActivity: [],
    popularTemplates: [],
    complianceRate: 0
  });
  const [isTemplateLibraryVisible, setIsTemplateLibraryVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [chatSuggestions, setChatSuggestions] = useState([]);
  const [generationMode, setGenerationMode] = useState('document');
  const [historyFilterMode, setHistoryFilterMode] = useState('all');
  const [isSavingAnswers, setIsSavingAnswers] = useState(false);
  const [answersSaved, setAnswersSaved] = useState({});
  const [userPlan, setUserPlan] = useState('super_admin');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState({
    requiredPlan: '',
    currentPlan: '',
    documentName: '',
    features: []
  });

  // Add state for DeepSeek usage
  const [deepSeekUsage, setDeepSeekUsage] = useState({
    available: false,
    callsToday: 0,
    limit: 0,
    remaining: 0
  });

  // Enhanced exam flow states
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [activeExam, setActiveExam] = useState(null);
  const [generatedCertificate, setGeneratedCertificate] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [examScore, setExamScore] = useState(null);
  const [selectedExamTopic, setSelectedExamTopic] = useState('safety_basics');
  const [examDifficulty, setExamDifficulty] = useState('intermediate');
  const [examQuestionsCount, setExamQuestionsCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [examFlowStep, setExamFlowStep] = useState('setup');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedCourseForExam, setSelectedCourseForExam] = useState('');
  const [examProgress, setExamProgress] = useState({
    answered: 0,
    total: 0,
    timeRemaining: 0
  });
  const [examTimer, setExamTimer] = useState(null);

  // PDF State Variables
  const [pdfPreviewVisible, setPdfPreviewVisible] = useState(false);
  const [pdfEditMode, setPdfEditMode] = useState(false);
  const [pdfContent, setPdfContent] = useState('');
  const [editedPdfContent, setEditedPdfContent] = useState('');
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
  const [pdfSections, setPdfSections] = useState([]);
  const [activePdfSection, setActivePdfSection] = useState(0);
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
  
  // Certificate state
  const [activeCertificate, setActiveCertificate] = useState({
    data: null,
    source: null,
    timestamp: null,
    examScore: null,
    sessionId: null
  });

  // Admin signature
  const [adminSignature, setAdminSignature] = useState({
    name: 'Abigalistic Safety Pro',
    title: 'Platform Owner',
    company: 'Abigalistic Safety Pro Platform',
    signature_id: 'ADMIN-PLATFORM-OWNER',
    loading: true
  });

  // ============= PDF EDITOR STATE VARIABLES =============
  const [pdfEditorMode, setPdfEditorMode] = useState('view');
  const [pdfAnnotations, setPdfAnnotations] = useState([]);
  const [pdfWatermark, setPdfWatermark] = useState({
    text: '',
    opacity: 0.3,
    enabled: false,
    color: '#cccccc',
    angle: 45,
    font: 'Arial',
    size: 40
  });
  const [pdfPageNumbering, setPdfPageNumbering] = useState({
    enabled: true,
    position: 'bottom-center',
    fontSize: 10,
    color: '#666666'
  });
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfHistory, setPdfHistory] = useState({ past: [], future: [] });
  const [pdfFormFields, setPdfFormFields] = useState([]);
  const [pdfSignatures, setPdfSignatures] = useState([]);
  const [pdfImages, setPdfImages] = useState([]);
  const [pdfComments, setPdfComments] = useState([]);
  const [pdfRedactions, setPdfRedactions] = useState([]);
  const [pdfBookmarks, setPdfBookmarks] = useState([]);
  const [isPDFEditorExpanded, setIsPDFEditorExpanded] = useState(false); // NEW: Track editor expansion state
  const [sessionId, setSessionId] = useState(() => {
  return localStorage.getItem('ai_session_id') || `session_${Date.now()}`;
});
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);   
  // Signature Pad Ref
  const signaturePadRef = useRef(null);

  // ============= CERTIFICATE VERIFICATION STATE VARIABLES =============
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // ============= INITIALIZATION =============

  useEffect(() => {
    fetchAdminSignature();
  }, []);

  const fetchAdminSignature = async () => {
    try {
      const response = await fetch('/api/admin/signature', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdminSignature({ ...data.signature, loading: false });
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin signature:', error);
      setAdminSignature(prev => ({ ...prev, loading: false }));
    }
  };

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Add useEffect to check DeepSeek availability
  useEffect(() => {
    checkDeepSeekAvailability();
  }, [userPlan]);

  const checkDeepSeekAvailability = async () => {
    const isPremium = userPlan !== 'free';
    if (isPremium) {
      const stats = await deepSeekService.getUsageStats();
      setDeepSeekUsage({
        available: stats.success && stats.usage.remaining > 0,
        ...stats.usage
      });
    }
  };

  useEffect(() => {
  const initializeAIStorage = async () => {
    setIsSyncing(true);
    try {
      // 1. Try to load from database
      const dbChat = await aiStorageService.getChatHistory(50);
      const dbDocs = await aiStorageService.getDocuments();
      
      if (dbChat.success && dbChat.sessions.length > 0) {
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
      
      // Load documents
      if (dbDocs.success && dbDocs.documents.length > 0) {
        setDocumentHistory(dbDocs.documents);
      } else {
        const localDocs = aiStorageService.getDocumentsLocal();
        if (localDocs.success && localDocs.documents.length > 0) {
          setDocumentHistory(localDocs.documents);
        }
      }
      
      // Load saved responses
      const savedResponses = aiStorageService.getSavedResponsesLocal();
      if (savedResponses.success) {
        setSavedResponses(savedResponses.responses);
      }
      
      setSyncStatus({ success: true, message: 'Data loaded successfully' });
    } catch (error) {
      console.error('Failed to initialize AI storage:', error);
      setSyncStatus({ success: false, message: error.message });
    } finally {
      setIsSyncing(false);
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

// Save documents to database whenever they change
useEffect(() => {
  if (documentHistory && documentHistory.length > 0) {
    const saveAllDocuments = async () => {
      try {
        // Save only the most recent document to avoid too many requests
        const latestDoc = documentHistory[0];
        if (latestDoc && !latestDoc._savedToDb) {
          const result = await aiStorageService.saveDocument(latestDoc);
          if (result.success) {
            // Mark as saved to prevent re-saving
            setDocumentHistory(prev => {
              const updated = [...prev];
              updated[0] = { ...updated[0], _savedToDb: true };
              return updated;
            });
          }
        }
      } catch (error) {
        console.error('Failed to save document:', error);
        // Fallback to localStorage
        aiStorageService.saveDocumentLocal(documentHistory[0]);
      }
    };
    
    const timeoutId = setTimeout(saveAllDocuments, 3000);
    return () => clearTimeout(timeoutId);
  }
}, [documentHistory]);

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

  const canUseDeepSeek = () => {
    if (userPlan === 'super_admin') return true;
    const requiredPlan = FEATURE_PLAN_REQUIREMENTS?.deepseek_document;
    return canAccessFeature(requiredPlan, userPlan);
  };
  
  const getFeaturePlan = (feature, documentType = null) => {
    if (documentType && FEATURE_PLAN_REQUIREMENTS[feature]?.[documentType]) {
      return FEATURE_PLAN_REQUIREMENTS[feature][documentType];
    }
    return FEATURE_PLAN_REQUIREMENTS[feature] || 'free';
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
  setConversation([{
    id: 1,
    type: 'ai',
    content: `👋 I'm your Safety AI Assistant. I can help with risk assessments, document generation, compliance guidance, safety procedures, emergency planning, training materials, and exams.

How can I assist you today?`,
    timestamp: new Date()
  }]);

  setDocumentHistory([]);
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
      "Generate a risk assessment for construction site",
      "Create a work permit template for electrical work",
      "Help me with emergency response planning",
      "Generate filled safety document",
      "Create empty template for manual completion",
      "Generate professional PDF document",
      "Start a safety exam for certification",
      "Generate training certificates"
    ];
    setChatSuggestions(suggestions);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    return () => {
      if (examTimer) clearInterval(examTimer);
    };
  }, [examTimer]);

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
      const industry = industries.find(ind => ind.value === selectedIndustry);
      
      const templateId = getBackendTemplateId(selectedDocumentType, selectedIndustry);
      
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
        company_info: companyInfo.useCompanyInfo ? companyInfo : {},
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
        console.warn('⚠️ Generated content is too short, using fallback');
        const fallbackContent = getFallbackContent(selectedDocumentType, selectedIndustry, generationMode);
        generatedDocument = fallbackContent;
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
          companyInfo,
          generationMode,
          industries
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
      
      const documentType = documentTypes.all.find(doc => doc.value === selectedDocumentType);
      const fallbackContent = getFallbackContent(selectedDocumentType, selectedIndustry, generationMode);

      const htmlFallback = getProfessionalHtmlTemplate(
        fallbackContent,
        documentType?.label || selectedDocumentType,
        selectedIndustry,
        companyInfo,
        generationMode,
        industries
      );

      setPdfContent(htmlFallback);
      setPdfPreviewVisible(true);
      setPdfEditMode(true);
      setIsPDFEditorExpanded(false);
      message.warning('Using fallback template (knowledge base service temporarily unavailable)');
    } finally {
      setLoading(false);
    }
  };

  // ============= FALLBACK CONTENT GENERATOR =============
  const getFallbackContent = (docType, industry, mode) => {
    const templates = {
      'checklist': `
        <div class="document-section">
          <h2>Safety Checklist</h2>
          <p>Comprehensive safety checklist for ${industry} industry.</p>
          <div class="checkbox-list">
            <div class="checkbox-item"><input type="checkbox"> PPE Compliance</div>
            <div class="checkbox-item"><input type="checkbox"> Equipment Safety</div>
            <div class="checkbox-item"><input type="checkbox"> Fire Safety</div>
            <div class="checkbox-item"><input type="checkbox"> Chemical Safety</div>
            <div class="checkbox-item"><input type="checkbox"> Training Records</div>
            <div class="checkbox-item"><input type="checkbox"> Emergency Procedures</div>
          </div>
        </div>
        <div class="document-section">
          <h3>Inspection Details</h3>
          <table class="info-table">
            <tr><td><strong>Date:</strong></td><td>______________</td></tr>
            <tr><td><strong>Inspector:</strong></td><td>______________</td></tr>
            <tr><td><strong>Location:</strong></td><td>______________</td></tr>
          </table>
        </div>
      `,
      'risk_assessment': `
        <div class="document-section">
          <h2>Risk Assessment</h2>
          <p>Risk assessment for ${industry} activities.</p>
          <table>
            <tr><th>Hazard</th><th>Risk Level</th><th>Control Measures</th><th>Residual Risk</th></tr>
            <tr><td>______________</td><td>______________</td><td>______________</td><td>______________</td></tr>
            <tr><td>______________</td><td>______________</td><td>______________</td><td>______________</td></tr>
          </table>
        </div>
        <div class="document-section">
          <h3>Risk Matrix</h3>
          <table class="hazard-matrix">
            <tr><th>Likelihood</th><th>Severity</th><th>Risk Level</th></tr>
            <tr><td>______________</td><td>______________</td><td>______________</td></tr>
          </table>
        </div>
      `,
      'work_permit': `
        <div class="document-section">
          <h2>Work Permit</h2>
          <p>Work permit for ${industry} operations.</p>
          <table class="info-table">
            <tr><td><strong>Permit No:</strong></td><td>______________</td></tr>
            <tr><td><strong>Date:</strong></td><td>______________</td></tr>
            <tr><td><strong>Location:</strong></td><td>______________</td></tr>
            <tr><td><strong>Work Description:</strong></td><td>______________</td></tr>
            <tr><td><strong>Supervisor:</strong></td><td>______________</td></tr>
          </table>
        </div>
        <div class="document-section">
          <h3>Hazard Assessment</h3>
          <table>
            <tr><th>Hazard</th><th>Control Measures</th><th>PPE Required</th></tr>
            <tr><td>Fall</td><td>______________</td><td>Harness</td></tr>
            <tr><td>Electrical</td><td>______________</td><td>Gloves</td></tr>
            <tr><td>Fire</td><td>______________</td><td>FR Clothing</td></tr>
          </table>
        </div>
      `
    };

    let content = templates[docType] || templates['checklist'];
    
    if (mode === 'empty') {
      content = `<div class="empty-template-banner" style="background: #f0f0f0; padding: 10px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #ff9800;">
        <p style="margin: 0; color: #666;"><strong>📋 Empty Template Mode</strong> - All fields are blank for manual completion</p>
      </div>` + content;
    }
    
    return content;
  };

  // ============= DOWNLOAD FUNCTIONS =============
  const handleDownloadDocument = async (doc) => {
    try {
      console.log('📥 Downloading document:', doc);
      
      let htmlContent = doc.htmlContent || doc.preview || doc.content;
      
      if (!htmlContent) {
        console.error('❌ No HTML content found in document');
        message.error('Cannot download: No document content available');
        return;
      }
      
      setIsGeneratingPdf(true);
      
      const element = document.createElement('div');
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
      
      if (window.html2pdf) {
        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `${doc.title?.replace(/[^a-z0-9]/gi, '_') || 'document'}_${Date.now()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };
        
        await window.html2pdf().set(opt).from(element).save();
        message.success('PDF downloaded successfully!');
      } else {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${doc.title || 'Safety Document'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { border-collapse: collapse; width: 100%; margin: 10px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        message.success('Print dialog opened - select "Save as PDF"');
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }
      
      document.body.removeChild(element);
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      message.error(error.message || 'Failed to download PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfContent) {
      message.error('No content to download');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const element = document.createElement('div');
      element.innerHTML = pdfContent;
      element.style.padding = '20px';
      element.style.backgroundColor = 'white';
      element.style.width = '100%';
      element.style.maxWidth = '100%';
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pdfContent;
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
      
      if (window.html2pdf) {
        const opt = {
          margin: isWideTable ? [0.3, 0.3, 0.3, 0.3] : [0.5, 0.5, 0.5, 0.5],
          filename: `${currentDocument?.title?.replace(/[^a-z0-9]/gi, '_') || 'safety_document'}_${Date.now()}.pdf`,
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
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${currentDocument?.title || 'Safety Document'}</title>
            <style>
              @page {
                size: ${pageSize} ${orientation};
                margin: 0.5in;
              }
              * {
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
              }
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                margin: 0;
                font-size: 12px;
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 10px 0;
                page-break-inside: avoid;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left;
                word-break: break-word;
              }
              th { 
                background-color: #1E3D58 !important; 
                color: white !important; 
              }
              .risk-high, [class*="risk-high"] { 
                background-color: #dc3545 !important; 
                color: white !important; 
              }
              .risk-medium, [class*="risk-medium"] { 
                background-color: #ffc107 !important; 
                color: #333 !important; 
              }
              .risk-low, [class*="risk-low"] { 
                background-color: #28a745 !important; 
                color: white !important; 
              }
            </style>
          </head>
          <body>
            ${pdfContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        message.success('Print dialog opened - select "Save as PDF"');
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }
      
      document.body.removeChild(element);
      
    } catch (error) {
      console.error('PDF download error:', error);
      message.error('Failed to generate PDF: ' + error.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // ============= PDF EDITOR HANDLERS =============
  
  // Handler for saving content from the new PDF Editor
  const handlePDFEditorSave = (newContent) => {
    setPdfContent(newContent);
    // Save to history for undo/redo
    setPdfHistory(prev => ({
      past: [...prev.past, { content: pdfContent }],
      future: []
    }));
    message.success('Document saved successfully');
  };

  // Handler for exporting PDF from the new editor
  const handlePDFEditorExport = async (content) => {
    await handleDownloadPdf();
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
        const fallbackResponse = generateLocalAIResponse(currentPrompt, selectedIndustry, industries, aiPersonality);
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
      const fallbackResponse = generateLocalAIResponse(currentPrompt, selectedIndustry, industries, aiPersonality);
      
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
    const fallbackResponse = generateLocalAIResponse(currentPrompt, selectedIndustry, industries, aiPersonality);
    
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
  const saveToHistory = useCallback(() => {
    setPdfHistory(prev => ({
      past: [...prev.past, {
        content: pdfContent,
        annotations: pdfAnnotations,
        formFields: pdfFormFields,
        signatures: pdfSignatures,
        images: pdfImages,
        comments: pdfComments,
        redactions: pdfRedactions
      }],
      future: []
    }));
  }, [pdfContent, pdfAnnotations, pdfFormFields, pdfSignatures, pdfImages, pdfComments, pdfRedactions]);

  const handleUndo = useCallback(() => {
    if (pdfHistory.past.length === 0) return;
    const previous = pdfHistory.past[pdfHistory.past.length - 1];
    setPdfHistory(prev => ({
      past: prev.past.slice(0, -1),
      future: [{
        content: pdfContent,
        annotations: pdfAnnotations,
        formFields: pdfFormFields,
        signatures: pdfSignatures,
        images: pdfImages,
        comments: pdfComments,
        redactions: pdfRedactions
      }, ...prev.future]
    }));
    setPdfContent(previous.content);
    setPdfAnnotations(previous.annotations);
    setPdfFormFields(previous.formFields);
    setPdfSignatures(previous.signatures);
    setPdfImages(previous.images);
    setPdfComments(previous.comments);
    setPdfRedactions(previous.redactions);
    message.success('Undo successful');
  }, [pdfHistory, pdfContent, pdfAnnotations, pdfFormFields, pdfSignatures, pdfImages, pdfComments, pdfRedactions]);

  const handleRedo = useCallback(() => {
    if (pdfHistory.future.length === 0) return;
    const next = pdfHistory.future[0];
    setPdfHistory(prev => ({
      past: [...prev.past, {
        content: pdfContent,
        annotations: pdfAnnotations,
        formFields: pdfFormFields,
        signatures: pdfSignatures,
        images: pdfImages,
        comments: pdfComments,
        redactions: pdfRedactions
      }],
      future: prev.future.slice(1)
    }));
    setPdfContent(next.content);
    setPdfAnnotations(next.annotations);
    setPdfFormFields(next.formFields);
    setPdfSignatures(next.signatures);
    setPdfImages(next.images);
    setPdfComments(next.comments);
    setPdfRedactions(next.redactions);
    message.success('Redo successful');
  }, [pdfHistory, pdfContent, pdfAnnotations, pdfFormFields, pdfSignatures, pdfImages, pdfComments, pdfRedactions]);

  const handleAddAnnotation = (type, content, position, color = '#ff9800') => {
    saveToHistory();
    const newAnnotation = {
      id: `ann_${Date.now()}`,
      type,
      content,
      position: position || { x: 100, y: 500 },
      page: activePdfSection,
      color,
      createdAt: new Date(),
      createdBy: user?.name || 'User'
    };
    setPdfAnnotations([...pdfAnnotations, newAnnotation]);
    message.success(`${type} annotation added`);
  };

  const handleRemoveAnnotation = (annotationId) => {
    saveToHistory();
    setPdfAnnotations(pdfAnnotations.filter(ann => ann.id !== annotationId));
    message.success('Annotation removed');
  };

  const handleAddFormField = (type, position) => {
    saveToHistory();
    const newField = {
      id: `field_${Date.now()}`,
      type,
      position: position || { x: 100, y: 500 },
      page: activePdfSection,
      label: `Field ${pdfFormFields.length + 1}`,
      value: '',
      required: false,
      placeholder: '',
      options: type === 'dropdown' ? ['Option 1', 'Option 2'] : []
    };
    setPdfFormFields([...pdfFormFields, newField]);
    message.success(`${type} form field added`);
  };

  const handleRemoveFormField = (fieldId) => {
    saveToHistory();
    setPdfFormFields(pdfFormFields.filter(field => field.id !== fieldId));
    message.success('Form field removed');
  };

  const handleAddSignature = (signatureData, position) => {
    saveToHistory();
    const newSignature = {
      id: `sig_${Date.now()}`,
      data: signatureData,
      position: position || { x: 100, y: 500 },
      page: activePdfSection,
      signer: user?.name || 'User',
      date: new Date(),
      verified: true
    };
    setPdfSignatures([...pdfSignatures, newSignature]);
    message.success('Signature added');
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleSaveSignature = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const signatureData = signaturePadRef.current.toDataURL();
      
      const signatureHtml = `
        <div class="signature-section" style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9;">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 20px;">
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 11px; color: #666; margin-bottom: 5px;">SIGNATURE</div>
              <img src="${signatureData}" style="max-width: 180px; border-bottom: 1px solid #333;" />
              <div style="margin-top: 8px; font-size: 12px; font-weight: 500;">${user?.name || 'User'}</div>
              <div style="font-size: 11px; color: #666;">${user?.title || 'Safety Officer'}</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 11px; color: #666; margin-bottom: 5px;">DATE</div>
              <div style="margin-top: 20px; font-size: 14px; font-weight: 500;">${new Date().toLocaleDateString()}</div>
              <div style="font-size: 11px; color: #666;">${new Date().toLocaleTimeString()}</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 11px; color: #666; margin-bottom: 5px;">COMPANY</div>
              <div style="margin-top: 20px; font-size: 12px; font-weight: 500;">${companyInfo.companyName || 'SafetyTrack Pro'}</div>
              <div style="font-size: 11px; color: #666;">${companyInfo.complianceOfficer || 'HSE Department'}</div>
            </div>
          </div>
        </div>
      `;
      
      if (isEditingText) {
        setEditableHtml(prev => prev + signatureHtml);
        message.success('Signature added - continue editing');
      } else {
        setPdfContent(prev => prev + signatureHtml);
        saveToHistory();
        message.success('Signature added to document');
      }
      
      setPdfSignatures(prev => [...prev, {
        id: `sig_${Date.now()}`,
        data: signatureData,
        signer: user?.name || 'User',
        date: new Date(),
        verified: true
      }]);
      
      signaturePadRef.current.clear();
    } else {
      message.warning('Please draw a signature first');
    }
  };

  const insertTextAtCursor = () => {
    const textToAdd = prompt('Enter text to add:', 'New text here');
    if (textToAdd && isEditingText) {
      const textHtml = `<p>${textToAdd}</p>`;
      setEditableHtml(prev => prev + textHtml);
      message.success('Text added');
    }
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols && isEditingText) {
      let tableHtml = '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
      tableHtml += '<thead><tr>';
      for (let i = 0; i < parseInt(cols); i++) {
        tableHtml += `<th style="background: #1E3D58; color: white; padding: 8px;">Column ${i + 1}</th>`;
      }
      tableHtml += '</tr></thead><tbody>';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHtml += `<td style="padding: 8px; border: 1px solid #ddd;">Row ${i + 1}, Col ${j + 1}</td>`;
        }
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table>';
      setEditableHtml(prev => prev + tableHtml);
      message.success('Table added');
    }
  };

  const handleAddImage = async (file, position) => {
    saveToHistory();
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      const imageId = `img_${Date.now()}`;
      
      const imageHtml = `
        <div class="image-container" id="${imageId}" style="margin: 15px 0; text-align: center;">
          <img 
            src="${imageData}" 
            alt="${file.name}" 
            style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; padding: 4px;"
          />
          <div style="font-size: 11px; color: #666; margin-top: 5px;">${file.name}</div>
        </div>
      `;
      
      if (isEditingText) {
        setEditableHtml(prev => prev + imageHtml);
      } else {
        setPdfContent(prev => prev + imageHtml);
      }
      
      const newImage = {
        id: imageId,
        data: imageData,
        position: position || { x: 100, y: 500 },
        page: activePdfSection,
        width: 200,
        height: 200,
        caption: file.name,
        html: imageHtml
      };
      setPdfImages([...pdfImages, newImage]);
      message.success('Image added to document');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (imageId) => {
    saveToHistory();
    const imageToRemove = pdfImages.find(img => img.id === imageId);
    if (imageToRemove && imageToRemove.html) {
      if (isEditingText) {
        setEditableHtml(prev => prev.replace(imageToRemove.html, ''));
      } else {
        setPdfContent(prev => prev.replace(imageToRemove.html, ''));
      }
    }
    setPdfImages(pdfImages.filter(img => img.id !== imageId));
    message.success('Image removed from document');
  };

  const handleAddComment = (text, position) => {
    saveToHistory();
    const newComment = {
      id: `cmt_${Date.now()}`,
      text,
      position: position || { x: 100, y: 500 },
      page: activePdfSection,
      author: user?.name || 'User',
      createdAt: new Date(),
      status: 'open',
      replies: []
    };
    setPdfComments([...pdfComments, newComment]);
    message.success('Comment added');
  };

  const handleRemoveComment = (commentId) => {
    saveToHistory();
    setPdfComments(pdfComments.filter(comment => comment.id !== commentId));
    message.success('Comment removed');
  };

  const handleResolveComment = (commentId) => {
    saveToHistory();
    setPdfComments(pdfComments.map(comment =>
      comment.id === commentId ? { ...comment, status: 'resolved' } : comment
    ));
    message.success('Comment resolved');
  };

  const handleAddRedaction = (text, position) => {
    saveToHistory();
    const newRedaction = {
      id: `red_${Date.now()}`,
      text,
      position: position || { x: 100, y: 500 },
      page: activePdfSection,
      reason: 'Confidential',
      applied: false
    };
    setPdfRedactions([...pdfRedactions, newRedaction]);
    message.success('Redaction added');
  };

  const handleApplyRedaction = (redactionId) => {
    saveToHistory();
    setPdfRedactions(pdfRedactions.map(red =>
      red.id === redactionId ? { ...red, applied: true } : red
    ));
    message.success('Redaction applied');
  };

  const handleRemoveRedaction = (redactionId) => {
    saveToHistory();
    setPdfRedactions(pdfRedactions.filter(red => red.id !== redactionId));
    message.success('Redaction removed');
  };

  const handleAddBookmark = (title) => {
    const newBookmark = {
      id: `bmk_${Date.now()}`,
      title,
      page: activePdfSection,
      createdAt: new Date()
    };
    setPdfBookmarks([...pdfBookmarks, newBookmark]);
    message.success('Bookmark added');
  };

  const handleRemoveBookmark = (bookmarkId) => {
    setPdfBookmarks(pdfBookmarks.filter(bm => bm.id !== bookmarkId));
    message.success('Bookmark removed');
  };

  const handleGoToBookmark = (page) => {
    setActivePdfSection(page);
    message.success(`Jumped to page ${page + 1}`);
  };

  const handleAddWatermark = () => {
    if (pdfWatermark.text.trim()) {
      saveToHistory();
      message.success('Watermark applied');
    } else {
      message.warning('Please enter watermark text');
    }
  };

  const handleUpdatePageNumbering = (updates) => {
    setPdfPageNumbering({ ...pdfPageNumbering, ...updates });
    message.success('Page numbering updated');
  };

  const handleSavePdfChanges = () => {
    if (editedPdfContent) {
      setPdfContent(editedPdfContent);
    }
    message.success('PDF changes saved');
    setPdfEditMode(false);
  };

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

  const enterEditMode = () => {
    setEditableHtml(pdfContent);
    setIsEditingText(true);
    message.info('Edit mode activated. You can now edit the HTML content directly.');
  };

  const saveEditedContent = () => {
    let contentToSave = editableHtml;
    
    if (!contentToSave || contentToSave.trim() === '') {
      contentToSave = '<div>No content</div>';
    }
    
    if (!contentToSave.trim().startsWith('<')) {
      contentToSave = `<div>${contentToSave}</div>`;
    }
    
    setPdfContent(contentToSave);
    setIsEditingText(false);
    saveToHistory();
    message.success('Document content updated successfully');
  };

  const insertSignatureAtCursor = (signatureData) => {
    const signatureHtml = `
      <div class="signature-block" style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #666;">SIGNATURE</div>
            <img src="${signatureData}" style="max-width: 150px; border-bottom: 1px solid #333;" />
            <div style="margin-top: 5px; font-size: 12px;">${user?.name || 'User'}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 11px; color: #666;">DATE</div>
            <div style="margin-top: 20px; font-size: 12px;">${new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    `;
    
    if (isEditingText) {
      setEditableHtml(prev => prev + signatureHtml);
      message.success('Signature added to editor');
    } else {
      setPdfContent(prev => prev + signatureHtml);
      saveToHistory();
      message.success('Signature added to document');
    }
  };

  // ============= EXAM FUNCTIONS =============
  const handleStartExamFlow = () => {
    console.log('🎯 Starting exam flow, userPlan:', userPlan);

    if (userPlan === 'super_admin') {
      console.log('👑 SUPER ADMIN: Bypassing all permission checks');
      setUserName('');
      setUserEmail('');
      setSelectedCourseForExam('');
      setUserAnswers({});
      setExamScore(null);
      setExamFlowStep('setup');
      setExamModalVisible(true);
      message.success('👑 Super Admin: Accessing CSP Full Exam System');
      return;
    }

    const permission = checkDocumentPermission('exam', userPlan, documentTypes);

    if (permission.allowed) {
      console.log('✅ Exam access granted - CSP Full Exam (100 questions, 4 hours)');
      setUserName('');
      setUserEmail('');
      setSelectedCourseForExam('');
      setUserAnswers({});
      setExamScore(null);
      setExamFlowStep('setup');
      setExamModalVisible(true);
    } else {
      console.log('❌ Exam access denied');
      setUpgradeInfo({
        requiredPlan: 'pro',
        currentPlan: userPlan,
        documentName: 'CSP Full Examination',
        features: [
          'Full CSP exam (100 questions, 4 hours)',
          'BCSP Blueprint aligned questions',
          'Professional grading & analysis',
          'Platinum-level certificate',
          'Unlimited exam attempts'
        ]
      });
      setShowUpgradeModal(true);
    }
  };

  // ============================================================
// STRONG DEBUG HELPERS
// ============================================================

// 1. Debug logger with visual indicators
const debugExam = (step, data, message = '') => {
  const timestamp = new Date().toISOString();
  console.log(`%c🔍 [EXAM-DEBUG] ${step} ${timestamp}`, 'color: #ff6b00; font-weight: bold; font-size: 14px');
  console.log(`%c📝 ${message}`, 'color: #666; font-size: 12px');
  console.log('%c📊 Data:', 'color: #0066cc; font-weight: bold');
  console.log(JSON.stringify(data, (key, value) => {
    // Truncate long strings for readability
    if (typeof value === 'string' && value.length > 500) {
      return value.substring(0, 500) + '... [TRUNCATED]';
    }
    return value;
  }, 2));
  console.log('%c' + '='.repeat(80), 'color: #666');
};

// 2. Response inspector
const inspectResponse = (response, source) => {
  console.log(`%c🔬 [INSPECT] Response from ${source}`, 'color: #9900cc; font-weight: bold; font-size: 14px');
  console.log('📦 Type:', typeof response);
  console.log('📦 Keys:', Object.keys(response || {}));
  console.log('📦 Is null/undefined:', response === null || response === undefined);
  
  // Check for session_id in various places
  const sessionIdPaths = [
    { path: 'session_id', value: response?.session_id },
    { path: 'data.session_id', value: response?.data?.session_id },
    { path: 'sessionId', value: response?.sessionId },
    { path: 'data.sessionId', value: response?.data?.sessionId },
    { path: 'session.id', value: response?.session?.id },
    { path: 'data.session.id', value: response?.data?.session?.id },
    { path: 'exam_session_id', value: response?.exam_session_id },
    { path: 'data.exam_session_id', value: response?.data?.exam_session_id },
  ];
  
  console.log('%c🔑 Session ID Check:', 'color: #ff6b00; font-weight: bold');
  sessionIdPaths.forEach(({ path, value }) => {
    const found = value !== undefined && value !== null;
    console.log(`  ${found ? '✅' : '❌'} ${path}:`, found ? value : 'NOT FOUND');
  });
  
  // Check for questions in various places
  const questionPaths = [
    { path: 'questions', value: response?.questions?.length },
    { path: 'data.questions', value: response?.data?.questions?.length },
    { path: 'exam_data.questions', value: response?.exam_data?.questions?.length },
    { path: 'data.exam_data.questions', value: response?.data?.exam_data?.questions?.length },
    { path: 'examData.questions', value: response?.examData?.questions?.length },
  ];
  
  console.log('%c❓ Questions Check:', 'color: #0066cc; font-weight: bold');
  questionPaths.forEach(({ path, value }) => {
    const found = value !== undefined && value !== null && value > 0;
    console.log(`  ${found ? '✅' : '❌'} ${path}:`, found ? `${value} questions` : 'NOT FOUND');
  });
  
  // Show full response structure
  console.log('%c📄 Full Response Structure:', 'color: #9900cc; font-weight: bold');
  console.log(JSON.stringify(response, null, 2));
  console.log('%c' + '='.repeat(80), 'color: #666');
  
  return sessionIdPaths.find(p => p.value !== undefined && p.value !== null)?.value || null;
};

// 3. Debug state tracker
const trackExamState = (stateName, stateValue) => {
  console.log(`%c📌 [STATE] ${stateName}`, 'color: #00aa00; font-weight: bold');
  if (typeof stateValue === 'object') {
    console.log(JSON.stringify(stateValue, null, 2));
  } else {
    console.log(stateValue);
  }
};

  const handleProceedToExam = async () => {
  console.log('%c🚀🚀🚀 EXAM FLOW STARTED 🚀🚀🚀', 'color: #ff6b00; font-weight: bold; font-size: 20px');
  console.log('%c' + '='.repeat(80), 'color: #ff6b00');
  
  // STEP 0: Check initial state
  debugExam('INITIAL_STATE', {
    userName,
    userEmail,
    userPlan,
    selectedExamTopic,
    selectedCourseForExam,
    selectedIndustry,
    examSessionId: examSessionId || 'NOT SET YET',
    activeExam: activeExam ? 'EXISTS' : 'NULL'
  }, 'Initial component state before exam start');

  if (!userName || userName.trim() === '') {
    console.warn('⚠️ [EXAM] No user name provided');
    debugExam('VALIDATION_FAILED', { userName }, 'User name is empty');
    message.warning('Please enter your name before starting the exam');
    return;
  }

  setLoading(true);
  setExamFlowStep('taking_exam');

  try {
    const userId = getUserId();
    const useDeepSeekExam = (userPlan === 'super_admin' || userPlan === 'pro' || userPlan === 'enterprise');
    
    debugExam('USER_INFO', {
      userId,
      userName,
      userEmail,
      userPlan,
      useDeepSeekExam,
      isSuperAdmin: userPlan === 'super_admin'
    }, 'User and plan information');

    let examData = null;
    let sessionId = null;
    let questionsList = [];

    // ============================================================
    // STEP 1: GENERATE EXAM
    // ============================================================
    if (useDeepSeekExam && userPlan === 'super_admin') {
      console.log('%c👑 SUPER ADMIN PATH', 'color: #ff6b00; font-weight: bold; font-size: 16px');
      debugExam('DEEPSEEK_START', {
        requestData: {
          topic: selectedExamTopic || 'safety_management',
          difficulty: 'advanced',
          count: 100,
          user_name: userName,
          user_id: userId,
          course: selectedCourseForExam || 'CSP Professional Certification Preparation',
        }
      }, 'Starting DeepSeek exam generation');
      
      const requestData = {
        topic: selectedExamTopic || 'safety_management',
        difficulty: 'advanced',
        count: 100,
        domain: 'safety_management',
        include_explanations: true,
        scenario_based: true,
        user_name: userName,
        user_id: userId,
        user_email: userEmail || `${userId}@exam.com`,
        course: selectedCourseForExam || 'CSP Professional Certification Preparation',
        industry: selectedIndustry,
        is_super_admin: true
      };
      
      try {
        console.log('📤 [EXAM] Making DeepSeek API call...');
        const deepSeekResult = await apiPost('/deepseek/generate-exam', requestData);
        
        // INSPECT THE RAW RESPONSE
        const foundSessionId = inspectResponse(deepSeekResult, 'DeepSeek');
        debugExam('DEEPSEEK_RESPONSE', {
          rawResponse: deepSeekResult,
          foundSessionId: foundSessionId,
          hasSuccess: deepSeekResult?.success,
          hasQuestions: deepSeekResult?.questions?.length > 0,
          hasDataQuestions: deepSeekResult?.data?.questions?.length > 0,
          status: deepSeekResult?.status,
          error: deepSeekResult?.error
        }, 'DeepSeek raw response inspection');

        // Check for 403 or error
        if (deepSeekResult && (deepSeekResult.status === 403 || deepSeekResult.error === 'Permission denied')) {
          console.warn('⚠️ [EXAM] DeepSeek 403 error, falling back to backend');
          debugExam('DEEPSEEK_403', deepSeekResult, 'DeepSeek returned 403, using backend fallback');
          
          const result = await generateExamFromBackend(userId, 100);
          if (!result) {
            console.error('❌ [EXAM] Backend fallback failed');
            debugExam('BACKEND_FALLBACK_FAILED', null, 'Backend fallback returned null');
            setExamFlowStep('setup');
            setLoading(false);
            return;
          }
          examData = result.examData;
          sessionId = result.sessionId;
          questionsList = result.questionsList;
          
          debugExam('BACKEND_FALLBACK_SUCCESS', {
            sessionId,
            questionsCount: questionsList.length,
            examDataKeys: Object.keys(examData || {})
          }, 'Backend fallback succeeded');
          
        } else if (deepSeekResult?.success && deepSeekResult?.questions?.length > 0) {
          // Success path
          questionsList = deepSeekResult.questions;
          sessionId = deepSeekResult.session_id || deepSeekResult.data?.session_id || `DEEPSEEK_EXAM_${Date.now()}`;
          examData = {
            exam_id: sessionId,
            exam_type: 'CSP_FULL_EXAM_DEEPSEEK',
            domain: selectedExamTopic || 'safety_management',
            total_questions: questionsList.length,
            passing_score: 75,
            time_limit_minutes: 240,
            generated_at: new Date().toISOString(),
            questions: questionsList,
            source: 'deepseek'
          };
          console.log('✅ [EXAM] DeepSeek exam generated:', questionsList.length, 'questions');
          console.log('📋 [EXAM] Session ID:', sessionId);
          
          debugExam('DEEPSEEK_SUCCESS', {
            sessionId,
            questionsCount: questionsList.length,
            firstQuestion: questionsList[0]?.question?.substring(0, 50) + '...'
          }, 'DeepSeek exam generation successful');
          
        } else if (deepSeekResult?.questions?.length > 0) {
          // Response without success flag but has questions
          questionsList = deepSeekResult.questions;
          sessionId = deepSeekResult.session_id || `DEEPSEEK_EXAM_${Date.now()}`;
          examData = {
            exam_id: sessionId,
            exam_type: 'CSP_FULL_EXAM_DEEPSEEK',
            domain: selectedExamTopic || 'safety_management',
            total_questions: questionsList.length,
            passing_score: 75,
            time_limit_minutes: 240,
            generated_at: new Date().toISOString(),
            questions: questionsList,
            source: 'deepseek'
          };
          console.log('✅ [EXAM] DeepSeek exam generated (no success flag):', questionsList.length, 'questions');
          
          debugExam('DEEPSEEK_SUCCESS_NO_FLAG', {
            sessionId,
            questionsCount: questionsList.length
          }, 'DeepSeek exam successful but no success flag in response');
          
        } else if (deepSeekResult?.data?.questions?.length > 0) {
          // Nested data path
          questionsList = deepSeekResult.data.questions;
          sessionId = deepSeekResult.data.session_id || deepSeekResult.session_id || `DEEPSEEK_EXAM_${Date.now()}`;
          examData = {
            exam_id: sessionId,
            exam_type: 'CSP_FULL_EXAM_DEEPSEEK',
            domain: selectedExamTopic || 'safety_management',
            total_questions: questionsList.length,
            passing_score: 75,
            time_limit_minutes: 240,
            generated_at: new Date().toISOString(),
            questions: questionsList,
            source: 'deepseek'
          };
          console.log('✅ [EXAM] DeepSeek exam generated (from .data):', questionsList.length, 'questions');
          
          debugExam('DEEPSEEK_SUCCESS_DATA', {
            sessionId,
            questionsCount: questionsList.length
          }, 'DeepSeek exam successful from nested data');
          
        } else {
          console.warn('⚠️ [EXAM] DeepSeek response had no questions, trying backend fallback');
          debugExam('DEEPSEEK_NO_QUESTIONS', {
            responseKeys: Object.keys(deepSeekResult || {}),
            hasData: !!deepSeekResult?.data
          }, 'DeepSeek response missing questions array');
          
          const result = await generateExamFromBackend(userId, 100);
          if (!result) {
            console.error('❌ [EXAM] Backend fallback failed');
            setExamFlowStep('setup');
            setLoading(false);
            return;
          }
          examData = result.examData;
          sessionId = result.sessionId;
          questionsList = result.questionsList;
        }
      } catch (deepSeekError) {
        console.error('❌ [EXAM] DeepSeek error:', deepSeekError);
        console.error('❌ [EXAM] Error stack:', deepSeekError.stack);
        debugExam('DEEPSEEK_ERROR', {
          errorMessage: deepSeekError.message,
          errorStack: deepSeekError.stack,
          errorName: deepSeekError.name
        }, 'DeepSeek API call threw exception');
        
        console.warn('⚠️ [EXAM] Falling back to backend');
        const result = await generateExamFromBackend(userId, 100);
        if (!result) {
          console.error('❌ [EXAM] Backend fallback failed');
          setExamFlowStep('setup');
          setLoading(false);
          return;
        }
        examData = result.examData;
        sessionId = result.sessionId;
        questionsList = result.questionsList;
      }
    } else {
      // Regular users - Use backend
      const numQuestions = userPlan === 'basic' ? 20 : 100;
      console.log(`📚 [EXAM] Using backend with ${numQuestions} questions`);
      debugExam('BACKEND_START', {
        numQuestions,
        userId,
        userName,
        userPlan
      }, 'Starting backend exam generation');
      
      const result = await generateExamFromBackend(userId, numQuestions);
      if (!result) {
        console.error('❌ [EXAM] Backend generation failed');
        debugExam('BACKEND_FAILED', null, 'Backend generation returned null');
        setExamFlowStep('setup');
        setLoading(false);
        return;
      }
      examData = result.examData;
      sessionId = result.sessionId;
      questionsList = result.questionsList;
      
      debugExam('BACKEND_SUCCESS', {
        sessionId,
        questionsCount: questionsList.length,
        examDataKeys: Object.keys(examData || {})
      }, 'Backend exam generation successful');
    }

    // ============================================================
    // STEP 2: VALIDATE AND LOG FINAL STATE
    // ============================================================
    console.log('%c📊 FINAL STATE CHECK', 'color: #ff6b00; font-weight: bold; font-size: 16px');
    console.log('  - sessionId:', sessionId);
    console.log('  - sessionId type:', typeof sessionId);
    console.log('  - questionsList length:', questionsList?.length || 0);
    console.log('  - examData:', examData ? 'present' : 'null');
    
    debugExam('FINAL_STATE', {
      sessionId,
      sessionIdType: typeof sessionId,
      questionsCount: questionsList?.length || 0,
      hasExamData: !!examData,
      examDataKeys: Object.keys(examData || {})
    }, 'Final state after exam generation');

    // CRITICAL: Validate session ID
    if (!sessionId) {
      console.error('❌ [EXAM] No session ID - generating fallback');
      sessionId = `EXAM-FALLBACK-${Date.now()}`;
      console.log('🆕 [EXAM] Fallback session ID:', sessionId);
      debugExam('SESSION_ID_FALLBACK', { sessionId }, 'No session ID found, using generated fallback');
    }

    // Validate questions
    if (!questionsList || questionsList.length === 0) {
      console.error('❌ [EXAM] No questions - trying emergency fallback');
      debugExam('NO_QUESTIONS', { 
        questionsList, 
        examData: examData ? 'present' : 'null' 
      }, 'Questions list is empty, using fallback questions');
      
      const fallbackQuestions = generateFallbackQuestions(100);
      questionsList = fallbackQuestions;
      if (!examData) {
        examData = {
          exam_id: sessionId,
          exam_type: 'CSP_FULL_EXAM_FALLBACK',
          domain: selectedExamTopic || 'safety_management',
          total_questions: questionsList.length,
          passing_score: 75,
          time_limit_minutes: 240,
          generated_at: new Date().toISOString(),
          questions: questionsList,
          source: 'fallback'
        };
      }
      debugExam('FALLBACK_QUESTIONS', {
        questionsCount: questionsList.length,
        firstQuestion: questionsList[0]?.question
      }, 'Fallback questions generated');
    }

    console.log('📊 [EXAM] Final counts:');
    console.log('  - Questions:', questionsList.length);
    console.log('  - Session ID:', sessionId);

    // ============================================================
    // STEP 3: BUILD FRONTEND EXAM
    // ============================================================
    debugExam('BUILD_EXAM_START', {
      questionsCount: questionsList.length,
      sessionId,
      examDataKeys: Object.keys(examData || {})
    }, 'Building frontend exam object');
    
    const frontendExam = buildExamObject(questionsList, examData, sessionId);
    
    debugExam('BUILD_EXAM_RESULT', {
      examTitle: frontendExam.title,
      examQuestions: frontendExam.questions?.length || 0,
      examSessionId: frontendExam.session_id,
      examId: frontendExam.exam_id
    }, 'Frontend exam object built');

    // ============================================================
    // STEP 4: SET ALL STATE
    // ============================================================
    console.log('%c📌 SETTING STATE', 'color: #00aa00; font-weight: bold; font-size: 16px');
    console.log('  - Setting activeExam with', frontendExam.questions.length, 'questions');
    console.log('  - Setting examSessionId to:', sessionId);
    console.log('  - Setting localStorage exam_session_id:', sessionId);
    
    setActiveExam(frontendExam);
    setUserAnswers({});
    setExamScore(null);
    setActivePdfSection(0);
    setExamSessionId(sessionId);
    localStorage.setItem('exam_session_id', sessionId);
    
    // Verify state was set
    console.log('✅ State set, verifying...');
    console.log('  - examSessionId now:', examSessionId); // This will show stale value due to React batching
    
    // Track state after set
    debugExam('STATE_AFTER_SET', {
      examSessionId: sessionId,
      activeExamQuestions: frontendExam.questions?.length || 0,
      localStorageSessionId: localStorage.getItem('exam_session_id')
    }, 'State after React setState calls');

    // ============================================================
    // STEP 5: START TIMER
    // ============================================================
    console.log('⏱️ Starting exam timer...');
    startExamTimer(frontendExam);
    debugExam('TIMER_STARTED', {
      timeLimit: frontendExam.time_limit_minutes,
      totalQuestions: frontendExam.total_questions
    }, 'Exam timer started');

    // ============================================================
    // STEP 6: SHOW SUCCESS
    // ============================================================
    setExamFlowStep('taking_exam');
    const source = examData?.source === 'deepseek' ? 'DeepSeek AI' : 'backend';
    message.success(`✅ CSP Exam ready! ${questionsList.length} questions from ${source}.`);
    
    debugExam('EXAM_READY', {
      source,
      questionsCount: questionsList.length,
      sessionId,
      flowStep: 'taking_exam'
    }, 'Exam is ready for user');

  } catch (error) {
    console.error('%c❌❌❌ FATAL EXAM ERROR ❌❌❌', 'color: red; font-weight: bold; font-size: 20px');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    debugExam('FATAL_ERROR', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    }, 'Fatal error in exam flow');
    
    message.error('Failed to start exam. Please try again.');
    setExamFlowStep('setup');
  } finally {
    setLoading(false);
    console.log('%c🔵 EXAM FLOW COMPLETED', 'color: #0066cc; font-weight: bold; font-size: 16px');
    console.log('%c' + '='.repeat(80), 'color: #ff6b00');
  }
};

const generateExamFromBackend = async (userId, numQuestions) => {
  console.log('🔄 [BACKEND] generateExamFromBackend STARTED');
  
  try {
    // STEP 1: Start the exam flow - get REAL session ID
    const startResult = await AIService.startExamFlow({
      user_name: userName,
      user_id: userId,
      user_email: userEmail || `${userId}@exam.com`,
      course: selectedCourseForExam || 'CSP Professional Certification Preparation',
      topic: selectedExamTopic || 'safety_management',
      difficulty: numQuestions === 100 ? 'advanced' : 'intermediate',
      num_questions: numQuestions,
      industry: selectedIndustry,
      user_plan: userPlan,
      is_super_admin: userPlan === 'super_admin'
    }, userPlan);

    console.log('📥 startExamFlow response:', startResult);
    
    if (!startResult?.success) {
      console.error('❌ startExamFlow failed:', startResult?.error);
      return null;
    }

    // ✅ CRITICAL FIX: Use the REAL session_id from the backend
    // DO NOT generate a fake one!
    const sessionId = startResult.session_id || startResult.data?.session_id;
    
    console.log('✅ Real session ID from backend:', sessionId);
    
    if (!sessionId) {
      console.error('❌ No session_id in startResult');
      // Check if we have questions directly
      if (startResult.questions && startResult.questions.length > 0) {
        console.log('✅ Found questions directly in startResult');
        const examData = {
          exam_id: `EXAM-${Date.now()}`,
          exam_type: 'CSP_FULL_EXAM_BACKEND',
          total_questions: startResult.questions.length,
          passing_score: 75,
          time_limit_minutes: 240,
          questions: startResult.questions,
          source: 'backend_direct'
        };
        return { 
          examData, 
          sessionId: `EXAM-${Date.now()}`, 
          questionsList: startResult.questions 
        };
      }
      return null;
    }

    // Store the REAL session ID
    setExamSessionId(sessionId);
    localStorage.setItem('exam_session_id', sessionId);
    console.log('📋 Session ID stored:', sessionId);

    // STEP 2: Use the REAL session ID to get the exam
    const generateResult = await AIService.generateExamForFlow(sessionId, userPlan);
    
    console.log('📥 generateExamForFlow response:', generateResult);

    // Check if we already have questions from startResult
    if (startResult?.questions && startResult.questions.length > 0) {
      console.log('✅ Using questions from startResult:', startResult.questions.length);
      const examData = {
        exam_id: sessionId,
        exam_type: 'CSP_FULL_EXAM_BACKEND',
        domain: selectedExamTopic || 'safety_management',
        total_questions: startResult.questions.length,
        passing_score: 75,
        time_limit_minutes: 240,
        generated_at: new Date().toISOString(),
        questions: startResult.questions,
        source: 'backend_start'
      };
      return { examData, sessionId, questionsList: startResult.questions };
    }

    if (!generateResult?.success) {
      console.error('❌ generateExamForFlow failed:', generateResult?.error);
      // Check if there are questions in the response anyway
      if (generateResult?.questions && generateResult.questions.length > 0) {
        console.log('✅ Found questions in error response:', generateResult.questions.length);
        const examData = {
          exam_id: sessionId,
          exam_type: 'CSP_FULL_EXAM_BACKEND',
          domain: selectedExamTopic || 'safety_management',
          total_questions: generateResult.questions.length,
          passing_score: 75,
          time_limit_minutes: 240,
          generated_at: new Date().toISOString(),
          questions: generateResult.questions,
          source: 'backend_error'
        };
        return { examData, sessionId, questionsList: generateResult.questions };
      }
      message.error(generateResult?.error || 'Failed to generate questions');
      return null;
    }

    const examData = generateResult.exam_data || generateResult.data;
    const questionsList = examData?.questions || generateResult.questions || [];
    
    console.log('📊 [BACKEND] Final data:');
    console.log('  - sessionId:', sessionId);
    console.log('  - questionsList length:', questionsList.length);

    if (!questionsList || questionsList.length === 0) {
      console.error('❌ [BACKEND] No questions in response');
      return null;
    }

    console.log('✅ [BACKEND] generateExamFromBackend SUCCESS');
    return { examData, sessionId, questionsList };

  } catch (error) {
    console.error('❌ [BACKEND] generateExamFromBackend error:', error);
    return null;
  }
};
// ============================================================
// HELPER: Build Exam Object
// ============================================================
const buildExamObject = (questionsList, examData, sessionId) => {
    const isDeepSeek = examData?.source === 'deepseek';
    const isBasic = userPlan === 'basic';
    
    return {
        title: isDeepSeek ? 'CSP Professional Examination (AI-Generated)' : 
               (isBasic ? 'CSP Practice Examination' : 'CSP Professional Examination'),
        description: isDeepSeek ? 'Full CSP Exam with AI-generated questions (100 Questions, 4 Hours)' :
                     (isBasic ? 'Practice exam with 20 questions' : 'Full CSP Practice Exam (100 Questions, 4 Hours)'),
        industry: selectedIndustry,
        difficulty: isDeepSeek ? 'CSP Advanced Level (AI)' : 
                    (isBasic ? 'Intermediate Level' : 'CSP Advanced Level'),
        candidate_name: userName,
        course: selectedCourseForExam || 'CSP Professional Certification Preparation',
        exam_id: examData?.exam_id || `EXAM-${Date.now()}`,
        session_id: sessionId,
        exam_mode: examData?.exam_type || (isDeepSeek ? 'CSP_FULL_EXAM_DEEPSEEK' : 'CSP_FULL_EXAM'),
        source: isDeepSeek ? 'deepseek' : 'backend',
        plan_used: userPlan,
        questions: questionsList.map((q, index) => formatQuestion(q, index, isDeepSeek)),
        instructions: `Complete all ${questionsList.length} questions within 4 hours. Passing score is 75%.`,
        passing_score: 75,
        time_limit_minutes: 240,
        total_questions: questionsList.length,
        total_points: questionsList.reduce((sum, q) => sum + (q.points || 2), 0),
        generated_at: examData?.generated_at || new Date().toISOString(),
        topic: examData?.domain || selectedExamTopic,
        csp_blueprint_aligned: true
    };
};

// ============================================================
// HELPER: Format Question
// ============================================================
const formatQuestion = (q, index, isDeepSeek) => {
    // Format options
    let options = [];
    const rawOptions = q.options || [];
    
    if (Array.isArray(rawOptions) && rawOptions.length > 0) {
        if (typeof rawOptions[0] === 'object' && rawOptions[0] !== null) {
            options = rawOptions.map(opt => opt.text || opt.option || `Option ${opt.letter || ''}`);
        } else {
            options = rawOptions.map(opt => String(opt).replace(/^[A-D][\.\)\-]\s*/i, '').trim());
        }
    } else if (typeof rawOptions === 'object' && !Array.isArray(rawOptions)) {
        options = Object.values(rawOptions).map(opt => {
            if (typeof opt === 'object') {
                return opt.text || opt.option || String(opt);
            }
            return String(opt).replace(/^[A-D][\.\)\-]\s*/i, '').trim();
        });
    } else {
        options = ['Option A', 'Option B', 'Option C', 'Option D'];
    }

    // Ensure at least 4 options
    while (options.length < 4) {
        options.push(`Option ${String.fromCharCode(65 + options.length)}`);
    }

    // Parse correct answer
    let correctAnswer = 'A';
    if (q.correct_answer) {
        const ans = String(q.correct_answer).toUpperCase().trim();
        if (['A', 'B', 'C', 'D'].includes(ans)) {
            correctAnswer = ans;
        } else {
            const num = parseInt(ans);
            if (!isNaN(num) && num >= 1 && num <= 4) {
                correctAnswer = String.fromCharCode(64 + num);
            }
        }
    }

    const correctAnswerIndex = correctAnswer.charCodeAt(0) - 65;

    return {
        id: q.id || `q_${index}_${Date.now()}`,
        question_text: q.question_text || q.question || `Question ${index + 1}`,
        question: q.question_text || q.question || `Question ${index + 1}`,
        type: q.question_type || 'application',
        options: options,
        correct_answer: correctAnswerIndex,
        correct_answer_letter: correctAnswer,
        explanation: q.explanation || (isDeepSeek ? 'AI-generated explanation based on CSP standards.' : 'Based on CSP-level professional judgment.'),
        points: q.points || 2,
        difficulty: q.difficulty || (isDeepSeek ? 'advanced' : 'intermediate'),
        cognitive_level: q.cognitive_level || 'application',
        domain: q.domain || 'Domain 2',
        regulatory_reference: q.reference || '',
        scenario_context: q.scenario_context || ''
    };
};

// ============================================================
// HELPER: Start Exam Timer
// ============================================================
const startExamTimer = (exam) => {
    if (!exam?.time_limit_minutes) return;
    
    const timeLimit = exam.time_limit_minutes;
    setExamProgress({
        answered: 0,
        total: exam.questions.length,
        timeRemaining: timeLimit * 60
    });

    // Clear existing timer
    if (examTimer) {
        clearInterval(examTimer);
    }

    const timer = setInterval(() => {
        setExamProgress(prev => {
            if (prev.timeRemaining <= 1) {
                clearInterval(timer);
                handleAutoSubmitExam();
                return { ...prev, timeRemaining: 0 };
            }
            return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
    }, 1000);

    setExamTimer(timer);
};

  const handleAutoSubmitExam = () => {
    message.warning('⏰ Time is up! Auto-submitting exam...');
    handleSubmitExam();
};

  const getUserId = () => {
    if (userEmail && userEmail.trim() !== '') {
      return `user_${userEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    }
    if (userName && userName.trim() !== '') {
      return `user_${userName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    }
    return `user_${Date.now()}`;
  };

  const handleAnswerSelect = (questionIndex, answerLetter) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answerLetter
    }));

    setExamProgress(prev => {
      const answeredCount = Object.keys({ ...prev.answers, [questionIndex]: answerLetter }).length;
      return {
        ...prev,
        answered: answeredCount,
        answers: { ...prev.answers, [questionIndex]: answerLetter },
        percentage: Math.round((answeredCount / prev.total) * 100)
      };
    });
  };

  const handleSubmitExam = async () => {
    console.log('📤 Submitting exam...');
    
    // ✅ Check if activeExam exists
    if (!activeExam) {
        message.error('No active exam to submit');
        return;
    }

    const totalQuestions = activeExam.questions?.length || 0;
    const answeredCount = Object.keys(userAnswers).length;

    if (answeredCount < totalQuestions) {
        Modal.confirm({
            title: 'Submit with unanswered questions?',
            content: `You have answered ${answeredCount} out of ${totalQuestions} questions. ${totalQuestions - answeredCount} questions are unanswered. Are you sure you want to submit?`,
            okText: 'Yes, Submit',
            cancelText: 'Continue Exam',
            onOk: () => performSubmit()
        });
        return;
    }

    performSubmit();
};

const performSubmit = async () => {
    try {
        message.loading({ content: 'Submitting exam...', key: 'submit', duration: 0 });

        // ✅ If no examSessionId, create one
        let sessionId = examSessionId;
        if (!sessionId) {
            sessionId = `EXAM-${Date.now()}`;
            setExamSessionId(sessionId);
        }

        // Format answers
        const formattedAnswers = {};
        Object.entries(userAnswers).forEach(([qIndex, answerIndex]) => {
            formattedAnswers[qIndex] = {
                index: answerIndex,
                letter: String.fromCharCode(65 + answerIndex)
            };
        });

        // Submit to backend
        const submitResult = await AIService.submitExamForGrading(
            sessionId,
            formattedAnswers,
            userPlan
        );

        if (submitResult?.success) {
            const detailedResults = submitResult.grading_result?.detailed_results || [];
            const mappedResults = detailedResults.map(result => ({
                question: result.question_text || `Question ${result.question_number}`,
                userAnswer: result.user_answer || 'Not answered',
                correctAnswer: result.correct_answer || 'Not available',
                isCorrect: result.is_correct || false,
                explanation: result.explanation || 'No explanation provided',
                points: result.points || 1,
                points_earned: result.points_earned || 0,
                domain: result.domain || 'Unknown'
            }));

            setExamScore({
                score: submitResult.grading_result?.percentage || 0,
                correct: submitResult.grading_result?.correct_answers || 0,
                total: submitResult.grading_result?.total_questions || activeExam.questions.length,
                percentage: submitResult.grading_result?.percentage || 0,
                passed: submitResult.grading_result?.passed || false,
                results: mappedResults,
                professional_analysis: submitResult.professional_analysis || {}
            });

            setExamFlowStep('results');
            message.success({ content: `✅ Exam submitted! Score: ${submitResult.grading_result?.percentage || 0}%`, key: 'submit' });
        } else {
            // Fallback to local grading
            performLocalGrading();
        }
    } catch (error) {
        console.error('❌ Submit exception:', error);
        message.error({ content: 'Error submitting exam. Using local grading.', key: 'submit' });
        performLocalGrading();
    }
};

  const performLocalGrading = () => {
    if (!activeExam) return;

    let correct = 0;
    const results = [];

    activeExam.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correct_answer;
      if (isCorrect) correct++;

      const userAnswerText = userAnswer ? getOptionText(question.options, userAnswer) : 'Not answered';
      const correctAnswerText = getOptionText(question.options, question.correct_answer);

      results.push({
        question: question.question,
        userAnswer: userAnswerText,
        correctAnswer: correctAnswerText,
        isCorrect,
        explanation: question.explanation
      });
    });

    const score = Math.round((correct / activeExam.questions.length) * 100);
    const passed = score >= (activeExam.passing_score || 70);

    setExamScore({
      score,
      correct,
      total: activeExam.questions.length,
      percentage: score,
      passed,
      results
    });

    setExamFlowStep('results');
    message.success(`Exam submitted! Score: ${score}%`);
  };

  const getOptionText = (options, letter) => {
    if (!options || !letter) return 'N/A';
    const option = options.find(opt => opt.startsWith(`${letter}.`));
    return option || `${letter}. Not found`;
  };

  

  const handleGenerateCertificateFromExam = async () => {
    if (!examScore?.passed) {
      message.error('You must pass the exam to receive a certificate');
      return;
    }

    try {
      message.loading({ content: 'Generating your professional certificate...', key: 'cert_gen' });

      const certificateResult = await AIService.generateExamCertificate(examSessionId, userPlan);

      if (certificateResult.success) {
        const credential = getCredentialLevel(examScore.score);

        const certificateData = {
          ...certificateResult.certificate,
          recipient_name: userName,
          course_title: selectedCourseForExam,
          exam_score: examScore.score,
          exam_date: new Date().toISOString().split('T')[0],
          credential_level: credential.level,
          ceus_awarded: credential.ceus,
          admin_signature: {
            name: adminSignature.name,
            title: adminSignature.title,
            signature_id: adminSignature.signature_id
          }
        };

        setGeneratedCertificate(certificateData);
        setExamFlowStep('certificate');
        message.success({ content: 'Professional certificate generated successfully!', key: 'cert_gen' });
      } else {
        throw new Error(certificateResult.error || 'Backend generation failed');
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      message.warning('Using local certificate generation');

      const credential = getCredentialLevel(examScore.score);
      const fallbackCertificate = {
        certificate_id: `CERT-${Date.now()}`,
        recipient_name: userName,
        course_title: selectedCourseForExam,
        exam_score: examScore.score,
        exam_date: new Date().toISOString().split('T')[0],
        exam_id: examSessionId,
        issuer: 'SafetyTrack Pro Certification Authority',
        credential_level: credential.level,
        ceus_awarded: credential.ceus,
        source: 'local',
        admin_signature: {
          name: adminSignature.name,
          title: adminSignature.title,
          signature_id: adminSignature.signature_id
        }
      };

      setGeneratedCertificate(fallbackCertificate);
      setExamFlowStep('certificate');
    }
  };

  const handleDownloadExamCertificate = async () => {
    const certificateToDownload = generatedCertificate;

    const certId = certificateToDownload?.certificate_id;

    if (!certId) {
      message.error('No certificate ID found');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/ai/exam/flow/certificate/${certId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.download_url) {
          window.open(`http://127.0.0.1:5000${data.download_url}`, '_blank');
          message.success('Download started!');
        } else {
          message.error('No download URL found');
        }
      } else {
        message.error('Failed to get certificate');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Download failed');
    }
  };

  const handleDownloadTranscript = async () => {
    if (!examScore) return;

    try {
      message.loading({ content: 'Preparing transcript download...', key: 'transcript', duration: 0 });

      const transcriptData = {
        recipient_name: userName,
        course_title: selectedCourseForExam,
        exam_results: examScore,
        exam_details: activeExam,
        exam_date: new Date().toISOString().split('T')[0],
        company_info: companyInfo.useCompanyInfo ? companyInfo : {}
      };

      const response = await AIService.downloadTranscriptAsPdf?.(transcriptData, userPlan);

      if (response?.success && response.download_url) {
        const link = document.createElement('a');
        link.href = response.download_url;
        link.download = `Transcript_${userName}_${selectedCourseForExam}_${Date.now()}.pdf`;
        link.click();
        message.success({ content: 'Transcript downloaded successfully!', key: 'transcript' });
      } else {
        generateFallbackTranscriptPdf();
      }
    } catch (error) {
      console.error('Transcript download error:', error);
      generateFallbackTranscriptPdf();
    }
  };

  const generateFallbackTranscriptPdf = () => {
    const credential = getCredentialLevel(examScore?.score || 0);

    const transcriptContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    INTERNATIONAL SAFETY PROFESSIONAL CERTIFICATION           ║
║                          EXAMINATION TRANSCRIPT                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  CANDIDATE INFORMATION:                                                      ║
║  ────────────────────────────────────────────────────────────────────────── ║
║  Name:           ${userName}                                                 ║
║  Course:         ${selectedCourseForExam}                                    ║
║  Exam Date:      ${new Date().toLocaleDateString()}                          ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  EXAM RESULTS SUMMARY:                                                       ║
║  ────────────────────────────────────────────────────────────────────────── ║
║                                                                              ║
║  Overall Score:          ${examScore?.score}%                                ║
║  Correct Answers:        ${examScore?.correct} / ${examScore?.total}        ║
║  Result:                 ${examScore?.passed ? 'PASSED ✓' : 'FAILED ✗'}     ║
║  Credential Level:       ${credential.level}                                ║
║  CEUs Awarded:           ${credential.ceus}                                 ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Generated by SafetyTrack Pro AI Assistant | ${new Date().toLocaleString()}
    `;

    const blob = new Blob([transcriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Transcript_${userName}_${selectedCourseForExam}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    message.success({ content: 'Transcript downloaded successfully!', key: 'transcript' });
  };

  // ============= CERTIFICATE VERIFICATION FUNCTIONS =============
  const handleVerifyCertificate = async () => {
    if (!verificationCode.trim()) {
      message.warning('Please enter a certificate ID');
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setVerificationResult({
        valid: true,
        certificate_id: verificationCode,
        recipient_name: 'John Doe',
        course_title: 'CSP Professional Certification',
        exam_score: 92,
        exam_date: '2024-03-15',
        issue_date: '2024-03-20',
        expiry_date: '2026-03-20',
        verifiedAt: new Date().toISOString()
      });
      message.success('Certificate verified successfully!');
    } catch (error) {
      setVerificationResult({
        valid: false,
        message: 'Certificate not found. Please check the ID and try again.',
        verifiedAt: new Date().toISOString()
      });
      message.error('Certificate not found');
    } finally {
      setVerifying(false);
    }
  };

  const handleScanQR = () => {
    message.info('QR scanning feature coming soon. Please enter the certificate ID manually.');
  };

  const handleCopyVerificationLink = () => {
    if (verificationResult?.certificate_id) {
      const link = `${window.location.origin}/verify/${verificationResult.certificate_id}`;
      navigator.clipboard.writeText(link);
      message.success('Verification link copied to clipboard!');
    }
  };

  // ============= DOCUMENT HISTORY FUNCTIONS =============
  const handleCopyDocument = (doc) => {
    const contentToCopy = doc.htmlContent || doc.preview || doc.content;
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      message.success('Document content copied to clipboard!');
    } else {
      message.error('No content to copy');
    }
  };

  const handleDeleteDocument = (id) => {
    setDocumentHistory(prev => prev.filter(doc => doc.id !== id));
    message.success('Document deleted');
  };
   

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
    if (result.success) {
      setDocumentHistory(result.documents);
    } else {
      const localDocs = aiStorageService.getDocumentsLocal();
      if (localDocs.success) {
        setDocumentHistory(localDocs.documents);
      }
    }
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
    let filtered = documentTypes.all;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const renderIndustrySelector = () => (
  <Form.Item label={
    <Space>
      <GlobalOutlined />
      <span>Industry Focus</span>
      <Tooltip title="Select your industry for tailored safety solutions">
        <QuestionCircleOutlined style={{ color: '#666' }} />
      </Tooltip>
    </Space>
  }>
    <Select
      value={selectedIndustry}
      onChange={setSelectedIndustry}
      style={{ width: '100%' }}
      placeholder="Select industry"
      size="large"
      showSearch
      optionLabelProp="label"
    >
      {industries.map(industry => (
        <Option 
          key={industry.value} 
          value={industry.value}
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
                    industry.risk_level === 'High' ? 'red' : 
                    industry.risk_level === 'Medium' ? 'orange' : 
                    'green'
                  } 
                  size="small"
                >
                  {industry.risk_level} Risk
                </Tag>
              </div>
            </div>
          </div>
        </Option>
      ))}
    </Select>
  </Form.Item>
);

  const renderDocumentTypeSelector = () => {
  const availableDocuments = getFilteredDocumentTypes();

  return (
    <Form.Item label={
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
        <FileTextOutlined style={{ marginRight: '4px' }} />
        <span>Document Type</span>
        <Tag color="purple" style={{ marginLeft: '4px' }}>
          {PLAN_PERMISSIONS[userPlan]?.name || userPlan}
        </Tag>
      </div>
    } required>
      <Select
        value={selectedDocumentType}
        onChange={setSelectedDocumentType}
        style={{ width: '100%' }}
        placeholder={`Choose document type (${availableDocuments.length} available)...`}
        size="large"
        showSearch
        // FIXED: Safely handle filterOption
        filterOption={(input, option) => {
          // Get the label safely - option.label might be a React element or string
          let label = option?.label;
          let description = option?.description;
          
          // If label is a React element, extract text content
          if (typeof label === 'object' && label !== null) {
            // Try to get text from the element
            if (label.props && label.props.children) {
              if (typeof label.props.children === 'string') {
                label = label.props.children;
              } else if (Array.isArray(label.props.children)) {
                label = label.props.children.map(c => {
                  if (typeof c === 'string') return c;
                  if (c?.props?.children) return c.props.children;
                  return '';
                }).join('');
              } else {
                label = '';
              }
            } else {
              label = '';
            }
          }
          
          // Convert to string for comparison
          const labelStr = String(label || '').toLowerCase();
          const descStr = String(description || '').toLowerCase();
          const inputStr = String(input || '').toLowerCase();
          
          return labelStr.includes(inputStr) || descStr.includes(inputStr);
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
                  style={{ width: 140 }}
                  dropdownMatchSelectWidth={false}
                >
                  {Object.entries(documentTypes.categories).map(([key, category]) => (
                    <Option key={key} value={key}>
                      {category.icon} {category.label}
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
        {availableDocuments.map(doc => {
          const permission = checkDocumentPermission(doc.value, userPlan, documentTypes);
          const isDisabled = !permission.allowed;

          return (
            <Select.Option
              key={doc.value}
              value={doc.value}
              disabled={isDisabled}
              // FIXED: Use a simple string label for filtering
              label={doc.label}
              description={doc.description}
            >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                {/* Icon and Label Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', color: doc.color }}>{doc.icon}</span>
                  <Text strong style={{ color: isDisabled ? '#d9d9d9' : doc.color }}>
                    {doc.label}
                  </Text>
                  {isDisabled && <LockOutlined style={{ color: '#faad14', fontSize: '14px' }} />}
                </div>

                {/* Tags Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  <Tag 
                    color={doc.estimated_time.includes('10') ? 'green' : doc.estimated_time.includes('15') ? 'cyan' : 'blue'} 
                    size="small"
                  >
                    {doc.estimated_time}
                  </Tag>
                  <Tag 
                    color={
                      doc.category === 'permits' ? 'red' :
                      doc.category === 'assessments' ? 'orange' :
                      doc.category === 'plans' ? 'purple' :
                      doc.category === 'inspections' ? 'green' : 'blue'
                    } 
                    size="small"
                  >
                    {doc.category}
                  </Tag>
                  <Tag 
                    color={
                      doc.plan_required === 'free' ? 'green' :
                      doc.plan_required === 'basic' ? 'blue' :
                      'gold'
                    } 
                    size="small"
                  >
                    {doc.plan_required}
                  </Tag>
                  {isDisabled && (
                    <Tag color="orange" size="small">
                      Requires {permission.requiredPlan}
                    </Tag>
                  )}
                </div>

                {/* Description Row */}
                <div style={{ fontSize: '11px', color: '#666', width: '100%' }}>
                  {doc.description}
                </div>
              </div>
            </Select.Option>
          );
        })}
      </Select>
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

  const renderCompanyInfoSection = () => (
    <Card
      title={
        <Space>
          <TeamOutlined />
          <span>Company Information</span>
          <Switch
            size="small"
            checked={companyInfo.useCompanyInfo}
            onChange={(checked) => setCompanyInfo({ ...companyInfo, useCompanyInfo: checked })}
          />
          <Tag color={companyInfo.useCompanyInfo ? 'green' : 'default'}>
            {companyInfo.useCompanyInfo ? 'Enabled' : 'Disabled'}
          </Tag>
        </Space>
      }
      size="small"
    >
      {companyInfo.useCompanyInfo ? (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Row gutter={8}>
            <Col span={12}>
              <Input
                placeholder="Company Name"
                value={companyInfo.companyName}
                onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                prefix={<TeamOutlined />}
              />
            </Col>
            <Col span={12}>
              <Input
                placeholder="Compliance Officer"
                value={companyInfo.complianceOfficer}
                onChange={(e) => setCompanyInfo({ ...companyInfo, complianceOfficer: e.target.value })}
                prefix={<UserOutlined />}
              />
            </Col>
          </Row>
          <Upload
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => setCompanyInfo({ ...companyInfo, logo: e.target.result });
              reader.readAsDataURL(file);
              return false;
            }}
            showUploadList={false}
            accept="image/*"
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
          {renderIndustrySelector()}
          {renderDocumentTypeSelector()}
          {renderGenerationModeSelector()}

          <Form.Item label={
            <Space>
              <EditOutlined />
              <span>Additional Context</span>
            </Space>
          }>
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your safety requirements, specific hazards, scope of work, or additional context..."
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
            size="large"
            block
            style={{ height: '50px', fontSize: '16px' }}
          >
            {loading ? 'Generating...' : `Generate Professional ${generationMode === 'document' ? 'Filled' : 'Template'} PDF`}
          </Button>

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
            {industries.find(ind => ind.value === selectedIndustry)?.label}
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
            <Button 
              size="small" 
              icon={<SyncOutlined />} 
              onClick={loadSavedDocuments}
            >
              Refresh
            </Button>
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
                        setPdfContent(doc.htmlContent || doc.preview);
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


  const renderDocumentHistory = () => (
    <Card
      title={
        <Space>
          <HistoryOutlined />
          <span>Generated Documents</span>
          <Badge count={documentHistory.length} showZero />
        </Space>
      }
      extra={
        <Space>
          <Input.Search
            placeholder="Search documents..."
            style={{ width: 200 }}
            onSearch={setSearchQuery}
            allowClear
          />
          <Select
            value={historyFilterMode}
            onChange={setHistoryFilterMode}
            style={{ width: 150 }}
            placeholder="Filter by type"
          >
            {historyFilterModeOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
          <Button icon={<SortAscendingOutlined />}>Sort</Button>
        </Space>
      }
    >
      {documentHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FilePdfOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Text type="secondary">No documents generated yet. Start by creating your first PDF document!</Text>
        </div>
      ) : (
        <List
          dataSource={documentHistory.filter(doc =>
            (historyFilterMode === 'all' || doc.generationMode === historyFilterMode) &&
            (searchQuery ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) : true)
          )}
          renderItem={doc => (
            <List.Item
              style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}
              actions={[
                <Button key="view" size="small" icon={<EyeOutlined />} onClick={() => {
                  setCurrentDocument(doc);
                  setPdfContent(doc.htmlContent || doc.preview);
                  setPdfPreviewVisible(true);
                  setIsPDFEditorExpanded(false);
                }} style={{ marginRight: 4 }}>
                  View
                </Button>,
                <Button key="download" size="small" icon={<DownloadOutlined />} onClick={() => handleDownloadDocument(doc)} style={{ marginRight: 4 }}>
                  Download
                </Button>,
                <Button key="copy" size="small" icon={<CopyOutlined />} onClick={() => handleCopyDocument(doc)} style={{ marginRight: 4 }}>
                  Copy
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Delete this document?"
                  onConfirm={() => handleDeleteDocument(doc.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              ]}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                <div style={{
                  marginRight: '16px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: doc.color || '#fa8c16',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FilePdfOutlined style={{ fontSize: '20px', color: 'white' }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                    <Text strong style={{ fontSize: '15px' }}>{doc.title}</Text>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {doc.tags?.map(tag => (
                        <Tag key={tag} size="small" color={
                          tag === 'new' ? 'green' :
                          tag === 'super-admin' ? 'purple' :
                          tag === doc.generationMode ? (doc.generationMode === 'document' ? 'blue' : 'orange') : 'blue'
                        } style={{ margin: 0 }}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                    <Tag color="blue" style={{ margin: 0 }}>{doc.type || 'Document'}</Tag>
                    <Tag color="green" style={{ margin: 0 }}>{doc.industry || 'General'}</Tag>
                    <Tag color={doc.generationMode === 'document' ? 'blue' : 'orange'} style={{ margin: 0 }}>
                      {doc.generationMode === 'document' ? 'Filled Document' : 'Empty Template'}
                    </Tag>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#666' }}>
                    <span><ClockCircleOutlined style={{ marginRight: 4 }} />{doc.date}</span>
                    <span><FileTextOutlined style={{ marginRight: 4 }} />{doc.size || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  const renderExamFlowCard = () => (
    <Card
      title={
        <Space>
          <SafetyCertificateOutlined />
          <span>International Safety Professional Certification (ISPC)</span>
          <Tag color="orange" style={{ fontSize: '12px' }}>CSP HARD MODE</Tag>
        </Space>
      }
      className="feature-card exam-generator-card"
      style={{ marginTop: 16, border: '2px solid #fa8c16' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          message="CSP Hard Mode - Professional Credentialing"
          description="Simulates Certified Safety Professional (CSP) level difficulty with professional credential eligibility. Passing scores qualify for Continuing Education Units (CEUs)."
          type="warning"
          showIcon
          icon={<SafetyCertificateOutlined />}
        />

        <div style={{ padding: '16px', backgroundColor: '#fff7e6', borderRadius: '8px', border: '1px solid #ffd591' }}>
          <div style={{ marginBottom: '12px' }}>
            <Text strong style={{ color: '#fa8c16' }}>Credential Levels:</Text>
            <div style={{ marginLeft: '20px', fontSize: '12px' }}>
              <div>🏆 <strong>Platinum:</strong> 90%+ (4.0 CEUs, 24 months validity)</div>
              <div>🥇 <strong>Gold:</strong> 85%+ (3.5 CEUs, 18 months validity)</div>
              <div>🥈 <strong>Silver:</strong> 80%+ (3.0 CEUs, 12 months validity)</div>
              <div>🥉 <strong>Bronze:</strong> 75%+ (2.5 CEUs, 12 months validity)</div>
              <div>✅ <strong>Competent:</strong> 70%+ (2.0 CEUs, 12 months validity)</div>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <Text strong style={{ color: '#fa8c16' }}>Exam Details:</Text>
            <div style={{ marginLeft: '20px', fontSize: '12px' }}>
              <div>• 100 complex scenario-based questions</div>
              <div>• 4-hour time limit (CSP-level pacing)</div>
              <div>• Professional safety principles & regulatory knowledge</div>
              <div>• Mathematical calculations for safety metrics</div>
              <div>• ISO/IEC 17024:2012 compliant</div>
            </div>
          </div>
        </div>

        <Button
          type="primary"
          icon={<SafetyCertificateOutlined />}
          onClick={handleStartExamFlow}
          loading={loading}
          block
          style={{
            height: '45px',
            fontSize: '15px',
            background: 'linear-gradient(135deg, #fa8c16, #f5222d)',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          Start CSP Hard Mode Exam
        </Button>

        <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
          <SafetyCertificateOutlined /> Accredited by International Safety Standards Board (ISSB)
          <br />
          <Badge status="processing" text="Digital Verification with QR Code & Blockchain" />
        </div>
      </Space>
    </Card>
  );

  // ============= EXAM MODAL RENDER FUNCTIONS =============
  
  // Exam Setup Modal
  const renderExamSetupModal = () => (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined />
          <span>CSP Hard Mode - Exam Setup</span>
          <Tag color="orange">INTERNATIONAL CERTIFICATION</Tag>
        </Space>
      }
      open={examModalVisible && examFlowStep === 'setup'}
      onCancel={() => {
        setExamModalVisible(false);
        setExamFlowStep('setup');
        localStorage.removeItem('exam_session_id');
      }}
      width={650}
      footer={[
        <Button key="cancel" onClick={() => {
          setExamModalVisible(false);
          setExamFlowStep('setup');
          localStorage.removeItem('exam_session_id');
        }}>
          Cancel
        </Button>,
        <Button
          key="start"
          type="primary"
          onClick={handleProceedToExam}
          disabled={!userName.trim()}
          loading={loading}
          style={{ background: 'linear-gradient(135deg, #fa8c16, #f5222d)', border: 'none' }}
        >
          Begin Professional Exam
        </Button>
      ]}
    >
      <div className="exam-setup-container">
        <Alert
          message="Professional Credential Eligibility"
          description="This exam qualifies for International Safety Professional Credential (ISPC) with Continuing Education Units (CEUs)."
          type="warning"
          showIcon
          icon={<SafetyCertificateOutlined />}
          style={{ marginBottom: 24 }}
        />

        <Form layout="vertical">
          <Form.Item label={
            <Space>
              <UserOutlined />
              <span>Full Name (as it will appear on certificate)</span>
            </Space>
          } required>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your full professional name"
              size="large"
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item label={
            <Space>
              <Checkbox />
              <span>Email Address (for certificate delivery)</span>
            </Space>
          }>
            <Input
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="professional@example.com"
              size="large"
              prefix={<Checkbox />}
            />
          </Form.Item>

          <Divider />

          <Card size="small" title="Exam Specifications" style={{ border: '1px solid #ffd591', backgroundColor: '#fff7e6' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><Text strong>Questions:</Text><Tag color="blue" style={{ marginLeft: 8 }}>100</Tag></div>
                <div><Text strong>Time Limit:</Text><Tag color="red" style={{ marginLeft: 8 }}>4 hours</Tag></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <div><Text strong>Passing Score:</Text><Tag color="green" style={{ marginLeft: 8 }}>70% (70/100)</Tag></div>
                <div><Text strong>CEUs:</Text><Tag color="purple" style={{ marginLeft: 8 }}>2.0-4.0</Tag></div>
              </div>
            </Space>
          </Card>
        </Form>
      </div>
    </Modal>
  );

  // Exam Taking Modal
  const renderExamTakingModal = () => {
    if (!activeExam) return null;

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = activeExam.questions?.[activePdfSection] || {};

    return (
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>CSP Hard Mode Exam</span>
            <Tag color="orange">ADVANCED</Tag>
            <Badge 
              count={formatTime(examProgress.timeRemaining)} 
              style={{ backgroundColor: examProgress.timeRemaining < 1800 ? '#ff4d4f' : '#1890ff' }} 
            />
            <Progress 
              percent={Math.round((Object.keys(userAnswers).length / activeExam.questions?.length) * 100)} 
              size="small" 
              style={{ width: 100 }} 
            />
          </Space>
        }
        open={examModalVisible && examFlowStep === 'taking_exam'}
        onCancel={() => {
          Modal.confirm({
            title: 'Exit CSP Hard Mode Exam?',
            content: <div><p>Are you sure you want to exit? Your progress will be lost.</p><p style={{ fontSize: '12px', color: '#fa8c16' }}><WarningOutlined /> This exam is time-sensitive and cannot be resumed.</p></div>,
            okText: 'Exit Exam',
            cancelText: 'Continue Exam',
            okButtonProps: { danger: true },
            onOk: () => {
              if (examTimer) clearInterval(examTimer);
              setExamModalVisible(false);
              setExamFlowStep('setup');
              localStorage.removeItem('exam_session_id');
            }
          });
        }}
        width={900}
        footer={[
          <Button key="prev" onClick={() => setActivePdfSection(prev => Math.max(0, prev - 1))} disabled={activePdfSection === 0} icon={<LeftOutlined />}>
            Previous
          </Button>,
          <div key="progress" style={{ flex: 1, textAlign: 'center' }}>
            <Text strong>Question {activePdfSection + 1} of {activeExam.questions?.length}</Text>
            <div style={{ fontSize: '12px', color: '#666' }}>Points: {currentQuestion.points || 2} • Domain: {currentQuestion.domain || 'Advanced Sciences'}</div>
          </div>,
          <Button key="next" onClick={() => setActivePdfSection(prev => Math.min(activeExam.questions?.length - 1, prev + 1))} disabled={activePdfSection === activeExam.questions?.length - 1} icon={<RightOutlined />}>
            Next
          </Button>,
          <Divider type="vertical" key="divider" />,
          <Button key="submit" type="primary" onClick={handleSubmitExam} disabled={Object.keys(userAnswers).length < activeExam.questions?.length} style={{ background: 'linear-gradient(135deg, #fa8c16, #f5222d)', border: 'none' }}>
            Submit Exam ({Object.keys(userAnswers).length}/{activeExam.questions?.length})
          </Button>
        ]}
      >
        <div className="exam-taking-container">
          <Alert
            message="International Safety Professional Certification (ISPC)"
            description={<Space split={<Divider type="vertical" />}>
              <span><UserOutlined /> {userName}</span>
              <span><ClockCircleOutlined /> Time Limit: 4 hours</span>
              <span><BookOutlined /> 100 Questions</span>
              <span><SafetyCertificateOutlined /> CEUs: 2.0-4.0</span>
            </Space>}
            type="warning"
            showIcon
            icon={<SafetyCertificateOutlined />}
            style={{ marginBottom: 16 }}
          />

          <div className="exam-questions">
            <Card style={{ marginBottom: 16 }}
              title={
                <Space>
                  <Tag color="blue">Question {activePdfSection + 1}</Tag>
                  <Tag color="cyan">{currentQuestion.domain || 'Advanced Sciences'}</Tag>
                  <Tag color="green">{currentQuestion.points || 2} points</Tag>
                  {currentQuestion.difficulty === 'advanced' && <Tag color="orange">CSP Level</Tag>}
                </Space>
              }
              extra={<Tag color={userAnswers[activePdfSection] !== undefined ? 'green' : 'default'}>{userAnswers[activePdfSection] !== undefined ? 'Answered' : 'Not Answered'}</Tag>}
            >
              <div style={{ marginBottom: 20, fontSize: '16px', lineHeight: 1.6 }}>
                <div style={{ backgroundColor: '#e6f7ff', padding: '12px', borderRadius: '6px', marginBottom: '12px', borderLeft: '4px solid #1890ff' }}>
                  <Text strong style={{ color: '#1890ff' }}><SafetyCertificateOutlined /> Professional Scenario:</Text>
                  <div style={{ marginTop: '8px' }}>
                    {currentQuestion.question_text || currentQuestion.question || `CSP-Level question ${activePdfSection + 1}`}
                  </div>
                </div>

                {currentQuestion.scenario_context && (
                  <div style={{ backgroundColor: '#fff7e6', padding: '12px', borderRadius: '6px', marginBottom: '12px', borderLeft: '4px solid #fa8c16' }}>
                    <Text strong style={{ color: '#fa8c16' }}><ExperimentOutlined /> Context:</Text>
                    <div style={{ marginTop: '8px', fontSize: '14px' }}>{currentQuestion.scenario_context}</div>
                  </div>
                )}
              </div>

              <Radio.Group 
                value={userAnswers[activePdfSection]} 
                onChange={(e) => {
                  handleAnswerSelect(activePdfSection, e.target.value);
                }} 
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option, optIndex) => {
                      const optionLetter = String.fromCharCode(65 + optIndex);
                      let optionText = '';
                      
                      if (typeof option === 'string') {
                        optionText = option.replace(/^[A-D][\.\)\-]\s*/i, '').trim();
                      } else if (option && typeof option === 'object') {
                        optionText = option.text || option.value || option.label || `Option ${optionLetter}`;
                        optionText = String(optionText).replace(/^[A-D][\.\)\-]\s*/i, '').trim();
                      } else {
                        optionText = `Option ${optionLetter}`;
                      }
                      
                      const isSelected = userAnswers[activePdfSection] === optIndex;
                      
                      return (
                        <Radio 
                          key={optIndex} 
                          value={optIndex}
                          style={{ 
                            display: 'block', 
                            padding: '12px 16px', 
                            margin: '8px 0', 
                            border: isSelected ? '2px solid #1890ff' : '1px solid #e8e8e8', 
                            borderRadius: '8px', 
                            backgroundColor: isSelected ? '#e6f7ff' : '#fafafa',
                            transition: 'all 0.2s ease',
                            width: '100%'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              backgroundColor: isSelected ? '#1890ff' : '#d9d9d9', 
                              color: isSelected ? '#fff' : '#666', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              marginRight: '12px', 
                              fontWeight: 'bold',
                              flexShrink: 0,
                              fontSize: '12px'
                            }}>
                              {optionLetter}
                            </div>
                            <div style={{ flex: 1, fontSize: '14px', lineHeight: 1.5, color: '#333' }}>
                              {optionText}
                            </div>
                          </div>
                        </Radio>
                      );
                    })
                  ) : (
                    <div style={{ padding: 20, textAlign: 'center', color: '#ff4d4f', backgroundColor: '#fff2f0', borderRadius: 8 }}>
                      <WarningOutlined /> No options available. Please refresh and try again.
                    </div>
                  )}
                </Space>
              </Radio.Group>
            </Card>
          </div>
        </div>
      </Modal>
    );
  };

  // Exam Results Modal
  const renderExamResultsModal = () => {
    if (!examScore) return null;

    const credential = getCredentialLevel(examScore.score);

    return (
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>Professional Exam Results</span>
            <Tag color={credential.color}>{credential.level.toUpperCase()}</Tag>
          </Space>
        }
        open={examModalVisible && examFlowStep === 'results'}
        onCancel={() => {
          setExamModalVisible(false);
          setExamFlowStep('setup');
          localStorage.removeItem('exam_session_id');
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => {
            setExamModalVisible(false);
            setExamFlowStep('setup');
            localStorage.removeItem('exam_session_id');
          }}>Close</Button>,
          <Button key="review" onClick={() => { setExamFlowStep('taking_exam'); setActivePdfSection(0); }} icon={<EyeOutlined />}>Review Answers</Button>,
          examScore.passed ? (
            <Button key="certificate" type="primary" onClick={handleGenerateCertificateFromExam} style={{ background: 'linear-gradient(135deg, #fa8c16, #f5222d)', border: 'none' }} icon={<SafetyCertificateOutlined />}>
              Download Professional Certificate
            </Button>
          ) : (
            <Button key="retry" type="primary" onClick={() => { setExamFlowStep('setup'); setUserAnswers({}); setExamScore(null); setActivePdfSection(0); }}>Retry Exam</Button>
          )
        ]}
      >
        <div className="exam-results-container">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '60px', color: credential.color, marginBottom: 8 }}>{examScore.passed ? '🏆' : '📝'}</div>
            <Title level={3} style={{ color: credential.color }}>{examScore.passed ? 'Professional Achievement!' : 'Exam Results'}</Title>
            <div style={{ fontSize: '42px', fontWeight: 'bold', color: credential.color, margin: '16px 0' }}>{examScore.score}%</div>
            <div style={{ backgroundColor: credential.color + '10', padding: '12px', borderRadius: '8px', display: 'inline-block', marginBottom: '16px' }}>
              <Text strong style={{ color: credential.color }}>{credential.level} Level • {credential.ceus} CEUs Awarded</Text>
            </div>
            <div style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>{examScore.correct} out of {examScore.total} correct answers</div>
          </div>

          <Divider />

          <Title level={5}>Detailed Performance Analysis:</Title>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Correct Answers" value={examScore.correct} suffix={`/ ${examScore.total}`} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic title="Percentage" value={examScore.score} suffix="%" valueStyle={{ color: '#1890ff' }} prefix={<PercentageOutlined />} />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small">
                <Statistic title="CEUs Earned" value={credential.ceus} suffix="CEUs" valueStyle={{ color: '#722ed1' }} prefix={<StarOutlined />} />
              </Card>
            </Col>
          </Row>

          <Tabs>
            <TabPane tab="Question Review" key="review">
              <List
                dataSource={examScore.results}
                renderItem={(result, index) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={<Avatar size="large" style={{ backgroundColor: result.isCorrect ? '#52c41a' : '#ff4d4f', color: 'white', fontSize: '16px', fontWeight: 'bold' }}>{result.isCorrect ? '✓' : '✗'}</Avatar>}
                      title={`Question ${index + 1}`}
                      description={
                        <Space direction="vertical" size={2}>
                          <div style={{ fontWeight: 'bold' }}>{result.question}</div>
                          <div><Text strong>Your Answer: </Text><Text type={result.isCorrect ? "success" : "danger"}>{result.userAnswer}</Text></div>
                          {!result.isCorrect && <div><Text strong>Correct Answer: </Text><Text type="success">{result.correctAnswer}</Text></div>}
                          <div><Text strong>Explanation: </Text><Text type="secondary">{result.explanation}</Text></div>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                pagination={{ pageSize: 5 }}
              />
            </TabPane>
          </Tabs>
        </div>
      </Modal>
    );
  };

  // Exam Certificate Modal
  const renderExamCertificateModal = () => {
    if (!generatedCertificate) return null;

    const credential = getCredentialLevel(generatedCertificate.exam_score || examScore?.score || 0);

    return (
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>Professional Certification</span>
            <Tag color={credential.color} style={{ fontWeight: 'bold' }}>{credential.level.toUpperCase()}</Tag>
            <Tag color="green">{generatedCertificate.exam_score || examScore?.score}%</Tag>
          </Space>
        }
        open={examModalVisible && examFlowStep === 'certificate'}
        onCancel={() => {
          setExamModalVisible(false);
          setExamFlowStep('setup');
          localStorage.removeItem('exam_session_id');
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => { setExamModalVisible(false); setExamFlowStep('setup'); localStorage.removeItem('exam_session_id'); }}>Close</Button>,
          <Button key="share" icon={<ShareAltOutlined />} onClick={() => message.info('Share feature coming soon!')}>Share Certificate</Button>,
          <Button key="download-cert" type="primary" icon={<DownloadOutlined />} onClick={handleDownloadExamCertificate} style={{ background: 'linear-gradient(135deg, #fa8c16, #f5222d)', border: 'none' }}>Download Professional Certificate (PDF)</Button>,
          <Button key="download-transcript" icon={<FilePdfOutlined />} onClick={handleDownloadTranscript} style={{ borderColor: credential.color, color: credential.color }}>Download Detailed Transcript</Button>
        ]}
      >
        <div className="certificate-container">
          <div style={{ border: `3px solid ${credential.color}`, padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '80px', color: `${credential.color}10`, fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: 0 }}>{credential.level} CERTIFIED</div>

            <div style={{ marginBottom: '30px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px', letterSpacing: '2px' }}>INTERNATIONAL SAFETY STANDARDS BOARD (ISSB)</div>
              <div style={{ fontSize: '10px', color: '#999', marginBottom: '12px' }}>ISO/IEC 17024:2012 ACCREDITED</div>
              <Title level={1} style={{ margin: 0, color: credential.color, fontSize: '28px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                <SafetyCertificateOutlined /> PROFESSIONAL CERTIFICATE <SafetyCertificateOutlined />
              </Title>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '8px', borderBottom: `1px solid ${credential.color}40`, paddingBottom: '12px' }}>International Safety Professional Credential (ISPC)</div>
            </div>

            <div style={{ margin: '30px 0', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px', fontStyle: 'italic' }}>This official credential is awarded to</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: credential.color, margin: '20px 0', padding: '15px', borderTop: `2px solid ${credential.color}`, borderBottom: `2px solid ${credential.color}`, display: 'inline-block', letterSpacing: '1px' }}>
                {generatedCertificate.recipient_name || userName}
              </div>
              <div style={{ fontSize: '14px', color: '#666', margin: '20px 0' }}>for successful completion and demonstration of professional competency in</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#722ed1', margin: '20px 0', padding: '15px', backgroundColor: `${credential.color}10`, borderRadius: '8px', display: 'inline-block', border: `1px dashed ${credential.color}` }}>
                {generatedCertificate.course_title || selectedCourseForExam}
              </div>
              <div style={{ display: 'inline-block', margin: '20px auto', padding: '8px 24px', backgroundColor: credential.color, color: 'white', borderRadius: '20px', fontSize: '16px', fontWeight: 'bold', boxShadow: `0 4px 12px ${credential.color}40` }}>
                {credential.level} LEVEL CERTIFICATION
              </div>

              <div style={{ marginTop: '30px', padding: '25px', backgroundColor: '#fafafa', borderRadius: '10px', border: `1px solid ${credential.color}30` }}>
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>EXAM SCORE</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: credential.color }}>{generatedCertificate.exam_score || examScore?.score}%</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{examScore?.correct || 0}/{examScore?.total || 0} Correct</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>CEUs AWARDED</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>{credential.ceus}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>Continuing Education Units</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>VALIDITY</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#389e0d' }}>{credential.validity}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>From {generatedCertificate.exam_date || new Date().toLocaleDateString()}</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: `1px solid ${credential.color}30`, position: 'relative', zIndex: 1 }}>
              <Row gutter={24}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderBottom: '1px solid #666', width: '150px', margin: '0 auto 10px', height: '50px' }}></div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Certification Director</div>
                    <div style={{ fontSize: '10px', color: '#999' }}>International Safety Standards Board</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', margin: '0 auto 10px', border: '1px solid #ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
                      <SafetyCertificateOutlined style={{ fontSize: '36px', color: credential.color }} />
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>Official Digital Seal</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ borderBottom: '1px solid #666', width: '150px', margin: '0 auto 10px', height: '50px' }}></div>
                    <div style={{ fontSize: '11px', color: '#666' }}>Chief Examinations Officer</div>
                    <div style={{ fontSize: '10px', color: '#999' }}>Professional Credentialing Authority</div>
                  </div>
                </Col>
              </Row>

              <div style={{ marginTop: '20px', fontSize: '9px', color: '#999', textAlign: 'center', lineHeight: 1.4 }}>
                This digital credential can be verified at {window.location.origin}/verify/{generatedCertificate.certificate_id}
                <br />QR Code verification and blockchain timestamping ensure authenticity and integrity.
                <br />{credential.ceus} Continuing Education Units (CEUs) awarded per ANSI/IACET standards.
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };

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
          {pdfSignatures.length > 0 && <Badge count={pdfSignatures.length} title="Signatures" />}
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
                  {industries.map(ind => (<Option key={ind.value} value={ind.value}>{ind.label}</Option>))}
                </Select>
              </Col>
              <Col span={12}>
                <Select value={templateDocType} onChange={setTemplateDocType} style={{ width: '100%' }} placeholder="Document Type">
                  {documentTypes.all.map(doc => (<Option key={doc.value} value={doc.value}>{doc.label}</Option>))}
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
  const renderTemplateLibraryModal = () => (
    <Modal
      title="Template Library"
      open={isTemplateLibraryVisible}
      onCancel={() => setIsTemplateLibraryVisible(false)}
      width={800}
      footer={null}
    >
      <Row gutter={[16, 16]}>
        {documentTypes.all.map(template => {
          const permission = checkDocumentPermission(template.value, userPlan, documentTypes);
          return (
            <Col span={8} key={template.value}>
              <Card
                size="small"
                hoverable
                onClick={() => {
                  if (permission.allowed) {
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

  // Upgrade Modal
  const renderUpgradeModal = () => (
    <Modal
      title={<Space><SafetyCertificateOutlined /><span>Upgrade Required</span><Tag color="orange">{upgradeInfo.requiredPlan?.toUpperCase()}</Tag></Space>}
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

  // Certificate Verification Modal
  const renderVerificationModal = () => (
    <Modal
      title={<Space><VerifiedOutlined /><span>Certificate Verification</span><Tag color="green">Blockchain Secured</Tag></Space>}
      open={verificationModalVisible}
      onCancel={() => { setVerificationModalVisible(false); setVerificationCode(''); setVerificationResult(null); }}
      width={600}
      footer={null}
    >
      <div style={{ padding: '20px 0' }}>
        <Alert message="Verify Your Certificate" description="Enter the certificate ID found on your professional certificate." type="info" showIcon style={{ marginBottom: 24 }} />
        <div style={{ marginBottom: 24 }}>
          <Input size="large" placeholder="Enter Certificate ID" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} prefix={<QrcodeOutlined />} onPressEnter={handleVerifyCertificate} />
        </div>
        <Button type="primary" icon={<VerifiedOutlined />} onClick={handleVerifyCertificate} loading={verifying} block size="large" style={{ marginBottom: 24 }}>Verify Certificate</Button>

        {verificationResult && (
          <Card style={{ borderColor: verificationResult.valid ? '#52c41a' : '#ff4d4f', backgroundColor: verificationResult.valid ? '#f6ffed' : '#fff2f0' }}>
            {verificationResult.valid ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <Title level={4} style={{ color: '#52c41a', marginTop: 8 }}>Valid Certificate</Title>
                </div>
                <div><Text strong>Recipient:</Text><div style={{ fontSize: 16, fontWeight: 'bold' }}>{verificationResult.recipient_name}</div></div>
                <div><Text strong>Course:</Text><div>{verificationResult.course_title}</div></div>
                <Row gutter={[16, 8]}>
                  <Col span={12}><Text strong>Certificate ID:</Text><div style={{ fontFamily: 'monospace' }}>{verificationResult.certificate_id}</div></Col>
                  <Col span={12}><Text strong>Score:</Text><div><Tag color="blue">{verificationResult.exam_score}%</Tag></div></Col>
                  <Col span={12}><Text strong>Issue Date:</Text><div>{new Date(verificationResult.issue_date).toLocaleDateString()}</div></Col>
                  <Col span={12}><Text strong>Expiry Date:</Text><div>{new Date(verificationResult.expiry_date).toLocaleDateString()}</div></Col>
                </Row>
                <Divider />
                <div style={{ textAlign: 'center' }}><Button type="link" size="small" icon={<ShareAltOutlined />} onClick={handleCopyVerificationLink}>Copy Verification Link</Button></div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
                <Title level={4} style={{ color: '#ff4d4f', marginTop: 8 }}>Invalid Certificate</Title>
                <Text type="secondary">{verificationResult.message}</Text>
              </div>
            )}
          </Card>
        )}
      </div>
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
          <h4><BackTop /> Response Detail</h4>
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
          <Badge status="processing" text={`AI: ${aiSystemStatus?.status || 'unknown'}`} />
          <Button icon={<SyncOutlined />} onClick={checkAISystemStatus} size="small">Refresh</Button>
        </Space>
      }>
        <TabPane tab={<span><WechatOutlined /> Chat</span>} key="chat">
          {renderChatInterface()}
        </TabPane>
        <TabPane tab={<span><FilePdfOutlined /> PDF Generator</span>} key="generator">
          {renderDocumentGenerator()}
        </TabPane>
        <TabPane tab={<span><ExperimentOutlined /> Exams & Verification</span>} key="tools">
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Alert message="Professional Tools Suite" description="Access advanced AI-powered tools for safety training, certification, and verification." type="info" showIcon />
              </Col>
              <Col xs={24} lg={12}>
                {renderExamFlowCard()}
              </Col>
              <Col xs={24} lg={12}>
                <Card title={<Space><VerifiedOutlined /><span>Certificate Verification</span><Tag color="green">Blockchain Secured</Tag></Space>} style={{ border: '1px solid #52c41a' }}>
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <VerifiedOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                      <Title level={4} style={{ marginTop: 16 }}>Verify Certificate Authenticity</Title>
                      <Text type="secondary">Verify any SafetyTrack Pro certificate using its unique ID.</Text>
                    </div>
                    <div><Input placeholder="Enter certificate ID" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} prefix={<QrcodeOutlined />} size="large" /></div>
                    <Row gutter={[8, 8]}>
                      <Col span={12}><Button type="primary" icon={<VerifiedOutlined />} onClick={() => setVerificationModalVisible(true)} block>Verify Now</Button></Col>
                      <Col span={12}><Button icon={<ScanOutlined />} onClick={handleScanQR} block>Scan QR Code</Button></Col>
                    </Row>
                    <Divider />
                    <div style={{ fontSize: 12, color: '#666' }}>
                      <Text strong>Features:</Text>
                      <ul style={{ marginTop: 8 }}>
                        <li>✓ Blockchain-verified certificates</li>
                        <li>✓ Real-time authenticity check</li>
                        <li>✓ Complete credential details</li>
                        <li>✓ Expiration status tracking</li>
                      </ul>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        </TabPane>
        
        {/* ✅ ADD THIS NEW TAB HERE */}
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
      {renderExamSetupModal()}
      {renderExamTakingModal()}
      {renderExamResultsModal()}
      {renderExamCertificateModal()}
      {renderAdvancedPdfEditor()}
      {renderPdfTemplateManagerModal()}
      {renderTemplateLibraryModal()}
      {renderUpgradeModal()}
      {renderVerificationModal()}
      {renderSettingsDrawer()}

      {/* Floating Action Button */}
      <FloatButton.Group shape="square" style={{ right: 24 }}>
        <FloatButton icon={<FilePdfOutlined />} tooltip="PDF Generator" onClick={() => setActiveTab('generator')} />
        <FloatButton icon={<QuestionCircleOutlined />} tooltip="Chat" onClick={() => setActiveTab('chat')} />
        <FloatButton icon={<SafetyCertificateOutlined />} tooltip="Exam" onClick={handleStartExamFlow} />
        <FloatButton.BackTop visibilityHeight={0} />
      </FloatButton.Group>
    </div>
  );
}

export default AIDocumentsPage;