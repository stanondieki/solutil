'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyPage() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes
  const [canResend, setCanResend] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  const token = searchParams.get('token')
  const type = searchParams.get('type') || 'email'
  const contact = searchParams.get('contact') || ''

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    
    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerify(newCode.join(''))
    }
    
    if (error) setError('')
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('')
    
    if (codeToVerify.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    if (!token) {
      setError('Invalid verification session')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          code: codeToVerify,
          email: type === 'email' ? contact : undefined,
          phone: type === 'sms' ? contact : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess('Verification successful! Redirecting to dashboard...')
        
        // Store verified user data and auth token
        localStorage.setItem('authToken', data.authToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Clear pending registration data - user is now fully verified
        localStorage.removeItem('pendingRegistration')
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(data.message || 'Verification failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!token || !canResend) return

    setResendLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTimeLeft(900) // Reset timer
        setCanResend(false)
        setSuccess('New verification code sent!')
        setCode(['', '', '', '', '', '']) // Clear current code
        inputRefs.current[0]?.focus()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to resend code')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Invalid Verification Link</h1>
          <p className="text-gray-400 mb-6">This verification link is invalid or has expired.</p>
          <Link href="/auth/register" className="text-orange-500 hover:text-orange-400">
            Return to Registration
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center mb-6"
          >
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>
          <h2 className="text-3xl font-bold text-white">Verify Your Account</h2>
          <p className="mt-2 text-gray-400">
            Enter the 6-digit code sent to your {type === 'email' ? 'email' : 'phone'}
          </p>
          <p className="text-orange-500 font-medium">{contact}</p>
        </div>

        {/* Verification Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 rounded-lg shadow-xl p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-md mb-6"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-md mb-6"
            >
              {success}
            </motion.div>
          )}

          {/* Code Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                Verification Code
              </label>
              <div className="flex justify-center space-x-3" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                {timeLeft > 0 ? (
                  <>Code expires in <span className="text-orange-500 font-medium">{formatTime(timeLeft)}</span></>
                ) : (
                  <span className="text-red-400">Code has expired</span>
                )}
              </p>
            </div>

            {/* Manual Verify Button */}
            <button
              onClick={() => handleVerify()}
              disabled={loading || code.join('').length !== 6}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            {/* Resend Button */}
            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={!canResend || resendLoading}
                className="text-sm text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Sending...' : canResend ? 'Resend Code' : 'Resend available after expiry'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/auth/register" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
            ← Back to Registration
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
