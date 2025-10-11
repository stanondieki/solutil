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
}

module.exports = new NotificationService();