// src/services/hospitalService.js - COMPLETE IMPLEMENTATION WITH DOCTOR AUTHENTICATION
import api, { hasHospitalModuleAccess, getHealthcareContext } from './api';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the effective hospital ID from various sources
 */
const getEffectiveHospitalId = (hospitalId) => {
  if (hospitalId && hospitalId !== 'undefined') {
    return hospitalId;
  }
  const context = getHealthcareContext();
  if (context.hospitalId && context.hospitalId !== 'undefined') {
    return context.hospitalId;
  }
  return null;
};

/**
 * Check if hospital module is available and throw friendly error if not
 */
const checkHospitalModule = () => {
  if (!hasHospitalModuleAccess()) {
    const error = new Error('Hospital module not set up');
    error.code = 'HOSPITAL_MODULE_NOT_SETUP';
    error.userMessage = 'Please set up your hospital profile first to access healthcare features.';
    error.requiresSetup = true;
    throw error;
  }
};

/**
 * Validate hospital ID and throw error if missing
 */
const validateHospitalId = (hospitalId, context = '') => {
  const effectiveId = getEffectiveHospitalId(hospitalId);
  if (!effectiveId) {
    const error = new Error(`Hospital ID required for ${context}`);
    error.code = 'MISSING_HOSPITAL_ID';
    error.userMessage = 'Hospital ID is required. Please select a hospital first.';
    throw error;
  }
  return effectiveId;
};

// ============================================
// CORE HOSPITAL OPERATIONS
// ============================================

export const getHospitals = async () => {
  try {
    console.log('🔄 Fetching hospitals...');
    const res = await api.get('/hospital');
    console.log('✅ Hospitals data received:', res.data);
    
    let hospitals = [];
    if (Array.isArray(res.data)) {
      hospitals = res.data;
    } else if (res.data && Array.isArray(res.data.hospitals)) {
      hospitals = res.data.hospitals;
    } else if (res.data && Array.isArray(res.data.data)) {
      hospitals = res.data.data;
    }
    
    return hospitals;
  } catch (error) {
    console.error('❌ Error fetching hospitals:', error);
    throw error;
  }
};

export const getHospitalById = async (id) => {
  try {
    const effectiveId = validateHospitalId(id, 'getHospitalById');
    const res = await api.get(`/hospital/${effectiveId}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching hospital ${id}:`, error);
    throw error;
  }
};

export const createHospital = async (data) => {
  try {
    const res = await api.post('/hospital', data);
    if (res.data?.id) {
      localStorage.setItem('hospitalId', res.data.id);
      localStorage.setItem('hospitalModuleSetUp', 'true');
    }
    return res.data;
  } catch (error) {
    console.error('❌ Error creating hospital:', error);
    throw error;
  }
};

export const updateHospital = async (id, data) => {
  try {
    const effectiveId = validateHospitalId(id, 'updateHospital');
    const res = await api.put(`/hospital/${effectiveId}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating hospital ${id}:`, error);
    throw error;
  }
};

export const deleteHospital = async (id) => {
  try {
    const effectiveId = validateHospitalId(id, 'deleteHospital');
    const res = await api.delete(`/hospital/${effectiveId}`);
    if (effectiveId === localStorage.getItem('hospitalId')) {
      localStorage.removeItem('hospitalId');
      localStorage.removeItem('hospitalModuleSetUp');
    }
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting hospital ${id}:`, error);
    throw error;
  }
};

// ============================================
// DEPARTMENT MANAGEMENT
// ============================================

export const getDepartments = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getDepartments');
    console.log(`🔄 Fetching departments for hospital ${effectiveId}...`);
    const res = await api.get(`/hospital/${effectiveId}/departments`);
    console.log('✅ Departments data received:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching departments:', error);
    throw error;
  }
};

export const createDepartment = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createDepartment');
    const res = await api.post(`/hospital/${effectiveId}/departments`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating department:', error);
    throw error;
  }
};

export const updateDepartment = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateDepartment');
    const res = await api.put(`/hospital/${effectiveId}/departments/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating department ${id}:`, error);
    throw error;
  }
};

export const deleteDepartment = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteDepartment');
    const res = await api.delete(`/hospital/${effectiveId}/departments/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting department ${id}:`, error);
    throw error;
  }
};

export const getDepartmentStats = async (departmentId, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getDepartmentStats');
    const res = await api.get(`/hospital/${effectiveId}/departments/${departmentId}/stats`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching stats for department ${departmentId}:`, error);
    throw error;
  }
};

// ============================================
// MEDICAL STAFF MANAGEMENT
// ============================================

