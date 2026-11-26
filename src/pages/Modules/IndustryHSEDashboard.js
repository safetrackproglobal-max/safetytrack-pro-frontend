// src/pages/Modules/IndustryHSEDashboard.js
import React from 'react';
import { useParams } from 'react-router-dom';

// Import your industry components
import IndustryWorkspace from './Industries/IndustryWorkspace';

const IndustryHSEDashboard = () => {
  const { industryId } = useParams();

  // Component mapping
  // Every industry uses the shared workspace built on real records
  const IndustryComponent = IndustryWorkspace;

  return (
    <div>
      <IndustryComponent industryId={industryId} />
    </div>
  );
};

export default IndustryHSEDashboard;