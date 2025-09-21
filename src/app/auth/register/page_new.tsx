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
  FaGoogle, 
  FaFacebookF,
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
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
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

      await new Promise(resolve => setTimeout(resolve, 1000))

      if (formData.name && formData.email && formData.password) {
        const userData = {
          isAuthenticated: true,
          email: formData.email,
          name: formData.name,
          userType: formData.userType,
          registrationTime: new Date().toISOString()
        }
        localStorage.setItem('user', JSON.stringify(userData))
        router.push('/dashboard')
      } else {
        setError('Please fill in all fields')
      }
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    const userData = {
      isAuthenticated: true,
      email: `user@${provider}.com`,
      name: `${provider} User`,
      userType: 'client',
      registrationTime: new Date().toISOString()
    }
    localStorage.setItem('user', JSON.stringify(userData))
    router.push('/dashboard')
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
              <Image 
                src="/images/logo.png" 
                alt="Solutil Logo" 
                width={40}
                height={40}
                className="rounded-xl object-cover"
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

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all"
                >
                  <FaGoogle className="text-red-500 mr-2" />
                  <span className="text-gray-700 font-medium">Google</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSocialLogin('facebook')}
                  className="flex items-center justify-center py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all"
                >
                  <FaFacebookF className="text-blue-600 mr-2" />
                  <span className="text-gray-700 font-medium">Facebook</span>
                </motion.button>
              </div>

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

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">Demo Access</p>
              <p className="text-xs text-gray-400">
                Create an account with any valid information to explore the platform
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
