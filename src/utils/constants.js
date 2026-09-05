// src/utils/constants.js
export const USER_ROLES = {
  EMPLOYEE: 'employee',
  USER: 'user',
  ADMIN: 'admin'
};

export const MODULES = {
  HOSPITAL: 'hospital',
  HSE: 'hse',
  ENVIRONMENTAL: 'environmental',
  QUALITY: 'quality',
  SUPPLYCHAIN: 'supplychain'
};

export const SUPPLY_CHAIN_STATUS = {
  PROCESSING: 'processing',
  IN_TRANSIT: 'in-transit',
  DELIVERED: 'delivered',
  DELAYED: 'delayed',
  CANCELLED: 'cancelled'
};

export const INVENTORY_STATUS = {
  ADEQUATE: 'adequate',
  LOW: 'low',
  CRITICAL: 'critical',
  OUT_OF_STOCK: 'out-of-stock'
};

export const INCIDENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const INCIDENT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved'
};

export const AI_TEMPLATES = {
  INCIDENT_REPORT: 'incident',
  RISK_ASSESSMENT: 'risk',
  COMPLIANCE_REPORT: 'compliance',
  SAFETY_PROCEDURE: 'safety'
};

export const ANALYTICS_TIMEFRAMES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};