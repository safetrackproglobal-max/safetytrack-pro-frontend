import React, { useState } from 'react';
import PolicyManager from '../components/compliance/PolicyManager';
import ChecklistWizard from '../components/compliance/ChecklistWizard';
import AuditFindings from '../components/compliance/AuditFindings';
import ComplianceDashboard from '../components/compliance/ComplianceDashboard';

const ComplianceCenterPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📋' },
    { id: 'policies', label: 'Policies', icon: '📄' },
    { id: 'checklists', label: 'Checklists', icon: '✅' },
    { id: 'audits', label: 'Audit Findings', icon: '🔍' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Compliance Center</h1>
        <p>Manage policies, checklists, and ensure regulatory compliance</p>
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
        {activeTab === 'dashboard' && <ComplianceDashboard />}
        {activeTab === 'policies' && <PolicyManager />}
        {activeTab === 'checklists' && <ChecklistWizard />}
        {activeTab === 'audits' && <AuditFindings />}
      </div>
    </div>
  );
};

export default ComplianceCenterPage;