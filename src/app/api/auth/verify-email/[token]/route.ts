import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/auth/verify-email/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data, { status: 200 })
    } else {
      return NextResponse.json(
        { message: data.message || 'Verification failed' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
