import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Select, DatePicker, Table, Spin } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  ShoppingOutlined, 
  DollarOutlined,
  BarChartOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './supplychain.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function InventoryAnalytics({ departmentId }) {
  const [analyticsData, setAnalyticsData] = useState({});
  const [timeRange, setTimeRange] = useState('month');
  const [dateRange, setDateRange] = useState([
    moment().startOf('month'),
    moment().endOf('month')
  ]);
  const [loading, setLoading] = useState(true);
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const params = {
          department_id: departmentId,
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD')
        };
        
        const { data } = await axios.get('/api/inventory/analytics', { params });
        setAnalyticsData(data);
        
        // Fetch top moving items
        const topItemsResponse = await axios.get('/api/inventory/top-items', { params });
        setTopItems(topItemsResponse.data);
      } catch (e) {
        console.error('Error fetching analytics:', e);
        setAnalyticsData({});
        setTopItems([]);
      }
      setLoading(false);
    }
    
    fetchAnalytics();
  }, [departmentId, dateRange]);

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    let startDate, endDate;
    
    switch (value) {
      case 'week':
        startDate = moment().startOf('week');
        endDate = moment().endOf('week');
        break;
      case 'month':
        startDate = moment().startOf('month');
        endDate = moment().endOf('month');
        break;
      case 'quarter':
        startDate = moment().startOf('quarter');
        endDate = moment().endOf('quarter');
        break;
      case 'year':
        startDate = moment().startOf('year');
        endDate = moment().endOf('year');
        break;
      default:
        startDate = moment().startOf('month');
        endDate = moment().endOf('month');
    }
    
    setDateRange([startDate, endDate]);
  };

  const columns = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Transactions',
      dataIndex: 'transaction_count',
      key: 'transaction_count',
      sorter: (a, b) => a.transaction_count - b.transaction_count,
    },
    {
      title: 'Usage Rate',
      dataIndex: 'usage_rate',
      key: 'usage_rate',
      render: (rate) => `${rate} units/day`,
      sorter: (a, b) => a.usage_rate - b.usage_rate,
    },
  ];

  if (loading) return <Spin size="large" />;

  return (
    <div className="inventory-analytics">
      <div className="analytics-header">
        <h2>
          <BarChartOutlined /> Inventory Analytics
        </h2>
        <div className="analytics-controls">
          <Select 
            defaultValue="month" 
            style={{ width: 120 }} 
            onChange={handleTimeRangeChange}
            value={timeRange}
          >
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="quarter">This Quarter</Option>
            <Option value="year">This Year</Option>
            <Option value="custom">Custom</Option>
          </Select>
          
          {timeRange === 'custom' && (
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ marginLeft: '10px' }}
            />
          )}
        </div>
      </div>

      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Inventory Value"
              value={analyticsData.total_value || 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
              suffix={analyticsData.value_change_percentage > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
              {analyticsData.value_change_percentage > 0 ? '+' : ''}
              {analyticsData.value_change_percentage || 0}% from previous period
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Items"
              value={analyticsData.total_items || 0}
              prefix={<ShoppingOutlined />}
            />
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
              {analyticsData.items_change_percentage > 0 ? '+' : ''}
              {analyticsData.items_change_percentage || 0}% from previous period
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Low Stock Items"
              value={analyticsData.low_stock_items || 0}
              valueStyle={{ color: '#cf1322' }}
              suffix={`/ ${analyticsData.total_items || 0}`}
            />
            <Progress 
              percent={analyticsData.total_items ? 
                Math.round((analyticsData.low_stock_items / analyticsData.total_items) * 100) : 0} 
              size="small" 
              status="exception" 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg. Cost per Unit"
              value={analyticsData.avg_cost_per_unit || 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: analyticsData.cost_change_percentage >= 0 ? '#3f8600' : '#cf1322' }}
              prefixCls={<DollarOutlined />}
              suffix={analyticsData.cost_change_percentage >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
              {analyticsData.cost_change_percentage > 0 ? '+' : ''}
              {analyticsData.cost_change_percentage || 0}% from previous period
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Category Distribution" style={{ height: '400px' }}>
            {analyticsData.category_distribution && 
            Object.keys(analyticsData.category_distribution).length > 0 ? (
              <div className="category-chart">
                {Object.entries(analyticsData.category_distribution).map(([category, value]) => (
                  <div key={category} className="category-item">
                    <div className="category-name">{category}</div>
                    <Progress 
                      percent={Math.round((value / analyticsData.total_value) * 100)} 
                      showInfo={false}
                    />
                    <div className="category-value">${value.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No category data available</div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top Moving Items" style={{ height: '400px' }}>
            {topItems.length > 0 ? (
              <Table 
                dataSource={topItems} 
                columns={columns} 
                size="small"
                pagination={{ pageSize: 5 }}
                scroll={{ y: 240 }}
                rowKey="id"
              />
            ) : (
              <div className="empty-state">No transaction data available</div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Card title="Inventory Turnover">
            {analyticsData.turnover_rates && Object.keys(analyticsData.turnover_rates).length > 0 ? (
              <div className="turnover-container">
                {Object.entries(analyticsData.turnover_rates).map(([category, rate]) => (
                  <div key={category} className="turnover-item">
                    <div className="turnover-category">{category}</div>
                    <Progress 
                      percent={Math.min(rate * 10, 100)} 
                      format={() => `${rate.toFixed(2)}x`}
                      status={rate < 2 ? 'exception' : rate < 4 ? 'normal' : 'success'}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No turnover data available</div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}