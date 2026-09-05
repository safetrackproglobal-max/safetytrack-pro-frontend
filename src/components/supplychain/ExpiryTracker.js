import React, { useEffect, useState } from "react";
import { Card, List, Progress, Tag, Spin } from "antd";
import axios from "axios";
import moment from "moment";

export default function ExpiryTracker({ departmentId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/inventory/expiring?department_id=${departmentId}`);
        setItems(data);
      } catch (e) {
        setItems([]);
      }
      setLoading(false);
    }
    fetchItems();
  }, [departmentId]);

  if (loading) return <Spin />;

  return (
    <Card title="Expiring Supplies">
      <List
        dataSource={items}
        renderItem={item => {
          const daysLeft = moment(item.expiry_date).diff(moment(), 'days');
          let color = "green";
          if (daysLeft < 30) color = "red";
          else if (daysLeft < 90) color = "orange";
          return (
            <List.Item>
              <List.Item.Meta
                title={item.name}
                description={`SKU: ${item.sku} | Supplier: ${item.supplier_name || ''}`}
              />
              <Tag color={color}>{daysLeft} days left</Tag>
              <Progress percent={Math.max(0, Math.min(100, 100 - (daysLeft / 365) * 100))} showInfo={false} strokeColor={color} />
              <span style={{ marginLeft: 10 }}>Expires: {moment(item.expiry_date).format("YYYY-MM-DD")}</span>
            </List.Item>
          );
        }}
      />
    </Card>
  );
}