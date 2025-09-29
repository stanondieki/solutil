import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

    // Mock user profile data for now
    // In production, you would fetch from your database
    const userProfile = {
      id: decoded.userId,
      name: decoded.name || 'John Doe',
      email: decoded.email || 'john@example.com',
      phone: decoded.phone || '+254712345678',
      profilePicture: decoded.profilePicture || null,
      bio: 'Professional service provider committed to quality work.',
      location: 'Nairobi, Kenya',
      experience: '5+ years',
      hourlyRate: 1500,
      rating: 4.8,
      totalBookings: 247,
      completedBookings: 234,
      totalEarnings: 450000,
      role: decoded.role || 'provider'
    };

    return NextResponse.json({
      status: 'success',
      data: userProfile
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
    
    if (!decoded.userId) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { profilePicture, bio, phone, location, hourlyRate, fullName, skills, experience } = body;

    // For now, we'll just return success
    // In production, you would update the user in your database
    console.log(`Updating profile for user ${decoded.userId}:`, {
      profilePicture,
      bio,
      phone,
      location,
      hourlyRate,
      fullName,
      skills,
      experience
    });

    return NextResponse.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        profilePicture,
        bio,
        phone,
        location,
        hourlyRate,
        fullName,
        skills,
        experience
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