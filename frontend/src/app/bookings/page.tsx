'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStar, FaSpinner } from 'react-icons/fa'
import { clientAPI } from '@/lib/clientAPI'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'

interface Booking {
  _id: string
  bookingNumber: string
  service: {
    _id: string
    title: string
    category: string
  }
  provider: {
    _id: string
    businessName: string
    user: {
      name: string
    }
  }
  scheduledDate: string
  scheduledTime: {
    start: string
    end: string
  }
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'disputed'
  location: {
    address: string
  }
  pricing: {
    totalAmount: number
    currency: string
  }
  createdAt: string
  rating?: number
  review?: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await clientAPI.getMyBookings()
        
        if (response.success) {
          setBookings(response.data?.bookings || [])
        } else {
          setError(response.error || 'Failed to fetch bookings')
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setError('Unable to load bookings. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchBookings()
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-purple-100 text-purple-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'disputed': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (time: { start: string; end: string }) => {
    return `${time.start} - ${time.end}`
  }

  const formatPrice = (pricing: { totalAmount: number; currency: string }) => {
    return `${pricing.currency} ${pricing.totalAmount.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Bookings</h2>
          <p className="text-gray-600">Fetching your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard requiredRole="client">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link href="/dashboard" className="mr-4 p-2 hover:bg-orange-100 rounded-lg transition-colors">
              <FaArrowLeft className="text-orange-600" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Bookings List */}
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{booking.service.title}</h3>
                    <p className="text-gray-600">with {booking.provider.businessName || booking.provider.user.name}</p>
                    <p className="text-sm text-gray-500">Booking #{booking.bookingNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-orange-500" />
                    <span className="text-sm text-gray-600">{formatDate(booking.scheduledDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-orange-500" />
                    <span className="text-sm text-gray-600">{formatTime(booking.scheduledTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="text-orange-500" />
                    <span className="text-sm text-gray-600">{booking.location.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{formatPrice(booking.pricing)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Link 
                    href={`/bookings/${booking._id}`}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    View Details
                  </Link>
                  {booking.status === 'completed' && !booking.rating && (
                    <button className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors">
                      <FaStar className="text-sm" />
                      <span>Rate Service</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {bookings.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-orange-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">Start by booking your first service!</p>
              <Link href="/dashboard" className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors">
                Browse Services
              </Link>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  )
}
