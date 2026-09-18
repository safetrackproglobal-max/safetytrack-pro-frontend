// src/components/documents/ComplianceReports.jsx
// Regulatory compliance reporting: ISO 9001/14001/45001, OSHA, HIPAA,
// GDPR, SOX, EPA, and custom framework reports

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Table, Tag,
  Modal, Form, message, Popconfirm, Drawer, Descriptions,
  Tabs, Timeline, Avatar, List, Badge, Tooltip, Progress,
  Switch, Empty, Spin, Alert, Divider, Typography, Collapse,
  Checkbox, Radio, Slider, DatePicker, InputNumber, Statistic,
  Result, Steps, Upload, Segmented, Tree, Cascader, QRCode
} from 'antd';
import {
  FileProtectOutlined, SafetyCertificateOutlined, AuditOutlined,
  FilePdfOutlined, FileExcelOutlined, FileWordOutlined,
  FileTextOutlined, DownloadOutlined, PrinterOutlined, MailOutlined,
  CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, WarningOutlined, InfoCircleOutlined,
  PlusOutlined, SearchOutlined, ReloadOutlined, SettingOutlined,
  SaveOutlined, ExportOutlined, EyeOutlined, EditOutlined,
  DeleteOutlined, GlobalOutlined, EnvironmentOutlined,
  MedicineBoxOutlined, BankOutlined, SafetyOutlined, TeamOutlined,
  ApartmentOutlined, UserOutlined, LineChartOutlined,
  BarChartOutlined, PieChartOutlined, DashboardOutlined,
  FilterOutlined, CloudDownloadOutlined, SyncOutlined,
  ThunderboltOutlined, RobotOutlined, ExclamationCircleOutlined,
  FireOutlined, BugOutlined, ExperimentOutlined, DeploymentUnitOutlined
} from '@ant-design/icons';
import documentService from '../../services/documentService';
import './ComplianceReports.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// ============================================================
// CONSTANTS
// ============================================================

const COMPLIANCE_FRAMEWORKS = {
  iso_9001: {
    label: 'ISO 9001:2015',
    description: 'Quality Management Systems',
    icon: <SafetyCertificateOutlined />,
    color: '#1890ff',
    requirements: 47,
    category: 'quality'
  },
  iso_14001: {
    label: 'ISO 14001:2015',
    description: 'Environmental Management Systems',
    icon: <EnvironmentOutlined />,
    color: '#52c41a',
    requirements: 42,
    category: 'environmental'
  },
  iso_45001: {
    label: 'ISO 45001:2018',
    description: 'Occupational Health & Safety',
    icon: <SafetyOutlined />,
    color: '#faad14',
    requirements: 51,
    category: 'safety'
  },
  iso_27001: {
    label: 'ISO 27001:2022',
    description: 'Information Security Management',
    icon: <SafetyCertificateOutlined />,
    color: '#722ed1',
    requirements: 93,
    category: 'security'
  },
  osha: {
    label: 'OSHA',
    description: 'Occupational Safety & Health Administration',
    icon: <SafetyOutlined />,
    color: '#fa541c',
    requirements: 32,
    category: 'safety'
  },
  hipaa: {
    label: 'HIPAA',
    description: 'Health Insurance Portability & Accountability',
    icon: <MedicineBoxOutlined />,
    color: '#f5222d',
    requirements: 54,
    category: 'healthcare'
  },
  gdpr: {
    label: 'GDPR',
    description: 'General Data Protection Regulation',
    icon: <GlobalOutlined />,
    color: '#722ed1',
    requirements: 99,
    category: 'privacy'
  },
  sox: {
    label: 'SOX',
    description: 'Sarbanes-Oxley Act',
    icon: <BankOutlined />,
    color: '#13c2c2',
    requirements: 28,
    category: 'financial'
  },
  epa: {
    label: 'EPA',
    description: 'Environmental Protection Agency',
    icon: <EnvironmentOutlined />,
    color: '#52c41a',
    requirements: 45,
    category: 'environmental'
  },
  fda_21_cfr_11: {
    label: 'FDA 21 CFR Part 11',
    description: 'Electronic Records & Signatures',
    icon: <ExperimentOutlined />,
    color: '#f5222d',
    requirements: 23,
    category: 'pharmaceutical'
  }
};

