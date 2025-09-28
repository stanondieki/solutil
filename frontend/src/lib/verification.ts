// Verification utilities for email and SMS codes
import crypto from 'crypto'

export interface VerificationCode {
  code: string
  email?: string
  phone?: string
  type: 'email' | 'sms'
  expiresAt: Date
  attempts: number
  createdAt: Date
}

// In-memory storage for demo (use Redis or database in production)
const verificationCodes = new Map<string, VerificationCode>()

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Generate a secure random token for verification lookup
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Store verification code with expiration (15 minutes)
 */
export function storeVerificationCode(
  token: string,
  code: string,
  type: 'email' | 'sms',
  contact: string
): void {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  
  verificationCodes.set(token, {
    code,
    type,
    ...(type === 'email' ? { email: contact } : { phone: contact }),
    expiresAt,
    attempts: 0,
    createdAt: new Date()
  })
}

/**
 * Verify the code and return result
 */
export function verifyCode(token: string, inputCode: string): {
  success: boolean
  message: string
  contact?: string
} {
  const storedCode = verificationCodes.get(token)
  
  if (!storedCode) {
    return { success: false, message: 'Invalid or expired verification token' }
  }
  
  // Check if expired
  if (new Date() > storedCode.expiresAt) {
    verificationCodes.delete(token)
    return { success: false, message: 'Verification code has expired' }
  }
  
  // Check attempts (max 3)
  if (storedCode.attempts >= 3) {
    verificationCodes.delete(token)
    return { success: false, message: 'Too many failed attempts. Please request a new code.' }
  }
  
  // Increment attempts
  storedCode.attempts++
  
  // Verify code
  if (storedCode.code !== inputCode) {
    return { success: false, message: `Invalid code. ${3 - storedCode.attempts} attempts remaining.` }
  }
  
  // Success - remove the code
  const contact = storedCode.email || storedCode.phone
  verificationCodes.delete(token)
  
  return { 
    success: true, 
    message: 'Verification successful',
    contact 
  }
}

/**
 * Check if a verification code exists and is valid
 */
export function isVerificationTokenValid(token: string): boolean {
  const storedCode = verificationCodes.get(token)
  
  if (!storedCode) return false
  if (new Date() > storedCode.expiresAt) {
    verificationCodes.delete(token)
    return false
  }
  
  return true
}

/**
 * Get verification details (for resend functionality)
 */
export function getVerificationDetails(token: string): {
  type: 'email' | 'sms'
  contact: string
  expiresAt: Date
} | null {
  const storedCode = verificationCodes.get(token)
  
  if (!storedCode || new Date() > storedCode.expiresAt) {
    return null
  }
  
  return {
    type: storedCode.type,
    contact: storedCode.email || storedCode.phone || '',
    expiresAt: storedCode.expiresAt
  }
}

/**
 * Clean up expired codes (run periodically)
 */
export function cleanupExpiredCodes(): void {
  const now = new Date()
  
  for (const [token, code] of verificationCodes.entries()) {
    if (now > code.expiresAt) {
      verificationCodes.delete(token)
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(cleanupExpiredCodes, 5 * 60 * 1000)
}
