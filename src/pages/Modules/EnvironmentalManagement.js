// src/pages/Modules/EnvironmentalManagement.js

import React, { useState, useEffect } from 'react';
import {
  Row, Col, Table, Tag, Progress, Alert, Button, Modal, Form, Input, Select, Space, message, Spin, Descriptions, DatePicker, Dropdown, Switch, InputNumber, Drawer
} from 'antd';
import {
  EnvironmentOutlined, CloudOutlined, WarningOutlined, RiseOutlined, SafetyCertificateOutlined, PlusOutlined, DownloadOutlined, DashboardOutlined, RobotOutlined, ThunderboltOutlined, ReloadOutlined, CheckCircleOutlined, ExclamationCircleOutlined, TrophyOutlined, LineChartOutlined, GlobalOutlined, FireOutlined, FilePdfOutlined, BellOutlined, MenuOutlined, ExperimentOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useHistory, useLocation } from 'react-router-dom';

// Import services
import environmentalService from '../../services/environmentalService';
import useEnvironmentalData from '../../hooks/useEnvironmentalData';
import aiService from '../../services/aiService';
import AIServiceTab from '../../components/AI/AIServiceTab';
import AdvancedEnvironmentalDashboard from '../../components/environmental/AdvancedEnvironmentalDashboard';
import EnvironmentalOverview from '../../components/environmental/EnvironmentalOverview';
import HoverNav, { NavList } from '../../components/nav/HoverNav';
import './environmentalShell.css';
import EnvironmentalDocumentGenerator from '../../components/environmental/EnvironmentalDocumentGenerator';

// Import the enhanced components

const { Option } = Select;
const { TextArea } = Input;

// Color palette for charts

// ✅ Valid sensor types for air quality
const VALID_SENSOR_TYPES = [
  'air_quality',
  'temperature',
  'humidity',
  'gas',
  'particulate',
  'co2',
  'voc',
  'pm25',
  'pm10'
];

// ✅ Valid incident types
const INCIDENT_TYPES = [
  'Spill',
  'Emission',
  'Waste',
  'Chemical Release',
  'Air Quality',
  'Water Quality',
  'Noise',
  'Other'
];

// ✅ Valid water sample types
const WATER_SAMPLE_TYPES = [
  'water',
  'wastewater',
  'groundwater',
  'surface_water',
  'drinking_water',
  'rainwater',
  'sea_water'
];

