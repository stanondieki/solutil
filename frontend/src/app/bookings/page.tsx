'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStar, FaSpinner, FaTimes, FaExclamationTriangle } from 'react-icons/fa'
import { clientAPI } from '@/lib/clientAPI'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import ReviewModal from '@/components/ReviewModal'
import StarRating from '@/components/StarRating'

interface Booking {
  _id: string
  bookingNumber: string
  serviceCategory?: string  // Added for simplified bookings
  service: {
    _id: string
    name: string  // Changed from 'title' to 'name' to match backend
    category: string
  } | null  // Made nullable since simplified bookings may not have real service
  provider: {
    _id: string
    businessName?: string
    name?: string  // Added fallback name field
    user?: {
      name: string
    }
  } | null  // Made nullable since simplified bookings may have temporary provider
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
  review?: {
    _id: string
    rating: number
    comment: string
  }
}

interface CancelBookingModal {
  isOpen: boolean
  booking: Booking | null
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelModal, setCancelModal] = useState<CancelBookingModal>({ isOpen: false, booking: null })
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const { user } = useAuth()
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    loadBookings()
  }, [user])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await clientAPI.getUserBookings()
      
      console.log('🎯 BookingsPage received response:', response)
      
      if (response.success) {
        const bookingsData = response.bookings || []
        console.log('🎯 Setting bookings data:', bookingsData)
        setBookings(bookingsData)
      } else {
        console.log('🎯 Response not successful:', response.message)
        setError(response.message || 'Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError('Unable to load bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const openCancelModal = (booking: Booking) => {
    setCancelModal({ isOpen: true, booking })
    setCancelReason('')
  }

  const closeCancelModal = () => {
    setCancelModal({ isOpen: false, booking: null })
    setCancelReason('')
    setIsCancelling(false)
  }

  const handleCancelBooking = async () => {
    if (!cancelModal.booking || !cancelReason.trim()) {
      return
    }

    try {
      setIsCancelling(true)
      const response = await clientAPI.cancelBooking(cancelModal.booking._id, cancelReason.trim())
      
      if (response.success) {
        // Update the booking status locally
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === cancelModal.booking?._id 
              ? { ...booking, status: 'cancelled' as const }
              : booking
          )
        )
        closeCancelModal()
        // Show success message
        alert('Booking cancelled successfully!')
      } else {
        alert(response.message || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking. Please try again.')
    } finally {
      setIsCancelling(false)
    }
  }

  const canCancelBooking = (booking: Booking) => {
    return ['pending', 'confirmed'].includes(booking.status)
  }

  const handleReviewClick = (booking: Booking) => {
    console.log('🎯 Review button clicked for booking:', booking._id);
    console.log('📊 Booking details:', booking);
    setSelectedBooking(booking);
    setShowReviewModal(true);
    console.log('✅ Modal state updated - showReviewModal:', true);
  };

  const handleReviewSubmitted = () => {
    loadBookings(); // Refresh bookings to show updated review
    setShowReviewModal(false);
    setSelectedBooking(null);
  };

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
                    <h3 className="text-xl font-semibold text-gray-900">{booking.service?.name || booking.serviceCategory || 'Service'}</h3>
                    <p className="text-gray-600">with {booking.provider?.businessName || booking.provider?.name || booking.provider?.user?.name || 'Provider'}</p>
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

                {/* Review Display Section */}
                {booking.status === 'completed' && booking.review && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Your Review</span>
                      <StarRating rating={booking.review.rating} size="sm" />
                    </div>
                    {booking.review.comment && (
                      <p className="text-sm text-green-700">{booking.review.comment}</p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex space-x-4">
                    <Link
                      href={`/bookings/${booking._id}`}
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      View Details
                    </Link>
                    {booking.provider?._id && (
                      <Link 
                        href={`/provider/${booking.provider._id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Provider
                      </Link>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {booking.status === 'completed' && !booking.review && (
                      <button 
                        onClick={() => handleReviewClick(booking)}
                        className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors"
                      >
                        <FaStar className="text-sm" />
                        <span>Rate Service</span>
                      </button>
                    )}
                    {canCancelBooking(booking) && (
                      <button 
                        onClick={() => openCancelModal(booking)}
                        className="flex items-center space-x-1 bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <FaTimes className="text-sm" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
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

      {/* Cancellation Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
                  <p className="text-sm text-gray-600">
                    {cancelModal.booking?.bookingNumber}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
                
                <div className="mb-4">
                  <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for cancellation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancelling this booking..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {cancelReason.length}/200 characters
                  </p>
                </div>

                {cancelModal.booking && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Refund Policy:</strong> Cancellations made 24+ hours in advance receive a full refund. 
                      Cancellations made 2-24 hours in advance receive a 50% refund. 
                      Cancellations made less than 2 hours in advance are not eligible for refund.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isCancelling}
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={!cancelReason.trim() || isCancelling}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isCancelling ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Cancel Booking</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onReviewSubmit={async (reviewData) => {
            console.log('🌟 Submitting review:', reviewData);
            try {
              const result = await clientAPI.submitReview({
                bookingId: selectedBooking._id,
                rating: reviewData.rating,
                comment: reviewData.comment
              });
              if (result.success) {
                console.log('✅ Review submitted successfully');
                handleReviewSubmitted();
              } else {
                console.error('❌ Review submission failed:', result.message);
                alert('Failed to submit review. Please try again.');
              }
            } catch (error) {
              console.error('❌ Review submission error:', error);
              alert('Failed to submit review. Please try again.');
            }
          }}
        />
      )}
    </RoleGuard>
  )
}
