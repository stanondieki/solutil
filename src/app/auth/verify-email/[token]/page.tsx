'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'

export default function VerifyEmailPage() {
  const { token } = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully!')
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/auth/login?verified=true')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('Network error. Please check your connection and try again.')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-br from-orange-50 to-white">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <Image 
                src="/images/logo.png" 
                alt="Solutil Logo" 
                width={64} 
                height={64}
                className="rounded-full object-cover"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verification
            </h1>
            <p className="text-gray-600">
              {status === 'loading' && 'Verifying your email address...'}
              {status === 'success' && 'Email verified successfully!'}
              {status === 'error' && 'Verification failed'}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="text-center">
              
              {status === 'loading' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-flex items-center justify-center w-16 h-16 mb-6"
                >
                  <FaSpinner className="text-4xl text-orange-500" />
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="inline-flex items-center justify-center w-16 h-16 mb-6"
                >
                  <FaCheckCircle className="text-4xl text-green-500" />
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="inline-flex items-center justify-center w-16 h-16 mb-6"
                >
                  <FaTimesCircle className="text-4xl text-red-500" />
                </motion.div>
              )}

              <p className="text-gray-700 mb-6 text-lg">
                {message}
              </p>

              {status === 'success' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Redirecting to login in 3 seconds...
                  </p>
                  <motion.div
                    className="w-full bg-gray-200 rounded-full h-1"
                    initial={{ width: 0 }}
                  >
                    <motion.div
                      className="bg-orange-500 h-1 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </motion.div>
                </div>
              )}

              {status !== 'loading' && (
                <div className="flex flex-col space-y-3 mt-6">
                  <Link
                    href="/auth/login"
                    className="w-full bg-orange-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-orange-600 transition-colors duration-200"
                  >
                    Go to Login
                  </Link>
                  
                  {status === 'error' && (
                    <Link
                      href="/auth/register"
                      className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
                    >
                      Back to Register
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Need help? Contact{' '}
              <Link href="/contact" className="text-orange-600 hover:text-orange-700 font-medium">
                support
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
