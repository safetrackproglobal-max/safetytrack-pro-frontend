import React, { useEffect, useState } from "react";
import { Card, Form, Input, Select, Button, message } from "antd";
import axios from "axios";

const { Option } = Select;

const HAZARD_TYPES = [
  "Biological", "Chemical", "Physical", "Ergonomic", "Radiation", "Psychosocial", "Environmental"
];
const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

export default function HazardForm({ departmentId, onSaved, hazard }) {
  const [form] = Form.useForm();
  useEffect(() => {
    if (hazard) form.setFieldsValue(hazard);
  }, [hazard, form]);

  const handleFinish = async (values) => {
    try {
      if (hazard && hazard.id) {
        await axios.put(`/api/hazard/${hazard.id}`, values);
        message.success("Hazard updated");
      } else {
        await axios.post(`/api/hazard`, { ...values, department_id: departmentId });
        message.success("Hazard created");
      }
      onSaved && onSaved();
      form.resetFields();
    } catch {
      message.error("Failed to save hazard");
    }
  };

  return (
    <Card title={hazard ? "Edit Hazard" : "Add Hazard"}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Type" name="type" rules={[{ required: true }]}>
          <Select>
            {HAZARD_TYPES.map(type => <Option key={type}>{type}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item label="Risk Level" name="risk_level" rules={[{ required: true }]}>
          <Select>
            {RISK_LEVELS.map(level => <Option key={level}>{level}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item label="Location" name="location">
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item label="Control Measures" name="control_measures">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {hazard ? "Update" : "Create"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}