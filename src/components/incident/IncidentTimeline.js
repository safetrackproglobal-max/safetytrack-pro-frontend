// src/components/incidents/IncidentTimeline.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Timeline, Tag, Space, Button, Input, Select, DatePicker,
  TimePicker, Modal, Form, message, Avatar, Tooltip, Badge,
  Empty, Divider, Typography, Row, Col, List, Spin
} from 'antd';
import {
  ClockCircleOutlined, UserOutlined, MessageOutlined,
  CheckCircleOutlined, WarningOutlined, EditOutlined,
  DeleteOutlined, PlusOutlined, FileTextOutlined,
  PaperClipOutlined, TeamOutlined, ToolOutlined,
  SafetyCertificateOutlined, EnvironmentOutlined, ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// ✅ SERVICE IMPORTS
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

// ==================== TIMELINE EVENT TYPES ====================

const EVENT_TYPES = {
  incident: { color: 'red', icon: <WarningOutlined />, label: 'Incident Occurred' },
  report: { color: 'blue', icon: <FileTextOutlined />, label: 'Reported' },
  notification: { color: 'orange', icon: <MessageOutlined />, label: 'Notification Sent' },
  investigation_start: { color: 'purple', icon: <ToolOutlined />, label: 'Investigation Started' },
  interview: { color: 'cyan', icon: <TeamOutlined />, label: 'Interview Conducted' },
  evidence: { color: 'geekblue', icon: <PaperClipOutlined />, label: 'Evidence Collected' },
  root_cause: { color: 'magenta', icon: <SafetyCertificateOutlined />, label: 'Root Cause Identified' },
  action: { color: 'green', icon: <CheckCircleOutlined />, label: 'Corrective Action' },
  status_change: { color: 'gold', icon: <EditOutlined />, label: 'Status Changed' },
  comment: { color: 'default', icon: <MessageOutlined />, label: 'Comment Added' },
  attachment: { color: 'blue', icon: <PaperClipOutlined />, label: 'File Attached' },
  resolution: { color: 'green', icon: <CheckCircleOutlined />, label: 'Resolved' },
  closure: { color: 'default', icon: <CheckCircleOutlined />, label: 'Closed' },
  fishbone_updated: { color: 'purple', icon: <ToolOutlined />, label: 'Fishbone Updated' },
  corrective_action_created: { color: 'green', icon: <CheckCircleOutlined />, label: 'Corrective Action Created' },
  corrective_action_updated: { color: 'green', icon: <EditOutlined />, label: 'Corrective Action Updated' },
  witness_statement_added: { color: 'cyan', icon: <FileTextOutlined />, label: 'Witness Statement Added' },
  team_member_added: { color: 'blue', icon: <TeamOutlined />, label: 'Team Member Added' },
  team_member_removed: { color: 'red', icon: <TeamOutlined />, label: 'Team Member Removed' },
  escalated: { color: 'red', icon: <WarningOutlined />, label: 'Escalated' },
  comment_added: { color: 'default', icon: <MessageOutlined />, label: 'Comment Added' },
  updated: { color: 'gold', icon: <EditOutlined />, label: 'Updated' }
};

// ==================== INCIDENT TIMELINE COMPONENT ====================

const IncidentTimeline = ({ 
  incident, 
  timelineEvents = [], 
  onAddEvent,
  readOnly = false 
}) => {
  // ✅ Get current user
  const { user: currentUser } = useAuth();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEvent, setEditingEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [serverEvents, setServerEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ==================== FETCH TIMELINE FROM API ====================

  const fetchTimeline = useCallback(async () => {
    if (!incident?.id) return;

    setLoading(true);
    try {
      const response = await notificationService.getIncidentTimeline(incident.id);
      
      const events = 
        response?.timeline || 
        response?.events || 
        response?.data?.timeline || 
        (Array.isArray(response) ? response : []) || 
        [];

      setServerEvents(events);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      // Fall back to prop-supplied events
      setServerEvents(timelineEvents);
    } finally {
      setLoading(false);
    }
  }, [incident?.id, timelineEvents]);

  useEffect(() => {
    if (incident?.id) {
      fetchTimeline();
    }
  }, [incident?.id, fetchTimeline]);

  // ==================== COMBINE EVENTS ====================

  const getTimelineEvents = () => {
    const events = [...serverEvents];

    // Add incident creation if not present
    if (incident && !events.find(e => e.type === 'incident' || e.action === 'created')) {
      events.push({
        id: 'incident-created',
        type: 'incident',
        title: 'Incident Occurred',
        description: incident.description,
        timestamp: incident.date_occurred || incident.created_at,
        user: incident.reported_by_name || incident.reported_by,
        data: { severity: incident.severity, location: incident.location }
      });
    }

    // Add report event
    if (incident && !events.find(e => e.type === 'report')) {
      events.push({
        id: 'incident-reported',
        type: 'report',
        title: 'Incident Reported',
        description: `Reported by ${incident.reported_by_name || incident.reported_by}`,
        timestamp: incident.created_at,
        user: incident.reported_by_name || incident.reported_by
      });
    }

    // Sort by timestamp (newest first)
    return events.sort((a, b) => 
      new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at)
    );
  };

  // ==================== ADD EVENT ====================

  const handleAddEvent = async (values) => {
    if (!incident?.id) {
      message.warning('No incident selected');
      return;
    }

    setSaving(true);
    try {
      const timestamp = values.date.format('YYYY-MM-DD') + 'T' + 
                        values.time.format('HH:mm:ss') + 'Z';

      const eventPayload = {
        type: values.type,
        title: values.title,
        description: values.description,
        timestamp: timestamp,
        user: values.user || currentUser?.name || currentUser?.email || 'Current User',
        data: values.data || {}
      };

      const response = await notificationService.addTimelineEvent(
        incident.id, 
        eventPayload
      );

      if (response?.success || response?.event) {
        message.success('Timeline event added');
        
        // Update local state
        const newEvent = response?.event || {
          id: Date.now().toString(),
          ...eventPayload
        };
        setServerEvents(prev => [newEvent, ...prev]);
        
        // Also notify parent
        if (onAddEvent) onAddEvent(newEvent);
      } else {
        throw new Error(response?.error || 'Failed to add event');
      }

      setAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to add timeline event:', error);
      message.error(error?.message || 'Failed to add timeline event');
    } finally {
      setSaving(false);
    }
  };

  // ==================== DELETE EVENT ====================

  const handleDeleteEvent = async (eventId) => {
    if (!incident?.id) return;
    
    try {
      await notificationService.deleteTimelineEvent(incident.id, eventId);
      setServerEvents(prev => prev.filter(e => e.id !== eventId));
      message.success('Event deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      message.error('Failed to delete event');
    }
  };

  // ==================== FILTER ====================

  const allEvents = getTimelineEvents();
  const filteredEvents = filterType === 'all' 
    ? allEvents 
    : allEvents.filter(e => (e.type || e.action) === filterType);

  // ==================== RENDER ====================

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined />
          <span>Incident Timeline</span>
          <Badge count={filteredEvents.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      extra={
        <Space>
          <Select 
            value={filterType} 
            onChange={setFilterType}
            style={{ width: 180 }}
            size="small"
          >
            <Option value="all">All Events</Option>
            {Object.entries(EVENT_TYPES).map(([key, config]) => (
              <Option key={key} value={key}>
                {config.icon} {config.label}
              </Option>
            ))}
          </Select>
          <Tooltip title="Refresh">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchTimeline}
              loading={loading}
              size="small"
            />
          </Tooltip>
          {!readOnly && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                form.setFieldsValue({
                  date: dayjs(),
                  time: dayjs()
                });
                setAddModalVisible(true);
              }}
              size="small"
            >
              Add Event
            </Button>
          )}
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin tip="Loading timeline..." />
        </div>
      ) : filteredEvents.length > 0 ? (
        <Timeline mode="left">
          {filteredEvents.map((event, index) => {
            const eventType = event.type || event.action || 'comment';
            const config = EVENT_TYPES[eventType] || EVENT_TYPES.comment;
            const timestamp = event.timestamp || event.created_at;
            const eventUser = event.user || event.user_name || 'System';
            
            return (
              <Timeline.Item
                key={event.id || index}
                color={config.color}
                dot={
                  <Tooltip title={config.label}>
                    <Avatar 
                      size="small" 
                      style={{ backgroundColor: config.color }}
                      icon={config.icon}
                    />
                  </Tooltip>
                }
              >
                <Card size="small" style={{ marginBottom: 8 }}>
                  <Row justify="space-between" align="top">
                    <Col>
                      <Space direction="vertical" size={4}>
                        <Space>
                          <Tag color={config.color}>{config.label}</Tag>
                          {event.severity && (
                            <Tag color={
                              event.severity === 'critical' ? 'red' :
                              event.severity === 'high' ? 'orange' : 'blue'
                            }>
                              {event.severity}
                            </Tag>
                          )}
                        </Space>
                        <Text strong>{event.title || event.description}</Text>
                        {event.description && event.title && (
                          <Text type="secondary">{event.description}</Text>
                        )}
                      </Space>
                    </Col>
                    {!readOnly && (
                      <Col>
                        <Space>
                          <Tooltip title="Delete">
                            <Button 
                              type="link" 
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteEvent(event.id)}
                            />
                          </Tooltip>
                        </Space>
                      </Col>
                    )}
                  </Row>
                  
                  <Divider style={{ margin: '8px 0' }} />
                  
                  <Space size="large">
                    <Tooltip title={dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined /> {dayjs(timestamp).fromNow()}
                      </Text>
                    </Tooltip>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <UserOutlined /> {eventUser}
                    </Text>
                    {event.attachments?.length > 0 && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <PaperClipOutlined /> {event.attachments.length} files
                      </Text>
                    )}
                  </Space>
                </Card>
              </Timeline.Item>
            );
          })}
        </Timeline>
      ) : (
        <Empty 
          description="No timeline events" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {/* Add Event Modal */}
      <Modal
        title="Add Timeline Event"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEvent}
        >
          <Form.Item
            name="type"
            label="Event Type"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select event type">
              {Object.entries(EVENT_TYPES)
                .filter(([key]) => !['incident', 'report', 'corrective_action_created', 'corrective_action_updated'].includes(key))
                .map(([key, config]) => (
                  <Option key={key} value={key}>
                    {config.icon} {config.label}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input placeholder="Event title" maxLength={200} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Event details..." maxLength={1000} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Time"
                rules={[{ required: true }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="user" label="Performed By">
            <Input 
              prefix={<UserOutlined />} 
              placeholder={currentUser?.name || 'Current User'}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={saving}
              >
                Add Event
              </Button>
              <Button onClick={() => {
                setAddModalVisible(false);
                form.resetFields();
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

export default IncidentTimeline;