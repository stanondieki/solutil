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
  FaSignOutAlt
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
}

interface DashboardStat {
  label: string
  value: string | number
  icon: React.ComponentType<any>
  color: string
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
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredServices, setFilteredServices] = useState(services)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Use window.location.href for more reliable redirect after logout
      window.location.href = '/auth/login'
    }
  }, [isAuthenticated, isLoading])

  // Filter services based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(services)
    } else {
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredServices(filtered)
    }
  }, [searchQuery])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to continue</h1>
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // Role-based quick actions
  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      { name: 'My Profile', icon: FaUser, color: 'bg-blue-500', description: 'Manage Profile', href: '/profile' },
    ]

    if (RoleManager.isClient(user.userType)) {
      return [
        ...baseActions,
        { name: 'Browse Services', icon: FaSearch, color: 'bg-green-500', description: 'Find Services', href: '/services' },
        { name: 'Book Service', icon: FaCalendarAlt, color: 'bg-orange-500', description: 'Schedule Now', href: '/services/all' },
        { name: 'My Bookings', icon: FaClipboardList, color: 'bg-purple-500', description: 'View History', href: '/bookings' },
        { name: 'Emergency Service', icon: FaFire, color: 'bg-red-500', description: '24/7 Available', href: '/services?emergency=true' },
      ]
    }

    if (RoleManager.isProvider(user.userType)) {
      return [
        ...baseActions,
        { name: 'My Services', icon: FaTools, color: 'bg-green-500', description: 'Manage Services', href: '/services' },
        { name: 'Bookings', icon: FaClipboardList, color: 'bg-orange-500', description: 'Customer Bookings', href: '/bookings' },
        { name: 'Analytics', icon: FaChartLine, color: 'bg-purple-500', description: 'View Reports', href: '/analytics' },
        ...(user.providerStatus !== 'approved' ? [
          { name: 'Upload Documents', icon: FaUpload, color: 'bg-yellow-500', description: 'Get Verified', href: '/upload-documents' }
        ] : []),
      ]
    }

    if (RoleManager.isAdmin(user.userType)) {
      return [
        ...baseActions,
        { name: 'Admin Panel', icon: FaCog, color: 'bg-red-500', description: 'System Management', href: '/admin' },
        { name: 'Users', icon: FaUsers, color: 'bg-blue-500', description: 'Manage Users', href: '/admin/users' },
        { name: 'Providers', icon: FaTools, color: 'bg-green-500', description: 'Manage Providers', href: '/admin/providers' },
        { name: 'Reports', icon: FaChartLine, color: 'bg-purple-500', description: 'System Reports', href: '/admin/reports' },
      ]
    }

    return baseActions
  }

  // Role-based dashboard stats
  const getDashboardStats = (): DashboardStat[] => {
    if (RoleManager.isClient(user.userType)) {
      return [
        { label: 'Active Bookings', value: 3, icon: FaCalendarAlt, color: 'bg-blue-500' },
        { label: 'Completed Services', value: 12, icon: FaCheck, color: 'bg-green-500' },
        { label: 'Favorite Providers', value: 8, icon: FaHeart, color: 'bg-red-500' },
        { label: 'Total Spent', value: 'KES 24,500', icon: FaCreditCard, color: 'bg-purple-500' },
      ]
    }

    if (RoleManager.isProvider(user.userType)) {
      return [
        { label: 'Pending Bookings', value: 5, icon: FaClock, color: 'bg-orange-500' },
        { label: 'Completed Jobs', value: 87, icon: FaCheck, color: 'bg-green-500' },
        { label: 'Average Rating', value: '4.8', icon: FaStar, color: 'bg-yellow-500' },
        { label: 'Monthly Earnings', value: 'KES 125,400', icon: FaCreditCard, color: 'bg-purple-500' },
      ]
    }

    if (RoleManager.isAdmin(user.userType)) {
      return [
        { label: 'Total Users', value: 2547, icon: FaUsers, color: 'bg-blue-500' },
        { label: 'Active Providers', value: 342, icon: FaTools, color: 'bg-green-500' },
        { label: 'Monthly Bookings', value: 1234, icon: FaCalendarAlt, color: 'bg-orange-500' },
        { label: 'Platform Revenue', value: 'KES 450,000', icon: FaCreditCard, color: 'bg-purple-500' },
      ]
    }

    return []
  }

  const quickActions = getQuickActions()
  const dashboardStats = getDashboardStats()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Enhanced Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left side - Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <div className="relative">
                  <Image
                    src="/images/logo.png"
                    alt="Solutil Logo"
                    width={48}
                    height={48}
                    className="rounded-xl object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Solutil
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Professional Services</p>
                </div>
              </Link>
            </div>

            {/* Center - Welcome Message (Hidden on mobile) */}
            <div className="hidden md:flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome back, {user.name}!
              </h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${RoleManager.getRoleColor(user.userType)}`}>
                  {RoleManager.getRoleDisplayName(user.userType)}
                </span>
                {user.userType === 'provider' && user.providerStatus && (
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                    RoleManager.getProviderStatusConfig(user.providerStatus).color
                  }`}>
                    {RoleManager.getProviderStatusConfig(user.providerStatus).icon} {RoleManager.getProviderStatusConfig(user.providerStatus).label}
                  </span>
                )}
              </div>
            </div>

            {/* Right side - User Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
                <FaBell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile Dropdown */}
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-600 shadow-sm hover:shadow-lg group"
                title="Logout"
              >
                <FaSignOutAlt className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Welcome Message */}
          <div className="md:hidden pb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome back, {user.name}!
            </h2>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${RoleManager.getRoleColor(user.userType)}`}>
                {RoleManager.getRoleDisplayName(user.userType)}
              </span>
              {user.userType === 'provider' && user.providerStatus && (
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                  RoleManager.getProviderStatusConfig(user.providerStatus).color
                }`}>
                  {RoleManager.getProviderStatusConfig(user.providerStatus).icon} {RoleManager.getProviderStatusConfig(user.providerStatus).label}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Promotional Banner - Only for clients */}
      {user && RoleManager.isClient(user.userType) && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-xl">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative px-8 py-6 md:px-12 md:py-8">
                <div className="flex items-center justify-between">
                  {/* Left Content */}
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Get 30% off
                    </h2>
                    <p className="text-white/90 text-lg md:text-xl font-medium mb-4">
                      Just by Booking Home Services
                    </p>
                    <Link
                      href="/services/all"
                      className="inline-flex items-center px-6 py-3 bg-white text-amber-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Book Now & Save
                      <FaFire className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                  
                  {/* Right Image */}
                  <div className="hidden md:block flex-shrink-0 ml-8">
                    <div className="relative">
                      <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <div className="text-6xl">👩‍🔧</div>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/30 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-yellow-300 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>

                {/* Mobile Image */}
                <div className="md:hidden mt-4 flex justify-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="text-4xl">👩‍🔧</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar Section - Only for clients */}
      {user && RoleManager.isClient(user.userType) && (
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-center">
              <div className="relative w-full max-w-2xl">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search here..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-lg bg-white"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="flex items-center space-x-1 text-gray-400">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className={`p-4 rounded-xl ${stat.color} text-white mr-4 shadow-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Service Providers Section - Only for Clients */}
        <RoleGuard requiredRole="client">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Service Providers</h2>
                <p className="text-gray-600">Meet our most trusted professionals</p>
              </div>
              <Link 
                href="/providers/all" 
                className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View All Providers
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-x-auto">
              {[
                { name: "Maskot Kota", profession: "Plumber", rating: 4.8, image: "/images/services/plumbing.jpg", bg: "linear-gradient(135deg, #EAD9C2, #D4C3A8)", experience: "5+ years" },
                { name: "Shams Jan", profession: "Electrician", rating: 4.8, image: "/images/services/electrical.jpg", bg: "linear-gradient(135deg, #E6D1F2, #D1B8E8)", experience: "7+ years" },
                { name: "Caleb", profession: "Cleaner", rating: 4.8, image: "/images/services/cleaning.jpg", bg: "linear-gradient(135deg, #CDE7D8, #B3DCC4)", experience: "4+ years" },
                { name: "Jackson", profession: "Electrician", rating: 4.9, image: "/images/services/electrical.jpg", bg: "linear-gradient(135deg, #E6D1F2, #D1B8E8)", experience: "6+ years" },
                { name: "Logan", profession: "Electrician", rating: 5.0, image: "/images/services/electrical.jpg", bg: "linear-gradient(135deg, #EAD9C2, #D4C3A8)", experience: "8+ years" },
                { name: "Ethan lita", profession: "Plumber", rating: 4.7, image: "/images/services/plumbing.jpg", bg: "linear-gradient(135deg, #CDE7D8, #B3DCC4)", experience: "3+ years" },
                { name: "Isabella una", profession: "Plumber", rating: 3.9, image: "/images/services/plumbing.jpg", bg: "linear-gradient(135deg, #FFE7B2, #FFD89B)", experience: "4+ years" },
                { name: "Emily jani", profession: "Electrician", rating: 4.8, image: "/images/services/electrical.jpg", bg: "linear-gradient(135deg, #EAD9C2, #D4C3A8)", experience: "6+ years" },
              ].slice(0, 4).map((p, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2"
                >
                  <div className="relative h-48 overflow-hidden" style={{background: p.bg}}>
                    <img src={p.image} alt={p.profession} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="font-bold text-gray-900 text-sm">{p.rating}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{p.name}</h3>
                    <p className="text-gray-600 mb-2">{p.profession}</p>
                    <p className="text-sm text-gray-500 mb-4">{p.experience} experience</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">
                          ✓
                        </div>
                        <span className="text-sm text-gray-500">Verified Pro</span>
                      </div>
                      <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md transform hover:scale-105 transition-all duration-200">
                        View Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </RoleGuard>

        {/* Popular Services Section - Only for Clients */}
        <RoleGuard requiredRole="client">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Popular Services</h2>
                <p className="text-gray-600 mt-1">Book trusted professionals for your home needs</p>
              </div>
              <Link
                href="/services/all"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                View All Services
              </Link>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 p-6 cursor-pointer group border border-gray-100"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`mb-4 ${service.color} rounded-2xl flex items-center justify-center w-20 h-20 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300 group-hover:scale-110`}>
                        <service.icon />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                      
                      <div className="flex items-center justify-between w-full mb-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-lg">★</span>
                          <span className="font-bold text-gray-900">{service.rating}</span>
                          <span className="text-gray-500 text-sm">({service.reviews})</span>
                        </div>
                        <span className="text-blue-600 font-bold text-lg">{service.price}</span>
                      </div>
                      
                      <Link 
                        href={`/booking/${service.name.toLowerCase()}`}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-md transform hover:scale-105 transition-all duration-200 block text-center"
                      >
                        Book Now
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Service Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-gray-600">Support Available</div>
                </div>
                <div className="text-center bg-white/50 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-600">4.8★</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </RoleGuard>

        {/* Quick Actions */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-gray-600">Fast access to your most-used features</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={action.href}
                  className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className={`p-4 rounded-2xl ${action.color} text-white inline-flex mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <action.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{action.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{action.description}</p>
                  <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                    Get started
                    <FaFire className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Provider Status Alert */}
        {user.userType === 'provider' && user.providerStatus !== 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8"
          >
            <div className="flex items-center">
              <FaBell className="text-yellow-600 h-6 w-6 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-800">Account Verification Required</h3>
                <p className="text-yellow-700 text-sm mt-1">
                  {user.providerStatus === 'pending' 
                    ? 'Your account is pending verification. Please upload your documents to start receiving bookings.'
                    : user.providerStatus === 'rejected'
                    ? 'Your verification was rejected. Please contact support or update your documents.'
                    : 'Your account is under review. We\'ll notify you once verification is complete.'
                  }
                </p>
                {user.providerStatus === 'pending' && (
                  <Link
                    href="/upload-documents"
                    className="inline-block mt-3 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm"
                  >
                    Upload Documents
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Role-specific Help Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {RoleManager.isClient(user.userType) ? 'How to Get Started' :
             RoleManager.isProvider(user.userType) ? 'Growing Your Business' :
             'Platform Management'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RoleManager.isClient(user.userType) && (
              <>
                <div className="text-center">
                  <FaSearch className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Browse Services</h3>
                  <p className="text-sm text-gray-600">Find the perfect service provider for your needs</p>
                </div>
                <div className="text-center">
                  <FaCalendarAlt className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Book Instantly</h3>
                  <p className="text-sm text-gray-600">Schedule services at your convenience</p>
                </div>
                <div className="text-center">
                  <FaStar className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Rate & Review</h3>
                  <p className="text-sm text-gray-600">Help others by sharing your experience</p>
                </div>
              </>
            )}
            
            {RoleManager.isProvider(user.userType) && (
              <>
                <div className="text-center">
                  <FaUser className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Complete Profile</h3>
                  <p className="text-sm text-gray-600">Add photos, skills, and experience details</p>
                </div>
                <div className="text-center">
                  <FaCheck className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Get Verified</h3>
                  <p className="text-sm text-gray-600">Upload documents to build trust with clients</p>
                </div>
                <div className="text-center">
                  <FaChartLine className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Grow Revenue</h3>
                  <p className="text-sm text-gray-600">Deliver quality service and build your reputation</p>
                </div>
              </>
            )}
            
            {RoleManager.isAdmin(user.userType) && (
              <>
                <div className="text-center">
                  <FaUsers className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">User Management</h3>
                  <p className="text-sm text-gray-600">Monitor and manage platform users</p>
                </div>
                <div className="text-center">
                  <FaChartLine className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Analytics</h3>
                  <p className="text-sm text-gray-600">Track platform performance and growth</p>
                </div>
                <div className="text-center">
                  <FaCog className="h-8 w-8 text-gray-600 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">System Settings</h3>
                  <p className="text-sm text-gray-600">Configure platform settings and policies</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          try {
            setShowLogoutModal(false)
            // Show a loading state or toast message here if desired
            await logout()
          } catch (error) {
            console.error('Logout error:', error)
            // Could show an error message here, but still redirect for security
            window.location.href = '/auth/login'
          }
        }}
        userName={user.name || user.email?.split('@')[0]}
      />
    </div>
  )
}