import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/bookings route called')
  
  try {
    const body = await request.json()
    console.log('📋 Request body:', body)
    
    // Forward the request to the backend
    const response = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${body.authToken}` // Pass auth token
      },
      body: JSON.stringify(body.bookingData),
    })

    const data = await response.json()
    console.log('📥 Backend response:', data)

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || 'Failed to create booking' },
        { status: response.status }
      )
    }

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { message: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authToken = searchParams.get('authToken')
    
    // Forward the request to the backend
    const response = await fetch('http://localhost:5000/api/bookings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch bookings' },
        { status: response.status }
      )
    }

  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
