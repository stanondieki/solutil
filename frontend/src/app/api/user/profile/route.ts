import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Mock user data - replace with database calls in production
const mockUser = {
  id: '1',
  name: 'John Provider',
  email: 'provider@example.com',
  phone: '+254700000000',
  profilePicture: '',
  bio: 'Experienced service provider with 5+ years in home services',
  location: 'Nairobi, Kenya',
  role: 'provider',
  isVerified: true,
  rating: 4.8,
  totalBookings: 247,
  completedBookings: 234
};

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: 'error', message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authorization.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789';
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (!decoded.id) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Return user profile data
    return NextResponse.json({
      status: 'success',
      data: {
        user: mockUser
      }
    });

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: 'error', message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authorization.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_production_key_123456789';
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (!decoded.id) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { profilePicture, bio, phone, location, hourlyRate } = body;

    // For now, we'll just return success
    // In production, you would update the user in your database
    console.log(`Updating profile for user ${decoded.id}:`, {
      profilePicture,
      bio,
      phone,
      location,
      hourlyRate
    });

    return NextResponse.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        profilePicture,
        bio,
        phone,
        location,
        hourlyRate
      }
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}