'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { RoleManager } from '@/lib/roles'
import RoleGuard from '@/components/RoleGuard'
import LogoutConfirmModal from '@/components/LogoutConfirmModal'
import { 
  FaSearch,
  FaWrench,
  FaLightbulb,
  FaBroom,
  FaHammer,
  FaStar,
  FaBell,
  FaUser,
  FaCalendarAlt,
  FaHeart,
  FaFire,
  FaChartLine,
  FaCog,
  FaCheck,
  FaCreditCard,
  FaClock,
  FaUsers,
  FaClipboardList,
  FaTools,
  FaUpload,
  FaSignOutAlt,
  FaHome,
  FaArrowRight
} from 'react-icons/fa'

// TypeScript interfaces
interface Service {
  id: string
  name: string
  description: string
  icon: () => React.ReactElement
  color: string
  price: string
  rating: number
  reviews: number
}

interface QuickAction {
  name: string
  icon: React.ComponentType<any>
  color: string
  description: string
  href: string
  onClick?: () => void
}

interface DashboardStat {
  label: string
  value: string | number
  icon: React.ComponentType<any>
  color: string
  trend?: string
}

const services: Service[] = [
  {
    id: '1',
    name: 'Plumbing',
    description: 'Expert plumbing services for your home',
    icon: () => <img src="/images/services/tapper.jpg" alt="tapper" className="h-12 w-12 object-contain" />,
    color: 'bg-blue-100',
    price: 'KES 1,800/hr',
    rating: 4.8,
    reviews: 342
  },
  {
    id: '2',
    name: 'Cleaning',
    description: 'Professional cleaning services',
    icon: () => <img src="/images/services/cleaning.jpg" alt="Cleaning" className="h-12 w-12 object-contain" />,
    color: 'bg-green-100',
    price: 'KES 1,500/hr',
    rating: 4.7,
    reviews: 189
  },
  {
    id: '3',
    name: 'Electrical',
    description: 'Licensed electricians for all electrical work',
    icon: () => <img src="/images/services/electrical.jpg" alt="Electrical" className="h-12 w-12 object-contain" />,
    color: 'bg-yellow-100',
    price: 'KES 2,200/hr',
    rating: 4.9,
    reviews: 256
  }
];

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout, refreshUserData } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredServices, setFilteredServices] = useState(services)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredServices(filtered)
  }, [searchQuery])

  // Auto-refresh user data on component mount to ensure status is current
  useEffect(() => {
    const refreshOnMount = async () => {
      if (isAuthenticated && user && !isLoading) {
        console.log('Auto-refreshing user data on dashboard mount...')
        await refreshUserData()
      }
    }
    refreshOnMount()
  }, [isAuthenticated, isLoading]) // Don't include refreshUserData to avoid infinite loops

  // Manual refresh function
  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    try {
      await refreshUserData()
      console.log('Manual refresh completed')
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard</p>
          <Link
            href="/auth/login"
            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // Role-based quick actions
  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = []

    if (RoleManager.isClient(user.userType)) {
      return [
        { name: 'Browse Services', icon: FaSearch, color: 'bg-gradient-to-r from-orange-500 to-orange-600', description: 'Find the perfect service', href: '/services' },
        { name: 'Book Service', icon: FaCalendarAlt, color: 'bg-gradient-to-r from-orange-600 to-orange-700', description: 'Schedule instantly', href: '/booking/plumbing' },
        { name: 'My Bookings', icon: FaClipboardList, color: 'bg-gradient-to-r from-orange-400 to-orange-500', description: 'View & manage bookings', href: '/bookings' },
        { name: 'Emergency', icon: FaFire, color: 'bg-gradient-to-r from-red-500 to-orange-600', description: '24/7 urgent services', href: '/services?emergency=true' },
        { name: 'Sign Out', icon: FaSignOutAlt, color: 'bg-gradient-to-r from-red-500 to-red-600', description: 'Logout securely', href: '#', onClick: () => setShowLogoutModal(true) }
      ]
    }

    if (RoleManager.isProvider(user.userType)) {
      const providerActions = [];
      
      if (user.providerStatus === 'pending' || !user.providerStatus) {
        providerActions.push(
          { name: 'Complete Setup', icon: FaUpload, color: 'bg-gradient-to-r from-orange-500 to-orange-600', description: 'Finish onboarding process', href: '/provider/onboarding' }
        );
      } else if (user.providerStatus === 'under_review') {
        providerActions.push(
          { name: 'Application Status', icon: FaClock, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600', description: 'Under review', href: '/provider/status' }
        );
      } else if (user.providerStatus === 'rejected') {
        providerActions.push(
          { name: 'Reapply', icon: FaUpload, color: 'bg-gradient-to-r from-red-500 to-red-600', description: 'Update your application', href: '/provider/onboarding' }
        );
      } else if (user.providerStatus === 'approved') {
        providerActions.push(
          { name: 'My Services', icon: FaTools, color: 'bg-gradient-to-r from-orange-500 to-orange-600', description: 'Manage your services', href: '/provider/services' },
          { name: 'Bookings', icon: FaClipboardList, color: 'bg-gradient-to-r from-orange-600 to-orange-700', description: 'Customer bookings', href: '/provider/bookings' },
          { name: 'Analytics', icon: FaChartLine, color: 'bg-gradient-to-r from-orange-400 to-orange-500', description: 'Performance insights', href: '/provider/analytics' }
        );
      }
      
      providerActions.push(
        { name: 'My Profile', icon: FaUser, color: 'bg-gradient-to-r from-gray-500 to-gray-600', description: 'Manage profile', href: '/profile' },
        { name: 'Sign Out', icon: FaSignOutAlt, color: 'bg-gradient-to-r from-red-500 to-red-600', description: 'Logout securely', href: '#', onClick: () => setShowLogoutModal(true) }
      );
      return providerActions;
    }

    if (RoleManager.isAdmin(user.userType)) {
      return [
        { name: 'Admin Panel', icon: FaCog, color: 'bg-gradient-to-r from-orange-600 to-orange-700', description: 'System management', href: '/admin' },
        { name: 'Users', icon: FaUsers, color: 'bg-gradient-to-r from-orange-500 to-orange-600', description: 'Manage users', href: '/admin/users' },
        { name: 'Providers', icon: FaTools, color: 'bg-gradient-to-r from-orange-400 to-orange-500', description: 'Provider management', href: '/admin/providers' },
        { name: 'Analytics', icon: FaChartLine, color: 'bg-gradient-to-r from-orange-600 to-red-600', description: 'System analytics', href: '/admin/analytics' },
        { name: 'Sign Out', icon: FaSignOutAlt, color: 'bg-gradient-to-r from-red-500 to-red-600', description: 'Logout securely', href: '#', onClick: () => setShowLogoutModal(true) }
      ]
    }

    return baseActions
  }

  // Role-based dashboard stats
  const getDashboardStats = (): DashboardStat[] => {
    if (RoleManager.isClient(user.userType)) {
      return [
        { label: 'Total Bookings', value: '12', icon: FaClipboardList, color: 'bg-orange-500', trend: '+2 this month' },
        { label: 'Favorite Services', value: '5', icon: FaHeart, color: 'bg-orange-600', trend: '+1 this week' },
        { label: 'Money Spent', value: 'KES 45,600', icon: FaCreditCard, color: 'bg-orange-700', trend: 'KES 8,200 this month' },
        { label: 'Reviews Given', value: '8', icon: FaStar, color: 'bg-orange-400', trend: '3 pending' }
      ]
    }

    if (RoleManager.isProvider(user.userType)) {
      if (user.providerStatus !== 'approved') {
        return [
          { label: 'Application Status', value: RoleManager.getProviderStatusConfig(user.providerStatus).label, icon: FaClock, color: 'bg-yellow-500' },
          { label: 'Documents', value: 'Required', icon: FaUpload, color: 'bg-orange-500' },
          { label: 'Next Step', value: 'Complete Setup', icon: FaCheck, color: 'bg-orange-600' },
          { label: 'Support', value: 'Available', icon: FaUser, color: 'bg-orange-400' }
        ]
      }
      return [
        { label: 'Total Bookings', value: '28', icon: FaClipboardList, color: 'bg-orange-500', trend: '+4 this week' },
        { label: 'This Month', value: 'KES 156,000', icon: FaCreditCard, color: 'bg-orange-600', trend: '+12% from last month' },
        { label: 'Rating', value: '4.9', icon: FaStar, color: 'bg-orange-400', trend: 'Based on 89 reviews' },
        { label: 'Active Services', value: '6', icon: FaTools, color: 'bg-orange-700', trend: '2 pending approval' }
      ]
    }

    if (RoleManager.isAdmin(user.userType)) {
      return [
        { label: 'Total Users', value: '2,847', icon: FaUsers, color: 'bg-orange-500', trend: '+127 this month' },
        { label: 'Active Providers', value: '156', icon: FaTools, color: 'bg-orange-600', trend: '+12 this week' },
        { label: 'Total Revenue', value: 'KES 890,000', icon: FaCreditCard, color: 'bg-orange-700', trend: '+8.2% this month' },
        { label: 'Pending Reviews', value: '23', icon: FaClock, color: 'bg-orange-400', trend: '5 urgent' }
      ]
    }

    return []
  }

  const quickActions = getQuickActions()
  const dashboardStats = getDashboardStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2 group">
                <Image
                  src="/images/log.png"
                  alt="Solutil"
                  width={40}
                  height={40}
                  className="group-hover:scale-105 transition-transform duration-200"
                />
               
              </Link>

              {/* Primary Navigation - Desktop */}
              <div className="hidden lg:flex items-center space-x-1">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg"
                >
                  <FaHome className="inline mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                {RoleManager.getNavigationItems(user.userType, user.providerStatus).slice(2).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <FaBell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1 ${RoleManager.getRoleColor(user.userType).includes('blue') ? 'bg-orange-500' : 'bg-orange-600'}`}></span>
                    {RoleManager.getRoleDisplayName(user.userType)}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => setShowLogoutModal(true)}
                onDoubleClick={async () => {
                  console.log('🚨 Double-click detected - Emergency logout!')
                  try {
                    await logout()
                  } catch (error) {
                    console.error('Emergency logout failed:', error)
                    localStorage.clear()
                    sessionStorage.clear()
                    window.location.replace('/auth/login')
                  }
                }}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign out (Double-click for immediate logout)"
              >
                <FaSignOutAlt className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex space-x-1 overflow-x-auto">
            <Link
              href="/dashboard"
              className="flex-shrink-0 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg whitespace-nowrap"
            >
              Dashboard
            </Link>
            {RoleManager.getNavigationItems(user.userType, user.providerStatus).slice(2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                {RoleManager.isClient(user.userType) && "Ready to find your next service?"}
                {RoleManager.isProvider(user.userType) && "Manage your services and grow your business"}
                {RoleManager.isAdmin(user.userType) && "System overview and management tools"}
              </p>
            </div>
            {user.userType === 'provider' && user.providerStatus && (
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                RoleManager.getProviderStatusConfig(user.providerStatus).color
              }`}>
                <span className="mr-2">{RoleManager.getProviderStatusConfig(user.providerStatus).icon}</span>
                {RoleManager.getProviderStatusConfig(user.providerStatus).label}
              </div>
            )}
          </div>
        </div>

        {/* Promotional Banner - Only for clients */}
        {user && RoleManager.isClient(user.userType) && (
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 shadow-xl">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative px-8 py-6 md:px-12 md:py-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Get 30% off your first booking! 🎉
                    </h2>
                    <p className="text-white/90 mb-4 text-lg">
                      Professional services at your doorstep. Book now and save big!
                    </p>
                    <Link
                      href="/services"
                      className="inline-flex items-center bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Browse Services
                      <FaArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                  <div className="hidden md:block flex-shrink-0 ml-8">
                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <div className="text-6xl">🔧</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${stat.color} text-white mr-4`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.trend && <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-gray-600">Fast access to your most-used features</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {action.onClick ? (
                  <button
                    onClick={action.onClick}
                    className="group block w-full text-left bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-orange-200"
                  >
                    <div className={`p-4 rounded-2xl ${action.color} text-white inline-flex mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{action.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{action.description}</p>
                    <div className="mt-4 flex items-center text-orange-600 font-medium text-sm group-hover:text-orange-700">
                      {action.name === 'Sign Out' ? 'Click to logout' : 'Get started'}
                    </div>
                  </button>
                ) : (
                  <Link
                    href={action.href}
                    className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-orange-200"
                  >
                    <div className={`p-4 rounded-2xl ${action.color} text-white inline-flex mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{action.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{action.description}</p>
                    <div className="mt-4 flex items-center text-orange-600 font-medium text-sm group-hover:text-orange-700">
                      Get started
                      <FaArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Provider Status Alert */}
        {user.userType === 'provider' && user.providerStatus !== 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <FaBell className="text-white h-5 w-5" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-orange-800 text-lg">Account Verification {user.providerStatus === 'under_review' ? 'In Progress' : 'Required'}</h3>
                <p className="text-orange-700 mt-1">
                  {user.providerStatus === 'pending' 
                    ? 'Complete your provider onboarding to start receiving bookings from customers.'
                    : user.providerStatus === 'rejected'
                    ? 'Your application was rejected. Please update your documents and try again.'
                    : 'Your application is under review. We\'ll notify you once verification is complete.'
                  }
                </p>
                <div className="flex gap-3 mt-3">
                  {user.providerStatus === 'pending' && (
                    <Link
                      href="/provider/onboarding"
                      className="bg-orange-600 text-white px-6 py-2 rounded-xl hover:bg-orange-700 font-medium transition-colors"
                    >
                      Complete Onboarding
                    </Link>
                  )}
                  {(user.providerStatus === 'under_review' || user.providerStatus === 'pending') && (
                    <button
                      onClick={handleRefreshStatus}
                      disabled={isRefreshing}
                      className="bg-orange-100 text-orange-800 px-6 py-2 rounded-xl hover:bg-orange-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isRefreshing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                          Checking...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2h-4.582" />
                          </svg>
                          Refresh Status
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Logout Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          console.log('🚪 User confirmed logout from dashboard')
          setShowLogoutModal(false)
          
          try {
            // The logout function now handles everything including redirect
            await logout()
          } catch (error) {
            console.error('❌ Dashboard logout error:', error)
            // Force redirect even if logout function fails
            console.log('🚨 Forcing emergency logout redirect...')
            localStorage.clear()
            sessionStorage.clear()
            window.location.replace('/auth/login')
          }
        }}
        userName={user.name || user.email?.split('@')[0]}
      />
    </div>
  )
}