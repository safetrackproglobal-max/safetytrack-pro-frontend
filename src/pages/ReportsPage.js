// src/pages/ReportsPage.js - Complete with Enhanced Media Upload & Incident Details
import React, { useState, useContext, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Modal, Form, Input, Select, DatePicker, 
  Upload, message, Alert, Tabs, TimePicker, InputNumber,
  Divider, Radio, Tag, Table, Spin, Empty, Tooltip, Statistic, Progress,
  Space, Badge, Descriptions, Typography, Collapse,
  Switch, Popconfirm, TreeSelect, Slider,
  List, Skeleton, Drawer, Popover,
  Menu, Dropdown, Pagination, Breadcrumb, Affix,
  Result, Checkbox
} from 'antd';
import { 
  AlertOutlined, 
  ExportOutlined, 
  FileTextOutlined, 
  EnvironmentOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  MedicineBoxOutlined,
  ToolOutlined,
  RocketOutlined,
  HomeOutlined,
  CarOutlined,
  BankOutlined,
  TeamOutlined,
  CameraOutlined,
  FileDoneOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PaperClipOutlined,
  InboxOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  DownloadOutlined,
  AudioOutlined,
  InfoCircleOutlined,
  ApartmentOutlined,
  ReconciliationOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import NotificationContext from '../context/NotificationContext';
import ExportPanel from '../components/reports/ExportPanel';
import CustomReportBuilder from '../components/reports/CustomReportBuilder';
import { useIncidentNotifications } from '../context/NotificationContext';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Text, Paragraph } = Typography;
const { Dragger } = Upload;

// ==================== CONSTANTS ====================

const INCIDENT_STATUS = {
  DRAFT: 'draft',
  REPORTED: 'reported',
  UNDER_REVIEW: 'under_review',
  INVESTIGATING: 'investigating',
  AWAITING_ACTION: 'awaiting_action',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  VERIFIED: 'verified',
  CLOSED: 'closed',
  REJECTED: 'rejected',
  ESCALATED: 'escalated',
  ON_HOLD: 'on_hold',
  REOPENED: 'reopened',
  WITHDRAWN: 'withdrawn',
  CANCELLED: 'cancelled'
};

const STATUS_CONFIG = {
  draft: { color: '#d9d9d9', label: 'Draft', icon: '📝', description: 'Initial draft', category: 'pending' },
  reported: { color: '#1890ff', label: 'Reported', icon: '📋', description: 'Incident reported', category: 'pending' },
  under_review: { color: '#faad14', label: 'Under Review', icon: '🔍', description: 'Being reviewed', category: 'pending' },
  investigating: { color: '#722ed1', label: 'Investigating', icon: '🔬', description: 'Investigation in progress', category: 'pending' },
  awaiting_action: { color: '#13c2c2', label: 'Awaiting Action', icon: '⏳', description: 'Waiting for action', category: 'pending' },
  in_progress: { color: '#2f54eb', label: 'In Progress', icon: '⚙️', description: 'Action being taken', category: 'pending' },
  resolved: { color: '#52c41a', label: 'Resolved', icon: '✅', description: 'Incident resolved', category: 'resolved' },
  verified: { color: '#faad14', label: 'Verified', icon: '✔️', description: 'Resolution verified', category: 'resolved' },
  closed: { color: '#d9d9d9', label: 'Closed', icon: '📌', description: 'Case closed', category: 'resolved' },
  rejected: { color: '#f5222d', label: 'Rejected', icon: '❌', description: 'Incident rejected', category: 'closed' },
  escalated: { color: '#f5222d', label: 'Escalated', icon: '🚨', description: 'Escalated to higher level', category: 'critical' },
  on_hold: { color: '#faad14', label: 'On Hold', icon: '⏸️', description: 'Temporarily on hold', category: 'pending' },
  reopened: { color: '#2f54eb', label: 'Reopened', icon: '🔄', description: 'Reopened for further action', category: 'pending' },
  withdrawn: { color: '#d9d9d9', label: 'Withdrawn', icon: '↩️', description: 'Withdrawn by reporter', category: 'closed' },
  cancelled: { color: '#d9d9d9', label: 'Cancelled', icon: '🚫', description: 'Cancelled', category: 'closed' }
};

const STATUS_FLOW = {
  draft: { allowed: ['reported', 'withdrawn'], description: 'Initial draft can be submitted or withdrawn' },
  reported: { allowed: ['investigating', 'withdrawn'], description: 'Reported incidents can be sent for investigation or withdrawn' },
  investigating: { allowed: ['under_review', 'on_hold', 'escalated'], description: 'Under investigation - can be reviewed, put on hold, or escalated' },
  under_review: { allowed: ['resolved', 'escalated', 'reopened'], description: 'Under review - can be resolved, escalated, or reopened' },
  on_hold: { allowed: ['investigating', 'cancelled'], description: 'On hold - can resume investigation or cancel' },
  resolved: { allowed: ['closed', 'reopened'], description: 'Resolved - can be closed or reopened' },
  escalated: { allowed: ['under_review', 'resolved'], description: 'Escalated - can be reviewed or resolved' },
  closed: { allowed: ['reopened'], description: 'Closed - can be reopened if needed' },
  reopened: { allowed: ['investigating', 'resolved'], description: 'Reopened - can be investigated or resolved' },
  rejected: { allowed: ['under_review', 'withdrawn'], description: 'Rejected - can be reviewed or withdrawn' },
  withdrawn: { allowed: ['reported'], description: 'Withdrawn - can be reported again' },
  cancelled: { allowed: ['draft', 'reported'], description: 'Cancelled - can be restarted' }
};

// ==================== INDUSTRY CONFIGURATIONS ====================

const industries = [
  { id: 'healthcare', name: 'Healthcare', icon: <MedicineBoxOutlined />, color: '#1890ff' },
  { id: 'construction', name: 'Construction', icon: <ToolOutlined />, color: '#fa8c16' },
  { id: 'oil_gas', name: 'Oil & Gas', icon: <EnvironmentOutlined />, color: '#52c41a' },
  { id: 'aviation', name: 'Aviation', icon: <RocketOutlined />, color: '#722ed1' },
  { id: 'manufacturing', name: 'Manufacturing', icon: <HomeOutlined />, color: '#fa541c' },
  { id: 'transportation', name: 'Transportation', icon: <CarOutlined />, color: '#13c2c2' },
  { id: 'mining', name: 'Mining', icon: <SafetyCertificateOutlined />, color: '#eb2f96' },
  { id: 'hospitality', name: 'Hospitality', icon: <BankOutlined />, color: '#a0d911' }
];

// ==================== INDUSTRY CONFIGS ====================

