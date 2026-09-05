import { useState, useEffect } from 'react';
import { supplyChainService } from '../services/supplyChainService';

export const useSupplyChain = () => {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryData, suppliersData, alertsData] = await Promise.all([
        supplyChainService.getInventory(),
        supplyChainService.getSuppliers(),
        supplyChainService.getAlerts()
      ]);
      setInventory(inventoryData);
      setSuppliers(suppliersData);
      setAlerts(alertsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refresh = () => {
    setError(null);
    loadData();
  };

  return {
    inventory,
    suppliers,
    transactions,
    alerts,
    loading,
    error,
    refresh,
    addInventoryItem: supplyChainService.addInventoryItem,
    updateInventoryItem: supplyChainService.updateInventoryItem,
    createSupplier: supplyChainService.createSupplier,
    recordTransaction: supplyChainService.recordTransaction,
    resolveAlert: supplyChainService.resolveAlert
  };
};