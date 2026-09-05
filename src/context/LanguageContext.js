// src/context/LanguageContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const { user, updateUserLanguage } = useAuth(); // Get auth directly
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const supportedLanguages = ['en', 'hi', 'ja', 'ar', 'ru', 'fr', 'es', 'de', 'pt', 'zh'];

  // Initialize language
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        setIsLoading(true);
        
        let finalLanguage = 'en';
        
        // Priority 1: User preference from auth
        if (user?.preferred_language) {
          finalLanguage = user.preferred_language;
          console.log('LanguageContext: Using user language from auth:', finalLanguage);
        } 
        // Priority 2: localStorage
        else {
          const savedLanguage = localStorage.getItem('preferredLanguage');
          if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
            finalLanguage = savedLanguage;
            console.log('LanguageContext: Using language from localStorage:', finalLanguage);
          } 
          // Priority 3: Browser language
          else {
            const browserLanguage = navigator.language.split('-')[0];
            if (supportedLanguages.includes(browserLanguage)) {
              finalLanguage = browserLanguage;
              console.log('LanguageContext: Using browser language:', finalLanguage);
            } else {
              console.log('LanguageContext: Using default language: en');
            }
          }
        }
        
        // Apply language
        await i18n.changeLanguage(finalLanguage);
        setCurrentLanguage(finalLanguage);
        localStorage.setItem('preferredLanguage', finalLanguage);
        
      } catch (error) {
        console.error('Language initialization error:', error);
        // Fallback to English
        await i18n.changeLanguage('en');
        setCurrentLanguage('en');
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeLanguage();
  }, [i18n, user?.preferred_language]); // Re-run when user changes

  // Change language function
  const changeLanguage = useCallback(async (lng) => {
    if (!supportedLanguages.includes(lng)) {
      console.warn(`Language "${lng}" is not supported`);
      return false;
    }

    try {
      setIsLoading(true);
      
      // Update i18n
      await i18n.changeLanguage(lng);
      setCurrentLanguage(lng);
      
      // Save to localStorage
      localStorage.setItem('preferredLanguage', lng);
      
      // Update on server via AuthContext
      if (updateUserLanguage) {
        await updateUserLanguage(lng);
        console.log('LanguageContext: Language updated on server:', lng);
      }
      
      // Dispatch custom event for components that need to react
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: lng } 
      }));
      
      return true;
      
    } catch (error) {
      console.error('Language change error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [i18n, updateUserLanguage]);

  // Available languages
  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', dir: 'ltr' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' }
  ];

  // Get current language direction (for RTL support)
  const getCurrentLanguageDir = useCallback(() => {
    const lang = availableLanguages.find(l => l.code === currentLanguage);
    return lang?.dir || 'ltr';
  }, [currentLanguage, availableLanguages]);

  const value = {
    currentLanguage,
    changeLanguage,
    isLoading,
    isInitialized,
    availableLanguages,
    getCurrentLanguageDir,
    isRTL: currentLanguage === 'ar' // Arabic is RTL
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;