export const getMedicalStaff = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getMedicalStaff');
    const res = await api.get(`/hospital/${effectiveId}/staff`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching staff:`, error);
    throw error;
  }
};

export const createMedicalStaff = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createMedicalStaff');
    const res = await api.post(`/hospital/${effectiveId}/staff`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating staff member:', error);
    throw error;
  }
};

export const updateMedicalStaff = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateMedicalStaff');
    const res = await api.put(`/hospital/${effectiveId}/staff/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating staff ${id}:`, error);
    throw error;
  }
};

export const deleteMedicalStaff = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteMedicalStaff');
    const res = await api.delete(`/hospital/${effectiveId}/staff/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting staff ${id}:`, error);
    throw error;
  }
};

// ============================================
// DOCTOR AUTHENTICATION & MANAGEMENT
// ============================================

/**
 * Authenticate a doctor
 * @param {Object} credentials - { email, password }
 * @returns {Promise} Doctor data with auth token
 */
export const authenticateDoctor = async (credentials) => {
  try {
    console.log('🔄 Authenticating doctor...');
    const res = await api.post('/auth/doctor/login', credentials);
    console.log('✅ Doctor authenticated:', res.data);
    
    // Store doctor session
    if (res.data && res.data.data) {
      const doctor = res.data.data;
      sessionStorage.setItem('doctor_authenticated', 'true');
      sessionStorage.setItem('doctor_id', doctor.id);
      sessionStorage.setItem('doctor_name', doctor.name);
      sessionStorage.setItem('doctor_email', doctor.email);
      sessionStorage.setItem('doctor_department', doctor.department);
      sessionStorage.setItem('doctor_specialty', doctor.specialty);
      if (doctor.token) {
        sessionStorage.setItem('doctor_token', doctor.token);
      }
    }
    return res.data;
  } catch (error) {
    console.error('❌ Doctor authentication failed:', error);
    throw error;
  }
};

/**
 * Register a new doctor
 * @param {Object} doctorData - { name, email, password, department, specialty, phone }
 * @returns {Promise} Registered doctor data
 */
export const registerDoctor = async (doctorData) => {
  try {
    console.log('🔄 Registering doctor...');
    const res = await api.post('/auth/doctor/register', doctorData);
    console.log('✅ Doctor registered:', res.data);
    
    // Store doctor session after registration
    if (res.data && res.data.data) {
      const doctor = res.data.data;
      sessionStorage.setItem('doctor_authenticated', 'true');
      sessionStorage.setItem('doctor_id', doctor.id);
      sessionStorage.setItem('doctor_name', doctor.name);
      sessionStorage.setItem('doctor_email', doctor.email);
      sessionStorage.setItem('doctor_department', doctor.department);
      sessionStorage.setItem('doctor_specialty', doctor.specialty);
      if (doctor.token) {
        sessionStorage.setItem('doctor_token', doctor.token);
      }
    }
    return res.data;
  } catch (error) {
    console.error('❌ Doctor registration failed:', error);
    throw error;
  }
};

/**
 * Setup password for new doctor (first time login)
 * @param {Object} data - { employee_id, name, password }
 * @returns {Promise} Doctor data with token
 */
export const setupDoctorPassword = async (data) => {
  try {
    console.log('🔄 Setting up doctor password...');
    const res = await api.post('/auth/doctor/setup-password', data);
    console.log('✅ Password setup successful:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Password setup failed:', error);
    throw error;
  }
};

/**
 * Doctor login with employee_id and password
 * @param {Object} data - { employee_id, password }
 * @returns {Promise} Doctor data with token
 */
export const doctorLogin = async (data) => {
  try {
    console.log('🔄 Doctor logging in...');
    const res = await api.post('/auth/doctor/login', data);
    console.log('✅ Doctor logged in:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Doctor login failed:', error);
    throw error;
  }
};

/**
 * Reset doctor password using employee_id
 * @param {Object} data - { employee_id }
 * @returns {Promise} Reset confirmation
 */
export const resetDoctorPassword = async (data) => {
  try {
    console.log('🔄 Resetting doctor password...');
    const res = await api.post('/auth/doctor/reset-password', data);
    console.log('✅ Password reset email sent');
    return res.data;
  } catch (error) {
    console.error('❌ Password reset failed:', error);
    throw error;
  }
};

/**
 * Get doctor's assigned patients
 * @param {string} doctorId - Doctor ID
 * @returns {Promise} List of assigned patients
 */
export const getDoctorPatients = async (doctorId) => {
  try {
    console.log(`🔄 Fetching patients for doctor ${doctorId}...`);
    const res = await api.get(`/doctor/${doctorId}/patients`);
    console.log('✅ Doctor patients fetched:', res.data);
    
    let patients = [];
    if (res.data && res.data.data) {
      patients = res.data.data;
    } else if (Array.isArray(res.data)) {
      patients = res.data;
    } else if (res.data && res.data.patients) {
      patients = res.data.patients;
    }
    return patients;
  } catch (error) {
    console.error('❌ Error fetching doctor patients:', error);
    throw error;
  }
};

/**
 * Assign a patient to a doctor
 * @param {string} patientId - Patient ID
 * @param {string} doctorId - Doctor ID
 * @returns {Promise} Assignment confirmation
 */
export const assignPatientToDoctor = async (patientId, doctorId) => {
  try {
    console.log(`🔄 Assigning patient ${patientId} to doctor ${doctorId}...`);
    const res = await api.post(`/doctor/${doctorId}/assign-patient`, { patientId });
    console.log('✅ Patient assigned to doctor');
    return res.data;
  } catch (error) {
    console.error('❌ Error assigning patient:', error);
    throw error;
  }
};

/**
 * Get doctor's profile
 * @param {string} doctorId - Doctor ID
 * @returns {Promise} Doctor profile data
 */
export const getDoctorProfile = async (doctorId) => {
  try {
    console.log(`🔄 Fetching doctor profile ${doctorId}...`);
    const res = await api.get(`/doctor/${doctorId}/profile`);
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching doctor profile:', error);
    throw error;
  }
};

/**
 * Update doctor profile
 * @param {string} doctorId - Doctor ID
 * @param {Object} data - Profile update data
 * @returns {Promise} Updated profile
 */
export const updateDoctorProfile = async (doctorId, data) => {
  try {
    console.log(`🔄 Updating doctor profile ${doctorId}...`);
    const res = await api.put(`/doctor/${doctorId}/profile`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error updating doctor profile:', error);
    throw error;
  }
};

// ============================================
// PATIENT MANAGEMENT (Patient Flow)
// ============================================

export const getPatients = async (hospitalId = null, filters = {}) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getPatients');
    const res = await api.get(`/hospital/${effectiveId}/patients`, { params: filters });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
    throw error;
  }
};

export const getPatientById = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getPatientById');
    const res = await api.get(`/hospital/${effectiveId}/patients/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching patient ${id}:`, error);
    throw error;
  }
};

export const createPatient = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createPatient');
    const res = await api.post(`/hospital/${effectiveId}/patients`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating patient:', error);
    throw error;
  }
};

export const updatePatient = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updatePatient');
    const res = await api.put(`/hospital/${effectiveId}/patients/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating patient ${id}:`, error);
    throw error;
  }
};

export const deletePatient = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deletePatient');
    const res = await api.delete(`/hospital/${effectiveId}/patients/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting patient ${id}:`, error);
    throw error;
  }
};

export const admitPatient = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'admitPatient');
    const res = await api.post(`/hospital/${effectiveId}/patients/admit`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error admitting patient:', error);
    throw error;
  }
};

export const dischargePatient = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'dischargePatient');
    const res = await api.post(`/hospital/${effectiveId}/patients/${id}/discharge`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error discharging patient ${id}:`, error);
    throw error;
  }
};

export const transferPatient = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'transferPatient');
    const res = await api.post(`/hospital/${effectiveId}/patients/${id}/transfer`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error transferring patient ${id}:`, error);
    throw error;
  }
};

export const updatePatientStatus = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updatePatientStatus');
    const res = await api.put(`/hospital/${effectiveId}/patients/${id}/status`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating patient status ${id}:`, error);
    throw error;
  }
};

export const getPatientTimeline = async (patientId, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getPatientTimeline');
    const res = await api.get(`/hospital/${effectiveId}/patients/${patientId}/timeline`);
    
    let timelineData = res.data;
    if (timelineData && timelineData.data && Array.isArray(timelineData.data)) {
      return timelineData.data;
    }
    if (Array.isArray(timelineData)) {
      return timelineData;
    }
    return [];
  } catch (error) {
    console.error(`❌ Error fetching patient timeline ${patientId}:`, error);
    return [];
  }
};

export const getPatientVitals = async (patientId, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getPatientVitals');
    const res = await api.get(`/hospital/${effectiveId}/patients/${patientId}/vitals`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching patient vitals ${patientId}:`, error);
    throw error;
  }
};

export const recordPatientVitals = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'recordPatientVitals');
    const res = await api.post(`/hospital/${effectiveId}/patients/vitals`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error recording patient vitals:', error);
    throw error;
  }
};

export const getPatientStatusHistory = async (patientId, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getPatientStatusHistory');
    const res = await api.get(`/hospital/${effectiveId}/patients/${patientId}/status/history`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching patient status history ${patientId}:`, error);
    throw error;
  }
};

export const addPatientTimelineEvent = async (patientId, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'addPatientTimelineEvent');
    const res = await api.post(`/hospital/${effectiveId}/patients/${patientId}/timeline`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error adding patient timeline event ${patientId}:`, error);
    throw error;
  }
};

export const sendCriticalAlert = async (data) => {
  try {
    console.log('🔄 Sending critical alert...');
    const res = await api.post('/alerts/critical', data);
    return res.data;
  } catch (error) {
    console.error('❌ Error sending critical alert:', error);
    throw error;
  }
};

// ============================================
// BED MANAGEMENT
// ============================================

export const getBeds = async (hospitalId = null, filters = {}) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getBeds');
    const res = await api.get(`/hospital/${effectiveId}/beds`, { params: filters });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching beds:', error);
    throw error;
  }
};

export const createBed = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createBed');
    const res = await api.post(`/hospital/${effectiveId}/beds`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating bed:', error);
    throw error;
  }
};

export const updateBed = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateBed');
    const res = await api.put(`/hospital/${effectiveId}/beds/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating bed ${id}:`, error);
    throw error;
  }
};

export const deleteBed = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteBed');
    const res = await api.delete(`/hospital/${effectiveId}/beds/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting bed ${id}:`, error);
    throw error;
  }
};

// ============================================
// ACCREDITATION & QUALITY MANAGEMENT
// ============================================

export const getAccreditations = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getAccreditations');
    const res = await api.get(`/hospital/${effectiveId}/accreditations`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching accreditations:`, error);
    throw error;
  }
};

export const createAccreditation = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createAccreditation');
    const res = await api.post(`/hospital/${effectiveId}/accreditations`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating accreditation:', error);
    throw error;
  }
};

export const updateAccreditation = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateAccreditation');
    const res = await api.put(`/hospital/${effectiveId}/accreditations/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating accreditation ${id}:`, error);
    throw error;
  }
};

export const deleteAccreditation = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteAccreditation');
    const res = await api.delete(`/hospital/${effectiveId}/accreditations/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting accreditation ${id}:`, error);
    throw error;
  }
};

export const getQualityIndicators = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getQualityIndicators');
    const res = await api.get(`/hospital/${effectiveId}/quality-indicators`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching quality indicators:`, error);
    throw error;
  }
};

export const createQualityIndicator = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createQualityIndicator');
    const res = await api.post(`/hospital/${effectiveId}/quality-indicators`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating quality indicator:', error);
    throw error;
  }
};

export const updateQualityIndicator = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateQualityIndicator');
    const res = await api.put(`/hospital/${effectiveId}/quality-indicators/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating quality indicator ${id}:`, error);
    throw error;
  }
};

export const deleteQualityIndicator = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteQualityIndicator');
    const res = await api.delete(`/hospital/${effectiveId}/quality-indicators/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting quality indicator ${id}:`, error);
    throw error;
  }
};

// ============================================
// PATIENT SAFETY GOALS (WHO Standards)
// ============================================

export const getPatientSafetyGoals = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getPatientSafetyGoals');
    const res = await api.get(`/hospital/${effectiveId}/safety-goals`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching safety goals:`, error);
    throw error;
  }
};

export const createPatientSafetyGoal = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createPatientSafetyGoal');
    const res = await api.post(`/hospital/${effectiveId}/safety-goals`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating safety goal:', error);
    throw error;
  }
};

export const updatePatientSafetyGoal = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updatePatientSafetyGoal');
    const res = await api.put(`/hospital/${effectiveId}/safety-goals/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating safety goal ${id}:`, error);
    throw error;
  }
};

export const deletePatientSafetyGoal = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deletePatientSafetyGoal');
    const res = await api.delete(`/hospital/${effectiveId}/safety-goals/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting safety goal ${id}:`, error);
    throw error;
  }
};

// ============================================
// ADVERSE EVENT REPORTING
// ============================================

export const getAdverseEvents = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getAdverseEvents');
    const res = await api.get(`/hospital/${effectiveId}/adverse-events`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching adverse events:`, error);
    throw error;
  }
};

export const reportAdverseEvent = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'reportAdverseEvent');
    const res = await api.post(`/hospital/${effectiveId}/adverse-events`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error reporting adverse event:', error);
    throw error;
  }
};

export const updateAdverseEvent = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateAdverseEvent');
    const res = await api.put(`/hospital/${effectiveId}/adverse-events/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating adverse event ${id}:`, error);
    throw error;
  }
};

export const resolveAdverseEvent = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'resolveAdverseEvent');
    const res = await api.patch(`/hospital/${effectiveId}/adverse-events/${id}/resolve`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error resolving adverse event ${id}:`, error);
    throw error;
  }
};

export const deleteAdverseEvent = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteAdverseEvent');
    const res = await api.delete(`/hospital/${effectiveId}/adverse-events/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting adverse event ${id}:`, error);
    throw error;
  }
};

// ============================================
// RISK ASSESSMENT (FMEA)
// ============================================

export const getRiskAssessments = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getRiskAssessments');
    const res = await api.get(`/hospital/${effectiveId}/risk-assessments`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching risk assessments:`, error);
    throw error;
  }
};

export const createRiskAssessment = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createRiskAssessment');
    const res = await api.post(`/hospital/${effectiveId}/risk-assessments`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating risk assessment:', error);
    throw error;
  }
};

export const updateRiskAssessment = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateRiskAssessment');
    const res = await api.put(`/hospital/${effectiveId}/risk-assessments/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating risk assessment ${id}:`, error);
    throw error;
  }
};

export const deleteRiskAssessment = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteRiskAssessment');
    const res = await api.delete(`/hospital/${effectiveId}/risk-assessments/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting risk assessment ${id}:`, error);
    throw error;
  }
};

// ============================================
// INFECTION CONTROL
// ============================================

export const getInfectionControlData = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getInfectionControlData');
    const res = await api.get(`/hospital/${effectiveId}/infection-control`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching infection control data:`, error);
    throw error;
  }
};

