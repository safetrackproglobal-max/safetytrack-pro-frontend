import React, { useState } from 'react';
import { useSupplyChain } from '../../hooks/useSupplyChain';
import InventoryItemCard from './InventoryItemCard';
import ReorderAlerts from './ReorderAlerts';
import './supplychain.css';

const InventoryDashboard = () => {
  const { inventory, alerts, loading, error } = useSupplyChain();
  const [filter, setFilter] = useState('all');

  if (loading) return <div className="loading">Loading inventory data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const filteredInventory = inventory.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'low') return item.current_stock <= item.min_stock_level;
    if (filter === 'critical') return item.current_stock <= (item.min_stock_level * 0.3);
    return item.category === filter;
  });

  const categories = [...new Set(inventory.map(item => item.category))];

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h2>Medical Inventory Management</h2>
        <div className="controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Items</option>
            <option value="low">Low Stock</option>
            <option value="critical">Critical Stock</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <ReorderAlerts alerts={alerts} />

      <div className="inventory-grid">
        {filteredInventory.map(item => (
          <InventoryItemCard key={item.id} item={item} />
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className="empty-state">
          <p>No inventory items found</p>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;