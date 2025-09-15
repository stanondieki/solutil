import { NextRequest, NextResponse } from 'next/server'
import { 
  getVerificationDetails,
  generateVerificationCode, 
  storeVerificationCode 
} from '@/lib/verification'
import { sendVerificationEmail } from '@/lib/email'
import { sendVerificationSMS } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Get verification details
    const details = getVerificationDetails(token)
    
    if (!details) {
      return NextResponse.json(
        { message: 'Invalid or expired verification session' },
        { status: 400 }
      )
    }

    // Generate new code
    const newCode = generateVerificationCode()
    
    // Store new code with same token
    storeVerificationCode(
      token,
      newCode,
      details.type,
      details.contact
    )

    // Send new verification code
    let sendResult
    if (details.type === 'email') {
      sendResult = await sendVerificationEmail(details.contact, newCode)
    } else {
      sendResult = await sendVerificationSMS(details.contact, newCode)
    }

    if (!sendResult.success) {
      return NextResponse.json(
        { message: sendResult.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `New verification code sent to your ${details.type === 'email' ? 'email' : 'phone'}`,
      expiresIn: 900 // 15 minutes in seconds
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { message: 'Failed to resend verification code' },
      { status: 500 }
    )
  }
}
