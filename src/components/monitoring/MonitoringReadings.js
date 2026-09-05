import React, { useEffect, useState } from "react";
import { Card, Table, Spin, Alert } from "antd";
import axios from "axios";

export default function MoRead({ stationId }) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReadings() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`/api/monitoring/station/${stationId}/readings`);
        setReadings(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch readings:", e);
        setError("Failed to load readings");
        setReadings([]);
      }
      setLoading(false);
    }
    
    if (stationId) {
      fetchReadings();
    }
  }, [stationId]);

  const formatTimestamp = (timestamp) => {
    try {
      return timestamp ? new Date(timestamp).toLocaleString() : "N/A";
    } catch {
      return "Invalid date";
    }
  };

  const columns = [
    { 
      title: 'Parameter', 
      dataIndex: 'parameter', 
      key: 'parameter',
      render: (text) => text || 'N/A'
    },
    { 
      title: 'Value', 
      dataIndex: 'value', 
      key: 'value',
      render: (value) => value != null ? value : 'N/A'
    },
    { 
      title: 'Unit', 
      dataIndex: 'unit', 
      key: 'unit',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: formatTimestamp
    }
  ];

  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error} />;

  const safeReadings = Array.isArray(readings) ? readings : [];

  return (
    <Card title="Recent Readings">
      {safeReadings.length === 0 ? (
        <Alert message="No readings available" type="info" />
      ) : (
        <Table
          dataSource={safeReadings}
          rowKey="id"
          size="small"
          columns={columns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      )}
    </Card>
  );
}