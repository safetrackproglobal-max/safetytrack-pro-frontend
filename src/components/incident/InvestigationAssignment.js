// src/components/incidents/InvestigationAssignment.js
import React, { useState } from 'react';
import {
  Card, Form, Select, Button, Space, message, Avatar, Tag,
  Row, Col, DatePicker, Input, Alert, List, Tooltip, Badge,
  Divider, Modal, Descriptions, Timeline, Empty, Statistic,
  Progress, Switch, InputNumber, Radio
} from 'antd';
import {
  UserOutlined, TeamOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, WarningOutlined, PlusOutlined, DeleteOutlined,
  EditOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined,
  ToolOutlined, FileTextOutlined, BellOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

// ==================== INVESTIGATION ASSIGNMENT COMPONENT ====================

const InvestigationAssignment = ({ 
  incident, 
  users = [], 
  onAssign,
  readOnly = false 
}) => {
  const [form] = Form.useForm();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Initialize assignments from incident
  React.useEffect(() => {
    if (incident) {
      const saved = incident.custom_data?.investigation_team || [];
      setAssignments(saved);
    }
  }, [incident]);

  // Handle assignment
  const handleAssign = (values) => {
    const assignment = {
      id: editingAssignment?.id || Date.now().toString(),
      userId: values.userId,
      userName: users.find(u => u.id === values.userId)?.name || values.userId,
      role: values.role,
      responsibilities: values.responsibilities,
      assignedAt: new Date().toISOString(),
      dueDate: values.dueDate?.toISOString(),
      status: 'active',
      notifications: values.notifications
    };

    if (editingAssignment) {
      setAssignments(prev => prev.map(a => 
        a.id === editingAssignment.id ? assignment : a
      ));
      message.success('Assignment updated');
    } else {
      setAssignments(prev => [...prev, assignment]);
      message.success('Investigator assigned');
    }

    setModalVisible(false);
    form.resetFields();
    setEditingAssignment(null);
  };

  // Handle remove
  const handleRemove = (assignmentId) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    message.success('Assignment removed');
  };

  // Get role configuration
  const getRoleConfig = (role) => {
    const roles = {
      lead: { label: 'Lead Investigator', color: 'red', icon: <SafetyCertificateOutlined /> },
      investigator: { label: 'Investigator', color: 'blue', icon: <UserOutlined /> },
      witness: { label: 'Witness Coordinator', color: 'orange', icon: <TeamOutlined /> },
      expert: { label: 'Subject Matter Expert', color: 'purple', icon: <ToolOutlined /> },
      observer: { label: 'Observer', color: 'default', icon: <UserOutlined /> }
    };
    return roles[role] || roles.investigator;
  };

  return (
    <Card
      title={
        <Space>
          <TeamOutlined />
          <span>Investigation Team</span>
          <Badge count={assignments.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      extra={
        !readOnly && (
          <Button 
            type="primary" 
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingAssignment(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Assign Investigator
          </Button>
        )
      }
      size="small"
    >
      {assignments.length > 0 ? (
        <List
          dataSource={assignments}
          renderItem={(assignment) => {
            const roleConfig = getRoleConfig(assignment.role);
            const isOverdue = assignment.dueDate && 
              dayjs(assignment.dueDate).isBefore(dayjs()) && 
              assignment.status === 'active';

            return (
              <List.Item
                actions={!readOnly ? [
                  <Tooltip title="Edit">
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingAssignment(assignment);
                        form.setFieldsValue({
                          ...assignment,
                          dueDate: assignment.dueDate ? dayjs(assignment.dueDate) : null
                        });
                        setModalVisible(true);
                      }}
                    />
                  </Tooltip>,
                  <Tooltip title="Remove">
                    <Button 
                      type="link" 
                      size="small" 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemove(assignment.id)}
                    />
                  </Tooltip>
                ] : []}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      style={{ backgroundColor: roleConfig.color }}
                      icon={roleConfig.icon}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{assignment.userName}</Text>
                      <Tag color={roleConfig.color}>
                        {roleConfig.icon} {roleConfig.label}
                      </Tag>
                      {isOverdue && (
                        <Tag color="red" icon={<WarningOutlined />}>Overdue</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      {assignment.responsibilities && (
                        <Text type="secondary">{assignment.responsibilities}</Text>
                      )}
                      <Space size="large">
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ClockCircleOutlined /> Assigned {dayjs(assignment.assignedAt).fromNow()}
                        </Text>
                        {assignment.dueDate && (
                          <Text 
                            type="secondary" 
                            style={{ 
                              fontSize: 12,
                              color: isOverdue ? '#f5222d' : undefined
                            }}
                          >
                            <CalendarOutlined /> Due {dayjs(assignment.dueDate).format('MMM DD, YYYY')}
                          </Text>
                        )}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No investigators assigned"
        >
          {!readOnly && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingAssignment(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Assign First Investigator
            </Button>
          )}
        </Empty>
      )}

      {/* Assignment Modal */}
      <Modal
        title={editingAssignment ? 'Edit Assignment' : 'Assign Investigator'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingAssignment(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssign}
          initialValues={{
            role: 'investigator',
            notifications: true
          }}
        >
          <Form.Item
            name="userId"
            label="Select User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select
              showSearch
              placeholder="Search users..."
              optionFilterProp="children"
            >
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    {user.name || user.email}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="lead">
                <Tag color="red" icon={<SafetyCertificateOutlined />}>Lead Investigator</Tag>
              </Option>
              <Option value="investigator">
                <Tag color="blue" icon={<UserOutlined />}>Investigator</Tag>
              </Option>
              <Option value="witness">
                <Tag color="orange" icon={<TeamOutlined />}>Witness Coordinator</Tag>
              </Option>
              <Option value="expert">
                <Tag color="purple" icon={<ToolOutlined />}>Subject Matter Expert</Tag>
              </Option>
              <Option value="observer">
                <Tag icon={<UserOutlined />}>Observer</Tag>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="responsibilities"
            label="Responsibilities"
          >
            <TextArea 
              rows={2} 
              placeholder="Specific responsibilities for this investigation..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Due Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="notifications"
                label="Send Notification"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAssignment ? 'Update Assignment' : 'Assign'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingAssignment(null);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default InvestigationAssignment;