import React, { useState, useEffect } from 'react';
import EscalationMatrix from '../../components/compliance/EscalationMatrix';
import notificationService from '../../services/notificationService';

const EscalationManagementPage = () => {
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
      <EscalationMatrix incidents={incidents} />
    </div>
  );
};

export default EscalationManagementPage;