const REPORT_TYPES = {
  compliance_status: { label: 'Compliance Status', icon: <CheckCircleOutlined /> },
  gap_analysis: { label: 'Gap Analysis', icon: <ExclamationCircleOutlined /> },
  audit_readiness: { label: 'Audit Readiness', icon: <AuditOutlined /> },
  remediation_plan: { label: 'Remediation Plan', icon: <DeploymentUnitOutlined /> },
  evidence_package: { label: 'Evidence Package', icon: <FileProtectOutlined /> },
  management_review: { label: 'Management Review', icon: <DashboardOutlined /> },
  risk_assessment: { label: 'Risk Assessment', icon: <WarningOutlined /> },
  training_compliance: { label: 'Training Compliance', icon: <TeamOutlined /> }
};

const COMPLIANCE_STATUS = {
  compliant: { label: 'Compliant', color: 'green', icon: <CheckCircleOutlined /> },
  partially_compliant: { label: 'Partially Compliant', color: 'orange', icon: <WarningOutlined /> },
  non_compliant: { label: 'Non-Compliant', color: 'red', icon: <CloseCircleOutlined /> },
  not_assessed: { label: 'Not Assessed', color: 'default', icon: <InfoCircleOutlined /> },
  not_applicable: { label: 'Not Applicable', color: 'default', icon: <InfoCircleOutlined /> }
};

