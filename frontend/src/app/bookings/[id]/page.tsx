'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser, 
  FaPhone, 
  FaEnvelope,
  FaDollarSign,
  FaSpinner,
  FaStar,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle
} from 'react-icons/fa'
import { clientAPI } from '@/lib/clientAPI'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'

interface BookingDetails {
  _id: string
  bookingNumber: string
  serviceCategory?: string  // For simplified bookings
  service: {
    _id: string
    name: string
    category: string
    description?: string
  } | null
  provider: {
    _id: string
    name?: string
    businessName?: string
    email?: string
    phone?: string
    user?: {
      name: string
      email: string
      phone: string
    }
  } | null
  client: {
    _id: string
    name: string
    email: string
    phone: string
  }
  scheduledDate: string
  scheduledTime: {
    start: string
    end: string
  }
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'disputed'
  location: {
    address: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  pricing: {
    basePrice: number
    totalAmount: number
    currency: string
  }
  payment: {
    method: string
    status: string
  }
  notes?: string | { client?: string }
  createdAt: string
  updatedAt: string
  rating?: number
  review?: string
}

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true)
        const response = await clientAPI.getBookingDetails(params.id as string)
        
        if (response.success) {
          console.log('🎯 Raw booking data:', JSON.stringify(response.data, null, 2))
          setBooking(response.data.booking)
        } else {
          setError(response.error || 'Failed to fetch booking details')
        }
      } catch (error) {
        console.error('Error fetching booking details:', error)
        setError('Unable to load booking details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchBookingDetails()
    }
  }, [params.id])

  console.log('🚨 RENDER DEBUG - Current booking state:', {
    booking,
    bookingType: typeof booking,
    bookingKeys: booking ? Object.keys(booking) : 'null',
    client: booking?.client,
    clientType: typeof booking?.client,
    clientKeys: booking?.client ? Object.keys(booking.client) : 'null'
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      case 'disputed': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle className="text-blue-600" />
      case 'completed': return <FaCheckCircle className="text-green-600" />
      case 'pending': return <FaClock className="text-yellow-600" />
      case 'cancelled': return <FaTimesCircle className="text-red-600" />
      case 'disputed': return <FaExclamationTriangle className="text-orange-600" />
      default: return <FaClock className="text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: { start: string; end: string }) => {
    if (!time || !time.start || !time.end) return 'Time not specified'
    return `${time.start} - ${time.end}`
  }

  const formatPrice = (pricing: { totalAmount: number; currency: string }) => {
    if (!pricing || typeof pricing.totalAmount !== 'number') return 'Price not available'
    return `${pricing.currency || 'KES'} ${pricing.totalAmount.toLocaleString()}`
  }

  if (loading) {
    return (
      <RoleGuard requiredRole="client">
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-orange-600 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Booking Details</h2>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (error || !booking) {
    return (
      <RoleGuard requiredRole="client">
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
          <div className="text-center">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The booking you are looking for does not exist.'}</p>
            <Link href="/bookings" className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors">
              Back to Bookings
            </Link>
          </div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard requiredRole="client">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link href="/bookings" className="mr-4 p-2 hover:bg-orange-100 rounded-lg transition-colors">
              <FaArrowLeft className="text-orange-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600">#{booking?.bookingNumber || booking?._id || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Service Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-orange-100"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{booking.service?.name || booking.serviceCategory || 'Service'}</h3>
                    <p className="text-gray-600 capitalize">{booking.service?.category || 'General Service'}</p>
                    {booking.service?.description && (
                      <p className="text-gray-600 mt-2">{booking.service.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Schedule & Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-orange-100"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule & Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="text-orange-500 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium text-gray-900">{formatDate(booking.scheduledDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaClock className="text-orange-500 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium text-gray-900">{formatTime(booking.scheduledTime)}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-start space-x-3">
                    <FaMapMarkerAlt className="text-orange-500 text-lg mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">{booking.location?.address || 'Location not specified'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Provider Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-orange-100"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Provider Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-orange-500 text-lg" />
                    <div>
                      <p className="text-sm text-gray-600">Provider</p>
                      <p className="font-medium text-gray-900">
                        {booking.provider?.businessName || booking.provider?.name || booking.provider?.user?.name || 'Provider assignment pending'}
                      </p>
                    </div>
                  </div>
                  {(booking.provider?.email || booking.provider?.user?.email) && (
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="text-orange-500 text-lg" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{booking.provider?.email || booking.provider?.user?.email}</p>
                      </div>
                    </div>
                  )}
                  {(booking.provider?.phone || booking.provider?.user?.phone) && (
                    <div className="flex items-center space-x-3">
                      <FaPhone className="text-orange-500 text-lg" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{booking.provider?.phone || booking.provider?.user?.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Additional Notes */}
              {booking.notes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-orange-100"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
                  <div className="flex items-start space-x-3">
                    <FaFileAlt className="text-orange-500 text-lg mt-1" />
                    <p className="text-gray-700">
                      {typeof booking.notes === 'string' 
                        ? booking.notes 
                        : (booking.notes as { client?: string })?.client || 'No additional notes'
                      }
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-orange-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
                <div className={`flex items-center space-x-3 p-3 rounded-lg border ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  <span className="font-medium capitalize">{booking.status.replace('-', ' ')}</span>
                </div>
              </motion.div>

              {/* Pricing Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-orange-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">
                      {booking.pricing?.currency || 'KES'} {(booking.pricing?.basePrice || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total Amount</span>
                      <span className="font-bold text-lg text-orange-600">
                        {booking.pricing ? formatPrice(booking.pricing) : 'Price not available'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-orange-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Method</p>
                    <p className="font-medium text-gray-900 capitalize">{booking.payment?.method || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      booking.payment?.status === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.payment?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.payment?.status || 'pending'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Rating & Review */}
              {booking.status === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-orange-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Review</h3>
                  {booking.rating ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < booking.rating! ? 'text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{booking.rating}/5</span>
                      </div>
                      {booking.review && (
                        <p className="text-gray-700">{booking.review}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Share your experience</p>
                      <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                        Rate Service
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}