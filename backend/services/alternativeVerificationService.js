const User = require('../models/User');
const EmailDeliveryService = require('../services/emailDeliveryService');
const logger = require('../utils/logger');

class AlternativeVerificationService {
  
  // Send verification with multiple fallback methods
  async sendVerificationWithFallbacks(user, options = {}) {
    const { email, name } = user;
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    const verificationURL = `${process.env.CLIENT_URL}/auth/verify-email/${verificationToken}`;
    
    const results = {
      primaryEmailAttempted: false,
      primaryEmailSuccess: false,
      fallbacksUsed: [],
      recommendedActions: []
    };
    
    try {
      // 1. Try primary email delivery with tracking
      results.primaryEmailAttempted = true;
      
      const emailResult = await EmailDeliveryService.sendVerificationEmailWithTracking(
        email, 
        name, 
        verificationURL,
        {
          userId: user._id.toString(),
          userAgent: options.userAgent,
          ipAddress: options.ipAddress
        }
      );
      
      results.primaryEmailSuccess = true;
      results.messageId = emailResult.messageId;
      results.logId = emailResult.logId;
      
      logger.info('✅ Primary verification email sent successfully', {
        userId: user._id,
        email: email,
        messageId: emailResult.messageId
      });
      
    } catch (emailError) {
      logger.warn('⚠️ Primary email delivery failed, implementing fallbacks', {
        userId: user._id,
        email: email,
        error: emailError.message
      });
      
      results.primaryEmailError = emailError.message;
      
      // 2. Check if this is an institutional email
      if (this.isInstitutionalEmail(email)) {
        results.fallbacksUsed.push('institutional_email_detected');
        results.recommendedActions.push({
          type: 'institutional_email_notice',
          message: 'Institutional emails may block automated messages. Check spam folder or contact IT support.',
          action: 'check_spam_folder'
        });
      }
      
      // 3. Check delivery history for this email
      const deliveryStatus = await EmailDeliveryService.checkDeliveryStatus(email, 'verification');
      
      if (deliveryStatus.hasRecentDelivery) {
        results.fallbacksUsed.push('recent_delivery_found');
        results.recommendedActions.push({
          type: 'recent_email_sent',
          message: 'A verification email was recently sent. Please check your inbox and spam folder.',
          lastSent: deliveryStatus.lastDelivery.createdAt,
          action: 'check_existing_email'
        });
      }
      
      // 4. Implement admin notification for manual verification
      await this.notifyAdminForManualVerification(user, emailError.message);
      results.fallbacksUsed.push('admin_notification');
      
      results.recommendedActions.push({
        type: 'manual_verification_available',
        message: 'Admin has been notified for manual verification if needed.',
        action: 'contact_support'
      });
    }
    
    // 5. Generate final recommendations
    results.userInstructions = this.generateUserInstructions(email, results);
    
    return results;
  }
  
  // Check if email is from an institutional domain
  isInstitutionalEmail(email) {
    const institutionalDomains = [
      '.edu', '.ac.', '.university', '.college', 
      'spu.ac.ke', 'uon.ac.ke', 'ku.ac.ke', 'mku.ac.ke'
    ];
    
    return institutionalDomains.some(domain => 
      email.toLowerCase().includes(domain.toLowerCase())
    );
  }
  
  // Notify admin for manual verification
  async notifyAdminForManualVerification(user, errorReason) {
    try {
      // Log the manual verification request
      await EmailDeliveryService.createManualVerificationRecord(
        user.email,
        'system',
        `Automatic email delivery failed: ${errorReason}`
      );
      
      // Here you could send an email to admins or create a notification
      logger.info('📋 Manual verification request logged', {
        userId: user._id,
        email: user.email,
        reason: errorReason
      });
      
    } catch (error) {
      logger.error('❌ Failed to log manual verification request', {
        userId: user._id,
        error: error.message
      });
    }
  }
  
  // Generate user-friendly instructions
  generateUserInstructions(email, results) {
    const instructions = {
      primary: 'Please check your email inbox for a verification message.',
      steps: []
    };
    
    if (this.isInstitutionalEmail(email)) {
      instructions.steps.push({
        step: 1,
        action: 'Check your spam/junk folder - institutional emails often filter automated messages'
      });
      
      instructions.steps.push({
        step: 2,
        action: 'Add infosolu31@gmail.com to your email whitelist or safe senders list'
      });
      
      instructions.steps.push({
        step: 3,
        action: 'Contact your IT support to allow emails from SolUtil platform'
      });
    } else {
      instructions.steps.push({
        step: 1,
        action: 'Check your spam/junk folder'
      });
      
      instructions.steps.push({
        step: 2,
        action: 'Add infosolu31@gmail.com to your safe senders list'
      });
    }
    
    instructions.steps.push({
      step: instructions.steps.length + 1,
      action: 'Try the resend verification option if available'
    });
    
    instructions.steps.push({
      step: instructions.steps.length + 1,
      action: 'Contact support for manual verification if the email doesn\'t arrive within 10 minutes'
    });
    
    return instructions;
  }
  
  // Manual verification by admin
  async manuallyVerifyUser(email, adminId, reason = 'Manual verification by admin') {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.isVerified) {
        return {
          success: true,
          message: 'User was already verified',
          user: user
        };
      }
      
      // Update user verification status
      user.isVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      // Log the manual verification
      await EmailDeliveryService.createManualVerificationRecord(
        email,
        adminId,
        reason
      );
      
      logger.info('✅ User manually verified', {
        userId: user._id,
        email: email,
        adminId: adminId,
        reason: reason
      });
      
      return {
        success: true,
        message: 'User verified successfully',
        user: user,
        verificationMethod: 'manual'
      };
      
    } catch (error) {
      logger.error('❌ Manual verification failed', {
        email: email,
        adminId: adminId,
        error: error.message
      });
      
      throw error;
    }
  }
  
  // Get verification statistics
  async getVerificationStats() {
    const deliveryStats = await EmailDeliveryService.getDeliveryStats(24);
    
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$isVerified',
          count: { $sum: 1 }
        }
      }
    ]);
    
    return {
      emailDelivery: deliveryStats,
      userVerification: userStats,
      timestamp: new Date()
    };
  }
}

module.exports = new AlternativeVerificationService();