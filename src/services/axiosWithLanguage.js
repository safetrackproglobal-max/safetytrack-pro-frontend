import axios from 'axios';
import i18n from '../i18n';

// Create a custom axios instance
const axiosWithLanguage = axios.create({
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add language to ALL requests
axiosWithLanguage.interceptors.request.use(
  (config) => {
    const currentLanguage = i18n.language || 'en';
    
    // Add language to ALL requests - different methods
    if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
      // For data requests
      if (config.data) {
        if (typeof config.data === 'object' && !(config.data instanceof FormData)) {
          config.data = {
            ...config.data,
            language: currentLanguage,
            language_code: currentLanguage,
            user_language: currentLanguage
          };
        }
      } else {
        config.data = { language: currentLanguage };
      }
      
      // Also add to headers
      config.headers['X-User-Language'] = currentLanguage;
    }
    
    // For GET/DELETE requests, add as query parameter
    if (config.method === 'get' || config.method === 'delete') {
      config.params = {
        ...config.params,
        language: currentLanguage
      };
    }
    
    // Add to URL if not already in params/data
    if (!config.params?.language && !config.data?.language) {
      // For FormData
      if (config.data instanceof FormData) {
        config.data.append('language', currentLanguage);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle language-related responses
axiosWithLanguage.interceptors.response.use(
  (response) => {
    // You can add response translation logic here if needed
    return response;
  },
  (error) => {
    // Handle errors
    console.error('Axios Language Interceptor Error:', error);
    return Promise.reject(error);
  }
);

export default axiosWithLanguage;