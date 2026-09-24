import React, { useState, useEffect } from 'react';
import CostAnalysisModule from '../../components/analytics/CostAnalysisModule';
import notificationService from '../../services/notificationService';

const CostAnalysisPage = () => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await notificationService.getIncidents();
        setIncidents(response?.incidents || response?.data || []);
      } catch (error) {
        console.error('Failed to fetch incidents:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <CostAnalysisModule incidents={incidents} />
    </div>
  );
};

export default CostAnalysisPage;