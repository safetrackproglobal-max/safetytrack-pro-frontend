// src/hooks/useEnvironmentalData.js
import { useState, useEffect, useCallback } from 'react';
import { environmentalService } from '../services/environmentalService';

const useEnvironmentalData = () => {
  const [sensors, setSensors] = useState([]);
  const [waterSamples, setWaterSamples] = useState([]);
  const [environmentalIncidents, setEnvironmentalIncidents] = useState([]);
  const [sustainabilityGoals, setSustainabilityGoals] = useState([]);
  const [complianceReports, setComplianceReports] = useState([]);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [smartAlerts, setSmartAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoreData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        sensorsData,
        waterSamplesData,
        incidentsData,
        goalsData,
        reportsData
      ] = await Promise.all([
        environmentalService.getSensors(),
        environmentalService.getWaterSamples(),
        environmentalService.getEnvironmentalIncidents(),
        environmentalService.getSustainabilityGoals(),
        environmentalService.getComplianceReports()
      ]);

      setSensors(sensorsData);
      setWaterSamples(waterSamplesData);
      setEnvironmentalIncidents(incidentsData);
      setSustainabilityGoals(goalsData);
      setComplianceReports(reportsData);

    } catch (err) {
      console.error('Error loading environmental data:', err);
      setError(err.message || 'Failed to load environmental data');
      // Don't reset data on error, keep existing data for better UX
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdvancedData = useCallback(async () => {
    try {
      const [intelligence, alerts] = await Promise.all([
        environmentalService.getEnvironmentalIntelligence().catch(() => null),
        environmentalService.getSmartAlerts().catch(() => [])
      ]);

      setIntelligenceData(intelligence);
      setSmartAlerts(alerts);
    } catch (err) {
      console.error('Error loading advanced environmental data:', err);
      // Silently fail for advanced features as they're optional
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchCoreData(),
      fetchAdvancedData()
    ]);
  }, [fetchCoreData, fetchAdvancedData]);

  const refetch = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  const refetchCore = useCallback(async () => {
    await fetchCoreData();
  }, [fetchCoreData]);

  const refetchAdvanced = useCallback(async () => {
    await fetchAdvancedData();
  }, [fetchAdvancedData]);

  // Statistics calculation
  const statistics = {
    // Core statistics
    totalSensors: sensors.length,
    totalWaterSamples: waterSamples.length,
    totalIncidents: environmentalIncidents.length,
    totalGoals: sustainabilityGoals.length,
    totalReports: complianceReports.length,
    
    // Active counts
    activeSensors: sensors.filter(sensor => sensor.status === 'active' || sensor.status === 'operational').length,
    compliantSamples: waterSamples.filter(sample => 
      sample.complianceStatus === 'compliant' || sample.status === 'compliant'
    ).length,
    activeIncidents: environmentalIncidents.filter(incident => 
      incident.status !== 'resolved' && incident.status !== 'closed'
    ).length,
    inProgressGoals: sustainabilityGoals.filter(goal => 
      goal.progress < 100
    ).length,
    
    // AQI and quality metrics
    averageAQI: sensors.length > 0 
      ? Math.round(sensors.reduce((sum, sensor) => {
          const aqi = sensor.currentMetrics?.aqi || sensor.compliance_score || 0;
          return sum + (aqi > 0 ? aqi : 0);
        }, 0) / sensors.filter(s => s.currentMetrics?.aqi > 0).length)
      : 0,
    
    complianceRate: complianceReports.length > 0
      ? Math.round(complianceReports.reduce((sum, report) => 
          sum + (report.complianceScore || 0), 0) / complianceReports.length)
      : 0,
    
    // Alert statistics
    activeAlerts: smartAlerts.filter(alert => !alert.acknowledged).length,
    highSeverityAlerts: smartAlerts.filter(alert => 
      alert.severity === 'high' && !alert.acknowledged
    ).length
  };

  // Data availability flags
  const dataAvailability = {
    hasData: sensors.length > 0 || waterSamples.length > 0 || environmentalIncidents.length > 0,
    hasSensors: sensors.length > 0,
    hasWaterSamples: waterSamples.length > 0,
    hasIncidents: environmentalIncidents.length > 0,
    hasGoals: sustainabilityGoals.length > 0,
    hasReports: complianceReports.length > 0,
    hasIntelligence: intelligenceData !== null,
    hasAlerts: smartAlerts.length > 0,
    hasAdvancedData: intelligenceData !== null || smartAlerts.length > 0
  };

  // Action functions
  const acknowledgeAlert = useCallback(async (alertId) => {
    try {
      await environmentalService.acknowledgeAlert(alertId);
      setSmartAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
      return true;
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      return false;
    }
  }, []);

  const createNewIncident = useCallback(async (incidentData) => {
    try {
      const newIncident = await environmentalService.reportIncident(incidentData);
      setEnvironmentalIncidents(prev => [newIncident, ...prev]);
      return newIncident;
    } catch (err) {
      console.error('Error creating incident:', err);
      throw err;
    }
  }, []);

  const createNewSensor = useCallback(async (sensorData) => {
    try {
      const newSensor = await environmentalService.createSensor(sensorData);
      setSensors(prev => [newSensor, ...prev]);
      return newSensor;
    } catch (err) {
      console.error('Error creating sensor:', err);
      throw err;
    }
  }, []);

  const createNewWaterSample = useCallback(async (sampleData) => {
    try {
      const newSample = await environmentalService.createWaterSample(sampleData);
      setWaterSamples(prev => [newSample, ...prev]);
      return newSample;
    } catch (err) {
      console.error('Error creating water sample:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    // Core data
    sensors,
    waterSamples,
    environmentalIncidents,
    sustainabilityGoals,
    complianceReports,
    
    // Advanced data
    intelligenceData,
    smartAlerts,
    
    // State
    loading,
    error,
    
    // Statistics
    statistics,
    
    // Data availability
    ...dataAvailability,
    
    // Actions
    refetch,
    refetchCore,
    refetchAdvanced,
    acknowledgeAlert,
    createNewIncident,
    createNewSensor,
    createNewWaterSample,
    
    // Utility
    calculateAQI: environmentalService.calculateAQI,
    getAQICategory: environmentalService.getAQICategory,
    validateSensorData: environmentalService.validateSensorData,
    validateWaterSample: environmentalService.validateWaterSample
  };
};

export default useEnvironmentalData;