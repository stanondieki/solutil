import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// MongoDB connection (you might want to extract this to a utility file)
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

let client: any;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db('solutilconnect_db');
}

// Create nodemailer transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { status: 'error', message: 'Email is required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { status: 'error', message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check if user exists
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // For security reasons, don't reveal if email exists or not
      return NextResponse.json(
        { 
          status: 'success', 
          message: 'If an account with that email exists, we have sent a password reset link.' 
        },
        { status: 200 }
      );
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email,
        type: 'password-reset'
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in database (optional - for added security)
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 3600000) // 1 hour
        }
      }
    );

    // Create reset URL
    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    // Send email
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      try {
        const transporter = createTransporter();
        
        const mailOptions = {
          from: `"SoluTil Connect" <${SMTP_USER}>`,
          to: email,
          subject: 'Reset Your Password - SoluTil Connect',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Hello ${user.name || 'User'},</h2>
                
                <p>We received a request to reset your password for your SoluTil Connect account. If you didn't make this request, you can safely ignore this email.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 25px; 
                            font-weight: bold; 
                            display: inline-block; 
                            font-size: 16px;">
                    Reset My Password
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  <strong>This link will expire in 1 hour</strong> for security reasons.
                </p>
                
                <p style="color: #666; font-size: 14px;">
                  If the button doesn't work, you can copy and paste this link into your browser:<br>
                  <a href="${resetUrl}" style="color: #f97316; word-break: break-all;">${resetUrl}</a>
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                  This email was sent by SoluTil Connect. If you have any questions, please contact our support team.
                </p>
              </div>
            </body>
            </html>
          `
        };

        await transporter.sendMail(mailOptions);
        
        return NextResponse.json(
          { 
            status: 'success', 
            message: 'Password reset link sent to your email address.' 
          },
          { status: 200 }
        );
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        
        // Even if email fails, don't expose this to user for security
        return NextResponse.json(
          { 
            status: 'success', 
            message: 'If an account with that email exists, we have sent a password reset link.' 
          },
          { status: 200 }
        );
      }
    } else {
      console.error('SMTP configuration missing');
      
      // Log the reset token for development (remove in production)
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset URL: ${resetUrl}`);
      
      return NextResponse.json(
        { 
          status: 'success', 
          message: 'Password reset link sent to your email address.',
          // Only include this in development
          ...(process.env.NODE_ENV === 'development' && { 
            resetUrl,
            token: resetToken 
          })
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}