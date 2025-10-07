'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { clientAPI, BookingData } from '@/lib/clientAPI';
import { useAuth } from '@/contexts/AuthContext';
import RoleGuard from '@/components/RoleGuard';
import { 
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaDollarSign,
  FaUser,
  FaPhone,
  FaSpinner,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCreditCard,
  FaMobile,
  FaMoneyBill
} from 'react-icons/fa';

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  pricing?: {
    amount: number;
    type: 'fixed' | 'hourly' | 'quote';
  };
  // Fallback for legacy data
  price?: number;
  priceType?: 'fixed' | 'hourly' | 'quote';
  duration?: number;
  rating: number;
  images: string[];
  availability?: {
    hours: {
      start: string;
      end: string;
    };
  };
  // Fallback for legacy data
  availableHours?: {
    start: string;
    end: string;
  };
  serviceArea: string[];
  provider: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    businessName?: string;
    providerProfile?: {
      businessName?: string;
      experience?: string;
      rating?: number;
      hourlyRate?: number;
      services?: Array<{
        title: string;
        description: string;
        category: string;
        price: number;
        priceType: 'fixed' | 'hourly' | 'quote';
        _id: string;
      }>;
    };
  };
  // Fallback for legacy data
  providerId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    providerProfile?: {
      businessName?: string;
      experience?: string;
      rating?: number;
    };
  };
}

