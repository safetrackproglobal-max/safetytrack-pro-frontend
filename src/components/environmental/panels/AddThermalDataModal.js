
// src/components/environmental/modals/AddThermalDataModal.js
import React, { useState } from 'react';
import { 
  Modal, Form, Input, InputNumber, Select, Button, Space, 
  message, Alert, Divider, Radio, DatePicker 
} from 'antd';
import { 
  PlusOutlined, 
  ExperimentOutlined,
  ThunderboltOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';
import environmentalAIService from '../../../services/environmentalAIService';

const { Option } = Select;
const { TextArea } = Input;

const AddThermalDataModal = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataType, setDataType] = useState('sensor');
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (dataType === 'sensor') {
        // Add new sensor
        await environmentalAIService.addThermalSensor({
          sensor_id: values.sensor_id,
          name: values.name,
          location: values.location,
          type: values.type,
          min_temp: values.min_temp,
          max_temp: values.max_temp,
          status: 'active'
        });
        message.success('Thermal sensor added successfully!');
      } else {
        // Add thermal reading
        await environmentalAIService.addThermalReading({
          sensor_id: values.sensor_id,
          temperature: values.temperature,
          humidity: values.humidity,
          battery_level: values.battery_level || 100,
          reading_time: values.reading_time?.toISOString() || new Date().toISOString()
        });
        message.success('Thermal reading added successfully!');
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      message.error('Failed to add data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSample = async () => {
    try {
      setGenerating(true);
      await environmentalAIService.generateSampleThermalData();
      message.success('Sample thermal data generated!');
      onSuccess();
      onClose();
    } catch (error) {
      message.error('Failed to generate sample data: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          <ExperimentOutlined /> Add Thermal Data
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button 
          key="sample" 
          onClick={handleGenerateSample}
          loading={generating}
          icon={<ThunderboltOutlined />}
        >
          Generate Sample Data
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
        >
          Add {dataType === 'sensor' ? 'Sensor' : 'Reading'}
        </Button>,
      ]}
      width={600}
    >
      <Alert
        message="No thermal data yet?"
        description="Use this form to add sensors and readings, or click 'Generate Sample Data' to populate with test data."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Radio.Group 
        value={dataType} 
        onChange={(e) => setDataType(e.target.value)}
        style={{ marginBottom: 16 }}
        buttonStyle="solid"
      >
        <Radio.Button value="sensor">Add New Sensor</Radio.Button>
        <Radio.Button value="reading">Add Temperature Reading</Radio.Button>
      </Radio.Group>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'indoor',
          min_temp: 15,
          max_temp: 35,
          battery_level: 100
        }}
      >
        {dataType === 'sensor' ? (
          // Add Sensor Form
          <>
            <Form.Item
              name="sensor_id"
              label="Sensor ID"
              rules={[{ required: true, message: 'Please enter sensor ID' }]}
            >
              <Input placeholder="e.g., TS-001" />
            </Form.Item>

            <Form.Item
              name="name"
              label="Sensor Name"
              rules={[{ required: true, message: 'Please enter sensor name' }]}
            >
              <Input placeholder="e.g., Server Room Sensor" />
            </Form.Item>

            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: 'Please enter location' }]}
            >
              <Input placeholder="e.g., Data Center - Rack A" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Sensor Type"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="indoor">Indoor</Option>
                <Option value="outdoor">Outdoor</Option>
                <Option value="industrial">Industrial</Option>
                <Option value="hvac">HVAC</Option>
              </Select>
            </Form.Item>

            <Space style={{ width: '100%' }} size="large">
              <Form.Item
                name="min_temp"
                label="Min Temperature (°C)"
                rules={[{ required: true }]}
              >
                <InputNumber min={-50} max={100} />
              </Form.Item>

              <Form.Item
                name="max_temp"
                label="Max Temperature (°C)"
                rules={[{ required: true }]}
              >
                <InputNumber min={-50} max={100} />
              </Form.Item>
            </Space>
          </>
        ) : (
          // Add Reading Form
          <>
            <Form.Item
              name="sensor_id"
              label="Sensor ID"
              rules={[{ required: true, message: 'Please select or enter sensor ID' }]}
            >
              <Select
                placeholder="Select existing sensor"
                allowClear
                showSearch
              >
                {/* You would populate this from your sensors list */}
                <Option value="TS-001">TS-001 - Server Room</Option>
                <Option value="TS-002">TS-002 - Manufacturing</Option>
                <Option value="TS-003">TS-003 - Office</Option>
              </Select>
            </Form.Item>

            <Space style={{ width: '100%' }} size="large">
              <Form.Item
                name="temperature"
                label="Temperature (°C)"
                rules={[{ required: true }]}
              >
                <InputNumber min={-50} max={100} step={0.1} />
              </Form.Item>

              <Form.Item
                name="humidity"
                label="Humidity (%)"
              >
                <InputNumber min={0} max={100} step={1} />
              </Form.Item>
            </Space>

            <Form.Item
              name="reading_time"
              label="Reading Time"
              tooltip="Leave empty for current time"
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
            </Form.Item>

            <Form.Item
              name="battery_level"
              label="Battery Level (%)"
            >
              <InputNumber min={0} max={100} step={1} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default AddThermalDataModal;