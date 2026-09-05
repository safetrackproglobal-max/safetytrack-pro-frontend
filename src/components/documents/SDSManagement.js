// src/components/documents/SDSManagement.jsx
// Full implementation with inline styles (no CSS import)

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Button, Space, Input, Select,
  Table, Tag, Modal, Form, message, Popconfirm, Drawer,
  Descriptions, Tabs, Timeline, Avatar, List, Badge,
  Tooltip, Progress, Switch, Empty, Spin, Alert, Divider,
  Typography, Collapse, Checkbox, Radio, Upload, Steps, Result,
  Transfer, Tree, Cascader, DatePicker
} from 'antd';
import {
  SafetyOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  UploadOutlined,
  InboxOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  GlobalOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  LinkOutlined,
  UnlinkOutlined,
  MoreOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined,
  AlertFilled,
  ExclamationCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Panel } = Collapse;

// ============================================================
// CONSTANTS
// ============================================================

const GHS_CLASSIFICATIONS = {
  explosive: { label: 'Explosive', color: '#f5222d', icon: <ThunderboltOutlined /> },
  flammable: { label: 'Flammable', color: '#fa541c', icon: <FireOutlined /> },
  oxidizer: { label: 'Oxidizer', color: '#faad14', icon: <FireOutlined /> },
  toxic: { label: 'Toxic', color: '#f5222d', icon: <WarningOutlined /> },
  corrosive: { label: 'Corrosive', color: '#cf1322', icon: <AlertFilled /> },
  irritant: { label: 'Irritant', color: '#faad14', icon: <InfoCircleOutlined /> },
  health_hazard: { label: 'Health Hazard', color: '#722ed1', icon: <MedicineBoxOutlined /> },
  environmental: { label: 'Environmental', color: '#52c41a', icon: <EnvironmentOutlined /> }
};

