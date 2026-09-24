// src/components/incidents/WitnessStatementForm.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Form, Input, Button, Space, message, Row, Col, Select,
  DatePicker, TimePicker, Tag, Divider, Alert, List, Avatar,
  Modal, Descriptions, Tooltip, Badge, Empty, Upload, Radio,
  Checkbox, InputNumber, Steps, Result, Typography, Spin
} from 'antd';
import {
  UserOutlined, PlusOutlined, DeleteOutlined, EditOutlined,
  FileTextOutlined, PaperClipOutlined, CheckCircleOutlined,
  ClockCircleOutlined, EnvironmentOutlined, PhoneOutlined,
  MailOutlined, SafetyCertificateOutlined, SignatureOutlined,
  FileImageOutlined, InboxOutlined, EyeOutlined, ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// ✅ SERVICE IMPORTS
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Text, Paragraph } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

// ==================== WITNESS STATEMENT FORM ====================

const WitnessStatementForm = ({ 
  incident, 
  onSave,
  readOnly = false 
}) => {
  // ✅ Get user from auth context
  const { user: currentUser } = useAuth();

  const [statements, setStatements] = useState([]);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStatement, setEditingStatement] = useState(null);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ==================== FETCH STATEMENTS ====================

  const fetchStatements = useCallback(async () => {
    if (!incident?.id) return;

    setLoading(true);
    try {
      const response = await notificationService.getWitnessStatements(incident.id);

      const data = 
        response?.statements || 
        response?.data?.statements || 
        (Array.isArray(response) ? response : []) || 
        [];

      setStatements(data);
    } catch (error) {
      console.error('Failed to fetch witness statements:', error);
      // Fallback to incident data
      const saved = incident.custom_data?.witness_statements || [];
      setStatements(saved);
    } finally {
      setLoading(false);
    }
  }, [incident?.id, incident?.custom_data?.witness_statements]);

  useEffect(() => {
    if (incident?.id) {
      fetchStatements();
    }
  }, [incident?.id, fetchStatements]);

  // ==================== SAVE STATEMENT ====================

  const handleSaveStatement = async (values) => {
    if (!incident?.id) {
      message.warning('No incident selected');
      return;
    }

    setSaving(true);
    try {
      // ✅ Map frontend form fields to backend expected names
      const payload = {
        witness_name: values.witnessName,
        witness_type: values.witnessType,
        witness_email: values.email,
        witness_phone: values.contactNumber,
        witness_department: values.department,
        statement_text: values.statementText,
        witness_location: values.witnessLocation,
        date_of_statement: values.dateOfStatement?.toISOString(),
        time_of_statement: values.timeOfStatement?.format('HH:mm'),
        statement_taken_by: values.statementTakenBy,
        witness_acknowledged: values.witnessSignature || false,
        additional_notes: values.additionalNotes,
        attachments: fileList.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          url: f.url || ''
        }))
      };

      let response;
      if (editingStatement) {
        response = await notificationService.updateWitnessStatement(
          editingStatement.id,
          payload
        );
      } else {
        response = await notificationService.createWitnessStatement(
          incident.id,
          payload
        );
      }

      const saved = response?.statement || response?.data?.statement || response;

      if (saved) {
        if (editingStatement) {
          setStatements(prev => prev.map(s => 
            s.id === editingStatement.id ? { ...s, ...saved } : s
          ));
          message.success('Statement updated');
        } else {
          setStatements(prev => [saved, ...prev]);
          message.success('Statement recorded');
          if (onSave) onSave(saved);
        }
      } else {
        // Optimistic fallback
        const fallback = {
          id: editingStatement?.id || Date.now().toString(),
          statement_number: `WS-${Date.now()}`,
          ...payload,
          created_at: editingStatement?.created_at || new Date().toISOString(),
          recorded_by_name: currentUser?.name || currentUser?.email
        };

        if (editingStatement) {
          setStatements(prev => prev.map(s => 
            s.id === editingStatement.id ? fallback : s
          ));
          message.success('Statement updated');
        } else {
          setStatements(prev => [fallback, ...prev]);
          message.success('Statement recorded');
        }
      }

      setModalVisible(false);
      form.resetFields();
      setEditingStatement(null);
      setFileList([]);
    } catch (error) {
      console.error('Failed to save statement:', error);
      message.error(error?.message || 'Failed to save witness statement');
    } finally {
      setSaving(false);
    }
  };

  // ==================== DELETE ====================

  const handleDelete = async (statementId) => {
    // Optimistic
    const previous = [...statements];
    setStatements(prev => prev.filter(s => s.id !== statementId));

    try {
      await notificationService.deleteWitnessStatement(statementId);
      message.success('Statement deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      setStatements(previous);
      message.error('Failed to delete statement');
    }
  };

  // ==================== VIEW ====================

  const handleViewStatement = (statement) => {
    setSelectedStatement(statement);
    setViewModalVisible(true);
  };

  // ==================== RENDER ====================

  return (
    <Card
      title={
        <Space>
          <FileTextOutlined />
          <span>Witness Statements</span>
          <Badge count={statements.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Refresh">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchStatements}
              loading={loading}
              size="small"
            />
          </Tooltip>
          {!readOnly && (
            <Button 
              type="primary" 
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingStatement(null);
                form.resetFields();
                form.setFieldsValue({
                  witnessType: 'eyewitness',
                  dateOfStatement: dayjs(),
                  timeOfStatement: dayjs(),
                  statementTakenBy: currentUser?.name || ''
                });
                setFileList([]);
                setModalVisible(true);
              }}
            >
              Add Statement
            </Button>
          )}
        </Space>
      }
      size="small"
    >
      <Alert
        message="Witness Statement Guidelines"
        description="Record statements while memories are fresh. Ensure witnesses understand the importance of accuracy. Statements should be in the witness's own words."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin tip="Loading statements..." />
        </div>
      ) : statements.length > 0 ? (
        <List
          dataSource={statements}
          renderItem={(statement) => {
            // Handle both field naming conventions
            const witnessName = statement.witness_name || statement.witnessName;
            const witnessType = statement.witness_type || statement.witnessType;
            const statementText = statement.statement_text || statement.statementText;
            const createdAt = statement.created_at || statement.createdAt;
            const contactNumber = statement.witness_phone || statement.contactNumber;
            const attachments = statement.attachments || [];

            return (
              <List.Item
                actions={[
                  <Tooltip title="View" key="view">
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<EyeOutlined />}
                      onClick={() => handleViewStatement(statement)}
                    />
                  </Tooltip>,
                  ...(!readOnly ? [
                    <Tooltip title="Edit" key="edit">
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingStatement(statement);
                          form.setFieldsValue({
                            witnessName: witnessName,
                            witnessType: witnessType,
                            email: statement.witness_email || statement.email,
                            contactNumber: contactNumber,
                            department: statement.witness_department || statement.department,
                            statementText: statementText,
                            witnessLocation: statement.witness_location || statement.witnessLocation,
                            dateOfStatement: statement.date_of_statement 
                              ? dayjs(statement.date_of_statement) 
                              : null,
                            timeOfStatement: statement.time_of_statement 
                              ? dayjs(statement.time_of_statement, 'HH:mm') 
                              : null,
                            statementTakenBy: statement.statement_taken_by || statement.statementTakenBy,
                            witnessSignature: statement.witness_acknowledged || statement.witnessSignature,
                            additionalNotes: statement.additional_notes || statement.additionalNotes
                          });
                          setModalVisible(true);
                        }}
                      />
                    </Tooltip>,
                    <Tooltip title="Delete" key="delete">
                      <Button 
                        type="link" 
                        size="small" 
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(statement.id)}
                      />
                    </Tooltip>
                  ] : [])
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{witnessName}</Text>
                      <Tag color="blue">{witnessType}</Tag>
                      {attachments.length > 0 && (
                        <Tag icon={<PaperClipOutlined />}>
                          {attachments.length} files
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      <Paragraph 
                        ellipsis={{ rows: 2, expandable: false }} 
                        style={{ margin: 0 }}
                      >
                        {statementText}
                      </Paragraph>
                      <Space size="large">
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ClockCircleOutlined /> {dayjs(createdAt).fromNow()}
                        </Text>
                        {contactNumber && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <PhoneOutlined /> {contactNumber}
                          </Text>
                        )}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No witness statements recorded"
        >
          {!readOnly && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingStatement(null);
                form.resetFields();
                form.setFieldsValue({
                  witnessType: 'eyewitness',
                  dateOfStatement: dayjs(),
                  timeOfStatement: dayjs(),
                  statementTakenBy: currentUser?.name || ''
                });
                setFileList([]);
                setModalVisible(true);
              }}
            >
              Record First Statement
            </Button>
          )}
        </Empty>
      )}

      {/* Add/Edit Statement Modal */}
      <Modal
        title={editingStatement ? 'Edit Witness Statement' : 'Record Witness Statement'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingStatement(null);
          setFileList([]);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveStatement}
          initialValues={{
            witnessType: 'eyewitness',
            statementTakenBy: currentUser?.name || 'investigator'
          }}
        >
          <Divider orientation="left">Witness Information</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="witnessName"
                label="Witness Name"
                rules={[{ required: true, message: 'Name is required' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="witnessType"
                label="Witness Type"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="eyewitness">Eyewitness</Option>
                  <Option value="first_responder">First Responder</Option>
                  <Option value="supervisor">Supervisor</Option>
                  <Option value="coworker">Coworker</Option>
                  <Option value="expert">Expert Witness</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="contactNumber" label="Contact Number">
                <Input prefix={<PhoneOutlined />} placeholder="Phone" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="email" label="Email">
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="department" label="Department">
                <Input placeholder="Department" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Statement Details</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateOfStatement"
                label="Date of Statement"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="timeOfStatement" label="Time of Statement">
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="statementText"
            label="Statement"
            rules={[{ required: true, message: 'Statement is required' }]}
            extra="Record the witness's account in their own words"
          >
            <TextArea 
              rows={6} 
              placeholder="What did the witness see, hear, or experience?"
              maxLength={10000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="witnessLocation"
            label="Witness Location at Time of Incident"
          >
            <Input 
              prefix={<EnvironmentOutlined />} 
              placeholder="Where was the witness when the incident occurred?"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="statementTakenBy" label="Statement Taken By">
                <Input placeholder="Investigator name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="witnessSignature"
                label="Witness Acknowledgment"
                valuePropName="checked"
              >
                <Checkbox>
                  Witness confirms statement is accurate
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="additionalNotes" label="Additional Notes">
            <TextArea rows={2} placeholder="Any additional observations..." />
          </Form.Item>

          <Divider orientation="left">Attachments</Divider>

          <Form.Item>
            <Dragger
              multiple
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to attach</p>
              <p className="ant-upload-hint">
                Attach any supporting documents, photos, or sketches
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={saving}
              >
                {editingStatement ? 'Update Statement' : 'Save Statement'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingStatement(null);
                setFileList([]);
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Statement Modal */}
      <Modal
        title="Witness Statement Details"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedStatement(null);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button key="print" icon={<FileTextOutlined />} onClick={() => window.print()}>
            Print
          </Button>
        ]}
        width={700}
      >
        {selectedStatement && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Witness Name" span={2}>
                <Text strong>
                  {selectedStatement.witness_name || selectedStatement.witnessName}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color="blue">
                  {selectedStatement.witness_type || selectedStatement.witnessType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedStatement.witness_department || selectedStatement.department || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                {selectedStatement.witness_phone || selectedStatement.contactNumber || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedStatement.witness_email || selectedStatement.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Date" span={2}>
                {dayjs(selectedStatement.date_of_statement || selectedStatement.dateOfStatement)
                  .format('MMMM DD, YYYY')}
                {(selectedStatement.time_of_statement || selectedStatement.timeOfStatement) && 
                  ` at ${selectedStatement.time_of_statement || selectedStatement.timeOfStatement}`}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Statement</Divider>
            <Paragraph style={{ 
              background: '#f5f5f5', 
              padding: 16, 
              borderRadius: 8,
              whiteSpace: 'pre-wrap'
            }}>
              {selectedStatement.statement_text || selectedStatement.statementText}
            </Paragraph>

            {(selectedStatement.witness_location || selectedStatement.witnessLocation) && (
              <>
                <Divider orientation="left">Witness Location</Divider>
                <Text>
                  {selectedStatement.witness_location || selectedStatement.witnessLocation}
                </Text>
              </>
            )}

            {selectedStatement.attachments?.length > 0 && (
              <>
                <Divider orientation="left">Attachments</Divider>
                <List
                  size="small"
                  dataSource={selectedStatement.attachments}
                  renderItem={(file) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          size="small" 
                          icon={<EyeOutlined />}
                          onClick={() => file.url && window.open(file.url, '_blank')}
                          key="view"
                        >
                          View
                        </Button>
                      ]}
                    >
                      <Space>
                        <PaperClipOutlined />
                        {file.name}
                      </Space>
                    </List.Item>
                  )}
                />
              </>
            )}

            {(selectedStatement.witness_acknowledged || selectedStatement.witnessSignature) && (
              <Alert
                message="Witness Acknowledgment"
                description="Witness has confirmed this statement is accurate."
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default WitnessStatementForm;