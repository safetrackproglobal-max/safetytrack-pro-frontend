import i18n from "../i18n";
import LanguageService from "./languageService";

// Sync i18n with server/localStorage
export const syncLanguage = async () => {
  try {
    const language = await LanguageService.getCurrentLanguage();
    
    if (language && i18n.language !== language) {
      await i18n.changeLanguage(language);
    }
    
    return language;
  } catch (error) {
    console.error("Failed to sync language:", error);
    return i18n.language;
  }
};

// Change language and sync everywhere
export const changeLanguage = async (language) => {
  try {
    await i18n.changeLanguage(language);
    await LanguageService.updateLanguage(language);
    return true;
  } catch (error) {
    console.error("Failed to change language:", error);
    return false;
  }
};

// Get current language
export const getCurrentLanguage = () => {
  return i18n.language;
};