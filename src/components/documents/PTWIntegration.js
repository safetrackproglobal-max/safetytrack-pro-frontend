// src/components/documents/PTWIntegration.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Row, Col, Statistic, Button, Space, Input, Select,
  Table, Tag, Modal, Form, message, Popconfirm, Drawer,
  Descriptions, Tabs, Timeline, Avatar, List, Badge,
  Tooltip, Progress, Switch, Empty, Spin, Alert, Divider,
  Typography, Collapse, Checkbox, Radio, Upload, Steps, Result,
  Transfer, Tree, Cascader, DatePicker
} from 'antd';

import {
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  LinkOutlined,
  UnlinkOutlined,
  MoreOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  AlertFilled,
  ExclamationCircleOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  UploadOutlined,
  InboxOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  GlobalOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  ProfileOutlined,
  AuditOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './PTWIntegration.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Panel } = Collapse;
const { Step } = Steps;

// ============================================================
// CONSTANTS
// ============================================================

const PTW_TYPES = {
  hot_work: { label: 'Hot Work', color: '#f5222d', icon: <ThunderboltOutlined /> },
  cold_work: { label: 'Cold Work', color: '#1890ff', icon: <SafetyOutlined /> },
  confined_space: { label: 'Confined Space', color: '#faad14', icon: <WarningOutlined /> },
  electrical: { label: 'Electrical', color: '#722ed1', icon: <ThunderboltOutlined /> },
  excavation: { label: 'Excavation', color: '#fa541c', icon: <EnvironmentOutlined /> },
  lifting: { label: 'Lifting', color: '#52c41a', icon: <SafetyOutlined /> },
  radiation: { label: 'Radiation', color: '#f5222d', icon: <AlertFilled /> },
  chemical: { label: 'Chemical Handling', color: '#13c2c2', icon: <MedicineBoxOutlined /> }
};

const PTW_STATUS = {
  draft: { label: 'Draft', color: 'default' },
  submitted: { label: 'Submitted', color: 'processing' },
  reviewed: { label: 'Reviewed', color: 'blue' },
  approved: { label: 'Approved', color: 'success' },
  active: { label: 'Active', color: 'green' },
  completed: { label: 'Completed', color: 'processing' },
  rejected: { label: 'Rejected', color: 'error' },
  cancelled: { label: 'Cancelled', color: 'warning' },
  expired: { label: 'Expired', color: 'error' }
};

const PTW_PRIORITY = {
  low: { label: 'Low', color: '#52c41a' },
  medium: { label: 'Medium', color: '#faad14' },
  high: { label: 'High', color: '#f5222d' },
  critical: { label: 'Critical', color: '#cf1322' }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const PTWIntegration = ({ 
  companyId = null,
  onUpdate,
  embedded = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [ptwDocuments, setPtwDocuments] = useState([]);
  const [selectedPTW, setSelectedPTW] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    approved: 0,
    submitted: 0,
    completed: 0,
    expired: 0
  });
  
  // UI State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all'
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // ✅ Use refs to store form values
  const formValuesRef = useRef({
    title: '',
    ptw_type: 'excavation',
    location: '',
    description: '',
    start_date: null,
    end_date: null,
    priority: 'medium',
    assigned_to: '',
    department: '',
    risk_assessment: '',
    isolation_requirements: '',
    ppe_requirements: '',
    notes: ''
  });
  
  // Form
  const [form] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadPTWDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        company_id: companyId,
        search: searchText,
        ...filters
      };
      
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });
      
      const data = await documentService.getPTWDocuments(params);
      const docs = data.ptw_documents || data.data || [];
      setPtwDocuments(docs);
      
      setStats({
        total: docs.length,
        active: docs.filter(d => d.status === 'active').length,
        approved: docs.filter(d => d.status === 'approved').length,
        submitted: docs.filter(d => d.status === 'submitted').length,
        completed: docs.filter(d => d.status === 'completed').length,
        expired: docs.filter(d => d.status === 'expired').length
      });
      
    } catch (error) {
      console.error('Failed to load PTW documents:', error);
      message.error('Failed to load PTW documents');
    } finally {
      setLoading(false);
    }
  }, [companyId, searchText, filters]);

  // ============================================================
  // ✅ HANDLE CREATE PTW - Using refs for values
  // ============================================================
  
  const handleCreatePTW = async () => {
    // ✅ Get values from ref
    const values = formValuesRef.current;
    
    console.log('📝 PTW Form Values (from ref):', values);
    
    // ✅ Check if file is uploaded
    if (fileList.length === 0) {
      message.warning('Please upload the PTW file');
      return;
    }
    
    // ✅ Validate required fields
    if (!values.title || values.title.trim() === '') {
      message.error('PTW Title is required');
      return;
    }
    
    if (!values.location || values.location.trim() === '') {
      message.error('Location is required');
      return;
    }
    
    if (!values.description || values.description.trim() === '') {
      message.error('Description is required');
      return;
    }
    
    if (!values.start_date) {
      message.error('Start date is required');
      return;
    }
    
    if (!values.end_date) {
      message.error('End date is required');
      return;
    }
    
    if (values.start_date && values.end_date && values.end_date < values.start_date) {
      message.error('End date cannot be before start date');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      
      // ✅ Append ALL fields from ref
      formData.append('title', (values.title || '').trim());
      formData.append('ptw_type', values.ptw_type || 'excavation');
      formData.append('location', (values.location || '').trim());
      formData.append('description', (values.description || '').trim());
      
      if (values.start_date) {
        formData.append('start_date', values.start_date.toISOString());
      }
      if (values.end_date) {
        formData.append('end_date', values.end_date.toISOString());
      }
      
      formData.append('priority', values.priority || 'medium');
      formData.append('assigned_to', values.assigned_to || '');
      formData.append('department', values.department || '');
      formData.append('risk_assessment', values.risk_assessment || '');
      formData.append('isolation_requirements', values.isolation_requirements || '');
      formData.append('ppe_requirements', values.ppe_requirements || '');
      formData.append('notes', values.notes || '');
      formData.append('status', 'draft');
      formData.append('company_id', companyId || '');
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('file', fileList[0].originFileObj);
      }
      
      // ✅ Debug log
      console.log('📋 PTW FormData:');
      for (let [key, value] of formData.entries()) {
        if (key === 'file') {
          console.log(`  ${key}: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      const result = await documentService.createPTW(formData);
      
      if (result?.success) {
        message.success('PTW created successfully');
        setCreateModalVisible(false);
        setFileList([]);
        form.resetFields();
        // Reset ref
        formValuesRef.current = {
          title: '',
          ptw_type: 'excavation',
          location: '',
          description: '',
          start_date: null,
          end_date: null,
          priority: 'medium',
          assigned_to: '',
          department: '',
          risk_assessment: '',
          isolation_requirements: '',
          ppe_requirements: '',
          notes: ''
        };
        setCurrentStep(0);
        loadPTWDocuments();
        if (onUpdate) onUpdate();
      } else {
        message.error(result?.error || 'Failed to create PTW');
      }
      
    } catch (error) {
      console.error('Failed to create PTW:', error);
      message.error(error.message || 'Failed to create PTW');
    } finally {
      setUploading(false);
    }
  };

  // ✅ Update ref when field changes
  const handleFieldChange = (changedValues, allValues) => {
    // Update ref with all values
    Object.keys(allValues).forEach(key => {
      if (allValues[key] !== undefined) {
        formValuesRef.current[key] = allValues[key];
      }
    });
    
    console.log('📝 Field changed - Ref values:', formValuesRef.current);
  };

  // ✅ Update ref for specific fields
  const updateRefValue = (field, value) => {
    formValuesRef.current[field] = value;
    console.log(`📝 ${field} updated:`, value);
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleApprovePTW = async (values) => {
    try {
      await documentService.approvePTW(selectedPTW.id, {
        comment: values.comment,
        approver: values.approver,
        approved_date: values.approved_date
      });
      
      message.success('PTW approved successfully');
      setApproveModalVisible(false);
      loadPTWDocuments();
      if (selectedPTW) {
        setSelectedPTW({ ...selectedPTW, status: 'approved' });
      }
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to approve PTW:', error);
      message.error(error.message || 'Failed to approve PTW');
    }
  };

  const handleRejectPTW = async (values) => {
    try {
      await documentService.rejectPTW(selectedPTW.id, values.reason);
      
      message.success('PTW rejected');
      setRejectModalVisible(false);
      loadPTWDocuments();
      if (selectedPTW) {
        setSelectedPTW({ ...selectedPTW, status: 'rejected' });
      }
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to reject PTW:', error);
      message.error(error.message || 'Failed to reject PTW');
    }
  };

  const handleUpdateStatus = async (ptwId, status) => {
    try {
      await documentService.updatePTWStatus(ptwId, status);
      message.success(`PTW status updated to ${status}`);
      loadPTWDocuments();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to update PTW status:', error);
      message.error(error.message || 'Failed to update PTW status');
    }
  };

  const handleDeletePTW = async (ptwId) => {
    try {
      await documentService.deleteDocument(ptwId);
      message.success('PTW deleted successfully');
      loadPTWDocuments();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to delete PTW:', error);
      message.error(error.message || 'Failed to delete PTW');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadPTWDocuments();
  }, [loadPTWDocuments]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getStatusTag = (status) => {
    const config = PTW_STATUS[status];
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const getTypeTag = (type) => {
    const config = PTW_TYPES[type];
    if (!config) return <Tag>{type}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getPriorityTag = (priority) => {
    const config = PTW_PRIORITY[priority];
    if (!config) return <Tag>{priority}</Tag>;
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // Render Statistics
  const renderStats = () => (
    <Row gutter={[16, 16]} className="ptw-stats">
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-total">
          <Statistic
            title="Total PTW"
            value={stats.total || 0}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-active">
          <Statistic
            title="Active"
            value={stats.active || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-approved">
          <Statistic
            title="Approved"
            value={stats.approved || 0}
            prefix={<SafetyCertificateOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={4}>
        <Card size="small" className="stat-card stat-submitted">
          <Statistic
            title="Submitted"
            value={stats.submitted || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render PTW Table
  const renderPTWTable = () => {
    const columns = [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (title, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.ptw_number || `PTW-${record.id}`}
            </div>
          </div>
        )
      },
      {
        title: 'Type',
        dataIndex: 'ptw_type',
        key: 'ptw_type',
        render: (type) => getTypeTag(type)
      },
      {
        title: 'Priority',
        dataIndex: 'priority',
        key: 'priority',
        render: (priority) => getPriorityTag(priority)
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => getStatusTag(status)
      },
      {
        title: 'Location',
        dataIndex: 'location',
        key: 'location',
        render: (location) => location || 'N/A'
      },
      {
        title: 'Date',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date) => formatDate(date)
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 200,
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedPTW(record);
                  setDetailDrawerVisible(true);
                }}
              />
            </Tooltip>
            {record.status === 'submitted' && (
              <>
                <Tooltip title="Approve">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    style={{ color: '#52c41a' }}
                    onClick={() => {
                      setSelectedPTW(record);
                      setApproveModalVisible(true);
                    }}
                  />
                </Tooltip>
                <Tooltip title="Reject">
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseCircleOutlined />}
                    style={{ color: '#f5222d' }}
                    onClick={() => {
                      setSelectedPTW(record);
                      setRejectModalVisible(true);
                    }}
                  />
                </Tooltip>
              </>
            )}
            {record.status === 'approved' && (
              <Tooltip title="Activate">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleUpdateStatus(record.id, 'active')}
                />
              </Tooltip>
            )}
            {record.status === 'active' && (
              <Tooltip title="Complete">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleUpdateStatus(record.id, 'completed')}
                />
              </Tooltip>
            )}
            <Popconfirm
              title="Delete this PTW?"
              onConfirm={() => handleDeletePTW(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <Table
        rowKey="id"
        columns={columns}
        dataSource={ptwDocuments}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} PTW documents`
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
      />
    );
  };

  // ✅ FIXED: Render Create Modal with ref-based value tracking
  const renderCreateModal = () => (
    <Modal
      title={<Space><FileTextOutlined /> Create Permit to Work</Space>}
      open={createModalVisible}
      onCancel={() => {
        setCreateModalVisible(false);
        form.resetFields();
        setFileList([]);
        setCurrentStep(0);
        formValuesRef.current = {
          title: '',
          ptw_type: 'excavation',
          location: '',
          description: '',
          start_date: null,
          end_date: null,
          priority: 'medium',
          assigned_to: '',
          department: '',
          risk_assessment: '',
          isolation_requirements: '',
          ppe_requirements: '',
          notes: ''
        };
      }}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Steps 
        current={currentStep} 
        onChange={setCurrentStep}
        style={{ marginBottom: 24 }}
      >
        <Step title="Details" description="PTW Details" />
        <Step title="Risk Assessment" description="Risk & Controls" />
        <Step title="Review" description="Review & Submit" />
      </Steps>

      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{ 
          status: 'draft',
          priority: 'medium',
          ptw_type: 'excavation'
        }}
        onValuesChange={handleFieldChange}
      >
        {/* Step 1: Details */}
        {currentStep === 0 && (
          <>
            <Form.Item
              name="title"
              label="PTW Title"
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input 
                placeholder="Enter PTW title" 
                onChange={(e) => updateRefValue('title', e.target.value)}
              />
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="ptw_type"
                  label="PTW Type"
                  rules={[{ required: true, message: 'Please select type' }]}
                >
                  <Select 
                    placeholder="Select type"
                    onChange={(value) => updateRefValue('ptw_type', value)}
                  >
                    {Object.entries(PTW_TYPES).map(([key, value]) => (
                      <Option key={key} value={key}>
                        {value.icon} {value.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Priority"
                >
                  <Select 
                    placeholder="Select priority"
                    onChange={(value) => updateRefValue('priority', value)}
                  >
                    {Object.entries(PTW_PRIORITY).map(([key, value]) => (
                      <Option key={key} value={key}>
                        {value.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, message: 'Please enter location' }]}
                >
                  <Input 
                    placeholder="Enter work location"
                    onChange={(e) => updateRefValue('location', e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="assigned_to"
                  label="Assigned To"
                >
                  <Select 
                    placeholder="Select assignee"
                    onChange={(value) => updateRefValue('assigned_to', value)}
                  >
                    <Option value="team_a">Team A</Option>
                    <Option value="team_b">Team B</Option>
                    <Option value="contractor">Contractor</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="start_date"
                  label="Start Date"
                  rules={[{ required: true, message: 'Please select start date' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    showTime
                    onChange={(date) => updateRefValue('start_date', date)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="end_date"
                  label="End Date"
                  rules={[{ required: true, message: 'Please select end date' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    showTime
                    onChange={(date) => updateRefValue('end_date', date)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="Describe the work to be performed"
                onChange={(e) => updateRefValue('description', e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label="PTW File"
              required
            >
              <Dragger
                fileList={fileList}
                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                beforeUpload={() => false}
                multiple={false}
                maxCount={1}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">Click or drag file to upload</p>
                <p className="ant-upload-hint">Support: PDF, Word, Excel, Images, Text</p>
              </Dragger>
            </Form.Item>
          </>
        )}

        {/* Step 2: Risk Assessment */}
        {currentStep === 1 && (
          <>
            <Form.Item
              name="risk_assessment"
              label="Risk Assessment"
              rules={[{ required: true, message: 'Please complete risk assessment' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Describe the risks and controls..."
                onChange={(e) => updateRefValue('risk_assessment', e.target.value)}
              />
            </Form.Item>

            <Form.Item
              name="isolation_requirements"
              label="Isolation Requirements"
            >
              <TextArea 
                rows={2} 
                placeholder="Describe isolation requirements..."
                onChange={(e) => updateRefValue('isolation_requirements', e.target.value)}
              />
            </Form.Item>

            <Form.Item
              name="ppe_requirements"
              label="PPE Requirements"
            >
              <TextArea 
                rows={2} 
                placeholder="Describe PPE requirements..."
                onChange={(e) => updateRefValue('ppe_requirements', e.target.value)}
              />
            </Form.Item>
          </>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 2 && (
          <>
            <Alert
              message="Review PTW Details"
              description={
                <div>
                  <p><strong>Title:</strong> {formValuesRef.current.title || 'Not set'}</p>
                  <p><strong>Type:</strong> {formValuesRef.current.ptw_type || 'Not set'}</p>
                  <p><strong>Location:</strong> {formValuesRef.current.location || 'Not set'}</p>
                  <p><strong>Description:</strong> {formValuesRef.current.description || 'Not set'}</p>
                  <p><strong>Start Date:</strong> {formValuesRef.current.start_date?.toString() || 'Not set'}</p>
                  <p><strong>End Date:</strong> {formValuesRef.current.end_date?.toString() || 'Not set'}</p>
                  <p><strong>File:</strong> {fileList.length > 0 ? fileList[0].name : 'No file'}</p>
                </div>
              }
              type="info"
              showIcon
            />

            <Form.Item
              name="notes"
              label="Additional Notes"
            >
              <TextArea 
                rows={2} 
                placeholder="Any additional notes..."
                onChange={(e) => updateRefValue('notes', e.target.value)}
              />
            </Form.Item>
          </>
        )}

        {/* Navigation Buttons */}
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={() => {
              if (currentStep > 0) {
                setCurrentStep(currentStep - 1);
              } else {
                setCreateModalVisible(false);
                form.resetFields();
                setFileList([]);
                formValuesRef.current = {
                  title: '',
                  ptw_type: 'excavation',
                  location: '',
                  description: '',
                  start_date: null,
                  end_date: null,
                  priority: 'medium',
                  assigned_to: '',
                  department: '',
                  risk_assessment: '',
                  isolation_requirements: '',
                  ppe_requirements: '',
                  notes: ''
                };
              }
            }}
          >
            {currentStep > 0 ? 'Previous' : 'Cancel'}
          </Button>
          
          {currentStep < 2 ? (
            <Button 
              type="primary" 
              onClick={() => {
                // ✅ Validate current step
                if (currentStep === 0) {
                  const val = formValuesRef.current;
                  if (!val.title) {
                    message.error('Please enter a title');
                    return;
                  }
                  if (!val.location) {
                    message.error('Please enter a location');
                    return;
                  }
                  if (!val.description) {
                    message.error('Please enter a description');
                    return;
                  }
                  if (!val.start_date) {
                    message.error('Please select a start date');
                    return;
                  }
                  if (!val.end_date) {
                    message.error('Please select an end date');
                    return;
                  }
                } else if (currentStep === 1) {
                  const val = formValuesRef.current;
                  if (!val.risk_assessment) {
                    message.error('Please complete the risk assessment');
                    return;
                  }
                }
                setCurrentStep(currentStep + 1);
              }}
            >
              Next
            </Button>
          ) : (
            <Button 
              type="primary" 
              onClick={handleCreatePTW}
              loading={uploading}
            >
              Submit PTW
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );

  // Render Approve Modal
  const renderApproveModal = () => (
    <Modal
      title={<Space><CheckCircleOutlined /> Approve PTW</Space>}
      open={approveModalVisible}
      onCancel={() => setApproveModalVisible(false)}
      footer={null}
      width={500}
    >
      <Form layout="vertical" onFinish={handleApprovePTW}>
        <Form.Item
          name="approver"
          label="Approver"
          rules={[{ required: true, message: 'Please enter approver name' }]}
        >
          <Input placeholder="Enter approver name" />
        </Form.Item>

        <Form.Item
          name="approved_date"
          label="Approval Date"
          rules={[{ required: true, message: 'Please select approval date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="comment"
          label="Comments"
        >
          <TextArea rows={3} placeholder="Add approval comments..." />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setApproveModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Approve
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Reject Modal
  const renderRejectModal = () => (
    <Modal
      title={<Space><CloseCircleOutlined /> Reject PTW</Space>}
      open={rejectModalVisible}
      onCancel={() => setRejectModalVisible(false)}
      footer={null}
      width={500}
    >
      <Form layout="vertical" onFinish={handleRejectPTW}>
        <Form.Item
          name="reason"
          label="Reason for Rejection"
          rules={[
            { required: true, message: 'Please provide a reason' },
            { min: 10, message: 'Reason must be at least 10 characters' }
          ]}
        >
          <TextArea rows={4} placeholder="Provide detailed reason for rejection..." />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setRejectModalVisible(false)}>Cancel</Button>
            <Button danger htmlType="submit">
              Reject
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Detail Drawer
  const renderDetailDrawer = () => (
    <Drawer
      title={<Space><FileTextOutlined /> PTW Details</Space>}
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={700}
    >
      {selectedPTW && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Title">
              {selectedPTW.title}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              {getTypeTag(selectedPTW.ptw_type)}
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              {getPriorityTag(selectedPTW.priority)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedPTW.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedPTW.location || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Assigned To">
              {selectedPTW.assigned_to || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Date Range">
              {formatDate(selectedPTW.start_date)} - {formatDate(selectedPTW.end_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedPTW.description || 'No description'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={5}>Risk Assessment</Title>
          <Paragraph>{selectedPTW.risk_assessment || 'None'}</Paragraph>

          {selectedPTW.isolation_requirements && (
            <>
              <Title level={5}>Isolation Requirements</Title>
              <Paragraph>{selectedPTW.isolation_requirements}</Paragraph>
            </>
          )}

          {selectedPTW.ppe_requirements && (
            <>
              <Title level={5}>PPE Requirements</Title>
              <Paragraph>{selectedPTW.ppe_requirements}</Paragraph>
            </>
          )}

          {selectedPTW.notes && (
            <>
              <Divider />
              <Title level={5}>Notes</Title>
              <Paragraph>{selectedPTW.notes}</Paragraph>
            </>
          )}

          <Divider />

          <Space style={{ width: '100%' }}>
            {selectedPTW.status === 'submitted' && (
              <>
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setApproveModalVisible(true);
                    setDetailDrawerVisible(false);
                  }}
                >
                  Approve
                </Button>
                <Button 
                  danger 
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setRejectModalVisible(true);
                    setDetailDrawerVisible(false);
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            {selectedPTW.status === 'approved' && (
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                onClick={() => {
                  handleUpdateStatus(selectedPTW.id, 'active');
                  setDetailDrawerVisible(false);
                }}
              >
                Activate
              </Button>
            )}
            {selectedPTW.status === 'active' && (
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  handleUpdateStatus(selectedPTW.id, 'completed');
                  setDetailDrawerVisible(false);
                }}
              >
                Complete
              </Button>
            )}
            <Button icon={<DownloadOutlined />}>
              Download
            </Button>
          </Space>
        </div>
      )}
    </Drawer>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="ptw-integration">
      {/* Header */}
      <div className="ptw-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <FileTextOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
            <Title level={4} style={{ margin: 0 }}>Permit to Work (PTW)</Title>
            <Badge status="processing" text="Live" />
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              New PTW
            </Button>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`Delete ${selectedRowKeys.length} PTW documents?`}
                onConfirm={() => {
                  message.info('Bulk delete coming soon');
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete Selected
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      <div className="ptw-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input.Search
              placeholder="Search PTW..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => loadPTWDocuments()}
              allowClear
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: '100%' }}
              allowClear
              placeholder="Status"
            >
              <Option value="all">All Statuses</Option>
              {Object.entries(PTW_STATUS).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              style={{ width: '100%' }}
              allowClear
              placeholder="Type"
            >
              <Option value="all">All Types</Option>
              {Object.entries(PTW_TYPES).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button icon={<ReloadOutlined />} onClick={loadPTWDocuments} loading={loading}>
                Refresh
              </Button>
              <Button icon={<ExportOutlined />} onClick={() => message.info('Exporting PTW data...')}>
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Table */}
      {renderPTWTable()}

      {/* Modals & Drawers */}
      {renderCreateModal()}
      {renderApproveModal()}
      {renderRejectModal()}
      {renderDetailDrawer()}
    </div>
  );
};

export default PTWIntegration;