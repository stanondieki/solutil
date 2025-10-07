'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SafeImage from '@/components/SafeImage';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaUser,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowLeft,
  FaClock,
  FaDollarSign,
  FaTools,
  FaCalendarAlt,
  FaAward,
  FaBriefcase,
  FaQuoteLeft,
  FaHeart,
  FaShareAlt
} from 'react-icons/fa';

interface Provider {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  providerProfile: {
    businessName?: string;
    experience: string;
    hourlyRate: number;
    rating: number;
    totalReviews: number;
    completedJobs: number;
    services: string[];
    bio: string;
    workingHours: {
      start: string;
      end: string;
    };
    serviceAreas: string[];
    specializations: string[];
  };
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceType: string;
  duration: number;
  images: string[];
}

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (providerId) {
      fetchProviderDetails();
    }
  }, [providerId]);

  const fetchProviderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
      
      // Fetch provider details
      const providerResponse = await fetch(`${BACKEND_URL}/api/providers/verified/all`);
      
      if (providerResponse.ok) {
        const providerData = await providerResponse.json();
        const allProviders = providerData.data?.providers || [];
        const foundProvider = allProviders.find((p: any) => p._id === providerId);
        
        if (foundProvider) {
          // Map to our interface
          const mappedProvider: Provider = {
            _id: foundProvider._id,
            name: foundProvider.name,
            email: foundProvider.email || '',
            phone: foundProvider.phone || '',
            profilePicture: foundProvider.avatar?.url || foundProvider.profilePicture || null,
            providerProfile: {
              businessName: foundProvider.providerProfile?.businessName || foundProvider.name,
              experience: foundProvider.providerProfile?.experience || 'Experienced professional',
              hourlyRate: foundProvider.providerProfile?.hourlyRate || 500,
              rating: foundProvider.providerProfile?.rating || foundProvider.rating || 4.5,
              totalReviews: foundProvider.providerProfile?.reviewCount || foundProvider.reviewCount || 0,
              completedJobs: foundProvider.providerProfile?.completedJobs || 0,
              services: foundProvider.providerProfile?.services || [],
              bio: foundProvider.providerProfile?.bio || `Professional ${foundProvider.name} ready to help with your service needs.`,
              workingHours: foundProvider.providerProfile?.availability || { start: '08:00', end: '18:00' },
              serviceAreas: foundProvider.providerProfile?.serviceAreas || ['Nairobi'],
              specializations: foundProvider.providerProfile?.skills || []
            },
            isVerified: foundProvider.providerStatus === 'approved',
            isActive: true,
            createdAt: foundProvider.createdAt || new Date().toISOString()
          };
          
          setProvider(mappedProvider);
          
          // Try to fetch provider's services
          await fetchProviderServices(providerId);
          
        } else {
          setError('Provider not found');
        }
      } else {
        setError('Failed to load provider details');
      }
    } catch (error) {
      console.error('Error fetching provider details:', error);
      setError('Unable to load provider details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderServices = async (providerId: string) => {
    try {
      console.log('=== STARTING SERVICE FETCH ===');
      console.log('Provider ID:', providerId);
      
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net';
      
      // 🆕 UPDATED: Use the enhanced API with better data integrity and cache busting
      const timestamp = Date.now();
      console.log('Calling enhanced API...');
      let servicesResponse = await fetch(`${BACKEND_URL}/api/v2/services?limit=50&_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('Enhanced API response status:', servicesResponse.status);
      
      if (!servicesResponse.ok) {
        // Fallback to legacy API if enhanced API fails
        console.log('Enhanced API failed, falling back to legacy API');
        servicesResponse = await fetch(`${BACKEND_URL}/api/provider-services/public?_t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        console.log('Legacy API response status:', servicesResponse.status);
      }
      
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        const allServices = servicesData.data?.services || [];
        
        console.log('=== API RESPONSE DEBUG ===');
        console.log('Provider ID we are looking for:', providerId);
        console.log('Total services returned:', allServices.length);
        console.log('First service sample:', allServices[0]);
        
        // Check specifically for kemmy's service
        const kemmyService = allServices.find((s: any) => s._id === '68e4feba8e248b993e547690');
        if (kemmyService) {
          console.log('Found kemmy service:', kemmyService.title);
          console.log('Kemmy service provider ID:', kemmyService.provider?._id || kemmyService.providerId?._id);
        } else {
          console.log('Kemmy service not found in response');
        }
        
        // Filter services for this provider with better validation
        const providerServices = allServices.filter((service: any) => {
          // Check both possible provider ID locations for compatibility
          const serviceProviderId = service.provider?._id || service.providerId?._id;
          const matches = serviceProviderId === providerId;
          console.log(`Service "${service.title}": providerId = ${serviceProviderId}, target = ${providerId}, matches = ${matches}`);
          return matches && service.isActive !== false;
        });
        
        console.log(`=== FILTERING RESULT ===`);
        console.log(`Found ${providerServices.length} services for provider ${providerId}`);
        if (providerServices.length > 0) {
          console.log('Services found:');
          providerServices.forEach((service: any, index: number) => {
            console.log(`  ${index + 1}. ${service.title} (${service._id})`);
          });
        } else {
          console.log('❌ NO SERVICES FOUND - Debug info:');
          console.log('   Target provider ID:', providerId);
          console.log('   All provider IDs in response:');
          allServices.forEach((service: any, index: number) => {
            const serviceProviderId = service.provider?._id || service.providerId?._id;
            console.log(`     ${index + 1}. ${service.title}: ${serviceProviderId}`);
          });
        }
        
        setServices(providerServices);
      } else {
        console.error('Failed to fetch services:', servicesResponse.status);
      }
    } catch (error) {
      console.error('Error fetching provider services:', error);
    }
  };

  const formatRating = (rating: number) => {
    return rating > 0 ? rating.toFixed(1) : 'New';
  };

  const formatPrice = (hourlyRate: number) => {
    return hourlyRate > 0 ? `KES ${hourlyRate.toLocaleString()}` : 'Contact for quote';
  };

  const formatWorkingHours = (workingHours: { start: string; end: string }) => {
    return `${workingHours.start} - ${workingHours.end}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Provider Profile</h2>
          <p className="text-gray-600">Getting provider details...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Provider Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The provider you are looking for does not exist.'}</p>
          <Link
            href="/providers"
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Back to Providers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/providers"
              className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Providers
            </Link>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <FaHeart className="text-xl" />
              </button>
              <button className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                <FaShareAlt className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-sm p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                {provider.profilePicture ? (
                  <SafeImage
                    src={provider.profilePicture}
                    alt={provider.name}
                    fill
                    className="object-cover"
                    fallbackIcon={<FaUser className="text-orange-600 text-4xl" />}
                  />
                ) : (
                  <FaUser className="text-orange-600 text-4xl" />
                )}
              </div>
              {provider.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-3">
                  <FaCheckCircle className="text-xl" />
                </div>
              )}
            </div>

            {/* Provider Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {provider.providerProfile.businessName || provider.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{provider.name}</p>
              
              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-6">
                <div className="flex items-center space-x-2">
                  <FaStar className="text-yellow-400 text-xl" />
                  <span className="font-bold text-lg">{formatRating(provider.providerProfile.rating)}</span>
                  <span className="text-gray-500">({provider.providerProfile.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaBriefcase className="text-blue-600 text-lg" />
                  <span className="font-medium">{provider.providerProfile.completedJobs} jobs completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaDollarSign className="text-green-600 text-lg" />
                  <span className="font-medium text-green-600">{formatPrice(provider.providerProfile.hourlyRate)}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                {provider.phone && (
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <FaPhone className="text-gray-600" />
                    <span className="text-gray-700">{provider.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <FaEnvelope className="text-gray-600" />
                  <span className="text-gray-700">{provider.email}</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <FaMapMarkerAlt className="text-gray-600" />
                  <span className="text-gray-700">{provider.providerProfile.serviceAreas.join(', ')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {services.length > 0 && services[0]?._id && (
                  <Link
                    href={`/booking/form/${services[0]._id}`}
                    className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                    onClick={() => {
                      // 🆕 DEBUG: Log the service ID being used
                      console.log('Booking service with ID:', services[0]._id);
                      console.log('Service title:', services[0].title);
                    }}
                  >
                    <FaCalendarAlt />
                    <span>Book Service</span>
                  </Link>
                )}
                {services.length === 0 && (
                  <div className="bg-gray-100 text-gray-500 px-6 py-3 rounded-xl font-medium text-center">
                    No services available
                  </div>
                )}
                <Link
                  href={`mailto:${provider.email}`}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <FaEnvelope />
                  <span>Contact Provider</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-8">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: FaUser },
                { key: 'services', label: 'Services', icon: FaTools },
                { key: 'experience', label: 'Experience', icon: FaAward }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="text-lg" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Bio */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <FaQuoteLeft className="text-orange-600 text-2xl mb-4" />
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {provider.providerProfile.bio}
                    </p>
                  </div>
                </div>

                {/* Working Hours & Areas */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FaClock className="mr-2 text-orange-600" />
                      Working Hours
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-gray-700 font-medium">
                        {formatWorkingHours(provider.providerProfile.workingHours)}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">Monday - Saturday</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-orange-600" />
                      Service Areas
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex flex-wrap gap-2">
                        {provider.providerProfile.serviceAreas.map((area, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specializations */}
                {provider.providerProfile.specializations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FaAward className="mr-2 text-orange-600" />
                      Specializations
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {provider.providerProfile.specializations.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Available Services</h3>
                {services.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {services.map((service) => (
                      <div key={service._id} className="border border-gray-200 rounded-xl p-6 hover:border-orange-200 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-gray-900">{service.title}</h4>
                          <span className="text-lg font-bold text-orange-600">
                            KES {service.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {service.category}
                          </span>
                          {service._id ? (
                            <Link
                              href={`/booking/form/${service._id}`}
                              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                              onClick={() => {
                                // 🆕 DEBUG: Log the service ID being used
                                console.log('Booking service:', service.title, 'with ID:', service._id);
                              }}
                            >
                              Book Now
                            </Link>
                          ) : (
                            <span className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-medium">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FaTools className="text-gray-400 text-4xl mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Services Listed</h4>
                    <p className="text-gray-600">This provider hasn't created any services yet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'experience' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Experience & Expertise</h3>
                
                {/* Experience */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Professional Experience</h4>
                  <p className="text-gray-700">{provider.providerProfile.experience}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center bg-orange-50 p-6 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                      {provider.providerProfile.completedJobs}
                    </div>
                    <div className="text-sm text-gray-600">Jobs Completed</div>
                  </div>
                  <div className="text-center bg-blue-50 p-6 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {formatRating(provider.providerProfile.rating)}
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-center bg-green-50 p-6 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {provider.providerProfile.totalReviews}
                    </div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Member Since</h4>
                  <p className="text-gray-700">
                    {new Date(provider.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}