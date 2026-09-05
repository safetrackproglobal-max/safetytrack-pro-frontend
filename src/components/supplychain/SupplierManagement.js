import React, { useState, useEffect } from 'react';
import { supplyChainService } from '../../services/supplyChainService';
import './supplychain.css';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    performance_rating: 5.0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const suppliersData = await supplyChainService.getSuppliers();
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await supplyChainService.createSupplier(formData);
      setShowForm(false);
      setFormData({
        name: '',
        contact_email: '',
        contact_phone: '',
        performance_rating: 5.0
      });
      loadSuppliers();
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  const getPerformanceColor = (rating) => {
    if (rating >= 4.5) return '#4CAF50';
    if (rating >= 3.5) return '#FFC107';
    if (rating >= 2.5) return '#FF9800';
    return '#F44336';
  };

  if (loading) return <div className="loading">Loading suppliers...</div>;

  return (
    <div className="supplier-management">
      <div className="panel-header">
        <h2>Supplier Management</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Supplier'}
        </button>
      </div>

      {showForm && (
        <div className="supplier-form">
          <h3>Add New Supplier</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Supplier Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Performance Rating</label>
                <select
                  value={formData.performance_rating}
                  onChange={(e) => setFormData({...formData, performance_rating: parseFloat(e.target.value)})}
                >
                  <option value={5.0}>5 Stars - Excellent</option>
                  <option value={4.5}>4.5 Stars - Very Good</option>
                  <option value={4.0}>4 Stars - Good</option>
                  <option value={3.5}>3.5 Stars - Average</option>
                  <option value={3.0}>3 Stars - Below Average</option>
                  <option value={2.5}>2.5 Stars - Poor</option>
                  <option value={2.0}>2 Stars - Very Poor</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add Supplier
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="suppliers-grid">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="supplier-card">
            <div className="supplier-header">
              <h4>{supplier.name}</h4>
              <div 
                className="performance-rating"
                style={{ color: getPerformanceColor(supplier.performance_rating) }}
              >
                {supplier.performance_rating} ★
              </div>
            </div>

            <div className="supplier-details">
              {supplier.contact_email && (
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{supplier.contact_email}</span>
                </div>
              )}

              {supplier.contact_phone && (
                <div className="detail-item">
                  <span className="label">Phone:</span>
                  <span className="value">{supplier.contact_phone}</span>
                </div>
              )}

              {supplier.delivery_time_avg && (
                <div className="detail-item">
                  <span className="label">Avg Delivery:</span>
                  <span className="value">{supplier.delivery_time_avg} days</span>
                </div>
              )}
            </div>

            <div className="supplier-footer">
              <span className="supplier-since">
                Since {new Date(supplier.created_at).getFullYear()}
              </span>
              <div className="supplier-actions">
                <button className="btn-secondary btn-sm">
                  Edit
                </button>
                <button className="btn-primary btn-sm">
                  Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {suppliers.length === 0 && !showForm && (
        <div className="empty-state">
          <p>No suppliers found</p>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add First Supplier
          </button>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;