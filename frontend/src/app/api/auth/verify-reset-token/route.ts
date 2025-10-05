import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Check if it's a password reset token
      if (decoded.type !== 'password-reset') {
        return NextResponse.json(
          { valid: false, message: 'Invalid token type' },
          { status: 400 }
        );
      }

      // Token is valid
      return NextResponse.json(
        { valid: true, userId: decoded.userId, email: decoded.email },
        { status: 200 }
      );
    } catch (jwtError) {
      // Token is invalid or expired
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { valid: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}