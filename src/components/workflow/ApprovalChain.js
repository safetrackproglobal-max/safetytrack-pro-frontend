import React, { useEffect, useState } from "react";
import { Card, Steps, Button, Modal, Select, message } from "antd";
import axios from "axios";

const { Step } = Steps;

export default function ApprovalChain({ workflowId }) {
  const [stepsData, setStepsData] = useState([]);
  const [current, setCurrent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchSteps();
    fetchUsers();
    // eslint-disable-next-line
  }, [workflowId]);

  const fetchSteps = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/workflow/${workflowId}/approval-chain`);
      setStepsData(data);
    } catch {
      setStepsData([]);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`/api/users`);
      setUsers(data);
    } catch {
      setUsers([]);
    }
  };

  const handleAddStep = async (userId) => {
    try {
      await axios.post(`/api/workflow/${workflowId}/approval-chain`, { user_id: userId });
      message.success("Step added to approval chain");
      setModalOpen(false);
      fetchSteps();
    } catch {
      message.error("Failed to add step");
    }
  };

  return (
    <Card
      title="Approval Chain"
      extra={<Button onClick={() => setModalOpen(true)} type="primary">Add Step</Button>}
      loading={loading}
    >
      <Steps direction="vertical" current={current}>
        {stepsData.map((step, idx) => (
          <Step
            key={step.id}
            title={step.user_name}
            description={
              <>
                <span>Status: {step.status}</span>
                <br />
                <span>Approved At: {step.approved_at ? new Date(step.approved_at).toLocaleString() : "Pending"}</span>
              </>
            }
            onClick={() => setCurrent(idx)}
          />
        ))}
      </Steps>
      <Modal
        title="Add Approval Step"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Select
          style={{ width: "100%" }}
          placeholder="Select approver"
          onChange={handleAddStep}
        >
          {users.map(u => (
            <Select.Option key={u.id} value={u.id}>{u.name} ({u.role})</Select.Option>
          ))}
        </Select>
      </Modal>
    </Card>
  );
}