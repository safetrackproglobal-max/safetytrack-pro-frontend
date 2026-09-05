import React, { useEffect, useState } from "react";
import { Card, List, Spin, Typography, Divider } from "antd";
import axios from "axios";

export default function DepartmentDetail({ departmentId }) {
  const [department, setDepartment] = useState(null);
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDepartment() {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/department/${departmentId}`);
        setDepartment(data.department);
        setHazards(data.hazards);
      } catch (e) {
        setDepartment(null);
        setHazards([]);
      }
      setLoading(false);
    }
    fetchDepartment();
  }, [departmentId]);

  if (loading) return <Spin />;

  if (!department) return <Typography.Text type="danger">Department not found.</Typography.Text>;

  return (
    <Card title={department.name}>
      <p><b>Description:</b> {department.description}</p>
      <p><b>Head:</b> {department.head_of_department}</p>
      <Divider orientation="left">Hazards</Divider>
      <List
        dataSource={hazards}
        renderItem={hazard => (
          <List.Item>
            <List.Item.Meta
              title={hazard.name}
              description={
                <>
                  <span><b>Type:</b> {hazard.type} </span>
                  <span><b>Risk:</b> {hazard.risk_level} </span>
                  <span><b>Location:</b> {hazard.location}</span>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
}