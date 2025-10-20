'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import LocationSharing from '@/components/LocationSharing'

// Paystack types
type PaystackResponse = {
  reference: string
  message: string
  status: string
}

type PaystackConfig = {
  key: string
  email: string
  amount: number
  currency: string
  reference?: string
  callback: (response: PaystackResponse) => void
  onClose: () => void
  metadata?: Record<string, any>
  channels?: string[]
}

type PaystackPopup = {
  setup: (config: PaystackConfig) => {
    openIframe: () => void
  }
}
import {
  FaArrowLeft,
  FaArrowRight,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaWrench,
  FaLightbulb,
  FaBroom,
  FaHammer,
  FaSearch,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
  FaDollarSign,
  FaStar,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaFileAlt
} from 'react-icons/fa'

// TypeScript declarations for Paystack
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: any) => {
        openIframe: () => void
      }
    }
  }
}

// Dynamic Service Pricing Structure
interface ServicePricing {
  id: string
  name: string
  priceRange: { min: number; max: number }
  sizeBased?: boolean
  sizeMultipliers?: Record<string, number>
  description: string
  estimatedDuration: string
  category: string
}

interface PriceBreakdown {
  serviceName: string
  basePrice: number
  sizeMultiplier?: number
  urgencyMultiplier: number
  locationMultiplier: number
  providersNeeded: number
  calculations: {
    baseService: number
    afterSize?: number
    afterUrgency: number
    afterLocation: number
    finalTotal: number
  }
}

const DYNAMIC_SERVICE_PRICING: Record<string, ServicePricing[]> = {
  plumbing: [
    {
      id: 'minor-repair',
      name: 'Minor leaks / tap replacement',
      priceRange: { min: 1500, max: 2000 },
      sizeBased: false,
      description: 'Fix small leaks, replace taps/faucets',
      estimatedDuration: '1-2 hours',
      category: 'plumbing'
    },
    {
      id: 'toilet-installation',
      name: 'Toilet / sink installation',
      priceRange: { min: 3000, max: 5000 },
      sizeBased: false,
      description: 'Install new toilet or sink',
      estimatedDuration: '2-4 hours',
      category: 'plumbing'
    },
    {
      id: 'water-heater',
      name: 'Water heater installation',
      priceRange: { min: 5000, max: 10000 },
      sizeBased: false,
      description: 'Install electric or gas water heater',
      estimatedDuration: '3-5 hours',
      category: 'plumbing'
    },
    {
      id: 'full-bathroom',
      name: 'Full bathroom plumbing setup',
      priceRange: { min: 15000, max: 35000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,
        'medium': 1.3,
        'large': 1.6
      },
      description: 'Complete bathroom plumbing installation',
      estimatedDuration: '1-3 days',
      category: 'plumbing'
    },
    {
      id: 'emergency-plumbing',
      name: 'Emergency call-out (same-day service)',
      priceRange: { min: 2000, max: 4000 },
      sizeBased: false,
      description: 'Emergency plumbing service',
      estimatedDuration: '1-4 hours',
      category: 'plumbing'
    }
  ],
  electrical: [
    {
      id: 'inspection',
      name: 'Electrical inspection / diagnosis',
      priceRange: { min: 1800, max: 3000 },
      sizeBased: false,
      description: 'Professional electrical system inspection',
      estimatedDuration: '1-3 hours',
      category: 'electrical'
    },
    {
      id: 'socket-installation',
      name: 'Socket / switch installation',
      priceRange: { min: 1000, max: 2000 },
      sizeBased: false,
      description: 'Install electrical sockets or switches',
      estimatedDuration: '30min-2 hours',
      category: 'electrical'
    },
    {
      id: 'lighting-installation',
      name: 'Lighting fixture installation',
      priceRange: { min: 1500, max: 5000 },
      sizeBased: false,
      description: 'Install ceiling lights, chandeliers, etc.',
      estimatedDuration: '1-3 hours',
      category: 'electrical'
    },
    {
      id: 'room-rewiring',
      name: 'Small rewiring (room or circuit)',
      priceRange: { min: 3500, max: 8000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,
        'medium': 1.4,
        'large': 1.8
      },
      description: 'Rewire single room or electrical circuit',
      estimatedDuration: '4-8 hours',
      category: 'electrical'
    },
    {
      id: 'full-rewiring',
      name: 'Full house rewiring (2–3 bedroom)',
      priceRange: { min: 30000, max: 50000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,   // 1-2 bedrooms
        'medium': 1.3,  // 3 bedrooms
        'large': 1.6    // 4+ bedrooms
      },
      description: 'Complete house electrical rewiring',
      estimatedDuration: '3-7 days',
      category: 'electrical'
    }
  ],
  cleaning: [
    {
      id: 'basic-1-2bed',
      name: 'Basic cleaning (1-2 bedrooms)',
      priceRange: { min: 1800, max: 3000 },
      sizeBased: false,
      description: 'Standard house cleaning for small apartments',
      estimatedDuration: '2-4 hours',
      category: 'cleaning'
    },
    {
      id: 'basic-3-4bed',
      name: 'Standard cleaning (3-4 bedrooms)',
      priceRange: { min: 3000, max: 4500 },
      sizeBased: false,
      description: 'Standard house cleaning for larger homes',
      estimatedDuration: '3-6 hours',
      category: 'cleaning'
    },
    {
      id: 'deep-cleaning',
      name: 'Deep cleaning (full house)',
      priceRange: { min: 5000, max: 12000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,    // 1-2 bedrooms
        'medium': 1.4,   // 3-4 bedrooms  
        'large': 1.8     // 5+ bedrooms
      },
      description: 'Thorough deep cleaning service',
      estimatedDuration: '4-8 hours',
      category: 'cleaning'
    },
    {
      id: 'post-construction',
      name: 'Post-construction cleaning',
      priceRange: { min: 8000, max: 20000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,
        'medium': 1.5,
        'large': 2.0
      },
      description: 'Clean up after construction or renovation',
      estimatedDuration: '6-12 hours',
      category: 'cleaning'
    },
    {
      id: 'carpet-cleaning',
      name: 'Carpet or upholstery cleaning',
      priceRange: { min: 2500, max: 6000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,    // Small carpet/single room
        'medium': 1.5,   // Medium carpet/living room
        'large': 2.2     // Large carpet/full house
      },
      description: 'Professional carpet and upholstery cleaning',
      estimatedDuration: '2-5 hours',
      category: 'cleaning'
    }
  ],
  carpentry: [
    {
      id: 'furniture-repair',
      name: 'Furniture repair',
      priceRange: { min: 1500, max: 4000 },
      sizeBased: false,
      description: 'Repair chairs, tables, cabinets, etc.',
      estimatedDuration: '2-5 hours',
      category: 'carpentry'
    },
    {
      id: 'custom-furniture',
      name: 'Custom furniture making',
      priceRange: { min: 5000, max: 25000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,    // Simple items
        'medium': 1.5,   // Medium complexity
        'large': 2.5     // Complex custom work
      },
      description: 'Build custom furniture to specification',
      estimatedDuration: '1-5 days',
      category: 'carpentry'
    },
    {
      id: 'door-installation',
      name: 'Door installation',
      priceRange: { min: 2000, max: 5000 },
      sizeBased: false,
      description: 'Install interior or exterior doors',
      estimatedDuration: '2-4 hours',
      category: 'carpentry'
    }
  ],
  painting: [
    {
      id: 'interior-painting',
      name: 'Interior painting',
      priceRange: { min: 3000, max: 8000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,    // 1-2 rooms
        'medium': 1.5,   // 3-4 rooms
        'large': 2.2     // Full house
      },
      description: 'Interior wall and ceiling painting',
      estimatedDuration: '1-3 days',
      category: 'painting'
    },
    {
      id: 'exterior-painting',
      name: 'Exterior painting',
      priceRange: { min: 5000, max: 15000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,    // Small building
        'medium': 1.6,   // Medium building
        'large': 2.5     // Large building
      },
      description: 'Exterior wall painting and protection',
      estimatedDuration: '2-5 days',
      category: 'painting'
    }
  ],
  gardening: [
    {
      id: 'lawn-maintenance',
      name: 'Lawn mowing and maintenance',
      priceRange: { min: 1000, max: 3000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,    // Small garden
        'medium': 1.4,   // Medium garden
        'large': 1.8     // Large garden
      },
      description: 'Mow lawn, trim edges, basic maintenance',
      estimatedDuration: '2-4 hours',
      category: 'gardening'
    },
    {
      id: 'garden-design',
      name: 'Garden design and landscaping',
      priceRange: { min: 5000, max: 20000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,
        'medium': 1.6,
        'large': 2.4
      },
      description: 'Complete garden design and landscaping',
      estimatedDuration: '2-7 days',
      category: 'gardening'
    }
  ],
  movers: [
    {
      id: 'local-moving',
      name: 'Local house moving',
      priceRange: { min: 8000, max: 15000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,    // 1-2 bedroom
        'medium': 1.5,   // 3-4 bedroom
        'large': 2.0     // 5+ bedroom
      },
      description: 'Move household items within Nairobi',
      estimatedDuration: '4-8 hours',
      category: 'movers'
    },
    {
      id: 'office-relocation',
      name: 'Office relocation',
      priceRange: { min: 10000, max: 25000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,    // Small office
        'medium': 1.6,   // Medium office
        'large': 2.2     // Large office
      },
      description: 'Complete office relocation service',
      estimatedDuration: '6-12 hours',
      category: 'movers'
    },
    {
      id: 'packing-service',
      name: 'Packing services',
      priceRange: { min: 3000, max: 8000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,
        'medium': 1.4,
        'large': 1.8
      },
      description: 'Professional packing of household items',
      estimatedDuration: '3-6 hours',
      category: 'movers'
    }
  ],
  fumigation: [
    {
      id: 'apartment-1bed',
      name: '1-bedroom apartment fumigation',
      priceRange: { min: 3500, max: 4500 },
      sizeBased: false,
      description: 'Complete pest control for 1-bedroom apartment',
      estimatedDuration: '2-3 hours',
      category: 'fumigation'
    },
    {
      id: 'apartment-2bed',
      name: '2-bedroom apartment fumigation',
      priceRange: { min: 4500, max: 5500 },
      sizeBased: false,
      description: 'Complete pest control for 2-bedroom apartment',
      estimatedDuration: '3-4 hours',
      category: 'fumigation'
    },
    {
      id: 'apartment-3bed',
      name: '3-bedroom apartment fumigation',
      priceRange: { min: 6000, max: 7500 },
      sizeBased: false,
      description: 'Complete pest control for 3-bedroom apartment',
      estimatedDuration: '4-5 hours',
      category: 'fumigation'
    },
    {
      id: 'house-large',
      name: '4-5 bedroom house fumigation',
      priceRange: { min: 8000, max: 16000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,    // 4 bedrooms
        'medium': 1.3,   // 5 bedrooms
        'large': 1.6     // 6+ bedrooms
      },
      description: 'Complete pest control for large house',
      estimatedDuration: '5-8 hours',
      category: 'fumigation'
    },
    {
      id: 'termite-treatment',
      name: 'Termite / rodent treatment',
      priceRange: { min: 5000, max: 12000 },
      sizeBased: true,
      sizeMultipliers: {
        'small': 1.0,    // Small infestation
        'medium': 1.4,   // Medium infestation
        'large': 1.8     // Large infestation
      },
      description: 'Specialized termite and rodent control',
      estimatedDuration: '3-6 hours',
      category: 'fumigation'
    }
  ],
  appliance: [
    {
      id: 'washing-machine',
      name: 'Washing machine repair',
      priceRange: { min: 3000, max: 4000 },
      sizeBased: false,
      description: 'Repair and maintenance of washing machines',
      estimatedDuration: '2-4 hours',
      category: 'appliance'
    },
    {
      id: 'refrigerator',
      name: 'Refrigerator repair',
      priceRange: { min: 3000, max: 4500 },
      sizeBased: false,
      description: 'Repair and maintenance of refrigerators',
      estimatedDuration: '2-4 hours',
      category: 'appliance'
    },
    {
      id: 'oven-cooker',
      name: 'Oven / cooker repair',
      priceRange: { min: 2500, max: 3000 },
      sizeBased: false,
      description: 'Repair gas and electric ovens/cookers',
      estimatedDuration: '1-3 hours',
      category: 'appliance'
    },
    {
      id: 'microwave-small',
      name: 'Microwave / small appliance repair',
      priceRange: { min: 1500, max: 2500 },
      sizeBased: false,
      description: 'Repair microwaves and small appliances',
      estimatedDuration: '1-2 hours',
      category: 'appliance'
    },
    {
      id: 'diagnostic',
      name: 'Diagnostic / call-out service',
      priceRange: { min: 1000, max: 2000 },
      sizeBased: false,
      description: 'Professional appliance diagnosis',
      estimatedDuration: '30min-1 hour',
      category: 'appliance'
    }
  ]
}

