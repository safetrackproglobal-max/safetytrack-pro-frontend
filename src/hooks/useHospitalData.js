import { useState, useEffect } from 'react';
import { hospitalService } from '../services/hospitalService';

export const useHospitalData = () => {
  const [departments, setDepartments] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptsData, incidentsData, protocolsData] = await Promise.all([
        hospitalService.getDepartments(),
        hospitalService.getIncidents(),
        hospitalService.getProtocols()
      ]);
      setDepartments(deptsData);
      setIncidents(incidentsData);
      setProtocols(protocolsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refresh = () => {
    setError(null);
    loadData();
  };

  return {
    departments,
    incidents,
    protocols,
    loading,
    error,
    refresh,
    reportIncident: hospitalService.reportIncident,
    updateIncident: hospitalService.updateIncident,
    createDepartment: hospitalService.createDepartment,
    createProtocol: hospitalService.createProtocol
  };
};