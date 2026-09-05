// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import enTranslations from './locales/en/translation.json';
import esTranslations from './locales/es/translation.json';
import frTranslations from './locales/fr/translation.json';
import arTranslations from './locales/ar/translation.json';
import zhTranslations from './locales/zh/translation.json';
import hiTranslations from './locales/hi/translation.json';
import ptTranslations from './locales/pt/translation.json';
import ruTranslations from './locales/ru/translation.json';
import jaTranslations from './locales/ja/translation.json';
import deTranslations from './locales/de/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
      fr: { translation: frTranslations },
      ar: { translation: arTranslations },
      zh: { translation: zhTranslations },
      hi: { translation: hiTranslations },
      pt: { translation: ptTranslations },
      ru: { translation: ruTranslations },
      ja: { translation: jaTranslations },
      de: { translation: deTranslations }
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;