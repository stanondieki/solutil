const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendBookingConfirmation(booking, client, provider = null) {
    try {
      // Send confirmation to client
      await this.sendClientBookingConfirmation(booking, client);
      
      // Send notification to provider if available
      if (provider && provider.email) {
        await this.sendProviderBookingNotification(booking, client, provider);
      }
      
      logger.info(`Booking notifications sent for booking ${booking.bookingNumber}`);
    } catch (error) {
      logger.error('Failed to send booking notifications:', error);
    }
  }

  async sendClientBookingConfirmation(booking, client) {
    const emailContent = {
      from: process.env.EMAIL_FROM || 'noreply@solutil.com',
      to: client.email,
      subject: `Booking Confirmation - ${booking.bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Booking Confirmed! 🎉</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Hi ${client.name || 'there'},</h2>
            <p style="color: #666; font-size: 16px;">
              Your service booking has been confirmed. Here are the details:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Booking Number:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.bookingNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Service:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.serviceCategory || 'Service'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${new Date(booking.scheduledDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.scheduledTime.start}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Location:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.location.address}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Total Amount:</strong></td>
                  <td style="padding: 10px 0; color: #ff6b35; font-weight: bold;">KES ${booking.pricing.totalAmount}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2;">
                <strong>Next Steps:</strong> A provider will be assigned to your booking soon. 
                You'll receive another notification with provider details.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/bookings" 
                 style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Your Bookings
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you have any questions, please contact us at support@solutil.com
            </p>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(emailContent);
  }

  async sendProviderBookingNotification(booking, client, provider) {
    const emailContent = {
      from: process.env.EMAIL_FROM || 'noreply@solutil.com',
      to: provider.email,
      subject: `New Booking Assignment - ${booking.bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4caf50, #2e7d32); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Booking! 💼</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Hi ${provider.name || 'Provider'},</h2>
            <p style="color: #666; font-size: 16px;">
              You have a new service booking. Please review the details below:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Booking Number:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.bookingNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Service:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.serviceCategory || 'Service'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Client:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${client.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Date:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${new Date(booking.scheduledDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.scheduledTime.start}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Location:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${booking.location.address}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Payment:</strong></td>
                  <td style="padding: 10px 0; color: #4caf50; font-weight: bold;">KES ${booking.pricing.totalAmount}</td>
                </tr>
              </table>
            </div>
            
            ${booking.notes?.client ? `
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #e65100;">
                  <strong>Client Notes:</strong> ${booking.notes.client}
                </p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/provider/bookings" 
                 style="background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                View Booking
              </a>
              <a href="${process.env.FRONTEND_URL}/provider/bookings/${booking._id}" 
                 style="background: #2196f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Manage Booking
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Please confirm your availability and contact the client to coordinate the service.
            </p>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(emailContent);
  }

  async sendBookingStatusUpdate(booking, client, provider, newStatus) {
    try {
      const statusMessages = {
        confirmed: 'Your booking has been confirmed by the provider!',
        in_progress: 'Your service is now in progress!',
        completed: 'Your service has been completed!',
        cancelled: 'Your booking has been cancelled.',
        rejected: 'Unfortunately, your booking has been declined.'
      };

      const emailContent = {
        from: process.env.EMAIL_FROM || 'noreply@solutil.com',
        to: client.email,
        subject: `Booking Update - ${booking.bookingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2196f3, #1976d2); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Booking Update 📋</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hi ${client.name || 'there'},</h2>
              <p style="color: #666; font-size: 16px;">
                ${statusMessages[newStatus] || 'Your booking status has been updated.'}
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
                <p><strong>Service:</strong> ${booking.serviceCategory || 'Service'}</p>
                <p><strong>New Status:</strong> <span style="color: #2196f3; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/bookings" 
                   style="background: #2196f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Booking Details
                </a>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(emailContent);
      logger.info(`Status update notification sent for booking ${booking.bookingNumber}`);
    } catch (error) {
      logger.error('Failed to send status update notification:', error);
    }
  }

  async sendBookingCancellation(email, recipientName, booking, recipientType, reason) {
    try {
      const isClient = recipientType === 'client';
      const cancelledBy = isClient ? 'provider' : 'client';
      
      const emailContent = {
        from: process.env.EMAIL_FROM || 'noreply@solutil.com',
        to: email,
        subject: `Booking Cancelled - ${booking.bookingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff5722, #d32f2f); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Booking Cancelled ❌</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hi ${recipientName || 'there'},</h2>
              <p style="color: #666; font-size: 16px;">
                We regret to inform you that your booking has been cancelled by the ${cancelledBy}.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
                <p><strong>Service:</strong> ${booking.serviceCategory || 'Service'}</p>
                <p><strong>Scheduled Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</p>
                <p><strong>Scheduled Time:</strong> ${booking.scheduledTime?.start} - ${booking.scheduledTime?.end}</p>
                <p><strong>Reason:</strong> ${reason}</p>
                ${booking.cancellation?.refundEligible ? 
                  `<p><strong>Refund:</strong> <span style="color: #4caf50;">$${booking.cancellation.refundAmount} (${booking.cancellation.refundPercentage}% refund)</span></p>` : 
                  '<p><strong>Refund:</strong> <span style="color: #f44336;">Not eligible for refund</span></p>'
                }
              </div>
              
              ${booking.cancellation?.refundEligible && isClient ? 
                '<div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;"><p style="margin: 0; color: #2e7d32;"><strong>Refund Information:</strong> Your refund will be processed within 3-5 business days to your original payment method.</p></div>' : 
                ''
              }
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/bookings" 
                   style="background: #ff5722; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View All Bookings
                </a>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; text-align: center;">
                  Need help? Contact our support team at support@solutil.com
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(emailContent);
      logger.info(`Cancellation notification sent for booking ${booking.bookingNumber} to ${recipientType}`);
    } catch (error) {
      logger.error('Failed to send cancellation notification:', error);
    }
  }

  async sendProviderPaymentNotification(booking, client, provider, paymentDetails) {
    try {
      const emailContent = {
        from: process.env.EMAIL_FROM || 'noreply@solutil.com',
        to: provider.email,
        subject: `Payment Received - Booking ${booking.bookingNumber} 💰`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4caf50, #2e7d32); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Payment Received! 💰</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hi ${provider.name || 'Provider'},</h2>
              <p style="color: #666; font-size: 16px;">
                Great news! Payment has been received for your service booking. The booking is now confirmed and ready to proceed.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h3 style="color: #4caf50; margin-top: 0;">Payment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #4caf50; font-weight: bold;">KES ${paymentDetails.amount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Transaction ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${paymentDetails.transactionId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Reference:</strong></td>
                    <td style="padding: 8px 0;">${paymentDetails.reference}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Booking Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking Number:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.bookingNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Client:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${client.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Service Date:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date(booking.scheduledDate).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.scheduledTime.start}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Location:</strong></td>
                    <td style="padding: 8px 0;">${booking.location.address}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #2e7d32;">
                  <strong>Next Steps:</strong> 
                  • Contact the client to confirm service details<br>
                  • Arrive on time for the scheduled appointment<br>
                  • Mark the booking as "In Progress" when you start work<br>
                  • Complete the service and mark as "Completed" when done
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/provider/bookings/${booking._id}" 
                   style="background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                  View Booking Details
                </a>
                <a href="tel:${client.phone}" 
                   style="background: #2196f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Call Client
                </a>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #666; font-size: 14px; text-align: center;">
                  Payment funds will be transferred to your account after successful service completion.
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(emailContent);
      logger.info(`Provider payment notification sent for booking ${booking.bookingNumber}`);
    } catch (error) {
      logger.error('Failed to send provider payment notification:', error);
    }
  }

  async sendPaymentConfirmation(booking, client, status) {
    try {
      const subject = status === 'completed' ? 'Payment Successful' : 'Payment Update';
      const statusColor = status === 'completed' ? '#4caf50' : '#ff9800';
      const statusMessage = status === 'completed' ? 
        'Your payment has been processed successfully!' : 
        'There has been an update to your payment status.';

      const emailContent = {
        from: process.env.EMAIL_FROM || 'noreply@solutil.com',
        to: client.email,
        subject: `${subject} - Booking ${booking.bookingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, ${statusColor}, ${statusColor}dd); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">${subject} 💳</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hi ${client.name || 'there'},</h2>
              <p style="color: #666; font-size: 16px;">
                ${statusMessage}
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
                <h3 style="color: ${statusColor}; margin-top: 0;">Payment Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking Number:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.bookingNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: ${statusColor}; font-weight: bold;">KES ${booking.payment.amount || booking.pricing.totalAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Payment Method:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-transform: capitalize;">${booking.payment.method}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Transaction ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.payment.transactionId || 'Processing...'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Payment Date:</strong></td>
                    <td style="padding: 8px 0;">${booking.payment.paidAt ? new Date(booking.payment.paidAt).toLocaleDateString() : 'Today'}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Service Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Service:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.serviceCategory || 'Service'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Scheduled Date:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date(booking.scheduledDate).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Time:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.scheduledTime.start}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Location:</strong></td>
                    <td style="padding: 8px 0;">${booking.location.address}</td>
                  </tr>
                </table>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/bookings/${booking._id}" 
                   style="background: ${statusColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Booking Details
                </a>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #666; font-size: 14px; text-align: center;">
                  ${status === 'completed' ? 
                    'Your service is now confirmed. The provider will contact you to coordinate the service.' :
                    'If you have any questions about this payment, please contact our support team.'
                  }
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(emailContent);
      logger.info(`Payment confirmation sent for booking ${booking.bookingNumber}`);
    } catch (error) {
      logger.error('Failed to send payment confirmation:', error);
    }
  }

  // New methods for Payment Request workflow

  async sendPaymentRequestToClient(booking, client, provider, paymentUrl) {
    try {
      const emailContent = {
        from: process.env.EMAIL_FROM || 'noreply@solutil.com',
        to: client.email,
        subject: `Payment Request - Service Completed 💰`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2196f3, #1976d2); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Service Completed - Payment Required 💰</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hi ${client.name || 'there'},</h2>
              <p style="color: #666; font-size: 16px;">
                Great news! <strong>${provider.name}</strong> has completed your service and is requesting payment.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h3 style="color: #2196f3; margin-top: 0;">Service Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking Number:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.bookingNumber || booking._id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Service:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${booking.service?.title || booking.serviceCategory}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Provider:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${provider.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Due:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #2196f3; font-weight: bold;">KES ${booking.pricing.totalAmount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Service Date:</strong></td>
                    <td style="padding: 8px 0;">${new Date(booking.scheduledDate).toLocaleDateString()}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="color: #1976d2; margin-top: 0;">🔒 Secure Payment</h3>
                <p style="color: #666; margin-bottom: 20px;">
                  Complete your payment using our secure Paystack payment system. Your payment is protected and the provider will receive their payout after confirmation.
                </p>
                <a href="${paymentUrl}" 
                   style="background: #2196f3; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                  💳 Pay Now - KES ${booking.pricing.totalAmount.toLocaleString()}
                </a>
              </div>
              
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #f57c00; text-align: center;">
                  <strong>⏰ Payment Link Valid for 24 hours</strong><br>
                  Please complete payment to release funds to your service provider.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/${booking._id}" 
                   style="background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                  View Booking Details
                </a>
                <a href="tel:${provider.phone || ''}" 
                   style="background: #ff9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Contact Provider
                </a>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #666; font-size: 14px; text-align: center;">
                  Questions? Contact our support team or reply to this email.<br>
                  Your payment is secure and processed through Paystack.
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(emailContent);
      logger.info(`Payment request sent to client for booking ${booking.bookingNumber || booking._id}`);
    } catch (error) {
      logger.error('Failed to send payment request to client:', error);
    }
  }

  async sendPaymentRequestConfirmationToProvider(booking, provider, client) {
    try {
      const emailContent = {
        from: process.env.EMAIL_FROM || 'noreply@solutil.com',
        to: provider.email,
        subject: `Payment Request Sent - Booking ${booking.bookingNumber || booking._id} ✅`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4caf50, #2e7d32); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Payment Request Sent! ✅</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hi ${provider.name || 'Provider'},</h2>
              <p style="color: #666; font-size: 16px;">
                Your payment request has been successfully sent to <strong>${client.name}</strong>. They will receive a secure payment link via email.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <h3 style="color: #4caf50; margin-top: 0;">Request Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Requested:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #4caf50; font-weight: bold;">KES ${booking.pricing.totalAmount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Client:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${client.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Client Email:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${client.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Request Sent:</strong></td>
                    <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <h3 style="color: #2e7d32; margin-top: 0;">What happens next?</h3>
                <div style="text-align: left; color: #2e7d32;">
                  <p>📧 <strong>Client receives secure payment link</strong></p>
                  <p>💳 <strong>Client completes payment via Paystack</strong></p>
                  <p>✅ <strong>Payment verified automatically</strong></p>
                  <p>💰 <strong>You receive payout to your bank account</strong></p>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/provider/bookings" 
                   style="background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View My Bookings
                </a>
              </div>
              
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                <p style="color: #666; font-size: 14px; text-align: center;">
                  You'll receive another notification once the client completes payment.<br>
                  Funds will be transferred to your registered bank account.
                </p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(emailContent);
      logger.info(`Payment request confirmation sent to provider for booking ${booking.bookingNumber || booking._id}`);
    } catch (error) {
      logger.error('Failed to send payment request confirmation to provider:', error);
    }
  }

  async sendPaymentCompletedNotifications(booking, client, provider, paymentDetails) {
    try {
      // Send to client
      await this.sendPaymentCompletedToClient(booking, client, paymentDetails);
      // Send to provider  
      await this.sendPaymentCompletedToProvider(booking, provider, client, paymentDetails);
      
      logger.info(`Payment completed notifications sent for booking ${booking.bookingNumber || booking._id}`);
    } catch (error) {
      logger.error('Failed to send payment completed notifications:', error);
    }
  }

  async sendPaymentCompletedToClient(booking, client, paymentDetails) {
    const emailContent = {
      from: process.env.EMAIL_FROM || 'noreply@solutil.com',
      to: client.email,
      subject: `Payment Successful - Thank You! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4caf50, #2e7d32); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Payment Successful! 🎉</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Hi ${client.name},</h2>
            <p style="color: #666; font-size: 16px;">
              Thank you! Your payment has been processed successfully. The service provider will receive their payout shortly.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #4caf50; margin-top: 0;">Payment Confirmation</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #4caf50; font-weight: bold;">KES ${paymentDetails.amount / 100}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Transaction Ref:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${paymentDetails.reference}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Payment Date:</strong></td>
                  <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/${booking._id}?tab=review" 
                 style="background: #ff9800; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                ⭐ Rate This Service
              </a>
            </div>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(emailContent);
  }

  async sendPaymentCompletedToProvider(booking, provider, client, paymentDetails) {
    const emailContent = {
      from: process.env.EMAIL_FROM || 'noreply@solutil.com',
      to: provider.email,
      subject: `Payment Received - Payout Processing 💰`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4caf50, #2e7d32); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Payment Received! 💰</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Hi ${provider.name},</h2>
            <p style="color: #666; font-size: 16px;">
              Excellent! ${client.name} has completed payment for your service. Your payout is being processed.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #4caf50; margin-top: 0;">Payment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #4caf50; font-weight: bold;">KES ${paymentDetails.amount / 100}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Client:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${client.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Payout Status:</strong></td>
                  <td style="padding: 8px 0; color: #ff9800;">Processing</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #2e7d32;">
                💰 <strong>Payout will be sent to your registered bank account within 1-2 business days.</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(emailContent);
  }

  async sendPayoutCompletedNotification(payout) {
    try {
      const provider = await require('../models/User').findById(payout.provider);
      
      const emailContent = {
        from: process.env.EMAIL_FROM || 'noreply@solutil.com',
        to: provider.email,
        subject: `Payout Completed - KES ${payout.amounts.payoutAmount}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4caf50, #66bb6a); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Payout Completed! 💰</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hi ${provider.name},</h2>
              <p style="color: #666; font-size: 16px;">
                Great news! Your payout has been successfully processed and sent to your bank account.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #4caf50; margin-top: 0;">Payout Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Service:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${payout.metadata.serviceTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${payout.metadata.bookingReference}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Total Service Amount:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">KES ${payout.amounts.totalAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Platform Fee (30%):</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">KES ${payout.amounts.commissionAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Your Payout:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #4caf50; font-size: 18px;"><strong>KES ${payout.amounts.payoutAmount}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Transfer ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${payout.paystack.transferCode}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Processed:</strong></td>
                    <td style="padding: 8px 0;">${new Date(payout.timeline.payoutCompleted).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; color: #2e7d32;">
                  💳 <strong>The money should appear in your bank account within 1-2 business days.</strong>
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666;">Keep up the excellent work! 🌟</p>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(emailContent);
      logger.info(`Payout completed notification sent to ${provider.email}`);
    } catch (error) {
      logger.error('Failed to send payout completed notification:', error);
      throw error;
    }
  }

  async sendPayoutFailedNotification(payout, reason) {
    try {
      const provider = await require('../models/User').findById(payout.provider);
      
      const emailContent = {
        from: process.env.EMAIL_FROM || 'noreply@solutil.com',
        to: provider.email,
        subject: `Payout Failed - Action Required`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f44336, #e57373); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Payout Failed ⚠️</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hi ${provider.name},</h2>
              <p style="color: #666; font-size: 16px;">
                We encountered an issue while processing your payout. Please review the details below and contact support if needed.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #f44336; margin-top: 0;">Payout Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Service:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${payout.metadata.serviceTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;">KES ${payout.amounts.payoutAmount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Failure Reason:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #f44336;">${reason}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Failed At:</strong></td>
                    <td style="padding: 8px 0;">${new Date(payout.timeline.payoutFailed).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; color: #856404;">
                  📞 <strong>Please contact support to resolve this issue and process your payout manually.</strong>
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:support@solutil.com" style="background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(emailContent);
      logger.info(`Payout failed notification sent to ${provider.email}`);
    } catch (error) {
      logger.error('Failed to send payout failed notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();