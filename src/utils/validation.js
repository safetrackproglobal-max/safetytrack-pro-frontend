// src/utils/validators.js
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateIncidentData = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) errors.title = 'Title is required';
  if (!data.description?.trim()) errors.description = 'Description is required';
  if (!data.type) errors.type = 'Incident type is required';
  if (!data.severity) errors.severity = 'Severity level is required';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateDocumentData = (data) => {
  const errors = {};
  
  if (!data.prompt?.trim()) errors.prompt = 'Prompt is required';
  if (!data.template) errors.template = 'Template is required';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};