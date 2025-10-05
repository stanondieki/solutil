'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock, 
  FaUser,
  FaCheck
} from 'react-icons/fa'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'client'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      if (!acceptTerms) {
        setError('Please accept the Terms & Conditions')
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }

      // Validate verification contact
      if (!formData.email) {
        setError('Email is required')
        return
      }

      // Register user directly to backend database
      console.log('Attempting registration with data:', {
        name: formData.name,
        email: formData.email,
        userType: formData.userType
      });

      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: formData.userType
        }),
      })

      console.log('Response status:', registerResponse.status);
      const registerData = await registerResponse.json()
      console.log('Response data:', registerData);

      if (registerResponse.ok && registerData.status === 'success') {
        console.log('Registration successful');
        
        // Show success message about email verification
        setSuccess('Registration successful! Please check your email to verify your account before logging in.')
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          userType: 'client'
        })
        
        // Optionally redirect to login page after showing success message
        setTimeout(() => {
          router.push('/auth/login?registered=true')
        }, 3000)
      } else {
        console.error('Registration failed:', registerData);
        setError(registerData.message || 'Registration failed')
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
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
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join Solutil to get started</p>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all text-gray-900 placeholder-gray-500"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

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



              {/* Email Verification Info */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  ℹ️ <strong>Email Verification:</strong> We'll send a verification link to your email address. Please check your email and click the link to activate your account.
                </p>
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
                    placeholder="Create a password"
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
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all text-gray-900"
                >
                  <option value="client">Client - Book Services</option>
                  <option value="provider">Service Provider - Offer Services</option>
                </select>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="flex items-start space-x-3">
                <div className="flex items-center h-6">
                  <button
                    type="button"
                    onClick={() => setAcceptTerms(!acceptTerms)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      acceptTerms 
                        ? 'bg-orange-600 border-orange-600' 
                        : 'border-gray-300 hover:border-orange-600'
                    }`}
                  >
                    {acceptTerms && <FaCheck className="text-white text-xs" />}
                  </button>
                </div>
                <div className="text-sm">
                  <label className="text-gray-600">
                    I agree to Solutil's{' '}
                    <Link 
                      href="/terms" 
                      className="text-orange-600 hover:text-orange-700 underline font-medium"
                    >
                      Terms & Conditions
                    </Link>
                    {' '}and{' '}
                    <Link 
                      href="/privacy" 
                      className="text-orange-600 hover:text-orange-700 underline font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-3"
                >
                  <p className="text-red-600 text-sm text-center">{error}</p>
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

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading || !acceptTerms}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3.5 rounded-xl text-lg font-semibold hover:from-orange-700 hover:to-orange-800 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Sign In Link */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/login" 
                    className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                  >
                    Sign in now
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
