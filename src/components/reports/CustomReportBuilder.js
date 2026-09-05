// src/components/reports/CustomReportBuilder.js - IMPROVED VERSION
import React, { useState, useEffect, useMemo } from "react";
import { 
  Card, Row, Col, Select, Button, DatePicker, Form, Input, Checkbox, 
  Divider, Tabs, Table, Tag, message, Spin, Statistic, Alert, Space,
  Badge, Tooltip, Progress, Collapse, Popover, InputNumber, Switch,
  List, Avatar, Typography, Descriptions, Modal, Drawer
} from 'antd';
import { 
  FileTextOutlined, 
  AlertOutlined, 
  DownloadOutlined,
  CheckCircleOutlined, 
  FilterOutlined, 
  BarChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PlusOutlined,
  ClearOutlined,
  CarOutlined,
  SaveOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
  CalendarOutlined,
  TagOutlined,
  BuildOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ExportOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import notificationService from '../../services/notificationService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

dayjs.extend(relativeTime);

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Text, Paragraph } = Typography;

// ==================== CONSTANTS ====================

const SEVERITY_COLORS = {
  critical: '#f5222d',
  high: '#fa541c',
  medium: '#faad14',
  low: '#52c41a'
};

const STATUS_COLORS = {
  reported: '#1890ff',
  under_review: '#faad14',
  investigating: '#722ed1',
  in_progress: '#13c2c2',
  resolved: '#52c41a',
  closed: '#d9d9d9',
  rejected: '#f5222d',
  draft: '#d9d9d9'
};

