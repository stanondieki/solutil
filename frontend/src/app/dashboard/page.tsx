'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SafeImage from '@/components/SafeImage'
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
  FaRocket,
  FaEye
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

interface ProviderService {
  _id: string
  title: string
  description: string
  category: string
  price: number
  priceType: 'fixed' | 'hourly' | 'quote'
  duration: number
  images: string[]
}

interface Provider {
  _id: string
  name: string
  email: string
  profilePicture: string | null
  providerProfile: {
    experience: string
    skills: string[]
    hourlyRate: number
    availability: any
    serviceAreas: string[]
    bio: string
    completedJobs: number
    rating: number
    reviewCount: number
    services: any[]
  }
  services: ProviderService[]
  providerStatus: string
  createdAt: string
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
  const [providers, setProviders] = useState<any[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
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
        await fetchProviders()
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
      await fetchProviders()
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

  // Fetch live providers data
  const fetchProviders = async () => {
    if (!user || !RoleManager.isClient(user.userType)) return
    
    setLoadingProviders(true)
    try {
      const token = localStorage.getItem('authToken')
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'
      
      // First try to get providers through services
      const response = await fetch(`${BACKEND_URL}/api/provider-services/public?limit=3`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Providers API Response:', data) // Debug log
        
        // Extract providers from services data
        const services = data.data?.services || data.services || []
        console.log('Services found:', services.length) // Debug log
        
        if (services.length > 0) {
          console.log('First service sample:', services[0]) // Debug log
        }
        
        const uniqueProviders = services.reduce((acc: any[], service: any) => {
          if (service.providerId && !acc.find(p => p._id === service.providerId._id)) {
            // Map the provider data to match our interface
            const mappedProvider = {
              _id: service.providerId._id,
              name: service.providerId.name,
              email: service.providerId.email,
              phone: service.providerId.phone,
              profilePicture: service.providerId.profilePicture || null,
              providerProfile: {
                businessName: service.providerId.providerProfile?.businessName || service.providerId.name,
                experience: service.providerId.providerProfile?.experience || 'Experienced professional',
                skills: service.providerId.providerProfile?.skills || [],
                hourlyRate: service.providerId.providerProfile?.hourlyRate || service.price || 0,
                availability: service.providerId.providerProfile?.availability || {},
                serviceAreas: service.serviceArea || [],
                bio: service.providerId.providerProfile?.bio || service.description || '',
                completedJobs: service.providerId.providerProfile?.completedJobs || service.totalBookings || 0,
                rating: service.providerId.providerProfile?.rating || service.rating || 0,
                reviewCount: service.providerId.providerProfile?.reviewCount || service.reviewCount || 0,
                services: []
              },
              services: [],
              providerStatus: 'approved', // Assume approved since they have active services
              createdAt: service.createdAt || new Date().toISOString()
            }
            acc.push(mappedProvider)
          }
          return acc
        }, [])
        
        console.log('Unique providers extracted:', uniqueProviders.length) // Debug log
        setProviders(uniqueProviders)
        
        // If no providers found from services, try direct provider lookup
        if (uniqueProviders.length === 0) {
          console.log('No providers found in services, trying direct provider lookup...')
          await fetchProvidersDirectly()
        }
      } else {
        console.error('Failed to fetch providers data, status:', response.status)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        // Keep empty array as fallback
        setProviders([])
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
      // Keep empty array as fallback
      setProviders([])
    } finally {
      setLoadingProviders(false)
    }
  }

  // Alternative method to fetch providers directly (backup)
  const fetchProvidersDirectly = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'
      
      // Use the verified providers endpoint
      const response = await fetch(`${BACKEND_URL}/api/providers/verified/all?limit=3`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Direct providers response:', data)
        const directProviders = data.data?.providers || data.providers || []
        
        console.log('Found direct providers:', directProviders.length)
        
        // Map to our expected format
        const mappedProviders = directProviders.map((provider: any) => ({
          _id: provider._id,
          name: provider.name,
          email: provider.email,
          phone: provider.phone || '',
          profilePicture: provider.avatar?.url || provider.profilePicture || null,
          providerProfile: {
            businessName: provider.providerProfile?.businessName || provider.name,
            experience: provider.providerProfile?.experience || 'Experienced professional',
            skills: provider.providerProfile?.skills || [],
            hourlyRate: provider.providerProfile?.hourlyRate || 500, // Default rate
            availability: provider.providerProfile?.availability || {},
            serviceAreas: provider.providerProfile?.serviceAreas || ['Nairobi'],
            bio: provider.providerProfile?.bio || `Professional ${provider.name} ready to help with your service needs.`,
            completedJobs: provider.providerProfile?.completedJobs || 0,
            rating: provider.providerProfile?.rating || provider.rating || 4.5, // Default good rating
            reviewCount: provider.providerProfile?.reviewCount || provider.reviewCount || 0,
            services: provider.providerProfile?.services || []
          },
          services: [],
          providerStatus: provider.providerStatus || 'approved',
          createdAt: provider.createdAt || new Date().toISOString()
        }))
        
        setProviders(mappedProviders)
        console.log('Set providers from direct call:', mappedProviders.length)
      } else {
        console.log('Direct providers API not available or failed')
      }
    } catch (error) {
      console.error('Error in direct provider fetch:', error)
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
        { name: 'My Profile', icon: FaUser, color: 'bg-gradient-to-r from-blue-500 to-blue-600', description: 'Manage profile & settings', href: '/profile' },
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
                <SafeImage
                  src="/images/log.png"
                  alt="Solutil"
                  width={130}
                  height={130}
                  className="group-hover:scale-105 transition-transform duration-200"
                  fallbackIcon={<div className="text-orange-600 font-bold text-xl">Solutil</div>}
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
                    <SafeImage
                      src={(user as any).avatar.url}
                      alt={user.name || 'User'}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      fallbackIcon={<span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </span>}
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

        {/* Client-specific sections */}
        {user && RoleManager.isClient(user.userType) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Client Stats Section - Shows first on mobile, third on desktop */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[700px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">My Stats</h3>
                  <div className="text-xs text-gray-500">This month</div>
                </div>
                
                {/* Welcome Header */}
                <div className="text-center mb-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                  <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaUser className="h-8 w-8 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Welcome, {user.name.split(' ')[0]}!</h4>
                  <p className="text-sm text-gray-600">Track your service activities</p>
                </div>
                
                {/* Stats Grid */}
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                        <FaCalendarAlt className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Total Bookings</div>
                        <div className="text-xs text-gray-600">All time</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {dashboardStats.find(stat => stat.label === 'Total Bookings')?.value || '0'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mr-3">
                        <FaCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Completed</div>
                        <div className="text-xs text-gray-600">Services done</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {dashboardStats.find(stat => stat.label === 'Completed')?.value || '0'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center mr-3">
                        <FaClock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Pending</div>
                        <div className="text-xs text-gray-600">In progress</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {dashboardStats.find(stat => stat.label === 'Pending')?.value || '0'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                        <FaCreditCard className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Money Spent</div>
                        <div className="text-xs text-gray-600">All time</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {dashboardStats.find(stat => stat.label === 'Money Spent')?.value || 'KES 0'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center mr-3">
                        <FaHeart className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Favorite Services</div>
                        <div className="text-xs text-gray-600">Saved providers</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {dashboardStats.find(stat => stat.label === 'Favorite Services')?.value || '0'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center mr-3">
                        <FaStar className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Reviews Given</div>
                        <div className="text-xs text-gray-600">Service ratings</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {dashboardStats.find(stat => stat.label === 'Reviews Given')?.value || '0'}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-900 mb-3">Quick Actions</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      href="/bookings"
                      className="flex items-center justify-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
                    >
                      <FaCalendarAlt className="h-4 w-4 mr-2 text-orange-600" />
                      <span className="text-xs font-medium text-orange-700">Book Now</span>
                    </Link>
                    <Link 
                      href="/bookings"
                      className="flex items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <FaClipboardList className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">My Orders</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Directory - Shows second on mobile, first on desktop */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[700px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Featured Providers</h3>
                  <Link 
                    href="/providers" 
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center"
                  >
                    View All <FaArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  {loadingProviders ? (
                    // Loading skeleton for providers
                    [...Array(3)].map((_, index) => (
                      <div key={index} className="flex items-center p-4 border border-gray-100 rounded-xl animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-40"></div>
                        </div>
                        <div className="w-20 h-8 bg-gray-200 rounded"></div>
                      </div>
                    ))
                  ) : providers.length > 0 ? (
                    providers.map((provider: Provider) => (
                    <div key={provider._id} className="border border-gray-100 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all duration-200">
                      {/* Provider Header */}
                      <div className="flex items-center p-4 border-b border-gray-100">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                            {provider.profilePicture ? (
                              <SafeImage
                                src={provider.profilePicture}
                                alt={provider.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                fallbackIcon={<FaUser className="h-6 w-6 text-orange-600" />}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-orange-100">
                                <FaUser className="h-6 w-6 text-orange-600" />
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        
                        <div className="flex-1 ml-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                            <span className="text-sm font-medium text-orange-600">
                              {provider.providerProfile?.hourlyRate ? `KES ${provider.providerProfile.hourlyRate}/hr` : 'Contact for price'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {provider.providerProfile?.experience || 'Professional Service Provider'}
                          </p>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <FaStar className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="text-sm font-medium text-gray-700">
                                {provider.providerProfile?.rating || 4.8}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">
                                ({provider.providerProfile?.reviewCount || 0} reviews)
                              </span>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                              Available
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Link 
                            href={`/booking/${provider._id}`}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>

                      {/* Provider Services */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-semibold text-gray-800">Services Offered</h5>
                          {provider.services && provider.services.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{provider.services.length - 3} more
                            </span>
                          )}
                        </div>
                        
                        {provider.services && provider.services.length > 0 ? (
                          <div className="space-y-2">
                            {provider.services.slice(0, 3).map((service: ProviderService) => (
                              <div key={service._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900 capitalize">
                                      {service.title}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full capitalize">
                                      {service.category}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 truncate">
                                    {service.description}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <div className="text-sm font-semibold text-orange-600">
                                    KES {service.price.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {service.priceType === 'hourly' ? '/hr' : service.priceType === 'fixed' ? 'fixed' : 'quote'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {provider.providerProfile?.skills?.slice(0, 3).map((skill: string, idx: number) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {skill}
                              </span>
                            ))}
                            {provider.providerProfile?.skills?.length > 3 && (
                              <span className="text-xs text-gray-500">+{provider.providerProfile.skills.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    ))
                  ) : (
                    // Empty state when no providers
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaUsers className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Providers Available</h4>
                      <p className="text-gray-600 mb-4">We're working on getting more service providers in your area.</p>
                      <Link 
                        href="/services"
                        className="inline-flex items-center bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                      >
                        Browse Services
                      </Link>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 text-center">
                  <Link 
                    href="/providers"
                    className="inline-flex items-center bg-orange-100 text-orange-700 px-6 py-3 rounded-xl font-medium hover:bg-orange-200 transition-all duration-200"
                  >
                    <FaUsers className="mr-2 h-4 w-4" />
                    Browse All Providers
                  </Link>
                </div>
              </div>
            </div>


          </div>
        )}

        {/* Provider-specific sections */}
        {user && RoleManager.isProvider(user.userType) && user.providerStatus === 'approved' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Provider Stats Section */}
            <div className="lg:col-span-1 order-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[700px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">My Provider Stats</h3>
                  <div className="text-xs text-gray-500">This month</div>
                </div>
                
                {/* Welcome Header */}
                <div className="text-center mb-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                  <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaTools className="h-8 w-8 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Welcome, {user.name.split(' ')[0]}!</h4>
                  <p className="text-sm text-gray-600">Track your service performance</p>
                </div>
                
                {/* Provider Stats Grid */}
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center mr-3">
                        <FaClipboardList className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Total Bookings</div>
                        <div className="text-xs text-gray-600">All time</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {dashboardStats.find(stat => stat.label === 'Total Bookings')?.value || '0'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center mr-3">
                        <FaCreditCard className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Monthly Earnings</div>
                        <div className="text-xs text-gray-600">This month</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {dashboardStats.find(stat => stat.label === 'This Month Earnings')?.value || 'KES 0'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center mr-3">
                        <FaStar className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Average Rating</div>
                        <div className="text-xs text-gray-600">From clients</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {dashboardStats.find(stat => stat.label === 'Rating')?.value || '0.0'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                        <FaTools className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Active Services</div>
                        <div className="text-xs text-gray-600">Currently offered</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {dashboardStats.find(stat => stat.label === 'Active Services')?.value || '0'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                        <FaEye className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Profile Views</div>
                        <div className="text-xs text-gray-600">This week</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {dashboardData?.profileViews || '0'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center mr-3">
                        <FaChartLine className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Response Rate</div>
                        <div className="text-xs text-gray-600">Message replies</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {dashboardData?.responseRate || '100%'}
                    </div>
                  </div>
                </div>

                {/* Provider Quick Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-900 mb-3">Quick Actions</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      href="/provider/services"
                      className="flex items-center justify-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
                    >
                      <FaTools className="h-4 w-4 mr-2 text-orange-600" />
                      <span className="text-xs font-medium text-orange-700">Manage Services</span>
                    </Link>
                    <Link 
                      href="/provider/bookings"
                      className="flex items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <FaCalendarAlt className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">View Bookings</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Earnings Chart */}
            <div className="lg:col-span-2 order-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[700px]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Earnings Overview</h3>
                    <p className="text-sm text-gray-600">Track your monthly income and trends</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                      This Month
                    </button>
                    <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                      Last 6 Months
                    </button>
                  </div>
                </div>

                {/* Earnings Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-800">This Month</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {dashboardStats.find(stat => stat.label === 'This Month Earnings')?.value || 'KES 0'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                        <FaCreditCard className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Pending Payout</p>
                        <p className="text-2xl font-bold text-green-900">
                          {dashboardData?.pendingPayout ? `KES ${dashboardData.pendingPayout.toLocaleString()}` : 'KES 0'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                        <FaClock className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Total Earned</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {dashboardData?.totalEarned ? `KES ${dashboardData.totalEarned.toLocaleString()}` : 'KES 0'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <FaChartLine className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="flex-1 bg-gray-50 rounded-xl p-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <FaChartLine className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Earnings Chart Coming Soon</h4>
                  <p className="text-gray-600 text-center">
                    We're working on adding detailed earnings analytics and charts to help you track your income trends.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}



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