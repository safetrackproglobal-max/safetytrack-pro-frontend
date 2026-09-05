// src/components/hospital/BiohazardIncidentForm.js
import React, { useState } from 'react';
import { Form, Input, Select, Button, message, Modal, DatePicker, InputNumber, Space } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { hospitalService } from '../../services/hospitalService';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const BiohazardIncidentForm = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Use reportAdverseEvent from hospitalService
      const result = await hospitalService.reportAdverseEvent({
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : new Date().toISOString(),
        type: values.type || 'Biohazard Incident',
        status: 'Under Investigation'
      });
      
      message.success('Biohazard incident reported successfully');
      form.resetFields();
      onSuccess && onSuccess(result);
      onClose && onClose();
    } catch (error) {
      console.error('Error reporting biohazard incident:', error);
      message.error('Failed to report biohazard incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<span><WarningOutlined style={{ color: '#cf1322' }} /> Report Biohazard Incident</span>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ severity: 'Moderate', status: 'Under Investigation' }}
      >
        <Form.Item
          name="type"
          label="Incident Type"
          rules={[{ required: true, message: 'Please select incident type' }]}
        >
          <Select placeholder="Select incident type">
            <Option value="Chemical Spill">Chemical Spill</Option>
            <Option value="Biological Exposure">Biological Exposure</Option>
            <Option value="Sharps Injury">Sharps Injury</Option>
            <Option value="Waste Disposal">Waste Disposal</Option>
            <Option value="Radiation Exposure">Radiation Exposure</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="department"
          label="Department"
          rules={[{ required: true, message: 'Please select department' }]}
        >
          <Select placeholder="Select department">
            <Option value="ER">Emergency Room</Option>
            <Option value="ICU">ICU</Option>
            <Option value="Surgery">Surgery</Option>
            <Option value="Laboratory">Laboratory</Option>
            <Option value="Pharmacy">Pharmacy</Option>
            <Option value="Radiology">Radiology</Option>
            <Option value="General">General</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="severity"
          label="Severity Level"
          rules={[{ required: true, message: 'Please select severity' }]}
        >
          <Select placeholder="Select severity">
            <Option value="Minor">Minor</Option>
            <Option value="Moderate">Moderate</Option>
            <Option value="Severe">Severe</Option>
            <Option value="Critical">Critical</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Incident Description"
          rules={[{ required: true, message: 'Please provide description' }]}
        >
          <TextArea rows={4} placeholder="Describe the incident in detail" />
        </Form.Item>

        <Form.Item
          name="reportedBy"
          label="Reported By"
          rules={[{ required: true, message: 'Please enter reporter name' }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          name="date"
          label="Incident Date"
          rules={[{ required: true, message: 'Please select incident date' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="rootCause"
          label="Root Cause (if known)"
        >
          <Input placeholder="Suspected root cause" />
        </Form.Item>

        <Form.Item
          name="actionTaken"
          label="Action Taken"
        >
          <TextArea rows={3} placeholder="Describe immediate actions taken" />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Report Incident
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BiohazardIncidentForm;