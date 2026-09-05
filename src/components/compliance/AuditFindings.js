import React, { useEffect, useState } from "react";
import { Card, List, Tag, Button, Modal, Input, message, Typography, Form } from "antd";
import axios from "axios";

export default function AuditFindings({ departmentId }) {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchFindings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/compliance/audit-findings?department_id=${departmentId}`);
      setFindings(data);
    } catch {
      setFindings([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFindings();
    // eslint-disable-next-line
  }, [departmentId]);

  const handleEdit = (finding) => {
    setEditing(finding);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing && editing.id) {
        await axios.put(`/api/compliance/audit-findings/${editing.id}`, { ...values, department_id: departmentId });
        message.success("Finding updated");
      } else {
        await axios.post(`/api/compliance/audit-findings`, { ...values, department_id: departmentId });
        message.success("Finding created");
      }
      setModalOpen(false);
      fetchFindings();
    } catch {
      message.error("Failed to save finding");
    }
  };

  return (
    <Card
      title="Audit Findings"
      extra={<Button onClick={handleCreate} type="primary">Add Finding</Button>}
      loading={loading}
    >
      <List
        dataSource={findings}
        renderItem={finding => (
          <List.Item
            actions={[
              <Button onClick={() => handleEdit(finding)} type="link">Edit</Button>
            ]}
          >
            <List.Item.Meta
              title={
                <span>
                  {finding.title}
                  {finding.resolved
                    ? <Tag color="green" style={{ marginLeft: 8 }}>Resolved</Tag>
                    : <Tag color="orange" style={{ marginLeft: 8 }}>Open</Tag>
                  }
                </span>
              }
              description={
                <Typography.Paragraph>
                  <b>Severity:</b> {finding.severity} | <b>Due:</b> {finding.due_date ? new Date(finding.due_date).toLocaleDateString() : "-"}
                  <br />
                  {finding.description}
                </Typography.Paragraph>
              }
            />
          </List.Item>
        )}
      />
      <Modal
        title={editing ? "Edit Finding" : "Add Finding"}
        open={modalOpen}
        footer={null}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleSubmit} initialValues={editing || {}}>
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Severity" name="severity">
            <Input />
          </Form.Item>
          <Form.Item label="Standard Reference" name="standard_reference">
            <Input />
          </Form.Item>
          <Form.Item label="Due Date" name="due_date">
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Resolved" name="resolved" valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>
          <Form.Item label="Resolution Notes" name="resolution_notes">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">{editing ? "Save" : "Create"}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}