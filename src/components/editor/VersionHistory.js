import React, { useEffect, useState } from "react";
import { Card, Timeline, Button, Modal, Typography } from "antd";
import { HistoryOutlined, RollbackOutlined } from "@ant-design/icons";
import axios from "axios";

export default function VersionHistory({ documentId }) {
  const [history, setHistory] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [documentId]);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`/api/editor/${documentId}/versions`);
      setHistory(data);
    } catch {
      setHistory([]);
    }
  };

  const handleRollback = async (version) => {
    Modal.confirm({
      title: "Restore This Version?",
      content: `Are you sure you want to restore version ${version.version}?`,
      onOk: async () => {
        try {
          await axios.post(`/api/editor/${documentId}/rollback`, { version_id: version.id });
          fetchHistory();
        } catch {
          // handle error
        }
      }
    });
  };

  return (
    <Card title="Version History" icon={<HistoryOutlined />}>
      <Timeline>
        {history.map(ver => (
          <Timeline.Item key={ver.id} color={ver.is_current ? "green" : "gray"}>
            <span>
              <b>Version:</b> {ver.version} &mdash; <b>{new Date(ver.created_at).toLocaleString()}</b>
              <Button
                size="small"
                style={{ marginLeft: 8 }}
                icon={<RollbackOutlined />}
                disabled={ver.is_current}
                onClick={() => handleRollback(ver)}
              >
                Restore
              </Button>
              <Button
                size="small"
                style={{ marginLeft: 8 }}
                onClick={() => {
                  setSelected(ver);
                  setModalOpen(true);
                }}
              >
                View
              </Button>
            </span>
          </Timeline.Item>
        ))}
      </Timeline>
      <Modal
        open={modalOpen}
        title={`Version ${selected?.version} Content`}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
      >
        <Typography.Paragraph>
          {selected?.content}
        </Typography.Paragraph>
      </Modal>
    </Card>
  );
}