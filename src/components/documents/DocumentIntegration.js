// src/components/documents/DocumentIntegration.jsx
// Document Integration Component - Link documents to incidents, risks, training, etc.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag, Modal,
  Form, message, Popconfirm, Drawer, Descriptions, Tabs, Timeline,
  Avatar, List, Badge, Tooltip, Progress, Switch, Empty, Spin,
  Alert, Divider, Collapse, Typography, Transfer, Tree, Cascader,
  Radio, Checkbox, Upload, DatePicker
} from 'antd';
import {
  LinkOutlined,
  UnlinkOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  GlobalOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  TeamOutlined,
  AppstoreOutlined,
  UserOutlined,
  MailOutlined,
  InfoCircleOutlined,
  LinkOutlined as LinkIcon,
  AuditOutlined,
  CalendarOutlined,
  PaperClipOutlined,
  PushpinOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  ExportOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './DocumentIntegration.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================

const LINK_TYPES = {
  incident: { 
    label: 'Incident', 
    color: '#f5222d', 
    icon: <WarningOutlined />,
    module: 'HSE'
  },
  risk: { 
    label: 'Risk Assessment', 
    color: '#faad14', 
    icon: <SafetyOutlined />,
    module: 'HSE'
  },
  training: { 
    label: 'Training Record', 
    color: '#2f54eb', 
    icon: <TeamOutlined />,
    module: 'Training'
  },
  permit: { 
    label: 'Permit/License', 
    color: '#52c41a', 
    icon: <SafetyCertificateOutlined />,
    module: 'Environmental'
  },
  environmental: { 
    label: 'Environmental Data', 
    color: '#13c2c2', 
    icon: <EnvironmentOutlined />,
    module: 'Environmental'
  },
  hospital: { 
    label: 'Hospital Record', 
    color: '#f5222d', 
    icon: <MedicineBoxOutlined />,
    module: 'Hospital'
  },
  quality: { 
    label: 'Quality Record', 
    color: '#1890ff', 
    icon: <CheckCircleOutlined />,
    module: 'Quality'
  },
  supply_chain: { 
    label: 'Supply Chain', 
    color: '#722ed1', 
    icon: <GlobalOutlined />,
    module: 'Supply Chain'
  }
};

const LINK_STATUS = {
  active: { label: 'Active', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  archived: { label: 'Archived', color: 'default' },
  removed: { label: 'Removed', color: 'error' }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const DocumentIntegration = ({ 
  documentId = null,
  companyId = null,
  onLinkChange,
  embedded = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [linkStats, setLinkStats] = useState({
    total: 0,
    incident: 0,
    risk: 0,
    training: 0,
    permit: 0,
    environmental: 0,
    hospital: 0,
    quality: 0,
    supply_chain: 0
  });
  
  // UI State
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    link_type: 'all',
    status: 'all'
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [linkType, setLinkType] = useState('incident');
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Form
  const [form] = Form.useForm();

  // ============================================================
  // VALIDATION FUNCTIONS
  // ============================================================
  
  const validateSearch = (value) => {
    if (!value) return true;
    if (value.length < 2) {
      message.warning('Please enter at least 2 characters to search');
      return false;
    }
    if (value.length > 100) {
      message.warning('Search text cannot exceed 100 characters');
      return false;
    }
    return true;
  };

  const sanitizeInput = (value) => {
    if (!value) return '';
    return value.trim().replace(/[<>]/g, '');
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const sanitizedSearch = sanitizeInput(searchText);
      
      const params = {
        search: sanitizedSearch,
        ...filters,
        document_id: documentId,
        company_id: companyId
      };
      
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });
      
      const data = await documentService.getDocumentLinks(params);
      
      const linksData = data.links || data.data || [];
      setLinks(linksData);
      
      // Update stats
      const stats = data.stats || {};
      setLinkStats({
        total: stats.total || linksData.length || 0,
        incident: stats.incident || linksData.filter(l => l.link_type === 'incident').length,
        risk: stats.risk || linksData.filter(l => l.link_type === 'risk').length,
        training: stats.training || linksData.filter(l => l.link_type === 'training').length,
        permit: stats.permit || linksData.filter(l => l.link_type === 'permit').length,
        environmental: stats.environmental || linksData.filter(l => l.link_type === 'environmental').length,
        hospital: stats.hospital || linksData.filter(l => l.link_type === 'hospital').length,
        quality: stats.quality || linksData.filter(l => l.link_type === 'quality').length,
        supply_chain: stats.supply_chain || linksData.filter(l => l.link_type === 'supply_chain').length
      });
      
    } catch (error) {
      console.error('Failed to load links:', error);
      message.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  }, [searchText, filters, documentId, companyId]);

  const loadAvailableItems = useCallback(async (type) => {
    try {
      const data = await documentService.getAvailableLinkItems(type, {
        company_id: companyId,
        document_id: documentId
      });
      setAvailableItems(data.items || []);
    } catch (error) {
      console.error('Failed to load available items:', error);
      message.error('Failed to load available items');
    }
  }, [companyId, documentId]);

  // ============================================================
  // LINK OPERATIONS
  // ============================================================
  
  const handleCreateLink = async (values) => {
    if (selectedItems.length === 0) {
      message.warning('Please select at least one item to link');
      return;
    }
    
    try {
      await documentService.createDocumentLink({
        document_id: documentId,
        link_type: linkType,
        target_ids: selectedItems,
        notes: sanitizeInput(values.notes || ''),
        company_id: companyId
      });
      
      message.success(`${selectedItems.length} items linked successfully`);
      setLinkModalVisible(false);
      setSelectedItems([]);
      form.resetFields();
      loadLinks();
      
      if (onLinkChange) onLinkChange();
      
    } catch (error) {
      console.error('Failed to create link:', error);
      message.error(error.message || 'Failed to create link');
    }
  };

  const handleRemoveLink = async (linkId) => {
    try {
      await documentService.removeDocumentLink(linkId);
      message.success('Link removed successfully');
      loadLinks();
      if (onLinkChange) onLinkChange();
    } catch (error) {
      console.error('Failed to remove link:', error);
      message.error(error.message || 'Failed to remove link');
    }
  };

  const handleBulkRemove = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one link to remove');
      return;
    }
    
    try {
      await documentService.bulkRemoveLinks(selectedRowKeys);
      message.success(`${selectedRowKeys.length} links removed`);
      setSelectedRowKeys([]);
      loadLinks();
      if (onLinkChange) onLinkChange();
    } catch (error) {
      console.error('Failed to bulk remove links:', error);
      message.error(error.message || 'Failed to remove links');
    }
  };

  // ============================================================
  // SEARCH HANDLER
  // ============================================================
  
  const handleSearch = () => {
    if (!validateSearch(searchText)) {
      return;
    }
    loadLinks();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value.length > 100) {
      message.warning('Search text cannot exceed 100 characters');
      return;
    }
    setSearchText(value);
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    if (documentId) {
      loadLinks();
    }
  }, [loadLinks, documentId]);

  useEffect(() => {
    if (linkModalVisible && linkType) {
      loadAvailableItems(linkType);
    }
  }, [linkModalVisible, linkType, loadAvailableItems]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getLinkTypeTag = (type) => {
    const config = LINK_TYPES[type];
    if (!config) return <Tag>{type}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getLinkTypeIcon = (type) => {
    const config = LINK_TYPES[type];
    return config?.icon || <LinkIcon />;
  };

  const getStatusTag = (status) => {
    const config = LINK_STATUS[status];
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================

  // Render Statistics
  const renderStats = () => (
    <Row gutter={[16, 16]} className="integration-stats">
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-total">
          <Statistic
            title="Total Links"
            value={linkStats.total || 0}
            prefix={<LinkIcon />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-incident">
          <Statistic
            title="Incidents"
            value={linkStats.incident || 0}
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-risk">
          <Statistic
            title="Risks"
            value={linkStats.risk || 0}
            prefix={<SafetyOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-training">
          <Statistic
            title="Training"
            value={linkStats.training || 0}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#2f54eb' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Filters
  const renderFilters = () => (
    <div className="integration-filters">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} md={6}>
          <Input.Search
            placeholder="Search links..."
            value={searchText}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            allowClear
            prefix={<SearchOutlined />}
            maxLength={100}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Select
            value={filters.link_type}
            onChange={(value) => setFilters({ ...filters, link_type: value })}
            style={{ width: '100%' }}
            allowClear
            placeholder="Link Type"
          >
            <Option value="all">All Types</Option>
            {Object.entries(LINK_TYPES).map(([key, value]) => (
              <Option key={key} value={key}>
                {value.icon} {value.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={4}>
          <Select
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: '100%' }}
            allowClear
            placeholder="Status"
          >
            <Option value="all">All Statuses</Option>
            {Object.entries(LINK_STATUS).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8} md={10}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button icon={<ReloadOutlined />} onClick={loadLinks} loading={loading} size="small">
              Refresh
            </Button>
            {documentId && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setLinkModalVisible(true)}
                size="small"
              >
                Add Link
              </Button>
            )}
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`Remove ${selectedRowKeys.length} links?`}
                onConfirm={handleBulkRemove}
                okText="Yes"
                cancelText="No"
              >
                <Button danger size="small" icon={<DeleteOutlined />}>
                  Remove Selected
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );

  // Render Links Table
  const renderLinksTable = () => {
    const columns = [
      {
        title: 'Linked Item',
        dataIndex: 'target_title',
        key: 'target_title',
        render: (title, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {getLinkTypeIcon(record.link_type)}
            <div>
              <div style={{ fontWeight: 500 }}>{title || record.target_title}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                {getLinkTypeTag(record.link_type)}
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'Module',
        dataIndex: 'module',
        key: 'module',
        render: (module) => {
          const mod = Object.values(LINK_TYPES).find(m => m.module === module);
          return <Tag>{mod?.module || module || 'N/A'}</Tag>;
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => getStatusTag(status)
      },
      {
        title: 'Linked By',
        dataIndex: 'created_by',
        key: 'created_by',
        render: (user) => user?.name || user || 'Unknown'
      },
      {
        title: 'Date',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date) => formatDate(date)
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        render: (_, record) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedLink(record);
                  setDetailDrawerVisible(true);
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Remove this link?"
              onConfirm={() => handleRemoveLink(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Remove Link">
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
        dataSource={links}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} links`,
          pageSizeOptions: ['10', '20', '50']
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
        scroll={{ x: 1000 }}
      />
    );
  };

  // Render Link Modal
  const renderLinkModal = () => (
    <Modal
      title={<Space><PlusOutlined /> Create Document Link</Space>}
      open={linkModalVisible}
      onCancel={() => {
        setLinkModalVisible(false);
        setSelectedItems([]);
        form.resetFields();
      }}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateLink}
      >
        <Form.Item
          label="Link Type"
          rules={[{ required: true }]}
        >
          <Radio.Group 
            value={linkType} 
            onChange={(e) => {
              setLinkType(e.target.value);
              setSelectedItems([]);
            }}
            style={{ width: '100%' }}
          >
            <Row gutter={[8, 8]}>
              {Object.entries(LINK_TYPES).map(([key, value]) => (
                <Col span={8} key={key}>
                  <Radio.Button value={key} style={{ width: '100%', textAlign: 'center' }}>
                    {value.icon} {value.label}
                  </Radio.Button>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={`Available ${LINK_TYPES[linkType]?.label || 'Items'}`}
          rules={[{ required: true, message: 'Please select at least one item' }]}
        >
          <Transfer
            dataSource={availableItems}
            titles={['Available', 'Selected']}
            targetKeys={selectedItems}
            onChange={setSelectedItems}
            render={item => item.title}
            listStyle={{
              width: '100%',
              height: 300
            }}
            showSearch
            searchPlaceholder={`Search ${LINK_TYPES[linkType]?.label || 'items'}...`}
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <TextArea 
            rows={3} 
            placeholder="Add notes about this link..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setLinkModalVisible(false);
              setSelectedItems([]);
              form.resetFields();
            }}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Create Link
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Detail Drawer
  const renderDetailDrawer = () => (
    <Drawer
      title={<Space><LinkIcon /> Link Details</Space>}
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={500}
    >
      {selectedLink && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Linked Item">
              {selectedLink.target_title}
            </Descriptions.Item>
            <Descriptions.Item label="Link Type">
              {getLinkTypeTag(selectedLink.link_type)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedLink.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Module">
              {selectedLink.module || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Linked By">
              {selectedLink.created_by?.name || selectedLink.created_by || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {formatDate(selectedLink.created_at)}
            </Descriptions.Item>
            {selectedLink.notes && (
              <Descriptions.Item label="Notes">
                {selectedLink.notes}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider />

          <Button 
            icon={<EyeOutlined />} 
            block
            onClick={() => {
              // Navigate to the linked item
              message.info(`Navigating to ${selectedLink.target_title}`);
            }}
          >
            View Linked Item
          </Button>

          <Divider />

          <Popconfirm
            title="Remove this link?"
            onConfirm={() => {
              handleRemoveLink(selectedLink.id);
              setDetailDrawerVisible(false);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} block>
              Remove Link
            </Button>
          </Popconfirm>
        </div>
      )}
    </Drawer>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="document-integration">
      {/* Header */}
      <div className="integration-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <LinkIcon style={{ fontSize: 24, color: '#4fc3f7' }} />
            <Title level={4} style={{ margin: 0 }}>Document Integration</Title>
            <Badge status="processing" text="Live" />
          </Space>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      {renderFilters()}

      {/* Table */}
      {renderLinksTable()}

      {/* Modals & Drawers */}
      {renderLinkModal()}
      {renderDetailDrawer()}
    </div>
  );
};

export default DocumentIntegration;