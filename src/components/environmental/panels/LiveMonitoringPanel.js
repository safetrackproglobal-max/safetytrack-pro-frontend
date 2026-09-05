// src/components/environmental/panels/LiveMonitoringPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Row, Col, Card, Statistic, Tag, Button, Space, Spin, Alert,
  List, Avatar, Badge, Divider, Progress, Tooltip, message,
  Modal, Descriptions, Table, Switch, Select, Tabs, Empty,
  Timeline, Collapse, DatePicker, Drawer, Input, Popconfirm
} from 'antd';
import {
  EnvironmentOutlined,
  CameraOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  HeatMapOutlined,
  CloudOutlined,
  FireOutlined,
  SafetyOutlined,
  ExperimentOutlined,
  RadarChartOutlined,
  PushpinOutlined,
  GlobalOutlined,
  ScanOutlined,
  StarOutlined,
  HistoryOutlined,
  AlertFilled,
  FilterOutlined,
  DashboardOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  CompassOutlined,
  FullscreenOutlined,
  InfoCircleOutlined,
  AimOutlined,
  LoadingOutlined,
  SearchOutlined,
  SaveOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import advancedEnvironmentalService from '../../../services/advancedEnvironmentalService';
import './LiveMonitoringPanel.css';
import html2canvas from 'html2canvas';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Search } = Input;

// Detection type configuration
const DETECTION_TYPES = {
  fog: { label: 'Fog/Mist', icon: <CloudOutlined />, color: '#d9d9d9' },
  floor: { label: 'Floor Condition', icon: <EnvironmentOutlined />, color: '#faad14' },
  airQuality: { label: 'Air Quality', icon: <ExperimentOutlined />, color: '#1890ff' },
  emissions: { label: 'Emissions', icon: <FireOutlined />, color: '#f5222d' },
  ppe: { label: 'PPE Compliance', icon: <SafetyOutlined />, color: '#52c41a' },
  spill: { label: 'Spill/Hazard', icon: <WarningOutlined />, color: '#cf1322' },
  smoke: { label: 'Smoke/Fire', icon: <FireOutlined />, color: '#fa541c' },
  flood: { label: 'Flooding', icon: <GlobalOutlined />, color: '#096dd9' },
  accident: { label: 'Accident/Incident', icon: <AlertFilled />, color: '#f5222d' }
};

// Custom marker icons
const createCustomIcon = (status, size = 32) => {
  const colors = {
    'normal': '#52c41a',
    'online': '#52c41a',
    'warning': '#faad14',
    'anomaly': '#f5222d',
    'critical': '#cf1322'
  };
  
  const color = colors[status?.toLowerCase()] || '#1890ff';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size/2}px;
        font-weight: bold;
        color: white;
        transition: all 0.3s ease;
        cursor: pointer;
        ${status === 'anomaly' || status === 'critical' ? 'animation: pulse 1.5s infinite;' : ''}
      ">
        ${status === 'critical' ? '🚨' : status === 'anomaly' ? '⚠' : status === 'warning' ? '⚡' : '✓'}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

// =============================================================
// NEUTRAL DEFAULT LOCATION (Center of the world, not country-specific)
// =============================================================
const NEUTRAL_LOCATION = {
  lat: 0,
  lng: 0,
  name: 'Global View'
};

// =============================================================
// SAFE MAP CONTAINER
// =============================================================
const SafeMapContainer = ({ children, ...props }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      setIsMounted(false);
      setIsReady(false);
      if (mapRef.current) {
        try {
          mapRef.current.invalidateSize();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  if (!isMounted || !isReady) {
    return (
      <div style={{ 
        height: '100%', 
        width: '100%', 
        background: '#1a1a2e', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px'
      }}>
        <Spin tip="Loading map..." />
      </div>
    );
  }

  return (
    <MapContainer
      ref={mapRef}
      {...props}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      whenReady={() => {
        setTimeout(() => {
          try {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          } catch (e) {
            console.warn('Map invalidateSize error:', e);
          }
        }, 200);
      }}
    >
      {children}
    </MapContainer>
  );
};

// =============================================================
// MAP CLICK HANDLER - User selects location on map
// =============================================================
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (onLocationSelect) {
        // Reverse geocode to get location name
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`)
          .then(res => res.json())
          .then(data => {
            const displayName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            onLocationSelect({ lat, lng, name: displayName });
          })
          .catch(() => {
            onLocationSelect({ lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          });
      }
    }
  });
  return null;
};

// =============================================================
// MAP CONTROLS
// =============================================================
const MapControls = ({ onReset }) => {
  const map = useMap();
  
  const handleZoomIn = () => {
    try {
      if (map) map.zoomIn();
    } catch (e) {
      console.warn('Zoom in error:', e);
    }
  };
  
  const handleZoomOut = () => {
    try {
      if (map) map.zoomOut();
    } catch (e) {
      console.warn('Zoom out error:', e);
    }
  };
  
  const handleReset = () => {
    try {
      if (onReset) {
        onReset();
      } else if (map) {
        map.setView([0, 0], 2);
      }
    } catch (e) {
      console.warn('Reset view error:', e);
    }
  };
  
  const handleFullscreen = () => {
    try {
      const container = map?.getContainer();
      if (container && container.requestFullscreen) {
        container.requestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen error:', e);
    }
  };
  
  return (
    <div className="map-controls" style={{
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <Tooltip title="Zoom In">
        <Button size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} />
      </Tooltip>
      <Tooltip title="Zoom Out">
        <Button size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
      </Tooltip>
      <Tooltip title="Reset View">
        <Button size="small" icon={<CompassOutlined />} onClick={handleReset} />
      </Tooltip>
      <Tooltip title="Fullscreen">
        <Button size="small" icon={<FullscreenOutlined />} onClick={handleFullscreen} />
      </Tooltip>
    </div>
  );
};

// =============================================================
// MAP SEARCH
// =============================================================
const MapSearch = ({ onSearch, analyzing }) => {
  const map = useMap();
  const [searching, setSearching] = useState(false);
  
  const handleSearch = async (value) => {
    if (!value) return;
    
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        try {
          map.setView([parseFloat(lat), parseFloat(lon)], 15);
          if (onSearch) {
            onSearch({ 
              lat: parseFloat(lat), 
              lng: parseFloat(lon), 
              name: data[0].display_name 
            });
          }
          message.success(`📍 Navigated to ${data[0].display_name}`);
        } catch (e) {
          console.warn('Map setView error:', e);
          message.error('Failed to navigate to location');
        }
      } else {
        message.warning('Location not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      message.error('Failed to search location');
    } finally {
      setSearching(false);
    }
  };
  
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      width: '400px',
      maxWidth: '90%'
    }}>
      <Search
        placeholder="Search any location worldwide..."
        onSearch={handleSearch}
        enterButton={<SearchOutlined />}
        loading={searching}
        size="middle"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
      />
    </div>
  );
};

// =============================================================
// AUTO LOCATION DETECTION
// =============================================================
const AutoLocationButton = ({ onLocationFound, analyzing }) => {
  const [detecting, setDetecting] = useState(false);
  const map = useMap();
  
  const detectLocation = () => {
    setDetecting(true);
    if (!navigator.geolocation) {
      message.error('Geolocation is not supported by your browser');
      setDetecting(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        try {
          map.setView([latitude, longitude], 15);
          // Reverse geocode to get location name
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`)
            .then(res => res.json())
            .then(data => {
              const displayName = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              if (onLocationFound) {
                onLocationFound({ lat: latitude, lng: longitude, name: displayName });
              }
              message.success(`📍 Location detected: ${displayName}`);
            })
            .catch(() => {
              if (onLocationFound) {
                onLocationFound({ lat: latitude, lng: longitude, name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
              }
              message.success('Location detected');
            });
        } catch (e) {
          console.warn('Map setView error:', e);
          message.error('Failed to navigate to location');
        }
        setDetecting(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        message.error('Failed to detect location. Please search manually.');
        setDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };
  
  return (
    <Tooltip title="Detect My Location">
      <Button
        type="primary"
        icon={detecting ? <LoadingOutlined /> : <AimOutlined />}
        onClick={detectLocation}
        loading={detecting}
        size="small"
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          marginRight: '8px'
        }}
      >
        {detecting ? 'Detecting...' : 'My Location'}
      </Button>
    </Tooltip>
  );
};

