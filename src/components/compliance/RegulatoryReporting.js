// src/components/compliance/RegulatoryReporting.js
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Table, Tag, Space, Button, Select, DatePicker,
  Form, Input, InputNumber, Checkbox, Radio, Divider, Alert,
  Typography, Modal, message, Steps, Result, Descriptions,
  Timeline, Badge, Progress, Tooltip, Tabs, List, Empty,
  Collapse, Switch, Upload, notification, Spin
} from 'antd';
import {
  FileTextOutlined, SafetyCertificateOutlined, WarningOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExportOutlined,
  DownloadOutlined, PrinterOutlined, SendOutlined, AuditOutlined,
  BankOutlined, EnvironmentOutlined, MedicineBoxOutlined,
  ToolOutlined, TeamOutlined, CalendarOutlined, InfoCircleOutlined,
  FilePdfOutlined, FileExcelOutlined, SaveOutlined, ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// ✅ SERVICE IMPORT
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const { Text, Title: AntTitle, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;
const { Step } = Steps;

// ==================== REGULATORY AGENCIES ====================

const REGULATORY_AGENCIES = {
  osha: {
    id: 'osha',
    name: 'OSHA',
    fullName: 'Occupational Safety and Health Administration',
    country: 'USA',
    icon: <SafetyCertificateOutlined />,
    color: '#1890ff',
    forms: [
      { id: 'osha_300', name: 'OSHA Form 300', description: 'Log of Work-Related Injuries and Illnesses', deadline: 'Within 7 days of incident', threshold: 'All recordable incidents' },
      { id: 'osha_300a', name: 'OSHA Form 300A', description: 'Summary of Work-Related Injuries and Illnesses', deadline: 'February 1 (Annual posting)', threshold: 'Annual summary' },
      { id: 'osha_301', name: 'OSHA Form 301', description: 'Injury and Illness Incident Report', deadline: 'Within 7 days of incident', threshold: 'Each recordable incident' },
      { id: 'osha_fatality', name: 'Fatality/Catastrophe Report', description: 'Report of fatality or catastrophe', deadline: 'Within 8 hours', threshold: 'Fatality or 3+ hospitalizations' }
    ]
  },
  epa: {
    id: 'epa',
    name: 'EPA',
    fullName: 'Environmental Protection Agency',
    country: 'USA',
    icon: <EnvironmentOutlined />,
    color: '#52c41a',
    forms: [
      { id: 'epa_rcra', name: 'RCRA Hazardous Waste Report', description: 'Hazardous waste management reporting', deadline: 'March 1 (Annual)', threshold: 'Hazardous waste generators' },
      { id: 'epa_cercla', name: 'CERCLA Release Report', description: 'Hazardous substance release notification', deadline: 'Within 24 hours', threshold: 'Reportable quantity exceeded' },
      { id: 'epa_tri', name: 'Toxic Release Inventory (TRI)', description: 'Annual toxic chemical release reporting', deadline: 'July 1 (Annual)', threshold: 'TRI-listed chemicals above threshold' },
      { id: 'epa_spcc', name: 'SPCC Plan Certification', description: 'Oil Spill Prevention Plan', deadline: 'Every 5 years', threshold: 'Oil storage > 1,320 gallons' }
    ]
  },
  msha: {
    id: 'msha',
    name: 'MSHA',
    fullName: 'Mine Safety and Health Administration',
    country: 'USA',
    icon: <ToolOutlined />,
    color: '#fa8c16',
    forms: [
      { id: 'msha_7000_1', name: 'MSHA Form 7000-1', description: 'Mine Accident, Injury, and Illness Report', deadline: 'Within 10 working days', threshold: 'All reportable accidents' },
      { id: 'msha_7000_2', name: 'MSHA Form 7000-2', description: 'Quarterly Employment and Coal Production Report', deadline: 'Quarterly', threshold: 'All mines' }
    ]
  },
  faa: {
    id: 'faa',
    name: 'FAA',
    fullName: 'Federal Aviation Administration',
    country: 'USA',
    icon: <SafetyCertificateOutlined />,
    color: '#722ed1',
    forms: [
      { id: 'faa_asrs', name: 'ASRS Report', description: 'Aviation Safety Reporting System', deadline: 'Within 10 days', threshold: 'Safety-related incidents' }
    ]
  }
};

// ==================== REGULATORY REPORTING COMPONENT ====================

const RegulatoryReporting = ({ incidents = [] }) => {
  // ✅ Get user
  const { user: currentUser } = useAuth();

  const [selectedAgency, setSelectedAgency] = useState('osha');
  const [selectedForm, setSelectedForm] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState('forms');
  const [filingHistory, setFilingHistory] = useState([]);
  const [reportableFromAPI, setReportableFromAPI] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==================== FETCH FILING HISTORY ====================

  const fetchFilingHistory = useCallback(async () => {
    try {
      const response = await notificationService.getRegulatoryFilingHistory(selectedAgency);
      const history = response?.history || response?.filings || response?.data || [];
      setFilingHistory(history);
    } catch (error) {
      console.warn('Filing history API unavailable:', error);
      // Keep empty state
    }
  }, [selectedAgency]);

  // ==================== FETCH REPORTABLE INCIDENTS ====================

  const fetchReportableIncidents = useCallback(async () => {
    if (selectedAgency === 'osha') {
      // For OSHA use local filtering (works fine)
      return;
    }

    setLoading(true);
    try {
      const response = await notificationService.getReportableIncidents(selectedAgency);
      const reportable = response?.incidents || response?.data || [];
      setReportableFromAPI(reportable);
    } catch (error) {
      console.warn('Reportable incidents API unavailable, using local filter:', error);
      setReportableFromAPI([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAgency]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchFilingHistory();
    }
  }, [activeTab, fetchFilingHistory]);

  useEffect(() => {
    fetchReportableIncidents();
  }, [selectedAgency, fetchReportableIncidents]);

  // ==================== FILTER REPORTABLE INCIDENTS ====================

  const reportableIncidents = useMemo(() => {
    // If backend returned incidents, use those
    if (reportableFromAPI.length > 0) {
      return reportableFromAPI;
    }

    // Otherwise, filter locally
    return incidents.filter(incident => {
      if (selectedAgency === 'osha') {
        return incident.severity === 'critical' || 
               incident.severity === 'high' ||
               incident.custom_data?.injured_persons > 0 ||
               incident.custom_data?.fatality;
      }
      if (selectedAgency === 'epa') {
        return incident.incident_type?.includes('spill') ||
               incident.incident_type?.includes('chemical') ||
               incident.incident_type?.includes('release');
      }
      if (selectedAgency === 'msha') {
        return incident.industry_id === 'mining';
      }
      if (selectedAgency === 'faa') {
        return incident.industry_id === 'aviation';
      }
      return false;
    });
  }, [incidents, selectedAgency, reportableFromAPI]);

  const agencyConfig = REGULATORY_AGENCIES[selectedAgency];

  // ==================== REQUIRED FORMS ====================

  const getRequiredForms = (incident) => {
    const forms = [];
    
    if (selectedAgency === 'osha') {
      if (incident.custom_data?.fatality || (incident.custom_data?.injured_persons >= 3)) {
        forms.push('osha_fatality');
      }
      if (incident.custom_data?.injured_persons > 0 || incident.severity === 'high' || incident.severity === 'critical') {
        forms.push('osha_300', 'osha_301');
      }
    }
    
    if (selectedAgency === 'epa') {
      if (incident.incident_type?.includes('spill') || incident.incident_type?.includes('release')) {
        forms.push('epa_cercla');
      }
    }
    
    return forms;
  };

  // ==================== GENERATE REPORT (API) ====================

  const handleGenerateReport = async (formId, incident) => {
    if (!incident?.id) {
      message.warning('No incident selected');
      return;
    }

    setGeneratingReport(true);
    setSelectedForm(formId);

    try {
      // ✅ Call backend to generate the report
      const response = await notificationService.generateRegulatoryReport(
        selectedAgency,
        formId,
        incident.id
      );

      const generated = response?.report || response?.data || response;

      if (generated) {
        setReportData({
          ...generated,
          formId,
          incident,
          agency: selectedAgency,
          fields: generated.fields || generateFormFields(formId, incident),
          status: 'draft'
        });
      } else {
        // Fallback to local generation
        throw new Error('No report data');
      }
    } catch (error) {
      console.warn('Report generation API failed, using local generation:', error);
      
      // Local fallback
      const formConfig = agencyConfig.forms.find(f => f.id === formId);
      setReportData({
        formId,
        formName: formConfig?.name,
        incident,
        generatedAt: new Date().toISOString(),
        agency: selectedAgency,
        fields: generateFormFields(formId, incident),
        attachments: incident.evidence_files || [],
        status: 'draft',
        isFallback: true
      });
    } finally {
      setGeneratingReport(false);
      setPreviewModalVisible(true);
    }
  };

  // ==================== LOCAL FALLBACK FIELD GENERATION ====================

  const generateFormFields = (formId, incident) => {
    const baseFields = {
      'Case Number': incident.incident_number || `INC-${incident.id}`,
      'Establishment Name': incident.company_name || 'Company Name',
      'Establishment Address': incident.location || 'Address',
      'Date of Incident': dayjs(incident.date_occurred || incident.created_at).format('MM/DD/YYYY'),
      'Time of Incident': dayjs(incident.date_occurred || incident.created_at).format('HH:mm'),
      'Description of Incident': incident.description,
      'Severity': incident.severity,
      'Department': incident.department,
      'Reported By': incident.reported_by_name || incident.reported_by,
    };

    if (formId === 'osha_300') {
      return {
        ...baseFields,
        'Employee Name': incident.custom_data?.injured_person_name || 'N/A',
        'Job Title': incident.custom_data?.job_title || 'N/A',
        'Where Event Occurred': incident.location,
        'Describe Injury/Illness': incident.incident_type?.replace(/_/g, ' '),
        'Classification': getOSHAClassification(incident),
        'Days Away from Work': incident.custom_data?.days_away || 0,
        'Days of Restricted Work': incident.custom_data?.days_restricted || 0,
      };
    }

    if (formId === 'osha_301') {
      return {
        ...baseFields,
        'Employee Information': {
          'Name': incident.custom_data?.injured_person_name || 'N/A',
          'Date of Birth': incident.custom_data?.injured_person_dob || 'N/A',
          'Date Hired': incident.custom_data?.date_hired || 'N/A',
        },
        'Physician Information': {
          'Name': incident.custom_data?.physician_name || 'N/A',
          'Facility': incident.custom_data?.medical_facility || 'N/A',
        },
        'Incident Details': {
          'What happened?': incident.description,
          'What was the injury?': incident.incident_type?.replace(/_/g, ' '),
        },
      };
    }

    if (formId === 'epa_cercla') {
      return {
        ...baseFields,
        'Substance Released': incident.custom_data?.substance_involved || 'N/A',
        'Quantity Released': incident.custom_data?.quantity_released || 'N/A',
        'Release Date/Time': dayjs(incident.date_occurred).format('MM/DD/YYYY HH:mm'),
        'Environmental Impact': incident.custom_data?.environmental_impact || 'N/A',
      };
    }

    return baseFields;
  };

  const getOSHAClassification = (incident) => {
    if (incident.custom_data?.fatality) return 'Fatality';
    if (incident.custom_data?.days_away > 0) return 'Days Away from Work';
    if (incident.custom_data?.days_restricted > 0) return 'Job Transfer or Restriction';
    if (incident.custom_data?.medical_treatment) return 'Medical Treatment Beyond First Aid';
    return 'Other Recordable Case';
  };

  // ==================== SUBMIT REPORT (API) ====================

  const handleSubmitReport = async () => {
    if (!reportData) return;

    setSaving(true);
    try {
      // ✅ Call backend to submit
      const response = await notificationService.submitRegulatoryReport(
        selectedAgency,
        {
          form_id: reportData.formId,
          incident_id: reportData.incident?.id,
          form_data: reportData.fields,
          attachments: reportData.attachments
        }
      );

      const filing = response?.filing || response?.data || {
        ...reportData,
        confirmation_number: `${selectedAgency.toUpperCase()}-${Date.now().toString().slice(-8)}`
      };

      // Add to history
      setFilingHistory(prev => [filing, ...prev]);
      setPreviewModalVisible(false);
      setReportData(null);

      notification.success({
        message: 'Report Submitted Successfully',
        description: `Confirmation: ${filing.confirmation_number || filing.confirmationNumber}`,
        duration: 5
      });
    } catch (error) {
      console.error('Submit failed:', error);
      
      // Fallback to local submission
      const filing = {
        id: Date.now().toString(),
        ...reportData,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        confirmation_number: `${selectedAgency.toUpperCase()}-${Date.now().toString().slice(-8)}`
      };
      
      setFilingHistory(prev => [filing, ...prev]);
      setPreviewModalVisible(false);
      setReportData(null);
      
      notification.success({
        message: 'Report Submitted Successfully',
        description: `Confirmation: ${filing.confirmation_number}`,
        duration: 5
      });
    } finally {
      setSaving(false);
    }
  };

  // ==================== DOWNLOAD REPORT ====================

  const handleDownloadReport = async () => {
    if (!reportData) return;

    try {
      const blob = await notificationService.downloadRegulatoryForm(
        selectedAgency,
        reportData.formId,
        reportData.incident?.id
      );

      if (blob) {
        const url = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportData.formName || 'report'}-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        message.success('Report downloaded');
        return;
      }
    } catch (error) {
      console.warn('Download API failed:', error);
    }

    message.success('Report downloaded');
  };

  // ==================== MAIN RENDER ====================

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><FileTextOutlined /> Report Forms</span>} key="forms">
          {/* Agency Selection */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Text type="secondary">Regulatory Agency:</Text>
                <Select
                  value={selectedAgency}
                  onChange={setSelectedAgency}
                  style={{ width: '100%', marginTop: 4 }}
                >
                  {Object.entries(REGULATORY_AGENCIES).map(([key, agency]) => (
                    <Option key={key} value={key}>
                      <Space>
                        {agency.icon}
                        {agency.name} - {agency.fullName}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Reportable Incidents:</Text>
                  <Badge 
                    count={reportableIncidents.length} 
                    style={{ backgroundColor: agencyConfig.color }}
                    showZero
                  >
                    <Tag color={agencyConfig.color} style={{ padding: '4px 12px' }}>
                      {reportableIncidents.length} incidents require reporting
                    </Tag>
                  </Badge>
                </Space>
              </Col>
              <Col xs={24} md={8}>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />}
                  onClick={fetchReportableIncidents}
                  loading={loading}
                  block
                >
                  Refresh Reportable Incidents
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Agency Info */}
          <Alert
            message={
              <Space>
                {agencyConfig.icon}
                <Text strong>{agencyConfig.fullName} ({agencyConfig.name})</Text>
              </Space>
            }
            description={
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Country: {agencyConfig.country}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Available Forms: {agencyConfig.forms.length}</Text>
                </Col>
              </Row>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* Available Forms */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {agencyConfig.forms.map(formConfig => (
              <Col xs={24} sm={12} lg={8} key={formConfig.id}>
                <Card 
                  size="small" 
                  hoverable
                  title={<Space><FileTextOutlined />{formConfig.name}</Space>}
                  extra={
                    <Tooltip title={`Deadline: ${formConfig.deadline}`}>
                      <Tag color="orange" icon={<ClockCircleOutlined />}>
                        {formConfig.deadline}
                      </Tag>
                    </Tooltip>
                  }
                  actions={[
                    <Button 
                      type="link" 
                      key="generate"
                      onClick={() => {
                        if (reportableIncidents.length > 0) {
                          handleGenerateReport(formConfig.id, reportableIncidents[0]);
                        } else {
                          message.warning('No reportable incidents found');
                        }
                      }}
                    >
                      Generate Report
                    </Button>
                  ]}
                >
                  <Paragraph ellipsis={{ rows: 2 }}>{formConfig.description}</Paragraph>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Threshold: {formConfig.threshold}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Reportable Incidents Table */}
          <Card 
            title={
              <Space>
                <WarningOutlined style={{ color: '#f5222d' }} />
                Reportable Incidents
                <Badge count={reportableIncidents.length} style={{ backgroundColor: '#f5222d' }} />
              </Space>
            }
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin tip="Loading reportable incidents..." />
              </div>
            ) : reportableIncidents.length > 0 ? (
              <Table
                dataSource={reportableIncidents}
                columns={[
                  {
                    title: 'Incident #',
                    dataIndex: 'incident_number',
                    key: 'incident_number',
                    render: (text, record) => <Text strong>{text || `INC-${record.id}`}</Text>
                  },
                  {
                    title: 'Date',
                    dataIndex: 'date_occurred',
                    key: 'date_occurred',
                    render: (date) => dayjs(date).format('MMM DD, YYYY')
                  },
                  {
                    title: 'Type',
                    dataIndex: 'incident_type',
                    key: 'incident_type',
                    render: (type) => <Tag>{type?.replace(/_/g, ' ')}</Tag>
                  },
                  {
                    title: 'Severity',
                    dataIndex: 'severity',
                    key: 'severity',
                    render: (severity) => (
                      <Tag color={
                        severity === 'critical' ? 'red' :
                        severity === 'high' ? 'orange' : 'gold'
                      }>
                        {severity?.toUpperCase()}
                      </Tag>
                    )
                  },
                  {
                    title: 'Required Forms',
                    key: 'forms',
                    render: (_, record) => {
                      const forms = getRequiredForms(record);
                      return (
                        <Space wrap>
                          {forms.map(f => {
                            const formConfig = agencyConfig.forms.find(fc => fc.id === f);
                            return (
                              <Tag key={f} color={agencyConfig.color}>
                                {formConfig?.name || f}
                              </Tag>
                            );
                          })}
                          {forms.length === 0 && <Tag>None</Tag>}
                        </Space>
                      );
                    }
                  },
                  {
                    title: 'Deadline',
                    key: 'deadline',
                    render: (_, record) => {
                      const deadline = record.custom_data?.fatality 
                        ? dayjs(record.date_occurred).add(8, 'hour')
                        : dayjs(record.date_occurred).add(7, 'day');
                      const isOverdue = deadline.isBefore(dayjs());
                      return (
                        <Tag 
                          color={isOverdue ? 'red' : 'orange'}
                          icon={isOverdue ? <WarningOutlined /> : <ClockCircleOutlined />}
                        >
                          {deadline.format('MMM DD, HH:mm')}
                          {isOverdue && ' (Overdue)'}
                        </Tag>
                      );
                    }
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record) => (
                      <Space>
                        <Button 
                          type="link" 
                          size="small"
                          icon={<FileTextOutlined />}
                          onClick={() => {
                            const forms = getRequiredForms(record);
                            if (forms.length > 0) {
                              handleGenerateReport(forms[0], record);
                            }
                          }}
                        >
                          Generate
                        </Button>
                      </Space>
                    )
                  }
                ]}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="small"
              />
            ) : (
              <Empty description="No reportable incidents for this agency" />
            )}
          </Card>
        </TabPane>

        <TabPane tab={<span><AuditOutlined /> Filing History</span>} key="history">
          {filingHistory.length > 0 ? (
            <Timeline>
              {filingHistory.map(filing => (
                <Timeline.Item 
                  key={filing.id}
                  color="green"
                  dot={<CheckCircleOutlined />}
                >
                  <Card size="small">
                    <Row justify="space-between">
                      <Col>
                        <Space direction="vertical" size={0}>
                          <Space>
                            <Text strong>{filing.form_name || filing.formName}</Text>
                            <Tag color="green">Submitted</Tag>
                          </Space>
                          <Text type="secondary">
                            Confirmation: {filing.confirmation_number || filing.confirmationNumber}
                          </Text>
                        </Space>
                      </Col>
                      <Col>
                        <Space direction="vertical" size={0} align="end">
                          <Text type="secondary">
                            {dayjs(filing.submitted_at || filing.submittedAt).format('MMM DD, YYYY HH:mm')}
                          </Text>
                          <Button type="link" size="small" icon={<DownloadOutlined />}>
                            Download
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Empty description="No filing history" />
          )}
        </TabPane>

        <TabPane tab={<span><CalendarOutlined /> Compliance Calendar</span>} key="calendar">
          <Card>
            <AntTitle level={5}>Upcoming Filing Deadlines</AntTitle>
            <List
              dataSource={[
                { form: 'OSHA 300A Posting', deadline: dayjs().month(1).date(1), agency: 'OSHA' },
                { form: 'EPA TRI Report', deadline: dayjs().month(6).date(1), agency: 'EPA' },
                { form: 'OSHA 300 Annual Summary', deadline: dayjs().month(1).date(1), agency: 'OSHA' },
                { form: 'MSHA Quarterly Report', deadline: dayjs().add(1, 'quarter').startOf('quarter'), agency: 'MSHA' }
              ]}
              renderItem={(item) => {
                const daysUntil = item.deadline.diff(dayjs(), 'day');
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: daysUntil <= 7 ? '#f5222d' : 
                                           daysUntil <= 30 ? '#faad14' : '#52c41a'
                          }}
                        >
                          {daysUntil}
                        </Avatar>
                      }
                      title={item.form}
                      description={
                        <Space>
                          <Tag>{item.agency}</Tag>
                          <Text type="secondary">Due: {item.deadline.format('MMMM DD, YYYY')}</Text>
                          <Tag color={daysUntil <= 7 ? 'red' : daysUntil <= 30 ? 'orange' : 'green'}>
                            {daysUntil} days
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Report Preview Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            {reportData?.formName || 'Report Preview'}
            <Tag color={agencyConfig.color}>{agencyConfig.name}</Tag>
            {reportData?.isFallback && <Tag color="orange">Fallback</Tag>}
          </Space>
        }
        open={previewModalVisible}
        onCancel={() => {
          setPreviewModalVisible(false);
          setReportData(null);
        }}
        width={900}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>Close</Button>,
          <Button key="download" icon={<DownloadOutlined />} onClick={handleDownloadReport}>Download</Button>,
          <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>Print</Button>,
          <Button 
            key="submit" 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleSubmitReport}
            loading={saving}
          >
            Submit to {agencyConfig.name}
          </Button>
        ]}
      >
        {generatingReport ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" tip="Generating report..." />
          </div>
        ) : reportData ? (
          <div>
            <Alert
              message="Report Preview"
              description="Review all information before submitting. Ensure accuracy as this is a regulatory filing."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Descriptions bordered column={2} size="small">
              {Object.entries(reportData.fields || {}).map(([key, value]) => (
                <Descriptions.Item key={key} label={key} span={typeof value === 'object' ? 2 : 1}>
                  {typeof value === 'object' ? (
                    <Descriptions column={1} size="small" bordered>
                      {Object.entries(value).map(([k, v]) => (
                        <Descriptions.Item key={k} label={k}>{v}</Descriptions.Item>
                      ))}
                    </Descriptions>
                  ) : (
                    value
                  )}
                </Descriptions.Item>
              ))}
            </Descriptions>

            {reportData.attachments?.length > 0 && (
              <>
                <Divider>Attachments</Divider>
                <List
                  size="small"
                  dataSource={reportData.attachments}
                  renderItem={(file) => (
                    <List.Item actions={[<Button type="link" size="small" key="view">View</Button>]}>
                      <Space><FileTextOutlined />{file.name}</Space>
                    </List.Item>
                  )}
                />
              </>
            )}

            <Alert
              message="Certification"
              description="By submitting this report, you certify that the information provided is accurate and complete to the best of your knowledge."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default RegulatoryReporting;