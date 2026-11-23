import React, { useMemo, useState } from 'react';
import { Input, Segmented, Tag, Typography, Empty } from 'antd';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { WIDGETS } from './widgetCatalog';

const { Text } = Typography;

const WidgetLibrary = ({ onSelect, activeTypes = [] }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => ['All', ...new Set(Object.values(WIDGETS).map((w) => w.category))], []);
  const q = search.trim().toLowerCase();
  const list = Object.entries(WIDGETS).filter(([, w]) => (category === 'All' || w.category === category)
    && (!q || w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q)));

  return (
    <div className="pbi-library">
      <Input.Search placeholder="Search widgets…" allowClear onChange={(e) => setSearch(e.target.value)} />
      <Segmented block size="small" options={categories} value={category} onChange={setCategory} style={{ margin: '12px 0' }} />
      {!list.length && <Empty description="No widget matches" />}
      <div className="pbi-library-grid">
        {list.map(([id, w]) => {
          const used = activeTypes.filter((t) => t === id).length;
          return (
            <button type="button" key={id} className="pbi-library-item" onClick={() => onSelect(id)}>
              <span className="pbi-library-icon" style={{ color: w.color, background: `${w.color}14` }}>{w.icon}</span>
              <span className="pbi-library-body">
                <Text strong>{w.name}</Text>
                <Text type="secondary" className="pbi-library-desc">{w.description}</Text>
                <span>
                  <Tag bordered={false}>{w.category}</Tag>
                  {used > 0 && <Tag color="green" icon={<CheckOutlined />} bordered={false}>on dashboard{used > 1 ? ` ×${used}` : ''}</Tag>}
                </span>
              </span>
              <PlusOutlined className="pbi-library-add" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WidgetLibrary;