// Legacy support - calculate average pricing for backward compatibility
const SERVICE_PRICING: Record<string, number> = {
  'cleaning': 3500,    // Average across cleaning services
  'electrical': 5000,  // Average across electrical services
  'plumbing': 4000,    // Average across plumbing services
  'painting': 6000,    // Average across painting services
  'movers': 12000,     // Average across moving services
  'carpentry': 4000,   // Average across carpentry services
  'gardening': 3500,   // Average across gardening services
  'fumigation': 6500,  // Average across fumigation services
  'appliance': 2800    // Average across appliance repair services
}

// Service Categories (same as dashboard)
interface ServiceCategory {
  id: string
  name: string
  description: string
  detailedDescription: string
  icon: React.ComponentType<any>
  imageUrl: string
  color: string
  averagePrice: string
  priceRange: string
  rating: number
  reviews: number
  estimatedDuration: string
  popularServices: string[]
  serviceAreas: string[]
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Expert plumbing services for your home',
    detailedDescription: 'Professional plumbers for repairs, installations, maintenance, and emergency services. From leaky faucets to complete pipe installations.',
    icon: FaWrench,
    imageUrl: '/images/services/tapper.jpg',
    color: 'bg-blue-100',
    averagePrice: 'KES 2,000',
    priceRange: 'Fixed rate per service',
    rating: 4.8,
    reviews: 342,
    estimatedDuration: '1-4 hours',
    popularServices: ['Pipe repair', 'Faucet installation', 'Toilet repair', 'Water heater service'],
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo', 'Lavington']
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Licensed electricians for all electrical work',
    detailedDescription: 'Certified electricians for wiring, repairs, installations, and electrical maintenance. Safety-first approach with guaranteed work.',
    icon: FaLightbulb,
    imageUrl: '/images/services/electrical.jpg',
    color: 'bg-yellow-100',
    averagePrice: 'KES 2,000',
    priceRange: 'Fixed rate per service',
    rating: 4.9,
    reviews: 256,
    estimatedDuration: '2-6 hours',
    popularServices: ['Wiring installation', 'Socket repair', 'Lighting setup', 'Electrical maintenance'],
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo', 'Lavington']
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    description: 'Professional cleaning services',
    detailedDescription: 'Comprehensive cleaning services for homes and offices. Deep cleaning, regular maintenance, and specialized cleaning solutions.',
    icon: FaBroom,
    imageUrl: '/images/services/cleaning.jpg',
    color: 'bg-green-100',
    averagePrice: 'KES 1,800',
    priceRange: 'Fixed rate per cleaner',
    rating: 4.7,
    reviews: 189,
    estimatedDuration: '2-8 hours',
    popularServices: ['House cleaning', 'Deep cleaning', 'Office cleaning', 'Move-in/out cleaning'],
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo', 'Lavington']
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    description: 'Skilled carpenters for furniture and repairs',
    detailedDescription: 'Expert carpenters for furniture making, repairs, installations, and custom woodwork. Quality craftsmanship guaranteed.',
    icon: FaHammer,
    imageUrl: '/images/services/carpentry.jpg',
    color: 'bg-orange-100',
    averagePrice: 'KES 2,000',
    priceRange: 'Fixed rate per service',
    rating: 4.6,
    reviews: 145,
    estimatedDuration: '3-8 hours',
    popularServices: ['Furniture repair', 'Custom cabinets', 'Door installation', 'Shelving'],
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo', 'Lavington']
  },
  {
    id: 'painting',
    name: 'Painting',
    description: 'Professional painting and decoration',
    detailedDescription: 'Interior and exterior painting services with premium materials. Color consultation and decorative finishes available.',
    icon: FaBroom,
    imageUrl: '/images/services/painting.jpg',
    color: 'bg-purple-100',
    averagePrice: 'KES 2,500',
    priceRange: 'Fixed rate per service',
    rating: 4.5,
    reviews: 98,
    estimatedDuration: '4-12 hours',
    popularServices: ['Interior painting', 'Exterior painting', 'Wall decoration', 'Color consultation'],
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo', 'Lavington']
  },
  {
    id: 'gardening',
    name: 'Gardening',
    description: 'Garden maintenance and landscaping',
    detailedDescription: 'Complete garden care from maintenance to landscaping. Plant care, lawn maintenance, and garden design services.',
    icon: FaWrench,
    imageUrl: '/images/services/gardening.jpg',
    color: 'bg-emerald-100',
    averagePrice: 'KES 1,500',
    priceRange: 'Fixed rate per service',
    rating: 4.4,
    reviews: 67,
    estimatedDuration: '2-6 hours',
    popularServices: ['Lawn mowing', 'Plant care', 'Garden design', 'Tree trimming'],
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo', 'Lavington']
  },
  {
    id: 'movers',
    name: 'Movers',
    description: 'Professional moving and relocation services',
    detailedDescription: 'Complete moving services including packing, transportation, and unpacking. Residential and office relocations with careful handling.',
    icon: FaWrench,
    imageUrl: '/images/services/movers.jpg',
    color: 'bg-indigo-100',
    averagePrice: 'KES 3,000',
    priceRange: 'Fixed rate per service',
    rating: 4.6,
    reviews: 89,
    estimatedDuration: '4-12 hours',
    popularServices: ['House moving', 'Office relocation', 'Packing services', 'Furniture transport'],
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo', 'Lavington']
  },
  {
    id: 'fumigation',
    name: 'Fumigation & Pest Control',
    description: 'Professional pest control and fumigation services',
    detailedDescription: 'Complete pest control solutions including fumigation, termite treatment, and rodent control. Safe and effective pest management.',
    icon: FaWrench,
    imageUrl: '/images/services/fumigation.jpg',
    color: 'bg-red-100',
    averagePrice: 'KES 6,500',
    priceRange: 'Size-based pricing',
    rating: 4.7,
    reviews: 156,
    estimatedDuration: '2-8 hours',
    popularServices: ['Apartment fumigation', 'House fumigation', 'Termite treatment', 'Rodent control'],
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo', 'Lavington']
  },
  {
    id: 'appliance',
    name: 'Appliance Repair',
    description: 'Expert appliance maintenance and repair',
    detailedDescription: 'Professional repair services for all home appliances including washing machines, refrigerators, ovens, and small appliances.',
    icon: FaWrench,
    imageUrl: '/images/services/appliance.jpg',
    color: 'bg-yellow-100',
    averagePrice: 'KES 2,800',
    priceRange: 'Service-based pricing',
    rating: 4.6,
    reviews: 203,
    estimatedDuration: '1-4 hours',
    popularServices: ['Washing machine repair', 'Refrigerator repair', 'Oven repair', 'Diagnostic service'],
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo', 'Lavington']
  }
];

// Booking flow steps
type BookingStep = 'category' | 'details' | 'location' | 'providers' | 'payment'

interface BookingData {
  category: ServiceCategory | null
  providersNeeded: number
  date: string
  time: string
  duration: number
  location: {
    address: string
    coordinates?: { lat: number; lng: number }
    area: string
  }
  description: string
  urgency: 'normal' | 'urgent' | 'emergency'
  budget: { min: number; max: number }
  paymentTiming: 'pay-now' | 'pay-after' | null
  paymentMethod: 'card' | 'mobile-money' | 'mpesa' | null
  // Phase 2 & 3 additions
  selectedSubService?: ServicePricing | null
  propertySize: 'small' | 'medium' | 'large'
  priceBreakdown?: PriceBreakdown | null
}

const serviceAreas = ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo', 'Lavington']

// Location-based pricing multipliers
const LOCATION_MULTIPLIERS: Record<string, number> = {
  'Lavington': 1.2,    // Premium area
  'Kileleshwa': 1.1,   // Premium area
  'Westlands': 1.0,    // Standard
  'Kilimani': 1.0,     // Standard
  'Parklands': 0.95,   // Slightly lower
  'Nyayo': 0.9         // Lower cost area
}

// Urgency multipliers
const URGENCY_MULTIPLIERS = {
  'normal': 1.0,
  'urgent': 1.5,
  'emergency': 2.0
}

// Helper function to get available sub-services for a category
const getSubServices = (categoryId: string): ServicePricing[] => {
  return DYNAMIC_SERVICE_PRICING[categoryId] || []
}

// Helper function to calculate dynamic price
const calculateDynamicPrice = (
  category: string,
  subServiceId?: string,
  propertySize: 'small' | 'medium' | 'large' = 'medium',
  urgency: 'normal' | 'urgent' | 'emergency' = 'normal',
  location: string = 'Westlands',
  providersNeeded: number = 1
): { basePrice: number; finalPrice: number; breakdown: PriceBreakdown } => {
  
  // Get sub-service or use first available
  const subServices = getSubServices(category)
  let selectedService: ServicePricing
  
  if (subServiceId) {
    selectedService = subServices.find(s => s.id === subServiceId) || subServices[0]
  } else {
    selectedService = subServices[0]
  }
  
  if (!selectedService) {
    // Fallback to legacy pricing
    const legacyPrice = SERVICE_PRICING[category] || 2000
    return {
      basePrice: legacyPrice,
      finalPrice: legacyPrice * URGENCY_MULTIPLIERS[urgency] * providersNeeded,
      breakdown: {
        serviceName: `${category} Service`,
        basePrice: legacyPrice,
        urgencyMultiplier: URGENCY_MULTIPLIERS[urgency],
        locationMultiplier: 1.0,
        providersNeeded,
        calculations: {
          baseService: legacyPrice,
          afterUrgency: legacyPrice * URGENCY_MULTIPLIERS[urgency],
          afterLocation: legacyPrice * URGENCY_MULTIPLIERS[urgency],
          finalTotal: legacyPrice * URGENCY_MULTIPLIERS[urgency] * providersNeeded
        }
      }
    }
  }
  
  // Calculate base price (average of range)
  let basePrice = (selectedService.priceRange.min + selectedService.priceRange.max) / 2
  
  // Apply size multiplier if applicable
  let sizeMultiplier = 1.0
  if (selectedService.sizeBased && selectedService.sizeMultipliers) {
    sizeMultiplier = selectedService.sizeMultipliers[propertySize] || 1.0
    basePrice *= sizeMultiplier
  }
  
  // Apply urgency multiplier
  const urgencyMultiplier = URGENCY_MULTIPLIERS[urgency]
  
  // Apply location multiplier
  const locationMultiplier = LOCATION_MULTIPLIERS[location] || 1.0
  
  // Calculate final price
  const finalPrice = Math.round(
    basePrice * urgencyMultiplier * locationMultiplier * providersNeeded
  )
  
  // Calculate the base price for calculations
  const calculationBasePrice = Math.round((selectedService.priceRange.min + selectedService.priceRange.max) / 2)
  
  // Create detailed breakdown
  const breakdown: PriceBreakdown = {
    serviceName: selectedService.name,
    basePrice: calculationBasePrice,
    sizeMultiplier: selectedService.sizeBased ? sizeMultiplier : undefined,
    urgencyMultiplier,
    locationMultiplier,
    providersNeeded,
    calculations: {
      baseService: calculationBasePrice,
      afterSize: selectedService.sizeBased ? Math.round(calculationBasePrice * sizeMultiplier) : undefined,
      afterUrgency: Math.round(basePrice * urgencyMultiplier),
      afterLocation: Math.round(basePrice * urgencyMultiplier * locationMultiplier),
      finalTotal: finalPrice
    }
  }
  
  return {
    basePrice: Math.round(basePrice),
    finalPrice,
    breakdown
  }
}

// Helper function to get price range for display
const getServicePriceRange = (categoryId: string): string => {
  const subServices = getSubServices(categoryId)
  if (subServices.length === 0) {
    return formatServicePrice(categoryId)
  }
  
  const minPrice = Math.min(...subServices.map(s => s.priceRange.min))
  const maxPrice = Math.max(...subServices.map(s => s.priceRange.max))
  
  return `KES ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`
}

// Legacy helper functions for backward compatibility
const getServicePrice = (categoryId: string): number => {
  return SERVICE_PRICING[categoryId] || 2000
}

const formatServicePrice = (categoryId: string): string => {
  const price = getServicePrice(categoryId)
  return `KES ${price.toLocaleString()}`
}

