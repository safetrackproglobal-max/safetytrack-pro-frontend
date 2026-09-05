// src/components/LanguageSelector/index.js
import React, { useState, useEffect, useRef } from 'react';
import { Button, Dropdown, Menu, Space, Typography } from 'antd';
import { GlobalOutlined, CheckOutlined } from '@ant-design/icons';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const { Text } = Typography;

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, availableLanguages, isLoading } = useLanguage();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = async (langCode) => {
    const success = await changeLanguage(langCode);
    if (success) {
      setOpen(false);
    }
  };

  const menuItems = availableLanguages.map((lang) => ({
    key: lang.code,
    label: (
      <div className="language-menu-item">
        <span className="language-flag">{lang.flag}</span>
        <span className="language-name">{lang.nativeName}</span>
        <span className="language-code">{lang.name}</span>
        {currentLanguage === lang.code && (
          <CheckOutlined className="language-check" />
        )}
      </div>
    ),
    onClick: () => handleLanguageChange(lang.code),
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayClassName="language-dropdown"
    >
      <Button 
        type="text" 
        className="language-selector-btn"
        icon={<GlobalOutlined />}
        loading={isLoading}
      >
        <span className="language-selector-label">
          {currentLang?.flag} {currentLang?.nativeName}
        </span>
      </Button>
    </Dropdown>
  );
};

export default LanguageSelector;