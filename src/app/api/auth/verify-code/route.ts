import { NextRequest, NextResponse } from 'next/server'
import { verifyCode } from '@/lib/verification'
import { sendWelcomeEmail } from '@/lib/email'
import { sendWelcomeSMS } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, code, email, phone, name } = body

    // Validate input
    if (!token || !code) {
      return NextResponse.json(
        { message: 'Token and verification code are required' },
        { status: 400 }
      )
    }

    // Verify the code
    const verificationResult = verifyCode(token, code)

    if (!verificationResult.success) {
      return NextResponse.json(
        { message: verificationResult.message },
        { status: 400 }
      )
    }

    // At this point, the user is verified
    // Get pending registration data to create complete user profile
    const pendingRegistration = {
      email: email || verificationResult.contact,
      phone: phone || verificationResult.contact,
      name: name || 'User'
    }

    // Send welcome message
    try {
      if (email) {
        await sendWelcomeEmail(email, name || 'User')
      }
      if (phone) {
        await sendWelcomeSMS(phone, name || 'User')
      }
    } catch (welcomeError) {
      console.error('Welcome message error:', welcomeError)
      // Don't fail verification if welcome message fails
    }

    // Generate a permanent auth token
    const authToken = `verified_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Create complete user object with verification flag
    const verifiedUser = {
      id: `user_${Date.now()}`,
      email: pendingRegistration.email,
      phone: pendingRegistration.phone,
      name: pendingRegistration.name,
      verified: true,
      verifiedAt: new Date().toISOString(),
      isAuthenticated: true,
      registrationTime: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Verification successful! Welcome to Solutil!',
      verified: true,
      authToken,
      user: verifiedUser
    })

  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    )
  }
}
