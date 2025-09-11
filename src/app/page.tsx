'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      if (user.isAuthenticated) {
        router.push('/dashboard')
        return
      }
    }
    // If not logged in, redirect to login
    router.push('/login')
  }, [router])

  // Show loading screen while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Image 
            src="/images/logo.jpg" 
            alt="Solutil Logo" 
            width={80}
            height={80}
            className="rounded-xl object-cover shadow-lg animate-pulse"
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to
          <span className="text-blue-600 block">Solutil</span>
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting you to login...</p>
        
        {/* Fallback link in case redirect doesn't work */}
        <div className="mt-6">
          <Link 
            href="/login"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Click here if you're not redirected automatically
          </Link>
        </div>
      </div>
    </div>
  )
}
