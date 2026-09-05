// src/utils/formatters.js
export const formatDate = (dateString, format = 'short') => {
  const date = new Date(dateString);
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    time: { hour: '2-digit', minute: '2-digit' }
  };
  
  return date.toLocaleDateString('en-US', options[format] || options.short);
};

export const formatNumber = (number, decimals = 0) => {
  return new Intl.NumberFormat('en-US').format(number.toFixed(decimals));
};

export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(1)}%`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};