export const createInfectionReport = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createInfectionReport');
    const res = await api.post(`/hospital/${effectiveId}/infection-control/reports`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating infection report:', error);
    throw error;
  }
};

export const updateInfectionProtocol = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateInfectionProtocol');
    const res = await api.put(`/hospital/${effectiveId}/infection-control/protocols/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating infection protocol ${id}:`, error);
    throw error;
  }
};

export const deleteInfectionReport = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteInfectionReport');
    const res = await api.delete(`/hospital/${effectiveId}/infection-control/reports/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting infection report ${id}:`, error);
    throw error;
  }
};

// ============================================
// DISEASE SURVEILLANCE
// ============================================

export const getDiseaseSurveillance = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getDiseaseSurveillance');
    const res = await api.get(`/hospital/${effectiveId}/disease-surveillance`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching disease surveillance:`, error);
    throw error;
  }
};

export const createDisease = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createDisease');
    const res = await api.post(`/hospital/${effectiveId}/diseases`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating disease:', error);
    throw error;
  }
};

export const updateDisease = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateDisease');
    const res = await api.put(`/hospital/${effectiveId}/diseases/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating disease ${id}:`, error);
    throw error;
  }
};

export const deleteDisease = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteDisease');
    const res = await api.delete(`/hospital/${effectiveId}/diseases/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting disease ${id}:`, error);
    throw error;
  }
};

// ============================================
// EMERGENCY PREPAREDNESS (HICS)
// ============================================

export const getEmergencyPreparedness = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getEmergencyPreparedness');
    const res = await api.get(`/hospital/${effectiveId}/emergency-preparedness`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching emergency preparedness:`, error);
    throw error;
  }
};

export const updateEmergencyPlan = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateEmergencyPlan');
    const res = await api.put(`/hospital/${effectiveId}/emergency-plans/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating emergency plan ${id}:`, error);
    throw error;
  }
};

export const reportEmergency = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'reportEmergency');
    const res = await api.post(`/hospital/${effectiveId}/emergencies`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error reporting emergency:', error);
    throw error;
  }
};

export const deleteEmergency = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteEmergency');
    const res = await api.delete(`/hospital/${effectiveId}/emergencies/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting emergency ${id}:`, error);
    throw error;
  }
};

// ============================================
// SAFETY INCIDENTS
// ============================================

export const getSafetyIncidents = async (hospitalId = null, filters = {}) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getSafetyIncidents');
    const res = await api.get(`/hospital/${effectiveId}/safety-incidents`, { params: filters });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching safety incidents:', error);
    throw error;
  }
};

export const reportSafetyIncident = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'reportSafetyIncident');
    const res = await api.post(`/hospital/${effectiveId}/safety-incidents`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error reporting safety incident:', error);
    throw error;
  }
};

export const updateSafetyIncident = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateSafetyIncident');
    const res = await api.put(`/hospital/${effectiveId}/safety-incidents/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating safety incident ${id}:`, error);
    throw error;
  }
};

export const deleteSafetyIncident = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteSafetyIncident');
    const res = await api.delete(`/hospital/${effectiveId}/safety-incidents/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting safety incident ${id}:`, error);
    throw error;
  }
};

// ============================================
// SAFETY INSPECTIONS
// ============================================

export const getSafetyInspections = async (hospitalId = null, filters = {}) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getSafetyInspections');
    const res = await api.get(`/hospital/${effectiveId}/safety-inspections`, { params: filters });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching safety inspections:', error);
    throw error;
  }
};

export const createSafetyInspection = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createSafetyInspection');
    const res = await api.post(`/hospital/${effectiveId}/safety-inspections`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating safety inspection:', error);
    throw error;
  }
};

export const updateSafetyInspection = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateSafetyInspection');
    const res = await api.put(`/hospital/${effectiveId}/safety-inspections/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating safety inspection ${id}:`, error);
    throw error;
  }
};

export const deleteSafetyInspection = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteSafetyInspection');
    const res = await api.delete(`/hospital/${effectiveId}/safety-inspections/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting safety inspection ${id}:`, error);
    throw error;
  }
};

// ============================================
// SAFETY EQUIPMENT
// ============================================

export const getSafetyEquipment = async (hospitalId = null, filters = {}) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getSafetyEquipment');
    const res = await api.get(`/hospital/${effectiveId}/safety-equipment`, { params: filters });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching safety equipment:', error);
    throw error;
  }
};

export const createSafetyEquipment = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createSafetyEquipment');
    const res = await api.post(`/hospital/${effectiveId}/safety-equipment`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating safety equipment:', error);
    throw error;
  }
};

export const updateSafetyEquipment = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateSafetyEquipment');
    const res = await api.put(`/hospital/${effectiveId}/safety-equipment/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating safety equipment ${id}:`, error);
    throw error;
  }
};

export const deleteSafetyEquipment = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteSafetyEquipment');
    const res = await api.delete(`/hospital/${effectiveId}/safety-equipment/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting safety equipment ${id}:`, error);
    throw error;
  }
};

// ============================================
// SAFETY TRAINING
// ============================================

export const getSafetyTrainings = async (hospitalId = null, filters = {}) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getSafetyTrainings');
    const res = await api.get(`/hospital/${effectiveId}/safety-trainings`, { params: filters });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching safety trainings:', error);
    throw error;
  }
};

export const createSafetyTraining = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createSafetyTraining');
    const res = await api.post(`/hospital/${effectiveId}/safety-trainings`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating safety training:', error);
    throw error;
  }
};

export const updateSafetyTraining = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateSafetyTraining');
    const res = await api.put(`/hospital/${effectiveId}/safety-trainings/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating safety training ${id}:`, error);
    throw error;
  }
};

export const deleteSafetyTraining = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteSafetyTraining');
    const res = await api.delete(`/hospital/${effectiveId}/safety-trainings/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting safety training ${id}:`, error);
    throw error;
  }
};

// ============================================
// LAB SAFETY
// ============================================

export const getLabSafety = async (hospitalId = null, filters = {}) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getLabSafety');
    const res = await api.get(`/hospital/${effectiveId}/lab-safety`, { params: filters });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching lab safety:', error);
    throw error;
  }
};

