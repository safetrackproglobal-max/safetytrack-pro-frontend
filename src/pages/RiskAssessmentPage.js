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
  Alert,
  Empty,
  Spin,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Descriptions,
  List,
  Radio,
  Checkbox,
  Switch,
  Divider,
  Tooltip,
  message,
  Steps,
  Upload,
  InputNumber,
  Rate,
  Badge,
  Avatar,
  Dropdown,
  Menu,
  Popconfirm,
  Drawer,
  Typography,
  Collapse,
  Timeline,
  Affix,
  Breadcrumb,
  Pagination,
  ConfigProvider
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
  HistoryOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  CloudDownloadOutlined,
  CompassOutlined,
  MedicineBoxOutlined,
  CarOutlined,
  RocketOutlined,
  ExperimentOutlined,
  BankOutlined,
  BuildOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  SyncOutlined,
  UserOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TagsOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ColumnHeightOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SettingOutlined,
  ExportOutlined,
  ImportOutlined,
  CloudUploadOutlined,
  FileTextOutlined as FileTextIcon,
  FolderOutlined,
  LinkOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  StarOutlined,
  StarFilled,
  HeartOutlined,
  HeartFilled,
  FlagOutlined,
  FlagFilled,
  CrownOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  CoffeeOutlined,
  DashboardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
  HomeOutlined,
  WifiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  CodeOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import RiskAssessmentService from '../services/riskAssessmentService';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { RangePicker } = DatePicker;
const { Search } = Input;
const { Panel } = Collapse;

// ============================================
// COMPREHENSIVE INDUSTRY TEMPLATES
// ============================================

const INDUSTRY_TEMPLATES = {
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
      }
    ]
  },
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
      }
    ]
  },
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
      }
    ]
  },
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
      }
    ]
  },
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
      }
    ]
  },
  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing Plant Safety Assessment',
    description: 'Comprehensive safety assessment for manufacturing operations',
    icon: <CompassOutlined />,
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
      }
    ]
  },
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
      }
    ]
  },
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
      }
    ]
  }
};

// ============================================
// CONSTANTS & UTILITY FUNCTIONS
// ============================================

const getRiskLevelColor = (level) => {
  const colors = {
    critical: '#722ed1',
    high: '#ff4d4f',
    medium: '#faad14',
    low: '#52c41a',
    negligible: '#d9d9d9'
  };
  return colors[level] || '#d9d9d9';
};

const getRiskLevelFromScore = (score) => {
  if (score >= 20) return 'critical';
  if (score >= 15) return 'high';
  if (score >= 8) return 'medium';
  if (score >= 3) return 'low';
  return 'negligible';
};

const getStatusColor = (status) => {
  const colors = {
    draft: 'default',
    pending: 'orange',
    under_review: 'purple',
    active: 'blue',
    completed: 'green',
    archived: 'gray',
    rejected: 'red',
    approved: 'success'
  };
  return colors[status] || 'default';
};

const getPriorityColor = (priority) => {
  const colors = {
    low: 'default',
    medium: 'blue',
    high: 'orange',
    critical: 'red'
  };
  return colors[priority] || 'default';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return moment(date).format('MMM DD, YYYY');
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return moment(date).format('MMM DD, YYYY HH:mm');
};

const isOverdue = (dueDate, status) => {
  if (!dueDate) return false;
  if (status === 'completed' || status === 'archived') return false;
  return moment(dueDate).isBefore(moment());
};

// Industry Mapping for display
const INDUSTRIES = {
  aviation: { label: 'Aviation', icon: <RocketOutlined />, color: '#722ed1' },
  oil_gas: { label: 'Oil & Gas', icon: <ExperimentOutlined />, color: '#000000' },
  healthcare: { label: 'Healthcare', icon: <MedicineBoxOutlined />, color: '#eb2f96' },
  mining: { label: 'Mining', icon: <BuildOutlined />, color: '#fa8c16' },
  construction: { label: 'Construction', icon: <BankOutlined />, color: '#faad14' },
  marine: { label: 'Marine & Offshore', icon: <RocketOutlined />, color: '#13c2c2' },
  manufacturing: { label: 'Manufacturing', icon: <CompassOutlined />, color: '#1890ff' },
  chemical: { label: 'Chemical', icon: <ExperimentOutlined />, color: '#13c2c2' },
  transportation: { label: 'Transportation', icon: <CarOutlined />, color: '#fa8c16' },
  technology: { label: 'Technology & Cyber', icon: <CloudOutlined />, color: '#722ed1' },
  food_beverage: { label: 'Food & Beverage', icon: <CoffeeOutlined />, color: '#52c41a' },
  general: { label: 'General', icon: <SafetyCertificateOutlined />, color: '#1890ff' },
  other: { label: 'Other', icon: <FileTextOutlined />, color: '#d9d9d9' }
};

// Departments
const DEPARTMENTS = [
  'Operations', 'Safety & Health', 'Quality Assurance', 
  'Maintenance', 'Logistics', 'Research & Development', 
  'Administration', 'Human Resources', 'Finance', 'IT',
  'Engineering', 'Production', 'Supply Chain', 'Compliance'
];

// Status Options
const STATUSES = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'pending', label: 'Pending Review', color: 'orange' },
  { value: 'under_review', label: 'Under Review', color: 'purple' },
  { value: 'active', label: 'Active', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'archived', label: 'Archived', color: 'gray' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'approved', label: 'Approved', color: 'success' }
];

// Priority Options
const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'default' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' }
];

// Risk Levels
const RISK_LEVELS = [
  { value: 'critical', label: 'Critical', color: '#722ed1' },
  { value: 'high', label: 'High', color: '#ff4d4f' },
  { value: 'medium', label: 'Medium', color: '#faad14' },
  { value: 'low', label: 'Low', color: '#52c41a' },
  { value: 'negligible', label: 'Negligible', color: '#d9d9d9' }
];

