'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import VerificationGuard from '@/components/VerificationGuard'
import BookingModal from '@/components/BookingModal'
import { 
  FaSearch,
  FaWrench,
  FaLightbulb,
  FaBroom,
  FaHammer,
  FaPaintRoller,
  FaStar,
  FaBell,
  FaUser,
  FaHome,
  FaCalendarAlt,
  FaHeart,
  FaMapMarkerAlt,
  FaPhone,
  FaShoppingCart,
  FaCrown,
  FaFire,
  FaChartLine,
  FaCog,
  FaHistory,
  FaTimes,
  FaCheck,
  FaFilter,
  FaSort,
  FaCreditCard,
  FaHeadset,
  FaGift,
  FaPlus,
  FaEllipsisV,
  FaLocationArrow,
  FaClock
} from 'react-icons/fa'

interface User {
  email: string
  userType: 'client' | 'worker'
  isAuthenticated: boolean
  name?: string
  verified?: boolean
}

interface Service {
  name: string
  icon: any
  color: string
  description: string
  averagePrice: string
  rating: number
  bookings: number
}

interface Notification {
  id: string
  type: 'booking' | 'payment' | 'review' | 'promo'
  title: string
  message: string
  time: string
  read: boolean
}

// Enhanced services data
const services: Service[] = [
  { 
    name: 'Plumbing', 
    icon: FaWrench, 
    color: 'bg-blue-500', 
    description: 'Pipes, fixtures, repairs', 
    averagePrice: 'KSh 2,500',
    rating: 4.8,
    bookings: 1234
  },
  { 
    name: 'Electrical', 
    icon: FaLightbulb, 
    color: 'bg-yellow-500', 
    description: 'Wiring, outlets, lighting', 
    averagePrice: 'KSh 3,000',
    rating: 4.9,
    bookings: 987
  },
  { 
    name: 'Cleaning', 
    icon: FaBroom, 
    color: 'bg-green-500', 
    description: 'Home & office cleaning', 
    averagePrice: 'KSh 1,800',
    rating: 4.7,
    bookings: 2156
  },
  { 
    name: 'Carpentry', 
    icon: FaHammer, 
    color: 'bg-orange-500', 
    description: 'Furniture, repairs, custom', 
    averagePrice: 'KSh 4,000',
    rating: 4.6,
    bookings: 678
  },
  { 
    name: 'Painting', 
    icon: FaPaintRoller, 
    color: 'bg-purple-500', 
    description: 'Interior & exterior', 
    averagePrice: 'KSh 5,500',
    rating: 4.8,
    bookings: 543
  },
  { 
    name: 'Appliance Repair', 
    icon: FaCog, 
    color: 'bg-red-500', 
    description: 'Washing machines, fridges', 
    averagePrice: 'KSh 2,200',
    rating: 4.5,
    bookings: 432
  }
]

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your plumbing service is scheduled for tomorrow at 10:00 AM',
    time: '2 hours ago',
    read: false
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Successful',
    message: 'KSh 2,500 payment completed for electrical service',
    time: '1 day ago',
    read: false
  },
  {
    id: '3',
    type: 'review',
    title: 'Service Completed',
    message: 'Please rate your recent cleaning service experience',
    time: '2 days ago',
    read: true
  },
  {
    id: '4',
    type: 'promo',
    title: 'Special Offer',
    message: '20% off on all carpentry services this week!',
    time: '3 days ago',
    read: true
  }
]

// Sample data for the enhanced dashboard
const popularServices = [
  { id: 1, name: 'Plumbing', icon: FaWrench, color: 'bg-orange-500', bookings: 1240 },
  { id: 2, name: 'Electrical', icon: FaLightbulb, color: 'bg-yellow-500', bookings: 980 },
  { id: 3, name: 'Cleaning', icon: FaBroom, color: 'bg-green-500', bookings: 2150 },
  { id: 4, name: 'Carpentry', icon: FaHammer, color: 'bg-amber-600', bookings: 750 },
  { id: 5, name: 'Painting', icon: FaPaintRoller, color: 'bg-purple-500', bookings: 640 },
]

