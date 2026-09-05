// src/components/LanguageSwitcher.js (Enhanced version)
import React, { useState, useEffect } from 'react';
import { Select, message } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import i18n from '../i18n';
import LanguageService from '../services/languageService';

const { Option } = Select;

const LanguageSwitcher = () => {
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize with current language
    const initLanguage = async () => {
      const lang = await LanguageService.getCurrentLanguage();
      setCurrentLang(lang);
    };
    initLanguage();
  }, []);

  const handleLanguageChange = async (newLanguage) => {
    setLoading(true);
    try {
      // 1. Update via LanguageService
      const result = await LanguageService.updateLanguage(newLanguage);
      
      // 2. Update i18n
      await i18n.changeLanguage(newLanguage);
      
      // 3. Update state
      setCurrentLang(newLanguage);
      
      // 4. Show appropriate message
      if (result.localOnly) {
        message.warning('Language saved locally. Will sync with server when online.');
      } else {
        message.success(`Language changed to ${getLanguageName(newLanguage)}`);
      }
      
      // 5. Optional: Trigger page refresh for full language change
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      message.error('Failed to change language');
      console.error('Language change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      en: 'English',
      hi: 'Hindi',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      zh: 'Chinese',
      ja: 'Japanese',
      ar: 'Arabic',
      ru: 'Russian',
      pt: 'Portuguese'
    };
    return languages[code] || code;
  };

  return (
    <Select
      value={currentLang}
      onChange={handleLanguageChange}
      loading={loading}
      style={{ width: 120 }}
      suffixIcon={<GlobalOutlined />}
    >
      <Option value="en">🇺🇸 English</Option>
      <Option value="hi">🇮🇳 Hindi</Option>
      <Option value="es">🇪🇸 Spanish</Option>
      <Option value="fr">🇫🇷 French</Option>
      <Option value="de">🇩🇪 German</Option>
      <Option value="zh">🇨🇳 Chinese</Option>
      <Option value="ja">🇯🇵 Japanese</Option>
      <Option value="ar">🇸🇦 Arabic</Option>
      <Option value="ru">🇷🇺 Russian</Option>
      <Option value="pt">🇵🇹 Portuguese</Option>
    </Select>
  );
};

export default LanguageSwitcher;