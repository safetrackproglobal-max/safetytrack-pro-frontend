// src/services/enterpriseService.js
import api from './api';
import { auditService } from './auditService';

// ============================================
// ENTERPRISE SERVICE - COMBINED
// ============================================

class EnterpriseService {
  constructor() {
    this.audit = auditService;
  }

  // ============================================
  // PATIENT MANAGEMENT
  // ============================================
  async getPatients(filters = {}) {
    try {
      const res = await api.get('/enterprise/patients', { params: filters });
      return res.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async getPatient(id) {
    try {
      const res = await api.get(`/enterprise/patients/${id}`);
      await this.audit.logAction({
        action: 'patient.viewed',
        resourceType: 'patient',
        resourceId: id,
        details: { patientName: res.data.name }
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  }

  async createPatient(data) {
    try {
      const res = await api.post('/enterprise/patients', data);
      await this.audit.logAction({
        action: 'patient.created',
        resourceType: 'patient',
        resourceId: res.data.id,
        details: { patientName: data.name }
      });
      return res.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(id, data) {
    try {
      const res = await api.put(`/enterprise/patients/${id}`, data);
      await this.audit.logAction({
        action: 'patient.updated',
        resourceType: 'patient',
        resourceId: id,
        details: { updates: Object.keys(data) }
      });
      return res.data;
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  }

  // ============================================
  // CLINICAL RECORDS
  // ============================================
  async getClinicalNotes(patientId) {
    try {
      const res = await api.get(`/enterprise/patients/${patientId}/notes`);
      return res.data;
    } catch (error) {
      console.error('Error fetching clinical notes:', error);
      return [];
    }
  }

  async createClinicalNote(data) {
    try {
      const res = await api.post('/enterprise/clinical-notes', data);
      await this.audit.logAction({
        action: 'clinical_note.created',
        resourceType: 'clinical_note',
        resourceId: res.data.id,
        details: { patientId: data.patientId, type: data.type }
      });
      return res.data;
    } catch (error) {
      console.error('Error creating clinical note:', error);
      throw error;
    }
  }

  async getLabResults(patientId) {
    try {
      const res = await api.get(`/enterprise/patients/${patientId}/labs`);
      return res.data;
    } catch (error) {
      console.error('Error fetching lab results:', error);
      return [];
    }
  }

  async orderLabTest(data) {
    try {
      const res = await api.post('/enterprise/lab-orders', data);
      await this.audit.logAction({
        action: 'lab.ordered',
        resourceType: 'lab_order',
        resourceId: res.data.id,
        details: { patientId: data.patientId, test: data.testName }
      });
      return res.data;
    } catch (error) {
      console.error('Error ordering lab test:', error);
      throw error;
    }
  }

  async getImagingStudies(patientId) {
    try {
      const res = await api.get(`/enterprise/patients/${patientId}/imaging`);
      return res.data;
    } catch (error) {
      console.error('Error fetching imaging studies:', error);
      return [];
    }
  }

  async orderImagingStudy(data) {
    try {
      const res = await api.post('/enterprise/imaging-orders', data);
      await this.audit.logAction({
        action: 'imaging.ordered',
        resourceType: 'imaging_order',
        resourceId: res.data.id,
        details: { patientId: data.patientId, study: data.studyType }
      });
      return res.data;
    } catch (error) {
      console.error('Error ordering imaging study:', error);
      throw error;
    }
  }

  async getMedications(patientId) {
    try {
      const res = await api.get(`/enterprise/patients/${patientId}/medications`);
      return res.data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      return [];
    }
  }

  async prescribeMedication(data) {
    try {
      const res = await api.post('/enterprise/prescriptions', data);
      await this.audit.logAction({
        action: 'medication.prescribed',
        resourceType: 'prescription',
        resourceId: res.data.id,
        details: { patientId: data.patientId, medication: data.medication }
      });
      return res.data;
    } catch (error) {
      console.error('Error prescribing medication:', error);
      throw error;
    }
  }

  async getVitalSigns(patientId) {
    try {
      const res = await api.get(`/enterprise/patients/${patientId}/vitals`);
      return res.data;
    } catch (error) {
      console.error('Error fetching vital signs:', error);
      return [];
    }
  }

  async recordVitalSigns(data) {
    try {
      const res = await api.post('/enterprise/vital-signs', data);
      return res.data;
    } catch (error) {
      console.error('Error recording vital signs:', error);
      throw error;
    }
  }

  // ============================================
  // FINANCIAL MANAGEMENT
  // ============================================
  async getFinancialSummary() {
    try {
      const res = await api.get('/enterprise/financial/summary');
      return res.data;
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      return null;
    }
  }

  async getClaims(filters = {}) {
    try {
      const res = await api.get('/enterprise/financial/claims', { params: filters });
      return res.data;
    } catch (error) {
      console.error('Error fetching claims:', error);
      return [];
    }
  }

  async submitClaim(data) {
    try {
      const res = await api.post('/enterprise/financial/claims', data);
      await this.audit.logAction({
        action: 'claim.submitted',
        resourceType: 'claim',
        resourceId: res.data.id,
        details: { patientId: data.patientId, amount: data.amount }
      });
      return res.data;
    } catch (error) {
      console.error('Error submitting claim:', error);
      throw error;
    }
  }

  async getInvoices(filters = {}) {
    try {
      const res = await api.get('/enterprise/financial/invoices', { params: filters });
      return res.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  async createInvoice(data) {
    try {
      const res = await api.post('/enterprise/financial/invoices', data);
      await this.audit.logAction({
        action: 'invoice.created',
        resourceType: 'invoice',
        resourceId: res.data.id,
        details: { patientId: data.patientId, amount: data.amount }
      });
      return res.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // ============================================
  // AI & PREDICTIONS
  // ============================================
  async getPredictions(type, filters = {}) {
    try {
      const res = await api.get(`/enterprise/ai/predictions/${type}`, { params: filters });
      return res.data;
    } catch (error) {
      console.error(`Error fetching ${type} predictions:`, error);
      return [];
    }
  }

  async analyzeSymptoms(symptoms) {
    try {
      const res = await api.post('/enterprise/ai/symptom-analysis', { symptoms });
      return res.data;
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw error;
    }
  }

  async getRealWorldEvidence(condition, filters = {}) {
    try {
      const res = await api.post('/enterprise/ai/real-world-evidence', { condition, filters });
      return res.data;
    } catch (error) {
      console.error('Error fetching real-world evidence:', error);
      return null;
    }
  }

  // ============================================
  // ACCREDITATION & QUALITY
  // ============================================
  async getAccreditations() {
    try {
      const res = await api.get('/enterprise/accreditations');
      return res.data;
    } catch (error) {
      console.error('Error fetching accreditations:', error);
      return [];
    }
  }

  async updateAccreditation(id, data) {
    try {
      const res = await api.put(`/enterprise/accreditations/${id}`, data);
      await this.audit.logAction({
        action: 'accreditation.updated',
        resourceType: 'accreditation',
        resourceId: id,
        details: { status: data.status }
      });
      return res.data;
    } catch (error) {
      console.error(`Error updating accreditation ${id}:`, error);
      throw error;
    }
  }

  async getQualityIndicators() {
    try {
      const res = await api.get('/enterprise/quality-indicators');
      return res.data;
    } catch (error) {
      console.error('Error fetching quality indicators:', error);
      return [];
    }
  }

  async updateQualityIndicator(id, data) {
    try {
      const res = await api.put(`/enterprise/quality-indicators/${id}`, data);
      return res.data;
    } catch (error) {
      console.error(`Error updating quality indicator ${id}:`, error);
      throw error;
    }
  }

  // ============================================
  // STAFF & COMPETENCY
  // ============================================
  async getStaff() {
    try {
      const res = await api.get('/enterprise/staff');
      return res.data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  }

  async createStaff(data) {
    try {
      const res = await api.post('/enterprise/staff', data);
      await this.audit.logAction({
        action: 'staff.created',
        resourceType: 'staff',
        resourceId: res.data.id,
        details: { name: data.name, role: data.role }
      });
      return res.data;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  }

  async getCompetencies() {
    try {
      const res = await api.get('/enterprise/competencies');
      return res.data;
    } catch (error) {
      console.error('Error fetching competencies:', error);
      return [];
    }
  }

  async updateCompetency(id, data) {
    try {
      const res = await api.put(`/enterprise/competencies/${id}`, data);
      return res.data;
    } catch (error) {
      console.error(`Error updating competency ${id}:`, error);
      throw error;
    }
  }

  // ============================================
  // EMERGENCY & RISK
  // ============================================
  async getEmergencies() {
    try {
      const res = await api.get('/enterprise/emergencies');
      return res.data;
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      return [];
    }
  }

  async reportEmergency(data) {
    try {
      const res = await api.post('/enterprise/emergencies', data);
      await this.audit.logAction({
        action: 'emergency.reported',
        resourceType: 'emergency',
        resourceId: res.data.id,
        details: { type: data.type, location: data.location }
      });
      return res.data;
    } catch (error) {
      console.error('Error reporting emergency:', error);
      throw error;
    }
  }

  async getRiskAssessments() {
    try {
      const res = await api.get('/enterprise/risk-assessments');
      return res.data;
    } catch (error) {
      console.error('Error fetching risk assessments:', error);
      return [];
    }
  }

  // ============================================
  // INFECTION & DISEASE CONTROL
  // ============================================
  async getInfections() {
    try {
      const res = await api.get('/enterprise/infections');
      return res.data;
    } catch (error) {
      console.error('Error fetching infections:', error);
      return [];
    }
  }

  async reportInfection(data) {
    try {
      const res = await api.post('/enterprise/infections', data);
      await this.audit.logAction({
        action: 'infection.reported',
        resourceType: 'infection',
        resourceId: res.data.id,
        details: { type: data.type, department: data.department }
      });
      return res.data;
    } catch (error) {
      console.error('Error reporting infection:', error);
      throw error;
    }
  }

  async getDiseases() {
    try {
      const res = await api.get('/enterprise/diseases');
      return res.data;
    } catch (error) {
      console.error('Error fetching diseases:', error);
      return [];
    }
  }

  // ============================================
  // SUSTAINABILITY
  // ============================================
  async getSustainabilityMetrics() {
    try {
      const res = await api.get('/enterprise/sustainability');
      return res.data;
    } catch (error) {
      console.error('Error fetching sustainability metrics:', error);
      return null;
    }
  }

  // ============================================
  // SYSTEM ADMIN
  // ============================================
  async getAuditLogs(filters = {}) {
    try {
      const res = await api.get('/enterprise/audit-logs', { params: filters });
      return res.data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  async getSystemHealth() {
    try {
      const res = await api.get('/enterprise/system/health');
      return res.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      return null;
    }
  }

  async getIntegrations() {
    try {
      const res = await api.get('/enterprise/integrations');
      return res.data;
    } catch (error) {
      console.error('Error fetching integrations:', error);
      return [];
    }
  }
}

export const enterpriseService = new EnterpriseService();
export default enterpriseService;