'use client';

import React, { useState, useEffect } from 'react';
import { FaStar, FaComment, FaUser, FaCalendar, FaEye, FaReply } from 'react-icons/fa';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  reviewer: {
    name: string;
    email: string;
  };
  service: {
    title: string;
    category: string;
  };
  booking: {
    _id: string;
    scheduledDate: string;
  };
  createdAt: string;
  isVerified: boolean;
}

interface ProviderReviewsProps {
  className?: string;
}

const ProviderReviewsPage: React.FC<ProviderReviewsProps> = ({ className = '' }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchProviderReviews();
  }, []);

  const fetchProviderReviews = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'}/api/reviews/my-reviews`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Provider reviews:', result);
        
        if (result.status === 'success') {
          setReviews(result.data.reviews || []);
          
          // Calculate stats
          const reviews = result.data.reviews || [];
          const totalReviews = reviews.length;
          const averageRating = reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / totalReviews || 0;
          
          const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviews.forEach((review: Review) => {
            ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
          });
          
          setStats({
            totalReviews,
            averageRating,
            ratingDistribution
          });
        }
      } else {
        console.error('Failed to fetch reviews:', response.status);
      }
    } catch (error) {
      console.error('Error fetching provider reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading your reviews...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews & Ratings</h1>
          <p className="text-gray-600">See what your clients are saying about your services</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaComment className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaStar className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className={`text-2xl font-bold ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaEye className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">5-Star Reviews</p>
                <p className="text-2xl font-bold text-green-600">{stats.ratingDistribution[5]}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUser className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Recent Reviews</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reviews.filter(r => new Date(r.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <span className="text-sm font-medium text-gray-900 w-8">{rating}</span>
                <FaStar className="h-4 w-4 text-yellow-400 mr-2" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: stats.totalReviews > 0 
                        ? `${(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-500 ml-3 w-8">
                  {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FaComment className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">
                Complete more services to start receiving client reviews and ratings.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaUser className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{review.reviewer.name}</p>
                        <p className="text-sm text-gray-500">{review.service?.title || 'Service'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                      {review.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>

                  {/* Review Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendar className="h-4 w-4 mr-1" />
                      Service on {formatDate(review.booking.scheduledDate)}
                    </div>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <FaReply className="h-4 w-4 mr-1" />
                      Respond
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderReviewsPage;