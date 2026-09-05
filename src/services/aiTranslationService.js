// src/services/AITranslationService.js
import i18n from '../i18n';

class AITranslationService {
  /**
   * Translate AI response on frontend (fallback if backend doesn't translate)
   */
  static translateResponse(response) {
    const currentLanguage = i18n.language || 'en';
    
    // If already in English or no response
    if (currentLanguage === 'en' || !response) {
      return response;
    }
    
    // If response has translations
    if (response.translations && response.translations[currentLanguage]) {
      return response.translations[currentLanguage];
    }
    
    // If response is a string
    if (typeof response === 'string') {
      return this.translateText(response, currentLanguage);
    }
    
    // If response is an array
    if (Array.isArray(response)) {
      return response.map(item => this.translateResponse(item));
    }
    
    // If response is an object
    if (typeof response === 'object') {
      return this.translateObject(response, currentLanguage);
    }
    
    return response;
  }
  
  /**
   * Translate text using i18n
   */
  static translateText(text, lang) {
    if (!text) return text;
    if (typeof text !== 'string') return text;
    
    // Try to get translation from i18n
    const translation = i18n.t(text, { defaultValue: text });
    
    // If translation is different, use it
    if (translation !== text) {
      return translation;
    }
    
    // Try to translate by splitting into words (for dynamic content)
    const words = text.split(' ');
    const translatedWords = words.map(word => {
      const translatedWord = i18n.t(word, { defaultValue: word });
      return translatedWord;
    });
    
    const result = translatedWords.join(' ');
    
    // If translation produced a different result, use it
    if (result !== text) {
      return result;
    }
    
    return text;
  }
  
  /**
   * Translate object with common AI response fields
   */
  static translateObject(obj, lang) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const translated = { ...obj };
    
    // Common AI response fields to translate
    const fieldsToTranslate = [
      'text', 'message', 'analysis', 'result',
      'description', 'summary', 'explanation',
      'recommendation', 'suggestion', 'warning',
      'error', 'success_message', 'content',
      'title', 'heading', 'subheading',
      'response', 'answer', 'reply',
      'detail', 'details', 'info',
      'note', 'notes', 'comment',
      'feedback', 'evaluation', 'assessment',
      'conclusion', 'findings', 'observations'
    ];
    
    // Translate string fields
    fieldsToTranslate.forEach(field => {
      if (translated[field] && typeof translated[field] === 'string') {
        translated[field] = this.translateText(translated[field], lang);
      }
    });
    
    // Handle nested objects
    for (const key in translated) {
      if (translated[key] && typeof translated[key] === 'object') {
        if (Array.isArray(translated[key])) {
          translated[key] = translated[key].map(item => 
            typeof item === 'string' ? this.translateText(item, lang) : this.translateObject(item, lang)
          );
        } else {
          translated[key] = this.translateObject(translated[key], lang);
        }
      }
    }
    
