const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/Booking');
const User = require('../models/User');
const https = require('https');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

// Environment-based Paystack key selection (same as other controllers)
const getPaystackKeys = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const secretKey = isProduction
    ? process.env.PAYSTACK_SECRET_KEY 
    : process.env.PAYSTACK_SECRET_KEY_TEST || process.env.PAYSTACK_SECRET_KEY;
  const publicKey = isProduction
    ? process.env.PAYSTACK_PUBLIC_KEY 
    : process.env.PAYSTACK_PUBLIC_KEY_TEST || process.env.PAYSTACK_PUBLIC_KEY;

  logger.info(`Using Paystack ${isProduction ? 'LIVE' : 'TEST'} keys`, {
    service: 'payment-request',
    hasSecretKey: !!secretKey,
    hasPublicKey: !!publicKey
  });

  return { secretKey, publicKey };
};

// Helper function to make Paystack API requests
const makePaystackRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid JSON response from Paystack'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

// @desc    Provider initiates payment request after service completion
// @route   POST /api/bookings/:bookingId/request-payment
// @access  Private (Provider only)
const initiatePaymentRequest = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
  const providerId = req.user._id;

  // Get the booking
  const booking = await Booking.findById(bookingId)
    .populate('client', 'name email phone')
    .populate('provider', 'name email phone')
    .populate('service', 'title category');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Verify this provider owns the booking
  if (booking.provider._id.toString() !== providerId.toString()) {
    return next(new AppError('You can only request payment for your own bookings', 403));
  }

  // Check if service is completed
  if (booking.status !== 'completed') {
    return next(new AppError('You can only request payment for completed services', 400));
  }

  // Check if payment timing is pay-after
  if (booking.payment.timing !== 'pay-after') {
    return next(new AppError('This booking requires immediate payment', 400));
  }

  // Check if payment is already processed
  if (booking.payment.status === 'completed') {
    return next(new AppError('Payment has already been completed for this booking', 400));
  }

  try {
    const { secretKey } = getPaystackKeys();
    
    if (!secretKey) {
      return next(new AppError('Paystack configuration not available', 500));
    }

    // Determine currency for payment - use booking currency (KES works with test account)
    const paymentCurrency = booking.pricing.currency || 'KES';
    
    logger.info('Payment currency debug:', {
      service: 'payment-request',
      NODE_ENV: process.env.NODE_ENV,
      booking_currency: booking.pricing.currency,
      final_currency: paymentCurrency
    });

    // Create Paystack payment page
    const paystackData = {
      email: booking.client.email,
      amount: booking.pricing.totalAmount * 100, // Convert to minor units (cents/kobo)
      currency: paymentCurrency,
      reference: `SOL-${booking._id}-${Date.now()}`,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback`,
      metadata: {
        booking_id: booking._id,
        provider_id: booking.provider._id,
        client_id: booking.client._id,
        service_title: booking.service.title,
        provider_name: booking.provider.name
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money']
    };

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await makePaystackRequest(options, paystackData);

    logger.info('Paystack response received:', {
      service: 'payment-request',
      status: response.status,
      message: response.message,
      data: response.data ? 'Present' : 'Missing'
    });

    if (!response.status) {
      logger.error('Paystack API error:', {
        service: 'payment-request',
        message: response.message,
        full_response: response
      });
      throw new Error(response.message || 'Failed to create payment link');
    }

    // Update booking with payment request details
    booking.payment.paystack_reference = response.data.reference;
    booking.payment.payment_url = response.data.authorization_url;
    booking.payment.status = 'payment_requested';
    booking.payment.requested_at = new Date();
    
    // Add activity log if activities array exists
    if (booking.activities && Array.isArray(booking.activities)) {
      booking.activities.push({
        type: 'payment_requested',
        description: `Payment request sent to client by ${booking.provider.name}`,
        timestamp: new Date(),
        actor: providerId,
        data: {
          amount: booking.pricing.totalAmount,
          payment_url: response.data.authorization_url
        }
      });
    }

    await booking.save();

    // Send notifications
    try {
      await notificationService.sendPaymentRequestToClient(
        booking, 
        booking.client, 
        booking.provider, 
        response.data.authorization_url
      );
      await notificationService.sendPaymentRequestConfirmationToProvider(
        booking, 
        booking.provider, 
        booking.client
      );
    } catch (notificationError) {
      logger.error('Failed to send payment request notifications:', notificationError);
      // Continue execution - don't fail the payment request due to notification issues
    }

    logger.info(`Payment request initiated for booking ${booking._id}`, {
      service: 'payment-request',
      booking_id: booking._id,
      provider_id: providerId,
      client_email: booking.client.email,
      amount: booking.pricing.totalAmount
    });

    res.status(200).json({
      status: 'success',
      message: 'Payment request sent to client successfully',
      data: {
        booking_id: booking._id,
        payment_url: response.data.authorization_url,
        reference: response.data.reference,
        amount: booking.pricing.totalAmount,
        client_email: booking.client.email
      }
    });

  } catch (error) {
    logger.error('Error initiating payment request:', error);
    return next(new AppError('Failed to create payment request', 500));
  }
});

// @desc    Verify payment and complete booking transaction
// @route   POST /api/bookings/verify-payment
// @access  Public (Paystack webhook)
const verifyPaymentRequest = catchAsync(async (req, res, next) => {
  const { reference } = req.body;

  if (!reference) {
    return next(new AppError('Payment reference is required', 400));
  }

  try {
    const { secretKey } = getPaystackKeys();
    
    if (!secretKey) {
      return next(new AppError('Paystack configuration not available', 500));
    }

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    // Verify payment with Paystack
    const response = await makePaystackRequest(options);

    if (!response.status || response.data.status !== 'success') {
      return next(new AppError('Payment verification failed', 400));
    }

    // Find booking by reference
    const booking = await Booking.findOne({ 
      'payment.paystack_reference': reference 
    })
    .populate('client', 'name email')
    .populate('provider', 'name email bankDetails');

    if (!booking) {
      return next(new AppError('Booking not found for this payment', 404));
    }

    // Update payment status
    booking.payment.status = 'completed';
    booking.payment.completed_at = new Date();
    booking.payment.paystack_data = response.data;
    
    // Add activity log
    booking.activities.push({
      type: 'payment_completed',
      description: `Payment completed successfully by ${booking.client.name}`,
      timestamp: new Date(),
      actor: booking.client._id,
      data: {
        amount: response.data.amount / 100,
        reference: reference,
        gateway_response: response.data.gateway_response
      }
    });

    await booking.save();

    // Send payment completed notifications
    try {
      await notificationService.sendPaymentCompletedNotifications(
        booking, 
        booking.client, 
        booking.provider, 
        response.data
      );
    } catch (notificationError) {
      logger.error('Failed to send payment completed notifications:', notificationError);
      // Continue execution - don't fail the verification due to notification issues
    }

    // Trigger provider payout status update
    try {
      const PayoutService = require('../services/payoutService');
      const payoutService = new PayoutService();
      await payoutService.onPaymentCompleted(booking._id);
      logger.info(`Payout status updated for completed payment: ${booking._id}`);
    } catch (payoutError) {
      logger.error('Failed to update payout status:', payoutError);
      // Continue execution - don't fail verification due to payout update issues
    }

    logger.info(`Payment completed for booking ${booking._id}`, {
      service: 'payment-verification',
      booking_id: booking._id,
      amount: response.data.amount / 100,
      reference: reference
    });

    res.status(200).json({
      status: 'success',
      message: 'Payment verified and booking completed',
      data: {
        booking_id: booking._id,
        payment_status: 'completed',
        amount: response.data.amount / 100
      }
    });

  } catch (error) {
    logger.error('Error verifying payment:', error);
    return next(new AppError('Payment verification failed', 500));
  }
});

// @desc    Get payment request status for a booking
// @route   GET /api/bookings/:bookingId/payment-status
// @access  Private (Provider or Client)
const getPaymentRequestStatus = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId)
    .populate('client', 'name email')
    .populate('provider', 'name email');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Check if user is either the client or provider
  const isClient = booking.client._id.toString() === userId.toString();
  const isProvider = booking.provider._id.toString() === userId.toString();

  if (!isClient && !isProvider) {
    return next(new AppError('Access denied', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking_id: booking._id,
      payment_status: booking.payment.status,
      payment_timing: booking.payment.timing,
      payment_url: booking.payment.payment_url,
      amount: booking.pricing.totalAmount,
      requested_at: booking.payment.requested_at,
      completed_at: booking.payment.completed_at
    }
  });
});

module.exports = {
  initiatePaymentRequest,
  verifyPaymentRequest,
  getPaymentRequestStatus
};