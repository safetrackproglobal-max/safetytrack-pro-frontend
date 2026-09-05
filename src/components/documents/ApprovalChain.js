// src/components/documents/ApprovalChain.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Descriptions,
  Tabs, Timeline, Avatar, List, Badge, Tooltip, Progress,
  Switch, Empty, Spin, Alert, Divider, Typography, Collapse,
  Steps, Statistic, Transfer, Tree, Cascader, DatePicker, Radio, InputNumber
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EditOutlined,
  StarOutlined,
  DeleteOutlined,
  EyeOutlined,
  SaveOutlined,
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  SettingOutlined,
  ReloadOutlined,
  FilterOutlined,
  SearchOutlined,
  HistoryOutlined,
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
  BookOutlined,
  ScanOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  BuildOutlined,
  HomeOutlined,
  ShopOutlined,
  RocketOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './ApprovalChain.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Step } = Steps;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const DOCUMENT_TYPES = {
  general: { label: 'General Document', icon: <FileTextOutlined />, color: '#1890ff' },
  report: { label: 'Report', icon: <FileTextOutlined />, color: '#1890ff' },
  policy: { label: 'Policy/Procedure', icon: <SafetyCertificateOutlined />, color: '#faad14' },
  record: { label: 'Record/Log', icon: <HistoryOutlined />, color: '#722ed1' },
  contract: { label: 'Contract/Agreement', icon: <FileTextOutlined />, color: '#1890ff' },
  inspection: { label: 'Inspection Report', icon: <ScanOutlined />, color: '#faad14' },
  audit: { label: 'Audit Document', icon: <AuditOutlined />, color: '#722ed1' },
  permit: { label: 'Permit/License', icon: <SafetyCertificateOutlined />, color: '#1890ff' },
  certificate: { label: 'Certificate', icon: <CheckCircleOutlined />, color: '#52c41a' },
  training: { label: 'Training Material', icon: <BookOutlined />, color: '#2f54eb' },
  presentation: { label: 'Presentation', icon: <FileTextOutlined />, color: '#13c2c2' },
  spreadsheet: { label: 'Spreadsheet/Data', icon: <FileExcelOutlined />, color: '#52c41a' },
  image: { label: 'Image/Photo', icon: <FileImageOutlined />, color: '#faad14' }
};

const MODULES = [
  { value: 'all', label: 'All Modules', icon: <GlobalOutlined /> },
  { value: 'general', label: 'General', icon: <FileTextOutlined /> },
  { value: 'construction', label: 'Construction', icon: <BuildOutlined /> },
  { value: 'hospital', label: 'Hospital/Healthcare', icon: <MedicineBoxOutlined /> },
  { value: 'manufacturing', label: 'Manufacturing', icon: <ShopOutlined /> },
  { value: 'oil_gas', label: 'Oil & Gas', icon: <EnvironmentOutlined /> },
  { value: 'mining', label: 'Mining', icon: <HomeOutlined /> },
  { value: 'environmental', label: 'Environmental', icon: <EnvironmentOutlined /> },
  { value: 'quality', label: 'Quality Management', icon: <SafetyCertificateOutlined /> },
  { value: 'safety', label: 'Health & Safety', icon: <SafetyCertificateOutlined /> },
  { value: 'supply_chain', label: 'Supply Chain', icon: <GlobalOutlined /> },
  { value: 'training', label: 'Training & Development', icon: <RocketOutlined /> },
  { value: 'compliance', label: 'Compliance', icon: <AuditOutlined /> }
];

const APPROVAL_STATUS = {
  pending: { label: 'Pending', color: 'default', icon: <ClockCircleOutlined /> },
  in_progress: { label: 'In Progress', color: 'processing', icon: <ClockCircleOutlined /> },
  approved: { label: 'Approved', color: 'success', icon: <CheckCircleOutlined /> },
  rejected: { label: 'Rejected', color: 'error', icon: <CloseCircleOutlined /> },
  cancelled: { label: 'Cancelled', color: 'warning', icon: <CloseCircleOutlined /> }
};

