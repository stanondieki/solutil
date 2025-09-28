import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, adminSecret } = body

    // Simple admin secret for security (in production, use proper authentication)
    if (adminSecret !== 'make-admin-solutil-2024') {
      return NextResponse.json(
        { error: 'Invalid admin secret' },
        { status: 403 }
      )
    }

    // In a real app, you would update the user in your database
    // For now, return a mock success response
    console.log(`Making user ${email} an admin`)

    return NextResponse.json({
      success: true,
      message: `User ${email} has been made an admin`,
      instructions: 'The user can now login and will be redirected to admin panel'
    })

  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json(
      { error: 'Failed to make user admin' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if admin setup is needed
export async function GET() {
  return NextResponse.json({
    message: 'Admin setup endpoint',
    instructions: {
      step1: 'Run: cd backend && node create-admin.js',
      step2: 'Login with: admin@solutil.com / admin123',
      step3: 'Admin will auto-redirect to /admin panel'
    }
  })
}
