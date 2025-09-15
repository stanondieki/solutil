'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaFilter, FaSort, FaMapMarkerAlt, FaStar, FaSearch } from 'react-icons/fa'
import ProviderCard, { Provider } from './ProviderCard'

interface ProviderListProps {
  serviceId: string
  onProviderSelect: (provider: Provider) => void
  selectedProviderId?: string
}

// Mock providers data - In production, this would come from an API
const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'John Kamau',
    rating: 4.9,
    reviews: 127,
    price: 2500,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    distance: '2.3 km away',
    experience: '8 years',
    specialties: ['Pipe Repair', 'Installation', 'Emergency Service'],
    availability: ['Today', 'Tomorrow', 'This Week'],
    verified: true,
    responseTime: 'Responds in 15 min'
  },
  {
    id: '2',
    name: 'Sarah Wanjiku',
    rating: 4.8,
    reviews: 94,
    price: 2800,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b002?w=150&h=150&fit=crop&crop=face',
    distance: '1.8 km away',
    experience: '6 years',
    specialties: ['Drain Cleaning', 'Water Heater', 'Bathroom Fixtures'],
    availability: ['Today', 'This Week'],
    verified: true,
    responseTime: 'Responds in 30 min'
  },
  {
    id: '3',
    name: 'David Mwangi',
    rating: 4.7,
    reviews: 156,
    price: 2200,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    distance: '3.1 km away',
    experience: '10 years',
    specialties: ['General Plumbing', 'Pipe Installation', 'Maintenance'],
    availability: ['Tomorrow', 'This Week'],
    verified: true,
    responseTime: 'Responds in 1 hour'
  },
  {
    id: '4',
    name: 'Grace Njeri',
    rating: 4.9,
    reviews: 203,
    price: 3000,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    distance: '1.2 km away',
    experience: '12 years',
    specialties: ['Expert Plumber', 'Commercial', 'Residential'],
    availability: ['Today', 'Tomorrow'],
    verified: true,
    responseTime: 'Responds in 10 min'
  }
]

export default function ProviderList({ serviceId, onProviderSelect, selectedProviderId }: ProviderListProps) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'distance'>('rating')
  const [filterBy, setFilterBy] = useState<'all' | 'verified' | 'available'>('all')

  useEffect(() => {
    // Simulate API call to fetch providers for specific service
    const fetchProviders = async () => {
      setLoading(true)
      // In production, this would be an actual API call
      // const response = await fetch(`/api/providers?service=${serviceId}`)
      // const data = await response.json()
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProviders(mockProviders)
      setLoading(false)
    }

    fetchProviders()
  }, [serviceId])

  // Filter and sort providers
  const filteredProviders = providers
    .filter(provider => {
      const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           provider.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'verified' && provider.verified) ||
                           (filterBy === 'available' && provider.availability.includes('Today'))
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'price':
          return a.price - b.price
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-2xl"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Available Providers
        </h2>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search providers by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap gap-4">
          {/* Sort */}
          <div className="flex items-center space-x-2">
            <FaSort className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="price">Lowest Price</option>
              <option value="distance">Nearest</option>
            </select>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Providers</option>
              <option value="verified">Verified Only</option>
              <option value="available">Available Today</option>
            </select>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="space-y-4">
        {filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <FaMapMarkerAlt />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No providers found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProviderCard
                provider={provider}
                selected={selectedProviderId === provider.id}
                onClick={() => onProviderSelect(provider)}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
