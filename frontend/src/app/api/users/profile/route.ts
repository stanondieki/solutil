import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Proxy to backend API instead of doing JWT verification here
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json(
        { status: 'error', message: 'No token provided' },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
    
    const response = await fetch(`${backendUrl}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });

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