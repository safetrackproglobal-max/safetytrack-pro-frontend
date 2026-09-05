import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Divider, Alert } from 'antd';
import { CreditCardOutlined, SafetyOutlined } from '@ant-design/icons';

const { Option } = Select;

function PaymentForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Handle payment logic here
      console.log('Payment details:', values);
      
      // Show success message or redirect
      alert('Payment processed successfully!');
    } catch (err) {
      setError('Payment failed. Please check your information and try again.');
    }
    
    setLoading(false);
  };

  return (
    <Card title="Payment Information" style={{ maxWidth: 500, margin: '0 auto' }}>
      {error && (
        <Alert
          message={error}
          type="error"
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          country: 'US',
          currency: 'USD'
        }}
      >
        <Form.Item
          label="Card Number"
          name="cardNumber"
          rules={[
            { required: true, message: 'Please enter your card number' },
            { pattern: /^[0-9]{16}$/, message: 'Please enter a valid 16-digit card number' }
          ]}
        >
          <Input 
            prefix={<CreditCardOutlined />}
            placeholder="1234 5678 9012 3456"
            maxLength={16}
          />
        </Form.Item>

        <Form.Item
          label="Card Holder Name"
          name="cardHolder"
          rules={[{ required: true, message: 'Please enter card holder name' }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>

        <Form.Item
          label="Expiration Date"
          style={{ marginBottom: 0 }}
        >
          <Form.Item
            name="expMonth"
            rules={[{ required: true, message: 'Month' }]}
            style={{ display: 'inline-block', width: '50%' }}
          >
            <Select placeholder="Month">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <Option key={month} value={month}>
                  {month.toString().padStart(2, '0')}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="expYear"
            rules={[{ required: true, message: 'Year' }]}
            style={{ display: 'inline-block', width: '50%' }}
          >
            <Select placeholder="Year">
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form.Item>

        <Form.Item
          label="CVV"
          name="cvv"
          rules={[
            { required: true, message: 'Please enter CVV' },
            { pattern: /^[0-9]{3,4}$/, message: 'Please enter a valid CVV' }
          ]}
        >
          <Input placeholder="123" maxLength={4} />
        </Form.Item>

        <Form.Item
          label="Country"
          name="country"
          rules={[{ required: true, message: 'Please select your country' }]}
        >
          <Select>
            <Option value="US">United States</Option>
            <Option value="UK">United Kingdom</Option>
            <Option value="CA">Canada</Option>
            <Option value="AU">Australia</Option>
            <Option value="QA">Qatar</Option>
          </Select>
        </Form.Item>

        <Divider />

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            icon={<SafetyOutlined />}
            size="large"
            block
          >
            Process Payment
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', color: '#666', fontSize: 12 }}>
          <SafetyOutlined /> Your payment information is encrypted and secure
        </div>
      </Form>
    </Card>
  );
}

export default PaymentForm;