const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter based on environment
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // For development, log emails to console
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  } else {
    // For production, use actual SMTP
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
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
  }
};

// Main send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    let mailOptions = {
      from: process.env.SMTP_USER || 'noreply@solutil.com',
      to: options.email,
      subject: options.subject
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
      }
    }

    // Send email
    const result = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === 'development') {
      // Log email content in development
      logger.info('📧 Email sent (Development Mode)', {
        to: options.email,
        subject: mailOptions.subject,
        html: mailOptions.html ? 'HTML content included' : 'No HTML',
        text: mailOptions.text ? 'Text content included' : 'No text'
      });
      
      // Log the actual HTML content for debugging
      if (mailOptions.html) {
        console.log('\n📧 EMAIL CONTENT:');
        console.log('To:', options.email);
        console.log('Subject:', mailOptions.subject);
        console.log('HTML:', mailOptions.html);
        console.log('---\n');
      }
    } else {
      logger.info('Email sent successfully', {
        to: options.email,
        subject: mailOptions.subject,
        messageId: result.messageId
      });
    }

    return result;
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw new Error('Email sending failed');
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

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendBookingConfirmationEmail
};
