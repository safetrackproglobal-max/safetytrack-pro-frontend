// src/components/environmental/WaterQualityManagement.js
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, DatePicker,
  Space, Tag, Card, Row, Col, Statistic, Tooltip, message,
  Popconfirm, InputNumber, Switch, Upload, Alert, Progress
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, UploadOutlined, DownloadOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  ExperimentOutlined, EnvironmentOutlined,
  ReloadOutlined, WarningOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import environmentalService from '../../services/environmentalService';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const WaterQualityManagement = () => {
  const [samples, setSamples] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [editingSample, setEditingSample] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    site_id: null,
    compliant: null,
    date_range: null
  });

  useEffect(() => {
    loadSamples();
    loadSites();
  }, [filters]);

  // Load water samples
  const loadSamples = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching water samples...');
      const response = await environmentalService.getWaterSamples();
      console.log('📥 Water samples response:', response);

      if (Array.isArray(response)) {
        setSamples(response);
      } else if (response && response.success) {
        setSamples(response.samples || response.data || []);
      } else if (response && response.data) {
        setSamples(Array.isArray(response.data) ? response.data : []);
      } else {
        setSamples([]);
      }
    } catch (error) {
      console.error('Failed to load water samples:', error);
      message.error('Failed to load water samples');
      setSamples([]);
    } finally {
      setLoading(false);
    }
  };

  // Load water sites
  const loadSites = async () => {
    try {
      if (environmentalService.getWaterSites) {
        const response = await environmentalService.getWaterSites();
        if (response && response.success) {
          setSites(response.sites || response.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load sites:', error);
    }
  };

  const handleCreate = () => {
    setEditingSample(null);
    form.resetFields();
    form.setFieldsValue({
      compliant: true,
      sample_type: 'water',
      collection_time: moment()
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSample(record);
    form.setFieldsValue({
      site_id: record.site_id,
      site_name: record.site_name,
      location: record.location,
      sample_type: record.sample_type || 'water',
      ph_level: record.ph_level,
      temperature: record.temperature,
      turbidity: record.turbidity,
      tds: record.tds,
      dissolved_oxygen: record.dissolved_oxygen,
      coliform_count: record.coliform_count,
      compliant: record.compliant !== undefined ? record.compliant : true,
      violations: record.violations || '',
      notes: record.notes || '',
      collection_time: record.collection_time ? moment(record.collection_time) : moment()
    });
    setModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedSample(record);
    setViewModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await environmentalService.deleteWaterSample(id);
      message.success('Sample deleted successfully');
      loadSamples();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete sample');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Format data for backend
      const data = {
        // Required fields
        sample_type: values.sample_type || 'water',
        sample_date: values.collection_time?.toISOString?.() || new Date().toISOString(),

        // Optional fields
        site_id: values.site_id || '',
        site_name: values.site_name || '',
        location: values.location || '',
        ph_level: values.ph_level,
        temperature: values.temperature,
        turbidity: values.turbidity,
        tds: values.tds,
        dissolved_oxygen: values.dissolved_oxygen,
        coliform_count: values.coliform_count,
        compliant: values.compliant !== undefined ? values.compliant : true,
        violations: values.violations || '',
        notes: values.notes || '',
        collection_time: values.collection_time?.toISOString?.() || new Date().toISOString()
      };

      let response;
      if (editingSample) {
        response = await environmentalService.updateWaterSample(editingSample.id, data);
        if (response && response.success) {
          message.success('Sample updated successfully');
        } else {
          message.error(response?.error || 'Failed to update sample');
          return;
        }
      } else {
        response = await environmentalService.createWaterSample(data);
        if (response && response.success) {
          message.success('Sample created successfully');
        } else {
          message.error(response?.error || 'Failed to create sample');
          return;
        }
      }

      setModalVisible(false);
      form.resetFields();
      loadSamples();
    } catch (error) {
      console.error('Submit error:', error);
      message.error(error.message || 'Failed to save sample');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceTag = (compliant) => {
    if (compliant === undefined || compliant === null) return <Tag>Unknown</Tag>;
    return compliant ?
      <Tag icon={<CheckCircleOutlined />} color="success">Compliant</Tag> :
      <Tag icon={<CloseCircleOutlined />} color="error">Non-Compliant</Tag>;
  };

  const getStatusColor = (ph) => {
    if (ph === undefined || ph === null) return '#d9d9d9';
    if (ph >= 6.5 && ph <= 8.5) return '#52c41a';
    if (ph >= 5.5 && ph < 6.5) return '#faad14';
    if (ph > 8.5 && ph <= 9.5) return '#faad14';
    return '#ff4d4f';
  };

  const getStatusText = (ph) => {
    if (ph === undefined || ph === null) return 'Unknown';
    if (ph >= 6.5 && ph <= 8.5) return 'Normal';
    if (ph >= 5.5 && ph < 6.5) return 'Slightly Acidic';
    if (ph > 8.5 && ph <= 9.5) return 'Slightly Alkaline';
    if (ph < 5.5) return 'Acidic';
    return 'Alkaline';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => location || '--'
    },
    {
      title: 'Site',
      dataIndex: 'site_name',
      key: 'site_name',
      render: (name, record) => name || record.site_id || 'N/A'
    },
    {
      title: 'pH Level',
      dataIndex: 'ph_level',
      key: 'ph_level',
      render: (ph) => (
        <Tooltip title={`${getStatusText(ph)} - pH: ${ph}`}>
          <Tag color={getStatusColor(ph)}>
            {ph !== undefined && ph !== null ? ph : '--'}
          </Tag>
        </Tooltip>
      )
    },
    {
      title: 'Temperature',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (temp) => temp !== undefined && temp !== null ? `${temp}°C` : '--'
    },
    {
      title: 'Compliance',
      dataIndex: 'compliant',
      key: 'compliant',
      render: getComplianceTag
    },
    {
      title: 'Sample Type',
      dataIndex: 'sample_type',
      key: 'sample_type',
      render: (type) => <Tag color="blue">{type || 'water'}</Tag>
    },
    {
      title: 'Collected',
      dataIndex: 'collection_time',
      key: 'collection_time',
      render: (time) => time ? moment(time).format('YYYY-MM-DD HH:mm') : '--'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this sample?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="danger"
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="water-quality-management">
      <Card>
        {/* Statistics Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Samples"
                value={samples.length}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title="Compliant"
                value={samples.filter(s => s.compliant).length}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card size="small">
              <Statistic
                title="Non-Compliant"
                value={samples.filter(s => !s.compliant).length}
                valueStyle={{ color: '#cf1322' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6} style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadSamples}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Add Sample
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={samples}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} samples`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50']
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0' }}>
                <ExperimentOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <p style={{ marginTop: 16, color: '#666' }}>No water samples found</p>
                <Button type="primary" onClick={handleCreate}>
                  Add Your First Sample
                </Button>
              </div>
            )
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingSample ? 'Edit Water Sample' : 'Add Water Sample'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            compliant: true,
            sample_type: 'water',
            collection_time: moment()
          }}
        >
          {/* Row 1: Sample Type and Collection Time */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sample_type"
                label="Sample Type"
                rules={[{ required: true, message: 'Please select sample type' }]}
              >
                <Select placeholder="Select sample type">
                  <Option value="water">Water</Option>
                  <Option value="wastewater">Wastewater</Option>
                  <Option value="groundwater">Groundwater</Option>
                  <Option value="surface_water">Surface Water</Option>
                  <Option value="drinking_water">Drinking Water</Option>
                  <Option value="rainwater">Rainwater</Option>
                  <Option value="sea_water">Sea Water</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="collection_time"
                label="Collection Time"
                rules={[{ required: true, message: 'Please select collection time' }]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 2: Location and Site Name */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: 'Please enter location' }]}
              >
                <Input placeholder="Enter location (e.g., Industrial Zone A)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="site_name"
                label="Site Name"
                rules={[{ required: true, message: 'Please enter site name' }]}
              >
                <Input placeholder="Enter site name" />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 3: Site ID (optional) */}
          <Form.Item name="site_id" label="Site ID">
            <Input placeholder="Enter site ID (e.g., SITE-001)" />
          </Form.Item>

          {/* Row 4: pH, Temperature, Turbidity */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="ph_level"
                label="pH Level"
                rules={[{ required: true, message: 'Please enter pH level' }]}
              >
                <InputNumber
                  min={0}
                  max={14}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="0.0 - 14.0"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="temperature" label="Temperature (°C)">
                <InputNumber
                  min={-10}
                  max={50}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="Temperature"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="turbidity" label="Turbidity (NTU)">
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="Turbidity"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 5: TDS, DO, Coliform */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="tds" label="TDS (mg/L)">
                <InputNumber
                  min={0}
                  step={1}
                  style={{ width: '100%' }}
                  placeholder="Total Dissolved Solids"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dissolved_oxygen" label="DO (mg/L)">
                <InputNumber
                  min={0}
                  step={0.1}
                  style={{ width: '100%' }}
                  placeholder="Dissolved Oxygen"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="coliform_count" label="Coliform Count">
                <InputNumber
                  min={0}
                  step={1}
                  style={{ width: '100%' }}
                  placeholder="Coliform count"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Compliance Switch */}
          <Form.Item name="compliant" label="Compliant" valuePropName="checked">
            <Switch />
          </Form.Item>

          {/* Violations */}
          <Form.Item name="violations" label="Violations">
            <TextArea rows={2} placeholder="Any violations found" />
          </Form.Item>

          {/* Notes */}
          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} placeholder="Additional notes" />
          </Form.Item>

          {/* Form Actions */}
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingSample ? 'Update' : 'Add Sample'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Sample Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>Close</Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setViewModalVisible(false);
              if (selectedSample) handleEdit(selectedSample);
            }}
          >
            Edit
          </Button>
        ]}
        width={700}
      >
        {selectedSample && (
          <div>
            {/* Header */}
            <Alert
              message={selectedSample.compliant ? '✅ Compliant Sample' : '❌ Non-Compliant Sample'}
              description={`Sample ID: ${selectedSample.id}`}
              type={selectedSample.compliant ? 'success' : 'error'}
              showIcon
              style={{ marginBottom: 16 }}
            />

            {/* Main Info */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Location:</strong>
                <p>{selectedSample.location || 'N/A'}</p>
              </Col>
              <Col span={12}>
                <strong>Site Name:</strong>
                <p>{selectedSample.site_name || selectedSample.site_id || 'N/A'}</p>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Sample Type:</strong>
                <p><Tag color="blue">{selectedSample.sample_type || 'water'}</Tag></p>
              </Col>
              <Col span={12}>
                <strong>Collection Time:</strong>
                <p>{selectedSample.collection_time ? moment(selectedSample.collection_time).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}</p>
              </Col>
            </Row>

            <Divider />

            {/* Parameters */}
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="pH Level"
                    value={selectedSample.ph_level !== undefined ? selectedSample.ph_level : '--'}
                    valueStyle={{ color: getStatusColor(selectedSample.ph_level) }}
                    prefix={<ExperimentOutlined />}
                  />
                  <Tag color={getStatusColor(selectedSample.ph_level)} style={{ marginTop: 4 }}>
                    {getStatusText(selectedSample.ph_level)}
                  </Tag>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Temperature"
                    value={selectedSample.temperature !== undefined ? `${selectedSample.temperature}°C` : '--'}
                    prefix={<InfoCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Turbidity"
                    value={selectedSample.turbidity !== undefined ? `${selectedSample.turbidity} NTU` : '--'}
                    prefix={<EnvironmentOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="TDS"
                    value={selectedSample.tds !== undefined ? `${selectedSample.tds} mg/L` : '--'}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Dissolved Oxygen"
                    value={selectedSample.dissolved_oxygen !== undefined ? `${selectedSample.dissolved_oxygen} mg/L` : '--'}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Coliform Count"
                    value={selectedSample.coliform_count !== undefined ? selectedSample.coliform_count : '--'}
                  />
                </Card>
              </Col>
            </Row>

            {/* Violations & Notes */}
            {selectedSample.violations && (
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                  <Alert
                    message="Violations"
                    description={selectedSample.violations}
                    type="warning"
                    showIcon
                  />
                </Col>
              </Row>
            )}

            {selectedSample.notes && (
              <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                <Col span={24}>
                  <Card size="small" title="Notes">
                    <p>{selectedSample.notes}</p>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Timestamps */}
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Created: {selectedSample.created_at ? moment(selectedSample.created_at).format('YYYY-MM-DD HH:mm') : 'N/A'}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Updated: {selectedSample.updated_at ? moment(selectedSample.updated_at).format('YYYY-MM-DD HH:mm') : 'N/A'}
                </Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WaterQualityManagement;