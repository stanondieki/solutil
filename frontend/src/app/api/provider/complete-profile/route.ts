import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the request to your backend
    const backendResponse = await fetch('http://localhost:5000/api/providers/complete-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Provider profile completion error:', error)
    return NextResponse.json(
      { message: 'Failed to complete provider profile' },
      { status: 500 }
    )
  }
}