// International Standards
const INTERNATIONAL_STANDARDS = {
  iso31000: { name: 'ISO 31000:2018', desc: 'Risk Management Guidelines', color: '#1890ff' },
  iso45001: { name: 'ISO 45001:2018', desc: 'Occupational Health & Safety', color: '#52c41a' },
  iso14001: { name: 'ISO 14001:2015', desc: 'Environmental Management', color: '#13c2c2' },
  niosh: { name: 'NIOSH', desc: 'National Institute for Occupational Safety', color: '#722ed1' },
  osha: { name: 'OSHA', desc: 'Occupational Safety and Health Administration', color: '#fa8c16' },
  nfpa: { name: 'NFPA', desc: 'National Fire Protection Association', color: '#ff4d4f' },
  imo: { name: 'IMO', desc: 'International Maritime Organization', color: '#13c2c2' },
  icao: { name: 'ICAO', desc: 'International Civil Aviation Organization', color: '#722ed1' },
  api: { name: 'API RP 75', desc: 'Safety & Environmental Management', color: '#000000' },
  jci: { name: 'JCI', desc: 'Joint Commission International', color: '#eb2f96' },
  msha: { name: 'MSHA', desc: 'Mine Safety and Health Administration', color: '#fa8c16' }
};

// ============================================
// MAIN COMPONENT
// ============================================

