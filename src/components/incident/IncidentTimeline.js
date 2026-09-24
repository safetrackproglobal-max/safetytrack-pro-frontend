// src/components/incidents/IncidentTimeline.js
import React, { useState } from 'react';
import {
  Card, Timeline, Tag, Space, Button, Input, Select, DatePicker,
  TimePicker, Modal, Form, message, Avatar, Tooltip, Badge,
  Empty, Divider, Typography, Row, Col, List
} from 'antd';
import {
  ClockCircleOutlined, UserOutlined, MessageOutlined,
  CheckCircleOutlined, WarningOutlined, EditOutlined,
  DeleteOutlined, PlusOutlined, FileTextOutlined,
  PaperClipOutlined, TeamOutlined, ToolOutlined,
  SafetyCertificateOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

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
  closure: { color: 'default', icon: <CheckCircleOutlined />, label: 'Closed' }
};

// ==================== INCIDENT TIMELINE COMPONENT ====================

const IncidentTimeline = ({ 
  incident, 
  timelineEvents = [], 
  onAddEvent,
  readOnly = false 
}) => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingEvent, setEditingEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Combine incident data into timeline events
  const getTimelineEvents = () => {
    const events = [...timelineEvents];

    // Add incident creation if not present
    if (incident && !events.find(e => e.type === 'incident')) {
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

    // Sort by timestamp
    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const handleAddEvent = (values) => {
    const newEvent = {
      id: Date.now().toString(),
      ...values,
      timestamp: values.date.format('YYYY-MM-DD') + 'T' + values.time.format('HH:mm:ss'),
      user: values.user || 'Current User'
    };

    if (onAddEvent) {
      onAddEvent(newEvent);
    }
    
    setAddModalVisible(false);
    form.resetFields();
    message.success('Timeline event added');
  };

  const filteredEvents = filterType === 'all' 
    ? getTimelineEvents() 
    : getTimelineEvents().filter(e => e.type === filterType);

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
            style={{ width: 150 }}
            size="small"
          >
            <Option value="all">All Events</Option>
            {Object.entries(EVENT_TYPES).map(([key, config]) => (
              <Option key={key} value={key}>
                {config.icon} {config.label}
              </Option>
            ))}
          </Select>
          {!readOnly && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setAddModalVisible(true)}
              size="small"
            >
              Add Event
            </Button>
          )}
        </Space>
      }
    >
      {filteredEvents.length > 0 ? (
        <Timeline mode="left">
          {filteredEvents.map((event, index) => {
            const config = EVENT_TYPES[event.type] || EVENT_TYPES.comment;
            
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
                        <Text strong>{event.title}</Text>
                        {event.description && (
                          <Text type="secondary">{event.description}</Text>
                        )}
                      </Space>
                    </Col>
                    {!readOnly && (
                      <Col>
                        <Space>
                          <Tooltip title="Edit">
                            <Button 
                              type="link" 
                              size="small" 
                              icon={<EditOutlined />}
                              onClick={() => {
                                setEditingEvent(event);
                                // Open edit modal
                              }}
                            />
                          </Tooltip>
                        </Space>
                      </Col>
                    )}
                  </Row>
                  
                  <Divider style={{ margin: '8px 0' }} />
                  
                  <Space size="large">
                    <Tooltip title={dayjs(event.timestamp).format('YYYY-MM-DD HH:mm:ss')}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined /> {dayjs(event.timestamp).fromNow()}
                      </Text>
                    </Tooltip>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <UserOutlined /> {event.user || 'System'}
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
            <Select>
              {Object.entries(EVENT_TYPES).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.icon} {config.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true }]}
          >
            <Input placeholder="Event title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Event details..." />
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

          <Form.Item
            name="user"
            label="Performed By"
          >
            <Input prefix={<UserOutlined />} placeholder="Name" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Event
              </Button>
              <Button onClick={() => setAddModalVisible(false)}>
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