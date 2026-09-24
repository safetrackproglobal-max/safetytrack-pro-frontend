// src/components/documents/CustomReportBuilder.jsx
// Drag-and-drop report builder with data source selection, filters,
// visualizations, and scheduled generation

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Row, Col, Button, Space, Input, Select, Modal, Form,
  message, Popconfirm, Drawer, Descriptions, Tabs, Timeline,
  Avatar, List, Badge, Tooltip, Progress, Switch, Empty, Spin,
  Alert, Divider, Typography, Collapse, Checkbox, Radio, Slider,
  DatePicker, InputNumber, Segmented, Statistic, Result, Steps,
  Table, Tag, TreeSelect, Cascader, Transfer, Upload
} from 'antd';
import {
  BarChartOutlined, LineChartOutlined, PieChartOutlined, TeamOutlined, HistoryOutlined,
  AreaChartOutlined, TableOutlined, DashboardOutlined, SafetyCertificateOutlined, WarningOutlined,
  FileTextOutlined, FilePdfOutlined, FileExcelOutlined,
  FileWordOutlined, SaveOutlined, PlayCircleOutlined,
  PlusOutlined, DeleteOutlined, EditOutlined, CopyOutlined,
  DownloadOutlined, ExportOutlined, ImportOutlined, RiseOutlined, 
  ReloadOutlined, SettingOutlined, FilterOutlined,
  SearchOutlined, EyeOutlined, ShareAltOutlined,
  CalendarOutlined, ClockCircleOutlined, MailOutlined,
  PrinterOutlined, ThunderboltOutlined, RocketOutlined,
  CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined,
  DragOutlined, DatabaseOutlined, ApiOutlined,
  DeploymentUnitOutlined, ClusterOutlined, NodeIndexOutlined,
  ApartmentOutlined, AppstoreAddOutlined, BuildOutlined
} from '@ant-design/icons';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import documentService from '../../services/documentService';
import './CustomReportBuilder.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// ============================================================
// CONSTANTS
// ============================================================

const DATA_SOURCES = {
  documents: {
    label: 'Documents',
    icon: <FileTextOutlined />,
    fields: [
      { id: 'title', label: 'Title', type: 'string' },
      { id: 'document_type', label: 'Type', type: 'string' },
      { id: 'module', label: 'Module', type: 'string' },
      { id: 'status', label: 'Status', type: 'string' },
      { id: 'priority', label: 'Priority', type: 'string' },
      { id: 'created_at', label: 'Created Date', type: 'date' },
      { id: 'updated_at', label: 'Updated Date', type: 'date' },
      { id: 'created_by', label: 'Author', type: 'string' },
      { id: 'file_size', label: 'File Size', type: 'number' },
      { id: 'version', label: 'Version', type: 'number' }
    ]
  },
  users: {
    label: 'Users',
    icon: <TeamOutlined />,
    fields: [
      { id: 'name', label: 'Name', type: 'string' },
      { id: 'email', label: 'Email', type: 'string' },
      { id: 'department', label: 'Department', type: 'string' },
      { id: 'role', label: 'Role', type: 'string' },
      { id: 'last_login', label: 'Last Login', type: 'date' },
      { id: 'documents_count', label: 'Documents Count', type: 'number' }
    ]
  },
  activity: {
    label: 'Activity Logs',
    icon: <HistoryOutlined />,
    fields: [
      { id: 'action', label: 'Action', type: 'string' },
      { id: 'user', label: 'User', type: 'string' },
      { id: 'document_id', label: 'Document', type: 'string' },
      { id: 'timestamp', label: 'Timestamp', type: 'date' },
      { id: 'ip_address', label: 'IP Address', type: 'string' },
      { id: 'duration', label: 'Duration (ms)', type: 'number' }
    ]
  },
  compliance: {
    label: 'Compliance',
    icon: <SafetyCertificateOutlined />,
    fields: [
      { id: 'framework', label: 'Framework', type: 'string' },
      { id: 'requirement', label: 'Requirement', type: 'string' },
      { id: 'status', label: 'Status', type: 'string' },
      { id: 'score', label: 'Score', type: 'number' },
      { id: 'assessed_at', label: 'Assessed Date', type: 'date' }
    ]
  },
  incidents: {
    label: 'Incidents',
    icon: <WarningOutlined />,
    fields: [
      { id: 'incident_number', label: 'Incident #', type: 'string' },
      { id: 'type', label: 'Type', type: 'string' },
      { id: 'severity', label: 'Severity', type: 'string' },
      { id: 'date_occurred', label: 'Date Occurred', type: 'date' },
      { id: 'department', label: 'Department', type: 'string' }
    ]
  }
};

