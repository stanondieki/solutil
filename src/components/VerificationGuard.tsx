'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email?: string
  phone?: string
  name: string
  verified: boolean
  authToken?: string
}

interface VerificationGuardProps {
  children: React.ReactNode
  requireVerification?: boolean
}

export default function VerificationGuard({ 
  children, 
  requireVerification = true 
}: VerificationGuardProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkVerificationStatus()
  }, [])

  const checkVerificationStatus = () => {
    try {
      // Check if user is authenticated and verified
      const userStr = localStorage.getItem('user')
      const authToken = localStorage.getItem('authToken')

      if (!userStr || !authToken) {
        // No user data, redirect to login
        if (requireVerification) {
          router.push('/auth/login')
          return
        }
      }

      const user: User = JSON.parse(userStr || '{}')

      // If user is already verified, allow access
      if (user.verified) {
        setIsVerified(true)
        setLoading(false)
        return
      }

      // Check if there's pending registration (new user flow)
      const pendingStr = localStorage.getItem('pendingRegistration')
      if (pendingStr && requireVerification) {
        // User has pending registration, redirect to verification
        setIsVerified(false)
        setLoading(false)
        showVerificationRequired()
        return
      }

      // If no pending registration and not verified, treat as regular user
      // This handles cases where verification data was cleared
      if (requireVerification && !user.verified) {
        // For existing users without verification flag, mark as verified
        // This is for backward compatibility
        const updatedUser = { ...user, verified: true }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setIsVerified(true)
        setLoading(false)
        return
      }

      setIsVerified(true)
      setLoading(false)

    } catch (error) {
      console.error('Verification check error:', error)
      if (requireVerification) {
        router.push('/auth/login')
      } else {
        setIsVerified(false)
        setLoading(false)
      }
    }
  }

  const showVerificationRequired = () => {
    // Show verification required message
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Verification Required</h1>
            <p className="text-gray-400 mb-6">
              Please verify your account to access the dashboard. Check your email or phone for the verification code.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                const pending = localStorage.getItem('pendingRegistration')
                if (pending) {
                  const data = JSON.parse(pending)
                  router.push(`/auth/verify?type=${data.verificationType}&contact=${data.verificationType === 'email' ? data.email : data.phone}`)
                } else {
                  router.push('/auth/register')
                }
              }}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Complete Verification
            </button>
            
            <button
              onClick={() => {
                localStorage.removeItem('user')
                localStorage.removeItem('authToken')
                localStorage.removeItem('pendingRegistration')
                router.push('/auth/register')
              }}
              className="w-full text-gray-400 hover:text-white transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking verification status...</p>
        </div>
      </div>
    )
  }

  if (requireVerification && !isVerified) {
    return showVerificationRequired()
  }

  return <>{children}</>
}

// Hook for checking verification status
export function useVerificationStatus() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)

  useEffect(() => {
    const checkStatus = () => {
      try {
        const userStr = localStorage.getItem('user')
        const authToken = localStorage.getItem('authToken')

        if (!userStr || !authToken) {
          setIsVerified(false)
          return
        }

        const user: User = JSON.parse(userStr)
        setIsVerified(user.verified || false)
      } catch (error) {
        setIsVerified(false)
      }
    }

    checkStatus()
  }, [])

  return isVerified
}
