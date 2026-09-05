import React, { useState } from 'react';
import { hospitalService } from '../../services/hospitalService';
import './hospital.css';

const InfectionControlPanel = () => {
  const [protocols, setProtocols] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department_id: '',
    standard_precautions: '',
    transmission_precautions: '',
    ppe_requirements: '',
    cleaning_procedures: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProtocols();
  }, []);

  const loadProtocols = async () => {
    try {
      const protocolsData = await hospitalService.getProtocols();
      setProtocols(protocolsData);
    } catch (error) {
      console.error('Error loading protocols:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await hospitalService.createProtocol(formData);
      setShowForm(false);
      setFormData({
        name: '',
        department_id: '',
        standard_precautions: '',
        transmission_precautions: '',
        ppe_requirements: '',
        cleaning_procedures: ''
      });
      loadProtocols();
    } catch (error) {
      console.error('Error creating protocol:', error);
    }
  };

  if (loading) return <div className="loading">Loading protocols...</div>;

  return (
    <div className="infection-control-panel">
      <div className="panel-header">
        <h2>Infection Control Protocols</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'New Protocol'}
        </button>
      </div>

      {showForm && (
        <div className="protocol-form">
          <h3>Create New Protocol</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Protocol Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                >
                  <option value="">All Departments</option>
                  <option value="1">Emergency Room</option>
                  <option value="2">ICU</option>
                  <option value="3">Operating Room</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Standard Precautions</label>
              <textarea
                value={formData.standard_precautions}
                onChange={(e) => setFormData({...formData, standard_precautions: e.target.value})}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Transmission-based Precautions</label>
              <textarea
                value={formData.transmission_precautions}
                onChange={(e) => setFormData({...formData, transmission_precautions: e.target.value})}
                rows="3"
                placeholder="Airborne, droplet, contact precautions..."
              />
            </div>

            <div className="form-group">
              <label>PPE Requirements</label>
              <textarea
                value={formData.ppe_requirements}
                onChange={(e) => setFormData({...formData, ppe_requirements: e.target.value})}
                rows="2"
                placeholder="Required personal protective equipment..."
              />
            </div>

            <div className="form-group">
              <label>Cleaning Procedures</label>
              <textarea
                value={formData.cleaning_procedures}
                onChange={(e) => setFormData({...formData, cleaning_procedures: e.target.value})}
                rows="3"
                placeholder="Disinfection and cleaning protocols..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Create Protocol
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="protocols-list">
        {protocols.map(protocol => (
          <div key={protocol.id} className="protocol-card">
            <div className="protocol-header">
              <h4>{protocol.name}</h4>
              <span className="department-badge">
                {protocol.department?.name || 'All Departments'}
              </span>
            </div>
            
            <div className="protocol-content">
              {protocol.standard_precautions && (
                <div className="protocol-section">
                  <h5>Standard Precautions</h5>
                  <p>{protocol.standard_precautions}</p>
                </div>
              )}

              {protocol.transmission_precautions && (
                <div className="protocol-section">
                  <h5>Transmission-based Precautions</h5>
                  <p>{protocol.transmission_precautions}</p>
                </div>
              )}

              {protocol.ppe_requirements && (
                <div className="protocol-section">
                  <h5>PPE Requirements</h5>
                  <p>{protocol.ppe_requirements}</p>
                </div>
              )}

              {protocol.cleaning_procedures && (
                <div className="protocol-section">
                  <h5>Cleaning Procedures</h5>
                  <p>{protocol.cleaning_procedures}</p>
                </div>
              )}
            </div>

            <div className="protocol-footer">
              <span className="compliance-rate">
                Compliance: {protocol.compliance_rate || 0}%
              </span>
              <span className="last-audit">
                Last audit: {protocol.last_audit_date ? 
                  new Date(protocol.last_audit_date).toLocaleDateString() : 
                  'Never'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {protocols.length === 0 && !showForm && (
        <div className="empty-state">
          <p>No infection control protocols found</p>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            Create First Protocol
          </button>
        </div>
      )}
    </div>
  );
};

export default InfectionControlPanel;