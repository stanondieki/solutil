// Enhanced email utility with SendGrid support for better institutional email delivery
const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter based on environment and provider
const createTransporter = () => {
  const useRealSMTP = process.env.USE_REAL_SMTP === 'true';
  
  if (!useRealSMTP && process.env.NODE_ENV === 'development') {
    logger.info('📧 Using console transport for emails (development mode)');
    return nodemailer.createTransporter({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  // Check if SendGrid is configured (better for institutional emails)
  if (process.env.SENDGRID_API_KEY) {
    logger.info('📧 Using SendGrid for enhanced email delivery');
    return nodemailer.createTransporter({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Check if AWS SES is configured
  if (process.env.AWS_SES_ACCESS_KEY && process.env.AWS_SES_SECRET_KEY) {
    logger.info('📧 Using AWS SES for enhanced email delivery');
    return nodemailer.createTransporter({
      host: process.env.AWS_SES_HOST || 'email-smtp.us-east-1.amazonaws.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.AWS_SES_ACCESS_KEY,
        pass: process.env.AWS_SES_SECRET_KEY
      }
    });
  }

  // Fallback to Gmail with enhanced configuration for institutional emails
  const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const smtpPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  
  logger.info('📧 Using Gmail SMTP with enhanced institutional email configuration');
  return nodemailer.createTransporter({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false
    },
    // Enhanced configuration for institutional emails
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10
  });
};

// Enhanced email templates with better institutional compatibility
const emailTemplates = {
  welcome: {
    subject: 'Welcome to SolUtil - Email Verification Required',
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SolUtil Platform</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e9ecef;">
          
          <!-- Header -->
          <div style="background-color: #ea580c; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">
              SolUtil Platform
            </h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">
              Professional Services Platform
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 22px;">
              Welcome, ${data.name || 'User'}!
            </h2>
            
            <p style="color: #555555; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
              Thank you for joining SolUtil Platform. To ensure the security of your account and complete your registration, 
              please verify your email address by clicking the button below.
            </p>
            
            <!-- Verification Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${data.verificationURL}" 
                 style="background-color: #ea580c; color: #ffffff; padding: 16px 32px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px; 
                        border: none; cursor: pointer;">
                Verify Email Address
              </a>
            </div>
            
            <!-- Alternative Link -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">
                Button not working? Copy and paste this link:
              </p>
              <p style="color: #ea580c; margin: 0; word-break: break-all; font-size: 14px;">
                ${data.verificationURL}
              </p>
            </div>
            
            <!-- Important Information -->
            <div style="border-left: 4px solid #ea580c; padding: 15px 20px; margin: 25px 0; background-color: #fff7ed;">
              <p style="color: #555555; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Important:</strong> This verification link will expire in 24 hours for security reasons. 
                If you didn't create an account with SolUtil Platform, please ignore this email.
              </p>
            </div>
            
            <!-- Support Information -->
            <p style="color: #666666; font-size: 14px; line-height: 1.5; margin-top: 30px;">
              Need help? Contact our support team at 
              <a href="mailto:infosolu31@gmail.com" style="color: #ea580c; text-decoration: none;">
                infosolu31@gmail.com
              </a>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #666666; font-size: 13px; margin: 0; line-height: 1.4;">
              © 2025 SolUtil Platform. All rights reserved.<br>
              Professional Services Marketplace
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `,
    text: (data) => `
Welcome to SolUtil Platform!

Dear ${data.name || 'User'},

Thank you for joining SolUtil Platform. To complete your registration and secure your account, please verify your email address.

Verification Link: ${data.verificationURL}

This link will expire in 24 hours for security reasons.

If you didn't create an account with SolUtil Platform, please ignore this email.

Need help? Contact our support team at infosolu31@gmail.com

Best regards,
SolUtil Platform Team

© 2025 SolUtil Platform. All rights reserved.
    `
  },
  
  emailVerification: {
    subject: 'Verify Your Email - SolUtil Platform',
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - SolUtil</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <div style="background-color: #ea580c; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Email Verification</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0;">SolUtil Platform</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #333333; margin: 0 0 20px 0;">Hello ${data.name || 'User'},</h2>
            
            <p style="color: #666666; line-height: 1.6; margin-bottom: 25px;">
              Please verify your email address to activate your SolUtil account. Click the button below to complete verification.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.verificationURL}" 
                 style="background-color: #ea580c; color: #ffffff; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666666; font-size: 14px; line-height: 1.4;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${data.verificationURL}" style="color: #ea580c; word-break: break-all;">
                ${data.verificationURL}
              </a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
            
            <p style="color: #999999; font-size: 12px; line-height: 1.4;">
              This verification link expires in 24 hours. If you didn't create a SolUtil account, please ignore this email.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `,
    text: (data) => `
Email Verification - SolUtil Platform

Hello ${data.name || 'User'},

Please verify your email address to activate your SolUtil account.

Verification Link: ${data.verificationURL}

This link expires in 24 hours. If you didn't create a SolUtil account, please ignore this email.

SolUtil Platform Team
    `
  }
};

// Enhanced send email function with institutional email optimizations
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    if (!options.email) {
      throw new Error('Email address is required');
    }

    // Enhanced from configuration for better institutional delivery
    const fromEmail = process.env.EMAIL_FROM || 
                     process.env.SENDGRID_FROM_EMAIL || 
                     process.env.AWS_SES_FROM_EMAIL || 
                     process.env.EMAIL_USER;
    const fromName = process.env.EMAIL_FROM_NAME || 'SolUtil Platform';
    
    let mailOptions = {
      from: {
        name: fromName,
        address: fromEmail
      },
      to: options.email,
      subject: options.subject || 'Notification from SolUtil Platform',
      // Enhanced headers for better institutional delivery
      headers: {
        'List-Unsubscribe': `<mailto:${fromEmail}>`,
        'X-Entity-Ref-ID': 'solutil-platform',
        'X-Auto-Response-Suppress': 'All',
        'Precedence': 'bulk',
        'X-Priority': '3',
        'X-Mailer': 'SolUtil-Platform-v2',
        'Reply-To': fromEmail
      }
    };

    // Use template if provided
    if (options.template && emailTemplates[options.template]) {
      const template = emailTemplates[options.template];
      mailOptions.subject = template.subject;
      mailOptions.html = template.html(options.data || {});
      mailOptions.text = template.text ? template.text(options.data || {}) : undefined;
    } else {
      if (options.html) {
        mailOptions.html = options.html;
      } else if (options.text) {
        mailOptions.text = options.text;
      } else {
        throw new Error('Email content (html, text, or template) is required');
      }
    }

    // Send email
    const result = await transporter.sendMail(mailOptions);

    const useRealSMTP = process.env.USE_REAL_SMTP === 'true';
    
    if (!useRealSMTP && process.env.NODE_ENV === 'development') {
      logger.info('📧 Email sent (Console Transport)', {
        to: options.email,
        subject: mailOptions.subject,
        template: options.template || 'custom'
      });
    } else {
      logger.info('✅ Email sent successfully via enhanced SMTP', {
        to: options.email,
        subject: mailOptions.subject,
        messageId: result.messageId,
        response: result.response,
        service: process.env.SENDGRID_API_KEY ? 'SendGrid' : 
                process.env.AWS_SES_ACCESS_KEY ? 'AWS SES' : 'Gmail Enhanced'
      });
    }

    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };

  } catch (error) {
    logger.error('❌ Failed to send email with enhanced service:', {
      error: error.message,
      to: options.email,
      subject: options.subject,
      template: options.template
    });
    
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// All other existing functions remain the same
const sendWelcomeEmail = async (email, name, verificationURL) => {
  return sendEmail({
    email,
    template: 'welcome',
    data: { name, verificationURL }
  });
};

const sendVerificationEmail = async (email, name, verificationURL) => {
  return sendEmail({
    email,
    template: 'emailVerification',
    data: { name, verificationURL }
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  // ... other existing exports
};