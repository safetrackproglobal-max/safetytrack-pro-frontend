// src/components/environmental/EnvironmentalIncidentsManagement.js

import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Tag,
  Space, Card, Row, Col, Statistic, message, Popconfirm,
  DatePicker, Alert, Badge, InputNumber
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, AlertOutlined, CheckCircleOutlined,
  CloseCircleOutlined, WarningOutlined, InfoCircleOutlined
} from '@ant-design/icons';
// ✅ FIX: Import environmentalService directly
import environmentalService from '../../services/environmentalService';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const EnvironmentalIncidentsManagement = () => {
  const [incidents, setIncidents] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    status: null,
    type: null,
    severity: null
  });

  useEffect(() => {
    loadData();
    loadTypes();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      // ✅ Use environmentalService.getEnvironmentalIncidents()
      const response = await environmentalService.getEnvironmentalIncidents(filters);
      if (response && response.success) {
        setIncidents(response.incidents || response.data || []);
      } else if (Array.isArray(response)) {
        setIncidents(response);
      } else {
        setIncidents([]);
      }
    } catch (error) {
      console.error('Failed to load incidents:', error);
      message.error('Failed to load incidents');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Use environmentalService.getIncidentTypes() or handle missing method
  const loadTypes = async () => {
    try {
      // Try to get types from the service
      let typesData = [];
      
      // Check if the method exists
      if (environmentalService.getIncidentTypes) {
        const response = await environmentalService.getIncidentTypes();
        if (response && response.success) {
          typesData = response.types || response.data || [];
        } else if (Array.isArray(response)) {
          typesData = response;
        }
      } else {
        // Fallback: use getEnvironmentalIncidents to extract types
        console.warn('⚠️ getIncidentTypes not found, using fallback types');
        typesData = [
          'Spill', 'Emission', 'Waste', 'Chemical Release',
          'Air Quality', 'Water Quality', 'Noise', 'Other'
        ];
      }
      
      setTypes(typesData);
      console.log('📊 Loaded incident types:', typesData.length);
    } catch (error) {
      console.error('Failed to load types:', error);
      // Set fallback types
      setTypes(['Spill', 'Emission', 'Waste', 'Chemical Release', 'Air Quality', 'Water Quality', 'Noise', 'Other']);
    }
  };

  const handleCreate = () => {
    setEditingIncident(null);
    form.resetFields();
    form.setFieldsValue({ 
      status: 'reported',
      severity: 'medium'
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingIncident(record);
    form.setFieldsValue({
      ...record,
      reported_date: record.reported_date ? moment(record.reported_date) : null
    });
    setModalVisible(true);
  };

  // ✅ FIX: Add handleSubmit function
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Format date if present
      if (values.reported_date) {
        values.reported_date = values.reported_date.format('YYYY-MM-DD HH:mm:ss');
      }
      
      let response;
      if (editingIncident) {
        // ✅ Use environmentalService.updateEnvironmentalIncident()
        response = await environmentalService.updateEnvironmentalIncident(
          editingIncident.id,
          values
        );
      } else {
        // ✅ Use environmentalService.createEnvironmentalIncident()
        response = await environmentalService.createEnvironmentalIncident(values);
      }
      
      if (response && response.success) {
        message.success(
          editingIncident 
            ? 'Incident updated successfully' 
            : 'Incident reported successfully'
        );
        setModalVisible(false);
        form.resetFields();
        loadData();
      } else {
        message.error(response?.error || 'Failed to save incident');
      }
    } catch (error) {
      console.error('Submit error:', error);
      message.error(error.message || 'Failed to save incident');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // ✅ Use environmentalService.deleteEnvironmentalIncident()
      const response = await environmentalService.deleteEnvironmentalIncident(id);
      if (response && response.success) {
        message.success('Incident deleted successfully');
        loadData();
      } else {
        message.error(response?.error || 'Failed to delete incident');
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete incident');
    }
  };

  const getSeverityTag = (severity) => {
    const colors = {
      low: 'blue',
      medium: 'gold',
      high: 'orange',
      critical: 'red',
      minor: 'cyan',
      major: 'volcano',
      severe: 'magenta'
    };
    return <Tag color={colors[severity] || 'default'}>{severity?.toUpperCase() || 'UNKNOWN'}</Tag>;
  };

  const getStatusTag = (status) => {
    const config = {
      reported: { color: 'blue', icon: <InfoCircleOutlined /> },
      investigating: { color: 'orange', icon: <WarningOutlined /> },
      resolved: { color: 'green', icon: <CheckCircleOutlined /> },
      closed: { color: 'default', icon: <CheckCircleOutlined /> },
      pending: { color: 'gold', icon: <InfoCircleOutlined /> }
    };
    const { color, icon } = config[status?.toLowerCase()] || config.reported;
    return <Tag color={color} icon={icon}>{status?.toUpperCase() || 'UNKNOWN'}</Tag>;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type || 'Unknown'}</Tag>
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: getSeverityTag
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Reported',
      dataIndex: 'reported_date',
      key: 'reported_date',
      render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} />
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Delete this incident?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="environmental-incidents-management">
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Statistic 
              title="Total Incidents" 
              value={incidents.length}
              prefix={<AlertOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Open" 
              value={incidents.filter(i => i.status === 'reported' || i.status === 'investigating').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Resolved" 
              value={incidents.filter(i => i.status === 'resolved').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Report Incident
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={incidents}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingIncident ? 'Update Incident' : 'Report Incident'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, min: 3, message: 'Title must be at least 3 characters' }]}
          >
            <Input placeholder="Incident title" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select placeholder="Select type">
                  {types.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="Severity"
                rules={[{ required: true, message: 'Please select severity' }]}
              >
                <Select placeholder="Select severity">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input placeholder="Incident location" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, min: 10, message: 'Description must be at least 10 characters' }]}
          >
            <TextArea rows={4} placeholder="Detailed description of the incident" />
          </Form.Item>

          <Form.Item name="impact" label="Impact">
            <TextArea rows={3} placeholder="Environmental impact assessment" />
          </Form.Item>

          <Form.Item name="action_required" label="Action Required">
            <TextArea rows={3} placeholder="Required actions" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Department">
                <Input placeholder="Responsible department" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cost_estimate" label="Cost Estimate">
                <InputNumber 
                  style={{ width: '100%' }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="reported">Reported</Option>
              <Option value="investigating">Investigating</Option>
              <Option value="resolved">Resolved</Option>
              <Option value="closed">Closed</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingIncident ? 'Update' : 'Report'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnvironmentalIncidentsManagement;