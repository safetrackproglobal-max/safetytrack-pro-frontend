import { useState, useEffect } from 'react';
import { complianceService } from '../services/complianceService';

export const useCompliance = () => {
  const [policies, setPolicies] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [findings, setFindings] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [policiesData, checklistsData, findingsData] = await Promise.all([
        complianceService.getPolicies(),
        complianceService.getChecklists(),
        complianceService.getFindings()
      ]);
      setPolicies(policiesData);
      setChecklists(checklistsData);
      setFindings(findingsData);
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

  const getDepartmentScore = async (departmentId) => {
    try {
      const score = await complianceService.getComplianceScore(departmentId);
      setScores(prev => ({ ...prev, [departmentId]: score }));
      return score;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  return {
    policies,
    checklists,
    findings,
    scores,
    loading,
    error,
    refresh,
    createPolicy: complianceService.createPolicy,
    createChecklist: complianceService.createChecklist,
    submitChecklistResponse: complianceService.submitChecklistResponse,
    createFinding: complianceService.createFinding,
    getDepartmentScore
  };
};