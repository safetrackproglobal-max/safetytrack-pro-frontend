import React, { useEffect, useState } from "react";
import { List, Card, Tag, Button, Spin, Alert } from "antd";
import axios from "axios";

export default function MoStationList({ hospitalId, onSelect }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStations() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`/api/hospital/${hospitalId}/monitoring-stations`);
        setStations(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch stations:", e);
        setError("Failed to load monitoring stations");
        setStations([]);
      }
      setLoading(false);
    }
    
    if (hospitalId) {
      fetchStations();
    }
  }, [hospitalId]);

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'green',
      'Inactive': 'red',
      'Maintenance': 'orange',
      'Offline': 'gray',
      'default': 'gray'
    };
    return colors[status] || colors.default;
  };

  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error} />;

  const safeStations = Array.isArray(stations) ? stations : [];

  return (
    <Card title="Monitoring Stations">
      {safeStations.length === 0 ? (
        <Alert message="No monitoring stations found" type="info" />
      ) : (
        <List
          dataSource={safeStations}
          renderItem={station => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  onClick={() => onSelect && onSelect(station.id)}
                >
                  Details
                </Button>
              ]}
            >
              <List.Item.Meta
                title={station.name || "Unnamed Station"}
                description={
                  <>
                    <Tag>{station.type || "Unknown"}</Tag>
                    <span>{station.location || "No location"}</span>
                  </>
                }
              />
              <Tag color={getStatusColor(station.status)}>
                {station.status || "Unknown"}
              </Tag>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}