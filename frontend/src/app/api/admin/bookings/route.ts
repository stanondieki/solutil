import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    console.log('🔐 Admin bookings frontend API - Auth header:', authHeader ? 'Present' : 'Missing')

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
    console.log('🌐 Forwarding to backend:', `${backendUrl}/api/admin/bookings`)
    
    const response = await fetch(`${backendUrl}/api/admin/bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      }
    })

    console.log('📥 Backend response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    const data = await response.json()
    console.log('📋 Backend data:', {
      status: data.status,
      results: data.results,
      hasData: !!data.data,
      bookingsLength: data.data?.bookings?.length || 0
    })

    if (response.ok) {
      return NextResponse.json(data, { status: 200 })
    } else {
      console.error('❌ Backend error:', data)
      return NextResponse.json(
        { message: data.message || 'Failed to fetch bookings' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('💥 Admin bookings API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}