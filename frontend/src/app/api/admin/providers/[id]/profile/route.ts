import { NextRequest, NextResponse } from 'next/server';

// Add this log outside the function to see if the route file is even loaded
console.log('🚀 Profile API Route Module Loaded');

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🔄 PUT REQUEST RECEIVED - API Route Hit');
  console.error('🔄 PUT REQUEST RECEIVED - API Route Hit'); // Also log as error to make it more visible
  
  try {
    const { id } = await params;
    console.log('🔄 Provider profile update request for ID:', id);
    
    const body = await request.json();
    console.log('📝 Update data received:', JSON.stringify(body, null, 2));
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return NextResponse.json(
        { status: 'error', message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
    console.log('🌐 Forwarding to backend:', `${backendUrl}/api/admin/providers/${id}/profile`);
    
    const backendResponse = await fetch(`${backendUrl}/api/admin/providers/${id}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body),
    });

    console.log('📡 Backend response status:', backendResponse.status);
    console.log('📡 Backend response headers:', Object.fromEntries(backendResponse.headers.entries()));
    
    let data;
    try {
      data = await backendResponse.json();
      console.log('📥 Backend response data:', JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.error('❌ Failed to parse backend response as JSON:', jsonError);
      const textResponse = await backendResponse.text();
      console.error('📄 Raw backend response:', textResponse);
      return NextResponse.json(
        { status: 'error', message: 'Backend returned invalid JSON response', details: textResponse },
        { status: 500 }
      );
    }

    if (!backendResponse.ok) {
      console.error('❌ Backend returned error:', data);
      return NextResponse.json(
        { status: 'error', message: data.message || 'Backend request failed', details: data },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Provider profile update successful');
    return NextResponse.json(data);
  } catch (error) {
    console.error('🔥 Provider profile update proxy error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update provider profile', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}