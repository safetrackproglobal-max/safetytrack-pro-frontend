// src/components/environmental/AdvancedEnvironmentalDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Row, Col, Card, Statistic, Tag, Alert, Progress, List, Switch, 
  Button, Timeline, Avatar, Badge, Tabs, Divider, Space, Spin, Empty,
  message, Tooltip, Dropdown, Menu
} from 'antd';
import { 
  EnvironmentOutlined, 
  CheckCircleOutlined, 
  WarningOutlined, 
  RobotOutlined, 
  ThunderboltOutlined,
  DashboardOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  BulbOutlined,
  FireOutlined,
  HeatMapOutlined,
  ReloadOutlined,
  ExperimentOutlined,
  CloudOutlined,
  PlusOutlined,
  GlobalOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  DropboxOutlined,
  ZoomOutOutlined,
  ApiOutlined,
  SettingOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons';
import advancedEnvironmentalService from '../../services/advancedEnvironmentalService';
import environmentalAIService from '../../services/environmentalAIService';
import EnvironmentalIntelligencePanel from './panels/EnvironmentalIntelligencePanel';
import PredictiveAnalyticsPanel from './panels/PredictiveAnalyticsPanel';
import ComplianceAutomationPanel from './panels/ComplianceAutomationPanel';
import ImpactScorecard from './panels/ImpactScorecard';
import SmartAlertSystem from './panels/SmartAlertSystem';
import SustainabilityTracker from './panels/SustainabilityTracker';
import LiveMonitoringPanel from './panels/LiveMonitoringPanel';
import ThermalSensorCard from '../monitoring/ThermalSensorCard';
import ThermalComfortGauge from '../monitoring/ThermalComfortGauge';
import WeatherPanel from './panels/WeatherPanel';
import AddThermalDataModal from './panels/AddThermalDataModal';
import SensorDetailsModal from './panels/SensorDetailsModal';

// Import the new management components
import WaterQualityManagement from './WaterQualityManagement';
import AirQualityManagement from './AirQualityManagement';
import EnvironmentalIncidentsManagement from './EnvironmentalIncidentsManagement';

import './environmental.css';

const { TabPane } = Tabs;

// Validation constants
const VALIDATION = {
  TEMPERATURE: {
    min: -50,
    max: 60,
    warningMin: -10,
    warningMax: 45
  },
  HUMIDITY: {
    min: 0,
    max: 100,
    warningMin: 20,
    warningMax: 80
  },
  UHI_TEMPERATURE: {
    min: -20,
    max: 50
  },
  COMFORT_LEVELS: ['Excellent', 'Good', 'Moderate', 'Poor', 'Very Poor'],
  ANOMALY_TYPES: ['temperature_spike', 'temperature_drop', 'rapid_change', 'persistent_high', 'persistent_low'],
  ANOMALY_SEVERITIES: ['low', 'medium', 'high', 'critical']
};

const AdvancedEnvironmentalDashboard = () => {
  const [activeTab, setActiveTab] = useState('intelligence');
  
  // State for all data types
  const [addDataModalVisible, setAddDataModalVisible] = useState(false);
  const [sensorDetailsVisible, setSensorDetailsVisible] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({});
  const [automationData, setAutomationData] = useState(null);
  const [scorecardData, setScorecardData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [goals, setGoals] = useState([]);
  
  // Thermal monitoring data
  const [thermalSensors, setThermalSensors] = useState([]);
  const [thermalAnalyses, setThermalAnalyses] = useState([]);
  const [thermalAnomalies, setThermalAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [comfortLogs, setComfortLogs] = useState([]);
  const [uhiRecords, setUhiRecords] = useState([]);
  const [thermalReadings, setThermalReadings] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Validation functions
  const validateTemperature = useCallback((temp, fieldName = 'Temperature') => {
    if (temp === undefined || temp === null) return { valid: true };
    
    const numTemp = Number(temp);
    if (isNaN(numTemp)) {
      return { valid: false, error: `${fieldName} must be a valid number` };
    }
    
    if (numTemp < VALIDATION.TEMPERATURE.min || numTemp > VALIDATION.TEMPERATURE.max) {
      return { 
        valid: false, 
        error: `${fieldName} must be between ${VALIDATION.TEMPERATURE.min}°C and ${VALIDATION.TEMPERATURE.max}°C` 
      };
    }
    
    return { valid: true, value: numTemp };
  }, []);

  const validateHumidity = useCallback((humidity, fieldName = 'Humidity') => {
    if (humidity === undefined || humidity === null) return { valid: true };
    
    const numHumidity = Number(humidity);
    if (isNaN(numHumidity)) {
      return { valid: false, error: `${fieldName} must be a valid number` };
    }
    
    if (numHumidity < VALIDATION.HUMIDITY.min || numHumidity > VALIDATION.HUMIDITY.max) {
      return { 
        valid: false, 
        error: `${fieldName} must be between ${VALIDATION.HUMIDITY.min}% and ${VALIDATION.HUMIDITY.max}%` 
      };
    }
    
    return { valid: true, value: numHumidity };
  }, []);

  const validateComfortLevel = useCallback((level) => {
    if (!level) return { valid: true };
    if (!VALIDATION.COMFORT_LEVELS.includes(level)) {
      return { 
        valid: false, 
        error: `Invalid comfort level. Allowed: ${VALIDATION.COMFORT_LEVELS.join(', ')}` 
      };
    }
    return { valid: true };
  }, []);

  const validateUhiTemperature = useCallback((temp, fieldName = 'Temperature') => {
    if (temp === undefined || temp === null) return { valid: true };
    
    const numTemp = Number(temp);
    if (isNaN(numTemp)) {
      return { valid: false, error: `${fieldName} must be a valid number` };
    }
    
    if (numTemp < VALIDATION.UHI_TEMPERATURE.min || numTemp > VALIDATION.UHI_TEMPERATURE.max) {
      return { 
        valid: false, 
        error: `${fieldName} must be between ${VALIDATION.UHI_TEMPERATURE.min}°C and ${VALIDATION.UHI_TEMPERATURE.max}°C` 
      };
    }
    
    return { valid: true, value: numTemp };
  }, []);

  const validateAnomalyData = useCallback((data) => {
    const errors = {};
    
    if (data.anomaly_type && !VALIDATION.ANOMALY_TYPES.includes(data.anomaly_type)) {
      errors.anomaly_type = `Invalid anomaly type. Allowed: ${VALIDATION.ANOMALY_TYPES.join(', ')}`;
    }
    
    if (data.severity && !VALIDATION.ANOMALY_SEVERITIES.includes(data.severity)) {
      errors.severity = `Invalid severity. Allowed: ${VALIDATION.ANOMALY_SEVERITIES.join(', ')}`;
    }
    
    if (data.current_value !== undefined) {
      const tempValidation = validateTemperature(data.current_value, 'Current value');
      if (!tempValidation.valid) {
        errors.current_value = tempValidation.error;
      }
    }
    
    if (data.expected_value !== undefined) {
      const tempValidation = validateTemperature(data.expected_value, 'Expected value');
      if (!tempValidation.valid) {
        errors.expected_value = tempValidation.error;
      }
    }
    
    return errors;
  }, [validateTemperature]);

  const validateSensorData = useCallback((data) => {
    const errors = {};
    
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Sensor name must be at least 2 characters';
    }
    
    if (data.name && data.name.trim().length > 100) {
      errors.name = 'Sensor name must be less than 100 characters';
    }
    
    if (data.location && data.location.trim().length > 200) {
      errors.location = 'Location must be less than 200 characters';
    }
    
    if (data.sensor_id && !/^[a-zA-Z0-9\-_]+$/.test(data.sensor_id)) {
      errors.sensor_id = 'Sensor ID can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (data.current_temperature !== undefined) {
      const tempValidation = validateTemperature(data.current_temperature, 'Current temperature');
      if (!tempValidation.valid) {
        errors.current_temperature = tempValidation.error;
      }
    }
    
    if (data.humidity !== undefined) {
      const humidityValidation = validateHumidity(data.humidity);
      if (!humidityValidation.valid) {
        errors.humidity = humidityValidation.error;
      }
    }
    
    if (data.status) {
      const allowedStatuses = ['active', 'inactive', 'maintenance', 'offline', 'decommissioned'];
      if (!allowedStatuses.includes(data.status)) {
        errors.status = `Invalid status. Allowed: ${allowedStatuses.join(', ')}`;
      }
    }
    
    return errors;
  }, [validateTemperature, validateHumidity]);

  // Data validation for responses
  const validateResponseData = useCallback((data, type) => {
    const errors = {};
    
    switch(type) {
      case 'thermal_sensors':
        if (!data || !Array.isArray(data)) {
          errors.data = 'Invalid sensor data format';
        } else {
          data.forEach((sensor, index) => {
            const sensorErrors = validateSensorData(sensor);
            if (Object.keys(sensorErrors).length > 0) {
              errors[`sensor_${index}`] = sensorErrors;
            }
          });
        }
        break;
        
      case 'comfort_logs':
        if (!data || !Array.isArray(data)) {
          errors.data = 'Invalid comfort log format';
        } else {
          data.forEach((log, index) => {
            if (log.air_temperature !== undefined) {
              const tempValidation = validateTemperature(log.air_temperature, 'Air temperature');
              if (!tempValidation.valid) {
                errors[`log_${index}`] = { air_temperature: tempValidation.error };
              }
            }
            if (log.relative_humidity !== undefined) {
              const humidityValidation = validateHumidity(log.relative_humidity);
              if (!humidityValidation.valid) {
                errors[`log_${index}`] = { relative_humidity: humidityValidation.error };
              }
            }
            if (log.comfort_level) {
              const comfortValidation = validateComfortLevel(log.comfort_level);
              if (!comfortValidation.valid) {
                errors[`log_${index}`] = { comfort_level: comfortValidation.error };
              }
            }
          });
        }
        break;
        
      case 'uhi_records':
        if (!data || !Array.isArray(data)) {
          errors.data = 'Invalid UHI record format';
        } else {
          data.forEach((record, index) => {
            if (record.urban_core_temperature !== undefined) {
              const tempValidation = validateUhiTemperature(record.urban_core_temperature, 'Urban core temperature');
              if (!tempValidation.valid) {
                errors[`record_${index}`] = { urban_core_temperature: tempValidation.error };
              }
            }
            if (record.rural_reference_temperature !== undefined) {
              const tempValidation = validateUhiTemperature(record.rural_reference_temperature, 'Rural reference temperature');
              if (!tempValidation.valid) {
                errors[`record_${index}`] = { rural_reference_temperature: tempValidation.error };
              }
            }
          });
        }
        break;
        
      case 'anomalies':
        if (!data || !Array.isArray(data)) {
          errors.data = 'Invalid anomaly format';
        } else {
          data.forEach((anomaly, index) => {
            const anomalyErrors = validateAnomalyData(anomaly);
            if (Object.keys(anomalyErrors).length > 0) {
              errors[`anomaly_${index}`] = anomalyErrors;
            }
          });
        }
        break;
        
      default:
        break;
    }
    
    return errors;
  }, [validateSensorData, validateTemperature, validateHumidity, validateComfortLevel, validateUhiTemperature, validateAnomalyData]);

  // Load dashboard data with validation
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    
    try {
      // Load all data in parallel
      const [
        intelligenceResponse,
        automationResponse,
        scorecardResponse,
        alertsResponse,
        goalsResponse,
        thermalSensorsData,
        thermalAnalysesData,
        thermalAnomaliesData,
        recommendationsData,
        comfortLogsData,
        uhiRecordsData
      ] = await Promise.allSettled([
        advancedEnvironmentalService.getEnvironmentalIntelligence(),
        advancedEnvironmentalService.getComplianceAutomation(),
        advancedEnvironmentalService.getImpactScorecard(),
        advancedEnvironmentalService.getSmartAlerts(),
        advancedEnvironmentalService.getSustainabilityGoals(),
        environmentalAIService.getThermalSensors(),
        environmentalAIService.getThermalAnalyses(),
        environmentalAIService.getThermalAnomalies(),
        environmentalAIService.getThermalRecommendations(),
        environmentalAIService.getThermalComfortLogs(),
        environmentalAIService.getUhiRecords()
      ]);

      // Process results with validation
      const validationResults = {};

      // Intelligence Data
      if (intelligenceResponse.status === 'fulfilled') {
        const value = intelligenceResponse.value?.intelligence;
        if (value && typeof value === 'object') {
          setIntelligenceData(value);
        } else {
          setIntelligenceData(null);
        }
      }

      // Automation Data
      if (automationResponse.status === 'fulfilled') {
        setAutomationData(automationResponse.value?.automation || null);
      }

      // Scorecard Data
      if (scorecardResponse.status === 'fulfilled') {
        const data = scorecardResponse.value?.scorecard || [];
        setScorecardData(Array.isArray(data) ? data : []);
      }

      // Alerts Data
      if (alertsResponse.status === 'fulfilled') {
        const data = alertsResponse.value?.alerts || [];
        setAlerts(Array.isArray(data) ? data : []);
      }

      // Goals Data
      if (goalsResponse.status === 'fulfilled') {
        const data = goalsResponse.value?.goals || [];
        setGoals(Array.isArray(data) ? data : []);
      }

      // Thermal sensors data with validation
      if (thermalSensorsData.status === 'fulfilled') {
        const response = thermalSensorsData.value;
        let sensors = [];
        let readings = [];
        
        if (response?.dashboard?.sensors) {
          sensors = response.dashboard.sensors;
          readings = response.dashboard.recent_readings || [];
        } else if (response?.sensors) {
          sensors = response.sensors;
        } else if (Array.isArray(response)) {
          sensors = response;
        }
        
        // Validate sensors
        const sensorErrors = validateResponseData(sensors, 'thermal_sensors');
        if (Object.keys(sensorErrors).length > 0) {
          validationResults.sensors = sensorErrors;
          console.warn('Sensor validation errors:', sensorErrors);
        }
        
        setThermalSensors(Array.isArray(sensors) ? sensors : []);
        setThermalReadings(Array.isArray(readings) ? readings : []);
      }

      // Thermal analyses
      if (thermalAnalysesData.status === 'fulfilled') {
        const response = thermalAnalysesData.value;
        let analyses = [];
        if (response?.analyses) {
          analyses = response.analyses;
        } else if (Array.isArray(response)) {
          analyses = response;
        }
        setThermalAnalyses(Array.isArray(analyses) ? analyses : []);
      }

      // Thermal anomalies with validation
      if (thermalAnomaliesData.status === 'fulfilled') {
        const response = thermalAnomaliesData.value;
        let anomalies = [];
        if (response?.anomalies) {
          anomalies = response.anomalies;
        } else if (Array.isArray(response)) {
          anomalies = response;
        }
        
        // Validate anomalies
        const anomalyErrors = validateResponseData(anomalies, 'anomalies');
        if (Object.keys(anomalyErrors).length > 0) {
          validationResults.anomalies = anomalyErrors;
          console.warn('Anomaly validation errors:', anomalyErrors);
        }
        
        setThermalAnomalies(Array.isArray(anomalies) ? anomalies : []);
      }

      // Thermal recommendations
      if (recommendationsData.status === 'fulfilled') {
        const response = recommendationsData.value;
        let recs = [];
        if (response?.recommendations) {
          recs = response.recommendations;
        } else if (Array.isArray(response)) {
          recs = response;
        }
        setRecommendations(Array.isArray(recs) ? recs : []);
      }

      // Comfort logs with validation
      if (comfortLogsData.status === 'fulfilled') {
        const response = comfortLogsData.value;
        let logs = [];
        if (response?.logs) {
          logs = response.logs;
        } else if (Array.isArray(response)) {
          logs = response;
        } else if (response?.thermal_comfort) {
          logs = [response.thermal_comfort];
        }
        
        // Validate comfort logs
        const logErrors = validateResponseData(logs, 'comfort_logs');
        if (Object.keys(logErrors).length > 0) {
          validationResults.comfortLogs = logErrors;
          console.warn('Comfort log validation errors:', logErrors);
        }
        
        setComfortLogs(Array.isArray(logs) ? logs : []);
      }

      // UHI records with validation
      if (uhiRecordsData.status === 'fulfilled') {
        const response = uhiRecordsData.value;
        let records = [];
        if (response?.records) {
          records = response.records;
        } else if (Array.isArray(response)) {
          records = response;
        }
        
        // Validate UHI records
        const recordErrors = validateResponseData(records, 'uhi_records');
        if (Object.keys(recordErrors).length > 0) {
          validationResults.uhiRecords = recordErrors;
          console.warn('UHI record validation errors:', recordErrors);
        }
        
        setUhiRecords(Array.isArray(records) ? records : []);
      }

      // Set validation errors
      if (Object.keys(validationResults).length > 0) {
        setValidationErrors(validationResults);
        
        // Show warning message for validation errors
        const errorCount = Object.keys(validationResults).reduce((count, key) => {
          return count + Object.keys(validationResults[key]).length;
        }, 0);
        
        if (errorCount > 0) {
          message.warning(`Data validation issues found. Please check the console for details. (${errorCount} issues)`);
        }
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(error.message || 'Failed to load environmental data');
      message.error('Failed to load dashboard data. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  }, [validateResponseData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleAcknowledgeAlert = async (alertId) => {
    if (!alertId) {
      message.error('Invalid alert ID');
      return;
    }
    
    try {
      await advancedEnvironmentalService.acknowledgeAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      message.success('Alert acknowledged successfully');
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      message.error('Failed to acknowledge alert: ' + error.message);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
    message.info('Refreshing dashboard data...');
  };

  // View sensor details with validation
  const handleViewSensorDetails = (sensorId, sensorIdStr) => {
    if (!sensorId && !sensorIdStr) {
      message.error('Invalid sensor ID');
      return;
    }
    
    const sensor = thermalSensors.find(s => s.id === sensorId || s.sensor_id === sensorIdStr);
    if (sensor) {
      // Add readings to the sensor object
      const sensorReadings = thermalReadings.filter(r => r.sensor_id === sensor.sensor_id);
      setSelectedSensor({ ...sensor, readings: sensorReadings });
      setSensorDetailsVisible(true);
    } else {
      message.error('Sensor not found');
    }
  };

  // Delete sensor with validation
  const handleDeleteSensor = async (sensorId, sensorIdStr) => {
    if (!sensorId && !sensorIdStr) {
      message.error('Invalid sensor ID');
      return;
    }
    
    try {
      await environmentalAIService.deleteThermalSensor(sensorIdStr || sensorId);
      message.success('Sensor deleted successfully');
      loadDashboardData();
    } catch (error) {
      console.error('Failed to delete sensor:', error);
      message.error('Failed to delete sensor: ' + (error.message || 'Unknown error'));
    }
  };

  const handleThermalDataAdded = () => {
    loadDashboardData();
    message.success('Thermal data added successfully');
  };

  // Get temperature color based on value
  const getTemperatureColor = (temp) => {
    if (temp === undefined || temp === null || isNaN(temp)) return '#d9d9d9';
    
    if (temp >= 35) return '#cf1322';
    if (temp >= 30) return '#f5222d';
    if (temp >= 25) return '#fa541c';
    if (temp >= 20) return '#fa8c16';
    if (temp >= 15) return '#faad14';
    if (temp >= 10) return '#52c41a';
    if (temp >= 5) return '#1890ff';
    if (temp >= 0) return '#096dd9';
    return '#0050b3';
  };

  // Get risk color
  const getRiskColor = (level) => {
    if (!level) return '#d9d9d9';
    
    switch(level?.toLowerCase()) {
      case 'critical': return '#cf1322';
      case 'high': return '#f5222d';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  // Get comfort color
  const getComfortColor = (level) => {
    if (!level) return '#d9d9d9';
    
    switch(level) {
      case 'Excellent': return '#52c41a';
      case 'Good': return '#389e0d';
      case 'Moderate': return '#faad14';
      case 'Poor': return '#f5222d';
      case 'Very Poor': return '#cf1322';
      default: return '#d9d9d9';
    }
  };

  // Calculate thermal statistics
  const thermalStats = {
    totalSensors: thermalSensors.length,
    activeSensors: thermalSensors.filter(s => s.status === 'active' || s.status === 'online').length,
    activeAnomalies: thermalAnomalies.filter(a => a.status === 'active').length,
    criticalAnomalies: thermalAnomalies.filter(a => a.severity === 'critical' && a.status === 'active').length,
    avgTemperature: thermalSensors.length > 0
      ? Math.round((thermalSensors.reduce((sum, s) => sum + (s.current_temperature || s.temperature || 0), 0) / thermalSensors.length) * 10) / 10
      : 0
  };

  // Check if there are any validation errors
  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  // Tab items configuration for the main tabs
  const tabItems = [
    {
      key: 'intelligence',
      label: (
        <span>
          <EnvironmentOutlined />
          Intelligence Hub
        </span>
      ),
      children: <EnvironmentalIntelligencePanel data={intelligenceData} />
    },
    {
      key: 'analytics',
      label: (
        <span>
          <LineChartOutlined />
          Predictive Analytics
        </span>
      ),
      children: <PredictiveAnalyticsPanel data={analyticsData} onRefresh={handleRefresh} />
    },
    {
      key: 'compliance',
      label: (
        <span>
          <SafetyCertificateOutlined />
          Compliance Automation
        </span>
      ),
      children: <ComplianceAutomationPanel data={automationData} onSettingsUpdate={loadDashboardData} />
    },
    {
      key: 'impact',
      label: (
        <span>
          🌱 Impact Scorecard
          {scorecardData.length > 0 && (
            <Badge count={scorecardData.length} style={{ marginLeft: 8 }} />
          )}
        </span>
      ),
      children: <ImpactScorecard data={scorecardData} />
    },
    {
      key: 'alerts',
      label: (
        <span>
          <AlertOutlined />
          Smart Alerts
          {alerts.length > 0 && (
            <Badge 
              count={alerts.filter(a => !a.acknowledged).length} 
              style={{ marginLeft: 8, backgroundColor: '#f5222d' }} 
            />
          )}
        </span>
      ),
      children: <SmartAlertSystem alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
    },
    {
      key: 'live-monitoring',
      label: (
        <span>
          <GlobalOutlined />
          Live Monitoring
        </span>
      ),
      children: <LiveMonitoringPanel />
    },
    {
      key: 'goals',
      label: (
        <span>
          🎯 Sustainability Goals
        </span>
      ),
      children: <SustainabilityTracker goals={goals} onUpdate={loadDashboardData} />
    },
    {
      key: 'thermal',
      label: (
        <span>
          <FireOutlined />
          Thermal Monitoring
          {thermalStats.activeAnomalies > 0 && (
            <Badge 
              count={thermalStats.activeAnomalies} 
              style={{ marginLeft: 8, backgroundColor: '#fa541c' }} 
            />
          )}
        </span>
      ),
      children: (
        <div className="thermal-monitoring-container">
          {/* Thermal Statistics Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Thermal Sensors"
                  value={thermalStats.activeSensors}
                  suffix={`/ ${thermalStats.totalSensors}`}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Avg Temperature"
                  value={thermalStats.avgTemperature || '--'}
                  suffix="°C"
                  valueStyle={{ color: getTemperatureColor(thermalStats.avgTemperature) }}
                />
                {thermalStats.avgTemperature > VALIDATION.TEMPERATURE.warningMax && (
                  <Tag color="warning" style={{ marginTop: 4 }}>High</Tag>
                )}
                {thermalStats.avgTemperature < VALIDATION.TEMPERATURE.warningMin && (
                  <Tag color="warning" style={{ marginTop: 4 }}>Low</Tag>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Active Anomalies"
                  value={thermalStats.activeAnomalies}
                  valueStyle={{ color: thermalStats.activeAnomalies > 0 ? '#faad14' : '#52c41a' }}
                />
                {thermalStats.criticalAnomalies > 0 && (
                  <Tag color="red" style={{ marginTop: 8 }}>
                    Critical: {thermalStats.criticalAnomalies}
                  </Tag>
                )}
              </Card>
            </Col>
          </Row>

          {/* Add Data Button */}
          <Row justify="end" style={{ marginBottom: 16 }}>
            <Col>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setAddDataModalVisible(true)}
              >
                Add Thermal Data
              </Button>
            </Col>
          </Row>

          {/* Thermal Sensors Grid */}
          <div style={{ marginBottom: 24 }}>
            <Divider orientation="left">
              <Space>
                <ExperimentOutlined />
                Thermal Sensors
                <Tag color="blue">{thermalSensors.length} total</Tag>
                {validationErrors.sensors && (
                  <Tooltip title="Some sensors have validation issues">
                    <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                      {Object.keys(validationErrors.sensors).length} issues
                    </Tag>
                  </Tooltip>
                )}
              </Space>
            </Divider>
            
            {thermalSensors.length > 0 ? (
              <Row gutter={[16, 16]}>
                {thermalSensors.map(sensor => {
                  const matchingReading = thermalReadings.find(
                    r => r.sensor_id === sensor.sensor_id
                  );
                  
                  // Check if this sensor has validation errors
                  const sensorErrors = validationErrors.sensors?.[`sensor_${sensor.id}`];
                  
                  return (
                    <Col xs={24} md={8} key={sensor.id}>
                      <ThermalSensorCard 
                        sensor={sensor}
                        reading={matchingReading ? { 
                          temperature: matchingReading.temperature,
                          humidity: matchingReading.humidity,
                          reading_time: matchingReading.time
                        } : (sensor.current_temperature ? { 
                          temperature: sensor.current_temperature,
                          reading_time: new Date().toISOString()
                        } : null)}
                        onViewDetails={handleViewSensorDetails}
                        onDelete={handleDeleteSensor}
                        validationErrors={sensorErrors}
                      />
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <Empty 
                description={
                  <span>
                    No thermal sensors available. 
                    <Button type="link" onClick={() => setAddDataModalVisible(true)}>
                      Click 'Add Data'
                    </Button> 
                    to create one.
                  </span>
                } 
              />
            )}
          </div>

          {/* Thermal Comfort Logs */}
          {comfortLogs.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Divider orientation="left">
                <Space>
                  <BulbOutlined />
                  Recent Comfort Logs
                  <Tag color="green">{comfortLogs.length} logs</Tag>
                  {validationErrors.comfortLogs && (
                    <Tooltip title="Some comfort logs have validation issues">
                      <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                        {Object.keys(validationErrors.comfortLogs).length} issues
                      </Tag>
                    </Tooltip>
                  )}
                </Space>
              </Divider>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <ThermalComfortGauge 
                    comfortIndex={comfortLogs[0]?.discomfort_index || 0}
                    pmv={comfortLogs[0]?.predicted_mean_vote}
                    comfortLevel={comfortLogs[0]?.comfort_level}
                  />
                </Col>
                <Col xs={24} md={16}>
                  <Timeline mode="left">
                    {comfortLogs.slice(0, 3).map(log => (
                      <Timeline.Item 
                        key={log.id}
                        color={getComfortColor(log.comfort_level)}
                        label={log.measurement_time ? new Date(log.measurement_time).toLocaleString() : 'N/A'}
                      >
                        <Space direction="vertical" size="small">
                          <strong>{log.location_id || 'Unknown Location'}</strong>
                          <Space>
                            <Tag color={getTemperatureColor(log.air_temperature)}>
                              {log.air_temperature}°C
                            </Tag>
                            <Tag>{log.comfort_level}</Tag>
                            <Tag>PMV: {log.predicted_mean_vote?.toFixed(2)}</Tag>
                          </Space>
                        </Space>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Col>
              </Row>
            </div>
          )}

          {/* UHI Records */}
          {uhiRecords.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Divider orientation="left">
                <Space>
                  <HeatMapOutlined />
                  Urban Heat Island Records
                  <Tag color="orange">{uhiRecords.length} records</Tag>
                  {validationErrors.uhiRecords && (
                    <Tooltip title="Some UHI records have validation issues">
                      <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                        {Object.keys(validationErrors.uhiRecords).length} issues
                      </Tag>
                    </Tooltip>
                  )}
                </Space>
              </Divider>
              <Row gutter={[16, 16]}>
                {uhiRecords.slice(0, 3).map(record => (
                  <Col xs={24} md={8} key={record.id}>
                    <Card size="small" className="uhi-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Tag color={getRiskColor(record.risk_level)}>
                          {record.risk_level || 'Unknown'} RISK
                        </Tag>
                        <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                          {record.measurement_date ? new Date(record.measurement_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>Urban: <strong>{record.urban_core_temperature}°C</strong></span>
                          <span>Rural: <strong>{record.rural_reference_temperature}°C</strong></span>
                        </div>
                        <Progress 
                          percent={Math.min(100, ((record.heat_island_intensity || 0) / 5) * 100)} 
                          size="small"
                          strokeColor={getRiskColor(record.risk_level)}
                          format={() => `${record.heat_island_intensity || 0}°C`}
                        />
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
          
          {/* Thermal Anomalies Table */}
          {thermalAnomalies.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <Divider orientation="left">
                <Space>
                  <WarningOutlined />
                  Active Anomalies
                  <Tag color="red">{thermalAnomalies.filter(a => a.status === 'active').length} active</Tag>
                  {validationErrors.anomalies && (
                    <Tooltip title="Some anomalies have validation issues">
                      <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                        {Object.keys(validationErrors.anomalies).length} issues
                      </Tag>
                    </Tooltip>
                  )}
                </Space>
              </Divider>
              <List
                size="small"
                bordered
                dataSource={thermalAnomalies.filter(a => a.status === 'active').slice(0, 5)}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<WarningOutlined />} 
                          style={{ backgroundColor: getRiskColor(item.severity) }} 
                        />
                      }
                      title={
                        <Space>
                          <span>{item.anomaly_type?.replace(/_/g, ' ').toUpperCase() || 'Unknown'}</span>
                          <Tag color={getRiskColor(item.severity)}>{item.severity || 'Unknown'}</Tag>
                          {item.status === 'active' && (
                            <Tag color="red" icon={<CloseOutlined />}>Active</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space>
                          {item.current_value && (
                            <span>Current: {item.current_value}°C</span>
                          )}
                          {item.expected_value && (
                            <span>Expected: {item.expected_value}°C</span>
                          )}
                          {item.location_id && (
                            <span>Location: {item.location_id}</span>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'water-quality',
      label: (
        <span>
          < ZoomOutOutlined />
          Water Quality
        </span>
      ),
      children: <WaterQualityManagement />
    },
    {
      key: 'air-quality',
      label: (
        <span>
          <CloudOutlined />
          Air Quality
        </span>
      ),
      children: <AirQualityManagement />
    },
    {
      key: 'incidents',
      label: (
        <span>
          <AlertOutlined />
          Incidents
        </span>
      ),
      children: <EnvironmentalIncidentsManagement />
    },
    {
      key: 'weather',
      label: (
        <span>
          <CloudOutlined />
          Weather
        </span>
      ),
      children: <WeatherPanel initialLocation="auto:ip" />
    }
  ];

  if (loading) {
    return (
      <div className="environmental-loading">
        <div className="loading-container">
          <Spin size="large" />
          <div className="loading-content">
            <h3>Loading Advanced Environmental Dashboard</h3>
            <p>Fetching real-time environmental intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Failed to Load Dashboard"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" type="primary" onClick={handleRefresh}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="advanced-environmental-dashboard">
      {/* Validation Error Alert */}
      {hasValidationErrors && (
        <Alert
          message="Data Validation Issues Detected"
          description={
            <div>
              <p>Some data items failed validation. This may indicate corrupted data or API mismatches.</p>
              <p>
                <Tag color="warning">{Object.keys(validationErrors).length} categories with issues</Tag>
                <Button 
                  size="small" 
                  onClick={() => console.log('Validation errors:', validationErrors)}
                  style={{ marginLeft: 8 }}
                >
                  View Details in Console
                </Button>
              </p>
            </div>
          }
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Card 
        title={
          <span>
            <DashboardOutlined style={{ marginRight: 8 }} />
            Advanced Environmental Management
          </span>
        }
        extra={
          <Space>
            <Tag icon={<RobotOutlined />} color="blue">AI-Powered</Tag>
            <Tag icon={<ThunderboltOutlined />} color="green">Live Data</Tag>
            {hasValidationErrors && (
              <Tooltip title="Data validation issues detected">
                <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                  Validation Issues
                </Tag>
              </Tooltip>
            )}
            <Dropdown
              menu={{
                items: [
                  {
                    key: '1',
                    icon: <ExportOutlined />,
                    label: 'Export Data'
                  },
                  {
                    key: '2',
                    icon: <ImportOutlined />,
                    label: 'Import Data'
                  },
                  {
                    key: '3',
                    icon: <SettingOutlined />,
                    label: 'Settings'
                  }
                ]
              }}
            >
              <Button icon={<SettingOutlined />}>
                Actions
              </Button>
            </Dropdown>
            <Button size="small" onClick={handleRefresh} icon={<ReloadOutlined />}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size="large"
          items={tabItems}
        />
      </Card>

      {/* Add Thermal Data Modal */}
      <AddThermalDataModal
        visible={addDataModalVisible}
        onClose={() => setAddDataModalVisible(false)}
        onSuccess={handleThermalDataAdded}
      />

      {/* Sensor Details Modal */}
      <SensorDetailsModal
        visible={sensorDetailsVisible}
        sensor={selectedSensor}
        onClose={() => setSensorDetailsVisible(false)}
        onRefresh={loadDashboardData}
      />
    </div>
  );
};

export default AdvancedEnvironmentalDashboard;