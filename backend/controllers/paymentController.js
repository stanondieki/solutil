const https = require('https');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

class PaymentController {
  // Initialize Paystack payment
  initializePayment = catchAsync(async (req, res, next) => {
    const { bookingId, amount, email } = req.body;

    // Validate inputs
    if (!bookingId || !amount || !email) {
      return next(new AppError('Booking ID, amount, and email are required', 400));
    }

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('client', 'name email phone')
      .populate('provider', 'name email phone');

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Verify user owns this booking
    if (booking.client._id.toString() !== req.user.id) {
      return next(new AppError('Unauthorized access to booking', 403));
    }

    const params = JSON.stringify({
      email: email,
      amount: amount * 100, // Convert to kobo
      currency: 'NGN',
      reference: `${booking.bookingNumber}_${Date.now()}`,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        clientId: req.user.id,
        serviceCategory: booking.serviceCategory
      }
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(params)
      }
    };

    const reqPaystack = https.request(options, (resPaystack) => {
      let data = '';

      resPaystack.on('data', (chunk) => {
        data += chunk;
      });

      resPaystack.on('end', () => {
        const response = JSON.parse(data);
        
        if (response.status) {
          // Update booking with payment reference
          booking.payment.reference = response.data.reference;
          booking.payment.status = 'initiated';
          booking.save();

          logger.info(`Payment initialized for booking ${booking.bookingNumber}`, {
            reference: response.data.reference,
            amount: amount
          });

          res.status(200).json({
            status: 'success',
            data: response.data
          });
        } else {
          logger.error('Paystack initialization failed:', response);
          return next(new AppError('Payment initialization failed', 400));
        }
      });
    });

    reqPaystack.on('error', (error) => {
      logger.error('Paystack request error:', error);
      return next(new AppError('Payment service error', 500));
    });

    reqPaystack.write(params);
    reqPaystack.end();
  });

  // Verify Paystack payment
  verifyPayment = catchAsync(async (req, res, next) => {
    const { reference } = req.params;

    if (!reference) {
      return next(new AppError('Payment reference is required', 400));
    }

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    };

    const reqPaystack = https.request(options, (resPaystack) => {
      let data = '';

      resPaystack.on('data', (chunk) => {
        data += chunk;
      });

      resPaystack.on('end', async () => {
        try {
          const response = JSON.parse(data);
          
          if (response.status && response.data.status === 'success') {
            // Find booking by reference
            const booking = await Booking.findOne({
              'payment.reference': reference
            }).populate([
              { path: 'client', select: 'name email phone' },
              { path: 'provider', select: 'name email phone' }
            ]);

            if (!booking) {
              return next(new AppError('Booking not found for this payment', 404));
            }

            // Update booking payment status
            booking.payment.status = 'completed';
            booking.payment.paidAt = new Date();
            booking.payment.amount = response.data.amount / 100; // Convert from kobo
            booking.payment.gateway = 'paystack';
            booking.payment.gatewayResponse = response.data;

            // Update booking status to confirmed if payment was successful
            if (booking.status === 'pending') {
              booking.status = 'confirmed';
            }

            await booking.save();

            // Send payment confirmation notifications
            try {
              await notificationService.sendBookingStatusUpdate(
                booking, 
                booking.client, 
                booking.provider, 
                'confirmed'
              );
            } catch (notificationError) {
              logger.error('Failed to send payment confirmation notification:', notificationError);
            }

            logger.info(`Payment verified successfully for booking ${booking.bookingNumber}`, {
              reference: reference,
              amount: response.data.amount / 100
            });

            res.status(200).json({
              status: 'success',
              message: 'Payment verified successfully',
              data: {
                booking: {
                  id: booking._id,
                  bookingNumber: booking.bookingNumber,
                  status: booking.status,
                  payment: booking.payment
                },
                transaction: response.data
              }
            });
          } else {
            logger.error('Payment verification failed:', response);
            return next(new AppError('Payment verification failed', 400));
          }
        } catch (error) {
          logger.error('Error processing payment verification:', error);
          return next(new AppError('Error processing payment verification', 500));
        }
      });
    });

    reqPaystack.on('error', (error) => {
      logger.error('Paystack verification request error:', error);
      return next(new AppError('Payment verification service error', 500));
    });

    reqPaystack.end();
  });

  // Handle Paystack webhooks
  handleWebhook = catchAsync(async (req, res, next) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return next(new AppError('Invalid webhook signature', 400));
    }

    const event = req.body;
    
    if (event.event === 'charge.success') {
      const { reference, amount, status } = event.data;
      
      // Find and update booking
      const booking = await Booking.findOne({
        'payment.reference': reference
      }).populate([
        { path: 'client', select: 'name email phone' },
        { path: 'provider', select: 'name email phone' }
      ]);

      if (booking) {
        booking.payment.status = 'completed';
        booking.payment.paidAt = new Date();
        booking.payment.amount = amount / 100;
        booking.payment.gateway = 'paystack';
        booking.payment.gatewayResponse = event.data;

        if (booking.status === 'pending') {
          booking.status = 'confirmed';
        }

        await booking.save();

        logger.info(`Webhook payment confirmed for booking ${booking.bookingNumber}`);
      }
    }

    res.status(200).json({ status: 'success' });
  });

  // Get payment status
  getPaymentStatus = catchAsync(async (req, res, next) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).select('payment bookingNumber');

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Verify user has access to this booking
    if (booking.client.toString() !== req.user.id && req.user.userType !== 'admin') {
      return next(new AppError('Unauthorized access', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        bookingNumber: booking.bookingNumber,
        payment: booking.payment
      }
    });
  });
}

module.exports = new PaymentController();