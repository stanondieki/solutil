'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock
} from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, user } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Check for query parameters
  useEffect(() => {
    const verified = searchParams.get('verified')
    const registered = searchParams.get('registered')
    const reset = searchParams.get('reset')
    
    if (verified === 'true') {
      setSuccess('Email verified successfully! You can now log in.')
    } else if (registered === 'true') {
      setSuccess('Registration successful! Please check your email to verify your account before logging in.')
    } else if (reset === 'success') {
      setSuccess('Password reset successfully! You can now log in with your new password.')
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login with email:', formData.email);
      
      // Use auth context login method directly (it handles the API call)
      const loginSuccess = await login(formData.email, formData.password)
      
      if (loginSuccess) {
        console.log('Login successful via auth context')
        
        // Get user data from localStorage since auth context state might not be updated yet
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        
        // Smart redirect based on user role and status
        let redirectPath = '/dashboard' // default
        
        if (userData.userType === 'admin') {
          redirectPath = '/admin'
        } else if (userData.userType === 'provider') {
          // Check provider verification status
          if (userData.providerStatus === 'pending' || userData.providerStatus === 'under_review') {
            redirectPath = '/provider/onboarding'
          } else if (userData.providerStatus === 'rejected') {
            redirectPath = '/dashboard' // Dashboard will show rejection alert
          } else {
            redirectPath = '/dashboard' // Approved or other status
          }
        } else {
          // Client or default
          redirectPath = '/dashboard'
        }
        
        console.log(`Redirecting ${userData.userType} (${userData.providerStatus || 'N/A'}) to: ${redirectPath}`)
        router.push(redirectPath)
      } else {
        console.error('Login failed');
        setError('Invalid email or password. Please check your credentials and try again.')
        
        // TODO: Add resend verification logic if needed
        // if (errorMessage.toLowerCase().includes('verify your email')) {
        //   setShowResendVerification(true)
        // }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Please enter your email address first')
      return
    }

    setResendLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/resend-email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Verification email sent! Please check your inbox.')
        setShowResendVerification(false)
      } else {
        setError(data.message || 'Failed to send verification email')
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      setError('Network error. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Single Modern Card Container */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          
          {/* Header Section */}
          <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-orange-50 to-white">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <Image 
                src="/images/log.png" 
                alt="Solutil Logo" 
                width={90}
                height={90}
                className=""
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue to Solutil</p>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all text-gray-900 placeholder-gray-500"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all text-gray-900 placeholder-gray-500"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-3"
                >
                  <p className="text-red-600 text-sm text-center">{error}</p>
                  {showResendVerification && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="mt-3 w-full bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  )}
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-3"
                >
                  <p className="text-green-600 text-sm text-center">{success}</p>
                </motion.div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3.5 rounded-xl text-lg font-semibold hover:from-orange-700 hover:to-orange-800 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    href="/auth/register" 
                    className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                  >
                    Sign up now
                  </Link>
                </p>
              </div>

            </form>
          </div>
         
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
