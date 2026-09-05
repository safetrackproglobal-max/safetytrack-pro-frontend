// src/pages/ApprovalActions.js
import React, { useState } from 'react';
import { Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MessageOutlined,
  MailOutlined
} from '@ant-design/icons';
import AdminService from '../services/safetyproservice'; // Import the service

const { TextArea } = Input;

const ApprovalActions = ({ user, onActionComplete }) => {
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleApprove = async (values) => {
    setLoading(true);
    try {
      // Use the AdminService method instead of direct api.post
      const response = await AdminService.approveUser(user.id, {
        notes: values.notes,
        admin_role: values.admin_role
      });

      if (response.success) {
        message.success(`Approved ${user.name}`);
        
        // Send approval notification
        await AdminService.sendApprovalNotification(user.id);
        
        setApproveModal(false);
        form.resetFields();
        onActionComplete();
      } else {
        message.error('Failed to approve user');
      }
    } catch (error) {
      console.error('Approval error:', error);
      message.error('Failed to approve user');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (values) => {
    setLoading(true);
    try {
      // Use the AdminService method instead of direct api.post
      const response = await AdminService.rejectUser(user.id, {
        reason: values.reason
      });

      if (response.success) {
        message.info(`Rejected ${user.name}`);
        
        // Send rejection notification
        await AdminService.sendRejectionNotification(user.id, values.reason);
        
        setRejectModal(false);
        form.resetFields();
        onActionComplete();
      } else {
        message.error('Failed to reject user');
      }
    } catch (error) {
      console.error('Rejection error:', error);
      message.error('Failed to reject user');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    Modal.info({
      title: 'Contact User',
      content: (
        <div>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phone || 'Not provided'}</p>
          <Button
            type="primary"
            icon={<MailOutlined />}
            onClick={() => window.open(`mailto:${user.email}`, '_blank')}
          >
            Send Email
          </Button>
        </div>
      )
    });
  };

  return (
    <>
      <Space>
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => setApproveModal(true)}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
        >
          Approve
        </Button>
        
        <Popconfirm
          title="Are you sure you want to reject this user?"
          onConfirm={() => setRejectModal(true)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
          >
            Reject
          </Button>
        </Popconfirm>
        
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => window.open(`/admin/users/${user.id}`, '_blank')}
        >
          View
        </Button>
        
        <Button
          size="small"
          icon={<MessageOutlined />}
          onClick={sendMessage}
        >
          Contact
        </Button>
      </Space>

      {/* Approve Modal */}
      <Modal
        title={`Approve ${user.name}`}
        open={approveModal}
        onCancel={() => setApproveModal(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleApprove}>
          {user.subscription_plan === 'custom' && (
            <Form.Item
              name="admin_role"
              label="Admin Role"
              initialValue="Enterprise Admin"
            >
              <Input placeholder="Enter admin role" />
            </Form.Item>
          )}
          
          <Form.Item
            name="notes"
            label="Notes (optional)"
          >
            <TextArea
              rows={3}
              placeholder="Add any notes or instructions for the user..."
            />
          </Form.Item>
          
          <div style={{ background: '#f6ffed', padding: 12, borderRadius: 4 }}>
            <strong>User will receive:</strong>
            <ul style={{ marginBottom: 0 }}>
              <li>Approval confirmation email</li>
              <li>Dashboard access instructions</li>
              <li>Support contact information</li>
            </ul>
          </div>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={`Reject ${user.name}`}
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="reason"
            label="Reason for rejection"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <TextArea
              rows={4}
              placeholder="Explain why this application was rejected..."
            />
          </Form.Item>
          
          <div style={{ background: '#fff1f0', padding: 12, borderRadius: 4 }}>
            <strong>⚠️ Important:</strong>
            <ul style={{ marginBottom: 0 }}>
              <li>User will receive rejection email with this reason</li>
              <li>Action cannot be undone</li>
              <li>Consider contacting user first if clarification is needed</li>
            </ul>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ApprovalActions;