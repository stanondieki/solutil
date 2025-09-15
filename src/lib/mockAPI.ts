// Mock API for testing payment components
// This file provides mock responses for development/testing

// Mock M-Pesa STK Push response
export const mockStkPushResponse = {
  success: true,
  message: 'STK Push sent successfully',
  checkoutRequestID: 'ws_CO_DMZ_123456789_' + Date.now(),
  merchantRequestID: 'ws_merchant_' + Date.now()
};

// Mock payment status responses
export const mockPaymentStatuses = {
  pending: {
    success: true,
    status: 'pending',
    transactionId: null,
    amount: 2500,
    createdAt: new Date().toISOString()
  },
  completed: {
    success: true,
    status: 'completed',
    transactionId: 'PH12345678',
    amount: 2500,
    createdAt: new Date().toISOString()
  },
  failed: {
    success: true,
    status: 'failed',
    message: 'Payment was cancelled by user',
    transactionId: null,
    amount: 2500,
    createdAt: new Date().toISOString()
  }
};

// Mock booking completion response
export const mockBookingCompletion = {
  success: true,
  message: 'Booking completed successfully',
  data: {
    booking: {
      id: 'booking_123',
      status: 'completed',
      rating: 5,
      review: 'Excellent service!'
    },
    paymentReleased: true,
    providerAmount: 2250
  }
};

// Mock dispute response
export const mockDisputeResponse = {
  success: true,
  message: 'Dispute initiated successfully. Our support team will review and contact you within 24 hours.',
  disputeId: 'DISPUTE_' + Date.now()
};

// Simulate API delays
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockAPI = {
  // STK Push
  async initiateSTKPush(data: any) {
    await delay(2000); // Simulate network delay
    
    // Simulate occasional failures for testing
    if (data.phoneNumber.includes('999')) {
      throw new Error('Invalid phone number format');
    }
    
    return mockStkPushResponse;
  },

  // Payment status polling
  async checkPaymentStatus(checkoutRequestID: string) {
    await delay(1000);
    
    // Simulate status progression
    const statuses = ['pending', 'pending', 'completed']; // Most end in completion
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return mockPaymentStatuses[randomStatus as keyof typeof mockPaymentStatuses];
  },

  // Complete booking
  async completeBooking(bookingId: string, data: any) {
    await delay(1500);
    
    return mockBookingCompletion;
  },

  // Dispute booking
  async disputeBooking(bookingId: string, data: any) {
    await delay(1000);
    
    return mockDisputeResponse;
  }
};

// Override fetch for testing if in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const urlString = input.toString();
    
    // Intercept payment API calls for testing
    if (urlString.includes('/api/payments/mpesa/stk-push')) {
      console.log('🧪 Mock STK Push API called');
      const body = init?.body ? JSON.parse(init.body as string) : {};
      
      try {
        const response = await mockAPI.initiateSTKPush(body);
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          success: false,
          message: error.message
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    if (urlString.includes('/api/payments/mpesa/status/')) {
      console.log('🧪 Mock Payment Status API called');
      const response = await mockAPI.checkPaymentStatus('mock_checkout_id');
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (urlString.includes('/complete')) {
      console.log('🧪 Mock Booking Completion API called');
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const response = await mockAPI.completeBooking('mock_booking_id', body);
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (urlString.includes('/dispute')) {
      console.log('🧪 Mock Dispute API called');
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const response = await mockAPI.disputeBooking('mock_booking_id', body);
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For all other requests, use original fetch
    return originalFetch(input, init);
  };
  
  console.log('🧪 Mock API enabled for payment testing');
}
