// src/pages/Modules/DoctorDashboard.js - COMPLETE FIX FOR MODAL CLOSING

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Divider,
  Popconfirm,
  Tooltip,
  Avatar,
  Badge,
  Alert,
  Timeline,
  Descriptions,
  Drawer,
  Typography,
  Tabs,
  Progress,
  List,
  Collapse,
  Switch,
  Radio,
  Checkbox,
  Transfer,
  Slider,
  TreeSelect,
  Spin,
  InputNumber,
  DatePicker
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FireOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  SettingOutlined,
  NotificationOutlined,
  AlertOutlined,
  FileTextOutlined,
  SaveOutlined,
  ReloadOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  LoginOutlined,
  LogoutOutlined,
  DashboardOutlined,
  HistoryOutlined,
  HeartOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  BugOutlined,
  SolutionOutlined,
  BookOutlined,
  ReadOutlined,
  FormOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  CheckSquareOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  VideoCameraOutlined,
  GiftOutlined,
  ClusterOutlined,
  CommentOutlined,
  DollarOutlined,
  WalletOutlined,
  InboxOutlined,
  LockOutlined,
  KeyOutlined,
  UserSwitchOutlined,
  SafetyOutlined,
  IdcardOutlined,
  SecurityScanOutlined,
  CrownOutlined,
  TrophyOutlined,
  GoldOutlined,
  RocketOutlined,
  ApartmentOutlined,
  IdcardOutlined as EmployeeIdOutlined,
  CloseOutlined
} from '@ant-design/icons';
import moment from 'moment';
import './DoctorDashboard.css';
import hospitalService from '../../services/hospitalService';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

// ============================================
// DISEASE/DIAGNOSIS DATABASE
// ============================================
const DISEASE_DATABASE = {
  'Hypertension': { category: 'Cardiovascular', icd10: 'I10', severity: 'Chronic' },
  'Coronary Artery Disease': { category: 'Cardiovascular', icd10: 'I25.1', severity: 'Critical' },
  'Heart Failure': { category: 'Cardiovascular', icd10: 'I50.9', severity: 'Critical' },
  'Myocardial Infarction': { category: 'Cardiovascular', icd10: 'I21.9', severity: 'Critical' },
  'Stroke': { category: 'Neurological', icd10: 'I63.9', severity: 'Critical' },
  'Epilepsy': { category: 'Neurological', icd10: 'G40.9', severity: 'Chronic' },
  'Alzheimers Disease': { category: 'Neurological', icd10: 'G30.9', severity: 'Chronic' },
  'Pneumonia': { category: 'Respiratory', icd10: 'J18.9', severity: 'Acute' },
  'COPD': { category: 'Respiratory', icd10: 'J44.9', severity: 'Chronic' },
  'Asthma': { category: 'Respiratory', icd10: 'J45.9', severity: 'Chronic' },
  'COVID-19': { category: 'Infectious', icd10: 'U07.1', severity: 'Acute' },
  'Tuberculosis': { category: 'Infectious', icd10: 'A16.9', severity: 'Chronic' },
  'HIV/AIDS': { category: 'Infectious', icd10: 'B20', severity: 'Chronic' },
  'Diabetes Mellitus Type 2': { category: 'Metabolic', icd10: 'E11.9', severity: 'Chronic' },
  'Hyperlipidemia': { category: 'Metabolic', icd10: 'E78.5', severity: 'Chronic' },
  'Obesity': { category: 'Metabolic', icd10: 'E66.9', severity: 'Chronic' },
  'Osteoarthritis': { category: 'Musculoskeletal', icd10: 'M19.90', severity: 'Chronic' },
  'Fracture': { category: 'Musculoskeletal', icd10: 'S22.9', severity: 'Acute' },
  'Back Pain': { category: 'Musculoskeletal', icd10: 'M54.9', severity: 'Chronic' },
  'Depression': { category: 'Mental Health', icd10: 'F32.9', severity: 'Chronic' },
  'Anxiety Disorder': { category: 'Mental Health', icd10: 'F41.9', severity: 'Chronic' },
  'Breast Cancer': { category: 'Oncology', icd10: 'C50.9', severity: 'Critical' },
  'Lung Cancer': { category: 'Oncology', icd10: 'C34.9', severity: 'Critical' },
  'Kidney Failure': { category: 'Renal', icd10: 'N18.9', severity: 'Critical' },
  'Kidney Stones': { category: 'Renal', icd10: 'N20.9', severity: 'Acute' }
};

