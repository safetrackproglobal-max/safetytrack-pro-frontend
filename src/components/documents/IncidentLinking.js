// src/components/documents/IncidentLinking.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Button, Space, Input, Select,
  Table, Tag, Modal, Form, message, Popconfirm, Drawer,
  Descriptions, Tabs, Timeline, Avatar, List, Badge,
  Tooltip, Progress, Switch, Empty, Spin, Alert, Divider,
  Typography, Collapse, Checkbox, Radio, Upload, Steps, Result,
  Transfer, Tree, Cascader
} from 'antd';
import {
  WarningOutlined,
  LinkOutlined,
  FireOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  AlertFilled,
  ExclamationCircleOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  GlobalOutlined,
  MedicineBoxOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ProfileOutlined,
  MoreOutlined,
  SendOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import { apiGet } from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Panel } = Collapse;

// ============================================================
// CONSTANTS
// ============================================================

const INCIDENT_TYPES = {
  accident: { label: 'Accident', color: '#f5222d', icon: <WarningOutlined /> },
  near_miss: { label: 'Near Miss', color: '#faad14', icon: <InfoCircleOutlined /> },
  safety_incident: { label: 'Safety Incident', color: '#fa541c', icon: <SafetyOutlined /> },
  environmental: { label: 'Environmental', color: '#52c41a', icon: <EnvironmentOutlined /> },
  health: { label: 'Health', color: '#1890ff', icon: <MedicineBoxOutlined /> },
  quality: { label: 'Quality', color: '#722ed1', icon: <CheckCircleOutlined /> },
  security: { label: 'Security', color: '#13c2c2', icon: <SafetyCertificateOutlined /> },
  fire: { label: 'Fire', color: '#f5222d', icon: <FireOutlined /> },
  electrical: { label: 'Electrical', color: '#faad14', icon: <ThunderboltOutlined /> },
  structural_collapse: { label: 'Structural Collapse', color: '#cf1322', icon: <ExclamationCircleOutlined /> },
  equipment_failure: { label: 'Equipment Failure', color: '#faad14', icon: <SettingOutlined /> },
  fall_height: { label: 'Fall from Height', color: '#fa541c', icon: <ExclamationCircleOutlined /> },
  needle_stick: { label: 'Needle Stick', color: '#f5222d', icon: <MedicineBoxOutlined /> },
  medication_error: { label: 'Medication Error', color: '#faad14', icon: <MedicineBoxOutlined /> },
  patient_fall: { label: 'Patient Fall', color: '#fa541c', icon: <UserOutlined /> },
  biohazard: { label: 'Biohazard', color: '#f5222d', icon: <AlertFilled /> },
  fire_explosion: { label: 'Fire/Explosion', color: '#cf1322', icon: <FireOutlined /> },
  ground_incident: { label: 'Ground Incident', color: '#faad14', icon: <EnvironmentOutlined /> },
  equipment_accident: { label: 'Equipment Accident', color: '#f5222d', icon: <SettingOutlined /> }
};

const INCIDENT_SEVERITY = {
  critical: { label: 'Critical', color: '#cf1322' },
  high: { label: 'High', color: '#f5222d' },
  medium: { label: 'Medium', color: '#faad14' },
  low: { label: 'Low', color: '#52c41a' }
};

const INCIDENT_STATUS = {
  reported: { label: 'Reported', color: 'default' },
  investigating: { label: 'Investigating', color: 'processing' },
  resolved: { label: 'Resolved', color: 'success' },
  closed: { label: 'Closed', color: 'default' }
};