const STEP_STATUS = {
  pending: { label: 'Pending', color: 'default' },
  in_progress: { label: 'In Progress', color: 'processing' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  escalated: { label: 'Escalated', color: 'warning' },
  timeout: { label: 'Timeout', color: 'error' }
};

const ASSIGNEE_TYPES = [
  { value: 'role', label: 'Role' },
  { value: 'user', label: 'Specific User' },
  { value: 'department', label: 'Department' }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

const ApprovalChain = ({ 
  documentId = null,
  companyId = null,
  onUpdate,
  embedded = false 
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [chains, setChains] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedChain, setSelectedChain] = useState(null);
  const [chainDetailVisible, setChainDetailVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form
  const [form] = Form.useForm();
  const [actionForm] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [chainsResult, pendingResult] = await Promise.all([
        documentService.getApprovalChains({ company_id: companyId }),
        documentService.getPendingApprovals()
      ]);
      
      if (chainsResult?.success) {
        setChains(chainsResult.chains || []);
      }
      
      if (pendingResult?.success) {
        setPendingApprovals(pendingResult.approvals || []);
      }
      
    } catch (error) {
      console.error('Failed to load approval data:', error);
      message.error('Failed to load approval data');
    } finally {
      setLoading(false);
    }
  }, [companyId, documentId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleCreateChain = async (values) => {
    try {
      const data = {
        name: values.name,
        description: values.description || '',
        document_type: values.document_type || null,
        module: values.module || 'general',
        is_active: values.is_active !== undefined ? values.is_active : true,
        is_default: values.is_default || false,
        company_id: companyId,
        steps: (values.steps || []).map(step => ({
          name: step.name,
          description: step.description || '',
          approval_type: step.approval_type || 'sequential',
          assignee_type: step.assignee_type || 'role',
          assignee_id: step.assignee_id || null,
          assignee_name: step.assignee_name || null,
          requires_comment: step.requires_comment || false,
          timeout_days: step.timeout_days || 7,
          escalation_days: step.escalation_days || null,
          escalation_user_id: step.escalation_user_id || null,
          is_mandatory: true
        }))
      };
      
      const result = await documentService.createApprovalChain(data);
      
      if (result?.success) {
        message.success('Approval chain created successfully');
        setCreateModalVisible(false);
        form.resetFields();
        loadData();
      } else {
        message.error(result?.error || 'Failed to create chain');
      }
      
    } catch (error) {
      console.error('Create chain error:', error);
      message.error('Failed to create approval chain');
    }
  };

  const handleStartApproval = async (chainId) => {
    if (!documentId) {
      message.warning('No document selected');
      return;
    }
    
    try {
      const result = await documentService.startDocumentApproval(documentId, {
        chain_id: chainId,
        notes: 'Starting approval process'
      });
      
      if (result?.success) {
        message.success('Approval process started');
        loadData();
        if (onUpdate) onUpdate();
      } else {
        message.error(result?.error || 'Failed to start approval');
      }
      
    } catch (error) {
      console.error('Start approval error:', error);
      message.error('Failed to start approval');
    }
  };

  const handleApprovalAction = async (values) => {
    try {
      const result = await documentService.processApprovalAction(
        selectedApproval.id,
        values.action,
        values.comment
      );
      
      if (result?.success) {
        message.success(`Approval ${values.action}ed successfully`);
        setActionModalVisible(false);
        actionForm.resetFields();
        loadData();
        if (onUpdate) onUpdate();
      } else {
        message.error(result?.error || 'Action failed');
      }
      
    } catch (error) {
      console.error('Approval action error:', error);
      message.error('Failed to process action');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getStatusTag = (status) => {
    const config = APPROVAL_STATUS[status];
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getStepStatusTag = (status) => {
    const config = STEP_STATUS[status];
    if (!config) return <Tag>{status}</Tag>;
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
  // RENDER FUNCTIONS - ALL DEFINED HERE BEFORE RETURN
  // ============================================================

  // Render Stats
  const renderStats = () => (
    <Row gutter={[16, 16]} className="approval-stats">
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-total">
          <Statistic
            title="Total Chains"
            value={chains.length}
            prefix={<SafetyCertificateOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-pending">
          <Statistic
            title="Pending Approvals"
            value={pendingApprovals.length}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-active">
          <Statistic
            title="Active Chains"
            value={chains.filter(c => c.is_active).length}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-default">
          <Statistic
            title="Default Chains"
            value={chains.filter(c => c.is_default).length}
            prefix={<StarOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Chains List
  const renderChains = () => (
    <Card 
      title="Approval Chains" 
      size="small"
      extra={
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          New Chain
        </Button>
      }
    >
      {chains.length > 0 ? (
        <List
          dataSource={chains}
          renderItem={(chain) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedChain(chain);
                    setChainDetailVisible(true);
                  }}
                >
                  View Steps
                </Button>,
                documentId && (
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleStartApproval(chain.id)}
                  >
                    Use This Chain
                  </Button>
                )
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge 
                    status={chain.is_active ? 'success' : 'default'}
                    text={chain.is_active ? 'Active' : 'Inactive'}
                  />
                }
                title={
                  <Space>
                    <span>{chain.name}</span>
                    {chain.is_default && <Tag color="gold">Default</Tag>}
                    <Tag color="blue">{chain.document_type || 'All'}</Tag>
                  </Space>
                }
                description={
                  <div>
                    <div>{chain.description}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {chain.steps_count || 0} steps • 
                      Created: {formatDate(chain.created_at)}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No approval chains available" />
      )}
    </Card>
  );

  // Render Pending Approvals
  const renderPendingApprovals = () => (
    <Card 
      title="Pending Approvals" 
      size="small"
      extra={<Badge count={pendingApprovals.length} color="red" />}
    >
      {pendingApprovals.length > 0 ? (
        <List
          dataSource={pendingApprovals}
          renderItem={(approval) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => {
                    setSelectedApproval(approval);
                    setDetailDrawerVisible(true);
                  }}
                >
                  View
                </Button>,
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => {
                    setSelectedApproval(approval);
                    setActionModalVisible(true);
                  }}
                >
                  Take Action
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    background: '#e6f7ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                  </div>
                }
                title={
                  <Space>
                    <span>{approval.document_title || `Document ${approval.document_id}`}</span>
                    {getStatusTag(approval.status)}
                  </Space>
                }
                description={
                  <div>
                    <div>Chain: {approval.chain_name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      Progress: {approval.progress || 0}% • 
                      Steps: {(approval.current_step || 0) + 1}/{approval.total_steps || 1}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Progress 
                        percent={approval.progress || 0} 
                        size="small"
                        strokeColor="#1890ff"
                        showInfo={false}
                      />
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No pending approvals" />
      )}
    </Card>
  );

  // Render Create Chain Modal
  const renderCreateModal = () => (
    <Modal
      title={<Space><PlusOutlined /> Create Approval Chain</Space>}
      open={createModalVisible}
      onCancel={() => {
        setCreateModalVisible(false);
        form.resetFields();
        setCurrentStep(0);
      }}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateChain}
        initialValues={{ 
          is_active: true,
          is_default: false,
          module: 'general',
          steps: []
        }}
      >
        <Form.Item
          name="name"
          label="Chain Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input placeholder="Enter approval chain name" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={2} placeholder="Describe the approval chain" />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name="document_type" label="Document Type">
              <Select placeholder="All types" allowClear>
                {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                  <Option key={key} value={key}>{value.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="module" label="Module">
              <Select placeholder="All modules" allowClear>
                {MODULES.filter(m => m.value !== 'all').map(mod => (
                  <Option key={mod.value} value={mod.value}>{mod.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name="is_active" label="Active" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="is_default" label="Set as Default" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Approval Steps</Divider>

        <Form.List name="steps">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Card
                  key={field.key}
                  size="small"
                  title={`Step ${index + 1}`}
                  extra={
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={() => remove(field.name)}
                    />
                  }
                  style={{ marginBottom: 8 }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'name']}
                        label="Step Name"
                        rules={[{ required: true, message: 'Please enter step name' }]}
                      >
                        <Input placeholder="Enter step name" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'description']}
                        label="Description"
                      >
                        <TextArea rows={2} placeholder="Step description" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'approval_type']}
                        label="Approval Type"
                      >
                        <Select>
                          <Option value="sequential">Sequential</Option>
                          <Option value="parallel">Parallel</Option>
                          <Option value="any">Any</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'assignee_type']}
                        label="Assignee Type"
                      >
                        <Select>
                          {ASSIGNEE_TYPES.map(type => (
                            <Option key={type.value} value={type.value}>{type.label}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'assignee_id']}
                        label="Assignee"
                      >
                        <Select placeholder="Select assignee">
                          {/* Populate with users/roles/departments */}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'timeout_days']}
                        label="Timeout (days)"
                      >
                        <InputNumber min={1} max={30} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'escalation_days']}
                        label="Escalation After (days)"
                      >
                        <InputNumber min={1} max={30} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'requires_comment']}
                        label="Requires Comment"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ))}
              <Button 
                type="dashed" 
                onClick={() => add()} 
                block
                icon={<PlusOutlined />}
              >
                Add Step
              </Button>
            </>
          )}
        </Form.List>

        <Form.Item style={{ marginTop: 16 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Create Chain
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Detail Drawer
  const renderDetailDrawer = () => {
    return (
      <Drawer
        title={<Space><AuditOutlined /> Approval Details</Space>}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        width={600}
      >
        {selectedApproval ? (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Document">
                {selectedApproval.document_title || `Document ${selectedApproval.document_id}`}
              </Descriptions.Item>
              <Descriptions.Item label="Chain">
                {selectedApproval.chain_name}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedApproval.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Progress">
                <Progress 
                  percent={selectedApproval.progress || 0}
                  strokeColor="#1890ff"
                />
              </Descriptions.Item>
              <Descriptions.Item label="Current Step">
                Step {(selectedApproval.current_step || 0) + 1} of {selectedApproval.total_steps || 1}
              </Descriptions.Item>
              <Descriptions.Item label="Started">
                {formatDate(selectedApproval.started_at)}
              </Descriptions.Item>
              {selectedApproval.completed_at && (
                <Descriptions.Item label="Completed">
                  {formatDate(selectedApproval.completed_at)}
                </Descriptions.Item>
              )}
              {selectedApproval.notes && (
                <Descriptions.Item label="Notes">
                  {selectedApproval.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>Approval Steps</Divider>
            
            <Steps 
              current={selectedApproval.current_step || 0}
              direction="vertical"
              size="small"
            >
              {(selectedApproval.step_statuses || []).map((step, index) => (
                <Step
                  key={index}
                  title={step.step_name || `Step ${index + 1}`}
                  description={
                    <div>
                      <div>{step.step_name}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {getStepStatusTag(step.status)}
                        {step.assigned_to_name && ` • Assigned to: ${step.assigned_to_name}`}
                        {step.completed_at && ` • Completed: ${formatDate(step.completed_at)}`}
                      </div>
                      {step.comment && (
                        <div style={{ marginTop: 4, fontSize: 12 }}>
                          <Text type="secondary">Comment: </Text>
                          {step.comment}
                        </div>
                      )}
                    </div>
                  }
                  status={
                    step.status === 'approved' ? 'finish' :
                    step.status === 'rejected' ? 'error' :
                    step.status === 'in_progress' ? 'process' : 'wait'
                  }
                  icon={
                    step.status === 'approved' ? <CheckCircleOutlined /> :
                    step.status === 'rejected' ? <CloseCircleOutlined /> :
                    step.status === 'in_progress' ? <ClockCircleOutlined /> :
                    <ClockCircleOutlined />
                  }
                />
              ))}
            </Steps>

            <Divider />

            <Space style={{ width: '100%' }}>
              {selectedApproval.status === 'in_progress' && (
                <>
                  <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      setActionModalVisible(true);
                      setDetailDrawerVisible(false);
                    }}
                  >
                    Approve
                  </Button>
                  <Button 
                    danger 
                    icon={<CloseCircleOutlined />}
                    onClick={() => {
                      setActionModalVisible(true);
                      setDetailDrawerVisible(false);
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button icon={<HistoryOutlined />}>
                View History
              </Button>
            </Space>
          </div>
        ) : (
          <Empty description="No approval selected" />
        )}
      </Drawer>
    );
  };

  // Render Action Modal
  const renderActionModal = () => {
    return (
      <Modal
        title={<Space><AuditOutlined /> Approval Action</Space>}
        open={actionModalVisible}
        onCancel={() => {
          setActionModalVisible(false);
          actionForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        {selectedApproval ? (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Document">
                {selectedApproval.document_title || `Document ${selectedApproval.document_id}`}
              </Descriptions.Item>
              <Descriptions.Item label="Current Step">
                {(selectedApproval.current_step || 0) + 1} of {selectedApproval.total_steps || 1}
              </Descriptions.Item>
              <Descriptions.Item label="Step Name">
                {selectedApproval.step_statuses?.[selectedApproval.current_step || 0]?.step_name || 'Unknown'}
              </Descriptions.Item>
            </Descriptions>

            <Form
              form={actionForm}
              layout="vertical"
              onFinish={handleApprovalAction}
            >
              <Form.Item
                name="action"
                label="Action"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Radio.Group>
                  <Radio value="approve">
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> Approve
                  </Radio>
                  <Radio value="reject">
                    <CloseCircleOutlined style={{ color: '#f5222d' }} /> Reject
                  </Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="comment"
                label="Comment"
              >
                <TextArea rows={3} placeholder="Add a comment about your decision..." />
              </Form.Item>

              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={() => {
                    setActionModalVisible(false);
                    actionForm.resetFields();
                  }}>Cancel</Button>
                  <Button type="primary" htmlType="submit">
                    Submit Decision
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <Empty description="No approval selected" />
        )}
      </Modal>
    );
  };

  // Render Chain Detail Drawer
  const renderChainDetailDrawer = () => {
    return (
      <Drawer
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#4fc3f7' }} />
            <span>{selectedChain?.name || 'Chain Details'} - Steps</span>
          </Space>
        }
        open={chainDetailVisible}
        onClose={() => setChainDetailVisible(false)}
        width={500}
      >
        {selectedChain ? (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Name">{selectedChain.name}</Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedChain.description || 'No description'}
              </Descriptions.Item>
              <Descriptions.Item label="Document Type">
                {selectedChain.document_type || 'All types'}
              </Descriptions.Item>
              <Descriptions.Item label="Module">
                {selectedChain.module || 'General'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedChain.is_active ? 'Active' : 'Inactive'}
              </Descriptions.Item>
              <Descriptions.Item label="Default">
                {selectedChain.is_default ? 'Yes' : 'No'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Approval Steps</Divider>

            {selectedChain.steps && selectedChain.steps.length > 0 ? (
              <Timeline>
                {selectedChain.steps.map((step, index) => (
                  <Timeline.Item key={index} color="blue">
                    <div>
                      <strong>Step {step.step_number || index + 1}: {step.name}</strong>
                      {step.description && (
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {step.description}
                        </div>
                      )}
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        <Tag color="blue">{step.approval_type || 'sequential'}</Tag>
                        <Tag>{step.assignee_type || 'role'}</Tag>
                        {step.assignee_name && <Tag>{step.assignee_name}</Tag>}
                        {step.timeout_days && (
                          <Tag color="orange">Timeout: {step.timeout_days}d</Tag>
                        )}
                        {step.requires_comment && (
                          <Tag color="green">Requires Comment</Tag>
                        )}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="No steps defined for this chain" />
            )}
          </div>
        ) : (
          <Empty description="No chain selected" />
        )}
      </Drawer>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="approval-chain" style={{ padding: embedded ? '0' : '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <SafetyCertificateOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
          <Title level={4} style={{ margin: 0 }}>Document Approval Chains</Title>
          <Badge status="processing" text="Live" />
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Tabs */}
      <Tabs defaultActiveKey="chains">
        <TabPane tab="Approval Chains" key="chains">
          {renderChains()}
        </TabPane>
        <TabPane 
          tab={
            <span>
              Pending Approvals
              {pendingApprovals.length > 0 && (
                <Badge count={pendingApprovals.length} style={{ marginLeft: 8 }} />
              )}
            </span>
          } 
          key="pending"
        >
          {renderPendingApprovals()}
        </TabPane>
      </Tabs>

      {/* Modals & Drawers */}
      {renderCreateModal()}
      {renderDetailDrawer()}
      {renderActionModal()}
      {renderChainDetailDrawer()}
    </div>
  );
};

export default ApprovalChain;