function RiskAssessmentPage() {
  const history = useHistory();
  const { id } = useParams();
  const [form] = Form.useForm();
  
  // State
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRiskLevel, setFilterRiskLevel] = useState('all');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('descend');

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const response = await RiskAssessmentService.getAllAssessments();
      setAssessments(response.data || []);
      setFilteredAssessments(response.data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      message.error('Failed to load assessments');
      setAssessments([]);
      setFilteredAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // ============================================
  // FILTERING & SORTING
  // ============================================

  useEffect(() => {
    let filtered = [...assessments];
    
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(search) ||
        item.assessment_number?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.department?.toLowerCase().includes(search)
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }
    
    if (filterRiskLevel !== 'all') {
      filtered = filtered.filter(item => item.risk_level === filterRiskLevel);
    }
    
    if (filterIndustry !== 'all') {
      filtered = filtered.filter(item => item.industry === filterIndustry);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === filterPriority);
    }
    
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'assigned_to') {
        aVal = a.assigned_to?.name || '';
        bVal = b.assigned_to?.name || '';
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'ascend') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredAssessments(filtered);
  }, [assessments, searchText, filterStatus, filterRiskLevel, filterIndustry, filterPriority, sortField, sortOrder]);

  // ============================================
  // STATISTICS
  // ============================================

  const stats = useMemo(() => {
    const total = assessments.length;
    const highRisk = assessments.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').length;
    const active = assessments.filter(a => a.status === 'active' || a.status === 'pending' || a.status === 'under_review').length;
    const overdue = assessments.filter(a => isOverdue(a.due_date, a.status)).length;
    const completed = assessments.filter(a => a.status === 'completed').length;
    const totalRiskScore = assessments.reduce((sum, a) => sum + (a.risk_score || 0), 0);
    const avgRiskScore = total > 0 ? (totalRiskScore / total).toFixed(1) : 0;
    
    return { total, highRisk, active, overdue, completed, avgRiskScore };
  }, [assessments]);

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  const createAssessment = async (data) => {
    try {
      const response = await RiskAssessmentService.createAssessment(data);
      message.success('Assessment created successfully');
      await fetchAssessments();
      return response.data;
    } catch (error) {
      console.error('Error creating assessment:', error);
      message.error(error.response?.data?.error || 'Failed to create assessment');
      throw error;
    }
  };

  const updateAssessment = async (id, data) => {
    try {
      const response = await RiskAssessmentService.updateAssessment(id, data);
      message.success('Assessment updated successfully');
      await fetchAssessments();
      return response.data;
    } catch (error) {
      console.error('Error updating assessment:', error);
      message.error(error.response?.data?.error || 'Failed to update assessment');
      throw error;
    }
  };

  const deleteAssessment = async (id) => {
    try {
      await RiskAssessmentService.deleteAssessment(id);
      message.success('Assessment deleted successfully');
      await fetchAssessments();
      return true;
    } catch (error) {
      console.error('Error deleting assessment:', error);
      message.error(error.response?.data?.error || 'Failed to delete assessment');
      return false;
    }
  };

  const bulkDelete = async (ids) => {
    try {
      await RiskAssessmentService.bulkDelete(ids);
      message.success(`Deleted ${ids.length} assessments`);
      await fetchAssessments();
      setSelectedRowKeys([]);
      return true;
    } catch (error) {
      console.error('Error bulk deleting:', error);
      message.error('Failed to delete assessments');
      return false;
    }
  };

  const bulkUpdateStatus = async (ids, status) => {
    try {
      await RiskAssessmentService.bulkUpdate(ids, { status });
      message.success(`Updated ${ids.length} assessments to ${status}`);
      await fetchAssessments();
      setSelectedRowKeys([]);
      return true;
    } catch (error) {
      console.error('Error bulk updating:', error);
      message.error('Failed to update assessments');
      return false;
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleCreateNew = () => {
    setIsTemplateModalVisible(true);
    setCurrentStep(0);
  };

  const handleTemplateSelect = (templateId) => {
    const template = INDUSTRY_TEMPLATES[templateId];
    if (!template) {
      message.error('Template not found');
      return;
    }
    
    setSelectedTemplate(template);
    setCurrentStep(1);
    
    form.setFieldsValue({
      template_type: templateId,
      title: `New ${template.name}`,
      industry: templateId === 'general' ? 'other' : templateId,
      status: 'draft',
      priority: 'medium',
      probability: 3,
      impact: 3
    });
    
    setIsTemplateModalVisible(false);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedAssessment(record);
    const template = INDUSTRY_TEMPLATES[record.template_type];
    setSelectedTemplate(template || INDUSTRY_TEMPLATES.general);
    
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      industry: record.industry,
      department: record.department,
      probability: record.probability || 3,
      impact: record.impact || 3,
      status: record.status || 'draft',
      priority: record.priority || 'medium',
      assessment_date: record.assessment_date ? moment(record.assessment_date) : null,
      due_date: record.due_date ? moment(record.due_date) : null,
      assigned_to: record.assigned_to?.id,
      standards: record.standards || [],
      mitigation_steps: record.mitigation_steps || [],
      corrective_actions: record.corrective_actions,
      control_measures: record.control_measures,
      tags: record.tags || [],
      template_type: record.template_type || 'general',
      // Template specific fields
      ...(record.template_data || {})
    });
    
    setIsModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedAssessment(record);
    setIsDrawerVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Assessment',
      content: `Are you sure you want to delete "${record.title}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        await deleteAssessment(record.id);
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Calculate risk score
      const probability = values.probability || 3;
      const impact = values.impact || 3;
      const riskScore = probability * impact;
      const riskLevel = getRiskLevelFromScore(riskScore);
      
      // Get template specific data
      const templateData = {};
      if (selectedTemplate) {
        selectedTemplate.sections.forEach(section => {
          section.fields.forEach(field => {
            if (values[field.id] !== undefined) {
              templateData[field.id] = values[field.id];
            }
          });
        });
      }
      
      const assessmentData = {
        ...values,
        risk_score: riskScore,
        risk_level: riskLevel,
        assessment_date: values.assessment_date?.format('YYYY-MM-DD') || moment().format('YYYY-MM-DD'),
        due_date: values.due_date?.format('YYYY-MM-DD'),
        template_type: selectedTemplate?.id || 'general',
        template_data: templateData,
        standards: values.standards || [],
        mitigation_steps: values.mitigation_steps || []
      };

      let result;
      if (selectedAssessment?.id) {
        result = await updateAssessment(selectedAssessment.id, assessmentData);
      } else {
        result = await createAssessment(assessmentData);
      }

      setIsModalVisible(false);
      setSelectedAssessment(null);
      setSelectedTemplate(null);
      form.resetFields();
      setCurrentStep(0);
      
    } catch (error) {
      console.error('Validation failed:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      }
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedAssessment(null);
    setSelectedTemplate(null);
    form.resetFields();
    setCurrentStep(0);
  };

  const handleTemplateModalCancel = () => {
    setIsTemplateModalVisible(false);
    setSelectedTemplate(null);
    setCurrentStep(0);
  };

  const handleDownloadModalOk = async () => {
    if (!selectedAssessment) return;
    
    try {
      message.loading({ content: 'Preparing download...', key: 'download' });
      
      switch (downloadFormat) {
        case 'pdf':
          await downloadAssessmentPDF(selectedAssessment.id);
          break;
        case 'excel':
          await downloadAssessmentExcel(selectedAssessment.id);
          break;
        case 'json':
          await downloadAssessmentJSON(selectedAssessment.id);
          break;
        default:
          message.error('Unsupported format');
          return;
      }
      
      message.success({ content: 'Download started', key: 'download', duration: 2 });
      setIsDownloadModalVisible(false);
    } catch (error) {
      message.error({ content: 'Download failed', key: 'download', duration: 2 });
      console.error('Download error:', error);
    }
  };

  const handleDownloadModalCancel = () => {
    setIsDownloadModalVisible(false);
    setSelectedAssessment(null);
  };

  const downloadAssessmentPDF = async (id) => {
    try {
      const response = await RiskAssessmentService.downloadAssessmentPDF(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `risk-assessment-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  };

  const downloadAssessmentExcel = async (id) => {
    try {
      const response = await RiskAssessmentService.downloadAssessmentExcel(id);
      const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `risk-assessment-${id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error downloading Excel:', error);
      throw error;
    }
  };

  const downloadAssessmentJSON = async (id) => {
    try {
      const response = await RiskAssessmentService.getAssessmentById(id);
      const data = response.data;
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `risk-assessment-${id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error downloading JSON:', error);
      throw error;
    }
  };

  const handleDownloadAll = async (format) => {
    try {
      message.loading({ content: 'Preparing bulk download...', key: 'bulkDownload' });
      
      const response = await RiskAssessmentService.downloadAllAssessments(format);
      const blob = new Blob([response.data], { 
        type: format === 'excel' ? 'application/vnd.ms-excel' : 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      link.download = `all-risk-assessments-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success({ content: 'Bulk download started', key: 'bulkDownload', duration: 2 });
    } catch (error) {
      console.error('Error downloading all assessments:', error);
      message.error({ content: 'Bulk download failed', key: 'bulkDownload', duration: 2 });
    }
  };

  const handleBulkAction = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one assessment');
      return;
    }

    if (action === 'delete') {
      Modal.confirm({
        title: 'Bulk Delete',
        content: `Are you sure you want to delete ${selectedRowKeys.length} assessments?`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          await bulkDelete(selectedRowKeys);
        }
      });
    } else {
      Modal.confirm({
        title: 'Bulk Action',
        content: `Are you sure you want to mark ${selectedRowKeys.length} assessments as ${action}?`,
        onOk: async () => {
          await bulkUpdateStatus(selectedRowKeys, action);
        }
      });
    }
  };

  // ============================================
  // TABLE COLUMNS
  // ============================================

  const columns = [
    {
      title: 'Assessment',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      fixed: 'left',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
            {record.priority === 'critical' && <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />}
            {record.priority === 'high' && <WarningOutlined style={{ color: '#fa8c16', marginRight: 8 }} />}
            <span>{text}</span>
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            <Text type="secondary">{record.assessment_number}</Text>
            {record.template_type && (
              <Tag size="small" style={{ marginLeft: 8 }} color={INDUSTRY_TEMPLATES[record.template_type]?.color}>
                {INDUSTRY_TEMPLATES[record.template_type]?.name || record.template_type}
              </Tag>
            )}
          </div>
        </div>
      ),
      sorter: (a, b) => a.title?.localeCompare(b.title) || 0,
    },
    {
      title: 'Template',
      dataIndex: 'template_type',
      key: 'template_type',
      width: 140,
      render: (type) => {
        const template = INDUSTRY_TEMPLATES[type];
        return (
          <Tag color={template?.color || 'blue'}>
            {template?.name || type || 'General'}
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
        <Tooltip title={`Risk Level: ${level?.toUpperCase() || 'N/A'}`}>
          <Tag color={getRiskLevelColor(level)} style={{ fontSize: 12, fontWeight: 500 }}>
            {level?.toUpperCase() || 'N/A'}
          </Tag>
        </Tooltip>
      ),
      filters: RISK_LEVELS.map(r => ({ text: r.label, value: r.value })),
      onFilter: (value, record) => record.risk_level === value,
      sorter: (a, b) => {
        const order = { critical: 5, high: 4, medium: 3, low: 2, negligible: 1 };
        return (order[a.risk_level] || 0) - (order[b.risk_level] || 0);
      },
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
            strokeColor={getRiskLevelColor(record.risk_level)}
            style={{ marginBottom: 4 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span>Prob: {record.probability || 0}/5</span>
            <span>Impact: {record.impact || 0}/5</span>
          </div>
        </div>
      ),
      sorter: (a, b) => (a.risk_score || 0) - (b.risk_score || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => (
        <div>
          <Badge
            status={getStatusColor(status)}
            text={status?.replace('_', ' ').toUpperCase() || 'N/A'}
          />
          {isOverdue(record.due_date, status) && (
            <Tag color="red" style={{ marginLeft: 4 }}>
              <ClockCircleOutlined /> OVERDUE
            </Tag>
          )}
        </div>
      ),
      filters: STATUSES.map(s => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.status === value,
      sorter: (a, b) => a.status?.localeCompare(b.status) || 0,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority?.toUpperCase() || 'MEDIUM'}
        </Tag>
      ),
      filters: PRIORITIES.map(p => ({ text: p.label, value: p.value })),
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      width: 130,
      render: (industry) => (
        <Tag color={INDUSTRIES[industry]?.color || 'blue'}>
          <EnvironmentOutlined /> {INDUSTRIES[industry]?.label || industry || 'N/A'}
        </Tag>
      ),
      filters: Object.entries(INDUSTRIES).map(([key, value]) => ({ text: value.label, value: key })),
      onFilter: (value, record) => record.industry === value,
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      width: 150,
      render: (user) => (
        <Tooltip title={user?.email || 'Unassigned'}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
            <span>{user?.name || 'Unassigned'}</span>
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => (a.assigned_to?.name || '').localeCompare(b.assigned_to?.name || ''),
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 130,
      render: (date, record) => {
        if (!date) return 'N/A';
        const overdue = isOverdue(date, record.status);
        return (
          <Tooltip title={moment(date).format('YYYY-MM-DD')}>
            <Badge 
              status={overdue ? 'error' : 'processing'}
              text={moment(date).format('MMM DD, YYYY')}
            />
          </Tooltip>
        );
      },
      sorter: (a, b) => moment(a.due_date).diff(moment(b.due_date)),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
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
              onClick={() => {
                Modal.confirm({
                  title: 'Copy Assessment',
                  content: `Create a copy of "${record.title}"?`,
                  onOk: async () => {
                    const copyData = {
                      ...record,
                      title: `Copy of ${record.title}`,
                      status: 'draft',
                      assessment_date: moment().format('YYYY-MM-DD'),
                      due_date: null,
                      template_data: record.template_data || {}
                    };
                    delete copyData.id;
                    delete copyData.assessment_number;
                    delete copyData.created_at;
                    delete copyData.updated_at;
                    
                    await createAssessment(copyData);
                  }
                });
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => {
                setSelectedAssessment(record);
                setIsDownloadModalVisible(true);
              }}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Delete Assessment"
            description="Are you sure you want to delete this assessment?"
            onConfirm={() => handleDelete(record)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderStatistics = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={6}>
        <Card>
          <Statistic
            title="Total Assessments"
            value={stats.total}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card>
          <Statistic
            title="High/Critical Risk"
            value={stats.highRisk}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card>
          <Statistic
            title="Active"
            value={stats.active}
            prefix={<SyncOutlined spin />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card>
          <Statistic
            title="Overdue"
            value={stats.overdue}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<WarningOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderToolbar = () => (
    <div style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Search
            placeholder="Search assessments..."
            allowClear
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            size="middle"
          />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Select
            placeholder="Status"
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="all">All Status</Option>
            {STATUSES.map(s => (
              <Option key={s.value} value={s.value}>{s.label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Select
            placeholder="Risk Level"
            value={filterRiskLevel}
            onChange={setFilterRiskLevel}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="all">All Risk Levels</Option>
            {RISK_LEVELS.map(r => (
              <Option key={r.value} value={r.value}>{r.label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} sm={6} md={3}>
          <Select
            placeholder="Industry"
            value={filterIndustry}
            onChange={setFilterIndustry}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="all">All Industries</Option>
            {Object.entries(INDUSTRIES).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} sm={6} md={9}>
          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAssessments}
            >
              Refresh
            </Button>
            
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="excel" icon={<FileExcelOutlined />}>
                    Export as Excel
                  </Menu.Item>
                  <Menu.Item key="pdf" icon={<FilePdfOutlined />}>
                    Export as PDF
                  </Menu.Item>
                  <Menu.Item key="csv" icon={<FileTextIcon />}>
                    Export as CSV
                  </Menu.Item>
                  <Menu.Item key="json" icon={<FileTextIcon />}>
                    Export as JSON
                  </Menu.Item>
                </Menu>
              }
            >
              <Button icon={<DownloadOutlined />}>Export</Button>
            </Dropdown>
            
            {selectedRowKeys.length > 0 && (
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                      Delete Selected
                    </Menu.Item>
                    <Menu.Item key="completed" icon={<CheckCircleOutlined />}>
                      Mark Complete
                    </Menu.Item>
                    <Menu.Item key="archived" icon={<FileTextIcon />}>
                      Archive
                    </Menu.Item>
                    <Menu.Item key="under_review" icon={<SearchOutlined />}>
                      Mark for Review
                    </Menu.Item>
                    <Menu.Item key="approved" icon={<CheckCircleOutlined />}>
                      Approve
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon={<BarsOutlined />}>
                  Bulk Actions ({selectedRowKeys.length})
                </Button>
              </Dropdown>
            )}
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
            >
              New Assessment
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );

  // ============================================
  // DETAILED VIEW (ID PARAM)
  // ============================================

  if (id) {
    const assessmentId = parseInt(id);
    if (isNaN(assessmentId)) {
      return (
        <div style={{ padding: 24 }}>
          <Alert
            message="Invalid Assessment ID"
            description="The provided assessment ID is invalid."
            type="error"
            showIcon
          />
          <Button onClick={() => history.push('/risk-assessment')} style={{ marginTop: 16 }}>
            Back to Assessments
          </Button>
        </div>
      );
    }

    const assessment = assessments.find(a => a.id === assessmentId);
    
    if (!assessment) {
      return (
        <div style={{ padding: 24 }}>
          <Alert
            message="Assessment Not Found"
            description="The requested risk assessment could not be found."
            type="error"
            showIcon
          />
          <Button onClick={() => history.push('/risk-assessment')} style={{ marginTop: 16 }}>
            Back to Assessments
          </Button>
        </div>
      );
    }

    const template = INDUSTRY_TEMPLATES[assessment.template_type];

    return (
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => history.push('/risk-assessment')}>
            ← Back to Assessments
          </Button>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={() => {
              setSelectedAssessment(assessment);
              setIsDownloadModalVisible(true);
            }}>
              Download Report
            </Button>
            <Button icon={<EditOutlined />} type="primary" onClick={() => handleEdit(assessment)}>
              Edit Assessment
            </Button>
          </Space>
        </div>
        
        <Card 
          title={
            <div>
              {template?.icon || <SafetyCertificateOutlined />} {assessment.title}
            </div>
          }
          extra={
            <Space>
              <Tag color={getRiskLevelColor(assessment.risk_level)} style={{ fontSize: 14 }}>
                {assessment.risk_level?.toUpperCase() || 'N/A'} RISK
              </Tag>
              <Tag color={template?.color || 'blue'}>
                {template?.name || assessment.template_type || 'General'}
              </Tag>
              <Tag color={getStatusColor(assessment.status)}>
                {assessment.status?.replace('_', ' ').toUpperCase()}
              </Tag>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small" title="Basic Information" bordered={false}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Assessment Number">
                    {assessment.assessment_number}
                  </Descriptions.Item>
                  <Descriptions.Item label="Department">
                    {assessment.department || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Assigned To">
                    {assessment.assigned_to?.name || 'Unassigned'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Industry">
                    <Tag color={INDUSTRIES[assessment.industry]?.color}>
                      {INDUSTRIES[assessment.industry]?.label || assessment.industry}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Template">
                    <Tag color={template?.color || 'blue'}>
                      {template?.name || assessment.template_type || 'General'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Priority">
                    <Tag color={getPriorityColor(assessment.priority)}>
                      {assessment.priority?.toUpperCase() || 'MEDIUM'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Assessment Date">
                    {formatDate(assessment.assessment_date)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Due Date">
                    {formatDate(assessment.due_date)}
                    {isOverdue(assessment.due_date, assessment.status) && (
                      <Tag color="red" style={{ marginLeft: 8 }}>OVERDUE</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated">
                    {formatDateTime(assessment.updated_at)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card size="small" title="Risk Analysis" bordered={false}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                        {assessment.probability || 0}/5
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>Probability</div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                        {assessment.impact || 0}/5
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>Impact</div>
                    </Card>
                  </Col>
                </Row>

                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>Risk Score</span>
                    <span style={{ fontWeight: 'bold' }}>{assessment.risk_score || 0}/25</span>
                  </div>
                  <Progress 
                    percent={((assessment.risk_score || 0) / 25) * 100} 
                    strokeColor={getRiskLevelColor(assessment.risk_level)}
                  />
                </div>

                <Divider />

                <div>
                  <h4>Risk Matrix</h4>
                  <div style={{ 
                    width: '100%', 
                    height: 150, 
                    background: 'linear-gradient(45deg, #52c41a, #faad14, #ff4d4f, #722ed1)',
                    borderRadius: 6,
                    position: 'relative',
                    marginTop: 8,
                    border: '1px solid #d9d9d9'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: `${((assessment.probability || 1) - 1) * 20}%`,
                      top: `${(5 - (assessment.impact || 1)) * 20}%`,
                      width: 16,
                      height: 16,
                      background: 'white',
                      border: '3px solid #1890ff',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 5,
                      left: 5,
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 'bold'
                    }}>Low Risk</div>
                    <div style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 'bold'
                    }}>High Risk</div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card size="small" title="Risk Management" bordered={false}>
                {assessment.description && (
                  <>
                    <h4>Description</h4>
                    <p style={{ color: '#666' }}>{assessment.description}</p>
                    <Divider />
                  </>
                )}

                {assessment.mitigation_steps?.length > 0 && (
                  <>
                    <h4>Mitigation Steps</h4>
                    <List
                      size="small"
                      dataSource={assessment.mitigation_steps}
                      renderItem={item => (
                        <List.Item>
                          <SafetyCertificateOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {item}
                        </List.Item>
                      )}
                    />
                    <Divider />
                  </>
                )}

                {assessment.corrective_actions && (
                  <>
                    <h4>Corrective Actions</h4>
                    <p style={{ color: '#666' }}>{assessment.corrective_actions}</p>
                    <Divider />
                  </>
                )}

                {assessment.control_measures && (
                  <>
                    <h4>Control Measures</h4>
                    <p style={{ color: '#666' }}>{assessment.control_measures}</p>
                  </>
                )}

                {assessment.template_data && Object.keys(assessment.template_data).length > 0 && (
                  <>
                    <Divider />
                    <h4>Template Specific Data</h4>
                    <Descriptions column={1} size="small">
                      {Object.entries(assessment.template_data).map(([key, value]) => (
                        <Descriptions.Item key={key} label={key.replace(/_/g, ' ').toUpperCase()}>
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || 'N/A'}
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  </>
                )}
              </Card>
            </Col>
          </Row>

          {assessment.standards?.length > 0 && (
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card size="small" title="Compliance Standards" bordered={false}>
                  <Row gutter={[16, 16]}>
                    {assessment.standards.map(standard => {
                      const std = INTERNATIONAL_STANDARDS[standard];
                      if (!std) return null;
                      
                      return (
                        <Col xs={24} sm={12} md={8} lg={6} key={standard}>
                          <Card size="small" style={{ height: '100%' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 16, fontWeight: 'bold', color: std.color || '#1890ff' }}>
                                {std.name}
                              </div>
                              <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                                {std.desc}
                              </div>
                            </div>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </Card>
              </Col>
            </Row>
          )}

          {assessment.tags?.length > 0 && (
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card size="small" title="Tags" bordered={false}>
                  <Space wrap>
                    {assessment.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                </Card>
              </Col>
            </Row>
          )}
        </Card>
      </div>
    );
  }

  // ============================================
  // MAIN LIST VIEW
  // ============================================

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SafetyCertificateOutlined /> Risk Assessment Management
        </Title>
        <Paragraph>
          Comprehensive risk assessment system with industry-specific templates (ISO 31000, ISO 45001, ICAO, API, JCI, etc.)
        </Paragraph>
      </div>

      {renderStatistics()}
      {renderToolbar()}

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : filteredAssessments.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredAssessments}
            rowKey="id"
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              selections: [
                Table.SELECTION_ALL,
                Table.SELECTION_INVERT,
                Table.SELECTION_NONE,
                {
                  key: 'high_risk',
                  text: 'Select High/Critical Risk',
                  onSelect: () => {
                    const keys = assessments
                      .filter(a => a.risk_level === 'high' || a.risk_level === 'critical')
                      .map(a => a.id);
                    setSelectedRowKeys(keys);
                  },
                },
                {
                  key: 'overdue',
                  text: 'Select Overdue',
                  onSelect: () => {
                    const keys = assessments
                      .filter(a => isOverdue(a.due_date, a.status))
                      .map(a => a.id);
                    setSelectedRowKeys(keys);
                  },
                },
              ],
            }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ['10', '20', '50', '100'],
              defaultPageSize: 10,
            }}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: 16, background: '#fafafa' }}>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Description" span={2}>
                          {record.description || 'No description provided'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Template">
                          {INDUSTRY_TEMPLATES[record.template_type]?.name || record.template_type || 'General'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Sections">
                          {INDUSTRY_TEMPLATES[record.template_type]?.sections?.length || 0}
                        </Descriptions.Item>
                        {record.mitigation_steps?.length > 0 && (
                          <Descriptions.Item label="Mitigation Steps" span={2}>
                            <List
                              size="small"
                              dataSource={record.mitigation_steps}
                              renderItem={item => (
                                <List.Item>
                                  <SafetyCertificateOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                  {item}
                                </List.Item>
                              )}
                            />
                          </Descriptions.Item>
                        )}
                        {record.standards?.length > 0 && (
                          <Descriptions.Item label="Standards" span={2}>
                            <Space wrap>
                              {record.standards.map(std => {
                                const stdObj = INTERNATIONAL_STANDARDS[std];
                                return (
                                  <Tag key={std} color={stdObj?.color || 'blue'}>
                                    <SafetyCertificateOutlined /> {stdObj?.name || std}
                                  </Tag>
                                );
                              })}
                            </Space>
                          </Descriptions.Item>
                        )}
                        {record.template_data && Object.keys(record.template_data).length > 0 && (
                          <Descriptions.Item label="Template Data" span={2}>
                            <Descriptions column={2} size="small">
                              {Object.entries(record.template_data).slice(0, 4).map(([key, value]) => (
                                <Descriptions.Item key={key} label={key.replace(/_/g, ' ').toUpperCase()}>
                                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || 'N/A'}
                                </Descriptions.Item>
                              ))}
                              {Object.keys(record.template_data).length > 4 && (
                                <Descriptions.Item label="...">
                                  +{Object.keys(record.template_data).length - 4} more fields
                                </Descriptions.Item>
                              )}
                            </Descriptions>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Col>
                  </Row>
                </div>
              ),
              expandedRowKeys,
              onExpandedRowsChange: setExpandedRowKeys,
              rowExpandable: () => true,
            }}
            onChange={(pagination, filters, sorter) => {
              if (sorter && sorter.field) {
                setSortField(sorter.field);
                setSortOrder(sorter.order || 'ascend');
              }
            }}
            scroll={{ x: 1600 }}
            bordered
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No risk assessments found
                <br />
                <Text type="secondary">Create your first risk assessment using one of the industry templates</Text>
              </span>
            }
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNew}>
              Create First Assessment
            </Button>
          </Empty>
        )}
      </Card>

      {/* Template Selection Modal */}
      <Modal
        title="Select Assessment Template"
        open={isTemplateModalVisible}
        onCancel={handleTemplateModalCancel}
        footer={null}
        width={1000}
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Select Template" />
          <Step title="Configure" />
          <Step title="Review" />
        </Steps>

        {currentStep === 0 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <h3>Choose an Industry Template</h3>
              <p>Select a template based on your industry and compliance requirements</p>
            </div>
            
            <Row gutter={[16, 16]}>
              {Object.entries(INDUSTRY_TEMPLATES).map(([key, template]) => (
                <Col xs={24} sm={12} lg={8} key={key}>
                  <Card
                    hoverable
                    onClick={() => handleTemplateSelect(key)}
                    style={{ 
                      border: `2px solid ${template.color}30`,
                      borderRadius: 8,
                      height: '100%',
                      transition: 'all 0.3s',
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
                        <p style={{ color: '#666', fontSize: 12, margin: '4px 0' }}>
                          {template.description}
                        </p>
                        <div style={{ marginTop: 8 }}>
                          <Tag color={template.color}>{template.sections.length} Sections</Tag>
                          <Tag>Comprehensive</Tag>
                        </div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 8 }}>
                          {template.sections.reduce((acc, s) => acc + s.fields.length, 0)} fields
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Modal>

      {/* Assessment Form Modal */}
      <Modal
        title={
          selectedTemplate ? 
            `New ${selectedTemplate.name}` : 
            (selectedAssessment?.id ? 'Edit Risk Assessment' : 'New Risk Assessment')
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={900}
        okText={selectedAssessment?.id ? 'Update' : 'Create'}
        okButtonProps={{ icon: <SaveOutlined /> }}
        confirmLoading={loading}
      >
        <Form 
          form={form} 
          layout="vertical"
          initialValues={{
            probability: 3,
            impact: 3,
            status: 'draft',
            priority: 'medium'
          }}
        >
          {/* Basic Information */}
          <Card title="Basic Information" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item 
                  label="Assessment Title" 
                  name="title"
                  rules={[{ required: true, message: 'Please enter assessment title' }]}
                >
                  <Input placeholder="Enter assessment title" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label="Industry" 
                  name="industry"
                  rules={[{ required: true, message: 'Please select industry' }]}
                >
                  <Select placeholder="Select industry">
                    {Object.entries(INDUSTRIES).map(([key, value]) => (
                      <Option key={key} value={key}>{value.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label="Department" 
                  name="department"
                  rules={[{ required: true, message: 'Please select department' }]}
                >
                  <Select placeholder="Select department" allowClear>
                    {DEPARTMENTS.map(d => (
                      <Option key={d} value={d}>{d}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Status" name="status">
                  <Select>
                    {STATUSES.map(s => (
                      <Option key={s.value} value={s.value}>{s.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Priority" name="priority">
                  <Select>
                    {PRIORITIES.map(p => (
                      <Option key={p.value} value={p.value}>{p.label}</Option>
                    ))}
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
              <TextArea rows={3} placeholder="Describe the risk assessment..." />
            </Form.Item>
          </Card>

          {/* Risk Matrix */}
          <Card title="Risk Matrix" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label="Probability (1-5)" 
                  name="probability"
                  rules={[{ required: true, message: 'Please select probability' }]}
                >
                  <Select placeholder="Select probability">
                    <Option value={1}>1 - Very Low</Option>
                    <Option value={2}>2 - Low</Option>
                    <Option value={3}>3 - Medium</Option>
                    <Option value={4}>4 - High</Option>
                    <Option value={5}>5 - Very High</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label="Impact (1-5)" 
                  name="impact"
                  rules={[{ required: true, message: 'Please select impact' }]}
                >
                  <Select placeholder="Select impact">
                    <Option value={1}>1 - Very Low</Option>
                    <Option value={2}>2 - Low</Option>
                    <Option value={3}>3 - Medium</Option>
                    <Option value={4}>4 - High</Option>
                    <Option value={5}>5 - Very High</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Template Specific Sections */}
          {selectedTemplate && selectedTemplate.sections.map((section) => (
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

          {/* Additional Fields */}
          <Card title="Additional Information" size="small" style={{ marginBottom: 16 }}>
            <Form.Item label="Mitigation Steps" name="mitigation_steps">
              <Select
                mode="tags"
                placeholder="Add mitigation steps (press Enter after each)"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="Corrective Actions" name="corrective_actions">
              <TextArea rows={2} placeholder="Required corrective actions..." />
            </Form.Item>

            <Form.Item label="Control Measures" name="control_measures">
              <TextArea rows={2} placeholder="Existing and proposed control measures..." />
            </Form.Item>

            <Form.Item label="Standards" name="standards">
              <Select
                mode="multiple"
                placeholder="Select applicable standards"
                style={{ width: '100%' }}
              >
                {Object.entries(INTERNATIONAL_STANDARDS).map(([key, std]) => (
                  <Option key={key} value={key}>{std.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tags" name="tags">
              <Select
                mode="tags"
                placeholder="Add tags (press Enter after each)"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Card>
        </Form>
      </Modal>

      {/* Download Options Modal */}
      <Modal
        title="Download Risk Assessment"
        open={isDownloadModalVisible}
        onOk={handleDownloadModalOk}
        onCancel={handleDownloadModalCancel}
        okText="Download"
        confirmLoading={loading}
      >
        {selectedAssessment ? (
          <div>
            <h4>{selectedAssessment.title}</h4>
            <p>Select download format:</p>
            <Radio.Group 
              value={downloadFormat} 
              onChange={e => setDownloadFormat(e.target.value)}
              style={{ marginBottom: 16 }}
            >
              <Radio.Button value="pdf">
                <FilePdfOutlined /> PDF Report
              </Radio.Button>
              <Radio.Button value="excel">
                <FileExcelOutlined /> Excel Spreadsheet
              </Radio.Button>
              <Radio.Button value="json">
                <FileTextOutlined /> JSON Data
              </Radio.Button>
            </Radio.Group>
            
            <Alert
              message="Download Includes"
              description="Assessment details, risk analysis, mitigation steps, and compliance information"
              type="info"
              showIcon
            />
          </div>
        ) : (
          <div>
            <p>Select bulk download format:</p>
            <Space>
              <Button 
                icon={<FileExcelOutlined />}
                onClick={() => handleDownloadAll('excel')}
                size="large"
              >
                Excel (All Data)
              </Button>
              <Button 
                icon={<FilePdfOutlined />}
                onClick={() => handleDownloadAll('pdf')}
                size="large"
              >
                PDF (Summary)
              </Button>
            </Space>
            <Alert
              message="Bulk Export"
              description="Export all assessments with selected format"
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        )}
      </Modal>

      {/* View Drawer */}
      <Drawer
        title="Assessment Details"
        placement="right"
        open={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
        width={600}
      >
        {selectedAssessment && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Assessment Number">
                {selectedAssessment.assessment_number}
              </Descriptions.Item>
              <Descriptions.Item label="Title">
                {selectedAssessment.title}
              </Descriptions.Item>
              <Descriptions.Item label="Template">
                <Tag color={INDUSTRY_TEMPLATES[selectedAssessment.template_type]?.color}>
                  {INDUSTRY_TEMPLATES[selectedAssessment.template_type]?.name || selectedAssessment.template_type || 'General'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedAssessment.status)}>
                  {selectedAssessment.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Risk Level">
                <Tag color={getRiskLevelColor(selectedAssessment.risk_level)}>
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
                <Tag color={getPriorityColor(selectedAssessment.priority)}>
                  {selectedAssessment.priority?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Industry">
                {INDUSTRIES[selectedAssessment.industry]?.label || selectedAssessment.industry}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedAssessment.department || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Assigned To">
                {selectedAssessment.assigned_to?.name || 'Unassigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Assessment Date">
                {formatDate(selectedAssessment.assessment_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Due Date">
                {formatDate(selectedAssessment.due_date)}
                {isOverdue(selectedAssessment.due_date, selectedAssessment.status) && (
                  <Tag color="red" style={{ marginLeft: 8 }}>OVERDUE</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedAssessment.description || 'No description provided'}
              </Descriptions.Item>
              {selectedAssessment.mitigation_steps?.length > 0 && (
                <Descriptions.Item label="Mitigation Steps" span={2}>
                  <List
                    size="small"
                    dataSource={selectedAssessment.mitigation_steps}
                    renderItem={item => <List.Item>{item}</List.Item>}
                  />
                </Descriptions.Item>
              )}
              {selectedAssessment.corrective_actions && (
                <Descriptions.Item label="Corrective Actions" span={2}>
                  {selectedAssessment.corrective_actions}
                </Descriptions.Item>
              )}
              {selectedAssessment.control_measures && (
                <Descriptions.Item label="Control Measures" span={2}>
                  {selectedAssessment.control_measures}
                </Descriptions.Item>
              )}
              {selectedAssessment.standards?.length > 0 && (
                <Descriptions.Item label="Standards" span={2}>
                  <Space wrap>
                    {selectedAssessment.standards.map(std => {
                      const stdObj = INTERNATIONAL_STANDARDS[std];
                      return (
                        <Tag key={std} color={stdObj?.color || 'blue'}>
                          {stdObj?.name || std}
                        </Tag>
                      );
                    })}
                  </Space>
                </Descriptions.Item>
              )}
              {selectedAssessment.template_data && Object.keys(selectedAssessment.template_data).length > 0 && (
                <Descriptions.Item label="Template Data" span={2}>
                  <Descriptions column={1} size="small">
                    {Object.entries(selectedAssessment.template_data).map(([key, value]) => (
                      <Descriptions.Item key={key} label={key.replace(/_/g, ' ').toUpperCase()}>
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || 'N/A'}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </Descriptions.Item>
              )}
              {selectedAssessment.tags?.length > 0 && (
                <Descriptions.Item label="Tags" span={2}>
                  <Space wrap>
                    {selectedAssessment.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Created At">
                {formatDateTime(selectedAssessment.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {formatDateTime(selectedAssessment.updated_at)}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => {
                  setIsDrawerVisible(false);
                  handleEdit(selectedAssessment);
                }}
              >
                Edit
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => {
                  setIsDrawerVisible(false);
                  setSelectedAssessment(selectedAssessment);
                  setIsDownloadModalVisible(true);
                }}
              >
                Download
              </Button>
              <Button 
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setIsDrawerVisible(false);
                  handleDelete(selectedAssessment);
                }}
              >
                Delete
              </Button>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default RiskAssessmentPage;