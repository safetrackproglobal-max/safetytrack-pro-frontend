import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import SafetyObservations from '../../components/compliance/SafetyObservations';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const SafetyObservationsPage = () => {
  const { user } = useAuth();
  const [observations, setObservations] = useState([]);

  // Optional: fetch incidents if needed
  return (
    <div style={{ padding: 24 }}>
      <Card>
        <SafetyObservations 
          observations={observations}
          currentUser={user}
          onAddObservation={(obs) => console.log('Added:', obs)}
          onUpdateObservation={(obs) => console.log('Updated:', obs)}
        />
      </Card>
    </div>
  );
};

export default SafetyObservationsPage;