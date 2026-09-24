import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Tabs, Spin, Empty } from 'antd';
import FishboneDiagram from '../../components/incident/FishboneDiagram';
import AIInvestigationAssistant from '../../components/incident/AIInvestigationAssistant';
import IncidentTimeline from '../../components/incident/IncidentTimeline';
import CorrectiveActionTracker from '../../components/incident/CorrectiveActionTracker';
import IncidentComments from '../../components/incident/IncidentComments';
import InvestigationAssignment from '../../components/incident/InvestigationAssignment';
import WitnessStatementForm from '../../components/incident/WitnessStatementForm';
import AuditTrailViewer from '../../components/incident/AuditTrailViewer';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const { TabPane } = Tabs;

const InvestigationWorkspacePage = () => {
  const { incidentId } = useParams();
  const { user } = useAuth();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!incidentId) {
      setLoading(false);
      return;
    }

    const fetchIncident = async () => {
      try {
        const response = await notificationService.getIncidentById(incidentId);
        setIncident(response?.incident || response?.data || response);
      } catch (error) {
        console.error('Failed to fetch incident:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIncident();
  }, [incidentId]);

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  if (!incident) {
    return <div style={{ padding: 24 }}><Empty description="No incident selected" /></div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Card title={`Investigation Workspace - ${incident.incident_number || incident.id}`}>
        <Tabs defaultActiveKey="timeline" type="card">
          <TabPane tab="Timeline" key="timeline">
            <IncidentTimeline incident={incident} />
          </TabPane>
          <TabPane tab="Fishbone Analysis" key="fishbone">
            <FishboneDiagram incident={incident} visible={true} onClose={() => {}} />
          </TabPane>
          <TabPane tab="AI Assistant" key="ai">
            <AIInvestigationAssistant incident={incident} visible={true} onClose={() => {}} />
          </TabPane>
          <TabPane tab="Corrective Actions" key="actions">
            <CorrectiveActionTracker incident={incident} visible={true} onClose={() => {}} />
          </TabPane>
          <TabPane tab="Comments" key="comments">
            <IncidentComments incident={incident} currentUser={user} />
          </TabPane>
          <TabPane tab="Team" key="team">
            <InvestigationAssignment incident={incident} users={[]} />
          </TabPane>
          <TabPane tab="Witness Statements" key="witnesses">
            <WitnessStatementForm incident={incident} />
          </TabPane>
          <TabPane tab="Audit Trail" key="audit">
            <AuditTrailViewer incident={incident} visible={true} onClose={() => {}} />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default InvestigationWorkspacePage;