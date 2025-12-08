import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the request to the backend
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/payment-requests/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { status: 'fail', message: 'Internal server error' },
      { status: 500 }
    );
  }
}