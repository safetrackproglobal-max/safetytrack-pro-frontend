// src/components/documents/ComplianceFramework.jsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Button, Space, Input, Select,
  Table, Tag, Modal, Form, message, Popconfirm, Drawer,
  Descriptions, Tabs, Timeline, Avatar, List, Badge,
  Tooltip, Progress, Switch, Empty, Spin, Alert, Divider,
  Typography, Collapse, Checkbox, Radio, Upload, Steps, Result, DatePicker
} from 'antd';
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  AuditOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ExportOutlined,
  UploadOutlined,
  InboxOutlined,
  StarOutlined,
  StarFilled,
  FilterOutlined,
  SettingOutlined,
  LinkOutlined,
  UnlinkOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  GlobalOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './ComplianceFramework.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Dragger } = Upload;

// ============================================================
// CONSTANTS
// ============================================================

const COMPLIANCE_FRAMEWORKS = {
  iso9001: { label: 'ISO 9001:2015', color: '#1890ff', icon: <SafetyCertificateOutlined /> },
  iso14001: { label: 'ISO 14001:2015', color: '#52c41a', icon: <GlobalOutlined /> },
  iso45001: { label: 'ISO 45001:2018', color: '#faad14', icon: <SafetyOutlined /> },
  ohsas18001: { label: 'OHSAS 18001', color: '#f5222d', icon: <SafetyOutlined /> },
  gdpr: { label: 'GDPR', color: '#722ed1', icon: <AuditOutlined /> },
  hipaa: { label: 'HIPAA', color: '#13c2c2', icon: <SafetyCertificateOutlined /> },
  osha: { label: 'OSHA', color: '#fa541c', icon: <SafetyOutlined /> },
  epa: { label: 'EPA', color: '#52c41a', icon: <GlobalOutlined /> }
};

