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
    },
    // A key missing in every language returns '' instead of the raw key ("contact.formTitle"),
    // so the `t('key') || 'English text'` fallbacks used across the pages actually show.
    parseMissingKeyHandler: () => ''
  });

// Keep <html lang/dir> in sync with the chosen language (screen readers, fonts, Arabic RTL).
const RTL_LANGUAGES = ['ar'];
const applyDocumentLanguage = (lng) => {
  if (typeof document === 'undefined') return;
  const base = String(lng || 'en').split('-')[0];
  document.documentElement.lang = base;
  document.documentElement.dir = RTL_LANGUAGES.includes(base) ? 'rtl' : 'ltr';
};
applyDocumentLanguage(i18n.language);
i18n.on('languageChanged', applyDocumentLanguage);

export default i18n;