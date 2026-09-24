import React, { useState, useEffect } from 'react';
import RegulatoryReporting from '../../components/compliance/RegulatoryReporting';
import notificationService from '../../services/notificationService';

const RegulatoryCompliancePage = () => {
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
      <RegulatoryReporting incidents={incidents} />
    </div>
  );
};

export default RegulatoryCompliancePage;