const COMPLIANCE_STATUS = {
  compliant: { label: 'Compliant', color: 'success', icon: <CheckCircleOutlined /> },
  non_compliant: { label: 'Non-Compliant', color: 'error', icon: <CloseCircleOutlined /> },
  partial: { label: 'Partial', color: 'warning', icon: <WarningOutlined /> },
  pending: { label: 'Pending Review', color: 'processing', icon: <ClockCircleOutlined /> },
  not_applicable: { label: 'Not Applicable', color: 'default', icon: <InfoCircleOutlined /> }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const ComplianceFramework = ({ 
  documentId = null,
  companyId = null,
  onUpdate,
  embedded = false
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [complianceData, setComplianceData] = useState({
    overall_score: 0,
    frameworks: [],
    pending_items: 0,
    compliant_items: 0,
    non_compliant_items: 0
  });
  const [frameworks, setFrameworks] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  
  // UI State
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    framework: 'all'
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [reportFormat, setReportFormat] = useState('pdf');
  
  // Form
  const [form] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadComplianceData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        company_id: companyId,
        document_id: documentId
      };
      
      // Get dashboard data
      const dashboardData = await documentService.getComplianceDashboard(params);
      setComplianceData(dashboardData);
      
      // Get frameworks
      const frameworksData = await documentService.getComplianceFrameworks(params);
      setFrameworks(frameworksData.frameworks || []);
      
      // If documentId provided, get requirements
      if (documentId) {
        const reqData = await documentService.getDocumentComplianceRequirements(documentId);
        setRequirements(reqData.requirements || []);
        
        const auditData = await documentService.getComplianceAudit(documentId);
        setAuditTrail(auditData.audits || []);
      }
      
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      message.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }, [companyId, documentId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleLinkFramework = async (values) => {
    try {
      await documentService.linkToComplianceFramework(
        documentId,
        values.framework_id,
        {
          notes: values.notes,
          target_date: values.target_date,
          requirements: values.requirements || []
        }
      );
      
      message.success('Framework linked successfully');
      setLinkModalVisible(false);
      form.resetFields();
      loadComplianceData();
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to link framework:', error);
      message.error(error.message || 'Failed to link framework');
    }
  };

  const handleCheckCompliance = async () => {
    try {
      const result = await documentService.checkComplianceStatus(documentId);
      message.success(`Compliance check completed: ${result.score}% compliant`);
      loadComplianceData();
    } catch (error) {
      console.error('Compliance check failed:', error);
      message.error('Failed to check compliance');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await documentService.generateComplianceReport(documentId, reportFormat);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compliance-report.${reportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Report downloaded successfully');
      setReportModalVisible(false);
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      message.error('Failed to generate report');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadComplianceData();
  }, [loadComplianceData]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getStatusTag = (status) => {
    const config = COMPLIANCE_STATUS[status];
    if (!config) return <Tag>{status}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
  };

  const getFrameworkTag = (framework) => {
    const config = COMPLIANCE_FRAMEWORKS[framework];
    if (!config) return <Tag>{framework}</Tag>;
    return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
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
    <Row gutter={[16, 16]} className="compliance-stats">
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-total">
          <Statistic
            title="Overall Compliance"
            value={complianceData.overall_score || 0}
            suffix="%"
            prefix={<SafetyCertificateOutlined />}
            valueStyle={{ color: (complianceData.overall_score || 0) >= 80 ? '#52c41a' : '#faad14' }}
          />
          <Progress 
            percent={complianceData.overall_score || 0} 
            strokeColor={(complianceData.overall_score || 0) >= 80 ? '#52c41a' : '#faad14'}
            showInfo={false}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-compliant">
          <Statistic
            title="Compliant"
            value={complianceData.compliant_items || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-non-compliant">
          <Statistic
            title="Non-Compliant"
            value={complianceData.non_compliant_items || 0}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="stat-card stat-pending">
          <Statistic
            title="Pending Review"
            value={complianceData.pending_items || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Frameworks List
  const renderFrameworks = () => (
    <Card 
      title="Compliance Frameworks" 
      size="small"
      extra={
        <Space>
          {documentId && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setLinkModalVisible(true)}
            >
              Link Framework
            </Button>
          )}
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadComplianceData} 
            loading={loading}
          />
        </Space>
      }
    >
      {frameworks.length > 0 ? (
        <List
          dataSource={frameworks}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => {
                    setSelectedFramework(item);
                    setDetailDrawerVisible(true);
                  }}
                >
                  View Details
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={COMPLIANCE_FRAMEWORKS[item.framework_id]?.icon || <SafetyCertificateOutlined />}
                    style={{ 
                      backgroundColor: COMPLIANCE_FRAMEWORKS[item.framework_id]?.color || '#1890ff',
                      color: 'white'
                    }}
                  />
                }
                title={
                  <Space>
                    <span>{COMPLIANCE_FRAMEWORKS[item.framework_id]?.label || item.framework_id}</span>
                    {getStatusTag(item.status)}
                    <Tag>{item.compliance_score || 0}%</Tag>
                  </Space>
                }
                description={
                  <div>
                    <div>{item.description || 'No description'}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      Last checked: {formatDate(item.last_checked)}
                      {item.target_date && ` • Target: ${formatDate(item.target_date)}`}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No compliance frameworks linked" />
      )}
    </Card>
  );

  // Render Requirements Table
  const renderRequirements = () => {
    const columns = [
      {
        title: 'Requirement',
        dataIndex: 'requirement',
        key: 'requirement'
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => getStatusTag(status)
      },
      {
        title: 'Evidence',
        dataIndex: 'evidence',
        key: 'evidence',
        render: (evidence) => (
          <Tooltip title={evidence}>
            <Button type="link" size="small">View</Button>
          </Tooltip>
        )
      },
      {
        title: 'Verified',
        dataIndex: 'verified_at',
        key: 'verified_at',
        render: (date) => formatDate(date)
      }
    ];

    return (
      <Card title="Compliance Requirements" size="small">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={requirements}
          pagination={false}
          size="small"
        />
      </Card>
    );
  };

  // Render Audit Trail
  const renderAuditTrail = () => (
    <Card title="Audit Trail" size="small">
      {auditTrail.length > 0 ? (
        <Timeline>
          {auditTrail.map((audit, index) => (
            <Timeline.Item 
              key={index}
              color={audit.status === 'compliant' ? 'green' : 'red'}
            >
              <div>
                <div><strong>{audit.action}</strong></div>
                <div style={{ fontSize: 13 }}>
                  {audit.description}
                  {audit.user && ` • By: ${audit.user}`}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                  {formatDate(audit.created_at)}
                </div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Empty description="No audit trail available" />
      )}
    </Card>
  );

  // Render Link Modal
  const renderLinkModal = () => (
    <Modal
      title={<Space><LinkOutlined /> Link Compliance Framework</Space>}
      open={linkModalVisible}
      onCancel={() => {
        setLinkModalVisible(false);
        form.resetFields();
      }}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleLinkFramework}
      >
        <Form.Item
          name="framework_id"
          label="Framework"
          rules={[{ required: true, message: 'Please select a framework' }]}
        >
          <Select placeholder="Select framework">
            {Object.entries(COMPLIANCE_FRAMEWORKS).map(([key, value]) => (
              <Option key={key} value={key}>
                {value.icon} {value.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="target_date"
          label="Target Date"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <TextArea rows={3} placeholder="Add notes..." />
        </Form.Item>

        <Form.Item
          name="requirements"
          label="Specific Requirements"
          extra="Comma-separated list of specific requirements"
        >
          <Select mode="tags" placeholder="Add requirements" />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setLinkModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Link Framework
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Detail Drawer
  const renderDetailDrawer = () => (
    <Drawer
      title={<Space><AuditOutlined /> Framework Details</Space>}
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={600}
    >
      {selectedFramework && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Framework">
              {getFrameworkTag(selectedFramework.framework_id)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedFramework.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Compliance Score">
              <Progress 
                percent={selectedFramework.compliance_score || 0} 
                strokeColor={(selectedFramework.compliance_score || 0) >= 80 ? '#52c41a' : '#faad14'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Target Date">
              {formatDate(selectedFramework.target_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Last Checked">
              {formatDate(selectedFramework.last_checked)}
            </Descriptions.Item>
            <Descriptions.Item label="Notes">
              {selectedFramework.notes || 'No notes'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={5}>Requirements</Title>
          {selectedFramework.requirements?.length > 0 ? (
            <List
              size="small"
              dataSource={selectedFramework.requirements}
              renderItem={(req) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={req.status === 'compliant' ? 
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                      <CloseCircleOutlined style={{ color: '#f5222d' }} />
                    }
                    title={req.name}
                    description={req.description}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No specific requirements" />
          )}

          <Divider />

          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            block
            onClick={() => {
              setReportModalVisible(true);
              setDetailDrawerVisible(false);
            }}
          >
            Generate Report
          </Button>
        </div>
      )}
    </Drawer>
  );

  // Render Report Modal
  const renderReportModal = () => (
    <Modal
      title={<Space><ExportOutlined /> Generate Compliance Report</Space>}
      open={reportModalVisible}
      onCancel={() => setReportModalVisible(false)}
      footer={null}
      width={500}
    >
      <Form layout="vertical" onFinish={handleGenerateReport}>
        <Form.Item label="Format">
          <Radio.Group 
            value={reportFormat} 
            onChange={(e) => setReportFormat(e.target.value)}
          >
            <Radio value="pdf"><FilePdfOutlined /> PDF</Radio>
            <Radio value="csv"><FileExcelOutlined /> CSV</Radio>
            <Radio value="word"><FileWordOutlined /> Word</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Include">
          <Checkbox.Group>
            <Checkbox value="details">Detailed requirements</Checkbox>
            <Checkbox value="audit">Audit trail</Checkbox>
            <Checkbox value="evidence">Evidence links</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setReportModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Generate Report
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="compliance-framework">
      {/* Header */}
      <div className="compliance-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <AuditOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
            <Title level={4} style={{ margin: 0 }}>Compliance Framework</Title>
            <Badge status="processing" text="Live" />
          </Space>
          <Space>
            {documentId && (
              <Button 
                icon={<SafetyCertificateOutlined />} 
                onClick={handleCheckCompliance}
              >
                Check Compliance
              </Button>
            )}
            <Button 
              icon={<ExportOutlined />} 
              onClick={() => setReportModalVisible(true)}
            >
              Export Report
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          {renderFrameworks()}
        </Col>
        <Col xs={24} lg={12}>
          {documentId ? (
            <div>
              {renderRequirements()}
              <div style={{ marginTop: 16 }}>
                {renderAuditTrail()}
              </div>
            </div>
          ) : (
            <Card>
              <Empty 
                description="Select a document to view compliance details" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}
        </Col>
      </Row>

      {/* Modals & Drawers */}
      {renderLinkModal()}
      {renderDetailDrawer()}
      {renderReportModal()}
    </div>
  );
};

export default ComplianceFramework;