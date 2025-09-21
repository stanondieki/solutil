import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cookies = request.headers.get('cookie')

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
        ...(cookies && { 'Cookie': cookies })
      }
    })

    const data = await response.json()

    if (response.ok) {
      // Forward any Set-Cookie headers from the backend (for clearing cookies)
      const backendResponse = NextResponse.json(data, { status: 200 })
      
      const setCookieHeaders = response.headers.get('set-cookie')
      if (setCookieHeaders) {
        backendResponse.headers.set('Set-Cookie', setCookieHeaders)
      }
      
      return backendResponse
    } else {
      return NextResponse.json(
        { message: data.message || 'Logout failed' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