export default function BookingFormPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: {
      start: '',
      end: ''
    },
    location: {
      address: '',
      city: '',
      coordinates: {
        lat: -1.286389,
        lng: 36.817223
      },
      instructions: ''
    },
    payment: {
      method: 'mpesa' as 'card' | 'mpesa' | 'cash' | 'bank-transfer'
    },
    notes: ''
  });

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  // Helper functions to extract values from different data structures
  const getProvider = (service: Service) => {
    return service.provider || service.providerId;
  };

  const getPrice = (service: Service) => {
    // Try multiple locations for price data
    if (service.pricing?.amount) return service.pricing.amount;
    if (service.price) return service.price;
    
    // Check provider's service data
    const provider = getProvider(service);
    if (provider?.providerProfile?.services?.[0]?.price) {
      return provider.providerProfile.services[0].price;
    }
    
    // Fallback to hourly rate
    if (provider?.providerProfile?.hourlyRate) {
      return provider.providerProfile.hourlyRate;
    }
    
    return 0;
  };

  const getPriceType = (service: Service) => {
    // Try multiple locations for price type
    if (service.pricing?.type) return service.pricing.type;
    if (service.priceType) return service.priceType;
    
    // Check provider's service data
    const provider = getProvider(service);
    if (provider?.providerProfile?.services?.[0]?.priceType) {
      return provider.providerProfile.services[0].priceType;
    }
    
    return 'fixed';
  };

  const getDuration = (service: Service) => {
    return service.duration || 60; // Default 1 hour
  };

  const getAvailableHours = (service: Service) => {
    return service.availability?.hours || service.availableHours || { start: '08:00', end: '18:00' };
  };

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientAPI.getServiceDetails(serviceId);
      
      console.log('=== BOOKING FORM DEBUG ===');
      console.log('API Response:', response);
      
      if (response.success && response.data?.service) {
        const service = response.data.service;
        console.log('Service data:', service);
        console.log('Provider data:', getProvider(service));
        console.log('Price data:', getPrice(service));
        console.log('Pricing object:', service.pricing);
        console.log('Direct price:', service.price);
        setService(service);
      } else {
        console.log('Service not found, response:', response);
        setError('Service not found');
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Unable to load service details');
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleStartTimeChange = (startTime: string) => {
    if (!service) return;
    
    const endTime = calculateEndTime(startTime, getDuration(service));
    setFormData({
      ...formData,
      scheduledTime: {
        start: startTime,
        end: endTime
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service || !user) return;
    
    try {
      setSubmitting(true);
      setError(null);

      const provider = getProvider(service);
      const price = getPrice(service);

      console.log('=== BOOKING SUBMISSION DEBUG ===');
      console.log('Service:', service);
      console.log('Provider:', provider);
      console.log('Price:', price);
      console.log('Form data:', formData);

      const bookingData: BookingData = {
        providerId: provider?._id || '',
        serviceId: service._id,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        location: formData.location,
        pricing: {
          basePrice: price,
          totalAmount: price,
          currency: 'KES'
        },
        payment: formData.payment,
        notes: formData.notes
      };

      console.log('Booking data to send:', bookingData);

      const response = await clientAPI.createBooking(bookingData);
      
      console.log('Booking response:', response);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/bookings');
        }, 2000);
      } else {
        console.log('Booking failed:', response);
        setError(response.error || response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Unable to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (service: Service) => {
    const currency = 'KES';
    const price = getPrice(service);
    const priceType = getPriceType(service);
    
    switch (priceType) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Service</h2>
          <p className="text-gray-600">Preparing your booking form...</p>
        </div>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.back()}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your booking request has been sent to the provider. You'll receive a confirmation once they review your request.
          </p>
          <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="client" fallbackRoute="/login">
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex items-center mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Book Service</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Service Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                
                {/* Service Image */}
                <div className="relative h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200">
                  {service && service.images && service.images.length > 0 ? (
                    <Image
                      src={service.images[0]}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FaUser className="text-orange-600 text-4xl" />
                    </div>
                  )}
                </div>

                {service && (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                    {/* Provider Info */}
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Provider</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-orange-600 text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getProvider(service)?.providerProfile?.businessName || getProvider(service)?.businessName || getProvider(service)?.name}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FaPhone className="text-xs" />
                            <span>{getProvider(service)?.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Info */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Price</span>
                        <span className="font-semibold text-green-600">{formatPrice(service)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Duration</span>
                        <span className="text-sm text-gray-600">{Math.floor(getDuration(service) / 60)}h {getDuration(service) % 60}m</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Available</span>
                        <span className="text-sm text-gray-600">{getAvailableHours(service).start} - {getAvailableHours(service).end}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="text-red-500 mr-2" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        <FaCalendarAlt className="inline mr-2 text-orange-600" />
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        <FaClock className="inline mr-2 text-orange-600" />
                        Start Time
                      </label>
                      <input
                        type="time"
                        required
                        min={service ? getAvailableHours(service).start : '08:00'}
                        max={service ? getAvailableHours(service).end : '18:00'}
                        value={formData.scheduledTime.start}
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      {formData.scheduledTime.end && (
                        <p className="text-xs text-gray-500 mt-1">
                          Ends at: {formData.scheduledTime.end}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <FaMapMarkerAlt className="inline mr-2 text-orange-600" />
                      Service Location
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your address"
                      value={formData.location.address}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, address: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-2"
                    />
                    <input
                      type="text"
                      placeholder="City (optional)"
                      value={formData.location.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, city: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-2"
                    />
                    <textarea
                      placeholder="Special instructions for the provider (optional)"
                      value={formData.location.instructions}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, instructions: e.target.value }
                      })}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      <FaCreditCard className="inline mr-2 text-orange-600" />
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'mpesa', label: 'M-Pesa', icon: FaMobile },
                        { value: 'card', label: 'Card', icon: FaCreditCard },
                        { value: 'cash', label: 'Cash', icon: FaMoneyBill },
                        { value: 'bank-transfer', label: 'Bank', icon: FaCreditCard }
                      ].map((method) => (
                        <label key={method.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={formData.payment.method === method.value}
                            onChange={(e) => setFormData({
                              ...formData,
                              payment: { method: e.target.value as any }
                            })}
                            className="sr-only"
                          />
                          <div className={`p-3 border rounded-lg text-center transition-all ${
                            formData.payment.method === method.value
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}>
                            <method.icon className="mx-auto mb-1" />
                            <span className="text-sm font-medium">{method.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Any special requirements or notes for the provider..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  {/* Total Price */}
                  {service && (
                    <div className="border-t border-gray-100 pt-6">
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total Amount:</span>
                        <span className="text-green-600">KES {getPrice(service).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Payment will be processed after service confirmation
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-600 text-white py-4 rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Creating Booking...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        <span>Book Service</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}