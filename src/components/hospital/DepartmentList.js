import React, { useEffect, useState } from "react";
import { List, Card, Spin, Button } from "antd";
import axios from "axios";

export default function HospitalList({ onSelect }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHospitals() {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/hospitals");
        setHospitals(data);
      } catch (e) {
        setHospitals([]);
      }
      setLoading(false);
    }
    fetchHospitals();
  }, []);

  if (loading) return <Spin />;

  return (
    <Card title="Hospitals">
      <List
        dataSource={hospitals}
        renderItem={hospital => (
          <List.Item actions={[
            <Button type="link" onClick={() => onSelect && onSelect(hospital.id)}>Details</Button>
          ]}>
            <List.Item.Meta title={hospital.name} description={hospital.address} />
          </List.Item>
        )}
      />
    </Card>
  );
}