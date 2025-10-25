import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json(
        { success: false, message: 'No credential provided' },
        { status: 400 }
      )
    }

    console.log('🔐 Frontend API: Received Google credential, forwarding to backend...')

    // Send the Google credential directly to our backend for verification
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    const response = await fetch(`${backendUrl}/api/oauth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credential
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Authentication failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: data.message,
      data: {
        user: data.user,
        token: data.token
      }
    })

  } catch (error) {
    console.error('Google authentication error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}