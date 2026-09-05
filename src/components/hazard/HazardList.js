import React, { useEffect, useState } from "react";
import { Card, List, Tag, Button, Modal } from "antd";
import axios from "axios";
import HazardForm from "./HazardForm";

export default function HazardList({ departmentId }) {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchHazards = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/department/${departmentId}/hazards`);
      setHazards(data);
    } catch {
      setHazards([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHazards();
    // eslint-disable-next-line
  }, [departmentId]);

  return (
    <Card
      title="Hazards"
      extra={<Button type="primary" onClick={() => { setEditing(null); setModalOpen(true); }}>Add Hazard</Button>}
      loading={loading}
    >
      <List
        dataSource={hazards}
        renderItem={hazard => (
          <List.Item
            actions={[
              <Button type="link" onClick={() => { setEditing(hazard); setModalOpen(true); }}>Edit</Button>
            ]}
          >
            <List.Item.Meta
              title={<span>{hazard.name} <Tag color={hazard.risk_level === "Critical" ? "red" : "blue"}>{hazard.risk_level}</Tag></span>}
              description={`${hazard.type} | ${hazard.location}`}
            />
          </List.Item>
        )}
      />
      <Modal
        open={modalOpen}
        title={editing ? "Edit Hazard" : "Add Hazard"}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <HazardForm
          departmentId={departmentId}
          hazard={editing}
          onSaved={() => {
            setModalOpen(false);
            fetchHazards();
          }}
        />
      </Modal>
    </Card>
  );
}