export const createLabSafety = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createLabSafety');
    const res = await api.post(`/hospital/${effectiveId}/lab-safety`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating lab safety:', error);
    throw error;
  }
};

export const updateLabSafety = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateLabSafety');
    const res = await api.put(`/hospital/${effectiveId}/lab-safety/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating lab safety ${id}:`, error);
    throw error;
  }
};

export const deleteLabSafety = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteLabSafety');
    const res = await api.delete(`/hospital/${effectiveId}/lab-safety/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting lab safety ${id}:`, error);
    throw error;
  }
};

// ============================================
// COMPLIANCE
// ============================================

export const getComplianceData = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getComplianceData');
    const res = await api.get(`/hospital/${effectiveId}/compliance`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching compliance data:`, error);
    throw error;
  }
};

export const updateCompliance = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateCompliance');
    const res = await api.put(`/hospital/${effectiveId}/compliance/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating compliance ${id}:`, error);
    throw error;
  }
};

// ============================================
// EVIDENCE-BASED MEDICINE PROTOCOLS
// ============================================

export const getClinicalProtocols = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getClinicalProtocols');
    const res = await api.get(`/hospital/${effectiveId}/clinical-protocols`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching clinical protocols:`, error);
    throw error;
  }
};

export const createClinicalProtocol = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createClinicalProtocol');
    const res = await api.post(`/hospital/${effectiveId}/clinical-protocols`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating clinical protocol:', error);
    throw error;
  }
};

export const updateClinicalProtocol = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateClinicalProtocol');
    const res = await api.put(`/hospital/${effectiveId}/clinical-protocols/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating clinical protocol ${id}:`, error);
    throw error;
  }
};

export const deleteClinicalProtocol = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteClinicalProtocol');
    const res = await api.delete(`/hospital/${effectiveId}/clinical-protocols/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting clinical protocol ${id}:`, error);
    throw error;
  }
};

// ============================================
// CLINICAL TRIALS (GCP Compliant)
// ============================================

export const getClinicalTrials = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getClinicalTrials');
    const res = await api.get(`/hospital/${effectiveId}/clinical-trials`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching clinical trials:`, error);
    throw error;
  }
};

export const createClinicalTrial = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createClinicalTrial');
    const res = await api.post(`/hospital/${effectiveId}/clinical-trials`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating clinical trial:', error);
    throw error;
  }
};

export const updateClinicalTrial = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateClinicalTrial');
    const res = await api.put(`/hospital/${effectiveId}/clinical-trials/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating clinical trial ${id}:`, error);
    throw error;
  }
};

export const deleteClinicalTrial = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteClinicalTrial');
    const res = await api.delete(`/hospital/${effectiveId}/clinical-trials/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting clinical trial ${id}:`, error);
    throw error;
  }
};

// ============================================
// DATA STANDARDS (ICD-11, SNOMED CT, HL7 FHIR)
// ============================================

export const getDataStandards = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getDataStandards');
    const res = await api.get(`/hospital/${effectiveId}/data-standards`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching data standards:`, error);
    throw error;
  }
};

export const createDataStandard = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createDataStandard');
    const res = await api.post(`/hospital/${effectiveId}/data-standards`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating data standard:', error);
    throw error;
  }
};

export const updateDataStandard = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateDataStandard');
    const res = await api.put(`/hospital/${effectiveId}/data-standards/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating data standard ${id}:`, error);
    throw error;
  }
};

export const deleteDataStandard = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteDataStandard');
    const res = await api.delete(`/hospital/${effectiveId}/data-standards/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting data standard ${id}:`, error);
    throw error;
  }
};

// ============================================
// STAFF COMPETENCY MANAGEMENT
// ============================================

export const getStaffCompetencies = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getStaffCompetencies');
    const res = await api.get(`/hospital/${effectiveId}/competencies`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching competencies:`, error);
    throw error;
  }
};

export const createCompetency = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createCompetency');
    const res = await api.post(`/hospital/${effectiveId}/competencies`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating competency:', error);
    throw error;
  }
};

export const updateCompetency = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateCompetency');
    const res = await api.put(`/hospital/${effectiveId}/competencies/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating competency ${id}:`, error);
    throw error;
  }
};

export const deleteCompetency = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteCompetency');
    const res = await api.delete(`/hospital/${effectiveId}/competencies/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting competency ${id}:`, error);
    throw error;
  }
};

// ============================================
// SUSTAINABILITY & GREEN INITIATIVES
// ============================================

export const getSustainabilityMetrics = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getSustainabilityMetrics');
    const res = await api.get(`/hospital/${effectiveId}/sustainability`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching sustainability metrics:`, error);
    throw error;
  }
};

export const createSustainabilityMetric = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createSustainabilityMetric');
    const res = await api.post(`/hospital/${effectiveId}/sustainability`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating sustainability metric:', error);
    throw error;
  }
};

export const updateSustainabilityMetric = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateSustainabilityMetric');
    const res = await api.put(`/hospital/${effectiveId}/sustainability/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating sustainability metric ${id}:`, error);
    throw error;
  }
};

export const deleteSustainabilityMetric = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteSustainabilityMetric');
    const res = await api.delete(`/hospital/${effectiveId}/sustainability/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting sustainability metric ${id}:`, error);
    throw error;
  }
};

// ============================================
// CYBERSECURITY FRAMEWORK
// ============================================

export const getCybersecurityStatus = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getCybersecurityStatus');
    const res = await api.get(`/hospital/${effectiveId}/cybersecurity`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching cybersecurity status:`, error);
    throw error;
  }
};

export const createCybersecurityFramework = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createCybersecurityFramework');
    const res = await api.post(`/hospital/${effectiveId}/cybersecurity`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating cybersecurity framework:', error);
    throw error;
  }
};

export const updateCybersecurityFramework = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateCybersecurityFramework');
    const res = await api.put(`/hospital/${effectiveId}/cybersecurity/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating cybersecurity framework ${id}:`, error);
    throw error;
  }
};

export const deleteCybersecurityFramework = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteCybersecurityFramework');
    const res = await api.delete(`/hospital/${effectiveId}/cybersecurity/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting cybersecurity framework ${id}:`, error);
    throw error;
  }
};

export const reportSecurityIncident = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'reportSecurityIncident');
    const res = await api.post(`/hospital/${effectiveId}/security-incidents`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error reporting security incident:', error);
    throw error;
  }
};

// ============================================
// GLOBAL HEALTH INITIATIVES
// ============================================

export const getGlobalHealthInitiatives = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getGlobalHealthInitiatives');
    const res = await api.get(`/hospital/${effectiveId}/global-health`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching global health initiatives:`, error);
    throw error;
  }
};

