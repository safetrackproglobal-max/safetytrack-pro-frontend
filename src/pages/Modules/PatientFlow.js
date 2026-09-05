// src/pages/Modules/PatientFlow.js - Complete with Full Backend Integration
import React, { useState, useEffect } from 'react';
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
  InputNumber,
  Switch,
  message,
  Space,
  Divider,
  Popconfirm,
  Tooltip,
  Avatar,
  Progress,
  Tabs,
  Badge,
  List,
  Alert,
  Timeline,
  Collapse,
  Steps,
  Descriptions,
  DatePicker,
  Rate,
  Upload,
  TreeSelect,
  Transfer,
  Slider,
  Radio,
  Checkbox,
  Calendar,
  Drawer,
  Typography,
  Spin
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
  StarOutlined,
  BankOutlined,
  RobotOutlined,
  ApartmentOutlined,
  DashboardOutlined,
  HeartOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  BugOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  TrophyOutlined,
  GoldOutlined,
  RocketOutlined,
  BookOutlined,
  ReadOutlined,
  SolutionOutlined,
  SafetyOutlined,
  WifiOutlined,
  BulbOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  CarOutlined,
  AimOutlined,
  NodeIndexOutlined,
  UsergroupAddOutlined,
  HourglassOutlined,
  LeafOutlined,
  InsuranceOutlined,
  ProfileOutlined,
  FormOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  CheckSquareOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileImageOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  VideoCameraOutlined,
  MobileOutlined,
  TabletOutlined,
  DesktopOutlined,
  GiftOutlined,
  ClusterOutlined,
  CommentOutlined,
  DollarOutlined,
  WalletOutlined,
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
  HomeOutlined,
  MenuOutlined,
  InboxOutlined,
  SafetyCertificateOutlined as SafetyIcon
} from '@ant-design/icons';
import moment from 'moment';
import './PatientFlow.css';
import hospitalService from '../../services/hospitalService';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;
const { Title, Text } = Typography;

// ============================================
// DEPARTMENT CONSTANTS
// ============================================
const DEPARTMENTS = [
  'Cardiology',
  'Neurology', 
  'Orthopedics',
  'General Medicine',
  'Pediatrics',
  'ICU',
  'Emergency',
  'Surgery',
  'Safety Department'
];

// ============================================
// PATIENT STATUS COMPONENTS
// ============================================

const PatientStatusCard = ({ title, count, icon, color, bgColor, onClick }) => (
  <Card 
    className="patient-status-card" 
    onClick={onClick}
    style={{ borderLeft: `4px solid ${color}`, cursor: 'pointer' }}
  >
    <div className="status-icon" style={{ color }}>{icon}</div>
    <div className="status-number" style={{ color }}>{count}</div>
    <div className="status-label">{title}</div>
  </Card>
);

