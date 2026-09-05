// src/components/reports/ExportPanel.js
import React, { useState } from "react";
import { Button, Select, Row, Col, Card, message } from 'antd';
import { DownloadOutlined, AlertOutlined, FileTextOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function ExportPanel() {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('documents');
  const [error, setError] = useState("");

  async function handleExport() {
    setLoading(true); 
    setError("");
    
    try {
      const endpoint = exportType === 'incidents' 
        ? '/api/incidents/export' 
        : '/api/reports/export';
      
      const filename = exportType === 'incidents'
        ? 'safety_incidents_report.csv'
        : 'documents_report.csv';

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem("token") 
        },
        body: JSON.stringify({ exportType })
      });
      
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      message.success(`${exportType === 'incidents' ? 'Incidents' : 'Documents'} report exported successfully!`);
    } catch (e) {
      setError(e.message);
      message.error('Export failed: ' + e.message);
    }
    setLoading(false);
  }

  return (
    <Card style={{ marginBottom: 24 }}>
      <h3>
        <DownloadOutlined /> Export Reports
      </h3>
      
      <Row gutter={16} align="middle">
        <Col span={8}>
          <Select 
            value={exportType} 
            onChange={setExportType}
            style={{ width: '100%' }}
          >
            <Option value="documents">
              <FileTextOutlined /> Documents Report
            </Option>
            <Option value="incidents">
              <AlertOutlined /> Incidents Report
            </Option>
            <Option value="compliance">Compliance Report</Option>
            <Option value="analytics">Analytics Report</Option>
          </Select>
        </Col>
        
        <Col span={8}>
          <Button 
            onClick={handleExport} 
            disabled={loading}
            type="primary"
            icon={<DownloadOutlined />}
            size="large"
            block
          >
            {loading ? "Exporting..." : `Export ${exportType} as CSV`}
          </Button>
        </Col>
        
        <Col span={8}>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {exportType === 'incidents' 
              ? 'Export all safety incidents with detailed information'
              : 'Export document repository and metadata'
            }
          </div>
        </Col>
      </Row>
      
      {error && (
        <div style={{ color: "red", marginTop: 8 }}>
          {error}
        </div>
      )}
    </Card>
  );
}