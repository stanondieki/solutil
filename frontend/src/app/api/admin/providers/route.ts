import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const backendParams = new URLSearchParams()
    
    // Add query parameters
    searchParams.forEach((value, key) => {
      backendParams.append(key, value)
    })

    const response = await fetch(`${backendUrl}/api/admin/users?userType=provider&${backendParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      }
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data, { status: 200 })
    } else {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch providers' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Admin providers API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}