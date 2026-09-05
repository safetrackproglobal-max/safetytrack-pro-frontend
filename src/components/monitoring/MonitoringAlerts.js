import React, { useEffect, useState } from "react";
import { Card, List, Tag, Button, Modal, Typography, Spin, message, Alert } from "antd";
import axios from "axios";

export default function MonitoringAlert({ stationId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [acknowledging, setAcknowledging] = useState(null);
  const [resolving, setResolving] = useState(null);

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/monitoring/station/${stationId}/alerts`);
        setAlerts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch alerts:", e);
        setAlerts([]);
        message.error("Failed to load alerts");
      }
      setLoading(false);
    }
    
    if (stationId) {
      fetchAlerts();
    }
  }, [stationId]);

  const acknowledge = async (alertId) => {
    setAcknowledging(alertId);
    try {
      await axios.post(`/api/monitoring/alert/${alertId}/acknowledge`);
      message.success("Alert acknowledged");
      setAlerts(alerts => alerts.map(a => a.id === alertId ? { ...a, status: "Acknowledged" } : a));
    } catch (e) {
      console.error("Failed to acknowledge alert:", e);
      message.error("Failed to acknowledge alert");
    } finally {
      setAcknowledging(false);
    }
  };

  const resolve = async (alertId) => {
    setResolving(alertId);
    try {
      await axios.post(`/api/monitoring/alert/${alertId}/resolve`);
      message.success("Alert resolved");
      setAlerts(alerts => alerts.map(a => a.id === alertId ? { ...a, status: "Resolved" } : a));
    } catch (e) {
      console.error("Failed to resolve alert:", e);
      message.error("Failed to resolve alert");
    } finally {
      setResolving(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: "red",
      High: "orange",
      Medium: "gold",
      Low: "blue",
      default: "gray"
    };
    return colors[severity] || colors.default;
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: "red",
      Acknowledged: "blue",
      Resolved: "green",
      default: "gray"
    };
    return colors[status] || colors.default;
  };

  if (loading) return <Spin />;

  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  return (
    <Card title="Alerts">
      {safeAlerts.length === 0 ? (
        <Alert message="No alerts found" type="info" />
      ) : (
        <List
          dataSource={safeAlerts}
          renderItem={alert => (
            <List.Item
              actions={[
                alert.status === "Active" && (
                  <>
                    <Button 
                      size="small" 
                      onClick={() => acknowledge(alert.id)}
                      loading={acknowledging === alert.id}
                      disabled={acknowledging !== null}
                    >
                      Acknowledge
                    </Button>
                    <Button 
                      size="small" 
                      type="primary" 
                      onClick={() => resolve(alert.id)}
                      loading={resolving === alert.id}
                      disabled={resolving !== null}
                    >
                      Resolve
                    </Button>
                  </>
                ),
                <Button size="small" onClick={() => setDetail(alert)}>
                  Details
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    <Tag color={getSeverityColor(alert.severity)}>
                      {alert.severity || "Unknown"}
                    </Tag>
                    {alert.parameter} ({alert.value})
                  </span>
                }
                description={
                  <>
                    <b>Status:</b>{" "}
                    <Tag color={getStatusColor(alert.status)}>
                      {alert.status || "Unknown"}
                    </Tag>
                    <br />
                    {alert.message || "No message available"}
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}
      
      <Modal 
        open={!!detail} 
        onCancel={() => setDetail(null)} 
        footer={null} 
        title="Alert Details"
      >
        {detail && (
          <>
            <Typography.Paragraph>
              <b>Parameter:</b> {detail.parameter || "N/A"}<br />
              <b>Value:</b> {detail.value || "N/A"}<br />
              <b>Threshold:</b> {detail.threshold || "N/A"}<br />
              <b>Severity:</b> {detail.severity || "N/A"}<br />
              <b>Status:</b> {detail.status || "N/A"}<br />
              <b>Message:</b> {detail.message || "No message"}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <b>Created At:</b>{" "}
              {detail.created_at
                ? new Date(detail.created_at).toLocaleString()
                : "N/A"}
            </Typography.Paragraph>
            {detail.acknowledged_at && (
              <Typography.Paragraph>
                <b>Acknowledged At:</b>{" "}
                {new Date(detail.acknowledged_at).toLocaleString()}
              </Typography.Paragraph>
            )}
            {detail.resolved_at && (
              <Typography.Paragraph>
                <b>Resolved At:</b>{" "}
                {new Date(detail.resolved_at).toLocaleString()}
              </Typography.Paragraph>
            )}
          </>
        )}
      </Modal>
    </Card>
  );
}