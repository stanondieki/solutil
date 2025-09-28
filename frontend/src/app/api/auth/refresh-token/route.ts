import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Forward the request to the backend with cookies
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    // Get cookies from the request
    const cookies = request.headers.get('cookie')
    
    const response = await fetch(`${backendUrl}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { 'Cookie': cookies })
      }
    })

    const data = await response.json()

    if (response.ok) {
      // Forward any Set-Cookie headers from the backend
      const backendResponse = NextResponse.json(data, { status: 200 })
      
      const setCookieHeaders = response.headers.get('set-cookie')
      if (setCookieHeaders) {
        backendResponse.headers.set('Set-Cookie', setCookieHeaders)
      }
      
      return backendResponse
    } else {
      return NextResponse.json(
        { message: data.message || 'Token refresh failed' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