export const createGlobalHealthInitiative = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createGlobalHealthInitiative');
    const res = await api.post(`/hospital/${effectiveId}/global-health`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating global health initiative:', error);
    throw error;
  }
};

export const updateGlobalHealthInitiative = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateGlobalHealthInitiative');
    const res = await api.put(`/hospital/${effectiveId}/global-health/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating global health initiative ${id}:`, error);
    throw error;
  }
};

export const deleteGlobalHealthInitiative = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteGlobalHealthInitiative');
    const res = await api.delete(`/hospital/${effectiveId}/global-health/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting global health initiative ${id}:`, error);
    throw error;
  }
};

// ============================================
// MEDICAL EQUIPMENT MANAGEMENT
// ============================================

export const getMedicalEquipment = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getMedicalEquipment');
    const res = await api.get(`/hospital/${effectiveId}/equipment`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching equipment:`, error);
    throw error;
  }
};

export const createMedicalEquipment = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createMedicalEquipment');
    const res = await api.post(`/hospital/${effectiveId}/equipment`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating equipment:', error);
    throw error;
  }
};

export const updateMedicalEquipment = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateMedicalEquipment');
    const res = await api.put(`/hospital/${effectiveId}/equipment/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating equipment ${id}:`, error);
    throw error;
  }
};

export const deleteMedicalEquipment = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteMedicalEquipment');
    const res = await api.delete(`/hospital/${effectiveId}/equipment/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting equipment ${id}:`, error);
    throw error;
  }
};

// ============================================
// PATIENT FEEDBACK
// ============================================

export const getPatientFeedback = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getPatientFeedback');
    const res = await api.get(`/hospital/${effectiveId}/feedback`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching feedback:`, error);
    throw error;
  }
};

export const createPatientFeedback = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createPatientFeedback');
    const res = await api.post(`/hospital/${effectiveId}/feedback`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating feedback:', error);
    throw error;
  }
};

export const updatePatientFeedback = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updatePatientFeedback');
    const res = await api.put(`/hospital/${effectiveId}/feedback/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating feedback ${id}:`, error);
    throw error;
  }
};

export const deletePatientFeedback = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deletePatientFeedback');
    const res = await api.delete(`/hospital/${effectiveId}/feedback/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting feedback ${id}:`, error);
    throw error;
  }
};

// ============================================
// MEDICAL RECORDS
// ============================================

export const getMedicalRecords = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getMedicalRecords');
    const res = await api.get(`/hospital/${effectiveId}/medical-records`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching medical records:`, error);
    throw error;
  }
};

export const createMedicalRecord = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createMedicalRecord');
    const res = await api.post(`/hospital/${effectiveId}/medical-records`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating medical record:', error);
    throw error;
  }
};

export const updateMedicalRecord = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateMedicalRecord');
    const res = await api.put(`/hospital/${effectiveId}/medical-records/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating medical record ${id}:`, error);
    throw error;
  }
};

export const deleteMedicalRecord = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteMedicalRecord');
    const res = await api.delete(`/hospital/${effectiveId}/medical-records/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting medical record ${id}:`, error);
    throw error;
  }
};

// ============================================
// WASTE MANAGEMENT
// ============================================

export const getWasteManagement = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getWasteManagement');
    const res = await api.get(`/hospital/${effectiveId}/waste-management`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching waste management data:`, error);
    throw error;
  }
};

export const createWasteReport = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createWasteReport');
    const res = await api.post(`/hospital/${effectiveId}/waste-reports`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating waste report:', error);
    throw error;
  }
};

export const updateWasteReport = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateWasteReport');
    const res = await api.put(`/hospital/${effectiveId}/waste-reports/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating waste report ${id}:`, error);
    throw error;
  }
};

export const deleteWasteReport = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteWasteReport');
    const res = await api.delete(`/hospital/${effectiveId}/waste-reports/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting waste report ${id}:`, error);
    throw error;
  }
};

// ============================================
// CLINICAL NOTES
// ============================================

export const getClinicalNotes = async (patientId, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getClinicalNotes');
    const res = await api.get(`/hospital/${effectiveId}/patients/${patientId}/clinical-notes`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching clinical notes for patient ${patientId}:`, error);
    throw error;
  }
};

export const createClinicalNote = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createClinicalNote');
    const res = await api.post(`/hospital/${effectiveId}/clinical-notes`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating clinical note:', error);
    throw error;
  }
};

export const updateClinicalNote = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateClinicalNote');
    const res = await api.put(`/hospital/${effectiveId}/clinical-notes/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating clinical note ${id}:`, error);
    throw error;
  }
};

export const deleteClinicalNote = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteClinicalNote');
    const res = await api.delete(`/hospital/${effectiveId}/clinical-notes/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting clinical note ${id}:`, error);
    throw error;
  }
};

// ============================================
// LAB RESULTS
// ============================================

export const getLabResults = async (patientId, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getLabResults');
    const res = await api.get(`/hospital/${effectiveId}/patients/${patientId}/lab-results`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching lab results for patient ${patientId}:`, error);
    throw error;
  }
};

export const createLabResult = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createLabResult');
    const res = await api.post(`/hospital/${effectiveId}/lab-results`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating lab result:', error);
    throw error;
  }
};

export const updateLabResult = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateLabResult');
    const res = await api.put(`/hospital/${effectiveId}/lab-results/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating lab result ${id}:`, error);
    throw error;
  }
};

// ============================================
// IMAGING STUDIES
// ============================================

export const getImagingStudies = async (patientId, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getImagingStudies');
    const res = await api.get(`/hospital/${effectiveId}/patients/${patientId}/imaging-studies`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching imaging studies for patient ${patientId}:`, error);
    throw error;
  }
};

export const createImagingStudy = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createImagingStudy');
    const res = await api.post(`/hospital/${effectiveId}/imaging-studies`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating imaging study:', error);
    throw error;
  }
};

export const updateImagingStudy = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateImagingStudy');
    const res = await api.put(`/hospital/${effectiveId}/imaging-studies/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating imaging study ${id}:`, error);
    throw error;
  }
};

// ============================================
// MEDICATIONS
// ============================================

export const getMedications = async (patientId, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getMedications');
    const res = await api.get(`/hospital/${effectiveId}/patients/${patientId}/medications`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching medications for patient ${patientId}:`, error);
    throw error;
  }
};

