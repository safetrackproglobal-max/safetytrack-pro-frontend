// src/components/environmental/AirQualityManagement.js
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Tag,
  Space, Card, Row, Col, Statistic, message, Popconfirm,
  InputNumber, Tabs, Tooltip, Alert
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, CloudOutlined, WarningOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  ReloadOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import environmentalService from '../../services/environmentalService';

const { Option } = Select;
const { TabPane } = Tabs;

const AirQualityManagement = () => {
  const [sensors, setSensors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [editingSensor, setEditingSensor] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('sensors');
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching air quality sensors...');
      
      const response = await environmentalService.getSensors();
      
      console.log('📦 Full API Response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Is array:', Array.isArray(response));
      console.log('📦 Response length:', response?.length);
      
      let sensorsData = [];
      
      if (response === null || response === undefined) {
        console.warn('⚠️ Response is null or undefined');
        sensorsData = [];
      } else if (Array.isArray(response)) {
        sensorsData = response;
        console.log('✅ Response is an array, length:', sensorsData.length);
      } else if (typeof response === 'object') {
        if (response.data && Array.isArray(response.data)) {
          sensorsData = response.data;
          console.log('✅ Found sensors in response.data:', sensorsData.length);
        } else if (response.sensors && Array.isArray(response.sensors)) {
          sensorsData = response.sensors;
          console.log('✅ Found sensors in response.sensors:', sensorsData.length);
        } else if (response.items && Array.isArray(response.items)) {
          sensorsData = response.items;
          console.log('✅ Found sensors in response.items:', sensorsData.length);
        } else if (response.records && Array.isArray(response.records)) {
          sensorsData = response.records;
          console.log('✅ Found sensors in response.records:', sensorsData.length);
        } else if (response.results && Array.isArray(response.results)) {
          sensorsData = response.results;
          console.log('✅ Found sensors in response.results:', sensorsData.length);
        } else if (response.success === false) {
          console.error('❌ API returned error:', response.error);
          message.error(response.error || 'Failed to load sensors');
          setSensors([]);
          setLoading(false);
          return;
        } else {
          console.warn('⚠️ Response object has no identifiable data array');
          console.log('📦 Response keys:', Object.keys(response));
          const values = Object.values(response);
          if (values.length > 0 && values.some(v => typeof v === 'object')) {
            sensorsData = values;
            console.log('✅ Using Object.values(response) as sensors:', sensorsData.length);
          } else {
            sensorsData = [];
          }
        }
      } else {
        console.warn('⚠️ Unexpected response type:', typeof response);
        sensorsData = [];
      }
      
      if (!Array.isArray(sensorsData)) {
        console.warn('⚠️ sensorsData is not an array, converting');
        sensorsData = [];
      }
      
      console.log('📊 Final sensors data:', sensorsData.length, 'sensors');
      if (sensorsData.length > 0) {
        console.log('📊 Sample sensor:', sensorsData[0]);
      } else {
        console.log('📊 No sensors found - database may be empty');
        message.info('No sensors found. Click "Add Sensor" to create your first one.');
      }
      
      setSensors(sensorsData);
      
    } catch (error) {
      console.error('❌ Error loading sensors:', error);
      console.error('Error details:', error.response?.data || error.message);
      message.error('Failed to load air quality sensors: ' + (error.message || 'Unknown error'));
      setSensors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSensor(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      sensor_type: 'air_quality',
      min_range: 0,
      max_range: 500,
      unit: 'AQI',
      compliance_score: 100
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSensor(record);
    form.setFieldsValue({
      name: record.name,
      device_id: record.device_id,
      sensor_type: record.sensor_type,
      location: record.location,
      status: record.status,
      min_range: record.min_range,
      max_range: record.max_range,
      unit: record.unit,
      compliance_score: record.compliance_score
    });
    setModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedSensor(record);
    setViewModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await environmentalService.deleteSensor(id);
      message.success('Sensor deleted successfully');
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete sensor: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const sensorData = {
        name: values.name,
        device_id: values.device_id,
        sensor_type: values.sensor_type,
        location: values.location || '',
        status: values.status || 'active',
        min_range: values.min_range || 0,
        max_range: values.max_range || 500,
        unit: values.unit || 'AQI',
        compliance_score: values.compliance_score || 100
      };

      let response;
      if (editingSensor) {
        response = await environmentalService.updateSensor(editingSensor.id, sensorData);
        if (response && response.success) {
          message.success('Sensor updated successfully');
        } else {
          message.error(response?.error || 'Failed to update sensor');
          return;
        }
      } else {
        response = await environmentalService.createSensor(sensorData);
        if (response && response.success) {
          message.success('Sensor created successfully');
        } else {
          message.error(response?.error || 'Failed to create sensor');
          return;
        }
      }
      
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Failed to save sensor');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await environmentalService.acknowledgeAlert(alertId);
      message.success('Alert acknowledged');
      loadData();
    } catch (error) {
      console.error('Acknowledge error:', error);
      message.error('Failed to acknowledge alert');
    }
  };

  const getStatusTag = (status) => {
    const colors = {
      active: 'green',
      inactive: 'red',
      maintenance: 'orange',
      offline: 'gray',
      decommissioned: 'default'
    };
    return <Tag color={colors[status?.toLowerCase()] || 'default'}>{status?.toUpperCase() || 'UNKNOWN'}</Tag>;
  };

  const getComplianceColor = (score) => {
    if (score === null || score === undefined) return 'default';
    if (score >= 90) return 'green';
    if (score >= 70) return 'orange';
    return 'red';
  };

  const sensorColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Device ID',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (id) => <Tag color="blue">{id || 'N/A'}</Tag>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Tooltip title={`Device: ${record.device_id}`}>
          <span>{name || 'Unnamed'}</span>
        </Tooltip>
      )
    },
    {
      title: 'Type',
      dataIndex: 'sensor_type',
      key: 'sensor_type',
      render: (type) => <Tag>{type || 'air_quality'}</Tag>
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => location || '--'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag
    },
    {
      title: 'Compliance',
      dataIndex: 'compliance_score',
      key: 'compliance_score',
      render: (score) => {
        if (score === null || score === undefined) return '--';
        return (
          <Tag color={getComplianceColor(score)}>
            {score}%
          </Tag>
        );
      }
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => date ? new Date(date).toLocaleString() : '--'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete this sensor?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const renderDebugInfo = () => {
    if (!debugInfo) return null;
    return (
      <Alert
        type="info"
        icon={<ExclamationCircleOutlined />}
        message="Debug Info"
        description={
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            <pre style={{ fontSize: 12 }}>
              {JSON.stringify({
                'Response Keys': Object.keys(debugInfo),
                'Has sensors': !!debugInfo.sensors,
                'Sensors type': typeof debugInfo.sensors,
                'Sensors length': debugInfo.sensors?.length,
                'Response success': debugInfo.success,
                'Is array': Array.isArray(debugInfo),
                'Full response sample': debugInfo
              }, null, 2)}
            </pre>
          </div>
        }
        closable
        style={{ marginBottom: 16 }}
      />
    );
  };

  return (
    <div className="air-quality-management">
      {renderDebugInfo()}
      
      <Card
        title={
          <Space>
            <CloudOutlined />
            Air Quality Monitoring
            <Tag color="blue">{sensors.length} sensors</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadData}
              loading={loading}
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add Sensor
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <CloudOutlined /> Sensors
                <Tag color="blue" style={{ marginLeft: 8 }}>{sensors.length}</Tag>
              </span>
            } 
            key="sensors"
          >
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <Statistic 
                    title="Total Sensors" 
                    value={sensors.length}
                    prefix={<CloudOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <Statistic 
                    title="Active" 
                    value={sensors.filter(s => s.status === 'active').length}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <Statistic 
                    title="Offline" 
                    value={sensors.filter(s => s.status === 'offline').length}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Table
              columns={sensorColumns}
              dataSource={sensors}
              loading={loading}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showTotal: (total) => `Total ${total} sensors`
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: '40px 0' }}>
                    <CloudOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                    <p style={{ marginTop: 16, color: '#666' }}>No sensors found</p>
                    <Button type="primary" onClick={handleCreate}>
                      Add Your First Sensor
                    </Button>
                  </div>
                )
              }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <WarningOutlined /> Alerts
                <Tag color="red" style={{ marginLeft: 8 }}>
                  {alerts.filter(a => !a.acknowledged).length}
                </Tag>
              </span>
            } 
            key="alerts"
          >
            <Table
              dataSource={alerts}
              rowKey="id"
              loading={loading}
              columns={[
                {
                  title: 'Message',
                  dataIndex: 'message',
                  key: 'message'
                },
                {
                  title: 'Severity',
                  dataIndex: 'severity',
                  key: 'severity',
                  render: (severity) => (
                    <Tag color={
                      severity === 'critical' ? 'red' :
                      severity === 'high' ? 'orange' :
                      severity === 'medium' ? 'gold' : 'blue'
                    }>
                      {severity?.toUpperCase() || 'UNKNOWN'}
                    </Tag>
                  )
                },
                {
                  title: 'Status',
                  dataIndex: 'acknowledged',
                  key: 'acknowledged',
                  render: (acknowledged) => (
                    acknowledged ? 
                      <Tag color="green">Acknowledged</Tag> :
                      <Tag color="red">Unacknowledged</Tag>
                  )
                },
                {
                  title: 'Created',
                  dataIndex: 'created_at',
                  key: 'created_at',
                  render: (date) => date ? new Date(date).toLocaleString() : '--'
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    !record.acknowledged && (
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => handleAcknowledgeAlert(record.id)}
                      >
                        Acknowledge
                      </Button>
                    )
                  )
                }
              ]}
              locale={{
                emptyText: 'No alerts found'
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingSensor ? 'Edit Air Quality Sensor' : 'Add Air Quality Sensor'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            sensor_type: 'air_quality',
            min_range: 0,
            max_range: 500,
            unit: 'AQI',
            compliance_score: 100
          }}
        >
          <Form.Item
            name="name"
            label="Sensor Name"
            rules={[{ required: true, message: 'Please enter sensor name' }]}
          >
            <Input placeholder="e.g., Main Building Sensor" />
          </Form.Item>

          <Form.Item
            name="device_id"
            label="Device ID"
            rules={[
              { required: true, message: 'Please enter device ID' },
              { pattern: /^[a-zA-Z0-9\-_]+$/, message: 'Only letters, numbers, hyphens, and underscores allowed' }
            ]}
          >
            <Input placeholder="e.g., AQ-001" disabled={!!editingSensor} />
          </Form.Item>

          {/* ✅ Sensor Type - Only valid air quality types */}
          <Form.Item
            name="sensor_type"
            label="Sensor Type"
            rules={[{ required: true, message: 'Please select sensor type' }]}
            tooltip="Select the type of sensor. Only air quality related types are allowed."
          >
            <Select placeholder="Select sensor type">
              <Option value="air_quality">Air Quality</Option>
              <Option value="temperature">Temperature</Option>
              <Option value="humidity">Humidity</Option>
              <Option value="gas">Gas</Option>
              <Option value="particulate">Particulate</Option>
              <Option value="co2">CO2</Option>
              <Option value="voc">VOC</Option>
              <Option value="pm25">PM2.5</Option>
              <Option value="pm10">PM10</Option>
            </Select>
          </Form.Item>

          <Form.Item name="location" label="Location">
            <Input placeholder="e.g., Building A - Floor 3" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="offline">Offline</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="min_range" label="Min Range">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_range" label="Max Range">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="unit" label="Unit">
            <Input placeholder="e.g., AQI, ppm, µg/m³" />
          </Form.Item>

          <Form.Item name="compliance_score" label="Compliance Score">
            <InputNumber 
              style={{ width: '100%' }} 
              min={0} 
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
            />
          </Form.Item>

          {/* ✅ Show allowed types info */}
          <Alert
            message="Allowed Sensor Types"
            description="air_quality, temperature, humidity, gas, particulate, co2, voc, pm25, pm10"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingSensor ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Sensor Modal */}
      <Modal
        title="Sensor Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            setViewModalVisible(false);
            if (selectedSensor) handleEdit(selectedSensor);
          }}>
            Edit
          </Button>
        ]}
        width={600}
      >
        {selectedSensor && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Device ID:</strong>
                <p><Tag color="blue">{selectedSensor.device_id}</Tag></p>
              </Col>
              <Col span={12}>
                <strong>Name:</strong>
                <p>{selectedSensor.name || 'N/A'}</p>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Type:</strong>
                <p><Tag>{selectedSensor.sensor_type || 'air_quality'}</Tag></p>
              </Col>
              <Col span={12}>
                <strong>Status:</strong>
                <p>{getStatusTag(selectedSensor.status)}</p>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Location:</strong>
                <p>{selectedSensor.location || 'Not specified'}</p>
              </Col>
              <Col span={12}>
                <strong>Compliance Score:</strong>
                <p>
                  <Tag color={getComplianceColor(selectedSensor.compliance_score)}>
                    {selectedSensor.compliance_score !== null && selectedSensor.compliance_score !== undefined 
                      ? `${selectedSensor.compliance_score}%` 
                      : 'N/A'}
                  </Tag>
                </p>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Range:</strong>
                <p>{selectedSensor.min_range || 0} - {selectedSensor.max_range || 500} {selectedSensor.unit || 'AQI'}</p>
              </Col>
              <Col span={12}>
                <strong>Department:</strong>
                <p>{selectedSensor.department || 'N/A'}</p>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Created:</strong>
                <p>{selectedSensor.created_at ? new Date(selectedSensor.created_at).toLocaleString() : 'N/A'}</p>
              </Col>
              <Col span={12}>
                <strong>Last Updated:</strong>
                <p>{selectedSensor.updated_at ? new Date(selectedSensor.updated_at).toLocaleString() : 'N/A'}</p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AirQualityManagement;