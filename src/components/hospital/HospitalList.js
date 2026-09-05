import React, { useEffect, useState } from "react";
import { List, Card, Spin, Button } from "antd";
import axios from "axios";

export default function DepartmentList({ hospitalId, onSelect }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDepartments() {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/hospital/${hospitalId}/departments`);
        setDepartments(data);
      } catch (e) {
        setDepartments([]);
      }
      setLoading(false);
    }
    fetchDepartments();
  }, [hospitalId]);

  if (loading) return <Spin />;

  return (
    <Card title="Departments">
      <List
        dataSource={departments}
        renderItem={dept => (
          <List.Item actions={[
            <Button type="link" onClick={() => onSelect && onSelect(dept.id)}>Details</Button>
          ]}>
            <List.Item.Meta title={dept.name} description={dept.description} />
          </List.Item>
        )}
      />
    </Card>
  );
}