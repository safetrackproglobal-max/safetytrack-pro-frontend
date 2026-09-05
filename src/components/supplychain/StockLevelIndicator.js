import React, { useEffect, useState } from "react";
import { Card, List, Progress, Tag, Spin } from "antd";
import axios from "axios";

export default function StockLevelIndicator({ departmentId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStockLevels() {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/inventory/stock-levels?department_id=${departmentId}`);
        setItems(data);
      } catch (e) {
        setItems([]);
      }
      setLoading(false);
    }
    fetchStockLevels();
  }, [departmentId]);

  if (loading) return <Spin />;

  return (
    <Card title="Stock Level Indicator">
      <List
        dataSource={items}
        renderItem={item => {
          const percent = item.max_stock_level && item.max_stock_level > 0
            ? Math.round((item.current_stock / item.max_stock_level) * 100)
            : 0;
          let color = "green";
          if (percent < 30) color = "red";
          else if (percent < 70) color = "orange";
          return (
            <List.Item>
              <List.Item.Meta
                title={item.name}
                description={`SKU: ${item.sku} | Supplier: ${item.supplier_name || ''}`}
              />
              <Tag color={color}>{item.current_stock} / {item.max_stock_level}</Tag>
              <Progress percent={percent} status={percent < 30 ? "exception" : "active"} strokeColor={color} style={{ width: 150 }} />
              <span style={{ marginLeft: 10 }}>Unit: {item.unit_of_measure}</span>
            </List.Item>
          );
        }}
      />
    </Card>
  );
}