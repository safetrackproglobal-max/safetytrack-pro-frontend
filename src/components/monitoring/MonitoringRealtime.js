import React, { useState, useEffect, useCallback } from 'react';
import { environmentalService } from '../../services/environmentalService';
import AirQualitySensorCard from './AirQualitySensorCard';
import './environmental.css';

const MonitoringRealtime = () => {
  const [sensors, setSensors] = useState([]);
  const [readings, setReadings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInitialData = useCallback(async () => {
    try {
      const sensorsData = await environmentalService.getSensors();
      setSensors(Array.isArray(sensorsData) ? sensorsData : []);
      
      const readingsData = {};
      const sensorReadingsPromises = sensorsData.map(async (sensor) => {
        try {
          const sensorReadings = await environmentalService.getReadings(sensor.id);
          if (Array.isArray(sensorReadings) && sensorReadings.length > 0) {
            readingsData[sensor.id] = sensorReadings[sensorReadings.length - 1];
          }
        } catch (err) {
          console.error(`Error loading readings for sensor ${sensor.id}:`, err);
        }
      });

      await Promise.allSettled(sensorReadingsPromises);
      setReadings(readingsData);
    } catch (err) {
      setError(err.message || 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReadings = useCallback(async () => {
    try {
      const updatedReadings = { ...readings };
      const updatePromises = sensors.map(async (sensor) => {
        try {
          const sensorReadings = await environmentalService.getReadings(sensor.id);
          if (Array.isArray(sensorReadings) && sensorReadings.length > 0) {
            updatedReadings[sensor.id] = sensorReadings[sensorReadings.length - 1];
          }
        } catch (err) {
          console.error(`Error updating readings for sensor ${sensor.id}:`, err);
        }
      });

      await Promise.allSettled(updatePromises);
      setReadings(updatedReadings);
    } catch (err) {
      console.error('Error updating readings:', err);
    }
  }, [sensors, readings]);

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const initialize = async () => {
      await loadInitialData();
      
      if (isMounted) {
        intervalId = setInterval(updateReadings, 30000);
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loadInitialData, updateReadings]);

  if (loading) return <div className="loading">Loading real-time data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const safeSensors = Array.isArray(sensors) ? sensors : [];

  return (
    <div className="realtime-monitoring">
      <div className="monitoring-header">
        <h2>Real-time Environmental Monitoring</h2>
        <div className="last-update">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="sensors-grid">
        {safeSensors.map(sensor => (
          <AirQualitySensorCard
            key={sensor.id}
            sensor={sensor}
            reading={readings[sensor.id]}
          />
        ))}
      </div>

      {safeSensors.length === 0 && (
        <div className="empty-state">
          <p>No sensors configured for real-time monitoring</p>
        </div>
      )}
    </div>
  );
};

export default MonitoringRealtime;