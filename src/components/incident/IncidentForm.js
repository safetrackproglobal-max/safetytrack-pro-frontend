import React, { useState } from "react";
import { Modal, Form, Input, Select, Button, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;
const { TextArea } = Input;

const INCIDENT_TYPES = [
  "Needlestick Injury",
  "Chemical Spill",
  "Biological Exposure",
  "Radiation Incident",
  "Physical Injury",
  "Equipment Failure",
  "Environmental Hazard",
  "Other"
];

const SEVERITY_LEVELS = ["Low", "Medium", "High", "Critical"];

export default function IncidentForm({ hospitalId, departmentId, onSuccess, visible, onCancel }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append form values
      Object.keys(values).forEach(key => {
        if (key !== 'attachments') {
          formData.append(key, values[key]);
        }
      });

      // Append files
      fileList.forEach(file => {
        formData.append('attachments', file.originFileObj);
      });

      formData.append('hospital_id', hospitalId);
      if (departmentId) {
        formData.append('department_id', departmentId);
      }

      await axios.post('/api/incidents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('Incident reported successfully');
      form.resetFields();
      setFileList([]);
      onSuccess && onSuccess();
    } catch (error) {
      message.error('Failed to report incident');
      console.error('Error reporting incident:', error);
    }
    setLoading(false);
  };

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  return (
    <Modal
      title="Report New Incident"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Incident Type"
          name="type"
          rules={[{ required: true, message: 'Please select incident type' }]}
        >
          <Select placeholder="Select incident type">
            {INCIDENT_TYPES.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter incident title' }]}
        >
          <Input placeholder="Brief title of the incident" />
        </Form.Item>

        <Form.Item
          label="Severity"
          name="severity"
          rules={[{ required: true, message: 'Please select severity level' }]}
        >
          <Select placeholder="Select severity level">
            {SEVERITY_LEVELS.map(level => (
              <Option key={level} value={level}>{level}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: 'Please enter location' }]}
        >
          <Input placeholder="Where did the incident occur?" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please describe the incident' }]}
        >
          <TextArea
            rows={4}
            placeholder="Provide detailed description of what happened, including people involved, circumstances, and immediate actions taken"
          />
        </Form.Item>

        <Form.Item
          label="Immediate Actions Taken"
          name="immediate_actions"
        >
          <TextArea
            rows={3}
            placeholder="Describe any immediate actions taken after the incident"
          />
        </Form.Item>

        <Form.Item
          label="Attachments"
          name="attachments"
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Select Files</Button>
          </Upload>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            Upload photos, documents, or other evidence (max 5 files, 10MB each)
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
            Report Incident
          </Button>
          <Button onClick={onCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}