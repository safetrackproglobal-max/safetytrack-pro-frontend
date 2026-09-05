import React, { useState } from 'react';
import { supplyChainService } from '../../services/supplyChainService';

const InventoryItemCard = ({ item }) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionData, setTransactionData] = useState({
    quantity: '',
    transaction_type: 'used',
    notes: ''
  });

  const stockPercentage = (item.current_stock / item.max_stock_level) * 100;
  const isLowStock = item.current_stock <= item.min_stock_level;
  const isCriticalStock = item.current_stock <= (item.min_stock_level * 0.3);

  const getStockLevelClass = () => {
    if (isCriticalStock) return 'critical';
    if (isLowStock) return 'low';
    return 'healthy';
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      await supplyChainService.recordTransaction(item.id, transactionData);
      setShowTransactionForm(false);
      setTransactionData({ quantity: '', transaction_type: 'used', notes: '' });
      // You might want to refresh the inventory data here
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  };

  return (
    <div className={`inventory-card ${getStockLevelClass()}-stock`}>
      <div className="item-header">
        <h4>{item.name}</h4>
        <span className="item-category">{item.category}</span>
      </div>

      <div className="item-details">
        <div className="detail-row">
          <span className="label">SKU:</span>
          <span className="value">{item.sku}</span>
        </div>
        <div className="detail-row">
          <span className="label">Current Stock:</span>
          <span className="value">{item.current_stock} {item.unit_of_measure}</span>
        </div>
        <div className="detail-row">
          <span className="label">Min Level:</span>
          <span className="value">{item.min_stock_level}</span>
        </div>
        <div className="detail-row">
          <span className="label">Cost:</span>
          <span className="value">${item.cost_per_unit}/unit</span>
        </div>
        {item.expiry_date && (
          <div className="detail-row">
            <span className="label">Expires:</span>
            <span className="value">{new Date(item.expiry_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="stock-level">
        <div className="stock-info">
          <span>Stock Level</span>
          <span>{Math.round(stockPercentage)}%</span>
        </div>
        <div className="stock-bar">
          <div 
            className={`stock-fill ${getStockLevelClass()}`}
            style={{ width: `${stockPercentage}%` }}
          />
        </div>
      </div>

      <div className="item-actions">
        <button 
          className="btn-primary btn-sm"
          onClick={() => setShowTransactionForm(!showTransactionForm)}
        >
          Record Transaction
        </button>
      </div>

      {showTransactionForm && (
        <div className="transaction-form">
          <h5>Record Transaction</h5>
          <form onSubmit={handleTransactionSubmit}>
            <div className="form-group">
              <label>Transaction Type</label>
              <select
                value={transactionData.transaction_type}
                onChange={(e) => setTransactionData({
                  ...transactionData,
                  transaction_type: e.target.value
                })}
              >
                <option value="received">Received</option>
                <option value="used">Used</option>
                <option value="adjusted">Adjusted</option>
                <option value="wasted">Wasted</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={transactionData.quantity}
                onChange={(e) => setTransactionData({
                  ...transactionData,
                  quantity: e.target.value
                })}
                required
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={transactionData.notes}
                onChange={(e) => setTransactionData({
                  ...transactionData,
                  notes: e.target.value
                })}
                rows="2"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary btn-sm">
                Submit
              </button>
              <button 
                type="button" 
                className="btn-secondary btn-sm"
                onClick={() => setShowTransactionForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InventoryItemCard;