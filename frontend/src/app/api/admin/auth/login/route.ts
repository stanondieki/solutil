import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the request to the backend auth endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      // Check if user is admin
      if (data.data?.user?.userType === 'admin') {
        return NextResponse.json({
          token: data.token,
          user: data.data.user
        })
      } else {
        return NextResponse.json(
          { message: 'Access denied. Admin privileges required.' },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { message: data.message || 'Login failed' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