    return translated;
  }
  
  /**
   * Get current language for AI processing
   */
  static getCurrentLanguage() {
    return i18n.language || 'en';
  }
  
  /**
   * Get language direction (RTL/LTR)
   */
  static getLanguageDirection() {
    const lang = i18n.language || 'en';
    const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ps', 'syr'];
    return rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
  }
  
  /**
   * Check if current language is RTL
   */
  static isRTL() {
    return this.getLanguageDirection() === 'rtl';
  }
  
  /**
   * Get language display name
   */
  static getLanguageDisplayName() {
    const lang = i18n.language || 'en';
    const languageNames = {
      en: 'English',
      ar: 'العربية',
      de: 'Deutsch',
      es: 'Español',
      fr: 'Français',
      hi: 'हिन्दी',
      ja: '日本語',
      pt: 'Português',
      ru: 'Русский',
      zh: '中文'
    };
    return languageNames[lang] || lang;
  }
  
  /**
   * Translate with fallback language
   */
  static translateWithFallback(text, fallbackLanguage = 'en') {
    const currentLang = this.getCurrentLanguage();
    const fallbackText = i18n.t(text, { 
      defaultValue: text,
      lng: currentLang 
    });
    
    if (fallbackText !== text) {
      return fallbackText;
    }
    
    // Try fallback language
    const fallbackResult = i18n.t(text, { 
      defaultValue: text,
      lng: fallbackLanguage 
    });
    
    return fallbackResult;
  }
  
  /**
   * Translate AI response with context
   */
  static translateWithContext(response, context = {}) {
    const currentLang = this.getCurrentLanguage();
    
    if (currentLang === 'en' || !response) {
      return response;
    }
    
    // If response has translations
    if (response.translations && response.translations[currentLang]) {
      return response.translations[currentLang];
    }
    
    // If response has context-specific translations
    if (context.type && response.contextTranslations) {
      const contextTranslation = response.contextTranslations[context.type];
      if (contextTranslation && contextTranslation[currentLang]) {
        return contextTranslation[currentLang];
      }
    }
    
    // If response is a string
    if (typeof response === 'string') {
      return this.translateText(response, currentLang);
    }
    
    // If response is an array
    if (Array.isArray(response)) {
      return response.map(item => this.translateWithContext(item, context));
    }
    
    // If response is an object
    if (typeof response === 'object') {
      return this.translateObject(response, currentLang);
    }
    
    return response;
  }
  
  /**
   * Translate multiple texts at once
   */
  static translateBatch(texts) {
    if (!Array.isArray(texts)) return texts;
    
    const currentLang = this.getCurrentLanguage();
    
    if (currentLang === 'en') {
      return texts;
    }
    
    return texts.map(text => this.translateText(text, currentLang));
  }
  
  /**
   * Get language-specific content
   */
  static getLocalizedContent(contentMap) {
    const currentLang = this.getCurrentLanguage();
    
    if (!contentMap || typeof contentMap !== 'object') {
      return contentMap;
    }
    
    // If contentMap has language keys
    if (contentMap[currentLang]) {
      return contentMap[currentLang];
    }
    
    // Fallback to English
    if (contentMap.en) {
      return contentMap.en;
    }
    
    // Return first available
    const firstKey = Object.keys(contentMap)[0];
    return contentMap[firstKey];
  }
  
  /**
   * Format date according to current language
   */
  static formatDate(date, options = {}) {
    const currentLang = this.getCurrentLanguage();
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return date;
      }
      
      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
      };
      
      return dateObj.toLocaleDateString(currentLang, defaultOptions);
    } catch (error) {
      console.error('Date formatting error:', error);
      return date;
    }
  }
  
  /**
   * Format number according to current language
   */
  static formatNumber(number, options = {}) {
    const currentLang = this.getCurrentLanguage();
    
    try {
      const num = typeof number === 'string' ? parseFloat(number) : number;
      if (isNaN(num)) {
        return number;
      }
      
      const defaultOptions = {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
        ...options
      };
      
      return num.toLocaleString(currentLang, defaultOptions);
    } catch (error) {
      console.error('Number formatting error:', error);
      return number;
    }
  }
  
  /**
   * Get language-specific placeholder text
   */
  static getPlaceholder(basePlaceholder) {
    const currentLang = this.getCurrentLanguage();
    const placeholderKey = `${basePlaceholder}.${currentLang}`;
    const translation = i18n.t(placeholderKey, { 
      defaultValue: i18n.t(basePlaceholder, { defaultValue: basePlaceholder })
    });
    return translation;
  }
  
  /**
   * Check if content needs translation
   */
  static needsTranslation(content) {
    const currentLang = this.getCurrentLanguage();
    if (currentLang === 'en') return false;
    if (!content) return false;
    
    // Check if content contains English-only text
    const englishRegex = /^[a-zA-Z0-9\s.,!?;:'"()-]+$/;
    if (typeof content === 'string' && englishRegex.test(content)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get translation with parameters
   */
  static translateWithParams(key, params = {}) {
    return i18n.t(key, { 
      defaultValue: key,
      ...params 
    });
  }
  
  /**
   * Detect language of text
   */
  static detectLanguage(text) {
    if (!text || typeof text !== 'string') return 'en';
    
    // Check for Arabic characters
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    // Check for Chinese characters
    if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
    // Check for Japanese characters
    if (/[\u3040-\u309F]/.test(text) || /[\u30A0-\u30FF]/.test(text)) return 'ja';
    // Check for Cyrillic characters
    if (/[\u0400-\u04FF]/.test(text)) return 'ru';
    // Check for Devanagari
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    
    return 'en';
  }
}

export default AITranslationService;