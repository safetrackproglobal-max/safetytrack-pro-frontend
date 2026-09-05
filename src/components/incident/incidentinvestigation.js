import React, { useEffect, useState } from "react";
import { Card, Form, Input, Select, Button, Timeline, List, Tag, message } from "antd";
import { UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;
const { TextArea } = Input;

const INVESTIGATION_STATUS = [
  "Not Started",
  "In Progress",
  "Awaiting Information",
  "Under Review",
  "Completed"
];

const ROOT_CAUSE_CATEGORIES = [
  "Human Error",
  "Equipment Failure",
  "Procedural Gap",
  "Training Deficiency",
  "Environmental Factor",
  "Communication Breakdown",
  "Other"
];

export default function IncidentInvestigation({ incidentId }) {
  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    if (incidentId) {
      fetchInvestigation();
    }
    // eslint-disable-next-line
  }, [incidentId]);

  const fetchInvestigation = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/incidents/${incidentId}/investigation`);
      setInvestigation(data);
      if (data) {
        form.setFieldsValue(data);
      }
    } catch (error) {
      console.error("Failed to fetch investigation:", error);
    }
    setLoading(false);
  };

  const handleSave = async (values) => {
    try {
      if (investigation) {
        await axios.put(`/api/incidents/${incidentId}/investigation`, values);
      } else {
        await axios.post(`/api/incidents/${incidentId}/investigation`, values);
      }
      message.success("Investigation saved successfully");
      fetchInvestigation();
    } catch (error) {
      message.error("Failed to save investigation");
    }
  };

  const addInvestigator = async (investigatorId) => {
    try {
      await axios.post(`/api/incidents/${incidentId}/investigators`, {
        investigator_id: investigatorId
      });
      message.success("Investigator added");
      fetchInvestigation();
    } catch (error) {
      message.error("Failed to add investigator");
    }
  };

  if (loading) return <div>Loading investigation...</div>;

  return (
    <div>
      <Card title="Incident Investigation">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item label="Investigation Status" name="status">
            <Select>
              {INVESTIGATION_STATUS.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Root Cause Category" name="root_cause_category">
            <Select>
              {ROOT_CAUSE_CATEGORIES.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Root Cause Analysis" name="root_cause_analysis">
            <TextArea rows={4} placeholder="Detailed analysis of the root cause" />
          </Form.Item>

          <Form.Item label="Contributing Factors" name="contributing_factors">
            <TextArea rows={3} placeholder="Factors that contributed to the incident" />
          </Form.Item>

          <Form.Item label="Corrective Actions" name="corrective_actions">
            <TextArea rows={4} placeholder="Actions to prevent recurrence" />
          </Form.Item>

          <Form.Item label="Preventive Measures" name="preventive_measures">
            <TextArea rows={3} placeholder="Measures to prevent similar incidents" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Investigation
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Investigation Team" style={{ marginTop: 16 }}>
        {investigation?.investigators && investigation.investigators.length > 0 ? (
          <List
            dataSource={investigation.investigators}
            renderItem={investigator => (
              <List.Item>
                <List.Item.Meta
                  avatar={<UserOutlined />}
                  title={investigator.name}
                  description={investigator.role}
                />
                <Tag>{investigator.assigned_date}</Tag>
              </List.Item>
            )}
          />
        ) : (
          <div>No investigators assigned yet</div>
        )}
      </Card>

      <Card title="Investigation Timeline" style={{ marginTop: 16 }}>
        <Timeline>
          {investigation?.timeline_events?.map((event, index) => (
            <Timeline.Item key={index} dot={<ClockCircleOutlined />}>
              <strong>{event.event_type}</strong> - {new Date(event.event_date).toLocaleString()}
              <br />
              {event.description}
              {event.assigned_to && <div>By: {event.assigned_to}</div>}
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </div>
  );
}