export const prescribeMedication = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'prescribeMedication');
    const res = await api.post(`/hospital/${effectiveId}/prescriptions`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error prescribing medication:', error);
    throw error;
  }
};

export const updateMedication = async (id, data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'updateMedication');
    const res = await api.put(`/hospital/${effectiveId}/prescriptions/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating medication ${id}:`, error);
    throw error;
  }
};

export const deleteMedication = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteMedication');
    const res = await api.delete(`/hospital/${effectiveId}/prescriptions/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting medication ${id}:`, error);
    throw error;
  }
};

// ============================================
// AI SERVICES
// ============================================

export const getAIServices = async (hospitalId = null) => {
  try {
    if (!hasHospitalModuleAccess()) {
      console.log('ℹ️ Hospital module not set up. Returning empty AI services.');
      return { 
        success: true, 
        data: [], 
        message: 'Hospital module not set up. Please set up your hospital first.',
        requiresSetup: true
      };
    }
    
    const effectiveId = getEffectiveHospitalId(hospitalId);
    if (!effectiveId) {
      console.warn('⚠️ No hospital ID found for AI services');
      return { success: true, data: [], message: 'No hospital found' };
    }
    
    console.log(`🔄 Fetching AI services for hospital ${effectiveId}...`);
    const res = await api.get(`/hospital/${effectiveId}/ai-services`);
    console.log('✅ AI services data received:', res.data);
    return res.data;
  } catch (error) {
    if (error.code === 'HOSPITAL_MODULE_NOT_SETUP' || error.requiresSetup) {
      return { 
        success: true, 
        data: [], 
        message: error.userMessage || 'Hospital module not set up',
        requiresSetup: true
      };
    }
    console.error('❌ Error fetching AI services:', error);
    throw error;
  }
};

export const getHospitalAICapabilities = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getHospitalAICapabilities');
    const res = await api.get(`/hospital/${effectiveId}/ai-capabilities`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching AI capabilities:`, error);
    throw error;
  }
};

export const enableAIService = async (hospitalId, serviceName) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'enableAIService');
    const res = await api.post(`/hospital/${effectiveId}/ai-services/enable`, { serviceName });
    return res.data;
  } catch (error) {
    console.error(`❌ Error enabling AI service ${serviceName}:`, error);
    throw error;
  }
};

export const updateAIServiceStatus = async (hospitalId, serviceName, status) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'updateAIServiceStatus');
    const res = await api.patch(`/hospital/${effectiveId}/ai-services/${serviceName}`, { status });
    return res.data;
  } catch (error) {
    console.error(`❌ Error updating AI service ${serviceName}:`, error);
    throw error;
  }
};

export const getAIAnalytics = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getAIAnalytics');
    const res = await api.get(`/hospital/${effectiveId}/ai-analytics`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching AI analytics:`, error);
    throw error;
  }
};

// ============================================
// ANALYTICS & REPORTS
// ============================================

export const getHospitalAnalytics = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getHospitalAnalytics');
    const res = await api.get(`/hospital/${effectiveId}/analytics`);
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching hospital analytics:', error);
    throw error;
  }
};

export const getComplianceReport = async (hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getComplianceReport');
    const res = await api.get(`/hospital/${effectiveId}/compliance-report`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching compliance report:`, error);
    throw error;
  }
};

export const generateQualityReport = async (hospitalId, dateRange) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'generateQualityReport');
    const res = await api.post(`/hospital/${effectiveId}/quality-report`, dateRange);
    return res.data;
  } catch (error) {
    console.error(`❌ Error generating quality report:`, error);
    throw error;
  }
};

// ============================================
// AUDIT & LOGGING
// ============================================

export const getAuditLogs = async (hospitalId = null, filters = {}) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getAuditLogs');
    const res = await api.get(`/hospital/${effectiveId}/audit-logs`, { params: filters });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching audit logs:', error);
    throw error;
  }
};

export const createAuditLog = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createAuditLog');
    const res = await api.post(`/hospital/${effectiveId}/audit-logs`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating audit log:', error);
    throw error;
  }
};

// ============================================
// NOTIFICATIONS
// ============================================

export const getNotifications = async (hospitalId = null, filters = {}) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getNotifications');
    const res = await api.get(`/hospital/${effectiveId}/notifications`, { params: filters });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    throw error;
  }
};

export const createNotification = async (data) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(data.hospitalId, 'createNotification');
    const res = await api.post(`/hospital/${effectiveId}/notifications`, data);
    return res.data;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

export const getCompanyMedicalStaff = async (companyId) => {
  try {
    const res = await api.get(`/companies/${companyId}/medical-staff`);
    return res.data;
  } catch (error) {
    console.error('Error fetching company medical staff:', error);
    throw error;
  }
};

export const getHospitalMedicalStaff = async (hospitalId) => {
  try {
    const res = await api.get(`/hospital/${hospitalId}/medical-staff`);
    return res.data;
  } catch (error) {
    console.error('Error fetching hospital medical staff:', error);
    throw error;
  }
};

export const markNotificationRead = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'markNotificationRead');
    const res = await api.patch(`/hospital/${effectiveId}/notifications/${id}/read`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error marking notification ${id} as read:`, error);
    throw error;
  }
};

export const deleteNotification = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteNotification');
    const res = await api.delete(`/hospital/${effectiveId}/notifications/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting notification ${id}:`, error);
    throw error;
  }
};

/**
 * Verify doctor exists in system by employee ID and name
 * @param {Object} data - { employee_id, name }
 * @returns {Promise} Doctor verification data
 */
export const verifyDoctor = async (data) => {
  try {
    console.log('🔄 Verifying doctor...', data);
    const res = await api.post('/auth/doctor/verify', data);
    console.log('✅ Doctor verified:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Doctor verification failed:', error);
    throw error;
  }
};


// ============================================
// REPORTS
// ============================================

export const generateReport = async (type, params = {}) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(params.hospitalId, 'generateReport');
    const res = await api.post(`/hospital/${effectiveId}/reports/${type}`, params);
    return res.data;
  } catch (error) {
    console.error(`❌ Error generating ${type} report:`, error);
    throw error;
  }
};

export const getReports = async (hospitalId = null, filters = {}) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'getReports');
    const res = await api.get(`/hospital/${effectiveId}/reports`, { params: filters });
    return res.data;
  } catch (error) {
    console.error('❌ Error fetching reports:', error);
    throw error;
  }
};



const getHospitalDisplayName = () => {
  // Get from session storage
  const hospitalId = sessionStorage.getItem('hospital_id');
  if (hospitalId && hospitals.length > 0) {
    const hospital = hospitals.find(h => h.id == hospitalId);
    if (hospital) return hospital.name;
  }
  // Fallback to first hospital
  if (hospitals.length > 0) {
    return hospitals[0].name || 'Hospital';
  }
  return 'Hospital';
};

