'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
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
              {/* <span className="text-2xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                Solutil
              </span> */}
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Services
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Contact
            </Link>
            <Link href="/auth/login" className="text-orange-600 hover:text-orange-800 transition-colors font-medium">
              Login
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-2 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 shadow-md font-medium"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 p-2"
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
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/services" 
                className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/auth/login" 
                className="block px-3 py-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-md transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className="block px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors mx-3 mt-2 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
