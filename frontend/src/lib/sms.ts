// SMS service for sending verification codes
// Using Africa's Talking or similar SMS service

interface SMSConfig {
  apiKey: string
  username: string
}

/**
 * Send SMS verification code
 */
export async function sendVerificationSMS(
  phone: string, 
  code: string
): Promise<{ success: boolean; message: string }> {
  try {
    // For demo purposes, we'll log to console
    // In production, integrate with SMS provider like:
    // - Africa's Talking (popular in Kenya)
    // - Twilio
    // - AWS SNS
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`
📱 VERIFICATION SMS
To: ${phone}
Message: Your Solutil verification code is: ${code}. Valid for 15 minutes. Don't share this code.
      `)
      return { success: true, message: 'SMS sent successfully (development mode)' }
    }
    
    // Example integration with Africa's Talking
    const smsConfig: SMSConfig = {
      apiKey: process.env.AFRICAS_TALKING_API_KEY || '',
      username: process.env.AFRICAS_TALKING_USERNAME || 'sandbox'
    }
    
    if (!smsConfig.apiKey) {
      throw new Error('SMS API key not configured')
    }
    
    // Mock API call structure (replace with actual SMS service)
    const smsData = {
      to: phone,
      message: `Your Solutil verification code is: ${code}. Valid for 15 minutes. Don't share this code.`,
      from: process.env.SMS_SENDER_ID || 'SOLUTIL'
    }
    
    // Example API call structure:
    /*
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': smsConfig.apiKey
      },
      body: new URLSearchParams({
        username: smsConfig.username,
        to: phone,
        message: smsData.message,
        from: smsData.from
      })
    })
    
    const result = await response.json()
    
    if (result.SMSMessageData.Recipients[0].status === 'Success') {
      return { success: true, message: 'SMS sent successfully' }
    } else {
      throw new Error(result.SMSMessageData.Recipients[0].status)
    }
    */
    
    // For now, return success for demo
    return { success: true, message: 'SMS sent successfully (demo mode)' }
    
  } catch (error) {
    console.error('SMS sending error:', error)
    return { success: false, message: 'Failed to send verification SMS' }
  }
}

/**
 * Send welcome SMS after successful verification
 */
export async function sendWelcomeSMS(
  phone: string, 
  name: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`
🎉 WELCOME SMS
To: ${phone}
Message: Welcome to Solutil, ${name}! Your account is now verified. Start booking services today!
      `)
      return { success: true, message: 'Welcome SMS sent (development mode)' }
    }
    
    const welcomeMessage = `Welcome to Solutil, ${name}! Your account is now verified. Start booking services today! Download our app for the best experience.`
    
    // Similar API structure as verification SMS
    // In production, implement actual SMS sending
    
    return { success: true, message: 'Welcome SMS sent successfully (demo mode)' }
    
  } catch (error) {
    console.error('Welcome SMS error:', error)
    return { success: false, message: 'Failed to send welcome SMS' }
  }
}

/**
 * Validate phone number format (Kenya format)
 */
export function validatePhoneNumber(phone: string): { 
  valid: boolean; 
  formatted?: string; 
  message: string 
} {
  // Remove any spaces, dashes, or other characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // Kenya phone number patterns
  const patterns = [
    /^(\+254|254|0)(7[0-9]{8})$/, // Safaricom, Airtel: 07xx xxx xxx
    /^(\+254|254|0)(1[0-9]{8})$/, // Landline: 01x xxx xxxx
  ]
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern)
    if (match) {
      // Format to international format
      const localNumber = match[2]
      const formatted = `+254${localNumber.substring(1)}`
      return {
        valid: true,
        formatted,
        message: 'Valid phone number'
      }
    }
  }
  
  // Check if it's already in international format
  if (/^\+254[17][0-9]{8}$/.test(cleaned)) {
    return {
      valid: true,
      formatted: cleaned,
      message: 'Valid phone number'
    }
  }
  
  return {
    valid: false,
    message: 'Please enter a valid Kenyan phone number (e.g., 0712345678)'
  }
}
