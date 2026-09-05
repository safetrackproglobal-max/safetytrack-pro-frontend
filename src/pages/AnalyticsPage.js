// src/pages/AnalyticsPage.js - Updated with Project Management
import React, { useState, useEffect, useRef } from 'react';
import {
  Layout, Card, Row, Col, Statistic, Select, Button, Space, Typography,
  Modal, Form, Input, InputNumber, DatePicker, message, notification,
  Badge, Tooltip, Dropdown, Divider, Progress, Tag, Radio, Switch, 
  Collapse, Spin, Alert, Drawer, Checkbox, List, Empty, Result
} from 'antd';
import {
  DashboardOutlined, PlusOutlined, SettingOutlined, DownloadOutlined,
  FullscreenOutlined, FullscreenExitOutlined, SaveOutlined, DeleteOutlined,
  EditOutlined, CopyOutlined, ReloadOutlined, ExportOutlined, ImportOutlined,
  FileExcelOutlined, FilePdfOutlined, FileImageOutlined, TeamOutlined,
  WarningOutlined, ClockCircleOutlined, SafetyOutlined, AlertOutlined,
  RiseOutlined, FieldTimeOutlined, ExperimentOutlined, EyeOutlined,
  LineChartOutlined, BarChartOutlined, PieChartOutlined, AreaChartOutlined,
  CameraOutlined, FileTextOutlined, ProjectOutlined,
  FolderOpenOutlined, RocketOutlined, MedicineBoxOutlined
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
import notificationService from '../services/notificationService';
import WidgetLibrary from '../components/analytics/WidgetLibrary';
import WidgetConfigModal from '../components/analytics/WidgetConfigModal';
import DataEntryForms from '../components/analytics/DataEntryForms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import './AnalyticsPage.css';
const { TextArea } = Input;
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
  geekblue: '#2f54eb',
  red: '#f5222d',
  volcano: '#fa541c',
  gold: '#faad14',
  lime: '#a0d911',
  green: '#52c41a',
  blue: '#1890ff'
};

const CHART_COLOR_LIST = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#eb2f96', '#fa541c', '#13c2c2', '#2f54eb', '#fa8c16',
  '#a0d911', '#bfbfbf', '#f759ab', '#7cb305', '#adc6ff',
  '#b37feb', '#ff9c6e', '#ff7875', '#ffc53d', '#95de64',
  '#fadb14', '#ff4d4f', '#ffa39e', '#ffd666', '#ffe58f'
];

