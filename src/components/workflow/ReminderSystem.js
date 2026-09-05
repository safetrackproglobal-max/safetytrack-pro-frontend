import React, { useEffect, useState } from "react";
import { Card, List, Switch, Button, DatePicker, message, Modal, Input } from "antd";
import axios from "axios";
import moment from "moment";

export default function ReminderSystem({ userId }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchReminders();
    // eslint-disable-next-line
  }, [userId]);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/workflow/reminders?user_id=${userId}`);
      setReminders(data);
    } catch {
      setReminders([]);
    }
    setLoading(false);
  };

  const handleToggle = async (reminder) => {
    try {
      await axios.patch(`/api/workflow/reminders/${reminder.id}`, { enabled: !reminder.enabled });
      setReminders(reminders =>
        reminders.map(r => r.id === reminder.id ? { ...r, enabled: !reminder.enabled } : r)
      );
      message.success("Reminder updated");
    } catch {
      message.error("Failed to update reminder");
    }
  };

  const handleEdit = (reminder) => {
    setEditing(reminder);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing && editing.id) {
        await axios.put(`/api/workflow/reminders/${editing.id}`, values);
        message.success("Reminder updated");
      } else {
        await axios.post(`/api/workflow/reminders`, { ...values, user_id: userId });
        message.success("Reminder created");
      }
      setModalOpen(false);
      fetchReminders();
    } catch {
      message.error("Failed to save reminder");
    }
  };

  return (
    <Card
      title="Automated Reminder System"
      extra={<Button type="primary" onClick={handleCreate}>Add Reminder</Button>}
      loading={loading}
    >
      <List
        dataSource={reminders}
        renderItem={reminder => (
          <List.Item
            actions={[
              <Switch
                checked={reminder.enabled}
                onChange={() => handleToggle(reminder)}
                checkedChildren="On"
                unCheckedChildren="Off"
              />,
              <Button type="link" onClick={() => handleEdit(reminder)}>Edit</Button>
            ]}
          >
            <List.Item.Meta
              title={reminder.title}
              description={
                <>
                  <span>{reminder.description}</span><br />
                  <span>
                    <b>Remind At:</b> {reminder.remind_at ? moment(reminder.remind_at).format("YYYY-MM-DD HH:mm") : "N/A"}
                  </span>
                </>
              }
            />
          </List.Item>
        )}
      />
      <Modal
        title={editing ? "Edit Reminder" : "Add Reminder"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <ReminderForm
          initialValues={editing || {}}
          onSubmit={handleSubmit}
        />
      </Modal>
    </Card>
  );
}

function ReminderForm({ initialValues, onSubmit }) {
  const [form] = Input.useForm ? Input.useForm() : [null];
  const [date, setDate] = useState(initialValues.remind_at ? moment(initialValues.remind_at) : null);
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({
          ...initialValues,
          title: e.target.title.value,
          description: e.target.description.value,
          remind_at: date ? date.toISOString() : null,
        });
      }}
    >
      <label>Title</label>
      <Input name="title" defaultValue={initialValues.title} required />
      <label>Description</label>
      <Input name="description" defaultValue={initialValues.description} />
      <label>Remind At</label>
      <DatePicker
        showTime
        style={{ width: "100%" }}
        value={date}
        onChange={setDate}
      />
      <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
        Save
      </Button>
    </form>
  );
}