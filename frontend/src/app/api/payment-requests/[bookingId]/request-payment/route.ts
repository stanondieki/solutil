import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Extract the booking ID from the URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const bookingId = pathParts[pathParts.length - 2]; // Get bookingId from path

    // Get the authorization header from the request
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { status: 'fail', message: 'Authorization required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
    const backendResponse = await fetch(`${backendUrl}/api/payment-requests/${bookingId}/request-payment`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Payment request error:', error);
    return NextResponse.json(
      { status: 'fail', message: 'Internal server error' },
      { status: 500 }
    );
  }
}