// Email service for sending verification codes
// Server-side only - use in API routes

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Create transporter (configure with your email provider)
const createTransporter = () => {
  // For development, you can use services like:
  // - Gmail (with app passwords)
  // - SendGrid
  // - Mailgun
  // - Or use a service like Ethereal for testing
  
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  }
  
  // Dynamic import for server-side only
  const nodemailer = require('nodemailer')
  return nodemailer.createTransporter(config)
}

/**
 * Send verification email with code
 */
export async function sendVerificationEmail(
  email: string, 
  code: string, 
  name?: string
): Promise<{ success: boolean; message: string }> {
  try {
    // For demo purposes, we'll log to console
    // In production, replace this with actual email sending
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`
🔐 VERIFICATION EMAIL
To: ${email}
Subject: Verify Your Solutil Account
Code: ${code}
      `)
      return { success: true, message: 'Email sent successfully (development mode)' }
    }
    
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Solutil" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Solutil Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Account</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #A56000; }
            .code-box { background: #A56000; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
            .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SOLUTIL</div>
              <h1>Verify Your Account</h1>
            </div>
            
            <p>Hello${name ? ` ${name}` : ''},</p>
            
            <p>Thank you for signing up with Solutil! To complete your registration and access your dashboard, please verify your email address using the code below:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This code will expire in 15 minutes</li>
              <li>You have 3 attempts to enter the correct code</li>
              <li>If you didn't request this verification, please ignore this email</li>
            </ul>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
              <li>Browse and book services</li>
              <li>Manage your bookings</li>
              <li>Connect with service providers</li>
              <li>Access your personalized dashboard</li>
            </ul>
            
            <div class="footer">
              <p>This is an automated message from Solutil. Please do not reply to this email.</p>
              <p>If you need help, contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
    
    await transporter.sendMail(mailOptions)
    
    return { success: true, message: 'Verification email sent successfully' }
    
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, message: 'Failed to send verification email' }
  }
}

/**
 * Send welcome email after successful verification
 */
export async function sendWelcomeEmail(
  email: string, 
  name: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`
🎉 WELCOME EMAIL
To: ${email}
Subject: Welcome to Solutil!
      `)
      return { success: true, message: 'Welcome email sent (development mode)' }
    }
    
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Solutil" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Solutil! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Solutil</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #A56000; }
            .welcome-box { background: linear-gradient(135deg, #A56000, #C77A00); color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0; }
            .btn { display: inline-block; background: #A56000; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SOLUTIL</div>
            </div>
            
            <div class="welcome-box">
              <h1>Welcome to Solutil, ${name}! 🎉</h1>
              <p>Your account has been successfully verified!</p>
            </div>
            
            <p>You're now part of the Solutil community - Kenya's trusted platform for connecting with skilled service providers.</p>
            
            <p><strong>What you can do now:</strong></p>
            <ul>
              <li>🔍 Browse thousands of verified service providers</li>
              <li>📅 Book services instantly</li>
              <li>💬 Chat directly with providers</li>
              <li>⭐ Rate and review services</li>
              <li>📊 Track your booking history</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" class="btn">
                Access Your Dashboard
              </a>
            </div>
            
            <p><strong>Need help getting started?</strong><br>
            Check out our help center or contact our support team. We're here to help!</p>
            
            <div class="footer">
              <p>Thank you for choosing Solutil!</p>
              <p>The Solutil Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
    
    await transporter.sendMail(mailOptions)
    
    return { success: true, message: 'Welcome email sent successfully' }
    
  } catch (error) {
    console.error('Welcome email error:', error)
    return { success: false, message: 'Failed to send welcome email' }
  }
}
