'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [adminInfo, setAdminInfo] = useState({ name: 'Admin User', email: 'admin@solutil.com' })
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
      return
    }
    
    // Load admin info from token if available
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]))
      if (tokenPayload.user) {
        setAdminInfo({
          name: tokenPayload.user.name || 'Admin User',
          email: tokenPayload.user.email || 'admin@solutil.com'
        })
      }
    } catch (error) {
      console.log('Could not parse admin token')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    // Force redirect to admin login with full page reload
    window.location.href = '/admin/login'
  }

  const menuItems = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: '📊',
      description: 'Overview & Analytics'
    },
    { 
      name: 'User Management', 
      href: '/admin/users', 
      icon: '👥',
      description: 'Manage Users'
    },
    { 
      name: 'Service Providers', 
      href: '/admin/providers', 
      icon: '🔧',
      description: 'Provider Applications'
    },
    { 
      name: 'Service Management', 
      href: '/admin/services', 
      icon: '⚡',
      description: 'Manage Services'
    },
    { 
      name: 'Booking Management', 
      href: '/admin/bookings', 
      icon: '📅',
      description: 'Track Bookings'
    },
    { 
      name: 'Transactions', 
      href: '/admin/transactions', 
      icon: '💰',
      description: 'Payment Records'
    },
    { 
      name: 'Payout Management', 
      href: '/admin/payouts', 
      icon: '💸',
      description: 'Provider Payouts'
    },
    { 
      name: 'Reports & Analytics', 
      href: '/admin/reports', 
      icon: '📈',
      description: 'Business Insights'
    },
    { 
      name: 'System Settings', 
      href: '/admin/settings', 
      icon: '⚙️',
      description: 'Configuration'
    },
  ]

  // Helper function to check if current route matches menu item
  const isActiveRoute = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard'
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 transition-all duration-300 fixed left-0 top-0 h-screen z-50 flex flex-col overflow-hidden`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {isSidebarOpen && (
              <div>
                <h2 className="text-white font-bold">Solutil Admin</h2>
                <p className="text-gray-400 text-xs">Management Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 overflow-y-auto">
          <div className="px-3 mb-2">
            {isSidebarOpen && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Main Menu
              </p>
            )}
          </div>
          {menuItems.map((item) => {
            const isActive = isActiveRoute(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className={`text-xl ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isActive ? 'text-white' : ''}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs truncate ${
                      isActive ? 'text-orange-100' : 'text-gray-500 group-hover:text-gray-400'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                )}
                {isActive && isSidebarOpen && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Admin Info & Quick Actions */}
        <div className="border-t border-gray-700">
          {/* Quick Stats */}
          {isSidebarOpen && (
            <div className="p-4">
              <div className="bg-gray-700 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>System Status</span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    Online
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Admin Profile */}
          <div className="p-4">
            {isSidebarOpen ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {adminInfo.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{adminInfo.name}</p>
                  <p className="text-gray-400 text-xs truncate">{adminInfo.email}</p>
                  <div className="flex items-center mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Administrator
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => router.push('/admin/settings')}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    title="Settings"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                    title="Logout"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {adminInfo.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition-colors p-1"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content Wrapper */}
      <div className={`min-h-screen bg-gray-900 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
                title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-white text-lg font-semibold">
                  {(() => {
                    const currentItem = menuItems.find(item => isActiveRoute(item.href))
                    return currentItem?.name || 'Admin Panel'
                  })()}
                </h1>
                <p className="text-gray-400 text-sm">
                  {(() => {
                    const currentItem = menuItems.find(item => isActiveRoute(item.href))
                    return currentItem?.description || 'Management Portal'
                  })()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <button 
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                  title="Refresh Data"
                  onClick={() => window.location.reload()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {/* Notifications */}
              <button className="text-gray-400 hover:text-white transition-colors relative p-2 rounded-lg hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5h5m-5-5v-2a6 6 0 00-6-6v-2a6 6 0 00-6 6v2h5l5 5z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
              </button>

              {/* Back to Main Site */}
              <Link
                href="/"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>View Site</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </>
  )
}
