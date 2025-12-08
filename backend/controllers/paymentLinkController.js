const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');
const crypto = require('crypto');

class PaymentLinkController {
  // Generate payment link for booking
  generatePaymentLink = catchAsync(async (req, res, next) => {
    const { bookingId } = req.params;

    // Find the booking
    const booking = await Booking.findById(bookingId).populate([
      { path: 'client', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' }
    ]);

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if user is authorized (client or provider) - only if user exists
    if (req.user && !booking.client._id.equals(req.user.id) && !booking.provider._id.equals(req.user.id)) {
      return next(new AppError('You are not authorized to access this booking', 403));
    }

    // Check if booking is eligible for payment
    if (booking.payment.status === 'completed') {
      return next(new AppError('Payment has already been completed for this booking', 400));
    }

    if (booking.status === 'cancelled') {
      return next(new AppError('Cannot process payment for cancelled booking', 400));
    }

    // Generate secure payment token
    const paymentToken = crypto.randomBytes(32).toString('hex');
    const linkExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update booking with payment link details
    booking.payment.paymentLink = `${process.env.FRONTEND_URL}/payment/link/${paymentToken}`;
    booking.payment.paymentLinkExpiry = linkExpiry;
    booking.payment.reference = paymentToken; // Use token as reference for link payments

    await booking.save();

    logger.info(`Payment link generated for booking ${booking.bookingNumber}`, {
      bookingId: booking._id,
      expiresAt: linkExpiry
    });

    res.status(200).json({
      status: 'success',
      data: {
        paymentLink: booking.payment.paymentLink,
        expiresAt: linkExpiry,
        amount: booking.pricing.totalAmount,
        booking: {
          id: booking._id,
          bookingNumber: booking.bookingNumber,
          serviceCategory: booking.serviceCategory,
          scheduledDate: booking.scheduledDate,
          client: booking.client.name
        }
      }
    });
  });

  // Validate payment link token
  validatePaymentLink = catchAsync(async (req, res, next) => {
    const { token } = req.params;

    // Find booking by payment link token or reference
    const booking = await Booking.findOne({
      $or: [
        { 'payment.reference': token },
        { 'payment.paymentLink': { $regex: token } }
      ],
      'payment.paymentLinkExpiry': { $gt: new Date() }
    }).populate([
      { path: 'client', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' }
    ]);

    if (!booking) {
      return next(new AppError('Invalid or expired payment link', 400));
    }

    if (booking.payment.status === 'completed') {
      return next(new AppError('Payment has already been completed', 400));
    }

    res.status(200).json({
      status: 'success',
      data: {
        booking: {
          id: booking._id,
          bookingNumber: booking.bookingNumber,
          client: booking.client,
          provider: booking.provider,
          serviceCategory: booking.serviceCategory,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          location: booking.location,
          pricing: booking.pricing,
          payment: {
            method: booking.payment.method,
            status: booking.payment.status,
            timing: booking.payment.timing
          }
        },
        paymentDetails: {
          amount: booking.pricing.totalAmount,
          currency: booking.pricing.currency || 'KES',
          dueAmount: booking.pricing.totalAmount - (booking.payment.amount || 0)
        }
      }
    });
  });

  // Process payment from link
  processLinkPayment = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { paymentMethod = 'card' } = req.body;

    const booking = await Booking.findOne({
      'payment.reference': token,
      'payment.paymentLinkExpiry': { $gt: new Date() }
    }).populate([
      { path: 'client', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' }
    ]);

    if (!booking) {
      return next(new AppError('Invalid or expired payment link', 400));
    }

    if (booking.payment.status === 'completed') {
      return next(new AppError('Payment has already been completed', 400));
    }

    // Initialize Paystack payment
    const amount = booking.pricing.totalAmount * 100; // Convert to kobo
    const email = booking.client.email;

    const params = JSON.stringify({
      email: email,
      amount: amount,
      currency: 'KES',
      reference: `${booking.bookingNumber}-link-${Date.now()}`,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        clientId: booking.client._id,
        serviceCategory: booking.serviceCategory,
        paymentType: 'link_payment'
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

    const https = require('https');
    const reqPaystack = https.request(options, (resPaystack) => {
      let data = '';

      resPaystack.on('data', (chunk) => {
        data += chunk;
      });

      resPaystack.on('end', async () => {
        const response = JSON.parse(data);
        
        if (response.status) {
          // Update booking with new payment reference
          booking.payment.reference = response.data.reference;
          booking.payment.method = paymentMethod;
          booking.payment.status = 'initiated';
          booking.payment.timing = 'pay-after';
          await booking.save();

          logger.info(`Link payment initialized for booking ${booking.bookingNumber}`, {
            reference: response.data.reference,
            amount: amount / 100
          });

          res.status(200).json({
            status: 'success',
            data: response.data
          });
        } else {
          logger.error('Paystack initialization failed for link payment:', response);
          return next(new AppError('Payment initialization failed', 400));
        }
      });
    });

    reqPaystack.on('error', (error) => {
      logger.error('Paystack request error for link payment:', error);
      return next(new AppError('Payment service error', 500));
    });

    reqPaystack.write(params);
    reqPaystack.end();
  });

  // Get payment link status
  getPaymentLinkStatus = catchAsync(async (req, res, next) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).select('payment bookingNumber client provider');

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    // Check if user is authorized - only if user exists
    if (req.user && !booking.client._id.equals(req.user.id) && !booking.provider._id.equals(req.user.id)) {
      return next(new AppError('You are not authorized to access this booking', 403));
    }

    const isLinkExpired = booking.payment.paymentLinkExpiry && 
                          new Date() > booking.payment.paymentLinkExpiry;

    res.status(200).json({
      status: 'success',
      data: {
        bookingNumber: booking.bookingNumber,
        payment: {
          status: booking.payment.status,
          timing: booking.payment.timing,
          method: booking.payment.method,
          hasPaymentLink: !!booking.payment.paymentLink,
          linkExpired: isLinkExpired,
          linkExpiresAt: booking.payment.paymentLinkExpiry,
          amount: booking.payment.amount
        }
      }
    });
  });
}

module.exports = new PaymentLinkController();