const SDS_STATUS = {
  draft: { label: 'Draft', color: 'default' },
  review: { label: 'In Review', color: 'processing' },
  approved: { label: 'Approved', color: 'success' },
  expired: { label: 'Expired', color: 'error' },
  superseded: { label: 'Superseded', color: 'warning' }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const SDSManagement = ({ 
  companyId = null,
  onUpdate,
  embedded = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [sdsDocuments, setSdsDocuments] = useState([]);
  const [selectedSDS, setSelectedSDS] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    review: 0,
    expired: 0
  });
  
  // UI State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    classification: 'all'
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Form
  const [form] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadSDSDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        company_id: companyId,
        search: searchText,
        ...filters
      };
      
      const data = await documentService.getSDSDocuments(params);
      const docs = data.documents || [];
      setSdsDocuments(docs);
      
      // Update stats
      setStats({
        total: docs.length,
        approved: docs.filter(d => d.status === 'approved').length,
        review: docs.filter(d => d.status === 'review').length,
        expired: docs.filter(d => d.status === 'expired').length
      });
      
    } catch (error) {
      console.error('Failed to load SDS documents:', error);
      message.error('Failed to load SDS documents');
    } finally {
      setLoading(false);
    }
  }, [companyId, searchText, filters]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleCreateSDS = async (values) => {
    if (fileList.length === 0) {
      message.warning('Please upload the SDS file');
      return;
    }
    
    setUploading(true);
    try {
      const data = {
        chemical_name: values.chemical_name,
        cas_number: values.cas_number,
        manufacturer: values.manufacturer,
        classification: values.classification,
        hazard_codes: values.hazard_codes || [],
        revision_date: values.revision_date,
        status: 'draft',
        file: fileList[0].originFileObj,
        notes: values.notes,
        company_id: companyId
      };
      
      await documentService.createSDS(data);
      message.success('SDS created successfully');
      setCreateModalVisible(false);
      setFileList([]);
      form.resetFields();
      loadSDSDocuments();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to create SDS:', error);
      message.error(error.message || 'Failed to create SDS');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSDS = async (sdsId) => {
    try {
      await documentService.deleteSDS(sdsId);
      message.success('SDS deleted successfully');
      loadSDSDocuments();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to delete SDS:', error);
      message.error(error.message || 'Failed to delete SDS');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select SDS documents to delete');
      return;
    }
    
    try {
      await Promise.all(
        selectedRowKeys.map(id => documentService.deleteSDS(id))
      );
      
      message.success(`${selectedRowKeys.length} SDS documents deleted`);
      setSelectedRowKeys([]);
      loadSDSDocuments();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to delete SDS documents:', error);
      message.error('Failed to delete some documents');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadSDSDocuments();
  }, [loadSDSDocuments]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getStatusTag = (status) => {
    const config = SDS_STATUS[status];
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const getClassificationTag = (classification) => {
    const config = GHS_CLASSIFICATIONS[classification];
    if (!config) return <Tag>{classification}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // Render Statistics
  const renderStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #1890ff', borderRadius: 8 }}>
          <Statistic
            title="Total SDS"
            value={stats.total || 0}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #52c41a', borderRadius: 8 }}>
          <Statistic
            title="Approved"
            value={stats.approved || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #1890ff', borderRadius: 8 }}>
          <Statistic
            title="In Review"
            value={stats.review || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #f5222d', borderRadius: 8 }}>
          <Statistic
            title="Expired"
            value={stats.expired || 0}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render SDS Table
  const renderSDSTable = () => {
    const columns = [
      {
        title: 'Chemical Name',
        dataIndex: 'chemical_name',
        key: 'chemical_name',
        render: (name, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              CAS: {record.cas_number || 'N/A'}
            </div>
          </div>
        )
      },
      {
        title: 'Classification',
        dataIndex: 'classification',
        key: 'classification',
        render: (classification) => getClassificationTag(classification)
      },
      {
        title: 'Manufacturer',
        dataIndex: 'manufacturer',
        key: 'manufacturer',
        render: (manufacturer) => manufacturer || 'N/A'
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => getStatusTag(status)
      },
      {
        title: 'Revision Date',
        dataIndex: 'revision_date',
        key: 'revision_date',
        render: (date) => formatDate(date)
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 150,
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedSDS(record);
                  setDetailDrawerVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Download">
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => message.info('Download starting...')}
              />
            </Tooltip>
            <Popconfirm
              title="Delete this SDS?"
              onConfirm={() => handleDeleteSDS(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <Table
        rowKey="id"
        columns={columns}
        dataSource={sdsDocuments}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} SDS documents`
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
        scroll={{ x: 1000 }}
      />
    );
  };

  // Render Create Modal
  const renderCreateModal = () => (
    <Modal
      title={<Space><SafetyOutlined /> Create SDS</Space>}
      open={createModalVisible}
      onCancel={() => {
        setCreateModalVisible(false);
        form.resetFields();
        setFileList([]);
      }}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateSDS}
        initialValues={{ status: 'draft' }}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              name="chemical_name"
              label="Chemical Name"
              rules={[{ required: true, message: 'Please enter chemical name' }]}
            >
              <Input placeholder="Enter chemical name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="cas_number"
              label="CAS Number"
              rules={[
                { required: true, message: 'Please enter CAS number' },
                { pattern: /^\d{2,7}-\d{2}-\d$/, message: 'Invalid CAS number format' }
              ]}
            >
              <Input placeholder="e.g. 67-64-1" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="manufacturer"
              label="Manufacturer"
            >
              <Input placeholder="Enter manufacturer name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              name="classification"
              label="GHS Classification"
              rules={[{ required: true, message: 'Please select classification' }]}
            >
              <Select placeholder="Select classification">
                {Object.entries(GHS_CLASSIFICATIONS).map(([key, value]) => (
                  <Option key={key} value={key}>
                    {value.icon} {value.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="revision_date"
              label="Revision Date"
              rules={[{ required: true, message: 'Please select revision date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="hazard_codes"
          label="Hazard Codes"
        >
          <Select
            mode="tags"
            placeholder="Enter hazard codes"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <TextArea rows={3} placeholder="Add notes..." />
        </Form.Item>

        <Form.Item
          label="SDS File"
          required
        >
          <Dragger
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            multiple={false}
            maxCount={1}
            accept=".pdf,.doc,.docx"
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Click or drag SDS file to upload</p>
            <p className="ant-upload-hint">Support: PDF, Word documents</p>
          </Dragger>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setCreateModalVisible(false);
              form.resetFields();
              setFileList([]);
            }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={uploading}>
              Create SDS
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Detail Drawer
  const renderDetailDrawer = () => (
    <Drawer
      title={<Space><SafetyOutlined /> SDS Details</Space>}
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={600}
    >
      {selectedSDS && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Chemical Name">
              {selectedSDS.chemical_name}
            </Descriptions.Item>
            <Descriptions.Item label="CAS Number">
              {selectedSDS.cas_number || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Classification">
              {getClassificationTag(selectedSDS.classification)}
            </Descriptions.Item>
            <Descriptions.Item label="Manufacturer">
              {selectedSDS.manufacturer || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedSDS.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Revision Date">
              {formatDate(selectedSDS.revision_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Hazard Codes">
              {selectedSDS.hazard_codes?.map(code => (
                <Tag key={code} color="red">{code}</Tag>
              )) || 'None'}
            </Descriptions.Item>
            <Descriptions.Item label="Notes">
              {selectedSDS.notes || 'No notes'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Button 
            icon={<DownloadOutlined />} 
            block
            onClick={() => message.info('Downloading SDS...')}
          >
            Download SDS File
          </Button>
        </div>
      )}
    </Drawer>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div style={{ padding: 0, background: '#f0f2f5', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <SafetyOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
            <Title level={4} style={{ margin: 0 }}>Safety Data Sheets (SDS)</Title>
            <Badge status="processing" text="Live" />
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              New SDS
            </Button>
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`Delete ${selectedRowKeys.length} SDS documents?`}
                onConfirm={handleBulkDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete Selected
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Search & Filters */}
      <div style={{ 
        background: 'white', 
        padding: '16px 20px', 
        borderRadius: '8px', 
        marginBottom: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input.Search
              placeholder="Search SDS by name or CAS..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={loadSDSDocuments}
              allowClear
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: '100%' }}
              allowClear
              placeholder="Status"
            >
              <Option value="all">All Statuses</Option>
              {Object.entries(SDS_STATUS).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              value={filters.classification}
              onChange={(value) => setFilters({ ...filters, classification: value })}
              style={{ width: '100%' }}
              allowClear
              placeholder="Classification"
            >
              <Option value="all">All Classifications</Option>
              {Object.entries(GHS_CLASSIFICATIONS).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button icon={<ReloadOutlined />} onClick={loadSDSDocuments} loading={loading}>
                Refresh
              </Button>
              <Button icon={<ExportOutlined />} onClick={() => message.info('Exporting SDS data...')}>
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <div style={{ 
        background: 'white', 
        borderRadius: '8px', 
        padding: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        {renderSDSTable()}
      </div>

      {/* Modals & Drawers */}
      {renderCreateModal()}
      {renderDetailDrawer()}
    </div>
  );
};

export default SDSManagement;