// ============================================
// STATUS CONFIGURATION
// ============================================
const STATUS_CONFIG = {
  'Admitted': { color: 'blue', icon: <LoginOutlined />, severity: 'low', requiresReason: false },
  'Under Observation': { color: 'orange', icon: <ClockCircleOutlined />, severity: 'medium', requiresReason: true },
  'Critical': { color: 'red', icon: <FireOutlined />, severity: 'high', requiresReason: true },
  'Stable': { color: 'green', icon: <CheckCircleOutlined />, severity: 'low', requiresReason: false },
  'Improving': { color: 'lime', icon: <ArrowRightOutlined />, severity: 'low', requiresReason: false },
  'Deteriorating': { color: 'magenta', icon: <WarningOutlined />, severity: 'high', requiresReason: true },
  'Ready for Discharge': { color: 'cyan', icon: <LogoutOutlined />, severity: 'low', requiresReason: false },
  'Discharged': { color: 'green', icon: <LogoutOutlined />, severity: 'low', requiresReason: true },
  'Transferred': { color: 'purple', icon: <ArrowRightOutlined />, severity: 'low', requiresReason: true }
};

// ============================================
// DOCTOR AUTHENTICATION MODAL - COMPLETE FIX
// ============================================
const DoctorAuthModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [doctorData, setDoctorData] = useState(null);

  // Reset all state when modal closes
  const resetModalState = useCallback(() => {
    form.resetFields();
    setStep(1);
    setDoctorData(null);
    setLoading(false);
  }, [form]);

  // Handle cancel - closes the modal
  const handleCancel = useCallback(() => {
    if (loading) {
      message.warning('Please wait for the current operation to complete');
      return;
    }
    resetModalState();
    if (onCancel) {
      onCancel();
    }
  }, [loading, onCancel, resetModalState]);

  // Handle success - closes modal after successful auth
  const handleSuccess = useCallback((doctor) => {
    resetModalState();
    if (onSuccess) {
      onSuccess(doctor);
    }
  }, [onSuccess, resetModalState]);

  // Handle verify doctor
  const handleVerifyDoctor = async (values) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await hospitalService.verifyDoctor({
        employee_id: values.employee_id,
        name: values.name
      });

      if (response && response.success) {
        const doctor = response.data;
        setDoctorData(doctor);
        
        if (doctor.has_password) {
          setStep(2);
          form.setFieldsValue({ employee_id: doctor.employee_id, name: doctor.name });
          message.success(`Welcome back, Dr. ${doctor.name}! Please enter your password.`);
        } else {
          setStep(2);
          form.setFieldsValue({ employee_id: doctor.employee_id, name: doctor.name });
          message.info(`Welcome, Dr. ${doctor.name}! Please set up your password.`);
        }
      } else {
        message.error('Doctor not found. Please check your Employee ID and Name.');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      message.error(error.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (values) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await hospitalService.doctorLogin({
        employee_id: values.employee_id,
        password: values.password
      });

      if (response && response.success) {
        const doctor = response.data;
        
        sessionStorage.setItem('doctor_authenticated', 'true');
        sessionStorage.setItem('doctor_id', doctor.id);
        sessionStorage.setItem('doctor_name', doctor.name);
        sessionStorage.setItem('doctor_email', doctor.email);
        sessionStorage.setItem('doctor_employee_id', doctor.employee_id);
        sessionStorage.setItem('doctor_department', doctor.department);
        sessionStorage.setItem('doctor_specialty', doctor.specialty || '');
        sessionStorage.setItem('doctor_token', doctor.token);
        
        message.success(`Welcome back, Dr. ${doctor.name}!`);
        handleSuccess(doctor);
      } else {
        message.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response?.data?.code === 'PASSWORD_NOT_SET') {
        setStep(2);
        message.info('Please set up your password first.');
      } else {
        message.error(error.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle setup password
  const handleSetupPassword = async (values) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await hospitalService.setupDoctorPassword({
        employee_id: values.employee_id,
        name: values.name,
        password: values.password
      });

      if (response && response.success) {
        const doctor = response.data;
        
        sessionStorage.setItem('doctor_authenticated', 'true');
        sessionStorage.setItem('doctor_id', doctor.id);
        sessionStorage.setItem('doctor_name', doctor.name);
        sessionStorage.setItem('doctor_email', doctor.email);
        sessionStorage.setItem('doctor_employee_id', doctor.employee_id);
        sessionStorage.setItem('doctor_department', doctor.department);
        sessionStorage.setItem('doctor_specialty', doctor.specialty || '');
        sessionStorage.setItem('doctor_token', doctor.token);
        
        message.success(`Welcome, Dr. ${doctor.name}! Password setup successful.`);
        handleSuccess(doctor);
      } else {
        message.error('Password setup failed. Please try again.');
      }
    } catch (error) {
      console.error('Password setup failed:', error);
      message.error(error.response?.data?.error || 'Password setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (values) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await hospitalService.resetDoctorPassword({
        employee_id: values.employee_id
      });

      if (response && response.success) {
        message.success('Password reset link sent to your email.');
        setStep(1);
        form.resetFields();
      } else {
        message.error('Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      message.error(error.response?.data?.error || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Go back to step 1
  const handleGoBack = () => {
    if (loading) return;
    setStep(1);
    setDoctorData(null);
    form.resetFields();
  };

  // Reset state when modal visibility changes to false
  useEffect(() => {
    if (!visible) {
      resetModalState();
    }
  }, [visible, resetModalState]);

  // Handle modal cancel (X button, ESC, outside click)
  const handleModalCancel = useCallback(() => {
    if (loading) {
      message.warning('Please wait for the current operation to complete');
      return;
    }
    handleCancel();
  }, [loading, handleCancel]);

  return (
    <Modal
      title={
        <Space>
          <LockOutlined style={{ color: '#1890ff' }} />
          {step === 1 ? 'Doctor Authentication' : step === 2 ? (doctorData?.has_password ? 'Doctor Login' : 'Setup Password') : 'Reset Password'}
        </Space>
      }
      open={visible}
      onCancel={handleModalCancel}
      footer={null}
      width={500}
      className="custom-modal"
      destroyOnClose
      maskClosable={!loading}
      closable={!loading}
      closeIcon={!loading ? <CloseOutlined /> : null}
      centered
    >
      {step === 1 && (
        <Form form={form} layout="vertical" onFinish={handleVerifyDoctor}>
          <Alert
            message="Verify Your Identity"
            description="Enter your Employee ID and Name to verify your account."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item 
            name="employee_id" 
            label="Employee ID" 
            rules={[{ required: true, message: 'Please enter your Employee ID' }]}
          >
            <Input 
              prefix={<EmployeeIdOutlined />} 
              placeholder="EMP-001" 
              disabled={loading}
              onPressEnter={() => form.submit()}
            />
          </Form.Item>

          <Form.Item 
            name="name" 
            label="Full Name" 
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Dr. John Smith" 
              disabled={loading}
              onPressEnter={() => form.submit()}
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <Button 
              type="link" 
              onClick={() => { setStep(3); form.resetFields(); }} 
              disabled={loading}
            >
              Forgot Password?
            </Button>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              icon={<SearchOutlined />}
            >
              Verify Identity
            </Button>
          </Form.Item>
        </Form>
      )}

      {step === 2 && (
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={doctorData?.has_password ? handleLogin : handleSetupPassword}
        >
          <Card size="small" style={{ marginBottom: 16, background: '#f0f2f5' }}>
            <Row gutter={16}>
              <Col span={24}>
                <Space>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{doctorData?.name}</div>
                    <Text type="secondary">Employee ID: {doctorData?.employee_id}</Text>
                    <br />
                    <Text type="secondary">{doctorData?.department} {doctorData?.specialty && `- ${doctorData.specialty}`}</Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          <Alert
            message={doctorData?.has_password ? "Enter Your Password" : "Setup Your Password"}
            description={doctorData?.has_password ? "Enter your password to login." : "Create a strong password for your account."}
            type={doctorData?.has_password ? "info" : "warning"}
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item 
            name="employee_id" 
            label="Employee ID"
            initialValue={doctorData?.employee_id}
          >
            <Input prefix={<EmployeeIdOutlined />} disabled />
          </Form.Item>

          <Form.Item 
            name="name" 
            label="Name"
            initialValue={doctorData?.name}
          >
            <Input prefix={<UserOutlined />} disabled />
          </Form.Item>

          <Form.Item 
            name="password" 
            label={doctorData?.has_password ? "Password" : "New Password"} 
            rules={[
              { required: true, message: 'Please enter your password' },
              ...(doctorData?.has_password ? [] : [{ min: 8, message: 'Password must be at least 8 characters' }])
            ]}
          >
            <Input.Password 
              prefix={<KeyOutlined />} 
              placeholder={doctorData?.has_password ? "Enter your password" : "Create a password (min 8 characters)"} 
              disabled={loading}
              onPressEnter={() => form.submit()}
            />
          </Form.Item>

          {!doctorData?.has_password && (
            <Form.Item 
              name="confirmPassword" 
              label="Confirm Password" 
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<KeyOutlined />} 
                placeholder="Confirm your password" 
                disabled={loading}
                onPressEnter={() => form.submit()}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                icon={doctorData?.has_password ? <LoginOutlined /> : <SaveOutlined />}
              >
                {doctorData?.has_password ? 'Login' : 'Setup Password'}
              </Button>
              <Button onClick={handleGoBack} disabled={loading}>
                Back
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}

      {step === 3 && (
        <Form form={form} layout="vertical" onFinish={handleForgotPassword}>
          <Alert
            message="Reset Password"
            description="Enter your Employee ID to receive a password reset link."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item 
            name="employee_id" 
            label="Employee ID" 
            rules={[{ required: true, message: 'Please enter your Employee ID' }]}
          >
            <Input 
              prefix={<EmployeeIdOutlined />} 
              placeholder="EMP-001" 
              disabled={loading}
              onPressEnter={() => form.submit()}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                icon={<MailOutlined />}
              >
                Send Reset Link
              </Button>
              <Button 
                onClick={() => { setStep(1); form.resetFields(); }} 
                disabled={loading}
              >
                Back to Verify
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

// ============================================
// PATIENT STATUS MODAL - DOCTOR VIEW
// ============================================
const DoctorPatientStatusModal = ({ visible, patient, onCancel, onSuccess, doctorInfo }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleCancel = useCallback(() => {
    if (loading) return;
    form.resetFields();
    if (onCancel) onCancel();
  }, [loading, onCancel, form]);

  const handleStatusChange = async (values) => {
    if (loading) return;
    setLoading(true);
    try {
      const selectedStatus = STATUS_CONFIG[values.status];
      if (selectedStatus?.requiresReason && !values.reason) {
        message.warning('Please provide a reason for this status change');
        setLoading(false);
        return;
      }

      const hospitalId = patient.hospital_id || sessionStorage.getItem('hospitalId');
      
      await hospitalService.updatePatientStatus(patient.id, {
        status: values.status,
        reason: values.reason,
        notes: values.notes,
        diagnosis: values.diagnosis,
        hospital_id: hospitalId,
        doctor_id: doctorInfo?.id,
        doctor_name: doctorInfo?.name
      });

      message.success(`Patient status updated to ${values.status}`);
      form.resetFields();
      if (onSuccess) onSuccess();
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Status update failed:', error);
      message.error(error.response?.data?.error || 'Failed to update patient status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  if (!patient) return null;

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined style={{ color: '#1890ff' }} />
          Update Patient Status
          <Tag color={STATUS_CONFIG[patient.status]?.color || 'default'}>
            Current: {patient.status}
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="custom-modal"
      destroyOnClose
      maskClosable={!loading}
      closable={!loading}
      centered
    >
      <Card size="small" style={{ marginBottom: 16, background: '#f0f2f5' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Text type="secondary">Patient</Text>
            <div style={{ fontWeight: 'bold' }}>{patient.firstName} {patient.lastName}</div>
          </Col>
          <Col span={8}>
            <Text type="secondary">MRN</Text>
            <div style={{ fontWeight: 'bold' }}>{patient.mrn}</div>
          </Col>
          <Col span={8}>
            <Text type="secondary">Department</Text>
            <div style={{ fontWeight: 'bold' }}>{patient.department}</div>
          </Col>
        </Row>
      </Card>

      <Form form={form} layout="vertical" onFinish={handleStatusChange}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="status" 
              label="New Status" 
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select placeholder="Select new status" disabled={loading}>
                {Object.keys(STATUS_CONFIG).map(status => {
                  const config = STATUS_CONFIG[status];
                  return (
                    <Option key={status} value={status}>
                      <Space>
                        {config.icon}
                        <Tag color={config.color}>{status}</Tag>
                        {config.severity === 'high' && <Tag color="red">URGENT</Tag>}
                      </Space>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="diagnosis" label="Primary Diagnosis">
              <Select
                placeholder="Select or enter diagnosis"
                showSearch
                allowClear
                disabled={loading}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {Object.keys(DISEASE_DATABASE).map(disease => (
                  <Option key={disease} value={disease}>{disease}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status}
        >
          {({ getFieldValue }) => {
            const selectedStatus = getFieldValue('status');
            const statusConfig = STATUS_CONFIG[selectedStatus];
            
            if (statusConfig?.requiresReason) {
              return (
                <Form.Item 
                  name="reason" 
                  label="Reason for Status Change" 
                  rules={[{ required: true, message: 'Please provide a reason' }]}
                >
                  <TextArea rows={2} placeholder="Provide detailed reason..." disabled={loading} />
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>

        <Form.Item name="notes" label="Clinical Notes">
          <TextArea rows={3} placeholder="Add clinical notes and observations..." disabled={loading} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Update Status
            </Button>
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ============================================
// MAIN DOCTOR DASHBOARD COMPONENT
// ============================================
const DoctorDashboard = ({ onDataUpdate }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [authAttempted, setAuthAttempted] = useState(false);
  const isMountedRef = useRef(true);

  // Check authentication on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    const checkAuth = () => {
      const isAuth = sessionStorage.getItem('doctor_authenticated') === 'true';
      const docId = sessionStorage.getItem('doctor_id');
      const docName = sessionStorage.getItem('doctor_name');

      if (isAuth && docId) {
        const docEmail = sessionStorage.getItem('doctor_email');
        const docEmployeeId = sessionStorage.getItem('doctor_employee_id');
        const docDepartment = sessionStorage.getItem('doctor_department');
        const docSpecialty = sessionStorage.getItem('doctor_specialty');
        
        setDoctorInfo({
          id: docId,
          name: docName,
          email: docEmail,
          employee_id: docEmployeeId,
          department: docDepartment,
          specialty: docSpecialty
        });
        setIsAuthenticated(true);
        fetchMyPatients();
      } else if (!authAttempted) {
        setAuthAttempted(true);
        // Show auth modal after a delay
        setTimeout(() => {
          if (isMountedRef.current) {
            setAuthModalVisible(true);
          }
        }, 500);
      }
    };

    checkAuth();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchMyPatients = async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      const docId = sessionStorage.getItem('doctor_id');
      const response = await hospitalService.getDoctorPatients(docId);
      
      let patientsData = [];
      if (response && response.data) {
        patientsData = response.data;
      } else if (Array.isArray(response)) {
        patientsData = response;
      }

      const mappedPatients = patientsData.map(patient => ({
        id: patient.id,
        hospital_id: patient.hospital_id,
        mrn: patient.mrn,
        firstName: patient.first_name,
        lastName: patient.last_name,
        fullName: `${patient.first_name} ${patient.last_name}`,
        gender: patient.gender,
        dob: patient.dob,
        age: patient.age,
        bloodType: patient.blood_type,
        phone: patient.phone,
        email: patient.email,
        department: patient.department,
        ward: patient.ward,
        bedNumber: patient.bed_number,
        status: patient.status || 'Admitted',
        admissionDate: patient.admission_date,
        dischargeDate: patient.discharge_date,
        diagnosis: patient.diagnosis,
        doctor: patient.doctor,
        doctor_id: patient.doctor_id,
        allergies: patient.allergies || [],
        medications: patient.medications || [],
        createdAt: patient.created_at,
        updatedAt: patient.updated_at
      }));

      if (isMountedRef.current) {
        setPatients(mappedPatients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      if (isMountedRef.current) {
        message.error('Failed to load patients');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleAuthSuccess = (doctor) => {
    if (!isMountedRef.current) return;
    setDoctorInfo(doctor);
    setIsAuthenticated(true);
    setAuthModalVisible(false); // ✅ This closes the modal
    setAuthAttempted(true);
    fetchMyPatients();
    message.success(`Welcome, Dr. ${doctor.name}!`);
  };

  // ✅ IMPORTANT: This function ONLY closes the modal, doesn't reopen it
  const handleAuthCancel = () => {
    if (!isMountedRef.current) return;
    setAuthModalVisible(false); // ✅ This closes the modal
    // DO NOT reopen the modal here - let the user click the button again
  };

  const handleLogout = () => {
    sessionStorage.removeItem('doctor_authenticated');
    sessionStorage.removeItem('doctor_id');
    sessionStorage.removeItem('doctor_name');
    sessionStorage.removeItem('doctor_email');
    sessionStorage.removeItem('doctor_employee_id');
    sessionStorage.removeItem('doctor_department');
    sessionStorage.removeItem('doctor_specialty');
    sessionStorage.removeItem('doctor_token');
    setIsAuthenticated(false);
    setDoctorInfo(null);
    setPatients([]);
    setAuthAttempted(false);
    message.info('Logged out successfully');
    setAuthModalVisible(true);
  };

  const handleStatusUpdate = async () => {
    await fetchMyPatients();
    if (onDataUpdate) onDataUpdate();
  };

  const criticalPatients = patients.filter(p => 
    p.status === 'Critical' || p.status === 'Deteriorating'
  );

  const filteredPatients = patients.filter(p => {
    const matchesSearch = 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
      p.mrn?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: patients.length,
    critical: criticalPatients.length,
    stable: patients.filter(p => p.status === 'Stable' || p.status === 'Improving').length,
    observation: patients.filter(p => p.status === 'Under Observation').length,
    readyForDischarge: patients.filter(p => p.status === 'Ready for Discharge').length
  };

  const getStatusColor = (status) => {
    return STATUS_CONFIG[status]?.color || 'default';
  };

  const patientColumns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ 
            backgroundColor: record.status === 'Critical' || record.status === 'Deteriorating' 
              ? '#ff4d4f' 
              : '#1890ff' 
          }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.firstName} {record.lastName}</div>
            <div style={{ fontSize: 12, color: '#666' }}>MRN: {record.mrn}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {STATUS_CONFIG[status]?.icon} {status}
        </Tag>
      )
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      render: (diagnosis) => {
        const diseaseInfo = DISEASE_DATABASE[diagnosis];
        return diagnosis ? (
          <Tooltip title={diseaseInfo?.category || ''}>
            <Tag color="blue">
              {diseaseInfo?.icd10 || ''} {diagnosis}
            </Tag>
          </Tooltip>
        ) : 'N/A';
      }
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Bed',
      dataIndex: 'bedNumber',
      key: 'bedNumber',
      render: (bed) => bed ? `#${bed}` : 'N/A'
    },
    {
      title: 'Last Update',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => date ? moment(date).fromNow() : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          icon={<SettingOutlined />}
          onClick={() => {
            setSelectedPatient(record);
            setStatusModalVisible(true);
          }}
        >
          Update Status
        </Button>
      )
    }
  ];

  // If not authenticated, show auth modal
  if (!isAuthenticated) {
    return (
      <>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <LockOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
          <Title level={3}>Doctor Authentication Required</Title>
          <Paragraph type="secondary">
            Please authenticate to access your patient dashboard.
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            icon={<KeyOutlined />}
            onClick={() => setAuthModalVisible(true)}
          >
            Authenticate Now
          </Button>
        </div>
        <DoctorAuthModal
          visible={authModalVisible}
          onCancel={handleAuthCancel}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div className="doctor-dashboard-container">
      {/* Doctor Header */}
      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space>
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>Dr. {doctorInfo?.name}</Title>
                <Text type="secondary">
                  {doctorInfo?.specialty || doctorInfo?.department || 'General Medicine'}
                  {doctorInfo?.department && ` • ${doctorInfo.department}`}
                  {doctorInfo?.employee_id && ` • ID: ${doctorInfo.employee_id}`}
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Badge count={patients.length} title="Assigned Patients">
                <Button icon={<UserOutlined />}>
                  My Patients
                </Button>
              </Badge>
              <Button icon={<ReloadOutlined />} onClick={fetchMyPatients}>
                Refresh
              </Button>
              <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic 
              title="My Patients" 
              value={stats.total} 
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic 
              title="Critical" 
              value={stats.critical} 
              prefix={<FireOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic 
              title="Stable/Improving" 
              value={stats.stable} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic 
              title="Under Observation" 
              value={stats.observation} 
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic 
              title="Ready for Discharge" 
              value={stats.readyForDischarge} 
              prefix={<LogoutOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic 
              title="Avg Stay" 
              value={patients.reduce((acc, p) => {
                if (p.admissionDate) {
                  const days = moment().diff(moment(p.admissionDate), 'days');
                  return acc + days;
                }
                return acc;
              }, 0) / (patients.length || 1)}
              suffix="days"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      {/* Critical Alert */}
      {criticalPatients.length > 0 && (
        <Alert
          message={`${criticalPatients.length} patients require immediate attention`}
          description="Critical patients need urgent medical attention. Please review their status."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary" onClick={() => setFilterStatus('Critical')}>
              View Critical Patients
            </Button>
          }
        />
      )}

      {/* Search and Filter */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search by name or MRN..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Select
              placeholder="Filter by status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
            >
              <Option value="all">All Statuses</Option>
              {Object.keys(STATUS_CONFIG).map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6}>
            <Select
              placeholder="Filter by department"
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="all">All Departments</Option>
              {['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Pediatrics', 'ICU', 'Emergency', 'Surgery', 'Safety Department'].map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button icon={<ExportOutlined />} style={{ width: '100%' }}>
              Export
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Patient Table */}
      <Card>
        <Table
          columns={patientColumns}
          dataSource={filteredPatients}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      {/* Status Update Modal */}
      <DoctorPatientStatusModal
        visible={statusModalVisible}
        patient={selectedPatient}
        doctorInfo={doctorInfo}
        onCancel={() => {
          setStatusModalVisible(false);
          setSelectedPatient(null);
        }}
        onSuccess={handleStatusUpdate}
      />

      {/* Auth Modal */}
      <DoctorAuthModal
        visible={authModalVisible}
        onCancel={handleAuthCancel}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default DoctorDashboard;