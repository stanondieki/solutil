const https = require('https');
const Payout = require('../models/Payout');
const User = require('../models/User');
const Booking = require('../models/Booking');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');

class PayoutService {
  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    this.baseURL = 'api.paystack.co';
    this.commissionRate = 30; // 30% commission
  }

  /**
   * Create a payout record when service is completed
   */
  async createPayout(bookingId) {
    try {
      const booking = await Booking.findById(bookingId)
        .populate('provider', 'name email payoutDetails')
        .populate('client', 'email name')
        .populate('service', 'title');

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'completed') {
        throw new Error('Booking must be completed before creating payout');
      }

      // For "Pay After Service" workflow, we create payout when booking completes
      // The payout will remain in "pending" status until payment is completed

      // Check if payout already exists
      const existingPayout = await Payout.findOne({ booking: bookingId });
      if (existingPayout) {
        logger.info(`Payout already exists for booking ${bookingId}`);
        return existingPayout;
      }

      // Calculate amounts
      const amounts = Payout.calculateAmounts(booking.pricing.totalAmount, this.commissionRate);

      // Set payout schedule (1 hour after completion)
      const serviceCompleted = new Date();
      const payoutScheduled = new Date(serviceCompleted.getTime() + (60 * 60 * 1000)); // +1 hour

      // Set payout status based on payment status
      const status = booking.payment.status === 'completed' ? 'pending' : 'awaiting_payment';

      const payout = new Payout({
        booking: bookingId,
        provider: booking.provider._id,
        client: booking.client._id,
        status,
        amounts: {
          ...amounts,
          currency: booking.pricing.currency || 'KES'
        },
        timeline: {
          serviceCompleted,
          payoutScheduled
        },
        metadata: {
          bookingReference: booking.bookingId,
          serviceTitle: booking.service.title,
          providerName: booking.provider.name,
          clientEmail: booking.client.email,
          paymentReference: booking.payment.paystack_reference
        }
      });

      await payout.save();

      logger.info(`Payout created for booking ${bookingId}`, {
        payoutId: payout._id,
        providerName: booking.provider.name,
        amount: amounts.payoutAmount,
        scheduledFor: payoutScheduled
      });

      return payout;
    } catch (error) {
      logger.error('Error creating payout:', error);
      throw error;
    }
  }

  /**
   * Handle payment completion - update payout status from awaiting_payment to pending
   */
  async onPaymentCompleted(bookingId) {
    try {
      const payout = await Payout.findOne({ booking: bookingId });
      if (payout && payout.status === 'awaiting_payment') {
        await payout.onPaymentCompleted();
        logger.info(`Payout updated to pending for booking ${bookingId}`, {
          payoutId: payout._id,
          newStatus: 'pending'
        });
        return payout;
      }
      return null;
    } catch (error) {
      logger.error(`Error updating payout for payment completion: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process payouts that are ready (1 hour after completion)
   */
  async processReadyPayouts() {
    try {
      const readyPayouts = await Payout.find({
        status: 'pending',
        'timeline.payoutScheduled': { $lte: new Date() }
      }).populate('provider', 'name email payoutDetails');

      logger.info(`Found ${readyPayouts.length} payouts ready for processing`);

      for (const payout of readyPayouts) {
        await this.processSinglePayout(payout);
      }

      return readyPayouts.length;
    } catch (error) {
      logger.error('Error processing ready payouts:', error);
      throw error;
    }
  }

  /**
   * Process a single payout
   */
  async processSinglePayout(payout) {
    try {
      payout.status = 'processing';
      payout.timeline.payoutProcessed = new Date();
      payout.metadata.attemptCount += 1;
      payout.metadata.lastAttempt = new Date();
      await payout.save();

      logger.info(`Processing payout ${payout._id} for provider ${payout.provider.name}`);

      // Check if provider has payout details
      const payoutDetails = payout.provider.payoutDetails;
      if (!payoutDetails) {
        throw new Error('Provider payout details not configured');
      }

      // Determine payout method and validate accordingly
      const payoutMethod = payoutDetails.payoutMethod || 'bank';
      
      if (payoutMethod === 'bank') {
        if (!payoutDetails.recipientCode && (!payoutDetails.accountNumber || !payoutDetails.bankCode)) {
          throw new Error('Provider bank details not configured');
        }
      } else if (payoutMethod === 'mpesa') {
        if (!payoutDetails.mpesaNumber) {
          throw new Error('Provider M-Pesa number not configured');
        }
      }

      // Create transfer based on method
      const transferResult = await this.createTransfer(payout, payoutMethod);

      if (transferResult.success) {
        payout.status = 'completed';
        payout.timeline.payoutCompleted = new Date();
        payout.paystack = {
          ...payout.paystack,
          transferCode: transferResult.data.transfer_code,
          transferId: transferResult.data.id,
          transferDate: new Date(),
          completedAt: new Date()
        };

        // Update provider total earnings
        await User.findByIdAndUpdate(payout.provider._id, {
          $inc: { 'providerStats.totalEarnings': payout.amounts.payoutAmount }
        });

        logger.info(`Payout completed successfully`, {
          payoutId: payout._id,
          transferCode: transferResult.data.transfer_code,
          amount: payout.amounts.payoutAmount
        });

        // Send success notification
        await notificationService.sendPayoutCompletedNotification(payout);
      } else {
        throw new Error(transferResult.error || 'Paystack transfer failed');
      }

    } catch (error) {
      logger.error(`Payout processing failed for ${payout._id}:`, error);

      payout.status = 'failed';
      payout.timeline.payoutFailed = new Date();
      payout.paystack.failureReason = error.message;

      // Send failure notification
      await notificationService.sendPayoutFailedNotification(payout, error.message);
    } finally {
      await payout.save();
    }
  }

  /**
   * Create transfer based on payout method (bank or M-Pesa)
   */
  async createTransfer(payout, method) {
    if (method === 'mpesa') {
      return await this.createMpesaTransfer(payout);
    } else {
      return await this.createPaystackTransfer(payout);
    }
  }

  /**
   * Create M-Pesa transfer using Paystack Mobile Money
   */
  async createMpesaTransfer(payout) {
    return new Promise((resolve) => {
      // First create a mobile money recipient if not exists
      const recipientData = {
        type: 'mobile_money',
        name: payout.provider.name,
        account_number: payout.provider.payoutDetails.mpesaNumber,
        bank_code: 'MPE', // M-Pesa bank code for Paystack
        currency: 'KES'
      };

      // Use existing recipient code if available, otherwise create new one
      const recipientCode = payout.provider.payoutDetails.recipientCode;
      
      if (recipientCode) {
        // Use existing recipient
        this.initiateMobileMoney(payout, recipientCode, resolve);
      } else {
        // Create new mobile money recipient first
        this.createMobileMoneyRecipient(recipientData, (recipientResult) => {
          if (recipientResult.success) {
            this.initiateMobileMoney(payout, recipientResult.recipientCode, resolve);
          } else {
            resolve({
              success: false,
              error: recipientResult.error
            });
          }
        });
      }
    });
  }

  /**
   * Create mobile money recipient for M-Pesa
   */
  createMobileMoneyRecipient(recipientData, callback) {
    const postData = JSON.stringify(recipientData);

    const options = {
      hostname: this.baseURL,
      port: 443,
      path: '/transferrecipient',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (response.status === true) {
            logger.info('Mobile money recipient created successfully', {
              recipientCode: response.data.recipient_code,
              accountNumber: recipientData.account_number
            });
            
            callback({
              success: true,
              recipientCode: response.data.recipient_code
            });
          } else {
            callback({
              success: false,
              error: response.message
            });
          }
        } catch (parseError) {
          callback({
            success: false,
            error: 'Failed to parse recipient creation response'
          });
        }
      });
    });

    req.on('error', (error) => {
      callback({
        success: false,
        error: error.message
      });
    });

    req.write(postData);
    req.end();
  }

  /**
   * Initiate mobile money transfer
   */
  initiateMobileMoney(payout, recipientCode, resolve) {
    const transferData = {
      source: 'balance',
      amount: payout.amounts.payoutAmount * 100, // Convert to kobo/cents
      recipient: recipientCode,
      reason: `Payout for service: ${payout.metadata.serviceTitle}`,
      reference: `MPESA-${payout._id}-${Date.now()}`
    };

    const postData = JSON.stringify(transferData);

    const options = {
      hostname: this.baseURL,
      port: 443,
      path: '/transfer',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    logger.info('Initiating M-Pesa transfer via Paystack', {
      phone: payout.provider.payoutDetails.mpesaNumber,
      amount: payout.amounts.payoutAmount,
      recipient: recipientCode,
      reference: transferData.reference
    });

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (response.status === true) {
            logger.info('M-Pesa transfer successful', {
              transferCode: response.data.transfer_code,
              transferId: response.data.id
            });
            
            resolve({
              success: true,
              data: response.data
            });
          } else {
            logger.error('M-Pesa transfer failed', {
              error: response.message,
              phone: payout.provider.payoutDetails.mpesaNumber
            });
            
            resolve({
              success: false,
              error: response.message
            });
          }
        } catch (parseError) {
          resolve({
            success: false,
            error: 'Failed to parse transfer response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.write(postData);
    req.end();
  }

  /**
   * Create Paystack bank transfer
   */
  async createPaystackTransfer(payout) {
    return new Promise((resolve) => {
      const transferData = {
        source: 'balance',
        amount: payout.amounts.payoutAmount * 100, // Convert to kobo
        recipient: payout.provider.payoutDetails.recipientCode,
        reason: `Payout for service: ${payout.metadata.serviceTitle}`,
        reference: `PAYOUT-${payout._id}-${Date.now()}`
      };

      const postData = JSON.stringify(transferData);

      const options = {
        hostname: this.baseURL,
        port: 443,
        path: '/transfer',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            
            if (response.status === true) {
              resolve({
                success: true,
                data: response.data
              });
            } else {
              resolve({
                success: false,
                error: response.message
              });
            }
          } catch (parseError) {
            resolve({
              success: false,
              error: 'Failed to parse Paystack response'
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        });
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Create Paystack transfer recipient for provider
   */
  async createTransferRecipient(provider) {
    return new Promise((resolve) => {
      const recipientData = {
        type: 'nuban',
        name: provider.payoutDetails.accountName,
        account_number: provider.payoutDetails.accountNumber,
        bank_code: provider.payoutDetails.bankCode,
        currency: 'KES'
      };

      const postData = JSON.stringify(recipientData);

      const options = {
        hostname: this.baseURL,
        port: 443,
        path: '/transferrecipient',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            
            if (response.status === true) {
              resolve({
                success: true,
                recipientCode: response.data.recipient_code
              });
            } else {
              resolve({
                success: false,
                error: response.message
              });
            }
          } catch (parseError) {
            resolve({
              success: false,
              error: 'Failed to parse Paystack response'
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          error: error.message
        });
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Get payout statistics
   */
  async getPayoutStats(providerId = null) {
    const matchStage = providerId ? { provider: providerId } : {};
    
    const stats = await Payout.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amounts.payoutAmount' }
        }
      }
    ]);

    return stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
      return acc;
    }, {});
  }
}

module.exports = new PayoutService();