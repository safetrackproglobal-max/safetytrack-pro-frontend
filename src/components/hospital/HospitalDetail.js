import React, { useEffect, useState } from "react";
import { Card, Descriptions, Spin, Divider } from "antd";
import axios from "axios";
import DepartmentList from "./DepartmentList";

export default function HospitalDetail({ hospitalId }) {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHospital() {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/hospital/${hospitalId}`);
        setHospital(data);
      } catch (e) {
        setHospital(null);
      }
      setLoading(false);
    }
    fetchHospital();
  }, [hospitalId]);

  if (loading) return <Spin />;

  if (!hospital) return <Card><b>Hospital not found.</b></Card>;

  return (
    <Card title={hospital.name}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Address">{hospital.address}</Descriptions.Item>
        <Descriptions.Item label="City">{hospital.city}</Descriptions.Item>
        <Descriptions.Item label="Country">{hospital.country}</Descriptions.Item>
        <Descriptions.Item label="Type">{hospital.type}</Descriptions.Item>
        <Descriptions.Item label="Beds">{hospital.beds}</Descriptions.Item>
        <Descriptions.Item label="Created At">{hospital.created_at && new Date(hospital.created_at).toLocaleString()}</Descriptions.Item>
      </Descriptions>
      <Divider orientation="left">Departments</Divider>
      <DepartmentList hospitalId={hospitalId} />
    </Card>
  );
}