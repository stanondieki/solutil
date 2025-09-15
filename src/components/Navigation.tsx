'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 100) // Increased threshold to 100px
    }

    // Check initial scroll position
    handleScroll()
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Check authentication status
    const checkAuthStatus = () => {
      try {
        const userStr = localStorage.getItem('user')
        const authToken = localStorage.getItem('authToken')
        
        if (userStr && (authToken || JSON.parse(userStr).isAuthenticated)) {
          const userData = JSON.parse(userStr)
          setIsLoggedIn(true)
          setUser(userData)
        } else {
          setIsLoggedIn(false)
          setUser(null)
        }
      } catch (error) {
        setIsLoggedIn(false)
        setUser(null)
      }
    }

    checkAuthStatus()
    
    // Listen for storage changes to update auth status
    window.addEventListener('storage', checkAuthStatus)
    return () => window.removeEventListener('storage', checkAuthStatus)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    setUser(null)
    setIsMenuOpen(false)
    router.push('/')
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-sm shadow-lg' : 'bg-transparent  shadow-none'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image 
                  src="/images/logo.jpg" 
                  alt="Solutil Logo" 
                  width={60}
                  height={150}
                  className="rounded-lg object-cover transition-transform group-hover:scale-105"
                />
              </div>
              {/* <span className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                Solutil
              </span> */}
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`transition-colors font-medium ${
              isScrolled ? 'text-white hover:text-orange-400' : 'text-white hover:text-orange-400'
            }`}>
              Home
            </Link>
            <Link href="/services" className={`transition-colors font-medium ${
              isScrolled ? 'text-white hover:text-orange-400' : 'text-white hover:text-orange-400'
            }`}>
              Services
            </Link>
            <Link href="/about" className={`transition-colors font-medium ${
              isScrolled ? 'text-white hover:text-orange-400' : 'text-white hover:text-orange-400'
            }`}>
              About
            </Link>
            <Link href="/contact" className={`transition-colors font-medium ${
              isScrolled ? 'text-white hover:text-orange-400' : 'text-white hover:text-orange-400'
            }`}>
              Contact
            </Link>
            
            {isLoggedIn ? (
              // Logged-in user navigation
              <>
                <Link href="/dashboard" className={`transition-colors font-medium flex items-center space-x-2 ${
                  isScrolled ? 'text-orange-400 hover:text-orange-300' : 'text-orange-400 hover:text-orange-300'
                }`}>
                  <FaTachometerAlt className="text-sm" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/bookings" className={`transition-colors font-medium ${
                  isScrolled ? 'text-white hover:text-orange-400' : 'text-white hover:text-orange-400'
                }`}>
                  My Bookings
                </Link>
                <div className="relative group">
                  <button className={`transition-colors font-medium flex items-center space-x-2 ${
                    isScrolled ? 'text-white hover:text-orange-400' : 'text-white hover:text-orange-400'
                  }`}>
                    <FaUser className="text-sm" />
                    <span>{user?.name || user?.email?.split('@')[0] || 'Profile'}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link 
                        href="/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        href="/bookings" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        My Bookings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <FaSignOutAlt className="text-sm" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Guest navigation
              <>
                <Link href="/auth/login" className={`transition-colors font-medium ${
                  isScrolled ? 'text-orange-400 hover:text-orange-300' : 'text-orange-400 hover:text-orange-300'
                }`}>
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition-all font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`focus:outline-none focus:ring-2 focus:ring-orange-500 p-2 transition-colors ${
                isScrolled ? 'text-white hover:text-orange-400' : 'text-white hover:text-orange-400'
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden border-t transition-colors ${
            isScrolled ? 'bg-black/95 border-gray-600' : 'bg-transparent border-gray-600'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className={`block px-3 py-2 rounded-md transition-colors ${
                  isScrolled 
                    ? 'text-white hover:text-orange-400 hover:bg-gray-800' 
                    : 'text-white hover:text-orange-400 hover:bg-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/services" 
                className={`block px-3 py-2 rounded-md transition-colors ${
                  isScrolled 
                    ? 'text-white hover:text-orange-400 hover:bg-gray-800' 
                    : 'text-white hover:text-orange-400 hover:bg-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/about" 
                className={`block px-3 py-2 rounded-md transition-colors ${
                  isScrolled 
                    ? 'text-white hover:text-orange-400 hover:bg-gray-800' 
                    : 'text-white hover:text-orange-400 hover:bg-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`block px-3 py-2 rounded-md transition-colors ${
                  isScrolled 
                    ? 'text-white hover:text-orange-400 hover:bg-gray-800' 
                    : 'text-white hover:text-orange-400 hover:bg-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {isLoggedIn ? (
                // Logged-in user mobile navigation
                <>
                  <Link 
                    href="/dashboard" 
                    className={`block px-3 py-2 rounded-md transition-colors font-medium flex items-center space-x-2 ${
                      isScrolled 
                        ? 'text-orange-400 hover:text-orange-300 hover:bg-gray-800' 
                        : 'text-orange-400 hover:text-orange-300 hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaTachometerAlt className="text-sm" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    href="/bookings" 
                    className={`block px-3 py-2 rounded-md transition-colors ${
                      isScrolled 
                        ? 'text-white hover:text-orange-400 hover:bg-gray-800' 
                        : 'text-white hover:text-orange-400 hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <div className="px-3 py-2 text-gray-400 text-sm">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors rounded-md flex items-center space-x-2"
                  >
                    <FaSignOutAlt className="text-sm" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                // Guest mobile navigation
                <>
                  <Link 
                    href="/auth/login" 
                    className={`block px-3 py-2 rounded-md transition-colors font-medium ${
                      isScrolled 
                        ? 'text-orange-400 hover:text-orange-300 hover:bg-gray-800' 
                        : 'text-orange-400 hover:text-orange-300 hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="block px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors mx-3 mt-2 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
