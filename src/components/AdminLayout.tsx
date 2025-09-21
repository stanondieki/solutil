'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [adminInfo, setAdminInfo] = useState({ name: 'Admin User', email: 'admin@solutil.com' })
  const router = useRouter()

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    // Force redirect to admin login with full page reload
    window.location.href = '/admin/login'
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Service Providers', href: '/admin/providers', icon: '🔧' },
    { name: 'Bookings', href: '/admin/bookings', icon: '📅' },
    { name: 'Services', href: '/admin/services', icon: '⚡' },
    { name: 'Transactions', href: '/admin/transactions', icon: '💰' },
    { name: 'Reports', href: '/admin/reports', icon: '📈' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 transition-all duration-300`}
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
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Admin Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {adminInfo.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{adminInfo.name}</p>
                <p className="text-gray-400 text-xs">{adminInfo.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full text-gray-400 hover:text-red-400 transition-colors flex justify-center"
              title="Logout"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-white text-lg font-semibold">Admin Panel</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="text-gray-400 hover:text-white transition-colors relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5h5m-5-5v-2a6 6 0 00-6-6v-2a6 6 0 00-6 6v2h5l5 5z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Back to Main Site */}
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                View Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
