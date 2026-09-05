// src/pages/Modules/IndustryHSEDashboard.js
import React from 'react';
import { useParams } from 'react-router-dom';

// Import your industry components
import OilGasSafety from './Industries/OilGasSafety';
import ConstructionSafety from './Industries/ConstructionSafety';
import HealthcareSafety from './Industries/HealthcareSafety';
import MiningSafety from './Industries/MiningSafety';
import ChemicalSafety from './Industries/ChemicalSafety';
import AviationSafety from './Industries/AviationSafety';
import MaritimeSafety from './Industries/MaritimeSafety';
import GeneralIndustry from './Industries/GeneralIndustry';

const IndustryHSEDashboard = () => {
  const { industryId } = useParams();

  // Component mapping
  const industryComponents = {
    oil_gas: OilGasSafety,
    construction: ConstructionSafety,
    healthcare: HealthcareSafety,
    mining: MiningSafety,
    chemical: ChemicalSafety,
    aviation: AviationSafety,
    maritime: MaritimeSafety,
    general: GeneralIndustry,
  };

  const IndustryComponent = industryComponents[industryId] || GeneralIndustry;

  return (
    <div>
      <IndustryComponent industryId={industryId} />
    </div>
  );
};

export default IndustryHSEDashboard;