// ============================================
// PATIENT ADMISSION FORM - WITH DOCTOR/NURSE SELECTION
// ============================================
const PatientAdmissionForm = ({ visible, onCancel, onSuccess, editingPatient, beds, companyId, hospitalId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [medicalStaff, setMedicalStaff] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Fetch medical staff when modal opens
  useEffect(() => {
    if (visible && (companyId || hospitalId)) {
      fetchMedicalStaff();
    }
  }, [visible, companyId, hospitalId]);

  const fetchMedicalStaff = async () => {
    setLoadingStaff(true);
    try {
      let staffData = [];
      
      // Try to get staff from company first
      if (companyId) {
        try {
          const response = await hospitalService.getCompanyMedicalStaff(companyId);
          if (response && response.success) {
            staffData = response.data || [];
          }
        } catch (error) {
          console.warn('Could not fetch company staff:', error);
        }
      }
      
      // If no company staff, try hospital staff
      if (staffData.length === 0 && hospitalId) {
        try {
          const response = await hospitalService.getHospitalMedicalStaff(hospitalId);
          if (response && response.success) {
            staffData = response.data || [];
          }
        } catch (error) {
          console.warn('Could not fetch hospital staff:', error);
        }
      }
      
      // Separate doctors and nurses
      const doctorsList = staffData.filter(s => 
        s.role === 'doctor' || 
        s.position === 'Doctor' || 
        s.user_type === 'doctor' ||
        s.role === 'physician' ||
        s.position === 'Physician' ||
        s.role === 'medical_officer'
      );
      
      const nursesList = staffData.filter(s => 
        s.role === 'nurse' || 
        s.position === 'Nurse' || 
        s.user_type === 'nurse'
      );
      
      setDoctors(doctorsList);
      setNurses(nursesList);
      setMedicalStaff([...doctorsList, ...nursesList]);
      
    } catch (error) {
      console.error('Error fetching medical staff:', error);
      message.error('Failed to load medical staff');
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    // Filter available beds for the selected department
    const department = form.getFieldValue('department');
    if (department && beds) {
      const available = beds.filter(
        bed => bed.department === department && bed.status === 'available'
      );
      setAvailableBeds(available);
    } else {
      setAvailableBeds([]);
    }
  }, [form.getFieldValue('department'), beds]);

  useEffect(() => {
    if (editingPatient && visible) {
      form.setFieldsValue({
        firstName: editingPatient.firstName || editingPatient.first_name,
        lastName: editingPatient.lastName || editingPatient.last_name,
        gender: editingPatient.gender,
        dob: editingPatient.dob ? moment(editingPatient.dob) : null,
        bloodType: editingPatient.bloodType || editingPatient.blood_type,
        phone: editingPatient.phone,
        email: editingPatient.email,
        address: editingPatient.address,
        emergencyContact: editingPatient.emergencyContact || editingPatient.emergency_contact,
        emergencyPhone: editingPatient.emergencyPhone || editingPatient.emergency_phone,
        department: editingPatient.department,
        ward: editingPatient.ward,
        bedNumber: editingPatient.bedNumber || editingPatient.bed_number,
        admissionDate: editingPatient.admissionDate || editingPatient.admission_date 
          ? moment(editingPatient.admissionDate || editingPatient.admission_date) 
          : moment(),
        reason: editingPatient.diagnosis || editingPatient.reason,
        doctor: editingPatient.doctor,
        assignedDoctorId: editingPatient.doctor_id || editingPatient.assigned_doctor,
        assignedNurseId: editingPatient.nurse_id || editingPatient.assigned_nurse,
        medicalHistory: editingPatient.medicalHistory || editingPatient.medical_history,
        allergies: editingPatient.allergies || [],
        medications: editingPatient.medications || [],
        status: editingPatient.status || 'Admitted'
      });
    }
  }, [editingPatient, visible, form]);

  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setAvailableBeds([]);
    }
  }, [visible, form]);

  const handleDepartmentChange = (department) => {
    if (beds) {
      const available = beds.filter(
        bed => bed.department === department && bed.status === 'available'
      );
      setAvailableBeds(available);
    }
    form.setFieldsValue({ bedNumber: undefined });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Get selected doctor and nurse names
      const selectedDoctor = doctors.find(d => d.id === values.assignedDoctorId);
      const selectedNurse = nurses.find(n => n.id === values.assignedNurseId);
      
      const patientData = {
        first_name: values.firstName,
        last_name: values.lastName,
        gender: values.gender,
        dob: values.dob ? values.dob.toISOString() : null,
        blood_type: values.bloodType,
        phone: values.phone,
        email: values.email,
        address: values.address,
        emergency_contact: values.emergencyContact,
        emergency_phone: values.emergencyPhone,
        department: values.department,
        ward: values.ward,
        bed_number: values.bedNumber,
        admission_date: values.admissionDate 
          ? values.admissionDate.format('YYYY-MM-DD HH:mm') 
          : moment().format('YYYY-MM-DD HH:mm'),
        diagnosis: values.reason,
        doctor: selectedDoctor ? selectedDoctor.name : values.doctor,
        doctor_id: values.assignedDoctorId,
        nurse_id: values.assignedNurseId,
        medical_history: values.medicalHistory,
        allergies: values.allergies || [],
        medications: values.medications || [],
        status: values.status || 'Admitted'
      };

      if (editingPatient) {
        await hospitalService.updatePatient(editingPatient.id, patientData);
        
        if (values.bedNumber !== editingPatient.bedNumber) {
          const oldBed = beds.find(b => b.number === editingPatient.bedNumber && b.department === editingPatient.department);
          if (oldBed) {
            await hospitalService.updateBed(oldBed.id, { 
              status: 'available', 
              patient_name: null,
              patient_id: null
            });
          }
          const newBed = beds.find(b => b.number === values.bedNumber && b.department === values.department);
          if (newBed) {
            await hospitalService.updateBed(newBed.id, { 
              status: 'occupied', 
              patient_name: `${values.firstName} ${values.lastName}`,
              patient_id: editingPatient.id
            });
          }
        }
        message.success('Patient updated successfully');
      } else {
        await hospitalService.admitPatient(patientData);
        message.success('Patient admitted successfully');
      }
      
      form.resetFields();
      onSuccess && onSuccess();
      onCancel();
    } catch (error) {
      console.error('Admission failed:', error);
      message.error(error.response?.data?.error || 'Failed to admit patient');
    } finally {
      setLoading(false);
    }
  };

  const getStaffDisplay = (staff) => {
    const name = staff.name || `${staff.first_name} ${staff.last_name}`;
    const role = staff.role || staff.position || staff.user_type;
    const specialty = staff.specialty ? ` - ${staff.specialty}` : '';
    return `${name} (${role}${specialty})`;
  };

  return (
    <Modal
      title={
        <Space>
          <LoginOutlined style={{ color: '#1890ff' }} />
          {editingPatient ? 'Edit Patient' : 'Admit New Patient'}
        </Space>
      }
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      width={900}
      className="custom-modal"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: 'Admitted',
          admissionDate: moment()
        }}
        className="admission-form"
      >
        <Divider orientation="left">Patient Information</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please enter first name' }]}>
              <Input placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please enter last name' }]}>
              <Input placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Please select gender' }]}>
              <Select placeholder="Select gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="dob" label="Date of Birth">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bloodType" label="Blood Type">
              <Select placeholder="Select blood type">
                <Option value="A+">A+</Option>
                <Option value="A-">A-</Option>
                <Option value="B+">B+</Option>
                <Option value="B-">B-</Option>
                <Option value="AB+">AB+</Option>
                <Option value="AB-">AB-</Option>
                <Option value="O+">O+</Option>
                <Option value="O-">O-</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Please enter phone number' }]}>
              <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email" label="Email">
              <Input prefix={<MailOutlined />} placeholder="Enter email" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Address">
          <TextArea rows={2} placeholder="Enter address" />
        </Form.Item>

        <Divider orientation="left">Admission Details</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Please select department' }]}>
              <Select placeholder="Select department" onChange={handleDepartmentChange}>
                {DEPARTMENTS.map(dept => (
                  <Option key={dept} value={dept}>{dept}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ward" label="Ward">
              <Select placeholder="Select ward">
                <Option value="Ward A">Ward A</Option>
                <Option value="Ward B">Ward B</Option>
                <Option value="Ward C">Ward C</Option>
                <Option value="Private">Private</Option>
                <Option value="ICU">ICU</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="bedNumber" 
              label="Bed Number" 
              rules={[{ required: true, message: 'Please select a bed' }]}
            >
              <Select 
                placeholder="Select available bed" 
                disabled={!form.getFieldValue('department')}
              >
                {availableBeds.map(bed => (
                  <Option key={bed.id} value={bed.number}>
                    Bed #{bed.number} - {bed.department}
                  </Option>
                ))}
                {availableBeds.length === 0 && form.getFieldValue('department') && (
                  <Option value="" disabled>No available beds in this department</Option>
                )}
              </Select>
            </Form.Item>
            {form.getFieldValue('department') && availableBeds.length === 0 && (
              <Text type="warning" style={{ fontSize: 12 }}>
                <WarningOutlined /> No available beds. Please add beds or select another department.
              </Text>
            )}
          </Col>
          <Col span={12}>
            <Form.Item name="admissionDate" label="Admission Date" rules={[{ required: true, message: 'Please select admission date' }]}>
              <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="reason" label="Reason for Admission" rules={[{ required: true, message: 'Please enter reason for admission' }]}>
          <TextArea rows={3} placeholder="Enter reason for admission" />
        </Form.Item>

        {/* UPDATED: Medical Team Assignment with Doctor and Nurse Dropdowns */}
        <Divider orientation="left">Medical Team Assignment</Divider>

        <Alert
          message="Assign Medical Team"
          description="Select a doctor and nurse from your company's medical staff. Only staff members in your company database are shown."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="assignedDoctorId" 
              label="Assigned Doctor"
              extra="Only doctors from your company are listed"
            >
              <Select
                placeholder="Select assigned doctor"
                showSearch
                optionFilterProp="children"
                allowClear
                loading={loadingStaff}
                notFoundContent={loadingStaff ? <Spin size="small" /> : "No doctors available in your company"}
              >
                {doctors.map(doc => (
                  <Option key={doc.id} value={doc.id}>
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                      <span>{doc.name || `${doc.first_name} ${doc.last_name}`}</span>
                      <Tag color="blue">Doctor</Tag>
                      {doc.specialty && <Tag color="purple" style={{ fontSize: 10 }}>{doc.specialty}</Tag>}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="assignedNurseId" 
              label="Assigned Nurse"
              extra="Only nurses from your company are listed"
            >
              <Select
                placeholder="Select assigned nurse"
                showSearch
                optionFilterProp="children"
                allowClear
                loading={loadingStaff}
                notFoundContent={loadingStaff ? <Spin size="small" /> : "No nurses available in your company"}
              >
                {nurses.map(nurse => (
                  <Option key={nurse.id} value={nurse.id}>
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
                      <span>{nurse.name || `${nurse.first_name} ${nurse.last_name}`}</span>
                      <Tag color="green">Nurse</Tag>
                      {nurse.specialty && <Tag color="cyan" style={{ fontSize: 10 }}>{nurse.specialty}</Tag>}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Keep the legacy doctor field for backward compatibility */}
        <Form.Item name="doctor" label="Attending Doctor Name (Optional)" style={{ display: 'none' }}>
          <Input placeholder="Enter doctor name" />
        </Form.Item>

        <Divider orientation="left">Medical Details</Divider>

        <Form.Item name="medicalHistory" label="Medical History">
          <TextArea rows={2} placeholder="Enter medical history" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="allergies" label="Allergies">
              <Select mode="tags" placeholder="Enter allergies">
                <Option value="Penicillin">Penicillin</Option>
                <Option value="Sulfa">Sulfa</Option>
                <Option value="Latex">Latex</Option>
                <Option value="Aspirin">Aspirin</Option>
                <Option value="Shellfish">Shellfish</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="medications" label="Current Medications">
              <Select mode="tags" placeholder="Enter medications">
                <Option value="Lisinopril">Lisinopril</Option>
                <Option value="Metformin">Metformin</Option>
                <Option value="Amlodipine">Amlodipine</Option>
                <Option value="Atorvastatin">Atorvastatin</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider />
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {editingPatient ? 'Update Patient' : 'Admit Patient'}
            </Button>
            <Button onClick={() => {
              form.resetFields();
              onCancel();
            }}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ============================================
// PATIENT STATUS MODAL
// ============================================
const PatientStatusModal = ({ visible, patient, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'Admitted', label: 'Admitted', color: 'blue', icon: <LoginOutlined /> },
    { value: 'Critical', label: 'Critical', color: 'red', icon: <FireOutlined /> },
    { value: 'Under Observation', label: 'Under Observation', color: 'orange', icon: <ClockCircleOutlined /> },
    { value: 'Discharged', label: 'Discharged', color: 'green', icon: <LogoutOutlined /> },
    { value: 'Transferred', label: 'Transferred', color: 'purple', icon: <ArrowRightOutlined /> }
  ];

  const handleStatusChange = async (values) => {
    setLoading(true);
    try {
      await hospitalService.updatePatientStatus(patient.id, { 
        status: values.status, 
        reason: values.reason,
        hospital_id: patient.hospital_id
      });
      
      message.success(`Patient status updated to ${values.status}`);
      form.resetFields();
      onSuccess && onSuccess();
      onCancel();
    } catch (error) {
      console.error('Status update failed:', error);
      message.error(error.response?.data?.error || 'Failed to update patient status');
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined style={{ color: '#1890ff' }} />
          Update Patient Status
        </Space>
      }
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      width={600}
      className="custom-modal"
      destroyOnClose
    >
      <Alert
        message={`${patient.firstName} ${patient.lastName}`}
        description={`Current Status: ${patient.status} | MRN: ${patient.mrn} | Bed: #${patient.bedNumber}`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical" onFinish={handleStatusChange}>
        <Form.Item 
          name="status" 
          label="New Status" 
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select placeholder="Select new status">
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <Space>
                  {option.icon}
                  <Tag color={option.color}>{option.label}</Tag>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="reason" label="Reason for Status Change">
          <TextArea rows={3} placeholder="Enter reason for status change..." />
        </Form.Item>

        <Divider />

        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">Status Change Effects:</Text>
          <div style={{ marginTop: 8 }}>
            <ul style={{ paddingLeft: 20 }}>
              <li><Text>Discharged: Bed will be freed up automatically</Text></li>
              <li><Text>Transferred: Bed will be freed up automatically</Text></li>
              <li><Text>Critical: Will trigger alerts and notifications</Text></li>
            </ul>
          </div>
        </div>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Update Status
            </Button>
            <Button onClick={() => {
              form.resetFields();
              onCancel();
            }}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ============================================
// PATIENT DISCHARGE MODAL
// ============================================
const PatientDischargeModal = ({ visible, patient, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleDischarge = async (values) => {
    setLoading(true);
    try {
      const dischargeData = {
        ...values,
        dischargeDate: values.dischargeDate ? values.dischargeDate.format('YYYY-MM-DD HH:mm') : moment().format('YYYY-MM-DD HH:mm'),
        hospital_id: patient.hospital_id
      };

      await hospitalService.dischargePatient(patient.id, dischargeData);
      
      message.success(`Patient ${patient.firstName} ${patient.lastName} discharged successfully`);
      form.resetFields();
      onSuccess && onSuccess();
      onCancel();
    } catch (error) {
      console.error('Discharge failed:', error);
      message.error(error.response?.data?.error || 'Failed to discharge patient');
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <Modal
      title={
        <Space>
          <LogoutOutlined style={{ color: '#52c41a' }} />
          Discharge Patient
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      className="custom-modal"
      destroyOnClose
    >
      <Alert
        message={`Discharging ${patient.firstName} ${patient.lastName}`}
        description={`MRN: ${patient.mrn} | Department: ${patient.department} | Bed: #${patient.bedNumber}`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical" onFinish={handleDischarge} className="admission-form">
        <Divider orientation="left">Discharge Summary</Divider>

        <Form.Item name="dischargeDate" label="Discharge Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>

        <Form.Item name="dischargeType" label="Discharge Type" rules={[{ required: true }]}>
          <Select placeholder="Select discharge type">
            <Option value="Home">Home</Option>
            <Option value="Home Care">Home Care</Option>
            <Option value="Rehabilitation">Rehabilitation</Option>
            <Option value="Nursing Home">Nursing Home</Option>
            <Option value="Hospice">Hospice</Option>
            <Option value="Transfer">Transfer to Another Facility</Option>
            <Option value="Expired">Expired</Option>
          </Select>
        </Form.Item>

        <Form.Item name="dischargeDiagnosis" label="Discharge Diagnosis" rules={[{ required: true }]}>
          <TextArea rows={3} placeholder="Enter discharge diagnosis" />
        </Form.Item>

        <Form.Item name="dischargeInstructions" label="Discharge Instructions">
          <TextArea rows={3} placeholder="Enter discharge instructions" />
        </Form.Item>

        <Form.Item name="followUpDate" label="Follow-up Date">
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="followUpDoctor" label="Follow-up Doctor">
          <Input placeholder="Enter follow-up doctor name" />
        </Form.Item>

        <Form.Item name="medications" label="Prescribed Medications">
          <Select mode="tags" placeholder="Enter medications">
            <Option value="Lisinopril">Lisinopril</Option>
            <Option value="Metformin">Metformin</Option>
            <Option value="Amlodipine">Amlodipine</Option>
            <Option value="Atorvastatin">Atorvastatin</Option>
          </Select>
        </Form.Item>

        <Divider />
        <div className="discharge-summary">
          <div className="summary-title">Discharge Summary</div>
          <div className="summary-item">
            <span>Patient:</span>
            <span><strong>{patient.firstName} {patient.lastName}</strong></span>
          </div>
          <div className="summary-item">
            <span>MRN:</span>
            <span>{patient.mrn}</span>
          </div>
          <div className="summary-item">
            <span>Department:</span>
            <span>{patient.department}</span>
          </div>
          <div className="summary-item">
            <span>Bed:</span>
            <span>#{patient.bedNumber}</span>
          </div>
          <div className="summary-item">
            <span>Admission Date:</span>
            <span>{moment(patient.admissionDate).format('MMM DD, YYYY')}</span>
          </div>
          <div className="summary-item">
            <span>Length of Stay:</span>
            <span>{moment().diff(moment(patient.admissionDate), 'days')} days</span>
          </div>
        </div>

        <Divider />
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<CheckCircleOutlined />} style={{ background: '#52c41a' }}>
              Confirm Discharge
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ============================================
// BED MANAGEMENT COMPONENT
// ============================================
const BedManagementDashboard = ({ beds, onBedSelect, onRefresh }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [bedModalVisible, setBedModalVisible] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const departments = ['all', ...DEPARTMENTS];

  const filteredBeds = selectedDepartment === 'all' 
    ? beds 
    : beds.filter(bed => bed.department === selectedDepartment);

  const getBedStatusColor = (status) => {
    switch(status) {
      case 'available': return '#52c41a';
      case 'occupied': return '#ff4d4f';
      case 'maintenance': return '#faad14';
      case 'reserved': return '#1890ff';
      default: return '#d9d9d9';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'available': return 'Available';
      case 'occupied': return 'Occupied';
      case 'maintenance': return 'Maintenance';
      case 'reserved': return 'Reserved';
      default: return status;
    }
  };

  const handleBedClick = (bed) => {
    setSelectedBed(bed);
    form.setFieldsValue({
      number: bed.number,
      department: bed.department,
      ward: bed.ward || '',
      status: bed.status,
      patient_name: bed.patient_name || '',
      notes: bed.notes || ''
    });
    setBedModalVisible(true);
  };

  const handleSaveBed = async (values) => {
    setLoading(true);
    try {
      const bedData = {
        hospital_id: selectedBed?.hospital_id || 1,
        number: values.number,
        department: values.department,
        ward: values.ward || '',
        status: values.status,
        notes: values.notes || ''
      };

      if (selectedBed?.id) {
        await hospitalService.updateBed(selectedBed.id, bedData);
        message.success('Bed updated successfully');
      } else {
        await hospitalService.createBed(bedData);
        message.success('Bed created successfully');
      }
      
      setBedModalVisible(false);
      setSelectedBed(null);
      form.resetFields();
      onRefresh && onRefresh();
    } catch (error) {
      console.error('Failed to save bed:', error);
      message.error(error.response?.data?.error || 'Failed to save bed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBed = async () => {
    if (!selectedBed?.id) return;
    if (selectedBed.status === 'occupied') {
      message.warning('Cannot delete an occupied bed. Please discharge the patient first.');
      return;
    }
    setLoading(true);
    try {
      await hospitalService.deleteBed(selectedBed.id);
      message.success('Bed deleted successfully');
      setBedModalVisible(false);
      setSelectedBed(null);
      onRefresh && onRefresh();
    } catch (error) {
      console.error('Failed to delete bed:', error);
      message.error(error.response?.data?.error || 'Failed to delete bed');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length,
    reserved: beds.filter(b => b.status === 'reserved').length
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card size="small">
            <Statistic title="Total Beds" value={stats.total} prefix={<ApartmentOutlined />} />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Statistic title="Available" value={stats.available} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Statistic title="Occupied" value={stats.occupied} valueStyle={{ color: '#ff4d4f' }} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Statistic title="Maintenance" value={stats.maintenance} valueStyle={{ color: '#faad14' }} prefix={<Tooltip />} />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Statistic title="Reserved" value={stats.reserved} valueStyle={{ color: '#1890ff' }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select 
            value={selectedDepartment} 
            onChange={setSelectedDepartment} 
            style={{ width: 200 }}
            placeholder="Filter by department"
          >
            {departments.map(dept => (
              <Option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</Option>
            ))}
          </Select>
          <Tag color="green">Available</Tag>
          <Tag color="red">Occupied</Tag>
          <Tag color="gold">Maintenance</Tag>
          <Tag color="blue">Reserved</Tag>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setSelectedBed(null);
            form.resetFields();
            form.setFieldsValue({ status: 'available' });
            setBedModalVisible(true);
          }}>
            Add Bed
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onRefresh}>Refresh</Button>
        </Space>
      </div>

      <Row gutter={[8, 8]}>
        {filteredBeds.map(bed => (
          <Col key={bed.id} xs={12} sm={8} md={6} lg={4}>
            <div 
              className={`bed-card ${bed.status}`}
              onClick={() => handleBedClick(bed)}
              style={{ 
                cursor: 'pointer',
                padding: 12,
                border: `2px solid ${getBedStatusColor(bed.status)}`,
                borderRadius: 8,
                backgroundColor: bed.status === 'occupied' ? '#fff1f0' : '#fafafa',
                transition: 'all 0.3s'
              }}
            >
              <div className="bed-number" style={{ fontSize: 18, fontWeight: 'bold' }}>
                Bed #{bed.number}
              </div>
              <div className="bed-patient" style={{ marginTop: 4 }}>
                {bed.patient_name ? (
                  <Space>
                    <UserOutlined />
                    <span style={{ fontWeight: 500 }}>{bed.patient_name}</span>
                  </Space>
                ) : (
                  <span style={{ color: '#999' }}>Available</span>
                )}
              </div>
              <div className="bed-department" style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {bed.department} {bed.ward && `- ${bed.ward}`}
              </div>
              <Tag color={getBedStatusColor(bed.status)} style={{ marginTop: 8 }}>
                {getStatusLabel(bed.status)}
              </Tag>
            </div>
          </Col>
        ))}
      </Row>

      <Modal
        title={
          <Space>
            <ApartmentOutlined style={{ color: '#1890ff' }} />
            {selectedBed ? 'Edit Bed' : 'Add New Bed'}
          </Space>
        }
        open={bedModalVisible}
        onCancel={() => {
          setBedModalVisible(false);
          setSelectedBed(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="custom-modal"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSaveBed}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="number" label="Bed Number" rules={[{ required: true, message: 'Please enter bed number' }]}>
                <InputNumber style={{ width: '100%' }} placeholder="Enter bed number" min={1} max={999} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Please select department' }]}>
                <Select placeholder="Select department">
                  {DEPARTMENTS.map(dept => (
                    <Option key={dept} value={dept}>{dept}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="ward" label="Ward">
            <Select placeholder="Select ward">
              <Option value="Ward A">Ward A</Option>
              <Option value="Ward B">Ward B</Option>
              <Option value="Ward C">Ward C</Option>
              <Option value="Private">Private</Option>
              <Option value="ICU">ICU</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status' }]}>
            <Select placeholder="Select status">
              <Option value="available">Available</Option>
              <Option value="occupied">Occupied</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="reserved">Reserved</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} placeholder="Enter any notes about this bed" />
          </Form.Item>

          <Divider />
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                {selectedBed ? 'Update Bed' : 'Create Bed'}
              </Button>
              {selectedBed && (
                <Popconfirm
                  title="Delete this bed?"
                  description={selectedBed.status === 'occupied' ? "This bed is currently occupied. Cannot delete." : "This action cannot be undone"}
                  onConfirm={handleDeleteBed}
                  okText="Yes, Delete"
                  cancelText="Cancel"
                  disabled={selectedBed.status === 'occupied'}
                >
                  <Button danger icon={<DeleteOutlined />} loading={loading} disabled={selectedBed.status === 'occupied'}>
                    Delete Bed
                  </Button>
                </Popconfirm>
              )}
              <Button onClick={() => {
                setBedModalVisible(false);
                setSelectedBed(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ============================================
// PATIENT TIMELINE
// ============================================
const PatientTimeline = ({ patientId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const response = await hospitalService.getPatientTimeline(patientId);
        let timelineData = [];
        
        // Handle response format from backend
        if (response && response.data) {
          timelineData = response.data;
        } else if (Array.isArray(response)) {
          timelineData = response;
        }
        
        setEvents(timelineData.length > 0 ? timelineData : [
          { id: 1, type: 'Admission', description: 'Patient admitted to department', time: moment().subtract(3, 'days').format('MMM DD, YYYY HH:mm'), icon: <LoginOutlined /> },
          { id: 2, type: 'Consultation', description: 'Consulted with attending physician', time: moment().subtract(2, 'days').format('MMM DD, YYYY HH:mm'), icon: <EyeOutlined /> },
          { id: 3, type: 'Lab Test', description: 'Diagnostic tests completed', time: moment().subtract(1, 'days').format('MMM DD, YYYY HH:mm'), icon: <ExperimentOutlined /> },
        ]);
      } catch (error) {
        console.error('Error fetching timeline:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [patientId]);

  return (
    <div className="patient-timeline">
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>Loading...</div>
      ) : (
        <Timeline>
          {events.map(event => (
            <Timeline.Item key={event.id} dot={event.icon}>
              <div className="timeline-event">
                <div>
                  <div className="event-type">{event.type}</div>
                  <div>{event.description}</div>
                </div>
                <div className="event-time">{event.time}</div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </div>
  );
};

// ============================================
// PATIENT TRANSFER MODAL
// ============================================
const PatientTransferModal = ({ visible, patient, onCancel, onSuccess, beds }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableBeds, setAvailableBeds] = useState([]);

  useEffect(() => {
    const department = form.getFieldValue('department');
    if (department && beds) {
      const available = beds.filter(
        bed => bed.department === department && bed.status === 'available'
      );
      setAvailableBeds(available);
    } else {
      setAvailableBeds([]);
    }
  }, [form.getFieldValue('department'), beds]);

  const handleDepartmentChange = (department) => {
    if (beds) {
      const available = beds.filter(
        bed => bed.department === department && bed.status === 'available'
      );
      setAvailableBeds(available);
    }
    form.setFieldsValue({ bedNumber: undefined });
  };

  const handleTransfer = async (values) => {
    setLoading(true);
    try {
      await hospitalService.transferPatient(patient.id, {
        ...values,
        hospital_id: patient.hospital_id
      });
      
      message.success(`Patient transferred to ${values.department}`);
      form.resetFields();
      onSuccess && onSuccess();
      onCancel();
    } catch (error) {
      console.error('Transfer failed:', error);
      message.error(error.response?.data?.error || 'Failed to transfer patient');
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <Modal
      title={
        <Space>
          <ArrowRightOutlined style={{ color: '#1890ff' }} />
          Transfer Patient
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="custom-modal"
      destroyOnClose
    >
      <Alert
        message={`Transferring ${patient.firstName} ${patient.lastName}`}
        description={`Current Department: ${patient.department} | Bed: #${patient.bedNumber}`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical" onFinish={handleTransfer}>
        <Form.Item name="department" label="Transfer to Department" rules={[{ required: true }]}>
          <Select placeholder="Select department" onChange={handleDepartmentChange}>
            {DEPARTMENTS.map(dept => (
              <Option key={dept} value={dept}>{dept}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item 
          name="bedNumber" 
          label="Transfer to Bed Number"
          rules={[{ required: true, message: 'Please select a bed' }]}
        >
          <Select 
            placeholder="Select available bed" 
            disabled={!form.getFieldValue('department')}
          >
            {availableBeds.map(bed => (
              <Option key={bed.id} value={bed.number}>
                Bed #{bed.number} - {bed.department}
              </Option>
            ))}
            {availableBeds.length === 0 && form.getFieldValue('department') && (
              <Option value="" disabled>No available beds in this department</Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item name="reason" label="Reason for Transfer" rules={[{ required: true }]}>
          <TextArea rows={3} placeholder="Enter reason for transfer" />
        </Form.Item>

        <Divider />
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<ArrowRightOutlined />}>
              Transfer Patient
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ============================================
// MAIN PATIENT FLOW COMPONENT
// ============================================
const PatientFlow = () => {
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [admissionModal, setAdmissionModal] = useState(false);
  const [dischargeModal, setDischargeModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [editingPatient, setEditingPatient] = useState(null);

  // Get companyId and hospitalId from user session or context
  const companyId = sessionStorage.getItem('company_id') || null;
  const hospitalId = sessionStorage.getItem('hospital_id') || 1;

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch patients
      const patientsResponse = await hospitalService.getPatients();
      
      let patientsData = [];
      if (patientsResponse && patientsResponse.data) {
        patientsData = patientsResponse.data;
      } else if (Array.isArray(patientsResponse)) {
        patientsData = patientsResponse;
      } else if (patientsResponse && patientsResponse.patients) {
        patientsData = patientsResponse.patients;
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
        address: patient.address,
        emergencyContact: patient.emergency_contact,
        emergencyPhone: patient.emergency_phone,
        department: patient.department,
        ward: patient.ward,
        bedNumber: patient.bed_number,
        status: patient.status,
        admissionDate: patient.admission_date,
        dischargeDate: patient.discharge_date,
        diagnosis: patient.diagnosis,
        doctor: patient.doctor,
        doctor_id: patient.doctor_id,
        nurse_id: patient.nurse_id,
        medicalHistory: patient.medical_history,
        allergies: patient.allergies || [],
        medications: patient.medications || [],
        currentMedications: patient.current_medications || [],
        createdAt: patient.created_at,
        updatedAt: patient.updated_at
      }));
      
      setPatients(mappedPatients);

      // Fetch beds from API
      try {
        const bedsResponse = await hospitalService.getBeds();
        let bedsData = [];
        
        if (bedsResponse && bedsResponse.beds) {
          bedsData = bedsResponse.beds;
        } else if (bedsResponse && bedsResponse.data) {
          bedsData = bedsResponse.data;
        } else if (Array.isArray(bedsResponse)) {
          bedsData = bedsResponse;
        }
        
        if (bedsData.length > 0) {
          const mappedBeds = bedsData.map(bed => ({
            id: bed.id,
            number: bed.number,
            department: bed.department,
            ward: bed.ward || '',
            status: bed.status || 'available',
            patient_name: bed.patient_name || null,
            patient_id: bed.patient_id || null,
            notes: bed.notes || '',
            hospital_id: bed.hospital_id,
            created_at: bed.created_at,
            updated_at: bed.updated_at
          }));
          setBeds(mappedBeds);
        } else {
          generateDefaultBeds(mappedPatients);
        }
      } catch (error) {
        console.warn('Could not fetch beds, generating default:', error);
        generateDefaultBeds(mappedPatients);
      }
      
      message.success('Data loaded successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to load data');
      setPatients([]);
      generateDefaultBeds([]);
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultBeds = (patients) => {
    const bedsData = [];
    const bedDepartments = ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'ICU', 'Surgery', 'Safety Department'];
    bedDepartments.forEach((dept, deptIndex) => {
      for (let i = 1; i <= 10; i++) {
        const bedNumber = deptIndex * 10 + i;
        const patient = patients?.find(p => p.department === dept && p.bedNumber === bedNumber);
        bedsData.push({
          id: `bed-${deptIndex}-${i}`,
          number: bedNumber,
          department: dept,
          ward: '',
          status: patient ? 'occupied' : (i % 3 === 0 ? 'maintenance' : 'available'),
          patient_name: patient ? `${patient.firstName} ${patient.lastName}` : null,
          patient_id: patient ? patient.id : null,
          notes: '',
          hospital_id: 1
        });
      }
    });
    setBeds(bedsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdmitPatient = async () => {
    await fetchData();
  };

  const handleDischargePatient = async () => {
    setSelectedPatient(null);
    await fetchData();
  };

  const handleTransferPatient = async () => {
    setSelectedPatient(null);
    await fetchData();
  };

  const getStatusColor = (status) => {
    const colors = { 
      Admitted: 'blue', 
      Critical: 'red', 
      Discharged: 'green',
      'Under Observation': 'orange',
      Transferred: 'purple'
    };
    return colors[status] || 'default';
  };

  const getStatusTagColor = (status) => {
    const colors = { 
      Admitted: 'blue', 
      Critical: 'red', 
      Discharged: 'green',
      'Under Observation': 'orange',
      Transferred: 'purple'
    };
    return colors[status] || 'default';
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.mrn?.toLowerCase().includes(searchText.toLowerCase()) ||
      patient.department?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = activeTab === 'all' || patient.status === activeTab;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: patients.length,
    admitted: patients.filter(p => p.status === 'Admitted').length,
    critical: patients.filter(p => p.status === 'Critical').length,
    underObservation: patients.filter(p => p.status === 'Under Observation').length,
    discharged: patients.filter(p => p.status === 'Discharged').length,
    transferred: patients.filter(p => p.status === 'Transferred').length,
    safety: patients.filter(p => p.department === 'Safety Department').length
  };

  const patientColumns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: record.department === 'Safety Department' ? '#faad14' : '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.firstName} {record.lastName}</div>
            <div style={{ fontSize: 12, color: '#666' }}>MRN: {record.mrn}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => (
        <Tag color={dept === 'Safety Department' ? 'gold' : 'blue'}>
          {dept === 'Safety Department' ? <SafetyIcon /> : null} {dept}
        </Tag>
      )
    },
    {
      title: 'Bed',
      dataIndex: 'bedNumber',
      key: 'bedNumber',
      render: (bed) => bed ? `Bed #${bed}` : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={getStatusColor(status)} 
          text={<Tag color={getStatusTagColor(status)}>{status}</Tag>}
        />
      )
    },
    {
      title: 'Admission Date',
      dataIndex: 'admissionDate',
      key: 'admissionDate',
      render: (date) => date ? moment(date).format('MMM DD, YYYY') : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} onClick={() => setSelectedPatient(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingPatient(record); setAdmissionModal(true); }} />
          </Tooltip>
          <Tooltip title="Change Status">
            <Button 
              type="link" 
              icon={<SettingOutlined />} 
              onClick={() => { setSelectedPatient(record); setStatusModal(true); }}
            />
          </Tooltip>
          {record.status !== 'Discharged' && record.status !== 'Transferred' && (
            <>
              <Tooltip title="Transfer">
                <Button type="link" icon={<ArrowRightOutlined />} onClick={() => { setSelectedPatient(record); setTransferModal(true); }} />
              </Tooltip>
              <Tooltip title="Discharge">
                <Button type="link" icon={<LogoutOutlined />} onClick={() => { setSelectedPatient(record); setDischargeModal(true); }} style={{ color: '#52c41a' }} />
              </Tooltip>
            </>
          )}
          <Popconfirm title="Delete patient?" onConfirm={() => {}}>
            <Tooltip title="Delete">
              <Button type="link" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="patient-flow-container">
      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <h1 style={{ margin: 0, fontSize: 28 }}>
              <UserOutlined /> Patient Flow Management
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: 16 }}>
              Complete patient journey from admission to discharge with bed management
            </p>
          </Col>
          <Col>
            <Space>
              <Button icon={<ExportOutlined />}>Export</Button>
              <Button icon={<ImportOutlined />}>Import</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingPatient(null); setAdmissionModal(true); }}>
                Admit Patient
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={4}>
          <PatientStatusCard 
            title="Total Patients" 
            count={stats.total} 
            icon={<UserOutlined />}
            color="#1890ff"
            bgColor="#e6f7ff"
            onClick={() => setActiveTab('all')}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <PatientStatusCard 
            title="Admitted" 
            count={stats.admitted} 
            icon={<LoginOutlined />}
            color="#1890ff"
            bgColor="#e6f7ff"
            onClick={() => setActiveTab('Admitted')}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <PatientStatusCard 
            title="Critical" 
            count={stats.critical} 
            icon={<FireOutlined />}
            color="#ff4d4f"
            bgColor="#fff1f0"
            onClick={() => setActiveTab('Critical')}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <PatientStatusCard 
            title="Under Observation" 
            count={stats.underObservation} 
            icon={<ClockCircleOutlined />}
            color="#faad14"
            bgColor="#fff7e6"
            onClick={() => setActiveTab('Under Observation')}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <PatientStatusCard 
            title="Discharged" 
            count={stats.discharged} 
            icon={<LogoutOutlined />}
            color="#52c41a"
            bgColor="#f6ffed"
            onClick={() => setActiveTab('Discharged')}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <PatientStatusCard 
            title="Safety Dept" 
            count={stats.safety} 
            icon={<SafetyIcon />}
            color="#faad14"
            bgColor="#fff7e6"
            onClick={() => setActiveTab('Safety Department')}
          />
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }} className="quick-actions">
        <Space wrap>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingPatient(null); setAdmissionModal(true); }}>
            Admit Patient
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Refresh Data
          </Button>
          <Button icon={<SearchOutlined />}>Find Patient</Button>
          <Button icon={<PrinterOutlined />}>Print Report</Button>
        </Space>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search patients by name, MRN, or department..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              className="patient-search"
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select 
              placeholder="Status" 
              style={{ width: '100%' }}
              value={activeTab}
              onChange={setActiveTab}
            >
              <Option value="all">All Patients</Option>
              <Option value="Admitted">Admitted</Option>
              <Option value="Critical">Critical</Option>
              <Option value="Under Observation">Under Observation</Option>
              <Option value="Discharged">Discharged</Option>
              <Option value="Transferred">Transferred</Option>
            </Select>
          </Col>
          <Col xs={12} sm={4}>
            <Select placeholder="Department" style={{ width: '100%' }}>
              <Option value="all">All Departments</Option>
              {DEPARTMENTS.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Button icon={<FilterOutlined />} style={{ width: '100%' }}>More Filters</Button>
          </Col>
        </Row>
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large">
        <TabPane tab={<span><UserOutlined /> All Patients <Badge count={stats.total} /></span>} key="all">
          <Card>
            <Table
              columns={patientColumns}
              dataSource={filteredPatients}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><LoginOutlined /> Admitted <Badge count={stats.admitted} /></span>} key="Admitted">
          <Card>
            <Table
              columns={patientColumns}
              dataSource={filteredPatients}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><FireOutlined /> Critical <Badge count={stats.critical} /></span>} key="Critical">
          <Card>
            <Table
              columns={patientColumns}
              dataSource={filteredPatients}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><ClockCircleOutlined /> Under Observation <Badge count={stats.underObservation} /></span>} key="Under Observation">
          <Card>
            <Table
              columns={patientColumns}
              dataSource={filteredPatients}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><LogoutOutlined /> Discharged <Badge count={stats.discharged} /></span>} key="Discharged">
          <Card>
            <Table
              columns={patientColumns}
              dataSource={filteredPatients}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><SafetyIcon /> Safety Department <Badge count={stats.safety} /></span>} key="Safety Department">
          <Card>
            <Alert
              message="Safety Department Patients"
              description="Patients admitted for workplace injuries, occupational exposures, and safety-related incidents"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={patientColumns}
              dataSource={filteredPatients}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><ApartmentOutlined /> Bed Management</span>} key="beds">
          <Card title="Bed Management Dashboard">
            <BedManagementDashboard 
              beds={beds} 
              onBedSelect={(bed) => {
                if (bed.patient_name) {
                  const patient = patients.find(p => `${p.firstName} ${p.lastName}` === bed.patient_name);
                  if (patient) setSelectedPatient(patient);
                }
              }}
              onRefresh={fetchData}
            />
          </Card>
        </TabPane>
      </Tabs>

      <PatientAdmissionForm
        visible={admissionModal}
        onCancel={() => { setAdmissionModal(false); setEditingPatient(null); }}
        onSuccess={handleAdmitPatient}
        editingPatient={editingPatient}
        beds={beds}
        companyId={companyId}
        hospitalId={hospitalId}
      />

      <PatientStatusModal
        visible={statusModal}
        patient={selectedPatient}
        onCancel={() => { setStatusModal(false); setSelectedPatient(null); }}
        onSuccess={() => {
          setStatusModal(false);
          setSelectedPatient(null);
          fetchData();
        }}
      />

      <PatientDischargeModal
        visible={dischargeModal}
        patient={selectedPatient}
        onCancel={() => { setDischargeModal(false); setSelectedPatient(null); }}
        onSuccess={handleDischargePatient}
      />

      <PatientTransferModal
        visible={transferModal}
        patient={selectedPatient}
        onCancel={() => { setTransferModal(false); setSelectedPatient(null); }}
        onSuccess={handleTransferPatient}
        beds={beds}
      />

      <Drawer
        title={
          <Space>
            <UserOutlined />
            Patient Details
          </Space>
        }
        placement="right"
        onClose={() => setSelectedPatient(null)}
        open={!!selectedPatient}
        width={600}
        extra={
          <Space>
            {selectedPatient?.status !== 'Discharged' && selectedPatient?.status !== 'Transferred' && (
              <>
                <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => { setTransferModal(true); }}>
                  Transfer
                </Button>
                <Button type="primary" icon={<LogoutOutlined />} style={{ background: '#52c41a' }} onClick={() => { setDischargeModal(true); }}>
                  Discharge
                </Button>
              </>
            )}
          </Space>
        }
      >
        {selectedPatient && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Full Name">
                <Space>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: selectedPatient.department === 'Safety Department' ? '#faad14' : '#1890ff' }} />
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="MRN">{selectedPatient.mrn}</Descriptions.Item>
              <Descriptions.Item label="Gender">{selectedPatient.gender}</Descriptions.Item>
              <Descriptions.Item label="Age">{selectedPatient.age || 'N/A'} years</Descriptions.Item>
              <Descriptions.Item label="Department">
                <Tag color={selectedPatient.department === 'Safety Department' ? 'gold' : 'blue'}>
                  {selectedPatient.department}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ward">{selectedPatient.ward || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Bed Number">Bed #{selectedPatient.bedNumber}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge status={getStatusColor(selectedPatient.status)} text={selectedPatient.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Admission Date">
                {selectedPatient.admissionDate ? moment(selectedPatient.admissionDate).format('MMM DD, YYYY HH:mm') : 'N/A'}
              </Descriptions.Item>
              {selectedPatient.dischargeDate && (
                <Descriptions.Item label="Discharge Date">
                  {moment(selectedPatient.dischargeDate).format('MMM DD, YYYY HH:mm')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Doctor">{selectedPatient.doctor || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Diagnosis">{selectedPatient.diagnosis || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedPatient.phone}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedPatient.email || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Allergies">
                {selectedPatient.allergies?.length > 0 ? (
                  <Space wrap>
                    {selectedPatient.allergies.map((a, i) => <Tag key={i} color="red">{a}</Tag>)}
                  </Space>
                ) : 'None'}
              </Descriptions.Item>
              <Descriptions.Item label="Medications">
                {selectedPatient.medications?.length > 0 ? (
                  <Space wrap>
                    {selectedPatient.medications.map((m, i) => <Tag key={i} color="blue">{m}</Tag>)}
                  </Space>
                ) : 'None'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Card title="Patient Timeline" size="small">
              <PatientTimeline patientId={selectedPatient.id} />
            </Card>

            <Divider />

            <Card title="Quick Actions" size="small">
              <Space wrap>
                <Button icon={<EyeOutlined />}>View Medical Records</Button>
                <Button icon={<ExperimentOutlined />}>Order Lab Test</Button>
                <Button icon={<MedicineBoxOutlined />}>Prescribe Medication</Button>
                <Button icon={<FileTextOutlined />}>Add Clinical Note</Button>
                {selectedPatient.department === 'Safety Department' && (
                  <Button icon={<SafetyIcon />} style={{ color: '#faad14' }}>Safety Report</Button>
                )}
              </Space>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PatientFlow;