// Sections shown as header dropdowns (side drawer on phones)
const ENV_GROUPS = [
  { key: 'overview', label: 'Overview', icon: <DashboardOutlined /> },
  {
    key: 'e-monitor', label: 'Monitor', icon: <GlobalOutlined />, items: [
      { key: 'live-monitoring', label: 'Live map', hint: 'Sites, detections and cameras', icon: <GlobalOutlined /> },
      { key: 'air-quality', label: 'Air quality', hint: 'Sensors and readings', icon: <CloudOutlined /> },
      { key: 'water-quality', label: 'Water quality', hint: 'Samples and limits', icon: <ExperimentOutlined /> },
      { key: 'weather', label: 'Weather', hint: 'Area weather, not site readings', icon: <ThunderboltOutlined /> },
      { key: 'thermal', label: 'Heat and thermal', hint: 'Temperature and comfort', icon: <FireOutlined /> }
    ]
  },
  {
    key: 'e-respond', label: 'Respond', icon: <WarningOutlined />, items: [
      { key: 'incidents', label: 'Incidents', hint: 'Report and follow up', icon: <WarningOutlined /> },
      { key: 'alerts', label: 'Alerts', hint: 'Open alerts from your records', icon: <BellOutlined /> }
    ]
  },
  {
    key: 'e-perform', label: 'Performance', icon: <RiseOutlined />, items: [
      { key: 'goals', label: 'Sustainability goals', hint: 'Targets and progress', icon: <TrophyOutlined /> },
      { key: 'impact', label: 'Impact scorecard', hint: 'Scores by category', icon: <LineChartOutlined /> },
      { key: 'compliance', label: 'Compliance', hint: 'Deadlines and obligations', icon: <SafetyCertificateOutlined /> }
    ]
  },
  {
    key: 'e-analyse', label: 'Analyse', icon: <LineChartOutlined />, items: [
      { key: 'intelligence', label: 'Intelligence', hint: 'Indicators from your records', icon: <DashboardOutlined /> },
      { key: 'analytics', label: 'Forecasts', hint: 'Estimates to check', icon: <LineChartOutlined /> },
      { key: 'ai-services', label: 'AI services', hint: 'Analysis tools', icon: <RobotOutlined /> }
    ]
  },
  {
    key: 'e-report', label: 'Reports', icon: <FilePdfOutlined />, items: [
      { key: 'report-iso14001', label: 'ISO 14001 report', hint: 'Performance and compliance', icon: <FilePdfOutlined /> },
      { key: 'report-safety', label: 'Safety inspection', hint: 'Inspection report', icon: <FilePdfOutlined /> },
      { key: 'report-eia', label: 'Impact assessment', hint: 'Environmental impact (EIA)', icon: <FilePdfOutlined /> }
    ]
  }
];
const ENV_KEYS = ENV_GROUPS.flatMap((g) => (g.items ? g.items.map((i) => i.key) : [g.key]));
const ENV_OLD = { sustainability: 'goals', advanced: 'intelligence' };
const REPORT_KIND = { 'report-iso14001': 'iso14001', 'report-safety': 'safety', 'report-eia': 'eia' };
const envTab = (search) => {
  const raw = new URLSearchParams(search).get('tab') || 'overview';
  const t = ENV_OLD[raw] || raw;
  return ENV_KEYS.includes(t) ? t : 'overview';
};

