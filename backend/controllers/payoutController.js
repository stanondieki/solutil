const https = require('https');
const crypto = require('crypto');
const User = require('../models/User');
const Booking = require('../models/Booking');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Environment-based Paystack key selection
const getPaystackKeys = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const secretKey = isProduction 
    ? process.env.PAYSTACK_SECRET_KEY 
    : process.env.PAYSTACK_SECRET_KEY_TEST || process.env.PAYSTACK_SECRET_KEY;
    
  return { secretKey };
};

// Paystack Payout Controller
class PayoutController {
  
  // @desc    Setup payout method for a provider (Bank or M-Pesa)
  // @route   POST /api/payouts/setup-payout
  // @access  Private (Provider only)
  setupPayoutMethod = catchAsync(async (req, res, next) => {
    const { payoutMethod, bankCode, accountNumber, accountName, mpesaNumber } = req.body;

    if (!payoutMethod || !['bank', 'mpesa'].includes(payoutMethod)) {
      return next(new AppError('Payout method must be either "bank" or "mpesa"', 400));
    }

    if (payoutMethod === 'bank') {
      return this.createBankTransferRecipient(req, res, next);
    } else {
      return this.setupMpesaPayout(req, res, next);
    }
  });

  // @desc    Create a bank transfer recipient for a provider
  // @route   POST /api/payouts/create-recipient
  // @access  Private (Provider only)
  createBankTransferRecipient = catchAsync(async (req, res, next) => {
    const { bankCode, accountNumber, accountName } = req.body;

    if (!bankCode || !accountNumber || !accountName) {
      return next(new AppError('Bank code, account number, and account name are required', 400));
    }

    const { secretKey } = getPaystackKeys();
    if (!secretKey) {
      return next(new AppError('Paystack secret key not configured', 500));
    }

    // Verify account number first
    const accountVerification = await this.verifyAccountNumber(accountNumber, bankCode, secretKey);
    
    if (!accountVerification.status) {
      // If it's the daily limit error for test mode, suggest using test bank codes
      const errorMessage = accountVerification.message;
      if (errorMessage.includes('Test mode daily limit') && errorMessage.includes('Use test bank codes 001')) {
        return next(new AppError('Test mode daily limit exceeded. Please use test bank code "001" for testing purposes.', 400));
      }
      return next(new AppError('Account verification failed: ' + errorMessage, 400));
    }

    // Create transfer recipient
    const recipientData = JSON.stringify({
      type: 'nuban',
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN'
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transferrecipient',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      }
    };

    const recipientResult = await this.makePaystackRequest(options, recipientData);

    if (recipientResult.status) {
      // Save recipient code to user profile
      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          'providerProfile.payoutDetails': {
            recipientCode: recipientResult.data.recipient_code,
            bankCode,
            accountNumber,
            accountName,
            bankName: accountVerification.data.bank_name || 'Unknown Bank',
            createdAt: new Date()
          }
        },
        { new: true }
      );

      logger.info(`Transfer recipient created for provider ${req.user.email}: ${recipientResult.data.recipient_code}`);

      res.status(201).json({
        status: 'success',
        message: 'Bank payout account setup successful',
        data: {
          payoutMethod: 'bank',
          recipientCode: recipientResult.data.recipient_code,
          accountName,
          bankName: accountVerification.data.bank_name,
          accountNumber: accountNumber.replace(/(\d{4})\d+(\d{4})/, '$1****$2')
        }
      });
    } else {
      return next(new AppError('Failed to create transfer recipient: ' + recipientResult.message, 400));
    }
  });

  // @desc    Setup M-Pesa payout for provider
  // @route   POST /api/payouts/setup-mpesa
  // @access  Private (Provider only)
  setupMpesaPayout = catchAsync(async (req, res, next) => {
    const { mpesaNumber } = req.body;

    if (!mpesaNumber) {
      return next(new AppError('M-Pesa number is required', 400));
    }

    // Validate M-Pesa number format (Kenyan format: 254xxxxxxxxx)
    const mpesaRegex = /^254[17]\d{8}$/;
    if (!mpesaRegex.test(mpesaNumber)) {
      return next(new AppError('Invalid M-Pesa number format. Use 254XXXXXXXXX format', 400));
    }

    // Save M-Pesa details to user profile
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'providerProfile.payoutDetails': {
          payoutMethod: 'mpesa',
          mpesaNumber,
          recipientCode: `MPESA_${req.user._id}_${Date.now()}`, // Custom reference
          createdAt: new Date()
        }
      },
      { new: true }
    );

    logger.info(`M-Pesa payout setup for provider ${req.user.email}: ${mpesaNumber}`);

    res.status(201).json({
      status: 'success',
      message: 'M-Pesa payout setup successful',
      data: {
        payoutMethod: 'mpesa',
        mpesaNumber: mpesaNumber.replace(/(\d{3})(\d{6})(\d{3})/, '$1****$3'),
        recipientCode: `MPESA_${req.user._id}_${Date.now()}`
      }
    });
  });

  // @desc    Initiate transfer to provider
  // @route   POST /api/payouts/transfer
  // @access  Private (System/Admin only - called after booking completion)
  initiateTransfer = catchAsync(async (req, res, next) => {
    const { bookingId, amount, providerId } = req.body;

    if (!bookingId || !amount || !providerId) {
      return next(new AppError('Booking ID, amount, and provider ID are required', 400));
    }

    // Get provider details
    const provider = await User.findById(providerId);
    if (!provider || !provider.providerProfile?.payoutDetails?.recipientCode) {
      return next(new AppError('Provider payout account not configured', 400));
    }

    // Get booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    if (booking.status !== 'completed') {
      return next(new AppError('Can only transfer payment for completed bookings', 400));
    }

    const payoutMethod = provider.providerProfile.payoutDetails.payoutMethod || 'bank';
    
    if (payoutMethod === 'mpesa') {
      return this.initiateMpesaTransfer(req, res, next);
    } else {
      return this.initiatePaystackTransfer(req, res, next);
    }
  });

  // @desc    Initiate Paystack bank transfer
  initiatePaystackTransfer = catchAsync(async (req, res, next) => {
    const { bookingId, amount, providerId } = req.body;
    
    const { secretKey } = getPaystackKeys();
    if (!secretKey) {
      return next(new AppError('Paystack secret key not configured', 500));
    }

    const provider = await User.findById(providerId);
    const booking = await Booking.findById(bookingId);

    // Calculate provider amount (after platform commission)
    const platformCommissionRate = 0.1; // 10% platform commission
    const providerAmount = Math.floor(amount * (1 - platformCommissionRate) * 100); // Convert to kobo
    const reference = `PAYOUT_${bookingId}_${Date.now()}`;

    const transferData = JSON.stringify({
      source: 'balance',
      amount: providerAmount,
      recipient: provider.providerProfile.payoutDetails.recipientCode,
      reason: `Payment for completed service - Booking #${bookingId}`,
      reference,
      currency: 'NGN'
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transfer',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      }
    };

    const transferResult = await this.makePaystackRequest(options, transferData);

    if (transferResult.status) {
      // Update booking with payout information
      booking.providerPayout = {
        transferCode: transferResult.data.transfer_code,
        reference,
        amount: providerAmount / 100, // Convert back to naira
        platformCommission: amount * platformCommissionRate,
        status: 'initiated',
        initiatedAt: new Date(),
        recipientCode: provider.providerProfile.payoutDetails.recipientCode
      };
      await booking.save();

      // Update provider earnings
      await User.findByIdAndUpdate(providerId, {
        $inc: {
          'providerProfile.totalEarnings': providerAmount / 100,
          'providerProfile.totalCompletedBookings': 1
        }
      });

      logger.info(`Transfer initiated for booking ${bookingId}: ₦${providerAmount / 100} to ${provider.email}`);

      res.status(200).json({
        status: 'success',
        message: 'Transfer initiated successfully',
        data: {
          transferCode: transferResult.data.transfer_code,
          reference,
          amount: providerAmount / 100,
          providerName: provider.name,
          bookingId
        }
      });
    } else {
      return next(new AppError('Transfer failed: ' + transferResult.message, 400));
    }
  });

  // @desc    Initiate M-Pesa transfer
  initiateMpesaTransfer = catchAsync(async (req, res, next) => {
    const { bookingId, amount, providerId } = req.body;
    
    const provider = await User.findById(providerId);
    const booking = await Booking.findById(bookingId);

    // Calculate provider amount (after platform commission)
    const platformCommissionRate = 0.1; // 10% platform commission  
    const providerAmount = amount * (1 - platformCommissionRate);
    const reference = `MPESA_PAYOUT_${bookingId}_${Date.now()}`;

    // Simulate M-Pesa transfer (replace with actual M-Pesa API integration)
    const mpesaResult = await this.processMpesaTransfer({
      phoneNumber: provider.providerProfile.payoutDetails.mpesaNumber,
      amount: Math.round(providerAmount),
      reference,
      description: `Payment for completed service - Booking #${bookingId}`
    });

    if (mpesaResult.success) {
      // Update booking with payout information
      booking.providerPayout = {
        transferCode: mpesaResult.transactionId,
        reference,
        amount: providerAmount,
        platformCommission: amount * platformCommissionRate,
        status: 'initiated',
        initiatedAt: new Date(),
        recipientCode: provider.providerProfile.payoutDetails.recipientCode,
        payoutMethod: 'mpesa'
      };
      await booking.save();

      // Update provider earnings
      await User.findByIdAndUpdate(providerId, {
        $inc: {
          'providerProfile.totalEarnings': providerAmount,
          'providerProfile.totalCompletedBookings': 1
        }
      });

      logger.info(`M-Pesa transfer initiated for booking ${bookingId}: KES ${providerAmount} to ${provider.email}`);

      res.status(200).json({
        status: 'success',
        message: 'M-Pesa transfer initiated successfully',
        data: {
          transactionId: mpesaResult.transactionId,
          reference,
          amount: providerAmount,
          providerName: provider.name,
          bookingId,
          payoutMethod: 'mpesa'
        }
      });
    } else {
      return next(new AppError('M-Pesa transfer failed: ' + mpesaResult.message, 400));
    }
  });

  // @desc    Process M-Pesa transfer (placeholder for actual M-Pesa API)
  processMpesaTransfer = async (transferData) => {
    // This is a placeholder - replace with actual Safaricom M-Pesa API integration
    // For now, simulate a successful transfer
    const { phoneNumber, amount, reference, description } = transferData;
    
    logger.info(`Simulated M-Pesa Transfer: ${amount} KES to ${phoneNumber} - ${description}`);
    
    // In production, integrate with:
    // - Safaricom M-Pesa Business-to-Customer (B2C) API
    // - Or use services like Africa's Talking, Flutterwave, or similar
    
    return {
      success: true,
      transactionId: `MPESA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Transfer initiated successfully'
    };
  };

  // @desc    Get provider payout history
  // @route   GET /api/payouts/history
  // @access  Private (Provider only)
  getPayoutHistory = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({
      provider: req.user._id,
      status: 'completed',
      'providerPayout.transferCode': { $exists: true }
    })
    .populate('client', 'name email')
    .populate('service', 'title')
    .sort({ completedAt: -1 });

    const payouts = bookings.map(booking => ({
      bookingId: booking._id,
      clientName: booking.client?.name,
      serviceTitle: booking.service?.title,
      amount: booking.providerPayout?.amount,
      platformCommission: booking.providerPayout?.platformCommission,
      reference: booking.providerPayout?.reference,
      status: booking.providerPayout?.status,
      transferDate: booking.providerPayout?.initiatedAt,
      completedDate: booking.completedAt
    }));

    // Calculate totals
    const totalEarnings = payouts.reduce((sum, payout) => sum + (payout.amount || 0), 0);
    const totalCommissions = payouts.reduce((sum, payout) => sum + (payout.platformCommission || 0), 0);

    res.status(200).json({
      status: 'success',
      results: payouts.length,
      data: {
        payouts,
        summary: {
          totalEarnings,
          totalCommissions,
          netEarnings: totalEarnings,
          totalPayouts: payouts.length
        }
      }
    });
  });

  // @desc    Get banks list for account setup
  // @route   GET /api/payouts/banks
  // @access  Private (Provider only)
  getBanks = catchAsync(async (req, res, next) => {
    const { secretKey } = getPaystackKeys();
    
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/bank',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      }
    };

    const result = await this.makePaystackRequest(options);

    if (result.status) {
      // Filter Nigerian banks and sort alphabetically
      const nigerianBanks = result.data
        .filter(bank => bank.currency === 'NGN' && bank.active)
        .sort((a, b) => a.name.localeCompare(b.name));

      res.status(200).json({
        status: 'success',
        data: {
          banks: nigerianBanks
        }
      });
    } else {
      return next(new AppError('Failed to fetch banks list', 500));
    }
  });

  // @desc    Verify account number
  // @route   POST /api/payouts/verify-account
  // @access  Private (Provider only)
  verifyAccount = catchAsync(async (req, res, next) => {
    const { accountNumber, bankCode } = req.body;

    if (!accountNumber || !bankCode) {
      return next(new AppError('Account number and bank code are required', 400));
    }

    const { secretKey } = getPaystackKeys();
    
    const result = await this.verifyAccountNumber(accountNumber, bankCode, secretKey);

    if (result.status) {
      res.status(200).json({
        status: 'success',
        data: {
          accountName: result.data.account_name,
          accountNumber: result.data.account_number,
          bankName: result.data.bank_name
        }
      });
    } else {
      return next(new AppError('Account verification failed: ' + result.message, 400));
    }
  });

  // Helper method to verify account number
  async verifyAccountNumber(accountNumber, bankCode, secretKey) {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      }
    };

    return await this.makePaystackRequest(options);
  }

  // Helper method to make Paystack API requests
  async makePaystackRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(responseBody);
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
        req.write(data);
      }

      req.end();
    });
  }
}

module.exports = new PayoutController();