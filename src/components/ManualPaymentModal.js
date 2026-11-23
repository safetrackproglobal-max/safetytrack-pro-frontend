// src/components/ManualPaymentModal.js
// Bank transfer / Mobile Money instructions + "I have sent payment" confirmation.
// Records the payment via POST /api/payment/manual/confirm (requires a signed-in or
// just-verified user token, which the shared `api` instance attaches automatically).
import React, { useState } from 'react';
import { Modal, Alert, Card, Typography, Button, Input, message } from 'antd';
import { BankOutlined, PhoneOutlined } from '@ant-design/icons';
import api from '../services/api';
import { MANUAL_PAYMENT_DETAILS, formatPrice, durationLabel } from '../constants/accountFlow';

const { Text } = Typography;

const makeReference = () =>
  `MANUAL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

function ManualPaymentModal({ open, method, plan, planLabel, duration, amount, currency, email, onClose, onRecorded }) {
  const [reference] = useState(makeReference);
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const details = MANUAL_PAYMENT_DETAILS[method];

  if (!details) return null;

  const confirm = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(
        '/payment/manual/confirm',
        {
          payment_reference: reference,
          transaction_id: transactionId.trim() || reference,
          payment_method: method,
          amount,
          currency,
          plan,
          duration, // 1_month / 6_month / 1_year — sets how long the plan runs after verification
          user_notes: `Billing: ${durationLabel(duration)}`,
        },
        { validateStatus: () => true }
      );

      if (res.status === 200 && res.data?.success) {
        const record = {
          payment_reference: res.data.payment_reference || reference,
          payment_id: res.data.payment_id,
          status: res.data.status || 'pending_verification',
          amount,
          currency,
          plan,
          payment_method: method,
          expires_at: res.data.expires_at,
        };
        sessionStorage.setItem('pendingPayment', JSON.stringify(record));
        message.success('Payment recorded. Our team will verify it within 24–48 hours.');
        onRecorded?.(record);
      } else if (res.status === 401) {
        message.error('Your session has expired. Please sign in again, then confirm your payment.');
      } else {
        message.error(res.data?.error || 'Could not record your payment. Please try again.');
      }
    } catch (e) {
      message.error('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={submitting ? undefined : onClose}
      footer={null}
      width={600}
      title={
        <span>
          {method === 'bank_transfer' ? <BankOutlined /> : <PhoneOutlined />} {details.label} instructions
        </span>
      }
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={`${planLabel} plan — ${durationLabel(duration)}`}
        description={<span>Amount to pay: <Text strong>{formatPrice(amount, currency)}</Text></span>}
      />

      <Card size="small" style={{ marginBottom: 12 }}>
        {details.rows.map(([k, v]) => (
          <div key={k}>
            <Text strong>{k}:</Text> <Text copyable={k.toLowerCase().includes('number')}>{v}</Text>
          </div>
        ))}
        <div>
          <Text strong>Payment reference:</Text> <Text code copyable>{reference}</Text>
        </div>
      </Card>

      <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <Text strong>How to pay</Text>
        <ol style={{ margin: '8px 0', paddingLeft: 20 }}>
          <li>Send exactly <Text strong>{formatPrice(amount, currency)}</Text> to the account above.</li>
          <li>Use the payment reference <Text code>{reference}</Text> (or your email <Text code>{email}</Text>) as the description.</li>
          <li>Keep your receipt and enter its transaction ID below (optional but speeds up verification).</li>
          <li>Click <Text strong>I have sent the payment</Text>. Your plan activates once our team confirms it (24–48h).</li>
        </ol>
      </div>

      <Input
        placeholder="Transaction ID from your receipt (optional)"
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
        maxLength={100}
        style={{ marginBottom: 16 }}
      />

      <Button type="primary" size="large" block loading={submitting} onClick={confirm}>
        I have sent the payment
      </Button>
    </Modal>
  );
}

export default ManualPaymentModal;
