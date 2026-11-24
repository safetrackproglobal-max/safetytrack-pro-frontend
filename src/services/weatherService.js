// src/services/weatherService.js

import api from './api';

// ============================================================================
// WEATHER SERVICE - WITH RESPONSE TRANSFORMATION
// ============================================================================

const weatherService = {
  /**
   * Get weather forecast - TRANSFORMED for WeatherPanel
   */
  getForecast: async (location, days = 5, options = {}) => {
    try {
      const response = await api.get('/weather/forecast', {
        params: {
          location: location || 'auto:ip',
          days,
          aqi: options.aqi !== undefined ? options.aqi : 'yes',
          alerts: options.alerts !== undefined ? options.alerts : 'yes',
          ...options
        }
      });

      const data = response.data;
      
      // The backend passes on the weather service's own answer. Nothing is filled in when a value is missing.
      if (data && data.current && data.current.temp_c !== undefined) {
        return { ...data, forecast: { forecastday: data.forecast?.forecastday || [] }, alerts: data.alerts || { alert: [] }, success: true };
      }
      if (data && data.success && data.temperature !== undefined) {
        return {
          location: { name: data.location_name || location, region: data.location_region || '', country: data.location_country || '', localtime: data.localtime },
          current: {
            temp_c: data.temperature, feelslike_c: data.feels_like, humidity: data.humidity, wind_kph: data.wind_kph, pressure_mb: data.pressure,
            vis_km: data.visibility, uv: data.uv_index, precip_mm: data.precipitation, cloud: data.clouds, is_day: data.is_day,
            condition: { text: data.condition || '', code: 1000 },
            air_quality: data.air_quality !== undefined ? { 'us-epa-index': data.air_quality } : undefined,
            last_updated: data.last_updated
          },
          forecast: { forecastday: (data.forecast?.forecastday || (Array.isArray(data.forecast) ? data.forecast : data.forecast_days) || []).map((d) => (d.day ? d : { date: d.date, day: { ...d, condition: typeof d.condition === 'string' ? { text: d.condition } : d.condition }, hour: d.hour || [] })) },
          alerts: { alert: [] },
          success: true
        };
      }
      throw new Error('Weather is not available for this place right now.');
    } catch (error) {
      console.error('Forecast API error:', error);
      throw error;
    }
  },

  /**
   * Get astronomy data - TRANSFORMED for WeatherPanel
   */
  getAstronomy: async (location, date) => {
    try {
      const response = await api.get('/weather/astronomy', {
        params: {
          location: location || 'auto:ip',
          date: date || new Date().toISOString().split('T')[0]
        }
      });

      const data = response.data;
      const astro = data?.astronomy?.astro || data?.data?.astronomy?.astro || data?.data?.astronomy;
      return { astronomy: astro && astro.sunrise ? { astro } : null, success: Boolean(astro) };
    } catch (error) {
      console.error('Astronomy API error:', error);
      return { astronomy: null, success: false };
    }
  },

  /**
   * Search for locations
   */
  searchLocations: async (query) => {
    try {
      const response = await api.get('/weather/search', {
        params: { q: query }
      });
      
      if (response.data && response.data.success) {
        return response.data.results || [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
      
    } catch (error) {
      console.error('Location search error:', error);
      return [];
    }
  },

  /**
   * Get current weather
   */
  getCurrentWeather: async (location, options = {}) => {
    try {
      const response = await api.get('/weather/current', {
        params: {
          location: location || 'auto:ip',
          aqi: options.aqi !== undefined ? options.aqi : 'yes',
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Weather API error:', error);
      throw error;
    }
  },

  /**
   * Get weather history
   */
  getHistory: async (location, date) => {
    try {
      const response = await api.get('/weather/history', {
        params: {
          location: location || 'auto:ip',
          date: date || new Date().toISOString().split('T')[0]
        }
      });
      return response.data;
    } catch (error) {
      console.error('History API error:', error);
      throw error;
    }
  },

  /**
   * Get weather alerts
   */
  getAlerts: async (location) => {
    try {
      const response = await api.get('/weather/alerts', {
        params: { location: location || 'auto:ip' }
      });
      return response.data;
    } catch (error) {
      console.error('Alerts API error:', error);
      throw error;
    }
  },

  /**
   * Get weather summary for dashboard
   */
  getWeatherSummary: async (location) => {
    try {
      const response = await api.get('/weather/summary', {
        params: { location: location || 'auto:ip' }
      });
      return response.data;
    } catch (error) {
      console.error('Weather summary error:', error);
      throw error;
    }
  },

  /**
   * Get weather for multiple locations (batch request)
   */
  getMultipleLocations: async (locations) => {
    try {
      const response = await api.post('/weather/batch', {
        locations: locations || ['auto:ip']
      });
      return response.data;
    } catch (error) {
      console.error('Batch weather error:', error);
      throw error;
    }
  },

  /**
   * Get weather by IP (auto-detect location)
   */
  getWeatherByIP: async () => {
    try {
      const response = await api.get('/weather/ip');
      return response.data;
    } catch (error) {
      console.error('IP weather error:', error);
      throw error;
    }
  },

  /**
   * Get enhanced weather data with all metrics
   */
  getEnhancedWeatherData: async (location, options = {}) => {
    try {
      const response = await api.get('/weather/enhanced', {
        params: {
          location: location || 'auto:ip',
          include: options.include || 'all',
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Enhanced weather error:', error);
      throw error;
    }
  },

  /**
   * Get weather impact assessment
   */
  getWeatherImpact: async (location) => {
    try {
      const response = await api.get('/weather/impact', {
        params: { location: location || 'auto:ip' }
      });
      return response.data;
    } catch (error) {
      console.error('Weather impact error:', error);
      throw error;
    }
  },

  /**
   * Clear weather cache (admin only)
   */
  clearWeatherCache: async () => {
    try {
      const response = await api.post('/weather/cache/clear');
      return response.data;
    } catch (error) {
      console.error('Clear cache error:', error);
      throw error;
    }
  }
};

// ============================================================================
// HELPERS
// ============================================================================

// ============================================================================
// WEATHER CACHE (Frontend cache)
// ============================================================================

class WeatherCache {
  constructor() {
    this.cache = new Map();
    this.maxAge = 5 * 60 * 1000; // 5 minutes
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Export cache instance
export const weatherCache = new WeatherCache();

// ============================================================================
// EXPORT
// ============================================================================

export default weatherService;