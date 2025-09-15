import { NextRequest, NextResponse } from 'next/server'
import { 
  generateVerificationCode, 
  generateVerificationToken, 
  storeVerificationCode 
} from '@/lib/verification'
import { sendVerificationEmail } from '@/lib/email'
import { sendVerificationSMS, validatePhoneNumber } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phone, name, type = 'email' } = body

    // Validate input
    if (type === 'email' && !email) {
      return NextResponse.json(
        { message: 'Email is required for email verification' },
        { status: 400 }
      )
    }

    if (type === 'sms' && !phone) {
      return NextResponse.json(
        { message: 'Phone number is required for SMS verification' },
        { status: 400 }
      )
    }

    // Validate phone number format if SMS
    if (type === 'sms') {
      const phoneValidation = validatePhoneNumber(phone)
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { message: phoneValidation.message },
          { status: 400 }
        )
      }
    }

    // Generate code and token
    const code = generateVerificationCode()
    const token = generateVerificationToken()

    // Store the verification code
    storeVerificationCode(
      token,
      code,
      type,
      type === 'email' ? email : phone
    )

    // Send verification code
    let sendResult
    if (type === 'email') {
      sendResult = await sendVerificationEmail(email, code, name)
    } else {
      sendResult = await sendVerificationSMS(phone, code)
    }

    if (!sendResult.success) {
      return NextResponse.json(
        { message: sendResult.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to your ${type === 'email' ? 'email' : 'phone'}`,
      token, // Client needs this to verify the code
      expiresIn: 900 // 15 minutes in seconds
    })

  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { message: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}
