// src/components/incidents/CorrectiveActionTracker.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Tag, Space, Modal, Form, Input, Select,
  DatePicker, Row, Col, message, Progress, Tooltip, Badge,
  Statistic, Alert, Divider, Timeline, Avatar, List, Empty,
  Popconfirm, Drawer, Descriptions, InputNumber, Switch, Spin
} from 'antd';
import {
  PlusOutlined, CheckCircleOutlined, ClockCircleOutlined,
  WarningOutlined, EditOutlined, DeleteOutlined, UserOutlined,
  CalendarOutlined, PaperClipOutlined, CommentOutlined,
  SafetyCertificateOutlined, ToolOutlined, TeamOutlined,
  ExclamationCircleOutlined, SyncOutlined, StopOutlined,
  EyeOutlined, FileTextOutlined, ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// ✅ SERVICE IMPORTS
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const { TextArea } = Input;
const { Option } = Select;

// ==================== CONSTANTS ====================

const ACTION_TYPES = {
  immediate: { label: 'Immediate', color: 'red', icon: <ExclamationCircleOutlined /> },
  corrective: { label: 'Corrective', color: 'orange', icon: <ToolOutlined /> },
  preventive: { label: 'Preventive', color: 'blue', icon: <SafetyCertificateOutlined /> },
  improvement: { label: 'Improvement', color: 'green', icon: <CheckCircleOutlined /> }
};

const ACTION_STATUS = {
  pending: { label: 'Pending', color: 'default', icon: <ClockCircleOutlined /> },
  in_progress: { label: 'In Progress', color: 'processing', icon: <SyncOutlined /> },
  completed: { label: 'Completed', color: 'success', icon: <CheckCircleOutlined /> },
  verified: { label: 'Verified', color: 'green', icon: <SafetyCertificateOutlined /> },
  overdue: { label: 'Overdue', color: 'error', icon: <WarningOutlined /> },
  cancelled: { label: 'Cancelled', color: 'default', icon: <StopOutlined /> }
};

const PRIORITY_LEVELS = {
  critical: { label: 'Critical', color: 'red' },
  high: { label: 'High', color: 'orange' },
  medium: { label: 'Medium', color: 'gold' },
  low: { label: 'Low', color: 'green' }
};

// ==================== CORRECTIVE ACTION TRACKER ====================

const CorrectiveActionTracker = ({ 
  incident, 
  visible, 
  onClose,
  readOnly = false 
}) => {
  // ✅ Get current user
  const { user: currentUser } = useAuth();

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [form] = Form.useForm();
  const [filterStatus, setFilterStatus] = useState('all');

  // ==================== FETCH ACTIONS FROM API ====================

  const fetchActions = useCallback(async () => {
    if (!incident?.id) return;

    setLoading(true);
    try {
      const response = await notificationService.getCorrectiveActions(incident.id);
      
      const actionsData = 
        response?.actions || 
        response?.data?.actions || 
        (Array.isArray(response) ? response : []) || 
        [];

      setActions(actionsData);
    } catch (error) {
      console.error('Failed to fetch corrective actions:', error);
      // Fall back to incident data if available
      const savedActions = incident.custom_data?.corrective_actions || [];
      setActions(savedActions);
    } finally {
      setLoading(false);
    }
  }, [incident?.id, incident?.custom_data?.corrective_actions]);

  useEffect(() => {
    if (incident?.id && visible) {
      fetchActions();
    }
  }, [incident?.id, visible, fetchActions]);

  // ==================== STATS ====================

  const stats = {
    total: actions.length,
    completed: actions.filter(a => a.status === 'completed' || a.status === 'verified').length,
    inProgress: actions.filter(a => a.status === 'in_progress').length,
    pending: actions.filter(a => a.status === 'pending' || a.status === 'open').length,
    overdue: actions.filter(a => 
      a.due_date && 
      dayjs(a.due_date).isBefore(dayjs()) && 
      !['completed', 'verified', 'cancelled'].includes(a.status)
    ).length
  };

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  // ==================== SAVE ACTION ====================

  const handleSaveAction = async (values) => {
    if (!incident?.id) {
      message.warning('No incident selected');
      return;
    }

    setSaving(true);
    try {
      // ✅ Map form fields to backend field names (matches your existing model)
      const payload = {
        title: values.description?.substring(0, 200) || 'Corrective Action',
        description: values.description,
        action_type: values.type || 'corrective',
        priority: values.priority || 'medium',
        status: values.status || 'open',  // ← Your model uses 'open', not 'pending'
        assigned_to: values.assigned_to || currentUser?.id,
        due_date: values.dueDate?.toISOString(),
        estimated_cost: values.estimatedCost,
        notes: values.notes,
        department_id: values.department_id || incident.department_id
      };

      let response;
      if (editingAction) {
        // ✅ Update existing
        response = await notificationService.updateCorrectiveAction(
          editingAction.id, 
          payload
        );
      } else {
        // ✅ Create new
        response = await notificationService.createCorrectiveAction(
          incident.id, 
          payload
        );
      }

      const savedAction = response?.action || response?.data?.action || response;

      if (savedAction) {
        if (editingAction) {
          setActions(prev => prev.map(a => 
            a.id === editingAction.id ? { ...a, ...savedAction } : a
          ));
          message.success('Action updated');
        } else {
          setActions(prev => [...prev, savedAction]);
          message.success('Action added');
        }
      } else {
        // Optimistic fallback
        const fallbackAction = {
          id: editingAction?.id || Date.now().toString(),
          action_number: `CA-${Date.now()}`,
          ...payload,
          due_date: values.dueDate?.toISOString(),
          created_at: editingAction?.created_at || new Date().toISOString()
        };

        if (editingAction) {
          setActions(prev => prev.map(a => 
            a.id === editingAction.id ? fallbackAction : a
          ));
        } else {
          setActions(prev => [...prev, fallbackAction]);
        }
        message.success(editingAction ? 'Action updated' : 'Action added');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingAction(null);
    } catch (error) {
      console.error('Failed to save action:', error);
      message.error(error?.message || 'Failed to save corrective action');
    } finally {
      setSaving(false);
    }
  };

  // ==================== DELETE ACTION ====================

  const handleDelete = async (actionId) => {
    try {
      await notificationService.deleteCorrectiveAction(actionId);
      setActions(prev => prev.filter(a => a.id !== actionId));
      message.success('Action deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      message.error('Failed to delete action');
    }
  };

  // ==================== UPDATE STATUS ====================

  const handleStatusChange = async (actionId, newStatus) => {
    // Optimistic update
    const oldActions = [...actions];
    setActions(prev => prev.map(a => 
      a.id === actionId 
        ? { ...a, status: newStatus, updated_at: new Date().toISOString() }
        : a
    ));

    try {
      await notificationService.updateCorrectiveActionStatus(actionId, newStatus);
      message.success(`Status updated to ${ACTION_STATUS[newStatus]?.label || newStatus}`);
    } catch (error) {
      console.error('Status update failed:', error);
      // Revert
      setActions(oldActions);
      message.error('Failed to update status');
    }
  };

  // ==================== FILTERED ACTIONS ====================

  const filteredActions = filterStatus === 'all' 
    ? actions 
    : actions.filter(a => a.status === filterStatus);

  // ==================== TABLE COLUMNS ====================

  const columns = [
    {
      title: 'Action',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Tag color={ACTION_TYPES[record.action_type]?.color}>
              {ACTION_TYPES[record.action_type]?.icon} {ACTION_TYPES[record.action_type]?.label}
            </Tag>
            <Tag color={PRIORITY_LEVELS[record.priority]?.color}>
              {PRIORITY_LEVELS[record.priority]?.label}
            </Tag>
            {record.action_number && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.action_number}
              </Text>
            )}
          </Space>
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to_name',
      key: 'assigned_to_name',
      render: (text, record) => (text || record.assignee?.name) ? (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {text || record.assignee?.name}
        </Space>
      ) : <Tag>Unassigned</Tag>
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date, record) => {
        if (!date) return 'N/A';
        const isOverdue = dayjs(date).isBefore(dayjs()) && 
          !['completed', 'verified', 'cancelled'].includes(record.status);
        return (
          <Space>
            <CalendarOutlined />
            <span style={{ color: isOverdue ? '#f5222d' : 'inherit' }}>
              {dayjs(date).format('MMM DD, YYYY')}
            </span>
            {isOverdue && <Tag color="red">Overdue</Tag>}
          </Space>
        );
      },
      sorter: (a, b) => dayjs(a.due_date).unix() - dayjs(b.due_date).unix()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          size="small"
          style={{ width: 140 }}
          disabled={readOnly}
        >
          {Object.entries(ACTION_STATUS).map(([key, config]) => (
            <Option key={key} value={key}>
              <Tag color={config.color}>{config.icon} {config.label}</Tag>
            </Option>
          ))}
        </Select>
      ),
      filters: Object.entries(ACTION_STATUS).map(([key, config]) => ({
        text: config.label,
        value: key
      })),
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const progressMap = {
          open: 0,
          pending: 0,
          in_progress: 50,
          completed: 100,
          verified: 100,
          overdue: 25,
          cancelled: 0
        };
        return (
          <Progress 
            percent={record.progress_percentage || progressMap[record.status] || 0} 
            size="small" 
            status={record.status === 'overdue' ? 'exception' : 
              record.status === 'completed' || record.status === 'verified' ? 'success' : 'active'}
          />
        );
      }
    },
    {
      title: 'Actions',
      key: 'rowActions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View/Edit">
            <Button 
              type="link" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => {
                setEditingAction(record);
                form.setFieldsValue({
                  description: record.description || record.title,
                  type: record.action_type,
                  priority: record.priority,
                  status: record.status,
                  assigned_to: record.assigned_to,
                  dueDate: record.due_date ? dayjs(record.due_date) : null,
                  estimatedCost: record.estimated_cost,
                  notes: record.notes
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {!readOnly && (
            <Popconfirm
              title="Delete this action?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button 
                type="link" 
                size="small" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  // ==================== RENDER ====================

  return (
    <Drawer
      title={
        <Space>
          <ToolOutlined />
          Corrective Action Tracker
          {incident && (
            <Tag color="blue">{incident.incident_number || `#${incident.id}`}</Tag>
          )}
          <Badge count={actions.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      placement="right"
      width={1000}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Tooltip title="Refresh">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchActions}
              loading={loading}
              size="small"
            />
          </Tooltip>
          <Select 
            value={filterStatus} 
            onChange={setFilterStatus}
            style={{ width: 150 }}
            size="small"
          >
            <Option value="all">All Status</Option>
            {Object.entries(ACTION_STATUS).map(([key, config]) => (
              <Option key={key} value={key}>{config.label}</Option>
            ))}
          </Select>
          {!readOnly && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingAction(null);
                form.resetFields();
                form.setFieldsValue({
                  type: 'corrective',
                  priority: 'medium',
                  status: 'open',
                  dueDate: dayjs().add(7, 'day')
                });
                setModalVisible(true);
              }}
            >
              Add Action
            </Button>
          )}
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" tip="Loading corrective actions..." />
        </div>
      ) : (
        <>
          {/* Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Total Actions" 
                  value={stats.total}
                  prefix={<ToolOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Completed" 
                  value={stats.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="In Progress" 
                  value={stats.inProgress}
                  prefix={<SyncOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic 
                  title="Overdue" 
                  value={stats.overdue}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Progress Overview */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col span={4}>
                <Text strong>Overall Progress</Text>
              </Col>
              <Col span={16}>
                <Progress 
                  percent={completionRate} 
                  status={completionRate === 100 ? 'success' : 'active'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </Col>
              <Col span={4}>
                <Text>{stats.completed}/{stats.total} completed</Text>
              </Col>
            </Row>
          </Card>

          {/* Overdue Alert */}
          {stats.overdue > 0 && (
            <Alert
              message={`${stats.overdue} Overdue Action${stats.overdue > 1 ? 's' : ''}`}
              description="Some corrective actions are past their due date. Please review and update."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              action={
                <Button 
                  size="small" 
                  type="primary" 
                  danger
                  onClick={() => setFilterStatus('overdue')}
                >
                  View Overdue
                </Button>
              }
            />
          )}

          {/* Table */}
          {filteredActions.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredActions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
              rowClassName={(record) => {
                const isOverdue = record.due_date && 
                  dayjs(record.due_date).isBefore(dayjs()) && 
                  !['completed', 'verified', 'cancelled'].includes(record.status);
                return isOverdue ? 'overdue-row' : '';
              }}
            />
          ) : (
            <Empty 
              description="No corrective actions yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {!readOnly && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingAction(null);
                    form.resetFields();
                    form.setFieldsValue({
                      type: 'corrective',
                      priority: 'medium',
                      status: 'open',
                      dueDate: dayjs().add(7, 'day')
                    });
                    setModalVisible(true);
                  }}
                >
                  Add First Action
                </Button>
              )}
            </Empty>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={editingAction ? 'Edit Corrective Action' : 'Add Corrective Action'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingAction(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveAction}
          initialValues={{
            type: 'corrective',
            priority: 'medium',
            status: 'open'
          }}
        >
          <Form.Item
            name="description"
            label="Action Description"
            rules={[{ required: true, message: 'Please describe the action' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Describe the corrective action to be taken..."
              maxLength={5000}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Action Type"
                rules={[{ required: true }]}
              >
                <Select>
                  {Object.entries(ACTION_TYPES).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.icon} {config.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true }]}
              >
                <Select>
                  {Object.entries(PRIORITY_LEVELS).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Tag color={config.color}>{config.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assigned_to"
                label="Assigned To (User ID)"
                extra="Optional — leave blank to assign to yourself"
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  placeholder="User ID"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true, message: 'Due date is required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select>
                  {Object.entries(ACTION_STATUS).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.icon} {config.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="estimatedCost" label="Estimated Cost">
                <InputNumber 
                  style={{ width: '100%' }} 
                  prefix="$"
                  placeholder="0.00"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={2} placeholder="Additional notes..." maxLength={1000} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={saving}
              >
                {editingAction ? 'Update Action' : 'Add Action'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingAction(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        .overdue-row {
          background-color: #fff1f0 !important;
        }
      `}</style>
    </Drawer>
  );
};

export default CorrectiveActionTracker;