import React from "react";
import { Form, Input, Button, Select, message, Alert } from "antd";
import axios from "axios";

const { Option } = Select;

const TYPES = ["Air", "Water", "Surface"];

const PARAMETERS = {
  Air: ["PM2.5", "PM10", "CO", "CO2", "NO2", "O3", "Temperature", "Humidity"],
  Water: ["pH", "Turbidity", "Chlorine", "Lead", "Coliform"],
  Surface: ["Bacteria", "Virus", "Fungi"]
};

export default function MoStationForm({ hospitalId, onCreated }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTypeChange = (value) => {
    form.setFieldsValue({ parameters: [] });
  };

  const handleFinish = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.post("/api/monitoring/station", {
        hospital_id: hospitalId,
        name: values.name,
        type: values.type,
        location: values.location,
        description: values.description,
        parameters: values.parameters || []
      });
      
      message.success("Monitoring station created successfully.");
      onCreated && onCreated();
      form.resetFields();
    } catch (e) {
      console.error("Failed to create monitoring station:", e);
      setError(e.response?.data?.message || "Failed to create monitoring station.");
      message.error("Failed to create monitoring station.");
    } finally {
      setLoading(false);
    }
  };

  const currentType = Form.useWatch('type', form);
  const availableParams = currentType ? (PARAMETERS[currentType] || []) : [];

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      {error && (
        <Alert message={error} type="error" style={{ marginBottom: 16 }} />
      )}
      
      <Form.Item 
        label="Name" 
        name="name" 
        rules={[{ required: true, message: 'Please enter station name' }]}
      >
        <Input placeholder="Enter monitoring station name" />
      </Form.Item>
      
      <Form.Item 
        label="Type" 
        name="type" 
        rules={[{ required: true, message: 'Please select station type' }]}
      >
        <Select onChange={handleTypeChange} placeholder="Select station type">
          {TYPES.map(type => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item 
        label="Parameters" 
        name="parameters" 
        rules={[{ required: true, message: 'Please select at least one parameter' }]}
      >
        <Select 
          mode="multiple" 
          placeholder="Select parameters to monitor"
          disabled={!currentType}
        >
          {availableParams.map(param => (
            <Option key={param} value={param}>{param}</Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item label="Location" name="location">
        <Input placeholder="Enter station location" />
      </Form.Item>
      
      <Form.Item label="Description" name="description">
        <Input.TextArea rows={2} placeholder="Enter station description" />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Create Station
        </Button>
      </Form.Item>
    </Form>
  );
}