// src/services/languageService.js
class LanguageService {
  static async updateLanguage(language) {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // If not logged in, just save to localStorage
        localStorage.setItem('preferredLanguage', language);
        return { success: true, language };
      }
      
      // If logged in, update on server
      const response = await fetch('http://localhost:5000/api/user/update-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ language })
      });
      
      if (response.ok) {
        localStorage.setItem('preferredLanguage', language);
        return await response.json();
      } else {
        throw new Error('Failed to update language');
      }
    } catch (error) {
      console.error('Language update error:', error);
      // Fallback: save to localStorage only
      localStorage.setItem('preferredLanguage', language);
      return { success: true, language, localOnly: true };
    }
  }
  
  static async getCurrentLanguage() {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // Return from localStorage if not logged in
        return localStorage.getItem('preferredLanguage') || 'en';
      }
      
      // Get from server if logged in
      const response = await fetch('http://localhost:5000/api/user/language', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.preferred_language || 'en';
      } else {
        throw new Error('Failed to get language');
      }
    } catch (error) {
      console.error('Get language error:', error);
      // Fallback to localStorage
      return localStorage.getItem('preferredLanguage') || 'en';
    }
  }
}

export default LanguageService;