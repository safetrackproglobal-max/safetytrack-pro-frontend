// src/components/environmental/modals/SensorDetailsModal.js
import React from 'react';
import { Modal, Descriptions, Tag, Timeline, Statistic, Row, Col, Card } from 'antd';
import { 
  ExperimentOutlined, 
  EnvironmentOutlined,
  ThunderboltOutlined,
  FieldTimeOutlined,
  CalendarOutlined,
  DashboardOutlined
} from '@ant-design/icons';

const SensorDetailsModal = ({ visible, sensor, onClose }) => {
  if (!sensor) return null;

  const getTemperatureColor = (temp) => {
    if (temp >= 35) return '#cf1322';
    if (temp >= 30) return '#f5222d';
    if (temp >= 25) return '#fa541c';
    if (temp >= 20) return '#fa8c16';
    if (temp >= 15) return '#faad14';
    if (temp >= 10) return '#52c41a';
    if (temp >= 5) return '#1890ff';
    if (temp >= 0) return '#096dd9';
    return '#0050b3';
  };

  return (
    <Modal
      title={
        <span>
          <ExperimentOutlined style={{ color: '#fa541c', marginRight: 8 }} />
          Sensor Details: {sensor.name}
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card size="small">
            <Statistic
              title="Current Temperature"
              value={sensor.current_temperature || 'N/A'}
              suffix="°C"
              valueStyle={{ color: getTemperatureColor(sensor.current_temperature), fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      <Descriptions bordered column={2} style={{ marginTop: 16 }}>
        <Descriptions.Item label="Sensor ID" span={2}>
          <Tag color="blue">{sensor.sensor_id}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Name">
          {sensor.name}
        </Descriptions.Item>
        
        <Descriptions.Item label="Status">
          <Tag color={sensor.status === 'active' ? 'green' : 'red'}>
            {sensor.status}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Location">
          <EnvironmentOutlined /> {sensor.location || 'N/A'}
        </Descriptions.Item>
        
        <Descriptions.Item label="Type">
          <Tag color="purple">{sensor.type || 'indoor'}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Temperature Range">
          {sensor.min_temp}°C - {sensor.max_temp}°C
        </Descriptions.Item>
        
        <Descriptions.Item label="Battery Level">
          <ThunderboltOutlined /> {sensor.battery_level || 100}%
        </Descriptions.Item>
        
        <Descriptions.Item label="Installation Date">
          <CalendarOutlined /> {sensor.installation_date ? new Date(sensor.installation_date).toLocaleDateString() : 'N/A'}
        </Descriptions.Item>
        
        {sensor.last_calibration && (
          <Descriptions.Item label="Last Calibration">
            <FieldTimeOutlined /> {new Date(sensor.last_calibration).toLocaleDateString()}
          </Descriptions.Item>
        )}
      </Descriptions>

      {sensor.readings && sensor.readings.length > 0 && (
        <>
          <div style={{ marginTop: 24 }}>
            <h4>Recent Readings</h4>
            <Timeline>
              {sensor.readings.slice(0, 5).map((reading, index) => (
                <Timeline.Item key={index}>
                  <Space>
                    <Tag color={getTemperatureColor(reading.temperature)}>
                      {reading.temperature}°C
                    </Tag>
                    {reading.humidity && <Tag>Humidity: {reading.humidity}%</Tag>}
                    <span style={{ color: '#999' }}>
                      {new Date(reading.reading_time).toLocaleString()}
                    </span>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        </>
      )}
    </Modal>
  );
};

export default SensorDetailsModal;