export const deleteReport = async (id, hospitalId = null) => {
  try {
    checkHospitalModule();
    const effectiveId = validateHospitalId(hospitalId, 'deleteReport');
    const res = await api.delete(`/hospital/${effectiveId}/reports/${id}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error deleting report ${id}:`, error);
    throw error;
  }
};




// ============================================
// HOSPITAL SERVICE OBJECT - COMPLETE
// ============================================

export const hospitalService = {
  // Core hospital operations
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  
  

  
  // Department Management
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
  
  // Medical Staff
  getMedicalStaff,
  createMedicalStaff,
  updateMedicalStaff,
  deleteMedicalStaff,
  
  // Doctor Authentication & Management
  authenticateDoctor,
  registerDoctor,
  resetDoctorPassword,
  getDoctorPatients,
  assignPatientToDoctor,
  getDoctorProfile,
  updateDoctorProfile,
  
  // Patient Management
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  admitPatient,
  dischargePatient,
  transferPatient,
  updatePatientStatus,
  getPatientTimeline,
  getPatientVitals,
  recordPatientVitals,
  getPatientStatusHistory,
  addPatientTimelineEvent,
  sendCriticalAlert,
  getCompanyMedicalStaff,
  getHospitalMedicalStaff,
  // Bed Management
  getBeds,
  createBed,
  updateBed,
  deleteBed,
  
  // Accreditation & Quality
  getAccreditations,
  createAccreditation,
  updateAccreditation,
  deleteAccreditation,
  getQualityIndicators,
  createQualityIndicator,
  updateQualityIndicator,
  deleteQualityIndicator,
  
  // Patient Safety Goals
  getPatientSafetyGoals,
  createPatientSafetyGoal,
  updatePatientSafetyGoal,
  deletePatientSafetyGoal,
  
  // Adverse Event Reporting
  getAdverseEvents,
  reportAdverseEvent,
  updateAdverseEvent,
  resolveAdverseEvent,
  deleteAdverseEvent,
  
  // Risk Assessment
  getRiskAssessments,
  createRiskAssessment,
  updateRiskAssessment,
  deleteRiskAssessment,
  
  // Infection Control
  getInfectionControlData,
  createInfectionReport,
  updateInfectionProtocol,
  deleteInfectionReport,
  getHospitalDisplayName,
  // Disease Surveillance
  getDiseaseSurveillance,
  createDisease,
  updateDisease,
  deleteDisease,
  
  // Emergency Preparedness
  getEmergencyPreparedness,
  updateEmergencyPlan,
  reportEmergency,
  deleteEmergency,
  
  // Safety Incidents
  getSafetyIncidents,
  reportSafetyIncident,
  updateSafetyIncident,
  deleteSafetyIncident,
  
  // Safety Inspections
  getSafetyInspections,
  createSafetyInspection,
  updateSafetyInspection,
  deleteSafetyInspection,
  
  // Safety Equipment
  getSafetyEquipment,
  createSafetyEquipment,
  updateSafetyEquipment,
  deleteSafetyEquipment,
  
  // Safety Training
  getSafetyTrainings,
  createSafetyTraining,
  updateSafetyTraining,
  deleteSafetyTraining,
  
  // Lab Safety
  getLabSafety,
  createLabSafety,
  updateLabSafety,
  deleteLabSafety,
  
  // Compliance
  getComplianceData,
  updateCompliance,
  
  // Clinical Protocols
  getClinicalProtocols,
  createClinicalProtocol,
  updateClinicalProtocol,
  deleteClinicalProtocol,
  
  // Clinical Trials
  getClinicalTrials,
  createClinicalTrial,
  updateClinicalTrial,
  deleteClinicalTrial,
  
  // Data Standards
  getDataStandards,
  createDataStandard,
  updateDataStandard,
  deleteDataStandard,
  verifyDoctor,           
  setupDoctorPassword,    
  doctorLogin, 
  // Staff Competency
  getStaffCompetencies,
  createCompetency,
  updateCompetency,
  deleteCompetency,
  
  // Sustainability
  getSustainabilityMetrics,
  createSustainabilityMetric,
  updateSustainabilityMetric,
  deleteSustainabilityMetric,
  
  // Cybersecurity
  getCybersecurityStatus,
  createCybersecurityFramework,
  updateCybersecurityFramework,
  deleteCybersecurityFramework,
  reportSecurityIncident,
  
  // Global Health
  getGlobalHealthInitiatives,
  createGlobalHealthInitiative,
  updateGlobalHealthInitiative,
  deleteGlobalHealthInitiative,
  
  // Medical Equipment
  getMedicalEquipment,
  createMedicalEquipment,
  updateMedicalEquipment,
  deleteMedicalEquipment,
  
  // Patient Feedback
  getPatientFeedback,
  createPatientFeedback,
  updatePatientFeedback,
  deletePatientFeedback,
  
  // Medical Records
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  
  // Waste Management
  getWasteManagement,
  createWasteReport,
  updateWasteReport,
  deleteWasteReport,
  
  // Clinical Notes
  getClinicalNotes,
  createClinicalNote,
  updateClinicalNote,
  deleteClinicalNote,
  
  // Lab Results
  getLabResults,
  createLabResult,
  updateLabResult,
  
  // Imaging Studies
  getImagingStudies,
  createImagingStudy,
  updateImagingStudy,
  
  // Medications
  getMedications,
  prescribeMedication,
  updateMedication,
  deleteMedication,
  
  // AI Services
  getAIServices,
  getHospitalAICapabilities,
  enableAIService,
  updateAIServiceStatus,
  getAIAnalytics,
  
  // Analytics & Reports
  getHospitalAnalytics,
  getComplianceReport,
  generateQualityReport,
  
  // Audit & Logging
  getAuditLogs,
  createAuditLog,
  
  // Notifications
  getNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,
  
  // Reports
  generateReport,
  getReports,
  deleteReport,
  
  // Legacy/Compatibility methods
  getHospitalIncidents: getSafetyIncidents,
  reportBiohazardIncident: createWasteReport,
  getIncidents: getSafetyIncidents,
  reportIncident: reportSafetyIncident,
  updateIncident: updateSafetyIncident,
  resolveIncident: resolveAdverseEvent,
  getProtocols: getInfectionControlData,
  createProtocol: createInfectionReport,
  updateProtocol: updateInfectionProtocol,
};

export default hospitalService;