const INDUSTRIES = [
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#1890ff' },
  { id: 'construction', name: 'Construction', icon: '🏗️', color: '#fa8c16' },
  { id: 'oil_gas', name: 'Oil & Gas', icon: '🛢️', color: '#52c41a' },
  { id: 'aviation', name: 'Aviation', icon: '✈️', color: '#722ed1' },
  { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', color: '#fa541c' },
  { id: 'transportation', name: 'Transportation', icon: '🚚', color: '#13c2c2' },
  { id: 'mining', name: 'Mining', icon: '⛏️', color: '#eb2f96' },
  { id: 'hospitality', name: 'Hospitality', icon: '🏨', color: '#a0d911' }
];

const INCIDENT_TYPES = [
  'Needle Stick Injury', 'Patient Fall', 'Medication Error', 'Biohazard Exposure', 
  'Medical Equipment Failure', 'Workplace Violence',
  'Fall from Height', 'Equipment Accident', 'Structural Collapse', 'Electrical Hazard',
  'Fire', 'Struck by Object',
  'Spill/Leak', 'Fire/Explosion', 'Chemical Exposure', 'Equipment Failure',
  'Confined Space Incident', 'Gas Release',
  'Ground Incident', 'Maintenance Issue', 'Safety Violation', 'Security Breach',
  'Equipment Damage', 'Runway Incident',
  'Machine Accident', 'Ergonomics Issue', 'Noise Hazard', 'Amputation',
  'Vehicle Accident', 'Loading/Unloading Incident', 'Spill During Transport',
  'Driver Safety Issue', 'Cargo Damage',
  'Cave-in', 'Dust Explosion', 'Respiratory Hazard',
  'Slip/Trip/Fall', 'Food Safety Issue', 'Fire Safety', 'Security Incident'
];

const REGULATORY_BODIES = [
  { id: 'osha', name: 'OSHA', icon: '🛡️' },
  { id: 'fda', name: 'FDA', icon: '💊' },
  { id: 'epa', name: 'EPA', icon: '🌿' },
  { id: 'dot', name: 'DOT', icon: '🚛' },
  { id: 'faa', name: 'FAA', icon: '✈️' },
  { id: 'msha', name: 'MSHA', icon: '⛏️' },
  { id: 'niosh', name: 'NIOSH', icon: '🔬' }
];

// ==================== MAIN COMPONENT ====================

export default function CustomReportBuilder() {
  const [reportType, setReportType] = useState('incidents');
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState({ pdf: false, excel: false, print: false });
  const [reportData, setReportData] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('filters');
  const [chartView, setChartView] = useState('summary');
  const [previewDrawerVisible, setPreviewDrawerVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // ==================== SAVED REPORTS MANAGEMENT ====================

  useEffect(() => {
    // Load saved reports from localStorage
    const saved = localStorage.getItem('savedReports');
    if (saved) {
      try {
        setSavedReports(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved reports:', e);
      }
    }
  }, []);

  const saveReportTemplate = (values) => {
    const template = {
      id: Date.now().toString(),
      name: values.templateName || `Report ${savedReports.length + 1}`,
      filters: values,
      created: dayjs().format('YYYY-MM-DD HH:mm'),
      reportType: reportType
    };

    const updated = [...savedReports, template];
    setSavedReports(updated);
    localStorage.setItem('savedReports', JSON.stringify(updated));
    message.success('Report template saved successfully!');
  };

  const loadReportTemplate = (template) => {
    setSelectedTemplate(template);
    form.setFieldsValue(template.filters);
    message.success(`Loaded template: ${template.name}`);
    // Auto-generate report
    setTimeout(() => {
      handleGenerateReport(template.filters);
    }, 300);
  };

  const deleteSavedReport = (id) => {
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    localStorage.setItem('savedReports', JSON.stringify(updated));
    message.success('Report template deleted');
  };

  // ==================== QUICK REPORT TEMPLATES ====================

  const quickTemplates = [
    {
      id: 'critical_month',
      name: 'Critical Incidents This Month',
      icon: <AlertOutlined style={{ color: '#f5222d' }} />,
      description: 'High and critical severity incidents',
      filter: () => {
        const startOfMonth = dayjs().startOf('month');
        const endOfMonth = dayjs().endOf('month');
        form.setFieldsValue({
          dateRange: [startOfMonth, endOfMonth],
          severity: ['high', 'critical']
        });
        handleGenerateReport(form.getFieldsValue());
      }
    },
    {
      id: 'open_investigations',
      name: 'Open Investigations',
      icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
      description: 'Incidents under investigation',
      filter: () => {
        const startOfLastMonth = dayjs().subtract(1, 'month').startOf('month');
        const endOfLastMonth = dayjs().subtract(1, 'month').endOf('month');
        form.setFieldsValue({
          dateRange: [startOfLastMonth, endOfLastMonth],
          status: ['under_review', 'investigating', 'in_progress']
        });
        handleGenerateReport(form.getFieldsValue());
      }
    },
    {
      id: 'industrial_ytd',
      name: 'Industrial Incidents YTD',
      icon: <BuildOutlined style={{ color: '#52c41a' }} />,
      description: 'Construction, manufacturing, mining, oil & gas',
      filter: () => {
        const startOfYear = dayjs().startOf('year');
        const endOfYear = dayjs().endOf('year');
        form.setFieldsValue({
          dateRange: [startOfYear, endOfYear],
          industry: ['construction', 'manufacturing', 'mining', 'oil_gas']
        });
        handleGenerateReport(form.getFieldsValue());
      }
    },
    {
      id: 'healthcare',
      name: 'Healthcare Incidents',
      icon: <SafetyCertificateOutlined style={{ color: '#1890ff' }} />,
      description: 'Healthcare industry incidents',
      filter: () => {
        const startOfMonth = dayjs().subtract(3, 'month').startOf('month');
        const endOfMonth = dayjs().endOf('month');
        form.setFieldsValue({
          dateRange: [startOfMonth, endOfMonth],
          industry: ['healthcare']
        });
        handleGenerateReport(form.getFieldsValue());
      }
    },
    {
      id: 'regulatory_compliance',
      name: 'Regulatory Compliance',
      icon: <SafetyCertificateOutlined style={{ color: '#722ed1' }} />,
      description: 'Incidents requiring regulatory reporting',
      filter: () => {
        const startOfQuarter = dayjs().startOf('quarter');
        const endOfQuarter = dayjs().endOf('quarter');
        form.setFieldsValue({
          dateRange: [startOfQuarter, endOfQuarter],
          regulatory: ['osha', 'fda', 'epa']
        });
        handleGenerateReport(form.getFieldsValue());
      }
    },
    {
      id: 'transportation_safety',
      name: 'Transportation Safety',
      icon: <CarOutlined style={{ color: '#13c2c2' }} />,
      description: 'Vehicle and transportation incidents',
      filter: () => {
        const startOfMonth = dayjs().subtract(6, 'month').startOf('month');
        const endOfMonth = dayjs().endOf('month');
        form.setFieldsValue({
          dateRange: [startOfMonth, endOfMonth],
          incidentType: ['Vehicle Accident', 'Loading/Unloading Incident', 'Spill During Transport'],
          industry: ['transportation']
        });
        handleGenerateReport(form.getFieldsValue());
      }
    }
  ];

  // ==================== REPORT GENERATION ====================

  const handleGenerateReport = async (values) => {
    setLoading(true);
    setReportData(null);
    
    try {
      console.log('Generating custom report with:', values);
      
      // Build filters
      const filters = {};
      
      if (values.dateRange && values.dateRange.length === 2) {
        filters.start_date = values.dateRange[0].format('YYYY-MM-DD');
        filters.end_date = values.dateRange[1].format('YYYY-MM-DD');
      }
      
      if (values.industry && values.industry.length > 0) {
        filters.industry_id = values.industry;
      }
      
      if (values.severity && values.severity.length > 0) {
        filters.severity = values.severity;
      }
      
      if (values.status && values.status.length > 0) {
        filters.status = values.status;
      }
      
      if (values.incidentType && values.incidentType.length > 0) {
        filters.incident_type = values.incidentType;
      }
      
      if (values.location) {
        filters.location = values.location;
      }
      
      if (values.investigator) {
        filters.investigator = values.investigator;
      }
      
      if (values.regulatory && values.regulatory.length > 0) {
        filters.regulatory = values.regulatory;
      }

      if (values.department && values.department.length > 0) {
        filters.department = values.department;
      }

      if (values.injured_persons_min) {
        filters.injured_persons_min = values.injured_persons_min;
      }

      if (values.injured_persons_max) {
        filters.injured_persons_max = values.injured_persons_max;
      }
      
      // Fetch data
      let reportResults = [];
      
      if (notificationService.getFilteredIncidents) {
        const response = await notificationService.getFilteredIncidents(filters);
        reportResults = extractIncidents(response);
      } else {
        const response = await notificationService.getIncidents();
        reportResults = extractIncidents(response);
        // Apply filters manually if backend doesn't support filtering
        reportResults = applyManualFilters(reportResults, filters);
      }
      
      // Calculate summary statistics
      const summary = calculateSummary(reportResults);
      
      setReportData({
        reports: reportResults,
        summary: summary,
        filters: values,
        generatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      });
      
      if (reportResults.length === 0) {
        message.info('No incidents found matching your criteria');
      } else {
        message.success({
          content: `Report generated successfully with ${reportResults.length} records`,
          duration: 3
        });
      }
      
    } catch (error) {
      console.error('Report generation failed:', error);
      handleFallbackReportGeneration(values);
    } finally {
      setLoading(false);
    }
  };

  const extractIncidents = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.incidents) return response.incidents;
    if (response.data) return Array.isArray(response.data) ? response.data : [];
    if (response.results) return response.results;
    return [];
  };

  const applyManualFilters = (data, filters) => {
    let results = [...data];
    
    if (filters.severity && filters.severity.length > 0) {
      results = results.filter(r => filters.severity.includes(r.severity));
    }
    
    if (filters.status && filters.status.length > 0) {
      results = results.filter(r => filters.status.includes(r.status));
    }
    
    if (filters.industry_id && filters.industry_id.length > 0) {
      results = results.filter(r => filters.industry_id.includes(r.industry_id) || 
        filters.industry_id.includes(r.industryName));
    }
    
    if (filters.incident_type && filters.incident_type.length > 0) {
      results = results.filter(r => filters.incident_type.includes(r.incident_type));
    }
    
    if (filters.start_date && filters.end_date) {
      const start = dayjs(filters.start_date);
      const end = dayjs(filters.end_date);
      results = results.filter(r => {
        const date = dayjs(r.date_occurred || r.date || r.created_at);
        return date.isAfter(start) && date.isBefore(end);
      });
    }
    
    return results;
  };

  const calculateSummary = (data) => {
    return {
      total: data.length,
      critical: data.filter(r => r.severity === 'critical').length,
      high: data.filter(r => r.severity === 'high').length,
      medium: data.filter(r => r.severity === 'medium').length,
      low: data.filter(r => r.severity === 'low').length,
      resolved: data.filter(r => r.status === 'resolved' || r.status === 'closed').length,
      pending: data.filter(r => r.status !== 'resolved' && r.status !== 'closed').length,
      byIndustry: data.reduce((acc, r) => {
        const key = r.industry || r.industryName || r.industry_id || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: data.reduce((acc, r) => {
        const key = r.severity || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
      byStatus: data.reduce((acc, r) => {
        const key = r.status || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    };
  };

  const handleFallbackReportGeneration = async (values) => {
    try {
      message.loading('Trying fallback...', 1);
      const fallbackResponse = await notificationService.getIncidents();
      let fallbackResults = extractIncidents(fallbackResponse);
      
      if (fallbackResults.length > 0) {
        const summary = calculateSummary(fallbackResults);
        setReportData({
          reports: fallbackResults,
          summary: summary,
          filters: values,
          generatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          isFallback: true
        });
        message.warning('Showing all incidents (filters not applied)');
      } else {
        message.error('Failed to generate report. Please try again.');
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      message.error('Failed to generate report. Please try again.');
    }
  };

  // ==================== EXPORT FUNCTIONS ====================

  const exportToExcel = () => {
    if (!reportData?.reports?.length) {
      message.warning('No data to export');
      return;
    }

    setExportLoading(prev => ({ ...prev, excel: true }));

    try {
      const excelData = reportData.reports.map(incident => ({
        'Incident #': incident.incident_number || incident.incidentNumber || incident.id || 'N/A',
        'Date': formatDate(incident.date_occurred || incident.date || incident.created_at),
        'Type': (incident.incident_type || incident.incidentType || incident.type || '').replace(/_/g, ' '),
        'Severity': (incident.severity || '').toUpperCase(),
        'Status': (incident.status || '').replace('_', ' ').toUpperCase(),
        'Industry': incident.industry || incident.industryName || incident.industry_id || 'N/A',
        'Location': incident.location || 'N/A',
        'Department': incident.department || '',
        'Reported By': incident.reported_by_name || incident.reported_by || '',
        'Description': incident.description || '',
        'Investigator': incident.investigator || '',
        'Injured Persons': incident.injured_persons || 0,
        'Witnesses': incident.witnesses || 0
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const colWidths = [
        { wch: 12 }, // Incident #
        { wch: 15 }, // Date
        { wch: 20 }, // Type
        { wch: 10 }, // Severity
        { wch: 12 }, // Status
        { wch: 15 }, // Industry
        { wch: 20 }, // Location
        { wch: 15 }, // Department
        { wch: 15 }, // Reported By
        { wch: 40 }, // Description
        { wch: 15 }, // Investigator
        { wch: 15 }, // Injured Persons
        { wch: 12 }  // Witnesses
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Incident Report');
      
      const fileName = `incident-report-${dayjs().format('YYYY-MM-DD-HHmm')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      message.success('Report exported as Excel');
    } catch (error) {
      console.error('Excel export failed:', error);
      message.error('Failed to export Excel');
    } finally {
      setExportLoading(prev => ({ ...prev, excel: false }));
    }
  };

  const exportToPDF = () => {
    if (!reportData?.reports?.length) {
      message.warning('No data to export');
      return;
    }

    setExportLoading(prev => ({ ...prev, pdf: true }));

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add header with logo placeholder
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('📋 Incident Report', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${dayjs().format('YYYY-MM-DD HH:mm')}`, 14, 28);
      doc.text(`Records: ${reportData.reports.length}`, 14, 34);
      
      if (reportData.filters) {
        const filterSummary = buildFilterSummary(reportData.filters);
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(`Filters: ${filterSummary}`, 14, 40);
      }

      // Summary statistics
      const summaryY = reportData.filters ? 48 : 44;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Summary | Total: ${reportData.summary.total} | Critical: ${reportData.summary.critical} | High: ${reportData.summary.high} | Medium: ${reportData.summary.medium} | Low: ${reportData.summary.low} | Resolved: ${reportData.summary.resolved}`,
        14,
        summaryY
      );

      // Table
      const tableColumn = [
        'Incident #', 'Date', 'Type', 'Severity', 'Status', 'Industry', 'Location'
      ];
      
      const tableRows = reportData.reports.map(incident => [
        incident.incident_number || incident.incidentNumber || incident.id || 'N/A',
        formatDate(incident.date_occurred || incident.date || incident.created_at),
        (incident.incident_type || incident.incidentType || incident.type || '').replace(/_/g, ' '),
        (incident.severity || '').toUpperCase(),
        (incident.status || '').replace('_', ' ').toUpperCase(),
        incident.industry || incident.industryName || incident.industry_id || 'N/A',
        incident.location || 'N/A'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: summaryY + 8,
        theme: 'striped',
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: summaryY + 8 },
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 18 },
          4: { cellWidth: 22 },
          5: { cellWidth: 22 },
          6: { cellWidth: 'auto' }
        }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 8,
          { align: 'center' }
        );
      }

      const fileName = `incident-report-${dayjs().format('YYYY-MM-DD-HHmm')}.pdf`;
      doc.save(fileName);
      
      message.success('Report exported as PDF');
    } catch (error) {
      console.error('PDF export failed:', error);
      message.error('Failed to export PDF');
    } finally {
      setExportLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  const exportToPrint = () => {
    if (!reportData?.reports?.length) {
      message.warning('No data to print');
      return;
    }

    setExportLoading(prev => ({ ...prev, print: true }));
    
    try {
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        message.error('Please allow pop-ups for printing');
        return;
      }

      const tableRows = reportData.reports.map(incident => `
        <tr>
          <td>${incident.incident_number || incident.incidentNumber || incident.id || 'N/A'}</td>
          <td>${formatDate(incident.date_occurred || incident.date || incident.created_at)}</td>
          <td>${(incident.incident_type || incident.incidentType || incident.type || '').replace(/_/g, ' ')}</td>
          <td><span class="severity-${incident.severity}">${(incident.severity || '').toUpperCase()}</span></td>
          <td><span class="status-${incident.status}">${(incident.status || '').replace('_', ' ').toUpperCase()}</span></td>
          <td>${incident.industry || incident.industryName || incident.industry_id || 'N/A'}</td>
          <td>${incident.location || 'N/A'}</td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Incident Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; border-bottom: 2px solid #1890ff; padding-bottom: 10px; }
              .summary { display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
              .summary-item { 
                background: #f5f5f5; 
                padding: 10px 20px; 
                border-radius: 4px;
                border-left: 4px solid #1890ff;
              }
              .summary-item .label { font-size: 12px; color: #666; }
              .summary-item .value { font-size: 18px; font-weight: bold; }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
                font-size: 12px;
              }
              th { 
                background: #1890ff; 
                color: white; 
                padding: 10px; 
                text-align: left;
                font-weight: bold;
              }
              td { 
                padding: 8px 10px; 
                border-bottom: 1px solid #e8e8e8;
              }
              tr:nth-child(even) { background: #fafafa; }
              .severity-critical { color: #f5222d; font-weight: bold; }
              .severity-high { color: #fa541c; font-weight: bold; }
              .severity-medium { color: #faad14; font-weight: bold; }
              .severity-low { color: #52c41a; font-weight: bold; }
              .status-reported { color: #1890ff; }
              .status-resolved { color: #52c41a; font-weight: bold; }
              .status-investigating { color: #722ed1; }
              .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
              .filters { 
                background: #f5f5f5; 
                padding: 10px; 
                border-radius: 4px; 
                margin: 10px 0;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h1>📋 Incident Report</h1>
            <div style="color: #666; font-size: 12px;">
              Generated: ${dayjs().format('YYYY-MM-DD HH:mm')} | Records: ${reportData.reports.length}
            </div>
            <div class="filters">
              <strong>Filters:</strong> ${buildFilterSummary(reportData.filters)}
            </div>
            <div class="summary">
              <div class="summary-item">
                <div class="label">Total</div>
                <div class="value">${reportData.summary.total}</div>
              </div>
              <div class="summary-item" style="border-left-color: #f5222d;">
                <div class="label">Critical</div>
                <div class="value" style="color: #f5222d;">${reportData.summary.critical}</div>
              </div>
              <div class="summary-item" style="border-left-color: #fa541c;">
                <div class="label">High</div>
                <div class="value" style="color: #fa541c;">${reportData.summary.high}</div>
              </div>
              <div class="summary-item" style="border-left-color: #faad14;">
                <div class="label">Medium</div>
                <div class="value" style="color: #faad14;">${reportData.summary.medium}</div>
              </div>
              <div class="summary-item" style="border-left-color: #52c41a;">
                <div class="label">Low</div>
                <div class="value" style="color: #52c41a;">${reportData.summary.low}</div>
              </div>
              <div class="summary-item" style="border-left-color: #1890ff;">
                <div class="label">Resolved</div>
                <div class="value" style="color: #1890ff;">${reportData.summary.resolved}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Incident #</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Industry</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="footer">
              Generated by SafetyPro Platform | ${dayjs().format('YYYY-MM-DD HH:mm')}
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);
      
      message.success('Print preview opened');
    } catch (error) {
      console.error('Print failed:', error);
      message.error('Failed to print');
    } finally {
      setExportLoading(prev => ({ ...prev, print: false }));
    }
  };

  // ==================== HELPER FUNCTIONS ====================

  const buildFilterSummary = (filters) => {
    if (!filters) return 'No filters applied';
    const parts = [];
    if (filters.dateRange) {
      parts.push(`Date: ${filters.dateRange[0].format('YYYY-MM-DD')} to ${filters.dateRange[1].format('YYYY-MM-DD')}`);
    }
    if (filters.severity?.length) {
      parts.push(`Severity: ${filters.severity.join(', ')}`);
    }
    if (filters.status?.length) {
      parts.push(`Status: ${filters.status.join(', ')}`);
    }
    if (filters.industry?.length) {
      parts.push(`Industry: ${filters.industry.join(', ')}`);
    }
    if (filters.incidentType?.length) {
      parts.push(`Types: ${filters.incidentType.join(', ')}`);
    }
    return parts.length ? parts.join(' | ') : 'No filters applied';
  };

  const getSeverityColor = (severity) => {
    return SEVERITY_COLORS[severity?.toLowerCase()] || '#1890ff';
  };

  const getStatusColor = (status) => {
    return STATUS_COLORS[status?.toLowerCase()] || '#d9d9d9';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return dayjs(dateString).format('YYYY-MM-DD HH:mm');
    } catch {
      return dateString;
    }
  };

  const getIndustryIcon = (industryId) => {
    const ind = INDUSTRIES.find(i => i.id === industryId || i.name === industryId);
    return ind?.icon || '🏢';
  };

  // ==================== TABLE COLUMNS ====================

  const columns = [
    {
      title: 'Incident #',
      dataIndex: 'incident_number',
      key: 'incident_number',
      render: (text, record) => (
        <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => {
          setSelectedIncident(record);
          setPreviewDrawerVisible(true);
        }}>
          {text || record.incidentNumber || record.id || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date_occurred',
      key: 'date_occurred',
      render: (text, record) => formatDate(text || record.date || record.created_at),
      sorter: (a, b) => {
        const dateA = dayjs(a.date_occurred || a.date || a.created_at);
        const dateB = dayjs(b.date_occurred || b.date || b.created_at);
        return dateA - dateB;
      }
    },
    {
      title: 'Type',
      dataIndex: 'incident_type',
      key: 'incident_type',
      render: (text, record) => {
        const type = text || record.incidentType || record.type;
        return type ? type.replace(/_/g, ' ') : 'N/A';
      },
      ellipsis: true,
      filters: INCIDENT_TYPES.slice(0, 10).map(type => ({ text: type, value: type })),
      onFilter: (value, record) => {
        const type = record.incident_type || record.incidentType || record.type || '';
        return type.replace(/_/g, ' ') === value;
      }
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity?.toUpperCase() || 'N/A'}
        </Tag>
      ),
      filters: [
        { text: 'Critical', value: 'critical' },
        { text: 'High', value: 'high' },
        { text: 'Medium', value: 'medium' },
        { text: 'Low', value: 'low' }
      ],
      onFilter: (value, record) => record.severity === value
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.replace('_', ' ').toUpperCase() || 'N/A'}
        </Tag>
      ),
      filters: [
        { text: 'Reported', value: 'reported' },
        { text: 'Under Review', value: 'under_review' },
        { text: 'Investigating', value: 'investigating' },
        { text: 'Resolved', value: 'resolved' },
        { text: 'Closed', value: 'closed' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      render: (text, record) => {
        const industry = text || record.industryName || record.industry_id || 'N/A';
        return (
          <Space>
            <span>{getIndustryIcon(record.industry_id)}</span>
            {industry}
          </Space>
        );
      }
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (text) => text || 'N/A',
      ellipsis: true
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="link" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedIncident(record);
                setPreviewDrawerVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // ==================== RENDER FUNCTIONS ====================

  const renderFilterForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleGenerateReport}
      initialValues={{ reportType: 'incidents' }}
    >
      {/* Report Type */}
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="reportType"
            label="Report Type"
          >
            <Select onChange={setReportType}>
              <Option value="incidents">
                <AlertOutlined /> Incident Reports
              </Option>
              <Option value="documents" disabled>
                <FileTextOutlined /> Document Reports (Coming Soon)
              </Option>
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={8}>
          <Form.Item
            name="dateRange"
            label={
              <Space>
                <CalendarOutlined />
                Date Range
              </Space>
            }
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        
        <Col span={8}>
          <Form.Item
            name="industry"
            label={
              <Space>
                <BuildOutlined />
                Industry
              </Space>
            }
          >
            <Select 
              mode="multiple" 
              placeholder="All Industries" 
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {INDUSTRIES.map(industry => (
                <Option key={industry.id} value={industry.id}>
                  {industry.icon} {industry.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Incident Filters */}
      {reportType === 'incidents' && (
        <>
          <Collapse ghost>
            <Panel header="Advanced Filters" key="advanced">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="severity"
                    label="Severity Level"
                  >
                    <Checkbox.Group style={{ width: '100%' }}>
                      <Row>
                        <Col span={12}><Checkbox value="critical" style={{ color: '#f5222d' }}>Critical</Checkbox></Col>
                        <Col span={12}><Checkbox value="high" style={{ color: '#fa541c' }}>High</Checkbox></Col>
                        <Col span={12}><Checkbox value="medium" style={{ color: '#faad14' }}>Medium</Checkbox></Col>
                        <Col span={12}><Checkbox value="low" style={{ color: '#52c41a' }}>Low</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="status"
                    label="Incident Status"
                  >
                    <Checkbox.Group style={{ width: '100%' }}>
                      <Row>
                        <Col span={12}><Checkbox value="reported">Reported</Checkbox></Col>
                        <Col span={12}><Checkbox value="under_review">Under Review</Checkbox></Col>
                        <Col span={12}><Checkbox value="investigating">Investigating</Checkbox></Col>
                        <Col span={12}><Checkbox value="resolved">Resolved</Checkbox></Col>
                        <Col span={12}><Checkbox value="closed">Closed</Checkbox></Col>
                        <Col span={12}><Checkbox value="rejected">Rejected</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="incidentType"
                    label="Incident Type"
                  >
                    <Select 
                      mode="multiple" 
                      placeholder="All Types"
                      style={{ width: '100%' }}
                      dropdownMatchSelectWidth={false}
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {INCIDENT_TYPES.map(type => (
                        <Option key={type} value={type}>{type}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    name="location"
                    label="Location"
                  >
                    <Input placeholder="Filter by location" allowClear />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="department"
                    label="Department"
                  >
                    <Input placeholder="Filter by department" allowClear />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="investigator"
                    label="Investigator"
                  >
                    <Input placeholder="Filter by investigator" allowClear />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="regulatory"
                    label="Regulatory Requirement"
                  >
                    <Select mode="multiple" placeholder="All Regulations" allowClear>
                      {REGULATORY_BODIES.map(body => (
                        <Option key={body.id} value={body.id}>
                          {body.icon} {body.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="injured_persons_min"
                    label="Min Injured Persons"
                  >
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Min" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="injured_persons_max"
                    label="Max Injured Persons"
                  >
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Max" />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>
          </Collapse>

          {/* Action Buttons */}
          <Form.Item>
            <Space size="middle">
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<FilterOutlined />} 
                size="large"
                loading={loading}
                style={{ minWidth: '200px' }}
              >
                {loading ? 'Generating...' : 'Generate Custom Report'}
              </Button>
              <Button 
                onClick={() => {
                  form.resetFields();
                  setReportData(null);
                }}
                icon={<ClearOutlined />}
                size="large"
              >
                Clear All
              </Button>
              <Popover
                content={
                  <div style={{ maxWidth: '300px' }}>
                    <Form.Item name="templateName" label="Template Name">
                      <Input placeholder="My Report Template" />
                    </Form.Item>
                    <Button 
                      type="primary" 
                      size="small"
                      onClick={() => {
                        const values = form.getFieldsValue();
                        if (!values.templateName) {
                          message.warning('Please enter a template name');
                          return;
                        }
                        saveReportTemplate(values);
                      }}
                    >
                      <SaveOutlined /> Save Template
                    </Button>
                  </div>
                }
                trigger="click"
              >
                <Button icon={<SaveOutlined />} size="large">
                  Save Template
                </Button>
              </Popover>
              <Button 
                icon={<FileTextOutlined />} 
                size="large"
                onClick={() => setShowSavedReports(!showSavedReports)}
              >
                Saved Templates ({savedReports.length})
              </Button>
            </Space>
          </Form.Item>
        </>
      )}
    </Form>
  );

  const renderSavedReports = () => {
    if (!showSavedReports || savedReports.length === 0) return null;

    return (
      <Card size="small" style={{ marginTop: 16, background: '#fafafa' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {savedReports.map(template => (
            <Tag
              key={template.id}
              closable
              onClose={() => deleteSavedReport(template.id)}
              style={{ 
                padding: '6px 12px', 
                cursor: 'pointer',
                fontSize: '13px'
              }}
              onClick={() => loadReportTemplate(template)}
            >
              <SaveOutlined /> {template.name}
              <span style={{ fontSize: '10px', color: '#999', marginLeft: '4px' }}>
                ({template.created})
              </span>
            </Tag>
          ))}
        </div>
      </Card>
    );
  };

  const renderQuickTemplates = () => (
    <Row gutter={[16, 16]}>
      {quickTemplates.map(template => (
        <Col xs={24} sm={12} lg={8} key={template.id}>
          <Card 
            hoverable 
            onClick={template.filter}
            style={{ cursor: 'pointer', height: '100%' }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>
                {template.icon}
              </div>
              <div>
                <h4 style={{ margin: 0 }}>{template.name}</h4>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {template.description}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderReportResults = () => {
    if (!reportData) return null;

    return (
      <div style={{ marginTop: '32px' }}>
        <Divider orientation="left">
          <Space>
            <Tag color="green" style={{ padding: '4px 12px', fontSize: '14px' }}>
              Report Results
            </Tag>
            {reportData.isFallback && (
              <Tag color="orange">⚠️ Fallback Data</Tag>
            )}
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Generated: {reportData.generatedAt}
            </Text>
          </Space>
        </Divider>
        
        <Alert
          message={
            <Space>
              <span>Report Generated Successfully</span>
              <Badge count={reportData.reports?.length || 0} showZero />
            </Space>
          }
          description={
            reportData.isFallback 
              ? 'Showing all incidents (filters not applied due to backend limitations)'
              : `Found ${reportData.reports?.length || 0} records matching your criteria.`
          }
          type={reportData.isFallback ? 'warning' : 'success'}
          showIcon
          style={{ marginBottom: '24px' }}
        />

        {/* Summary Statistics */}
        {reportData.summary && (
          <Row gutter={[12, 12]} style={{ marginBottom: '24px' }}>
            <Col xs={12} sm={6} md={4}>
              <Card size="small">
                <Statistic 
                  title="Total" 
                  value={reportData.summary.total || 0} 
                  valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card size="small">
                <Statistic 
                  title="Critical" 
                  value={reportData.summary.critical || 0} 
                  valueStyle={{ color: '#f5222d', fontSize: '20px' }}
                  prefix={<AlertOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card size="small">
                <Statistic 
                  title="High" 
                  value={reportData.summary.high || 0} 
                  valueStyle={{ color: '#fa541c', fontSize: '20px' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card size="small">
                <Statistic 
                  title="Medium" 
                  value={reportData.summary.medium || 0} 
                  valueStyle={{ color: '#faad14', fontSize: '20px' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card size="small">
                <Statistic 
                  title="Low" 
                  value={reportData.summary.low || 0} 
                  valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Card size="small">
                <Statistic 
                  title="Resolved" 
                  value={reportData.summary.resolved || 0} 
                  valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Export and View Controls */}
        {reportData.reports?.length > 0 && (
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Text strong>Export:</Text>
              <Button 
                icon={<FileExcelOutlined />} 
                onClick={exportToExcel}
                loading={exportLoading.excel}
                type="primary"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Excel
              </Button>
              <Button 
                icon={<FilePdfOutlined />} 
                onClick={exportToPDF}
                loading={exportLoading.pdf}
                type="primary"
                style={{ backgroundColor: '#f5222d', borderColor: '#f5222d' }}
              >
                PDF
              </Button>
              <Button 
                icon={<PrinterOutlined />} 
                onClick={exportToPrint}
                loading={exportLoading.print}
              >
                Print
              </Button>
            </Space>
            <Space>
              <Button 
                icon={<ShareAltOutlined />} 
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  message.success('Report link copied to clipboard');
                }}
              >
                Share
              </Button>
            </Space>
          </div>
        )}

        {/* Report Table */}
        {reportData.reports?.length > 0 ? (
          <Table 
            dataSource={reportData.reports} 
            columns={columns} 
            rowKey={(record) => record.id || record.incident_id || Math.random().toString()}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} items`
            }}
            bordered
            size="middle"
            scroll={{ x: 1200 }}
            rowClassName={(record) => {
              if (record.severity === 'critical') return 'critical-row';
              if (record.severity === 'high') return 'high-row';
              return '';
            }}
          />
        ) : (
          <Alert
            message="No Data Found"
            description="No records match your filter criteria. Try adjusting your filters or using one of the quick report templates."
            type="info"
            showIcon
          />
        )}
      </div>
    );
  };

  const renderIncidentPreviewDrawer = () => (
    <Drawer
      title={
        <Space>
          <FileTextOutlined />
          Incident Details
          {selectedIncident && (
            <Tag color="blue">{selectedIncident.incident_number || `#${selectedIncident.id}`}</Tag>
          )}
        </Space>
      }
      placement="right"
      width={600}
      open={previewDrawerVisible}
      onClose={() => {
        setPreviewDrawerVisible(false);
        setSelectedIncident(null);
      }}
      extra={
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {
              setPreviewDrawerVisible(false);
              // Navigate to edit or show edit modal
            }}
          >
            Edit
          </Button>
        </Space>
      }
    >
      {selectedIncident && (
        <div>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Incident #">
              <strong>{selectedIncident.incident_number || selectedIncident.incidentNumber || `INC-${selectedIncident.id}`}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Title">
              {selectedIncident.title}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}>
                {selectedIncident.description}
              </Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag>{selectedIncident.incident_type?.replace(/_/g, ' ')}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Severity">
              <Tag color={getSeverityColor(selectedIncident.severity)}>
                {selectedIncident.severity?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedIncident.status)}>
                {selectedIncident.status?.replace('_', ' ').toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Industry">
              <Space>
                <span>{getIndustryIcon(selectedIncident.industry_id)}</span>
                {selectedIncident.industry || selectedIncident.industryName || selectedIncident.industry_id}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedIncident.location || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Department">
              {selectedIncident.department || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Date Occurred">
              {formatDate(selectedIncident.date_occurred || selectedIncident.date || selectedIncident.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Reported By">
              {selectedIncident.reported_by_name || selectedIncident.reported_by || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Investigator">
              {selectedIncident.investigator || 'Not assigned'}
            </Descriptions.Item>
            <Descriptions.Item label="Injured Persons">
              {selectedIncident.injured_persons || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Witnesses">
              {selectedIncident.witnesses || 0}
            </Descriptions.Item>
          </Descriptions>

          {selectedIncident.custom_data && (
            <>
              <Divider orientation="left">Additional Data</Divider>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                maxHeight: '200px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {JSON.stringify(selectedIncident.custom_data, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </Drawer>
  );

  // ==================== MAIN RENDER ====================

  return (
    <>
      <Card 
        title={
          <Space>
            <BarChartOutlined style={{ color: '#722ed1', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Custom Report Builder</span>
            {reportData && (
              <Badge 
                count={reportData.reports?.length || 0} 
                style={{ backgroundColor: '#52c41a' }}
              />
            )}
          </Space>
        }
        style={{ 
          marginTop: 24, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => {
              if (form.getFieldsValue().dateRange) {
                handleGenerateReport(form.getFieldsValue());
              }
            }}
          >
            Refresh Report
          </Button>
        }
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
        >
          <TabPane 
            tab={
              <span>
                <FilterOutlined />
                Report Filters
              </span>
            } 
            key="filters"
          >
            {renderFilterForm()}
            {renderSavedReports()}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <DashboardOutlined />
                Quick Reports
              </span>
            } 
            key="quick"
          >
            <Alert
              message="Quick Report Templates"
              description="Click any template to instantly generate a report with predefined filters."
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
            />
            {renderQuickTemplates()}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <ExportOutlined />
                Export History
              </span>
            } 
            key="history"
          >
            <Alert
              message="Export History"
              description="Your recent report exports will appear here. (Coming Soon)"
              type="info"
              showIcon
            />
          </TabPane>
        </Tabs>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, fontSize: '14px', color: '#666' }}>
              Generating your custom report...
            </div>
            <Progress 
              type="circle" 
              percent={100} 
              width={80}
              status="active"
              style={{ marginTop: '24px' }}
            />
          </div>
        )}

        {/* Report Results */}
        {reportData && !loading && renderReportResults()}
      </Card>

      {/* Incident Preview Drawer */}
      {renderIncidentPreviewDrawer()}

      {/* Custom Styles */}
      <style jsx>{`
        .critical-row {
          background-color: #fff1f0 !important;
        }
        .high-row {
          background-color: #fff7e6 !important;
        }
        .critical-row:hover {
          background-color: #ffccc7 !important;
        }
        .high-row:hover {
          background-color: #ffe7ba !important;
        }
      `}</style>
    </>
  );
}