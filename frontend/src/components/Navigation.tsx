'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { RoleManager } from '@/lib/roles'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
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

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image 
                  src="/images/log.png" 
                  alt="Solutil Connect Logo" 
                  width={60}
                  height={60}
                  className="rounded-lg object-contain transition-transform group-hover:scale-105"
                />
              </div>
              {/* <span className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                Solutil
              </span> */}
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="transition-colors font-medium text-gray-900 hover:text-orange-600">
              Home
            </Link>
            <Link href="/services" className="transition-colors font-medium text-gray-900 hover:text-orange-600">
              Services
            </Link>
            <Link href="/about" className="transition-colors font-medium text-gray-900 hover:text-orange-600">
              About
            </Link>
            <Link href="/contact" className="transition-colors font-medium text-gray-900 hover:text-orange-600">
              Contact
            </Link>
            
            {isAuthenticated ? (
              // Logged-in user navigation
              <>
                {/* Role-based navigation items */}
                {user && RoleManager.getNavigationItems(user.userType, user.providerStatus).map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={`transition-colors font-medium ${
                      item.href === '/dashboard' 
                        ? `flex items-center space-x-2 ${isScrolled ? 'text-orange-400 hover:text-orange-300' : 'text-orange-400 hover:text-orange-300'}`
                        : 'text-gray-900 hover:text-orange-600'
                    }`}
                  >
                    {item.href === '/dashboard' && <FaTachometerAlt className="text-sm" />}
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                <div className="relative group">
                  <button className="transition-colors font-medium flex items-center space-x-2 text-gray-900 hover:text-orange-600">
                    <FaUser className="text-sm" />
                    <span>{user?.name || user?.email?.split('@')[0] || 'Profile'}</span>
                    {/* Role badge */}
                    {user && (
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${RoleManager.getRoleColor(user.userType)}`}>
                        {RoleManager.getRoleDisplayName(user.userType)}
                      </span>
                    )}
                    {/* Provider status badge */}
                    {user?.userType === 'provider' && user.providerStatus && (
                      <span className={`ml-1 px-2 py-1 text-xs rounded-full border ${
                        RoleManager.getProviderStatusConfig(user.providerStatus as any).color
                      }`}>
                        {RoleManager.getProviderStatusConfig(user.providerStatus as any).icon}
                      </span>
                    )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {/* User info */}
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${RoleManager.getRoleColor(user?.userType || 'client')}`}>
                            {RoleManager.getRoleDisplayName(user?.userType || 'client')}
                          </span>
                          {user?.userType === 'provider' && user.providerStatus && (
                            <span className={`px-2 py-1 text-xs rounded-full border ${
                              RoleManager.getProviderStatusConfig(user.providerStatus as any).color
                            }`}>
                              {RoleManager.getProviderStatusConfig(user.providerStatus as any).label}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        My Profile
                      </Link>
                      
                      {/* Role-specific menu items */}
                      {user && RoleManager.getNavigationItems(user.userType, user.providerStatus).map((item) => (
                        item.href !== '/profile' && (
                          <Link 
                            key={item.href}
                            href={item.href} 
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            {item.name}
                          </Link>
                        )
                      ))}
                      
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
                <Link href="/auth/login" className="transition-colors font-medium text-orange-600 hover:text-orange-700">
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
              className="focus:outline-none focus:ring-2 focus:ring-orange-500 p-2 transition-colors text-gray-900 hover:text-orange-600"
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
          <div className="md:hidden border-t bg-white/95 backdrop-blur-sm border-gray-200/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className={`block px-3 py-2 rounded-md transition-colors ${
                  isScrolled 
                    ? 'text-gray-900 hover:text-orange-600 hover:bg-orange-50' 
                    : 'text-gray-900 hover:text-orange-600 hover:bg-orange-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/services" 
                className="block px-3 py-2 rounded-md transition-colors text-gray-900 hover:text-orange-600 hover:bg-orange-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/about" 
                className={`block px-3 py-2 rounded-md transition-colors ${
                  isScrolled 
                    ? 'text-gray-900 hover:text-orange-600 hover:bg-orange-50' 
                    : 'text-gray-900 hover:text-orange-600 hover:bg-orange-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`block px-3 py-2 rounded-md transition-colors ${
                  isScrolled 
                    ? 'text-gray-900 hover:text-orange-600 hover:bg-orange-50' 
                    : 'text-gray-900 hover:text-orange-600 hover:bg-orange-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {isAuthenticated ? (
                // Logged-in user mobile navigation
                <>
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 rounded-md transition-colors font-medium flex items-center space-x-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaTachometerAlt className="text-sm" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    href="/bookings" 
                    className="block px-3 py-2 rounded-md transition-colors text-gray-900 hover:text-orange-600 hover:bg-orange-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <div className="px-3 py-2 text-gray-600 text-sm">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors rounded-md flex items-center space-x-2"
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
                    className="block px-3 py-2 rounded-md transition-colors font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50"
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