const PowerBIAnalytics = () => {
  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState([]);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 365);
    return [start, end];
  });
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [projectForm] = Form.useForm();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [fullscreen, setFullscreen] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [settingsDrawer, setSettingsDrawer] = useState(false);
  const [widgetLibraryVisible, setWidgetLibraryVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configModalData, setConfigModalData] = useState(null);
  const [dataEntryModal, setDataEntryModal] = useState(false);
  const [dataEntryType, setDataEntryType] = useState(null);
  const [dataEntryForm] = Form.useForm();
  const [dashboardData, setDashboardData] = useState({
    manpower: [],
    training: [],
    lti: [],
    manhours: [],
    observations: [],
    accidents: [],
    severity: [],
    injuries: [],
    overdue: [],
    ltifr: [],
    incidents: [],
    incidentStats: {
      total: 0,
      byStatus: {},
      bySeverity: {},
      byDepartment: {},
      byType: {},
      trend: []
    }
  });
  const [calculatedMetrics, setCalculatedMetrics] = useState({});
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [hasProjects, setHasProjects] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [savedDashboards, setSavedDashboards] = useState([]);
  const [exportModal, setExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportQuality, setExportQuality] = useState(2);
  
  const dashboardContentRef = useRef(null);

  // ==================== HELPER FUNCTIONS ====================
  const ensureValidDates = (start, end) => {
    const validStart = start instanceof Date && !isNaN(start) ? start : new Date();
    const validEnd = end instanceof Date && !isNaN(end) ? end : new Date();
    return validStart > validEnd ? [validEnd, validStart] : [validStart, validEnd];
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      const validDates = ensureValidDates(dates[0].toDate(), dates[1].toDate());
      setDateRange(validDates);
      loadDashboardData();
    }
  };

  // ==================== INCIDENT DATA PROCESSING ====================
  const processIncidentData = (incidents) => {
    if (!incidents || incidents.length === 0) {
      return {
        total: 0,
        byStatus: {},
        bySeverity: {},
        byDepartment: {},
        byType: {},
        trend: []
      };
    }

    const byStatus = {};
    const bySeverity = {};
    const byDepartment = {};
    const byType = {};
    const trendMap = {};

    incidents.forEach(inc => {
      const status = inc.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;

      const severity = inc.severity || 'unknown';
      bySeverity[severity] = (bySeverity[severity] || 0) + 1;

      const department = inc.department || 'unknown';
      byDepartment[department] = (byDepartment[department] || 0) + 1;

      const type = inc.incident_type || inc.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;

      const date = inc.date_occurred || inc.created_at;
      if (date) {
        const dateKey = moment(date).format('YYYY-MM');
        if (!trendMap[dateKey]) {
          trendMap[dateKey] = { month: dateKey, count: 0, investigating: 0, reported: 0, resolved: 0 };
        }
        trendMap[dateKey].count += 1;
        if (status === 'investigating') trendMap[dateKey].investigating += 1;
        if (status === 'reported') trendMap[dateKey].reported += 1;
        if (status === 'resolved' || status === 'closed') trendMap[dateKey].resolved += 1;
      }
    });

    const trend = Object.values(trendMap).sort((a, b) => a.month.localeCompare(b.month));

    return {
      total: incidents.length,
      byStatus,
      bySeverity,
      byDepartment,
      byType,
      trend
    };
  };

  const loadDashboardData = async () => {
  try {
    setLoading(true);
    
    const filters = {
      start_date: format(dateRange[0], 'yyyy-MM-dd'),
      end_date: format(dateRange[1], 'yyyy-MM-dd'),
      department: selectedDepartment !== 'all' ? selectedDepartment : undefined,
      project: selectedProject !== 'all' ? selectedProject : undefined,
    };

    // Fetch all data from backend
    const [
      manpowerData,
      trainingData,
      ltiDataFromApi,
      manhoursData,
      observationsData,
      accidentsDataFromApi,
      severityDataFromApi,
      injuriesDataFromApi,
      overdueData,
      incidentsResponse
    ] = await Promise.all([
      analyticsService.fetchManpower(filters).catch(() => ({ data: [] })),
      analyticsService.fetchTraining(filters).catch(() => ({ data: [] })),
      analyticsService.fetchLTI(filters).catch(() => ({ data: [] })),
      analyticsService.fetchManHours(filters).catch(() => ({ data: [] })),
      analyticsService.fetchObservations(filters).catch(() => ({ data: [] })),
      analyticsService.fetchAccidents(filters).catch(() => ({ data: [] })),
      analyticsService.fetchSeverity(filters).catch(() => ({ data: [] })),
      analyticsService.fetchInjuries(filters).catch(() => ({ data: [] })),
      analyticsService.fetchOverdueReports(filters).catch(() => ({ data: [] })),
      notificationService.getIncidents(filters).catch(() => ({ incidents: [], count: 0, success: false }))
    ]);

    // Process incident data
    let incidentList = [];
    if (incidentsResponse && incidentsResponse.success) {
      incidentList = incidentsResponse.incidents || [];
    } else if (Array.isArray(incidentsResponse)) {
      incidentList = incidentsResponse;
    } else if (incidentsResponse && incidentsResponse.data) {
      incidentList = Array.isArray(incidentsResponse.data) ? incidentsResponse.data : [];
    }
    
    // ✅ STEP 1: Get project_id
    const projectId = selectedProject !== 'all' ? selectedProject : null;
    
    // ✅ STEP 2: Filter incidents by project_id
    let filteredIncidents = incidentList;
    if (projectId) {
      filteredIncidents = incidentList.filter(inc => inc.project_id === projectId);
      console.log(`✅ Filtered incidents: ${filteredIncidents.length} out of ${incidentList.length} for project ${projectId}`);
    }
    
    // ✅ STEP 3: Map incident data to charts using FILTERED incidents ONLY
    // 1. ACCIDENT RATE - from filtered incidents
    const accidentRateMap = {};
    filteredIncidents.forEach(inc => {
      const date = inc.date_occurred || inc.created_at;
      if (date) {
        const monthKey = moment(date).format('YYYY-MM');
        if (!accidentRateMap[monthKey]) {
          accidentRateMap[monthKey] = { year: monthKey, rate: 0, per_10k_hours: 0 };
        }
        accidentRateMap[monthKey].rate += 1;
        const totalManHours = manhoursData?.data?.reduce((sum, d) => sum + (d.hours || 0), 0) || 2000;
        accidentRateMap[monthKey].per_10k_hours = (accidentRateMap[monthKey].rate / totalManHours) * 10000;
      }
    });
    const mappedAccidentData = Object.values(accidentRateMap).sort((a, b) => a.year.localeCompare(b.year));
    
    // 2. SEVERITY TREND - from filtered incidents
    const severityMap = {};
    const severityScore = { low: 1, medium: 3, high: 5, critical: 7 };
    filteredIncidents.forEach(inc => {
      const date = inc.date_occurred || inc.created_at;
      if (date) {
        const monthKey = moment(date).format('YYYY-MM');
        if (!severityMap[monthKey]) {
          severityMap[monthKey] = { year: monthKey, value: 0, count: 0 };
        }
        const score = severityScore[inc.severity] || 3;
        severityMap[monthKey].value += score;
        severityMap[monthKey].count += 1;
      }
    });
    const mappedSeverityData = Object.values(severityMap)
      .map(d => ({ year: d.year, value: d.value / d.count }))
      .sort((a, b) => a.year.localeCompare(b.year));

    // 3. LTI - from filtered incidents
    const ltiMap = {};
    filteredIncidents.forEach(inc => {
      const date = inc.date_occurred || inc.created_at;
      if (date) {
        const monthKey = moment(date).format('YYYY-MM');
        if (!ltiMap[monthKey]) {
          ltiMap[monthKey] = { year: monthKey, value: 0 };
        }
        if (inc.severity === 'high' || inc.severity === 'critical' || inc.status === 'investigating') {
          ltiMap[monthKey].value += 1;
        }
      }
    });
    const mappedLTIData = Object.values(ltiMap).sort((a, b) => a.year.localeCompare(b.year));

    // 4. INJURIES BY BODY PART - from filtered incidents
    const bodyPartMap = {
      'needle_stick': { body_part: 'Hand/Finger', count: 0 },
      'patient_fall': { body_part: 'Leg/Foot', count: 0 },
      'medication_error': { body_part: 'Head/Neck', count: 0 },
      'fall': { body_part: 'Leg/Foot', count: 0 },
      'default': { body_part: 'Other', count: 0 }
    };
    filteredIncidents.forEach(inc => {
      const type = inc.incident_type || 'default';
      const key = bodyPartMap[type] ? type : 'default';
      bodyPartMap[key].count += 1;
    });
    const mappedInjuriesData = Object.values(bodyPartMap).filter(d => d.count > 0);

    // ✅ STEP 4: Use mapped data ONLY (ignore API data for injuries, lti, severity)
    // Since we're mapping from incidents, we don't need the API data for these
    const finalAccidentsData = mappedAccidentData.length > 0 ? mappedAccidentData : (accidentsDataFromApi?.data || accidentsDataFromApi || []);
    const finalSeverityData = mappedSeverityData.length > 0 ? mappedSeverityData : (severityDataFromApi?.data || severityDataFromApi || []);
    const finalLTIData = mappedLTIData.length > 0 ? mappedLTIData : (ltiDataFromApi?.data || ltiDataFromApi || []);
    const finalInjuriesData = mappedInjuriesData.length > 0 ? mappedInjuriesData : (injuriesDataFromApi?.data || injuriesDataFromApi || []);

    // ✅ STEP 5: Build dashboard data with chart data from FILTERED incidents
    const newDashboardData = {
      manpower: manpowerData?.data || manpowerData || [],
      training: trainingData?.data || trainingData || [],
      lti: finalLTIData,           // ✅ From filtered incidents
      manhours: manhoursData?.data || manhoursData || [],
      observations: observationsData?.data || observationsData || [],
      accidents: finalAccidentsData, // ✅ From filtered incidents
      severity: finalSeverityData,   // ✅ From filtered incidents
      injuries: finalInjuriesData,   // ✅ From filtered incidents
      overdue: overdueData?.data || overdueData || [],
      ltifr: [],
      incidents: filteredIncidents,  // ✅ Filtered incidents
    };

    setDashboardData(newDashboardData);
    
    // ✅ STEP 6: Calculate incident stats from FILTERED incidents
    const filteredIncidentStats = processIncidentData(filteredIncidents);
    
    // ✅ STEP 7: Send ONLY filtered data to backend
    const metricsPayload = {
      ...newDashboardData,
      incidents: filteredIncidents,
      incidentStats: filteredIncidentStats,
      project_id: projectId,
      project: projectId
    };
    
    console.log('📊 Sending metrics payload:', {
      totalIncidents: filteredIncidents.length,
      totalInjuries: finalInjuriesData.reduce((sum, d) => sum + d.count, 0),
      totalLTIs: finalLTIData.length,
      projectId: projectId
    });
    
    const metrics = await analyticsService.calculateMetrics(metricsPayload).catch(() => ({}));
    
    setCalculatedMetrics(metrics || {});
    setLastUpdated(new Date());
    
    const savedConfig = localStorage.getItem('powerbi_dashboard_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setWidgets(config.widgets || []);
    } else {
      setWidgets([]);
    }
    
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    notification.error({ 
      message: 'Data Load Failed', 
      description: 'Unable to load analytics data from backend. Please check your connection.' 
    });
    setDashboardData({
      manpower: [],
      training: [],
      lti: [],
      manhours: [],
      observations: [],
      accidents: [],
      severity: [],
      injuries: [],
      overdue: [],
      ltifr: [],
      incidents: [],
      incidentStats: {
        total: 0,
        byStatus: {},
        bySeverity: {},
        byDepartment: {},
        byType: {},
        trend: []
      }
    });
    setCalculatedMetrics({});
  } finally {
    setLoading(false);
  }
};

  const loadDepartments = async () => {
    try {
      const data = await analyticsService.fetchDepartments();
      setDepartments(data?.data || data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
      setDepartments([]);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await analyticsService.fetchProjects();
      const projectList = data?.data || data || [];
      setProjects(projectList);
      setHasProjects(projectList.length > 0);
      
      // If there are projects and none selected, select the first one
      if (projectList.length > 0 && selectedProject === 'all') {
        setSelectedProject(projectList[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
      setHasProjects(false);
    }
  };

  const loadSavedDashboards = async () => {
    try {
      const data = await analyticsService.getSavedDashboards();
      setSavedDashboards(data?.data || data || []);
    } catch (error) {
      console.error('Failed to load saved dashboards:', error);
      setSavedDashboards([]);
    }
  };

  // ==================== PROJECT MANAGEMENT ====================
  const handleCreateProject = async (values) => {
    try {
      const response = await analyticsService.createProject({
        name: values.name,
        description: values.description,
        status: values.status || 'active',
        priority: values.priority || 'medium',
        start_date: values.start_date?.format('YYYY-MM-DD'),
        end_date: values.end_date?.format('YYYY-MM-DD'),
        budget: values.budget,
        department: values.department
      });
      
      if (response && response.success) {
        message.success('🎉 Project created successfully!');
        projectForm.resetFields();
        setProjectModalVisible(false);
        await loadProjects();
        // Auto-select the new project
        if (response.data && response.data.id) {
          setSelectedProject(response.data.id);
          await loadDashboardData();
        }
      } else {
        message.error('Failed to create project: ' + (response?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      message.error('Failed to create project: ' + (error.message || 'Unknown error'));
    }
  };

  // ==================== WIDGET CONFIGURATION ====================
  const getDefaultConfig = (type) => {
    const baseConfig = {
      chartType: 'bar',
      showLegend: true,
      showGrid: true,
      colors: CHART_COLOR_LIST,
      refreshInterval: 0,
    };
    
    const typeSpecific = {
      lti: { yAxisDomain: [0, 0.5], targetLine: 0.2 },
      accidents: { yAxisDomain: [0, 0.04], targetLine: 0.02 },
      severity: { yAxisDomain: [0, 6], targetLine: 3 },
      ltifr: { showMovingAverage: true, movingAveragePeriod: 3 },
      incident_summary: { showStatusColors: true },
      incident_trend: { showMovingAverage: true },
      incident_by_department: { showPercentages: true }
    };
    
    return { ...baseConfig, ...typeSpecific[type] };
  };

  const getDefaultSize = (type) => {
    const sizes = {
      kpi: { w: 12, h: 2 },
      manpower: { w: 6, h: 3 },
      training: { w: 6, h: 3 },
      lti: { w: 6, h: 3 },
      manhours: { w: 6, h: 3 },
      observations: { w: 6, h: 3 },
      accidents: { w: 6, h: 3 },
      severity: { w: 6, h: 3 },
      injuries: { w: 8, h: 4 },
      overdue: { w: 8, h: 4 },
      ltifr: { w: 8, h: 4 },
      incident_summary: { w: 6, h: 3 },
      incident_trend: { w: 8, h: 4 },
      incident_by_department: { w: 6, h: 3 }
    };
    return sizes[type] || { w: 6, h: 3 };
  };

  const getWidgetTitle = (type) => {
    const titles = {
      manpower: 'Manpower Distribution',
      training: 'Training Statistics',
      lti: 'Lost Time Injury Trend',
      manhours: 'Man-Hours Analysis',
      observations: 'Safety Observations',
      accidents: 'Accident Rate',
      severity: 'Injury Severity',
      injuries: 'Injuries by Body Part',
      overdue: 'Overdue Reports',
      ltifr: 'LTIFR Trend',
      kpi: 'Key Performance Indicators',
      incident_summary: 'Incident Summary',
      incident_trend: 'Incident Trend',
      incident_by_department: 'Incidents by Department'
    };
    return titles[type] || type;
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

  // ==================== WIDGET MANAGEMENT ====================
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
    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    saveConfigToLocalStorage(updatedWidgets);
    message.success(`${getWidgetTitle(widgetType)} added to dashboard`);
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
      const dashboard = {
        name, widgets,
        dateRange: { start: format(dateRange[0], 'yyyy-MM-dd'), end: format(dateRange[1], 'yyyy-MM-dd') },
        selectedDepartment, selectedProject
      };
      await analyticsService.saveDashboard(dashboard);
      await loadSavedDashboards();
      message.success('Dashboard saved successfully');
    } catch (error) {
      message.error('Failed to save dashboard');
    }
  };

  const loadDashboard = (dashboardId) => {
    const dashboard = savedDashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      setWidgets(dashboard.widgets || []);
      if (dashboard.dateRange) {
        setDateRange([new Date(dashboard.dateRange.start), new Date(dashboard.dateRange.end)]);
      }
      setSelectedDepartment(dashboard.selectedDepartment || 'all');
      setSelectedProject(dashboard.selectedProject || 'all');
      saveConfigToLocalStorage(dashboard.widgets || []);
      message.success('Dashboard loaded');
    }
  };

  const refreshAllData = () => {
    loadDashboardData();
    notification.info({ message: 'Data Refreshed', description: 'Dashboard data has been updated' });
  };

  // ==================== EXPORT FUNCTIONS ====================
  const captureDashboard = async () => {
    if (!dashboardContentRef.current) {
      message.error('Dashboard not found');
      return null;
    }

    try {
      const element = dashboardContentRef.current;
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(element, {
        scale: exportQuality || 2,
        useCORS: true,
        backgroundColor: darkMode ? '#141414' : '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (document) => {
          const charts = document.querySelectorAll('.recharts-wrapper');
          charts.forEach(chart => {
            chart.style.width = '100%';
            chart.style.height = '100%';
          });
        }
      });
      
      return canvas;
    } catch (error) {
      console.error('Dashboard capture failed:', error);
      throw error;
    }
  };

  const exportPNG = async () => {
    try {
      const canvas = await captureDashboard();
      if (!canvas) throw new Error('Failed to capture dashboard');
      
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const link = document.createElement('a');
      link.download = `dashboard_${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      message.success('✅ Dashboard exported as PNG');
      return true;
    } catch (error) {
      console.error('PNG export error:', error);
      message.error('PNG export failed: ' + (error.message || 'Unknown error'));
      return false;
    }
  };

  const exportJPG = async () => {
    try {
      const canvas = await captureDashboard();
      if (!canvas) throw new Error('Failed to capture dashboard');
      
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const link = document.createElement('a');
      link.download = `dashboard_${timestamp}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      
      message.success('✅ Dashboard exported as JPG');
      return true;
    } catch (error) {
      console.error('JPG export error:', error);
      message.error('JPG export failed: ' + (error.message || 'Unknown error'));
      return false;
    }
  };

  const exportPDF = async () => {
    try {
      setExportLoading(true);
      const hide = message.loading('Generating PDF...', 0);
      
      const element = dashboardContentRef.current;
      if (!element) throw new Error('Dashboard not found');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const totalHeight = element.scrollHeight;
      const pageHeight = 1500;
      const totalPages = Math.ceil(totalHeight / pageHeight);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: 'a4',
        compress: true
      });
      
      let capturedHeight = 0;
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: darkMode ? '#141414' : '#ffffff',
          logging: false,
          width: element.scrollWidth,
          height: Math.min(pageHeight, totalHeight - capturedHeight),
          windowWidth: element.scrollWidth,
          windowHeight: Math.min(pageHeight, totalHeight - capturedHeight),
          y: capturedHeight,
          onclone: (document) => {
            const charts = document.querySelectorAll('.recharts-wrapper');
            charts.forEach(chart => {
              chart.style.width = '100%';
              chart.style.height = '100%';
            });
          }
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = (pdfHeight - imgHeight * ratio) / 2;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        capturedHeight += pageHeight;
      }
      
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      pdf.save(`dashboard_${timestamp}.pdf`);
      
      hide();
      message.success(`✅ Dashboard exported as PDF (${totalPages} pages)`);
      return true;
    } catch (error) {
      console.error('PDF export error:', error);
      message.error('PDF export failed: ' + (error.message || 'Unknown error'));
      return false;
    } finally {
      setExportLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    
    try {
      let success = false;
      
      switch (exportFormat) {
        case 'png':
          success = await exportPNG();
          break;
        case 'jpg':
          success = await exportJPG();
          break;
        case 'pdf':
          success = await exportPDF();
          break;
        default:
          message.error('Unsupported format');
      }
      
      if (success) {
        setExportModal(false);
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Export failed: ' + (error.message || 'Unknown error'));
    } finally {
      setExportLoading(false);
    }
  };

  // ==================== DATA ENTRY ====================
  const handleDataEntrySubmit = async (values) => {
    try {
      setLoading(true);
      const processedValues = { ...values };
      if (processedValues.date?.format) processedValues.date = processedValues.date.format('YYYY-MM-DD');
      if (processedValues.completed_date?.format) processedValues.completed_date = processedValues.completed_date.format('YYYY-MM-DD');
      if (processedValues.start_date?.format) processedValues.start_date = processedValues.start_date.format('YYYY-MM-DD');
      if (processedValues.end_date?.format) processedValues.end_date = processedValues.end_date.format('YYYY-MM-DD');
      
      let response;
      switch (dataEntryType) {
        case 'manpower': response = await analyticsService.createManpower(processedValues); break;
        case 'training': response = await analyticsService.createTraining(processedValues); break;
        case 'lti': response = await analyticsService.createLTI(processedValues); break;
        case 'manhours': response = await analyticsService.createManHours(processedValues); break;
        case 'observations': response = await analyticsService.createObservation(processedValues); break;
        case 'accidents': response = await analyticsService.createAccident(processedValues); break;
        case 'severity': response = await analyticsService.createSeverity(processedValues); break;
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

  // ==================== WIDGET COMPONENTS ====================
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
      totalManpower: metrics?.total_manpower || metrics?.totalManpower || 0,
      totalManHours: metrics?.total_man_hours || metrics?.totalManHours || 0,
      ltifr: metrics?.ltifr || 0,
      accidentRate: metrics?.accident_rate || metrics?.accidentRate || 0,
      trainingRate: metrics?.training_rate || metrics?.trainingRate || 0,
      overdueRate: metrics?.overdue_rate || metrics?.overdueRate || 0,
      positiveObs: metrics?.positive_obs || metrics?.positiveObs || 0,
      negativeObs: metrics?.negative_obs || metrics?.negativeObs || 0,
      totalInjuries: metrics?.total_injuries || metrics?.totalInjuries || 0,
      avgSeverity: metrics?.avg_severity || metrics?.avgSeverity || 0
    };
    return (
      <Card className="widget-card kpi-widget" size="small" extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={8} lg={8}><Statistic title="Total Manpower" value={displayMetrics.totalManpower} prefix={<TeamOutlined />} valueStyle={{ color: CHART_COLORS.primary, fontSize: 24 }} formatter={v => v.toLocaleString()} /><div style={{ fontSize: 12, color: '#8c8c8c' }}>Active employees</div></Col>
          <Col xs={12} sm={8} md={8} lg={8}><Statistic title="Man-Hours" value={displayMetrics.totalManHours} prefix={<FieldTimeOutlined />} valueStyle={{ color: CHART_COLORS.success, fontSize: 24 }} formatter={v => v.toLocaleString()} /><div style={{ fontSize: 12, color: '#8c8c8c' }}>Total hours worked</div></Col>
          <Col xs={12} sm={8} md={8} lg={8}><Statistic title="LTIFR" value={displayMetrics.ltifr} suffix="/1M hrs" precision={2} prefix={<WarningOutlined />} valueStyle={{ color: displayMetrics.ltifr > 0.2 ? CHART_COLORS.danger : CHART_COLORS.success, fontSize: 24 }} /><div style={{ fontSize: 12, color: '#8c8c8c' }}>Lost Time Injury Rate</div></Col>
          <Col xs={12} sm={8} md={8} lg={8}><Statistic title="Accident Rate" value={displayMetrics.accidentRate} suffix="/10K hrs" precision={3} prefix={<AlertOutlined />} valueStyle={{ color: CHART_COLORS.warning, fontSize: 24 }} /><div style={{ fontSize: 12, color: '#8c8c8c' }}>Per 10,000 hours</div></Col>
          <Col xs={12} sm={8} md={8} lg={8}><Statistic title="Training Rate" value={displayMetrics.trainingRate} suffix="%" precision={1} prefix={<ExperimentOutlined />} valueStyle={{ color: CHART_COLORS.purple, fontSize: 24 }} /><div style={{ fontSize: 12, color: '#8c8c8c' }}>Completion rate</div></Col>
          <Col xs={12} sm={8} md={8} lg={8}><Statistic title="Overdue Rate" value={displayMetrics.overdueRate} suffix="%" precision={1} prefix={<ClockCircleOutlined />} valueStyle={{ color: displayMetrics.overdueRate > 20 ? CHART_COLORS.danger : CHART_COLORS.success, fontSize: 24 }} /><div style={{ fontSize: 12, color: '#8c8c8c' }}>Reports overdue</div></Col>
          <Col xs={12} sm={8} md={8} lg={8}><Statistic title="Observations" value={displayMetrics.positiveObs + displayMetrics.negativeObs} prefix={<EyeOutlined />} valueStyle={{ color: CHART_COLORS.info, fontSize: 24 }} formatter={v => v.toLocaleString()} /><div style={{ fontSize: 12, color: '#8c8c8c' }}><span style={{ color: CHART_COLORS.success }}>{displayMetrics.positiveObs} Positive</span> / <span style={{ color: CHART_COLORS.danger }}>{displayMetrics.negativeObs} Negative</span></div></Col>
          <Col xs={12} sm={8} md={8} lg={8}><Statistic title="Injuries" value={displayMetrics.totalInjuries} prefix={<SafetyOutlined />} valueStyle={{ color: CHART_COLORS.orange, fontSize: 24 }} /><div style={{ fontSize: 12, color: '#8c8c8c' }}>Total reported injuries</div></Col>
          <Col xs={12} sm={8} md={8} lg={8}><Statistic title="Avg Severity" value={displayMetrics.avgSeverity} precision={1} prefix={<RiseOutlined />} valueStyle={{ color: CHART_COLORS.magenta, fontSize: 24 }} /><div style={{ fontSize: 12, color: '#8c8c8c' }}>Average severity score</div></Col>
        </Row>
      </Card>
    );
  };

  const ManpowerWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    const showLegend = config?.showLegend !== false;
    const chartData = data && data.length > 0 ? data : [{ section: 'No Data', count: 0 }];
    return (
      <Card className="widget-card" size="small" title={<Space><TeamOutlined style={{ color: CHART_COLORS.primary }} /><Text strong>Manpower Distribution</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart><Pie data={chartData} dataKey="count" nameKey="section" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>{chartData?.map((e, i) => <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />)}</Pie><RechartsTooltip />{showLegend && <Legend />}</PieChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Total: {data?.reduce((s, i) => s + (i.count || 0), 0) || 0}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('manpower')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const TrainingWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    const chartType = config?.chartType || 'bar';
    const showLegend = config?.showLegend !== false;
    const chartData = data && data.length > 0 ? data : [{ type: 'No Data', count: 0 }];
    return (
      <Card className="widget-card" size="small" title={<Space><ExperimentOutlined style={{ color: CHART_COLORS.purple }} /><Text strong>Training Statistics</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          {chartType === 'bar' ? (
            <BarChart data={chartData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="type" width={80} /><RechartsTooltip />{showLegend && <Legend />}<Bar dataKey="count" fill={colors[0]} /></BarChart>
          ) : (
            <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="type" /><YAxis /><RechartsTooltip />{showLegend && <Legend />}<Line type="monotone" dataKey="count" stroke={colors[0]} strokeWidth={2} /></LineChart>
          )}
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Total Trained: {data?.reduce((s, i) => s + (i.count || 0), 0) || 0}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('training')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const LTIWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const yAxisDomain = config?.yAxis?.min && config?.yAxis?.max ? [config.yAxis.min, config.yAxis.max] : [0, 0.5];
    const targetLine = config?.targetLine || 0.2;
    const colors = config?.colors || CHART_COLOR_LIST;
    const chartData = data && data.length > 0 ? data : [{ year: 'No Data', value: 0 }];
    return (
      <Card className="widget-card" size="small" title={<Space><WarningOutlined style={{ color: CHART_COLORS.danger }} /><Text strong>Lost Time Injury Trend</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis domain={yAxisDomain} /><RechartsTooltip /><Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} dot={{ r: 4 }} /><ReferenceLine y={targetLine} stroke={CHART_COLORS.warning} strokeDasharray="3 3" /></LineChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Average: {(data?.reduce((s, i) => s + (i.value || 0), 0) / (data?.length || 1)).toFixed(2) || 0}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('lti')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const ManHoursWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    const chartData = data && data.length > 0 ? data : [{ section: 'No Data', hours: 0 }];
    return (
      <Card className="widget-card" size="small" title={<Space><FieldTimeOutlined style={{ color: CHART_COLORS.cyan }} /><Text strong>Man-Hours Analysis</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="section" /><YAxis /><RechartsTooltip /><Bar dataKey="hours" fill={colors[0]}>{chartData?.map((e, i) => <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />)}</Bar></BarChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Total: {data?.reduce((s, i) => s + (i.hours || 0), 0).toLocaleString() || 0}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('manhours')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const ObservationsWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    const chartType = config?.chartType || 'bar';
    const chartData = data && data.length > 0 ? data : [{ type: 'No Data', count: 0 }];
    return (
      <Card className="widget-card" size="small" title={<Space><EyeOutlined style={{ color: CHART_COLORS.success }} /><Text strong>Safety Observations</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          {chartType === 'pie' ? (
            <PieChart><Pie data={chartData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label>{chartData?.map((e, i) => <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />)}</Pie><RechartsTooltip /></PieChart>
          ) : (
            <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="type" /><YAxis /><RechartsTooltip /><Bar dataKey="count"><Cell fill={colors[0]} /><Cell fill={colors[1] || CHART_COLORS.danger} /></Bar></BarChart>
          )}
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Positive: {data?.find(d => d.type === 'Positive')?.count || 0}</Text><Text type="secondary">Negative: {data?.find(d => d.type === 'Negative')?.count || 0}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('observations')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const AccidentWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    const chartData = data && data.length > 0 ? data : [{ year: 'No Data', rate: 0, per_10k_hours: 0 }];
    return (
      <Card className="widget-card" size="small" title={<Space><AlertOutlined style={{ color: CHART_COLORS.warning }} /><Text strong>Accident Rate</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis yAxisId="left" domain={[0, 0.04]} /><YAxis yAxisId="right" orientation="right" domain={[0, 3]} /><RechartsTooltip /><Line yAxisId="left" type="monotone" dataKey="rate" stroke={colors[0]} name="Rate" /><Bar yAxisId="right" dataKey="per_10k_hours" fill={colors[1] || CHART_COLORS.primary} name="Per 10K Hours" /></ComposedChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Latest Rate: {data?.[data?.length - 1]?.rate || 0}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('accidents')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const SeverityWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const yAxisDomain = config?.yAxis?.min && config?.yAxis?.max ? [config.yAxis.min, config.yAxis.max] : [0, 6];
    const targetLine = config?.targetLine || 3;
    const colors = config?.colors || CHART_COLOR_LIST;
    const chartData = data && data.length > 0 ? data : [{ year: 'No Data', value: 0 }];
    return (
      <Card className="widget-card" size="small" title={<Space><RiseOutlined style={{ color: CHART_COLORS.magenta }} /><Text strong>Injury Severity Trend</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis domain={yAxisDomain} /><RechartsTooltip /><Area type="monotone" dataKey="value" stroke={colors[0]} fill={colors[0]} fillOpacity={0.3} /><ReferenceLine y={targetLine} stroke={CHART_COLORS.warning} strokeDasharray="3 3" /></AreaChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Average: {(data?.reduce((s, i) => s + (i.value || 0), 0) / (data?.length || 1)).toFixed(1) || 0}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('severity')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const InjuriesWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    const chartData = data && data.length > 0 ? data : [{ body_part: 'No Data', count: 0 }];
    return (
      <Card className="widget-card" size="small" title={<Space><SafetyOutlined style={{ color: CHART_COLORS.orange }} /><Text strong>Injuries by Body Part</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="body_part" width={100} /><RechartsTooltip /><Bar dataKey="count" fill={colors[0]}>{chartData?.map((e, i) => <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />)}</Bar></BarChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Total: {data?.reduce((s, i) => s + (i.count || 0), 0) || 0}</Text><Button type="link" size="small" onClick={() => setDataEntryModal('injuries')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const OverdueWidget = ({ data, onEdit, onDelete, setDataEntryModal, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    const chartData = data && data.length > 0 ? data : [{ month: 'No Data', on_time: 0, late: 0 }];
    return (
      <Card className="widget-card" size="small" title={<Space><ClockCircleOutlined style={{ color: CHART_COLORS.danger }} /><Text strong>Overdue Reports</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" angle={-45} textAnchor="end" height={60} /><YAxis /><RechartsTooltip /><Bar dataKey="on_time" stackId="a" fill={colors[0]} name="On Time" /><Bar dataKey="late" stackId="a" fill={colors[1] || CHART_COLORS.danger} name="Late" /></BarChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Overdue Rate: {((data?.reduce((s, i) => s + (i.late || 0), 0) / (data?.reduce((s, i) => s + (i.on_time || 0) + (i.late || 0), 0) || 1)) * 100).toFixed(1) || 0}%</Text><Button type="link" size="small" onClick={() => setDataEntryModal('overdue')}>Add Data</Button></Space></div>
      </Card>
    );
  };

  const LTIFRWidget = ({ data, metrics, onEdit, onDelete, config }) => {
    const colors = config?.colors || CHART_COLOR_LIST;
    const ltifrData = data && data.length > 0 ? data : [{ year: 'No Data', value: metrics?.ltifr || 0 }];
    return (
      <Card className="widget-card" size="small" title={<Space><LineChartOutlined style={{ color: CHART_COLORS.primary }} /><Text strong>LTIFR Trend</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={ltifrData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis domain={[0, 0.5]} /><RechartsTooltip /><Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} name="LTIFR" /><ReferenceLine y={metrics?.ltifr || 0} stroke={CHART_COLORS.success} strokeDasharray="3 3" label="Current" /></LineChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Space><Text type="secondary">Current LTIFR: {metrics?.ltifr || 0}</Text><Tag color={metrics?.ltifr > 0.2 ? 'red' : 'green'}>{metrics?.ltifr > 0.2 ? 'Above Target' : 'Within Target'}</Tag></Space></div>
      </Card>
    );
  };

  // Incident Summary Widget
  const IncidentSummaryWidget = ({ stats, onEdit, onDelete }) => {
    const statusColors = {
      reported: '#faad14',
      investigating: '#1890ff',
      resolved: '#52c41a',
      closed: '#52c41a'
    };
    
    return (
      <Card className="widget-card" size="small" title={<Space><MedicineBoxOutlined style={{ color: CHART_COLORS.danger }} /><Text strong>Incident Summary</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <Row gutter={[16, 16]}>
          <Col span={12}><Statistic title="Total Incidents" value={stats?.total || 0} valueStyle={{ color: CHART_COLORS.primary }} /></Col>
          <Col span={12}>
            <div><Text type="secondary">Status Breakdown</Text></div>
            {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <Tag color={statusColors[status] || '#bfbfbf'}>{status}</Tag>
                <Text strong>{count}</Text>
              </div>
            ))}
          </Col>
        </Row>
        <div className="widget-footer"><Text type="secondary">Latest incident data from current period</Text></div>
      </Card>
    );
  };

  // Incident Trend Widget
  const IncidentTrendWidget = ({ stats, onEdit, onDelete, config }) => {
    const trendData = stats?.trend || [];
    const showMovingAverage = config?.showMovingAverage !== false;
    const colors = config?.colors || CHART_COLOR_LIST;
    const chartData = trendData.length > 0 ? trendData : [{ month: 'No Data', count: 0 }];
    
    return (
      <Card className="widget-card" size="small" title={<Space><LineChartOutlined style={{ color: CHART_COLORS.primary }} /><Text strong>Incident Trend</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke={colors[0]} name="Total Incidents" strokeWidth={2} />
            <Line type="monotone" dataKey="investigating" stroke={CHART_COLORS.primary} name="Investigating" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="resolved" stroke={CHART_COLORS.success} name="Resolved" strokeDasharray="5 5" />
            {showMovingAverage && (
              <Line type="monotone" dataKey="count" stroke={CHART_COLORS.warning} name="3-Month Avg" strokeDasharray="3 3" />
            )}
          </LineChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Text type="secondary">Monthly incident trend analysis</Text></div>
      </Card>
    );
  };

  // Incident By Department Widget
  const IncidentByDepartmentWidget = ({ stats, onEdit, onDelete, config }) => {
    const deptData = Object.entries(stats?.byDepartment || {}).map(([name, value]) => ({ name, value }));
    const colors = config?.colors || CHART_COLOR_LIST;
    const chartData = deptData.length > 0 ? deptData : [{ name: 'No Data', value: 0 }];
    const showPercentages = config?.showPercentages !== false;
    const total = chartData.reduce((sum, d) => sum + d.value, 0);
    
    return (
      <Card className="widget-card" size="small" title={<Space><TeamOutlined style={{ color: CHART_COLORS.purple }} /><Text strong>Incidents by Department</Text></Space>} extra={<WidgetMenu onEdit={onEdit} onDelete={onDelete} />}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => showPercentages ? `${name}: ${((value / total) * 100).toFixed(0)}%` : name}>
              {chartData?.map((e, i) => <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />)}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="widget-footer"><Text type="secondary">Total incidents by department</Text></div>
      </Card>
    );
  };

  // ==================== RENDER WIDGET ====================
  const renderWidget = (widget) => {
    const commonProps = {
      key: widget.id,
      data: dashboardData[widget.type] || [],
      stats: dashboardData.incidentStats,
      metrics: calculatedMetrics,
      config: widget.config,
      onEdit: () => openWidgetConfig(widget),
      onDelete: () => removeWidget(widget.id),
      onDuplicate: () => duplicateWidget(widget),
      setDataEntryModal: (type) => { setDataEntryType(type); setDataEntryModal(true); }
    };

    switch (widget.type) {
      case 'kpi': return <KPIWidget {...commonProps} />;
      case 'manpower': return <ManpowerWidget {...commonProps} />;
      case 'training': return <TrainingWidget {...commonProps} />;
      case 'lti': return <LTIWidget {...commonProps} />;
      case 'manhours': return <ManHoursWidget {...commonProps} />;
      case 'observations': return <ObservationsWidget {...commonProps} />;
      case 'accidents': return <AccidentWidget {...commonProps} />;
      case 'severity': return <SeverityWidget {...commonProps} />;
      case 'injuries': return <InjuriesWidget {...commonProps} />;
      case 'overdue': return <OverdueWidget {...commonProps} />;
      case 'ltifr': return <LTIFRWidget {...commonProps} />;
      case 'incident_summary': return <IncidentSummaryWidget {...commonProps} />;
      case 'incident_trend': return <IncidentTrendWidget {...commonProps} />;
      case 'incident_by_department': return <IncidentByDepartmentWidget {...commonProps} />;
      default: return null;
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    const init = async () => {
      await loadProjects();
      await loadDepartments();
      await loadSavedDashboards();
      
      // If no projects, show the "Create Project" flow
      // If projects exist, load dashboard data
      if (hasProjects) {
        await loadDashboardData();
      } else {
        setLoading(false);
      }
    };
    init();
    
    return () => { if (refreshInterval) clearInterval(refreshInterval); };
  }, []);

  useEffect(() => {
    if (autoRefresh && hasProjects) {
      const interval = setInterval(() => {
        loadDashboardData();
        message.info('Dashboard auto-refreshed');
      }, 300000);
      setRefreshInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  }, [autoRefresh, hasProjects]);

  useEffect(() => {
    if (hasProjects && selectedProject !== 'all') {
      loadDashboardData();
    }
  }, [selectedProject, selectedDepartment, dateRange]);

  // ==================== RENDER ====================
  
  // ✅ Show "Create Project" screen if no projects
  if (!hasProjects && !loading) {
    return (
      <div className="analytics-no-projects">
        <Result
          icon={<ProjectOutlined style={{ color: '#1890ff' }} />}
          title="Welcome to Safety Analytics"
          subTitle="You don't have any projects yet. Create your first project to start tracking safety metrics."
          extra={[
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />}
              onClick={() => setProjectModalVisible(true)}
              style={{ background: '#1890ff' }}
            >
              Create Your First Project
            </Button>
          ]}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
            <Card style={{ width: 200, textAlign: 'center' }}>
              <RocketOutlined style={{ fontSize: 32, color: '#1890ff' }} />
              <p style={{ marginTop: 8 }}>Track Safety Metrics</p>
              <Text type="secondary" style={{ fontSize: 12 }}>Monitor incidents, training, and compliance</Text>
            </Card>
            <Card style={{ width: 200, textAlign: 'center' }}>
              <DashboardOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <p style={{ marginTop: 8 }}>Visual Analytics</p>
              <Text type="secondary" style={{ fontSize: 12 }}>View charts and trends in real-time</Text>
            </Card>
            <Card style={{ width: 200, textAlign: 'center' }}>
              <SafetyOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <p style={{ marginTop: 8 }}>Improve Safety</p>
              <Text type="secondary" style={{ fontSize: 12 }}>Make data-driven safety decisions</Text>
            </Card>
          </div>
        </Result>
        
        {/* Project Creation Modal */}
        <Modal
          title="Create Your First Project"
          open={projectModalVisible}
          onCancel={() => setProjectModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form form={projectForm} layout="vertical" onFinish={handleCreateProject}>
            <Form.Item 
              name="name" 
              label="Project Name" 
              rules={[{ required: true, message: 'Please enter project name' }]}
            >
              <Input placeholder="e.g., Safety Improvement Project 2024" size="large" />
            </Form.Item>
            <Form.Item 
              name="description" 
              label="Description" 
              rules={[{ required: true, message: 'Please enter project description' }]}
            >
              <TextArea rows={3} placeholder="Describe the project's safety goals..." />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="department" label="Department">
                  <Select placeholder="Select department">
                    <Option value="All">All Departments</Option>
                    {departments.map(dept => (
                      <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="Status" initialValue="active">
                  <Select>
                    <Option value="active">Active</Option>
                    <Option value="planning">Planning</Option>
                    <Option value="on_hold">On Hold</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="start_date" label="Start Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="end_date" label="End Date">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" size="large" block icon={<RocketOutlined />}>
                Launch Project
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  // ✅ Show loading state
  if (loading && !dashboardData.manpower?.length) {
    return <div className="loading-container"><Spin size="large" tip="Loading Analytics Dashboard..." /><Progress percent={30} status="active" style={{ width: 300, marginTop: 20 }} /></div>;
  }

  // ✅ Show full dashboard with projects
  return (
    <Layout className={`powerbi-dashboard ${darkMode ? 'dark-mode' : ''} ${fullscreen ? 'fullscreen' : ''}`}>
      <Header className="dashboard-header">
        <div className="header-left">
          <Title level={3} style={{ margin: 0, fontSize: '16px' }}>
            <DashboardOutlined /> Safety Compliance Dashboard
          </Title>
          <Badge 
            status="processing" 
            text={`Last Updated: ${format(lastUpdated, 'HH:mm:ss')}`} 
            style={{ marginLeft: 8, fontSize: '12px' }}
          />
        </div>
        <div className="header-right">
          <Space size="small" wrap={false} style={{ flexWrap: 'nowrap' }}>
            <RangePicker 
              value={[moment(dateRange[0]), moment(dateRange[1])]} 
              onChange={handleDateRangeChange} 
              allowClear={false}
              size="small"
              style={{ minWidth: 180 }}
            />
            <Select 
              value={selectedDepartment} 
              onChange={setSelectedDepartment} 
              style={{ width: 120 }} 
              size="small"
              placeholder="Dept"
            >
              <Option value="all">All Depts</Option>
              {departments.map(dept => (
                <Option key={dept.id} value={dept.id}>{dept.name}</Option>
              ))}
            </Select>
            
            {/* ✅ Project Selector - Shows when projects exist */}
            <Select 
              value={selectedProject} 
              onChange={setSelectedProject} 
              style={{ width: 150 }} 
              size="small"
              placeholder="Select Project"
            >
              <Option value="all">All Projects</Option>
              {projects.map(proj => (
                <Option key={proj.id} value={proj.id}>
                  <ProjectOutlined /> {proj.name}
                </Option>
              ))}
            </Select>
            
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setProjectModalVisible(true)}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
              size="small"
            >
              New Project
            </Button>
            
            <Tooltip title="Refresh Data">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={refreshAllData} 
                loading={loading} 
                size="small"
              />
            </Tooltip>
            <Tooltip title="Add Widget">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setWidgetLibraryVisible(true)} 
                size="small"
              />
            </Tooltip>
            <Tooltip title="Save Dashboard">
              <Button 
                icon={<SaveOutlined />} 
                onClick={() => saveDashboard('New Dashboard')} 
                size="small"
              />
            </Tooltip>
            
            <Dropdown
              menu={{
                items: [
                  { 
                    key: 'png', 
                    label: 'PNG (Screenshot)', 
                    icon: <FileImageOutlined style={{ color: '#1890ff' }} />,
                    onClick: () => { setExportFormat('png'); setExportModal(true); }
                  },
                  { 
                    key: 'jpg', 
                    label: 'JPG (Screenshot)', 
                    icon: <FileImageOutlined style={{ color: '#fa8c16' }} />,
                    onClick: () => { setExportFormat('jpg'); setExportModal(true); }
                  },
                  { 
                    key: 'pdf', 
                    label: 'PDF (Screenshot)', 
                    icon: <FilePdfOutlined style={{ color: '#f5222d' }} />,
                    onClick: () => { setExportFormat('pdf'); setExportModal(true); }
                  },
                ],
              }}
            >
              <Tooltip title="Export Dashboard">
                <Button 
                  icon={<DownloadOutlined />} 
                  size="small"
                >
                  Export
                </Button>
              </Tooltip>
            </Dropdown>
            
            <Tooltip title="Settings">
              <Button 
                icon={<SettingOutlined />} 
                onClick={() => setSettingsDrawer(true)} 
                size="small"
              />
            </Tooltip>
            <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              <Button 
                icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
                onClick={() => setFullscreen(!fullscreen)} 
                size="small"
              />
            </Tooltip>
            <Switch 
              checked={editMode} 
              onChange={setEditMode} 
              checkedChildren="Edit" 
              unCheckedChildren="View" 
              size="small"
            />
          </Space>
        </div>
      </Header>
      
      <Content className="dashboard-content" ref={dashboardContentRef}>
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

      {/* Project Creation Modal (reused) */}
      <Modal
        title="Create New Project"
        open={projectModalVisible}
        onCancel={() => setProjectModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={projectForm} layout="vertical" onFinish={handleCreateProject}>
          <Form.Item 
            name="name" 
            label="Project Name" 
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Description" 
            rules={[{ required: true, message: 'Please enter project description' }]}
          >
            <TextArea rows={3} placeholder="Project description" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Department">
                <Select placeholder="Select department">
                  <Option value="All">All Departments</Option>
                  {departments.map(dept => (
                    <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" initialValue="active">
                <Select>
                  <Option value="planning">Planning</Option>
                  <Option value="active">Active</Option>
                  <Option value="on_hold">On Hold</Option>
                  <Option value="completed">Completed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="start_date" label="Start Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="end_date" label="End Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="budget" label="Budget (Optional)">
            <InputNumber min={0} step={1000} style={{ width: '100%' }} placeholder="e.g., 50000" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Project
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Export Modal */}
      <Modal 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DownloadOutlined /> Export Dashboard
          </div>
        }
        open={exportModal} 
        onCancel={() => setExportModal(false)} 
        onOk={handleExport} 
        confirmLoading={exportLoading}
        okText="Export"
        cancelText="Cancel"
        width={550}
      >
        <Form layout="vertical">
          <Form.Item label="Export Format" required>
            <Radio.Group 
              value={exportFormat} 
              onChange={e => setExportFormat(e.target.value)}
              buttonStyle="solid"
              style={{ width: '100%', display: 'flex' }}
            >
              <Radio.Button value="png" style={{ flex: 1, textAlign: 'center' }}>
                <FileImageOutlined /> PNG
              </Radio.Button>
              <Radio.Button value="jpg" style={{ flex: 1, textAlign: 'center' }}>
                <FileImageOutlined /> JPG
              </Radio.Button>
              <Radio.Button value="pdf" style={{ flex: 1, textAlign: 'center' }}>
                <FilePdfOutlined /> PDF
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item label="Quality / Resolution">
            <Select 
              value={exportQuality}
              onChange={setExportQuality}
              style={{ width: '100%' }}
            >
              <Select.Option value={1}>Standard (1x) - Smaller file</Select.Option>
              <Select.Option value={2}>High (2x) - Recommended</Select.Option>
              <Select.Option value={3}>Retina (3x) - Best quality</Select.Option>
            </Select>
          </Form.Item>
          
          <div style={{ 
            padding: 12, 
            background: '#f5f5f5', 
            borderRadius: 4,
            fontSize: 12,
            color: '#666'
          }}>
            <span><CameraOutlined /> Captures a screenshot of the entire dashboard with all visual elements</span>
          </div>
          
          <div style={{ 
            marginTop: 12,
            padding: 8, 
            background: '#e6f7ff', 
            borderRadius: 4,
            fontSize: 12,
            color: '#0050b3',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>📊 Visible Widgets: {widgets.filter(w => w.visible).length}</span>
            <span>📅 Date Range: {format(dateRange[0], 'MMM dd, yyyy')} - {format(dateRange[1], 'MMM dd, yyyy')}</span>
          </div>
        </Form>
      </Modal>
      
      <Drawer title="Widget Library" placement="right" width={400} onClose={() => setWidgetLibraryVisible(false)} open={widgetLibraryVisible}>
        <WidgetLibrary onSelect={addWidget} />
      </Drawer>
      
      <Drawer title="Dashboard Settings" placement="right" width={400} onClose={() => setSettingsDrawer(false)} open={settingsDrawer}>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="Appearance" key="1">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Switch checked={darkMode} onChange={setDarkMode} checkedChildren="Dark Mode" unCheckedChildren="Light Mode" />
              <Divider />
              <Text>Refresh Interval</Text>
              <Select value={autoRefresh ? '5' : '0'} onChange={v => setAutoRefresh(v !== '0')}>
                <Option value="0">Manual</Option>
                <Option value="5">Every 5 minutes</Option>
                <Option value="15">Every 15 minutes</Option>
                <Option value="30">Every 30 minutes</Option>
                <Option value="60">Every hour</Option>
              </Select>
            </Space>
          </Panel>
          <Panel header="Saved Dashboards" key="2">
            <List 
              dataSource={savedDashboards} 
              renderItem={item => (
                <List.Item 
                  actions={[
                    <Button type="link" onClick={() => loadDashboard(item.id)}>Load</Button>, 
                    <Button type="link" danger>Delete</Button>
                  ]}
                >
                  <List.Item.Meta 
                    title={item.name} 
                    description={`Last modified: ${item.updatedAt ? format(new Date(item.updatedAt), 'MMM dd, yyyy') : 'N/A'}`} 
                  />
                </List.Item>
              )} 
            />
          </Panel>
          <Panel header="Data Management" key="3">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button icon={<ImportOutlined />} block>Import Data</Button>
              <Button icon={<ExportOutlined />} block>Export All Data</Button>
              <Button icon={<DeleteOutlined />} danger block onClick={() => { localStorage.removeItem('powerbi_dashboard_config'); message.success('Cache cleared'); }}>
                Clear Cache
              </Button>
            </Space>
          </Panel>
        </Collapse>
      </Drawer>
      
      <Modal 
        title={`Add ${dataEntryType ? dataEntryType.charAt(0).toUpperCase() + dataEntryType.slice(1) : ''} Data`} 
        open={dataEntryModal} 
        onCancel={() => setDataEntryModal(false)} 
        footer={null} 
        width={600}
      >
        <DataEntryForms type={dataEntryType} form={dataEntryForm} onFinish={handleDataEntrySubmit} loading={loading} />
      </Modal>
      
      <WidgetConfigModal visible={configModalVisible} widget={configModalData} onSave={saveWidgetConfig} onCancel={() => setConfigModalVisible(false)} />
    </Layout>
  );
};

export default PowerBIAnalytics;