function BookServicePageContent() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [currentStep, setCurrentStep] = useState<BookingStep>('category')
  const [bookingData, setBookingData] = useState<BookingData>({
    category: null,
    providersNeeded: 1,
    date: '',
    time: '',
    duration: 2,
    location: { address: '', area: '' },
    description: '',
    urgency: 'normal',
    budget: { min: 1000, max: 5000 },
    paymentTiming: null,
    paymentMethod: null,
    selectedSubService: null,
    propertySize: 'medium',
    priceBreakdown: null
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [providerMatching, setProviderMatching] = useState<{
    loading: boolean
    providers: any[]
    error: string | null
    totalFound: number
  }>({
    loading: false,
    providers: [],
    error: null,
    totalFound: 0
  })
  const [selectedProviders, setSelectedProviders] = useState<any[]>([])
  const [locationSharing, setLocationSharing] = useState<{
    active: boolean
    location: any | null
    error: string | null
  }>({
    active: false,
    location: null,
    error: null
  })

  // Google Maps and location refs (commented out for future use)
  const addressSearchRef = useRef<HTMLInputElement>(null)
  // const mapRef = useRef<HTMLDivElement>(null)
  // const mapInstanceRef = useRef<google.maps.Map | null>(null)
  // const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Check for pre-selected category from URL
  useEffect(() => {
    const categoryId = searchParams?.get('category')
    const serviceId = searchParams?.get('service')
    const emergency = searchParams?.get('emergency')
    
    // Check for both 'category' and 'service' parameters
    const targetId = categoryId || serviceId
    
    if (targetId) {
      const category = serviceCategories.find(cat => cat.id === targetId)
      if (category) {
        console.log('Pre-selecting service from URL:', category.name)
        setBookingData(prev => ({ ...prev, category }))
        setCurrentStep('details')
      }
    }
    
    if (emergency === 'true') {
      setBookingData(prev => ({ ...prev, urgency: 'emergency' }))
    }
  }, [searchParams])

  // Phase 3: Real-time price calculation effect
  useEffect(() => {
    if (bookingData.category && bookingData.selectedSubService) {
      const pricing = calculateDynamicPrice(
        bookingData.category.id,
        bookingData.selectedSubService.id,
        bookingData.propertySize,
        bookingData.urgency,
        bookingData.location.area || 'Westlands',
        bookingData.providersNeeded
      )
      
      setBookingData(prev => ({
        ...prev,
        priceBreakdown: pricing.breakdown
      }))
    } else if (bookingData.category) {
      // Auto-select first sub-service if none selected
      const subServices = getSubServices(bookingData.category.id)
      if (subServices.length > 0 && !bookingData.selectedSubService) {
        setBookingData(prev => ({
          ...prev,
          selectedSubService: subServices[0]
        }))
      }
    }
  }, [bookingData.category, bookingData.selectedSubService, bookingData.propertySize, bookingData.urgency, bookingData.location.area, bookingData.providersNeeded])

  // Initialize Google Maps when location step is active (commented out)
  // useEffect(() => {
  //   if (currentStep === 'location') {
  //     initializeGoogleMaps()
  //   }
  // }, [currentStep])

  const handleCategorySelect = (category: ServiceCategory) => {
    setBookingData(prev => ({ ...prev, category }))
    setCurrentStep('details')
  }

  // Paystack Payment Integration Functions
  const initializePaystack = (): Promise<PaystackPopup> => {
    return new Promise((resolve, reject) => {
      if ((window as any).PaystackPop) {
        resolve((window as any).PaystackPop)
        return
      }
      
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.onload = () => {
        if ((window as any).PaystackPop) {
          resolve((window as any).PaystackPop)
        } else {
          reject(new Error('Paystack failed to load'))
        }
      }
      script.onerror = () => reject(new Error('Failed to load Paystack script'))
      document.head.appendChild(script)
    })
  }

  const calculateTotalAmount = () => {
    if (!bookingData.category) return 0
    
    // Use dynamic pricing calculation
    const pricing = calculateDynamicPrice(
      bookingData.category.id,
      bookingData.selectedSubService?.id,
      bookingData.propertySize,
      bookingData.urgency,
      bookingData.location.area || 'Westlands',
      bookingData.providersNeeded
    )
    
    // Update booking data with price breakdown
    setBookingData(prev => ({
      ...prev,
      priceBreakdown: pricing.breakdown
    }))
    
    return pricing.finalPrice
  }

  const handlePaystackPayment = async (bookingId: string) => {
    try {
      setLoading(true)
      const amount = calculateTotalAmount()
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'
      const token = localStorage.getItem('authToken')

      // Initialize payment with backend
      const initResponse = await fetch(`${BACKEND_URL}/api/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: amount,
          email: user?.email || ''
        })
      })

      const initResult = await initResponse.json()

      if (!initResponse.ok) {
        throw new Error(initResult.message || 'Payment initialization failed')
      }

      // Use Paystack popup with backend-generated data
      const PaystackPop = await initializePaystack()
      
      const paymentData: PaystackConfig = {
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key',
        email: user?.email || '',
        amount: initResult.data.amount,
        currency: 'NGN',
        reference: initResult.data.reference,
        callback: async (response: PaystackResponse) => {
          console.log('Payment successful:', response)
          await verifyPayment(response.reference, bookingId)
        },
        onClose: () => {
          console.log('Payment cancelled')
          setLoading(false)
        }
      }

      // Configure STK Push for mobile money
      if (bookingData.paymentMethod === 'mobile-money' || bookingData.paymentMethod === 'mpesa') {
        paymentData.channels = ['mobile_money']
      }

      const handler = PaystackPop.setup(paymentData)
      handler.openIframe()
    } catch (error) {
      console.error('Payment initialization failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment setup failed'
      alert(`Payment failed: ${errorMessage}. Please try again.`)
      setLoading(false)
    }
  }

  const verifyPayment = async (reference: string, bookingId: string) => {
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'
      const token = localStorage.getItem('authToken')

      const verifyResponse = await fetch(`${BACKEND_URL}/api/payments/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const verifyResult = await verifyResponse.json()

      if (verifyResponse.ok && verifyResult.status === 'success') {
        console.log('✅ Payment verified successfully:', verifyResult.data)
        
        // Show success message
        alert(`🎉 Payment Successful!

Booking Number: ${verifyResult.data.booking.bookingNumber}
Payment Status: ${verifyResult.data.booking.payment.status}
Amount Paid: KES ${verifyResult.data.transaction.amount / 100}

Your booking has been confirmed and you'll receive an email confirmation shortly.`)

        // Redirect to bookings page
        window.location.href = '/bookings'
      } else {
        throw new Error(verifyResult.message || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
      alert(`Payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingConfirmation = async (paymentReference?: string) => {
    try {
      setLoading(true)
      
      const bookingPayload = {
        category: bookingData.category,
        date: bookingData.date,
        time: bookingData.time,
        location: {
          area: bookingData.location?.area || "Nairobi",
          address: bookingData.location?.address || "",
          coordinates: locationSharing.location ? {
            lat: locationSharing.location.latitude,
            lng: locationSharing.location.longitude
          } : {
            lat: -1.2921,
            lng: 36.8219
          }
        },
        description: bookingData.description,
        urgency: bookingData.urgency,
        providersNeeded: bookingData.providersNeeded,
        paymentTiming: bookingData.paymentTiming,
        paymentMethod: bookingData.paymentMethod,
        // Dynamic pricing details
        selectedSubService: bookingData.selectedSubService ? {
          id: bookingData.selectedSubService.id,
          name: bookingData.selectedSubService.name,
          priceRange: bookingData.selectedSubService.priceRange,
          sizeBased: bookingData.selectedSubService.sizeBased
        } : null,
        propertySize: bookingData.propertySize,
        priceBreakdown: bookingData.priceBreakdown,
        selectedProvider: selectedProviders[0] ? {
          id: selectedProviders[0]._id || selectedProviders[0].id,
          name: selectedProviders[0].name || selectedProviders[0].Name,
          serviceId: selectedProviders[0].serviceId || 
                    selectedProviders[0].mainServiceId || 
                    selectedProviders[0].service?._id ||
                    selectedProviders[0].service ||
                    selectedProviders[0]._id, // Use provider ID as fallback for service ID
          isFromFallback: selectedProviders[0].isFromFallback || false
        } : null,
        totalAmount: calculateTotalAmount(),
        paymentReference
      }

      console.log('🎉 Creating booking...', bookingPayload)
      
      // Make the API call to create booking
      const token = localStorage.getItem('authToken')
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'
      
      const response = await fetch(`${BACKEND_URL}/api/bookings/simple-v2`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Booking creation failed')
      }
      
      console.log('✅ Booking created successfully:', result.data.booking)
      
      // Handle payment flow
      if (bookingData.paymentTiming === 'pay-now') {
        console.log('🔄 Initiating payment flow...')
        // Start payment process
        await handlePaystackPayment(result.data.booking.id)
        return
      }
      
      // For pay-later bookings, show success message and redirect
      alert(`🎉 Booking Confirmed!

Booking Number: ${result.data.booking.bookingNumber}
Service: ${bookingData.category?.name}
Date: ${bookingData.date} at ${bookingData.time}
Status: ${result.data.booking.status}

📧 You will receive a payment link when service is completed.`)
      
      // Redirect to bookings page to see the booking
      window.location.href = '/bookings'
      
    } catch (error) {
      console.error('❌ Booking creation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Booking failed: ${errorMessage}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const validatePaymentStep = () => {
    const newErrors: Record<string, string> = {}
    
    if (!bookingData.paymentTiming) {
      newErrors.paymentTiming = 'Please select when you would like to pay'
    }
    
    if (!bookingData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStepForward = () => {
    if (validateCurrentStep()) {
      switch (currentStep) {
        case 'category':
          setCurrentStep('details')
          break
        case 'details':
          setCurrentStep('location')
          break
        case 'location':
          setCurrentStep('providers')
          // Fetch providers when entering provider selection step
          fetchMatchingProviders()
          break
        case 'providers':
          setCurrentStep('payment')
          break
      }
    }
  }

  const fetchMatchingProviders = async () => {
    setProviderMatching(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const token = localStorage.getItem('authToken')
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://solutilconnect-backend-api-g6g4hhb2eeh7hjep.southafricanorth-01.azurewebsites.net'
      
      const requestData = {
        category: bookingData.category?.id,
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration,
        location: bookingData.location,
        providersNeeded: bookingData.providersNeeded,
        urgency: bookingData.urgency,
        budget: bookingData.budget,
        description: bookingData.description
      }

      console.log('Fetching providers with criteria:', requestData)

      // Try the NEW Ultimate Provider Discovery system first! 🚀
      console.log('🚀 Using Ultimate Provider Discovery System...')
      let response = await fetch(`${BACKEND_URL}/api/booking/ultimate-provider-discovery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      let data = await response.json()
      console.log('Ultimate Provider Discovery response:', data)
      
      if (data.success && data.data.providers?.length > 0) {
        console.log(`✅ Ultimate Discovery found ${data.data.providers.length} providers!`)
        console.log('Search strategies used:', data.data.searchStrategies)
        
        setProviderMatching({
          loading: false,
          providers: data.data.providers || [],
          error: null,
          totalFound: data.data.totalFound || 0
        })
        return
      }

      // Fallback: Enhanced matching (should rarely be needed now)
      console.log('⚠️ Ultimate Discovery found no providers, trying enhanced matching...')
      response = await fetch(`${BACKEND_URL}/api/booking/match-providers-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      data = await response.json()
      console.log('Enhanced matching fallback response:', data)
      
      if (data.success && data.data.providers?.length > 0) {
        setProviderMatching({
          loading: false,
          providers: data.data.providers || [],
          error: null,
          totalFound: data.data.matching?.totalFound || 0
        })
        console.log('Found providers through enhanced matching:', data.data.providers?.length || 0)
        return
      }

      // Fallback: If no providers found through intelligent matching, try simple category search
      console.log('No providers found through matching, trying simple category search...')
      console.log('Matching API response was:', data)
      
      const categoryMappings: Record<string, string> = {
        'plumbing': 'plumbing',
        'electrical': 'electrical', 
        'cleaning': 'cleaning',
        'carpentry': 'carpentry',
        'painting': 'painting',
        'gardening': 'gardening',
        'movers': 'moving'
      }
      
      const categoryId = bookingData.category?.id
      if (!categoryId) {
        throw new Error('No service category selected')
      }
      
      const serviceSkill = categoryMappings[categoryId] || categoryId
      
      console.log('Trying fallback API with service skill:', serviceSkill)
      
      response = await fetch(`${BACKEND_URL}/api/providers?service=${serviceSkill}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      data = await response.json()
      console.log('Fallback API response:', data)
      
      if (data.status === 'success' && data.data?.providers?.length > 0) {
        setProviderMatching({
          loading: false,
          providers: data.data.providers || [],
          error: null,
          totalFound: data.data.providers?.length || 0
        })
        console.log('Found providers through simple search:', data.data.providers?.length || 0)
      } else {
        console.log('No providers found in fallback either. Response:', data)
        
        // Final test: Try to fetch ANY providers to test basic connectivity
        console.log('Testing basic API connectivity - fetching any providers...')
        const testResponse = await fetch(`${BACKEND_URL}/api/providers?limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const testData = await testResponse.json()
        console.log('Basic providers API test:', testData)
        console.log('testData.status:', testData.status)
        console.log('testData.data.providers length:', testData.data?.providers?.length)
        console.log('testData structure keys:', Object.keys(testData))
        
        if (testData.status === 'success' && testData.data?.providers?.length > 0) {
          console.log('Found providers in basic API. Let\'s check their skills:')
          const categoryId = bookingData.category?.id || 'electrical'
          const requiredSkill = categoryMappings[categoryId] || categoryId
          
          // STRICT category filtering - only exact category matches
          const strictCategoryKeywords: Record<string, string[]> = {
            'electrical': ['electrical', 'wiring', 'lighting', 'electrical repair', 'electrician'],
            'plumbing': ['plumbing', 'pipe repair', 'water systems', 'plumber', 'plumbing services'],
            'cleaning': ['cleaning', 'house cleaning', 'deep cleaning', 'office cleaning', 'cleaner'],
            'carpentry': ['carpentry', 'furniture', 'woodwork', 'cabinet making', 'carpenter'],
            'painting': ['painting', 'interior painting', 'exterior painting', 'painter'],
            'gardening': ['gardening', 'landscaping', 'lawn care', 'gardener'],
            'movers': ['moving', 'relocation', 'packing', 'furniture moving', 'mover']
          }
          
          const allowedSkills = strictCategoryKeywords[requiredSkill] || [requiredSkill]
          console.log(`Strict filtering for ${requiredSkill}. Allowed skills:`, allowedSkills)
          
          const matchingProviders = testData.data.providers.filter((provider: any) => {
            const providerSkills = provider.providerProfile?.skills || provider.skills || []
            
            // STRICT matching - skill must be in the allowed list for this category
            const hasExactMatch = providerSkills.some((skill: string) => 
              allowedSkills.some((allowedSkill: string) => 
                skill.toLowerCase().includes(allowedSkill.toLowerCase()) ||
                allowedSkill.toLowerCase().includes(skill.toLowerCase())
              )
            )
            
            console.log(`Provider ${provider.name}:`, {
              skills: providerSkills,
              requiredSkill,
              allowedSkills,
              hasExactMatch,
              providerStatus: provider.providerStatus
            })
            
            return hasExactMatch && provider.providerStatus === 'approved'
          }).map((provider: any) => {
            // Enrich provider with service information for booking
            const enrichedProvider = {
              ...provider,
              serviceId: provider._id, // Use provider ID as fallback service ID
              serviceName: `${requiredSkill.charAt(0).toUpperCase() + requiredSkill.slice(1)} Services`,
              category: requiredSkill,
              price: 3000, // Default price
              isFromFallback: true
            }
            
            console.log(`Enriched provider ${provider.name}:`, {
              id: enrichedProvider._id,
              serviceId: enrichedProvider.serviceId,
              serviceName: enrichedProvider.serviceName
            })
            
            return enrichedProvider
          })
          
          if (matchingProviders.length > 0) {
            console.log(`Found ${matchingProviders.length} providers with matching skills for ${requiredSkill}`)
            setProviderMatching({
              loading: false,
              providers: matchingProviders,
              error: null,
              totalFound: matchingProviders.length
            })
            return
          } else {
            console.log(`No providers found with ${requiredSkill} skills. Using all providers as fallback.`)
            // Still use all providers but log the issue
            setProviderMatching({
              loading: false,
              providers: testData.data.providers,
              error: null,
              totalFound: testData.data.providers.length
            })
            return
          }
        } else {
          console.log('Condition failed. testData.status:', testData.status)
          console.log('testData.data:', testData.data)
        }
        
        setProviderMatching(prev => ({
          ...prev,
          loading: false,
          error: `No ${bookingData.category?.name} providers found in your area. Please try a different service or contact support.`
        }))
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
      setProviderMatching(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to connect to the server. Please try again.'
      }))
    }
  }

  const handleProviderSelection = (provider: any) => {
    console.log('Provider selection - Full provider object:', provider)
    console.log('Provider keys:', Object.keys(provider))
    console.log('Provider._id:', provider._id)
    console.log('Provider.id:', provider.id)
    console.log('Provider.serviceId:', provider.serviceId)
    console.log('Provider.mainServiceId:', provider.mainServiceId)
    console.log('Provider.service:', provider.service)
    
    setSelectedProviders(prev => {
      const isSelected = prev.find(p => p._id === provider._id)
      if (isSelected) {
        return prev.filter(p => p._id !== provider._id)
      } else if (prev.length < bookingData.providersNeeded) {
        return [...prev, provider]
      }
      return prev
    })
  }

  const handleLocationUpdate = (location: any) => {
    setLocationSharing(prev => ({
      ...prev,
      location,
      error: null
    }))
    console.log('Location updated:', location)
  }

  const handleLocationError = (error: string) => {
    setLocationSharing(prev => ({
      ...prev,
      error
    }))
    console.error('Location error:', error)
  }

  // Simple location functions (without Google Maps)
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocationSharing(prev => ({ ...prev, active: true }))
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = {
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          }
          
          setLocationSharing(prev => ({
            ...prev,
            location,
            active: false
          }))

          // Simple reverse geocoding simulation
          reverseGeocode(latitude, longitude)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setLocationSharing(prev => ({
            ...prev,
            active: false,
            error: 'Could not get your location. Please enter address manually.'
          }))
        }
      )
    } else {
      setLocationSharing(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser.'
      }))
    }
  }

  const handleSearchAddress = () => {
    // Focus on the address input for manual entry
    if (addressSearchRef.current) {
      addressSearchRef.current.focus()
    }
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Simple coordinate display (Google Maps functionality commented out)
      const coordinateAddress = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
      
      setBookingData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          address: `GPS Location: ${coordinateAddress}\n\nPlease add more details about your exact location, building name, apartment number, etc.`
        }
      }))
      
      console.log('Location coordinates captured:', { lat, lng })
      
      // Google Maps reverse geocoding (commented out for future use)
      // if (window.google && window.google.maps) {
      //   const geocoder = new google.maps.Geocoder()
      //   const response = await geocoder.geocode({
      //     location: { lat, lng }
      //   })
      //   if (response.results && response.results[0]) {
      //     const address = response.results[0].formatted_address
      //     setBookingData(prev => ({
      //       ...prev,
      //       location: { ...prev.location, address: address }
      //     }))
      //   }
      // }
    } catch (error) {
      console.error('Location processing failed:', error)
      // Fallback address
      setBookingData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
        }
      }))
    }
  }

  // Google Maps initialization (commented out for future use)
  /*
  const initializeGoogleMaps = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey || apiKey === 'your_api_key_here') {
        console.warn('Google Maps API key not configured')
        return
      }

      const { Loader } = await import('@googlemaps/js-api-loader')
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places']
      })
      
      await loader.load()
      console.log('Google Maps API loaded successfully')
      
      if (mapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: -1.2921, lng: 36.8219 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        })
        mapInstanceRef.current = map

        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat()
            const lng = event.latLng.lng()
            
            setLocationSharing(prev => ({
              ...prev,
              location: {
                latitude: lat,
                longitude: lng,
                accuracy: 10,
                timestamp: Date.now()
              }
            }))

            reverseGeocode(lat, lng)

            const marker = new google.maps.Marker({
              position: { lat, lng },
              map: map,
              title: 'Selected Location',
              animation: google.maps.Animation.DROP
            })
          }
        })
      }
      
      if (addressSearchRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(addressSearchRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'ke' },
          fields: ['address_components', 'geometry', 'name', 'formatted_address']
        })
        
        autocompleteRef.current = autocomplete

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            
            setLocationSharing(prev => ({
              ...prev,
              location: {
                latitude: lat,
                longitude: lng,
                accuracy: 10,
                timestamp: Date.now()
              }
            }))

            setBookingData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                address: place.formatted_address || place.name || ''
              }
            }))

            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter({ lat, lng })
              mapInstanceRef.current.setZoom(15)
              
              new google.maps.Marker({
                position: { lat, lng },
                map: mapInstanceRef.current,
                title: 'Selected Location',
                animation: google.maps.Animation.DROP
              })
            }
          }
        })
      }
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error)
    }
  }
  */

  const handleStepBack = () => {
    switch (currentStep) {
      case 'details':
        setCurrentStep('category')
        break
      case 'location':
        setCurrentStep('details')
        break
      case 'providers':
        setCurrentStep('location')
        break
      case 'payment':
        setCurrentStep('providers')
        break
    }
  }

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 'category':
        if (!bookingData.category) {
          newErrors.category = 'Please select a service category'
        }
        break
      case 'details':
        if (!bookingData.date) newErrors.date = 'Please select a date'
        if (!bookingData.time) newErrors.time = 'Please select a time'
        if (!bookingData.selectedSubService) newErrors.subService = 'Please select a specific service'
        // Description is now optional - no validation required
        // Duration has default value, no validation needed
        break
      case 'location':
        // Address is now optional - area is required for provider matching
        if (!bookingData.location.area) newErrors.area = 'Please select your area'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'category': return 'Choose Service Category'
      case 'details': return 'Service Details'
      case 'location': return 'Location & Area'
      case 'providers': return 'Select Providers'
      case 'payment': return 'Payment & Confirmation'
      default: return 'Book Service'
    }
  }

  const getProgress = () => {
    const steps = ['category', 'details', 'location', 'providers', 'payment']
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100
  }

  return (
    <RoleGuard requiredRole="client">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => currentStep === 'category' ? router.push('/dashboard') : handleStepBack()}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FaArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h1>
                  <p className="text-gray-600">Book professional services in Nairobi</p>
                </div>
              </div>
              {bookingData.urgency === 'emergency' && (
                <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-full">
                  <FaExclamationTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Emergency Service</span>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Category</span>
                <span>Details</span>
                <span>Location</span>
                <span>Providers</span>
                <span>Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Category Selection */}
            {currentStep === 'category' && (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">What Service Do You Need?</h2>
                  <p className="text-lg text-gray-600">Choose the service category that matches your needs</p>
                  <div className="mt-2 inline-flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    <FaCheck className="h-3 w-3" />
                    <span>All services include professional providers & fixed pricing</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceCategories.map((category) => (
                    <motion.button
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        bookingData.category?.id === category.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-orange-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mb-4`}>
                        <category.icon className="h-6 w-6 text-gray-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name} Service</h3>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <FaStar className="h-3 w-3 text-yellow-400 mr-1" />
                            <span>{category.rating} rating</span>
                          </div>
                          <span>({category.reviews} reviews)</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-orange-600">{getServicePriceRange(category.id)}</div>
                          <div className="text-xs">Price range</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {errors.category && (
                  <div className="text-red-500 text-sm text-center">{errors.category}</div>
                )}
              </motion.div>
            )}

            {/* Step 2: Service Details */}
            {currentStep === 'details' && bookingData.category && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-12 h-12 rounded-full ${bookingData.category.color} flex items-center justify-center`}>
                      <bookingData.category.icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{bookingData.category.name} Service Details</h3>
                      <p className="text-gray-600">{bookingData.category.detailedDescription}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="flex items-center text-orange-600">
                          <FaDollarSign className="h-3 w-3 mr-1" />
                          <strong>{getServicePriceRange(bookingData.category.id)}</strong>
                        </span>
                        <span className="flex items-center text-gray-500">
                          <FaClock className="h-3 w-3 mr-1" />
                          {bookingData.category.estimatedDuration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Phase 3: Sub-Service Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <FaWrench className="inline h-4 w-4 mr-2 text-orange-500" />
                        What specific service do you need?
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        {getSubServices(bookingData.category.id).map((subService) => (
                          <div key={subService.id} className="relative">
                            <input
                              type="radio"
                              id={`subservice-${subService.id}`}
                              name="subService"
                              value={subService.id}
                              checked={bookingData.selectedSubService?.id === subService.id}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setBookingData(prev => ({ ...prev, selectedSubService: subService }))
                                }
                              }}
                              className="sr-only"
                            />
                            <label
                              htmlFor={`subservice-${subService.id}`}
                              className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                bookingData.selectedSubService?.id === subService.id
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 bg-white hover:border-orange-300'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{subService.name}</div>
                                <div className="text-sm text-gray-600 mt-1">{subService.description}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Duration: {subService.estimatedDuration}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="font-bold text-orange-600">
                                  KES {subService.priceRange.min.toLocaleString()} - {subService.priceRange.max.toLocaleString()}
                                </div>
                                {subService.sizeBased && (
                                  <div className="text-xs text-gray-500">Price varies by size</div>
                                )}
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Select the specific service that matches your needs</p>
                      {errors.subService && <div className="text-red-500 text-sm mt-2">{errors.subService}</div>}
                    </div>

                    {/* Phase 2: Property Size Selection - Show only if sub-service is size-based */}
                    {bookingData.selectedSubService?.sizeBased && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          <FaHammer className="inline h-4 w-4 mr-2 text-orange-500" />
                          What size is your property/project?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { id: 'small', name: 'Small', description: '1-2 bedrooms / Simple project' },
                            { id: 'medium', name: 'Medium', description: '3-4 bedrooms / Standard project' },
                            { id: 'large', name: 'Large', description: '5+ bedrooms / Complex project' }
                          ].map((size) => (
                            <div key={size.id} className="relative">
                              <input
                                type="radio"
                                id={`size-${size.id}`}
                                name="propertySize"
                                value={size.id}
                                checked={bookingData.propertySize === size.id}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setBookingData(prev => ({ ...prev, propertySize: size.id as 'small' | 'medium' | 'large' }))
                                  }
                                }}
                                className="sr-only"
                              />
                              <label
                                htmlFor={`size-${size.id}`}
                                className={`block p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${
                                  bookingData.propertySize === size.id
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 bg-white hover:border-orange-300'
                                }`}
                              >
                                <div className="font-semibold text-gray-900">{size.name}</div>
                                <div className="text-sm text-gray-600 mt-1">{size.description}</div>
                                {bookingData.selectedSubService?.sizeMultipliers && (
                                  <div className="text-xs text-orange-600 mt-2">
                                    {bookingData.selectedSubService.sizeMultipliers[size.id] !== 1.0 && 
                                      `${((bookingData.selectedSubService.sizeMultipliers[size.id] - 1) * 100).toFixed(0)}% ${bookingData.selectedSubService.sizeMultipliers[size.id] > 1 ? 'premium' : 'discount'}`
                                    }
                                  </div>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Property size affects the final price</p>
                      </div>
                    )}

                    {/* Phase 3: Live Price Calculator */}
                    {bookingData.selectedSubService && bookingData.priceBreakdown && (
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                          <FaDollarSign className="h-4 w-4 text-orange-500 mr-2" />
                          💰 Estimated Price
                        </h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600">Selected Service:</div>
                            <div className="font-medium text-gray-900">{bookingData.selectedSubService.name}</div>
                            {bookingData.urgency !== 'normal' && (
                              <div className="text-xs text-orange-600 mt-1">
                                {bookingData.urgency === 'urgent' ? '⚡ +50% for urgent service' : '🚨 +100% for emergency service'}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">
                              KES {bookingData.priceBreakdown.calculations.finalTotal.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {bookingData.providersNeeded > 1 && `×${bookingData.providersNeeded} professionals`}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-orange-200">
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Base price:</span>
                              <span>KES {bookingData.priceBreakdown.basePrice.toLocaleString()}</span>
                            </div>
                            {bookingData.location.area && LOCATION_MULTIPLIERS[bookingData.location.area] !== 1.0 && (
                              <div className="flex justify-between">
                                <span>Area adjustment ({bookingData.location.area}):</span>
                                <span>{LOCATION_MULTIPLIERS[bookingData.location.area] > 1.0 ? '+' : ''}{((LOCATION_MULTIPLIERS[bookingData.location.area] - 1) * 100).toFixed(0)}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaCalendarAlt className="inline h-4 w-4 mr-2 text-orange-500" />
                          When do you need this service?
                        </label>
                        <input
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-orange-50 bg-white text-gray-900 font-medium text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1">Select your preferred service date</p>
                        {errors.date && <div className="text-red-500 text-sm mt-1">{errors.date}</div>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaClock className="inline h-4 w-4 mr-2 text-orange-500" />
                          What time works best for you?
                        </label>
                        <select
                          value={bookingData.time}
                          onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-orange-50 bg-white text-gray-900 font-medium text-base"
                        >
                          <option value="" className="text-gray-500">Choose your preferred time</option>
                          <option value="08:00" className="text-gray-900 font-medium">8:00 AM - Morning</option>
                          <option value="09:00" className="text-gray-900 font-medium">9:00 AM - Morning</option>
                          <option value="10:00" className="text-gray-900 font-medium">10:00 AM - Morning</option>
                          <option value="11:00" className="text-gray-900 font-medium">11:00 AM - Late Morning</option>
                          <option value="12:00" className="text-gray-900 font-medium">12:00 PM - Midday</option>
                          <option value="13:00" className="text-gray-900 font-medium">1:00 PM - Afternoon</option>
                          <option value="14:00" className="text-gray-900 font-medium">2:00 PM - Afternoon</option>
                          <option value="15:00" className="text-gray-900 font-medium">3:00 PM - Afternoon</option>
                          <option value="16:00" className="text-gray-900 font-medium">4:00 PM - Late Afternoon</option>
                          <option value="17:00" className="text-gray-900 font-medium">5:00 PM - Evening</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Select the time that works best for your schedule</p>
                        {errors.time && <div className="text-red-500 text-sm mt-1">{errors.time}</div>}
                      </div>
                    </div>

                    {/* Providers Needed and Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaUsers className="inline h-4 w-4 mr-2 text-orange-500" />
                          How many professionals do you need?
                        </label>
                        <select
                          value={bookingData.providersNeeded}
                          onChange={(e) => setBookingData(prev => ({ ...prev, providersNeeded: parseInt(e.target.value) }))}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium text-base"
                        >
                          <option value={1} className="text-gray-900 font-medium">1 Professional - Standard job</option>
                          <option value={2} className="text-gray-900 font-medium">2 Professionals - Medium job</option>
                          <option value={3} className="text-gray-900 font-medium">3 Professionals - Large job</option>
                          <option value={4} className="text-gray-900 font-medium">4+ Professionals - Extra large job</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">More professionals can complete the job faster</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaClock className="inline h-4 w-4 mr-2 text-orange-500" />
                          How long will this job take?
                        </label>
                        <input
                          type="number"
                          value={bookingData.duration}
                          onChange={(e) => setBookingData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                          min="1"
                          max="12"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium text-base placeholder:text-gray-500 placeholder:font-normal"
                          placeholder="Enter hours needed (e.g., 2)"
                        />
                        <p className="text-xs text-gray-500 mt-1">Estimate: {bookingData.category?.estimatedDuration || '2-4 hours typical'}</p>
                        {errors.duration && <div className="text-red-500 text-sm mt-1">{errors.duration}</div>}
                      </div>
                    </div>

                    {/* Service Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FaFileAlt className="inline h-4 w-4 mr-2 text-orange-500" />
                        Tell us more about your specific needs <span className="text-gray-500 font-normal">(Optional)</span>
                      </label>
                      <textarea
                        value={bookingData.description}
                        onChange={(e) => setBookingData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder={`Optional: Describe what you need done for ${bookingData.category?.name?.toLowerCase()} service...

Examples:
- Specific repairs needed
- Areas to be cleaned/fixed
- Materials you have/need
- Any special requirements
- Access details (stairs, parking, etc.)`}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium text-base placeholder:text-gray-500 placeholder:font-normal"
                      />
                      <p className="text-xs text-gray-500 mt-1">Adding details helps us match you with the right professional, but you can book without them</p>
                    </div>

                    {/* Urgency Level */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <FaExclamationTriangle className="inline h-4 w-4 mr-2 text-orange-500" />
                        How urgent is this service?
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { 
                            value: 'normal', 
                            label: '🕐 Normal Priority', 
                            desc: 'Within 24-48 hours', 
                            detail: 'Standard scheduling',
                            color: 'bg-green-50 border-green-200 text-green-700' 
                          },
                          { 
                            value: 'urgent', 
                            label: '⚡ Urgent Priority', 
                            desc: 'Within 2-6 hours', 
                            detail: 'Same day service',
                            color: 'bg-yellow-50 border-yellow-200 text-yellow-700' 
                          },
                          { 
                            value: 'emergency', 
                            label: '🚨 Emergency Priority', 
                            desc: 'Within 1 hour', 
                            detail: 'Immediate response',
                            color: 'bg-red-50 border-red-200 text-red-700' 
                          }
                        ].map((urgency) => (
                          <button
                            key={urgency.value}
                            onClick={() => setBookingData(prev => ({ ...prev, urgency: urgency.value as any }))}
                            className={`p-4 rounded-lg border-2 text-center transition-all ${
                              bookingData.urgency === urgency.value
                                ? urgency.color + ' ring-2 ring-orange-200'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="font-semibold text-sm mb-1">{urgency.label}</div>
                            <div className="text-xs mb-1">{urgency.desc}</div>
                            <div className="text-xs opacity-75">{urgency.detail}</div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Emergency services may have additional charges</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleStepBack}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <FaArrowLeft className="inline h-4 w-4 mr-2" />
                    Back
                  </button>
                  <button
                    onClick={handleStepForward}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Continue
                    <FaArrowRight className="inline h-4 w-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Location */}
            {currentStep === 'location' && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">📍 Where do you need the service?</h3>
                  <p className="text-gray-600 mb-6">Provide your location so we can match you with nearby professionals</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Forms */}
                    <div className="space-y-6">
                      {/* Quick Location Options */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          <FaMapMarkerAlt className="inline h-4 w-4 mr-2 text-orange-500" />
                          Quick Location Setup
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={() => handleGetCurrentLocation()}
                            className="flex items-center justify-center px-4 py-3 border-2 border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold text-blue-700"
                          >
                            <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                            📍 Use My Current Location
                          </button>
                          <button
                            onClick={() => handleSearchAddress()}
                            className="flex items-center justify-center px-4 py-3 border-2 border-green-300 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold text-green-700"
                          >
                            <FaSearch className="h-4 w-4 mr-2" />
                            ✏️ Type Address Manually
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Choose the easiest way to share your location</p>
                      </div>

                      {/* Search Location (simplified) */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaSearch className="inline h-4 w-4 mr-2 text-orange-500" />
                          Enter Your Full Address
                        </label>
                        <div className="relative">
                          <input
                            ref={addressSearchRef}
                            type="text"
                            placeholder="Type your complete address here (e.g., 123 Westlands Road, Nairobi)..."
                            value={bookingData.location.address}
                            onChange={(e) => setBookingData(prev => ({ 
                              ...prev, 
                              location: { ...prev.location, address: e.target.value } 
                            }))}
                            className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium text-base placeholder:text-gray-500 placeholder:font-normal"
                          />
                          <FaSearch className="absolute right-3 top-4 h-4 w-4 text-gray-400" />
                        </div>
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          💡 <strong>Coming Soon:</strong> Google Maps autocomplete will make address entry even easier!
                        </div>
                      </div>

                      {/* Service Area */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaMapMarkerAlt className="inline h-4 w-4 mr-2 text-orange-500" />
                          Which area of Nairobi are you in?
                        </label>
                        <select
                          value={bookingData.location.area}
                          onChange={(e) => setBookingData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, area: e.target.value } 
                          }))}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium text-base"
                        >
                          <option value="" className="text-gray-500">🏙️ Choose your area/neighborhood</option>
                          {serviceAreas.map(area => (
                            <option key={area} value={area} className="text-gray-900 font-medium">📍 {area}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">This helps us find professionals closest to you</p>
                        {errors.area && <div className="text-red-500 text-sm mt-1">{errors.area}</div>}
                      </div>

                      {/* Address Details */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaFileAlt className="inline h-4 w-4 mr-2 text-orange-500" />
                          Additional Location Details <span className="text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <textarea
                          value={bookingData.location.address}
                          onChange={(e) => setBookingData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, address: e.target.value } 
                          }))}
                          placeholder="Optional: Provide more details to help our professionals find you:

🏢 Building name or house number
🚪 Apartment/office number  
🛣️ Nearest landmark or street
🅿️ Parking instructions
🚶 Gate access or security info
📋 Any special directions"
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium text-base placeholder:text-gray-500 placeholder:font-normal"
                        />
                        <p className="text-xs text-gray-500 mt-1">Adding details helps professionals find you, but your area selection is sufficient to book</p>
                      </div>

                      {/* Location Status */}
                      {locationSharing.location && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <FaCheck className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-green-900">Location Detected</h4>
                              <p className="text-sm text-green-700 mt-1">
                                Coordinates: {locationSharing.location.latitude?.toFixed(6)}, {locationSharing.location.longitude?.toFixed(6)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Location Preview */}
                    <div className="lg:sticky lg:top-6">
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900">Location Summary</h4>
                        </div>
                        <div className="p-4 bg-gray-50 min-h-[200px] lg:min-h-[320px] flex flex-col justify-center items-center">
                          {locationSharing.location ? (
                            <div className="text-center">
                              <FaMapMarkerAlt className="h-12 w-12 mx-auto mb-3 text-green-600" />
                              <h5 className="font-medium text-green-900 mb-2">GPS Location Detected</h5>
                              <p className="text-sm text-gray-600 mb-2">
                                Latitude: {locationSharing.location.latitude?.toFixed(6)}
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                Longitude: {locationSharing.location.longitude?.toFixed(6)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Accuracy: ±{locationSharing.location.accuracy || 'Unknown'}m
                              </p>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500">
                              <FaMapMarkerAlt className="h-8 w-8 mx-auto mb-2" />
                              <p className="font-medium">No location set</p>
                              <p className="text-sm">Use GPS or enter address manually</p>
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-700">
                                  📍 Google Maps integration coming soon!
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Sharing Component */}
                  {locationSharing.active && (
                    <div className="mt-6">
                      <LocationSharing
                        onLocationUpdate={handleLocationUpdate}
                        onLocationError={(error) => setLocationSharing(prev => ({ ...prev, error }))}
                        isActive={locationSharing.active}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleStepBack}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <FaArrowLeft className="inline h-4 w-4 mr-2" />
                    Back
                  </button>
                  <button
                    onClick={handleStepForward}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Find Providers
                    <FaArrowRight className="inline h-4 w-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Provider Selection */}
            {currentStep === 'providers' && (
              <motion.div
                key="providers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">👥 Choose Your Professional</h3>
                    <p className="text-gray-600">Select {bookingData.providersNeeded} qualified {bookingData.category?.name.toLowerCase()} professional{bookingData.providersNeeded > 1 ? 's' : ''} for your job</p>
                    <div className="mt-2 flex items-center justify-center space-x-4 text-sm">
                      <span className="flex items-center text-green-600">
                        <FaCheck className="h-3 w-3 mr-1" />
                        Background verified
                      </span>
                      <span className="flex items-center text-blue-600">
                        <FaStar className="h-3 w-3 mr-1" />
                        Rated professionals
                      </span>
                      <span className="flex items-center text-orange-600">
                        <FaDollarSign className="h-3 w-3 mr-1" />
                        Fixed pricing
                      </span>
                    </div>
                  </div>
                  
                  {providerMatching.loading ? (
                    <div className="text-center py-12">
                      <FaSpinner className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-spin" />
                      <h4 className="text-lg font-bold text-gray-900 mb-2">🔍 Finding Perfect Matches...</h4>
                      <p className="text-gray-600 mb-2">
                        Searching for <strong>{bookingData.providersNeeded}</strong> qualified <strong>{bookingData.category?.name.toLowerCase()}</strong> professional{bookingData.providersNeeded > 1 ? 's' : ''}
                      </p>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>📍 Location: <strong>{bookingData.location.area}</strong></p>
                        <p>📅 Date: <strong>{bookingData.date}</strong> at <strong>{bookingData.time}</strong></p>
                        <p>⏱️ Duration: <strong>{bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''}</strong></p>
                      </div>
                    </div>
                  ) : providerMatching.error ? (
                    <div className="text-center py-12">
                      <FaExclamationTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 mb-2">😔 No Professionals Available</h4>
                      <p className="text-gray-600 mb-4">{providerMatching.error}</p>
                      <div className="bg-blue-50 rounded-lg p-4 mb-4 text-left max-w-md mx-auto">
                        <h5 className="font-semibold text-blue-900 mb-2">💡 Suggestions to find professionals:</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>✅ Try a different time slot (morning/afternoon)</li>
                          <li>✅ Consider nearby areas ({serviceAreas.filter(area => area !== bookingData.location.area).slice(0, 2).join(', ')})</li>
                          <li>✅ Book for tomorrow or next week</li>
                          <li>✅ Reduce number of professionals needed</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => setCurrentStep('location')}
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                      >
                        🔄 Modify Search Criteria
                      </button>
                    </div>
                  ) : providerMatching.providers.length > 0 ? (
                    <div className="space-y-6">
                      <div className="text-sm text-gray-600 mb-4">
                        Found {providerMatching.totalFound} provider(s) matching your criteria. 
                        Showing the best {Math.min(providerMatching.providers.length, bookingData.providersNeeded * 2)} matches.
                      </div>

                      {providerMatching.providers.map((provider, index) => (
                        <div key={provider._id} className="border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
                          <div className="flex items-start space-x-4">
                            {/* Provider Avatar */}
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              {provider.profilePicture ? (
                                <img 
                                  src={provider.profilePicture} 
                                  alt={provider.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to generated avatar if image fails to load
                                    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&size=200&background=6b7280&color=ffffff&bold=true&format=png`;
                                    (e.target as HTMLImageElement).src = fallback;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-orange-100">
                                  <FaUser className="h-6 w-6 text-orange-600" />
                                </div>
                              )}
                            </div>

                            {/* Provider Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{provider.name}</h4>
                                  <p className="text-gray-600 mb-2">
                                    {provider.providerProfile?.experience || "Experienced Professional"}
                                  </p>
                                  
                                  {/* Skills */}
                                  <div className="flex items-center space-x-4 mb-3">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                                      <span className="text-sm font-medium text-gray-700">
                                        Available Provider
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <FaStar className="h-4 w-4 text-yellow-400 mr-1" />
                                      <span className="text-sm font-medium text-gray-700">
                                        {provider.providerProfile?.rating || "4.5"}
                                      </span>
                                      <span className="text-sm text-gray-500 ml-1">
                                        ({provider.providerProfile?.reviewCount || "5"} reviews)
                                      </span>
                                    </div>
                                  </div>

                                  {/* Provider Skills */}
                                  {provider.providerProfile?.skills?.length > 0 || provider.skills?.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {(provider.providerProfile?.skills || provider.skills || []).slice(0, 3).map((skill: string, idx: number) => (
                                        <span key={idx} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                          {skill}
                                        </span>
                                      ))}
                                      {(provider.providerProfile?.skills || provider.skills || []).length > 3 && (
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                          +{(provider.providerProfile?.skills || provider.skills || []).length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  ) : null}

                                  {/* Availability & Response Time */}
                                  <div className="text-sm text-gray-600">
                                    <div className="flex items-center space-x-4">
                                      <span className="flex items-center">
                                        <FaClock className="h-3 w-3 mr-1" />
                                        Response: {provider.providerProfile?.responseTime || "Within 1 hour"}
                                      </span>
                                      <span className="flex items-center">
                                        <FaMapMarkerAlt className="h-3 w-3 mr-1" />
                                        {bookingData.location.area}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Price & Book Button */}
                                <div className="text-right">
                                  <div className="text-lg font-bold text-orange-600 mb-1">
                                    {bookingData.priceBreakdown ? 
                                      `KES ${Math.round(bookingData.priceBreakdown.calculations.finalTotal / bookingData.providersNeeded).toLocaleString()}` :
                                      'Price TBD'
                                    }
                                  </div>
                                  <div className="text-sm text-gray-500 mb-3">
                                    Per professional
                                  </div>
                                  <button
                                    onClick={() => handleProviderSelection(provider)}
                                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                                      selectedProviders.find(p => p._id === provider._id)
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : selectedProviders.length >= bookingData.providersNeeded
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-orange-600 text-white hover:bg-orange-700'
                                    }`}
                                    disabled={
                                      selectedProviders.length >= bookingData.providersNeeded && 
                                      !selectedProviders.find(p => p._id === provider._id)
                                    }
                                  >
                                    {selectedProviders.find(p => p._id === provider._id) ? 'Selected' : 'Select Provider'}
                                  </button>
                                </div>
                              </div>

                              {/* Availability Notes */}
                              {provider.providerProfile?.notes && (
                                <div className="mt-3 text-xs text-gray-500">
                                  <span className="font-medium">Notes: </span>
                                  {provider.providerProfile.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Selection Summary */}
                      {selectedProviders.length > 0 && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                            <FaCheck className="h-4 w-4 text-green-600 mr-2" />
                            ✅ Selected Professionals ({selectedProviders.length}/{bookingData.providersNeeded})
                          </h4>
                          <div className="space-y-3">
                            {selectedProviders.map((provider: any) => (
                              <div key={provider._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                    {provider.profilePicture ? (
                                      <img 
                                        src={provider.profilePicture} 
                                        alt={provider.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&size=64&background=6b7280&color=ffffff&bold=true&format=png`;
                                          (e.target as HTMLImageElement).src = fallback;
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-orange-100">
                                        <FaUser className="h-3 w-3 text-orange-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-900">{provider.name}</span>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      <span className="flex items-center">
                                        <FaStar className="h-3 w-3 text-yellow-400 mr-1" />
                                        {provider.rating || 4.5}
                                      </span>
                                      <span>•</span>
                                      <span>{provider.completedJobs || 0} jobs</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-orange-600">
                                    {bookingData.priceBreakdown ? 
                                      `KES ${Math.round(bookingData.priceBreakdown.calculations.finalTotal / bookingData.providersNeeded).toLocaleString()}` :
                                      'Price TBD'
                                    }
                                  </div>
                                  <div className="text-xs text-gray-500">per professional</div>
                                </div>
                              </div>
                            ))}
                            <div className="pt-3 border-t-2 border-green-200">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900">💰 Total Service Cost:</span>
                                <span className="text-xl font-bold text-green-600">
                                  KES {bookingData.priceBreakdown ? 
                                    bookingData.priceBreakdown.calculations.finalTotal.toLocaleString() :
                                    (selectedProviders.length * getServicePrice(bookingData.category?.id || 'electrical')).toLocaleString()
                                  }
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Dynamic pricing • No hidden fees • Payment protected</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaUsers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Providers Available</h4>
                      <p className="text-gray-600 mb-4">
                        No providers found matching your criteria. Please try adjusting your search.
                      </p>
                      <button
                        onClick={() => setCurrentStep('location')}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Modify Search
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleStepBack}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <FaArrowLeft className="inline h-4 w-4 mr-2" />
                    Back
                  </button>
                  <button
                    onClick={handleStepForward}
                    disabled={selectedProviders.length !== bookingData.providersNeeded || providerMatching.loading}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedProviders.length === bookingData.providersNeeded 
                      ? 'Proceed to Payment' 
                      : `Select ${bookingData.providersNeeded - selectedProviders.length} more provider(s)`}
                    <FaArrowRight className="inline h-4 w-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Payment */}
            {currentStep === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="space-y-6">
                  {/* Booking Summary */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">📋 Your Booking Summary</h3>
                      <p className="text-gray-600">Review your details before confirming</p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Service Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between md:block">
                          <span className="text-gray-600 text-sm">🔧 Service Type:</span>
                          <span className="font-semibold text-gray-900">{bookingData.category?.name} Service</span>
                        </div>
                        {bookingData.selectedSubService && (
                          <div className="flex justify-between md:block">
                            <span className="text-gray-600 text-sm">🛠️ Specific Service:</span>
                            <span className="font-semibold text-gray-900">{bookingData.selectedSubService.name}</span>
                          </div>
                        )}
                        {bookingData.selectedSubService?.sizeBased && (
                          <div className="flex justify-between md:block">
                            <span className="text-gray-600 text-sm">🏠 Property Size:</span>
                            <span className="font-semibold text-gray-900 capitalize">{bookingData.propertySize}</span>
                          </div>
                        )}
                        <div className="flex justify-between md:block">
                          <span className="text-gray-600 text-sm">📅 Date & Time:</span>
                          <span className="font-semibold text-gray-900">{bookingData.date} at {bookingData.time}</span>
                        </div>
                        <div className="flex justify-between md:block">
                          <span className="text-gray-600 text-sm">⏱️ Duration:</span>
                          <span className="font-semibold text-gray-900">{bookingData.duration} hour{bookingData.duration > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between md:block">
                          <span className="text-gray-600 text-sm">📍 Location:</span>
                          <span className="font-semibold text-gray-900">{bookingData.location.area}</span>
                        </div>
                        <div className="flex justify-between md:block">
                          <span className="text-gray-600 text-sm">⚡ Priority:</span>
                          <span className={`font-semibold capitalize ${
                            bookingData.urgency === 'emergency' ? 'text-red-600' :
                            bookingData.urgency === 'urgent' ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {bookingData.urgency === 'emergency' ? '🚨 Emergency' : 
                             bookingData.urgency === 'urgent' ? '⚡ Urgent' : '🕐 Normal'}
                          </span>
                        </div>
                        <div className="flex justify-between md:block">
                          <span className="text-gray-600 text-sm">👥 Professionals:</span>
                          <span className="font-semibold text-gray-900">{bookingData.providersNeeded} professional{bookingData.providersNeeded > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* Phase 2: Detailed Price Breakdown */}
                      {bookingData.priceBreakdown && (
                        <div className="pt-4 border-t border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                            <FaDollarSign className="h-4 w-4 text-orange-500 mr-2" />
                            💰 Price Breakdown:
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Service:</span>
                              <span className="font-medium">{bookingData.priceBreakdown.serviceName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Base Price:</span>
                              <span className="font-medium">KES {bookingData.priceBreakdown.basePrice.toLocaleString()}</span>
                            </div>
                            {bookingData.priceBreakdown.sizeMultiplier && bookingData.priceBreakdown.sizeMultiplier !== 1.0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Size Adjustment ({bookingData.propertySize}):</span>
                                <span className="font-medium">
                                  {bookingData.priceBreakdown.sizeMultiplier > 1.0 ? '+' : ''}
                                  {((bookingData.priceBreakdown.sizeMultiplier - 1) * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                            {bookingData.priceBreakdown && bookingData.priceBreakdown.urgencyMultiplier !== 1.0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Urgency ({bookingData.urgency}):</span>
                                <span className="font-medium">
                                  +{((bookingData.priceBreakdown.urgencyMultiplier - 1) * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                            {bookingData.priceBreakdown && bookingData.priceBreakdown.locationMultiplier !== 1.0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Area ({bookingData.location.area}):</span>
                                <span className="font-medium">
                                  {bookingData.priceBreakdown.locationMultiplier > 1.0 ? '+' : ''}
                                  {((bookingData.priceBreakdown.locationMultiplier - 1) * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                            {bookingData.priceBreakdown && bookingData.priceBreakdown.providersNeeded > 1 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Multiple Professionals (×{bookingData.priceBreakdown.providersNeeded}):</span>
                                <span className="font-medium">×{bookingData.priceBreakdown.providersNeeded}</span>
                              </div>
                            )}
                            <div className="border-t border-gray-300 pt-2 mt-3">
                              <div className="flex justify-between text-lg font-bold">
                                <span className="text-gray-900">Total Amount:</span>
                                <span className="text-orange-600">KES {bookingData.priceBreakdown.calculations.finalTotal.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Selected Providers */}
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                          <FaUsers className="h-4 w-4 text-orange-500 mr-2" />
                          👥 Your Selected Professionals:
                        </h4>
                        <div className="space-y-3">
                          {selectedProviders.map((provider: any) => (
                            <div key={provider._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                  {provider.profilePicture ? (
                                    <img 
                                      src={provider.profilePicture} 
                                      alt={provider.name} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&size=80&background=6b7280&color=ffffff&bold=true&format=png`;
                                        (e.target as HTMLImageElement).src = fallback;
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-orange-100">
                                      <FaUser className="h-4 w-4 text-orange-600" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{provider.name}</div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <span className="flex items-center">
                                      <FaStar className="h-3 w-3 text-yellow-400 mr-1" />
                                      {provider.rating || 4.5} rating
                                    </span>
                                    <span>•</span>
                                    <span>{provider.completedJobs || 0} jobs completed</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-orange-600">
                                  {bookingData.priceBreakdown ? 
                                    `KES ${Math.round(bookingData.priceBreakdown.calculations.finalTotal / bookingData.providersNeeded).toLocaleString()}` :
                                    'Price TBD'
                                  }
                                </div>
                                <div className="text-xs text-gray-500">per professional</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total Cost */}
                      <div className="pt-4 border-t-2 border-gray-200">
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">💰 Total Service Cost:</span>
                            <span className="text-2xl font-bold text-orange-600">
                              KES {bookingData.priceBreakdown ? 
                                bookingData.priceBreakdown.calculations.finalTotal.toLocaleString() :
                                (selectedProviders.length * getServicePrice(bookingData.category?.id || 'electrical')).toLocaleString()
                              }
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                            <span>✅ Transparent pricing - No surprises</span>
                            <span>🔒 Payment held securely until completion</span>
                          </div>
                          
                          {/* Detailed Price Breakdown */}
                          {bookingData.priceBreakdown && (
                            <div className="mt-4 pt-3 border-t border-orange-200">
                              <div className="text-sm space-y-2">
                                <div className="font-medium text-gray-700 mb-2">💹 Price Breakdown:</div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Base service ({bookingData.priceBreakdown.serviceName}):</span>
                                  <span>KES {bookingData.priceBreakdown.calculations.baseService.toLocaleString()}</span>
                                </div>
                                {bookingData.priceBreakdown.sizeMultiplier && bookingData.priceBreakdown.sizeMultiplier !== 1.0 && (
                                  <div className="flex justify-between text-gray-600">
                                    <span>Size adjustment ({bookingData.propertySize}):</span>
                                    <span>×{bookingData.priceBreakdown.sizeMultiplier}</span>
                                  </div>
                                )}
                                {bookingData.priceBreakdown && bookingData.priceBreakdown.urgencyMultiplier !== 1.0 && (
                                  <div className="flex justify-between text-gray-600">
                                    <span>Urgency ({bookingData.urgency}):</span>
                                    <span>×{bookingData.priceBreakdown.urgencyMultiplier}</span>
                                  </div>
                                )}
                                {bookingData.location.area && bookingData.priceBreakdown && LOCATION_MULTIPLIERS[bookingData.location.area] !== 1.0 && (
                                  <div className="flex justify-between text-gray-600">
                                    <span>Location ({bookingData.location.area}):</span>
                                    <span>×{bookingData.priceBreakdown.locationMultiplier}</span>
                                  </div>
                                )}
                                {bookingData.providersNeeded > 1 && (
                                  <div className="flex justify-between text-gray-600">
                                    <span>Professionals needed:</span>
                                    <span>×{bookingData.providersNeeded}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Sharing */}
                  <LocationSharing
                    onLocationUpdate={handleLocationUpdate}
                    onLocationError={handleLocationError}
                    isActive={currentStep === 'payment'}
                    className="mb-6"
                  />

                  {/* Payment Options */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">💳 Payment & Timing Options</h3>
                      <p className="text-gray-600">Choose when and how you'd like to pay for your service</p>
                    </div>
                    
                    {/* Payment Timing Selection */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">When would you like to pay?</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => setBookingData(prev => ({ ...prev, paymentTiming: 'pay-now' }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            bookingData.paymentTiming === 'pay-now'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">💳</div>
                            <h5 className="font-bold text-gray-900">Pay Now</h5>
                            <p className="text-sm text-gray-600">Secure your booking immediately</p>
                            <div className="mt-2 text-xs text-green-600 font-medium">Most Popular</div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => setBookingData(prev => ({ ...prev, paymentTiming: 'pay-after' }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            bookingData.paymentTiming === 'pay-after'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">🤝</div>
                            <h5 className="font-bold text-gray-900">Pay After Service</h5>
                            <p className="text-sm text-gray-600">Pay once service is completed</p>
                            <div className="mt-2 text-xs text-blue-600 font-medium">Flexible Option</div>
                          </div>
                        </button>
                      </div>
                      {errors.paymentTiming && (
                        <p className="mt-2 text-sm text-red-600">{errors.paymentTiming}</p>
                      )}
                    </div>

                    {/* Payment Method Selection - Only show if payment timing is selected */}
                    {bookingData.paymentTiming && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          {bookingData.paymentTiming === 'pay-now' ? 'Pay Now With:' : 'Payment Method for Later:'}
                        </h4>
                        <div className="space-y-3">
                          <button
                            onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'mobile-money' }))}
                            className={`w-full py-4 rounded-lg border-2 transition-all flex items-center justify-center ${
                              bookingData.paymentMethod === 'mobile-money'
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <span className="mr-3 text-2xl">📱</span>
                            <div className="text-left">
                              <div className="font-bold text-gray-900">M-Pesa Mobile Money</div>
                              <div className="text-sm text-gray-600">Instant STK Push • Most Popular</div>
                            </div>
                            {bookingData.paymentTiming === 'pay-now' && (
                              <span className="ml-auto bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                Instant
                              </span>
                            )}
                          </button>
                          
                          <button
                            onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'card' }))}
                            className={`w-full py-4 rounded-lg border-2 transition-all flex items-center justify-center ${
                              bookingData.paymentMethod === 'card'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <span className="mr-3 text-2xl">💳</span>
                            <div className="text-left">
                              <div className="font-bold text-gray-900">Debit/Credit Card</div>
                              <div className="text-sm text-gray-600">Visa, Mastercard accepted</div>
                            </div>
                            {bookingData.paymentTiming === 'pay-now' && (
                              <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                Secure
                              </span>
                            )}
                          </button>
                        </div>
                        {errors.paymentMethod && (
                          <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>
                        )}
                      </div>
                    )}

                    {/* Payment Security Features */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-900 mb-3">🛡️ Payment Security & Protection</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <FaCheck className="h-4 w-4 text-green-600" />
                          <span>256-bit SSL Encryption</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaDollarSign className="h-4 w-4 text-blue-600" />
                          <span>Paystack Secure Gateway</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaExclamationTriangle className="h-4 w-4 text-orange-600" />
                          <span>Full Buyer Protection</span>
                        </div>
                      </div>
                      
                      {bookingData.paymentTiming === 'pay-after' && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800">
                            <strong>Pay After Service:</strong> You'll receive a secure payment link once the provider marks your service as completed. No payment required now.
                          </p>
                        </div>
                      )}
                      
                      {bookingData.paymentTiming === 'pay-now' && bookingData.paymentMethod === 'mobile-money' && (
                        <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                          <p className="text-sm text-green-800">
                            <strong>STK Push:</strong> You'll receive a payment prompt on your phone to complete the transaction securely.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms and Confirmation */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-start space-x-3">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
                        id="terms-agreement"
                      />
                      <div className="text-sm text-gray-700">
                        <label htmlFor="terms-agreement" className="font-medium cursor-pointer">
                          ✅ I agree to the booking terms and conditions
                        </label>
                        <div className="mt-2 space-y-1 text-xs">
                          <p>📋 By confirming this booking, you agree to:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Our <strong>Terms of Service</strong> and <strong>Privacy Policy</strong></li>
                            <li>Share your location with selected professionals for service delivery</li>
                            <li>Fixed pricing with no hidden fees</li>
                            <li>Payment protection through our secure escrow system</li>
                            <li>Professional background verification standards</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={handleStepBack}
                      className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors font-semibold flex items-center"
                    >
                      <FaArrowLeft className="h-4 w-4 mr-2" />
                      ← Back to Providers
                    </button>
                    <button
                      onClick={() => {
                        if (!validatePaymentStep()) {
                          return
                        }
                        
                        if (bookingData.paymentTiming === 'pay-now') {
                          // For pay-now, create booking first then handle payment
                          handleBookingConfirmation()
                        } else {
                          // Pay after service - confirm booking without payment
                          handleBookingConfirmation()
                        }
                      }}
                      disabled={loading}
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 flex items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCheck className="h-5 w-5 mr-2" />
                          {bookingData.paymentTiming === 'pay-now' 
                            ? '💳 Confirm & Pay Now' 
                            : '📝 Confirm Booking'
                          }
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </RoleGuard>
  )
}

// Loading component for Suspense fallback
function BookServicePageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading booking form...</p>
      </div>
    </div>
  )
}

// Main export component with Suspense boundary
export default function BookServicePage() {
  return (
    <Suspense fallback={<BookServicePageLoading />}>
      <BookServicePageContent />
    </Suspense>
  )
}