const industryConfigs = {
  healthcare: {
    incidentTypes: [
      { value: 'needle_stick', label: 'Needle Stick Injury', severity: 'high' },
      { value: 'patient_fall', label: 'Patient Fall', severity: 'medium' },
      { value: 'medication_error', label: 'Medication Error', severity: 'high' },
      { value: 'biohazard', label: 'Biohazard Exposure', severity: 'high' },
      { value: 'equipment_failure', label: 'Medical Equipment Failure', severity: 'medium' },
      { value: 'workplace_violence', label: 'Workplace Violence', severity: 'critical' }
    ],
    customFields: (form) => (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="patient_involved" label="Patient Involved?">
              <Select>
                <Option value="yes">Yes</Option>
                <Option value="no">No</Option>
                <Option value="unknown">Unknown</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="body_fluid_exposure" label="Body Fluid Exposure">
              <Select>
                <Option value="blood">Blood</Option>
                <Option value="saliva">Saliva</Option>
                <Option value="urine">Urine</Option>
                <Option value="other">Other</Option>
                <Option value="none">None</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="medical_attention" label="Medical Attention Required">
          <Radio.Group>
            <Radio value="first_aid">First Aid Only</Radio>
            <Radio value="emergency_room">Emergency Room</Radio>
            <Radio value="hospitalization">Hospitalization</Radio>
            <Radio value="none">No Medical Attention</Radio>
          </Radio.Group>
        </Form.Item>
      </>
    ),
    departments: ['Emergency', 'Surgery', 'ICU', 'Pediatrics', 'Radiology', 'Pharmacy', 'Laboratory', 'Administration']
  },
  construction: {
    incidentTypes: [
      { value: 'fall_height', label: 'Fall from Height', severity: 'high' },
      { value: 'equipment_accident', label: 'Equipment Accident', severity: 'high' },
      { value: 'structural_collapse', label: 'Structural Collapse', severity: 'critical' },
      { value: 'electrical', label: 'Electrical Hazard', severity: 'high' },
      { value: 'fire', label: 'Fire', severity: 'critical' },
      { value: 'struck_by', label: 'Struck by Object', severity: 'medium' }
    ],
    customFields: (form) => (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="height_involved" label="Height Involved (meters)">
              <InputNumber min={0} max={1000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="safety_equipment" label="Safety Equipment Used">
              <Select mode="multiple">
                <Option value="harness">Safety Harness</Option>
                <Option value="helmet">Hard Hat</Option>
                <Option value="gloves">Gloves</Option>
                <Option value="goggles">Safety Goggles</Option>
                <Option value="none">None</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="work_permit" label="Work Permit in Place">
          <Radio.Group>
            <Radio value="yes">Yes</Radio>
            <Radio value="no">No</Radio>
            <Radio value="not_required">Not Required</Radio>
          </Radio.Group>
        </Form.Item>
      </>
    ),
    departments: ['Site A', 'Site B', 'Site C', 'Warehouse', 'Equipment Yard', 'Admin Office', 'Safety Office']
  },
  oil_gas: {
    incidentTypes: [
      { value: 'spill', label: 'Spill/Leak', severity: 'high' },
      { value: 'fire_explosion', label: 'Fire/Explosion', severity: 'critical' },
      { value: 'chemical_exposure', label: 'Chemical Exposure', severity: 'high' },
      { value: 'equipment_failure', label: 'Equipment Failure', severity: 'medium' },
      { value: 'confined_space', label: 'Confined Space Incident', severity: 'high' },
      { value: 'gas_release', label: 'Gas Release', severity: 'critical' }
    ],
    customFields: (form) => (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="substance_involved" label="Substance Involved">
              <Select>
                <Option value="crude_oil">Crude Oil</Option>
                <Option value="natural_gas">Natural Gas</Option>
                <Option value="chemical">Chemical</Option>
                <Option value="h2s">H2S</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="quantity_released" label="Quantity Released">
              <Input addonAfter="barrels" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="containment_status" label="Containment Status">
          <Radio.Group>
            <Radio value="immediate">Immediate Containment</Radio>
            <Radio value="ongoing">Ongoing Containment</Radio>
            <Radio value="not_contained">Not Contained</Radio>
          </Radio.Group>
        </Form.Item>
      </>
    ),
    departments: ['Drilling', 'Production', 'Refinery', 'Pipeline', 'Maintenance', 'Safety', 'Logistics']
  },
  aviation: {
    incidentTypes: [
      { value: 'ground_incident', label: 'Ground Incident', severity: 'medium' },
      { value: 'maintenance_issue', label: 'Maintenance Issue', severity: 'high' },
      { value: 'safety_violation', label: 'Safety Violation', severity: 'medium' },
      { value: 'security_breach', label: 'Security Breach', severity: 'high' },
      { value: 'equipment_damage', label: 'Equipment Damage', severity: 'medium' },
      { value: 'runway_incident', label: 'Runway Incident', severity: 'critical' }
    ],
    customFields: (form) => (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="aircraft_type" label="Aircraft Type">
              <Input placeholder="e.g., B737, A320" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="flight_phase" label="Flight Phase">
              <Select>
                <Option value="pre_flight">Pre-flight</Option>
                <Option value="taxi">Taxi</Option>
                <Option value="takeoff">Takeoff</Option>
                <Option value="en_route">En Route</Option>
                <Option value="landing">Landing</Option>
                <Option value="parked">Parked</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="regulatory_report" label="Regulatory Report Required">
          <Radio.Group>
            <Radio value="faa">FAA Report</Radio>
            <Radio value="easa">EASA Report</Radio>
            <Radio value="local">Local Authority</Radio>
            <Radio value="none">Not Required</Radio>
          </Radio.Group>
        </Form.Item>
      </>
    ),
    departments: ['Flight Ops', 'Maintenance', 'Ground Handling', 'Catering', 'Security', 'Dispatch', 'Cargo']
  },
  manufacturing: {
    incidentTypes: [
      { value: 'machine_accident', label: 'Machine Accident', severity: 'high' },
      { value: 'chemical_exposure', label: 'Chemical Exposure', severity: 'high' },
      { value: 'fire', label: 'Fire', severity: 'critical' },
      { value: 'ergonomics', label: 'Ergonomics Issue', severity: 'low' },
      { value: 'noise_hazard', label: 'Noise Hazard', severity: 'medium' },
      { value: 'amputation', label: 'Amputation', severity: 'critical' }
    ],
    customFields: (form) => (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="machine_involved" label="Machine Involved">
              <Input placeholder="Machine type and ID" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lockout_tagout" label="Lockout/Tagout Used">
              <Radio.Group>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
                <Radio value="not_applicable">Not Applicable</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="production_impact" label="Production Impact">
          <Select>
            <Option value="none">No Impact</Option>
            <Option value="minor">Minor Delay</Option>
            <Option value="significant">Significant Delay</Option>
            <Option value="line_stop">Production Line Stopped</Option>
          </Select>
        </Form.Item>
      </>
    ),
    departments: ['Production Line A', 'Production Line B', 'Warehouse', 'Maintenance', 'Quality Control', 'Safety']
  },
  transportation: {
    incidentTypes: [
      { value: 'vehicle_accident', label: 'Vehicle Accident', severity: 'high' },
      { value: 'loading_unloading', label: 'Loading/Unloading Incident', severity: 'medium' },
      { value: 'spill', label: 'Spill During Transport', severity: 'high' },
      { value: 'driver_safety', label: 'Driver Safety Issue', severity: 'medium' },
      { value: 'cargo_damage', label: 'Cargo Damage', severity: 'low' }
    ],
    customFields: (form) => (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="vehicle_type" label="Vehicle Type">
              <Select>
                <Option value="truck">Truck</Option>
                <Option value="van">Van</Option>
                <Option value="car">Car</Option>
                <Option value="forklift">Forklift</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="cargo_type" label="Cargo Type">
              <Input placeholder="Type of cargo being transported" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="road_conditions" label="Road Conditions">
          <Select mode="multiple">
            <Option value="dry">Dry</Option>
            <Option value="wet">Wet</Option>
            <Option value="icy">Icy</Option>
            <Option value="foggy">Foggy</Option>
            <Option value="night">Night Driving</Option>
          </Select>
        </Form.Item>
      </>
    ),
    departments: ['Fleet', 'Dispatch', 'Maintenance', 'Warehouse', 'Logistics', 'Safety']
  },
  mining: {
    incidentTypes: [
      { value: 'cave_in', label: 'Cave-in', severity: 'critical' },
      { value: 'dust_explosion', label: 'Dust Explosion', severity: 'critical' },
      { value: 'equipment_failure', label: 'Equipment Failure', severity: 'high' },
      { value: 'chemical_exposure', label: 'Chemical Exposure', severity: 'high' },
      { value: 'respiratory', label: 'Respiratory Hazard', severity: 'medium' }
    ],
    customFields: (form) => (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="mine_type" label="Mine Type">
              <Select>
                <Option value="underground">Underground</Option>
                <Option value="surface">Surface</Option>
                <Option value="quarry">Quarry</Option>
                <Option value="placer">Placer</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="depth" label="Depth (meters)">
              <InputNumber min={0} max={5000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="gas_monitoring" label="Gas Monitoring Active">
          <Radio.Group>
            <Radio value="yes">Yes</Radio>
            <Radio value="no">No</Radio>
            <Radio value="equipment_failed">Equipment Failed</Radio>
          </Radio.Group>
        </Form.Item>
      </>
    ),
    departments: ['Underground A', 'Underground B', 'Surface', 'Processing', 'Maintenance', 'Safety']
  },
  hospitality: {
    incidentTypes: [
      { value: 'slip_trip_fall', label: 'Slip/Trip/Fall', severity: 'medium' },
      { value: 'food_safety', label: 'Food Safety Issue', severity: 'high' },
      { value: 'fire_safety', label: 'Fire Safety', severity: 'high' },
      { value: 'security_incident', label: 'Security Incident', severity: 'medium' },
      { value: 'chemical_exposure', label: 'Chemical Exposure', severity: 'medium' }
    ],
    customFields: (form) => (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="area_type" label="Area Type">
              <Select>
                <Option value="kitchen">Kitchen</Option>
                <Option value="dining">Dining Area</Option>
                <Option value="guest_room">Guest Room</Option>
                <Option value="pool">Pool Area</Option>
                <Option value="parking">Parking Lot</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="guest_involved" label="Guest Involved">
              <Radio.Group>
                <Radio value="yes">Yes</Radio>
                <Radio value="no">No</Radio>
                <Radio value="staff_only">Staff Only</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="sanitation_level" label="Sanitation Level at Time of Incident">
          <Select>
            <Option value="excellent">Excellent</Option>
            <Option value="good">Good</Option>
            <Option value="fair">Fair</Option>
            <Option value="poor">Poor</Option>
          </Select>
        </Form.Item>
      </>
    ),
    departments: ['Front Desk', 'Housekeeping', 'Food & Beverage', 'Maintenance', 'Security', 'Management']
  }
};

// ==================== HELPER FUNCTIONS ====================

const combineDateTime = (date, time) => {
  if (!date || !time) return new Date().toISOString();
  const dateStr = date.format('YYYY-MM-DD');
  const timeStr = time.format('HH:mm:ss');
  return new Date(`${dateStr}T${timeStr}Z`).toISOString();
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

const getSeverityTag = (severity) => {
  const config = {
    critical: { color: 'red', text: 'Critical 🚨' },
    high: { color: 'orange', text: 'High ⚠️' },
    medium: { color: 'gold', text: 'Medium' },
    low: { color: 'green', text: 'Low' }
  };
  const cfg = config[severity] || { color: 'default', text: severity };
  return <Tag color={cfg.color}>{cfg.text}</Tag>;
};

const getStatusTag = (status) => {
  const config = STATUS_CONFIG[status] || { color: 'default', label: status, icon: '' };
  return <Tag color={config.color}>{config.icon} {config.label}</Tag>;
};

// ==================== MEDIA UPLOAD COMPONENT ====================

const MediaUploadSection = ({ 
  fileList, 
  setFileList, 
  uploading, 
  setUploading,
  maxFiles = 10,
  maxSizeMB = 50
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});

  const getFileIcon = (file) => {
    const type = file.type || '';
    const name = file.name || '';
    
    if (type.startsWith('image/')) return <FileImageOutlined style={{ color: '#1890ff', fontSize: '24px' }} />;
    if (type.startsWith('video/')) return <FileImageOutlined style={{ color: '#722ed1', fontSize: '24px' }} />;
    if (type.startsWith('audio/')) return <AudioOutlined style={{ color: '#fa541c', fontSize: '24px' }} />;
    if (type === 'application/pdf') return <FilePdfOutlined style={{ color: '#f5222d', fontSize: '24px' }} />;
    if (name.endsWith('.doc') || name.endsWith('.docx')) return <FileWordOutlined style={{ color: '#1890ff', fontSize: '24px' }} />;
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return <FileExcelOutlined style={{ color: '#52c41a', fontSize: '24px' }} />;
    if (name.endsWith('.zip') || name.endsWith('.rar')) return <FileZipOutlined style={{ color: '#faad14', fontSize: '24px' }} />;
    return <FileUnknownOutlined style={{ color: '#d9d9d9', fontSize: '24px' }} />;
  };

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const validateFile = (file) => {
    const isImage = file.type?.startsWith('image/');
    const isVideo = file.type?.startsWith('video/');
    const isDocument = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/json',
      'application/xml'
    ].includes(file.type);
    const isArchive = file.name?.endsWith('.zip') || file.name?.endsWith('.rar') || file.name?.endsWith('.7z');
    
    const isValidType = isImage || isVideo || isDocument || isArchive;
    if (!isValidType) {
      message.error(`${file.name} is not a supported file type.`);
      return false;
    }

    const isLtMaxSize = file.size / 1024 / 1024 < maxSizeMB;
    if (!isLtMaxSize) {
      message.error(`File must be smaller than ${maxSizeMB}MB!`);
      return false;
    }

    return true;
  };

  const handleUpload = async (file) => {
    if (!validateFile(file)) return false;

    setUploading(true);
    const uploadId = `${file.uid}-${Date.now()}`;
    
    try {
      setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        if (progress <= 100) {
          setUploadProgress(prev => ({ ...prev, [uploadId]: progress }));
        }
        if (progress >= 100) {
          clearInterval(interval);
          const newFile = {
            uid: file.uid,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'done',
            url: URL.createObjectURL(file),
            thumbUrl: file.type?.startsWith('image/') ? URL.createObjectURL(file) : null,
            uploadId: uploadId,
            uploadedAt: new Date().toISOString()
          };
          setFileList(prev => [...prev, newFile]);
          setUploading(false);
          message.success(`${file.name} uploaded successfully`);
        }
      }, 200);
      
    } catch (error) {
      console.error('Upload error:', error);
      message.error(`Failed to upload ${file.name}`);
      setUploading(false);
      return false;
    }
    return false;
  };

  const handleRemove = (file) => {
    const newFileList = fileList.filter(f => f.uid !== file.uid);
    setFileList(newFileList);
    if (file.url) URL.revokeObjectURL(file.url);
    if (file.thumbUrl) URL.revokeObjectURL(file.thumbUrl);
    message.info(`${file.name} removed`);
  };

  const handlePreview = (file) => {
    if (file.type?.startsWith('image/') && file.url) {
      setPreviewImage(file.url);
      setPreviewTitle(file.name);
      setPreviewVisible(true);
    } else if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.json,.xml,.zip,.rar,.7z',
    fileList: fileList,
    customRequest: ({ file, onSuccess }) => {
      handleUpload(file);
      onSuccess('ok');
    },
    onRemove: handleRemove,
    onPreview: handlePreview,
    beforeUpload: validateFile,
    showUploadList: false,
    disabled: uploading || fileList.length >= maxFiles
  };

  return (
    <div>
      <Alert
        message="Evidence & Documentation"
        description={`Upload photos, videos, documents, and other evidence. Max ${maxFiles} files, ${maxSizeMB}MB each.`}
        type="info"
        showIcon
        icon={<PaperClipOutlined />}
        style={{ marginBottom: '16px' }}
      />

      <Dragger {...uploadProps} style={{ marginBottom: '16px' }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag files to upload</p>
        <p className="ant-upload-hint">
          Support for images, videos, PDFs, Word, Excel, and archives.
          {fileList.length > 0 && ` (${fileList.length}/${maxFiles} files)`}
        </p>
      </Dragger>

      {fileList.length > 0 && (
        <div>
          <Divider orientation="left">
            <Space>
              <PaperClipOutlined />
              Uploaded Files ({fileList.length})
            </Space>
          </Divider>
          
          <Row gutter={[12, 12]}>
            {fileList.map((file) => (
              <Col xs={24} sm={12} md={8} lg={6} key={file.uid}>
                <Card
                  size="small"
                  cover={
                    file.type?.startsWith('image/') ? (
                      <div style={{ height: '150px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', cursor: 'pointer' }} onClick={() => handlePreview(file)}>
                        <img 
                          src={file.thumbUrl || file.url} 
                          alt={file.name}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', flexDirection: 'column' }}>
                        {getFileIcon(file)}
                        {file.uploadId && uploadProgress[file.uploadId] !== undefined && uploadProgress[file.uploadId] < 100 && (
                          <Progress percent={uploadProgress[file.uploadId]} size="small" style={{ width: '80%', marginTop: '8px' }} />
                        )}
                      </div>
                    )
                  }
                  actions={[
                    <Tooltip title="Preview">
                      <EyeOutlined key="preview" onClick={() => handlePreview(file)} />
                    </Tooltip>,
                    <Tooltip title="Download">
                      <DownloadOutlined key="download" onClick={() => file.url && window.open(file.url, '_blank')} />
                    </Tooltip>,
                    <Tooltip title="Remove">
                      <DeleteOutlined key="delete" onClick={() => handleRemove(file)} style={{ color: '#f5222d' }} />
                    </Tooltip>
                  ]}
                >
                  <Card.Meta
                    title={
                      <Tooltip title={file.name}>
                        <span style={{ fontSize: '12px' }}>
                          {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                        </span>
                      </Tooltip>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {formatFileSize(file.size)}
                        </Text>
                        {file.type && (
                          <Tag size="small" style={{ fontSize: '10px' }}>
                            {file.type.split('/')[0]}
                          </Tag>
                        )}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

// ==================== INCIDENT DETAILS MODAL ====================

const IncidentDetailsModal = ({ visible, incident, onClose, onEdit, onStatusUpdate, canEdit, canUpdateStatus }) => {
  if (!incident) return null;

  const statusConfig = STATUS_CONFIG[incident.status] || { color: 'default', label: incident.status };
  const evidenceFiles = incident.evidence_files || [];

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          Incident Details
          <Tag color="blue">{incident.incident_number || `#${incident.id}`}</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>Close</Button>,
        canUpdateStatus && (
          <Button key="status" type="primary" icon={<CheckCircleOutlined />} onClick={() => { onClose(); onStatusUpdate(incident); }}>
            Update Status
          </Button>
        ),
        canEdit && (
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { onClose(); onEdit(incident); }}>
            Edit Incident
          </Button>
        )
      ]}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Incident #" span={2}>
          <Text strong>{incident.incident_number || `INC-${incident.id}`}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Title" span={2}>{incident.title}</Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>{incident.description}</Descriptions.Item>
        <Descriptions.Item label="Type"><Tag>{incident.incident_type?.replace(/_/g, ' ')}</Tag></Descriptions.Item>
        <Descriptions.Item label="Category"><Tag>{incident.incident_category || 'N/A'}</Tag></Descriptions.Item>
        <Descriptions.Item label="Severity">{getSeverityTag(incident.severity)}</Descriptions.Item>
        <Descriptions.Item label="Status"><Tag color={statusConfig.color}>{statusConfig.icon} {statusConfig.label}</Tag></Descriptions.Item>
        <Descriptions.Item label="Department">{incident.department || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Industry">{incident.industryName || incident.industry_id || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Location">{incident.location || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Date Occurred">{formatDate(incident.date_occurred)}</Descriptions.Item>
        <Descriptions.Item label="Reported By">{incident.reported_by_name || incident.reported_by || 'Unknown'}</Descriptions.Item>
        <Descriptions.Item label="Reported At">{formatDate(incident.created_at || incident.reported_at)}</Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">People Information</Divider>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Injured Persons">{incident.custom_data?.injured_persons || '0'}</Descriptions.Item>
        <Descriptions.Item label="Witnesses">{incident.custom_data?.witnesses || '0'}</Descriptions.Item>
        <Descriptions.Item label="Persons Involved" span={2}>{incident.custom_data?.persons_involved || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Immediate Actions" span={2}>{incident.custom_data?.immediate_actions || 'N/A'}</Descriptions.Item>
      </Descriptions>

      {incident.custom_data && Object.keys(incident.custom_data).filter(key => !['reporter_name', 'injured_persons', 'witnesses', 'persons_involved', 'immediate_actions', 'additional_notes', 'evidence_description'].includes(key)).length > 0 && (
        <>
          <Divider orientation="left">Additional Details</Divider>
          <Descriptions bordered column={2} size="small">
            {Object.entries(incident.custom_data)
              .filter(([key]) => !['reporter_name', 'injured_persons', 'witnesses', 'persons_involved', 'immediate_actions', 'additional_notes', 'evidence_description'].includes(key))
              .map(([key, value]) => (
                <Descriptions.Item key={key} label={key.replace(/_/g, ' ').toUpperCase()}>
                  {typeof value === 'object' ? JSON.stringify(value) : value || 'N/A'}
                </Descriptions.Item>
              ))}
          </Descriptions>
        </>
      )}

      <Divider orientation="left">
        <Space>
          <PaperClipOutlined />
          Evidence Files
          {evidenceFiles.length > 0 && <Badge count={evidenceFiles.length} style={{ backgroundColor: '#1890ff' }} />}
        </Space>
      </Divider>

      {evidenceFiles.length > 0 ? (
        <>
          <Row gutter={[12, 12]}>
            {evidenceFiles.map((file, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Card
                  size="small"
                  cover={
                    file.type?.startsWith('image/') ? (
                      <div style={{ height: '150px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', cursor: 'pointer' }} onClick={() => file.url && window.open(file.url, '_blank')}>
                        <img src={file.url} alt={file.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', flexDirection: 'column' }}>
                        {file.type?.startsWith('video/') ? <FileImageOutlined style={{ fontSize: '48px', color: '#722ed1' }} /> :
                         file.type === 'application/pdf' ? <FilePdfOutlined style={{ fontSize: '48px', color: '#f5222d' }} /> :
                         file.name?.endsWith('.doc') || file.name?.endsWith('.docx') ? <FileWordOutlined style={{ fontSize: '48px', color: '#1890ff' }} /> :
                         file.name?.endsWith('.xls') || file.name?.endsWith('.xlsx') ? <FileExcelOutlined style={{ fontSize: '48px', color: '#52c41a' }} /> :
                         <FileUnknownOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
                        <Tag color="blue" style={{ marginTop: '8px' }}>{file.type?.split('/')[0] || 'File'}</Tag>
                      </div>
                    )
                  }
                  actions={[
                    <Tooltip title="View">
                      <EyeOutlined onClick={() => file.url && window.open(file.url, '_blank')} />
                    </Tooltip>,
                    <Tooltip title="Download">
                      <DownloadOutlined onClick={() => file.url && window.open(file.url, '_blank')} />
                    </Tooltip>
                  ]}
                >
                  <Card.Meta
                    title={
                      <Tooltip title={file.name}>
                        <span style={{ fontSize: '12px' }}>
                          {file.name && file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name || `File ${index + 1}`}
                        </span>
                      </Tooltip>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </Text>
                        {file.type && <Tag size="small" style={{ fontSize: '10px' }}>{file.type.split('/')[0]}</Tag>}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          {incident.evidence_description && (
            <div style={{ marginTop: '12px' }}>
              <Text type="secondary"><strong>Evidence Description:</strong> {incident.evidence_description}</Text>
            </div>
          )}
        </>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No evidence files attached to this incident" />
      )}

      {incident.custom_data?.additional_notes && (
        <>
          <Divider orientation="left">Additional Notes</Divider>
          <Paragraph>{incident.custom_data.additional_notes}</Paragraph>
        </>
      )}
    </Modal>
  );
};

// ==================== STATUS UPDATE MODAL ====================

const StatusUpdateModal = ({ visible, incident, onClose, onUpdate, isSuperAdmin, isCompanyAdmin }) => {
  const [form] = Form.useForm();

  if (!incident) return null;

  const getAvailableStatuses = () => {
    const currentStatus = incident.status;
    const flow = STATUS_FLOW[currentStatus];
    
    if (isSuperAdmin || isCompanyAdmin) {
      return Object.entries(STATUS_CONFIG);
    }
    
    if (!flow) return [];
    return flow.allowed.map(status => [status, STATUS_CONFIG[status]]);
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <Modal
      title={<Space><CheckCircleOutlined /> Update Status <Tag color="blue">{incident.incident_number || `#${incident.id}`}</Tag></Space>}
      open={visible}
      onCancel={() => { onClose(); form.resetFields(); }}
      footer={null}
      width={600}
    >
      <Alert
        message="Status Transition Rules"
        description={
          <div>
            <p><strong>Current Status:</strong> {getStatusTag(incident.status)}</p>
            {STATUS_FLOW[incident.status] && (
              <>
                <p><strong>Allowed Transitions:</strong></p>
                <Space wrap>
                  {STATUS_FLOW[incident.status].allowed.map(status => (
                    <Tag key={status} color={STATUS_CONFIG[status]?.color || 'default'}>
                      {STATUS_CONFIG[status]?.icon} {STATUS_CONFIG[status]?.label || status}
                    </Tag>
                  ))}
                </Space>
                <p style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>{STATUS_FLOW[incident.status].description}</p>
              </>
            )}
            {(isSuperAdmin || isCompanyAdmin) && (
              <div style={{ marginTop: '8px' }}>
                <Tag color="blue">🔑 Admin Access</Tag>
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>You can bypass status flow restrictions</span>
              </div>
            )}
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />

      <Form form={form} layout="vertical" onFinish={(values) => onUpdate(incident.id, values.status, values.notes)}>
        <Form.Item name="status" label="New Status" rules={[{ required: true, message: 'Please select a status' }]}>
          <Select placeholder="Select new status">
            {availableStatuses.map(([value, config]) => {
              const isAllowed = isSuperAdmin || isCompanyAdmin || STATUS_FLOW[incident.status]?.allowed?.includes(value);
              return (
                <Option key={value} value={value} disabled={!isAllowed}>
                  <Tag color={config.color}>{config.icon} {config.label}</Tag>
                  {!isAllowed && <span style={{ color: '#999', fontSize: '11px', marginLeft: '8px' }}>(Not allowed from current status)</span>}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item name="notes" label="Status Update Notes">
          <TextArea rows={4} placeholder="Add notes about this status change..." />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">Update Status</Button>
            <Button onClick={() => { onClose(); form.resetFields(); }}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ==================== STATUS DETAILS MODAL ====================

const StatusDetailsModal = ({ visible, status, incidents, onClose, onViewIncident }) => {
  const statusConfig = STATUS_CONFIG[status];
  if (!statusConfig) return null;

  const columns = [
    { title: 'Incident #', dataIndex: 'incident_number', key: 'incident_number', render: (text, record) => <a onClick={() => onViewIncident(record)} style={{ fontWeight: 'bold' }}>{text || `INC-${record.id}`}</a> },
    { title: 'Title', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Severity', dataIndex: 'severity', key: 'severity', render: (severity) => getSeverityTag(severity) },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (text) => text || 'N/A' },
    { title: 'Reported By', dataIndex: 'reported_by_name', key: 'reported_by_name', render: (text) => text || 'Unknown' },
    { title: 'Date', dataIndex: 'date_occurred', key: 'date_occurred', render: (date) => formatDate(date) }
  ];

  return (
    <Modal
      title={<Space><Tag color={statusConfig.color} style={{ fontSize: '16px', padding: '8px 16px' }}>{statusConfig.icon} {statusConfig.label}</Tag><Badge count={incidents.length} style={{ backgroundColor: statusConfig.color }} /></Space>}
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[<Button key="close" onClick={onClose}>Close</Button>, <Button key="export" type="primary" icon={<ExportOutlined />}>Export List</Button>]}
    >
      <Alert message={`${incidents.length} incidents with status "${statusConfig.label}"`} description={statusConfig.description} type={statusConfig.category === 'pending' ? 'warning' : statusConfig.category === 'resolved' ? 'success' : 'info'} showIcon style={{ marginBottom: '16px' }} />
      <Table columns={columns} dataSource={incidents} rowKey="id" pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} incidents` }} />
    </Modal>
  );
};

// ==================== INCIDENT DASHBOARD ====================

const IncidentDashboard = ({ showIncidentModal, filterKey, setFilterKey }) => {
  const { user, isSuperAdmin, isRegularAdmin, isAnyAdmin, isEmployee } = useAuth();
  
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(filterKey || null);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [editingIncident, setEditingIncident] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusDetailsModalVisible, setStatusDetailsModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusIncidents, setStatusIncidents] = useState([]);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [stats, setStats] = useState({
    total: 0, critical: 0, high: 0, medium: 0, low: 0,
    resolved: 0, pending: 0,
    byStatus: {}, byIndustry: {}, byType: {}, byMonth: {}, byDepartment: {}
  });
  const [chartView, setChartView] = useState('severity');

  const isAdmin = isAnyAdmin();
  const isCompanyAdmin = isRegularAdmin();
  const isSuperAdminUser = isSuperAdmin();
  const isEmployeeUser = isEmployee();

  useEffect(() => { fetchIncidents(); }, []);
  useEffect(() => { if (filterKey) { setSelectedFilter(filterKey); applyFilter(filterKey); } }, [filterKey]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getIncidents();
      let incidentsList = response?.incidents || (Array.isArray(response) ? response : []);
      let filteredList = filterIncidentsByRole(incidentsList);
      setIncidents(filteredList);
      setFilteredIncidents(filteredList);
      calculateStats(filteredList);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      message.error('Failed to load incidents');
      setIncidents([]);
      setFilteredIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterIncidentsByRole = (incidentList) => {
    if (!user) return [];
    if (isSuperAdminUser) return incidentList;
    if (isCompanyAdmin) return incidentList.filter(inc => inc.company_id === user.company_id);
    if (isEmployeeUser) return incidentList.filter(inc => inc.reported_by === user.id || inc.company_id === user.company_id);
    return incidentList.filter(inc => inc.reported_by === user.id);
  };

  const calculateStats = (incidentList) => {
    const statsData = {
      total: incidentList.length,
      critical: incidentList.filter(i => i.severity === 'critical').length,
      high: incidentList.filter(i => i.severity === 'high').length,
      medium: incidentList.filter(i => i.severity === 'medium').length,
      low: incidentList.filter(i => i.severity === 'low').length,
      resolved: incidentList.filter(i => ['resolved', 'closed', 'verified'].includes(i.status)).length,
      pending: incidentList.filter(i => !['resolved', 'closed', 'verified'].includes(i.status)).length,
      byStatus: {}, byIndustry: {}, byType: {}, byMonth: {}, byDepartment: {}
    };

    incidentList.forEach(inc => {
      statsData.byStatus[inc.status || 'unknown'] = (statsData.byStatus[inc.status || 'unknown'] || 0) + 1;
      statsData.byIndustry[inc.industryName || inc.industry_id || 'Unknown'] = (statsData.byIndustry[inc.industryName || inc.industry_id || 'Unknown'] || 0) + 1;
      statsData.byType[inc.incident_type || 'Other'] = (statsData.byType[inc.incident_type || 'Other'] || 0) + 1;
      const date = new Date(inc.date_occurred);
      if (!isNaN(date)) { const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`; statsData.byMonth[monthYear] = (statsData.byMonth[monthYear] || 0) + 1; }
      statsData.byDepartment[inc.department || 'Unknown'] = (statsData.byDepartment[inc.department || 'Unknown'] || 0) + 1;
    });
    setStats(statsData);
  };

  const applyFilter = (filterType) => {
    setSelectedFilter(filterType);
    setFilterKey(filterType);
    let filtered = [...incidents];
    switch(filterType) {
      case 'critical': filtered = incidents.filter(i => i.severity === 'critical' || i.severity === 'high'); break;
      case 'pending': filtered = incidents.filter(i => !['resolved', 'closed', 'verified'].includes(i.status)); break;
      case 'resolved': filtered = incidents.filter(i => ['resolved', 'closed', 'verified'].includes(i.status)); break;
      default: filtered = [...incidents];
    }
    setFilteredIncidents(filtered);
  };

  const resetFilter = () => { setSelectedFilter(null); setFilterKey(null); setFilteredIncidents(incidents); };

  const showStatusDetails = (status) => {
    const filtered = incidents.filter(i => i.status === status);
    setSelectedStatus(status);
    setStatusIncidents(filtered);
    setStatusDetailsModalVisible(true);
  };

  const canEditIncident = (incident) => {
    if (!user) return false;
    if (isSuperAdminUser) return true;
    if (isCompanyAdmin) return incident.company_id === user.company_id;
    if (isEmployeeUser) return incident.reported_by === user.id;
    return false;
  };

  const canUpdateStatus = (incident) => {
    if (!user) return false;
    if (isSuperAdminUser || isCompanyAdmin) return true;
    if (isEmployeeUser) return incident.reported_by === user.id && ['draft', 'reported'].includes(incident.status);
    return false;
  };

  const canDeleteIncident = (incident) => {
    if (!user) return false;
    if (isSuperAdminUser) return true;
    if (isCompanyAdmin) return incident.company_id === user.company_id;
    return false;
  };

  const viewIncidentDetails = (incident) => {
    setSelectedIncident(incident);
    setDetailsModalVisible(true);
  };

  const handleEditIncident = (incident) => {
    setEditingIncident(incident);
    // You can add edit modal logic here
    message.info('Edit functionality coming soon');
  };

  const handleDeleteIncident = (incident) => {
    Modal.confirm({
      title: 'Delete Incident',
      content: `Are you sure you want to delete incident ${incident.incident_number || incident.id}?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await notificationService.deleteIncident(incident.id);
          message.success('Incident deleted successfully');
          fetchIncidents();
        } catch (error) {
          message.error('Failed to delete incident');
        }
      }
    });
  };

  const updateIncidentStatus = async (incidentId, newStatus, notes = '') => {
    try {
      const response = await notificationService.updateIncidentStatus(incidentId, { status: newStatus, notes, updatedBy: user?.id, updatedAt: new Date().toISOString() });
      if (response.success) {
        message.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
        fetchIncidents();
        setStatusModalVisible(false);
        setEditingIncident(null);
      } else {
        throw new Error(response.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      message.error('Failed to update incident status');
    }
  };

  const columns = [
    { title: 'Incident #', dataIndex: 'incident_number', key: 'incident_number', render: (text, record) => <a onClick={() => viewIncidentDetails(record)} style={{ fontWeight: 'bold' }}>{text || `INC-${record.id}`}</a>, sorter: (a, b) => (a.incident_number || a.id) - (b.incident_number || b.id) },
    { title: 'Title', dataIndex: 'title', key: 'title', ellipsis: true, sorter: (a, b) => a.title?.localeCompare(b.title) },
    { title: 'Type', dataIndex: 'incident_type', key: 'incident_type', render: (text) => <Tag>{text?.replace(/_/g, ' ')}</Tag> },
    { title: 'Severity', dataIndex: 'severity', key: 'severity', render: (severity) => getSeverityTag(severity), filters: [{ text: 'Critical', value: 'critical' }, { text: 'High', value: 'high' }, { text: 'Medium', value: 'medium' }, { text: 'Low', value: 'low' }], onFilter: (value, record) => record.severity === value },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status, record) => <Space><Tag color={STATUS_CONFIG[status]?.color || 'default'}>{STATUS_CONFIG[status]?.icon || ''} {STATUS_CONFIG[status]?.label || status}</Tag>{canUpdateStatus(record) && <Button type="link" size="small" onClick={() => { setEditingIncident(record); setStatusModalVisible(true); }}>Update</Button>}</Space>, filters: Object.entries(STATUS_CONFIG).map(([value, config]) => ({ text: config.label, value })), onFilter: (value, record) => record.status === value },
    { title: 'Department', dataIndex: 'department', key: 'department', render: (text) => text || 'N/A' },
    { title: 'Reported By', dataIndex: 'reported_by_name', key: 'reported_by_name', render: (text, record) => text || record.reported_by || 'Unknown' },
    { title: 'Date', dataIndex: 'date_occurred', key: 'date_occurred', render: (date) => formatDate(date), sorter: (a, b) => new Date(a.date_occurred) - new Date(b.date_occurred) },
    { title: 'Actions', key: 'actions', render: (_, record) => <Space>
        <Tooltip title="View Details"><Button type="link" icon={<EyeOutlined />} onClick={() => viewIncidentDetails(record)} /></Tooltip>
        {canEditIncident(record) && <Tooltip title="Edit Incident"><Button type="link" icon={<EditOutlined />} onClick={() => handleEditIncident(record)} /></Tooltip>}
        {canUpdateStatus(record) && <Tooltip title="Update Status"><Button type="link" icon={<CheckCircleOutlined />} onClick={() => { setEditingIncident(record); setStatusModalVisible(true); }} /></Tooltip>}
        {canDeleteIncident(record) && <Tooltip title="Delete Incident"><Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteIncident(record)} /></Tooltip>}
      </Space> }
  ];

  // Chart Data
  const severityChartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{ label: 'Incidents by Severity', data: [stats.critical, stats.high, stats.medium, stats.low], backgroundColor: ['#f5222d', '#fa541c', '#faad14', '#52c41a'], borderColor: ['#cf1322', '#d4380d', '#d4b106', '#389e0d'], borderWidth: 1 }]
  };

  const statusChartData = {
    labels: Object.keys(stats.byStatus).map(s => STATUS_CONFIG[s]?.label || s),
    datasets: [{ label: 'Incidents by Status', data: Object.values(stats.byStatus), backgroundColor: Object.keys(stats.byStatus).map(s => STATUS_CONFIG[s]?.color || '#d9d9d9'), borderColor: '#fff', borderWidth: 2 }]
  };

  const industryChartData = {
    labels: Object.keys(stats.byIndustry),
    datasets: [{ label: 'Incidents by Industry', data: Object.values(stats.byIndustry), backgroundColor: ['#1890ff', '#fa8c16', '#52c41a', '#722ed1', '#fa541c', '#13c2c2', '#eb2f96', '#a0d911'], borderColor: '#fff', borderWidth: 2 }]
  };

  const monthlyTrendData = {
    labels: Object.keys(stats.byMonth),
    datasets: [{ label: 'Monthly Incident Trend', data: Object.values(stats.byMonth), borderColor: '#1890ff', backgroundColor: 'rgba(24, 144, 255, 0.1)', fill: true, tension: 0.4 }]
  };

  const departmentChartData = {
    labels: Object.keys(stats.byDepartment),
    datasets: [{ label: 'Incidents by Department', data: Object.values(stats.byDepartment), backgroundColor: '#1890ff', borderColor: '#096dd9', borderWidth: 1 }]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  const displayIncidents = selectedFilter && selectedFilter !== 'all' ? filteredIncidents : incidents;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}><Spin size="large" /><p style={{ marginTop: '16px' }}>Loading incidents...</p></div>;
  }

  if (incidents.length === 0) {
    return <div style={{ textAlign: 'center', padding: '60px' }}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<div><p>No incidents reported yet</p><Button type="primary" onClick={showIncidentModal}>Report Your First Incident</Button></div>} /></div>;
  }

  const resolvedPercent = stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0;
  const criticalHighPercent = stats.total > 0 ? ((stats.critical + stats.high) / stats.total) * 100 : 0;

  return (
    <div>
      

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => applyFilter('all')} style={{ cursor: 'pointer', border: selectedFilter === 'all' ? '3px solid #1890ff' : '1px solid #f0f0f0' }}>
            <Statistic title={<Space><AlertOutlined /> Total Incidents <Badge count={stats.total} style={{ backgroundColor: '#1890ff' }} /></Space>} value={stats.total} valueStyle={{ color: '#1890ff' }} />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>Click to view all</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => applyFilter('critical')} style={{ cursor: 'pointer', border: selectedFilter === 'critical' ? '3px solid #f5222d' : '1px solid #f0f0f0' }}>
            <Statistic title={<Space><span style={{ color: '#f5222d' }}>🚨</span> Critical/High <Badge count={stats.critical + stats.high} style={{ backgroundColor: '#f5222d' }} /></Space>} value={stats.critical + stats.high} suffix={`/ ${stats.total}`} valueStyle={{ color: '#f5222d' }} />
            <Progress percent={criticalHighPercent} strokeColor="#f5222d" size="small" showInfo={false} />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>Click to view critical & high incidents</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => applyFilter('resolved')} style={{ cursor: 'pointer', border: selectedFilter === 'resolved' ? '3px solid #52c41a' : '1px solid #f0f0f0' }}>
            <Statistic title={<Space><CheckCircleOutlined /> Resolved <Badge count={stats.resolved} style={{ backgroundColor: '#52c41a' }} /></Space>} value={stats.resolved} suffix={`/ ${stats.total}`} valueStyle={{ color: '#52c41a' }} />
            <Progress percent={resolvedPercent} strokeColor="#52c41a" size="small" showInfo={false} />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>Click to view resolved incidents</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => applyFilter('pending')} style={{ cursor: 'pointer', border: selectedFilter === 'pending' ? '3px solid #faad14' : '1px solid #f0f0f0' }}>
            <Statistic title={<Space><ClockCircleOutlined /> Pending Review <Badge count={stats.pending} style={{ backgroundColor: '#faad14' }} /></Space>} value={stats.pending} suffix={`/ ${stats.total}`} valueStyle={{ color: '#faad14' }} />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>Click to view pending incidents</div>
          </Card>
        </Col>
      </Row>

      {selectedFilter && selectedFilter !== 'all' && <Alert message={<Space><FilterOutlined /> Showing {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Incidents <Tag color="blue">{filteredIncidents.length} found</Tag></Space>} type="info" closable onClose={resetFilter} style={{ marginBottom: '24px' }} />}

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title={<Space><PieChartOutlined /> Severity Distribution <Tooltip title="Click on chart segments to filter"><InfoCircleOutlined style={{ color: '#1890ff' }} /></Tooltip></Space>} extra={<Space><Button type={chartView === 'severity' ? 'primary' : 'default'} size="small" onClick={() => setChartView('severity')}>Pie</Button><Button type={chartView === 'severityBar' ? 'primary' : 'default'} size="small" onClick={() => setChartView('severityBar')}>Bar</Button><Tooltip title="Refresh data"><Button icon={<ReloadOutlined />} size="small" onClick={fetchIncidents} /></Tooltip></Space>}>
            <div style={{ height: 250 }}>{chartView === 'severity' ? <Doughnut data={severityChartData} options={chartOptions} /> : <Bar data={severityChartData} options={chartOptions} />}</div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<Space><BarChartOutlined /> Status Overview <Tooltip title="Click on chart bars to view status details"><InfoCircleOutlined style={{ color: '#1890ff' }} /></Tooltip></Space>}>
            <div style={{ height: 250, cursor: 'pointer' }} onClick={() => { const keys = Object.keys(stats.byStatus); if (keys.length > 0) showStatusDetails(keys[0]); }}>
              <Bar data={statusChartData} options={chartOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title={<Space><PieChartOutlined /> Incidents by Industry <Tooltip title="Click on chart segments to filter by industry"><InfoCircleOutlined style={{ color: '#1890ff' }} /></Tooltip></Space>}>
            <div style={{ height: 250 }}><Pie data={industryChartData} options={chartOptions} /></div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<Space><LineChartOutlined /> Monthly Trend</Space>}>
            <div style={{ height: 250 }}><Line data={monthlyTrendData} options={chartOptions} /></div>
          </Card>
        </Col>
      </Row>

      {(isSuperAdminUser || isCompanyAdmin) && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card title={<Space><ApartmentOutlined /> Incidents by Department</Space>}>
              <div style={{ height: 250 }}><Bar data={departmentChartData} options={chartOptions} /></div>
            </Card>
          </Col>
        </Row>
      )}

      <Card title={<Space><ReconciliationOutlined /> Status Breakdown <Tooltip title="Click on any status card to view details"><InfoCircleOutlined style={{ color: '#1890ff' }} /></Tooltip></Space>} style={{ marginBottom: '24px' }}>
        <Row gutter={[12, 12]}>
          {Object.entries(stats.byStatus).map(([status, count]) => {
            const config = STATUS_CONFIG[status];
            if (!config) return null;
            return <Col xs={12} sm={8} md={6} lg={4} key={status}>
              <Card hoverable size="small" onClick={() => showStatusDetails(status)} style={{ textAlign: 'center', cursor: 'pointer', borderLeft: `4px solid ${config.color}`, height: '100%' }}>
                <div style={{ fontSize: '24px' }}>{config.icon}</div>
                <Text strong>{config.label}</Text><br />
                <Badge count={count} style={{ backgroundColor: config.color, marginTop: '4px' }} />
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>{config.description}</div>
              </Card>
            </Col>;
          })}
        </Row>
      </Card>

      <Card title={<Space><FileTextOutlined /> {selectedFilter && selectedFilter !== 'all' ? `${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Incidents` : 'All Incidents'} <Tag color="blue">{displayIncidents.length} records</Tag></Space>} extra={<Space>{selectedFilter && selectedFilter !== 'all' && <Button onClick={resetFilter} size="small">Clear Filter</Button>}<Button type="primary" onClick={showIncidentModal} icon={<AlertOutlined />} size="small">Report New Incident</Button></Space>}>
        <Table columns={columns} dataSource={displayIncidents} rowKey="id" pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} incidents`, showSizeChanger: true, showQuickJumper: true }} scroll={{ x: 1200 }} rowClassName={(record) => { if (record.severity === 'critical') return 'critical-row'; if (record.severity === 'high') return 'high-row'; return ''; }} />
      </Card>

      <StatusUpdateModal visible={statusModalVisible} incident={editingIncident} onClose={() => { setStatusModalVisible(false); setEditingIncident(null); }} onUpdate={updateIncidentStatus} isSuperAdmin={isSuperAdminUser} isCompanyAdmin={isCompanyAdmin} />
      <StatusDetailsModal visible={statusDetailsModalVisible} status={selectedStatus} incidents={statusIncidents} onClose={() => { setStatusDetailsModalVisible(false); setSelectedStatus(null); setStatusIncidents([]); }} onViewIncident={viewIncidentDetails} />
      <IncidentDetailsModal visible={detailsModalVisible} incident={selectedIncident} onClose={() => { setDetailsModalVisible(false); setSelectedIncident(null); }} onEdit={handleEditIncident} onStatusUpdate={(incident) => { setEditingIncident(incident); setStatusModalVisible(true); }} canEdit={selectedIncident ? canEditIncident(selectedIncident) : false} canUpdateStatus={selectedIncident ? canUpdateStatus(selectedIncident) : false} />

      <style jsx>{`
        .critical-row { background-color: #fff1f0 !important; }
        .high-row { background-color: #fff7e6 !important; }
        .critical-row:hover { background-color: #ffccc7 !important; }
        .high-row:hover { background-color: #ffe7ba !important; }
      `}</style>
    </div>
  );
};

// ==================== MAIN REPORTS PAGE ====================

function ReportsPage() {
  const { user, isAnyAdmin, isEmployee } = useAuth();
  
  const [incidentModalVisible, setIncidentModalVisible] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filterKey, setFilterKey] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const { pushNotification } = useContext(NotificationContext);
  const { notifyIncidentReportSuccess, notifyIncidentReportError } = useIncidentNotifications();

  const isAdmin = isAnyAdmin();
  const isEmployeeUser = isEmployee();

  const showIncidentModal = () => {
    setIncidentModalVisible(true);
    setSelectedIndustry(null);
    setCurrentStep(0);
    form.resetFields();
    setFileList([]);
  };

  const handleIndustrySelect = (industry) => {
    setSelectedIndustry(industry);
    setCurrentStep(1);
    form.setFieldsValue({ industry: industry.id });
  };

  const handleBackToIndustry = () => {
    setSelectedIndustry(null);
    setCurrentStep(0);
  };

  const handleIncidentSubmit = async (values) => {
    setLoading(true);
    try {
      let initialStatus = 'draft';
      if (isEmployeeUser || isAdmin) initialStatus = 'reported';

      const incidentData = {
        title: `${selectedIndustry.name} - ${values.incidentType}`,
        description: values.description,
        incident_type: values.incidentType,
        severity: values.severity,
        date_occurred: combineDateTime(values.date, values.time),
        location: values.location,
        department: values.department,
        industry_id: selectedIndustry.id,
        industryName: selectedIndustry.name,
        company_id: user?.company_id,
        reported_by: user?.id,
        reported_by_name: user?.name || user?.email || values.reporter_name,
        status: initialStatus,
        evidence_description: values.evidence_description || '',
        evidence_files: fileList.map(file => ({ name: file.name, size: file.size, type: file.type, url: file.url })),
        custom_data: { reporter_name: values.reporter_name, injured_persons: values.injured_persons, witnesses: values.witnesses, persons_involved: values.persons_involved, immediate_actions: values.immediate_actions, additional_notes: values.additional_notes, evidence_description: values.evidence_description, ...values }
      };

      const result = await notificationService.reportIncident(incidentData);
      
      if (result.success) {
        notifyIncidentReportSuccess(selectedIndustry.name);
        pushNotification({ id: `incident-${Date.now()}`, title: '✅ Incident Reported Successfully', message: `Your ${selectedIndustry.name} incident report has been submitted.`, type: 'success', read: false, date: new Date().toISOString(), data: incidentData });
        message.success(`Incident reported successfully! ${isEmployeeUser || isAdmin ? 'Manager has been notified.' : 'You can track it in your dashboard.'}`);
        setIncidentModalVisible(false);
        form.resetFields();
        setSelectedIndustry(null);
        setCurrentStep(0);
        setFileList([]);
        window.location.reload();
      } else {
        throw new Error(result.error || 'Failed to submit incident report');
      }
    } catch (error) {
      notifyIncidentReportError(error.message);
      pushNotification({ id: `error-${Date.now()}`, title: '❌ Incident Report Failed', message: 'There was an error submitting your incident report. Please try again.', type: 'error', read: false, date: new Date().toISOString() });
      message.error(error.message || 'Failed to submit incident report. Please try again.');
      console.error('Incident submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderIndustrySelection = () => (
    <div>
      <h3>Select Industry</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>Choose the industry where the incident occurred to access industry-specific reporting forms.</p>
      <Row gutter={[16, 16]}>
        {industries.map(industry => <Col xs={12} sm={8} md={6} key={industry.id}>
          <Card hoverable onClick={() => handleIndustrySelect(industry)} style={{ textAlign: 'center', border: `2px solid ${industry.color}20`, height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '28px', color: industry.color, marginBottom: '8px' }}>{industry.icon}</div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{industry.name}</div>
          </Card>
        </Col>)}
      </Row>
    </div>
  );

  const renderIncidentForm = () => {
    const config = industryConfigs[selectedIndustry.id];
    return (
      <Form form={form} layout="vertical" onFinish={handleIncidentSubmit} initialValues={{ severity: 'medium', date: null, time: null }}>
        <div style={{ marginBottom: '16px' }}><Button type="link" onClick={handleBackToIndustry} icon={<FileDoneOutlined />}>Change Industry</Button></div>
        <h3>{selectedIndustry.icon} Report {selectedIndustry.name} Incident</h3>
        <Divider />
        <Row gutter={16}>
          <Col span={12}><Form.Item name="incidentType" label="Incident Type" rules={[{ required: true, message: 'Please select incident type' }]}><Select placeholder="Select incident type">{config.incidentTypes.map(type => <Option key={type.value} value={type.value}>{type.label} {type.severity === 'critical' ? '🚨' : type.severity === 'high' ? '⚠️' : ''}</Option>)}</Select></Form.Item></Col>
          <Col span={12}><Form.Item name="severity" label="Severity Level" rules={[{ required: true, message: 'Please select severity' }]}><Select placeholder="Select severity"><Option value="low"><span style={{ color: '#52c41a' }}>Low</span></Option><Option value="medium"><span style={{ color: '#faad14' }}>Medium</span></Option><Option value="high"><span style={{ color: '#fa541c' }}>High</span></Option><Option value="critical"><span style={{ color: '#f5222d' }}>Critical 🚨</span></Option></Select></Form.Item></Col>
        </Row>
        <Form.Item name="description" label="Incident Description" rules={[{ required: true, message: 'Please describe the incident' }]}><TextArea rows={4} placeholder="Provide detailed description of what happened..." /></Form.Item>
        <Row gutter={16}>
          <Col span={8}><Form.Item name="date" label="Date of Incident" rules={[{ required: true, message: 'Please select date' }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={8}><Form.Item name="time" label="Time of Incident" rules={[{ required: true, message: 'Please select time' }]}><TimePicker style={{ width: '100%' }} format="HH:mm" /></Form.Item></Col>
          <Col span={8}><Form.Item name="location" label="Exact Location" rules={[{ required: true, message: 'Please specify location' }]}><Input prefix={<EnvironmentOutlined />} placeholder="Building, floor, room, area..." /></Form.Item></Col>
        </Row>
        <Divider orientation="left">Department Details</Divider>
        <Row gutter={16}>
          <Col span={12}><Form.Item name="department" label="Department" rules={[{ required: true, message: 'Please select department' }]}><Select placeholder="Select department">{config.departments.map(dept => <Option key={dept} value={dept}>{dept}</Option>)}</Select></Form.Item></Col>
          <Col span={12}><Form.Item name="incident_category" label="Incident Category"><Select placeholder="Select category"><Option value="accident">Accident</Option><Option value="incident">Incident</Option><Option value="near_miss">Near Miss</Option><Option value="occupational_illness">Occupational Illness</Option><Option value="safety_hazard">Safety Hazard</Option><Option value="health_hazard">Health Hazard</Option><Option value="environmental">Environmental</Option></Select></Form.Item></Col>
        </Row>
        <Divider orientation="left">Industry-Specific Details</Divider>
        {config.customFields(form)}
        <Divider orientation="left">People Information</Divider>
        <Row gutter={16}>
          <Col span={8}><Form.Item name="reporter_name" label="Your Name"><Input prefix={<UserOutlined />} /></Form.Item></Col>
          <Col span={8}><Form.Item name="injured_persons" label="Injured Persons"><InputNumber min={0} max={100} placeholder="Number" style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={8}><Form.Item name="witnesses" label="Witnesses Present"><InputNumber min={0} max={100} placeholder="Number" style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        <Form.Item name="persons_involved" label="Names of Persons Involved"><TextArea rows={2} placeholder="List names and roles of all persons involved..." /></Form.Item>
        <Form.Item name="immediate_actions" label="Immediate Actions Taken" rules={[{ required: true, message: 'Please describe immediate actions taken' }]}><TextArea rows={3} placeholder="First aid, area secured, emergency services, shutdown..." /></Form.Item>
        <Divider orientation="left">Evidence & Documentation</Divider>
        <MediaUploadSection fileList={fileList} setFileList={setFileList} uploading={uploading} setUploading={setUploading} maxFiles={10} maxSizeMB={50} />
        <Form.Item name="evidence_description" label="Evidence Description" extra="Provide context for the uploaded evidence"><TextArea rows={2} placeholder="Describe the evidence you've uploaded..." /></Form.Item>
        <Form.Item name="additional_notes" label="Additional Notes"><TextArea rows={2} placeholder="Any other relevant information..." /></Form.Item>
        <Alert message={isEmployeeUser || isAdmin ? "📋 Manager Notification" : "📝 Draft Mode"} description={isEmployeeUser || isAdmin ? "Your manager will be automatically notified via email and will review this incident promptly." : "Your incident report will be saved as a draft. You can submit it for review once complete."} type={isEmployeeUser || isAdmin ? "info" : "warning"} showIcon style={{ marginBottom: '16px' }} />
        <Form.Item><Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ height: '50px', fontSize: '16px' }}>{loading ? 'Submitting Incident Report...' : (isEmployeeUser || isAdmin ? 'Submit Incident Report & Notify Manager' : 'Save as Draft')}</Button></Form.Item>
        {(isEmployeeUser || isAdmin) && <Alert message="Email Notification" description="A notification email will be sent to your manager/department head for review." type="info" showIcon />}
      </Form>
    );
  };

  const renderIncidentModalContent = () => {
    if (currentStep === 0) return renderIndustrySelection();
    return renderIncidentForm();
  };

  return (
    <div style={{ padding: '24px' }}>
      <Tabs defaultActiveKey="incidents">
        <TabPane tab={<span><FileTextOutlined /> Safety Reports</span>} key="reports">
          <Row gutter={[24, 24]}><Col span={24}><Card><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><h2 style={{ margin: 0 }}>Safety Reports & Incident Management</h2><Button type="primary" danger icon={<AlertOutlined />} onClick={showIncidentModal} size="large">Report Safety Incident</Button></div><Alert message="Multi-Industry Incident Reporting" description="Report safety incidents across all industries. Industry-specific forms ensure accurate data collection for proper investigation and compliance." type="info" showIcon style={{ marginBottom: '24px' }} /></Card></Col></Row>
          <ExportPanel />
          <CustomReportBuilder />
        </TabPane>
        <TabPane tab={<span><AlertOutlined /> Incident Dashboard</span>} key="incidents">
          <IncidentDashboard showIncidentModal={showIncidentModal} filterKey={filterKey} setFilterKey={setFilterKey} />
        </TabPane>
      </Tabs>
      <Modal title={<span><AlertOutlined /> Report Safety Incident {selectedIndustry && <Tag color={selectedIndustry.color} style={{ marginLeft: '8px' }}>{selectedIndustry.name}</Tag>}</span>} open={incidentModalVisible} onCancel={() => { setIncidentModalVisible(false); setSelectedIndustry(null); setCurrentStep(0); form.resetFields(); setFileList([]); }} footer={null} width={800} style={{ top: 20 }} destroyOnClose>
        {renderIncidentModalContent()}
      </Modal>
    </div>
  );
}

export default ReportsPage;