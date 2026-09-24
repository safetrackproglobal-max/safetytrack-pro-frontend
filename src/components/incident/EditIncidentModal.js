// src/components/incidents/EditIncidentModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Input, Select, DatePicker, TimePicker, Row, Col,
  Button, Space, message, Divider, Alert, InputNumber, Tag,
  Collapse, Steps, Result, Spin
} from 'antd';
import {
  EditOutlined, SaveOutlined, CloseOutlined, WarningOutlined,
  EnvironmentOutlined, UserOutlined, CalendarOutlined,
  ClockCircleOutlined, AlertOutlined, HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import notificationService from '../../services/notificationService';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// ==================== EDIT INCIDENT MODAL ====================

const EditIncidentModal = ({ 
  visible, 
  incident, 
  onClose, 
  onSuccess,
  industries = [],
  industryConfigs = {},
  user 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState(null);

  // Initialize form when incident changes
  useEffect(() => {
    if (incident && visible) {
      const industry = industries.find(i => 
        i.id === incident.industry_id || i.name === incident.industryName
      );
      setSelectedIndustry(industry);
      
      const initialValues = {
        title: incident.title,
        description: incident.description,
        incidentType: incident.incident_type || incident.incidentType,
        severity: incident.severity,
        status: incident.status,
        date: incident.date_occurred ? dayjs(incident.date_occurred) : null,
        time: incident.date_occurred ? dayjs(incident.date_occurred) : null,
        location: incident.location,
        department: incident.department,
        incident_category: incident.incident_category,
        reporter_name: incident.custom_data?.reporter_name || incident.reported_by_name,
        injured_persons: incident.custom_data?.injured_persons || incident.injured_persons,
        witnesses: incident.custom_data?.witnesses || incident.witnesses,
        persons_involved: incident.custom_data?.persons_involved,
        immediate_actions: incident.custom_data?.immediate_actions,
        additional_notes: incident.custom_data?.additional_notes,
        ...incident.custom_data
      };
      
      form.setFieldsValue(initialValues);
      setOriginalValues(initialValues);
      setHasChanges(false);
    }
  }, [incident, visible, form, industries]);

  // Track form changes
  const handleValuesChange = (changedValues, allValues) => {
    setHasChanges(true);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Combine date and time
      const dateOccurred = values.date && values.time
        ? dayjs(values.date.format('YYYY-MM-DD') + 'T' + values.time.format('HH:mm:ss')).toISOString()
        : incident.date_occurred;

      const updateData = {
        id: incident.id,
        title: values.title,
        description: values.description,
        incident_type: values.incidentType,
        severity: values.severity,
        status: values.status,
        date_occurred: dateOccurred,
        location: values.location,
        department: values.department,
        incident_category: values.incident_category,
        custom_data: {
          ...incident.custom_data,
          reporter_name: values.reporter_name,
          injured_persons: values.injured_persons,
          witnesses: values.witnesses,
          persons_involved: values.persons_involved,
          immediate_actions: values.immediate_actions,
          additional_notes: values.additional_notes,
          // Industry-specific fields
          ...Object.keys(values)
            .filter(key => !['title', 'description', 'incidentType', 'severity', 'status', 
              'date', 'time', 'location', 'department', 'incident_category',
              'reporter_name', 'injured_persons', 'witnesses', 'persons_involved',
              'immediate_actions', 'additional_notes'].includes(key))
            .reduce((acc, key) => ({ ...acc, [key]: values[key] }), {})
        },
        updated_by: user?.id,
        updated_by_name: user?.name || user?.email,
        updated_at: new Date().toISOString()
      };

      // Track what changed for audit
      const changes = [];
      Object.keys(values).forEach(key => {
        if (originalValues && originalValues[key] !== values[key]) {
          changes.push({
            field: key,
            oldValue: originalValues[key],
            newValue: values[key]
          });
        }
      });

      const response = await notificationService.updateIncident(incident.id, updateData);
      
      if (response.success) {
        message.success('Incident updated successfully');
        
        // Log the changes for audit trail
        if (changes.length > 0 && notificationService.logIncidentChange) {
          await notificationService.logIncidentChange(incident.id, {
            changes,
            updatedBy: user?.id,
            updatedByName: user?.name || user?.email,
            timestamp: new Date().toISOString()
          });
        }
        
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.error || 'Failed to update incident');
      }
    } catch (error) {
      console.error('Error updating incident:', error);
      message.error(error.message || 'Failed to update incident');
    } finally {
      setLoading(false);
    }
  };

  // Handle close with unsaved changes warning
  const handleClose = () => {
    if (hasChanges) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Are you sure you want to close?',
        okText: 'Discard Changes',
        cancelText: 'Keep Editing',
        okType: 'danger',
        onOk: () => {
          setHasChanges(false);
          form.resetFields();
          onClose();
        }
      });
    } else {
      form.resetFields();
      onClose();
    }
  };

  if (!incident) return null;

  const config = selectedIndustry ? industryConfigs[selectedIndustry.id] : null;

  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          Edit Incident
          <Tag color="blue">{incident.incident_number || `#${incident.id}`}</Tag>
          {hasChanges && <Tag color="orange">Unsaved Changes</Tag>}
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={900}
      footer={null}
      destroyOnClose
    >
      <Alert
        message="Editing Incident"
        description="Changes will be tracked in the audit trail. Some fields may be restricted based on incident status."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
      >
        {/* Basic Information */}
        <Divider orientation="left">Basic Information</Divider>
        
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="title"
              label="Incident Title"
              rules={[{ required: true, message: 'Title is required' }]}
            >
              <Input placeholder="Brief title of the incident" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="severity"
              label="Severity"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="low"><Tag color="green">Low</Tag></Option>
                <Option value="medium"><Tag color="gold">Medium</Tag></Option>
                <Option value="high"><Tag color="orange">High</Tag></Option>
                <Option value="critical"><Tag color="red">Critical</Tag></Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Description is required' }]}
        >
          <TextArea rows={4} placeholder="Detailed description of the incident" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="incidentType" label="Incident Type">
              <Select placeholder="Select type">
                {config?.incidentTypes?.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="incident_category" label="Category">
              <Select placeholder="Select category">
                <Option value="accident">Accident</Option>
                <Option value="incident">Incident</Option>
                <Option value="near_miss">Near Miss</Option>
                <Option value="occupational_illness">Occupational Illness</Option>
                <Option value="safety_hazard">Safety Hazard</Option>
                <Option value="health_hazard">Health Hazard</Option>
                <Option value="environmental">Environmental</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="Status">
              <Select>
                <Option value="draft">Draft</Option>
                <Option value="reported">Reported</Option>
                <Option value="under_review">Under Review</Option>
                <Option value="investigating">Investigating</Option>
                <Option value="resolved">Resolved</Option>
                <Option value="closed">Closed</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Date, Time, Location */}
        <Divider orientation="left">When & Where</Divider>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="date" label="Date of Incident">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="time" label="Time of Incident">
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="location" label="Location">
              <Input prefix={<EnvironmentOutlined />} placeholder="Exact location" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="department" label="Department">
              <Select placeholder="Select department">
                {config?.departments?.map(dept => (
                  <Option key={dept} value={dept}>{dept}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="reporter_name" label="Reporter Name">
              <Input prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        {/* People Information */}
        <Divider orientation="left">People Information</Divider>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="injured_persons" label="Injured Persons">
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="witnesses" label="Witnesses">
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="persons_involved" label="Persons Involved">
              <Input placeholder="Names and roles" />
            </Form.Item>
          </Col>
        </Row>

        {/* Actions and Notes */}
        <Divider orientation="left">Actions & Notes</Divider>
        
        <Form.Item name="immediate_actions" label="Immediate Actions Taken">
          <TextArea rows={3} placeholder="What was done immediately after the incident?" />
        </Form.Item>

        <Form.Item name="additional_notes" label="Additional Notes">
          <TextArea rows={2} placeholder="Any other relevant information" />
        </Form.Item>

        {/* Industry-Specific Fields */}
        {config?.customFields && (
          <>
            <Divider orientation="left">{selectedIndustry?.name} Specific Fields</Divider>
            {config.customFields(form)}
          </>
        )}

        {/* Form Actions */}
        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
            >
              Save Changes
            </Button>
            <Button onClick={handleClose} icon={<CloseOutlined />}>
              Cancel
            </Button>
            {hasChanges && (
              <Tag color="orange" icon={<WarningOutlined />}>
                You have unsaved changes
              </Tag>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditIncidentModal;