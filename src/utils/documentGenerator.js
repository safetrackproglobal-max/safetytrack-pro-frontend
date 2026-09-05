// src/utils/documentGenerator.js

// Memoization cache for expensive Intl operations
const formatCache = new Map();

const getLocalizedTemplate = (template, language) => {
  const availableLanguages = ['en', 'es', 'fr', 'ar', 'zh', 'hi', 'pt', 'ru', 'ja', 'de'];
  
  if (!template || typeof template !== 'object') {
    return '';
  }
  
  // Try requested language first
  if (template[language]) return template[language];
  
  // Fallback to English
  if (template.en) return template.en;
  
  // Fallback to any available language
  for (const lang of availableLanguages) {
    if (template[lang]) return template[lang];
  }
  
  // Last resort: return first template value
  return Object.values(template)[0] || '';
};

const formatDate = (date, language) => {
  const cacheKey = `date-${language}-${date}`;
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey);
  }

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return String(date);
    }

    const formatter = new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formatted = formatter.format(dateObj);
    formatCache.set(cacheKey, formatted);
    return formatted;
  } catch (error) {
    console.warn(`Date formatting error for language ${language}:`, error);
    return String(date);
  }
};

const formatNumbers = (number, language) => {
  const cacheKey = `number-${language}-${number}`;
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey);
  }

  try {
    const num = typeof number === 'string' ? parseFloat(number) : number;
    if (isNaN(num)) {
      return String(number);
    }

    const formatter = new Intl.NumberFormat(language);
    const formatted = formatter.format(num);
    formatCache.set(cacheKey, formatted);
    return formatted;
  } catch (error) {
    console.warn(`Number formatting error for language ${language}:`, error);
    return String(number);
  }
};

const formatCurrency = (amount, language, currency) => {
  const cacheKey = `currency-${language}-${amount}-${currency}`;
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey);
  }

  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) {
      return String(amount);
    }

    const defaultCurrencies = {
      'en': 'USD', 'es': 'EUR', 'fr': 'EUR', 'de': 'EUR',
      'ja': 'JPY', 'zh': 'CNY', 'ru': 'RUB', 'ar': 'SAR',
      'hi': 'INR', 'pt': 'BRL'
    };
    
    const effectiveCurrency = currency || defaultCurrencies[language] || 'USD';
    
    const formatter = new Intl.NumberFormat(language, {
      style: 'currency',
      currency: effectiveCurrency
    });
    
    const formatted = formatter.format(num);
    formatCache.set(cacheKey, formatted);
    return formatted;
  } catch (error) {
    console.warn(`Currency formatting error for language ${language}:`, error);
    return String(amount);
  }
};

const localizeData = (data, language) => {
  const safeData = data || {};
  const localized = { ...safeData };
  
  // Handle date fields (any field containing 'date' in name)
  Object.keys(safeData).forEach(key => {
    if (key.toLowerCase().includes('date') && safeData[key]) {
      localized[key] = formatDate(safeData[key], language);
    }
    
    if (key.toLowerCase().includes('amount') && safeData[key]) {
      localized[key] = formatCurrency(safeData[key], language, safeData.currency);
    }
    
    if (key.toLowerCase().includes('number') && safeData[key]) {
      localized[key] = formatNumbers(safeData[key], language);
    }
  });
  
  // Ensure basic fields are formatted
  if (safeData.date && !localized.date) {
    localized.date = formatDate(safeData.date, language);
  }
  
  if (safeData.amount && !localized.amount) {
    localized.amount = formatCurrency(safeData.amount, language, safeData.currency);
  }
  
  if (safeData.numbers && !localized.numbers) {
    localized.numbers = formatNumbers(safeData.numbers, language);
  }
  
  return localized;
};

const generateLocalizedContent = (template, data, language) => {
  if (!template || typeof template !== 'string') {
    return '';
  }
  
  const localizedData = localizeData(data, language);
  
  return template.replace(/\{\{(\w+\.?\w*)\}\}/g, (match, key) => {
    try {
      // Handle nested object paths like user.name or address.street
      const value = key.split('.').reduce((obj, prop) => {
        return obj && obj[prop];
      }, localizedData);
      
      return value !== undefined && value !== null ? String(value) : match;
    } catch (error) {
      console.warn(`Error accessing data key ${key}:`, error);
      return match;
    }
  });
};

// Main export - accepts language as parameter
export const generateDocument = (template, data, language) => {
  try {
    if (!template || !language) {
      throw new Error('Template and language are required');
    }
    
    const localizedTemplate = getLocalizedTemplate(template, language);
    return generateLocalizedContent(localizedTemplate, data, language);
  } catch (error) {
    console.error('Document generation error:', error);
    return '';
  }
};

// Hook version for React components
export const useDocumentGenerator = () => {
  const { currentLanguage } = useLanguage();
  
  const generateDocumentWithHook = (template, data) => {
    return generateDocument(template, data, currentLanguage);
  };
  
  return { generateDocument: generateDocumentWithHook, currentLanguage };
};

// Utility function to clear cache
export const clearFormatCache = () => {
  formatCache.clear();
};

// Helper function to validate template structure
export const validateTemplate = (template) => {
  if (!template || typeof template !== 'object') {
    return { isValid: false, error: 'Template must be an object' };
  }
  
  const availableLanguages = ['en', 'es', 'fr', 'ar', 'zh', 'hi', 'pt', 'ru', 'ja', 'de'];
  const hasValidLanguage = availableLanguages.some(lang => template[lang]);
  
  return {
    isValid: hasValidLanguage,
    missingLanguages: availableLanguages.filter(lang => !template[lang]),
    availableLanguages: availableLanguages.filter(lang => template[lang])
  };
};