const featuredProviders = [
  {
    id: 1,
    name: 'David Kimani',
    service: 'Plumber',
    rating: 4.9,
    reviews: 128,
    image: '/images/providers/david.jpg',
    badge: 'Premium',
    distance: '2.1 km',
    price: 'KES 2,500/hr'
  },
  {
    id: 2,
    name: 'Sarah Wanjiku',
    service: 'Electrician',
    rating: 4.8,
    reviews: 96,
    image: '/images/providers/sarah.jpg',
    badge: 'Top Rated',
    distance: '1.8 km',
    price: 'KES 3,000/hr'
  },
  {
    id: 3,
    name: 'James Ochieng',
    service: 'Carpenter',
    rating: 4.7,
    reviews: 84,
    image: '/images/providers/james.jpg',
    badge: 'Verified',
    distance: '3.2 km',
    price: 'KES 2,200/hr'
  },
]

const quickActions = [
  { name: 'Emergency Service', icon: FaFire, color: 'bg-red-500', description: '24/7 Available' },
  { name: 'Book Appointment', icon: FaCalendarAlt, color: 'bg-orange-500', description: 'Schedule Now' },
  { name: 'My Bookings', icon: FaHome, color: 'bg-blue-500', description: 'View History' },
  { name: 'Favorites', icon: FaHeart, color: 'bg-pink-500', description: 'Saved Services' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [filteredServices, setFilteredServices] = useState(services)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push('/login')
    }
    setIsLoading(false)
  }, [router])

  // Filter services based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(services)
      setShowSearchSuggestions(false)
    } else {
      const filtered = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredServices(filtered)
      setShowSearchSuggestions(true)
    }
  }, [searchQuery])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications || showSearchSuggestions || showUserMenu) {
        setShowNotifications(false)
        setShowSearchSuggestions(false)
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications, showSearchSuggestions, showUserMenu])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleServiceClick = (service: Service) => {
    // Navigate to booking page with pre-selected service
    router.push(`/booking?service=${encodeURIComponent(service.name.toLowerCase())}`)
  }

  const handleBookingComplete = (bookingData: any) => {
    console.log('Booking completed:', bookingData)
    setShowBookingModal(false)
    setSelectedService(null)
    
    // Add a success notification
    const successNotification: Notification = {
      id: Date.now().toString(),
      type: 'booking',
      title: 'Booking Confirmed!',
      message: `Your ${bookingData.service || 'service'} booking has been confirmed for ${bookingData.date || 'soon'}.`,
      time: 'Just now',
      read: false
    }
    
    setNotifications(prev => [successNotification, ...prev])
    
    // Show a brief success message (you could use a toast library here)
    setTimeout(() => {
      console.log('Booking confirmation displayed')
    }, 100)
  }

  const handleQuickBooking = (serviceName?: string) => {
    // Navigate to booking page, optionally with pre-selected service
    if (serviceName) {
      router.push(`/booking?service=${encodeURIComponent(serviceName.toLowerCase())}`)
    } else {
      router.push('/booking')
    }
  }

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  // Quick actions data
  const quickActions = [
    { 
      name: 'Book Service', 
      icon: FaCalendarAlt, 
      color: 'bg-orange-500', 
      description: 'Quick booking',
      action: () => handleQuickBooking()
    },
    { 
      name: 'My Bookings', 
      icon: FaHistory, 
      color: 'bg-blue-500', 
      description: 'View history',
      action: () => router.push('/bookings')
    },
    { 
      name: 'Favorites', 
      icon: FaHeart, 
      color: 'bg-red-500', 
      description: 'Saved services',
      action: () => router.push('/favorites')
    },
    { 
      name: 'Support', 
      icon: FaHeadset, 
      color: 'bg-green-500', 
      description: 'Get help',
      action: () => router.push('/support')
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isClient = user.userType === 'client'

  return (
    <VerificationGuard requireVerification={true}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Image 
                src="/images/logo.jpg" 
                alt="Solutil Logo" 
                width={60}
                height={60}
                className="rounded-xl object-cover shadow-md"
              />
              {/* <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  Solutil
                </span>
                <p className="text-sm text-gray-500">Your Service Partner</p>
              </div> */}
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Interactive Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <FaBell className="text-gray-600 text-xl hover:text-orange-600 transition-colors" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800">Notifications</h3>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => markNotificationAsRead(notification.id)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-orange-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                notification.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                                notification.type === 'payment' ? 'bg-green-100 text-green-600' :
                                notification.type === 'review' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-purple-100 text-purple-600'
                              }`}>
                                {notification.type === 'booking' ? <FaCalendarAlt className="text-xs" /> :
                                 notification.type === 'payment' ? <FaCreditCard className="text-xs" /> :
                                 notification.type === 'review' ? <FaStar className="text-xs" /> :
                                 <FaGift className="text-xs" />}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 text-sm">{notification.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <span className="text-xs text-gray-400 mt-1">{notification.time}</span>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                          }}
                          className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">Welcome back!</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 text-sm font-medium shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner - Similar to mobile design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-r from-orange-600 via-orange-700 to-amber-600 rounded-3xl p-8 md:p-12 mb-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Get 30% off
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-xl text-orange-100 mb-6"
              >
                Just by Booking Home Services
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                onClick={() => handleQuickBooking()}
                className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 transition-all transform hover:scale-105 shadow-xl"
              >
                Book Now
              </motion.button>
            </div>
            <div className="hidden lg:flex justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="w-64 h-64 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm"
              >
                <FaWrench className="text-8xl text-white/80" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-orange-100 relative"
        >
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search for services, providers, or areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchSuggestions(true)}
              className="w-full pl-12 pr-24 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
            />
            <button 
              onClick={() => console.log('Search clicked:', searchQuery)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Search
            </button>
            
            {/* Search Suggestions */}
            <AnimatePresence>
              {showSearchSuggestions && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-2 z-50 max-h-60 overflow-y-auto"
                >
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service, index) => (
                      <motion.div
                        key={service.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          handleServiceClick(service)
                          setShowSearchSuggestions(false)
                          setSearchQuery('')
                        }}
                        className="flex items-center space-x-3 p-4 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className={`w-10 h-10 ${service.color} rounded-lg flex items-center justify-center`}>
                          <service.icon className="text-white text-sm" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{service.name}</h4>
                          <p className="text-sm text-gray-500">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-orange-600">{service.averagePrice}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <FaStar className="text-yellow-400 mr-1" />
                            {service.rating}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No services found for "{searchQuery}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              onClick={action.action}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group border border-gray-100 hover:border-orange-200"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="text-white text-xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{action.name}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Services */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Popular Services</h2>
                <Link href="/services" className="text-orange-600 hover:text-orange-700 font-medium">
                  View all
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {popularServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    onClick={() => {
                      const fullService = services.find(s => s.name === service.name)
                      if (fullService) {
                        handleServiceClick(fullService)
                      }
                    }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group border border-gray-200 hover:border-orange-200"
                  >
                    <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <service.icon className="text-white text-lg" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.bookings} bookings</p>
                    <button className="mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full group-hover:bg-orange-200 transition-colors">
                      Book Now
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6 mt-6 border border-orange-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { action: 'Plumbing service completed', time: '2 hours ago', icon: FaWrench, color: 'bg-green-500' },
                  { action: 'New booking confirmed', time: '4 hours ago', icon: FaCalendarAlt, color: 'bg-orange-500' },
                  { action: 'Payment processed', time: '1 day ago', icon: FaShoppingCart, color: 'bg-blue-500' },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center`}>
                      <activity.icon className="text-white text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Service Providers Sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Top Providers</h2>
                <Link href="/providers" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                {featuredProviders.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer border border-orange-100"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {provider.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-800 text-sm">{provider.name}</h3>
                          <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
                            {provider.badge}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{provider.service}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <FaStar className="text-yellow-400 text-xs" />
                            <span className="text-sm font-medium">{provider.rating}</span>
                            <span className="text-xs text-gray-500">({provider.reviews})</span>
                          </div>
                          <span className="text-xs text-orange-600 font-medium">{provider.price}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{provider.distance} away</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuickBooking(provider.service)
                            }}
                            className="bg-orange-600 text-white text-xs px-3 py-1 rounded-full hover:bg-orange-700 transition-colors"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl p-6 mt-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Your Stats</h3>
                <FaChartLine className="text-2xl text-orange-200" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-orange-100">Total Bookings</span>
                  <span className="font-bold">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-100">Money Saved</span>
                  <span className="font-bold">KES 12,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-100">Favorite Service</span>
                  <span className="font-bold">Cleaning</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false)
              setSelectedService(null)
            }}
            service={selectedService ? {
              name: selectedService.name,
              icon: selectedService.icon,
              description: selectedService.description
            } : null}
            onBookingComplete={handleBookingComplete}
          />
        )}
      </AnimatePresence>
    </div>
    </VerificationGuard>
  )
}
