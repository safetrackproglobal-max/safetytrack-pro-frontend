import React, { useEffect, useState } from "react";
import { Card, List, Button, Modal, Form, Input, Select, message } from "antd";
import axios from "axios";

const { Option } = Select;

export default function ChecklistWizard({ departmentId, userId }) {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/compliance/checklists?department_id=${departmentId}`);
      setChecklists(data);
    } catch {
      setChecklists([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChecklists();
    // eslint-disable-next-line
  }, [departmentId]);

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (cl) => {
    setEditing(cl);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing && editing.id) {
        await axios.put(`/api/compliance/checklists/${editing.id}`, { ...values, user_id: userId });
        message.success("Checklist updated");
      } else {
        await axios.post(`/api/compliance/checklists`, { ...values, department_id: departmentId, user_id: userId });
        message.success("Checklist created");
      }
      setModalOpen(false);
      fetchChecklists();
    } catch {
      message.error("Failed to save checklist");
    }
  };

  return (
    <Card
      title="Compliance Checklists"
      extra={<Button onClick={handleCreate} type="primary">Add Checklist</Button>}
      loading={loading}
    >
      <List
        dataSource={checklists}
        renderItem={cl => (
          <List.Item
            actions={[
              <Button onClick={() => handleEdit(cl)} type="link">Edit</Button>
            ]}
          >
            <List.Item.Meta
              title={cl.name}
              description={`Frequency: ${cl.frequency || "-"} | Items: ${cl.items ? cl.items.split(",").length : 0}`}
            />
          </List.Item>
        )}
      />
      <Modal
        title={editing ? "Edit Checklist" : "Add Checklist"}
        open={modalOpen}
        footer={null}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleSubmit} initialValues={editing || {}}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Frequency" name="frequency">
            <Select>
              <Option value="Daily">Daily</Option>
              <Option value="Weekly">Weekly</Option>
              <Option value="Monthly">Monthly</Option>
              <Option value="Quarterly">Quarterly</Option>
              <Option value="Yearly">Yearly</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Items (comma separated)" name="items">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">{editing ? "Save" : "Create"}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}