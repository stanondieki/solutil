import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // In a real app, you would:
    // 1. Check user credentials against database
    // 2. Verify password hash
    // 3. Return user data if valid

    // For demo purposes, accept any email/password combination
    // In production, implement proper authentication
    if (email && password.length >= 6) {
      const authToken = `login_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      const user = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        verified: true, // Existing users are considered verified
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        authToken,
        user
      })
    } else {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    )
  }
}
