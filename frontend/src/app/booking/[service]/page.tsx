'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { clientAPI } from '@/lib/clientAPI';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FaStar, 
  FaClock, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaUser, 
  FaDollarSign,
  FaSpinner,
  FaExclamationTriangle,
  FaTools,
  FaCheckCircle,
  FaArrowRight,
  FaUsers
} from 'react-icons/fa';

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceType: 'fixed' | 'hourly' | 'quote';
  duration: number;
  images: string[];
  rating: number;
  reviewCount: number;
  totalBookings: number;
  availableHours: {
    start: string;
    end: string;
  };
  serviceArea: string[];
  tags: string[];
  providerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    providerProfile?: {
      businessName?: string;
      experience?: string;
      rating?: number;
      hourlyRate?: number;
    };
  };
}

export default function ServiceBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const category = params.service as string;
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, [category]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientAPI.getServicesByCategory(category);
      
      if (response.success) {
        setServices(response.data?.services || []);
      } else {
        setError(response.error || 'Failed to load services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Unable to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (cat: string) => {
    const names: Record<string, string> = {
      'electrical': 'Electrical Services',
      'plumbing': 'Plumbing Services', 
      'cleaning': 'Cleaning Services',
      'carpentry': 'Carpentry Services',
      'painting': 'Painting Services',
      'gardening': 'Gardening Services',
      'appliance-repair': 'Appliance Repair',
      'hvac': 'HVAC Services',
      'roofing': 'Roofing Services',
      'other': 'Other Services'
    };
    return names[cat] || cat.charAt(0).toUpperCase() + cat.slice(1) + ' Services';
  };

  const formatPrice = (service: Service) => {
    const price = service.price;
    const currency = 'KES';
    
    switch (service.priceType) {
      case 'hourly':
        return `${currency} ${price.toLocaleString()}/hour`;
      case 'fixed':
        return `${currency} ${price.toLocaleString()}`;
      case 'quote':
        return 'Contact for quote';
      default:
        return `${currency} ${price.toLocaleString()}`;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const handleBookService = (service: Service) => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    // Navigate to the booking form for this specific service
    router.push(`/booking/form/${service._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Services</h2>
          <p className="text-gray-600">Finding available providers in your area...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Services</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchServices}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaTools className="text-gray-400 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Services Available</h2>
          <p className="text-gray-600 mb-4">
            We don't have any providers offering {getCategoryDisplayName(category).toLowerCase()} in your area yet.
          </p>
          <Link 
            href="/services"
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center"
          >
            Browse All Services
            <FaArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {getCategoryDisplayName(category)}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Find and book trusted professionals in your area
          </p>
          
          {/* Booking Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
              <h3 className="font-medium text-blue-900 mb-2">Looking for specific providers?</h3>
              <p className="text-blue-700 text-sm mb-3">
                Browse providers and their personalized services to book directly.
              </p>
              <Link
                href={`/booking/providers/${category}`}
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <FaUsers className="mr-2" />
                Browse Providers
              </Link>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {services.length} service{services.length !== 1 ? 's' : ''} available below
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-orange-200 overflow-hidden"
            >
              {/* Service Image */}
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200">
                {service.images && service.images.length > 0 ? (
                  <Image
                    src={service.images[0]}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FaTools className="text-orange-600 text-4xl" />
                  </div>
                )}
                
                {/* Provider Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                  <div className="flex items-center space-x-2">
                    <FaUser className="text-orange-600 text-sm" />
                    <span className="text-sm font-medium text-gray-800">
                      {service.providerId.providerProfile?.businessName || service.providerId.name}
                    </span>
                  </div>
                </div>

                {/* Rating Badge */}
                {service.rating > 0 && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-yellow-400 text-sm" />
                      <span className="text-sm font-medium text-gray-800">{service.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Service Details */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

                {/* Service Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FaDollarSign className="text-green-600 text-sm" />
                      <span className="text-sm text-gray-700">Price:</span>
                    </div>
                    <span className="font-semibold text-green-600">{formatPrice(service)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-blue-600 text-sm" />
                      <span className="text-sm text-gray-700">Duration:</span>
                    </div>
                    <span className="text-sm text-gray-600">{formatDuration(service.duration)}</span>
                  </div>

                  {service.serviceArea && service.serviceArea.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-red-600 text-sm" />
                        <span className="text-sm text-gray-700">Area:</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {service.serviceArea.slice(0, 2).join(', ')}
                        {service.serviceArea.length > 2 && ` +${service.serviceArea.length - 2} more`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Provider Contact */}
                {service.providerId.phone && (
                  <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <FaPhone className="text-gray-600 text-sm" />
                    <span className="text-sm text-gray-700">{service.providerId.phone}</span>
                  </div>
                )}

                {/* Service Stats */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <span>{service.totalBookings} booking{service.totalBookings !== 1 ? 's' : ''}</span>
                  <span>{service.reviewCount} review{service.reviewCount !== 1 ? 's' : ''}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleBookService(service)}
                    className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaCheckCircle className="text-sm" />
                    <span>Book Now</span>
                  </button>

                  <Link
                    href={`/provider/${service.providerId._id}`}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaUser className="text-sm" />
                    <span>View Provider</span>
                  </Link>
                </div>

                {/* Service Tags */}
                {service.tags && service.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {service.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {services.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaTools className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-600 mb-6">No providers are currently offering {getCategoryDisplayName(category).toLowerCase()} in your area.</p>
            <Link 
              href="/services"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center"
            >
              Browse All Services
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
