'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import { providerBookingsAPI, handleAPIError, getSuccessMessage } from '@/lib/providerAPI'
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaDollarSign,
  FaCheck,
  FaTimes,
  FaEye,
  FaComment,
  FaStar,
  FaArrowLeft,
  FaFilter,
  FaSearch,
  FaSort,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaPlay,
  FaCamera,
  FaPaperPlane,
  FaHandshake,
  FaBell,
  FaExternalLinkAlt,
  FaFileAlt,
  FaDownload
} from 'react-icons/fa'

// TypeScript interfaces
interface Customer {
  _id: string
  name: string
  email: string
  phone: string
  avatar?: string
  rating?: number
  totalBookings?: number
}

interface Service {
  _id: string
  title: string
  category: string
  duration: number
  price: number
  priceType: 'fixed' | 'hourly' | 'quote'
}

interface Booking {
  _id: string
  bookingNumber: string
  customer: Customer
  service: Service
  scheduledDate: string
  scheduledTime: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'
  location: {
    address: string
    coordinates?: [number, number]
    instructions?: string
  }
  estimatedPrice: number
  finalPrice?: number
  specialInstructions?: string
  providerNotes?: string
  completionPhotos?: string[]
  customerRating?: number
  customerReview?: string
  providerRating?: number
  providerReview?: string
  createdAt: string
  updatedAt: string
  communicationHistory?: Message[]
}

interface Message {
  _id: string
  sender: 'provider' | 'customer'
  message: string
  timestamp: string
  type: 'text' | 'image' | 'system'
}

interface BookingStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  completedBookings: number
  totalRevenue: number
  averageRating: number
}

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
  'in_progress': 'bg-purple-100 text-purple-800 border-purple-200',
  'completed': 'bg-green-100 text-green-800 border-green-200',
  'cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
  'rejected': 'bg-red-100 text-red-800 border-red-200'
}

const statusIcons = {
  'pending': FaClock,
  'confirmed': FaCheckCircle,
  'in_progress': FaSpinner,
  'completed': FaCheck,
  'cancelled': FaTimesCircle,
  'rejected': FaTimes
}

