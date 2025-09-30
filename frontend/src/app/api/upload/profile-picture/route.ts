import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authorization = request.headers.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: 'error', message: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const image = formData.get('profilePicture') as File;

    if (!image) {
      return NextResponse.json(
        { status: 'error', message: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { status: 'error', message: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { status: 'error', message: 'Image size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Forward to backend
    const backendFormData = new FormData();
    backendFormData.append('profilePicture', image);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
    const response = await fetch(`${backendUrl}/api/provider/profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': authorization
      },
      body: backendFormData
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: data.message || 'Upload failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Profile picture upload error:', error);
    
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}