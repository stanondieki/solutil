'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'client' // 'client' or 'provider'
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      console.log('Attempting login with email:', formData.email)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      console.log('Login response status:', response.status)
      const data = await response.json()
      console.log('Login response data:', data)

      if (response.ok && data.status === 'success') {
        console.log('Login successful - storing data...')
        console.log('Full response data:', JSON.stringify(data, null, 2))
        
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user))
        console.log('User data stored:', data.data.user)
        
        // Check for token in different possible locations
        const token = data.token || data.data?.token || data.accessToken || data.data?.accessToken
        if (token) {
          localStorage.setItem('authToken', token)
          console.log('Auth token stored:', token)
        } else {
          console.log('No token found in response. Available keys:', Object.keys(data))
          // For now, create a dummy token to allow login
          localStorage.setItem('authToken', 'dummy-token')
          console.log('Created dummy token for development')
        }
        
        console.log('Login successful, redirecting to dashboard')
        
        // Force a small delay to ensure localStorage is written
        setTimeout(() => {
          router.push('/dashboard')
        }, 100)
        
      } else {
        console.error('Login failed:', data.message)
        alert(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      alert('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const demoLogin = (userType: 'client' | 'provider') => {
    setFormData(prev => ({
      ...prev,
      email: userType === 'client' ? 'client@demo.com' : 'provider@demo.com',
      password: 'demo123',
      userType
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image 
                src="/images/logo.png" 
                alt="Solutil Logo" 
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
              <span className="text-2xl font-bold text-gray-800">Solutil</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
                Services
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Welcome */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image 
                src="/images/logo.png" 
                alt="Solutil Logo" 
                width={80}
                height={80}
                className="rounded-xl object-cover shadow-lg"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Solutil
            </h2>
            <p className="text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Demo Login Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => demoLogin('client')}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Demo Client Login
            </button>
            <button
              onClick={() => demoLogin('provider')}
              className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Demo Provider Login
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('userType', 'client')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.userType === 'client'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('userType', 'provider')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.userType === 'provider'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  Service Provider
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : formData.userType === 'client'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-green-600 hover:bg-green-700'
              } transform hover:scale-105 shadow-lg`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                `Sign in as ${formData.userType === 'client' ? 'Client' : 'Service Provider'}`
              )}
            </button>

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign up here
                </Link>
              </p>
              <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700">
                Forgot your password?
              </Link>
            </div>
          </form>

          {/* Features Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              What you get with Solutil
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">Verified professionals</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">Quick response times</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-gray-700">Transparent pricing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
