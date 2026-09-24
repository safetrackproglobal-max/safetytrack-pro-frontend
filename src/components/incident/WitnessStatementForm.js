// src/components/incidents/WitnessStatementForm.js
import React, { useState } from 'react';
import {
  Card, Form, Input, Button, Space, message, Row, Col, Select,
  DatePicker, TimePicker, Tag, Divider, Alert, List, Avatar,
  Modal, Descriptions, Tooltip, Badge, Empty, Upload, Radio,
  Checkbox, InputNumber, Steps, Result, Typography
} from 'antd';
import {
  UserOutlined, PlusOutlined, DeleteOutlined, EditOutlined,
  FileTextOutlined, PaperClipOutlined, CheckCircleOutlined,
  ClockCircleOutlined, EnvironmentOutlined, PhoneOutlined,
  MailOutlined, SafetyCertificateOutlined, SignatureOutlined,
  FileImageOutlined, InboxOutlined, EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

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
  const [statements, setStatements] = useState([]);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStatement, setEditingStatement] = useState(null);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Load statements from incident
  React.useEffect(() => {
    if (incident) {
      const saved = incident.custom_data?.witness_statements || [];
      setStatements(saved);
    }
  }, [incident]);

  // Handle save statement
  const handleSaveStatement = (values) => {
    const statement = {
      id: editingStatement?.id || Date.now().toString(),
      ...values,
      dateOfStatement: values.dateOfStatement?.toISOString(),
      timeOfStatement: values.timeOfStatement?.format('HH:mm'),
      createdAt: editingStatement?.createdAt || new Date().toISOString(),
      attachments: fileList.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.url || URL.createObjectURL(f)
      }))
    };

    if (editingStatement) {
      setStatements(prev => prev.map(s => 
        s.id === editingStatement.id ? statement : s
      ));
      message.success('Statement updated');
    } else {
      setStatements(prev => [...prev, statement]);
      message.success('Statement recorded');
    }

    setModalVisible(false);
    form.resetFields();
    setEditingStatement(null);
    setFileList([]);
  };

  // Handle delete
  const handleDelete = (statementId) => {
    setStatements(prev => prev.filter(s => s.id !== statementId));
    message.success('Statement deleted');
  };

  // View statement details
  const handleViewStatement = (statement) => {
    setSelectedStatement(statement);
    setViewModalVisible(true);
  };

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
        !readOnly && (
          <Button 
            type="primary" 
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingStatement(null);
              form.resetFields();
              setFileList([]);
              setModalVisible(true);
            }}
          >
            Add Statement
          </Button>
        )
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

      {statements.length > 0 ? (
        <List
          dataSource={statements}
          renderItem={(statement) => (
            <List.Item
              actions={[
                <Tooltip title="View">
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<EyeOutlined />}
                    onClick={() => handleViewStatement(statement)}
                  />
                </Tooltip>,
                ...(!readOnly ? [
                  <Tooltip title="Edit">
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingStatement(statement);
                        form.setFieldsValue({
                          ...statement,
                          dateOfStatement: statement.dateOfStatement ? dayjs(statement.dateOfStatement) : null,
                          timeOfStatement: statement.timeOfStatement ? dayjs(statement.timeOfStatement, 'HH:mm') : null
                        });
                        setModalVisible(true);
                      }}
                    />
                  </Tooltip>,
                  <Tooltip title="Delete">
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
                    <Text strong>{statement.witnessName}</Text>
                    <Tag color="blue">{statement.witnessType}</Tag>
                    {statement.attachments?.length > 0 && (
                      <Tag icon={<PaperClipOutlined />}>
                        {statement.attachments.length} files
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
                      {statement.statementText}
                    </Paragraph>
                    <Space size="large">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined /> {dayjs(statement.createdAt).fromNow()}
                      </Text>
                      {statement.contactNumber && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <PhoneOutlined /> {statement.contactNumber}
                        </Text>
                      )}
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
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
            statementTakenBy: 'investigator'
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
              <Form.Item
                name="timeOfStatement"
                label="Time of Statement"
              >
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
              <Form.Item
                name="statementTakenBy"
                label="Statement Taken By"
              >
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
              <Button type="primary" htmlType="submit">
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
          <Button key="print" icon={<FileTextOutlined />}>
            Print
          </Button>
        ]}
        width={700}
      >
        {selectedStatement && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Witness Name" span={2}>
                <Text strong>{selectedStatement.witnessName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color="blue">{selectedStatement.witnessType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedStatement.department || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                {selectedStatement.contactNumber || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedStatement.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Date" span={2}>
                {selectedStatement.dateOfStatement 
                  ? dayjs(selectedStatement.dateOfStatement).format('MMMM DD, YYYY')
                  : 'N/A'}
                {selectedStatement.timeOfStatement && ` at ${selectedStatement.timeOfStatement}`}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Statement</Divider>
            <Paragraph style={{ 
              background: '#f5f5f5', 
              padding: 16, 
              borderRadius: 8,
              whiteSpace: 'pre-wrap'
            }}>
              {selectedStatement.statementText}
            </Paragraph>

            {selectedStatement.witnessLocation && (
              <>
                <Divider orientation="left">Witness Location</Divider>
                <Text>{selectedStatement.witnessLocation}</Text>
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
                        <Button type="link" size="small" icon={<EyeOutlined />}>
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

            {selectedStatement.witnessSignature && (
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