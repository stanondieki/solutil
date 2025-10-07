'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaStar, FaMapMarkerAlt, FaClock, FaShieldAlt, FaCheck } from 'react-icons/fa'

export interface Provider {
  id: string
  name: string
  rating: number
  reviews: number
  price: number
  image: string
  distance: string
  experience: string
  specialties: string[]
  availability: string[]
  verified: boolean
  responseTime: string
  // 🆕 Add provider service information
  providerServices?: ProviderServiceInfo[]
}

export interface ProviderServiceInfo {
  _id: string
  title: string
  description: string
  category: string
  price: number
  priceType: 'fixed' | 'hourly' | 'quote'
  duration: number
  rating: number
  reviewCount: number
}

interface ProviderCardProps {
  provider: Provider
  selected?: boolean
  onClick: () => void
  // 🆕 Add option to handle provider service selection
  onServiceSelect?: (providerId: string, serviceId: string) => void
  showServices?: boolean
}

export default function ProviderCard({ 
  provider, 
  selected = false, 
  onClick,
  onServiceSelect,
  showServices = false
}: ProviderCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
        selected
          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 bg-white dark:bg-gray-800'
      }`}
      onClick={onClick}
    >
      {/* Verified Badge */}
      {provider.verified && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
          <FaShieldAlt className="text-xs" />
          <span>Verified</span>
        </div>
      )}

      {/* Provider Info */}
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="relative">
          <Image
            src={provider.image}
            alt={provider.name}
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
          {/* Online Status */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {provider.name}
            </h3>
            <div className="text-right">
              <p className="text-xl font-bold text-orange-600">
                KSh {provider.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Base price</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="font-medium text-gray-900 dark:text-white">
                {provider.rating}
              </span>
            </div>
            <span className="text-gray-500 text-sm">
              ({provider.reviews} reviews)
            </span>
          </div>

          {/* Quick Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
            <div className="flex items-center space-x-1">
              <FaMapMarkerAlt className="text-xs" />
              <span>{provider.distance}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaClock className="text-xs" />
              <span>{provider.responseTime}</span>
            </div>
          </div>

          {/* Experience */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {provider.experience} experience
          </p>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mb-3">
            {provider.specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs"
              >
                {specialty}
              </span>
            ))}
            {provider.specialties.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{provider.specialties.length - 3} more
              </span>
            )}
          </div>

          {/* Availability */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">Available:</span>
            <div className="flex space-x-1">
              {provider.availability.slice(0, 3).map((time, index) => (
                <span
                  key={index}
                  className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>

          {/* 🆕 Provider Services */}
          {showServices && provider.providerServices && provider.providerServices.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Available Services:
              </h4>
              <div className="space-y-2">
                {provider.providerServices.slice(0, 2).map((service) => (
                  <div
                    key={service._id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onServiceSelect?.(provider.id, service._id);
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {service.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {service.priceType === 'fixed' ? `KES ${service.price.toLocaleString()}` : 
                         service.priceType === 'hourly' ? `KES ${service.price.toLocaleString()}/hr` : 
                         'Contact for quote'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <FaStar className="text-yellow-400" />
                      <span>{service.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
                {provider.providerServices.length > 2 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{provider.providerServices.length - 2} more services
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
            <FaCheck className="text-sm" />
          </div>
        </div>
      )}
    </motion.div>
  )
}
