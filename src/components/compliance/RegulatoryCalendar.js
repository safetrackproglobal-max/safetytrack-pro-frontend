import React, { useEffect, useState } from "react";
import { Card, Calendar, Badge, Spin, Modal, Typography } from "antd";
import axios from "axios";
import moment from "moment";

export default function RegulatoryCalendar({ departmentId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/compliance/calendar?department_id=${departmentId}`);
        setEvents(data);
      } catch {
        setEvents([]);
      }
      setLoading(false);
    }
    fetchEvents();
  }, [departmentId]);

  const getListData = value => {
    const dateStr = value.format("YYYY-MM-DD");
    return events.filter(e => moment(e.date).format("YYYY-MM-DD") === dateStr);
  };

  const dateCellRender = value => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {listData.map(item => (
          <li key={item.id} onClick={() => setSelected(item)} style={{ cursor: "pointer" }}>
            <Badge status="processing" text={item.title} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card title="Regulatory Calendar" loading={loading}>
      <Calendar dateCellRender={dateCellRender} />
      <Modal
        title={selected?.title}
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
      >
        {selected && (
          <Typography.Paragraph>
            <b>Date:</b> {selected.date && moment(selected.date).format("YYYY-MM-DD")}
            <br />
            <b>Description:</b> {selected.description}
            <br />
            <b>Type:</b> {selected.type}
          </Typography.Paragraph>
        )}
      </Modal>
    </Card>
  );
}