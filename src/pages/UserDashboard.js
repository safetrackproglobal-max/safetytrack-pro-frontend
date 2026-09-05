// src/pages/UserDashboard.js
import React from 'react';
import { Row, Col, Card, Statistic, Progress, List } from 'antd';
import { 
  FileTextOutlined, 
  SafetyCertificateOutlined, 
  UploadOutlined 
} from '@ant-design/icons';

function UserDashboard() {
  const recentDocuments = [
    { name: 'Safety Protocol Q3.pdf', date: '2 hours ago' },
    { name: 'Incident Report.docx', date: '1 day ago' },
    { name: 'Compliance Checklist.pdf', date: '3 days ago' },
  ];

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Safety Management Dashboard</h1>
        <p>Manage your safety documents and compliance</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 16 }} />
              <h3>Document Analysis</h3>
              <p>Upload and analyze safety documents with AI</p>
              <Button type="primary" icon={<UploadOutlined />}>
                Upload Document
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <div style={{ textAlign: 'center' }}>
              <SafetyCertificateOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 16 }} />
              <h3>Compliance Score</h3>
              <Progress type="circle" percent={85} width={80} />
              <p style={{ marginTop: 16 }}>Current compliance status</p>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 16 }} />
              <h3>Recent Documents</h3>
              <List
                size="small"
                dataSource={recentDocuments}
                renderItem={item => (
                  <List.Item>
                    <div>
                      <div>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{item.date}</div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default UserDashboard;