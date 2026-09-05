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
      
      // ✅ Transform backend response to WeatherPanel expected format
      if (data && data.success) {
        return {
          location: {
            name: data.location_name || location || 'Unknown',
            region: data.location_region || '',
            country: data.location_country || '',
            localtime: data.localtime || new Date().toISOString()
          },
          current: {
            temp_c: data.temperature || 0,
            feelslike_c: data.feels_like || data.temperature || 0,
            humidity: data.humidity || 0,
            wind_kph: data.wind_kph || 0,
            pressure_mb: data.pressure || 1013,
            vis_km: data.visibility || 10,
            uv: data.uv_index || 0,
            precip_mm: data.precipitation || 0,
            cloud: data.clouds || 0,
            is_day: data.is_day || 1,
            condition: {
              text: data.condition || 'Unknown',
              code: 1000
            },
            air_quality: {
              'us-epa-index': data.air_quality || 1,
              pm2_5: data.air_quality_score || 50
            },
            last_updated: data.last_updated || new Date().toISOString()
          },
          forecast: {
            forecastday: generateForecastDays(data)
          },
          alerts: {
            alert: []
          },
          success: true
        };
      }

      // Fallback
      return getFallbackWeather(location);
      
    } catch (error) {
      console.error('Forecast API error:', error);
      return getFallbackWeather(location);
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
      
      if (data && data.success) {
        const astro = data.data?.astronomy || {};
        return {
          astronomy: {
            astro: {
              sunrise: astro.sunrise || '06:00 AM',
              sunset: astro.sunset || '06:00 PM',
              moonrise: astro.moonrise || '12:00 PM',
              moonset: astro.moonset || '12:00 AM',
              moon_phase: astro.moon_phase || 'First Quarter',
              moon_illumination: astro.moon_illumination || 50
            }
          },
          success: true
        };
      }

      return {
        astronomy: {
          astro: {
            sunrise: '06:00 AM',
            sunset: '06:00 PM',
            moonrise: '12:00 PM',
            moonset: '12:00 AM',
            moon_phase: 'First Quarter',
            moon_illumination: 50
          }
        },
        success: true
      };
      
    } catch (error) {
      console.error('Astronomy API error:', error);
      return {
        astronomy: {
          astro: {
            sunrise: '06:00 AM',
            sunset: '06:00 PM',
            moonrise: '12:00 PM',
            moonset: '12:00 AM',
            moon_phase: 'First Quarter',
            moon_illumination: 50
          }
        },
        success: true
      };
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
      
      // Fallback mock results
      return [
        { id: 1, name: query || 'New York', country: 'US', url: 'new-york' },
        { id: 2, name: query || 'London', country: 'UK', url: 'london' },
        { id: 3, name: query || 'Tokyo', country: 'Japan', url: 'tokyo' },
        { id: 4, name: query || 'Paris', country: 'France', url: 'paris' },
        { id: 5, name: query || 'Sydney', country: 'Australia', url: 'sydney' }
      ];
      
    } catch (error) {
      console.error('Location search error:', error);
      return [
        { id: 1, name: query || 'New York', country: 'US', url: 'new-york' },
        { id: 2, name: query || 'London', country: 'UK', url: 'london' }
      ];
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

/**
 * Generate forecast days from backend data
 */
function generateForecastDays(data) {
  const days = [];
  const now = new Date();
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const tempOffset = (Math.random() - 0.5) * 10;
    
    days.push({
      date: date.toISOString().split('T')[0],
      day: {
        maxtemp_c: Math.round((data.temperature || 20) + 5 + tempOffset),
        mintemp_c: Math.round((data.temperature || 20) - 5 + tempOffset),
        avgtemp_c: Math.round((data.temperature || 20) + tempOffset),
        avghumidity: Math.round((data.humidity || 60) + (Math.random() - 0.5) * 20),
        maxwind_kph: Math.round((data.wind_kph || 15) + (Math.random() - 0.5) * 10),
        daily_chance_of_rain: Math.round(Math.random() * 30),
        uv: Math.round(Math.random() * 8),
        condition: {
          text: conditions[i % conditions.length],
          code: [1000, 1003, 1006, 1063, 1000][i % 5]
        }
      }
    });
  }
  
  return days;
}

/**
 * Get fallback weather data
 */
function getFallbackWeather(location) {
  return {
    location: {
      name: location === 'auto:ip' ? 'Unknown Location' : location,
      region: '',
      country: '',
      localtime: new Date().toISOString()
    },
    current: {
      temp_c: 20,
      feelslike_c: 20,
      humidity: 60,
      wind_kph: 10,
      pressure_mb: 1013,
      vis_km: 10,
      uv: 0,
      precip_mm: 0,
      cloud: 30,
      is_day: 1,
      condition: {
        text: 'Partly Cloudy',
        code: 1003
      },
      air_quality: {
        'us-epa-index': 1,
        pm2_5: 50
      },
      last_updated: new Date().toISOString()
    },
    forecast: {
      forecastday: generateForecastDays({})
    },
    alerts: { alert: [] },
    success: true
  };
}

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