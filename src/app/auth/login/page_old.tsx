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
  FaGoogle, 
  FaFacebookF
} from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (formData.email && formData.password) {
        const userData = {
          isAuthenticated: true,
          email: formData.email,
          name: formData.email.split('@')[0],
          loginTime: new Date().toISOString()
        }
        localStorage.setItem('user', JSON.stringify(userData))
        router.push('/dashboard')
      } else {
        setError('Please fill in all fields')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    const userData = {
      isAuthenticated: true,
      email: `user@${provider}.com`,
      name: `${provider} User`,
      loginTime: new Date().toISOString()
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
                src="/images/logo.jpg" 
                alt="Solutil Logo" 
                width={40}
                height={40}
                className="rounded-xl object-cover"
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

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
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

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">Demo Access</p>
              <p className="text-xs text-gray-400">
                Use any valid email and password to explore the platform
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
          isAuthenticated: true,
          email: formData.email,
          name: formData.email.split('@')[0],
          userType: 'client', // Default to client
          loginTime: new Date().toISOString()
        }
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        setError('Please fill in all fields')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
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
      loginTime: new Date().toISOString()
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
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-orange-600 transition-colors group"
          >
            {/* <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Back to home</span> */}
          </Link>
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
            Enter your email and password to login
          </h1>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Forgot Password?
              </Link>
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="solutil-button w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="text-center">
              <p className="text-gray-600">
                New to Solutil?{' '}
                <Link 
                  href="/auth/register" 
                  className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  Sign up now
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
              <p className="text-gray-600 font-medium">Log in with</p>
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
              Use any email and password combination to explore the platform
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
