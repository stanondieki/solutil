'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { RoleManager } from '@/lib/roles'
import RoleGuard from '@/components/RoleGuard'
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
  FaArrowRight,
  FaChevronDown,
  FaShieldAlt,
  FaPowerOff,
  FaExclamationTriangle,
  FaRocket
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
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(true)
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
        await fetchDashboardData()
      }
    }
    refreshOnMount()
  }, [isAuthenticated, isLoading]) // Don't include refreshUserData to avoid infinite loops

  // Manual refresh function
  const handleRefreshStatus = async () => {
    setIsRefreshing(true)
    try {
      await refreshUserData()
      await fetchDashboardData()
      console.log('Manual refresh completed')
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // New Enhanced Logout Functions
  const handleQuickLogout = async () => {
    setIsLoggingOut(true)
    setShowLogoutDropdown(false)
    
    try {
      // Clear local data immediately for quick logout
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      sessionStorage.clear()
      
      // Show logout success message
      console.log('🚀 Quick logout completed')
      
      // Redirect to login
      router.push('/auth/login')
      
      // Call logout API in background (fire and forget)
      logout().catch(error => {
        console.warn('Background logout API call failed:', error)
      })
    } catch (error) {
      console.error('Quick logout failed:', error)
      // Force redirect even if logout fails
      window.location.replace('/auth/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleSecureLogout = async () => {
    setIsLoggingOut(true)
    setShowLogoutDropdown(false)
    
    try {
      console.log('🔒 Secure logout initiated')
      
      // Call proper logout API first
      await logout()
      
      console.log('✅ Secure logout completed successfully')
    } catch (error) {
      console.error('Secure logout failed:', error)
      
      // Emergency cleanup if API fails
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace('/auth/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleEmergencyLogout = async () => {
    console.log('🚨 Emergency logout activated!')
    setIsLoggingOut(true)
    
    // Force immediate cleanup
    localStorage.clear()
    sessionStorage.clear()
    
    // Force redirect
    window.location.replace('/auth/login')
  }

  // Fetch live dashboard data
  const fetchDashboardData = async () => {
    if (!user) return
    
    setLoadingStats(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data.data)
      } else {
        console.error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoadingStats(false)
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
        { name: 'Sign Out', icon: FaSignOutAlt, color: 'bg-gradient-to-r from-red-500 to-red-600', description: 'Logout options', href: '#', onClick: () => setShowLogoutDropdown(true) }
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
        { name: 'Sign Out', icon: FaSignOutAlt, color: 'bg-gradient-to-r from-red-500 to-red-600', description: 'Logout options', href: '#', onClick: () => setShowLogoutDropdown(true) }
      );
      return providerActions;
    }

    if (RoleManager.isAdmin(user.userType)) {
      return [
        { name: 'Admin Panel', icon: FaCog, color: 'bg-gradient-to-r from-orange-600 to-orange-700', description: 'System management', href: '/admin' },
        { name: 'Users', icon: FaUsers, color: 'bg-gradient-to-r from-orange-500 to-orange-600', description: 'Manage users', href: '/admin/users' },
        { name: 'Providers', icon: FaTools, color: 'bg-gradient-to-r from-orange-400 to-orange-500', description: 'Provider management', href: '/admin/providers' },
        { name: 'Analytics', icon: FaChartLine, color: 'bg-gradient-to-r from-orange-600 to-red-600', description: 'System analytics', href: '/admin/analytics' },
        { name: 'Sign Out', icon: FaSignOutAlt, color: 'bg-gradient-to-r from-red-500 to-red-600', description: 'Logout options', href: '#', onClick: () => setShowLogoutDropdown(true) }
      ]
    }

    return baseActions
  }

  // Role-based dashboard stats with live data
  const getDashboardStats = (): DashboardStat[] => {
    if (RoleManager.isClient(user.userType)) {
      return [
        { 
          label: 'Total Bookings', 
          value: dashboardData?.totalBookings || '0', 
          icon: FaClipboardList, 
          color: 'bg-orange-500', 
          trend: dashboardData?.bookingsTrend || 'No data yet' 
        },
        { 
          label: 'Favorite Services', 
          value: dashboardData?.favoriteServices || '0', 
          icon: FaHeart, 
          color: 'bg-orange-600', 
          trend: dashboardData?.favoritesTrend || 'Start saving favorites' 
        },
        { 
          label: 'Money Spent', 
          value: dashboardData?.totalSpent ? `KES ${dashboardData.totalSpent.toLocaleString()}` : 'KES 0', 
          icon: FaCreditCard, 
          color: 'bg-orange-700', 
          trend: dashboardData?.spendingTrend || 'No spending yet' 
        },
        { 
          label: 'Reviews Given', 
          value: dashboardData?.reviewsGiven || '0', 
          icon: FaStar, 
          color: 'bg-orange-400', 
          trend: dashboardData?.reviewsTrend || 'No reviews yet' 
        }
      ]
    }

    if (RoleManager.isProvider(user.userType)) {
      if (user.providerStatus !== 'approved') {
        return [
          { 
            label: 'Application Status', 
            value: RoleManager.getProviderStatusConfig(user.providerStatus || 'pending').label, 
            icon: FaClock, 
            color: 'bg-yellow-500' 
          },
          { 
            label: 'Documents', 
            value: dashboardData?.documentsUploaded ? `${dashboardData.documentsUploaded}/4` : 'Required', 
            icon: FaUpload, 
            color: 'bg-orange-500' 
          },
          { 
            label: 'Profile Completion', 
            value: dashboardData?.profileCompletion ? `${dashboardData.profileCompletion}%` : '0%', 
            icon: FaCheck, 
            color: 'bg-orange-600' 
          },
          { 
            label: 'Support', 
            value: 'Available', 
            icon: FaUser, 
            color: 'bg-orange-400' 
          }
        ]
      }
      return [
        { 
          label: 'Total Bookings', 
          value: dashboardData?.totalBookings || '0', 
          icon: FaClipboardList, 
          color: 'bg-orange-500', 
          trend: dashboardData?.bookingsTrend || 'No bookings yet' 
        },
        { 
          label: 'This Month Earnings', 
          value: dashboardData?.monthlyEarnings ? `KES ${dashboardData.monthlyEarnings.toLocaleString()}` : 'KES 0', 
          icon: FaCreditCard, 
          color: 'bg-orange-600', 
          trend: dashboardData?.earningsTrend || 'No earnings yet' 
        },
        { 
          label: 'Rating', 
          value: dashboardData?.averageRating || '0.0', 
          icon: FaStar, 
          color: 'bg-orange-400', 
          trend: dashboardData?.ratingTrend || 'No ratings yet' 
        },
        { 
          label: 'Active Services', 
          value: dashboardData?.activeServices || '0', 
          icon: FaTools, 
          color: 'bg-orange-700', 
          trend: dashboardData?.servicesTrend || 'Add services' 
        }
      ]
    }

    if (RoleManager.isAdmin(user.userType)) {
      return [
        { 
          label: 'Total Users', 
          value: dashboardData?.totalUsers || '0', 
          icon: FaUsers, 
          color: 'bg-orange-500', 
          trend: dashboardData?.usersTrend || 'No data' 
        },
        { 
          label: 'Active Providers', 
          value: dashboardData?.activeProviders || '0', 
          icon: FaTools, 
          color: 'bg-orange-600', 
          trend: dashboardData?.providersTrend || 'No providers' 
        },
        { 
          label: 'Total Revenue', 
          value: dashboardData?.totalRevenue ? `KES ${dashboardData.totalRevenue.toLocaleString()}` : 'KES 0', 
          icon: FaCreditCard, 
          color: 'bg-orange-700', 
          trend: dashboardData?.revenueTrend || 'No revenue' 
        },
        { 
          label: 'Pending Reviews', 
          value: dashboardData?.pendingReviews || '0', 
          icon: FaClock, 
          color: 'bg-orange-400', 
          trend: dashboardData?.reviewsTrend || 'No pending reviews' 
        }
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
                    {item.name}
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
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                  {(user as any).avatar?.url ? (
                    <Image
                      src={(user as any).avatar.url}
                      alt={user.name || 'User'}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1 ${RoleManager.getRoleColor(user.userType).includes('blue') ? 'bg-orange-500' : 'bg-orange-600'}`}></span>
                    {RoleManager.getRoleDisplayName(user.userType)}
                  </p>
                </div>
              </div>

              {/* New Logout Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLogoutDropdown(!showLogoutDropdown)}
                  disabled={isLoggingOut}
                  className={`p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                    isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                  } ${showLogoutDropdown ? 'bg-red-50 text-red-600' : ''}`}
                  title="Logout Options"
                >
                  {isLoggingOut ? (
                    <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <FaSignOutAlt className="h-4 w-4" />
                      <FaChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>

                {/* Logout Dropdown Menu */}
                {showLogoutDropdown && !isLoggingOut && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Logout Options</h3>
                      <p className="text-xs text-gray-500 mt-1">Choose how you want to sign out</p>
                    </div>
                    
                    <div className="p-2">
                      {/* Quick Logout */}
                      <button
                        onClick={handleQuickLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-orange-50 rounded-lg transition-colors group"
                      >
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                          <FaPowerOff className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Quick Logout</p>
                          <p className="text-xs text-gray-500">Fast local cleanup & redirect</p>
                        </div>
                      </button>

                      {/* Secure Logout */}
                      <button
                        onClick={handleSecureLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-blue-50 rounded-lg transition-colors group"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <FaShieldAlt className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Secure Logout</p>
                          <p className="text-xs text-gray-500">Proper server-side session cleanup</p>
                        </div>
                      </button>

                      {/* Emergency Logout */}
                      <button
                        onClick={handleEmergencyLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 text-left hover:bg-red-50 rounded-lg transition-colors group"
                      >
                        <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                          <FaExclamationTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Emergency Logout</p>
                          <p className="text-xs text-gray-500">Force logout (if something's wrong)</p>
                        </div>
                      </button>
                    </div>
                    
                    <div className="p-3 bg-gray-50 border-t border-gray-100">
                      <button
                        onClick={() => setShowLogoutDropdown(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
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
                {item.name}
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
          {loadingStats ? (
            // Loading skeleton for stats
            [...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gray-200 mr-4 animate-pulse">
                    <div className="h-6 w-6 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                    <div className="h-2 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            dashboardStats.map((stat, index) => (
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
            ))
          )}
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

      {/* Logout Options Dropdown */}
      {showLogoutDropdown && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <FaSignOutAlt className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Logout Options</h3>
            </div>
            
            <p className="text-gray-600 mb-6">Choose your preferred logout method:</p>
            
            <div className="space-y-3">
              {/* Quick Logout */}
              <button
                onClick={handleQuickLogout}
                className="w-full flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
              >
                <FaRocket className="h-5 w-5 text-orange-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Quick Logout</div>
                  <div className="text-sm text-gray-600">Fast logout (recommended)</div>
                </div>
              </button>

              {/* Secure Logout */}
              <button
                onClick={handleSecureLogout}
                className="w-full flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <FaShieldAlt className="h-5 w-5 text-blue-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Secure Logout</div>
                  <div className="text-sm text-gray-600">Complete session cleanup</div>
                </div>
              </button>

              {/* Emergency Logout */}
              <button
                onClick={handleEmergencyLogout}
                className="w-full flex items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
              >
                <FaFire className="h-5 w-5 text-red-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Emergency Logout</div>
                  <div className="text-sm text-gray-600">Force logout & clear all data</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowLogoutDropdown(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}