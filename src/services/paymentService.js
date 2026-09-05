// src/services/paymentService.js
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './api.js';

class PaymentService {
  
  // Get pricing data for a specific country
  static async getPricing(country = 'default') {
    try {
      // Remove /api prefix - was '/api/pricing/country/' + country
      const response = await apiGet('/pricing/country/' + country);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing:', error);
      return this.getStaticPricing(country);
    }
  }

  // Get all pricing data
  static async getAllPricing() {
    try {
      // Remove /api prefix - was '/api/pricing'
      const response = await apiGet('/pricing');
      return response.data;
    } catch (error) {
      console.error('Error fetching all pricing:', error);
      return this.getAllStaticPricing();
    }
  }

  // Get available payment methods for a country
  static async getPaymentMethods(country) {
    try {
      // Remove /api prefix - was '/api/payment/methods/${country}'
      const response = await apiGet(`/payment/methods/${country}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return this.getDefaultPaymentMethods(country);
    }
  }

  // Initialize Paystack payment
  static async initializePaystackPayment(paymentData) {
    try {
      console.log('🔵 PaymentService: Calling apiPost...');
      
      const result = await apiPost('/payment/paystack/initialize', paymentData);
      
      console.log('🔵 PaymentService: apiPost returned:', result);
      console.log('🔵 PaymentService: Result type:', typeof result);
      console.log('🔵 PaymentService: Result keys:', result ? Object.keys(result) : 'null');
      console.log('🔵 PaymentService: authorization_url:', result?.authorization_url);
      
      // ✅ Explicitly return the result
      return result;
      
    } catch (error) {
      console.error('❌ PaymentService: Error:', error);
      throw error;
    }
  }

  // Initialize PayPal payment
  static async initializePayPalPayment(paymentData) {
    try {
      const response = await apiPost('/payment/paypal/create', paymentData);
      
      // ✅ Log the response to see what's coming back
      console.log('🔍 PayPal API Response:', response);
      
      // ✅ Handle different response structures
      if (response && response.data) {
        return response.data;
      }
      if (response && response.approval_url) {
        return response;
      }
      if (response && response.data && response.data.approval_url) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('Error initializing PayPal payment:', error);
      throw error;
    }
  }

  // Verify PayPal payment
  static async verifyPayPalPayment(paymentId) {
    try {
      const response = await apiGet(`/payment/paypal/verify/${paymentId}`);
      
      if (response && response.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error('Error verifying PayPal payment:', error);
      throw error;
    }
  }

  // Verify Paystack payment
  static async verifyPaystackPayment(reference) {
    try {
      // Remove /api prefix - was '/api/payment/paystack/verify/${reference}'
      const response = await apiGet(`/payment/paystack/verify/${reference}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying Paystack payment:', error);
      throw error;
    }
  }

  // Create payment record
  static async createPaymentRecord(paymentData) {
    try {
      // Remove /api prefix - was '/api/payments'
      const response = await apiPost('/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw error;
    }
  }

  // Get payment status
  static async getPaymentStatus(paymentId) {
    try {
      // Remove /api prefix - was '/api/payments/${paymentId}/status'
      const response = await apiGet(`/payments/${paymentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Get payment by reference
  static async getPaymentByReference(reference) {
    try {
      // Remove /api prefix - was '/api/payments/reference/${reference}'
      const response = await apiGet(`/payments/reference/${reference}`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment by reference:', error);
      throw error;
    }
  }

  // Update payment status
  static async updatePaymentStatus(paymentId, status, details = {}) {
    try {
      // Remove /api prefix - was '/api/payments/${paymentId}/status'
      const response = await apiPut(`/payments/${paymentId}/status`, {
        status,
        ...details
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Get user payment history
  static async getUserPaymentHistory(userId) {
    try {
      // Remove /api prefix - was '/api/users/${userId}/payments'
      const response = await apiGet(`/users/${userId}/payments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user payment history:', error);
      throw error;
    }
  }

  // Create subscription
  static async createSubscription(subscriptionData) {
    try {
      // Remove /api prefix - was '/api/subscriptions'
      const response = await apiPost('/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Get user subscription
  static async getUserSubscription(userId) {
    try {
      // Remove /api prefix - was '/api/users/${userId}/subscription'
      const response = await apiGet(`/users/${userId}/subscription`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw error;
    }
  }

  // Update subscription
  static async updateSubscription(subscriptionId, updateData) {
    try {
      // Remove /api prefix - was '/api/subscriptions/${subscriptionId}'
      const response = await apiPut(`/subscriptions/${subscriptionId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId) {
    try {
      // Remove /api prefix - was '/api/subscriptions/${subscriptionId}'
      const response = await apiDelete(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Upload payment receipt
  static async uploadReceipt(paymentId, file) {
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      // Remove /api prefix - was '/api/payments/${paymentId}/receipt'
      const response = await apiUpload(`/payments/${paymentId}/receipt`, formData);
      return response.data;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      throw error;
    }
  }

  // Send payment notification
  static async sendPaymentNotification(notificationData) {
    try {
      // Remove /api prefix - was '/api/payments/notify'
      const response = await apiPost('/payments/notify', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error sending payment notification:', error);
      throw error;
    }
  }

  // Get manual payment details
  static async getManualPaymentDetails(country, method) {
    try {
      // Remove /api prefix - was '/api/payment/manual/${country}/${method}'
      const response = await apiGet(`/payment/manual/${country}/${method}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching manual payment details:', error);
      return this.getStaticManualDetails(country, method);
    }
  }

  // ============ STATIC FALLBACK DATA ============

  static getStaticPricing(country) {
    const staticPricing = {
      "Ghana": {
        "free": {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "GHS"},
        "basic": {
          "1_month": 100, "6_month": 500, "1_year": 900, "currency": "GHS",
          "payment_method": "Paystack (MTN MoMo & Cards)"
        },
        "pro": {
          "1_month": 200, "6_month": 1000, "1_year": 1800, "currency": "GHS",
          "payment_method": "Paystack (MTN MoMo & Cards)"
        },
        "enterprise": {
          "1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "GHS",
          "payment_method": "Bank Transfer / Invoice"
        }
      },
      "Qatar": {
        "free": {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "QAR"},
        "basic": {
          "1_month": 100, "6_month": 500, "1_year": 900, "currency": "QAR",
          "payment_method": "QNB / PayPal / Credit Card"
        },
        "pro": {
          "1_month": 300, "6_month": 1500, "1_year": 2700, "currency": "QAR",
          "payment_method": "QNB / PayPal / Credit Card"
        },
        "enterprise": {
          "1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "QAR",
          "payment_method": "QNB Bank Transfer / Invoice"
        }
      },
      "India": {
        "free": {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "INR"},
        "basic": {
          "1_month": 1500, "6_month": 7500, "1_year": 13500, "currency": "INR",
          "payment_method": "PayPal / Razorpay / UPI"
        },
        "pro": {
          "1_month": 3500, "6_month": 17500, "1_year": 31500, "currency": "INR",
          "payment_method": "PayPal / Razorpay / UPI"
        },
        "enterprise": {
          "1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "INR",
          "payment_method": "Bank Transfer / Invoice"
        }
      },
      "United States": {
        "free": {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "USD"},
        "basic": {
          "1_month": 29, "6_month": 150, "1_year": 270, "currency": "USD",
          "payment_method": "PayPal / Paystack (Cards)"
        },
        "pro": {
          "1_month": 79, "6_month": 420, "1_year": 756, "currency": "USD",
          "payment_method": "PayPal / Paystack (Cards)"
        },
        "enterprise": {
          "1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "USD",
          "payment_method": "Bank Transfer / Invoice"
        }
      },
      "default": {
        "free": {"1_month": 0, "6_month": 0, "1_year": 0, "currency": "USD"},
        "basic": {
          "1_month": 20, "6_month": 100, "1_year": 180, "currency": "USD",
          "payment_method": "PayPal / Paystack (Cards)"
        },
        "pro": {
          "1_month": 50, "6_month": 250, "1_year": 450, "currency": "USD",
          "payment_method": "PayPal / Paystack (Cards)"
        },
        "enterprise": {
          "1_month": "Custom", "6_month": "Custom", "1_year": "Custom", "currency": "USD",
          "payment_method": "Bank Transfer / Invoice"
        }
      }
    };
    return staticPricing[country] || staticPricing.default;
  }

  static getAllStaticPricing() {
    return {
      "Ghana": this.getStaticPricing("Ghana"),
      "Qatar": this.getStaticPricing("Qatar"),
      "India": this.getStaticPricing("India"),
      "United States": this.getStaticPricing("United States"),
      "default": this.getStaticPricing("default")
    };
  }

  static getDefaultPaymentMethods(country) {
    const methods = {
      "Ghana": [
        { 
          id: 'paystack', 
          name: 'Paystack Payment', 
          provider: 'Paystack', 
          type: 'online', 
          description: 'Pay with MTN Mobile Money, Vodafone Cash, or Credit/Debit Card',
          icon: 'paystack'
        },
        { 
          id: 'bank_transfer', 
          name: 'Bank Transfer', 
          provider: 'Ecobank Ghana', 
          type: 'bank_transfer',
          description: 'Manual bank transfer for enterprise plans',
          icon: 'bank'
        }
      ],
      "Qatar": [
        { 
          id: 'qnb', 
          name: 'QNB Bank Transfer', 
          provider: 'Qatar National Bank', 
          type: 'bank_transfer',
          description: 'Direct bank transfer to QNB account',
          icon: 'bank'
        },
        { 
          id: 'paypal', 
          name: 'PayPal', 
          provider: 'PayPal', 
          type: 'online',
          description: 'Secure PayPal payment',
          icon: 'paypal'
        },
        { 
          id: 'paystack', 
          name: 'Credit Card', 
          provider: 'Paystack', 
          type: 'online',
          description: 'Pay with Credit/Debit Card',
          icon: 'credit-card'
        }
      ],
      "India": [
        { 
          id: 'paypal', 
          name: 'PayPal', 
          provider: 'PayPal', 
          type: 'online',
          description: 'Secure PayPal payment in INR',
          icon: 'paypal'
        },
        { 
          id: 'razorpay', 
          name: 'Razorpay', 
          provider: 'Razorpay', 
          type: 'online',
          description: 'UPI, Cards, Net Banking',
          icon: 'online'
        },
        { 
          id: 'bank_transfer', 
          name: 'Bank Transfer', 
          provider: 'Indian Banks', 
          type: 'bank_transfer',
          description: 'NEFT/RTGS/IMPS transfer',
          icon: 'bank'
        }
      ],
      "United States": [
        { 
          id: 'paypal', 
          name: 'PayPal', 
          provider: 'PayPal', 
          type: 'online',
          description: 'Secure PayPal payment',
          icon: 'paypal'
        },
        { 
          id: 'paystack', 
          name: 'Credit Card', 
          provider: 'Paystack', 
          type: 'online',
          description: 'Pay with Credit/Debit Card',
          icon: 'credit-card'
        },
        { 
          id: 'bank_transfer', 
          name: 'Bank Transfer', 
          provider: 'US Banks', 
          type: 'bank_transfer',
          description: 'ACH/Wire transfer',
          icon: 'bank'
        }
      ],
      "default": [
        { 
          id: 'paypal', 
          name: 'PayPal', 
          provider: 'PayPal', 
          type: 'online',
          description: 'Secure international PayPal payment',
          icon: 'paypal'
        },
        { 
          id: 'paystack', 
          name: 'Credit Card', 
          provider: 'Paystack', 
          type: 'online',
          description: 'International Credit/Debit Card',
          icon: 'credit-card'
        },
        { 
          id: 'bank_transfer', 
          name: 'Bank Transfer', 
          provider: 'International', 
          type: 'bank_transfer',
          description: 'SWIFT wire transfer',
          icon: 'bank'
        }
      ]
    };
    return methods[country] || methods.default;
  }

  static getStaticManualDetails(country, method) {
    const details = {
      "Ghana": {
        "bank_transfer": {
          "account_name": "SafetyTrack Pro Ltd",
          "account_number": "1234567890",
          "bank_name": "Ecobank Ghana",
          "branch": "Accra Main Branch",
          "swift_code": "ECO CGH ACC",
          "instructions": "Make transfer to account above. Use your email as reference. Send receipt to payments@safetytrack.com"
        }
      },
      "Qatar": {
        "qnb": {
          "account_name": "SafetyTrack Qatar LLC",
          "account_number": "QA12 3456 7890 1234 5678 90",
          "bank_name": "Qatar National Bank",
          "branch": "Doha Main Branch",
          "swift_code": "QNBAQAQA",
          "iban": "QA12 3456 7890 1234 5678 90",
          "instructions": "Transfer to QNB account above. Include email in reference. Email receipt to payments@safetytrack.com"
        },
        "paypal": {
          "paypal_email": "payments@safetytrack.com",
          "paypal_me": "https://paypal.me/safetytrack",
          "instructions": "Send payment via PayPal to email above. Use invoice number as reference."
        }
      },
      "India": {
        "bank_transfer": {
          "account_name": "SafetyTrack India Pvt Ltd",
          "account_number": "9876543210",
          "bank_name": "HDFC Bank",
          "branch": "Mumbai Main Branch",
          "ifsc_code": "HDFC0000123",
          "instructions": "NEFT/RTGS/IMPS transfer. Use email as reference. Email receipt to payments@safetytrack.com"
        },
        "paypal": {
          "paypal_email": "payments@safetytrack.com",
          "paypal_me": "https://paypal.me/safetytrack",
          "instructions": "Send payment via PayPal to email above. For INR payments, PayPal will handle conversion."
        }
      },
      "United States": {
        "bank_transfer": {
          "account_name": "SafetyTrack Inc",
          "account_number": "123456789012",
          "bank_name": "Bank of America",
          "routing_number": "021000322",
          "swift_code": "BOFAUS3N",
          "instructions": "ACH/Wire transfer. Include email in memo. Email receipt to payments@safetytrack.com"
        },
        "paypal": {
          "paypal_email": "payments@safetytrack.com",
          "paypal_me": "https://paypal.me/safetytrack",
          "instructions": "Send payment via PayPal to email above."
        }
      },
      "default": {
        "bank_transfer": {
          "instructions": "Contact payments@safetytrack.com for international bank transfer details."
        },
        "paypal": {
          "paypal_email": "payments@safetytrack.com",
          "paypal_me": "https://paypal.me/safetytrack",
          "instructions": "Send payment via PayPal to email above."
        }
      }
    };
    
    if (details[country] && details[country][method]) {
      return details[country][method];
    }
    
    return details.default[method] || {
      instructions: "Contact payments@safetytrack.com for payment details."
    };
  }

  static getCurrencySymbol(currency) {
    const symbols = {
      'GHS': 'GH₵',
      'QAR': 'QR',
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[currency] || currency;
  }

  static formatCurrency(amount, currency) {
    if (amount === "Custom" || amount === null || amount === undefined) return "Custom Pricing";
    if (typeof amount !== 'number') amount = parseFloat(amount);
    
    const symbol = PaymentService.getCurrencySymbol(currency);
    
    // Format based on currency
    if (currency === 'INR') {
      // Indian numbering system
      if (amount >= 10000000) {
        return `${symbol}${(amount / 10000000).toFixed(2)} Cr`;
      } else if (amount >= 100000) {
        return `${symbol}${(amount / 100000).toFixed(2)} L`;
      } else {
        return `${symbol}${amount.toLocaleString('en-IN')}`;
      }
    } else {
      return `${symbol}${amount.toLocaleString()}`;
    }
  }

  static getPlanLimits(plan) {
    const staticLimits = {
      "free": {
        "uploads_per_month": 5,
        "api_calls_per_month": 50,
        "team_members": 1,
        "monitoring_stations": 1,
        "ai_requests_per_month": 10,
        "camera_feeds": 1,
        "video_analysis_minutes": 10
      },
      "basic": {
        "uploads_per_month": 100,
        "api_calls_per_month": 1000,
        "team_members": 10,
        "monitoring_stations": 5,
        "ai_requests_per_month": 100,
        "camera_feeds": 3,
        "video_analysis_minutes": 120
      },
      "pro": {
        "uploads_per_month": 500,
        "api_calls_per_month": 5000,
        "team_members": 50,
        "monitoring_stations": 20,
        "ai_requests_per_month": 500,
        "camera_feeds": 10,
        "video_analysis_minutes": 600
      },
      "enterprise": {
        "uploads_per_month": "Unlimited",
        "api_calls_per_month": "Unlimited",
        "team_members": "Unlimited",
        "monitoring_stations": "Unlimited",
        "ai_requests_per_month": "Unlimited",
        "camera_feeds": "Unlimited",
        "video_analysis_minutes": "Unlimited"
      }
    };
    return staticLimits[plan] || staticLimits.free;
  }

  static generatePaymentReference() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `PAY-${timestamp}-${random}`.toUpperCase();
  }

  static getMethodIcon(method) {
    const icons = {
      'paystack': 'credit-card',
      'paypal': 'paypal',
      'qnb': 'bank',
      'bank_transfer': 'bank',
      'razorpay': 'online-payment',
      'credit_card': 'credit-card'
    };
    return icons[method] || 'bank';
  }
}

export default PaymentService;