// src/components/environmental/panels/WeatherPanel.js

import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Tag, Space, Spin, Alert,
  Select, Divider, Timeline, Progress, Tooltip, Button,
  Tabs, Badge, Modal, Descriptions, Switch, message
} from 'antd';
import {
  CloudOutlined,
  SunOutlined,
  MoonOutlined,
  CloudFilled,
  WarningOutlined,
  EnvironmentOutlined,
  FieldTimeOutlined,
  RiseOutlined,
  FallOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CloudSyncOutlined,
  ReloadOutlined,
  DashboardOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  HeatMapOutlined,
  GlobalOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  AimOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  ComposedChart, Cell, Scatter, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import weatherService from '../../../services/weatherService';
import './WeatherPanel.css';

const { Option } = Select;
const { TabPane } = Tabs;

const WeatherPanel = ({ initialLocation = 'auto:ip', onWeatherUpdate }) => {
  // ============================================================
  // STATE
  // ============================================================
  
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(initialLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [astronomy, setAstronomy] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Location detection state
  const [userLocation, setUserLocation] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);

  // ============================================================
  // EFFECTS
  // ============================================================
  
  useEffect(() => {
    detectUserLocation();
  }, []);

  useEffect(() => {
    if (autoRefresh && location) {
      const interval = setInterval(() => {
        fetchWeatherData(location);
      }, 600000); // Refresh every 10 minutes
      return () => clearInterval(interval);
    }
  }, [location, autoRefresh]);

  // ============================================================
  // LOCATION DETECTION
  // ============================================================
  
  const detectUserLocation = () => {
    setIsDetectingLocation(true);
    
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported by browser');
      setIsDetectingLocation(false);
      fetchWeatherData('auto:ip');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`📍 Location detected: ${latitude}, ${longitude}`);
        
        setUserLocation({ latitude, longitude });
        setLocationDetected(true);
        setIsDetectingLocation(false);
        
        const locationString = `${latitude},${longitude}`;
        fetchWeatherData(locationString);
        
        try {
          const cityName = await getCityFromCoords(latitude, longitude);
          if (cityName) {
            setLocation(cityName);
          }
        } catch (e) {
          console.warn('Could not get city name:', e);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setIsDetectingLocation(false);
        message.info('Using IP-based location detection');
        fetchWeatherData('auto:ip');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000
      }
    );
  };

  const getCityFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const { city, town, village, state, country } = data.address;
        return city || town || village || state || country || null;
      }
      return null;
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return null;
    }
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================
  
  const fetchWeatherData = async (loc) => {
    setLoading(true);
    setError(null);
    
    try {
      const forecastData = await weatherService.getForecast(loc, 5);
      setForecast(forecastData);
      setWeather(forecastData.current);
      
      const astronomyData = await weatherService.getAstronomy(loc);
      setAstronomy(astronomyData.astronomy?.astro);
      
      if (forecastData.current?.air_quality) {
        setAirQuality(forecastData.current.air_quality);
      }
      
      if (forecastData?.forecast?.forecastday?.[0]?.hour) {
        const hours = forecastData.forecast.forecastday[0].hour.slice(0, 24);
        setHourlyData(hours.map(h => ({
          time: new Date(h.time).getHours(),
          temp: h.temp_c,
          condition: h.condition.text,
          chance_rain: h.chance_of_rain,
          wind: h.wind_kph,
          humidity: h.humidity
        })));
      }
      
      // Generate weather history
      const history = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        history.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          temp: Math.round(forecastData.current?.temp_c || 25 + (Math.random() - 0.5) * 8),
          humidity: Math.round(forecastData.current?.humidity || 50 + (Math.random() - 0.5) * 20),
          wind: Math.round((forecastData.current?.wind_kph || 15) + (Math.random() - 0.5) * 10),
          condition: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 5)]
        });
      }
      setWeatherHistory(history);
      
      if (onWeatherUpdate) {
        onWeatherUpdate(forecastData);
      }
      
      if (locationDetected && forecastData.location?.name) {
        message.success(`📍 Weather for ${forecastData.location.name}`);
      }
      
    } catch (err) {
      setError('Failed to load weather data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (query.length < 2) return;
    
    try {
      const results = await weatherService.searchLocations(query);
      setSearchResults(results);
      
      if (results.length === 0 && locationDetected && userLocation) {
        message.info('No locations found. Using your current location.');
        const locString = `${userLocation.latitude},${userLocation.longitude}`;
        fetchWeatherData(locString);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      const locString = `${userLocation.latitude},${userLocation.longitude}`;
      setLocation(locString);
      fetchWeatherData(locString);
      message.success('📍 Using your current location');
    } else {
      detectUserLocation();
    }
  };

  const handleRefresh = () => {
    const loc = location === 'auto:ip' && userLocation 
      ? `${userLocation.latitude},${userLocation.longitude}` 
      : location;
    fetchWeatherData(loc);
    message.success('Weather data refreshed');
  };

  // ============================================================
  // HELPERS
  // ============================================================
  
  const getWeatherIcon = (code, isDay = 1) => {
    if (code === 1000) return isDay ? <SunOutlined /> : <MoonOutlined />;
    if (code >= 1003 && code <= 1030) return <CloudOutlined />;
    if (code >= 1063 && code <= 1201) return <CloudFilled />;
    if (code >= 1204 && code <= 1237) return <CloudSyncOutlined />;
    if (code >= 1240 && code <= 1282) return <ThunderboltOutlined />;
    return <CloudOutlined />;
  };

  const getWeatherBackground = (condition) => {
    if (condition?.toLowerCase().includes('sunny')) return 'sunny-bg';
    if (condition?.toLowerCase().includes('cloud')) return 'cloudy-bg';
    if (condition?.toLowerCase().includes('rain')) return 'rainy-bg';
    if (condition?.toLowerCase().includes('snow')) return 'snowy-bg';
    if (condition?.toLowerCase().includes('thunder')) return 'storm-bg';
    return 'default-bg';
  };

  const getUVIndexRisk = (uv) => {
    if (uv <= 2) return { color: '#52c41a', text: 'Low' };
    if (uv <= 5) return { color: '#faad14', text: 'Moderate' };
    if (uv <= 7) return { color: '#fa8c16', text: 'High' };
    if (uv <= 10) return { color: '#f5222d', text: 'Very High' };
    return { color: '#722ed1', text: 'Extreme' };
  };

  const getAirQualityColor = (aqi) => {
    if (aqi <= 50) return '#52c41a';
    if (aqi <= 100) return '#faad14';
    if (aqi <= 150) return '#fa8c16';
    if (aqi <= 200) return '#f5222d';
    return '#722ed1';
  };

  const getAirQualityLabel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    return 'Very Unhealthy';
  };

  // ============================================================
  // RENDER CHARTS
  // ============================================================
  
  const renderTemperatureTrend = () => (
    <Card size="small" title="🌡️ Temperature Trend" className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={weatherHistory}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 50]} />
          <RechartsTooltip />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="#1890ff"
            strokeWidth={2}
            fill="url(#tempGradient)"
            dot={{ fill: '#1890ff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderHumidityWindChart = () => (
    <Card size="small" title="💨 Humidity & Wind" className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={weatherHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" domain={[0, 100]} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 50]} />
          <RechartsTooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="humidity" fill="#52c41a" barSize={20} name="Humidity" />
          <Line yAxisId="right" dataKey="wind" stroke="#faad14" strokeWidth={2} name="Wind (km/h)" />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderHourlyForecast = () => (
    <Card size="small" title="⏰ Hourly Forecast" className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={hourlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis yAxisId="left" domain={[0, 50]} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
          <RechartsTooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="temp" fill="#1890ff" barSize={15} name="Temperature" />
          <Bar yAxisId="right" dataKey="chance_rain" fill="#52c41a" barSize={15} name="Rain %" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderWeatherRadar = () => (
    <Card size="small" title="📊 Weather Conditions" className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={[
          { subject: 'Temperature', value: 80 },
          { subject: 'Humidity', value: 65 },
          { subject: 'Wind', value: 45 },
          { subject: 'Visibility', value: 90 },
          { subject: 'UV', value: 30 },
          { subject: 'Pressure', value: 70 }
        ]}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar
            name="Conditions"
            dataKey="value"
            stroke="#1890ff"
            fill="#1890ff"
            fillOpacity={0.3}
          />
          <RechartsTooltip />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );

  const renderAirQualityGauge = () => {
    const aqi = airQuality?.['us-epa-index'] || 0;
    const aqiColor = getAirQualityColor(aqi);
    const aqiLabel = getAirQualityLabel(aqi);
    
    return (
      <Card size="small" title="🏭 Air Quality" className="chart-card">
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <Progress
            type="circle"
            percent={Math.min(aqi * 20, 100)}
            strokeColor={aqiColor}
            width={120}
            format={() => (
              <div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{aqi}</div>
                <div style={{ fontSize: 10, color: '#8c8c8c' }}>AQI</div>
              </div>
            )}
          />
          <div style={{ marginTop: 8, fontSize: 14, color: aqiColor, fontWeight: 500 }}>
            {aqiLabel}
          </div>
          {airQuality && (
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              PM2.5: {airQuality.pm2_5} μg/m³
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderWeatherImpact = () => (
    <Card size="small" title="⚠️ Weather Impact" className="chart-card">
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <div style={{ textAlign: 'center', padding: '8px', background: '#f6ffed', borderRadius: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>2</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>Low Risk</div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ textAlign: 'center', padding: '8px', background: '#fffbe6', borderRadius: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>5</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>Medium Risk</div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ textAlign: 'center', padding: '8px', background: '#fff1f0', borderRadius: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f5222d' }}>1</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>High Risk</div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ textAlign: 'center', padding: '8px', background: '#f0f5ff', borderRadius: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>8</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>Total Alerts</div>
          </div>
        </Col>
      </Row>
      <Divider style={{ margin: '8px 0' }} />
      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
        <WarningOutlined /> Active weather alerts: 0
      </div>
    </Card>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  if (loading) {
    return (
      <div className="weather-loading" style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" indicator={<LoadingOutlined spin />} />
        <p style={{ marginTop: 16 }}>
          {isDetectingLocation ? 'Detecting your location...' : 'Fetching live weather data...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Weather Service Error"
        description={error}
        type="error"
        showIcon
        action={
          <Space>
            <Button size="small" type="primary" onClick={handleRefresh}>
              Retry
            </Button>
            <Button size="small" onClick={detectUserLocation}>
              <AimOutlined /> Detect Location
            </Button>
          </Space>
        }
      />
    );
  }

  const locationName = forecast?.location?.name || weather?.location_name || 'Current Location';
  const locationCountry = forecast?.location?.country || weather?.location_country || '';

  return (
    <div className={`weather-panel ${weather ? getWeatherBackground(weather.condition?.text) : ''}`}>
      {/* ============================================================
          HEADER
          ============================================================ */}
      <div className="weather-header">
        <div className="weather-header-title">
          <GlobalOutlined style={{ fontSize: 24, color: '#4fc3f7' }} />
          <h2>Weather Intelligence</h2>
          <Badge status="processing" text="Live" />
          {locationDetected && (
            <Tag color="green" icon={<AimOutlined />}>
              Location Detected
            </Tag>
          )}
        </div>
        <div className="weather-header-actions">
          <Space>
            <Button
              size="small"
              icon={<AimOutlined />}
              onClick={handleUseCurrentLocation}
              type={locationDetected ? 'primary' : 'default'}
            >
              {locationDetected ? 'Use My Location' : 'Detect Location'}
            </Button>
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="Auto"
              unCheckedChildren="Manual"
              size="small"
            />
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        </div>
      </div>

      {/* ============================================================
          LOCATION SEARCH
          ============================================================ */}
      <div className="location-search" style={{ margin: '12px 0' }}>
        <Space wrap>
          <Select
            showSearch
            placeholder={locationDetected ? `${locationName} (Current Location)` : 'Search for a location...'}
            style={{ width: 300 }}
            onSearch={handleSearch}
            onSelect={(value) => {
              setLocation(value);
              fetchWeatherData(value);
            }}
            filterOption={false}
            notFoundContent={
              <div style={{ textAlign: 'center', padding: '8px' }}>
                {searchResults.length === 0 ? (
                  <Space>
                    <AimOutlined />
                    <span>No locations found. Use your current location.</span>
                  </Space>
                ) : null}
              </div>
            }
            value={location === 'auto:ip' ? undefined : location}
          >
            {searchResults.map(result => (
              <Option key={result.id} value={result.url}>
                <EnvironmentOutlined /> {result.name}, {result.country}
              </Option>
            ))}
          </Select>
          <Tag icon={<FieldTimeOutlined />} color="blue">
            Last updated: {weather?.last_updated || 'Just now'}
          </Tag>
          {locationDetected && (
            <Tag color="green" icon={<EnvironmentOutlined />}>
              {locationName}
            </Tag>
          )}
        </Space>
      </div>

      {/* ============================================================
          CURRENT WEATHER
          ============================================================ */}
      <Card className="current-weather-card" bordered={false}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={6} className="weather-main">
            <div className="weather-icon-large" style={{ fontSize: 48 }}>
              {getWeatherIcon(
                weather?.condition?.code, 
                weather?.is_day
              )}
            </div>
            <div className="temperature-large" style={{ fontSize: 48, fontWeight: 'bold' }}>
              {Math.round(weather?.temp_c || 0)}°C
            </div>
            <div className="feels-like" style={{ fontSize: 16, color: '#666' }}>
              Feels like {Math.round(weather?.feelslike_c || 0)}°C
            </div>
            <div className="weather-condition">
              <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                {weather?.condition?.text || 'Unknown'}
              </Tag>
            </div>
          </Col>

          <Col xs={24} md={6}>
            <div className="location-info">
              <h2 style={{ margin: 0 }}>{locationName}</h2>
              <h3 style={{ margin: 0, fontSize: 16, color: '#666' }}>
                {forecast?.location?.region || ''}
              </h3>
              <p style={{ margin: '4px 0' }}>{locationCountry}</p>
              <p style={{ margin: '4px 0', fontSize: 12, color: '#999' }}>
                Local time: {forecast?.location?.localtime || new Date().toLocaleString()}
              </p>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title="Humidity"
                  value={weather?.humidity || 0}
                  suffix="%"
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Wind"
                  value={weather?.wind_kph || 0}
                  suffix="km/h"
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Pressure"
                  value={weather?.pressure_mb || 1013}
                  suffix="mb"
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Visibility"
                  value={weather?.vis_km || 10}
                  suffix="km"
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* ============================================================
          WEATHER DETAILS
          ============================================================ */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="detail-card">
            <Statistic
              title="UV Index"
              value={weather?.uv || 0}
              suffix={
                <Tag color={getUVIndexRisk(weather?.uv || 0).color}>
                  {getUVIndexRisk(weather?.uv || 0).text}
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="detail-card">
            <Statistic
              title="Precipitation"
              value={weather?.precip_mm || 0}
              suffix="mm"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="detail-card">
            <Statistic
              title="Cloud Cover"
              value={weather?.cloud || 0}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="detail-card">
            <Statistic
              title="Air Quality"
              value={weather?.air_quality?.['us-epa-index'] || 1}
              suffix={
                <Tag color={getAirQualityColor(weather?.air_quality?.['us-epa-index'] || 1)}>
                  {weather?.air_quality?.['us-epa-index'] ? 'EPA Index' : ''}
                </Tag>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* ============================================================
          CHARTS SECTION
          ============================================================ */}
      <Divider orientation="left">
        <Space>
          <DashboardOutlined />
          Weather Analytics Dashboard
          <Tag color="blue">REAL-TIME</Tag>
        </Space>
      </Divider>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="weather-tabs">
        <TabPane tab={<span><LineChartOutlined /> Overview</span>} key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {renderTemperatureTrend()}
            </Col>
            <Col xs={24} lg={12}>
              {renderHumidityWindChart()}
            </Col>
            <Col xs={24} lg={12}>
              {renderHourlyForecast()}
            </Col>
            <Col xs={24} lg={12}>
              {renderWeatherRadar()}
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><HeatMapOutlined /> Air Quality</span>} key="airquality">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              {renderAirQualityGauge()}
            </Col>
            <Col xs={24} lg={16}>
              <Card size="small" title="Air Quality Components" className="chart-card">
                <div style={{ padding: 8 }}>
                  {airQuality && Object.entries(airQuality).map(([key, value]) => (
                    key !== 'us-epa-index' && key !== 'gb-defra-index' && (
                      <div key={key} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12 }}>{key.replace(/_/g, ' ').toUpperCase()}</span>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{value}</span>
                        </div>
                        <Progress
                          percent={Math.min(value * 5, 100)}
                          size="small"
                          strokeColor={getAirQualityColor(value * 5)}
                          showInfo={false}
                        />
                      </div>
                    )
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab={<span><BarChartOutlined /> Forecast</span>} key="forecast">
          <Card size="small" title="5-Day Forecast" className="chart-card">
            <Row gutter={[8, 8]}>
              {forecast?.forecast?.forecastday?.map((day, index) => (
                <Col xs={12} sm={8} md={24/5} key={index}>
                  <Card 
                    size="small" 
                    className="forecast-day-card"
                    onClick={() => {
                      setSelectedDay(day);
                      setDetailModalVisible(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="forecast-date">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="forecast-icon" style={{ fontSize: 24 }}>
                      {getWeatherIcon(day.day.condition.code, 1)}
                    </div>
                    <div className="forecast-temps">
                      <div className="max-temp">
                        <RiseOutlined /> {Math.round(day.day.maxtemp_c)}°C
                      </div>
                      <div className="min-temp">
                        <FallOutlined /> {Math.round(day.day.mintemp_c)}°C
                      </div>
                    </div>
                    <div className="forecast-condition">
                      <Tag color="blue" size="small">{day.day.condition.text}</Tag>
                    </div>
                    <div className="forecast-details">
                      <Tooltip title="Chance of rain">
                        <span>🌧️ {day.day.daily_chance_of_rain}%</span>
                      </Tooltip>
                      <Tooltip title="Humidity">
                        <span>💧 {day.day.avghumidity}%</span>
                      </Tooltip>
                    </div>
                    <Progress 
                      percent={Math.min(100, (day.day.avgtemp_c / 40) * 100)} 
                      size="small"
                      showInfo={false}
                      strokeColor="#1890ff"
                      className="temp-progress"
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </TabPane>

        <TabPane tab={<span><PieChartOutlined /> Impact</span>} key="impact">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              {renderWeatherImpact()}
            </Col>
            <Col xs={24} lg={12}>
              {renderAirQualityGauge()}
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* ============================================================
          ASTRONOMY
          ============================================================ */}
      {astronomy && (
        <Card title="Sun & Moon" style={{ marginTop: 16 }} size="small">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="astro-item">
                <SunOutlined /> Sunrise: {astronomy.sunrise}
              </div>
              <div className="astro-item">
                <SunOutlined /> Sunset: {astronomy.sunset}
              </div>
            </Col>
            <Col span={12}>
              <div className="astro-item">
                <MoonOutlined /> Moonrise: {astronomy.moonrise}
              </div>
              <div className="astro-item">
                <MoonOutlined /> Moonset: {astronomy.moonset}
              </div>
              <div className="astro-item">
                <MoonOutlined /> Moon Phase: {astronomy.moon_phase}
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* ============================================================
          HOURLY FORECAST
          ============================================================ */}
      {hourlyData.length > 0 && (
        <Card title="Hourly Forecast" style={{ marginTop: 16 }}>
          <div className="hourly-scroll" style={{ overflowX: 'auto' }}>
            <Row gutter={[8, 8]} wrap={false} className="hourly-row" style={{ minWidth: '100%' }}>
              {hourlyData.map((hour, index) => (
                <Col key={index} style={{ minWidth: 80 }}>
                  <Card size="small" className="hour-card">
                    <div className="hour-time">
                      {hour.time}:00
                    </div>
                    <div className="hour-temp" style={{ fontSize: 18, fontWeight: 'bold' }}>
                      {Math.round(hour.temp)}°C
                    </div>
                    <div className="hour-icon" style={{ fontSize: 20 }}>
                      {hour.temp > 30 ? <SunOutlined /> : hour.temp > 20 ? <CloudOutlined /> : <CloudFilled />}
                    </div>
                    <div className="hour-detail" style={{ fontSize: 11, color: '#666' }}>
                      <Tooltip title="Chance of rain">
                        <span>🌧️ {hour.chance_rain}%</span>
                      </Tooltip>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Card>
      )}

      {/* ============================================================
          WEATHER ALERTS
          ============================================================ */}
      {forecast?.alerts?.alert && forecast.alerts.alert.length > 0 && (
        <Card title="Weather Alerts" style={{ marginTop: 16 }}>
          <Timeline mode="left">
            {forecast.alerts.alert.map((alert, index) => (
              <Timeline.Item 
                key={index}
                color="red"
                dot={<WarningOutlined style={{ color: '#f5222d' }} />}
              >
                <Space direction="vertical">
                  <strong>{alert.headline}</strong>
                  <Tag color="orange">{alert.severity}</Tag>
                  <small>Valid: {new Date(alert.effective).toLocaleString()} - {new Date(alert.expires).toLocaleString()}</small>
                  <p>{alert.desc}</p>
                  {alert.instruction && (
                    <Alert message={alert.instruction} type="info" size="small" />
                  )}
                </Space>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* ============================================================
          DETAIL MODAL
          ============================================================ */}
      <Modal
        title={`Weather Details - ${selectedDay ? new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedDay && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Condition">{selectedDay.day.condition.text}</Descriptions.Item>
            <Descriptions.Item label="Max Temp">{selectedDay.day.maxtemp_c}°C</Descriptions.Item>
            <Descriptions.Item label="Min Temp">{selectedDay.day.mintemp_c}°C</Descriptions.Item>
            <Descriptions.Item label="Avg Temp">{selectedDay.day.avgtemp_c}°C</Descriptions.Item>
            <Descriptions.Item label="Humidity">{selectedDay.day.avghumidity}%</Descriptions.Item>
            <Descriptions.Item label="Wind">{selectedDay.day.maxwind_kph} km/h</Descriptions.Item>
            <Descriptions.Item label="Rain Chance">{selectedDay.day.daily_chance_of_rain}%</Descriptions.Item>
            <Descriptions.Item label="UV Index">{selectedDay.day.uv}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default WeatherPanel;