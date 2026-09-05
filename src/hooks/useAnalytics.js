// Create src/hooks/useAnalytics.js
export const useAnalytics = () => {
  const trackEvent = useCallback((eventName, properties = {}) => {
    // Simple console logging for now - integrate with analytics service later
    console.log(`[Analytics] ${eventName}:`, properties);
    
    // Send to backend for storage
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, properties, timestamp: new Date().toISOString() })
    }).catch(console.error);
  }, []);

  return { trackEvent };
};