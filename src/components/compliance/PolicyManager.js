import React, { useEffect, useState } from "react";
import { Card, List, Button, Modal, Input, Form, message } from "antd";
import axios from "axios";

export default function PolicyManager({ departmentId, userId }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/compliance/policies?department_id=${departmentId}`);
      setPolicies(data);
    } catch (e) {
      setPolicies([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPolicies();
    // eslint-disable-next-line
  }, [departmentId]);

  const handleEdit = (policy) => {
    setEditing(policy);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing && editing.id) {
        await axios.put(`/api/compliance/policies/${editing.id}`, { ...values, user_id: userId });
        message.success("Policy updated");
      } else {
        await axios.post(`/api/compliance/policies`, { ...values, department_id: departmentId, user_id: userId });
        message.success("Policy created");
      }
      setModalOpen(false);
      fetchPolicies();
    } catch {
      message.error("Failed to save policy");
    }
  };

  return (
    <Card
      title="Policy Manager"
      extra={<Button onClick={handleCreate} type="primary">Add Policy</Button>}
      loading={loading}
    >
      <List
        dataSource={policies}
        renderItem={policy => (
          <List.Item
            actions={[<Button onClick={() => handleEdit(policy)} type="link">Edit</Button>]}
          >
            <List.Item.Meta
              title={policy.title}
              description={`Version: ${policy.version || "-"}, Effective: ${policy.effective_date ? new Date(policy.effective_date).toLocaleDateString() : "N/A"}`}
            />
          </List.Item>
        )}
      />
      <Modal
        title={editing ? "Edit Policy" : "Add Policy"}
        open={modalOpen}
        footer={null}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleSubmit} initialValues={editing || {}}>
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Policy Number" name="policy_number">
            <Input />
          </Form.Item>
          <Form.Item label="Category" name="category">
            <Input />
          </Form.Item>
          <Form.Item label="Version" name="version">
            <Input />
          </Form.Item>
          <Form.Item label="Effective Date" name="effective_date">
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Review Date" name="review_date">
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Content" name="content">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">{editing ? "Save" : "Create"}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}