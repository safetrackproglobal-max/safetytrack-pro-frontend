import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import PredictiveAnalyticsDashboard from '../../components/analytics/PredictiveAnalyticsDashboard';
import notificationService from '../../services/notificationService';

const PredictiveAnalyticsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await notificationService.getIncidents();
        setIncidents(response?.incidents || response?.data || []);
      } catch (error) {
        console.error('Failed to fetch incidents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <PredictiveAnalyticsDashboard incidents={incidents} />
    </div>
  );
};

export default PredictiveAnalyticsPage;