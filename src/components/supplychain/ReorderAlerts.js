import React from 'react';
import { supplyChainService } from '../../services/supplyChainService';

const ReorderAlerts = ({ alerts }) => {
  const handleResolveAlert = async (alertId) => {
    try {
      await supplyChainService.resolveAlert(alertId);
      // You might want to refresh the alerts data here
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  const criticalAlerts = alerts.filter(alert => alert.alert_level === 'critical');
  const warningAlerts = alerts.filter(alert => alert.alert_level === 'low_stock');

  return (
    <div className="alerts-section">
      {criticalAlerts.length > 0 && (
        <div className="alert-banner critical">
          <h4>🚨 Critical Alerts ({criticalAlerts.length})</h4>
          {criticalAlerts.map(alert => (
            <div key={alert.id} className="alert-item">
              <span className="alert-message">{alert.message}</span>
              <button 
                className="btn-secondary btn-sm"
                onClick={() => handleResolveAlert(alert.id)}
              >
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}

      {warningAlerts.length > 0 && (
        <div className="alert-banner warning">
          <h4>⚠️ Stock Warnings ({warningAlerts.length})</h4>
          {warningAlerts.map(alert => (
            <div key={alert.id} className="alert-item">
              <span className="alert-message">{alert.message}</span>
              <button 
                className="btn-secondary btn-sm"
                onClick={() => handleResolveAlert(alert.id)}
              >
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReorderAlerts;