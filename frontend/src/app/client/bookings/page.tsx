'use client';

import React, { useState, useEffect } from 'react';
import { FaStar, FaCalendar, FaUser, FaMapMarker, FaDollarSign, FaComment } from 'react-icons/fa';
import { clientAPI } from '@/lib/clientAPI';
import ReviewModal from '@/components/ReviewModal';
import StarRating from '@/components/StarRating';

interface Booking {
  _id: string;
  bookingNumber: string;
  service: {
    title: string;
    category: string;
  };
  provider: {
    name: string;
    email: string;
  };
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: {
    start: string;
    end: string;
  };
  location: {
    address: string;
  };
  pricing: {
    totalAmount: number;
    currency: string;
  };
  rating?: number;
  review?: {
    _id: string;
    rating: number;
    comment: string;
  };
  createdAt: string;
}

const ClientBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const result = await clientAPI.getUserBookings();
      if (result.success) {
        setBookings(result.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (booking: Booking) => {
    console.log('🎯 Review button clicked for booking:', booking._id);
    console.log('📊 Booking details:', booking);
    setSelectedBooking(booking);
    setShowReviewModal(true);
    console.log('✅ Modal state updated - showReviewModal:', true);
  };

  const handleReviewSubmitted = () => {
    fetchBookings(); // Refresh bookings to show updated review
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">Track and manage your service bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">You haven't made any bookings yet</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Browse Services
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {booking.service.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Booking #{booking.bookingNumber}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <FaUser className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{booking.provider.name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaCalendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        {formatDate(booking.scheduledDate)} at {formatTime(booking.scheduledTime.start)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarker className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{booking.location.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaDollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        {booking.pricing.currency} {booking.pricing.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Review Section */}
                  {booking.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {booking.review ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Your Review:</span>
                            <StarRating rating={booking.review.rating} size="sm" showValue={false} />
                            <span className="text-sm text-gray-600">({booking.review.rating}/5)</span>
                          </div>
                          {booking.review.comment && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">{booking.review.comment}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FaComment className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">How was your experience?</span>
                          </div>
                          <button
                            onClick={() => handleReviewClick(booking)}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors flex items-center space-x-1"
                          >
                            <FaStar className="h-4 w-4" />
                            <span>Rate Service</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                      Booked on {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
              const result = await clientAPI.submitReview({
                bookingId: selectedBooking._id,
                rating: reviewData.rating,
                comment: reviewData.comment
              });
              if (result.success) {
                handleReviewSubmitted();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ClientBookingsPage;