// =============================================================
// HEATMAP LAYER
// =============================================================
const HeatmapLayer = ({ data }) => {
  const map = useMap();
  const layerRef = useRef(null);
  
  useEffect(() => {
    if (!data || data.length === 0 || !map) return;
    
    try {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
      
      const heatLayer = L.layerGroup();
      
      data.forEach(point => {
        const intensity = Math.min(point.intensity || 0.1, 1);
        const radius = 50 + intensity * 150;
        const opacity = 0.2 + intensity * 0.5;
        const color = intensity > 0.7 ? '#f5222d' : intensity > 0.4 ? '#faad14' : '#52c41a';
        
        const circle = L.circle([point.lat, point.lng], {
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: opacity,
          weight: 0
        });
        
        circle.bindPopup(`
          <div style="font-size:12px;">
            <strong>${point.site_name || 'Location'}</strong><br/>
            Risk: ${Math.round(intensity * 100)}%<br/>
            ${point.type ? `Type: ${point.type}` : ''}
          </div>
        `);
        
        heatLayer.addLayer(circle);
      });
      
      heatLayer.addTo(map);
      layerRef.current = heatLayer;
    } catch (e) {
      console.warn('Heatmap layer error:', e);
    }
    
    return () => {
      if (layerRef.current && map) {
        try {
          map.removeLayer(layerRef.current);
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [data, map]);
  
  return null;
};

// =============================================================
// MAIN COMPONENT
// =============================================================
const LiveMonitoringPanel = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteDetails, setSiteDetails] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [activeTab, setActiveTab] = useState('map');
  const [cameraFeeds, setCameraFeeds] = useState([]);
  const [esgData, setEsgData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [detectionFilter, setDetectionFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [showHistorical, setShowHistorical] = useState(true);
  const [mapCenter, setMapCenter] = useState([NEUTRAL_LOCATION.lat, NEUTRAL_LOCATION.lng]);
  const [mapZoom, setMapZoom] = useState(2);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationDetected, setIsLocationDetected] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [currentLocation, setCurrentLocation] = useState({
    lat: NEUTRAL_LOCATION.lat,
    lng: NEUTRAL_LOCATION.lng,
    name: NEUTRAL_LOCATION.name,
    source: 'neutral' // 'auto', 'user', 'saved', 'search', 'click'
  });
  const [stats, setStats] = useState({
    totalSites: 0,
    activeDetections: 0,
    activeAlerts: 0,
    predictionsCount: 0
  });
  
  const mapRef = useRef(null);
  const intervalRef = useRef(null);

  // =============================================================
  // LOAD SAVED PREFERENCE FROM localStorage
  // =============================================================
  const loadSavedPreference = () => {
    try {
      const saved = localStorage.getItem('userLocationPreference');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lng) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved preference:', e);
    }
    return null;
  };

  const saveLocationPreference = (location) => {
    try {
      localStorage.setItem('userLocationPreference', JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        name: location.name || 'Custom Location',
        savedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Failed to save preference:', e);
    }
  };

  const clearSavedPreference = () => {
    try {
      localStorage.removeItem('userLocationPreference');
      message.success('Saved location cleared');
    } catch (e) {
      console.warn('Failed to clear preference:', e);
    }
  };

  // =============================================================
  // CAPTURE MAP IMAGE
  // =============================================================
  const captureMapImage = async () => {
    try {
      const mapContainer = mapRef.current?.getContainer();
      if (!mapContainer) {
        console.warn('Map container not found');
        return null;
      }
      
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        scale: 1.2,
        backgroundColor: '#1a1a2e',
        logging: false,
        width: 800,
        height: 600
      });
      
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (error) {
      console.error('Failed to capture map image:', error);
      return null;
    }
  };

  // =============================================================
  // LOAD MONITORING DATA
  // =============================================================
  const loadMonitoringData = async (lat, lng, locationName = null) => {
    setLoading(true);
    setError(null);

    try {
      // Get coordinates
      let finalLat = lat;
      let finalLng = lng;
      
      if (!finalLat || !finalLng) {
        // Try user location first
        if (userLocation) {
          finalLat = userLocation.lat;
          finalLng = userLocation.lng;
        } else {
          // Try saved preference
          const saved = loadSavedPreference();
          if (saved) {
            finalLat = saved.lat;
            finalLng = saved.lng;
          } else {
            // Use neutral default
            finalLat = NEUTRAL_LOCATION.lat;
            finalLng = NEUTRAL_LOCATION.lng;
          }
        }
      }
      
      // Update current location
      setCurrentLocation({
        lat: finalLat,
        lng: finalLng,
        name: locationName || `${finalLat.toFixed(4)}, ${finalLng.toFixed(4)}`,
        source: locationName ? 'search' : 'auto'
      });
      
      // Update map
      setMapCenter([finalLat, finalLng]);
      setMapZoom(locationName ? 15 : 3);
      
      // Capture map image
      let mapImage = await captureMapImage();
      
      const params = {
        lat: finalLat,
        lng: finalLng,
        zoom: locationName ? 15 : 10
      };
      
      if (mapImage) {
        params.image = mapImage;
      }
      
      // Call API
      const monitoringResponse = await advancedEnvironmentalService.analyzeWithImage(params);
      
      if (monitoringResponse?.success) {
        const sitesList = monitoringResponse.sites || [];
        setSites(sitesList);
        
        setStats({
          totalSites: sitesList.length,
          activeDetections: sitesList.reduce((sum, s) => sum + (s.detections?.length || 0), 0),
          activeAlerts: 0,
          predictionsCount: 0
        });
        
        if (sitesList.length === 0) {
          message.info(`📍 ${currentLocation.name || 'Location'} - No sites found. Try another area.`);
        } else {
          message.success(`📍 ${currentLocation.name || 'Location'} - Found ${sitesList.length} sites`);
        }
      }
      
      // Fetch other data
      const [heatmapResponse, esgResponse] = await Promise.allSettled([
        advancedEnvironmentalService.getHeatmapData({ lat: finalLat, lng: finalLng }),
        advancedEnvironmentalService.getESGData({ lat: finalLat, lng: finalLng })
      ]);
      
      if (heatmapResponse.status === 'fulfilled') {
        setHeatmapData(heatmapResponse.value?.data || []);
      }
      
      if (esgResponse.status === 'fulfilled') {
        setEsgData(esgResponse.value);
      }

    } catch (err) {
      console.error('Failed to load monitoring data:', err);
      setError(err.message || 'Failed to load monitoring data');
      message.error('Failed to load data for this location');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  // =============================================================
  // LOCATION HANDLERS
  // =============================================================
  
  // Auto-detect location
  const handleLocationFound = (location) => {
    setUserLocation(location);
    setIsLocationDetected(true);
    setCurrentLocation({
      lat: location.lat,
      lng: location.lng,
      name: location.name || 'Your Location',
      source: 'auto'
    });
    setMapCenter([location.lat, location.lng]);
    setMapZoom(15);
    setMapKey(prev => prev + 1);
    // Save as preference
    saveLocationPreference(location);
    loadMonitoringData(location.lat, location.lng, location.name);
  };

  // User searches for location
  const handleSearchLocation = (location) => {
    setCurrentLocation({
      lat: location.lat,
      lng: location.lng,
      name: location.name || 'Searched Location',
      source: 'search'
    });
    setMapCenter([location.lat, location.lng]);
    setMapZoom(15);
    setMapKey(prev => prev + 1);
    // Save as preference
    saveLocationPreference(location);
    loadMonitoringData(location.lat, location.lng, location.name);
  };

  // User clicks on map
  const handleMapClick = (location) => {
    setCurrentLocation({
      lat: location.lat,
      lng: location.lng,
      name: location.name || 'Selected Location',
      source: 'click'
    });
    setMapCenter([location.lat, location.lng]);
    setMapZoom(15);
    setMapKey(prev => prev + 1);
    // Save as preference
    saveLocationPreference(location);
    loadMonitoringData(location.lat, location.lng, location.name);
  };

  // Use saved preference
  const handleUseSavedLocation = () => {
    const saved = loadSavedPreference();
    if (saved) {
      setCurrentLocation({
        lat: saved.lat,
        lng: saved.lng,
        name: saved.name || 'Saved Location',
        source: 'saved'
      });
      setMapCenter([saved.lat, saved.lng]);
      setMapZoom(15);
      setMapKey(prev => prev + 1);
      loadMonitoringData(saved.lat, saved.lng, saved.name);
      message.success(`📍 Using saved location: ${saved.name}`);
    } else {
      message.info('No saved location found. Search or click on the map.');
    }
  };

  // Reset to neutral view
  const handleResetView = () => {
    setCurrentLocation({
      lat: NEUTRAL_LOCATION.lat,
      lng: NEUTRAL_LOCATION.lng,
      name: NEUTRAL_LOCATION.name,
      source: 'neutral'
    });
    setMapCenter([NEUTRAL_LOCATION.lat, NEUTRAL_LOCATION.lng]);
    setMapZoom(2);
    setMapKey(prev => prev + 1);
    setSites([]);
    setHeatmapData([]);
    setEsgData(null);
    message.info('🌍 Reset to global view');
  };

  // =============================================================
  // SITE DETAILS
  // =============================================================
  const loadSiteDetails = async (siteId) => {
    try {
      const response = await advancedEnvironmentalService.getSiteDetails(siteId);
      setSiteDetails(response);
      if (response?.cameras) {
        setCameraFeeds(response.cameras);
      }
    } catch (err) {
      console.error('Failed to load site details:', err);
      message.error('Failed to load site details');
    }
  };

  const loadCameraFeeds = async (siteId) => {
    try {
      const response = await advancedEnvironmentalService.getCameraFeeds(siteId);
      setCameraFeeds(response?.feeds || []);
    } catch (err) {
      console.error('Failed to load camera feeds:', err);
      message.error('Failed to load camera feeds');
    }
  };

  const handleViewSite = async (site) => {
    setSelectedSite(site);
    setDetailsVisible(true);
    await loadSiteDetails(site.id);
    await loadCameraFeeds(site.id);
  };

  const handleRefresh = () => {
    if (currentLocation.lat || currentLocation.lng) {
      loadMonitoringData(currentLocation.lat, currentLocation.lng, currentLocation.name);
    } else {
      loadMonitoringData();
    }
    message.success('Monitoring data refreshed');
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await advancedEnvironmentalService.acknowledgeAlert(alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
      message.success('Alert acknowledged');
    } catch (error) {
      message.error('Failed to acknowledge alert');
    }
  };

  const handleDetectionClick = (detection) => {
    setSelectedDetection(detection);
    setDrawerVisible(true);
  };

  // =============================================================
  // EFFECTS
  // =============================================================
  
  // Auto-detect on mount
  useEffect(() => {
    // Check for saved preference first
    const saved = loadSavedPreference();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocode to get name
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`)
            .then(res => res.json())
            .then(data => {
              const displayName = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              handleLocationFound({ lat: latitude, lng: longitude, name: displayName });
            })
            .catch(() => {
              handleLocationFound({ lat: latitude, lng: longitude, name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
            });
        },
        (error) => {
          console.log('Auto-location failed:', error);
          if (saved) {
            // Use saved preference
            handleUseSavedLocation();
          } else {
            // Use neutral default
            loadMonitoringData(NEUTRAL_LOCATION.lat, NEUTRAL_LOCATION.lng, NEUTRAL_LOCATION.name);
            message.info('🌍 Please search for a location or click on the map');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000
        }
      );
    } else if (saved) {
      // Use saved preference
      handleUseSavedLocation();
    } else {
      // Use neutral default
      loadMonitoringData(NEUTRAL_LOCATION.lat, NEUTRAL_LOCATION.lng, NEUTRAL_LOCATION.name);
      message.info('🌍 Search for a location or click on the map to get started');
    }

    // Auto-refresh
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        if (currentLocation.lat || currentLocation.lng) {
          loadMonitoringData(currentLocation.lat, currentLocation.lng, currentLocation.name);
        }
      }, refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update auto-refresh
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (autoRefresh && (currentLocation.lat || currentLocation.lng)) {
      intervalRef.current = setInterval(() => {
        loadMonitoringData(currentLocation.lat, currentLocation.lng, currentLocation.name);
      }, refreshInterval * 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, currentLocation]);

  // =============================================================
  // HELPER FUNCTIONS
  // =============================================================
  const getStatusColor = (status) => {
    const colors = {
      'normal': '#52c41a',
      'online': '#52c41a',
      'warning': '#faad14',
      'anomaly': '#f5222d',
      'critical': '#cf1322',
      'offline': '#d9d9d9',
      'low': '#52c41a',
      'medium': '#faad14',
      'high': '#f5222d',
      'severe': '#cf1322'
    };
    return colors[status?.toLowerCase()] || '#d9d9d9';
  };

  const getStatusText = (status) => {
    const texts = {
      'normal': 'Normal',
      'online': 'Online',
      'warning': 'Warning',
      'anomaly': 'Anomaly Detected',
      'critical': 'Critical',
      'offline': 'Offline',
      'low': 'Low Risk',
      'medium': 'Medium Risk',
      'high': 'High Risk',
      'severe': 'Severe'
    };
    return texts[status?.toLowerCase()] || status;
  };

  const getDetectionIcon = (type) => {
    return DETECTION_TYPES[type]?.icon || <ScanOutlined />;
  };

  const getDetectionColor = (type) => {
    return DETECTION_TYPES[type]?.color || '#1890ff';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#cf1322';
    if (confidence >= 60) return '#faad14';
    return '#52c41a';
  };

  const normalizeAQI = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return { value: 0, label: 'N/A', color: 'default' };
    }
    const val = Math.max(0, Math.min(100, Math.round(value)));
    let label = '';
    let color = '';
    if (val >= 80) { label = 'Good'; color = 'green'; }
    else if (val >= 60) { label = 'Moderate'; color = 'lime'; }
    else if (val >= 40) { label = 'Unhealthy for Sensitive'; color = 'orange'; }
    else if (val >= 20) { label = 'Unhealthy'; color = 'volcano'; }
    else { label = 'Very Unhealthy'; color = 'red'; }
    return { value: val, label, color };
  };

  // =============================================================
  // RENDER FUNCTIONS
  // =============================================================

  // Render ESG Scorecard
  const renderESGScorecard = () => {
    if (!esgData) {
      return <Empty description="No ESG data available" />;
    }

    const environmental = esgData.environmental || {};
    const social = esgData.social || {};
    const governance = esgData.governance || {};
    const scores = esgData.scores || {};

    const airQuality = Math.round(Math.max(0, Math.min(100, environmental.airQuality || environmental.air_quality || 0)));
    const emissions = Math.round(Math.max(0, Math.min(100, environmental.emissions || 0)));
    const waterQuality = Math.round(Math.max(0, Math.min(100, environmental.waterQuality || environmental.water_quality || 0)));
    const biodiversity = Math.round(Math.max(0, Math.min(100, environmental.biodiversity || 0)));
    const vegetationHealth = Math.round(Math.max(0, Math.min(100, environmental.vegetationHealth || environmental.vegetation_health || 0)));
    const carbonSequestration = Math.round(Math.max(0, Math.min(100, environmental.carbonSequestration || environmental.carbon_sequestration || 0)));

    const healthCompliance = Math.round(Math.max(0, Math.min(100, social.healthCompliance || social.health_compliance || 0)));
    const ppeCompliance = Math.round(Math.max(0, Math.min(100, social.ppeCompliance || social.ppe_compliance || 0)));
    const communityImpact = Math.round(Math.max(0, Math.min(100, social.communityImpact || social.community_impact || 0)));
    const safetyRisk = Math.round(Math.max(0, Math.min(100, social.safetyRisk || social.safety_risk || 0)));

    const complianceScore = Math.round(Math.max(0, Math.min(100, governance.complianceScore || governance.compliance_score || 0)));
    const riskScore = Math.round(Math.max(0, Math.min(100, governance.riskScore || governance.risk_score || 0)));
    const transparencyScore = Math.round(Math.max(0, Math.min(100, governance.transparencyScore || governance.transparency_score || 0)));
    const envGovernance = Math.round(Math.max(0, Math.min(100, governance.environmentalGovernance || governance.environmental_governance || 0)));

    const envScore = Math.round(Math.max(0, Math.min(100, scores.environmental || 0)));
    const socialScore = Math.round(Math.max(0, Math.min(100, scores.social || 0)));
    const govScore = Math.round(Math.max(0, Math.min(100, scores.governance || 0)));

    const getScoreColor = (score) => {
      if (score >= 80) return '#52c41a';
      if (score >= 60) return '#faad14';
      if (score >= 40) return '#fa8c16';
      return '#f5222d';
    };

    const getScoreEmoji = (score) => {
      if (score >= 80) return '🌟';
      if (score >= 60) return '👍';
      if (score >= 40) return '📊';
      return '⚠️';
    };

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card 
            title={
              <Space>
                <StarOutlined style={{ color: '#52c41a' }} />
                <span>Environmental</span>
                <Tag color={getScoreColor(envScore)}>
                  {getScoreEmoji(envScore)} {envScore}%
                </Tag>
              </Space>
            }
            style={{ borderTop: `3px solid ${getScoreColor(envScore)}` }}
            size="small"
          >
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Statistic 
                  title="Air Quality" 
                  value={airQuality} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(airQuality) }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Emissions" 
                  value={emissions} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(100 - emissions) }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Water Quality" 
                  value={waterQuality} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(waterQuality) }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Biodiversity" 
                  value={biodiversity} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(biodiversity) }}
                />
              </Col>
            </Row>
            <Progress 
              percent={envScore} 
              strokeColor={getScoreColor(envScore)}
              format={(p) => `${p}% Overall`}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            title={
              <Space>
                <SafetyOutlined style={{ color: '#1890ff' }} />
                <span>Social</span>
                <Tag color={getScoreColor(socialScore)}>
                  {getScoreEmoji(socialScore)} {socialScore}%
                </Tag>
              </Space>
            }
            style={{ borderTop: `3px solid ${getScoreColor(socialScore)}` }}
            size="small"
          >
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Statistic 
                  title="Health Compliance" 
                  value={healthCompliance} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(healthCompliance) }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="PPE Compliance" 
                  value={ppeCompliance} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(ppeCompliance) }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Community Impact" 
                  value={communityImpact} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(communityImpact) }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Safety Score" 
                  value={safetyRisk} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(safetyRisk) }}
                />
              </Col>
            </Row>
            <Progress 
              percent={socialScore} 
              strokeColor={getScoreColor(socialScore)}
              format={(p) => `${p}% Overall`}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card 
            title={
              <Space>
                <DashboardOutlined style={{ color: '#faad14' }} />
                <span>Governance</span>
                <Tag color={getScoreColor(govScore)}>
                  {getScoreEmoji(govScore)} {govScore}%
                </Tag>
              </Space>
            }
            style={{ borderTop: `3px solid ${getScoreColor(govScore)}` }}
            size="small"
          >
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Statistic 
                  title="Compliance" 
                  value={complianceScore} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(complianceScore) }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Risk Score" 
                  value={riskScore} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(100 - riskScore) }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Transparency" 
                  value={transparencyScore} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(transparencyScore) }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Env Governance" 
                  value={envGovernance} 
                  suffix="%"
                  valueStyle={{ fontSize: '14px', color: getScoreColor(envGovernance) }}
                />
              </Col>
            </Row>
            <Progress 
              percent={govScore} 
              strokeColor={getScoreColor(govScore)}
              format={(p) => `${p}% Overall`}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Render Detection Drawer
  const renderDetectionDrawer = () => {
    if (!selectedDetection) return null;
    
    return (
      <Drawer
        title={
          <Space>
            {getDetectionIcon(selectedDetection.type)}
            <span>{DETECTION_TYPES[selectedDetection.type]?.label || selectedDetection.type}</span>
            <Tag color={getStatusColor(selectedDetection.severity)}>
              {selectedDetection.severity?.toUpperCase()}
            </Tag>
          </Space>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        <div style={{ padding: '16px 0' }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Type">
              {DETECTION_TYPES[selectedDetection.type]?.label || selectedDetection.type}
            </Descriptions.Item>
            <Descriptions.Item label="Confidence">
              <Progress 
                percent={selectedDetection.confidence} 
                strokeColor={getConfidenceColor(selectedDetection.confidence)}
                format={() => `${selectedDetection.confidence}%`}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Severity">
              <Tag color={getStatusColor(selectedDetection.severity)}>
                {selectedDetection.severity?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedDetection.location || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Site">
              {selectedDetection.siteName || 'Unknown'}
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {selectedDetection.timestamp ? new Date(selectedDetection.timestamp).toLocaleString() : 'N/A'}
            </Descriptions.Item>
            {selectedDetection.details && (
              <Descriptions.Item label="Details">
                <div style={{ fontSize: '12px' }}>
                  {Object.entries(selectedDetection.details).map(([key, value]) => (
                    <div key={key}><strong>{key}:</strong> {String(value)}</div>
                  ))}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
          
          {selectedDetection.image && (
            <div style={{ marginTop: 16 }}>
              <h4>Detection Image</h4>
              <img 
                src={selectedDetection.image} 
                alt="Detection"
                style={{ width: '100%', borderRadius: '8px' }}
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
          
          <div style={{ marginTop: 16 }}>
            <Button type="primary" block onClick={() => {
              const site = sites.find(s => s.id === selectedDetection.siteId);
              if (site) {
                setDrawerVisible(false);
                handleViewSite(site);
              }
            }}>
              View Full Site Details
            </Button>
          </div>
        </div>
      </Drawer>
    );
  };

  // Render site details modal
  const renderSiteDetailsModal = () => {
    if (!selectedSite) return null;

    const sitePredictions = selectedSite.predictions || [];
    const predictions = sitePredictions.length > 0 
      ? sitePredictions 
      : (siteDetails?.predictions || []);

    return (
      <Modal
        title={
          <Space>
            <EnvironmentOutlined />
            {selectedSite.name}
            <Tag color={getStatusColor(selectedSite.status)}>
              {getStatusText(selectedSite.status)}
            </Tag>
          </Space>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
          <Button key="refresh" type="primary" onClick={() => loadSiteDetails(selectedSite.id)}>
            <ReloadOutlined /> Refresh
          </Button>
        ]}
      >
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Overview" key="overview">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Location">
                {selectedSite.location || selectedSite.address || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedSite.status)}>
                  {getStatusText(selectedSite.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Temperature">
                {selectedSite.temperature ? `${selectedSite.temperature}°C` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Air Quality">
                {(() => {
                  const aqiValue = selectedSite.aqi || selectedSite.air_quality;
                  const aqiData = normalizeAQI(aqiValue);
                  return aqiData.label === 'N/A' ? (
                    <span style={{ color: '#8c8c8c' }}>N/A</span>
                  ) : (
                    <Tag color={aqiData.color}>
                      {aqiData.value}% - {aqiData.label}
                    </Tag>
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Risk Score" span={2}>
                <Progress 
                  percent={selectedSite.risk_score || 0} 
                  strokeColor={selectedSite.risk_score > 50 ? '#f5222d' : '#faad14'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated" span={2}>
                {selectedSite.last_updated ? new Date(selectedSite.last_updated).toLocaleString() : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            {selectedSite.weather && (
              <div style={{ marginTop: 16 }}>
                <Divider orientation="left"><CloudOutlined /> Current Weather</Divider>
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="Condition" value={selectedSite.weather.condition || 'Normal'} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="Temperature" value={selectedSite.weather.temperature || 0} suffix="°C" />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="Humidity" value={selectedSite.weather.humidity || 0} suffix="%" />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="Wind Speed" value={selectedSite.weather.windSpeed || 0} suffix="km/h" />
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {selectedSite.detections?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Divider orientation="left"><ScanOutlined /> Active Detections</Divider>
                <Table
                  size="small"
                  dataSource={selectedSite.detections}
                  columns={[
                    { 
                      title: 'Type', 
                      dataIndex: 'type', 
                      key: 'type',
                      render: (type) => (
                        <Space>
                          {getDetectionIcon(type)}
                          {DETECTION_TYPES[type]?.label || type}
                        </Space>
                      )
                    },
                    { 
                      title: 'Confidence', 
                      dataIndex: 'confidence', 
                      key: 'confidence',
                      render: (val) => (
                        <Progress 
                          percent={val} 
                          size="small" 
                          strokeColor={getConfidenceColor(val)}
                          style={{ width: 80 }}
                        />
                      )
                    },
                    { 
                      title: 'Severity', 
                      dataIndex: 'severity', 
                      key: 'severity',
                      render: (val) => (
                        <Tag color={getStatusColor(val)}>{val.toUpperCase()}</Tag>
                      )
                    },
                    { 
                      title: 'Location', 
                      dataIndex: 'location', 
                      key: 'location' 
                    },
                    { 
                      title: 'Time', 
                      dataIndex: 'timestamp', 
                      key: 'timestamp',
                      render: (val) => val ? new Date(val).toLocaleString() : 'N/A'
                    }
                  ]}
                  pagination={false}
                />
              </div>
            )}
          </TabPane>

          <TabPane tab="Camera Feeds" key="cameras">
            {cameraFeeds?.length > 0 ? (
              <Row gutter={[16, 16]}>
                {cameraFeeds.map((feed, index) => (
                  <Col xs={24} md={12} key={index}>
                    <Card
                      title={
                        <Space>
                          <CameraOutlined />
                          {feed.name || `Camera ${index + 1}`}
                          <Tag color={feed.status === 'online' ? 'green' : 'red'}>
                            {feed.status || 'Unknown'}
                          </Tag>
                        </Space>
                      }
                      size="small"
                    >
                      <div style={{ 
                        height: '250px', 
                        background: '#1a1a2e',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {feed.image_url ? (
                          <img 
                            src={feed.image_url} 
                            alt={feed.name}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <CameraOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                        )}
                        
                        {feed.detections?.map((detection, idx) => (
                          <div
                            key={idx}
                            style={{
                              position: 'absolute',
                              border: `2px solid ${getDetectionColor(detection.type)}`,
                              borderRadius: '4px',
                              padding: '2px 6px',
                              background: 'rgba(0,0,0,0.75)',
                              color: 'white',
                              fontSize: '10px',
                              top: `${Math.random() * 80 + 10}%`,
                              left: `${Math.random() * 80 + 10}%`,
                              pointerEvents: 'none'
                            }}
                          >
                            {DETECTION_TYPES[detection.type]?.label || detection.type} ({detection.confidence}%)
                          </div>
                        ))}

                        <div style={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          background: 'rgba(0,0,0,0.75)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          color: 'white',
                          fontSize: 11
                        }}>
                          <ScanOutlined /> {feed.ai_analysis?.classification || 'Analyzing...'}
                        </div>
                        
                        {feed.last_updated && (
                          <div style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            background: 'rgba(0,0,0,0.75)',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            color: 'white',
                            fontSize: 10
                          }}>
                            {new Date(feed.last_updated).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="No camera feeds available" />
            )}
          </TabPane>

          <TabPane tab="Predictions" key="predictions">
            {predictions.length > 0 ? (
              <List
                dataSource={predictions}
                renderItem={(item) => {
                  const confidence = typeof item.confidence === 'number' 
                    ? Math.min(100, Math.max(0, item.confidence)) 
                    : 0;
                    
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={<RadarChartOutlined />} 
                            style={{ backgroundColor: getConfidenceColor(confidence) }} 
                          />
                        }
                        title={
                          <Space>
                            <span style={{ fontWeight: 500 }}>{item.type || 'Prediction'}</span>
                            <Tag color={getStatusColor(item.severity)}>
                              {item.severity ? item.severity.toUpperCase() : 'UNKNOWN'}
                            </Tag>
                            <Progress 
                              percent={confidence} 
                              size="small" 
                              strokeColor={getConfidenceColor(confidence)}
                              style={{ width: 100 }}
                              format={(p) => `${Math.round(p)}%`}
                            />
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <div>
                              <span style={{ color: '#8c8c8c' }}>Timeframe:</span>{' '}
                              <Tag color="cyan">{item.timeframe || 'N/A'}</Tag>
                            </div>
                            {item.weatherContext && (
                              <div>
                                <Tag icon={<CloudOutlined />} color="blue">
                                  Weather: {item.weatherContext.condition || 'Unknown'}
                                </Tag>
                                {item.weatherContext.temperature !== undefined && (
                                  <Tag color="orange">
                                    Temp: {item.weatherContext.temperature}°C
                                  </Tag>
                                )}
                                {item.weatherContext.windSpeed !== undefined && (
                                  <Tag color="purple">
                                    Wind: {item.weatherContext.windSpeed} km/h
                                  </Tag>
                                )}
                              </div>
                            )}
                            {item.description && (
                              <div style={{ color: '#595959', fontSize: '13px' }}>
                                {item.description}
                              </div>
                            )}
                            {item.historicalEvents && item.historicalEvents.length > 0 && (
                              <Collapse size="small" ghost>
                                <Panel header={`📊 ${item.historicalEvents.length} Similar Historical Events`} key="1">
                                  <Timeline size="small">
                                    {item.historicalEvents.slice(0, 5).map((event, idx) => (
                                      <Timeline.Item 
                                        key={idx}
                                        color={getStatusColor(event.severity)}
                                      >
                                        <div style={{ fontSize: '13px' }}>
                                          <Tag color={getStatusColor(event.severity)} size="small">
                                            {event.severity || 'Unknown'}
                                          </Tag>
                                          <span style={{ color: '#8c8c8c' }}>
                                            {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                                          </span>
                                          <div>{event.description || 'No description'}</div>
                                        </div>
                                      </Timeline.Item>
                                    ))}
                                  </Timeline>
                                </Panel>
                              </Collapse>
                            )}
                            {item.model_used && (
                              <Tag color="geekblue" icon={<ScanOutlined />}>
                                Model: {item.model_used}
                              </Tag>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty 
                description="No predictions available for this site" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => {
                    message.info('Analyzing site for predictions...');
                    loadSiteDetails(selectedSite.id);
                  }}
                >
                  <ReloadOutlined /> Refresh Predictions
                </Button>
              </Empty>
            )}
          </TabPane>
        </Tabs>
      </Modal>
    );
  };

  // Render detection cards
  const renderDetectionCards = () => {
    const allDetections = sites.flatMap(site => 
      (site.detections || []).map(d => ({
        ...d,
        siteName: site.name,
        siteId: site.id
      }))
    );

    const filteredDetections = detectionFilter === 'all' 
      ? allDetections 
      : allDetections.filter(d => d.type === detectionFilter);

    if (!filteredDetections.length) {
      return <Empty description="No detections match the current filter" />;
    }

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <FilterOutlined />
            <Select value={detectionFilter} onChange={setDetectionFilter} style={{ width: 150 }}>
              <Option value="all">All Detections</Option>
              {Object.entries(DETECTION_TYPES).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Space>
        </div>

        <List
          dataSource={filteredDetections.slice(0, 20)}
          renderItem={detection => (
            <List.Item
              onClick={() => handleDetectionClick(detection)}
              style={{ cursor: 'pointer' }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={getDetectionIcon(detection.type)} 
                    style={{ backgroundColor: getDetectionColor(detection.type) }} 
                  />
                }
                title={
                  <Space>
                    <span>{DETECTION_TYPES[detection.type]?.label || detection.type}</span>
                    <Tag color={getStatusColor(detection.severity)}>
                      {detection.severity?.toUpperCase()}
                    </Tag>
                    <Tag color={getConfidenceColor(detection.confidence)}>
                      {detection.confidence}% confidence
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    <div>📍 {detection.location || detection.siteName}</div>
                    <div>🕐 {detection.timestamp ? new Date(detection.timestamp).toLocaleString() : 'N/A'}</div>
                    {detection.details && (
                      <div>
                        {Object.entries(detection.details).slice(0, 3).map(([key, value]) => (
                          <Tag key={key} icon={<ScanOutlined />}>
                            {key}: {String(value)}
                          </Tag>
                        ))}
                        {Object.keys(detection.details).length > 3 && (
                          <Tag>+{Object.keys(detection.details).length - 3} more</Tag>
                        )}
                      </div>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  // Render predictive analysis
  const renderPredictiveAnalysis = () => {
    if (!predictions.length) {
      return <Empty description="No predictive analysis available" />;
    }

    return (
      <div>
        <Divider orientation="left">
          <Space>
            <RadarChartOutlined />
            AI Predictive Analysis with Weather Correlation
            <Tag color="blue">Real-time</Tag>
          </Space>
        </Divider>

        <Row gutter={[16, 16]}>
          {predictions.slice(0, 6).map((pred, idx) => (
            <Col xs={24} md={12} key={idx}>
              <Card size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Space>
                    <Avatar 
                      icon={<RadarChartOutlined />} 
                      style={{ backgroundColor: getConfidenceColor(pred.confidence) }} 
                    />
                    <div>
                      <strong>{pred.type}</strong>
                      <div>
                        <Tag color={getStatusColor(pred.severity)}>{pred.severity || 'Medium'}</Tag>
                        <Tag color="cyan">{pred.timeframe || 'Unknown'}</Tag>
                      </div>
                    </div>
                  </Space>
                  <Progress 
                    type="circle" 
                    percent={pred.confidence} 
                    width={50}
                    strokeColor={getConfidenceColor(pred.confidence)}
                    format={() => `${pred.confidence}%`}
                  />
                </div>

                {pred.weatherContext && (
                  <div style={{ marginTop: 12 }}>
                    <Collapse size="small">
                      <Panel header="Weather Context & Historical Correlation" key="1">
                        <div>
                          <p><strong>Current Conditions:</strong></p>
                          <Space>
                            <Tag icon={<CloudOutlined />}>{pred.weatherContext.condition}</Tag>
                            <Tag>Temp: {pred.weatherContext.temperature}°C</Tag>
                            <Tag>Wind: {pred.weatherContext.windSpeed} km/h</Tag>
                          </Space>
                          
                          {pred.historicalEvents && pred.historicalEvents.length > 0 && (
                            <>
                              <Divider style={{ margin: '8px 0' }} />
                              <p><strong>Similar Historical Events:</strong></p>
                              <List
                                size="small"
                                dataSource={pred.historicalEvents}
                                renderItem={item => (
                                  <List.Item>
                                    <Space>
                                      <Tag color={getStatusColor(item.severity)}>{item.severity}</Tag>
                                      <span>{item.date}: {item.description}</span>
                                    </Space>
                                  </List.Item>
                                )}
                              />
                            </>
                          )}
                        </div>
                      </Panel>
                    </Collapse>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  // Render historical data
  const renderHistoricalData = () => {
    if (!historicalData.length) {
      return <Empty description="No historical data available" />;
    }

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <HistoryOutlined />
            <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
              <Option value="24h">Last 24h</Option>
              <Option value="7d">Last 7 Days</Option>
              <Option value="30d">Last 30 Days</Option>
              <Option value="90d">Last 90 Days</Option>
            </Select>
          </Space>
        </div>

        <Timeline mode="left">
          {historicalData.slice(0, 10).map((incident, idx) => (
            <Timeline.Item 
              key={idx}
              color={getStatusColor(incident.severity)}
              label={incident.date || 'N/A'}
            >
              <Card size="small">
                <Space direction="vertical">
                  <Space>
                    <Tag color={getStatusColor(incident.severity)}>{incident.severity || 'Unknown'}</Tag>
                    <Tag>{incident.type || 'Incident'}</Tag>
                    <span>{incident.site}</span>
                  </Space>
                  <p>{incident.description}</p>
                  {incident.weather && (
                    <Tag icon={<CloudOutlined />}>Weather: {incident.weather}</Tag>
                  )}
                  {incident.detection_type && (
                    <Tag icon={getDetectionIcon(incident.detection_type)}>
                      {DETECTION_TYPES[incident.detection_type]?.label || incident.detection_type}
                    </Tag>
                  )}
                </Space>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    );
  };

  // =============================================================
  // RENDER MAP - UPDATED WITH LOCATION INDICATOR
  // =============================================================
  const renderMap = () => {
    const filteredSites = filterStatus === 'all' 
      ? sites 
      : sites.filter(s => s.status === filterStatus);

    return (
      <div className="map-wrapper" style={{ 
        position: 'relative', 
        height: '550px', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <SafeMapContainer
          key={mapKey}
          center={mapCenter}
          zoom={mapZoom}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          
          <MapClickHandler onLocationSelect={handleMapClick} />
          <MapControls onReset={handleResetView} />
          <MapSearch onSearch={handleSearchLocation} analyzing={analyzing} />
          
          {showHeatmap && heatmapData.length > 0 && (
            <HeatmapLayer data={heatmapData} />
          )}
          
          {/* Site Markers */}
          {filteredSites.map((site) => {
            if (!site.latitude || !site.longitude) return null;
            
            const markerColor = getStatusColor(site.status);
            const customIcon = createCustomIcon(
              site.status, 
              site.status === 'critical' ? 44 : site.status === 'anomaly' ? 38 : 32
            );
            
            return (
              <Marker
                key={site.id}
                position={[site.latitude, site.longitude]}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleViewSite(site),
                }}
              >
                <Popup minWidth={250} maxWidth={300}>
                  <div style={{ padding: '4px 0' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <h4 style={{ margin: 0, fontSize: '14px' }}>
                        <EnvironmentOutlined /> {site.name}
                      </h4>
                      <Tag color={markerColor} style={{ fontSize: '10px' }}>
                        {getStatusText(site.status)}
                      </Tag>
                    </div>
                    
                    <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>Risk Score:</strong></span>
                        <span style={{ color: site.risk_score > 50 ? '#f5222d' : '#52c41a' }}>
                          {site.risk_score || 0}%
                        </span>
                      </div>
                      {site.temperature && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span><strong>Temperature:</strong></span>
                          <span>{site.temperature}°C</span>
                        </div>
                      )}
                      {site.aqi && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span><strong>AQI:</strong></span>
                          <span>{site.aqi}</span>
                        </div>
                      )}
                    </div>
                    
                    <Divider style={{ margin: '8px 0' }} />
                    
                    <Button 
                      size="small" 
                      type="primary" 
                      block
                      onClick={() => handleViewSite(site)}
                    >
                      View Details
                    </Button>
                  </div>
                </Popup>
                
                <Circle
                  center={[site.latitude, site.longitude]}
                  radius={site.status === 'critical' ? 300 : site.status === 'anomaly' ? 200 : 120}
                  pathOptions={{
                    color: markerColor,
                    fillColor: markerColor,
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: site.status === 'warning' ? '5,5' : undefined
                  }}
                />
              </Marker>
            );
          })}
          
          {/* User Location Marker */}
          {userLocation && isLocationDetected && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: `
                  <div style="
                    width: 20px;
                    height: 20px;
                    background: #1890ff;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 20px rgba(24,144,255,0.5);
                    animation: pulse 1.5s infinite;
                  "></div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div>
                  <strong>📍 Your Location</strong>
                  <br />
                  Lat: {userLocation.lat.toFixed(4)}
                  <br />
                  Lng: {userLocation.lng.toFixed(4)}
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Map Controls Overlay */}
          <div style={{
            position: 'absolute',
            top: 80,
            left: 20,
            zIndex: 1000,
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <AutoLocationButton 
              onLocationFound={handleLocationFound} 
              analyzing={analyzing}
            />
            <Button
              size="small"
              icon={<SaveOutlined />}
              onClick={() => {
                if (currentLocation.lat || currentLocation.lng) {
                  saveLocationPreference(currentLocation);
                  message.success('📍 Location saved as preference');
                }
              }}
            >
              Save Location
            </Button>
            <Popconfirm
              title="Clear saved location?"
              onConfirm={clearSavedPreference}
              okText="Yes"
              cancelText="No"
            >
              <Button
                size="small"
                icon={<DeleteOutlined />}
                danger
              >
                Clear Saved
              </Button>
            </Popconfirm>
            <Switch
              checked={showHeatmap}
              onChange={setShowHeatmap}
              checkedChildren="Heat ON"
              unCheckedChildren="Heat OFF"
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
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 110 }}
              size="small"
            >
              <Option value="all">All Sites</Option>
              <Option value="normal">Normal</Option>
              <Option value="warning">Warning</Option>
              <Option value="anomaly">Anomaly</Option>
              <Option value="critical">Critical</Option>
            </Select>
          </div>
          
          {/* Location Info Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 80,
            left: 20,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            backdropFilter: 'blur(10px)',
            maxWidth: '300px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GlobalOutlined />
              <span style={{ fontWeight: 'bold' }}>
                {currentLocation.name || 'Unknown Location'}
              </span>
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              {' • '}
              Source: {currentLocation.source}
            </div>
          </div>
          
          {/* Site Count Overlay */}
          <div style={{
            position: 'absolute',
            top: 80,
            right: 20,
            zIndex: 1000,
            background: 'rgba(255,255,255,0.95)',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            <div><strong>{filteredSites.length}</strong> / {sites.length} sites</div>
            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
              {stats.activeDetections} detections • {stats.activeAlerts} alerts
            </div>
            {isLocationDetected && (
              <div style={{ fontSize: '10px', color: '#1890ff', marginTop: '2px' }}>
                <AimOutlined /> Location detected
              </div>
            )}
          </div>
          
          {/* Loading Overlay */}
          {analyzing && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2000,
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '20px 30px',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Spin />
              <span>Analyzing location...</span>
            </div>
          )}
        </SafeMapContainer>
        
        {/* Map Legend */}
        <div className="map-legend" style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: 'rgba(255,255,255,0.95)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          minWidth: '140px',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            <InfoCircleOutlined /> Legend
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
            <div><span style={{ color: '#52c41a' }}>●</span> Normal</div>
            <div><span style={{ color: '#faad14' }}>●</span> Warning</div>
            <div><span style={{ color: '#f5222d' }}>●</span> Anomaly</div>
            <div><span style={{ color: '#cf1322' }}>●</span> Critical</div>
            {userLocation && (
              <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '4px', marginTop: '4px' }}>
                <span style={{ color: '#1890ff' }}>●</span> Your Location
              </div>
            )}
            {showHeatmap && heatmapData.length > 0 && (
              <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: '4px', marginTop: '4px' }}>
                <HeatMapOutlined /> Heatmap Active
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // =============================================================
  // MAIN RENDER
  // =============================================================
  return (
    <div className="live-monitoring-panel">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12}>
            <Space>
              <h3 style={{ margin: 0 }}>
                <GlobalOutlined style={{ marginRight: 8 }} />
                Live Environmental Monitoring
              </h3>
              <Tag color="green" icon={<CheckCircleOutlined />}>
                {sites.filter(s => s.status === 'normal' || s.status === 'online').length} Online
              </Tag>
              <Tag color="red" icon={<WarningOutlined />}>
                {sites.filter(s => s.status === 'anomaly' || s.status === 'critical').length} Anomalies
              </Tag>
              {isLocationDetected && (
                <Tag color="blue" icon={<AimOutlined />}>
                  Location Detected
                </Tag>
              )}
            </Space>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Switch
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="Auto"
                unCheckedChildren="Manual"
                size="small"
              />
              {autoRefresh && (
                <Select
                  value={refreshInterval}
                  onChange={setRefreshInterval}
                  style={{ width: 80 }}
                  size="small"
                >
                  <Option value={15}>15s</Option>
                  <Option value={30}>30s</Option>
                  <Option value={60}>60s</Option>
                  <Option value={120}>2m</Option>
                </Select>
              )}
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                size="small"
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Current Location Indicator */}
      <div style={{ marginBottom: 16 }}>
        <Card size="small" style={{ background: '#f0f5ff' }}>
          <Space>
            <GlobalOutlined style={{ color: '#1890ff' }} />
            <span style={{ fontWeight: 'bold' }}>Current Location:</span>
            <span>{currentLocation.name || 'Unknown'}</span>
            <Tag color="blue">{currentLocation.source === 'auto' ? 'Auto-detected' : 
                                currentLocation.source === 'saved' ? 'Saved Preference' :
                                currentLocation.source === 'search' ? 'Searched' :
                                currentLocation.source === 'click' ? 'Map Selection' : 'Default'}</Tag>
            <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
              ({currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)})
            </span>
            {currentLocation.source === 'neutral' && (
              <Tag color="orange">Click on map or search to get started</Tag>
            )}
          </Space>
        </Card>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Total Sites" value={stats.totalSites} prefix={<EnvironmentOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="Active Detections" value={stats.activeDetections} prefix={<ScanOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic 
              title="Active Alerts" 
              value={stats.activeAlerts} 
              prefix={<WarningOutlined />}
              valueStyle={{ color: stats.activeAlerts > 0 ? '#f5222d' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic title="AI Predictions" value={stats.predictionsCount} prefix={<RadarChartOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* ESG Scorecard */}
      <div style={{ marginBottom: 16 }}>
        {renderESGScorecard()}
      </div>

      {/* Main Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={<span><GlobalOutlined /> Live Map</span>} 
          key="map"
        >
          {renderMap()}
        </TabPane>

        <TabPane 
          tab={<span><ScanOutlined /> Detections</span>} 
          key="detections"
        >
          {renderDetectionCards()}
        </TabPane>

        <TabPane 
          tab={<span><RadarChartOutlined /> Predictions</span>} 
          key="predictions"
        >
          {renderPredictiveAnalysis()}
        </TabPane>

        <TabPane 
          tab={<span><HistoryOutlined /> Historical</span>} 
          key="historical"
        >
          {renderHistoricalData()}
        </TabPane>

        <TabPane 
          tab={
            <span>
              <WarningOutlined /> Alerts
              {alerts.length > 0 && (
                <Badge count={alerts.length} style={{ marginLeft: 8, backgroundColor: '#f5222d' }} />
              )}
            </span>
          } 
          key="alerts"
        >
          {alerts.length > 0 ? (
            <List
              dataSource={alerts}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button size="small" type="primary" onClick={() => handleAcknowledgeAlert(item.id)}>
                      Acknowledge
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<WarningOutlined />} 
                        style={{ backgroundColor: item.severity === 'Critical' ? '#cf1322' : '#faad14' }} 
                      />
                    }
                    title={
                      <Space>
                        <span>{item.message || item.title}</span>
                        <Tag color={item.severity === 'Critical' ? 'red' : 'orange'}>
                          {item.severity || 'Warning'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <span>📍 {item.site_name || item.site}</span>
                        <span>🕐 {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</span>
                        {item.detection_type && (
                          <Tag icon={getDetectionIcon(item.detection_type)}>
                            {DETECTION_TYPES[item.detection_type]?.label || item.detection_type}
                          </Tag>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No active alerts" />
          )}
        </TabPane>

        <TabPane 
          tab={<span><HeatMapOutlined /> Risk Heatmap</span>} 
          key="heatmap"
        >
          {heatmapData.length > 0 ? (
            <Row gutter={[16, 16]}>
              {heatmapData.map((point, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card size="small">
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: '100%', 
                        height: '80px', 
                        background: `rgba(245, 34, 45, ${Math.min(point.intensity || 0.1, 0.9)})`,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: point.intensity > 0.5 ? 'white' : 'black'
                      }}>
                        <HeatMapOutlined style={{ fontSize: 32 }} />
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Tag color={point.intensity > 0.7 ? 'red' : point.intensity > 0.4 ? 'orange' : 'green'}>
                          {Math.round((point.intensity || 0) * 100)}% risk
                        </Tag>
                        {point.type && <Tag>{point.type}</Tag>}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="No heatmap data available" />
          )}
        </TabPane>
      </Tabs>

      {/* Site Details Modal */}
      {renderSiteDetailsModal()}

      {/* Detection Drawer */}
      {renderDetectionDrawer()}
    </div>
  );
};

export default LiveMonitoringPanel;