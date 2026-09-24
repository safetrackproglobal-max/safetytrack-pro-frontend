// src/components/incidents/CorrectiveActionTracker.js
import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Tag, Space, Modal, Form, Input, Select,
  DatePicker, Row, Col, message, Progress, Tooltip, Badge,
  Statistic, Alert, Divider, Timeline, Avatar, List, Empty,
  Popconfirm, Drawer, Descriptions, InputNumber, Switch
} from 'antd';
import {
  PlusOutlined, CheckCircleOutlined, ClockCircleOutlined,
  WarningOutlined, EditOutlined, DeleteOutlined, UserOutlined,
  CalendarOutlined, PaperClipOutlined, CommentOutlined,
  SafetyCertificateOutlined, ToolOutlined, TeamOutlined,
  ExclamationCircleOutlined, SyncOutlined, StopOutlined,
  EyeOutlined, FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

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
  in_progress: { label: 'In Progress', color: 'processing', icon: <SyncOutlined spin /> },
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
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState('table');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load actions from incident data
  useEffect(() => {
    if (incident) {
      const savedActions = incident.custom_data?.corrective_actions || [];
      setActions(savedActions);
    }
  }, [incident]);

  // Calculate statistics
  const stats = {
    total: actions.length,
    completed: actions.filter(a => a.status === 'completed' || a.status === 'verified').length,
    inProgress: actions.filter(a => a.status === 'in_progress').length,
    pending: actions.filter(a => a.status === 'pending').length,
    overdue: actions.filter(a => a.dueDate && dayjs(a.dueDate).isBefore(dayjs()) && 
      !['completed', 'verified', 'cancelled'].includes(a.status)).length
  };

  const completionRate = stats.total > 0 
    ? Math.round(((stats.completed) / stats.total) * 100) 
    : 0;

  // Handle add/edit action
  const handleSaveAction = (values) => {
    const actionData = {
      id: editingAction?.id || Date.now().toString(),
      ...values,
      dueDate: values.dueDate?.toISOString(),
      createdAt: editingAction?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingAction) {
      setActions(prev => prev.map(a => a.id === editingAction.id ? actionData : a));
      message.success('Action updated');
    } else {
      setActions(prev => [...prev, actionData]);
      message.success('Action added');
    }

    setModalVisible(false);
    form.resetFields();
    setEditingAction(null);
  };

  // Handle delete
  const handleDelete = (actionId) => {
    setActions(prev => prev.filter(a => a.id !== actionId));
    message.success('Action deleted');
  };

  // Handle status change
  const handleStatusChange = (actionId, newStatus) => {
    setActions(prev => prev.map(a => 
      a.id === actionId 
        ? { ...a, status: newStatus, updatedAt: new Date().toISOString() }
        : a
    ));
    message.success(`Status updated to ${ACTION_STATUS[newStatus]?.label}`);
  };

  // Save all actions to incident
  const handleSaveAll = () => {
    // This would call your API to save
    message.success('Corrective actions saved');
  };

  // Get filtered actions
  const filteredActions = filterStatus === 'all' 
    ? actions 
    : actions.filter(a => a.status === filterStatus);

  // Table columns
  const columns = [
    {
      title: 'Action',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Tag color={ACTION_TYPES[record.type]?.color}>
              {ACTION_TYPES[record.type]?.icon} {ACTION_TYPES[record.type]?.label}
            </Tag>
            <Tag color={PRIORITY_LEVELS[record.priority]?.color}>
              {PRIORITY_LEVELS[record.priority]?.label}
            </Tag>
          </Space>
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (text) => text ? (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {text}
        </Space>
      ) : <Tag>Unassigned</Tag>
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
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
      sorter: (a, b) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix()
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
          style={{ width: 130 }}
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
          pending: 0,
          in_progress: 50,
          completed: 100,
          verified: 100,
          overdue: 25,
          cancelled: 0
        };
        return (
          <Progress 
            percent={progressMap[record.status] || 0} 
            size="small" 
            status={record.status === 'overdue' ? 'exception' : 
              record.status === 'completed' || record.status === 'verified' ? 'success' : 'active'}
          />
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="link" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => {
                setEditingAction(record);
                form.setFieldsValue({
                  ...record,
                  dueDate: record.dueDate ? dayjs(record.dueDate) : null
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {!readOnly && (
            <>
              <Tooltip title="Edit">
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingAction(record);
                    form.setFieldsValue({
                      ...record,
                      dueDate: record.dueDate ? dayjs(record.dueDate) : null
                    });
                    setModalVisible(true);
                  }}
                />
              </Tooltip>
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
            </>
          )}
        </Space>
      )
    }
  ];

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
                setModalVisible(true);
              }}
            >
              Add Action
            </Button>
          )}
        </Space>
      }
    >
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

      {/* Alert for overdue actions */}
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

      {/* Actions Table */}
      {filteredActions.length > 0 ? (
        <Table
          columns={columns}
          dataSource={filteredActions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
          rowClassName={(record) => {
            const isOverdue = record.dueDate && dayjs(record.dueDate).isBefore(dayjs()) && 
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
                setModalVisible(true);
              }}
            >
              Add First Action
            </Button>
          )}
        </Empty>
      )}

      {/* Add/Edit Action Modal */}
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
            status: 'pending'
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
                name="assignedTo"
                label="Assigned To"
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Person responsible"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Due Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
              >
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
              <Form.Item
                name="estimatedCost"
                label="Estimated Cost"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  prefix="$"
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={2} placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
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