const BookingsPage: React.FC = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('scheduledDate')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  // Mock data for development - replace with API calls
  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const response = await providerBookingsAPI.getBookings({
        status: statusFilter,
        date: dateFilter,
        limit: '50',
        page: '1'
      })
      
      if (response.status === 'success') {
        setBookings(response.data.bookings)
        setStats(response.data.stats)
      } else {
        throw new Error('Failed to load bookings')
      }
      const mockBookings: Booking[] = [
        {
          _id: '1',
          bookingNumber: 'BK-2024-001',
          customer: {
            _id: 'c1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+254712345678',
            rating: 4.8,
            totalBookings: 12
          },
          service: {
            _id: 's1',
            title: 'Emergency Plumbing Repair',
            category: 'plumbing',
            duration: 120,
            price: 75,
            priceType: 'hourly'
          },
          scheduledDate: '2024-01-25',
          scheduledTime: '10:00',
          status: 'pending',
          location: {
            address: '123 Westlands Road, Nairobi',
            instructions: 'Gate 2, Apartment 5B'
          },
          estimatedPrice: 150,
          specialInstructions: 'Kitchen sink pipe burst, urgent repair needed',
          createdAt: '2024-01-24T08:30:00Z',
          updatedAt: '2024-01-24T08:30:00Z'
        },
        {
          _id: '2',
          bookingNumber: 'BK-2024-002',
          customer: {
            _id: 'c2',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            phone: '+254723456789',
            rating: 4.5,
            totalBookings: 8
          },
          service: {
            _id: 's2',
            title: 'House Deep Cleaning',
            category: 'cleaning',
            duration: 240,
            price: 150,
            priceType: 'fixed'
          },
          scheduledDate: '2024-01-26',
          scheduledTime: '09:00',
          status: 'confirmed',
          location: {
            address: '456 Karen Boulevard, Nairobi',
            instructions: 'Blue gate, press intercom'
          },
          estimatedPrice: 150,
          specialInstructions: '3-bedroom house, focus on kitchen and bathrooms',
          createdAt: '2024-01-23T14:20:00Z',
          updatedAt: '2024-01-24T09:15:00Z'
        },
        {
          _id: '3',
          bookingNumber: 'BK-2024-003',
          customer: {
            _id: 'c3',
            name: 'Michael Johnson',
            email: 'michael@example.com',
            phone: '+254734567890',
            rating: 4.9,
            totalBookings: 15
          },
          service: {
            _id: 's1',
            title: 'Emergency Plumbing Repair',
            category: 'plumbing',
            duration: 120,
            price: 75,
            priceType: 'hourly'
          },
          scheduledDate: '2024-01-22',
          scheduledTime: '14:30',
          status: 'completed',
          location: {
            address: '789 Kilimani Street, Nairobi'
          },
          estimatedPrice: 225,
          finalPrice: 200,
          customerRating: 5,
          customerReview: 'Excellent service, very professional and quick!',
          completionPhotos: ['/images/work1.jpg', '/images/work2.jpg'],
          createdAt: '2024-01-21T11:00:00Z',
          updatedAt: '2024-01-22T16:45:00Z'
        }
      ]

      setBookings(mockBookings)
      
      // Calculate stats
      const totalBookings = mockBookings.length
      const pendingBookings = mockBookings.filter(b => b.status === 'pending').length
      const confirmedBookings = mockBookings.filter(b => b.status === 'confirmed').length
      const completedBookings = mockBookings.filter(b => b.status === 'completed').length
      const totalRevenue = mockBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.finalPrice || b.estimatedPrice), 0)
      const avgRating = mockBookings
        .filter(b => b.customerRating)
        .reduce((sum, b) => sum + (b.customerRating || 0), 0) / 
        mockBookings.filter(b => b.customerRating).length

      setStats({
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalRevenue,
        averageRating: Math.round(avgRating * 10) / 10 || 0
      })
      
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    
    const now = new Date()
    const bookingDate = new Date(booking.scheduledDate)
    let matchesDate = true
    
    if (dateFilter === 'today') {
      matchesDate = bookingDate.toDateString() === now.toDateString()
    } else if (dateFilter === 'upcoming') {
      matchesDate = bookingDate >= now
    } else if (dateFilter === 'past') {
      matchesDate = bookingDate < now
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    switch (sortBy) {
      case 'customer':
        return a.customer.name.localeCompare(b.customer.name)
      case 'service':
        return a.service.title.localeCompare(b.service.title)
      case 'status':
        return a.status.localeCompare(b.status)
      case 'price':
        return b.estimatedPrice - a.estimatedPrice
      default: // scheduledDate
        return new Date(a.scheduledDate + ' ' + a.scheduledTime).getTime() - 
               new Date(b.scheduledDate + ' ' + b.scheduledTime).getTime()
    }
  })

  const updateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const response = await providerBookingsAPI.updateBookingStatus(bookingId, newStatus, '')
      
      if (response.status === 'success') {
        setBookings(prev => prev.map(booking => 
          booking._id === bookingId 
            ? response.data.booking
            : booking
        ))
        alert(getSuccessMessage('status_update', 'Booking'))
        loadBookings() // Refresh stats
      } else {
        throw new Error('Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      alert(handleAPIError(error))
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const bookingDate = new Date(date + ' ' + time)
    return {
      date: bookingDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: bookingDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const getStatusInfo = (status: Booking['status']) => {
    const Icon = statusIcons[status]
    return {
      Icon,
      color: statusColors[status],
      label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
    }
  }

  const getTodaysBookings = () => {
    const today = new Date().toDateString()
    return bookings.filter(booking => 
      new Date(booking.scheduledDate).toDateString() === today
    ).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  const todaysBookings = getTodaysBookings()

  return (
    <RoleGuard requiredRole='provider'>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
                >
                  <FaArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                  <p className="text-gray-600 mt-1">Manage your service bookings</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-3 ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-3 ${viewMode === 'calendar' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    Calendar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaCalendarAlt className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FaClock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaCheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <FaDollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">KSh {stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FaStar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating || '--'}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Today's Schedule */}
          {todaysBookings.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FaBell className="h-5 w-5 text-orange-600 mr-2" />
                  Today's Schedule
                </h2>
                <span className="text-sm text-gray-500">
                  {todaysBookings.length} appointment{todaysBookings.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todaysBookings.map((booking) => {
                  const statusInfo = getStatusInfo(booking.status)
                  const { date, time } = formatDateTime(booking.scheduledDate, booking.scheduledTime)
                  
                  return (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-orange-700">{time}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          <statusInfo.Icon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{booking.service.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{booking.customer.name}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                        {booking.location.address.split(',')[0]}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Date Filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="scheduledDate">Date & Time</option>
                  <option value="customer">Customer Name</option>
                  <option value="service">Service Type</option>
                  <option value="status">Status</option>
                  <option value="price">Price</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {sortedBookings.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Your bookings will appear here when customers book your services'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBookings.map((booking, index) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  index={index}
                  onStatusUpdate={updateBookingStatus}
                  onViewDetails={(booking) => {
                    setSelectedBooking(booking)
                    setShowDetailsModal(true)
                  }}
                  formatDateTime={formatDateTime}
                  getStatusInfo={getStatusInfo}
                />
              ))}
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedBooking && (
            <BookingDetailsModal
              booking={selectedBooking}
              isOpen={showDetailsModal}
              onClose={() => {
                setShowDetailsModal(false)
                setSelectedBooking(null)
              }}
              onStatusUpdate={updateBookingStatus}
              formatDateTime={formatDateTime}
              getStatusInfo={getStatusInfo}
            />
          )}
        </AnimatePresence>
      </div>
    </RoleGuard>
  )
}

// Booking Card Component
interface BookingCardProps {
  booking: Booking
  index: number
  onStatusUpdate: (bookingId: string, status: Booking['status']) => void
  onViewDetails: (booking: Booking) => void
  formatDateTime: (date: string, time: string) => { date: string; time: string }
  getStatusInfo: (status: Booking['status']) => any
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  index,
  onStatusUpdate,
  onViewDetails,
  formatDateTime,
  getStatusInfo
}) => {
  const { date, time } = formatDateTime(booking.scheduledDate, booking.scheduledTime)
  const statusInfo = getStatusInfo(booking.status)
  const isUrgent = booking.status === 'pending' && 
    new Date(booking.scheduledDate + ' ' + booking.scheduledTime).getTime() - Date.now() < 24 * 60 * 60 * 1000

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
        isUrgent ? 'border-orange-200 bg-orange-50' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FaUser className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {booking.customer.name}
                </h3>
                {booking.customer.rating && (
                  <div className="flex items-center space-x-1">
                    <FaStar className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{booking.customer.rating}</span>
                  </div>
                )}
                {isUrgent && (
                  <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                    <FaExclamationTriangle className="h-3 w-3 mr-1" />
                    Urgent
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">#{booking.bookingNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Service</p>
              <p className="text-sm text-gray-600">{booking.service.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Date & Time</p>
              <p className="text-sm text-gray-600">{date}, {time}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Location</p>
              <p className="text-sm text-gray-600 truncate">{booking.location.address.split(',')[0]}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Price</p>
              <p className="text-sm text-green-600 font-semibold">
                KSh {(booking.finalPrice || booking.estimatedPrice).toLocaleString()}
              </p>
            </div>
          </div>

          {booking.specialInstructions && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-1">Special Instructions</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{booking.specialInstructions}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end space-y-3 ml-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
            <statusInfo.Icon className="h-4 w-4 mr-1" />
            {statusInfo.label}
          </span>

          <div className="flex flex-wrap gap-2">
            {booking.status === 'pending' && (
              <>
                <button
                  onClick={() => onStatusUpdate(booking._id, 'confirmed')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                >
                  <FaCheck className="h-3 w-3" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => onStatusUpdate(booking._id, 'rejected')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                >
                  <FaTimes className="h-3 w-3" />
                  <span>Decline</span>
                </button>
              </>
            )}
            
            {booking.status === 'confirmed' && (
              <button
                onClick={() => onStatusUpdate(booking._id, 'in_progress')}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1"
              >
                <FaPlay className="h-3 w-3" />
                <span>Start</span>
              </button>
            )}
            
            {booking.status === 'in_progress' && (
              <button
                onClick={() => onStatusUpdate(booking._id, 'completed')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
              >
                <FaCheckCircle className="h-3 w-3" />
                <span>Complete</span>
              </button>
            )}

            <button
              onClick={() => onViewDetails(booking)}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1"
            >
              <FaEye className="h-3 w-3" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Booking Details Modal Component
interface BookingDetailsModalProps {
  booking: Booking
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (bookingId: string, status: Booking['status']) => void
  formatDateTime: (date: string, time: string) => { date: string; time: string }
  getStatusInfo: (status: Booking['status']) => any
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onStatusUpdate,
  formatDateTime,
  getStatusInfo
}) => {
  const { date, time } = formatDateTime(booking.scheduledDate, booking.scheduledTime)
  const statusInfo = getStatusInfo(booking.status)
  const [activeTab, setActiveTab] = useState<'details' | 'communication' | 'photos'>('details')

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <p className="text-gray-600 mt-1">#{booking.bookingNumber}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                <statusInfo.Icon className="h-4 w-4 mr-1" />
                {statusInfo.label}
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mt-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                activeTab === 'details'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('communication')}
              className={`pb-2 border-b-2 font-medium transition-colors ${
                activeTab === 'communication'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Communication
            </button>
            {booking.completionPhotos && booking.completionPhotos.length > 0 && (
              <button
                onClick={() => setActiveTab('photos')}
                className={`pb-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'photos'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Photos
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Name</p>
                      <p className="text-sm text-gray-600">{booking.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Phone</p>
                      <p className="text-sm text-gray-600">{booking.customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Email</p>
                      <p className="text-sm text-gray-600">{booking.customer.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Rating</p>
                      <div className="flex items-center space-x-1">
                        <FaStar className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">{booking.customer.rating || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Service</p>
                      <p className="text-sm text-gray-600">{booking.service.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Category</p>
                      <p className="text-sm text-gray-600 capitalize">{booking.service.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Duration</p>
                      <p className="text-sm text-gray-600">{Math.floor(booking.service.duration / 60)}h {booking.service.duration % 60}m</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Scheduled</p>
                      <p className="text-sm text-gray-600">{date}, {time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">Address</p>
                  <p className="text-sm text-gray-600 mb-3">{booking.location.address}</p>
                  {booking.location.instructions && (
                    <>
                      <p className="text-sm font-medium text-gray-900 mb-1">Instructions</p>
                      <p className="text-sm text-gray-600">{booking.location.instructions}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Pricing Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Estimated Price</span>
                    <span className="text-sm text-gray-600">KSh {booking.estimatedPrice.toLocaleString()}</span>
                  </div>
                  {booking.finalPrice && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-900">Final Price</span>
                      <span className="text-sm font-semibold text-green-600">KSh {booking.finalPrice.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Instructions */}
              {booking.specialInstructions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{booking.specialInstructions}</p>
                  </div>
                </div>
              )}

              {/* Customer Review */}
              {booking.customerReview && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Review</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`h-4 w-4 ${
                              i < (booking.customerRating || 0) ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{booking.customerRating}/5</span>
                    </div>
                    <p className="text-sm text-gray-600">{booking.customerReview}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'communication' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication History</h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                <p className="text-gray-500">Communication feature coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'photos' && booking.completionPhotos && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {booking.completionPhotos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={photo}
                      alt={`Completion photo ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <a
                href={`tel:${booking.customer.phone}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaPhone className="h-4 w-4" />
                <span>Call Customer</span>
              </a>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <FaComment className="h-4 w-4" />
                <span>Message</span>
              </button>
            </div>

            <div className="flex space-x-2">
              {booking.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      onStatusUpdate(booking._id, 'confirmed')
                      onClose()
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <FaCheck className="h-4 w-4" />
                    <span>Accept Booking</span>
                  </button>
                  <button
                    onClick={() => {
                      onStatusUpdate(booking._id, 'rejected')
                      onClose()
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <FaTimes className="h-4 w-4" />
                    <span>Decline</span>
                  </button>
                </>
              )}
              
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => {
                    onStatusUpdate(booking._id, 'in_progress')
                    onClose()
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <FaPlay className="h-4 w-4" />
                  <span>Start Job</span>
                </button>
              )}
              
              {booking.status === 'in_progress' && (
                <button
                  onClick={() => {
                    onStatusUpdate(booking._id, 'completed')
                    onClose()
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <FaCheckCircle className="h-4 w-4" />
                  <span>Mark Complete</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default BookingsPage