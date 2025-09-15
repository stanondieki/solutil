const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// M-Pesa configuration
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  businessShortCode: process.env.MPESA_BUSINESS_SHORTCODE || '174379',
  passkey: process.env.MPESA_PASSKEY,
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox', // 'sandbox' or 'production'
  baseUrl: process.env.MPESA_ENVIRONMENT === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke'
};

// Generate M-Pesa access token
const generateAccessToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
    
    const response = await axios.get(`${MPESA_CONFIG.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    return response.data.access_token;
  } catch (error) {
    logger.error('Error generating M-Pesa access token:', error.response?.data || error.message);
    throw new AppError('Failed to authenticate with M-Pesa', 500);
  }
};

// Generate password for STK Push
const generatePassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${MPESA_CONFIG.businessShortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');
  return { password, timestamp };
};

// STK Push request
router.post('/stk-push', [
  body('phoneNumber').isMobilePhone('en-KE').withMessage('Valid Kenyan phone number required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('accountReference').notEmpty().withMessage('Account reference is required'),
  body('transactionDesc').notEmpty().withMessage('Transaction description is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { phoneNumber, amount, accountReference, transactionDesc, metadata } = req.body;
  
  try {
    const accessToken = await generateAccessToken();
    const { password, timestamp } = generatePassword();
    
    // Format phone number
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    }
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    const stkPushPayload = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount), // Ensure amount is an integer
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/mpesa/callback`,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };

    const response = await axios.post(
      `${MPESA_CONFIG.baseUrl}/mpesa/stkpush/v1/processrequest`,
      stkPushPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.ResponseCode === '0') {
      // Store transaction in database for tracking
      const escrowPayment = {
        checkoutRequestID: response.data.CheckoutRequestID,
        merchantRequestID: response.data.MerchantRequestID,
        phoneNumber: formattedPhone,
        amount: amount,
        accountReference: accountReference,
        transactionDesc: transactionDesc,
        status: 'pending',
        metadata: metadata || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // TODO: Save to database
      // await EscrowPayment.create(escrowPayment);

      logger.info(`STK Push initiated for ${formattedPhone}, Amount: ${amount}, CheckoutRequestID: ${response.data.CheckoutRequestID}`);

      res.status(200).json({
        success: true,
        message: 'STK Push sent successfully',
        checkoutRequestID: response.data.CheckoutRequestID,
        merchantRequestID: response.data.MerchantRequestID
      });
    } else {
      throw new AppError(response.data.ResponseDescription || 'STK Push failed', 400);
    }
  } catch (error) {
    logger.error('STK Push error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      return res.status(400).json({
        success: false,
        message: error.response.data.ResponseDescription || error.response.data.errorMessage || 'STK Push failed',
        code: error.response.data.ResponseCode || error.response.data.errorCode
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}));

// M-Pesa callback endpoint
router.post('/callback', catchAsync(async (req, res) => {
  logger.info('M-Pesa callback received:', JSON.stringify(req.body, null, 2));

  const { Body } = req.body;
  const { stkCallback } = Body;

  const checkoutRequestID = stkCallback.CheckoutRequestID;
  const merchantRequestID = stkCallback.MerchantRequestID;
  const resultCode = stkCallback.ResultCode;
  const resultDesc = stkCallback.ResultDesc;

  try {
    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata;
      const items = callbackMetadata.Item;

      const amount = items.find(item => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = items.find(item => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = items.find(item => item.Name === 'PhoneNumber')?.Value;

      // Update payment status in database
      // TODO: Update database
      // await EscrowPayment.findOneAndUpdate(
      //   { checkoutRequestID },
      //   {
      //     status: 'completed',
      //     mpesaReceiptNumber,
      //     transactionDate,
      //     resultCode,
      //     resultDesc,
      //     updatedAt: new Date()
      //   }
      // );

      logger.info(`Payment successful: ${mpesaReceiptNumber}, Amount: ${amount}, Phone: ${phoneNumber}`);
    } else {
      // Payment failed
      // TODO: Update database
      // await EscrowPayment.findOneAndUpdate(
      //   { checkoutRequestID },
      //   {
      //     status: 'failed',
      //     resultCode,
      //     resultDesc,
      //     updatedAt: new Date()
      //   }
      // );

      logger.warn(`Payment failed: ${resultDesc}, CheckoutRequestID: ${checkoutRequestID}`);
    }

    // Send acknowledgment to M-Pesa
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted'
    });
  } catch (error) {
    logger.error('Error processing M-Pesa callback:', error);
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Internal Server Error'
    });
  }
}));

// Check payment status
router.get('/status/:checkoutRequestID', catchAsync(async (req, res) => {
  const { checkoutRequestID } = req.params;

  try {
    // TODO: Get from database
    // const payment = await EscrowPayment.findOne({ checkoutRequestID });
    
    // Mock response for now
    const payment = {
      checkoutRequestID,
      status: 'pending', // This would come from database
      amount: 2500,
      createdAt: new Date()
    };

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      status: payment.status,
      transactionId: payment.mpesaReceiptNumber || null,
      amount: payment.amount,
      createdAt: payment.createdAt
    });
  } catch (error) {
    logger.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

// Release payment to provider (escrow release)
router.post('/release/:transactionId', [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { transactionId } = req.params;
  const { bookingId, providerId, rating, review } = req.body;

  try {
    // TODO: Implement database operations
    // 1. Get escrow payment details
    // 2. Calculate commission (e.g., 10%)
    // 3. Calculate provider amount (total - commission)
    // 4. Create provider payout record
    // 5. Update booking status to 'completed'
    // 6. Create review record
    // 7. Initiate provider payment (could be M-Pesa B2C or bank transfer)

    const mockPayment = {
      amount: 2500,
      commissionRate: 0.10
    };

    const commissionAmount = mockPayment.amount * mockPayment.commissionRate;
    const providerAmount = mockPayment.amount - commissionAmount;

    logger.info(`Releasing payment: Transaction ${transactionId}, Provider gets ${providerAmount}, Commission: ${commissionAmount}`);

    res.status(200).json({
      success: true,
      message: 'Payment released successfully',
      data: {
        totalAmount: mockPayment.amount,
        commissionAmount,
        providerAmount,
        rating,
        review: review || null
      }
    });
  } catch (error) {
    logger.error('Error releasing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

// Initiate dispute
router.post('/dispute/:transactionId', [
  body('reason').notEmpty().withMessage('Dispute reason is required'),
  body('bookingId').notEmpty().withMessage('Booking ID is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { transactionId } = req.params;
  const { reason, bookingId } = req.body;

  try {
    // TODO: Implement database operations
    // 1. Create dispute record
    // 2. Update booking status to 'disputed'
    // 3. Hold payment in escrow
    // 4. Notify admin/support team
    // 5. Send email notifications

    logger.info(`Dispute initiated for transaction ${transactionId}: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'Dispute initiated successfully. Our support team will review and contact you within 24 hours.',
      disputeId: `DISPUTE_${Date.now()}` // Generate proper dispute ID
    });
  } catch (error) {
    logger.error('Error initiating dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}));

module.exports = router;
