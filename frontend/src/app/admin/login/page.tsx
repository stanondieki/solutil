'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaEye, 
  FaEyeSlash, 
  FaShieldAlt, 
  FaLock, 
  FaUser, 
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSun,
  FaMoon
} from 'react-icons/fa'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Load remembered credentials
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('adminRememberEmail')
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }))
      setRememberMe(true)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('adminRememberEmail', formData.email)
        } else {
          localStorage.removeItem('adminRememberEmail')
        }

        setShowSuccess(true)
        
        // Store admin token and user data
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('sessionExpiry', (Date.now() + (24 * 60 * 60 * 1000)).toString())
        
        // Redirect with delay for success animation
        setTimeout(() => {
          window.location.href = '/admin/dashboard'
        }, 1500)
      } else {
        setError(data.message || 'Invalid credentials. Please try again.')
      }
    } catch (error) {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className={`absolute w-1 h-1 rounded-full animate-float ${
              isDarkMode ? 'bg-white/30' : 'bg-indigo-400/40'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 6}s`
            }}
          />
        ))}
        
        {/* Geometric Shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 border border-orange-400/20 rounded-lg rotate-12 animate-bounce-slow" />
        <div className="absolute bottom-32 right-16 w-12 h-12 bg-gradient-to-br from-orange-400/15 to-red-400/15 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-blue-400/20 transform rotate-45 animate-spin-slow" />
        <div className="absolute bottom-1/3 left-1/5 w-8 h-8 border-2 border-purple-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        
        {/* Main Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-gradient-to-r from-orange-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Theme Toggle */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-6 right-6 z-50 w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
      >
        <motion.div
          animate={{ rotate: isDarkMode ? 0 : 180 }}
          transition={{ duration: 0.5 }}
        >
          {isDarkMode ? (
            <FaSun className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300" />
          ) : (
            <FaMoon className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
          )}
        </motion.div>
      </motion.button>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 to-orange-700 items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-20 h-20 bg-white rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-2xl">
                <FaShieldAlt className="text-orange-600 text-3xl" />
              </div>
              <div className="text-4xl font-bold text-white mb-4">Solutil Connect</div>
              <div className="text-xl text-orange-100 font-medium">Admin Portal</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4 text-orange-50"
            >
              <p className="text-lg leading-relaxed">
                Secure access to your administrative dashboard
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-orange-200" />
                  <span>Manage Services</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-orange-200" />
                  <span>Monitor Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-orange-200" />
                  <span>Analytics</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md space-y-8"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-xl">
                <FaShieldAlt className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
              <p className="text-slate-400 mt-2">Solutil Connect</p>
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl p-8 text-center shadow-2xl"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCheckCircle className="text-green-600 text-2xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome Back!</h3>
                    <p className="text-gray-600">Redirecting to admin dashboard...</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-300">Sign in to access the admin dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3"
                    >
                      <FaExclamationTriangle className="text-red-400 flex-shrink-0" />
                      <p className="text-red-200 text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field with Floating Label */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <FaUser className={`h-5 w-5 transition-colors duration-200 ${
                      formData.email ? 'text-orange-400' : 'text-slate-400 group-focus-within:text-orange-400'
                    }`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm peer"
                    placeholder="Email Address"
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-10 transition-all duration-300 pointer-events-none ${
                      formData.email
                        ? '-top-2 text-xs text-orange-400 bg-slate-800 px-2 rounded'
                        : 'top-4 text-slate-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-orange-400 peer-focus:bg-slate-800 peer-focus:px-2 peer-focus:rounded'
                    }`}
                  >
                    Email Address
                  </label>
                </div>

                {/* Password Field with Floating Label */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <FaLock className={`h-5 w-5 transition-colors duration-200 ${
                      formData.password ? 'text-orange-400' : 'text-slate-400 group-focus-within:text-orange-400'
                    }`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm peer"
                    placeholder="Password"
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-10 transition-all duration-300 pointer-events-none ${
                      formData.password
                        ? '-top-2 text-xs text-orange-400 bg-slate-800 px-2 rounded'
                        : 'top-4 text-slate-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-orange-400 peer-focus:bg-slate-800 peer-focus:px-2 peer-focus:rounded'
                    }`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-slate-400 hover:text-orange-400 transition-colors duration-200" />
                    ) : (
                      <FaEye className="h-5 w-5 text-slate-400 hover:text-orange-400 transition-colors duration-200" />
                    )}
                  </button>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                    Remember my email
                  </label>
                </div>

                {/* Enhanced Login Button with Loading States */}
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0 20px 25px -5px rgba(249, 115, 22, 0.3)" }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`relative w-full overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed shadow-lg group ${
                    loading ? 'opacity-90' : ''
                  }`}
                >
                  {/* Background Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center"
                      >
                        <div className="flex space-x-1 mr-3">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-white rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            />
                          ))}
                        </div>
                        <span>Authenticating...</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center"
                      >
                        <FaShieldAlt className="mr-2 group-hover:rotate-12 transition-transform duration-200" />
                        <span>Sign In to Dashboard</span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                          className="ml-2"
                        >
                          →
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>

              {/* Back to Main Site */}
              <div className="mt-6 text-center">
                <Link 
                  href="/" 
                  className="inline-flex items-center text-slate-300 hover:text-orange-300 text-sm transition-colors group"
                >
                  <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to main site
                </Link>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center text-slate-400 text-xs"
            >
              <p>© 2025 Solutil Connect. Secure admin access.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
