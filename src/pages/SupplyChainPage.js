import React, { useState } from 'react';
import InventoryDashboard from '../components/supplychain/InventoryDashboard';
import SupplierManagement from '../components/supplychain/SupplierManagement';
import ReorderAlerts from '../components/supplychain/ReorderAlerts';
import InventoryAnalytics from '../components/supplychain/InventoryAnalytics';

const SupplyChainPage = () => {
  const [activeTab, setActiveTab] = useState('inventory');

  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏢' },
    { id: 'alerts', label: 'Alerts', icon: '⚠️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Medical Supply Chain Management</h1>
        <p>Manage inventory, suppliers, and ensure adequate stock levels</p>
      </div>

      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'inventory' && <InventoryDashboard />}
        {activeTab === 'suppliers' && <SupplierManagement />}
        {activeTab === 'alerts' && <ReorderAlerts />}
        {activeTab === 'analytics' && <InventoryAnalytics />}
      </div>
    </div>
  );
};

export default SupplyChainPage;