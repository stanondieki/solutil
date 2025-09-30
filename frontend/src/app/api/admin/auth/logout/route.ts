import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({
      status: 'success',
      message: 'Admin logged out successfully'
    })

    // Clear the admin token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}