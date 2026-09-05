import React, { useEffect, useState } from "react";
import { Card, Steps, Button, Modal, Form, Input, Select, message, Timeline } from "antd";
import { CheckCircleOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const WORKFLOW_STEPS = [
  {
    title: 'Incident Reported',
    status: 'wait',
    description: 'Initial report submitted'
  },
  {
    title: 'Triage & Assessment',
    status: 'wait',
    description: 'Initial assessment and prioritization'
  },
  {
    title: 'Investigation',
    status: 'wait',
    description: 'Detailed investigation in progress'
  },
  {
    title: 'Corrective Actions',
    status: 'wait',
    description: 'Implementation of corrective measures'
  },
  {
    title: 'Review & Closure',
    status: 'wait',
    description: 'Final review and incident closure'
  }
];

export default function IncidentWorkflow({ incidentId }) {
  const [workflow, setWorkflow] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [approvalModal, setApprovalModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (incidentId) {
      fetchWorkflow();
    }
    // eslint-disable-next-line
  }, [incidentId]);

  const fetchWorkflow = async () => {
    try {
      const { data } = await axios.get(`/api/incidents/${incidentId}/workflow`);
      setWorkflow(data);
      setCurrentStep(data.current_step || 0);
    } catch (error) {
      console.error("Failed to fetch workflow:", error);
    }
  };

  const advanceStep = async (values) => {
    try {
      await axios.post(`/api/incidents/${incidentId}/workflow/advance`, values);
      message.success("Workflow step advanced successfully");
      setApprovalModal(false);
      fetchWorkflow();
    } catch (error) {
      message.error("Failed to advance workflow step");
    }
  };

  const assignTask = async (values) => {
    try {
      await axios.post(`/api/incidents/${incidentId}/workflow/assign`, values);
      message.success("Task assigned successfully");
      setAssignModal(false);
      fetchWorkflow();
    } catch (error) {
      message.error("Failed to assign task");
    }
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'finish';
    if (stepIndex === currentStep) return 'process';
    return 'wait';
  };

  return (
    <div>
      <Card title="Incident Workflow">
        <Steps current={currentStep}>
          {WORKFLOW_STEPS.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              status={getStepStatus(index)}
            />
          ))}
        </Steps>

        {workflow && (
          <div style={{ marginTop: 24 }}>
            <Timeline>
              {workflow.history?.map((event, index) => (
                <Timeline.Item key={index}>
                  <strong>{event.action}</strong> - {new Date(event.timestamp).toLocaleString()}
                  <br />
                  {event.notes && <div>Notes: {event.notes}</div>}
                  {event.assigned_to && (
                    <div>
                      <UserOutlined /> Assigned to: {event.assigned_to}
                    </div>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Button
            type="primary"
            onClick={() => setApprovalModal(true)}
            style={{ marginRight: 8 }}
          >
            Advance to Next Step
          </Button>
          <Button onClick={() => setAssignModal(true)}>
            Assign Task
          </Button>
        </div>
      </Card>

      <Modal
        title="Advance Workflow Step"
        open={approvalModal}
        onCancel={() => setApprovalModal(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={advanceStep}
        >
          <Form.Item
            label="Approval Notes"
            name="notes"
            rules={[{ required: true, message: 'Please enter approval notes' }]}
          >
            <TextArea rows={4} placeholder="Enter details about this approval decision" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Approve & Advance
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Assign Task"
        open={assignModal}
        onCancel={() => setAssignModal(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={assignTask}
        >
          <Form.Item
            label="Assign To"
            name="assigned_to"
            rules={[{ required: true, message: 'Please select assignee' }]}
          >
            <Select placeholder="Select team member">
              <Option value="quality_team">Quality Assurance Team</Option>
              <Option value="safety_officer">Safety Officer</Option>
              <Option value="department_head">Department Head</Option>
              <Option value="external_reviewer">External Reviewer</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Task Description"
            name="task_description"
            rules={[{ required: true, message: 'Please enter task description' }]}
          >
            <TextArea rows={3} placeholder="Describe the task to be completed" />
          </Form.Item>
          <Form.Item
            label="Due Date"
            name="due_date"
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Assign Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}