const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter based on environment and provider
const createTransporter = () => {
  // Check if we want to use real SMTP (even in development)
  const useRealSMTP = process.env.USE_REAL_SMTP === 'true';
  
  if (!useRealSMTP && process.env.NODE_ENV === 'development') {
    // For development without real SMTP, log emails to console
    logger.info('📧 Using console transport for emails (development mode)');
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  // Real SMTP configuration - supports multiple providers
  const smtpProvider = process.env.SMTP_PROVIDER || 'gmail';
  
  // Use existing EMAIL_* variables from your .env file
  const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const smtpHost = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const smtpPort = process.env.EMAIL_PORT || process.env.SMTP_PORT;
  
  let transportConfig = {
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  };

  switch (smtpProvider.toLowerCase()) {
    case 'gmail':
      transportConfig = {
        ...transportConfig,
        service: 'gmail',
        host: smtpHost || 'smtp.gmail.com',
        port: parseInt(smtpPort) || 587,
        secure: false,
        auth: {
          user: smtpUser, // Gmail address
          pass: smtpPass  // App Password (not regular password)
        }
      };
      break;
      
    case 'outlook':
    case 'hotmail':
      transportConfig = {
        ...transportConfig,
        service: 'hotmail',
        host: 'smtp.live.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };
      break;
      
    case 'yahoo':
      transportConfig = {
        ...transportConfig,
        service: 'yahoo',
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };
      break;
      
    case 'custom':
    default:
      transportConfig = {
        ...transportConfig,
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      };
      break;
  }

  logger.info(`📧 Configuring SMTP with provider: ${smtpProvider}`);
  return nodemailer.createTransport(transportConfig);
};

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to Solutil - Verify Your Email',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Solutil!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${data.name},</h2>
          <p>Thank you for joining Solutil, your trusted platform for professional services!</p>
          <p>To get started, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationURL}" 
               style="background: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${data.verificationURL}</p>
          <p>This link will expire in 24 hours for security reasons.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account with Solutil, please ignore this email.
          </p>
        </div>
      </div>
    `
  },
  
  passwordReset: {
    subject: 'Password Reset Request - Solutil',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${data.name},</h2>
          <p>You recently requested to reset your password for your Solutil account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetURL}" 
               style="background: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${data.resetURL}</p>
          <p><strong>This link will expire in 10 minutes</strong> for security reasons.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
      </div>
    `
  },
  
  emailVerification: {
    subject: 'Email Verification - Solutil',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Email Verification</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${data.name},</h2>
          <p>Please verify your email address to complete your account setup.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationURL}" 
               style="background: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${data.verificationURL}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      </div>
    `
  },
  
  bookingConfirmation: {
    subject: 'Booking Confirmation - Solutil',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${data.customerName},</h2>
          <p>Your booking has been confirmed! Here are the details:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Provider:</strong> ${data.providerName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Total Amount:</strong> ${data.amount}</p>
          </div>
          <p>You will receive updates about your booking via email and SMS.</p>
        </div>
      </div>
    `
  },

  // Provider notification when new booking is received
  newBookingProvider: {
    subject: 'New Booking Request - Solutil',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Booking Request!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${data.providerName},</h2>
          <p>You have received a new booking request for your service.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #ea580c; margin-top: 0;">Booking Details</h3>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Phone:</strong> ${data.customerPhone}</p>
            <p><strong>Date:</strong> ${data.bookingDate}</p>
            <p><strong>Time:</strong> ${data.bookingTime}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Estimated Price:</strong> KSh ${data.estimatedPrice}</p>
            ${data.specialInstructions ? `<p><strong>Special Instructions:</strong> ${data.specialInstructions}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardURL}" 
               style="background: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin-right: 10px;">
              View Dashboard
            </a>
            <a href="${data.acceptURL}" 
               style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Accept Booking
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Please respond to this booking request as soon as possible to maintain your customer satisfaction rating.
          </p>
        </div>
      </div>
    `
  },

  // Booking status update for customers
  bookingStatusUpdate: {
    subject: 'Booking Status Update - Solutil',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Booking Update</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${data.customerName},</h2>
          <p>Your booking status has been updated.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #ea580c; margin-top: 0;">Booking #${data.bookingNumber}</h3>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Provider:</strong> ${data.providerName}</p>
            <p><strong>New Status:</strong> <span style="color: ${data.statusColor}; font-weight: bold;">${data.newStatus}</span></p>
            <p><strong>Date:</strong> ${data.bookingDate}</p>
            <p><strong>Time:</strong> ${data.bookingTime}</p>
            ${data.providerNotes ? `<p><strong>Provider Notes:</strong> ${data.providerNotes}</p>` : ''}
          </div>

          ${data.showActions ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.bookingURL}" 
               style="background: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Booking Details
            </a>
          </div>
          ` : ''}
          
          <p style="color: #666; font-size: 14px;">
            Thank you for using Solutil. If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `
  },

  // Service creation confirmation for providers
  serviceCreated: {
    subject: 'Service Created Successfully - Solutil',
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Service Created!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${data.providerName},</h2>
          <p>Your new service has been created successfully and is now live on Solutil!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #ea580c; margin-top: 0;">${data.serviceTitle}</h3>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>Price:</strong> ${data.priceDisplay}</p>
            <p><strong>Duration:</strong> ${data.duration} minutes</p>
            <p><strong>Status:</strong> <span style="color: ${data.isActive ? '#22c55e' : '#ef4444'};">${data.isActive ? 'Active' : 'Inactive'}</span></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.serviceURL}" 
               style="background: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Service
            </a>
          </div>
          
          <p>Your service is now visible to customers and they can start booking your services!</p>
          <p style="color: #666; font-size: 14px;">
            Make sure to keep your service information updated and respond promptly to booking requests.
          </p>
        </div>
      </div>
    `
  }
};

// Test SMTP connection
const testSMTPConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    logger.error('❌ SMTP connection failed:', error.message);
    return false;
  }
};

// Main send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    // Validate required options
    if (!options.email) {
      throw new Error('Email address is required');
    }

    // Use existing EMAIL_FROM configuration from your .env file
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@solutil.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'SolUtil Service';
    
    let mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: options.email,
      subject: options.subject || 'Notification from Solutil'
    };

    // Use template if provided
    if (options.template && emailTemplates[options.template]) {
      const template = emailTemplates[options.template];
      mailOptions.subject = template.subject;
      mailOptions.html = template.html(options.data || {});
    } else {
      // Use custom HTML or text
      if (options.html) {
        mailOptions.html = options.html;
      } else if (options.text) {
        mailOptions.text = options.text;
      } else {
        throw new Error('Email content (html, text, or template) is required');
      }
    }

    // Add CC and BCC if provided
    if (options.cc) mailOptions.cc = options.cc;
    if (options.bcc) mailOptions.bcc = options.bcc;

    // Send email
    const result = await transporter.sendMail(mailOptions);

    const useRealSMTP = process.env.USE_REAL_SMTP === 'true';
    
    if (!useRealSMTP && process.env.NODE_ENV === 'development') {
      // Log email content in development mode (console transport)
      logger.info('📧 Email sent (Console Transport)', {
        to: options.email,
        subject: mailOptions.subject,
        template: options.template || 'custom'
      });
      
      // Log the actual content for debugging
      console.log('\n📧 EMAIL SENT (DEVELOPMENT MODE):');
      console.log('From:', mailOptions.from);
      console.log('To:', options.email);
      console.log('Subject:', mailOptions.subject);
      if (mailOptions.html) {
        console.log('HTML Content:', mailOptions.html);
      }
      if (mailOptions.text) {
        console.log('Text Content:', mailOptions.text);
      }
      console.log('---\n');
    } else {
      // Real SMTP sending
      logger.info('✅ Email sent successfully via SMTP', {
        to: options.email,
        subject: mailOptions.subject,
        messageId: result.messageId,
        response: result.response
      });
    }

    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };

  } catch (error) {
    logger.error('❌ Failed to send email:', {
      error: error.message,
      to: options.email,
      subject: options.subject,
      template: options.template
    });
    
    // Return error details for debugging
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Helper functions for specific email types
const sendWelcomeEmail = async (email, name, verificationURL) => {
  return sendEmail({
    email,
    template: 'welcome',
    data: { name, verificationURL }
  });
};

const sendPasswordResetEmail = async (email, name, resetURL) => {
  return sendEmail({
    email,
    template: 'passwordReset',
    data: { name, resetURL }
  });
};

const sendVerificationEmail = async (email, name, verificationURL) => {
  return sendEmail({
    email,
    template: 'emailVerification',
    data: { name, verificationURL }
  });
};

const sendBookingConfirmationEmail = async (email, bookingData) => {
  return sendEmail({
    email,
    template: 'bookingConfirmation',
    data: bookingData
  });
};

const sendNewBookingProviderEmail = async (email, bookingData) => {
  return sendEmail({
    email,
    template: 'newBookingProvider',
    data: bookingData
  });
};

const sendBookingStatusUpdateEmail = async (email, statusData) => {
  return sendEmail({
    email,
    template: 'bookingStatusUpdate',
    data: statusData
  });
};

const sendServiceCreatedEmail = async (email, serviceData) => {
  return sendEmail({
    email,
    template: 'serviceCreated',
    data: serviceData
  });
};

// Send service updated email
const sendServiceUpdatedEmail = async (email, serviceData) => {
  return sendEmail({
    email,
    template: 'serviceCreated', // Reuse the same template for now
    subject: 'Service Updated Successfully - Solutil',
    data: serviceData
  });
};

// Send test email to verify SMTP configuration
const sendTestEmail = async (email) => {
  return sendEmail({
    email,
    subject: 'SMTP Test Email - Solutil',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ea580c, #f97316); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">SMTP Test Email</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>🎉 Success!</h2>
          <p>If you're reading this email, your SMTP configuration is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Date: ${new Date().toLocaleString()}</li>
            <li>SMTP Provider: ${process.env.SMTP_PROVIDER || 'gmail'}</li>
            <li>From: ${process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@solutil.com'}</li>
            <li>Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}</li>
          </ul>
          <p>Your Solutil application can now send real emails!</p>
        </div>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendBookingConfirmationEmail,
  sendNewBookingProviderEmail,
  sendBookingStatusUpdateEmail,
  sendServiceCreatedEmail,
  sendServiceUpdatedEmail,
  sendTestEmail,
  testSMTPConnection
};
