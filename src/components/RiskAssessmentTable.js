// components/RiskAssessmentTable.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Tag,
  Progress,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Descriptions,
  List,
  Divider,
  Tooltip,
  message,
  Steps,
  Checkbox,
  Radio,
  Switch,
  InputNumber,
  Badge,
  Avatar,
  Dropdown,
  Menu,
  Popconfirm,
  Drawer,
  Typography,
  Collapse,
  Timeline,
  Tabs,
  Alert,
  Empty,
  Spin
} from 'antd';
import {
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  DownloadOutlined,
  CopyOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  CloudDownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  FireOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  SyncOutlined,
  RocketOutlined,
  ExperimentOutlined,
  BankOutlined,
  BuildOutlined,
  MedicineBoxOutlined,
  CarOutlined,
  IndustryOutlined,
  ThunderboltOutlined,
  ShieldOutlined,
  LockOutlined,
  GlobalOutlined,
  ShopOutlined,
  HomeOutlined,
  WifiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  CodeOutlined,
  RobotOutlined,
  BulbOutlined,
  CoffeeOutlined,
  CrownOutlined,
  FlagOutlined,
  HeartOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { Panel } = Collapse;

// ============================================
// COMPREHENSIVE INDUSTRY TEMPLATES
// ============================================

const INDUSTRY_TEMPLATES = {
  // ============================================
  // 1. AVIATION SECURITY
  // ============================================
  aviation: {
    id: 'aviation',
    name: 'Aviation Security Risk Assessment',
    description: 'ICAO Annex 17 compliant security risk assessment for airports and aviation operations',
    icon: <RocketOutlined />,
    color: '#722ed1',
    sections: [
      {
        id: 'threat_assessment',
        title: 'Security Threat Risk Assessment Matrix',
        description: 'Comprehensive threat assessment covering terrorism, insider threats, and unauthorized access',
        fields: [
          { id: 'threat_type', label: 'Threat Type', type: 'select', required: true, options: ['Terrorism', 'Insider Threat', 'Unauthorized Access', 'Cyber Attack', 'Unruly Passengers', 'Cargo Threat', 'General Crime'] },
          { id: 'scenario', label: 'Scenario Description', type: 'textarea', required: true },
          { id: 'potential_consequence', label: 'Potential Consequence', type: 'textarea', required: true },
          { id: 'existing_controls', label: 'Existing Controls', type: 'textarea' },
          { id: 'likelihood', label: 'Likelihood (1-5)', type: 'number', min: 1, max: 5, required: true },
          { id: 'severity', label: 'Severity (1-5)', type: 'number', min: 1, max: 5, required: true },
          { id: 'risk_level', label: 'Risk Level', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] }
        ]
      },
      {
        id: 'physical_security',
        title: 'Physical Security Measures Assessment',
        description: 'Assessment of physical security infrastructure and systems',
        fields: [
          { id: 'measure_type', label: 'Security Measure', type: 'select', options: ['Perimeter Fencing', 'Intrusion Detection', 'Access Control Gates', 'Vehicle Barriers', 'Bollards', 'Access Control Systems', 'CCTV Cameras', 'Lighting', 'Security Alarms', 'Security Checkpoints', 'Explosive Detection'] },
          { id: 'location', label: 'Location', type: 'text' },
          { id: 'status', label: 'Status', type: 'select', options: ['OK', 'Deficient', 'Needs Upgrade', 'Not Installed'] },
          { id: 'last_test', label: 'Last Test Date', type: 'date' },
          { id: 'next_due', label: 'Next Due Date', type: 'date' },
          { id: 'upgrade_needed', label: 'Upgrade Needed', type: 'boolean' }
        ]
      },
      {
        id: 'access_control',
        title: 'Access Control Assessment',
        description: 'Evaluation of access control systems and procedures',
        fields: [
          { id: 'access_point', label: 'Access Point', type: 'select', options: ['Airside Access Gates', 'Terminal Staff Entrances', 'Cargo Facility Access', 'Maintenance Areas', 'Air Traffic Control', 'Fuel Farm', 'Security Operations Center', 'Emergency Operations Center', 'Baggage Handling Areas'] },
          { id: 'authorized_personnel', label: 'Authorized Personnel Count', type: 'number' },
          { id: 'control_method', label: 'Control Method', type: 'select', options: ['Card Reader', 'Biometric', 'Manual Check', 'Combined'] },
          { id: 'monitoring', label: 'Monitoring Type', type: 'select', options: ['CCTV', 'Patrol', 'Both', 'None'] },
          { id: 'compliance_rate', label: 'Compliance Rate (%)', type: 'number', min: 0, max: 100 },
          { id: 'risk_level', label: 'Risk Level', type: 'select', options: ['Low', 'Medium', 'High'] }
        ]
      },
      {
        id: 'identity_management',
        title: 'Identity Management and Background Checks',
        description: 'Personnel security and identity verification processes',
        fields: [
          { id: 'personnel_category', label: 'Personnel Category', type: 'select', options: ['Airport Staff', 'Airline Staff', 'Ground Handlers', 'Concessionaires', 'Contractors', 'Vendors', 'Cleaning Staff', 'Security Personnel', 'Law Enforcement', 'Emergency Services'] },
          { id: 'background_check', label: 'Background Check Type', type: 'select', options: ['Basic', 'Enhanced', 'Security Clearance', 'Level 1', 'Level 2'] },
          { id: 'recheck_frequency', label: 'Re-check Frequency', type: 'select', options: ['Annually', 'Bi-annually', 'Quarterly', 'Monthly'] },
          { id: 'id_badge_system', label: 'ID Badge System', type: 'select', options: ['Smart Card', 'Biometric', 'Visual', 'Combined'] },
          { id: 'access_level', label: 'Access Level', type: 'select', options: ['Public', 'Restricted', 'Secure', 'High Security'] },
          { id: 'compliance_rate', label: 'Compliance Rate (%)', type: 'number', min: 0, max: 100 }
        ]
      },
      {
        id: 'cyber_security',
        title: 'Cyber Security Assessment',
        description: 'Evaluation of cyber security measures and vulnerabilities',
        fields: [
          { id: 'system_name', label: 'System Name', type: 'select', options: ['Air Traffic Systems', 'Flight Information Systems', 'Security Systems', 'Passenger Processing', 'Baggage Handling', 'Billing/Financial', 'Employee Databases', 'Public Wi-Fi', 'Administrative Networks', 'Emergency Communications', 'SCADA/Industrial Controls'] },
          { id: 'criticality', label: 'Criticality', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'] },
          { id: 'protection_level', label: 'Protection Level', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
          { id: 'last_audit', label: 'Last Audit Date', type: 'date' },
          { id: 'vulnerabilities', label: 'Vulnerabilities', type: 'textarea' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      }
    ]
  },

  // ============================================
  // 2. OIL & GAS
  // ============================================
  oil_gas: {
    id: 'oil_gas',
    name: 'Oil & Gas Process Safety Assessment',
    description: 'API RP 75 compliant risk assessment for upstream/midstream/downstream operations',
    icon: <ExperimentOutlined />,
    color: '#000000',
    sections: [
      {
        id: 'process_hazard',
        title: 'Process Hazard Analysis',
        description: 'Identification and analysis of process safety hazards',
        fields: [
          { id: 'process_unit', label: 'Process Unit', type: 'select', required: true, options: ['Drilling', 'Production', 'Refining', 'Transportation', 'Storage', 'Decommissioning'] },
          { id: 'hazard_type', label: 'Hazard Type', type: 'select', required: true, options: ['Fire', 'Explosion', 'Toxic Release', 'Flammable Release', 'Overpressure', 'Reaction'] },
          { id: 'scenario', label: 'Scenario Description', type: 'textarea', required: true },
          { id: 'consequence', label: 'Potential Consequence', type: 'textarea', required: true },
          { id: 'likelihood', label: 'Likelihood (1-5)', type: 'number', min: 1, max: 5, required: true },
          { id: 'severity', label: 'Severity (1-5)', type: 'number', min: 1, max: 5, required: true },
          { id: 'risk_level', label: 'Risk Level', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] }
        ]
      },
      {
        id: 'mechanical_integrity',
        title: 'Mechanical Integrity Assessment',
        description: 'Evaluation of mechanical systems and equipment integrity',
        fields: [
          { id: 'equipment_type', label: 'Equipment Type', type: 'select', options: ['Vessels', 'Piping', 'Pumps', 'Compressors', 'Valves', 'Safety Systems', 'Pressure Relief', 'Instrumentation'] },
          { id: 'inspection_frequency', label: 'Inspection Frequency', type: 'select', options: ['Monthly', 'Quarterly', 'Bi-Annually', 'Annually'] },
          { id: 'last_inspection', label: 'Last Inspection Date', type: 'date' },
          { id: 'next_inspection', label: 'Next Inspection Date', type: 'date' },
          { id: 'condition', label: 'Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'] },
          { id: 'deficiencies', label: 'Deficiencies Found', type: 'textarea' }
        ]
      },
      {
        id: 'management_of_change',
        title: 'Management of Change Assessment',
        description: 'Evaluation of change management processes and procedures',
        fields: [
          { id: 'change_type', label: 'Change Type', type: 'select', options: ['Equipment', 'Process', 'Personnel', 'Procedural', 'Organizational'] },
          { id: 'risk_assessment', label: 'Risk Assessment Performed', type: 'boolean' },
          { id: 'approval_process', label: 'Approval Process', type: 'select', options: ['Formal', 'Informal', 'None'] },
          { id: 'training_provided', label: 'Training Provided', type: 'boolean' },
          { id: 'documentation', label: 'Documentation Updated', type: 'boolean' },
          { id: 'effectiveness', label: 'Effectiveness Rating', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] }
        ]
      }
    ]
  },

  // ============================================
  // 3. HEALTHCARE
  // ============================================
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare Patient Safety Assessment',
    description: 'JCI compliant assessment for healthcare facilities and patient safety',
    icon: <MedicineBoxOutlined />,
    color: '#eb2f96',
    sections: [
      {
        id: 'patient_safety',
        title: 'Patient Safety Risk Assessment',
        description: 'Comprehensive patient safety risk identification and mitigation',
        fields: [
          { id: 'risk_category', label: 'Risk Category', type: 'select', required: true, options: ['Clinical', 'Medication', 'Infection', 'Surgical', 'Patient Fall', 'Pressure Ulcer', 'Medical Device'] },
          { id: 'incident_type', label: 'Incident Type', type: 'select', required: true, options: ['Near Miss', 'Adverse Event', 'Sentinel Event', 'No Harm'] },
          { id: 'description', label: 'Description', type: 'textarea', required: true },
          { id: 'likelihood', label: 'Likelihood (1-5)', type: 'number', min: 1, max: 5, required: true },
          { id: 'severity', label: 'Severity (1-5)', type: 'number', min: 1, max: 5, required: true },
          { id: 'risk_score', label: 'Risk Score', type: 'number', min: 1, max: 25 }
        ]
      },
      {
        id: 'infection_control',
        title: 'Infection Control Assessment',
        description: 'Evaluation of infection prevention and control measures',
        fields: [
          { id: 'area_type', label: 'Area Type', type: 'select', options: ['ICU', 'ER', 'OR', 'General Ward', 'Laboratory', 'Pharmacy'] },
          { id: 'hand_hygiene', label: 'Hand Hygiene Compliance (%)', type: 'number', min: 0, max: 100 },
          { id: 'ppe_compliance', label: 'PPE Compliance (%)', type: 'number', min: 0, max: 100 },
          { id: 'surface_cleaning', label: 'Surface Cleaning Protocol', type: 'select', options: ['Comprehensive', 'Standard', 'Basic', 'Inadequate'] },
          { id: 'infection_rate', label: 'Infection Rate (%)', type: 'number', min: 0, max: 100 },
          { id: 'deficiencies', label: 'Deficiencies Identified', type: 'textarea' }
        ]
      },
      {
        id: 'medication_safety',
        title: 'Medication Safety Assessment',
        description: 'Evaluation of medication management and safety procedures',
        fields: [
          { id: 'medication_type', label: 'Medication Type', type: 'select', options: ['High-Risk', 'Controlled', 'Chemotherapy', 'Insulin', 'Anticoagulants', 'Pediatric'] },
          { id: 'ordering_process', label: 'Ordering Process', type: 'select', options: ['Electronic', 'Paper', 'Combined'] },
          { id: 'verification_steps', label: 'Verification Steps', type: 'number', min: 0 },
          { id: 'double_check', label: 'Double Check Required', type: 'boolean' },
          { id: 'error_rate', label: 'Medication Error Rate', type: 'number', min: 0, max: 100 },
          { id: 'improvements', label: 'Improvements Needed', type: 'textarea' }
        ]
      }
    ]
  },

  // ============================================
  // 4. MINING
  // ============================================
  mining: {
    id: 'mining',
    name: 'Mining Operations Risk Assessment',
    description: 'MSHA compliant assessment for surface and underground mining operations',
    icon: <BuildOutlined />,
    color: '#fa8c16',
    sections: [
      {
        id: 'ground_control',
        title: 'Ground Control Assessment',
        description: 'Evaluation of ground stability and control measures',
        fields: [
          { id: 'mine_type', label: 'Mine Type', type: 'select', required: true, options: ['Surface', 'Underground', 'Quarry', 'Placer', 'In-situ'] },
          { id: 'ground_stability', label: 'Ground Stability Rating', type: 'select', options: ['Stable', 'Moderate', 'Unstable', 'Critical'] },
          { id: 'support_system', label: 'Support System Type', type: 'select', options: ['Roof Bolts', 'Cables', 'Shotcrete', 'Steel Supports', 'Combined'] },
          { id: 'last_inspection', label: 'Last Inspection Date', type: 'date' },
          { id: 'deficiencies', label: 'Deficiencies Found', type: 'textarea' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'ventilation',
        title: 'Ventilation System Assessment',
        description: 'Evaluation of mine ventilation and air quality systems',
        fields: [
          { id: 'ventilation_type', label: 'Ventilation Type', type: 'select', options: ['Natural', 'Forced', 'Exhaust', 'Combined'] },
          { id: 'air_quality', label: 'Air Quality Rating', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
          { id: 'gas_monitoring', label: 'Gas Monitoring System', type: 'select', options: ['Continuous', 'Periodic', 'Manual', 'None'] },
          { id: 'dust_control', label: 'Dust Control Measures', type: 'select', options: ['Comprehensive', 'Basic', 'Inadequate', 'None'] },
          { id: 'last_test', label: 'Last Test Date', type: 'date' },
          { id: 'deficiencies', label: 'Deficiencies Identified', type: 'textarea' }
        ]
      },
      {
        id: 'equipment_safety',
        title: 'Equipment Safety Assessment',
        description: 'Evaluation of mining equipment safety and maintenance',
        fields: [
          { id: 'equipment_type', label: 'Equipment Type', type: 'select', options: ['Excavators', 'Haul Trucks', 'Drills', 'Loaders', 'Conveyors', 'Crushers'] },
          { id: 'safety_features', label: 'Safety Features', type: 'select', options: ['Complete', 'Partial', 'Missing', 'None'] },
          { id: 'maintenance_schedule', label: 'Maintenance Schedule', type: 'select', options: ['Regular', 'Irregular', 'Reactive', 'None'] },
          { id: 'operator_training', label: 'Operator Training', type: 'select', options: ['Comprehensive', 'Basic', 'Minimal', 'None'] },
          { id: 'last_maintenance', label: 'Last Maintenance Date', type: 'date' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      }
    ]
  },

  // ============================================
  // 5. CONSTRUCTION
  // ============================================
  construction: {
    id: 'construction',
    name: 'Construction Site Safety Assessment',
    description: 'OSHA compliant assessment for construction sites and activities',
    icon: <BankOutlined />,
    color: '#faad14',
    sections: [
      {
        id: 'site_safety',
        title: 'Site Safety Planning Assessment',
        description: 'Evaluation of construction site safety planning and procedures',
        fields: [
          { id: 'project_type', label: 'Project Type', type: 'select', required: true, options: ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Renovation', 'Demolition'] },
          { id: 'safety_plan', label: 'Safety Plan', type: 'select', options: ['Comprehensive', 'Standard', 'Basic', 'None'] },
          { id: 'site_hazards', label: 'Site Hazards', type: 'textarea' },
          { id: 'emergency_procedures', label: 'Emergency Procedures', type: 'select', options: ['Documented', 'Informal', 'None'] },
          { id: 'first_aid', label: 'First Aid Facilities', type: 'select', options: ['Fully Equipped', 'Basic', 'Inadequate', 'None'] },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'fall_protection',
        title: 'Fall Protection Assessment',
        description: 'Evaluation of fall protection systems and procedures',
        fields: [
          { id: 'work_at_height', label: 'Work at Height Involved', type: 'boolean' },
          { id: 'fall_protection_type', label: 'Fall Protection Type', type: 'select', options: ['Guardrails', 'Safety Nets', 'Personal Fall Arrest', 'Combined'] },
          { id: 'inspection_frequency', label: 'Inspection Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'None'] },
          { id: 'last_inspection', label: 'Last Inspection Date', type: 'date' },
          { id: 'training_provided', label: 'Training Provided', type: 'boolean' },
          { id: 'deficiencies', label: 'Deficiencies Found', type: 'textarea' }
        ]
      },
      {
        id: 'equipment_operation',
        title: 'Equipment Operation Assessment',
        description: 'Evaluation of construction equipment safety',
        fields: [
          { id: 'equipment_type', label: 'Equipment Type', type: 'select', options: ['Cranes', 'Forklifts', 'Excavators', 'Scaffolding', 'Lifts', 'Power Tools'] },
          { id: 'certification', label: 'Operator Certification', type: 'select', options: ['Valid', 'Expired', 'None'] },
          { id: 'inspection_schedule', label: 'Inspection Schedule', type: 'select', options: ['Regular', 'Irregular', 'None'] },
          { id: 'maintenance_logs', label: 'Maintenance Logs', type: 'select', options: ['Current', 'Outdated', 'None'] },
          { id: 'last_inspection', label: 'Last Inspection Date', type: 'date' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      }
    ]
  },

  // ============================================
  // 6. MARINE
  // ============================================
  marine: {
    id: 'marine',
    name: 'Marine & Offshore Safety Assessment',
    description: 'IMO ISM Code compliant marine operations safety assessment',
    icon: <RocketOutlined />,
    color: '#13c2c2',
    sections: [
      {
        id: 'navigation_safety',
        title: 'Navigation Safety Assessment',
        description: 'Evaluation of navigation safety systems and procedures',
        fields: [
          { id: 'vessel_type', label: 'Vessel Type', type: 'select', required: true, options: ['Cargo Ship', 'Tanker', 'Passenger Ship', 'Offshore Support', 'Fishing Vessel', 'Port Operations'] },
          { id: 'navigation_equipment', label: 'Navigation Equipment', type: 'select', options: ['Complete', 'Partial', 'Deficient'] },
          { id: 'charts', label: 'Charts & Publications', type: 'select', options: ['Current', 'Outdated', 'None'] },
          { id: 'bridge_procedures', label: 'Bridge Procedures', type: 'select', options: ['Documented', 'Informal', 'None'] },
          { id: 'last_inspection', label: 'Last Inspection Date', type: 'date' },
          { id: 'deficiencies', label: 'Deficiencies Identified', type: 'textarea' }
        ]
      },
      {
        id: 'cargo_operations',
        title: 'Cargo Operations Assessment',
        description: 'Evaluation of cargo handling and safety procedures',
        fields: [
          { id: 'cargo_type', label: 'Cargo Type', type: 'select', options: ['General', 'Hazardous', 'Liquid', 'Gas', 'Bulk', 'Refrigerated'] },
          { id: 'handling_procedures', label: 'Handling Procedures', type: 'select', options: ['Comprehensive', 'Standard', 'Basic', 'None'] },
          { id: 'safety_equipment', label: 'Safety Equipment', type: 'select', options: ['Complete', 'Partial', 'Deficient'] },
          { id: 'training_provided', label: 'Training Provided', type: 'boolean' },
          { id: 'incident_history', label: 'Incident History', type: 'textarea' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'emergency_preparedness',
        title: 'Emergency Preparedness Assessment',
        description: 'Evaluation of emergency response capabilities',
        fields: [
          { id: 'emergency_plan', label: 'Emergency Plan', type: 'select', options: ['Documented', 'Informal', 'None'] },
          { id: 'drill_frequency', label: 'Drill Frequency', type: 'select', options: ['Monthly', 'Quarterly', 'Bi-Annually', 'Annually'] },
          { id: 'last_drill', label: 'Last Drill Date', type: 'date' },
          { id: 'equipment_available', label: 'Emergency Equipment', type: 'select', options: ['Complete', 'Partial', 'Deficient'] },
          { id: 'training_completed', label: 'Training Completed', type: 'select', options: ['100%', '75%', '50%', '25%', 'None'] },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      }
    ]
  },

  // ============================================
  // 7. MANUFACTURING
  // ============================================
  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing Plant Safety Assessment',
    description: 'Comprehensive safety assessment for manufacturing operations',
    icon: <IndustryOutlined />,
    color: '#1890ff',
    sections: [
      {
        id: 'machine_safety',
        title: 'Machine Safety Assessment',
        description: 'Evaluation of machine guarding and safety systems',
        fields: [
          { id: 'machine_type', label: 'Machine Type', type: 'select', required: true, options: ['Presses', 'Conveyors', 'Robotics', 'CNC', 'Mixers', 'Packaging'] },
          { id: 'guarding', label: 'Machine Guarding', type: 'select', options: ['Complete', 'Partial', 'Missing'] },
          { id: 'emergency_stops', label: 'Emergency Stops', type: 'select', options: ['Operational', 'Partial', 'Non-Operational'] },
          { id: 'lockout_tagout', label: 'Lockout/Tagout', type: 'select', options: ['Implemented', 'Partial', 'None'] },
          { id: 'last_inspection', label: 'Last Inspection Date', type: 'date' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'hazardous_materials',
        title: 'Hazardous Materials Assessment',
        description: 'Evaluation of hazardous material handling and storage',
        fields: [
          { id: 'material_type', label: 'Material Type', type: 'select', options: ['Chemicals', 'Flammables', 'Corrosives', 'Toxics', 'Reactive'] },
          { id: 'storage', label: 'Storage Conditions', type: 'select', options: ['Proper', 'Adequate', 'Inadequate', 'Unsafe'] },
          { id: 'containment', label: 'Containment Systems', type: 'select', options: ['Comprehensive', 'Basic', 'None'] },
          { id: 'spill_response', label: 'Spill Response Plan', type: 'select', options: ['Documented', 'Informal', 'None'] },
          { id: 'sds_available', label: 'SDS Available', type: 'boolean' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'ergonomics',
        title: 'Ergonomics Assessment',
        description: 'Evaluation of workplace ergonomics and human factors',
        fields: [
          { id: 'work_station', label: 'Work Station Design', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
          { id: 'repetitive_tasks', label: 'Repetitive Tasks', type: 'boolean' },
          { id: 'lifting_requirements', label: 'Lifting Requirements', type: 'select', options: ['None', 'Light', 'Moderate', 'Heavy'] },
          { id: 'injury_history', label: 'Injury History', type: 'textarea' },
          { id: 'controls', label: 'Controls Implemented', type: 'textarea' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      }
    ]
  },

  // ============================================
  // 8. CHEMICAL
  // ============================================
  chemical: {
    id: 'chemical',
    name: 'Chemical Process Safety Assessment',
    description: 'Comprehensive chemical process safety and risk assessment',
    icon: <ExperimentOutlined />,
    color: '#13c2c2',
    sections: [
      {
        id: 'process_safety',
        title: 'Process Safety Management Assessment',
        description: 'Evaluation of process safety management systems',
        fields: [
          { id: 'process_type', label: 'Process Type', type: 'select', required: true, options: ['Batch', 'Continuous', 'Semi-Batch'] },
          { id: 'hazard_analysis', label: 'Hazard Analysis Completed', type: 'select', options: ['HAZOP', 'FMEA', 'What-If', 'None'] },
          { id: 'safety_instrumentation', label: 'Safety Instrumentation', type: 'select', options: ['Complete', 'Partial', 'None'] },
          { id: 'emergency_shutdown', label: 'Emergency Shutdown System', type: 'select', options: ['Operational', 'Partial', 'Non-Operational'] },
          { id: 'last_review', label: 'Last Review Date', type: 'date' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'environmental',
        title: 'Environmental Impact Assessment',
        description: 'Evaluation of environmental risks and controls',
        fields: [
          { id: 'emissions', label: 'Emissions Control', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
          { id: 'waste_management', label: 'Waste Management', type: 'select', options: ['Comprehensive', 'Standard', 'Basic', 'None'] },
          { id: 'spill_prevention', label: 'Spill Prevention', type: 'select', options: ['Comprehensive', 'Basic', 'None'] },
          { id: 'compliance', label: 'Regulatory Compliance', type: 'select', options: ['100%', '90%', '75%', '50%'] },
          { id: 'last_audit', label: 'Last Audit Date', type: 'date' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      }
    ]
  },

  // ============================================
  // 9. TRANSPORTATION
  // ============================================
  transportation: {
    id: 'transportation',
    name: 'Transportation Safety Assessment',
    description: 'Comprehensive safety assessment for transportation operations',
    icon: <CarOutlined />,
    color: '#fa8c16',
    sections: [
      {
        id: 'fleet_safety',
        title: 'Fleet Safety Assessment',
        description: 'Evaluation of fleet safety and maintenance programs',
        fields: [
          { id: 'fleet_type', label: 'Fleet Type', type: 'select', required: true, options: ['Trucks', 'Buses', 'Trains', 'Ships', 'Aircraft'] },
          { id: 'maintenance_program', label: 'Maintenance Program', type: 'select', options: ['Comprehensive', 'Standard', 'Basic', 'None'] },
          { id: 'driver_training', label: 'Driver Training', type: 'select', options: ['Comprehensive', 'Basic', 'None'] },
          { id: 'safety_equipment', label: 'Safety Equipment', type: 'select', options: ['Complete', 'Partial', 'Deficient'] },
          { id: 'accident_history', label: 'Accident History', type: 'textarea' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'hazardous_materials_transport',
        title: 'Hazardous Materials Transport Assessment',
        description: 'Evaluation of hazardous materials transportation safety',
        fields: [
          { id: 'material_type', label: 'Material Type', type: 'select', options: ['Flammable', 'Toxic', 'Corrosive', 'Explosive', 'Radioactive'] },
          { id: 'packaging', label: 'Packaging Standards', type: 'select', options: ['Compliant', 'Partial', 'Non-Compliant'] },
          { id: 'labeling', label: 'Labeling & Placarding', type: 'select', options: ['Correct', 'Partial', 'Incorrect'] },
          { id: 'driver_certification', label: 'Driver Certification', type: 'select', options: ['Current', 'Expiring', 'Expired'] },
          { id: 'emergency_response', label: 'Emergency Response Plan', type: 'select', options: ['Documented', 'Informal', 'None'] },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      }
    ]
  },

  // ============================================
  // 10. TECHNOLOGY
  // ============================================
  technology: {
    id: 'technology',
    name: 'Technology & Cybersecurity Risk Assessment',
    description: 'Comprehensive IT and cybersecurity risk assessment',
    icon: <CloudOutlined />,
    color: '#722ed1',
    sections: [
      {
        id: 'cybersecurity',
        title: 'Cybersecurity Risk Assessment',
        description: 'Evaluation of cybersecurity risks and controls',
        fields: [
          { id: 'threat_type', label: 'Threat Type', type: 'select', required: true, options: ['Malware', 'Ransomware', 'Phishing', 'Data Breach', 'DDoS', 'Insider Threat', 'Zero-Day'] },
          { id: 'vulnerability', label: 'Vulnerability', type: 'textarea' },
          { id: 'impact', label: 'Potential Impact', type: 'select', options: ['Minimal', 'Moderate', 'Significant', 'Catastrophic'] },
          { id: 'likelihood', label: 'Likelihood (1-5)', type: 'number', min: 1, max: 5 },
          { id: 'existing_controls', label: 'Existing Controls', type: 'textarea' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'data_protection',
        title: 'Data Protection Assessment',
        description: 'Evaluation of data protection and privacy measures',
        fields: [
          { id: 'data_type', label: 'Data Type', type: 'select', options: ['Personal', 'Financial', 'Health', 'Intellectual Property', 'Operational'] },
          { id: 'classification', label: 'Classification', type: 'select', options: ['Public', 'Internal', 'Confidential', 'Restricted'] },
          { id: 'encryption', label: 'Encryption Used', type: 'select', options: ['Full', 'Partial', 'None'] },
          { id: 'access_controls', label: 'Access Controls', type: 'select', options: ['Strong', 'Moderate', 'Weak'] },
          { id: 'breach_history', label: 'Breach History', type: 'textarea' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'business_continuity',
        title: 'Business Continuity Assessment',
        description: 'Evaluation of business continuity and disaster recovery',
        fields: [
          { id: 'system_criticality', label: 'System Criticality', type: 'select', options: ['Mission Critical', 'Important', 'Non-Essential'] },
          { id: 'backup_procedure', label: 'Backup Procedure', type: 'select', options: ['Automated', 'Manual', 'None'] },
          { id: 'recovery_time', label: 'Recovery Time Objective (hours)', type: 'number' },
          { id: 'disaster_plan', label: 'Disaster Recovery Plan', type: 'select', options: ['Documented', 'Partial', 'None'] },
          { id: 'last_test', label: 'Last Test Date', type: 'date' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      }
    ]
  },

  // ============================================
  // 11. FOOD & BEVERAGE
  // ============================================
  food_beverage: {
    id: 'food_beverage',
    name: 'Food Safety & Quality Assessment',
    description: 'Comprehensive food safety and quality management assessment',
    icon: <CoffeeOutlined />,
    color: '#52c41a',
    sections: [
      {
        id: 'food_safety',
        title: 'Food Safety Management Assessment',
        description: 'Evaluation of food safety management systems',
        fields: [
          { id: 'operation_type', label: 'Operation Type', type: 'select', required: true, options: ['Production', 'Processing', 'Packaging', 'Distribution', 'Retail'] },
          { id: 'haccp_plan', label: 'HACCP Plan', type: 'select', options: ['Implemented', 'Partial', 'None'] },
          { id: 'critical_control_points', label: 'Critical Control Points', type: 'textarea' },
          { id: 'monitoring_procedures', label: 'Monitoring Procedures', type: 'select', options: ['Comprehensive', 'Standard', 'Basic'] },
          { id: 'last_audit', label: 'Last Audit Date', type: 'date' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'quality_control',
        title: 'Quality Control Assessment',
        description: 'Evaluation of quality control systems and procedures',
        fields: [
          { id: 'quality_standard', label: 'Quality Standard', type: 'select', options: ['ISO 22000', 'FSSC 22000', 'BRC', 'SQF', 'Custom'] },
          { id: 'testing_frequency', label: 'Testing Frequency', type: 'select', options: ['Continuous', 'Batch', 'Periodic'] },
          { id: 'quality_metrics', label: 'Quality Metrics', type: 'textarea' },
          { id: 'complaint_history', label: 'Complaint History', type: 'textarea' },
          { id: 'corrective_actions', label: 'Corrective Actions', type: 'textarea' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      }
    ]
  },

  // ============================================
  // 12. GENERAL
  // ============================================
  general: {
    id: 'general',
    name: 'General Risk Assessment',
    description: 'Comprehensive risk assessment applicable to any industry or organization',
    icon: <SafetyCertificateOutlined />,
    color: '#1890ff',
    sections: [
      {
        id: 'general_risks',
        title: 'General Risk Assessment',
        description: 'Comprehensive risk identification and assessment',
        fields: [
          { id: 'risk_category', label: 'Risk Category', type: 'select', required: true, options: ['Strategic', 'Operational', 'Financial', 'Compliance', 'Reputational', 'Environmental'] },
          { id: 'risk_description', label: 'Risk Description', type: 'textarea', required: true },
          { id: 'risk_source', label: 'Risk Source', type: 'textarea' },
          { id: 'likelihood', label: 'Likelihood (1-5)', type: 'number', min: 1, max: 5, required: true },
          { id: 'impact', label: 'Impact (1-5)', type: 'number', min: 1, max: 5, required: true },
          { id: 'current_controls', label: 'Current Controls', type: 'textarea' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'compliance',
        title: 'Compliance Assessment',
        description: 'Evaluation of regulatory and compliance requirements',
        fields: [
          { id: 'regulation_type', label: 'Regulation Type', type: 'select', options: ['Legal', 'Industry', 'Environmental', 'Safety', 'Data Protection'] },
          { id: 'compliance_status', label: 'Compliance Status', type: 'select', options: ['100%', '90%', '75%', '50%'] },
          { id: 'last_review', label: 'Last Review Date', type: 'date' },
          { id: 'gaps', label: 'Gaps Identified', type: 'textarea' },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      },
      {
        id: 'emergency_preparedness',
        title: 'Emergency Preparedness Assessment',
        description: 'Evaluation of emergency preparedness and response',
        fields: [
          { id: 'emergency_type', label: 'Emergency Type', type: 'select', options: ['Fire', 'Medical', 'Natural Disaster', 'Security', 'Chemical Spill'] },
          { id: 'response_plan', label: 'Response Plan', type: 'select', options: ['Documented', 'Informal', 'None'] },
          { id: 'drill_frequency', label: 'Drill Frequency', type: 'select', options: ['Monthly', 'Quarterly', 'Bi-Annually', 'Annually'] },
          { id: 'equipment_available', label: 'Equipment Available', type: 'select', options: ['Complete', 'Partial', 'Deficient'] },
          { id: 'training_completed', label: 'Training Completed', type: 'select', options: ['100%', '75%', '50%', 'None'] },
          { id: 'action_required', label: 'Action Required', type: 'textarea' }
        ]
      }
    ]
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

const RiskAssessmentTable = ({ dataSource = [], loading = false, onRefresh, onDelete, onEdit, onView }) => {
  const [form] = Form.useForm();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewDrawerVisible, setIsViewDrawerVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');

  // ============================================
  // COLOR MAPPINGS
  // ============================================

  const riskColors = {
    critical: '#722ed1',
    high: '#ff4d4f',
    medium: '#faad14',
    low: '#52c41a',
    negligible: '#d9d9d9'
  };

  const statusColors = {
    draft: 'default',
    pending: 'orange',
    under_review: 'purple',
    active: 'blue',
    completed: 'green',
    archived: 'gray',
    rejected: 'red',
    approved: 'success'
  };

  const priorityColors = {
    low: 'default',
    medium: 'blue',
    high: 'orange',
    critical: 'red'
  };

  // ============================================
  // TEMPLATE LIST
  // ============================================

  const templateList = [
    { id: 'aviation', icon: <RocketOutlined />, color: '#722ed1', name: 'Aviation Security' },
    { id: 'oil_gas', icon: <ExperimentOutlined />, color: '#000000', name: 'Oil & Gas' },
    { id: 'healthcare', icon: <MedicineBoxOutlined />, color: '#eb2f96', name: 'Healthcare' },
    { id: 'mining', icon: <BuildOutlined />, color: '#fa8c16', name: 'Mining' },
    { id: 'construction', icon: <BankOutlined />, color: '#faad14', name: 'Construction' },
    { id: 'marine', icon: <RocketOutlined />, color: '#13c2c2', name: 'Marine & Offshore' },
    { id: 'manufacturing', icon: <IndustryOutlined />, color: '#1890ff', name: 'Manufacturing' },
    { id: 'chemical', icon: <ExperimentOutlined />, color: '#13c2c2', name: 'Chemical' },
    { id: 'transportation', icon: <CarOutlined />, color: '#fa8c16', name: 'Transportation' },
    { id: 'technology', icon: <CloudOutlined />, color: '#722ed1', name: 'Technology & Cyber' },
    { id: 'food_beverage', icon: <CoffeeOutlined />, color: '#52c41a', name: 'Food & Beverage' },
    { id: 'general', icon: <SafetyCertificateOutlined />, color: '#1890ff', name: 'General' }
  ];

  // ============================================
  // TABLE COLUMNS
  // ============================================

  const columns = [
    {
      title: 'Assessment',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      fixed: 'left',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.priority === 'critical' && <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />}
            {text}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {record.assessment_number}
            {record.template_type && (
              <Tag size="small" style={{ marginLeft: 8 }}>
                {INDUSTRY_TEMPLATES[record.template_type]?.name || record.template_type}
              </Tag>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Template',
      dataIndex: 'template_type',
      key: 'template_type',
      width: 140,
      render: (type) => {
        const template = templateList.find(t => t.id === type);
        return (
          <Tag color={template?.color || 'blue'}>
            {template?.name || type}
          </Tag>
        );
      }
    },
    {
      title: 'Risk Level',
      dataIndex: 'risk_level',
      key: 'risk_level',
      width: 120,
      render: (level) => (
        <Tag color={riskColors[level]} style={{ fontWeight: 500 }}>
          {level?.toUpperCase() || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Risk Score',
      dataIndex: 'risk_score',
      key: 'risk_score',
      width: 180,
      render: (score, record) => (
        <div>
          <Progress
            percent={((score || 0) / 25) * 100}
            size="small"
            format={() => `${score || 0}/25`}
            strokeColor={riskColors[record.risk_level]}
          />
          <div style={{ fontSize: 11, marginTop: 4 }}>
            Prob: {record.probability || 0}/5 | Impact: {record.impact || 0}/5
          </div>
        </div>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => (
        <Tag color={priorityColors[priority] || 'default'}>
          {priority?.toUpperCase() || 'MEDIUM'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => (
        <Badge
          status={statusColors[status] || 'default'}
          text={status?.replace('_', ' ').toUpperCase() || 'N/A'}
        />
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      render: (date) => (
        <Tooltip title={moment(date).format('YYYY-MM-DD HH:mm')}>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {moment(date).format('MMM DD, YYYY')}
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Copy">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Delete Assessment"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Tooltip title="Delete">
              <Button type="text" icon={<DeleteOutlined />} danger size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // ============================================
  // HANDLERS
  // ============================================

  const handleCreate = () => {
    setSelectedAssessment(null);
    setSelectedTemplate(null);
    setCurrentStep(0);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedAssessment(record);
    const template = INDUSTRY_TEMPLATES[record.template_type];
    setSelectedTemplate(template);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedAssessment(record);
    setIsViewDrawerVisible(true);
  };

  const handleDelete = (record) => {
    if (onDelete) {
      onDelete(record);
    } else {
      message.success(`${record.title} deleted successfully`);
    }
  };

  const handleCopy = (record) => {
    message.success(`Copy of ${record.title} created`);
  };

  const handleDownload = (record) => {
    message.success(`Downloading ${record.title}`);
  };

  const handleTemplateSelect = (templateId) => {
    const template = INDUSTRY_TEMPLATES[templateId];
    setSelectedTemplate(template);
    setCurrentStep(1);
    
    form.setFieldsValue({
      template_type: templateId,
      title: `New ${template.name}`,
      status: 'draft',
      priority: 'medium'
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Calculate risk score
      const probability = values.probability || 3;
      const impact = values.impact || 3;
      const riskScore = probability * impact;
      const riskLevel = riskScore >= 20 ? 'critical' : riskScore >= 15 ? 'high' : riskScore >= 8 ? 'medium' : riskScore >= 3 ? 'low' : 'negligible';
      
      const assessmentData = {
        ...values,
        risk_score: riskScore,
        risk_level: riskLevel,
        assessment_number: `RA-${moment().format('YYYYMM')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        created_at: moment().toISOString()
      };
      
      if (selectedAssessment) {
        if (onEdit) {
          onEdit(selectedAssessment.id, assessmentData);
        }
        message.success('Assessment updated successfully');
      } else {
        if (onRefresh) {
          onRefresh(assessmentData);
        }
        message.success('Assessment created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setCurrentStep(0);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error('Please fill in all required fields');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setCurrentStep(0);
  };

  // ============================================
  // RENDER TEMPLATE SELECTION
  // ============================================

  const renderTemplateSelection = () => (
    <div>
      <h3>Select Assessment Template</h3>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Choose a comprehensive risk assessment template based on your industry and requirements
      </p>
      
      <Row gutter={[16, 16]}>
        {templateList.map(template => {
          const fullTemplate = INDUSTRY_TEMPLATES[template.id];
          return (
            <Col xs={24} sm={12} lg={8} key={template.id}>
              <Card
                hoverable
                onClick={() => handleTemplateSelect(template.id)}
                style={{
                  border: `2px solid ${template.color}30`,
                  height: '100%',
                  transition: 'all 0.3s'
                }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: template.color,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    flexShrink: 0
                  }}>
                    {React.cloneElement(template.icon, { style: { color: 'white', fontSize: 24 } })}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: template.color }}>{template.name}</h4>
                    <p style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                      {fullTemplate?.description || 'Comprehensive risk assessment template'}
                    </p>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="blue">{fullTemplate?.sections?.length || 0} Sections</Tag>
                      <Tag>Comprehensive</Tag>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );

  // ============================================
  // RENDER TEMPLATE FORM
  // ============================================

  const renderTemplateForm = () => {
    if (!selectedTemplate) return null;

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <h3>{selectedTemplate.name}</h3>
          <p style={{ color: '#666' }}>{selectedTemplate.description}</p>
        </div>

        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Select Template" />
          <Step title="Configure" />
          <Step title="Review" />
        </Steps>

        <Form form={form} layout="vertical">
          {/* Basic Information */}
          <Card title="Basic Information" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Assessment Title"
                  name="title"
                  rules={[{ required: true, message: 'Please enter title' }]}
                >
                  <Input placeholder="Enter assessment title" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Status" name="status">
                  <Select>
                    <Option value="draft">Draft</Option>
                    <Option value="pending">Pending Review</Option>
                    <Option value="under_review">Under Review</Option>
                    <Option value="active">Active</Option>
                    <Option value="completed">Completed</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Priority" name="priority">
                  <Select>
                    <Option value="low">Low</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="high">High</Option>
                    <Option value="critical">Critical</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Assessment Date" name="assessment_date">
                  <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Due Date" name="due_date">
                  <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Description" name="description">
              <TextArea rows={3} placeholder="Describe the assessment purpose and scope..." />
            </Form.Item>
          </Card>

          {/* Template Sections */}
          {selectedTemplate.sections.map((section) => (
            <Card
              key={section.id}
              title={section.title}
              size="small"
              style={{ marginBottom: 16 }}
              extra={<Tag color="blue">{section.fields.length} Fields</Tag>}
            >
              <p style={{ color: '#666', fontSize: 12, marginBottom: 12 }}>
                {section.description}
              </p>
              
              {section.fields.map((field) => (
                <Form.Item
                  key={field.id}
                  label={field.label}
                  name={field.id}
                  rules={field.required ? [{ required: true, message: `Please enter ${field.label}` }] : []}
                  style={{ marginBottom: 12 }}
                >
                  {field.type === 'select' && (
                    <Select placeholder={`Select ${field.label}`}>
                      {field.options.map(opt => (
                        <Option key={opt} value={opt}>{opt}</Option>
                      ))}
                    </Select>
                  )}
                  {field.type === 'textarea' && (
                    <TextArea rows={2} placeholder={`Enter ${field.label}`} />
                  )}
                  {field.type === 'text' && (
                    <Input placeholder={`Enter ${field.label}`} />
                  )}
                  {field.type === 'number' && (
                    <InputNumber
                      min={field.min || 0}
                      max={field.max || 100}
                      style={{ width: '100%' }}
                      placeholder={`Enter ${field.label}`}
                    />
                  )}
                  {field.type === 'date' && (
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                  )}
                  {field.type === 'boolean' && (
                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                  )}
                </Form.Item>
              ))}
            </Card>
          ))}

          {/* Risk Matrix Summary */}
          <Card title="Risk Matrix Summary" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Probability (1-5)" name="probability">
                  <Select>
                    {[1, 2, 3, 4, 5].map(n => (
                      <Option key={n} value={n}>{n} - {['Very Low', 'Low', 'Medium', 'High', 'Very High'][n-1]}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Impact (1-5)" name="impact">
                  <Select>
                    {[1, 2, 3, 4, 5].map(n => (
                      <Option key={n} value={n}>{n} - {['Very Low', 'Low', 'Medium', 'High', 'Very High'][n-1]}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="Risk Level" name="risk_level">
              <Select>
                <Option value="critical">Critical</Option>
                <Option value="high">High</Option>
                <Option value="medium">Medium</Option>
                <Option value="low">Low</Option>
                <Option value="negligible">Negligible</Option>
              </Select>
            </Form.Item>
          </Card>
        </Form>
      </div>
    );
  };

  // ============================================
  // RENDER VIEW DRAWER
  // ============================================

  const renderViewDrawer = () => (
    <Drawer
      title="Assessment Details"
      placement="right"
      open={isViewDrawerVisible}
      onClose={() => setIsViewDrawerVisible(false)}
      width={800}
    >
      {selectedAssessment && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Assessment Number">
              {selectedAssessment.assessment_number}
            </Descriptions.Item>
            <Descriptions.Item label="Title">
              {selectedAssessment.title}
            </Descriptions.Item>
            <Descriptions.Item label="Template">
              <Tag color={INDUSTRY_TEMPLATES[selectedAssessment.template_type]?.color}>
                {INDUSTRY_TEMPLATES[selectedAssessment.template_type]?.name}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Risk Level">
              <Tag color={riskColors[selectedAssessment.risk_level]}>
                {selectedAssessment.risk_level?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Risk Score">
              {selectedAssessment.risk_score || 0}/25
            </Descriptions.Item>
            <Descriptions.Item label="Probability">
              {selectedAssessment.probability || 0}/5
            </Descriptions.Item>
            <Descriptions.Item label="Impact">
              {selectedAssessment.impact || 0}/5
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              <Tag color={priorityColors[selectedAssessment.priority]}>
                {selectedAssessment.priority?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColors[selectedAssessment.status]}>
                {selectedAssessment.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedAssessment.description || 'No description provided'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {moment(selectedAssessment.created_at).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {moment(selectedAssessment.updated_at).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
    </Drawer>
  );

  // ============================================
  // STATISTICS
  // ============================================

  const stats = useMemo(() => ({
    total: dataSource.length,
    highRisk: dataSource.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').length,
    active: dataSource.filter(a => a.status === 'active' || a.status === 'pending').length,
    completed: dataSource.filter(a => a.status === 'completed').length,
    overdue: dataSource.filter(a => a.due_date && moment(a.due_date).isBefore(moment()) && a.status !== 'completed').length
  }), [dataSource]);

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Total Assessments" value={stats.total} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="High/Critical Risk" value={stats.highRisk} valueStyle={{ color: '#ff4d4f' }} prefix={<ExclamationCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Active" value={stats.active} prefix={<SyncOutlined spin />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Overdue" value={stats.overdue} valueStyle={{ color: '#fa8c16' }} prefix={<WarningOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search assessments..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={16}>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                Refresh
              </Button>
              <Button icon={<DownloadOutlined />}>Export</Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                New Assessment
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 10
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: 16, background: '#fafafa' }}>
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="Description" span={2}>
                    {record.description || 'No description provided'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Template">
                    {INDUSTRY_TEMPLATES[record.template_type]?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Sections">
                    {INDUSTRY_TEMPLATES[record.template_type]?.sections?.length || 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Risk Score">
                    {record.risk_score || 0}/25
                  </Descriptions.Item>
                  <Descriptions.Item label="Probability">
                    {record.probability || 0}/5
                  </Descriptions.Item>
                  <Descriptions.Item label="Impact">
                    {record.impact || 0}/5
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ),
            expandedRowKeys,
            onExpandedRowsChange: setExpandedRowKeys
          }}
          scroll={{ x: 1400 }}
          bordered
        />
      </Card>

      {/* Template Selection Modal */}
      <Modal
        title="New Risk Assessment"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={900}
        okText={selectedAssessment ? 'Update' : 'Create'}
        okButtonProps={{ icon: <SaveOutlined /> }}
      >
        {currentStep === 0 ? renderTemplateSelection() : renderTemplateForm()}
      </Modal>

      {/* View Drawer */}
      {renderViewDrawer()}
    </div>
  );
};

export default RiskAssessmentTable;