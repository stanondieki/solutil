'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { clientAPI } from '@/lib/clientAPI';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaUser,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
  FaFilter,
  FaSearch
} from 'react-icons/fa';

interface Provider {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  providerProfile: {
    businessName: string;
    experience: string;
    hourlyRate: number;
    rating: number;
    totalReviews: number;
    completedJobs: number;
    services: string[];
    bio: string;
    skills?: string[];
    workingHours: {
      start: string;
      end: string;
    };
    serviceAreas: string[];
    specializations: string[];
  };
  services?: Service[]; // Actual services with pricing
  isVerified: boolean;
  isActive: boolean;
}

interface Service {
  _id: string;
  title: string;
  category: string;
  price: number;
  priceType: string;
  providerId: Provider;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { key: 'all', name: 'All Categories' },
    { key: 'electrical', name: 'Electrical' },
    { key: 'plumbing', name: 'Plumbing' },
    { key: 'cleaning', name: 'Cleaning' },
    { key: 'carpentry', name: 'Carpentry' },
    { key: 'painting', name: 'Painting' },
    { key: 'gardening', name: 'Gardening' }
  ];

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to fetch providers through services
      const response = await clientAPI.getServicesByCategory('all');
      
      if (response.success && response.data?.services && response.data.services.length > 0) {
        setServices(response.data.services);
        
        // Extract unique providers from services
        const uniqueProviders = response.data.services.reduce((acc: Provider[], service: Service) => {
          const existingProvider = acc.find(p => p._id === service.providerId._id);
          if (!existingProvider && service.providerId) {
            acc.push(service.providerId as Provider);
          }
          return acc;
        }, []);
        
        setProviders(uniqueProviders);
      } else {
        // If no services found, try to get providers directly
        console.log('No services found, fetching providers directly...');
        await fetchVerifiedProviders();
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      // Try direct provider fetch as fallback
      await fetchVerifiedProviders();
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedProviders = async () => {
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
      const response = await fetch(`${BACKEND_URL}/api/providers/verified/all?limit=50`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Verified providers response:', data);
        
        const verifiedProviders = data.data?.providers || [];
        
        // Map to our Provider interface
        const mappedProviders: Provider[] = verifiedProviders.map((provider: any) => ({
          _id: provider._id,
          name: provider.name,
          email: provider.email || '',
          phone: provider.phone || '',
          profilePicture: provider.avatar?.url || provider.profilePicture || null,
          providerProfile: {
            businessName: provider.providerProfile?.businessName || provider.name,
            experience: provider.providerProfile?.experience || 'Experienced professional',
            hourlyRate: provider.providerProfile?.hourlyRate || 500,
            rating: provider.providerProfile?.rating || provider.rating || 4.5,
            totalReviews: provider.providerProfile?.reviewCount || provider.reviewCount || 0,
            completedJobs: provider.providerProfile?.completedJobs || 0,
            services: provider.providerProfile?.services || [],
            bio: provider.providerProfile?.bio || `Professional ${provider.name} ready to help.`,
            workingHours: provider.providerProfile?.availability || { start: '08:00', end: '18:00' },
            serviceAreas: provider.providerProfile?.serviceAreas || ['Nairobi'],
            specializations: provider.providerProfile?.skills || []
          },
          isVerified: provider.providerStatus === 'approved',
          isActive: true
        }));
        
        setProviders(mappedProviders);
        setServices([]); // No services available
        console.log('Set verified providers:', mappedProviders.length);
      } else {
        console.error('Failed to fetch verified providers');
        setError('Unable to load providers. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching verified providers:', error);
      setError('Unable to load providers. Please try again.');
    }
  };

  const getProviderServices = (providerId: string) => {
    return services.filter(service => service.providerId._id === providerId);
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = !searchQuery || 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.providerProfile?.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.providerProfile?.specializations?.some(spec => 
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory = selectedCategory === 'all' || 
      getProviderServices(provider._id).some(service => service.category === selectedCategory) ||
      provider.providerProfile?.skills?.some(skill => 
        skill.toLowerCase().includes(selectedCategory.toLowerCase())
      ) ||
      provider.providerProfile?.specializations?.some(spec => 
        spec.toLowerCase().includes(selectedCategory.toLowerCase())
      );

    return matchesSearch && matchesCategory;
  });

  const formatRating = (rating: number) => {
    return rating > 0 ? rating.toFixed(1) : 'New';
  };

  const getProviderPrice = (provider: Provider) => {
    // Check if provider has actual service data with pricing
    if (provider.services && provider.services.length > 0) {
      const servicePrices = provider.services.map(s => s.price || 0).filter(p => p > 0);
      
      if (servicePrices.length > 0) {
        const uniquePrices = [...new Set(servicePrices)];
        
        if (uniquePrices.length === 1) {
          // All services have the same price
          return `KES ${uniquePrices[0].toLocaleString()}`;
        } else {
          // Services have different prices - show range
          const minPrice = Math.min(...servicePrices);
          const maxPrice = Math.max(...servicePrices);
          return `KES ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
        }
      }
    }
    
    // Show a generic message that encourages clicking through to see actual pricing
    return 'See Profile for Pricing';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Providers</h2>
          <p className="text-gray-600">Finding trusted professionals in your area...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Providers</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchProviders}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
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
            Trusted <span className="text-orange-600">Providers</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Browse our network of verified professionals ready to help with your service needs
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, business, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(category => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mt-4">
            {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} available
          </div>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => {
            const providerServices = getProviderServices(provider._id);
            
            return (
              <motion.div
                key={provider._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-orange-200 overflow-hidden"
              >
                {/* Provider Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center">
                      {provider.profilePicture ? (
                        <Image
                          src={provider.profilePicture}
                          alt={provider.name}
                          fill
                          className="object-cover rounded-2xl"
                        />
                      ) : (
                        <FaUser className="text-orange-600 text-xl" />
                      )}
                      {provider.isVerified && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                          <FaCheckCircle className="text-xs" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">
                        {provider.providerProfile?.businessName || provider.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-sm font-medium text-gray-800">
                          {formatRating(provider.providerProfile?.rating || 0)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({provider.providerProfile?.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {provider.providerProfile?.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {provider.providerProfile.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">
                        {provider.providerProfile?.completedJobs || 0}
                      </div>
                      <div className="text-xs text-gray-500">Jobs Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-orange-600">
                        {getProviderPrice(provider)}
                      </div>
                      <div className="text-xs text-gray-500">Service Price</div>
                    </div>
                  </div>

                  {/* Services */}
                  {providerServices.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Services:</div>
                      <div className="flex flex-wrap gap-1">
                        {providerServices.slice(0, 3).map(service => (
                          <span
                            key={service._id}
                            className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                          >
                            {service.title}
                          </span>
                        ))}
                        {providerServices.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{providerServices.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {provider.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <FaPhone className="text-gray-400" />
                        <span className="text-gray-600">{provider.phone}</span>
                      </div>
                    )}
                    {(provider.address?.city || provider.providerProfile?.serviceAreas) && (
                      <div className="flex items-center space-x-2 text-sm">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="text-gray-600">
                          {provider.address?.city ? 
                            `${provider.address.city}${provider.address.country ? `, ${provider.address.country}` : ''}` :
                            `${provider.providerProfile.serviceAreas.slice(0, 2).join(', ')}${provider.providerProfile.serviceAreas.length > 2 ? '...' : ''}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 space-y-2">
                  {/* Primary Action - View Profile */}
                  <Link
                    href={`/provider/${provider._id}`}
                    className="w-full bg-orange-600 text-white py-2 rounded-xl font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>View Profile</span>
                    <FaArrowRight className="text-sm" />
                  </Link>
                  
                  {/* Secondary Action - Book Service */}
                  <Link
                    href="/book-service"
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Book Service</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProviders.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaUser className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Providers Found</h3>
            <p className="text-gray-600 mb-6">
              No providers match your current search criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Show All Providers
            </button>
          </div>
        )}
      </div>
    </div>
  );
}