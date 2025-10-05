import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// MongoDB connection
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let client: any;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db('solutilconnect_db');
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { status: 'error', message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Check if it's a password reset token
      if (decoded.type !== 'password-reset') {
        return NextResponse.json(
          { status: 'error', message: 'Invalid token type' },
          { status: 400 }
        );
      }

      // Connect to database
      const db = await connectToDatabase();
      const usersCollection = db.collection('users');

      // Find user by ID
      const user = await usersCollection.findOne({ 
        _id: new (require('mongodb')).ObjectId(decoded.userId) 
      });
      
      if (!user) {
        return NextResponse.json(
          { status: 'error', message: 'User not found' },
          { status: 404 }
        );
      }

      // Optional: Check if token matches stored token (for added security)
      if (user.resetToken && user.resetToken !== token) {
        return NextResponse.json(
          { status: 'error', message: 'Invalid reset token' },
          { status: 400 }
        );
      }

      // Hash the new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Update user password and clear reset token
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          },
          $unset: {
            resetToken: 1,
            resetTokenExpiry: 1
          }
        }
      );

      return NextResponse.json(
        { 
          status: 'success', 
          message: 'Password reset successfully. You can now login with your new password.' 
        },
        { status: 200 }
      );

    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { status: 'error', message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}