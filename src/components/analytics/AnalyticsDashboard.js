import React, { useState, useEffect } from 'react';
import {
  Layout, Card, Row, Col, Statistic, Select, Button, Space, Typography,
  Modal, Form, Input, InputNumber, DatePicker, message, notification,
  Badge, Tooltip, Dropdown, Divider, Progress,
  Tag, Radio, Switch, Collapse, Spin, Alert, Drawer,
  Checkbox, List, Empty
} from 'antd';
import {
  DashboardOutlined, PlusOutlined, SettingOutlined, DownloadOutlined,
  ShareAltOutlined, FullscreenOutlined, FullscreenExitOutlined,
  SaveOutlined, DeleteOutlined, EditOutlined, CopyOutlined,
  ReloadOutlined, ExportOutlined, ImportOutlined,
  FileExcelOutlined, FilePdfOutlined, FileImageOutlined,
  TeamOutlined, WarningOutlined, ClockCircleOutlined,
  SafetyOutlined, AlertOutlined, RiseOutlined, FallOutlined,
  FieldTimeOutlined, ExperimentOutlined, EyeOutlined,
  LineChartOutlined, BarChartOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  ComposedChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Legend, Tooltip as RechartsTooltip, ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import analyticsService from '../services/analyticsService';
import WidgetLibrary from '../components/analytics/WidgetLibrary';
import WidgetConfigModal from '../components/analytics/WidgetConfigModal';
import DataEntryForms from '../components/analytics/DataEntryForms';
import '../styles/PowerBIAnalytics.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// ==================== COLOR DEFINITIONS ====================
const CHART_COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#f5222d',
  info: '#13c2c2',
  purple: '#722ed1',
  magenta: '#eb2f96',
  orange: '#fa8c16',
  cyan: '#13c2c2',
};

const CHART_COLOR_LIST = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#eb2f96', '#fa541c', '#13c2c2', '#2f54eb', '#fa8c16',
  '#a0d911', '#bfbfbf', '#f759ab', '#7cb305', '#adc6ff',
  '#b37feb', '#ff9c6e', '#ff7875', '#ffc53d', '#95de64',
];

const COLOR_SCHEMES = {
  default: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'],
  pastel: ['#bae7ff', '#d9f7be', '#fff1b8', '#ffccc7', '#efdbff'],
  vibrant: ['#0050b3', '#237804', '#ad6800', '#a8071a', '#22075e'],
  monochrome: ['#1f1f1f', '#434343', '#595959', '#8c8c8c', '#bfbfbf'],
  warning: ['#fadb14', '#faad14', '#fa8c16', '#f5222d', '#ff4d4f'],
  heatmap: ['#fff1b8', '#ffe58f', '#ffd666', '#faad14', '#fa8c16', '#f5222d'],
  traffic: ['#52c41a', '#95de64', '#faad14', '#fa8c16', '#f5222d']
};

const PowerBIAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [fullscreen, setFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [settingsDrawer, setSettingsDrawer] = useState(false);
  const [widgetLibraryVisible, setWidgetLibraryVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configModalData, setConfigModalData] = useState(null);
  const [dataEntryModal, setDataEntryModal] = useState(false);
  const [dataEntryType, setDataEntryType] = useState(null);
  const [dataEntryForm] = Form.useForm();
  const [dashboardData, setDashboardData] = useState({});
  const [calculatedMetrics, setCalculatedMetrics] = useState({});
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [savedDashboards, setSavedDashboards] = useState([]);
  const [exportModal, setExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportLoading, setExportLoading] = useState(false);

  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 365);
    return [start, end];
  });

  useEffect(() => {
    loadDashboardData();
    loadDepartments();
    loadProjects();
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshAllData, 300000);
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) clearInterval(refreshInterval);
    }
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const savedConfig = localStorage.getItem('powerbi_dashboard_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setWidgets(config.widgets || []);
      } else {
        const defaultWidgets = [
          { id: uuidv4(), type: 'kpi', title: 'Key Performance Indicators', size: { w: 12, h: 2 }, config: getDefaultConfig('kpi'), visible: true, position: { x: 0, y: 0 } },
          { id: uuidv4(), type: 'manpower', title: 'Manpower Distribution', size: { w: 6, h: 3 }, config: getDefaultConfig('manpower'), visible: true, position: { x: 0, y: 2 } },
          { id: uuidv4(), type: 'training', title: 'Training Statistics', size: { w: 6, h: 3 }, config: getDefaultConfig('training'), visible: true, position: { x: 6, y: 2 } },
          { id: uuidv4(), type: 'lti', title: 'Lost Time Injury Trend', size: { w: 6, h: 3 }, config: getDefaultConfig('lti'), visible: true, position: { x: 0, y: 5 } },
          { id: uuidv4(), type: 'manhours', title: 'Man-Hours Analysis', size: { w: 6, h: 3 }, config: getDefaultConfig('manhours'), visible: true, position: { x: 6, y: 5 } },
          { id: uuidv4(), type: 'observations', title: 'Safety Observations', size: { w: 6, h: 3 }, config: getDefaultConfig('observations'), visible: true, position: { x: 0, y: 8 } },
          { id: uuidv4(), type: 'accidents', title: 'Accident Rate', size: { w: 6, h: 3 }, config: getDefaultConfig('accidents'), visible: true, position: { x: 6, y: 8 } },
          { id: uuidv4(), type: 'injuries', title: 'Injuries by Body Part', size: { w: 8, h: 4 }, config: getDefaultConfig('injuries'), visible: true, position: { x: 0, y: 11 } },
          { id: uuidv4(), type: 'overdue', title: 'Overdue Reports', size: { w: 8, h: 4 }, config: getDefaultConfig('overdue'), visible: true, position: { x: 8, y: 11 } },
        ];
        setWidgets(defaultWidgets);
        saveConfigToLocalStorage(defaultWidgets);
      }

      const filters = {
        start_date: format(dateRange[0], 'yyyy-MM-dd'),
        end_date: format(dateRange[1], 'yyyy-MM-dd'),
        department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      };

      const [manpowerData, trainingData, ltiData, manhoursData, observationsData, accidentsData, injuriesData, overdueData] = await Promise.all([
        analyticsService.fetchManpower(filters).catch(() => []),
        analyticsService.fetchTraining(filters).catch(() => []),
        analyticsService.fetchLTI(filters).catch(() => []),
        analyticsService.fetchManHours(filters).catch(() => []),
        analyticsService.fetchObservations(filters).catch(() => []),
        analyticsService.fetchAccidents(filters).catch(() => []),
        analyticsService.fetchInjuries(filters).catch(() => []),
        analyticsService.fetchOverdueReports(filters).catch(() => [])
      ]);

      const newDashboardData = {
        manpower: manpowerData.data || manpowerData || [],
        training: trainingData.data || trainingData || [],
        lti: ltiData.data || ltiData || [],
        manhours: manhoursData.data || manhoursData || [],
        observations: observationsData.data || observationsData || [],
        accidents: accidentsData.data || accidentsData || [],
        injuries: injuriesData.data || injuriesData || [],
        overdue: overdueData.data || overdueData || []
      };

      setDashboardData(newDashboardData);
      const metrics = await analyticsService.calculateMetrics(newDashboardData);
      setCalculatedMetrics(metrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      notification.error({ message: 'Data Load Failed', description: 'Unable to load analytics data.' });
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await analyticsService.fetchDepartments();
      setDepartments(data.data || data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await analyticsService.fetchProjects();
      setProjects(data.data || data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const getDefaultConfig = (type) => ({
    chartType: 'bar',
    showLegend: true,
    showGrid: true,
    colors: CHART_COLOR_LIST,
    refreshInterval: 0,
    ...(type === 'lti' && { yAxisDomain: [0, 0.5], targetLine: 0.2 }),
    ...(type === 'accidents' && { yAxisDomain: [0, 0.04], targetLine: 0.02 }),
  });

  const getDefaultSize = (type) => {
    const sizes = {
      kpi: { w: 12, h: 2 },
      manpower: { w: 6, h: 3 },
      training: { w: 6, h: 3 },
      lti: { w: 6, h: 3 },
      manhours: { w: 6, h: 3 },
      observations: { w: 6, h: 3 },
      accidents: { w: 6, h: 3 },
      injuries: { w: 8, h: 4 },
      overdue: { w: 8, h: 4 },
    };
    return sizes[type] || { w: 6, h: 3 };
  };

  const getNextPosition = () => {
    if (widgets.length === 0) return { x: 0, y: 0 };
    let maxY = 0;
    widgets.forEach(w => {
      const bottomY = w.position.y + w.size.h;
      if (bottomY > maxY) maxY = bottomY;
    });
    return { x: 0, y: maxY };
  };

  const addWidget = (widgetType) => {
    const newWidget = {
      id: uuidv4(),
      type: widgetType,
      title: getWidgetTitle(widgetType),
      position: getNextPosition(),
      size: getDefaultSize(widgetType),
      config: getDefaultConfig(widgetType),
      visible: true
    };
    setWidgets([...widgets, newWidget]);
    saveConfigToLocalStorage([...widgets, newWidget]);
    message.success(`${getWidgetTitle(widgetType)} added to dashboard`);
  };

  const getWidgetTitle = (type) => {
    const titles = {
      manpower: 'Manpower Distribution',
      training: 'Training Statistics',
      lti: 'Lost Time Injury Trend',
      manhours: 'Man-Hours Analysis',
      observations: 'Safety Observations',
      accidents: 'Accident Rate',
      injuries: 'Injuries by Body Part',
      overdue: 'Overdue Reports',
      kpi: 'Key Performance Indicators'
    };
    return titles[type] || type;
  };

  const updateWidget = (id, updates) => {
    const updatedWidgets = widgets.map(w => w.id === id ? { ...w, ...updates } : w);
    setWidgets(updatedWidgets);
    saveConfigToLocalStorage(updatedWidgets);
  };

  const removeWidget = (id) => {
    const updatedWidgets = widgets.filter(w => w.id !== id);
    setWidgets(updatedWidgets);
    saveConfigToLocalStorage(updatedWidgets);
    message.success('Widget removed');
  };

  const duplicateWidget = (widget) => {
    const newWidget = { ...widget, id: uuidv4(), title: `${widget.title} (Copy)`, position: getNextPosition() };
    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    saveConfigToLocalStorage(updatedWidgets);
    message.success('Widget duplicated');
  };

  const openWidgetConfig = (widget) => {
    setConfigModalData(widget);
    setConfigModalVisible(true);
  };

  const saveWidgetConfig = (widgetId, config) => {
    updateWidget(widgetId, { config });
    message.success('Widget configuration saved');
    setConfigModalVisible(false);
  };

  const saveConfigToLocalStorage = (updatedWidgets) => {
    localStorage.setItem('powerbi_dashboard_config', JSON.stringify({ widgets: updatedWidgets, lastSaved: new Date().toISOString() }));
  };

  const saveDashboard = async (name) => {
    try {
      const dashboard = { name, widgets, dateRange: { start: format(dateRange[0], 'yyyy-MM-dd'), end: format(dateRange[1], 'yyyy-MM-dd') }, selectedDepartment, selectedProject };
      await analyticsService.saveDashboard(dashboard);
      message.success('Dashboard saved successfully');
    } catch (error) {
      message.error('Failed to save dashboard');
    }
  };

  const refreshAllData = () => {
    loadDashboardData();
    notification.info({ message: 'Data Refreshed', description: 'Dashboard data has been updated' });
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const exportConfig = { format: exportFormat, date_range: { start: format(dateRange[0], 'yyyy-MM-dd'), end: format(dateRange[1], 'yyyy-MM-dd') }, widgets: widgets.map(w => w.type) };
      const result = await analyticsService.generateExport(exportConfig);
      if (result.export_id) {
        message.success('Export started successfully');
        setExportModal(false);
        analyticsService.pollExportStatus(result.export_id, 2000, 30).then(async (status) => {
          if (status.status === 'completed') {
            await analyticsService.downloadExport(result.export_id, `dashboard-export.${exportFormat}`);
            notification.success({ message: 'Export Complete', description: 'Your dashboard has been exported successfully' });
          }
        });
      }
    } catch (error) {
      message.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDataEntrySubmit = async (values) => {
    try {
      setLoading(true);
      const processedValues = { ...values };
      if (processedValues.date?.format) processedValues.date = processedValues.date.format('YYYY-MM-DD');
      if (processedValues.completed_date?.format) processedValues.completed_date = processedValues.completed_date.format('YYYY-MM-DD');
      
      let response;
      switch (dataEntryType) {
        case 'manpower': response = await analyticsService.createManpower(processedValues); break;
        case 'training': response = await analyticsService.createTraining(processedValues); break;
        case 'lti': response = await analyticsService.createLTI(processedValues); break;
        case 'manhours': response = await analyticsService.createManHours(processedValues); break;
        case 'observations': response = await analyticsService.createObservation(processedValues); break;
        case 'accidents': response = await analyticsService.createAccident(processedValues); break;
        case 'injuries': response = await analyticsService.createInjury(processedValues); break;
        case 'overdue': response = await analyticsService.createOverdueReport(processedValues); break;
        default: response = { success: false };
      }
      if (response && response.success) {
        message.success(`${dataEntryType} data added successfully`);
        setDataEntryModal(false);
        dataEntryForm.resetFields();
        await loadDashboardData();
      } else {
        message.error('Failed to add data');
      }
    } catch (error) {
      console.error('Data entry error:', error);
      message.error('Failed to add data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Widget Components
  const WidgetMenu = ({ onEdit, onDelete, onDuplicate }) => (
    <Dropdown menu={{ items: [
      { key: 'edit', icon: <EditOutlined />, label: 'Configure', onClick: onEdit },
      { key: 'duplicate', icon: <CopyOutlined />, label: 'Duplicate', onClick: onDuplicate },
      { key: 'delete', icon: <DeleteOutlined />, label: 'Remove', danger: true, onClick: onDelete }
    ] }} trigger={['click']}>
      <Button type="text" size="small" icon={<SettingOutlined />} />
    </Dropdown>
  );

  const KPIWidget = ({ metrics, onEdit, onDelete }) => {
    const displayMetrics = {
      totalManpower: metrics?.totalManpower || 0,
      totalManHours: metrics?.totalManHours || 0,
      ltifr: metrics?.ltifr || 0,
      accidentRate: metrics?.accidentRate || 0,
      trainingRate: metrics?.trainingRate || 0,
      overdueRate: metrics?.overdueRate || 0,
    };
    return (
      <Card className="widget-card kpi-widget" size="small" extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={6} lg={4}><Statistic title="Total Manpower" value={displayMetrics.totalManpower} prefix={<TeamOutlined />} valueStyle={{ color: CHART_COLORS.primary }} /></Col>
          <Col xs={12} sm={8} md={6} lg={4}><Statistic title="Man-Hours" value={displayMetrics.totalManHours} prefix={<FieldTimeOutlined />} valueStyle={{ color: CHART_COLORS.success }} formatter={v => v.toLocaleString()} /></Col>
          <Col xs={12} sm={8} md={6} lg={4}><Statistic title="LTIFR" value={displayMetrics.ltifr} suffix="/1M hrs" precision={2} prefix={<WarningOutlined />} valueStyle={{ color: displayMetrics.ltifr > 0.2 ? CHART_COLORS.danger : CHART_COLORS.success }} /></Col>
          <Col xs={12} sm={8} md={6} lg={4}><Statistic title="Accident Rate" value={displayMetrics.accidentRate} suffix="/10K hrs" precision={3} prefix={<AlertOutlined />} valueStyle={{ color: CHART_COLORS.warning }} /></Col>
          <Col xs={12} sm={8} md={6} lg={4}><Statistic title="Training Rate" value={displayMetrics.trainingRate} suffix="%" precision={1} prefix={<ExperimentOutlined />} valueStyle={{ color: CHART_COLORS.purple }} /></Col>
          <Col xs={12} sm={8} md={6} lg={4}><Statistic title="Overdue Rate" value={displayMetrics.overdueRate} suffix="%" precision={1} prefix={<ClockCircleOutlined />} valueStyle={{ color: displayMetrics.overdueRate > 20 ? CHART_COLORS.danger : CHART_COLORS.success }} /></Col>
        </Row>
      </Card>
    );
  };

  const ManpowerWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    return (
      <Card className="widget-card" size="small" title={<Space><TeamOutlined style={{ color: CHART_COLORS.primary }} /><Text strong>Manpower Distribution</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart><Pie data={data} dataKey="count" nameKey="section" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>{data?.map((e, i) => <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />)}</Pie><RechartsTooltip /></PieChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Total: {data?.reduce((s, i) => s + (i.count || 0), 0)}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('manpower')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const TrainingWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    return (
      <Card className="widget-card" size="small" title={<Space><ExperimentOutlined style={{ color: CHART_COLORS.purple }} /><Text strong>Training Statistics</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="type" width={80} /><RechartsTooltip /><Bar dataKey="count" fill={colors[0]} /></BarChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Total Trained: {data?.reduce((s, i) => s + (i.count || 0), 0)}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('training')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const LTIWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const yAxisDomain = config?.yAxis?.min && config?.yAxis?.max ? [config.yAxis.min, config.yAxis.max] : [0, 0.5];
    const targetLine = config?.targetLine || 0.2;
    const colors = config?.colors || CHART_COLOR_LIST;
    return (
      <Card className="widget-card" size="small" title={<Space><WarningOutlined style={{ color: CHART_COLORS.danger }} /><Text strong>Lost Time Injury Trend</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis domain={yAxisDomain} /><RechartsTooltip /><Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} dot={{ r: 4 }} /><ReferenceLine y={targetLine} stroke={CHART_COLORS.warning} strokeDasharray="3 3" /></LineChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Average: {(data?.reduce((s, i) => s + (i.value || 0), 0) / (data?.length || 1)).toFixed(2)}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('lti')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const ManHoursWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    return (
      <Card className="widget-card" size="small" title={<Space><FieldTimeOutlined style={{ color: CHART_COLORS.cyan }} /><Text strong>Man-Hours Analysis</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="section" /><YAxis /><RechartsTooltip /><Bar dataKey="hours" fill={colors[0]}>{data?.map((e, i) => <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />)}</Bar></BarChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Total: {data?.reduce((s, i) => s + (i.hours || 0), 0).toLocaleString()}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('manhours')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const ObservationsWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    return (
      <Card className="widget-card" size="small" title={<Space><EyeOutlined style={{ color: CHART_COLORS.success }} /><Text strong>Safety Observations</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="type" /><YAxis /><RechartsTooltip /><Bar dataKey="count"><Cell fill={colors[0]} /><Cell fill={colors[1] || CHART_COLORS.danger} /></Bar></BarChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Positive: {data?.find(d => d.type === 'Positive')?.count || 0}</Text><Text type="secondary">Negative: {data?.find(d => d.type === 'Negative')?.count || 0}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('observations')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const AccidentWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    return (
      <Card className="widget-card" size="small" title={<Space><AlertOutlined style={{ color: CHART_COLORS.warning }} /><Text strong>Accident Rate</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis yAxisId="left" domain={[0, 0.04]} /><YAxis yAxisId="right" orientation="right" domain={[0, 3]} /><RechartsTooltip /><Line yAxisId="left" type="monotone" dataKey="rate" stroke={colors[0]} name="Rate" /><Bar yAxisId="right" dataKey="per_10k_hours" fill={colors[1] || CHART_COLORS.primary} name="Per 10K Hours" /></ComposedChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Latest Rate: {data?.[data?.length - 1]?.rate}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('accidents')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const InjuriesWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    return (
      <Card className="widget-card" size="small" title={<Space><SafetyOutlined style={{ color: CHART_COLORS.orange }} /><Text strong>Injuries by Body Part</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="body_part" width={100} /><RechartsTooltip /><Bar dataKey="count" fill={colors[0]}>{data?.map((e, i) => <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />)}</Bar></BarChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Total: {data?.reduce((s, i) => s + (i.count || 0), 0)}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('injuries')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const OverdueWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    return (
      <Card className="widget-card" size="small" title={<Space><ClockCircleOutlined style={{ color: CHART_COLORS.danger }} /><Text strong>Overdue Reports</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" angle={-45} textAnchor="end" height={60} /><YAxis /><RechartsTooltip /><Bar dataKey="on_time" stackId="a" fill={colors[0]} name="On Time" /><Bar dataKey="late" stackId="a" fill={colors[1] || CHART_COLORS.danger} name="Late" /></BarChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Overdue Rate: {((data?.reduce((s, i) => s + (i.late || 0), 0) / (data?.reduce((s, i) => s + (i.on_time || 0) + (i.late || 0), 0) || 1)) * 100).toFixed(1)}%</Text><Button type="link" size="small" onClick={() => setDataEntryModal('overdue')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const renderWidget = (widget) => {
    const props = {
      key: widget.id,
      data: dashboardData[widget.type] || [],
      metrics: calculatedMetrics,
      config: widget.config,
      onEdit: () => openWidgetConfig(widget),
      onDelete: () => removeWidget(widget.id),
      onDuplicate: () => duplicateWidget(widget),
      setDataEntryModal: (type) => { setDataEntryType(type); setDataEntryModal(true); }
    };
    switch (widget.type) {
      case 'kpi': return <KPIWidget {...props} />;
      case 'manpower': return <ManpowerWidget {...props} />;
      case 'training': return <TrainingWidget {...props} />;
      case 'lti': return <LTIWidget {...props} />;
      case 'manhours': return <ManHoursWidget {...props} />;
      case 'observations': return <ObservationsWidget {...props} />;
      case 'accidents': return <AccidentWidget {...props} />;
      case 'injuries': return <InjuriesWidget {...props} />;
      case 'overdue': return <OverdueWidget {...props} />;
      default: return null;
    }
  };

  if (loading && !dashboardData.manpower?.length) {
    return <div className="loading-container"><Spin size="large" tip="Loading Analytics Dashboard..." /><Progress percent={30} status="active" style={{ width: 300, marginTop: 20 }} /></div>;
  }

  return (
    <Layout className={`powerbi-dashboard ${darkMode ? 'dark-mode' : ''} ${fullscreen ? 'fullscreen' : ''}`}>
      <Header className="dashboard-header">
        <div className="header-left"><Title level={3}><DashboardOutlined /> Safety Compliance Dashboard</Title><Badge status="processing" text={`Last Updated: ${format(lastUpdated, 'HH:mm:ss')}`} style={{ marginLeft: 16 }} /></div>
        <div className="header-right"><Space wrap>
          <RangePicker value={[moment(dateRange[0]), moment(dateRange[1])]} onChange={(dates) => { if (dates && dates[0] && dates[1]) { setDateRange([dates[0].toDate(), dates[1].toDate()]); loadDashboardData(); } }} allowClear={false} />
          <Select value={selectedDepartment} onChange={setSelectedDepartment} style={{ width: 150 }} placeholder="Department"><Option value="all">All Departments</Option>{departments.map(dept => <Option key={dept.id} value={dept.id}>{dept.name}</Option>)}</Select>
          <Select value={selectedProject} onChange={setSelectedProject} style={{ width: 150 }} placeholder="Project"><Option value="all">All Projects</Option>{projects.map(proj => <Option key={proj.id} value={proj.id}>{proj.name}</Option>)}</Select>
          <Tooltip title="Refresh Data"><Button icon={<ReloadOutlined />} onClick={refreshAllData} loading={loading} /></Tooltip>
          <Tooltip title="Add Widget"><Button type="primary" icon={<PlusOutlined />} onClick={() => setWidgetLibraryVisible(true)} /></Tooltip>
          <Tooltip title="Save Dashboard"><Button icon={<SaveOutlined />} onClick={() => saveDashboard('New Dashboard')} /></Tooltip>
          <Tooltip title="Export"><Button icon={<DownloadOutlined />} onClick={() => setExportModal(true)} /></Tooltip>
          <Tooltip title="Settings"><Button icon={<SettingOutlined />} onClick={() => setSettingsDrawer(true)} /></Tooltip>
          <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}><Button icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} onClick={() => setFullscreen(!fullscreen)} /></Tooltip>
          <Switch checked={true} onChange={setEditMode} checkedChildren="Edit" unCheckedChildren="View" />
        </Space></div>
      </Header>
      <Content className="dashboard-content">
        <Row gutter={[16, 16]}>
          {widgets.filter(w => w.visible).map(widget => {
            let span = 24;
            if (widget.size.w === 12) span = 24;
            else if (widget.size.w === 8) span = 16;
            else if (widget.size.w === 6) span = 12;
            else span = 12;
            return <Col key={widget.id} xs={24} sm={widget.size.w >= 8 ? 24 : 12} md={span} lg={span} xl={span} style={{ order: widget.position.y }}>{renderWidget(widget)}</Col>;
          })}
          {widgets.length === 0 && <Col span={24}><Card><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Space direction="vertical"><Text>No widgets added yet</Text><Button type="primary" onClick={() => setWidgetLibraryVisible(true)}>Add Your First Widget</Button></Space>} /></Card></Col>}
        </Row>
      </Content>
      <Drawer title="Widget Library" placement="right" width={400} onClose={() => setWidgetLibraryVisible(false)} open={widgetLibraryVisible}><WidgetLibrary onSelect={addWidget} /></Drawer>
      <Drawer title="Dashboard Settings" placement="right" width={400} onClose={() => setSettingsDrawer(false)} open={settingsDrawer}>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="Appearance" key="1"><Space direction="vertical" style={{ width: '100%' }}><Switch checked={darkMode} onChange={setDarkMode} checkedChildren="Dark Mode" unCheckedChildren="Light Mode" /><Divider /><Text>Refresh Interval</Text><Select value={autoRefresh ? '5' : '0'} onChange={v => setAutoRefresh(v !== '0')}><Option value="0">Manual</Option><Option value="5">Every 5 minutes</Option><Option value="15">Every 15 minutes</Option><Option value="30">Every 30 minutes</Option><Option value="60">Every hour</Option></Select></Space></Panel>
          <Panel header="Saved Dashboards" key="2"><List dataSource={savedDashboards} renderItem={item => <List.Item actions={[<Button type="link">Load</Button>, <Button type="link" danger>Delete</Button>]}><List.Item.Meta title={item.name} description={`Last modified: ${item.updatedAt ? format(new Date(item.updatedAt), 'MMM dd, yyyy') : 'N/A'}`} /></List.Item>} /></Panel>
          <Panel header="Data Management" key="3"><Space direction="vertical" style={{ width: '100%' }}><Button icon={<ImportOutlined />} block>Import Data</Button><Button icon={<ExportOutlined />} block>Export All Data</Button><Button icon={<DeleteOutlined />} danger block onClick={() => { localStorage.removeItem('powerbi_dashboard_config'); message.success('Cache cleared'); }}>Clear Cache</Button></Space></Panel>
        </Collapse>
      </Drawer>
      <Modal title={`Add ${dataEntryType ? dataEntryType.charAt(0).toUpperCase() + dataEntryType.slice(1) : ''} Data`} open={dataEntryModal} onCancel={() => setDataEntryModal(false)} footer={null} width={600}><DataEntryForms type={dataEntryType} form={dataEntryForm} onFinish={handleDataEntrySubmit} loading={loading} /></Modal>
      <WidgetConfigModal visible={configModalVisible} widget={configModalData} onSave={saveWidgetConfig} onCancel={() => setConfigModalVisible(false)} />
      <Modal title="Export Dashboard" open={exportModal} onCancel={() => setExportModal(false)} onOk={handleExport} confirmLoading={exportLoading}>
        <Form layout="vertical"><Form.Item label="Export Format"><Radio.Group value={exportFormat} onChange={e => setExportFormat(e.target.value)}><Radio.Button value="excel"><FileExcelOutlined /> Excel</Radio.Button><Radio.Button value="pdf"><FilePdfOutlined /> PDF</Radio.Button><Radio.Button value="image"><FileImageOutlined /> Image</Radio.Button></Radio.Group></Form.Item><Form.Item label="Include"><Checkbox.Group defaultValue={['charts', 'data', 'metrics']}><Checkbox value="charts">Charts</Checkbox><Checkbox value="data">Raw Data</Checkbox><Checkbox value="metrics">Calculations</Checkbox></Checkbox.Group></Form.Item></Form>
      </Modal>
    </Layout>
  );
};

export default PowerBIAnalytics;