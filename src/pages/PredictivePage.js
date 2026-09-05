import React, { useState } from "react";
import { Card, Form, InputNumber, Button, Alert, Table, Spin, Row, Col, Typography } from "antd";
import { predictAirQualityAnomaly } from "../services/aiService";
import AQIMeter from "../components/monitoring/AQIMeter";
import MedicalTextAnalysis from "../components/AI/MedicalTextAnalysis";
import DiseasePrediction from "../components/AI/DiseasePrediction";

const { Title, Text } = Typography;

const AIR_PARAMETERS = [
  { name: "PM2.5", unit: "μg/m³", min: 0, max: 500, defaultValue: 25 },
  { name: "PM10", unit: "μg/m³", min: 0, max: 600, defaultValue: 50 },
  { name: "CO", unit: "ppm", min: 0, max: 50, defaultValue: 1.5 },
  { name: "CO2", unit: "ppm", min: 300, max: 5000, defaultValue: 800 },
  { name: "O3", unit: "ppb", min: 0, max: 500, defaultValue: 80 },
  { name: "NO2", unit: "ppb", min: 0, max: 400, defaultValue: 40 },
  { name: "SO2", unit: "ppb", min: 0, max: 350, defaultValue: 20 },
  { name: "Temperature", unit: "°C", min: -20, max: 50, defaultValue: 22 },
  { name: "Humidity", unit: "%", min: 0, max: 100, defaultValue: 45 }
];

export default function PredictivePage({ hospitalId = 1 }) { // Default hospitalId
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);

  const columns = [
    { title: "Parameter", dataIndex: "parameter", key: "parameter" },
    { title: "Value", dataIndex: "value", key: "value", render: (value, record) => `${value} ${record.unit}` },
    { title: "Status", dataIndex: "is_anomaly", key: "status", 
      render: (isAnomaly) => (
        <span style={{ color: isAnomaly ? "#ff4d4f" : "#52c41a", fontWeight: "bold" }}>
          {isAnomaly ? "⚠️ Anomaly" : "✅ Normal"}
        </span>
      )
    },
    { title: "Anomaly Score", dataIndex: "anomaly_score", 
      render: (score) => score ? (score * 100).toFixed(1) + "%" : "N/A" 
    },
    { title: "Normal Probability", dataIndex: "normal_probability", 
      render: (prob) => prob ? (prob * 100).toFixed(1) + "%" : "N/A" 
    }
  ];

  const handleFinish = async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert form values to array in correct order
      const parameterValues = AIR_PARAMETERS.map(param => {
        const value = values[param.name];
        return value !== undefined ? Number(value) : param.defaultValue;
      });

      const data = await predictAirQualityAnomaly(hospitalId, parameterValues);
      
      const tableData = AIR_PARAMETERS.map((param, idx) => ({
        key: idx,
        parameter: param.name,
        value: parameterValues[idx],
        unit: param.unit,
        ...(data[idx] || { is_anomaly: false, anomaly_score: 0, normal_probability: 1 })
      }));
      
      setPredictions(tableData);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(err.message || "Prediction failed. Please check your input values.");
      setPredictions([]);
    }
    setLoading(false);
  };

  const handleReset = () => {
    form.resetFields();
    setPredictions([]);
    setError(null);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Predictive Analytics</Title>
      <Text type="secondary">AI-powered air quality anomaly detection and medical analysis</Text>

      <Card title="Air Quality Anomaly Detection" style={{ marginTop: 24 }}>
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleFinish}
          initialValues={Object.fromEntries(
            AIR_PARAMETERS.map(param => [param.name, param.defaultValue])
          )}
        >
          <Row gutter={[16, 8]}>
            {AIR_PARAMETERS.map((param, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={param.name}>
                <Form.Item
                  name={param.name}
                  label={`${param.name} (${param.unit})`}
                  rules={[
                    { 
                      required: true, 
                      message: `Please enter ${param.name} value` 
                    },
                    {
                      type: 'number',
                      min: param.min,
                      max: param.max,
                      message: `Value must be between ${param.min} and ${param.max}`
                    }
                  ]}
                >
                  <InputNumber 
                    style={{ width: "100%" }}
                    placeholder={`Enter ${param.name}`}
                    min={param.min}
                    max={param.max}
                    step={param.name.includes("Temperature") ? 0.1 : 1}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
              Predict Anomaly
            </Button>
            <Button onClick={handleReset} disabled={loading}>
              Reset
            </Button>
          </Form.Item>
        </Form>

        {error && (
          <Alert 
            type="error" 
            message="Prediction Error" 
            description={error}
            style={{ marginBottom: 16 }}
            closable
          />
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin size="large" />
            <div style={{ marginTop: 8 }}>Analyzing air quality data...</div>
          </div>
        )}

        {predictions.length > 0 && !loading && (
          <div>
            <Title level={4}>Prediction Results</Title>
            <Table 
              columns={columns} 
              dataSource={predictions} 
              pagination={false}
              size="middle"
            />
          </div>
        )}
      </Card>

      {/* Additional AI-driven widgets */}
      <Card style={{ marginTop: 24 }} title="AI Medical Text Analysis">
        <MedicalTextAnalysis hospitalId={hospitalId} />
      </Card>
      
      <Card style={{ marginTop: 24 }} title="Disease Prediction">
        <DiseasePrediction hospitalId={hospitalId} />
      </Card>
      
      <Card style={{ marginTop: 24 }} title="Current Air Quality Index">
        <AQIMeter hospitalId={hospitalId} />
      </Card>
    </div>
  );
}