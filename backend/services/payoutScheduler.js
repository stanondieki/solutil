const cron = require('node-cron');
const payoutService = require('../services/payoutService');
const logger = require('../utils/logger');

class PayoutScheduler {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the payout scheduler
   * Runs every 5 minutes to check for ready payouts
   */
  start() {
    // Run every 5 minutes: */5 * * * *
    const task = cron.schedule('*/5 * * * *', async () => {
      if (this.isRunning) {
        logger.info('Payout job already running, skipping...');
        return;
      }

      try {
        this.isRunning = true;
        logger.info('Starting scheduled payout processing...');
        
        const processedCount = await payoutService.processReadyPayouts();
        
        if (processedCount > 0) {
          logger.info(`Processed ${processedCount} payouts successfully`);
        } else {
          logger.debug('No payouts ready for processing');
        }
        
      } catch (error) {
        logger.error('Error in scheduled payout processing:', error);
      } finally {
        this.isRunning = false;
      }
    }, {
      scheduled: false // Don't start immediately
    });

    // Start the cron job
    task.start();
    
    logger.info('✅ Payout scheduler started - runs every 5 minutes');
    
    return task;
  }

  /**
   * Create payout when booking is completed
   * This should be called when booking status changes to 'completed'
   */
  async onBookingCompleted(bookingId) {
    try {
      logger.info(`Booking ${bookingId} completed - creating payout record`);
      
      const payout = await payoutService.createPayout(bookingId);
      
      logger.info(`Payout scheduled for ${payout.timeline.payoutScheduled}`, {
        payoutId: payout._id,
        bookingId: bookingId,
        amount: payout.amounts.payoutAmount
      });
      
      return payout;
    } catch (error) {
      logger.error(`Error creating payout for booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Manual payout processing (for testing or admin use)
   */
  async processNow() {
    try {
      logger.info('Manual payout processing triggered');
      const processedCount = await payoutService.processReadyPayouts();
      logger.info(`Manually processed ${processedCount} payouts`);
      return processedCount;
    } catch (error) {
      logger.error('Error in manual payout processing:', error);
      throw error;
    }
  }

  /**
   * Get payout statistics
   */
  async getStats(providerId = null) {
    return await payoutService.getPayoutStats(providerId);
  }
}

module.exports = new PayoutScheduler();