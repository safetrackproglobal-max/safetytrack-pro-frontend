// src/components/analytics/DataEntryForms.jsx
import React from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Button, Space } from 'antd';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

const DataEntryForms = ({ type, form, onFinish, loading }) => {
  // ==================== MANPOWER FORM ====================
  const renderManpowerForm = () => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="section" label="Section" rules={[{ required: true, message: 'Please enter section' }]}>
        <Input placeholder="e.g., Section A, Maintenance Dept" />
      </Form.Item>
      <Form.Item name="count" label="Count" rules={[{ required: true, message: 'Please enter count' }]}>
        <InputNumber min={0} style={{ width: '100%' }} placeholder="Number of employees" />
      </Form.Item>
      <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select date' }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="department_name" label="Department Name">
        <Input placeholder="Department name" />
      </Form.Item>
      <Form.Item name="notes" label="Notes">
        <TextArea rows={2} placeholder="Additional notes" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Add Manpower Data
        </Button>
      </Form.Item>
    </Form>
  );

  // ==================== TRAINING FORM ====================
  const renderTrainingForm = () => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="type" label="Training Type" rules={[{ required: true, message: 'Please enter training type' }]}>
        <Input placeholder="e.g., Fire Safety, First Aid, Work Permit" />
      </Form.Item>
      <Form.Item name="count" label="Number Trained" rules={[{ required: true, message: 'Please enter count' }]}>
        <InputNumber min={0} style={{ width: '100%' }} placeholder="Number of trainees" />
      </Form.Item>
      <Form.Item name="completed_date" label="Completion Date" rules={[{ required: true, message: 'Please select date' }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="notes" label="Notes">
        <TextArea rows={2} placeholder="Additional notes" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Add Training Data
        </Button>
      </Form.Item>
    </Form>
  );

  // ==================== LTI FORM ====================
  const renderLTIForm = () => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="year" label="Year" rules={[{ required: true, message: 'Please enter year' }]}>
        <InputNumber min={2000} max={2100} style={{ width: '100%' }} placeholder="e.g., 2024" />
      </Form.Item>
      <Form.Item name="value" label="LTI Value" rules={[{ required: true, message: 'Please enter LTI value' }]}>
        <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="e.g., 0.15" />
      </Form.Item>
      <Form.Item name="incident_count" label="Incident Count">
        <InputNumber min={0} style={{ width: '100%' }} placeholder="Number of incidents" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea rows={2} placeholder="Description" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Add LTI Data
        </Button>
      </Form.Item>
    </Form>
  );

  // ==================== MAN-HOURS FORM ====================
  const renderManHoursForm = () => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="section" label="Section" rules={[{ required: true, message: 'Please enter section' }]}>
        <Input placeholder="e.g., Section A" />
      </Form.Item>
      <Form.Item name="hours" label="Hours" rules={[{ required: true, message: 'Please enter hours' }]}>
        <InputNumber min={0} style={{ width: '100%' }} placeholder="Total man-hours" />
      </Form.Item>
      <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select date' }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="project" label="Project">
        <Input placeholder="Project name" />
      </Form.Item>
      <Form.Item name="activity" label="Activity">
        <Input placeholder="Activity description" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Add Man-Hours Data
        </Button>
      </Form.Item>
    </Form>
  );

  // ==================== OBSERVATIONS FORM ====================
  const renderObservationsForm = () => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="type" label="Observation Type" rules={[{ required: true, message: 'Please select type' }]}>
        <Select placeholder="Select type">
          <Option value="Positive">Positive</Option>
          <Option value="Negative">Negative</Option>
          <Option value="Hazard">Hazard</Option>
          <Option value="Safe Behavior">Safe Behavior</Option>
          <Option value="Unsafe Behavior">Unsafe Behavior</Option>
        </Select>
      </Form.Item>
      <Form.Item name="count" label="Count" rules={[{ required: true, message: 'Please enter count' }]}>
        <InputNumber min={1} style={{ width: '100%' }} placeholder="Number of observations" />
      </Form.Item>
      <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select date' }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="location" label="Location">
        <Input placeholder="Location" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea rows={2} placeholder="Observation description" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Add Observation Data
        </Button>
      </Form.Item>
    </Form>
  );

  // ==================== ACCIDENTS FORM ====================
  const renderAccidentsForm = () => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="year" label="Year" rules={[{ required: true, message: 'Please enter year' }]}>
        <InputNumber min={2000} max={2100} style={{ width: '100%' }} placeholder="e.g., 2024" />
      </Form.Item>
      <Form.Item name="rate" label="Accident Rate" rules={[{ required: true, message: 'Please enter rate' }]}>
        <InputNumber min={0} step={0.001} style={{ width: '100%' }} placeholder="e.g., 0.002" />
      </Form.Item>
      <Form.Item name="per_10k_hours" label="Per 10K Hours" rules={[{ required: true, message: 'Please enter value' }]}>
        <InputNumber min={0} step={0.1} style={{ width: '100%' }} placeholder="e.g., 1.5" />
      </Form.Item>
      <Form.Item name="severity" label="Severity">
        <Input placeholder="Severity level" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea rows={2} placeholder="Accident description" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Add Accident Data
        </Button>
      </Form.Item>
    </Form>
  );

  // ==================== SEVERITY FORM ====================
  const renderSeverityForm = () => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="year" label="Year" rules={[{ required: true, message: 'Please enter year' }]}>
        <InputNumber min={2000} max={2100} style={{ width: '100%' }} placeholder="e.g., 2024" />
      </Form.Item>
      <Form.Item name="value" label="Severity Value" rules={[{ required: true, message: 'Please enter severity value' }]}>
        <InputNumber min={0} max={10} step={0.1} style={{ width: '100%' }} placeholder="e.g., 3.5 (1-10 scale)" />
      </Form.Item>
      <Form.Item name="type" label="Severity Type">
        <Input placeholder="e.g., Minor, Moderate, Severe" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <TextArea rows={2} placeholder="Severity description" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Add Severity Data
        </Button>
      </Form.Item>
    </Form>
  );

  // ==================== INJURIES FORM ====================
  const renderInjuriesForm = () => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="body_part" label="Body Part" rules={[{ required: true, message: 'Please enter body part' }]}>
        <Input placeholder="e.g., Left Hand, Back, Head" />
      </Form.Item>
      <Form.Item name="count" label="Count" rules={[{ required: true, message: 'Please enter count' }]}>
        <InputNumber min={1} style={{ width: '100%' }} placeholder="Number of injuries" />
      </Form.Item>
      <Form.Item name="year" label="Year" rules={[{ required: true, message: 'Please enter year' }]}>
        <InputNumber min={2000} max={2100} style={{ width: '100%' }} placeholder="e.g., 2024" />
      </Form.Item>
      <Form.Item name="injury_type" label="Injury Type">
        <Input placeholder="e.g., Fracture, Sprain, Laceration" />
      </Form.Item>
      <Form.Item name="severity" label="Severity">
        <Input placeholder="e.g., Minor, Moderate, Severe" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Add Injury Data
        </Button>
      </Form.Item>
    </Form>
  );

  // ==================== OVERDUE REPORTS FORM ====================
  const renderOverdueForm = () => (
  <Form form={form} layout="vertical" onFinish={onFinish}>
    <Form.Item 
      name="month" 
      label="Month" 
      rules={[{ required: true, message: 'Please select month' }]}
      extra="Format: Jan-2024, Feb-2024, etc."
    >
      <Select placeholder="Select month">
        <Option value="Jan-2024">January 2024</Option>
        <Option value="Feb-2024">February 2024</Option>
        <Option value="Mar-2024">March 2024</Option>
        <Option value="Apr-2024">April 2024</Option>
        <Option value="May-2024">May 2024</Option>
        <Option value="Jun-2024">June 2024</Option>
        <Option value="Jul-2024">July 2024</Option>
        <Option value="Aug-2024">August 2024</Option>
        <Option value="Sep-2024">September 2024</Option>
        <Option value="Oct-2024">October 2024</Option>
        <Option value="Nov-2024">November 2024</Option>
        <Option value="Dec-2024">December 2024</Option>
        <Option value="Jan-2025">January 2025</Option>
        <Option value="Feb-2025">February 2025</Option>
        <Option value="Mar-2025">March 2025</Option>
        <Option value="Apr-2025">April 2025</Option>
        <Option value="May-2025">May 2025</Option>
        <Option value="Jun-2025">June 2025</Option>
        <Option value="Jul-2025">July 2025</Option>
        <Option value="Aug-2025">August 2025</Option>
        <Option value="Sep-2025">September 2025</Option>
        <Option value="Oct-2025">October 2025</Option>
        <Option value="Nov-2025">November 2025</Option>
        <Option value="Dec-2025">December 2025</Option>
        <Option value="Jan-2026">January 2026</Option>
        <Option value="Feb-2026">February 2026</Option>
        <Option value="Mar-2026">March 2026</Option>
        <Option value="Apr-2026">April 2026</Option>
        <Option value="May-2026">May 2026</Option>
        <Option value="Jun-2026">June 2026</Option>
        <Option value="Jul-2026">July 2026</Option>
        <Option value="Aug-2026">August 2026</Option>
        <Option value="Sep-2026">September 2026</Option>
        <Option value="Oct-2026">October 2026</Option>
        <Option value="Nov-2026">November 2026</Option>
        <Option value="Dec-2026">December 2026</Option>
      </Select>
    </Form.Item>
    <Form.Item name="on_time" label="On Time Reports" rules={[{ required: true, message: 'Please enter count' }]}>
      <InputNumber min={0} style={{ width: '100%' }} placeholder="Number of on-time reports" />
    </Form.Item>
    <Form.Item name="late" label="Late Reports" rules={[{ required: true, message: 'Please enter count' }]}>
      <InputNumber min={0} style={{ width: '100%' }} placeholder="Number of late reports" />
    </Form.Item>
    <Form.Item name="report_type" label="Report Type">
      <Input placeholder="e.g., Safety, Compliance, Incident" />
    </Form.Item>
    <Form.Item name="department_name" label="Department">
      <Input placeholder="Department name" />
    </Form.Item>
    <Form.Item name="responsible_person" label="Responsible Person">
      <Input placeholder="Name of responsible person" />
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit" loading={loading} block>
        Add Overdue Report Data
      </Button>
    </Form.Item>
  </Form>
);

  // ==================== PROJECTS FORM ====================
  const renderProjectForm = () => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="name" label="Project Name" rules={[{ required: true, message: 'Please enter project name' }]}>
        <Input placeholder="e.g., Safety Audit 2024" />
      </Form.Item>
      <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter description' }]}>
        <TextArea rows={2} placeholder="Project description" />
      </Form.Item>
      <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status' }]}>
        <Select placeholder="Select status">
          <Option value="planning">Planning</Option>
          <Option value="active">Active</Option>
          <Option value="on_hold">On Hold</Option>
          <Option value="completed">Completed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      </Form.Item>
      <Form.Item name="priority" label="Priority">
        <Select placeholder="Select priority">
          <Option value="low">Low</Option>
          <Option value="medium">Medium</Option>
          <Option value="high">High</Option>
          <Option value="critical">Critical</Option>
        </Select>
      </Form.Item>
      <Form.Item name="start_date" label="Start Date">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="end_date" label="End Date">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="budget" label="Budget">
        <InputNumber min={0} step={100} style={{ width: '100%' }} placeholder="e.g., 50000" />
      </Form.Item>
      <Form.Item name="department" label="Department">
        <Input placeholder="Department name" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Create Project
        </Button>
      </Form.Item>
    </Form>
  );

  // ==================== RENDER SWITCH ====================
  switch (type) {
    case 'manpower':
      return renderManpowerForm();
    case 'training':
      return renderTrainingForm();
    case 'lti':
      return renderLTIForm();
    case 'manhours':
      return renderManHoursForm();
    case 'observations':
      return renderObservationsForm();
    case 'accidents':
      return renderAccidentsForm();
    case 'severity':
      return renderSeverityForm();
    case 'injuries':
      return renderInjuriesForm();
    case 'overdue':
      return renderOverdueForm();
    case 'project':
    case 'projects':
      return renderProjectForm();
    default:
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No form available for {type}</p>
        </div>
      );
  }
};

export default DataEntryForms;