const AGGREGATIONS = {
  count: { label: 'Count', applicable: ['string', 'number'] },
  sum: { label: 'Sum', applicable: ['number'] },
  avg: { label: 'Average', applicable: ['number'] },
  min: { label: 'Minimum', applicable: ['number', 'date'] },
  max: { label: 'Maximum', applicable: ['number', 'date'] },
  distinct: { label: 'Distinct Count', applicable: ['string'] }
};

const VISUALIZATION_TYPES = {
  table: { label: 'Table', icon: <TableOutlined /> },
  bar: { label: 'Bar Chart', icon: <BarChartOutlined /> },
  line: { label: 'Line Chart', icon: <LineChartOutlined /> },
  pie: { label: 'Pie Chart', icon: <PieChartOutlined /> },
  area: { label: 'Area Chart', icon: <AreaChartOutlined /> },
  kpi: { label: 'KPI Card', icon: <RiseOutlined /> }
};

const CHART_COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#fa541c', '#eb2f96'];

// ============================================================
// MAIN COMPONENT
// ============================================================

const CustomReportBuilder = ({
  companyId = null,
  embedded = false,
  onSave = null
}) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [reports, setReports] = useState([]);
  const [reportResults, setReportResults] = useState(null);
  
  // Report configuration
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [dataSource, setDataSource] = useState('documents');
  const [selectedFields, setSelectedFields] = useState([]);
  const [groupBy, setGroupBy] = useState([]);
  const [aggregations, setAggregations] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sortBy, setSortBy] = useState([]);
  const [limit, setLimit] = useState(100);
  const [visualizationType, setVisualizationType] = useState('table');
  const [chartConfig, setChartConfig] = useState({
    xAxis: null,
    yAxis: null,
    groupBy: null
  });
  
  // UI State
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [previewDrawerVisible, setPreviewDrawerVisible] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null);
  
  // Schedule settings
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [scheduleRecipients, setScheduleRecipients] = useState([]);
  const [scheduleFormat, setScheduleFormat] = useState('pdf');
  
  // Forms
  const [form] = Form.useForm();
  const [fieldForm] = Form.useForm();
  const [filterForm] = Form.useForm();

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentService.getCustomReports({ company_id: companyId });
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  
  const handleAddField = (fieldId) => {
    const source = DATA_SOURCES[dataSource];
    const field = source.fields.find(f => f.id === fieldId);
    if (!field) return;
    
    if (selectedFields.find(f => f.id === fieldId)) {
      message.warning('Field already added');
      return;
    }
    
    setSelectedFields([...selectedFields, {
      id: fieldId,
      label: field.label,
      type: field.type,
      aggregation: field.type === 'number' ? 'sum' : 'count'
    }]);
  };
  
  const handleRemoveField = (fieldId) => {
    setSelectedFields(selectedFields.filter(f => f.id !== fieldId));
  };
  
  const handleUpdateAggregation = (fieldId, aggregation) => {
    setSelectedFields(selectedFields.map(f =>
      f.id === fieldId ? { ...f, aggregation } : f
    ));
  };
  
  const handleAddFilter = (values) => {
    setFilters([...filters, {
      id: `filter-${Date.now()}`,
      ...values
    }]);
    setFilterModalVisible(false);
    filterForm.resetFields();
  };
  
  const handleRemoveFilter = (filterId) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };
  
  const handleRunReport = async () => {
    if (selectedFields.length === 0) {
      message.warning('Please add at least one field');
      return;
    }
    
    setRunning(true);
    try {
      const result = await documentService.runCustomReport({
        name: reportName || 'Untitled Report',
        data_source: dataSource,
        fields: selectedFields,
        group_by: groupBy,
        aggregations,
        filters,
        sort_by: sortBy,
        limit,
        visualization_type: visualizationType,
        chart_config: chartConfig,
        company_id: companyId
      });
      
      setReportResults(result);
      message.success(`Report generated: ${result.data?.length || 0} rows`);
      
      // Switch to preview tab if builder
      if (activeTab === 'builder') {
        setActiveTab('preview');
      }
      
    } catch (error) {
      console.error('Failed to run report:', error);
      message.error(error.message || 'Failed to run report');
    } finally {
      setRunning(false);
    }
  };
  
  const handleSaveReport = async (values) => {
    if (selectedFields.length === 0) {
      message.warning('Add fields before saving');
      return;
    }
    
    try {
      const reportData = {
        name: values.name,
        description: values.description || reportDescription,
        data_source: dataSource,
        fields: selectedFields,
        group_by: groupBy,
        aggregations,
        filters,
        sort_by: sortBy,
        limit,
        visualization_type: visualizationType,
        chart_config: chartConfig,
        is_public: values.is_public || false,
        company_id: companyId
      };
      
      if (values.schedule_enabled) {
        reportData.schedule = {
          enabled: true,
          frequency: values.schedule_frequency || scheduleFrequency,
          recipients: values.schedule_recipients || scheduleRecipients,
          format: values.schedule_format || scheduleFormat
        };
      }
      
      await documentService.saveCustomReport(reportData);
      message.success('Report saved');
      setSaveModalVisible(false);
      form.resetFields();
      loadReports();
      
      if (onSave) onSave(reportData);
      
    } catch (error) {
      console.error('Failed to save report:', error);
      message.error('Failed to save report');
    }
  };
  
  const handleLoadReport = async (report) => {
    setReportName(report.name);
    setReportDescription(report.description);
    setDataSource(report.data_source);
    setSelectedFields(report.fields || []);
    setGroupBy(report.group_by || []);
    setAggregations(report.aggregations || []);
    setFilters(report.filters || []);
    setSortBy(report.sort_by || []);
    setLimit(report.limit || 100);
    setVisualizationType(report.visualization_type || 'table');
    setChartConfig(report.chart_config || { xAxis: null, yAxis: null, groupBy: null });
    setActiveTab('builder');
    message.success(`Loaded report: ${report.name}`);
  };
  
  const handleDeleteReport = async (reportId) => {
    try {
      await documentService.deleteCustomReport(reportId);
      message.success('Report deleted');
      loadReports();
    } catch (error) {
      message.error('Failed to delete report');
    }
  };
  
  const handleExport = async (format) => {
    if (!reportResults) {
      message.warning('Run the report first');
      return;
    }
    
    try {
      const blob = await documentService.exportCustomReport({
        report_data: reportResults,
        format,
        name: reportName || 'custom-report'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName || 'custom-report'}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      message.success(`Report exported as ${format.toUpperCase()}`);
      
    } catch (error) {
      message.error('Failed to export report');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getAvailableFields = () => {
    return DATA_SOURCES[dataSource]?.fields || [];
  };
  
  const getFieldType = (fieldId) => {
    const field = getAvailableFields().find(f => f.id === fieldId);
    return field?.type || 'string';
  };
  
  const renderCellValue = (value, field) => {
    if (value === null || value === undefined) return '-';
    
    const fieldType = field?.type || getFieldType(field?.id);
    
    switch (fieldType) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return String(value);
    }
  };

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  
  const renderFieldLibrary = () => {
    const availableFields = getAvailableFields();
    
    return (
      <Card 
        title={
          <Space>
            <DatabaseOutlined />
            <span>Available Fields</span>
          </Space>
        }
        size="small"
        extra={
          <Select 
            value={dataSource} 
            onChange={setDataSource}
            size="small"
            style={{ width: 140 }}
          >
            {Object.entries(DATA_SOURCES).map(([key, value]) => (
              <Option key={key} value={key}>
                {value.label}
              </Option>
            ))}
          </Select>
        }
      >
        <div className="field-library">
          {availableFields.map(field => {
            const isSelected = selectedFields.some(f => f.id === field.id);
            
            return (
              <div
                key={field.id}
                className={`field-item ${isSelected ? 'selected' : ''}`}
                onClick={() => isSelected ? handleRemoveField(field.id) : handleAddField(field.id)}
              >
                <Space>
                  <DragOutlined style={{ color: '#bfbfbf' }} />
                  <Text style={{ fontSize: 12 }}>{field.label}</Text>
                </Space>
                {isSelected && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              </div>
            );
          })}
        </div>
      </Card>
    );
  };
  
  const renderConfigPanel = () => (
    <Card 
      title={
        <Space>
          <BuildOutlined />
          <span>Report Configuration</span>
        </Space>
      }
      size="small"
    >
      <Form layout="vertical">
        {/* Selected Fields */}
        <Form.Item label={
          <Space>
            <span>Fields</span>
            <Badge count={selectedFields.length} style={{ backgroundColor: '#1890ff' }} />
          </Space>
        }>
          {selectedFields.length > 0 ? (
            <div className="selected-fields">
              {selectedFields.map(field => (
                <div key={field.id} className="selected-field-item">
                  <Space style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12 }}>{field.label}</Text>
                    {field.type === 'number' && (
                      <Select
                        size="small"
                        value={field.aggregation}
                        onChange={(v) => handleUpdateAggregation(field.id, v)}
                        style={{ width: 90 }}
                      >
                        {Object.entries(AGGREGATIONS).map(([key, value]) => (
                          <Option 
                            key={key} 
                            value={key}
                            disabled={!value.applicable.includes(field.type)}
                          >
                            {value.label}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Space>
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => handleRemoveField(field.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Add fields from the library"
              style={{ margin: '20px 0' }}
            />
          )}
        </Form.Item>
        
        {/* Filters */}
        <Form.Item label={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <span>Filters</span>
              <Badge count={filters.length} style={{ backgroundColor: '#faad14' }} />
            </Space>
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setFilterModalVisible(true)}
            >
              Add
            </Button>
          </Space>
        }>
          {filters.length > 0 ? (
            <div>
              {filters.map(filter => (
                <Tag
                  key={filter.id}
                  closable
                  onClose={() => handleRemoveFilter(filter.id)}
                  color="blue"
                  style={{ marginBottom: 4 }}
                >
                  {filter.field} {filter.operator} {String(filter.value).substring(0, 20)}
                </Tag>
              ))}
            </div>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>No filters applied</Text>
          )}
        </Form.Item>
        
        {/* Limit */}
        <Form.Item label="Row Limit">
          <InputNumber
            value={limit}
            onChange={setLimit}
            min={1}
            max={10000}
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        {/* Visualization Type */}
        <Form.Item label="Visualization">
          <Segmented
            value={visualizationType}
            onChange={setVisualizationType}
            options={Object.entries(VISUALIZATION_TYPES).map(([key, value]) => ({
              value: key,
              icon: value.icon
            }))}
            block
          />
        </Form.Item>
        
        {/* Chart Config */}
        {visualizationType !== 'table' && visualizationType !== 'kpi' && (
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="X-Axis" style={{ marginBottom: 8 }}>
                <Select
                  value={chartConfig.xAxis}
                  onChange={(v) => setChartConfig({ ...chartConfig, xAxis: v })}
                  size="small"
                  placeholder="Select field"
                >
                  {selectedFields.map(f => (
                    <Option key={f.id} value={f.id}>{f.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Y-Axis" style={{ marginBottom: 8 }}>
                <Select
                  value={chartConfig.yAxis}
                  onChange={(v) => setChartConfig({ ...chartConfig, yAxis: v })}
                  size="small"
                  placeholder="Select field"
                >
                  {selectedFields.map(f => (
                    <Option key={f.id} value={f.id}>{f.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}
        
        <Divider />
        
        <Space style={{ width: '100%' }} direction="vertical">
          <Button
            type="primary"
            block
            icon={<PlayCircleOutlined />}
            onClick={handleRunReport}
            loading={running}
            disabled={selectedFields.length === 0}
          >
            Run Report
          </Button>
          <Button
            block
            icon={<SaveOutlined />}
            onClick={() => setSaveModalVisible(true)}
            disabled={selectedFields.length === 0}
          >
            Save Report
          </Button>
        </Space>
      </Form>
    </Card>
  );
  
  const renderReportPreview = () => {
    if (!reportResults) {
      return (
        <Card>
          <Empty
            description={
              <div>
                <Title level={5}>No Report Data</Title>
                <Text type="secondary">
                  Configure your report and click "Run Report" to see results
                </Text>
              </div>
            }
          >
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={handleRunReport}
              disabled={selectedFields.length === 0}
            >
              Run Report
            </Button>
          </Empty>
        </Card>
      );
    }
    
    const data = reportResults.data || [];
    
    return (
      <Card
        title={
          <Space>
            <span>{reportName || 'Report Preview'}</span>
            <Badge count={data.length} style={{ backgroundColor: '#1890ff' }} />
          </Space>
        }
        size="small"
        extra={
          <Space>
            <Button
              size="small"
              icon={<FilePdfOutlined />}
              onClick={() => handleExport('pdf')}
            >
              PDF
            </Button>
            <Button
              size="small"
              icon={<FileExcelOutlined />}
              onClick={() => handleExport('xlsx')}
            >
              Excel
            </Button>
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleExport('csv')}
            >
              CSV
            </Button>
          </Space>
        }
      >
        {visualizationType === 'table' && (
          <Table
            rowKey={(record, i) => i}
            dataSource={data}
            pagination={{ pageSize: 20 }}
            size="small"
            scroll={{ x: 'max-content' }}
            columns={selectedFields.map(field => ({
              title: field.label,
              dataIndex: field.id,
              key: field.id,
              render: (value) => renderCellValue(value, field)
            }))}
          />
        )}
        
        {visualizationType === 'bar' && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartConfig.xAxis || selectedFields[0]?.id} fontSize={11} />
              <YAxis fontSize={11} />
              <RTooltip />
              <Legend />
              <Bar 
                dataKey={chartConfig.yAxis || selectedFields[1]?.id || selectedFields[0]?.id}
                fill="#1890ff"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        
        {visualizationType === 'line' && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartConfig.xAxis || selectedFields[0]?.id} fontSize={11} />
              <YAxis fontSize={11} />
              <RTooltip />
              <Legend />
              <Line 
                type="monotone"
                dataKey={chartConfig.yAxis || selectedFields[1]?.id || selectedFields[0]?.id}
                stroke="#1890ff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {visualizationType === 'pie' && (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey={chartConfig.yAxis || selectedFields[1]?.id || selectedFields[0]?.id}
                nameKey={chartConfig.xAxis || selectedFields[0]?.id}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <RTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {visualizationType === 'area' && (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartConfig.xAxis || selectedFields[0]?.id} fontSize={11} />
              <YAxis fontSize={11} />
              <RTooltip />
              <Legend />
              <Area 
                type="monotone"
                dataKey={chartConfig.yAxis || selectedFields[1]?.id || selectedFields[0]?.id}
                stroke="#1890ff"
                fill="#1890ff"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        
        {visualizationType === 'kpi' && data.length > 0 && (
          <Row gutter={[16, 16]}>
            {selectedFields.map(field => {
              const value = data[0]?.[field.id];
              return (
                <Col xs={12} md={6} key={field.id}>
                  <Card size="small" className="kpi-preview-card">
                    <Statistic
                      title={field.label}
                      value={typeof value === 'number' ? value : 0}
                      formatter={(v) => renderCellValue(v, field)}
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Card>
    );
  };
  
  const renderSavedReports = () => (
    <Card 
      title={
        <Space>
          <FileTextOutlined />
          <span>Saved Reports</span>
          <Badge count={reports.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      size="small"
    >
      {reports.length > 0 ? (
        <List
          dataSource={reports}
          renderItem={(report) => (
            <List.Item
              actions={[
                <Tooltip key="load" title="Load">
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleLoadReport(report)}
                  />
                </Tooltip>,
                <Tooltip key="duplicate" title="Duplicate">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleLoadReport({ ...report, name: `${report.name} (Copy)` })}
                  />
                </Tooltip>,
                <Popconfirm
                  key="delete"
                  title="Delete this report?"
                  onConfirm={() => handleDeleteReport(report.id)}
                >
                  <Button type="text" size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={VISUALIZATION_TYPES[report.visualization_type]?.icon || <FileTextOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                }
                title={
                  <Space>
                    <span>{report.name}</span>
                    {report.is_public && <Tag color="green">Public</Tag>}
                  </Space>
                }
                description={
                  <div>
                    <div style={{ fontSize: 12 }}>{report.description || 'No description'}</div>
                    <Space size={[4, 4]} style={{ marginTop: 4 }}>
                      <Tag>{DATA_SOURCES[report.data_source]?.label}</Tag>
                      <Tag>{report.fields?.length || 0} fields</Tag>
                      {report.schedule?.enabled && (
                        <Tag color="blue" icon={<ClockCircleOutlined />}>
                          Scheduled
                        </Tag>
                      )}
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No saved reports yet" />
      )}
    </Card>
  );

  // ============================================================
  // MODALS
  // ============================================================
  
  const renderFilterModal = () => (
    <Modal
      title="Add Filter"
      open={filterModalVisible}
      onCancel={() => setFilterModalVisible(false)}
      footer={null}
    >
      <Form form={filterForm} layout="vertical" onFinish={handleAddFilter}>
        <Form.Item
          name="field"
          label="Field"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select field">
            {getAvailableFields().map(field => (
              <Option key={field.id} value={field.id}>
                {field.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="operator"
          label="Operator"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select operator">
            <Option value="equals">Equals</Option>
            <Option value="not_equals">Not Equals</Option>
            <Option value="contains">Contains</Option>
            <Option value="not_contains">Does Not Contain</Option>
            <Option value="greater_than">Greater Than</Option>
            <Option value="less_than">Less Than</Option>
            <Option value="between">Between</Option>
            <Option value="in">In List</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="value"
          label="Value"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter value" />
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setFilterModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">Add Filter</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
  
  const renderSaveModal = () => (
    <Modal
      title="Save Report"
      open={saveModalVisible}
      onCancel={() => setSaveModalVisible(false)}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveReport}
        initialValues={{
          name: reportName,
          description: reportDescription,
          is_public: false,
          schedule_enabled: false
        }}
      >
        <Form.Item
          name="name"
          label="Report Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input placeholder="e.g., Monthly Compliance Report" maxLength={100} />
        </Form.Item>
        
        <Form.Item name="description" label="Description">
          <TextArea rows={2} placeholder="Describe the report purpose" maxLength={500} />
        </Form.Item>
        
        <Form.Item name="is_public" valuePropName="checked">
          <Checkbox>Make available to all team members</Checkbox>
        </Form.Item>
        
        <Divider>Schedule</Divider>
        
        <Form.Item name="schedule_enabled" valuePropName="checked">
          <Checkbox>Schedule automatic generation</Checkbox>
        </Form.Item>
        
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.schedule_enabled !== curr.schedule_enabled}>
          {({ getFieldValue }) => getFieldValue('schedule_enabled') && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="schedule_frequency" label="Frequency">
                    <Select placeholder="Select frequency">
                      <Option value="daily">Daily</Option>
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                      <Option value="quarterly">Quarterly</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="schedule_format" label="Format">
                    <Select placeholder="Select format">
                      <Option value="pdf">PDF</Option>
                      <Option value="xlsx">Excel</Option>
                      <Option value="csv">CSV</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item name="schedule_recipients" label="Email Recipients">
                <Select
                  mode="tags"
                  placeholder="Enter email addresses"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </>
          )}
        </Form.Item>
        
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => setSaveModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save Report
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
    <div className="custom-report-builder" style={{ padding: embedded ? 0 : 24 }}>
      {/* Header */}
      <div className="report-builder-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <BuildOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
              <Title level={4} style={{ margin: 0 }}>Custom Report Builder</Title>
              <Badge status="processing" text="Drag & Drop" />
            </Space>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                style={{ width: 250 }}
              />
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSelectedFields([]);
                  setFilters([]);
                  setReportResults(null);
                  message.info('Reset form');
                }}
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      
      {/* Main Layout */}
      <Row gutter={16}>
        <Col xs={24} lg={5}>
          {renderFieldLibrary()}
        </Col>
        
        <Col xs={24} lg={7}>
          {renderConfigPanel()}
        </Col>
        
        <Col xs={24} lg={12}>
          {renderReportPreview()}
        </Col>
      </Row>
      
      {/* Saved Reports Tab */}
      <div style={{ marginTop: 16 }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'builder',
              label: (
                <Space>
                  <BuildOutlined />
                  Builder
                </Space>
              ),
              children: null
            },
            {
              key: 'preview',
              label: (
                <Space>
                  <EyeOutlined />
                  Preview
                </Space>
              ),
              children: null
            },
            {
              key: 'saved',
              label: (
                <Space>
                  <FileTextOutlined />
                  Saved Reports
                  <Badge count={reports.length} style={{ backgroundColor: '#1890ff' }} />
                </Space>
              ),
              children: renderSavedReports()
            }
          ]}
        />
      </div>
      
      {/* Modals */}
      {renderFilterModal()}
      {renderSaveModal()}
    </div>
  );
};

export default CustomReportBuilder;