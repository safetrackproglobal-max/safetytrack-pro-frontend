// src/pages/IncidentPage.js
import React, { useEffect, useState } from "react";
import { Card, Button, List, Modal, Typography, Tag, Spin, Tabs, message, Space, Statistic, Row, Col, Badge } from "antd";
import { PlusOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined, FireOutlined, EyeOutlined } from '@ant-design/icons';
import { hospitalService } from "../services/hospitalService";
import BiohazardIncidentForm from "../components/hospital/BiohazardIncidentForm";
import IncidentList from "../components/incident/IncidentList";
import IncidentAnalytics from "../components/incident/IncidentAnalytics";

const { TabPane } = Tabs;
const { Title, Text } = Typography;

export default function IncidentPage({ hospitalId }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("simple-list");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    critical: 0
  });

  // Fetch incidents using getAdverseEvents from hospitalService
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      // Use getAdverseEvents from hospitalService
      const data = await hospitalService.getAdverseEvents(hospitalId);
      const incidentData = Array.isArray(data) ? data : [];
      setIncidents(incidentData);
      
      // Update stats
      setStats({
        total: incidentData.length,
        active: incidentData.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length,
        resolved: incidentData.filter(i => i.status === 'Resolved' || i.status === 'Closed').length,
        critical: incidentData.filter(i => i.severity === 'Critical' || i.severity === 'Severe').length
      });
    } catch (error) {
      console.error('Error fetching incidents:', error);
      message.error('Failed to load incidents');
      setIncidents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIncidents();
    // eslint-disable-next-line
  }, [hospitalId]);

  const handleResolveIncident = async (incidentId) => {
    try {
      await hospitalService.resolveAdverseEvent(incidentId);
      message.success('Incident resolved successfully');
      fetchIncidents();
    } catch (error) {
      console.error('Error resolving incident:', error);
      message.error('Failed to resolve incident');
    }
  };

  return (
    <Card
      title={
        <Space>
          <WarningOutlined style={{ color: '#cf1322' }} />
          <span>Incident Management</span>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Report Incident
        </Button>
      }
    >
      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Total Incidents" value={stats.total} prefix={<WarningOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Active" value={stats.active} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Resolved" value={stats.resolved} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Critical" value={stats.critical} prefix={<FireOutlined />} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* Original simple list view */}
        <TabPane tab="Simple View" key="simple-list">
          <List
            dataSource={incidents}
            loading={loading}
            renderItem={incident => (
              <List.Item
                actions={[
                  <Button type="link" icon={<EyeOutlined />} onClick={() => setSelected(incident)}>
                    View
                  </Button>,
                  incident.status !== 'Resolved' && incident.status !== 'Closed' && (
                    <Button type="link" onClick={() => handleResolveIncident(incident.id)}>
                      Resolve
                    </Button>
                  )
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{incident.type || incident.title || 'Untitled'}</span>
                      <Tag color={
                        incident.severity === "Critical" ? "red" : 
                        incident.severity === "Severe" ? "orange" : 
                        incident.severity === "Moderate" ? "gold" : 
                        "green"
                      }>
                        {incident.severity || 'N/A'}
                      </Tag>
                      <Badge status={
                        incident.status === 'Resolved' || incident.status === 'Closed' ? 'success' : 
                        incident.status === 'Under Investigation' ? 'processing' : 
                        'warning'
                      } text={incident.status || 'N/A'} />
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <span><b>Type:</b> {incident.type || 'N/A'} | <b>Department:</b> {incident.department || 'N/A'}</span>
                      <span><b>Date:</b> {incident.date && new Date(incident.date).toLocaleDateString() || incident.date_occurred && new Date(incident.date_occurred).toLocaleDateString() || 'N/A'}</span>
                      {incident.description && <Text type="secondary" ellipsis>{incident.description}</Text>}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>

        {/* Advanced list view */}
        <TabPane tab="Advanced List" key="advanced-list">
          <IncidentList 
            hospitalId={hospitalId} 
            onViewIncident={(id) => {
              const incident = incidents.find(inc => inc.id === id);
              setSelected(incident);
            }}
            onResolveIncident={handleResolveIncident}
          />
        </TabPane>

        {/* Analytics tab */}
        <TabPane tab="Analytics" key="analytics">
          <IncidentAnalytics hospitalId={hospitalId} />
        </TabPane>
      </Tabs>

      {/* Report Incident Modal */}
      <Modal
        title="Report Incident"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        width={700}
      >
        <BiohazardIncidentForm
          departmentId={null}
          onIncidentReported={() => {
            setModalOpen(false);
            fetchIncidents();
          }}
          onClose={() => setModalOpen(false)}
        />
      </Modal>
      
      {/* View Incident Modal */}
      <Modal
        title={selected ? selected.type || selected.title || 'Incident Details' : ''}
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={
          selected && selected.status !== 'Resolved' && selected.status !== 'Closed' ? (
            <Button type="primary" onClick={() => {
              handleResolveIncident(selected.id);
              setSelected(null);
            }}>
              Resolve Incident
            </Button>
          ) : null
        }
        width={600}
      >
        {selected && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Type:</Text> <Text>{selected.type || 'N/A'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Severity:</Text> {' '}
                <Tag color={
                  selected.severity === "Critical" ? "red" : 
                  selected.severity === "Severe" ? "orange" : 
                  selected.severity === "Moderate" ? "gold" : 
                  "green"
                }>
                  {selected.severity || 'N/A'}
                </Tag>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Status:</Text> {' '}
                <Badge status={
                  selected.status === 'Resolved' || selected.status === 'Closed' ? 'success' : 
                  selected.status === 'Under Investigation' ? 'processing' : 
                  'warning'
                } text={selected.status || 'N/A'} />
              </Col>
              <Col span={12}>
                <Text strong>Department:</Text> <Text>{selected.department || 'N/A'}</Text>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Date:</Text> <Text>{selected.date && new Date(selected.date).toLocaleString() || selected.date_occurred && new Date(selected.date_occurred).toLocaleString() || 'N/A'}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Reported By:</Text> <Text>{selected.reported_by || selected.reportedBy || 'N/A'}</Text>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text strong>Location:</Text> <Text>{selected.location || 'N/A'}</Text>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text strong>Description:</Text>
                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                  <Text>{selected.description || 'No description provided'}</Text>
                </div>
              </Col>
            </Row>
            {selected.actionTaken && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text strong>Action Taken:</Text>
                  <div style={{ marginTop: 8, padding: 12, background: '#f6ffed', borderRadius: 4 }}>
                    <Text>{selected.actionTaken}</Text>
                  </div>
                </Col>
              </Row>
            )}
            {selected.rootCause && (
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Text strong>Root Cause:</Text>
                  <div style={{ marginTop: 8, padding: 12, background: '#fff7e6', borderRadius: 4 }}>
                    <Text>{selected.rootCause}</Text>
                  </div>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
}