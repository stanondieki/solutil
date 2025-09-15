import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Demo admin credentials
    if (email === 'admin@solutil.com' && password === 'admin123') {
      const token = 'demo_admin_token_' + Date.now()
      
      return NextResponse.json({
        token,
        user: {
          id: 'admin',
          email: 'admin@solutil.com',
          name: 'Admin User',
          role: 'admin'
        }
      })
    } else {
      return NextResponse.json(
        { message: 'Invalid admin credentials' },
        { status: 400 }
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
