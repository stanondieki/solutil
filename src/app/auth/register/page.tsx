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
  FaArrowLeft,
  FaCheck
} from 'react-icons/fa'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'client' // client or worker
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
      // Basic validation
      if (!acceptTerms) {
        setError('Please accept the Terms & Conditions')
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // For demo purposes, accept any valid data
      if (formData.name && formData.email && formData.password) {
        // Store user data in localStorage (in production, use proper authentication)
        const userData = {
          isAuthenticated: true,
          email: formData.email,
          name: formData.name,
          userType: formData.userType,
          registrationTime: new Date().toISOString()
        }
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Redirect to dashboard
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
    // Simulate social login
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          {/* <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-orange-600 transition-colors group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Back to home</span>
          </Link> */}
        </motion.div>

        {/* Logo and Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-xl">
            <Image 
              src="/images/logo.jpg" 
              alt="Solutil Logo" 
              width={60}
              height={60}
              className="rounded-xl object-cover"
            />
          </div> */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create your account to get started
          </h1>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all text-gray-900 placeholder-gray-500"
                  placeholder="Enter password"
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

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-6">
                <button
                  type="button"
                  onClick={() => setAcceptTerms(!acceptTerms)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    acceptTerms 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  {acceptTerms && <FaCheck className="text-white text-xs" />}
                </button>
              </div>
              <div className="text-sm">
                <label className="text-gray-600">
                  I Agree With Solutil's{' '}
                  <Link 
                    href="/terms" 
                    className="text-primary hover:text-primary-dark underline"
                  >
                    Terms & Conditions
                  </Link>
                </label>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-4"
              >
                <p className="text-red-600 text-sm text-center">{error}</p>
              </motion.div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading || !acceptTerms}
              className="solutil-button w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                'Sign Up'
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-primary hover:text-primary-dark font-semibold transition-colors"
                >
                  Sign in now
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Social Login Title */}
            <div className="text-center mb-4">
              <p className="text-gray-600 font-medium">Sign up with</p>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center py-3 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all"
              >
                <FaGoogle className="text-red-500 mr-2" />
                <span className="text-gray-700 font-medium">Google</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSocialLogin('facebook')}
                className="flex items-center justify-center py-3 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all"
              >
                <FaFacebookF className="text-blue-600 mr-2" />
                <span className="text-gray-700 font-medium">Facebook</span>
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Demo Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-center"
        >
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <p className="text-sm text-orange-800 font-medium mb-1">Demo Access</p>
            <p className="text-xs text-orange-600">
              Create an account with any valid information to explore the platform
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
