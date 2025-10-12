const { sendEmail } = require('../utils/email');
const EmailDeliveryLog = require('../models/EmailDeliveryLog');
const logger = require('../utils/logger');

class EmailDeliveryService {
  
  // Send email with delivery tracking
  async sendTrackedEmail(emailOptions, metadata = {}) {
    const logEntry = new EmailDeliveryLog({
      recipient: emailOptions.email,
      emailType: emailOptions.type || 'verification',
      subject: emailOptions.subject,
      metadata: {
        userId: metadata.userId,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress
      }
    });

    try {
      // Attempt to send email
      const result = await sendEmail(emailOptions);
      
      // Update log with success details
      logEntry.messageId = result.messageId;
      logEntry.smtpResponse = result.response;
      logEntry.deliveryStatus = 'sent';
      
      await logEntry.save();
      
      logger.info('📧 Email sent and logged', {
        recipient: emailOptions.email,
        messageId: result.messageId,
        logId: logEntry._id
      });
      
      return {
        success: true,
        messageId: result.messageId,
        logId: logEntry._id,
        deliveryTrackingEnabled: true
      };
      
    } catch (error) {
      // Log the failure
      logEntry.deliveryStatus = 'failed';
      logEntry.errorMessage = error.message;
      await logEntry.save();
      
      logger.error('❌ Email send failed and logged', {
        recipient: emailOptions.email,
        error: error.message,
        logId: logEntry._id
      });
      
      // Check if we should retry
      if (logEntry.deliveryAttempts < 3) {
        setTimeout(() => {
          this.retryEmailDelivery(logEntry._id);
        }, 5 * 60 * 1000); // Retry after 5 minutes
      }
      
      throw error;
    }
  }
  
  // Retry failed email delivery
  async retryEmailDelivery(logId) {
    try {
      const logEntry = await EmailDeliveryLog.findById(logId);
      
      if (!logEntry || logEntry.deliveryStatus === 'sent') {
        return;
      }
      
      logEntry.deliveryAttempts += 1;
      logEntry.lastAttempt = new Date();
      
      // Attempt to resend (this would need the original email options)
      // For now, just update the log
      await logEntry.save();
      
      logger.info('📧 Email delivery retry attempted', {
        logId: logId,
        attempt: logEntry.deliveryAttempts
      });
      
    } catch (error) {
      logger.error('❌ Email retry failed', {
        logId: logId,
        error: error.message
      });
    }
  }
  
  // Get delivery statistics
  async getDeliveryStats(timeRange = 24) {
    const since = new Date(Date.now() - (timeRange * 60 * 60 * 1000));
    
    const stats = await EmailDeliveryLog.aggregate([
      {
        $match: {
          createdAt: { $gte: since }
        }
      },
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 },
          recipients: { $addToSet: '$recipient' }
        }
      }
    ]);
    
    return {
      timeRange: `${timeRange} hours`,
      stats: stats,
      totalEmails: stats.reduce((sum, stat) => sum + stat.count, 0)
    };
  }
  
  // Check if email was delivered to specific recipient
  async checkDeliveryStatus(email, emailType = null) {
    const query = { recipient: email };
    if (emailType) {
      query.emailType = emailType;
    }
    
    const recentDelivery = await EmailDeliveryLog.findOne(query)
      .sort({ createdAt: -1 })
      .limit(1);
    
    return {
      hasRecentDelivery: !!recentDelivery,
      lastDelivery: recentDelivery,
      deliveryStatus: recentDelivery ? recentDelivery.deliveryStatus : null
    };
  }
  
  // Send verification email with enhanced tracking
  async sendVerificationEmailWithTracking(email, name, verificationURL, metadata = {}) {
    return this.sendTrackedEmail({
      email: email,
      type: 'verification',
      template: 'emailVerification',
      subject: 'Email Verification - SolUtil Platform',
      data: { name, verificationURL }
    }, metadata);
  }
  
  // Manual verification fallback
  async createManualVerificationRecord(email, adminId, reason) {
    const logEntry = new EmailDeliveryLog({
      recipient: email,
      emailType: 'verification',
      subject: 'Manual Verification',
      deliveryStatus: 'delivered',
      messageId: `manual-${Date.now()}`,
      smtpResponse: `Manually verified by admin ${adminId}: ${reason}`,
      metadata: {
        adminId: adminId,
        verificationMethod: 'manual'
      }
    });
    
    await logEntry.save();
    
    logger.info('📧 Manual verification logged', {
      recipient: email,
      adminId: adminId,
      reason: reason
    });
    
    return logEntry;
  }
}

module.exports = new EmailDeliveryService();