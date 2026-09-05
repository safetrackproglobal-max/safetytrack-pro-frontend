import React from 'react';
import { useHospitalData } from '../../hooks/useHospitalData';
import DepartmentComplianceCard from './DepartmentComplianceCard';
import BiohazardIncidentForm from './BiohazardIncidentForm';
import './hospital.css';

const HospitalSafetyDashboard = () => {
  const { departments, incidents, loading, error } = useHospitalData();

  if (loading) return <div className="loading">Loading hospital data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="hospital-safety-dashboard">
      <div className="dashboard-header">
        <h2>Hospital Safety Overview</h2>
        <BiohazardIncidentForm />
      </div>

      <div className="compliance-grid">
        {departments.map(dept => (
          <DepartmentComplianceCard key={dept.id} department={dept} />
        ))}
      </div>

      <div className="recent-incidents">
        <h3>Recent Biohazard Incidents</h3>
        <div className="incidents-list">
          {incidents.slice(0, 5).map(incident => (
            <div key={incident.id} className="incident-item">
              <span className={`severity-badge ${incident.severity}`}>
                {incident.severity}
              </span>
              <span className="incident-type">{incident.incident_type}</span>
              <span className="incident-date">
                {new Date(incident.incident_date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalSafetyDashboard;