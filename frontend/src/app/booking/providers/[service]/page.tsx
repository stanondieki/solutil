'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { clientAPI } from '@/lib/clientAPI';
import { useAuth } from '@/contexts/AuthContext';
import ProviderList from '@/components/booking/ProviderList';
import { Provider } from '@/components/booking/ProviderCard';
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaExclamationTriangle,
  FaUsers,
  FaSearch,
  FaTools
} from 'react-icons/fa';

export default function ProviderServiceSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const category = params.service as string;
  const selectedProviderId = searchParams.get('provider');
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProvidersWithServices();
  }, [category]);

  const fetchProvidersWithServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch providers who offer services in this category
      const response = await clientAPI.getProvidersWithServices(category);
      
      if (response.success) {
        setProviders(response.data?.providers || []);
      } else {
        setError(response.error || 'Failed to load providers');
      }
    } catch (error) {
      console.error('Error fetching providers with services:', error);
      setError('Unable to load providers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider: Provider) => {
    // Update URL with selected provider
    const url = new URL(window.location.href);
    url.searchParams.set('provider', provider.id);
    router.push(url.pathname + url.search);
  };

  const handleProviderServiceSelect = (providerId: string, serviceId: string) => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    // Navigate directly to the provider's specific service booking form
    router.push(`/booking/form/${serviceId}?providerId=${providerId}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-orange-600 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Providers</h2>
          <p className="text-gray-600">Finding service providers in your area...</p>
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
            onClick={fetchProvidersWithServices}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <FaUsers className="text-gray-400 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Providers Available</h2>
          <p className="text-gray-600 mb-4">
            We don't have any providers offering {getCategoryDisplayName(category).toLowerCase()} in your area yet.
          </p>
          <button
            onClick={() => router.push('/services')}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Browse All Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book {getCategoryDisplayName(category)}
          </h1>
          <p className="text-gray-600">
            Select a provider and their specific service to book directly.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <FaSearch className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">How to Book</h3>
              <p className="text-blue-700 text-sm">
                Choose a provider below, then click on one of their specific services to book directly with them. 
                Each provider offers personalized services with their own pricing and specialties.
              </p>
            </div>
          </div>
        </div>

        {/* Provider List with Services */}
        <ProviderList
          serviceId={category}
          onProviderSelect={handleProviderSelect}
          selectedProviderId={selectedProviderId || undefined}
          onProviderServiceSelect={handleProviderServiceSelect}
          showProviderServices={true}
        />
      </div>
    </div>
  );
}