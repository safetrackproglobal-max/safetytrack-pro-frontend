import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Space, Input, Select, DatePicker, Card } from "antd";
import { EyeOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const STATUS_OPTIONS = ["Reported", "Under Investigation", "Resolved", "Closed"];
const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
const TYPE_OPTIONS = [
  "Needlestick Injury",
  "Chemical Spill",
  "Biological Exposure",
  "Radiation Incident",
  "Physical Injury",
  "Equipment Failure",
  "Environmental Hazard",
  "Other"
];

export default function IncidentList({ hospitalId, onViewIncident }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: null,
    severity: null,
    type: null,
    search: '',
    dateRange: null
  });

  useEffect(() => {
    fetchIncidents();
    // eslint-disable-next-line
  }, [hospitalId, pagination.current, pagination.pageSize, filters]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };

      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        params.start_date = filters.dateRange[0].format('YYYY-MM-DD');
        params.end_date = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const { data } = await axios.get(`/api/hospital/${hospitalId}/incidents`, { params });
      setIncidents(data.incidents);
      setPagination(prev => ({
        ...prev,
        total: data.total_count
      }));
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    }
    setLoading(false);
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => `#${id}`
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: TYPE_OPTIONS.map(type => ({ text: type, value: type })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const color = {
          Critical: 'red',
          High: 'orange',
          Medium: 'yellow',
          Low: 'green'
        }[severity];
        return <Tag color={color}>{severity}</Tag>;
      },
      filters: SEVERITY_OPTIONS.map(severity => ({ text: severity, value: severity })),
      onFilter: (value, record) => record.severity === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = {
          Reported: 'blue',
          'Under Investigation': 'orange',
          Resolved: 'green',
          Closed: 'gray'
        }[status];
        return <Tag color={color}>{status}</Tag>;
      },
      filters: STATUS_OPTIONS.map(status => ({ text: status, value: status })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Reported Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => onViewIncident(record.id)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Search incidents..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Status"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            allowClear
            style={{ width: 150 }}
          >
            {STATUS_OPTIONS.map(status => (
              <Option key={status} value={status}>{status}</Option>
            ))}
          </Select>
          <Select
            placeholder="Severity"
            value={filters.severity}
            onChange={(value) => handleFilterChange('severity', value)}
            allowClear
            style={{ width: 150 }}
          >
            {SEVERITY_OPTIONS.map(severity => (
              <Option key={severity} value={severity}>{severity}</Option>
            ))}
          </Select>
          <Select
            placeholder="Type"
            value={filters.type}
            onChange={(value) => handleFilterChange('type', value)}
            allowClear
            style={{ width: 180 }}
          >
            {TYPE_OPTIONS.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
          <RangePicker
            onChange={(dates) => handleFilterChange('dateRange', dates)}
          />
          <Button
            icon={<FilterOutlined />}
            onClick={fetchIncidents}
          >
            Apply Filters
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={incidents}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
}