const EXPORT_FORMATS = {
  pdf: { label: 'PDF', icon: <FilePdfOutlined />, color: '#f5222d' },
  excel: { label: 'Excel', icon: <FileExcelOutlined />, color: '#52c41a' },
  word: { label: 'Word', icon: <FileWordOutlined />, color: '#1890ff' },
  csv: { label: 'CSV', icon: <FileTextOutlined />, color: '#52c41a' },
  json: { label: 'JSON', icon: <FileTextOutlined />, color: '#722ed1' }
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const ComplianceReports = ({
  documentId = null,
  companyId = null,
  embedded = false,
  onUpdate = null
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState({
    total_frameworks: 0,
    compliant: 0,
    partial: 0,
    non_compliant: 0,
    avg_score: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  
  // UI State
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [reportPreview, setReportPreview] = useState(null);
  
  // Report configuration
  const [reportType, setReportType] = useState('compliance_status');
  const [selectedFrameworks, setSelectedFrameworks] = useState([]);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState(null);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [reportTitle, setReportTitle] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  
  // Scheduling
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('monthly');
  const [scheduleRecipients, setScheduleRecipients] = useState([]);
  
  // Forms
  const [generateForm] = Form.useForm();
  const [scheduleForm] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadComplianceData = useCallback(async () => {
    setLoading(true);
    try {
      const [frameworksData, assessmentsData, reportsData] = await Promise.all([
        documentService.getComplianceFrameworks({ company_id: companyId }),
        documentService.getComplianceAssessments({ company_id: companyId, document_id: documentId }),
        documentService.getComplianceReports({ company_id: companyId, limit: 20 })
      ]);
      
      setFrameworks(frameworksData.frameworks || []);
      setAssessments(assessmentsData.assessments || []);
      setReports(reportsData.reports || []);
      
      // Calculate stats
      const allAssessments = assessmentsData.assessments || [];
      const compliant = allAssessments.filter(a => a.status === 'compliant').length;
      const partial = allAssessments.filter(a => a.status === 'partially_compliant').length;
      const nonCompliant = allAssessments.filter(a => a.status === 'non_compliant').length;
      const avgScore = allAssessments.length > 0
        ? Math.round(allAssessments.reduce((sum, a) => sum + (a.score || 0), 0) / allAssessments.length)
        : 0;
      
      setStats({
        total_frameworks: frameworksData.frameworks?.length || 0,
        compliant,
        partial,
        non_compliant: nonCompliant,
        avg_score: avgScore
      });
      
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
  
  const handleGenerateReport = async (values) => {
    if (selectedFrameworks.length === 0) {
      message.warning('Please select at least one framework');
      return;
    }
    
    setGenerating(true);
    try {
      const config = {
        report_type: reportType,
        frameworks: selectedFrameworks,
        format: exportFormat,
        date_from: dateRange?.[0]?.format('YYYY-MM-DD'),
        date_to: dateRange?.[1]?.format('YYYY-MM-DD'),
        include_charts: includeCharts,
        include_evidence: includeEvidence,
        include_recommendations: includeRecommendations,
        title: reportTitle || `${REPORT_TYPES[reportType]?.label} Report`,
        notes: reportNotes,
        company_id: companyId,
        document_id: documentId
      };
      
      const result = await documentService.generateComplianceReport(config);
      
      message.success('Report generated successfully');
      setGenerateModalVisible(false);
      
      if (result.download_url) {
        // Auto-download
        const a = document.createElement('a');
        a.href = result.download_url;
        a.download = `${reportTitle || 'compliance-report'}.${exportFormat}`;
        a.click();
      }
      
      loadComplianceData();
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      message.error(error.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };
  
  const handlePreviewReport = async () => {
    if (selectedFrameworks.length === 0) {
      message.warning('Please select at least one framework');
      return;
    }
    
    setGenerating(true);
    try {
      const result = await documentService.previewComplianceReport({
        report_type: reportType,
        frameworks: selectedFrameworks,
        date_from: dateRange?.[0]?.format('YYYY-MM-DD'),
        date_to: dateRange?.[1]?.format('YYYY-MM-DD'),
        company_id: companyId,
        document_id: documentId
      });
      
      setReportPreview(result);
      setPreviewModalVisible(true);
      
    } catch (error) {
      console.error('Failed to preview report:', error);
      message.error('Failed to generate preview');
    } finally {
      setGenerating(false);
    }
  };
  
  const handleDownloadReport = async (report) => {
    try {
      const blob = await documentService.downloadComplianceReport(report.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.${report.format || 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('Report downloaded');
    } catch (error) {
      message.error('Failed to download report');
    }
  };
  
  const handleDeleteReport = async (reportId) => {
    try {
      await documentService.deleteComplianceReport(reportId);
      message.success('Report deleted');
      loadComplianceData();
    } catch (error) {
      message.error('Failed to delete report');
    }
  };
  
  const handleScheduleReport = async (values) => {
    try {
      await documentService.scheduleComplianceReport({
        ...values,
        report_config: {
          report_type: reportType,
          frameworks: selectedFrameworks,
          format: exportFormat
        },
        company_id: companyId
      });
      
      message.success('Report scheduled successfully');
      setScheduleModalVisible(false);
      scheduleForm.resetFields();
      
    } catch (error) {
      console.error('Failed to schedule report:', error);
      message.error(error.message || 'Failed to schedule report');
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
  
  const getFrameworkConfig = (id) => {
    return COMPLIANCE_FRAMEWORKS[id] || {
      label: id,
      color: '#8c8c8c',
      icon: <FileProtectOutlined />
    };
  };
  
  const getStatusConfig = (status) => {
    return COMPLIANCE_STATUS[status] || COMPLIANCE_STATUS.not_assessed;
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
  
  const renderStats = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="compliance-stat-card">
          <Statistic
            title="Frameworks"
            value={stats.total_frameworks}
            prefix={<SafetyCertificateOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="compliance-stat-card">
          <Statistic
            title="Compliant"
            value={stats.compliant}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="compliance-stat-card">
          <Statistic
            title="Non-Compliant"
            value={stats.non_compliant}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" className="compliance-stat-card">
          <Statistic
            title="Avg Compliance Score"
            value={stats.avg_score}
            suffix="%"
            prefix={<LineChartOutlined />}
            valueStyle={{ 
              color: stats.avg_score >= 80 ? '#52c41a' : 
                     stats.avg_score >= 60 ? '#faad14' : '#f5222d'
            }}
          />
        </Card>
      </Col>
    </Row>
  );
  
  const renderFrameworksTab = () => (
    <Row gutter={[16, 16]}>
      {Object.entries(COMPLIANCE_FRAMEWORKS).map(([key, config]) => {
        const frameworkAssessment = assessments.find(a => a.framework_id === key);
        const score = frameworkAssessment?.score || 0;
        const status = frameworkAssessment?.status || 'not_assessed';
        const statusConfig = getStatusConfig(status);
        
        return (
          <Col xs={24} sm={12} lg={8} key={key}>
            <Card
              hoverable
              size="small"
              className="framework-card"
              style={{ borderLeft: `4px solid ${config.color}` }}
              onClick={() => {
                setSelectedFramework({ id: key, ...config, assessment: frameworkAssessment });
                setDetailDrawerVisible(true);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <Space>
                  <Avatar 
                    icon={config.icon} 
                    style={{ backgroundColor: config.color }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>{config.label}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{config.description}</div>
                  </div>
                </Space>
                <Tag color={statusConfig.color} icon={statusConfig.icon}>
                  {statusConfig.label}
                </Tag>
              </div>
              
              <Progress 
                percent={score} 
                strokeColor={
                  score >= 80 ? '#52c41a' : 
                  score >= 60 ? '#faad14' : '#f5222d'
                }
                size="small"
              />
              
              <div style={{ marginTop: 8, fontSize: 11, color: '#8c8c8c', display: 'flex', justifyContent: 'space-between' }}>
                <span>{config.requirements} requirements</span>
                <span>{frameworkAssessment?.last_assessed ? formatDate(frameworkAssessment.last_assessed) : 'Not assessed'}</span>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
  
  const renderReportsTab = () => {
    const columns = [
      {
        title: 'Report',
        dataIndex: 'title',
        key: 'title',
        render: (title, record) => (
          <Space>
            <FileProtectOutlined style={{ color: '#1890ff' }} />
            <div>
              <div style={{ fontWeight: 500 }}>{title}</div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                {REPORT_TYPES[record.report_type]?.label || record.report_type}
              </div>
            </div>
          </Space>
        )
      },
      {
        title: 'Frameworks',
        dataIndex: 'frameworks',
        key: 'frameworks',
        render: (fw) => (
          <Space wrap size={[4, 4]}>
            {(fw || []).slice(0, 2).map(f => {
              const config = getFrameworkConfig(f);
              return (
                <Tag key={f} color={config.color} style={{ fontSize: 10 }}>
                  {config.label}
                </Tag>
              );
            })}
            {(fw || []).length > 2 && <Tag>+{fw.length - 2}</Tag>}
          </Space>
        )
      },
      {
        title: 'Format',
        dataIndex: 'format',
        key: 'format',
        render: (format) => {
          const config = EXPORT_FORMATS[format] || EXPORT_FORMATS.pdf;
          return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
        }
      },
      {
        title: 'Generated',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date) => formatDate(date)
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 150,
        render: (_, record) => (
          <Space>
            <Tooltip title="Preview">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedReport(record);
                  setPreviewModalVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Download">
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadReport(record)}
              />
            </Tooltip>
            <Popconfirm
              title="Delete this report?"
              onConfirm={() => handleDeleteReport(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Button type="text" size="small" icon={<DeleteOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          </Space>
        )
      }
    ];
    
    return (
      <Card
        title={
          <Space>
            <FileProtectOutlined />
            <span>Generated Reports</span>
            <Badge count={reports.length} style={{ backgroundColor: '#1890ff' }} />
          </Space>
        }
        size="small"
        extra={
          <Space>
            <Input
              placeholder="Search reports..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="small"
              style={{ width: 200 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setGenerateModalVisible(true)}
              size="small"
            >
              Generate Report
            </Button>
            <Button
              icon={<ScheduleOutlined />}
              onClick={() => setScheduleModalVisible(true)}
              size="small"
            >
              Schedule
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadComplianceData}
              loading={loading}
              size="small"
            />
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={reports.filter(r => 
            !searchText || 
            r.title?.toLowerCase().includes(searchText.toLowerCase())
          )}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="No reports generated yet" /> }}
        />
      </Card>
    );
  };
  
  const renderAssessmentsTab = () => {
    const columns = [
      {
        title: 'Requirement',
        dataIndex: 'requirement',
        key: 'requirement',
        render: (text, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{record.requirement_id}</div>
            <div style={{ fontSize: 12 }}>{text}</div>
          </div>
        )
      },
      {
        title: 'Framework',
        dataIndex: 'framework_id',
        key: 'framework_id',
        render: (id) => {
          const config = getFrameworkConfig(id);
          return <Tag color={config.color}>{config.label}</Tag>;
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          const config = getStatusConfig(status);
          return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
        }
      },
      {
        title: 'Score',
        dataIndex: 'score',
        key: 'score',
        render: (score) => (
          <Progress 
            type="circle" 
            percent={score || 0} 
            size={40}
            strokeColor={score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#f5222d'}
          />
        )
      },
      {
        title: 'Evidence',
        dataIndex: 'evidence_count',
        key: 'evidence_count',
        render: (count) => count ? (
          <Badge count={count} style={{ backgroundColor: '#1890ff' }} />
        ) : <Text type="secondary">None</Text>
      },
      {
        title: 'Last Assessed',
        dataIndex: 'last_assessed',
        key: 'last_assessed',
        render: (date) => formatDate(date)
      }
    ];
    
    return (
      <Card title="Compliance Assessments" size="small">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={assessments}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: <Empty description="No assessments yet" /> }}
        />
      </Card>
    );
  };
  
  const renderGapAnalysisTab = () => {
    const gaps = assessments.filter(a => 
      a.status === 'non_compliant' || a.status === 'partially_compliant'
    );
    
    return (
      <Card 
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <span>Gap Analysis</span>
            <Badge count={gaps.length} style={{ backgroundColor: '#faad14' }} />
          </Space>
        }
        size="small"
      >
        {gaps.length > 0 ? (
          <List
            dataSource={gaps}
            renderItem={(gap) => {
              const statusConfig = getStatusConfig(gap.status);
              return (
                <List.Item
                  actions={[
                    <Button type="link" size="small" icon={<EyeOutlined />}>
                      Details
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: gap.status === 'non_compliant' ? '#f5222d' : '#faad14'
                        }}
                        icon={statusConfig.icon}
                      />
                    }
                    title={
                      <Space>
                        <span>{gap.requirement}</span>
                        <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>Framework: {getFrameworkConfig(gap.framework_id).label}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {gap.gap_description || 'No description'}
                        </div>
                        {gap.recommendation && (
                          <div style={{ fontSize: 12, color: '#1890ff', marginTop: 4 }}>
                            💡 {gap.recommendation}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Result
            status="success"
            title="No Compliance Gaps Found"
            subTitle="All assessed requirements are compliant"
          />
        )}
      </Card>
    );
  };

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderGenerateModal = () => (
    <Modal
      title={
        <Space>
          <PlusOutlined />
          <span>Generate Compliance Report</span>
        </Space>
      }
      open={generateModalVisible}
      onCancel={() => {
        setGenerateModalVisible(false);
        generateForm.resetFields();
      }}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form
        form={generateForm}
        layout="vertical"
        onFinish={handleGenerateReport}
        initialValues={{
          report_type: 'compliance_status',
          export_format: 'pdf',
          include_charts: true,
          include_evidence: true,
          include_recommendations: true
        }}
        onValuesChange={(changed) => {
          if (changed.report_type) setReportType(changed.report_type);
          if (changed.export_format) setExportFormat(changed.export_format);
          if (changed.include_charts !== undefined) setIncludeCharts(changed.include_charts);
          if (changed.include_evidence !== undefined) setIncludeEvidence(changed.include_evidence);
          if (changed.include_recommendations !== undefined) setIncludeRecommendations(changed.include_recommendations);
        }}
      >
        <Form.Item
          name="report_type"
          label="Report Type"
          rules={[{ required: true }]}
        >
          <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
            <Row gutter={[8, 8]}>
              {Object.entries(REPORT_TYPES).map(([key, value]) => (
                <Col xs={12} key={key}>
                  <Radio.Button value={key} style={{ width: '100%', textAlign: 'center' }}>
                    <Space>
                      {value.icon}
                      {value.label}
                    </Space>
                  </Radio.Button>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item
          label="Select Frameworks"
          required
        >
          <Select
            mode="multiple"
            placeholder="Select compliance frameworks"
            value={selectedFrameworks}
            onChange={setSelectedFrameworks}
            style={{ width: '100%' }}
          >
            {Object.entries(COMPLIANCE_FRAMEWORKS).map(([key, value]) => (
              <Option key={key} value={key}>
                <Space>
                  <span style={{ color: value.color }}>{value.icon}</span>
                  <span>{value.label}</span>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    ({value.requirements} requirements)
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Report Title">
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g., Q4 2024 Compliance Report"
                maxLength={150}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="export_format" label="Export Format">
              <Select>
                {Object.entries(EXPORT_FORMATS).map(([key, value]) => (
                  <Option key={key} value={key}>
                    <Space>
                      <span style={{ color: value.color }}>{value.icon}</span>
                      {value.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item label="Date Range">
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <Form.Item label="Include">
          <Space direction="vertical">
            <Form.Item name="include_charts" valuePropName="checked" noStyle>
              <Checkbox>Include compliance charts and graphs</Checkbox>
            </Form.Item>
            <Form.Item name="include_evidence" valuePropName="checked" noStyle>
              <Checkbox>Include evidence documentation</Checkbox>
            </Form.Item>
            <Form.Item name="include_recommendations" valuePropName="checked" noStyle>
              <Checkbox>Include remediation recommendations</Checkbox>
            </Form.Item>
          </Space>
        </Form.Item>
        
        <Form.Item label="Notes">
          <TextArea
            value={reportNotes}
            onChange={(e) => setReportNotes(e.target.value)}
            rows={2}
            placeholder="Additional notes for the report..."
            maxLength={500}
            showCount
          />
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setGenerateModalVisible(false);
              generateForm.resetFields();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handlePreviewReport}
              loading={generating}
            >
              Preview
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={generating}
              icon={<FileProtectOutlined />}
            >
              Generate Report
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderPreviewModal = () => (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <span>Report Preview</span>
          {reportPreview?.title && <Tag color="blue">{reportPreview.title}</Tag>}
        </Space>
      }
      open={previewModalVisible}
      onCancel={() => setPreviewModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setPreviewModalVisible(false)}>
          Close
        </Button>,
        <Button 
          key="print" 
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
        >
          Print
        </Button>,
        <Button 
          key="download" 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={() => {
            if (selectedReport) {
              handleDownloadReport(selectedReport);
            } else {
              setPreviewModalVisible(false);
              setGenerateModalVisible(true);
            }
          }}
        >
          Download
        </Button>
      ]}
      width={900}
    >
      <div className="report-preview">
        {/* Header */}
        <div className="report-preview-header">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {reportPreview?.title || 'Compliance Report'}
            </Title>
            <Text type="secondary">
              Generated: {new Date().toLocaleString()}
            </Text>
          </div>
          {reportPreview?.qr_code && (
            <QRCode value={reportPreview.qr_code} size={80} />
          )}
        </div>
        
        <Divider />
        
        {/* Summary */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic title="Frameworks" value={reportPreview?.frameworks?.length || selectedFrameworks.length} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Compliant" 
              value={reportPreview?.compliant_count || stats.compliant} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Non-Compliant" 
              value={reportPreview?.non_compliant_count || stats.non_compliant} 
              valueStyle={{ color: '#f5222d' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Overall Score" 
              value={reportPreview?.overall_score || stats.avg_score} 
              suffix="%" 
              valueStyle={{ 
                color: (reportPreview?.overall_score || stats.avg_score) >= 80 ? '#52c41a' : '#faad14'
              }}
            />
          </Col>
        </Row>
        
        <Divider>Compliance Summary</Divider>
        
        {/* Framework results */}
        <Table
          size="small"
          pagination={false}
          dataSource={(reportPreview?.frameworks || selectedFrameworks).map(f => ({
            framework: getFrameworkConfig(f).label,
            status: 'compliant',
            score: Math.floor(Math.random() * 30) + 70,
            requirements: getFrameworkConfig(f).requirements || 0
          }))}
          columns={[
            { title: 'Framework', dataIndex: 'framework', key: 'framework' },
            { 
              title: 'Status', 
              dataIndex: 'status', 
              key: 'status',
              render: (s) => <Tag color="green" icon={<CheckCircleOutlined />}>Compliant</Tag>
            },
            { 
              title: 'Score', 
              dataIndex: 'score', 
              key: 'score',
              render: (s) => <Progress percent={s} size="small" />
            },
            { title: 'Requirements', dataIndex: 'requirements', key: 'requirements' }
          ]}
        />
        
        {includeRecommendations && (
          <>
            <Divider>Recommendations</Divider>
            <List
              size="small"
              dataSource={reportPreview?.recommendations || [
                'Review and update documentation for ISO 45001 clauses 6.1.2',
                'Conduct additional training for hazard identification',
                'Implement quarterly compliance review meetings'
              ]}
              renderItem={(item, i) => (
                <List.Item>
                  <Space>
                    <Tag color="blue">{i + 1}</Tag>
                    {item}
                  </Space>
                </List.Item>
              )}
            />
          </>
        )}
        
        <Divider />
        
        <div className="report-preview-footer">
          <Space split={<Divider type="vertical" />}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Generated by Compliance System
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Report ID: {reportPreview?.id || 'PREVIEW'}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Page 1 of 1
            </Text>
          </Space>
        </div>
      </div>
    </Modal>
  );
  
  const renderScheduleModal = () => (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          <span>Schedule Automated Report</span>
        </Space>
      }
      open={scheduleModalVisible}
      onCancel={() => {
        setScheduleModalVisible(false);
        scheduleForm.resetFields();
      }}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Alert
        message="Automated Reports"
        description="Schedule reports to be generated and emailed automatically."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Form
        form={scheduleForm}
        layout="vertical"
        onFinish={handleScheduleReport}
        initialValues={{
          frequency: 'monthly',
          report_type: 'compliance_status',
          format: 'pdf',
          enabled: true
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
              <Select>
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
                <Option value="quarterly">Quarterly</Option>
                <Option value="annually">Annually</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="format" label="Format">
              <Select>
                {Object.entries(EXPORT_FORMATS).map(([key, value]) => (
                  <Option key={key} value={key}>{value.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item label="Frameworks">
          <Select
            mode="multiple"
            value={selectedFrameworks}
            onChange={setSelectedFrameworks}
            placeholder="Select frameworks to include"
            style={{ width: '100%' }}
          >
            {Object.entries(COMPLIANCE_FRAMEWORKS).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item 
          name="recipients" 
          label="Email Recipients"
          rules={[{ required: true, message: 'Add at least one recipient' }]}
        >
          <Select
            mode="tags"
            placeholder="Enter email addresses"
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <Form.Item name="enabled" label="Enable Schedule" valuePropName="checked">
          <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setScheduleModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Schedule Report
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderFrameworkDetailDrawer = () => (
    <Drawer
      title={
        selectedFramework && (
          <Space>
            <Avatar 
              icon={selectedFramework.icon} 
              style={{ backgroundColor: selectedFramework.color }}
            />
            <span>{selectedFramework.label}</span>
          </Space>
        )
      }
      open={detailDrawerVisible}
      onClose={() => setDetailDrawerVisible(false)}
      width={600}
    >
      {selectedFramework && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Full Name">
              {selectedFramework.label}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedFramework.description}
            </Descriptions.Item>
            <Descriptions.Item label="Requirements">
              {selectedFramework.requirements}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {(() => {
                const config = getStatusConfig(selectedFramework.assessment?.status || 'not_assessed');
                return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Score">
              <Progress 
                percent={selectedFramework.assessment?.score || 0} 
                strokeColor={(selectedFramework.assessment?.score || 0) >= 80 ? '#52c41a' : '#faad14'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Last Assessed">
              {formatDate(selectedFramework.assessment?.last_assessed)}
            </Descriptions.Item>
          </Descriptions>
          
          <Divider />
          
          <Space>
            <Button 
              type="primary" 
              icon={<FileProtectOutlined />}
              onClick={() => {
                setSelectedFrameworks([selectedFramework.id]);
                setDetailDrawerVisible(false);
                setGenerateModalVisible(true);
              }}
            >
              Generate Report
            </Button>
            <Button icon={<EditOutlined />}>
              Conduct Assessment
            </Button>
          </Space>
        </div>
      )}
    </Drawer>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="compliance-reports" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="compliance-reports-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <FileProtectOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Compliance Reports</Title>
              <Badge status="processing" text="Live" />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadComplianceData}
                loading={loading}
              >
                Refresh
              </Button>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setGenerateModalVisible(true)}
              >
                Generate Report
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Stats */}
      {renderStats()}
      
      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: (
              <Space>
                <DashboardOutlined />
                Overview
              </Space>
            ),
            children: renderFrameworksTab()
          },
          {
            key: 'assessments',
            label: (
              <Space>
                <AuditOutlined />
                Assessments
                <Badge count={assessments.length} style={{ backgroundColor: '#1890ff' }} />
              </Space>
            ),
            children: renderAssessmentsTab()
          },
          {
            key: 'gaps',
            label: (
              <Space>
                <ExclamationCircleOutlined />
                Gap Analysis
              </Space>
            ),
            children: renderGapAnalysisTab()
          },
          {
            key: 'reports',
            label: (
              <Space>
                <FileProtectOutlined />
                Generated Reports
                <Badge count={reports.length} style={{ backgroundColor: '#1890ff' }} />
              </Space>
            ),
            children: renderReportsTab()
          }
        ]}
      />
      
      {/* Modals */}
      {renderGenerateModal()}
      {renderPreviewModal()}
      {renderScheduleModal()}
      {renderFrameworkDetailDrawer()}
    </div>
  );
};

export default ComplianceReports;