function EnvironmentalManagement() {
  const history = useHistory();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const {
    sensors,
    waterSamples,
    environmentalIncidents,
    sustainabilityGoals,
    complianceReports,
    loading,
    error,
    statistics,
    refetch
  } = useEnvironmentalData();

  const [modalVisible, setModalVisible] = useState(false);
  const [waterSampleModalVisible, setWaterSampleModalVisible] = useState(false);
  const [incidentModalVisible, setIncidentModalVisible] = useState(false);
  const [complianceModalVisible, setComplianceModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const activeTab = envTab(location.search);
  const setActiveTab = (key) => { setMenuOpen(false); if (key !== activeTab) history.push(key === 'overview' ? '/environmental-management' : `/environmental-management?tab=${key}`); };
  const [submitting, setSubmitting] = useState(false);
  const [goalDetailVisible, setGoalDetailVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeRange, setTimeRange] = useState('7d');
  // Show error alert if any
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        refetch();
        message.success('Data refreshed');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [refetch]);

  // ✅ FIXED: Handle Add Sensor with correct field mapping
  const handleAddSensor = async (values) => {
    setSubmitting(true);
    try {
      const sensorData = {
        name: values.name,
        device_id: values.device_id,
        sensor_type: values.sensor_type,
        location: values.location || '',
        status: values.status || 'active',
        min_range: values.min_range || 0,
        max_range: values.max_range || 500,
        unit: values.unit || 'AQI',
        compliance_score: values.compliance_score || 100
      };

      const response = await environmentalService.createSensor(sensorData);
      if (response && response.success) {
        message.success('Sensor added successfully');
        setModalVisible(false);
        refetch();
        setDataVersion((v) => v + 1);
      } else {
        message.error(response?.error || 'Failed to add sensor');
      }
    } catch (err) {
      console.error('Add sensor error:', err);
      message.error('Failed to add sensor: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ FIXED: Handle Add Water Sample with correct field mapping
  const handleAddWaterSample = async (values) => {
    setSubmitting(true);
    try {
      const sampleData = {
        // Required fields
        sample_type: values.sample_type || 'water',
        sample_date: values.collection_time?.toISOString?.() || new Date().toISOString(),
        location: values.location,
        site_name: values.site_name,
        ph_level: values.ph_level,
        
        // Optional fields
        site_id: values.site_id || '',
        temperature: values.temperature,
        turbidity: values.turbidity,
        tds: values.tds,
        dissolved_oxygen: values.dissolved_oxygen,
        coliform_count: values.coliform_count,
        compliant: values.compliant !== undefined ? values.compliant : true,
        violations: values.violations || '',
        notes: values.notes || '',
        collection_time: values.collection_time?.toISOString?.() || new Date().toISOString()
      };

      // Validate required fields
      if (!sampleData.location) {
        message.error('Location is required');
        return;
      }
      if (!sampleData.site_name) {
        message.error('Site name is required');
        return;
      }
      if (sampleData.ph_level === undefined || sampleData.ph_level === null) {
        message.error('pH level is required');
        return;
      }

      const response = await environmentalService.createWaterSample(sampleData);
      if (response && response.success) {
        message.success('Water sample recorded successfully');
        setWaterSampleModalVisible(false);
        refetch();
        setDataVersion((v) => v + 1);
      } else {
        message.error(response?.error || 'Failed to add water sample');
      }
    } catch (err) {
      console.error('Add water sample error:', err);
      message.error('Failed to add water sample: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ FIXED: Handle Report Incident with correct field mapping
  const handleReportIncident = async (values) => {
    setSubmitting(true);
    try {
      const incidentData = {
        title: values.title,
        type: values.type || 'Other',
        severity: values.severity,
        status: values.status || 'reported',
        location: values.location,
        description: values.description || '',
        impact: values.impact || '',
        action_required: values.action_required || '',
        department: values.department || '',
        cost_estimate: values.cost_estimate || 0,
        reported_by: values.reported_by || 'System User',
        reported_date: new Date().toISOString()
      };

      // Validate required fields
      if (!incidentData.title) {
        message.error('Incident title is required');
        return;
      }
      if (!incidentData.location) {
        message.error('Location is required');
        return;
      }
      if (!incidentData.severity) {
        message.error('Severity is required');
        return;
      }

      const response = await environmentalService.reportIncident(incidentData);
      if (response && response.success) {
        message.success('Environmental incident reported successfully');
        setIncidentModalVisible(false);
        refetch();
        setDataVersion((v) => v + 1);
      } else {
        message.error(response?.error || 'Failed to report incident');
      }
    } catch (err) {
      console.error('Report incident error:', err);
      message.error('Failed to report incident: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportData = async () => {
    try {
      const filters = {
        timeframe: timeRange,
        include_sensors: true,
        include_samples: true,
        include_incidents: true
      };
      
      const blob = await environmentalService.exportEnvironmentalData('csv', filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = environmentalService.generateExportFilename('environmental', 'csv');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('Data exported successfully');
    } catch (err) {
      let msg = err.message || 'Unknown error';
      const data = err.response?.data;
      try {
        if (data instanceof Blob) msg = JSON.parse(await data.text()).error || msg;
        else if (data?.error) msg = data.error;
      } catch (e) { /* keep the generic message */ }
      message.error('Export failed: ' + msg, 6);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      online: 'green',
      maintenance: 'orange',
      inactive: 'red',
      offline: 'gray',
      compliant: 'green',
      warning: 'orange',
      non_compliant: 'red',
      in_progress: 'blue',
      under_investigation: 'orange',
      resolved: 'green',
      submitted: 'blue',
      approved: 'green',
      under_review: 'orange',
      reported: 'blue',
      investigating: 'orange',
      closed: 'default'
    };
    return colors[status?.toLowerCase()] || 'blue';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'red',
      high: 'volcano', 
      medium: 'orange',
      low: 'green'
    };
    return colors[severity?.toLowerCase()] || 'blue';
  };

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { color: '#52c41a', level: 'Good', icon: <CheckCircleOutlined /> };
    if (aqi <= 100) return { color: '#faad14', level: 'Moderate', icon: <ExclamationCircleOutlined /> };
    if (aqi <= 150) return { color: '#ff4d4f', level: 'Unhealthy', icon: <WarningOutlined /> };
    return { color: '#cf1322', level: 'Hazardous', icon: <FireOutlined /> };
  };

  const getGoalProgressColor = (progress) => {
    if (progress >= 80) return '#52c41a';
    if (progress >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const handleViewGoalDetails = (goal) => {
    setSelectedGoal(goal);
    setGoalDetailVisible(true);
  };

  // Table columns



  // Calculate overall sustainability progress
  const refreshAll = () => { refetch(); setDataVersion((v) => v + 1); setLastUpdated(new Date()); };
  const activeGroup = ENV_GROUPS.find((g) => g.key === activeTab || (g.items || []).some((i) => i.key === activeTab));
  const activeItem = (activeGroup?.items || []).find((i) => i.key === activeTab);

  if (loading && sensors.length === 0 && waterSamples.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading environmental data..." />
      </div>
    );
  }

  return (
    <div className="ev">
      <div className="ev-head">
        <div className="ev-line">
          <button type="button" className="ev-btn ev-burger" aria-label="Open environmental menu" onClick={() => setMenuOpen(true)}><MenuOutlined /></button>
          <div className="ev-title">
            <h1>{activeItem?.label && activeTab !== 'overview' ? activeItem.label : 'Environmental management'}</h1>
            <span>{activeTab === 'overview' ? 'Figures come from your own records' : `Environmental management / ${activeGroup?.label || ''}`}</span>
          </div>
          <div className="ev-tools">
            <button type="button" className="ev-btn" onClick={refreshAll} disabled={loading} aria-label="Refresh" title={`Updated ${lastUpdated.toLocaleTimeString()}`}><ReloadOutlined spin={loading} /><span className="t">Refresh</span></button>
            <button type="button" className="ev-btn" onClick={handleExportData} disabled={loading} aria-label="Export data"><DownloadOutlined /><span className="t">Export</span></button>
            <Dropdown
              trigger={['click', 'hover']}
              placement="bottomRight"
              menu={{
                items: [
                  { key: 's', icon: <CloudOutlined />, label: 'Add sensor', onClick: () => setModalVisible(true) },
                  { key: 'w', icon: <ExperimentOutlined />, label: 'Add water sample', onClick: () => setWaterSampleModalVisible(true) },
                  { key: 'i', icon: <WarningOutlined />, label: 'Report incident', onClick: () => setIncidentModalVisible(true) }
                ]
              }}
            >
              <button type="button" className="ev-btn main"><PlusOutlined /><span>Add</span></button>
            </Dropdown>
          </div>
        </div>
        <div className="ev-nav"><HoverNav groups={ENV_GROUPS} active={activeTab} onSelect={(g) => setActiveTab(g.key)} label="Environmental sections" /></div>
      </div>
      <Drawer title="Environmental" placement="left" open={menuOpen} onClose={() => setMenuOpen(false)} width={300} rootClassName="hn-drawer">
        <NavList groups={ENV_GROUPS} active={activeTab} onSelect={(g) => setActiveTab(g.key)} label="Environmental sections" />
      </Drawer>

      {activeTab === 'overview' && (
        <EnvironmentalOverview sensors={sensors} waterSamples={waterSamples} incidents={environmentalIncidents} goals={sustainabilityGoals}
          onGo={setActiveTab} onGoal={handleViewGoalDetails} />
      )}
      {activeTab === 'ai-services' && (
        <div className="ev-section">
          <AIServiceTab
            environmentalData={{ sensors, waterSamples, incidents: environmentalIncidents, goals: sustainabilityGoals, reports: complianceReports }}
            aiServices={aiService}
          />
        </div>
      )}
      {REPORT_KIND[activeTab] && (
        <div className="ev-section"><EnvironmentalDocumentGenerator key={activeTab} kinds={[REPORT_KIND[activeTab]]} onGenerated={() => refetch()} /></div>
      )}
      {!['overview', 'ai-services'].includes(activeTab) && !REPORT_KIND[activeTab] && (
        <div className="ev-section"><AdvancedEnvironmentalDashboard key={dataVersion} section={activeTab} /></div>
      )}

      {/* Goal Details Modal */}
      <Modal
        title={selectedGoal?.goal || 'Goal Details'}
        open={goalDetailVisible}
        onCancel={() => setGoalDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setGoalDetailVisible(false)}>
            Close
          </Button>
        ]}
        width={500}
      >
        {selectedGoal && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Description">{selectedGoal.target || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Current Progress">
                <Progress 
                  percent={selectedGoal.progress_percentage || selectedGoal.progress || 0}
                  strokeColor={getGoalProgressColor(selectedGoal.progress_percentage || selectedGoal.progress || 0)}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Current Value">
                {selectedGoal.current_value || 0} {selectedGoal.unit || '%'}
              </Descriptions.Item>
              <Descriptions.Item label="Target Value">
                {selectedGoal.target_value || 100} {selectedGoal.unit || '%'}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="blue">{selectedGoal.category || 'General'}</Tag>
              </Descriptions.Item>
              {selectedGoal.deadline && (
                <Descriptions.Item label="Deadline">
                  {moment(selectedGoal.deadline).format('MMMM DD, YYYY')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedGoal.status)}>
                  {selectedGoal.status?.toUpperCase() || 'ACTIVE'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* ✅ FIXED: Add Sensor Modal */}
      <Modal
        title="Add New Sensor"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={550}
        destroyOnClose
      >
        <Alert
          message="Sensor Information"
          description="Fill in the sensor details below. All fields marked with * are required."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form 
          layout="vertical" 
          onFinish={handleAddSensor}
          initialValues={{
            status: 'active',
            sensor_type: 'air_quality',
            min_range: 0,
            max_range: 500,
            unit: 'AQI',
            compliance_score: 100
          }}
        >
          <Form.Item
            name="name"
            label="Sensor Name *"
            rules={[{ required: true, message: 'Please enter sensor name' }]}
          >
            <Input placeholder="e.g., Main Building Sensor" />
          </Form.Item>

          <Form.Item
            name="device_id"
            label="Device ID *"
            rules={[
              { required: true, message: 'Please enter device ID' },
              { pattern: /^[a-zA-Z0-9\-_]+$/, message: 'Only letters, numbers, hyphens, and underscores allowed' }
            ]}
          >
            <Input placeholder="e.g., AQ-001" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location *"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input placeholder="e.g., Building A - Floor 3" />
          </Form.Item>

          <Form.Item
            name="sensor_type"
            label="Sensor Type *"
            rules={[{ required: true, message: 'Please select sensor type' }]}
            tooltip="Only air quality related sensor types are allowed"
          >
            <Select placeholder="Select sensor type">
              {VALID_SENSOR_TYPES.map(type => (
                <Option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="offline">Offline</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="min_range" label="Min Range">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_range" label="Max Range">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="unit" label="Unit">
            <Input placeholder="e.g., AQI, ppm, µg/m³" />
          </Form.Item>

          <Form.Item name="compliance_score" label="Compliance Score">
            <InputNumber 
              style={{ width: '100%' }} 
              min={0} 
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Add Sensor
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ✅ FIXED: Add Water Sample Modal */}
      <Modal
        title="Add Water Sample"
        open={waterSampleModalVisible}
        onCancel={() => setWaterSampleModalVisible(false)}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Alert
          message="Required Fields"
          description="Sample Type, Location, Site Name, pH Level, and Collection Time are required."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form 
          layout="vertical" 
          onFinish={handleAddWaterSample}
          initialValues={{
            compliant: true,
            sample_type: 'water',
            collection_time: moment()
          }}
        >
          <Form.Item
            name="sample_type"
            label="Sample Type *"
            rules={[{ required: true, message: 'Please select sample type' }]}
          >
            <Select placeholder="Select sample type">
              {WATER_SAMPLE_TYPES.map(type => (
                <Option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location *"
                rules={[{ required: true, message: 'Please enter location' }]}
              >
                <Input placeholder="e.g., Industrial Zone A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="site_name"
                label="Site Name *"
                rules={[{ required: true, message: 'Please enter site name' }]}
              >
                <Input placeholder="e.g., abigalistic" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ph_level"
                label="pH Level *"
                rules={[{ required: true, message: 'Please enter pH level' }]}
              >
                <InputNumber 
                  min={0} 
                  max={14} 
                  step={0.1} 
                  style={{ width: '100%' }}
                  placeholder="0.0 - 14.0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="collection_time"
                label="Collection Time *"
                rules={[{ required: true, message: 'Please select collection time' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD HH:mm:ss" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="temperature" label="Temperature (°C)">
                <InputNumber min={-10} max={50} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="turbidity" label="Turbidity (NTU)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tds" label="TDS (mg/L)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dissolved_oxygen" label="DO (mg/L)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="coliform_count" label="Coliform Count">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="compliant" label="Compliant" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="violations" label="Violations">
            <TextArea rows={2} placeholder="Any violations found" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} placeholder="Additional notes" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setWaterSampleModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Add Sample
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ✅ FIXED: Report Incident Modal */}
      <Modal
        title="Report Environmental Incident"
        open={incidentModalVisible}
        onCancel={() => setIncidentModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Alert
          message="Incident Report"
          description="Please provide details about the environmental incident. All fields marked with * are required."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form layout="vertical" onFinish={handleReportIncident} initialValues={{ severity: 'medium', status: 'reported' }}>
          <Form.Item
            name="title"
            label="Incident Title *"
            rules={[{ required: true, message: 'Please enter incident title' }]}
          >
            <Input placeholder="Enter incident title" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Incident Type *"
            rules={[{ required: true, message: 'Please select incident type' }]}
          >
            <Select placeholder="Select incident type">
              {INCIDENT_TYPES.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="location"
            label="Location *"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input placeholder="Enter incident location" />
          </Form.Item>

          <Form.Item
            name="severity"
            label="Severity *"
            rules={[{ required: true, message: 'Please select severity' }]}
          >
            <Select placeholder="Select severity">
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="critical">Critical</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
          >
            <Select>
              <Option value="reported">Reported</Option>
              <Option value="investigating">Investigating</Option>
              <Option value="resolved">Resolved</Option>
              <Option value="closed">Closed</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description *"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} placeholder="Detailed description of the incident" />
          </Form.Item>

          <Form.Item name="impact" label="Impact">
            <TextArea rows={2} placeholder="Environmental impact assessment" />
          </Form.Item>

          <Form.Item name="action_required" label="Action Required">
            <TextArea rows={2} placeholder="Required actions to resolve the incident" />
          </Form.Item>

          <Form.Item name="department" label="Department">
            <Input placeholder="Responsible department" />
          </Form.Item>

          <Form.Item name="cost_estimate" label="Cost Estimate">
            <InputNumber 
              style={{ width: '100%' }}
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Estimated cost"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIncidentModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Report Incident
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Compliance Report — real ISO 14001 report from your data */}
      <Modal
        title="Generate Compliance Report"
        open={complianceModalVisible}
        onCancel={() => setComplianceModalVisible(false)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <EnvironmentalDocumentGenerator kinds={['iso14001']} compact onGenerated={() => refetch()} />
      </Modal>
    </div>
  );
}

export default EnvironmentalManagement;