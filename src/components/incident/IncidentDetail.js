import React, { useEffect, useState } from "react";
import { Card, Descriptions, Tag, Timeline, Button, Spin, Modal, Form, Input, Select, message } from "antd";
import { UserOutlined, ClockCircleOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { Option } = Select;

export default function IncidentDetails({ incidentId, onUpdate }) {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateModal, setUpdateModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (incidentId) {
      fetchIncident();
    }
    // eslint-disable-next-line
  }, [incidentId]);

  const fetchIncident = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/incidents/${incidentId}`);
      setIncident(data);
    } catch (error) {
      message.error("Failed to fetch incident details");
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (values) => {
    try {
      await axios.patch(`/api/incidents/${incidentId}`, values);
      message.success("Incident updated successfully");
      setUpdateModal(false);
      fetchIncident();
      onUpdate && onUpdate();
    } catch (error) {
      message.error("Failed to update incident");
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: 'red',
      High: 'orange',
      Medium: 'yellow',
      Low: 'green'
    };
    return colors[severity] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      Reported: 'blue',
      'Under Investigation': 'orange',
      Resolved: 'green',
      Closed: 'gray'
    };
    return colors[status] || 'default';
  };

  if (loading) return <Spin />;
  if (!incident) return <div>Incident not found</div>;

  return (
    <div>
      <Card
        title={`Incident #${incident.id}`}
        extra={
          <Button icon={<EditOutlined />} onClick={() => setUpdateModal(true)}>
            Update
          </Button>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Title">{incident.title}</Descriptions.Item>
          <Descriptions.Item label="Type">{incident.type}</Descriptions.Item>
          <Descriptions.Item label="Severity">
            <Tag color={getSeverityColor(incident.severity)}>{incident.severity}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(incident.status)}>{incident.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Location">{incident.location}</Descriptions.Item>
          <Descriptions.Item label="Department">{incident.department_name}</Descriptions.Item>
          <Descriptions.Item label="Reported By">{incident.reported_by}</Descriptions.Item>
          <Descriptions.Item label="Reported At">
            {new Date(incident.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {incident.description}
          </Descriptions.Item>
          {incident.action_taken && (
            <Descriptions.Item label="Action Taken" span={2}>
              {incident.action_taken}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Card title="Timeline" style={{ marginTop: 16 }}>
          <Timeline>
            <Timeline.Item dot={<ClockCircleOutlined />}>
              Created: {new Date(incident.created_at).toLocaleString()}
            </Timeline.Item>
            {incident.updated_at !== incident.created_at && (
              <Timeline.Item dot={<ClockCircleOutlined />}>
                Last Updated: {new Date(incident.updated_at).toLocaleString()}
              </Timeline.Item>
            )}
            {incident.resolved_at && (
              <Timeline.Item dot={<ClockCircleOutlined />} color="green">
                Resolved: {new Date(incident.resolved_at).toLocaleString()}
              </Timeline.Item>
            )}
          </Timeline>
        </Card>
      </Card>

      <Modal
        title="Update Incident"
        open={updateModal}
        onCancel={() => setUpdateModal(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: incident.status,
            severity: incident.severity,
            action_taken: incident.action_taken
          }}
          onFinish={handleStatusUpdate}
        >
          <Form.Item label="Status" name="status">
            <Select>
              <Option value="Reported">Reported</Option>
              <Option value="Under Investigation">Under Investigation</Option>
              <Option value="Resolved">Resolved</Option>
              <Option value="Closed">Closed</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Severity" name="severity">
            <Select>
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
              <Option value="Critical">Critical</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Action Taken" name="action_taken">
            <TextArea rows={4} placeholder="Describe actions taken to resolve this incident" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Incident
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}