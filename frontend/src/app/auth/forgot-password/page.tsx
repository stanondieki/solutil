'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  FaEnvelope, 
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      if (!email) {
        setError('Please enter your email address')
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address')
        return
      }

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.status === 'success') {
        setIsSuccess(true)
        setMessage('Password reset link sent! Please check your email for instructions.')
        setEmail('')
      } else {
        setError(data.message || 'Failed to send reset link. Please try again.')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 text-xl mr-3" />
                <div>
                  <p className="text-green-800 font-medium">Email Sent!</p>
                  <p className="text-green-700 text-sm">{message}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-500 text-xl mr-3" />
                <p className="text-red-800">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                    setMessage('')
                  }}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                isLoading || isSuccess
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending Reset Link...
                </div>
              ) : isSuccess ? (
                'Email Sent Successfully!'
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <FaArrowLeft className="mr-2 text-sm" />
              Back to Login
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Having trouble?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Check your spam/junk folder for the reset email</li>
            <li>• Make sure you entered the correct email address</li>
            <li>• Contact support if you don't receive the email within 10 minutes</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}