// src/components/incidents/InvestigationAssignment.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Form, Select, Button, Space, message, Avatar, Tag,
  Row, Col, DatePicker, Input, Alert, List, Tooltip, Badge,
  Divider, Modal, Descriptions, Timeline, Empty, Statistic,
  Progress, Switch, InputNumber, Radio, Spin
} from 'antd';
import {
  UserOutlined, TeamOutlined, CalendarOutlined, ClockCircleOutlined,
  CheckCircleOutlined, WarningOutlined, PlusOutlined, DeleteOutlined,
  EditOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined,
  ToolOutlined, FileTextOutlined, BellOutlined, ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// ✅ SERVICE IMPORTS
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Option } = Select;

// ==================== ROLE CONFIG ====================

const ROLE_CONFIG = {
  lead: { label: 'Lead Investigator', color: 'red', icon: <SafetyCertificateOutlined /> },
  investigator: { label: 'Investigator', color: 'blue', icon: <UserOutlined /> },
  witness: { label: 'Witness Coordinator', color: 'orange', icon: <TeamOutlined /> },
  expert: { label: 'Subject Matter Expert', color: 'purple', icon: <ToolOutlined /> },
  observer: { label: 'Observer', color: 'default', icon: <UserOutlined /> }
};

// ==================== INVESTIGATION ASSIGNMENT COMPONENT ====================

const InvestigationAssignment = ({ 
  incident, 
  users = [], 
  onAssign,
  readOnly = false 
}) => {
  // ✅ Get current user from context
  const { user: currentUser } = useAuth();

  const [form] = Form.useForm();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // ==================== FETCH TEAM ====================

  const fetchTeam = useCallback(async () => {
    if (!incident?.id) return;

    setLoading(true);
    try {
      const response = await notificationService.getInvestigationTeam(incident.id);

      const members = 
        response?.members || 
        response?.team || 
        response?.data?.members || 
        (Array.isArray(response) ? response : []) || 
        [];

      setAssignments(members);
    } catch (error) {
      console.error('Failed to fetch investigation team:', error);
      // Fallback to incident data
      const saved = incident.custom_data?.investigation_team || [];
      setAssignments(saved);
    } finally {
      setLoading(false);
    }
  }, [incident?.id, incident?.custom_data?.investigation_team]);

  useEffect(() => {
    if (incident?.id) {
      fetchTeam();
    }
  }, [incident?.id, fetchTeam]);

  // ==================== ASSIGN ====================

  const handleAssign = async (values) => {
    if (!incident?.id) {
      message.warning('No incident selected');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        user_id: values.userId,
        role: values.role,
        responsibilities: values.responsibilities,
        due_date: values.dueDate?.toISOString(),
        notifications: values.notifications
      };

      const response = await notificationService.addInvestigationTeamMember(
        incident.id, 
        payload
      );

      const savedMember = response?.member || response?.data?.member || response;

      if (savedMember) {
        setAssignments(prev => [...prev, savedMember]);
        message.success('Investigator assigned');
        
        if (onAssign) onAssign(savedMember);
      } else {
        // Optimistic fallback
        const fallback = {
          id: Date.now().toString(),
          user_id: values.userId,
          user_name: users.find(u => u.id === values.userId)?.name || 'Unknown',
          user_email: users.find(u => u.id === values.userId)?.email,
          role: values.role,
          responsibilities: values.responsibilities,
          assigned_at: new Date().toISOString(),
          due_date: values.dueDate?.toISOString(),
          status: 'active'
        };
        setAssignments(prev => [...prev, fallback]);
        message.success('Investigator assigned');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingAssignment(null);
    } catch (error) {
      console.error('Failed to assign investigator:', error);
      message.error(error?.message || 'Failed to assign investigator');
    } finally {
      setSaving(false);
    }
  };

  // ==================== REMOVE ====================

  const handleRemove = async (assignmentId) => {
    if (!incident?.id) return;

    // Optimistic
    const previous = [...assignments];
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));

    try {
      await notificationService.removeInvestigationTeamMember(incident.id, assignmentId);
      message.success('Assignment removed');
    } catch (error) {
      console.error('Failed to remove:', error);
      setAssignments(previous);
      message.error('Failed to remove assignment');
    }
  };

  // ==================== HELPERS ====================

  const getRoleConfig = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.investigator;

  // ==================== RENDER ====================

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
        <Space>
          <Tooltip title="Refresh">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchTeam}
              loading={loading}
              size="small"
            />
          </Tooltip>
          {!readOnly && (
            <Button 
              type="primary" 
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingAssignment(null);
                form.resetFields();
                form.setFieldsValue({
                  role: 'investigator',
                  notifications: true
                });
                setModalVisible(true);
              }}
            >
              Assign Investigator
            </Button>
          )}
        </Space>
      }
      size="small"
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin tip="Loading team..." />
        </div>
      ) : assignments.length > 0 ? (
        <List
          dataSource={assignments}
          renderItem={(assignment) => {
            const roleConfig = getRoleConfig(assignment.role);
            const dueDate = assignment.due_date || assignment.dueDate;
            const assignedAt = assignment.assigned_at || assignment.assignedAt;
            const userName = assignment.user_name || assignment.userName;
            const isOverdue = dueDate && 
              dayjs(dueDate).isBefore(dayjs()) && 
              assignment.status === 'active';

            return (
              <List.Item
                actions={!readOnly ? [
                  <Tooltip title="Remove" key="remove">
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
                      style={{ backgroundColor: roleConfig.color === 'default' ? '#8c8c8c' : undefined }}
                      icon={roleConfig.icon}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{userName}</Text>
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
                        {assignedAt && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined /> Assigned {dayjs(assignedAt).fromNow()}
                          </Text>
                        )}
                        {dueDate && (
                          <Text 
                            type="secondary" 
                            style={{ 
                              fontSize: 12,
                              color: isOverdue ? '#f5222d' : undefined
                            }}
                          >
                            <CalendarOutlined /> Due {dayjs(dueDate).format('MMM DD, YYYY')}
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
                form.setFieldsValue({ role: 'investigator', notifications: true });
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
              {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Tag color={config.color} icon={config.icon}>
                    {config.label}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="responsibilities"
            label="Responsibilities"
          >
            <TextArea 
              rows={2} 
              placeholder="Specific responsibilities for this investigation..."
              maxLength={500}
              showCount
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
              <Button 
                type="primary" 
                htmlType="submit"
                loading={saving}
              >
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