const LINK_STATUS = {
  active: { label: 'Active', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  resolved: { label: 'Resolved', color: 'processing' },
  archived: { label: 'Archived', color: 'default' }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const IncidentLinking = ({ 
  documentId = null,
  companyId = null,
  onUpdate,
  embedded = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [linkedIncidents, setLinkedIncidents] = useState([]);
  const [availableIncidents, setAvailableIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    resolved: 0
  });
  
  // UI State
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    status: 'all'
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedIncidentIds, setSelectedIncidentIds] = useState([]);
  const [incidentData, setIncidentData] = useState([]);
  
  // Form
  const [form] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all incidents from the API
      const response = await apiGet('/incidents');
      
      if (response && response.success) {
        const incidents = response.incidents || [];
        setIncidentData(incidents);
        
        // For now, linked incidents would be those that have a document_id reference
        // Since we don't have a direct link table yet, we'll show all incidents
        // that could be linked to this document
        const linked = incidents.filter(inc => 
          inc.project_id === parseInt(companyId) || 
          inc.company_id === parseInt(companyId)
        );
        
        setLinkedIncidents(linked);
        
        // Update stats
        setStats({
          total: linked.length,
          active: linked.filter(i => i.status === 'reported' || i.status === 'investigating').length,
          pending: linked.filter(i => i.status === 'investigating').length,
          resolved: linked.filter(i => i.status === 'resolved' || i.status === 'closed').length
        });
      } else {
        setIncidentData([]);
        setLinkedIncidents([]);
      }
      
    } catch (error) {
      console.error('Failed to load incidents:', error);
      message.error('Failed to load incidents');
      setIncidentData([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, documentId]);

  const loadAvailableIncidents = useCallback(async () => {
    try {
      // Filter incidents that are not already linked
      const linkedIds = linkedIncidents.map(i => i.id);
      const available = incidentData.filter(
        inc => !linkedIds.includes(inc.id)
      );
      setAvailableIncidents(available);
      
    } catch (error) {
      console.error('Failed to load available incidents:', error);
      setAvailableIncidents([]);
    }
  }, [incidentData, linkedIncidents]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleLinkIncidents = async (values) => {
    if (selectedIncidentIds.length === 0) {
      message.warning('Please select at least one incident');
      return;
    }
    
    try {
      // Here you would call your API to link incidents to the document
      // For now, we'll simulate the linking
      
      const selectedIncidents = availableIncidents.filter(
        inc => selectedIncidentIds.includes(inc.id)
      );
      
      // Add to linked incidents
      const newLinked = [...linkedIncidents, ...selectedIncidents];
      setLinkedIncidents(newLinked);
      
      // Remove from available
      setAvailableIncidents(
        availableIncidents.filter(inc => !selectedIncidentIds.includes(inc.id))
      );
      
      message.success(`${selectedIncidents.length} incidents linked successfully`);
      setLinkModalVisible(false);
      setSelectedIncidentIds([]);
      form.resetFields();
      
      // Update stats
      setStats({
        total: newLinked.length,
        active: newLinked.filter(i => i.status === 'reported' || i.status === 'investigating').length,
        pending: newLinked.filter(i => i.status === 'investigating').length,
        resolved: newLinked.filter(i => i.status === 'resolved' || i.status === 'closed').length
      });
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to link incidents:', error);
      message.error(error.message || 'Failed to link incidents');
    }
  };

  const handleUnlinkIncident = async (incidentId) => {
    try {
      // Remove from linked incidents
      const newLinked = linkedIncidents.filter(i => i.id !== incidentId);
      setLinkedIncidents(newLinked);
      
      // Add back to available
      const unlinkedIncident = linkedIncidents.find(i => i.id === incidentId);
      if (unlinkedIncident) {
        setAvailableIncidents([...availableIncidents, unlinkedIncident]);
      }
      
      message.success('Incident unlinked successfully');
      
      // Update stats
      setStats({
        total: newLinked.length,
        active: newLinked.filter(i => i.status === 'reported' || i.status === 'investigating').length,
        pending: newLinked.filter(i => i.status === 'investigating').length,
        resolved: newLinked.filter(i => i.status === 'resolved' || i.status === 'closed').length
      });
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to unlink incident:', error);
      message.error(error.message || 'Failed to unlink incident');
    }
  };

  const handleBulkUnlink = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select incidents to unlink');
      return;
    }
    
    try {
      // Remove selected incidents
      const newLinked = linkedIncidents.filter(
        i => !selectedRowKeys.includes(i.id)
      );
      
      // Add back to available
      const unlinkedIncidents = linkedIncidents.filter(
        i => selectedRowKeys.includes(i.id)
      );
      setAvailableIncidents([...availableIncidents, ...unlinkedIncidents]);
      
      setLinkedIncidents(newLinked);
      setSelectedRowKeys([]);
      
      message.success(`${selectedRowKeys.length} incidents unlinked`);
      
      // Update stats
      setStats({
        total: newLinked.length,
        active: newLinked.filter(i => i.status === 'reported' || i.status === 'investigating').length,
        pending: newLinked.filter(i => i.status === 'investigating').length,
        resolved: newLinked.filter(i => i.status === 'resolved' || i.status === 'closed').length
      });
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to unlink incidents:', error);
      message.error('Failed to unlink some incidents');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    if (linkModalVisible) {
      loadAvailableIncidents();
    }
  }, [linkModalVisible, loadAvailableIncidents]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getIncidentTypeTag = (type) => {
    const config = INCIDENT_TYPES[type];
    if (!config) return <Tag>{type}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getSeverityTag = (severity) => {
    const config = INCIDENT_SEVERITY[severity];
    if (!config) return <Tag>{severity}</Tag>;
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const getStatusTag = (status) => {
    const config = INCIDENT_STATUS[status];
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
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #1890ff', borderRadius: 8 }}>
          <Statistic
            title="Linked Incidents"
            value={stats.total || 0}
            prefix={<LinkOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #52c41a', borderRadius: 8 }}>
          <Statistic
            title="Active"
            value={stats.active || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #faad14', borderRadius: 8 }}>
          <Statistic
            title="Pending"
            value={stats.pending || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" style={{ borderLeft: '4px solid #1890ff', borderRadius: 8 }}>
          <Statistic
            title="Resolved"
            value={stats.resolved || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Linked Incidents Table
  const renderLinkedIncidents = () => {
    const columns = [
      {
        title: 'Incident',
        dataIndex: 'incident_number',
        key: 'incident_number',
        render: (number, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{number}</div>
            <div>{record.title}</div>
          </div>
        )
      },
      {
        title: 'Type',
        dataIndex: 'incident_type',
        key: 'incident_type',
        render: (type) => getIncidentTypeTag(type)
      },
      {
        title: 'Severity',
        dataIndex: 'severity',
        key: 'severity',
        render: (severity) => getSeverityTag(severity)
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => getStatusTag(status)
      },
      {
        title: 'Date',
        dataIndex: 'date_occurred',
        key: 'date_occurred',
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
                  setSelectedIncident(record);
                  setDetailDrawerVisible(true);
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Unlink this incident?"
              onConfirm={() => handleUnlinkIncident(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Unlink">
                <Button
                  type="text"
                  size="small"
                  icon={<LinkOutlined />}
                  danger
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <div style={{ 
        background: 'white', 
        borderRadius: '8px', 
        padding: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={linkedIncidents}
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} incidents`
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
          scroll={{ x: 1000 }}
        />
      </div>
    );
  };

  // Render Link Modal
  const renderLinkModal = () => (
    <Modal
      title={<Space><LinkOutlined /> Link Incidents</Space>}
      open={linkModalVisible}
      onCancel={() => {
        setLinkModalVisible(false);
        setSelectedIncidentIds([]);
        form.resetFields();
      }}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleLinkIncidents}
      >
        <Form.Item label="Available Incidents">
          <Transfer
            dataSource={availableIncidents}
            titles={['Available Incidents', 'Selected']}
            targetKeys={selectedIncidentIds}
            onChange={setSelectedIncidentIds}
            render={item => (
              <div>
                <div style={{ fontWeight: 500 }}>{item.incident_number}</div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  {item.title} • {getIncidentTypeTag(item.incident_type)}
                </div>
              </div>
            )}
            listStyle={{
              width: '100%',
              height: 300
            }}
            showSearch
            searchPlaceholder="Search incidents..."
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <TextArea rows={3} placeholder="Add notes about the link..." />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setLinkModalVisible(false);
              setSelectedIncidentIds([]);
              form.resetFields();
            }}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Link Incidents
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Detail Drawer
  const renderDetailDrawer = () => (
    <Drawer
      title={<Space><WarningOutlined /> Incident Details</Space>}
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={600}
    >
      {selectedIncident && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Incident Number">
              {selectedIncident.incident_number}
            </Descriptions.Item>
            <Descriptions.Item label="Title">
              {selectedIncident.title}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              {getIncidentTypeTag(selectedIncident.incident_type)}
            </Descriptions.Item>
            <Descriptions.Item label="Severity">
              {getSeverityTag(selectedIncident.severity)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedIncident.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedIncident.location || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Department">
              {selectedIncident.department || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Date Occurred">
              {formatDate(selectedIncident.date_occurred)}
            </Descriptions.Item>
            <Descriptions.Item label="Reported By">
              {selectedIncident.reporter_name || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedIncident.description || 'No description'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Button 
            icon={<EyeOutlined />} 
            block
            onClick={() => {
              message.info('Navigating to incident details...');
            }}
          >
            View Full Incident Report
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
            <LinkOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
            <Title level={4} style={{ margin: 0 }}>Incident Linking</Title>
            <Badge status="processing" text="Live" />
          </Space>
          <Space>
            {documentId && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setLinkModalVisible(true)}
              >
                Link Incidents
              </Button>
            )}
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`Unlink ${selectedRowKeys.length} incidents?`}
                onConfirm={handleBulkUnlink}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<LinkOutlined />}>
                  Unlink Selected
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Table */}
      {documentId ? (
        renderLinkedIncidents()
      ) : (
        <Card>
          <Empty 
            description="Select a document to view linked incidents" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {/* Modals & Drawers */}
      {renderLinkModal()}
      {renderDetailDrawer()}
    </div>
  );
};

export default IncidentLinking;